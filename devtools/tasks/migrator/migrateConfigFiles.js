/* eslint-disable no-console */
const fs = require("fs").promises,
    path = require("path"),
    createMainMenu = require("./createMainMenu"),
    createSecondaryMenu = require("./createSecondaryMenu"),
    {copyDir, deleteTranslateInName, getToolFromOldConfig, migrateIdWithSuffix, replaceInFile, removeAttributesFromTools} = require("./utils"),
    {PORTALCONFIG, PORTALCONFIG_OLD, TOPICS, TOPICS_OLD, BASEMAPS, BASEMAPS_OLD, BASEMAPS_NEW, SUBJECTDATA, SUBJECTDATA_OLD, DATA3D_OLD} = require("./constants"),
    rootPath = path.resolve(__dirname, "../../../"),
    {deprecated, removed, toolsNotToMigrate, toRemoveFromConfigJs, toRemoveFromTools} = require("./configuration");
let migratedTools = toolsNotToMigrate.concat(deprecated);

/**
 * Migrates the mapView.
 * @param {Object} data content of v2 config.json
 * @param {Object} configJS the javascript config.js content
 * @returns {Object} the migrated mapView
 */
function readMapView (data, configJS) {
    console.info("mapView");
    const mapView = data[PORTALCONFIG_OLD].mapView || {};

    if (configJS.mapInteractions) {
        mapView.mapInteractions = configJS.mapInteractions;
    }
    if (mapView.twoFingerPan) {
        if (!mapView.mapInteractions) {
            mapView.mapInteractions = {};
            mapView.mapInteractions.interactionModes = {
                twoFingerPan: mapView.twoFingerPan
            };
        }
        else {
            mapView.mapInteractions.interactionModes.twoFingerPan = mapView.twoFingerPan;
        }
        delete mapView.twoFingerPan;
    }

    return mapView;
}

/**
 * Migrates the controls.
 * @param {Object} data content of v2 config.json
 * @returns {Object} the migrated controls
 */
function migrateControls (data) {
    console.info("controls");
    const controls = data[PORTALCONFIG_OLD].controls;
    let addWMSConfig = null;

    if (controls.button3d === true) {
        if (!controls.rotation) {
            controls.rotation = {
                showResetRotationAlways: true,
                rotationIcons: true
            };
        }
        controls.tiltView = true;
    }

    if (controls?.startTool?.tools?.length > 0) {
        const startTools = [];

        controls.startModule = {};
        controls.startTool.tools.forEach(startTool => {
            const toolConfig = getToolFromOldConfig(data, startTool),
                startToolConfig = {...toolConfig};

            startToolConfig.type = startTool;
            deleteTranslateInName(startToolConfig);
            startTools.push(startToolConfig);
        });
        controls.startModule.secondaryMenu = startTools;
    }
    addWMSConfig = getToolFromOldConfig(data, "addWMS");

    if (addWMSConfig) {
        const tool = {...addWMSConfig};

        tool.type = "addWMS";
        deleteTranslateInName(tool);
        if (!controls.startModule) {
            controls.startModule = {};
        }
        if (!controls.startModule.secondaryMenu) {
            controls.startModule.secondaryMenu = [];
        }
        controls.startModule.secondaryMenu.push(tool);
    }
    if (controls.rotation) {
        controls.rotation = {...controls.rotation};
        if (controls.rotation.showAlways !== undefined) {
            controls.rotation.showResetRotationAlways = controls.rotation.showAlways;
            delete controls.rotation.showAlways;
        }
        console.info("--- HINT: New Controls to rotate the map are available: Set 'rotationIcons: true' at control 'rotate' to enable them.\n Enable compass rose in 2D with 'compass2d=true' at control 'rotate'.");
    }
    delete controls.attributions;
    delete controls.mousePosition;
    delete controls.orientation3d;
    delete controls.startTool;

    controls.expandable = {};
    console.info("--- HINT: fill controls into expandable, to expand and collapse controlbar.");
    console.info("--- HINT: use control 'startModule' to start tool by control-icon.");
    return controls;
}

