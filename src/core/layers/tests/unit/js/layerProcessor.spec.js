import {expect} from "chai";
import Map from "ol/Map";
import store from "../../../../../app-store";
import {nextTick} from "vue";
import sinon from "sinon";
import View from "ol/View";

import {processLayerConfig, setResolutions, updateLayerAttributes} from "../../../js/layerProcessor";

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
    it("GROUP: maxScale is not set at any layer - do nothing", () => {
        const setMaxResolutionSpy = sinon.spy(),
            setMinResolutionSpy = sinon.spy(),
            setOpacitySpy = sinon.spy(),
            setZIndexSpy = sinon.spy(),
            olLayer = {
                setMaxResolution: setMaxResolutionSpy,
                setMinResolution: setMinResolutionSpy,
                setOpacity: setOpacitySpy,
                setZIndex: setZIndexSpy
            },
            childLayer = {
                attributes: {
                    typ: "WMS"

                },
                get: (value) => {
                    if (value === "maxScale") {
                        return childLayer.attributes.maxScale;
                    }
                    if (value === "typ") {
                        return childLayer.attributes.typ;
                    }
                    return value;
                },
                set: (key, value) => {
                    childLayer.attributes[key] = value;
                },
                getLayer: sinon.stub().returns(olLayer)
            },
            layer = {
                attributes: {
                    typ: "GROUP",
                    transparency: 50,
                    zIndex: 1
                },
                get: (value) => {
                    if (value === "typ") {
                        return layer.attributes.typ;
                    }
                    if (value === "maxScale") {
                        return layer.attributes.maxScale;
                    }
                    if (value === "transparency") {
                        return layer.attributes.transparency;
                    }
                    if (value === "zIndex") {
                        return layer.attributes.zIndex;
                    }
                    return value;
                },
                set: (key, value) => {
                    layer.attributes[key] = value;
                },
                getLayerSource: sinon.stub().returns([childLayer])
            };

        setResolutions(layer);
        expect(setMaxResolutionSpy.notCalled).to.be.true;
        expect(setMinResolutionSpy.notCalled).to.be.true;
        expect(setOpacitySpy.calledOnce).to.be.true;
        expect(setOpacitySpy.firstCall.args[0]).to.equals(0.5);
        expect(setZIndexSpy.calledOnce).to.be.true;
        expect(setZIndexSpy.firstCall.args[0]).to.equals(1);
    });
    it("GROUP: maxScale and minScale is set at group layer and not at child layer", () => {
        const setMaxResolutionSpy = sinon.spy(),
            setMinResolutionSpy = sinon.spy(),
            setOpacitySpy = sinon.spy(),
            setZIndexSpy = sinon.spy(),
            olLayer = {
                setMaxResolution: setMaxResolutionSpy,
                setMinResolution: setMinResolutionSpy,
                setOpacity: setOpacitySpy,
                setZIndex: setZIndexSpy
            },
            childLayer = {
                attributes: {
                    typ: "WMS"
                },
                get: (value) => {
                    if (value === "maxScale") {
                        return childLayer.attributes.maxScale;
                    }
                    if (value === "minScale") {
                        return groupLayer.attributes.minScale;
                    }
                    if (value === "typ") {
                        return childLayer.attributes.typ;
                    }
                    return value;
                },
                set: (key, value) => {
                    childLayer.attributes[key] = value;
                },
                getLayer: sinon.stub().returns(olLayer)
            },
            groupLayer = {
                attributes: {
                    typ: "GROUP",
                    maxScale: "50000",
                    minScale: "0",
                    transparency: 100,
                    zIndex: 55
                },
                get: (value) => {
                    if (value === "maxScale") {
                        return groupLayer.attributes.maxScale;
                    }
                    if (value === "minScale") {
                        return groupLayer.attributes.minScale;
                    }
                    if (value === "typ") {
                        return groupLayer.attributes.typ;
                    }
                    if (value === "transparency") {
                        return groupLayer.attributes.transparency;
                    }
                    if (value === "zIndex") {
                        return groupLayer.attributes.zIndex;
                    }
                    return value;
                },
                set: (key, value) => {
                    groupLayer.attributes[key] = value;
                },
                getLayerSource: sinon.stub().returns([childLayer])
            };

        setResolutions(groupLayer);
        expect(setMaxResolutionSpy.calledOnce).to.be.true;
        expect(setMaxResolutionSpy.firstCall.args[0]).to.equals(505);
        expect(setMinResolutionSpy.calledOnce).to.be.true;
        expect(setMinResolutionSpy.firstCall.args[0]).to.equals(0);
        expect(setOpacitySpy.calledOnce).to.be.true;
        expect(setOpacitySpy.firstCall.args[0]).to.equals(0);
        expect(setZIndexSpy.calledOnce).to.be.true;
        expect(setZIndexSpy.firstCall.args[0]).to.equals(55);
    });
    it("GROUP: maxScale is set at group layer, minScale not --> shall be set to 0", () => {
        const setMaxResolutionSpy = sinon.spy(),
            setMinResolutionSpy = sinon.spy(),
            setOpacitySpy = sinon.spy(),
            setZIndexSpy = sinon.spy(),
            olLayer = {
                setMaxResolution: setMaxResolutionSpy,
                setMinResolution: setMinResolutionSpy,
                setOpacity: setOpacitySpy,
                setZIndex: setZIndexSpy
            },
            childLayer = {
                attributes: {
                    typ: "WMS"
                },
                get: (value) => {
                    if (value === "maxScale") {
                        return childLayer.attributes.maxScale;
                    }
                    if (value === "minScale") {
                        return childLayer.attributes.minScale;
                    }
                    if (value === "typ") {
                        return childLayer.attributes.typ;
                    }
                    return value;
                },
                set: (key, value) => {
                    childLayer.attributes[key] = value;
                },
                getLayer: sinon.stub().returns(olLayer)
            },
            groupLayer = {
                attributes: {
                    maxScale: "50000",
                    typ: "GROUP",
                    transparency: 50,
                    zIndex: 1
                },
                get: (value) => {
                    if (value === "maxScale") {
                        return groupLayer.attributes.maxScale;
                    }
                    if (value === "minScale") {
                        return groupLayer.attributes.minScale;
                    }
                    if (value === "typ") {
                        return groupLayer.attributes.typ;
                    }
                    if (value === "transparency") {
                        return groupLayer.attributes.transparency;
                    }
                    if (value === "zIndex") {
                        return groupLayer.attributes.zIndex;
                    }
                    return value;
                },
                set: (key, value) => {
                    groupLayer.attributes[key] = value;
                },
                getLayerSource: sinon.stub().returns([childLayer])
            };

        setResolutions(groupLayer);
        expect(setMaxResolutionSpy.calledOnce).to.be.true;
        expect(setMaxResolutionSpy.firstCall.args[0]).to.equals(505);
        expect(setMinResolutionSpy.calledOnce).to.be.true;
        expect(setMinResolutionSpy.firstCall.args[0]).to.equals(0);
        expect(setOpacitySpy.calledOnce).to.be.true;
        expect(setOpacitySpy.firstCall.args[0]).to.equals(0.5);
        expect(setZIndexSpy.calledOnce).to.be.true;
        expect(setZIndexSpy.firstCall.args[0]).to.equals(1);
    });
});
