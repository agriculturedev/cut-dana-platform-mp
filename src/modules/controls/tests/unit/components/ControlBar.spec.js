import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import ControlBar from "../../../components/ControlBar.vue";
import visibilityChecker from "../../../../../shared/js/utils/visibilityChecker";

config.global.mocks.$t = key => key;

describe("src/modules/controls/components/ControlBar.vue", () => {
    let store,
        components,
        addonControls,
        controlsConfig,
        activatedExpandable;

    beforeEach(() => {
        components = {
            BackForward: {
                name: "BackForward",
                template: "<span />"
            },
            Button3d: {
                name: "Button3d",
                template: "<span />"
            },
            Zoom: {
                name: "ZoomInAndOut",
                template: "<span />"
            }
        };
        addonControls = {};
        controlsConfig = sinon.stub();
        activatedExpandable = false;
        store = createStore({
            namespaced: true,
            modules: {
                Controls: {
                    namespaced: true,
                    getters: {
                        activatedExpandable: () => activatedExpandable,
                        componentMap: () => components,
                        addonControls: () => addonControls
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        mode: sinon.stub()
                    }
                }
            },
            getters: {
                controlsConfig: () => controlsConfig,
                deviceMode: sinon.stub(),
                uiStyle: () => "",
                portalConfig: sinon.stub()
            }
        });
    });
    afterEach(() => {
        sinon.restore();
    });

    it("renders the buttons group", () => {
        const wrapper = mount(ControlBar, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find(".btn-group-controls").exists()).to.be.true;
    });

    it("renders the button", async () => {
        const wrapper = mount(ControlBar, {
            global: {
                plugins: [store]
            }});

        await wrapper.vm.categorizedControls.expandable.push("control");

        expect(wrapper.find(".control-icon-controls").exists()).to.be.true;
    });

    it("renders the button for control from addons", async () => {
        addonControls.AddonControl = {
            name: "AddonControl",
            template: "<span id=\"id\"></span>"
        };
        controlsConfig = {
            AddonControl: true
        };
        sinon.stub(visibilityChecker, "isModuleVisible").returns(true);
        const wrapper = mount(ControlBar, {
            global: {
                plugins: [store]
            }});

        await wrapper.vm.$nextTick();
        expect(wrapper.find("#id").exists()).to.be.true;
    });
    it("renders the button for expandable control from addons", async () => {
        activatedExpandable = true;
        addonControls.AddonControl = {
            name: "AddonControl",
            template: "<span id=\"id\"></span>"
        };
        controlsConfig = {
            expandable: {
                AddonControl: true
            }
        };
        sinon.stub(visibilityChecker, "isModuleVisible").returns(true);
        const wrapper = mount(ControlBar, {
            global: {
                plugins: [store]
            }});

        await wrapper.vm.$nextTick();
        expect(wrapper.find("#id").exists()).to.be.true;
    });

    describe("fillCategorizedControls", () => {
        it("should fill categorizedControls.initialVisible", async () => {
            const wrapper = mount(ControlBar, {
                global: {
                    plugins: [store]
                }});

            await wrapper.vm.fillCategorizedControls("Zoom");

            expect(wrapper.vm.categorizedControls.initialVisible).to.be.an("array").that.is.not.empty;
            expect(wrapper.vm.categorizedControls.expandable).to.be.an("array").that.is.empty;
        });

        it("should fill categorizedControls.expandable", async () => {
            sinon.stub(ControlBar.methods, "checkIsVisible").returns(true);
            const wrapper = mount(ControlBar, {
                global: {
                    plugins: [store]
                }});

            await wrapper.vm.fillCategorizedControls("Zoom", true);

            expect(wrapper.vm.categorizedControls.initialVisible).to.be.an("array").that.is.empty;
            expect(wrapper.vm.categorizedControls.expandable).to.be.an("array").that.is.not.empty;
        });
    });
});
