/**
* The state of the layerInformation.
 * @module modules/layerInformation/store/stateLayerInformation
 *
 * @property {String} [abstractText=""] the abstract Info text
 * @property {String} [customText=null] the custom Info text
 * @property {String} [datePublication=""] the date of the publication
 * @property {String} [dateRevision=""] the date of the last revision
 * @property {String[]} [downloadLinks=null] the download Links
 * @property {String} [icon="bi-info-circle"] Icon next to name (config-param).
 * @property {Object} [layerInfo={}] additional layer Information
 * @property {Object[]} [menuSide="mainMenu"] Specifies in which menu the GFI should be rendered
 * @property {String} [metaDataCatalogueId"2"] id of the MateDataCatalogue
 * @property {String[]} [metaURLs=[]] the metadata URLs
 * @property {String} [name="common:modules.layerInformation.name"] name of this module
 * @property {String} [noMetadataLoaded=""] no metadata Loaded Text
 * @property {String} [periodicityKey=""] the key for the periodicity
 * @property {Boolean} [showUrlGlobal=null] parameter to globally toggle the dispaly of the service url for all layers
 * @property {String} [title=""] the layer Title
 * @property {String} [type="layerInformation"] the type of layer information
 * @property {Boolean} [legendAvailable=true] true, if legend is available
 * @property {String} [pointOfContact=""] point of contact information from metadata
 * @property {String} [publisher=""] publisher information from metadata
 */
export default {
    abstractText: "",
    customText: null,
    datePublication: "",
    dateRevision: "",
    downloadLinks: null,
    icon: "bi-info-circle",
    layerInfo: {},
    menuSide: "mainMenu",
    metaDataCatalogueId: "2",
    metaURLs: [],
    name: "common:modules.layerInformation.name",
    noMetadataLoaded: "",
    periodicityKey: "",
    showUrlGlobal: null,
    title: "",
    type: "layerInformation",
    legendAvailable: true,
    pointOfContact: "",
    publisher: ""
};
