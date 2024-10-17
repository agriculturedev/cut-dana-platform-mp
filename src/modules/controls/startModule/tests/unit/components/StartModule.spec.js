import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import StartModuleComponent from "../../../components/StartModule.vue";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/controls/startModule/components/StartModule.vue", () => {
    let setActiveSpy = sinon.spy(),
        store;

    beforeEach(() => {
        setActiveSpy = sinon.spy();

        store = createStore({
            modules: {
                Controls: {
                    namespaced: true,
                    modules: {
                        StartModule: {
                            namespaced: true,
                            actions: {
                                setConfiguredModuleStates: sinon.stub(),
                                onClick: sinon.stub()
                            },
                            getters: {
                                configuredModuleStates: () => [],
                                mainMenu: () => [],
                                secondaryMenu: () => [{
                                    type: "selectFeatures"
                                },
                                {
                                    type: "scaleSwitcher"
                                }]
                            }
                        }
                    }
                },
                Modules: {
                    namespaced: true,
                    modules: {
                        SelectFeatures: {
                            namespaced: true,
                            state: {
                                name: "SelectFeatures",
                                type: "selectFeatures"
                            },
                            mutations: {
                                setActive: setActiveSpy
                            }
                        },
                        ScaleSwitcher: {
                            namespaced: true,
                            state: {
                                name: "ScaleSwitcher",
                                type: "scaleSwitcher"
                            }
                        }
                    }
                }
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("render control", () => {
        it("should render the control", () => {
            const wrapper = shallowMount(StartModuleComponent, {
                global: {
                    plugins: [store]
                }});

            expect(wrapper.find("div#start-module-button").exists()).to.be.true;
        });
    });
});
