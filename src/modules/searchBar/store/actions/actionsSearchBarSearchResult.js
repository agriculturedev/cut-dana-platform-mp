import markerHelper from "../../js/marker";
import {treeSubjectsKey} from "../../../../shared/js/utils/constants";
import WKTUtil from "../../../../shared/js/utils/getWKTGeom";
import wmsGFIUtil from "../../../../shared/js/utils/getWmsFeaturesByMimeType";
import {rawLayerList} from "@masterportal/masterportalapi/src";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import {trackMatomo} from "../../../../plugins/matomo";


/**
 * Contains actions that communicate with other components after an interaction, such as onClick or onHover, with a search result.
 * @module modules/searchBar/store/actions/actionsSearchBarSearchResult
 */
export default {
    /**
     * Activates a layer in the topic tree.
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} payload The payload.
     * @param {String} payload.layerId The layer id.
     * @returns {void}
     */
    activateLayerInTopicTree: ({dispatch, rootGetters}, {layerId, source}) => {
        const layer = rootGetters.layerConfigById(layerId);

        if (layer) {
            let zIndex = layer.zIndex;

            if (!layer.showInLayerTree) {
                zIndex = rootGetters.determineZIndex(layerId);
            }
            dispatch("replaceByIdInLayerConfig", {
                layerConfigs: [{
                    id: layerId,
                    layer: {
                        id: layerId,
                        visibility: true,
                        showInLayerTree: true,
                        zIndex: zIndex
                    }
                }]
            }, {root: true});
        }
        else {
            dispatch("addLayerToTopicTree", {layerId, source});
        }
    },

    /**
     * Removes a layer from the topic tree.
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} payload The payload.
     * @param {String} payload.layerId The layer id.
     * @returns {void}
     */
    removeLayerFromTopicTree: ({dispatch, rootGetters}, {layerId}) => {
        const layer = rootGetters.layerConfigById(layerId);

        if (layer) {
            dispatch("replaceByIdInLayerConfig", {
                layerConfigs: [{
                    id: layerId,
                    layer: {
                        id: layerId,
                        visibility: false,
                        showInLayerTree: false
                    }
                }]
            }, {root: true});
        }
    },

    /**
     * Add and activates a layer to the topic tree.
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} payload The payload.
     * @param {String} payload.layerId The layer id.
     * @param {Object} payload.source The layer source.
     * @param {Object} [payload.showInLayerTree=true] showInLayerTree property of the layer to set.
     * @param {Object} [payload.visibility=true] visibility property of the layer to set.
     * @returns {void}
     */
    addLayerToTopicTree: ({dispatch, rootGetters}, {layerId, source, showInLayerTree = true, visibility = true}) => {
        if (!rootGetters.layerConfigById(layerId)) {
            dispatch("addLayerToLayerConfig", {
                layerConfig: {...source, ...{
                    id: layerId,
                    showInLayerTree: showInLayerTree,
                    type: "layer",
                    visibility: visibility
                }},
                parentKey: treeSubjectsKey
            }, {root: true}).then(added => {
                if (!added) {
                    dispatch("Alerting/addSingleAlert", {
                        category: "error",
                        content: i18next.t("common:modules.searchBar.layerResultNotShown")
                    }, {root: true});
                }
                trackMatomo("Layer", "Layer added via Search", rootGetters.layerConfigById(layerId).name + " (layerId: " + layerId + ")");
            });
        }
        else {
            dispatch("activateLayerInTopicTree", {layerId, source});
            trackMatomo("Layer", "Layer added via Search", rootGetters.layerConfigById(layerId).name + " (layerId: " + layerId + ")");
        }
    },

    /**
     * Highlight feature of the search result.
     * @param {Object} param.dispatch the dispatch
     * @param {Object} payload The payload.
     * @param {Object} payload.hit The search result, must contain properties 'coordinate' as Array and 'geometryType'.
     * @returns {void}
     */
    highlightFeature: ({dispatch}, {hit}) => {
        let feature = WKTUtil.getWKTGeom(hit);

        feature = feature?.getGeometry().getType() !== "MultiPolygon" ? feature : feature?.getGeometry();

        dispatch("Maps/placingPolygonMarker", feature, {root: true});
    },

    /**
     * Opens the get feature info of the search result.
     * @param {Object} payload The payload.
     * @param {Object} payload.feature The feature to show the info for.
     * @param {Object} payload.layer The layer of the feature.
     * @returns {void}
     */
    openGetFeatureInfo: ({commit}, {feature, layer}) => {
        const gfiFeature = wmsGFIUtil.createGfiFeature(
            layer,
            "",
            feature
        );

        commit("Modules/GetFeatureInfo/setGfiFeatures", [gfiFeature], {root: true});
    },

    /**
     * Sets the marker to the feature of the search result.
     * Uses the style of GFI for highlighting multi-polygon if available.
     * @param {Object} context the vuex context
     * @param {Object} context.dispatch the dispatch
     * @param {Object} context.rootGetters the rootGetters
     * @param {Object} payload The payload.
     * @param {Array} payload.coordinates The coordinates to show marker at.
     * @param {Object} payload.feature The feature to set marker at.
     * @param {Object} payload.layer The dedicated layer.
     * @returns {void}
     */
    setMarker: ({dispatch, rootGetters}, {coordinates, feature, layer}) => {
        const numberCoordinates = coordinates?.map(coordinate => parseFloat(coordinate, 10)),
            geomType = feature?.getGeometry()?.getType();
        let coordinateForMarker = geomType === "GeometryCollection" ? markerHelper.getFirstPointCoordinates(feature, numberCoordinates) : numberCoordinates;

        if (layer && geomType === "MultiPolygon") {
            const highlightObject = {},
                highlightVectorRules = rootGetters["Modules/GetFeatureInfo/highlightVectorRules"],
                styleObject = highlightVectorRules ? highlightVectorRules : styleList.returnStyleObject("defaultMapMarkerPolygon"),
                style = styleObject.rules ? styleObject.rules[0].style : styleObject.style,
                fill = {
                    color: `rgb(${style.polygonFillColor.join(", ")})`
                },
                stroke = {
                    color: `rgb(${style.polygonStrokeColor.join(", ")})`,
                    width: style.polygonStrokeWidth[0]
                };

            highlightObject.highlightStyle = {fill, stroke};
            highlightObject.type = "highlightMultiPolygon";
            highlightObject.feature = feature;
            highlightObject.styleId = layer.get("styleId");
            dispatch("Maps/highlightFeature", highlightObject, {root: true});
        }
        if (feature && geomType === "Polygon" || geomType === "MultiPolygon") {
            const isPointInsidePolygon = markerHelper.checkIsCoordInsidePolygon(feature, coordinateForMarker);

            if (!isPointInsidePolygon) {
                coordinateForMarker = markerHelper.getRandomCoordinate(feature.getGeometry().getCoordinates());
            }
        }
        dispatch("Maps/placingPointMarker", coordinateForMarker, {root: true});
    },


    /**
     * Open folders in layerSelection and shows layer or folder to select.
     * If layer is not contained, it is added.
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {String} payload.layerId The layer id.
     * @param {String} payload.source The layer source from search result.
     * @returns {void}
     */
    showInTree: async ({commit, dispatch}, {layerId, source}) => {
        const layerConfig = await dispatch("retrieveLayerConfig", {layerId, source}),
            typeLayerSelection = {type: "layerSelection", props: {name: "common:modules.layerSelection.name"}};

        commit("setShowInTree", true);
        commit("Menu/setNavigationHistoryBySide", {side: "mainMenu", newHistory: [{type: "root", props: []}, typeLayerSelection]}, {root: true});
        dispatch("Menu/changeCurrentComponent", {type: "layerSelection", side: "mainMenu", props: {name: "common:modules.layerSelection.name"}}, {root: true});
        if (layerId.includes("folder-")) {
            const folderChildId = layerConfig.elements[0]?.id;

            dispatch("Modules/LayerSelection/showLayer", {layerId: folderChildId}, {root: true});
            // unset the highlightLayerId in layerSelection, for not highlighting first child element of folder
            commit("Modules/LayerSelection/setHighlightLayerId", null, {root: true});
        }
        else if (layerConfig) {
            dispatch("Modules/LayerSelection/showLayer", {layerId}, {root: true});
        }
        else {
            console.warn("Cannot show layer with id ", layerId, ": is not contained in services.json");
            dispatch("Alerting/addSingleAlert", {
                category: "info",
                content: i18next.t("common:modules.searchBar.layerResultNotShown")
            }, {root: true});
        }

    },

    /**
     * Open the layer information.
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} payload The payload.
     * @param {String} payload.layerId The layer id.
     * @param {String} payload.source The layer source from search result.
     * @returns {void}
     */
    showLayerInfo: async ({commit, dispatch}, {layerId, source}) => {
        const layerConfig = await dispatch("retrieveLayerConfig", {layerId, source});

        if (layerConfig) {
            dispatch("Modules/LayerInformation/startLayerInformation", layerConfig, {root: true});
            commit("Modules/LayerSelection/setLayerInfoVisible", true, {root: true});
        }
        else {
            console.warn("Cannot show info for layer with id ", layerId, ": is not contained in services.json");
            dispatch("Alerting/addSingleAlert", {
                category: "info",
                content: i18next.t("common:modules.searchBar.layerInfoNotShown")
            }, {root: true});
        }
    },

    /**
     * Returns the layerConfig for the given id.
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} payload The payload.
     * @param {String} payload.layerId The layer id.
     * @param {String} payload.source The layer source from search result.
     * @returns {Object} the layerConfig
     */
    retrieveLayerConfig: ({dispatch, rootGetters}, {layerId, source}) => {
        let layerConfig = rootGetters.layerConfigById(layerId);

        if (!layerConfig && layerId.includes("folder-")) {
            layerConfig = rootGetters.folderById(layerId);
        }
        if (!layerConfig) {
            layerConfig = rawLayerList.getLayerWhere({id: layerId});
            if (source) {
                dispatch("addLayerToTopicTree", {layerId, source: source, showInLayerTree: false, visibility: false});
                layerConfig = rootGetters.layerConfigById(layerId);
            }
        }
        if (!layerConfig && source) {
            dispatch("addLayerToTopicTree", {layerId, source: source, showInLayerTree: false, visibility: false});
            layerConfig = rootGetters.layerConfigById(layerId);
        }
        return layerConfig;
    },

    /**
     * Starts the routing module and sets the routing start point to search result.
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} payload The payload.
     * @param {Array} payload.coordinates The coordinates to start the route from.
     * @param {String} payload.name The name of the search result.
     * @returns {void}
     */
    startRouting: ({dispatch, rootGetters}, {coordinates, name}) => {
        const menuSide = "secondaryMenu",
            menuExpanded = "Menu/expanded";

        dispatch("Menu/changeCurrentComponent", {type: "routing", side: menuSide, props: {name: i18next.t("common:modules.routing.name")}}, {root: true});
        if (!rootGetters[menuExpanded](menuSide)) {
            dispatch("Menu/toggleMenu", menuSide, {root: true});
        }
        dispatch("Modules/Routing/setFirstWayPoint", {displayName: name, coordinates}, {root: true});
    },

    /**
     * Zoom to the coordinates of the search result.
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.getters the getters
     * @param {Object} payload The payload.
     * @param {Array} payload.coordinates The coordinates to zoom to.
     * @returns {void}
     */
    zoomToResult: ({dispatch, getters}, {coordinates}) => {
        const numberCoordinates = coordinates?.map(coordinate => parseFloat(coordinate, 10));

        if (numberCoordinates.length === 4) {
            const map = mapCollection.getMap("2D"),
                view = map.getView(),
                zoom = numberCoordinates ? view.getZoomForResolution(view.getResolutionForExtent(numberCoordinates, map.getSize())) : null;

            dispatch("Maps/zoomToExtent", {extent: numberCoordinates, options: {maxZoom: zoom}}, {root: true});
        }
        else {
            dispatch("Maps/zoomToCoordinates", {center: numberCoordinates, zoom: getters.zoomLevel}, {root: true});
        }

    }
};
