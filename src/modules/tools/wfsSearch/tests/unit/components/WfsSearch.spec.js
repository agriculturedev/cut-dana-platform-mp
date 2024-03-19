import Vuex from "vuex";
import {config, mount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import WfsSearch from "../../../components/WfsSearch.vue";
import WfsSearchModule from "../../../store/indexWfsSearch";

const localVue = createLocalVue();

localVue.use(Vuex);
config.mocks.$t = key => key;

describe("src/modules/tools/wfsSearch/components/WfsSearch.vue", () => {
    const arbitraryFeature = {
            getGeometryName: () => "Klein bottle"
        },
        instanceChangedOrig = WfsSearchModule.actions.instanceChanged;
    let instances,
        store,
        placingPointMarkerSpy,
        placingPolygonMarkerSpy,
        setCenterSpy,
        setZoomLevelSpy,
        zoomToExtentSpy;

    beforeEach(() => {
        const map = {
            id: "ol",
            mode: "2D",
            updateSize: sinon.spy()
        };

        mapCollection.clear();
        mapCollection.addMap(map, "2D");

        placingPointMarkerSpy = sinon.spy();
        placingPolygonMarkerSpy = sinon.spy();
        setCenterSpy = sinon.spy();
        setZoomLevelSpy = sinon.spy();
        zoomToExtentSpy = sinon.spy();

        instances = [{
            title: "Test WfsSearch",
            resultList: {},
            literals: [{}]
        }];
        WfsSearchModule.actions.instanceChanged = sinon.stub();
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        WfsSearch: WfsSearchModule
                    }
                },
                MapMarker: {
                    namespaced: true,
                    actions: {
                        removePointMarker: sinon.stub(),
                        placingPointMarker: placingPointMarkerSpy,
                        placingPolygonMarker: placingPolygonMarkerSpy
                    }
                },
                Maps: {
                    namespaced: true,
                    actions: {
                        setCenter: setCenterSpy,
                        setZoomLevel: setZoomLevelSpy,
                        zoomToExtent: zoomToExtentSpy
                    }
                },
                Alerting: {
                    namespaced: true,
                    actions: {
                        addSingleAlert: sinon.stub()
                    }
                },
                Language: {
                    namespaced: true,
                    getters: {
                        currentLocale: sinon.stub()
                    }
                }
            },
            getters: {
                uiStyle: sinon.stub(),
                mobile: () => false
            }
        });
        store.commit("Tools/WfsSearch/setActive", true);
    });
    afterEach(sinon.restore);
    after(() => {
        WfsSearchModule.actions.instanceChanged = instanceChangedOrig;
    });

    it("renders a literal", () => {
        store.commit("Tools/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
            localVue,
            store,
            stubs: ["WfsSearchLiteral"]
        });

        expect(wrapper.findComponent("wfssearchliteral-stub").exists()).to.be.true;
    });
    it("renders multiple literals if configured", () => {
        instances[0].literals.push({}, {});
        store.commit("Tools/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
            localVue,
            store,
            stubs: ["WfsSearchLiteral"]
        });

        expect(wrapper.findAll("wfssearchliteral-stub").length).to.equal(3);
    });
    it("renders a select field to select the searchInstance if configured", () => {
        instances.push({
            title: "Test WfsSearch II",
            literals: [{}]
        });
        store.commit("Tools/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
            localVue,
            store,
            stubs: ["WfsSearchLiteral"]
        });

        expect(wrapper.find("#tool-wfsSearch-instances-select-label").exists()).to.be.true;
        expect(wrapper.find("#tool-wfsSearch-instances-select").exists()).to.be.true;
    });
    it("renders a container with userHelp if configured", () => {
        store.commit("Tools/WfsSearch/setUserHelp", "test");
        store.commit("Tools/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
            localVue,
            store,
            stubs: ["WfsSearchLiteral"]
        });

        expect(wrapper.find("#tool-wfsSearch-userHelp").exists()).to.be.true;
        expect(wrapper.find("#tool-wfsSearch-userHelp-icon").exists()).to.be.true;
        expect(wrapper.find("#tool-wfsSearch-userHelp-text").exists()).to.be.true;
    });
    it("renders a button to reset the UI", () => {
        store.commit("Tools/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
                localVue,
                store,
                stubs: ["WfsSearchLiteral"]
            }),
            resetButton = wrapper.find("#tool-wfsSearch-button-resetUI");

        expect(resetButton.exists()).to.be.true;
        expect(resetButton.text()).to.equal("common:modules.tools.wfsSearch.resetButton");
    });
    it("renders an input element of type submit to search", () => {
        store.commit("Tools/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
                localVue,
                store,
                stubs: ["WfsSearchLiteral"]
            }),
            searchInput = wrapper.find("#tool-wfsSearch-button-search");

        expect(searchInput.exists()).to.be.true;
        expect(searchInput.element.value).to.equal("common:modules.tools.wfsSearch.searchButton");
        expect(searchInput.element.type).to.equal("submit");
    });
    it("renders a clickable button to show the search results if the user searched and results were found", () => {
        store.commit("Tools/WfsSearch/setSearched", true);
        store.commit("Tools/WfsSearch/setResults", [{}]);
        store.commit("Tools/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
                localVue,
                store,
                stubs: ["WfsSearchLiteral"]
            }),
            searchButton = wrapper.find("#tool-wfsSearch-button-showResults");

        expect(searchButton.exists()).to.be.true;
        expect(searchButton.text()).to.equal("common:modules.tools.wfsSearch.showResults (1)");
        expect(searchButton.element.disabled).to.be.false;
    });
    it("renders a disabled button if the user searched and no results were found", () => {
        store.commit("Tools/WfsSearch/setSearched", true);
        store.commit("Tools/WfsSearch/setResults", []);
        store.commit("Tools/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
                localVue,
                store,
                stubs: ["WfsSearchLiteral"]
            }),
            searchButton = wrapper.find("#tool-wfsSearch-button-showResults");

        expect(searchButton.exists()).to.be.true;
        expect(searchButton.text()).to.equal("common:modules.tools.wfsSearch.showResults (0)");
        expect(searchButton.element.disabled).to.be.true;
    });
    it("renders no button if the user searched but the parameter 'resultList' was not configured", () => {
        store.commit("Tools/WfsSearch/setSearched", true);
        store.commit("Tools/WfsSearch/setResults", [{}]);
        delete instances[0].resultList;
        store.commit("Tools/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
                localVue,
                store,
                stubs: ["WfsSearchLiteral"]
            }),
            searchButton = wrapper.find("#tool-wfsSearch-button-showResults");

        expect(searchButton.exists()).to.be.false;
    });
    it("renders a pagination when more results than are to be shown are available", () => {
        store.commit("Tools/WfsSearch/setSearched", true);
        store.commit("Tools/WfsSearch/setResultsPerPage", 2);
        store.commit("Tools/WfsSearch/setShowResultList", true);
        store.commit("Tools/WfsSearch/setResults", [
            arbitraryFeature, arbitraryFeature, arbitraryFeature,
            arbitraryFeature, arbitraryFeature
        ]);
        store.commit("Tools/WfsSearch/setInstances", instances);

        const wrapper = mount(WfsSearch, {
                localVue,
                store,
                stubs: ["WfsSearchLiteral"]
            }),
            pagination = wrapper.find("ul.pagination");

        expect(pagination.exists()).to.be.true;
        expect(pagination.findAll("li").length).to.equal(3);
    });
    it("doesn't render a pagination when 0 is chosen for 'resultsPerPage'", () => {
        store.commit("Tools/WfsSearch/setSearched", true);
        store.commit("Tools/WfsSearch/setResultsPerPage", 0);
        store.commit("Tools/WfsSearch/setShowResultList", true);
        store.commit("Tools/WfsSearch/setResults", [
            arbitraryFeature, arbitraryFeature, arbitraryFeature,
            arbitraryFeature, arbitraryFeature
        ]);
        store.commit("Tools/WfsSearch/setInstances", instances);

        const wrapper = mount(WfsSearch, {
                localVue,
                store,
                stubs: ["WfsSearchLiteral"]
            }),
            pagination = wrapper.find("ul.pagination");

        expect(pagination.exists()).to.be.false;
    });
    it("doesn't render a pagination when resultsPerPage is larger than result list length", () => {
        store.commit("Tools/WfsSearch/setSearched", true);
        store.commit("Tools/WfsSearch/setResultsPerPage", 9001);
        store.commit("Tools/WfsSearch/setShowResultList", true);
        store.commit("Tools/WfsSearch/setResults", [
            arbitraryFeature, arbitraryFeature, arbitraryFeature,
            arbitraryFeature, arbitraryFeature
        ]);
        store.commit("Tools/WfsSearch/setInstances", instances);

        const wrapper = mount(WfsSearch, {
                localVue,
                store,
                stubs: ["WfsSearchLiteral"]
            }),
            pagination = wrapper.find("ul.pagination");

        expect(pagination.exists()).to.be.false;
    });

    describe("markerAndZoom", () => {
        let pointFeatures,
            polygonFeatures;

        beforeEach(() => {
            pointFeatures = [
                {
                    getGeometry: () => {
                        return {
                            getCoordinates: () => [568366.068, 5941065.428]
                        };
                    }
                }
            ];
            polygonFeatures = [
                {
                    getGeometry: () => {
                        return {
                            getCoordinates: () => [
                                [456881.4, 5341325.7, 0],
                                [456905.5, 5341311.3, 0],
                                [456931.2, 5341295.9, 0],
                                [456932.3, 5341295.6, 0],
                                [456936.2, 5341294.5, 0],
                                [456940, 5341301.7, 0],
                                [456943.2, 5341308, 0],
                                [456946.6, 5341314.5, 0],
                                [456949.4, 5341319.9, 0],
                                [456929.5, 5341329.8, 0],
                                [456914, 5341337.5, 0],
                                [456893, 5341347.9, 0],
                                [456882.2, 5341327.1, 0],
                                [456881.4, 5341325.7, 0]
                            ],
                            getExtent: () => [456881.4, 5341294.5, 456949.4, 5341347.9]
                        };
                    }
                }
            ];
        });
        it("should start action placingPointMarker, if the feature has a point geometry", () => {
            const wrapper = mount(WfsSearch, {
                localVue,
                store,
                stubs: ["WfsSearchLiteral"]
            });

            wrapper.vm.markerAndZoom(pointFeatures);

            expect(placingPointMarkerSpy.calledOnce).to.be.true;
            expect(setCenterSpy.calledOnce).to.be.true;
            expect(setZoomLevelSpy.calledOnce).to.be.true;

            expect(placingPointMarkerSpy.firstCall.args[1]).to.deep.equals([568366.068, 5941065.428]);
            expect(setCenterSpy.firstCall.args[1]).to.deep.equals([568366.068, 5941065.428]);
            expect(setZoomLevelSpy.firstCall.args[1]).to.equals(5);
        });

        it("should start action placingPolygonMarker, if the feature has a polygon geometry", () => {
            const wrapper = mount(WfsSearch, {
                localVue,
                store,
                stubs: ["WfsSearchLiteral"]
            });

            wrapper.vm.markerAndZoom(polygonFeatures);

            expect(placingPolygonMarkerSpy.calledOnce).to.be.true;
            expect(zoomToExtentSpy.calledOnce).to.be.true;

            expect(placingPolygonMarkerSpy.firstCall.args[1]).to.deep.equals(polygonFeatures[0]);
            expect(zoomToExtentSpy.firstCall.args[1]).to.deep.equals({
                extent: [456881.4, 5341294.5, 456949.4, 5341347.9]
            });
        });
    });
});
