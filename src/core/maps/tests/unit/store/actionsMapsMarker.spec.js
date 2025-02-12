import {expect} from "chai";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import sinon from "sinon";

import actions from "../../../store/actionsMapsMarker";
import mapMarker from "../../../js/mapMarker";

const {
    changeMarkerStyle,
    placingPointMarker,
    placingPolygonMarker,
    removePointMarker,
    removePolygonMarker,
    rotatePointMarker,
    rotatePointMarkerIn3D
} = actions;

describe("src/core/maps/store/actionsMapsMarker.js", () => {
    let dispatch,
        commit,
        rootGetters,
        state;

    beforeEach(() => {
        dispatch = sinon.spy();
        commit = sinon.spy();

        state = {
            mode: "2D"
        };
        rootGetters = {
            "Menu/currentComponent": () =>{
                return {
                    type: "searchbar"
                };
            },
            "Modules/SearchBar/searchInput": ""
        };

        sinon.stub(mapMarker, "addFeatureToMapMarkerLayer");
        sinon.stub(mapMarker, "getMapmarkerLayerById");
        sinon.stub(mapMarker, "removeMapMarker");
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("changeMarkerStyle", () => {
        it("change the styleId of the marker", () => {
            const markerId = "marker",
                styleId = "style";

            changeMarkerStyle({dispatch}, {markerId, styleId});

            expect(dispatch.notCalled).to.be.true;

            expect(mapMarker.getMapmarkerLayerById.calledOnce).to.be.true;
            expect(mapMarker.getMapmarkerLayerById.firstCall.args[0]).to.equals(markerId);
        });
    });

    describe("placingPointMarker", () => {
        it("place a point marker, if position is an array", () => {
            const position = [10, 10];

            placingPointMarker({commit, dispatch, rootGetters}, position);

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("removePointMarker");
            expect(commit.notCalled).to.be.true;

            expect(mapMarker.addFeatureToMapMarkerLayer.calledOnce).to.be.true;
            expect(mapMarker.addFeatureToMapMarkerLayer.firstCall.args[0]).to.equals("marker_point_layer");
            expect(mapMarker.addFeatureToMapMarkerLayer.firstCall.args[1] instanceof Feature).to.be.true;
        });

        it("place a point marker, if position is an object", () => {
            const position = {
                coordinates: [10, 10]
            };

            placingPointMarker({commit, dispatch, rootGetters}, position);

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("removePointMarker");

            expect(mapMarker.addFeatureToMapMarkerLayer.calledOnce).to.be.true;
            expect(mapMarker.addFeatureToMapMarkerLayer.firstCall.args[0]).to.equals("marker_point_layer");
            expect(mapMarker.addFeatureToMapMarkerLayer.firstCall.args[1] instanceof Feature).to.be.true;
        });

        it("place and rotate a point marker, if position is an object", () => {
            const position = {
                coordinates: [10, 10],
                rotation: 199.123
            };

            placingPointMarker({commit, dispatch, rootGetters}, position);

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("removePointMarker");
            expect(dispatch.secondCall.args[0]).to.equals("rotatePointMarker");
            expect(dispatch.secondCall.args[1]).to.deep.include({position});

            expect(mapMarker.addFeatureToMapMarkerLayer.calledOnce).to.be.true;
            expect(mapMarker.addFeatureToMapMarkerLayer.firstCall.args[0]).to.equals("marker_point_layer");
            expect(mapMarker.addFeatureToMapMarkerLayer.firstCall.args[1] instanceof Feature).to.be.true;
        });

        it("place a point marker and clear search input", () => {
            const position = [10, 10];

            rootGetters = {
                "Menu/currentComponent": () =>{
                    return {
                        type: "NOTsearchbar"
                    };
                },
                "Modules/SearchBar/searchInput": "strasse"
            };

            placingPointMarker({commit, dispatch, rootGetters}, position);

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("removePointMarker");
            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.equals("Modules/SearchBar/setSearchInput");
            expect(commit.firstCall.args[1]).to.equals("");
            expect(commit.secondCall.args[0]).to.equals("Modules/SearchBar/setCurrentSearchInputValue");
            expect(commit.secondCall.args[1]).to.equals("");

            expect(mapMarker.addFeatureToMapMarkerLayer.calledOnce).to.be.true;
            expect(mapMarker.addFeatureToMapMarkerLayer.firstCall.args[0]).to.equals("marker_point_layer");
            expect(mapMarker.addFeatureToMapMarkerLayer.firstCall.args[1] instanceof Feature).to.be.true;
        });
    });

    describe("placingPolygonMarker", () => {
        it("place a polygon marker", () => {
            const feature = new Feature({
                geometry: new Polygon([[[565086.1948534324, 5934664.461947621], [565657.6945448224, 5934738.54524095], [565625.9445619675, 5934357.545446689], [565234.3614400891, 5934346.962119071], [565086.1948534324, 5934664.461947621]]])
            });

            placingPolygonMarker({dispatch}, feature);

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("removePolygonMarker");

            expect(mapMarker.addFeatureToMapMarkerLayer.calledOnce).to.be.true;
            expect(mapMarker.addFeatureToMapMarkerLayer.firstCall.args[0]).to.equals("marker_polygon_layer");
            expect(mapMarker.addFeatureToMapMarkerLayer.firstCall.args[1] instanceof Feature).to.be.true;
            expect(mapMarker.addFeatureToMapMarkerLayer.firstCall.args[1]).to.deep.equals(feature);
        });

        it("place a polygon marker with geometry", () => {
            const geometry = new Polygon([[[565086.1948534324, 5934664.461947621], [565657.6945448224, 5934738.54524095], [565625.9445619675, 5934357.545446689], [565234.3614400891, 5934346.962119071], [565086.1948534324, 5934664.461947621]]]);

            placingPolygonMarker({dispatch}, geometry);

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("removePolygonMarker");

            expect(mapMarker.addFeatureToMapMarkerLayer.calledOnce).to.be.true;
            expect(mapMarker.addFeatureToMapMarkerLayer.firstCall.args[0]).to.equals("marker_polygon_layer");
            expect(mapMarker.addFeatureToMapMarkerLayer.firstCall.args[1] instanceof Feature).to.be.true;
        });
    });

    describe("removePointMarker", () => {
        it("remove a point marker", () => {
            removePointMarker();

            expect(mapMarker.removeMapMarker.calledOnce).to.be.true;
            expect(mapMarker.removeMapMarker.firstCall.args[0]).to.equals("marker_point_layer");
        });
    });

    describe("removePolygonMarker", () => {
        it("remove a polygon marker", () => {
            removePolygonMarker();

            expect(mapMarker.removeMapMarker.calledOnce).to.be.true;
            expect(mapMarker.removeMapMarker.firstCall.args[0]).to.equals("marker_polygon_layer");
        });
    });
    describe("rotatePointMarker", () => {
        beforeEach(() => {
            state = {
                mode: "3D"
            };
        });

        it("should rotate pointmarker and start also rotation in 3D", () => {
            const feature = {
                    rotation: 0,
                    getStyle: () => {
                        return {
                            getImage: () => {
                                return {
                                    setRotation: (rotation) => {
                                        feature.rotation = rotation;
                                    }
                                };
                            }
                        };
                    }
                },
                position = {
                    coordinates: [10, 10],
                    rotation: 199.123
                };

            rotatePointMarker({dispatch, state}, {feature, position});

            expect(feature.rotation).to.equals(3.4753519664486685);
            expect(dispatch.calledOnce).to.be.true;
        });
    });
    describe("rotatePointMarkerIn3D", () => {
        const map3D = {
                id: "1",
                mode: "3D",
                getCesiumScene: () => {
                    return {
                        drillPick: () => {
                            return [{
                                primitive: primitive
                            }];
                        }
                    };
                },
                getOlMap: () => {
                    return {
                        getSize: () => {
                            return [
                                100,
                                200
                            ];
                        }
                    };
                }
            },
            primitive = {
                olFeature: {
                    getStyle: () => {
                        return {
                            getImage: () => {
                                return {
                                    getAnchor: () => {
                                        return [
                                            100,
                                            100
                                        ];
                                    }
                                };
                            }
                        };
                    }
                },
                olLayer: {
                    get: () => {
                        return "marker_point_layer";
                    }
                },
                width: 100,
                height: 100,
                scale: 0.5,
                pixelOffset: "",
                rotation: ""
            };

        it("rotatePointMarkerIn3D with angle 0", () => {
            const position = {
                    rotation: 0
                },
                rotation = 0,
                pixelOffset = {
                    x: 25,
                    y: -25
                };

            rootGetters = {
                "Maps/clickPixel": [0, 0]
            };

            mapCollection.addMap(map3D, "3D");
            rotatePointMarkerIn3D({rootGetters}, position);
            expect(mapCollection.getMap("3D").getCesiumScene().drillPick()[0].primitive.rotation).to.equal(rotation);
            expect(mapCollection.getMap("3D").getCesiumScene().drillPick()[0].primitive.pixelOffset).to.deep.equal(pixelOffset);
        });
        it("rotatePointMarkerIn3D with angle 90", () => {
            const position = {
                    rotation: 90
                },
                rotation = -1.5707963267948966,
                pixelOffset = {
                    x: 25,
                    y: 25
                };

            rootGetters = {
                "Maps/clickPixel": [0, 0]
            };

            mapCollection.addMap(map3D, "3D");
            rotatePointMarkerIn3D({rootGetters}, position);
            expect(mapCollection.getMap("3D").getCesiumScene().drillPick()[0].primitive.rotation).to.equal(rotation);
            expect(mapCollection.getMap("3D").getCesiumScene().drillPick()[0].primitive.pixelOffset).to.deep.equal(pixelOffset);
        });
        it("rotatePointMarkerIn3D with angle 180", () => {
            const position = {
                    rotation: 180
                },
                rotation = -3.141592653589793,
                pixelOffset = {
                    x: 25,
                    y: 25
                };

            rootGetters = {
                "Maps/clickPixel": [0, 0]
            };

            mapCollection.addMap(map3D, "3D");
            rotatePointMarkerIn3D({rootGetters}, position);
            expect(mapCollection.getMap("3D").getCesiumScene().drillPick()[0].primitive.rotation).to.equal(rotation);
            expect(mapCollection.getMap("3D").getCesiumScene().drillPick()[0].primitive.pixelOffset).to.deep.equal(pixelOffset);
        });
        it("rotatePointMarkerIn3D with angle 270", () => {
            const position = {
                    rotation: 270
                },
                rotation = -4.71238898038469,
                pixelOffset = {
                    x: -25,
                    y: 25
                };

            rootGetters = {
                "Maps/clickPixel": [0, 0]
            };

            mapCollection.addMap(map3D, "3D");
            rotatePointMarkerIn3D({rootGetters}, position);
            expect(mapCollection.getMap("3D").getCesiumScene().drillPick()[0].primitive.rotation).to.equal(rotation);
            expect(mapCollection.getMap("3D").getCesiumScene().drillPick()[0].primitive.pixelOffset).to.deep.equal(pixelOffset);
        });
    });
});
