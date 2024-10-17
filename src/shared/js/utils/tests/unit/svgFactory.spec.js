import {expect} from "chai";
import sinon from "sinon";
import svgFactory from "../../svgFactory.js";
import StylePolygon from "@masterportal/masterportalapi/src/vectorStyle/styles/polygon/stylePolygon";

describe("src/utils/svgFactory.js", () => {

    afterEach(() => {
        sinon.restore();
    });

    describe("createCircle", () => {
        it("style properties directly", () => {
            const style = {
                    circleStrokeColor: [10, 200, 0, 0.2], // #0ac800
                    circleFillColor: [150, 200, 0, 0.5], // #96c800
                    circleStrokeWidth: 2
                },
                svg = svgFactory.createCircle(style);

            expect(svg).to.be.a("string");
            expect(svg.includes("height='25'")).to.be.true;
            expect(svg.includes("width='25'")).to.be.true;
            expect(svg.includes("circle cx='12.5' cy='12.5' r='10'")).to.be.true;
            expect(svg.includes("stroke='#0ac800'")).to.be.true;
            expect(svg.includes("stroke-opacity='0.2'")).to.be.true;
            expect(svg.includes("stroke-width='2'")).to.be.true;
            expect(svg.includes("fill='#96c800'")).to.be.true;
            expect(svg.includes("fill-opacity='0.5'")).to.be.true;


        });

        it("style properties with attributes", () => {
            const style = {
                    attributes: {
                        circleStrokeColor: [10, 200, 0, 0.2], // #0ac800
                        circleFillColor: [150, 200, 0, 0.5], // #96c800
                        circleStrokeWidth: 2
                    }
                },
                svg = svgFactory.createCircle(style);

            expect(svg).to.be.a("string");
            expect(svg.includes("height='25'")).to.be.true;
            expect(svg.includes("width='25'")).to.be.true;
            expect(svg.includes("circle cx='12.5' cy='12.5' r='10'")).to.be.true;
            expect(svg.includes("stroke='#0ac800'")).to.be.true;
            expect(svg.includes("stroke-opacity='0.2'")).to.be.true;
            expect(svg.includes("stroke-width='2'")).to.be.true;
            expect(svg.includes("fill='#96c800'")).to.be.true;
            expect(svg.includes("fill-opacity='0.5'")).to.be.true;
        });
    });

    describe("createPolygon", () => {
        it("style properties directly", () => {
            const style = {
                    polygonFillColor: [10, 200, 0, 0.2], // #0ac800
                    polygonFillHatch: undefined,
                    polygonStrokeCap: "round",
                    polygonStrokeColor: [0, 0, 0, 1], // #000000
                    polygonStrokeDash: undefined,
                    polygonStrokeDashOffset: 0,
                    polygonStrokeJoin: "round",
                    polygonStrokeMiterLimit: 10,
                    polygonStrokeWidth: 1
                },
                svg = svgFactory.createPolygon(style);

            expect(svg).to.be.a("string");
            expect(svg.includes("height='25'")).to.be.true;
            expect(svg.includes("width='25'")).to.be.true;
            expect(svg.includes("points='5,5 20,5 20,20 5,20'")).to.be.true;
            expect(svg.includes("fill:#0ac800")).to.be.true;
            expect(svg.includes("fill-opacity:0.2")).to.be.true;
            expect(svg.includes("stroke:#000000")).to.be.true;
            expect(svg.includes("stroke-opacity:1")).to.be.true;
            expect(svg.includes("stroke-width:1")).to.be.true;
        });

        it("style properties with attributes", () => {
            const style = {
                    attributes: {
                        polygonFillColor: [10, 200, 0, 0.2], // #0ac800
                        polygonFillHatch: undefined,
                        polygonStrokeCap: "round",
                        polygonStrokeColor: [0, 0, 0, 1], // #000000
                        polygonStrokeDash: undefined,
                        polygonStrokeDashOffset: 0,
                        polygonStrokeJoin: "round",
                        polygonStrokeMiterLimit: 10,
                        polygonStrokeWidth: 1
                    }
                },
                svg = svgFactory.createPolygon(style);

            expect(svg).to.be.a("string");
            expect(svg.includes("height='25'")).to.be.true;
            expect(svg.includes("width='25'")).to.be.true;
            expect(svg.includes("points='5,5 20,5 20,20 5,20'")).to.be.true;
            expect(svg.includes("fill:#0ac800")).to.be.true;
            expect(svg.includes("fill-opacity:0.2")).to.be.true;
            expect(svg.includes("stroke:#000000")).to.be.true;
            expect(svg.includes("stroke-opacity:1")).to.be.true;
            expect(svg.includes("stroke-width:1")).to.be.true;
        });

        it("style properties with hatch", () => {
            const style = {
                    polygonFillColor: [10, 200, 0, 0.2], // #0ac800
                    polygonStrokeCap: "round",
                    polygonStrokeColor: [0, 0, 0, 1], // #000000
                    polygonStrokeDash: undefined,
                    polygonStrokeDashOffset: 0,
                    polygonStrokeJoin: "round",
                    polygonStrokeMiterLimit: 10,
                    polygonStrokeWidth: 1,
                    polygonFillHatch: true
                },
                spy = sinon.spy(StylePolygon.prototype, "getPolygonFillHatchLegendDataUrl");

            svgFactory.createPolygon(style);
            expect(spy.calledOnce).to.be.true;
        });
    });
    describe("createLine", () => {
        it("style properties directly", () => {
            const style = {
                    lineStrokeColor: [10, 200, 0, 0.2], // #0ac800
                    lineStrokeWidth: 1,
                    lineStrokeDash: undefined
                },
                svg = svgFactory.createLine(style);

            expect(svg).to.be.a("string");
            expect(svg.includes("height='25'")).to.be.true;
            expect(svg.includes("width='25'")).to.be.true;
            expect(svg.includes("path d='M 05 20 L 20 05'")).to.be.true;
            expect(svg.includes("stroke='#0ac800'")).to.be.true;
            expect(svg.includes("stroke-opacity='0.2'")).to.be.true;
            expect(svg.includes("stroke-width='1'")).to.be.true;
        });
        it("style properties directly with dash", () => {
            const style = {
                    lineStrokeColor: [10, 200, 0, 0.2], // #0ac800
                    lineStrokeWidth: 1,
                    lineStrokeDash: [10, 8]
                },
                svg = svgFactory.createLine(style);

            expect(svg).to.be.a("string");
            expect(svg.includes("height='25'")).to.be.true;
            expect(svg.includes("width='25'")).to.be.true;
            expect(svg.includes("path d='M 05 20 L 20 05'")).to.be.true;
            expect(svg.includes("stroke='#0ac800'")).to.be.true;
            expect(svg.includes("stroke-opacity='0.2'")).to.be.true;
            expect(svg.includes("stroke-width='1'")).to.be.true;
            expect(svg.includes("stroke-dasharray='10 8'")).to.be.true;
        });
        it("style properties with attributes", () => {
            const style = {
                    attributes: {
                        lineStrokeColor: [10, 200, 0, 0.2], // #0ac800
                        lineStrokeWidth: 1,
                        lineStrokeDash: undefined
                    }
                },
                svg = svgFactory.createLine(style);

            expect(svg).to.be.a("string");
            expect(svg.includes("height='25'")).to.be.true;
            expect(svg.includes("width='25'")).to.be.true;
            expect(svg.includes("path d='M 05 20 L 20 05'")).to.be.true;
            expect(svg.includes("stroke='#0ac800'")).to.be.true;
            expect(svg.includes("stroke-opacity='0.2'")).to.be.true;
            expect(svg.includes("stroke-width='1'")).to.be.true;
        });
        it("style properties with attributes with dash", () => {
            const style = {
                    attributes: {
                        lineStrokeColor: [10, 200, 0, 0.2], // #0ac800
                        lineStrokeWidth: 1,
                        lineStrokeDash: [10, 8]
                    }
                },
                svg = svgFactory.createLine(style);

            expect(svg).to.be.a("string");
            expect(svg.includes("height='25'")).to.be.true;
            expect(svg.includes("width='25'")).to.be.true;
            expect(svg.includes("path d='M 05 20 L 20 05'")).to.be.true;
            expect(svg.includes("stroke='#0ac800'")).to.be.true;
            expect(svg.includes("stroke-opacity='0.2'")).to.be.true;
            expect(svg.includes("stroke-width='1'")).to.be.true;
            expect(svg.includes("stroke-dasharray='10 8'")).to.be.true;
        });
    });
});
