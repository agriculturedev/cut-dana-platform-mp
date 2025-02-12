import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import getNestedValues from "../../shared/js/utils/getNestedValues";
import {sortObjects} from "../../shared/js/utils/sortObjects";
import {treeBaselayersKey, treeSubjectsKey} from "../../shared/js/utils/constants";
import {uniqueId} from "../../shared/js/utils/uniqueId.js";
import layerFactory from "../../core/layers/js/layerFactory";

/**
 * Returns all layer from services.json to add to states layerConfig for treetype 'auto', besides background-layers.
 * The layers are sorted and grouped by metadata-name. All folders and elements get ids and parentIds.
 * @module app-store/js/buildTreeStructure
 * @param  {Object[]} layerList - the filtered raw layer list
 * @param  {Object} layerConfig configuration of layer like in the config.json, to get background-layer from
 * @param  {String} category the category to get the tree for
 * @param  {Object} [shownLayerConfs=[]] configuration of layer to show on first level of tree, configured in config.json
 * @param  {Boolean} [categoryChanged=false] if true, category has changed
 * @returns {Object} tree structure as json object
 */
function build (layerList, layerConfig, category, shownLayerConfs = [], categoryChanged = false) {
    const categoryKey = category?.key,
        groups = {},
        folder = {},
        layersByMdName = {};
    let bgLayers = [],
        bgLayerIds = [],
        subjectDataLayers = [],
        layers3D = [];

    if (!category) {
        return layerList;
    }
    folder.elements = [];
    if (layerConfig) {
        bgLayers = getNestedValues(layerConfig[treeBaselayersKey], "elements", true).flat(Infinity);
        bgLayerIds = getIdsOfLayers(bgLayers);

        if (layerConfig[treeSubjectsKey]) {
            subjectDataLayers = getNestedValues(layerConfig[treeSubjectsKey], "elements", true).flat(Infinity);
            layers3D = get3DLayers(subjectDataLayers);
            if (categoryChanged) {
                subjectDataLayers = layers3D;
                layerConfig[treeSubjectsKey].elements = [];
            }

            if (layers3D.length > 0 && layers3D.length === subjectDataLayers.length) {
                folder.elements = layerConfig[treeSubjectsKey].elements ? layerConfig[treeSubjectsKey].elements : layerConfig[treeSubjectsKey];
            }
            else if (!categoryChanged && layers3D.length > 0) {
                layerConfig[treeSubjectsKey].elements.forEach(element => {
                    const nestedLayers = getNestedValues(element, "elements", true).flat(Infinity);

                    if (element.type === "folder" && containsOnly3DLayer(nestedLayers)) {
                        folder.elements.push(element);
                    }
                    else {
                        const rawLayerConfig = layerList.find(layer => layer.id === element.id);

                        if (rawLayerConfig) {
                            const index = subjectDataLayers.findIndex(layer => layer.id === rawLayerConfig.id),
                                replacement = Object.assign({}, rawLayerConfig, element);

                            layerList.splice(layerList.indexOf(rawLayerConfig), 1, replacement);
                            subjectDataLayers.splice(index, 1);
                        }
                    }
                });
            }
            else {
                subjectDataLayers = [];
            }
        }
    }

    for (let i = 0; i < layerList.length; i++) {
        let rawLayer = layerList[i],
            id = null,
            subFolder;

        if (bgLayerIds.indexOf(rawLayer.id) > -1) {
            continue;
        }
        if (subjectDataLayers.find(conf => conf.id === rawLayer.id) !== undefined) {
            continue;
        }
        if (rawLayer.datasets[0] && rawLayer.datasets[0][categoryKey] === "") {
            rawLayer.datasets[0][categoryKey] = "ohne Kategorie";
        }
        if (rawLayer.datasets[0] && rawLayer.datasets[0][categoryKey] !== undefined) {
            shownLayerConfs.forEach(layerConf => {
                if (layerConf.id === rawLayer.id) {
                    rawLayer = Object.assign(rawLayer, layerConf);
                }
            });
            const groupNames = getGroupNames(rawLayer, categoryKey);

            id = rawLayer.id;
            for (let j = 0; j < groupNames.length; j++) {
                const groupName = groupNames[j],
                    mdName = rawLayer.datasets[0].md_name;
                let isFirstLayer = true;

                if (layersByMdName[mdName] && layersByMdName[mdName].find(aLayer => aLayer.id === id)) {
                    continue;
                }
                isFirstLayer = isFirstLayerWithMdName(layersByMdName, rawLayer, mdName);

                if (!Object.keys(groups).find((key) => key === groupName)) {
                    addGroup(folder, groups, groupName);
                }
                subFolder = folder.elements.find((obj) => obj.name === groupName);
                if (subFolder.id === undefined) {
                    subFolder.id = getId();
                }

                if (!Object.keys(groups[groupName]).find((key) => key === mdName)) {
                    groups[groupName][mdName] = [];
                    if (isFirstLayer) {
                        addSingleLayer(subFolder, rawLayer, mdName);
                    }
                    else {
                        addSubGroup(subFolder, groups, groupName, mdName);
                    }
                }
                if (!isFirstLayer) {
                    const mdNameFolder = subFolder.elements.find((obj) => obj.name === mdName);
                    let parentId = mdNameFolder ? mdNameFolder.id : subFolder.id;

                    if (layersByMdName[mdName].length === 2) {
                        parentId = moveFirstLayerToFolder(subFolder, groups, layersByMdName, groupName, mdName);
                    }
                    rawLayer.parentId = parentId;
                    groups[groupName][mdName].push(rawLayer);
                    sortObjects(groups[groupName][mdName], "name");
                }
            }
        }
    }
    return folder;
}
/**
 * Sets unique random ids at folders and recursive at all subfolders.
 * @param {Array} folders folders to set ids at
 * @returns {void}
 */
