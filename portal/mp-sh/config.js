const Config = {
	"wfsImgPath": "./resources/img/",
	"namedProjections": [
		[
			"EPSG:25832",
			"+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
		]
	],
	"footer": {
		"urls": [
			{
				"bezeichnung": "common:modules.footer.designation",
				"url": "https://geoinfo.hamburg.de/",
				"alias": "Landesbetrieb Geoinformation und Vermessung",
				"alias_mobil": "LGV"
			}
		],
		"showVersion": true
	},
	"quickHelp": {
		"imgPath": "./resources/img/"
	},
	"layerConf": "https://geodienste.hamburg.de/services-internet.json",
	"restConf": "https://geoportal-hamburg.de/lgv-config/rest-services-internet.json",
	"styleConf": "https://geoportal-hamburg.de/lgv-config/style_v3.json",
	"scaleLine": true,
	"mouseHover": {
		"numFeaturesToShow": 2,
		"infoText": "(weitere Objekte. Bitte zoomen.)"
	}
};