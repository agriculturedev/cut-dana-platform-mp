import {expect} from "chai";
import sinon from "sinon";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import store from "../../../../../app-store";
import createLayerAddToTreeModule from "../../createLayerAddToTree.js";
import layerCollection from "../../../../../core/layers/js/layerCollection.js";
import {reset as resetUniqueId} from "../../../../../shared/js/utils/uniqueId.js";

describe("src/utils/createLayerAddToTree.js", () => {
    let addedFeatures = null,
        setIsSelectedSpy,
        originalLayer,
        newLayer,
        layerSource,
        createdLayer,
        highlightLayerFeatures,
        setStyleSpy;
    const treeHighlightedFeatures = {
        active: true,
        layerName: "common:shared.js.utils.selectedFeatures"
    };

    describe("createLayerAddToTree", () => {
        let layerInCollection = false;

        before(() => {
            i18next.init({
                lng: "cimode",
                debug: false
            });
        });

        beforeEach(() => {
            highlightLayerFeatures = [];
            layerInCollection = false;
            setIsSelectedSpy = sinon.spy();
            resetUniqueId();
            sinon.stub(styleList, "returnStyleObject").returns({});
            layerSource = {
                getFeatures: () => {
                    return highlightLayerFeatures;
                },
                addFeatures: sinon.spy(),
                removeFeature: sinon.spy()
            };
            createdLayer = {
                get: (key) => {
                    if (key === "layer") {
                        return newLayer;
                    }
                    return null;
                },
                getLayerSource: () => {
                    return layerSource;
                },
                getLayer: () => {
                    return {
                        setStyle: setStyleSpy
                    };
                },
                setIsSelected: setIsSelectedSpy
            };
            newLayer = {
                getSource: () => {
                    return {
                        addFeatures: (features) => {
                            addedFeatures = features;
                        },
                        getFeatures: () => {
                            return addedFeatures ? [...addedFeatures] : [];
                        }
                    };
                },
                getLayer: () => {
                    return {
                        setStyle: setStyleSpy
                    };
                }
            };
            setStyleSpy = sinon.spy();
            originalLayer = {
                id: "idOriginal",
                name: "originalName",
                get: (key) => {
                    if (key === "layer") {
                        return {};
                    }
                    if (key === "name") {
                        return "originalName";
                    }
                    return null;
                },
                getLayer: () => {
                    return {
                        setStyle: setStyleSpy
                    };
                },
                setIsSelected: sinon.stub(),
                attributes: {}
            };

            sinon.stub(layerCollection, "getLayerById").callsFake((id) => {
                let ret = null;

                if (id === "idOriginal") {
                    ret = originalLayer;
                }
                else if (id?.indexOf("_") > -1) {
                    if (layerInCollection) {
                        ret = createdLayer;
                    }
                    else {
                        layerInCollection = true;
                    }
                }
                return ret;
            });
            store.dispatch = sinon.spy();
        });

        afterEach(() => {
            sinon.restore();
        });

        it("test create new layer - layerId is null shall do nothing", async () => {
            const layerId = null,
                features = [{featureId: "featureId"}];

            await createLayerAddToTreeModule.createLayerAddToTree(layerId, features, treeHighlightedFeatures);
            expect(setStyleSpy.notCalled).to.be.true;
        });

        it("test create new layer - layer does not exist", () => {
            const layerId = "unknown",
                features = [{featureId: "featureId"}];

            createLayerAddToTreeModule.createLayerAddToTree(layerId, features, treeHighlightedFeatures);

            expect(store.dispatch.args[0][0]).to.equal("addLayerToLayerConfig");
            expect(store.dispatch.args[0][1].layerConfig).to.equal(null);
            expect(setStyleSpy.notCalled).to.be.true;
        });

        it("test create new layer remove features and addFeatures", async () => {
            const layerId = "idOriginal",
                features = [{featureId: "featureIdNew"}];

            highlightLayerFeatures = [{featureId: "featureId"}];
            await createLayerAddToTreeModule.createLayerAddToTree(layerId, features, treeHighlightedFeatures);

            expect(store.dispatch.args[0][0]).to.equal("addLayerToLayerConfig");
            expect(store.dispatch.args[0][1].layerConfig.id).to.equal("idOriginal_1");
            expect(store.dispatch.args[0][1].layerConfig.visibility).to.equal(true);
            expect(store.dispatch.args[0][1].layerConfig.typ).to.equal("VectorBase");
            expect(layerSource.removeFeature.calledOnce).to.be.true;
            expect(layerSource.removeFeature.args[0][0]).to.be.deep.equals(highlightLayerFeatures[0]);
            expect(layerSource.addFeatures.calledOnce).to.be.true;
            expect(layerSource.addFeatures.args[0][0]).to.be.deep.equals(features);
            expect(setStyleSpy.calledOnce).to.be.true;
        });

        it("test use existing layer of layerCollection and addFeatures", async () => {
            const layerId = "idOriginal",
                features = [{featureId: "featureId"}];

            layerInCollection = true;

            await createLayerAddToTreeModule.createLayerAddToTree(layerId, features, treeHighlightedFeatures);
            expect(store.dispatch.args[0][0]).to.equal("replaceByIdInLayerConfig");
            expect(store.dispatch.args[1][0]).to.equal("updateAllZIndexes");
            expect(layerSource.addFeatures.calledOnce).to.be.true;
            expect(layerSource.addFeatures.args[0][0]).to.be.deep.equals(features);
            expect(setStyleSpy.calledOnce).to.be.true;
        });
    });
});
