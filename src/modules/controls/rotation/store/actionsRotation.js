import degreesToRadians from "../../../../shared/js/utils/degreesToRadians";

export default {
    /**
     * Moves the map in 2d by state's moveDistance.
     * @param {Object} context the vuex context
     * @param {Object} context.dispatch the dispatch
     * @param {Object} context.getters the getters
     * @param {Object} context.rootGetters the rootGetters
     * @param {Object} event The event from button.
     * @returns {void}
     */
    move2d ({dispatch, getters, rootGetters}, event) {
        const distance = getters.moveDistance,
            currentCenter = rootGetters["Maps/center"];
        let newCenter = null;

        switch (event.currentTarget.id) {
            case "compass_north": {
                newCenter = [currentCenter[0], currentCenter[1] + distance];
                break;
            }
            case "compass_south": {
                newCenter = [currentCenter[0], currentCenter[1] - distance];
                break;
            }
            case "compass_east": {
                newCenter = [currentCenter[0] + distance, currentCenter[1]];
                break;
            }
            case "compass_west": {
                newCenter = [currentCenter[0] - distance, currentCenter[1]];
                break;
            }
            default: {
                console.warn("Rotation move2d event currentTarget id cannot be found! Move not possible.");
                break;
            }
        }
        if (newCenter !== null) {
            dispatch("Maps/setCenter", newCenter, {root: true});
        }
    },
    /**
     * Rotates the map view clockwise for 45 degrees in radians and sets the new rotation.
     * @param {Object} context the vuex context
     * @param {Object} context.commit the commit
     * @param {Object} context.getters the getters
     * @returns {void}
     */
    rotateClockwise ({commit, getters}) {
        let newRotation;

        if (getters.rotation < degreesToRadians(0) && getters.rotation > -1 * (degreesToRadians(getters.rotationAngle) + 0.1)) {
            newRotation = 0;
        }
        else {
            newRotation = getters.rotation + degreesToRadians(getters.rotationAngle);
        }
        commit("setRotation", newRotation);
        mapCollection.getMapView("2D").animate({rotation: newRotation});
    },

    /**
     * Rotates the map view counterclockwise for 45 degrees in radians and sets the new rotation.
     * @param {Object} context the vuex context
     * @param {Object} context.commit the commit
     * @param {Object} context.getters the getters
     * @returns {void}
     */
    rotateCounterClockwise ({commit, getters}) {
        let newRotation;

        if (getters.rotation > degreesToRadians(0) && getters.rotation < degreesToRadians(getters.rotationAngle) + 0.1) {
            newRotation = 0;
        }
        else {
            newRotation = getters.rotation - degreesToRadians(getters.rotationAngle);
        }
        commit("setRotation", newRotation);
        mapCollection.getMapView("2D").animate({rotation: newRotation});
    }
};