/**
 * Migrates the gfi to getFeatureInfo.
 * @param {Object} data content of v2 config.json
 * @returns {Object} the migrated getFeatureInfo
 */
function migrateGFI (data) {
    const gfi = data[PORTALCONFIG_OLD].menu.tools?.children?.gfi || data[PORTALCONFIG_OLD].menu.gfi;
    let getFeatureInfo = null;

    if (gfi) {
        console.info("getFeatureInfo");
        getFeatureInfo = {...gfi};

        getFeatureInfo.type = "getFeatureInfo";

        removeAttributesFromTools(toRemoveFromTools, getFeatureInfo);
        migratedTools.push("gfi");
    }

    return getFeatureInfo;
}

/**
 * Migrates the tree.
 * @param {Object} data content of v2 config.json
 * @param {Object} configJS the javascript config.js content
 * @returns {Object} the migrated tree
 */
function migrateTree (data, configJS) {
    console.info("layer selection");
    const oldTree = data[PORTALCONFIG_OLD].tree,
        newTree = {};

    if (oldTree?.highlightedFeatures) {
        newTree.highlightedFeatures = oldTree.highlightedFeatures;
    }
    if (data[PORTALCONFIG_OLD]?.singleBaselayer) {
        newTree.singleBaselayer = data[PORTALCONFIG_OLD]?.singleBaselayer;
    }
    if (data[PORTALCONFIG_OLD].Baumtyp !== undefined) {
        data[PORTALCONFIG_OLD].treeType = data[PORTALCONFIG_OLD].Baumtyp;
        delete data[PORTALCONFIG_OLD].Baumtyp;
    }
    newTree.addLayerButton = {};
    newTree.addLayerButton.active = true;
    console.info("   --- HINT: Configure to search in topics by adding \"searchBar\" configuration to  \"addLayerButton\".\n");

    if (data[PORTALCONFIG_OLD].treeType === "default") {
        if (configJS.tree) {
            newTree.layerIDsToIgnore = [...configJS.tree.layerIDsToIgnore];
            newTree.layerIDsToStyle = [...configJS.tree.layerIDsToStyle];
            newTree.metaIDsToMerge = [...configJS.tree.metaIDsToMerge];
            newTree.metaIDsToIgnore = [...configJS.tree.metaIDsToIgnore];
        }
        newTree.type = "auto";
        newTree.validLayerTypesAutoTree = [
            "WMS",
            "SENSORTHINGS",
            "TERRAIN3D",
            "TILESET3D",
            "OBLIQUE"
        ];
        newTree.categories = [
            {
                "key": "kategorie_opendata",
                "name": "common:modules.layerTree.categoryOpendata",
                "active": true
            },
            {
                "key": "kategorie_inspire",
                "name": "common:modules.layerTree.categoryInspire"
            },
            {
                "key": "kategorie_organisation",
                "name": "common:modules.layerTree.categoryOrganisation"
            }
        ];

    }

    return newTree;
}

/**
 * Migrates the map parameters from config.js.
 * @param {Object} configJS the javascript configJs content
 * @returns {Object} the migrated map parameters from config.js
 */
