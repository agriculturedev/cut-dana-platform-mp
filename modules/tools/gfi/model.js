import Overlay from "ol/Overlay.js";
import {getCenter} from "ol/extent.js";
import ThemeList from "./themes/list";
import DesktopDetachedView from "./desktop/detached/view";
import TableView from "./table/view";
import DesktopAttachedView from "./desktop/attached/view";
import MobileView from "./mobile/view";
import Tool from "../../core/modelList/tool/model";
import HightlightFeature from "./highlightFeature";

const GFI = Tool.extend(/** @lends GFI.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        // detached | attached
        desktopViewType: "detached",
        // ist das Modal/Popover sichtbar
        isVisible: false,
        // mobile Ansicht true | false
        isMobile: false,
        // uiStyle DEFAULT | TABLE | SIMPLE
        uiStyle: "DEFAULT",
        // ol.Overlay für attached
        overlay: new Overlay({element: undefined}),
        // desktop/attached/view.js | desktop/detached/view.js | mobile/view.js
        currentView: undefined,
        // Koordinate für das attached Popover und den Marker
        coordinate: undefined,
        // Verwaltet die Themes
        themeList: undefined,
        // Index für das aktuelle Theme
        themeIndex: 0,
        // Anzahl der Themes
        numberOfThemes: 0,
        rotateAngle: 0,
        glyphicon: "glyphicon-info-sign",
        isMapMarkerVisible: true,
        unlisten: false,
        highlightFeature: undefined,
        centerMapMarkerPolygon: false
    }),
    /**
     * @class GFI
     * @extends Tools
     * @memberof Tools.GFI
     * @constructs
     */
    initialize: function () {
        const channel = Radio.channel("GFI");

        // check and initiate module to highlight selected Feature
        if (this.get("highlightVectorRules")) {
            this.set("highlightFeature", new HightlightFeature(this.get("highlightVectorRules")));
        }

        // Wegen Ladereihenfolge hier die Default-Attribute setzen, sonst sind die Werte noch nicht aus der Config ausgelesen
        this.set("uiStyle", Radio.request("Util", "getUiStyle"));
        this.set("isMobile", Radio.request("Util", "isViewMobile"));

        this.setThemeList(new ThemeList());

        channel.on({
            "setIsVisible": this.setIsVisible,
            "layerAtPosition": this.setGfiOfLayerAtPosition,
            "changeFeature": this.changeFeature,
            "isMapMarkerVisible": this.setIsMapMarkerVisible
        }, this);

        channel.reply({
            "getIsVisible": function () {
                return this.get("isVisible");
            },
            "getGfiForPrint": this.getGfiForPrint,
            "getCoordinate": function () {
                return this.get("coordinate");
            },
            "getCurrentView": function () {
                return this.get("currentView");
            },
            "getVisibleTheme": this.getVisibleTheme
        }, this);

        this.listenTo(this, {
            "change:isVisible": function (model, value) {
                if (value === false) {
                    this.lowlightFeature();
                }
                channel.trigger("isVisible", value);
                if (value === false && this.get("numberOfThemes") > 0) {
                    this.get("themeList").setAllInVisible();
                }
            },
            "change:isMobile": function () {
                this.initView();
                if (this.get("isVisible") === true) {
                    this.get("currentView").render();
                    this.get("themeList").appendTheme(this.get("themeIndex"));
                    this.get("currentView").toggle();
                }
            },
            "change:themeIndex": function (model, value) {
                this.highlightFeature(model.get("currentView").model);
                this.get("themeList").appendTheme(value);
            },
            "change:isActive": function (model, value) {
                if (value) {
                    this.listenToThemeList();
                    this.listen();
                }
                else {
                    this.stopListening(this.get("themeList"));
                    this.unlisten();
                }
            }
        });
        this.listenToThemeList();

        this.listenTo(Radio.channel("Util"), {
            "isViewMobileChanged": this.setIsMobile
        }, this);

        this.listenTo(Radio.channel("Map"), {
            "isReady": function () {
                this.setIsActive(true);
                this.listen();
                if (this.get("desktopViewType") === "attached" && Radio.request("Util", "isViewMobile") === false) {
                    Radio.trigger("Map", "addOverlay", this.get("overlay"));
                }
            },
            "updateSize": function () {
                this.initView();
                if (this.get("isVisible") === true) {
                    this.get("currentView").render();
                    this.get("themeList").appendTheme(this.get("themeIndex"));
                    this.get("currentView").toggle();
                }
            }
        }, this);

        this.listenTo(Radio.channel("VisibleVector"), {
            "gfiOnClick": function (hit) {
                this.setGfiOfFeature(hit);
            }
        });

        this.initView();
    },
    listenToThemeList: function () {
        this.listenTo(this.get("themeList"), {
            "isReady": function () {
                if (this.get("themeList").length > 0) {
                    this.setNumberOfThemes(this.get("themeList").length);
                    this.get("currentView").render();
                    this.get("themeList").appendTheme(0);
                    this.setIsVisible(true);
                }
                else {
                    this.setIsVisible(false);
                }
                this.highlightFeature(this.get("currentView").model);
            }
        });
    },
    /**
     * if the displayed feature changes, the model is recreated and the gfi adjusted
     * @param  {ol.Feature} feature - the feature which has been changed
     * @returns {void}
     */
    changeFeature: function (feature) {
        let gfiFeature,
            gfiTheme;

        if (this.get("isVisible")) {
            gfiFeature = this.get("themeList").models[0].attributes.feature;

            if (gfiFeature === feature) {
                gfiTheme = this.get("themeList").models[0].attributes.gfiTheme;

                Radio.trigger("gfiList", "redraw");
                Radio.trigger(gfiTheme + "Theme", "changeGfi");
            }
        }
    },
    listen: function () {
        this.setClickEventKey(Radio.request("Map", "registerListener", "click", this.setGfiParams.bind(this)));
        this.listenTo(Radio.channel("Map"), {
            "clickedWindowPosition": this.setGfiParams
        }, this);
    },
    unlisten: function () {
        Radio.trigger("Map", "unregisterListener", this.get("clickEventKey"));
        this.stopListening(Radio.channel("Map"), "clickedWindowPosition");
    },

    /**
     * Löscht vorhandene View - falls vorhanden - und erstellt eine neue
     * mobile | detached | attached
     * @return {undefined}
     */
    initView: function () {
        let CurrentView;

        // Beim ersten Initialisieren ist CurrentView noch undefined
        if (this.get("currentView") !== undefined) {
            this.get("currentView").removeView();
        }

        if (this.get("isMobile")) {
            CurrentView = MobileView;
        }
        else if (this.get("desktopViewType") === "attached") {
            CurrentView = DesktopAttachedView;
        }
        else if (this.get("uiStyle") === "TABLE") {
            CurrentView = TableView;
        }
        else {
            CurrentView = DesktopDetachedView;
        }
        this.setCurrentView(new CurrentView({model: this}));
    },

    /**
     * Function to define the Gfi Parameters.
     * Determines from which layers and from which coordinate the information of one or more features is retrieved.
     * @param {ol.MapBrowserPointerEvent} evt Event
     * @return {void}
     */
    setGfiParams: function (evt) {
        const visibleLayerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, isOutOfRange: false}),
            gfiParamsList = this.getGFIParamsList(visibleLayerList),
            visibleWMSLayerList = gfiParamsList.wmsLayerList,
            visibleVectorLayerList = gfiParamsList.vectorLayerList;

        let GFIParams3d = [],
            coordinate = [],
            vectorGFIParams = [],
            wmsGFIParams = [],
            unionParams = [];

        Radio.trigger("ClickCounter", "gfi");

        if (Radio.request("Map", "isMap3d")) {
            GFIParams3d = this.setGfiParams3d(evt);
            // use pickedPosition in 3D Mode, to get the 3d position directly at the 3d object
            this.setCoordinate(evt.pickedPosition);
        }

        coordinate = this.getClickedCoordinate(this.get("centerMapMarkerPolygon"), evt);
        this.setCoordinate(coordinate);
        vectorGFIParams = this.getVectorGFIParams(visibleVectorLayerList, evt.map.getEventPixel(evt.originalEvent));
        wmsGFIParams = this.getWMSGFIParams(visibleWMSLayerList);

        this.setThemeIndex(0);
        unionParams = vectorGFIParams.concat(wmsGFIParams, GFIParams3d);
        if (unionParams.length === 0) {
            this.setIsVisible(false);
        }
        else {
            this.get("overlay").setPosition(this.get("coordinate"));
            this.get("themeList").reset(unionParams);
        }
    },

    setGfiParams3d: function (evt) {
        const gfiParams3d = [],
            features = Radio.request("Map", "getFeatures3dAtPosition", evt.position);

        features.forEach(feature => {
            const properties = {};

            let propertyNames,
                modelAttributes,
                layerModel,
                olFeature,
                layer;

            if (feature instanceof Cesium.Cesium3DTileFeature || feature instanceof Cesium.Cesium3DTilePointFeature) {
                propertyNames = feature.getPropertyNames();
                propertyNames.forEach(propertyName => {
                    properties[propertyName] = feature.getProperty(propertyName);
                });
                if (properties.attributes && properties.id) {
                    properties.attributes.gmlid = properties.id;
                }
                if (feature.tileset && feature.tileset.layerReferenceId) {
                    layerModel = Radio.request("ModelList", "getModelByAttributes", {id: feature.tileset.layerReferenceId});
                    if (layerModel) {
                        modelAttributes = _.pick(layerModel.attributes, "name", "gfiAttributes", "typ", "gfiTheme", "routable", "id", "isComparable");
                    }

                }
                if (!modelAttributes) {
                    modelAttributes = {
                        attributes: properties.attributes ? properties.attributes : properties,
                        gfiAttributes: {"roofType": "Dachtyp", "measuredHeight": "Dachhöhe", "function": "Objektart"},
                        typ: "Cesium3DTileFeature",
                        gfiTheme: "buildings_3d",
                        name: "Buildings"
                    };
                }
                else {
                    modelAttributes.attributes = properties.attributes ? properties.attributes : properties;
                    modelAttributes.typ = "Cesium3DTileFeature";
                }
                gfiParams3d.push(modelAttributes);
            }
            else if (feature.primitive) {
                olFeature = feature.primitive.olFeature;
                layer = feature.primitive.olLayer;
                if (olFeature && layer) {
                    gfiParams3d.push(this.getVectorGfiParams3d(olFeature, layer));
                }
                else if (feature.primitive.id instanceof Cesium.Entity) {
                    layerModel = Radio.request("ModelList", "getModelByAttributes", {id: feature.primitive.id.layerReferenceId});
                    if (layerModel) {
                        modelAttributes = _.pick(layerModel.attributes, "name", "gfiAttributes", "typ", "gfiTheme", "routable", "id", "isComparable");
                    }
                    if (modelAttributes) {
                        if (feature.primitive.id.attributes) {
                            modelAttributes.attributes = feature.primitive.id.attributes;
                        }
                    }
                    if (layerModel) {
                        gfiParams3d.push(modelAttributes);
                    }
                }
            }
        });
        return gfiParams3d;
    },

    /**
     * Returns the clicked coordinates, if the parameter centerPolygon is false.
     * If the parameter centerPolygon has the value true, the coordinate of the center of the feature is determined.
     * @param {boolean} centerPolygon - Parameter for specifying whether the coordinate of the center of a feature should be determined.
     * @param {ol.MapBrowserPointerEvent} evt - click event.
     * @returns {number} coordinate of clicked position or center coordinate of clicked feature.
     */
    getClickedCoordinate: function (centerPolygon, evt) {
        let feature,
            coordinate;

        if (centerPolygon === true) {

            // für detached MapMarker
            if (evt.hasOwnProperty("pixel")) {
                feature = evt.map.forEachFeatureAtPixel(evt.pixel, function (feat) {
                    return feat;
                },
                {
                    layerFilter: function (layer) {
                        return layer.get("gfiAttributes") !== "ignore" || layer.get("gfiAttributes") === undefined;
                    }
                });
            }

            // Derive (center) coordinate with respect to the feature type
            if (feature === null || feature === undefined) {
                coordinate = evt.coordinate;
            }
            else if ((/polygon/i).test(feature.getGeometry().getType())) {
                coordinate = getCenter(feature.getGeometry().getExtent());
            }
            else {
                coordinate = feature.getGeometry().getFirstCoordinate();
            }
        }
        else {
            coordinate = evt.coordinate;
        }
        return coordinate;
    },

    /**
     * Aufschlüsselung von WMS und Vector-GFI Abfragen aus einer gemischten Layerliste unter Berücksichtung von GroupLayern.
     * @param   {model[]} layerList Liste der aufzuschlüsselnden Layer
     * @returns {Object}            Objekt der aufgeschlüsslten GFI
     */
    getGFIParamsList: function (layerList) {
        const wmsLayerList = [],
            vectorLayerList = [],
            currentScale = Radio.request("MapView", "getOptions").scale;

        let maxScale = "",
            typ = "";

        // Assign layer types to the query
        layerList.forEach(function (layer) {
            maxScale = layer.get("maxScale");
            typ = layer.get("typ");

            if (maxScale && currentScale && parseFloat(currentScale, 10) > parseInt(maxScale, 10)) {
                return;
            }

            if (typ === "WMS") {
                wmsLayerList.push(layer);
            }
            else if (typ === "GROUP" && layer.get("layerSource")) {
                layer.get("layerSource").forEach(function (layerSource) {
                    if (layerSource.get("typ") === "WMS" && layerSource.get("layer").getVisible() === true) {
                        wmsLayerList.push(layerSource);
                    }
                    else {
                        vectorLayerList.push(layerSource);
                    }
                }, this);
            }
            else {
                vectorLayerList.push(layer);
            }
        });

        return {
            wmsLayerList: wmsLayerList,
            vectorLayerList: vectorLayerList
        };
    },

    /**
     * Ermittelt die GFIParameter zur Abfrage von Vectorlayern
     * @param  {layer[]} layerlist  Liste der abzufragenden Vectorlayer
     * @param  {pixel} eventPixel   Pixelkoordinate
     * @return {object[]}           GFI-Parameter von Vektorlayern
     */
    getVectorGFIParams: function (layerlist, eventPixel) {
        const vectorGfiParams = [];

        layerlist.forEach(vectorLayer => {
            const features = Radio.request("Map", "getFeaturesAtPixel", eventPixel, {
                    layerFilter: function (layer) {
                        return layer.get("id") === vectorLayer.get("id");
                    },
                    hitTolerance: vectorLayer.get("hitTolerance")
                }),
                modelAttributes = _.pick(vectorLayer.attributes, "name", "gfiAttributes", "typ", "gfiTheme", "routable", "id", "isComparable", "layer");

            features.forEach(featureAtPixel => {
                // Feature
                if (!featureAtPixel.getProperties().hasOwnProperty("features")) {
                    vectorGfiParams.push(this.prepareVectorGfiParam(modelAttributes, featureAtPixel));
                }
                // Cluster Feature
                else {
                    featureAtPixel.get("features").forEach(feature => {
                        vectorGfiParams.push(this.prepareVectorGfiParam(modelAttributes, feature));
                    });
                }
            });
        });

        return vectorGfiParams;
    },

    /**
     * Adds gfifeatureList and feature to model attributes.
     * Manipulates the model id which is a DIRTY HACK until gfi gets completely refactored!
     * we are resetting the gfitheme-list. and for each model there must be a unique id
     * now if we have a cluster feature with 2 features. the layer ids are the same, and only one layer gets added to the themelist
     * that is why we add "_[uniqueId]", so that the gfiTheme-list contains two options theme models
     * @param {Object} modelAttributes Model attributes needed for gfi
     * @param {ol.feature} feature Vector feature that was found on click event
     * @returns {Object} Prepared vector gfi param
     */
    prepareVectorGfiParam: function (modelAttributes, feature) {
        const clonedModelAttributes = {...modelAttributes};

        clonedModelAttributes.gfiFeatureList = [feature];
        clonedModelAttributes.feature = feature;
        clonedModelAttributes.themeId = clonedModelAttributes.id;
        clonedModelAttributes.id += _.uniqueId("_");
        return clonedModelAttributes;
    },

    /**
     * @param {ol.Feature} featureAtPixel Feature
     * @param {ol.Layer} olLayer Layer
     * @return {void}
     */
    getVectorGfiParams3d: function (featureAtPixel, olLayer) {
        const model = Radio.request("ModelList", "getModelByAttributes", {id: olLayer.get("id")});

        let modelAttributes;

        if (model !== undefined) {
            modelAttributes = _.pick(model.attributes, "name", "gfiAttributes", "typ", "gfiTheme", "routable", "id", "isComparable");
            modelAttributes.gfiFeatureList = [];
            // Feature
            if (!featureAtPixel.getProperties().hasOwnProperty("features")) {
                modelAttributes.feature = featureAtPixel;
                modelAttributes.gfiFeatureList.push(featureAtPixel);
            }
            // Cluster Feature
            else {
                featureAtPixel.get("features").forEach(feature => {
                    modelAttributes = _.pick(model.attributes, "name", "gfiAttributes", "typ", "gfiTheme", "routable");
                    modelAttributes.gfiFeatureList.push(feature);
                    modelAttributes.feature = feature;
                });
            }
        }
        return modelAttributes;
    },
    /**
     * Ermittelt die GFIParameter zur Abfrage von WMSlayern
     * @param  {layer[]} layerlist  Liste der abzufragenden WMSlayer
     * @return {object[]}           GFI-Parameter vom WMS-Layern
     */
    getWMSGFIParams: function (layerlist) {

        const wmsGfiParams = [];

        layerlist.forEach(layer => {
            if (layer.get("gfiAttributes") !== "ignore" || layer.get("gfiAttributes") === undefined) {
                layer.attributes.gfiUrl = layer.getGfiUrl();
                wmsGfiParams.push(layer.attributes);
            }
        });

        return wmsGfiParams;
    },

    /**
     * Erzeugt ein GFI eines spezifischen Layers an einer bestimmten Position
     * @param {string} layerId    ID des Layers
     * @param {coordinate[]} coordinate Position des GFI
     * @returns {void}
     */
    setGfiOfLayerAtPosition: function (layerId, coordinate) {
        const layerList = Radio.request("ModelList", "getModelsByAttributes", {id: layerId}),
            gfiParamsList = this.getGFIParamsList(layerList),
            visibleWMSLayerList = gfiParamsList.wmsLayerList,
            visibleVectorLayerList = gfiParamsList.vectorLayerList;

        let vectorGFIParams,
            wmsGFIParams;

        Radio.trigger("ClickCounter", "gfi");

        if (layerList.length === 1) {
            this.setCoordinate(coordinate);

            // Vector
            vectorGFIParams = this.getVectorGFIParams(visibleVectorLayerList, coordinate);
            // WMS
            wmsGFIParams = this.getWMSGFIParams(visibleWMSLayerList);

            this.setThemeIndex(0);

            this.get("themeList").reset(_.union(vectorGFIParams, wmsGFIParams));
        }
    },

    /**
     * Generates a GFI when the feature layer is clicked
     * @param {object} hit   Feature Object
     * @returns {void}
     */
    setGfiOfFeature: function (hit) {
        const coordinate = Radio.request("Map", "getMap").getPixelFromCoordinate(hit.coordinate),
            model = Radio.request("ModelList", "getModelByAttributes", {id: hit.layer_id});

        let vectorGFIParams = {};

        Radio.trigger("ClickCounter", "gfi");
        this.setCoordinate(coordinate);

        // Vector
        vectorGFIParams = {
            feature: hit.feature,
            gfiAttributes: hit.gfiAttributes,
            gfiTheme: model.get("gfiTheme"),
            id: model.get("id"),
            themeId: model.get("id"),
            name: model.get("name"),
            typ: model.get("typ"),
            gfiFeatureList: [hit.feature]
        };

        this.setThemeIndex(0);
        this.get("themeList").reset(vectorGFIParams);
        Radio.trigger("MapMarker", "zoomTo", hit, 5000);
    },

    // Setter
    setCoordinate: function (value, options) {
        this.set("coordinate", value, options);
    },

    setCurrentView: function (value) {
        this.set("currentView", value);
    },

    setIsMobile: function (value) {
        this.set("isMobile", value);
    },

    setIsVisible: function (value) {
        this.set("isVisible", value);
    },

    setNumberOfThemes: function (value) {
        this.set("numberOfThemes", value);
    },

    setOverlayElement: function (value) {
        this.get("overlay").setElement(value);
    },

    setThemeIndex: function (value) {
        this.set("themeIndex", value);
    },

    getOverlayElement: function () {
        return this.get("overlay").getElement();
    },

    /*
    * @description Liefert die GFI-Infos ans Print-Modul.
    */
    getGfiForPrint: function () {
        const theme = this.get("themeList").at(this.get("themeIndex"));

        let responseArray = [];

        if (theme !== undefined) {
            responseArray = [theme.get("gfiContent")[0], theme.get("name"), this.get("coordinate")];
        }
        return responseArray;
    },

    getVisibleTheme: function () {
        return this.get("themeList").findWhere({isVisible: true});
    },

    /**
     * Prüft, ob clickpunkt in RemoveIcon und liefert true/false zurück.
     * @param  {integer} top Pixelwert
     * @param  {integer} left Pixelwert
     * @return {undefined}
     */
    checkInsideSearchMarker: function (top, left) {
        const button = Radio.request("MapMarker", "getCloseButtonCorners"),
            bottomSM = button.bottom,
            leftSM = button.left,
            topSM = button.top,
            rightSM = button.right;

        if (top <= topSM && top >= bottomSM && left >= leftSM && left <= rightSM) {
            return true;
        }
        return false;
    },

    highlightFeature: function (model) {
        const hf = this.get("highlightFeature");

        if (hf) {
            hf.highlight(model.get("currentView").model);
        }
    },

    lowlightFeature: function () {
        const hf = this.get("highlightFeature");

        if (hf) {
            hf.lowlightFeatures();
        }
    },

    setClickEventKey: function (value) {
        this.set("clickEventKey", value);
    },

    // setter for themeList
    setThemeList: function (value) {
        this.set("themeList", value);
    },

    setIsMapMarkerVisible: function (value) {
        this.set("isMapMarkerVisible", value);
    }

});

export default GFI;
