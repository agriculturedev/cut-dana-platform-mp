/**
 * Creates an array with a given number of Layer Objects
 *
 * @param {Number} count the number of returned array element
 *
 * @return {Array} the array of layer objects
 */
function createLayerConfigsArray (count) {
    const layers = [];


    for (let i = 0; i < count; i++) {
        const layer = {
            "id": i,
            "name": "Layer-" + i,
            "typ": "WFS",
            "visibility": true
        };

        layers.push(layer);
    }
    return layers;
}

export {
    createLayerConfigsArray
};