function migrateMapParameters (configJS) {
    console.info("map parameters from config.js");

    const map = {
        layerPills: {
            active: true
        }
    };

    if (configJS.cesiumParameter) {
        map.map3dParameter = {...configJS.cesiumParameter};
        if (map.map3dParameter.enableLighting !== undefined) {
            if (map.map3dParameter.globe) {
                map.map3dParameter.globe.enableLighting = map.map3dParameter.enableLighting;
            }
            else {
                map.map3dParameter.globe = {
                    enableLighting: map.map3dParameter.enableLighting
                };
            }
            delete map.map3dParameter.enableLighting;
        }
        if (map.map3dParameter.maximumScreenSpaceError !== undefined) {
            if (map.map3dParameter.globe) {
                map.map3dParameter.globe.maximumScreenSpaceError = map.map3dParameter.maximumScreenSpaceError;
            }
            else {
                map.map3dParameter.globe = {
                    maximumScreenSpaceError: map.map3dParameter.maximumScreenSpaceError
                };
            }
            delete map.map3dParameter.maximumScreenSpaceError;
        }
        if (map.map3dParameter.tileCacheSize !== undefined) {
            if (map.map3dParameter.globe) {
                map.map3dParameter.globe.tileCacheSize = map.map3dParameter.tileCacheSize;
            }
            else {
                map.map3dParameter.globe = {
                    tileCacheSize: map.map3dParameter.tileCacheSize
                };
            }
            delete map.map3dParameter.tileCacheSize;
        }
    }
    if (configJS.featureViaURL) {
        map.featureViaURL = configJS.featureViaURL;
    }
    if (configJS.mapMarker) {
        map.mapMarker = configJS.mapMarker;
    }
    if (typeof configJS.mouseHover === "object") {
        map.mouseHover = configJS.mouseHover;
    }
    if (configJS.startingMap3D === true) {
        map.startingMapMode = "3D";
    }
    if (configJS.zoomTo) {
        map.zoomTo = configJS.zoomTo;
    }

    return map;
}

/**
 * Migrates the footer.
 * @param {Object} configJS the javascript configJs content
 * @returns {Object} the migrated footer
 */
function migrateFooter (configJS) {
    let newFooter = {};

    if (configJS.footer) {
        console.info("portalFooter");
        newFooter = configJS.footer;

        if (typeof configJS.scaleLine === "boolean") {
            newFooter.scaleLine = configJS.scaleLine;
        }
        delete newFooter.showVersion;
    }
    return newFooter;
}

/**
 * Migrates the topics.
 * @param {Object} data content of v2 config.json's topics
 * @returns {Object} the migrated topics
 */
function migrateTopics (data) {
    console.info(TOPICS);
    const oldTopics = data[TOPICS_OLD],
        oldBaseMaps = oldTopics[BASEMAPS] || oldTopics[BASEMAPS_OLD],
        oldSubjectData = oldTopics[SUBJECTDATA_OLD],
        old3DData = oldTopics[DATA3D_OLD],
        topics = {};

    topics[BASEMAPS_NEW] = migrateBaseMaps(oldBaseMaps);
    topics[SUBJECTDATA] = migrateSubjectData(oldSubjectData, old3DData);
    return topics;
}

/**
 * Migrates the basemaps.
 * @param {Object} oldData content of v2 config.json's basemaps
 * @returns {Object} the migrated basemaps
 */
function migrateBaseMaps (oldData) {
    console.info("   " + BASEMAPS);
    const baseMaps = {
            elements: []
        },
        data = {...oldData};
    let layers = [];

    if (data && JSON.stringify(data).includes("Ordner")) {
        if (data?.Ordner) {
            data.Ordner.forEach(folder => {
                if (folder.Layer) {
                    createGroupLayer(folder.Layer);
                    migrateIdWithSuffix(folder.Layer);
                    layers = layers.concat(folder.Layer);
                }
            });
        }
    }
    if (data.Layer) {
        migrateIdWithSuffix(data.Layer);
        if (JSON.stringify(data).includes("Oblique")) {
            data.Layer = data.Layer.filter(layer => layer.name !== "Oblique" && layer.typ !== "Oblique");
        }
        if (JSON.stringify(data).includes("Entities3D")) {
            data.Layer = data.Layer.filter(layer => layer.typ !== "Entities3D");
            console.warn("ATTENTION --- Removed 3d layer of typ Entities3D, must be under subjectlayer!");
        }
        if (JSON.stringify(data).includes("Terrain3D")) {
            data.Layer = data.Layer.filter(layer => layer.typ !== "Terrain3D");
            console.warn("ATTENTION --- Removed 3d layer of typ Terrain3D, must be under subjectlayer!");
        }
        if (JSON.stringify(data).includes("TileSet3D")) {
            data.Layer = data.Layer.filter(layer => layer.typ !== "TileSet3D");
            console.warn("ATTENTION --- Removed 3d layer of typ TileSet3D, must be under subjectlayer!");
        }
        createGroupLayer(data.Layer);
        layers = layers.concat(data.Layer);
        baseMaps.elements = layers;
    }

    return baseMaps;
}

