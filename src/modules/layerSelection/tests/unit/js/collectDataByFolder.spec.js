import {expect} from "chai";
import collectDataByFolderModule from "../../../js/collectDataByFolder";

describe("src/modules/layerSelection/js/collectDataByFolder.js", () => {
    let rootGetters,
        layersWithFolder;

    beforeEach(() => {
        layersWithFolder = [
            {
                name: "Titel Ebene 1",
                type: "folder",
                id: "folder-1",
                elements: [
                    {
                        name: "Titel Ebene 2",
                        type: "folder",
                        id: "folder-2",
                        parentId: "folder-1",
                        elements: [{
                            "id": "1",
                            parentId: "folder-2"
                        },
                        {
                            id: "2",
                            parentId: "folder-2"
                        },
                        {
                            name: "Titel Ebene 3",
                            type: "folder",
                            id: "folder-3",
                            parentId: "folder-2",
                            elements: [{
                                id: "3",
                                parentId: "folder-3"
                            }]
                        }]
                    }
                ]
            }];
        rootGetters = {
            folderById: (id) => {
                if (id === "folder-1") {
                    return layersWithFolder[0];
                }
                else if (id === "folder-2") {
                    return layersWithFolder[0].elements[0];
                }
                else if (id === "folder-3") {
                    return layersWithFolder[0].elements[0].elements[2];
                }
                return null;
            },
            allBaselayerConfigs: [{name: "baselayer"}],
            allLayerConfigsStructured: () => [{name: "subjectlayer"}]
        };
    });

    describe("collectDataByFolder", () => {
        it("should collect data", () => {
            const folder2 = layersWithFolder[0].elements[0].elements[2],
                data = collectDataByFolderModule.collectDataByFolder(folder2, rootGetters);

            expect(data).to.be.an("object");
            expect(data.lastBaselayerConfs.length).to.be.equal(3);
            expect(data.lastBaselayerConfs[0]).to.be.deep.equal([{name: "baselayer"}]);
            expect(data.lastBaselayerConfs[1]).to.be.deep.equal([]);
            expect(data.lastBaselayerConfs[2]).to.be.deep.equal([]);

            expect(data.lastSubjectDataLayerConfs.length).to.be.equal(3);
            expect(data.lastSubjectDataLayerConfs[0]).to.be.deep.equal([{name: "subjectlayer"}]);
            expect(data.lastSubjectDataLayerConfs[1]).to.be.deep.equal(layersWithFolder[0].elements);
            expect(data.lastSubjectDataLayerConfs[2]).to.have.deep.members(layersWithFolder[0].elements[0].elements);

            expect(data.lastFolderNames.length).to.be.equal(3);
            expect(data.lastFolderNames[0]).to.be.deep.equal("root");
            expect(data.lastFolderNames[1]).to.be.deep.equal("Titel Ebene 1");
            expect(data.lastFolderNames[2]).to.be.deep.equal("Titel Ebene 2");
        });
    });

});
