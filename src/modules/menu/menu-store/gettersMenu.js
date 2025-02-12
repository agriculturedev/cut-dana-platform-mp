import menuState from "./stateMenu";
import {badPathSymbol, idx} from "../../../shared/js/utils/idx";
import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import changeCase from "../../../shared/js/utils/changeCase";

const menuGetters = {
    ...generateSimpleGetters(menuState),

    /**
     * Returns the current component for a menu side.
     * @param {MenuNavigationState} state Local vuex state.
     * @param {String} side Menu Side.
     * @returns {Object} The current component.
     */
    currentComponent: state => side => {
        return state[side].navigation.currentComponent;
    },

    /**
     * @param {MenuNavigationState} state Local vuex state.
     * @param {String} side Menu Side.
     * @returns {Object} Returns the Name of the currently visible Component.
     */
    currentComponentName: state => side => {
        const currentComponent = state[side]?.navigation.currentComponent;
        let name = {};

        switch (currentComponent.type) {
            case "root":
                name = i18next.t("common:modules.menu.name");
                break;
            default:
                name = currentComponent.props !== undefined && currentComponent.props.name ? i18next.t(currentComponent.props.name) : currentComponent.type;
                break;
        }

        return name;
    },

    /**
     * @param {MenuNavigationState} state Local vuex state.
     * @param {String} side Menu Side
     * @returns {Object} Returns the currently visible Component.
     */
    currentFolderPath: state => side => {
        return state[side].navigation.currentComponent.props.path;
    },


    /**
     * @param {MenuNavigationState} state Local vuex state.
     * @param {String} side Menu Side
     * @returns {Object} Returns the current Menu-width
     */
    currentMenuWidth: state => side => {
        return state[side].width;
    },

    /**
     * Returns true, if a module with attribute hasMouseMapInteractions will be deactivated.
     * @param {MenuState} state Local vuex state.
     * @param {Object} getters Local vuex getters (discarded).
     * @param {Object} rootState vuex rootState (discarded).
     * @param {Object} rootGetters vuex rootGetters.
     * @returns {Boolean} Function returning component identified via deactivateModule.
     */
    deactivateModule: (state, getters, rootState, rootGetters) => type => {
        if (rootGetters[`Modules/${changeCase.upperFirst(type)}/hasMouseMapInteractions`]
            && changeCase.upperFirst(type) !== state.activeModuleMouseMapInteractions
        ) {
            return true;
        }

        return false;
    },

    /**
     * @param {Object} state Local vuex state.
     * @returns {Boolean} Whether the menu by side is opened.
     */
    expanded: state => side => {
        return state[side].expanded;
    },

    /**
     * @param {Object} state Local vuex state.
     * @returns {Boolean} Whether the mainMenu is opened.
     */
    mainExpanded: state => {
        return state.mainMenu.expanded;
    },

    /**
     * @param {Object} state Local vuex state.
     * @returns {(Object|null)} Title of the mainMenu or null.
     */
    mainTitle: state => {
        return state.mainMenu.title;
    },

    /**
     * @param {Object} state Local vuex state.
     * @returns {String} Icon used for button toggling the mainMenu.
     */
    mainToggleButtonIcon: state => {
        return state.mainMenu.toggleButtonIcon;
    },

    /**
     * Returns the Text to be chosen for backward menu navigation.
     * @param {MenuState} state Local vuex state.
     * @param {String} side side of the menu.
     * @returns {Boolean} Function returning false or the Text.
     */
    previousNavigationEntryText: (state) => side => {
        const previousEntry = state[side].navigation.history.length !== 0 ? state[side].navigation.history.slice(-1)[0] : "";
        let previousEntryText = false;

        if (previousEntry !== "") {
            switch (previousEntry.type) {
                case "root": {
                    previousEntryText = i18next.t("common:modules.menu.name");
                    break;
                }
                default: {
                    previousEntryText = previousEntry.props !== undefined && previousEntry.props.name ? i18next.t(previousEntry.props.name) : previousEntry.type;
                    break;
                }
            }
        }
        return previousEntryText;
    },

    /**
    Returns the navigation history according a side.
     * @param {MenuState} state Local vuex state.
     * @param {String} side side of the menu.
     * @returns {Boolean} Function returning false or the Text.
     */
    navigationHistory: (state) => side => {
        return state[side].navigation.history;
    },

    /**
     * @param {Object} state Local vuex state.
     * @returns {Boolean} Whether the secondaryMenu should be initially open.
     */
    secondaryExpanded: state => {
        return state.secondaryMenu.expanded;
    },

    /**
     * @param {Object} state Local vuex state.
     * @returns {(Object|null)} Title of the secondaryMenu or null.
     */
    secondaryTitle: state => {
        return state.secondaryMenu.title;
    },

    /**
     * @param {Object} state Local vuex state.
     * @returns {String} Icon used for button toggling the secondaryMenu.
     */
    secondaryToggleButtonIcon: state => {
        return state.secondaryMenu.toggleButtonIcon;
    },

    /**
     * @param {MenuState} state Local vuex state (discarded).
     * @param {Object} getters Local vuex getters.
     * @returns {(Object|null)} Function returning a section of the menu.
     */
    section: (state, getters) => path => {
        if (path && getters[path[0]]) {
            const section = idx(getters, path);

            if (section === badPathSymbol) {
                console.error(`Menu.getters.section: ${badPathSymbol.description} ${path}.`);
                return null;
            }

            return section;
        }

        console.error(`Menu: The given menu ${path[0]} is not configured in the config.json.`);
        return null;
    },

    /**
     * @param {Object} state Local vuex state.
     * @param {String} side side of the menu.
     * @returns {Boolean} Whether show description for modules in the menu by side.
     */
    showDescription: state => side => {
        return state[side].showDescription;
    },

    /**
     * @param {MenuState} state Local vuex state (discarded).
     * @param {Object} getters Local vuex getters.
     * @param {String} side side of the menu.
     * @returns {({title: string, idAppendix: string}|null)} Function returning an object including the title and an appendix for the titles id to make it unique; may return null if no title is configured.
     */
    titleBySide: (state, getters) => side => {
        if (side === "mainMenu" && getters.mainTitle) {
            return {...getters.mainTitle, idAppendix: side};
        }
        if (side === "secondaryMenu" && getters.secondaryTitle) {
            return {...getters.secondaryTitle, idAppendix: side};
        }
        return null;
    },

    /**
     * @param {MenuNavigationState} state Local vuex state.
     * @param {String} side Menu Side.
     * @returns {Boolean} Whether show Icon for the current component in the menu header by side
     */
    showHeaderIcon: state => side => {
        return state[side]?.showHeaderIcon;
    },

    /**
     * Returns the url params.
     * @param {Object} state menu store state.
     * @param {Object} getters menu store getters.
     * @returns {String} The url params.
     */
    urlParams: (state, getters) => {
        const params = {
                main: {
                    currentComponent: state.mainMenu.currentComponent
                },
                secondary: {
                    currentComponent: state.secondaryMenu.currentComponent
                }
            },
            mainAttributes = getters.getComponentAttributes(state.mainMenu.currentComponent),
            secondaryAttributes = getters.getComponentAttributes(state.secondaryMenu.currentComponent);

        if (mainAttributes) {
            params.main.attributes = mainAttributes;
        }
        if (secondaryAttributes) {
            params.secondary.attributes = secondaryAttributes;
        }

        return params;
    },

    /**
     * Returns the attributes of a module.
     * If a getters `urlParams` exists in the module the attributes are obtained from it,
     * if none exists all attributes of the state are used.
     * @param {Object} state state of the app-store.
     * @param {Object} getters menu store getters.
     * @param {Object} rootState root state.
     * @param {Object} rootGetters root getters.
     * @returns {Object} The component attributes.
     */
    getComponentAttributes: (state, getters, rootState, rootGetters) => currentComponent => {
        let moduleAttributes;

        if (currentComponent !== "root") {
            const moduleName = changeCase.upperFirst(currentComponent);

            moduleAttributes = rootGetters[`Modules/${moduleName}/urlParams`];

            if (typeof moduleAttributes === "undefined") {
                moduleAttributes = rootState.Modules[moduleName];
            }
        }

        return moduleAttributes;
    },
    /**
     * @param {MenuState} state Local vuex state (discarded).
     * @param {String} side side of the menu.
     * @returns {return} The requested menu side
     */
    menuBySide: (state) => side => {
        return state[side];
    }
};

export default menuGetters;
