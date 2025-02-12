import {createStore} from "vuex";
import {config, mount, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import MultiPolygon from "ol/geom/MultiPolygon";

import layerCollection from "../../../../../core/layers/js/layerCollection";
import DetachedTemplate from "../../../components/GetFeatureInfoDetached.vue";

config.global.mocks.$t = key => key;
config.global.mocks.$gfiThemeAddons = [];

describe("src/modules/getFeatureInfo/components/GetFeatureInfoDetached.vue", () => {
    let store,
        removeHighlightFeatureSpy,
        highlightFeatureSpy,
        highlightVectorRules,
        getLayerByIdSpy,
        placingPointMarkerSpy,
        layer,
        showMarker = true,
        feature,
        centerMapToClickPoint,
        setCenterSpy,
        clickCoordinateFromMap;

    const
        mockMutations = {
            setCurrentFeature: () => sinon.stub(),
            setShowMarker: () => sinon.stub()
        },
        mockGetters = {
            centerMapToClickPoint: () => centerMapToClickPoint,
            currentFeature: () => sinon.stub(),
            menuSide: () => sinon.stub(),
            highlightVectorRules: () => highlightVectorRules,
            showMarker: () => showMarker,
            hideMapMarkerOnVectorHighlight: () => sinon.stub()
        },
        olFeature = new Feature({
            name: "feature123"
        });

    before(() => {
        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D"
        };

        mapCollection.addMap(map, "2D");
    });

    beforeEach(() => {
        clickCoordinateFromMap = [100, 200];
        showMarker = true;
        centerMapToClickPoint = false;
        feature = {
            getTheme: () => "DefaultTheme",
            getTitle: () => "Hallo",
            getMimeType: () => "text/xml",
            getGfiUrl: () => "",
            getLayerId: () => sinon.stub(),
            getOlFeature: () => olFeature
        };
        layer = {
            get: () => "styleId"
        };
        olFeature.setId("feature1");
        olFeature.setGeometry(new Point([10, 10]));
        getLayerByIdSpy = sinon.stub(layerCollection, "getLayerById").returns(layer);
        setCenterSpy = sinon.spy();
        highlightFeatureSpy = sinon.spy();
        removeHighlightFeatureSpy = sinon.spy();
        placingPointMarkerSpy = sinon.spy();
        highlightVectorRules = {
            image: {
                scale: 10
            },
            fill: sinon.stub(),
            stroke: sinon.stub()
        };
        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        GetFeatureInfo: {
                            namespaced: true,
                            mutations: mockMutations,
                            getters: mockGetters
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    actions: {
                        placingPointMarker: placingPointMarkerSpy,
                        removePointMarker: sinon.stub(),
                        setCenter: setCenterSpy,
                        removeHighlightFeature: removeHighlightFeatureSpy,
                        highlightFeature: highlightFeatureSpy
                    },
                    getters: {
                        clickCoordinate: () => clickCoordinateFromMap
                    }
                },
                Menu: {
                    namespaced: true,
                    actions: {
                        setMenuBackAndActivateItem: sinon.stub()
                    }
                }
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("should have a title", () => {
        const wrapper = mount(DetachedTemplate, {
            propsData: {
                feature
            },
            components: {
                DefaultTheme: {
                    name: "DefaultTheme",
                    template: "<div />"
                }
            },
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("div > div > span.gfi-title").text()).to.be.equal("Hallo");
    });

    it("should have the child component default (-Theme)", () => {
        const wrapper = mount(DetachedTemplate, {
            propsData: {
                feature
            },
            components: {
                DefaultTheme: {
                    name: "DefaultTheme",
                    template: "<span />"
                }
            },
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.findComponent({name: "DefaultTheme"}).exists()).to.be.true;
    });

    it("should set 'isContentHtml' to true", async () => {
        const wrapper = mount(DetachedTemplate, {
            propsData: {
                feature: {
                    getTheme: () => "default",
                    getTitle: () => "Hallo",
                    getMimeType: () => "text/html",
                    getGfiUrl: () => "http",
                    getLayerId: () => sinon.stub(),
                    getOlFeature: () => olFeature
                }
            },
            components: {
                DefaultTheme: {
                    name: "DefaultTheme",
                    template: "<span />"
                }
            },
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.vm.isContentHtml).to.be.true;
    });

    it("should not set 'isContentHtml' to true", async () => {
        const wrapper = mount(DetachedTemplate, {
            propsData: {
                feature
            },
            components: {
                DefaultTheme: {
                    name: "DefaultTheme",
                    template: "<span />"
                }
            },
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.vm.isContentHtml).to.be.false;
    });

    describe("Lifecycle Hooks", () => {
        it("should emit 'updateFeatureDone' in updated hook if isUpdated is true", async () => {
            const wrapper = mount(DetachedTemplate, {
                props: {
                    feature: {
                        getTheme: () => "DefaultTheme",
                        getTitle: () => "Hallo",
                        getMimeType: () => "text/xml",
                        getGfiUrl: () => "",
                        getLayerId: () => sinon.stub(),
                        getOlFeature: () => olFeature
                    }
                },
                components: {
                    DefaultTheme: {
                        name: "DefaultTheme",
                        template: "<span />"
                    }
                },
                global: {
                    plugins: [store]
                }
            });

            await wrapper.setProps({isUpdated: true});
            await wrapper.vm.$nextTick();
            expect(wrapper.emitted()).to.have.property("updateFeatureDone");
            expect(wrapper.emitted().updateFeatureDone).to.have.lengthOf(1);
        });
    });

    describe("methods", () => {
        describe("highlightVectorFeature", () => {
            it("should do nothing, if highlightVectorRules is not set", () => {
                highlightVectorRules = null;

                const wrapper = shallowMount(DetachedTemplate, {
                    propsData: {
                        feature
                    },
                    components: {
                        DefaultTheme: {
                            name: "DefaultTheme",
                            template: "<span />"
                        }
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.highlightVectorFeature();
                expect(getLayerByIdSpy.notCalled).to.be.true;
                expect(highlightFeatureSpy.notCalled).to.be.true;
            });

            it("should call highlightFeature if feature's geometry is a point", () => {
                const expectedArgs = {
                    feature: olFeature,
                    type: "increase",
                    scale: highlightVectorRules.image.scale,
                    layer: {id: "layerId"},
                    styleId: "styleId"
                };

                shallowMount(DetachedTemplate, {
                    propsData: {
                        feature: {
                            getTheme: () => "DefaultTheme",
                            getTitle: () => "Hallo",
                            getMimeType: () => "text/xml",
                            getGfiUrl: () => "",
                            getLayerId: () => "layerId",
                            getOlFeature: () => olFeature
                        }
                    },
                    components: {
                        DefaultTheme: {
                            name: "DefaultTheme",
                            template: "<span />"
                        }
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(getLayerByIdSpy.calledOnce).to.be.true;
                expect(highlightFeatureSpy.calledOnce).to.be.true;
                expect(highlightFeatureSpy.firstCall.args[1]).to.be.deep.equals(expectedArgs);
            });

            it("should call highlightFeature if feature's geometry is a polygon - test styleId", () => {
                const expectedArgs = {
                    feature: olFeature,
                    type: "highlightPolygon",
                    highlightStyle: {
                        fill: highlightVectorRules.fill,
                        stroke: highlightVectorRules.stroke
                    },
                    layer: {id: "layerId"},
                    styleId: "styleId"
                };

                olFeature.setGeometry(new Polygon([[[30, 10], [40, 40], [130, 130], [240, 40], [30, 10]]]));
                shallowMount(DetachedTemplate, {
                    propsData: {
                        feature: {
                            getTheme: () => "DefaultTheme",
                            getTitle: () => "Hallo",
                            getMimeType: () => "text/xml",
                            getGfiUrl: () => "",
                            getLayerId: () => "layerId",
                            getOlFeature: () => olFeature
                        }
                    },
                    components: {
                        DefaultTheme: {
                            name: "DefaultTheme",
                            template: "<span />"
                        }
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(getLayerByIdSpy.calledOnce).to.be.true;
                expect(highlightFeatureSpy.calledOnce).to.be.true;
                expect(highlightFeatureSpy.firstCall.args[1]).to.be.deep.equals(expectedArgs);
            });
            it("should call highlightFeature for a 3D tileset feature without geometry function, shall not be highlighted", () => {
                const tileFeature = {
                };

                shallowMount(DetachedTemplate, {
                    propsData: {
                        feature: {
                            getTheme: () => "DefaultTheme",
                            getTitle: () => "Hallo",
                            getMimeType: () => "text/xml",
                            getGfiUrl: () => "",
                            getLayerId: () => "layerId",
                            getOlFeature: () => tileFeature
                        }
                    },
                    components: {
                        DefaultTheme: {
                            name: "DefaultTheme",
                            template: "<span />"
                        }
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(getLayerByIdSpy.calledOnce).to.be.true;
                expect(highlightFeatureSpy.notCalled).to.be.true;
            });

            it("should call highlightFeature if feature's geometry is a linestring", () => {
                const expectedArgs = {
                    feature: olFeature,
                    type: "highlightLine",
                    highlightStyle: {
                        stroke: highlightVectorRules.stroke
                    },
                    layer: {id: "layerId"},
                    styleId: "styleId"
                };

                olFeature.setGeometry(new LineString([[30, 10], [40, 40], [130, 130], [240, 40]]));
                shallowMount(DetachedTemplate, {
                    propsData: {
                        feature: {
                            getTheme: () => "DefaultTheme",
                            getTitle: () => "Hallo",
                            getMimeType: () => "text/xml",
                            getGfiUrl: () => "",
                            getLayerId: () => "layerId",
                            getOlFeature: () => olFeature
                        }
                    },
                    components: {
                        DefaultTheme: {
                            name: "DefaultTheme",
                            template: "<span />"
                        }
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(getLayerByIdSpy.calledOnce).to.be.true;
                expect(highlightFeatureSpy.calledOnce).to.be.true;
                expect(highlightFeatureSpy.firstCall.args[1]).to.be.deep.equals(expectedArgs);
            });
            it("should call highlightFeature if feature's geometry is a multipolygon - test styleId", () => {
                const expectedArgs = {
                        feature: olFeature,
                        type: "highlightMultiPolygon",
                        highlightStyle: {
                            fill: highlightVectorRules.fill,
                            stroke: highlightVectorRules.stroke
                        },
                        layer: {id: "layerId"},
                        styleId: "styleId"
                    },
                    removeHighlightingSpy = sinon.spy(DetachedTemplate.methods, "removeHighlighting");

                olFeature.setGeometry(new MultiPolygon([
                    [
                        [[30, 10], [40, 40], [130, 130], [240, 40], [30, 10]],
                        [[20, 30], [35, 50], [100, 100], [220, 30], [20, 30]]
                    ]
                ]));

                shallowMount(DetachedTemplate, {
                    propsData: {
                        feature: {
                            getTheme: () => "DefaultTheme",
                            getTitle: () => "Hallo",
                            getMimeType: () => "text/xml",
                            getGfiUrl: () => "",
                            getLayerId: () => "layerId",
                            getOlFeature: () => olFeature
                        }
                    },
                    components: {
                        DefaultTheme: {
                            name: "DefaultTheme",
                            template: "<span />"
                        }
                    },
                    global: {
                        plugins: [store]
                    }
                });
                expect(getLayerByIdSpy.calledOnce).to.be.true;
                expect(removeHighlightingSpy.calledOnce).to.be.true;
                expect(highlightFeatureSpy.calledOnce).to.be.true;
                expect(highlightFeatureSpy.firstCall.args[1]).to.be.deep.equals(expectedArgs);
            });

        });

        describe("removeHighlighting", () => {
            it("should not call removeHighlightFeatureSpy if no lastFeature available", () => {
                highlightVectorRules = null;

                const wrapper = shallowMount(DetachedTemplate, {
                    propsData: {
                        feature
                    },
                    components: {
                        DefaultTheme: {
                            name: "DefaultTheme",
                            template: "<span />"
                        }
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.removeHighlighting();
                expect(removeHighlightFeatureSpy.notCalled).to.be.true;
            });

            it("should call removeHighlightFeatureSpy if lastFeature available", () => {
                highlightVectorRules = null;

                const wrapper = shallowMount(DetachedTemplate, {
                    propsData: {
                        feature
                    },
                    components: {
                        DefaultTheme: {
                            name: "DefaultTheme",
                            template: "<span />"
                        }
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.setData({
                    lastFeature: {
                        getOlFeature: sinon.stub()
                    }
                });

                wrapper.vm.removeHighlighting();
                expect(removeHighlightFeatureSpy.calledOnce).to.be.true;
            });
        });

        describe("setMarker", () => {
            it("should not call placingPointMarker if showMarker is false", () => {
                highlightVectorRules = null;
                showMarker = false;
                const wrapper = shallowMount(DetachedTemplate, {
                    propsData: {
                        feature
                    },
                    components: {
                        DefaultTheme: {
                            name: "DefaultTheme",
                            template: "<span />"
                        }
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.setMarker();
                expect(placingPointMarkerSpy.notCalled).to.be.true;
            });
            it("should do nothing if clickCoordinate is not filled - used on restore by urlParams", () => {
                highlightVectorRules = null;
                showMarker = true;
                centerMapToClickPoint = true;
                clickCoordinateFromMap = null;
                const wrapper = shallowMount(DetachedTemplate, {
                    propsData: {
                        feature
                    },
                    components: {
                        DefaultTheme: {
                            name: "DefaultTheme",
                            template: "<span />"
                        }
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.setMarker();
                expect(placingPointMarkerSpy.notCalled).to.be.true;
                expect(setCenterSpy.notCalled).to.be.true;
            });
            it("should call placingPointMarker if showMarker is true", () => {
                highlightVectorRules = null;
                showMarker = true;
                const wrapper = shallowMount(DetachedTemplate, {
                    propsData: {
                        feature
                    },
                    components: {
                        DefaultTheme: {
                            name: "DefaultTheme",
                            template: "<span />"
                        }
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.setMarker();
                expect(placingPointMarkerSpy.calledTwice).to.be.true;
            });
            it("shall center to click coordinates, even if marker is not set", () => {
                centerMapToClickPoint = true;
                showMarker = false;
                shallowMount(DetachedTemplate, {
                    propsData: {
                        feature: {
                            getTheme: () => "DefaultTheme",
                            getTitle: () => "Hallo",
                            getMimeType: () => "text/xml",
                            getGfiUrl: () => "",
                            getLayerId: () => sinon.stub(),
                            getOlFeature: () => olFeature
                        }
                    },
                    components: {
                        DefaultTheme: {
                            name: "DefaultTheme",
                            template: "<span />"
                        }
                    },
                    global: {
                        plugins: [store]
                    }
                });
                // setMarker is called on mount
                expect(setCenterSpy.calledOnce).to.be.true;
                expect(placingPointMarkerSpy.notCalled).to.be.true;
            });
            it("shall center to click coordinates and set Marker", () => {
                centerMapToClickPoint = true;
                showMarker = true;
                shallowMount(DetachedTemplate, {
                    propsData: {
                        feature: {
                            getTheme: () => "DefaultTheme",
                            getTitle: () => "Hallo",
                            getMimeType: () => "text/xml",
                            getGfiUrl: () => "",
                            getLayerId: () => sinon.stub(),
                            getOlFeature: () => olFeature
                        }
                    },
                    components: {
                        DefaultTheme: {
                            name: "DefaultTheme",
                            template: "<span />"
                        }
                    },
                    global: {
                        plugins: [store]
                    }
                });
                // setMarker is called on mount
                expect(setCenterSpy.calledOnce).to.be.true;
                expect(placingPointMarkerSpy.calledOnce).to.be.true;
            });
            it("shall do nothing", () => {
                centerMapToClickPoint = false;
                showMarker = false;
                shallowMount(DetachedTemplate, {
                    propsData: {
                        feature: {
                            getTheme: () => "DefaultTheme",
                            getTitle: () => "Hallo",
                            getMimeType: () => "text/xml",
                            getGfiUrl: () => "",
                            getLayerId: () => sinon.stub(),
                            getOlFeature: () => olFeature
                        }
                    },
                    components: {
                        DefaultTheme: {
                            name: "DefaultTheme",
                            template: "<span />"
                        }
                    },
                    global: {
                        plugins: [store]
                    }
                });
                // setMarker is called on mount
                expect(setCenterSpy.notCalled).to.be.true;
                expect(placingPointMarkerSpy.notCalled).to.be.true;
            });
        });
    });


});
