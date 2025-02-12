/**
 * The state of the CoordToolkit.
 * @module  modules/coordToolkit/store/stateCoordToolkit
 * @property {String} [description="common:modules.coordToolkit.description"] The description that should be shown in the button in the menu.
 * @property {Boolean} [hasMouseMapInteractions=true] If this attribute is true, then all other modules will be deactivated when this attribute is also true. Only one module with this attribute true may be open at the same time, since conflicts can arise in the card interactions.
 * @property {String} [icon="bi-globe"] icon next to title (config-param)
 * @property {String} [name="common:modules.coordToolkit.name"] displayed as title (config-param)
 * @property {String[]} [supportedDevices=["Desktop", "Mobile", "Table"]] Devices on which the module is displayed.
 * @property {String[]} [supportedMapModes=["2D", "3D"]] Map mode in which this module can be used.
 * @property {String} [type= "coordToolkit"] the type of the component *
 * @property {Object} [coordinatesEasting="{id: "easting", value: ""}"] contains id and value of the easting input field
 * @property {String} [coordinatesEastingExample=""] contains the example for easting coordinates
 * @property {Object} coordInfo contains the explanations for the coordinate reference systems
 * @property {Object} [coordinatesNorthing="{id: "northing", value: ""}"] contains id and value of the northing input field
 * @property {String} coordinatesNorthingExample contains the example for northing coordinates
 * @property {Object} [currentProjection="{id: "http://www.opengis.net/gml/srs/epsg.xml#25832", name: "EPSG:25832", projName: "utm"}"] the current projection
 * @property {String} [delimiter="|"] delimits the copies coordinates
 * @property {Boolean} [eastingNoCoord="false"] true, if no coord in easting input field
 * @property {Boolean} [eastingNoMatch="false"] true, if coord in easting are not valid
 * @property {Boolean} [northingNoCoord="false"] true, if no coord in northing input field
 * @property {Boolean} [northingNoMatch="false"] true, if coord in northing are not valid
 * @property {String} [height=""] contains the value of the height input field
 * @property {String} heightElementName element name in the response of getFeatureRequest of height layer
 * @property {String} [heightInfoFormat="application/vnd.ogc.gml"] infoFormat of the layers getFeatureRequest
 * @property {module:ol/Layer} heightLayer must be set in config.json to display the height. The layer to get the height from.
 * @property {String} heightLayerId id of the layer to get the height from
 * @property {String} heightLayerInfo contains the info text for the height layer
 * @property {String} heightValueBuilding value in the response of getFeatureRequest of height layer, if there is building area
 * @property {String} heightValueWater value in the response of getFeatureRequest of height layer, if there is water area
 * @property {Object} mapProjection projection of the map
 * @property {String} [mode="supply"] may be 'search' or 'supply'
 * @property {Number[]} [positionMapProjection=[]] position of the projection in the map
 * @property {Object[]} [projections=[]] list of available projections
 * @property {Array} [selectedCoordinates=[]] contains the selected coordinates
 * @property {module:ol/interaction/Pointer} selectPointerMove contains interaction listener to map
 * @property {Boolean} [showCopyButtons="true"] if true, copy-buttons are shown
 * @property {Boolean} [updatePosition="true"] if true, position is updated in tool
 * @property {String} [zoomLevel="7"] used by search
 */
const state = {
    icon: "bi-globe",
    description: "common:modules.coordToolkit.description",
    hasMouseMapInteractions: true,
    name: "common:modules.coordToolkit.name",
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D", "3D"],
    type: "coordToolkit",

    coordinatesEasting: {id: "easting", value: ""},
    coordinatesNorthing: {id: "northing", value: ""},
    coordinatesEastingExample: "",
    coordinatesNorthingExample: "",
    coordInfo: null,
    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#25832", name: "EPSG:25832", projName: "utm"},
    delimiter: "|",
    eastingNoCoord: false,
    eastingNoMatch: false,
    height: "common:modules.coordToolkit.hintSupply",
    heightElementName: null,
    heightInfoFormat: "application/vnd.ogc.gml",
    heightLayer: null,
    heightLayerId: null,
    heightLayerInfo: null,
    heightValueBuilding: null,
    heightValueWater: null,
    mapProjection: null,
    mode: "supply",
    northingNoCoord: false,
    northingNoMatch: false,
    positionMapProjection: [],
    projections: [],
    showCopyButtons: true,
    selectedCoordinates: [],
    selectPointerMove: null,
    updatePosition: true,
    zoomLevel: 7
};

export default state;
