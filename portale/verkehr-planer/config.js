define(function () {

    var config = {
        title: "Planerportal-Verkehr",
        logo: "../img/hh-logo.png",
       wfsImgPath: "..components/lgv-config/img",
       allowParametricURL: true,
       view: {
           center: [565874, 5934140] // Rathausmarkt
       },
       layerConf: "../components/lgv-config/services-fhhnet-ALL.json",
       restConf: "../components/lgv-config/rest-services-fhhnet.json",
       styleConf: "../components/lgv-config/style.json",
       print: {
           printID: "99999",
           title: "Planerportal-Verkehr",
           gfi: false
       },
       proxyURL: "/cgi-bin/proxy.cgi",
       mouseHover: true,
       scaleLine: true,
       customModules: ["../portale/verkehr-planer/verkehrsfunctions"],
       startUpModul: "",
       searchBar: {
            minChars: 3,
            gazetteer: {
               minChars: 3,
               url: "/geodienste_hamburg_de/HH_WFS_DOG?service=WFS&request=GetFeature&version=2.0.0",
               searchStreets: true,
               searchHouseNumbers: true,
               searchDistricts: true,
               searchParcels: true
           },
          
           visibleWFS: {
               minChars: 3
           },
           tree: {
               minChars: 3
           },
           placeholder: "Suche nach Adresse/ Stadtteil/ Thema",
           geoLocateHit: true
       },
       gemarkungen: "../components/lgv-config/gemarkung.json"
   };

   return config;
});
