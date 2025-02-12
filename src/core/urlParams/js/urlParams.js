import {nextTick} from "vue";
import store from "../../../app-store";
import globalUrlParams from "./globalUrlParams";
import layerUrlParams from "../../../core/layers/js/layerUrlParams";
import mapUrlParams from "../../../core/maps/js/mapUrlParams";
import menuUrlParams from "../../../modules/menu/js/menuUrlParams";
import searchBarUrlParams from "../../../modules/searchBar/js/searchBarUrlParams";

/**
 * Sets the url params to the app-store state.
 * @returns {void}
 */
export function initializeUrlParams () {
    const params = new URLSearchParams(window.location.search);

    params.forEach((value, key) => {
        store.state.urlParams[key.toUpperCase()] = value;
    });

    globalUrlParams.processGlobalUrlParams();
}

/**
 * Processes the url params.
 * @returns {void}
 */
export function startProcessUrlParams () {
    nextTick(() => {
        layerUrlParams.processLayerUrlParams();
        mapUrlParams.processMapUrlParams();
        menuUrlParams.processMenuUrlParams();
        searchBarUrlParams.processSearchBarUrlParams();
    });
}
