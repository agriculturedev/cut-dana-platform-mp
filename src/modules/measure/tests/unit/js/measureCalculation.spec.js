import {Polygon, LineString} from "ol/geom.js";
import Feature from "ol/Feature.js";

import {expect} from "chai";

import {calculateLineLengths, calculatePolygonAreas} from "../../../utils/measureCalculation";

describe("tools/measure/utils/measureCalculation", function () {
    describe("calculateLineLengths", function () {
        it("should format measured linestring(s) in m/km/nm correctly", function () {
            const feature = new Feature({
                geometry: new LineString([[0, 0], [1, 1]])
            });
            let result;

            result = calculateLineLengths("EPSG:4326", {}, 6378137, "meter", "0", "LineString", ["m"]);
            expect(result).to.deep.equal({});

            result = calculateLineLengths("EPSG:4326", {a: feature}, 6378137, "meter", "0", "LineString", ["m"]);
            expect(result).to.deep.equal({a: "157426 m"});

            result = calculateLineLengths("EPSG:4326", {a: feature}, 6378137, "decimeter", "0", "LineString", ["m"]);
            expect(result).to.deep.equal({a: "157425.5 m"});

            result = calculateLineLengths("EPSG:4326", {a: feature, b: feature}, 6378137, "meter", "0", "LineString", ["km"]);
            expect(result).to.deep.equal({a: "157.4 km", b: "157.4 km"});

            result = calculateLineLengths("EPSG:4326", {a: feature}, 6378137, "meter", "0", "LineString", ["nm"]);
            expect(result).to.deep.equal({a: "85 nm"});
        });

        it("should not format measured linestrings", function () {
            const feature = new Feature({
                    geometry: new LineString([[0, 0], [1, 1]])
                }),
                result = calculateLineLengths("EPSG:4326", {a: feature}, 6378137, "meter", "0", "Polygon", ["m", "m²"]);

            expect(result).to.deep.equal({});
        });
    });

    describe("calculatePolygonAreas", function () {
        it("should format measured polygon(s) in m²/ha/km² correctly", function () {
            const feature = new Feature({
                geometry: new Polygon([[[0, 0], [0, 1], [1, 1], [1, 0]]])
            });
            let result;

            result = calculatePolygonAreas("EPSG:4326", {}, 6378137, "meter", "0", "Polygon", ["m²"]);
            expect(result).to.deep.equal({});

            result = calculatePolygonAreas("EPSG:4326", {a: feature}, 6378137, "meter", "0", "Polygon", ["m²"]);
            expect(result).to.deep.equal({a: "12391399902 m²"});

            result = calculatePolygonAreas("EPSG:4326", {a: feature}, 6378137, "decimeter", "0", "Polygon", ["m²"]);
            expect(result).to.deep.equal({a: "12391399902.1 m²"});

            result = calculatePolygonAreas("EPSG:4326", {a: feature, b: feature}, 6378137, "meter", "0", "Polygon", ["km²"]);
            expect(result).to.deep.equal({a: "12391.4 km²", b: "12391.4 km²"});

            result = calculatePolygonAreas("EPSG:4326", {a: feature}, 6378137, "decimeter", "0", "Polygon", ["ha"]);
            expect(result).to.deep.equal({a: "1239140.0 ha"});
        });

        it("should not format measured polygons", function () {
            const feature = new Feature({
                    geometry: new Polygon([[[0, 0], [0, 1], [1, 1], [1, 0]]])
                }),
                result = calculatePolygonAreas("EPSG:4326", {a: feature}, 6378137, "meter", "0", "LineString", ["m", "m²"]);

            expect(result).to.deep.equal({});
        });
    });
});
