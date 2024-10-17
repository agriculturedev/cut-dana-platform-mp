import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import AboutComponent from "../../../components/AboutModule.vue";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/about/components/AboutModule.vue", () => {
    let store;

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                namespaced: true,
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        About: {
                            namespaced: true,
                            getters: {
                                abstractText: () => "Test",
                                contact: () => null,
                                logo: () => "",
                                logoLink: () => "",
                                metaUrl: () => "",
                                noMetadataLoaded: () => "",
                                showAdditionalMetaData: () => true,
                                title: () => "",
                                version: () => "3.0.0",
                                versionLink: () => "",
                                ustId: () => "DE12345",
                                privacyStatementText: () => "Privacy Statement",
                                privacyStatementUrl: () => "https://privacyStatementUrl",
                                accessibilityText: () => "Accessibility Statement",
                                accessibilityUrl: () => "https://accessibilityStatementUrl"
                            },
                            actions: {
                                initializeAboutInfo: () => sinon.stub()
                            }
                        }
                    }
                },
                Menu: {
                    namespaced: true,
                    getters: {
                        mainMenu: () => {
                            return {
                                sections: [
                                    [
                                        {
                                            type: "contact"
                                        },
                                        {
                                            type: "about"
                                        }
                                    ]
                                ]
                            };
                        },
                        secondaryMenu: () => {
                            return {
                                sections: [
                                    [
                                        {
                                            type: "section1"
                                        },
                                        {
                                            type: "section2"
                                        }
                                    ]
                                ]
                            };
                        }
                    }
                }
            }
        });
    });

    it("should have an existing title", () => {
        const wrapper = mount(AboutComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find(".subtitle")).to.exist;
    });
    it("should have an abstract", async () => {
        const wrapper = mount(AboutComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find(".abstract")).to.exist;
    });
    it("should have a logo and version", async () => {
        const wrapper = mount(AboutComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("div.logoAndVersion")).to.exist;
        expect(wrapper.find("div.logoAndVersion > a.logo")).to.exist;
        expect(wrapper.find("div.logoAndVersion > a.logo > img")).to.exist;
        expect(wrapper.find("div.logoAndVersion > span.version")).to.exist;
        expect(wrapper.find("div.logoAndVersion > span.version > a")).to.exist;
        expect(wrapper.find("div.logoAndVersion > span.version > a").text()).to.equals("common:modules.about.version3.0.0");
    });
    it("should have an ustId", async () => {
        const wrapper = mount(AboutComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("div.ustIdWrapper").exists()).to.be.true;
        expect(wrapper.find(".ustId").exists()).to.be.true;
        expect(wrapper.find(".ustId").text()).to.equals("DE12345");
    });
    it("should have a privacy statement section", async () => {
        const wrapper = mount(AboutComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("div.privacyStatementWrapper").exists()).to.be.true;
        expect(wrapper.find(".privacyStatementText").exists()).to.be.true;
        expect(wrapper.find(".privacyStatementText").text()).to.equals("Privacy Statement");
        expect(wrapper.find("button.privacyStatementButton").exists()).to.be.true;
    });
    it("should have an accessibilty statement section", async () => {
        const wrapper = mount(AboutComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("div.accessibilityStatementWrapper").exists()).to.be.true;
        expect(wrapper.find(".accessibilityText").exists()).to.be.true;
        expect(wrapper.find(".accessibilityText").text()).to.equals("Accessibility Statement");
        expect(wrapper.find("button.accessibilityStatementButton").exists()).to.be.true;
    });
    it("should have a contact button", async () => {
        const wrapper = mount(AboutComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("button.openContactButton").exists()).to.be.true;
        expect(wrapper.find("button.openContactButton").text()).to.equals("common:modules.about.contactButton");
    });
});
