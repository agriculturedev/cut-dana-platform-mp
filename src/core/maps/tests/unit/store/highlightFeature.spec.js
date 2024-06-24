import {expect} from "chai";
import sinon from "sinon";
import {highlightFeature} from "../../../store/actions/highlightFeature";
import Feature from "ol/Feature";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import Point from "ol/geom/Point";


describe("src/core/maps/store/highlightFeature.js", () => {
    let dispatchSpy,
        commitSpy,
        highlightVectorRules,
        returnStyleObjectBackup;

    const olFeature = new Feature(new Point([1, 1]));

    before( () => {
        returnStyleObjectBackup = styleList.returnStyleObject;
        styleList.returnStyleObject =  (layerId) => {return {rules: [{style:{}}]};}
    })

    after( () => {
        styleList.returnStyleObject = returnStyleObjectBackup;
    })


    beforeEach(() => {
        dispatchSpy = sinon.spy();
        commitSpy = sinon.spy();

        highlightVectorRules = {
            image: {
                scale: 10
            },
            fill: sinon.stub(),
            stroke: sinon.stub()
        };
    });
    afterEach(sinon.restore);

    describe("highlightFeature", () => {

        it("calls addHighlightedFeature and addHighlightedFeatureStyle for objects with highlightStyle", () => {
            const highlightObject = {
                feature: olFeature,
                type: "highlightPoint",
                highlightStyle: {
                    stroke: highlightVectorRules.stroke
                },
                layer: {id: "layerID"},
                styleId: "styleId"
            }

            highlightFeature({commit: commitSpy, dispatch: dispatchSpy}, highlightObject)
            expect(commitSpy.calledTwice).to.be.true;
            expect(commitSpy.firstCall.args[0]).to.be.equals("Maps/addHighlightedFeature");
            expect(commitSpy.secondCall.args[0]).to.be.equals("Maps/addHighlightedFeatureStyle");
            expect(dispatchSpy.notCalled).to.be.true;
        });

        it("calls placingPolygonMarker for objects without highlightStyle", () => {
            const highlightObject = {
                feature: olFeature,
                type: "highlightPoint",
                layer: {id: "layerID"}
            }

            highlightFeature({commit: commitSpy, dispatch: dispatchSpy}, highlightObject)
            expect(dispatchSpy.calledOnce).to.be.true;
            expect(dispatchSpy.firstCall.args[0]).to.be.equals("MapMarker/placingPolygonMarker");
            expect(commitSpy.notCalled).to.be.true;
        });
    });
});
