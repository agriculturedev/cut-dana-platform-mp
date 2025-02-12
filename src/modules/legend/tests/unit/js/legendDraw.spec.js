import {expect} from "chai";
import sinon from "sinon";
import legendDraw from "../../../js/legendDraw";

describe("src/modules/legend/js/legendDraw", function () {

    afterEach(sinon.restore);

    describe("drawIntervalStyle", function () {
        it("with scalingShape 'CIRCLE_BAR'", function () {
            const style = {
                    scalingShape: "CIRCLE_BAR",
                    scalingAttribute: "scalingAttribute"
                },
                intervalStyle = {
                    style: "x"
                };
            let result = null;

            sinon.stub(legendDraw, "drawIntervalCircleBars").returns(intervalStyle);

            result = legendDraw.drawIntervalStyle(style);
            expect(result).to.deep.equal(intervalStyle);
        });

        it("without scalingShape 'CIRCLE_BAR'", function () {
            const style = {
                    scalingShape: "scalingShape",
                    scalingAttribute: "scalingAttribute"
                },
                intervalStyle = {
                    style: "x"
                };
            let result = null;

            sinon.stub(legendDraw, "drawIntervalCircleBars").returns(intervalStyle);

            result = legendDraw.drawIntervalStyle(style);
            expect(result).to.deep.equal([]);
        });
    });

    describe("drawNominalStyle", function () {
        it("with scalingShape 'circlesegments'", function () {
            const style = {
                    attributes: {
                        scalingShape: "circleSegments"
                    }
                },
                nominalStyle = {
                    style: "x"
                };
            let result = null;

            sinon.stub(legendDraw, "drawNominalCircleSegments").returns(nominalStyle);

            result = legendDraw.drawNominalStyle(style);
            expect(result).to.deep.equal(nominalStyle);
        });

        it("drawIntervalStyle without scalingShape 'circlesegments'", function () {
            const style = {
                    attributes: {
                        scalingShape: "scalingShape"
                    }
                },
                nominalStyle = {
                    style: "x"
                };
            let result = null;

            sinon.stub(legendDraw, "drawNominalCircleSegments").returns(nominalStyle);

            result = legendDraw.drawNominalStyle(style);
            expect(result).to.deep.equal([]);
        });
    });

    describe("drawNominalCircleSegments", function () {
        it("simple circle segment", function () {
            const styleObject = {
                    attributes: {
                        scalingValues: {
                            "a": "b",
                            "c": "d"
                        }
                    },
                    style: {
                        getImage: () => {
                            return {
                                getSrc: () => "src"
                            };
                        }
                    }
                },
                result = legendDraw.drawNominalCircleSegments(styleObject);

            expect(result).to.be.an("Array");
            expect(result.length).to.be.equals(2);
            expect(result[0].name).to.be.equals("a");
            expect(result[0].graphic).to.be.equals("src");
            expect(result[1].name).to.be.equals("c");
            expect(result[1].graphic).to.be.equals("src");
        });

        it("nominal circle segment", function () {
            const styleObject = {
                    attributes: {
                        imageScale: "2",
                        scalingValues: {
                            "a": "b",
                            "c": "d"
                        }
                    },
                    style: [{
                        getImage: () => {
                            return {
                                getSrc: () => "src1",
                                getSize: () => [1, 1]
                            };
                        }
                    }, {
                        getImage: () => {
                            return {
                                getSrc: () => "src2",
                                getSize: () => [2, 2]
                            };
                        }
                    }
                    ]
                },
                result = legendDraw.drawNominalCircleSegments(styleObject);

            expect(result).to.be.an("Array");
            expect(result.length).to.be.equals(2);
            expect(result[0].name).to.be.equals("a");
            expect(result[0].graphic).to.be.an("Array");
            expect(result[0].iconSize).to.be.an("Array");
            expect(typeof result[0].iconSize[0]).to.be.equals("number");
            expect(typeof result[0].iconSizeDifferenz).to.be.equals("number");
            expect(result[1].name).to.be.equals("c");
            expect(result[1].graphic).to.be.an("Array");
            expect(result[1].iconSize).to.be.an("Array");
            expect(typeof result[1].iconSize[0]).to.be.equals("number");
            expect(typeof result[1].iconSizeDifferenz).to.be.equals("number");
        });
    });

    describe("prepareLegendForPoint", function () {
        it("prepareLegendForPoint type icon", function () {
            const style = {
                    type: "icon",
                    imagePath: "imagePath",
                    imageName: "imageName"
                },
                result = legendDraw.prepareLegendForPoint({}, style);

            expect(result.graphic).to.be.equals("imagePathimageName");
        });

        it("prepareLegendForPoint type icon - imageName contains whole path", () => {
            const style = {
                    imagePath: "foo/bar/",
                    type: "icon",
                    imageName: "https://localhost:9001/portal/basic/geodaten/icons/svg/poi/Rathaus.svg"
                },
                result = legendDraw.prepareLegendForPoint({}, style);

            expect(result.graphic).to.deep.equal(style.imageName);
        });
        it("prepareLegendForPoint type icon - imageName and imagePath contain whole path", () => {
            const style = {
                    imagePath: "https://localhost:9001/portal/basic/geodaten2/icons",
                    type: "icon",
                    imageName: "https://localhost:9001/portal/basic/geodaten/icons/svg/poi/Rathaus.svg"
                },
                result = legendDraw.prepareLegendForPoint({}, style);

            expect(result.graphic).to.deep.equal(style.imageName);
        });
        it("prepareLegendForPoint type icon - imageName contains complete svg", () => {
            const style = {
                    imagePath: "foo/bar/",
                    type: "icon",
                    imageName: "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='#E10019' class='bi bi-geo-fill' viewBox='0 0 16 16'><path fill-rule='evenodd' d='M4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999zm2.493 8.574a.5.5 0 0 1-.411.575c-.712.118-1.28.295-1.655.493a1.319 1.319 0 0 0-.37.265.301.301 0 0 0-.057.09V14l.002.008a.147.147 0 0 0 .016.033.617.617 0 0 0 .145.15c.165.13.435.27.813.395.751.25 1.82.414 3.024.414s2.273-.163 3.024-.414c.378-.126.648-.265.813-.395a.619.619 0 0 0 .146-.15.148.148 0 0 0 .015-.033L12 14v-.004a.301.301 0 0 0-.057-.09 1.318 1.318 0 0 0-.37-.264c-.376-.198-.943-.375-1.655-.493a.5.5 0 1 1 .164-.986c.77.127 1.452.328 1.957.594C12.5 13 13 13.4 13 14c0 .426-.26.752-.544.977-.29.228-.68.413-1.116.558-.878.293-2.059.465-3.34.465-1.281 0-2.462-.172-3.34-.465-.436-.145-.826-.33-1.116-.558C3.26 14.752 3 14.426 3 14c0-.599.5-1 .961-1.243.505-.266 1.187-.467 1.957-.594a.5.5 0 0 1 .575.411z'/></svg>"
                },
                result = legendDraw.prepareLegendForPoint({}, style);

            expect(result.graphic).to.deep.equal("data:image/svg+xml;charset=utf-8," + encodeURIComponent(style.imageName));
        });
        it("prepareLegendForPoint type icon - imageName contains path", () => {
            const style = {
                    imagePath: "foo/bar/",
                    type: "icon",
                    imageName: "/svg/poi/Rathaus.svg"
                },
                result = legendDraw.prepareLegendForPoint({}, style);

            expect(result.graphic).to.deep.equal(style.imagePath + style.imageName);
        });
        it("prepareLegendForPoint type icon - imageName contains icon name", () => {
            const style = {
                    imagePath: "./foo/bar/",
                    type: "icon",
                    imageName: "Rathaus.svg"
                },
                result = legendDraw.prepareLegendForPoint({}, style);

            expect(result.graphic).to.deep.equal(style.imagePath + style.imageName);
        });

        it("prepareLegendForPoint type circle", function () {
            const style = {
                type: "circle"
            };
            let result = null;

            sinon.stub(legendDraw, "drawCircleStyle").returns("graphic");

            result = legendDraw.prepareLegendForPoint({}, style);
            expect(result.graphic).to.be.equals("graphic");
        });

        it("prepareLegendForPoint type interval", function () {
            const style = {
                type: "interval"
            };
            let result = null;

            sinon.stub(legendDraw, "drawIntervalStyle").returns("graphic");

            result = legendDraw.prepareLegendForPoint({}, style);
            expect(result.graphic).to.be.equals("graphic");
        });

        it("prepareLegendForPoint type nominal", function () {
            const style = {
                type: "nominal"
            };
            let result = null;

            sinon.stub(legendDraw, "drawNominalStyle").returns("graphic");

            result = legendDraw.prepareLegendForPoint({}, style);
            expect(result).to.be.equals("graphic");
        });
    });

    describe("prepare", function () {
        it("prepare geometryType Point", function () {
            let result = null;

            sinon.stub(legendDraw, "prepareLegendForPoint").returns("LegendForPoint");
            result = legendDraw.prepare("Point", {}, "name");

            expect(result).to.be.equals("LegendForPoint");
        });

        it("prepare geometryType LineString", function () {
            let result = null;

            sinon.stub(legendDraw, "prepareLegendForLineString").returns("LegendForLineString");
            result = legendDraw.prepare("LineString", {}, "name");

            expect(result).to.be.equals("LegendForLineString");
        });
        it("prepare geometryType Polygon", function () {
            let result = null;

            sinon.stub(legendDraw, "prepareLegendForPolygon").returns("LegendForPolygon");
            result = legendDraw.prepare("Polygon", {}, "name");

            expect(result).to.be.equals("LegendForPolygon");
        });
        it("prepare geometryType Cesium", function () {
            let result = null;

            sinon.stub(legendDraw, "prepareNameForCesium").returns("NameForCesium");
            sinon.stub(legendDraw, "prepareLegendForCesium").returns("LegendForCesium");
            result = legendDraw.prepare("Cesium", {}, "name");

            expect(result).to.be.equals("LegendForCesium");
        });
    });
});