function setIdsAtFolders (folders) {
    folders.forEach(folder => {
        folder.id = getId();
        setIdsAtSubFolders(folder);
    });
}
/**
 * Sets unique random ids at folders and recursive at all subfolders.
 * Sets parentId at each element under a folder.
 * @param {Object} folder folder containes elements
 * @returns {void}
 */
function setIdsAtSubFolders (folder) {
    folder.elements?.forEach(element => {
        if (element.type === "folder") {
            element.id = getId();
        }
        element.parentId = folder.id;
        if (folder.elements) {
            folder.elements.forEach(subElement => {
                setIdsAtSubFolders(subElement);
            });
        }
    });
}
/**
 * Returns a unique id with prefix 'folder-'.
 * @returns {String} unique id
 */
function getId () {
    return uniqueId("folder-");
}
/**
 * Returns true, if all layers are 3D-layer.
 * @param {Array} layers containing layer configurations
 * @returns {Boolean} true, if all layers are 3D-layer.
 */
function containsOnly3DLayer (layers) {
    return layers.every(conf => layerFactory.getLayerTypes3d().includes(rawLayerList.getLayerWhere({id: conf.id})?.typ.toUpperCase()));
}
/**
 * Returns all 3D-layers with typ contained in layerFactory.getLayerTypes3d().
 * @param {Array} layers containing layer configurations
 * @returns {Array} all 3D-layers
 */
function get3DLayers (layers) {
    return layers.filter(conf => layerFactory.getLayerTypes3d().includes(rawLayerList.getLayerWhere({id: conf.id})?.typ.toUpperCase()));
}

/**
 * Moves the first layer with given mdName to subfolder.
 * @param {Object} subFolder sub Folder
 * @param {Object} groups layers by groupname and netatdata-name
 * @param {Object} layersByMdName contains lists of layers grouped by matadata-name
 * @param {String} groupName name of the group (category) in layers first dataset
 * @param {String} mdName metadata-name of the layer
 * @returns {void}
 */
function moveFirstLayerToFolder (subFolder, groups, layersByMdName, groupName, mdName) {
    const firstLayer = layersByMdName[mdName][0],
        subToAdd = {};

    groups[groupName][mdName] = [];
    removeLayerById(subFolder.elements, firstLayer.id);
    subToAdd.elements = groups[groupName][mdName];
    subToAdd.name = mdName;
    subToAdd.type = "folder";
    subToAdd.id = getId();
    subToAdd.parentId = subFolder.id;
    subFolder.elements.push(subToAdd);
    sortObjects(subFolder.elements, "name");
    firstLayer.parentId = subToAdd.id;
    groups[groupName][mdName].push(firstLayer);
    return subToAdd.id;
}

