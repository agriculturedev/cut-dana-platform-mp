import {createStore} from "vuex";
import {config, mount, shallowMount} from "@vue/test-utils";
import {expect} from "chai";

import WfsSearchField from "../../../components/WfsSearchField.vue";
import WfsSearchLiteral from "../../../components/WfsSearchLiteral.vue";
import WfsSearchModule from "../../../store/indexWfsSearch";

config.global.mocks.$t = key => key;

describe("src/modules/wfsSearch/components/WfsSearchLiteral.vue", () => {
    let store;

    beforeEach(() => {
        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        WfsSearch: WfsSearchModule
                    }
                }
            }
        });
    });

    it("renders a field when literal has field", () => {
        const wrapper = shallowMount(WfsSearchLiteral, {
            global: {
                plugins: [store]
            },
            props: {
                literal: {
                    field: {
                        id: "test",
                        usesId: false,
                        fieldName: "fieldName",
                        inputLabel: "inputLabel"
                    }
                }
            }
        });

        expect(wrapper.findComponent(WfsSearchField).exists()).to.be.true;
    });

    it("renders more literals when literal has clause", () => {
        const wrapper = mount(WfsSearchLiteral, {
            global: {
                plugins: [store]
            },
            props: {
                literal: {
                    clause: {
                        literals: [
                            {literal: "test"},
                            {literal: "test"},
                            {literal: "test"}
                        ]
                    }
                }
            }
        });

        expect(wrapper.findAllComponents(WfsSearchLiteral).length).to.equal(3);

        // child fields are not rendered due to shallow mounting
        expect(wrapper.findComponent(WfsSearchField).exists()).to.be.false;
    });

    it("renders nothing on empty literal", () => {
        const wrapper = shallowMount(WfsSearchLiteral, {
            global: {
                plugins: [store]
            },
            props: {
                literal: {}
            }
        });

        expect(wrapper.find("div").exists()).to.be.false;
        expect(wrapper.findComponent(WfsSearchField).exists()).to.be.false;
        expect(wrapper.findAllComponents(WfsSearchLiteral).length).to.equal(0);
    });
});
