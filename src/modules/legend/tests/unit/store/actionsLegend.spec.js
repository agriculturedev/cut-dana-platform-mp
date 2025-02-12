import {expect} from "chai";
import sinon from "sinon";
import validator from "../../../js/validator";
import layerCollection from "../../../../../core/layers/js/layerCollection";
import layerFactory from "../../../../../core/layers/js/layerFactory";
import legendDraw from "../../../js/legendDraw";
import actions from "../../../store/actionsLegend";

const {
    addLegend,
    sortLegend,
    removeLegend,
    createLegend,
    createLegendForLayerInfo,
    changeLayerVisibility,
    prepareLegend,
    prepareLegendForGroupLayer,
    generateLegendForLayerInfo,
    toggleLayerInLegend,
    generateLegend
} = actions;

describe("src/modules/legend/store/actionsLegend.js", () => {
    let commit,
        dispatch,
        layer1,
        layerAttributes1,
        layerSource1,
        legend1,
        layer2,
        layerAttributes2,
        layersInCollection,
        validatorStub;

    beforeEach(() => {
        layersInCollection = [];
        layerAttributes1 = {
            id: "1132",
            name: "100 Jahre Stadtgruen POIs",
            visibility: true,
            typ: "WMS"
        };
        legend1 = true;
        layerSource1 = {source: true};
        layer1 = {
            get: (key) => {
                return layerAttributes1[key];
            },
            createLegend: () => legend1,
            getLayer: () => {
                return {
                    getId: () => "id",
                    getZIndex: () => 1
                };
            },
            getLayerSource: () => layerSource1,
            stopSubscription: sinon.stub()
        };
        layerAttributes2 = {
            id: "99",
            name: "name",
            visibility: false,
            typ: "WMS"
        };
        layer2 = {
            get: (key) => {
                return layerAttributes2[key];
            },
            createLegend: () => true,
            getLayer: () => {
                return {
                    getZIndex: () => 2
                };
            },
            getLayerSource: () => []
        };
        commit = sinon.spy();
        dispatch = sinon.spy();
        validatorStub = sinon.stub(validator, "isValidLegendObj").returns(true);
        sinon.stub(layerCollection, "getLayers").returns(
            layersInCollection
        );
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("createLegend", () => {

        it("createLegend shall create legend for visible layer", () => {
            layersInCollection.push(layer1);

            createLegend({dispatch});
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.be.equals("toggleLayerInLegend");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({layer: layer1, visibility: layer1.get("visibility")});
        });
    });

    it("addLegend should add legend to legends", () => {
        const payload = {
                id: "123",
                name: "foobar",
                legend: ["getLegendGraphicRequest"],
                position: 1
            },
            state = {
                legends: []
            };

        addLegend({state, commit}, payload);
        expect(commit.calledOnce).to.be.true;
        expect(commit.firstCall.args[0]).to.be.equals("setLegends");
        expect(commit.firstCall.args[1]).to.be.deep.equals([payload]);
    });

    it("sortLegend should sort legends by position descending", () => {
        const state = {
                legends: [{
                    id: "123",
                    name: "foobar",
                    legend: ["getLegendGraphicRequest"],
                    position: 1
                },
                {
                    id: "789",
                    name: "barfoo",
                    legend: ["getLegendGraphicRequest"],
                    position: 3
                },
                {
                    id: "456",
                    name: "foofoo",
                    legend: ["getLegendGraphicRequest"],
                    position: 2
                }]
            },
            sorted = [
                {
                    id: "789",
                    name: "barfoo",
                    legend: ["getLegendGraphicRequest"],
                    position: 3
                },
                {
                    id: "456",
                    name: "foofoo",
                    legend: ["getLegendGraphicRequest"],
                    position: 2
                },
                {
                    id: "123",
                    name: "foobar",
                    legend: ["getLegendGraphicRequest"],
                    position: 1
                }
            ];

        sortLegend({state, commit});
        expect(commit.calledOnce).to.be.true;
        expect(commit.firstCall.args[0]).to.be.equals("setLegends");
        expect(commit.firstCall.args[1]).to.be.deep.equals(sorted);
    });

    it("removeLegend should remove legend by id", () => {
        const state = {
                legends: [{
                    id: "789",
                    name: "barfoo",
                    legend: ["getLegendGraphicRequest"],
                    position: 3
                },
                {
                    id: "456",
                    name: "foofoo",
                    legend: ["getLegendGraphicRequest"],
                    position: 2
                },
                {
                    id: "123",
                    name: "foobar",
                    legend: ["getLegendGraphicRequest"],
                    position: 1
                }]
            },
            payload = "456",
            legendsAfterRemove = [
                {
                    id: "789",
                    name: "barfoo",
                    legend: ["getLegendGraphicRequest"],
                    position: 3
                },
                {
                    id: "123",
                    name: "foobar",
                    legend: ["getLegendGraphicRequest"],
                    position: 1
                }
            ];

        removeLegend({state, commit}, payload);
        expect(commit.calledOnce).to.be.true;
        expect(commit.firstCall.args[0]).to.be.equals("setLegends");
        expect(commit.firstCall.args[1]).to.be.deep.equals(legendsAfterRemove);
    });

    describe("toggleLayerInLegend", () => {
        it("toggleLayerInLegend call with not visible layer: should dispatch removeLegend", () => {
            toggleLayerInLegend({dispatch}, {layer: layer1, visibility: false});
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.be.equals("removeLegend");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(layer1.get("id"));
        });

        it("toggleLayerInLegend call with visible layer: should dispatch twice", async () => {
            legend1 = [{pointstyle: true}];
            await toggleLayerInLegend({dispatch}, {layer: layer1, visibility: true});
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.be.equals("prepareLegend");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals([{pointstyle: true}]);
            expect(dispatch.secondCall.args[0]).to.be.equals("generateLegend");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals(layer1);
        });

        it("toggleLayerInLegend call with visible group layer: should dispatch twice", () => {
            legend1 = [{pointstyle: true}];
            layerAttributes1.typ = "GROUP";
            toggleLayerInLegend({dispatch}, {layer: layer1, visibility: true});
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.be.equals("prepareLegendForGroupLayer");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(layerSource1);
            expect(dispatch.secondCall.args[0]).to.be.equals("generateLegend");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals(layer1);
        });
    });

    describe("generateLegend", () => {
        let getters, legendObj;

        beforeEach(() => {
            getters = {
                preparedLegend: ["string"],
                isLayerInLegend: () => false,
                isLegendChanged: () => false
            };
            legendObj = {
                id: layer1.get("id"),
                name: layer1.get("name"),
                legend: ["string"],
                position: layer1.getLayer().getZIndex()
            };
        });

        it("generateLegend call with layer not yet in legend: should dispatch addLegend", () => {
            generateLegend({dispatch, getters}, layer1);
            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.be.equals("addLegend");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(legendObj);
            expect(dispatch.secondCall.args[0]).to.be.equals("sortLegend");
        });

        it("generateLegend call with changed layer: should dispatch removeLegend and addLegend", () => {
            getters.isLegendChanged = () => true;
            getters.isLayerInLegend = () => true;
            generateLegend({dispatch, getters}, layer1);
            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.be.equals("removeLegend");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(layer1.get("id"));
            expect(dispatch.secondCall.args[0]).to.be.equals("addLegend");
            expect(dispatch.secondCall.args[1]).to.be.deep.equals(legendObj);
            expect(dispatch.thirdCall.args[0]).to.be.equals("sortLegend");
        });

        it("generateLegend call with not valid legend shall only sort", () => {
            validatorStub.restore();
            sinon.stub(validator, "isValidLegendObj").returns(false);
            generateLegend({dispatch, getters}, layer1);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.be.equals("sortLegend");
        });
    });

    describe("createLegendForLayerInfo", () => {
        let layerAttributes,
            layerConfig,
            layer;

        beforeEach(() => {
            layerAttributes = {
                id: "123",
                name: "foobar",
                typ: "WMS"
            };
            layerConfig = {
                id: layerAttributes.id,
                name: layerAttributes.name,
                legend: ["getLegendGraphicRequest"],
                position: 1
            };
            layer = {
                id: layerAttributes.id,
                get: (key) => {
                    return layerAttributes[key];
                },
                createLegend: () => layerConfig.legend,
                getLayerSource: () => [],
                getLayer: () => {
                    return {
                        id: "olLayer",
                        getZIndex: () => 1,
                        setVisible: sinon.stub()
                    };
                }
            };
        });

        it("for visible layer should dispatch generateLegendForLayerInfo", async () => {
            sinon.stub(layerCollection, "getLayerById").returns(layer);

            await createLegendForLayerInfo({dispatch}, layerConfig.id);
            expect(commit.notCalled).to.be.true;
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.be.equals("generateLegendForLayerInfo");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(layer);
        });

        it("for not visible layer with legend should dispatch generateLegendForLayerInfo and take layer on and off", async () => {
            legend1 = ["string"];
            sinon.stub(layerCollection, "getLayerById").returns(null);
            sinon.stub(layerFactory, "createLayer").returns(layer1);

            await createLegendForLayerInfo({dispatch}, layerConfig.id);
            expect(commit.notCalled).to.be.true;
            expect(dispatch.calledThrice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.be.equals("changeLayerVisibility");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({layerId: layerConfig.id, visibility: true});
            expect(dispatch.secondCall.args[0]).to.be.equals("generateLegendForLayerInfo");
            expect(dispatch.secondCall.args[1]).to.be.null;
            expect(dispatch.thirdCall.args[0]).to.be.equals("changeLayerVisibility");
            expect(dispatch.thirdCall.args[1]).to.be.deep.equals({layerId: layerConfig.id, visibility: false});
        });
    });

    describe("changeLayerVisibility", () => {
        it("should change layer visibility", async () => {
            const layerId = "123",
                visibility = true;

            await changeLayerVisibility({dispatch}, {layerId, visibility});
            expect(commit.notCalled).to.be.true;
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.be.equals("replaceByIdInLayerConfig");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals({
                layerConfigs: [{
                    id: layerId,
                    layer: {
                        loadingStrategy: "all",
                        visibility: visibility
                    }
                }]
            });
        });
    });

    describe("generateLegendForLayerInfo", () => {
        let layerAttributes,
            layerConfig,
            layer;

        beforeEach(() => {
            layerAttributes = {
                id: "123",
                name: "foobar",
                type: "WMS"
            };
            layerConfig = {
                id: layerAttributes.id,
                name: layerAttributes.name,
                legend: ["getLegendGraphicRequest"],
                position: 1
            };
            layer = {
                id: layerAttributes.id,
                get: (key) => {
                    return layerAttributes[key];
                },
                createLegend: () => layerConfig.legend,
                getLayerSource: () => [],
                getLayer: () => {
                    return {
                        getZIndex: () => 1
                    };
                }
            };
        });

        it("should commit LayerInfoLegend", async () => {
            await generateLegendForLayerInfo({commit, dispatch}, layer);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.be.equals("setLayerInfoLegend");
            expect(commit.firstCall.args[1]).to.be.deep.equals({
                id: layerAttributes.id,
                name: layerAttributes.name,
                legend: undefined,
                position: 1
            });
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.be.equals("prepareLegend");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(layerConfig.legend);
        });

        it("for visible group-layer should commit LayerInfoLegend", async () => {
            layerAttributes.typ = "GROUP";

            await generateLegendForLayerInfo({commit, dispatch}, layer);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.be.equals("setLayerInfoLegend");
            expect(commit.firstCall.args[1]).to.be.deep.equals({
                id: layerAttributes.id,
                name: layerAttributes.name,
                legend: undefined,
                position: 1
            });
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.be.equals("prepareLegendForGroupLayer");
            expect(dispatch.firstCall.args[1]).to.be.deep.equals(layer.getLayerSource());
        });
    });

    describe("prepareLegend", () => {
        it("prepareLegend with urls", () => {
            const legendInfos = ["legendUrl1", "legendUrl2"],
                legendObj = {
                    label: "name",
                    geometryType: "Point",
                    styleObject: {}
                };

            sinon.stub(legendDraw, "prepare").returns(legendObj);

            prepareLegend({commit}, legendInfos);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.be.equals("setPreparedLegend");
            expect(commit.firstCall.args[1]).to.be.deep.equals(legendInfos);
        });

        it("prepareLegend with objects in legendInfos", () => {
            const legendObj = {
                    label: "name",
                    geometryType: "Point",
                    styleObject: {}
                },
                legendInfos = [legendObj, legendObj];

            sinon.stub(legendDraw, "prepare").returns(legendObj);

            prepareLegend({commit}, legendInfos);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.be.equals("setPreparedLegend");
            expect(commit.firstCall.args[1]).to.be.deep.equals(legendInfos);
        });

        it("prepareLegend with array in legendObj", () => {
            const legendObj = {
                    label: "name",
                    geometryType: "Point",
                    styleObject: {}
                },
                legendInfos = [legendObj];

            sinon.stub(legendDraw, "prepare").returns([legendObj, legendObj]);

            prepareLegend({commit}, legendInfos);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.be.equals("setPreparedLegend");
            expect(commit.firstCall.args[1]).to.be.deep.equals([legendObj, legendObj]);
        });

        it("prepareLegend with wms style", () => {
            const legendObj = {
                    name: "name",
                    graphic: {}
                },
                legendInfos = [legendObj];

            sinon.stub(legendDraw, "prepare").returns({});

            prepareLegend({commit}, legendInfos);
            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args[0]).to.be.equals("setPreparedLegend");
            expect(commit.firstCall.args[1]).to.be.deep.equals(legendInfos);
        });
    });

    it("prepareLegendForGroupLayer", async () => {
        layer1 = {
            id: "1",
            createLegend: sinon.stub().returns(
                new Promise((resolve) => {
                    resolve(["legendUrl1"]);
                })
            )
        };
        layer2 = {
            id: "2",
            createLegend: sinon.stub().returns(
                new Promise((resolve) => {
                    resolve(["legendUrl2"]);
                })
            )
        };
        const layerSource = [
                layer1,
                layer2
            ],
            getters = {
                preparedLegend: ["getLegendGraphicRequest"]
            };

        sinon.stub(legendDraw, "prepare").returns({});

        await prepareLegendForGroupLayer({commit, dispatch, getters}, layerSource);
        expect(commit.calledOnce).to.be.true;
        expect(commit.firstCall.args[0]).to.be.equals("setPreparedLegend");
        expect(commit.firstCall.args[1]).to.be.deep.equals(["getLegendGraphicRequest"]);
        expect(dispatch.calledTwice).to.be.true;
        expect(dispatch.firstCall.args[0]).to.be.equals("prepareLegend");
        expect(dispatch.firstCall.args[1]).to.be.deep.equals(["legendUrl1"]);
        expect(dispatch.secondCall.args[0]).to.be.equals("prepareLegend");
        expect(dispatch.secondCall.args[1]).to.be.deep.equals(["legendUrl2"]);
    });
});
