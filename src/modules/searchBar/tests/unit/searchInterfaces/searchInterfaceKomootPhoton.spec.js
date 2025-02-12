import crs from "@masterportal/masterportalapi/src/crs";
import {expect} from "chai";
import sinon from "sinon";

import SearchInterface from "../../../searchInterfaces/searchInterface.js";
import SearchInterfaceKomootPhoton from "../../../searchInterfaces/searchInterfaceKomootPhoton.js";
import store from "../../../../../app-store";
import {reset} from "../../../../../shared/js/utils/uniqueId";

describe("src/modules/searchBar/searchInterfaces/searchInterfaceKomootPhoton.js", () => {
    let SearchInterface1 = null,
        searchResults = [],
        checkConfigSpy;

    before(() => {
        checkConfigSpy = sinon.spy(SearchInterface.prototype, "checkConfig");
        SearchInterface1 = new SearchInterfaceKomootPhoton();

        store.getters = {
            restServiceById: () => {
                return {
                    url: "test.url?"
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
                    city: "Hamburg",
                    country: "Deutschland",
                    countrycode: "DE",
                    district: "Neustadt",
                    extent: [9.9879768, 53.55481, 9.988176, 53.5547026],
                    name: "ABC-Straße",
                    osm_id: 715458501,
                    osm_key: "highway",
                    osm_type: "W",
                    osm_value: "unclassified",
                    postcode: "20354",
                    type: "street"
                }
            }
        ];
    });

    afterEach(() => {
        SearchInterface1.clearSearchResults();
        sinon.restore();
    });

    describe("prototype", () => {
        it("SearchInterfaceKomootPhoton should has the prototype SearchInterface", () => {
            expect(SearchInterface1).to.be.an.instanceof(SearchInterface);
            expect(checkConfigSpy.calledOnce).to.be.true;
            expect(checkConfigSpy.firstCall.args[1]).to.be.deep.equals(["setMarker", "zoomToResult", "startRouting"]);
        });
    });

    describe("createSearchUrl", () => {
        it("should create the search url with GET parameters", () => {
            const searchInput = "abc";

            expect(SearchInterface1.createSearchUrl(searchInput)).to.equals("test.url?lang=de&q=abc");
        });

        it("should create the search url with extended GET parameters", () => {
            const searchInput = "abc";

            SearchInterface1.bbox = "9.6,53.3,10.4,53.8";
            SearchInterface1.lat = 53.6;
            SearchInterface1.limit = 10;
            SearchInterface1.lon = 10.0;

            expect(SearchInterface1.createSearchUrl(searchInput)).to.equals("test.url?lang=de&q=abc&bbox=9.6,53.3,10.4,53.8&lat=53.6&limit=10&lon=10");
        });
    });

    describe("normalizeResults", () => {
        it("should normalize search results", () => {
            expect(SearchInterface1.normalizeResults(searchResults)).to.deep.equals([
                {
                    category: "Komoot",
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
                                name: searchResults[0].properties.name
                            }
                        }
                    },
                    id: "KomootPhoton1",
                    icon: "bi-signpost-2",
                    name: "ABC-Straße, 20354 Hamburg - Neustadt",
                    toolTip: "ABC-Straße, 20354 Hamburg - Neustadt Deutschland"
                }
            ]);
        });
    });

    describe("normalizeResult", () => {
        it("should normalize search result", () => {
            expect(SearchInterface1.normalizeResult(searchResults[0])).to.deep.equals({
                category: "Komoot",
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
                            name: searchResults[0].properties.name
                        }
                    }
                },
                id: "KomootPhoton1",
                icon: "bi-signpost-2",
                name: "ABC-Straße, 20354 Hamburg - Neustadt",
                toolTip: "ABC-Straße, 20354 Hamburg - Neustadt Deutschland"
            });
        });
    });

    describe("createDisplayName", () => {
        it("should create the display name for search result", () => {
            expect(SearchInterface1.createDisplayName(searchResults[0])).to.equals("ABC-Straße, 20354 Hamburg - Neustadt");
        });

        it("should create the display name for search result with county, if city is undefined", () => {
            searchResults[0].properties.city = undefined;
            searchResults[0].properties.county = "Berlin";

            expect(SearchInterface1.createDisplayName(searchResults[0])).to.equals("ABC-Straße, 20354 Berlin - Neustadt");
        });

        it("should create the display name for search result with city, if county is not undefined", () => {
            searchResults[0].properties.county = "Berlin";

            expect(SearchInterface1.createDisplayName(searchResults[0])).to.equals("ABC-Straße, 20354 Hamburg - Neustadt");
        });

        it("should create the display name for search result with city, if name is undefined", () => {
            const searchResult = {
                geometry: {
                    coordinates: [9.9862834, 53.55527],
                    type: "Point"
                },
                properties: {
                    city: "Hamburg",
                    country: "Deutschland",
                    countrycode: "DE",
                    district: "Neustadt",
                    housenumber: "10",
                    osm_id: 3169287750,
                    osm_key: "place",
                    osm_type: "N",
                    osm_value: "house",
                    postcode: "20354",
                    street: "Neue ABC-Straße",
                    type: "house"
                }
            };

            expect(SearchInterface1.createDisplayName(searchResult)).to.equals("Neue ABC-Straße 10, 20354 Hamburg - Neustadt");
        });
    });

    describe("createToolTipName", () => {
        it("should create the tool tip name for search result", () => {
            const displaName = "ABC-Straße, 20354 Hamburg - Neustadt";

            expect(SearchInterface1.createToolTipName(searchResults[0], displaName)).to.equals("ABC-Straße, 20354 Hamburg - Neustadt Deutschland");
        });
    });

    describe("createPossibleActions", () => {
        it("should create possible events from search result", () => {

            expect(SearchInterface1.createPossibleActions(searchResults[0])).to.deep.equals(
                {
                    setMarker: {
                        coordinates: [1, 2]
                    },
                    zoomToResult: {
                        coordinates: [1, 2]
                    },
                    startRouting: {
                        coordinates: [1, 2],
                        name: searchResults[0].properties.name
                    }
                }
            );
        });
    });
});
