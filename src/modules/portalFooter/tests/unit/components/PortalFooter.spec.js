import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import PortalFooterComponent from "../../../components/PortalFooter.vue";
import {expect} from "chai";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/portalFooter/components/PortalFooter.vue", () => {
    const urls = [{
        bezeichnung: "abc",
        url: "https://abc.de",
        alias: "Alphabet",
        alias_mobile: "ABC"
    }];
    let isMobile,
        store;

    beforeEach(() => {
        isMobile = false;

        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        PortalFooter: {
                            namespaced: true,
                            getters: {
                                scaleLine: () => true,
                                seperator: () => true,
                                urls: () => urls,
                                type: () => sinon.stub(),
                                configPaths: () => sinon.stub()
                            }
                        }
                    }
                },
                Menu: {
                    namespaced: true,
                    getters: {
                        mainExpanded: () => true,
                        secondaryExpanded: () => true,
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
            },
            getters: {
                isMobile: () => isMobile
            },
            actions: {
                initializeModule: sinon.stub()
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders the footer", () => {
        const wrapper = shallowMount(PortalFooterComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#module-portal-footer").exists()).to.be.true;
    });

    it("renders the urls in footer", () => {
        const wrapper = shallowMount(PortalFooterComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("a.footerUrl").exists()).to.be.true;
        expect(wrapper.find("a.footerUrl").text()).to.equals("Alphabet");
        expect(wrapper.find("a.footerUrl").attributes().href).to.equals("https://abc.de");
    });

    it("renders the mobile urls in footer", () => {
        isMobile = true;

        const wrapper = shallowMount(PortalFooterComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("a.footerUrl").exists()).to.be.true;
        expect(wrapper.find("a.footerUrl").text()).to.equals("ABC");
        expect(wrapper.find("a.footerUrl").attributes().href).to.equals("https://abc.de");
    });

    it("renders scaleLine exist", () => {
        const wrapper = shallowMount(PortalFooterComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("scale-line-stub").exists()).to.be.true;
    });

    it("renders imprint link", () => {
        const wrapper = shallowMount(PortalFooterComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find(".impressumLink").exists()).to.be.true;
    });
});
