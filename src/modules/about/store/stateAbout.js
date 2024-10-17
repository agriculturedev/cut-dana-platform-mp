/**
 * User type definition
 * @module modules/About/state
 * @typedef {Object} aboutState
 * @property {String} description The description that should be shown in the button in the menu.
 * @property {String} icon Icon next to name (config-param).
 * @property {String} name name of this module
 * @property {Object[]} menuSide Specifies in which menu the about should be rendered
 * @property {String} type the type of layer information
 *
 * @property {String} abstractText the abstract Info text
 * @property {Object} contact the metadata contact
 * @property {String} cswUrl the csw metadata URL
 * @property {String} logo the masterportal logo
 * @property {String} logoLink the link to https://masterportal.org
 * @property {String} logoText the alternate text if the the masterportal logo cannot be displayed
 * @property {String} metaDataCatalogueId id of the MetaDataCatalogue
 * @property {String} metaId id of the MetaData
 * @property {String} metaUrl the metadata URL
 * @property {String} noMetadataLoaded no metadata Loaded Text
 * @property {Boolean} showAdditionalMetaData parameter to show the metadata link for more information
 * @property {String} title the metadata title
 * @property {String} version the current mp version
 * @property {String} versionLink link to the masteprortal downloads
 * @property {String} ustId Sales tax identification number
 * @property {String} privacyStatementText Text for data privacy section
 * @property {String} privacyStatementUrl URL to data privacy policy site
 * @property {String} accessibilityText Text for accessibility section
 * @property {String} accessibilityUrl URL to accessibility site
 */
export default {
    description: "common:modules.about.description",
    icon: "bi-info-circle",
    name: "common:modules.about.name",
    menuSide: "mainMenu",
    type: "about",

    abstractText: "",
    contact: null,
    cswUrl: "",
    logo: "../../src/assets/img/Logo_Masterportal.svg",
    logoLink: "https://masterportal.org",
    logoText: "Masterportallogo",
    metaDataCatalogueId: "2",
    metaId: "",
    metaUrl: "",
    noMetadataLoaded: "",
    showAdditionalMetaData: true,
    title: "",
    version: "",
    versionLink: "https://bitbucket.org/geowerkstatt-hamburg/masterportal/downloads/",
    ustId: "",
    privacyStatementText: "",
    privacyStatementUrl: "",
    accessibilityText: "",
    accessibilityUrl: ""
};