/**
 * Adds a single layer to sub folder and assigns the metadata-name to the name.
 * @param {Object} subFolder sub Folder
 * @param {Object} layer the raw layer
 * @param {String} mdName metadata-name of the layer
 * @returns {void}
 */
function addSingleLayer (subFolder, layer, mdName) {
    if (!Array.isArray(subFolder.elements)) {
        subFolder.elements = [];
    }
    layer.parentId = subFolder.id;
    subFolder.elements.push(Object.assign({}, layer, {name: mdName}));
    sortObjects(subFolder.elements, "name");
}

/**
 * Adds layers from groups to subfolder.
 * @param {Object} subFolder sub Folder
 * @param {Object} groups layers by groupname and netatdata-name
 * @param {String} groupName name of the group (category) in layers first dataset
 * @param {String} mdName metadata-name of the layer
 * @returns {void}
 */
function addSubGroup (subFolder, groups, groupName, mdName) {
    const subToAdd = {};

    subToAdd.elements = groups[groupName][mdName];
    subToAdd.name = mdName;
    subToAdd.type = "folder";
    subToAdd.id = getId();
    subToAdd.parentId = subFolder.id;
    subFolder.elements.push(subToAdd);
    sortObjects(subFolder.elements, "name");
}

/**
 * Adds group to folder.
 * @param {Object} folder the folder
 * @param {Object} groups layers by groupname and netatdata-name
 * @param {String} groupName name of the group (category) in layers first dataset
 * @returns {void}
 */
function addGroup (folder, groups, groupName) {
    const toAdd = {};

    toAdd.elements = [];
    toAdd.name = groupName;
    toAdd.type = "folder";
    toAdd.id = getId();
    toAdd.parentId = folder.id;
    folder.elements.push(toAdd);
    sortObjects(folder.elements, "name");
    groups[groupName] = {};
    // return toAdd.id;
}

/**
 * Removes the object with the given id from list.
 * @param {Array} list to delete an entry from
 * @param {String} idToDelete id of object to delete
 * @returns {void}
 */
function removeLayerById (list, idToDelete) {
    const toRemoveIndex = list.findIndex((layer) => layer.id === idToDelete);

    if (toRemoveIndex > -1) {
        list.splice(toRemoveIndex, 1);
    }
}

/**
 * Returns the ids of the layers in an array.
 * @param {Array} layers list of layers
 * @returns {Array} the ids of the layers
 */
function getIdsOfLayers (layers) {
    let ids = [];

    layers.forEach(layer => {
        if (Array.isArray(layer.id)) {
            ids = ids.concat(layer.id);
        }
        else {
            ids.push(layer.id);
        }
    });
    return ids;
}

/**
 * Returns the names of the categories for the given categoryKey in layers first dataset.
 * @param {Object} layer the layer, must have attribute datasets with one entry with key 'md_name'
 * @param {String} categoryKey key of the category to read the name of
 * @returns {Array} the names of the categories for the given categoryKey
 */
function getGroupNames (layer, categoryKey) {
    if (Array.isArray(layer.datasets[0][categoryKey])) {
        return layer.datasets[0][categoryKey];
    }
    return [layer.datasets[0][categoryKey]];
}

/**
 * Returns true, if no other layer with the given metadata-name is contained in layersByMdName.
 * @param {Object} layersByMdName contains lists of layers grouped by matadata-name
 * @param {Object} layer the raw layer
 * @param {String} mdName metadata-name of the layer
 * @returns {Boolean} true, if no other layer with the given metadata-name is contained in layersByMdName
 */
function isFirstLayerWithMdName (layersByMdName, layer, mdName) {
    if (Object.keys(layersByMdName).find((key) => key === mdName)) {

        if (!layersByMdName[mdName].find(aLayer => aLayer.id === layer.id)) {
            layersByMdName[mdName].push(layer);
        }
        return false;
    }
    layersByMdName[mdName] = [layer];
    return true;
}

export default {
    build,
    setIdsAtFolders
};

