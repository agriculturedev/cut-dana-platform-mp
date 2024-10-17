import {expect} from "chai";
import sinon from "sinon";
import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import WFSLayer from "../../../js/layer2dVectorWfs";
import webgl from "../../../js/webglRenderer";


describe("src/core/js/layers/webglRenderer.js", () => {
    let attributes, olLayer, source, includes, removeLayerSpy, addLayerSpy;

    beforeEach(() => {
        attributes = {
            name: "TestLayer",
            id: "id",
            typ: "GeoJSON",
            renderer: "webgl",
            altitudeMode: "clampToGround"
        };
        includes = true;
        removeLayerSpy = sinon.spy();
        addLayerSpy = sinon.spy();

        mapCollection.clear();
        const map = {
            id: "ol",
            mode: "2D",
            getView: () => {
                return {
                    getProjection: () => {
                        return {
                            getCode: () => "EPSG:25832"
                        };
                    }
                };
            },
            getLayers: () =>{
                return {
                    getArray: () => {
                        return {
                            includes: () => includes
                        };
                    }
                };
            },
            removeLayer: removeLayerSpy,
            addLayer: addLayerSpy
        };

        mapCollection.addMap(map, "2D");
        source = new VectorSource();
        olLayer = new VectorLayer({source});
    });
    describe("setLayerProperties", () => {
        it("should override necessary class properties", () => {
            const layerObject = new WFSLayer(attributes);

            webgl.setLayerProperties(layerObject);
            expect(layerObject.isDisposed).to.equal(webgl.isDisposed);
            expect(layerObject.visibilityChanged).to.equal(webgl.visibilityChanged);
            expect(layerObject.hideAllFeatures).to.equal(webgl.hideAllFeatures);
            expect(layerObject.showAllFeatures).to.equal(webgl.showAllFeatures);
            expect(layerObject.showFeaturesByIds).to.equal(webgl.showFeaturesByIds);
            expect(layerObject.setStyle).to.equal(webgl.setStyle);
        });
    });
    describe("isDisposed", () => {
        it("should return true if olLayer is disposed", () => {
            const layerObject = new WFSLayer(attributes);

            layerObject.layer.dispose();
            expect(webgl.isDisposed.call(layerObject)).to.be.true;
        });
        it("should return true if olLayer doesn't exist", () => {
            const layerObject = new WFSLayer(attributes);

            layerObject.layer = null;
            expect(webgl.isDisposed.call(layerObject)).to.be.true;
        });
        it("should return false if WFSLayer healthy", () => {
            const layerObject = new WFSLayer(attributes);

            expect(webgl.isDisposed.call(layerObject)).to.be.false;
        });
    });
    describe("visibilityChanged", () => {
        it("should create a new WFSLayer instance with WFSLayer isDisposed", () => {
            const layerObject = new WFSLayer(attributes);

            webgl.setLayerProperties(layerObject);

            expect(layerObject.isDisposed()).to.be.false;
        });
        it("should keep the original style from the old WFSLayer instance, even if it is overwritten by the resp. WFSLayer class", () => {
            const style = {
                    symbol: {
                        symbolType: "circle",
                        size: 20,
                        color: "#006688",
                        rotateWithView: false,
                        offset: [0, 0],
                        opacity: 0.6
                    }
                },
                layerObject = new WFSLayer({
                    ...attributes,
                    style,
                    isPointLayer: true
                });


            layerObject.set("style", {});
            layerObject.layer.dispose();
            layerObject.visibilityChanged(true);
            expect(layerObject.layer.get("style")).to.deep.equal(style);
        });
        it("should dispose WFSLayer when WFSLayer is set invisible", () => {
            const layerObject = new WFSLayer(attributes);

            layerObject.visibilityChanged(false);
            expect(layerObject.layer.disposed).to.be.true;
            expect(removeLayerSpy.calledOnce).to.be.true;
        });
    });
    describe("hideAllFeatures", () => {
        it("should remove all features from the source", () => {
            const layerObject = new WFSLayer(attributes, olLayer, false);

            webgl.setLayerProperties(layerObject);
            layerObject.layer.getSource().addFeature(new Feature({id: "0"}));
            layerObject.hideAllFeatures();
            expect(layerObject.layer.getSource().getFeatures()).to.have.lengthOf(0);
        });
    });
    describe("showAllFeatures", () => {
        it("should make source features equal layerObject features", () => {
            const layerObject = new WFSLayer(attributes, olLayer, false),
                feature1 = new Feature({id: "0"}),
                feature2 = new Feature({id: "1"});

            webgl.setLayerProperties(layerObject);
            layerObject.features = [feature1, feature2];
            layerObject.layer.getSource().addFeature(feature1);
            layerObject.showAllFeatures();
            expect(layerObject.layer.getSource().getFeatures()).to.deep.equal(layerObject.features);
        });
    });
    describe("showFeaturesByIds", () => {
        it("should show features with given ids", () => {
            const layerObject = new WFSLayer(attributes, olLayer, false);

            webgl.setLayerProperties(layerObject);
            layerObject.features = [new Feature(), new Feature()];
            layerObject.features.forEach((f, i) => f.setId(i));
            layerObject.showFeaturesByIds([1]);
            expect(layerObject.layer.getSource().getFeatures()).to.have.lengthOf(1);
            expect(layerObject.layer.getSource().getFeatures()[0].getId()).to.equal(1);
        });
    });
});

