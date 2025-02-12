# Grouped Layers

There are 2 types of grouped layers. Both are defined by an id array.
To address such layers via url parameters or via API, the id is converted from an array into a hyphen-separated string.

**Example for the ids**

config.json
```json
"id": [
        "100",
        "200",
        "300"
    ],
```
is converted in the code to:
```json
id = "100-200-300"
```

## 1. requests are evaluated by the server using a specific parameter
- all layers whose ids are specified must match in the `url` and `typ` fields
- no specific `typ` in the config.json, the 'typ' of the individual layers is used
- only one layer is created in the code (no group layer), which contains all the individual `layers` values in the `layers` field, which are then evaluated by the server

**Example**

```json
{
    "id": [
        "717",
        "718",
        "719",
        "720",
        "13712",
        "13709",
        "13714",
        "13716"
    ],          
    "name": "Geobasiskarten (colored)",
    "shortname": "Map colored"
}
```


## 2. a group of different layers, without special server evaluation
- `"typ"="GROUP"` in the config.json
- all layers whose ids are specified can differ in the `url` and `type` fields
- Optionally, attributes on the grouped layers can be overwritten under `children`. Exception: `visibility` is not overwritten. All ids in the id array must have an equivalent in the `children`. 
- a [GroupLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Group-LayerGroup.html) is created in the code, which contains all grouped layers

**Examples**

A group with 3 layers of type `WMS` with `children`, in which e.g. a `gfiTheme` is set.

```json
{ 
    "id": [ "4905", "1420", "4561"], 
    "typ": "GROUP",
    "name": "Gruppe WMS - Schwermetallmessungen, Sturmflut und Eventlotse",
    "visibility": true,
    "children" :[
        {
            "id": "4905",
            "name": "Schwermetallmessungen",
            "typ": "WMS"
        },
        {
            "id": "4561",
            "name": "Eventlotse Hamburgconvention",
            "typ": "WMS",
            "minScale": "1000",
            "maxScale": "20000"
        },
        {
            "id": "1420",
            "gfiTheme": "sturmflut",
            "minScale": "2000",
            "maxScale": "10000"
        }
    ]
}
```

A group with 3 layers with different `types` with `children`, in which e.g. the `styleId` is set.

```json
{ 
    "id": [ "27926", "1711", "18104"], 
    "typ": "GROUP",
    "name": "Gruppe OAF, WFS, SensorThings",
    "visibility": false,
    "showInLayerTree": true,
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
A group without `children`. The grouped layers are used as they are specified in the [services.json](../User/Global-Config/services.json.md).
The `styleId` is overwritten here and is applied to all grouped layers.

```json
 {
    "id": [ "20501", "20502", "20503", "20504" ],
    "name": "Gruppe Freizeitrouten und Radfernwege (4 WFS Layer)",
    "typ": "GROUP",
    "styleId": "4515",
    "visibility": true
}
```            