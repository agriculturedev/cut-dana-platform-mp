import {createStore} from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount, mount} from "@vue/test-utils";
import Modeler3DEntityModelComponent from "../../../components/Modeler3DEntityModel.vue";
import Modeler3D from "../../../store/indexModeler3D";

config.global.mocks.$t = key => key;

describe("src/modules/modeler3D/components/Modeler3DEntityModel.vue", () => {
    const provide = {
            toggleDimensions: () => {
                sinon.stub();
            }
        },
        entity = {
            id: 1,
            orientation: null,
            clampToGround: true,
            position: {
                getValue: () => {
                    return {x: 100, y: 100, z: 100};
                }
            },
            model: {scale: 1},
            originalColor: {getValue: () => ({red: 0, green: 0, blue: 0, alpha: 1})}
        },
        entities = {
            getById: sinon.stub().returns(entity),
            values: [
                {
                    id: 1,
                    cylinder: {length: {_value: 10}},
                    position: {getValue: () => ({x: 10, y: 20, z: 30})}
                },
                {
                    id: 2,
                    cylinder: {length: {_value: 10}},
                    position: {getValue: () => ({x: 20, y: 30, z: 10})}
                },
                {
                    id: 3,
                    cylinder: {length: {_value: 10}},
                    position: {getValue: () => ({x: 30, y: 10, z: 20})}
                }
            ]
        },
        scene = {
            globe: {getHeight: () => 5},
            sampleHeight: () => 5,
            requestRender: sinon.stub()
        },
        map3D = {
            id: "1",
            mode: "3D",
            getDataSourceDisplay: () => {
                return {
                    defaultDataSource: {
                        entities: entities
                    }
                };
            },
            getCesiumScene: () => scene
        };
    let store,
        wrapper,
        origUpdateEntityPosition,
        origUpdatePositionUI,
        origEditLayout;

    beforeEach(() => {
        mapCollection.clear();
        mapCollection.addMap(map3D, "3D");

        global.Cesium = {
            PolygonGraphics: function (options) {
                this.extrudedHeight = {
                    _value: options.extrudedHeight,
                    getValue: () => this.extrudedHeight._value
                };
                this.height = {
                    _value: options.height,
                    getValue: () => this.height._value
                };
            },
            Cartographic: {
                fromCartesian: () => ({longitude: 9, latitude: 50, height: 5}),
                toCartesian: () => ({x: 10, y: 20, z: 30})
            },
            Cartesian3: {
                distance: () => 10
            },
            Color: {
                floatToByte: (val) => {
                    return val;
                },
                fromCssColorString: () => {
                    return {red: 0, green: 0, blue: 0, alpha: 1};
                }
            },
            ColorBlendMode: {
                HIGHLIGHT: 0
            },
            Math: {
                toRadians: (val) => {
                    return val / 10;
                }
            },
            Transforms: {
                headingPitchRollQuaternion: sinon.stub().returns(22)
            }
        };
        origEditLayout = Modeler3D.actions.editLayout;
        Modeler3D.actions.editLayout = sinon.spy();
        origUpdateEntityPosition = Modeler3D.actions.updateEntityPosition;
        origUpdatePositionUI = Modeler3D.actions.updatePositionUI;
        Modeler3D.actions.updateEntityPosition = sinon.spy();
        Modeler3D.actions.updatePositionUI = sinon.spy();
        entity.wasDrawn = false;

        store = createStore({
            modules: {
                namespaced: true,
                Modules: {
                    namespaced: true,
                    modules: {
                        Modeler3D
                    }
                }
            }
        });

        store.commit("Modules/Modeler3D/setProjections", [{
            "title": "WGS84_Lat-Lon (Grad, Dezimal), EPSG 4326",
            "projName": "longlat",
            "name": "EPSG:4326-DG",
            "id": "http://www.opengis.net/gml/srs/epsg.xml#4326-DG",
            "epsg": "EPSG:4326"
        },
        {
            "title": "WGS 84 (long/lat)",
            "projName": "longlat",
            "name": "http://www.opengis.net/gml/srs/epsg.xml#4326",
            "id": "http://www.opengis.net/gml/srs/epsg.xml#4326",
            "epsg": "EPSG:4326"
        },
        {
            "title": "ETRS89/UTM 32N",
            "projName": "utm",
            "name": "http://www.opengis.net/gml/srs/epsg.xml#25832",
            "id": "http://www.opengis.net/gml/srs/epsg.xml#25832",
            "epsg": "EPSG:25832"
        }]);

        store.commit("Modules/Modeler3D/setCurrentModelId", 1);
        store.commit("Modules/Modeler3D/setCurrentProjection", {id: "http://www.opengis.net/gml/srs/epsg.xml#25832", name: "EPSG:25832", projName: "utm", epsg: "EPSG:25832"});
        store.commit("Modules/Modeler3D/setImportedModels", [{id: 1, name: "modelName", heading: 0, scale: 1}]);
    });

    afterEach(() => {
        Modeler3D.actions.updateEntityPosition = origUpdateEntityPosition;
        Modeler3D.actions.updatePositionUI = origUpdatePositionUI;
        Modeler3D.actions.editLayout = origEditLayout;
        store.commit("Modules/Modeler3D/setCurrentProjection", {id: "http://www.opengis.net/gml/srs/epsg.xml#25832", name: "EPSG:25832", projName: "utm", epsg: "EPSG:25832"});
        store.commit("Modules/Modeler3D/setImportedEntities", []);

        sinon.restore();
    });

    it("renders Modeler3DEntityModel", () => {
        wrapper = mount(Modeler3DEntityModelComponent, {provide, global: {
            plugins: [store]
        }});

        expect(wrapper.find("#modeler3D-entity-view").exists()).to.be.true;
        expect(wrapper.find("#projection").exists()).to.be.true;
        expect(wrapper.find("#position").exists()).to.be.true;
        expect(wrapper.find("#easting").exists()).to.be.true;
        expect(wrapper.find("#northing").exists()).to.be.true;
        expect(wrapper.find("#height").exists()).to.be.true;
        expect(wrapper.find("#rotation").exists()).to.be.true;
        expect(wrapper.find("#scale").exists()).to.be.true;
    });

    it("renders projection warning with id 4326 and hides buttons", async () => {
        wrapper = shallowMount(Modeler3DEntityModelComponent, {provide, global: {
            plugins: [store]
        }});

        store.commit("Modules/Modeler3D/setCurrentProjection", {id: "http://www.opengis.net/gml/srs/epsg.xml#4326"});
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#modeler3D-entity-view").exists()).to.be.true;
        expect(wrapper.find("#projection-warning").exists()).to.be.true;
        expect(wrapper.find("#easting-buttons").exists()).to.be.false;
        expect(wrapper.find("#northing-buttons").exists()).to.be.false;
    });

    it("renders height buttons when adaptHeight is unchecked", async () => {
        wrapper = mount(Modeler3DEntityModelComponent, {provide, global: {
            plugins: [store]
        }});

        store.commit("Modules/Modeler3D/setAdaptToHeight", false);
        await wrapper.vm.$nextTick();

        expect(wrapper.find("#modeler3D-entity-view").exists()).to.be.true;
        expect(wrapper.find("#height-buttons").exists()).to.be.true;
    });

    it("has initially selected projection \"EPSG:25832\"", async () => {
        let options = null,
            selected = null,
            projWrapper = null;

        const projections = store.state.Modules.Modeler3D.projections;

        wrapper = mount(Modeler3DEntityModelComponent, {provide, global: {
            plugins: [store]
        }});

        projWrapper = wrapper.find("#projection");
        options = projWrapper.findAll("option");
        expect(options.length).to.equal(projections.length);

        selected = options.filter(o => o.attributes().selected === "true");
        expect(selected.length).to.equal(1);
        expect(selected.at(0).attributes().value).to.equal("http://www.opengis.net/gml/srs/epsg.xml#25832");
    });

    it("renders the buttons from the options section", async () => {
        entity.wasDrawn = true;
        wrapper = mount(Modeler3DEntityModelComponent, {
            provide,
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#copy-entity").exists()).to.be.true;
        expect(wrapper.find("#measure-entity").exists()).to.be.true;
        expect(wrapper.find("#rotate-entity").exists()).to.be.true;
    });

    describe("Modeler3DEntityModel.vue methods", () => {
        it("method selectionChanged sets currentProjection", () => {
            const value = "http://www.opengis.net/gml/srs/epsg.xml#4326",
                event = {
                    target: {
                        value: value
                    }
                };

            wrapper = shallowMount(Modeler3DEntityModelComponent, {provide, global: {
                plugins: [store]
            }});
            wrapper.vm.selectionChanged(event);
            expect(store.state.Modules.Modeler3D.currentProjection.name).to.be.equals(value);
            expect(store.state.Modules.Modeler3D.currentProjection.projName).to.be.equals("longlat");
        });

        it("method checkedAdapt sets adaptToHeight and updates entity position", () => {
            wrapper = shallowMount(Modeler3DEntityModelComponent, {provide, global: {
                plugins: [store]
            }});
            wrapper.vm.checkedAdapt(true);

            expect(store.state.Modules.Modeler3D.adaptToHeight).to.be.equals(true);
            expect(Modeler3D.actions.updateEntityPosition.called).to.be.true;
        });

        it("label returns correct path", () => {
            const key = "key";
            let value = "http://www.opengis.net/gml/srs/epsg.xml#4326",
                event = {
                    target: {
                        value: value
                    }
                },
                ret = "";

            wrapper = shallowMount(Modeler3DEntityModelComponent, {provide, global: {
                plugins: [store]
            }});
            wrapper.vm.selectionChanged(event);

            ret = wrapper.vm.getLabel(key);
            expect(ret).to.be.equals("modules.modeler3D.entity.projections.hdms.key");

            value = "http://www.opengis.net/gml/srs/epsg.xml#25832";
            event = {
                target: {
                    value: value
                }
            };
            wrapper.vm.selectionChanged(event);
            ret = wrapper.vm.getLabel(key);
            expect(ret).to.be.equals("modules.modeler3D.entity.projections.cartesian.key");

            value = null;
            event = {
                target: {
                    value: value
                }
            };
            wrapper.vm.selectionChanged(event);
            ret = wrapper.vm.getLabel(key);
            expect(ret).to.be.equals("modules.modeler3D.entity.projections.cartesian.key");
        });

        it("updates the extruded height of the polygon and adjusts cylinders", async () => {
            entity.polygon = new global.Cesium.PolygonGraphics({
                extrudedHeight: 20,
                height: 5
            });
            wrapper = shallowMount(Modeler3DEntityModelComponent, {provide, global: {
                plugins: [store]
            }});
            wrapper.vm.extrudedHeightString = "25";

            await wrapper.vm.$nextTick();

            expect(store.state.Modules.Modeler3D.extrudedHeight).to.eql(25);
            expect(entities.values[0].cylinder.length).to.eql(30);
        });

        it("updates the new fill color of the polygon", () => {
            entity.originalColor = {red: 0, green: 0, blue: 0, alpha: 1};
            wrapper = shallowMount(Modeler3DEntityModelComponent, {provide, global: {
                plugins: [store]
            }});
            wrapper.vm.editedFillColor = "#ff0000";

            expect(store.state.Modules.Modeler3D.newFillColor).to.eql("#ff0000");
            expect(Modeler3D.actions.editLayout.called).to.be.true;
            expect(Modeler3D.actions.editLayout.firstCall.args[1]).to.eql("fillColor");
        });

        it("updates the new stroke color of the polygon", () => {
            wrapper = shallowMount(Modeler3DEntityModelComponent, {provide, global: {
                plugins: [store]
            }});
            wrapper.vm.editedStrokeColor = "#ff0000";

            expect(store.state.Modules.Modeler3D.newStrokeColor).to.eql("#ff0000");
            expect(Modeler3D.actions.editLayout.called).to.be.true;
            expect(Modeler3D.actions.editLayout.firstCall.args[1]).to.eql("strokeColor");
        });

        it("rotates the entity model based on input", () => {
            global.Cesium.HeadingPitchRoll = sinon.spy();

            wrapper = shallowMount(Modeler3DEntityModelComponent, {provide, global: {
                plugins: [store]
            }});
            wrapper.vm.rotationString = "90";

            expect(global.Cesium.Transforms.headingPitchRollQuaternion.calledOnce).to.be.true;
            expect(entity.orientation).to.eql(22);
        });

        it("changes the scale of the entity model", () => {
            wrapper = shallowMount(Modeler3DEntityModelComponent, {provide, global: {
                plugins: [store]
            }});
            wrapper.vm.scaleString = "2";

            expect(store.state.Modules.Modeler3D.scale).to.eql(2);
            expect(entity.model.scale).to.eql(2);
        });

        it("changes coordinates of the entity", () => {
            wrapper = shallowMount(Modeler3DEntityModelComponent, {provide, global: {
                plugins: [store]
            }});
            wrapper.vm.eastingString = "120.50";

            wrapper.vm.updateCoords(wrapper.vm.eastingString, "east");

            expect(store.state.Modules.Modeler3D.coordinateEasting).to.eql(120.5);
            expect(Modeler3D.actions.updateEntityPosition.called).to.be.true;

            wrapper.vm.northingString = "150.00";

            wrapper.vm.updateCoords(wrapper.vm.northingString, "north");

            expect(store.state.Modules.Modeler3D.coordinateNorthing).to.eql(150);
            expect(Modeler3D.actions.updateEntityPosition.called).to.be.true;

            wrapper.vm.heightString = "10.20";

            expect(store.state.Modules.Modeler3D.height).to.eql(10.2);
            expect(Modeler3D.actions.updateEntityPosition.called).to.be.true;
        });

        it("updates width dimension of the entity", async () => {
            wrapper = shallowMount(Modeler3DEntityModelComponent, {provide, global: {
                plugins: [store]
            }});
            const updateRectangleDimensionsStub = sinon.stub(wrapper.vm, "updateRectangleDimensions");

            wrapper.vm.widthString = "120.50";

            await wrapper.vm.$nextTick();
            expect(updateRectangleDimensionsStub.called).to.be.true;
        });
        it("updates depth dimension of the entity", async () => {
            wrapper = shallowMount(Modeler3DEntityModelComponent, {provide, global: {
                plugins: [store]
            }});
            const updateRectangleDimensionsStub = sinon.stub(wrapper.vm, "updateRectangleDimensions");

            wrapper.vm.depthString = "150.00";

            await wrapper.vm.$nextTick();
            expect(updateRectangleDimensionsStub.called).to.be.true;
        });
        describe("resetImportedModels", () => {
            it("should not reset the imported models", async () => {
                wrapper = shallowMount(Modeler3DEntityModelComponent, {global: {
                    plugins: [store]
                }});

                const importedEntities = [
                    {
                        "blob": "",
                        "blobType": "model/gltf-binary",
                        "fileName": "Cottage",
                        "entityId": 1,
                        "rotation": 0,
                        "scale": 1,
                        "position": {
                            "x": 3739809.3423645124,
                            "y": 659051.6132088607,
                            "z": 5107288.342735399
                        }
                    }
                ];

                store.commit("Modules/Modeler3D/setImportedEntities", importedEntities);
                await wrapper.vm.$nextTick();

                await wrapper.vm.resetImportedModels(importedEntities, "", 1, "rotation");
                expect(wrapper.vm.importedEntities[0].rotation).to.be.equal(0);
                expect(wrapper.vm.importedEntities[0].scale).to.be.equal(1);

                await wrapper.vm.resetImportedModels(importedEntities, 0, "", "rotation");
                expect(wrapper.vm.importedEntities[0].rotation).to.be.equal(0);
                expect(wrapper.vm.importedEntities[0].scale).to.be.equal(1);

                await wrapper.vm.resetImportedModels(importedEntities, 0, 1, 0);
                expect(wrapper.vm.importedEntities[0].rotation).to.be.equal(0);
                expect(wrapper.vm.importedEntities[0].scale).to.be.equal(1);

                await wrapper.vm.resetImportedModels(importedEntities, 0, 1, "test");
                expect(wrapper.vm.importedEntities[0].rotation).to.be.equal(0);
                expect(wrapper.vm.importedEntities[0].scale).to.be.equal(1);
            });

            it("should reset the imported models", async () => {
                wrapper = shallowMount(Modeler3DEntityModelComponent, {global: {
                    plugins: [store]
                }});

                const importedEntities = [
                    {
                        "blob": "",
                        "blobType": "model/gltf-binary",
                        "fileName": "Cottage",
                        "entityId": 1,
                        "rotation": 0,
                        "scale": 1,
                        "position": {
                            "x": 3739809.3423645124,
                            "y": 659051.6132088607,
                            "z": 5107288.342735399
                        }
                    }
                ];

                store.commit("Modules/Modeler3D/setImportedEntities", importedEntities);
                await wrapper.vm.$nextTick();

                await wrapper.vm.resetImportedModels(importedEntities, 90, 1, "rotation");
                expect(wrapper.vm.importedEntities[0].rotation).to.be.equal(90);

                await wrapper.vm.resetImportedModels(importedEntities, 1.5, 1, "scale");
                expect(wrapper.vm.importedEntities[0].scale).to.be.equal(1.5);
            });
        });
    });
});
