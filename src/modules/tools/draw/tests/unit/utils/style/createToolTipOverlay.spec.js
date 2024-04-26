import {expect} from "chai";
import sinon from "sinon";
import Overlay from "ol/Overlay";
import {getArea} from "ol/sphere.js";
import Polygon from "ol/geom/Polygon.js";
import createToolTipOverlay from "../../../../utils/style/createTooltipOverlay";
import thousandsSeparator from "../../../../../../../utils/thousandsSeparator";


describe("src/modules/tools/draw/utils/style/createToolTipOverlay", () => {
    const state = {
            drawType: {
                id: "drawSquare"
            }
        },
        projection = "EPSG:4326";

    let commit, dispatch, getters;

    beforeEach(function () {
        commit = sinon.stub();
        dispatch = sinon.stub();
        getters = {
            styleSettings: {
                unit: "m"
            },
            drawType: {
                id: "drawSquare"
            }
        };
    });

    afterEach(function () {
        commit = null;
        dispatch = null;
        sinon.restore();
    });

    describe("createToolTipOverlay", () => {
        it("should create a tooltip overlay element", () => {
            expect(createToolTipOverlay({state, getters, commit, dispatch}, projection) instanceof Overlay).to.be.true;
        });

        it("should set the correct content for the tooltip overlay für square meters", () => {
            const tooltip = createToolTipOverlay({state, getters, commit, dispatch}, projection),
                feature = new Polygon([[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]),
                result = thousandsSeparator(Math.round(getArea(feature, {projection})));

            tooltip.get("featureChangeEvent")({target: feature});
            expect(tooltip.getElement().innerHTML).to.equal(result + " m²");
        });

        it("should set the correct content for the tooltip overlay für square kilometers", () => {
            getters = {
                styleSettings: {
                    unit: "km"
                },
                drawType: {
                    id: "drawSquare"
                }
            };

            const tooltip = createToolTipOverlay({state, getters, commit, dispatch}, projection),
                feature = new Polygon([[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]),
                resultForMeters = Math.round(getArea(feature, {projection})),
                resultForKm = (resultForMeters / 1000000).toFixed(3);

            tooltip.get("featureChangeEvent")({target: feature});
            expect(tooltip.getElement().innerHTML).to.equal(resultForKm + " km²");
        });
    });
});
