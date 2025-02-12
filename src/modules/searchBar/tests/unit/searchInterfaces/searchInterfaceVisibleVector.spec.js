import Cluster from "ol/source/Cluster";
import {expect} from "chai";
import Feature from "ol/Feature.js";
import {Icon} from "ol/style.js";
import Point from "ol/geom/Point.js";
import MultiPolygon from "ol/geom/MultiPolygon.js";
import sinon from "sinon";
import VectorSource from "ol/source/Vector";

import layerCollection from "../../../../../core/layers/js/layerCollection";
import SearchInterface from "../../../searchInterfaces/searchInterface.js";
import SearchInterfaceVisibleVector from "../../../searchInterfaces/searchInterfaceVisibleVector.js";

describe("src/modules/searchBar/searchInterfaces/searchInterfaceVisibleVector.js", () => {
    let clusterLayer1,
        feature1,
        feature2,
        featureMultiPolygon,
        layer1,
        SearchInterface1 = null,
        coordinates,
        checkConfigSpy;

    before(() => {
        checkConfigSpy = sinon.spy(SearchInterface.prototype, "checkConfig");
        SearchInterface1 = new SearchInterfaceVisibleVector();
    });

    beforeEach(() => {
        coordinates = [[
            [10, 10, 0],
            [10, 20, 0],
            [20, 10, 0],
            [10, 10, 0]
        ]];
        feature1 = new Feature({
            geometry: new Point([10, 10]),
            name: "Hospital",
            searchField: "name",
            street: "Example-Street 1"
        });
        feature2 = new Feature({
            geometry: new Point([20, 20]),
            name: "School",
            searchField: "name"
        });
        featureMultiPolygon = new Feature({
            geometry: new MultiPolygon(coordinates),
            name: "MultiPolygon",
            searchField: "name"
        });
        featureMultiPolygon.getGeometry().getExtent = sinon.stub().returns([
            0,
            0,
            500,
            500
        ]);
        feature1.setId("1");
        feature2.setId("2");
        featureMultiPolygon.setId("MultiPolygon");

        layer1 = {
            attributes: {
                id: "123",
                additionalInfoField: "street",
                name: "The layer",
                searchField: "name",
                style: () => {
                    return {
                        getImage: () => sinon.stub()
                    };
                }
            },
            getLayerSource: () => {
                return {
                    getFeatures: () => {
                        return [feature1, feature2];
                    }
                };
            }
        };
    });

    afterEach(() => {
        SearchInterface1.clearSearchResults();
        sinon.restore();
    });

    describe("prototype", () => {
        it("SearchInterfaceVisibleVector should has the prototype SearchInterface", () => {
            expect(SearchInterface1).to.be.an.instanceof(SearchInterface);
            expect(checkConfigSpy.calledOnce).to.be.true;
            expect(checkConfigSpy.firstCall.args[1]).to.be.deep.equals(["openGetFeatureInfo", "setMarker", "zoomToResult", "startRouting"]);
        });
    });

    describe("findMatchingFeatures", () => {
        describe("vectorLayer", () => {
            beforeEach(() => {
                sinon.stub(layerCollection, "getLayerById").returns(layer1);
            });

            it("should return one matched feature", () => {
                const visibleVectorLayerConfigs = [{
                        id: "123",
                        name: "The layer",
                        searchField: "name"
                    }],
                    searchInput = "hos",
                    matchingFeatures = SearchInterface1.findMatchingFeatures(visibleVectorLayerConfigs, searchInput);

                expect(matchingFeatures.length).to.equals(1);
                expect(matchingFeatures).to.deep.equals([
                    {
                        events: {
                            onClick: {
                                openGetFeatureInfo: {
                                    feature: feature1,
                                    layer: layer1
                                },
                                setMarker: {
                                    coordinates: [
                                        10,
                                        10
                                    ],
                                    feature: feature1,
                                    layer: layer1
                                },
                                zoomToResult: {
                                    coordinates: [
                                        10,
                                        10
                                    ]
                                }
                            },
                            onHover: {
                                setMarker: {
                                    coordinates: [
                                        10,
                                        10
                                    ],
                                    feature: feature1,
                                    layer: layer1
                                }
                            }
                        },
                        category: "The layer",
                        displayedInfo: "Example-Street 1",
                        imagePath: "",
                        id: feature1.ol_uid,
                        name: "Hospital",
                        toolTip: "Hospital"
                    }
                ]);
            });
        });

        describe("clusterLayer", () => {
            beforeEach(() => {
                clusterLayer1 = {
                    attributes: {
                        id: "789",
                        additionalInfoField: "street",
                        name: "The layer",
                        searchField: "name",
                        style: () => {
                            return {
                                getImage: () => sinon.stub()
                            };
                        }
                    },
                    getLayerSource: () => new Cluster({
                        distance: 100,
                        source: new VectorSource({
                            features: [feature1, feature2]
                        })
                    })
                };

                sinon.stub(layerCollection, "getLayerById").returns(clusterLayer1);
            });

            it("should return one matched feature from cluster layer", () => {
                const visibleVectorLayerConfigs = [{
                        id: "789",
                        name: "The layer",
                        searchField: "name"
                    }],
                    searchInput = "scho";

                expect(SearchInterface1.findMatchingFeatures(visibleVectorLayerConfigs, searchInput)).to.deep.equals([
                    {
                        events: {
                            onClick: {
                                openGetFeatureInfo: {
                                    feature: feature2,
                                    layer: clusterLayer1
                                },
                                setMarker: {
                                    coordinates: [
                                        20,
                                        20
                                    ],
                                    feature: feature2,
                                    layer: clusterLayer1
                                },
                                zoomToResult: {
                                    coordinates: [
                                        20,
                                        20
                                    ]
                                }
                            },
                            onHover: {
                                setMarker: {
                                    coordinates: [
                                        20,
                                        20
                                    ],
                                    feature: feature2,
                                    layer: clusterLayer1
                                }
                            }
                        },
                        category: "The layer",
                        displayedInfo: "",
                        imagePath: "",
                        id: feature2.ol_uid,
                        name: "School",
                        toolTip: "School"
                    }
                ]);
            });
        });
    });

    describe("normalizeLayerResult", () => {
        beforeEach(() => {
            sinon.stub(layerCollection, "getLayerById").returns(layer1);
        });

        it("should normalize result", () => {
            const searchField = "name";

            expect(SearchInterface1.normalizeResult(feature1, layer1, searchField)).to.deep.equals(
                {
                    events: {
                        onClick: {
                            openGetFeatureInfo: {
                                feature: feature1,
                                layer: layer1
                            },
                            setMarker: {
                                coordinates: [
                                    10,
                                    10
                                ],
                                feature: feature1,
                                layer: layer1
                            },
                            zoomToResult: {
                                coordinates: [
                                    10,
                                    10
                                ]
                            }
                        },
                        onHover: {
                            setMarker: {
                                coordinates: [
                                    10,
                                    10
                                ],
                                feature: feature1,
                                layer: layer1
                            }
                        }
                    },
                    category: "The layer",
                    displayedInfo: "Example-Street 1",
                    imagePath: "",
                    id: feature1.ol_uid,
                    name: "Hospital",
                    toolTip: "Hospital"
                }
            );
        });
    });

    describe("getAdditionalInfo", () => {
        it("should return the additional info field of the feature", () => {
            expect(SearchInterface1.getAdditionalInfo(feature1, layer1)).to.equals("Example-Street 1");
        });

        it("should return an empty string, if the feature has no additional field", () => {
            expect(SearchInterface1.getAdditionalInfo(feature2, layer1)).to.equals("");
        });
    });

    describe("getImageSource", () => {
        it("should return an empty string, if the feature has no image", () => {
            expect(SearchInterface1.getImageSource(feature2, layer1)).to.equals("");
        });
    });

    describe("getImageSourceFromStyle", () => {
        it("should return the image source", () => {
            const layerStyle = {
                getImage: () => new Icon({
                    src: "test.url"
                })
            };

            expect(SearchInterface1.getImageSourceFromStyle(layerStyle)).to.equals("test.url");
        });

        it("should return an empty string, if layer style has no image", () => {
            const layerStyle = {
                getImage: () => sinon.stub()
            };

            expect(SearchInterface1.getImageSourceFromStyle(layerStyle)).to.equals("");
        });
    });

    describe("createPossibleActions", () => {
        it("should create possible events from search result", () => {
            expect(SearchInterface1.createPossibleActions(feature1, layer1)).to.deep.equals(
                {
                    openGetFeatureInfo: {
                        feature: feature1,
                        layer: layer1
                    },
                    setMarker: {
                        coordinates: [
                            10,
                            10
                        ],
                        feature: feature1,
                        layer: layer1
                    },
                    zoomToResult: {
                        coordinates: [
                            10,
                            10
                        ]
                    },
                    startRouting: {
                        coordinates: [
                            10,
                            10
                        ],
                        name: "10,10"
                    }
                }
            );
        });
    });


    describe("getCoordinates", () => {
        it("should return a random coordinate from MultiPolygon feature - center coordinates do not intersect features geometry", () => {
            const getRandomCoordinateSpy = sinon.spy(SearchInterfaceVisibleVector.prototype, "getRandomCoordinate");
            let result = null;

            featureMultiPolygon.getGeometry().intersectsCoordinate = sinon.stub().returns(false);
            featureMultiPolygon.getGeometry().getCoordinates = sinon.stub().returns(coordinates);
            result = SearchInterface1.getCoordinates(featureMultiPolygon);

            expect(result).to.be.an("Array");
            expect(result.length).to.be.equals(3);
            expect(coordinates[0]).includes(result);
            expect(getRandomCoordinateSpy.callCount > 0).to.be.true;
        });
        it("should return a center coordinate from MultiPolygon feature - center coordinates do intersect features geometry", () => {
            const getRandomCoordinateSpy = sinon.spy(SearchInterfaceVisibleVector.prototype, "getRandomCoordinate");
            let result = null;

            featureMultiPolygon.getGeometry().intersectsCoordinate = sinon.stub().returns(true);
            featureMultiPolygon.getGeometry().getCoordinates = sinon.stub().returns(coordinates);
            result = SearchInterface1.getCoordinates(featureMultiPolygon);

            expect(result).to.be.an("Array");
            expect(result.length).to.be.equals(2);
            expect(result).to.be.deep.equals([250, 250]);
            expect(getRandomCoordinateSpy.notCalled).to.be.true;
        });
    });
});
