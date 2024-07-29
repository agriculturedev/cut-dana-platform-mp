import {expect} from "chai";
import sinon from "sinon";
import getOAFFeature from "../../../oaf/getOAFFeature";
import axios from "axios";


describe("src/api/oaf", () => {
    describe("getOAFFeatureGet", () => {
        it("should returns a promise which rejects if baseUrl is not a string", async () => {
            let catchError = null;

            await getOAFFeature.getOAFFeatureGet({baseUrl: undefined}).catch(error => {
                catchError = error;
            });

            expect(catchError).to.not.be.null;
            expect(catchError).to.deep.equal(new Error(`Please provide a valid base url! Got ${undefined}`));
        });
        it("should returns a promise which rejects if collection is not a string", async () => {
            let catchError = null;

            await getOAFFeature.getOAFFeatureGet({baseUrl: ""}).catch(error => {
                catchError = error;
            });

            expect(catchError).to.not.be.null;
            expect(catchError).to.deep.equal(new Error(`Please provide a collection! Got ${undefined}`));
        });
        it("should returns a promise which rejects if filterCrs is undefined and filter param is set", async () => {
            let catchError = null;

            await getOAFFeature.getOAFFeatureGet({baseUrl: "", collection: "", limit: undefined, filter: {}, filterCrs: undefined}).catch(error => {
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

            await getOAFFeature.getOAFFeatureGet({baseUrl: param1, collection: param2});
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
});
