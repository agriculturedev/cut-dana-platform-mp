import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import LanguageComponent from "../../../components/LanguageItem.vue";
import Language from "../../../store/indexLanguage";

config.global.mocks.$t = key => key;

describe("src/modules/language/components/LanguageItem.vue", () => {
    let store;

    beforeEach(() => {
        config.global.mocks.$t = key => key;
        config.global.mocks.$i18next = {
            language: "de",
            options: {
                getLanguages: () => {
                    return ["de", "en"];
                }
            }
        };
        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        Language
                    }
                }
            }
        });
    });


    it("should have html elements", () => {
        const wrapper = mount(LanguageComponent, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find(".form-check")).to.exist;
        expect(wrapper.find("input")).to.exist;
        expect(wrapper.find("label")).to.exist;
    });

    it("translate() should change i18next language", () => {
        const wrapper = mount(LanguageComponent, {
            global: {
                plugins: [store]
            }
        });

        wrapper.vm.translate("esperanto");

        expect(i18next.language).to.be.equals("esperanto");
    });
});
