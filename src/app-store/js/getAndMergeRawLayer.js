import {rawLayerList} from "@masterportal/masterportalapi/src";
import {updateProxyUrl} from "./getProxyUrl";
import layerFactory from "../../core/layers/js/layerFactory";

let zIndex = 1;

/**
 * Returns the extended raw layer to the id contained in the layer configuration.
 * If id contains an array of ids, the rawlayer is merged.
 * Grouped layers children are filled with the rawlayers.
 * Config Paramter layerIDsToStyle is evaluated.
 * @module app-store/js/getAndMergeRawLayer
 * @param {Object} layerConf configuration of layer like in the config.json
 * @param {Object} [showAllLayerInTree="false"] if true, all layers get the attribute showInLayerTree=true
 * @param {Object} [layerIDsToStyle = undefined] config Parameter, if filled, properties are assigned to dedicated layers.
 * @returns {Object} the extended and merged raw layer
 */
export function getAndMergeRawLayer (layerConf, showAllLayerInTree = false, layerIDsToStyle = undefined) {
    const rawLayer = mergeRawLayer(layerConf, rawLayerList.getLayerWhere({id: splitId(layerConf?.id)})),
        layers = [];

    if (!rawLayer && layerConf) {
        if (layerConf.name === undefined) {
            const text = `Layer with id ${layerConf.id} was not found in services.json and has no name!`;

            console.warn(text);
            layerConf.name = `WARN: ${text} `;
        }
    }
    if (layerIDsToStyle) {
        const styledLayers = [];

        styleAndMergeLayers(layerIDsToStyle, rawLayer || layerConf, styledLayers);
        styledLayers.forEach(styledLayer => {
            layers.push(addAdditional(styledLayer, showAllLayerInTree));
        });
    }
    else if (layerConf) {
        layers.push(addAdditional(rawLayer || layerConf, showAllLayerInTree));
    }

    return layers;
}

/**
 * Splits the id by seperator, if the id is a string.
 * @param {String} id The layer id.
 * @param {String} [seperator=#] The seperator to split by.
 * @returns {String} The first part of the id.
 */
function splitId (id, seperator = ".") {
    if (typeof id === "string") {
        return id.split(seperator)[0];
    }

    return id;
}

/**
 * Adds the attribute "showInLayerTree" to raw layer.
 * Rules:
 * If no add Layer Button is configured (portalConfig.tree.addLayerButton.active=true), then always showInLayerTree = true (so showLayerInTree has no effect in config.json)
 * If a layer has visibility= true, then also always showInLayerTree = true so it is not possible to have showInLayerTree = false and visibility: true
 * because visibility = true always results in showInLayerTree = true no matter what the config.json says.
 * If both are not true, then showInLayerTree = false (for all other treeTypes e.g. "auto") if the attribute is not already set explicitly on the layer (i.e. in config.json).
 * @param {Object} rawLayer The raw layer.
 * @param {Object} [showAllLayerInTree="false"] if true, all layers get the attribute showInLayerTree=true
 * @returns {Object} The raw layer
 */
export function addAdditional (rawLayer, showAllLayerInTree = false) {
    if (rawLayer) {
        const layerTypes3d = layerFactory.getLayerTypes3d();

        rawLayer.type = "layer";
        if (showAllLayerInTree || rawLayer.visibility) {
            rawLayer.showInLayerTree = true;
        }
        else if (!Object.prototype.hasOwnProperty.call(rawLayer, "showInLayerTree")) {
            rawLayer.showInLayerTree = false;
        }
        if (rawLayer.showInLayerTree === true) {
            rawLayer.zIndex = zIndex++;
        }
        rawLayer.is3DLayer = layerTypes3d.includes(rawLayer.typ?.toUpperCase());
    }

    return rawLayer;
}

/**
 * Returns the extended raw layer to the id contained in the layer configuration with updated proxy settings.
 * If id contains an array of ids, a grouped layer is created. Grouped layers children are filled with the rawlayers.
 * @param {Object} layerConf configuration of layer like in the config.json
 * @param {Object} rawLayer raw layer from services.json
 * @returns {Object} the extended and merged raw layer
 */
