import {createApp} from "vue";
import DrawItem from "../components/DrawItem.vue";

const app = createApp(DrawItem),
    main = {
        /**
         * Returns the app.
         * @returns {Object} the app
         */
        getApp: () => app
    };

app.mount();

export default main;
