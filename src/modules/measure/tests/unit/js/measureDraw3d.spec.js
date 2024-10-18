import {expect} from "chai";
import sinon from "sinon";

import makeDraw, {
    createLabelEntity, createLineEntity, getPositionAbove, onClick, onMouseMove, addFloatingPin
} from "../../../utils/measureDraw3d.js";

describe("tools/measure/utils/measureDraw3d", () => {

    const cartographic = {
            height: 0
        },
        scene = {
            globe: {
                ellipsoid: {
                    cartesianToCartographic: () => cartographic
                },
                getHeight: () => 0
            },
            pickPosition: position => position
        },
        dataSourceDisplay = {
            defaultDataSource: {
                entities: {
                    values: [],
                    add: function (entity) {
                        this.values.push(entity);
                        return entity;

                    },
                    removeAll: function () {
                        this.values = [];
                    },
                    getById: function (id) {
                        return this.values.find(e => e.id === id);
                    }
                }
            }
        },
        eventHandler = {
            setInputAction: () => undefined,
            removeInputAction: () => undefined
        },
        map3D = {
            getCesiumScene: () => scene,
            getDataSourceDisplay: () => dataSourceDisplay
        };

    beforeEach(() => {

        mapCollection.addMap(map3D, "3D");

        global.Cesium = {
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
                    return 0;
                }
                /**
                 * Mock static method
                 * @returns {void} Nothing.
                 */
                static midpoint () {
                    return undefined;
                }
            },
            CallbackProperty: function (callback) {
                this.callback = callback;
                this.getValue = () => this.callback();
            },
            ColorMaterialProperty: function (color) {
                return color;
            },
            ScreenSpaceEventHandler: function () {
                return eventHandler;
            },
            NearFarScalar: function () {
                return undefined;
            },
            ScreenSpaceEventType: {},
            Color: {},
            LabelStyle: {}
        };
    });

    afterEach(() => {
        dataSourceDisplay.defaultDataSource.entities.removeAll();
        mapCollection.clear();
    });

    describe("createLabelEntity", () => {
        it("should return expected result", () => {
            const labelEntity = createLabelEntity("Ein Text", {x: 1, y: 2, z: 3});

            expect(labelEntity.label.text).to.equal("Ein Text");
            expect(labelEntity.position.x).to.equal(1);
            expect(labelEntity.position.y).to.equal(2);
            expect(labelEntity.position.z).to.equal(3);
        });

        it("should return undefined in case of unexpected parameters", () => {
            expect(createLabelEntity(0, {})).to.be.undefined;
            expect(createLabelEntity(1, {})).to.be.undefined;
            expect(createLabelEntity("", 0)).to.be.undefined;
            expect(createLabelEntity("", 1)).to.be.undefined;
        });
    });

    describe("createLineEntity", () => {
        it("should return expected result", () => {
            const lineEntity = createLineEntity({color: "Fröhliches Grau"}, ["Anfang", "Ende"]);

            expect(lineEntity.polyline.material.color).to.equal("Fröhliches Grau");
            expect(lineEntity.polyline.positions).to.deep.equal(["Anfang", "Ende"]);
        });

        it("should return undefined in case of unexpected parameters", () => {
            expect(createLineEntity(0, [])).to.be.undefined;
            expect(createLineEntity(1, [])).to.be.undefined;
            expect(createLineEntity({}, 0)).to.be.undefined;
            expect(createLineEntity({}, 1)).to.be.undefined;
        });
    });

    describe("getPositionAbove", () => {
        it("should throw correct error in case of unexpected parameters", () => {
            try {
                getPositionAbove();
            }
            catch {
                return;
            }
            finally {
                expect(getPositionAbove).to.throw("GetPositionAboveError");
            }
        });
    });

    describe("onClick", () => {
        it("should not throw errors", () => {
            try {
                onClick();
            }
            catch {
                return;
            }
            finally {
                expect(onClick).not.to.throw();
            }
        });

        it("should add two entities (pin and label) if called once", () => {
            global.Cesium = {...global.Cesium,
                Cartographic: {
                    fromCartesian: () => {
                        return {};
                    },
                    fromRadians: () => undefined,
                    toCartesian: () => undefined
                }
            };

            onClick();

            expect(map3D.getDataSourceDisplay().defaultDataSource.entities.values.length).to.equal(2);
        });

        it("should add six entities (two pins, one distance line, three labels) if called twice", () => {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;

            global.Cesium = {...global.Cesium,
                Cartographic: {
                    fromCartesian: () => {
                        return {};
                    },
                    fromRadians: () => undefined,
                    toCartesian: () => undefined
                }
            };

            addFloatingPin(entities);

            expect(entities.values.length).to.equal(1);

            onMouseMove({endPosition: "Anfang"});
            onClick();
            onMouseMove({endPosition: "Ende"});
            onClick();

            expect(entities.values.length).to.equal(1 + 6);
        });
    });

    describe("onMouseMove", () => {
        it("should not throw errors", () => {
            try {
                onMouseMove();
            }
            catch {
                return;
            }
            finally {
                expect(onMouseMove).not.to.throw();
            }
        });

        it("should set current position correctly", () => {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;

            addFloatingPin(entities);
            global.Cesium = {
                Cartographic: {
                    fromCartesian: () => {
                        return {};
                    },
                    fromRadians: () => undefined,
                    toCartesian: () => undefined
                }
            };
            onMouseMove({endPosition: {x: 1, y: 2}});

            expect(entities.getById("floating").polyline.positions.getValue()[0]).to.deep.equal({x: 1, y: 2});
        });
    });

    describe("addFloatingPin", () => {
        it("should add pin to passed entities", () => {
            const entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities;

            addFloatingPin(entities);

            expect(entities.getById("floating")).not.to.be.undefined;
            expect(entities.getById("floating").id).to.equal("floating");
        });

        it("should not throw errors in case of unexpected parameters", () => {
            try {
                addFloatingPin();
                addFloatingPin({});
            }
            catch {
                return;
            }
            finally {
                expect(addFloatingPin).not.to.throw();
            }
        });
    });

    describe("makeDraw", () => {
        it("should add two event handlers", () => {
            const spy = sinon.spy(eventHandler, "setInputAction");

            makeDraw();

            expect(spy.calledTwice).to.be.true;
        });

        it("should return expected interaction object", () => {
            const result = makeDraw();

            expect(result.abortDrawing).to.be.a("function");
            expect(result.stopInteraction).to.be.a("function");
            expect(result.interaction3d).to.be.true;
        });
    });
});
