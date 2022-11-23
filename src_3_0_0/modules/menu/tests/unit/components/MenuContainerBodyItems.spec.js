import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import MenuContainerBodyItems from "../../../components/MenuContainerBodyItems.vue";
import {expect} from "chai";
import MenuContainerBodyElement from "../../../components/MenuContainerBodyElement.vue";

config.global.mocks.$t = key => key;

describe("src_3_0_0/modules/menu/MenuContainerBodyItems.vue", () => {
    let store;
    const sampleSection = [
        {icon: "bi-test", name: "sampleSectionOne"},
        {icon: "bi-test", name: "sampleSectionTwo"},
        {icon: "bi-test", name: "sampleSectionThree"}
    ];

    beforeEach(() => {
        store = createStore({
            namespaces: true,
            modules: {
                Menu: {
                    namespaced: true,
                    getters: {
                        section: state => () => state.testSection
                    },
                    state: {
                        testSection: []
                    },
                    mutations: {
                        setTestSection (state, section) {
                            state.testSection = section;
                        }
                    }
                }
            }
        });
    });

    it("renders the component as main menu", () => {
        const wrapper = shallowMount(MenuContainerBodyItems, {
            global: {
                plugins: [store]
            },
            propsData: {idAppendix: "mainMenu"}
        });

        expect(wrapper.find("#mp-menu-body-items-mainMenu").exists()).to.be.true;
    });

    it("contains a list element and a MenuContainerBodyElements in the main menu for each configured section item", () => {
        store.commit("Menu/setTestSection", sampleSection);
        const wrapper = shallowMount(MenuContainerBodyItems, {
            global: {
                plugins: [store]
            },
            propsData: {idAppendix: "mainMenu"}
        });


        expect(wrapper.findAll("li").length).to.be.equal(sampleSection.length);
        expect(wrapper.findAllComponents(MenuContainerBodyElement).length).to.be.equal(sampleSection.length);
    });

    it("renders the component as secondary menu", () => {
        const wrapper = shallowMount(MenuContainerBodyItems, {
            global: {
                plugins: [store]
            },
            propsData: {idAppendix: "secondaryMenu"}
        });

        expect(wrapper.find("#mp-menu-body-items-secondaryMenu").exists()).to.be.true;
    });

    it("contains a list element and a MenuContainerBodyElements in the main menu for each configured section item", () => {
        store.commit("Menu/setTestSection", sampleSection);
        const wrapper = shallowMount(MenuContainerBodyItems, {
            global: {
                plugins: [store]
            },
            propsData: {idAppendix: "secondaryMenu"}
        });

        expect(wrapper.findAll("li").length).to.be.equal(sampleSection.length);
        expect(wrapper.findAllComponents(MenuContainerBodyElement).length).to.be.equal(sampleSection.length);
    });
});
