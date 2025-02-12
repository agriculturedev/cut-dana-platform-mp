import {expect} from "chai";
import {setKmlAttributes} from "../../../js/setKmlAttributes";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";

describe("src/modules/draw/js/setKmlAttributes.js", () => {
    let features;

    beforeEach(function () {
        features = [
            new Feature({
                geometry: new Polygon([[[30, 10], [40, 40], [130, 130], [240, 40], [30, 10]]]),
                name: "featureOne",
                masterportal_attributes: {
                    isGeoCircle: true
                }
            }),
            new Feature({
                geometry: new Point([123, 456]),
                name: "featureTwo",
                customProperty1: "value1",
                customProperty2: "value2"
            }),
            new Feature({
                geometry: new LineString([[30, 10], [40, 40]]),
                name: "featureThree",
                customProperty1: "value1",
                customProperty2: "value2"
            })
        ];
    });

    it("should return false if the given param is not an array", function () {
        expect(setKmlAttributes({})).to.be.false;
        expect(setKmlAttributes(true)).to.be.false;
        expect(setKmlAttributes("string")).to.be.false;
        expect(setKmlAttributes(undefined)).to.be.false;
        expect(setKmlAttributes(null)).to.be.false;
        expect(setKmlAttributes(42)).to.be.false;
    });

    it("should set the property attributes to the feature if it is not available", function () {
        const kmlFeatures = setKmlAttributes(features);

        expect(kmlFeatures[0].get("attributes")).to.be.an("object");
    });

    it("should add all 'custom attributes' to the property attributes", function () {
        const kmlFeatures = setKmlAttributes(features);

        expect(kmlFeatures[1].get("attributes")).to.have.all.keys(["customProperty1", "customProperty2", "name"]);
        expect(kmlFeatures[1].get("attributes").customProperty1).to.equal(features[1].get("customProperty1"));
        expect(kmlFeatures[1].get("attributes").customProperty2).to.equal(features[1].get("customProperty2"));
        expect(kmlFeatures[1].get("attributes").name).to.equal(features[1].get("name"));
    });

    it("should add all 'masterportal_attributes' to the root property", function () {
        const kmlFeatures = setKmlAttributes(features);

        expect(kmlFeatures[0].get("isGeoCircle")).not.to.be.undefined;
        expect(kmlFeatures[0].get("isGeoCircle")).to.be.true;
    });
});
