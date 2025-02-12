import {expect} from "chai";
import visibilityChecker from "../../visibilityChecker";

describe("src/shared/js/utils/isModuleVisible", () => {
    describe("visibilityChecker.isModuleVisible", () => {
        it("should return true if mapMode is '2D' and deviceMode is 'Desktop'", () => {
            expect(visibilityChecker.isModuleVisible("2D", "Desktop")).to.be.true;
        });

        it("should return true if mapMode is '2D' and deviceMode is 'Mobile'", () => {
            expect(visibilityChecker.isModuleVisible("2D", "Mobile")).to.be.true;
        });

        it("should return true if mapMode is '2D' and deviceMode is 'Table'", () => {
            expect(visibilityChecker.isModuleVisible("2D", "Table")).to.be.true;
        });

        it("should return true if mapMode is '3D' and deviceMode is 'Table'", () => {
            expect(visibilityChecker.isModuleVisible("3D", "Desktop")).to.be.true;
        });

        it("should return true if mapMode is '3D' and deviceMode is 'Mobile'", () => {
            expect(visibilityChecker.isModuleVisible("3D", "Mobile")).to.be.true;
        });

        it("should return true if mapMode is '3D' and deviceMode is 'Table'", () => {
            expect(visibilityChecker.isModuleVisible("3D", "Table")).to.be.true;
        });

        it("should return true if supportedMapModes and supportedDevices contains mapMode and deviceMode ", () => {
            expect(visibilityChecker.isModuleVisible("3D", "Table", undefined, ["3D"], ["Table"])).to.be.true;
        });

        it("should return false if supportedMapModes and supportedDevices doesn't contains mapMode and deviceMode ", () => {
            expect(visibilityChecker.isModuleVisible("3D", "Table", undefined, ["2D"], ["Mobile"])).to.be.false;
        });

        it("should return false if supportedTreeType doesn't contains treeType ", () => {
            expect(visibilityChecker.isModuleVisible("3D", "Table", "light", ["3D"], ["Table"], ["auto"])).to.be.false;
        });

        it("should return false if one of supportedMapModes and supportedDevices doesn't contains mapMode and deviceMode ", () => {
            expect(visibilityChecker.isModuleVisible("3D", "Table", ["3D"], ["Mobile"])).to.be.false;
            expect(visibilityChecker.isModuleVisible("3D", "Table", ["2D"], ["Table"])).to.be.false;
        });
    });
});
