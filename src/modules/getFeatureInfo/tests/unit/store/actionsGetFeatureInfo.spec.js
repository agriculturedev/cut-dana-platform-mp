import {expect} from "chai";
import sinon from "sinon";
import VectorSource from "ol/source/Vector";
import transformer from "../../../../../shared/js/utils/coordToPixel3D";
import actions from "../../../store/actionsGetFeatureInfo.js";
import layerCollection from "../../../../../core/layers/js/layerCollection";


describe("src/modules/getFeatureInfo/store/actionsGetFeatureInfo.js", () => {
    let getters,
        rootGetters,
        dispatch,
        commit,
        addEventListenerSpy,
        clickPixel;

    beforeEach(() => {
        addEventListenerSpy = sinon.spy();
        clickPixel = [300, 400];
        mapCollection.clear();
        const map3D = {
                id: "1",
                mode: "3D",
                getCesiumScene: () => {
                    return {
                        primitives: {
                            show: true,
                            contains: () => true,
                            add: sinon.stub()
                        },
                        globe: {
                            tileLoadProgressEvent: {
                                addEventListener: addEventListenerSpy
                            }
                        }
                    };
                }
            },
            map2D = {
                id: "ol",
                mode: "2D",
                getPixelFromCoordinate: sinon.stub().returns(clickPixel)
            };

        mapCollection.addMap(map3D, "3D");
        mapCollection.addMap(map2D, "2D");
        global.Cesium = {};
        global.Cesium.ScreenSpaceEventHandler = function () {
            return {
                setInputAction: () => sinon.stub(),
                destroy: () => sinon.stub()
            };
        };
        global.Cesium.ScreenSpaceEventType = {
            LEFT_CLICK: sinon.stub()
        };
        global.Cesium.Color = {
            RED: () => sinon.stub()
        };
        sinon.stub(console, "warn");

        dispatch = sinon.spy();
        commit = sinon.spy();
        getters = {
            type: "getFeatureInfo"
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("test 3D Highlighting", () => {
        it("console warns if color is not array or string", () => {
            getters = {
                "coloredHighlighting3D": {
                    "color": {}
                }
            };
            actions.highlight3DTile({getters, dispatch});
            expect(console.warn.called).to.be.true;
            expect(console.warn.calledWith("The color for the 3D highlighting is not valid. Please check the config or documentation.")).to.be.true;
        });
        it("dispatch removeHighlightColor", () => {
            actions.removeHighlight3DTile({dispatch});
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("removeHighlightColor");
        });
    });

    describe("restoreFromUrlParams", () => {
        it("2D: styleListLoaded = true, call handleRestore2D", () => {
            const attributes = {
                clickCoordinates: [100, 200]
            };

            rootGetters = {
                urlParams: {
                    MAPS:
                        "{\"mode\":\"2D\"}"
                },
                styleListLoaded: true
            };
            actions.restoreFromUrlParams({getters, dispatch, rootGetters}, attributes);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("handleRestore2D");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({attributes, componentName: "GetFeatureInfo", clickCoordinates: attributes.clickCoordinates});
        });
        it("2D: styleListLoaded = false, call waitAndRestore", () => {
            const attributes = {
                    clickCoordinates: [100, 200]
                },
                mode = "2D";

            rootGetters = {
                urlParams: {
                    MAPS:
                        "{\"mode\":\"" + mode + "\"}"
                },
                styleListLoaded: false
            };
            actions.restoreFromUrlParams({getters, dispatch, rootGetters}, attributes);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("waitAndRestore");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({attributes, componentName: "GetFeatureInfo", clickCoordinates: attributes.clickCoordinates, mode});
        });
        it("3D: call waitAndRestore", () => {
            const attributes = {
                    clickCoordinates: [100, 200]
                },
                mode = "3D";

            rootGetters = {
                urlParams: {
                    MAPS:
                    "{\"mode\":\"" + mode + "\"}"
                }
            };
            actions.restoreFromUrlParams({getters, dispatch, rootGetters}, attributes);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("waitAndRestore");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({attributes, componentName: "GetFeatureInfo", clickCoordinates: attributes.clickCoordinates, mode});
        });
    });
    describe("handleRestore3D", () => {
        it("visibleTerrainLayers exists, add event", () => {
            const clickCoordinates = [100, 200],
                attributes = {
                    clickCoordinates
                },
                componentName = "GetFeatureInfo",
                coordToPixel3DStub = sinon.stub(transformer, "coordToPixel3D").returns([1, 2]);

            rootGetters = {
                visibleLayerConfigs: [{typ: "Terrain3D"}],
                styleListLoaded: true
            };

            actions.handleRestore3D({dispatch, rootGetters}, {attributes, componentName, clickCoordinates});
            expect(coordToPixel3DStub.calledOnce).to.be.true;
            expect(coordToPixel3DStub.firstCall.args[0]).to.be.deep.equals(clickCoordinates);
            expect(addEventListenerSpy.calledOnce).to.be.true;
        });
        it("visibleTerrainLayer does not exist, call warn", () => {
            const clickCoordinates = [100, 200],
                attributes = {
                    clickCoordinates
                },
                componentName = "GetFeatureInfo",
                coordToPixel3DStub = sinon.stub(transformer, "coordToPixel3D").returns([1, 2]);

            rootGetters = {
                visibleLayerConfigs: [{typ: "WMS"}],
                styleListLoaded: true
            };

            actions.handleRestore3D({dispatch, rootGetters}, {attributes, componentName, clickCoordinates});
            expect(coordToPixel3DStub.notCalled).to.be.true;
            expect(addEventListenerSpy.notCalled).to.be.true;
            expect(console.warn.called).to.be.true;
        });
    });

    describe("restore2D", () => {
        it("VectorSource: features are loaded, call restoreGFI", () => {
            const clickCoordinates = [100, 200],
                attributes = {
                    clickCoordinates
                },
                componentName = "GetFeatureInfo",
                layerSource = Object.create(VectorSource.prototype),
                layer = {
                    getLayerSource: () => {
                        return layerSource;
                    }
                };

            Object.assign(layerSource, {getFeatures: () => {
                return [{id: "feature1"}];
            }});

            sinon.stub(layerCollection, "getLayerById").returns(layer);

            actions.restore2D({dispatch}, {attributes, componentName, clickCoordinates});
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("restoreGFI");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({attributes, componentName, clickCoordinates, clickPixel});
        });
        it("VectorSource: features are not loaded, wait for featuresloadend event", () => {
            const clickCoordinates = [100, 200],
                attributes = {
                    clickCoordinates
                },
                componentName = "GetFeatureInfo",
                onceSpy = sinon.spy(),
                layerSource = Object.create(VectorSource.prototype),
                layer = {
                    getLayerSource: () => {
                        return layerSource;
                    }
                };

            Object.assign(layerSource, {
                getFeatures: () => {
                    return [];
                },
                once: onceSpy
            });

            sinon.stub(layerCollection, "getLayerById").returns(layer);

            actions.restore2D({dispatch}, {attributes, componentName, clickCoordinates});
            expect(onceSpy.calledOnce).to.be.true;
            expect(onceSpy.firstCall.args[0]).to.equal("featuresloadend");
        });
        it("layerSource is no VectorSource, call restoreGFI", () => {
            const clickCoordinates = [100, 200],
                attributes = {
                    clickCoordinates
                },
                componentName = "GetFeatureInfo",
                layer = {
                    getLayerSource: sinon.stub()
                };

            sinon.stub(layerCollection, "getLayerById").returns(layer);

            actions.restore2D({dispatch}, {attributes, componentName, clickCoordinates});
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("restoreGFI");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({attributes, componentName, clickCoordinates, clickPixel});
        });
    });

    describe("restoreGFI", () => {
        it("restoreGFI call commit and dispatch", () => {
            const clickCoordinates = [100, 200],
                attributes = {
                    clickCoordinates
                },
                componentName = "GetFeatureInfo";

            getters.menuSide = "secondaryMenu";

            actions.restoreGFI({getters, commit, dispatch}, {attributes, componentName, clickCoordinates, clickPixel});
            expect(commit.firstCall.args[0]).to.equal("Maps/setClickCoordinate");
            expect(commit.firstCall.args[1]).to.be.deep.equals(clickCoordinates);
            expect(commit.secondCall.args[0]).to.equal("Maps/setClickPixel");
            expect(commit.secondCall.args[1]).to.be.deep.equals(clickPixel);
            expect(commit.thirdCall.args[0]).to.equal("setClickCoordinates");
            expect(commit.thirdCall.args[1]).to.be.deep.equals(clickCoordinates);
            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("Modules/GetFeatureInfo/collectGfiFeatures");
            expect(dispatch.firstCall.args[1]).to.be.null;
            expect(dispatch.secondCall.args[0]).to.equal("Menu/activateCurrentComponent");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals({currentComponent: {type: getters.type}, componentName, side: getters.menuSide});
            expect(dispatch.thirdCall.args[0]).to.equal("Menu/updateComponentState");
            expect(dispatch.thirdCall.args[1]).to.be.deep.equals({type: componentName, attributes});
        });
    });
});
