const toolsNotToMigrate = [
        "compareFeatures",
        "addLayerRemotely",
        "bauforum",
        "boris",
        "commuterFlows",
        "cosi",
        "fileImportAddon",
        "formular",
        "geoAnalyze",
        "gfiOnAddress",
        "hochWasserPrint",
        "mietenspiegelFormular",
        "modeler3D",
        "oktagonKartenportal",
        "quickResponseCode",
        "refugeeHomes",
        "resetTree",
        "schoolRoutePlanning",
        "sessionTool",
        "showParcelGFI",
        "tacticalMark",
        "valuationPrint",
        "verkehrsfunctions",
        "vpiDashboard",
        "vueAddon",
        "wholeCityList",
        "staticlinks",
        "vcOblique",
        "coord",
        "styleWMS"
    ],
    removed = ["quickHelp", "saveSelection"],
    deprecated = ["searchByCoord", "supplyCoord", "parcelSearch", "extendedFilter", "wfsFeatureFilter"],
    // toRemoveFromTools => attributes not to provide at tool-configs in v3.0.0
    toRemoveFromTools = {
        "all": ["renderToWindow", "active", "isVisibleInMenu", "resizableWindow", "initialWidth", "glyphicon", "onlyDesktop"],
        "draw": ["enableAttributesSelector", "iconList", "addIconsOfActiveLayers"],
        "legend": ["showCollapseAllButton"],
        "layerSlider": ["sliderType"],
        "filter": ["deactivateGFI", "isInitOpen", "isGeneric"],
        "getFeatureInfo": ["name", "centerMapToClickPoint", "desktopType", "type"]
    },
    toRemoveFromConfigJs = ["footer", "defaultToolId", "gfiWindow", "scaleLine", "tree.layerIDsToIgnore", "tree.layerIDsToStyle", "tree.metaIDsToMerge", "tree.metaIDsToIgnore"],
    replacementsInConfigJson = {
        "menu.tools.parcelSearch": "modules.wfsSearch.parcelSearch",
        "modules.tools.wfsSearch": "modules.wfsSearch",
        "modules.tools.gfi": "modules.getFeatureInfo",
        "modules.footer": "modules.portalFooter",
        "modules.tools.layerSlider": "modules.layerSlider",
        "menu.filter": "modules.filter.name",
        "menu.contact": "modules.contact.name",
        "menu.info": "modules.info.name",
        "modules.tools.info": "modules.info",
        "menu.tools.print": "modules.print.name",
        "modules.searchbar": "modules.searchBar",
        "translate#common": "common",
        "translate#additional": "additional",
        "\"iconFor\":": "\"iconForward\":", // control "BackForward"
        "\"type\": \"gfi\"": "\"type\":\"getFeatureInfo\""// module gfi
    };

module.exports = {
    deprecated,
    removed,
    replacementsInConfigJson,
    toolsNotToMigrate,
    toRemoveFromConfigJs,
    toRemoveFromTools
};
