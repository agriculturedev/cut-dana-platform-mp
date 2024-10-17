import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import LayerComponentIconSubMenu from "../../../components/LayerComponentIconSubMenu.vue";

config.global.mocks.$t = key => key;

describe("src/modules/layerTree/components/LayerComponentIconSubMenu.vue", () => {
    let layer,
        propsData,
        wrapper;

    beforeEach(() => {
        layer = {
            id: "1",
            name: "layer",
            typ: "WMS",
            datasets: [
                {
                    md_id: "123456789"
                }
            ]
        };

        propsData = {
            layerConf: layer
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders the sub menu icon given as property to the component", () => {
        wrapper = shallowMount(LayerComponentIconSubMenu, {
            propsData: propsData
        });

        expect(wrapper.find("#layer-component-icon-sub-menu-" + propsData.layerConf.id).exists()).to.be.true;
    });

    it("render button of sub menu icon", async () => {
        wrapper = shallowMount(LayerComponentIconSubMenu, {
            propsData: propsData
        });

        expect(wrapper.find("#layer-component-icon-sub-menu-" + propsData.layerConf.id).exists()).to.be.true;
        expect(wrapper.find("#layer-component-icon-sub-menu-button-" + propsData.layerConf.id).exists()).to.be.true;
    });
});
