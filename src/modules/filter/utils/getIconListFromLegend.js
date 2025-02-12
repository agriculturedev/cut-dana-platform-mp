import svgFactory from "../../../shared/js/utils/svgFactory";
import openLayerFunctions from "./openlayerFunctions.js";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";

/**
 * Returns a list of image paths from the Legend
 * @param {Object[]} legendInfoList an array list of legend information
 * @param {Object} styleModel the style model
 * @returns {Object} an object with the label of the legendInfo (value of the attrName) as key and the path of the icon as value
 */
function getIconListFromLegend (legendInfoList, styleModel) {
    const result = {};

    legendInfoList?.forEach(legendInfo => {
        // always show icon if configured, independend of geometry type
        if (legendInfo.styleObject.type === "icon") {
            result[legendInfo.label] = legendInfo.styleObject.imagePath + legendInfo.styleObject.imageName;
        }
        else if (legendInfo.geometryType) {
            if (legendInfo.geometryType === "Point") {
                result[legendInfo.label] = svgFactory.createCircle(styleModel);
            }
            else if (legendInfo.geometryType === "LineString") {
                result[legendInfo.label] = svgFactory.createLine(legendInfo.styleObject);
            }
            else if (legendInfo.geometryType === "Polygon") {
                result[legendInfo.label] = svgFactory.createPolygon(legendInfo.styleObject);
            }
        }
    });

    return result;
}

/**
  * Returns style Model
  * @param {String} layerId layerId to get the legend data
  * @returns {Object} the style model
  */
function getStyleModel (layerId) {
    const layerConfig = openLayerFunctions.getLayerByLayerId(layerId);
    let styleId,
        styleModel;

    if (layerConfig) {
        styleId = layerConfig.styleId;
        if (styleId) {
            styleModel = styleList.returnStyleObject(styleId);
        }
    }

    return styleModel;
}

export default {getStyleModel, getIconListFromLegend};
