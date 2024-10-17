import {
    LineString,
    MultiLineString,
    MultiPoint,
    MultiPolygon,
    LinearRing,
    Point,
    Polygon
} from "ol/geom";

/**
 * Injects OpenLayers geom classes to JSTS Parser
 *
 * @returns {void}
 */
function initJSTSParser ({getters}) {
    // inject possible geometries to jsts parser
    getters.jstsParser.inject(
        Point,
        LineString,
        LinearRing,
        Polygon,
        MultiPoint,
        MultiLineString,
        MultiPolygon
    );
}
/**
 * Initially loads all available options for select elements
 *
 * @return {void}
 */
function loadSelectOptions ({commit, rootGetters, getters}) {
    const allWFSLayerConfigs = [],
        layerConfigs = rootGetters.allSubjectDataLayerConfigs;

    layerConfigs.forEach(layer => {
        if (layer.typ === "WFS") {
            allWFSLayerConfigs.push(layer);
        }
    });


    allWFSLayerConfigs.forEach(layer => {
        if (!getters.selectOptions.includes(layer)) {
            commit("addSelectOption", layer);
        }
    });
}

export {
    initJSTSParser,
    loadSelectOptions
};
