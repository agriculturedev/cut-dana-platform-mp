/**
 * User type definition
 * @typedef {Object} FooterState
 * @property {String[]} configPaths Path array of possible config locations. First one found will be used
 * @property {Boolean} scaleLine Show scale line.
 * @property {Boolean} scaleLineWidth The scale line width in cm.
 * @property {String} seperator The seperator between urls.
 * @property {String} type The type of the portalFooter component.
 * @property {Object[]} urls Array of URL configuration objects
 * @property {String} urls[].alias Name of the link for desktop layout.
 * @property {String} urls[].alias_mobil Name of the link for mobile application.
 * @property {String} urls[].bezeichnung Name before the link.
 * @property {String} urls[].url The URL to be called.
 */
const state = {
    configPaths: ["portalConfig.portalFooter"],
    scaleLine: true,
    scaleLineWidth: 2,
    seperator: "&nbsp;|&nbsp;",
    type: "portalFooter",
    urls: []
};

export default state;
