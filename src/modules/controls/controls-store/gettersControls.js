import {generateSimpleGetters} from "../../../shared/js/utils/generators";
import stateControls from "./stateControls";

import BackForward from "../backForward/components/BackForward.vue";
import Button3d from "../button3d/components/Button3dItem.vue";
import Freeze from "../freeze/components/FreezeScreen.vue";
import FullScreen from "../fullScreen/components/FullScreen.vue";
import Orientation from "../orientation/components/OrientationItem.vue";
import Rotation from "../rotation/components/RotationItem.vue";
import StartModule from "../startModule/components/StartModule.vue";
import TiltView from "../tiltView/components/TiltView.vue";
import TotalView from "../totalView/components/TotalView.vue";
import Zoom from "../zoom/components/ZoomInAndOut.vue";

const getters = {
    ...generateSimpleGetters(stateControls),

    componentMap: () => {
        return {
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
        };
    }
};

export default getters;
