import {getComponent} from "../../../../utils/getComponent";

/**
 * Receives relevant information about the layers with the given ids.
 *
 * @param {String[]} layerIds Ids of layers to retrieve information for.
 * @returns {TransactionLayer[]} Information for each respective layer wrapped in an array.
 */
function getLayerInformation (layerIds) {
    return layerIds.map(id => {
        const layer = getComponent(id);

        if (layer) {
            return ["featureNS", "featurePrefix", "featureType", "gfiAttributes", "style", "isSelected", "isVisibleInMap", "name", "url", "version"]
                .reduce((previous, key) => ({...previous, [key]: layer?.get(key)}),
                    {
                        id,
                        isSecured: layer?.get("isSecured") !== undefined ? layer?.get("isSecured") : false
                    }
                );
        }

        return {};

    });
}

export default {getLayerInformation};
