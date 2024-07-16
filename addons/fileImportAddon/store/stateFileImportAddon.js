/**
 * User type definition
 * @typedef {Object} FileImportAddonState
 * @property {Boolean}  active - if true, component is rendered
 * @property {Boolean}  deactivateGFI - if true, component activation deactivates gfi component
 * @property {String}   icon - icon next to title
 * @property {String}   id - internal id of component
 * @property {String}   name - Module name
 * @property {Boolean}  renderToWindow - if true, component is rendered in a window pane instead of sidebar
 * @property {Boolean}  resizableWindow - if true and if rendered to window pane, the pane is resizable
 * @property {String}   selectedFiletype - This controls, which openlayers format is used when displaying the file data. Using "auto" will result in selecting one format according to the filename's suffix.
 * @property {String[]}   importedFileNames - list of names of successfully imported files
 * @property {Object}   supportedFiletypes - Configuration object which is used to generate the selectedFiletype radio form from.
 * @property {String}   title - Module title
 */

export default {
    active: false,
    deactivateGFI: false,
    icon: "bi-file-earmark-arrow-up-fill",
    id: "fileImportAddon",
    name: "KML-Datei laden",
    pointImages: {
        black: ["cc000000", "/img/tools/draw/circle_black.svg"],
        blue: ["cc0000FF", "/img/tools/draw/circle_blue.svg"],
        green: ["cc00FF00", "/img/tools/draw/circle_green.svg"],
        yellow: ["cc00FFFF", "/img/tools/draw/circle_yellow.svg"],
        red: ["ccFF0000", "/img/tools/draw/circle_red.svg"],
        white: ["ccFFFFFF", "/img/tools/draw/circle_white.svg"]
    },
    textColors: {
        schwarz: "cc000000",
        blau: "ccFF0000",
        gruen: "cc00FF00",
        gelb: "cc00FFFF",
        rot: "cc0000FF",
        weiss: "ccFFFFFF"
    },
    textSizes: {
        klein: 1,
        mittel: 1.15,
        gross: 1.3
    },
    onlyDesktop: true,
    renderToWindow: true,
    resizableWindow: false,
    selectedFiletype: "auto",
    importedFileNames: [],
    supportedFiletypes: {
        auto: {
            caption: "additional:modules.tools.FileImportAddon.captions.supportedFiletypes.auto"
        },
        kml: {
            caption: "additional:modules.tools.FileImportAddon.captions.supportedFiletypes.kml",
            rgx: /\.kml$/i
        },
        gpx: {
            caption: "additional:modules.tools.FileImportAddon.captions.supportedFiletypes.gpx",
            rgx: /\.gpx$/i
        },
        geojson: {
            caption: "additional:modules.tools.FileImportAddon.captions.supportedFiletypes.geojson",
            rgx: /\.(geo)?json$/i
        }
    },
    title: "KML-Datei laden"
};
