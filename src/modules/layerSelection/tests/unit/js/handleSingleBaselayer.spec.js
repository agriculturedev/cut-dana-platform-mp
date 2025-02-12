import {expect} from "chai";
import singleBaselayerHandler from "../../../js/handleSingleBaselayer";

describe("src/modules/layerSelection/js/handleSingleBaselayer.js", () => {

    describe("checkAndAdd", () => {
        it("singleBaselayer is false, should do nothing", () => {
            const singleBaselayer = false,
                config = {
                    id: "id"
                },
                visibleBaselayerConfigs = [config],
                layerConfigs = [];

            singleBaselayerHandler.checkAndAdd(singleBaselayer, visibleBaselayerConfigs, layerConfigs);

            expect(layerConfigs.length).to.be.equal(0);
        });

        it("singleBaselayer is true and no baselayer visible", () => {
            const singleBaselayer = true,
                visibleBaselayerConfigs = [],
                layerConfigs = [];

            singleBaselayerHandler.checkAndAdd(singleBaselayer, visibleBaselayerConfigs, layerConfigs);

            expect(layerConfigs.length).to.be.equal(0);
        });

        it("singleBaselayer is true and one baselayer visible", () => {
            const singleBaselayer = true,
                config = {
                    id: "id"
                },
                visibleBaselayerConfigs = [config],
                layerConfigs = [];

            singleBaselayerHandler.checkAndAdd(singleBaselayer, visibleBaselayerConfigs, layerConfigs);

            expect(layerConfigs.length).to.be.equal(1);
            expect(layerConfigs[0]).to.be.deep.equal({
                id: config.id,
                layer: {
                    id: config.id,
                    visibility: false
                }
            });
        });
    });

});
