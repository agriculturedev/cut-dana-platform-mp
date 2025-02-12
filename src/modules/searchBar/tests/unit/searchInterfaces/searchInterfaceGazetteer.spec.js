import {expect} from "chai";
import sinon from "sinon";
import SearchInterface from "../../../searchInterfaces/searchInterface.js";
import SearchInterfaceGazetteer from "../../../searchInterfaces/searchInterfaceGazetteer.js";
import store from "../../../../../app-store";

describe("src/modules/searchBar/searchInterfaces/searchInterfaceGazetteer.js", () => {
    let SearchInterface1 = null,
        checkConfigSpy;

    before(() => {
        store.getters = {
            restServiceById: () => sinon.stub()
        };
        checkConfigSpy = sinon.spy(SearchInterface.prototype, "checkConfig");
        SearchInterface1 = new SearchInterfaceGazetteer();

        i18next.init({
            lng: "cimode",
            debug: false
        });
    });

    afterEach(() => {
        SearchInterface1.clearSearchResults();
    });

    describe("prototype", () => {
        it("SearchInterfaceGazetteer should has the prototype SearchInterface", () => {
            expect(SearchInterface1).to.be.an.instanceof(SearchInterface);
            expect(checkConfigSpy.calledOnce).to.be.true;
            expect(checkConfigSpy.firstCall.args[1]).to.be.deep.equals(["setMarker", "zoomToResult", "startRouting"]);
        });
    });

    describe("normalizeResults", () => {
        it("should normalize an search result", () => {
            const searchResults = [
                {
                    name: "Result Name1",
                    type: "street",
                    geometry: {
                        coordinates: [10, 20]
                    }
                }];

            expect(SearchInterface1.normalizeResults(searchResults)).to.deep.equals([
                {
                    events: {
                        onClick: {
                            setMarker: {
                                coordinates: [10, 20]
                            },
                            zoomToResult: {
                                coordinates: [10, 20]
                            }
                        },
                        onHover: {
                            setMarker: {
                                coordinates: [10, 20]
                            }
                        },
                        buttons: {
                            startRouting: {
                                coordinates: [10, 20],
                                name: searchResults[0].name
                            }
                        }
                    },
                    category: "modules.searchBar.type.street",
                    id: "ResultName1modules.searchBar.type.street",
                    icon: "bi-signpost-split",
                    name: "Result Name1"
                }
            ]);
        });
        it("shouldn't add a second result with same id", () => {
            const searchResults = [
                {
                    name: "Result Name1",
                    type: "houseNumbersForStreet",
                    geometry: {
                        coordinates: [10, 20]
                    }
                },
                {
                    name: "Result Name1",
                    type: "addressUnaffixed",
                    geometry: {
                        coordinates: [10, 20]
                    }
                }];

            expect(SearchInterface1.normalizeResults(searchResults)).to.deep.equals([
                {
                    events: {
                        onClick: {
                            setMarker: {
                                coordinates: [10, 20]
                            },
                            zoomToResult: {
                                coordinates: [10, 20]
                            }
                        },
                        onHover: {
                            setMarker: {
                                coordinates: [10, 20]
                            }
                        },
                        buttons: {
                            startRouting: {
                                coordinates: [10, 20],
                                name: searchResults[0].name
                            }
                        }
                    },
                    category: "modules.searchBar.type.address",
                    id: "ResultName1modules.searchBar.type.address",
                    icon: "bi-signpost-split",
                    name: "Result Name1"
                }
            ]);
        });
    });

    describe("getTranslationByType", () => {
        it("returns the translation for type = addressAffixed", () => {
            expect(SearchInterface1.getTranslationByType("addressAffixed")).to.equal("modules.searchBar.type.address");
        });
        it("returns the translation for type = addressUnaffixed", () => {
            expect(SearchInterface1.getTranslationByType("addressUnaffixed")).to.equal("modules.searchBar.type.address");
        });
        it("returns the translation for type = district", () => {
            expect(SearchInterface1.getTranslationByType("district")).to.equal("modules.searchBar.type.district");
        });
        it("returns the translation for type = houseNumbersForStreet", () => {
            expect(SearchInterface1.getTranslationByType("houseNumbersForStreet")).to.equal("modules.searchBar.type.address");
        });
        it("returns the translation for type = parcel", () => {
            expect(SearchInterface1.getTranslationByType("parcel")).to.equal("modules.searchBar.type.parcel");
        });
        it("returns the translation for type = street", () => {
            expect(SearchInterface1.getTranslationByType("street")).to.equal("modules.searchBar.type.street");
        });
    });

    describe("normalizeResultEvents", () => {
        it("should normalize result events", () => {
            const resultEvents = {
                    onClick: ["setMarker", "zoomToResult"],
                    onHover: ["setMarker"],
                    buttons: ["startRouting"]
                },
                searchResult = {
                    name: "Result Name1",
                    type: "street",
                    geometry: {
                        coordinates: [10, 20]
                    }
                };

            expect(SearchInterface1.normalizeResultEvents(resultEvents, searchResult)).to.deep.equals(
                {
                    buttons: {
                        startRouting: {
                            coordinates: [10, 20],
                            name: searchResult.name
                        }
                    },
                    onClick: {
                        setMarker: {
                            coordinates: [10, 20]
                        },
                        zoomToResult: {
                            coordinates: [10, 20]
                        }
                    },
                    onHover: {
                        setMarker: {
                            coordinates: [10, 20]
                        }
                    }
                }
            );
        });
    });

    describe("createPossibleActions", () => {
        it("should create possible events from search result", () => {
            const searchResult = {
                name: "Result Name1",
                type: "street",
                geometry: {
                    coordinates: [10, 20]
                }
            };

            expect(SearchInterface1.createPossibleActions(searchResult)).to.deep.equals(
                {
                    setMarker: {
                        coordinates: [10, 20]
                    },
                    zoomToResult: {
                        coordinates: [10, 20]
                    },
                    startRouting: {
                        coordinates: [10, 20],
                        name: searchResult.name
                    }
                }
            );
        });
    });
});
