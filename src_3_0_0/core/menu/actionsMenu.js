import Vue from "vue";

export default {
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
        const {itemType} = getters.section(path);

        commit("MenuNavigation/addEntry", path, {root: true});
        if (itemType) {
            if (itemType === "folder") {
                Vue.nextTick(() => document.getElementById(`menu-offcanvas-body-items-element-0-${path[0]}`)?.focus());
                return;
            }
            dispatch("setElementActive", {moduleNamespace: itemType.charAt(0).toUpperCase() + itemType.slice(1), isActive: true});
            return;
        }
        console.error("Menu: A menu entry is missing the required value \"itemType\".");
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
        const setActiveName = `Menu/${moduleNamespace}/setActive`;

        if (Object.keys(this._actions).includes(setActiveName)) {
            dispatch(setActiveName, isActive, {root: true});
        }
        else {
            commit(setActiveName, isActive, {root: true});
        }
    }
};
