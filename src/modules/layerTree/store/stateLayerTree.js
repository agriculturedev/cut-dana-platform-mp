/**
 * LayerTree state definition.
 * @module modules/layerTree/store/stateLayerTree
 * @property {String} [menuSide="mainMenu"] Specifies in which menu the layerTree should be rendered
 * @property {String} [type="layerTree"] The type of the layerTree component.
 * @property {String} [delay="500"] Length of the delay on a touch device in milliseconds.
 * @property {Boolean} [delayOnTouchOnly=true] Specifies whether a delay should be used for a toch event.
 * @property {Boolean} [removeOnSpill=true] Indicates whether layers with spill can be removed.
 * @property {Number} [touchStartThreshold=3] This option sets the minimum pointer movement that must occur before the delayed sorting is cancelled.
 */
export default {
    menuSide: "mainMenu",
    type: "layerTree",
    delay: "500",
    delayOnTouchOnly: true,
    removeOnSpill: true,
    touchStartThreshold: 3
};
