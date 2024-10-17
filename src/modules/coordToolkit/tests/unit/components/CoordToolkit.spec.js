import {createStore} from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount, mount} from "@vue/test-utils";
import crs from "@masterportal/masterportalapi/src/crs";
import CoordToolkitComponent from "../../../components/CoordToolkit.vue";
import CoordToolkit from "../../../store/indexCoordToolkit";

const namedProjections = [
    ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
    ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
    ["EPSG:8395", "+title=ETRS89_3GK3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
    ["EPSG:8395", "+title=EPSG: 8395 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
    ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
];

config.global.mocks.$t = key => key;

describe("src/modules/coordToolkit/components/CoordToolkit.vue", () => {
    const registerListenerSpy = sinon.spy(),
        unregisterListenerSpy = sinon.spy(),
        mockState = {

            mode: "2D"
        },
        mockMapGetters = {
            projection: () => {
                return {id: "http://www.opengis.net/gml/srs/epsg.xml#25832", name: "EPSG:25832", projName: "utm"};
            },
            clickCoordinate: () => sinon.stub(),
            mode: (state) => state.mode
        },
        mockAlertingActions = {
            addSingleAlert: sinon.stub()
        },
        mockMapActions = {
            addPointerMoveHandler: sinon.stub(),
            removePointerMoveHandler: sinon.stub(),
            removeInteraction: sinon.stub(),
            addInteraction: sinon.stub(),
            removePointMarker: sinon.stub(),
            registerListener: registerListenerSpy,
            unregisterListener: unregisterListenerSpy
        },
        mockMapMutations = {
            setMode: (state, mapMode) => {
                state.mode = mapMode;
            }
        },
        mockConfigJson = {
            portalConfig: {
                navigationSecondary: {
                    sections: [
                        {
                            coordToolkit: {
                                "name": "common:modules.coordToolkit.name",
                                "icon": "bi-globe",
                                "showCopyButtons": true
                            }
                        }
                    ]
                }
            }
        },

        eventProj4326 = {
            target: {
                value: "http://www.opengis.net/gml/srs/epsg.xml#4326"
            }
        };
    let store,
        wrapper,
        isMobile,
        text = "",
        origvalidateInput,
        originitHeightLayer,
        origtransformCoordinatesFromTo,
        origPositionClicked,
        copyStub;

    beforeEach(() => {
        origvalidateInput = CoordToolkit.actions.validateInput;
        isMobile = false;
        originitHeightLayer = CoordToolkit.actions.initHeightLayer;
        origtransformCoordinatesFromTo = CoordToolkit.actions.transformCoordinatesFromTo;
        origPositionClicked = CoordToolkit.actions.positionClicked;
        CoordToolkit.actions.validateInput = sinon.spy();
        CoordToolkit.actions.initHeightLayer = sinon.spy();
        CoordToolkit.actions.transformCoordinatesFromTo = sinon.spy();
        CoordToolkit.actions.positionClicked = sinon.spy();

        store = createStore({
            namespaced: true,
            modules: {
                namespaced: true,
                Modules: {
                    namespaced: true,
                    modules: {
                        CoordToolkit
                    }
                },
                Maps: {
                    namespaced: true,
                    state: mockState,
                    getters: mockMapGetters,
                    mutations: mockMapMutations,
                    actions: mockMapActions
                },
                Alerting: {
                    namespaced: true,
                    actions: mockAlertingActions

                }
            },
            getters: {
                uiStyle: () => "",
                isMobile: () => isMobile,
                namedProjections: () => namedProjections
            },
            state: {
                configJson: mockConfigJson,
                coordinatesEasting: {id: "easting", value: "12345"},
                coordinatesNorthing: {id: "northing", value: "67890"}
            }
        });
        crs.registerProjections(namedProjections);


        navigator.clipboard = {
            writeText: (aText) => {
                text = aText;
            }
        };
        copyStub = sinon.stub(navigator.clipboard, "writeText").resolves(text);
    });

    afterEach(() => {
        sinon.restore();
        CoordToolkit.actions.validateInput = origvalidateInput;
        CoordToolkit.actions.initHeightLayer = originitHeightLayer;
        CoordToolkit.actions.transformCoordinatesFromTo = origtransformCoordinatesFromTo;
        CoordToolkit.actions.positionClicked = origPositionClicked;
    });

    it("renders CoordToolkit without height field", () => {
        wrapper = shallowMount(CoordToolkitComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#coord-toolkit").exists()).to.be.true;
        expect(wrapper.find("#coordinatesHeightField").exists()).to.be.false;
        expect(CoordToolkit.actions.initHeightLayer.calledOnce).to.be.false;
    });


    it("renders CoordToolkit without copy-coords buttons", () => {
        store.commit("Modules/CoordToolkit/setShowCopyButtons", false);
        wrapper = shallowMount(CoordToolkitComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#coord-toolkit").exists()).to.be.true;
        expect(wrapper.find("#copyCoordsPairBtn").exists()).to.be.false;
    });

    it("renders CoordToolkit with copy-coords buttons", () => {
        store.commit("Modules/CoordToolkit/setShowCopyButtons", true);
        wrapper = shallowMount(CoordToolkitComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#coord-toolkit").exists()).to.be.true;
        expect(wrapper.find("#copyCoordsPairBtn").exists()).to.be.true;
    });

    it("CoordToolkit mounting with heightLayerId shall call initHeightLayer", async () => {
        store.state.Modules.CoordToolkit.heightLayerId = "123";
        wrapper = shallowMount(CoordToolkitComponent, {
            global: {
                plugins: [store]
            }});
        await wrapper.vm.$nextTick();

        expect(CoordToolkit.actions.initHeightLayer.calledOnce).to.be.true;
    });

    it("has initially selected projection \"EPSG:25832\"", async () => {
        let options = null,
            selected = null;

        wrapper = shallowMount(CoordToolkitComponent, {
            global: {
                plugins: [store]
            }});

        await wrapper.vm.$nextTick();

        options = wrapper.findAll("option");
        expect(options.length).to.equal(namedProjections.length + 1);

        selected = options.filter(o => o.attributes().selected === "true");
        expect(selected.length).to.equal(1);
        expect(selected.at(0).attributes().value).to.equal("http://www.opengis.net/gml/srs/epsg.xml#25832");
    });

    it("if coordToolkit is mounted in mobile version, clicklistener is registered", () => {
        isMobile = true;
        wrapper = shallowMount(CoordToolkitComponent, {
            global: {
                plugins: [store]
            }});
        expect(registerListenerSpy.calledOnce).to.equal(true);
    });

    it("if coordToolkit is unmounted (in mobile version), clicklistener is unregistered", async () => {
        wrapper = shallowMount(CoordToolkitComponent, {
            global: {
                plugins: [store]
            }});

        wrapper.vm.$options.unmounted.call(wrapper.vm);
        await wrapper.vm.$nextTick();

        expect(unregisterListenerSpy.calledOnce).to.equal(true);
    });

    describe("CoordToolkit.vue methods", () => {
        it("method selectionChanged sets currentProjection", () => {
            const value = "http://www.opengis.net/gml/srs/epsg.xml#31467",
                event = {
                    target: {
                        value: value
                    }
                };

            wrapper = shallowMount(CoordToolkitComponent, {
                global: {
                    plugins: [store]
                }});
            wrapper.vm.selectionChanged(event);
            expect(store.state.Modules.CoordToolkit.currentProjection.name).to.be.equals(value);
            expect(store.state.Modules.CoordToolkit.currentProjection.projName).to.be.equals("tmerc");
            expect(store.state.Modules.CoordToolkit.coordinatesEasting.value).to.be.equals("0.00");
            expect(store.state.Modules.CoordToolkit.coordinatesNorthing.value).to.be.equals("0.00");
        });

        it("createInteraction sets projections and adds interaction", () => {
            wrapper = shallowMount(CoordToolkitComponent, {
                global: {
                    plugins: [store]
                }});

            // expect(store.state.Modules.CoordToolkit.selectPointerMove).to.be.null;
            wrapper.vm.createInteraction();
            expect(typeof store.state.Modules.CoordToolkit.selectPointerMove).to.be.equals("object");
            expect(typeof store.state.Modules.CoordToolkit.selectPointerMove.handleMoveEvent).to.be.equals("function");
        });

        describe("createInteraction for 3D", () => {
            before(() => {
                global.Cesium = {};
                global.Cesium.ScreenSpaceEventHandler = function () {
                    return {
                        setInputAction: () => sinon.stub(),
                        destroy: () => sinon.stub()
                    };
                };
                global.Cesium.ScreenSpaceEventType = {
                    MOUSE_MOVE: sinon.stub(),
                    LEFT_CLICK: sinon.stub()
                };
            });

            after(() => {
                store.commit("Maps/setMode", "2D");
            });

            it("createInteraction for 3D and the eventHandler is not null", () => {
                wrapper = shallowMount(CoordToolkitComponent, {
                    global: {
                        plugins: [store]
                    }});
                const canvas = {},
                    map3D = {
                        mode: "3D",
                        getCesiumScene: () => canvas
                    };

                mapCollection.addMap(map3D, "3D");

                expect(wrapper.vm.eventHandler).to.be.null;

                store.commit("Maps/setMode", "3D");
                wrapper.vm.createInteraction();

                expect(wrapper.vm.eventHandler).to.be.not.null;
            });
        });

        it("setSupplyCoordInactive removes interaction", () => {
            wrapper = shallowMount(CoordToolkitComponent, {
                global: {
                    plugins: [store]
                }});
            expect(typeof store.state.Modules.CoordToolkit.selectPointerMove).to.be.equals("object");
            wrapper.vm.setSupplyCoordInactive();
            expect(store.state.Modules.CoordToolkit.selectPointerMove).to.be.null;
        });

        it("setSupplyCoordActive adds interaction", () => {
            wrapper = shallowMount(CoordToolkitComponent, {
                global: {
                    plugins: [store]
                }});
            // expect(store.state.Modules.CoordToolkit.selectPointerMove).to.be.null;
            wrapper.vm.setSupplyCoordActive();
            expect(typeof store.state.Modules.CoordToolkit.selectPointerMove).to.be.equals("object");
        });

        it("label returns correct path", () => {
            const key = "key";
            let value = "http://www.opengis.net/gml/srs/epsg.xml#4326",
                event = {
                    target: {
                        value: value
                    }
                },
                ret = "";

            wrapper = shallowMount(CoordToolkitComponent, {
                global: {
                    plugins: [store]
                }});
            wrapper.vm.initProjectionsInCoordToolkit();
            wrapper.vm.selectionChanged(event);

            // Projection EPSG:4326
            ret = wrapper.vm.getLabel(key);
            expect(ret).to.be.equals("common:modules.coordToolkit.hdms.key");
            // Projection EPSG:25832
            value = "http://www.opengis.net/gml/srs/epsg.xml#25832";
            event = {
                target: {
                    value: value
                }
            };
            wrapper.vm.selectionChanged(event);
            ret = wrapper.vm.getLabel(key);
            expect(ret).to.be.equals("common:modules.coordToolkit.utm.key");

            // Projection EPSG:31467
            value = "http://www.opengis.net/gml/srs/epsg.xml#31467";
            event = {
                target: {
                    value: value
                }
            };
            wrapper.vm.selectionChanged(event);
            ret = wrapper.vm.getLabel(key);
            expect(ret).to.be.equals("common:modules.coordToolkit.cartesian.key");

            value = null;
            event = {
                target: {
                    value: value
                }
            };
            wrapper.vm.selectionChanged(event);
            ret = wrapper.vm.getLabel(key);
            expect(ret).to.be.equals("common:modules.coordToolkit.cartesian.key");
        });

        it("changeMode changes the mode 'supply' or 'search'", async () => {
            wrapper = shallowMount(CoordToolkitComponent, {
                global: {
                    plugins: [store]
                }});
            expect(store.state.Modules.CoordToolkit.mode).to.be.equals("supply");
            expect(wrapper.vm.isEnabled("supply")).to.be.true;
            wrapper.vm.changeMode("search");
            await wrapper.vm.$nextTick();
            expect(store.state.Modules.CoordToolkit.mode).to.be.equals("search");
            expect(wrapper.vm.isEnabled("search")).to.be.true;
        });

        it("onInputEvent should call validateInput if mode is 'search'", async () => {
            wrapper = shallowMount(CoordToolkitComponent, {
                global: {
                    plugins: [store]
                }});
            wrapper.vm.changeMode("supply");
            expect(store.state.Modules.CoordToolkit.mode).to.be.equals("supply");
            wrapper.vm.onInputEvent("1234", {"value": "111"});
            expect(CoordToolkit.actions.validateInput.calledOnce).to.be.false;

            wrapper.vm.changeMode("search");
            await wrapper.vm.$nextTick();
            expect(store.state.Modules.CoordToolkit.mode).to.be.equals("search");
            wrapper.vm.onInputEvent("1234", {"value": "111"});
            expect(CoordToolkit.actions.validateInput.calledOnce).to.be.true;
        });

        it("getClassForEasting no error", async () => {
            wrapper = shallowMount(CoordToolkitComponent, {
                global: {
                    plugins: [store]
                }});
            wrapper.vm.selectionChanged(eventProj4326);
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.getClassForEasting()).to.be.equals("eastingToBottomNoError");
        });

        it("getClassForEasting eastingError", async () => {
            wrapper = shallowMount(CoordToolkitComponent, {
                global: {
                    plugins: [store]
                }});
            wrapper.vm.selectionChanged(eventProj4326);
            await wrapper.vm.$nextTick();
            store.commit("Modules/CoordToolkit/setEastingNoCoord", true);
            expect(wrapper.vm.getClassForEasting()).to.be.equals("eastingToBottomNoError");
        });

        it("getClassForEasting northingError", async () => {
            wrapper = shallowMount(CoordToolkitComponent, {
                global: {
                    plugins: [store]
                }});
            wrapper.vm.selectionChanged(eventProj4326);
            await wrapper.vm.$nextTick();
            store.commit("Modules/CoordToolkit/setEastingNoCoord", false);
            store.commit("Modules/CoordToolkit/setNorthingNoCoord", true);
            expect(wrapper.vm.getClassForEasting()).to.be.equals("eastingToBottomOneError");
        });

        it("getClassForEasting northingError and eastingError", async () => {
            wrapper = shallowMount(CoordToolkitComponent, {
                global: {
                    plugins: [store]
                }});
            wrapper.vm.selectionChanged(eventProj4326);
            await wrapper.vm.$nextTick();
            store.commit("Modules/CoordToolkit/setNorthingNoCoord", true);
            store.commit("Modules/CoordToolkit/setEastingNoCoord", true);
            expect(wrapper.vm.getClassForEasting()).to.be.equals("eastingToBottomTwoErrors");
        });

        it("getClassForNorthing no error", async () => {
            wrapper = shallowMount(CoordToolkitComponent, {
                global: {
                    plugins: [store]
                }});
            wrapper.vm.selectionChanged(eventProj4326);
            await wrapper.vm.$nextTick();
            store.commit("Modules/CoordToolkit/setNorthingNoCoord", false);
            store.commit("Modules/CoordToolkit/setEastingNoCoord", false);
            expect(wrapper.vm.getClassForNorthing()).to.be.equals("northingToTopNoError");
        });

        it("getClassForNorthing eastingError", async () => {
            wrapper = shallowMount(CoordToolkitComponent, {
                global: {
                    plugins: [store]
                }});
            wrapper.vm.selectionChanged(eventProj4326);
            await wrapper.vm.$nextTick();
            store.commit("Modules/CoordToolkit/setEastingNoCoord", true);
            expect(wrapper.vm.getClassForNorthing()).to.be.equals("northingToTopEastingError");
        });

        it("getClassForNorthing northingError", async () => {
            wrapper = shallowMount(CoordToolkitComponent, {
                global: {
                    plugins: [store]
                }});
            wrapper.vm.selectionChanged(eventProj4326);
            await wrapper.vm.$nextTick();
            store.commit("Modules/CoordToolkit/setEastingNoCoord", false);
            store.commit("Modules/CoordToolkit/setNorthingNoCoord", true);
            expect(wrapper.vm.getClassForNorthing()).to.be.equals("northingToTopNoError");
        });

        it("getClassForNorthing northingError and eastingError", async () => {
            wrapper = shallowMount(CoordToolkitComponent, {
                global: {
                    plugins: [store]
                }});
            wrapper.vm.selectionChanged(eventProj4326);
            await wrapper.vm.$nextTick();
            store.commit("Modules/CoordToolkit/setNorthingNoCoord", true);
            store.commit("Modules/CoordToolkit/setEastingNoMatch", true);
            expect(wrapper.vm.getClassForNorthing()).to.be.equals("northingToTopTwoErrors");
            store.commit("Modules/CoordToolkit/setEastingNoCoord", true);
            expect(wrapper.vm.getClassForNorthing()).to.be.equals("northingToTopTwoErrorsEastNoValue");
        });

        it("copyCoords one value", async () => {
            let input = null;

            wrapper = mount(CoordToolkitComponent, {
                global: {
                    plugins: [store]
                }});
            wrapper.vm.changeMode("search");
            input = wrapper.find("#coordinatesEastingField");
            input.element.value = "12345.67";

            expect(wrapper.find(".toast").classes("show")).to.be.false;
            await input.trigger("input");
            wrapper.vm.copyCoords(["coordinatesEastingField"]);

            expect(copyStub.calledOnce).to.be.true;
            expect(copyStub.firstCall.args[0]).to.be.equals("12345.67");
            expect(wrapper.find(".toast").classes("show")).to.be.true;
        });


        it("copyCoords two values", async () => {
            let input = null;

            wrapper = mount(CoordToolkitComponent, {
                global: {
                    plugins: [store]
                }});

            wrapper.vm.changeMode("search");
            input = wrapper.find("#coordinatesEastingField");
            input.element.value = "12345.67";
            await input.trigger("input");

            input = wrapper.find("#coordinatesNorthingField");
            input.element.value = "45678.12";
            await input.trigger("input");

            expect(wrapper.find(".toast").classes("show")).to.be.false;

            wrapper.vm.copyCoords(["coordinatesEastingField", "coordinatesNorthingField"]);
            await wrapper.vm.$nextTick();

            expect(copyStub.calledOnce).to.be.true;
            expect(copyStub.firstCall.args[0]).to.be.equals("45678.12|12345.67");
            expect(wrapper.find(".toast").classes("show")).to.be.true;
        });
    });

    describe("CoordToolkit.vue watcher", () => {
        it("watch to active shall set mode to 'supply'", async () => {
            wrapper = shallowMount(CoordToolkitComponent, {
                global: {
                    plugins: [store]
                }});

            await wrapper.vm.$nextTick();
            expect(store.state.Modules.CoordToolkit.mode).to.be.equals("supply");
            expect(typeof store.state.Modules.CoordToolkit.selectPointerMove).to.be.equals("object");
            expect(typeof store.state.Modules.CoordToolkit.selectPointerMove.handleMoveEvent).to.be.equals("function");

            wrapper.vm.$options.unmounted.call(wrapper.vm);
            await wrapper.vm.$nextTick();

            expect(store.state.Modules.CoordToolkit.eastingNoCoord).to.be.false;
            expect(store.state.Modules.CoordToolkit.eastingNoMatch).to.be.false;
            expect(store.state.Modules.CoordToolkit.northingNoCoord).to.be.false;
            expect(store.state.Modules.CoordToolkit.northingNoMatch).to.be.false;
            expect(store.state.Modules.CoordToolkit.coordinatesEasting.value).to.be.equals("");
            expect(store.state.Modules.CoordToolkit.coordinatesNorthing.value).to.be.equals("");
        });
        it("watch to clickCoordinate in mode supply shall call positionClicked", async () => {
            wrapper = shallowMount(CoordToolkitComponent, {
                global: {
                    plugins: [store]
                }});
            await wrapper.vm.$nextTick();
            expect(store.state.Modules.CoordToolkit.mode).to.be.equals("supply");
            wrapper.vm.$options.watch.clickCoordinate.handler.call(wrapper.vm, [10, 20]);
            expect(CoordToolkit.actions.positionClicked.calledOnce).to.be.true;
        });
        it("watch to clickCoordinate in mode search shall not call positionClicked", async () => {
            wrapper = shallowMount(CoordToolkitComponent, {
                global: {
                    plugins: [store]
                }});
            await wrapper.vm.$nextTick();
            expect(store.state.Modules.CoordToolkit.mode).to.be.equals("supply");
            wrapper.vm.changeMode("search");
            wrapper.vm.$options.watch.clickCoordinate.handler.call(wrapper.vm, [10, 20]);
            expect(CoordToolkit.actions.positionClicked.notCalled).to.be.true;
        });
    });
});
