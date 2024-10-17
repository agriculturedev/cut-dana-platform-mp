import {createStore} from "vuex";
import {config, shallowMount, mount} from "@vue/test-utils";
import LayerPillsComponent from "../../../components/LayerPills.vue";
import {expect} from "chai";
import sinon from "sinon";

config.global.mocks.$t = key => key;


describe("src/modules/LayerPills.vue", () => {
    let store,
        wrapper,
        visibleLayers,
        active,
        mobileOnly,
        visibleSubjectDataLayers,
        mobile,
        initializeModuleSpy,
        replaceByIdInLayerConfigSpy,
        setVisibleSubjectDataLayersSpy,
        startLayerInformationSpy;

    beforeEach(() => {
        active = true;
        visibleSubjectDataLayers = [{
            name: "layer1"
        }];
        mobile = false;
        mobileOnly = false;
        initializeModuleSpy = sinon.spy();
        replaceByIdInLayerConfigSpy = sinon.spy();
        setVisibleSubjectDataLayersSpy = sinon.spy();
        startLayerInformationSpy = sinon.spy();
        visibleLayers = [
            {id: 0, name: "layer1", typ: "WMS"},
            {id: 1, name: "layer2", typ: "WMS"},
            {id: 2, name: "layer3", typ: "WFS"},
            {id: 3, name: "layer4", typ: "WFS"}
        ];
        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        LayerPills: {
                            namespaced: true,
                            getters: {
                                active: () => active,
                                mobileOnly: () => mobileOnly,
                                configPaths: () => ["portalConfig.map.layerPills"],
                                type: () => "layerPills",
                                visibleSubjectDataLayers: () => visibleSubjectDataLayers
                            },
                            mutations: {
                                setActive: sinon.stub(),
                                setMobileOnly: sinon.stub(),
                                setVisibleSubjectDataLayers: setVisibleSubjectDataLayersSpy
                            }
                        },
                        LayerInformation: {
                            namespaced: true,
                            actions: {
                                startLayerInformation: startLayerInformationSpy
                            }
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        mode: () => "2D"
                    }
                }
            },
            getters: {
                isMobile: () => mobile,
                visibleSubjectDataLayerConfigs: () => visibleLayers
            },
            mutations: {
                setVisibleSubjectDataLayerConfigs: (state, layer) => {
                    visibleLayers = layer;
                }
            },
            actions: {
                replaceByIdInLayerConfig: replaceByIdInLayerConfigSpy,
                initializeModule: initializeModuleSpy
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("renders or does not render div", () => {
        it("renders div", () => {
            wrapper = shallowMount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});
            expect(wrapper.find("#layer-pills").exists()).to.be.true;
        });

        it("no visibleSubjectDataLayers", () => {
            visibleSubjectDataLayers = [];

            wrapper = shallowMount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});

            expect(wrapper.find("#layer-pills").exists()).to.be.false;
        });

        it("should not exist if active false", () => {
            active = false;

            wrapper = shallowMount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});
            expect(wrapper.find("#layer-pills").exists()).to.be.false;
        });

        it("should set class if mobileOnly true", () => {
            mobileOnly = true;

            wrapper = shallowMount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});
            expect(wrapper.find("#layer-pills").classes()).to.contain("mobileOnly");
        });
    });

    describe("left scroll disabled", () => {
        it("left scroll is disabled", () => {
            wrapper = mount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});
            expect(wrapper.find("#layerpills-left-button").attributes().style).to.include("visibility: hidden");
        });
    });
    describe("right scroll enabled", () => {
        it("right scroll is enabled", async () => {

            wrapper = mount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});

            wrapper.vm.$el.offsetWidth = 400;
            wrapper.vm.$el.scrollWidth = 500;

            wrapper.vm.$nextTick(function () {
                expect(wrapper.find("#layerpills-right-button").attributes().style).to.be.undefined;
            });

        });
    });

    describe("close layerPill", () => {
        it("count close-buttons", () => {
            wrapper = shallowMount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});

            expect(wrapper.findAll(".close-button").length).to.equals(visibleSubjectDataLayers.length);
        });
    });

    describe("method testing", () => {
        it("setVisibleLayers", () => {
            wrapper = shallowMount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});

            expect(setVisibleSubjectDataLayersSpy.calledOnce).to.be.true;
            expect(setVisibleSubjectDataLayersSpy.firstCall.args[1]).to.deep.equal(visibleLayers);
        });
        it("setVisibleLayers only sets 2D layers if 2D mode is selected", () => {
            const visibleLayers3D2D = [
                {id: 0, name: "layer1", typ: "ENTITIES3D"},
                {id: 1, name: "layer2", typ: "ENTITIES3D"},
                {id: 2, name: "layer3", typ: "WFS"},
                {id: 3, name: "layer4", typ: "WFS"}
            ];

            wrapper = shallowMount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});
            wrapper.vm.setVisibleLayers(visibleLayers3D2D, "2D");

            expect(setVisibleSubjectDataLayersSpy.calledTwice).to.be.true;
            expect(setVisibleSubjectDataLayersSpy.secondCall.args[1]).to.deep.equal([
                {id: 2, name: "layer3", typ: "WFS"},
                {id: 3, name: "layer4", typ: "WFS"}]
            );
        });

        it("removeLayerFromVisibleLayers shall call replaceByIdInLayerConfig", () => {
            wrapper = shallowMount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});
            wrapper.vm.removeLayerFromVisibleLayers(visibleLayers[0], "2D");

            expect(replaceByIdInLayerConfigSpy.calledOnce).to.be.true;
            expect(replaceByIdInLayerConfigSpy.firstCall.args[1]).to.deep.equals({
                layerConfigs: [{
                    id: visibleLayers[0].id,
                    layer: {
                        id: visibleLayers[0].id,
                        visibility: false
                    }
                }]
            });
        });

        it("shall set scrolled and showRightbutton by moveLayerPills - scroll right", () => {
            const scrollLeft = 1000,
                scrollBySpy = sinon.spy();

            wrapper = shallowMount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});
            wrapper.vm.$el.scrollBy = scrollBySpy;
            wrapper.vm.$el.scrollWidth = 500;
            wrapper.vm.$el.scrollLeft = scrollLeft;
            wrapper.vm.moveLayerPills("right");

            expect(wrapper.vm.scrolled).to.equal(scrollLeft + 158);
            expect(wrapper.vm.showRightbutton).to.be.false;
            expect(scrollBySpy.calledOnce).to.be.true;
        });

        it("shall set scrolled by moveLayerPills - scroll left", () => {
            const scrollLeft = 1000,
                scrollBySpy = sinon.spy();

            wrapper = shallowMount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});
            wrapper.vm.$el.scrollBy = scrollBySpy;
            wrapper.vm.$el.scrollWidth = 500;
            wrapper.vm.$el.scrollLeft = scrollLeft;
            wrapper.vm.moveLayerPills("left");

            expect(wrapper.vm.scrolled).to.equal(scrollLeft - 158);
            expect(scrollBySpy.calledOnce).to.be.true;
        });

        it("sets showRightbutton to true if needed", () => {
            wrapper = shallowMount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});

            wrapper.vm.$el.offsetWidth = 400;
            wrapper.vm.$el.scrollWidth = 500;

            wrapper.vm.$nextTick(function () {
                expect(wrapper.vm.showRightbutton).to.be.true;
            });
        });

        it("sets showRightbutton to false if not needed", () => {
            wrapper = shallowMount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});

            wrapper.vm.$el.offsetWidth = 500;
            wrapper.vm.$el.scrollWidth = 500;

            wrapper.vm.$nextTick(function () {
                expect(wrapper.vm.showRightbutton).to.be.false;
            });
        });

        it("establishes a ResizeObserver if active", () => {
            const observer = global.ResizeObserver;
            let observed = false;

            /**
             * sets observed value to be tested
             * @returns {void}
             */
            class ResizeObserver {
                /**
                 * sets observed value if observed
                 * @returns {void}
                 */
                observe () {
                    observed = true;
                }
            }

            global.ResizeObserver = ResizeObserver;

            wrapper = shallowMount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});

            expect(observed).to.be.true;
            global.ResizeObserver = observer;
        });

        it("doesn't establish a ResizeObserver if not active", () => {
            const observer = global.ResizeObserver;
            let observed = false;

            active = false;
            /**
             * sets observed value to be tested
             * @returns {void}
             */
            class ResizeObserver {
                /**
                 * sets observed value if observed
                 * @returns {void}
                 */
                observe () {
                    observed = true;
                }
            }

            global.ResizeObserver = ResizeObserver;

            wrapper = shallowMount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});

            expect(observed).to.be.false;
            global.ResizeObserver = observer;
        });

        it("showLayerInformationInMenu layerConf with datasets calls startLayerInformation", () => {
            const layerConf = {
                datasets: []
            };

            wrapper = shallowMount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});

            wrapper.vm.showLayerInformationInMenu(layerConf);

            expect(startLayerInformationSpy.calledOnce).to.be.true;
        });

        it("showLayerInformationInMenu layerConf without datasets does nothing", () => {
            const layerConf = {
            };

            wrapper = shallowMount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});

            wrapper.vm.showLayerInformationInMenu(layerConf);

            expect(startLayerInformationSpy.notCalled).to.be.true;
        });
    });


    describe("tooltip of anchor", () => {
        it("anchors should have the correct tooltip", () => {
            wrapper = shallowMount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});

            wrapper.findAll("li.nav-item a").forEach((element, index) => {
                expect(element.attributes()).to.own.include({"data-bs-toggle": "tooltip"});
                expect(element.attributes()).to.own.include({"data-bs-placement": "bottom"});
                expect(element.attributes()).to.own.include({"data-bs-custom-class": "custom-tooltip"});
                expect(element.attributes()).to.own.include({"title": visibleLayers[index].name});
            });
        });
    });

    describe("watcher", () => {
        it("visibleSubjectDataLayerConfigs with no oldValue", () => {
            const newValue = [{
                    id: "id"
                }],
                setVisibleLayersSpy = sinon.spy(LayerPillsComponent.methods, "setVisibleLayers");

            store.commit("setVisibleSubjectDataLayerConfigs", []);
            wrapper = shallowMount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});
            wrapper.vm.$options.watch.visibleSubjectDataLayerConfigs.handler.call(wrapper.vm, newValue, []);
            // called once on mounted and once on watcher call
            expect(setVisibleLayersSpy.calledTwice).to.be.true;
            expect(setVisibleLayersSpy.firstCall.args[0]).to.be.deep.equals([]);
            expect(setVisibleLayersSpy.firstCall.args[1]).to.be.equals("2D");
            expect(setVisibleLayersSpy.firstCall.args[2]).to.be.equals(undefined);
            expect(setVisibleLayersSpy.secondCall.args[0]).to.be.deep.equals(newValue);
            expect(setVisibleLayersSpy.secondCall.args[1]).to.be.equals("2D");
            expect(setVisibleLayersSpy.secondCall.args[2]).to.be.deep.equals(newValue);
        });

        it("visibleSubjectDataLayerConfigs with oldValue", () => {
            const old1 = {
                    id: "old1"
                },
                newValue = [{
                    id: "id"
                },
                old1],
                oldValue = [old1],
                setVisibleLayersSpy = sinon.spy(LayerPillsComponent.methods, "setVisibleLayers");

            store.commit("setVisibleSubjectDataLayerConfigs", []);
            wrapper = shallowMount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});
            wrapper.vm.$options.watch.visibleSubjectDataLayerConfigs.handler.call(wrapper.vm, newValue, oldValue);
            // called once on mounted and once on watcher call
            expect(setVisibleLayersSpy.calledTwice).to.be.true;
            expect(setVisibleLayersSpy.firstCall.args[0]).to.be.deep.equals([]);
            expect(setVisibleLayersSpy.firstCall.args[1]).to.be.equals("2D");
            expect(setVisibleLayersSpy.firstCall.args[2]).to.be.equals(undefined);
            expect(setVisibleLayersSpy.secondCall.args[0]).to.be.deep.equals(newValue);
            expect(setVisibleLayersSpy.secondCall.args[1]).to.be.equals("2D");
            expect(setVisibleLayersSpy.secondCall.args[2]).to.be.deep.equals([newValue[0]]);
        });

        it("mode change shall call setVisibleLayers", () => {
            const visibleSubjectDataLayerConfigs = [{
                    id: "id1"
                }, {
                    id: "id2"
                }],
                setVisibleLayersSpy = sinon.spy(LayerPillsComponent.methods, "setVisibleLayers");

            store.commit("setVisibleSubjectDataLayerConfigs", visibleSubjectDataLayerConfigs);
            wrapper = shallowMount(LayerPillsComponent, {
                components: {
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }});
            wrapper.vm.$options.watch.mode.call(wrapper.vm, "3D");
            // called once on mounted and once on watcher call
            expect(setVisibleLayersSpy.calledTwice).to.be.true;
            expect(setVisibleLayersSpy.secondCall.args[0]).to.be.deep.equals(visibleSubjectDataLayerConfigs);
            expect(setVisibleLayersSpy.secondCall.args[1]).to.be.equals("3D");
        });

    });
});
