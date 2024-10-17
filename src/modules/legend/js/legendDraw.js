import Feature from "ol/Feature.js";
import StylePolygon from "@masterportal/masterportalapi/src/vectorStyle/styles/polygon/stylePolygon";
import {createNominalCircleSegments} from "@masterportal/masterportalapi/src/vectorStyle/styles/point/stylePointNominal";
import {createSVGStyle} from "@masterportal/masterportalapi/src/vectorStyle/styles/point/stylePointIcon";
import {convertColor} from "../../../shared/js/utils/convertColor";

export default {
    /**
     * Creates interval scaled advanced style for pointFeatures
     * @param {Object} styleObject The style.
     * @return {ol.Style} an SVG for interval circle bars style or empty array
     */
    drawIntervalStyle (styleObject) {
        const scalingShape = styleObject.scalingShape;
        let intervalStyle = [];

        if (scalingShape === "CIRCLE_BAR") {
            intervalStyle = this.drawIntervalCircleBars(styleObject);
        }

        return intervalStyle;
    },

    /**
     * Creates nominal scaled advanced style for pointFeatures
     * @param {Object} styleObject The styleObject.
     * @return {ol.Style} an SVG for nominal circle bars style or empty array
     */
    drawNominalStyle (styleObject) {
        const scalingShape = styleObject.attributes.scalingShape.toLowerCase();
        let nominalStyle = [];

        if (scalingShape === "circlesegments") {
            nominalStyle = this.drawNominalCircleSegments(styleObject);
        }

        return nominalStyle;
    },

    /**
     * Creats an SVG for nominal circle segment style.
     * @param {ol.style} styleObject The styleObject.
     * @returns {Array} - style as Array of objects.
     */
    drawNominalCircleSegments (styleObject) {
        const scalingAttribute = styleObject.attributes.scalingAttribute,
            scalingValues = styleObject.attributes.scalingValues,
            nominalCircleSegments = [];

        Object.keys(scalingValues).forEach(key => {
            const imageScale = styleObject.attributes.imageScale;
            let svg,
                svgSize,
                image,
                imageSize,
                imageSizeWithScale,
                svgPath;

            if (Array.isArray(styleObject.style)) {
                const olFeature = new Feature();

                olFeature.set(scalingAttribute, key);
                svgPath = createNominalCircleSegments(olFeature, styleObject.attributes);
                svg = createSVGStyle(svgPath, 5).getImage().getSrc();
                svgSize = styleObject.style[0].getImage().getSize();
                image = styleObject.style[1].getImage().getSrc();
                imageSize = [Math.round(svgSize[0] * 1.04), Math.round(svgSize[1] * 1.04)];
                imageSizeWithScale = [imageSize[0] * imageScale, imageSize[1] * imageScale];

                nominalCircleSegments.push({
                    name: key,
                    graphic: [svg, image],
                    iconSize: imageSizeWithScale,
                    iconSizeDifferenz: Math.abs((imageSize[0] * imageScale - svgSize[0]) / 2)
                });
            }
            else {
                nominalCircleSegments.push({
                    name: key,
                    graphic: styleObject.style.getImage().getSrc()
                });
            }
        });
        return nominalCircleSegments;
    },

    /**
     * Creats an SVG for interval circle bar style.
     * @param {ol.style} style style
     * @returns {String} - style as svg
     */
    drawIntervalCircleBars (style) {
        return style.clone().getStyle().getImage().getSrc();
    },

    /**
     * Creates an SVG for a circle style.
     * @param   {vectorStyle} style feature styles
     * @returns {String} svg
     */
    drawCircleStyle (style) {
        const circleStrokeColor = style.circleStrokeColor ? convertColor(style.circleStrokeColor, "rgbString") : "black",
            circleStrokeOpacity = style.circleStrokeColor[3] || 0,
            circleStrokeWidth = style.circleStrokeWidth,
            circleFillColor = style.circleFillColor ? convertColor(style.circleFillColor, "rgbString") : "black",
            circleFillOpacity = style.circleFillColor[3] || 0,
            circleRadius = style.circleRadius,
            widthAndHeight = (circleRadius + 1.5) * 2;
        let svg = "data:image/svg+xml;charset=utf-8,";

        svg += "<svg height='" + widthAndHeight + "' width='" + widthAndHeight + "' version='1.1' xmlns='http://www.w3.org/2000/svg'>";
        svg += "<circle cx='" + widthAndHeight / 2 + "' cy='" + widthAndHeight / 2 + "' r='" + circleRadius + "' stroke='";
        svg += circleStrokeColor;
        svg += "' stroke-opacity='";
        svg += circleStrokeOpacity;
        svg += "' stroke-width='";
        svg += circleStrokeWidth;
        svg += "' fill='";
        svg += circleFillColor;
        svg += "' fill-opacity='";
        svg += circleFillOpacity;
        svg += "'/>";
        svg += "</svg>";

        return svg;
    },

    /**
     * Prepares the legend for linestring style.
     * @param {Object} legendObj The legend object.
     * @param {Object} style The styleObject.
     * @returns {Object} - prepared legendObj.
     */
    prepareLegendForLineString  (legendObj, style) {
        const strokeColor = style.lineStrokeColor ? convertColor(style.lineStrokeColor, "rgbString") : "black",
            strokeWidth = style.lineStrokeWidth,
            strokeOpacity = style.lineStrokeColor[3] || 0,
            strokeDash = style.lineStrokeDash ? style.lineStrokeDash.join(" ") : undefined,
            type = style.type ? style.type.toLowerCase() : style.attributes?.type.toLowerCase();

        if (type === "icon") {
            legendObj.graphic = style.imagePath + style.imageName;
        }
        else {
            let svg = "data:image/svg+xml;charset=utf-8,";

            svg += "<svg height='35' width='35' version='1.1' xmlns='http://www.w3.org/2000/svg'>";
            svg += "<path d='M 05 30 L 30 05' stroke='";
            svg += strokeColor;
            svg += "' stroke-opacity='";
            svg += strokeOpacity;
            svg += "' stroke-width='";
            svg += strokeWidth;
            if (strokeDash) {
                svg += "' stroke-dasharray='";
                svg += strokeDash;
            }
            svg += "' fill='none'/>";
            svg += "</svg>";

            legendObj.graphic = svg;
        }

        return legendObj;
    },

    /**
     * Prepares the legend for polygon style.
     * @param {Object} legendObj The legend object.
     * @param {Object} style The styleObject.
     * @returns {Object} - prepare legendObj
     */
    prepareLegendForPolygon (legendObj, style) {
        const fillColor = style.polygonFillColor ? convertColor(style.polygonFillColor, "rgbString") : "black",
            strokeColor = style.polygonStrokeColor ? convertColor(style.polygonStrokeColor, "rgbString") : "black",
            strokeWidth = style.polygonStrokeWidth,
            fillOpacity = style.polygonFillColor?.[3] || 0,
            fillHatch = style.polygonFillHatch,
            strokeOpacity = style.polygonStrokeColor[3] || 0,
            strokeCap = style.polygonStrokeCap || "round",
            strokeDash = style.polygonStrokeDash?.toString() || "",
            type = style.type ? style.type.toLowerCase() : style.attributes?.type.toLowerCase();

        if (fillHatch) {
            legendObj.graphic = StylePolygon.prototype.getPolygonFillHatchLegendDataUrl(style);
        }
        else if (type === "icon") {
            legendObj.graphic = style.imagePath + style.imageName;
        }
        else {
            let svg = "data:image/svg+xml;charset=utf-8,";

            svg += "<svg height='35' width='35' version='1.1' xmlns='http://www.w3.org/2000/svg'>";
            svg += "<polygon points='5,5 30,5 30,30 5,30' style='fill:";
            svg += fillColor;
            svg += ";fill-opacity:";
            svg += fillOpacity;
            svg += ";stroke:";
            svg += strokeColor;
            svg += ";stroke-opacity:";
            svg += strokeOpacity;
            svg += ";stroke-width:";
            svg += strokeWidth;
            svg += ";stroke-linecap:";
            svg += strokeCap;
            svg += ";stroke-dasharray:";
            svg += strokeDash;
            svg += ";'/>";
            svg += "</svg>";

            legendObj.graphic = svg;
        }

        return legendObj;
    },

    /**
     * Prepares the legend for cesium style.
     * @param {Object} legendObj The legend object.
     * @param {Object} style The styleObject.
     * @returns {Object} - prepare legendObj
     */
    prepareLegendForCesium (legendObj, style) {
        const color = style.style ? style.style.color : "black";
        let svg = "data:image/svg+xml;charset=utf-8,";

        svg += "<svg height='35' width='35' version='1.1' xmlns='http://www.w3.org/2000/svg'>";
        svg += "<polygon points='5,5 30,5 30,30 5,30' style='fill:";
        svg += color;
        svg += ";fill-opacity:";
        svg += 1;
        svg += ";stroke:";
        svg += color;
        svg += ";stroke-opacity:";
        svg += 1;
        svg += ";stroke-width:";
        svg += 1;
        svg += ";'/>";
        svg += "</svg>";

        legendObj.graphic = svg;
        return legendObj;
    },

    /**
     * Creates the Name for Cesium
     * @param {Object} style Style.
     * @returns {String} - prepared name
    */
    prepareNameForCesium (style) {
        const conditions = style.conditions;
        let name = "";

        if (conditions) {
            Object.keys(conditions).forEach(attribute => {
                const value = style.conditions[attribute];

                name += value;
            });
        }
        return name;
    },

    /**
     * Prepares the legend for point style.
     * @param {Object} legendObj The legend object.
     * @param {Object} style The styleObject.
     * @returns {Object} - prepared legendObj.
     */
    prepareLegendForPoint (legendObj, style) {
        const imgPath = style.imagePath,
            type = style.type ? style.type.toLowerCase() : style.attributes.type.toLowerCase(),
            imageName = style.imageName;
        let newLegendObj = legendObj;

        if (type === "icon") {
            if (imageName.startsWith("https:")) {
                newLegendObj.graphic = imageName;
            }
            else if (imageName.startsWith("<svg")) {
                newLegendObj.graphic = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(imageName);
            }
            else {
                newLegendObj.graphic = imgPath + imageName;
            }
        }
        else if (type === "circle") {
            newLegendObj.graphic = this.drawCircleStyle(style);
        }
        else if (type === "interval") {
            newLegendObj.graphic = this.drawIntervalStyle(style);
        }
        else if (type === "nominal") {
            newLegendObj = this.drawNominalStyle(style);
        }
        return newLegendObj;
    },

    /**
     * Prepares the legend for different geometry types.
     * @param {String} geometryType the geometry type.
     * @param {Object} style The styleObject.
     * @param {Object} name label of the legend.
     * @returns {Object} - prepared legendObj.
     */
    prepare (geometryType, style, name) {
        let legendObj = {
            name
        };

        if (geometryType === "Point") {
            legendObj = this.prepareLegendForPoint(legendObj, style);
        }
        else if (geometryType === "LineString") {
            legendObj = this.prepareLegendForLineString(legendObj, style);
        }
        else if (geometryType === "Polygon") {
            legendObj = this.prepareLegendForPolygon(legendObj, style);
        }
        else if (geometryType === "Cesium") {
            legendObj.name = this.prepareNameForCesium(style);
            legendObj = this.prepareLegendForCesium(legendObj, style);
        }
        return legendObj;
    }
};
