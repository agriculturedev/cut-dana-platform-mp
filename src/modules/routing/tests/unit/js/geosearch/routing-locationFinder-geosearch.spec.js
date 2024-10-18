import axios from "axios";
import store from "../../../../../../../app-store";
import {expect} from "chai";
import sinon from "sinon";
import {RoutingGeosearchResult} from "../../../../utils/classes/routing-geosearch-result";
import {fetchRoutingLocationFinderGeosearch, getRoutingLocationFinderGeosearchUrl} from "../../../../utils/geosearch/routing-locationFinder-geosearch";

describe("src/modules/tools/routing/utils/geosearch/routing-locationFinder-geosearch.js", () => {
    let service;

    beforeEach(() => {
        service = "https://service";
        sinon.stub(i18next, "t").callsFake((...args) => args);
        store.getters = {
            getRestServiceById: () => ({url: service})
        };
        store.state.Tools.Routing.geosearch = {
            serviceId: {
                url: "http://serviceId.url"
            },
            limit: 1000
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("should fetchRoutingLocationFinderGeosearch", () => {
        it("should process result correct", async () => {
            sinon.stub(axios, "get").returns(
                new Promise((resolve) => resolve({
                    status: 200,
                    data: {
                        locs: [
                            {
                                id: 1609,
                                type: "Straßenname",
                                name: "Im Alten Park",
                                cx: 511114.73,
                                cy: 5397800.69,
                                xmin: 511097.28,
                                ymin: 5397769.7,
                                xmax: 511216.35,
                                ymax: 5397809.38
                            },
                            {
                                cx: 515643.21,
                                cy: 5404093.73,
                                epsg: 25832,
                                id: 2637,
                                name: "Parkstraße",
                                type: "Straßenname",
                                xmax: 515719.04,
                                xmin: 515435.23,
                                ymax: 5404246.82,
                                ymin: 5404023.02
                            }
                        ],
                        sref: 25832
                    }
                })
                )
            );

            const result = await fetchRoutingLocationFinderGeosearch(
                    "testsearch"
                ),
                expectedResult = [new RoutingGeosearchResult(
                    [511114.73, 5397800.69],
                    "Im Alten Park",
                    "25832"
                ),
                new RoutingGeosearchResult(
                    [515643.21, 5404093.73],
                    "Parkstraße",
                    "25832"
                )
                ];

            expect(result).deep.to.eql(expectedResult);
        });

        it("should throw error with status", async () => {
            sinon.stub(axios, "get").returns(
                new Promise((_, reject) => reject({
                    status: 999,
                    message: "testerror"
                })
                )
            );

            try {
                await fetchRoutingLocationFinderGeosearch("testsearch");
                // should not reach here
                expect(true).to.be.false;
            }
            catch (error) {
                expect(error.message).equal("testerror");
            }
        });
    });
    describe("getRoutingLocationFinderGeosearchUrl", () => {
        it("test params", () => {
            const search = "search",
                createdUrl = getRoutingLocationFinderGeosearchUrl(search);

            expect(createdUrl.origin).to.eql(service);
            expect(createdUrl.pathname).to.eql("/Lookup");
            expect(createdUrl.searchParams.get("limit")).to.eql("1000");
            expect(createdUrl.searchParams.get("properties")).to.eql("text");
            expect(createdUrl.searchParams.get("query")).to.eql(search);
        });

        it("test pathname", () => {
            service = "https://service/";
            const search = "search",
                createdUrl = getRoutingLocationFinderGeosearchUrl(search);

            expect(createdUrl.origin).to.eql("https://service");
            expect(createdUrl.pathname).to.eql("/Lookup");
            expect(createdUrl.searchParams.get("limit")).to.eql("1000");
            expect(createdUrl.searchParams.get("properties")).to.eql("text");
            expect(createdUrl.searchParams.get("query")).to.eql(search);
        });

        it("createUrl should respect questionmark in serviceUrl", () => {
            const search = "search";
            let createdUrl = null;

            service = "https://mapservice.regensburg.de/cgi-bin/mapserv?map=wfs.map";
            createdUrl = getRoutingLocationFinderGeosearchUrl(search);

            expect(createdUrl.origin).to.eql("https://mapservice.regensburg.de");
            expect(decodeURI(createdUrl)).to.eql(service + "%2FLookup&limit=1000&properties=text&query=search");
            expect(createdUrl.searchParams.get("limit")).to.eql("1000");
            expect(createdUrl.searchParams.get("properties")).to.eql("text");
            expect(createdUrl.searchParams.get("query")).to.eql(search);
        });
    });
});
