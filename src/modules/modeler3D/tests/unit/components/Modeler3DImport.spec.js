import {createStore} from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {mount, config} from "@vue/test-utils";
import Modeler3DImportComponent from "../../../components/Modeler3DImport.vue";
import Modeler3DModule from "../../../store/indexModeler3D";
import {JSDOM} from "jsdom";
import {ColladaLoader} from "three/examples/jsm/loaders/ColladaLoader.js";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {GLTFExporter} from "three/examples/jsm/exporters/GLTFExporter.js";

const globalDocument = global.document,
    globalWindow = global.window,
    {window} = new JSDOM(),
    featureCollection = {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {
                    name: "Zeichnung",
                    clampToGround: true,
                    color: {
                        red: 0.9411764705882353,
                        green: 0.9725490196078431,
                        blue: 1,
                        alpha: 1
                    },
                    outlineColor: {
                        red: 0.9411764705882353,
                        green: 0.9725490196078431,
                        blue: 1,
                        alpha: 1
                    },
                    extrudedHeight: 51.399072774877325
                },
                geometry: {
                    type: "Polygon",
                    coordinates: [[
                        [9.994428832757109, 53.55216143433489, 31.39907277487732],
                        [9.99525788981755, 53.552197024075085, 31.39907277487732],
                        [9.994765846774351, 53.55178310383997, 31.39907277487732]
                    ]]
                }
            },
            {
                type: "Feature",
                properties: {
                    name: "Zeichnung",
                    clampToGround: true,
                    color: {
                        red: 0.9411764705882353,
                        green: 0.9725490196078431,
                        blue: 1,
                        alpha: 1
                    },
                    width: 2
                },
                geometry: {
                    type: "Polyline",
                    coordinates: [[
                        [9.994428832757109, 53.55216143433489, 31.39907277487732],
                        [9.99525788981755, 53.552197024075085, 31.39907277487732],
                        [9.994765846774351, 53.55178310383997, 31.39907277487732]
                    ]]
                }
            }
        ]
    };

config.global.mocks.$t = key => key;

describe("src/modules/modeler3D/components/Modeler3DImport.vue", () => {
    let store, wrapper, scene;
    const entities = {
            getById: () => ({position: {}}),
            values: []
        },
        map3D = {
            id: "1",
            mode: "3D",
            getCesiumScene: () => {
                return scene;
            },
            getDataSourceDisplay: () => {
                return {
                    defaultDataSource: {
                        entities: entities
                    }
                };
            }
        };

    beforeEach(() => {
        global.window = window;
        global.FileReader = window.FileReader;
        mapCollection.clear();
        mapCollection.addMap(map3D, "3D");

        entities.add = sinon.stub();

        global.Cesium = {
            Entity: function (options) {
                this.id = options.id;
                this.name = options.name;
                this.clampToGround = options.clampToGround;
            }
        };

        store = createStore({
            modules: {
                namespaced: true,
                Modules: {
                    namespaced: true,
                    modules: {
                        Modeler3D: Modeler3DModule
                    }
                }
            }
        });

        store.commit("Modules/Modeler3D/setIsLoading", false);
        store.commit("Modules/Modeler3D/setDrawnModels", []);
        store.commit("Modules/Modeler3D/setImportedModels", []);
    });

    afterEach(() => {
        sinon.restore();

        global.document = globalDocument;
        global.window = globalWindow;
    });

    it("should find Tool component", () => {
        wrapper = mount(Modeler3DImportComponent, {global: {
            plugins: [store]
        }});
        const toolModeler3DImportWrapper = wrapper.findAllComponents({name: "AccordionItem"}).at(1);

        expect(toolModeler3DImportWrapper.exists()).to.be.true;
    });
    it("handles OBJ file correctly", async () => {
        const fileContent = "dummy obj file content",
            fileName = "example.obj",

            objLoaderStub = sinon.stub(OBJLoader.prototype, "parse").returns(fileContent),
            gltfExporterStub = sinon.stub(GLTFExporter.prototype, "parse").returns(fileContent);

        wrapper = mount(Modeler3DImportComponent, {global: {
            plugins: [store]
        }});
        await wrapper.vm.handleObjFile(fileContent, fileName);

        expect(objLoaderStub.calledOnce).to.be.true;
        expect(gltfExporterStub.calledOnce).to.be.true;
    });
    it("should handle DAE file correctly", async () => {
        wrapper = mount(Modeler3DImportComponent, {global: {
            plugins: [store]
        }});
        const fileContent = "dummy dae file content",
            fileName = "example.dae",

            colladaLoaderStub = sinon.stub(ColladaLoader.prototype, "parse").returns(fileContent),
            gltfExporterStub = sinon.stub(GLTFExporter.prototype, "parse").returns(fileContent);

        await wrapper.vm.handleDaeFile(fileContent, fileName);
        expect(colladaLoaderStub.calledOnce).to.be.true;
        expect(gltfExporterStub.calledOnce).to.be.true;
    });
    it("handles GeoJSON file correctly", () => {
        const fileContent = JSON.stringify(featureCollection),
            featureCount = featureCollection.features.length;

        global.Cesium.Color = function (red, green, blue, alpha) {
            this.red = red;
            this.green = green;
            this.blue = blue;
            this.alpha = alpha;
        };
        global.Cesium.ColorMaterialProperty = function (color) {
            this.color = color;
        };
        global.Cesium.PolygonHierarchy = function (positions) {
            this.positions = positions;
        };
        global.Cesium.ShadowMode = {
            ENABLED: 1
        };
        global.Cesium.Cartesian3 = {
            fromDegrees: sinon.stub().returns({x: 10, y: 20, z: 30})
        };

        wrapper = mount(Modeler3DImportComponent, {global: {
            plugins: [store]
        }});
        wrapper.vm.handleGeoJsonFile(fileContent);

        expect(entities.add.callCount).to.equal(featureCount);
        expect(store.state.Modules.Modeler3D.drawnModels.length).to.equal(featureCount);
        expect(store.state.Modules.Modeler3D.currentView).to.equal("modeler-draw");
    });
    it("displays the list of successfully imported models", async () => {
        wrapper = mount(Modeler3DImportComponent, {global: {
            plugins: [store]
        }});
        let importedModelList = null;
        const importedModels = [
            {
                id: "1",
                name: "Model 1",
                show: true
            },
            {
                id: "2",
                name: "Model 2",
                show: true
            }
        ];

        store.commit("Modules/Modeler3D/setImportedModels", importedModels);
        await wrapper.vm.$nextTick();

        importedModelList = wrapper.find("#successfully-imported-models");

        expect(importedModelList.exists()).to.be.true;
    });
});
