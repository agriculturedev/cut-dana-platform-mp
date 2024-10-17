import {expect} from "chai";
import sinon from "sinon";
import Layer3dEntities from "../../../js/layer3dEntities";

describe("src/core/js/layers/layer3dEntities.js", () => {
    let attributes,
        warn;

    before(() => {
        warn = sinon.spy();
        sinon.stub(console, "warn").callsFake(warn);
    });

    beforeEach(() => {
        attributes = {
            id: "id",
            name: "EntitiesLayer",
            typ: "Entities3D",
            visibility: false,
            entities: [
                {
                    "url": "the_url",
                    "attributes": {
                        "name": "einfaches Haus in Planten und Blomen"
                    },
                    "latitude": 53.5631,
                    "longitude": 9.9800,
                    "height": 16,
                    "heading": 0,
                    "pitch": 0,
                    "roll": 0,
                    "scale": 5,
                    "allowPicking": true,
                    "show": true
                }
            ]
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("createLayer", () => {
        let checkLayer;

        before(() => {
            /**
             * Checks the layer for attributes content.
             * @param {Object} layer the layer
             * @param {Object} terrainLayer the terrainLayer
             * @param {Object} attrs the attributes
             * @returns {void}
             */
            checkLayer = (layer, terrainLayer, attrs) => {
                expect(layer).not.to.be.undefined;
                expect(terrainLayer.get("name")).to.be.equals(attrs.name);
                expect(terrainLayer.get("id")).to.be.equals(attrs.id);
                expect(terrainLayer.get("typ")).to.be.equals(attrs.typ);
            };
        });

        it("new Layer3dEntities should create an layer with warning", () => {
            const layer3dEntities = new Layer3dEntities({});

            expect(layer3dEntities).not.to.be.undefined;
            expect(warn.notCalled).to.be.true;
        });

        it("createLayer shall create an entities layer", function () {
            const layer3dEntities = new Layer3dEntities(attributes),
                layer = layer3dEntities.getLayer();

            checkLayer(layer, layer3dEntities, attributes);
            expect(layer3dEntities.get("visibility")).to.equal(false);
        });

        it("createLayer shall create a visible entities layer", function () {
            Object.assign(attributes, {visibility: true});

            const layer3dEntities = new Layer3dEntities(attributes),
                layer = layer3dEntities.getLayer();

            checkLayer(layer, layer3dEntities, attributes);
            expect(layer3dEntities.get("visibility")).to.equal(true);
        });
    });
});
