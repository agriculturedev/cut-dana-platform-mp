import axios from "axios";
import {expect} from "chai";
import sinon from "sinon";
import SearchInterface from "../../../searchInterfaces/searchInterface.js";
import SearchInterfaceElasticSearch from "../../../searchInterfaces/searchInterfaceElasticSearch.js";
import store from "../../../../../app-store";

describe("src_3_0_0/modules/searchBar/searchInterfaces/searchInterfaceElasticSearch.js", () => {
    let SearchInterface1 = null;

    before(() => {
        store.getters = {
            restServiceById: () => {
                return {
                    url: sinon.stub()
                };
            }
        };

        SearchInterface1 = new SearchInterfaceElasticSearch();

        i18next.init({
            lng: "cimode",
            debug: false
        });
    });

    afterEach(() => {
        SearchInterface1.clearSearchResults();
        sinon.restore();
    });

    describe("prototype", () => {
        it("SearchInterfaceElasticSearch should have the prototype SearchInterface", () => {
            expect(SearchInterface1).to.be.an.instanceof(SearchInterface);
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
                    type: "GET",
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
                    type: "GET"
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
                    type: "GET"
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
        it("should normalize an search result", () => {
            const searchResults = [
                {
                    _id: "100",
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

            expect(SearchInterface1.normalizeResults(searchResults)).to.deep.equals([
                {
                    events: {
                        onClick: {
                            activateLayerInTopicTree: {
                                layerId: "123",
                                closeResults: true
                            },
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
                                },
                                closeResults: true
                            },
                            openTopicTree: {
                                closeResults: true
                            }
                        }
                    },
                    category: "modules.searchBar.type.subject",
                    id: "100",
                    icon: "bi-list-ul",
                    name: "Test abc",
                    toolTip: "Test abc (md name)"
                }
            ]);
        });
    });

    describe("createPossibleActions", () => {
        it("should create possible events from search result", () => {
            const searchResult = {
                _id: "100",
                _source: {
                    id: "123",
                    abc: "abc"
                }
            };

            expect(SearchInterface1.createPossibleActions(searchResult)).to.deep.equals(
                {
                    activateLayerInTopicTree: {
                        layerId: searchResult._source.id,
                        closeResults: true
                    },
                    addLayerToTopicTree: {
                        layerId: searchResult._source.id,
                        source: searchResult._source,
                        closeResults: true
                    },
                    openTopicTree: {
                        closeResults: true
                    }
                }
            );
        });
    });
});
