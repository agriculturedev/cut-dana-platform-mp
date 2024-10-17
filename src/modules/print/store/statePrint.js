/**
 * Print Tool
 * @typedef {Object} PrintState
 * @property {String} description The description that should be shown in the button in the menu.
 * @property {String} filename output filename
 * @property {String} icon icon of the print
 * @property {String} name name of the print
 * @property {String[]} supportedDevices Devices on which the module is displayed.
 * @property {String[]} supportedMapModes Map mode in which this module can be used.
 * @property {String} title title for the report
 * @property {String} type type of the Print component
 *
 * @property {String} printServiceId the id from the rest services json for the print app
 * @property {Object} printSettings print settings from the config.json
 * @property {String} printService the type of print service, mapfish and plotservice currently possible
 * @property {String} printAppId the identifier of one of the available mapfish print configurations
 * @property {String} printAppCapabilities URL for the page in the print service where the informations of layouts etc are,
 * @property {Array} layoutList the identifier of one of the available mapfish print configurations
 * @property {Array} additionalLayers list of Layers that can be added in the print
 * @property {Object} currentLayout the current layout
 * @property {String} currentLayoutName the current layout's name
 * @property {Array} formatList available formats of the specified print configuration
 * @property {Array} invisibleLayer contains layers that are not displayed in the current scale,
 * @property {Array} invisibleLayerNames contains names of layers that are not displayed in the current scale,
 * @property {Array} scaleList available scales of the specified print configuration
 * @property {String} currentScale current print scale
 * @property {Boolean} isScaleSelectedManually is scale selected by the user over the view
 * @property {Boolean} isMetaDataAvailable true if the current layout supports meta data
 * @property {Boolean} isGfiAvailable true if the current layout supports gfi
 * @property {Boolean} isGfiSelected true if gfi is to be printed
 * @property {Boolean} is3d true if map mode is 3D
 * @property {Boolean} isGfiActive true if gfi is active
 * @property {Boolean} isIncreased3DResolutionSelected true if the 3d resolution is increased
 * @property {Boolean} isLegendAvailable true if the current layout supports legend
 * @property {Boolean} isLegendSelected true if the legend is to be printed
 * @property {Boolean} isScaleAvailable true if the current layout supports scale
 * @property {Boolean} isScaleFixed true if the current layout supports scale
 * @property {Boolean} isMapAvailable true if the Map is available
 * @property {Object} mapAttribute Attributes from the Map set from the layout
 * @property {Array} layoutMapInfo width and height of the map
 * @property {Array} optimalScale the optimal scale for the print
 * @property {Event} eventListener the event listener for postrender
 * @property {function} eventListener3d the event listener remover for Cesium postrender
 * @property {Integer} dpiList optional list of available dpi values as propagated by mapfish
 * @property {Integer} dpiForPdf dpi value to be used when generating the printout
 * @property {Array} layoutNameList the layouts
 * @property {Integer} currentMapScale the current map Scale
 * @property {Sring} progressWidth the style String for the progress bar
 * @property {Sring} outputFormat the ending of the generated file,
 * @property {Integer} plotserviceIndex index for the file downloads for High Resolution Plot Service
 * @property {Object} capabilitiesFilter filter for the response of the configured print service. Possible keys are layouts and outputFormats
 * @property {Object} defaultCapabilitiesFilter If there is no key set in capabilitiesFilter, the key from this object is taken
 * @property {String} overviewmapLayerId the layer id for the overviewmap
 * @property {Boolean} [showInvisibleLayerInfo=true] Defines whether an infobox is shown when layers will not be printed because they are invisible due to scale.
 */
const state = {
    description: "common:modules.print.description",
    filename: "report",
    icon: "bi-printer",
    name: "common:modules.print.name",
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D", "3D"],
    title: "PrintResult",
    type: "print",
    additionalLayers: [],
    autoAdjustScale: true,
    currentFormat: "pdf",
    capabilitiesFilter: {},
    currentLayout: undefined,
    currentLayoutName: "A4 Hochformat",
    currentMapScale: "",
    currentScale: undefined,
    currentScaleUrlParams: undefined,
    defaultCapabilitiesFilter: {},
    dpiForPdf: 200,
    dpiList: [],
    DOTS_PER_INCH: 72,
    eventListener: undefined,
    eventListener3d: undefined,
    fileDownloads: [],
    fileDownloadUrl: "",
    formatList: ["gif", "pdf", "png", "svg", "tif", "tiff"],
    gfiAttribute: null,
    gfiForPrint: null,
    hintInfo: "",
    hintInfoScale: "",
    INCHES_PER_METER: 39.37,
    invisibleLayer: [],
    invisibleLayerNames: [],
    is3d: false,
    isGfiActive: false,
    isGfiAvailable: false,
    isGfiSelected: false,
    isIncreased3DResolutionSelected: false,
    isLegendAvailable: false,
    isLegendSelected: false,
    isMapAvailable: false,
    isMetadataAvailable: false,
    isScaleAvailable: false,
    isScaleSelectedManually: false,
    layoutList: [],
    layoutMapInfo: [],
    layoutNameList: [],
    legendAttribute: null,
    mapAttribute: null,
    metadataAttribute: null,
    optimalResolution: "",
    optimalScale: null,
    outputFormat: "pdf",
    overviewmapLayerId: undefined,
    plotserviceIndex: -1,
    printAppCapabilities: "capabilities.json",
    printAppId: "master",
    printFileReady: false,
    printMapMarker: false,
    printService: "mapfish",
    printServiceId: "",
    printStarted: false,
    progressWidth: "width: 0%",
    scaleAttribute: null,
    scaleList: [],
    showInvisibleLayerInfo: true,
    serviceUrl: "",
    serviceId: "",
    visibleLayer: [],
    visibleLayerList: [],
    zoomLevel: null
};

export default state;
