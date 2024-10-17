import VectorLayer from "ol/layer/Vector.js";

import style from "../js/measureStyle";
import source from "../js/measureSource";

/**
 * Measure tool state definition.
 * @typedef {Object} MeasureState
 * @property {String} description The description that should be shown in the button in the menu.
 * @property {String} name displayed as title (config-param)
 * @property {Boolean} hasMouseMapInteractions If this attribute is true, then all other modules will be deactivated when this attribute is also true. Only one module with this attribute true may be open at the same time, since conflicts can arise in the card interactions.
 * @property {String} icon icon next to title (config-param)
 * @property {Number} earthRadius earth radius to assume for length/area calculations (config-param)
 * @property {String} measurementAccuracy indicates how accurately the measurement result is displayed for m and m².
 *                                        Options are "decimeter" for one decimal place. "meter" for no decimal place.
 *                                        And "dynamic" for one decimal place for results smaller 10m / 10m² and
 *                                        no decimal place for results greater or equal 10m / 10m²
 * @property {object<String, module:ol/Feature>} lines line features by ol_uid
 * @property {object<String, module:ol/Feature>} polygons polygon features by ol_uid
 * @property {String[]} geometryValues Available geometry values for measurement selection
 * @property {String[]} geometryValues3d Available geometry values for measurement selection in 3D mode
 * @property {String[]} lineStringUnits Available units for line measurement
 * @property {String[]} polygonUnits Available units for polygon measurement
 * @property {String} selectedGeometry Selected geometry value for measurement
 * @property {String} selectedLineStringUnit Selected unit by stringified index ("0"/"1").
 * @property {String} selectedPolygonUnit Selected unit by stringified index ("0"/"1").
 * @property {function[]} unlisteners unlisten methods to execute before source clear
 * @property {(module:ol/Interaction|MeasureDraw3d)} interaction current interaction on map or 3d model, if any
 * @property {module:ol/vector/Source} source draw layer source
 * @property {module:ol/vector/Layer} layer draw layer
 * @property {String} featureId ol_uid of the current feature
 * @property {Number[]} tooltipCoord coordinates to show the tooltip at
 */
const state = {
    // defaults for config.json tool parameters
    description: "common:modules.measure.description",
    name: "common:modules.measure.name",
    hasMouseMapInteractions: true,
    icon: "bi-arrows-angle-expand",
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D"],
    type: "measure",

    // tool-specific config.json parameters
    earthRadius: 6378137,
    measurementAccuracy: "meter",

    // measure form state and UI
    lines: {},
    polygons: {},
    geometryValues: ["LineString", "Polygon"],
    lineStringUnits: ["m", "km"],
    polygonUnits: ["m²", "km²"],
    selectedGeometry: "LineString",
    selectedLineStringUnit: "0",
    selectedPolygonUnit: "0",
    unlisteners: [],
    isDrawing: false,

    // measure layer and ol
    interaction: null,
    source,
    layer: new VectorLayer({
        source,
        style,
        id: "measureLayer",
        name: "measureLayer",
        alwaysOnTop: true
    }),
    featureId: null,
    tooltipCoord: []
};

export default state;
