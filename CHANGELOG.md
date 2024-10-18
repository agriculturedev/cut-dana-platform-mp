# Changelog Masterportal
 All important changes in this project are stored in this file.

[Semantic versioning](https://semver.org/spec/v2.0.0.html) is used.

## Unreleased - in development
### __Breaking Changes__
- Searchbar config.json configuration: If a search interface is used in topic tree searchbar, new parameter 'searchInterfaceId' must be filled and used in topic tree searchbar configuration.
- Searchbar in topic tree config.json configuration: 'searchInterfaceInstances' must contain the search interfaces to use. 'searchInterfaceInstanceIds' and 'searchCategory' have been removed.

### Added
- AddWMS: Added Information about CORS header to doc and changed error message.
- ShareView: Error handling when sharing via QR code has been improved.

### Changed

### Deprecated

### Removed
- Deleted the `namespaces` option, as it is not a valid configuration for `createStore`, and also removed it from the `docs/Dev/unitTestVue.md` tutorial.

### Fixed
- Fixed the issue that the legend information was empty when an empty legend-object was passed to the legend component.
- Corrected link for geodata infrastructure information pdf by GDI-DE. 
- Issue #1276: Duplicate icons StartModule in expandable ControlBar.

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

### Changed

### Deprecated

### Removed

### Fixed

---

## v2.50.0 - 2024-10-02

### Added
- Filter:
  - A new parameter "questionLink" to enable to open a link.
  - A new parameter "closeDropdownOnSelect" to enable/disable closing list after selecting an option in multiselect dropdown list.

### Fixed
- draw: download a drawn circle as csv has now the correct epsg code from the map projection

---

## v2.49.0 - 2024-09-04
### __Breaking Changes__

### Added
- getOAFFeature: API Helper to load individual OAF Features (analogue to WFS) added
    - taken and updated from Masterportal 3 release
- WFS-T:
    - Enables layers to support the insertion, update, and deletion of multipolygon geometries
    - Includes UI updates with a new "Add areas" button
    - Added confirmation dialog for creating multipolygons with voids

### Changed
- The following packages have been updated:
    - dependencies:
        - @masterportal/masterportalapi: 2.39.0 to 2.40.0

### Deprecated

### Removed

### Fixed
- Issue #1235: layerInformation does not show download sources from previous layer if it does not have its own metadata.
- SaveSelection:
    - If mapMode is 3D it adds the mapMode, tilt, heading and altitude attribute to the url.
    - In 3D the visible layer list contains the 3D layer now.
- Login:
    - Fixed token revocation not working correctly
    - The WMS-Time layer are now available after you have logged in with the login module.
- OAF-Layer: if parameter 'bbox' ist not defined at layer, 'bbox' in parameter 'datasets' or maps extent is used. If parameter 'bboxCrs' is not set, 'crs' is used.

---

## v2.48.0 - 2024-08-07

### Added
- WFS-T:
    - Enables layers to support the insertion, update, and deletion of multipolygon geometries
    - Includes UI updates with a new "Add areas" button
    - Added confirmation dialog for creating multipolygons with voids

### Fixed
- Issue #1227: search via urlparam 'query=': display marker waits for style loaded.
- Filter
  - SliderRange: The maximum Slider value should be the maximum current slider value if the slider scolls to the end.

---
## v2.47.0 - 2024-07-03

### Added
- StatisticDashboard:
    - Can now load data from an OAF Rest API if an OAF layer is configured.
- The following packages have been added:
    - devDependencies:
        - @eslint/js: 9.3.3
        - eslint-plugin-jsdoc: 48.2.7,
        - eslint-plugin-mocha: 10.4.3,
        - globals: 15.3.0
- WMS features with geometry can be highlighted with polygon marker
- Added the ability to additionally highlight polygons

### Changed
- Login: Access and refresh tokens are now revoked on logout. For this to work it is required to add the revoke endpoint to the config.js.
- The following packages have been updated:
    - dependencies:
        - @masterportal/masterportalapi: 2.38.0 to 2.39.0 (This also raised @cesium/engine to version 9.2.0)
- WMS gfi responses with mimeType json/application are parsed as GeoJSON
- CoordToolkit: description of projection ETRS89_3GK3 has been appended by EPSG 10285.

### Removed
- The following packages have been removed:
    - devDependencies:
        - eslint: 8.57.0
        - eslint-plugin-chai-friendly: 0.7.4
        - eslint-plugin-you-dont-need-lodash-underscore: 6.12.0
### Fixed
- Issue #1194: Fix sensor layer features not styled after property changed.
- Issue #1206: WMTS-Layer: legend is displayed, if configured in attribute legend.

## v2.46.0 - 2024-06-05

### Added
- Modeler3D:
  - Drawn entities can be rotated.
  - Dimensions of rectangles can now be set using forms when selected.
  - Added copy function for drawn models.
  - Added options section to draw overview.
- Issue #1186: Add warning to WFS search for unsupported geometry types.

### Changed
- The following package has been updated:
    - dependencies:
        - ChartJS from 2.2 to 4.4.2
- Modeler3D:
  - Polygon and line highlighting has been changed
  - Measurement labels of drawn entities can now be toggled on/off individually.
  - Labels now move and get updated when the corresponding entity gets changed or moves.
  - Moving entities takes cursor position into account and uses it as an anchor point.
- Tools: The active tools which are only supported in 3D mode will be closed after switching to 2D mode.
- Wfst:
  - Depending on the load state of the configured layers, the selection is activated automatically.
  - A loading indicator is shown, if layers are still loading.
  - Layer options in the dropdown are enabled once the layer is fully loaded.
  - Improved error handling.

### Fixed
- Measure module:
  - Entities from other tools are now ignored when pressing "delete measurements".
- Modeler3D:
  - The line width of polylines can be edited again.
  - The color picker for editing polylines shows the right color again.
  - Selected drawn entities can be exported again as geojson.
- Issue #1160: Fixed bug in area calculation during editing.
- Issue #1165: Fixed a bug in scrollToLayer(), where focus-behaviour did not work as intended in tree.
- Issue #1166: function isHTML now recognizes more HTML tags in one String as valid.
- Issue #1179: Add Parameter "WithCredentials" to highlightFeaturesByAttribute axios request, so that it works with secured layers.
- Issue #1181: Fixed printing multipolygon features when labelField is configured.
- Issue #1191: Create URL with right order of baselayers if only baselayers are selected.
- Removed empty span-Tag in Layertree for singleBaseLayer

---

## v2.45.1 - 2024-05-14
### Fixed
- Fix sensor layer features not loaded after enlarging extent.

---

## v2.45.0 - 2024-04-30
### Added
- Modeler3D:
  - Set points while drawing can be undone with CTRL + Z and redone with CTRL + Y
  - The movement of objects can be undone with CTRL + Z and redone with CTRL + Y
  - Add edit function for fillColor and stroke color of drawn polygons and polylines.
  - Rectangles can now be drawn in the drawing tool.
  - A ready to drop-in 15m x 20m x 20m rectangle can now be chosen in the draw tool.
- overviewMap:
  - Adds New parameter `renderIn3d` for overviewMap. Enables the overviewMap in 3d mode.
  - Adds New parameter `boxBorderColor` for overviewMap. Enables to configure the border color of mini overview map box.
- WFST-Tool: Added WFS-T improvements
  - correct transactionFeature properties order
  - input validation
  - gfiAttributes nested object handling
- StatisticDashboard: New parameter subtitle to display the configurable subtitle

### Changed
- Modeler3D:
  - Importers are now lazy loaded according to file type to enhance load times.
  - GLB files can now be imported.
  - Filesize limit has been removed.
- Measure module:
  - 3d functions have been completely reworked.
- The following packages have been updated:
    - dependencies:
        - @masterportal/masterportalapi: 2.35.0 to 2.38.0 (This also raised ol to version 9.2.4)
        - @popperjs/core: 2.11.6 to 2.11.8
        - axios: 1.3.4 to 1.6.8
        - crypto-js: 4.1.1 to 4.2.0
        - dom-parser: 0.1.6 to 1.1.5
        - i18next: 22.4.11 to 23.11.3
        - i18next-browser-languagedetector: 7.0.1 to 7.2.1
        - i18next-http-backend: 2.2.0 to 2.5.1
        - jquery: 3.6.4 to 3.7.1
        - jquery-ui: 1.13.2 to 1.13.3
        - mqtt: 4.3.7 to 4.3.8
        - rbush: 2.0.2 to 3.0.1
        - rbush-knn: 2.1.0 to 3.0.1
        - three: 0.163.0 to 0.164.1
        - vue: 2.7.14 to 2.7.16
        - vue-multiselect 2.1.6 to 2.1.9
        - vue-template-compiler: 2.7.14 to 2.7.16
        - vue2-datepicker: 3.11.0 to 3.11.1
    - devDependencies:
        - @geoblocks/print: 0.7.4 to 0.7.8
        - @sinonjs/fake-timers: 10.0.2 to 11.2.2
        - @vue/test-utils: 1.3.0 to 1.3.6
        - chai: 4.3.7 to 4.4.1
        - esbuild-loader: 3.1.0 to 4.1.0
        - eslint: 8.36.0 to 8.57.0
        - eslint-plugin-chai-friendly: 0.7.2 to 0.7.4
        - eslint-plugin-vue: 8.3.0 to 9.3.0
        - eslint-plugin-vuejs-accessibility: 2.2.0 to 2.3.0
        - fs-extra: 10.1.0 to 11.2.0
        - husky: 8.0.3 to 9.0.11
        - inquirer: 8.2.4 to 8.2.6
        - markdown-it: 13.0.1 to 14.1.0
        - mocha: 10.2.0 to 10.4.0
        - node-fetch: 3.3.0 to 3.3.2
        - regenerator-runtime: 0.13.11 to 0.14.1
        - replace-in-file: 6.3.5 to 7.1.0
        - sass-loader: 10 to 10.5.2
        - webpack-bundle-analyzer: 4.9.1 to 4.10.2
        - zip-a-folder: 1.1.5 to 3.1.6
- The version of node was updated to `^16.13.2 || ^18.16.0 || ^20.12.2`.
- The version of npm was updated to `^8.1.2 || ^9.5.1 || ^10.5.0`

### Fixed
- Issue #1160: show right values for areas in Draw Tool.
- Issue #1174: Draw: the outer outline color of the double circle is drawn as selected.
- addWMS:
  - Now displays metadata correctly when adding a WMS layer, if "cswId" is specified in the configuration.

---

## v2.44.0 - 2024-04-03
### Added
- PoiOrientation:
    - Improved handling when selecting a feature from the list.
    - `Poi` control is now displayed in the same way as `Orientation` when selected.
    - `customPosition` can now be overwritten via config.json.
- A layers extent can now be used from the getCapabilities request and applied when a layer gets selected.
- Added WMS support to add CQL filters by attribute.

### Changed
- The following packages have been updated:
    - dependencies:
        - @masterportal/masterportalapi: 2.34.0 to 2.35.0

### Fixed
- Issue #1148: fixed bug in vector search so that it can handle GeometryCollection.
- Issue #1154: setting of altitude and AltitudeOffset as z coordinate now works for GeometryCollection.
- Issue #1157: using layer attribute legend: "ignore" hides legend tab in layerinformation.
- WFST-Tool: Added WFS-T fixes & improvements.
- WfsSearch: It is now also possible to zoom in on result features with a geometry of type polygon.
- PoiOrientation:
    - Only features that match the selected distance are displayed.
- WfsSearch: Closing the WfsSearch UI and clicking on the "ResetUI"-Button now also remove the highlighting.

---

## v2.43.0 - 2024-03-06

### __Breaking Changes__
- Tree Search: the searchType (name or metadata) needs to be specified in the config.json and is not defaulted to "metadata" anymore.

### Added
- StatisticDashboard module in core tool modules
- The following packages have been added:
    - devDependencies:
        - cross-env: 7.0.3
- PoiOrientation:
    - The result window can now be moved.
    - New parameter onlyFilteredFeatures introduced, so that only filtered features are displayed in the results window.

### Changed
- The following packages have been updated:
    - dependencies:
        - @masterportal/masterportalapi: 2.33.0 to 2.34.0

### Fixed
- Issue #597: resolve relative path for legend images in print module.
- Issue #775: hovering over .portal-title changes color of the title now.
- Issue #1103: WfsSearch: fixed error with `active`=`true`.
- Issue #1114: Pass credentials to tiled WMS layers if `isSecured` is set.
- Issue #1124: fixed url used in WMS-time layer and in zoomTo environment to not use more than one questionmark.
- Issue #1126: prevent that the "legend"-parameter from config is overwritten by capabilities request
- Issue #1131: ShadowTool: fixed inital language can now also be `de-DE`.
- Issue #1143: FileImport: open draw tool button is styled correctly.
- Issue #1149: fixed mobile error for type custom tree portals caused by tree model.
- Issue #1152: Layertree with background maps and `singleBaseLayer`=`true` in folder structure: When changing a background map, the previously selected background map is deselected.
- Change env to cross-env so windows powershell can run build script


---

## v2.42.0 - 2024-02-07

### Added
- Issue #1116: New alert for batchprocessing in routing tool informs the user when all requests to the service failed.
- Filter: A new parameter `filterOnOpen` has been added to filterLayer in Filter. If set to true, the filter is triggered when the accordeon is clicked.
- Print: An option "Improve scaling resolution" is implemented for 3d Layers to supply an improved and better resolution.

### Changed
- The following packages have been updated:
    - dependencies:
        - @masterportal/masterportalapi: 2.31.0 to 2.33.0 (This also raised ol to version 8.2.0 and @cesium/engine to version 6.2.0)
- Added translations for Sensor Theme.


### Fixed
- Issue #1110: Elastic Search: icons can be assigned via the search result.
- Issue #1115: Legend is shown for all WFS-Layers.
- Issue #1122: GFI-Window with desktopType "attached" is shown at clicked feature, if another feature is clicked.
- GFI: if config Parameter `centerMapToClickPoint` is set to true, map is centered to feature on click, even if the mapmarker is not shown.
- GroupLayer: deselection of Group Layer corrected when singleBaseLayer is set to true
- ParametricUrl: Search queries by url parameter with more than one result: if one result matches exactly, the map view is zoomed to result.

---

## v2.41.1 - 2024-01-09
### Fixed
- Fixed error "singleBaseLayer not defined" on opening 3D folders or on adding a layer by searchbar.

---

## v2.41.0 - 2024-01-08
### Added
- Issue #1038: Tooltips to display area of drawn polygons/squares and length of drawn lines
- Added square as geometryType for drawingTool.

### Changed
- The version of node was updated to `^16.13.2 || ^18.16.0 || ^20.9.0`.
- The version of npm was updated to `^8.1.2 || ^9.5.1 || ^10.1.0`
- The following NPM packages have been updated:
    - dependencies:
        - @masterportal/masterportalapi: 2.30.0 to 2.31.0
    - devDependencies:
        - canvas: 2.11.0 to 2.11.2

### Fixed
- MapMarker: fix creating a feature style in placingPolygonMarkerByGeom.
- Print: Printing vector features with multipolygons now works again.
- LayerTree: The tooltip is now displayed correctly again for layers that are outside the displayable scale.
- Issue #1081: the geometry display when importing more than one KML file is complete, despite identical ids at the element `Placemark` .
- Issue #1098: fixed all urls used in routing tool and in wfsSearch tool to not use more than one questionmark.
- Issue #1117: The tool addWMS now works again.
- Issue #1084: fix wrong pointMarker placement when featureType is MultiPolygon.
- Fixed HighlightFeature for MultiPolygons: In certain WFS layers, when polygon selection is enabled,
    clicking on a polygon would highlight it, but multiPolygons wouldn't. This has now been corrected.
---

## v2.40.1 - 2023-12-07
### Fixed
-  defaultTree: Added missing key singleBaseLayer

---

## v2.40.0 - 2023-12-06
### Added
- The following packages have been added:
    - devDependencies:
        - webpack-bundle-analyzer: 4.9.1
- To manage dependencies of dependencies "overrides" for cesium are added to package.json and create dummy packages for it.
- New Parameter sldVersion for legend configuration to define a Styled Layer Descriptor for the GetLegendGraphic requests.
- Issue #1105: Added easting and nothing labels for utm projections in CoordToolkit
- possibility to keep more than one tool open at the same time
- Added parameter minChars to the locationFinder configuration of the searchBar.
- utils/convertColor: added an option to convert an rgba array into a hex color with alpha value
- Searchbar tree:
  - New 'config' parameter: searchType added. If set to "name", the field 'name' of the layer is searched for, else the field 'md_name' in the dataset is compared.
  - Add a layertree path to the search result. Add a typename for background layer.
- Added opacity to configurable parameters of styleRoute
- Added checkbox to determine if routes stay visible after closing the routing tool

### Changed
- The script "npm run build" has been extended. The user can now specify the name of an addon that is excluded from bundle.
- The roadmap dates have been updated. See [Readme](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/README.md).
- Highlighting features via URL:
    - now accepts multiple feature ids, seperated with commas.
    - Zooms the map, so that all highlighted features are visible.
- The following NPM packages have been updated:
    - dependencies:
        - @masterportal/masterportalapi: 2.29.0 to 2.30.0
- New parameter "loaderOverlayMaxWait" has been added to configure the maximum loading time for Loader Overlay
- Issue #1064: Print: parameter to configure invisible layer info
- Added radio selection of background layers in custom treetype when 'singleBaseLayer' is true

### Removed
- The following packages have been removed:
    - devDependencies:
        - webpack-visualizer-plugin

### Fixed
- prepareFeaturesFor3D is now called after loading
- Geojson layer: prepareFeaturesFor3D is now called after loading.
- Issue #1081: Transmit authorization token to services after login
- Issue #1087: Fixed wrong type for upload files for batch processing in routing tool
- Issue #1091: VectorStyle: read geometry type from geoserver featureTypeRequest and do not fail if some rules in style.json have no condition.
- Issue #1093: Fixed the Wrong CRS in GeoJSON by Download filtered data
- Issue #1094: Measure Tool: unit changes not connected anymore.
- Issue #1099: The package.json is adapted, now the size of the bundle, created with "npm run build" is reduced.
- Issue #1109: Folders with identical names are searchable in searchbar tree search.
- Search gazeteer: the results to show are arranged to prefer entries, that start with first char of searchstring.

---

## v2.39.0 - 2023-11-01
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
