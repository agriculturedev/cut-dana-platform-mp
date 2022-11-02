import Vuex from "vuex";
import {config, createLocalVue, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import PoiOrientationComponent from "../../../../components/poi/PoiOrientation.vue";
// import LinestringStyle from "../../../../../../../../modules/vectorStyle/linestringStyle.js";
// import PointStyle from "../../../../../../../../modules/vectorStyle/pointStyle.js";
// import PolygonStyle from "../../../../../../../../modules/vectorStyle/polygonStyle.js";
import Feature from "ol/Feature.js";
import sinon from "sinon";
import Icon from "ol/style/Icon";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/controls/orientation/components/PoiOrientation.vue", () => {
    let store,
        propsData,
        wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaced: true,
            modules: {
                Controls: {
                    namespaced: true,
                    modules: {
                        orientation: {
                            namespaced: true,
                            getters: {
                                activeCategory: sinon.stub(),
                                position: sinon.stub()
                            },
                            mutations: {
                                setActiveCategory: sinon.stub()
                            }
                        }
                    }
                }
            },
            getters: {
                visibleLayerConfigs: sinon.stub()
            }
        });

        propsData = {
            poiDistances: [
                1000,
                5000,
                10000
            ],
            getFeaturesInCircle: () => {
                const feature = new Feature(),
                    featuresAll = [];

                featuresAll.push(feature);

                return featuresAll;
            }
        };

        wrapper = shallowMount(PoiOrientationComponent, {
            store,
            propsData: propsData,
            localVue
        });
    });

    after(() => {
        sinon.restore();
    });

    describe("Render Component", function () {
        it("renders the Poi Orientation component", () => {
            expect(wrapper.find("#surrounding_vectorfeatures").exists()).to.be.true;
            expect(wrapper.find(".modal-backdrop").exists()).to.be.true;
        });
    });

    describe("getFeatureTitle", function () {
        let feature = new Feature();

        it("should return layerName when name is unset", function () {
            feature = Object.assign(feature, {
                layerName: "LayerName"
            });
            expect(wrapper.vm.getFeatureTitle(feature)).to.be.an("array").to.deep.equal(["LayerName"]);
        });
        it("should return name when set", function () {
            feature.set("name", "Name");
            expect(wrapper.vm.getFeatureTitle(feature)).to.be.an("array").to.deep.equal(["Name"]);
        });
        it("should return nearby title text when set", function () {
            feature = Object.assign(feature, {
                nearbyTitleText: ["nearbyTitleText"]
            });
            expect(wrapper.vm.getFeatureTitle(feature)).to.be.an("array").to.deep.equal(["nearbyTitleText"]);
        });
    });

    /**
     * ToDo: Tests nachziehen, wenn Vector Styling in vue
     */
    describe.skip("SVG Functions", function () {
        it("createPolygonGraphic should return an SVG", function () {
            // const style = new PolygonStyle();

            // expect(wrapper.vm.createPolygonGraphic(style)).to.be.an("string").to.equal("<svg height='35' width='35'><polygon points='5,5 30,5 30,30 5,30' style='fill:#0ac864;fill-opacity:0.5;stroke:#000000;stroke-opacity:1;stroke-width:1;'/></svg>");
        });
        it("createLineSVG should return an SVG", function () {
            // const style = new LinestringStyle();

            // expect(wrapper.vm.createLineSVG(style)).to.be.an("string").to.equal("<svg height='35' width='35'><path d='M 05 30 L 30 05' stroke='#ff0000' stroke-opacity='1' stroke-width='5' fill='none'/></svg>");
        });
        it("createCircleSVG should return an SVG", function () {
            // const style = new PointStyle();

            // expect(wrapper.vm.createCircleSVG(style)).to.be.an("string").to.equal("<svg height='35' width='35'><circle cx='17.5' cy='17.5' r='15' stroke='#000000' stroke-opacity='1' stroke-width='2' fill='#0099ff' fill-opacity='1'/></svg>");
        });
    });

    describe.skip("getImgPath", () => {
        let request;

        beforeEach(() => {
            request = sinon.spy(() => ({
                id: "createStyle",
                createStyle: () => sinon.spy({
                    id: "featureStyle",
                    getImage: () => new Icon({
                        src: "test.image"
                    })
                })
            }));
            sinon.stub(Radio, "request").callsFake(request);
        });

        it("should return an image path for an icon style", () => {
            const feat = {
                styleId: "123"
            };

            expect(wrapper.vm.getImgPath(feat)).to.equals("test.image");
            expect(request.calledOnce).to.be.true;
            expect(request.firstCall.args).to.deep.equals(["StyleList", "returnModelById", "123"]);
        });
    });
});
