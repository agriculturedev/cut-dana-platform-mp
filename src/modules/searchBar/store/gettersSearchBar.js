import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import stateSearchBar from "./stateSearchBar";

/**
 * The getters for the searchBar.
 * @module modules/searchBar/store/getterssearchBar
 */
export default {
    ...generateSimpleGetters(stateSearchBar)
};

