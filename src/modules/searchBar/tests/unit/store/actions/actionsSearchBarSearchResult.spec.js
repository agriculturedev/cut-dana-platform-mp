import sinon from "sinon";
import {expect} from "chai";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import WKTUtil from "../../../../../../shared/js/utils/getWKTGeom";
import wmsGFIUtil from "../../../../../../shared/js/utils/getWmsFeaturesByMimeType";
import actions from "../../../../store/actions/actionsSearchBarSearchResult";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList.js";

describe("src/modules/searchBar/store/actions/actionsSearchBarSearchResult.spec.js", () => {
    let dispatch,
        commit,
        getters,
        zoomLevel,
        map;

    beforeEach(() => {
        zoomLevel = 5;

        dispatch = sinon.spy();
        commit = sinon.spy();
        getters = {
            zoomLevel: zoomLevel
        };
        map = {
            id: "ol",
            mode: "2D",
            getView: () => {
                return {
                    getZoomForResolution: () => 5,
                    getResolutionForExtent: () => 5
                };
            },
            getSize: () => {
                return {
                    getArray: () => []
                };
            }
        };
        mapCollection.clear();
        mapCollection.addMap(map, "2D");
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("activateLayerInTopicTree", () => {
        it("should activate a layer in topic tree", () => {
            const layerId = "123",
                rootGetters = {
                    layerConfigById: sinon.stub().returns({
                        id: layerId,
                        zIndex: 1,
                        showInLayerTree: true
                    })
                };

            actions.activateLayerInTopicTree({dispatch, rootGetters}, {layerId});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("replaceByIdInLayerConfig");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({
                layerConfigs: [{
                    id: layerId,
                    layer: {
                        id: layerId,
                        visibility: true,
                        showInLayerTree: true,
                        zIndex: 1
                    }
                }]
            });
        });

        it("should activate a layer in topic tree and set zIndex", () => {
            const layerId = "123",
                rootGetters = {
                    layerConfigById: sinon.stub().returns({
                        id: layerId,
                        zIndex: 1,
                        showInLayerTree: false
                    }),
                    determineZIndex: () => 2
                };

            actions.activateLayerInTopicTree({dispatch, rootGetters}, {layerId});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("replaceByIdInLayerConfig");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({
                layerConfigs: [{
                    id: layerId,
                    layer: {
                        id: layerId,
                        visibility: true,
                        showInLayerTree: true,
                        zIndex: 2
                    }
                }]
            });
        });

        it("should add and activate a layer in topic tree", () => {
            const layerId = "123",
                source = {
                    id: layerId,
                    visibility: true,
                    showInLayerTree: true,
                    zIndex: 1
                },
                rootGetters = {
                    layerConfigById: sinon.stub().returns(undefined)
                };

            actions.activateLayerInTopicTree({dispatch, rootGetters}, {layerId, source});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("addLayerToTopicTree");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({
                layerId: layerId,
                source: {
                    id: layerId,
                    visibility: true,
                    showInLayerTree: true,
                    zIndex: 1
                }
            }
            );
        });

    });

    describe("addLayerToTopicTree", () => {
        it("should add a layer to topic tree", () => {
            const layerId = "123",
                source = {
                    id: layerId,
                    abc: "abc",
                    datasets: []
                },
                added = true,
                rootGetters = {
                    layerConfigById: sinon.stub().returns(false)
                };

            dispatch = sinon.stub().resolves(added);
            actions.addLayerToTopicTree({dispatch, rootGetters}, {layerId, source});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("addLayerToLayerConfig");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({
                layerConfig: {
                    id: layerId,
                    abc: "abc",
                    datasets: [],
                    showInLayerTree: true,
                    type: "layer",
                    visibility: true
                },
                parentKey: "subjectlayer"
            });
        });

        it("should activate layer in topic tree", () => {
            const layerId = "123",
                source = {
                    id: layerId,
                    abc: "abc",
                    datasets: []
                },
                added = true,
                rootGetters = {
                    layerConfigById: sinon.stub().returns(true)
                };

            dispatch = sinon.stub().resolves(added);
            actions.addLayerToTopicTree({dispatch, rootGetters}, {layerId, source});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("activateLayerInTopicTree");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({
                layerId,
                source
            });
        });
    });

    describe("removeLayerFromTopicTree", () => {
        it("should remove a layer from topic tree", () => {
            const layerId = "123",
                rootGetters = {
                    layerConfigById: sinon.stub().returns(true)
                };

            actions.removeLayerFromTopicTree({dispatch, rootGetters}, {layerId});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("replaceByIdInLayerConfig");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({
                layerConfigs: [{
                    id: layerId,
                    layer: {
                        id: layerId,
                        visibility: false,
                        showInLayerTree: false
                    }
                }]
            });
        });

        it("should do nothing", () => {
            const layerId = "123",
                rootGetters = {
                    layerConfigById: sinon.stub().returns(false)
                };

            actions.removeLayerFromTopicTree({dispatch, rootGetters}, {layerId});

            expect(dispatch.notCalled).to.be.true;
        });
    });

    describe("showInTree", () => {
        const typeLayerSelection = {type: "layerSelection", props: {name: "common:modules.layerSelection.name"}};

        it("should call showLayer for a layer", async () => {
            const layerId = "123",
                payload = {side: "mainMenu", newHistory: [{type: "root", props: []}, typeLayerSelection]};

            dispatch = sinon.stub().resolves({id: layerId});
            await actions.showInTree({commit, dispatch}, {layerId});

            expect(dispatch.callCount).to.be.equals(3);
            expect(dispatch.firstCall.args[0]).to.equals("retrieveLayerConfig");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({layerId, source: undefined});
            expect(dispatch.secondCall.args[0]).to.equals("Menu/changeCurrentComponent");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals({type: "layerSelection", side: "mainMenu", props: {name: "common:modules.layerSelection.name"}});
            expect(dispatch.thirdCall.args[0]).to.equals("Modules/LayerSelection/showLayer");
            expect(dispatch.thirdCall.args[1]).to.be.deep.equals({
                layerId: "123"
            });
            expect(commit.callCount).to.be.equals(2);
            expect(commit.firstCall.args[0]).to.equals("setShowInTree");
            expect(commit.firstCall.args[1]).to.be.equals(true);
            expect(commit.secondCall.args[0]).to.equals("Menu/setNavigationHistoryBySide");
            expect(commit.secondCall.args[1]).to.be.deep.equals(payload);
        });

        it("should call showLayer for a folder", async () => {
            const layerId = "folder-1",
                payload = {side: "mainMenu", newHistory: [{type: "root", props: []}, typeLayerSelection]};

            dispatch = sinon.stub().resolves({id: layerId,
                elements: [
                    {
                        id: "123"
                    }
                ]});
            await actions.showInTree({commit, dispatch}, {layerId});

            expect(dispatch.callCount).to.be.equals(3);
            expect(dispatch.firstCall.args[0]).to.equals("retrieveLayerConfig");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({layerId, source: undefined});
            expect(dispatch.secondCall.args[0]).to.equals("Menu/changeCurrentComponent");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals({type: "layerSelection", side: "mainMenu", props: {name: "common:modules.layerSelection.name"}});
            expect(dispatch.thirdCall.args[0]).to.equals("Modules/LayerSelection/showLayer");
            expect(dispatch.thirdCall.args[1]).to.be.deep.equals({
                layerId: "123"
            });
            expect(commit.callCount).to.be.equals(3);
            expect(commit.firstCall.args[0]).to.equals("setShowInTree");
            expect(commit.firstCall.args[1]).to.be.equals(true);
            expect(commit.secondCall.args[0]).to.equals("Menu/setNavigationHistoryBySide");
            expect(commit.secondCall.args[1]).to.be.deep.equals(payload);
            expect(commit.thirdCall.args[0]).to.equals("Modules/LayerSelection/setHighlightLayerId");
            expect(commit.thirdCall.args[1]).to.be.deep.equals(null);
        });

        it("should warn and show alert if layerConfig does not exist", async () => {
            const layerId = "123",
                warnSpy = sinon.spy(),
                payload = {side: "mainMenu", newHistory: [{type: "root", props: []}, typeLayerSelection]};

            sinon.stub(console, "warn").callsFake(warnSpy);
            dispatch = sinon.stub().resolves(undefined);
            await actions.showInTree({commit, dispatch}, {layerId});

            expect(warnSpy.callCount).to.equal(1);
            expect(dispatch.callCount).to.equal(3);
            expect(dispatch.firstCall.args[0]).to.equals("retrieveLayerConfig");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({layerId, source: undefined});
            expect(dispatch.secondCall.args[0]).to.equals("Menu/changeCurrentComponent");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals({type: "layerSelection", side: "mainMenu", props: {name: "common:modules.layerSelection.name"}});
            expect(dispatch.thirdCall.args[0]).to.equals("Alerting/addSingleAlert");
            expect(dispatch.thirdCall.args[1]).to.be.deep.equals({
                category: "info",
                content: i18next.t("common:modules.searchBar.layerResultNotShown")
            });
            expect(commit.callCount).to.be.equals(2);
            expect(commit.firstCall.args[0]).to.equals("setShowInTree");
            expect(commit.firstCall.args[1]).to.be.equals(true);
            expect(commit.secondCall.args[0]).to.equals("Menu/setNavigationHistoryBySide");
            expect(commit.secondCall.args[1]).to.be.deep.equals(payload);
        });

    });

    describe("showLayerInfo", () => {
        it("should call startLayerInformation - layer in layerConfig", async () => {
            const layerId = "123",
                config = {
                    layerId
                },
                source = {
                    id: "sourceId"
                };

            dispatch = sinon.stub().resolves(config);
            await actions.showLayerInfo({dispatch, commit}, {layerId, source});

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("retrieveLayerConfig");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({layerId, source});
            expect(dispatch.secondCall.args[0]).to.equals("Modules/LayerInformation/startLayerInformation");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals(config);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equals("Modules/LayerSelection/setLayerInfoVisible");
            expect(commit.firstCall.args[1]).to.be.true;
        });

        it("should call startLayerInformation - layer not in layerConfig", async () => {
            const layerId = "123",
                warnSpy = sinon.spy();

            sinon.stub(console, "warn").callsFake(warnSpy);
            dispatch = sinon.stub().resolves(undefined);
            await actions.showLayerInfo({dispatch, commit}, {layerId});

            expect(warnSpy.callCount).to.equal(1);
            expect(dispatch.callCount).to.equal(2);
            expect(dispatch.firstCall.args[0]).to.equals("retrieveLayerConfig");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({layerId, source: undefined});
            expect(dispatch.secondCall.args[0]).to.equals("Alerting/addSingleAlert");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals({
                category: "info",
                content: i18next.t("common:modules.searchBar.layerInfoNotShown")
            });
        });
    });

    describe("retrieveLayerConfig", () => {
        it("layer contained in getters, no source", () => {
            const layerId = "123",
                rootGetters = {
                    layerConfigById: sinon.stub().returns({id: layerId})
                },
                getLayerWhereSpy = sinon.stub(rawLayerList, "getLayerWhere").returns("whatever"),
                result = actions.retrieveLayerConfig({dispatch, rootGetters}, {layerId});

            expect(dispatch.notCalled).to.be.true;
            expect(getLayerWhereSpy.notCalled).to.be.true;
            expect(result).to.be.deep.equals({id: layerId});
        });

        it("layer not contained in getters", () => {
            const layerId = "123",
                rootGetters = {
                    layerConfigById: sinon.stub().returns(null)
                },
                config = {id: layerId, name: "name"},
                getLayerWhereSpy = sinon.stub(rawLayerList, "getLayerWhere").returns(config),
                result = actions.retrieveLayerConfig({dispatch, rootGetters}, {layerId});

            expect(dispatch.notCalled).to.be.true;
            expect(getLayerWhereSpy.calledOnce).to.be.true;
            expect(getLayerWhereSpy.firstCall.args[0]).to.be.deep.equals({id: layerId});
            expect(result).to.be.deep.equals(config);
        });

        it("layer not contained in getters and in rawLayerList", () => {
            let counter = 0;
            const layerId = "123",
                source = {
                    id: "sourceId"
                },
                config = {id: layerId, name: "name"},
                rootGetters = {
                    layerConfigById: sinon.stub().callsFake(
                        () => {
                            if (counter === 0) {
                                counter++;
                                return undefined;
                            }
                            return config;
                        }
                    )
                },
                getLayerWhereSpy = sinon.stub(rawLayerList, "getLayerWhere").returns(null),
                result = actions.retrieveLayerConfig({dispatch, rootGetters}, {layerId, source});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("addLayerToTopicTree");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({layerId, source: source, showInLayerTree: false, visibility: false});
            expect(getLayerWhereSpy.calledOnce).to.be.true;
            expect(getLayerWhereSpy.firstCall.args[0]).to.be.deep.equals({id: layerId});
            expect(result).to.be.deep.equals(config);
        });

        it("folder contained in getters", () => {
            const layerId = "folder-1",
                folder = {
                    id: layerId,
                    name: "I am a folder"
                },
                rootGetters = {
                    layerConfigById: sinon.stub().returns(null),
                    folderById: sinon.stub().returns(folder)
                },
                getLayerWhereSpy = sinon.stub(rawLayerList, "getLayerWhere").returns(null),
                result = actions.retrieveLayerConfig({dispatch, rootGetters}, {layerId});

            expect(dispatch.notCalled).to.be.true;
            expect(getLayerWhereSpy.notCalled).to.be.true;
            expect(result).to.be.deep.equals(folder);
        });
    });

    describe("highlightFeature", () => {
        it("highlightFeature shall dispatch 'placingPolygonMarker'", () => {
            const hit = {
                    geometryType: "MULTIPOLYGON",
                    coordinate: [
                        ["570374.959", "5936460.361", "570369.316", "5936458.5", "570364.706", "5936473.242", "570370.393", "5936474.993", "570374.959", "5936460.361"],
                        ["556622.043", "5935346.022", "556605.381", "5935347.509", "556583.860", "5935349.429", "556562.872", "5935351.302", "556562.855", "5935344.371", "556604.117", "5935340.974", "556622.043", "5935339.707", "556622.043", "5935346.022"]
                    ],
                    id: "im Verfahren331",
                    name: "HafenCity12-Hamburg-Altstadt48",
                    type: "im Verfahren"
                },
                type = {getType: () => "MultiPolygon"},
                feature = {
                    id: "feature",
                    getGeometry: () => type
                },
                stubGetWKTGeom = sinon.stub(WKTUtil, "getWKTGeom").returns(feature);

            actions.highlightFeature({dispatch}, {hit});
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("Maps/placingPolygonMarker");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(feature.getGeometry());
            expect(stubGetWKTGeom.calledOnce).to.be.true;
            expect(stubGetWKTGeom.firstCall.args[0]).to.be.deep.equals(hit);
        });
    });

    describe("openGetFeatureInfo", () => {
        it("openGetFeatureInfo shall commit 'setGfiFeatures'", () => {
            const feature = {
                    id: "feature"
                },
                layer = {
                    id: "layer"
                },
                gfiFeature = {
                    getId: () => feature.id,
                    getLayerId: () => layer.id
                },
                stubCreateGfiFeature = sinon.stub(wmsGFIUtil, "createGfiFeature").returns(gfiFeature);

            actions.openGetFeatureInfo({commit}, {feature, layer});
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.equals("Modules/GetFeatureInfo/setGfiFeatures");
            expect(commit.firstCall.args[1]).to.be.deep.equals([gfiFeature]);
            expect(stubCreateGfiFeature.calledOnce).to.be.true;
            expect(stubCreateGfiFeature.firstCall.args[0]).to.be.deep.equals(layer);
            expect(stubCreateGfiFeature.firstCall.args[1]).to.be.equals("");
            expect(stubCreateGfiFeature.firstCall.args[2]).to.be.deep.equals(feature);
        });
    });

    describe("setMarker", () => {
        it("sets the MapMarker with coordinates", () => {
            const coordinates = [1234, 65432],
                payload = [1234, 65432];

            actions.setMarker({dispatch}, {coordinates});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("Maps/placingPointMarker");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(payload);
        });

        it("highlights multipolygon feature with style from styleList", () => {
            const coordinates = [1234, 65432],
                payload = [1234, 65432],
                feature = {
                    id: "featureId",
                    getGeometry: () =>{
                        return {
                            getType: () => {
                                return "MultiPolygon";
                            },
                            intersectsCoordinate: () => {
                                return coordinates;
                            },
                            getCoordinates: () => {
                                return coordinates;
                            }
                        };
                    }
                },
                layer = {
                    get: () => {
                        return "styleId";
                    }
                },
                rootGetters = {
                    "Modules/GetFeatureInfo/highlightVectorRules": null
                },
                highlightObject = {
                    type: "highlightMultiPolygon",
                    feature: feature,
                    styleId: "styleId",
                    highlightStyle: {
                        fill: {
                            color: "rgb(215, 102, 41, 0.9)"
                        },
                        stroke: {
                            color: "rgb(215, 101, 41, 0.9)",
                            width: 1
                        }
                    }
                };

            sinon.stub(styleList, "returnStyleObject").returns({
                rules: [{
                    style: {
                        polygonFillColor: [215, 102, 41, 0.9],
                        polygonStrokeColor: [215, 101, 41, 0.9],
                        polygonStrokeWidth: [1]
                    }
                }]
            });
            actions.setMarker({dispatch, rootGetters}, {coordinates, feature, layer});

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("Maps/highlightFeature");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(highlightObject);
            expect(dispatch.secondCall.args[0]).to.equals("Maps/placingPointMarker");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals(payload);
        });

        it("highlights multipolygon feature with style from GetFeatureInfo", () => {
            const coordinates = [1234, 65432],
                payload = [1234, 65432],
                feature = {
                    id: "featureId",
                    getGeometry: () =>{
                        return {
                            getType: () => {
                                return "MultiPolygon";
                            },
                            intersectsCoordinate: () => {
                                return coordinates;
                            }
                        };
                    }
                },
                layer = {
                    get: () => {
                        return "styleId";
                    }
                },
                rootGetters = {
                    "Modules/GetFeatureInfo/highlightVectorRules": {
                        style: {
                            polygonFillColor: [215, 102, 41, 0.9],
                            polygonStrokeColor: [215, 101, 41, 0.9],
                            polygonStrokeWidth: [1]
                        }}
                },
                highlightObject = {
                    type: "highlightMultiPolygon",
                    feature: feature,
                    styleId: "styleId",
                    highlightStyle: {
                        fill: {
                            color: "rgb(215, 102, 41, 0.9)"
                        },
                        stroke: {
                            color: "rgb(215, 101, 41, 0.9)",
                            width: 1
                        }
                    }
                };

            sinon.stub(styleList, "returnStyleObject").returns(null);
            actions.setMarker({dispatch, rootGetters}, {coordinates, feature, layer});

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("Maps/highlightFeature");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(highlightObject);
            expect(dispatch.secondCall.args[0]).to.equals("Maps/placingPointMarker");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals(payload);
        });
    });

    describe("zoomToResult", () => {
        it("zoomToResult with point coordinates ", () => {
            const coordinates = [1234, 65432],
                payload = {
                    center: coordinates,
                    zoom: getters.zoomLevel
                };

            actions.zoomToResult({dispatch, getters}, {coordinates});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("Maps/zoomToCoordinates");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(payload);
        });
        it("zoomToResult with extent coordinates ", () => {
            const coordinates = [5.866342, 47.270111, 15.041896, 55.058338],
                zoom = 5,
                payload = {
                    extent: coordinates,
                    options: {maxZoom: zoom}
                };


            actions.zoomToResult({dispatch, getters}, {coordinates, options: {maxZoom: zoom}});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("Maps/zoomToExtent");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(payload);
        });
    });
});
