
import {expect} from "chai";
import getGfiFeatureProvider from "../../getGfiFeaturesByTileFeature.js";
import store from "../../../../../app-store";

before(function () {
    i18next.init({
        lng: "cimode",
        debug: false
    });
});

describe("src/shared/js/utils/getGfiFeaturesByTileFeature.js", () => {
    let layerConfigByIdOrig;

    beforeEach(() => {
        layerConfigByIdOrig = store.getters.layerConfigById;
        store.getters = {
            layerConfigById: () => {
                return {
                    id: "id",
                    name: "layerName"
                };
            }
        };
    });

    afterEach(() => {
        store.getters.layerConfigById = layerConfigByIdOrig;
    });

    describe("getLayerModelFromTileFeature", () => {
        it("get id from layerReferenceId", () => {
            const tileFeature = {
                    tileset: {
                        layerReferenceId: "id",
                        primitive: {}
                    }

                },
                result = getGfiFeatureProvider.getLayerModelFromTileFeature(tileFeature, null, () => true);

            expect(result).to.be.deep.equals({attributes: {id: "id",
                name: "layerName"}});
        });

        it("get id from olLayer", () => {
            const tileFeature = {
                    tileset: {
                        primitive: {
                            olLayer: {
                                get: () => "id"
                            }
                        }
                    }

                },
                result = getGfiFeatureProvider.getLayerModelFromTileFeature(tileFeature, null, () => true);

            expect(result).to.be.deep.equals({attributes: {id: "id",
                name: "layerName"}});
        });

        it("get id from primitive.id.layerReferenceId", () => {
            const tileFeature = {
                    tileset: {
                        primitive: {
                            id: {
                                layerReferenceId: "id"
                            }
                        }
                    }

                },
                result = getGfiFeatureProvider.getLayerModelFromTileFeature(tileFeature, null, () => true, () => true);

            expect(result).to.be.deep.equals({attributes: {id: "id",
                name: "layerName"}});
        });


    });

    describe("getLayerName", () => {
        it("should return default name", () => {
            const result = getGfiFeatureProvider.getLayerName(null, null);

            expect(result).to.equal("modules.getFeatureInfo.title");
        });
        it("should return name from properties", () => {
            const properties = {
                    attributes: {
                        Objektart: "propertiesName"
                    }
                },
                layerAttributes = {
                    name: "layerAttributesName"
                },
                result = getGfiFeatureProvider.getLayerName(layerAttributes, properties);

            expect(result).to.equal("propertiesName");
        });
        it("should return name from layerAttributes name", () => {
            const properties = {},
                layerAttributes = {
                    name: "layerAttributesName",
                    id: "id"
                },
                result = getGfiFeatureProvider.getLayerName(layerAttributes, properties);

            expect(result).to.equal("layerAttributesName");
        });
        it("should return name from layerAttributes id", () => {
            const properties = {},
                layerAttributes = {
                    id: "id"
                },
                result = getGfiFeatureProvider.getLayerName(layerAttributes, properties);

            expect(result).to.equal("layerName");
        });
    });
    describe("getGfiFeature", () => {
        it("should use default values not for properties", () => {
            const result = getGfiFeatureProvider.getGfiFeature(null, null);

            expect(result.getTitle()).to.equal("modules.getFeatureInfo.title");
            expect(result.getProperties()).to.deep.equal(null);
        });
        it("should get attributes and properties according to given parameters", () => {
            const layerAttributes = {
                    name: "name",
                    gfiTheme: "gfiTheme",
                    gfiAttributes: "gfiAttributes",
                    id: "layerId"
                },
                properties = "properties",
                result = getGfiFeatureProvider.getGfiFeature(layerAttributes, properties);

            expect(result.getTitle()).to.equal(layerAttributes.name);
            expect(result.getTheme()).to.equal(layerAttributes.gfiTheme);
            expect(result.getLayerId()).to.equal(layerAttributes.id);
            expect(result.getAttributesToShow()).to.deep.equal(layerAttributes.gfiAttributes);
            expect(result.getProperties()).to.equal("properties");
        });
        it("should use properties.attributes as properties if any", () => {
            const properties = {
                    attributes: "properties attributes"
                },
                result = getGfiFeatureProvider.getGfiFeature(null, properties);

            expect(result.getTitle()).to.equal("modules.getFeatureInfo.title");
            expect(result.getTheme()).to.equal("DefaultTheme");
            expect(result.getProperties()).to.equal("properties attributes");
        });
    });

    describe("getLayerModelFromTileFeature", () => {
        const Cesium = {
                Entity: function (layerReferenceId) {
                    this.layerReferenceId = layerReferenceId;
                },
                Cesium3DTileFeature: function (layerReferenceId) {
                    this.tileset = {
                        layerReferenceId
                    };
                }
            },
            dummy = {
                isCesium3dTileFeature: (feature) => {
                    return feature instanceof Cesium.Cesium3DTileFeature;
                },
                isCesiumEntity: (entity) => {
                    return entity instanceof Cesium.Entity;
                },
                getModelByAttributesOpt: (filter) => {
                    return filter;
                }
            };

        it("should return undefined if no tileFeature is given", () => {
            expect(getGfiFeatureProvider.getLayerModelFromTileFeature(undefined)).to.be.undefined;
            expect(getGfiFeatureProvider.getLayerModelFromTileFeature(null)).to.be.undefined;
            expect(getGfiFeatureProvider.getLayerModelFromTileFeature("")).to.be.undefined;
            expect(getGfiFeatureProvider.getLayerModelFromTileFeature(0)).to.be.undefined;
            expect(getGfiFeatureProvider.getLayerModelFromTileFeature(false)).to.be.undefined;
            expect(getGfiFeatureProvider.getLayerModelFromTileFeature("test")).to.be.undefined;
            expect(getGfiFeatureProvider.getLayerModelFromTileFeature(1234)).to.be.undefined;
            expect(getGfiFeatureProvider.getLayerModelFromTileFeature(true)).to.be.undefined;
        });
        it("should create a filter with the Cesium3DTileFeature and apply the filter to get the model", () => {
            const tileFeature = new Cesium.Cesium3DTileFeature("Cesium3DTileFeature.layerReferenceId"),
                result = getGfiFeatureProvider.getLayerModelFromTileFeature(tileFeature, dummy.getModelByAttributesOpt, dummy.isCesium3dTileFeature, dummy.isCesiumEntity),
                expected = {id: "Cesium3DTileFeature.layerReferenceId"};

            expect(result).to.deep.equal(expected);
        });
        it("should return undefined if tileFeature is no Cesium3DTileFeature nor Cesium3DTilePointFeature and has no valid primitive option", () => {
            expect(getGfiFeatureProvider.getLayerModelFromTileFeature({}, dummy.getModelByAttributesOpt, dummy.isCesium3dTileFeature, dummy.isCesiumEntity)).to.be.undefined;
            expect(getGfiFeatureProvider.getLayerModelFromTileFeature({primitive: null}, dummy.getModelByAttributesOpt, dummy.isCesium3dTileFeature, dummy.isCesiumEntity)).to.be.undefined;
            expect(getGfiFeatureProvider.getLayerModelFromTileFeature({primitive: true}, dummy.getModelByAttributesOpt, dummy.isCesium3dTileFeature, dummy.isCesiumEntity)).to.be.undefined;
        });
        it("should create a filter with a primitive.olLayer and apply the filter to get the model", () => {
            const tileFeature = {
                    primitive: {
                        olLayer: {
                            get: () => {
                                return "primitive.olLayer.id";
                            }
                        }
                    }
                },
                result = getGfiFeatureProvider.getLayerModelFromTileFeature(tileFeature, dummy.getModelByAttributesOpt, dummy.isCesium3dTileFeature, dummy.isCesiumEntity),
                expected = {id: "primitive.olLayer.id"};

            expect(result).to.deep.equal(expected);
        });
        it("should create a filter with a Cesium.Entity and apply the filter to get the model", () => {
            const tileFeature = {
                    primitive: {
                        id: new Cesium.Entity("Entity.layerReferenceId")
                    }
                },
                result = getGfiFeatureProvider.getLayerModelFromTileFeature(tileFeature, dummy.getModelByAttributesOpt, dummy.isCesium3dTileFeature, dummy.isCesiumEntity),
                expected = {id: "Entity.layerReferenceId"};

            expect(result).to.deep.equal(expected);
        });

        it("should use Cesium3DTileFeature before using primitive.olLayer or Cesium.Entity", () => {
            const tileFeature = Object.assign(new Cesium.Cesium3DTileFeature("Cesium3DTileFeature.layerReferenceId"), {
                    primitive: {
                        olLayer: {
                            get: () => {
                                return "primitive.olLayer.id";
                            }
                        },
                        id: new Cesium.Entity("Entity.layerReferenceId")
                    }
                }),
                result = getGfiFeatureProvider.getLayerModelFromTileFeature(tileFeature, dummy.getModelByAttributesOpt, dummy.isCesium3dTileFeature, dummy.isCesiumEntity),
                expected = {id: "Cesium3DTileFeature.layerReferenceId"};

            expect(result).to.deep.equal(expected);
        });
        it("should use primitive.olLayer before using Cesium.Entity", () => {
            const tileFeature = {
                    primitive: {
                        olLayer: {
                            get: () => {
                                return "primitive.olLayer.id";
                            }
                        },
                        id: new Cesium.Entity("Entity.layerReferenceId")
                    }
                },
                result = getGfiFeatureProvider.getLayerModelFromTileFeature(tileFeature, dummy.getModelByAttributesOpt, dummy.isCesium3dTileFeature, dummy.isCesiumEntity),
                expected = {id: "primitive.olLayer.id"};

            expect(result).to.deep.equal(expected);
        });
    });

    describe("getGfiFeatureByCesium3DTileFeature", () => {
        it("should return undefined if tileFeature is no object", () => {
            expect(getGfiFeatureProvider.getGfiFeatureByCesium3DTileFeature()).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesium3DTileFeature(null)).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesium3DTileFeature(1234)).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesium3DTileFeature("string")).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesium3DTileFeature(true)).to.be.undefined;
        });
        it("should return undefined if tileFeature has no functions getPropertyIds or getProperty", () => {
            expect(getGfiFeatureProvider.getGfiFeatureByCesium3DTileFeature({})).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesium3DTileFeature([])).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesium3DTileFeature({getPropertyIds: () => {
                return false;
            }})).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesium3DTileFeature({getProperty: () => {
                return false;
            }})).to.be.undefined;
        });
        it("should return undefined if tileFeature.getPropertyIds() does not return an array", () => {
            expect(getGfiFeatureProvider.getGfiFeatureByCesium3DTileFeature({getPropertyIds: () => {
                return false;
            }, getProperty: () => {
                return false;
            }})).to.be.undefined;
        });

        it("should create properties using tileFeature getPropertyIds function and getProperty function", () => {
            const props = {
                    key1: "value1",
                    key2: "value2"
                },
                tileFeature = {
                    getPropertyIds: () => {
                        return Object.keys(props);
                    },
                    getProperty: (key) => {
                        return props[key];
                    }
                };

            expect(getGfiFeatureProvider.getGfiFeatureByCesium3DTileFeature(tileFeature, "attributes", (attributes, properties) => {
                // getGfiFeatureOpt
                return properties;
            })).to.deep.equal(props);
        });
        it("should pass through attributes", () => {
            const tileFeature = {
                getPropertyIds: () => {
                    return [];
                },
                getProperty: () => {
                    return undefined;
                }
            };

            expect(getGfiFeatureProvider.getGfiFeatureByCesium3DTileFeature(tileFeature, "attributes", (attributes) => {
                // getGfiFeatureOpt
                return attributes;
            })).to.equal("attributes");
        });
        it("should add the property id as property attributes.gmlid if property id and property attribtues are given", () => {
            const props = {
                    id: "id",
                    attributes: {}
                },
                tileFeature = {
                    getPropertyIds: () => {
                        return Object.keys(props);
                    },
                    getProperty: (key) => {
                        return props[key];
                    }
                },
                expected = {
                    id: "id",
                    attributes: {
                        gmlid: "id"
                    }
                };

            expect(getGfiFeatureProvider.getGfiFeatureByCesium3DTileFeature(tileFeature, "attributes", (attributes, properties) => {
                // getGfiFeatureOpt
                return properties;
            })).to.deep.equal(expected);
        });
    });

    describe("getGfiFeatureByCesiumEntity", () => {
        it("should return undefined if tileFeature.primitive.id is not an object", () => {
            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity()).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity(null)).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity(1234)).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity("string")).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity(true)).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity([])).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity({})).to.be.undefined;

            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity({primitive: undefined})).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity({primitive: null})).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity({primitive: 1234})).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity({primitive: "string"})).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity({primitive: true})).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity({primitive: []})).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity({primitive: {}})).to.be.undefined;

            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity({primitive: {id: undefined}})).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity({primitive: {id: null}})).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity({primitive: {id: 1234}})).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity({primitive: {id: "string"}})).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity({primitive: {id: true}})).to.be.undefined;
        });
        it("should use as properties whatever is given by tileFeature.primitive.id.attributes", () => {
            let tileFeature = null;

            tileFeature = {
                primitive: {
                    id: {}
                }
            };
            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity(tileFeature, "attributes", (attributes, properties) => {
                // getGfiFeatureOpt
                return properties;
            })).to.be.undefined;

            tileFeature = {
                primitive: {
                    id: {attributes: true}
                }
            };
            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity(tileFeature, "attributes", (attributes, properties) => {
                // getGfiFeatureOpt
                return properties;
            })).to.be.true;

            tileFeature = {
                primitive: {
                    id: {attributes: "primitive.attributes"}
                }
            };
            expect(getGfiFeatureProvider.getGfiFeatureByCesiumEntity(tileFeature, "attributes", (attributes, properties) => {
                // getGfiFeatureOpt
                return properties;
            })).to.equal("primitive.attributes");
        });
    });

    describe("getGfiFeatureByOlFeature", () => {
        it("should return undefined if olFeature is no object", () => {
            expect(getGfiFeatureProvider.getGfiFeatureByOlFeature()).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByOlFeature(null)).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByOlFeature(1234)).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByOlFeature("string")).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByOlFeature(true)).to.be.undefined;
        });
        it("should return undefined if olFeature has no functions getProperties or getProperty", () => {
            expect(getGfiFeatureProvider.getGfiFeatureByOlFeature({})).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByOlFeature([])).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByOlFeature({getProperties: () => {
                return false;
            }})).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeatureByOlFeature({getProperty: () => {
                return false;
            }})).to.be.undefined;
        });
        it("should return undefined if olFeature.getProperties() does not return an array", () => {
            expect(getGfiFeatureProvider.getGfiFeatureByOlFeature({getProperties: () => {
                return false;
            }, getProperty: () => {
                return false;
            }})).to.be.undefined;
        });

        it("should create properties using olFeature getProperties and getProperty function", () => {
            const props = {
                    key1: "value1",
                    key2: "value2"
                },
                olFeature = {
                    getProperties: () => {
                        return Object.keys(props);
                    },
                    getProperty: (key) => {
                        return props[key];
                    }
                };

            expect(getGfiFeatureProvider.getGfiFeatureByOlFeature(olFeature, "attributes", (attributes, properties) => {
                // getGfiFeatureOpt
                return properties;
            })).to.deep.equal(props);
        });
        it("should pass through attributes", () => {
            const olFeature = {
                getProperties: () => {
                    return [];
                },
                getProperty: () => {
                    return undefined;
                }
            };

            expect(getGfiFeatureProvider.getGfiFeatureByOlFeature(olFeature, "attributes", (attributes) => {
                // getGfiFeatureOpt
                return attributes;
            })).to.equal("attributes");
        });
    });

    describe("getGfiFeaturesByOlFeature", () => {
        it("should return undefined if olFeature is no object", () => {
            expect(getGfiFeatureProvider.getGfiFeaturesByOlFeature()).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeaturesByOlFeature(null)).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeaturesByOlFeature(1234)).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeaturesByOlFeature("string")).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeaturesByOlFeature(true)).to.be.undefined;
        });
        it("should return undefined if olFeature has no functions getProperties or getProperty", () => {
            expect(getGfiFeatureProvider.getGfiFeaturesByOlFeature({})).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeaturesByOlFeature([])).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeaturesByOlFeature({getProperties: () => {
                return false;
            }})).to.be.undefined;
            expect(getGfiFeatureProvider.getGfiFeaturesByOlFeature({getProperty: () => {
                return false;
            }})).to.be.undefined;
        });
        it("should return undefined if olFeature.getProperties() does not return an array", () => {
            expect(getGfiFeatureProvider.getGfiFeaturesByOlFeature({getProperties: () => {
                return false;
            }, getProperty: () => {
                return false;
            }})).to.be.undefined;
        });

        it("should create an array of one gfiFeature if olFeature is valid and is not clustered (has no features property)", () => {
            const olFeature = {
                    getProperties: () => {
                        return [];
                    },
                    getProperty: () => {
                        return undefined;
                    }
                },
                result = getGfiFeatureProvider.getGfiFeaturesByOlFeature(olFeature, "attributes", (feature) => {
                    // getGfiFeatureByOlFeatureOpt
                    return feature;
                });

            expect(result).to.be.an("array").with.length(1);
            expect(result[0]).to.be.an("object").and.to.be.not.null;
            expect(typeof result[0].getProperties).to.equal("function");
            expect(typeof result[0].getProperty).to.equal("function");
            expect(result[0].getProperties()).to.be.an("array").that.is.empty;
            expect(result[0].getProperty()).to.be.undefined;
        });
        it("should pass through attributes if olFeature is valid and is not clustered (has no features property)", () => {
            const olFeature = {
                    getProperties: () => {
                        return [];
                    },
                    getProperty: () => {
                        return undefined;
                    }
                },
                result = getGfiFeatureProvider.getGfiFeaturesByOlFeature(olFeature, "attributes", (feature, attributes) => {
                    // getGfiFeatureByOlFeatureOpt
                    return attributes;
                });

            expect(result).to.be.an("array").with.length(1);
            expect(result[0]).to.equal("attributes");
        });
        it("should create an array of gfiFeatures if olFeature is valid and is clustered (has feature property)", () => {
            const props = {
                    features: [
                        {
                            getProperties: () => {
                                return [];
                            },
                            getProperty: () => {
                                return undefined;
                            }
                        }
                    ]
                },
                olFeature = {
                    getProperties: () => {
                        return props;
                    },
                    get: (key) => {
                        return props[key];
                    }
                },
                result = getGfiFeatureProvider.getGfiFeaturesByOlFeature(olFeature, "attributes", (feature) => {
                    // getGfiFeatureByOlFeatureOpt
                    return feature;
                });

            expect(result).to.be.an("array").with.length(1);
            expect(result[0]).to.be.an("object").and.to.be.not.null;
            expect(typeof result[0].getProperties).to.equal("function");
            expect(typeof result[0].getProperty).to.equal("function");
            expect(result[0].getProperties()).to.be.an("array").that.is.empty;
            expect(result[0].getProperty()).to.be.undefined;
        });
        it("should pass through attributes if olFeature is valid and is clustered (has feature property)", () => {
            const props = {
                    features: [
                        {
                            getProperties: () => {
                                return [];
                            },
                            getProperty: () => {
                                return undefined;
                            }
                        }
                    ]
                },
                olFeature = {
                    getProperties: () => {
                        return props;
                    },
                    get: (key) => {
                        return props[key];
                    }
                },
                testFunctions = {
                    getGfiFeatureByOlFeatureOpt: (feature, attributes) => {
                        // getGfiFeatureByOlFeatureOpt
                        return attributes;
                    }
                },
                result = getGfiFeatureProvider.getGfiFeaturesByOlFeature(olFeature, "attributes", testFunctions.getGfiFeatureByOlFeatureOpt);

            expect(result).to.be.an("array").with.length(1);
            expect(result[0]).to.equal("attributes");
        });
    });
});