function mergeRawLayer (layerConf, rawLayer) {
    let mergedLayer;

    if (layerConf) {
        if (Array.isArray(layerConf.id)) {
            mergedLayer = mergeGroupedLayer(layerConf);
        }
        else if (rawLayer !== undefined && rawLayer !== null) {
            mergedLayer = {...rawLayer, ...layerConf};
        }
    }

    if (mergedLayer?.useProxy === true) {
        updateProxyUrl(mergedLayer);
    }

    return mergedLayer;
}

/**
 * Merges layer configuration with layer defined as array of Ids with or without typ GROUP.
 * If typ is GROUP, a grouped layer is created else the layer is replaced by the first layer of the group
 * and gets the attribute 'layers' of all depending layers.
 * @param {Object} layerConf configuartion of layer like in the config.json with ids in an array
 * @returns {Object|undefined} the merged raw layer or undefined if layer cannot be merged
 */
function mergeGroupedLayer (layerConf) {
    const ids = layerConf.id,
        existingLayers = checkIdArray(ids),
        maxScales = [],
        minScales = [];
    let rawLayer = {};

    if (existingLayers.length !== ids.length || ids.length === 0) {
        return layerConf;
    }
    existingLayers.forEach(object => object.maxScale ? maxScales.push(parseInt(object.maxScale, 10)) : null);
    existingLayers.forEach(object => object.minScale ? minScales.push(parseInt(object.minScale, 10)) : null);
    if (layerConf.typ === "GROUP") {
        existingLayers.forEach(aLayer => {
            if (layerConf.styleId) {
                aLayer.styleId = layerConf.styleId;
            }
        });
        rawLayer = {...layerConf};
        rawLayer.id = ids.join("-");
        // named children, because api needs it for styling groups
        rawLayer.children = existingLayers;
        setMinMaxScale(rawLayer, maxScales, minScales);
        rawLayer.typ = "GROUP";
    }
    else if (sameUrlAndTyp(existingLayers)) {
        rawLayer = Object.assign({}, existingLayers[0], layerConf);
        rawLayer.id = existingLayers[0].id;
        rawLayer.layers = existingLayers.map(value => value.layers).toString();
        setMinMaxScale(rawLayer, maxScales, minScales);
    }
    else {
        console.warn(`Layer '${layerConf.name}' with ids as array: [${layerConf.id}] cannot be created. All layers in the ids-array must habe same 'typ' and same 'url'.`);
    }
    layerConf.id = rawLayer.id;

    return rawLayer;
}

/**
 * Checks for layers with given ids in rawlayerList and adds them to the existingLayers.
 * @param {Array} ids to check
 * @returns {Array} all layers with the given ids
 */
function checkIdArray (ids) {
    const existingLayers = [];

    for (let index = 0; index < ids.length; index++) {
        const id = ids[index],
            layer = rawLayerList.getLayerWhere({id: splitId(id)});

        if (layer) {
            existingLayers.push(layer);
        }
        else {
            console.warn(`Layer with id:${id} not found in services.json. The Layer with ids: ${ids} will not be displayed!`);
        }
    }
    return existingLayers;
}

/**
 * Returns true, if all layers have same url and typ.
 * @param {Array} layers, list of layers
 * @returns {Boolean} true, if all layers have same url and typ
 */
function sameUrlAndTyp (layers) {
    if (layers.length > 0) {
        const url = layers[0].url,
            typ = layers[0].typ;

        return layers.every(layer => layer.url === url && layer.typ === typ);
    }
    return false;
}

/**
 * Sets min- and maxScale at the given layer.
 * @param {Object} layer to set min- and maxScale at
 * @param {Array} maxScales list of maxScales
 * @param {Array} minScales list of minScales
 * @returns {void}
 */
