import {expect} from "chai";
import sinon from "sinon";
import Vuex from "vuex";
import Modeler3D from "../../../store/indexModeler3D";
import {mount, config, createLocalVue} from "@vue/test-utils";
import EntityListComponent from "../../../components/ui/EntityList.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("src/modules/tools/modeler3D/components/EntityList.vue", () => {
    let store, wrapper;

    beforeEach(() => {
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        Modeler3D
                    }
                }
            }
        });
    });

    afterEach(() => {
        sinon.restore();
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it("shows buttons for importedModel", () => {
        wrapper = mount(EntityListComponent, {store, localVue, propsData: {
            objects: [{
                id: "id",
                name: "name",
                show: false
            }],
            objectsLabel: "Test",
            entity: true
        }});

        const zoomToButton = wrapper.find("#list-zoomTo"),
            hideButton = wrapper.find("#list-hide"),
            deleteButton = wrapper.find("#list-delete");

        expect(zoomToButton.exists()).to.be.true;
        expect(hideButton.exists()).to.be.true;
        expect(deleteButton.exists()).to.be.true;
    });

    it("shows buttons for hiddenObjects", () => {
        wrapper = mount(EntityListComponent, {store, localVue, propsData: {
            objects: [{
                id: "id",
                name: "name",
                show: false
            }],
            objectsLabel: "Test",
            entity: true
        }});

        const hideButton = wrapper.find("#list-hide");

        expect(hideButton.exists()).to.be.true;
    });

    it("changes activeObject", () => {
        store.commit("Tools/Modeler3D/setCurrentModelId", "someId");
        wrapper = mount(EntityListComponent, {store, localVue, propsData: {
            objects: [
                {
                    id: "id",
                    name: "name",
                    show: false
                },
                {
                    id: "someId",
                    name: "name2",
                    show: false
                }
            ],
            objectsLabel: "Test",
            entity: true
        }});

        const buttons = wrapper.findAll("button.listButton");

        expect(buttons.at(0).classes()).to.not.include("active");
        expect(buttons.at(1).classes()).to.include("active");
    });
});
