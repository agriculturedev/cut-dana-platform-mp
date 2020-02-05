import {Style} from "ol/style.js";
import PointStyle from "./pointStyle";
import TextStyle from "./textStyle";
import PolygonStyle from "./polygonStyle";

const VectorStyleModel = Backbone.Model.extend(/** @lends VectorStyleModel.prototype */{
    /**
     * @description Class to read style.json
     * @class VectorStyleModel
     * @extends Backbone.Model
     * @memberof VectorStyle
     * @constructs
     */
    defaults: {
        "conditions": null,
        "style": null
    },

    /**
     * Function is called from layer models for each feature.
     * @param   {ol/feature}  feature     the feature to style
     * @param   {Boolean} isClustered is feature clustered
     * @returns {ol/style/Style} style used in layer model
     */
    createStyle: function (feature, isClustered) {
        const rules = this.getRulesForFeature(feature),
            // Takes first rule in array for labeling so that is giving precedence to the order in the style.json
            style = Array.isArray(rules) && rules.length > 0 ? rules[0].style : null,
            hasLabelField = style && style.hasOwnProperty("labelField"),
            styleObject = this.getGeometryStyle(feature, rules, isClustered);

        // label style is optional and depends on some fields
        if (isClustered || hasLabelField) {
            if (_.isArray(styleObject)) {
                styleObject[0].setText(this.getLabelStyle(feature, style, isClustered));
            }
            else {
                styleObject.setText(this.getLabelStyle(feature, style, isClustered));
            }
        }

        return styleObject;
    },

    /**
     * Returns true if feature contains some kind of MultiGeometry
     * @param   {string}  geometryType     the geometry type to check
     * @returns {Boolean} is geometrytype a multiGeometry
     */
    isMultiGeometry: function (geometryType) {
        return geometryType === "MultiPoint" || geometryType === "MultiLineString" || geometryType === "MultiPolygon" || geometryType === "GeometryCollection";
    },

    /**
     * Returns the style for the geometry object
     * @param   {ol/feature}  feature     the ol/feature to style
     * @param   {object[]}  rules       styling rules to check. Array can be empty.
     * @param   {Boolean} isClustered Flag to show if feature is clustered.
     * @returns {ol/style/Style}    style is always returned
     */
    getGeometryStyle: function (feature, rules, isClustered) {
        const geometryType = feature.getGeometry().getType(),
            isMultiGeometry = this.isMultiGeometry(geometryType);

        // For simple geometries the first styling rule is used.
        // That algorithm implements an OR statement between multiple valid conditions giving precedence to its order in the style.json.
        if (!isMultiGeometry && rules.hasOwnProperty(0) && rules[0].hasOwnProperty("style")) {
            return this.getSimpleGeometryStyle(geometryType, feature, rules[0].style, isClustered);
        }
        // MultiGeometries must be checked against all rules because there might be a "sequence" in the condition.
        else if (isMultiGeometry && rules.length > 0 && rules.every(element => element.hasOwnProperty("style"))) {
            return this.getMultiGeometryStyle(geometryType, feature, rules, isClustered);
        }

        console.warn("No valid styling rule found.");
        return new Style();
    },

    /**
     * Returns the style for simple (non-multi) geometry types
     * @param   {string}  geometryType GeometryType
     * @param   {ol/feature}  feature     the ol/feature to style
     * @param   {object}  style       styling rule to use.
     * @param   {Boolean} isClustered  Flag to show if feature is clustered.
     * @returns {ol/style/Style}    style is always returned
     */
    getSimpleGeometryStyle: function (geometryType, feature, style, isClustered) {
        let styleObject;

        if (geometryType === "Point") {
            styleObject = new PointStyle(feature, style, isClustered);
            return styleObject.getStyle();
        }
        else if (geometryType === "LineString") {
            console.warn("Geometry type not implemented: " + geometryType);
            return new Style();
        }
        else if (geometryType === "LinearRing") {
            console.warn("Geometry type not implemented: " + geometryType);
            return new Style();
        }
        else if (geometryType === "Polygon") {
            styleObject = new PolygonStyle(feature, style, isClustered);
            return styleObject.getStyle();
        }
        else if (geometryType === "Circle") {
            console.warn("Geometry type not implemented: " + geometryType);
            return new Style();
        }

        console.warn("Geometry type not implemented: " + geometryType);
        return new Style();
    },

    /**
     * Returns an array of simple geometry styles.
     * @param   {string}  geometryType GeometryType
     * @param   {ol/feature}  feature     the ol/feature to style
     * @param   {object[]}  rules       styling rules to check.
     * @param   {Boolean} isClustered  Flag to show if feature is clustered.
     * @returns {ol/style/Style[]}    style array of simple geometry styles is always returned
     */
    getMultiGeometryStyle: function (geometryType, feature, rules, isClustered) {
        const olStyle = [];
        let geometries;

        if (geometryType === "MultiPoint") {
            geometries = feature.getGeometry().getPoints();
        }
        else if (geometryType === "MultiLineString") {
            geometries = feature.getGeometry().getLineStrings();
        }
        else if (geometryType === "MultiPolygon") {
            geometries = feature.getGeometry().getPolygons();
        }
        else if (geometryType === "GeometryCollection") {
            geometries = feature.getGeometry().getGeometries();
        }

        geometries.forEach((geometry, index) => {
            const geometryTypeSimpleGeom = geometry.getType(),
                rule = this.getRuleForIndex(rules, index);

            // For simplicity reasons we do not support multi encasulated multi geometries but ignore them.
            if (this.isMultiGeometry(geometryTypeSimpleGeom)) {
                console.warn("Multi encapsulated multiGeometries are not supported.");
            }
            else if (rule) {
                const simpleStyle = this.getSimpleGeometryStyle(geometryTypeSimpleGeom, feature, rule.style, isClustered);

                simpleStyle.setGeometry(geometry);
                olStyle.push(simpleStyle);
            }
        }, this);

        return olStyle;
    },

    /**
     * Returns the best rule for the indexed feature giving precedence to the index position or conditions.
     * @param   {object[]} rules the rules to check
     * @param   {integer} index the index position of this geometry in the multi geometry
     * @returns {object|null} the rule or null if no rule match the conditions
     */
    getRuleForIndex: function (rules, index) {
        const indexedRule = this.getIndexedRule(rules, index),
            propertiesRule = rules.find(rule => {
                return rule.hasOwnProperty("conditions");
            }),
            fallbackRule = rules.find(rule => {
                return !rule.hasOwnProperty("conditions");
            });

        if (indexedRule) {
            return indexedRule;
        }
        else if (propertiesRule) {
            return propertiesRule;
        }
        else if (fallbackRule) {
            return fallbackRule;
        }

        return null;
    },

    /**
     * Returns the first rule that satisfies the index of the multi geometry.
     * The "sequence" must be an integer with defined min and max values representing the index range.
     * @param   {object[]} rules all rules the satisfy conditions.properties.
     * @param   {integer} index the simple geometries index
     * @returns {object|undefined} the proper rule
     */
    getIndexedRule: function (rules, index) {
        return rules.find(rule => {
            const sequence = rule.hasOwnProperty("conditions") && rule.conditions.hasOwnProperty("sequence") ? rule.conditions.sequence : null,
                isSequenceValid = sequence && Array.isArray(sequence) && sequence.every(element => typeof element === "number") && sequence.length === 2 && sequence[1] >= sequence[0],
                minValue = isSequenceValid ? sequence[0] : -1,
                maxValue = isSequenceValid ? sequence[1] : -1;

            return index >= minValue && index <= maxValue;
        });
    },

    /**
     * Returns the style to label the object
     * @param   {ol/feature}  feature     the ol/feature to style
     * @param   {object}  style       styling rule from style.json
     * @param   {Boolean} isClustered Flag to show if feature is clustered.
     * @returns {ol/style/Text}    style is always returned
     */
    getLabelStyle: function (feature, style, isClustered) {
        const styleObject = new TextStyle(feature, style, isClustered);

        return styleObject.getStyle();
    },

    /**
     * Returning all rules that fit to the feature. Array could be empty.
     * @param {ol/feature} feature the feature to check
     * @returns {object[]} return all rules that fit to the feature
     */
    getRulesForFeature: function (feature) {
        return this.get("rules").filter(rule => this.checkProperties(feature, rule));
    },

    /**
     * Loops one feature through all properties returning true if all properties are satisfied.
     * Returns also true if rule has no "conditions" to check.
     * @param   {ol/feature} feature to check
     * @param {object} rule the rule to check
     * @returns {Boolean} true if all properties are satisfied
     */
    checkProperties: function (feature, rule) {
        if (rule.hasOwnProperty("conditions") && rule.conditions.hasOwnProperty("properties")) {
            const featureProperties = feature.getProperties(),
                properties = rule.conditions.properties;

            let key;

            for (key in properties) {
                const value = properties[key];

                if (!this.checkProperty(featureProperties, key, value)) {
                    return false;
                }
            }

            return true;
        }

        return true;
    },

    /**
     * Checks one feature against one property returning true if property satisfies condition.
     * @param   {object} featureProperties properties of the feature that has to be checked
     * @param   {string} key attribute name or object path to check
     * @param   {string|number|array} value attribute value or object path to check
     * @returns {Boolean} true if property is satisfied. Otherwhile returns false.
     */
    checkProperty: function (featureProperties, key, value) {
        const featureValue = this.getFeatureValue(featureProperties, key),
            referenceValue = this.getReferenceValue(featureProperties, value);

        if ((typeof featureValue === "string" || typeof featureValue === "number") && (typeof referenceValue === "string" || typeof referenceValue === "number" ||
        (Array.isArray(referenceValue) && referenceValue.every(element => typeof element === "number") &&
        (referenceValue.length === 2 || referenceValue.length === 4)))) {
            return this.compareValues(featureValue, referenceValue);
        }

        return false;
    },

    /**
     * Returns the reference value. If necessary it loops through the feature properties object structure.
     * @param   {object} featureProperties properties of the feature
     * @param   {string} value attribute value or object path to check
     * @returns {undefined} attribute property can be of any type
     */
    getReferenceValue: function (featureProperties, value) {
        const valueIsObjectPath = this.isObjectPath(value);
        let referenceValue = value;

        // sets the real feature property value in case referenceValue is an object path
        if (valueIsObjectPath) {
            referenceValue = this.getFeaturePropertyByPath(featureProperties, referenceValue);
        }

        // sets the real feature property values also for min-max-arrays in case its values are object pathes.
        if (Array.isArray(referenceValue)) {
            referenceValue.forEach((element, index, arr) => {
                if (this.isObjectPath(element)) {
                    arr[index] = this.getFeaturePropertyByPath(featureProperties, element);
                }
            }, this);
        }

        return referenceValue;
    },

    /**
     * Returns feature value identified by key. If necessary it loops through the feature properties object structure.
     * @param   {object} featureProperties properties of the feature
     * @param   {string} key attribute name or object path to check
     * @returns {undefined} attribute property can be of any type
     */
    getFeatureValue: function (featureProperties, key) {
        const keyIsObjectPath = this.isObjectPath(key);

        if (keyIsObjectPath) {
            return this.getFeaturePropertyByPath(featureProperties, key);
        }
        else if (featureProperties.hasOwnProperty(key)) {
            return featureProperties[key];
        }

        return null;
    },

    /**
     * Returns the object path of featureProperties which is defined as path.
     * Returns null if "path" is not included in featureProperties.
     * @param   {object} featureProperties properties of the feature
     * @param   {string} path object path starting with "path://"
     * @returns {object|null} sub object of featureProperties
     */
    getFeaturePropertyByPath: function (featureProperties, path) {
        let featureProperty = featureProperties;
        const pathArray = path.substring(1).split(".").filter(element => element !== "");

        for (let i = 0; i < pathArray.length; i++) {
            const element = pathArray[i];

            if (!featureProperty.hasOwnProperty(element)) {
                return null;
            }
            featureProperty = featureProperty[element];
        }

        return featureProperty;
    },

    /**
     * Compares values according to its type.
     * @param   {string|number} featureValue value to compare
     * @param   {string|number|array} referenceValue value to compare
     * @returns {Boolean} true if values equal or in range
     */
    compareValues: function (featureValue, referenceValue) {
        let value = featureValue;

        // plain value compare for strings
        if (typeof featureValue === "string" && typeof referenceValue === "string") {
            if (featureValue === referenceValue) {
                return true;
            }
        }
        // plain value compare trying to parse featureValue to float
        else if (typeof referenceValue === "number") {
            value = parseFloat(value);

            if (!isNaN(featureValue) && value === parseFloat(referenceValue)) {
                return true;
            }
        }
        // compare value in range
        else if (Array.isArray(referenceValue) && referenceValue.every(element => typeof element === "number") && (referenceValue.length === 2 || referenceValue.length === 4)) {
            value = parseFloat(value);

            if (!isNaN(featureValue)) {
                // value in absolute range of numbers [minValue, maxValue]
                if (referenceValue.length === 2) {
                    // do nothing
                }
                // value in relative range of numbers [minValue, maxValue, relMin, relMax]
                else if (referenceValue.length === 4) {
                    value = 1 / (parseFloat(referenceValue[3], 10) - parseFloat(referenceValue[2], 10)) * (value - parseFloat(referenceValue[2], 10));
                }
                if (referenceValue[0] === null && referenceValue[1] === null) {
                    // everything is in a range of [null, null]
                    return true;
                }
                else if (referenceValue[0] === null) {
                    // if a range [null, x] is given, x should not be included
                    return value < parseFloat(referenceValue[1]);
                }
                else if (referenceValue[1] === null) {
                    // if a range [x, null] is given, x should be included
                    return value >= parseFloat(referenceValue[0]);
                }

                // if a range [x, y] is given, x should be included but y should not be included
                return value >= parseFloat(referenceValue[0]) && value < parseFloat(referenceValue[1]);
            }
        }


        return false;
    },

    /**
     * checks if value starts with special prefix to determine if value is a object path
     * @param   {string} value string to check
     * @returns {Boolean} true is value is an object path
     */
    isObjectPath: function (value) {
        return typeof value === "string" && value.startsWith("@");
    }
});

export default VectorStyleModel;
