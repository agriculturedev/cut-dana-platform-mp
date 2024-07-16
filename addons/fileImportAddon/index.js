import FileImportAddonComponent from "./components/FileImportAddon.vue";
import FileImportAddonStore from "./store/indexFileImportAddon";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: FileImportAddonComponent,
    store: FileImportAddonStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
