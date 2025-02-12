/**
 * The state of the CompareMaps.
 * @module  modules/compareMaps/store/stateCompareMaps
 * @property {String} [description="common:modules.compareMaps.description"] The description that should be shown in the button in the menu.
 * @property {Boolean} [hasMouseMapInteractions=true] If this attribute is true, then all other modules will be deactivated when this attribute is also true. Only one module with this attribute true may be open at the same time, since conflicts can arise in the card interactions.
 * @property {String} [icon="bi-globe"] Icon next to title (config-param).
 * @property {String} [name="common:modules.compareMaps.name"] Displayed as title (config-param).
 * @property {String[]} [supportedDevices=["Desktop", "Mobile", "Table"]] Devices on which the module is displayed.
 * @property {String[]} [supportedMapModes=["2D"]] Map mode in which this module can be used.
 * @property {String} [type="compareMaps"] The type of the component.
 * @property {String[]} [layerNames=[]] Names of the available layers to be compared.
 * @property {String} [selectedLayer1Id=""] ID of the first selected layer.
 * @property {String} [selectedLayer2Id=""] ID of the second selected layer.
 */
const state = {
    icon: "bi-vr",
    description: "common:modules.compareMaps.description",
    hasMouseMapInteractions: true,
    name: "common:modules.compareMaps.name",
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D"],
    type: "compareMaps",

    active: false,
    layerNames: [],
    initialBaseLayer: null,
    selectedLayer1Id: "",
    selectedLayer2Id: ""
};

export default state;
