import sinon from "sinon";
import {expect} from "chai";
import actions from "../../../store/actionsLayerSwiper";
import {JSDOM} from "jsdom";

describe("actions", () => {
    let commit, dispatch, state, rootGetters, jsdom, map, originalDocument, originalWindow, originalKeyboardEvent, originalMouseEvent;

    before(() => {
        originalDocument = global.document;
        originalWindow = global.window;
        originalKeyboardEvent = global.KeyboardEvent;
        originalMouseEvent = global.MouseEvent;
        mapCollection.clear();
        map = {
            id: "ol",
            mode: "2D",
            render: sinon.spy(),
            getSize: sinon.stub().returns([800, 600])
        };

        mapCollection.addMap(map, "2D");
        jsdom = new JSDOM("<!doctype html><html><body></body></html>");
        global.document = jsdom.window.document;
        global.window = jsdom.window;
        global.KeyboardEvent = jsdom.window.KeyboardEvent;
        global.MouseEvent = jsdom.window.MouseEvent;
    });

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
        state = {
            valueX: 100,
            currentTimeSliderObject: {keyboardMovement: 5},
            active: true,
            targetLayer: {getLayer: () => ({once: sinon.stub()})},
            sourceLayer: {getLayer: () => ({once: sinon.stub()})}
        };
        rootGetters = {
            "Modules/WmsTime/TimeSlider/playing": false,
            "Maps/mode": "2D",
            "Modules/WmsTime/layerAppendix": "_appendix"
        };
    });

    afterEach(() => {
        global.document = originalDocument;
        global.window = originalWindow;
        global.KeyboardEvent = originalKeyboardEvent;
        global.MouseEvent = originalMouseEvent;
        sinon.restore();
    });

    it("should calculate new position and commit changes on mousemove", () => {
        const event = new MouseEvent("mousemove", {
            clientX: 150
        });

        actions.moveSwiper({state, commit, dispatch}, event);

        expect(commit.firstCall.args[0]).to.equal("setLayerSwiperValueX");
        expect(commit.firstCall.args[1]).to.equal(150);
        expect(commit.secondCall.args[0]).to.equal("setLayerSwiperStyleLeft");
        expect(commit.secondCall.args[1]).to.equal(150);
        expect(dispatch.calledWith("updateMap")).to.be.true;
    });

    it("should calculate new position and commit changes on keydown right arrow", () => {
        const event = new KeyboardEvent("keydown", {
            key: "ArrowRight"
        });

        actions.moveSwiper({state, commit, dispatch}, event);

        expect(commit.firstCall.args[0]).to.equal("setLayerSwiperValueX");
        expect(commit.firstCall.args[1]).to.equal(105);
        expect(commit.secondCall.args[0]).to.equal("setLayerSwiperStyleLeft");
        expect(commit.secondCall.args[1]).to.equal(105);
        expect(dispatch.calledWith("updateMap")).to.be.true;
    });

    it("should render map and handle layer prerender and postrender events", async () => {
        await actions.updateMap({state, rootGetters, dispatch});

        expect(map.render.called).to.be.true;
    });
});
