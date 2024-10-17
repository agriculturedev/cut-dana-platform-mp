/**
 * User type definition
 * @typedef {Object} LayerClusterTogglerState
 * @property {Boolean} active If true, component is rendered
 * @property {String} description The description that should be shown in the button in the menu.
 * @property {String} icon Icon next to title
 * @property {String} name Module name
 * @property {String} type The type of component
 *
 * @property {Boolean} isToggled Specifies whether all layers of the layerIdList should be switched on or off.
 * @property {String[]} layerIdList A list of layer ids to activate/deactivate with one single click
 */

export default {
    active: false,
    description: "common:modules.layerClusterToggler.description",
    icon: "bi-list",
    name: "common:modules.layerClusterToggler.name",
    type: "layerClusterToggler",

    isToggled: true,
    layerIdList: []
};
