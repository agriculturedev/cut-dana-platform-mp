import {WKT} from "ol/format.js";

/**
 * Help function for determining a feature with textual description.
 * @param {Object|String[]} content Object with the type of geometry, the geometry itself and the geometry of interior parts.
 * @param {String} [geometryType="POLYGON"] The type of geometry.
 * @returns {ol/Feature} Feature with WellKnownText-Geom.
 */
function getWKTGeom (content, geometryType = "POLYGON") {
    const format = new WKT(),
        type = content?.geometryType ? content.geometryType.toUpperCase() : geometryType, // the default value is POLYGON because for type street, there is no geometryType defined. But it should be polygon
        geometry = content?.coordinate ? content.coordinate : content;
    let wkt,
        regExp;

    if (type === "POLYGON") {
        wkt = type + "((";
        geometry.forEach(function (element, index, list) {
            // polygon with voids
            if (Array.isArray(element)) {
                element?.forEach(function (coord, index2, list2) {
                    if (index2 % 2 === 0) {
                        wkt += coord + " ";
                    }
                    else if (index2 === list2.length - 1) {
                        wkt += coord + ")";
                    }
                    else {
                        wkt += coord + ", ";
                    }
                });
                if (index === list.length - 1) {
                    wkt += ")";
                }
                else {
                    wkt += ",(";
                }
            }
            // simple polygon
            else if (index % 2 === 0) {
                wkt += element + " ";
            }
            else if (index === list.length - 1) {
                wkt += element + "))";
            }
            else {
                wkt += element + ", ";
            }
        });
    }
    else if (type === "POINT") {
        wkt = type + "(";
        if (geometry[1] !== undefined) {
            wkt += geometry[0] + " " + geometry[1];
        }
        else if (Array.isArray(geometry[0])) {
            if (geometry[0].length === 2) {
                wkt += geometry[0][0] + " " + geometry[0][1];
            }
            else {
                console.warn("unexpected data in WKT - " + geometry[0]);
            }
        }
        else {
            wkt += geometry[0];
        }
        wkt += ")";
    }
    else if (type === "MULTIPOLYGON") {
        wkt = type + "(((";
        // all single polygons
        geometry.forEach(function (element, index) {
            // goes through either all coordinates of a polygon or a polygon with voids
            element?.forEach(function (coord, index2, list2) {
                // element is a polygon with voids
                if (Array.isArray(coord)) {
                    coord.forEach(function (coordinate, index3, list3) {
                        if (Array.isArray(coordinate)) {
                            console.warn("coordinates nested too deeply");
                        }
                        if (index3 === list3.length - 1) {
                            wkt += coordinate + ")";
                        }
                        else if (index3 % 2 === 0) {
                            wkt += coordinate + " ";
                        }
                        else {
                            wkt += coordinate + ", ";
                        }
                    });
                    if (index2 === list2.length - 1) {
                        wkt += ")";
                    }
                    else {
                        wkt += ",(";
                    }
                }
                else if (!Array.isArray(coord)) {
                    // element is a simple polygon
                    if (index2 === list2.length - 1) {
                        wkt += coord + "))";
                    }
                    else if (index2 % 2 === 0) {
                        wkt += coord + " ";
                    }
                    else {
                        wkt += coord + ", ";
                    }
                }
            });
            if (index === geometry.length - 1) {
                wkt += ")";
            }
            else {
                wkt += ",((";
            }
        });
        regExp = new RegExp(", \\)\\?\\(", "g");
        wkt = wkt.replace(regExp, "),(");
    }
    return format.readFeature(wkt);
}

export default {getWKTGeom};
