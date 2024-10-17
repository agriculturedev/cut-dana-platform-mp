import {expect} from "chai";
import sinon from "sinon";
import {removeHighlightFeature} from "../../../js/removeHighlighting";
import Feature from "ol/Feature";

describe("src/core/maps/js/removeHighlightFeature", () => {
    let commit, state, feature, anotherFeature;

    beforeEach(() => {
        commit = sinon.spy();
        state = {
            highlightedFeatures: [],
            highlightedFeatureStyles: []
        };

        feature = new Feature();
        anotherFeature = new Feature();
        state.highlightedFeatures.push(feature, anotherFeature);
        state.highlightedFeatureStyles.push(function () { /* empty on purpose */ }, function () { /* empty on purpose */ });

    });

    afterEach(() => {
        sinon.restore();
    });

    it("should remove a single highlighted feature", async () => {
        state.highlightedFeatures = [feature];
        state.highlightedFeatureStyles = [sinon.stub()];

        await removeHighlightFeature({commit, state}, feature);

        expect(commit.calledWith("setHighlightedFeatureStyles", [])).to.be.true;
        expect(commit.calledWith("setHighlightedFeatures", [])).to.be.true;
    });

    it("should remove all highlighted features if no feature is specified", async () => {
        state.highlightedFeatures = [];
        state.highlightedFeatureStyles = [];

        await removeHighlightFeature({commit, state});

        expect(commit.calledWith("setHighlightedFeatures", [])).to.be.true;
        expect(commit.calledWith("setHighlightedFeatureStyles", [])).to.be.true;
        expect(state.highlightedFeatures).to.be.empty;
        expect(state.highlightedFeatureStyles).to.be.empty;
    });

    it("should not modify state if the specified feature is not highlighted", async () => {
        const notHighlightedFeature = new Feature();

        await removeHighlightFeature({commit, state}, notHighlightedFeature);

        expect(state.highlightedFeatures.length).to.equal(2);
        expect(state.highlightedFeatureStyles.length).to.equal(2);
        expect(commit.called).to.be.false;
    });
});
