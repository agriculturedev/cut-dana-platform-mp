import layerFactory from "./layerFactory";
import layerCollection from "./layerCollection";
import store from "../../../app-store";

/**
 * Starts the creation of the layer in the layer factory
 * and register watcher.
 * @param {Object[]} visibleLayerConfigs The layer configurations.
 * @returns {void}
 */
export default function initializeLayers (visibleLayerConfigs) {
    processLayerConfig(visibleLayerConfigs, store.getters["Maps/mode"]);

    watchMapMode();
    watchLayerConfig();
}

/**
 * Watches the mode in Maps.
 * Starts processing of visible 3d layer configs.
 * @returns {void}
 */
function watchMapMode () {
    store.watch((state, getters) => getters["Maps/mode"], mapMode => {
        if (mapMode === "3D") {
            processLayerConfig(store.getters.visibleLayerConfigs, mapMode);
        }
    });
}

/**
 * Watch the layers in layerConfig.
 * Starts processing of all layer configs.
 * @returns {void}
 */
function watchLayerConfig () {
    store.watch((state, getters) => getters.allLayerConfigs, layerConfig => {
        processLayerConfig(layerConfig, store.getters["Maps/mode"]);
    }, {deep: true});
}

/**
 * Processes the layerConfig.
 * All existing layers will be updated.
 * Of the non-existing layers, only the visible ones are created and pushed into the LayerCollection.
 * @param {Object[]} layerConfig The layer configurations.
 * @param {String} mapMode The current map mode.
 * @returns {void}
 */
export function processLayerConfig (layerConfig, mapMode) {
    layerConfig?.forEach(layerConf => {
        let layer = layerCollection.getLayerById(layerConf.id);

        if (layer !== undefined) {
            updateLayerAttributes(layer, layerConf);
        }
        else if (layerConf.visibility === true) {
            Object.assign(layerConf, {showInLayerTree: true}); // a visible layer is always show in layer tree
            layer = layerFactory.createLayer(layerConf, mapMode);
            processLayer(layer, mapMode);
        }
    });
    if (store.getters.styleListLoaded) {
        store.dispatch("Modules/Legend/createLegend", {root: true});
    }
    else {
        store.watch((state, getters) => getters.styleListLoaded, value => {
            if (value) {
                store.dispatch("Modules/Legend/createLegend", {root: true});
            }
        });
    }
}

/**
 * Update the layer attributes of the already extistering layer.
 * @param {Layer} layer Layer of the layer collection.
 * @param {Object} layerConf The layer config.
 * @returns {void}
 */
export function updateLayerAttributes (layer, layerConf) {
    layer.updateLayerValues(layerConf);
    Object.assign(layer.attributes, layerConf);
}

/**
 * Processes the layer.
 * Layer is added to collection and map and layerConfig is updated.
 * @param {Layer} layer The layer of the layer collection.
 * @returns {void}
 */
function processLayer (layer) {
    if (layer) {
        updateLayerConfig(layer);
        setResolutions(layer);
        layerCollection.addLayer(layer);
    }
}

/**
 * If layer has attributes 'minScale' and 'maxScale', min- and maxResolution is set at ol.Layer.
 * @param {Layer} layer The layer of the layer collection.
 * @returns {void}
 */
export function setResolutions (layer) {
    if (layer.get("typ") === "GROUP") {
        layer.attributes.children.forEach((rawLayer, index) => {
            setResolutionsForGroupLayer(rawLayer, layer, index);
        });
    }
    else if (layer.get("maxScale") !== undefined) {
        if (layer.get("minScale") === undefined) {
            layer.set("minScale", 0);
        }
        const resoByMaxScale = store.getters["Maps/getResolutionByScale"](layer.get("maxScale"), "max"),
            resoByMinScale = store.getters["Maps/getResolutionByScale"](layer.get("minScale"), "min");

        layer.getLayer().setMaxResolution(resoByMaxScale + (resoByMaxScale / 100));
        layer.getLayer().setMinResolution(resoByMinScale);
    }
}
/**
 * If a layer in a group layer has attributes 'minScale' and 'maxScale', min- and maxResolution is set at ol.Layer.
 * @param {Layer} rawLayer A layer of the group layer collection.
 * @param {Layer} groupLayer The GroupLayer of the layer collection.
 * @param {Integer} index The index of the layer in the group layer collection.
 * @returns {void}
 */
export function setResolutionsForGroupLayer (rawLayer, groupLayer, index) {
    if (rawLayer.maxScale !== undefined) {
        if (rawLayer.minScale === undefined) {
            rawLayer.minScale = 0;
        }
        const resoByMaxScale = store.getters["Maps/getResolutionByScale"](rawLayer.maxScale, "max"),
            resoByMinScale = store.getters["Maps/getResolutionByScale"](rawLayer.minScale, "min");

        groupLayer.getLayer().getLayers().getArray()[index].setMaxResolution(resoByMaxScale + (resoByMaxScale / 100));
        groupLayer.getLayer().getLayers().getArray()[index].setMinResolution(resoByMinScale);
    }
}

/**
 * Update the layer config in app-store.
 * So that the state always contains the current attributes of the layers and is thus globally available.
 * NOte: Note, the reactivity of the store is not triggered, otherwise an infinite loop would be created.
 * @param {Layer} layer Layer of the layer collection.
 * @returns {void}
 */
function updateLayerConfig (layer) {
    store.dispatch("replaceByIdInLayerConfig", {
        layerConfigs: [{
            id: layer.get("id"),
            layer: layer.attributes
        }],
        trigger: false
    }, {root: true});
}
