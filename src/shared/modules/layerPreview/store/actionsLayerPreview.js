export default {
    /**
     * Sets previewCenter and previewZoomlevel depening on given center and zoomlevel or initial values from map.
     * @param {Object} param.commit the commit
     * @param {Object} param.getters the getters
     * @param {Object} param.rootGetters the rootGetters
     * @param {Object} payload the payload
     * @param {String} payload.id id of the layer
     * @param {Array|String} payload.center center coordinates
     * @param {Number} payload.zoomLevel the zoom level
     * @returns {void}
     */
    initialize: async function ({commit, rootGetters}, {id, center, zoomLevel}) {
        const resolutions = mapCollection.getMapView("2D").getResolutions();
        let previewCenter = center ? center : rootGetters["Maps/initialCenter"],
            previewZoomLevel = typeof zoomLevel === "number" ? zoomLevel : rootGetters["Maps/initialZoom"];

        if (!Array.isArray(previewCenter) && typeof previewCenter === "string" && previewCenter.indexOf(",") > -1) {
            previewCenter = [parseFloat(previewCenter.split(",")[0]), parseFloat(previewCenter.split(",")[1])];
        }
        if (resolutions[previewZoomLevel] === undefined) {
            previewZoomLevel = rootGetters["Maps/initialZoom"];
            console.warn(`Unusable zoomLevel ${zoomLevel} at layer with id:${id} configured, corrected to initialZoom ${previewZoomLevel}`);
        }
        commit("setPreviewCenter", {id, center: previewCenter});
        commit("setPreviewZoomLevel", {id, zoomLevel: previewZoomLevel});
    }
};
