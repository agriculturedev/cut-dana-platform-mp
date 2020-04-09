import WMSGetFeatureInfo from "ol/format/WMSGetFeatureInfo.js";
import * as moment from "moment";

const Theme = Backbone.Model.extend(/** @lends ThemeModel.prototype */{
    /**
     * @class ThemeModel
     * @extends Tools.GFI
     * @memberof Tools.GFI.Themes
     * @constructs
     * @property {Boolean} isVisible=false the theme is visible
     * @property {String} name=undefined Layer name = Theme Title
     * @property {Boolean} isReady= Theme has queried and edited GFI attributes
     * @property {*} infoFormat=undefined Info Format for WMS-GFI
     * @property {*} gfiContent=undefined GFI-Attributs
     * @property {String} uiStyle="default" uiStyle Setting
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core#RadioRequestUtilGetProxyURL
     * @fires Core#RadioRequestUtilGetIgnoredKeys
     * @fires Core#RadioRequestUtilGetUiStyle
     */
    defaults: {
        isVisible: false,
        name: undefined,
        isReady: false,
        infoFormat: undefined,
        gfiContent: undefined,
        uiStyle: "default"
    },

    /**
     * Requestor for feature informations on all layer types
     * @returns {void}
     */
    requestFeatureInfos: function () {
        if (this.get("typ") === "WMS" || this.get("typ") === "GROUP") {
            if (this.get("infoFormat") === "text/html") {
                // Für das Bohrdatenportal werden die GFI-Anfragen in einem neuen Fenster geöffnet, gefiltert nach der ID aus dem DM.
                if (this.get("id") === "2407" || this.get("id") === "4423") {
                    this.getWmsHtmlGfi(this.parseWmsBohrdatenGfi);
                }
                else {
                    this.getWmsHtmlGfi(this.parseWmsHtmlGfi);
                }
            }
            else {
                this.getWmsGfi(this.parseWmsGfi);
            }
        }
        else if (this.get("typ") === "Cesium3DTileFeature") {
            this.get3DFeatureGfi();
        }
        else if (this.get("typ") === "Entities3D") {
            this.get3DFeatureGfi();
        }
        else {
            this.getVectorGfi();
        }
    },

    /**
     * Requestor function for GFI of WMS layers with infoFormat "text/html"
     * @fires Core#RadioRequestUtilGetProxyURL
     * @param   {function} successFunction function to be called after successfull request
     * @returns {void}
     */
    getWmsHtmlGfi: function (successFunction) {
        const gfiUrl = this.get("gfiUrl");

        $.ajax({
            url: this.get("useProxyUrlForGfi") === true ? Radio.request("Util", "getProxyURL", gfiUrl) : gfiUrl,
            context: this,
            success: successFunction,
            error: this.gfiErrorHandler
        });
    },

    /**
     * Parse response for Bohrdatenportal
     * @param   {string} data string to be parsed as html
     * @returns {void}
     */
    parseWmsBohrdatenGfi: function (data) {
        const domNodes = $.parseHTML(data);

        try {
            // bei domNodes.length < 3 = nur der xml-header (?xml version='1.0' encoding='UTF-8'?) ohne html
            if (domNodes.length > 3) {
                window.open(this.get("gfiUrl"), "weitere Informationen", "toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=500,width=800,height=700");
            }
            this.setIsReady(true);
        }
        catch {
            this.setIsReady(true);
        }
    },

    /**
     * Parse response for WMS as text/html
     * @param   {string} data response as html
     * @returns {void}
     */
    parseWmsHtmlGfi: function (data) {
        const gfiFeatures = {"html": this.get("gfiUrl")};

        try {
            if ($(data).find("tbody").children().length > 1) {
                this.set("gfiContent", [gfiFeatures]);
            }
            this.setIsReady(true);
        }
        catch {
            this.setIsReady(true);
        }
    },
    /**
     * Requestor function for GFI of WMS layers
     * @fires Core#RadioRequestUtilGetProxyURL
     * @param   {function} successFunction function to be called after successfull request
     * @returns {void}
     */
    getWmsGfi: function (successFunction) {
        let url = this.get("gfiUrl");

        url = url.replace(/SLD_BODY=.*?&/, "");
        $.ajax({
            url: this.get("useProxyUrlForGfi") === true ? Radio.request("Util", "getProxyURL", url) : url,
            method: "GET",
            context: this,
            success: successFunction,
            error: this.gfiErrorHandler
        });
    },

    /**
     * Error handler for unanswered GFI requests
     * @fires Alerting#RadioTriggerAlertAlert
     * @param   {object} jqXHR error object
     * @returns {void}
     */
    gfiErrorHandler: function (jqXHR) {
        this.setIsReady(true);
        console.warn("Error occured requesting GFI with status '" + jqXHR.status + "' and errorMessage '" + jqXHR.statusText + "'");
        Radio.trigger("Alert", "alert", "Nicht alle Informationen zu den ausgewählten Objekten können derzeit abgefragt werden. Bitte versuchen Sie es zu einem späteren Zeitpunkt erneut.");
    },

    /**
     * Returns multiple attribute names in XML features.
     * @param   {xml} node Feature-Node
     * @returns {string[]} Attributnamen
     */
    getMultiTags: function (node) {
        let multiTagsUnique = [],
            tagNameList,
            tagNameListSorted,
            multiTags;

        if (node.hasOwnProperty("firstElementChild") && node.firstElementChild.hasOwnProperty("children")) {
            tagNameList = _.map(node.firstElementChild.children, element => element.tagName);
            tagNameListSorted = _.sortBy(tagNameList, name => name);
            multiTags = tagNameListSorted.filter((tagName, index, list) => tagName === list[index + 1]);
            multiTagsUnique = _.uniq(multiTags);
        }

        return multiTagsUnique;
    },

    /**
     * Replaces the multiTags of a feature with a tag with accumulated value.
     * @param   {string[]} multiTags multiple tags in one feature
     * @param   {xml} childNode Feature-Node
     * @returns {void}
     */
    replaceMultiNodes: function (multiTags, childNode) {
        _.each(multiTags, function (tagName) {
            var nodeList = childNode.getElementsByTagName(tagName),
                nodeListValue = _.map(nodeList, function (node) {
                    return node.innerHTML;
                }),
                firstNode = nodeList[0],
                i;

            firstNode.innerHTML = JSON.stringify({
                multiTag: nodeListValue
            });
            for (i = nodeList.length - 1; i >= 1; i--) {
                childNode.firstElementChild.removeChild(nodeList[i]);
            }
        });
    },

    /**
     * Replace multi attributes of a feature
     * @param   {xml} xml GFI
     * @returns {void}
     */
    parseMultiElementNodes: function (xml) {
        var childNodes = $(xml).find("msGMLOutput,gml\\:featureMember,featureMember");

        _.each(childNodes, function (childNode) {
            var multiTags = this.getMultiTags(childNode);

            this.replaceMultiNodes(multiTags, childNode);
        }, this);

    },

    /**
     * Parse feature info response of a WMS
     * @param {(string|xml)} data response to parse
     * @returns {void}
     */
    parseWmsGfi: function (data) {
        var gfiList = [],
            gfiFormat,
            pgfi = [],
            gfiFeatures,
            dat = _.isString(data) ? $.parseXML(data) : data; // handle non text/xml responses arriving as string

        this.parseMultiElementNodes(dat);
        // parse result, try built-in Ol-format first
        gfiFormat = new WMSGetFeatureInfo();
        // das reverse wird fürs Planportal gebraucht SD 18.01.2016
        gfiFeatures = gfiFormat.readFeatures(dat, {
            dataProjection: Radio.request("MapView", "getProjection")
        }).reverse();

        // ESRI is not parsed by the Ol-format
        if (_.isEmpty(gfiFeatures)) {
            if (dat.getElementsByTagName("FIELDS")[0] !== undefined) {
                _.each(dat.getElementsByTagName("FIELDS"), function (element) {
                    var gfi = {};

                    _.each(element.attributes, function (attribute) {
                        var key = attribute.localName;

                        if (this.isValidValue(attribute.value)) {
                            gfi[key] = attribute.value;
                        }
                        else if (this.isValidValue(attribute.textContent)) {
                            gfi[key] = attribute.textContent;
                        }
                        else {
                            gfi[key] = "";
                        }
                    }, this);

                    gfiList.push(gfi);
                }, this);
            }
        }
        else { // OS (deegree, UMN, Geoserver) is parsed by Ol-format
            _.each(gfiFeatures, function (feature) {
                gfiList.push(feature.getProperties());
            });
        }

        if (gfiList.length > 0) {
            pgfi = this.translateGFI(gfiList, this.get("gfiAttributes"));
            pgfi = this.getManipulateDate(pgfi);
            if (
                this.get("gfiTheme") !== "table"
                &&
                // GFI is not supposed to display multiple nodes, since there can only be one area at a spot.
                // However, sometimes the server returns multiple areas for or one spot, which is not correct
                // and would result in displaying multiple GFI nodes, which is suppressed right here.
                this.get("gfiTheme") !== "flaecheninfo"
            ) {
                this.cloneCollModels(pgfi);
            }
            this.setGfiContent(pgfi);
        }
        this.setIsReady(true);
    },
    /**
     * Clones the models in the collection when a service returns more than one GFI query feature..
     * @param {object} pgfi - pgfi
     * @returns {void}
     */
    cloneCollModels: function (pgfi) {
        var clone;

        _.each(pgfi, function (singlePgfi, index) {
            if (index > 0 && !_.isUndefined(this.collection)) {
                clone = this.clone();

                clone.set("gfiContent", [singlePgfi]);
                clone.set("id", _.uniqueId());
                clone.set("isReady", true);
                if (this.get("gfiTheme") === "trinkwasser") {
                    clone.splitContent();
                }
                this.collection.add(clone);
            }
        }, this);
    },

    /**
     * adds the gfiContent for a 3D Cesium TileFeature or a 3d Cesium Entity.
     * The Attributes are saved directly at the model in the attributes property
     * @returns {void}
     */
    get3DFeatureGfi: function () {
        var gfiContent;

        gfiContent = this.translateGFI([this.get("attributes")], this.get("gfiAttributes"));
        gfiContent = this.getManipulateDate(gfiContent);
        this.setGfiContent(gfiContent);
        this.setIsReady(true);
    },

    /**
     * todo add jsdoc info about this function
     * @returns {void}
     */
    getVectorGfi: function () {
        var gfiContent,
            gfiFeatureList = this.get("gfiFeatureList");

        if (!_.isEmpty(gfiFeatureList)) {
            gfiContent = this.translateGFI([gfiFeatureList[0].getProperties()], this.get("gfiAttributes"));
            gfiContent = this.getManipulateDate(gfiContent);

            this.setGfiContent(_.extend(gfiContent, {
                allProperties: gfiFeatureList[0].getProperties()
            }));
            this.setIsReady(true);
        }
    },

    /**
     * Checks validity of a key according to configured list of ignored keys
     * @param {string}      key         Name of the key
     * @fires Core#RadioRequestUtilGetIgnoredKeys
     * @returns {boolean}   isValidKey  returns the validita of a key
     */
    isValidKey: function (key) {
        var ignoredKeys = Config.ignoredKeys ? Config.ignoredKeys : Radio.request("Util", "getIgnoredKeys");

        if (_.indexOf(ignoredKeys, key.toUpperCase()) !== -1) {
            return false;
        }

        return true;
    },

    /**
     * checks if the value is a string or array and if it is a string,
     * whether the value is unequal to NULL or an empty string
     * @param {(string|Array)} value - value
     * @returns {boolean} true or false
     */
    isValidValue: function (value) {
        if (value && _.isString(value) && value !== "" && value.toUpperCase() !== "NULL") {
            return true;
        }
        else if (_.isArray(value)) {
            return true;
        }
        else if (_.isNumber(value)) {
            return true;
        }
        return false;
    },

    /**
     * helper function: first letter upperCase, _ becomes " "
     * @param {string} str String to be beautified
     * @returns {void}
     */
    beautifyString: function (str) {
        return str.substring(0, 1).toUpperCase() + str.substring(1).replace("_", " ");
    },

    /**
     * helper function to provide information about a "multiTag" attribute on a non parsed JSON string
     * @param {string} str JSON string to parse and to check
     * @returns {void}
     */
    isMultiTag: function (str) {
        var test;

        try {
            test = JSON.parse(str);
        }
        catch (e) {
            return false;
        }
        if (_.isObject(test) && _.has(test, "multiTag")) {
            return true;
        }
        return false;
    },

    /**
      * Selector of feature infos to show
      * @param   {object[]}         gfiList        gfiList list array with feature infos
      * @param   {(string|object)}  gfiAttributes  Flag to describe necessary gfi infos "ignore" || "showAll" or specific list of objects
      * @returns {object[]}         pgfi           List of objects
      */
    translateGFI: function (gfiList, gfiAttributes) {
        var pgfi = [];

        if (gfiAttributes === "ignore") {
            return pgfi;
        }

        gfiList.forEach(element => {
            let gfi = this.removeInvalidEntries(element);

            if (gfiAttributes === "showAll") {
                gfi = this.beautifyGfiKeys(gfi);
            }
            else {
                gfi = this.prepareGfiByAttributes(gfi, gfiAttributes);
            }
            if (_.isEmpty(gfi) !== true) {
                pgfi.push(gfi);
            }
        });

        return pgfi;
    },
    prepareGfiByAttributes: function (gfi, attributes) {
        const preparedGfi = {};

        Object.keys(attributes).forEach(key => {
            let newKey = attributes[key],
                value = this.prepareGfiValue(gfi, key);

            if (typeof newKey === "object") {
                value = this.prepareGfiValueFromObject(value, newKey);
                newKey = newKey.name;
            }
            preparedGfi[newKey] = value;
        });

        return preparedGfi;
    },

    prepareGfiValueFromObject: function (value, obj) {
        const type = obj.hasOwnProperty("type") ? obj.type : "string",
            format = obj.hasOwnProperty("format") ? obj.format : "DD.MM.YYYY HH:mm:ss";
        let preparedValue = value,
            date;

        preparedValue = this.appendSuffix(preparedValue, obj.suffix);
        switch (type) {
            case "date": {
                date = moment(String(preparedValue));
                if (date.isValid()) {
                    preparedValue = moment(String(preparedValue)).format(format);
                }
                break;
            }
            // default equals to obj.type === "string"
            default: {
                preparedValue = String(preparedValue);
            }
        }

        return preparedValue;
    },

    appendSuffix: function (value, suffix) {
        let valueWithSuffix = value;

        if (suffix) {
            valueWithSuffix = String(valueWithSuffix) + " " + suffix;
        }
        return valueWithSuffix;
    },

    prepareGfiValue: function (gfi, key) {
        const isPath = key.startsWith("@");
        let value = gfi[key];

        if (isPath) {
            value = this.getValueFromPath(gfi, key);
        }
        return value;
    },

    getValueFromPath: function (gfi, path) {
        const pathParts = path.substring(1).split(".");
        let value = gfi;

        pathParts.forEach(part => {
            value = value ? value[part] : undefined;
        });

        return value;
    },

    beautifyGfiKeys: function (gfi) {
        const beautifiedGfi = {};

        Object.keys(gfi).forEach(key => {
            const value = gfi[key],
                beautifiedKey = this.beautifyString(key);

            beautifiedGfi[beautifiedKey] = value;
        });
        return beautifiedGfi;
    },

    // get rid of invalid keys and keys with invalid values; trim values
    removeInvalidEntries: function (element) {
        const gfi = {};

        Object.keys(element).forEach(key => {
            let value = element[key];

            if (this.get("gfiTheme") === "table") {
                if (this.isValidKey(key)) {
                    gfi[key] = value;
                }
            }
            else if (this.isValidKey(key)) {
                if (this.isMultiTag(value)) {
                    value = JSON.parse(value).multiTag;
                    value = value.join("</br>");
                }
                value = typeof value === "string" ? value.trim() : value;
                gfi[key] = value;
            }
        });
        return gfi;
    },

    /**
     * Removes Attributes from the preGfi object that start with the given string.
     * Currently used only for sensor-Theme.
     * @param {Object} preGfi preGfi.
     * @param {String} prefix String condition each attributes starts with.
     * @returns {Object} - The pregfi without the attributes starting with string.
     */
    removeIFrameAttributes: function (preGfi, prefix) {
        let gfi = preGfi;

        if (this.get("gfiTheme") === "sensor") {
            gfi = Object.keys(gfi).filter(key => {
                return !key.startsWith(prefix);
            }).reduce((obj, key) => {
                obj[key] = gfi[key];
                return obj;
            }, {});
        }
        return gfi;
    },

    /**
     * set all keys from object to lowercase
     * @param {object} obj - key value pairs
     * @returns {object} obj with lowercase keys
     */
    allKeysToLowerCase: function (obj) {
        var lowerObj = {};

        _.each(obj, function (value, key) {
            lowerObj[key.toLowerCase()] = value;
        });

        return lowerObj;
    },

    /**
     * Checks all values and checks if it is a "DD-MM-YYYY"-compliant date.
     * If yes, it will be converted to DD.MM.YYYY format.
     * @param  {object} content - GFI Attributes
     * @return {object} content
     */
    getManipulateDate: function (content) {
        _.each(content, function (element) {
            _.each(element, function (value, key, list) {
                if (moment(value, "DD-MM-YYYY", true).isValid() === true) {
                    list[key] = moment(value).format("DD.MM.YYYY");
                }
            });
        });
        return content;
    },

    /**
     * Setter for uiStyle
     * @param {string} value Value for uiStyle
     * @returns {void}
     */
    setUiStyle: function (value) {
        this.set("uiStyle", value);
    },

    /**
     * Setter for isVisible
     * @param {boolean} value Value for isVsible
     * @returns {void}
     */
    setIsVisible: function (value) {
        this.set("isVisible", value);
    },

    /**
     * Setter for gfiContent
     * @param {object} value Value for gfiContent
     * @fires Core#RadioRequestUtilGetUiStyle
     * @returns {void}
     */
    setGfiContent: function (value) {
        this.setUiStyle(Radio.request("Util", "getUiStyle"));
        this.set("gfiContent", value);
    },

    /**
     * Setter for isReady
     * @param {boolean} value Value for isReady
     * @returns {void}
     */
    setIsReady: function (value) {
        this.set("isReady", value);
    }
});

export default Theme;
