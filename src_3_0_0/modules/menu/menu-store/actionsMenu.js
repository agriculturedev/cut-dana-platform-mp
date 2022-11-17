import Vue from "vue";
import upperFirst from "../../../shared/js/utils/upperFirst";

export default {
    /**
     * Adds a module state to a menu side.
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @param {Object} param.state the state
     * @param {Object} moduleState State of a module.
     * @returns {Number} The position in the first section.
     */
    addModule ({commit, state}, moduleState) {
        commit("addModuleToMenuSection", moduleState);

        return state[moduleState.menuSide]?.sections[0]?.length - 1;
    },

    /**
     * Merge the menu state.
     * @param {Object} param store context
     * @param {Object} param.commit the commit
     * @param {Object} param.state the state
     * @param {Object} payLoad The payload.
     * @param {Object} payLoad.mainMenu The main menu setting.
     * @param {Object} payLoad.secondaryMenu The secondary menu setting.
     * @returns {void}
     */
    mergeMenuState ({commit, state}, {mainMenu, secondaryMenu}) {
        commit("setMainMenu", Object.assign(state.mainMenu, mainMenu));
        commit("setSecondaryMenu", Object.assign(state.secondaryMenu, secondaryMenu));
        commit("Navigation/setEntries", {
            mainMenu: [],
            secondaryMenu: []
        });
    },

    /**
     * Action triggered when a menu element has been clicked.
     * Add an entry to the navigation and, when the element
     * was a Folder, focus the first child-element, otherwise,
     * call the setActive action / mutation of the element.
     * @param {Object} context Vuex context object.
     * @param {Array} path Path leading up to the clicked menu element.
     * @returns {void}
     */
    clickedMenuElement ({commit, dispatch, getters}, path) {
        const {type} = getters.section(path);

        if (type) {
            commit("Menu/Navigation/addEntry", path, {root: true});
            if (type === "folder") {
                Vue.nextTick(() => document.getElementById(`menu-offcanvas-body-items-element-0-${path[0]}`)?.focus());
                return;
            }
            Vue.nextTick(() => dispatch("setElementActive", {moduleNamespace: upperFirst(type), isActive: true}));
            return;
        }
        console.error("Menu: A menu entry is missing the required value \"type\".");
    },

    /**
     * Activates the module with the given namespace.
     * If it utilizes an action for activation, that is dispatched.
     * Otherwise, commit the mutation.
     * @param {Object} context Vuex context object.
     * @param {Object} payload Object containing the payload.
     * @param {String} payload.moduleNamespace Namespace of the module which should be activated.
     * @param {String} payload.isActive Whether the module should be activated or deactivated.
     * @returns {void}
     */
    setElementActive ({commit, dispatch}, {moduleNamespace, isActive}) {
        const setActiveName = `Modules/${moduleNamespace}/setActive`;

        if (Object.keys(this._actions).includes(setActiveName)) {
            dispatch(setActiveName, isActive, {root: true});
        }
        else {
            commit(setActiveName, isActive, {root: true});
        }
    }
};
