import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actionsModeler3D";
import store from "../../../../../app-store";
import proj4 from "proj4";
import blobHandler from "../../../js/blob";
import {nextTick} from "vue";

describe("Actions", () => {
    let entity,
        entities,
        scene,
        getters;
    const polygon = {
            polygon: {
                height: 5,
                extrudedHeight: 25
            }
        },
        cylinders = [
            {
                position: {x: 11, y: 21, z: 31},
                positionIndex: 0,
                cylinder: {
                    length: 5
                }
            },
            {
                position: {x: 12, y: 22, z: 32},
                positionIndex: 1,
                cylinder: {
                    length: 5
                }
            },
            {
                position: {x: 13, y: 23, z: 33},
                positionIndex: 2,
                cylinder: {
                    length: 5
                }
            }
        ],
        map3D = {
            id: "1",
            mode: "3D",
            getCesiumScene: () => scene,
            getDataSourceDisplay: () => ({
                defaultDataSource: {
                    entities: entities
                }
            }),
            getOlMap: () => ({
                getView: () => ({
                    getProjection: () => ({
                        getCode: () => "EPSG:25832"
                    })
                })
            })
        };

    beforeEach(() => {
        mapCollection.clear();
        mapCollection.addMap(map3D, "3D");

        global.Cesium = {
            PolylineGraphics: function (options) {
                this.width = {
                    _value: options.width,
                    getValue: () => this.width._value
                };
            },
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
            ModelGraphics: function (options) {
                this.scale = {
                    _value: options.scale,
                    getValue: () => this.scale._value
                };
            },
            CallbackProperty: function () {
                this.callback = () => ({x: 10, y: 20, z: 30});
                this.getValue = () => this.callback();
            },
            Cartesian3: class {
                /**
                 * Represents a Cartesian3 object.
                 */
                constructor () {
                    this.x = 0;
                    this.y = 0;
                    this.z = 0;
                }
                static fromDegrees = () => ({
                    x: 3739310.9273738265,
                    y: 659341.4057539968,
                    z: 5107613.232959453
                });
                static fromRadians = () => ({
                    x: 3739310.9273738265,
                    y: 659341.4057539968,
                    z: 5107613.232959453
                });
                static subtract = (pos1, pos2, res) => {
                    res.x = pos1.x - pos2.x;
                    res.y = pos1.y - pos2.y;
                    res.z = pos1.z - pos2.z;
                    return res;
                };
                static add = (pos1, pos2, res) => {
                    res.x = pos1.x + pos2.x;
                    res.y = pos1.y + pos2.y;
                    res.z = pos1.z + pos2.z;
                    return res;
                };
                static cross = (pos1, pos2, res) => {
                    res.x = pos1.y * pos2.z - pos1.z * pos2.y;
                    res.y = pos1.z * pos2.x - pos1.x * pos2.z;
                    res.z = pos1.x * pos2.y - pos1.y * pos2.x;
                    return res;
                };
                static magnitude = (pos) => Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
                static distance = () => 123;
                static midpoint = () => ({x: 100, y: 100, z: 100});
            },
            Cartographic: class {
                /**
                 * Represents a Cartographic object.
                 */
                constructor () {
                    this.longitude = 0;
                    this.latitude = 0;
                    this.height = 0;
                }
                static fromCartesian = () => ({
                    longitude: 0.17443853256965697,
                    latitude: 0.9346599366554966,
                    height: 6.134088691520464
                });
                static toCartesian = () => ({
                    x: 10,
                    y: 20,
                    z: 30
                });
                static fromDegrees = () => ({
                    longitude: 0.17443853256965697,
                    latitude: 0.9346599366554966,
                    height: 6.134088691520464
                });
            },
            Transforms: {
                eastNorthUpToFixedFrame: () => ({x: 10, y: 20, z: 30})
            },
            Entity: class {
                /**
                 * Creates an entity.
                 * @param {Object} options The options
                 */
                constructor (options) {
                    return {
                        ...options
                    };
                }
            },
            Matrix4: class {
                /**
                 * Represents a Matrix4 object.
                 */
                constructor () {
                    return {
                        0: 1, 1: 0, 2: 0, 3: 0,
                        4: 0, 5: 1, 6: 0, 7: 0,
                        8: 0, 9: 0, 10: 1, 11: 0,
                        12: 0, 13: 0, 14: 0, 15: 1
                    };
                }
                static multiplyByPoint = () => ({x: 10, y: 20, z: 30});
                static inverse = () => new Cesium.Matrix4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
            },
            PolygonPipeline: {
                triangulate: () => [0, 1, 2]
            },
            Math: {
                toDegrees: () => 9.99455657887449,
                toRadians: () => 0.97
            }
        };

        store.state.Maps.mode = "3D";
        store.getters = {
            "Maps/mode": store.state.Maps.mode
        };

        scene = {
            globe: {
                getHeight: () => 5.7896
            },
            sampleHeight: () => 9
        };
        entities = {
            add: sinon.stub().callsFake((ent) => {
                entities.values.push(ent);
                return ent;
            }),
            getById: sinon.spy(() => entity),
            removeById: sinon.spy(),
            remove: sinon.spy(),
            values: []
        };
    });
    afterEach(() => {
        entity = undefined;
        sinon.restore();
        entities.values = [];

    });
    describe("deleteEntity", () => {
        it("should delete the entity from list and entityCollection", () => {
            const dispatch = sinon.spy(),
                commit = sinon.spy(),
                state = {importedModels: [{id: 1}]},
                id = 1;

            entities.getById = sinon.stub().returns({id: id});

            actions.deleteEntity({state, dispatch, commit}, id);

            expect(dispatch.calledWith("removeCylinders")).to.be.true;
            expect(commit.firstCall.calledWith("setActiveShapePoints", [])).to.be.true;
            expect(commit.secondCall.calledWith("setCylinderId", null)).to.be.true;
            expect(commit.thirdCall.calledWith("setCurrentModelId", null)).to.be.true;
            expect(entities.removeById.calledWith(1)).to.be.true;
        });

        it("should not delete the entity when not found in list", () => {
            const dispatch = sinon.spy(),
                commit = sinon.spy(),
                state = {importedModels: [{id: 5}]},
                id = 1;

            actions.deleteEntity({state, dispatch, commit}, id);

            expect(dispatch.called).to.be.false;
            expect(commit.called).to.be.false;
            expect(entities.removeById.called).to.be.false;
        });
    });

    // describe("confirmDeletion", () => {
    //     it("should open the modal dialog to confirm action", () => {
    //         const dispatch = sinon.spy(),
    //             id = 1;

    //         store.dispatch = sinon.spy();
    //         getters = {
    //             getModelNameById: sinon.stub().returns("House")
    //         };

    //         actions.confirmDeletion({dispatch, getters}, id);
    //         expect(store.dispatch.firstCall.args[0]).to.equal("ConfirmAction/addSingleAction");
    //     });
    // });

    describe("changeVisibility", () => {
        it("should change the entities show attribute", () => {
            const model = {
                id: "someId",
                show: false
            };

            entity = {
                id: "someId",
                show: false
            };

            actions.changeVisibility({}, model);

            expect(model.show).to.be.true;
            expect(entity.show).to.be.true;
        });
    });

    describe("newProjectionSelected", () => {
        it("should set the current projection and dispatch 'updatePositionUI'", () => {
            const dispatch = sinon.spy(),
                commit = sinon.spy(),
                value = "projectionId";

            getters = {getProjectionById: sinon.stub().returns({id: "projectionId"})};

            actions.newProjectionSelected({dispatch, commit, getters}, value);
            expect(commit.calledWith("setCurrentProjection", {id: "projectionId"})).to.be.true;
            expect(dispatch.calledWith("updatePositionUI")).to.be.true;
        });
    });

    describe("updateEntityPosition", () => {
        it("should update the entity position when it exists", () => {
            const dispatch = sinon.spy(),
                state = {
                    currentModelId: "entityId",
                    currentModelPosition: {x: 10, y: 20, z: 30}
                };

            entity = {position: {}};

            actions.updateEntityPosition({dispatch, state});

            expect(entities.getById.calledWith("entityId")).to.be.true;
            expect(dispatch.calledWith("transformToCartesian")).to.be.true;
            expect(entities.getById().position).to.deep.equal({x: 10, y: 20, z: 30});
        });

        describe("updateEntityPosition with polygons", () => {
            const state = {
                currentModelId: "polygonId",
                currentModelPosition: {x: 10, y: 20, z: 30}
            };

            it("should update the polygon position clamped to ground when it exists", () => {
                const dispatch = sinon.spy();

                entities.values = cylinders;
                polygon.clampToGround = true;
                entity = polygon;

                actions.updateEntityPosition({dispatch, state});

                expect(entities.getById.calledWith("polygonId")).to.be.true;
                expect(dispatch.calledWith("transformToCartesian")).to.be.true;
                expect(dispatch.calledWith("movePolygon", {entityId: "polygonId", position: {x: 10, y: 20, z: 30}})).to.be.true;
            });

            it("should update the polygon position not clamped to ground when it exists", () => {
                const dispatch = sinon.spy();

                entities.values = cylinders;
                polygon.clampToGround = false;
                entity = polygon;

                actions.updateEntityPosition({dispatch, state});

                expect(entities.getById.calledWith("polygonId")).to.be.true;
                expect(dispatch.calledWith("transformToCartesian")).to.be.true;
                expect(dispatch.calledWith("movePolygon", {entityId: "polygonId", position: {x: 10, y: 20, z: 30}})).to.be.true;
            });
        });

        it("should not update the entity position when it doesn't exist", () => {
            const dispatch = sinon.spy(),
                state = {currentModelId: "nonExistentId"};

            actions.updateEntityPosition({dispatch, state});

            expect(entities.getById.calledWith("nonExistentId")).to.be.true;
            expect(dispatch.calledWith("transformToCartesian")).to.be.false;
        });
    });

    describe("updatePositionUI", () => {
        it("should transform entity position when it exists", () => {
            const dispatch = sinon.spy(),
                commit = sinon.spy(),
                state = {
                    currentModelId: "entityId"
                };

            entity = {position: {getValue: () => ({x: 10, y: 20, z: 30})}};

            actions.updatePositionUI({commit, dispatch, state});

            expect(entities.getById.calledWith("entityId")).to.be.true;
            expect(dispatch.calledWith("transformFromCartesian", {x: 10, y: 20, z: 30})).to.be.true;
            expect(commit.called).to.be.false;
        });

        it("should commit height when entity is polygon", () => {
            const dispatch = sinon.spy(),
                commit = sinon.spy(),
                state = {
                    currentModelId: "polygonId"
                };

            entity = {polygon: new Cesium.PolygonGraphics({height: 5})};
            getters = {
                getCenterFromGeometry: sinon.stub().returns({x: 10, y: 20, z: 30})
            };

            actions.updatePositionUI({commit, dispatch, state, getters});

            expect(entities.getById.calledWith("polygonId")).to.be.true;
            expect(dispatch.calledWith("transformFromCartesian", {x: 10, y: 20, z: 30})).to.be.true;
            expect(commit.calledWith("setHeight", 5)).to.be.true;
        });

        it("should not transform entity position when it doesn't exist", () => {
            const dispatch = sinon.spy(),
                commit = sinon.spy(),
                state = {
                    currentModelId: "nonExistentId"
                };

            getters = {
                getCenterFromGeometry: sinon.stub().returns(undefined)
            };

            actions.updatePositionUI({dispatch, state, getters});

            expect(entities.getById.calledWith("nonExistentId")).to.be.true;
            expect(dispatch.calledWith("transformFromCartesian")).to.be.false;
            expect(commit.called).to.be.false;
        });
    });

    describe("updateUI", () => {
        it("should update the entity UI when entity is a polygon", () => {
            const commit = sinon.spy(),
                dispatch = sinon.spy(),
                state = {currentModelId: "polygonId"};

            entity = {
                clampToGround: true,
                polygon: new Cesium.PolygonGraphics({
                    extrudedHeight: 25,
                    height: 10
                })
            };

            actions.updateUI({commit, dispatch, state});

            expect(entities.getById.calledWith("polygonId")).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setAdaptToHeight");
            expect(commit.firstCall.args[1]).to.be.true;
            expect(commit.secondCall.args[0]).to.equal("setExtrudedHeight");
            expect(commit.secondCall.args[1]).to.equal(15);
            expect(dispatch.calledWith("updatePositionUI"));
        });

        it("should update the entity UI when entity is a polyline", () => {
            const commit = sinon.spy(),
                dispatch = sinon.spy(),
                state = {currentModelId: "polylineId"};

            entity = {
                clampToGround: true,
                polyline: new Cesium.PolylineGraphics({
                    width: 20
                })
            };

            actions.updateUI({commit, dispatch, state});

            expect(entities.getById.calledWith("polylineId")).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setAdaptToHeight");
            expect(commit.firstCall.args[1]).to.be.true;
            expect(commit.secondCall.args[0]).to.equal("setLineWidth");
            expect(commit.secondCall.args[1]).to.equal(20);
            expect(dispatch.calledWith("updatePositionUI"));
        });

        it("should update the entity UI when entity is a model", () => {
            const commit = sinon.spy(),
                dispatch = sinon.spy(),
                state = {
                    currentModelId: "modelId",
                    importedModels: [{id: "modelId", heading: 90}]
                };

            entity = {
                id: "modelId",
                clampToGround: true,
                model: new Cesium.ModelGraphics({
                    scale: 2
                })
            };

            actions.updateUI({commit, dispatch, state});

            expect(entities.getById.calledWith("modelId")).to.be.true;
            expect(commit.firstCall.args[0]).to.equal("setAdaptToHeight");
            expect(commit.firstCall.args[1]).to.be.true;
            expect(commit.secondCall.args[0]).to.equal("setRotation");
            expect(commit.secondCall.args[1]).to.equal(90);
            expect(commit.thirdCall.args[0]).to.equal("setScale");
            expect(commit.thirdCall.args[1]).to.equal(2);
            expect(dispatch.calledWith("updatePositionUI"));
        });
    });

    describe("transformFromCartesian", () => {
        proj4.defs("EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
        it("should transform Cartesian3 coordinates to the currently selected projection", () => {
            const commit = sinon.spy(),
                state = {
                    currentProjection: proj4("EPSG:4326")
                },
                entityPosition = {x: 3739808.2763608, y: 659066.6974853853, z: 5107286.890340484};

            actions.transformFromCartesian({state, commit}, entityPosition);

            expect(commit.firstCall.args[0]).to.equal("setCoordinateEasting");
            expect(commit.firstCall.args[1]).to.eql(9.99455657887449);
            expect(commit.secondCall.args[0]).to.equal("setCoordinateNorthing");
            expect(commit.secondCall.args[1]).to.eql(9.99455657887449);
            expect(commit.thirdCall.args[0]).to.equal("setHeight");
            expect(commit.thirdCall.args[1]).to.eql(6.134088691520464);

        });

        it("should transform Cartesian3 coordinates to the currently selected projection with different conditions", () => {
            const commit = sinon.spy(),
                state = {
                    currentProjection: proj4("EPSG:25832")
                },
                entityPosition = {x: 3739808.2763608, y: 659066.6974853853, z: 5107286.890340484};

            actions.transformFromCartesian({state, commit}, entityPosition);

            expect(commit.firstCall.args[0]).to.equal("setCoordinateEasting");
            expect(commit.firstCall.args[1]).to.eql(609005.9265606481);
            expect(commit.secondCall.args[0]).to.equal("setCoordinateNorthing");
            expect(commit.secondCall.args[1]).to.eql(1104974.8560725104);
            expect(commit.thirdCall.args[0]).to.equal("setHeight");
            expect(commit.thirdCall.args[1]).to.eql(6.134088691520464);
        });
    });

    describe("transformToCartesian", () => {
        proj4.defs("EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
        it("should transform coordinates of the currently selected projection to cartesian", () => {
            const commit = sinon.spy(),
                dispatch = sinon.spy(),
                state = {
                    adaptToHeight: false,
                    coordinateEasting: 10.00,
                    coordinateNorthing: 53.557,
                    height: 6.0,
                    currentProjection: {
                        epsg: "EPSG:4326",
                        id: "someId",
                        projName: "longlat"
                    }
                };

            actions.transformToCartesian({state, dispatch, commit});

            expect(commit.firstCall.args[0]).to.equal("setCurrentModelPosition");
            expect(commit.firstCall.args[1]).to.eql({x: 3739310.9273738265, y: 659341.4057539968, z: 5107613.232959453});
        });

        it("should transform coordinates of the currently selected projection to cartesian with different conditions", () => {
            const commit = sinon.spy(),
                dispatch = sinon.spy(),
                state = {
                    adaptToHeight: false,
                    coordinateEasting: 566242.52,
                    coordinateNorthing: 5934700.15,
                    height: 6.0,
                    currentProjection: {
                        epsg: "EPSG:25832",
                        id: "someId",
                        projName: "utm"
                    }
                };

            actions.transformToCartesian({state, dispatch, commit});

            expect(commit.firstCall.args[0]).to.equal("setCurrentModelPosition");
            expect(commit.firstCall.args[1]).to.eql({x: 3739310.9273738265, y: 659341.4057539968, z: 5107613.232959453});
        });

        it("should transform coordinates of the currently selected projection to cartesian and correct the height to globe height", () => {
            const commit = sinon.spy(),
                dispatch = sinon.spy(),
                state = {
                    adaptToHeight: true,
                    coordinateEasting: 10.00,
                    coordinateNorthing: 53.557,
                    height: 6.0,
                    currentProjection: {
                        epsg: "EPSG:4326",
                        id: "someId",
                        projName: "longlat"
                    }
                };

            actions.transformToCartesian({state, dispatch, commit});

            expect(commit.firstCall.args[0]).to.equal("setHeight");
            expect(commit.firstCall.args[1]).to.eql(5.7896);
            expect(commit.secondCall.args[0]).to.equal("setCurrentModelPosition");
            expect(commit.secondCall.args[1]).to.eql({x: 3739310.9273738265, y: 659341.4057539968, z: 5107613.232959453});
        });
    });

    describe("generateCylinders", () => {
        it("should generate cylinder on every polygon point", () => {
            const dispatch = sinon.stub().callsFake(() => {
                    state.cylinderId += 1;
                }),
                state = {
                    currentModelId: "polygonId",
                    cylinderId: 0,
                    activeShapePoints: [{x: 10, y: 20, z: 30}, {x: 20, y: 30, z: 10}, {x: 30, y: 10, z: 20}]
                };

            entity = {
                wasDrawn: true,
                clampToGround: true,
                polygon: {
                    extrudedHeight: {getValue: () => 20},
                    height: {getValue: () => 5}
                }
            };

            entities.values = [
                {
                    id: 1,
                    cylinder: {length: {_value: 10}}
                },
                {
                    id: 2,
                    cylinder: {length: {_value: 10}}
                },
                {
                    id: 3,
                    cylinder: {length: {_value: 10}}
                }
            ];

            actions.generateCylinders({dispatch, state}, entity);

            expect(dispatch.callCount).to.eql(3);
            entities.values.forEach(ent => {
                expect(ent.position.getValue()).to.eql({x: 10, y: 20, z: 30});
            });
        });

        it("should generate cylinder on every polyline point", () => {
            const dispatch = sinon.stub().callsFake(() => {
                    state.cylinderId += 1;
                }),
                state = {
                    currentModelId: "polylineId",
                    cylinderId: 0,
                    activeShapePoints: [{x: 10, y: 20, z: 30}, {x: 20, y: 30, z: 10}, {x: 30, y: 10, z: 20}]
                };

            entity = {
                wasDrawn: true,
                clampToGround: true
            };

            entities.values = [
                {
                    id: 1,
                    cylinder: {length: {_value: 10}}
                },
                {
                    id: 2,
                    cylinder: {length: {_value: 10}}
                },
                {
                    id: 3,
                    cylinder: {length: {_value: 10}}
                }
            ];

            actions.generateCylinders({dispatch, state}, entity);

            expect(dispatch.callCount).to.eql(3);
            entities.values.forEach(ent => {
                expect(ent.position.getValue()).to.eql({x: 10, y: 20, z: 30});
            });
        });
    });

    describe("createCylinder", () => {
        it("creates a cylinder with the passed options", () => {
            const commit = sinon.spy(),
                state = {
                    cylinderId: null,
                    extrudedHeight: 20
                },
                position = {x: 10, y: 20, z: 30},
                posIndex = 1,
                length = 25;

            entities.values = [];
            entities.add = sinon.stub().returns({
                id: "cylId",
                position: position,
                positionIndex: posIndex,
                cylinder: {
                    length: length
                }
            });

            global.Cesium.ColorMaterialProperty = function (color) {
                this.color = color;
            };
            global.Cesium.Color = {RED: 2};

            actions.createCylinder({commit, state}, {position, posIndex, length});

            expect(commit.calledWith("setCylinderId", "cylId")).to.be.true;
        });
    });

    describe("movePolygon", () => {
        it("should move a polygon and update the UI with center coordinates", () => {
            const dispatch = sinon.spy(),
                state = {
                    height: 10,
                    extrudedHeight: 20,
                    currentModelId: 1
                },
                position = {x: 50, y: 50, z: 50};

            entity = {
                id: 1,
                wasDrawn: true,
                clampToGround: true,
                polygon: {
                    extrudedHeight: 20,
                    height: 5,
                    hierarchy: {
                        getValue: () => ({positions: [{x: 10, y: 20, z: 30}, {x: 20, y: 30, z: 10}, {x: 30, y: 10, z: 20}]})
                    }
                }
            };

            getters = {
                getCenterFromGeometry: sinon.stub().returns({x: 50, y: 50, z: 50})
            };

            actions.movePolygon({dispatch, getters, state}, {entityId: state.currentModelId, position});

            expect(dispatch.calledWith("transformFromCartesian", {x: 50, y: 50, z: 50})).to.be.true;
        });
    });

    describe("editLayout", () => {
        it("should edit polygon fill color", () => {
            const state = {
                currentModelId: 1,
                newFillColor: "#ff0000"
            };

            getters = {
                getEntityType: sinon.stub().returns("polygon")
            };

            entity = {
                id: 1,
                polygon: {
                    material: {color: {red: 0, green: 0, blue: 0, alpha: 1}}
                }
            };

            global.Cesium = {
                Color: {
                    fromBytes: sinon.stub().returns({
                        withAlpha: sinon.stub().returns({
                            red: 1, green: 0, blue: 0, alpha: 1
                        })
                    })
                },
                ColorMaterialProperty:
                    sinon.stub().returns({color: {red: 1, green: 0, blue: 0, alpha: 1}})
            };

            actions.editLayout({getters, state}, "fillColor");

            expect(entities.getById.calledWith(1)).to.be.true;
            expect(entity.polygon.material.color).eql({red: 1, green: 0, blue: 0, alpha: 1});
        });
        it("should edit polygon stroke color", () => {
            const state = {
                    currentModelId: 1,
                    newStrokeColor: "#ff0000"
                },
                commit = sinon.spy();

            getters = {
                getEntityType: sinon.stub().returns("polygon")
            };

            entity = {
                id: 1,
                polygon: { },
                originalOutlineColor: {red: 0, green: 0, blue: 0}
            };

            global.Cesium = {
                Color: {
                    fromBytes: sinon.stub().returns({
                        red: 1, green: 0, blue: 0
                    })
                }
            };

            actions.editLayout({commit, getters, state}, "strokeColor");

            expect(entities.getById.calledWith(1)).to.be.true;
            expect(entity.originalOutlineColor).eql({red: 1, green: 0, blue: 0});
        });
        it("should edit polyline stroke color", () => {
            const state = {
                    currentModelId: 1,
                    newStrokeColor: "#ff0000"
                },
                commit = sinon.spy();

            getters = {
                getEntityType: sinon.stub().returns("polyline")
            };

            entity = {
                id: 1,
                polyline: {material: {color: {getValue: () => ({red: 0, green: 0, blue: 0})}}},
                originalColor: {red: 0, green: 0, blue: 0}
            };

            global.Cesium = {
                Color: {
                    fromBytes: sinon.stub().returns({
                        red: 1, green: 0, blue: 0
                    })
                }
            };

            actions.editLayout({commit, getters, state}, "strokeColor");

            expect(entities.getById.calledWith(1)).to.be.true;
            expect(entity.originalColor).eql({red: 1, green: 0, blue: 0});
        });
    });

    describe("moveAdjacentRectangleCorners", () => {
        it("should move the adjacent corners of a rectangle to a new position", () => {
            const state = {
                    activeShapePoints: [
                        Cesium.Cartesian3.fromDegrees(0, 0, 0),
                        Cesium.Cartesian3.fromDegrees(0, 1, 0),
                        Cesium.Cartesian3.fromDegrees(1, 1, 0),
                        Cesium.Cartesian3.fromDegrees(1, 0, 0)
                    ],
                    currentModelId: 1
                },
                moveOptions = {
                    movedCornerIndex: 0,
                    clampToGround: true
                };

            actions.moveAdjacentRectangleCorners({state}, moveOptions);

            expect(state.activeShapePoints[1]).to.eql({x: 10, y: 20, z: 30});
            expect(state.activeShapePoints[3]).to.eql({x: 10, y: 20, z: 30});
        });
    });

    describe("rotateDrawnEntity", () => {
        const result = [{x: 10, y: 20, z: 30}, {x: 10, y: 20, z: 30}, {x: 10, y: 20, z: 30}];
        let state, position, posIndex, length;

        beforeEach(() => {
            state = {
                currentModelId: 1,
                drawRotation: 10,
                cylinderId: null,
                activeShapePoints: [{x: 10, y: 20, z: 30}, {x: 20, y: 30, z: 10}, {x: 30, y: 10, z: 20}]
            };
            position = {x: 10, y: 20, z: 30};
            posIndex = 1;
            length = 25;

            entity = {
                id: 1,
                lastRotationAngle: 0
            };

            entities.values = [
                {
                    id: 1,
                    cylinder: {length: {_value: 10}},
                    positionIndex: 0
                },
                {
                    id: 2,
                    cylinder: {length: {_value: 10}},
                    positionIndex: 1
                },
                {
                    id: 3,
                    cylinder: {length: {_value: 10}},
                    positionIndex: 2
                }
            ];
            entities.values.add = sinon.stub().returns({
                id: "cylId",
                position: position,
                positionIndex: posIndex,
                cylinder: {
                    length: length
                }
            });

            getters = {
                getCenterFromGeometry: sinon.stub().returns({x: 50, y: 50, z: 50})
            };

            global.Cesium = {
                Transforms: {
                    eastNorthUpToFixedFrame: sinon.stub().returns()
                },
                Math: {
                    toRadians: () => 10
                },
                Cartographic: {
                    toCartesian: () => ({x: 10, y: 20, z: 30}),
                    fromCartesian: () => ({longitude: 0.17443853256965697, latitude: 0.9346599366554966, height: 6.134088691520464})
                },
                Cartesian3: function () {
                    return {
                        x: 10,
                        y: 20,
                        z: 30
                    };
                },
                Matrix4: function () {
                    return {
                        0: 1, 1: 0, 2: 0, 3: 0,
                        4: 0, 5: 1, 6: 0, 7: 0,
                        8: 0, 9: 0, 10: 1, 11: 0,
                        12: 0, 13: 0, 14: 0, 15: 1
                    };
                },
                PolygonHierarchy: function () {
                    return {
                        getValue: () => ({
                            positions: [
                                {x: 10, y: 20, z: 30},
                                {x: 20, y: 30, z: 10},
                                {x: 30, y: 10, z: 20}
                            ]
                        })
                    };
                }
            };
            global.Cesium.Matrix4.inverse = sinon.stub().returns(new Cesium.Matrix4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1));
            global.Cesium.Matrix4.multiplyByPoint = sinon.stub().returns({x: 10, y: 20, z: 30});
        });

        afterEach(() => {
            sinon.restore();
        });
        it("should commit setActiveShapePoints", () => {
            actions.rotateDrawnEntity({state, getters}, 10);

            expect(state.activeShapePoints).to.eql(result);
        });

        it("should set the lastRotationAngle", () => {
            actions.rotateDrawnEntity({state, getters}, 10);

            expect(entity.lastRotationAngle).to.eql(10);
        });
    });

    describe("updateRectangleDimensions", () => {
        it("should update the dimensions of the rectangle", () => {
            const state = {
                    currentModelId: 1,
                    activeShapePoints: [],
                    drawRotation: 10
                },
                commit = sinon.spy(),
                dimensions = {width: 10, depth: 10};

            getters = {
                getCenterFromGeometry: sinon.stub().returns({x: 10, y: 20, z: 30})
            };

            entity = {position: {getValue: () => ({x: 10, y: 20, z: 30})}};

            actions.updateRectangleDimensions({commit, getters, state}, dimensions);

            expect(state.activeShapePoints).to.be.an("array").with.lengthOf(4);
        });
    });
    describe("copyEntity", () => {
        const commit = sinon.spy(),
            nextId = 2,
            state = {
                currentModelId: 1,
                drawnModels: []
            },
            name = "Zeichnung 1";

        beforeEach(() => {
            global.Cesium = {
                Rectangle: {
                    fromCartographicArray: sinon.stub().returns(
                        {
                            west: 10, south: 30, east: 30, north: 10
                        }
                    )},
                Cartographic: {
                    fromCartesian: sinon.stub().returns({longitude: 0, latitude: 0, height: 0})
                },
                Cartesian3: {
                    fromRadians: sinon.stub().returns({x: 10, y: 20, z: 30})
                },
                PolygonHierarchy: function (positions) {
                    this.positions = positions;
                },
                ConstantProperty: function (value) {
                    this._value = value;
                    this.getValue = () => {
                        return this._value;
                    };
                },
                ColorMaterialProperty: function (color) {
                    this.color = color;
                },
                Color: function (red, green, blue, alpha) {
                    this.red = red;
                    this.green = green;
                    this.blue = blue;
                    this.alpha = alpha;
                },
                Entity: class {
                    /**
                     * Represents an Entity object.
                     */
                    constructor ({id}) {
                        this.show = true;
                        this.name = name + " copy";
                        this.id = id;
                    }
                }
            };
        });
        afterEach(() => {
            sinon.restore();
            state.drawnModels = [];
        });
        it("should copy a polygon entity", () => {
            entity = {
                id: 1,
                name: name,
                polygon: {
                    hierarchy: {
                        getValue: () => ({
                            positions:
                            [
                                {x: 10, y: 20, z: 30},
                                {x: 20, y: 30, z: 10},
                                {x: 30, y: 10, z: 20}
                            ]})
                    },
                    material: {
                        color: {
                            getValue: () => ({red: 1, green: 0, blue: 0, alpha: 1})
                        }
                    },
                    outlineColor: {
                        getValue: () => ({red: 0, green: 1, blue: 0, alpha: 1})
                    },
                    height: {
                        getValue: () => 5
                    },
                    extrudedHeight: {
                        getValue: () => 15
                    }
                },
                clampToGround: true
            };

            actions.copyEntity({state, commit}, {id: entity.id, nextId});

            expect(commit.calledWith("setDrawnModels", state.drawnModels)).to.be.true;
            expect(commit.calledWith("setCurrentModelId", nextId)).to.be.true;
            expect(state.drawnModels).to.eql([{id: nextId, name: name + " copy", show: true, edit: false}]);
            expect(entities.values[0]).to.have.property("polygon");
            expect(entities.values[0]).to.not.have.property("polyline");
        });

        it("should copy a polyline entity", () => {
            entity = {
                id: 1,
                name: name,
                polyline: {
                    positions: {
                        getValue: () => [
                            {x: 10, y: 20, z: 30},
                            {x: 20, y: 30, z: 10},
                            {x: 30, y: 10, z: 20}
                        ]
                    }
                },
                originalColor: {
                    red: 1, green: 0, blue: 0, alpha: 1
                },
                originalWidth: 5,
                clampToGround: true
            };

            actions.copyEntity({state, commit}, {id: entity.id, nextId});

            expect(commit.calledWith("setDrawnModels", state.drawnModels)).to.be.true;
            expect(commit.calledWith("setCurrentModelId", nextId)).to.be.true;
            expect(state.drawnModels).to.eql([{id: nextId, name: name + " copy", show: true, edit: false}]);
            expect(entities.values[0]).to.have.property("polyline");
            expect(entities.values[0]).to.not.have.property("polygon");
        });
    });

    describe("removeLabels", () => {
        it("should remove all labels of the given entity", () => {
            const labels = [
                    {label: {id: "label1"}, attachedEntityId: 1},
                    {label: {id: "label2"}, attachedEntityId: 1}
                ],
                state = {};

            entity = {id: 1};
            entities.values.push(...labels);

            actions.removeLabels({state}, entity);

            expect(entities.remove.callCount).to.equal(2);
        });
    });
    describe("handleGeoJsonFile", () => {
        it("should not commit anything if the given param is not a parsable json", () => {
            const commit = sinon.spy(),
                localTmpState = {drawnModels: []};

            actions.handleGeoJsonFile({commit, state: localTmpState}, undefined);
            expect(commit.callCount).to.be.equal(0);
            actions.handleGeoJsonFile({commit, state: localTmpState}, null);
            expect(commit.callCount).to.be.equal(0);
            actions.handleGeoJsonFile({commit, state: localTmpState}, true);
            expect(commit.callCount).to.be.equal(0);
            actions.handleGeoJsonFile({commit, state: localTmpState}, false);
            expect(commit.callCount).to.be.equal(0);
            actions.handleGeoJsonFile({commit, state: localTmpState}, "12345");
            expect(commit.callCount).to.be.equal(0);
            actions.handleGeoJsonFile({commit, state: localTmpState}, 12345);
            expect(commit.callCount).to.be.equal(0);
        });
        it("should not commit anything if the given param is valid json but has no features", () => {
            const commit = sinon.spy(),
                localTmpState = {drawnModels: []};

            actions.handleGeoJsonFile({commit, state: localTmpState}, "{}");
            expect(commit.callCount).to.be.equal(0);
        });
        it("should add entities for each feature", () => {
            const json = {
                    features: [
                        {
                            geometry: {coordinates: [0, 0]},
                            properties: {
                                color: "#000",
                                outlineColor: "#000",
                                clampToGround: true
                            }
                        }
                    ]
                },
                localTestState = {
                    drawnModels: []
                };

            actions.handleGeoJsonFile({commit: sinon.stub(), state: localTestState}, JSON.stringify(json));
            expect(entities.values.length).to.be.equal(1);
        });
    });
    describe("createEntities", () => {
        it("should dispatch actions for each entity if it contains an blob", async () => {
            const entityList = [
                    {
                        blob: new Blob()
                    },
                    {}
                ],
                dispatch = sinon.stub();

            await actions.createEntities({dispatch}, entityList);
            expect(dispatch.callCount).to.be.equal(1);
        });
        it("should dispatch twice actions for each entity if it contains an blob", async () => {
            const entityList = [
                    {
                        blob: new Blob()
                    },
                    {
                        blob: new Blob()
                    }
                ],
                dispatch = sinon.spy();

            await actions.createEntities({dispatch}, entityList);
            expect(dispatch.callCount).to.be.equal(2);
        });
    });
    describe("createEntity", () => {
        it("should create an entity", async () => {
            const commit = sinon.spy(),
                localTestState = {
                    importedModels: [],
                    importedEntities: [],
                    rotation: 0,
                    scale: 1
                },
                blob = new Blob(),
                blobBuffer = "bufferXY",
                fileName = "foo";

            sinon.stub(blobHandler, "blobToBase64").returns(blobBuffer);
            await actions.createEntity({commit, state: localTestState}, {blob, fileName});
            expect(entities.values.length).to.be.equal(1);
        });
        it("should create an entity with given position", async () => {
            const commit = sinon.spy(),
                localTestState = {
                    importedModels: [],
                    importedEntities: [],
                    rotation: 0,
                    scale: 1
                },
                blob = new Blob(),
                blobBuffer = "bufferXY",
                fileName = "foo",
                position = {x: 11, y: 21, z: 31};

            sinon.stub(blobHandler, "blobToBase64").returns(blobBuffer);
            await actions.createEntity({commit, state: localTestState}, {blob, fileName, position});
            // expect(commit.getCalls().find(call => call.firstArg === "setImportedEntities").lastArg).to.deep.equal([
            //     {
            //         blob: blobBuffer,
            //         blobType: blob.type,
            //         fileName,
            //         entityId: "import71",
            //         rotation: localTestState.rotation,
            //         scale: localTestState.scale,
            //         position
            //     }
            // ]);
            expect(entities.values.length).to.be.equal(1);
        });
        it("should set rotation and scale", async () => {
            const commit = sinon.spy(),
                localTestState = {
                    importedModels: [],
                    importedEntities: [],
                    rotation: 0,
                    scale: 1
                },
                blob = new Blob(),
                blobBuffer = "bufferXY",
                fileName = "foo";

            sinon.stub(blobHandler, "blobToBase64").returns(blobBuffer);
            await actions.createEntity({commit, state: localTestState}, {blob, fileName, rotation: 10, scale: 2});
            await nextTick();
            expect(commit.getCalls().find(call => call.firstArg === "setRotation").lastArg).to.be.equal(10);
            expect(commit.getCalls().find(call => call.firstArg === "setScale").lastArg).to.be.equal(2);
        });
        it("should set isLoading", async () => {
            const commit = sinon.spy(),
                localTestState = {
                    importedModels: [],
                    importedEntities: [],
                    rotation: 0,
                    scale: 1
                },
                blob = new Blob(),
                blobBuffer = "bufferXY",
                fileName = "foo";

            sinon.stub(blobHandler, "blobToBase64").returns(blobBuffer);
            await actions.createEntity({commit, state: localTestState}, {blob, fileName, rotation: 10, scale: 2});
            await nextTick();
            expect(commit.getCalls().find(call => call.firstArg === "setIsLoading").lastArg).to.be.false;
        });
    });
});
