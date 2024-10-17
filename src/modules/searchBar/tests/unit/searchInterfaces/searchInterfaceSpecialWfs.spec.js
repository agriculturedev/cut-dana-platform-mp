import {expect} from "chai";
import sinon from "sinon";
import SearchInterface from "../../../searchInterfaces/searchInterface.js";
import SearchInterfaceSpecialWfs from "../../../searchInterfaces/searchInterfaceSpecialWfs.js";

describe("src/modules/searchBar/searchInterfaces/searchInterfaceSpecialWfs.js", () => {
    let SearchInterface1 = null,
        checkConfigSpy;
    const searchResults = [
        {
            geometry: ["565931.982", "5935196.323", "565869.067", "5935016.323"],
            geometryType: "MultiPolygon",
            icon: "bi-house-fill",
            identifier: "Rotherbaum37",
            type: "common:modules.searchBar.specialWFS.ongoing"
        }];

    before(() => {
        checkConfigSpy = sinon.spy(SearchInterface.prototype, "checkConfig");
        SearchInterface1 = new SearchInterfaceSpecialWfs();

        i18next.init({
            lng: "cimode",
            debug: false
        });
    });

    afterEach(() => {
        SearchInterface1.clearSearchResults();
        sinon.restore();
    });

    describe("prototype", () => {
        it("SearchInterfaceSpecialWfs should has the prototype SearchInterface", () => {
            expect(SearchInterface1).to.be.an.instanceof(SearchInterface);
            expect(checkConfigSpy.calledOnce).to.be.true;
            expect(checkConfigSpy.firstCall.args[1]).to.be.deep.equals(["highlightFeature", "setMarker", "zoomToResult"]);
        });
    });

    describe("normalizeResults", () => {
        it("should normalize a search result", () => {
            expect(SearchInterface1.normalizeResults(searchResults)).to.deep.equals([
                {
                    category: "modules.searchBar.specialWFS.ongoing",
                    events: {
                        onClick: {
                            highlightFeature: {
                                hit: {
                                    coordinate: [[565931.982, 5935196.323, 565869.067, 5935016.323]],
                                    geometryType: "MultiPolygon"
                                }
                            },
                            setMarker: {
                                coordinates: [565931.982, 5935196.323, 565869.067, 5935016.323]
                            },
                            zoomToResult: {
                                coordinates: [565931.982, 5935196.323, 565869.067, 5935016.323]
                            }
                        },
                        onHover: {
                            highlightFeature: {
                                hit: {
                                    coordinate: [[565931.982, 5935196.323, 565869.067, 5935016.323]],
                                    geometryType: "MultiPolygon"
                                }
                            },
                            setMarker: {
                                coordinates: [565931.982, 5935196.323, 565869.067, 5935016.323]
                            }
                        }
                    },
                    icon: "bi-house-fill",
                    id: "SpecialWFS1",
                    name: "Rotherbaum37",
                    toolTip: "Rotherbaum37"
                }
            ]);
        });
    });

    describe("WFSXML", () => {
        it("should build the correct request", () => {
            const definitions = [
                {
                    "url": "https://geodienste.hamburg.de/HH_WFS_Bebauungsplaene",
                    "typeName": "app:hh_hh_festgestellt",
                    "propertyNames": [
                        "app:geltendes_planrecht"
                    ],
                    "geometryName": "app:geom",
                    "name": "common:modules.searchBar.specialWFS.terminated",
                    "namespaces": "xmlns:app='http://www.deegree.org/app'"
                }
            ];

            expect(SearchInterface1.getWFS110Xml(definitions[0], "abc")).to.equals(
                "<wfs:GetFeature service='WFS' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' xmlns:app='http://www.deegree.org/app' traverseXlinkDepth='*' version='1.1.0'>" +
                "<wfs:Query typeName='app:hh_hh_festgestellt'>" +
                "<wfs:PropertyName>app:geltendes_planrecht</wfs:PropertyName>" +
                "<wfs:PropertyName>app:geom</wfs:PropertyName>" +
                "<wfs:maxFeatures>20</wfs:maxFeatures>" +
                "<ogc:Filter>" +
                "<ogc:PropertyIsLike matchCase='false' wildCard='*' singleChar='#' escapeChar='!'><ogc:PropertyName>app:geltendes_planrecht</ogc:PropertyName><ogc:Literal>*abc*</ogc:Literal></ogc:PropertyIsLike>" +
                "</ogc:Filter></wfs:Query></wfs:GetFeature>"
            );
        });
    });

    describe("getInteriorAndExteriorPolygonMembers", () => {
        it("should return correct coordinateArray", () => {
            const polygonMembers = "<gml:Polygon xmlns:gml='http://www.opengis.net/gml' srsName='EPSG:25832'>" +
                    "<gml:exterior>" +
                        "<gml:LinearRing srsName='EPSG:25832'>" +
                            "<gml:posList>565762.142 5936207.082 565898.316 5936207.367</gml:posList>" +
                        "</gml:LinearRing>" +
                    "</gml:exterior>" +
                "</gml:Polygon>",
                parser = new DOMParser(),
                xmlData = parser.parseFromString(polygonMembers, "application/xml");

            expect(SearchInterface1.getInteriorAndExteriorPolygonMembers(xmlData.getElementsByTagNameNS("*", "Polygon"))).to.deep.equals(
                [
                    [565762.142, 5936207.082, 565898.316, 5936207.367]
                ]
            );
        });
    });

    describe("createPossibleActions", () => {
        it("should create possible events from search result", () => {

            expect(SearchInterface1.createPossibleActions(searchResults[0])).to.deep.equals(
                {
                    highlightFeature: {
                        hit: {
                            coordinate: [[565931.982, 5935196.323, 565869.067, 5935016.323]],
                            geometryType: "MultiPolygon"
                        }
                    },
                    setMarker: {
                        coordinates: [565931.982, 5935196.323, 565869.067, 5935016.323]
                    },
                    zoomToResult: {
                        coordinates: [565931.982, 5935196.323, 565869.067, 5935016.323]
                    }
                }
            );
        });
    });
});
