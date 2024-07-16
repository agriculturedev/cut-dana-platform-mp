
import {generateSimpleGetters} from "../../../src/app-store/utils/generators";
import FileImportAddonState from "./stateFileImportAddon";

const getters = {
    ...generateSimpleGetters(FileImportAddonState)

    // NOTE overwrite getters here if you need a special behaviour in a getter
};

export default getters;
