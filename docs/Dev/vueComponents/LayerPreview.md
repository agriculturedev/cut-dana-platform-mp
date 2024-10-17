# The LayerPreview module

To show a preview of a layer use the module LayerPreview.
In a div a small map image is displayed that can be used in other components.
For WMS and WMTS layers, the image is fetched as a GetMap request. If not specified, a centered map section is loaded. For VectorTile layers, an image is stored in the file system.

These layer-types are supported: 
```json
"WMS", "WMTS", "VectorTile"
```

## Vue-props of the LayerPreview

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|layerId|yes|String||Id of the layer.|
|center|no|Array/String|initial center of the map|Center coordinates for the preview.|
|zoomLevel|no|Number|initial zoom-level of the map|Zoom-level for the preview.|
|radius|no|Number|1000|Radius of the extent.|
|checkable|no|Boolean|false|If true, preview is checkable.|
|checked|no|Boolean|false|If true, preview is checked.|
|customClass|no|String|""|Custom css-class to overwrite style, NOTICE: maybe `!important` must be used.|
|currentlyVisible|no|Boolean|false|If `true`, preview is highlighted by a thick border if the layer is currently visible.|

## emits

If property `checkable` is true, `previewClicked` is emitted to parent component.

## Properties at the layer in services.json at layer in Object `preview`

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|center|no|Array/String|initial center of the map|Center coordinates for the preview.|
|zoomLevel|no|Number|initial zoom-level of the map|Zoom-level for the preview.|
|radius|no|Number|1000|Radius of the extent.|
|customClass|no|String|""|Custom css-class to overwrite style, NOTICE: maybe `!important` must be used.|
|src|no|String||Path to preview image.|

Example of a WMS-layer:
```json
"id": "1234",
"name": "Digital orthophotos",
"shortname": "Orthophotos",
"typ": "WMS",
"preview":{
            "zoomLevel": 6,
            "center":"566245.97,5938894.79",
            "radius": 500
          }
```

Example of a VectorTile-layer:
```json
"id": "VectorTile",
"name": "ArcGIS VectorTile",
"shortname": "VectorTile",
"typ": "VectorTile",
"preview":{
  "src": "./resources/vectorTile.png"
},
```

Example of usage in a SFC:

```js
import LayerPreview from "../../../shared/modules/layerPreview/components/LayerPreview.vue";

// [...]

 components: {
        LayerPreview
    },

// [...]

<template lang="html">

// [...]

 <LayerPreview
    :layer-id="layer.id"
    :checkable="true"
    :checked="false"
    :zoom-level="typeof layer.preview?.zoomLevel === 'number'? layer.preview?.zoomLevel : null"
    :radius="layer.preview?.radius ? layer.preview?.radius : null"
    :center="layer.preview?.center ? layer.preview?.center : null"
    :custom-class="layer.preview?.customClass ? layer.preview?.customClass : null"
    @preview-clicked="clicked()"
/>
```
