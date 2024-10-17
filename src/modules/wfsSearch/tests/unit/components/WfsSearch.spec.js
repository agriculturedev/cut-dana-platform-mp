import {createStore} from "vuex";
import {config, mount, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";
import requestProvider from "../../../js/requests";

import WfsSearchLiteral from "../../../components/WfsSearchLiteral.vue";
import WfsSearch from "../../../components/WfsSearch.vue";
import WfsSearchModule from "../../../store/indexWfsSearch";

config.global.mocks.$t = key => key;

describe("src/modules/wfsSearch/components/WfsSearch.vue", () => {
    let instances,
        store,
        layer,
        placingPointMarkerSpy,
        placingPolygonMarkerSpy,
        removePolygonMarkerSpy,
        resetResultSpy,
        setCenterSpy,
        setZoomSpy,
        zoomToExtentSpy,
        resetResultOrig;

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
        setZoomSpy = sinon.spy();
        zoomToExtentSpy = sinon.spy();
        removePolygonMarkerSpy = sinon.spy();
        resetResultSpy = sinon.spy();

        instances = [{
            title: "Test WfsSearch",
            requestConfig: {
                layerId: "753"
            },
            resultList: {
                Ort: "Ort",
                Name: "Name"
            },
            literals: [{field: {
                id: "fieldId",
                queryType: "like",
                inputLabel: "Name",
                fieldName: "Name"
            }}]
        }];
        layer = {
            id: "753"
        };
        resetResultOrig = WfsSearchModule.actions.resetResult;
        WfsSearchModule.actions.resetResult = resetResultSpy;
        store = createStore({
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        WfsSearch: WfsSearchModule,
                        Language: {
                            namespaced: true,
                            getters: {
                                currentLocale: sinon.stub()
                            }
                        }
                    }
                },
                Maps: {
                    namespaced: true,
                    actions: {
                        removePointMarker: sinon.stub(),
                        placingPointMarker: placingPointMarkerSpy,
                        placingPolygonMarker: placingPolygonMarkerSpy,
                        removePolygonMarker: removePolygonMarkerSpy,
                        setCenter: setCenterSpy,
                        setZoom: setZoomSpy,
                        zoomToExtent: zoomToExtentSpy
                    }
                },
                Alerting: {
                    namespaced: true,
                    actions: {
                        addSingleAlert: sinon.stub()
                    }
                }
            },
            getters: {
                uiStyle: sinon.stub(),
                layerConfigById: () => () => layer
            }
        });
    });

    afterEach(() => {
        sinon.restore();
        WfsSearchModule.actions.resetResult = resetResultOrig;
    });

    it("renders a literal", async () => {
        store.commit("Modules/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.findComponent(WfsSearchLiteral).exists()).to.be.true;
    });
    it("renders multiple literals if configured", () => {
        instances[0].literals.push({field: {
            id: "fieldId2",
            queryType: "like",
            inputLabel: "Name2",
            fieldName: "Name2"
        }}, {field: {
            id: "fieldId3",
            queryType: "like",
            inputLabel: "Name3",
            fieldName: "Name3"
        }});
        store.commit("Modules/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.findAllComponents(WfsSearchLiteral).length).to.equal(3);
    });
    it("renders a select field to select the searchInstance if configured", () => {
        instances.push({
            title: "Test WfsSearch II",
            literals: [{}]
        });
        store.commit("Modules/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#module-wfsSearch-instances-select-label").exists()).to.be.true;
        expect(wrapper.find("#module-wfsSearch-instances-select").exists()).to.be.true;
    });
    it("renders a container with userHelp if configured", () => {
        store.commit("Modules/WfsSearch/setUserHelp", "test");
        store.commit("Modules/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#module-wfsSearch-userHelp").exists()).to.be.true;
        expect(wrapper.find("#module-wfsSearch-userHelp-icon").exists()).to.be.true;
        expect(wrapper.find("#module-wfsSearch-userHelp-text").exists()).to.be.true;
    });
    it("renders a button to reset the UI", () => {
        store.commit("Modules/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
                global: {
                    plugins: [store]
                }
            }),
            resetButton = wrapper.find("#module-wfsSearch-button-resetUI");

        expect(resetButton.exists()).to.be.true;
        expect(resetButton.text()).to.equal("common:modules.wfsSearch.resetButton");
    });
    it("resets the UI, if the button is clicked", async () => {
        store.commit("Modules/WfsSearch/setInstances", instances);

        const wrapper = shallowMount(WfsSearch, {
                global: {
                    plugins: [store]
                }
            }),
            resetButton = wrapper.find("#module-wfsSearch-button-resetUI");

        expect(resetButton.exists()).to.be.true;

        wrapper.vm.resetUI();
        // called twice from actions.prepareModule and once from resetUI
        expect(removePolygonMarkerSpy.calledThrice).to.be.true;
        expect(resetResultSpy.calledThrice).to.be.true;
    });
    it("does not render a button to reset the UI if prop showResetButton is set to false", () => {
        store.commit("Modules/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
                global: {
                    plugins: [store]
                },
                props: {
                    showResetButton: false
                }
            }),
            resetButton = wrapper.find("#module-wfsSearch-button-resetUI");

        expect(resetButton.exists()).to.be.false;
    });
    it("renders an input element of type submit to search", () => {
        store.commit("Modules/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
                global: {
                    plugins: [store]
                }
            }),
            searchInput = wrapper.find("#module-wfsSearch-button-search");

        expect(searchInput.exists()).to.be.true;
        expect(searchInput.element.type).to.equal("submit");
    });
    it("sets zoom according to prop if set", async () => {
        const features = [
                {
                    getGeometry () {
                        return {
                            getCoordinates () {
                                return undefined;
                            }
                        };
                    },
                    values_: {
                        Ort: "Hamburg"
                    }
                }
            ],
            wrapper = mount(WfsSearch, {
                props: {
                    zoomLevelProp: 1
                },
                global: {
                    plugins: [store]
                }
            }),
            setZoomStub = sinon.stub(wrapper.vm, "setZoom");

        sinon.stub(requestProvider, "searchFeatures").returns(features);
        sinon.stub(wrapper.vm, "setCenter");

        wrapper.vm.setZoomLevel(99);

        wrapper.vm.search().then(() => {
            expect(setZoomStub.calledWith(1)).to.be.true;
        });
    });
    it("renders a table to show the search results if the user searched and results were found", async () => {
        store.commit("Modules/WfsSearch/setInstances", instances);
        const wrapper = mount(WfsSearch, {
            global: {
                plugins: [store]
            }
        });
        let resTable = null;

        store.commit("Modules/WfsSearch/setSearched", true);
        store.commit("Modules/WfsSearch/setShowResultList", true);
        store.commit("Modules/WfsSearch/setResults", [{values_: {Ort: "Hamburg", Name: "Klaras Kita"}}]);
        await wrapper.vm.$nextTick();
        resTable = wrapper.find("#resultTable");
        expect(resTable.exists()).to.be.true;
    });

    it("sets zoom according to config/store if no such prop set", async () => {
        const features = [
                {
                    getGeometry () {
                        return {
                            getCoordinates () {
                                return undefined;
                            }
                        };
                    },
                    values_: {
                        Ort: "Hamburg"
                    }
                }
            ],
            wrapper = mount(WfsSearch, {
                props: {
                    zoomLevelProp: undefined
                },
                global: {
                    plugins: [store]
                }
            }),
            setZoomStub = sinon.stub(wrapper.vm, "setZoom");

        sinon.stub(requestProvider, "searchFeatures").returns(features);
        sinon.stub(wrapper.vm, "setCenter");

        wrapper.vm.setZoomLevel(99);

        wrapper.vm.search().then(() => {
            expect(setZoomStub.calledWith(99)).to.be.true;
        });
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

        it("should start action placingPointMarker, if the feature has a point geometry", async () => {
            const wrapper = mount(WfsSearch, {
                global: {
                    plugins: [store]
                }
            });

            await wrapper.vm.markerAndZoom(pointFeatures);
            expect(placingPointMarkerSpy.calledOnce).to.be.true;
            expect(setCenterSpy.calledOnce).to.be.true;
            expect(setZoomSpy.calledOnce).to.be.true;
            expect(placingPointMarkerSpy.firstCall.args[1]).to.deep.equals([568366.068, 5941065.428]);
            expect(setCenterSpy.firstCall.args[1]).to.deep.equals([568366.068, 5941065.428]);
            expect(setZoomSpy.firstCall.args[1]).to.equals(99);
        });

        it("should start action placingPolygonMarker, if the feature has a polygon geometry", async () => {
            const wrapper = mount(WfsSearch, {
                global: {
                    plugins: [store]
                }
            });

            await wrapper.vm.markerAndZoom(polygonFeatures);
            expect(placingPolygonMarkerSpy.calledOnce).to.be.true;
            expect(zoomToExtentSpy.calledOnce).to.be.true;
            expect(placingPolygonMarkerSpy.firstCall.args[1]).to.deep.equals(polygonFeatures[0]);
            expect(zoomToExtentSpy.firstCall.args[1]).to.deep.equals({
                extent: [456881.4, 5341294.5, 456949.4, 5341347.9]
            });
        });
    });
});
