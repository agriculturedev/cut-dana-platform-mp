/**
 * User type definition
 * @typedef {Object} FileImportState
 * @property {String} description The description that should be shown in the button in the menu.
 * @property {Boolean}  enableZoomToExtend - If true, it is enable to zoom to features of the imported file.
 * @property {Object}   featureExtents - the Feature Extents.
 * @property {String}   icon - icon next to title
 * @property {String[]} importedFileNames - list of names of successfully imported files
 * @property {Object}   layer - the layer
 * @property {String}   layerId - the layer id
 * @property {String}   name - Displayed as title (config-param)
 * @property {String}   selectedFiletype - This controls, which openlayers format is used when displaying the file data. Using "auto" will result in selecting one format according to the filename's suffix.
 * @property {Boolean}  customStylingOption - Indicates whether the possibility to style GeoJSON features at import (AttributeStyler) shall be displayed or not.
 * @property {String[]} supportedDevices Devices on which the module is displayed.
 * @property {Object}   supportedFiletypes - Configuration object which is used to generate the selectedFiletype radio form from.
 * @property {String[]} supportedMapModes - Map mode in which this module can be used.
 * @property {String}   type - The type of the module.
 * @property {Object}   gfiAttributes - All attributes that should be shown in the GFI.
 * @property {Object}   customAttributeStyles - All custom styles set by the user.
 * @property {Number}   geojsonFeatureId - Id of the last added feeature of a GeoJson.
 * @property {Boolean}  showConfirmation - If true, a confirmation window will be shown.
 */

export default {
    description: "common:modules.fileImport.description",
    enableZoomToExtend: false,
    featureExtents: {},
    icon: "bi-box-arrow-in-down",
    importedFileNames: [],
    layer: undefined,
    layerId: "importDrawLayer",
    name: "common:modules.fileImport.name",
    selectedFiletype: "auto",
    customStylingOption: false,

    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedFiletypes: {
        auto: {
            caption: "common:modules.fileImport.captions.supportedFiletypes.auto"
        },
        kml: {
            caption: "common:modules.fileImport.captions.supportedFiletypes.kml",
            rgx: /\.kml$/i
        },
        gpx: {
            caption: "common:modules.fileImport.captions.supportedFiletypes.gpx",
            rgx: /\.gpx$/i
        },
        geojson: {
            caption: "common:modules.fileImport.captions.supportedFiletypes.geojson",
            rgx: /\.(geo)?json$/i
        }
    },
    supportedMapModes: ["2D", "3D"],
    type: "fileImport",
    gfiAttributes: {},
    customAttributeStyles: {},
    geojsonFeatureId: 0,
    showConfirmation: true
};