function setMinMaxScale (layer, maxScales, minScales) {
    layer.maxScale = Math.max(...maxScales);
    layer.minScale = Math.min(...minScales);
}

/**
 * Returns all layer to add to states layerConfig for treetype 'auto'.
 * Filters the raw layerlist by typ and datasets.
 * Creates new raw layer if datasets contains more than one entry.
 * Filters and merges layerList by config parameters from portalConfig.tree 'layerIDsToIgnore', 'metaIDsToIgnore', 'metaIDsToMerge' and 'layerIDsToStyle'.
 * Layers with ids contained in 'layerIDsToIgnore'are removed from list.
 * Layers with meta_ids contained in 'metaIDsToIgnore'are removed from list.
 * Layers with meta_ids contained in 'metaIDsToMerge'are are merged to one layer.
 * Properties in 'layerIDsToStyle'are are assigned to dedicated layers. If an entry has more than one style, new layers are created for each style.
 * Ids are composed by origin id and styles value.
 * @param  {Object[]} [treeConfig={}] - portalConfig.tree from state, may contain 'layerIDsToIgnore', 'metaIDsToIgnore', 'metaIDsToMerge' and 'layerIDsToStyle',
 * If config 'validLayerTypes' is set, it contains layer types to be used with the tree.type 'auto'. If not configured,  ["WMS", "SENSORTHINGS", "TERRAIN3D", "TILESET3D", "OBLIQUE"] are used.
 * @param {Boolean} [showLayerAddButton=false] if true, a button to add layer is shown
 * @returns {Array} the filtered layer configurations
 */
export function getAndMergeAllRawLayers (treeConfig = {}, showLayerAddButton = false) {
    // refactored from parserDefaultTree.js and layerList.js
    const layerList = rawLayerList.getLayerList(),
        rawLayers = [],
        validLayerTypes = treeConfig.validLayerTypesAutoTree || ["WMS", "SENSORTHINGS", "TERRAIN3D", "TILESET3D", "OBLIQUE"],
        layerIDsToIgnore = treeConfig.layerIDsToIgnore || [],
        metaIDsToIgnore = treeConfig.metaIDsToIgnore || [],
        metaIDsToMerge = treeConfig.metaIDsToMerge || [],
        layerIDsToStyle = treeConfig.layerIDsToStyle || [],
        idsOfLayersToStyle = layerIDsToStyle.map(entry => entry.id),
        toMergeByMdId = {};
    let relatedWMSLayerIds = [];

    for (let i = 0; i < layerList.length; i++) {
        const rawLayer = addAdditional(layerList[i], !showLayerAddButton),
            layerType = rawLayer.typ?.toUpperCase();

        if (!validLayerTypes.includes(layerType) ||
            !rawLayer.datasets ||
            rawLayer.datasets.length === 0 ||
            layerIDsToIgnore.includes(rawLayer.id) ||
            metaIDsToIgnore.includes(rawLayer.datasets[0].md_id)) {
            continue;
        }
        if (metaIDsToMerge.includes(rawLayer.datasets[0].md_id)) {
            collectLayersToMergeByMetaId(toMergeByMdId, rawLayer.datasets[0].md_id, rawLayer);
            continue;
        }
        if (idsOfLayersToStyle.includes(rawLayer.id)) {
            styleAndMergeLayers(layerIDsToStyle, rawLayer, rawLayers);
            continue;
        }
        if (layerType === "SENSORTHINGS" && rawLayer.related_wms_layers !== undefined) {
            relatedWMSLayerIds = relatedWMSLayerIds.concat(rawLayer.related_wms_layers);
        }
        if (rawLayer.datasets.length > 1) {
            rawLayer.datasets.forEach((ds, index) => {
                const newLayer = {...rawLayer};

                newLayer.id = rawLayer.id + "_" + index;
                newLayer.datasets = [ds];
                rawLayers.push(newLayer);
            });
        }
        else {
            rawLayers.push(rawLayer);
        }
    }
    mergeByMetaIds(toMergeByMdId, rawLayers);
    removeFromLayerList(relatedWMSLayerIds, rawLayers);
    return rawLayers;
}

