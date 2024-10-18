import {expect} from "chai";
import fetchData from "../../../utils/fetchData";
import sinon from "sinon";
import {rawLayerList} from "@masterportal/masterportalapi";
import axios from "axios";

describe("src/modules/tools/statisticDashboard/utils/fetchData.js", () => {
    describe("getUniqueValuesFromFeatures", () => {
        it("should return an empty object if first param is not an array", () => {
            expect(fetchData.getUniqueValuesFromFeatures(undefined)).to.be.an("object").that.is.empty;
            expect(fetchData.getUniqueValuesFromFeatures({})).to.be.an("object").that.is.empty;
            expect(fetchData.getUniqueValuesFromFeatures("1234")).to.be.an("object").that.is.empty;
            expect(fetchData.getUniqueValuesFromFeatures(1234)).to.be.an("object").that.is.empty;
            expect(fetchData.getUniqueValuesFromFeatures(true)).to.be.an("object").that.is.empty;
            expect(fetchData.getUniqueValuesFromFeatures(false)).to.be.an("object").that.is.empty;
            expect(fetchData.getUniqueValuesFromFeatures(null)).to.be.an("object").that.is.empty;
        });
        it("should return an empty object if second param is not an array", () => {
            expect(fetchData.getUniqueValuesFromFeatures([], {})).to.be.an("object").that.is.empty;
            expect(fetchData.getUniqueValuesFromFeatures([], undefined)).to.be.an("object").that.is.empty;
            expect(fetchData.getUniqueValuesFromFeatures([], null)).to.be.an("object").that.is.empty;
            expect(fetchData.getUniqueValuesFromFeatures([], 1234)).to.be.an("object").that.is.empty;
            expect(fetchData.getUniqueValuesFromFeatures([], "1234")).to.be.an("object").that.is.empty;
            expect(fetchData.getUniqueValuesFromFeatures([], true)).to.be.an("object").that.is.empty;
            expect(fetchData.getUniqueValuesFromFeatures([], false)).to.be.an("object").that.is.empty;
        });
        it("should return an object with attrName as key and unique list as value", () => {
            const features = [
                    {
                        getProperties: () => {
                            return {foo: "bar"};
                        }
                    },
                    {
                        getProperties: () => {
                            return {foo: "bar"};
                        }
                    },
                    {
                        getProperties: () => {
                            return {foo: "buz"};
                        }
                    }
                ],
                attrNames = [{name: "foo"}],
                expected = {
                    foo: {
                        "bar": true,
                        "buz": true
                    }
                };

            expect(fetchData.getUniqueValuesFromFeatures(features, attrNames)).to.deep.equal(expected);
        });
        it("should return an object with attrName as key and unique list as value with date strings", () => {
            const features = [
                    {
                        getProperties: () => {
                            return {
                                foo: "bar",
                                boo: "2020-12-12T00:00:00"
                            };
                        }
                    },
                    {
                        getProperties: () => {
                            return {
                                foo: "buz",
                                boo: "2021-12-12T00:00:00"
                            };
                        }
                    },
                    {
                        getProperties: () => {
                            return {
                                foo: "bar",
                                boo: "2019-12-12T00:00:00"
                            };
                        }
                    },
                    {
                        getProperties: () => {
                            return {
                                foo: "bar",
                                boo: "2020-12-12T00:00:00"
                            };
                        }
                    }
                ],
                attrNames = [{name: "foo"}, {name: "boo", type: "date"}],
                inputFormat = "YYYY-MM-DD",
                outputFormat = "YYYY",
                expected = {
                    foo: {
                        "bar": true,
                        "buz": true
                    },
                    boo: {
                        "2019-12-12T00:00:00": true,
                        "2020-12-12T00:00:00": true,
                        "2021-12-12T00:00:00": true
                    }
                };

            expect(fetchData.getUniqueValuesFromFeatures(features, attrNames, inputFormat, outputFormat)).to.deep.equal(expected);
        });
    });

    describe("getAttributesWithType", () => {
        it("should return an empty object if given attrNames is not an array", async () => {
            expect(await fetchData.getAttributesWithType(undefined, {})).to.be.an("array").that.is.empty;
            expect(await fetchData.getAttributesWithType(undefined, null)).to.be.an("array").that.is.empty;
            expect(await fetchData.getAttributesWithType(undefined, undefined)).to.be.an("array").that.is.empty;
            expect(await fetchData.getAttributesWithType(undefined, 1234)).to.be.an("array").that.is.empty;
            expect(await fetchData.getAttributesWithType(undefined, "1234")).to.be.an("array").that.is.empty;
            expect(await fetchData.getAttributesWithType(undefined, true)).to.be.an("array").that.is.empty;
            expect(await fetchData.getAttributesWithType(undefined, false)).to.be.an("array").that.is.empty;
        });
        it("should return an empty object if given url is not a string", async () => {
            expect(await fetchData.getAttributesWithType(undefined)).to.be.an("array").that.is.empty;
            expect(await fetchData.getAttributesWithType({})).to.be.an("array").that.is.empty;
            expect(await fetchData.getAttributesWithType([])).to.be.an("array").that.is.empty;
            expect(await fetchData.getAttributesWithType(1234)).to.be.an("array").that.is.empty;
            expect(await fetchData.getAttributesWithType("1234")).to.be.an("array").that.is.empty;
            expect(await fetchData.getAttributesWithType(true)).to.be.an("array").that.is.empty;
            expect(await fetchData.getAttributesWithType(false)).to.be.an("array").that.is.empty;
            expect(await fetchData.getAttributesWithType(null)).to.be.an("array").that.is.empty;
        });
    });
    describe("getUniqueValues", () => {
        it("should return an empty array if getLayerWhere returns null", async () => {
            sinon.stub(rawLayerList, "getLayerWhere").returns(null);
            expect(await fetchData.getUniqueValues(1234)).to.be.an("array").that.is.empty;
            sinon.restore();
        });
        it("should call expected functions", async () => {
            const features = null,
                attributesWithType = {foo: "bar"};

            sinon.stub(rawLayerList, "getLayerWhere").returns({id: "1234", typ: "WFS"});
            sinon.stub(fetchData, "fetchAllDataForWFS").returns(features);
            sinon.stub(fetchData, "getAttributesWithType").returns(attributesWithType);
            sinon.stub(fetchData, "getUniqueValuesFromFeatures").returns();

            await fetchData.getUniqueValues("1234", ["foo"]);
            expect(fetchData.getUniqueValuesFromFeatures.calledWith([], attributesWithType)).to.be.true;
            sinon.restore();
        });
    });
    describe("getOAFFeatures", () => {
        it("should return an empty array if params are not as expected", async () => {
            expect(await fetchData.getOAFFeatures()).to.be.an("array").that.is.empty;
            expect(await fetchData.getOAFFeatures("foo")).to.be.an("array").that.is.empty;
            expect(await fetchData.getOAFFeatures("foo", "bar")).to.be.an("array").that.is.empty;
            expect(await fetchData.getOAFFeatures("foo", "bar", [])).to.be.an("array").that.is.empty;
            expect(await fetchData.getOAFFeatures("foo", "bar", ["foo"])).to.be.an("array").that.is.empty;
        });
        it("should use nextLink as url", async () => {
            const axiosStub = sinon.stub(axios, "get").resolves({}),
                url = "foo.bar.com";

            await fetchData.getOAFFeatures("foo", "bar", ["foo"], "projection", undefined, undefined, url);
            expect(axiosStub.calledWith(url, {
                headers: {
                    accept: "application/geo+json"
                }
            })).to.be.true;
            sinon.restore();
        });
        it("should use build up url if no nextLink is given", async () => {
            const axiosStub = sinon.stub(axios, "get").resolves({}),
                url = "https://foo/collections/bar/items?crs=http://www.opengis.net/def/crs/EPSG/0/25832&limit=400&properties=foo";

            await fetchData.getOAFFeatures("https://foo", "bar", ["foo"], "projection");
            expect(axiosStub.calledWith(url, {
                headers: {
                    accept: "application/geo+json"
                }
            })).to.be.true;
            sinon.restore();
        });
        it("should use build up url if no nextLink is given with filter", async () => {
            const axiosStub = sinon.stub(axios, "get").resolves({}),
                url = "https://foo/collections/bar/items?crs=http://www.opengis.net/def/crs/EPSG/0/25832&limit=400&properties=foo&filter-lang=cql2-text&filter=fooobaar";

            await fetchData.getOAFFeatures("https://foo", "bar", ["foo"], "projection", "fooobaar");
            expect(axiosStub.calledWith(url, {
                headers: {
                    accept: "application/geo+json"
                }
            })).to.be.true;
            sinon.restore();
        });
    });
});
