import axios from "axios";
import sinon from "sinon";
import {expect} from "chai";
import featuresProvider from "../../../../zoomTo/utils/getAndFilterFeatures";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";

const fs = require("fs"),
    exampleFeatureCollection = fs.readFileSync("./src/utils/tests/unit/zoomTo/resources/featureCollection.xml", "utf8");

describe("src/utils/zoomTo/utils/getAndFilterFeatures.js", () => {
    const id = "someId",
        property = "flaechenid",
        values = ["18", "26"];

    afterEach(() => {
        sinon.restore();
    });

    it("should return a rejecting Promise if the layer with the given id can not be found", () => {
        sinon.stub(rawLayerList, "getLayerWhere").returns(null);
        featuresProvider.getAndFilterFeatures(id, property, values)
            .catch(error => {
                expect(error).to.equal(`The layer with the id ${id} could not be found.`);
            });
    });
    it("should call the axois request, if layer exists", () => {
        const axiosSpy = sinon.stub(axios, "get").callsFake(() => new Promise(resolve => resolve({status: 200, statusText: "OK", data: exampleFeatureCollection})));

        sinon.stub(rawLayerList, "getLayerWhere").returns({id: "id", url: "https://test.de"});

        featuresProvider.getAndFilterFeatures(id, property, values);
        expect(axiosSpy.calledOnce).to.be.true;
    });
    it("should return a Promise which resolves to Feature[] only including features including an allowed value for the given property", () => {
        sinon.stub(rawLayerList, "getLayerWhere").returns({id: "id", url: "https://test.de"});
        sinon.stub(axios, "get").callsFake(() => new Promise(resolve => resolve({status: 200, statusText: "OK", data: exampleFeatureCollection})));

        featuresProvider.getAndFilterFeatures(id, property, values)
            .then(features => {
                expect(features.length).to.equal(2);
            });
        featuresProvider.getAndFilterFeatures(id, property, ["18"])
            .then(features => {
                expect(features.length).to.equal(1);
            });
    });
    describe("createUrl", () => {
        it("test params", () => {
            const url = "https://geodienste.hamburg.de/",
                version = "1.1.1",
                featureType = "featureType",
                createdUrl = featuresProvider.createUrl(url, version, featureType);

            expect(createdUrl.origin).to.eql("https://geodienste.hamburg.de");
            expect(createdUrl.searchParams.get("service")).to.eql("WFS");
            expect(createdUrl.searchParams.get("version")).to.eql(version);
            expect(createdUrl.searchParams.get("typeName")).to.eql(featureType);
            expect(createdUrl.searchParams.get("request")).to.eql("GetFeature");
        });

        it("createUrl should respect questionmark in url", () => {
            const url = "https://mapservice.regensburg.de/cgi-bin/mapserv?map=wfs.map",
                version = "1.1.1",
                featureType = "featureType",
                createdUrl = featuresProvider.createUrl(url, version, featureType);

            expect(createdUrl.origin).to.eql("https://mapservice.regensburg.de");
            expect(createdUrl.pathname).to.eql("/cgi-bin/mapserv");
            expect(createdUrl.searchParams.get("service")).to.eql("WFS");
            expect(createdUrl.searchParams.get("version")).to.eql(version);
            expect(createdUrl.searchParams.get("typeName")).to.eql(featureType);
            expect(createdUrl.searchParams.get("request")).to.eql("GetFeature");
        });
    });
});
