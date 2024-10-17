
const mutations = {
    /**
     * Sets the center coordinates of the layer preview.
     * @param {Object} state current state
     * @param {Object} payload the payload
     * @param {String} payload.id id of the layer
     * @param {Array} payload.center  the center coordinates
     * @returns {void}
     */
    setPreviewCenter (state, {id, center}) {
        state.center[id] = center;
    },

    /**
     * Sets the zoom-level of the layer preview.
     * @param {Object} state current state
     * @param {Object} payload the payload
     * @param {String} payload.id id of the layer
     * @param {Number} payload.zoomLevel the zoom-level
     * @returns {void}
     */
    setPreviewZoomLevel (state, {id, zoomLevel}) {
        state.zoomLevel[id] = zoomLevel;
    },

    /**
     * Stores preview url by layerId.
     * @param {Object} state current state
     * @param {Object} payload the payload
     * @param {String} payload.id id of the layer
     * @param {Array} payload.previewUrl  the previewUrl
     * @returns {void}
     */
    addPreviewUrl (state, {id, previewUrl}) {
        state.previewUrlByLayerIds[id] = previewUrl;
    }

};

export default mutations;
