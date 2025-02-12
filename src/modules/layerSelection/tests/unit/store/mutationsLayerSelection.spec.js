import {expect} from "chai";

import mutations from "../../../store/mutationsLayerSelection";

const {clearLayerSelection, reduceToPreviousLayerSelection, addToLayerSelection} = mutations;

describe("src/modules/layerSelection/store/mutationsLayerSelection", function () {
    describe("clearLayerSelection", function () {
        it("Clears layerSelection", function () {
            const state = {
                lastFolderNames: ["1", "2"],
                lastSubjectDataLayerConfs: [{id: "1"}, {id: "2"}],
                lastBaselayerConfs: [{id: "1"}, {id: "2"}]
            };

            clearLayerSelection(state);
            expect(state.lastFolderNames).to.be.deep.equals([]);
            expect(state.lastSubjectDataLayerConfs).to.be.deep.equals([]);
            expect(state.lastBaselayerConfs).to.be.deep.equals([]);
        });
    });

    describe("reduceToPreviousLayerSelection", function () {
        it("does not fail if navigation arrays are empty", function () {
            const state = {
                lastFolderNames: [],
                lastSubjectDataLayerConfs: [],
                lastBaselayerConfs: []
            };

            reduceToPreviousLayerSelection(state);
            expect(state.lastFolderNames.length).to.be.equals(0);
            expect(state.lastSubjectDataLayerConfs.length).to.be.equals(0);
            expect(state.lastBaselayerConfs.length).to.be.equals(0);
        });

        it("removes last entry from navigation arrays", function () {
            const state = {
                lastFolderNames: ["1", "2"],
                lastSubjectDataLayerConfs: [{id: "1"}, {id: "2"}],
                lastBaselayerConfs: [{id: "bg1"}, {id: "bg2"}]
            };

            reduceToPreviousLayerSelection(state);
            expect(state.lastFolderNames.length).to.be.equals(1);
            expect(state.lastFolderNames[0]).to.be.equals("1");
            expect(state.lastSubjectDataLayerConfs.length).to.be.equals(1);
            expect(state.lastSubjectDataLayerConfs[0]).to.be.deep.equals({id: "1"});
            expect(state.lastBaselayerConfs.length).to.be.equals(1);
            expect(state.lastBaselayerConfs[0]).to.be.deep.equals({id: "bg1"});
        });
    });

    describe("addToLayerSelection", function () {
        it("addToLayerSelection", function () {
            const state = {
                    lastFolderNames: [],
                    lastSubjectDataLayerConfs: [],
                    lastBaselayerConfs: []
                },
                lastFolderName = "lastFolderName",
                subjectDataLayerConfs = [{id: "1"}, {id: "2"}],
                baselayerConfs = [{id: "bg1"}, {id: "bg2"}];

            addToLayerSelection(state, {lastFolderName, subjectDataLayerConfs, baselayerConfs});
            expect(state.lastFolderNames.length).to.be.equals(1);
            expect(state.lastFolderNames[0]).to.be.equals(lastFolderName);
            expect(state.lastSubjectDataLayerConfs.length).to.be.equals(1);
            expect(state.lastSubjectDataLayerConfs[0]).to.be.deep.equals(subjectDataLayerConfs);
            expect(state.lastBaselayerConfs.length).to.be.equals(1);
            expect(state.lastBaselayerConfs[0]).to.be.deep.equals(baselayerConfs);
        });

        it("addToLayerSelection with empty lastFolderName: do not add to state.lastFolderNames", function () {
            const state = {
                    lastFolderNames: [],
                    lastSubjectDataLayerConfs: [],
                    lastBaselayerConfs: []
                },
                lastFolderName = "",
                subjectDataLayerConfs = [{id: "1"}, {id: "2"}],
                baselayerConfs = [{id: "bg1"}, {id: "bg2"}];

            addToLayerSelection(state, {lastFolderName, subjectDataLayerConfs, baselayerConfs});
            expect(state.lastFolderNames.length).to.be.equals(0);
            expect(state.lastSubjectDataLayerConfs.length).to.be.equals(1);
            expect(state.lastSubjectDataLayerConfs[0]).to.be.deep.equals(subjectDataLayerConfs);
            expect(state.lastBaselayerConfs.length).to.be.equals(1);
            expect(state.lastBaselayerConfs[0]).to.be.deep.equals(baselayerConfs);
        });
    });


});
