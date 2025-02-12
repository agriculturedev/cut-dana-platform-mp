import {Circle, Fill, Stroke, Style} from "ol/style.js";
import {Polygon, LineString, MultiPoint} from "ol/geom.js";

/**
 * @param {Number[]} color the base color for the style
 * @returns {module:ol/style/Style[]} list of style for the measured
 */
function getStyle (color) {
    return [
        // general style
        new Style({
            fill: new Fill({
                color: color.with(3, 0.3)
            }),
            stroke: new Stroke({
                color,
                width: 2
            }),
            image: new Circle({
                radius: 6,
                stroke: new Stroke({
                    color,
                    width: 3
                }),
                fill: new Fill({
                    color: color.with(3, 0.4)
                })
            })
        }),
        //  style for first and last coord
        new Style({
            image: new Circle({
                radius: 6,
                stroke: new Stroke({
                    color,
                    width: 3
                }),
                fill: new Fill({
                    color: color.with(3, 0.4)
                })
            }),
            geometry: function (feature) {
                const geom = feature.getGeometry(),
                    coords = [];

                coords.push(geom.getFirstCoordinate());
                coords.push(geom.getLastCoordinate());
                return new MultiPoint(coords);
            }
        }),
        // style for all points except first and last
        new Style({
            image: new Circle({
                radius: 2,
                stroke: new Stroke({
                    color,
                    width: 3
                }),
                fill: new Fill({
                    color: color.with(3, 0.4)
                })
            }),
            geometry: function (feature) {
                const geom = feature.getGeometry(),
                    coords = [];

                if (geom instanceof LineString) {
                    geom.getCoordinates().forEach(function (coordinate, index) {
                        if (index > 0 && index < geom.getCoordinates().length - 1) {
                            coords.push(coordinate);
                        }
                    });
                    // respect this from ol: Invalid number of points in LineString (found 1 - must be 0 or >= 2)
                    if (coords.length === 1) {
                        return new LineString([]);
                    }
                    return new LineString(coords);
                }
                if (geom instanceof Polygon) {
                    geom.getCoordinates()[0].forEach(function (coordinate, index) {
                        if (index > 0 && index < geom.getCoordinates()[0].length - 1) {
                            coords.push(coordinate);
                        }
                    });
                    return new Polygon([coords]);
                }

                return new MultiPoint(coords);
            }
        })
    ];
}

export default getStyle;
