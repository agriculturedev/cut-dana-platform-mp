import crs from "@masterportal/masterportalapi/src/crs";
import {expect} from "chai";
import sinon from "sinon";

import SearchInterface from "../../../searchInterfaces/searchInterface.js";
import SearchInterfaceBkg from "../../../searchInterfaces/searchInterfaceBkg.js";
import store from "../../../../../app-store";
import {reset} from "../../../../../shared/js/utils/uniqueId";

describe("src/modules/searchBar/searchInterfaces/searchInterfaceBkg.js", () => {
    let SearchInterface1 = null,
        searchResults = [],
        checkConfigSpy;

    before(() => {
        checkConfigSpy = sinon.spy(SearchInterface.prototype, "checkConfig");
        SearchInterface1 = new SearchInterfaceBkg();

        store.getters = {
            restServiceById: () => {
                return {
                    url: "test.url"
                };
            }
        };

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
        reset();
        sinon.stub(crs, "transformToMapProjection").returns([1, 2]);

        searchResults = [
            {
                geometry: {
                    coordinates: [9.988176, 53.55481],
                    type: "Point"
                },
                properties: {
                    ags: "02100003",
                    bundesland: "Hamburg",
                    gemeinde: "Neustadt",
                    haus: "1",
                    kreis: "",
                    ort: "Hamburg",
                    ortsteil: "Neustadt",
                    plz: "20354",
                    qualitaet: "A",
                    regbezirk: "Bezirk Hamburg-Mitte",
                    rs: "021000000003",
                    schluessel: "0210000000030108A0060",
                    score: 2.4161212,
                    strasse: "ABC-Straße",
                    text: "ABC-Straße 1, 20354 Hamburg - Neustadt",
                    typ: "Haus"
                }
            }
        ];
    });

    afterEach(() => {
        SearchInterface1.clearSearchResults();
        sinon.restore();
    });

    describe("prototype", () => {
        it("SearchInterfaceBkg should has the prototype SearchInterface", () => {
            expect(SearchInterface1).to.be.an.instanceof(SearchInterface);
            expect(checkConfigSpy.calledOnce).to.be.true;
            expect(checkConfigSpy.firstCall.args[1]).to.be.deep.equals(["setMarker", "zoomToResult", "startRouting"]);
        });
    });

    describe("createSearchUrl", () => {
        it("should create the search url with GET parameters", () => {
            const searchInput = "abc";

            expect(SearchInterface1.createSearchUrl(searchInput)).to.equals("test.url?bbox=454591,5809000,700000,6075769&outputformat=json&srsName=undefined&count=20&query=abc");
        });
    });

    describe("normalizeResults", () => {
        it("should normalize search results", () => {
            expect(SearchInterface1.normalizeResults(searchResults)).to.deep.equals([
                {
                    category: "Haus",
                    events: {
                        onClick: {
                            setMarker: {
                                coordinates: [9.988176, 53.55481]
                            },
                            zoomToResult: {
                                coordinates: [9.988176, 53.55481]
                            }
                        },
                        onHover: {
                            setMarker: {
                                coordinates: [9.988176, 53.55481]
                            }
                        },
                        buttons: {
                            startRouting: {
                                coordinates: [9.988176, 53.55481],
                                name: searchResults[0].properties.text
                            }
                        }
                    },
                    id: "BkgGeoSearch1",
                    icon: "bi-signpost-2",
                    name: "ABC-Straße 1, 20354 Hamburg - Neustadt",
                    toolTip: "ABC-Straße 1, 20354 Hamburg - Neustadt"
                }
            ]);
        });

        it("should return an empty array, if the score is < 0.6", () => {
            searchResults[0].properties.score = 0.5;

            expect(SearchInterface1.normalizeResults(searchResults)).to.be.an("array").that.is.empty;
        });
    });

    describe("normalizeResult", () => {
        it("should normalize search result", () => {
            expect(SearchInterface1.normalizeResult(searchResults[0])).to.deep.equals({
                category: "Haus",
                events: {
                    onClick: {
                        setMarker: {
                            coordinates: [9.988176, 53.55481]
                        },
                        zoomToResult: {
                            coordinates: [9.988176, 53.55481]
                        }
                    },
                    onHover: {
                        setMarker: {
                            coordinates: [9.988176, 53.55481]
                        }
                    },
                    buttons: {
                        startRouting: {
                            coordinates: [9.988176, 53.55481],
                            name: searchResults[0].properties.text
                        }
                    }
                },
                id: "BkgGeoSearch1",
                icon: "bi-signpost-2",
                name: "ABC-Straße 1, 20354 Hamburg - Neustadt",
                toolTip: "ABC-Straße 1, 20354 Hamburg - Neustadt"
            });
        });
    });

    describe("createPossibleActions", () => {
        it("should create possible events from search result", () => {

            expect(SearchInterface1.createPossibleActions(searchResults[0])).to.deep.equals(
                {
                    setMarker: {
                        coordinates: [9.988176, 53.55481]
                    },
                    zoomToResult: {
                        coordinates: [9.988176, 53.55481]
                    },
                    startRouting: {
                        coordinates: [9.988176, 53.55481],
                        name: searchResults[0].properties.text
                    }
                }
            );
        });
    });
});
