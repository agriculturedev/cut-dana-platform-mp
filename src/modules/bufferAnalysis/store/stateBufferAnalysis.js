import GeoJSONWriter from "jsts/org/locationtech/jts/io/GeoJSONWriter";
import OL3Parser from "jsts/org/locationtech/jts/io/OL3Parser";
import {Fill, Stroke, Style} from "ol/style";
import {ResultType} from "./enums";

/**
 * User type definition
 * @typedef {Object} BufferAnalysisState
 * @property {String} description The description that should be shown in the button in the menu.
 * @property {String} name displayed as title (config-param)
 * @property {String} icon icon next to title (config-param)
 * @property {String} type type of the BufferAnalysis component
 *
 * @property {Object} bufferLayer holds the layer with buffer features
 * @property {Number} bufferRadius data binding for the buffer radius input
 * @property {Object} bufferStyle holds the default style for buffer features
 * @property {Object} geoJSONWriter holds the JSTS geoJSON writer
 * @property {Object[]} intersections holds the intersection polygons after calculation
 * @property {Object} jstsParser holds the JSTS parser
 * @property {Object[]} resultFeatures holds the result features before they are added to a new layerSource
 * @property {Object} resultLayer holds the layer with result features
 * @property {ResultType} resultType possible values: "OUTSIDE" or "WITHIN"
 * @property {?String} savedUrl data binding for saved url field
 * @property {Object[]} selectOptions holds the options for layer select elements
 * @property {?Object} selectedSourceLayer data binding for source layer selection
 * @property {?Object} selectedTargetLayer data binding for target layer selection
 * @property {String} timerId timerId for debounce buffer radius input
 */
const state = {
    description: "common:modules.bufferAnalysis.description",
    icon: "bi-arrows-angle-expand",
    name: "common:modules.bufferAnalysis.name",
    type: "bufferAnalysis",
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D", "3D"],

    bufferLayer: {},
    bufferRadius: 0,
    bufferStyle: new Style({
        fill: new Fill({
            color: ["255", "230", "65", "0.3"]
        }),
        stroke: new Stroke({
            color: ["255", "50", "0", "0.5"],
            width: 2
        })
    }),
    geoJSONWriter: new GeoJSONWriter(),
    inputBufferRadius: 0,
    intersections: [],
    jstsParser: new OL3Parser(),
    resultFeatures: [],
    resultLayer: {},
    resultType: ResultType.OUTSIDE,
    savedUrl: null,
    selectOptions: [],
    selectedSourceLayer: null,
    selectedTargetLayer: null,
    timerId: null
};

export default state;