/**
 * Migrates the subject data.
 * NOTICE migration of folder structure with 'Ordner' is not implemented!
 * @param {Object} oldSubjectData content of v2 config.json's subjectdata
 * @param {Object} old3DData content of v2 config.json's 3D data
 * @returns {Object} the migrated subject data
 */
function migrateSubjectData (oldSubjectData, old3DData) {
    console.info("   " + SUBJECTDATA_OLD);
    const subjectData = {
        elements: []
    };

    if (oldSubjectData && JSON.stringify(oldSubjectData).includes("Ordner")) {
        migrateFolderStructure(oldSubjectData, subjectData.elements);
    }
    else if (oldSubjectData?.Layer) {
        migrateIdWithSuffix(oldSubjectData.Layer);
        createGroupLayer(oldSubjectData.Layer);
        subjectData.elements = oldSubjectData.Layer;
    }
    if (old3DData && JSON.stringify(old3DData).includes("Ordner")) {
        if (old3DData?.Ordner) {
            const headFolder = {};

            headFolder.name = "common:modules.layerTree.subjectData3D";
            headFolder.type = "folder";
            headFolder.elements = [];
            subjectData.elements.push(headFolder);
            migrateFolderStructure(old3DData, headFolder.elements);
        }
    }
    else if (old3DData?.Layer) {
        const head = {};

        createGroupLayer(old3DData.Layer);

        head.name = "common:modules.layerTree.subjectData3D";
        head.elements = old3DData.Layer;
        subjectData.elements.push(head);
    }
    return subjectData;
}

/**
 * Migrates old Ordner structure to folder structure.
 * @param {Object} oldData containing 'Ordner'
 * @param {Array} elements to add new folder structure to
 * @returns {void}
 */
function migrateFolderStructure (oldData, elements) {
    oldData.Ordner.forEach(folder => {
        const newData = {};

        newData.name = folder.Titel;
        newData.type = "folder";
        newData.elements = [];
        if (folder.Layer) {
            let layers = [...folder.Layer];

            if (JSON.stringify(folder).includes("Oblique")) {
                layers = layers.filter(layer => layer.name !== "Oblique" && layer.typ !== "Oblique");
            }
            createGroupLayer(layers);
            migrateIdWithSuffix(layers);
            newData.elements.push(...layers);
        }
        if (folder.Ordner) {
            migrateFolderStructure(folder, newData.elements);
        }
        elements.push(newData);
    });
}

/**
 * Inspects for group layers and changes them to v3 structure.
 * @param {Array} layers to inspect and change group layers at
 * @returns {Array} the layers and if groups available, with v3 structure
 */
function createGroupLayer (layers) {
    let createdGroup = false;

    layers.forEach(layer => {
        if (layer.children) {
            const ids = [];

            layer.children.forEach(child => {
                ids.push(child.id);
            });
            layer.id = ids;
            delete layer.children;
            console.info("   created Grouplayer " + layer.name);
            createdGroup = true;
        }
    });
    if (createdGroup) {
        console.info("   --- HINT: layers are shown as configured in services.json. For special configuration add this to services.json.\n");
    }
}

/**
 * Returns the title and the logo from index.html.
 * @param {String} sourceFolder the spurce folder
 * @param {Object} indexFile the index.html file
 * @returns {String} the title and the logo from index.html
 */
