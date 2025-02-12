import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import LayerInfoContactButton from "../../../components/LayerInfoContactButton.vue";

config.global.mocks.$t = key => key;

describe("src/modules/layerTree/components/LayerInfoContactButton.vue", () => {
    let store,
        pointOfContact,
        publisher,
        isModuleAvailable;

    const propsData = {
        layerName: "Layer XYZ",
        previousComponent: "layerInformation"
    };

    beforeEach(() => {
        isModuleAvailable = true;
        store = createStore({
            namespaced: true,
            modules: {
                namespaced: true,
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        LayerInformation: {
                            namespaced: true,
                            getters: {
                                layerInfo: () => ({"metaIdArray": [], "url": ["https://wms.example.org/", "https://wfs.example.org/?evil=1", "./local.geojson"], "typ": ["WMS", "WFS", "GeoJSON"], "layerNames": ["X-WMS", "X-WFS", ""]}),
                                pointOfContact: () => pointOfContact,
                                publisher: () => publisher
                            }
                        },
                        Contact: {
                            namespaced: true,
                            getters: {
                                name: () => "Contactname",
                                type: () => "contact"
                            }
                        }
                    }
                },
                Menu: {
                    namespaced: true,
                    getters: {
                        secondaryMenu: () => {
                            return {
                                sections: [
                                    [
                                        {
                                            type: "section1"
                                        },
                                        {
                                            type: "section2"
                                        }
                                    ]
                                ]
                            };
                        }
                    }
                }
            },
            getters: {
                isModuleAvailable: () => () => isModuleAvailable
            }
        });
    });


    it("should show contact button", async () => {
        pointOfContact = {
            "name": "Behörde ABC",
            "positionName": ["Metadaten-Verantwortlicher"],
            "street": "XYZ Straße 99",
            "housenr": "",
            "postalCode": "D-12345",
            "city": "Hamburg",
            "email": "test@gv.hamburg.de",
            "country": "DEU"
        };
        publisher = "";

        const wrapper = mount(LayerInfoContactButton, {
            global: {
                plugins: [store]
            },
            propsData
        });

        expect(wrapper.find(".openContactButton").exists()).to.be.true;
    });

    it("should not show contact button if no contact information is in the metadata", async () => {
        pointOfContact = "";
        publisher = "";

        const wrapper = mount(LayerInfoContactButton, {
            global: {
                plugins: [store]
            },
            propsData
        });

        expect(wrapper.find(".openContactButton").exists()).to.be.false;
    });

    it("should not show contact button if contact module is not configured", async () => {
        pointOfContact = {
            "name": "Behörde ABC",
            "positionName": ["Metadaten-Verantwortlicher"],
            "street": "XYZ Straße 99",
            "housenr": "",
            "postalCode": "D-12345",
            "city": "Hamburg",
            "email": "test@gv.hamburg.de",
            "country": "DEU"
        };
        publisher = "";
        isModuleAvailable = false;

        const wrapper = mount(LayerInfoContactButton, {
            global: {
                plugins: [store]
            },
            propsData
        });

        expect(wrapper.find(".openContactButton").exists()).to.be.false;
    });
});
