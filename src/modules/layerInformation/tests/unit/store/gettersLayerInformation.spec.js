import {expect} from "chai";
import getters from "../../../store/gettersLayerInformation";

describe("src/modules/layerInformation/store/gettersLayerInformation.js", () => {

    it("urlParams", () => {
        const legendURL = "https://geodienste.hamburg.de/HH_WMS_DOP_belaubt?language=ger&version=1.3.0&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=dop_belaubt&format=image/png&STYLE=default",
            url = "https://geodienste.hamburg.de/HH_WMS_DOP_belaubt",
            state = {
                layerInfo: {
                    attributes: undefined,
                    cswUrl: "https://metaver.de/csw",
                    customMetadata: undefined,
                    id: "452",
                    layername: "Luftbilder DOP 20 (DOP 40 mit Umland)",
                    legendURL: legendURL,
                    metaID: "B3008A4D-BA8E-4FDB-8FDD-559D02975BD7",
                    showDocUrl: undefined,
                    typ: "WMS",
                    url: url,
                    urlIsVisible: true
                }},
            urlParamsState = getters.urlParams(state);

        expect(urlParamsState).to.be.an("object");
        expect(urlParamsState.layerInfo).to.be.an("object");
        expect(urlParamsState.layerInfo.id).to.be.equals("452");
        expect(urlParamsState.layerInfo.layername).to.be.equals("Luftbilder DOP 20 (DOP 40 mit Umland)");
        expect(urlParamsState.layerInfo.typ).to.be.equals("WMS");
        expect(urlParamsState.layerInfo.urlIsVisible).to.be.true;
        expect(decodeURIComponent(urlParamsState.layerInfo.cswUrl)).to.be.equals("https://metaver.de/csw");
        expect(decodeURIComponent(urlParamsState.layerInfo.legendURL)).to.be.equals(legendURL);
        expect(decodeURIComponent(urlParamsState.layerInfo.url)).to.be.equals(url);
    });

});
