import {expect} from "chai";
import sinon from "sinon";
import getOAFFeature from "../../../oaf/getOAFFeature";
import axios from "axios";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import Point from "ol/geom/Point";

describe("src/shared/js/api/oaf", () => {
    const feature = new Feature({
        geometry: new Polygon([[
            [563599.939, 5936263.688, 0],
            [563602.501, 5936266.163, 0],
            [563608.446, 5936271.905, 0],
            [563609.548, 5936272.969, 0],
            [563617.959, 5936281.094, 0],
            [563619.708, 5936280.381, 0],
            [563628.979, 5936276.605, 0],
            [563630.879, 5936275.831, 0],
            [563634.164, 5936274.492, 0],
            [563625.036, 5936252.064, 0],
            [563624.785, 5936251.517, 0],
            [563624.488, 5936250.994, 0],
            [563624.147, 5936250.498, 0],
            [563623.765, 5936250.033, 0],
            [563623.344, 5936249.603, 0],
            [563622.888, 5936249.21, 0],
            [563622.4, 5936248.858, 0],
            [563621.883, 5936248.55, 0],
            [563621.342, 5936248.287, 0],
            [563620.78, 5936248.071, 0],
            [563620.202, 5936247.904, 0],
            [563619.612, 5936247.788, 0],
            [563619.013, 5936247.723, 0],
            [563618.412, 5936247.709, 0],
            [563617.811, 5936247.747, 0],
            [563617.216, 5936247.837, 0],
            [563616.631, 5936247.977, 0],
            [563616.06, 5936248.168, 0],
            [563615.508, 5936248.406, 0],
            [563614.978, 5936248.691, 0],
            [563614.474, 5936249.021, 0],
            [563614.001, 5936249.392, 0],
            [563613.561, 5936249.803, 0],
            [563599.939, 5936263.688, 0]]])
    });


    describe("getOAFFeatureGet", () => {
        it("should returns a promise which rejects if first param is not a string", async () => {
            let catchError = null;

            await getOAFFeature.getOAFFeatureGet().catch(error => {
                catchError = error;
            });

            expect(catchError).to.not.be.null;
            expect(catchError).to.deep.equal(new Error(`Please provide a valid base url! Got ${undefined}`));
        });
        it("should returns a promise which rejects if second param is not a string", async () => {
            let catchError = null;

            await getOAFFeature.getOAFFeatureGet("").catch(error => {
                catchError = error;
            });

            expect(catchError).to.not.be.null;
            expect(catchError).to.deep.equal(new Error(`Please provide a collection! Got ${undefined}`));
        });
        it("should returns a promise which rejects if last param is undefined and fourth param is set", async () => {
            let catchError = null;

            await getOAFFeature.getOAFFeatureGet("", "", undefined, {}, undefined).catch(error => {
                catchError = error;
            });

            expect(catchError).to.not.be.null;
            expect(catchError).to.deep.equal(new Error(`Please provide a valid crs for the oaf filter! Got ${undefined}`));
        });
        it("should call oafRecursionHelper if first and second param are strings", async () => {
            const oafRecursionHelperStub = sinon.stub(getOAFFeature, "oafRecursionHelper"),
                param1 = "foo",
                param2 = "bar",
                defaultLimit = 400;

            await getOAFFeature.getOAFFeatureGet(param1, param2);
            expect(oafRecursionHelperStub.calledWith([], `${param1}/collections/${param2}/items?limit=${defaultLimit}`)).to.be.true;
            sinon.restore();
        });
    });
    describe("readAllOAFToGeoJSON", () => {
        it("should return the given param if it is not an array", () => {
            expect(getOAFFeature.readAllOAFToGeoJSON(undefined)).to.be.undefined;
            expect(getOAFFeature.readAllOAFToGeoJSON({})).to.be.an("object").that.is.empty;
            expect(getOAFFeature.readAllOAFToGeoJSON(null)).to.be.null;
            expect(getOAFFeature.readAllOAFToGeoJSON(true)).to.be.true;
            expect(getOAFFeature.readAllOAFToGeoJSON(false)).to.be.false;
            expect(getOAFFeature.readAllOAFToGeoJSON("1234")).to.be.equal("1234");
            expect(getOAFFeature.readAllOAFToGeoJSON(1234)).to.be.equal(1234);
        });
    });
    describe("oafRecursionHelper", () => {
        it("should call given onerror function if request fails", async () => {
            const error = new Error("error");
            let errorToTest = null;

            sinon.stub(axios, "get").rejects(error);

            await getOAFFeature.oafRecursionHelper(undefined, undefined).catch(stubError => {
                errorToTest = stubError;
            });
            expect(errorToTest).to.not.be.null;
            expect(errorToTest).to.deep.equal(error);
            sinon.restore();
        });
        it("should merge the new features with already existing one", async () => {
            let result = null;
            const existing = ["foo", "bar"];

            sinon.stub(axios, "get").resolves({data: {features: ["boo", "baz"]}});
            result = await getOAFFeature.oafRecursionHelper(existing);
            expect(result).to.deep.equal(["foo", "bar", "boo", "baz"]);
            sinon.restore();
        });
    });
    describe("getNextLinkFromFeatureCollection", () => {
        it("should return false if featureCollection is not an object", () => {
            expect(getOAFFeature.getNextLinkFromFeatureCollection(undefined)).to.be.false;
            expect(getOAFFeature.getNextLinkFromFeatureCollection(null)).to.be.false;
            expect(getOAFFeature.getNextLinkFromFeatureCollection([])).to.be.false;
            expect(getOAFFeature.getNextLinkFromFeatureCollection("string")).to.be.false;
            expect(getOAFFeature.getNextLinkFromFeatureCollection(1234)).to.be.false;
            expect(getOAFFeature.getNextLinkFromFeatureCollection(true)).to.be.false;
            expect(getOAFFeature.getNextLinkFromFeatureCollection(false)).to.be.false;
        });
        it("should return false if featureCollection.links is not an array", () => {
            expect(getOAFFeature.getNextLinkFromFeatureCollection({})).to.be.false;
            expect(getOAFFeature.getNextLinkFromFeatureCollection({links: null})).to.be.false;
            expect(getOAFFeature.getNextLinkFromFeatureCollection({links: undefined})).to.be.false;
            expect(getOAFFeature.getNextLinkFromFeatureCollection({links: ""})).to.be.false;
            expect(getOAFFeature.getNextLinkFromFeatureCollection({links: "string"})).to.be.false;
            expect(getOAFFeature.getNextLinkFromFeatureCollection({links: 1234})).to.be.false;
            expect(getOAFFeature.getNextLinkFromFeatureCollection({links: true})).to.be.false;
            expect(getOAFFeature.getNextLinkFromFeatureCollection({links: false})).to.be.false;
            expect(getOAFFeature.getNextLinkFromFeatureCollection({links: {}})).to.be.false;
        });
        it("should return false if featureCollection.links contains no objects", () => {
            expect(getOAFFeature.getNextLinkFromFeatureCollection({links: [undefined, null, "string", 1234, true, false, []]})).to.be.false;
        });
        it("should return false if featureCollection.links are objects but href is not a string", () => {
            expect(getOAFFeature.getNextLinkFromFeatureCollection({links: [
                {href: undefined},
                {href: null},
                {href: []},
                {href: {}},
                {href: 1234},
                {href: true},
                {href: false}
            ]})).to.be.false;
        });
        it("should return false if featureCollection.links are objects with href string but rel is not equal 'next'", () => {
            expect(getOAFFeature.getNextLinkFromFeatureCollection({links: [{href: "string", rel: "this is not a next"}]})).to.be.false;
        });
        it("should return href if featureCollection.links are objects with href string and one of the rels equals 'next' and type equals 'application/geo+json'", () => {
            expect(getOAFFeature.getNextLinkFromFeatureCollection({links: [
                {href: "hrefA", rel: "this is not a next page"},
                {href: "hrefB", rel: "this is not a next page"},
                {href: "hrefC", rel: "this is not a next page"},
                {href: "hrefD", rel: "next", type: "application/geo+json"},
                {href: "hrefE", rel: "this is not a next page"}
            ]})).to.equal("hrefD");
        });
    });
    describe("getUniqueValuesByScheme", () => {
        it("should return an empty object if first param is not a string", async () => {
            expect(await getOAFFeature.getUniqueValuesByScheme(undefined)).to.be.an("object").that.is.empty;
            expect(await getOAFFeature.getUniqueValuesByScheme(null)).to.be.an("object").that.is.empty;
            expect(await getOAFFeature.getUniqueValuesByScheme({})).to.be.an("object").that.is.empty;
            expect(await getOAFFeature.getUniqueValuesByScheme([])).to.be.an("object").that.is.empty;
            expect(await getOAFFeature.getUniqueValuesByScheme(true)).to.be.an("object").that.is.empty;
            expect(await getOAFFeature.getUniqueValuesByScheme(false)).to.be.an("object").that.is.empty;
            expect(await getOAFFeature.getUniqueValuesByScheme(1234)).to.be.an("object").that.is.empty;
        });
        it("should return an empty object if second param is not a string", async () => {
            expect(await getOAFFeature.getUniqueValuesByScheme("foo", undefined)).to.be.an("object").that.is.empty;
            expect(await getOAFFeature.getUniqueValuesByScheme("foo", null)).to.be.an("object").that.is.empty;
            expect(await getOAFFeature.getUniqueValuesByScheme("foo", {})).to.be.an("object").that.is.empty;
            expect(await getOAFFeature.getUniqueValuesByScheme("foo", [])).to.be.an("object").that.is.empty;
            expect(await getOAFFeature.getUniqueValuesByScheme("foo", true)).to.be.an("object").that.is.empty;
            expect(await getOAFFeature.getUniqueValuesByScheme("foo", false)).to.be.an("object").that.is.empty;
            expect(await getOAFFeature.getUniqueValuesByScheme("foo", 1234)).to.be.an("object").that.is.empty;
        });
        it("should return an empty object if second param is not a string", async () => {
            expect(await getOAFFeature.getUniqueValuesByScheme("foo", "foo", undefined)).to.be.an("object").that.is.empty;
            expect(await getOAFFeature.getUniqueValuesByScheme("foo", "foo", {})).to.be.an("object").that.is.empty;
            expect(await getOAFFeature.getUniqueValuesByScheme("foo", "foo", null)).to.be.an("object").that.is.empty;
            expect(await getOAFFeature.getUniqueValuesByScheme("foo", "foo", true)).to.be.an("object").that.is.empty;
            expect(await getOAFFeature.getUniqueValuesByScheme("foo", "foo", false)).to.be.an("object").that.is.empty;
            expect(await getOAFFeature.getUniqueValuesByScheme("foo", "foo", 1234)).to.be.an("object").that.is.empty;
            expect(await getOAFFeature.getUniqueValuesByScheme("foo", "foo", "1234")).to.be.an("object").that.is.empty;
        });
        it("should return an empty object if request was not successfull", async () => {
            sinon.stub(axios, "get").resolves({status: 400});
            sinon.stub(getOAFFeature, "getUniqueValuesFromCollection").resolves({});
            expect(await getOAFFeature.getUniqueValuesByScheme("foo", "foo", [])).to.be.an("object").that.is.empty;
            sinon.restore();
        });
        it("should return an empty object if request was successfull but without expected data", async () => {
            sinon.stub(axios, "get").resolves({data: "foo"});
            sinon.stub(getOAFFeature, "getUniqueValuesFromCollection").resolves({});
            expect(await getOAFFeature.getUniqueValuesByScheme("foo", "foo", [])).to.be.an("object").that.is.empty;
            sinon.restore();
        });
        it("should return an object with all properties", async () => {
            const expected = {
                foo: {bar: true, baz: true},
                boo: {buu: true, bee: true}
            };

            sinon.stub(axios, "get").resolves({
                status: 200,
                data: {
                    properties: {
                        foo: {
                            enum: ["bar", "baz"]
                        },
                        boo: {
                            enum: ["buu", "bee"]
                        },
                        fee: {}
                    }
                }
            });
            expect(await getOAFFeature.getUniqueValuesByScheme("foo", "foo", [])).to.deep.equal(expected);
            sinon.restore();
        });
        it("should return an object with only the expected properties", async () => {
            const expected = {
                boo: {buu: true, bee: true}
            };

            sinon.stub(axios, "get").resolves({
                status: 200,
                data: {
                    properties: {
                        foo: {
                            enum: ["bar", "baz"]
                        },
                        boo: {
                            enum: ["buu", "bee"]
                        },
                        fee: {}
                    }
                }
            });
            expect(await getOAFFeature.getUniqueValuesByScheme("foo", "foo", ["boo"])).to.deep.equal(expected);
            sinon.restore();
        });
        it("should return an object with expected properties which weren't gathered through enums", async () => {
            const expected = {
                boo: {buu: true, bee: true}
            };

            sinon.stub(getOAFFeature, "getUniqueValuesFromCollection").resolves(expected);
            sinon.stub(axios, "get").resolves({
                status: 200,
                data: {
                    properties: {
                        foo: {},
                        boo: {},
                        fee: {}
                    }
                }
            });
            expect(await getOAFFeature.getUniqueValuesByScheme("foo", "foo", ["boo"])).to.deep.equal(expected);
            sinon.restore();
        });
    });
    describe("getOAFGeometryFilter", () => {
        it("should return undefined if no filter type is provided", () => {
            expect(getOAFFeature.getOAFGeometryFilter(feature.getGeometry(), undefined)).to.be.undefined;
        });

        it("should return a within filter", () => {
            const filter = getOAFFeature.getOAFGeometryFilter(feature.getGeometry(), "geom", "within");

            expect(filter.startsWith("S_WITHIN")).to.be.true;
        });
        it("should return a intersects filter", () => {
            const filter = getOAFFeature.getOAFGeometryFilter(feature.getGeometry(), "geom", "intersects");

            expect(filter.startsWith("S_INTERSECTS")).to.be.true;
        });
        it("should return a polygon filter with the coordinates fixed", () => {
            const expected = [
                "563599.939 5936263.688",
                "563602.501 5936266.163",
                "563608.446 5936271.905",
                "563609.548 5936272.969",
                "563617.959 5936281.094",
                "563619.708 5936280.381",
                "563628.979 5936276.605",
                "563630.879 5936275.831",
                "563634.164 5936274.492",
                "563625.036 5936252.064",
                "563624.785 5936251.517",
                "563624.488 5936250.994",
                "563624.147 5936250.498",
                "563623.765 5936250.033",
                "563623.344 5936249.603",
                "563622.888 5936249.21",
                "563622.4 5936248.858",
                "563621.883 5936248.55",
                "563621.342 5936248.287",
                "563620.78 5936248.071",
                "563620.202 5936247.904",
                "563619.612 5936247.788",
                "563619.013 5936247.723",
                "563618.412 5936247.709",
                "563617.811 5936247.747",
                "563617.216 5936247.837",
                "563616.631 5936247.977",
                "563616.06 5936248.168",
                "563615.508 5936248.406",
                "563614.978 5936248.691",
                "563614.474 5936249.021",
                "563614.001 5936249.392",
                "563613.561 5936249.803",
                "563599.939 5936263.688"];

            expect(getOAFFeature.getOAFGeometryFilter(feature.getGeometry(), "geom", "intersects")).to
                .be.equal(`S_INTERSECTS(geom, POLYGON((${expected.join(", ")})))`);
        });

        it("should return a point filter with the coordinates fixed ", () => {
            const pointFeature = new Feature({
                    geometry: new Point([563599.939, 5936263.688])
                }),
                expected = ["563599.939 5936263.688"];

            expect(getOAFFeature.getOAFGeometryFilter(pointFeature.getGeometry(), "geom", "intersects")).to
                .be.equal(`S_INTERSECTS(geom, POINT(${expected.join(", ")}))`);
        });
    });
});
