const Config = {
    addons: ["dataNarrator"],
    vuetify: "addons/dipasAddons/dataNarrator/vuetify",
    wfsImgPath: "./resources/img/",
    namedProjections: [
        ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]
    ],
    footer: {
        urls: [
            {
                "bezeichnung": "common:modules.footer.designation",
                "url": "https://elie.de/de",
                "alias": "Elie GmbH",
                "alias_mobil": "elie"
            }
        ],
        showVersion: true
    },
    quickHelp: {
        imgPath: "./resources/img/"
    },

    layerConf: "./resources/services-internet.json",
    restConf: "./resources/rest-services-internet.json",
    styleConf: "./resources/style_v3.json",
    storyConf: "./story.json",
    scaleLine: true,
    mouseHover: {
        numFeaturesToShow: 2,
        infoText: "(weitere Objekte. Bitte zoomen.)"
    },


};

// conditional export to make config readable by e2e tests
if (typeof module !== "undefined") {
    module.exports = Config;
}
