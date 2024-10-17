import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import Feature from "ol/Feature";
import {Icon, Style} from "ol/style";
import Point from "ol/geom/Point";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";

import calculateCenterOfExtent from "../../../shared/js/utils/calculateCenterOfExtent";
import {isUrl} from "../../../shared/js/utils/urlHelper";

/**
 * @param {Feature[]} features Features, which center coordinates should be styled.
 * @param {String} styleId Id of the styleObject.
 * @see {@link https://community.cesium.com/t/cors-and-billboard-image/3920/2} crossOrigin: "anonymous", is necessary for the 3D mode.
 * @returns {Feature[]} Styled features.
 */
export default function (features, styleId) {
    return features
        .map(feature => calculateCenterOfExtent(feature.getGeometry().getExtent()))
        .map((centerCoordinates, index) => new Feature({
            geometry: new Point(centerCoordinates),
            name: `featureIcon${index}`
        }))
        .map(feature => {
            let style;

            if (isUrl(styleId)) {
                style = new Style({
                    image: new Icon({
                        crossOrigin: "anonymous",
                        anchor: [0.5, 24],
                        anchorXUnits: "fraction",
                        anchorYUnits: "pixels",
                        src: styleId,
                        scale: 2
                    })
                });
            }
            else {
                const styleObject = styleList.returnStyleObject(styleId);

                style = styleObject === undefined
                    ? new Style()
                    : createStyle.createStyle(styleObject, feature, false, Config.wfsImgPath);
            }

            feature.setStyle(style);
            return feature;
        });
}
