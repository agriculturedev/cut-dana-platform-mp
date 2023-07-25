/* eslint-disable no-console */
const {PORTALCONFIG} = require("./constants");

module.exports = function createMainMenu (data, configJS, migratedTools) {
    console.info("mainMenu");
    const mainMenu = {
        expanded: true,
        sections: [[]]
    };

    addTitle(data, mainMenu);
    addSearchbar(data, mainMenu);
    fillMainSections(data, configJS, mainMenu, migratedTools);

    return mainMenu;
};

/**
 * Fills the menu sections of main menu with print, openConfig, legend, shareView, contact and language.
 * @param {Object} data parsed config.json content
 * @param {Object} configJS content of the config.js file
 * @param {Object} mainMenu v3 main menu object
 * @param {Array} migratedTools already migrated v2 tools
 * @returns {void}
 */
function fillMainSections (data, configJS, mainMenu, migratedTools) {
    console.info("   tools");
    const menu = data[PORTALCONFIG].menu,
        tools = menu.tools?.children,
        section = mainMenu.sections[0];

    if (tools?.print) {
        console.info("       print");
        const print = {...tools.print};

        print.type = "print";
        section.push(print);
        migratedTools.push("print");
    }
    console.info("       openConfig");
    section.push({
        type: "openConfig"
    });

    Object.entries(menu).forEach(([menuName, menuConfig]) => {
        if (!["info", "tree", "ansichten", "tools"].includes(menuName)) {
            console.info("       " + menuName);
            const config = {...menuConfig};

            config.type = menuName;
            section.push(config);
            migratedTools.push(menuName);
        }
    });

    console.info("       shareView");
    section.push({
        type: "shareView"
    });
    console.info("       news");
    section.push({
        type: "news"
    });
    if (configJS.portalLanguage?.enabled) {
        console.info("       language");
        section.push({
            type: "language"
        });
    }
    console.info("--- HINT: add nested folders to menu containing menu entries by using type 'folder'.");
    console.info("--- HINT: display HTML or excute action or open url by using type 'customMenuElement'.");
}

/**
 * Adds searchbar entries.
 * @param {Object} data parsed config.json content
 * @param {Object} mainMenu v3 main menu object
 * @returns {void}
 */
function addSearchbar (data, mainMenu) {
    if (data[PORTALCONFIG].searchBar) {
        const oldSearchbar = data[PORTALCONFIG].searchBar,
            newSearchbar = {
                searchInterfaces: {}
            };

        Object.entries(oldSearchbar).forEach(([searchName, searchConfig]) => {
            if (typeof searchConfig === "object") {
                console.info("   searchbar entry " + searchName);
                if (searchConfig.minchars === 3) {
                    delete searchConfig.minchars;
                }
                newSearchbar.searchInterfaces[searchName] = searchConfig;
            }
        });
        mainMenu.searchBar = newSearchbar;
    }
    else {
        console.warn("  no 'searchBar' found");
    }
}

/**
 * Adds title to main menu and fills it if content of titwl is available in v2 data.
 * @param {Object} data parsed config.json content
 * @param {Object} mainMenu v3 main menu object
 * @returns {void}
 */
function addTitle (data, mainMenu) {
    let newTitle = {};

    if (data[PORTALCONFIG].portalTitle) {
        const oldTitle = data[PORTALCONFIG].portalTitle,
            oldTitleText = oldTitle.title;

        newTitle = oldTitle;
        newTitle.text = oldTitleText;
        delete newTitle.title;
    }
    else {
        console.warn("  no 'portalTitle' to migrate found - fill mainMenu/title with placeholder");
        newTitle.text = "Titel des Portals";
        newTitle.logo = "";
        newTitle.link = "";
        newTitle.toolTip = "toolTip";
    }
    mainMenu.title = newTitle;
    console.info("   title");
}
