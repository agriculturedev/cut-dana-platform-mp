# Changelog Masterportal
 All important changes in this project are stored in this file.

[Semantic versioning](https://semver.org/spec/v2.0.0.html) is used.

## Unreleased - in development
### __Breaking Changes__

### Added
- Measure-Tool: Added config parameter color for the measured lines and polygons.
- Menu: new config parameter showHeaderIcon to show the icon of the current component in the menu header.

### Changed

### Deprecated

### Removed
- Issue #1300: Migrator: The following attributes are removed from the search interface bkg when migrating, as they have no effect: `minCharacters`, `suggestCount`, `suggestServiceId`, `zoomLevel`, `zoomToResultOnClick` and `zoomToResultOnHover`.
- GetFeatureInfo: The attributes `imageLinks` and `maxWidth` have been removed from the gfiTheme `Default`, as the images are now rendered within the table.

### Fixed
- Issue #1121: For secured services that have the isSecured attribute, the lock icon is now displayed again.
- Issue #1242: The correct tooltip for the selected baselayer is now displayed in the baselayerSwitcher.
- Issue #1266: For layers whose ids are configured as an array, the visible range can now be restricted with `minScale` and `maxScale` in config.json.
- Issue #1272: Prevents MDID layer IDs from being removed when setting layer IDs, when a shared link with both layer IDs and MDIDs is opened.
- Issue #1280: showInLayerTree can be set up to false.
- Issue #1287: The layers are now added to the topic tree in the same order in the layer selection when you click on `add all`.
- Issue #1288: fixed crash that occurred when resetting `compareMaps` without selected layers.
- Issue #1291: fixed reset of tool `compareMaps` to prevent layers from being removed from the layer tree.
- Issue #1300:
    - Searchbar: The EPSG code 25832 is now set as the default value in the search interface bkg.
    - Migrator: The attribute `geosearchServiceId` in the search interface bkg is now correctly renamed to `geoSearchServiceId`.
- Issue #1308:
    - The postal code is now correctly placed before the city in the about module
    - The `logo` and `version` in the about module can now be overwritten in config.json and shown or hidden.
- wfst: layers that are not in services.json are supported.
- 3D: Fixed issue where the 3D view would not launch when button3d was configured under controls.expandable in config.json.
- Routing: The routing now also finds addresses with spaces and umlauts when the address search is carried out with the Locationfinder search interface.

---

## 2024-11-15 v3.4.1

### Fixed
- Searchbar: the search in search results shows results and no error occurs.
- Filter: for FilterSnippets on gfiAttributes with object definition the title is now taken from the gfiAttribute.

---

## 2024-11-06 v3.4.0

### Added
- AddWMS: Added Information about CORS header to doc and changed error message.
- ShareView: Error handling when sharing via QR code has been improved.
- Maps: add filter to getFeature Request in zoomToGetAndFilterFeatures function.
- Routing: Added checkbox to determine if routes stay visible after closing the routing tool
- Login: Documentation was added to [config.js](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/doc/config.js.md).
- Filter supports secure WFS request.
- ShareView: Added hashtag to shared link to share link correctly.
- LayerInformation: Added last revision date to Layer Information.

### Changed
- The following packages have been updated:
    - dependencies:
        - @masterportal/masterportalapi: 2.40.0 to 2.41.0

### Removed
- Deleted the `namespaces` option, as it is not a valid configuration for `createStore`, and also removed it from the `docs/Dev/unitTestVue.md` tutorial.
- Renamed versionLatest to versionLatestDisabled in package.json, so that latest tag is not created until renamed back at the end of december.

### Fixed
- Fixed the issue that the legend information was empty when an empty legend-object was passed to the legend component.
- Corrected link for geodata infrastructure information pdf by GDI-DE.
- Issue #1238: fixed `CQL_FILTER` URL parameter sending invalid `undefined` values.
- Issue #1247: Grouped layer: added attribute `children` in config.json to overwrite attributes for single grouped layers, more see [Grouped layer](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/docs/Dev/groupedLayers.md).
- Issue #1276: Duplicate icons StartModule in expandable ControlBar.
- Issue #1286: i18next: Correct time patterns for missing key, converting 'HH.MM' to 'HH:MM'.
- Issue #1294: PoiChoice: Fixed translation for "customPosition",  PoiOrientation: Fixed layout for the list of POI items.
- `tree.type: auto`: layers configured in config.json do overwrite configuration in services.json.
- Fixed issue with German translation not displaying in styleVT and wfsSearch modules.
- Print:
    - Group layers of different `typ` are printed.
    - Fixed opacity for wfs group layers.
- WFST: The attribute names are now fully visible and no longer overlapped.
- BuildPortal: Fixed mastercodeVersionFolderName to never include whitespaces or colons to avoid an error being thrown, if the version you are building in includes them.
- Searchbar: The action "Show topic in folder" was fixed.
- i18next: Modified missing key handling to retain namespace prefixes.

---

## 2024-11-05 v3.3.2 (LTS)

### Added
- Issue #1247: Grouped layer: added attribute children in config.json to overwrite attributes for single grouped layers, more see [Grouped layer](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/docs/groupedLayers.md).

### Fixed
- Print: Group layers of different `typ` are printed.

---

## 2024-10-09 v3.3.1 (LTS)

### Fixed
- Reduced loading requests for layers defined as array of Ids (not of typ GROUP).
- Print: Fix printing bug considering minScale and maxScale with layers defined as array of ids.
- LayerInformation: Resolved an issue where the tab appeared due to layerInfo.url being undefined instead of null in the layerInformation component.

---

## 2024-10-02 v3.3.0 (LTS)

### Added
- Release Schedule and release information to readme.md.
- FileImport: Added the possibility to configure the confirmation window to show or not.
- Searchbar: mapMarker or polygonMarker stays visible on close of search results.

### Fixed
- AlertingItem: Fixed the position of closing button.
- Issue #1166: function isHTML now recognizes more HTML tags in one String as valid.
- Issue #1179: Add Parameter "WithCredentials" to highlightFeaturesByAttribute axios request, so that it works with secured layers.
- LayerInfoContactButton: no warning in console, if at layer `md_name` ist not available in `datasets`.
- LayerSelection: `tree.type: auto`: change of category creates correct folders.
- Draw_old: import KML file works correctly.
- GroupLayer: Layer of the type group consider now min and max scale of the single layer in 2D.

---

## 2024-09-19 v3.2.2
### Fixed
- 3D: `tree.type: auto` 3D layers can also be selected in the subject tree if additional layers are configured in config.json under `subjectlayer`.

---

## 2024-09-12 v3.2.1
### Fixed
- UrlParams:
    - mapMarker: Fixed map marker set by url parameter.
    - layerIds: if a layerId in params is part of a baselayer group, the group is loaded.

---

## 2024-09-04 v3.2.0
### Added
- WFST: Added buttons names for confirm and stop.
- Alerting: Examples for the configuration of messages have been added to the alerting documentation.
- Modeler3D: Modeler3D was added
- LayerTree:
    - In SubMenu added button to open contact form with layer specific parameters to be used in email.
    - Adds parameter buttonTitle in addLayerButton to enable to configure the button title.

### Changed
- LayerSelection
    - Switches layer categories selection from <select.. to <radio.. using a collapsed list open/close within a IconButton.
    - Adds handling for parameters in `config.json`/`portalConfig.tree`:
        - `hideBackgroundsHeader` to hide the headline for backgrounds
        - `backgroundsHeaderText` custom headline for the backgrounds (to overwrite the default translation)
        - `hideDatalayerHeader` to hide the headline for datalayers
        - `datalayerHeaderText` custom headline for the datalayers (to overwrite the default translation)
- Login:
    - Access Tokens are now revoked after logout.
    - The WMS-Time layer are now available after you have logged in with the login module.
- The following packages have been updated:
    - dependencies:
        - @masterportal/masterportalapi: 2.39.0 to 2.40.0
        - axios: 1.7.1 to 1.7.7
        - chart.js: 4.4.3 to 4.4.4
        - i18next: 23.11.5 to 23.15.1
        - i18next-http-backend: 2.5.2 to 2.6.1
        - qrcode: 1.5.3 to 1.5.4
        - three: 0.165.0 to 0.168.0
    - devDependencies:
        - @eslint/js: 9.3.3 to 9.10.0
        - @geoblocks/print: 0.7.8 to 0.7.9
        - @sinonjs/fake-timers: 11.2.2 to 13.0.1
        - @stylistic/eslint-plugin-js: 2.2.1 to 2.8.0
        - @vue/compiler-sfc: 3.3.4 to 3.5.4
        - @vue/devtools-api: 6.5.0 to 6.6.4
        - @vue/test-utils: 2.4.1 to 2.4.6
        - chai: 4.4.1 to 5.1.1
        - eslint-plugin-jsdoc: 48.2.7 to 50.2.2
        - eslint-plugin-mocha: 10.4.3 to 10.5.0
        - eslint-plugin-n: 17.9.0 to 17.10.2
        - eslint-plugin-vue: 9.25.0 to 9.28.0
        - eslint-plugin-vuejs-accessibility: 2.3.0 to 2.4.1
        - globals: 15.4.0 to 15.9.0
        - mocha: 10.4.0 to 10.7.3
        - sinon-chai: 3.7.0 to 4.0.0
        - vue-loader: 17.3.0 to 17.4.2
        - zip-a-folder: 3.1.6 to 3.1.7
- Import GeoJson
    - GFI attributes are added in the import of a standard GeoJson
    - Supports a new structure of the draw style properties which are set in the export of the draw tool as well as the old ones
    - Adds a custom styling option for GeoJson/ Json import
- Export from draw_old tool: update GeoJSON export from draw_old tool to encapsulate all draw specific properties in a masterportal_attributes property; printing, file import and exporting other formats than GeoJSON were adapted accordingly
- Searchbar in topic tree: More than one searchinterface is supported. Results are shown under category headers.

### Deprecated
- Searchbar in topic tree config.json configuration: 'searchInterfaceInstances' must contain the search interfaces to use. 'searchInterfaceInstanceIds' and 'searchCategory' are deprecated.

### Fixed
- Legend: Same legends of group layers are shown only once.
- Filter: The buttons were always disabled in the accordion of the filter.
- LayerSelection: After layer category switch the visible background layer were removed from layer selection.
- Issue #1224: SecondaryMenu for mobile after closing allows to select coordinates.
- GetFeatureInfo: Images are displayed and the size of images was adapted.
- Login: Access Tokens are now revoked after logout
- OAF-Layer: if parameter 'bbox' is not set, the 'bbox' in parameter 'datasets' is used. Fallback is maps extent.
- Print: Fixed error messages when zooming after map printing is closed
- UrlParams:
        - mapMarker: Fixed map marker set by url parameter.
        - layerIds: if a layerId in params is part of a baselayer group, the group is loaded.
- Styling: the config.json parameter `tree.layerIDsToStyle` is taken into account for all tree-types.

---

## 2024-08-07 v3.1.0
### Added
- SearchBar: Added the possibility to zoom to an extent from a search result.
- StatisticDashboard:
    - Updated UI of the filter to match the MP 3.0 Design.
    - Dropdowns now sort the selected entries always at the top.
    - Statistics from different categories are now listed together in a dropdown when multiple categories are selected.
    - Legend can now use different classifications to show data for the choropleth map and the legend.
    - The number of data in the diagrams has been limited to a maximum value as this ensures better clarity. Once the maximum value has been reached, a selection option is provided with which the data can be searched for manually.
    - Uses the OAF scheme request to load unique values faster.
    - Added export button for CSV export.
    - The name of multi selected statistics will be shown in a carousel.
    - Coordinate reference system and epsg code for OAF services are now configurable with parameter oafRequestCRS and oafDataProjectionCode.
    - Extended region filter
    - Button "All" for selecting all the regions and all in dropdown of districts and cities.
- OAF: Added scheme request function in the api folder for the getOAFFeature file. This can be used for an easy and fast way to gather unique values.
- ViewPoint: Migrated from dev to dev_vue.
- Matomo: Added Support for analytics via matomo.
- Migrator: supports ids with suffix.
- InputText: Added change event handler property and disabled property.
- BaseLayerSwitcher: Added Config-Parameter singleBaseLayer to hide previous selected BaseLayer
- Shareview: If the portal is not running on HTTPS, a message is displayed because the URL cannot then be copied to the clipboard.
- AboutModule:
    - Added data privacy section.
    - Added accessibility section.
    - Added imprint title.
    - Added contact button to open contact module.
    - Added sales tax identification number.
- Footer: Added link to open imprint in about module.
- LayerInfo:
    - Added contact information
    -  Added button to open contact form using the address data from the metadata as the addressee (to parameter)
- ContactFormular:
    - Posibility to send attached pdf from the contact us section.
    - Check for the sum of all attachments size.
    - Check if the same attachment is not already added and don't allow for duplicates.
    - Added info message at the top of the contact form
    - Can be opened from other components using props, which allow a different addressee (to) to be used from the one set in config.json
- Print: Parameter additionalLayer to add layer (e.g. coordinate grid) during print.

### Changed
- Eslint: no-undef eslint rule is switched on.

### Fixed
- Fix migration of login module to Masterportal v3
- Issue #1192: Searchbar: The TopicTree search interface supports the search for folders.
- Issue #1219: AddWMS: Corrected z-index for imported layers if only on baselayer is initial visible.
- Issue #1232: Searchbar: The TopicTree search interface does not fail on configured `resultEvents`.
- Added missing parentheses in v-for loops
- StatisticDashboard:
    - Statistics and Regions are sorted alphabetically.
    - The information text will show under legend when there are more than one statistics selected.
    - Unit test warnings.
    - mapGetters and mapMutations in components.
- LayerPreview for WMTS uses the crs of the service.
- Legend: changed the name in the legend for group and baselayer.
- OAF-Layer: bbox and bboxCrs are respected when building url.
- Auto portal: search in LayerSelection works.
- Print:
    - print mask is now visible for group layer
    - zIndex and transparency from the group layer are also adopted in printing
- Filter: onDownloadProgress function will be commented out in axios in filter.
- LayerInformation: The entry `show_doc_url` in the metadata is now used again to retrieve further information.
- Menu: HTML entities are now decoded for folders in the menu
- Migrator:
    - Alt tag for portal logo is now used as tooltip and alt tag.
    - Placeholder of the search bar is now adopted.
    - The komoot search interface is now renamed komootPhoton.
    - Corrected console output concerning not migrated tools.
- BaselayerSwitcher: if 2 baselayers are configured, switcher is displayed.
- Cesium library is only loaded, if button to switch to 3D is configured.
- Layertree: if no button to add layers is configured, layers cannot be removed by drop outside.
- Issue #1198: WMS link can contain "?".
- ContactFormular:
    - removed attachments are not being send.
    - uploading attachments separately doesn't remove previously added attachments.
- Graphical Select: Fixed an issue where the drawn geometry was not correctly displayed after unmounting and remounting the component.
- Topic tree/Search bar
    - Scrollbars have been adjusted so that they only appear in the Firefox browser when they are needed.
    - The results of the `topicTree` search are no longer displayed twice in Firefox.
    - With the `topicTree` search, you can now access the layerSelection via the folder icon, even if no search is configured in the layerSelection.

---
## 2024-06-27 v3.0.0
### __Breaking Changes__
- GetFeatureInfo:
    - module was renamed from `gfi`.
    - `desktopType` was removed, `detached` and `attached` are no longer provided, getFeatureInfo is displayed in sidebar.

- Moved config.json-Parameter `twoFingerPan` from `portalConfig.map.mapView` to `portalConfig.map.mapView.mapInteractions.interactionModes`.

Under the headline `deprecated` you can find several changes of removed deprecated properties and tools.
In certain circumstances this means that you have to update your portal files (index.html, config.js and config.json) according to the new changes in order to use your portal furthermore.

### Added
- Added config.json-Parameter `Portalconfig.tree.singleBaselayer`. Specifies whether only one base layer may be active at any time selectable by radio-buttons in visible layers.
- Added config.json-Parameter `Portalconfig.tree.showFolderPath`. Determines whether the folder structure of visible layers is displayed. Default is false.
- Added Shared Component for spinner.
- Added Shared Component for accordion.
- Added Shared Component for table with sort,display and download options.
- ShareView:
    - Legend, Layer information, getFeatureInfo, draw_old and wfsSearch can be shared.
    - bufferAnalysis can be shared even if it is configured in both menus.
- 3D: Min- and MaxScale are now available for layers.
- Print: An option "Improve scaling resolution" is implemented for 3d Layers to supply an improved and better resolution.
- WfsSearch:
    - A prop `resetParcelSearch`, so that the wfs search parameter could be resetted from outside component.
    - A prop `zoomLevelProp`. Can be used to set a zoom level (after search) that is different from the configured one.
- Filter:
    - A new parameter `closeGfi` to give an option if a gfi window is open, and it could be closed after a new filtering.
    - A new parameter `universalSearch` in snippet with type "featureInfo" to enable to search the attribute value in webpage.
    - A new parameter `beautifiedAttrName` in snippet with type "featureInfo" to supply beautified names for attributes.
    - A new parameter `adjustOnlyFromParent` in snippet (up to now only for "Dropdown" type) to allow adjust just from parent snippet.
    - A new parameter `linkText` to show a url link to the current filter setting at the bottom of the filter component.
    - A new parameter `allowEmptySelection` in snippet with type "dropdown" to allow all values to be deselected.
    - A new component `SnippetChart`. SnippetChart can be configured as a one of the filter snippets and renders a chart as a visual representation of the data that result from the current filter settings. Makes use of BarchartItem (LinechartItem and PiechartItem may be added in the future), which uses the chart.js library and its various configuration options.
    - A new parameter `alternativeTextForEmptyChart` in snippet type "chart" that can be displayed instead of chart.
    - A new parameter `initialStartupReset` which allows to show a reset button and reset the filter back to initial setup. It prevents the adjusting so it should not be used as a reset for filter configurations without a child snippet.
    - A new parameter `subtitle` in snippet type "chart" which allows to display any combination of text and data as a subtitle.
    - A new parameter `tooltipUnit` in snippet type "chart" that can be used to add a unit to the numbers shown in tooltip.
- LayerTree: A paramter `isNeverVisibleInTree` for layer config to supply an option to hide the layer in tree but can be loaded.
- PoiOrientation:
    - The result window can now be moved.
    - New parameter `onlyFilteredFeatures` introduced, so that only filtered features are displayed in the results window.
- Grouped layers are supported.
- Script to migrate masterportal configuration files to version 3.0.0 migrates layertree with folder structure ("Ordner" in config.json version 2) and group layers.
- Added general CQL filter support for layers and WMS support to add CQL filters by attribute.
- Doc-files explaining migrateConfig script are added.
- Control rotate: has been extended by two buttons to rotate the map clockwise and counterclockwise. A compass rose can be shown in 2D and 3D.
- Tooltips for layernames and folders.
- Addons of type "javascript" or "control" can be loaded.
- Map: on touch devices the map can be moved with two fingers, if `twoFingerPan` is true in config.json.
- FeatureLister: layers of typ OAF are supported.
- StatisticDashboard:
    - Can now load data from an OAF Rest API if an OAF layer is configured.
    - Reset All button.
    - Validation function in filter form.
    - Configurable number of classes and base color for choropleth map and legend.
- TableComponent: New prop `sortByNumericValue`: Optional, defaults to false. If set to true, data elements are compared by their parsed numeric value when user triggers sorting. (By default, they are sorted by their string value.)
- Search for address via URL-Parameter.
- The following packages have been added:
    - dependencies:
        - globals: 15.4.0
    - devDependencies:
        - @eslint/js: 9.3.3
        - eslint-plugin-jsdoc: 48.2.7,
        - eslint-plugin-mocha: 10.4.3,
        - eslint-plugin-n: 17.9.0,
        - @stylistic/eslint-plugin-js: 2.2.1
- Added several WFS-T fixes and improvements.
- Added `searchType` to treeSearch with default search by name otherwise md_name of dataset can be used.
- Added possibility to fit layer extent from layer capabilities.
- Introduced a new `compareMaps` tool that allows users to compare two different layers side by side. This tool provides functionalities for selecting and displaying two layers simultaneously, with a swiper control to adjust the visibility of each layer interactively. Users can switch between vertical and horizontal split directions for better visualization.

### Changed
- CoordToolkit: Toast added instead of Alert for feedback after copying coordinates.
- ShareView: Added more configuration. Sharing possibilities (Qr code, social media, ...) can now be customized.
- LayerMenu: Breadcrumbs with folder location path will now stick to the top when scrolling.
- 3D tileset layer supports hiddenFeatures.
- Update node version to 20.12.2.
- The following packages have been updated:
    - dependencies:
        - @masterportal/masterportalapi: 2.33.0 to 2.39.0 (This also raised ol to version 9.2.4 and @cesium/engine to 9.2.0)
        - @masterportal/mpconfigparser: 1.3.1 to 1.4.0
        - axios: 1.5.1 to 1.7.1
        - bootstrap: 5.3.2 to 5.3.3
        - bootstrap-icons: 1.11.1 to 1.11.3
        - chart.js: 4.4.0 to 4.4.3
        - i18next: 23.5.1 to 23.11.5
        - i18next-browser-languagedetector: 7.1.0 to 8.0.0
        - i18next-http-backend: 2.2.2 to 2.5.2
        - i18next-vue: 3.0.0 to 4.0.0
        - jsts: 2.11.0 to 2.11.3
        - vue-multiselect: 3.0.0-beta.3 to 3.0.0
    - devDependencies:
        - @sinonjs/fake-timers: 11.1.0 to 11.2.2
        - chai: 4.3.10 to 4.4.1
        - css-loader: 1.0.1 to 4.3.0
        - esbuild-loader: 4.0.2 to 4.1.0
        - file-loader: 2.0.0 to 6.2.0
        - fs-extra: 11.1.1 to 11.2.0
        - husky: 8.0.3 to 9.0.11
        - jsdoc: 4.0.2 to 4.0.3
        - markdown-it: 13.0.2 to 14.1.0
        - mocha: 10.2.0 to 10.4.0
        - regenerator-runtime: 0.14.0 to 0.14.1
        - replace-in-file: 7.0.1 to 7.1.0
        - sass: 1.69.0 to 1.77.2
        - sinon: 16.1.0 to 18.0.0
        - webpack-bundle-analyzer: 4.9.1 to 4.10.2
        - zip-a-folder: 3.1.3 to 3.1.6
        - eslint-plugin-vuejs-accessibility: 2.2.0 to 2.3.0
        - eslint-plugin-vue: 9.17.0 to 9.25.0

- Changed prePushHook to check config.json with mpconfigparser for version 3.0.0.
- Restructured `highlightFeature` and `removeHighlighting`.
- Improved mobile view handling e.g. through adaption of the media breakpoints.
- Script to migrate masterportal configuration files to version 3.0.0 is ready to use.
- Styling for Search Results to match topic tree.
- GetFeatureInfo: Added mutation removeGfiFeatureByLayerId to remove a GfiFeature by given layerId.
- Remove only Version 2 relevant information from docs, jsdoc and functions.
- The `layerSwiper` functionality has been refactored and moved into the shared modules.

### Deprecated
- Alerting: removed deprecated property `text`, use `content` instead.
- Wfst:
    - removed deprecated property `show`, use `available` instead.
    - removed deprecated property `areaButton`, use `polygonButton` instead.
    - removed deprecated property `edit`, use `update` instead.
    - removed deprecated property `caption`, use `text` instead.
    - removed deprecated property `useProxy`.
- Draw_old: removed deprecated property `caption`.
- Print: removed deprecated property `useProxy`.
- Search interface BKG: removed deprecated property `zoomToResult`, configure `resultEvents` instead.
- Search interface SPECIAL WFS: removed deprecated property `definition[x].data`.
- Topic-Tree: removed deprecated property `Baumtyp`, use `tree.type` instead.
- WfsFeatureFilter: removed deprecated tool `wfsFeatureFilter`.
- ExtendedFilter: removed deprecated tool `extendedFilter`.
- SearchByCoord: the deprecated tool `searchByCoord` was removed, use `coordToolkit` instead.
- SupplyCoord: the deprecated tool `supplyCoord` was removed, use `coordToolkit` instead.
- Parcel-Search: removed deprecated tool `parcelSearch`, use search interface `wfsSearch` instead.
- GDI-Search: removed deprecated search `gdi`, use search interface `ELASTIC` instead.
- Utils: removed deprecated function `isChrome`.
- index.html: removed deprecated class `lgv-container` of div. Update content of index.html to new structure.
- config.js: removed deprecated property `gfiWindow`.
- Layer GEOJSON: The deprecated subTyp `OpenSenseMap` was removed.
- map3DParameter:
    - the deprecated property `cesiumParameter.enableLighting` was removed, use `map3dParameter.globe.enableLighting` instead.
    - the deprecated property `cesiumParameter.maximumScreenSpaceError` was removed, use `map3dParameter.globe.maximumScreenSpaceError` instead.
    - the deprecated property `cesiumParameter.tileCacheSize` was removed, use `map3dParameter.globe.tileCacheSize` instead.

### Removed
- RoutingLoadingSpinner: Was replaced with share component SpinnerItem.
- ModalItem in WFSSearch. Results are displayed as table now.
- The following packages have been removed:
    - devDependencies:
        - eslint: 8.51.0
        - eslint-plugin-chai-friendly: 0.7.2
- QuickHelp: removed module `quickHelp`
- Search interface BKG: removed property `zoomToResultOnHover` and `zoomToResultOnClick`, configure `resultEvents` instead.


### Fixed
- Issue #1084: fix wrong pointMarker placement when featureType is MultiPolygon.
- Issue #1095: FeatureLister: Fixed highlighting on hover and on click.
- Issue #1114: pass credentials to tiled WMS layers if `isSecured` is set.
- Issue #1118: the `wfsSearch` module now works with multiple select boxes.
- Issue #1119: Routing module: the route is also displayed when the start and end points are selected via the search.
- Issue #1120: the map view gets centered on searched coordinate again.
- Issue #1124: fixed url used in WMS-time layer and in zoomTo environment to not use more than one questionmark.
- Issue #1125: Routing module: Blocked areas can be deleted again.
- Issue #1130: Routing module: fix the bug that interval value could be smaller than minimum interval value.
- Issue #1132: Routing module: error messages have been improved.
- Issue #1136: Routing module: the coordinates change again when point is moved or deleted.
- Issue #1140: AddWMS module: GFI display works again with imported WMS.
- Issue #1144/#1146: the baselayer preview now works for WMTS Layer that have an XML as getCapabilities-URL.
- Issue #1148: fixed bug in vector search so that it can handle GeometryCollection.
- Issue #1153: the Parameter "isSecured" is now recognized if defined in the config.json.
- Issue #1174: Draw: the outer outline color of the double circle is drawn as selected.
- Issue #1182: the order of the layers in the map for initially no subject layers has been corrected.
- Issue #1203: Coordinates: MapMarker stays on the map until other place is selected and disappears when we leave coordinates section.
- Layer selection: the order of the layers corresponds to the order of the layers in config.json.
- AddWMS module: now displays metadata correctly when adding a WMS layer, if "cswId" is specified in the configuration.
- Fixed HighlightFeature for MultiPolygons: in certain WFS layers, when polygon selection is enabled,
    clicking on a polygon would highlight it, but multiPolygons wouldn't. This has now been corrected.
- UrlParams: the correct layers will be visible when copying the URL.
- Routing: spinner will spin again when loading.
- Contact Form: telephone number field shows error when entering letters and fields provide better feedback.
- FileImport: import of GPX-files imports routes, tracks and points. Import of geojson-files imports all besides circles.
- MainMenu: resizing doesn't cause layout problems anymore.
- The TopicTree-Searchinterface failed if there is an empty folder in the topic tree. Now it runs over empty folders.
- Layer Settings: styling of the settings menu.
- Filter: closing the filter with more than one child dropdown snippet selected and opening it again does not trigger an infinite loop anymore.
- WfsSearch: it is now also possible to zoom in on result features with a geometry of type polygon.
- Jsdoc: Generating report works again.
- Print: StyleId can now differ from layerId.
- GetFeatureInfo: the heading has been corrected for 3D objects.
- SingleBaseLayer: if layers change visibility, the baselayer will no longer be turned insvisible as well.
- English language: it is possible to change the language to English of the menu on the right side.
- OAF: layers are displayed if activated in 3D mode.
- Layers: if only maxScale is set at layer, minScale is set to 0.
- 3D: GFI of Cesium3DTileFeature shows correct properties.
- SearchBar: no error is logged to console, if a search request is aborted, because the same URL is requested again.
- Routing directions: no "empty" button, it is not clickable anymore
- Legend: using `legend: ignore` doesnt show up legend tab in layer information.
- GetFeatureInfo: color highlight disappears after closing the description

### Known Issues
- The module `modeler3D` is not yet moved to version 3. It will be added in the next minor release.
- The zoom to searched folders in the layerTree is not yet possible. It will be added in the next minor release.

---

## 2023-12-18 v3.0.0 - beta2
### __Breaking Changes__
- Dropped support for NodeJS 16 and Npm 8
- e2e tests are no longer supported
- The following attributes have been renamed:
    - Baselayer --> baselayer
    - Fachdaten --> subjectlayer
    - Portalconfig --> portalConfig
    - Themenconfig --> layerConfig
- The following attributes have been moved within config.json:
    - Portalconfig.baselayerSwitcher -> portalConfig.map.baselayerSwitcher
    - Portalconfig.controls -> portalConfig.map.controls
    - Portalconfig.getFeatureInfo -> portalConfig.map.getFeatureInfo
    - Portalconfig.mapView -> portalConfig.map.mapView
    - Portalconfig.mouseHover -> portalConfig.map.mouseHover
    - Portalconfig.tree.layerPills -> portalConfig.map.layerPills
- The following attributes have been moved from config.json to config.js
    - Portalconfig.alerts -> alerting.initialAlerts (`alerts` has been renamed to `initialAlerts`)
- The following attributes have been moved from config.js to config.json
    - cesiumParameter -> portalConfig.map.map3dParameter (`cesiumParameter` has been renamed to `map3dParameter`)
    - featureViaURL -> portalConfig.map.featureViaURL
    - mapInteractions -> portalConfig.map.mapView.mapInteractions
    - mapMarker -> portalConfig.map.mapMarker
    - startingMap3D -> portalConfig.map.startingMapMode (`startingMap3D` has been renamed to `startingMapMode`)
    - zoomTo -> portalConfig.map.zoomTo

### Added
- Add roadmap information to the readme file.
- Add documentation for the [config.js](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/doc/config.js.md) and [config.json](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/doc/config.json.md).
- Configurable searchBar for the layerselection.
- To manage dependencies of dependencies "overrides" for cesium are added to package.json and create dummy packages for it.
- New config.json parameter `sldVersion` for legend configuration to define a `Styled Layer Descriptor` for the GetLegendGraphic requests.
- The following packages have been added:
    - devDependencies:
        - webpack-bundle-analyzer: 4.9.1 (For usage comment in "webpack-bundle-analyzer"-code in webpack.dev.js)
- shared\js\utils\convertColor: added an option to convert an rgba array into a hex color with alpha value.
- Configurable searchbar for the layerSelection.
- Add layerParam `gfiThemeSetting`.

### Changed
- GetFeatureInfo: module opens in other menu when print module is opened
- LayerInformation: for layers that do not have metadata, the layer information can now be displayed so that the URLs and legend can be accessed.
- The following NPM packages have been updated:
    - dependencies:
        - @masterportal/masterportalapi: 2.28.0 to 2.30.0  (This also raised ol to version 8.1.0 and olcs to version 2.16.0)
        - @popperjs/core: 2.11.6 to 2.11.8
        - @vue/compat: 3.2.47 to 3.3.4
        - axios: 1.3.4 to 1.5.1
        - bootstrap: 5.2.3 to 5.3.2
        - bootstrap-icons: 1.10.3 to 1.11.1
        - chart.js: 4.2.1 to 4.4.0
        - i18next: 22.4.11 to 23.5.1
        - i18next-browser-languagedetector: 7.0.1 to 7.1.0
        - i18next-http-backend: 2.2.0 to 2.2.2
        - i18next-vue: 2.1.1 to 3.0.0
        - jsts: 2.9.2 to 2.11.0
        - qrcode: 1.5.1 to 1.5.3
        - vue: 3.2.47 to 3.3.4
        - vue-datepicker-next: 1.0.2 to 1.0.3
        - vue-multiselect: 3.0.0-beta.1 to 3.0.0-beta.2
    - devDependencies:
        - @geoblocks/print: 0.7.3 to 0.7.4
        - @sinonjs/fake-timers: 10.0.2 to 11.1.0
        - @vue/compiler-sfc: 3.3.2 to 3.3.4
        - @vue/test-utils: 2.3.1 to 2.4.1
        - canvas: 2.11.0 to 2.11.2
        - chai: 4.3.7 to 4.3.10
        - esbuild-loader: 3.0.1 to 4.0.2
        - eslint: 8.36.0 to 8.51.0
        - eslint-plugin-vue: 9.9.0 to 9.17.0
        - fs-extra: 11.1.0 to 11.1.1
        - markdown-it: 13.0.1 to 13.0.2
        - mock-local-storage: 1.1.23 to 1.1.24
        - regenerator-runtime: 0.13.11 to 0.14.0
        - replace-in-file: 6.3.5 to 7.0.1
        - sass: 1.59.3 to 1.69.0
        - sinon: 15.0.2 to 16.1.0
        - vue-loader: 17.0.1 to 17.3.0
        - webpack: 4.46.0 to 4.47.0
        - zip-a-folder: 1.1.5 to 3.1.3

- SearchBar: styled the input field.
- Print: styled loading button.
- The roadmap dates have been updated. See [Readme](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/README.md).
- Layers are only displayed on the 2D-map, if layers attributes minScale and maxScale are in maps scale-range. The layer is grayed out in the topic tree if it is not displayed on the map.
- Main Menu: added margin so scrollbar is visible on desktop.
- Search results: layers can now be added/removed directly to/from the map by activating the checkbox. The add layer button has been removed.
- Highlighting features via URL:
    - Now accepts multiple feature ids, seperated with commas.
    - Zooms the map, so that all highlighted features are visible.
- Layer selection: layers can now be added directly to the map by activating the checkbox. The add layer button has been removed. All layers are always displayed, including the layers that have already been added.
- Searchbar configuration 'minChars' was renamed to 'minCharacters'.
- ShareView: new wording for buttons and toast added for feedback after link copying.
- Tutorial: ScaleSwitcher tutorial was updated.
- Layerinformation: different labels have been updated.
- Migrated the tool `login` to MP3.0.0

### Deprecated

### Removed
- The following NPM packages have been removed:
    - dependencies
        - @panter/vue-i18next
        - dayjs (is loaded via @masterportal/masterportalapi)
        - moment
        - moment-timezone
    - devDependencies:
        - cross-env
- `Legend` : The `showLegend` and `showCollapseAllButton` attributes have been removed

### Fixed
- Issue #859: Allow saveSelection for 3D.
- Issue #1073: Routing: the route is updated after moving a waypoint in the map.
- Issue #1085: Corrected case at import of layer2dRasterWmsTime layerFactory.js.
- Issue #1091: VectorStyle: read geometry type from geoserver featureTypeRequest and do not fail if some rules in style.json have no condition.
- Issue #1094: Measure Tool: unit changes not connected anymore.
- Issue #1099: The package.json is adapted, now the size of the bundle, created with "npm run build" is reduced.
- Issue #1105: Added easting and nothing labels for utm projections in CoordToolkit
- Mobile View: switching vertical and horizontal view works better now.
- Fix click issue between link of logo area and searchbar.
- Close Button is now in line with Menu navigation.
- Modules: open modules are closed when switching to a mode, that they do not support.
- Tree: sorting the layers in the topic tree in the same order as via share link.
- GFI: shown GFI is closed if dedicated layer is removed from map.
- OAF layers are now loaded and displayed correctly.
- Draw: imported features can be modified and deleted. GetFeatureInfo attributes are shown on click on imported feature.
- The routing module can now be saved via shareView.
- Print: only layers are printed that are also displayed in the current scale

---

## 2023-10-04 v3.0.0 - beta1
### __Breaking Changes__
- Configuration:
    - The `wfsSearch` modules config.json parameter 'field'-property `type` was renamed to `queryType`
    - New config.json parameter 'tree' added. Contains:
        - 'type' (was 'treeType' or 'Baumtyp' at root before), the following params are possible: "auto" ( = old "default")
        - 'addLayerButton': if active:true, a button to add layers is shown. On the first menu side only Layers configured in config.json with attribute 'showInLayerTree':true or "visibility": true is shown.
        - 'validLayerTypesAutoTree' (new parameter) only for tree type 'auto'
        - 'layerIDsToIgnore' (moved from config.js) only for tree type 'auto'
        - 'metaIDsToMerge' (moved from config.js) only for tree type 'auto'
        - 'metaIDsToIgnore' (moved from config.js) only for tree type 'auto'
        - 'layerIDsToStyle' (moved from config.js) only for tree type 'auto'
        - 'categories': only for tree type 'auto', contains categories in datasets of layers. Tree is structured by them.
    - The configuration of 'Themenconfig' changed: Layers are contained in "elements"-Array and have type "layer", folders have type "folder." Type "layer" is default and can be omitted.
    - The attribute 'cache' on the layer is no longer taken into account with tree.type 'auto
    - 'supportedTreeTypes': attributes 'supportedDevices' and 'supportedMapModes' are added to each module to make it configurable in which tree type the module should be displayed.
    - The configuration for `mouseHover` is moved from config.js to config.json. Also, the configuration is now optional.
    - The width of the ScaleLine [in cm] can now be configured with the attribute `scaleLineWidth`.
    - It is now possible to configure a search interface more than once. For example `elasticSearch`.
- Modules/Controls:
    - Controls: a control can only be configured in config.json as "expandable". "bottomControl" is no longer supported.
    - GetFeatureInfo:
        - The `gfi` module has been renamed to `getFeatureInfo` and is now configured at the top level in config.json/portalconfigs.
        - The menu side can be accessed under `Portalconfig.getFeatureInfo.menuSide`.
    - The `startTool` control has been renamed to `startModule`. Modules are now completely configured within the control.
    - The `saveSelection` module can now be found as `Copy link` within the `shareSelection` module.
    - PortalFooter
        - The Footer has been renamed to `portalFooter` and its configuration has been moved from config.js to config.json.
        - The `scaleLine` is now a fixed part of the `portalFooter` and is configured within it.
        - In the `portalFooter` only `urls` and the `scaleLine` are configured. For the other contents e.g. `version` or `footerInfo` a module is created in the menu. Language switching has also been moved to a separate `language` module.
    - The 'active' attribute has been removed from the modules. Instead, a module to be displayed initially can now be defined centrally for each menu window with the attribute `currentComponent`.
    - LayerIds can no longer be configured as Object in the layer configuration (config.json). Instead the suffix `#` should be used to use a LayerId more than once.
    - The `mapMarker` is now a part of `map`.
    - You can configure the possibility to add attachments to the `contact` form.
    - `Menu`: the menu has been refactored and changed completely from horizontal menu bar to sidebar navigation.
    - `Searchbar`: The searchbar has been refactored with new options e.g. that the order of the search results can be configured accordingly the order of the searchInstances in the config.json. Furthermore, the search results are categorized by the different search categories. ClickEvents can be defined for search results (e.g. zooming to results). Furthermore, buttons can be defined for the individual search interfaces, which are displayed at each search result that is visible after clicking on "show all". E.g. for addresses, a button can be configured that allows to open the routing module with a certain start address. Starting a search directly with an address zooms to the search result and places a mapMarker.
- Libraries:
    - Update from vue 2 to vue 3
    - Time library moment.js has been replaced with day.js.
- Script to migrate masterportal configuration files to version 3.0.0 was added. The command `npm run migrateConfig` prompts for input and `npm run migrateConfig help` describes usage with parameters.
- The layer attribution is now displayed in an alert when a layer is activated for the first time.

### Added
- Added documentation file doc\jsdoc.md for jsdoc in vue-components and vuex-files.
- LayerPreview: Preview images can be generated and displayed for layer types WMS, WMTS and VectorTile. The layer preview was added to the layerTree.
- The following NPM packages are added:
    - dependencies:
        - @panter/vue-i18next
        - dayjs
    - devDependencies:
        - @vue/compiler-sfc
        - cross-env
        - jsdoc
        - jsdoc-vuejs
        - shelljs
        - sinon-chai
- A new module `about` has been implemented, which can be used to show detailed information about a portal.
- A new module `baseLayerSwitcher` allows to select base layers by preview images from a configurable base layer set.
- Different modules were refactored from masterportal dev: `draw`, `filter`, `legend`, `search`, `wmsTime`, `wfst`
- The new control `tiltView` adds two controls that allow you to tilt the 3d map up or down
- The layer tree can be filtered by categories e. g. `opendata`.
- 3D print support has been added.
- 3D tile highlighting was refactored from masterportal dev.
- Possibility to use urlParams including searching within searchInterfaces.
- Printing functions for vector styling and legend has been added.
- New draw module (still in development) has been added to the code structure parallel to the refactored draw within the module folder.
- Adds `displayOnEvent` functionality for the Alerting module.

### Changed
- The following NPM packages have been updated:
    - dependencies:
        - @masterportal/masterportalapi: 2.14.0 to 2.28.0
        - @vue/compat: 3.2.45 to 3.2.47
        - axios: 1.2.2 to 1.3.4
        - charts.js: 4.1.1 to 4.2.1
        - i18next: 22.4.8 to 22.4.11
        - i18next-http-backend: 2.1.1 to 2.2.0
        - moment-timezone: 0.5.40 to 0.5.41
        - vue: 3.2.45 to 3.2.47
        - vue-multiselect: 2.1.6 to 3.0.0-beta.1
    - devDependencies:
        - @vue/devtools-api: 6.4.5 to 6.5.0
        - @vue/test-utils: 2.2.7 to 2.3.1
        - esbuild-loader: 2.20.0 to 3.0.1
        - eslint: 8.31.0 to 8.36.0
        - eslint-plugin-vue: 9.8.0 to 9.9.0
        - eslint-plugin-vuejs-accessibility: 2.0.0 to 2.2.0
        - sass: 1.57.1 to 1.59.3
        - sinon: 15.0.1 to 15.0.2
- Support for node 18.16.0 and npm 9.5.1
- UI: SDP-Download UI was updated
- Different terms for baselayer (basemap, backgroundlayer, basemap, hintergrundkarte) have been unified to baselayer
- Searchbar: custom actions can be configured as buttons at each search result in list of all search results.
- Changes in routing-components in order to improve accessibility.
- The layer pills are now animated, work with the menu and only show the arrow buttons when useful.
- Proxy function handling has been centralized.

### Removed
- The url parameter `TOOLS/[tool-id]` was removed. The `MENU` parameter can be used instead.
- The following NPM packages are removed:
    - dependencies
        - @vue/compiler-sfc
        - rbush
        - rbush-knn
        - vcs-oblique
        - vue-template-compiler
        - vue2-datepicker
        - @vue/compat
    - devDependencies:
        - raf
        - string-replace-loader
        - sinon-chai
        - webpack-visualizer-plugin
- The loader start screen has been removed.
- The layerAttribution control no longer exists. Instead, when a layer that has a layerAttribution is turned on, it is displayed as an alert.
- Several warnings have been removed from alerting as they are unnecessary.
- LayerAttribution is shown only once when the layer has been selected.
- The control `overViewMap` has been removed.
- `styleWMS` is no longer supported.

### Fixed
- Issue #1072: Fixed a problem when launching the portal with addons in version 3.0.0.
- 3D layer tree folder issues have been fixed. Vectortile layer appearing again.
- SpecialWFS search: Bugs related to MultiPolygon and Point handling, result handling, getWKTGeom have been resolved.
- Controls can be shown now on mobile mode.
- Errors in `selectFeatures` have been fixed.
- Printing Bugs with area and line measurements have been fixed in `measure` module.
- Design Bugs of the GFI window have been fixed e.g. the display of arrows.
- Different mobil bugs within `coordToolkit` have been fixed.
- Errors within the menu navigation in combination with different modules have been removed.
- UI: different Issues have been resolved and the design has been generalized.
- Legend display for WFS layer has been fixed.

---

## 2023-03-01 v3.0.0 - alpha1
### Added
- The following NPM packages are added:
    - devDependencies:
        - @babel/plugin-transform-modules-commonjs
        - @vue/devtools-api
        - @vue/compiler-sfc
        - i18next-vue
- A new module `OpenConfig` has been implemented, which can be used to load a new configuration file (config.json) at runtime.
- A new module `News` has been implemented, it displays the recent alerts.
- A new module in menu `CustomMenuElement` has been implemented. It can open a link, display html from config.json or from external file or dispatch an action.
- Modules can now have an attribute `hasMouseMapInteractions`. Only one module that has this attribute set to `true` can be open at the same time.

### Changed
- Parameters moved from config.js to config.json:
  - 'layerIDsToIgnore'
  - 'metaIDsToMerge'
  - 'metaIDsToIgnore'
  - 'layerIDsToStyle'
- The Control-Bar Design

### Deprecated
- Print: The deprecated attribute `mapfishServiceId` has been removed. Use `printServiceId` instead.
- Contact: The deprecated attribute `serviceID` has been removed. Use `serviceId` instead.

### Removed
- The following NPM packages are removed:
    - dependencies
        - @panter/vue-i18next
        - backbone
        - backbone.radio
        - bootstrap-colorpicker
        - bootstrap-datepicker
        - bootstrap-toggle
        - jquery
        - jquery-ui
        - rbush
        - rbush-knn
        - vcs-oblique
        - vue-template-compiler
        - vue2-datepicker
    - devDependencies:
        - eslint-plugin-backbone
        - eslint-plugin-you-dont-need-lodash-underscore
        - jsdoc
        - sinon-chai
