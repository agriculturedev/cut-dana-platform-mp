import axios from "axios";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle.js";
import {expect} from "chai";
import {nextTick} from "vue";
import rawLayerList from "@masterportal/masterportalapi/src/rawLayerList";
import sinon from "sinon";
import VectorLayer from "ol/layer/Vector";

import actions from "../../../store/actionsMapsZoomTo";

const fs = require("fs"),
    exampleFeatureCollection = fs.readFileSync("./src/core/maps/tests/unit/resources/featureCollection.xml", "utf8"),
    idDistrictLayer = "1692",
    id = "someId";

/**
 * Fakes the return of a successful axios get request.
 *
 * @returns {Promise<{data: string, status: number}>} Status code and a FeatureCollection in XML.
 */
function axiosFake () {
    return new Promise(resolve => resolve({status: 200, statusText: "OK", data: exampleFeatureCollection}));
}

describe("src/core/maps/store/actionsMapsZoomTo.js", () => {
    describe("zoomToFeatures", () => {
        let consoleErrorSpy,
            consoleWarnSpy,
            dispatch,
            rootGetters,
            param;

        beforeEach(() => {
            consoleErrorSpy = sinon.spy();
            consoleWarnSpy = sinon.spy();
            dispatch = sinon.spy();
            sinon.stub(console, "error").callsFake(consoleErrorSpy);
            sinon.stub(console, "warn").callsFake(consoleWarnSpy);

            param = {};
            rootGetters = {
                configJs: {}
            };
            rawLayerList.getLayerList().push({id, url: "", version: "", featureType: ""});
            rawLayerList.getLayerList().push({id: idDistrictLayer, url: "", version: "", featureType: ""});
        });

        afterEach(() => {
            sinon.restore();
            rawLayerList.getLayerList().length = 0;
        });
        it("should resolve with a reason if a config is given but no url parameter", () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            rootGetters.zoomTo = [{id: "zoomToFeatureId"}];
            actions.zoomToFeatures({dispatch, rootGetters}, param)
                .then(reason => {
                    expect(consoleWarnSpy.notCalled).to.be.true;
                    expect(consoleErrorSpy.notCalled).to.be.true;
                    expect(reason).to.equal("zoomTo: No url parameters were given by the user.");
                });
        });

        it("should throw an error and dispatch an alert if an error occurs while fetching the features", async () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            rootGetters.configJs = [{
                id: "zoomToGeometry",
                layerId: id,
                property: "flaechenid",
                allowedValues: [18, 26, 42]
            }];
            param.zoomToGeometry = "18,25";
            // NOTE: These sinon functions are needed here again to be able to add new behaviour to the axios.get method
            sinon.restore();
            sinon.stub(axios, "get").callsFake(() => new Promise((_, reject) => reject("Custom testing error!")));
            sinon.stub(console, "error").callsFake(consoleErrorSpy);
            sinon.stub(console, "warn").callsFake(consoleWarnSpy);
            await actions.zoomToFeatures({dispatch, rootGetters}, param);

            nextTick(() => {
                expect(consoleErrorSpy.notCalled).to.be.true;
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args.length).to.equal(3);
                expect(dispatch.firstCall.args).to.eql(["Alerting/addSingleAlert", "Custom testing error!", {root: true}]);
                expect(consoleWarnSpy.calledOnce).to.be.true;
                expect(consoleWarnSpy.firstCall.args.length).to.equal(1);
                expect(consoleWarnSpy.firstCall.args[0]).to.equal("zoomTo: No features were found for the given layer.");
            });
        });

        it("should add features to the map for one working config (zoomToFeatureId) and dispatch an alert for a configuration with an invalid id if both are present", async () => {
            sinon.stub(createStyle, "createStyle").returns(true);
            sinon.stub(axios, "get").callsFake(axiosFake);
            rootGetters.configJs = [{id: "somethingWrong"}, {
                id: "zoomToFeatureId",
                layerId: id,
                property: "flaechenid",
                styleId: "stylish"
            }];
            param.somethingWrong = "values";
            param.zoomToFeatureId = [18, 26];
            await actions.zoomToFeatures({dispatch, rootGetters}, param);

            nextTick(() => {
                expect(consoleWarnSpy.notCalled).to.be.true;
                expect(consoleErrorSpy.notCalled).to.be.true;
                expect(dispatch.calledThrice).to.be.true;
                expect(dispatch.firstCall.args.length).to.equal(3);
                expect(dispatch.firstCall.args[0]).to.equal("Maps/addLayerOnTop");
                expect(dispatch.firstCall.args[1] instanceof VectorLayer).to.be.true;
                expect(dispatch.firstCall.args[1].getSource().getFeatures().length).to.equal(2);
                expect(dispatch.firstCall.args[2]).to.eql({root: true});
                expect(dispatch.secondCall.args.length).to.equal(3);
                expect(dispatch.secondCall.args).to.eql(["Alerting/addSingleAlert", "utils.parametricURL.zoomTo", {root: true}]);
                expect(dispatch.thirdCall.args.length).to.equal(3);
                expect(dispatch.thirdCall.args[0]).to.equal("Maps/zoomToExtent");
                expect(dispatch.thirdCall.args[1] instanceof Object).to.be.true;
                expect(Object.prototype.hasOwnProperty.call(dispatch.thirdCall.args[1], "extent")).to.be.true;
                expect(dispatch.thirdCall.args[1].extent.length).to.equal(4);
                expect(dispatch.thirdCall.args[1].extent.every(val => typeof val === "number")).to.be.true;
                expect(dispatch.thirdCall.args[2]).to.eql({root: true});
            });
        });
        it("should add features to the map for one config of zoomToFeatureId", async () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            rootGetters.configJs = [{
                id: "zoomToFeatureId",
                layerId: id,
                property: "flaechenid",
                styleId: "stylish"
            }];
            param.zoomToFeatureId = [18, 26];
            await actions.zoomToFeatures({dispatch, rootGetters}, param);

            nextTick(() => {
                expect(consoleWarnSpy.notCalled).to.be.true;
                expect(consoleErrorSpy.notCalled).to.be.true;
                expect(dispatch.calledTwice).to.be.true;
                expect(dispatch.firstCall.args.length).to.equal(3);
                expect(dispatch.firstCall.args[0]).to.equal("Maps/addLayerOnTop");
                expect(dispatch.firstCall.args[1] instanceof VectorLayer).to.be.true;
                expect(dispatch.firstCall.args[1].getSource().getFeatures().length).to.equal(2);
                expect(dispatch.firstCall.args[2]).to.eql({root: true});
                expect(dispatch.secondCall.args.length).to.equal(3);
                expect(dispatch.secondCall.args[0]).to.equal("Maps/zoomToExtent");
                expect(dispatch.secondCall.args[1] instanceof Object).to.be.true;
                expect(Object.prototype.hasOwnProperty.call(dispatch.secondCall.args[1], "extent")).to.be.true;
                expect(dispatch.secondCall.args[1].extent.length).to.equal(4);
                expect(dispatch.secondCall.args[1].extent.every(val => typeof val === "number")).to.be.true;
                expect(dispatch.secondCall.args[2]).to.eql({root: true});
            });
        });
        it("should zoom to the feature extent but not add the features for one config of zoomToFeatureId with addFeatures set to false", async () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            rootGetters.configJs = [{
                id: "zoomToFeatureId",
                layerId: id,
                property: "flaechenid",
                styleId: "stylish",
                addFeatures: false
            }];
            param.zoomToFeatureId = [18, 26];
            await actions.zoomToFeatures({dispatch, rootGetters}, param);

            nextTick(() => {
                expect(consoleWarnSpy.notCalled).to.be.true;
                expect(consoleErrorSpy.notCalled).to.be.true;
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args.length).to.equal(3);
                expect(dispatch.firstCall.args[0]).to.equal("Maps/zoomToExtent");
                expect(dispatch.firstCall.args[1] instanceof Object).to.be.true;
                expect(Object.prototype.hasOwnProperty.call(dispatch.firstCall.args[1], "extent")).to.be.true;
                expect(dispatch.firstCall.args[1].extent.length).to.equal(4);
                expect(dispatch.firstCall.args[1].extent.every(val => typeof val === "number")).to.be.true;
                expect(dispatch.firstCall.args[2]).to.eql({root: true});
            });
        });
        it("should add features to the map for one config of zoomToGeometry", async () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            rootGetters.configJs = [{
                id: "zoomToGeometry",
                layerId: id,
                property: "flaechenid",
                allowedValues: [18, 26, 42]
            }];
            param.zoomToGeometry = "18,25";
            await actions.zoomToFeatures({dispatch, rootGetters}, param);

            nextTick(() => {
                expect(consoleWarnSpy.notCalled).to.be.true;
                expect(consoleErrorSpy.notCalled).to.be.true;
                expect(dispatch.calledTwice).to.be.true;
                expect(dispatch.firstCall.args.length).to.equal(3);
                expect(dispatch.firstCall.args[0]).to.equal("Maps/addLayerOnTop");
                expect(dispatch.firstCall.args[1] instanceof VectorLayer).to.be.true;
                expect(dispatch.firstCall.args[1].getSource().getFeatures().length).to.equal(1);
                expect(dispatch.firstCall.args[2]).to.eql({root: true});
                expect(dispatch.secondCall.args.length).to.equal(3);
                expect(dispatch.secondCall.args[0]).to.equal("Maps/zoomToExtent");
                expect(dispatch.secondCall.args[1] instanceof Object).to.be.true;
                expect(Object.prototype.hasOwnProperty.call(dispatch.secondCall.args[1], "extent")).to.be.true;
                expect(dispatch.secondCall.args[1].extent.length).to.equal(4);
                expect(dispatch.secondCall.args[1].extent.every(val => typeof val === "number")).to.be.true;
                expect(dispatch.secondCall.args[2]).to.eql({root: true});
            });
        });
        it("should zoom to the feature extent but not add the features for one config of zoomToGeometry with addFeatures set to false", async () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            rootGetters.configJs = [{
                id: "zoomToGeometry",
                layerId: id,
                property: "flaechenid",
                allowedValues: [18, 26, 42],
                addFeatures: false
            }];
            param.zoomToGeometry = "18,25";
            await actions.zoomToFeatures({dispatch, rootGetters}, param);

            nextTick(() => {
                expect(consoleWarnSpy.notCalled).to.be.true;
                expect(consoleErrorSpy.notCalled).to.be.true;
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.firstCall.args.length).to.equal(3);
                expect(dispatch.firstCall.args[0]).to.equal("Maps/zoomToExtent");
                expect(dispatch.firstCall.args[1] instanceof Object).to.be.true;
                expect(Object.prototype.hasOwnProperty.call(dispatch.firstCall.args[1], "extent")).to.be.true;
                expect(dispatch.firstCall.args[1].extent.length).to.equal(4);
                expect(dispatch.firstCall.args[1].extent.every(val => typeof val === "number")).to.be.true;
                expect(dispatch.firstCall.args[2]).to.eql({root: true});
            });
        });
        it("should add features to the map for one config of zoomToFeatureId and one of zoomToGeometry", async () => {
            sinon.stub(axios, "get").callsFake(axiosFake);
            rootGetters.configJs = [
                {
                    id: "zoomToFeatureId",
                    layerId: id,
                    property: "flaechenid",
                    styleId: "stylish"
                },
                {
                    id: "zoomToGeometry",
                    layerId: id,
                    property: "flaechenid",
                    allowedValues: [18, 26, 42]
                }
            ];
            param.zoomToFeatureId = [18];
            param.zoomToGeometry = "24,42";
            await actions.zoomToFeatures({dispatch, rootGetters}, param);

            nextTick(() => {
                expect(consoleWarnSpy.notCalled).to.be.true;
                expect(consoleErrorSpy.notCalled).to.be.true;
                expect(dispatch.calledThrice).to.be.true;
                expect(dispatch.firstCall.args.length).to.equal(3);
                expect(dispatch.firstCall.args[0]).to.equal("Maps/addLayerOnTop");
                expect(dispatch.firstCall.args[1] instanceof VectorLayer).to.be.true;
                expect(dispatch.firstCall.args[1].getSource().getFeatures().length).to.equal(1);
                expect(dispatch.firstCall.args[2]).to.eql({root: true});
                expect(dispatch.secondCall.args.length).to.equal(3);
                expect(dispatch.secondCall.args[0]).to.equal("Maps/addLayerOnTop");
                expect(dispatch.secondCall.args[1] instanceof VectorLayer).to.be.true;
                expect(dispatch.secondCall.args[1].getSource().getFeatures().length).to.equal(1);
                expect(dispatch.secondCall.args[2]).to.eql({root: true});
                expect(dispatch.thirdCall.args.length).to.equal(3);
                expect(dispatch.thirdCall.args[0]).to.equal("Maps/zoomToExtent");
                expect(dispatch.thirdCall.args[1] instanceof Object).to.be.true;
                expect(Object.prototype.hasOwnProperty.call(dispatch.thirdCall.args[1], "extent")).to.be.true;
                expect(dispatch.thirdCall.args[1].extent.length).to.equal(4);
                expect(dispatch.thirdCall.args[1].extent.every(val => typeof val === "number")).to.be.true;
                expect(dispatch.thirdCall.args[2]).to.eql({root: true});
            });
        });
    });
});
