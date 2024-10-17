import {createStore} from "vuex";
import {config, shallowMount, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import GfiComponent from "../../../components/GetFeatureInfo.vue";

let mockMutations,
    mockGetters,
    menuExpanded,
    toggleMenuSpy,
    collectGfiFeaturesSpy,
    setClickCoordinatesSpy,
    removeHighlightColorSpy,
    currentComponentType,
    mapMode;

config.global.mocks.$t = key => key;
config.global.mocks.$gfiThemeAddons = [];

/**
 * Returns the store.
 * @param {Boolean} mobile true or false
 * @param {String} uiStyle the uiStyle
 * @param {Array} gfiFeatures the features
 * @param {Array} mapSize the maps size
 * @returns {Object} the store
 */
function getGfiStore (mobile, uiStyle, gfiFeatures, mapSize) {
    mockGetters.gfiFeaturesReverse = () => gfiFeatures;
    collectGfiFeaturesSpy = sinon.spy();

    return createStore({
        namespaced: true,
        modules: {
            Modules: {
                namespaced: true,
                modules: {
                    GetFeatureInfo: {
                        namespaced: true,
                        mutations: mockMutations,
                        getters: mockGetters,
                        actions: {
                            addGfiToMenu: sinon.stub(),
                            collectGfiFeatures: collectGfiFeaturesSpy,
                            removeHighlightColor: removeHighlightColorSpy
                        }
                    }
                }
            },
            Maps: {
                namespaced: true,
                getters: {
                    clickCoordinate: sinon.stub(),
                    mode: () => mapMode,
                    size: mapSize ? () => mapSize : sinon.stub()
                },
                actions: {
                    placingPointMarker: sinon.stub(),
                    registerListener: sinon.stub(),
                    setCenter: sinon.stub(),
                    unregisterListener: sinon.stub()
                }
            },
            Menu: {
                namespaced: true,
                getters: {
                    currentComponent: () => sinon.stub().returns({type: currentComponentType}),
                    currentMouseMapInteractionsComponent: () => "getFeatureInfo",
                    expanded: () => sinon.stub().returns(menuExpanded)
                },
                actions: {
                    setMenuBackAndActivateItem: sinon.stub(),
                    resetMenu: sinon.stub(),
                    toggleMenu: toggleMenuSpy,
                    changeCurrentComponent: sinon.stub()
                }
            }
        },
        getters: {
            mobile: () => mobile ? mobile : sinon.stub(),
            gfiWindow: () => "",
            uiStyle: () => uiStyle ? uiStyle : sinon.stub(),
            ignoredKeys: () => sinon.stub(),
            visibleSubjectDataLayerConfigs: () => []
        },
        actions: {
            initializeModule: sinon.stub()
        }
    });
}


beforeEach(() => {
    currentComponentType = "print";
    setClickCoordinatesSpy = sinon.spy();
    mapMode = "2D";
    removeHighlightColorSpy = sinon.spy();
    mockMutations = {
        setCurrentFeature: sinon.stub(),
        setGfiFeatures: sinon.spy(),
        setVisible: sinon.spy(),
        setMenuSide: sinon.stub(),
        setClickCoordinates: setClickCoordinatesSpy
    };
    mockGetters = {
        centerMapToClickPoint: sinon.stub(),
        currentFeature: sinon.stub(),
        gfiFeaturesReverse: sinon.stub(),
        highlightVectorRules: () => false,
        menuSide: () => false,
        showMarker: sinon.stub(),
        visible: () => true,
        type: () => "getFeatureInfo",
        configPaths: sinon.stub(),
        initialMenuSide: () => "secondaryMenu"
    };
    menuExpanded = true;
    toggleMenuSpy = sinon.spy();
});
afterEach(() => {
    sinon.restore();
});


describe("src/modules/getFeatureInfo/components/GetFeatureInfo.vue", () => {
    it("should find the child component GetFeatureInfoDetached", () => {
        const gfiFeatures = [{
                getGfiUrl: () => null,
                getFeatures: () => sinon.stub(),
                getProperties: () => {
                    return {};
                }
            }],
            store = getGfiStore(false, "", gfiFeatures, []);
        let wrapper = null;

        wrapper = shallowMount(GfiComponent, {
            components: {
                GetFeatureInfoDetached: {
                    name: "GetFeatureInfoDetached",
                    template: "<span />"
                },
                IconButton: {
                    name: "IconButton",
                    template: "<button>Hier</button>"
                }
            },
            global: {
                components: {
                    GetFeatureInfoDetached: {
                        name: "GetFeatureInfoDetached",
                        template: "<span />"
                    }
                },
                plugins: [store]
            }
        });

        expect(wrapper.findComponent({name: "GetFeatureInfoDetached"}).exists()).to.be.true;
    });

    it("no child component should be found if gfi is not activated", () => {
        const store = getGfiStore(undefined, undefined, null, []),
            wrapper = shallowMount(GfiComponent, {
                components: {
                    GetFeatureInfoDetached: {
                        name: "GetFeatureInfoDetached",
                        template: "<span />"
                    },
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                global: {
                    plugins: [store]
                }
            });

        expect(wrapper.findComponent({name: "GetFeatureInfoDetached"}).exists()).to.be.false;
    });

    it("no child component should be found if gfi has no features", () => {
        const store = getGfiStore(true, undefined, [], []);
        let wrapper = null;

        wrapper = shallowMount(GfiComponent, {
            components: {
                GetFeatureInfoDetached: {
                    name: "GetFeatureInfoDetached",
                    template: "<span />"
                },
                IconButton: {
                    name: "IconButton",
                    template: "<button>Hier</button>"
                }
            },
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.findComponent({name: "GetFeatureInfoDetached"}).exists()).to.be.false;
    });

    it("should set pagerIndex to zero if clickCoordinate change", () => {
        const gfiFeatures = [{
                getGfiUrl: () => null,
                getFeatures: () => sinon.stub(),
                getProperties: () => {
                    return {};
                }
            }],
            store = getGfiStore(false, undefined, gfiFeatures, []),
            coordinates = [100, 200];
        let wrapper = null;

        wrapper = shallowMount(GfiComponent, {
            components: {
                GetFeatureInfoDetached: {
                    name: "GetFeatureInfoDetached",
                    template: "<span />"
                },
                IconButton: {
                    name: "IconButton",
                    template: "<button>Hier</button>"
                }
            },
            data () {
                return {
                    pagerIndex: 1
                };
            },
            global: {
                plugins: [store]
            }
        });

        wrapper.vm.$options.watch.clickCoordinate.handler.call(wrapper.vm, coordinates);
        expect(wrapper.vm.pagerIndex).to.equal(0);
        expect(setClickCoordinatesSpy.calledOnce).to.be.true;
        expect(setClickCoordinatesSpy.firstCall.args[1]).to.equals(coordinates);
        expect(collectGfiFeaturesSpy.calledOnce).to.be.true;
    });

    it("should set updatedFeature to true if gfiFeatures changed and features are given", () => {
        const gfiFeatures = [{
                getGfiUrl: () => null,
                getFeatures: () => sinon.stub(),
                getProperties: () => {
                    return {};
                }
            }],
            store = getGfiStore(false, undefined, gfiFeatures, []),

            wrapper = shallowMount(GfiComponent, {
                global: {
                    plugins: [store]
                }
            }),
            features = [{
                getTheme: () => "default",
                getTitle: () => "Feature 1",
                getGfiUrl: () => null,
                getMimeType: () => "text/html",
                getAttributesToShow: () => sinon.stub(),
                getMappedProperties: () => null,
                getProperties: () => {
                    return {};
                },
                getFeatures: () => [],
                getId: () => "id"
            }
            ];

        wrapper.vm.$options.watch.gfiFeatures.handler.call(wrapper.vm, features, features);
        expect(wrapper.vm.updatedFeature).to.equal(true);
    });
    it("should set updatedFeature to false if gfiFeatures changed and features are not given", () => {
        const gfiFeatures = [{
                getGfiUrl: () => null,
                getFeatures: () => sinon.stub(),
                getProperties: () => {
                    return {};
                }
            }],
            store = getGfiStore(false, undefined, gfiFeatures, []),
            wrapper = shallowMount(GfiComponent, {
                global: {
                    plugins: [store]
                }
            });

        wrapper.vm.$options.watch.gfiFeatures.handler.call(wrapper.vm, null);
        expect(wrapper.vm.updatedFeature).to.equal(false);
        wrapper.vm.$options.watch.gfiFeatures.handler.call(wrapper.vm, []);
        expect(wrapper.vm.updatedFeature).to.equal(false);
    });
    it("should show the original attribute keys if no mappedProperties are available", () => {
        const returnedValue = GfiComponent.methods.prepareProperties({property: "property"}, undefined, ["ignoredID"]);

        expect(returnedValue).to.be.deep.equals({property: "property"});
    });

    describe("watcher visible", () => {
        it("should call reset if visible is false", () => {
            const gfiFeatures = [{
                    getGfiUrl: () => null,
                    getFeatures: () => sinon.stub(),
                    getProperties: () => {
                        return {};
                    }
                }],
                store = getGfiStore(false, undefined, gfiFeatures, []),
                spyReset = sinon.spy(GfiComponent.methods, "reset");
            let wrapper = null;

            wrapper = shallowMount(GfiComponent, {
                components: {
                    GetFeatureInfoDetached: {
                        name: "GetFeatureInfoDetached",
                        template: "<span />"
                    },
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                data () {
                    return {
                        pagerIndex: 1
                    };
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.$options.watch.visible.call(wrapper.vm, false);
            expect(spyReset.calledOnce).to.be.true;
        });
        it("gfi opens on other side when print module is open", () => {
            const gfiFeatures = [{
                    getGfiUrl: () => "",
                    getFeatures: () => sinon.stub(),
                    getProperties: () => {
                        return {};
                    }
                }],
                store = getGfiStore(false, undefined, gfiFeatures, []);
            let wrapper = null;

            wrapper = shallowMount(GfiComponent, {
                components: {
                    GetFeatureInfoDetached: {
                        name: "GetFeatureInfoDetached",
                        template: "<span />"
                    },
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                data () {
                    return {
                        pagerIndex: 1
                    };
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.$options.watch.visible.call(wrapper.vm, true);
            expect(mockMutations.setMenuSide.calledTwice).to.be.true;
        });
        it("gfi opens on initial side when other module is open", () => {
            currentComponentType = "notPrint";
            const gfiFeatures = [{
                    getGfiUrl: () => "",
                    getFeatures: () => sinon.stub(),
                    getProperties: () => {
                        return {};
                    }
                }],
                store = getGfiStore(false, undefined, gfiFeatures, []);
            let wrapper = null;

            wrapper = shallowMount(GfiComponent, {
                components: {
                    GetFeatureInfoDetached: {
                        name: "GetFeatureInfoDetached",
                        template: "<span />"
                    },
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                data () {
                    return {
                        pagerIndex: 1
                    };
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.$options.watch.visible.call(wrapper.vm, true);
            expect(mockMutations.setMenuSide.calledOnce).to.be.true;
        });
    });


    describe("watcher gfiFeatures", () => {
        it("should call setVisible and expand menu, if gfiFeatures changed, oldFeatures are null", () => {
            menuExpanded = false;
            const gfiFeaturesNew = [{
                    getId: () => "new"
                }],
                store = getGfiStore(false, undefined, gfiFeaturesNew, []);
            let wrapper = null;

            wrapper = shallowMount(GfiComponent, {
                components: {
                    GetFeatureInfoDetached: {
                        name: "GetFeatureInfoDetached",
                        template: "<span />"
                    },
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                data () {
                    return {
                        pagerIndex: 1
                    };
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.$options.watch.gfiFeatures.handler.call(wrapper.vm, gfiFeaturesNew, null);
            expect(mockMutations.setVisible.calledOnce).to.be.true;
            expect(toggleMenuSpy.calledOnce).to.be.true;
        });

        it("should call setVisible and not expand menu, if gfiFeatures changed, oldFeatures are null", () => {
            const gfiFeaturesNew = [{
                    getId: () => "new"
                }],
                store = getGfiStore(false, undefined, gfiFeaturesNew, []);
            let wrapper = null;

            wrapper = shallowMount(GfiComponent, {
                components: {
                    GetFeatureInfoDetached: {
                        name: "GetFeatureInfoDetached",
                        template: "<span />"
                    },
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                data () {
                    return {
                        pagerIndex: 1
                    };
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.$options.watch.gfiFeatures.handler.call(wrapper.vm, gfiFeaturesNew, null);
            expect(mockMutations.setVisible.calledOnce).to.be.true;
            expect(toggleMenuSpy.notCalled).to.be.true;
        });

        it("should call setVisible and not expand menu, if gfiFeatures changed", () => {
            const gfiFeaturesOld = [{
                    getId: () => "old",
                    getAttributesToShow: () => sinon.stub(),
                    getProperties: () => {
                        return {};
                    },
                    getFeatures: sinon.stub()
                }],
                gfiFeaturesNew = [{
                    getId: () => "new",
                    getAttributesToShow: () => sinon.stub(),
                    getProperties: () => {
                        return {};
                    },
                    getFeatures: sinon.stub()
                }],
                store = getGfiStore(false, undefined, gfiFeaturesNew.concat(gfiFeaturesOld), []);
            let wrapper = null;

            wrapper = shallowMount(GfiComponent, {
                components: {
                    GetFeatureInfoDetached: {
                        name: "GetFeatureInfoDetached",
                        template: "<span />"
                    },
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                data () {
                    return {
                        pagerIndex: 1
                    };
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.$options.watch.gfiFeatures.handler.call(wrapper.vm, gfiFeaturesNew, gfiFeaturesOld);
            expect(mockMutations.setVisible.calledOnce).to.be.true;
            expect(toggleMenuSpy.notCalled).to.be.true;
        });

        it("should not call setVisible, if gfiFeatures not changed", () => {
            const gfiFeaturesNew = [{
                    getId: () => "new"
                }],
                store = getGfiStore(false, undefined, gfiFeaturesNew, []);
            let wrapper = null;

            wrapper = shallowMount(GfiComponent, {
                components: {
                    GetFeatureInfoDetached: {
                        name: "GetFeatureInfoDetached",
                        template: "<span />"
                    },
                    IconButton: {
                        name: "IconButton",
                        template: "<button>Hier</button>"
                    }
                },
                data () {
                    return {
                        pagerIndex: 1
                    };
                },
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.$options.watch.gfiFeatures.handler.call(wrapper.vm, gfiFeaturesNew, gfiFeaturesNew);
            expect(mockMutations.setVisible.notCalled).to.be.true;
            expect(toggleMenuSpy.notCalled).to.be.true;
        });
    });
    describe("watcher visibleSubjectDataLayerConfigs", () => {
        it("visibleSubjectDataLayerConfigs changed, only one gfi visible", async () => {
            const gfiFeatures = [{
                    getGfiUrl: () => null,
                    getFeatures: () => sinon.stub(),
                    getProperties: () => sinon.stub(),
                    getLayerId: () => "layerId"
                }],
                store = getGfiStore(false, "", gfiFeatures, []),
                newVal = [],
                oldVal = [{
                    id: "layerId",
                    visibility: false
                }],
                resetSpy = sinon.spy(GfiComponent.methods, "reset"),
                wrapper = shallowMount(GfiComponent, {
                    global: {
                        plugins: [store]
                    }
                });

            wrapper.vm.$options.watch.visibleSubjectDataLayerConfigs.handler.call(wrapper.vm, newVal, oldVal);
            expect(resetSpy.calledOnce).to.be.true;
        });
        it("visibleSubjectDataLayerConfigs changed, two gfi visible", async () => {
            const gfiFeatures = [{
                    getGfiUrl: () => null,
                    getFeatures: () => sinon.stub(),
                    getProperties: () => sinon.stub(),
                    getLayerId: () => "layerId1"
                },
                {
                    getGfiUrl: () => null,
                    getFeatures: () => sinon.stub(),
                    getProperties: () => sinon.stub(),
                    getLayerId: () => "layerId2"
                }],
                store = getGfiStore(false, "", gfiFeatures, []),
                conf1 = {
                    id: "layerId1",
                    visibility: false
                },
                conf2 = {
                    id: "layerId2",
                    visibility: true
                },
                newVal = [conf2],
                oldVal = [conf1, conf2],
                resetSpy = sinon.spy(GfiComponent.methods, "reset"),

                wrapper = shallowMount(GfiComponent, {
                    global: {
                        plugins: [store]
                    }
                });

            wrapper.vm.$options.watch.visibleSubjectDataLayerConfigs.handler.call(wrapper.vm, newVal, oldVal);
            expect(resetSpy.notCalled).to.be.true;
            expect(collectGfiFeaturesSpy.calledOnce).to.be.true;
        });
        it("visibleSubjectDataLayerConfigs changed, other gfi visible", async () => {
            const gfiFeatures = [{
                    getGfiUrl: () => null,
                    getFeatures: () => sinon.stub(),
                    getProperties: () => sinon.stub(),
                    getLayerId: () => "layerId1"
                },
                {
                    getGfiUrl: () => null,
                    getFeatures: () => sinon.stub(),
                    getProperties: () => sinon.stub(),
                    getLayerId: () => "layerId2"
                }],
                store = getGfiStore(false, "", gfiFeatures, []),
                conf1 = {
                    id: "layerId3",
                    visibility: false
                },
                conf2 = {
                    id: "layerId4",
                    visibility: true
                },
                newVal = [conf2],
                oldVal = [conf1, conf2],
                resetSpy = sinon.spy(GfiComponent.methods, "reset"),
                wrapper = shallowMount(GfiComponent, {
                    global: {
                        plugins: [store]
                    }
                });

            wrapper.vm.$options.watch.visibleSubjectDataLayerConfigs.handler.call(wrapper.vm, newVal, oldVal);
            expect(resetSpy.notCalled).to.be.true;
            expect(collectGfiFeaturesSpy.notCalled).to.be.true;
        });
        it("visibleSubjectDataLayerConfigs call nothing, if gfiFeatures array is empty", async () => {
            const gfiFeatures = [],
                store = getGfiStore(false, "", gfiFeatures, []),
                conf1 = {
                    id: "layerId1",
                    visibility: false
                },
                conf2 = {
                    id: "layerId2",
                    visibility: true
                },
                newVal = [conf2],
                oldVal = [conf1, conf2],
                resetSpy = sinon.spy(GfiComponent.methods, "reset"),

                wrapper = shallowMount(GfiComponent, {
                    global: {
                        plugins: [store]
                    }
                });

            wrapper.vm.$options.watch.visibleSubjectDataLayerConfigs.handler.call(wrapper.vm, newVal, oldVal);
            expect(resetSpy.notCalled).to.be.true;
            expect(collectGfiFeaturesSpy.notCalled).to.be.true;
        });

        it("visibleSubjectDataLayerConfigs call nothing, if gfiFeaturesis null", async () => {
            const store = getGfiStore(false, "", null, []),
                conf1 = {
                    id: "layerId1",
                    visibility: false
                },
                conf2 = {
                    id: "layerId2",
                    visibility: true
                },
                newVal = [conf2],
                oldVal = [conf1, conf2],
                resetSpy = sinon.spy(GfiComponent.methods, "reset"),

                wrapper = shallowMount(GfiComponent, {
                    global: {
                        plugins: [store]
                    }
                });

            wrapper.vm.$options.watch.visibleSubjectDataLayerConfigs.handler.call(wrapper.vm, newVal, oldVal);
            expect(resetSpy.notCalled).to.be.true;
            expect(collectGfiFeaturesSpy.notCalled).to.be.true;
        });
    });

    describe("methods", () => {
        describe("reset", () => {
            it("should set pagerIndex to 0 and setGfiFeatures to null", () => {
                const gfiFeatures = [{
                        getGfiUrl: () => null,
                        getFeatures: () => sinon.stub(),
                        getProperties: () => {
                            return {};
                        }
                    }],
                    store = getGfiStore(false, undefined, gfiFeatures, []);
                let wrapper = null;

                wrapper = shallowMount(GfiComponent, {
                    components: {
                        GetFeatureInfoDetached: {
                            name: "GetFeatureInfoDetached",
                            template: "<span />"
                        },
                        IconButton: {
                            name: "IconButton",
                            template: "<button>Hier</button>"
                        }
                    },
                    data () {
                        return {
                            pagerIndex: 1
                        };
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.reset();
                expect(wrapper.vm.pagerIndex).to.equal(0);
                expect(mockMutations.setGfiFeatures.calledOnce).to.be.true;
                expect(mockMutations.setGfiFeatures.firstCall.args[1]).to.equals(null);

            });
            it("should call removeHighlightColor if the map is in 3D", () => {
                mapMode = "3D";
                const gfiFeatures = [{
                        getGfiUrl: () => null,
                        getFeatures: () => sinon.stub(),
                        getProperties: () => {
                            return {};
                        }
                    }],
                    store = getGfiStore(false, undefined, gfiFeatures, []);
                let wrapper = null;

                wrapper = shallowMount(GfiComponent, {
                    global: {
                        plugins: [store]
                    }
                });


                wrapper.vm.reset();
                expect(removeHighlightColorSpy.calledOnce).to.be.true;
            });
            it("should not call removeHighlightColor if the map is in 2D", () => {
                mapMode = "2D";
                const gfiFeatures = [{
                        getGfiUrl: () => null,
                        getFeatures: () => sinon.stub(),
                        getProperties: () => {
                            return {};
                        }
                    }],
                    store = getGfiStore(false, undefined, gfiFeatures, []);
                let wrapper = null;

                wrapper = shallowMount(GfiComponent, {
                    global: {
                        plugins: [store]
                    }
                });
                wrapper.vm.reset();
                expect(removeHighlightColorSpy.calledOnce).to.be.false;
            });
        });
    });

    it("should display the footer", () => {
        const gfiFeatures = [{
                getTheme: () => "default",
                getTitle: () => "Feature 1",
                getMimeType: () => "text/html",
                getGfiUrl: () => null,
                getMappedProperties: () => null,
                getProperties: () => {
                    return {};
                },
                getlayerId: () => null,
                getFeatures: () => []
            },
            {}],
            store = getGfiStore(true, undefined, gfiFeatures, []);
        let wrapper = null;

        wrapper = mount(GfiComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find(".pager-right").exists()).to.be.true;
        expect(wrapper.find(".gfi-pager-left-margin").exists()).to.be.true;
        expect(wrapper.find(".gfi-pager-right-margin").exists()).to.be.false;
    });

    it("should hide left pager if pagerIndex is zero", () => {
        const gfiFeatures = [{
                getTheme: () => "default",
                getTitle: () => "Feature 1",
                getGfiUrl: () => null,
                getMimeType: () => "text/html",
                getAttributesToShow: () => sinon.stub(),
                getProperties: () => {
                    return {};
                },
                getFeatures: () => [],
                attributesToShow: sinon.stub()
            },
            {}],
            store = getGfiStore(true, undefined, gfiFeatures, []);
        let wrapper = null;

        wrapper = mount(GfiComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find(".pager-left").exists()).not.to.be.true;
        expect(wrapper.find(".gfi-pager-left-margin").exists()).to.be.true;
        expect(wrapper.find(".gfi-pager-right-margin").exists()).to.be.false;
    });

    it("should enable right pager if pagerIndex is zero", () => {
        const gfiFeatures = [{
                getTheme: () => "default",
                getTitle: () => "Feature 1",
                getGfiUrl: () => null,
                getMimeType: () => "text/html",
                getAttributesToShow: () => sinon.stub(),
                getProperties: () => {
                    return {};
                },
                getFeatures: () => []
            },
            {}],
            store = getGfiStore(true, undefined, gfiFeatures, []);
        let wrapper = null;

        wrapper = mount(GfiComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find(".pager-right").exists()).to.be.true;
        expect(wrapper.find(".gfi-pager-left-margin").exists()).to.be.true;
        expect(wrapper.find(".gfi-pager-right-margin").exists()).to.be.false;
    });

    it("should hide right pager if pagerIndex === gfiFeatures.length - 1", () => {
        const gfiFeatures = [{}, {
                getTheme: () => "default",
                getTitle: () => "Feature 1",
                getGfiUrl: () => null,
                getMimeType: () => "text/html",
                getMappedProperties: () => null,
                getProperties: () => {
                    return {};
                },
                getFeatures: () => []
            }],
            store = getGfiStore(true, undefined, gfiFeatures, []);
        let wrapper = null;

        wrapper = mount(GfiComponent, {
            data () {
                return {
                    pagerIndex: 1
                };
            },
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find(".pager-right").exists()).not.to.be.true;
        expect(wrapper.find(".gfi-pager-left-margin").exists()).to.be.false;
        expect(wrapper.find(".gfi-pager-right-margin").exists()).to.be.true;
    });

    it("should enable left pager if pagerIndex === gfiFeatures.length - 1", () => {
        const gfiFeatures = [{}, {
                getTheme: () => "default",
                getTitle: () => "Feature 1",
                getGfiUrl: () => null,
                getMimeType: () => "text/html",
                getMappedProperties: () => null,
                getProperties: () => {
                    return {};
                },
                getFeatures: () => []
            }],
            store = getGfiStore(true, undefined, gfiFeatures, []);
        let wrapper = null;

        wrapper = mount(GfiComponent, {
            data () {
                return {
                    pagerIndex: 1
                };
            },
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find(".pager-left").exists()).to.be.true;
        expect(wrapper.find(".gfi-pager-left-margin").exists()).to.be.false;
        expect(wrapper.find(".gfi-pager-right-margin").exists()).to.be.true;
    });


    it("should enable left pager and right pager if pagerIndex is between zero and gfiFeature.length - 1", () => {
        const gfiFeatures = [{}, {
                getTheme: () => "default",
                getTitle: () => "Feature 1",
                getGfiUrl: () => null,
                getMimeType: () => "text/html",
                getMappedProperties: () => null,
                getProperties: () => sinon.stub(),
                getFeatures: () => sinon.stub()
            }, {}],
            store = getGfiStore(true, undefined, gfiFeatures, []);
        let wrapper = null;

        wrapper = mount(GfiComponent, {
            data () {
                return {
                    pagerIndex: 1
                };
            },
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find(".pager-left").exists()).to.be.true;
        expect(wrapper.find(".pager-right").exists()).to.be.true;
        expect(wrapper.find(".gfi-pager-left-margin").exists()).to.be.false;
        expect(wrapper.find(".gfi-pager-right-margin").exists()).to.be.false;
    });

    it("should find a new detached component, if componentKey was changed", async () => {
        const gfiFeatures = [{
                getGfiUrl: () => null,
                getFeatures: () => sinon.stub(),
                getProperties: () => sinon.stub()
            }],
            store = getGfiStore(false, "", gfiFeatures, []);
        let wrapper = null,
            firstDetachedComponent = "",
            secondDetachedComponent = "";

        wrapper = shallowMount(GfiComponent, {
            global: {
                plugins: [store]
            }
        });

        firstDetachedComponent = wrapper.findComponent({name: "GetFeatureInfoDetached"});
        await wrapper.setData({componentKey: true});
        secondDetachedComponent = wrapper.findComponent({name: "GetFeatureInfoDetached"});

        expect(firstDetachedComponent.exists()).to.be.false;
        expect(secondDetachedComponent.exists()).to.be.true;
    });
});
