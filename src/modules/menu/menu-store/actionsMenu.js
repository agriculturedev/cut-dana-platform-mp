import {nextTick} from "vue";
import changeCase from "../../../shared/js/utils/changeCase";
import {trackMatomo} from "../../../plugins/matomo";

export default {
    /**
     * Activates the current component in the menu by side.
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} currentComponent The current component.
     * @param {String} type The type of the current component.
     * @param {String} side The menu side.
     * @returns {void}
     */
    activateCurrentComponent ({commit, dispatch, rootGetters}, {currentComponent, type, side}) {
        commit("setExpandedBySide", {expanded: true, side: side});
        dispatch("changeCurrentComponent", {
            type: currentComponent.type,
            side: side,
            props: {
                name: rootGetters[`Modules/${type}/name`]
            }
        });
    },

    /**
     * Change the currently shown component.
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.state the state
     * @param {String} type The current component type.
     * @param {String} side secondary or main Menu
     * @param {String} props The props of the current component.
     * @returns {void}
     */
    changeCurrentComponent ({commit, dispatch, state}, {type, side, props}) {
        const currentType = state[side].navigation.currentComponent.type,
            currentProps = state[side].navigation.currentComponent.props;

        if (currentType !== type || currentType === "folder" && type === "folder" || currentType === "layerSelection" && type === "layerSelection") {
            commit("setCurrentComponent", {type, side, props});
            dispatch("changeCurrentMouseMapInteractionsComponent", {type, side});
        }
        else if (props?.name !== currentProps?.name) {
            commit("setCurrentComponentProps", {side, props});
        }
        if (type !== "getFeatureInfo" && type !== "searchbar" && type !== "layerSelection") {
            trackMatomo("Menu", "Menuitem clicked", i18next.t(props.name));
        }
    },

    /**
     * Change the current component with mouse map interactions.
     * Note: Only one such component can be active at the same time.
     * If another one is switched on, the other one is closed and reset to "root";
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} param.state the state
     * @param {String} type The component type.
     * @param {String} side secondary or main Menu
     * @returns {void}
     */
    changeCurrentMouseMapInteractionsComponent ({commit, rootGetters, state}, {type, side}) {
        if (type !== state.currentMouseMapInteractionsComponent && rootGetters[`Modules/${changeCase.upperFirst(type)}/hasMouseMapInteractions`]) {
            const otherSide = side === "mainMenu" ? "secondaryMenu" : "mainMenu";

            if (state[otherSide].navigation.currentComponent.type === state.currentMouseMapInteractionsComponent) {
                commit("switchToRoot", otherSide);
            }

            commit("setCurrentMouseMapInteractionsComponent", type);
        }
    },

    /**
     * Action triggered when a menu element has been clicked.
     * Add an entry to the navigation and, when the element
     * was a Folder, focus the first child-element.
     * @param {Object} param store context
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.rootGetters the rootGetters
     * @param {String} name Name of the element.
     * @param {Array} path Path leading up to the clicked menu element.
     * @param {String} side The menu side of the element.
     * @param {String} type type of the element.
     * @param {Object} properties properties of the element.
     * @returns {void}
     */
    clickedMenuElement ({dispatch, rootGetters}, {name, path, side, type, properties}) {
        if (type) {
            if (type === "customMenuElement") {
                if (properties.openURL !== undefined) {
                    window.open(properties.openURL);
                }
                if (properties.execute !== undefined) {
                    dispatch(properties.execute.action, properties.execute.payload, {root: true});
                }
                if (properties.htmlContent === undefined && properties.pathToContent === undefined) {
                    if (rootGetters.isMobile) {
                        dispatch("Menu/toggleMenu", side, {root: true});
                    }
                    return;
                }
            }
            if (type === "folder") {
                nextTick(() => {
                    dispatch("changeCurrentComponent", {type: type, side: side, props: {path: path, name: name}});
                });
            }
            else {
                const props = properties ? Object.assign(properties, {name: name}) : {name: name};

                dispatch("changeCurrentComponent", {type: type, side: side, props: props});
            }
        }
    },

    /**
     * Closes and resets Menucontainers.
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.getters the getters
     * @param {Object} param.state the state
     * @param {String} side secondary or main Menu
     * @returns {void}
     */
    closeMenu ({commit, dispatch, getters, state}, side) {
        if (getters.currentComponent(side).type === state.currentMouseMapInteractionsComponent && getters.currentComponent(side).type !== state.defaultComponent) {
            dispatch("changeCurrentMouseMapInteractionsComponent", {type: state.defaultComponent, side});
        }

        commit("switchToRoot", side);
        dispatch("toggleMenu", side);
    },

    /**
     * Properly deactivates an element if it is not a folder
     * removes its entry from the navigation and handles search navigation case.
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.getters the getters
     * @param {Object} param.state the state
     * @param {Object} param.rootGetters the rootGetters
     * @param {String} side Side on which the navigation action occurred.
     * @returns {void}
     */
    navigateBack ({commit, dispatch, getters, state, rootGetters}, side) {
        const searchValue = rootGetters["Modules/SearchBar/searchInput"];

        nextTick(() => {
            if (getters.currentComponent(side).type === state.currentMouseMapInteractionsComponent && getters.currentComponent(side).type !== state.defaultComponent) {
                dispatch("changeCurrentMouseMapInteractionsComponent", {type: state.defaultComponent, side});
            }
            if (rootGetters["Modules/SearchBar/showAllResults"] === false || rootGetters["Modules/SearchBar/currentSide"] !== side) {
                commit("switchToPreviousComponent", side);
                commit("Modules/SearchBar/setShowInTree", false, {root: true});
            }
            if (getters.currentComponent(side).type === "searchbar") {
                dispatch("Modules/SearchBar/updateSearchNavigation", side, {root: true});
            }
            dispatch("handleActionButtons", {side: side, searchValue: searchValue});
        });
    },

    /**
     * Handles the behaviour of menu navigation in action button context
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.getters the getters
     * @param {Object} param.rootGetters the rootGetters
     * @param {String} side Side on which the navigation action occurred.
     * @param {String} searchValue value of the last search input.
     * @returns {void}
     */
    handleActionButtons ({commit, dispatch, getters, rootGetters}, {side, searchValue}) {
        const currentSearchInput = searchValue;

        if (getters.currentComponent(side).type === "layerSelection") {
            dispatch("Modules/SearchBar/updateSearchNavigation", side, {root: true});

            if (rootGetters["Modules/SearchBar/searchInput"] !== "") {
                commit("Modules/SearchBar/setSearchInput", "", {root: true});
                commit("Modules/SearchBar/setCurrentSearchInputValue", "", {root: true});
                dispatch("navigateBack", side);
            }
        }

        if (getters.currentComponent(side).type === "layerInformation") {
            commit("switchToPreviousComponent", side);
        }
        if (getters.navigationHistory(side)[1]?.type === "searchBar" && getters.navigationHistory(side)[2]?.type === "searchBar") {
            dispatch("Modules/SearchBar/updateSearchNavigation", side, {root: true});
            commit("Modules/SearchBar/setSearchInput", currentSearchInput, {root: true});
        }

    },

    /**
     * Resets MenuContainers.
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @param {Object} param.dispatch the dispatch
     * @param {Object} param.getters the getters
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} param.state the state
     * @param {String} side secondary or main Menu
     * @returns {void}
     */
    resetMenu ({commit, dispatch, getters, rootGetters, state}, side) {
        if (getters.currentComponent(side).type === state.currentMouseMapInteractionsComponent && getters.currentComponent(side).type !== state.defaultComponent) {
            dispatch("changeCurrentMouseMapInteractionsComponent", {type: state.defaultComponent, side});
        }

        if (rootGetters["Modules/SearchBar/currentSide"] === side) {
            dispatch("Modules/SearchBar/updateSearchNavigation", side, {root: true});
        }
        commit("switchToRoot", side);
    },

    /**
     * Toggles Menucontainers.
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} param.state the state
     * @param {String} side secondary or main Menu
     * @returns {void}
     */
    toggleMenu ({commit, rootGetters, state}, side) {
        if (side === "mainMenu") {
            if (rootGetters.isMobile && state.secondaryMenu.expanded) {
                commit("setExpandedBySide", {expanded: false, side: "secondaryMenu"});
            }
            commit("setExpandedBySide", {expanded: !state.mainMenu.expanded, side});
        }
        else if (side === "secondaryMenu") {
            if (rootGetters.isMobile && state.mainMenu.expanded) {
                commit("setExpandedBySide", {expanded: false, side: "mainMenu"});
            }
            commit("setExpandedBySide", {expanded: !state.secondaryMenu.expanded, side});
        }
    },

    /**
    * Update the state attributes of the currentComponent.
     * @param {Object} param store context
     * @param {Object} param.dispatch the dispatch
     * @param {Object} params The params.
     * @param {String} type The type of the current component.
     * @param {Object} attributes The attributes.
     * @returns {void}
     */
    updateComponentState ({dispatch}, {type, attributes}) {
        if (this._actions[`Modules/${type}/urlParams`]) {
            if (typeof attributes === "object") {
                dispatch(`Modules/${type}/urlParams`, attributes, {root: true});
            }
            else {
                dispatch(`Modules/${type}/urlParams`, JSON.parse(attributes), {root: true});
            }
        }
        else {
            Object.assign(this.state.Modules[type], attributes);
        }
    }
};
