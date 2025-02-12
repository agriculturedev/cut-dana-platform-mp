import {expect} from "chai";
import Map from "ol/Map";
import View from "ol/View";

import {setResolutions, setValues} from "../../../js/setValuesToMapView";

describe("src/core/js/setValuesToMapView.js", () => {
    let map;

    beforeEach(() => {
        mapCollection.clear();

        map = new Map({
            id: "ol",
            mode: "2D",
            view: new View()
        });

        mapCollection.addMap(map, "2D");
    });


    describe("setResolutions", () => {
        it("map view should have new resolutions", () => {
            const resolutions = [10, 20, 30, 40],
                view = mapCollection.getMapView("2D");

            setResolutions(view, resolutions);

            expect(view.resolutions_).to.equals(resolutions);
            expect(view.get("resolutions")).to.equals(resolutions);
        });
    });

    describe("setValues", () => {
        it("map view should have new values", () => {
            const mapViewSettings = {
                    startZoomLevel: 1,
                    startCenter: [
                        566874,
                        5944140
                    ],
                    options: [
                        {
                            resolution: 661.457,
                            scale: 2500000,
                            zoomLevel: 0
                        },
                        {
                            resolution: 264.583,
                            scale: 1000000,
                            zoomLevel: 1
                        }
                    ]
                },
                view = mapCollection.getMapView("2D");

            setValues(view, mapViewSettings);

            expect(view.getCenter()).to.deep.equals([
                566874,
                5944140
            ]);
            expect(view.getZoom()).to.equals(1);
            expect(view.get("options")).to.deep.equals([
                {
                    resolution: 661.457,
                    scale: 2500000,
                    zoomLevel: 0
                },
                {
                    resolution: 264.583,
                    scale: 1000000,
                    zoomLevel: 1
                }
            ]);
        });
    });
});
