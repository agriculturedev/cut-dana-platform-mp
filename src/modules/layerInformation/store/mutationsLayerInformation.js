import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import stateLayerInformation from "./stateLayerInformation";

/**
 * The mutations for the layerInformation.
 * @module modules/layerInformation/store/mutationsLayerInformation
 */
export default {
    ...generateSimpleMutations(stateLayerInformation),

    /**
     * Sets the layerinfo of the active layer.
     * @param {Object} state Context object.
     * @param {Object} layerConf The layer configuration.
     * @returns {void}
     */
    setLayerInfo (state, layerConf) {
        let urls = layerConf?.url || layerConf?.capabilitiesUrl,
            metaID = layerConf?.datasets?.length > 0 ? layerConf.datasets[0].md_id : null,
            cswUrl = layerConf?.datasets?.length > 0 ? layerConf.datasets[0].csw_url : null,
            customMetadata = layerConf?.datasets?.length > 0 ? layerConf.datasets[0].customMetadata : null,
            attributes = layerConf?.datasets?.length > 0 ? layerConf.datasets[0].attributes : null,
            showDocUrl = layerConf?.datasets?.length > 0 ? layerConf.datasets[0].show_doc_url : null;
        const layerNames = [];

        if (layerConf?.typ === "GROUP") {
            urls = [];
            metaID = [];
            layerConf.children.forEach(child => {
                urls.push(child.url || child.capabilitiesUrl);
                layerNames.push(child.name);
                if (child.datasets?.length > 0) {
                    metaID.push(child.datasets[0].md_id);
                    if (!cswUrl) {
                        cswUrl = child.datasets[0].csw_url;
                    }
                    if (!customMetadata) {
                        customMetadata = child.datasets[0].customMetadata;
                    }
                    if (!attributes) {
                        attributes = child.datasets[0].attributes;
                    }
                    if (!showDocUrl) {
                        showDocUrl = child.datasets[0].show_doc_url;
                    }
                }
            });
        }
        state.layerInfo = {
            cswUrl: cswUrl,
            id: layerConf?.id,
            layername: layerConf?.name,
            layerNames: layerNames,
            legendURL: layerConf?.legendURL,
            metaID: metaID,
            customMetadata: customMetadata,
            attributes: attributes,
            showDocUrl: showDocUrl,
            typ: layerConf?.typ,
            url: urls,
            urlIsVisible: layerConf?.urlIsVisible
        };
    }
};
