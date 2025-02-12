import {expect} from "chai";
import sinon from "sinon";
import addons from "../../../plugins/addons";
import main from "../../../main";
import store from "../../../app-store";


describe("src/plugins/addons.js", () => {
    let globalProperties,
        warnSpy,
        loadAddonStub,
        origCommit,
        origRegisterModule,
        gfiThemeAddons,
        loadAddonRet,
        searchInterfaceAddons;

    beforeEach(() => {
        gfiThemeAddons = [];
        searchInterfaceAddons = [];
        global.moduleCollection = {};
        globalProperties = {
            config: {
                globalProperties: {
                    $gfiThemeAddons: gfiThemeAddons,
                    $searchInterfaceAddons: searchInterfaceAddons
                }
            },
            component: sinon.stub()
        };
        sinon.stub(main, "getApp").returns(globalProperties);
        loadAddonRet = {name: "name", component: {name: "Component"}, store};
        loadAddonStub = sinon.stub(addons, "loadAddon").resolves(new Promise(resolve => resolve(loadAddonRet)));
        warnSpy = sinon.spy();
        sinon.stub(console, "warn").callsFake(warnSpy);
        origCommit = store.commit;
        origRegisterModule = store.registerModule;
        store.commit = sinon.spy();
        store.registerModule = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
        store.commit = origCommit;
        store.registerModule = origRegisterModule;
    });

    describe("loadAddons", () => {
        let stubLoadControls,
            stubLoadGfiThemes,
            stubLoadSearchInterfaces,
            stubLoadToolAddons,
            stubLoadJavascriptAddons;

        beforeEach(async () => {
            stubLoadControls = await sinon.stub(addons, "loadControls");
            stubLoadGfiThemes = await sinon.stub(addons, "loadGfiThemes");
            stubLoadSearchInterfaces = await sinon.stub(addons, "loadSearchInterfaces");
            stubLoadToolAddons = await sinon.stub(addons, "loadToolAddons");
            stubLoadJavascriptAddons = await sinon.stub(addons, "loadJavascriptAddons");
        });

        it("if config is undefined nothing happens", async () => {
            await addons.loadAddons([undefined]);
            expect(await stubLoadControls.notCalled).to.be.true;
            expect(await stubLoadGfiThemes.notCalled).to.be.true;
            expect(await stubLoadSearchInterfaces.notCalled).to.be.true;
            expect(await stubLoadToolAddons.notCalled).to.be.true;
            expect(await stubLoadJavascriptAddons.notCalled).to.be.true;
        });
        it("load addon control", async () => {
            const config = ["AddonControl"];

            await addons.loadAddons(config);
            expect(stubLoadControls.calledOnce).to.be.true;
            expect(stubLoadControls.firstCall.args[0]).to.be.equals("AddonControl");
            expect(stubLoadGfiThemes.notCalled).to.be.true;
            expect(stubLoadSearchInterfaces.notCalled).to.be.true;
            expect(stubLoadToolAddons.notCalled).to.be.true;
            expect(stubLoadJavascriptAddons.notCalled).to.be.true;
        });
        it("load addon gfiTheme", async () => {
            const config = ["AddonGFITheme"];

            await addons.loadAddons(config);
            expect(stubLoadGfiThemes.calledOnce).to.be.true;
            expect(stubLoadGfiThemes.firstCall.args[0]).to.be.equals("AddonGFITheme");
            expect(stubLoadControls.notCalled).to.be.true;
            expect(stubLoadSearchInterfaces.notCalled).to.be.true;
            expect(stubLoadToolAddons.notCalled).to.be.true;
            expect(stubLoadJavascriptAddons.notCalled).to.be.true;
        });
        it("load addon searchInterface", async () => {
            const config = ["SearchAddon"];

            await addons.loadAddons(config);
            expect(stubLoadSearchInterfaces.calledOnce).to.be.true;
            expect(stubLoadSearchInterfaces.firstCall.args[0]).to.be.equals("SearchAddon");
            expect(stubLoadControls.notCalled).to.be.true;
            expect(stubLoadGfiThemes.notCalled).to.be.true;
            expect(stubLoadToolAddons.notCalled).to.be.true;
            expect(stubLoadJavascriptAddons.notCalled).to.be.true;
        });

        it("load addon tool", async () => {
            const config = ["ToolAddon"];

            await addons.loadAddons(config);
            expect(stubLoadToolAddons.calledOnce).to.be.true;
            expect(stubLoadToolAddons.firstCall.args[0]).to.be.equals("ToolAddon");
            expect(stubLoadControls.notCalled).to.be.true;
            expect(stubLoadGfiThemes.notCalled).to.be.true;
            expect(stubLoadSearchInterfaces.notCalled).to.be.true;
            expect(stubLoadJavascriptAddons.notCalled).to.be.true;
        });

        it("load addon javascript", async () => {
            const config = ["JavaScriptAddon"];

            await addons.loadAddons(config);
            expect(stubLoadJavascriptAddons.calledOnce).to.be.true;
            expect(stubLoadJavascriptAddons.firstCall.args[0]).to.be.equals("JavaScriptAddon");
            expect(stubLoadControls.notCalled).to.be.true;
            expect(stubLoadGfiThemes.notCalled).to.be.true;
            expect(stubLoadSearchInterfaces.notCalled).to.be.true;
            expect(stubLoadToolAddons.notCalled).to.be.true;
        });
    });
    describe("loadControls", () => {
        it("load addon type control", async () => {
            await addons.loadControls("AddonControl");

            expect(loadAddonStub.calledOnce).to.be.true;
            expect(loadAddonStub.firstCall.args[0]).to.be.equals("AddonControl");
            expect(store.registerModule.calledOnce).to.be.true;
            expect(store.registerModule.firstCall.args[0]).to.be.deep.equals(["Controls", "Component"]);
            expect(store.registerModule.firstCall.args[1]).to.be.deep.equals(store);
            expect(store.commit.calledOnce).to.be.true;
            expect(store.commit.firstCall.args[0]).to.be.equals("Controls/registerControl");
            expect(store.commit.firstCall.args[1]).to.be.deep.equals({name: "component", control: {name: "Component"}});
        });
    });

    describe("loadGfiThemes", () => {
        it("load addon type gfiTheme", async () => {
            await addons.loadGfiThemes("AddonGFITheme");

            expect(loadAddonStub.calledOnce).to.be.true;
            expect(loadAddonStub.firstCall.args[0]).to.be.equals("AddonGFITheme");
            expect(store.registerModule.calledOnce).to.be.true;
            expect(store.registerModule.firstCall.args[0]).to.be.deep.equals(["Modules", "Component"]);
            expect(store.registerModule.firstCall.args[1]).to.be.deep.equals(store);
            expect(store.commit.notCalled).to.be.true;
            expect(gfiThemeAddons.length).to.be.equals(1);
            expect(gfiThemeAddons[0]).to.be.equals("Component");
            expect(Object.keys(moduleCollection).length).to.be.equals(1);
            expect(moduleCollection.component).to.be.deep.equals(loadAddonRet.component);
        });
    });

    describe("loadSearchInterfaces", () => {
        it("load addon type searchInterface", async () => {
            await addons.loadSearchInterfaces("SearchAddon");

            expect(loadAddonStub.calledOnce).to.be.true;
            expect(loadAddonStub.firstCall.args[0]).to.be.equals("SearchAddon");
            expect(store.commit.notCalled).to.be.true;
            expect(searchInterfaceAddons.length).to.be.equals(1);
            expect(searchInterfaceAddons[0]).to.be.deep.equals(loadAddonRet);
        });
    });

    describe("loadToolAddons", () => {
        it("load addon type tool", async () => {
            await addons.loadToolAddons("ToolAddon");

            expect(loadAddonStub.calledOnce).to.be.true;
            expect(loadAddonStub.firstCall.args[0]).to.be.equals("ToolAddon");
            expect(store.commit.notCalled).to.be.true;
            expect(store.registerModule.calledOnce).to.be.true;
            expect(store.registerModule.firstCall.args[0]).to.be.deep.equals(["Modules", "Component"]);
            expect(store.registerModule.firstCall.args[1]).to.be.deep.equals(store);
            expect(Object.keys(moduleCollection).length).to.be.equals(1);
            expect(moduleCollection.component).to.be.deep.equals(loadAddonRet.component);
        });
    });

    describe("loadJavascriptAddons", () => {
        it("load addon type javascript", async () => {
            await addons.loadToolAddons("JavaScriptAddon");

            expect(loadAddonStub.calledOnce).to.be.true;
            expect(loadAddonStub.firstCall.args[0]).to.be.equals("JavaScriptAddon");
            expect(store.commit.notCalled).to.be.true;
            expect(store.registerModule.calledOnce).to.be.true;
            expect(store.registerModule.firstCall.args[0]).to.be.deep.equals(["Modules", "Component"]);
            expect(store.registerModule.firstCall.args[1]).to.be.deep.equals(store);
        });
    });


});
