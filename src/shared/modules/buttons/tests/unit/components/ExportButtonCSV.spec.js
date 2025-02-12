import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import ExportButtonCSV from "../../../components/ExportButtonCSV.vue";

config.global.mocks.$t = key => key;

describe("src/shared/modules/buttons/components/ExportButtonCSV.vue", () => {
    before(() => {
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });
    describe("createFilename", () => {
        const wrapper = shallowMount(ExportButtonCSV, {
            propsData: {}
        });

        expect(wrapper.vm.createFilename("prefix", "YYYY")).to.equal("prefix" + String(new Date().getFullYear()) + ".csv");
    });
    describe("template", () => {
        const wrapper = shallowMount(ExportButtonCSV, {
            propsData: {}
        });

        expect(wrapper.find("button").exists()).to.be.true;
    });
});
