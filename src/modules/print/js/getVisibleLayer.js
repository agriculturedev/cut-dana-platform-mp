import {Group as LayerGroup} from "ol/layer.js";
import differenceJS from "../../../shared/js/utils/differenceJS";
import sortBy from "../../../shared/js/utils/sortBy";
import store from "../../../app-store";
/**
 * Collects all visible ol layers, including layers of groups.
 * @param {Boolean} [printMapMarker=false] whether layer "markerPoint" should be filtered out
 * @returns {void}
 */
function getVisibleLayer (printMapMarker = false) {
    const layers = mapCollection.getMap("2D").getLayers();
    let visibleLayerList = typeof layers?.getArray !== "function" ? [] : layers.getArray().filter(layer => {
            return layer.getVisible() === true &&
                (
                    layer.get("name") !== "markerPoint" || printMapMarker
                );
        }),
        groupedLayers = null;

    groupedLayers = visibleLayerList.filter(layer => {
        return layer instanceof LayerGroup;
    });

    if (groupedLayers.length > 0) {
        visibleLayerList = visibleLayerList.filter(layer => {
            return !(layer instanceof LayerGroup);
        });
        groupedLayers.forEach(groupedLayer => {
            groupedLayer.getLayers().forEach(gLayer => {
                gLayer.setZIndex(groupedLayer.getZIndex());
                gLayer.setOpacity(groupedLayer.getOpacity());
                visibleLayerList.push(gLayer);
            });
        });
    }
    checkLayersInResolution(visibleLayerList);
}

/**
 * checks whether the layers may be displayed or printed at the selected scale.
 * @param {array} visibleLayerList with visible layer
 * @returns {void}
 */
function checkLayersInResolution (visibleLayerList) {
    const resoByMaxScale = store.getters["Maps/getResolutionByScale"](store.getters["Modules/Print/currentScale"], "max"),
        resoByMinScale = store.getters["Maps/getResolutionByScale"](store.getters["Modules/Print/currentScale"], "min"),
        invisibleLayer = [],
        newVisibleLayer = [];
    let invisibleLayerNames = "";

    visibleLayerList.forEach(layer => {
        if (resoByMaxScale > layer.getMaxResolution() || resoByMinScale < layer.getMinResolution()) {
            const layerName = Array.isArray(layer.get("name")) ? layer.get("name")[0] : layer.get("name");

            invisibleLayer.push(layer);
            invisibleLayerNames += "- " + layerName + "<br>";
        }
        else {
            newVisibleLayer.push(layer);
        }
    });
    store.commit("Modules/Print/setInvisibleLayer", invisibleLayer);
    store.commit("Modules/Print/setInvisibleLayerNames", invisibleLayerNames);
    sortVisibleLayerListByZindex(newVisibleLayer);
}

/**
 * sorts the visible layer list by zIndex from layer
 * layers with undefined zIndex come to the beginning of array
 * @param {array} visibleLayerList with visible layer
 * @returns {void}
 */
function sortVisibleLayerListByZindex (visibleLayerList) {
    const visibleLayerListWithZIndex = visibleLayerList.filter(layer => {
            return layer.getZIndex() !== undefined;
        }),
        visibleLayerListWithoutZIndex = differenceJS(visibleLayerList, visibleLayerListWithZIndex);

    visibleLayerListWithoutZIndex.push(sortBy(visibleLayerListWithZIndex, (layer) => layer.getZIndex()));
    store.dispatch("Modules/Print/setVisibleLayerList", [].concat(...visibleLayerListWithoutZIndex));
}

export default {getVisibleLayer};
