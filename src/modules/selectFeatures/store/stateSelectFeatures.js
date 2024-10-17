/**
 * User type definition
 * @typedef {Object} SelectFeaturesState
 * @property {String} description The description that should be shown in the button in the menu.
 * @property {Boolean} hasMouseMapInteractions If this attribute is true, then all other modules will be deactivated when this attribute is also true. Only one module with this attribute true may be open at the same time, since conflicts can arise in the card interactions.
 * @property {String} name displayed as title (config-param)
 * @property {String} icon icon next to title (config-param)
 * @property {module:ol/Collection} selectedFeatures the selected Features Collection
 * @property {Array} selectedFeaturesWithRenderInformation the selected Features with RenderInformation Array
 * @property {module:ol/interaction/Select} selectInteraction the ol Select interaction
 * @property {module:ol/interaction/DragBox} dragBoxInteraction the ol DragBox interaction
 * @property {Object} highlightVectorRulesPolygon the default configuration for polygon highlighting
 * @property {Object} highlightVectorRulesPointLine the default configuration for point or line highlighting
 */
const state = {
    description: "common:modules.selectFeatures.description",
    hasMouseMapInteractions: true,
    type: "selectFeatures",
    name: "common:modules.selectFeatures.name",
    icon: "bi-hand-index",
    selectedFeatures: undefined,
    selectedFeaturesWithRenderInformation: [],
    selectInteraction: undefined,
    dragBoxInteraction: undefined,
    highlightVectorRulesPolygon: {
        "fill": {
            "color": [255, 255, 0, 0.9]
        },
        "stroke": {
            "width": 4,
            "color": [255, 255, 0, 0.9]
        },
        "zoomLevel": 7
    },
    highlightVectorRulesPointLine: {
        "stroke": {
            "width": 8,
            "color": [255, 255, 0, 0.9]
        },
        "image": {
            "scale": 2
        },
        "zoomLevel": 7
    }
};

export default state;
