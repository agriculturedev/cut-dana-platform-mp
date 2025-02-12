import {treeBaselayersKey, treeSubjectsKey} from "../../../../../shared/js/utils/constants";
import replacer from "../../replaceInNestedValues.js";
import {expect} from "chai";

describe("src/shared/js/utils/replaceInNestedValues.js", () => {
    let layerConfig;
    const backGroundLayer = {
        id: "452"
    };


    beforeEach(() => {
        layerConfig = {
            [treeBaselayersKey]: {
                elements: [
                    {
                        id: "453",
                        visibility: true
                    },
                    backGroundLayer
                ]
            },
            [treeSubjectsKey]: {
                elements: [
                    {
                        id: "1132",
                        name: "100 Jahre Stadtgruen POIs",
                        visibility: true
                    },
                    {
                        id: "10220",
                        name: "Dauerzählstellen (Rad) Hamburg",
                        url: "https://geodienste.hamburg.de/HH_WMS_Dauerzaehlstellen_Rad",
                        typ: "WMS",
                        visibility: false,
                        layers: "dauerzaehlstellen_rad",
                        format: "image/png",
                        version: "1.3.0",
                        singleTile: true,
                        transparent: true,
                        transparency: 0,
                        urlIsVisible: true,
                        tilesize: 512,
                        gutter: 0
                    }
                ]
            }
        };
    });


    it("should return an empty array if only one param is given", () => {
        expect(replacer.replaceInNestedValues({})).to.be.empty;
    });

    it("should replace one element", () => {
        const replacement = {
                id: "453",
                visibility: true,
                name: "name",
                list: [{a: 1, b: 2}, {c: 3}]
            },
            result = replacer.replaceInNestedValues(layerConfig, "elements", replacement, {key: "id", value: replacement.id});

        expect(result).to.be.an("array");
        expect(result.length).to.be.equals(1);
        expect(result[0]).to.be.deep.equals(replacement);
        expect(layerConfig[treeBaselayersKey].elements[0]).to.be.deep.equals(replacement);
        expect(layerConfig[treeBaselayersKey].elements[1]).to.be.deep.equals(backGroundLayer);
    });

    it("should replace one element twice", () => {
        let result = null;
        const layer = {
                id: "453"
            },
            replacement = {
                id: "453",
                visibility: true,
                name: "name",
                list: [{a: 1, b: 2}, {c: 3}]
            };

        layerConfig[treeBaselayersKey].elements.push(layer);
        result = replacer.replaceInNestedValues(layerConfig, "elements", replacement, {key: "id", value: replacement.id});

        expect(result).to.be.an("array");
        expect(result.length).to.be.equals(2);
        expect(result[0]).to.be.deep.equals(replacement);
        expect(result[1]).to.be.deep.equals(replacement);
        expect(layerConfig[treeBaselayersKey].elements[0]).to.be.deep.equals(replacement);
        expect(layerConfig[treeBaselayersKey].elements[2]).to.be.deep.equals(replacement);
        expect(layerConfig[treeBaselayersKey].elements[1]).to.be.deep.equals(backGroundLayer);
    });

    it("should replace no element, obj must be unchanged", () => {
        const layerConfigCopy = {layerConfig},
            replacement = {
                id: "453",
                visibility: true,
                name: "name",
                list: [{a: 1, b: 2}, {c: 3}]
            },
            result = replacer.replaceInNestedValues(layerConfig, "elements", replacement, {key: "id", value: "abc"});

        expect(result).to.be.an("array");
        expect(result.length).to.be.equals(0);
        expect(layerConfig).to.be.deep.equals(layerConfigCopy.layerConfig);

    });

    it("should replace the whole element, not only the content - condition: replaceObject", () => {
        const replacement = [{
                id: "453_1",
                visibility: true,
                name: "name_1",
                list: [{a: 1, b: 2}, {c: 3}]
            },
            {
                id: "453_2",
                visibility: true,
                name: "name_2"
            }
            ],
            result = replacer.replaceInNestedValues(layerConfig, "elements", replacement, {key: "id", value: "453", replaceObject: "453"});

        expect(result).to.be.an("array");
        expect(result.length).to.be.equals(2);
        expect(layerConfig[treeBaselayersKey].elements[0]).to.be.deep.equals(replacement[0]);
        expect(layerConfig[treeBaselayersKey].elements[1]).to.be.deep.equals(replacement[1]);
        expect(layerConfig[treeBaselayersKey].elements[2]).to.be.deep.equals(backGroundLayer);

    });

    it("replace layers in special configuration with nested 'Ordner'", () => {
        const replacement = {
            id: "1103",
            name: "name"
        };
        let result = null;

        layerConfig = {
            [treeSubjectsKey]: {
                elements: [
                    {
                        id: "1132",
                        name: "100 Jahre Stadtgruen POIs",
                        visibility: true
                    },
                    {
                        id: "10220"
                    },
                    {
                        name: "Emissionen",
                        type: "folder",
                        elements: [
                            {
                                name: "Lärmschutzbereiche Flughafen Hamburg (FluLärmHmbV)",
                                type: "folder",
                                elements: [
                                    {
                                        id: "2431",
                                        visibility: false
                                    },
                                    {
                                        id: "2430",
                                        visibility: false
                                    },
                                    {
                                        id: "2429"
                                    },
                                    {
                                        name: "Überschwemmungsgebiete",
                                        type: "folder",
                                        elements: [
                                            {
                                                id: "1103",
                                                visibility: true
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        };

        result = replacer.replaceInNestedValues(layerConfig, "elements", replacement, {key: "id", value: "1103"}, "elements");
        expect(result).to.be.an("array");
        expect(result.length).to.be.equals(1);
        expect(result[0]).to.be.deep.equals(Object.assign(replacement, {visibility: true}));
    });

    it("should replace visibility of one element, but previous attributes should remain present", () => {
        const replacement = {
                id: "10220",
                visibility: true
            },
            result = replacer.replaceInNestedValues(layerConfig, "elements", replacement, {key: "id", value: replacement.id}),
            newResult = {
                id: "10220",
                name: "Dauerzählstellen (Rad) Hamburg",
                url: "https://geodienste.hamburg.de/HH_WMS_Dauerzaehlstellen_Rad",
                typ: "WMS",
                visibility: true,
                layers: "dauerzaehlstellen_rad",
                format: "image/png",
                version: "1.3.0",
                singleTile: true,
                transparent: true,
                transparency: 0,
                urlIsVisible: true,
                tilesize: 512,
                gutter: 0
            };

        expect(result).to.be.an("array");
        expect(result.length).to.be.equals(1);
        expect(result[0]).to.be.deep.equals(newResult);
        expect(layerConfig[treeSubjectsKey].elements[1]).to.be.deep.equals(newResult);
    });
});

