/**
 * User type definition
 * @typedef {Object} OrientationState
 * @property {String} iconGeolocate Icon of the orientation geolocate button.
 * @property {String} iconGeolocatePOI Icon of the orientation geolocate POI button.
 * @property {String[]} poiDistances The distances in config.json.
 * @property {String[]} supportedDevices Devices on which the module is displayed.
 * @property {String[]} supportedMapModes Map mode in which this module can be used.
 * @property {String} zoomMode The zoomMode in config.json.
 * @property {String} activeCategory The active tab in the overview table.
 * @property {String} geolocation The current geolocation.
 * @property {Boolean} onlyFilteredFeatures If true the filtered features will be used.
 * @property {String} poiMode The mode for showing the nearby pois.
 * @property {String} customPosition Contains the path for the translation file.
 * @property {Boolean} poiModeCurrentPositionEnabled The status if poi mode is current position.
 * @property {String} position The current position.
 * @property {Boolean} showPoi Wether POI should be shown.
 * @property {Boolean} showPoiChoice Wether poi choice is activated.
 * @property {Boolean} showPoiIcon Wether to show the poi icon.
 */
const state = {
    iconGeolocate: "geo-alt",
    iconGeolocatePOI: "record-circle",
    poiDistances: [],
    supportedDevices: ["Desktop", "Mobile"],
    supportedMapModes: ["2D", "3D"],
    zoomMode: "once",

    activeCategory: "",
    geolocation: null,
    onlyFilteredFeatures: false,
    poiMode: "currentPosition",
    customPosition: "common:modules.controls.orientation.poiChoiceCustomPosition",
    poiModeCurrentPositionEnabled: true,
    position: null,
    showPoi: false,
    showPoiChoice: false,
    showPoiIcon: false
};

export default state;

