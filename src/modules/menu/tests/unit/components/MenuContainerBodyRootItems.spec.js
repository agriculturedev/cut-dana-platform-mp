import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import MenuContainerBodyRootItems from "../../../components/MenuContainerBodyRootItems.vue";
import {expect} from "chai";
import MenuContainerBodyRootItemElement from "../../../components/MenuContainerBodyRootItemElement.vue";

config.global.mocks.$t = key => key;

describe("src/modules/menu/MenuContainerBodyRootItems.vue", () => {
    let store,
        sections,
        pathMainMenu,
        pathSecondaryMenu;

    beforeEach(() => {
        sections = [
            {icon: "bi-test", name: "sampleSectionOne"},
            {icon: "bi-test", name: "sampleSectionTwo", description: "descriptionTwo"},
            {icon: "bi-test", name: "sampleSectionThree", description: "descriptionthree"}
        ];
        pathMainMenu = ["mainMenu", "sections", 0];
        pathSecondaryMenu = ["secondaryMenu", "sections", 0];
        store = createStore({
            modules: {
                Menu: {
                    namespaced: true,
                    getters: {
                        section: () => () => sections,
                        customMenuElementIcon: () => "bi-customMenuElementIcon"
                    }
                },
                Modules: {
                    namespaced: true
                }
            }
        });
    });

    it("renders the component as main menu", () => {
        const wrapper = shallowMount(MenuContainerBodyRootItems, {
            global: {
                plugins: [store]
            },
            propsData: {idAppendix: "mainMenu", path: pathMainMenu}
        });

        expect(wrapper.find("#mp-menu-body-items-mainMenu").exists()).to.be.true;
    });

    it("contains a list element and a MenuContainerBodyRootItemElements in the main menu for each configured section item", () => {
        const wrapper = shallowMount(MenuContainerBodyRootItems, {
            global: {
                plugins: [store]
            },
            propsData: {idAppendix: "mainMenu", path: pathMainMenu}
        });


        expect(wrapper.findAllComponents(MenuContainerBodyRootItemElement).length).to.be.equal(sections.length);
        expect(wrapper.findAll("#mp-menu-body-items-element-0-mainMenu")[0].attributes("name")).to.be.equal(sections[0].name);
        expect(wrapper.findAll("#mp-menu-body-items-element-0-mainMenu")[0].attributes("icon")).to.be.equal(sections[0].icon);
        expect(wrapper.findAll("#mp-menu-body-items-element-0-mainMenu")[0].attributes("description")).to.be.equal("");
        expect(wrapper.findAll("#mp-menu-body-items-element-0-mainMenu")[0].attributes("path")).to.be.equal(pathMainMenu.join(",") + ",0");

        expect(wrapper.findAll("#mp-menu-body-items-element-1-mainMenu")[0].attributes("name")).to.be.equal(sections[1].name);
        expect(wrapper.findAll("#mp-menu-body-items-element-1-mainMenu")[0].attributes("icon")).to.be.equal(sections[1].icon);
        expect(wrapper.findAll("#mp-menu-body-items-element-1-mainMenu")[0].attributes("description")).to.be.equal(sections[1].description);
        expect(wrapper.findAll("#mp-menu-body-items-element-1-mainMenu")[0].attributes("path")).to.be.equal(pathMainMenu.join(",") + ",1");

        expect(wrapper.findAll("#mp-menu-body-items-element-2-mainMenu")[0].attributes("name")).to.be.equal(sections[2].name);
        expect(wrapper.findAll("#mp-menu-body-items-element-2-mainMenu")[0].attributes("icon")).to.be.equal(sections[2].icon);
        expect(wrapper.findAll("#mp-menu-body-items-element-2-mainMenu")[0].attributes("description")).to.be.equal(sections[2].description);
        expect(wrapper.findAll("#mp-menu-body-items-element-2-mainMenu")[0].attributes("path")).to.be.equal(pathMainMenu.join(",") + ",2");
    });

    it("renders the component as secondary menu", () => {
        const wrapper = shallowMount(MenuContainerBodyRootItems, {
            global: {
                plugins: [store]
            },
            propsData: {idAppendix: "secondaryMenu", path: pathSecondaryMenu}
        });

        expect(wrapper.find("#mp-menu-body-items-secondaryMenu").exists()).to.be.true;
    });

    it("contains a list element and a MenuContainerBodyRootItemElements in the main menu for each configured section item", () => {
        const wrapper = shallowMount(MenuContainerBodyRootItems, {
            global: {
                plugins: [store]
            },
            propsData: {idAppendix: "secondaryMenu", path: pathSecondaryMenu}
        });

        expect(wrapper.findAllComponents(MenuContainerBodyRootItemElement).length).to.be.equal(sections.length);
        expect(wrapper.findAll("#mp-menu-body-items-element-0-secondaryMenu")[0].attributes("name")).to.be.equal(sections[0].name);
        expect(wrapper.findAll("#mp-menu-body-items-element-0-secondaryMenu")[0].attributes("icon")).to.be.equal(sections[0].icon);
        expect(wrapper.findAll("#mp-menu-body-items-element-0-secondaryMenu")[0].attributes("description")).to.be.equal("");
        expect(wrapper.findAll("#mp-menu-body-items-element-0-secondaryMenu")[0].attributes("path")).to.be.equal(pathSecondaryMenu.join(",") + ",0");

        expect(wrapper.findAll("#mp-menu-body-items-element-1-secondaryMenu")[0].attributes("name")).to.be.equal(sections[1].name);
        expect(wrapper.findAll("#mp-menu-body-items-element-1-secondaryMenu")[0].attributes("icon")).to.be.equal(sections[1].icon);
        expect(wrapper.findAll("#mp-menu-body-items-element-1-secondaryMenu")[0].attributes("description")).to.be.equal(sections[1].description);
        expect(wrapper.findAll("#mp-menu-body-items-element-1-secondaryMenu")[0].attributes("path")).to.be.equal(pathSecondaryMenu.join(",") + ",1");

        expect(wrapper.findAll("#mp-menu-body-items-element-2-secondaryMenu")[0].attributes("name")).to.be.equal(sections[2].name);
        expect(wrapper.findAll("#mp-menu-body-items-element-2-secondaryMenu")[0].attributes("icon")).to.be.equal(sections[2].icon);
        expect(wrapper.findAll("#mp-menu-body-items-element-2-secondaryMenu")[0].attributes("description")).to.be.equal(sections[2].description);
        expect(wrapper.findAll("#mp-menu-body-items-element-2-secondaryMenu")[0].attributes("path")).to.be.equal(pathSecondaryMenu.join(",") + ",2");
    });

    it("section contains 'customMenuElement' without icon uses default icon from state", () => {
        sections = [{
            type: "customMenuElement",
            name: "Url öffnen",
            openURL: "https://geoinfo.hamburg.de/"
        }];
        const wrapper = shallowMount(MenuContainerBodyRootItems, {
            global: {
                plugins: [store]
            },
            propsData: {idAppendix: "secondaryMenu", path: pathSecondaryMenu}
        });

        expect(sections[0].icon).to.be.equals("bi-customMenuElementIcon");
        expect(wrapper.findAllComponents(MenuContainerBodyRootItemElement).length).to.be.equal(sections.length);
        expect(wrapper.findAll("#mp-menu-body-items-element-0-secondaryMenu")[0].attributes("name")).to.be.equal(sections[0].name);
        expect(wrapper.findAll("#mp-menu-body-items-element-0-secondaryMenu")[0].attributes("icon")).to.be.equal(sections[0].icon);
        expect(wrapper.findAll("#mp-menu-body-items-element-0-secondaryMenu")[0].attributes("description")).to.be.equal("");
        expect(wrapper.findAll("#mp-menu-body-items-element-0-secondaryMenu")[0].attributes("path")).to.be.equal(pathSecondaryMenu.join(",") + ",0");
    });

    it("section contains 'customMenuElement' with icon", () => {
        sections = [{
            type: "customMenuElement",
            name: "Url öffnen",
            openURL: "https://geoinfo.hamburg.de/",
            icon: "bi-custom-icon"
        }];
        const wrapper = shallowMount(MenuContainerBodyRootItems, {
            global: {
                plugins: [store]
            },
            propsData: {idAppendix: "secondaryMenu", path: pathSecondaryMenu}
        });

        expect(sections[0].icon).not.to.be.equals("bi-customMenuElementIcon");
        expect(wrapper.findAllComponents(MenuContainerBodyRootItemElement).length).to.be.equal(sections.length);
        expect(wrapper.findAll("#mp-menu-body-items-element-0-secondaryMenu")[0].attributes("name")).to.be.equal(sections[0].name);
        expect(wrapper.findAll("#mp-menu-body-items-element-0-secondaryMenu")[0].attributes("icon")).to.be.equal(sections[0].icon);
        expect(wrapper.findAll("#mp-menu-body-items-element-0-secondaryMenu")[0].attributes("description")).to.be.equal("");
        expect(wrapper.findAll("#mp-menu-body-items-element-0-secondaryMenu")[0].attributes("path")).to.be.equal(pathSecondaryMenu.join(",") + ",0");
    });
});
