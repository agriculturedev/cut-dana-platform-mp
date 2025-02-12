import {expect} from "chai";
import mutations from "../../../store/mutationsLayerInformation";

const {setLayerInfo} = mutations;

describe("src/modules/layerInformation/storemutationsLayerInformation.js", () => {
    describe("setLayerInfo", () => {
        it("should set the correct configs to state.layerInfo for single layer", () => {
            const state = {
                    layerInfo: {}
                },
                layerConf = {
                    baselayer: true,
                    cache: false,
                    datasets: [
                        {
                            bbox: "466251.4292773354,5844577.894672247,661887.1257872104,6042030.30978004",
                            csw_url: "https://metaver.de/csw",
                            kategorie_inspire: ["kein INSPIRE-Thema"],
                            kategorie_opendata: ["Umwelt"],
                            kategorie_organisation: "Landesbetrieb Geoinformation und Vermessung",
                            md_id: "B6A59A2B-2D40-4676-9094-0EB73039ED34",
                            md_name: "GeoBasisKarten Hamburg",
                            rs_id: "https://registry.gdi-de.org/id/de.hh/001719df-6619-40b7-aefe-32e8aaf49337",
                            show_doc_url: "https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid="
                        }
                    ],
                    featureCount: 1,
                    format: "image/png",
                    gfiAttributes: "ignore",
                    gfiTheme: "default",
                    gutter: 0,
                    id: "453",
                    infoFormat: "text/xml",
                    is3DLayer: false,
                    layerAttribution: "nicht vorhanden",
                    layers: "Geobasiskarten_HHde",
                    legendURL: "ignore",
                    maxScale: "2500000",
                    minScale: "0",
                    name: "Geobasiskarten (HamburgDE)",
                    notSupportedIn3D: false,
                    origin: [442800, 5809000],
                    showInLayerTree: true,
                    singleTile: false,
                    tilesize: 512,
                    transparency: 0,
                    transparent: true,
                    typ: "WMS",
                    type: "layer",
                    url: "https://geodienste.hamburg.de/HH_WMS_HamburgDE",
                    urlIsVisible: true,
                    version: "1.3.0",
                    visibility: true,
                    zIndex: 0
                };

            setLayerInfo(state, layerConf);

            expect(state.layerInfo).to.be.an("object").that.is.not.empty;
            expect(state.layerInfo.cswUrl).to.equals(layerConf.datasets[0].csw_url);
            expect(state.layerInfo.id).to.equals(layerConf.id);
            expect(state.layerInfo.layername).to.equals(layerConf.name);
            expect(state.layerInfo.layerNames).to.deep.equals([]);
            expect(state.layerInfo.legendURL).to.equals(layerConf.legendURL);
            expect(state.layerInfo.metaID).to.equals(layerConf.datasets[0].md_id);
            expect(state.layerInfo.customMetadata).to.equals(undefined);
            expect(state.layerInfo.attributes).to.equals(undefined);
            expect(state.layerInfo.showDocUrl).to.equals(layerConf.datasets[0].show_doc_url);
            expect(state.layerInfo.typ).to.equals(layerConf.typ);
            expect(state.layerInfo.url).to.equals(layerConf.url);
            expect(state.layerInfo.urlIsVisible).to.equals(layerConf.urlIsVisible);
        });

        it("should set the correct configs to state.layerInfo for group layer", () => {
            const state = {
                    layerInfo: {}
                },
                layerConf = {
                    baselayer: true,
                    children: [
                        {
                            cache: false,
                            datasets: [
                                {
                                    bbox: "466251.4292773354,5844577.894672247,661887.1257872104,6042030.30978004",
                                    csw_url: "https://metaver.de/csw",
                                    kategorie_inspire: ["kein INSPIRE-Thema"],
                                    kategorie_opendata: ["Umwelt"],
                                    kategorie_organisation: "Landesbetrieb Geoinformation und Vermessung",
                                    md_id: "B6A59A2B-2D40-4676-9094-0EB73039ED34",
                                    md_name: "GeoBasisKarten Hamburg",
                                    rs_id: "https://registry.gdi-de.org/id/de.hh/001719df-6619-40b7-aefe-32e8aaf49337",
                                    show_doc_url: "https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid="
                                }
                            ],
                            featureCount: 1,
                            format: "image/png",
                            gfiAttributes: "ignore",
                            gfiTheme: "default",
                            gutter: 0,
                            id: "4736",
                            layerAttribution: "nicht vorhanden",
                            layers: "M100000_schwarzgrau",
                            legendURL: "https://geodienste.hamburg.de/HH_WMS_Geobasiskarten_SG?language=ger&version=1.3.0&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=HH_WMS_Geobasiskarten_SG&format=image/png&STYLE=default",
                            maxScale: "132283",
                            minScale: "79370",
                            name: "M100000 (schwarz-grau)",
                            notSupportedFor3DNeu: false,
                            singleTile: false,
                            tilesize: 512,
                            transparency: 0,
                            transparent: true,
                            typ: "WMS",
                            url: "https://geodienste.hamburg.de/HH_WMS_Geobasiskarten_SG",
                            urlIsVisible: true,
                            version: "1.3.0"
                        },
                        {
                            cache: false,
                            datasets: [
                                {
                                    bbox: "466251.4292773354,5844577.894672247,661887.1257872104,6042030.30978004",
                                    csw_url: "https://metaver.de/csw",
                                    kategorie_inspire: ["kein INSPIRE-Thema"],
                                    kategorie_opendata: ["Umwelt"],
                                    kategorie_organisation: "Landesbetrieb Geoinformation und Vermessung",
                                    md_id: "B6A59A2B-2D40-4676-9094-0EB73039ED34",
                                    md_name: "GeoBasisKarten Hamburg",
                                    rs_id: "https://registry.gdi-de.org/id/de.hh/001719df-6619-40b7-aefe-32e8aaf49337",
                                    show_doc_url: "https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid="
                                }
                            ],
                            featureCount: 1,
                            format: "image/png",
                            gfiAttributes: "ignore",
                            gfiTheme: "default",
                            gutter: 0,
                            id: "12062",
                            layerAttribution: "nicht vorhanden",
                            layers: "M2500_schwarzgrau",
                            legendURL: "https://geodienste.hamburg.de/HH_WMS_Geobasiskarten_SG?language=ger&version=1.3.0&service=WMS&request=GetLegendGraphic&sld_version=1.1.0&layer=HH_WMS_Geobasiskarten_SG&format=image/png&STYLE=default",
                            maxScale: "3174",
                            minScale: "0",
                            name: "M2500 (schwarz-grau)",
                            notSupportedFor3DNeu: false,
                            singleTile: false,
                            tilesize: 512,
                            transparency: 0,
                            transparent: true,
                            typ: "WMS",
                            url: "https://geodienste.hamburg.de/HH_WMS_Geobasiskarten_SG",
                            urlIsVisible: true,
                            version: "1.3.0"
                        }
                    ],
                    id: "4736-12062",
                    is3DLayer: false,
                    layers: "M100000_schwarzgrau,M2500_schwarzgrau",
                    maxScale: 132283,
                    minScale: 0,
                    name: "Geobasiskarten (schwarz-grau)",
                    shortname: "Karte schwarz-grau",
                    showInLayerTree: true,
                    transparency: 0,
                    typ: "GROUP",
                    type: "layer",
                    visibility: true,
                    zIndex: 1
                };

            setLayerInfo(state, layerConf);

            expect(state.layerInfo).to.be.an("object").that.is.not.empty;
            expect(state.layerInfo.cswUrl).to.equals(layerConf.children[0].datasets[0].csw_url);
            expect(state.layerInfo.id).to.equals(layerConf.id);
            expect(state.layerInfo.layername).to.equals(layerConf.name);
            expect(state.layerInfo.layerNames).to.deep.equals([layerConf.children[0].name, layerConf.children[1].name]);
            expect(state.layerInfo.legendURL).to.equals(layerConf.legendURL);
            expect(state.layerInfo.metaID).to.deep.equals([layerConf.children[0].datasets[0].md_id, layerConf.children[1].datasets[0].md_id]);
            expect(state.layerInfo.customMetadata).to.equals(undefined);
            expect(state.layerInfo.attributes).to.equals(undefined);
            expect(state.layerInfo.showDocUrl).to.equals(layerConf.children[0].datasets[0].show_doc_url);
            expect(state.layerInfo.typ).to.equals(layerConf.typ);
            expect(state.layerInfo.url).to.deep.equals([layerConf.children[0].url, layerConf.children[1].url]);
            expect(state.layerInfo.urlIsVisible).to.equals(undefined);
        });
    });
});
