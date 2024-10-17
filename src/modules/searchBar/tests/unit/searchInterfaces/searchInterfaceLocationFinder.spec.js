import crs from "@masterportal/masterportalapi/src/crs";
import {expect} from "chai";
import sinon from "sinon";

import SearchInterface from "../../../searchInterfaces/searchInterface.js";
import SearchInterfaceLocationFinder from "../../../searchInterfaces/searchInterfaceLocationFinder.js";

describe("src/modules/searchBar/searchInterfaces/searchInterfaceLocationFinder.js", () => {
    let error,
        SearchInterface1 = null,
        checkConfigSpy;

    before(() => {
        checkConfigSpy = sinon.spy(SearchInterface.prototype, "checkConfig");
        SearchInterface1 = new SearchInterfaceLocationFinder();

        i18next.init({
            lng: "cimode",
            debug: false
        });

        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            getView: () => {
                return {
                    getProjection: () => {
                        return {
                            getCode: () => "EPSG:25832"
                        };
                    }
                };
            }
        };

        mapCollection.addMap(map, "2D");
    });

    beforeEach(() => {
        error = sinon.spy();
        sinon.stub(console, "error").callsFake(error);

        sinon.stub(crs, "transformFromMapProjection").returns([1, 2]);
    });

    afterEach(() => {
        SearchInterface1.clearSearchResults();
        sinon.restore();
    });

    describe("prototype", () => {
        it("SearchInterfaceLocationFinder should has the prototype SearchInterface", () => {
            expect(SearchInterface1).to.be.an.instanceof(SearchInterface);
            expect(checkConfigSpy.calledOnce).to.be.true;
            expect(checkConfigSpy.firstCall.args[1]).to.be.deep.equals(["setMarker", "zoomToResult", "startRouting"]);
        });
    });

    describe("handleServerError", () => {
        it("should print console.error with info", () => {
            const resultData = {
                info: "The info"
            };

            SearchInterface1.handleServerError(resultData);
            expect(error.calledOnce).to.be.true;
            expect(error.firstCall.args[0]).to.equals("modules.searchBar.locationFinder.errorMsg: modules.searchBar.locationFinder.serverError: The info");
        });

        it("should print console.error without info", () => {
            const resultData = {};

            SearchInterface1.handleServerError(resultData);
            expect(error.calledOnce).to.be.true;
            expect(error.firstCall.args[0]).to.equals("modules.searchBar.locationFinder.errorMsg: modules.searchBar.locationFinder.serverError");
        });
    });

    describe("showError", () => {
        it("should print console.error with message", () => {
            const err = {
                msg: "The message",
                statusText: "The status text"
            };

            SearchInterface1.showError(err);
            expect(error.calledOnce).to.be.true;
            expect(error.firstCall.args[0]).to.equals("The message: The status text");
        });

        it("should print console.error without message", () => {
            const err = {
                statusText: "The status text"
            };

            SearchInterface1.showError(err);
            expect(error.calledOnce).to.be.true;
            expect(error.firstCall.args[0]).to.equals("modules.searchBar.locationFinder.errorMsg: The status text");
        });
    });

    describe("normalizeResults", () => {
        it("should normalize search results", () => {
            const searchResults = [
                    {
                        cx: 513211.35,
                        cy: 5403346.4,
                        id: 1,
                        name: "First result",
                        type: "abc"
                    }
                ],
                epsgCode = "EPSG:25832";

            expect(SearchInterface1.normalizeResults(searchResults, epsgCode)).to.deep.equals([
                {
                    events: {
                        onClick: {
                            setMarker: {
                                coordinates: [
                                    1,
                                    2
                                ]
                            },
                            zoomToResult: {
                                coordinates: [
                                    1,
                                    2
                                ]
                            }
                        },
                        onHover: {
                            setMarker: {
                                coordinates: [
                                    1,
                                    2
                                ]
                            }
                        },
                        buttons: {
                            startRouting: {
                                coordinates: [1, 2],
                                name: searchResults[0].name
                            }
                        }
                    },
                    category: "abc",
                    id: "locationFinder_1",
                    icon: "bi-signpost-2",
                    name: "First result"
                }
            ]);
        });

        it("should normalize search results with classes", () => {
            const searchResults = [
                    {
                        cx: 513211.35,
                        cy: 5403346.4,
                        id: 1,
                        name: "First result",
                        type: "abc"
                    }
                ],
                epsgCode = "EPSG:25832";

            SearchInterface1.classes = [
                {
                    name: "abc",
                    icon: "bi-record-circle"
                }
            ];

            expect(SearchInterface1.normalizeResults(searchResults, epsgCode)).to.deep.equals([
                {
                    events: {
                        onClick: {
                            setMarker: {
                                coordinates: [
                                    1,
                                    2
                                ]
                            },
                            zoomToResult: {
                                coordinates: [
                                    1,
                                    2
                                ]
                            }
                        },
                        onHover: {
                            setMarker: {
                                coordinates: [
                                    1,
                                    2
                                ]
                            }
                        },
                        buttons: {
                            startRouting: {
                                coordinates: [1, 2],
                                name: searchResults[0].name
                            }
                        }
                    },
                    category: "abc",
                    id: "locationFinder_1",
                    icon: "bi-record-circle",
                    name: "First result"
                }
            ]);
        });
    });

    describe("normalizeResult", () => {
        it("should normalize search result", () => {
            const searchResult = {
                    cx: 513211.35,
                    cy: 5403346.4,
                    id: 1,
                    name: "First result",
                    type: "abc"
                },
                extendedData = {
                    epsgCode: "EPSG:25832"
                };

            expect(SearchInterface1.normalizeResult(searchResult, extendedData)).to.deep.equals(
                {
                    events: {
                        onClick: {
                            setMarker: {
                                coordinates: [
                                    1,
                                    2
                                ]
                            },
                            zoomToResult: {
                                coordinates: [
                                    1,
                                    2
                                ]
                            }
                        },
                        onHover: {
                            setMarker: {
                                coordinates: [
                                    1,
                                    2
                                ]
                            }
                        },
                        buttons: {
                            startRouting: {
                                coordinates: [1, 2],
                                name: searchResult.name
                            }
                        }
                    },
                    category: "abc",
                    id: "locationFinder_1",
                    icon: "bi-signpost-2",
                    name: "First result"
                }
            );
        });

        it("should normalize search result with classDefinition", () => {
            const searchResult = {
                    cx: 513211.35,
                    cy: 5403346.4,
                    id: 1,
                    name: "First result",
                    type: "abc"
                },
                extendedData = {
                    classDefinition: {
                        name: "abc",
                        icon: "bi-record-circle"
                    },
                    epsgCode: "EPSG:25832"
                };

            expect(SearchInterface1.normalizeResult(searchResult, extendedData)).to.deep.equals(
                {
                    events: {
                        onClick: {
                            setMarker: {
                                coordinates: [
                                    1,
                                    2
                                ]
                            },
                            zoomToResult: {
                                coordinates: [
                                    1,
                                    2
                                ]
                            }
                        },
                        onHover: {
                            setMarker: {
                                coordinates: [
                                    1,
                                    2
                                ]
                            }
                        },
                        buttons: {
                            startRouting: {
                                coordinates: [1, 2],
                                name: searchResult.name
                            }
                        }
                    },
                    category: "abc",
                    id: "locationFinder_1",
                    icon: "bi-record-circle",
                    name: "First result"
                }
            );
        });
    });

    describe("createPossibleActions", () => {
        it("should create possible events from search result", () => {
            const searchResult = {
                    cx: 513211.35,
                    cy: 5403346.4,
                    id: 1,
                    name: "First result",
                    type: "abc"
                },
                extendedData = {
                    epsgCode: "EPSG:25832"
                };

            expect(SearchInterface1.createPossibleActions(searchResult, extendedData)).to.deep.equals(
                {
                    setMarker: {
                        coordinates: [1, 2]
                    },
                    zoomToResult: {

                        coordinates: [1, 2]
                    },
                    startRouting: {
                        coordinates: [1, 2],
                        name: searchResult.name
                    }
                }
            );
        });
    });

    describe("processCoordinatesForActions", () => {
        it("should create possible events from search result", () => {
            const searchResult = {
                    cx: 513211.35,
                    cy: 5403346.4,
                    id: 1,
                    name: "First result",
                    type: "abc"
                },
                extendedData = {
                    epsgCode: "EPSG:25832"
                };

            expect(SearchInterface1.processCoordinatesForActions(searchResult, extendedData)).to.deep.equals([1, 2]);
        });

        it("should create possible events from search result with classDefinition", () => {
            const searchResult = {
                    cx: 513211.35,
                    cy: 5403346.4,
                    id: 1,
                    name: "First result",
                    type: "abc",
                    xmax: 513511.35,
                    xmin: 512911.35,
                    ymax: 5403646.4,
                    ymin: 5403046.4
                },
                extendedData = {
                    classDefinition: {
                        name: "abc",
                        icon: "bi-record-circle",
                        zoom: "bbox"
                    },
                    epsgCode: "EPSG:25832"
                };

            expect(SearchInterface1.processCoordinatesForActions(searchResult, extendedData)).to.deep.equals([
                1, 2, 1, 2, 1, 2, 1, 2, 1, 2
            ]);
        });
    });
});
