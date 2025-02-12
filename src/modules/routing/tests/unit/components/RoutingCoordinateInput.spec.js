import {createStore} from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount, mount} from "@vue/test-utils";
import RoutingCoordinateInputComponent from "../../../components/RoutingCoordinateInput.vue";
import mutations from "../../../store/mutationsRouting";
import actions from "../../../store/actionsRouting";
import {RoutingWaypoint} from "../../../js/classes/routing-waypoint";
import {RoutingGeosearchResult} from "../../../js/classes/routing-geosearch-result";

config.global.mocks.$t = key => key;

describe("src/modules/routing/components/RoutingCoordinateInput.vue", () => {
    let store,
        wrapper,
        props;

    beforeEach(() => {
        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        Routing: {
                            namespaced: true,
                            mutations: mutations,
                            actions: actions,
                            modules: {
                                Directions: {
                                    namespaced: true,
                                    getters: {
                                        waypoints: sinon.stub()
                                    }
                                }
                            }
                        }
                    }
                },
                Alerting: {
                    namespaced: true,
                    actions: {
                        addSingleAlert: sinon.stub()
                    }
                }
            }
        });

        props = {
            waypoint: new RoutingWaypoint({
                index: 0,
                source: {
                    addFeature: () => sinon.spy()
                }
            }),
            countWaypoints: 0
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    it("renders RoutingCoordinateInputComponent", () => {
        wrapper = shallowMount(RoutingCoordinateInputComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        expect(wrapper.find(".form-group-sm.mb-4.mx-0").exists()).to.be.true;
    });

    it("emits moveWaypointUp", async () => {
        wrapper = mount(RoutingCoordinateInputComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        const button = wrapper.find(".button-up");

        button.trigger("click");
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted().moveWaypointUp.length).equal(1);
    });

    it("emits moveWaypointDown", async () => {
        wrapper = mount(RoutingCoordinateInputComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        const button = wrapper.find(".bi-chevron-down");

        button.element.click();
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted().moveWaypointDown.length).equal(1);
    });

    it("emits removeWaypoint", async () => {
        wrapper = mount(RoutingCoordinateInputComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        const button = wrapper.find(".m-1");

        button.element.click();
        await wrapper.vm.$nextTick();
        expect(wrapper.emitted().removeWaypoint.length).equal(1);
    });

    it("renders resetInputButton", async () => {
        wrapper = shallowMount(RoutingCoordinateInputComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        wrapper.setData({search: "testsearch"});
        await wrapper.vm.$nextTick();
        expect(wrapper.find(".reset-button").exists()).to.be.true;
    });

    it("renders searchResults", async () => {
        wrapper = shallowMount(RoutingCoordinateInputComponent, {
            global: {
                plugins: [store]
            },
            props: props
        });
        wrapper.setData({
            searchResults: [
                new RoutingGeosearchResult([8, 52], "test1"),
                new RoutingGeosearchResult([8, 52], "test2")
            ]
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll("li").length).equal(2);
        expect(wrapper.findAll(".search-result-button").at(0).element.innerHTML).equal("test1");
        expect(wrapper.findAll(".search-result-button").at(1).element.innerHTML).equal("test2");
    });

    describe("tests isInputtextWgs84Coordinate", () => {
        it("should return [8, 52] for '8, 52'", () => {
            wrapper = shallowMount(RoutingCoordinateInputComponent, {
                global: {
                    plugins: [store]
                },
                props: props
            });
            wrapper.setData({search: "8, 52"});
            expect(wrapper.vm.isInputtextWgs84Coordinate()).deep.to.equal([8, 52]);
        });

        it("should return [8.12, 52.34] for '8.12, 52.34'", () => {
            wrapper = shallowMount(RoutingCoordinateInputComponent, {
                global: {
                    plugins: [store]
                },
                props: props
            });
            wrapper.setData({search: "8.12, 52.34"});
            expect(wrapper.vm.isInputtextWgs84Coordinate()).deep.to.equal([8.12, 52.34]);
        });

        it("should return false for '8,12 52,34'", () => {
            wrapper = shallowMount(RoutingCoordinateInputComponent, {
                global: {
                    plugins: [store]
                },
                props: props
            });
            wrapper.setData({search: "8,12 52,34"});
            expect(wrapper.vm.isInputtextWgs84Coordinate()).to.be.false;
        });

        it("should return false for 'test'", () => {
            wrapper = shallowMount(RoutingCoordinateInputComponent, {
                global: {
                    plugins: [store]
                },
                props: props
            });
            wrapper.setData({search: "test"});
            expect(wrapper.vm.isInputtextWgs84Coordinate()).to.be.false;
        });
    });

    describe("test component methods", () => {
        it("'selectSearchResult' should select search result on waypoint and emit 'searchResultSelected'", async () => {
            wrapper = shallowMount(RoutingCoordinateInputComponent, {
                global: {
                    plugins: [store]
                },
                props: props
            });
            wrapper.setData({
                searchResults: [
                    new RoutingGeosearchResult([8, 52], "test1"),
                    new RoutingGeosearchResult([8, 52], "test2")
                ]
            });
            await wrapper.vm.$nextTick();
            wrapper.vm.selectSearchResult(new RoutingGeosearchResult([8, 52], "test1"));
            expect(props.waypoint.getDisplayName()).equal("test1");
            expect(wrapper.vm.search).equal("test1");
            expect(wrapper.vm.searchResults.length).equal(0);
            expect(wrapper.emitted().searchResultSelected.length).equal(1);
        });

        it("'selectWgs84Coordinate' should select search result on waypoint after wgs84 coordinates were entered and emit 'searchResultSelected'", async () => {
            wrapper = shallowMount(RoutingCoordinateInputComponent, {
                global: {
                    plugins: [store]
                },
                props: props
            });
            wrapper.vm.transformCoordinatesWgs84ToLocalProjection = (coordinates) => coordinates;
            wrapper.setData({search: "8, 52"});
            await wrapper.vm.$nextTick();
            await wrapper.vm.selectWgs84Coordinate([8, 52]);
            expect(props.waypoint.getCoordinates()).deep.to.equal([8, 52]);
            expect(props.waypoint.getDisplayName()).equal("8, 52");
            expect(wrapper.vm.searchResults.length).equal(0);
            expect(wrapper.emitted().searchResultSelected.length).equal(1);
        });

        it("'resetInput' should reset 'searchResults' and 'search'", async () => {
            wrapper = shallowMount(RoutingCoordinateInputComponent, {
                global: {
                    plugins: [store]
                },
                props: props
            });
            wrapper.setData({
                search: "test",
                searchResults: [
                    new RoutingGeosearchResult([8, 52], "test1"),
                    new RoutingGeosearchResult([8, 52], "test2")
                ]
            });
            await wrapper.vm.$nextTick();
            wrapper.vm.resetInput();
            expect(wrapper.vm.search).equal("");
            expect(wrapper.vm.searchResults.length).equal(0);
        });

        it("'resetInput' should reset 'searchResults' and 'search' to waypoint displayName", async () => {
            props.waypoint.setDisplayName("waypointnametest");
            wrapper = shallowMount(RoutingCoordinateInputComponent, {
                global: {
                    plugins: [store]
                },
                props: props
            });
            wrapper.setData({
                search: "test",
                searchResults: [
                    new RoutingGeosearchResult([8, 52], "test1"),
                    new RoutingGeosearchResult([8, 52], "test2")
                ]
            });
            await wrapper.vm.$nextTick();
            wrapper.vm.resetInput();
            expect(wrapper.vm.search).equal("waypointnametest");
            expect(wrapper.vm.searchResults.length).equal(0);
        });
    });
    describe("test watcher", () => {
        it("waypoints from extern shall set search to displayName if lastWaypoints are null", async () => {
            const waypoints = [{
                    index: 0,
                    coordinates: [1, 2],
                    fromExtern: true,
                    displayName: "displayName"
                }],
                lastWaypoints = null;

            wrapper = shallowMount(RoutingCoordinateInputComponent, {
                global: {
                    plugins: [store]
                },
                props: props
            });

            wrapper.vm.$options.watch.waypoints.handler.call(wrapper.vm, waypoints, lastWaypoints);
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.search).equal("displayName");
        });
        it("watcher waypoints shall do nothing if waypoints are not extern", async () => {
            const waypoints = [{
                    index: 0,
                    coordinates: [1, 2],
                    fromExtern: false,
                    displayName: "displayName"
                }],
                lastWaypoints = null;

            wrapper = shallowMount(RoutingCoordinateInputComponent, {
                global: {
                    plugins: [store]
                },
                props: props
            });

            wrapper.vm.$options.watch.waypoints.handler.call(wrapper.vm, waypoints, lastWaypoints);
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.search).equal("");
        });
        it("watcher waypoints shall do nothing if old waypoints are not empty", async () => {
            const waypoints = [{
                    index: 1,
                    coordinates: [3, 4],
                    fromExtern: true,
                    displayName: "displayName 2"
                }],
                lastWaypoints = [{
                    index: 0,
                    coordinates: [1, 2],
                    fromExtern: true,
                    displayName: "displayName"
                }];

            wrapper = shallowMount(RoutingCoordinateInputComponent, {
                global: {
                    plugins: [store]
                },
                props: props
            });

            wrapper.vm.$options.watch.waypoints.handler.call(wrapper.vm, waypoints, lastWaypoints);
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.search).equal("");
        });
    });
});
