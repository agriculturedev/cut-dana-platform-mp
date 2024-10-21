import {expect} from "chai";
import sinon from "sinon";
import prepareFeaturePropertiesModule from "../../../js/prepareFeatureProperties";
import actionsWfst from "../../../store/actionsWfst";
import wfs from "@masterportal/masterportalapi/src/layer/wfs";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import layerCollection from "../../../../../core/layers/js/layerCollection";


describe("src/modules/wfst/store/actionsWfst.js", () => {
    let commit,
        map,
        dispatch,
        getters,
        rootGetters;

    before(() => {
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
        map = {
            id: "ol",
            mode: "2D",
            getLayers: () => {
                return {
                    getArray: () => []
                };
            },
            removeLayer: sinon.stub()
        };
        mapCollection.clear();
        mapCollection.addMap(map, "2D");
    });
    afterEach(sinon.restore);

    describe("reset", () => {
        const featurePropertiesSymbol = Symbol("featureProperties");
        let setVisibleSpy;

        beforeEach(() => {
            getters = {
                currentLayerId: "",
                featureProperties: featurePropertiesSymbol
            };
            setVisibleSpy = sinon.spy();
            rootGetters = {
                "Maps/getLayerById": () => ({
                    setVisible: setVisibleSpy
                })
            };
        });

        it("should reset all values to its default state", () => {
            actionsWfst.reset({commit, dispatch, getters, rootGetters});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args.length).to.equal(2);
            expect(commit.firstCall.args[0]).to.equal("setFeatureProperties");
            expect(commit.firstCall.args[1]).to.equal(featurePropertiesSymbol);
            expect(commit.secondCall.args.length).to.equal(2);
            expect(commit.secondCall.args[0]).to.equal("setSelectedInteraction");
            expect(commit.secondCall.args[1]).to.equal(null);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(1);
            expect(dispatch.firstCall.args[0]).to.equal("clearInteractions");
        });
        it("should reset all values to its default state and activate the current layer if it was previously unselected", () => {
            getters.featureProperties = [{symbol: featurePropertiesSymbol}];

            actionsWfst.reset({commit, dispatch, getters, rootGetters});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args.length).to.equal(2);
            expect(commit.firstCall.args[0]).to.equal("setFeatureProperties");
            expect(Array.isArray(commit.firstCall.args[1])).to.be.true;
            expect(commit.firstCall.args[1].length).to.equal(1);
            expect(commit.firstCall.args[1][0]).to.eql({symbol: featurePropertiesSymbol, value: null});
            expect(commit.secondCall.args.length).to.equal(2);
            expect(commit.secondCall.args[0]).to.equal("setSelectedInteraction");
            expect(commit.secondCall.args[1]).to.equal(null);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(1);
            expect(dispatch.firstCall.args[0]).to.equal("clearInteractions");
        });
    });
    describe("sendTransaction", () => {
        const layer = {
                id: "0",
                url: "some.good.url",
                isSecured: false,
                useProxy: false
            },
            feature = new Feature({
                geometry: new Polygon([
                    [
                        [
                            9.17782024967994,
                            50.20836600730087
                        ],
                        [
                            9.200676227149245,
                            50.20836600730087
                        ],
                        [
                            9.200676227149245,
                            50.20873353776312
                        ],
                        [
                            9.17782024967994,
                            50.20873353776312
                        ],
                        [
                            9.17782024967994,
                            50.20836600730087
                        ]
                    ]]),
                name: "My Polygon"
            });

        let fakeSendTransaction,
            refreshSpy,
            consoleSpy;

        beforeEach(() => {
            getters = {
                currentLayerIndex: 0,
                layerInformation: [layer],
                selectedInteraction: "insert"
            };
            fakeSendTransaction = sinon.stub(wfs, "sendTransaction");
            refreshSpy = sinon.spy();
            layer.getLayerSource = () => ({refresh: refreshSpy});
            sinon.stub(layerCollection, "getLayerById").returns(layer);
            consoleSpy = sinon.spy();
            sinon.stub(console, "error").callsFake(consoleSpy);
        });
        afterEach(() => {
            sinon.restore();
        });
        it("should send a request to the api and it should return the inserted feature", async () => {
            fakeSendTransaction.resolves(feature);
            const response = await actionsWfst.sendTransaction({dispatch, getters, rootGetters}, feature);

            expect(fakeSendTransaction.calledOnce).to.be.true;
            expect(response).to.deep.equal(feature);

            expect(consoleSpy.notCalled).to.be.true;

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(1);
            expect(dispatch.firstCall.args[0]).to.equal("reset");
            expect(dispatch.secondCall.args.length).to.equal(3);
            expect(dispatch.secondCall.args[0]).to.equal("Alerting/addSingleAlert");
        });
        it("should send a request to the api and it should return the updated feature", async () => {
            getters.selectedInteraction = "selectedUpdate";

            fakeSendTransaction.resolves(feature);
            const response = await actionsWfst.sendTransaction({dispatch, getters, rootGetters}, feature);

            expect(fakeSendTransaction.calledOnce).to.be.true;
            expect(response).to.deep.equal(feature);

            expect(consoleSpy.notCalled).to.be.true;

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(1);
            expect(dispatch.firstCall.args[0]).to.equal("reset");
            expect(dispatch.secondCall.args.length).to.equal(3);
            expect(dispatch.secondCall.args[0]).to.equal("Alerting/addSingleAlert");
        });
        it("should send an request to the api and show an alert with a success message for a delete transaction", async () => {
            getters.selectedInteraction = "delete";

            fakeSendTransaction.resolves(feature);
            const response = await actionsWfst.sendTransaction({dispatch, getters, rootGetters}, feature);

            expect(fakeSendTransaction.calledOnce).to.be.true;
            expect(response).to.deep.equal(feature);

            expect(consoleSpy.notCalled).to.be.true;

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(1);
            expect(dispatch.firstCall.args[0]).to.equal("reset");
            expect(dispatch.secondCall.args.length).to.equal(3);
            expect(dispatch.secondCall.args[0]).to.equal("Alerting/addSingleAlert");
        });
        it("should show an error message and return null if wfs.sendTransaction fails", async () => {
            const error = new Error("Transaction failed");
            let response = null;

            fakeSendTransaction.throws(error);
            response = await actionsWfst.sendTransaction({dispatch, getters, rootGetters}, feature);

            expect(fakeSendTransaction.calledOnce).to.be.true;
            expect(response).to.equal(null);
            expect(consoleSpy.notCalled).to.be.true;
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(3);
            expect(dispatch.firstCall.args[0]).to.equal("Alerting/addSingleAlert");
            expect(dispatch.firstCall.args[1]).to.eql({
                category: "Info",
                displayClass: "info",
                content: "Error: Transaction failed",
                mustBeConfirmed: false
            });
            expect(dispatch.firstCall.args[2]).to.eql({root: true});
            expect(dispatch.secondCall.args.length).to.equal(1);
            expect(dispatch.secondCall.args[0]).to.equal("reset");
        });
    });
    describe("setFeatureProperty", () => {
        let featureProperty;

        beforeEach(() => {
            featureProperty = {
                type: "number",
                value: "3",
                key: "specialKey"
            };
        });

        it("should commit the property if the type is fitting to the value", () => {
            actionsWfst.setFeatureProperty({commit, dispatch}, featureProperty);

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args.length).to.equal(2);
            expect(commit.firstCall.args[0]).to.equal("setFeatureProperty");
            expect(commit.firstCall.args[1]).to.eql({key: featureProperty.key, value: featureProperty.value});
            expect(dispatch.notCalled).to.be.true;
        });
        it("should dispatch an alert if the type is a number but the converted value is not", () => {
            featureProperty.value = "noNumber";

            actionsWfst.setFeatureProperty({commit, dispatch}, featureProperty);

            expect(commit.notCalled).to.be.true;
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args.length).to.equal(3);
            expect(dispatch.firstCall.args[0]).to.equal("Alerting/addSingleAlert");
            expect(dispatch.firstCall.args[1]).to.eql({
                category: "error",
                content: "modules.wfst.error.onlyNumbersAllowed",
                mustBeConfirmed: false
            });
            expect(dispatch.firstCall.args[2]).to.eql({root: true});
        });
    });
    describe("setFeatureProperties", () => {
        let prepareFeaturePropertiesSpy;

        beforeEach(() => {
            getters = {
                currentLayerIndex: 0,
                layerInformation: [{}]
            };
            prepareFeaturePropertiesSpy = sinon.spy();
            sinon.stub(prepareFeaturePropertiesModule, "prepareFeatureProperties").callsFake(prepareFeaturePropertiesSpy);
        });

        it("should commit featureProperties on basis of the layer if a layer is selected that has a featurePrefix configured and is selected in the layer tree", async () => {
            getters.layerInformation[0].featurePrefix = "pre";
            getters.layerInformation[0].visibility = true;

            await actionsWfst.setFeatureProperties({commit, getters});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args.length).to.equal(2);
            expect(commit.firstCall.args[0]).to.equal("setFeatureProperties");
            expect(prepareFeaturePropertiesSpy.calledOnce).to.be.true;
        });
        it("should commit an error message if no layer is currently selected", async () => {
            getters.currentLayerIndex = -1;

            await actionsWfst.setFeatureProperties({commit, getters});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args.length).to.equal(2);
            expect(commit.firstCall.args[0]).to.equal("setFeatureProperties");
            expect(commit.firstCall.args[1]).to.equal("modules.wfst.error.allLayersNotSelected");
            expect(prepareFeaturePropertiesSpy.notCalled).to.be.true;
        });
        it("should commit an error message if the currently selected layer has no featurePrefix configured", async () => {
            await actionsWfst.setFeatureProperties({commit, getters});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args.length).to.equal(2);
            expect(commit.firstCall.args[0]).to.equal("setFeatureProperties");
            expect(commit.firstCall.args[1]).to.equal("modules.wfst.error.layerNotConfiguredCorrectly");
            expect(prepareFeaturePropertiesSpy.notCalled).to.be.true;
        });
        it("should commit an error message if the currently selected layer is not selected in the layer tree", async () => {
            getters.layerInformation[0].featurePrefix = "pre";
            getters.layerInformation[0].isSelected = false;

            await actionsWfst.setFeatureProperties({commit, getters});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args.length).to.equal(2);
            expect(commit.firstCall.args[0]).to.equal("setFeatureProperties");
            expect(commit.firstCall.args[1]).to.equal("modules.wfst.error.layerNotSelected");
            expect(prepareFeaturePropertiesSpy.notCalled).to.be.true;
        });
    });
});
