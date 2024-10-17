import {createStore} from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {shallowMount} from "@vue/test-utils";
import AppComponent from "../../App.vue";
import MenuContainer from "../../modules/menu/components/MenuContainer.vue";
import MenuToggleButton from "../../modules/menu/components/MenuToggleButton.vue";
import maps from "../../core/maps/js/maps.js";
import loadAddons from "../../plugins/addons";

describe("src/App.vue", () => {
    let store,
        wrapper,
        actions,
        initializeMapsSpy;

    beforeEach(() => {
        initializeMapsSpy = sinon.spy(maps, "initializeMaps");
        actions = {
            extendLayers: sinon.spy(),
            loadConfigJs: sinon.spy(),
            loadConfigJson: sinon.spy(),
            loadRestServicesJson: sinon.spy(),
            loadServicesJson: sinon.spy(),
            initializeVectorStyle: sinon.spy(),
            initializeOther: sinon.stub()
        };

        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    actions: {
                        mergeModulesState: sinon.spy()
                    },
                    namespaced: true
                }
            },
            getters: {
                allConfigsLoaded: sinon.stub(),
                mapViewSettings: sinon.stub(),
                cesiumLibrary: () => {
                    return "path_to_cesium_library";
                },
                configJs: sinon.stub(),
                layerConfig: sinon.stub(),
                portalConfig: () => {
                    return {mapView: {}};
                },
                visibleLayerConfigs: () => {
                    return [];
                }
            },
            actions: actions,
            state: {
                loadedConfigs: {
                    configJson: false,
                    restSevicesJson: false,
                    servicesJson: false
                }
            },
            mutations: {
                setDeviceMode: sinon.spy()
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("loads config on creating App", () => {
        wrapper = shallowMount(AppComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#masterportal-container").exists()).to.be.true;
        expect(actions.loadConfigJson.calledOnce).to.be.true;
        expect(actions.loadRestServicesJson.calledOnce).to.be.true;
        expect(actions.loadServicesJson.calledOnce).to.be.true;
        expect(actions.loadConfigJs.calledOnce).to.be.true;
    });

    it("sets mapCollection as global variable", () => {
        wrapper = shallowMount(AppComponent, {
            global: {
                plugins: [store]
            }});

        expect(global.mapCollection).to.be.not.undefined;
    });

    it("watcher allConfigsLoaded is false", () => {
        wrapper = shallowMount(AppComponent, {
            global: {
                plugins: [store]
            }});

        wrapper.vm.$options.watch.allConfigsLoaded.call(wrapper.vm, false);
        expect(actions.extendLayers.notCalled).to.be.true;
        expect(initializeMapsSpy.notCalled).to.be.true;
    });
    it("App contains Menu components and map div", () => {
        wrapper = shallowMount(AppComponent, {
            global: {
                plugins: [store]
            }});

        wrapper.findComponent(MenuContainer);
        wrapper.findComponent(MenuToggleButton);
    });
    it("watcher allConfigsLoaded is true", async () => {
        await sinon.stub(loadAddons, "loadAddons");
        wrapper = await shallowMount(AppComponent, {
            global: {
                plugins: [store]
            }});
        await wrapper.vm.$options.watch.allConfigsLoaded.call(wrapper.vm, true);
        expect(await actions.extendLayers.calledOnce).to.be.true;
        expect(await initializeMapsSpy.calledOnce).to.be.true;
    });
});
