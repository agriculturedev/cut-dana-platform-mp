export default {
    /**
     * Checks if the given legend object is valid.
     * @param {Object} legendObj The legend object to be checked.
     * @returns {Boolean} - Flag if legendObject is valid.
     */
    isValidLegendObj: (legendObj) => {
        const legend = legendObj.legend,
            position = legendObj.position;
        let isValid = true;

        if (position < 0) {
            isValid = false;
        }
        if (typeof legend === "boolean" || !legend) {
            isValid = false;
        }
        if (Array.isArray(legend) && legend.length === 0) {
            isValid = false;
        }
        return isValid;
    }
};
