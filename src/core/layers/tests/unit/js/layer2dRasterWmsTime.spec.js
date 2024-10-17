import {expect} from "chai";
import sinon from "sinon";
import store from "../../../../../app-store";
import Layer2dRasterWmsTime from "../../../js/layer2dRasterWmsTime";

describe("src/core/js/layers/layer2dRasterWmsTime.js", () => {
    let attributes,
        origGetters,
        origDispatch,
        origCommit,
        error;

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            addInteraction: sinon.stub(),
            removeInteraction: sinon.stub(),
            addLayer: sinon.spy(),
            getLayers: () => {
                return {
                    getArray: () => [{
                        getVisible: () => true,
                        get: () => "layerId"
                    }],
                    getLength: sinon.spy(),
                    forEach: sinon.spy()
                };
            },
            getView: () => {
                return {
                    getResolutions: () => [2000, 1000]
                };
            }
        };

        mapCollection.addMap(map, "2D");
        origGetters = store.getters;
        origDispatch = store.dispatch;
        origCommit = store.commit;
    });

    beforeEach(() => {
        error = sinon.spy();
        sinon.stub(console, "error").callsFake(error);
        sinon.stub(Layer2dRasterWmsTime.prototype, "requestCapabilities").returns(new Promise(resolve => resolve({status: 200, statusText: "OK", data: {}})));
        attributes = {
            name: "wmsTimeTestLayer",
            id: "id",
            typ: "WMS",
            tilesize: 512,
            singleTile: false,
            minScale: "0",
            maxScale: "2500000",
            layers: "layer1,layer2",
            transparent: 100,
            visibility: false,
            time: {
                default: "1997"
            }
        };
    });

    afterEach(() => {
        sinon.restore();
        store.getters = origGetters;
        store.dispatch = origDispatch;
        store.commit = origCommit;
    });

    it("createLayer shall create an ol/Layer with source", function () {
        const wmsTimeLayer = new Layer2dRasterWmsTime(attributes),
            layer = wmsTimeLayer.getLayer();

        expect(layer).not.to.be.undefined;
        expect(layer.getSource()).not.to.be.undefined;
    });

    it("getRawLayerAttributes: should return the raw layer attributes", () => {
        const localAttributes = {
                crs: "25832",
                format: "image/png",
                gutter: 0,
                id: "123456789",
                layers: "layer_names",
                singleTile: false,
                tilesize: 512,
                transparent: 100,
                url: "http://test.url",
                version: "1.3.0"
            },
            wmsLayer = new Layer2dRasterWmsTime(localAttributes),
            rawAttributes = wmsLayer.getRawLayerAttributes(localAttributes);

        expect(rawAttributes.id).to.be.equals(localAttributes.id);
        expect(rawAttributes.url).to.be.equals(localAttributes.url);
        expect(rawAttributes.crs).to.be.equals(localAttributes.crs);
        expect(rawAttributes.format).to.be.equals(localAttributes.format);
        expect(rawAttributes.gutter).to.be.equals(localAttributes.gutter);
        expect(rawAttributes.layers).to.be.equals(localAttributes.layers);
        expect(rawAttributes.singleTile).to.be.equals(localAttributes.singleTile);
        expect(rawAttributes.tilesize).to.be.equals(localAttributes.tilesize);
        expect(rawAttributes.transparent).to.be.equals("100");
        expect(rawAttributes.version).to.be.equals(localAttributes.version);
        expect(rawAttributes.TIME).to.be.a("Promise");
    });

    it("extractExtentValues - extract an object that contains the time range", function () {
        const wmsTimeLayer = new Layer2dRasterWmsTime(attributes),
            extent = {
                value: "2006/2018/P2Y"
            };

        expect(wmsTimeLayer.extractExtentValues(extent)).deep.equals({
            timeRange: ["2006", "2008", "2010", "2012", "2014", "2016", "2018"],
            step: {
                year: "2"
            }
        });
    });
    describe("determineDefault", () => {
        it("configuredDefault is contained in timeRange", function () {
            const wmsTimeLayer = new Layer2dRasterWmsTime(attributes),
                timeRange = [
                    "2021-12-25",
                    "2022-03-25",
                    "2022-06-23",
                    "2022-08-20",
                    "2022-10-26",
                    "2023-02-08",
                    "2023-06-13",
                    "2023-09-16"
                ],
                extentDefault = "2023-09-16",
                configuredDefault = "2022-06-23",
                result = wmsTimeLayer.determineDefault(timeRange, extentDefault, configuredDefault);

            expect(result).to.be.equals(configuredDefault);
        });
        it("configuredDefault is 'current' return greatest date in timeRange", function () {
            const wmsTimeLayer = new Layer2dRasterWmsTime(attributes),
                timeRange = [
                    "2021-12-25",
                    "2022-03-25",
                    "2022-06-23",
                    "2022-08-20",
                    "2022-10-26",
                    "2023-02-08",
                    "2023-06-13",
                    "2023-09-16"
                ],
                extentDefault = "2023-09-16",
                configuredDefault = "current",
                result = wmsTimeLayer.determineDefault(timeRange, extentDefault, configuredDefault);

            expect(result).to.be.equals("2023-09-16");
        });
    });
    describe("createTimeRange", () => {
        it("create an array with the time range", function () {
            const wmsTimeLayer = new Layer2dRasterWmsTime(attributes),
                min = "2006",
                max = "2018",
                step = {
                    years: "2"
                };

            expect(wmsTimeLayer.createTimeRange(min, max, step)).to.be.an("array");
            expect(wmsTimeLayer.createTimeRange(min, max, step)).includes("2006", "2008", "2010", "2012", "2014", "2016", "2018");
        });

        it("create an array with the time range", function () {
            const wmsTimeLayer = new Layer2dRasterWmsTime(attributes),
                min = "2006",
                max = "2018",
                step = {
                    years: "2"
                };

            expect(wmsTimeLayer.createTimeRange(min, max, step)).to.be.an("array");
            expect(wmsTimeLayer.createTimeRange(min, max, step)).includes("2006", "2008", "2010", "2012", "2014", "2016", "2018");
        });
    });

    describe("createCapabilitiesUrl", () => {
        it("test params", () => {
            const wmsTimeUrl = "https://geodienste.hamburg.de/HH_WMS-T_Satellitenbilder_Sentinel-2",
                version = "1.1.1",
                layers = "layer1",
                wmsTimeLayer = new Layer2dRasterWmsTime(attributes),
                createdUrl = wmsTimeLayer.createCapabilitiesUrl(wmsTimeUrl, version, layers);

            expect(createdUrl.origin).to.eql("https://geodienste.hamburg.de");
            expect(createdUrl.pathname).to.eql("/HH_WMS-T_Satellitenbilder_Sentinel-2");
            expect(createdUrl.searchParams.get("service")).to.eql("WMS");
            expect(createdUrl.searchParams.get("version")).to.eql(version);
            expect(createdUrl.searchParams.get("layers")).to.eql(layers);
            expect(createdUrl.searchParams.get("request")).to.eql("GetCapabilities");
        });

        it("createUrl should respect questionmark in url", () => {
            const wmsTimeUrl = "https://mapservice.regensburg.de/cgi-bin/mapserv?map=wfs.map",
                version = "1.1.1",
                layers = "layer1,layer2",
                wmsTimeLayer = new Layer2dRasterWmsTime(attributes),
                createdUrl = wmsTimeLayer.createCapabilitiesUrl(wmsTimeUrl, version, layers);

            expect(createdUrl.origin).to.eql("https://mapservice.regensburg.de");
            expect(createdUrl.pathname).to.eql("/cgi-bin/mapserv");
            expect(createdUrl.searchParams.get("map")).to.eql("wfs.map");
            expect(createdUrl.searchParams.get("service")).to.eql("WMS");
            expect(createdUrl.searchParams.get("version")).to.eql(version);
            expect(createdUrl.searchParams.get("layers")).to.eql(layers);
            expect(createdUrl.searchParams.get("request")).to.eql("GetCapabilities");
        });
    });
});