async function getTitleFromHtml (sourceFolder, indexFile) {
    const data = await fs.readFile(path.resolve(sourceFolder, indexFile), "utf8"),
        startIndexTitle = data.indexOf("<title>"),
        endIndexTitle = data.indexOf("</title>"),
        title = data.substring(startIndexTitle + "<title>".length, endIndexTitle),
        startIndexLogo = data.indexOf("<img id=\"portal-logo\" src=\""),
        endIndexLogo = data.indexOf("/>", startIndexLogo);
    let logo = data.substring(startIndexLogo + "<img id=\"portal-logo\" src=\"".length, endIndexLogo)?.trim();

    if (logo?.endsWith("\"")) {
        logo = logo.substring(0, logo.length - 1);
    }
    return {title, logo};
}

/**
 * Migrates the index.html and removes loader stuff.
 * @param {String} sourceFolder the spurce folder
 * @param {String} destFolder the destination folder
 * @param {Object} indexFile the index.html file
 * @returns {void}
 */
function migrateIndexHtml (sourceFolder, destFolder, indexFile) {
    fs.readFile(path.resolve(sourceFolder, indexFile), "utf8")
        .then(data => {
            let result,
                // removes <div id="loader"... and load of special_loaders.js from index.html - loader is no longer provided.
                regex = /<div id="loader" [\s\S]*loaders.js"><\/script>/g;
            // removes the Cesium.js script-tag
            const regexCesium = /<script [\s\S]*Cesium.js"><\/script>/g;

            result = data.replace(regex, "");
            if (result.length === data.length) {
                regex = /<div id="loader" [\s\S]*.svg">[\s\S]*<\/div>[\s\S]*<\/div>/g;
                result = data.replace(regex, "");
                if (result.length === data.length) {
                    console.warn("ATTENTION --- Removing of loader and logo in index.html failed! Must be done by user.");
                }
            }
            if (result.includes("Cesium.js")) {
                result = result.replace(regexCesium, "");
            }
            if (result.indexOf("lgv-container") > -1 || result.indexOf("masterportal-container") > -1) {
                console.warn("IS TOO OLD - NOT MIGRATED: ", indexFile);
            }

            fs.writeFile(path.resolve(destFolder, indexFile), result, "utf8");

        })
        .catch(err => {
            console.error("write index.html", err);
        });
}

/**
 * Checks config.js file for module.exports and adds it if not found.
 * @param {String} sourceFolder the spurce folder
 * @param {Object} configJsFile the config.js file
 * @returns {void}
 */
async function checkConfigJS (sourceFolder, configJsFile) {
    const configJsPath = path.resolve(sourceFolder, configJsFile);

    if (Object.keys(require(configJsPath)).length === 0) {
        const data = await fs.readFile(configJsPath, "utf8"),
            dataToWrite = data + "\n  if (typeof module !== \"undefined\") { module.exports = Config; }";

        await fs.writeFile(configJsPath, dataToWrite, "utf8");
    }
}

/**
 * Migrates config.json, config.js and index.html to version 3.0.0.
 * @param {String} sourcePath the source path of the portal
 * @param {String} destPath the destination path to store the portal
 * @returns {void}
 */
