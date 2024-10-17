import actions, {createGeoJSON, getFeatureIds} from "../../../store/actionsMapsFeatureViaUrl";
import {expect} from "chai";
import sinon from "sinon";
import crs from "@masterportal/masterportalapi/src/crs";
import Map from "ol/Map";

describe("src/core/maps/actionsMapsFeatureViaUrl", () => {
    const spy = sinon.spy();
    let dispatch,
        rootGetters;

    beforeEach(() => {
        mapCollection.clear();
        mapCollection.addMap(new Map(), "2D");

        dispatch = sinon.spy();
        rootGetters = {
            featureViaURL: {
                zoomTo: "42",
                epsg: 4326,
                layers: [
                    {
                        id: "42",
                        geometryType: "Point",
                        name: "Punkt Feature",
                        styleId: "location_eventlotse"
                    }
                ]
            }
        };
        sinon.stub(console, "warn").callsFake(spy);
    });

    afterEach(() => {
        sinon.restore();
        spy.resetHistory();
    });

    after(() => {
        mapCollection.clear();
    });

    describe("createGeoJSON", () => {
        const geometryType = "Point",
            regExp = /\d+/;
        let features = [{coordinates: [10, 53.5], label: "TestPunktEins"}, {coordinates: [10.5, 53.5], label: "TestPunktZwei"}],
            geoJSON;

        it("should create a geoJSON Object containing the given features with the given geometryType and the given epsg code", () => {
            const epsg = 25832;

            geoJSON = createGeoJSON(features, geometryType, epsg);
            geoJSON.features.forEach((feature, index) => {
                expect(feature.geometry.coordinates).to.eql(crs.transform("EPSG:" + epsg, "EPSG:4326", features[index].coordinates));
                expect(feature.properties.coordLabel).to.eql(crs.transform("EPSG:" + epsg, "EPSG:4326", features[index].coordinates));
                expect(feature.properties.featureLabel).to.equal(features[index].label);
                expect(feature.geometry.type).to.equal(geometryType);
                expect(feature.properties.typeLabel).to.equal(geometryType);

            });
            expect(parseInt(geoJSON.crs.properties.href.match(regExp)[0], 10)).to.equal(epsg);
        });

        it("should create a geoJSON containing the given features with the given geometryType and EPSG Code 4326 if no code was given", () => {
            geoJSON = createGeoJSON(features, geometryType, undefined);
            geoJSON.features.forEach((feature, index) => {
                expect(feature.geometry.coordinates).to.eql(features[index].coordinates);
                expect(feature.properties.coordLabel).to.eql(features[index].coordinates);
                expect(feature.properties.featureLabel).to.equal(features[index].label);
                expect(feature.geometry.type).to.equal(geometryType);
                expect(feature.properties.typeLabel).to.equal(geometryType);

            });
            expect(parseInt(geoJSON.crs.properties.href.match(regExp)[0], 10)).to.equal(4326);
        });

        it("should trigger an alert if no coordinates were defined for a feature and the feature shouldn't be added to the Object", () => {
            features = [{label: "TestPunktEins"}, {coordinates: [10.5, 53.5], label: "TestPunktZwei"}];
            geoJSON = createGeoJSON(features, geometryType, undefined);

            expect(spy.calledOnce).to.be.true;
            expect(spy.firstCall.args).to.eql([i18next.t("common:core.maps.featureViaURL.messages.featureParsing")]);
            expect(geoJSON.features.length).to.equal(1);
        });

        it("should trigger an alert if the coordinates of a feature are not an Array and the feature shouldn't be added to the Object", () => {
            features = [{coordinates: {x: 10, y: 53.5}, label: "TestPunktEins"}, {coordinates: [10.5, 53.5], label: "TestPunktZwei"}];
            geoJSON = createGeoJSON(features, geometryType, undefined);

            expect(spy.calledOnce).to.be.true;
            expect(spy.firstCall.args).to.eql([i18next.t("common:core.maps.featureViaURL.messages.featureParsing")]);
            expect(geoJSON.features.length).to.equal(1);
        });

        it("should trigger an alert if the coordinates of a feature is just an empty Array and the feature shouldn't be added to the Object", () => {
            features = [{coordinates: [], label: "TestPunktEins"}, {coordinates: [10.5, 53.5], label: "TestPunktZwei"}];
            geoJSON = createGeoJSON(features, geometryType, undefined);

            expect(spy.calledOnce).to.be.true;
            expect(spy.firstCall.args).to.eql([i18next.t("common:core.maps.featureViaURL.messages.featureParsing")]);
            expect(geoJSON.features.length).to.equal(1);
        });

        it("should trigger an alert if no label was defined for a feature and the feature shouldn't be added to the Object", () => {
            features = [{coordinates: [10, 53.5]}, {coordinates: [10.5, 53.5], label: "TestPunktZwei"}];
            geoJSON = createGeoJSON(features, geometryType, undefined);

            expect(spy.calledOnce).to.be.true;
            expect(spy.firstCall.args).to.eql([i18next.t("common:core.maps.featureViaURL.messages.featureParsing")]);
            expect(geoJSON.features.length).to.equal(1);
        });
    });

    describe("getFeatureIds", () => {
        it("should log an error on the console if no layer was found with the specified layerId and return an empty array", () => {
            const wrongId = "402";

            expect(getFeatureIds(wrongId)).to.eql([]);
            expect(spy.calledOnce).to.be.true;
            expect(spy.firstCall.args).to.eql([i18next.t("common:core.maps.featureViaURL.messages.layerNotFound")]);
        });

        it("should log an error on the console if no layerId was given to the function and return an empty array", () => {
            expect(getFeatureIds()).to.eql([]);
            expect(spy.calledOnce).to.be.true;
            expect(spy.firstCall.args).to.eql([i18next.t("common:core.maps.featureViaURL.messages.layerNotFound")]);
        });
    });

    describe("featureViaUrl", () => {
        const urlLayers = [
            {
                features: [
                    {
                        coordinates: [10, 53.5],
                        label: "TestPunkt"
                    }
                ],
                layerId: "42"
            }
        ];

        it("should create a feature via url", () => {
            actions.featureViaUrl({dispatch, rootGetters}, urlLayers);

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("createVectorLayer");
            expect(dispatch.firstCall.args[1]).to.deep.equals({
                layers: [
                    {
                        id: "42",
                        geometryType: "Point",
                        name: "Punkt Feature",
                        styleId: "location_eventlotse"
                    }
                ],
                pos: 0,
                geoJSON: {
                    type: "FeatureCollection",
                    crs: {
                        type: "link",
                        properties: {
                            href: "http://spatialreference.org/ref/epsg/4326/proj4/",
                            type: "proj4"
                        }
                    },
                    features: [
                        {
                            geometry: {
                                coordinates: [
                                    10,
                                    53.5
                                ],
                                type: "Point"
                            },
                            properties: {
                                coordLabel: [
                                    10,
                                    53.5
                                ],
                                featureLabel: "TestPunkt",
                                typeLabel: "Point"
                            },
                            type: "Feature"
                        }
                    ]
                }
            });
            expect(dispatch.secondCall.args[0]).to.equals("zoomToFilteredFeatures");
            expect(dispatch.secondCall.args[1]).to.deep.equals({
                ids: [],
                layerId: "42"
            });
        });
    });

    describe("createVectorLayer", () => {
        const layers = [
                {
                    id: "1",
                    name: " The name",
                    styleId: "123"
                }
            ],
            pos = 0,
            geoJSON = {
                a: 1
            };

        it("should create a layer with geojson features", () => {
            actions.createVectorLayer({dispatch}, {layers, pos, geoJSON});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args[0]).to.equals("addLayerToLayerConfig");
            expect(dispatch.firstCall.args[1]).to.deep.equals({
                layerConfig: {
                    gfiAttributes: {
                        featureLabel: "",
                        coordLabel: "",
                        typeLabel: ""
                    },
                    geojson: geoJSON,
                    id: layers[pos].id,
                    name: layers[pos].name,
                    showInLayerTree: true,
                    styleId: layers[pos].styleId,
                    typ: "GEOJSON",
                    type: "layer",
                    visibility: true
                },
                parentKey: "subjectlayer"
            });
        });
    });
});
