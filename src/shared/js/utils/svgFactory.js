import {returnColor} from "@masterportal/masterportalapi/src/vectorStyle/lib/colorConvertions";
import StylePolygon from "@masterportal/masterportalapi/src/vectorStyle/styles/polygon/stylePolygon";

/**
 * Creating the circle svg
 * @param  {ol/style} style ol style
 * @return {String} SVG
 */
function createCircle (style) {
    let svg = "";
    const strokeColor = style.circleStrokeColor || (style.attributes && style.attributes.circleStrokeColor),
        strokeWidth = style.circleStrokeWidth || (style.attributes && style.attributes.circleStrokeWidth),
        fillColor = style.circleFillColor || (style.attributes && style.attributes.circleFillColor),
        circleStrokeColor = strokeColor ? returnColor(strokeColor, "hex") : "black",
        circleStrokeOpacity = Array.isArray(strokeColor) && strokeColor.length > 3 ? strokeColor[3].toString() : 0,
        circleStrokeWidth = strokeWidth ? strokeWidth : "auto",
        circleFillColor = fillColor ? returnColor(fillColor, "hex") : "black",
        circleFillOpacity = Array.isArray(fillColor) && fillColor.length > 3 ? fillColor[3] : 0;

    svg += "<svg height='25' width='25'>";
    svg += "<circle cx='12.5' cy='12.5' r='10' stroke='";
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
}

/**
 * Creating the line svg
 * @param  {ol/style} style ol style
 * @return {String} SVG
 */
function createLine (style) {
    let svg = "";
    const strokeColor = style.lineStrokeColor || (style.attributes && style.attributes.lineStrokeColor),
        strokeWidth = style.lineStrokeWidth || (style.attributes && style.attributes.lineStrokeWidth),
        strokeDash = style.lineStrokeDash || (style.attributes && style.attributes.lineStrokeDash),
        lineStrokeColor = strokeColor ? returnColor(strokeColor, "hex") : "black",
        lineStrokeWidth = parseInt(strokeWidth, 10),
        lineStrokeOpacity = Array.isArray(strokeColor) && strokeColor.length > 3 ? strokeColor[3].toString() : 0,
        lineStrokeDash = Array.isArray(strokeDash) ? strokeDash.join(" ") : undefined;

    svg += "<svg height='25' width='25'>";
    svg += "<path d='M 05 20 L 20 05' stroke='";
    svg += lineStrokeColor;
    svg += "' stroke-opacity='";
    svg += lineStrokeOpacity;
    svg += "' stroke-width='";
    svg += lineStrokeWidth;
    if (lineStrokeDash) {
        svg += "' stroke-dasharray='";
        svg += lineStrokeDash;
    }
    svg += "' fill='none'/>";
    svg += "</svg>";

    return svg;
}

/**
 * Creating the polygon graphic
 * @param  {ol/style} style ol style
 * @return {String} SVG or data URL
 */
function createPolygon (style) {
    let svg = "";
    const fillColor = style.polygonFillColor || (style.attributes && style.attributes.polygonFillColor),
        strokeColor = style.polygonStrokeColor || (style.attributes && style.attributes.polygonStrokeColor),
        strokeWidth = style.polygonStrokeWidth || (style.attributes && style.attributes.polygonStrokeWidth),
        polygonFillColor = fillColor ? returnColor(fillColor || "black", "hex") : "black",
        polygonStrokeColor = strokeColor ? returnColor(strokeColor, "hex") : "black",
        polygonStrokeWidth = parseInt(strokeWidth, 10),
        polygonFillOpacity = Array.isArray(fillColor) && fillColor.length > 3 ? fillColor[3].toString() : 0,
        polygonStrokeOpacity = Array.isArray(strokeColor) && strokeColor.length > 3 ? strokeColor[3].toString() : 0,
        polygonFillHatch = style.polygonFillHatch || (style.attributes && style.attributes.polygonFillHatch);

    if (polygonFillHatch) {
        return StylePolygon.prototype.getPolygonFillHatchLegendDataUrl(style);
    }

    svg += "<svg height='25' width='25'>";
    svg += "<polygon points='5,5 20,5 20,20 5,20' style='fill:";
    svg += polygonFillColor;
    svg += ";fill-opacity:";
    svg += polygonFillOpacity;
    svg += ";stroke:";
    svg += polygonStrokeColor;
    svg += ";stroke-opacity:";
    svg += polygonStrokeOpacity;
    svg += ";stroke-width:";
    svg += polygonStrokeWidth;
    svg += ";'/>";
    svg += "</svg>";

    return svg;
}


export default {
    createCircle,
    createLine,
    createPolygon
};
