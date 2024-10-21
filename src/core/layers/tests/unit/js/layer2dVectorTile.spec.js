import axios from "axios";
import crs from "@masterportal/masterportalapi/src/crs";
import {expect} from "chai";
import sinon from "sinon";
import Collection from "ol/Collection";
import webgl from "../../../js/webglRenderer";

import Layer2dVectorTile from "../../../js/layer2dVectorTile";

describe("src/core/js/layers/layer2dVectorTile.js", () => {
    const attrs = {
            epsg: "EPSG:3857",
            extent: [902186.6748764697, 7054472.604709217, 1161598.3542590786, 7175683.411718197],
            gfiAttributes: "showAll",
            gfiTheme: "default",
            id: "911",
            name: "InsideJob",
            origin: [-20037508.342787, 20037508.342787],
            resolutions: [78271.51696401172, 305.7481131406708, 152.8740565703354, 76.4370282851677, 2.3886571339114906],
            styleId: "999962",
            tileSize: 512,
            transparency: 0,
            typ: "VectorTile",
            url: "https://doesthisurlexist.de/vt/tiles/esri/Test_VT_3857/p12/tile/{z}/{y}/{x}.pbf",
            vtStyles: [
                {name: "Layer One", id: "l1"},
                {name: "Layer Two", id: "l2"}
            ]
        },
        vtStyles = [
            {name: "Layer One", id: "l1"},
            {name: "Layer Two", id: "l2"}
        ],
        vtStylesDefaultL2 = [
            {name: "Layer One", id: "l1"},
            {name: "Layer Two", id: "l2", defaultStyle: true}
        ];
    let attributes,
        error,
        warn;

    before(() => {
        error = sinon.spy();
        sinon.stub(console, "error").callsFake(error);
        warn = sinon.spy();
        sinon.stub(console, "warn").callsFake(warn);
        mapCollection.clear();

        const map = {
            id: "ol",
            mode: "2D",
            addInteraction: sinon.stub(),
            removeInteraction: sinon.stub(),
            addLayer: () => sinon.stub(),
            getView: () => {
                return {
                    getProjection: () => {
                        return {
                            getCode: () => "EPSG:25832"
                        };
                    },
                    getResolutions: () => [2000, 1000]
                };
            },
            getLayers: () => {
                return new Collection();
            },
            on: () => sinon.stub()
        };

        mapCollection.addMap(map, "2D");
    });

    beforeEach(() => {
        attributes = {
            id: "911",
            maxScale: "1000000",
            minScale: "0",
            name: "Foobar",
            typ: "VectorTile",
            url: "https://doesthisurlexist.de/vt/tiles/esri/Test_VT_3857/p12/tile/{z}/{y}/{x}.pbf"
        };

        crs.registerProjections();
    });

    after(() => {
        sinon.restore();
    });

    describe("createLayer", () => {
        it("new Layer2dVectorTile should create an layer with no one warning", () => {
            const vectorTileLayer = new Layer2dVectorTile({});

            expect(vectorTileLayer).not.to.be.undefined;
            expect(warn.calledOnce).to.be.true;
        });
    });

    describe("getRawLayerAttributes", () => {
        let localAttributes;

        beforeEach(() => {
            localAttributes = {
                id: "911",
                maxScale: "1000000",
                minScale: "0",
                name: "Foobar",
                typ: "VectorTile",
                url: "https://doesthisurlexist.de/vt/tiles/esri/Test_VT_3857/p12/tile/{z}/{y}/{x}.pbf"
            };
        });

        it("should return the raw layer attributes", () => {
            const vectorTileLayer = new Layer2dVectorTile(localAttributes);

            expect(vectorTileLayer.getRawLayerAttributes(localAttributes)).to.deep.equals({
                id: "911",
                maxScale: "1000000",
                minScale: "0",
                name: "Foobar",
                typ: "VectorTile",
                url: "https://doesthisurlexist.de/vt/tiles/esri/Test_VT_3857/p12/tile/{z}/{y}/{x}.pbf"
            });
        });
    });

    describe("getLayerParams", () => {
        let localAttributes;

        beforeEach(() => {
            localAttributes = {
                gfiAttributes: "The attributes",
                transparency: 50,
                zIndex: 10,
                renderer: "canvas",
                styleId: "styleId",
                style: {},
                excludeTypesFromParsing: true,
                isPointLayer: false
            };
        });

        it("should return the raw layer attributes", () => {
            const vectorTileLayer = new Layer2dVectorTile(localAttributes);

            expect(vectorTileLayer.getLayerParams(localAttributes)).to.deep.equals({
                gfiAttributes: "The attributes",
                opacity: 0.5,
                zIndex: 10,
                renderer: "canvas",
                styleId: "styleId",
                style: {},
                excludeTypesFromParsing: true,
                isPointLayer: false
            });
        });
    });

    describe("checkProjection", () => {
        it("should print a warn, if mapProjection and servicesProjection are different", () => {
            /**
             * Makes a context.
             * @returns {Object} The return object
             */
            function makeContext () {
                return {
                    get: () => "EPSG:25832"
                };
            }
            const {checkProjection} = Layer2dVectorTile.prototype;

            checkProjection.call(makeContext(), attrs);

            expect(warn.called).to.be.true;
        });
    });

    describe("vector tile layer config", () => {
        it("should create a layer with minimal config", () => {
            const vectorTileLayer = new Layer2dVectorTile(attributes),
                layer = vectorTileLayer.getLayer(),
                source = vectorTileLayer.getLayerSource();


            expect(vectorTileLayer.get("id")).to.equal("911");
            expect(vectorTileLayer.get("minScale")).to.equal("0");
            expect(vectorTileLayer.get("maxScale")).to.equal("1000000");

            expect(layer.get("id")).to.equal("911");
            expect(layer.get("name")).to.equal("Foobar");

            expect(source.getUrls()[0]).to.equal("https://doesthisurlexist.de/vt/tiles/esri/Test_VT_3857/p12/tile/{z}/{y}/{x}.pbf");
        });

        it("should apply in services.json.md defined defaults", () => {
            const defaultValues = { // defaults defined in services.json.md
                    zDirection: 1,
                    epsg: "EPSG:25832", // default value from config.json.md/MapView. Should be the default CRS
                    extent: [ // If not set, the portal's coordinate reference system's extent is used
                        -1877994.66,
                        3932281.56,
                        836715.13,
                        9440581.95
                    ],
                    origin: [ // if not set, the portal's coordinate reference system's top-left corner is used.
                        -1877994.66,
                        836715.13
                    ],
                    resolutions: [ // If not used, the portal's resolutions are used. (Missing default resolution definition? used default resolutions from masterportal-api)
                        66.14579761460263,
                        26.458319045841044,
                        15.874991427504629,
                        10.583327618336419,
                        5.2916638091682096,
                        2.6458319045841048,
                        1.3229159522920524,
                        0.6614579761460262,
                        0.2645831904584105,
                        0.1322915952292052
                    ],
                    tileSize: 512,
                    layerAttribution: "nicht vorhanden",
                    transparency: 0,
                    useProxy: false
                },
                vectorTileLayer = new Layer2dVectorTile(attributes),
                layer = vectorTileLayer.getLayer(),
                source = layer.getSource(),
                tileGrid = source.getTileGrid();

            expect(layer.getOpacity()).to.equal(1);
            expect(layer.getVisible()).to.be.true;

            expect(source.zDirection).to.equal(defaultValues.zDirection);
            expect(source.getProjection().getCode()).to.equal(defaultValues.epsg);
            expect(source.getAttributions()).to.be.null;

            // Note: this should be the extent of the projection but is the extent of EPSG:3857
            //       this is because in masterportalAPI is no definition of the extent of the
            //       default projection which is EPSG:25832
            expect(tileGrid.getExtent()).to.deep.equal([
                -20015077.371242613,
                -20015077.371242613,
                20015077.371242613,
                20015077.371242613
            ]);
            // Note: this should be the top left corner of the projection extent but is top left
            //       corner of extent of EPSG:3857 this is because in masterportalAPI is no
            //       definition of the extent of the default projection which is EPSG:25832
            expect(tileGrid.getOrigin()).to.deep.equal([
                -20015077.371242613,
                20015077.371242613
            ]);
            expect(tileGrid.getResolutions()).to.deep.equal(defaultValues.resolutions);
            expect(tileGrid.getTileSize()).to.deep.equal(new Array(2).fill(defaultValues.tileSize));
        });

        it("should apply given attributes correct", () => {
            const vectorTileLayer = new Layer2dVectorTile(attrs),
                layer = vectorTileLayer.getLayer(),
                source = layer.getSource(),
                tileGrid = source.getTileGrid();

            expect(vectorTileLayer.get("layerAttribution")).to.be.undefined;
            expect(vectorTileLayer.get("gfiAttributes")).to.equal(attrs.gfiAttributes);
            expect(vectorTileLayer.get("gfiTheme")).to.equal(attrs.gfiTheme);
            expect(vectorTileLayer.get("id")).to.equal(attrs.id);
            expect(vectorTileLayer.get("name")).to.equal(attrs.name);
            expect(vectorTileLayer.get("styleId")).to.equal(attrs.styleId);
            expect(vectorTileLayer.get("selectedStyleID")).to.equal(attrs.styleId);
            expect(vectorTileLayer.get("vtStyles")).to.deep.equal(attrs.vtStyles);

            expect(layer.get("id")).to.equal(attrs.id);
            expect(layer.get("name")).to.equal(attrs.name);
            expect(layer.getOpacity()).to.equal(1);
            expect(layer.getVisible()).to.be.true;

            expect(source.zDirection).to.equal(1);
            expect(source.getProjection().getCode()).to.equal("EPSG:3857");
            expect(source.getAttributions()).to.be.null;

            expect(tileGrid.getExtent()).to.deep.equal([
                902186.6748764697,
                7054472.604709217,
                1161598.3542590786,
                7175683.411718197
            ]);
            expect(tileGrid.getOrigin()).to.deep.equal([
                -20037508.342787,
                20037508.342787
            ]);
            expect(tileGrid.getResolutions()).to.deep.equal([
                78271.51696401172,
                305.7481131406708,
                152.8740565703354,
                76.4370282851677,
                2.3886571339114906
            ]);
            expect(tileGrid.getTileSize()).to.deep.equal([512, 512]);
        });
    });

    describe("isStyleValid", () => {
        it("returns true only if required fields all exist", () => {
            const {isStyleValid} = Layer2dVectorTile.prototype;

            expect(isStyleValid(undefined)).to.be.false;
            expect(isStyleValid({})).to.be.false;
            expect(isStyleValid({version: 4})).to.be.false;
            expect(isStyleValid({layers: []})).to.be.false;
            expect(isStyleValid({sources: []})).to.be.false;
            expect(isStyleValid({version: 3, layers: [], sources: {}})).to.be.true;
        });
    });

    describe("setStyleById", () => {
        /**
         * Makes a context.
         * @returns {Object} The return object
         */
        function makeContext () {
            return {
                get: key => ({vtStyles})[key],
                setStyleByDefinition: sinon.spy(() => Symbol.for("Promise"))
            };
        }

        it("finds a style definition by id and uses setStyleByDefinition with it", () => {
            const {setStyleById} = Layer2dVectorTile.prototype,
                context = makeContext(),
                returnValue = setStyleById.call(context, "l2");

            expect(context.setStyleByDefinition.calledOnce).to.be.true;
            expect(context.setStyleByDefinition.calledWith(vtStyles[1])).to.be.true;
            expect(returnValue).to.equal(Symbol.for("Promise"));
        });

        it("returns rejecting Promise if key not found", function (done) {
            const {setStyleById} = Layer2dVectorTile.prototype,
                context = makeContext(),
                returnValue = setStyleById.call(context, "l3");
            let caught = false;

            expect(context.setStyleByDefinition.notCalled).to.be.true;
            returnValue
            // expect rejection
                .catch(() => {
                    caught = true;
                })
                .finally(() => {
                    expect(caught).to.be.true;
                    done();
                })
            // forward if falsely not rejected
                .catch(err => done(err));
        });
    });

    describe("setStyleByDefinition", () => {
        /* in case there ever exists a global fetch during testing,
         * it is swapped here - just in case ... */
        let fetch = null;

        beforeEach(() => {
            fetch = global.fetch;
        });

        afterEach(() => {
            global.fetch = fetch;
        });

        const validStyle = {
                version: 8,
                layers: [],
                sources: {}
            },
            invalidStyle = {
                version: 8,
                sources: {}
            };

        /**
         * @param {function} done mocha callback done
         * @returns {Object} mock context for setStyleById
         */
        function makeContext (done) {
            return {
                isStyleValid: Layer2dVectorTile.prototype.isStyleValid,
                get: key => ({layer: Symbol.for("layer")})[key],
                set: sinon.spy((key, value) => {
                    expect(key).to.equal("selectedStyleID");
                    expect(value).to.equal("l0");

                    done();
                })
            };
        }

        it("retrieves json from url, checks it, and sets id to layer and model", function (done) {
            global.fetch = sinon.spy(() => new Promise(r => r({
                json: () => new Promise(ir => ir(validStyle))
            })));

            const {setStyleByDefinition} = Layer2dVectorTile.prototype,
                context = makeContext(done);

            setStyleByDefinition.call(context, {id: "l0", url: "example.com/root.json"})
                .catch(() => done());
        });

        it("rejects invalid json", function (done) {
            global.fetch = sinon.spy(() => new Promise(r => r({
                json: () => new Promise(ir => ir(invalidStyle))
            })));

            const {setStyleByDefinition} = Layer2dVectorTile.prototype,
                context = makeContext(done);

            setStyleByDefinition
                .call(context, {id: "l0", url: "example.com/root.json"})
                .catch(() => done());
        });
    });

    describe("setConfiguredLayerStyle", () => {
        /**
         * @param {Object} params parameter object
         * @param {?object} params.styleId style id from config.json
         * @param {?string} params.givenVtStyles style set from services.json to use
         * @param {function} params.done to be called finally
         * @returns {Object} mock context for setStyleById
         */
        function makeContext ({styleId, givenVtStyles, done}) {
            return {
                isStyleValid: Layer2dVectorTile.prototype.isStyleValid,
                get: key => ({
                    styleId,
                    visibility: Symbol.for("visibility"),
                    vtStyles: givenVtStyles
                })[key],
                set: sinon.spy(),
                setStyleById: sinon.spy(() => new Promise(r => r())),
                setStyleByDefinition: sinon.spy(() => new Promise(r => r())),
                layer: {
                    setVisible: sinon.spy(v => {
                        expect(v).to.equal(Symbol.for("visibility"));
                        done();
                    })
                }
            };
        }

        it("uses config.json style first", done => {
            const context = makeContext({styleId: "lConfigJson", givenVtStyles: vtStylesDefaultL2, done}),
                {set} = context;

            Layer2dVectorTile.prototype.setConfiguredLayerStyle.call(context);

            expect(set.calledOnce).to.be.true;
            expect(set.calledWith("selectedStyleID", "lConfigJson")).to.be.true;
        });

        it("uses services.json default style second", done => {
            const context = makeContext({givenVtStyles: vtStylesDefaultL2, done}),
                {set, setStyleByDefinition} = context;

            Layer2dVectorTile.prototype.setConfiguredLayerStyle.call(context);

            expect(set.calledOnce).to.be.true;
            expect(set.calledWith("selectedStyleID", "l2")).to.be.true;
            expect(setStyleByDefinition.calledOnce).to.be.true;
            expect(setStyleByDefinition.calledWith(vtStylesDefaultL2[1])).to.be.true;
        });

        it("uses services.json first style third", done => {
            const context = makeContext({givenVtStyles: vtStyles, done}),
                {set, setStyleByDefinition} = context;

            Layer2dVectorTile.prototype.setConfiguredLayerStyle.call(context);

            expect(set.calledOnce).to.be.true;
            expect(set.calledWith("selectedStyleID", "l1")).to.be.true;
            expect(setStyleByDefinition.calledOnce).to.be.true;
            expect(setStyleByDefinition.calledWith(vtStyles[0])).to.be.true;
        });

        it("does not apply any style else and warns in console", () => {
            const context = makeContext({givenVtStyles: []}),
                {set, setStyleById, setStyleByDefinition} = context;

            Layer2dVectorTile.prototype.setConfiguredLayerStyle.call(context);

            expect(set.notCalled).to.be.true;
            expect(setStyleById.notCalled).to.be.true;
            expect(setStyleByDefinition.notCalled).to.be.true;
            expect(warn.called).to.be.true;
        });
    });

    describe("addMpFonts", () => {
        it("returns Masterportal italic font if style is italic", () => {
            const italicFont1 = "Font italic",
                italicFont2 = "Font Italic",
                italicFont3 = "Fontitalic",
                returnedItalicFont1 = Layer2dVectorTile.prototype.addMpFonts(italicFont1),
                returnedItalicFont2 = Layer2dVectorTile.prototype.addMpFonts(italicFont2),
                returnedItalicFont3 = Layer2dVectorTile.prototype.addMpFonts(italicFont3);

            expect(returnedItalicFont1).to.equal("MasterPortalFont Italic");
            expect(returnedItalicFont2).to.equal("MasterPortalFont Italic");
            expect(returnedItalicFont3).to.equal("MasterPortalFont Italic");
        });

        it("returns Masterportal bold font if style is bold", () => {
            const boldFont1 = "Font bold",
                boldFont2 = "Font Bold",
                boldFont3 = "Fontbold",
                returnedBoldFont1 = Layer2dVectorTile.prototype.addMpFonts(boldFont1),
                returnedBoldFont2 = Layer2dVectorTile.prototype.addMpFonts(boldFont2),
                returnedBoldFont3 = Layer2dVectorTile.prototype.addMpFonts(boldFont3);

            expect(returnedBoldFont1).to.equal("MasterPortalFont Bold");
            expect(returnedBoldFont2).to.equal("MasterPortalFont Bold");
            expect(returnedBoldFont3).to.equal("MasterPortalFont Bold");
        });

        it("returns Masterportal font if style is not bold or italic", () => {
            const Font1 = "Font",
                Font2 = "Font Regular",
                Font3 = "Font Extra",
                returnedFont1 = Layer2dVectorTile.prototype.addMpFonts(Font1),
                returnedFont2 = Layer2dVectorTile.prototype.addMpFonts(Font2),
                returnedFont3 = Layer2dVectorTile.prototype.addMpFonts(Font3);

            expect(returnedFont1).to.equal("MasterPortalFont");
            expect(returnedFont2).to.equal("MasterPortalFont");
            expect(returnedFont3).to.equal("MasterPortalFont");
        });
    });

    describe("showFeaturesByIds", function () {
        it("should do nothing if first param is not an array", () => {
            let vtLayer = null,
                tileLoadFunction = null,
                source = null;

            vtLayer = new Layer2dVectorTile(attrs);
            source = vtLayer.getLayerSource();
            tileLoadFunction = source.getTileLoadFunction();
            vtLayer.showFeaturesByIds();
            expect(source.getTileLoadFunction()).to.deep.equal(tileLoadFunction);
        });
        it("should set tileLoadFunction", () => {
            let vtLayer = null,
                tileLoadFunction = null,
                source = null;

            vtLayer = new Layer2dVectorTile(attrs);
            source = vtLayer.getLayerSource();
            tileLoadFunction = source.getTileLoadFunction();
            expect(tileLoadFunction.name).to.be.equal("defaultLoadFunction");
            vtLayer.showFeaturesByIds([]);
            expect(source.getTileLoadFunction()).to.not.be.equal("defaultLoadFunction");
        });
    });

    describe("fetchSpriteData", () => {
        it("Creates a VectorTileLayer", async () => {
            const url = "https://testemich.de/vt/tiles/esri/Test_VT_3857/p12/resources/sprites/sprite.json",
                resp = {
                    config: {transitional: {}, transformRequest: Array(1), transformResponse: Array(1), timeout: 0},
                    data: {},
                    headers: {},
                    request: {onreadystatechange: null, readyState: 4, timeout: 0, withCredentials: false, upload: XMLHttpRequestUpload},
                    status: 200,
                    statusText: "OK"
                },
                axiosMock = sinon.stub(axios, "get").resolves(Promise.resolve(resp));

            await Layer2dVectorTile.prototype.fetchSpriteData.call(context, url);
            expect(axiosMock.calledOnce).to.be.true;
        });
    });
    describe("Use WebGL renderer", () => {
        it("Should create the layer with WebGL methods, if renderer: \"webgl\" is set", function () {
            const vectorLayer = new Layer2dVectorTile({...attributes, renderer: "webgl", isPointLayer: false}),
                layer = vectorLayer.getLayer();

            expect(vectorLayer.isDisposed).to.equal(webgl.isDisposed);
            expect(vectorLayer.setIsSelected).to.equal(webgl.setIsSelected);
            expect(vectorLayer.hideAllFeatures).to.equal(webgl.hideAllFeatures);
            expect(vectorLayer.showAllFeatures).to.equal(webgl.showAllFeatures);
            expect(vectorLayer.showFeaturesByIds).to.equal(webgl.showFeaturesByIds);
            expect(vectorLayer.setStyle).to.equal(webgl.setStyle);
            expect(vectorLayer.source).to.equal(layer.getSource());
            expect(layer.get("isPointLayer")).to.not.be.undefined;
        });
    });
});
