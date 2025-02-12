/**
 * The state of the Copyright Informations
 * @module  modules/copyright/store/stateCopyrightConstraints
 * @typedef {Object} CopyrightConstraintsState
 * @property {String} id id of the Copyright component
 * @property {String} name displayed as title (config-param)
 * @property {String} icon icon next to title (config-param)
 * @property {String} type (config-param)
 * @property {String} cswUrl URL zur CSW Schnittstelle für die Nutzungshinweise (config-param)
 */
const state = {
    id: "copyrightConstraints",
    name: "common:modules.copyrightConstraints.name",
    icon: "bi-c-circle",
    type: "copyrightConstraints",
    cswUrl: "https://gdk.gdi-de.org/gdi-de/srv/ger/csw"
};

export default state;
