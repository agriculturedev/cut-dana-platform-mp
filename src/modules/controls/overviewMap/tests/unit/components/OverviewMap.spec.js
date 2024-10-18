import Vuex from "vuex";
import {config, createLocalVue, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import OverviewMap from "../../../components/OverviewMap.vue";
import overviewMapStore from "../../../store/indexOverviewMap.js";
import sinon from "sinon";
import utils from "../../../components/utils.js";
import View from "ol/View.js";
import Layer from "ol/layer/Vector.js";
import Source from "ol/source/Vector.js";


const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/controls/overviewMap/OverviewMap.vue", () => {
    let store,
        wrapper,
        exampleLayer,
        exampleView;

    beforeEach(() => {
        sinon.stub(utils, "getOverviewMapLayer").returns(exampleLayer);
        sinon.stub(utils, "getOverviewMapView").returns(exampleView);
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                controls: {
                    namespaced: true,
                    modules: {
                        overviewMap: overviewMapStore
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
                uiStyle: () => "DEFAULT"
            }
        });

        wrapper = shallowMount(OverviewMap, {
            store,
            localVue
        });
        exampleLayer = new Layer({id: "123", source: new Source()});
        exampleView = new View({
            center: [565106.71, 5934434.76],
            projection: "EPSG:25832"});
    });
    afterEach(() => {
        sinon.restore();
        wrapper.destroy();
    });
    describe("Methods", () => {
        describe("prepareOverViewMap", () => {
            it("should return undefined if anything but a string or number is given as first param", () => {
                expect(wrapper.vm.prepareOverViewMap(undefined)).to.deep.equal({});
                expect(wrapper.vm.prepareOverViewMap({})).to.deep.equal({});
                expect(wrapper.vm.prepareOverViewMap([])).to.deep.equal({});
                expect(wrapper.vm.prepareOverViewMap(null)).to.deep.equal({});
                expect(wrapper.vm.prepareOverViewMap(true)).to.deep.equal({});
                expect(wrapper.vm.prepareOverViewMap(false)).to.deep.equal({});
            });
            it("should return a baseLayer and a baseView", () => {
                const prepared = wrapper.vm.prepareOverViewMap(0),
                    expected = Object.prototype.hasOwnProperty.call(prepared, "baseLayer")
                    && Object.prototype.hasOwnProperty.call(prepared, "baseView");

                expect(expected).to.be.true;
            });
        });
        describe("createOverViewMap", () => {
            it("should not create an overview map if first param is not an object", () => {
                wrapper.vm.createOverViewMap(undefined);
                expect(wrapper.vm.overviewMap).to.be.null;
                wrapper.vm.createOverViewMap(null);
                expect(wrapper.vm.overviewMap).to.be.null;
                wrapper.vm.createOverViewMap([]);
                expect(wrapper.vm.overviewMap).to.be.null;
                wrapper.vm.createOverViewMap(true);
                expect(wrapper.vm.overviewMap).to.be.null;
                wrapper.vm.createOverViewMap(false);
                expect(wrapper.vm.overviewMap).to.be.null;
                wrapper.vm.createOverViewMap(1234);
                expect(wrapper.vm.overviewMap).to.be.null;
                wrapper.vm.createOverViewMap("1234");
                expect(wrapper.vm.overviewMap).to.be.null;
            });
            it("should not create an overview map if second param is not an object", () => {
                wrapper.vm.createOverViewMap({}, undefined);
                expect(wrapper.vm.overviewMap).to.be.null;
                wrapper.vm.createOverViewMap({}, null);
                expect(wrapper.vm.overviewMap).to.be.null;
                wrapper.vm.createOverViewMap({}, []);
                expect(wrapper.vm.overviewMap).to.be.null;
                wrapper.vm.createOverViewMap({}, true);
                expect(wrapper.vm.overviewMap).to.be.null;
                wrapper.vm.createOverViewMap({}, false);
                expect(wrapper.vm.overviewMap).to.be.null;
                wrapper.vm.createOverViewMap({}, 1234);
                expect(wrapper.vm.overviewMap).to.be.null;
                wrapper.vm.createOverViewMap({}, "1234");
                expect(wrapper.vm.overviewMap).to.be.null;
            });
            it("should remove existing overviewMap from the control", async () => {
                const removeControlStub = sinon.stub();

                sinon.stub(mapCollection, "getMap").returns({
                    removeControl: removeControlStub,
                    addControl: sinon.stub()
                });

                wrapper.vm.overviewMap = {};
                await wrapper.vm.$nextTick();
                wrapper.vm.createOverViewMap(exampleLayer, exampleView);
                expect(removeControlStub.called).to.be.true;
            });
            it("should call addControl", async () => {
                const addControlStub = sinon.stub();

                sinon.stub(mapCollection, "getMap").returns({
                    removeControl: sinon.stub(),
                    addControl: addControlStub
                });

                wrapper.vm.overviewMap = {};
                await wrapper.vm.$nextTick();
                wrapper.vm.createOverViewMap(exampleLayer, exampleView);
                expect(addControlStub.called).to.be.true;
            });
        });
    });
});
