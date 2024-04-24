import {expect} from "chai";
import sinon from "sinon";
import Overlay from "ol/Overlay";
import createToolTipOverlay from "../../../../utils/style/createTooltipOverlay";


describe("src/modules/tools/draw/utils/style/createToolTipOverlay", () => {
    const state = {
            drawType: {
                id: "drawSquare"
            }
        },
        getters = {
            styleSettings: {
                unit: "m"
            },
            drawType: {
                id: "drawSquare"
            }
        },
        projection = "EPSG:4326";

    let commit, dispatch;

    beforeEach(function () {
        commit = sinon.stub();
        dispatch = sinon.stub();
    });

    describe("createToolTipOverlay", () => {
        it("should create a tooltip overlay element", () => {
            expect(createToolTipOverlay({state, getters, commit, dispatch}, projection) instanceof Overlay).to.be.true;
        });
    });
});
