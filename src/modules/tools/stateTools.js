import Draw from "./draw/components/Draw.vue";
import ScaleSwitcher from "./scale/components/ScaleSwitcher.vue";
import SupplyCoord from "./supplyCoord/components/SupplyCoord.vue";
import FileImport from "./fileImport/components/FileImport.vue";

/**
 * User type definition
 * @typedef {object} ToolsState
 * @property {object} componentMap contains all tool components
 * @property {object[]} configuredTools gets all tools that should be initialized
 */
const state = {
    componentMap: {
        draw: Draw,
        scaleSwitcher: ScaleSwitcher,
        supplyCoord: SupplyCoord,
        /**
         * coord
         * @deprecated in 3.0.0
         */
        coord: SupplyCoord,
        fileImport: FileImport
    },
    configuredTools: []
};

export default state;
