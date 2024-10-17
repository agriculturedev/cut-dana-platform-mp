import {expect} from "chai";
import sinon from "sinon";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList.js";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";
import getGeometryTypeFromService from "@masterportal/masterportalapi/src/vectorStyle/lib/getGeometryTypeFromService";
import Layer2dVector from "../../../js/layer2dVector";
import store from "../../../../../app-store";

describe("src/core/js/layers/layer2dVector.js", () => {
    let attributes,
        error,
        warn,
        styleListStub,
        origGetters;

    before(() => {
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
            }
        };

        mapCollection.addMap(map, "2D");
        origGetters = store.getters;
    });

    beforeEach(() => {
        error = sinon.spy();
        warn = sinon.spy();
        sinon.stub(console, "error").callsFake(error);
        sinon.stub(console, "warn").callsFake(warn);
        attributes = {
            altitudeMode: "clampToGround"
        };
        const styleObj = {
            styleId: "styleId",
            rules: []
        };

        styleListStub = sinon.stub(styleList, "returnStyleObject").returns(styleObj);
    });

    afterEach(() => {
        sinon.restore();
        store.getters = origGetters;
    });

    describe("createLayer", () => {
        it("new Layer2dVector should create an layer with warning", () => {
            const layerWrapper = new Layer2dVector({});

            expect(layerWrapper).not.to.be.undefined;
            expect(warn.calledOnce).to.be.true;
        });
    });
    describe("updateLayerValues", () => {
        it("executes the function requestCapabilitiesToFitExtent because the corresponding parameters are fulfilled", () => {
            const wfsLayer = new Layer2dVector({}),
                requestCapabilitiesToFitExtent = sinon.stub(wfsLayer, "requestCapabilitiesToFitExtent");

            wfsLayer.updateLayerValues({
                visibility: true,
                fitCapabilitiesExtent: true,
                encompassingBoundingBox: false,
                capabilitiesUrl: "http://testUrl.de"
            });

            sinon.assert.calledOnce(requestCapabilitiesToFitExtent);
        });
        it("only executes the function requestCapabilitiesToFitExtent, 2D: do not call loadFeaturesManually", () => {
            const wfsLayer = new Layer2dVector({typ: "WFS"});

            wfsLayer.loadFeaturesManually = sinon.spy();
            wfsLayer.updateLayerValues({
                visibility: true,
                fitCapabilitiesExtent: true,
                encompassingBoundingBox: false
            });

            expect(warn.calledTwice).to.be.true;
            expect(wfsLayer.loadFeaturesManually.notCalled).to.be.true;
        });
        it("3D, WFS-Layer shall call loadFeaturesManually", () => {
            const wfsLayer = new Layer2dVector({typ: "WFS"});

            wfsLayer.layerSource = {
                getFeatures: () => []
            };
            wfsLayer.loadFeaturesManually = sinon.spy();
            store.getters = {
                "Maps/mode": "3D"
            };
            attributes = {
                visibility: true
            };
            wfsLayer.updateLayerValues(attributes);

            expect(wfsLayer.loadFeaturesManually.calledOnce).to.be.true;
            expect(wfsLayer.loadFeaturesManually.args[0][0]).to.be.deep.equal(attributes);
        });
        it("3D, OAF-Layer shall call loadFeaturesManually", () => {
            const wfsLayer = new Layer2dVector({typ: "OAF"});

            wfsLayer.layerSource = {
                getFeatures: () => []
            };
            wfsLayer.loadFeaturesManually = sinon.spy();
            store.getters = {
                "Maps/mode": "3D"
            };
            attributes = {
                visibility: true
            };
            wfsLayer.updateLayerValues(attributes);

            expect(wfsLayer.loadFeaturesManually.calledOnce).to.be.true;
            expect(wfsLayer.loadFeaturesManually.args[0][0]).to.be.deep.equal(attributes);
        });
        it("3D, GeoJSON-Layer shall call loadFeaturesManually", () => {
            const wfsLayer = new Layer2dVector({typ: "GeoJSON"});

            wfsLayer.layerSource = {
                getFeatures: () => []
            };
            wfsLayer.loadFeaturesManually = sinon.spy();
            store.getters = {
                "Maps/mode": "3D"
            };
            attributes = {
                visibility: true
            };
            wfsLayer.updateLayerValues(attributes);

            expect(wfsLayer.loadFeaturesManually.calledOnce).to.be.true;
            expect(wfsLayer.loadFeaturesManually.args[0][0]).to.be.deep.equal(attributes);
        });
        it("3D, WMS-Layer shall not call loadFeaturesManually", () => {
            const wfsLayer = new Layer2dVector({typ: "WMS"});

            wfsLayer.layerSource = {
                getFeatures: () => []
            };
            wfsLayer.loadFeaturesManually = sinon.spy();
            store.getters = {
                "Maps/mode": "3D"
            };
            attributes = {
                visibility: true
            };
            wfsLayer.updateLayerValues(attributes);

            expect(wfsLayer.loadFeaturesManually.notCalled).to.be.true;
        });
    });

    describe("clusterGeometryFunction", () => {
        it("should return the geometry of a feature", () => {
            const layer2d = new Layer2dVector(attributes),
                feature = {
                    get: () => sinon.stub(),
                    getGeometry: () => "Point"
                };

            expect(layer2d.clusterGeometryFunction(feature)).to.equals("Point");
        });
    });

    describe("featuresFilter", () => {
        it("featuresFilter shall filter getGeometry", function () {
            const layer2d = new Layer2dVector(attributes),
                features = [{
                    id: "1",
                    getGeometry: () => sinon.stub()
                },
                {
                    id: "2",
                    getGeometry: () => undefined
                }];

            expect(layer2d.featuresFilter(attributes, features).length).to.be.equals(1);

        });

        it("featuresFilter shall filter bboxGeometry", function () {
            attributes.bboxGeometry = {
                intersectsCoordinate: (coord) => {
                    if (coord[0] === 0.5 && coord[1] === 0.5) {
                        return true;
                    }
                    return false;
                },
                getExtent: () => ["1"]
            };
            const layer2d = new Layer2dVector(attributes),
                features = [{
                    id: "1",
                    getGeometry: () => {
                        return {
                            getExtent: () => [0, 0, 1, 1]
                        };

                    }
                },
                {
                    id: "2",
                    getGeometry: () => undefined
                },
                {
                    id: "3",
                    getGeometry: () => {
                        return {
                            getExtent: () => [2, 2, 3, 3]
                        };
                    }
                }],
                wfsFeatureFilter = layer2d.featuresFilter(attributes, features);

            expect(wfsFeatureFilter.length).to.be.equals(1);
            expect(wfsFeatureFilter[0].id).to.be.equals("1");
        });
    });

    describe("getLayerParams", () => {
        let localAttributes;

        beforeEach(() => {
            localAttributes = {
                altitudeMode: "clampToGround",
                gfiAttributes: "showAll",
                gfiTheme: "default",
                name: "The name",
                transparency: 0,
                typ: "Layer2d",
                zIndex: 1,
                renderer: "default",
                styleId: "styleId",
                style: [],
                excludeTypesFromParsing: ["type"],
                isPointLayer: false
            };
        });

        it("should return the raw layer attributes", () => {
            const layer2d = new Layer2dVector(localAttributes);
            /*
              zIndex: attributes.zIndex,
        renderer: attributes.renderer, // use "default" (canvas) or "webgl" renderer
        styleId: attributes.styleId, // styleId to pass to masterportalapi
        style: attributes.style, // style function to style the layer or WebGLPoints style syntax
        excludeTypesFromParsing: attributes.excludeTypesFromParsing, // types that should not be parsed from strings, only necessary for webgl
        isPointLayer: attributes.isPointLayer // whether the source will only hold point data, only necessary for webgl
            */

            expect(layer2d.getLayerParams(localAttributes)).to.deep.equals({
                altitudeMode: "clampToGround",
                gfiAttributes: "showAll",
                gfiTheme: "default",
                name: "The name",
                opacity: 1,
                typ: "Layer2d",
                zIndex: 1,
                renderer: "default",
                styleId: "styleId",
                style: [],
                excludeTypesFromParsing: ["type"],
                isPointLayer: false,
                gfiThemeSettings: undefined
            });
        });
    });

    describe("loadingParams", () => {
        it("should return all loading params undefined", () => {
            const layer2d = new Layer2dVector(attributes);

            expect(layer2d.loadingParams(attributes)).to.deep.equals({
                xhrParameters: undefined,
                propertyname: undefined,
                bbox: undefined
            });
        });

        it("should return loading params for isSecured and propertyNames", () => {
            attributes.isSecured = true;
            attributes.propertyNames = ["prop1", "prop2"];
            const layer2d = new Layer2dVector(attributes);

            expect(layer2d.loadingParams(attributes)).to.deep.equals({
                xhrParameters: {credentials: "include"},
                propertyname: "prop1,prop2",
                bbox: undefined
            });
        });
    });

    describe("propertyNames", () => {
        it("should return an empty Stirng if no propertyNames are configured", () => {
            const layer2d = new Layer2dVector(attributes);

            expect(layer2d.propertyNames(attributes)).to.equals("");
        });

        it("should return all strings separated by comma", () => {
            Object.assign(attributes, {propertyNames: ["ab", "cd"]});
            const layer2d = new Layer2dVector(attributes);

            expect(layer2d.propertyNames(attributes)).to.equals("ab,cd");
        });

        it("propertyNames shall return joined proertyNames or empty string", function () {
            attributes.propertyNames = ["app:plan", "app:name"];
            const layer2d = new Layer2dVector(attributes);
            let propertyname = layer2d.propertyNames(attributes);

            expect(propertyname).to.be.equals("app:plan,app:name");

            attributes.propertyNames = [];
            propertyname = layer2d.propertyNames(attributes);
            expect(propertyname).to.be.equals("");
            attributes.propertyNames = undefined;
            propertyname = layer2d.propertyNames(attributes);
            expect(propertyname).to.be.equals("");
            attributes.propertyNames = undefined;
            propertyname = layer2d.propertyNames(attributes);
            expect(propertyname).to.be.equals("");
        });
    });

    describe("onLoadingError", () => {
        it("should print a console.error", () => {
            const layer2d = new Layer2dVector(attributes);

            layer2d.onLoadingError("The error message");

            expect(error.calledOnce).to.be.true;
        });
    });

    describe("style funtions", () => {
        it("initStyle shall be called on creation and call createStyle if styleListLoaded=true", function () {
            const createStyleSpy = sinon.spy(Layer2dVector.prototype, "createStyle");

            store.getters = {
                styleListLoaded: true
            };
            attributes.styleId = "styleId";
            new Layer2dVector(attributes);

            expect(createStyleSpy.calledOnce).to.be.true;
        });

        it("initStyle shall be called on creation and not call createStyle if styleListLoaded=false", function () {
            const createStyleSpy = sinon.spy(Layer2dVector.prototype, "createStyle");

            store.getters = {
                styleListLoaded: false
            };
            attributes.styleId = "styleId";
            new Layer2dVector(attributes);

            expect(createStyleSpy.notCalled).to.be.true;
        });

        it("createStyle shall return a function", function () {
            let layer2d = null,
                styleFunction = null;

            attributes.styleId = "styleId";
            layer2d = new Layer2dVector(attributes);
            layer2d.createStyle(attributes);
            styleFunction = layer2d.getStyleFunction();

            expect(styleFunction).not.to.be.null;
            expect(typeof styleFunction).to.be.equals("function");
        });

        it("setStyle shall set undefined at layer's style to use defaultStyle", function () {
            let layer2d = null,
                olLayerStyle = null;
            const olLayer = {
                setStyle: (value) => {
                    olLayerStyle = value;
                }
            };

            styleListStub.restore();
            layer2d = new Layer2dVector(attributes);
            layer2d.getLayer = () => olLayer;
            layer2d.setStyle(null);

            expect(olLayerStyle).not.to.be.null;
            expect(olLayerStyle).to.be.undefined;
        });
    });

    describe("createLegend", () => {
        beforeEach(() => {
            attributes = {
                id: "id",
                version: "1.3.0"
            };
        });

        it("createLegend with legendURL", async () => {
            attributes.legendURL = "legendUrl1";
            const layerWrapper = new Layer2dVector(attributes);

            expect(await layerWrapper.createLegend()).to.be.deep.equals([attributes.legendURL]);
        });

        it("createLegend with legendURL as array", async () => {
            attributes.legendURL = ["legendUrl1"];
            const layerWrapper = new Layer2dVector(attributes);


            expect(await layerWrapper.createLegend()).to.be.deep.equals(attributes.legendURL);
        });

        it("createLegend with styleObject and legend true", async () => {
            attributes.legend = true;
            const layerWrapper = new Layer2dVector(attributes),
                legendInformation = {
                    "the": "legend Information"
                };

            sinon.stub(createStyle, "returnLegendByStyleId").returns({legendInformation});
            sinon.stub(getGeometryTypeFromService, "getGeometryTypeFromWFS");

            expect(await layerWrapper.createLegend()).to.deep.equals(legendInformation);
        });
    });

    describe("filterUniqueLegendInfo", () => {
        it("returns the given legendinfos if no features are given", () => {
            const vectorLayer = new Layer2dVector(attributes),
                expected = {foo: "bar"};

            expect(vectorLayer.filterUniqueLegendInfo([], undefined, expected)).to.deep.equal(expected);
        });
        it("returns uniqueLegendInfo for several features with same condition property (same style)", () => {
            const vectorLayer = new Layer2dVector(attributes),
                attributes1 = {id: 1, kategorie: "Bewässerungsanlagen", name: ""},
                attributes2 = {id: 2, kategorie: "Bewässerungsanlagen", name: "Ludwigsluster Kanal"},
                attributes3 = {id: 2, kategorie: "Brücken", name: "Lustige Brücke"},
                features = [{
                    attribute: attributes1,
                    get: (key) => {
                        return attributes1[key];
                    }
                },
                {
                    attribute: attributes2,
                    get: (key) => {
                        return attributes2[key];
                    }
                },
                {
                    attribute: attributes3,
                    get: (key) => {
                        return attributes3[key];
                    }
                }],
                rules = [{
                    conditions: {
                        properties: {
                            kategorie: "Bewässerungsanlagen"
                        }
                    },
                    style: {
                        imageName: "kanal.png"
                    }
                },
                {
                    conditions: {
                        properties: {
                            kategorie: "Brücken"
                        }
                    },
                    style: {
                        imageName: "bruecke.png"
                    }
                }],
                legendInfos = {
                    id: "mrh-industriekultur",
                    legendInformation: [{
                        geometryType: "Point",
                        id: "Point%7B%22properties%22%3A%7B%22kategorie%22%3A%22Bew%C3%A4sserungsanlagen%22%7D%7D",
                        label: "Bewässerungsanlagen",
                        styleObject: {}
                    },
                    {
                        geometryType: "Point",
                        id: "Point%7B%22properties%22%3A%7B%22kategorie%22%3A%22Br%C3%BCcken%22%7D%7D",
                        label: "Brücken",
                        styleObject: {}
                    }]
                },
                expectedUniqueLegendInfo = [{
                    geometryType: "Point",
                    id: "Point%7B%22properties%22%3A%7B%22kategorie%22%3A%22Bew%C3%A4sserungsanlagen%22%7D%7D",
                    label: "Bewässerungsanlagen",
                    styleObject: {}
                },
                {
                    geometryType: "Point",
                    id: "Point%7B%22properties%22%3A%7B%22kategorie%22%3A%22Br%C3%BCcken%22%7D%7D",
                    label: "Brücken",
                    styleObject: {}
                }];

            expect(vectorLayer.filterUniqueLegendInfo(features, rules, legendInfos.legendInformation)).to.deep.equal(expectedUniqueLegendInfo);
            expect(vectorLayer.filterUniqueLegendInfo(features, rules, legendInfos.legendInformation).length).to.not.deep.equal(features.length);
        });
        it("return uniqueLegendInfo for feature condition property that match legendinformation", () => {
            const vectorLayer = new Layer2dVector(attributes),
                attributes1 = {id: 1, Schulform: "Grundschule", name: ""},
                attributes2 = {id: 2, Schulform: "Regionale Schule", name: "Ludwigsluster Kanal"},
                attributes3 = {id: 3, Schulform: "Waldorfschule", name: "Lustige Brücke"},
                features = [{
                    attribute: attributes1,
                    get: (key) => {
                        return attributes1[key];
                    }
                },
                {
                    attribute: attributes2,
                    get: (key) => {
                        return attributes2[key];
                    }
                },
                {
                    attribute: attributes3,
                    get: (key) => {
                        return attributes3[key];
                    }
                }],
                rules = [{
                    conditions: {
                        properties: {
                            Schulform: "Grundschule"
                        }
                    },
                    style: {
                        imageName: "kanal.png"
                    }
                },
                {
                    conditions: {
                        properties: {
                            Schulform: "Regionale Schule"
                        }
                    },
                    style: {
                        imageName: "bruecke.png"
                    }
                },
                {
                    conditions: {
                        properties: {
                            Schulform: "Gymnasium"
                        }
                    },
                    style: {
                        imageName: "bruecke.png"
                    }
                },
                {
                    conditions: {
                        properties: {
                            Schulform: "Förderschule"
                        }
                    },
                    style: {
                        imageName: "bruecke.png"
                    }
                },
                {
                    conditions: {
                        properties: {
                            Schulform: "Waldorfschule"
                        }
                    },
                    style: {
                        imageName: "bruecke.png"
                    }
                }],
                legendInfos = {
                    id: "mrh-industriekultur",
                    legendInformation: [{
                        geometryType: "Point",
                        id: "1",
                        label: "Grundschule",
                        styleObject: {}
                    },
                    {
                        geometryType: "Point",
                        id: "2",
                        label: "Regionale Schule",
                        styleObject: {}
                    },
                    {
                        geometryType: "Point",
                        id: "3",
                        label: "Gymnasium",
                        styleObject: {}
                    },
                    {
                        geometryType: "Point",
                        id: "4",
                        label: "Förderschule",
                        styleObject: {}
                    },
                    {
                        geometryType: "Point",
                        id: "5",
                        label: "Waldorfschule",
                        styleObject: {}
                    }]
                },
                expectedUniqueLegendInfo = [{
                    geometryType: "Point",
                    id: "1",
                    label: "Grundschule",
                    styleObject: {}
                },
                {
                    geometryType: "Point",
                    id: "2",
                    label: "Regionale Schule",
                    styleObject: {}
                },
                {
                    geometryType: "Point",
                    id: "5",
                    label: "Waldorfschule",
                    styleObject: {}
                }];

            expect(vectorLayer.filterUniqueLegendInfo(features, rules, legendInfos.legendInformation)).to.deep.equal(expectedUniqueLegendInfo);
            expect(vectorLayer.filterUniqueLegendInfo(features, rules, legendInfos.legendInformation).length).to.deep.equal(3);
            expect(vectorLayer.filterUniqueLegendInfo(features, rules, legendInfos.legendInformation).length).to.deep.equal(features.length);
        });
        it("return uniqueLegendInfo for feature condition property (with first letter upper case) that match legendinformation (first letter lower case", () => {
            const vectorLayer = new Layer2dVector(attributes),
                attributes1 = {id: 1, Kategorie: "Bewässerungsanlagen", name: ""},
                features = [{
                    attribute: attributes1,
                    get: (key) => {
                        return attributes1[key];
                    }
                }],
                rules = [{
                    conditions: {
                        properties: {
                            kategorie: "Bewässerungsanlagen"
                        }
                    },
                    style: {
                        imageName: "kanal.png"
                    }
                },
                {
                    conditions: {
                        properties: {
                            kategorie: "Brücken"
                        }
                    },
                    style: {
                        imageName: "bruecke.png"
                    }
                }],
                legendInfos = {
                    id: "mrh-industriekultur",
                    legendInformation: [{
                        geometryType: "Point",
                        id: "Point%7B%22properties%22%3A%7B%22kategorie%22%3A%22Bew%C3%A4sserungsanlagen%22%7D%7D",
                        label: "Bewässerungsanlagen",
                        styleObject: {}
                    }]
                },
                expectedUniqueLegendInfo = [{
                    geometryType: "Point",
                    id: "Point%7B%22properties%22%3A%7B%22kategorie%22%3A%22Bew%C3%A4sserungsanlagen%22%7D%7D",
                    label: "Bewässerungsanlagen",
                    styleObject: {}
                }];

            expect(vectorLayer.filterUniqueLegendInfo(features, rules, legendInfos.legendInformation)).to.deep.equal(expectedUniqueLegendInfo);
        });

        it("should not fail if some rules have no condition", () => {
            const vectorLayer = new Layer2dVector(attributes),
                attributes1 = {id: 1, ID_SYMBOL: "3", name: "ASN, Wertstoffhof Nord"},
                features = [{
                    attribute: attributes1,
                    get: (key) => {
                        return attributes1[key];
                    }
                }],
                rules = [{
                    conditions: {
                        properties: {
                            ID_SYMBOL: "3"
                        }
                    },
                    style: {
                        clusterImageName: "amt_stadt_nuernberg.png",
                        imageName: "amt_stadt_nuernberg.png",
                        legendValue: "Städtische Ämter"
                    }
                },
                {
                    style: {
                        imageName: "bruecke.png"
                    }
                }],
                legendInfos = [
                    {
                        geometryType: "Point",
                        id: "Point%7B%22properties%22%3A%7B%22ID_SYMBOL%22%3A3%7D%7D",
                        label: "Städtische Ämter",
                        styleObject: {}
                    }
                ],
                expectedUniqueLegendInfo = [
                    {
                        geometryType: "Point",
                        id: "Point%7B%22properties%22%3A%7B%22ID_SYMBOL%22%3A3%7D%7D",
                        label: "Städtische Ämter",
                        styleObject: {}
                    }
                ];

            expect(vectorLayer.filterUniqueLegendInfo(features, rules, legendInfos)).to.deep.equal(expectedUniqueLegendInfo);
        });
        it("returns the filtered uniquelegendinfo for rules with arrays which has the length of 2", () => {
            const vectorLayer = new Layer2dVector(attributes),
                attributes1 = {id: 1, year: "1950"},
                attributes2 = {id: 2, year: "1920"},
                attributes3 = {id: 3, year: "2000"},
                features = [{
                    attribute: attributes1,
                    get: (key) => {
                        return attributes1[key];
                    }
                },
                {
                    attribute: attributes2,
                    get: (key) => {
                        return attributes2[key];
                    }
                },
                {
                    attribute: attributes3,
                    get: (key) => {
                        return attributes3[key];
                    }
                }],
                rules = [{
                    conditions: {
                        properties: {
                            year: [1, 1900]
                        }
                    },
                    style: {
                        imageName: "kanal.png",
                        legendValue: "Before 1900"
                    }
                },
                {
                    conditions: {
                        properties: {
                            year: [1900, 1950]
                        }
                    },
                    style: {
                        imageName: "bruecke.png",
                        legendValue: "1900-1949"
                    }
                },
                {
                    conditions: {
                        properties: {
                            year: [1950, 2000]
                        }
                    },
                    style: {
                        imageName: "bruecke.png",
                        legendValue: "1950-1999"
                    }
                },
                {
                    conditions: {
                        properties: {
                            year: [2000, 200000]
                        }
                    },
                    style: {
                        imageName: "bruecke.png",
                        legendValue: "After 2000"
                    }
                }],
                legendInfos = {
                    id: "mrh-industriekultur",
                    legendInformation: [{
                        geometryType: "Point",
                        id: "1",
                        label: "Before 1900",
                        styleObject: {}
                    },
                    {
                        geometryType: "Point",
                        id: "2",
                        label: "1900-1949",
                        styleObject: {}
                    },
                    {
                        geometryType: "Point",
                        id: "3",
                        label: "1950-1999",
                        styleObject: {}
                    },
                    {
                        geometryType: "Point",
                        id: "4",
                        label: "After 2000",
                        styleObject: {}
                    }]
                },
                expectedUniqueLegendInfo = [{
                    geometryType: "Point",
                    id: "2",
                    label: "1900-1949",
                    styleObject: {}
                },
                {
                    geometryType: "Point",
                    id: "3",
                    label: "1950-1999",
                    styleObject: {}
                },
                {
                    geometryType: "Point",
                    id: "4",
                    label: "After 2000",
                    styleObject: {}
                }];

            expect(vectorLayer.filterUniqueLegendInfo(features, rules, legendInfos.legendInformation)).to.deep.equal(expectedUniqueLegendInfo);
            expect(vectorLayer.filterUniqueLegendInfo(features, rules, legendInfos.legendInformation).length).to.deep.equal(3);
        });
    });
});
