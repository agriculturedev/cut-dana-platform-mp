import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import ExportButtonGeoJSON from "../../../components/ExportButtonGeoJSON.vue";

config.global.mocks.$t = key => key;

describe("src/shared/modules/buttons/components/exportButtonGeoJSON.vue", () => {
    before(() => {
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });
    describe("createFilename", () => {
        const wrapper = shallowMount(ExportButtonGeoJSON, {
            propsData: {}
        });

        expect(wrapper.vm.createFilename("prefix", "YYYY")).to.equal("prefix" + String(new Date().getFullYear()));
    });
    describe("template", () => {
        const wrapper = shallowMount(ExportButtonGeoJSON, {
            propsData: {}
        });

        expect(wrapper.find("button").exists()).to.be.true;
    });
});
