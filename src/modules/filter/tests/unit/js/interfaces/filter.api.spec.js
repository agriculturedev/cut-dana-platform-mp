import {expect} from "chai";
import sinon from "sinon";
import hash from "object-hash";
import IntervalRegister from "../../../../utils/intervalRegister";
import InterfaceWfsIntern from "../../../../js/interfaces/interface.wfs.intern";
import InterfaceWfsExtern from "../../../../js/interfaces/interface.wfs.extern";
import InterfaceOafIntern from "../../../../js/interfaces/interface.oaf.intern";
import InterfaceOafExtern from "../../../../js/interfaces/interface.oaf.extern";
import InterfaceGeojsonIntern from "../../../../js/interfaces/interface.geojson.intern";
import InterfaceGeojsonExtern from "../../../../js/interfaces/interface.geojson.extern";
import InterfaceStaIntern from "../../../../js/interfaces/interface.sta.intern";
import InterfaceStaExtern from "../../../../js/interfaces/interface.sta.extern";
import openlayerFunctions from "../../../../utils/openlayerFunctions";
import FilterApi from "../../../../js/interfaces/filter.api";

describe("src/modules/filter/interfaces/filter.api.js", () => {
    describe("constructor", () => {
        it("should create an instance and set expected properties to it", () => {
            const filterApi = new FilterApi(123);

            expect(filterApi.filterId).to.be.equal(123);
            expect(filterApi.service).to.be.null;
        });
        it("should set intervalRegister if not set", () => {
            const expected = new IntervalRegister();

            new FilterApi(1);
            expect(FilterApi.intervalRegister).to.deep.equal(expected);
        });
        it("should set the correct interfaces", () => {
            new FilterApi(0);
            expect(FilterApi.interfaces.wfsIntern).to.be.an.instanceOf(InterfaceWfsIntern);
            expect(FilterApi.interfaces.wfsExtern).to.be.an.instanceOf(InterfaceWfsExtern);
            expect(FilterApi.interfaces.oafIntern).to.be.an.instanceOf(InterfaceOafIntern);
            expect(FilterApi.interfaces.oafExtern).to.be.an.instanceOf(InterfaceOafExtern);
            expect(FilterApi.interfaces.geojsonIntern).to.be.an.instanceOf(InterfaceGeojsonIntern);
            expect(FilterApi.interfaces.geojsonExtern).to.be.an.instanceOf(InterfaceGeojsonExtern);
            expect(FilterApi.interfaces.staIntern).to.be.an.instanceOf(InterfaceStaIntern);
            expect(FilterApi.interfaces.staExtern).to.be.an.instanceOf(InterfaceStaExtern);
        });
    });
    describe("methods", () => {
        describe("setServiceByLayerModel", () => {
            it("should not set the service if second param is not an object", () => {
                const filterApi = new FilterApi(0);

                filterApi.setServiceByLayerModel(0, undefined);
                expect(filterApi.service).to.be.null;
                filterApi.setServiceByLayerModel(0, null);
                expect(filterApi.service).to.be.null;
                filterApi.setServiceByLayerModel(0, []);
                expect(filterApi.service).to.be.null;
                filterApi.setServiceByLayerModel(0, "string");
                expect(filterApi.service).to.be.null;
                filterApi.setServiceByLayerModel(0, 1234);
                expect(filterApi.service).to.be.null;
                filterApi.setServiceByLayerModel(0, true);
                expect(filterApi.service).to.be.null;
                filterApi.setServiceByLayerModel(0, false);
                expect(filterApi.service).to.be.null;
            });
            it("should set the wfs service", () => {
                const filterApi = new FilterApi(0),
                    layerModel = {
                        typ: "WFS",
                        featureNS: "foob/boof",
                        url: "foo",
                        featureType: "bar"
                    },
                    expected = {
                        type: "wfs",
                        extern: false,
                        layerId: 0,
                        url: "foo",
                        typename: "bar",
                        isSecured: undefined,
                        namespace: "foob/boof",
                        srsName: "foo",
                        featureNS: "foob",
                        featurePrefix: "boof",
                        featureTypes: ["bar"]
                    };

                openlayerFunctions.getMapProjection = sinon.stub().returns("foo");
                filterApi.setServiceByLayerModel(0, layerModel, false);
                expect(filterApi.service).to.deep.equal(expected);
                sinon.restore();
            });
            it("should set the service for oaf", () => {
                const filterApi = new FilterApi(0),
                    layerModel = {
                        typ: "OAF",
                        featureNS: "foob/boof",
                        url: "foo",
                        featureType: "bar",
                        collection: "wooo",
                        limit: 400
                    },
                    expected = {
                        type: "oaf",
                        extern: false,
                        layerId: 0,
                        url: "foo",
                        collection: "wooo",
                        namespace: "foob/boof",
                        limit: 400
                    };

                filterApi.setServiceByLayerModel(0, layerModel, false);
                expect(filterApi.service).to.deep.equal(expected);
            });
            it("should call error function in oaf", () => {
                const filterApi = new FilterApi(0),
                    layerModel = {
                        typ: "OAF",
                        featureNS: "foob/boof",
                        url: "foo",
                        featureType: "bar",
                        collection: "wooo",
                        limit: 400
                    },
                    expected = new Error("FilterApi.setServiceByLayerModel: Filtering oaf extern is not supported yet.");

                filterApi.setServiceByLayerModel(0, layerModel, true, error => {
                    expect(error).to.deep.equal(expected);
                });
            });
            it("should set the service for geojson", () => {
                const filterApi = new FilterApi(0),
                    layerModel = {
                        typ: "GEOJSON",
                        featureNS: "foob/boof",
                        url: "foo",
                        featureType: "bar"
                    },
                    expected = {
                        type: "geojson",
                        extern: false,
                        layerId: 0,
                        url: "foo"
                    };

                filterApi.setServiceByLayerModel(0, layerModel, false);
                expect(filterApi.service).to.deep.equal(expected);
            });
            it("should call error function in geojson", () => {
                const filterApi = new FilterApi(0),
                    layerModel = {
                        typ: "GEOJSON",
                        featureNS: "foob/boof",
                        url: "foo",
                        featureType: "bar"
                    },
                    expected = new Error("FilterApi.setServiceByLayerModel: Filtering geojson extern is not supported.");

                filterApi.setServiceByLayerModel(0, layerModel, true, error => {
                    expect(error).to.deep.equal(expected);
                });
            });
            it("should set the service for sensorthings", () => {
                const filterApi = new FilterApi(0),
                    layerModel = {
                        typ: "SENSORTHINGS"
                    },
                    expected = {
                        type: "sensorthings",
                        extern: false,
                        layerId: 0
                    };

                filterApi.setServiceByLayerModel(0, layerModel, false);
                expect(filterApi.service).to.deep.equal(expected);
            });
            it("should call error function in sensorthings", () => {
                const filterApi = new FilterApi(0),
                    layerModel = {
                        typ: "SENSORTHINGS"
                    },
                    expected = new Error("FilterApi.setServiceByLayerModel: Filtering sta extern is not supported.");

                filterApi.setServiceByLayerModel(0, layerModel, true, error => {
                    expect(error).to.deep.equal(expected);
                });
            });
            it("should call error function if typ is unknown", () => {
                const filterApi = new FilterApi(0),
                    layerModel = {
                        typ: "foo"
                    },
                    expected = new Error("FilterApi.setServiceByLayerModel: Unknown layer type foo");

                filterApi.setServiceByLayerModel(0, layerModel, false, error => {
                    expect(error).to.deep.equal(expected);
                });
            });
            it("should set the service for VectorTiles", () => {
                const filterApi = new FilterApi(0),
                    layerModel = {
                        typ: "VectorTile",
                        featureType: "bar"
                    },
                    expected = {
                        type: "vectortile",
                        extern: false,
                        layerId: 0
                    };

                filterApi.setServiceByLayerModel(0, layerModel, false, "wooo");
                expect(filterApi.service).to.deep.equal(expected);
            });
            it("should call error function in vectortiles if extern is true", () => {
                const filterApi = new FilterApi(0),
                    layerModel = {
                        typ: "VectorTile",
                        url: "foo/tiles/xyz",
                        featureType: "bar"
                    },
                    expected = new Error("FilterApi.setServiceByLayerModel: Filtering vectortiles extern is not supported.");

                filterApi.setServiceByLayerModel(0, layerModel, true, error => {
                    expect(error).to.deep.equal(expected);
                });
            });
        });
        describe("getAttrTypes", () => {
            it("should call given error function with expected error", () => {
                const filterApi = new FilterApi(0),
                    expected = new Error("FilterApi.getAttrTypes: You have to set a default service first before using this function.");

                filterApi.setService(null);
                filterApi.getAttrTypes(undefined, error => {
                    expect(error).to.deep.equal(expected);
                });
            });
            it("should call onsucces function if cache key matches existing cache key", () => {
                const filterApi = new FilterApi(0),
                    expected = "foo";

                sinon.stub(filterApi, "getInterfaceByService");
                hash.sha1 = sinon.stub().returns(["fow", "bar"]);
                FilterApi.cache = {"fow.bar": "foo"};
                filterApi.setService({});
                filterApi.getAttrTypes(result => {
                    expect(result).to.be.equal(expected);
                });
                sinon.restore();
            });
            it("should call error function with expected error if cache key not matches and no connector is given", () => {
                const filterApi = new FilterApi(0),
                    expected = new Error("FilterApi.getAttrTypes: The connector should be an object and have a function getAttrTypes.");

                sinon.stub(filterApi, "getInterfaceByService").returns("boo");
                hash.sha1 = sinon.stub().returns(["foo", "loo"]);
                FilterApi.cache = {};
                filterApi.setService({});
                filterApi.getAttrTypes(undefined, error => {
                    expect(error).to.deep.equal(expected);
                });
                sinon.restore();
            });
            it("should call the onsuccess function with expected result if cache key exists but has no array", () => {
                const filterApi = new FilterApi(0),
                    expected = "foo",
                    connector = {
                        getAttrTypes: (service, onsuccess) => {
                            onsuccess("foo");
                        }
                    };

                sinon.stub(filterApi, "getInterfaceByService").returns(connector);
                hash.sha1 = sinon.stub().returns(["fow", "bar"].join("."));
                filterApi.setService({});
                FilterApi.cache = {};
                filterApi.getAttrTypes(result => {
                    expect(result).to.be.equal(expected);
                    expect(FilterApi.cache).to.deep.equal({
                        "fow.bar": "foo"
                    });
                });
                sinon.restore();
            });
            it("should push object with onsuccess and onerror if waitinglist with key is already an array", () => {
                /**
                 * Test function
                 * @returns {String} result
                 */
                function onsuccess () {
                    return "foo";
                }
                /**
                 * Test function
                 * @returns {String} error
                 */
                function onerror () {
                    return "error";
                }
                const filterApi = new FilterApi(0),
                    connector = {
                        getAttrTypes: (service, success) => {
                            success("foo");
                        }
                    };

                sinon.stub(filterApi, "getInterfaceByService").returns(connector);
                hash.sha1 = sinon.stub().returns(["fow", "bar"].join("."));
                filterApi.setService({});
                FilterApi.cache = {};
                FilterApi.waitingList["fow.bar"] = [];
                filterApi.getAttrTypes(onsuccess, onerror);
                expect(FilterApi.waitingList["fow.bar"]).to.deep.equal([{onsuccess, onerror}]);
                sinon.restore();
            });
        });
        describe("getMinMax", () => {
            it("should call given error function with expected error", () => {
                const filterApi = new FilterApi(0),
                    expected = new Error("FilterApi.getMinMax: You have to set a default service first before using this function.");

                filterApi.setService(null);
                expect(filterApi.service).to.be.null;
                filterApi.getMinMax("foo", undefined, error => {
                    expect(error).to.deep.equal(expected);
                }, false, false, false, {});
                sinon.restore();
            });
            it("should call onsucces function if cache key matches existing cache key", () => {
                const filterApi = new FilterApi(0),
                    expected = "foo";

                sinon.stub(filterApi, "getInterfaceByService");
                hash.sha1 = sinon.stub().returns(["fow", "bar"]);
                FilterApi.cache = {"fow.bar": "foo"};
                filterApi.setService({});
                filterApi.getMinMax("attr", result => {
                    expect(result).to.be.equal(expected);
                }, undefined, false, false, false, {});
                sinon.restore();
            });
            it("should call given error function with expected error, if connector is not an object", () => {
                const filterApi = new FilterApi(0),
                    expected = new Error("FilterApi.getMinMax: The connector should be an object and have a function getMinMax.");

                sinon.stub(filterApi, "getInterfaceByService").returns(null);
                filterApi.setService({});
                FilterApi.cache = {};
                filterApi.getMinMax("attr", undefined, error => {
                    expect(error).to.deep.equal(expected);
                }, false, false, false, {});
                sinon.restore();
            });
            it("should call given error function with expected error, if connector.getMinMax is not a function", () => {
                const filterApi = new FilterApi(0),
                    expected = new Error("FilterApi.getMinMax: The connector should be an object and have a function getMinMax.");

                sinon.stub(filterApi, "getInterfaceByService").returns({});
                filterApi.setService({});
                FilterApi.cache = {};
                filterApi.getMinMax("attr", undefined, error => {
                    expect(error).to.deep.equal(expected);
                }, false, false, false, {});
                sinon.restore();
            });
            it("should call onsuccess function and return the expected value, if waitingList with key is not an array.", () => {
                const filterApi = new FilterApi(0),
                    connector = {
                        getMinMax: (service, attrName, success) => {
                            success("foo");
                        }
                    },
                    expected = "foo";

                sinon.stub(filterApi, "getInterfaceByService").returns(connector);
                hash.sha1 = sinon.stub().returns(["fow", "bar"].join("."));
                filterApi.setService({});
                FilterApi.cache = {};
                FilterApi.waitingList = {};
                filterApi.getMinMax("attr", result => {
                    expect(result).to.be.equal(expected);
                    expect(FilterApi.cache).to.deep.equal({
                        "fow.bar": "foo"
                    });
                }, undefined, false, false, false, {});
                sinon.restore();
            });
            it("should push object with onsuccess and onerror if waitinglist with key is already an array", () => {
                /**
                 * Test function
                 * @returns {String} result
                 */
                function onsuccess () {
                    return "foo";
                }
                /**
                 * Test function
                 * @returns {String} error
                 */
                function onerror () {
                    return "error";
                }
                const filterApi = new FilterApi(0),
                    connector = {
                        getMinMax: (service, attrName, success) => {
                            success("foo");
                        }
                    };

                sinon.stub(filterApi, "getInterfaceByService").returns(connector);
                hash.sha1 = sinon.stub().returns(["fow", "bar"].join("."));
                filterApi.setService({});
                FilterApi.cache = {};
                FilterApi.waitingList["fow.bar"] = [];
                filterApi.getMinMax("attr", onsuccess, onerror, false, false, false, {});
                expect(FilterApi.waitingList["fow.bar"]).to.deep.equal([{onsuccess, onerror}]);
                sinon.restore();
            });
        });
        describe("getUniqueValues", () => {
            it("should call given error function with expected error", () => {
                const filterApi = new FilterApi(0),
                    expected = new Error("FilterApi.getUniqueValues: You have to set a default service first before using this function.");

                filterApi.setService(null);
                expect(filterApi.service).to.be.null;
                filterApi.getUniqueValues("attr", undefined, error => {
                    expect(error).to.be.deep.equal(expected);
                }, {});
            });
            it("should call onsucces function if cache key matches existing cache key", () => {
                const filterApi = new FilterApi(0),
                    expected = "foo";

                sinon.stub(filterApi, "getInterfaceByService");
                hash.sha1 = sinon.stub().returns(["fow", "bar"]);
                FilterApi.cache = {"fow.bar": "foo"};
                filterApi.setService({});
                filterApi.getUniqueValues("attr", result => {
                    expect(result).to.be.deep.equal(expected);
                }, undefined, {});
                sinon.restore();
            });
            it("should call given error function with expected error, if connector is not an object", () => {
                const filterApi = new FilterApi(0),
                    expected = new Error("FilterApi.getUniqueValues: The connector should be an object and have a function getUniqueValues.");

                sinon.stub(filterApi, "getInterfaceByService").returns(null);
                filterApi.setService({});
                FilterApi.cache = {};
                filterApi.getUniqueValues("attr", undefined, error => {
                    expect(error).to.deep.equal(expected);
                }, false, false, false, {});
                sinon.restore();
            });
            it("should call onsuccess function and return the expected value, if waitingList with key is not an array.", () => {
                const filterApi = new FilterApi(0),
                    connector = {
                        getUniqueValues: (service, attrName, success) => {
                            success("foo");
                        }
                    },
                    expected = "foo";

                sinon.stub(filterApi, "getInterfaceByService").returns(connector);
                hash.sha1 = sinon.stub().returns(["fow", "bar"]);
                FilterApi.cache = {};
                FilterApi.waitingList = {};
                filterApi.getUniqueValues("attr", result => {
                    expect(result).to.be.deep.equal(expected);
                }, undefined, {});
                sinon.restore();
            });
            it("should push object with onsuccess and onerror if waitinglist with key is already an array", () => {
                /**
                 * Test function
                 * @returns {String} result
                 */
                function onsuccess () {
                    return "foo";
                }
                /**
                 * Test function
                 * @returns {String} error
                 */
                function onerror () {
                    return "error";
                }
                const filterApi = new FilterApi(),
                    connector = {
                        getUniqueValues: (service, attrName, success) => {
                            success("foo");
                        }
                    };

                sinon.stub(filterApi, "getInterfaceByService").returns(connector);
                hash.sha1 = sinon.stub().returns(["fow", "bar"].join("."));
                filterApi.setService({});
                FilterApi.cache = {};
                FilterApi.waitingList["fow.bar"] = [];
                filterApi.getUniqueValues("attr", onsuccess, onerror, {});
                expect(FilterApi.waitingList["fow.bar"]).to.deep.equal([{onsuccess, onerror}]);
                sinon.restore();
            });
        });
        describe("filter", () => {
            it("should call given error function with expected error", () => {
                const filterApi = new FilterApi(0),
                    expected = new Error("FilterApi.filter: You have to set a default service first before using this function.");

                filterApi.setService(null);
                expect(filterApi.service).to.be.null;
                filterApi.filter({}, undefined, error => {
                    expect(error).to.deep.equal(expected);
                });
                sinon.restore();
            });
            it("should call onsuccess function and return the expected value, if connector is an object and connector.filter is a function", () => {
                const filterApi = new FilterApi(0),
                    connector = {
                        filter: (filterQuestion, success) => {
                            success("foo");
                        }
                    },
                    expected = "foo";

                sinon.stub(filterApi, "getInterfaceByService").returns(connector);
                filterApi.setService({});
                filterApi.filter({}, result => {
                    expect(result).to.deep.equal(expected);
                }, undefined);
                sinon.restore();
            });
            it("should call onsuccess with expected dummy data if last param is set to true", () => {
                const filterApi = new FilterApi(0),
                    expected = {service: {}, filterId: 0, snippetId: undefined, paging: {page: 1, total: 1}, items: []};

                filterApi.setService({});
                filterApi.filter({}, result => {
                    expect(result).to.deep.equal(expected);
                }, undefined, true);
            });
        });
    });
});
