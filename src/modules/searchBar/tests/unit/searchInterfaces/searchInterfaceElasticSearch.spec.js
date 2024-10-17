import axios from "axios";
import crs from "@masterportal/masterportalapi/src/crs";
import {expect} from "chai";
import sinon from "sinon";

import SearchInterface from "../../../searchInterfaces/searchInterface.js";
import SearchInterfaceElasticSearch from "../../../searchInterfaces/searchInterfaceElasticSearch.js";
import store from "../../../../../app-store";

describe("src/modules/searchBar/searchInterfaces/searchInterfaceElasticSearch.js", () => {
    let SearchInterface1 = null,
        checkConfigSpy;


    before(() => {
        store.getters = {
            restServiceById: () => {
                return {
                    url: sinon.stub()
                };
            }
        };
        checkConfigSpy = sinon.spy(SearchInterface.prototype, "checkConfig");
        SearchInterface1 = new SearchInterfaceElasticSearch({
            hitMap: {
                name: "_source.name",
                id: "_source.id",
                source: "_source",
                layerId: "_source.id",
                toolTip: [
                    "_source.name",
                    "_source.datasets.md_name"
                ],
                coordinate: "_source.geometry.coordinates"
            }
        });

        i18next.init({
            lng: "cimode",
            debug: false
        });
    });

    beforeEach(() => {
        sinon.stub(crs, "transformToMapProjection").returns([10, 20]);
    });

    afterEach(() => {
        SearchInterface1.clearSearchResults();
        sinon.restore();
    });

    describe("prototype", () => {
        it("SearchInterfaceElasticSearch should has the prototype SearchInterface", () => {
            expect(SearchInterface1).to.be.an.instanceof(SearchInterface);
            expect(checkConfigSpy.calledOnce).to.be.true;
            expect(checkConfigSpy.firstCall.args[1]).to.be.deep.equals(["addLayerToTopicTree", "setMarker", "showInTree", "showLayerInfo", "startRouting", "zoomToResult"]);
        });
    });

    describe("appendSearchStringToPayload", () => {
        it("should append string to searchStringAttribute", () => {
            const payload = {
                    id: "query",
                    params: {
                        query_string: ""
                    }
                },
                searchStringAttribute = "query_string";

            expect(SearchInterface1.appendSearchStringToPayload(payload, searchStringAttribute, "test")).to.deep.equal({
                id: "query",
                params: {
                    query_string: "test"
                }
            });
        });

        it("should do nothing if searchStringAttribute is not found in payload", () => {
            const payload = {
                    id: "query",
                    params: {
                        query_string: ""
                    }
                },
                searchStringAttribute = "query_string_";

            expect(SearchInterface1.appendSearchStringToPayload(payload, searchStringAttribute, "test")).to.deep.equal({
                id: "query",
                params: {
                    query_string: ""
                }
            });
        });
    });

    describe("addIgnoreIdsToPayload", () => {
        let payload;

        beforeEach(() => {
            payload = {
                id: "The_ID",
                params: {
                    query_string: "sturm"
                }
            };
        });

        it("add layerIDsToIgnore and metaIDsToIgnore to the payload, if configTree is defined and not empty", () => {
            const configTree = {
                layerIDsToIgnore: ["7777"],
                metaIDsToIgnore: ["ABC-123-DEF-456"]
            };

            expect(SearchInterface1.addIgnoreIdsToPayload(payload, configTree)).deep.equals({
                id: "The_ID",
                params: {
                    query_string: "sturm",
                    id: ["7777"],
                    "datasets.md_id": ["ABC-123-DEF-456"]
                }
            });
        });

        it("don't add layerIDsToIgnore and metaIDsToIgnore to the payload, if configTree is defined with empty arrays", () => {
            const configTree = {
                layerIDsToIgnore: [],
                metaIDsToIgnore: []
            };

            expect(SearchInterface1.addIgnoreIdsToPayload(payload, configTree)).deep.equals(payload);
        });

        it("don't add layerIDsToIgnore and metaIDsToIgnore to the payload if configTree is undefined", () => {
            const configTree = undefined;

            expect(SearchInterface1.addIgnoreIdsToPayload(payload, configTree)).deep.equals(payload);
        });
    });

    describe("initializeSearch", () => {
        it("should initialize the search", async () => {
            const ret = {
                    data: {
                        hits: ["hit", "hit"]
                    }
                },
                requestConfig = {
                    payload: {
                        id: "query",
                        params: {
                            query_string: "fer"
                        }
                    },
                    responseEntryPath: "hits.hits",
                    serviceId: "elastic",
                    requestType: "GET",
                    url: "https://geodienste.hamburg.de/"
                },
                axiosStub = sinon.stub(axios, "get").resolves(ret);

            await SearchInterface1.initializeSearch(requestConfig);

            expect(axiosStub.calledOnce).to.be.true;
        });
    });

    describe("sendRequest", () => {
        it("should return promise after sending a request", async () => {
            const requestConfig = {
                    payload: {
                        id: "query",
                        params: {
                            query_string: "fer"
                        }
                    },
                    responseEntryPath: "hits.hits",
                    serviceId: "elastic",
                    requestType: "GET"
                },
                result = {
                    status: "success",
                    message: "",
                    hits: []
                },
                returnRes = {
                    data: {
                        hits: ["hit", "hit"]
                    }
                },
                url = "https://geodienste.hamburg.de/",
                axiosStub = sinon.stub(axios, "get").resolves(returnRes);

            await SearchInterface1.sendRequest(url, requestConfig, result);

            expect(axiosStub.calledOnce).to.be.true;
            expect(axiosStub.firstCall.args[0]).to.equals("https://geodienste.hamburg.de/?source_content_type=application/json&source={\"id\":\"query\",\"params\":{\"query_string\":\"fer\"}}");
            expect(axiosStub.firstCall.args[1]).to.have.nested.include({"headers.Content-Type": "application/json;charset=UTF-8"});
        });

        it("should reject axios", () => {
            const axiosStub = sinon.stub(axios, "get").returns((_g, reject) => {
                    reject({
                        ok: false,
                        status: 404,
                        text: () => {
                            return null;
                        }
                    });
                }),
                requestConfig = {
                    payload: {
                        id: "query",
                        params: {
                            query_string: "fer"
                        }
                    },
                    responseEntryPath: "hits.hits",
                    serviceId: "elastic",
                    requestType: "GET"
                },
                result = {
                    status: "success",
                    message: "",
                    hits: []
                },
                url = "https://geodienste.hamburg.de";

            SearchInterface1.sendRequest(url, requestConfig, result);

            expect(axiosStub.calledOnce).to.be.true;
            expect(axiosStub.firstCall.args[0]).to.equals("https://geodienste.hamburg.de?source_content_type=application/json&source={\"id\":\"query\",\"params\":{\"query_string\":\"fer\"}}");
            expect(axiosStub.firstCall.args[1]).to.have.nested.include({
                "headers.Content-Type": "application/json;charset=UTF-8"
            });
        });
    });

    describe("normalizeResults", () => {
        let searchResults,
            result;

        beforeEach(() => {
            searchResults = [
                {
                    _id: 100,
                    _source: {
                        id: "123",
                        name: "Test abc",
                        datasets: [
                            {
                                md_name: "md name"
                            }
                        ]
                    }
                }];
            result = [
                {
                    events: {
                        onClick: {
                            addLayerToTopicTree: {
                                layerId: "123",
                                source: {
                                    id: "123",
                                    name: "Test abc",
                                    datasets: [
                                        {
                                            md_name: "md name"
                                        }
                                    ]
                                }
                            }
                        },
                        buttons: {
                            showInTree: {
                                layerId: "123",
                                source: {
                                    id: "123",
                                    name: "Test abc",
                                    datasets: [
                                        {
                                            md_name: "md name"
                                        }
                                    ]
                                }
                            },
                            showLayerInfo: {
                                layerId: "123",
                                source: {
                                    id: "123",
                                    name: "Test abc",
                                    datasets: [
                                        {
                                            md_name: "md name"
                                        }
                                    ]
                                }
                            }
                        }
                    },
                    category: "modules.searchBar.type.subject",
                    id: "123",
                    icon: "bi-list-ul",
                    name: "Test abc",
                    toolTip: "Test abc - md name"
                }
            ];
        });

        it("should normalize an search result", () => {
            expect(SearchInterface1.normalizeResults(searchResults)).to.deep.equals(result);
        });

        it("should normalize an search result with id of type number, besides in source", () => {
            searchResults[0]._source.id = 123;
            result[0].events.onClick.addLayerToTopicTree.source.id = 123;
            result[0].events.buttons.showInTree.source.id = 123;
            result[0].events.buttons.showLayerInfo.source.id = 123;
            expect(SearchInterface1.normalizeResults(searchResults)).to.deep.equals(result);
        });
    });

    describe("createPossibleActions", () => {
        let searchResult,
            result;

        beforeEach(() => {
            searchResult = {
                _id: "100",
                _source: {
                    id: "123",
                    abc: "abc",
                    name: "name",
                    geometry: {
                        coordinates: [10, 20]
                    }
                }
            };
            result = {
                addLayerToTopicTree: {
                    layerId: searchResult._source.id,
                    source: searchResult._source
                },
                setMarker: {
                    coordinates: [10, 20]
                },
                zoomToResult: {
                    coordinates: [10, 20]
                },
                startRouting: {
                    coordinates: [10, 20],
                    name: searchResult._source.name
                },
                showInTree: {
                    layerId: searchResult._source.id,
                    source: searchResult._source
                },
                showLayerInfo: {
                    layerId: searchResult._source.id,
                    source: searchResult._source
                }
            };
        });
        it("should create possible events from search result", () => {
            expect(SearchInterface1.createPossibleActions(searchResult)).to.deep.equals(result);
        });
        it("should create possible events from search result, id as number", () => {
            searchResult._source.id = 123;
            expect(SearchInterface1.createPossibleActions(searchResult)).to.deep.equals(result);
        });
    });

    describe("getResultByPath", () => {
        it("should return the value from path for String mappingAttribute", () => {
            const searchResult = {
                    _id: "100",
                    _source: {
                        id: "123",
                        abc: "abc",
                        geometry: {
                            coordinates: [10, 20]
                        }
                    }
                },
                mappingAttribute = "_source.geometry.coordinates";

            expect(SearchInterface1.getResultByPath(searchResult, mappingAttribute)).to.deep.equals([10, 20]);
        });

        it("should return the value from path for String[] mappingAttribute", () => {
            const searchResult = {
                    _id: "100",
                    _source: {
                        id: "123",
                        abc: "abc",
                        geometry: {
                            coordinates: [10, 20]
                        },
                        name: "name",
                        datasets: [
                            {
                                md_name: "md_name"
                            }
                        ]
                    }
                },
                mappingAttribute = [
                    "_source.name",
                    "_source.datasets.md_name"
                ];

            expect(SearchInterface1.getResultByPath(searchResult, mappingAttribute)).to.deep.equals("name - md_name");
        });
    });

    describe("getResultByPathArray", () => {
        it("should return the value from path", () => {
            const searchResult = {
                    _id: "100",
                    _source: {
                        id: "123",
                        abc: "abc",
                        geometry: {
                            coordinates: [10, 20]
                        },
                        name: "name",
                        datasets: [
                            {
                                md_name: "md_name"
                            }
                        ]
                    }
                },
                mappingAttributes = [
                    "_source.name",
                    "_source.datasets.md_name"
                ];

            expect(SearchInterface1.getResultByPath(searchResult, mappingAttributes)).to.deep.equals("name - md_name");
        });
    });
});
