/**
 * User type definition
 * @typedef {Object} Modeler3DState
 * @property {Boolean}      active - if true, component is rendered
 * @property {Object[]}     activeShapePoints - Holds the positions of the currently selected shape
 * @property {Boolean}      adaptToHeight - if true, adjust height automatically on position change
 * @property {Number}       coordinateEasting - the raw transformed easting coordinate displayed on the ui
 * @property {Number}       coordinateNorthing - the raw transformed northing coordinate displayed on the ui
 * @property {Object}       currentLayout - The current draw layout with all current values
 * @property {String}       currentModelId - id of the currently selected or added model
 * @property {Cartesian3}   currentModelPosition - position of the currently selected or added model
 * @property {Object}       currentProjection - the currently selected projection
 * @property {String}       cylinderId - the id of the currently selected cylinder
 * @property {Boolean}      deactivateGFI - if true, component activation deactivates gfi component
 * @property {String}       drawName name of drawing model
 * @property {Number}       drawRotation angle of a selected drawn entity
 * @property {Object[]}     drawnModels - a list of currently active drawn models
 * @property {String[]}     drawTypes - an array of supported draw types
 * @property {Number}       extrudedHeight height in meters for drawing model
 * @property {String}       gmlIdPath - the GFI path to the gml Id
 * @property {Number}       height - the raw transformed height coordinate displayed on the ui
 * @property {Object[]}     hiddenObjects - array of hidden objects
 * @property {Boolean}      hideObjects - if true, user can hide TileFeatures with click
 * @property {Object}       highlightStyle default style for highlighting models
 * @property {String}       highlightStyle.silhouetteColor default color of highlighted models silhouette
 * @property {Number}       highlightStyle.size default size for silhouette of highlighted model
 * @property {Number}       highlightTimeout - id of timeout function for highlighting
 * @property {String}       icon - icon next to title
 * @property {String}       id - internal id of component
 * @property {Object[]}     importedModels - array of imported 3D models
 * @property {Boolean}      isDragging - if true, entity is being moved by mouse
 * @property {Boolean}      isDrawing- true if drawing is active
 * @property {Boolean}      isLoading- true if loading of imported model is active
 * @property {String}       name - Module name
 * @property {String}       newFillColor - selected fill color for drawn entity
 * @property {String}       newStrokeColor - selected outline color for drawn entity
 * @property {Float}        opacity - selected opactiy for drawing model
 * @property {Boolean}      povActive- true if switch for pov view is active
 * @property {Object[]}     projections - all available projections
 * @property {Boolean}      renderToWindow - if true, component is rendered in a window pane instead of sidebar
 * @property {Boolean}      resizableWindow - if true and if rendered to window pane, the pane is resizable
 * @property {Number}       rotation - the current rotation value
 * @property {Number}       scale - the scale of the current model
 * @property {String}       selectedDrawType - selected geometry for drawing 3d object
 * @property {String}       selectedFillColor - selected fill color for drawing 3d object
 * @property {String}       selectedOutlineColor - selected outline color for drawing 3d object
 * @property {Boolean}      updateAllLayers - if hiding objects should update all layers
 * @property {Boolean}      clampToGround - if it is set to clamp to ground
 * @property {Boolean}      dimensions - if the dimensions are shown
 * @property {Object[]}     importedEntities - the imported entities
 */

export default {
    icon: "bi-bounding-box",
    description: "common:modules.modeler3D.description",
    hasMouseMapInteractions: true,
    name: "common:modules.modeler3D.name",
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["3D"],
    type: "modeler3D",

    activeShapePoints: [],
    adaptToHeight: true,
    clampToGround: true,
    coordinateEasting: 0,
    coordinateNorthing: 0,
    currentLayout: {
        fillColor: [255, 255, 255],
        fillTransparency: 0,
        strokeColor: [0, 0, 0],
        strokeWidth: 1,
        extrudedHeight: 20
    },
    currentModelId: null,
    currentModelPosition: null,
    currentProjection: {id: "http://www.opengis.net/gml/srs/epsg.xml#25832", name: "EPSG:25832", projName: "utm"},
    currentView: "modeler-import",
    cylinderId: null,
    dimensions: true,
    drawDepth: 0,
    drawIcons: {
        rectangle: "bi-square",
        line: "bi-slash-lg",
        polygon: "bi-octagon"
    },
    drawName: "",
    drawnModels: [],
    drawModelTypes: ["rectangle"],
    drawRotation: 0,
    drawTypes: ["rectangle", "line", "polygon"],
    extrudedHeight: 20,
    gmlIdPath: "gmlid",
    height: 0,
    hiddenObjects: [],
    hiddenObjectsWithLayerId: [],
    hideObjects: false,
    highlightStyle: {
        silhouetteColor: "#E20D0F",
        silhouetteSize: 4
    },
    highlightTimeout: null,
    importedEntities: [],
    importedModels: [],
    isApplyingState: false,
    isDragging: false,
    isDrawing: false,
    isLoading: false,
    lineWidth: 2,
    movingEntity: false,
    newFillColor: "",
    newStrokeColor: "",
    opacity: 1,
    povActive: false,
    projections: [],
    rectDepth: 0,
    rectWidth: 0,
    rotation: 0,
    scale: 1,
    selectedDrawModelType: "",
    selectedDrawType: "",
    selectedFillColor: "",
    selectedOutlineColor: "",
    updateAllLayers: true,
    useAnchorMove: true
};
