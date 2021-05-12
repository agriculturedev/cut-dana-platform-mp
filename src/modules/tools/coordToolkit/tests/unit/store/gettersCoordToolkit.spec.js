import {expect} from "chai";
import sinon from "sinon";
import getters from "../../../store/gettersCoordToolkit";
import stateCoord from "../../../store/stateCoordToolkit";

describe("src/modules/tools/coordToolkit/store/gettersCoordToolkit.js", () => {

    describe("CoordToolkit getters", () => {
        it("returns the selectPointerMove from state", () => {
            const emptyFunc = sinon.stub(),
                state = {
                    selectPointerMove: emptyFunc
                };

            expect(getters.selectPointerMove(stateCoord)).to.equals(null);
            expect(getters.selectPointerMove(state)).to.equals(emptyFunc);
        });
        it("returns the projections from state", () => {
            const proj = [{name: "projection 1", projName: "utm"},
                    {name: "projection 2", projName: "longlat"}],
                state = {
                    projections: proj
                };

            expect(getters.projections(stateCoord)).to.be.an("array").that.is.empty;
            expect(getters.projections(state)).to.equals(proj);
        });
        it("returns the mapProjection from state", () => {
            const proj = {name: "projection 1", projName: "utm"},
                state = {
                    mapProjection: proj
                };

            expect(getters.mapProjection(stateCoord)).to.be.null;
            expect(getters.mapProjection(state)).to.equals(proj);
        });
        it("returns the positionMapProjection from state", () => {
            const pos = [100, 200],
                state = {
                    positionMapProjection: pos
                };

            expect(getters.positionMapProjection(stateCoord)).to.be.an("array").that.is.empty;
            expect(getters.positionMapProjection(state)).to.equals(pos);
        });
        it("returns the updatePosition from state", () => {
            const state = {
                updatePosition: false
            };

            expect(getters.updatePosition(stateCoord)).to.be.true;
            expect(getters.updatePosition(state)).to.be.false;
        });
        it("returns the currentSelection from state", () => {
            const name = "EPSG:25832",
                name2 = "EPSG:4326",
                state = {
                    currentSelection: name2
                };

            expect(getters.currentSelection(stateCoord)).to.be.equals(name);
            expect(getters.currentSelection(state)).to.be.equals(name2);
        });
        it("returns the currentProjection from state", () => {
            const proj = {name: "projection 1", projName: "utm"},
                state = {
                    currentProjection: proj
                };

            expect(getters.currentProjection(stateCoord)).to.be.null;
            expect(getters.currentProjection(state)).to.equals(proj);
        });
        it("returns the currentSelection from state", () => {
            const name = "EPSG:25832",
                name2 = "EPSG:4326",
                state = {
                    currentSelection: name2
                };

            expect(getters.currentSelection(stateCoord)).to.be.equals(name);
            expect(getters.currentSelection(state)).to.be.equals(name2);
        });
        it("returns the coordinatesEastingField from state", () => {
            const value = "160° 00′ 00″",
                state = {
                    coordinatesEastingField: value
                };

            expect(getters.coordinatesEastingField(stateCoord)).to.be.equals("");
            expect(getters.coordinatesEastingField(state)).to.be.equals(value);
        });
        it("returns the coordinatesNorthingField from state", () => {
            const value = "100° 00′ 00″ E",
                state = {
                    coordinatesNorthingField: value
                };

            expect(getters.coordinatesNorthingField(stateCoord)).to.be.equals("");
            expect(getters.coordinatesNorthingField(state)).to.be.equals(value);
        });
    });
    describe("testing default values", () => {
        it("returns the name default value from state", () => {
            expect(getters.name(stateCoord)).to.be.equals("common:menu.tools.coordToolkit");
        });
        it("returns the glyphicon default value from state", () => {
            expect(getters.glyphicon(stateCoord)).to.equals("glyphicon-screenshot");
        });
        it("returns the renderToWindow default value from state", () => {
            expect(getters.renderToWindow(stateCoord)).to.be.true;
        });
        it("returns the resizableWindow default value from state", () => {
            expect(getters.resizableWindow(stateCoord)).to.be.true;
        });
        it("returns the isVisibleInMenu default value from state", () => {
            expect(getters.isVisibleInMenu(stateCoord)).to.be.true;
        });
        it("returns the deactivateGFI default value from state", () => {
            expect(getters.deactivateGFI(stateCoord)).to.be.true;
        });

    });
});
