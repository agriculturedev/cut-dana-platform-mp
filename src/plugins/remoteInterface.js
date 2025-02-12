import store from "../app-store";
import main from "../main";

export default {
    install (options) {
        if (options === undefined || typeof options.postMessageUrl !== "string") {
            console.error("RemoteInterface could not been installed: Param \"postMessageUrl\" missing.");
            return;
        }

        window.addEventListener("message", event => {
            let fullActionName = "";

            if (event.data.namespace === undefined || event.data.action === undefined) {
                return;
            }

            fullActionName = event.data.namespace + "/" + event.data.action;

            if (event.data.args === undefined) {
                event.data.args = null;
            }

            try {
                store.dispatch(fullActionName, event.data.args, {root: true});
            }
            catch (e) {
                console.error("RemoteInterface could not call \"" + fullActionName + "\". Please ensure this action is available.");
            }
        });

        main.getApp().config.globalProperties.$remoteInterface = {
            sendMessage: params => {
                if (params instanceof Object === false) {
                    console.error("RemoteInterface sendMessage error: Given param is not an Object.");
                    return;
                }

                parent.postMessage(params, options.postMessageUrl);
            }
        };
    }
};