/**
 * Removes the layers with the given ids from rawLayers.
 * @param  {Object[]} [ids=[]] containing the ids of all layers to remove
 * @param  {Object[]} [layerList=[]] The layers from services.json
 * @returns {Object[]} LayerList without layers with the given ids
 */
function removeFromLayerList (ids = [], layerList = []) {
    ids.forEach(id => {
        const index = layerList.findIndex((layer) => layer.id === id);

        if (index > -1) {
            layerList.splice(index, 1);
        }
    });
}
/**
 * Properties in 'layerIDsToStyle'are are assigned to dedicated layers. If an entry has more than one style, new layers are created for each style.
 * Ids are composed by origin id and styles value.
 * @param  {Array} layerIDsToStyle contains style configurations
 * @param  {Object} layer raw layer from services.json
 * @param  {Object[]} [layerList=[]] The layers from services.json
 * @returns {void}
 */
function styleAndMergeLayers (layerIDsToStyle, layer, layerList) {
    const styleConfig = layerIDsToStyle.find(item => item.id === layer.id),
        rawLayer = Object.assign(layer, styleConfig);

    if (rawLayer.typ === "WMS" && Array.isArray(rawLayer.styles) && rawLayer.styles.length > 1) {
        rawLayer.styles.forEach(function (style, index) {
            const cloneObj = Object.assign({}, rawLayer);

            cloneObj.style = style;
            cloneObj.legendURL = rawLayer.legendURL[index];
            cloneObj.name = rawLayer.name[index];
            cloneObj.id = rawLayer.id + rawLayer.styles[index];
            cloneObj.styles = style;
            layerList.push(cloneObj);
        });
    }
    else {
        layerList.push(rawLayer);
    }
}
/**
 * Collects layers to merge by metaId.
 * @param {Object} toMergeByMdId key contains metaId and value contains an Array of layers with same metaId
 * @param  {String} mdId metaId of the layers first dataset
 * @param {Object} rawLayer raw layer from services.json
 * @returns {void}
 */
function collectLayersToMergeByMetaId (toMergeByMdId, mdId, rawLayer) {
    if (!Array.isArray(toMergeByMdId[mdId])) {
        toMergeByMdId[mdId] = [];
    }
    toMergeByMdId[mdId].push(rawLayer);
}

/**
 * Adds configured attributes from the config.js parameter 'layerIDsToStyle' to the objects via the Id.
 * From layers with multiple styles, a new layer is created per style and added to layerList.
 * @param {Object} toMergeByMdId key contains metaId and value contains an Array of layers with same metaId
 * @param  {Object[]} [layerList=[]] The layers from services.json
 * @returns {void}
 */
function mergeByMetaIds (toMergeByMdId, layerList) {
    Object.values(toMergeByMdId).forEach(layers => {
        const layersContent = [];
        let gfiAttributesSet = false,
            maxScale,
            minScale,
            mergedLayer = null;

        layers.forEach((layer, index) => {
            if (index === 0) {
                mergedLayer = Object.assign({}, layer);
                mergedLayer.name = layer.datasets[0].md_name;
                maxScale = layer.maxScale;
                minScale = layer.minScale;
            }
            if (layer.gfiAttributes !== "ignore" && !gfiAttributesSet) {
                mergedLayer.gfiAttributes = layer.gfiAttributes;
                gfiAttributesSet = true;
            }
            layersContent.push(layer.layers);
            maxScale = Math.max(maxScale, layer.maxScale);
            minScale = Math.min(minScale, layer.minScale);
        });
        mergedLayer.layers = layersContent.join(",");
        mergedLayer.maxScale = maxScale;
        mergedLayer.minScale = minScale;
        layerList.push(mergedLayer);
    });
}

/**
 * Resets the zIndex to 0.
 * @returns {void}
 */
export function resetZIndex () {
    zIndex = 1;
}
