import crs from "@masterportal/masterportalapi/src/crs";
import {expect} from "chai";
import sinon from "sinon";

import {reset} from "../../../../../shared/js/utils/uniqueId";
import SearchInterface from "../../../searchInterfaces/searchInterface.js";
import SearchInterfaceOsmNominatim from "../../../searchInterfaces/searchInterfaceOsmNominatim.js";
import store from "../../../../../app-store";

describe("src/modules/searchBar/searchInterfaces/searchInterfaceOsmNominatim.js", () => {
    let SearchInterface1 = null,
        searchResults,
        checkConfigSpy;

    before(() => {
        checkConfigSpy = sinon.spy(SearchInterface.prototype, "checkConfig");
        SearchInterface1 = new SearchInterfaceOsmNominatim();

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

        searchResults = [{
            address: {
                city: "Bremerhaven",
                city_district: "Stadtbezirk Bremerhaven-Nord",
                country: "Deutschland",
                country_code: "de",
                house_number: "1a",
                postcode: "27580",
                quarter: "Eckernfeld",
                road: "Pferdebade",
                shop: "ABC",
                state: "Bremen",
                suburb: "Lehe"
            },
            boundingbox: ["53.5727591", "53.5731244", "8.597138", "8.5976434"],
            class: "shop",
            display_name: "ABC, 1a, Pferdebade, Eckernfeld, Lehe, Stadtbezirk Bremerhaven-Nord, Bremerhaven, Bremen, 27580, Deutschland",
            extratags: {
                opening_hours: "Mo-We 09:30-19:30; Th,Fr 09:30-20:00; Sa 09:30-19:00; PH off",
                website: "https://www.abc-schuhcenter.de/"
            },
            importance: 0.10000999999999996,
            lat: "53.57294175",
            licence: "Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright",
            lon: "8.597390699999998",
            osm_id: 121900842,
            osm_type: "way",
            place_id: 136257254,
            type: "shoes"
        }];
    });

    afterEach(() => {
        SearchInterface1.clearSearchResults();
        sinon.restore();
    });

    describe("prototype", () => {
        it("SearchInterfaceOsmNominatim should has the prototype SearchInterface", () => {
            expect(SearchInterface1).to.be.an.instanceof(SearchInterface);
            expect(checkConfigSpy.calledOnce).to.be.true;
            expect(checkConfigSpy.firstCall.args[1]).to.be.deep.equals(["setMarker", "zoomToResult", "startRouting"]);
        });
    });

    describe("createSearchUrl", () => {
        it("should create the search url with GET parameters", () => {
            const searchInput = "abc";

            expect(SearchInterface1.createSearchUrl(searchInput)).to.equals("test.url?countrycodes=de&format=json&polygon=0&addressdetails=1&extratags=1&limit=50&q=abc");
        });
    });

    describe("normalizeResults", () => {
        it("should normalize search results", () => {
            expect(SearchInterface1.normalizeResults(searchResults)).to.deep.equals([
                {
                    category: "OpenStreetMap",
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
                                name: searchResults[0].display_name
                            }
                        }
                    },
                    id: "OSMNominatim1",
                    icon: "bi-signpost-2",
                    name: "Bremerhaven, Pferdebade 1a",
                    toolTip: "Bremerhaven, Pferdebade 1a, 27580 Bremen (Lehe)"
                }
            ]);
        });

        it("should not normalize the search result, if the class is not configured", () => {
            searchResults[0].class = "someThing";

            expect(SearchInterface1.normalizeResults(searchResults)).to.be.an("array").that.is.empty;
        });

        it("should not normalize the search result, if the state is not configured", () => {
            SearchInterface1.states = "Berlin";

            expect(SearchInterface1.normalizeResults(searchResults)).to.be.an("array").that.is.empty;
        });
    });

    describe("normalizeResult", () => {
        it("should normalize search result", () => {
            expect(SearchInterface1.normalizeResult(searchResults[0])).to.deep.equals({
                category: "OpenStreetMap",
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
                            name: searchResults[0].display_name
                        }
                    }
                },
                id: "OSMNominatim1",
                icon: "bi-signpost-2",
                name: "Bremerhaven, Pferdebade 1a",
                toolTip: "Bremerhaven, Pferdebade 1a, 27580 Bremen (Lehe)"
            });
        });
    });

    describe("createDisplayName", () => {
        it("should create the display name for search result", () => {
            expect(SearchInterface1.createDisplayName(searchResults[0])).to.equals("Bremerhaven, Pferdebade 1a");
        });
    });

    describe("createToolTipName", () => {
        it("should create the tool tip name for search result", () => {
            const displayName = "Bremerhaven, Pferdebade 1a";

            expect(SearchInterface1.createToolTipName(searchResults[0], displayName)).to.equals("Bremerhaven, Pferdebade 1a, 27580 Bremen (Lehe)");
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
                        name: searchResults[0].display_name
                    }
                }
            );
        });
    });

    describe("processCoordinatesForActions", () => {
        it("should create possible events from search result", () => {
            expect(SearchInterface1.processCoordinatesForActions(searchResults[0])).to.deep.equals([1, 2]);
        });
    });
});
