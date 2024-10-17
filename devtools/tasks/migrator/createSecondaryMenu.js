/* eslint-disable no-console */
const {PORTALCONFIG_OLD} = require("./constants"),
    {deleteTranslateInName, removeAttributesFromTools} = require("./utils");

module.exports = function createSecondaryMenu (data, migratedTools, toRemoveFromTools) {
    console.info("secondaryMenu");
    const secondaryMenu = {
        expanded: false,
        sections: [[]]
    };

    fillSections(data, secondaryMenu, migratedTools, toRemoveFromTools);
    return secondaryMenu;
};

/**
 * Fills the menu sections of secondary menu with tools contained in v2 config.json.
 * @param {Object} data parsed config.json content
 * @param {Object} secondaryMenu v3 secondary menu object
 * @param {Array} migratedTools already migrated v2 tools
 *  @param {Object} toRemoveFromTools attributes to remove from tools by type
 * @returns {void}
 */
function fillSections (data, secondaryMenu, migratedTools, toRemoveFromTools) {
    console.info("   tools");
    const menu = data[PORTALCONFIG_OLD].menu,
        tools = menu.tools?.children,
        section = secondaryMenu.sections[0];

    if (tools) {
        Object.entries(tools).forEach(([toolName, toolConfig]) => {
            if (!migratedTools.includes(toolName)) {
                const tool = {...toolConfig};
                let name = toolName;

                if (name.toLowerCase() === "coordtoolkit") {
                    name = "coordToolkit";
                }
                if (name === "draw") {
                    name = "draw_old";
                }
                console.info("       " + name);
                if (name === "layerClusterToggler") {
                    console.log(tool);
                    const migratedIds = [];

                    tool.clusterList.forEach(layerId => {
                        if (typeof layerId === "object") {
                            const idCopy = {...layerId};

                            migratedIds.push(idCopy.layerId + "." + idCopy.suffix);
                        }
                    });
                    delete tool.clusterList;
                    tool.layerIdList = migratedIds;
                }
                if (name === "parcelSearch") {
                    console.info("--- HINT parcelSearch was removed, use wfsSearch instead.");
                }
                if (name === "draw_old") {
                    if (Array.isArray(tool.iconList)) {
                        tool.iconList.forEach(icon => {
                            delete icon.caption;
                        });
                    }
                }
                if (name.toLowerCase() === "wfst") {
                    adaptWfst(tool);
                }
                if (name === "wfsSearch") {
                    tool.instances.forEach(instance => {
                        instance.literals?.forEach(literal => {
                            const lits = literal.literals ? literal.literals : literal.clause?.literals;

                            lits?.forEach(subLiteral => {
                                if (subLiteral.field) {
                                    const type = subLiteral.field.type;

                                    delete subLiteral.field.type;
                                    subLiteral.field.queryType = type;
                                    if (subLiteral.field.usesId === false) {
                                        subLiteral.field.usesId = null;
                                    }
                                }
                            });
                        });
                    });
                }
                tool.type = name;
                deleteTranslateInName(tool);
                removeAttributesFromTools(toRemoveFromTools, tool);
                section.push(tool);
                migratedTools.push(toolName);
            }
        });
    }
    Object.entries(menu).forEach(([menuName, menuConfig]) => {
        if (!["info", "tree", "ansichten", "tools"].includes(menuName) && !migratedTools.includes(menuName)) {
            const config = {...menuConfig};

            config.type = menuName;
            removeAttributesFromTools(toRemoveFromTools, config);
            console.info("       " + menuName);
            section.push(config);
            migratedTools.push(menuName);
        }
    });
}

/**
 * Adapts tool config for wfst.
 * @param {Object} tool the tool config
 * @returns {void}
 */
function adaptWfst (tool) {
    if (tool.useProxy !== undefined) {
        delete tool.useProxy;
    }
    if (Array.isArray(tool.areaButton)) {
        tool.polygonButton = [...tool.areaButton];
        delete tool.areaButton;
    }
    else if (typeof tool.areaButton === "boolean") {
        tool.polygonButton = tool.areaButton;
        delete tool.areaButton;
    }
    if (tool.edit !== undefined) {
        console.info("--- HINT Wfst:property 'edit' was removed. Move content to property 'update' by hand!");
    }
    if (Array.isArray(tool.pointButton)) {
        tool.pointButton.forEach(pointButton => {
            if (pointButton.show !== undefined) {
                pointButton.available = pointButton.show;
                delete pointButton.show;
            }
            if (pointButton.caption !== undefined) {
                pointButton.text = pointButton.caption;
                delete pointButton.caption;
            }
        });
    }
    if (Array.isArray(tool.lineButton)) {
        tool.lineButton.forEach(lineButton => {
            if (lineButton.show !== undefined) {
                lineButton.available = lineButton.show;
                delete lineButton.show;
            }
            if (lineButton.caption !== undefined) {
                lineButton.text = lineButton.caption;
                delete lineButton.caption;
            }
        });
    }
    if (Array.isArray(tool.polygonButton)) {
        tool.polygonButton.forEach(polygonButton => {
            if (polygonButton.show !== undefined) {
                polygonButton.available = polygonButton.show;
                delete polygonButton.show;
            }
            if (polygonButton.caption !== undefined) {
                polygonButton.text = polygonButton.caption;
                delete polygonButton.caption;
            }
        });
    }
    if (Array.isArray(tool.update)) {
        tool.update.forEach(update => {
            if (update.show !== undefined) {
                update.available = update.show;
                delete update.show;
            }
            if (update.caption !== undefined) {
                update.text = update.caption;
                delete update.caption;
            }
        });
    }
    if (Array.isArray(tool.delete)) {
        tool.delete.forEach(deleteProp => {
            if (deleteProp.show !== undefined) {
                deleteProp.available = deleteProp.show;
                delete deleteProp.show;
            }
            if (deleteProp.caption !== undefined) {
                deleteProp.text = deleteProp.caption;
                delete deleteProp.caption;
            }
        });
    }
}

