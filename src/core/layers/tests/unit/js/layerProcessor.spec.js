import {expect} from "chai";
import Map from "ol/Map";
import store from "../../../../../app-store";
import {nextTick} from "vue";
import sinon from "sinon";
import View from "ol/View";

import {processLayerConfig, setResolutions, setResolutionsForGroupLayer, updateLayerAttributes} from "../../../js/layerProcessor";

describe("src/core/js/layers/layerProcessor.js", () => {
    let layerConfig,
        map,
        warn;

    before(() => {
        warn = sinon.spy();
        sinon.stub(console, "warn").callsFake(warn);
    });

    beforeEach(() => {
        layerConfig = [
            {
                id: "453",
                visibility: true,
                name: "Geobasiskarten (HamburgDE)",
                url: "https://geodienste.hamburg.de/HH_WMS_HamburgDE",
                typ: "WMS",
                layers: "Geobasiskarten_HHde"
            },
            {
                id: "2426",
                visibility: true,
                name: "Bezirke",
                url: "https://geodienste.hamburg.de/HH_WMS_Verwaltungsgrenzen",
                typ: "WMS",
                layers: "bezirke"
            }
        ];
        store.getters = {
            layerConfigById: () => true,
            determineZIndex: sinon.stub().returns(2),
            "Maps/getResolutionByScale": sinon.stub().callsFake(function (scale, attribute) {
                if (attribute === "max") {
                    return scale / 100;
                }
                if (attribute === "min") {
                    return scale / 10;
                }
                return null;
            })
        };
        mapCollection.clear();
        map = new Map({
            id: "ol",
            mode: "2D",
            view: new View()
        });

        mapCollection.addMap(map, "2D");
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("processLayerConfig", () => {
        it("should create two ol layers from two visible layers", () => {
            let olLayers = [];

            processLayerConfig(layerConfig);

            nextTick(() => {
                olLayers = mapCollection.getMap("2D").getLayers().getArray();

                expect(olLayers.length).equals(2);
                expect(olLayers[0].get("id")).to.equals("453");
                expect(olLayers[1].get("id")).to.equals("2426");
            });
        });
    });

    describe("updateLayerAttributes", () => {
        it("should update a wms layer", () => {
            const wmsLayer = {
                attributes: {
                    typ: "WMS",
                    abc: true
                },
                get: (value) => value,
                updateLayerValues: () => sinon.stub()
            };

            updateLayerAttributes(wmsLayer, layerConfig[0]);

            expect(wmsLayer.attributes).to.deep.equals({
                id: "453",
                visibility: true,
                name: "Geobasiskarten (HamburgDE)",
                url: "https://geodienste.hamburg.de/HH_WMS_HamburgDE",
                typ: "WMS",
                layers: "Geobasiskarten_HHde",
                abc: true
            });
        });
    });

    describe("setResolutions", () => {
        it("maxScale is not set at layer - do nothing", () => {
            const setMaxResolutionSpy = sinon.spy(),
                setMinResolutionSpy = sinon.spy(),
                layer = {
                    attributes: {
                        typ: "WMS"
                    },
                    get: (value) => {
                        if (value === "maxScale") {
                            return layer.attributes.maxScale;
                        }
                        if (value === "minScale") {
                            return layer.attributes.minScale;
                        }
                        return value;
                    }
                };

            setResolutions(layer);
            expect(setMaxResolutionSpy.notCalled).to.be.true;
            expect(setMinResolutionSpy.notCalled).to.be.true;
        });
        it("maxScale is set at layer", () => {
            const setMaxResolutionSpy = sinon.spy(),
                setMinResolutionSpy = sinon.spy(),
                olLayer = {
                    setMaxResolution: setMaxResolutionSpy,
                    setMinResolution: setMinResolutionSpy
                },
                layer = {
                    attributes: {
                        typ: "WMS",
                        maxScale: "50000",
                        minScale: "0"
                    },
                    get: (value) => {
                        if (value === "maxScale") {
                            return layer.attributes.maxScale;
                        }
                        if (value === "minScale") {
                            return layer.attributes.minScale;
                        }
                        return value;
                    },
                    getLayer: sinon.stub().returns(olLayer)
                };

            setResolutions(layer);
            expect(setMaxResolutionSpy.calledOnce).to.be.true;
            expect(setMaxResolutionSpy.firstCall.args[0]).to.equals(505);
            expect(setMinResolutionSpy.calledOnce).to.be.true;
            expect(setMinResolutionSpy.firstCall.args[0]).to.equals(0);
        });
        it("maxScale is set at layer, minScale not", () => {
            const setMaxResolutionSpy = sinon.spy(),
                setMinResolutionSpy = sinon.spy(),
                olLayer = {
                    setMaxResolution: setMaxResolutionSpy,
                    setMinResolution: setMinResolutionSpy
                },
                layer = {
                    attributes: {
                        typ: "WMS",
                        maxScale: "50000"
                    },
                    get: (value) => {
                        if (value === "maxScale") {
                            return layer.attributes.maxScale;
                        }
                        if (value === "minScale") {
                            return layer.attributes.minScale;
                        }
                        return value;
                    },
                    set: (key, value) => {
                        layer.attributes[key] = value;
                    },
                    getLayer: sinon.stub().returns(olLayer)
                };

            setResolutions(layer);
            expect(setMaxResolutionSpy.calledOnce).to.be.true;
            expect(setMaxResolutionSpy.firstCall.args[0]).to.equals(505);
            expect(setMinResolutionSpy.calledOnce).to.be.true;
            expect(setMinResolutionSpy.firstCall.args[0]).to.equals(0);
        });
    });
    describe("setResolutionsForGroupLayer", () => {
        it("maxScale is not set at layer - do nothing", () => {
            const setMaxResolutionSpy = sinon.spy(),
                setMinResolutionSpy = sinon.spy(),
                rawLayer = [{
                    typ: "WMS"
                }],
                groupLayer = {
                    getLayer: () => {
                        return {
                            getLayers: () => {
                                return {
                                    getArray: () => {
                                        return rawLayer;
                                    }
                                };
                            }
                        };
                    }
                },
                index = 0;

            setResolutionsForGroupLayer(rawLayer, groupLayer, index);
            expect(setMaxResolutionSpy.notCalled).to.be.true;
            expect(setMinResolutionSpy.notCalled).to.be.true;
        });
        it.skip("maxScale is set at layer", () => {
            const setMaxResolutionSpy = sinon.spy(),
                setMinResolutionSpy = sinon.spy(),
                olLayer = {
                    setMaxResolution: setMaxResolutionSpy,
                    setMinResolution: setMinResolutionSpy
                },
                layer = {
                    attributes: {
                        typ: "GROUP",
                        maxScale: "50000",
                        minScale: "0"
                    },
                    get: (value) => {
                        if (value === "maxScale") {
                            return layer.attributes.maxScale;
                        }
                        if (value === "minScale") {
                            return layer.attributes.minScale;
                        }
                        return value;
                    },
                    getLayer: sinon.stub().returns(olLayer)
                };

            setResolutions(layer);
            expect(setMaxResolutionSpy.calledOnce).to.be.true;
            expect(setMaxResolutionSpy.firstCall.args[0]).to.equals(505);
            expect(setMinResolutionSpy.calledOnce).to.be.true;
            expect(setMinResolutionSpy.firstCall.args[0]).to.equals(0);
        });
        it.skip("maxScale is set at layer, minScale not", () => {
            const setMaxResolutionSpy = sinon.spy(),
                setMinResolutionSpy = sinon.spy(),
                olLayer = {
                    setMaxResolution: setMaxResolutionSpy,
                    setMinResolution: setMinResolutionSpy
                },
                layer = {
                    attributes: {
                        typ: "WMS",
                        maxScale: "50000"
                    },
                    get: (value) => {
                        if (value === "maxScale") {
                            return layer.attributes.maxScale;
                        }
                        if (value === "minScale") {
                            return layer.attributes.minScale;
                        }
                        return value;
                    },
                    set: (key, value) => {
                        layer.attributes[key] = value;
                    },
                    getLayer: sinon.stub().returns(olLayer)
                };

            setResolutions(layer);
            expect(setMaxResolutionSpy.calledOnce).to.be.true;
            expect(setMaxResolutionSpy.firstCall.args[0]).to.equals(505);
            expect(setMinResolutionSpy.calledOnce).to.be.true;
            expect(setMinResolutionSpy.firstCall.args[0]).to.equals(0);
        });
    });
});
