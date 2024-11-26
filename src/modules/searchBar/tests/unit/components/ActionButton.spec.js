import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import ActionButton from "../../../components/ActionButton.vue";

config.global.mocks.$t = key => key;

describe("src/modules/searchBar/components/ActionButton.vue", () => {
    let store,
        wrapper,
        callActionSpy,
        searchBarActions,
        searchBarMutations,
        isModuleAvailable;

    beforeEach(() => {
        isModuleAvailable = true;
        searchBarActions = {
            activateAction: sinon.spy()
        };
        searchBarMutations = {
            setSearchResultsActive: sinon.spy(),
            setCurrentActionEvent: sinon.spy()
        };
        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        ActionButton,
                        SearchBar: {
                            namespaced: true,
                            actions: searchBarActions,
                            mutations: searchBarMutations,
                            getters: {
                                iconsByActions: sinon.stub().returns(
                                    {
                                        addLayerToTopicTree: "bi-plus-circle",
                                        activateLayerInTopicTree: "bi-eye",
                                        highlightFeature: "bi-lightbulb",
                                        openGetFeatureInfo: "bi-info-circle",
                                        setMarker: "bi-geo-alt-fill",
                                        zoomToResult: "bi-zoom-in",
                                        startRouting: "bi-signpost-2"
                                    }
                                )
                            }
                        }
                    }
                }
            },
            getters: {
                isModuleAvailable: () => () => isModuleAvailable
            }
        });
        callActionSpy = sinon.spy(ActionButton.methods, "callAction");
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("render ActionButton", () => {
        it("should render button with 'setMarker' icon", async () => {
            const props = {
                actionName: "setMarker",
                actionArgs: {
                    coordinates: [1, 2]
                }
            };

            wrapper = mount(ActionButton, {
                global: {
                    plugins: [store]
                },
                props
            });

            expect(wrapper.find("button").exists()).to.be.true;
            expect(wrapper.find("i").exists()).to.be.true;
            expect(wrapper.find("i").attributes("class")).to.be.equals(wrapper.vm.iconsByActions[props.actionName]);
            await wrapper.find("button").trigger("click");
            expect(callActionSpy.calledOnce).to.be.true;
            expect(searchBarActions.activateAction.calledOnce).to.be.true;
            expect(searchBarActions.activateAction.firstCall.args[1]).to.be.deep.equals(props);
            expect(searchBarMutations.setCurrentActionEvent.calledOnce).to.be.true;
        });

        it("should render button with 'zoomToResult' icon", async () => {
            const props = {
                actionName: "zoomToResult",
                actionArgs: {
                    coordinates: [1, 2]
                }
            };

            wrapper = mount(ActionButton, {
                global: {
                    plugins: [store]
                },
                props
            });

            expect(wrapper.find("button").exists()).to.be.true;
            expect(wrapper.find("i").exists()).to.be.true;
            expect(wrapper.find("i").attributes("class")).to.be.equals(wrapper.vm.iconsByActions[props.actionName]);
            await wrapper.find("button").trigger("click");
            expect(callActionSpy.calledOnce).to.be.true;
            expect(searchBarActions.activateAction.calledOnce).to.be.true;
            expect(searchBarActions.activateAction.firstCall.args[1]).to.be.deep.equals(props);
            expect(searchBarMutations.setCurrentActionEvent.calledOnce).to.be.true;
        });

        it("should render button with 'openGetFeatureInfo' icon", async () => {
            const props = {
                actionName: "openGetFeatureInfo",
                actionArgs: {
                    feature: {
                        id: "feature"
                    },
                    layer: {
                        typ: "WMS"
                    }
                }
            };

            wrapper = mount(ActionButton, {
                global: {
                    plugins: [store]
                },
                props
            });

            expect(wrapper.find("button").exists()).to.be.true;
            expect(wrapper.find("i").exists()).to.be.true;
            expect(wrapper.find("i").attributes("class")).to.be.equals(wrapper.vm.iconsByActions[props.actionName]);
            await wrapper.find("button").trigger("click");
            expect(callActionSpy.calledOnce).to.be.true;
            expect(searchBarActions.activateAction.calledOnce).to.be.true;
            expect(searchBarActions.activateAction.firstCall.args[1]).to.be.deep.equals(props);
            expect(searchBarMutations.setCurrentActionEvent.calledOnce).to.be.true;
        });

        it("should render button with 'highlightFeature' icon", async () => {
            const props = {
                actionName: "highlightFeature",
                actionArgs: {
                    feature: {
                        id: "feature"
                    },
                    layer: {
                        typ: "WMS"
                    }
                }
            };

            wrapper = mount(ActionButton, {
                global: {
                    plugins: [store]
                },
                props
            });

            expect(wrapper.find("button").exists()).to.be.true;
            expect(wrapper.find("i").exists()).to.be.true;
            expect(wrapper.find("i").attributes("class")).to.be.equals(wrapper.vm.iconsByActions[props.actionName]);
            await wrapper.find("button").trigger("click");
            expect(callActionSpy.calledOnce).to.be.true;
            expect(searchBarActions.activateAction.calledOnce).to.be.true;
            expect(searchBarActions.activateAction.firstCall.args[1]).to.be.deep.equals(props);
            expect(searchBarMutations.setCurrentActionEvent.calledOnce).to.be.true;
        });

        it("should render button with 'activateLayerInTopicTree' icon", async () => {
            const props = {
                actionName: "activateLayerInTopicTree",
                actionArgs: {
                    layerId: "layerId",
                    source: {
                        id: "layerId"
                    }
                }
            };

            wrapper = mount(ActionButton, {
                global: {
                    plugins: [store]
                },
                props
            });

            expect(wrapper.find("button").exists()).to.be.true;
            expect(wrapper.find("i").exists()).to.be.true;
            expect(wrapper.find("i").attributes("class")).to.be.equals(wrapper.vm.iconsByActions[props.actionName]);
            await wrapper.find("button").trigger("click");
            expect(callActionSpy.calledOnce).to.be.true;
            expect(searchBarActions.activateAction.calledOnce).to.be.true;
            expect(searchBarActions.activateAction.firstCall.args[1]).to.be.deep.equals(props);
            expect(searchBarMutations.setCurrentActionEvent.calledOnce).to.be.true;
        });

        it("should render button with 'addLayerToTopicTree' icon", async () => {
            const props = {
                actionName: "addLayerToTopicTree",
                actionArgs: {
                    layerId: "layerId",
                    source: {
                        id: "layerId"
                    }
                }
            };

            wrapper = mount(ActionButton, {
                global: {
                    plugins: [store]
                },
                props
            });

            expect(wrapper.find("button").exists()).to.be.true;
            expect(wrapper.find("i").exists()).to.be.true;
            expect(wrapper.find("i").attributes("class")).to.be.equals(wrapper.vm.iconsByActions[props.actionName]);
            await wrapper.find("button").trigger("click");
            expect(callActionSpy.calledOnce).to.be.true;
            expect(searchBarActions.activateAction.calledOnce).to.be.true;
            expect(searchBarActions.activateAction.firstCall.args[1]).to.be.deep.equals(props);
            expect(searchBarMutations.setCurrentActionEvent.calledOnce).to.be.true;
        });
    });
    describe("methods", () => {
        it("displayAction shall return true if actionName is not 'startRouting'", () => {
            const props = {
                actionName: "addLayerToTopicTree",
                actionArgs: { }
            };

            wrapper = mount(ActionButton, {
                global: {
                    plugins: [store]
                },
                props
            });

            expect(wrapper.vm.displayAction()).to.be.true;
        });
        it("displayAction shall return true if actionName is 'startRouting' and routing is available", () => {
            const props = {
                actionName: "startRouting",
                actionArgs: { }
            };

            wrapper = mount(ActionButton, {
                global: {
                    plugins: [store]
                },
                props
            });

            expect(wrapper.vm.displayAction()).to.be.true;
        });
        it("displayAction shall return false if actionName is 'startRouting' and routing is not available", () => {
            const props = {
                actionName: "startRouting",
                actionArgs: { }
            };

            isModuleAvailable = false;
            wrapper = mount(ActionButton, {
                global: {
                    plugins: [store]
                },
                props
            });

            expect(wrapper.vm.displayAction()).to.be.false;
        });
    });

});
