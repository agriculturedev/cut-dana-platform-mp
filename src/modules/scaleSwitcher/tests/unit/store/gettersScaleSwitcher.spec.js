import {expect} from "chai";
import getters from "../../../store/gettersScaleSwitcher";
import stateScaleSwitcher from "../../../store/stateScaleSwitcher";

const {
    icon,
    name,
    type,
    hasMouseMapInteractions,
    supportedDevices,
    supportedMapModes
} = getters;

describe("src/modules/scaleSwitcher/store/gettersScaleSwitcher.js", () => {
    describe("ScaleSwitcher getters", () => {
        it("returns the icon from state", () => {
            expect(icon(stateScaleSwitcher)).to.equals("bi-arrows-angle-contract");
        });
        it("returns the name from state", () => {
            expect(name(stateScaleSwitcher)).to.be.equals("common:modules.scaleSwitcher.name");
        });
        it("returns the supportedDevices default value from state", () => {
            expect(supportedDevices(stateScaleSwitcher)).to.be.deep.equals(["Desktop", "Mobile", "Table"]);
        });
        it("returns the supportedMapModes default value from state", () => {
            expect(supportedMapModes(stateScaleSwitcher)).to.be.deep.equals(["2D", "3D"]);
        });
        it("returns the type from state", () => {
            expect(type(stateScaleSwitcher)).to.equals("scaleSwitcher");
        });
    });

    describe("testing default values", () => {
        it("returns the hasMouseMapInteractions default value from state", () => {
            expect(hasMouseMapInteractions(stateScaleSwitcher)).to.be.false;
        });
    });
});
