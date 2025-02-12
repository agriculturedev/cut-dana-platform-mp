import {createStore} from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount} from "@vue/test-utils";
import crs from "@masterportal/masterportalapi/src/crs";
import Modeler3DComponent from "../../../components/Modeler3D.vue";
import Modeler3D from "../../../store/indexModeler3D";
import Modeler3DDraw from "../../../components/Modeler3DDraw.vue";
import Modeler3DImport from "../../../components/Modeler3DImport.vue";
import getGfiFeaturesByTileFeatureModule from "../../../../../shared/js/utils/getGfiFeaturesByTileFeature";
import layerCollection from "../../../../../core/layers/js/layerCollection";

config.global.mocks.$t = key => key;

describe("src/modules/modeler3D/components/Modeler3D.vue", () => {
    const mockMapGetters = {
            mouseCoordinate: () => {
                return [11.549606597773037, 48.17285700012215];
            }
        },
        mockConfigJson = {
            Portalconfig: {
                menu: {
                    Modules: {
                        children: {
                            modeler3D: {
                                "name": "translate#common:menu.modeler3D",
                                "icon": "bi-bounding-box"
                            }
                        }
                    }
                }
            }
        },
        namedProjections = [
            ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
            ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
            ["EPSG:8395", "+title=ETRS89_3GK3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
            ["EPSG:8395", "+title=EPSG: 8395 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
            ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
        ],
        entities = {
            getById: (val) => {
                return entities.values.find(x => x.id === val);
            },
            add (val) {
                entities.values.push(val);
            },
            values: [
                {
                    id: "FloatingPointId",
                    positionIndex: 0,
                    polygon: {length: 4}
                },
                {
                    id: "entityId",
                    position: {getValue: () => "position1"},
                    rotation: 0,
                    model: {
                        color: null,
                        silhouetteColor: null,
                        silhouetteSize: 0,
                        colorBlendAmount: 0
                    }
                },
                {
                    id: 2,
                    position: {getValue: () => "position2"},
                    rotation: 0,
                    model: {
                        color: null,
                        silhouetteColor: "white",
                        silhouetteSize: 10,
                        colorBlendAmount: 2
                    },
                    cylinder: {length: 4}
                }
            ]
        },
        pickRayResult = {
            origin: {},
            direction: {}
        },
        scene = {
            requestRender: sinon.stub(),
            camera: {
                getPickRay: sinon.stub().returns(pickRayResult)
            },
            globe: {
                pick: sinon.stub().returns([11.549606597773037, 48.17285700012215]),
                getHeight: sinon.stub().returns(5)
            },
            sampleHeight: sinon.stub(),
            screenSpaceCameraController: {}
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
            },
            getOlMap: () => ({
                getView: () => ({
                    getProjection: () => ({
                        getCode: () => "EPSG:25832"
                    })
                })
            })
        },
        event = {position: "winCoords"};

    let store,
        wrapper,
        origUpdateUI,
        origMovePolygon,
        origMovePolyline,
        origUpdatePositionUI;

    before(() => {
        const mapElement = document.createElement("div");

        mapElement.id = "map";
        document.body.append(mapElement);
    });

    after(() => {
        document.getElementById("map")?.remove();
    });

    beforeEach(() => {
        mapCollection.clear();
        mapCollection.addMap(map3D, "3D");

        global.Cesium = {
            ColorBlendMode: {
                HIGHLIGHT: 0
            },
            Color: {
                fromCssColorString: () => {
                    return "RED";
                },
                fromAlpha: () => {
                    return "RED";
                }
            },
            CallbackProperty: sinon.stub(),
            Entity: function (id) {
                this.id = id;
            },
            Cesium3DTileFeature: function (options) {
                this.tileset = options.tileset;
            },
            defaultValue: () => {
                return new global.Cesium.Entity("entityId");
            },
            Cartesian3: {
                equals: () => false,
                add: (pos1, pos2, res) => {
                    res.x = pos1.x + pos2.x;
                    res.y = pos1.y + pos2.y;
                    res.z = pos1.z + pos2.z;
                    return res;
                },
                divideByScalar: (pos, scalar, res) => {
                    res.x = pos.x / scalar;
                    res.y = pos.y / scalar;
                    res.z = pos.z / scalar;
                    return res;
                }
            },
            Cartographic: {
                fromDegrees: () => ({
                    longitude: 0.17443853256965697,
                    latitude: 0.9346599366554966,
                    height: 6.134088691520464
                }),
                fromCartesian: () => ({
                    longitude: 0.17443853256965697,
                    latitude: 0.9346599366554966,
                    height: 6.134088691520464
                }),
                toCartesian: () => ({
                    x: 3739310.9273738265,
                    y: 659341.4057539968,
                    z: 5107613.232959453
                })
            },
            ScreenSpaceEventType: {},
            ScreenSpaceEventHandler: function () {
                this.setInputAction = sinon.stub();
                this.removeInputAction = sinon.stub();
            }
        };

        origUpdateUI = Modeler3D.actions.updateUI;
        Modeler3D.actions.updateUI = sinon.spy();
        origMovePolygon = Modeler3D.actions.movePolygon;
        Modeler3D.actions.movePolygon = sinon.spy();
        origMovePolyline = Modeler3D.actions.movePolyline;
        Modeler3D.actions.movePolyline = sinon.spy();
        origUpdatePositionUI = Modeler3D.actions.updatePositionUI;
        Modeler3D.actions.updatePositionUI = sinon.spy();

        store = createStore({
            modules: {
                namespaced: true,
                Modules: {
                    namespaced: true,
                    modules: {
                        Modeler3D
                    }
                },
                Maps: {
                    namespaced: true,
                    getters: mockMapGetters
                }
            },
            getters: {
                namedProjections: () => namedProjections
            },
            state: {
                configJson: mockConfigJson
            }

        });
        crs.registerProjections(namedProjections);

        entities.values = [
            {
                id: "FloatingPointId",
                positionIndex: 0,
                polygon: {length: 4}
            },
            {
                id: "entityId",
                position: {getValue: () => "position1"},
                rotation: 0,
                model: {
                    color: null,
                    silhouetteColor: null,
                    silhouetteSize: 0,
                    colorBlendAmount: 0
                }
            },
            {
                id: 2,
                position: {getValue: () => "position2"},
                rotation: 0,
                positionIndex: 0,
                model: {
                    color: null,
                    silhouetteColor: "white",
                    silhouetteSize: 10,
                    colorBlendAmount: 2
                },
                cylinder: {length: 4}
            }
        ];

        store.commit("Modules/Modeler3D/setCurrentView", "modeler-import");
        store.commit("Modules/Modeler3D/setHiddenObjects", []);
        store.commit("Modules/Modeler3D/setImportedModels", [{id: 1, name: "modelName", heading: 120, scale: 1}]);
    });

    afterEach(() => {
        Modeler3D.actions.updateUI = origUpdateUI;
        Modeler3D.actions.movePolygon = origMovePolygon;
        Modeler3D.actions.movePolyline = origMovePolyline;
        Modeler3D.actions.updatePositionUI = origUpdatePositionUI;

        sinon.restore();
    });

    it("renders Modeler3D with import view", async () => {
        wrapper = shallowMount(Modeler3DComponent, {global: {
            plugins: [store]
        }});

        store.commit("Modules/Modeler3D/setCurrentView", "modeler-import");
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#module-modeler3D").exists()).to.be.true;
        expect(wrapper.findComponent(Modeler3DImport).exists()).to.be.true;
        expect(wrapper.findComponent(Modeler3DDraw).exists()).to.be.false;
        expect(wrapper.find("#modeler3D-options-view").exists()).to.be.false;
    });

    it("does not render Modeler3D", () => {
        wrapper = shallowMount(Modeler3DComponent, {global: {
            plugins: [store]
        }});

        expect(wrapper.find("#tool-modeler3D").exists()).to.be.false;
    });

    it("renders Modeler3D with draw view", async () => {
        wrapper = shallowMount(Modeler3DComponent, {global: {
            plugins: [store]
        }});

        store.commit("Modules/Modeler3D/setCurrentView", "modeler-draw");
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#module-modeler3D").exists()).to.be.true;
        expect(wrapper.findComponent(Modeler3DDraw).exists()).to.be.true;
        expect(wrapper.findComponent(Modeler3DImport).exists()).to.be.false;
        expect(wrapper.find("#modeler3D-options-view").exists()).to.be.false;
    });

    it("renders Modeler3D with options view", async () => {
        wrapper = shallowMount(Modeler3DComponent, {global: {
            plugins: [store]
        }});

        store.commit("Modules/Modeler3D/setCurrentView", "");
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#module-modeler3D").exists()).to.be.true;
        expect(wrapper.find("#modeler3D-options-view").exists()).to.be.true;
        expect(wrapper.findComponent(Modeler3DDraw).exists()).to.be.false;
        expect(wrapper.findComponent(Modeler3DImport).exists()).to.be.false;
    });

    it("renders hiddenObject List when set", async () => {
        store.commit("Modules/Modeler3D/setCurrentModelId", null);
        store.commit("Modules/Modeler3D/setHiddenObjects", [
            {
                id: "id",
                pickId: "pickId",
                layerId: "layerId",
                name: "name"
            }
        ]);

        wrapper = shallowMount(Modeler3DComponent, {global: {
            plugins: [store]
        }});
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#module-modeler3D").exists()).to.be.true;
        expect(wrapper.find("#hidden-objects").exists()).to.be.true;
    });

    describe("Modeler3D.vue watcher", () => {
        it("watch to currentModelId shall highlight selected Entity and populate UI", async () => {
            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});

            wrapper.vm.highlightEntity = sinon.spy();
            store.commit("Modules/Modeler3D/setCurrentModelId", "entityId");
            await wrapper.vm.$nextTick();

            const entity = entities.getById("entityId");

            expect(wrapper.vm.highlightEntity.calledWith(entity));
            expect(store.state.Modules.Modeler3D.currentModelPosition).to.eql("position1");
            expect(Modeler3D.actions.updateUI.called).to.be.true;
        });

        it("watch to currentModelId shall reset highlighting of deselected Entity", async () => {
            store.commit("Modules/Modeler3D/setCurrentModelId", 2);
            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            wrapper.vm.highlightEntity = sinon.spy();
            global.Cesium.Color = {
                WHITE: "#ffffff"
            };

            store.commit("Modules/Modeler3D/setCurrentModelId", null);
            await wrapper.vm.$nextTick();

            const entity = entities.getById(2);

            expect(entity.model.silhouetteColor).to.be.null;
            expect(entity.model.silhouetteSize).to.be.equals(0);
            expect(entity.model.colorBlendAmount).to.be.equals(0);

            expect(scene.requestRender.called).to.be.true;
            expect(store.state.Modules.Modeler3D.currentModelPosition).to.be.null;
        });
    });

    describe("Modeler3D.vue methods", () => {
        it("initProjectionsInModeler3D adds WGS84 decimal projection", () => {
            let projections = [];

            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            wrapper.vm.initProjectionsInModeler3D();

            projections = store.state.Modules.Modeler3D.projections;
            expect(projections.length).to.be.equals(6);
            expect(projections[0].id).to.be.not.null;
            expect(projections.filter(proj => proj.id === "http://www.opengis.net/gml/srs/epsg.xml#4326-DG").length).to.be.equals(1);
        });

        it("initProjectionsInModeler3D adds ETRS89_3GK3", () => {
            let projections = [];

            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            wrapper.vm.initProjectionsInModeler3D();

            projections = store.state.Modules.Modeler3D.projections;
            expect(projections.length).to.be.equals(6);
            expect(projections[0].id).to.be.not.null;
            expect(projections.filter(proj => proj.id === "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3").length).to.be.equals(1);
        });

        it("selectObject picks an entity", () => {
            let currentModelId = "";
            const pickObject = new global.Cesium.Entity("entityId");

            scene.drillPick = sinon.stub().returns([pickObject]);
            global.Cesium.defined = sinon.stub().returns(true);
            global.Cesium.defaultValue = sinon.stub().returns(pickObject);

            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            wrapper.vm.selectObject(event);

            currentModelId = store.state.Modules.Modeler3D.currentModelId;

            expect(currentModelId).to.eql("entityId");
        });

        it("selectObject picks object and adds it to list", () => {
            let hiddenObjects = [];

            store.commit("Modules/Modeler3D/setHideObjects", true);

            const pickObject = new global.Cesium.Cesium3DTileFeature({tileset: {}}),

                tileSetModel = {
                    get: () => "TileSet3D",
                    addToHiddenObjects: sinon.stub()
                },

                layerCollectionStub = sinon.stub(layerCollection, "getLayers").returns([tileSetModel]);

            scene.drillPick = sinon.stub().returns([pickObject]);
            global.Cesium.defined = sinon.stub().returns(true);
            global.Cesium.defaultValue = sinon.stub().returns(false);
            sinon.stub(getGfiFeaturesByTileFeatureModule, "getGfiFeaturesByTileFeature").returns([{
                getProperties: () => ({
                    gmlid: "gmlId"
                })
            }]);

            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});

            wrapper.vm.selectObject(event);

            hiddenObjects = store.state.Modules.Modeler3D.hiddenObjects;

            expect(layerCollectionStub.called).to.be.true;
            expect(getGfiFeaturesByTileFeatureModule.getGfiFeaturesByTileFeature.calledWith(pickObject));
            expect(tileSetModel.addToHiddenObjects.calledWith(["gmlId"])).to.be.true;
            expect(hiddenObjects.length).to.be.equals(1);
            expect(hiddenObjects[0].name).to.be.equals("gmlId");
        });

        it("selectObject picks object and adds it to hidden object with layer list", () => {
            let hiddenObjects = [];
            const pickObject = new global.Cesium.Cesium3DTileFeature({tileset: {}}),
                tileSetModel = {
                    get: () => "TileSet3D",
                    addToHiddenObjects: sinon.stub()
                },
                layerCollectionStub = sinon.stub(layerCollection, "getLayers").returns([tileSetModel]);

            scene.drillPick = sinon.stub().returns([pickObject]);
            global.Cesium.defined = sinon.stub().returns(true);
            global.Cesium.defaultValue = sinon.stub().returns(false);
            sinon.stub(getGfiFeaturesByTileFeatureModule, "getGfiFeaturesByTileFeature").returns([{
                getProperties: () => ({
                    gmlid: "gmlId"
                })
            }]);

            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            wrapper.vm.selectObject(event);

            hiddenObjects = store.state.Modules.Modeler3D.hiddenObjects;

            expect(layerCollectionStub.called).to.be.true;
            expect(getGfiFeaturesByTileFeatureModule.getGfiFeaturesByTileFeature.calledWith(pickObject));
            expect(tileSetModel.addToHiddenObjects.calledWith(["gmlId"])).to.be.true;
            expect(hiddenObjects.length).to.be.equals(1);
            expect(hiddenObjects[0].name).to.be.equals("gmlId");
            expect(store.state.Modules.Modeler3D.hiddenObjectsWithLayerId[0].name).to.be.equals("gmlId");
        });

        it("showObject shows the hidden object and deletes it from list", () => {
            let hiddenObjects = [];
            const object = {
                    name: "gmlId"
                },
                tileSetModel = {
                    get: () => "TileSet3D",
                    showObjects: sinon.stub()
                },
                layerCollectionStub = sinon.stub(layerCollection, "getLayers").returns([tileSetModel]);

            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            wrapper.vm.showObject(object);

            hiddenObjects = store.state.Modules.Modeler3D.hiddenObjects;

            expect(hiddenObjects.length).to.eql(0);
            expect(layerCollectionStub.called).to.be.true;
            expect(tileSetModel.showObjects.calledWith(["gmlId"])).to.be.true;
        });

        it("should set cursor to \"grab\" when Cesium.defined returns true", async () => {
            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            global.Cesium.defaultValue = () => {
                return new global.Cesium.Entity("entityId");
            };
            store.commit("Modules/Modeler3D/setCurrentModelId", "entityId");
            global.Cesium.defined = sinon.stub().returns(true);

            wrapper.vm.cursorCheck(event);
            expect(document.getElementById("map").style.cursor).to.equal("grab");
        });

        it("should set cursor to \"grab\" when isDrawing is true", async () => {
            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            global.Cesium.defaultValue = () => {
                return new global.Cesium.Entity("otherId");
            };
            store.commit("Modules/Modeler3D/setCurrentModelId", "null");
            global.Cesium.defined = sinon.stub().returns(true);

            wrapper.vm.cursorCheck(event);
            expect(document.getElementById("map").style.cursor).to.equal("pointer");
        });

        it("should set cursor to \"auto\" when Cesium.defined returns false", async () => {
            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            store.commit("Modules/Modeler3D/setCurrentModelId", "otherId");
            global.Cesium.defined = sinon.stub().returns(false);

            wrapper.vm.cursorCheck(event);
            expect(document.getElementById("map").style.cursor).to.equal("auto");
        });

        it("should update the position when moving a cylinder with clampToGround set to true", async () => {
            const entity = entities.getById("entityId");

            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            entity.clampToGround = true;
            store.commit("Modules/Modeler3D/setCurrentModelId", "entityId");
            await wrapper.vm.$nextTick();
            store.commit("Modules/Modeler3D/setCylinderId", 2);
            store.commit("Modules/Modeler3D/setIsDragging", true);
            global.Cesium.defined = sinon.stub().returns(true);

            wrapper.vm.moveCylinder(event);
            expect(wrapper.vm.activeShapePoints[0]).to.eql([11.549606597773037, 48.17285700012215]);
        });

        it("should update the position when moving a cylinder with clampToGround set to false", async () => {
            const entity = entities.getById("entityId");

            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            entity.clampToGround = false;
            store.commit("Modules/Modeler3D/setCurrentModelId", "entityId");
            await wrapper.vm.$nextTick();
            store.commit("Modules/Modeler3D/setCylinderId", 2);
            store.commit("Modules/Modeler3D/setIsDragging", true);
            global.Cesium.defined = sinon.stub().returns(true);
            wrapper.vm.moveCylinder(event);
            expect(wrapper.vm.activeShapePoints[0]).to.eql({
                x: 3739310.9273738265,
                y: 659341.4057539968,
                z: 5107613.232959453
            });
        });

        it("should perform actions when dragging of a cylinder is finished", async () => {
            const entity = entities.getById("entityId");

            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            entity.polygon = false;
            entity.polyline = false;
            store.commit("Modules/Modeler3D/setCurrentModelId", "entityId");
            await wrapper.vm.$nextTick();
            store.commit("Modules/Modeler3D/setCylinderId", 2);
            store.commit("Modules/Modeler3D/setIsDragging", true);

            wrapper.vm.onMouseUp(event);
            expect(store.state.Modules.Modeler3D.isDragging).to.be.false;
            expect(store.state.Modules.Modeler3D.cylinderId).to.eql(null);
            expect(document.getElementById("map").style.cursor).to.equal("grab");
        });
        it("should perform actions when dragging of a drawn object is finished", async () => {
            const entity = entities.getById("entityId");

            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            entity.polygon = false;
            entity.polyline = false;
            store.commit("Modules/Modeler3D/setCurrentModelId", "entityId");
            await wrapper.vm.$nextTick();
            store.commit("Modules/Modeler3D/setIsDragging", true);

            wrapper.vm.onMouseUp(event);
            expect(store.state.Modules.Modeler3D.isDragging).to.be.false;
            expect(document.getElementById("map").style.cursor).to.equal("grab");
        });
        it("should highlight a drawn polygon", async () => {
            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});

            const entity = entities.getById("entityId"),
                generateOutlinesStub = sinon.stub(wrapper.vm, "generateOutlines");

            entity.polygon = {outline: true, outlineColor: "white", material: {
                color: "RED"
            }};
            entity.wasDrawn = true;
            store.commit("Modules/Modeler3D/setCurrentModelId", "entityId");
            await wrapper.vm.$nextTick();
            store.commit("Modules/Modeler3D/setIsDragging", true);

            wrapper.vm.highlightEntity(entity);

            expect(generateOutlinesStub.called).to.be.true;
        });
        it("should highlight a drawn polyline", async () => {
            const entity = entities.getById("entityId");

            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            entity.polyline = {material: {
                color: "white"
            }};
            entity.wasDrawn = true;

            wrapper.vm.highlightEntity(entity);
            await wrapper.vm.$nextTick();
            expect(entity.originalColor).to.eql("white");
            expect(entity.polyline.material.color).to.eql(
                global.Cesium.Color.fromAlpha(global.Cesium.Color.fromCssColorString("RED"), parseFloat(1.0))
            );
        });
        it("should handle the mouse move event for the pov cylinder", async () => {
            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            store.commit("Modules/Modeler3D/setCylinderId", 2);
            await wrapper.vm.$nextTick();

            wrapper.vm.moveHandler();
            expect(document.getElementById("map").style.cursor).to.equal("copy");
            expect(wrapper.vm.currentCartesian).to.eql({
                x: 3739310.9273738265,
                y: 659341.4057539968,
                z: 5107613.232959453
            });
        });

        it("should undo the last non-drawn entity movement when CTRL+Z is pressed", async () => {
            entities.values.push({id: "TestModel", position: {getValue: () => ({x: 200, y: 300, z: 400})}, model: {silhouetteColor: "white"}});

            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            await wrapper.vm.applyEntityMovement({entityId: "TestModel", position: {x: 100, y: 200, z: 300}});

            const entity = entities.getById("TestModel");

            expect(entity.position).to.eql({x: 100, y: 200, z: 300});
        });

        it("should redo the last undone non-drawn entity movement when CTRL+Y is pressed", async () => {
            entities.values.push({id: "TestModel", position: {getValue: () => ({x: 100, y: 200, z: 300})}, model: {silhouetteColor: "white"}});

            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            wrapper.vm.undonePosition = {entityId: "TestModel", position: {x: 200, y: 300, z: 400}};

            await wrapper.vm.applyEntityMovement(wrapper.vm.undonePosition);

            const entity = entities.getById("TestModel");

            expect(entity.position).to.eql({x: 200, y: 300, z: 400});
        });

        it("should generate outlines for the given entity", () => {
            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            const entity = {
                polygon: {
                    hierarchy: {
                        getValue: sinon.stub().returns({
                            positions: [1, 2, 3]
                        })
                    }
                }
            };

            entities.add = sinon.spy();

            wrapper.vm.generateOutlines(entity);

            expect(entities.add.callCount).to.equal(2);
        });

        it("should perform actions when dragging a polygon", async () => {
            const entity = entities.getById("entityId");

            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            entity.clampToGround = true;
            entity.polygon = true;
            entity.polyline = false;
            store.commit("Modules/Modeler3D/setCurrentModelId", "entityId");
            await wrapper.vm.$nextTick();
            store.commit("Modules/Modeler3D/setCylinderId", 2);
            store.commit("Modules/Modeler3D/setIsDragging", true);
            global.Cesium.defined = sinon.stub().returns(true);

            wrapper.vm.onMouseMove(event);
            expect(Modeler3D.actions.movePolyline.called).to.be.false;
            expect(Modeler3D.actions.updatePositionUI.called).to.be.true;
        });
        it("should perform actions when dragging a polyline", async () => {
            const entity = entities.getById("entityId");

            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            entity.polygon = false;
            entity.polyline = true;
            store.commit("Modules/Modeler3D/setCurrentModelId", "entityId");
            await wrapper.vm.$nextTick();
            store.commit("Modules/Modeler3D/setCylinderId", 2);
            store.commit("Modules/Modeler3D/setIsDragging", true);
            global.Cesium.defined = sinon.stub().returns(true);

            wrapper.vm.onMouseMove(event);
            expect(Modeler3D.actions.movePolyline.called).to.be.true;
            expect(Modeler3D.actions.updatePositionUI.called).to.be.true;
        });

        it("should handle the mouse move event for the pov cylinder", async () => {
            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            store.commit("Modules/Modeler3D/setCylinderId", 2);
            await wrapper.vm.$nextTick();

            wrapper.vm.moveHandler();
            expect(document.getElementById("map").style.cursor).to.equal("copy");
            expect(wrapper.vm.currentCartesian).to.eql({
                x: 3739310.9273738265,
                y: 659341.4057539968,
                z: 5107613.232959453
            });
        });

        it("onMouseUp should do nothing if isDragging is false", () => {
            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});

            const setIsDraggingSpy = sinon.spy(wrapper.vm, "setIsDragging");

            Modeler3D.state.isDragging = false;

            wrapper.vm.onMouseUp();
            expect(setIsDraggingSpy.called).to.be.false;
        });
        it("onMouseUp should call expected functions if isDragging is true", () => {
            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});

            const setIsDraggingSpy = sinon.spy(wrapper.vm, "setIsDragging");

            Modeler3D.state.isDragging = true;

            wrapper.vm.onMouseUp();
            expect(setIsDraggingSpy.called).to.be.true;
        });
        it("onMouseUp should update the position of expected importedEntity", () => {
            Modeler3D.state.isDragging = true;
            Modeler3D.state.importedEntities = [{
                entityId: 2,
                position: "foo"
            }];
            Modeler3D.state.currentModelId = 2;

            wrapper = shallowMount(Modeler3DComponent, {global: {
                plugins: [store]
            }});
            wrapper.vm.onMouseUp();
            expect(Modeler3D.state.importedEntities[0].position).to.be.equal("position2");
        });
    });
});
