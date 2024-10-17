import {expect} from "chai";
import sinon from "sinon";
import testAction from "../../../../../../devtools/tests/VueTestUtils";
import actions from "../../../store/actionsLayerInformation";
import getCswRecordById from "../../../../../shared/js/api/getCswRecordById";

const {startLayerInformation, additionalSingleLayerInfo, setMetadataURL} = actions;

describe("src/modules/layerInformation/store/actionsLayerInformation.js", () => {
    let getters = {},
        rootGetters,
        commit,
        dispatch;

    beforeEach(() => {
        dispatch = sinon.spy();
        commit = sinon.spy();
    });

    describe("initialize the store", () => {
        let layerConf,
            menuExpanded,
            isMobile;

        beforeEach(() => {
            isMobile = false;
            menuExpanded = true;
            layerConf = {
                id: "123",
                metaID: "layerMetaId",
                layername: "name",
                name: "name of the layer",
                url: "google.de",
                urlIsVisible: true,
                datasets: [
                    {
                        md_id: "123",
                        md_name: "MDName"
                    }
                ]
            };

            rootGetters = {
                "Modules/Legend/layerInfoLegend": {
                    id: "123"
                },
                isMobile: () => isMobile,
                "Menu/expanded": () => menuExpanded
            };

        });
        it("should initialize the LayerInformation", () => {
            startLayerInformation({commit, dispatch, rootGetters}, layerConf);
            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setLegendAvailable");
            expect(commit.firstCall.args[1]).to.be.equals(true);
            expect(commit.secondCall.args[0]).to.equal("setLayerInfo");
            expect(commit.secondCall.args[1]).to.be.deep.equals(layerConf);


            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("Menu/changeCurrentComponent");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({
                type: "layerInformation",
                side: "mainMenu",
                props: {name: layerConf.datasets[0].md_name}
            });
            expect(dispatch.secondCall.args[0]).to.equal("setMetadataURL");
            expect(dispatch.secondCall.args[1]).to.be.equals(layerConf.datasets[0].md_id);
            expect(dispatch.thirdCall.args[0]).to.equal("additionalSingleLayerInfo");
        });
        it("should initialize the LayerInformation with name of layer", () => {
            delete layerConf.datasets[0].md_name;
            startLayerInformation({commit, dispatch, rootGetters}, layerConf);
            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setLegendAvailable");
            expect(commit.firstCall.args[1]).to.be.equals(true);
            expect(commit.secondCall.args[0]).to.equal("setLayerInfo");
            expect(commit.secondCall.args[1]).to.be.deep.equals(layerConf);


            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("Menu/changeCurrentComponent");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({
                type: "layerInformation",
                side: "mainMenu",
                props: {name: "name of the layer"}
            });
            expect(dispatch.secondCall.args[0]).to.equal("setMetadataURL");
            expect(dispatch.secondCall.args[1]).to.be.equals(layerConf.datasets[0].md_id);
            expect(dispatch.thirdCall.args[0]).to.equal("additionalSingleLayerInfo");
        });
        it("should initialize the LayerInformation and create legend", () => {
            layerConf.legendURL = "https://legend.de";
            layerConf.id = "another";

            startLayerInformation({commit, dispatch, rootGetters}, layerConf);
            expect(commit.calledThrice).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setLegendAvailable");
            expect(commit.firstCall.args[1]).to.be.equals(true);
            expect(commit.secondCall.args[0]).to.equal("Modules/Legend/setLayerInfoLegend");
            expect(commit.secondCall.args[1]).to.be.deep.equals({});
            expect(commit.thirdCall.args[0]).to.equal("setLayerInfo");
            expect(commit.thirdCall.args[1]).to.be.deep.equals(layerConf);


            expect(dispatch.callCount).to.be.equals(4);
            expect(dispatch.firstCall.args[0]).to.equal("Modules/Legend/createLegendForLayerInfo");
            expect(dispatch.firstCall.args[1]).to.equal(layerConf.id);

            expect(dispatch.secondCall.args[0]).to.equal("Menu/changeCurrentComponent");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals({
                type: "layerInformation",
                side: "mainMenu",
                props: {name: layerConf.datasets[0].md_name}
            });
            expect(dispatch.thirdCall.args[0]).to.equal("setMetadataURL");
            expect(dispatch.thirdCall.args[1]).to.be.equals(layerConf.datasets[0].md_id);
            expect(dispatch.getCall(3).args[0]).to.equal("additionalSingleLayerInfo");
        });

        it("should toggle the LayerInformation in menu if mobile", () => {
            isMobile = true;
            menuExpanded = false;
            startLayerInformation({commit, dispatch, rootGetters}, layerConf);
            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setLegendAvailable");
            expect(commit.firstCall.args[1]).to.be.equals(true);
            expect(commit.secondCall.args[0]).to.equal("setLayerInfo");
            expect(commit.secondCall.args[1]).to.be.deep.equals(layerConf);

            expect(dispatch.callCount).to.be.equals(4);
            expect(dispatch.firstCall.args[0]).to.equal("Menu/toggleMenu");
            expect(dispatch.firstCall.args[1]).to.equal("mainMenu");

            expect(dispatch.secondCall.args[0]).to.equal("Menu/changeCurrentComponent");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals({
                type: "layerInformation",
                side: "mainMenu",
                props: {name: layerConf.datasets[0].md_name}
            });
            expect(dispatch.thirdCall.args[0]).to.equal("setMetadataURL");
            expect(dispatch.thirdCall.args[1]).to.be.equals(layerConf.datasets[0].md_id);
            expect(dispatch.getCall(3).args[0]).to.equal("additionalSingleLayerInfo");
        });

        it("should initialize the other abstract layer infos", done => {
            const state = {
                layerInfo: {
                    cswUrl: "https://metaver.de/csw",
                    metaID: "73A344E9-CDB5-4A17-89C1-05E202989755"
                }
            };

            // action, payload, state, rootState, expectedMutationsAndActions, getters = {}, done
            testAction(additionalSingleLayerInfo, null, state, {}, [
                {type: "getAbstractInfo", payload: {attributes: state.layerInfo.attributes, metaId: state.layerInfo.metaID, cswUrl: state.layerInfo.cswUrl, customMetadata: state.layerInfo.customMetadata}, dispatch: true}
            ], {}, done);

        });

        it("should set the Meta Data URLs", done => {
            const metaId = "73A344E9-CDB5-4A17-89C1-05E202989755",
                state = {
                    layerInfo: {
                        "id": "123",
                        "metaID": "layerMetaId",
                        "layername": "name",
                        "url": "google.de",
                        "urlIsVisible": true
                    },
                    metaDataCatalogueId: "2"
                },
                metaURLs = ["https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid=73A344E9-CDB5-4A17-89C1-05E202989755"];

            testAction(setMetadataURL, metaId, state, {}, [
                {type: "setMetaURLs", payload: metaURLs}
            ], {}, done, {
                restServiceById: id => id === "2" ? {url: "https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid="} : {}
            });

        });

        it("should use showDocUrl if set", done => {
            const state = {
                layerInfo: {
                    "id": "123",
                    "metaID": "73A344E9-CDB5-4A17-89C1-05E202989755",
                    "layername": "name",
                    "url": "google.de",
                    "urlIsVisible": true,
                    "cswUrl": "https://metaver.de/csw",
                    "showDocUrl": "https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid="
                },
                metaDataCatalogueId: "2"
            };

            testAction(setMetadataURL, "73A344E9-CDB5-4A17-89C1-05E202989755", state, {}, [
                {type: "setMetaURLs", payload: ["https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid=73A344E9-CDB5-4A17-89C1-05E202989755"]}
            ], {}, done, {
                restServiceById: id => id === "2" ? {url: "https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid="} : {}
            });

        });

        it("should use the url from metaDataCatalogueId if showDocUrl is not set", done => {
            const state = {
                    layerInfo: {
                        "id": "123",
                        "metaID": "73A344E9-CDB5-4A17-89C1-05E202989755",
                        "layername": "name",
                        "url": "google.de",
                        "urlIsVisible": true,
                        "cswUrl": "https://metaver.de/csw"
                    },
                    metaDataCatalogueId: "2"
                },
                metaURLs = ["https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid=73A344E9-CDB5-4A17-89C1-05E202989755"];

            testAction(setMetadataURL, "73A344E9-CDB5-4A17-89C1-05E202989755", state, {}, [
                {type: "setMetaURLs", payload: metaURLs}
            ], {}, done, {
                restServiceById: id => id === "2" ? {url: "https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid="} : {}
            });
        });

    });

    describe("restoreFromUrlParams", () => {
        let attributes,
            layerConfig;

        beforeEach(() => {
            attributes = {
                layerInfo: {
                    id: "layerId"
                }
            };
            layerConfig = {
                id: "layerId",
                name: "name"
            };
            getters = {
                type: "layerInformation"
            };
            rootGetters = {
                layerConfigById: () => layerConfig,
                styleListLoaded: true
            };
        });

        it("styleListLoaded = true, start layer info", () => {
            actions.restoreFromUrlParams({getters, dispatch, rootGetters}, attributes);
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("Menu/updateComponentState");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({type: "LayerInformation", attributes});
            expect(dispatch.secondCall.args[0]).to.equal("Modules/LayerInformation/startLayerInformation");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals(layerConfig);
        });
        it("styleListLoaded = false, wait and start layer info", () => {
            rootGetters.styleListLoaded = false;
            actions.restoreFromUrlParams({getters, dispatch, rootGetters}, attributes);
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equal("Menu/updateComponentState");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({type: "LayerInformation", attributes});
            expect(dispatch.secondCall.args[0]).to.equal("waitAndRestoreLayerInformation");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals(layerConfig);
        });


    });
    describe("getAbstractInfo", () => {
        it("should show the about module in menu", async () => {
            const metaInfo = {
                    metaId: "73A344E9-CDB5-4A17-89C1-05E202989755",
                    cswUrl: "https://metaver.de/csw"
                },
                state = {
                    metaId: "portalId",
                    cswUrl: "test.de",
                    downloadLinks: []
                },
                cswReturn = {
                    getTitle: () => "name",
                    getAbstract: () => "abstract",
                    getFrequenzy: () => "123",
                    getDownloadLinks: () => [],
                    getPublicationDate: () => "thisIsADate",
                    getContact: () => "contact",
                    getPublisher: () => "publisher"
                };

            sinon.stub(getCswRecordById, "getRecordById").returns(cswReturn);

            await actions.getAbstractInfo({commit, dispatch, state, rootGetters}, metaInfo);

            expect(commit.callCount).to.be.equal(9);
            expect(commit.firstCall.args[0]).to.equal("setDownloadLinks");
            expect(commit.firstCall.args[1]).to.be.deep.equals(null);
            expect(commit.secondCall.args[0]).to.equal("setTitle");
            expect(commit.secondCall.args[1]).to.be.deep.equals("name");
            expect(commit.thirdCall.args[0]).to.equal("setAbstractText");
            expect(commit.thirdCall.args[1]).to.be.deep.equals("abstract");
            expect(commit.getCall(3).args[0]).to.equal("setPeriodicityKey");
            expect(commit.getCall(3).args[1]).to.be.deep.equals("123");
            expect(commit.getCall(4).args[0]).to.equal("setDownloadLinks");
            expect(commit.getCall(4).args[1]).to.be.deep.equals([]);
            expect(commit.getCall(5).args[0]).to.equal("setDatePublication");
            expect(commit.getCall(5).args[1]).to.be.deep.equals("thisIsADate");
            expect(commit.getCall(6).args[0]).to.equal("setPointOfContact");
            expect(commit.getCall(6).args[1]).to.be.deep.equals("contact");
            expect(commit.getCall(7).args[0]).to.equal("setPublisher");
            expect(commit.getCall(7).args[1]).to.be.deep.equals("publisher");
            expect(commit.getCall(8).args[0]).to.equal("setDownloadLinks");
            expect(commit.getCall(8).args[1]).to.be.deep.equals([]);
        });
        it("ensures that downloadLinks is set to null", () => {
            const metaInfo = {},
                state = {};

            actions.getAbstractInfo({commit, dispatch, state, rootGetters}, metaInfo);

            expect(commit.callCount).to.be.equal(8);
            expect(commit.firstCall.args[0]).to.equal("setDownloadLinks");
            expect(commit.firstCall.args[1]).to.be.deep.equals(null);
        });
    });
});
