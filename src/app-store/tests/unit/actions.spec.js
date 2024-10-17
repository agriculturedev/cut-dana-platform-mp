import axios from "axios";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import sinon from "sinon";
import {expect} from "chai";
import actions from "../../actions";

describe("src/app-store/actions.js", () => {
    let axiosMock,
        commit,
        dispatch,
        fetch,
        state,
        initializeLayerListSpy,
        initializeStyleListSpy;
    const restConf = "./resources/rest-services-internet.json",
        layerConf = "./services.json";

    beforeEach(() => {
        fetch = global.fetch;
        global.fetch = sinon.spy(() => new Promise(r => r));
        commit = sinon.spy();
        dispatch = sinon.spy();
        state = {
            configJs: {
                portalConf: "./",
                layerConf: layerConf,
                restConf: restConf
            },
            portalConfigDefaults: {
                tree: {
                    validLayerTypesAutoTree: ["WMS", "SENSORTHINGS", "TERRAIN3D", "TILESET3D", "OBLIQUE"]
                }
            }
        };
        global.XMLHttpRequest = sinon.useFakeXMLHttpRequest();
        axiosMock = sinon.stub(axios, "get").returns(Promise.resolve({request: {status: 200, data: []}}));
        initializeLayerListSpy = sinon.spy(rawLayerList, "initializeLayerList");
        initializeStyleListSpy = sinon.spy(styleList, "initializeStyleList");
    });

    afterEach(() => {
        global.fetch = fetch;
        sinon.restore();
    });

    describe("app-store actions", () => {
        it("loadConfigJs", () => {
            const payLoad = {
                config: "js"
            };

            actions.loadConfigJs({commit}, payLoad);

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equals("setConfigJs");
            expect(commit.firstCall.args[1]).to.equals(payLoad);
        });
        it("loadConfigJson", () => {
            const getters = {
                isMobile: false
            };

            actions.loadConfigJson({commit, state, dispatch, getters});

            expect(axiosMock.calledOnce).to.be.true;
            expect(axiosMock.calledWith("config.json")).to.be.true;

        });
        it("loadRestServicesJson", () => {
            actions.loadRestServicesJson({commit, state});

            expect(axiosMock.calledOnce).to.be.true;
            expect(axiosMock.calledWith(restConf)).to.be.true;
        });
        it("loadServicesJson", () => {
            actions.loadServicesJson({state, commit});

            expect(initializeLayerListSpy.calledOnce).to.be.true;
            expect(initializeLayerListSpy.calledWith(layerConf)).to.be.true;
        });

        it("initializeVectorStyle", () => {
            const getters = {
                    configuredModules: [{a: "b"}, {c: "d"}],
                    allLayerConfigs: [{
                        id: "id",
                        typ: "WMS"
                    }],
                    "Modules/HighlightFeatures/pointStyleId": "pointStyleId",
                    "Modules/HighlightFeatures/polygonStyleId": "polygonStyleId",
                    "Modules/HighlightFeatures/lineStyleId": "lineStyleId",
                    mapMarker: {
                        pointStyleId: "123",
                        polygonStyleId: "abc"
                    },
                    zoomTo: [
                        {
                            id: "zoomToFeatureId",
                            styleId: "eventlotse"
                        }
                    ]
                },
                firstCallArg = {
                    highlightFeaturesPointStyleId: "pointStyleId",
                    highlightFeaturesPolygonStyleId: "polygonStyleId",
                    highlightFeaturesLineStyleId: "lineStyleId",
                    mapMarkerPointStyleId: "123",
                    mapMarkerPolygonStyleId: "abc",
                    zoomToFeatureId: "eventlotse"
                };

            actions.initializeVectorStyle({state, commit, dispatch, getters});

            expect(initializeStyleListSpy.calledOnce).to.be.true;
            expect(initializeStyleListSpy.firstCall.args[0]).to.be.deep.equals(firstCallArg);
            expect(initializeStyleListSpy.firstCall.args[1]).to.equals(state.configJs);
            expect(initializeStyleListSpy.firstCall.args[2]).to.be.deep.equals(getters.allLayerConfigs);
            expect(initializeStyleListSpy.firstCall.args[3]).to.be.deep.equals([{a: "b"}, {c: "d"}]);
            expect(typeof initializeStyleListSpy.firstCall.args[4]).to.be.equals("function");

        });

        it("moveStartModuleControls", () => {
            const startModule = {
                    secondaryMenu: [
                        {
                            type: "module_1",
                            foo: "bar"
                        }
                    ]
                },
                getters = {
                    controlsConfig: {
                        startModule
                    }
                };

            state = {
                portalConfig: {
                    map: {
                        controls: {
                            startModule
                        }
                    },
                    secondaryMenu: {
                        sections: [
                            [
                                {
                                    type: "print"
                                },
                                {
                                    type: "draw"
                                }
                            ]
                        ]
                    }
                }
            };

            actions.moveStartModuleControls({getters, state}, "secondaryMenu");

            expect(dispatch.notCalled).to.be.true;
            expect(state.portalConfig.secondaryMenu.sections[0].length).to.be.equals(3);
            expect(state.portalConfig.secondaryMenu.sections[0][2].type).to.be.equals("module_1");
            expect(state.portalConfig.map.controls.startModule.secondaryMenu).to.be.deep.equals([]);

        });
    });
});
