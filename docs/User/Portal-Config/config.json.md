# config.json 3.0

The *config.json* file contains all configuration of the portal interface. It controls which elements are placed where on the menu bar, how the map is to be centered initially, and which layers are to be loaded. See **[this file for an example](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/portal/basic/config.json)**.
The configuration is separated into two sections, **[portalConfig](#portalconfig)** and **[layerConfig](#layerconfig)**

**Example**

```json
{
   "portalConfig": {},
   "layerConfig": {}
}
```

***

## portalConfig {data-toc-label='Portal Config'}
The section *portalConfig* controls the following properties:

1. Menu entries in main menu and availability as well as order of modules (*mainMenu*)
2. Configuration of the map and elements placed on it (*map*)
3. Footer configuration (*portalFooter*)
4. Menu entries in secondary menu and availability as well as order of modules (*secondaryMenu*)
5. Type of topic selection (*tree*)

The configuration options listed in the following table exist:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|mainMenu|no|**[menu](#portalconfigmenu)**||Menu entries in main menu and their order are configured in this entry. The order of modules corresponds to the order in the object specifying them; see **[Modules](#portalconfigmenusectionsmodules)**.|false|
|map|no|**[map](#portalconfigmap)**||Configuration of the map and elements placed on it.|false|
|portalFooter|no|**[portalFooter](#portalconfigportalfooter)**||Possibility to configure the content of the portal footer.|false| xxx
|secondaryMenu|no|**[menu](#portalconfigmenu)**||Menu entries in secondary menu and their order are configured in this entry. The order of modules corresponds to the order in the object specifying them; see **[Modules](#portalconfigmenusectionsmodules)**.|false|
|tree|no|**[tree](#portalconfigtree)**||Configuration of the topic selection tree.|false|

**Example**

```json
{
    "portalConfig": {
        "mainMenu": {},
        "map": {},
        "portalFooter": {},
        "secondaryMenu": {},
        "tree": {}
    }
}
```

***

### portalConfig.map {data-toc-label='Map'}
Configuration of the map and elements placed on it.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|baselayerSwitcher|no|**[baselayerSwitcher](#portalconfigmapbaselayerswitcher)**||The baselayerSwitcher allows you to easily change or select a background map.|false|
|controls|no|**[controls](#portalconfigmapcontrols)**||Allows setting which interactions are active in the map.|false|
|featureViaURL|no|**[featureViaURL](#portalconfigmapfeatureviaurl)**||Optional configuration for the URL parameter `featureViaURL`. See **[urlParameter](../Misc/urlParameter.md)** for details.|false|
|getFeatureInfo|no|**[getFeatureInfo](#portalconfigmapgetfeatureinfo)**||Via  getFeatureInfo (GFI) information to arbitrary layers can be requested. For WMS, the data is fetched with a GetFeatureInfo request. Vector data (WFS, Sensor, GeoJSON, etc.) is already present in the client and will be shown from the already fetched information.|false|
|layerPills|no|**[layerPills](#portalconfigmaplayerpills)**||Configuration of the LayerPills.|false|
|map3dParameter|no|**[map3dParameter](#portalconfigmapmap3dparameter)**||Cesium params.|false|
|mapMarker|no|**[mapMarker](#portalconfigmapmapmarker)**||Overrides the map marker module's default values. Useful for 3D markers since OpenLayers's overlays can not be displayed in 3D mode. For this, the map marker has to be defined as vector layer.|false|
|mapView|no|**[mapView](#portalconfigmapmapview)**||Defines the initial map view and a background shown when no layer is selected.|false|
|mouseHover|no|**[mouseHover](#portalconfigmapmousehover)**||Activates the MouseHover feature for vector layers, both WFS and GeoJSON. For per-layer configuration, see the **[Vector](#layerconfigelementslayersvector)**.|false|
|startingMapMode|no|String|"2D"|Indicates the mode in which the map starts. Possible are `2D` and `3D`|false|
|zoomTo|no|**[zoomTo](#portalconfigmapzoomto)**[]||Configuration for the URL query parameters `zoomToFeatureId` and `zoomToGeometry`.|false|

**Example**

```json
{
    "map": {
        "baselayerSwitcher": {},
        "controls": {},
        "getFeatureInfo": {},
        "layerPills": {},
        "map3dParameter": {},
        "mapView": {},
        "mouseHover": {},
        "startingMapMode": "3D"
    }
}
```

***

#### portalConfig.map.baselayerSwitcher {data-toc-label='Base Layer Switcher'}
The baselayerSwitcher allows you to easily switch or select a baselayer.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|active|no|Boolean|false|Defines if the baselayerSwitcher is activated.|false|
|activatedExpandable|no|Boolean|false|Specifies whether the baselayerSwitcher is expanded and all available baselayers are displayed or only the active one which is on the highest level.|false|
|singleBaseLayer|no|Boolean|false|Switches the previous selected Layer to invisible|false

**Example**

```json
"baselayerSwitcher": {
      "active": true,
      "activatedExpandable": false
    }
```

***

#### portalConfig.map.controls {data-toc-label='Controls'}
Allows setting which interactions are active in the map.

Controls can be configured to be expandable so they will not initially show up in the sidebar but if you click the button with the three dots. You need to add the object "expandable" to the controls configuration.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|backForward|no|Boolean/**[backForward](#portalconfigmapcontrolsbackforward)**|false|Shows buttons to jump to previous and next map views.|false|
|button3d|no|Boolean/**[button3d](#portalconfigmapcontrolsbutton3d)**|false|Defines whether a 3D mode switch button is shown.|false|
|expandable|no|Boolean||With expandable, controls are hidden behind a button with three dots and can be expanded when needed.|false|
|freeze|no|Boolean/**[freeze](#portalconfigmapcontrolsfreeze)**|false|Whether a "lock view" button is shown.|false|
|fullScreen|no|Boolean/**[fullScreen](#portalconfigmapcontrolsfreeze)**|false|Allows the user to view the portal in full screen mode, that is, without the browser's tabs and address bar, by clicking a button. A second click on the element returns the view back to normal.|false|
|orientation|no|**[orientation](#portalconfigmapcontrolsorientation)**||The orientation control uses the browser's geolocation feature to determine the user's coordinates.|false|
|rotation|no|**[rotation](#portalconfigmapcontrolsrotation)**|false|Control that shows the current rotation of the map. With a click the map rotation can be set to north again. Two additional control buttons can be configured to rotate the card clockwise and counterclockwise. See also `mapInteractions` in **[config.js.md](config.js.md)**.|false|
|startModule|no|**[startModule](#portalconfigmapcontrolsstartmodule)**|false|Displays buttons for the configured tools. These can be used to open and close the respective tools.|false|
|tiltView|no|Boolean/**[tiltView](#portalconfigmapcontrolstiltview)**|false|Displays two buttons that can be used to tilt the camera up or down in the 3D scene.|false|
|totalView|no|Boolean/**[totalView](#portalconfigmapcontrolstotalview)**|false|Offers a button to return to the initial view.|false|
|zoom|no|Boolean/**[zoom](#portalconfigmapcontrolszoom)**|false|Defines whether zoom buttons should be displayed.|false|

**Example**

```json
"controls": {
      "backForward": true,
      "fullScreen": true,
      "expandable": {
        "button3d": true
      }
    }
```

***

##### portalConfig.map.controls.backForward {data-toc-label='Back Forward'}
The attribute backForward may be of type boolean or object. If of type boolean, it shows a button using the default configuration that allows the user to switch back and forth between view states. When of type object, the following attributes may be set:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|iconForward|no|String|"skip-end-fill"|Allows changing the icon on the forward button.|false|
|iconBack|no|String|"skip-start-fill"|Allows changing the icon on the backwards button.|false|
|supportedDevices|no|String|["Desktop"]|Devices on which the module can be used and is displayed in the menu.|false|
|supportedMapModes|no|String|["2D", "3D"]|Map modes in which the module can be used and is displayed in the menu.|false|

**Example using type object backForward**

```json
"backForward" : {
    "iconForward": "bi-skip-forward-fill",
    "iconBack": "bi-skip-backward-fill"
}
```

**Example using type boolean backForward**

```json
"backForward": true
```

***

##### portalConfig.map.controls.button3d {data-toc-label='Button 3D'}
The button3d attribute can be of type Boolean or Object. If it is of type Boolean, it indicates the button for switching to 3D mode. If it is of type Object, the following attributes apply

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|icon2d|no|String|"https://geodienste.hamburg.de/lgv-config/img/badge-2d.svg"|A different icon can be used for the button3d control via the icon parameter if the map is in 3D mode.|false|
|icon3d|no|String|"badge-3d"|A different icon can be used for the button3d control via the icon parameter if the map is in 2D mode.|false|
|supportedDevices|no|String|["Desktop", "Mobile"]|Devices on which the module can be used and is displayed in the menu.|false|
|supportedMapModes|no|String|["2D", "3D"]|Map modes in which the module can be used and is displayed in the menu.|false|

***

##### portalConfig.map.controls.freeze {data-toc-label='Freeze'}
Screen is locked so that no more actions can be performed in the map. Whether a "lock view" button is shown.

The freeze attribute can be of type Boolean or Object. If it is of type Boolean, it shows the buttons that are set in the default settings. If it is of type Object, the following attributes apply:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|icon|no|String|"bi-lock"|Using the icon parameter, a different icon can be used to switch back to the home screen.|false|
|supportedDevices|no|String|["Desktop"]|Devices on which the module can be used and is displayed in the menu.|false|
|supportedMapModes|no|String|["2D", "3D"]|Map modes in which the module can be used and is displayed in the menu.|false|

***

##### portalConfig.map.controls.fullScreen {data-toc-label='Full Screen'}
Allows the user to view the portal in full screen mode by clicking a button without the browser's tabs and address bar, by clicking a button. A second click on the element returns the view back to default.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|iconArrow|no|String|"arrows-fullscreen"|Using the iconArrow parameter, another icon can be used for the button to switch on fullscreen mode.|false|
|iconExit|no|String|"fullscreen-exit"|Using the iconExit parameter, another icon can be used for the button to exit fullscreen mode.|false|
|supportedDevices|no|String|["Desktop"]|Devices on which the module can be used and is displayed in the menu.|false|
|supportedMapModes|no|String|["2D", "3D"]|Map modes in which the module can be used and is displayed in the menu.|false|

**Example fullScreen as Object**

```json
"fullScreen" : {
    "iconArrow": "arrows-fullscreen",
    "iconExit": "fullscreen-exit"
},
```

**Example fullScreen as Boolean**

```json
"fullScreen": true
```

***

##### portalConfig.map.controls.orientation {data-toc-label='Orientation'}
Orientation uses the browser's geolocation to determine the user's location. A list of features in the vicinity of the location is displayed.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|customPosition|no|String|"common:modules.controls.orientation.poiChoiceCustomPosition"|This can be used to control which text is displayed for `customPosition` in the poiChoice. The path specified here must correspond to the path for the parameter in the translation file.|false|
|iconGeolocate|no|String|"bi-geo-alt"|Icon that is displayed in the Controls menu for the control location. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|iconGeolocatePOI|no|String|"bi-record-circle"|Icon that is displayed in the Controls menu for the "Close to me" control. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|onlyFilteredFeatures|no|boolean|false|If 'onlyFilteredFeatures' is true, only features filtered via the filter are taken into account in the poi results display.|false|
|poiDistances|no|Boolean/Integer[]|true|Defines whether the feature "Close to me", which shows a list of nearby points of interest, is provided. If an array is configured, multiple such lists with the given distance in meters are offered. When simply setting `poiDistances: true`, the used distances are `[500,1000,2000]`.|false|
|supportedDevices|no|String|["Desktop", "Mobile"]|Devices on which the module can be used and is displayed in the menu.|false|
|supportedMapModes|no|String|["2D", "3D"]|Map modes in which the module can be used and is displayed in the menu.|false|
|zoomMode|no|enum["once", "always"]|"once"|The user's location is determined and a marker turned on or off. This requires providing the portal via **https**. Modes: *once* zooms to the user's location once, *always* zooms to the user position on each activation.|false|

**Example using type boolean for poiDistances**

```json
"orientation": {
    "iconGeolocate": "bi-geo-alt",
    "iconGeolocatePOI": "bi-record-circle",
    "zoomMode": "once",
    "poiDistances": true
}
```

**Example using type number[] for poiDistances**

```json
"orientation": {
    "zoomMode": "once",
    "poiDistances": [500, 1000, 2000, 5000]
}
```

***

##### portalConfig.map.controls.rotation {data-toc-label='Rotation'}
Controls the display of 3 control buttons: "Reset rotation", "Rotate clockwise" and "Rotate counterclockwise" as well as the display of a compass rose for navigation in 2D and/or 3D. The compass rose is not displayed on mobile devices.
The rotation attribute can be of type Boolean or Object. If it is of the Boolean type and set to true, it only displays the "Reset rotation" button if the map rotation is not equal to north/0. The other two buttons are always displayed. The compass rose is then only displayed in 3D.
If it is of type Object, the following attributes apply:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|compass2d|no|Boolean|false|Controls the display of the compass rose in 2D.|false|
|compass3d|no|Boolean|true|Controls the display of the compass rose in 3D.|false|
|moveDistance|no|Number|1000|Distance in meters, which is used when clicking on the movement arrows of the compass rose.|false|
|resetRotationIcon|no|String|"bi-cursor"|Icon for the "Reset rotation" button. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|rotateCounterClockwiseIcon|no|String|"bi-arrow-counterclockwise"|Icon for the "Rotate counterclockwise" button. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|rotateClockwiseIcon|no|String|"bi-arrow-clockwise"|Icon for the "Rotate clockwise" button. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|rotationIcons|no|Boolean|true|The "Rotate clockwise" and "Rotate anticlockwise" buttons are displayed.|false|
|rotationAngle|no|Number|22.5|Angle by which the map is rotated when clicking on one of the rotate buttons.|false|
|showResetRotation|no|Boolean|true|The "Reset rotation" button is displayed.|false|
|showResetRotationAlways|no|Boolean|false|If the attribute is set to true, the control is shown permanently. Via default it appears only if the map rotation is not equal north/0.|false|
|supportedDevices|no|String|["Desktop", "Mobile"]|Devices on which the module can be used and is displayed in the menu.|false|
|supportedMapModes|no|String|["2D", "3D"]|Map modes in which the module can be used and is displayed in the menu.|false|

**Example using type object rotation**

```json
"rotation": {
    "compass2d": true,
    "moveDistance": 2500,
    "showResetRotation": true,
    "showResetRotationAlways": false,
    "rotationIcons": false
}
```

**Example using type boolean rotation**

```json
"rotation": true
```

***

##### portalConfig.map.controls.startModule {data-toc-label='Start Module'}
The startModule attribute must be of type Object. A button is displayed for each configured module, which can be used to open and close the respective module.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|mainMenu|no|**[mainMenu](#portalconfigmapcontrolsstartmodulemainmenu)**[]||Here you can configure the modules for which a button should be displayed. These will be displayed in the `mainMenu` when opened.|false|
|secondaryMenu|no|**[secondaryMenu](#portalconfigmapcontrolsstartmodulesecondarymenu)**[]||Here you can configure the modules for which a button should be displayed. These will be displayed in the `secondaryMenu` when opened.|false|
|supportedDevices|no|String|["Desktop", "Mobile", "Table"]|Devices on which the module can be used and is displayed in the menu.|false|
|supportedMapModes|no|String|["2D", "3D"]|Map modes in which the module can be used and is displayed in the menu.|false|

**Example**

```json
"startModule": {
    "mainMenu": [
        {
            "type": "scaleSwitcher"
        }
    ],
    "secondaryMenu": [
        {
            "type": "myModule"
        }
    ]
}
```

***

###### portalConfig.map.controls.startModule.mainMenu {data-toc-label='Main Menu'}
Here you can configure the modules for which a button is to be displayed. These are displayed in the `mainMenu` when opened.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|type|no|String||Type of the module that is to be displayed as a control and opened in the mainMenu when clicked.|false|

**Example**

```json
"mainMenu": [
    {
        "type": "scaleSwitcher"
    }
]
```

***

###### portalConfig.map.controls.startModule.secondaryMenu {data-toc-label='Secondary Menu'}
Here you can configure the modules for which a button is to be displayed. These are displayed in the `secondaryMenu` when opened.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|type|no|String||Type of the module that is to be displayed as a control and opened in the secondaryMenu when clicked.|false|

**Example**

```json
"secondaryMenu": [
    {
        "type": "scaleSwitcher"
    }
]
```

***

##### portalConfig.map.controls.tiltView {data-toc-label='Tilt View'}
Displays two buttons that can be used to tilt the camera up or down in the 3D scene.

The tiltView attribute can be of type Boolean or Object. If it is of type Boolean, it shows the buttons that are set in the default settings. If it is of type Object, the following attributes apply:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|tiltDownIcon|no|String|"bi-caret-down-square"|The tiltDownIcon parameter can be used to specify a different icon for tilt down.|false|
|tiltUpIcon|no|String|"bi-caret-up-square"|Using the parameter tiltUpIcon another icon can be used for tilting up the camera.|false|
|supportedDevices|no|String|["Desktop"]|Devices on which the module can be used and is displayed in the menu.|false|
|supportedMapModes|no|String|["3D"]|Map modes in which the module can be used and is displayed in the menu.|false|

**Example tiltView as Object**

```json
"tiltView" : {
    "tiltDownIcon": "bi-caret-down-square",
    "tiltUpIcon": "bi-caret-up-square",
},
```

**Example tiltView as boolean**

```json
"tiltView": true
```

***

##### portalConfig.map.controls.totalView {data-toc-label='Total View'}
Offers a button to return to the initial view.

The attribute totalView may be of type boolean or object. If of type boolean, it shows a button using the default configuration that allows the user to switch back to the initial view. When of type object, the following attributes may be set:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|icon|no|String|"bi-skip-backward-fill"|Using the icon parameter, a different icon can be used to switch back to the home screen.|false|
|supportedDevices|no|String|["Desktop"]|Devices on which the module can be used and is displayed in the menu.|false|
|supportedMapModes|no|String|["2D", "3D"]|Map modes in which the module can be used and is displayed in the menu.|false|

**Example totalView as Object**

```json
"totalView" : {
    "icon": "bi-skip-forward-fill"
},
```

**Example totalView as Boolean**

```json
"totalView": true
```

***

##### portalConfig.map.controls.zoom {data-toc-label='Zoom'}
Defines whether zoom buttons should be displayed.

The attribute zoom may be of type boolean or object. If of type boolean, it shows two buttons using the default configuration that allows the user to zoom in the map. When of type object, the following attributes may be set:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|iconIn|no|String|"bi-plus-lg"|Using the icon parameter, another icon can be used for zooming in.|false|
|iconOut|no|String|"bi-dash-lg"|Using the icon parameter, another icon can be used for zooming out.|false|
|supportedDevices|no|String|["Desktop"]|Devices on which the module can be used and is displayed in the menu.|false|
|supportedMapModes|no|String|["2D", "3D"]|Map modes in which the module can be used and is displayed in the menu.|false|

**Example zoom as Object**

```json
"zom" : {
    "iconIn": "bi-plus-lg",
    "iconOut": "bi-dash-lg"
},
```

**Example zoom as Boolean**

```json
"zoom": true
```

***

#### portalConfig.map.featureViaURL {data-toc-label='Feature Via URL'}
Optional configuration for the URL parameter `featureViaURL`. See **[urlParameter](../Misc/urlParameter.md)** for details.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|epsg|no|Integer|4326|EPSG code for coordinate reference system to translate coordinates to.|false|
|layers|yes|**[layers](#portalconfigmapfeatureviaurllayers)**[]||Layer configuration array for given features.|false|
|zoomTo|no|String/String[]||Id of **[layers](#portalconfigmapfeatureviaurllayers)** or array thereof, to which the Masterportal initially zooms. If none are given, the usual initial center coordinate is used.|false|

**Example:**

```json
{
    "featureViaURL": {
        "epsg": 25832,
        "zoomTo": "urlPointFeatures",
        "layers": [
            {
                "id": "urlPointFeatures",
                "geometryType": "Point",
                "name": "URL Point Features",
                "styleId": "url_points"
            },
            {
                "id": "urlLineFeatures",
                "geometryType": "LineString",
                "name": "URL Line Features",
                "styleId": "url_lines"
            },
            {
                "id": "urlPolygonFeatures",
                "geometryType": "Polygon",
                "name": "URL Polygon Features",
                "styleId": "url_polygons"
            },
            {
                "id": "urlMultiPointFeatures",
                "geometryType": "MultiPoint",
                "name": "URL MultiPoint Features",
                "styleId": "url_mulitpoints"
            },
            {
                "id": "urlMultiLineStringFeatures",
                "geometryType": "MultiLineString",
                "name": "URL MultiLineString Features",
                "styleId": "url_multilinestring"
            },
            {
                "id": "urlMultiPolygonFeatures",
                "geometryType": "MultiPolygon",
                "name": "URL MultiPolygon Features",
                "styleId": "url_multipolygons"
            }
        ]
    }
}
```

***

##### portalConfig.map.featureViaURL.layers {data-toc-label='Layers'}
The parameters described apply for each entry of the **[layers](#portalconfigmapfeatureviaurllayers)** array.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|id|yes|String||unique ID for the layer to be created|false|
|geometryType|yes|enum["LineString", "Point", "Polygon", "MultiPoint", "MultiLineString", "MultiPolygon"]||Geometry type of the feature to be shown.|false|
|name|yes|String||Layer name displayed in the layer tree, the legend, and the GFI pop-up.|false
|styleId|no|String||Style id to be used for the feature, referring to the **[style.json](../Global-Config/style.json.md)**.|false|

**Example:**

```json
{
    "layers": [{
        "id": "urlPolygonFeatures",
        "geometryType": "Polygon",
        "name": "URL Polygon Features",
        "styleId": "url_polygons"
    }]
}
```

***

#### portalConfig.map.getFeatureInfo {data-toc-label='Get Feature Info'}
Displays information to a clicked feature by firing a *GetFeatureInfo* or *GetFeature* request, respectively using the loaded data on vector layers.

On all GFI request types except directly fetching HTML, which is done by using `"text/html"` as `"infoFormat"` on a WMS, the "|" character is interpreted as linebreak. You may also use `"\r\n"` or `"\n"`.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|centerMapToClickPoint|no|Boolean|false|If true, centers any clicked feature on the map.|false|
|coloredHighlighting3D|no|**[coloredHighlighting3D](#portalconfigmapgetfeatureinfocoloredhighlighting3d)**||Rule definition to override the highlighting of clicked 3D tiles.|false|
|hideMapMarkerOnVectorHighlight|no|Boolean|false|If set to true, the mapmarker won't be shown on vector highlighting. Only applies for the DetachedTemplate|false|
|highlightVectorRules|no|**[highlightVectorRules](#portalconfigmapgetfeatureinfohighlightvectorrules)**||Rule definition to override the styling of clicked vector data.|false|
|icon|no|String|"bi-info-circle-fill"|CSS icon class. Icon is shown before the tool name.|false|
|menuSide|no|String|"secondaryMenu"|Specifies in which menu the information should be displayed.|false|
|name|yes|String|"common:modules.getFeatureInfo.name"|Name displayed in the menu.|false|

**Example of a GetFeatureInfo configuration**.

```json
"getFeatureInfo": {
    "name": "Request information",
    "icon": "bi-info-circle-fill",
    "coloredHighlighting3D": {
        "enabled": true,
        "color": "GREEN"
    },
    "highlightVectorRules": {
        "fill": {
            "color": [215, 102, 41, 0.9]
        },
        "image": {
            "scale": 1.5
        },
        "stroke": {
            "width": 4
        },
        "text": {
            "scale": 2
        }
    },
    "hideMapMarkerOnVectorHighlight": true
}
```

**Example of a GetFeatureInfo configuration to retrieve information from features**.

```json
"getFeatureInfo": {
    "name": "Request information"
}
```

***

##### portalConfig.map.getFeatureInfo.coloredHighlighting3D {data-toc-label='Colored Highlighting 3D'}
Highlight Setting of 3D Tiles.
If e.g. a building is selected by left mouse click, it will be highlighted in the given color.
For color configuration see **[Color-documentation](https://cesium.com/learn/cesiumjs/ref-doc/Color.html)**

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|color|no|String/String[]|"RED"|Color can be configured as Array or Cesium.Color (definition e.g "GREEN" for Cesium.Color.GREEN)|false|
|enabled|no|Boolean|true|False if coloredHighlighting3D is disabled.|false|

**Example Array**

```json
"coloredHighlighting3D": {
    "enabled": true,
    "color": [0, 255, 0, 255]
}
```

**Example Cesium.Color**

```json
"coloredHighlighting3D": {
    "enabled": true,
    "color": "GREEN"
}
```

***

##### portalConfig.map.getFeatureInfo.highlightVectorRules {data-toc-label='Highlight Vector Rules'}

[type:Image]: # (Datatypes.Image)
[type:Fill]: # (Datatypes.Fill)
[type:Stroke]: # (Datatypes.Stroke)

Configuration list to overwrite vector styles on gfi requests.

Hint: highlighting only works if there is a styleId in config.json configured for the layer.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|fill|no|**[fill](#datatypesfill)**|[255, 255, 255, 0.5]|Settable field: `color`|false|
|image|no|**[image](#datatypesimage)**|1|Settable field: `scale`|false|
|stroke|no|**[stroke](#datatypesstroke)**|1|Settable field: `width`|false|
|text|no|**[text](#portalconfigmapgetfeatureinfohighlightvectorrulestext)**||Settable field: `scale`|false|

***

###### portalConfig.map.getFeatureInfo.highlightVectorRules.text {data-toc-label='Text'}
|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|scale|no|Float|1|Text scale number|false|

**Example**

```json
"text": {
    "scale": 2
}
```

***

#### portalConfig.map.layerPills {data-toc-label='Layer Pills'}
Configuration to make settings for LayerPills.

Layerpills are buttons on top of the map that show the selected layers. When clicking on a LayerPill, the corresponding layer information is displayed in the menu. The close button deselects the layer. The LayerPills attribute is specified as an object and contains the following attributes:

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|active|no|Boolean|false|Indicates whether LayerPills are active.|false|
|mobileOnly|no|Boolean|false|Defines whether LayerPills should only be active in the mobile version.|false|

**Example**

```json
"layerPills": {
    "active": true,
    "mobileOnly": true
}
```

***

#### portalConfig.map.map3dParameter {data-toc-label='Map 3D Parameter'}
Cesium Scene settings in 3D mode.
For more attributes see **[Scene](https://cesium.com/learn/cesiumjs/ref-doc/Scene.html?classFilter=scene)**

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|camera|no|**[camera](#portalconfigmapmap3dparametercamera)**||Cesium Scene camera settings in 3D mode.|false|
|fog|no|**[fog](#portalconfigmapmap3dparameterfog)**||Cesium Scene fog settings in 3D mode.|false|
|fxaa|no|Boolean|true|activates *fast approximate anti-aliasing*|false|
|globe|no|**[globe](#portalconfigmapmap3dparameterglobe)**||Cesium Scene globe settings in 3D mode.|false|
|maximumScreenSpaceError|no|Number|2.0|Detail level in which terrain/raster tiles are fetched. 4/3 is the highest quality level.|false|
|tileCacheSize|no|Number|100|terrain/raster tile cache size|false|

**Example**

```json
{
    "camera": {
        "altitude": 127,
        "heading": -1.2502079000000208,
        "tilt": 45
    },
    "fog": {
        "enabled": true
    },
    "fxaa": true,
    "globe": {
        "enableLighting": true
    },
    "maximumScreenSpaceError": 2,
    "tileCacheSize": 20,
}
```

***

##### portalConfig.map.map3dParameter.camera {data-toc-label='Camera'}
Cesium Scene camera settings in 3D mode.
The camera is defined by a position, orientation, and view frustum.
For more attributes see **[Scene](https://cesium.com/learn/cesiumjs/ref-doc/Camera.html)**

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|altitude|no|Number||Camera's initial height in meters|false|
|heading|no|Number||Camera's initial heading in radians|false|
|tilt|no|Number||Camera's initial tile in radians|false|

**Example**

```json
{
    "camera": {
        "altitude": 127,
        "heading": -1.2502079000000208,
        "tilt": 45
    }
}
```

***

##### portalConfig.map.map3dParameter.fog {data-toc-label='Fog'}
Cesium Scene fog settings in 3D mode.
Blends the atmosphere to geometry far from the camera for horizon views.
For more attributes see **[Scene](https://cesium.com/learn/cesiumjs/ref-doc/Fog.html)**

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|enabled|no|Boolean|false|True if fog is enabled.|false|

**Example**

```json
{
    "fog": {
        "enabled": true
    }
}
```

***

##### portalConfig.map.map3dParameter.globe {data-toc-label='Globe'}
Cesium Scene globe settings in 3D mode.
The globe rendered in the scene, including its terrain and imagery layers.
For more attributes see **[Scene](https://cesium.com/learn/cesiumjs/ref-doc/Globe.html)**

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|enableLighting|no|Boolean|false|Activates light effects on the map based on the sun's position.|false|

**Example**

```json
{
    "globe": {
        "enableLighting": true
    }
}
```

***

#### portalConfig.map.mapMarker {data-toc-label='Map Marker'}
Overrides the map marker module's default values. Useful for 3D markers since OpenLayers's overlays can not be displayed in 3D mode. For this, the map marker has to be defined as vector layer.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|pointStyleId|no|String|"defaultMapMarkerPoint"|StyleId to refer to a `style.json` point style. If not set, the `img/mapMarker.svg` is used.|false|
|polygonStyleId|no|String|"defaultMapMarkerPolygon"|StyleId to refer to a `style.json` polygon style.|false|

**Example:**

```json
{
    "mapMarker": {
        "pointStyleId": "customMapMarkerPoint",
        "polygonStyleId": "customMapMarkerPolygon"
    }
}
```

***

#### portalConfig.map.mapView {data-toc-label='Map View'}

[type:Coordinate]: # (Datatypes.Coordinate)

Defines the initial map view and a background shown when no layer or map is selected.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|backgroundImage|no|String|"https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/doc/config.json.md#portalconfigmapview"|Path to an alternative background image.|false|
|epsg|no|String|"EPSG:25832"|Coordinate reference system EPSG code. The code must be defined as a `namedProjection`.|false|
|extent|no|**[Extent](#datatypesextent)**|[510000.0, 5850000.0, 625000.4, 6000000.0]|Map extent - map may not be moved outside these boundaries.|false|
|mapInteractions|nein|**[mapInteractions](#portalconfigmapmapviewmapinteractions)**||Overrides the ol map interactions. Provides further configuration possibilities for control behaviour and keyboardEventTarget.|false|
|options|no|**[option](#portalconfigmapmapviewoption)**[]|[{"resolution":66.14579761460263,"scale":250000,"zoomLevel":0}, {"resolution":26.458319045841044,"scale":100000,"zoomLevel":1}, {"resolution":15.874991427504629,"scale":60000,"zoomLevel":2}, {"resolution": 10.583327618336419,"scale":40000,"zoomLevel":3}, {"resolution":5.2916638091682096,"scale":20000,"zoomLevel":4}, {"resolution":2.6458319045841048,"scale":10000,"zoomLevel":5}, {"resolution":1.3229159522920524,"scale":5000,"zoomLevel":6}, {"resolution":0.6614579761460262,"scale":2500,"zoomLevel":7}, {"resolution":0.2645831904584105,"scale": 1000,"zoomLevel":8}, {"resolution":0.13229159522920521,"scale":500,"zoomLevel":9}]|Available scale levels and their resolutions.|false|
|startCenter|no|**[Coordinate](#datatypescoordinate)**|[565874, 5934140]|The initial center coordinate.|false|
|startResolution|no|Float|15.874991427504629|The initial map resolution from the `options` element. Used in preference to `startZoomLevel`.|false|
|startZoomLevel|no|Integer||The initial map zoom level from the `options` element. If `resolutions` is set, this is ignored.|false|

**Example**

```json
{
    "mapView": {
        "backgroundImage": "https://geodienste.hamburg.de/lgv-config/img/backgroundCanvas.jpeg",
        "startCenter": [561210, 5932600],
        "options": [
            {
                "resolution": 611.4974492763076,
                "scale": 2311167,
                "zoomLevel": 0
            },
            {
                "resolution": 305.7487246381551,
                "scale": 1155583,
                "zoomLevel": 1
            },
            {
                "resolution": 152.87436231907702,
                "scale": 577791,
                "zoomLevel": 2
            },
            {
                "resolution": 76.43718115953851,
                "scale": 288896,
                "zoomLevel": 3
            },
            {
                "resolution": 38.21859057976939,
                "scale": 144448,
                "zoomLevel": 4
            },
            {
                "resolution": 19.109295289884642,
                "scale": 72223,
                "zoomLevel": 5
            },
            {
                "resolution": 9.554647644942321,
                "scale": 36112,
                "zoomLevel": 6
            },
            {
                "resolution": 4.7773238224711605,
                "scale": 18056,
                "zoomLevel": 7
            },
            {
                "resolution": 2.3886619112355802,
                "scale": 9028,
                "zoomLevel": 8
            },
            {
                "resolution": 1.1943309556178034,
                "scale": 4514,
                "zoomLevel": 9
            },
            {
                "resolution": 0.5971654778089017,
                "scale": 2257,
                "zoomLevel": 10
            }
        ],
        "extent": [510000.0, 5850000.0, 625000.4, 6000000.0],
        "StartResolution": 15.874991427504629,
        "StartZoomLevel": 1,
        "epsg": "EPSG:25832"
    }
}
```

***

##### portalConfig.map.mapView.mapInteractions {data-toc-label='Map Interactions'}
Overrides the ol map interactions. Provides further configuration possibilities for control behaviour and keyboardEventTarget.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|interactionModes|no|**[interactionModes](#portalconfigmapmapviewmapinteractionsinteractionmodes)**|{"dragPan": false, "altShiftDragRotate": false, "pinchRotate": false}| Interaction settings for the ol default interactions. If not set, the default setting is used.|false|
|keyboardEventTarget|no|Boolean|false|Possibility to set the keyboard event target for the ol map e.g keyboardEventTarget: document|false|

**Example:**

```json
{
    "mapInteractions": {
        "interactionModes": {
            "dragPan": false,
            "altShiftDragRotate": true,
            "pinchRotate": false,
            "dragZoom": true
        },
        "keyboardEventTarget": false
    }
}
```

***

##### portalConfig.map.mapView.mapInteractions.interactionModes {data-toc-label='Interaction Modes'}
Interaction settings for the ol default interactions. If not set, the default setting is used.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|altShiftDragRotate|no|Boolean|true|Rotate the map with alt + shift + drag.|false|
|dragPan|no|Boolean|false|Allows the user to move the map by dragging it.|false|
|dragZoom|no|Boolean|false|Allows the user to zoom the map by clicking and dragging on the map.|false|
|pinchRotate|no|Boolean|false|Allows the user to rotate the map by twisting with two fingers on a touch screen.|false|
|twoFingerPan|no|Boolean|false|Should a 2-Finger-Pan be set on mobile devices instead of a 1-Finger-Pan?|false|

**Example**

```json
"interactionModes": {
    "dragPan": false,
    "altShiftDragRotate": true,
    "pinchRotate": false,
    "dragZoom": true,
    "twoFingerPan": true
}
```

***

##### portalConfig.map.mapView.option {data-toc-label='Option'}
An option defines a zoom level. Each zoom level is defined by resolution, scale number, and a unique zoom level. The higher the zoom level, the smaller the scale and the closer you have zoomed.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|resolution|yes|Number||Zoom level definition's resolution.|false|
|scale|yes|Integer||Zoom level definition's scale.|false|
|zoomLevel|yes|Integer||Zoom level definition's zoom level.|false|

**mapView option example**

```json
{
    "resolution": 611.4974492763076,
    "scale": 2311167,
    "zoomLevel": 0
}
```

***

#### portalConfig.map.mouseHover {data-toc-label='Mouse Hover'}
Enables the MouseHover function for vector layers, e.g. WFS or GeoJSON. For per-layer configuration see **[Vector](#layerconfigelementslayersvector)**.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|infoText|no|String|"common:modules.mouseHover.infoText"| Text that will be displayed if the features exceed the number of `numFeaturesToShow`.|false|
|numFeaturesToShow|no|Integer|2|Maximum amount of element information per tooltip; when exceeded, an information text informs the user of cut content.|false|

**Example**

```json
"mouseHover": {
    "numFeaturesToShow": 1,
    "infoText": "Exampletext"
},
```

***

#### portalConfig.map.zoomTo {data-toc-label='Zoom To'}
Configuration for the URL query parameters `zoomToFeatureId` and `zoomToGeometry`.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|addFeatures|no|Boolean|true|Specifies whether the desired features should be added to the map in a separate layer.|false|
|allowedValues|no|String[]||Only relevant when `id` equal `zoomToGeometry`. Further filters the values allowed in the URL query parameters.|false|
|id|yes|enum["zoomToFeatureId", "zoomToGeometry"]||Id of the URL query parameter the configuration refers to.|false|
|layerId|yes|String||Id of the layer the feature should be fetched from.|false|
|property|yes|String||Name of the property the features should be filtered by.|false|
|styleId|no|String||Only relevant when `id` equal `zoomToFeatureId`. Id of the `styleObject` that should be used to style the features retrieved from the service.|false|

**Example**:

```json
{
    "zoomTo": [
        {
            "id": "zoomToGeometry",
            "layerId": "1692",
            "property": "bezirk_name",
            "allowedValues": [
                "ALTONA",
                "HARBURG",
                "HAMBURG-NORD",
                "BERGEDORF",
                "EIMSBÜTTEL",
                "HAMBURG-MITTE",
                "WANDSBEK"
            ]
        },
        {
            "id": "zoomToFeatureId",
            "layerId": "4560",
            "property": "flaechenid",
            "styleId": "location_eventlotse"
        }
    ]
}
```

***

### portalConfig.menu {data-toc-label='Menu'}
Here you can configure the menu items for the `mainMenu` (in the desktop view on the left) and `secondaryMenu` (in the desktop view on the right) and their arrangement. The order of the modules results from the order in the *Config.json*.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|currentComponent|no|String|""|Defines a module that is opened initially.|false|
|expanded|no|Boolean|false|Defines whether the respective menu is expanded or collapsed when the portal is started.|false|
|width|no|String|"25%"|Sets the initial width of the respective menu as a percentage value.|false|
|showDescription|no|Boolean||Defines whether a description of the modules should be displayed in the respective menu.|false|
|showHeaderIcon|no|Boolean|false|Defines whether the icon of the current module is shown in the menu header|false|
|searchBar|no|**[searchBar](#portalconfigmenusearchbar)**||The search bar allows requesting information from various search services at once.|false|
|sections|no|**[sections](#portalconfigmenusections)**[]||Subdivision of modules in the menu.|false|
|title|no|**[title](#portalconfigmenutitle)**||The portal's title and further elements to be shown in the main menu bar.|false|

***

#### portalConfig.menu.searchBar {data-toc-label='Search Bar'}
Configuration of the search bar. Different search services can be configured.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|minCharacters|no|Integer|3|Minimum amount of characters before sending a request to an external service.|false|
|placeholder|no|String|"common:modules.searchBar.placeholder.address"|Input text field placeholder shown when no input has been given yet.|false|
|searchInterfaces|no|**[searchInterfaces](#portalconfigmenusearchbarsearchinterfaces)**[]||Interfaces to search services.|false|
|timeout|no|Integer|5000|Service request timeout in milliseconds.|false|
|zoomLevel|no|Integer|7|ZoomLevel to which the searchbar zooms in at maximum.|false|

**Example**

```json
{
    "searchBar": {
        "minCharacters": 3,
        "placeholder": "common:modules.searchBar.placeholder.address",
        "searchInterfaces": [
            {
                "type": "gazetteer",
                "serviceId": "6",
                "searchAddress": true,
                "searchStreets": true,
                "searchHouseNumbers": true,
                "searchDistricts": true,
                "searchParcels": true,
                "searchStreetKey": true
            }
        ],
        "timeout": 5000,
        "zoomLevel": 7
    }
}
```

***

##### portalConfig.menu.searchBar.searchInterfaces {data-toc-label='Search Interfaces'}
Definitions of the search interfaces.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|bkg|no|**[bkg](#portalconfigmenusearchbarsearchinterfacesbkg)**||BKG search service configuration.|false|
|elasticSearch|no|**[elasticSearch](#portalconfigmenusearchbarsearchinterfaceselasticsearch)**||Elastic search service configuration.|false|
|gazetteer|no|**[gazetteer](#portalconfigmenusearchbarsearchinterfacesgazetteer)**||Configuration of the Gazetteer search service.|false|
|komootPhoton|no|**[komootPhoton](#portalconfigmenusearchbarsearchinterfaceskomootphoton)**||Komoot Photon search service configuration.|false|
|locationFinder|no|**[locationFinder](#portalconfigmenusearchbarsearchinterfaceslocationfinder)**||LocationFinder search service configuration.|false|
|osmNominatim|no|**[osmNominatim](#portalconfigmenusearchbarsearchinterfacesosmnominatim)**||OpenStreetMap (OSM) search service configuration.|false|
|specialWFS|no|**[specialWFS](#portalconfigmenusearchbarsearchinterfacesspecialwfs)**||specialWFS search service configuration.|false|
|topicTree|no|**[topicTree](#portalconfigmenusearchbarsearchinterfacestopictree)**||Topic selection tree search configuration.|false|
|visibleVector|no|**[visibleVector](#portalconfigmenusearchbarsearchinterfacesvisiblevector)**||Visible vector layer search configuration.|false|

**Example**

```json
"searchInterfaces": [
    {
        "type": "gazetteer",
        "serviceId": "6",
        "searchAddress": true,
        "searchStreets": true,
        "searchHouseNumbers": true,
        "searchDistricts": true,
        "searchParcels": true,
        "searchStreetKey": true
    }
]
```

***

###### portalConfig.menu.searchBar.searchInterfaces.bkg {data-toc-label='BKG'}

[type:Extent]: # (Datatypes.Extent)
[type:resultEvents]: # (portalConfig.menu.searchBar.searchInterfaces.resultEvents)

BKG search service configuration.

**Attention: This requires a backend!**

**To avoid openly using your BKG UUID, URLs ("bkg_geosearch" and "bkg_suggest" in this case) of the restServices should be caught and redirected in a proxy.**

**Example proxy configuration**

```
ProxyPass /bkg_geosearch http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/geosearch
<Location /bkg_geosearch>
  ProxyPassReverse http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/geosearch
</Location>

ProxyPass /bkg_suggest http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/suggest
<Location /bkg_suggest>
  ProxyPassReverse http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/suggest
</Location>
```

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|epsg|no|String|"EPSG:25832"|EPSG code of the coordinate reference system to use.|false|
|extent|no|**[Extent](#datatypesextent)**|[454591, 5809000, 700000, 6075769]|Coordinate extent in which search algorithms should return.|false|
|geoSearchServiceId|yes|String||Search service id. Resolved using the **[rest-services.json](../Global-Config/rest-services.json.md)** file.|false|
|minScore|no|Number|0.6|Score defining the minimum quality of search results.|false|
|resultCount|no|Integer|20|Maximum number of search hits returned by the service.|false|
|resultEvents|no|**[resultEvents](#portalconfigmenusearchbarsearchinterfacesresultevents)**|{"onClick": ["setMarker", "zoomToResult"], "onHover": ["setMarker"], "buttons": ["startRouting"]}|Actions that are executed when an interaction, such as hover or click, is performed with a result list item. The following events are possible: "setMarker", "zoomToResult", "startRouting".|false|
|type|yes|String|"bkg"|Search interface type. Defines which search interface is configured.|false|

**Example**

```json
{
    "geoSearchServiceId": "5",
    "extent": [454591, 5809000, 700000, 6075769],
    "resultCount": 10,
    "epsg": "EPSG:25832",
    "minScore": 0.6,
    "type": "bkg"
}
```

***

###### portalConfig.menu.searchBar.searchInterfaces.elasticSearch {data-toc-label='Elastic Search'}

[type:resultEvents]: # (portalConfig.menu.searchBar.searchInterfaces.resultEvents)

Elasticsearch service configuration.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|hitIcon|no|String|"bi-signpost-2"|CSS icon class of search results, shown before the result name.|false|
|hitMap|no|**[hitMap](#portalconfigmenusearchbarsearchinterfaceselasticsearchhitmap)**||Object mapping result object attributes to keys.|true|
|hitTemplate|no|String|"default"|Template in which the search results (`show all`) are displayed. Possible values are "default" and "layer".|false|
|hitType|no|String|"common:modules.searchbar.type.subject"|Search result type shown in the result list after the result name. Set to the translation key.|false|
|resultEvents|no|**[resultEvents](#portalconfigmenusearchbarsearchinterfacesresultevents)**|{"onClick": ["addLayerToTopicTree"], "buttons": ["showInTree", "showLayerInfo"]}|Actions that are executed when an interaction, such as hover or click, is performed with a result list item. The following events are possible: "addLayerToTopicTree", "setMarker", "showInTree", "showLayerInfo", "startRouting", "zoomToResult".|false|
|requestType|no|enum["POST", "GET"]|"POST"|Request type|false|
|responseEntryPath|no|String|""|Response JSON attribute path to found features.|false|
|searchInterfaceId|no|String|"elasticSearch"|Id, which is used to link to the searchbar in the topic search.|false|
|searchStringAttribute|no|String|"searchString"|Search string attribute name for `payload` object.|false|
|serviceId|yes|String||Search service id. Resolved using the **[rest-services.json](../Global-Config/rest-services.json.md)** file.|false|
|type|yes|String|"elasticSearch"|Search interface type. Defines which search interface is configured.|false|

As an additional property, you may add `payload`. It is not required, and matches the custom object description. By default, it is set to the empty object `{}`. The object describes the payload to be sent as part of the request. It must provide the searchString attribute. For more info on usable attributes, see **[Elasticsearch Guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-search.html)**. This object can not be handled in the Admintool, since custom objects are not yet supported.

 **Example**

```json
{
    "type": "elasticSearch",
    "searchInterfaceId":"elasticSearch_0",
    "serviceId":"elastic",
    "requestType": "GET",
    "payload": {
        "id":"query",
        "params":{
            "query_string":""
        }
    },
    "searchStringAttribute": "query_string",
    "responseEntryPath": "hits.hits",
    "hitMap": {
        "name": "_source.name",
        "id": "_source.id",
        "source": "_source"
    },
    "hitType": "common:modules.searchbar.type.subject",
    "hitIcon": "bi-list-ul"
}
```

***

###### portalConfig.menu.searchBar.searchInterfaces.elasticSearch.hitMap {data-toc-label='Hit Map'}
Mapping Objekt. Mappt die Attribute des Ergebnis Objektes auf den entsprechenden Key.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|coordinate|no|String/String[]||Attribute value will be mapped to the attribute key. Required to display a map marker.|false|
|id|yes|String/String[]|"id"|Attribute value will be mapped to the attribute key. Required to display results.|false|
|layerId|yes|String/String[]||Attribute value will be mapped to the attribute key. Required to display results.|false|
|name|yes|String/String[]|"name"|Attribute value will be mapped to the attribute key. Required to display results.|false|
|source|yes|String/String[]|"source"|Attribute value will be mapped to the attribute key. Required to display results.|false|
|toolTip|yes|String/String[]||Attribute value will be mapped to the attribute key. Required to display results.|false|

**Example**

```json
"hitMap": {
    "name": "_source.name",
    "id": "_source.id",
    "source": "_source",
    "layerId": "_source.id",
    "toolTip": [
        "_source.name",
        "_source.datasets.md_name"
    ]
}
```

***

###### portalConfig.menu.searchBar.searchInterfaces.gazetteer {data-toc-label='Gazetteer'}

[type:resultEvents]: # (portalConfig.menu.searchBar.searchInterfaces.resultEvents)

Gazetteer search service configuration.

**This requires a backend!**
**A WFS's Stored Query is requested with predefined parameters.**

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|resultEvents|no|**[resultEvents](#portalconfigmenusearchbarsearchinterfacesresultevents)**|{"onClick": ["setMarker", "zoomToResult"], "onHover": ["setMarker"], "buttons": ["startRouting"]}|Actions that are executed when an interaction, such as hover or click, is performed with a result list item. The following events are possible: "setMarker", "zoomToResult".|false|
|searchAddress|no|Boolean|false|Defines whether address search is active. For backward compatibility, if "searchAddress" is not configured, the "searchAddress" attribute is set to "true" when "searchStreets" and "searchHouseNumbers" are set to "true".|false|
|searchDistricts|no|Boolean|false|Defines whether district search is active.|false|
|searchHouseNumbers|no|Boolean|false|Defines whether house numbers should be searched for. Requires `searchStreets` to be set to `true`, too.|false|
|searchParcels|no|Boolean|false|Defines whether parcels search is active.|false|
|searchStreetKey|no|Boolean|false|Defines whether streets should be searched for by key.|false|
|searchStreets|no|Boolean|false|Defines whether street search is active. Precondition to set `searchHouseNumbers` to `true`.|false|
|serviceId|yes|String||Search service id. Resolved using the **[rest-services.json](../Global-Config/rest-services.json.md)** file.|false|
|showGeographicIdentifier|no|Boolean|false|Specifies whether the attribute `geographicIdentifier` should be used to display the search result.|false|
|type|yes|String|"gazetteer"|Search interface type. Defines which search interface is configured.|false|

**Example**

```json
{
    "type": "gazetteer",
    "serviceId": "6",
    "searchAddress": true,
    "searchStreets": true,
    "searchHouseNumbers": true,
    "searchDistricts": true,
    "searchParcels": true,
    "searchStreetKey": true
}
```

***

###### portalConfig.menu.searchBar.searchInterfaces.komootPhoton {data-toc-label='Komoot Photon'}

[type:resultEvents]: # (portalConfig.menu.searchBar.searchInterfaces.resultEvents)

Search by **[Komoot Photon](https://photon.komoot.io/)**.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|bbox|no|string||Boundingbox of the search.|false|
|lang|no|string|"de"|Language of the Komoot Search. Effects language specific locationnames (e.g. Countrynames) aus.|false|
|lat|no|Number||Latitude of the center for the search.|false|
|limit|no|Number||Maximum amount of requested unfiltered results.|false|
|lon|no|Number||Longtitude of the center for the search.|false|
|osm_tag|no|string||Filtering of OSM Tags (see https://github.com/komoot/photon#filter-results-by-tags-and-values).|false|
|resultEvents|no|**[resultEvents](#portalconfigmenusearchbarsearchinterfacesresultevents)**|{"onClick": ["setMarker", "zoomToResult"], "onHover": ["setMarker"], "buttons": ["startRouting"]}|Actions that are executed when an interaction, such as hover or click, is performed with a result list item. The following events are possible: "setMarker", "startRouting", "zoomToResult".|false|
|serviceId|yes|String||Komoot search service id. Resolved using the **[rest-services.json](../Global-Config/rest-services.json.md)** file.|false|
|type|yes|String|"komootPhoton"|Search interface type. Defines which search interface is configured.|false|

**Example**

```json
{
    "type": "komootPhoton",
    "serviceId": "10",
    "limit": 20,
    "lang": "de",
    "lat": 52.5,
    "lon": 13.4,
    "bbox": "12.5,52.05,14.05,52.75"
}
```

***

###### portalConfig.menu.searchBar.searchInterfaces.locationFinder {data-toc-label='Location Finder'}

[type:resultEvents]: # (portalConfig.menu.searchBar.searchInterfaces.resultEvents)

Configuration of the search by usage of an ESRI CH LocationFinder.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|classes|no|**[LocationFinderClass](#portalconfigmenusearchbarsearchinterfaceslocationfinderlocationfinderclass)**||May contain classes (with properties) to use in searches. If nothing is specified, all classes are considered valid.|false|
|epsg|no|String||Coordinate reference system (EPSG-Code) to use for requests. By default, the value in `portalConfig.mapView.epsg` is used.|false|
|resultEvents|no|**[resultEvents](#portalconfigmenusearchbarsearchinterfacesresultevents)**|{"onClick": ["setMarker", "zoomToResult"], "onHover": ["setMarker"], "buttons": ["startRouting"]}|Actions that are executed when an interaction, such as hover or click, is performed with a result list item. The following events are possible: "setMarker", "startRouting", "zoomToResult".|false|
|serviceId|yes|String||Service id. Resolved using the **[rest-services.json](../Global-Config/rest-services.json.md)** file.|false|
|type|yes|String|"locationFinder"|Search interface type. Defines which search interface is configured.|false|

**Example**

```json
{
    "type": "locationFinder",
    "serviceId": "locationFinder",
    "classes": [
        {
            "name": "Haltestelle",
            "icon": "bi-record-circle"
        },
        {
            "name": "Straßenname"
        }
    ]
}
```

***

###### portalConfig.menu.searchBar.searchInterfaces.locationFinder.LocationFinderClass {data-toc-label='Location Finder Class'}
Definition of classes that should be considered with the results.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|icon|no|String|"bi-signpost-2"|Class visualization by a icon|false|
|name|yes|String||Class name|false|
|zoom|no|String|"center"|Defines how to zoom to a hit on selection. If `center` is chosen, the center coordinate (`cx`, `cy`) is zoomed to and a marker is placed. If `bbox` is chosen, the LocationFinder's given BoundingBox (`xmin`, `ymin`, `xmax`, `ymax`) is zoomed to, and no marker is shown.|false|

**Example**

```json
{
    "type": "locationFinder",
    "serviceId": "10",
    "classes": [
        {
			"name": "Haltestelle",
			"icon": "bi-record-circle"
		},
		{
			"name": "Adresse",
			"icon": "bi-house-door-fill"
		},
		{
			"name": "Straßenname",
			"zoom": "bbox"
		}
    ]
}
```

***

###### portalConfig.menu.searchBar.searchInterfaces.osmNominatim {data-toc-label='OSM Nominatim'}

[type:resultEvents]: # (portalConfig.menu.searchBar.searchInterfaces.resultEvents)

OpenStreetMap search for city, street, and house number. Only executed on clicking the search icon or pressing enter since the amount of requests to the OSM search service is limited.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|classes|no|String|[]|May contain the classes to search for.|false|
|limit|no|Number|50|Maximum amount of requested unfiltered results.|false|
|resultEvents|no|**[resultEvents](#portalconfigmenusearchbarsearchinterfacesresultevents)**|{"onClick": ["setMarker", "zoomToResult"], "onHover": ["setMarker"], "buttons": ["startRouting"]}|Actions that are executed when an interaction, such as hover or click, is performed with a result list item. The following events are possible: "setMarker", "startRouting", "zoomToResult".|false|
|serviceId|yes|String||OSM search service id. Resolved using the **[rest-services.json](../Global-Config/rest-services.json.md)** file.|false|
|states|no|string|""|May contain federal state names with arbitrary separators. Names may also be used in English depending on whether the data has been added to the free open source project **[OpenStreetMap](https://www.openstreetmap.org)**.|false|
|type|yes|String|"osmNominatim"|Search interface type. Defines which search interface is configured.|false|

**Example**

```json
{
    "type": "osmNominatim",
    "serviceId": "10",
    "limit": 60,
    "states": "Hamburg, Nordrhein-Westfalen, Niedersachsen, Rhineland-Palatinate Rheinland-Pfalz",
    "classes": "place,highway,building,shop,historic,leisure,city,county"
}
```

***

###### portalConfig.menu.searchBar.searchInterfaces.specialWFS {data-toc-label='Special WFS'}

[type:resultEvents]: # (portalConfig.menu.searchBar.searchInterfaces.resultEvents)

WFS search function configuration. Requests features from a WFS. The service must be configured to allow WFS 2.0 requests.

For example, on entering "Kronenmatten" the service
https://geoportal.freiburg.de/geoportal_freiburg_de/wfs/stpla_bplan/wfs_mapfile/geltungsbereiche
will be requested with the following XML attached as payload, and the service will answer with an XML FeatureCollection. The collection features will then be offered as search results.

```xml
<?xml version='1.0' encoding='UTF-8'?>
<wfs:GetFeature service='WFS' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' traverseXlinkDepth='*' version='1.1.0'>
    <wfs:Query typeName='ms:geltungsbereiche'>
        <wfs:PropertyName>ms:planbez</wfs:PropertyName>
        <wfs:PropertyName>ms:msGeometry</wfs:PropertyName>
        <wfs:maxFeatures>20</wfs:maxFeatures>
        <ogc:Filter>
            <ogc:PropertyIsLike matchCase='false' wildCard='*' singleChar='#' escapeChar='!'>
                <ogc:PropertyName>ms:planbez</ogc:PropertyName>
                <ogc:Literal>*Kronenmatten*</ogc:Literal>
            </ogc:PropertyIsLike>
        </ogc:Filter>
    </wfs:Query>
</wfs:GetFeature>
```

The WFS 2.0 query is dynamically created by the Masterportal. No stored query configuration is required in the service.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|definitions|no|**[definition](#portalconfigmenusearchbarsearchinterfacesspecialwfsdefinition)** *[]||Special WFS search definitions.|false|
|geometryName|no|String|"app:geom"|Geometry attribute name required for zoom functionality. Overwritable by a **[definition](#portalconfigmenusearchbarsearchinterfacesspecialwfsdefinition)**.|false|
|icon|no|String|"bi-house-fill"|Default icon used in the suggestion list. Overwritable by a **[definition](#portalconfigmenusearchbarsearchinterfacesspecialwfsdefinition)**.|false|
|maxFeatures|no|Integer|20|Maximum amount of features to be returned. Overwritable by a **[definition](#portalconfigmenusearchbarsearchinterfacesspecialwfsdefinition)**.|false|
|namespaces|no|String|"xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml'"|XML name spaces to request `propertyNames` or `geometryName`. (`xmlns:wfs`, `xmlns:ogc`, and `xmlns:gml` are always used.) Overwritable by a **[definition](#portalconfigmenusearchbarsearchinterfacesspecialwfsdefinition)**.|false|
|resultEvents|no|**[resultEvents](#portalconfigmenusearchbarsearchinterfacesresultevents)**|{"onClick": ["highlightFeature", "setMarker", "zoomToResult"], "onHover": ["highlightFeature", "setMarker"]}|Actions that are executed when an interaction, such as hover or click, is performed with a result list item. The following events are possible: "highlightFeature", "setMarker", "zoomToResult".|false|
|type|yes|String|"specialWFS"|Search interface type. Defines which search interface is configured.|false|

**Example**

```json
{
    "type": "specialWFS",
    "definitions": [
        {
            "url": "https://geodienste.hamburg.de/MRH_WFS_Rotenburg",
            "typeName": "app:mrh_row_bplan",
            "propertyNames": ["app:name"],
            "name": "B-Plan",
            "namespaces": "xmlns:app='http://www.deegree.org/app'"
        },
        {
            "url": "/geodienste.hamburg.de/HH_WFS_Bebauungsplaene",
            "typeName": "app:prosin_imverfahren",
            "propertyNames": ["app:plan"],
            "geometryName": "app:the_geom",
            "name": "im Verfahren",
            "namespaces": "xmlns:app='http://www.deegree.org/app'"
        }
    ]
}
```

***

###### portalConfig.menu.searchBar.searchInterfaces.specialWFS.definition {data-toc-label='Definition'}
Configuration of definition of the SpecialWFS search.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|geometryName|no|String|"app:geom"|Geometry attribute name required for zoom functionality.|false|
|icon|no|String|"bi-house-fill"|CSS icon class of search results, shown before the result name.|false|
|maxFeatures|no|Integer|20|Maximum amount of features to be returned.|false|
|name|no|String||Category name displayed in the suggestion list.|false|
|namespaces|no|String||XML name spaces to request `propertyNames` or `geometryName`. (`xmlns:wfs`, `xmlns:ogc`, and `xmlns:gml` are always used.)|false|
|propertyNames|no|String[]||Array of attribute names to be searched.|false|
|typeName|no|String||The name of the WFS layer to be requested.|false|
|url|no|String||WFS URL. Depending on your proxy configuration, the relative URL from the portal server must be given.|false|

**Example**

```json
{
    "url": "https://geodienste.hamburg.de/HH_WFS_Bebauungsplaene",
    "typeName": "app:prosin_imverfahren",
    "propertyNames": ["app:plan"],
    "geometryName": "app:the_geom",
    "name": "im Verfahren"
}
```

***

###### portalConfig.menu.searchBar.searchInterfaces.topicTree {data-toc-label='Topic Tree'}

[type:resultEvents]: # (portalConfig.menu.searchBar.searchInterfaces.resultEvents)

Searching all topic selection tree layers.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|hitTemplate|no|String|"default"|Template in which the search results (`show all`) are displayed. Possible values are "default" and "layer".|false|
|resultEvents|no|**[resultEvents](#portalconfigmenusearchbarsearchinterfacesresultevents)**|{"onClick": ["activateLayerInTopicTree"], "buttons": ["showInTree", "showLayerInfo"]}|Actions that are executed when an interaction, such as hover or click, is performed with a result list item. The following events are possible: "activateLayerInTopicTree", "showInTree", "showLayerInfo".|false|
|searchInterfaceId|no|String|"topicTree"|Id, which is used to link to the searchbar in the topic search.|false|
|searchType|no|String|""|Decides whether the metadata or the name of a layer should be searched. Possible value: "metadata". The default value is unset so the name will be searched.|false|
|type|yes|String|"topicTree"|Search interface type. Defines which search interface is configured.|false|

**Example**

```json
{
    "type": "topicTree",
    "searchInterfaceId": "topicTree"
}
```

***

###### portalConfig.menu.searchBar.searchInterfaces.visibleVector {data-toc-label='Visible Vector'}

[type:resultEvents]: # (portalConfig.menu.searchBar.searchInterfaces.resultEvents)

Visible vector layer search configuration. For all vector layers supposed to be searchable, set the **[searchField](#layerconfigelementslayersvector)** attribute in the layer definition object "Fachdaten".

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|resultEvents|no|**[resultEvents](#portalconfigmenusearchbarsearchinterfacesresultevents)**|{"onClick": ["openGetFeatureInfo", "setMarker", "zoomToResult"], "onHover": ["setMarker"]}|Actions that are executed when an interaction, such as hover or click, is performed with a result list item. The following events are possible: "openGetFeatureInfo", "setMarker", "zoomToResult".|false|
|type|yes|String|"visibleVector"|Search interface type. Defines which search interface is configured.|false|

**Example**

```json
{
    "type": "visibleVector"
}
```

***

###### portalConfig.menu.searchBar.searchInterfaces.resultEvents {data-toc-label='Result Events'}
Actions that are executed when an interaction, such as hover or click, is performed with a result list item.

The following events exist. Which events can be configured can be found in the descriptions of the respective search interface:

- activateLayerInTopicTree: Activates the found layer in the topic tree and map.
- addLayerToTopicTree: Adds the found layer to the topic tree and map.
- highligtFeature: Highlights the search result on the map.
- openGetFeatureInfo: Opens the GetFeatureInfo for the search hit in the menu.
- showInTree: Opens the topic selection and shows the selected layer.
- showLayerInfo: Opens the layer information.
- startRouting: Starts the Routing module with the selected address as destination.
- setMarker: Places a marker on the map.
- zoomToResult: Zooms to the search hit.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|buttons|no|String[]||Buttons that are displayed in the result list for each search result and perform an action when clicked|false|
|onClick|no|String[]||Actions that are fired when clicking on a result list item.|false|
|onHover|no|String[]||Actions that are fired when hovering on a result list item.|false|

**Example 1**

```json
"resultEvents": {
    "onClick": ["setMarker", "zoomToResult"],
    "onHover": ["setMarker"]
}
```

**Example 2**

```json
"resultEvents": {
    "onClick": ["activateLayerInTopicTree"],
    "buttons": ["showInTree", "showLayerInfo"]
}
```

***

#### portalConfig.menu.sections {data-toc-label='Sections'}

[type:about]: # (portalConfig.menu.sections.modules)
[type:addWMS]: # (portalConfig.menu.sections.modules)
[type:bufferAnalysis]: # (portalConfig.menu.sections.modules)
[type:contact]: # (portalConfig.menu.sections.modules)
[type:compareMaps]: # (portalConfig.menu.sections.modules)
[type:coordToolkit]: # (portalConfig.menu.sections.modules)
[type:copyrightConstraints]: # (portalConfig.menu.sections.modules)
[type:customMenuElement]: # (portalConfig.menu.sections.modules)
[type:draw]: # (portalConfig.menu.sections.modules)
[type:featureLister]: # (portalConfig.menu.sections.modules)
[type:fileImport]: # (portalConfig.menu.sections.modules)
[type:filter]: # (portalConfig.menu.sections.modules)
[type:language]: # (portalConfig.menu.sections.modules)
[type:layerClusterToggler]: # (portalConfig.menu.sections.modules)
[type:layerSlider]: # (portalConfig.menu.sections.modules)
[type:login]: # (portalConfig.menu.sections.modules)
[type:measure]: # (portalConfig.menu.sections.modules)
[type:news]: # (portalConfig.menu.sections.modules)
[type:openConfig]: # (portalConfig.menu.sections.modules)
[type:print]: # (portalConfig.menu.sections.modules)
[type:routing]: # (portalConfig.menu.sections.modules)
[type:scaleSwitcher]: # (portalConfig.menu.sections.modules)
[type:selectFeatures]: # (portalConfig.menu.sections.modules)
[type:shadow]: # (portalConfig.menu.sections.modules)
[type:statisticDashboard]: # (portalConfig.menu.sections.modules)
[type:shareView]: # (portalConfig.menu.sections.modules)
[type:statisticDashboard]: # (portalConfig.menu.sections.modules)
[type:styleVT]: # (portalConfig.menu.sections.modules)
[type:wfsSearch]: # (portalConfig.menu.sections.modules)
[type:wfst]: # (portalConfig.menu.sections.modules)

Modules can be divided into sections. In the menu, sections are divided with a horizontal line.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|about|no|**[about](#portalconfigmenusectionsmodulesabout)**||This module displays specific portal information like description, Masterportal version, Metadata.|true|
|addWMS|no|**[addWMS](#portalconfigmenusectionsmodulesaddwms)**||This module allows loading specific WMS layers. This is done by providing a URL. All the service's layers are retrieved and offered in the layer tree in section "External technical data".|true|
|bufferAnalysis|no|**[bufferAnalysis](#portalconfigmenusectionsmodulesbufferanalysis)**||This buffer analysis allows the selection of a source layer, a buffer radius and a target layer. The chosen buffer radius will then be shown around features of the selected source layer. At the moment a target layer is selected, only the features of this layer will be shown, if they are outside the buffer radii. It is also possible to invert the result. In this case the resulting features will only be show if they are inside the radii.|false|
|contact|no|**[contact](#portalconfigmenusectionsmodulescontact)**||The contact form allows users to send messages to a configured email address. For example, this may be used to allow users to submit errors and suggestions. A file can be appended.|false|
|compareMaps|no|**[compareMaps](#portalconfigmenusectionsmodulescomparemaps)**||This tool allows users to compare two map layers side by side using a layer swiper. |false|
|coordToolkit|no|**[coordToolkit](#portalconfigmenusectionsmodulescoordtoolkit)**||Coordinate query: Tool to query coordinates and altitude by mouse click: When clicking in the map, the coordinates are frozen in the display and can also be copied directly to the clipboard. Coordinate search: The coordinate system and the coordinates can be entered via an input mask. The tool then zooms to the corresponding coordinate and places a marker on it. The coordinate systems are obtained from config.js.|false|
|copyrightConstraints|no|**[copyrightConstraints](#portalconfigmenusectionsmodulescopyrightconstraints)**||This module loads copyright constraints via the CSW API and shows it per layer. If no information is present, the configured fallback contact information is shown.|false|
|customMenuElement|no|**[customMenuElement](#portalconfigmenusectionsmodulescustommenuelement)**||This module can open a link, display HTML from config.json or an external file, or perform an action. This module can be configured several times in config.json.|false|
|draw|no|**[draw](#portalconfigmenusectionsmodulesdraw)**||**!Attention: The new draw module is currently within refactoring process you can use the draw module from Masterportal Version 2 with type "draw_old")!** The draw tool allows painting points, lines, polygons, circles, double circles, and texts to the map. You may download these drawing as KML, GeoJSON, or GPX.|false|
|featureLister|no|**[featureLister](#portalconfigmenusectionsmodulesfeaturelister)**||Lists all features of a vector layer and highlights a feature by mouse over.|false|
|fileImport|no|**[fileImport](#portalconfigmenusectionsmodulesfileimport)**||Import KML, GeoJSON, and GPX files with this modules.|false|
|filter|no|**[filter](#portalconfigmenusectionsmodulesfilter)**||Configuration for an advanced filter for vector layers.|false|
|language|no|**[language](#portalconfigmenusectionsmoduleslanguage)**||In this module the language of the portal can be switched.|false|
|layerClusterToggler|no|**[layerClusterToggler](#portalconfigmenusectionsmoduleslayerclustertoggler)**||This module allows a cluster layers to be active and deactive together.|false|
|layerSlider|no|**[layerSlider](#portalconfigmenusectionsmoduleslayerslider)**||The layerSlider module allows showing arbitrary services in order. This can e.g. be used to show aerial footage from multiple years in succession.|false|
|login|no|**[login](#portalconfigmenusectionsmoduleslogin)**||Configuration of login with an OIDC server.|false|
|measure|no|**[measure](#portalconfigmenusectionsmodulesmeasure)**||Allows measuring areas and distances in the units m/km/nm resp. m²/ha/km².|false|
|news|no|**[news](#portalconfigmenusectionsmodulesnews)**||This module shows all messages from the newsFeedPortalAlerts.json and the config.json of the current portal regardless of the "read" status.|false|
|openConfig|no|**[openConfig](#portalconfigmenusectionsmodulesopenconfig)**||ith this module a configuration file (config.json) can be reloaded at runtime. The modules and map are adapted to the new configuration.|false|
|print|no|**[print](#portalconfigmenusectionsmodulesprint)**||Printing module that can be used to export the map's current view as PDF.|false|
|routing|no|**[routing](#portalconfigmenusectionsmodulesrouting)**||Routing module to create routes and isochrones.|false|
|scaleSwitcher|no|**[scaleSwitcher](#portalconfigmenusectionsmodulesscaleswitcher)**||Module that allows changing the map's current scale.|false|
|selectFeatures|no|**[selectFeatures](#portalconfigmenusectionsmodulesselectfeatures)**||Allows selecting a set of vector features by letting the user draw a box on the map. Features in that box will be displayed with GFI information.|false|
|shadow|no|**[shadow](#portalconfigmenusectionsmodulesshadow)**||Configuration object for the 3D mode shadow time.|false|
|statisticDashboard|no|**[statisticDashboard](#portalconfigmenusectionsmodulesstatisticdashboard)**||Displaying statistical data.|false|
|shareView|no|**[shareView](#portalconfigmenusectionsmodulesshareview)**||Module to share a link to the current map view.|false|
|styleVT|no|**[styleVT](#portalconfigmenusectionsmodulesstylevt)**||Style selection for VT services. Allows switching between styles of a Vector Tile Layer that provides multiple stylings via the `services.json` file.|false|
|wfsSearch|no|**[wfsSearch](#portalconfigmenusectionsmoduleswfssearch)**||Makes it possible to create a form to query WFS layers using filters. It is possible to either use a stored query (WFS@2.0.0) or define the query using the defined parameters (WFS@1.1.0).|false|
|wfst|no|**[wfst](#portalconfigmenusectionsmoduleswfst)**||WFS-T module to visualize, create, update and delete features.|false|

***

##### portalConfig.menu.sections.modules {data-toc-label='Modules'}

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|description|no|String||The description that should be shown in the button in the right menu.|false|
|icon|no|String||Icon that is shown in front of the module-name in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|name|no|String||Name of the module in the menu.|false|
|showDescription|no|String||Indicates whether the description of the module should be displayed in the menu.|false|
|supportedDevices|no|String||Devices on which the module can be used and is displayed in the menu.|false|
|supportedMapModes|no|String||Map modes in which the module can be used and is displayed in the menu.|false|
|type|no|String||The type of the module. Defines which module is configured.|false|

***

##### portalConfig.menu.sections.modules.about {data-toc-label='About'}

[inherits]: # (portalConfig.menu.sections.modules)

This module displays specific portal information like description, Masterportal version, Metadata.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|no|String|"bi-info-circle"|Icon that is shown in front of the module-name in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|no|String|"common:modules.about.name"|Name of the module in the menu.|false|
|type|no|String|"about"|The type of the module. Defines which module is configured.|false|
|abstractText|no|String|""|Description of the portal|false|
|contact|no|String|null|Metadata contact information|false|
|cswUrl|no|String|""|Metadata URL|false|
|logo|no|Boolean/String|true|"../../src/assets/img/Logo_Masterportal.svg"|Path to the logo. With `false` the logo is hidden.|false|
|logoLink|no|String|"https://masterportal.org"|Link that opens in a new tab when you click on the logo.|false|
|logoText|no|String|"Masterportallogo"|Alternative text that is displayed if the logo cannot be displayed.|false|
|metaDataCatalogueId|no|String|"2"|Id of the metadata service|false|
|metaId|no|String|""|Id of the metadata object|false|
|metaUrl|no|String|""|URL of the metadata object|false|
|noMetadataLoaded|no|String|""|Text if no metadata is shown|false|
|showAdditionalMetaData|no|Boolean|true|Metadata link to show extended metadata|false|
|title|no|String|""|Metadata title |false|
|version|no|Boolean/String|true|Version specification of the master portal. With `true` the master portal version is determined automatically. With `false` the version is hidden.|false|
|versionLink|no|String|"https://bitbucket.org/geowerkstatt-hamburg/masterportal/downloads/"|Link that opens in a new tab when you click on the version.|false|
|ustId|no|String|""|Sales tax identification number in accordance with Section 27 of the Sales Tax Act|false|
|privacyStatementText|no|String|"common:modules.about.privacyStatementText"|Text for data privacy section|false|
|privacyStatementUrl|no|String|""|URL to data privacy policy site|false|
|accessibilityText|no|String|"common:modules.about.accessibilityText"|Text for accessibility section|false|
|accessibilityUrl|no|String|""|URL to the accessibility statement site|false|

```json title="Example"
{
    "icon": "bi-cloud-circle",
    "name": "common:modules.about.name",
    "type": "about",
    "cswUrl": "https://metaver.de/csw",
    "metaUrl": "https://metaver.de/trefferanzeige?docuuid=40D48B03-AD1D-407B-B04D-B5BC6855BE15",
    "metaId": "40D48B03-AD1D-407B-B04D-B5BC6855BE15"
}
```

***


##### portalConfig.menu.sections.modules.addWMS {data-toc-label='Add WMS'}

[inherits]: # (portalConfig.menu.sections.modules)

The module allows for adding additional WMS layers via a provided URL. The [GDI-DE](https://www.gdi-de.org/download/AK_Geodienste_Architektur_GDI-DE_Bereitstellung_Darstellungsdienste.pdf) recommends setting up a CORS header, see chapter 4.7.1.
Schema for a WMS layer URL: `www.diensteurl/wmsdienste`.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|icon|no|String|"bi-cloud-plus"|Icon that is shown in front of the module-name in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|name|no|String|"common:modules.addWMS.name"|Name of the module in the menu.|false|
|type|no|String|"addWMS"|The type of the module. Defines which module is configured.|false|

**Example**

```json
{
    "icon": "bi-cloud-plus",
    "name": "common:modules.addWMS.name",
    "type": "addWMS"
}
```

***

##### portalConfig.menu.sections.modules.bufferAnalysis {data-toc-label='Buffer Analysis'}

[inherits]: # (portalConfig.menu.sections.modules)

The module highlights features of a target layer, that are located within or outside a circle around the features of a source-Layer. The circle is defined by a buffer-radius. The module requires vector based Data from WFS(❗) services for both the source and the target layer.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|icon|no|String|"bi-arrows-angle-expand"|Icon that is shown in front of the module-name in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|name|no|String|"common:modules.bufferAnalysis.name"|Name of the module in the menu.|false|
|type|no|String|"bufferAnalysis"|The type of the module. Defines which module is configured.|false|

**Example**

```json
{
    "icon": "bi-arrows-angle-expand",
    "name": "common:modules.bufferAnalysis.name",
    "type": "bufferAnalysis"
}
```

***

##### portalConfig.menu.sections.modules.contact {data-toc-label='Contact'}

[inherits]: # (portalConfig.menu.sections.modules)

The contact form allows users to send messages to a configured mail address. A file, e.g. a screenshot, can be attached.

>**This requires a backend!**
>
>**Contact uses an SMTP server and calls its sendmail.php.**

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|closeAfterSend|no|Boolean|false|Flag determining if the contact window should be closed after successfully sending a message.|false|
|configuredFileExtensions|no|String[]||Additional file extensions to "png", "jpg" und "jpeg". The backend has to support these file types.|false|
|contactInfo|no|String||Additional text shown above the contact form.|false|
|deleteAfterSend|no|Boolean|false|Flag determining whether the contact form is emptied after successfully sending a message.|false|
|fileUpload|no|Boolean|false|Flag whether the file upload should be available.|false|
|from|yes|**[email](#portalconfigmenusectionsmodulescontactemail)**[]||Email sender. Please mind our **hints regarding Email safety** below.|false|
|icon|no|String|"bi-envelope"|Icon that is shown in front of the module in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|includeSystemInfo|no|Boolean|false|Flag determining if the senders system information should be included in the Email.|false|
|locationOfCustomerService|no|String|"de"|The country the customer service is based in. The parameter is used for the date in the ticketId.|false|
|maxFileSize|no|Number|1048576|The maximum file size in bytes for uploadable content. Default: 1MB.|false|
|maxLines|no|Number|5|Amount of lines (height) for the textArea of the form|false|
|name|no|String|"common:modules.contact.name"|Name of the module in the menu.|false|
|privacyPolicyLink|no|String|"https://www.masterportal.org/datenschutz.html"|Link to the full privacy policy. Should be given if `showPrivacyPolicy` is set to true.|false|
|serviceId|yes|String||Email service id. Resolved using the **[rest-services.json](../Global-Config/rest-services.json.md)** file.|false|
|showPrivacyPolicy|no|Boolean|false|Flag determining if a checkbox should be displayed for agreeing to the privacy policy.|false|
|subject|no|String||The subject to be used for the Email.|false|
|to|yes|**[email](#portalconfigmenusectionsmodulescontactemail)**[]||Recipient of the Email. Please mind our **hints regarding Email safety** below.|false|
|type|no|String|"contact"|The type of the module. Defines which module is configured.|false|
|withTicketNo|no|Boolean|true|Whether successfully sending a email retrieves a ticket number for the user.|false|
|infoMessage|no|String|"common:modules.contact.infoMessage"|Explanatory note|false|

***
**Example**

```json
{
    "type": "contact",
    "name": "common:menu.contact",
    "icon": "bi-envelope",
    "serviceId": "123",
    "from": [
        {
            "email": "lgvgeoportal-hilfe@gv.hamburg.de",
            "name": "LGVGeoportalHilfe"
        }
    ],
    "to": [
        {
            "email": "lgvgeoportal-hilfe@gv.hamburg.de",
            "name": "LGVGeoportalHilfe"
        }
    ],
    "fileUpload": true,
    "includeSystemInfo": true,
    "closeAfterSend": true,
    "deleteAfterSend": true,
    "withTicketNo": false
}
```

!!! danger "Hints regarding Email safety"

    The unchecked usage of *sender (FROM)*, *recipient (TO)*, *copy (CC)*, and *blind copy (BCC)* by the SMTP server is hereby **expressly discouraged** for security reasons. The unchecked usage of the customer email as a *reply to (REPLY-TO)* by the SMTP server is warned against.

    We strongly recommend setting *FROM* and *TO* manually on the SMTP server without offering an option for external configuration.

    >For security reasons, *Sender (FROM)* and *Empfänger (TO)* sent by the Masterportal to the SMTP server may not be used as an email's FROM and TO without further checks. This would create a security breach that allows sending malicious emails with manipulated FROM and TO by the SMTP server. Should you need the configuration in the Masterportal anyway (as in the example above), the parameters *from* and *to* may be used after checking them against a **whistelist** on the SMTP server, preventing sending to or from email addresses not mentioned on the list.

    We recommend not automatically setting the customer's email address in *CC* (or *BCC*).

    >For security reasons, the user may not be automatically set as *Copy (CC)* or *Blind Copy (BCC)* of an email. Such an automatism would allow sending malicious emails by entering a foreign mail address via the SMTP server.

    We strongly recommend to manually remove *CC* and *BCC* on the SMTP server.

    >There must be no option to set *Copy (CC)* or *Blind Copy (BCC)* via the Masterportal. Such a feature could be misused to send malicious emails via the SMTP server.

    We warn against automatically setting the customer email as *REPLY-TO*.

    >The unchecked copying of data to email headers is warned against depending on the security level (resp. age) of the SMTP server, since the risk of *Carriage Return* and *Line Feed* injections may lead to e.g. allowing *REPLY-TO* from the email header line to be escaped to ultimately manipulate the email header itself. (Example: "test@example.com\r\nBCC:target1@example.com,target2@example.com,(...),target(n)@example.com"). In a more abstract case, UTF attacks may be possible, where normally harmless UTF-16 or UTF-32 characters may change the email header's behavior when interpreted as ANSI or UTF-8, having a comparable effect.

***
###### portalConfig.menu.sections.modules.contact.email {data-toc-label='Email'}
Email object containing email address, and display name.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|email|no|String||The email address.|false|
|name|no|String||The display name.|false|

**Example**

```json
{
    "email": "lgvgeoportal-hilfe@gv.hamburg.de",
    "name":"LGVGeoportalHilfe"
}
```

***

##### portalConfig.menu.sections.modules.compareMaps {data-toc-label='Compare Maps'}

[inherits]: # (portalConfig.menu.sections.modules)

This tool allows users to compare two map layers side by side using a layer swiper. Users select layers from the active, visible layers, and the swiper divides the map to show each layer in separate sections. The tool supports WMS and WFS layers and ensures complete layer updates before allowing swiper movement for accurate comparison.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|type|no|String|"compareMaps"|The type of the module. Defines which module is configured.|false|

**Example**

```json
{
    "type": "compareMaps",
}
```

***

##### portalConfig.menu.sections.modules.coordToolkit {data-toc-label='Coordinate Toolkit'}

[inherits]: # (portalConfig.menu.sections.modules)

Coordinates tool: to display the height above sea level in addition to the 2 dimensional coordinates, a 'heightLayerId' of a WMS service that provides the height must be specified. The format XML is expected and the attribute for the heights is expected under the value of the parameter 'heightElementName'.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|coordInfo|no|**[coordInfo](#portalconfigmenusectionsmodulescoordtoolkitcoordinfo)**||An object with explanations for the coordinate reference systems can be stored here.|false|
|delimiter|no|String|"Pipe-Symbol"|Delimiter of the coordinates when copying the coordinate pair|false|
|heightElementName|no|String||Coordinate query: The element name under which the height in the XML is searched.|false|
|heightLayerId|no|String||Coordinate query: Id of the WMS layer that provides the height in XML format. If not defined, then no height is displayed.|false|
|heightLayerInfo|no|String||An explanation for the height can be deposited here.|false|
|heightValueBuilding|no|String||Coordinate query: the value in the element defined under "heightElementName" supplied by the WMS for a non-measured height in the building area, it will display the internationalized text "Building area, no heights available" under the key "common:modules.coordToolkit.noHeightBuilding" in the interface. If this attribute is not specified, then the text provided by the WMS will be displayed.|false|
|heightValueWater|no|String||Coordinate query: the value in the element defined under "heightElementName" supplied by the WMS for an unmeasured height in the water area, it will display the internationalized text "Water surface, no heights available" under the key "common:modules.coordToolkit.noHeightWater" in the interface. If this attribute is not specified, then the text provided by the WMS will be displayed.|false|
|icon|no|String|"bi-globe"|Icon that is shown in front of the module in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|name|no|String|"common:modules.coordToolkit.name"|Name of the module in the menu.|false|
|showCopyButtons|no|Boolean|true|Switch to show or hide the buttons for copying the coordinates.|false|
|type|no|String|"coordToolkit"|The type of the module. Defines which module is configured.|false|
|zoomLevel|no|Number|7|Coordinate search: Specifies the zoom level to which you want to zoom.|false|

**Example**

```json
{
    "type": "coordToolkit",
    "heightLayerId": "19173",
    "heightElementName": "value_0",
    "heightValueWater": "-20",
    "heightValueBuilding": "200",
    "zoomLevel": 5,
    "heightLayerInfo": "Basis of the height information is the \"Digitalge Höhenmodell Hamburg DGM 1\".",
    "showDescription": true,
    "description": "Determine coordinates from the map or search for coordinates.",
    "coordInfo": {
        "title": "Coordinate reference system for 2D position information, explanations",
        "explanations": [
        "ETRS89_UTM32, EPSG 4647 (zE-N): Reference system ETRS89, mapping rule UTM, zone 32",
        "EPSG 25832: explanations..."
        ]
    }
}
```

***

###### portalConfig.menu.sections.modules.coordToolkit.coordInfo {data-toc-label='Coord Info'}

[inherits]: # (portalConfig.menu.sections.modules.coordToolkit)

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|explanations|no|[]||Array of declarations from which a list is created.|false|
|title|no|string||Heading for the explanations of the coordinate reference systems.|false|

***

##### portalConfig.menu.sections.modules.copyrightConstraints {data-toc-label='Copyright Constraints'}

[inherits]: # (portalConfig.menu.sections.modules)

Lists the copyright constraints of active layers.

| Name | Verpflichtend | Typ    | Default                | Beschreibung                                           | Expert |
|------|---------------|--------|------------------------|--------------------------------------------------------|--------|
| type | nein          | String | "copyrightConstraints" | The type of the module. Defines which module is added. | false  |

```json title="Example"
{
    "type": "copyrightConstraints"
}
```

***

##### portalConfig.menu.sections.modules.customMenuElement {data-toc-label='Custom Menu Element'}

[inherits]: # (portalConfig.menu.sections.modules)

This module can open a link, display HTML from config.json or an external file, or perform an action. This module can be configured multiple times in config.json. If `htmlContent` is specified, then `pathToContent` is not executed and vice versa.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|execute|no|[execute](#portalconfigmenusectionsmodulescustommenuelementexecute)||Action to be executed by clicking on the menu item.|true|
|htmlContent|no|String||HTML displayed in the module. The HTML is not validated, the responsibility for the security of the HTML lies with the operator of the portal.|false|
|icon|no|String|"bi-asterisk"|Icon that is shown in front of the module-name in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|name|no|String||Name of the module in the menu.|false|
|openURL|no|String||Url that is to be opened in a new tab by clicking on the menu item.|false|
|pathToContent|no|String||Path to a file containing HTML displayed in the module. The HTML is not validated, the responsibility for the security of the HTML lies with the operator of the portal.|false|
|type|yes|String|"customMenuElement"|The type of the module. Defines which module is configured.|false|

**Example**

```json
 {
    "type": "customMenuElement",
    "name": "Open url",
    "openURL": "https://geoinfo.hamburg.de/"
 },
{
    "type": "customMenuElement",
    "name": "Open url and show HTML",
    "openURL": "https://geoinfo.hamburg.de/",
    "htmlContent": "<div><h1>This is a Heading</h1><p>url was opened!<p/></div>"
},
{
    "type": "customMenuElement",
    "name": "HTML from config.json und action",
    "htmlContent": "<div><p>This is a paragraph.</p></br><a href=\"https://www.w3schools.com/\" target=\"_blank\">Visit W3Schools.com!</a></div>",
    "execute":{
        "action": "Alerting/addSingleAlert",
        "payload":  {"title":"to all people", "content": "Hallo world"}
    }
}
```

***

###### portalConfig.menu.sections.modules.customMenuElement.execute {data-toc-label='Execute'}

[type:Payload]: # (Datatypes.Payload)

CustomMenuElement Module `execute` options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|action|yes|String||Name and, if applicable, path of the action to be executed.|true|
|payload|no|**[Payload](#datatypespayload)**||Payload that is transferred to the action.|true|

**Example**

```json
{
    "action": "Alerting/addSingleAlert",
    "payload":  {"title":"to all people", "content": "Hallo world"}
}
```

***

##### portalConfig.menu.sections.modules.draw {data-toc-label='Draw'}

[inherits]: # (portalConfig.menu.sections.modules)

!!! warning "Ongoing Refactoring"
    The new draw module is currently within refactoring process you can use the draw module from Masterportal Version 2 with type "draw_old"!
    Module used to draw features on the map. This includes points, which may also be represented by symbols, and (double) circles, polygons, polylines, and text.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String||Tool name in the menu.|false|
|iconList|no|**[icon](#portalconfigmenusectionsmodulesdrawicon)**[]|[{"id": "iconPoint", "type": "simple_point", "value": "simple_point"}, {"id": "yellow pin", "type": "image", "scale": 2, "value": "geo-fill-ylw.svg"}]|List of symbols the user may choose from to draw colored symbols or dots. Images may be used, too, as shown in the example.|false|
|drawSymbolSettings|no|**[drawSymbolSet](#portalconfigmenusectionsmodulesdrawdrawsymbolset)**|{"color": [55, 126, 184, 1], "opacity": 1}|Pre-configuration for symbol drawing.|false|
|addIconsOfActiveLayers|no|Boolean|false|Set this flag to `true` to be able to select the icons and symbols of all WFS layers activated in the topic tree as additional symbols besides the icons configured under `drawSymbolSettings`.|false|
|drawLineSettings|no|**[drawLineSet](#portalconfigmenusectionsmodulesdrawdrawlineset)**|{"strokeWidth": 1, "opacityContour": 1, "colorContour": [0, 0, 0, 1]}|Pre-configuration for line drawing.|false|
|drawCurveSettings|no|**[drawCurveSet](#portalconfigmenusectionsmodulesdrawdrawcurveset)**|{"strokeWidth": 1, "opacityContour": 1, "colorContour": [0, 0, 0, 1]}|Pre-configuration for freehand drawing.|false|
|drawAreaSettings|no|**[drawAreaSet](#portalconfigmenusectionsmodulesdrawdrawareaset)**|{"strokeWidth": 1, "color": [55, 126, 184, 1], "opacity": 1, "colorContour": [0, 0, 0, 1], "opacityContour": 1}|Pre-configuration for area drawing.|false|
|drawCircleSettings|no|**[drawCircleSet](#portalconfigmenusectionsmodulesdrawdrawcircleset)**|{"circleMethod": "interactive", "unit": "m", "circleRadius": null, "strokeWidth": 1, "color": [55, 126, 184, 1], "opacity": 1, "colorContour": [0, 0, 0, 1], "opacityContour": 1, "tooltipStyle": {"fontSize": "16px", "paddingTop": "3px", "paddingLeft": "3px", "paddingRight": "3px", "backgroundColor": "rgba(255, 255, 255, .9)"}}|Pre-configuration for circle drawing.|false|
|drawDoubleCircleSettings|no|**[drawDoubleCircleSet](#portalconfigmenusectionsmodulesdrawdrawdoublecircleset)**|{"circleMethod": "defined", "unit": "m", "circleRadius": 0, "circleOuterRadius": 0, "strokeWidth": 1, "color": [55, 126, 184, 1], "opacity": 1, "colorContour": [0, 0, 0, 1], "outerColorContour": [0, 0, 0, 1], "opacityContour": 1}|Pre-configuration for double circle drawing.|false|
|writeTextSettings|no|**[writeTextSet](#portalconfigmenusectionsmodulesdrawwritetextset)**|{"text": "", "fontSize": 10, "font": "Arial", "color": [55, 126, 184, 1], "opacity": 1}|Pre-configuration for text writing.|false|
|download|no|**[download](#portalconfigmenusectionsmodulesdrawdownload)**|{"preSelectedFormat": "KML"}|Pre-configuration for download.|false|
|enableAttributesSelector|no|Boolean|false|Enables an button which toggles an edit section for custom attributes on the selected feature.|false|
|semicolonCSVDelimiter|no|Boolean|true|To decide if the semicolon is used as the delimiter for exported CSV file.|false|

**Example**

```json

{
    "type": "draw_old",
    "name": "Draw / Write",
    "icon": "bi-pencil-fill",
    "iconList": [
        {
            "id": "iconPoint",
            "type": "simple_point",
            "value": "simple_point"
        },
        {
            "id": "iconMeadow",
            "type": "image",
            "scale": 0.8,
            "value": "meadow.png"
        },
        {
            "id": "yellow pin",
            "type": "image",
            "scale": 2,
            "value": "geo-fill-ylw.svg"
        }
    ],
    "drawDoubleCircleSettings": {
        "circleRadius": 1500,
        "circleOuterRadius": 3000,
        "strokeWidth": 3,
        "color": [55, 126, 184, 0],
        "opacity": 0,
        "colorContour": [228, 26, 28, 1],
        "opacityContour": 1,
        "tooltipStyle": {
            "fontSize": "14px",
            "paddingTop": "3px",
            "paddingLeft": "3px",
            "paddingRight": "3px",
            "backgroundColor": "rgba(255, 255, 255, .9)"
        }
    }
    "semicolonCSVDelimiter": true
}

```

***

###### portalConfig.menu.sections.modules.draw.icon {data-toc-label='Icon'}

Dot object consisting of text, type, and value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|id|yes|String||Symbol text displayed in the select menu. The id has to be defined in the locale file (usually `common`) as `modules.draw.iconList` child. The following entry should begin with `icon` and contain a representative description. If the key is not found, the `id` will appear as string on the user interface.|false|
|caption|no|String||_Deprecated in 3.0.0._ Symbol text displayed in the select menu. Unlike `id`, not only the id itself, but the whole path (`modules.draw.iconList` + id) has to be given.|false|
|type|yes|enum["image", "simple_point"]||Object type to be drawn. If `image` is chosen, the PNG or SVG file from the `value` path is drawn. By default, images are to be placed in the `/src/assets/img/tools/draw/` directory and should have a height and width of 96px to scale correctly. Alternatively, a working `scale` factor must be defined. The key `simple_point` will draw a simple point.|false|
|scale|no|number||Scale factor for images.|false|
|value|yes|String||Value of the object to be drawn. If no path or URL is set, a file name is expected, and the *config.js* entry `wfsImgPath` is expected to be the file's location.|false|

**Example**

```json
{
    "iconList": [
        {
            "id": "iconPoint",
            "type": "simple_point",
            "value": "simple_point"
        },
        {
            "id": "iconMeadow",
            "type": "image",
            "scale": 0.8,
            "value": "meadow.png"
        },
        {
            "id": "yellow pin",
            "type": "image",
            "scale": 2,
            "value": "geo-fill-ylw.svg"
        }
    ]
}
```

***


###### portalConfig.menu.sections.modules.draw.drawSymbolSet {data-toc-label='Symbol Set'}

Object to change the drawing tool's configured point symbol default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|color|yes|Number[]|[55, 126, 184, 1]|The pre-configured color of the symbol as RGB color. The alpha channel value is used for point coloring.|false|
|opacity|yes|Number|1|The pre-configured transparency of symbols, given in range [0..1] for point data.|false|


**Example**

```json
{
    "color": [55, 126, 184, 1],
    "opacity": 1
}
```

***

###### portalConfig.menu.sections.modules.draw.drawLineSet {data-toc-label='Line Set'}

Object to change the drawing tool's configured line default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|strokeWidth|yes|Number|1|Pre-configured stroke width of lines in pixels.|false|
|colorContour|yes|Number[]|[0, 0, 0, 1]|Pre-configured line color in RGBA.|false|
|opacityContour|yes|Number|1|Pre-configured line transparency in range [0..1].|false|

**Example**

```json
{
    "strokeWidth": 1,
    "opacityContour": 1,
    "colorContour": [0, 0, 0, 1]
}
```

***

###### portalConfig.menu.sections.modules.draw.drawCurveSet {data-toc-label='Curve Set'}

Object to change the drawing tool's configured freehand drawing default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|strokeWidth|yes|Number|1|Pre-configured stroke width of lines in pixels.|false|
|colorContour|yes|Number[]|[0, 0, 0, 1]|Pre-configured line color in RGBA.|false|
|opacityContour|yes|Number|1|Pre-configured line transparency in range [0..1].|false|

**Example**

```json
{
    "strokeWidth": 1,
    "opacityContour": 1,
    "colorContour": [0, 0, 0, 1]
}
```

***

###### portalConfig.menu.sections.modules.draw.drawAreaSet {data-toc-label='Area Set'}

Object to change the drawing tool's configured area default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|strokeWidth|yes|Number|1|Pre-configured stroke width of area borders in pixels.|false|
|color|yes|Number[]|[55, 126, 184, 1]|Pre-configured area color in RGBA.|false|
|opacity|yes|Number|1|Pre-configured area transparency in range [0..1].|false|
|colorContour|yes|Number[]|[0, 0, 0, 1]|Pre-configured area border color in RGBA.|false|
|opacityContour|yes|Number|1|Pre-configured area border transparency in range [0..1].|false|

**Example**

```json
{
    "strokeWidth": 1,
    "color": [55, 126, 184, 1],
    "opacity": 1,
    "colorContour": [0, 0, 0, 1],
    "opacityContour": 1
}
```

***

###### portalConfig.menu.sections.modules.draw.drawCircleSet {data-toc-label='Circle Set'}

Object to change the drawing tool's configured circle default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|circleMethod|yes|String|"interactive"|Pre-configured method of circle drawing. `"interactive"`: freehand, `"defined"`: by entering fixed values|false|
|unit|yes|String|"m"|Pre-configured unit regarding the circle's Radius `circleRadius` when `"defined"` is chosen as `circleMethod`.|false|
|circleRadius|yes|Number|0|Pre-configured circle Radius when `"defined"` is chosen as `circleMethod`.|false|
|strokeWidth|yes|Number|1|Pre-configured stroke width of circle border in pixels.|false|
|color|yes|Number[]|[55, 126, 184, 1]|Pre-configured circle color in RGBA.|false|
|opacity|yes|Number|1|Pre-configured circle transparency in range [0..1].|false|
|colorContour|yes|Number[]|[0, 0, 0, 1]|Pre-configured circle border color in RGBA.|false|
|opacityContour|yes|Number|1|Pre-configured circle border transparency in range [0..1].|false|
|tooltipStyle|no|String|{}|Pre-configured style for tooltip.|false|

**Example**

```json
{
    "circleMethod": "interactive",
    "unit": "m",
    "circleRadius": 0,
    "strokeWidth": 1,
    "color": [55, 126, 184, 1],
    "opacity": 1,
    "colorContour": [0, 0, 0, 1],
    "opacityContour": 1
}
```

***

###### portalConfig.menu.sections.modules.draw.drawDoubleCircleSet {data-toc-label='Double Circle Set'}

Object to change the drawing tool's configured circle default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|circleMethod|yes|String|"defined"|Pre-configured method of circle drawing. `"interactive"`: freehand, `"defined"`: by entering fixed values|false|
|unit|yes|String|"m"|Pre-configured unit regarding the circle's radius `circleRadius` and `circleOuterRadius` when `"defined"` is chosen as `circleMethod`.|false|
|circleRadius|yes|Number|0|Pre-configured inner circle radius when `"defined"` is chosen as `circleMethod`.|false|
|circleOuterRadius|yes|Number|0|Pre-configured outer circle radius when `"defined"` is chosen as `circleMethod`.|false|
|strokeWidth|yes|Number|1|Pre-configured stroke width of circle border in pixels.|false|
|color|yes|Number[]|[55, 126, 184, 1]|Pre-configured circle color in RGBA.|false|
|opacity|yes|Number|1|Pre-configured double circle transparency in range [0..1].|false|
|colorContour|yes|Number[]|[0, 0, 0, 1]|Pre-configured inner circle border color in RGBA.|false|
|outerColorContour|yes|Number[]|[0, 0, 0, 1]|Pre-configured outer circle border color in RGBA.|false|
|opacityContour|yes|Number|1|Pre-configured circle border transparency in range [0..1].|false|

**Example**

```json
{
    "circleMethod": "defined",
    "unit": "m",
    "circleRadius": 0,
    "circleOuterRadius": 0,
    "strokeWidth": 1,
    "color": [55, 126, 184, 1],
    "opacity": 1,
    "colorContour": [0, 0, 0, 1],
    "opacityContour": 1
}
```

***

###### portalConfig.menu.sections.modules.draw.writeTextSet {data-toc-label='Write Text Set'}

Object to change the drawing tool's configured text default value.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|text|yes|String|""|Pre-configured text.|false|
|fontSize|yes|Number|10|Pre-configured font size.|false|
|font|yes|String|"Arial"|Pre-configured font. Restricted to `"Arial"`, `"Calibri"`, and `"Times New Roman"`.|false|
|color|yes|Number[]|[55, 126, 184, 1]|Pre-configured font color in RGBA.|false|
|opacity|yes|Number|1|Pre-configured font transparency in range [0..1].|false|

**Example**

```json
{
    "text": "",
    "fontSize": 10,
    "font": "Arial",
    "color": [55, 126, 184, 1],
    "opacity": 1
}
```

***

###### portalConfig.menu.sections.modules.draw.download {data-toc-label='Download'}

Object to change the drawing tool's download preselected format. It should be one of "KML", "GEOJSON" and "GPX".

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|preSelectedFormat|no|enum["KML","GEOJSON","GPX"]|"KML"|Pre-configured pre-selected form.|false|

**Example**

```json
{
    "preSelectedFormat": "KML"
}
```

##### portalConfig.menu.sections.modules.featureLister {data-toc-label='Feature Lister'}

[inherits]: # (portalConfig.menu.sections.modules)

This module can display loaded vector data from WFS(❗) layers in a table. All visible vector layers from the map are displayed in the first tab. The features of the layer are listed in the second tab of the table. The number of displayed features is configurable.

As soon as you position the mouse pointer over a feature in the list, it will be highlighted in the map. By clicking on a feature, its attributes are displayed in a third tab.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|highlightVectorRulesPointLine|no|**[highlightVectorRulesPointLine](#portalconfigmenusectionsmodulesfeaturelisterhighlightvectorrulespointline)**||Specify outline color and stroke width for highlighting lines and fill color and scale factor for highlighting points as well as a zoom parameter.|false|
|highlightVectorRulesPolygon|no|**[highlightVectorRulesPolygon](#portalconfigmenusectionsmodulesfeaturelisterhighlightvectorrulespolygon)**||Specify the fill color and outline color and stroke width for highlighting the polygon features as well as a zoom parameter.|false|
|icon|no|String|"bi-list"|Icon that is shown in front of the module in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|maxFeatures|no|Integer|20|Amount of features to display initially. More features of the same amount can be revealed by clicking a button.|false|
|name|no|String|"common:modules.featureLister.name"|Name of the module in the menu.|false|
|type|yes|String|"featureLister"|The type of the module. Defines which module is configured.|false|

**Example**

```json
"featureLister": {
    "name": "List",
    "icon": "bi-list",
    "maxFeatures": 10,
    "highlightVectorRulesPolygon": {
        "fill": {
            "color": [255, 0, 255, 0.9]
        },
        "stroke": {
            "width": 4,
            "color": [0, 0, 204, 0.9]
        },
        "zoomLevel": 5
    },
    "highlightVectorRulesPointLine": {
        "fill": {
            "color": [255, 0, 255, 0.9]
        },
        "stroke": {
            "width": 8,
            "color": [255, 0, 255, 0.9]
        },
        "image": {
            "scale": 2
        },
        "zoomLevel": 5
    }
}
```

***

###### portalConfig.menu.sections.modules.featureLister.highlightVectorRulesPointLine {data-toc-label='Highlight Vector Rules Point Line'}

[type:Image]: # (Datatypes.Image)
[type:Fill]: # (Datatypes.Fill)
[type:Stroke]: # (Datatypes.Stroke)

Specify outline color and stroke width for highlighting lines and fill color and scale factor for highlighting points. Also a zoom level can be configured.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|fill|no|**[Fill](#datatypesfill)**|[255, 255, 255, 0.5]|Possible setting: color|false|
|image|no|**[Image](#datatypesimage)**|1.5|Possible setting: scale|false|
|stroke|no|**[Stroke](#datatypesstroke)**|1|Possible setting: width|false|
|zoomLevel|no|Integer|7|Zoom level, possible setting: 0-9|false|

***

###### portalConfig.menu.sections.modules.featureLister.highlightVectorRulesPolygon {data-toc-label='Highlight Vector Rules Polygon'}

[type:Fill]: # (Datatypes.Fill)
[type:Stroke]: # (Datatypes.Stroke)

Specify the fill color, the outline color and stroke width for highlighting the polygon features as well as a zoom level.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|fill|no|**[Fill](#datatypesfill)**|[255, 255, 255, 0.5]|Possible setting: color|false|
|stroke|no|**[Stroke](#datatypesstroke)**|1|Possible setting: width|false|
|zoomLevel|no|Integer|7|Zoom level, possible setting: 0-9|false|

***

##### portalConfig.menu.sections.modules.fileImport {data-toc-label='File Import'}

[inherits]: # (portalConfig.menu.sections.modules)

Import "*.kml", "*.geojson" and "*.gpx" files with this module.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|enableZoomToExtend|no|Boolean|false|To decide if the file name is shown as a button and it is able to zoom the imported features by clicking the file name|false|
|icon|no|String|"bi-box-arrow-in-down"|Icon that is shown in front of the module-name in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|name|no|String|"common:modules.fileImport.name"|Name of the module in the menu.|false|
|type|no|String|"fileImport"|The type of the module. Defines which module is configured.|false|
|customStylingOption|no|Boolean|false|To decide if a custom styling option for a GeoJson is offered.|false|
|showConfirmation|no|Boolean|true|To decide if a confirmation window is shown after a successful import.|false|

**Example**

```json
{
    "type": "fileImport",
    "enableZoomToExtend": true
}
```

***

##### portalConfig.menu.sections.modules.filter {data-toc-label='Filter'}

[inherits]: # (portalConfig.menu.sections.modules)

The filter tool offers a range of options to filter vector data from WFS, OAF, GeoJSON, SensorThingsAPI and VectorTiles services.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|geometrySelectorOptions|no|[filterGeometrySelector](#portalconfigmenusectionsmodulesfilterfiltergeometryselector)[]|false|Options for an additional tool for filtering within a self-drawn area. If you use this tool in conjunction with external filtering (`external`: `true`), please remember to configure your layer filter with geometryName.|false|
|layerGroups|no|[filterLayerGroups](#portalconfigmenusectionsmodulesfilterfilterlayergroups)[]|[]|Configuration of the related layers to be filtered.|false|
|layers|no|[filterLayer](#portalconfigmenusectionsmodulesfilterfilterlayer)[]|[]|Configuration of layers to be filtered. Can be an array of plain layer ids also - if so the layer and all snippets are identified automatically.|false|
|layerSelectorVisible|no|Boolean|true|To display a selector for the layers. Put to `false` to show without selector.|false|
|liveZoomToFeatures|no|Boolean|true|Defines whether the filter immediately zooms to filter results.|false|
|minScale|no|Integer|5000|Minimum zoom level the filter zooms in when displaying filter results.|false|
|multiLayerSelector|no|Boolean|true|If `layerSelectorVisible` `true`, wether one can open multiple sections of the selector at the same time.|false|
|name|no|String|"common:modules.filter.name"|Name of the module in the menu.|false|
|saveTo|no|String|"void"|If set to "url", the current filter setting is saved. The shareView module can be used to create a link containing the filter settings.|false|
|linkText|no|String|""|Link text at the bottom containing a url link to the current filter setting, or empty string if no such link should be displayed. Requires "saveTo": "url"|false|
|type|no|String|"filter"|The type of the module. Defines which module is configured.|false|
|closeGfi|no|Boolean|false|If it is true and a gfi window is open, the gfi window could be closed after new filtering.|false|

**Example**

The following example uses only a layer id to generate the filter automatically.

```json
{
    "type": "filter",
    "icon": "bi-funnel-fill",
    "layerSelectorVisible": false,
    "geometrySelectorOptions": {
        "visible": true
    },
    "closeGfi": false,
    "layerGroups":
    [
        {
            "title": "GRUPPE 1",
            "layers": [
                {
                    "layerId": "47"
                }
            ]
        }
    ],
    "layers": [
        {
            "layerId": "8712"
        }
    ]
}
```

***

###### portalConfig.menu.sections.modules.filter.filterGeometrySelector {data-toc-label='Filter Geometry Selector'}

An additional selection appears above the filter where a geometry can be selected and drawn on the map. The filter filters only in the selected area.
If you use this modul in conjunction with external filtering (`external`: `true`), please remember to configure your layer filter with geometryName.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|additionalGeometries|no|Boolean|false|Geometries from a layer can additionally be added to the filter by the id. In that case, an attribute for the name of the geometry must also be specified.|false|
|circleSides|no|Number|256|The geometry "Circle" is converted to a polygon for technical reasons. This is the number of polygon points of the resulting geometry.|false|
|defaultBuffer|no|Number|20|The geometry "LineString" is given a buffer (in meters) to make the LineString a "tube". This is the default distance from the center to the edge in meters.|false|
|fillColor|no|String|"rgba(0, 0, 0, 0.33)"|The fill color of the outer area (or geometry if invertGeometry = `false`).|false|
|geometries|no|String[]|["Polygon", "Rectangle", "Circle", "LineString"]|The selectable geometries and their order.|false|
|invertGeometry|no|Boolean|true|true: The geometry is transparent, the outer area is displayed as a shadow. `false`: The fill specifications apply to the geometry itself.|false|
|strokeColor|no|String|"rgba(0, 0, 0, 1)"|The color of the border of the geometry.|false|
|strokeWidth|no|Number|1|The thickness of the border of the geometry.|false|
|visible|yes|Boolean|true|Activates the geometry selector.|false|

**Example**

Example of the minimal configuration of the `filterGeometrySelector`.

```json
{
    "visible": true
}
```

**Example**

Example of a complete configuration with the default settings of the `filterGeometrySelector`.

```json
{
    "visible": true,
    "circleSides": 256,
    "defaultBuffer": 20,
    "geometries": ["Polygon", "Rectangle", "Circle", "LineString"],
    "invertGeometry": true,
    "fillColor": "rgba(0, 0, 0, 0.33)",
    "strokeColor": "rgba(0, 0, 0, 1)",
    "strokeWidth": 1,
    "additionalGeometries": [
        {
            "layerId": "1692",
            "attrNameForTitle": "bezirk_name"
        }
    ]
}
```

**Example**

Example of a completely changed configuration of the `filterGeometrySelector`.

```json
{
    "visible": true,
    "circleSides": 32,
    "defaultBuffer": 60,
    "geometries": ["LineString", "Rectangle", "Circle", "Polygon"],
    "invertGeometry": false,
    "fillColor": "rgba(0, 0, 200, 0.1)",
    "strokeColor": "rgba(255, 0, 0, 1)",
    "strokeWidth": 2
}
```

***

###### portalConfig.menu.sections.modules.filter.filterLayer {data-toc-label='Filter Layer'}

[type:Snippets]: # (Datatypes.Snippets)

An object to define a layer to filter with.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|active|no|Boolean|false|Set to `true` to let the layer selector be initialy opened - only if layerSelectorVisible is set to `true`. If multiLayerSelector is set to `false` and more than one filter layer has set active to `true`, the last filter layer with active `true` is initialy opened.|false|
|clearAll|no|Boolean|false|After clicking button Reset all, all the features will be shown. Set to `true` to clear all the features after clicking Reselt all button.|false|
|collection|no|String||ONLY VectorTiles: The collection to filter. If it is set, the layer needs a `baseOAFUrl` to start the api requests|false|
|description|no|String|""|A description of the layer, displayed when the selector is opened or no layerSelectorVisible is set to `false`. Can be a translation key also.|false|
|download|no|Boolean|""|Enter true for a file here to activate the download of the data filtered on this layer. A download area will appear at the end of the filter. For VectorTiles, only CSV download works.|false|
|extern|no|Boolean|false|When set to `true`, filtering is done on the server side. Useful for big sets of data that can't be loaded into the browser at once. Remember to set the **[isNeverVisibleInTree](#layerconfigelementslayersvector)** flag of the layer to `true` to avoid loading of the whole data set by user click on its entry in the tree.|false|
|filterButtonDisabled|no|Boolean|false|Only for strategy `passive`: Disable the filter button while nothing is selected.|false|
|filterOnMove|no|Boolean||If it is `true`, the layer will be filtered dynamically after the map moves. Only works with `multiLayerSelector`: `false`. With this combination the filter is triggerd when the accordeon will be opened.|false|
|filterOnOpen|no|Boolean||If set to `true`, the filter is triggered when the accorden is clicked.|false|
|geometryName|no|String|""|Only for extern `true` in connection with filtering within polygons: The geometry name of the features to be able to detect an intersection.|false|
|labelFilterButton|no|String|"common:modules.tools.filter.filterButton"|If strategy is set to `passive` only: The text of the filter button. Can be a translation key.|false|
|layerId|no|String||The layer id of the layer to filter. Must be configured in the `layerconfig`.|false|
|maxZoom|no|Number||The maximum zoom level for current filter, if current zoom level is bigger than the maximum zoom level, the current filter will be deactivated.|false|
|minZoom|no|Number||The minimum zoom level for current filter, if current zoom level is smaller than the minimum zoom level, the current filter will be deactivated.|false|
|paging|no|Number|1000|The filter will load features into the map in chunks. Paging is the chunk size. If the chunk size is set too low, the filtering will be slowed down. Set the chunk size too high, the loading of the chunk will slow the filtering down. Try it out to find your fastes setup.|false|
|resetLayer|no|Boolean|false|If true it will change the reset button to a button which resets the whole layer and ignores the prechecked values. Will be ignored if `clearAll` is set to `true`. Furthermore, the parameter should not be configured in conjunction with a low `paging` number, otherwise the complete layer will be displayed on the map only very slowly and delayed when resetting.|false|
|searchInMapExtent|no|Boolean|false|Set to `true` to activate a generic checkbox, where you can set the filtering to `only filter in current browser extent`. If the extent checkbox is checked, automatic zooming is disabled. Make sure to set **[loadingStrategy](#layerconfigelementslayersvector)** to `all` to avoid weird effects when zooming out after filtering in extent.|false|
|searchInMapExtentInfo|no|Boolean|true|A little icon is shown right hand side of the checkbox. Clicking the icon, a standard description is shown. Set to `false` to disable this feature. Set to a individual text to use an own description or use a translation key.|false|
|searchInMapExtentPreselected|no|Boolean|false|The checkbox for filtering in the browser extent is initially selected if `searchInMapExtentPreselected`: `true` is set.|false|
|searchInMapExtentProactive|no|Boolean|true|The checkbox for filtering in the browser extent triggers direct filtering in the current browser extent under `strategy`: `active`. This can be disabled by setting `searchInMapExtentProactive`: `false`.|false|
|shortDescription|no|String|""|The shorter version of the description, displayed under the selector title only if `layerSelectorVisible` is `true` and the selector is closed. Can be a translation key also.|false|
|showHits|no|Boolean|true|After filtering, the hits are displayed. Set to `false` to not show the hits.|false|
|snippets|no|**[Snippets](#datatypessnippets)**[]|[]|Configuration of snippets to adjust the filtering. Can be a minimalistic array of attribute names. Can be left empty to use the automatic identification of all snippets possible.|false|
|snippetTags|no|Boolean|true|After filtering the current setting is displayed as tags. Set to `false` to turn of this feature.|false|
|strategy|no|String||There are two filter strategies: `passive` - a filter button is used. And `active` - the filter will be triggered immediately by any choice made. Passive strategy is used by default.|false|
|title|no|String||The title to use for the selector (if `layerSelectorVisible` `true`). Can be a translation key also. If not set, the layerId will be used by default.|false|
|wmsRefId|no|String/String[]|""|If the layer is filtered, the WMS layer with `wmsRefId` will be invisible and deactivated from Tree. After resetting the layer, the WMS layer will be activated and visible again.|false|
|initialStartupReset|no|Boolean|false|If the parameter is set to `true`, a button appears to reset the filter. Please note that this prevents re-adjustment and is therefore only recommended for filter configurations with a `Datatypes.Snippets.Children`.|false|

**Example**

In this example, one snippet is set with only an attrName. The snippet type is detected automatically. See the [snippet datatype](#datatypessnippets) for the advanced configuration of snippets.

```json
{
    "layerId": "8712",
    "title": "Schools",
    "strategy": "active",
    "searchInMapExtent": true,
    "searchInMapExtentInfo": true,
    "showHits": true,
    "clearAll": false,
    "wmsRefId": "21066",
    "shortDescription": "School master data and pupil numbers of Hamburg schools",
    "description": "School master data and pupil numbers of Hamburg schools",
    "snippetTags": true,
    "paging": 100,
    "filterOnMove": false,
    "minZoom": 7,
    "maxZoom": 14,
    "snippets": [
        {
            "attrName": "rebbz_homepage"
        }
    ]
}
```

***

###### portalConfig.menu.sections.modules.filter.filterLayerGroups {data-toc-label='Filter Layer Groups'}
An object to define a group layer to filter with.

|Name|Required|Type|Default|Description|Expert|
|----|--------|---|--------|-----------|------|
|layers|no|String|[]|Configuration of layers to be filtered. Can be an array of plain layer ids also - if so the layer and all snippets are identified automatically. The type of layers is filterLayer, but here it was defined as string to avoid repetitive definitions within layerGroups.|false|
|title|yes|String||The title to use for the group layer (if layerSelectorVisible true). Can be a translation key also.|false|

**Example**

LayerGroups group related layers. Each group has a title and a list of layers. These are displayed together in the filter.

```json
{
  "layerGroups": [
    {
      "title": "GROUP 1",
      "layers": [
        {
          "layerId": "47"
        },
        {
          "layerId": "7315"
        }
      ]
    },
    {
      "title": "GROUP 2",
      "layers": [
        {
          "layerId": "5105"
        }
      ]
    }
  ]
}
```

***

##### portalConfig.menu.sections.modules.language {data-toc-label='Language'}

[inherits]: # (portalConfig.menu.sections.modules)

In this module the language of the portal can be switched.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|icon|no|String|"bi-flag"|Icon that is shown in front of the module-name in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|name|no|String|"common:modules.language.name"|Name of the module in the menu.|false|
|type|no|String|"language"|The type of the module. Defines which module is configured.|false|

**Example**

```json
{
    "icon": "bi-flag",
    "name": "common:modules.language.name",
    "type": "language"
}
```

***

##### portalConfig.menu.sections.modules.layerClusterToggler {data-toc-label='Layer Cluster Toggler'}

[inherits]: # (portalConfig.menu.sections.modules)

This module allows to activate/load and deactivate layers in clusters simultaneously.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|icon|no|String|"bi-list"|Icon that is shown in front of the module-name in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|layerIdList|yes|String[]|[]|List of layerIds, the layers that should be switched on or off together.|false|
|name|no|String|"common:modules.layerClusterToggler.name"|Name of the module in the menu.|false|
|type|no|String|"layerClusterToggler"|The type of the module. Defines which module is configured.|false|

**Example**

```json
{
    "icon": "bi-list",
    "layerIdList": [
        "8712",,
        "8713.1",
        "8713.2",
        "8713.3"
    ],
    "name": "common:modules.layerClusterToggler.name",
    "type": "layerClusterToggler"
}
```

***

##### portalConfig.menu.sections.modules.layerSlider {data-toc-label='Layer Slider'}

[inherits]: # (portalConfig.menu.sections.modules)

The layer slider module allows showing multiple layers in a row. This may e.g. be used to animate a time series of aerial imagery.

The slider can switch between two modes in the interface. Layer slider type. `"player"` shows start, pause, and stop buttons, while `"handle"` uses a switch. In the latter case, layer transparency is adjusted additionally.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|icon|no|String|"bi-collection-play"|Icon that is shown in front of the module-name in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|layerIds|yes|**[layerId](#portalconfigmenusectionsmoduleslayersliderlayerid)**[]|[]|Array of layer information objects.|false|
|name|no|String|"common:modules.layerSlider.name"|Name of the module in the menu.|false|
|timeInterval|no|Integer|2000|Time in ms until the next layer is shown.|false|
|title|no|String|"common:modules.layerSlider.title"|Name displayed in the module.|false|
|type|no|String|"layerSlider"|The type of the module. Defines which module is configured.|false|

**Example**

```json
"layerSlider": {
    "icon": "bi-hourglass-split",
    "layerIds": [
        {
            "title": "Dienst 1",
            "layerId": "123"
        },
        {
            "title": "Dienst 2",
            "layerId": "456"
        },
        {
            "title": "Dienst 3",
            "layerId": "789"
        }
    ],
    "name": "Time series",
    "timeInterval": 2000,
    "title": "Simulation of Example-WMS"
}
```

***

###### portalConfig.menu.sections.modules.layerSlider.layerId {data-toc-label='Layer Id'}
Defines a layer slider layer.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|layerId|yes|String||ID of the service to be shown in the portal. This layer ID *MUST* be configured as part of the *layerConfig*!|false|
|title|yes|String||Service name to be shown in the portal.|false|

**Example**

```json
{
    "layerId": "123",
    "title": "Dienst 1"
}
```

***

###### portalConfig.menu.sections.modules.legend {data-toc-label='Legend'}

[inherits]: # (portalConfig.menu.sections.modules)

Legend configuration options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|icon|no|String|"bi-lightbulb"|Legend icon.|false|
|name|yes|String|"common:modules.legend.name"|Name of the module in the menu.|false|
|type|no|String|"legend"|The type of the module. Defines which module is configured.|false|
|sldVersion|no|String|""|Defines the `Styled Layer Descriptor` Version for the GetLegendGraphic requests, e.g. "1.1.0"|false|

***

###### portalConfig.menu.sections.modules.login {data-toc-label='Login'}

[inherits]: # (portalConfig.menu.sections.modules)

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String||The name for the module in the menu. Overwritten when the user is logged in.|false|
|icon|yes|String||The icon next to the login button in the menu. Will be changed when the user is logged in (see module store).|false|

```json
{
    "type": "login",
    "name": "translate#common:modules.login.login",
    "icon": "bi-door-open"
}
```

***

##### portalConfig.menu.sections.modules.measure {data-toc-label='Measure'}

[inherits]: # (portalConfig.menu.sections.modules)

The measure tool allows measuring distances and areas.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|color|no|Number[]|[255, 127, 0, 1.0]|Defines the color for the measured lines and polygons.|false|
|earthRadius|no|Number|6378137|Earth radius in meters. Please mind that the earth radius should be chosen in accordance with the reference ellipsoid. E.g., GRS80 should be used for ETRS89 (EPSG:25832).|false|
|icon|no|String|"bi-arrows-angle-expand"|Icon that is shown in front of the module-name in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|lineStringUnits|no|String[]|["m", "km"]|Indicates which units for length measurements will be selectable by users. Options are "m" (metres), "km" (kilometres), "nm" (nautical miles).|false|
|measurementAccuracy|no|String|"meter"|Indicates how accurately the measurement result is displayed for "m", "nm", "m²", "ha". Options are "decimeter" for one decimal place. "meter" for no decimal place. "dynamic" for one decimal place for results smaller 10 and no decimal place for results greater or equal 10 of the respective unit.|false|
|name|no|String|"common:modules.measure.name"|Name of the module in the menu.|false|
|polygonUnits|no|String[]|["m²", "km²"]|Indicates which units for area measurements will be selectable by users. Options are "m²", "ha", "km²".|false|
|type|no|String|"measure"|The type of the module. Defines which module is configured.|false|

**Example**

```json
{
    "earthRadius": 6378137,
    "icon": "bi-arrows-angle-expand",
    "measurementAccuracy": "dynamic",
    "name": "common:modules.measure.name",
    "type": "measure"
}
```

***

##### portalConfig.menu.sections.modules.news {data-toc-label='News'}

[inherits]: # (portalConfig.menu.sections.modules)

This module shows all messages from the newsFeedPortalAlerts.json and the config.json of the current portal regardless of the "read" status.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|icon|no|String|"bi-newspaper"|Icon that is shown in front of the module-name in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|name|no|String|"common:modules.news.name"|Name of the module in the menu.|false|
|type|no|String|"news"|The type of the module. Defines which module is configured.|false|

**Example**

```json
{
    "icon": "bi-newspaper",
    "name": "common:modules.news.name",
    "type": "news"
}
```

***

##### portalConfig.menu.sections.modules.openConfig {data-toc-label='Open Config'}

[inherits]: # (portalConfig.menu.sections.modules)

With this module a configuration file (config.json) can be reloaded at runtime. The modules and map are adapted to the new configuration.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|icon|no|String|"bi-upload"|Icon that is shown in front of the module-name in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|name|no|String|"common:modules.openConfig.name"|Name of the module in the menu.|false|
|type|no|String|"openConfig"|The type of the module. Defines which module is configured.|false|

**Example**

```json
{
    "icon": "bi-upload",
    "name": "common:modules.openConfig.name",
    "type": "openConfig"
}
```

***

##### portalConfig.menu.sections.modules.print {data-toc-label='Print'}

[inherits]: # (portalConfig.menu.sections.modules)

Print module, configurable for 2 print services: *High Resolution PlotService* and *MapfishPrint 3*.

**This requires a backend!**

**A [Mapfish-Print3](https://mapfish.github.io/mapfish-print-doc), or *HighResolutionPlotService* is required as backend.**

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|additionalLayers|nein|**[additionalLayers](#portalconfigmenusectionsmodulesprintadditionallayers)**||Defines layers that can be added to print.|false|
|capabilitiesFilter|no|**[capabilitiesFilter](#portalconfigmenusectionsmodulesprintcapabilitiesfilter)**||Filter for the response of the configured print service. Possible keys are layouts and outputFormats.|false|
|currentLayoutName|no|String|"A4 Hochformat"|Defines which layout is the default layout on opening the print tool, e.g. "A4 portrait format". If the given layout is not available oder none is provided, the first layout mentioned in the Capabilities is used.|false|
|defaultCapabilitiesFilter|no|**[capabilitiesFilter](#portalconfigmenusectionsmodulesprintcapabilitiesfilter)**||If there is no key set in capabilitiesFilter, the key from this object is taken.|false|
|dpiForPdf|no|Number|200|DPI resolution for the map in the PDF file.|false|
|filename|no|String|"report"|Print result file name.|false|
|icon|no|String|"bi-printer"|Icon that is shown in front of the module-name in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|isLegendSelected|no|Boolean|false|Defines whether a checkbox to print the legend is offered. Only used for print services supporting legend printing (Mapfish Print 3).|false|
|name|no|String|"common:modules.print.name"|Name of the module in the menu.|false|
|overviewmapLayerId|no|String||Allows using a different layer for the overview map element. If no Id is specified, the first layer of the selected baselayer maps is used.|false|
|printAppCapabilities|no|String|"capabilities.json"|path for the configuration of the print service|false|
|printAppId|no|String|"master"|Print service print app id. This tells the print service which template(s) to use.|false|
|printMapMarker|no|Boolean|false|If set to true, map markers visible in the print image section will be printed. They may obstruct the view to interesting information.|false|
|printService|no|String|"mapfish"|Flag determining which print service is in use. `plotservice` activates the *High Resolution PlotService*, if the parameter is not set, *Mapfish 3* is used.|false|
|printServiceId|yes|String||Print service id. Resolved using the **[rest-services.json](../Global-Config/rest-services.json.md)** file.|false|
|showInvisibleLayerInfo|no|Boolean|true|Defines whether an infobox is shown when layers will not be printed because they are invisible due to scale.|false|
|title|no|String|"PrintResult"|Document title appearing as header.|false|
|type|no|String|"print"|The type of the module. Defines which module is configured.|false|

**High Resolution PlotService example configuration**

```json
"print": {
    "name": "common:modules.print.name",
    "icon": "bi-printer",
    "type": "print",
    "printServiceId": "123456",
    "filename": "Ausdruck",
    "title": "Mein Titel",
    "printService": "plotservice",
    "printAppCapabilities": "info.json",
    "layoutOrder": [
        "Default A4 hoch",
        "Default A4 quer",
        "Default A3 hoch",
        "Default A3 quer",
    ]
}
```

**MapfishPrint3 example configuration**

```json
"print": {
    "name": "Karte drucken",
    "icon": "bi-printer",
    "type": "print",
    "printServiceId": "mapfish_printservice_id",
    "printAppId": "mrh",
    "filename": "Ausdruck",
    "title": "Mein Titel"
}
```

***

###### portalConfig.menu.sections.modules.print.additionalLayers
List of Layers that can be added to the print document.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|active|no|Boolean|false|Defines if the layer is active.|false|
|id|yes|String||Service-ID of the layer.|false|
|label|yes|String||Label of the checkbox in the print dialog.|false|


```json title="Example additionalLayers"
"additionalLayers": [{
  "id": "wms_coord_grid_25832",
  "label": "Coordinate Grid UTM32N - ETRS89"
}]
```

***

###### portalConfig.menu.sections.modules.print.capabilitiesFilter {data-toc-label='Capabilities Filter'}
List of layouts and formats that filters the response from the print service in the respective category.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|layouts|no|String[]||Array of layouts should shown in the UI.|false|
|outputFormats|no|String[]||Array of formats should shown in the UI.|false|

**Example capabilitiesFilter:**

```json
"capabilitiesFilter": {
    "layouts": ["A4 Hochformat", "A3 Hochformat"],
    "outputFormats": ["PDF"]
}
```

***

##### portalConfig.menu.sections.modules.routing {data-toc-label='Routing'}

[inherits]: # (portalConfig.menu.sections.modules)

Routing module. Enables user to plan routes between multiple points with multiple options to choose from. In addition users can create isochrones. Both functions are available with mass requests for specific use cases. ❗ This tool will use the routing service provided by the BKG ❗.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|activeRoutingToolOption|no|String|"DIRECTIONS"|Which routing tool should be open.|false|
|routingToolOptions|no|String[]|[ ]|Which routing tool should be enabled. ("DIRECTIONS", "ISOCHRONES")|false|
|download|no|**[download](#portalconfigmenusectionsmodulesroutingdownload)**||Downloadoptions|false|
|geosearch|no|**[geosearch](#portalconfigmenusectionsmodulesroutinggeosearch)**||Geosearchoptions|false|
|geosearchReverse|no|**[geosearchReverse](#portalconfigmenusectionsmodulesroutinggeosearchreverse)**||Geosearchreverseoptions|false|
|directionsSettings|no|**[directionsSettings](#portalconfigmenusectionsmodulesroutingdirectionssettings)**||Directionsoptions|false|
|isochronesSettings|no|**[isochronesSettings](#portalconfigmenusectionsmodulesroutingisochronessettings)**||Isochronesoptions|false|

**Example**

```json
{
    "type": "routing",
    "name": "common:modules.routing",
    "icon": "bi-signpost-2",
    "activeRoutingToolOption": "DIRECTIONS",
    "routingToolOptions": ["DIRECTIONS", "ISOCHRONES"],
    "download": {
        "filename": "",
        "format": "GEOJSON"
    },
    "geosearch": {
        "minChars": 3,
        "limit": 10,
        "type": "BKG",
        "serviceId": "bkg_geosearch"
    },
    "geosearchReverse": {
        "distance": 1000,
        "filter": "",
        "type": "BKG",
        "serviceId": "bkg_suggest"
    },
    "directionsSettings": {
        "type": "ORS",
        "serviceId": "bkg_ors",
        "speedProfile": "CAR",
        "preference": "RECOMMENDED",
        "styleRoute": {
            "fillColor": [255, 44, 0],
            "width": 6,
            "highlightColor": [255, 255, 255],
            "highlightWidth": 9,
            "partHighlightColor": [255, 255, 255],
            "partHighlightWidth": 3
        },
        "styleWaypoint": {
            "lineColor": [255, 127, 0],
            "lineWidth": 4,
            "fillColor": [255, 127, 0],
            "textFillColor": "#000",
            "textLineColor": "#fff",
            "textLineWidth": 3,
            "opacity": 0.3,
            "radius": 8
        },
        "styleAvoidAreas": {
            "lineColor": [0, 127, 255],
            "lineWidth": 2,
            "fillColor": [0, 127, 255],
            "opacity": 0.3,
            "pointRadius": 8,
            "pointLineWidth": 4
        },
        "batchProcessing": {
            "enabled": false,
            "active": false,
            "limit": 1000,
            "maximumConcurrentRequests": 3
        }
    },
    "isochronesSettings": {
        "type": "ORS",
        "serviceId": "bkg_ors",
        "speedProfile": "CAR",
        "isochronesMethodOption": "TIME",
        "distanceValue": 30,
        "minDistance": 1,
        "maxDistance": 400,
        "timeValue": 30,
        "minTime": 1,
        "maxTime": 180,
        "intervalValue": 15,
        "minInterval": 3,
        "maxInterval": 30,
        "styleCenter": {
            "lineColor": [255, 127, 0],
            "lineWidth": 4,
            "fillColor": [255, 127, 0],
            "opacity": 0.3,
            "radius": 8
        },
        "styleIsochrones": {
            "lineWidth": 2,
            "opacity": 0.65,
            "startColor": [66, 245, 78],
            "endColor": [245, 66, 66]
        },
        "batchProcessing": {
            "enabled": false,
            "active": false,
            "limit": 1000,
            "maximumConcurrentRequests": 3
        }
    }
}
```

***

###### portalConfig.menu.sections.modules.routing.download {data-toc-label='Download'}
Routing-tool download options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|fileName|no|String|""|Default filename for the download.|false|
|format|no|enum["GEOJSON","KML","GPX"]|"GEOJSON"|Which format should be selected by default.|false|

**Example**

```json
{
    "download": {
        "filename": "",
        "format": "GEOJSON"
    }
}
```

***

###### portalConfig.menu.sections.modules.routing.geosearch {data-toc-label='Geosearch'}

[type:Bbox]: # (Datatypes.Bbox)

Routing-tool geosearch options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|minChars|no|Number|3|Minimum amount of characters before sending a request to an external service.|false|
|limit|no|Number|10|Maximale amount of characters for the search.|false|
|type|yes|enum["BKG","NOMINATIM","LOCATIONFINDER","KOMOOT","GAZETTEER","SPECIALWFS","ELASTIC"]|""|Which type of the geosearch should be used.|false|
|serviceId|yes|String||Which service should be used for the geosearch.|false|
|typeName|no|String||Type name for the specialWfs geosearch query.|false|
|propertyNames|no|String[]||Names of properties to be included in the specialWfs geosearch.|false|
|geometryNames|no|String||Name of the geometry field for specialWfs geosearch.|false|
|bbox|no|**[Bbox](#datatypesbbox)**||BBOX value according to the speedProfile. Coordinate system depends on the epsg parameter. Geosearch service must support bbox string.|false|
|epsg|no|String|4326|Which EPSG code is used by the service (e.g. 4326, 25832).|false|
|searchField|no|String||The path to the field to be searched for when using Elastic Search.|false|
|sortField|no|String||The path to the field that specifies the sorting of the results in ascending order when using Elastic Search.|false|

**Example for BKG**

```json
{
    "geosearch": {
        "type": "BKG",
        "serviceId": "bkg_geosearch",
        "bbox": {"CYCLING": "9.6,53.40,10.4,53.84"}
    }
}
```
**Example for SPECIALWFS**

```json
{
    "geosearch": {
        "minChars": 3,
        "limit": 10,
        "type": "SPECIALWFS",
        "serviceId": "specialWfs_geosearch",
        "typeName": "ms:strasse_nr",
		"propertyNames": [
			"ms:LABEL_TEXT"
			],
		"geometryName": "ms:msGeometry"
    }
}
```
**Example for ELASTIC**

```json
{
    "geosearch": {
        "minChars": 3,
        "limit": 10,
        "type": "ELASTIC",
        "serviceId": "elastic_geosearch",
        "epsg": "25832",
        "searchField": "properties.searchField",
        "sortField": "properties.HAUSNUMMER"
    }
}
```

***

###### portalConfig.menu.sections.modules.routing.geosearchReverse {data-toc-label='Geosearch Reverse'}
Routing-tool geosearch reverse options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|distance|no|Number|1000|Search radius in meter for the external service.|false|
|filter|no|String||Additional filter used in the query.|false|
|type|yes|enum["BKG","NOMINATIM","KOMOOT"]||Which type of geosearch reverse should be used.|false|
|serviceId|yes|String||Which service should be used for the geosearch reverse.|false|

**Example**

```json
{
    "geosearchReverse": {
        "distance": 1000,
        "filter": "",
        "type": "BKG",
        "serviceId": "bkg_suggest"
    }
}
```

***

###### portalConfig.menu.sections.modules.routing.directionsSettings {data-toc-label='Directions Settings'}

[type:BatchProcessing]: # (Datatypes.BatchProcessing)
[type:StyleAvoidAreas]: # (Datatypes.StyleAvoidAreas)
[type:StyleWaypoint]: # (Datatypes.StyleWaypoint)
[type:StyleRoute]: # (Datatypes.StyleRoute)
[type:CustomPreferences]: # (Datatypes.CustomPreferences)
[type:CustomAvoidFeatures]: # (Datatypes.CustomAvoidFeatures)

Routing-tool directions options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|type|yes|enum["ORS"]||Which type of service should be used for the request.|false|
|serviceId|yes|String||Which service should be used for the request.|false|
|speedProfile|no|String|"CAR"|Which speed profile should be selected by default.|false|
|preference|no|String|"RECOMMENDED"|Which type of directions should be used by default.|false|
|customPreferences|no|**[CustomPreferences](#datatypescustompreferences)**||Possibility to define additional preferences for the different speed profiles (additionally to the BKG service)  (requires own modified backend)|false|
|customAvoidFeatures|no|**[CustomAvoidFeatures](#datatypescustomavoidfeatures)**||Possibility to define own options for avoid traffic routes for the different speed profiles(additionally to the BKG service) (requires own modified backend)|false|
|styleRoute|no|**[StyleRoute](#datatypesstyleroute)**||Stylerouteoptions|false|
|styleWaypoint|no|**[StyleWaypoint](#datatypesstylewaypoint)**||Stylewaypointoptions|false|
|styleAvoidAreas|no|**[StyleAvoidAreas](#datatypesstyleavoidareas)**||Styleavoidareasoptions|false|
|batchProcessing|no|**[BatchProcessing](#datatypesbatchprocessing)**||Batchprocessingoptions|false|

**Example**

```json
{
    "directionsSettings": {
        "type": "ORS",
        "serviceId": "bkg_ors",
        "speedProfile": "CAR",
        "preference": "RECOMMENDED",
        "customPreferences": {
            "CYCLING": ["RECOMMENDED", "SHORTEST", "GREEN"]
        },
        "customAvoidFeatures": {
                "CYCLING": ["STEPS", "FERRIES", "UNPAVEDROADS"]
        },
        "styleRoute": {
            "fillColor": [255, 44, 0, 1],
            "width": 6,
            "highlightColor": [255, 255, 255, 1],
            "highlightWidth": 9,
            "partHighlightColor": [255, 255, 255, 1],
            "partHighlightWidth": 3
        },
        "styleWaypoint": {
            "lineColor": [255, 127, 0],
            "lineWidth": 4,
            "fillColor": [255, 127, 0],
            "textFillColor": "#000",
            "textLineColor": "#fff",
            "textLineWidth": 3,
            "opacity": 0.3,
            "radius": 8
        },
        "styleAvoidAreas": {
            "lineColor": [0, 127, 255],
            "lineWidth": 2,
            "fillColor": [0, 127, 255],
            "opacity": 0.3,
            "pointRadius": 8,
            "pointLineWidth": 4
        },
        "batchProcessing": {
            "enabled": false,
            "active": false,
            "limit": 1000,
            "maximumConcurrentRequests": 3
        }
    }
}
```

***

###### portalConfig.menu.sections.modules.routing.isochronesSettings {data-toc-label='Isochrones Settings'}

[type:BatchProcessing]: # (Datatypes.BatchProcessing)
[type:StyleCenter]: # (Datatypes.StyleCenter)
[type:StyleIsochrones]: # (Datatypes.StyleIsochrones)

Routing-tool isochrones options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|type|yes|enum["ORS"]||Which type of service should be used for the request.|false|
|serviceId|yes|String||Which service should be used for the request.|false|
|speedProfile|no|String|"CAR"|Which speed profile should be selected by default.|false|
|isochronesMethodOption|no|String|"TIME"|Which method should be selected by default.|false|
|distanceValue|no|Number|30|Which distance value in km should be selected by default.|false|
|minDistance|no|Number|1|Which minimal distance value in km should be used.|false|
|maxDistance|no|Number|400|Which maximum distance value in km should be used.|false|
|timeValue|no|Number|30|Which time value in min should be selected by default.|false|
|minTime|no|Number|1|Which minimal time value in min should be used.|false|
|maxTime|no|Number|180|Which maximum time in min should be used.|false|
|intervalValue|no|Number|15|Which interval value in km/min should be used by default.|false|
|minInterval|no|Number|1|Which minimal interval value in km/min should be used.|false|
|maxInterval|no|Number|30|Which maximum interval value in km/min should be used.|false|
|styleCenter|no|**[StyleCenter](#datatypesstylecenter)**||Stylecenteroptions|false|
|styleIsochrones|no|**[StyleIsochrones](#datatypesstyleisochrones)**||Styleisochronesoptions|false|
|batchProcessing|no|**[BatchProcessing](#datatypesstyleisochrones)**||Batchprocessingoptions|false|

**Example**

```json
{
    "isochronesSettings": {
        "type": "ORS",
        "serviceId": "bkg_ors",
        "speedProfile": "CAR",
        "isochronesMethodOption": "TIME",
        "distanceValue": 30,
        "minDistance": 1,
        "maxDistance": 400,
        "timeValue": 30,
        "minTime": 1,
        "maxTime": 180,
        "intervalValue": 15,
        "minInterval": 3,
        "maxInterval": 30,
        "styleCenter": {
            "lineColor": [255, 127, 0],
            "lineWidth": 4,
            "fillColor": [255, 127, 0],
            "opacity": 0.3,
            "radius": 8
        },
        "styleIsochrones": {
            "lineWidth": 2,
            "opacity": 0.65,
            "startColor": [66, 245, 78],
            "endColor": [245, 66, 66]
        },
        "batchProcessing": {
            "enabled": false,
            "active": false,
            "limit": 1000,
            "maximumConcurrentRequests": 3
        }
    }
}
```

***

##### portalConfig.menu.sections.modules.scaleSwitcher {data-toc-label='Scale Switcher'}

[inherits]: # (portalConfig.menu.sections.modules)

Module that allows changing the map's current scale.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|icon|no|String|"bi-arrows-angle-contract"|Icon that is shown in front of the module-name in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|name|no|String|"common:modules.scaleSwitcher.name"|Name of the module in the menu.|false|
|type|no|String|"scaleSwitcher"|The type of the module. Defines which module is configured.|false|

**Example**

```json
{
    "icon": "bi-arrows-angle-contract",
    "name": "common:modules.scaleSwitcher.name",
    "type": "scaleSwitcher"
}
```

***

##### portalConfig.menu.sections.modules.selectFeatures {data-toc-label='Select Features'}

[inherits]: # (portalConfig.menu.sections.modules)

Allows selecting a set of vector features by letting the user draw a box on the map. Features in that box will be displayed with GFI information and it's possible to zoom to a feature. This tool requires WFS(❗) layers.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|highlightVectorRulesPointLine|no|**[highlightVectorRulesPointLine](#portalconfigmenusectionsmodulesselectfeatureshighlightvectorrulespointline)**||Specify outline color and stroke width for highlighting lines and fill color and scale factor for highlighting points as well as a zoom parameter.|false|
|highlightVectorRulesPolygon|no|**[highlightVectorRulesPolygon](#portalconfigmenusectionsmodulesselectfeatureshighlightvectorrulespolygon)**||Specify the fill color and outline color and stroke width for highlighting the polygon features as well as a zoom parameter.|false|
|icon|no|String|"bi-hand-index"|Icon that is shown in front of the module-name in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|name|no|String|"common:modules.selectFeatures.name"|Name of the module in the menu.|false|
|type|no|String|"selectFeatures"|The type of the module. Defines which module is configured.|false|

**Example**

```json
{
    "type": "selectFeatures",
    "highlightVectorRulesPolygon": {
        "fill": {
            "color": [255, 0, 255, 0.9]
        },
        "stroke": {
            "width": 4,
            "color": [0, 0, 204, 0.9]
        },
        "zoomLevel": 5
    },
    "highlightVectorRulesPointLine": {
        "fill": {
            "color": [255, 0, 255, 0.9]
        },
        "stroke": {
            "width": 8,
            "color": [255, 0, 255, 0.9]
        },
        "image": {
            "scale": 2
        },
        "zoomLevel": 5
    }
}
```

***

###### portalConfig.menu.sections.modules.selectFeatures.highlightVectorRulesPointLine {data-toc-label='Highlight Vector Rules Point Line'}

[type:Image]: # (Datatypes.Image)
[type:Fill]: # (Datatypes.Fill)
[type:Stroke]: # (Datatypes.Stroke)

Specify outline color and stroke width for highlighting lines and fill color and scale factor for highlighting points. Also a zoom level.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|fill|no|**[Fill](#datatypesfill)**|[255, 255, 255, 0.5]|Possible setting: color|false|
|stroke|no|**[Stroke](#datatypesstroke)**|1.5|Possible setting: width and color|false|
|image|no|**[Image](#datatypesimage)**|1|Possible setting: scale|false|
|zoomLevel|no|Integer|7|Zoom level, possible setting: 0-9|false|

***

###### portalConfig.menu.sections.modules.selectFeatures.highlightVectorRulesPolygon {data-toc-label='Highlight Vector Rules Polygon'}

[type:Fill]: # (Datatypes.Fill)
[type:Stroke]: # (Datatypes.Stroke)

Specify the fill color and stroke width for highlighting the polygon features as well as a zoom level.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|fill|no|**[Fill](#datatypesfill)**|[255, 255, 255, 0.5]|Possible setting: color|false|
|stroke|no|**[Stroke](#datatypesstroke)**|1|Possible setting: width|false|
|zoomLevel|no|Integer|7|Zoom level, possible setting: 0-9|false|

***

##### portalConfig.menu.sections.modules.shadow {data-toc-label='Shadow'}

[inherits]: # (portalConfig.menu.sections.modules)

The shadow tool provides a UI element to define a point in time by using sliders and date pickers. The chosen time allows rendering the shadows of all 3D objects in 3D mode by simulating the sun's position. By pulling the sliders or selecting a different date, a new sun position is calculated immediately. By default, the tool starts with the current time, which can be overwritten in the parameters.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|icon|no|String|"bi-lamp-fill"|Icon that is shown in front of the module-name in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|isShadowEnabled|no|Boolean|false|Default shadow value. `true` immediately renders shadows, `false` requires a manual confirmation.|false|
|name|no|String|"common:modules.shadow.name"|Name of the module in the menu.|false|
|shadowTime|no|**[shadowTime](#portalconfigmenusectionsmodulesshadowshadowtime)**||Default time the mdoule is started with. Recognizes "month", "day", "hour", and "minute".|false|
|type|no|String|"shadow"|The type of the module. Defines which module is configured.|false|

**Example**

```json
{
    "isShadowEnabled": true,
    "shadowTime": {
        "month": "6",
        "day": "20",
        "hour": "13",
        "minute": "0"
    },
    "type": "shadow"
}
```

***

###### portalConfig.menu.sections.modules.shadow.shadowTime {data-toc-label='Shadow Time'}
|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|
|month|no|String||month|false|
|day|no|String||day|false|
|hour|no|String||hour|false|
|minute|no|String||minute|false|

**Example**

```json
{
    "month": "6",
    "day": "20",
    "hour": "13",
    "minute": "0"
}
```

***

##### portalConfig.menu.sections.modules.statisticDashboard {data-toc-label='Statistic Dashboard'}

[inherits]: # (portalConfig.menu.sections.modules)

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|String|"translate#common:menu.statisticDashboard"|The Name of the Tool.|false|
|subtitle|no|String|"common:modules.statisticDashboard.headings.mrhstatistics"|The subtitle to display|false|
|icon|no|String|"bi-speedometer"|The icon of the Tool|false|
|colorScheme|yes|**[colorScheme](#portalconfigmenusectionsmodulesstatisticdashboardcolorscheme)**|""|Defines the colours of the features in statisticdashboard.|false|
|active|no|Boolean|false|If `true`, the tool is open after initializing the portal.|false|
|data|yes|**[data](#portalconfigmenusectionsmodulesstatisticdashboarddata)**|""|data for statistic dashboard.|false|
|classificationMode|no|String|"quantiles"|Method for dividing values into classes: "quantiles", "equalIntervals" or "benutzerdefiniert"|false|
|allowPositiveNegativeMix|no|Boolean|false|If classification method is allowed to create classes like "from -1 to 1".|false|
|minNumberOfClasses|no|Number|2|Minimum selectable number of classes for choropleth map and legend. At least 2.|false|
|maxNumberOfClasses|no|Number|5|Maximum selectable number of classes for choropleth map and legend. At least 3.|false|
|numberOfClasses|no|Number|5|Current selected number of classes.|false|
|selectableColorPalettes|no|**[selectableColorPalettes](#portalconfigmenusectionsmodulesstatisticdashboardselectablecolorpalettes)**|{"label": "Blau", "baseColor": [8, 81, 156]}|Available options for color palettes |false|
|downloadFilename|no|String|"Statistic Dashboard Download"|The filename of the exported csv file.|false|

**Example**

```json
{
    "name": "translate#common:menu.statisticDashboard",
    "subtitle": "common:modules.statisticDashboard.headings.mrhstatistics",
    "icon": "bi-speedometer",
    "downloadFilename": "Downloaded_Data",
    "colorScheme": {
        "referenceRegion": [155, 155, 155, 0.7],
        "lineCharts": [[74, 0, 30, 1], [117, 18, 50, 1], [189, 47, 83, 1], [198, 81, 84, 1], [228, 121, 97, 1], [240, 168, 130, 1], [250, 212, 172, 1], [157, 185, 171, 1], [137, 192, 196, 1], [87, 158, 185, 1],
            [57, 122, 168, 1], [28, 87, 150, 1], [22, 55, 113, 1], [16, 25, 77, 1], [118, 199, 190, 1], [62, 168, 166, 1], [32, 130, 136, 1], [0, 73, 75, 1], [224, 110, 133, 1], [204, 65, 90, 1]]
    },
    "active": true,
    "data": {
        "layerId": "28992",
        "geometryAttribute": "geom",
        "chartDirectionValue": 10,
        "timeStepsFilter": {
            "5": "Die letzten 5 Jahre",
            "10": "Die letzten 10 Jahre",
            "all": "Alle Jahre"
        },
        "mappingFilter": {
            "timeAttribute": {
                "attrName": "zeitpunkt",
                "name": "Zeitpunkt",
                "inputFormat": "YYYY-MM-DD",
                "outputFormat": "YYYY"
            },
            "regionNameAttribute": {
                "attrName": "statistisches_gebiet",
                "name": "Statistisches Gebiet"
            },
            "statisticsAttributes": {
                "arbeitnehmer_inland_tausend": {
                    "name": "Arbeitnehmer (Inland) in 1.000",
                    "category": "Beschäftigte"
                },
                "arbeitslose_jahresdurchschnitt": {
                    "name": "Arbeitslose",
                    "category": "Beschäftigte"
                },
                "arbeitslose_15_bis_u25_jahresdurchschnitt": {
                    "name": "Arbeitslose 15 bis unter 25 Jahre",
                    "category": "Beschäftigte"
                },
                "einwohner_ab_65": {
                    "name": "Einwohner 65 Jahre und älter",
                    "category": "Bevölkerung"
                },
                "einwohner_ab_65_prozent_aller_einwohner": {
                    "name": "Einwohner 65 Jahre und älter in % aller Einwohner",
                    "category": "Bevölkerung"
                },
                "einwohner_auslaender": {
                    "name": "Einwohner Ausländer",
                    "category": "Bevölkerung"
                }
            }
        }
    }
}
```

***

###### portalConfig.menu.sections.modules.statisticDashboard.colorScheme {data-toc-label='Color Scheme'}

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|referenceRegion|yes|Float[]|[]|The RGBA color of the Reference region.|false|
|lineCharts|yes|Float[]|[]|The list of the RGBA colors of the linecharts.|false|

**Example**

```json
{
        "referenceRegion": [155, 155, 155, 0.7],
        "lineCharts": [[74, 0, 30, 1], [117, 18, 50, 1], [189, 47, 83, 1], [198, 81, 84, 1], [228, 121, 97, 1], [240, 168, 130, 1], [250, 212, 172, 1], [157, 185, 171, 1], [137, 192, 196, 1], [87, 158, 185, 1],
            [57, 122, 168, 1], [28, 87, 150, 1], [22, 55, 113, 1], [16, 25, 77, 1], [118, 199, 190, 1], [62, 168, 166, 1], [32, 130, 136, 1], [0, 73, 75, 1], [224, 110, 133, 1], [204, 65, 90, 1]]
}
```

***

###### portalConfig.menu.sections.modules.statisticDashboard.selectableColorPalettes {data-toc-label='Selectable Color Palettes'}

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|label|yes|String||The displayed name of the color palette.|false|
|baseColor|yes|Number[]||The base color as an rgb array|false|

**Beispiel**

```json
[
        {
            "label": "Blau",
            "baseColor": [8, 81, 156]
        }
]
```

***

###### portalConfig.menu.sections.modules.statisticDashboard.data {data-toc-label='Data'}

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|----|-----------|------|
|layerId|yes|String|""|The id of the Layer.|false|
|oafRequestCRS|no|String|""|Only for OAF Service - The coordinate reference system of the response geometries. I.e.: 'http://www.opengis.net/def/crs/EPSG/0/25832'|false|
|oafDataProjectionCode|no|String|""|Only for OAF Service - The projection code of the data. Is needed to render the features on the map. I.e.: 'EPSG:25832'|false|
|geometryAttribute|yes|String|""|Type of the geometry attribute.|false|
|chartDirectionValue|no|String|""|Specifies the number above which the bars in the chart will be switched from vertical to horizontal.|false|
|timeStepsFilter|yes|**[timeStepsFilter](#portalconfigmenusectionsmodulesstatisticdashboarddatatimestepsfilter)**|""|An object consisting of keys and values where the key contains the number of time groupings and the value contains the description for the grouping.|false|
|mappingFilter|yes|**[mappingFilter](#portalconfigmenusectionsmodulesstatisticdashboarddatamappingfilter)**|""|This object contains attributes used to filter the map by its values.|false|

**Example**

```json
{
    "layerId": "28992",
    "oafRequestCRS": "http://www.opengis.net/def/crs/EPSG/0/25832",
    "oafDataProjectionCode": "EPSG:25832",
    "geometryAttribute": "geom",
    "chartDirectionValue": 10,
    "timeStepsFilter": {
        "5": "Die letzten 5 Jahre",
        "10": "Die letzten 10 Jahre",
        "all": "Alle Jahre"
    },
    "mappingFilter": {
        "timeAttribute": {
            "attrName": "zeitpunkt",
            "name": "Zeitpunkt",
            "inputFormat": "YYYY-MM-DD",
            "outputFormat": "YYYY"
        },
        "regionNameAttribute": {
            "attrName": "statistisches_gebiet",
            "name": "Statistisches Gebiet"
        },
        "statisticsAttributes": {
            "arbeitnehmer_inland_tausend": {
                "name": "Arbeitnehmer (Inland) in 1.000",
                "category": "Beschäftigte"
            },
            "arbeitslose_jahresdurchschnitt": {
                "name": "Arbeitslose",
                "category": "Beschäftigte"
            },
            "arbeitslose_15_bis_u25_jahresdurchschnitt": {
                "name": "Arbeitslose 15 bis unter 25 Jahre",
                "category": "Beschäftigte"
            },
            "einwohner_ab_65": {
                "name": "Einwohner 65 Jahre und älter",
                "category": "Bevölkerung"
            },
            "einwohner_ab_65_prozent_aller_einwohner": {
                "name": "Einwohner 65 Jahre und älter in % aller Einwohner",
                "category": "Bevölkerung"
            },
            "einwohner_auslaender": {
                "name": "Einwohner Ausländer",
                "category": "Bevölkerung"
            }
        }
    }
}
```

***

###### portalConfig.menu.sections.modules.statisticDashboard.data.timeStepsFilter {data-toc-label='Time Steps Filter'}

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|key:value|ja|String|""|Key: The key is the number of the last "key" entry for dropdown options. Value: The description for the grouping.|false|
|all:value|ja|String|""|Key: The keyword for selecting all entries for dropdown options. Value: The description for the grouping.|false|

**Example**

```json
{
	"5": "Die letzten 5 Jahre",
	"10": "Die letzten 10 Jahre",
	"all": "Alle Jahre"
}
```

***

###### portalConfig.menu.sections.modules.statisticDashboard.data.mappingFilter {data-toc-label='Mapping Filter'}

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|timeAttribute|yes|**[timeAttribute](#portalconfigmenusectionsmodulesstatisticdashboarddatamappingfiltertimeattribute)**|""|The attribute for the time filter.|false|
|regionNameAttribute|yes|**[regionNameAttribute](#portalconfigmenusectionsmodulesstatisticdashboarddatamappingfilterregionnameattribute)**|""|The attribute for the name of the region.|false|
|statisticsAttributes|yes|**[statisticsAttributes](#portalconfigmenusectionsmodulesstatisticdashboarddatamappingfilterstatisticsattributes)**|""|Attributes used to filter the map by its values.|false|

**Example**

```json
{
	"timeAttribute": {
		"attrName": "zeitpunkt",
		"name": "Zeitpunkt",
		"inputFormat": "YYYY-MM-DD",
		"outputFormat": "YYYY"
	},
	"regionNameAttribute": {
		"attrName": "statistisches_gebiet",
		"name": "Statistisches Gebiet"
	},
	"statisticsAttributes": {
		"arbeitnehmer_inland_tausend": {
			"name": "Arbeitnehmer (Inland) in 1.000",
			"category": "Beschäftigte"
		},
		"arbeitslose_jahresdurchschnitt": {
			"name": "Arbeitslose",
			"category": "Beschäftigte"
		},
		"arbeitslose_15_bis_u25_jahresdurchschnitt": {
			"name": "Arbeitslose 15 bis unter 25 Jahre",
			"category": "Beschäftigte"
		},
		"einwohner_ab_65": {
			"name": "Einwohner 65 Jahre und älter",
			"category": "Bevölkerung"
		},
		"einwohner_ab_65_prozent_aller_einwohner": {
			"name": "Einwohner 65 Jahre und älter in % aller Einwohner",
			"category": "Bevölkerung"
		},
		"einwohner_auslaender": {
			"name": "Einwohner Ausländer",
			"category": "Bevölkerung"
		}
	}
}
```

***

###### portalConfig.menu.sections.modules.statisticDashboard.data.mappingFilter.timeAttribute {data-toc-label='Time Attribute'}

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|attrName|yes|String|""|The attribute for the time filters.|false|
|name|no|String|""|The name of the attribute.|false|
|inputFormat|no|String|""|Input Format|false|
|outputFormat|no|String|""|Output Format|false|

**Example**

```json
{
    "attrName": "zeitpunkt",
    "name": "Zeitpunkt",
    "inputFormat": "YYYY-MM-DD",
    "outputFormat": "YYYY"
}
```

***

###### portalConfig.menu.sections.modules.statisticDashboard.data.mappingFilter.regionNameAttribute {data-toc-label='Region Name Attribute'}

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|attrName|yes|String|""|The attribute of the region.|false|
|name|no|String|""|The name of the region attribute.|false|

**Example**

```json
{
    "attrName": "statistisches_gebiet",
    "name": "Kreis"
}
```

***

###### portalConfig.menu.sections.modules.statisticDashboard.data.mappingFilter.statisticsAttributes {data-toc-label='Statistics Attributes'}

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|key|yes|String|""|The key of the Statistic attributes.|false|
|name|yes|String|""|The name of the statisticsAttributes.|false|
|Category|yes|String|""|The category of the statisticsAttributes. If the category is set, it will be grouped under this category in the category selection.|false|

**Example**

```json
{
    "arbeitnehmer_inland_tausend": {
        "name": "Arbeitnehmer (Inland) in 1.000",
        "category": "Beschäftigte"
    },
    "arbeitslose_jahresdurchschnitt": {
        "name": "Arbeitslose",
        "category": "Beschäftigte"
    },
    "arbeitslose_15_bis_u25_jahresdurchschnitt": {
        "name": "Arbeitslose 15 bis unter 25 Jahre",
        "category": "Beschäftigte"
    }
}
```

***

##### portalConfig.menu.sections.modules.shareView {data-toc-label='Share View'}

[inherits]: # (portalConfig.menu.sections.modules)

Module to share a link to the current map view. It is possible to share the current view as a link with url parameters, via QR code and as a Facebook link.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|copyShare|nein|Boolean|true|Shows if the button to copy the link should be in the module.|false|
|facebookShare|nein|Boolean|false|Shows if the button to share a link via facebook should be in the module.|false|
|icon|no|String|"bi-share"|Icon that is shown in front of the module-name in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|name|no|String|"common:modules.shareView.name"|Name of the module in the menu.|false|
|type|no|String|"shareView"|The type of the module. Defines which module is configured.|false|
|qrShare|nein|Boolean|false|Shows if the button to create a qr code should be in the module.|false|

**Example**

```json
{
    "icon": "bi-share",
    "name": "common:modules.shareView.name",
    "type": "shareView",
    "facebookShare": true,
    "qrShare": true
}
```

***

##### portalConfig.menu.sections.modules.styleVT {data-toc-label='Style Vector Tiles'}

[inherits]: # (portalConfig.menu.sections.modules)

The module allows for switching the style of vector tile layers(❗) which provides multiple stylings defined in the `services.json` file.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|icon|no|String|"bi-paint-bucket"|Icon that is shown in front of the module-name in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|name|no|String|"common:modules.styleVT.name"|Name of the module in the menu.|false|
|type|no|String|"styleVT"|The type of the module. Defines which module is configured.|false|

**Example**

```json
{
    "icon": "bi-paint-bucket",
    "name": "common:modules.styleVT.name",
    "type": "styleVT"
}
```

***

##### portalConfig.menu.sections.modules.wfsSearch {data-toc-label='WFS Search'}

[inherits]: # (portalConfig.menu.sections.modules)

Allows to query a WFS(❗) layer decoupled from the search bar using filters and to create a form if necessary.
It is assumed that a stored query is used when using a WFS@2.0.0. When using a WFS@1.1.0, it is assumed that the way the WFS should be filtered is defined through the configuration.

Multiple **[SearchInstances](#portalconfigmenusectionsmoduleswfssearchsearchinstance)** can be defined, which will be selectable through a dropdown menu.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|instances|yes|**[searchInstance](#portalconfigmenusectionsmoduleswfssearchsearchinstance)**[]||Array of `searchInstances`. A singular **[searchInstance](#portalconfigmenusectionsmoduleswfssearchsearchinstance)** corresponds to its own search form.|false|
|zoomLevel|no|Number|5|Specifies to which zoom level zooming is to be performed. If the feature does not fit into the zoom level, a suitable zoom level is automatically selected.|false|
|resultsPerPage|no|Number|0|The search result list will at most show this amount of results at a time. Further results will be offered on separate result pages. 0 means display all on one page at the same time.|false|
|multiSelect|no|Boolean|false|If `true`, a user may select multiple features from the result list by either pressing Strg/Shift or using checkboxes; when zooming, all selected features will be shown.|false|

**Example**

```json
{
    {
        "type": "wfsSearch",
        "instances": [
            {
                "requestConfig": {
                    "layerId": "1234"
                },
                "selectSource": "https://geoportal-hamburg.de/lgv-config/gemarkungen_hh.json",
                "literals": [
                    {
                        "clause": {
                            "type": "and",
                            "literals": [
                                {
                                    "field": {
                                        "queryType": "equal",
                                        "fieldName": "gemarkung",
                                        "inputLabel": "District",
                                        "options": ""
                                    }
                                },
                                {
                                    "field": {
                                        "queryType": "equal",
                                        "fieldName": "flur",
                                        "inputLabel": "Cadastral District",
                                        "options": "flur"
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    }
}
```

***

###### portalConfig.menu.sections.modules.wfsSearch.searchInstance {data-toc-label='Search Instance'}

[type:Literal]: # (Datatypes.Literal)
[type:ResultList]: # (Datatypes.ResultList)
[type:RequestConfig]: # (Datatypes.RequestConfig)
[type:Suggestions]: # (Datatypes.Suggestions)

A singular instance of the WFS Search which is selectable through a dropdown.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|literals|yes|**[Literal](#datatypesliteral)**[]||Array of `literals`.|true|
|requestConfig|yes|**[RequestConfig](#datatypesrequestconfig)**||An object, which mainly contains the id of the service (`layerId` or `restLayerId`) that is supposed to be requested. If a WFS@2.0.0 will be used, the `storedQueryId` needs to be provided as well. Additionally, further options for requests can be set.|false|
|selectSource|no|String||Optional Url leading to the expected options for the different inputs. See **[https://geoportal-hamburg.de/lgv-config/gemarkungen_hh.json]** for an example.|false|
|suggestions|no|**[Suggestions](#datatypessuggestions)**||If given, the service will be queried whenever a user inserts values into an input field to suggest a value.|false|
|title|yes|String||Title of the search instance to be displayed in a dropdown inside the tool.|false|
|userHelp|no|String||Information text regarding the search form to be displayed to the user. If not given, it will be generated from the structure of the config. May be a translation key. If the value is explicitly set to `hide`, no information regarding the structure of the form will be displayed.|false|
|resultDialogTitle|no|String||Heading of the result list. If not configured the name `WFS search` will be displayed. May be a translation key.|false|
|resultList|no|**[ResultList](#datatypesresultlist)**||Settings for the output of the found features in the result list. If no resultList is configured, the search will zoom directly to the first feature found.|true|

**Example**

```json
{
    "requestConfig": {
        "layerId": "1234"
    },
    "resultList": {
        "schulname": "School name",
        "abschluss": "Degree"
    },
    "selectSource": "https://geoportal-hamburg.de/lgv-config/gemarkungen_hh.json",
    "title": "Parcel Search",
    "literals": [
        {
            "clause": {
                "type": "and",
                "literals": [
                    {
                        "field": {
                            "queryType": "equal",
                            "fieldName": "gemarkung",
                            "inputLabel": "District",
                            "options": ""
                        }
                    },
                    {
                        "field": {
                            "queryType": "equal",
                            "fieldName": "flur",
                            "inputLabel": "Cadastral District",
                            "options": "flur"
                        }
                    }
                ]
            }
        }
    ]
}
```

***

##### portalConfig.menu.sections.modules.wfst {data-toc-label='WFS-T'}

[inherits]: # (portalConfig.menu.sections.modules)

WFS-T module to visualize (*getFeature*), create (*insert*), update (*update*) and delete (*delete*) features of a Web Feature Service (*WFS*) which is able to receive transactions.
To use this tool, a WFS-T layer must be provided in version 1.1.0. For more configuration information see **[services.json](../Global-Config/services.json.md)**.

When editing properties of a feature / adding properties to a new feature, the available values including its label are based on the layers configured `gfiAttributes`. For more information see **[services.json](../Global-Config/services.json.md)**.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|delete|no|[TransactionConfig](#portalconfigmenusectionsmoduleswfsttransactionconfig)/Boolean|false|Defines which layers of `layerIds` allow delete transactions.|false|
|icon|no|String|"bi-globe"|Icon that is shown in front of the module-name in the menu. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|layerIds|yes|String[]||Array of layer-ids defined in **[services.json](../Global-Config/services.json.md)**.|false|
|layerSelectLabel|no|String|"common:modules.wfst.layerSelectLabel"| Please set the value directly in the language files. If given, overrides the value set for the label of the layer select box. May be a locale key.|false|
|lineButton|no|[TransactionConfig](#portalconfigmenusectionsmoduleswfsttransactionconfig)[]/Boolean|[]|Defines which layers of `layerIds` allow insert transactions of line geometries.|false|
|name|no|String|"common:modules.wfst.name"|Tool name shown in the portal.|false|
|pointButton|no|[TransactionConfig](#portalconfigmenusectionsmoduleswfsttransactionconfig)[]/Boolean|[]|Defines which layers of `layerIds` allow insert transactions of point geometries.|false|
|polygonButton|no|[TransactionConfig](#portalconfigmenusectionsmoduleswfsttransactionconfig)[]/Boolean|[]|Defines which layers of `layerIds` allow insert transactions of polygon geometries.|false|
|showConfirmModal|no|Boolean|false|Flag if the modal dialog should be shown.|false|
|toggleLayer|no|Boolean|false|Whether the features of the currently selected layer should stay visible when adding a new feature.|false|
|type|no|String|"wfst"|The type of the module. Defines which module is configured.|false|
|update|no|[TransactionConfig](#portalconfigmenusectionsmoduleswfsttransactionconfig)/Boolean|false|Defines which layers of `layerIds` allow update transactions.|false|

**Example**

```json
{
    "type": "wfst",
    "name": "common:modules.wfst.name",
    "icon": "bi-globe",
    "layerIds": ["1234", "5678", "4389"],
    "toggleLayer": true,
    "pointButton": [
        {
            "layerId":"1234",
            "caption": "Point test",
            "available": true
        },
        {
            "layerId": "5678",
            "available": true,
            "multi": true
        }
    ],
    "lineButton": false,
    "polygonButton": [
        {
            "layerId": "4389",
            "available": false
        }
    ],
    "update": [
        {
            "layerId": "4389",
            "available": true
        }
    ]
}
```

***

###### portalConfig.menu.sections.modules.wfst.TransactionConfig {data-toc-label='Transaction Config'}
Specific configuration for transaction methods of given layers.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|available|yes|Boolean|true|Availability of the transaction method for the layer with the given id.|false|
|icon|no|String||Bootstrap icon displayed inside the button. If no value is specified, it defaults to the default value configured for the transaction method. For selection see **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|layerId|yes|String||Layer the transaction method is being configured for.|false|
|multi|no|Boolean|false|Whether the drawn geometries of this layer should be Multi-X.  This parameter does not have any use for `update` and `delete`.|false|
|text|no|String|"common:modules.wfst.interactionSelect.*"|Button text. If no value is given, `*` will be replaced with a standard value depending on the configured button. May be a locale key.|false|

**Examples**

```json
{
    "layerId": "1234",
    "available": true,
    "text": "Point test"
}
```

```json
{
    "layerId": "5678",
    "available": true
}
```

```json
{
    "layerId": "5489",
    "multi": true
}
```

***

#### portalConfig.menu.title {data-toc-label='Portal Title'}
The menu bar allows showing a portal name and portal image.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|link|no|String||URL of an external website to link to.|false|
|logo|no|String||Path to an external image file. If no image is set, the title will be shown without an accompanying logo.|false|
|text|no|String||Portal name.|false|
|toolTip|no|String||Shown on hovering the portal logo.|false|

**Example portalTitle**

```json
"title": {
    "text": "Master",
    "logo": "https://geodienste.hamburg.de/lgv-config/img/hh-logo.png",
    "link": "https://geoinfo.hamburg.de",
    "toolTip": "Landesbetrieb Geoinformation und Vermessung"
}
```

***

### portalConfig.portalFooter {data-toc-label='Portal Footer'}
Possibility to configure the content of the portal footer.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|configPaths|no|String[]|["portalConfig.portalFooter"]|Path array of possible config locations. First one found will be used.|false|
|scaleLine|no|Boolean|true|Shows if Scale should be shown in footer.|false|
|scaleLineWidth|no|Number|2|Width of the scale line in cm.|false|
|seperator|no|String|"` \| `"|The seperator between urls.|false|
|urls|no|**[urls](#portalconfigportalfooterurls)**[]|[]|Urls, that should be displayed in the footer.|false|

**Beispiel**

```json
"portalFooter": {
    "urls": [
    {
        "bezeichnung": "common:modules.portalFooter.designation",
        "url": "https://geoinfo.hamburg.de/",
        "alias": "Landesbetrieb Geoinformation und Vermessung",
        "alias_mobile": "LGV Hamburg"
    },
    {
        "url": "mailto:LGVGeoPortal-Hilfe@gv.hamburg.de?subject=Kartenunstimmigkeiten%20melden&body=Zur%20weiteren%20Bearbeitung%20bitten%20wir%20Sie%20die%20nachstehenden%20Angaben%20zu%20machen.%20Bei%20Bedarf%20fügen%20Sie%20bitte%20noch%20einen%20Screenshot%20hinzu.%20Vielen%20Dank!%0A%0A1.%20Name:%0A2.%20Telefon:%0A3.%20Anliegen",
        "alias": "common:modules.portalFooter.mapDiscrepancy"
    }
    ],
    "scaleLine": true
}
```

#### portalConfig.portalFooter.urls {data-toc-label='Urls'}

A Url can be defined in various ways.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|alias|yes|String||Displayed name of the link in desktop-view.|false|
|alias_mobil|no|String||Displayed name of the link in mobile-view. If this is not specified, the link will not be displayed in mobile-view.|false|
|bezeichnung|no|String||Displayed description next to the link.|false|
|url|yes|String||The Url for the link.|false|

**Beispiel**

```json
{
    "bezeichnung": "common:modules.portalFooter.designation",
    "url": "https://geoinfo.hamburg.de/",
    "alias": "Landesbetrieb Geoinformation und Vermessung",
    "alias_mobile": "LGV Hamburg"
}
```

***

### portalConfig.tree {data-toc-label='Tree'}
Possibility to make settings for the topic selection tree.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|addLayerButton|no|**[addLayerButton](#portalconfigtreeaddlayerbutton)**|false|If active:true, a button for adding layers will be displayed. Initially only visible layers and layers with the property `showInLayerTree = true` are shown in the topic tree. If false, then all configured layers are shown in the topic tree. With the tree.type `auto` an add button is always shown. |false|
|categories|no|**[categories](#portalconfigtreecategories)**||Configuration of the categories from the metadata. Only for the tree.type `auto`.|false|
|highlightedFeatures|no|**[highlightedFeatures](#portalconfigtreehighlightedfeatures)**||Configuration in addition to highlighting features.|false|
|layerIDsToIgnore|no|String[]||List of `services.json` layer ids that should not be displayed in the tree and map. Only for the tree.type `auto`.|false|
|layerIDsToStyle|no|**[layerIDsToStyle](#portalconfigtreelayeridstostyle)**[]||Special implementation for a HVV service (Hamburger Verkehrsbetriebe). Contains objects to query different styles of a layer ID.|true|
|metaIDsToIgnore|no|String[]||All layers found in `services.json` that match these meta IDs will not be displayed in the tree and map. Only for the tree.type `auto`.|false|
|metaIDsToMerge|no|String[]||All layers found in `services.json` that match these meta-IDs will be merged into a single layer in the tree. Only for the tree.type `auto`.|true|
|showFolderPath|no|Boolean|false|Determines whether the folder structure of visible layers is displayed in 'Show more functions'.|false|
|singleBaselayer|no|Boolean|false|Specifies whether only one base layer may be active at any time.|false|
|type|no|enum["auto"]||The topic tree is built in the same structure as the **[topicconfig](#layerconfig)**. If the type `auto` is configured, all layers from the [services.json](../Global-Config/services.json.md) are offered in the tree, structured by their metadata (Geo-Online).|false|
|validLayerTypesAutoTree|no|enum|["WMS", "SENSORTHINGS", "TERRAIN3D", "TILESET3D", "OBLIQUE"]|Layer types to be used with the tree.type `auto`.|false|
|hideBackgroundsHeader|no|Boolean|false|Set to true to hide the backgrounds headline.|false|
|backgroundsHeaderText|no|String||Alternativ backgrounds headline. If set, a none empty string is required. An empty string will output the default i18n string/translation.|false|
|hideDatalayerHeader|no|Boolean|false|Set to true to hide the datalayer headline.|false|
|datalayerHeaderText|no|String||Alternativ datalayer headline. If set, a none empty string is required. An empty string will output the default i18n string/ translation.|false|
|subMenuContactButton|no|Boolean|true|Defines if the button to open the contact form with layer specific parameters is shown|false|

**Example type auto**

```json
{
    "tree": {
        "type": "auto",
        "validLayerTypesAutoTree": ["WMS", "WFS"],
        "layerIDsToIgnore": ["1912", "1913"],
        "metaIDsToIgnore": [
            "09DE39AB-A965-45F4-B8F9-0C339A45B154"
        ],
        "metaIDsToMerge": [
            "FE4DAF57-2AF6-434D-85E3-220A20B8C0F1"
        ],
        "layerIDsToStyle": [
        {
            "id": "1935",
            "styles": ["geofox_Faehre", "geofox-bahn", "geofox-bus", "geofox_BusName"],
            "name": ["Fährverbindungen", "Bahnlinien", "Buslinien", "Busliniennummern"],
            "legendURL": ["http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-faehre.png", "http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bahn.png", "http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bus.png", "http://87.106.16.168/legende_mrh/hvv-bus.png"]
        },
        "categories": [
        {
          "key": "kategorie_opendata",
          "name": "common:modules.layerTree.categoryOpendata",
          "active": true
        },
        {
          "key": "kategorie_inspire",
          "name": "common:modules.layerTree.categoryInspire"
        },
        {
          "key": "kategorie_organisation",
          "name": "common:modules.layerTree.categoryOrganisation"
        }
      ],
        "hideBackgroundsHeader": true,
        "backgroundsHeaderText": "This should not appear on output",
        "hideDatalayerHeader": false,
        "datalayerHeaderText": "Specific heading for datalayers across all languages - overwrites i18n"
    }
}
```

**Example no type**

```json
{
    "tree": {
        "addLayerButton": {
            "active": true
        },
        "highlightedFeatures": {
            "active": false
        },
    }
}
```

***

#### portalConfig.tree.addLayerButton {data-toc-label='Add Layer Button'}
Configuration of the addLayerButton to select layers.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|active|yes|Boolean||Controls if addLayerButton is shown or not.|false|
|searchBar|no|**[searchBar](#markdown-header-portalconfigtreeaddlayerbuttonsearchbar)**/Boolean|false|If active:true then a search within the configured searchInterfaces and searchCategory is possible.|false|
|buttonTitle|no|String||Sets the button title with customized text.|false|
|searchInterfaceInstanceId|no|String||Deprecated in next major release - use **[searchInterfaceInstances](#markdown-header-portalconfigtreeaddLayerButtonsearchBarsearchInterfaceInstances) []** instead. Id of the search interface. Configured on the search interface at the parameter 'searchInterfaceId'.|true|
|searchCategory|no|String||Deprecated in next major release - use **[searchInterfaceInstances](#markdown-header-portalconfigtreeaddLayerButtonsearchBarsearchInterfaceInstances) []** instead. The category of the search.|true|

**Beispiel**

```json
{
    "tree": {
        "addLayerButton": {
            "active": true,
            "buttonTitle": "Add Layers",
            "searchBar": {
                "active": true,
               "searchInterfaceInstances": [
                {
                    "id":"elasticSearch_0",
                    "searchCategory": "Thema (externe Fachdaten)"
                },
                {
                    "id": "topicTree",
                    "searchCategory": "Thema"
                }
            ]
        }
    }
}
```
```json
{
    "tree": {
        "addLayerButton": {
            "active": true,
            "buttonTitle": "Layer hinzufügen",
            "searchBar": {
            "active": true,
            "searchInterfaceInstanceId": "elasticSearch_0",
            "searchCategory": "Thema (externe Fachdaten)"
        }
    }
}
```

***
#### portalConfig.tree.addLayerButton.searchBar
A topic search is enabled within the configured SearchInterface and SearchCategory.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|active|yes|Boolean||Specifies whether the search is displayed.|false|
|searchInterfaceInstances|ja|**[searchInterfaceInstances](#markdown-header-portalconfigtreeaddLayerButtonsearchBarsearchInterfaceInstances) []**||List of search interfaces from the searchbar that are to be used here.|true|

**Beispiel**

```json
{
   "searchBar": {
        "active": true,
        "searchInterfaceInstances": [
            {
                "id":"elasticSearch_0",
                "searchCategory": "Thema (externe Fachdaten)"
            },
            {
                "id": "topicTree",
                "searchCategory": "Thema"
            }
        ]
    }
}
```

***
#### portalConfig.tree.addLayerButton.searchBar.searchInterfaceInstances
List of search interfaces from the searchbar that are to be used here.
The search only works with interfaces that perform a topic search.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|id|yes|String||Id des Suchinterfaces. Konfiguriert an dem Suchinterface am Parameter 'searchInterfaceId'.|false|
|searchCategory|yes|String||the search category.|false|

**Beispiel**

```json
{
    "searchInterfaceInstances": [
        {
            "id":"elasticSearch_0",
            "searchCategory": "Thema (externe Fachdaten)"
        },
        {
            "id": "topicTree",
            "searchCategory": "Thema"
        }
    ]
}
```

***

#### portalConfig.tree.categories {data-toc-label='Categories'}
Configuration of the categories from the metadata. Only for the tree.type `auto`.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|key|yes|String||Key of the respective category in the metadata.|false|
|name|yes|String||Name of the categorie.|false|
|active|no|Boolean||Indicates whether this category is initially active. If not specified, the 1st category is initially active.|false|

**Example**

```json
 "categories": [
        {
          "key": "categorie_opendata",
          "name": "common:modules.layerTree.categoryOpendata",
          "active": true
        },
        {
          "key": "categorie_inspire",
          "name": "common:modules.layerTree.categoryInspire"
        },
        {
          "key": "categorie_organisation",
          "name": "common:modules.layerTree.categoryOrganisation"
        }
      ]
```

***

#### portalConfig.tree.highlightedFeatures {data-toc-label='Highlighted Features'}
Configuration in addition to highlighting features. If features are highlighted with the "List" or "Select Features" module with "Zoom to this Feature" or via url parameter, then a layer with these features is selectable in the menu tree.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|active|no|Boolean|false|Indicates whether this feature is active.|false|
|layerName|no|String|"common:tree.selectedFeatures"|Name of the created layer with the highlighted features. The name additionally contains the name of the module that was worked with.|true|

**Example**

```json
"highlightedFeatures": {
    "active": false,
    "layerName": "Selected features"
},
```

***

#### portalConfig.tree.layerIDsToStyle {data-toc-label='Layer IDs To Style'}
Special implementation for a HVV service (Hamburger Verkehrsbetriebe). Contains objects to query different styles of a layer ID. Only for the tree.type `auto`.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|id|no|String||A `services.json` layer's id.|false|
|styles|no|String/String[]||Style to use as a string; if multiple styles are to be used, they are listed in an array.|false|
|name|no|String/String[]||Name to use as a string; if multiple names are to be used, they are listed in an array.|false|
|legendUrl|no|String/String[]||URL of the legend image as a string ; if multiple legend images are to be used, their URLs are listed in an array.|false|

**Example:**

```json
{
    "layerIDsToStyle": [
        {
            "id": "1935",
            "styles": ["geofox_Faehre", "geofox-bahn", "geofox-bus", "geofox_BusName"],
            "name": ["Fährverbindungen", "Bahnlinien", "Buslinien", "Busliniennummern"],
            "legendURL": ["http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-faehre.png", "http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bahn.png", "http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bus.png", "http://87.106.16.168/legende_mrh/hvv-bus.png"]
        }
    ]
}
```

***

## layerConfig {data-toc-label='Layer Config'}
The `layerConfig` entry defines the contents and their order in the topic selection. The following properties can be configured:

1. Layers containing background maps (*baselayer*)
2. Layers containing subject data (*subjectlayer*)

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|baselayer|no|**[baselayer](#layerconfigbaselayer)**||Layers containing background maps.|false|
|subjectlayer|no|**[subjectlayer](#layerconfigsubjectlayer)**||Layers containing subject data.|false|

**Example**

```json
{
    "layerConfig": {
        "baselayer": {},
        "subjectlayer": {}
    }
}
```

***

### layerConfig.baselayer {data-toc-label='Base Layer'}

[type:elements]: # (layerConfig.elements)

Here you define layers to be displayed as background maps.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|elements|no|**[elements](#layerconfigelements)**[]||Definition of the layers to be displayed as background maps in the topic tree.|false|

**Example**

```json
{
    "layerConfig": {
        "baselayer": {}
    }
}
```

***

### layerConfig.subjectlayer {data-toc-label='Subject Layer'}

[type:elements]: # (layerConfig.elements)

Layers or folders with layers to be displayed as subject data are defined here.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|elements|no|**[elements](#layerconfigelements)**[]||Definition of the layers or folders to be displayed in the topic tree as subject data.|false|

**Example**

```json
{
    "layerConfig": {
        "subjectlayer": {}
    }
}
```

***

### layerConfig.elements {data-toc-label='Elements'}

[type:elements]: # (layerConfig.elements)

Layers or folders are defined here. Folders can in turn contain **[elements](#layerconfigelements)** with folders or layers.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|elements|no|**[elements](#layerconfigelements)**[]||Next layer with layers or folders under the type `folder`.|false|
|name|no|String|""|Layer or folder name.|false|
|type|no|String|"layer"|Type of the element: "layer" or "folder"|false|

**Example baselayer**

```json
{
    "layerConfig": {
        "baselayer": {
            "elements": [
                {
                    "id": "123"
                }
            ]
        }
    }
}
```

**Example subjectlayer**

```json
{
    "layerConfig": {
        "subjectlayer": {
            "elements": [
                {
                    "id": "123",
                    "type": "layer"
                }
            ]
        }
    }
}
```

**Example with folders and layers**

```json
{
"elements": [
        {
        "name": "Folder level 1",
        "type": "folder",
        "elements": [
                {
                "name": "Folder level 2",
                "type": "folder",
                "elements": [
                        {
                            "id": "2431"
                        },
                        {
                            "id": "2430"
                        },
                        {
                            "id": "2429"
                        },
                        {
                            "name": "Folder level 3",
                            "type": "folder",
                            "elements": [
                                {
                                    "id": "1103"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}
```

***

#### layerConfig.elements.layers {data-toc-label='Layers'}

[inherits]: # (layerConfig.elements)

Here layers of different types are configured. Layers can be configured in many different ways. Most of the attributes are defined in **[services.json](../Global-Config/services.json.md)**, but can be overridden here at the layer.
Besides these attributes, there are also type-specific attributes for the different layer types.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|autoRefresh|no|Integer||Automatically reload layer every `autoRefresh` ms. Minimum value is 500.|false|
|capabilitiesUrl|no|String||**[services.json](../Global-Config/services.json.md)** value. Service's capabilities URL|false
|fitCapabilitiesExtent|no|Boolean|false|**[services.json](../Global-Config/services.json.md)** value. When set to `true` and a `capabilitiesUrl` is specified in the configuration, the application will fit the map extent based on the bounding box information retrieved from the GetCapabilities document.|false|
|id|yes|String/String[]||Id of the layer. The ids are resolved in **[services.json](../Global-Config/services.json.md)** and the necessary information is used. When configuring an array of Ids, a layer is created that contains the LAYERS parameter in the request with a comma-separated list of the contents of the `layers` attribute of the individual layers. Setting `minScale` and `maxScale` of each layer is required to be in the `services.json`. It is important here that the specified ids address the same URL, i.e. use the same service and are of same typ. With the special character `.` as suffix, a LayerId can be used multiple times. Each LayerId marked with a suffix creates its own entry in the topic tree.|false|
|isPointLayer|no|Boolean|false|Whether the (vector) layer only consists of point features (only relevant for WebGL rendering)|false|
|name|no|String||Layer name.|false|
|preview|no|**[preview](#layerconfigelementslayerspreview)**||Preview for baselayers of type WMS, WMTS and VectorTile. WMS and WMTS: if not specified, a centered map section is loaded.|false|
|renderer|no|String|"default"|Which render pipeline to use ("default" or "webgl") (only for vector data of type "GeoJSON", "WFS", "OAF"). "webgl" is currently classified as experimental and can lead to errors in some modules|false|
|showInLayerTree|no|Boolean|false|If true, then the layer is initially displayed in the topic tree. If portalConfig.tree.addLayerButton is not configured, then this attribute has no effect.|false|
|transparency|no|Integer|0|Layer transparency.|false|
|type|no|String|"layer"|Type of the lement: "layer" or "folder"|false|
|urlIsVisible|no|Boolean|true|Whether the service URL should be shown in the layer information window.|false|
|visibility|no|Boolean|false|Layer visibility.|false|

**Example**

```json
{
    "elements": [
        {
            "id": "2",
            "name": "Example Layer",
            "typ": "WMS",
            "visibility": false,
            "styleId": "3"
        }
    ]
}
```

**Example with an array of IDs**

```json
{
"elements": [
        {
            "id": ["123", "456", "789"],
            "name": "My test layer"
        }
    ]
}
```

**Example layerId 8712 with suffix**

```json
{
"elements": [
        {
          "id": "8712.1",
          "styleId": "8712.1",
          "name": "Grundschulen",
          "wfsFilter": "resources/xml/schulstandort.staatlich.5.grundschulen.xml"
        },
        {
          "id": "8712.2",
          "styleId": "8712.2",
          "name": "Stadtteilschulen",
          "wfsFilter": "resources/xml/schulstandort.staatlich.5.stadtteilschulen.xml",
        },
        {
          "id": "8712.3",
          "styleId": "8712.3",
          "name": "Gymnasien",
          "wfsFilter": "resources/xml/schulstandort.staatlich.5.gymnasien.xml"
        },
        {
          "id": "8712.4",
          "styleId": "8712.4",
          "name": "Sonderschulen",
          "wfsFilter": "resources/xml/schulstandort.staatlich.5.sonderschulen.xml"
        }
    ]
}
```

***

#### layerConfig.elements.layers.preview {data-toc-label='Preview'}

[inherits]: # (layerConfig.elements.layers)

Preview for baselayer in theme tree, also used in **[baselayerSwitcher](#portalconfigmapbaselayerswitcher)**.
For the **[VectorTile](#layerconfigelementslayersvectortile)**, **[WMS](#layerconfigelementslayersrasterwms)** and WMTS layer types.
With the VectorTile layer a dropped preview image is displayed, with WMS and WMTS layers a map section is loaded. WMS and WMTS: if not specified, a centered map section is loaded. A detailed description is available in the documentation **[LayerPreview](../../Dev/vueComponents/LayerPreview.md)**

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|center|no|Number[]/String[]||Center coordinates for the preview image loading parameters. Default is the center of the map extent.|false|
|checkable|no|Boolean|false|If `true`, then the preview image is usable as checkbox.|false|
|customClass|no|String||Custom css class to override the style, NOTE: may need to use '!important'.|false|
|radius|no|Number|1000|Radius of the extent in meters.|false|
|src|no|String||Only for type 'VectorTile'. Path to the image to be previewed.|false|
|zoomLevel|no|Number||Zoom level from which the resolution for the loading parameters of the preview image are determined. Default is the initial zoomLevel of the map.|false|

**Example VectorTile**

```json
"preview":{
    "src": "./resources/vectorTile.png"
    }
```

**Example WMS**

```json
 "preview": {
    "zoomLevel": 6,
    "center": "566245.97,5938894.79",
    "radius": 500
    }
```

***

##### layerConfig.elements.layers.Group {data-toc-label='Group'}

[inherits]: # (layerConfig.elements.layers)

A group layer is created that contains all layers of the specified ids.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|id|yes|String[]||Ids of the layers to be grouped, these must be contained in the **[services.json](../Global-Config/services.json.md)**. They can have different types (field `typ`).|false|
|typ|yes|String|"GROUP"|Sets the layer typ to GROUP, which can group layers.|false|
|children|no|Object[]||Attributes on the grouped layers can be overwritten in `children`. Exception: `visibility` is not overwritten. All ids in the id array must have an equivalent in the `children`.|false|


**Example without children**
```json
 {
    "id": [ "20501", "20502", "20503", "20504" ],
    "typ": "GROUP",
    "name": "Leisure routes and long-distance cycle routes group",
    "styleId": "4515"
}
```
**Example with children**

```json
{
    "id": [ "27926", "1711", "18104"],
    "typ": "GROUP",
    "name": "Group OAF, WFS, SensorThings",
    "visibility": false,
    "children" :[
        {
            "id": "27926",
            "styleId": "8712",
            "typ": "OAF",
            "gfiTheme": "schulinfo"
        },
        {
            "id": "1711",
            "styleId": "1711",
            "typ": "WFS"
        },
        {
            "id": "18104",
            "styleId": "18104",
            "typ": "SensorThings"
        }
    ]
}
```

***

#### layerConfig.elements.layers.Raster {data-toc-label='Raster'}

[inherits]: # (layerConfig.elements.layers)

Raster layer typical attributes are listed here. Raster layers are of type **[StaticImage](#layerconfigelementslayersrasterstaticimage)**, **[WMS](#layerconfigelementslayersrasterwms)**, WMSTime and WMTS.

***

##### layerConfig.elements.layers.Raster.StaticImage {data-toc-label='Static Image'}

[inherits]: # (layerConfig.elements.layers.Raster)

StaticImage can be used to load images as layers and display them georeferenced on the map. The formats jpeg and png are supported.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|extent|yes|**[Extent](#datatypesextent)**|[560.00, 5950.00, 560.00, 5945.00]|Specifies the georeferencing of the image. The coordinate pair expected in EPSG:25832 format is the coordinate for the top left and bottom right corner of the image.|false|
|id|yes|String||A unique ID must be assigned among all layers.|false|
|typ|yes|String|"StaticImage"|Sets the layer type to StaticImage, which can display static images as layers.|false|
|url|yes|String|"https://meinedomain.de/bild.png"|Link to the image to be displayed.|false|


**Example**
```json
{
    "id": "4811",
    "typ": "StaticImage",
    "url": "https://www.w3.org/Graphics/PNG/alphatest.png",
    "name": "Testing PNG file",
    "visibility": true,
    "extent": [560296.72, 5932154.22, 562496.72, 5933454.22]
}
```

***

##### layerConfig.elements.layers.Raster.WMS {data-toc-label='WMS'}

[inherits]: # (layerConfig.elements.layers.Raster)

WMS typical attributes are listed here.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|no|String/String[]||Name of the layer. If the **styles** attribute is configured, this attribute must be configured as Tpy String[].|false|
|extent|no|**[Extent](#datatypesextent)**|[454591, 5809000, 700000, 6075769]|Extent of the layer. If not specified, it will be used extent of the map view.|false|
|featureCount|no|Number|1|Number of features to return on a GetFeatureInfo query.|false|
|gfiAsNewWindow|no|**[gfiAsNewWindow](#layerconfigelementslayersrasterwmsgfiasnewwindow)**|null|Considered only if infoFormat is text/html.|true|
|styles|no|String[]||If styles are specified, they are also sent to the WMS. The server interprets these styles and returns the data accordingly.|true|

**Example**

```json
{
    "id": "4711",
    "name": ["MyFirstWMSLayerName", "MySecondWMSLayerName"],
    "transparency": 0,
    "visibility": true,
    "featureCount": 2,
    "gfiAsNewWindow": {
        "name": "_blank",
        "specs": "width=800,height=700"
    },
    "styles": ["firstStyle", "secondStyle"]
}
```

***

###### layerConfig.elements.layers.Raster.WMS.gfiAsNewWindow {data-toc-label='gfiAsNewWindow'}

[inherits]: # (layerConfig.elements.layers.Raster)

The parameter `gfiAsNewWindow` is only in use when `infoFormat` is set to `"text/html"`.

This feature allows opening WMS HTML responses in their own window or tab rather than in an iFrame or GFI. To open HTML contents in a standard browser window, set the empty object `{}` instead of `null`.

You may change the opening behaviour by setting the parameter `name`:

**Note on SSL encryption**

If `gfiAsNewWindow` is not defined, it's applied with default values when the called URL is not SSL-encrypted (HTTPS).

Due to the *No Mixed Content* policy of all modern browsers, unencrypted content may not be displayed in an iFrame. Please mind that automatic forwarding (e.g. in Javascript) in iFrames to an insecure HTTP connection (without SSL) is not automatically recognized and may be prevented by the browser.

For such cases, define `gfiAsNewWindow` manually as described above.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|yes|enum["_blank_","_self_"]|"_blank"|`"_blank"` opens a new browser tab or window (depending on browser) with the specified HTML content. The window appearance can be changed with the `specs` parameter. `"_self"` opens the specified HTML content within the current browser window.|true|
|specs|no|String||You may add an arbitrary amount of comma-separated properties like `{"specs": "width=800,height=700"}`. For more options, please read the documentation regarding `javascript` and `window.open`: [W3 Schools: Met win open](https://www.w3schools.com/jsref/met_win_open.asp) (German), [JavaScript Info: Popup windows](https://javascript.info/popup-windows) (English), [MDN: Window open](https://developer.mozilla.org/en-US/docs/Web/API/Window/open) (English)|true|

**Example**

```json
{
    "id": "4711",
    "gfiAsNewWindow": {
        "name": "_blank",
        "specs": "toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=500,width=800,height=700"
    }
}
```

***

#### layerConfig.elements.layers.Vector {data-toc-label='Vector'}

[inherits]: # (layerConfig.elements.layers)

Vector typical attributes are listed here. Vector layers are of type **[WFS](#layerconfigelementslayersvectorwfs)**, GeoJSON (only in EPSG:4326), **[SensorLayer](../../Dev/sensorThings.md)** and OAF.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|additionalInfoField|no|String|"name"|Attribute name of the feature for the hitlist in the searchbar. If the attribute does not exist, the layer name is specified.|false|
|clusterDistance|no|Integer||Pixel radius. Within this radius all features are "clustered" to one feature. ⚠️ clusterDistance for WFS layers with polygon or line geometry will result in the features not being displayed.|false|
|hitTolerance|no|String||Click tolerance at which a hit is triggered for the GetFeatureInfo query.|false|
|loadingStrategy|no|String|"bbox"|LLoading strategy for loading the features. Possible values are "bbox" or "all". **[see](https://openlayers.org/en/latest/apidoc/module-ol_loadingstrategy.html)**.|false|
|mouseHoverField|no|String/String[]||Attribute name or array of attribute names to be displayed when the user hovers over a feature.|false|
|nearbyTitle|no|String/String[]||Attribute name or array of attribute names to be displayed as title in the result list during the proximity search.|false|
|searchField|no|String||Attribute name for which the searchbar searches this layer.|false|
|styleGeometryType|no|String/String[]||Geometry types for a WFS style, if only certain geometries of a layer are to be displayed **[see](../Global-Config/style.json.md#display-rules)**.|false|
|styleId|yes|String||Id that defines the style. Id is resolved in the **[style.json](../Global-Config/style.json.md)**.|false|
|isNeverVisibleInTree|no|Boolean||A parameter for layer config to supply an option to hide the layer in tree. If true, the layer will not be visible in tree.|false|

**Example**

```json
{
"elements": [
          {
            "id": "22078",
            "name": "Bewohnerparkgebiete Hamburg",
            "typ": "WFS",
            "visibility": false,
            "styleId": "22078",
            "styleField": "bewirtschaftungsart",
            "searchField": "bwp_name",
            "mouseHoverField": [
                "bwp_name",
                "bewirtschaftungsart"
            ],
            "isNeverVisibleInTree": false
        },
        {
            "id" : "11111",
            "name" : "lokale GeoJSON",
            "url" : "portal/master/test.json",
            "typ" : "GeoJSON",
            "gfiAttributes" : "showAll",
            "layerAttribution" : "nicht vorhanden",
            "legend" : true
        }
    ]
}
```

***

##### layerConfig.elements.layers.Vector.WFS {data-toc-label='WFS'}

[inherits]: # (layerConfig.elements.layers.Vector)

Attributes for the WFS search at highlightFeaturesByAttribute. For the call parameters see **[urlParameter](../Misc/urlParameter.md)**.
```
Example calls:
?api/highlightFeaturesByAttribute=1&wfsId=1&attributeName=DK5&attributeValue=valueToSearchFor&attributeQuery=isequal
?api/highlightFeaturesByAttribute=123&wfsId=1711&attributeName=name&attributeValue=Helios%20ENDO-Klinik%20Hamburg&attributeQuery=IsLike
?api/highlightFeaturesByAttribute=123&wfsId=2003&attributeName=gebietsname&attributeValue=NSG%20Zollenspieker&attributeQuery=isequal
?api/highlightFeaturesByAttribute=123&wfsId=2928&attributeName=biotop_nr&attributeValue=279&attributeQuery=isLike
```

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|escapeChar|yes|String||The escape character for the WFS query - e.g. \||true|
|featurePrefix|yes|String||Search prefix for the WFS query - e.g. app:.|true|
|singleChar|yes|String||The single character for the WFS query - e.g. #|true|
|valueDelimiter|no|String|";"|The value delimiter for isIn queries attributeValue.|true|
|wildCard|yes|String||The wildcard character for the WFS query -e.g. %|true|

**Example**

```json
{
    "id": "1",
    "visibility": false,
    "name": "Animal species invasive",
    "featurePrefix": "app:",
    "wildCard": "%",
    "singleChar": "#",
    "escapeChar": "!"
}
```

***

#### layerConfig.elements.layers.VectorTile {data-toc-label='VectorTile'}

[inherits]: # (layerConfig.elements.layers)

VectorTile typical attributes are listed here.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|useMpFonts|no|Boolean|true|Only available in a *Vector Tile Layer*. Switch to overwrite Fontstacks of external style definitions, to assure needed fonts are available. If set to false, used fonts need to be added separately e.g. via '<link rel=stylesheet ...>' in index.html |false|
|vtStyles|no|**[vtStyle](#layerconfigelementslayersvectortilevtstyle)**[]||Choosable external style definitions.|false|

**Example**

```json
{
  "id": "123",
  "name": "Vectortile layer name",
  "epsg": "EPSG:3857",
  "url": "https://example.com/3857/tile/{z}/{y}/{x}.pbf",
  "typ": "VectorTile",
  "vtStyles": [
    {
      "id": "STYLE_1",
      "name": "Day view",
      "url": "https://example.com/3857/resources/styles/day.json",
      "defaultStyle": true
    },
    {
      "id": "STYLE_2",
      "name": "Night view",
      "url": "https://example.com/3857/resources/styles/night.json"
    }
  ],
  "preview":{
    "src": "./resources/vectorTile.png"
    }
}
```

***

##### layerConfig.elements.layers.VectorTile.vtStyle {data-toc-label='vtStyle'}

[inherits]: # (layerConfig.elements.layers.VectorTile)

Style definitions. Available for *Vector Tile Layers* only.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|defaultStyle|no|String||If set `true`, this style is used initially; if no field is set `true`, the first style is used.|false|
|id|yes|String||Cross-service unique id.|false|
|name|yes|String||Display name, e.g. used in the selection tool.|false|
|resolutions|no|Number[]||Resolutions for zoom levels defined in style. If not set default resolutions from ol-mapbox-style project are used.|false|
|url|yes|String||URL to load a style from. The linked JSON *must* match the [Mapbox style specification](https://docs.mapbox.com/mapbox-gl-js/style-spec/).|false|

**Example**

```json
{
    "id": "Style_1",
    "name": "Red lines",
    "url": "https://example.com/asdf/styles/root.json",
    "defaultStyle": true,
    "resolutions": [
        661.4579761460263,
        264.58319045841048,
        66.14579761460263,
        26.458319045841044,
        15.874991427504629,
        10.583327618336419
    ]
}
```

***

#### layerConfig.elements.layers.Tileset {data-toc-label='Tileset'}

[inherits]: # (layerConfig.elements.layers)

List of attributes typically used for tilesets.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|hiddenFeatures|no|String[]|[]|List of IDs to be hidden in the plane.|true|
|**[cesium3DTilesetOption](https://cesiumjs.org/Cesium/Build/Documentation/Cesium3DTileset.html)**|no|**[cesium3DTilesetOption](#layerconfigelementslayerstilesetcesium3dtilesetoption)**||Cesium 3D tileset options directly forwarded to the *Cesium tileset object*. E.g. `maximumScreenSpaceError` is relevant to the visibility.|true|

**Example**

```json
{
    "id": "123456",
    "name": "TilesetLayerName",
    "visibility": true,
    "hiddenFeatures": ["id1", "id2"],
    "cesium3DTilesetOptions" : {
        "maximumScreenSpaceError" : 6
    },
}
```

***

##### layerConfig.elements.layers.Tileset.cesium3DTilesetOption {data-toc-label='cesium3DTilesetOption'}

[inherits]: # (layerConfig.elements.layers.Tileset)

Cesium 3D tileset options directly forwarded to the *Cesium tileset object*.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|maximumScreenSpaceError|no|Number||The maximum screen space error used for refining the level of detail. This value helps determine when a tile is refined to its successors, and therefore plays an important role in balancing performance and visual quality.|true|

**Example**

```json
"cesium3DTilesetOptions" : {
    "maximumScreenSpaceError" : 6
}
```

***

#### layerConfig.elements.layers.Terrain {data-toc-label='Terrain'}

[inherits]: # (layerConfig.elements.layers)

List of attributes typically used for Terrain.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|**[cesiumTerrainProviderOption](https://cesiumjs.org/Cesium/Build/Documentation/CesiumTerrainProvider.html)**|no|**[cesiumTerrainProviderOption](#layerconfigelementslayersterraincesiumterrainprovideroption)**[]||Cesium TerrainProvider options directly forwarded to the *Cesium TerrainProvider* E.g. `requestVertexNormals` is used for object surface shading.|true|

**Example**

```json
{
    "id": "123456",
    "name": "TerrainLayerName",
    "visibility": true,
    "cesiumTerrainProviderOptions": {
        "requestVertexNormals" : true
    },
}
```

***

##### layerConfig.elements.layers.Terrain.cesiumTerrainProviderOption {data-toc-label='Cesium TerrainProviderOption'}

[inherits]: # (layerConfig.elements.layers.Terrain)

Initialization options for the CesiumTerrainProvider constructor.
[cesiumTerrainProviderOptions]: https://cesium.com/learn/cesiumjs/ref-doc/CesiumTerrainProvider.html

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|requestVertexNormals|no|Boolean||Flag indicating whether the client should request additional illumination information from the server, in the form of normals per vertex, if available.|true|

**Example**

```json
"cesiumTerrainProviderOptions": {
    "requestVertexNormals" : true
}
```

***

#### layerConfig.elements.layers.Entity3D {data-toc-label='Entity3D'}

[inherits]: # (layerConfig.elements.layers)
[type:Attribute]: # (layerConfig.elements.layers.Entity3D.entities)

List of attributes typically used for Entities 3D.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|entities|yes|**[Attribute](#layerconfigelementslayersentity3d)**[]||List of entities of the layer to be displayed.|false|

***

##### layerConfig.elements.layers.Entity3D.entities {data-toc-label='Entities'}

[inherits]: # (layerConfig.elements.layers.Entity3D)
[type:Attribute]: # (layerConfig.elements.layers.Entity3D.entities)

Entities3D entities typical attributes are listed here.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|allowPicking|no|Boolean|true|Whether the model may be clicked for GFI. Example: `true`|false|
|attributes|no|**[Attribute](#layerconfigelementslayersentity3dentitiesattribute)**||Model attributes, e.g. `{"name": "test"}`|false|
|latitude|yes|Number||Model origin latitude in degrees. Example: `53.541831`|false|
|longitude|yes|Number||Model origin longitude in degrees. Example: `9.917963`|false|
|height|no|Number|0|Model origin height. Example: `10`|false|
|heading|no|Number|0|Model rotation in degrees. Example: `0`|false|
|pitch|no|Number|0|Model pitch in degrees. Example: `0`|false|
|roll|no|Number|0|Model roll in degrees. Example: `0`|false|
|scale|no|Number|1|Model scale. Example: `1`|false|
|show|no|Boolean|true|Whether the model should be shown. Should be `true`. Example: `true`|false|
|url|yes|String|""|Model url, e.g. `"https://daten-hamburg.de/gdi3d/datasource-data/Simple_Building.glb"`|false|


**Example**

```json
{
      "id": "123456",
      "name": "EntitiesLayerName",
      "visibility": true,
      "typ": "Entities3D",
      "entities": [
         {
            "url": "https://daten-hamburg.de/gdi3d/datasource-data/Simple_Building.glb",
           "attributes": {
             "name": "einfaches Haus in Planten und Blomen"
           },
           "latitude": 53.5631,
           "longitude": 9.9800,
           "height": 12,
           "heading": 0,
           "pitch": 0,
           "roll": 0,
           "scale": 5,
           "allowPicking": true,
           "show": true
         }
       ],
       "gfiAttributes" : {
         "name": "Name"
      }
  },
```

***

###### layerConfig.elements.layers.Entity3D.entities.Attribute {data-toc-label='Attribute'}

[inherits]: # (layerConfig.elements.layers.Entity3D)


|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|no|String|""|Field that can be displayed in the GFI.|false|

**Example**

```json
{
   "name": "Fernsehturm.kmz"
}
```
***

## Datatypes

### Datatypes.Coordinate {data-toc-label='Coordinate'}

A coordinate is an array of two numbers. The first represents the easting, the second the northing.

**Example integer coordinate**

```json
[561210, 5932600]
```

**Example float coordinate**

```json
[561210.1458, 5932600.12358]
```

***

The following datatypes can be used in the configuration.

### Datatypes.Extent {data-toc-label='Extent'}

An extent is an array of four numbers describing a rectangular scope. The rectangle is constructed from the "lower left" and "upper right" corner, so the scheme used is `[Easting lower left, Northing lower left, Easting upper right, Northing upper right]`, or `[minx, miny, maxx, maxy]`.

**Example extent**

```json
[510000.0, 5850000.0, 625000.4, 6000000.0]
```

***

### Datatypes.Payload {data-toc-label='Payload'}
CustomMenuElement Module `execute` from `payload`. The appropriate payload for the action must be specified. Here is the example of the `Alerting/addSingleAlert`.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|content|yes|String||Content of the message.|true|
|title|no|String||Title of the message.|true|

**Example**

```json
{
    "title":"to all people",
    "content": "Hello world"
}
```

***

### Datatypes.Fill {data-toc-label='Fill'}
|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|color|no|Float[]||Possible setting: color (RGBA)|false|

**Example**

```json
"fill": {
    "color": [215, 102, 41, 0.9]
}
```

***

### Datatypes.Stroke {data-toc-label='Stroke'}
|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|width|no|Integer||Possible setting: width|false|
|color|no|Float[]|[255, 255, 255, 0.5]|Possible setting: color (RGBA)|false|

```json
"stroke": {
    "width": 4 ,
    "color": [255, 0, 255, 0.9]
    }
```

***

### Datatypes.Image {data-toc-label='Image'}
|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|scale|no|Integer||Possible setting: scale|false|

```json
"image": {
    "scale": 2
    }
```

***


### Datatypes.Snippets {data-toc-label='Snippets'}

[type:Children]: # (Datatypes.Snippets.Children)
[type:eParams]: # (Datatypes.Snippets.LocaleCompareParams)
[type:Service]: # (Datatypes.Snippets.Service)
[type:Timeouts]: # (Datatypes.Snippets.Timeouts)
[type:UniversalSearch]: # (Datatypes.Snippets.UniversalSearch)
[type:BeautifiedAttrName]: # (Datatypes.Snippets.BeautifiedAttrName)
[type:ChartConfig]: # (Datatypes.Snippets.ChartConfig)

An object defining a single snippet for the filter.

Note: Time-related snippets (`date` and `dateRange`) can only be operated in `external` mode or as a fixed rule (`visible`: `false`) if their counterpart at the WFS service is in a correct time format (ISO8601: `YYYY-MM-DD`).

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|addSelectAll|no|Boolean|false|For type `dropdown` with `multiselect: true` only: Adds an additional entry on top of the list to select/deselect all entries.|false|
|attrName|yes|String||The attribute name used for filtering. Is to be an array if `dateRange`, `sliderRange` or `featureInfo` is used (see examples).|false|
|autoInit|no|Boolean|true|For type `dropdown` only: If set to `false`: Turns off the automatic identification of value (in case of `dropdown`) or minValue/maxValue (in case of `slider(Range)` and `date(Range)`).|false|
|children|no|**[Children](#datatypessnippetschildren)**[]|[]|Child snippet configuration.|true|
|decimalPlaces|no|Number|0|Defines decimal places for the step for `slider` and `sliderRange`|false|
|delimiter|no|String||For type `dropdown` only: If feature attributes are themselfs again seperated by a delimiter to act as pseudo array, setting delimiter to the sign that seperates the terms, will result in the expected outcome.|false|
|display|no|String|"default"|If snippet type `dropdown`: If set to `list`, a list is displayed instead of a dropdown box. If snippet type `dateRange`: If set to `datepicker`, only the selection via calendar will be displayed, if set to `slider`, only the slider will be displayed, if set to `all`, datepicker and slider will be displayed.|false|
|format|no|String|"YYYY-MM-DD"|For type `date` and `dateRange` only: The format the date is stored in the database. Leave empty for ISO8601. If the format differs from ISO8601, the snippet must be visible (`visible`: `true`) and the filter must work in `external`: `false` mode. Can be specified as an array of two different formats if an array of different attribute names is also specified as attrName and the date formats of the attribute values differ.|false|
|hideSelected|no|Boolean|true|As default behavior, the previously selected dropdown item is hidden in the dropdown list. Can be set to false to have the selected item shown and styled as selected.|false|
|info|no|String||An info text or translation key. If set, a little icon will shown right hand side of the snippet. Can be set to `true` to display a default text for the snippet type.|false|
|type|no|String||The type of this snippet. Can be one of the following: `checkbox`, `dropdown`, `text`, `slider`, `sliderRange`, `date`, `dateRange`, `featureInfo`, `chart`. Will be indentified automatically if left away, following a data type rule: boolean becomes `checkbox`, string becomes `dropdown`, number becomes `sliderRange`, unknown becomes `text`.|false|
|localeCompareParams|no|**[LocaleCompareParams](#datatypessnippetslocalecompareparams)**||For type Snippet-Typ `dropdown` only: The sorting of the dropdown boxes can be adjusted according to your own wishes via this parameter.|false|
|maxValue|no|Number||For type `date` and `slider` only: The maximum value as number or date string. Leave empty for automatic identification of boundaries.|false|
|minValue|no|Number||For type `date` and `slider` only: The minimum value as number or date string. Leave empty for automatic identification of boundaries.|false|
|multiselect|no|Boolean|true|For type `dropdown` only: Selection of multiple entries. Set to `false` to switch to single select.|false|
|operator|no|String||The operator to connect the set value to the value in the database. Can be one of the following - depending if it makes sense for the type and is available for the used interface: `INTERSECTS`, `BETWEEN`, `EQ`, `IN`, `STARTSWITH`, `ENDSWITH`, `NE`, `GT`, `GE`, `LT`, `LE`. If left away, defaults are: boolean becomes `EQ`, string becomes `EQ`, number becomes `BETWEEN`, unknown becomes `EQ`.|false|
|operatorForAttrName|no|String|"AND"|By setting this parameter to `OR` in conjunction with attrName as an array, it is possible to filter over various attrNames with a logical OR.|false|
|optionsLimit|no|Number|20000|For type `dropdown` only: Adds a limit of options in dropdown list.|false|
|placeholder|no|String|""|For type `dropdown` only: The placeholder to use. Can be a translation key.|false|
|prechecked|no|String[]/String||Initially checked value. For `dropdown`, `sliderRange` and `dateRange` an array of values, for checkbox a boolean, for slider a number, for text a string and for date a string (following the set `format`). If `visible` is set to `false`, value set by prechecked are forced for filtering. For `dropdown` with `multiselect`: If `prechecked` is set to `all`, all available values will be selected initially.|false|
|renderIcons|no|String|"none"|For type `dropdown` with `display: "list"` only: If set to `fromLegend` icons will be placed left hand side of each entry. Icons are taken from legend. Use an object with attrNames as keys and imagePath as value {attrName: imagePath} to manually set images (see example).|false|
|subtitle|no|String[]/String[][]||Only for snippet type `chart`. Can be set to display any combination of text and data as a subtitle of the chart.|false|
|tooltipUnit|no|String||Only for snippet type `chart`. Adds unit to numbers shown in tooltip.|false|
|service|no|**[Service](#datatypessnippetsservice)**||For the initial filling of a snippet `dropdown`, `date`, `slider` an alternative service can be used. This may increase the performance during initial loading. The default is the service of the configured **[FilterLayer](#portalconfigmenusectionsmodulesfilterfilterlayer)**.|false|
|showAllValues|no|Boolean||For `dropdown` snippet type only: prevents hiding of unselected values when set to `true`. Can only be used in conjunction with `prechecked: "all"`.|false|
|subTitles|no|String[]|[]|Only for snippet type `dateRange`: The additional from and to labels to be displayed above the calendar fields. As an array with two elements (e.g. ["from", "to"]). Set subTitles to true to use the values of `attrName`, to false to not display labels.|false|
|timeouts|no|**[Timeouts](#datatypessnippetstimeouts)**||Timeouts to configure for better user experience.|false|
|title|no|String||The title of the snippet. Can be a translation key. If not set, the title is taken from the gfiAttributes and if they are not present, then the `attrName` is used. Can be set to `false` to disable the display of a title. Can be set to `true` to force the display of the `attrName`.|false|
|type|no|String||The type of this snippet. Can be one of the following: `checkbox`, `dropdown`, `text`, `slider`, `sliderRange`, `date`, `dateRange`. Will be indentified automatically if left away, following a data type rule: boolean becomes `checkbox`, string becomes `dropdown`, number becomes `sliderRange`, unknown becomes `text`.|false|
|value|no|String[]||If omitted, values are determined automatically. If set for `dropdown`: The values to be selectable in the list. If set for `checkbox`: Instead of boolean values, the specified values for the `true` and `false` states should be taken (e.g. ["Yes", "No"]). For `dateRange`: start and end date for date picker and/or slider. For `sliderRange`: the min and max values.|false|
|visible|no|Boolean|true|The snippet is visible. Set to `false` to hide the snippet: This gives you the power to use `prechecked` as an `always rule` to force filtering of a fixed `attrName` and value.|false|
|universalSearch|no|**[UniversalSearch](#datatypessnippetsuniversalsearch)**||Only for Snippet-Typ `featureInfo`: The filtered Value can be searched for in website|false|s
|beautifiedAttrName|no|**[BeautifiedAttrName](#datatypessnippetsbeautifiedattrname)**||Only for Snippet-Typ `featureInfo`: The attribute name could be beautified.|false|
|adjustOnlyFromParent|no|Boolean|false|For type `dropdown` only: If true, only adjusted from parent snippet.|false|
|allowEmptySelection|no|Boolean|true|For type `dropdown` only: If `true` allows to remove all selected values. If `false` one value must be left selected.|false|
|chartConfig|yes|**[ChartConfig](#datatypessnippetschartconfig)**||Only for snippet type 'chart' in combination with 'service' (see example): The configuration for the chart. All configuration options (previously only "type: bar") of Chart.js are supported (see: https://www.chartjs.org/docs/latest/configuration/). The 'featureAttributes' parameter must also be specified. The parameter specifies the attributes behind which the data to be displayed is located (see example).|false|
|alternativeTextForEmptyChart|nein|String||Alternative text for snippet type `chart` that can be displayed instead of a chart.|false|
|infoText|no|String|false|For type `chart` only: An Info text. |false|

**Example**

Example for a text snippet. A input box with placeholder will be shown for filtering free text.

```json
{
    "title": "Description of school",
    "attrName": "school_description",
    "type": "text",
    "operator": "IN",
    "placeholder": "Search in description"
}
```

**Example**

Example for a checkbox snippet. A checkbox is shown to search for "Oui" in the database if checked. The checkbox is checked by default.

```json
{
    "title": "A l'option végétalienne ?",
    "attrName": "vegan_option",
    "type": "checkbox",
    "operator": "EQ",
    "value": ["Oui", "Non"],
    "prechecked": true
}
```

**Example**

Example for a dropdown snippet. A simple dropdown with single select and placeholder is used.

```json
{
    "title": "District",
    "attrName": "city_district",
    "type": "dropdown",
    "multiselect": false,
    "placeholder": "Choose a district"
}
```

**Example**

Example for a dropdown snippet. A dropdown with multiselect and select all option, manually set icons, info, fixed value and prechecked. Displayed as list.

```json
{
    "title": "District",
    "attrName": "city_district",
    "info": "Some districts of London.",
    "type": "dropdown",
    "display": "list",
    "multiselect": true,
    "optionsLimit": 20000,
    "addSelectAll": true,
    "value": [
        "Whitehall and Westminster",
        "Piccadilly and St James's",
        "Soho and Trafalgar Square",
        "Covent Garden and Strand",
        "Bloomsbury and Fitzrovia"
    ],
    "prechecked": [
        "Piccadilly and St James's",
        "Soho and Trafalgar Square"
    ],
    "renderIcons": {
        "Whitehall and Westminster": "https://example.com/img/whitehall.png",
        "Piccadilly and St James's": "https://example.com/img/piccadilly.png",
        "Soho and Trafalgar Square": "https://example.com/img/soho.png",
        "Covent Garden and Strand": "https://example.com/img/covent.png",
        "Bloomsbury and Fitzrovia": "https://example.com/img/bloomsbury.png"
    },
    "placeholder": "Choose a district"
}
```

**Example**

Example of a dropdown snippet where all available values are initially selected.

```json
{
    "title": "District",
    "attrName": "city_district",
    "type": "dropdown",
    "multiselect": true,
    "prechecked": "all",
    "placeholder": "Choose a district"
}
```

**Example**

Example for a slider snippet. A slider for a single digit and a less or equals operator. With minValue and maxValue to avoid automatic identification of boundaries.

```json
{
    "title": "First classes",
    "attrName": "number_of_first_classes",
    "type": "slider",
    "operator": "LE",
    "minValue": 1,
    "maxValue": 5,
    "decimalPlaces": 2
}
```

**Example**

Example for a slider range snippet. A slider range without minValue and maxValue to use automatic identification of boundaries.

```json
{
    "title": "Angle d'inclinaison du toit du garage",
    "attrName": "angle",
    "type": "sliderRange",
    "operator": "BETWEEN",
    "decimalPlaces": 2
}
```

**Example**

Example for a slider range snippet. A slider range with two attrName for min and max. With minValue and max Value to avoid automatic identification of boundaries.

```json
{
    "title": "Angle d'inclinaison du toit du garage",
    "attrName": ["angle_minimal", "angle_maximal"],
    "type": "sliderRange",
    "operator": "BETWEEN",
    "value": [0, 90]
}
```

**Example**

Example for a date snippet. A date picker for a single date with minValue and maxValue to avoid automatic identification of boundaries.

```json
{
    "title": "Birthday",
    "attrName": "birthday",
    "type": "date",
    "format": "YYYY-MM-DD",
    "minValue": "2000-01-01",
    "maxValue": "2022-12-31"
}
```

**Example**

Example for a date range snippet. A date range with two attrName for min and max. With a special date format. Uses intersects operator, without minValue and maxValue to use automatic identification of boundaries.

```json
{
    "title": "Bauzeit der Autobahnen",
    "attrName": ["autobahn_baubeginn", "autobahn_bauende"],
    "type": "dateRange",
    "operator": "INTERSECTS",
    "format": "DD.MM.YY"
}
```

**Example**

Example of a DateRange snippet. With the slider turned off (`display`: `datepicker`). With two attribute names for min and max values, two `subTitles` different from the attrName and different date formats. Additionally a period is preset. Please note that the format of the preset values is based on `format`.

```json
{
    "type": "dateRange",
    "title": "Auslandssemester",
    "subTitles": ["Start der Reise", "End of Journey"],
    "attrName": ["start", "end"],
    "format": ["DD.MM.YYYY", "YYYY/DD/MM"],
    "prechecked": ["01.08.2022", "2023/06/31"],
    "display": "datepicker"
}
```

**Example**

Example of a DateRange snippet. With time points preset via `prechecked` and min and max values preset via `value`.

```json
{
    "type": "dateRange",
    "title": "Aktive Baustellen im ...",
    "subTitles": ["Zeitraum von", "Zeitraum bis"],
    "attrName": ["baubeginn", "bauende"],
    "format": "DD.MM.YYYY",
    "value": ["01.01.2019", "31.12.2034"],
    "prechecked": ["07.07.2022", "25.02.2030"]
}
```

**Example**

Example for a feature info snippet. Displays all values of the configured attribute names `attrName` of all filtered features in the filter.

```json
{
    "title": "Steckbrief",
    "attrName": ["tierartengruppe", "deutscher_artname", "artname", "rote_liste_d", "rote_liste_hh"],
    "type": "featureInfo",
    "universalSearch": {
      "attrName": "Wissenschaftlicher Name",
      "prefix": "https://www.google.com/search?q="
    },
    "beautifiedAttrName": {
      "tierartengruppe": "Tierartengruppe",
      "familie": "Familie"
    }
}
```

**Example**

Example for a slider range snippet of SensorThingsAPI (STA).

```json
{
    "type": "sliderRange",
    "title": "Anzahl der Fahrräder",
    "attrName": "@Datastreams.0.Observations.0.result"
}
```

**Example**

Example of a snippet that wants to filter over multiple attributes at once and display the features that match the set value for one of the specified attributes.

```json
{
    "attrName": ["xpplanname", "rechtscharakterwert"],
    "operatorForAttrName": "OR",
    "type": "dropdown",
}
```

**Example**

Example of a chart snippet. Queries the features from the configured "service" and displays the data of the configured "featureAttributes" in a bar chart.

```json
{
    "type": "chart",
    "title": "Phänogramm",
    "subtitle": ["Anzahl Beobachtungen = ", ["anzahl_beobachtungen"]],
    "tooltipUnit": " %",
    "chartConfig": {
        "type": "bar",
        "data": {
            "datasets": [{
                "label": "Label",
                "backgroundColor": "rgba(214, 227, 255, 0.8)",
                "featureAttributes": ["januar_1", "februar_1", "maerz_1", "april_1", "mai_1", "juni_1", "juli_1", "august_1", "september_1", "oktober_1", "november_1", "dezember_1"]
            },
            {
                "label": "Label 2",
                "backgroundColor": "rgba(214, 227, 255, 0.8)",
                "featureAttributes": ["januar_2", "februar_2", "maerz_2", "april_2", "mai_2", "juni_2", "juli_2", "august_2", "september_2", "oktober_2", "november_2", "dezember_2"]
            }
        ],
        "labels": ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
        },
        "options": {
            "plugins": {
                "legend": {
                    "display": false
                },
                "subtitle": {
                  "display": true,
                  "position": "bottom",
                }
            }
        }
    },
    "service": {
        "extern": true,
        "type": "WFS",
        "url": "https://qs-geodienste.hamburg.de/HH_WFS_verbreitung_tiere",
        "typename": "verbreitung_tiere_eindeutige_liste",
        "featureNS": "https://registry.gdi-de.org/id/de.hh.up",
        "featureTypes": ["verbreitung_tiere_eindeutige_liste"],
        "filter": {
            "attrName": "artname",
            "operator": "EQ"
        }
    }
}
```

***

#### Datatypes.Snippets.Children {data-toc-label='Children'}
Child snippet configuration.
The child snippets are configured in the same way as "normal" snippets.
See [the snippet datatype](#datatypessnippets) for more information.

The parent-child relationship can be used for the following use case:
If a dataset is too large, preselecting an attribute can reduce the amount of subsequent filtering.
(Example: animal species group `mammals` as preselection would significantly reduce the data space of all animals).

The `children` parameter instructs a snippet not to trigger any filtering itself, but to "feed" only its child snippets configured under `children` with the data resulting from its setting.
(Example: `mammals` will shrink the resulting animal species to an acceptable range).
Only the selection in one of the child snippets (example: "blue whale") finally performs the filtering.

In case of using parent-child relationships, we recommend setting `snippetTags` to `false`.
Multi-dimensional nesting (grandparent, parent, child) is not currently provided.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|addSelectAll|no|Boolean|false|For type `dropdown` with `multiselect: true` only: Adds an additional entry on top of the list to select/deselect all entries.|false|
|attrName|yes|String||The attribute name used for filtering. Is to be an array if `dateRange`, `sliderRange` or `featureInfo` is used (see examples).|false|
|autoInit|no|Boolean|true|For type `dropdown` only: If set to `false`: Turns off the automatic identification of value (in case of `dropdown`) or minValue/maxValue (in case of `slider(Range)` and `date(Range)`).|false|
|delimiter|no|String||For type `dropdown` only: If feature attributes are themselfs again seperated by a delimiter to act as pseudo array, setting delimiter to the sign that seperates the terms, will result in the expected outcome.|false|
|display|no|String|"default"|If snippet type `dropdown`: If set to `list`, a list is displayed instead of a dropdown box. If snippet type `dateRange`: If set to `datepicker`, only the selection via calendar will be displayed, if set to `slider`, only the slider will be displayed, if set to `all`, datepicker and slider will be displayed.|false|
|hideSelected|no|Boolean|true|As default behavior, the previously selected dropdown item is hidden in the dropdown list. Can be set to false to have the selected item shown and styled as selected.|false|
|info|no|String||An info text or translation key. If set, a little icon will shown right hand side of the snippet. Can be set to `true` to display a default text for the snippet type.|false|
|type|no|String||The type of this snippet. Can be one of the following: `dropdown`. Will be indentified automatically if left away, following a data type rule: string becomes `dropdown`.|false|
|localeCompareParams|no|**[LocaleCompareParams](#markdown-header-datatypessnippetslocalecompareparams)**||For type Snippet-Typ `dropdown` only: The sorting of the dropdown boxes can be adjusted according to your own wishes via this parameter.|false|
|multiselect|no|Boolean|true|For type `dropdown` only: Selection of multiple entries. Set to `false` to switch to single select.|false|
|operator|no|String||The operator to connect the set value to the value in the database. Can be one of the following - depending if it makes sense for the type and is available for the used interface: `INTERSECTS`, `BETWEEN`, `EQ`, `IN`, `STARTSWITH`, `ENDSWITH`, `NE`, `GT`, `GE`, `LT`, `LE`. If left away, defaults are: boolean becomes `EQ`, string becomes `EQ`, number becomes `BETWEEN`, unknown becomes `EQ`.|false|
|operatorForAttrName|no|String|"AND"|By setting this parameter to `OR` in conjunction with attrName as an array, it is possible to filter over various attrNames with a logical OR.|false|
|optionsLimit|no|Number|20000|For type `dropdown` only: Adds a limit of options in dropdown list.|false|
|placeholder|no|String|""|For type `dropdown` only: The placeholder to use. Can be a translation key.|false|
|prechecked|no|String[]/String||Initially checked value. For `dropdown`, `sliderRange` and `dateRange` an array of values, for checkbox a boolean, for slider a number, for text a string and for date a string (following the set `format`). If `visible` is set to `false`, value set by prechecked are forced for filtering. For `dropdown` with `multiselect`: If `prechecked` is set to `all`, all available values will be selected initially.|false|
|renderIcons|no|String|"none"|For type `dropdown` with `display: "list"` only: If set to `fromLegend` icons will be placed left hand side of each entry. Icons are taken from legend. Use an object with attrNames as keys and imagePath as value {attrName: imagePath} to manually set images (see example).|false|
|service|no|**[Service](#markdown-header-datatypessnippetsservice)**||For the initial filling of a snippet `dropdown`, `date`, `slider` an alternative service can be used. This may increase the performance during initial loading. The default is the service of the configured **[FilterLayer](#markdown-header-portalconfigmenusectionsmodulesfilterfilterlayer)**.|false|
|showAllValues|no|Boolean||For `dropdown` snippet type only: prevents hiding of unselected values when set to `true`. Can only be used in conjunction with `prechecked: "all"`.|false|
|title|no|String||The title of the snippet. Can be a translation key. If not set, the title is taken from the gfiAttributes and if they are not present, then the `attrName` is used. Can be set to `false` to disable the display of a title. Can be set to `true` to force the display of the `attrName`.|false|
|value|no|String[]||If omitted, values are determined automatically. If set for `dropdown`: The values to be selectable in the list. If set for `checkbox`: Instead of boolean values, the specified values for the `true` and `false` states should be taken (e.g. ["Yes", "No"]). For `dateRange`: start and end date for date picker and/or slider. For `sliderRange`: the min and max values.|false|
|visible|no|Boolean|true|The snippet is visible. Set to `false` to hide the snippet: This gives you the power to use `prechecked` as an `always rule` to force filtering of a fixed `attrName` and value.|false|
|adjustOnlyFromParent|no|Boolean|false|For type `dropdown` only: If true, only adjusted from parent snippet.|false|
|allowEmptySelection|no|Boolean|true|For type `dropdown` only: If `true` allows to remove all selected values. If `false` one value must be left selected.|false|

**Example**

Example of a dropdown snippet with parent-child relationship. The `cityA` and `cityB` dropdowns are initially not filled. Only when a `district` is selected do they fill with the cities of the selected district, but no filtering takes place on the map. Only the selection of a city finally initiates the filtering by the city name.

```json
{
    "title": "District",
    "attrName": "city_district",
    "type": "dropdown",
    "multiselect": false,
    "placeholder": "Choose a district",
    "children": [
        {
            "type": "dropdown",
            "attrName": "cityA",
            "placeholder": "cityA"
        },
        {
            "type": "dropdown",
            "attrName": "cityB",
            "placeholder": "cityB"
        }
    ]
}
```

***

#### Datatypes.Snippets.Timeouts {data-toc-label='Timeouts'}
User experience can be improved with the adjustment of timeouts.
This is especially true for filters that work with `strategy`: `active`.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|input|no|Number|1400|For snippet typ `sliderRange` and `slider` only: The time in milliseconds that should elapse before filtering is triggered after entering numbers and characters into the input field.|false|
|slider|no|Number|800|For snippet typ `sliderRange`, `slider` and `dateRange` only: The time in milliseconds that should elapse before filtering is triggered after the last change of the slider.|false|

**Example**

An example of a sliderRange snippet with accelerated filtering after input into the input field or changing the slider.

```json
{
    "title": "Baustellen",
    "attrName": ["baubeginn", "bauende"],
    "type": "sliderRange",
    "timeouts": {
        "input": 800,
        "slider": 400
    }
}
```

***

#### Datatypes.Snippets.Service {data-toc-label='Service'}

An object that describes a service for a snippet. All service types that the filter supports can theoretically be used.
The configuration depends on the type of service.

**WFS**
|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|collection|yes|String||The collection that will be loaded. Only for OAF|false|
|type|yes|String||The type of service.|false|
|typename|yes|String||The feature type that will be loaded. Only for WFS|false|
|url|yes|String||The service url.|false|

**Example**

```json
{
    "type": "WFS",
    "url": "https://qs-geodienste.hamburg.de/HH_WFS_verbreitungskarten_tiere",
    "typename": "verbreitung_tiere_eindeutige_liste"
}
```

**Example GeoJSON**

```json
{
    "type": "GeoJSON",
    "url": "../chartjs/charts_stadtteil.geojson"
}
```
**Example OAF**

```json
{
    "url": "https://api.hamburg.de/datasets/v1/schulen",
    "collection" : "staatliche_schulen",
    "type": "OAF"
}
```

***

#### Datatypes.Snippets.ChartConfig {data-toc-label='ChartConfig'}

An object that describes a chart. Click **[here](https://www.chartjs.org/docs/latest/configuration/)** for more information.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|data|yes|Object||The data. For more Information click **[here](https://www.chartjs.org/docs/latest/general/data-structures.html)**|false|
|options|yes|Object||Options for creating the diagram.|false|
|plugins|yes|Array||Inline plugins can be included in this array. It is an alternative way of adding plugins for single chart (vs registering the plugin globally). More about plugins in the **[developers section](https://www.chartjs.org/docs/latest/developers/plugins.html)**.|false|
|type|yes|String||Chart type determines the main type of the chart.|false|

**Example**

The top level structure of Chart.js configuration:

```json
{
    "chartConfig": {
        "type": 'bar',
        "data": {},
        "options": {},
        "plugins": []
    }
}
```

***

#### Datatypes.Snippets.LocaleCompareParams {data-toc-label='LocaleCompareParams'}

[type:Options]: # (Datatypes.Snippets.LocaleCompareParams.Options)

A string or object that supply the parameters for util function localeCompare.

**Example String**

"localeCompareParams": "de"

**Object**

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|locale|no|String||The locale code according ISO 3166|false|
|options|no|**[Options](#datatypessnippetslocalecompareparamsoptions)**||The custom options for sorting in localeCompare|false|

**Example Object**

```json
{
    "locale": "de",
    "options": {
        "ignorePunctuation": true
    }
}
```

***

##### Datatypes.Snippets.LocaleCompareParams.Options {data-toc-label='Options'}
An object for custom control of the localeCompare function used to sort dropdown boxes, the documentation is: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|ignorePunctuation|no|Boolean|false|Determines whether punctuation will be ignored.|false|
|numeric|no|Boolean|false|Determines whether numeric collation will be used|false|
|sensitivity|no|String|"variant"|Determines whether string collation will be used.|false|

**Example**

```json
{
    "ignorePunctuation": true
}
```

***

#### Datatypes.Snippets.UniversalSearch {data-toc-label='UniversalSearch'}

An object for configuring a universal search of value

**Object**

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|attrName|yes|String||The attribute Name|false|
|prefix|yes|String||The Website as Prefix for searching|false|

**Example**

```json
{
    "attrName": "Wissenschaftlicher Name",
    "prefix": "https://www.ecosia.org/search?q="
}
```

***

#### Datatypes.Snippets.BeautifiedAttrName {data-toc-label='BeautifiedAttrName'}

An object for configuring beautified names for attributes in stack

**Object**

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|attrName|yes|String||The attribute Name|false|

**Example**

```json
{
    "attrName": "beautified Name"
}
```

***

### Datatypes.Bbox {data-toc-label='Bbox'}
BBOX value according to the speedProfile. Coordinate system depends on the epsg parameter. Geosearch service must support bbox string.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|speedProfile|no|String||Coordinate values "West,South,East,North"|false|

**Example**

```json
{
    "bbox": {"CYCLING": "9.6,53.40,10.4,53.84"}
}
```

***

### Datatypes.CustomAvoidFeatures {data-toc-label='CustomAvoidFeatures'}
Possibility to define additional avoid features for the different speed profiles (additionally to the BKG service) (requires own modified backend).

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|speedProfile|no|String[]||Options for avoid traffic routes that should be available for the speedProfile.|false|

**Example**

```json
{
    "customAvoidFeatures": {
       "CYCLING": ["STEPS", "FERRIES", "UNPAVEDROADS"],
       "CAR": ["HIGHWAYS"]
    }
}
```

***

### Datatypes.CustomPreferences {data-toc-label='CustomPreferences'}
Routing-tool directions route customPreferences.
Possibility to define additional preferences for the different speed profiles (additionally to the BKG service)  (requires own modified backend)

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|speedProfile|no|String[]||Which preferences should be available for the speedProfile.|false|

**Example**

```json
{
    "customPreferences": {
       "CYCLING": ["RECOMMENDED", "SHORTEST", "GREEN"],
       "CAR": ["RECOMMENDED", "SHORTEST", "GREEN"]
    }
}
```

***

### Datatypes.StyleRoute {data-toc-label='StyleRoute'}
Routing-tool directions route style options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|fillColor|no|Number[]|[255, 44, 0, 1]|Which color should be used to fill.|false|
|width|no|Number|6|How thick should the line be displayed.|false|
|highlightColor|no|Number[]|[255, 255, 255, 1]|Which color should be used to highlight the route.|false|
|highlightWidth|no|Number|9|How thick should the highlighting line be displayed.|false|
|partHighlightColor|no|Number[]|[255, 255, 255, 1]|Which color should be used when highlighting part of the route.|false|
|highlightWidth|no|Number|9|How thick should the highlighting part of the route be displayed.|false|

**Example**

```json
{
    "styleRoute": {
        "fillColor": [255, 44, 0, 1],
        "width": 6,
        "highlightColor": [255, 255, 255, 1],
        "highlightWidth": 9,
        "partHighlightColor": [255, 255, 255, 1],
        "partHighlightWidth": 3
    }
}
```

***

### Datatypes.StyleWaypoint {data-toc-label='StyleWaypoint'}
Routing-tool directions waypoint style options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|lineColor|no|Number[]|[255, 127, 0]|Which color should be used for the border.|false|
|lineWidth|no|Number|4|How thick should the border be.|false|
|fillColor|no|Number[]|[255, 127, 0]|Which color should be used to fill.|false|
|textFillColor|no|String|"#000"|Which color should be used for the text.|false|
|textLineColor|no|String|"#fff"|Which color should be used for the text background.|false|
|textLineWidth|no|Number|3|How big should the text be displayed.|false|
|opacity|no|Number|0.3|How transparent should the fill color be displayed.|false|
|radius|no|Number|8|How big should the waypoint be displayed.|false|

**Example**

```json
{
    "styleWaypoint": {
        "lineColor": [255, 127, 0],
        "lineWidth": 4,
        "fillColor": [255, 127, 0],
        "textFillColor": "#000",
        "textLineColor": "#fff",
        "textLineWidth": 3,
        "opacity": 0.3,
        "radius": 8
    }
}
```

***

### Datatypes.StyleAvoidAreas {data-toc-label='StyleAvoidAreas'}
Routing-tool directions avoid areas style options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|lineColor|no|Number[]|[0, 127, 255]|Which color should be used for the border.|false|
|lineWidth|no|Number|2|How thick should the border be.|false|
|fillColor|no|Number[]|[0, 127, 255]|Which color should be used to fill.|false|
|opacity|no|Number|0.3|How transparent should the fill color be displayed.|false|
|pointRadius|no|Number|8|How big should the corner points be displayed.|false|
|pointLineWidth|no|Number|4|How big should the border of the corner points be displayed.|false|

**Example**

```json
{
    "styleAvoidAreas": {
        "lineColor": [0, 127, 255],
        "lineWidth": 2,
        "fillColor": [0, 127, 255],
        "opacity": 0.3,
        "pointRadius": 8,
        "pointLineWidth": 4
    }
}
```

***

### Datatypes.BatchProcessing {data-toc-label='BatchProcessing'}
Routing-tool directions batch processing options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|enabled|no|Boolean|false|If the batch processing should be enabled for the user.|false|
|active|no|Boolean|false|If the batch processing is active by default.|false|
|limit|no|Number|1000|The maximum amount of rows allowed in the csv file.|false|
|maximumConcurrentRequests|no|Number|3|The maximum concurrent requests allowed to be made by the batch processing task handler.|false|

**Example**

```json
{
    "batchProcessing": {
        "enabled": false,
        "active": false,
        "limit": 1000,
        "maximumConcurrentRequests": 3
    }
}
```

***

### Datatypes.StyleCenter {data-toc-label='StyleCenter'}
Routing-tool isochrones centers style options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|lineColor|no|Number[]|[255, 127, 0]|Which color should be used for the border.|false|
|lineWidth|no|Number|4|How thick should the border be displayed.|false|
|fillColor|no|Number[]|[255, 127, 0]|Which color should be used to fill.|false|
|opacity|no|Number|0.3|How transparent should the fill color be displayed.|false|
|radius|no|Number|8|How big should the waypoint be displayed.|false|

**Example**

```json
{
    "styleCenter": {
        "lineColor": [255, 127, 0],
        "lineWidth": 4,
        "fillColor": [255, 127, 0],
        "opacity": 0.3,
        "radius": 8
    }
}
```

***

### Datatypes.StyleIsochrones {data-toc-label='StyleIsochrones'}

Routing-tool isochrones style options.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|lineWidth|no|Number|2|How thick should the lines be displayed.|false|
|opacity|no|Number|0.65|How transparent the fill color is displayed.|false|
|startColor|no|Number[]|[66, 245, 78]|The starting color for the fill color interpolation calculation.|false|
|endColor|no|Number[]|[245, 66, 66]|The end color for the fill color interpolation calculation.|false|

**Example**

```json
{
    "styleIsochrones": {
        "lineWidth": 2,
        "opacity": 0.65,
        "startColor": [66, 245, 78],
        "endColor": [245, 66, 66]
    }
}
```

***

### Datatypes.Literal {data-toc-label='Literal'}

[type:Clause]: # (Datatypes.Literal.Clause)
[type:Field]: # (Datatypes.Literal.Field)

A `literal` can either have the parameter `clause`, or the parameter `field`. If both are set, the `clause`-part will be ignored.
However, a `field` needs to be wrapped inside a `clause` (as seen in most examples).

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|clause|yes|**[Clause](#datatypesliteralclause)**||Defines the way multiple `literals` should be queried together. Can be seen as a group of `literals`.|true|
|field|no|**[Field](#datatypesliteralfield)**||Representation for the selection field of a service value for the user.|true|

**Examples**

```json
{
    "clause": {
        "type": "and",
        "literals": [
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "gemarkung",
                    "inputLabel": "District",
                    "options": ""
                }
            },
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "flur",
                    "inputLabel": "Cadastral District",
                    "options": "flur"
                }
            }
        ]
    }
}
```

```json
{
    "field": {
        "queryType": "equal",
        "fieldName": "rivers",
        "inputLabel": "Rivers",
        "options": [
            {
                "id": "0",
                "displayName": "Elbe"
            },
            {
                "id": "1",
                "displayName": "Moselle"
            },
            {
                "id": "2",
                "displayName": "Rhine"
            }
        ]
    }
}
```

***

#### Datatypes.Literal.Clause {data-toc-label='Clause'}

[type:Literal]: # (Datatypes.Literal)

A `clause` defines the way multiple `literals` should be queried together.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|literals|yes|**[Literal](#datatypesliteral)**[]||Array of `literals`.|true|
|type|yes|enum["and", "or"]||The way the `literals` in this `clause` should be queried together.|false|

**Example**

```json
{
    "clause": {
        "type": "and",
        "literals": [
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "gemarkung",
                    "inputLabel": "District",
                    "options": ""
                }
            },
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "flur",
                    "inputLabel": "Cadastral District",
                    "options": "flur"
                }
            }
        ]
    }
}
```

***

#### Datatypes.Literal.Field {data-toc-label='Field'}

[type:Option]: # (Datatypes.Literal.Field.Option)

A `field` represents the selection field for a value in the service.
It is possible to use a `field` for multiple search parameters. To do this, each parameter needs to be an array where each element of the array corresponds to a single parameter of the service.
A configuration like

```json
{
    "field": {
        "queryType": ["equal", "like"],
        "fieldName": ["flst", "gmkr"],
        "inputLabel": ["Parcel", "Communal district number"]
    }
}
```

would create a single `field` with which the user can decide whether he wants to use the input field to search for a `Parcel` or a `Communal district number` by selecting the alue through a dropdown. If the values are not an array, a label for the `field` will be shown instead of the dropdown.

If the parameter `options` is set, a select field is used, otherwise a simple text input.
If `options` is a String, it is important that the order of the fields corresponds to the order of the objects in the external source (`selectSource`).
Assume the source looks like this:

```json
{
    "one": {
        "foo": {
            "id": "foo_one",
            "bar": ["f1_bar_one", "f1_bar_two"]
        }
    },
    "two": {
        "foo": {
            "id": "foo_two",
            "bar": ["f2_bar_one", "f2_bar_two"]
        }
    }
}
```

Then the order of the config should look like this:

```json
{
    "clause": {
        "type": "and",
        "literals": [
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "objects",
                    "inputLabel": "Objects",
                    "options": ""
                }
            },
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "foo",
                    "inputLabel": "Foo",
                    "options": "foo"
                }
            },
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "bar",
                    "inputLabel": "Bar",
                    "options": "foo.bar"
                }
            }
        ]
    }
}
```

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|defaultValue|no|String/String[]||If the field is not `required`, this value will be used on sending.|false|
|fieldName|yes|String/String[]||The wfs service parameter name for the comparison.|false|
|inputLabel|yes|String/String[]||Label for the UI element. May be a translation key.|false|
|inputPlaceholder|no|String/String[]||Placeholder for the UI element; only used if `options` is not set. Should contain example data. May be a translation key.|false|
|inputTitle|no|String/String[]||Value to be shown when hovering the UI element. May be a translation key.|false|
|required|no|Boolean/Boolean[]|false|Whether the field has to be filled.|false|
|options|no|String/**[Option](#datatypesliteralfieldoption)**[]/String[]||If `options` is an array (irrelevant if of strings or **[Option](#datatypesliteralfieldoption)**), the given values are used for selection. These options may either match **[Option](#datatypesliteralfieldoption)** or are plain values (`String` / `Number`). In the latter case, the plain value is used as both id and `displayName`. <br /> If it is a String, there are different possibilities: <ul><li>If the String is empty, the keys of **[selectSource](#portalconfigmenusectionsmoduleswfssearchsearchinstance)** are used.</li><li>If the String is not empty, it is assumed that another field with `options=""` exists; otherwise the field is disabled. It is also assumed that the String represents an array in **[selectSource](#portalconfigmenusectionsmoduleswfssearchsearchinstance)** providing further options.</li></ul> **Note**: It is also possible to declare the `options` as a multidimensional array **[Option](#datatypesliteralfieldoption)**[][]. However, this can't be used as a parameter for Masterportal Admin. This should be used if an **[Option](#datatypesliteralfieldoption)**[] is wanted for a `field` that uses multiples parameters.|true|
|queryType|no|enum["equal", "like"]/enum["equal", "like"][]||Required for usage with WFS@1.1.0. The `queryType` declared how the field should be compared to the value in the service.|false|
|usesId|no|Boolean/Boolean[]|null|Only relevant if the Parameters `options` is set and an empty String (root element). Determines whether the key of the object of the external source should be used as a value for the query or if the object has an Id which should be used.|false|

**Example**

```json
{
    "field": {
        "queryType": "equal",
        "fieldName": "rivers",
        "inputLabel": "Rivers",
        "options": [
            {
                "displayName": "Elbe",
                "fieldValue": "0"
            },
            {
                "displayName": "Moselle",
                "fieldValue": "1"
            },
            {
                "displayName": "Rhine",
                "fieldValue": "2"
            }
        ]
    }
}
```

***

##### Datatypes.Literal.Field.Option {data-toc-label='Option'}
A selectable option for a queryable parameter.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|displayName|no|String||Value to be displayed for the value. May be a translation key. If not set, the `id` will be shown.|false|
|fieldValue|yes|String||Value that is supposed to be sent to the service.|false|

**Example**

```json
{
    "fieldValue": "elbe",
    "displayName": "Elbe"
}
```

***

## Datatypes.ResultList {data-toc-label='ResultList'}
Settings for the output of the found features in the result list.
By specifying `showAll` all attributes of the found features are displayed in their original form.
By using an object, a key of the object must represent one of the attributes of the feature,
and the corresponding value defines the textual output of that attribute.

**Examples**:

```json
{
    "resultList": "showAll"
}
```

```json
{
    "resultList": {
        "schulname": "School name",
        "abschluss": "Degree"
    }
}
```

***

### Datatypes.RequestConfig {data-toc-label='RequestConfig'}

[type:Gazetteer]: # (Datatypes.RequestConfig.Gazetteer)
[type:LikeFilter]: # (Datatypes.RequestConfig.LikeFilter)

Information about the WFS service that is supposed to be requested.
Either `layerId` or `restLayerId` need to be present. If `layerId` is chosen, the layer needs to be configured in the **[config.json](config.json.md)**.
If both are defined `restLayerId` is used.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|gazetteer|no|**[Gazetteer](#datatypesrequestconfiggazetteer)**||Declares whether the used WFS service is a WFS-G, which needs to be parsed differently.|false|
|layerId|no|String||Id of the WFS service that should be queried. Information is fetched from **[services.json](../Global-Config/services.json.md)**.|false|
|likeFilter|no|**[LikeFilter](#datatypesrequestconfiglikefilter)**|{"wildCard": "*", "singleChar": "#", "escape": "!"}|The configuration of the service for the like filter.|true|
|maxFeatures|no|Number/String|8|Maximum amount of features that are supposed to be returned from the service. Alternatively, the String `showAll` can be assigned to `maxFeatures` to load all features.|false|
|restLayerId|no|String||Id of the WFS service that should be queried. Information is fetched from **[rest-services.json](../Global-Config/rest-services.json.md)**.|false|
|storedQueryId|no|String||The id of the Stored Query of the WFS that should be used to query the service. If this field is set, it is assumed that a WFS@2.0.0 is used.|false|

**Example**

```json
{
    "requestConfig": {
        "restLayerId": "1234",
        "storedQueryId": "Flurstuecke"
    }
}
```

***

#### Datatypes.RequestConfig.LikeFilter {data-toc-label='LikeFilter'}
Values inside a filter for a WFS service can be compared with an `equal` or a `like`.
If the comparison should be with a `like` then the filter needs additional properties. These may vary in value and property definition.
For the documentation, it is assumed that the properties are called `wildCard`, `singleChar` and `escapeChar`; variations like e.g. `single` and `escape` are possible and need to be configured in line with the service. All key-value pairs are used in the request as given.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|wildCard|yes|String|"*"|The wildcard value for the like filter.|true|
|singleChar|yes|String|"#"|The single character value for the like filter.|true|
|escapeChar|yes|String|"!"|The escape character value for the like filter.|true|

**Example**

In this example case, the key for `escapeChar` deviates.

```json
{
    "wildCard": "*",
    "singleChar": "#",
    "escape": "!"
}
```

***

#### Datatypes.RequestConfig.Gazetteer {data-toc-label='Gazetteer'}
Parameters that are exclusively needed for using a WFS-G (Gazetteer).

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|namespaces|yes|String/String[]||The namespaces need to be provided.|false|
|memberSuffix|yes|enum["member","featureMember"]||The suffix of the featureType needs to be specified.|false|

**Example**

```json
{
    "gazetteer": {
        "namespaces": [
            "http://www.adv-online.de/namespaces/adv/dog",
            "http://geodienste.hamburg.de/dog_gages/services/wfs_dog?SERVICE=WFS&VERSION=2.0.0&REQUEST=DescribeFeatureType&OUTPUTFORMAT=application/gml+xml;+version=3.2&TYPENAME=dog:Flurstueckskoordinaten&NAMESPACES=xmlns(dog,http://www.adv-online.de/namespaces/adv/dog)"
        ],
        "memberSuffix": "memberSuffix"
    }
}
```

***

### Datatypes.Suggestions {data-toc-label='Suggestions'}
Configuration for the suggestions of the user input.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|featureType|no|String||If given, the query will be sent with this featureType instead of the one configured for the service itself. Only usable if the layer was defined in the **[services.json](../Global-Config/services.json.md)**.|false|
|length|no|Number|3|The query is triggered when the length of the input is at least as long as this parameter.|false|

***
