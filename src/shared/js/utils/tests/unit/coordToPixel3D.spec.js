import {expect} from "chai";
import sinon from "sinon";
import crs from "@masterportal/masterportalapi/src/crs";
import transformer from "../../coordToPixel3D";

describe("src/shared/js/utils/coordToPixel3D", () => {
    let fromDegrees,
        wgs84ToWindowCoordinates;

    before(() => {
        mapCollection.clear();
        const map3d = {
                id: "1",
                mode: "3D",
                getCesiumScene: sinon.stub()
            },
            map2d = {
                id: "ol",
                mode: "2D",
                getView: () => {
                    return {
                        getProjection: () => {
                            return {
                                getCode: () => "EPSG:25832"
                            };
                        },
                        getZoom: () => 0,
                        getResolutions: () => []
                    };
                }
            };

        mapCollection.addMap(map3d, "3D");
        mapCollection.addMap(map2d, "2D");
        fromDegrees = {x: 3739928.5383489737, y: 659234.4205069073, z: 5107170.305901425};
        wgs84ToWindowCoordinates = {x: 1072.1007391921553, y: 483.8607264165568};
        global.Cesium = {};
        global.Cesium.Cartesian3 = {
            fromDegrees: sinon.stub().returns(fromDegrees)
        };
        global.Cesium.SceneTransforms = {
            wgs84ToWindowCoordinates: sinon.stub().returns(wgs84ToWindowCoordinates)
        };
        crs.registerProjections();
    });

    describe("coordToPixel3D", () => {
        it("shall return pixel coordinates", () => {
            const coord = [566040.3592904073, 5933960.043362403];

            expect(transformer.coordToPixel3D(coord)).to.be.deep.equals([1072, 484]);
        });

    });
});