async function migrateFiles (sourcePath, destPath) {
    const
        sourceFolder = path.resolve(rootPath, sourcePath),
        destFolder = path.resolve(rootPath, destPath);

    fs.readdir(sourceFolder)
        .then(files => {
            let configJS = null;
            const configJsonFile = files.find(fileName => fileName === "config.json"),
                configJsFile = files.find(fileName => fileName === "config.js"),
                indexFile = files.find(fileName => fileName === "index.html"),
                configJsonSrcFile = path.resolve(sourceFolder, configJsonFile),
                configJsonDestFile = path.resolve(destFolder, configJsonFile).split(path.sep).join("/"),
                configJsSrcFile = path.resolve(sourceFolder, configJsFile),
                configJsDestFile = path.resolve(destFolder, configJsFile);

            checkConfigJS(sourceFolder, configJsFile).then(() => {
                configJS = require(path.resolve(sourceFolder, configJsFile));

                copyDir(sourcePath, destPath).then(() => {
                    fs.readFile(configJsonSrcFile, "utf8")
                        .then(data => {
                            const migrated = {},
                                parsed = JSON.parse(data);

                            if (!parsed[PORTALCONFIG_OLD].mainMenu) {
                                console.info("\n#############################     migrate     #############################\n");
                                console.info("--- ATTENTION --- \nthis version will not migrate the following tools: ", toolsNotToMigrate.join(", ") + "\n");
                                console.info("\ntools no longer available are not migrated: ", removed.join(", ") + "\n");
                                console.info("\ndeprecated tools are not migrated:", deprecated.join(", ") + "\n---\n");
                                console.info("source: ", configJsonSrcFile, "\ndestination: ", configJsonDestFile, "\n");
                                migratedTools = migratedTools.concat(removed);
                                getTitleFromHtml(sourceFolder, indexFile).then((titleAndLogo) => {
                                    const gfi = migrateGFI(parsed);

                                    migrated[PORTALCONFIG] = {};
                                    migrated[PORTALCONFIG].map = migrateMapParameters(configJS);
                                    migrated[PORTALCONFIG].map.mapView = readMapView(parsed, configJS);
                                    migrated[PORTALCONFIG].portalFooter = migrateFooter(configJS);
                                    migrated[PORTALCONFIG].map.controls = migrateControls(parsed);
                                    if (gfi) {
                                        migrated[PORTALCONFIG].map.getFeatureInfo = gfi;
                                    }
                                    migrated[PORTALCONFIG].tree = migrateTree(parsed, configJS);
                                    migrated[PORTALCONFIG].mainMenu = createMainMenu(parsed, titleAndLogo, configJS, migratedTools, toRemoveFromTools);
                                    migrated[PORTALCONFIG].secondaryMenu = createSecondaryMenu(parsed, migratedTools, toRemoveFromTools);
                                    migrated[TOPICS] = migrateTopics(parsed);

                                    fs.mkdir(destPath, {recursive: true})
                                        .then(() => {
                                            fs.writeFile(configJsonDestFile, JSON.stringify(migrated, null, 4), "utf8")
                                                .then(() => {
                                                    replaceInFile(configJsonDestFile);
                                                    fs.copyFile(configJsSrcFile, configJsDestFile);
                                                    migrateIndexHtml(sourceFolder, destFolder, indexFile);
                                                    console.info("ATTENTION - TODO for User --- remove from config.js by yourself: ", toRemoveFromConfigJs.join(", ") + "\n");
                                                    console.info("SUCCESSFULLY MIGRATED: ", destFolder);
                                                })
                                                .catch(err => {
                                                    console.error(err);
                                                });
                                        })
                                        .catch(err => {
                                            console.error(err);
                                        });
                                });
                            }
                            else {
                                console.warn("IS ALREADY IN V3.0.0 - NOT MIGRATED: ", configJsonSrcFile);
                            }
                        })
                        .catch(err => {
                            console.error(err);
                        });
                })
                    .catch(err => {
                        console.error(err);
                    });
            })
                .catch(err => {
                    console.error(err);
                });
        })
        .catch(err => {
            console.error(err);
        });
}


/**
 * Migrates config.json, config.js and index.html to version 3.0.0.
 * @param {Object} answers contains the sourcePath and the destPath
 * @returns {void}
 */
module.exports = function migrate (answers) {
    const sourcePath = path.resolve(rootPath, answers.sourcePath);

    fs.readdir(sourcePath)
        .then(files => {
            if (files.find(fileName => fileName === "config.json")) {
                migrateFiles(answers.sourcePath, answers.destPath);
            }
            else {
                files.forEach(file => {
                    const sourceFolder = path.resolve(sourcePath, file);

                    fs.readdir(sourceFolder)
                        .then(sourcePathFiles => {
                            if (sourcePathFiles.find(fileName => fileName === "config.json")) {
                                migrateFiles(answers.sourcePath + path.sep + file, answers.destPath + path.sep + file);
                            }
                        })
                        .catch(err => {
                            console.error(err);
                        });
                });
            }
        })
        .catch(err => {
            console.error(err);
        });
};

