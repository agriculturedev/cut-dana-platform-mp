import {expect} from "chai";
import {getVisibleLayersWithGroupLayersChildren, getVisibleWmsLayersAtResolution} from "../../../js/getLayers";
import Layer from "ol/layer/Layer";
import LayerGroup from "ol/layer/Group";
import actionsMaps from "../../../../../core/maps/store/actionsMaps";

const {addLayer} = actionsMaps;

describe("src/modules/getFeatureInfo/js/getLayers.js", () => {
    describe("getVisibleLayersWithGroupLayersChildren", () => {
        it("returns the getVisibleLayersWithGroupLayersChildren with Group layers", () => {
            const layers = [],
                layer1 = new Layer({visible: true}),
                layer2 = new Layer({visible: true}),
                grouplayer = new LayerGroup({
                    layers: [layer1, layer2]
                });

            layers.push(grouplayer);

            expect(getVisibleLayersWithGroupLayersChildren(layers)).to.be.an("array").that.contains(layer1, layer2);
        });

        it("returns the getVisibleLayersWithGroupLayersChildren without Group layers", () => {
            const layers = [],
                layer1 = {
                    get: () => true,
                    visible: true,
                    getArray: () => [layer1],
                    getVisible: () => true
                };

            layers.push(layer1);

            expect(getVisibleLayersWithGroupLayersChildren(layers)).to.be.an("array").that.contains(layer1);
        });
    });

    describe("getVisibleWmsLayersAtResolution", () => {
        let visibleSubjectDataLayerConfigs,
            layer1,
            layer2,
            layer3,
            grouplayer;

        beforeEach(() => {
            const layers = [],
                map = {
                    id: "ol",
                    mode: "2D",
                    addLayer: (group) => {
                        layers.push(group);
                    },
                    getLayers: () => {
                        return grouplayer.getLayers();
                    },
                    getArray: () => [grouplayer]
                },
                state = {
                    mode: "2D"
                };

            layer1 = new Layer({
                id: "1",
                visible: true,
                typ: "WMS",
                minResolution: 0.1322915952292052,
                maxResolution: 66.14579761460263
            });
            layer2 = new Layer({
                id: "2",
                visible: true,
                typ: "WFS",
                minResolution: 0.1322915952292052,
                maxResolution: 66.14579761460263
            });
            layer3 = new Layer({
                id: "3",
                visible: true,
                typ: "WMS",
                minResolution: 0.1322915952292052,
                maxResolution: 66.14579761460263
            });
            grouplayer = new LayerGroup({
                layers: [layer1, layer2, layer3]
            });
            visibleSubjectDataLayerConfigs = [
                {
                    id: "1"
                },
                {
                    id: "2"
                },
                {
                    id: "3"
                }
            ];
            mapCollection.clear();
            mapCollection.addMap(map, "2D");
            addLayer(state, grouplayer);
        });

        it("returns the getVisibleWmsLayersAtResolution from grouplayer", () => {
            expect(getVisibleWmsLayersAtResolution(5.2916638091682096, visibleSubjectDataLayerConfigs)).to.be.an("array").that.contains(layer1, layer3);
        });

        it("returns the getVisibleWmsLayersAtResolution from grouplayer and checks config vor visible layers", () => {
            visibleSubjectDataLayerConfigs = [
                {
                    id: "2"
                },
                {
                    id: "3"
                }
            ];
            expect(getVisibleWmsLayersAtResolution(5.2916638091682096, visibleSubjectDataLayerConfigs)).to.be.an("array").that.contains(layer3);
        });
    });

});
