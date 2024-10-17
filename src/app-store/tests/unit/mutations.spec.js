import {expect} from "chai";
import mutations from "../../mutations";

const {setLoadedConfigs} = mutations;

describe("src/app-store/mutations.js", () => {
    describe("setLoadedConfigs", () => {
        it("Sets the loaded configJson to true", () => {
            const localState = {
                loadedConfigs: {
                    configJson: false,
                    restServicesJson: false,
                    servicesJson: false
                }
            };

            setLoadedConfigs(localState, "configJson");

            expect(localState.loadedConfigs.configJson).to.be.true;
            expect(localState.loadedConfigs.restServicesJson).to.be.false;
            expect(localState.loadedConfigs.servicesJson).to.be.false;
        });

        it("Sets the loaded all configs to true", () => {
            const localState = {
                loadedConfigs: {
                    configJson: false,
                    restServicesJson: false,
                    servicesJson: false
                }
            };

            setLoadedConfigs(localState, "configJson");
            setLoadedConfigs(localState, "restServicesJson");
            setLoadedConfigs(localState, "servicesJson");

            expect(localState.loadedConfigs.configJson).to.be.true;
            expect(localState.loadedConfigs.restServicesJson).to.be.true;
            expect(localState.loadedConfigs.servicesJson).to.be.true;
        });
    });
});
