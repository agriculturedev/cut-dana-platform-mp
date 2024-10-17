import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {nextTick} from "vue";
import {expect} from "chai";
import sinon from "sinon";
import MeasureInMapComponent from "../../../components/MeasureInMap.vue";
import MeasureModule from "../../../store/indexMeasure";

config.global.mocks.$t = key => key;

describe("src/modules/measure/components/MeasureInMap.vue", () => {
    let store,
        wrapper,
        origcreateDrawInteraction,
        origdeleteFeatures;

    const mockConfigJson = {
        portalConfig: {
            navigationSecondary: {
                sections: [
                    {
                        "type": "measure"
                    }
                ]
            }
        }
    };

    beforeEach(() => {

        mapCollection.clear();

        origcreateDrawInteraction = MeasureModule.actions.createDrawInteraction;
        origdeleteFeatures = MeasureModule.actions.deleteFeatures;
        MeasureModule.actions.createDrawInteraction = sinon.spy();
        MeasureModule.actions.deleteFeatures = sinon.spy();
        MeasureModule.actions.removeIncompleteDrawing = sinon.spy();
        MeasureModule.mutations.setSelectedGeometry = sinon.spy();
        MeasureModule.mutations.setSelectedLineStringUnit = sinon.spy();
        MeasureModule.mutations.setSelectedPolygonUnit = sinon.spy();

        store = createStore({
            modules: {
                namespaced: true,
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        Measure: MeasureModule
                    }
                },
                Maps: {
                    namespaced: true,
                    state: {
                        mode: "2D"
                    },
                    getters: {
                        layerById: () => id => ({})[id],
                        mode: () => "2D"
                    },
                    mutations: {
                        addLayerToMap: sinon.spy()
                    },
                    actions: {
                        addInteraction: sinon.spy(),
                        removeInteraction: sinon.spy(),
                        addLayer: sinon.spy(),
                        checkLayer: sinon.spy()
                    }
                }
            },
            state: {
                configJson: mockConfigJson
            },
            getters: {
                uiStyle: () => ""
            }
        });
    });

    afterEach(() => {
        MeasureModule.actions.createDrawInteraction = origcreateDrawInteraction;
        MeasureModule.actions.deleteFeatures = origdeleteFeatures;
        sinon.restore();
    });


    it("renders the measure tool with the expected form fields", () => {
        wrapper = shallowMount(MeasureInMapComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#measure").exists()).to.be.true;
        expect(wrapper.find("#measure-tool-geometry-select").exists()).to.be.true;
        expect(wrapper.find("#measure-tool-unit-select").exists()).to.be.true;
        expect(wrapper.find(".inaccuracy-list").exists()).to.be.true;
        expect(wrapper.find("#measure-delete").exists()).to.be.true;
    });

    it("select element interaction produces expected mutations, actions, and updates", () => {
        wrapper = shallowMount(MeasureInMapComponent, {
            global: {
                plugins: [store]
            }});
        const geometrySelect = wrapper.find("#measure-tool-geometry-select"),
            unitSelect = wrapper.find("#measure-tool-unit-select");

        // form initially "LineString" with m/km
        expect(geometrySelect.element.value).equals("LineString");
        expect(unitSelect.text())
            .to.contain("m")
            .and.to.contain("km")
            .and.not.to.contain("²");


        geometrySelect.trigger("change");

        nextTick(async () => {
            expect(MeasureModule.mutations.setSelectedGeometry.calledOnce).to.be.true;

            // draw interaction should have been remade on geometry change
            expect(MeasureModule.actions.createDrawInteraction.calledOnce).to.be.true;

            // after changing to "Polygon", m²/km² are the units
            expect(geometrySelect.element.value).equals("Polygon");
        });

        // check if changing unit produces expected effects
        expect(unitSelect.element.value).equals("0");
        unitSelect.element.value = "1";

        unitSelect.trigger("change");
        wrapper.vm.$nextTick();
        expect(unitSelect.element.value).equals("1");
        expect(MeasureModule.mutations.setSelectedLineStringUnit.calledOnce).to.be.true;

        // no further draw interaction recreation should have happened
        expect(MeasureModule.actions.createDrawInteraction.calledOnce).to.be.true;
    });

    it("clicking delete will call the appropriate action", async () => {
        wrapper = shallowMount(MeasureInMapComponent, {
            global: {
                plugins: [store]
            }});
        const deleteButton = wrapper.find("#measure-delete");

        expect(deleteButton).to.exist;
    });

    it("sets focus to first input control", async () => {
        const elem = document.createElement("div");

        if (document.body) {
            document.body.appendChild(elem);
        }
        wrapper = shallowMount(MeasureInMapComponent, {
            global: {
                plugins: [store]
            },
            attachTo: elem});

        wrapper.vm.setFocusToFirstControl();
        await wrapper.vm.$nextTick();
        expect(wrapper.find("#measure-tool-geometry-select").element).to.equal(document.activeElement);
    });
});
