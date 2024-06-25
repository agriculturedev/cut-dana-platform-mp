import {expect} from "chai";
import sinon from "sinon";
import * as handleMultipolygonUtils from "../../../utils/handleMultipolygon";
import store from "../../../../../../app-store";
import Feature from "ol/Feature";
import MultiPolygon from "ol/geom/MultiPolygon";

describe("src/modules/tools/wfst/utils/handleMultipolygon.js", async () => {
    beforeEach(() => {
        sinon.stub(store, "commit");
        sinon.stub(store, "getters").returns(new Set());
        sinon.stub(store, "dispatch").returns(true);
    });

    afterEach(() => {
        sinon.restore();
    });

    const feature1 = new Feature({
            geometry: new MultiPolygon([
                [
                    [
                        [
                            554330.8370480813,
                            5933860.408823308
                        ],
                        [
                            554463.1286433105,
                            5928941.095173254
                        ],
                        [
                            561871.457976146,
                            5928729.511790456
                        ],
                        [
                            560786.6668952666,
                            5934574.502740252
                        ],
                        [
                            554330.8370480813,
                            5933860.408823308
                        ]
                    ]
                ]
            ])
        }),
        feature2 = new Feature({
            geometry: new MultiPolygon([
                [
                    [
                        [
                            564041.040137905,
                            5931136.272769784
                        ],
                        [
                            564570.2065188219,
                            5928941.095173254
                        ],
                        [
                            566607.4970853516,
                            5928861.7514047045
                        ],
                        [
                            566369.3722139391,
                            5931215.616538333
                        ],
                        [
                            564041.040137905,
                            5931136.272769784
                        ]
                    ]
                ]
            ])
        });

    describe("separateMultipolygon", () => {
        it("should return featureMap with no inner Features, if there are none", async () => {
            const multiPolygonFeatures = [feature1, feature2],
                result = await handleMultipolygonUtils.separateMultipolygon(multiPolygonFeatures);

            result.featureMap.forEach(value => {
                expect(value.outerId).to.equal("0");
                expect(value.feature).to.be.an.instanceof(Feature);
            });
            expect(result.isVoidFeature).to.equal(false);
        });

        it("should return empty and false if empty array is given as argument", async () => {
            const multiPolygonFeatures = [],
                result = await handleMultipolygonUtils.separateMultipolygon(multiPolygonFeatures);

            expect(result.featureMap.size).to.equal(0);
            expect(result.isVoidFeature).to.equal(false);
        });
    });

    describe("sortFeatureMap", () => {
        it("should return sorted FeatureMap as an Array", () => {
            const featureMap = new Map(),
                expectedArray = [
                    ["228", {outerId: "0", feature: feature1}],
                    ["305", {outerId: "228", feature: feature2}]
                ];

            featureMap.set("228", {outerId: "0", feature: feature1});
            featureMap.set("305", {outerId: "228", feature: feature2});

            // eslint-disable-next-line one-var
            const result = handleMultipolygonUtils.sortFeatureMap(featureMap);

            expect(result).to.deep.equal(expectedArray);
        });
    });

    describe("buildMultipolygon", () => {
        it("should build one Multipolygon out of two Multipolygon", () => {
            const features = [feature1, feature2],
                drawLayer = {getSource: () => ({removeFeature: sinon.spy()})},
                result = handleMultipolygonUtils.buildMultipolygon(features, drawLayer),
                expectedCoords = [
                    [
                        [
                            [
                                554330.8370480813,
                                5933860.408823308
                            ],
                            [
                                554463.1286433105,
                                5928941.095173254
                            ],
                            [
                                561871.457976146,
                                5928729.511790456
                            ],
                            [
                                560786.6668952666,
                                5934574.502740252
                            ],
                            [
                                554330.8370480813,
                                5933860.408823308
                            ]
                        ]
                    ],
                    [
                        [
                            [
                                564041.040137905,
                                5931136.272769784
                            ],
                            [
                                564570.2065188219,
                                5928941.095173254
                            ],
                            [
                                566607.4970853516,
                                5928861.7514047045
                            ],
                            [
                                566369.3722139391,
                                5931215.616538333
                            ],
                            [
                                564041.040137905,
                                5931136.272769784
                            ]
                        ]
                    ]
                ];

            expect(result.getCoordinates()).to.deep.equal(expectedCoords);
        });
    });
});
