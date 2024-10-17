import {expect} from "chai";
import mapCollect from "../../../js/mapCollection";

describe("src/core/js/maps/maps.js", () => {
    beforeEach(() => {
        mapCollection.clear();
    });

    describe("addMap nad getMap", () => {
        it("add a 2D map to mapCollection", () => {
            const map = {
                map: "map",
                mode: "2D"
            };

            mapCollect.addMap(map, "2D");

            expect(mapCollect.getMap("2D")).to.deep.equals(map);
        });
    });

    describe("addMap and getMapMapView", () => {
        it("clear the mapCollection", () => {
            const map = {
                map: "map",
                mode: "2D",
                getView: () => "The map View"
            };

            mapCollect.addMap(map, "2D");

            expect(mapCollect.getMapView("2D")).to.equals("The map View");
        });
    });

    describe("clear and getMap", () => {
        it("clear the mapCollection", () => {
            const map = {
                map: "map",
                mode: "2D"
            };

            mapCollect.clear(map, "2D");

            expect(mapCollect.getMap("2D")).to.be.undefined;
        });
    });
});
