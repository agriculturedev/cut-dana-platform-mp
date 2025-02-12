import {Vector} from "ol/layer.js";
import Cluster from "ol/source/Cluster";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import store from "../../../app-store";

/**
 * Interactions with the layers of the map.
 */
export default {
    /**
     * Adds a layer to the map.
     * @param {Object} context context object.
     * @param {module:ol/layer/Base~BaseLayer} layer The layer to add.
     * @returns {void}
     */
    addLayer (context, layer) {
        const map2D = mapCollection.getMap("2D");

        if (!map2D.getLayers().getArray().includes(layer)) {
            if (layer.get("alwaysOnTop")) {
                layer.setZIndex(9999999);
            }
            map2D.addLayer(layer);
        }
        else {
            console.warn(`The layer with Id: ${layer.get("id")} was not added to the map, because the layer already exists!`);
        }
    },
    /**
     * Checks if the layer with the given name already exists and uses it or creates a new layer and returns it if not.
     * @param {Object} context context object.
     * @param {String} payload.layerName - The name of the new layer or the already existing layer.
     * @param {Boolean} [payload.alwaysOnTop=true] - Layers with the attribute "alwaysOnTop": true are set on top of the map.
     * @returns {module:ol/layer/Base~BaseLaye} The found layer or a new layer with the given name.
     */
    async addNewLayerIfNotExists (context, {layerName, alwaysOnTop = true}) {
        let resultLayer = store.getters["Maps/getLayerByName"](layerName);

        if (!resultLayer) {
            resultLayer = new VectorLayer({
                id: layerName,
                name: layerName,
                source: new VectorSource(),
                alwaysOnTop: alwaysOnTop
            });

            // @TODO use the existing method
            const map2D = mapCollection.getMap("2D");

            if (!map2D.getLayers().getArray().includes(resultLayer)) {
                map2D.addLayer(resultLayer);
            }
            else {
                console.warn(`The layer with Id: ${resultLayer.get("id")} was not added to the map, because the layer already exists!`);
            }
        }

        return resultLayer;
    },
    /**
     * Verifies if all features of a given layerId are loaded
     * and waits if the layer has not been loaded previously
     * @param {Object} context - context object.
     * @param {String} layerId - the layer ID to check loaded status
     *
     * @return {Promise} Resolves if the given Layer is fully loaded
     */
    async areLayerFeaturesLoaded (context, layerId) {
        const map2D = mapCollection.getMap("2D"),
            layer = map2D.getLayers().getArray().find(singleLayer => singleLayer.get("id") === layerId);

        await new Promise(resolve => {
            if (layer instanceof Vector) {
                let layerSource = layer.getSource();

                if (layer.getSource() instanceof Cluster) {
                    layerSource = layerSource.getSource();
                }
                if (layerSource.getFeatures().length > 0) {
                    resolve();
                }
                else {
                    layerSource.once("featuresloadend", () => {
                        resolve();
                    });
                }
            }
        });
    },

    /**
     * Checks if a layer is in the map collections
     * @param {Object} context The Vuex action context.
     * @param {module:ol/layer/Base~BaseLayer} layer The layer to check.
     * @returns {Boolean} if layer exists in mapCollection
     */
    checkLayer (context, layer) {
        const map2D = mapCollection.getMap("2D");

        if (map2D.getLayers().getArray().includes(layer)) {
            return true;
        }
        return false;
    }
};
