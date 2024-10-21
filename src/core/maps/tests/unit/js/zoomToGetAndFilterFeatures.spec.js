import axios from "axios";
import {expect} from "chai";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import sinon from "sinon";

import featureProvider from "../../../js/zoomToGetAndFilterFeatures";

const fs = require("fs"),
    exampleFeatureCollection = fs.readFileSync("./src/core/maps/tests/unit/resources/featureCollection.xml", "utf8");

describe("src/core/maps/js/zoomToGetAndFilterFeatures.js", () => {
    const id = "someId",
        property = "flaechenid",
        values = ["18", "26"];

    afterEach(() => {
        sinon.restore();
    });

    it("should return a rejecting Promise if the layer with the given id can not be found", () => {
        sinon.stub(rawLayerList, "getLayerWhere").returns(null);
        featureProvider.getAndFilterFeatures(id, property, values)
            .catch(error => {
                expect(error).to.equal(`The layer with the id ${id} could not be found.`);
            });
    });

    it("should call the axois request, if layer exists", () => {
        const axiosSpy = sinon.stub(axios, "get").callsFake(() => new Promise(resolve => resolve({status: 200, statusText: "OK", data: exampleFeatureCollection}))),
            layer = {
                id: "id",
                url: "https://geodaten.de",
                version: "1.1.0",
                featureType: "featureType"
            };

        sinon.stub(rawLayerList, "getLayerWhere").returns(layer);

        featureProvider.getAndFilterFeatures(id, property, values);
        expect(axiosSpy.calledOnce).to.be.true;
    });

    it("should return a Promise which resolves to Feature[] only including features including an allowed value for the given property", () => {
        sinon.stub(rawLayerList, "getLayerWhere").returns({id: "id"});
        sinon.stub(axios, "get").callsFake(() => new Promise(resolve => resolve({status: 200, statusText: "OK", data: exampleFeatureCollection})));

        featureProvider.getAndFilterFeatures(id, property, values)
            .then(features => {
                expect(features.length).to.equal(2);
            });
        featureProvider.getAndFilterFeatures(id, property, ["18"])
            .then(features => {
                expect(features.length).to.equal(1);
            });
    });
    describe("createUrl", () => {
        it("test params", () => {
            const url = "https://geodienste.hamburg.de/",
                version = "1.1.1",
                featureType = "featureType",
                createdUrl = featureProvider.createUrl(url, version, featureType);

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
                createdUrl = featureProvider.createUrl(url, version, featureType);

            expect(createdUrl.origin).to.eql("https://mapservice.regensburg.de");
            expect(createdUrl.pathname).to.eql("/cgi-bin/mapserv");
            expect(createdUrl.searchParams.get("service")).to.eql("WFS");
            expect(createdUrl.searchParams.get("version")).to.eql(version);
            expect(createdUrl.searchParams.get("typeName")).to.eql(featureType);
            expect(createdUrl.searchParams.get("request")).to.eql("GetFeature");
        });
    });
    describe("createFilter", () => {
        it("test params", () => {
            const version = "1.1.1",
                featureNS = "http://www.deegree.org/app",
                featurePrefix = "app",
                createdFilter = featureProvider.createFilter(featureNS, featurePrefix, version, property, values);

            expect(createdFilter.includes("xmlns=\"http://www.opengis.net/ogc\""));
            expect(createdFilter.includes("xmlns:app=\"http://www.deegree.org/app\""));
            expect(createdFilter.includes(featurePrefix));
            expect(createdFilter.includes(featureNS));
            expect(createdFilter.includes("<Or>"));
            expect(createdFilter.includes("<Literal>18</Literal>"));
            expect(createdFilter.includes("<Literal>26</Literal>"));
        });
        it("createFilter should respect version number", () => {
            const version = "2.0.0",
                featureNS = "http://www.deegree.org/app",
                featurePrefix = "app",
                createdFilter = featureProvider.createFilter(featureNS, featurePrefix, version, property, values);

            expect(createdFilter.includes("xmlns=\"http://www.opengis.net/fes/2.0\""));
        });
        it("createFilter should respect number of values", () => {
            const version = "1.1.1",
                featureNS = "http://www.deegree.org/app",
                featurePrefix = "app",
                testValues = ["26"],
                createdFilter = featureProvider.createFilter(featureNS, featurePrefix, version, property, testValues);

            !expect(createdFilter.includes("<Or>"));
            !expect(createdFilter.includes("<Literal>18</Literal>"));
            expect(createdFilter.includes("<Literal>26</Literal>"));
        });
        it("createFilter should respect no property", () => {
            const version = "1.1.1",
                featureNS = "http://www.deegree.org/app",
                featurePrefix = "app",
                testProperty = "",
                createdFilter = featureProvider.createFilter(featureNS, featurePrefix, version, testProperty, values);

            expect(createdFilter).to.be.null;
        });
        it("createFilter should respect no value", () => {
            const version = "1.1.1",
                featureNS = "http://www.deegree.org/app",
                featurePrefix = "app",
                testValues = [],
                createdFilter = featureProvider.createFilter(featureNS, featurePrefix, version, property, testValues);

            expect(createdFilter.includes("<Literal></Literal>"));
        });
    });
});
