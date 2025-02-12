import layerCollection from "../../../core/layers/js/layerCollection";

export default {
    /**
     * Returns all layers of the map and their visibility.
     * If layer is a group, the grouped subject layers or the first baselayer (with the grouped name) are returned.
     * @returns {Array} - layer holders
     */
    getLayerHolder: () => {
        const allLayers = [];

        layerCollection.getLayers().forEach(layer => {
            if (layer.get("typ") === "GROUP") {
                if (layer.get("baselayer")) {
                    if (layer.attributes.name) {
                        layer.getLayerSource()[0].attributes.name = layer.attributes.name;
                    }
                    allLayers.push({layer: layer.getLayerSource()[0], visibility: layer.get("visibility")});
                }
                else {
                    layer.getLayerSource().forEach(groupedLayer => {
                        allLayers.push({layer: groupedLayer, visibility: layer.get("visibility")});
                    });
                }
            }
            else {
                allLayers.push({layer, visibility: layer.get("visibility")});
            }
        });
        return allLayers;
    }
};
