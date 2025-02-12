import {expect} from "chai";
import searchInTree from "../../searchInTree";

describe("src/utils/searchInTree.js", () => {
    const layersWithFolder =
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
                        id: "1",
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
        };

    describe("searchInTree", () => {
        it("should return a string no matter what no-string input is given", () => {
            expect(searchInTree(undefined)).to.be.an("array").and.to.be.empty;
            expect(searchInTree(null)).to.be.an("array").and.to.be.empty;
            expect(searchInTree({}, "elements", "key", "value")).to.be.an("array").and.to.be.empty;
            expect(searchInTree([], "elements", "key", "value")).to.be.an("array").and.to.be.empty;
        });

        it("should return all folder elements", () => {
            const result = searchInTree(layersWithFolder, "elements", "type", "folder");

            expect(result).to.be.an("array").and.not.to.be.empty;
            expect(result.length).to.be.equals(3);
            expect(result[0]).to.be.deep.equals(layersWithFolder);
            expect(result[1]).to.be.deep.equals(layersWithFolder.elements[0]);
            expect(result[2]).to.be.deep.equals(layersWithFolder.elements[0].elements[2]);

        });

        it("should return all elements with parentId 'folder-2'", () => {
            const result = searchInTree(layersWithFolder, "elements", "parentId", "folder-2");

            expect(result).to.be.an("array").and.not.to.be.empty;
            expect(result.length).to.be.equals(3);
            expect(result[0]).to.be.deep.equals(layersWithFolder.elements[0].elements[0]);
            expect(result[1]).to.be.deep.equals(layersWithFolder.elements[0].elements[1]);
            expect(result[2]).to.be.deep.equals(layersWithFolder.elements[0].elements[2]);

        });
    });
});
