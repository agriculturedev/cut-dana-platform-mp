import {expect} from "chai";
import sinon from "sinon";
import layerCollector from "../../../js/layerCollector";
import layerCollection from "../../../../../core/layers/js/layerCollection";

describe("src/modules/legend/js/layerCollector.js", function () {
    let layers,
        groupedLayers,
        isBaselayer = false;
    const wmsLayer = {
            id: "wms",
            attributes: {
                name: "WMS Layer"
            },
            get: (key) =>{
                if (key === "typ") {
                    return "WMS";
                }
                if (key === "visibility") {
                    return true;
                }
                return null;
            }
        },
        wfsLayer = {
            id: "wfs",
            attributes: {
                name: "WFS Layer"
            },
            get: (key) =>{
                if (key === "typ") {
                    return "WFS";
                }
                if (key === "visibility") {
                    return false;
                }
                return null;
            }
        },
        groupLayer = {
            id: "wms",
            attributes: {
                name: "Group Layer"
            },
            get: (key) =>{
                if (key === "typ") {
                    return "GROUP";
                }
                if (key === "baselayer") {
                    return isBaselayer;
                }
                if (key === "visibility") {
                    return true;
                }
                return null;
            },
            getLayerSource: () => {
                return groupedLayers;
            }
        };

    beforeEach(() => {
        layers = [];
        groupedLayers = [];
        isBaselayer = false;
        sinon.stub(layerCollection, "getLayers").returns(
            layers
        );
    });
    afterEach(() => {
        sinon.restore();
    });

    describe("getLayerHolder", () => {
        it("returns empty array if no layers are in layerCollection", () => {
            expect(layerCollector.getLayerHolder()).to.be.deep.equals([]);
        });
        it("returns one visibile and one invisible layer", () => {
            layers.push(wmsLayer);
            layers.push(wfsLayer);

            expect(layerCollector.getLayerHolder().length).to.be.equals(2);
            expect(layerCollector.getLayerHolder()[0]).to.be.deep.equals({
                layer: wmsLayer,
                visibility: true
            });
            expect(layerCollector.getLayerHolder()[1]).to.be.deep.equals({
                layer: wfsLayer,
                visibility: false
            });
        });
        it("returns grouped layers with visibility of layerGroup", () => {
            layers.push(groupLayer);
            groupedLayers.push(wmsLayer);
            groupedLayers.push(wfsLayer);

            expect(layerCollector.getLayerHolder().length).to.be.equals(2);
            expect(layerCollector.getLayerHolder()[0]).to.be.deep.equals({
                layer: wmsLayer,
                visibility: true
            });
            expect(layerCollector.getLayerHolder()[1]).to.be.deep.equals({
                layer: wfsLayer,
                visibility: true
            });
        });
        it("returns grouped baselayer with visibility of layerGroup", () => {
            isBaselayer = true;
            layers.push(groupLayer);
            groupedLayers.push(wmsLayer);
            groupedLayers.push(wfsLayer);

            expect(layerCollector.getLayerHolder().length).to.be.equals(1);
            expect(layerCollector.getLayerHolder()[0]).to.be.deep.equals({
                layer: wmsLayer,
                visibility: true
            });
        });
        it("first baselayer gets the name of the group", () => {
            isBaselayer = true;
            layers.push(groupLayer);
            groupedLayers.push(wmsLayer);
            groupedLayers.push(wfsLayer);
            layerCollector.getLayerHolder();

            expect(layerCollection.getLayers()[0].attributes).to.be.deep.equals({
                name: wmsLayer.attributes.name
            });
        });
    });
});
