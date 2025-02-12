import {generateSimpleMutations} from "../../../shared/js/utils/generators";
import initialState from "./stateWmsTime";
import findCurrentTimeSliderObject from "../utils/findCurrentTimeSliderObject";

const mutations = {
    ...generateSimpleMutations(initialState),
    setWindowWidth (state) {
        state.windowWidth = window.innerWidth;
    },
    // TimeSlider mutations
    addTimeSliderObject (state, timeSliderObject) {
        state.timeSlider.objects = [
            ...state.timeSlider.objects,
            timeSliderObject
        ];
    },
    setTimeSliderActive ({timeSlider}, {active, currentLayerId, playbackDelay}) {
        timeSlider.active = active;
        timeSlider.currentLayerId = currentLayerId;
        timeSlider.playbackDelay = playbackDelay;
    },
    setTimeSliderDefaultValue ({timeSlider: {currentLayerId, objects}}, newValue) {
        const currentObject = findCurrentTimeSliderObject(currentLayerId, objects);

        if (currentObject) {
            currentObject.defaultValue = newValue;
        }
    },
    setTimeSliderPlaying ({timeSlider}, playing) {
        timeSlider.playing = playing;
    }
};

export default mutations;
