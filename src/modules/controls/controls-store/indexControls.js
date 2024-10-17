import actions from "./actionsControls";
import getters from "./gettersControls";
import mutations from "./mutationsControls";
import state from "./stateControls";

import BackForward from "../backForward/store/indexBackForward";
import Button3d from "../button3d/store/indexButton3d";
import Freeze from "../freeze/store/indexFreeze";
import FullScreen from "../fullScreen/store/indexFullScreen";
import Orientation from "../orientation/store/indexOrientation";
import Rotation from "../rotation/store/indexRotation";
import StartModule from "../startModule/store/indexStartModule";
import TiltView from "../tiltView/store/indexTiltView";
import TotalView from "../totalView/store/indexTotalView";
import Zoom from "../zoom/store/indexZoom";

/**
 * controls-Module is required to be able to nest controls
 * in the store as ["controls", controlName].
 * Also holds information on control components and allows
 * addons to register themselves via mutation.
 */
export default {
    namespaced: true,
    modules: {
        BackForward,
        Button3d,
        Freeze,
        FullScreen,
        Orientation,
        Rotation,
        StartModule,
        TiltView,
        TotalView,
        Zoom
    },
    actions,
    getters,
    mutations,
    state
};
