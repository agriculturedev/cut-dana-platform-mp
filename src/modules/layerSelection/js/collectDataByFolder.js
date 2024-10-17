import {treeSubjectsKey} from "../../../shared/js/utils/constants";
import sortBy from "../../../shared/js/utils/sortBy";

/**
 * Returns an object contains baselayerConfs, subjectDataLayerConfs and folderNames from given folder up to root.
 * @param {Object} folder folder of layerConfig
 * @param {Object} rootGetters the vuex rootGetters
 * @returns {Object} baselayerConfs, subjectDataLayerConfs and folderNames
 */
function collectDataByFolder (folder, rootGetters) {
    const lastBaselayerConfs = [],
        lastFolderNames = [],
        lastSubjectDataLayerConfs = [];

    inspectParentFolder(folder, rootGetters, lastBaselayerConfs, lastFolderNames, lastSubjectDataLayerConfs);
    return {
        lastBaselayerConfs: lastBaselayerConfs.reverse(),
        lastSubjectDataLayerConfs: lastSubjectDataLayerConfs.reverse(),
        lastFolderNames: lastFolderNames.reverse()
    };
}

/**
 * Collects baselayerConfs, subjectDataLayerConfs and folderNames from given folder up to root.
 * @param {Object} folder folder of layerConfig
 * @param {Object} rootGetters the vuex rootGetters
 * @param {Array} lastBaselayerConfs to fill with baselayerConfs from given folder up to root
 * @param {Array} lastFolderNames to fill with folderNames from given folder up to root
 * @param {Array} lastSubjectDataLayerConfs to fill with subjectDataLayerConfs from given folder up to root
 * @returns {void}
 */
function inspectParentFolder (folder, rootGetters, lastBaselayerConfs, lastFolderNames, lastSubjectDataLayerConfs) {
    if (folder.parentId !== undefined) {
        const parentFolder = rootGetters.folderById(folder.parentId);

        lastBaselayerConfs.push([]);
        lastFolderNames.push(parentFolder.name);
        lastSubjectDataLayerConfs.push(sortBy(parentFolder.elements, (conf) => conf.type !== "folder"));
        inspectParentFolder(parentFolder, rootGetters, lastBaselayerConfs, lastFolderNames, lastSubjectDataLayerConfs);
    }
    else {
        lastBaselayerConfs.push(rootGetters.allBaselayerConfigs);
        lastFolderNames.push("root");
        lastSubjectDataLayerConfs.push(sortBy(rootGetters.allLayerConfigsStructured(treeSubjectsKey), (conf) => conf.type !== "folder"));
    }
}

export default {
    collectDataByFolder
};
