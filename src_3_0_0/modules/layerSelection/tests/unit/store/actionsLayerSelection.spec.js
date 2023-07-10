import {expect} from "chai";
import sinon from "sinon";

import actions from "../../../store/actionsLayerSelection";

const {updateLayerTree, navigateForward, navigateBack, reset} = actions;

describe("src_3_0_0/modules/layerSelection/store/actionsLayerSelection", () => {
    let commit,
        dispatch,
        getters,
        rootGetters;

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
        getters = {
            layersToAdd: ["1", "2"],
            menuSide: "mainMenu"
        };
        rootGetters = {
            determineZIndex: () => 0,
            isBaselayer: (id) => id === "100",
            layerConfigsByAttributes: () => []
        };
    });

    afterEach(sinon.restore);

    describe("updateLayerTree", () => {
        it("updateLayerTree for two layers", () => {
            const expectedArg = {
                layerConfigs: [
                    {
                        id: "1",
                        layer: {
                            id: "1",
                            visibility: true,
                            showInLayerTree: true,
                            zIndex: 0
                        }
                    },
                    {
                        id: "2",
                        layer: {
                            id: "2",
                            visibility: true,
                            showInLayerTree: true,
                            zIndex: 1
                        }
                    }
                ]
            };

            updateLayerTree({commit, dispatch, getters, rootGetters});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.be.equals("clearLayerSelection");
            expect(commit.firstCall.args[1]).to.be.undefined;
            expect(commit.secondCall.args[0]).to.be.equals("Menu/switchToRoot");
            expect(commit.secondCall.args[1]).to.be.equals("mainMenu");

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.be.equals("replaceByIdInLayerConfig");
            expect(dispatch.firstCall.args[1]).to.deep.equals(expectedArg);
        });

        it("updateLayerTree for one layer and one baselayer", () => {
            getters = {
                layersToAdd: ["100", "2"],
                menuSide: "mainMenu"
            };

            rootGetters.layerConfigsByAttributes = () => [
                {
                    id: "100",
                    baselayer: true,
                    visibility: true,
                    showInLayerTree: true,
                    zIndex: 1
                },
                {
                    id: "2",
                    visibility: true,
                    showInLayerTree: true,
                    zIndex: 0
                }
            ];

            updateLayerTree({commit, dispatch, getters, rootGetters});

            expect(commit.calledTwice).to.be.true;
            expect(commit.firstCall.args[0]).to.be.equals("clearLayerSelection");
            expect(commit.firstCall.args[1]).to.be.undefined;
            expect(commit.secondCall.args[0]).to.be.equals("Menu/switchToRoot");
            expect(commit.secondCall.args[1]).to.be.equals("mainMenu");

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.be.equals("updateLayerConfigZIndex");
            expect(dispatch.firstCall.args[1]).to.deep.equals({
                layerContainer: [
                    {
                        id: "100",
                        baselayer: true,
                        visibility: true,
                        showInLayerTree: true,
                        zIndex: 1
                    },
                    {
                        id: "2",
                        visibility: true,
                        showInLayerTree: true,
                        zIndex: 0
                    }
                ],
                maxZIndex: 1
            });
            expect(dispatch.secondCall.args[0]).to.be.equals("replaceByIdInLayerConfig");
            expect(dispatch.secondCall.args[1]).to.deep.equals({
                layerConfigs: [
                    {
                        id: "100",
                        layer: {
                            id: "100",
                            visibility: true,
                            showInLayerTree: true,
                            zIndex: 2
                        }
                    },
                    {
                        id: "2",
                        layer: {
                            id: "2",
                            visibility: true,
                            showInLayerTree: true,
                            zIndex: 0
                        }
                    }
                ]
            });
        });
    });

    describe("actionsLayerSelection", () => {
        it("navigateForward from layerTree", () => {
            const subjectDataLayerConfs = [
                    {
                        id: "1",
                        type: "folder",
                        name: "name1"
                    },
                    {
                        id: "2",
                        type: "folder",
                        name: "name2"
                    },
                    {
                        id: "3",
                        type: "layer",
                        name: "name3"
                    }
                ],
                baselayerConfs = [
                    {
                        id: "bg1",
                        type: "layer",
                        name: "name-bg1"
                    },
                    {
                        id: "bg2",
                        type: "layer",
                        name: "name-bg2"
                    }
                ],
                lastFolderName = "lastFolderName";

            navigateForward({commit}, {lastFolderName, subjectDataLayerConfs, baselayerConfs});

            expect(commit.callCount).to.be.equals(3);
            expect(commit.firstCall.args[0]).to.be.equals("addToLayerSelection");
            expect(commit.firstCall.args[1]).to.be.deep.equals({lastFolderName, subjectDataLayerConfs, baselayerConfs});
            expect(commit.secondCall.args[0]).to.be.equals("setBaselayerConfs");
            expect(commit.secondCall.args[1]).to.be.deep.equals(baselayerConfs);
            expect(commit.thirdCall.args[0]).to.be.equals("setSubjectDataLayerConfs");
            expect(commit.thirdCall.args[1]).to.be.deep.equals(subjectDataLayerConfs);
        });

        it("navigateBack inside layerSelection", () => {
            const lastSubjectDataLayerConfs = [
                    {
                        id: "0",
                        type: "folder",
                        name: "name0"
                    }
                ],
                firstSubjectDataLayerConfs = [
                    {
                        id: "00",
                        type: "folder",
                        name: "name00"
                    }
                ],
                lastBaselayerConfs = [
                    {
                        id: "bg0",
                        type: "layer",
                        name: "name-bg0"
                    }
                ],
                firstBaselayerConfs = [
                    {
                        id: "bg00",
                        type: "layer",
                        name: "name-bg00"
                    }
                ],
                firstFolderName = "firstFolderName",
                secondFolderName = "secondFolderName";

            getters = {
                lastFolderNames: [firstFolderName, secondFolderName],
                lastSubjectDataLayerConfs: [firstBaselayerConfs, lastSubjectDataLayerConfs],
                lastBaselayerConfs: [firstSubjectDataLayerConfs, lastBaselayerConfs]
            };

            navigateBack({commit, getters});

            expect(commit.callCount).to.be.equals(3);
            expect(commit.firstCall.args[0]).to.be.equals("reduceToPreviousLayerSelection");
            expect(commit.secondCall.args[0]).to.be.equals("setSubjectDataLayerConfs");
            expect(commit.secondCall.args[1]).to.be.deep.equals(lastSubjectDataLayerConfs);
            expect(commit.thirdCall.args[0]).to.be.equals("setBaselayerConfs");
            expect(commit.thirdCall.args[1]).to.be.deep.equals(lastBaselayerConfs);
        });

        it("reset", () => {
            reset({commit});

            expect(commit.callCount).to.be.equals(3);
            expect(commit.firstCall.args[0]).to.be.equals("clearLayerSelection");
            expect(commit.secondCall.args[0]).to.be.equals("setSubjectDataLayerConfs");
            expect(commit.secondCall.args[1]).to.be.deep.equals([]);
            expect(commit.thirdCall.args[0]).to.be.equals("setBaselayerConfs");
            expect(commit.thirdCall.args[1]).to.be.deep.equals([]);
        });
    });
});
