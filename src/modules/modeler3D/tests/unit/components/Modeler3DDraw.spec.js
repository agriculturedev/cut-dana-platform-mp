import {createStore} from "vuex";
import {expect} from "chai";
import sinon from "sinon";
import {config, shallowMount} from "@vue/test-utils";
import Modeler3DDrawComponent from "../../../components/Modeler3DDraw.vue";
import Modeler3D from "../../../store/indexModeler3D";

config.global.mocks.$t = key => key;

describe("src/modules/modeler3D/components/Modeler3DDraw.vue", () => {
    const globalURL = global.URL,
        mockMapGetters = {
            mouseCoordinate: () => {
                return [11.549606597773037, 48.17285700012215];
            }
        },
        Cartesian3Coordinates = {
            x: 3739310.9273738265,
            y: 659341.4057539968,
            z: 5107613.232959453
        },
        pickRayResult = {
            origin: {},
            direction: {}
        },
        entities = {
            getById: (val) => {
                return entities.values.find(x => x.id === val);
            },
            values: [],
            add: (val) => {
                entities.values.push(val);
                return val;
            },
            remove: (val) => {
                entities.values.splice(entities.values.indexOf(val), 1);
            },
            removeById: (id) => {
                entities.remove(entities.getById(id));
            }
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
        };

    let store,
        originalCreateCylinder,
        wrapper,
        scene;

    beforeEach(() => {
        global.URL = {
            createObjectURL: sinon.stub(),
            revokeObjectURL: sinon.stub()
        };
        originalCreateCylinder = Modeler3D.actions.createCylinder;
        Modeler3D.actions.createCylinder = sinon.spy();
        mapCollection.clear();
        mapCollection.addMap(map3D, "3D");

        entities.values = [];

        scene = {
            camera: {
                getPickRay: sinon.stub().returns(pickRayResult),
                flyTo: sinon.spy()
            },
            globe: {
                pick: sinon.stub().returns({}),
                getHeight: sinon.stub().returns(5),
                ellipsoid: {
                    cartographicToCartesian: () => ({x: 100, y: 100, z: 100})
                }
            },
            sampleHeight: sinon.stub().returns(5)
        };

        global.Cesium = {
            Color: {
                fromBytes: sinon.stub().returns({
                    withAlpha: sinon.stub()
                }),
                fromCssColorString: sinon.stub()
            },
            LabelStyle: {
                FILL: sinon.stub()
            },
            CallbackProperty: sinon.stub(),
            ColorMaterialProperty: sinon.stub(),
            ShadowMode: {
                ENABLED: 1
            },
            defined: sinon.stub().returns(true),
            Cartesian3: class {
                /**
                 * Mock constructor
                 * @param {Number} x - X.
                 * @param {Number} y - Y.
                 * @param {Number} z - Z.
                */
                constructor (x = 0, y = 0, z = 0) {
                    this.x = x;
                    this.y = y;
                    this.z = z;
                }
                /**
                 * Mock static method.
                 * @returns {Number} 0.
                 */
                static distance () {
                    return 123;
                }
                /**
                 * Mock static method.
                 * @returns {Number} 0.
                 */
                static equals () {
                    return 0;
                }
                /**
                 * Mock static method
                 * @returns {void} Nothing.
                 */
                static midpoint () {
                    return {x: 100, y: 100, z: 100};
                }
                /**
                 * Mock static method
                 * @returns {void} Nothing.
                 */
                static add () {
                    return {x: 100, y: 100, z: 100};
                }
                /**
                 * Mock static method
                 * @returns {void} Nothing.
                 */
                static subtract () {
                    return {x: 100, y: 100, z: 100};
                }
                /**
                 * Mock static method
                 * @returns {void} Nothing.
                    */
                static fromRadians () {
                    return {x: 100, y: 100, z: 100};
                }
            },
            Entity: function () {
                this.id = 1;
            },
            Transforms: {
                eastNorthUpToFixedFrame: sinon.stub()
            },
            Matrix4: {
                multiplyByPoint: () => ({x: 100, y: 100, z: 100})
            },
            Cartesian2: sinon.stub(),
            Math: {
                toDegrees: () => 9.99455657887449
            },
            Cartographic: {
                toCartesian: () => ({
                    x: 3739310.9273738265,
                    y: 659341.4057539968,
                    z: 5107613.232959453
                }),
                fromDegrees: () => ({
                    longitude: 0.17443853256965697,
                    latitude: 0.9346599366554966,
                    height: 6.134088691520464
                }),
                fromRadians: () => ({
                    longitude: 0.17443853256965697,
                    latitude: 0.9346599366554966,
                    height: 6.134088691520464
                }),
                fromCartesian: () => ({
                    longitude: 0.17443853256965697,
                    latitude: 0.9346599366554966,
                    height: 6.134088691520464
                })
            }
        };
        global.Cesium.HeightReference = {
            NONE: 0
        };

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
            }
        });
        wrapper = shallowMount(Modeler3DDrawComponent, {
            global: {
                plugins: [store]
            }
        });

        store.commit("Modules/Modeler3D/setCurrentView", "modeler-draw");
        store.commit("Modules/Modeler3D/setCylinderId", "FloatingPointId");
        store.commit("Modules/Modeler3D/setIsDrawing", false);
        store.commit("Modules/Modeler3D/setSelectedDrawType", "");
    });

    afterEach(() => {
        Modeler3D.actions.createCylinder = originalCreateCylinder;
        sinon.restore();
        global.URL = globalURL;
    });

    describe("renders Modeler3DDraw", async () => {
        expect(wrapper.find("#modeler3D-draw-tool").exists()).to.be.true;
        expect(wrapper.find("#tool-modeler3D-geometry").exists()).to.be.true;
        expect(wrapper.find("#modeler3D-draw-name").exists()).to.be.true;
        expect(wrapper.find("#tool-modeler3D-transparency").exists()).to.be.true;
        expect(wrapper.find("#clampToGroundSwitch").exists()).to.be.true;
        expect(wrapper.find("#tool-modeler3D-modelling-interaction").exists()).to.be.true;

        it("renders the template for the polygon attributes", () => {
            expect(wrapper.find("#tool-modeler3D-extrudedHeight").exists()).to.be.true;
            expect(wrapper.find("#tool-modeler3D-fill-color").exists()).to.be.true;
            expect(wrapper.find("#tool-modeler3D-outline-color").exists()).to.be.true;
        });
        it("renders the template for the polyline attributes", () => {
            store.commit("Modules/Modeler3D/setSelectedGeometry", "polygon");

            expect(wrapper.find("#tool-modeler3D-lineWidth").exists()).to.be.true;
            expect(wrapper.find("#tool-modeler3D-extrudedHeight").exists()).to.be.false;
            expect(wrapper.find("#tool-modeler3D-fill-color").exists()).to.be.true;
            expect(wrapper.find("#tool-modeler3D-outline-color").exists()).to.be.false;
        });
    });
    describe("Modeler3DDraw.vue methods", () => {
        it("should update currentPosition in Clamp-to-Ground mode", () => {
            const mouseMoveEvent = {
                endPosition: {x: 0, y: 0}
            };

            entities.values.push({id: "FloatingPointId", positionIndex: 0, cylinder: {length: 4}});

            store.commit("Modules/Modeler3D/setClampToGround", true);
            wrapper.vm.onMouseMove(mouseMoveEvent);

            expect(scene.camera.getPickRay.calledOnceWith(mouseMoveEvent.endPosition)).to.be.true;
            expect(scene.globe.pick.calledOnceWith(pickRayResult, scene)).to.be.true;
            expect(document.body.style.cursor).to.equal("copy");
            expect(wrapper.vm.currentPosition).to.eql({});
            expect(wrapper.vm.activeShapePoints[0]).to.eql({});
        });
        it("should update currentPosition with coordinate transformation in normal mode", () => {
            const mouseMoveEvent = {
                endPosition: {x: 0, y: 0}
            };

            entities.values.push({id: "FloatingPointId", positionIndex: 0, cylinder: {length: 4}});

            store.commit("Modules/Modeler3D/setClampToGround", false);
            wrapper.vm.onMouseMove(mouseMoveEvent);

            expect(document.body.style.cursor).to.equal("copy");
            expect(wrapper.vm.currentPosition).to.eql(Cartesian3Coordinates);
            expect(wrapper.vm.activeShapePoints[0]).to.eql(Cartesian3Coordinates);
        });

        it("should add new geometry position and call drawShape when activeShapePoints length is 1", () => {
            const mockShape = {
                id: 1,
                name: "Mock Shape",
                wasDrawn: true,
                clampToGround: true,
                polygon: {
                    height: 10,
                    extrudedHeight: {
                        getValue: () => 10
                    },
                    hierarchy: {
                        getValue: () => ({positions: [1, 2, 3]})
                    }
                }
            };

            entities.values.push({id: "FloatingPointId", positionIndex: 0, cylinder: {length: 4}});

            store.commit("Modules/Modeler3D/setSelectedDrawType", "polygon");
            store.commit("Modules/Modeler3D/setClampToGround", true);
            entities.values.push(mockShape);
            store.commit("Modules/Modeler3D/setActiveShapePoints", [{x: 100, y: 200, z: 300}]);
            global.Cesium.ShadowMode = {
                ENABLED: 1
            };

            wrapper.vm.addGeometryPosition();

            expect(scene.globe.getHeight.called).to.be.true;
            expect(scene.sampleHeight.called).to.be.false;
            expect(scene.globe.pick.called).to.be.false;
            expect(wrapper.vm.activeShapePoints).to.have.lengthOf(2);
        });
        it("should call addLabel three times when activeShapePoints length is 1 and entity is a polygon", () => {
            entities.values.push({id: "FloatingPointId", positionIndex: 0, cylinder: {length: 4}});
            entities.values.push({
                id: "someId",
                polygon: {
                    height: {
                        getValue: () => 5
                    },
                    extrudedHeight: {
                        getValue: () => 10
                    },
                    hierarchy: {
                        getValue: () => ({positions: [1, 2, 3]})
                    }
                }
            });
            wrapper.vm.shapeId = "someId";
            wrapper.vm.addLabel = sinon.spy();

            store.commit("Modules/Modeler3D/setActiveShapePoints", [{x: 100, y: 200, z: 300}]);

            wrapper.vm.addGeometryPosition();

            expect(wrapper.vm.addLabel.called).to.be.true;
        });
        it("should call addLabel when activeShapePoints length is more than 1", () => {
            entities.values.push({id: "FloatingPointId", positionIndex: 0, cylinder: {length: 4}});
            entities.values.push({id: "someId", polygon: {height: {getValue: () => 5}, extrudedHeight: {getValue: () => 10}}});
            wrapper.vm.shapeId = "someId";
            wrapper.vm.addLabel = sinon.spy();

            store.commit("Modules/Modeler3D/setActiveShapePoints", [{x: 100, y: 200, z: 300},
                {x: 200, y: 300, z: 400}]);

            wrapper.vm.addGeometryPosition();

            expect(wrapper.vm.addLabel.called).to.be.true;
        });

        it("should undo the last geometry position when CTRL+Z is pressed", () => {
            store.commit("Modules/Modeler3D/setActiveShapePoints", [{x: 100, y: 200, z: 300}, {x: 200, y: 300, z: 400}, {x: 300, y: 400, z: 500}, {x: 400, y: 500, z: 600}]);
            store.commit("Modules/Modeler3D/setIsDrawing", true);
            entities.values.push(
                {id: "FloatingPointId", positionIndex: 0, cylinder: {length: 4}},
                {id: "FloatingPointId2", positionIndex: 1, cylinder: {length: 4}},
                {id: "FloatingPointId3", position: {
                    getValue: () => {
                        return {x: 200, y: 300, z: 400};
                    }
                }, positionIndex: 2, cylinder: {length: {getValue: () => 4}}},
                {id: "currentFloatingPoint", positionIndex: 3, cylinder: {length: 4}});

            wrapper.vm.undoGeometryPosition();

            expect(wrapper.vm.activeShapePoints).to.have.lengthOf(3);
            expect(entities.values).to.have.lengthOf(3);
            expect(entities.values[2].id).to.equal("currentFloatingPoint");
        });

        it("should redo the last geometry position when CTRL+Y is pressed", () => {
            store.commit("Modules/Modeler3D/setActiveShapePoints", [{x: 100, y: 200, z: 300}, {x: 200, y: 300, z: 400}, {x: 300, y: 400, z: 500}, {x: 400, y: 500, z: 600}]);
            store.commit("Modules/Modeler3D/setIsDrawing", true);
            entities.values.push(
                {id: "FloatingPointId2", positionIndex: 1, cylinder: {length: 4}},
                {id: "FloatingPointId3", position: {
                    getValue: () => {
                        return {x: 300, y: 400, z: 500};
                    }
                }, positionIndex: 2, cylinder: {length: {getValue: () => 4}}},
                {id: "currentFloatingPoint", positionIndex: 3, cylinder: {length: 4}});

            wrapper.vm.undoGeometryPosition();
            wrapper.vm.redoGeometryPosition();

            expect(wrapper.vm.activeShapePoints).to.have.lengthOf(4);
            expect(wrapper.vm.activeShapePoints[2]).to.eql({x: 300, y: 400, z: 500});
        });

        it("should undo the last label when CTRL+Z is pressed", async () => {
            store.commit("Modules/Modeler3D/setIsDrawing", true);
            const mockLabel1 =
                {
                    position: {x: 100, y: 200, z: 300},
                    id: "2",
                    label: {
                        text: "text1",
                        show: false
                    }
                },
                mockLabel2 =
                {
                    position: {x: 400, y: 500, z: 300},
                    id: "3",
                    label: {
                        text: "text2",
                        show: false
                    }
                },
                mockLabel3 =
                {
                    position: {x: 400, y: 500, z: 300},
                    id: "4",
                    label: {
                        text: "text3",
                        show: false
                    }
                },
                mockEntity = {
                    id: "someId"
                };

            entities.values.push(mockEntity, mockLabel1, mockLabel2, mockLabel3);
            await wrapper.setData({labelList: [mockLabel1, mockLabel2, mockLabel3]});
            await wrapper.setData({dimensions: true, shapeId: "someId"});
            wrapper.vm.undoLabelPosition();
            wrapper.vm.$nextTick();

            expect(wrapper.vm.labelList).to.have.lengthOf(1);
            expect(entities.values).to.have.lengthOf(2);
            expect(entities.values[1].id).to.equal("2");
        });

        it("should redo the last label when CTRL+Y is pressed", async () => {
            store.commit("Modules/Modeler3D/setIsDrawing", true);
            const mockLabel1 =
                {
                    position: {x: 100, y: 200, z: 300},
                    id: "2",
                    label: {
                        text: "text1",
                        show: false
                    }
                },
                mockLabel2 =
                {
                    position: {x: 400, y: 500, z: 300},
                    id: "3",
                    label: {
                        text: "text2",
                        show: false
                    }
                },
                mockLabel3 =
                {
                    position: {x: 400, y: 500, z: 300},
                    id: "4",
                    label: {
                        text: "text3",
                        show: false
                    }
                },
                mockEntity = {
                    id: "someId"
                },
                addLabelSpy = sinon.spy(wrapper.vm, "addLabel");

            entities.values.push(mockEntity, mockLabel1, mockLabel2, mockLabel3);
            await wrapper.setData({labelList: [mockLabel1, mockLabel2, mockLabel3]});
            await wrapper.setData({dimensions: true, shapeId: "someId"});
            wrapper.vm.undoLabelPosition();
            wrapper.vm.$nextTick();
            wrapper.vm.redoLabelPosition();
            wrapper.vm.$nextTick();

            expect(addLabelSpy.calledTwice).to.be.true;
            expect(wrapper.vm.labelList).to.have.lengthOf(3);
            expect(entities.values).to.have.lengthOf(4);
            expect(wrapper.vm.labelList[2].position).to.deep.equal({x: 400, y: 500, z: 300});
        });

        it("should export the GeoJson", () => {
            entities.values = [
                {
                    id: "FloatingPointId",
                    positionIndex: 0,
                    polyline: {
                        material: {
                            color: {
                                getValue: () => {
                                    return "WHITE";
                                }
                            }
                        },
                        positions: {
                            getValue: () => {
                                return [4, 3, 3];
                            }
                        },
                        width: {
                            getValue: () => 2
                        }
                    }
                }
            ];
            wrapper.vm.exportToGeoJson();
            wrapper.vm.downloadGeoJson = sinon.spy();

            expect(wrapper.vm.downloadGeoJson.calledWith(sinon.match(JSON.stringify(sinon.match({
                type: "FeatureCollection",
                features: sinon.match.array
            })))));
        });

        it("should draw shapes when selectedGeometry is 'line' and activeShapePoints has at least 2 points", () => {
            store.commit("Modules/Modeler3D/setSelectedDrawType", "line");
            store.commit("Modules/Modeler3D/setActiveShapePoints", [{x: 100, y: 200, z: 300}, {x: 200, y: 300, z: 400}, {x: 300, y: 400, z: 500}]);
            entities.add = sinon.spy();
            wrapper.vm.drawShape();

            expect(entities.add.calledWith(sinon.match({id: sinon.match.number, polyline: sinon.match.object}))).to.be.true;
        });

        it("should draw shapes when selectedGeometry is 'polygon' and activeShapePoints has at least 3 points", () => {
            store.commit("Modules/Modeler3D/setSelectedDrawType", "polygon");

            store.commit("Modules/Modeler3D/setActiveShapePoints", [
                {x: 100, y: 200, z: 300},
                {x: 200, y: 300, z: 400},
                {x: 300, y: 400, z: 500},
                {x: 400, y: 500, z: 600}
            ]);
            entities.add = sinon.spy();
            wrapper.vm.drawShape();
            expect(entities.add.calledWith(sinon.match({id: sinon.match.number, polygon: sinon.match.object}))).to.be.true;
        });

        it("should add a label to the entities", () => {
            let label = null;
            const labelType = "distance",
                options = {
                    attachedEntity: {id: 1},
                    position: [0, 0, 0]
                };

            entities.add = sinon.spy();
            wrapper.vm.addLabel(labelType, options);

            expect(entities.add.calledOnce).to.be.true;
            label = entities.add.firstCall.args[0];

            expect(label.label).to.exist;
            expect(label.attachedEntityId).to.equal(options.attachedEntity.id);
            expect(label.position).to.equal(options.position);
        });

        it("should generate the remaining corners of a rectangle given one corner", () => {
            const corner = Cesium.Cartographic.fromDegrees(9, 53, 5),
                corners = wrapper.vm.generateRectangleCorners(corner);

            expect(corners).to.be.an("array").that.has.lengthOf(4);
            corners.forEach(cr => {
                expect(cr).to.be.an("object").that.has.all.keys("x", "y", "z");
            });
        });

        it("should toggle showDimensions and call generateLabels if showDimensions is true", () => {
            const ent = {
                    id: "someId",
                    showDimensions: false
                },
                generateLabelsStub = sinon.stub(wrapper.vm, "generateLabels");

            entities.values.push(ent);
            wrapper.vm.toggleDimensions("someId");

            expect(ent.showDimensions).to.be.true;
            expect(generateLabelsStub.calledWith(ent)).to.be.true;
        });

        it("should toggle showDimensions and call removeLabels if showDimensions is false", () => {
            const ent = {
                    id: "someId",
                    showDimensions: true
                },
                removeLabelsStub = sinon.stub(wrapper.vm, "removeLabels");

            entities.values.push(ent);
            wrapper.vm.toggleDimensions("someId");

            expect(ent.showDimensions).to.be.false;
            expect(removeLabelsStub.calledWith(ent)).to.be.true;
        });

        it("should generate labels for the given entity", () => {
            const ent = {
                    polygon: {
                        hierarchy: {
                            getValue: sinon.stub().returns({
                                positions: [1, 2, 3]
                            })
                        }
                    }
                },
                addLabelStub = sinon.stub(wrapper.vm, "addLabel");

            wrapper.vm.generateLabels(ent);

            expect(addLabelStub.callCount).to.equal(5);
        });
    });
});
