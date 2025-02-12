import {expect} from "chai";
import sinon from "sinon";

import getTheme from "../../../js/getTheme";
import DefaultTheme from "../../../themes/default/components/DefaultTheme.vue";
import SensorTheme from "../../../themes/sensor/components/SensorTheme.vue";


describe("src/modules/getFeatureInfo/js/getTheme.js", () => {
    const components = {DefaultTheme, SensorTheme};
    let warn;

    beforeEach(() => {
        warn = sinon.spy();
        sinon.stub(console, "warn").callsFake(warn);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("getTheme", () => {
        it("return the theme contained in addons", function () {
            const themeFromFeature = "schulinfo",
                addonThemes = ["Trinkwasser", "Schulinfo"];

            expect(getTheme(themeFromFeature, components, addonThemes)).to.be.equals("Schulinfo");
        });
        it("return Default-theme, because the theme is not contained in addons", function () {
            const themeFromFeature = "schulinfo",
                addonThemes = ["Trinkwasser", "SchulinfoXXX"];

            expect(getTheme(themeFromFeature, components, addonThemes)).to.be.equals("DefaultTheme");
        });
        it("return Sensor-theme, because the theme is configured and available", function () {
            const themeFromFeature = "Sensor",
                addonThemes = ["Trinkwasser", "SchulinfoTheme"];

            expect(getTheme(themeFromFeature, components, addonThemes)).to.be.equals("SensorTheme");
        });
        it("return Default-theme, if theme from feature is not defined", function () {
            const themeFromFeature = undefined,
                addonThemes = ["Trinkwasser", "Schulinfo"];

            expect(getTheme(themeFromFeature, components, addonThemes)).to.be.equals("DefaultTheme");
        });
        it("return Default-theme, if theme from feature is null", function () {
            const themeFromFeature = null,
                addonThemes = ["Trinkwasser", "Schulinfo"];

            expect(getTheme(themeFromFeature, components, addonThemes)).to.be.equals("DefaultTheme");
        });

    });

});
