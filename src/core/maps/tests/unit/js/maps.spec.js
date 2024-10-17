import load3DScript from "@masterportal/masterportalapi/src/lib/load3DScript";
import {expect} from "chai";
import sinon from "sinon";

import {initializeMaps, load3DMap} from "../../../js/maps";
import store from "../../../../../app-store";

describe("src/core/js/maps/maps.js", () => {
    let load3DScriptSpy,
        origGetters;

    before(() => {
        origGetters = store.getters;
    });

    beforeEach(() => {
        mapCollection.clear();
        load3DScriptSpy = sinon.spy(load3DScript, "load3DScript");
        store.getters = {
            cesiumLibrary: "path_to_cesium_library",
            controlsConfig: {
                button3d: true
            }
        };
    });

    afterEach(() => {
        store.getters = origGetters;
        sinon.restore();
    });

    describe("initializeMaps", () => {
        it("2D map should exists after createMaps and if button3d is configured, Cesium is loaded", () => {
            const portalConfig = {
                    portal: "config"
                },
                configJs = {
                    config: "js"
                };

            initializeMaps(portalConfig, configJs);

            expect(mapCollection.getMap("2D")).to.be.not.undefined;
            expect(load3DScriptSpy.calledOnce).to.be.true;
        });
        it("2D map should exists after createMaps and if button3d is not configured, Cesium is not loaded", () => {
            const portalConfig = {
                    portal: "config"
                },
                configJs = {
                    config: "js"
                };

            store.getters.controlsConfig.button3d = undefined;
            initializeMaps(portalConfig, configJs);

            expect(mapCollection.getMap("2D")).to.be.not.undefined;
            expect(load3DScriptSpy.notCalled).to.be.true;
        });

    });

    describe("load3DMap", () => {
        it("should trigger the masterportalapi function load3DScript", () => {
            const configJs = {
                config: "js"
            };

            load3DMap(configJs);

            expect(load3DScriptSpy.calledOnce).to.be.true;
            expect(load3DScriptSpy.firstCall.args[0]).to.equals("path_to_cesium_library");
            expect(typeof load3DScriptSpy.firstCall.args[1]).to.equals("function");
        });
    });
});
