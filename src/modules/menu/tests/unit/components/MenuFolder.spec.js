import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import MenuFolder from "../../../components/MenuFolder.vue";
import MenuContainerBodyRootItems from "../../../components/MenuContainerBodyRootItems.vue";
import {expect} from "chai";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src/modules/menu/MenuFolder.vue", () => {
    let store,
        wrapper,
        currentFolderPath,
        side;

    beforeEach(() => {
        side = "mainMenu";
        currentFolderPath = [side, "sections", 0, 13];
        store = createStore({
            modules: {
                Menu: {
                    namespaced: true,
                    getters: {
                        currentComponentName: () => () => "currentComponentName",
                        currentFolderPath: () => () => currentFolderPath
                    }
                }
            }
        });
    });


    afterEach(sinon.restore);

    it("renders MenuContainerBodyRootItems in mainMenu", () => {
        wrapper = shallowMount(MenuFolder, {global: {
            plugins: [store]
        }, propsData: {side}
        });

        expect(wrapper.findComponent(MenuContainerBodyRootItems).exists()).to.be.true;
        expect(wrapper.find("menu-container-body-root-items-stub").attributes("idappendix")).to.be.equals("mainMenu");
        expect(wrapper.find("menu-container-body-root-items-stub").attributes("path")).to.be.equals(currentFolderPath.join(",") + ",elements");
    });

    it("renders MenuContainerBodyRootItems in secondaryMenu", () => {
        side = "secondaryMenu";

        wrapper = shallowMount(MenuFolder, {global: {
            plugins: [store]
        }, propsData: {side}
        });

        expect(wrapper.findComponent(MenuContainerBodyRootItems).exists()).to.be.true;
        expect(wrapper.find("menu-container-body-root-items-stub").attributes("idappendix")).to.be.equals("secondaryMenu");
        expect(wrapper.find("menu-container-body-root-items-stub").attributes("path")).to.be.equals(currentFolderPath.join(",") + ",elements");
    });
});
