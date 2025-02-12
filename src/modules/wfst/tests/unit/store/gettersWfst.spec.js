import {expect} from "chai";
import sinon from "sinon";
import Feature from "ol/Feature";
import {defaultInteractionConfig} from "../../../constantsWfst";
import gettersWfst from "../../../store/gettersWfst";

describe("src/modules/wfst/store/gettersWfst.js", () => {
    let state;

    describe("currentInteractionConfig", () => {
        const currentLayerId = "myLayer",
            basicGeometryConfig = {
                layerId: currentLayerId,
                available: true,
                multi: true,
                icon: "bi-globe",
                text: "My WFS-T"
            };
        let consoleSpy;

        before(() => {
            i18next.init({
                lng: "cimode",
                debug: false
            });
        });

        beforeEach(() => {
            state = {};
            consoleSpy = sinon.spy();
            sinon.stub(console, "warn").callsFake(consoleSpy);
        });
        afterEach(sinon.restore);

        it("should return a parsed configuration if polygonButton are configured", () => {
            state.polygonButton = [basicGeometryConfig];

            const interactionConfig = gettersWfst.currentInteractionConfig(state, {currentLayerId});

            expect(interactionConfig.Polygon.available).to.be.true;
            expect(interactionConfig.Polygon.icon).to.equal("bi-globe");
            expect(interactionConfig.Polygon.multi).to.be.true;
            expect(interactionConfig.Polygon.text).to.equal("My WFS-T");
            expect(interactionConfig.LineString).to.eql(defaultInteractionConfig.LineString);
            expect(interactionConfig.Point).to.eql(defaultInteractionConfig.Point);
            expect(interactionConfig.update).to.eql(defaultInteractionConfig.update);
            expect(interactionConfig.delete).to.eql(defaultInteractionConfig.delete);
        });
        it("should return a parsed configuration for lineButton, if configured", () => {
            state.lineButton = [basicGeometryConfig];

            const interactionConfig = gettersWfst.currentInteractionConfig(state, {currentLayerId});

            expect(consoleSpy.notCalled).to.be.true;
            expect(interactionConfig.LineString.available).to.be.true;
            expect(interactionConfig.LineString.icon).to.equal("bi-globe");
            expect(interactionConfig.LineString.multi).to.be.true;
            expect(interactionConfig.LineString.text).to.equal("My WFS-T");
            expect(interactionConfig.Point).to.eql(defaultInteractionConfig.Point);
            expect(interactionConfig.Polygon).to.eql(defaultInteractionConfig.Polygon);
            expect(interactionConfig.update).to.eql(defaultInteractionConfig.update);
            expect(interactionConfig.delete).to.eql(defaultInteractionConfig.delete);
        });
        it("should return a parsed configuration for pointButton, if configured", () => {
            state.pointButton = [basicGeometryConfig];

            const interactionConfig = gettersWfst.currentInteractionConfig(state, {currentLayerId});

            expect(consoleSpy.notCalled).to.be.true;
            expect(interactionConfig.Point.available).to.be.true;
            expect(interactionConfig.Point.icon).to.equal("bi-globe");
            expect(interactionConfig.Point.multi).to.be.true;
            expect(interactionConfig.Point.text).to.equal("My WFS-T");
            expect(interactionConfig.LineString).to.eql(defaultInteractionConfig.LineString);
            expect(interactionConfig.Polygon).to.eql(defaultInteractionConfig.Polygon);
            expect(interactionConfig.update).to.eql(defaultInteractionConfig.update);
            expect(interactionConfig.delete).to.eql(defaultInteractionConfig.delete);
        });
        it("should return a parsed configuration for update, if configured", () => {
            state.update = [{
                layerId: currentLayerId,
                available: true,
                icon: "bi-globe",
                text: "My WFS-T"
            }];

            const interactionConfig = gettersWfst.currentInteractionConfig(state, {currentLayerId});

            expect(consoleSpy.notCalled).to.be.true;
            expect(interactionConfig.update.available).to.be.true;
            expect(interactionConfig.update.icon).to.equal("bi-globe");
            expect(interactionConfig.update.text).to.equal("My WFS-T");
            expect(interactionConfig.LineString).to.eql(defaultInteractionConfig.LineString);
            expect(interactionConfig.Point).to.eql(defaultInteractionConfig.Point);
            expect(interactionConfig.Polygon).to.eql(defaultInteractionConfig.Polygon);
            expect(interactionConfig.delete).to.eql(defaultInteractionConfig.delete);
        });
        it("should return the default configuration if nothing at all is configured for the respective interaction", () => {
            expect(gettersWfst.currentInteractionConfig(state, {currentLayerId})).to.eql(defaultInteractionConfig);
            expect(consoleSpy.notCalled).to.be.true;
        });
        it("should return a parsed configuration if the respective interaction configuration is a string", () => {
            state.lineButton = "My WFS-T";

            const interactionConfig = gettersWfst.currentInteractionConfig(state, {currentLayerId});

            expect(interactionConfig.LineString.available).to.be.true;
            expect(interactionConfig.LineString.text).to.equal("My WFS-T");
            expect(interactionConfig.LineString.icon).to.equal(defaultInteractionConfig.LineString.icon);
            expect(interactionConfig.LineString.multi).to.equal(defaultInteractionConfig.LineString.multi);
            expect(interactionConfig.Point).to.eql(defaultInteractionConfig.Point);
            expect(interactionConfig.Polygon).to.eql(defaultInteractionConfig.Polygon);
            expect(interactionConfig.delete).to.eql(defaultInteractionConfig.delete);
            expect(interactionConfig.update).to.eql(defaultInteractionConfig.update);
        });
        it("should return a parsed configuration if the respective interaction configuration is a boolean", () => {
            state.lineButton = true;

            const interactionConfig = gettersWfst.currentInteractionConfig(state, {currentLayerId});

            expect(consoleSpy.notCalled).to.be.true;
            expect(interactionConfig.LineString.available).to.be.true;
            expect(interactionConfig.LineString.text).to.equal(defaultInteractionConfig.LineString.text);
            expect(interactionConfig.LineString.icon).to.equal(defaultInteractionConfig.LineString.icon);
            expect(interactionConfig.LineString.multi).to.equal(defaultInteractionConfig.LineString.multi);
            expect(interactionConfig.Point).to.eql(defaultInteractionConfig.Point);
            expect(interactionConfig.Polygon).to.eql(defaultInteractionConfig.Polygon);
            expect(interactionConfig.delete).to.eql(defaultInteractionConfig.delete);
            expect(interactionConfig.update).to.eql(defaultInteractionConfig.update);
        });
        it("should return the default configuration if no configuration is given for the respective interaction for the given layerId", () => {
            state.update = [{
                layerId: "someDifferentId",
                available: true,
                icon: "bi-globe",
                text: "My WFS-T"
            }];

            expect(gettersWfst.currentInteractionConfig(state, {currentLayerId})).to.eql(defaultInteractionConfig);
            expect(consoleSpy.notCalled).to.be.true;
        });
    });
    describe("savingErrorMessage", () => {
        let feature;

        beforeEach(() => {
            feature = new Feature();
            state = {
                featureProperties: [
                    {
                        type: "integer",
                        required: true,
                        label: "Ma prop",
                        value: null
                    },
                    {
                        type: "geometry",
                        required: true,
                        value: null
                    }
                ]
            };
        });

        it("should return an error message indicating that no feature has been drawn if the feature given to the getter is not an ol/Feature", () => {
            feature = "somethingDifferent";

            expect(gettersWfst.savingErrorMessage(state)(feature)).to.equal("modules.wfst.error.noFeature");
        });
        it("should return an error message indicating that at least one required property has not received a value", () => {
            expect(gettersWfst.savingErrorMessage(state)(feature)).to.equal("modules.wfst.error.requiredPropertiesNotSet");
        });
        it("should return an empty string if the feature given to the getter is not undefined and all required properties have received a value", () => {
            state.featureProperties[0].value = 42;

            expect(gettersWfst.savingErrorMessage(state)(feature)).to.equal("");
        });
    });
});
