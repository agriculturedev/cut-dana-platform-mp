import sinon from "sinon";
import {expect} from "chai";

import actions from "../../../store/actionsWmsTime";
import initialState from "../../../store/stateWmsTime";
import layerCollection from "../../../../../core/layers/js/layerCollection";

describe("src/modules/wmsTime/store/actionsWmsTime.js", () => {
    let commit, dispatch, getters, rootGetters, state, map;

    before(() => {
        mapCollection.clear();
        map = {
            id: "ol",
            mode: "2D",
            removeLayer: sinon.spy()
        };

        mapCollection.addMap(map, "2D");
    });

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
        getters = {
            currentTimeSliderObject: {keyboardMovement: 5}
        };
        rootGetters = {
            "Modules/LayerSwiper/active": false,
            visibleLayerConfigs: [],
            layerConfigById: sinon.stub().returns({})
        };
        map.removeLayer = sinon.spy();
        sinon.stub(layerCollection, "getOlLayers").returns(
            [
                {name: "ersterLayer", values_: {id: "123"}, getSource: () => state.source, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"},
                {name: "zweiterLayer", values_: {id: "456"}, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"},
                {name: "dritterLayer", values_: {id: "789"}, features: [{getAttributesToShow: () => "TestAttributes"}], geometryType: "Point"}
            ]
        );
        sinon.stub(layerCollection, "getLayerById").returns({
            getLayerSource: () => ({params_: {TIME: "2020"}, updateParams: sinon.spy()}),
            attributes: {
                name: "bester Layer der Welt",
                id: "123",
                time: true,
                url: "www.abc.de",
                transparency: "30",
                level: "2",
                layers: "base",
                version: "1.3.0",
                parentId: "root",
                gfiAttributes: ["name", "time"],
                featureCount: 100
            },
            updateTime: sinon.spy()
        });
    });

    afterEach(sinon.restore);

    describe("toggleSwiper", () => {
        beforeEach(() => {
            commit = sinon.spy();
            dispatch = sinon.spy();
            state = {...initialState, layerSwiper: {active: false}};
        });

        it("should activate LayerSwiper if currently inactive", async () => {
            await actions.toggleSwiper({commit, state, dispatch, rootGetters}, "someId");

            expect(commit.calledWith("Modules/LayerSwiper/setActive", true, {root: true})).to.be.true;
            expect(commit.calledWith("Modules/LayerSwiper/setLayerSwiperSourceLayer")).to.be.true;
        });

        it("should deactivate LayerSwiper if currently active", async () => {
            rootGetters["Modules/LayerSwiper/active"] = true;

            await actions.toggleSwiper({commit, state, dispatch, rootGetters}, "someId");

            expect(commit.calledWith("Modules/LayerSwiper/setActive", false, {root: true})).to.be.true;
            expect(dispatch.calledWith("replaceByIdInLayerConfig")).to.be.true;
        });
    });

    describe("windowWidthChanged", () => {
        beforeEach(() => {
            state.timeSlider.currentLayerId = "123";
        });

        it("should call the mutation to set the windowWidth", () => {
            actions.windowWidthChanged({commit, dispatch, state, getters, rootGetters});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setWindowWidth"]);
        });
        it("should set the windowWidth and toggle the swiper if conditional is met", () => {
            rootGetters["Modules/LayerSwiper/active"] = true;

            actions.windowWidthChanged({commit, dispatch, state, getters, rootGetters});

            expect(commit.calledOnce).to.be.true;
            expect(commit.firstCall.args).to.eql(["setWindowWidth"]);
            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.firstCall.args).to.eql(["toggleSwiper", "123_secondLayer"]);
        });
    });
});
