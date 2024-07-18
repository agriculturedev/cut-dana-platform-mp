import {expect} from "chai";
import getters from "../../../store/gettersMapMarker";
import stateMapMarker from "../../../store/stateMapMarker";

describe("src/modules/mapMarker/store/gettersMapMarker.js", () => {
    let origState;

    before(() => {
        origState = {...stateMapMarker};
    });

     afterEach(() => {
        stateMapMarker = origState;
    });

    describe("MapMarker getters", () => {
        it("returns the pointStyleId from state", () => {
            expect(getters.pointStyleId(stateMapMarker)).to.equals("defaultMapMarkerPoint");
        });
        it("returns the polygonStyleId from state", () => {
            expect(getters.polygonStyleId(stateMapMarker)).to.equals("defaultMapMarkerPolygon");
        });
        it("returns the markerPoint from state", () => {
            const point = getters.markerPoint(stateMapMarker);

            expect(point.getSource()).is.not.undefined;
            expect(point.get("name")).equals("markerPoint");
            expect(point.getVisible()).to.be.false;
            expect(point.getStyle()).is.not.undefined;
        });
        it("returns the markerPolygon from state", () => {
            const polygon = getters.markerPolygon(stateMapMarker);
            console.log(polygon.values_);
            console.log("polygon.getVisible()",polygon.getVisible());

            expect(polygon.getSource()).is.not.undefined;
            expect(polygon.get("name")).equals("markerPolygon");
            expect(polygon.getVisible()).to.be.false;
            expect(polygon.getStyle()).is.not.undefined;
        });
    });
});
