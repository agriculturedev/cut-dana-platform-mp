import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import CopyrightConstraints from "../../../components/CopyrightConstraints.vue";
import state from "../../../store/stateCopyrightConstraints";

config.global.mocks.$t = key => key;

// skipped: see https://lgv-hamburg.atlassian.net/browse/BG-5562
describe.skip("src/modules/copyrightConstraints/components/CopyrightConstraints.vue", () => {
    let store;
    const visibleLayers =
        [
            {
                "id": "453",
                "visibility": true,
                "baselayer": true,
                "name": "Geobasiskarten (HamburgDE)",
                "url": "https://geodienste.hamburg.de/HH_WMS_HamburgDE",
                "typ": "WMS",
                "layers": "Geobasiskarten_HHde",
                "format": "image/png",
                "version": "1.3.0",
                "singleTile": false,
                "transparent": true,
                "transparency": 0,
                "urlIsVisible": true,
                "tilesize": 512,
                "gutter": 0,
                "minScale": "0",
                "maxScale": "2500000",
                "gfiAttributes": "ignore",
                "gfiTheme": "default",
                "layerAttribution": "nicht vorhanden",
                "legendURL": "ignore",
                "cache": false,
                "featureCount": 1,
                "datasets": [
                    {
                        "md_id": "B6A59A2B-2D40-4676-9094-0EB73039ED34",
                        "csw_url": "https://metaver.de/csw",
                        "show_doc_url": "https://metaver.de/trefferanzeige?cmd=doShowDocument&docuuid=",
                        "rs_id": "https://registry.gdi-de.org/id/de.hh/001719df-6619-40b7-aefe-32e8aaf49337",
                        "md_name": "GeoBasisKarten Hamburg",
                        "bbox": "466251.4292773354,5844577.894672247,661887.1257872104,6042030.30978004",
                        "kategorie_opendata": [
                            "Umwelt"
                        ],
                        "kategorie_inspire": [
                            "kein INSPIRE-Thema"
                        ],
                        "kategorie_organisation": "Landesbetrieb Geoinformation und Vermessung"
                    }
                ],
                "notSupportedIn3D": false,
                "type": "layer",
                "showInLayerTree": true,
                "zIndex": 0,
                "is3DLayer": false,
                "infoFormat": "text/xml",
                "origin": [
                    442800,
                    5809000
                ]
            }
        ],
        constraints1 =
        [
            {
                "md_id": "B6A59A2B-2D40-4676-9094-0EB73039ED34",
                "title": "GeoBasisKarten Hamburg",
                "accessConstraints": "Es gelten keine Zugriffsbeschränkungen",
                "useConstraints": [
                    "Datenlizenz Deutschland Namensnennung 2.0",
                    "Quellenvermerk: Freie und Hansestadt Hamburg, Landesbetrieb Geoinformation und Vermessung (LGV)",
                    "..."
                ],
                "pointOfContact": {
                    "name": "Landesbetrieb Geoinformation und Vermessung (LGV) Hamburg",
                    "positionName": [
                        " GeoTopographie | B 2",
                        "Geschäftsbereich Geobasisinformationen"
                    ],
                    "street": "Neuenfelder Straße 19",
                    "housenr": "",
                    "postalCode": "D-21109",
                    "city": "Hamburg",
                    "email": "kartographie@gv.hamburg.de",
                    "phone": undefined,
                    "link": undefined,
                    "country": "DEU"
                }
            }
        ],
        constraints2 =
        [
            {
                "md_id": "4E67DF32-AAC0-4410-A215-4110F8D50BBD",
                "title": "100 Jahre Stadtgrün - Stadtpark und Volkspark",
                "useConstraints": [],
                "pointOfContact": {
                    "name": "Behörde für Umwelt, Klima, Energie und Agrarwirtschaft (BUKEA)",
                    "positionName": [
                        " Erstellen von Wertgutachten.",
                        " Sanierung u. Erhaltung.\nKosten- u. Wirtschaftlichkeits-Prüfungen u. Genehmigung von bedeutenden Landschaftsbauvorhaben;Techn. Aufsichtsinstanz für alle Maßnahmen im staatl. Landschaftsbau.\nFörderung umweltfreundlicher Technologie im staatlichen Landschaftsbau.\nKonzepte für die Verwertung und Recycling von Altbaustoffen.\nProgramme zum Umbau von Kleingartenanlagen; Gemeinnützigkeitsprüfung der Kleingartenvereine",
                        " Erarbeitung von Richtwerten für Neubau",
                        " zentrale Beschaffung",
                        "  Anlagequalitäten sowie Ausbau- und Ausstattungsgrundsätzen f. d. Ö.G..\nAufstellung von Veranschlagungsgrundsätzen für Landschaftsbaumaßnahmen.\nEntwicklung von Beschaffungs- und Vergabegrundsätzen",
                        " Bauweisen",
                        "Erarbeitung von Grundsätzen und Steuerungsinstrumenten für Bau- und Erhaltung für alle Grünarten im Ö.G..\nErarbeitung von Neubau- und Erhaltungsprogrammen im öffentlichen Grün (Ö.G.).\nErarbeitung von Qualitäts- u. Bewertungsmaßstäben für Materialen"
                    ],
                    "street": "Neuenfelder Straße 19",
                    "housenr": "",
                    "postalCode": "D-21109",
                    "city": "Hamburg",
                    "email": "stadtgruen@bukea.hamburg.de",
                    "country": "DEU"
                }
            }
        ];

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        CopyrightConstraints: {
                            namespaced: true,
                            state () {
                                return state;
                            },
                            getters: {
                                cswUrl: () => "https://gdk.gdi-de.org/gdi-de/srv/ger/csw"
                            }
                        }
                    }
                }
            },
            getters: {
                visibleLayerConfigs: () => visibleLayers
            }
        });
    });

    it("renders the CopyrightConstraints component", () => {
        const wrapper = mount(CopyrightConstraints, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.attributes().id).to.equal("copyrightConstraints");
        expect(wrapper.classes()).to.contain("infoText");
    });

    describe("copyrightConstraints.vue methods", () => {
        it("getMetaData returns an object with properties access and use", async () => {
            const wrapper = mount(CopyrightConstraints, {
                    global: {
                        plugins: [store]
                    }}),
                returnedMetaData = await wrapper.vm.getMetaData("B6A59A2B-2D40-4676-9094-0EB73039ED34");

            expect(returnedMetaData.getConstraints()).to.be.an("object").that.have.property("access");
            expect(returnedMetaData.getConstraints()).to.be.an("object").that.have.property("use").that.is.an("array");
        }).timeout(4000);
        it("getCswConstraints and rendered data", async () => {
            const wrapper = mount(CopyrightConstraints, {
                global: {
                    plugins: [store]
                }
            });

            wrapper.vm.getCswConstraints();
            await wrapper.setData({constraints: constraints1});

            let ullayerList = wrapper.find("ul.copyrightConstraints_layerList"),
                ulConstraintsList = wrapper.find("ul.copyrightConstraints_constraintsList"),
                ulPointOfContactList = wrapper.find("ul.copyrightConstraints_pointOfContact");

            expect(ullayerList.exists()).to.be.true;
            expect(ulConstraintsList.exists()).to.be.true;
            expect(ulPointOfContactList.exists()).to.be.false;

            await wrapper.setData({constraints: constraints2});

            ullayerList = wrapper.find("ul.copyrightConstraints_layerList");
            ulConstraintsList = wrapper.find("ul.copyrightConstraints_constraintsList");
            ulPointOfContactList = wrapper.find("ul.copyrightConstraints_pointOfContact");

            expect(ullayerList.exists()).to.be.true;
            expect(ulConstraintsList.exists()).to.be.false;
            expect(ulPointOfContactList.exists()).to.be.true;
        }).timeout(4000);
        it("getVisibleLayer returns an array", () => {
            const wrapper = mount(CopyrightConstraints, {
                    global: {
                        plugins: [store]
                    }}),
                layers = wrapper.vm.getVisibleLayer();

            expect(layers).to.be.an("array").to.have.lengthOf(1);
        });
    });
});
