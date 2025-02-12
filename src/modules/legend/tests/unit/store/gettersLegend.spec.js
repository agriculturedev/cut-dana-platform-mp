import {expect} from "chai";
import getters from "../../../store/gettersLegend";
import sinon from "sinon";

describe("src/modules/legend/store/gettersLegend.js", () => {

    afterEach(() => {
        sinon.restore();
    });

    it("isLayerInLegend", () => {
        const state = {
            legends: [
                {id: "layer1"},
                {id: "layer2"}
            ]
        };

        expect(getters.isLayerInLegend(state)("layer1")).to.be.true;
        expect(getters.isLayerInLegend(state)("layer2")).to.be.true;
        expect(getters.isLayerInLegend(state)("layer3")).to.be.false;
        expect(getters.isLayerInLegend(state)(undefined)).to.be.false;
        expect(getters.isLayerInLegend(state)(null)).to.be.false;
    });

    it("isLegendChanged", () => {
        const legendObj = {
                id: "layer1",
                name: "layer1Name",
                legend: ["string"],
                position: 0
            },
            state = {
                legends: [
                    {
                        id: "layer1",
                        name: "layer1Name",
                        legend: ["string"],
                        position: 0
                    },
                    {id: "layer2"}
                ]
            };

        expect(getters.isLegendChanged(state)(legendObj)).to.be.false;
        legendObj.legend = ["changed"];
        expect(getters.isLegendChanged(state)(legendObj)).to.be.true;
        state.legends = [{id: "layer2"}];
        expect(getters.isLegendChanged(state)(legendObj)).to.be.true;

    });

    it("urlParams", () => {
        const state = {
                legends: [
                    {
                        id: "layer1",
                        name: "layer1Name",
                        legend: ["https://geodienste.hamburg.de/HH_WMS_Verwaltungsgrenzen?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&FORMAT=image%2Fpng&LAYER=bezirke"],
                        position: 0
                    },
                    {
                        id: "layer2",
                        name: "layer2Name",
                        legend: ["https://geodienste.hamburg.de/HH_WMS_Dauerzaehlstellen_Rad?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&FORMAT=image%2Fpng&LAYER=dauerzaehlstellen_rad"],
                        position: 1
                    }
                ],
                type: "legend",
                name: "name",
                icon: "icon",
                sldVersion: "sldVersion"
            },
            urlParamsState = getters.urlParams(state);

        expect(urlParamsState).to.be.an("object");
        expect(urlParamsState.type).to.be.equals("legend");
        expect(urlParamsState.name).to.be.equals("name");
        expect(urlParamsState.icon).to.be.equals("icon");
        expect(urlParamsState.sldVersion).to.be.equals("sldVersion");
        expect(urlParamsState.legends).to.be.an("array");
        expect(urlParamsState.legends.length).to.be.equals(2);
        expect(urlParamsState.legends[0].id).to.be.equals("layer1");
        expect(urlParamsState.legends[0].name).to.be.equals("layer1Name");
        expect(urlParamsState.legends[0].position).to.be.equals(0);
        expect(decodeURIComponent(urlParamsState.legends[0].legend[0])).to.be.equals("https://geodienste.hamburg.de/HH_WMS_Verwaltungsgrenzen?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&FORMAT=image%2Fpng&LAYER=bezirke");
        expect(urlParamsState.legends[1].id).to.be.equals("layer2");
        expect(urlParamsState.legends[1].name).to.be.equals("layer2Name");
        expect(urlParamsState.legends[1].position).to.be.equals(1);
        expect(decodeURIComponent(urlParamsState.legends[1].legend[0])).to.be.equals("https://geodienste.hamburg.de/HH_WMS_Dauerzaehlstellen_Rad?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&FORMAT=image%2Fpng&LAYER=dauerzaehlstellen_rad");

    });

});
