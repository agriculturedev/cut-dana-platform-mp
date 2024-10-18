import axios from "axios";
import store from "../../../../../../../app-store";
import {expect} from "chai";
import sinon from "sinon";
import {RoutingGeosearchResult} from "../../../../utils/classes/routing-geosearch-result";
import {
    fetchRoutingKomootGeosearch,
    fetchRoutingKomootGeosearchReverse,
    getRoutingKomootGeosearchUrl,
    getRoutingKomootGeosearchReverseUrl
} from "../../../../utils/geosearch/routing-komoot-geosearch";

describe("src/modules/tools/routing/utils/geosearch/routing-komoot-geosearch.js", () => {
    let service;

    beforeEach(() => {
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

        mapCollection.clear();
        mapCollection.addMap(map, "2D");
        service = "https://service";
        sinon.stub(i18next, "t").callsFake((...args) => args);
        store.getters = {
            getRestServiceById: () => ({url: service}),
            "Maps/boundingBox": [10.0233599, 53.5686992, 10.0235412, 53.5685187]
        };
        store.state.Tools.Routing.geosearch = {
            serviceId: {
                url: "http://serviceId.url"
            },
            limit: 1000
        };
        store.state.Tools.Routing.geosearchReverse = {
            serviceId: {
                url: "http://serviceId.url"
            }
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("should fetchRoutingKomootGeosearch", () => {
        it("should process result correct", async () => {
            sinon.stub(axios, "get").returns(
                new Promise((resolve) => resolve({
                    status: 200,
                    data: {
                        success: true,
                        features: [
                            {
                                geometry: {
                                    coordinates: [
                                        10.02344338987701, 53.5686328
                                    ],
                                    type: "Point"
                                },
                                type: "Feature",
                                properties: {
                                    osm_id: 38148402,
                                    extent: [
                                        10.0233599, 53.5686992, 10.0235412,
                                        53.5685187
                                    ],
                                    country: "Deutschland",
                                    city: "Hamburg",
                                    countrycode: "DE",
                                    postcode: "22085",
                                    type: "house",
                                    osm_type: "W",
                                    osm_key: "building",
                                    housenumber: "50",
                                    street: "Uhlenhorster Weg",
                                    district: "Uhlenhorst",
                                    osm_value: "apartments"
                                }
                            },
                            {
                                geometry: {
                                    coordinates: [10.0127361, 53.5715093],
                                    type: "Point"
                                },
                                type: "Feature",
                                properties: {
                                    osm_type: "R",
                                    osm_id: 284861,
                                    extent: [
                                        10.0038075, 53.582101, 10.0378378,
                                        53.5652488
                                    ],
                                    country: "Deutschland",
                                    osm_key: "place",
                                    city: "Hamburg",
                                    countrycode: "DE",
                                    osm_value: "suburb",
                                    postcode: "22085",
                                    name: "Uhlenhorst",
                                    type: "district"
                                }
                            }
                        ],
                        type: "FeatureCollection"
                    }
                })
                )
            );

            const result = await fetchRoutingKomootGeosearch("testsearch"),
                expectedResult = [
                    new RoutingGeosearchResult(
                        [10.02344338987701, 53.5686328],
                        "Uhlenhorster Weg 50"
                    ),
                    new RoutingGeosearchResult(
                        [10.0127361, 53.5715093],
                        "Uhlenhorst"
                    )
                ];

            expect(result).deep.to.equal(expectedResult);
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
                await fetchRoutingKomootGeosearch("testsearch");
                // should not reach here
                expect(true).to.be.false;
            }
            catch (error) {
                expect(error.message).equal("testerror");
            }
        });
    });

    describe("should fetchRoutingKomootGeosearchReverse", () => {
        it("should process result correct", async () => {
            sinon.stub(axios, "get").returns(
                new Promise((resolve) => resolve({
                    status: 200,
                    data: {
                        success: true,
                        features: [
                            {
                                geometry: {
                                    coordinates: [
                                        10.02344338987701, 53.5686328
                                    ],
                                    type: "Point"
                                },
                                type: "Feature",
                                properties: {
                                    osm_id: 38148402,
                                    extent: [
                                        10.0233599, 53.5686992, 10.0235412,
                                        53.5685187
                                    ],
                                    country: "Deutschland",
                                    city: "Hamburg",
                                    countrycode: "DE",
                                    postcode: "22085",
                                    type: "house",
                                    osm_type: "W",
                                    osm_key: "building",
                                    housenumber: "50",
                                    street: "Uhlenhorster Weg",
                                    district: "Uhlenhorst",
                                    osm_value: "apartments"
                                }
                            }
                        ],
                        type: "FeatureCollection"
                    }
                })
                )
            );

            const result = await fetchRoutingKomootGeosearchReverse(
                    "testsearch"
                ),
                expectedResult = new RoutingGeosearchResult(
                    [10.02344338987701, 53.5686328],
                    "Uhlenhorster Weg 50"
                );

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
                await fetchRoutingKomootGeosearchReverse("testsearch");
                // should not reach here
                expect(true).to.be.false;
            }
            catch (error) {
                expect(error.message).equal("testerror");
            }
        });
    });

    describe("getRoutingKomootGeosearchUrl", () => {
        it("test params", () => {
            const mapBbox = [
                    4.511345914707728,
                    0.00048315628956933926,
                    4.51134591633199,
                    0.00048315466157288633
                ],
                search = "search",
                createdUrl = getRoutingKomootGeosearchUrl(mapBbox, search);

            expect(createdUrl.origin).to.eql(service);
            expect(createdUrl.searchParams.get("lang")).to.eql("de");
            expect(createdUrl.searchParams.get("lon")).to.eql("10");
            expect(createdUrl.searchParams.get("lat")).to.eql("53.6");
            expect(createdUrl.searchParams.get("bbox")).to.deep.eql(mapBbox.join(","));
            expect(createdUrl.searchParams.get("limit")).to.eql("1000");
            expect(createdUrl.searchParams.get("q")).to.eql(search);
        });

        it("createUrl should respect questionmark in serviceUrl", () => {
            const mapBbox = [
                    4.511345914707728,
                    0.00048315628956933926,
                    4.51134591633199,
                    0.00048315466157288633
                ],
                search = "search";
            let createdUrl = null;

            service = "https://mapservice.regensburg.de/cgi-bin/mapserv?map=wfs.map";
            createdUrl = getRoutingKomootGeosearchUrl(mapBbox, search);

            expect(createdUrl.origin).to.eql("https://mapservice.regensburg.de");
            expect(decodeURI(createdUrl)).to.eql(service + "&lang=de&lon=10&lat=53.6&bbox=4.511345914707728%2C0.00048315628956933926%2C4.51134591633199%2C0.00048315466157288633&limit=1000&q=search");
            expect(createdUrl.searchParams.get("lang")).to.eql("de");
            expect(createdUrl.searchParams.get("lon")).to.eql("10");
            expect(createdUrl.searchParams.get("lat")).to.eql("53.6");
            expect(createdUrl.searchParams.get("bbox")).to.deep.eql(mapBbox.join(","));
            expect(createdUrl.searchParams.get("limit")).to.eql("1000");
            expect(createdUrl.searchParams.get("q")).to.eql(search);
        });
    });

    describe("getRoutingKomootGeosearchReverseUrl", () => {
        it("test params", () => {
            const coordinates = [1, 2],
                createdUrl = getRoutingKomootGeosearchReverseUrl(coordinates);

            expect(createdUrl.origin).to.eql(service);
            expect(createdUrl.searchParams.get("lon")).to.eql(String(coordinates[0]));
            expect(createdUrl.searchParams.get("lat")).to.eql(String(coordinates[1]));
        });

        it("createUrl should respect questionmark in serviceUrl", () => {
            const coordinates = [1, 2];
            let createdUrl = null;

            service = "https://mapservice.regensburg.de/cgi-bin/mapserv?map=wfs.map";
            createdUrl = getRoutingKomootGeosearchReverseUrl(coordinates);

            expect(createdUrl.origin).to.eql("https://mapservice.regensburg.de");
            expect(decodeURI(createdUrl)).to.eql(service + "&lon=1&lat=2");
            expect(createdUrl.searchParams.get("lon")).to.eql(String(coordinates[0]));
            expect(createdUrl.searchParams.get("lat")).to.eql(String(coordinates[1]));
        });
    });
});
