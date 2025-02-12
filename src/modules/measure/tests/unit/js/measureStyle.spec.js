import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import Feature from "ol/Feature.js";
import {Polygon} from "ol/geom.js";

import {expect} from "chai";

import style from "../../../js/measureStyle";

describe("src/modules/measure/js/measureStyle", function () {
    it("get correct coordinates for polygon", function () {
        const source = new VectorSource(),
            layer = new VectorLayer({
                source,
                style: style([255, 127, 0, 1.0]),
                id: "measureLayer",
                name: "measureLayer",
                alwaysOnTop: true
            }),
            feature = new Feature({
                geometry: new Polygon([[[0, 0], [0, 1], [1, 1], [1, 0]]])
            });
        let styles = null;

        layer.getSource().addFeature(feature);
        styles = layer.getStyleFunction()(feature);
        styles.forEach((aStyle, i) => {
            const geom = aStyle.getGeometryFunction()(feature);

            if (geom instanceof Polygon) {
                if (i === 0) {
                    expect(geom.getCoordinates()).to.deep.equals([[[0, 0], [0, 1], [1, 1], [1, 0]]]);
                }
                else if (i === 2) {
                    expect(geom.getCoordinates()).to.deep.equals([[[0, 1], [1, 1]]]);
                }
            }
        });
    });
    it("all styles have configured color", function () {
        const styles = style([50, 150, 250, 1.0]);

        styles.forEach(aStyle => {
            expect(aStyle.getImage().getFill().getColor()).to.deep.equal([50, 150, 250, 0.4]);
            expect(aStyle.getImage().getStroke().getColor()).to.deep.equal([50, 150, 250, 1.0]);

            if (aStyle.getStroke() !== null) {
                expect(aStyle.getStroke().getColor()).to.deep.equal([50, 150, 250, 1.0]);
            }
            if (aStyle.getFill() !== null) {
                expect(aStyle.getFill().getColor()).to.deep.equal([50, 150, 250, 0.3]);
            }
        });
    });
});
