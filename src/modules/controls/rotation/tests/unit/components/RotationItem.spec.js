import {createStore} from "vuex";
import {expect} from "chai";
import {config, mount, shallowMount} from "@vue/test-utils";
import RotationItemComponent from "../../../components/RotationItem.vue";
import Map from "ol/Map";
import sinon from "sinon";
import RotationItem from "../../../store/indexRotation";

config.global.mocks.$t = key => key;

describe("src/modules/controls/rotation/components/RotationItem.vue", () => {
    let store,
        wrapper,
        showResetRotationAlways,
        showResetRotation,
        rotationIcons,
        isMobile,
        mapMode,
        moveUpSpy,
        moveRightSpy,
        moveLeftSpy,
        moveDownSpy;

    before(() => {
        const map3d = {
            id: "olcs",
            mode: "3D",
            getCesiumScene: () => {
                return {
                    camera: {
                        moveUp: moveUpSpy,
                        moveDown: moveDownSpy,
                        moveRight: moveRightSpy,
                        moveLeft: moveLeftSpy
                    }
                };
            }
        };

        mapCollection.clear();
        mapCollection.addMap(new Map(), "2D");
        mapCollection.addMap(map3d, "3D");
    });
    beforeEach(() => {
        mapMode = "2D";
        isMobile = false;
        showResetRotation = true;
        showResetRotationAlways = false;
        rotationIcons = true;
        moveUpSpy = sinon.spy();
        moveDownSpy = sinon.spy();
        moveRightSpy = sinon.spy();
        moveLeftSpy = sinon.spy();

        store = createStore({
            namespaced: true,
            modules: {
                Controls: {
                    namespaced: true,
                    modules: {
                        Rotation: RotationItem
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: {
                        mode: () => mapMode
                    }
                }
            },
            getters: {
                isMobile: () => isMobile,
                controlsConfig: () => {
                    return {
                        rotation: {
                            showResetRotationAlways: showResetRotationAlways,
                            showResetRotation: showResetRotation,
                            rotationIcons: rotationIcons
                        }
                    };
                }
            }
        });
        store.commit("Controls/Rotation/setRotation", 0, {root: true});
        store.commit("Controls/Rotation/setShowResetRotationAlways", false, {root: true});
        store.commit("Controls/Rotation/setRotationAngle", 45, {root: true});
    });
    afterEach(() => {
        sinon.restore();
    });
    it("the reset rotation button renders if rotation is not 0, rotate buttons are rendered", async () => {
        store.commit("Controls/Rotation/setRotation", 0.1, {root: true});
        wrapper = mount(RotationItemComponent, {
            global: {
                plugins: [store]
            }});
        expect(wrapper.find("#rotation-control").exists()).to.be.true;
        expect(wrapper.find("#reset-rotation").exists()).to.be.true;
        expect(wrapper.find("#rotate-clockwise").exists()).to.be.true;
        expect(wrapper.find("#rotate-counter-clockwise").exists()).to.be.true;
    });
    it("isMobile: the reset rotation button renders, rotate buttons are not rendered", async () => {
        isMobile = true;
        store.commit("Controls/Rotation/setRotation", 0.1, {root: true});
        wrapper = mount(RotationItemComponent, {
            global: {
                plugins: [store]
            }});
        expect(wrapper.find("#rotation-control").exists()).to.be.true;
        expect(wrapper.find("#reset-rotation").exists()).to.be.true;
        expect(wrapper.find("#rotate-clockwise").exists()).to.be.false;
        expect(wrapper.find("#rotate-counter-clockwise").exists()).to.be.false;
    });
    it("the reset rotation button renders if showResetRotationAlways is true, rotate buttons are rendered", () => {
        showResetRotationAlways = true;
        store.commit("Controls/Rotation/setShowResetRotationAlways", true, {root: true});
        wrapper = shallowMount(RotationItemComponent, {
            global: {
                plugins: [store]
            }});
        expect(wrapper.find("#rotation-control").exists()).to.be.true;
        expect(wrapper.find("#reset-rotation").exists()).to.be.true;
        expect(wrapper.find("#rotate-clockwise").exists()).to.be.true;
        expect(wrapper.find("#rotate-counter-clockwise").exists()).to.be.true;
    });
    it("only reset rotation button renders is mobile", () => {
        isMobile = true;
        showResetRotationAlways = true;
        store.commit("Controls/Rotation/setShowResetRotationAlways", true, {root: true});
        wrapper = shallowMount(RotationItemComponent, {
            global: {
                plugins: [store]
            }});
        expect(wrapper.find("#rotation-control").exists()).to.be.true;
        expect(wrapper.find("#reset-rotation").exists()).to.be.true;
        expect(wrapper.find("#rotate-clockwise").exists()).to.be.false;
        expect(wrapper.find("#rotate-counter-clockwise").exists()).to.be.false;
        expect(wrapper.find(".compass").exists()).to.be.false;
    });
    it("the reset rotation button not rendered if showResetRotationAlways is false, rotate buttons are rendered", () => {
        showResetRotationAlways = false;
        wrapper = shallowMount(RotationItemComponent, {
            global: {
                plugins: [store]
            }});
        expect(wrapper.find("#rotation-control").exists()).to.be.true;
        expect(wrapper.find("#reset-rotation").exists()).to.be.false;
        expect(wrapper.find("#rotate-clockwise").exists()).to.be.true;
        expect(wrapper.find("#rotate-counter-clockwise").exists()).to.be.true;
    });
    it("the reset rotation button not rendered if showResetRotationAlways is false, rotate buttons are rendered", () => {
        showResetRotationAlways = false;
        wrapper = shallowMount(RotationItemComponent, {
            global: {
                plugins: [store]
            }});
        expect(wrapper.find("#rotation-control").exists()).to.be.true;
        expect(wrapper.find("#reset-rotation").exists()).to.be.false;
        expect(wrapper.find("#rotate-clockwise").exists()).to.be.true;
        expect(wrapper.find("#rotate-counter-clockwise").exists()).to.be.true;
    });
    it("the reset-rotation button is not rendered if showResetRotation is false", () => {
        showResetRotation = false;
        wrapper = shallowMount(RotationItemComponent, {
            global: {
                plugins: [store]
            }});
        expect(wrapper.find("#rotation-control").exists()).to.be.true;
        expect(wrapper.find("#reset-rotation").exists()).to.be.false;
        expect(wrapper.find("#rotate-clockwise").exists()).to.be.true;
        expect(wrapper.find("#rotate-counter-clockwise").exists()).to.be.true;
    });
    describe("compass", () => {
        it("compass is rendered in 3D - default state", () => {
            mapMode = "3D";
            wrapper = shallowMount(RotationItemComponent, {
                global: {
                    plugins: [store]
                }});

            expect(wrapper.find(".compass").exists()).to.be.true;
            expect(wrapper.find("#north-pointer").exists()).to.be.true;
            expect(wrapper.find("#compass_north").exists()).to.be.true;
            expect(wrapper.find("#compass_south").exists()).to.be.true;
            expect(wrapper.find("#compass_west").exists()).to.be.true;
            expect(wrapper.find("#compass_east").exists()).to.be.true;

        });
        it("compass is not rendered in 3D - compass3d = false", () => {
            mapMode = "3D";
            store.commit("Controls/Rotation/setCompass3d", false, {root: true});
            wrapper = shallowMount(RotationItemComponent, {
                global: {
                    plugins: [store]
                }});

            expect(wrapper.find(".compass").exists()).to.be.false;
        });
        it("compass is not rendered in 3D - mobile = true", () => {
            mapMode = "3D";
            isMobile = true;
            wrapper = shallowMount(RotationItemComponent, {
                global: {
                    plugins: [store]
                }});

            expect(wrapper.find(".compass").exists()).to.be.false;
        });
        it("compass is not rendered in 2D - default state", () => {
            mapMode = "2D";
            wrapper = shallowMount(RotationItemComponent, {
                global: {
                    plugins: [store]
                }});

            expect(wrapper.find(".compass").exists()).to.be.false;
        });
        it("compass is not rendered in 2D - mobile = true", () => {
            isMobile = true;
            wrapper = shallowMount(RotationItemComponent, {
                global: {
                    plugins: [store]
                }});

            expect(wrapper.find(".compass").exists()).to.be.false;
        });
        it("compass is rendered in 2D - compass2d = true", () => {
            store.commit("Controls/Rotation/setCompass2d", true, {root: true});
            wrapper = shallowMount(RotationItemComponent, {
                global: {
                    plugins: [store]
                }});

            expect(wrapper.find(".compass").exists()).to.be.true;
            expect(wrapper.find("#north-pointer").exists()).to.be.true;
            expect(wrapper.find("#compass_north").exists()).to.be.true;
            expect(wrapper.find("#compass_south").exists()).to.be.true;
            expect(wrapper.find("#compass_west").exists()).to.be.true;
            expect(wrapper.find("#compass_east").exists()).to.be.true;
        });
    });
    describe("methods", () => {
        it("setToNorth() sets mapView rotation to 0", () => {
            wrapper = shallowMount(RotationItemComponent, {
                global: {
                    plugins: [store]
                }});
            mapCollection.getMapView("2D").setRotation(4);
            wrapper.vm.setToNorth();
            expect(mapCollection.getMapView("2D").getRotation()).to.eql(0);
        });
        it("move3d moves the 3D view up", () => {
            const evt = {
                currentTarget: {
                    id: "compass_north"
                }
            };

            mapMode = "3D";
            wrapper = shallowMount(RotationItemComponent, {
                global: {
                    plugins: [store]
                }});
            wrapper.vm.move3d(evt);
            expect(moveUpSpy.calledOnce).to.be.true;
        });
        it("move3d moves the 3D view down", () => {
            const evt = {
                currentTarget: {
                    id: "compass_south"
                }
            };

            mapMode = "3D";
            wrapper = shallowMount(RotationItemComponent, {
                global: {
                    plugins: [store]
                }});
            wrapper.vm.move3d(evt);
            expect(moveDownSpy.calledOnce).to.be.true;
        });
        it("move3d moves the 3D view right", () => {
            const evt = {
                currentTarget: {
                    id: "compass_east"
                }
            };

            mapMode = "3D";
            wrapper = shallowMount(RotationItemComponent, {
                global: {
                    plugins: [store]
                }});
            wrapper.vm.move3d(evt);
            expect(moveRightSpy.calledOnce).to.be.true;
        });
        it("move3d moves the 3D view left", () => {
            const evt = {
                currentTarget: {
                    id: "compass_west"
                }
            };

            mapMode = "3D";
            wrapper = shallowMount(RotationItemComponent, {
                global: {
                    plugins: [store]
                }});
            wrapper.vm.move3d(evt);
            expect(moveLeftSpy.calledOnce).to.be.true;
        });
    });
});
