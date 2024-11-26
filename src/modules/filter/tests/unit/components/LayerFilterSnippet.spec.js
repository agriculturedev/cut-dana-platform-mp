import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import LayerFilterSnippet from "../../../components/LayerFilterSnippet.vue";
import SnippetDownload from "../../../components/SnippetDownload.vue";
import SnippetCheckboxFilterInMapExtent from "../../../components/SnippetCheckboxFilterInMapExtent.vue";
import {expect} from "chai";
import MapHandler from "../../../utils/mapHandler.js";
import openlayerFunctions from "../../../utils/openlayerFunctions.js";
import sinon from "sinon";


config.global.mocks.$t = key => key;

describe("src/modules/filter/components/LayerFilterSnippet.vue", () => {
    let wrapper = null,
        store,
        mapHandler = null;

    beforeEach(() => {
        mapHandler = new MapHandler();
        mapHandler.getLayerModelByFilterId = sinon.stub().returns({
            get: (val) => {
                if (val === "isSelected") {
                    return false;
                }
                return "TEST";
            }
        });
        mapHandler.activateLayer = sinon.stub();

        store = createStore({
            namespaced: true,
            modules: {
                Maps: {
                    namespaced: true,
                    getters: {
                        scale: sinon.stub()
                    }
                }
            }
        });
        wrapper = shallowMount(LayerFilterSnippet, {
            global: {
                plugins: [store]
            },
            propsData: {
                layerConfig: {
                    service: {
                        type: "something external"
                    }
                },
                mapHandler,
                layerSelectorVisible: false
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("hasThisSnippetTheExpectedType", () => {
        it("should return false if the given snippet has not the expected type", () => {
            expect(wrapper.vm.hasThisSnippetTheExpectedType(undefined)).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType(null)).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType(1234)).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType("string")).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType(true)).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType(false)).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType([])).to.be.false;
            expect(wrapper.vm.hasThisSnippetTheExpectedType({})).to.be.false;

            expect(wrapper.vm.hasThisSnippetTheExpectedType({type: "anything"}, "something")).to.be.false;
        });
        it("should return true if the given snippet has the expected type", () => {
            expect(wrapper.vm.hasThisSnippetTheExpectedType({type: "something"}, "something")).to.be.true;
        });
    });

    describe("setSearchInMapExtent", () => {
        it("should set the internal searchInMapExtent variable to the given value", () => {
            expect(wrapper.vm.searchInMapExtent).to.be.false;
            wrapper.vm.setSearchInMapExtent(true);
            expect(wrapper.vm.searchInMapExtent).to.be.true;
        });
    });

    describe("renderCheckboxSearchInMapExtent", () => {
        it("Should render the checkbox component correctly", async () => {
            wrapper = shallowMount(LayerFilterSnippet, {
                global: {
                    plugins: [store]
                },
                propsData: {
                    layerConfig: {
                        service: {
                            type: "something external"
                        },
                        filterId: 1,
                        searchInMapExtent: true
                    },
                    mapHandler,
                    layerSelectorVisible: false
                }
            });
            wrapper.setData({outOfZoom: false});
            await wrapper.vm.$nextTick();
            await wrapper.vm.$nextTick();

            expect(wrapper.findComponent(SnippetCheckboxFilterInMapExtent).exists()).to.be.true;
        });
    });

    it("should call handleActiveStrategy if strategy is active", async () => {
        const spyHandleActiveStrategy = sinon.spy(wrapper.vm, "handleActiveStrategy");

        await wrapper.setProps({layerConfig: {strategy: "active"}});
        wrapper.vm.changeRule({
            snippetId: 0,
            startup: false,
            fixed: false,
            attrName: "test",
            operator: "EQ"
        });
        await wrapper.vm.$nextTick();
        expect(spyHandleActiveStrategy.calledOnce).to.be.true;
    });

    describe("changeRule", () => {
        it("should emit the updateRules event", async () => {
            wrapper.vm.changeRule({
                snippetId: 0,
                startup: false,
                fixed: false,
                attrName: "test",
                operator: "EQ"
            });
            await wrapper.vm.$nextTick();
            expect(wrapper.emitted().updateRules).to.be.an("array").with.lengthOf(1);
        });
    });

    describe("deleteRule", () => {
        it("should emit the update function", async () => {
            wrapper.vm.deleteRule(0);
            await wrapper.vm.$nextTick();
            expect(wrapper.emitted().updateRules).to.be.an("array").with.lengthOf(1);
        });
    });

    describe("deleteRulesOfParallelSnippets", () => {
        it("should not emit the update function", async () => {
            wrapper.vm.deleteRulesOfParallelSnippets(0);
            await wrapper.vm.$nextTick();
            expect(wrapper.emitted().updateRules).to.be.undefined;

            wrapper.vm.deleteRulesOfParallelSnippets({});
            await wrapper.vm.$nextTick();
            expect(wrapper.emitted().updateRules).to.be.undefined;

            wrapper.vm.deleteRulesOfParallelSnippets({parent: ""});
            await wrapper.vm.$nextTick();
            expect(wrapper.emitted().updateRules).to.be.undefined;

            wrapper.vm.deleteRulesOfParallelSnippets({parent: {children: ""}});
            await wrapper.vm.$nextTick();
            expect(wrapper.emitted().updateRules).to.be.undefined;
        });
        it("should emit the update function", async () => {
            const snippet = {
                snippetId: 0,
                adjustOnlyFromParent: true,
                parent: {
                    children: [
                        {snippetId: 0},
                        {snippetId: 1}
                    ]
                }
            };

            wrapper.vm.deleteRulesOfParallelSnippets(snippet);
            await wrapper.vm.$nextTick();
            expect(wrapper.emitted().updateRules).to.be.an("array").with.lengthOf(1);
        });
    });

    describe("isOnlyAdjustFromParent", () => {
        it("should return false", async () => {
            wrapper.vm.snippets = [null];
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.isOnlyAdjustFromParent(0)).to.be.false;

            wrapper.vm.snippets = [""];
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.isOnlyAdjustFromParent(0)).to.be.false;

            wrapper.vm.snippets = [0];
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.isOnlyAdjustFromParent(0)).to.be.false;

            wrapper.vm.snippets = [true];
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.isOnlyAdjustFromParent(0)).to.be.false;

            wrapper.vm.snippets = [[]];
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.isOnlyAdjustFromParent(0)).to.be.false;

            wrapper.vm.snippets = [{}];
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.isOnlyAdjustFromParent(0)).to.be.false;
        });
        it("should return true", async () => {
            const snippets = [
                {
                    snippetId: 0,
                    adjustOnlyFromParent: true
                }
            ];

            wrapper.vm.snippets = snippets;
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.isOnlyAdjustFromParent(0)).to.be.true;
        });
    });

    describe("getTitle", () => {
        it("should return true if title is true", () => {
            expect(wrapper.vm.getTitle(true), 1).to.be.true;
        });
        it("should return the title if title is set", () => {
            expect(wrapper.vm.getTitle({title: "title"}, 1)).to.be.equal("title");
        });
        it("should return true if title is not set", () => {
            sinon.stub(openlayerFunctions, "getLayerByLayerId").returns({
                "id": "filterId",
                "type": "layer",
                "showInLayerTree": false,
                "visibility": true
            });
            expect(wrapper.vm.getTitle({}, 1)).to.be.true;
        });
        it("should return the title if attribute is set in gfiAttributes", () => {
            sinon.stub(openlayerFunctions, "getLayerByLayerId").returns({
                "id": "filterId",
                "type": "layer",
                "showInLayerTree": false,
                "visibility": true,
                "gfiAttributes": {
                    "attr": "Attribute Title"
                }
            });
            expect(wrapper.vm.getTitle({attrName: "attr"}, 1)).to.be.equal("Attribute Title");
        });
        it("should return the title if attribute is set in gfiAttributes as object", () => {
            sinon.stub(openlayerFunctions, "getLayerByLayerId").returns({
                "id": "filterId",
                "type": "layer",
                "showInLayerTree": false,
                "visibility": true,
                "gfiAttributes": {
                    "attr": {
                        "name": "Attribute Title"
                    }
                }
            });
            expect(wrapper.vm.getTitle({attrName: "attr"}, 1)).to.be.equal("Attribute Title");
        });
    });

    describe("getTagTitle", () => {
        it("should return value if there is no tagTitle defined", () => {
            expect(wrapper.vm.getTagTitle({value: "title"})).to.equal("title");
            expect(wrapper.vm.getTagTitle({value: false})).to.equal("false");
            expect(wrapper.vm.getTagTitle({value: 0})).to.equal("0");
            expect(wrapper.vm.getTagTitle({value: undefined})).to.equal("undefined");
            expect(wrapper.vm.getTagTitle({value: null})).to.equal("null");
        });
        it("should return tagTitle if there is tagTitle defined", () => {
            expect(wrapper.vm.getTagTitle({value: "title", tagTitle: "tagTitle"})).to.equal("tagTitle");
            expect(wrapper.vm.getTagTitle({value: "title", tagTitle: false})).to.equal("false");
            expect(wrapper.vm.getTagTitle({value: "title", tagTitle: 0})).to.equal("0");
            expect(wrapper.vm.getTagTitle({value: "title", tagTitle: null})).to.equal("null");
        });
    });

    describe("paging", () => {
        it("should show stop button if paging  was set", async () => {
            await wrapper.setData({
                paging: {
                    page: 1,
                    total: 46
                },
                showStop: true
            });

            expect(wrapper.find(".btn-secondary").exists()).to.be.true;
        });
    });

    describe("SnippetDownload", () => {
        it("should render SnippetDownload component if download is true and filteredItems are given", async () => {
            await wrapper.setProps({
                layerConfig: {
                    layerId: "layerId",
                    download: true
                }
            });
            await wrapper.setData({
                filteredItems: [
                    {
                        a: "a",
                        b: "b"
                    }
                ]
            });
            await wrapper.vm.$nextTick();
            expect(wrapper.findComponent(SnippetDownload).exists()).to.be.true;
        });
    });

    describe("labelFilterButton", () => {
        it("should render correct name for label filter button", async () => {
            await wrapper.setData({
                layerConfig: {
                    labelFilterButton: "common:modules.filter.filterButton"
                }
            });
            await wrapper.vm.$nextTick();
            expect(wrapper.find("button").text()).to.equal("common:modules.filter.filterButton");
        });
    });
    it("should render SnippetTags if rules are given", async () => {
        const rules = [
            {
                snippetId: 1,
                startup: false,
                fixed: false,
                attrName: "test",
                operator: "EQ"
            },
            {
                snippetId: 2,
                startup: false,
                fixed: false,
                attrName: "testing",
                operator: "EQ"
            }
        ];

        await wrapper.setProps({
            filterRules: rules
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.find(".snippetTagsWrapper").exists()).to.be.true;
        expect(wrapper.findAll(".snippetTagsWrapper")).to.have.lengthOf(3);
    });
    it("should render amount of filtered items", async () => {
        await wrapper.setData({
            amountOfFilteredItems: 3
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.find(".filter-result").exists()).to.be.true;
        expect(wrapper.find(".filter-result").text()).contain("common:modules.filter.filterResult.unit");

        it("should not render amount of filtered items if showHits is false", async () => {
            await wrapper.setData({
                amountOfFilteredItems: 3,
                layerConfig: {
                    showHits: false
                }
            });
            await wrapper.vm.$nextTick();
            expect(wrapper.find(".filter-result").exists()).to.be.false;
        });
        it("should render a spinner", async () => {
            await wrapper.setData({
                isLoading: true,
                layerConfig: {
                    filterId: 1
                }
            });
            expect(wrapper.find(".spinner-border").exists()).to.be.true;
        });
        it("should call 'activateLayer' if filter layer type is VectorTile and the layer is not yet loaded", () => {
            mapHandler.getLayerModelByFilterId = sinon.stub().returns({
                get: (val) => {
                    if (val === "isSelected") {
                        return false;
                    }
                    return "VectorTile";
                }
            });
            mapHandler.activateLayer = sinon.stub();
            wrapper = shallowMount(LayerFilterSnippet, {
                propsData: {
                    layerConfig: {
                        service: {
                            type: "something external"
                        },
                        searchInMapExtent: true
                    },
                    mapHandler,
                    layerSelectorVisible: false
                }
            });
            expect(mapHandler.activateLayer.calledOnce).to.be.true;
        });
        it("should render amount of filtered items if showHits is true", async () => {
            await wrapper.setData({
                amountOfFilteredItems: 3,
                layerConfig: {
                    showHits: true
                }
            });
            await wrapper.vm.$nextTick();
            expect(wrapper.find(".filter-result").exists()).to.be.true;
            expect(wrapper.find(".filter-result").text()).contain("common:modules.filter.filterResult.unit", "3");
        });
        it("should render amount of filtered items if showHits is undefined", async () => {
            await wrapper.setData({
                amountOfFilteredItems: 3,
                layerConfig: {
                    showHits: undefined
                }
            });
            await wrapper.vm.$nextTick();
            expect(wrapper.find(".filter-result").exists()).to.be.true;
            expect(wrapper.find(".filter-result").text()).contain("common:modules.filter.filterResult.unit", "3");
        });
        describe("setSnippetValueByState", async () => {
            await wrapper.setData({
                snippets
            });
            const filterRules = [
                    {
                        snippetId: 0,
                        startup: false,
                        fixed: false,
                        attrName: "test",
                        operator: "EQ",
                        value: ["Altona"]
                    }
                ],
                snippets = [
                    {
                        operator: "EQ",
                        snippetId: 0,
                        title: "Bezirk",
                        type: "dropdown",
                        value: ["Altona"]
                    }],
                precheckedSnippets = [{
                    operator: "EQ",
                    snippetId: 0,
                    title: "Bezirk",
                    type: "dropdown",
                    value: ["Altona"],
                    prechecked: ["Altona"]
                }];

            it("should not set prechecked value if param is not an array", () => {
                wrapper.vm.setSnippetValueByState(undefined);
                wrapper.vm.setSnippetValueByState(null);
                wrapper.vm.setSnippetValueByState(123456);
                wrapper.vm.setSnippetValueByState("string");
                wrapper.vm.setSnippetValueByState(true);
                wrapper.vm.setSnippetValueByState({});
                expect(wrapper.vm.snippets).to.deep.equal(snippets);
            });
            it("should not set prechecked value if given structure is not a rule", () => {
                const isRuleStub = sinon.stub(LayerFilterSnippet, "isRule").returns(false),
                    noRule = [
                        {
                            something: "something"
                        }
                    ];

                wrapper.vm.setSnippetValueByState(noRule);
                expect(wrapper.vm.snippets).to.deep.equal(snippets);
                expect(isRuleStub.called).to.be.true;
                sinon.restore();
            });
            it("should set prechecked value if correct filter rule is given", () => {
                wrapper.vm.setSnippetValueByState(filterRules);
                expect(wrapper.vm.snippets).to.deep.equal(precheckedSnippets);
            });
        });
    });

    describe("setSnippetValueByState", async () => {
        await wrapper.setData({
            snippets
        });
        const filterRules = [
                {
                    snippetId: 0,
                    startup: false,
                    fixed: false,
                    attrName: "test",
                    operator: "EQ",
                    value: ["Altona"]
                }
            ],
            snippets = [
                {
                    operator: "EQ",
                    snippetId: 0,
                    title: "Bezirk",
                    type: "dropdown",
                    value: ["Altona"]
                }],
            precheckedSnippets = [{
                operator: "EQ",
                snippetId: 0,
                title: "Bezirk",
                type: "dropdown",
                value: ["Altona"],
                prechecked: ["Altona"]
            }];

        it("should not set prechecked value if param is not an array", () => {
            wrapper.vm.setSnippetValueByState(undefined);
            wrapper.vm.setSnippetValueByState(null);
            wrapper.vm.setSnippetValueByState(123456);
            wrapper.vm.setSnippetValueByState("string");
            wrapper.vm.setSnippetValueByState(true);
            wrapper.vm.setSnippetValueByState({});
            expect(wrapper.vm.snippets).to.deep.equal(snippets);
        });
        it("should not set prechecked value if given structure is not a rule", () => {
            const isRuleStub = sinon.stub(LayerFilterSnippet, "isRule").returns(false),
                noRule = [
                    {
                        something: "something"
                    }
                ];

            wrapper.vm.setSnippetValueByState(noRule);
            expect(wrapper.vm.snippets).to.deep.equal(snippets);
            expect(isRuleStub.called).to.be.true;
            sinon.restore();
        });
        it("should set prechecked value if correct filter rule is given", () => {
            wrapper.vm.setSnippetValueByState(filterRules);
            expect(wrapper.vm.snippets).to.deep.equal(precheckedSnippets);
        });
    });

    describe("registerMapMoveListener", () => {
        it("should not call the function registerMapMoveListener", () => {
            expect(wrapper.emitted()).to.not.have.property("registerMapMoveListener");
        });

        it("should trigger registerMapMoveListener event if filterOnMove is configured", async () => {
            wrapper = shallowMount(LayerFilterSnippet, {
                global: {
                    plugins: [store]
                },
                propsData: {
                    layerConfig: {
                        service: {
                            type: "something external"
                        },
                        strategy: "active",
                        filterOnMove: true
                    },
                    mapHandler,
                    openMultipleAccordeons: false,
                    layerSelectorVisible: false
                }
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.emitted()).to.have.property("registerMapMoveListener");
        });
    });

    describe("checkZoomLevel", () => {
        it("should not call the function checkZoomLevel", async () => {
            const checkZoomLevel = sinon.stub(wrapper.vm, "checkZoomLevel");

            LayerFilterSnippet.methods.checkZoomLevel = checkZoomLevel;
            wrapper = shallowMount(LayerFilterSnippet, {
                propsData: {
                    global: {
                        plugins: [store]
                    },
                    layerConfig: {
                        service: {
                            type: "something external"
                        }
                    },
                    mapHandler,
                    layerSelectorVisible: false
                }
            });
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.checkZoomLevel).to.be.a("function");
            expect(checkZoomLevel.notCalled).to.be.true;
        });
        it("should call the function checkZoomLevel", async () => {
            const checkZoomLevel = sinon.stub(wrapper.vm, "checkZoomLevel");

            LayerFilterSnippet.methods.checkZoomLevel = checkZoomLevel;
            wrapper = shallowMount(LayerFilterSnippet, {
                global: {
                    plugins: [store]
                },
                propsData: {
                    layerConfig: {
                        service: {
                            type: "something external"
                        },
                        "minZoom": 15,
                        "maxZoom": 18
                    },
                    mapHandler,
                    layerSelectorVisible: false
                }
            });
            await wrapper.vm.$nextTick();
            expect(checkZoomLevel.called).to.be.true;
        });
    });

    describe("checkOutOfZoomLevel", () => {
        it("should set the variable outOfZoom false", () => {
            expect(wrapper.vm.checkOutOfZoomLevel(undefined, undefined, undefined)).to.be.false;
            expect(wrapper.vm.checkOutOfZoomLevel(undefined, undefined, 17)).to.be.false;
            expect(wrapper.vm.checkOutOfZoomLevel(undefined, 18, 17)).to.be.false;
            expect(wrapper.vm.checkOutOfZoomLevel(10, undefined, 17)).to.be.false;
            expect(wrapper.vm.checkOutOfZoomLevel(10, 18, 17)).to.be.false;
        });
        it("should set the variable outOfZoom true", () => {
            expect(wrapper.vm.checkOutOfZoomLevel(10, 16, 17)).to.be.true;
            expect(wrapper.vm.checkOutOfZoomLevel(10, 18, 7)).to.be.true;
            expect(wrapper.vm.checkOutOfZoomLevel(10, undefined, 7)).to.be.true;
            expect(wrapper.vm.checkOutOfZoomLevel(undefined, 16, 17)).to.be.true;
        });
    });

    describe("deleteAllRules", () => {
        it("should emit the deleteAllRules function", async () => {
            wrapper.vm.deleteAllRules();
            await wrapper.vm.$nextTick();
            expect(wrapper.emitted().deleteAllRules).to.be.an("array").with.lengthOf(1);
        });
        it("should call handleActiveStrategy if strategy is active", async () => {
            const spyHandleActiveStrategy = sinon.spy(wrapper.vm, "handleActiveStrategy");

            await wrapper.setProps({layerConfig: {strategy: "active"}});
            wrapper.vm.deleteAllRules();
            await wrapper.vm.$nextTick();
            expect(spyHandleActiveStrategy.calledOnce).to.be.true;
        });
    });

    describe("hasChildSnippets", () => {
        it("should return false if anything but an array is given", () => {
            expect(wrapper.vm.hasChildSnippets(undefined)).to.be.false;
            expect(wrapper.vm.hasChildSnippets(null)).to.be.false;
            expect(wrapper.vm.hasChildSnippets({})).to.be.false;
            expect(wrapper.vm.hasChildSnippets(true)).to.be.false;
            expect(wrapper.vm.hasChildSnippets(false)).to.be.false;
            expect(wrapper.vm.hasChildSnippets(1234)).to.be.false;
            expect(wrapper.vm.hasChildSnippets("1234")).to.be.false;
        });
        it("should return false if the given array has no snippets at all", () => {
            expect(wrapper.vm.hasChildSnippets([])).to.be.false;
            expect(wrapper.vm.hasChildSnippets(["foo", "bar"])).to.be.false;
        });
        it("should return true if the given array has child snippets", () => {
            expect(wrapper.vm.hasChildSnippets([{children: "foo"}])).to.be.true;
        });
    });
});
