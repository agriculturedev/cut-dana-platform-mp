# config.json 3.0

Die *config.json* enthält die gesamte Konfiguration der Portal-Oberfläche. In ihr wird geregelt welche Elemente sich wo in der Menüleiste befinden, worauf die Karte zentriert werden soll und welche Layer geladen werden sollen. Hier geht es zu einem **[Beispiel](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/portal/basic/config.json)**.
Die config.json besteht aus der **[portalConfig](#portalconfig)** und der **[layerConfig](#layerconfig)**

**Beispiel**

```json
{
   "portalConfig": {},
   "layerConfig": {}
}
```

***

## portalConfig {data-toc-label='Portal Config'}
Im Abschnitt *portalConfig* können folgende Eigenschaften konfiguriert werden:

1. Konfiguration der Karte und darauf platzierter Elemente (*map*)
2. Einträge im Mainmenu sowie Vorhandenheit jeweiliger Module und deren Reihenfolge (*mainMenu*)
3. Einträge im Secondarymenu sowie Vorhandenheit jeweiliger Module und deren Reihenfolge (*secondaryMenu*)
4. Konfiguration der Fußzeile (*portalFooter*)
5. Konfiguration der Themenauswahl (*tree*)

Es existieren die im Folgenden aufgelisteten Konfigurationen:

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|map|nein|**[map](#portalconfigmap)**||MKonfiguration der Karte und darauf platzierter Elemente.|false|
|mainMenu|nein|**[menu](#portalconfigmenu)**||Hier können die Menüeinträge im Mainmenu und deren Anordnung konfiguriert werden. Die Reihenfolge der Module ist identisch mit der Reihenfolge in der config.json (siehe **[Modules](#portalconfigmenusectionsmodules)**).|false|
|secondaryMenu|nein|**[menu](#portalconfigmenu)**||Hier können die Menüeinträge im Secondarymenu und deren Anordnung konfiguriert werden. Die Reihenfolge der Module ist identisch mit der Reihenfolge in der config.json (siehe **[Modules](#portalconfigmenusectionsmodules)**).|false|
|portalFooter|nein|**[portalFooter](#portalconfigportalfooter)**||Möglichkeit den Inhalt der Fußzeile des Portals zu konfigurieren.|false|
|tree|nein|**[tree](#portalconfigtree)**||Möglichkeit um Einstellungen für den Themenbaum vorzunehmen.|false|

**Beispiel**

```json
{
    "portalConfig": {
        "map": {},
        "mainMenu": {},
        "secondaryMenu": {},
        "portalFooter": {},
        "tree": {}
    }
}
```

***

### portalConfig.map {data-toc-label='Map'}
Konfiguration der Karte und darauf platzierter Elemente.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|baselayerSwitcher|nein|**[baselayerSwitcher](#portalconfigmapbaselayerswitcher)**||Der baselayerSwitcher ermöglicht ein einfaches Wechseln bzw. Auswählen einer Hintergrundkarte.|false|
|controls|nein|**[controls](#portalconfigmapcontrols)**||Mit den Controls kann festgelegt werden, welche Interaktionen in der Karte möglich sein sollen.|false|
|featureViaURL|nein|**[featureViaURL](#portalconfigmapfeatureviaurl)**||Optionale Konfiguration für den URL-Parameter `featureViaURL`. Siehe **[urlParameter](../Misc/urlParameter.md)** für Einzelheiten.|false|
|getFeatureInfo|nein|**[getFeatureInfo](#portalconfigmapgetfeatureinfo)**||Mit der GetFeatureInfo(gfi) lassen sich Informationen zu beliebigen Layern anzeigen. Dabei werden bei einem WMS die Daten über die GetFeatureInfo geladen. Bei Vektordaten (WFS, Sensor, GeoJSON usw.) werden die angezeigten Attribute aus den Daten selbst verwendet.|false|
|layerPills|nein|**[layerPills](#portalconfigmaplayerpills)**||Konfiguration der LayerPills.|false|
|map3dParameter|nein|**[map3dParameter](#portalconfigmapmap3dparameter)**||Cesium Attribute.|false|
|mapMarker|nein|**[mapMarker](#portalconfigmapmapmarker)**||Setzt die Standardwerte des Map Markers außer Kraft. Nützlich für 3D-Marker, da die Overlays von OpenLayers nicht im 3D-Modus dargestellt werden können. Dazu muss der Map Marker als Vektorlayer definiert werden.|false|
|mapView|nein|**[mapView](#portalconfigmapmapview)**||Mit verschiedenen Parametern wird die Startansicht der Karte konfiguriert und der Hintergrund festgelegt, der erscheint wenn keine Karte geladen ist.|false|
|mouseHover|nein|**[mouseHover](#portalconfigmapmousehover)**||Aktiviert die MouseHover-Funktion für Vektorlayer, z.B. WFS oder GeoJSON. Für die Konfiguration pro Layer siehe **[Vector](#layerconfigelementslayersvector)**.|false|
|startingMapMode|nein|String|"2D"|Gibt an in welchem Modus die Karte startet. Möglich sind `2D` und `3D`|false|
|zoomTo|nein|**[zoomTo](#portalconfigmapzoomto)**[]||Konfiguration für die URL-Abfrageparameter `zoomToFeatureId` und `zoomToGeometry`.|false|

**Beispiel**

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
Der baselayerSwitcher ermnöglicht ein einfaches Wechseln bzw. Auswählen eines Layers, der eine Hintergrundkarte beinhaltet (baselayer).

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|active|nein|Boolean|false|Definiert, ob der baselayerSwitcher aktiv ist.|false|
|activatedExpandable|nein|Boolean|false|Gibt an, ob der baselayerSwitcher aufgeklappt ist und alle verfügbaren baselayer angezeigt werden oder nur der aktive, welcher sich auf höchster Ebene befindet.|false|
|singleBaseLayer|nein|Boolean|false|Definiert ob der bisherige Baselayer ausgeblendet wird.|false|
**Beispiel**

```json
"baselayerSwitcher": {
      "active": true,
      "activatedExpandable": false
    }
```

***

#### portalConfig.map.controls {data-toc-label='Controls'}

Mit den Controls kann festgelegt werden, welche Interaktionen in der Karte möglich sein sollen.

Controls können in der config.json in die Ebene "expandable" verschachtelt werden und sind somit nicht mehr in der Leiste an der Seite, sondern über den Button mit den drei Punkten aufklappbar.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|backForward|nein|Boolean/**[backForward](#portalconfigmapcontrolsbackforward)**|false|Zeigt Buttons zur Steuerung der letzten und nächsten Kartenansichten an.|false|
|button3d|nein|Boolean/**[button3d](#portalconfigmapcontrolsbutton3d)**|false|Legt fest, ob ein Button für die Umschaltung in den 3D Modus angezeigt werden soll.|false|
|expandable|nein|Boolean||Mit expandable werden Controls hinter einem Button mit drei Punkten versteckt und lassen sich bei Bedarf aufklappen.|false|
|freeze|nein|Boolean/**[freeze](#portalconfigmapcontrolsfreeze)**|false|Legt fest, ob ein "Ansicht sperren" Button angezeigt werden soll.|false|
|fullScreen|nein|Boolean/**[fullScreen](#portalconfigmapcontrolsfullscreen)**|false|Ermöglicht dem User die Darstellung im Vollbildmodus (ohne Tabs und Adressleiste) per Klick auf den Button. Ein erneuter Klick auf den Button wechselt wieder in den normalen Modus.|false|
|orientation|nein|**[orientation](#portalconfigmapcontrolsorientation)**||Orientation nutzt die geolocation des Browsers zur Standortbestimmung des Nutzers.|false|
|rotation|nein|**[rotation](#portalconfigmapcontrolsrotation)**|false|Control, das die aktuelle Rotation der Karte anzeigt. Per Klick kann die Maprotation wieder auf Norden gesetzt werden. Es können 2 weitere Control-Button konfiguriert werden, die die Karte im und gegen den Uhrzeigersinn drehen. Siehe auch unter `mapInteractions` in **[config.js.md](config.js.md)**.|false|
|startModule|nein|**[startModule](#portalconfigmapcontrolsstartmodule)**|false|Zeigt Buttons für die konfigurierten Module an. Über diese lassen sich die jeweiligen Module öffnen und schließen.|false|
|tiltView|nein|Boolean/**[tiltView](#portalconfigmapcontrolstiltview)**|false|Zeigt zwei Buttons an, mit denen sich die Kamera in der 3D-Szene hoch- bzw. runterkippen lässt.|false|
|totalView|nein|Boolean/**[totalView](#portalconfigmapcontrolstotalview)**|false|Zeigt einen Button an, mit dem die Startansicht mit den initialen Einstellungen wiederhergestellt werden kann.|false|
|zoom|nein|Boolean/**[zoom](#portalconfigmapcontrolszoom)**|false|Legt fest, ob die Zoombuttons angezeigt werden sollen.|false|

**Beispiel**

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
Das Attribut backForward kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt es die Buttons zur Steuerung der letzten und nächsten Kartenansichten mit den Defaulteinsellungen an. Ist es vom Typ Object, so gelten folgende Attribute

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|iconForward|nein|String|"skip-end-fill"|Über den Parameter iconForward kann ein anderes Icon für das Vorschalten der Kartenansicht verwendet werden.|false|
|iconBack|nein|String|"skip-start-fill"|Über den Parameter iconBack kann ein anderes Icon für das Zurückschalten der Kartenansicht verwendet werden.|false|
|supportedDevices|nein|String|["Desktop"]|Geräte auf denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|supportedMapModes|nein|String|["2D", "3D"]|Karten modi in denen das Modul verwendbar ist und im Menü angezeigt wird.|false|

**Beispiel backForward als Object:**

```json
"backForward" : {
    "iconForward": "bi-skip-forward-fill",
    "iconBack": "bi-skip-backward-fill"
}
```

**Beispiel backForward als Boolean:**

```json
"backForward": true
```

***

##### portalConfig.map.controls.button3d {data-toc-label='Button 3D'}
Das Attribut button3d kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt es den Button zum Umschalten in den 3D Modus an. Ist es vom Typ Object, so gelten folgende Attribute

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon2d|nein|String|"https://geodienste.hamburg.de/lgv-config/img/badge-2d.svg"|Über den Parameter icon kann ein anderes Icon für das Control button3d verwendet werden, wenn die Karte im 3D Modus ist.|false|
|icon3d|nein|String|"badge-3d"|Über den Parameter icon kann ein anderes Icon für das Control button3d verwendet werden, wenn die Karte im 2D Modus ist.|false|
|supportedDevices|nein|String|["Desktop", "Mobile"]|Geräte auf denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|supportedMapModes|nein|String|["2D", "3D"]|Karten modi in denen das Modul verwendbar ist und im Menü angezeigt wird.|false|

***

##### portalConfig.map.controls.freeze {data-toc-label='Freeze'}
Bildschirm wird gesperrt, sodass keine Aktionen mehr in der karte ausgeführt werden können. Legt fest, ob ein "Ansicht sperren" Button angezeigt werden soll.

Das Attribut freeze kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt es die Buttons an, die in den Defaulteinstellungen gesetzt sind. Ist es vom Typ Object, so gelten folgende Attribute:

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-lock"|Über den Parameter icon kann ein anderes Icon für das Control Freeze verwendet werden.|false|
|supportedDevices|nein|String|["Desktop"]|Geräte auf denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|supportedMapModes|nein|String|["2D", "3D"]|Karten modi in denen das Modul verwendbar ist und im Menü angezeigt wird.|false|

***

##### portalConfig.map.controls.fullScreen {data-toc-label='Full Screen'}
Ermöglicht dem User die Darstellung im Vollbildmodus (ohne Tabs und Adressleiste) per Klick auf den Button. Ein erneuter Klick auf den Button wechselt wieder in den normalen Modus.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|iconArrow|nein|String|"arrows-fullscreen"|Über den Parameter iconArrow kann ein anderes Icon für den Button zum Einschalten des Vollbildmodus verwendet werden.|false|
|iconExit|nein|String|"fullscreen-exit"|Über den Parameter iconExit kann ein anderes Icon für den Button zum beenden des Vollbildmodus verwendet werden.|false|
|supportedDevices|nein|String|["Desktop"]|Geräte auf denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|supportedMapModes|nein|String|["2D", "3D"]|Karten modi in denen das Modul verwendbar ist und im Menü angezeigt wird.|false|

**Beispiel fullScreen als Object**

```json
"fullScreen" : {
    "iconArrow": "arrows-fullscreen",
    "iconExit": "fullscreen-exit"
},
```

**Beispiel fullScreen als Boolean**

```json
"fullScreen": true
```

***

##### portalConfig.map.controls.orientation {data-toc-label='Orientation'}
Orientation nutzt die geolocation des Browsers zur Standortbestimmung des Nutzers. Es wird eine Liste von Features in der Umgebung des Standortes angezeigt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|customPosition|nein|String|"common:modules.controls.orientation.poiChoiceCustomPosition"|Damit kann gesteuert werden, welcher Text für `customPosition` in der poiChoice angezeigt wird. Das hier angegebene muss dem Pfad für den Parameter in der Übersetzungsdatei entsprechen.|false|
|iconGeolocate|nein|String|"bi-geo-alt"|Icon das im Controls-Menü für das Control Standpunkt angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|iconGeolocatePOI|nein|String|"bi-record-circle"|Icon das im Controls-Menü für das Control "In meiner Nähe" angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|onlyFilteredFeatures|nein|boolean|false|Wenn 'onlyFilteredFeatures' true ist, werden in der Ergebnissanzeige von poi nur über den Filter gefilterte Features berücksichtigt.|false|
|poiDistances|nein|Boolean/Integer[]|true|Bei poiDistances=true werden die Defaultwerte verwendet. Legt fest, ob "In meiner Nähe" geladen wird und zeigt eine Liste von Features in der Umgebung an. Bei Angabe eines Array werden die darin definierten Abstände in Metern angeboten. Bei Angabe von true werden diese Abstände angeboten: [500,1000,2000].|false|
|supportedDevices|nein|String|["Desktop", "Mobile"]|Geräte auf denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|supportedMapModes|nein|String|["2D", "3D"]|Karten modi in denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|zoomMode|nein|enum["once", "always"]|"once"|Der Standort wird bestimmt und der Marker wird an- oder ausgeschaltet. Dafür ist es notwendig das Portal über **https** zu laden. Modi: *once* (Es wird einmalig auf den Standort gezoomt. ), *always* (Die Karte wird mit jedem Einschalten auf den Standort gezoomt.).|false|

**Beispiel mit poiDistances vom Typ Boolean**

```json
"orientation": {
    "iconGeolocate": "bi-geo-alt",
    "iconGeolocatePOI": "bi-record-circle",
    "zoomMode": "once",
    "poiDistances": true
}
```

**Beispiel mit poiDistances vom Typ Integer[]**

```json
"orientation": {
    "zoomMode": "once",
    "poiDistances": [500, 1000, 2000, 5000]
}
```

***

##### portalConfig.map.controls.rotation {data-toc-label='Rotation'}
Steuert die Anzeige von 3 Control-Buttons: "Rotation zurücksetzen", "Im Uhrzeigersinn drehen" und "Gegen den Uhrzeigersinn drehen" sowie die Anzeige einer Kompass-Rose zur Navigation in 2D und/oder 3D. Die Kompass-Rose wird nicht auf mobilen Geräten angezeigt.
Das Attribut rotation kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist und auf true gesetzt ist, zeigt es den Button "Rotation zurücksetzen" nur an, wenn die Maprotation ungleich Norden/0 ist. Die beiden anderen Buttons werden immer angezeigt. Die Kompass-Rose wird dann nur in 3D angezeigt.
Ist es vom Typ Object, so gelten folgende Attribute:

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|compass2d|nein|Boolean|false|Steuert die Anzeige der Kompass-Rose in 2D.|false|
|compass3d|nein|Boolean|true|Steuert die Anzeige der Kompass-Rose in 3D.|false|
|moveDistance|nein|Number|1000|Distanz in Meter, die bei Klick auf die Bewegungs-Pfeile der Kompass-Rose genutzt wird.|false|
|resetRotationIcon|nein|String|"bi-cursor"|Icon für den Button "Rotation zurücksetzen". Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|rotateCounterClockwiseIcon|nein|String|"bi-arrow-counterclockwise"|Icon für den Button "Gegen den Uhrzeigersinn drehen". Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|rotateClockwiseIcon|nein|String|"bi-arrow-clockwise"|Icon für den Button "Im Uhrzeigersinn drehen". Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|rotationAngle|nein|Number|22.5|Winkel um den die Karte gedreht wird bei Klick auf einen der Dreh-Buttons.|false|
|rotationIcons|nein|Boolean|true|Die Buttons "Im Uhrzeigersinn drehen" und "Gegen den Uhrzeigersinn drehen" werden angezeigt.|false|
|showResetRotation|nein|Boolean|true|Der Button "Rotation zurücksetzen" wird angezeigt.|false|
|showResetRotationAlways|nein|Boolean|false|Ist das Attribut auf true gesetzt, wird das Control permanent angezeigt. Per default wird es nur angezeigt, wenn die Maprotation ungleich 0/Norden ist.|false|
|supportedDevices|nein|String|["Desktop", "Mobile"]|Geräte auf denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|supportedMapModes|nein|String|["2D", "3D"]|Karten modi in denen das Modul verwendbar ist und im Menü angezeigt wird.|false|

**Beispiel rotation als Object:**

```json
"rotation": {
    "compass2d": true,
    "moveDistance": 2500,
    "showResetRotation": true,
    "showResetRotationAlways": false,
    "rotationIcons": false
}
```

**Beispiel rotation als Boolean:**

```json
"rotation": true
```

***

##### portalConfig.map.controls.startModule {data-toc-label='Start Module'}
Das Attribut startModule muss vom Typ Object sein. Es wird für jedes konfigurierte Modul ein Button angezeigt, über den sich das jeweilige Modul öffen und schließen lässt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|mainMenu|nein|**[mainMenu](#portalconfigmapcontrolsstartmodulemainmenu)**[]||Hier werden die Module zu denen jeweils ein Button angezeigt werden soll konfiguriert. Diese werden beim öffnen in dem `mainMenu` dargestellt.|false|
|secondaryMenu|nein|**[secondaryMenu](#portalconfigmapcontrolsstartmodulesecondarymenu)**[]||Hier werden die Module zu denen jeweils ein Button angezeigt werden soll konfiguriert. Diese werden beim öffnen in dem `secondaryMenu` dargestellt.|false|
|supportedDevices|nein|String|["Desktop", "Mobile", "Table"]|Geräte auf denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|supportedMapModes|nein|String|["2D", "3D"]|Karten modi in denen das Modul verwendbar ist und im Menü angezeigt wird.|false|

**Beispiel**

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
Hier werden die Module zu denen jeweils ein Button angezeigt werden soll konfiguriert. Diese werden beim Öffnen in dem `mainMenu` dargestellt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|type|nein|String||Type des Modules, das als Control dargestellt und bei Click im MainMenü geöffnet werden soll.|false|

**Beispiel**

```json
"mainMenu": [
    {
        "type": "scaleSwitcher"
    }
]
```

***

###### portalConfig.map.controls.startModule.secondaryMenu {data-toc-label='Secondary Menu'}
Hier werden die Module zu denen jeweils ein Button angezeigt werden soll konfiguriert. Diese werden beim Öffnen in dem `secondaryMenu` dargestellt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|type|nein|String||Type des Modules, das als Control dargestellt und bei Click im SecondaryMenü geöffnet werden soll.|false|#

**Beispiel**

```json
"secondaryMenu": [
    {
        "type": "scaleSwitcher"
    }
]
```

***

##### portalConfig.map.controls.tiltView {data-toc-label='Tilt View'}
Zeigt zwei Buttons an, mit denen sich die Kamera in der 3D-Szene hoch- bzw. runterkippen lässt.

Das Attribut tiltView kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt es die Buttons an, die in den Defaulteinstellungen gesetzt sind. Ist es vom Typ Object, so gelten folgende Attribute:

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|tiltDownIcon|nein|String|"bi-caret-down-square"|Über den Parameter tiltDownIcon kann ein anderes Icon für das runterkippen der Kamera verwendet werden.|false|
|tiltUpIcon|nein|String|"bi-caret-up-square"|Über den Parameter tiltUpIcon kann ein anderes Icon für das hochkippen der Kamera verwendet werden.|false|
|supportedDevices|nein|String|["Desktop"]|Geräte auf denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|supportedMapModes|nein|String|["3D"]|Karten modi in denen das Modul verwendbar ist und im Menü angezeigt wird.|false|

**Beispiel tiltView als Object**

```json
"tiltView" : {
    "tiltDownIcon": "bi-caret-down-square",
    "tiltUpIcon": "bi-caret-up-square",
},
```

**Beispiel tiltView als Boolean**

```json
"tiltView": true
```

***

##### portalConfig.map.controls.totalView {data-toc-label='Total View'}
Zeigt einen Button an, mit dem die Startansicht mit den initialen Einstellungen wiederhergestellt werden kann.

Das Attribut totalView kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt es den Button an, der in den Defaulteinstellungen gesetzt ist. Ist es vom Typ Object, so gelten folgende Attribute:

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-skip-backward-fill"|Über den Parameter icon kann ein anderes Icon für das Zurückschalten zur Startansicht verwendet werden.|false|
|supportedDevices|nein|String|["Desktop"]|Geräte auf denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|supportedMapModes|nein|String|["2D", "3D"]|Karten modi in denen das Modul verwendbar ist und im Menü angezeigt wird.|false|

**Beispiel totalView als Object**

```json
"totalView" : {
    "icon": "bi-skip-forward-fill"
},
```

**Beispiel totalView als Boolean**

```json
"totalView": true
```

***

##### portalConfig.map.controls.zoom {data-toc-label='Zoom'}
Legt fest, ob die Zoombuttons angezeigt werden sollen.

Das Attribut zoom kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt es die Buttons an, die in den Defaulteinstellungen gesetzt sind. Ist es vom Typ Object, so gelten folgende Attribute:

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|iconIn|nein|String|"bi-plus-lg"|Über den Parameter icon kann ein anderes Icon für hereinzoomen verwendet werden.|false|
|iconOut|nein|String|"bi-dash-lg"|Über den Parameter icon kann ein anderes Icon für herauszoomen verwendet werden.|false|
|supportedDevices|nein|String|["Desktop"]|Geräte auf denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|supportedMapModes|nein|String|["2D", "3D"]|Karten modi in denen das Modul verwendbar ist und im Menü angezeigt wird.|false|

**Beispiel zoom als Object**

```json
"zom" : {
    "iconIn": "bi-plus-lg",
    "iconOut": "bi-dash-lg"
},
```

**Beispiel zoom als Boolean**

```json
"zoom": true
```

***

#### portalConfig.map.featureViaURL {data-toc-label='Feature Via URL'}
Optionale Konfiguration für den URL-Parameter `featureViaURL`. Siehe **[urlParameter](../Misc/urlParameter.md)** für Einzelheiten.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|epsg|nein|Integer|4326|EPSG-Code für das Koordinatenreferenzsystem, in das die Koordinaten übersetzt werden sollen.|false|
|layers|ja|**[layers](#portalconfigmapfeatureviaurllayers)**[]||Layerkonfigurations-Array für bestimmte Features.|false|
|zoomTo|nein|String/String[]||Id der **[layers](#portalconfigmapfeatureviaurllayers)** oder deren Array, auf die das Masterportal anfänglich zoomt. Wenn keine angegeben werden, wird die übliche anfängliche Zentralkoordinate verwendet.|false|

**Beispiel:**

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
Die beschriebenen Parameter gelten für jeden Eintrag des Arrays **[layers](#portalconfigmapfeatureviaurllayers)**.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|ja|String||Eindeutige ID für den zu erstellenden Layer|false|
|geometryType|ja|enum["LineString", "Point", "Polygon", "MultiPoint", "MultiLineString", "MultiPolygon"]||Geometrietyp des anzuzeigenden Merkmals.|false|
|name|ja|String||Layername, der im Themenbaum, in der Legende und im GFI-Pop-up angezeigt wird.|false
|styleId|nein|String||Für das Merkmal zu verwendende StyleId, die sich auf die **[style.json](../Global-Config/style.json.md)** bezieht.|false|

**Beispiel:**

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
Zeigt Informationen zu einem abgefragten Feature ab, indem GetFeatureInfo-Requests oder GetFeature-Requests oder geladene Vektordaten abgefragt werden.

Bei allen GFI-Abfragen, außer dem direkten Beziehen von HTML, welches durch das Konfigurieren von `"text/html"` als `"infoFormat"` an einem WMS geschieht, wird das Zeichen "|" als Zeilenumbruch interpretiert. Es ist ebenso möglich `"\r\n"` oder `"\n"` zu verwenden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|centerMapToClickPoint|nein|Boolean|false|Wenn der Parameter auf true gesetzt wird, verschiebt sich die Karte beim Klick auf ein Feature so, dass das Feature im Mittelpunkt der sichtbaren Karte liegt.|false|
|coloredHighlighting3D|nein|**[coloredHighlighting3D](#portalconfigmapgetfeatureinfocoloredhighlighting3d)**||Regeldefinitionen zum Überschreiben des Highlightings von angeklickten 3D tiles.|false|
|hideMapMarkerOnVectorHighlight|nein|Boolean|false|Wenn Wert auf true gesetzt ist, wird der MapMarker beim VectorHighlighting nicht mit angezeigt. Gilt nur für das DetachedTemplate.|false|
|highlightVectorRules|nein|**[highlightVectorRules](#portalconfigmapgetfeatureinfohighlightvectorrules)**||Regeldefinitionen zum Überschreiben des Stylings von abgefragten Vektordaten.|false|
|icon|nein|String|"bi-info-circle-fill"|CSS Klasse des Icons, das vor dem GFI im Menu angezeigt wird.|false|
|menuSide|nein|String|"secondaryMenu"|Gibt an in welchem Menü die Informationen angezeigt werden sollen.|false|
|name|ja|String|"common:modules.getFeatureInfo.name"|Name des Moduls im Menü.|false|

**Beispiel einer GetFeatureInfo Konfiguration**

```json
"getFeatureInfo": {
    "name":"Informationen abfragen",
    "icon":"bi-info-circle-fill",
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

**Beispiel einer GetFeatureInfo Konfiguration zur Informationsabfrage von Features**

```json
"getFeatureInfo":{
    "name":"Informationen abfragen"
}
```

***

##### portalConfig.map.getFeatureInfo.coloredHighlighting3D {data-toc-label='Colored Highlighting 3D'}
Highlight Einstellungen von 3D Tiles.
Falls z. B. ein Gebäude per Linksklick selektiert wurde, wird es in der definierten Farbe gehighlighted.
Für mehr Informationen über die Farbmöglichkeiten: **[Color-documentation](https://cesium.com/learn/cesiumjs/ref-doc/Color.html)**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|color|nein|String/String[]|"RED"|Color kann als Array oder Cesium.Color definiert werden(z. B. "GREEN" für Cesium.Color.GREEN)|false|
|enabled|nein|Boolean|true|False falls coloredHighlighting3D disabled ist.|false|

**Beispiel Array**

```json
"coloredHighlighting3D": {
    "enabled": true,
    "color": [0, 255, 0, 255]
}
```

**Beispiel Cesium.Color**

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

Liste der Einstellungen zum Überschreiben von Vektorstyles bei GetFeatureInfo Abfragen.

Hinweis: Das Highlighting funktioniert nur, wenn der Layer in der config.json über eine gültige StyleId verfügt!

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fill|nein|**[Fill](#datatypesfill)**|[255, 255, 255, 0.5]|Mögliche Einstellung: `color`|false|
|image|nein|**[Image](#datatypesimage)**|1|Mögliche Einstellung: `scale`|false|
|stroke|nein|**[Stroke](#datatypesstroke)**|1|Mögliche Einstellung: `width`|false|
|text|nein|**[text](#portalconfigmapgetfeatureinfohighlightvectorrulestext)**||Mögliche Einstellung: `scale`|false|


***

###### portalConfig.map.getFeatureInfo.highlightVectorRules.text {data-toc-label='Text'}
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|scale|nein|Float|1|Mögliche Einstellung: scale|false|

**Beispiel**

```json
"text": {
    "scale": 2
}
```

***

#### portalConfig.map.layerPills {data-toc-label='Layer Pills'}
Konfiguration, um Einstellungen für die LayerPills vorzunehmen.

Layerpills sind Buttons, die oberhalb der Karte die ausgewählten Layer anzeigen. Beim Anklicken einer LayerPill, werden die entsprechenden Layerinformationen im Menü angezeigt. Über den Schließen-Button wird der Layer abgewählt. Das Attribut LayerPills wird als Objekt angegeben und beinhaltet folgende Attribute:

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|active|nein|Boolean|false|Gibt an, ob LayerPills aktiv sind.|false|
|mobileOnly|nein|Boolean|false|Definiert, ob LayerPills nur in der mobilen Version aktiv sein sollen.|false|

**Beispiel**

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|camera|nein|**[camera](#portalconfigmapmap3dparametercamera)**||Cesium Scene camera settings in 3D mode.|false|
|fog|nein|**[fog](#portalconfigmapmap3dparameterfog)**||Cesium Scene fog settings in 3D mode.|false|
|fxaa|nein|Boolean|true|activates *fast approximate anti-aliasing*|false|
|globe|nein|**[globe](#portalconfigmapmap3dparameterglobe)**||Cesium Scene globe settings in 3D mode.|false|
|maximumScreenSpaceError|nein|Number|2.0|Detail level in which terrain/raster tiles are fetched. 4/3 is the highest quality level.|false|
|tileCacheSize|nein|Number|100|terrain/raster tile cache size|false|

**Beispiel**

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|altitude|nein|Number||Camera's initial height in meters|false|
|heading|nein|Number||Camera's initial heading in radians|false|
|tilt|nein|Number||Camera's initial tile in radians|false|

**Beispiel**

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|enabled|nein|Boolean|false|True if fog is enabled.|false|

**Beispiel**

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|enableLighting|nein|Boolean|false|Activates light effects on the map based on the sun's position.|false|

**Beispiel**

```json
{
    "globe": {
        "enableLighting": true
    }
}
```

***

#### portalConfig.map.mapMarker {data-toc-label='Map Marker'}
Setzt die Standardwerte des Map Markers außer Kraft. Nützlich für 3D-Marker, da die Overlays von OpenLayers nicht im 3D-Modus dargestellt werden können. Dazu muss der Map Marker als Vektorlayer definiert werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|pointStyleId|nein|String|"defaultMapMarkerPoint"|StyleId, um auf einen `style.json`-Punktstyle zu verweisen. Ist sie nicht gesetzt, wird die Datei `img/mapMarker.svg` verwendet.|false|
|polygonStyleId|nein|String|"defaultMapMarkerPolygon"|StyleId zum Verweis auf einen `style.json`-Polygonstyle.|false|

**Beispiel:**

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

Mit verschiedenen Parametern wird die Startansicht der Karte konfiguriert und der Hintergrund festgelegt, der erscheint wenn keine Karte geladen ist.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|backgroundImage|nein|String|"https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/doc/config.json.md#portalconfigmapview"|Pfad zum alternativen Hintergrund angeben.|false|
|epsg|nein|String|"EPSG:25832"|Der EPSG-Code der Projektion der Karte. Der EPSG-Code muss als namedProjection definiert sein.|false|
|extent|nein|**[Extent](#datatypesextent)**|[510000.0, 5850000.0, 625000.4, 6000000.0]|Der Map-Extent.|false|
|mapInteractions|nein|**[mapInteractions](#portalconfigmapmapviewmapinteractions)**||Überschreibt die ol map Interaktionen. Bietet weitere Konfigurationsmöglichkeiten für Steuerungsverhalten und keyboardEventTarget.|false|
|options|nein|**[option](#portalconfigmapmapviewoption)**[]|[{"resolution":66.14579761460263,"scale":250000,"zoomLevel":0}, {"resolution":26.458319045841044,"scale":100000,"zoomLevel":1}, {"resolution":15.874991427504629,"scale":60000,"zoomLevel":2}, {"resolution": 10.583327618336419,"scale":40000,"zoomLevel":3}, {"resolution":5.2916638091682096,"scale":20000,"zoomLevel":4}, {"resolution":2.6458319045841048,"scale":10000,"zoomLevel":5}, {"resolution":1.3229159522920524,"scale":5000,"zoomLevel":6}, {"resolution":0.6614579761460262,"scale":2500,"zoomLevel":7}, {"resolution":0.2645831904584105,"scale": 1000,"zoomLevel":8}, {"resolution":0.13229159522920521,"scale":500,"zoomLevel":9}]|Die initialen Maßstabsstufen und deren Auflösungen.|false|
|startCenter|nein|**[Coordinate](#datatypescoordinate)**|[565874, 5934140]|Die initiale Zentrumskoordinate.|false|
|startResolution|nein|Float|15.874991427504629|Die initiale Auflösung der Karte aus options. Vorzug vor startZoomLevel.|false|
|startZoomLevel|nein|Integer||Der initiale ZoomLevel aus Options. Nachrangig zu resolution.|false|

**Beispiel:**

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
        "startResolution": 15.874991427504629,
        "startZoomLevel": 1,
        "epsg": "EPSG:25832"
    }
}
```

***

##### portalConfig.map.mapView.mapInteractions {data-toc-label='Map Interactions'}
Überschreibt die ol map Interaktionen. Bietet weitere Konfigurationsmöglichkeiten für Steuerungsverhalten und keyboardEventTarget.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|interactionModes|nein|**[interactionModes](#portalconfigmapmapviewmapinteractions)**|{"dragPan": false, "altShiftDragRotate": false, "pinchRotate": false}| Interaktionseinstellungen für die ol Standardinteraktionen. Wenn nicht gesetzt, wird die Standardeinstellung verwendet.|false|
|keyboardEventTarget|nein|Boolean|false|Möglichkeit, das Tastaturereignisziel für die ol-Map zu setzen z.B. keyboardEventTarget: document|false|

**Beispiel:**

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|altShiftDragRotate|nein|Boolean|true|Drehe die Karte mit alt + shift + drag.|false|
|dragPan|nein|Boolean|false|Ermöglicht es dem Benutzer, die Karte durch Ziehen zu verschieben.|false|
|dragZoom|nein|Boolean|false|Ermöglicht dem Benutzer das Zoomen der Karte durch Klicken und Ziehen auf der Karte.|false|
|pinchRotate|nein|Boolean|false|Ermöglicht es dem Benutzer, die Karte durch Drehen mit zwei Fingern auf einem Touchscreen zu drehen.|false|
|twoFingerPan|nein|Boolean|false|Soll für mobile Geräte ein 2-Finger-Pan anstatt 1-Finger-Pan gesetzt werden?|false|

**Beispiel:**

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
Eine option definiert eine Zoomstufe. Diese muss definiert werden über die Auflösung, die Maßstabszahl und das ZoomLevel. Je höher das ZoomLevel ist, desto kleiner ist die Scale und desto näher hat man gezoomt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|resolution|ja|Number||Auflösung der definierten Zoomstufe.|false|
|scale|ja|Integer||Maßstabszahl der definierten Zoomstufe.|false|
|zoomLevel|ja|Integer||Zoomstufe der definierten Zoomstufe.|false|

**Beispiel einer mapview Option**

```json
{
    "resolution": 611.4974492763076,
    "scale": 2311167,
    "zoomLevel": 0
}
```

***

#### portalConfig.map.mouseHover {data-toc-label='Mouse Hover'}
Aktiviert die MouseHover-Funktion für Vektorlayer, z.B. WFS oder GeoJSON. Für die Konfiguration pro Layer siehe **[Vector](#layerconfigelementslayersvector)**.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|infoText|nein|String|"common:modules.mouseHover.infoText"| Text der angezeigt wird, wenn die Feature die Anzahl von `numFeaturesToShow` übersteigen.|false|
|numFeaturesToShow|nein|Integer|2|Maximale Menge an Elementinformationen pro Tooltip; bei Überschreitung informiert ein Informationstext den Benutzer über den abgeschnittenen Inhalt.|false|

**Beispiel**

```json
"mouseHover": {
    "numFeaturesToShow": 1,
    "infoText": "Beispieltext"
}
```

***

#### portalConfig.map.zoomTo {data-toc-label='Zoom To'}
Konfiguration für die URL-Abfrageparameter `zoomToFeatureId` und `zoomToGeometry`.

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|addFeatures|nein|Boolean|true|Gibt an, ob die gewünschten Merkmale in einer separaten Ebene zur Karte hinzugefügt werden sollen.|false|
|allowedValues|nein|String[]||Nur relevant, wenn `id` gleich `zoomToGeometry` ist. Filtert zusätzlich die in den URL-Abfrageparametern zulässigen Werte.|false|
|id|ja|enum["zoomToFeatureId", "zoomToGeometry"]||Id des URL-Abfrageparameters, auf den sich die Konfiguration bezieht.|false|
|layerId|ja|String||Id des Layers, aus der das Feature geholt werden soll.|false|
|property|ja|String||Name der Eigenschaft, nach der die Merkmale gefiltert werden sollen.|false|
|styleId|nein|String||Nur relevant, wenn `id` gleich `zoomToFeatureId` ist. Id des `styleObject`, das für die Gestaltung der vom Dienst abgerufenen Merkmale verwendet werden soll.|false|

**Beispiel**:

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
Hier können die Menüeinträge jeweils für das MainMenu (in der Desktopansicht links) und SecondaryMenu (in der Desktopansicht rechts) und deren Anordnung konfiguriert werden. Die Reihenfolge der Module ergibt sich aus der Reihenfolge in der *Config.json*.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|currentComponent|nein|String|""|Definiert ein Modul, das initial geöffnet ist.|false|
|expanded|nein|Boolean|false|Definiert ob das jeweilige Menü beim Starten des Portals aus- oder eingeklappt ist.|false|
|width|nein|String|"25%"|Setzt die initiale Breite des jeweiligen Menüs als Prozentwert.|false|
|showDescription|nein|Boolean||Definiert ob eine Beschreibung zu den Modulen im jeweiligen Menü angezeigt werden soll.|false|
|searchBar|nein|**[searchBar](#portalconfigmenusearchbar)**||Über das Eingabefeld Suche können verschiedene Suchen gleichzeitig angefragt werden.|false|
|sections|nein|**[sections](#portalconfigmenusections)**[]||Unterteilung von Modulen im Menü.|false|
|title|nein|**[title](#portalconfigmenutitle)**||Der Titel und weitere Parameter die im Hauptmenü angezeigt werden können.|false|

***

#### portalConfig.menu.searchBar {data-toc-label='Search Bar'}
Konfiguration der Suchleiste. Es lassen sich verschiedene Suchdienste konfigurieren.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minCharacters|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche startet.|false|
|placeholder|nein|String|"common:modules.searchBar.placeholder.address"|Placeholder für das Suchfeld.|false|
|searchInterfaces|nein|**[searchInterfaces](#portalconfigmenusearchbarsearchinterfaces)**[]||Schnittstellen zu Suchdiensten.|false|
|timeout|nein|Integer|5000|Timeout in Millisekunden für die Dienste Anfrage.|false|
|zoomLevel|nein|Integer|7|ZoomLevel, auf das die Searchbar maximal hineinzoomt.|false|

**Beispiel**

```json
{
    "searchBar" {
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
Definitionen der Suchschnittstellen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|bkg|nein|**[bkg](#portalconfigmenusearchbarsearchinterfacesbkg)**||Konfiguration des BKG Suchdienstes.|false|
|elasticSearch|nein|**[elasticSearch](#portalconfigmenusearchbarsearchinterfaceselasticsearch)**||Konfiguration des ElasticSearch Suchdienstes.|false|
|gazetteer|nein|**[gazetteer](#portalconfigmenusearchbarsearchinterfacesgazetteer)**||Konfiguration des Gazetteer Suchdienstes.|false|
|komootPhoton|nein|**[komootPhoton](#portalconfigmenusearchbarsearchinterfaceskomootphoton)**||Konfiguration des Komoot Photon Suchdienstes.|false|
|locationFinder|nein|**[locationFinder](#portalconfigmenusearchbarsearchinterfaceslocationfinder)**||Konfiguration des LocationFinder-Suchdienstes.|false|
|osmNominatim|nein|**[osmNominatim](#portalconfigmenusearchbarsearchinterfacesosmnominatim)**||Konfiguration des OpenStreetMap (OSM) Suchdienstes.|false|
|specialWFS|nein|**[specialWFS](#portalconfigmenusearchbarsearchinterfacesspecialwfs)**||Konfiguration des specialWFS Suchdienstes.|false|
|topicTree|nein|**[topicTree](#portalconfigmenusearchbarsearchinterfacestopictree)**||Konfiguration der Suche im Themenbaum.|false|
|visibleVector|nein|**[visibleVector](#portalconfigmenusearchbarsearchinterfacesvisiblevector)**||Konfiguration der Suche über die sichtbaren Vector Layer.|false|

**Beispiel**

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

Konfiguration des BKG Suchdienstes

**ACHTUNG: Backend notwendig!**

**Um die eigene UUID für den BKG nicht öffentlich zu machen, sollten die URLS (hier "bkg_geosearch" und "bkg_suggest") der restServices im Proxy abgefangen und umgeleitet werden.**

**Beispielhafte Proxy Einstellung**

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|epsg|nein|String|"EPSG:25832"|EPSG-Code des zu verwendenden Koordinatensystems.|false|
|extent|nein|**[Extent](#datatypesextent)**|[454591, 5809000, 700000, 6075769]|Koordinaten-Ausdehnung innerhalb dieser der Suchalgorithmus suchen soll.|false|
|geoSearchServiceId|ja|String||Id des Suchdienstes. Wird aufgelöst in der **[rest-services.json](../Global-Config/rest-services.json.md)**.|false|
|minScore|nein|Number|0.6|Score der die Qualität der Suchergebnisse definiert.|false|
|resultCount|nein|Integer|20|Maximale Anzahl der Suchtreffer die vom Dienst geliefert werden.|false|
|resultEvents|nein|**[resultEvents](#portalconfigmenusearchbarsearchinterfacesresultevents)**|{"onClick": ["setMarker", "zoomToResult"], "onHover": ["setMarker"], "buttons": ["startRouting"]}|Aktionen, die ausgeführt werden, wenn eine Interaktion, z. B. ein Hover oder ein Klick, mit einem Element der Ergebnisliste erfolgt. Folgende events sind möglich: "setMarker", "zoomToResult", "startRouting".|false|
|type|ja|String|"bkg"|Type der Such-Schnittstelle. Definiert welche Such-Schnittstelle konfiguriert ist.|false|

**Beispiel**

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

Konfiguration des Elastic Search Suchdienstes

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|hitIcon|nein|String|"bi-signpost-2"|CSS Icon Klasse des Suchergebnisses. Wird vor dem Namen angezeigt.|false|
|hitMap|nein|**[hitMap](#portalconfigmenusearchbarsearchinterfaceselasticsearchhitmap)**||Mapping Objekt. Mappt die Attribute des Ergebnis Objektes auf den entsprechenden Key.|true|
|hitTemplate|nein|String|"default"|Template in dem die Suchergebnisse (`alle anzeigen`) angezeigt werden. Möglich sind die Werte "default" und "layer".|false|
|hitType|nein|String|"common:modules.searchbar.type.subject"|Typ des Suchergebnisses, wird in der Auswahlliste hinter dem Namen angezeigt. Nutzen Sie den Übersetzungskey aus der Übersetzungsdatei|false|
|resultEvents|nein|**[resultEvents](#portalconfigmenusearchbarsearchinterfacesresultevents)**|{"onClick": ["addLayerToTopicTree"], "buttons": ["showInTree", "showLayerInfo"]}|Aktionen, die ausgeführt werden, wenn eine Interaktion, z. B. ein Hover oder ein Klick, mit einem Element der Ergebnisliste erfolgt. Folgende events sind möglich: "addLayerToTopicTree", "setMarker", "showInTree", "showLayerInfo", "startRouting", "zoomToResult".|false|
|requestType|nein|enum["POST", "GET"]|"POST"|Art des Requests.|false|
|responseEntryPath|nein|String|""|Der Pfad in der response (JSON) zum Attribut, das die gefundenen Features enthält.|false|
|searchInterfaceId|nein|String|"elasticSearch"|Id, die zur Verknüpfung mit der searchbar in der Themensuche dient.|false|
|searchStringAttribute|nein|String|"searchString"|Attributname im payload für den searchString.|false|
|serviceId|ja|String||Id des Suchdienstes. Wird aufgelöst in der **[rest-services.json](../Global-Config/rest-services.json.md)**.|false|
|type|ja|String|"elasticSearch"|Type der Such-Schnittstelle. Definiert welche Such-Schnittstelle konfiguriert ist.|false|

Als zusätzliches property kann `payload` hinzugefügt werden. Es muss nicht zwingend gesetzt sein, und passt zur Beschreibung von CustomObject. Per default wird es als leeres Objekt `{}` gesetzt. Das Objekt beschreibt die Payload, die mitgeschickt werden soll. Es muss das Attribut für den searchString vorhalten. Für weitere Infos zu den nutzbaren Attributen siehe **[Elasticsearch Guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-search.html)**. Dieses Objekt kann im Admintool nicht gepflegt werden, da dort CustomObject nicht definiert ist.

 **Beispiel**

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|coordinate|nein|String/String[]||Attribut value wird auf attribut key gemappt. Notwendig um das Ergebnis anzuzeigen.|false|
|id|ja|String/String[]|"id"|Attribut value wird auf attribut key gemappt. Notwendig um das Ergebnis anzuzeigen.|false|
|layerId|ja|String/String[]||Attribut value wird auf attribut key gemappt. Notwendig um das Ergebnis anzuzeigen.|false|
|name|ja|String/String[]|"name"|Attribut value wird auf attribut key gemappt. Notwendig um das Ergebnis anzuzeigen.|false|
|source|ja|String/String[]|"source"|Attribut value wird auf attribut key gemappt. Notwendig um das Ergebnis anzuzeigen.|false|
|toolTip|ja|String/String[]||Attribut value wird auf attribut key gemappt. Notwendig um das Ergebnis anzuzeigen.|false|

**Beispiel**

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

[type:ResultEvents]: # (portalConfig.menu.searchBar.searchInterfaces.resultEvents)

Konfiguration des Gazetteer Suchdienstes

**ACHTUNG: Backend notwendig!**
**Es wird eine Stored Query eines WFS mit vorgegebenen Parametern abgefragt.**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|resultEvents|nein|**[resultEvents](#portalconfigmenusearchbarsearchinterfacesresultevents)**|{"onClick": ["setMarker", "zoomToResult"], "onHover": ["setMarker"], "buttons": ["startRouting"]}|Aktionen, die ausgeführt werden, wenn eine Interaktion, z. B. ein Hover oder ein Klick, mit einem Element der Ergebnisliste erfolgt. Folgende events sind möglich: "setMarker", "startRouting", "zoomToResult".|false|
|searchAddress|nein|Boolean|false|Gibt an, ob nach Adressen gesucht werden soll.|false|
|searchDistricts|nein|Boolean|false|Gibt an, ob nach Bezirken gesucht werden soll.|false|
|searchHouseNumbers|nein|Boolean|false|Gibt an, ob nach Straßen und Hausnummern gesucht werden soll. |false|
|searchParcels|nein|Boolean|false|Gibt an, ob nach Flurstücken gesucht werden soll.|false|
|searchStreetKey|nein|Boolean|false|Gibt an, ob nach Straßenschlüsseln gesucht werden soll.|false|
|searchStreets|nein|Boolean|false|Gibt an, ob nach Straßen gesucht werden soll. Vorraussetzung für **searchHouseNumbers**.|false|
|serviceId|ja|String||Id des Suchdienstes. Wird aufgelöst in der **[rest-services.json](../Global-Config/rest-services.json.md)**.|false|
|showGeographicIdentifier|nein|Boolean|false|Gibt an ob das Attribut `geographicIdentifier` zur Anzeige des Suchergebnisses verwendet werden soll.|false|
|type|ja|String|"gazetteer"|Type der Such-Schnittstelle. Definiert welche Such-Schnittstelle konfiguriert ist.|false|

**Beispiel**

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

Suche bei **[Komoot Photon](https://photon.komoot.io/)**.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|bbox|nein|string||Begrenzungsrechteck für die Suche.|false|
|lang|nein|string|"de"|Sprache für die Komoot Suche. Wirkt sich auf Sprachspezifische Ortsangaben (Zum Beispiel Ländernamen) aus.|false|
|lat|nein|Number||Breitengrad für den Suchmittelpunkt.|false|
|limit|nein|Number||Gibt die maximale Zahl der gewünschten, ungefilterten Ergebnisse an.|false|
|lon|nein|Number||Längengrad für den Suchmittelpunkt.|false|
|osm_tag|nein|string||Filterung für OSM Tags (siehe https://github.com/komoot/photon#filter-results-by-tags-and-values).|false|
|serviceId|ja|String||Gibt die ID für die URL in der **[rest-services.json](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/0d136a44a59dd3b64ec986c258763ac08603bf15/doc/rest-services.json.md)** vor.|false|
|resultEvents|nein|**[resultEvents](#portalconfigmenusearchbarsearchinterfacesresultevents)**|{"onClick": ["setMarker", "zoomToResult"], "onHover": ["setMarker"], "buttons": ["startRouting"]}|Aktionen, die ausgeführt werden, wenn eine Interaktion, z. B. ein Hover oder ein Klick, mit einem Element der Ergebnisliste erfolgt. Folgende events sind möglich: "setMarker", "startRouting", "zoomToResult".|false|
|type|ja|String|"komootPhoton"|Type der Such-Schnittstelle. Definiert welche Such-Schnittstelle konfiguriert ist.|false|

**Beispiel**

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

Konfiguration zur Suche unter Verwendung eines ESRI CH LocationFinders.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|classes|nein|**[LocationFinderClass](#portalconfigmenusearchbarsearchinterfaceslocationfinderlocationfinderclass)**||Kann Klassen (mit Eigenschaften) enthalten die berücksichtigt werden sollen. Wenn hier nichts angegeben wird, so werden alle Klassen berücksichtigt.|false|
|epsg|nein|String||Koordinatensystem (EPSG-Code), in dem das Ergebnis angefragt werden soll. Standardmäßig wird  hier der Wert von portalConfig.mapView.epsg verwendet.|false|
|resultEvents|nein|**[resultEvents](#portalconfigmenusearchbarsearchinterfacesresultevents)**|{"onClick": ["setMarker", "zoomToResult"], "onHover": ["setMarker"], "buttons": ["startRouting"]}|Aktionen, die ausgeführt werden, wenn eine Interaktion, z. B. ein Hover oder ein Klick, mit einem Element der Ergebnisliste erfolgt. Folgende events sind möglich: "setMarker", "startRouting", "zoomToResult".|false|
|serviceId|ja|String||Gibt die ID für die URL in der **[rest-services.json](../Global-Config/rest-services.json.md)** vor.|false|
|type|ja|String|"locationFinder"|Type der Such-Schnittstelle. Definiert welche Such-Schnittstelle konfiguriert ist.|false|

**Beispiel**

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
Definition von Klassen, welche als Ergebnis berücksichtigt werden sollen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-signpost-2"|Visualisierung der Klasse durch ein Icon|false|
|name|ja|String||Name der Klasse|false|
|zoom|nein|String|"center"|Legt fest wie auf einen ausgewählten Treffer gezoomt werden soll. Wenn `center` ausgewählt ist, so wird auf die Zentrumskoordinate (`cx` und `cy`) gezoomt und ein Marker angezeigt. Im Falle von `bbox` wird auf die durch den LocationFinder angegebene BoundingBox (`xmin`, `ymin`, `xmax` und `ymax`) gezoomt. Ein Marker wird in dem Fall nicht angezeigt.|false|

**Beispiel**

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

Suche bei OpenStreetMap über Stadt, Strasse und Hausnummer. Wird nur durch Klick auf die Lupe oder Enter ausgelöst, da die Anzahl der Abfragen der OSM-Suchmaschine limitiert ist.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|classes|nein|string|[]|Kann die Klassen, für die Ergebnisse erzielt werden sollen, enthalten.|false|
|limit|nein|Number|50|Gibt die maximale Zahl der gewünschten, ungefilterten Ergebnisse an.|false|
|resultEvents|nein|**[resultEvents](#portalconfigmenusearchbarsearchinterfacesresultevents)**|{"onClick": ["setMarker", "zoomToResult"], "onHover": ["setMarker"], "buttons": ["startRouting"]}|Aktionen, die ausgeführt werden, wenn eine Interaktion, z. B. ein Hover oder ein Klick, mit einem Element der Ergebnisliste erfolgt. Folgende events sind möglich: "setMarker", "startRouting", "zoomToResult".|false|
|serviceId|ja|String||Gibt die ID für die URL in der **[rest-services.json](../Global-Config/rest-services.json.md)** vor.|false|
|states|nein|string|""|Kann die Namen der Bundesländer enthalten. Trenner beliebig. Eventuell auch englische Ausprägungen eintragen, da die Daten frei im OpenSourceProjekt **[OpenStreetMap](https://www.openstreetmap.org)** erfasst werden können.|false|
|type|ja|String|"osmNominatim"|Type der Such-Schnittstelle. Definiert welche Such-Schnittstelle konfiguriert ist.|false|

**Beispiel**

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

Konfiguration der WFS-Suchfunktion "specialWFS": fragt Features eines WFS-Dienstes ab. Der Dienst muss hierfür WFS 2.0 Anfragen zulassen.

Beispielsweise würde bei der Eingabe "Kronenmatten" der Dienst
https://geoportal.freiburg.de/geoportal_freiburg_de/wfs/stpla_bplan/wfs_mapfile/geltungsbereiche
folgende Anfrage mit einer xml FeatureCollection beantworten. Die Features der Collection werden anschließend als Suchergebnisse vorgeschlagen.

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

Die WFS 2 query wird dabei dynamisch durch das Masterportal erstellt. Die Konfiguration einer stored query im WFS Dienst ist hierfür nicht erforderlich.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|definitions|nein|**[definition](#portalconfigmenusearchbarsearchinterfacesspecialwfsdefinition)** *[]||Definition der speziellen WFS suchen.|false|
|geometryName|nein|String|"app:geom"|Attributname der Geometrie wird benötigt um darauf zu zoomen. Kann in der **[definition](#portalconfigmenusearchbarsearchinterfacesspecialwfsdefinition)** überschrieben werden.|false|
|icon|nein|String|"bi-house-fill"|Default icon das in der Vorschlagsliste erscheint. Kann in der **[definition](#portalconfigmenusearchbarsearchinterfacesspecialwfsdefinition)**  überschrieben werden.|false|
|maxFeatures|nein|Integer|20|Maximale Anzahl an gefundenen Features. Kann in der **[definition](#portalconfigmenusearchbarsearchinterfacesspecialwfsdefinition)** überschrieben werden.|false|
|namespaces|nein|String|"xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml'"|XML Namespaces zur Abfrage von propertyNames oder geometryName (*xmlns:wfs*, *xmlns:ogc* und *xmlns:gml* werden immer genutzt). Kann in der **[definition](#portalconfigmenusearchbarsearchinterfacesspecialwfsdefinition)** überschrieben werden.|false|
|resultEvents|nein|**[resultEvents](#portalconfigmenusearchbarsearchinterfacesresultevents)**|{"onClick": ["highlightFeature", "setMarker", "zoomToResult"], "onHover": ["highlightFeature", "setMarker"]}|Aktionen, die ausgeführt werden, wenn eine Interaktion, z. B. ein Hover oder ein Klick, mit einem Element der Ergebnisliste erfolgt. Folgende events sind möglich: "highlightFeature", "setMarker", "zoomToResult".|false|
|type|ja|String|"specialWFS"|Type der Such-Schnittstelle. Definiert welche Such-Schnittstelle konfiguriert ist.|false|

**Beispiel**

```json
{
    "type": "specialWFS",
    "definitions": [
        {
            "url": "https://geodienste.hamburgde/MRH_WFS_Rotenburg",
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
Konfiguration einer Definition bei der SpecialWFS Suche

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|geometryName|nein|String|"app:geom"|Attributname der Geometrie wird benötigt um darauf zu zoomen.|false|
|icon|nein|String|"bi-house-fill"|CSS Klasse des Icons das in der Vorschlagsliste erscheint.|false|
|maxFeatures|nein|Integer|20|Maximale Anzahl an gefundenen Features.|false|
|name|nein|String||Name der Kategorie. Erscheint in der Vorschlagsliste.|false|
|namespaces|nein|String||XML Namespaces zur Abfrage von propertyNames oder geometryName (*xmlns:wfs*, *xmlns:ogc* und *xmlns:gml* werden immer genutzt).|false|
|propertyNames|nein|String[]||Array von Attributnamen. Diese Attribute werden durchsucht.|false|
|typeName|nein|String||Der Name des abzufragenden Layers innerhalb des WFS.|false|
|url|nein|String||URL des WFS. Je nach proxy-Konfiguration muss die relative url vom Server des Portals aus angegeben werden. |false|

**Beispiel**

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

Alle Layer, die im Themenbaum des Portals sind, werden durchsucht.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|hitTemplate|nein|String|"default"|Template in dem die Suchergebnisse (`alle anzeigen`) angezeigt werden. Möglich sind die Werte "default" und "layer".|false|
|resultEvents|nein|**[resultEvents](#portalconfigmenusearchbarsearchinterfacesresultevents)**|{"onClick": ["activateLayerInTopicTree"], "buttons": ["showInTree", "showLayerInfo"]}|Aktionen, die ausgeführt werden, wenn eine Interaktion, z. B. ein Hover oder ein Klick, mit einem Element der Ergebnisliste erfolgt. Folgende events sind möglich: "activateLayerInTopicTree", "showInTree", "showLayerInfo".|false|
|searchInterfaceId|nein|String|"topicTree"|Id, die zur Verknüpfung mit der searchbar in der Themensuche dient.|false|
|searchType|nein|String|""|Entscheidet, ob die Metadaten oder der Name eines Layers durchsucht werden soll. Möglicher Wert: "metadata". Default ist es nicht gesetzt, sodass der Name durchsucht wird.|false|
|type|ja|String|"topicTree"|Type der Such-Schnittstelle. Definiert welche Such-Schnittstelle konfiguriert ist.|false|

**Beispiel**

```json
{
    "type": "topicTree",
    "searchInterfaceId": "topicTree" 
}
```

***

###### portalConfig.menu.searchBar.searchInterfaces.visibleVector {data-toc-label='Visible Vector'}

[type:resultEvents]: # (portalConfig.menu.searchBar.searchInterfaces.resultEvents)

Konfiguration der Suche über die sichtbaren VectorLayer. Bei der Layerdefinition unter "Fachdaten" muss für jeden VectorLayer, der durchsucht werden soll das Attribut "searchField" gesetzt sein. Siehe **[searchField](#layerconfigelementslayersvector)**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|resultEvents|nein|**[resultEvents](#portalconfigmenusearchbarsearchinterfacesresultevents)**|{"onClick": ["openGetFeatureInfo", "setMarker", "zoomToResult"], "onHover": ["setMarker"]}|Aktionen, die ausgeführt werden, wenn eine Interaktion, z. B. ein Hover oder ein Klick, mit einem Element der Ergebnisliste erfolgt. Folgende events sind möglich: "openGetFeatureInfo", "setMarker", "zoomToResult".|false|
|type|ja|String|"visibleVector"|Type der Such-Schnittstelle. Definiert welche Such-Schnittstelle konfiguriert ist.|false|

**Beispiel**

```json
{
    "type": "visibleVector"
}
```

***

##### portalConfig.menu.searchBar.searchInterfaces.resultEvents {data-toc-label='Result Events'}
Aktionen, die ausgeführt werden, wenn eine Interaktion, z. B. ein Hover oder ein Klick, mit einem Element der Ergebnisliste erfolgt.

Folgende Events existieren. Welche Events konfiguriert werden können ist den Beschreibungen der jeweiligen Suchschnittstelle zu entnehmen:

- activateLayerInTopicTree: Aktiviert den gefunden layer im Themenbaum und in der Karte.
- addLayerToTopicTree: Fügt den gefundenen Layer zum Themenbaum und der Karte hinzu.
- highligtFeature: Hebt das Scuhergebniss auf der Karte hervor.
- openGetFeatureInfo: Öffnet die GetFeatureInfo zum Suchtreffer im Menü.
- setMarker: Es wird ein Marker in der Karte platziert.
- showInTree: Öffnet die Themenauswahl und zeigt den ausgewählten Layer an.
- showLayerInfo: Öffnet de Layerinformationen.
- startRouting: Starte das Modul Routing mit der angeklickten Adresse als Ziel.
- zoomToResult: Es wird zum Suchtreffer gezoomt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|buttons|nein|String[]||Buttons die bei jedem Suchergebiss in der Ergebnisliste angezeigt werden und bei Klick eine Aktion ausführen|false|
|onClick|nein|String[]||Aktionen die auf bei einem Klick auf Ein Suchergebniss ausgeführt werden.|false|
|onHover|nein|String[]||Aktionen die auf bei einem Hover auf Ein Suchergebniss ausgeführt werden.|false|

**Beispiel 1**

```json
"resultEvents": {
    "onClick": ["setMarker", "zoomToResult"],
    "onHover": ["setMarker"]
}
```

**Beispiel 2**

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

Module lassen sich in Abschnitte (Sections) unterteilen. Im Menü werden Abschnitte mit einem horizontalen Strich unterteilt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|about|nein|**[about](#portalconfigmenusectionsmodulesabout)**||Mit diesem Modul lassen sich spezifische Portalinformationen anzeigen wie z.B. Beschreibungstext, Masterportalversion, Metadaten.|true|
|addWMS|nein|**[addWMS](#portalconfigmenusectionsmodulesaddwms)**||Mit diesem Modul lassen sich Layer eines WMS laden. Die Angabe erfolgt über eine URL. Es werden alle Layer des Dienstes geladen und im Themenbaum angezeigt.|true|
|bufferAnalysis|nein|**[bufferAnalysis](#portalconfigmenusectionsmodulesbufferanalysis)**||In der Buffer-Analyse muss ein Quell-Layer, ein Buffer-Radius und ein Ziel-Layer ausgewählt werden. Buffer-Radien werden um die Features des Quell-Layers dargestellt. Sobald ein Ziel-Layer gewählt wurde, werden nur die Features dieses Layers hervorgehoben, welche sich außerhalb der Buffer-Radien befinden. Auch eine invertierte Anzeige ist möglich. Bei dieser werden nur die Features des Ziel-Layers innerhalb der Radien hervorgehoben.|false|
|contact|nein|**[contact](#portalconfigmenusectionsmodulescontact)**||Das Kontaktformular bietet dem Benutzer die Möglichkeit an das konfigurierte Postfach eine Nachricht zu senden. Es können beispielsweise Fehler oder Wünsche und Anregungen gemeldet und Screenshots können beigefügt werden.|false|
|compareMaps|nein|**[compareMaps](#portalconfigmenusectionsmodulescomparemaps)**||Dieses Tool ermöglicht es Benutzern, zwei Layer nebeneinander mit einem Layer-Swiper zu vergleichen.|false|
|coordToolkit|nein|**[coordToolkit](#portalconfigmenusectionsmodulescoordtoolkit)**||Koordinatenabfrage: Werkzeug um Koordinaten und Höhe per Maus-Klick abzufragen: Bei Klick in die Karte werden die Koordinaten in der Anzeige eingefroren und können auch direkt in die Zwischenablage kopiert werden. Koordinatensuche: Über eine Eingabemaske können das Koordinatensystem und die Koordinaten eingegeben werden. Das Werkzeug zoomt dann auf die entsprechende Koordinate und setzt einen Marker darauf. Die Koordinatensysteme werden aus der config.js bezogen.|false|
|copyrightConstraints|nein|**[copyrightConstraints](#portalconfigmenusectionsmodulescopyrightconstraints)**||Dieses Modul lädt die Nutzungshinweise über eine CSW Schnittstelle und listed diese je Layer. Sind keine Nutzungshinweise für den Layer vorhanden, wird alternativ ein Kontakt angezeigt, bei dem man die Nutzungsbedingungen erfragen kann.|false|
|customMenuElement|nein|**[customMenuElement](#portalconfigmenusectionsmodulescustommenuelement)**||Dieses Modul kann einen Link öffnen, HTML aus config.json oder einer externen Datei anzeigen oder eine Aktion ausführen. Diese Modul kann mehrfach in der config.json konfiguriert werden.|false|
|draw|nein|**[draw](#portalconfigmenusectionsmodulesdraw)**||**!Attention: Das draw Modul befindet sich gerade im Refactoring. Um das gewohnte Zeichentool aus Masterportalversion 2 zu nutzen kann der type "draw_old" verwendet werden**)! Mithilfe des Zeichnen-Werkzeuges können Punkte, Linien, Polygone, Kreise, Doppelkreise und Texte gezeichnet werden. Farben und Transparenzen sind voreingestellt. Die Zeichnungen können in den Formaten: KML, GeoJSON oder GPX heruntergeladen werden.(Das sich im Moment im Rectoring befindente neue draw Modul können sie mit dem type "draw" testen)|false|
|featureLister|nein|**[featureLister](#portalconfigmenusectionsmodulesfeaturelister)**||Listet alle Features eines Vektorlayers auf.|false|
|fileImport|nein|**[fileImport](#portalconfigmenusectionsmodulesfileimport)**||Import von Dateien des Typs *.kml, *.geojson und *. gpx. Über dieses Modul können solche Dateien importiert werden.|false|
|filter|nein|**[filter](#portalconfigmenusectionsmodulesfilter)**||Konfiguration eines fortgeschrittenen Filters für Vektordaten.|false|
|language|nein|**[language](#portalconfigmenusectionsmoduleslanguage)**||In diesem Modul lässt sich die Sprache des Portals umschalten.|false|
|layerClusterToggler|nein|**[layerClusterToggler](#portalconfigmenusectionsmoduleslayerclustertoggler)**||Mit diesem Modul lassen sich Layer in Clustern gleichzeitig aktivieren/laden und deaktivieren.|false|
|layerSlider|nein|**[layerSlider](#portalconfigmenusectionsmoduleslayerslider)**||Mit dem Layerslider lassen sich beliebige Dienste in einer Reihenfolge abspielen. Zum Beispiel geeignet für Luftbilder aus verschiedenen Jahrgängen.|false|
|login|nein|**[login](#portalconfigmenusectionsmoduleslogin)**||Konfiguration der Anmeldung bei einem OIDC-Server.|false|
|measure|nein|**[measure](#portalconfigmenusectionsmodulesmeasure)**||Messwerkzeug um Flächen oder Strecken zu messen. Dabei kann zwischen den Einheiten m/km/nm bzw m²/ha/km² gewechselt werden.|false|
|news|nein|**[news](#portalconfigmenusectionsmodulesnews)**||Dieses Modul zeigt alle Meldungen aus der newsFeedPortalAlerts.json und der config.json des aktuellen Portals unabhängig des "gelesen" Status.|false|
|openConfig|nein|**[openConfig](#portalconfigmenusectionsmodulesopenconfig)**||Mit diesem Modul lässt sich eine Konfigurationsdatei (config.json) zur Laufzeit neu laden. Die Module und Karte werden an die neue Konfiguration angepasst.|false|
|print|nein|**[print](#portalconfigmenusectionsmodulesprint)**||Druckmodul mit dem die Karte als PDF exportiert werden kann.|false|
|routing|nein|**[routing](#portalconfigmenusectionsmodulesrouting)**||Routing Modul zur Erstellung von Routenplanungen und Erreichbarkeitsanalysen.|false|
|scaleSwitcher|nein|**[scaleSwitcher](#portalconfigmenusectionsmodulesscaleswitcher)**||Modul zum Ändern des aktuellen Maßstabs der Karte.|false|
|selectFeatures|nein|**[selectFeatures](#portalconfigmenusectionsmodulesselectfeatures)**||Ermöglicht Auswahl von Features durch Ziehen einer Box und Einsehen derer GFI-Attribute.|false|
|shadow|nein|**[shadow](#portalconfigmenusectionsmodulesshadow)**||Konfigurationsobjekt für die Schattenzeit im 3D-Modus.|false|
|statisticDashboard|no|**[statisticDashboard](#portalconfigmenusectionsmodulesstatisticdashboard)**||Werkzeug zur Anzeige von statistischen Daten.|false|
|shareView|nein|**[shareView](#portalconfigmenusectionsmodulesshareview)**||Modul, um einen Link zur aktuellen Karten-Ansicht zu teilen.|false|
|styleVT|nein|**[styleVT](#portalconfigmenusectionsmodulesstylevt)**||Style-Auswahl zu VT-Diensten. Ermöglicht das Umschalten des Stylings eines Vector Tile Layers, wenn in der services.json mehrere Styles für ihn eingetragen sind.|false|
|wfsSearch|nein|**[wfsSearch](#portalconfigmenusectionsmoduleswfssearch)**||Ermöglicht es ein Formular zu erstellen, um einen WFS Layer abgekoppelt von der Suchleiste mittels Filter anzufragen. Es ist möglich entweder eine gespeicherte Anfrage (Stored Query, WFS@2.0.0) zu nutzen oder eine Anfrage mithilfe der konfigurierten Parameter zu definieren (WFS@1.1.0).|false|
|wfst|nein|**[wfst](#portalconfigmenusectionsmoduleswfst)**||WFS-T Modul mit dem Features visualisiert, erstellt, aktualisiert und gelöscht werden können.|false|

***

##### portalConfig.menu.sections.modules {data-toc-label='Modules'}

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|description|nein|String||Beschreibung zu einem Modul, die im Menü angezeigt wird.|false|
|icon|nein|String||Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String||Name des Moduls im Menü.|false|
|showDescription|nein|String||Gibt an ob die Beschreibung zum Modul im Menü angezeigt werden soll.|false|
|supportedDevices|nein|String||Geräte auf denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|supportedMapModes|nein|String||Karten modi in denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|type|nein|String||Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

***

##### portalConfig.menu.sections.modules.about {data-toc-label='About'}

[inherits]: # (portalConfig.menu.sections.modules)

Mit diesem Modul lassen sich spezifische Portalinformationen anzeigen wie z.B. Beschreibungstext, Masterportalversion, Metadaten.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-info-circle"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.about.name"|Name des Moduls im Menü.|false|
|type|nein|String|"about"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|
|abstractText|nein|String|""|Beschreibungstext des Portals|false|
|contact|no|String|null|Metadaten Kontaktinformationen|false|
|cswUrl|nein|String|"../../src/assets/img/Logo_Masterportal.svg"|Metadaten URL|false|
|logoLink|nein|String|"https://masterportal.org"|Link des Logos|false|
|logoText|nein|String|"Masterportallogo"|Text bei nicht anzeigbarem Logo|false|
|metaDataCatalogueId|nein|String|"2"|Id des Metadatenkatalogdienstes|false|
|metaId|nein|String|""|Id des Metadateneintrages|false|
|metaUrl|nein|String|""|URL des Metadateneintrages|false|
|noMetadataLoaded|nein|String|""|Text bei nicht anzeigbaren Metadaten|false|
|showAdditionalMetaData|nein|Boolean|true|Metadatenlink zu erweiterten Metadaten anzeigen|false|
|title|nein|String|""|Titel der Metadaten|false|
|version|nein|String|""|Versionangabe des Masterportals|false|
|versionLink|nein|String|"https://bitbucket.org/geowerkstatt-hamburg/masterportal/downloads/"|Link zu der Masterportalversion|false|
|ustId|nein|String|""|Umsatzsteueridentifikationsnummer gem. § 27 Umsatzsteuergesetz|false|
|privacyStatementText|no|String|"common:modules.about.privacyStatementText"|Text für den Datenschutzabschnitt|false|
|privacyStatementUrl|no|String|""|URL zu der Datenschutzerklärungsseite|false|
|accessibilityText|no|String|"common:modules.about.accessibilityText"|Text für den Barrierefreiheitsabschnitt|false|
|accessibilityUrl|no|String|""|URL zu der Barrierefreiheitserklärungsseite|false|

```json title="Beispiel"
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

Mit diesem Modul lassen sich zusätzliche WMS Layer über eine angegebene URL laden. Von der [GDI-DE](https://www.gdi-de.org/download/AK_Geodienste_Architektur_GDI-DE_Bereitstellung_Darstellungsdienste.pdf) wird empfohlen einen CORS-Header einzurichten, siehe Kapitel 4.7.1.  
Schema für eine WMS Layer URL: `www.diensteurl/wmsdienste`. 

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-cloud-plus"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.addWMS.name"|Name des Moduls im Menü..|false|
|type|nein|String|"addWMS"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

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

Mit diesem Modul lassen sich die Features eines Ziel-Layers anzeigen, die sich inner- oder außerhalb einer Kreisfläche um die Features eines Quell-Layers befinden. Dabei wird die Kreisfläche, ausgehend von den Quell-Layer Features, über den Buffer-Radius definiert. Die Quell- und Ziel-Layer benötigen hierzu vektorbasierte Daten aus WFS(❗) Diensten.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-arrows-angle-expand"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.bufferAnalysis.name"|Name des Moduls im Menü..|false|
|type|nein|String|"bufferAnalysis"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

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

Mit diesem Modul, kann der Benutzer mit einem definierten Postfach Kontakt aufnehmen. Es kann eine Datei, z.B. ein Screenshot beigefügt werden.

>**ACHTUNG: Backend notwendig!**
>
>**Das Modul Contact kommuniziert mit einem SMTP-Server und ruft dort die sendmail.php auf.**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|closeAfterSend|nein|Boolean|false|Kennzeichen, ob das Kontaktfenster nach erfolgreichem Versenden einer Nachricht geschlossen werden soll.|false|
|configuredFileExtensions|nein|String[]||Zusätzliche Dateierweiterungen zu "png", "jpg" und "jpeg". Das Backend muss diese Dateitypen unterstützen.|false|
|contactInfo|nein|String||Weitere Informationen, welche oberhalb des Kontaktformulars angezeigt werden.|false|
|deleteAfterSend|nein|Boolean|false|Kennzeichen, ob der Inhalt des Kontaktfensters nach erfolgreichem Versenden der Nachricht gelöscht werden soll.|false|
|fileUpload|nein|Boolean|false|Kennzeichen, ob der Dateiupload verfügbar sein soll.|false|
|from|ja|**[email](#portalconfigmenusectionsmodulescontactemail)**[]||Absender der Email. Bitte den untenstehenden **Hinweis zur Email-Sicherheit** beachten.|false|
|icon|nein|String|"bi-envelope"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|includeSystemInfo|nein|Boolean|false|Kennzeichen, ob Systeminformationen des Absenders mitgeschickt werden sollen.|false|
|locationOfCustomerService|nein|String|"de"|Land, in welchem sich der Kundensupport befindet. Wird verwendet für das Datum innerhalb der ticketId.|false|
|maxFileSize|nein|Number|1048576|Die maximale Dateigröße in bytes für hochladbare Inhalte. Standard: 1MB.|false|
|maxLines|nein|Number|5|Anzahl der Zeilen (Höhe) des Textbereiches des Formulars.|false|
|name|nein|String|"common:modules.contact.name"|Name des Moduls im Menü.|false|
|privacyPolicyLink|nein|String|"https://www.masterportal.org/datenschutz.html"|Link zur Datenschutzerklärung. Sollte gesetzt werden, wenn `showPrivacyPolicy` true ist.|false|
|serviceId|ja|String||Id des Email-Dienstes der verwendet werden soll. Wird aus der **[rest-services.json](../Global-Config/rest-services.json.md)** bezogen.|false|
|showPrivacyPolicy|nein|Boolean|false|Kennzeichen, ob eine Checkbox angezeigt werden soll, um der Datenschutzerklärung zuzustimmen.|false|
|subject|nein|String||Der Betreff, welcher für die Email verwendet wird.|false|
|to|ja|**[email](#portalconfigmenusectionsmodulescontactemail)**[]||Adressat der Email.  Bitte den untenstehenden **Hinweis zur Email-Sicherheit** beachten.|false|
|type|nein|String|"contact"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|
|withTicketNo|nein|Boolean|true|Kennzeichen, ob bei erfolgreichem Versand der Anfrage eine Ticketnummer zurückgegeben werden soll.|false|
|infoMessage|nein|String|"common:modules.contact.infoMessage"|Satz zur Erläuterung|false|

***
**Beispiel**

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

!!! danger "Hinweis zur Email-Sicherheit"

    Von der ungeprüften Übernahme von *Sender (FROM)*, *Empfänger (TO)*, *Kopie (CC)* und *Blindkopie (BCC)* durch den SMTP-Server wird hiermit aus Sicherheitsgründen **ausdrücklich abgeraten**.
    Vor der ungeprüften Übernahme durch den SMTP-Server der Kunden-Email als *Antwort an* (REPLY-TO) wird gewarnt.

    Wir empfehlen dringend *FROM* und *TO* am SMTP-Server manuell fest einzustellen, ohne eine Möglichkeit zur externen Konfiguration anzubieten.

    >Aus Sicherheitsgründen darf der vom Masterportal an den SMTP-Server geschickte *Sender (FROM)* und der *Empfänger (TO)* nicht ungeprüft vom SMTP-Server als FROM und TO für die Email verwendet werden. Ansonsten entsteht eine Lücke über die Schad-Mails mit manipuliertem FROM und TO über den SMTP-Server versendet werden. Sollte dennoch eine Konfiguration im Masterportal gewünscht sein (siehe Beispiel oben), können die Parameter *from* und *to* unter dem Vorbehalt verwendet werden, dass *from* und *to* am SMTP-Server gegen eine **Whitelist** mit erlaubten Email-Adressen geprüft und das Versenden einer Email im Falle der Angabe inkorrekter Email-Adressen unterbunden wird.

    Wir empfehlen auf das automatische Setzen in *CC* (bzw. *BCC*) der Email-Adresse des Kunden zu verzichten.

    >Aus Sicherheitsgründen darf der Kunde nicht automatisch als *Kopie (CC)* oder *Blindkopie (BCC)* der Email gesetzt werden. Ein solcher Automatismus wird missbraucht um durch Angabe einer Fremd-Email-Adresse Schad-Mails über den SMTP-Server zu versenden.

    Wir empfehlen dringend *CC* und *BCC* am SMTP-Server manuell zu nullen.

    >Es darf keine Möglichkeit geben *Kopie (CC)* oder *Blindkopie (BCC)* über das Masterportal einzustellen. Ein solches Feature wird zum Versenden von Schad-Mails über den SMTP-Server missbraucht.

    Wir warnen vor der automatischen Einstellung der Kunden-Mail als *REPLY-TO*.

    >Die ungeprüfte Übernahme von Daten in den Email-Header ist je nach Sicherheitsstand (bzw. Alter) des SMTP-Servers mit dem Risiko verbunden, dass im einfachsten Fall durch Injektion von *Carriage Return* und *Line Feed* in z.B. *REPLY-TO* aus der Email-Header-Zeile ausgebrochen und der Email-Header selbst manipuliert wird (Beispiel: "test@example.com\r\nBCC:target1@example.com,target2@example.com,(...),target(n)@example.com"). In einem abstrakteren Fall sind auch UTF-Attacken denkbar, bei der eigentlich harmlose UTF-16- oder UTF-32-Zeichen durch Interpretation als ANSI oder UTF-8 zu Verhaltensänderungen des Email-Headers mit einem ähnlichen Ergebnis führen.

***

###### portalConfig.menu.sections.modules.contact.email {data-toc-label='Email'}
Email Objekt bestehend aus der Email-Adresse und dem angezeigten Namen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|email|nein|String||Die Email-Adresse.|false|
|name|nein|String||Der angezeigte Name.|false|

**Beispiel**

```json
{
    "email": "lgvgeoportal-hilfe@gv.hamburg.de",
    "name":"LGVGeoportalHilfe"
}
```

***

##### portalConfig.menu.sections.modules.compareMaps {data-toc-label='Compare Maps'}

[inherits]: # (portalConfig.menu.sections.modules)

Dieses Tool ermöglicht es Benutzern, zwei Layer nebeneinander mit einem Layer-Swiper zu vergleichen. Benutzer wählen Layer aus den aktiven, sichtbaren Layern aus, und der Swiper teilt die Karte, um jeden Layer in separaten Abschnitten anzuzeigen. Das Tool unterstützt WMS- und WFS-Layer und stellt sicher, dass die Layer vollständig aktualisiert werden, bevor der Swiper bewegt wird, um einen genauen Vergleich zu ermöglichen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|type|nein|String|"compareMaps"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Example**

```json
{
    "type": "compareMaps",
}
```

***

##### portalConfig.menu.sections.modules.coordToolkit {data-toc-label='Coord Toolkit'}

[inherits]: # (portalConfig.menu.sections.modules)

Koordinaten-Werkzeug: um zusätzlich zu den 2 dimensionalen Koordinaten die Höhe über NHN anzuzeigen muß eine 'heightLayerId' eines WMS-Dienstes angegeben werden, der die Höhe liefert. Es wird das Format XML erwartet und das Attribut für die Höhen wird unter dem Wert des Parameters 'heightElementName' erwartet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|coordInfo|nein|**[coordInfo](#portalconfigmenusectionsmodulescoordtoolkitcoordinfo)**||Hier kann ein Objekt mit Erläuterungen für die Koordinatenreferenzsysteme hinterlegt werden.|false|
|delimiter|nein|String|"Pipe-Symbol"|Trenner der Koordinaten beim Kopieren des Koordinatenpaares|false|
|heightElementName|nein|String||Koordinatenabfrage: Der Element-Name unter dem die Höhe in dem XML gesucht wird|false|
|heightLayerId|nein|String||Koordinatenabfrage: Id des WMS-Layers der die Höhe im XML-Format liefert. Wenn nicht definiert, dann wird keine Höhe angezeigt.|false|
|heightLayerInfo|nein|String||Hier kann eine Erläuterung für die Höhe hinterlegt werden.|false|
|heightValueBuilding|nein|String||Koordinatenabfrage: Der Wert im unter "heightElementName" definierten Element, der für eine nicht gemessene Höhe im Gebäude-Bereich vom WMS geliefert wird, es wird der internationalisierte Text "Gebäudefläche, keine Höhen vorhanden" unter dem Schlüssel "common:modules.coordToolkit.noHeightBuilding" in der Oberfläche angezeigt. Wenn dieses Attribut nicht angegeben wird, dann wird der Text, den das WMS liefert angezeigt.|false|
|heightValueWater|nein|String||Koordinatenabfrage: Der Wert im unter "heightElementName" definierten Element, der für eine nicht gemessene Höhe im Wasser-Bereich vom WMS geliefert wird, es wird der internationalisierte Text "Gewässerfläche, keine Höhen vorhanden" unter dem Schlüssel "common:modules.coordToolkit.noHeightWater" in der Oberfläche angezeigt. Wenn dieses Attribut nicht angegeben wird, dann wird der Text, den das WMS liefert angezeigt.|false|
|icon|no|String|"bi-globe"|Das Icon, das im Button für das Modul gezeigt wird. Hier eine Auswahl **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|name|no|String|"common:modules.coordToolkit.name"|Name des Moduls im Menu.|false|
|showCopyButtons|nein|Boolean|true|Schalter um die Buttons zum Kopieren der Koordinaten anzuzeigen oder auszublenden.|false|
|type|nein|String|"coordToolkit"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|
|zoomLevel|nein|Number|7|Koordinatensuche: Gibt an, auf welches ZoomLevel gezoomt werden soll.|false|

**Beispiel**

```json
{
    "type": "coordToolkit",
    "heightLayerId": "19173",
    "heightElementName": "value_0",
    "heightValueWater": "-20",
    "heightValueBuilding": "200",
    "zoomLevel": 5,
    "heightLayerInfo": "Grundlage der Höheninformation ist das \"Digitalge Höhenmodell Hamburg DGM 1\".",
    "showDescription": true,
    "description": "Bestimme Koordinaten aus der Karte oder suche nach Koordinaten.",
    "coordInfo": {
        "title": "Koordinatenreferenzsystem für 2D-Lageangaben, Erläuterungen",
        "explanations": [
        "ETRS89_UTM32, EPSG 4647 (zE-N): Bezugssystem ETRS89, Abbildungsvorschrift UTM, Zone 32",
        "EPSG 25832: Erklärung..."
        ]
    }
}
```

***

###### portalConfig.menu.sections.modules.coordToolkit.coordInfo {data-toc-label='Coord Info'}

[inherits]: # (portalConfig.menu.sections.modules.coordToolkit)

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|explanations|nein|[]||Array mit Erklärungen, aus denen eine Liste erstellt wird.|false|
|title|nein|string||Überschrift für die Erläuterungen zu den Koordinatenreferenzsystemen.|false|

***

##### portalConfig.menu.sections.modules.copyrightConstraints {data-toc-label='Copyright Constraints'}

[inherits]: # (portalConfig.menu.sections.modules)

Listet die Nutzungshinweise der aktiven Layer auf.

| Name | Verpflichtend | Typ    | Default                | Beschreibung                                                   | Expert |
|------|---------------|--------|------------------------|----------------------------------------------------------------|--------|
| type | nein          | String | "copyrightConstraints" | Der type des Moduls. Definiert welches Modul konfiguriert ist. | false  |

```json title="Beispiel"
{
    "type": "copyrightConstraints"
}
```

***

##### portalConfig.menu.sections.modules.customMenuElement {data-toc-label='Custom Menu Element'}

[inherits]: # (portalConfig.menu.sections.modules)

Dieses Modul kann einen Link öffnen, HTML aus config.json oder einer externen Datei anzeigen oder eine Aktion ausführen. Diese Modul kann mehrfach in der config.json konfiguriert werden. Wenn `htmlContent` angegeben wird, dann wird `pathToContent` nicht ausgeführt und umgekehrt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|execute|nein|**[execute](#portalconfigmenusectionsmodulescustommenuelementexecute)**||Aktion, die mit dem Klick auf den Menü-Eintrag ausgeführt werden soll.|true|
|htmlContent|nein|String||HTML, das in dem Modul angezeigt wird. Das HTML wird nicht validiert, die Verantwortung für die Sicherheit des HTMLs liegt beim Betreiber des Portals.|false|
|icon|nein|String|"bi-asterisk"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String||Name des Moduls im Menü.|false|
|openURL|nein|String||Url die mit dem Klick auf den Menü-Eintrag in einem neuen Tab geöffnet werden soll.|false|
|pathToContent|nein|String||Pfad zu einer Datei, die HTML enthält, das in dem Modul angezeigt wird. Das HTML wird nicht validiert, die Verantwortung für die Sicherheit des HTMLs liegt beim Betreiber des Portals.|false|
|type|ja|String|"customMenuElement"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

```json
 {
    "type": "customMenuElement",
    "name": "Url öffnen",
    "openURL": "https://geoinfo.hamburg.de/"
 },
{
    "type": "customMenuElement",
    "name": "Url öffnen und HTML anzeigen",
    "openURL": "https://geoinfo.hamburg.de/",
    "htmlContent": "<div><h1>This is a Heading</h1><p>Es wurde eine Url geöffnet.<p/></div>"
},
{
    "type": "customMenuElement",
    "name": "HTML aus config.json und Action",
    "htmlContent": "<div><p>This is a paragraph.</p></br><a href=\"https://www.w3schools.com/\" target=\"_blank\">Visit W3Schools.com!</a></div>",
    "execute":{
        "action": "Alerting/addSingleAlert",
        "payload":  {"title":"An alle Menschen", "content": "Hallo Welt"}
    }
}
```

***

###### portalConfig.menu.sections.modules.customMenuElement.execute {data-toc-label='Execute'}

[type:Payload]: # (Datatypes.Payload)

CustomMenuElement Module `execute` Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|action|ja|String||Name und ggf. Pfad der Aktion, die ausgeführt werden soll.|true|
|payload|nein|**[Payload](#datatypespayload)**||Payload, der an die Aktion übergeben wird.|true|

**Beispiel**

```json
{
    "action": "Alerting/addSingleAlert",
    "payload":  {"title":"An alle Menschen", "content": "Hallo Welt"}
}
```

***

##### portalConfig.menu.sections.modules.draw {data-toc-label='Draw'}

[inherits]: # (portalConfig.menu.sections.modules)

!!! warning "Ongoing Refactoring"
    Das draw Modul befindet sich gerade im Refactoring. Um das gewohnte Zeichentool aus Masterportalversion 2 zu nutzen kann der type "draw_old" verwendet werden!
    Mithilfe des Zeichnen-Werkzeuges können Punkte, Linien, Polygone, Kreise, Doppelkreise und Texte gezeichnet werden. Farben und Transparenzen sind voreingestellt. Die Zeichnungen können in den Formaten: KML, GeoJSON oder GPX heruntergeladen werden. (Das sich im Moment im rectoring befindente neue draw Modul können sie mit dem type "draw" testen)

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name des Werkzeugs im Menü.|false|
|iconList|nein|**[icon](#portalconfigmenusectionsmodulesdrawicon)**[]|[{"id": "iconPoint", "type": "simple_point", "value": "simple_point"}, {"id": "yellow pin", "type": "image", "scale": 2, "value": "geo-fill-ylw.svg"}]|Liste an Symbolen, aus welcher ein Nutzer die Auswahl für das Zeichnen eines farbigen Punktes oder eines Symbols hat. Es können wie im Beispiel eigene Bild-Dateien verwendet werden.|false|
|drawSymbolSettings|nein|**[drawSymbolSet](#portalconfigmenusectionsmodulesdrawdrawsymbolset)**|{"color": [55, 126, 184, 1], "opacity": 1}|Voreinstellung für das Zeichnen von Symbolen.|false|
|addIconsOfActiveLayers|nein|Boolean|false|Setzen Sie dieses Flag auf `true` um die Icons und Symbole aller im Themenbaum aktivierten WFS-Layer als zusätzliche Symbole neben den unter `drawSymbolSettings` konfigurierten Icons auswählen zu können.|false|
|drawLineSettings|nein|**[drawLineSet](#portalconfigmenusectionsmodulesdrawdrawlineset)**|{"strokeWidth": 1, "opacityContour": 1, "colorContour": [0, 0, 0, 1]}|Voreinstellung für das Zeichnen von Linien.|false|
|drawCurveSettings|nein|**[drawCurveSet](#portalconfigmenusectionsmodulesdrawdrawcurveset)**|{"strokeWidth": 1, "opacityContour": 1, "colorContour": [0, 0, 0, 1]}|Voreinstellung für das Zeichnen von Freihand-Linien.|false|
|drawAreaSettings|nein|**[drawAreaSet](#portalconfigmenusectionsmodulesdrawdrawareaset)**|{"strokeWidth": 1, "color": [55, 126, 184, 1], "opacity": 1, "colorContour": [0, 0, 0, 1], "opacityContour": 1}|Voreinstellung für das Zeichnen von Flächen.|false|
|drawCircleSettings|nein|**[drawCircleSet](#portalconfigmenusectionsmodulesdrawdrawcircleset)**|{"circleMethod": "interactive", "unit": "m", "circleRadius": null, "strokeWidth": 1, "color": [55, 126, 184, 1], "opacity": 1, "colorContour": [0, 0, 0, 1], "opacityContour": 1, "tooltipStyle": {"fontSize": "16px", "paddingTop": "3px", "paddingLeft": "3px", "paddingRight": "3px", "backgroundColor": "rgba(255, 255, 255, .9)"}}|Voreinstellung für das Zeichnen von Kreisen.|false|
|drawDoubleCircleSettings|nein|**[drawDoubleCircleSet](#portalconfigmenusectionsmodulesdrawdrawdoublecircleset)**|{"circleMethod": "defined", "unit": "m", "circleRadius": 0, "circleOuterRadius": 0, "strokeWidth": 1, "color": [55, 126, 184, 1], "opacity": 1, "colorContour": [0, 0, 0, 1], "outerColorContour": [0, 0, 0, 1], "opacityContour": 1}|Voreinstellung für das Zeichnen von Doppel-Kreisen.|false|
|writeTextSettings|nein|**[writeTextSet](#portalconfigmenusectionsmodulesdrawwritetextset)**|{"text": "", "fontSize": 10, "font": "Arial", "color": [55, 126, 184, 1], "opacity": 1}|Voreinstellung für das Schreiben von Texten.|false|
|download|nein|**[download](#portalconfigmenusectionsmodulesdrawdownload)**|{"preSelectedFormat": "KML"}|Einstellungen für das Herunterladen der Zeichnung.|false|
|enableAttributesSelector|nein|Boolean|false|Aktiviert einen Knopf zum Umschalten eines Bereiches zum Editieren von benutzerdefinierten Attributen an dem bereits ausgewählten Feature.|false|
|semicolonCSVDelimiter|nein|Boolean|true|Legt fest, ob Semicolon als der Feldtrenner für exportierte CSV Datei ist.|false|

**Beispiel**

```json
{
    "type": "draw_old",
    "name": "Zeichnen / Schreiben",
    "icon": "bi-pencil-flll",
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
            "value": "wiese.png"
        },
        {
            "id": "gelber Pin",
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

Punkt Objekt, bestehend aus der Beschriftung, dem Typ und dem Wert.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|ja|String||Die Beschriftung des Symbols, welche im Auswahlmenü dargestellt wird. Diese muss in der Sprachdatei (meistens `common`) angelegt werden unter dem Punkt `modules.draw.iconList`, wobei der darauffolgende Parameter standardmäßig mit `icon` beginnen und eine repräsentative Beschreibung darstellen sollte. Wird dieser Schlüssel in der Übersetzungesdatei nicht gefunden, dann wird die `id` in der Oberfläche angezeigt.|false|
|caption|nein|String||Die Beschriftung des Symbols, welche im Auswahlmenü dargestellt wird. Ggü. der id muss hier nicht die id aus der Sprachdatei sondern der gesamte Pfad (`modules.draw.iconList` + id) angegeben werden.|false|
|type|ja|enum["image", "simple_point"]||Typ des zu zeichnenden Objektes.Bei `image` wird ein Bild gezeichnet, welches dem PNG-Bild oder der svg-Datei des Pfades aus `value` entspricht. Diese Bilder werden standardmäßig im Verzeichnis `/img/draw/` abgelegt und sollten eine Seitenlänge von 96px für eine korrekte Skalierung aufweisen, alternativ kann ein scale-Faktor angegeben werden. Bei `simple_point` wird ein normaler Punkt gezeichnet.|false|
|scale|nein|number||Skalierungsfaktor|false|
|value|ja|String||Wert, des zu zeichnenden Objektes. Wenn ohne Pfad oder Url, dann wird der Eintrag aus der config.js - `wfsImgPath` als Dateiort angenommen.|false|

**Beispiele**

```json
    {
        "id": "iconPoint",
        "type": "simple_point",
        "value": "simple_point"
    },
    {
        "id": "iconMeadow",
        "type": "image",
        "scale": 0.8,
        "value": "wiese.png"
    },
    {
        "id": "gelber Pin",
        "type": "image",
        "scale": 2,
        "value": "geo-fill-ylw.svg"
    },
```

***


###### portalConfig.menu.sections.modules.draw.drawSymbolSet {data-toc-label='Symbol Set'}

Objekt zum Ändern des konfigurierten Default-Wertes des Punkt-Symbols im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|color|ja|Number[]|[55, 126, 184, 1]|Die voreingestellte Farbe des Symbols als RGB color array mit Alpha-Kanal, wenn es sich um einen Punkt handelt.|false|
|opacity|ja|Number|1|Die voreingestellte Transparenz des Symbols in einer Range [0..1], wenn es sich um einen Punkt handelt.|false|


**Beispiel**

```json
    {
        color: [55, 126, 184, 1],
        opacity: 1
    }
```

***

###### portalConfig.menu.sections.modules.draw.drawLineSet {data-toc-label='Line Set'}

Objekt zum Ändern des konfigurierten Default-Wertes für eine Linie im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|strokeWidth|ja|Number|1|Die voreingestellte Strichstärke (Dicke) der Linie in Pixel.|false|
|colorContour|ja|Number[]|[0, 0, 0, 1]|Die voreingestellte Farbe der Linie als RGB color array mit Alpha-Kanal.|false|
|opacityContour|ja|Number|1|Die voreingestellte Transparenz der Linie in einer Range [0..1].|false|

**Beispiel**

```json
    {
        strokeWidth: 1,
        opacityContour: 1,
        colorContour: [0, 0, 0, 1]
    }
```

***

###### portalConfig.menu.sections.modules.draw.drawCurveSet {data-toc-label='Curve Set'}

Objekt zum Ändern des konfigurierten Default-Wertes für eine Freihandlinie im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|strokeWidth|ja|Number|1|Die voreingestellte Strichstärke (Dicke) der Freihandlinie in Pixel.|false|
|colorContour|ja|Number[]|[0, 0, 0, 1]|Die voreingestellte Farbe der Freihandlinie als RGB color array mit Alpha-Kanal.|false|
|opacityContour|ja|Number|1|Die voreingestellte Transparenz der Freihandlinie in einer Range [0..1].|false|

**Beispiel**

```json
    {
        strokeWidth: 1,
        opacityContour: 1,
        colorContour: [0, 0, 0, 1]
    }
```

***

###### portalConfig.menu.sections.modules.draw.drawAreaSet {data-toc-label='Area Set'}

Objekt zum Ändern des konfigurierten Default-Wertes für eine Fläche im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|strokeWidth|ja|Number|1|Die voreingestellte Strichstärke (Dicke) des Randes der Fläche in Pixel.|false|
|color|ja|Number[]|[55, 126, 184, 1]|Die voreingestellte Farbe der Fläche als RGB color array mit Alpha-Kanal.|false|
|opacity|ja|Number|1|Die voreingestellte Transparenz der Fläche in einer Range [0..1].|false|
|colorContour|ja|Number[]|[0, 0, 0, 1]|Die voreingestellte Rand-Farbe der Fläche als RGB color array mit Alpha-Kanal.|false|
|opacityContour|ja|Number|1|Die voreingestellte Transparenz der Rand-Farbe der Fläche in einer Range [0..1].|false|

**Beispiel**

```json
    {
        strokeWidth: 1,
        color: [55, 126, 184, 1],
        opacity: 1,
        colorContour: [0, 0, 0, 1],
        opacityContour: 1
    }
```

***

###### portalConfig.menu.sections.modules.draw.drawCircleSet {data-toc-label='Circle Set'}

Objekt zum Ändern des konfigurierten Default-Wertes für einen Kreis im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|circleMethod|ja|String|"interactive"|Die voreingestellte Methode wie der Kreis gezogen werden soll. "interactive": Freihand, "defined": mit Angabe fixer Werte|false|
|unit|ja|String|"m"|Die voreingestellte Maßeinheit mit der der Durchmesser des Kreises unter der circleMethod "defined" berechnet werden soll.|false|
|circleRadius|ja|Number|0|Der voreingestellte Durchmesser des Kreises bezogen auf die Unit unter der circleMethod "defined".|false|
|strokeWidth|ja|Number|1|Die voreingestellte Strichstärke (Dicke) des Randes des Kreises in Pixel.|false|
|color|ja|Number[]|[55, 126, 184, 1]|Die voreingestellte Farbe des Kreises als RGB color array mit Alpha-Kanal.|false|
|opacity|ja|Number|1|Die voreingestellte Transparenz des Kreises in einer Range [0..1].|false|
|colorContour|ja|Number[]|[0, 0, 0, 1]|Die voreingestellte Rand-Farbe des Kreises als RGB color array mit Alpha-Kanal.|false|
|opacityContour|ja|Number|1|Die voreingestellte Transparenz der Rand-Farbe des Kreises in einer Range [0..1].|false|
|tooltipStyle|nein|String|{}|Die voreingestellte Style des Tooltips|false|

**Beispiel**

```json
    {
        circleMethod: "interactive",
        unit: "m",
        circleRadius: 0,
        strokeWidth: 1,
        color: [55, 126, 184, 1],
        opacity: 1,
        colorContour: [0, 0, 0, 1],
        opacityContour: 1
    }
```

***

###### portalConfig.menu.sections.modules.draw.drawDoubleCircleSet {data-toc-label='Double Circle Set'}

Objekt zum Ändern des konfigurierten Default-Wertes für einen Doppelkreis im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|circleMethod|ja|String|"defined"|Die voreingestellte Methode wie der Doppelkreis gezogen werden soll. "interactive": Freihand, "defined": mit Angabe fixer Werte|false|
|unit|ja|String|"m"|Die voreingestellte Maßeinheit mit der der Durchmesser des Doppelkreises unter der circleMethod "defined" berechnet werden soll.|false|
|circleRadius|ja|Number|0|Der voreingestellte Durchmesser des inneren Ringes des Doppelkreises bezogen auf die Unit unter der circleMethod "defined".|false|
|circleOuterRadius|ja|Number|0|Der voreingestellte Durchmesser des äußeren Ringes des Doppelkreises bezogen auf die Unit unter der circleMethod "defined".|false|
|strokeWidth|ja|Number|1|Die voreingestellte Strichstärke (Dicke) des Randes des Doppelkreises in Pixel.|false|
|color|ja|Number[]|[55, 126, 184, 1]|Die voreingestellte Farbe des Doppelkreises als RGB color array mit Alpha-Kanal.|false|
|opacity|ja|Number|1|Die voreingestellte Transparenz des Doppelkreises in einer Range [0..1].|false|
|colorContour|ja|Number[]|[0, 0, 0, 1]|Die voreingestellte innere Ring-Farbe des Doppelkreises als RGB color array mit Alpha-Kanal.|false|
|outerColorContour|ja|Number[]|[0, 0, 0, 1]|Die voreingestellte äußere Ring-Farbe des Doppelkreises als RGB color array mit Alpha-Kanal.|false|
|opacityContour|ja|Number|1|Die voreingestellte Transparenz der Rand-Farbe des Doppelkreises in einer Range [0..1].|false|

**Beispiel**

```json
    {
        circleMethod: "defined",
        unit: "m",
        circleRadius: 0,
        circleOuterRadius: 0,
        strokeWidth: 1,
        color: [55, 126, 184, 1],
        opacity: 1,
        colorContour: [0, 0, 0, 1],
        opacityContour: 1
    }
```

***

###### portalConfig.menu.sections.modules.draw.writeTextSet {data-toc-label='Write Text Set'}

Objekt zum Ändern des konfigurierten Default-Wertes für einen Text im Zeichen-Tool.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|text|ja|String|""|Der voreingestellte Text.|false|
|fontSize|ja|Number|10|Die voreingestellte Schriftgröße.|false|
|font|ja|String|"Arial"|Die voreingestellte Schriftart (beschränkt auf "Arial", "Calibri" oder "Times New Roman").|false|
|color|ja|Number[]|[55, 126, 184, 1]|Die voreingestellte Farbe der Fläche als RGB color array mit Alpha-Kanal.|false|
|opacity|ja|Number|1|Die voreingestellte Transparenz der Fläche in einer Range [0..1].|false|

**Beispiel**

```json
    {
        text: "",
        fontSize: 10,
        font: "Arial",
        color: [55, 126, 184, 1],
        opacity: 1
    }
```

***

###### portalConfig.menu.sections.modules.draw.download {data-toc-label='Download'}

Objekt zum Ändern des voreingestellten Formats beim Herunterladen einer Zeichnung. Das ist eins von "KML", "GPX", "GEOJSON".

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|preSelectedFormat|nein|enum["KML","GEOJSON","GPX"]|"KML"|Die voreingestellte pre-selected form.|false|

**Example**

```json
{
    "preSelectedFormat": "KML"
}
```

***

##### portalConfig.menu.sections.modules.featureLister {data-toc-label='Feature Lister'}

[inherits]: # (portalConfig.menu.sections.modules)

Dieses Modul kann geladene Vektordaten von WFS(❗) Layern in einer Tabelle darstellen. Alle sichtbaren Vektorlayer aus der Karte werden im ersten Reiter angezeigt. Die Features des Layers werden im zweiten Reiter der Tabelle aufgelistet. Die Anzahl der angezeigten Features ist konfigurierbar.

Sobald man den Mauszeiger über einem Feature in der Liste positioniert wird dieses in der Karte hervorgehoben. Durch Klick auf ein Feature werden dessen Attribute in einem dritten Reiter  sortierbar dargestellt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|highlightVectorRulesPointLine|nein|**[highlightVectorRulesPointLine](#portalconfigmenusectionsmodulesfeaturelisterhighlightvectorrulespointline)**||Angabe der Umriss-Farbe und -Strichstärke für das Hervorheben von Linien und einer Füllfarbe sowie eines Skalierungsfaktors für das Hervorheben von Punkten und einer Zoomstufe.|false|
|highlightVectorRulesPolygon|nein|**[highlightVectorRulesPolygon](#portalconfigmenusectionsmodulesfeaturelisterhighlightvectorrulespolygon)**||Angabe der Füllfarbe und der Umriss-Farbe und -Strichstärke für das Hervorheben der Polygon-Features und einer Zoomstufe.|false|
|icon|nein|String|"bi-list"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|maxFeatures|nein|Integer|20|Anzahl der zu zeigenden Features. Über einen Button können weitere Features in dieser Anzahl zugeladen werden.|false|
|name|nein|String|"common:modules.featureLister.name"|Name des Moduls im Menü.|false|
|type|ja|String|"featureLister"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

```json
"featureLister": {
    "name": "Liste",
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

[type:Fill]: # (Datatypes.Fill)
[type:Stroke]: # (Datatypes.Stroke)
[type:Image]: # (Datatypes.Image)

Angabe der Umriss-Farbe und -Strichstärke für das Hervorheben von Linien und Füllfarbe, sowie Skalierungsfaktor für das Hervorheben von Punkten. Ebenfalls kann eine Zoomstufe angegeben werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fill|nein|**[Fill](#datatypesfill)**|[255, 255, 255, 0.5]|Mögliche Einstellung: color|false|
|image|nein|**[Image](#datatypesimage)**|1.5|Mögliche Einstellung: scale|false|
|stroke|nein|**[Stroke](#datatypesstroke)**|1|Mögliche Einstellung: width|false|
|zoomLevel|nein|Integer|7|Mögliche Einstellung: 0-9|false|

***

###### portalConfig.menu.sections.modules.featureLister.highlightVectorRulesPolygon {data-toc-label='Highlight Vector Rules Polygon'}

[type:Fill]: # (Datatypes.Fill)
[type:Stroke]: # (Datatypes.Stroke)

Angabe der Füll-Farbe und -Strichstärke für das Hervorheben von Polygonen sowie einer Zoomstufe.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fill|nein|**[Fill](#datatypesfill)**|[255, 255, 255, 0.5]|Mögliche Einstellung: color|false|
|stroke|nein|**[Stroke](#datatypesstroke)**|1|Mögliche Einstellung: width|false|
|zoomLevel|nein|Integer|7|Mögliche Einstellung: 0-9|false|

***

##### portalConfig.menu.sections.modules.fileImport {data-toc-label='File Import'}

[inherits]: # (portalConfig.menu.sections.modules)

Über dieses Modul können Dateien der Formate "*.kml", "*.geojson" und "*.gpx" importiert werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|enableZoomToExtend|nein|Boolean|false|Legt fest, ob der Dateiname als Knopf angezeigt wird, welcher die Möglichkeit bietet, in die importierten Features hineinzuzoomen.|false|
|icon|nein|String|"bi-box-arrow-in-down"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.fileImport.name"|Name des Moduls im Menü.|false|
|type|nein|String|"fileImport"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|
|customStylingOption|nein|Boolean|false|Legt fest, ob eine Stylingoption für GeoJson angezeigt wird.|false|
|showConfirmation|nein|Boolean|true|Legt fest, ob ein Bestätigungsfenster, nach einem Upload, angezeigt wird.|false|

**Beispiel**

```json
{
    "type": "fileImport",
    "enableZoomToExtend": true
}
```

***

##### portalConfig.menu.sections.modules.filter {data-toc-label='Filter'}

[inherits]: # (portalConfig.menu.sections.modules)

Das Filterwerkzeug bietet eine Reihe von Optionen zum Filtern von Vektordaten aus WFS-, OAF-, GeoJSON-, SensorThingsAPI- und VectorTiles-Diensten an.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|geometrySelectorOptions|nein|[filterGeometrySelector](#portalconfigmenusectionsmodulesfilterfiltergeometryselector)[]|false|Optionen für ein zusätzliches Werkzeug zur Filterung innerhalb eines selbst gezeichneten Gebietes. Sollten Sie dieses Modul in Verbindung mit externer Filterung nutzen (`extern`: `true`), denken Sie bitte daran Ihren Layer-Filter mit `geometryName` zu konfigurieren.|false|
|layers|nein|[filterLayer](#portalconfigmenusectionsmodulesfilterfilterlayer)[]|[]|Konfiguration der zu filternden Layer. Wenn hier ein Array von Layer-Ids angegeben wird, versucht das System eine automatische Ermittlung der Layer- und seine Snippet-Einstellungen.|false|
|layerGroups|nein|[filterLayerGroups](#portalconfigmenusectionsmodulesfilterfilterlayergroups)[]|[]|Konfiguration der zu filternden zusammengehörenden Layer.|false|
|layerSelectorVisible|nein|Boolean|true|Verwenden des Auswahl-Selektors für die Layer. Auf `false` setzen um keine Selektion zu verwenden.|false|
|liveZoomToFeatures|nein|Boolean|true|Zoomen bei Filterung auf den Browser-Extent der die gefilterten Features umfasst.|false|
|minScale|nein|Integer|5000|Der minimale Zoom-Level an dem das Zoomen nach Filterung immer stoppt.|false|
|multiLayerSelector|nein|Boolean|true|Wenn `layerSelectorVisible` auf `true` gesetzt ist, kann hiermit das Verhalten zum Öffnen mehrerer Selektoren gleichzeitig eingestellt werden.|false|
|name|nein|String|"common:modules.filter.name"|Name des Moduls im Menü.|false|
|saveTo|nein|String|"void"|Wenn auf "url" gestellt ist, wird die aktuelle Filtereinstellung abgespeichert. Über das Modul shareView kann ein Link erstellt werden in dem die Einstellungen vom Filter mit enthalten sind.|false|
|linkText|no|String|""|Linktext für URL-Link zur aktuellen Filtereinstellung, oder leerer String wenn kein solcher Link angezeigt werden soll. Erfordert "saveTo": "url"|false|
|type|nein|String|"filter"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|
|closeGfi|nein|Boolean|false|Wenn closeGfi auf `true` gesetzt ist und ein GFI-Fenster geöffnet ist, wird das GFI-Fenster nach neue Filterung geschlossen.|false|

**Beispiel**

Beispiel für die Konfiguration eines Filters mit einem einzigen Layer. Der Layer und seine Snippets werden automatisch eingestellt.

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

Eine zusätzliche Auswahl erscheint über dem Filter, in der eine Geometrie gewählt und auf der Karte gezeichnet werden kann. Der Filter filtert nur in dem ausgewählten Gebiet.
Sollten Sie dieses Modul in Verbindung mit externer Filterung nutzen (`extern`: `true`), denken Sie bitte daran Ihren Layer-Filter mit `geometryName` zu konfigurieren.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|additionalGeometries|nein|Boolean|false|Geometrien aus einem Layer können dem Filter über die Layer-ID hinzugefügt werden. Zusätzlich muss ein Attribut für den Namen der Geometrie angegeben werden.|false|
|circleSides|nein|Number|256|Die Geometrie "Circle" wird aus technischen Gründen in ein Polygon konvertiert. Dies ist die Anzahl der Polygon-Punkte der resultierenden Geometrie.|false|
|defaultBuffer|nein|Number|20|Der Geometrie "LineString" wird ein Buffer (in Metern) gegeben, um aus dem LineString einen "Schlauch" zu machen. Dies ist der Standard-Abstand von der Mitte zum Rand in Metern.|false|
|fillColor|nein|String|"rgba(0, 0, 0, 0.33)"|Die Füll-Farbe des Außenbereiches (bzw. der Geometry bei `invertGeometry` = `false`).|false|
|geometries|nein|String[]|["Polygon", "Rectangle", "Circle", "LineString"]|Die auswählbaren Geometrien und ihre Reihenfolge.|false|
|invertGeometry|nein|Boolean|true|`true`: Die Geometry ist transparent, der Außenbereich wird als Schatten dargestellt. `false`: Die Füll-Angaben gelten für die Geometrie selbst.|false|
|strokeColor|nein|String|"rgba(0, 0, 0, 1)"|Die Farbe der Umrandung der Geometrie.|false|
|strokeWidth|nein|Number|1|Die Dicke der Umrandung der Geometrie.|false|
|visible|ja|Boolean|true|Aktiviert den "Geometry-Selector".|false|

**Beispiel**

Beispiel für die minimale Konfiguration des `filterGeometrySelector`.

```json
{
    "visible": true
}
```

**Beispiel**

Beispiel für eine vollständige Konfiguration mit den Standard-Einstellungen des `filterGeometrySelector`.

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

**Beispiel**

Beispiel für eine vollständig veränderte Konfiguration des `filterGeometrySelector`.

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

Die Konfiguration eines Layers.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|active|nein|Boolean|false|Auf `true` setzen, damit der Filter mit diesem geöffneten Filter-Layer initial geöffnet wird - nur verfügbar, wenn `layerSelectorVisible` auf `true` steht. Steht `multiLayerSelector` auf `false` und mehr als ein Filter-Layer wird auf active `true` gestellt, dann wird nur das letzte dieser Layer initial geöffnet.|false|
|clearAll|nein|Boolean|false|Beim Klick auf den Zurücksetzen-Button werden alle Features angezeigt. Wird das clearAll-Flag auf `true` gestellt, werden beim Zurücksetzen keine Features angezeigt.|false|
|collection|nein|String||NUR FÜR VectorTiles: Die collection auf die gefiltert werden soll. Wenn es gesetzt ist, muss der parameter `baseOAFUrl` an dem layer gesetzt sein um die API Anfragen zu starten.|false|
|description|nein|String|""|Die detailierte Beschreibung eines Layers bei geöffnetem Auswahl-Selektor oder immer über dem Filter wenn `layerSelectorVisible` `false` ist. Kann ein Übersetzungs-Key sein.|false|
|download|nein|Boolean|""|Geben Sie hier ein true für eine Export-Datei an, um das Herunterladen der auf diesem Layer gefilterten Daten zu aktivieren. Es erscheint ein Downloadbereich am Ende des Filters. Für VectorTiles funktioniert nur der CSV-Download.|false|
|extern|nein|Boolean|false|Stellen Sie dieses Flag auf `true`, um die Filterung serverseitig durchzuführen. Dies sollte für große Datenmengen in Betracht gezogen werden, die nicht in einem Stück in den Browser geladen werden können. Es ist dann außerdem ratsam das Layer-Flag **[isNeverVisibleInTree](#layerconfigelementslayersvector)** auf `true` zu stellen, um das Laden des gesamten Datensatzes durch User-Interaktion über den Themenbaum zu verhindern.|false|
|filterButtonDisabled|nein|Boolean|false|Nur für strategy `passive`: Der Filter-Knopf wird deaktiviert solange der Benutzer nichts im Filter ausgewählt hat.|false|
|filterOnMove|nein|Boolean||Wenn auf `true` eingestellt, wird der Layer bei Kartenbewegung dynamisch gefiltert. Funktioniert nur in Verbindung mit `multiLayerSelector`: `false`. Löst in dieser Verbindung beim Öffnen des Akkordeons die Filterung aus.|false|
|filterOnOpen|nein|Boolean||Wenn auf `true` eingestellt, wird der Filter bei Klick auf das accordeon ausgelöst.|false|
|geometryName|nein|String|""|Nur für `extern: true` in Verbindung mit Filterung innerhalb von Polygonen: Der Geometrie-Name der Features um eine Schnittmenge feststellen zu können.|false|
|labelFilterButton|nein|String|"common:modules.tools.filter.filterButton"|Bei passiver Strategie (`passive`): Der verwendete Text vom Filter-Button. Kann auch ein Übersetzungs-Key sein.|false|
|layerId|nein|String||Die Layer-Id, muss identisch sein mit der unter `layerconfig` konfigurierten Id des Layers.|false|
|maxZoom|nein|Number||Die maximale Zoomstufe. Wenn die aktuelle Zoomstufe größer als `maxZoom` ist, wird der aktuelle Filter deaktiviert.|false|
|minZoom|nein|Number||Die minimale Zoomstufe. Wenn die aktuelle Zoomstufe kleiner als `minZoom` ist, wird der aktuelle Filter deaktiviert.|false|
|paging|nein|Number|1000|Der Filter lädt Features Stück für Stück in die Map. Dies ermöglicht einen Ladebalken, der die Usability bei großen Datenmengen verbessert. Das Paging ist die Stück-Größe. Bei zu gering eingestellter Größe wird das Filtern ausgebremst. Bei zu groß eingestellter Größe steigt die Verzögerung der Anzeige in der Karte. Der beste Wert kann nur von Fall zu Fall durch Ausprobieren ermittelt werden.|false|
|resetLayer|nein|Boolean|false|Auf `true` setzen, damit der Zurücksetzenknopf als reset für den ganzen Layer fungieren soll und damit auch die `prechecked` Werte ignoriert. Wird ignoriert sollte `clearAll` auf `true` gesetzt sein. Des Weiteren sollte der Parameter nicht in Verbindung mit einer niedrigen `paging` Zahl konfiguriert werden, da ansonsten beim Zurücksetzen der komplette Layer nur sehr langsam und verzögert auf der Karte angezeigt wird.|false|
|searchInMapExtent|nein|Boolean|false|Wenn auf `true` eingestellt, wird automatisch eine generische Checkbox erzeugt, mit der die Filterung auf den Browser-Extent beschränkt werden kann. Ist die Checkbox angehakt, ist das automatische Zoomen ausgeschaltet. Bitte unbedingt **[loadingStrategy](#layerconfigelementslayersvector)** auf `all` setzen, da es sonst zu ungewollten Effekten kommt, wenn nach dem Filtern herausgezoomt wird.|false|
|searchInMapExtentInfo|nein|Boolean|true|Rechts von der Checkbox wird ein Info-Symbol angezeigt, bei Klick wird eine Standard-Beschreibung eingeblendet. Auf `false` stellen, wenn es nicht angezeigt werden soll. Kann auch als String mit einem eigenen Info-Text eingestellt werden oder als Übersetzungs-Key.|false|
|searchInMapExtentPreselected|nein|Boolean|false|Die Checkbox zum Filtern im Browser-Extent ist initial ausgewählt wenn `searchInMapExtentPreselected`: `true` eingestellt ist.|false|
|searchInMapExtentProactive|nein|Boolean|true|Die Checkbox zum Filtern im Browser-Extent löst unter `strategy`: `active` eine direkte Filterung im aktuellen Browser-Extent aus. Dies kann durch Einstellen von `searchInMapExtentProactive`: `false` abgeschaltet werden.|false|
|shortDescription|nein|String|""|Eine kürzere Version der Beschreibung die bei Verwendung von Auswahl-Selektoren bei geschlossenen Selektoren angezeigt wird. Kann ein Übersetzungs-Key sein.|false|
|showHits|nein|Boolean|true|Die Treffer nach einer Filterung werden als Text angezeigt. Auf `false` stellen, um die Treffer nicht anzuzeigen.|false|
|snippets|nein|**[Snippets](#datatypessnippets)**[]|[]|Konfiguration der sogenannten Snippets für das Filtern. Kann bei der minimalsten Variante ein Array von Attribut-Namen sein. Kann komplett weggelassen werden, wenn die automatische Snippet-Ermittlung verwendet werden soll.|false|
|snippetTags|nein|Boolean|true|Wenn gefiltert wurde, wird die Einstellung des Filters als Tags über dem Filter angezeigt. Auf `false` stellen, wenn dies vermieden werden soll.|false|
|strategy|nein|String||Es gibt zwei Filter-Strategien: `passive` - Filtern nur nach Klick auf den Filter-Button. Und `active` - Filterung findet immer sofort statt, wenn die Einstellung irgendeines der Snippets verändert wird. Die passive Strategie ist der Default.|false|
|title|nein|String||Der Titel der für den Auswahl-Selektor verwendet werden soll (nur bei `layerSelectorVisible` `true`). Kann ein Übersetzungs-Key sein. Wenn nicht eingestellt, dann wird die Layer-Id per default verwendet.|false|
|wmsRefId|nein|String/String[]|""|Wenn der Layer gefiltert wird, wird der WMS-Layer mit der wmsRefId unsichtbar und im Themenbaum deaktiviert. Stattdessen wird der WFS aus der Filter-Konfiguration angezeigt. Nach dem Zurücksetzen des Filters wird die WMS-Ebene wieder aktiviert und wieder sichtbar.|false|
|initialStartupReset|nein|Boolean|false|Wenn der Parameter auf `true` gesetzt wird, dann erscheint ein Knopf zum Zurücksetzen des Filters. Hierbei ist zu beachten, dass dieser das Nachjustieren unterbindet und somit nur für Filterkonfigurationen mit einem `Datatypes.Snippets.Children` empfohlen.|false|

**Beispiel**

Dieses Beispiel konfiguriert ein Layer mit nur einem einzigen Snippet. Die Art des Snippets und seine Einstellungen werden automatisch ermittelt. Siehe **[Datatypes.Snippets](#datatypessnippets)** um mehr zur Konfiguration von Snippets zu erfahren.

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
Ein Objekt zum Definieren eines Gruppen-Layers zum Filtern.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|-----------|-------|
|layers|nein|String|[]|Konfiguration der zu filternden Layer. Kann auch ein Array von einfachen Layer-IDs sein - wenn ja, werden der Layer und alle Snippets automatisch identifiziert. Der Typ ist `filterLayer`, aber hier wurde er als String definiert, um sich wiederholende Definitionen innerhalb von layerGroups zu vermeiden. | false |
|title|ja|String||Der für den Gruppen-Layer zu verwendende Titel (wenn `layerSelectorVisible` `true` ist). Kann auch ein Übersetzungsschlüssel sein.|false|

**Beispiel**

**[layerGroups](#portalconfigmenusectionsmodulesfilterfilterlayergroups)** definiert zusammengehörige Layer. Jede Gruppe hat einen Titel und eine Liste von Layern. Diese werden zusammen im Filter angezeigt.

```json
{
  "layerGroups": [
    {
      "title": "GRUPPE 1",
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
      "title": "GRUPPE 2",
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

In diesem Modul lässt sich die Sprache des Portals umschalten.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-flag"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.language.name"|Name des Moduls im Menü.|false|
|type|nein|String|"language"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

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

Mit diesem Modul lassen sich Layer in Clustern gleichzeitig aktivieren/laden und deaktivieren.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-list"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|layerIdList|ja|String[]|[]|Auflistung der layerIds, der Layer die gemeinsam an- bzw. ausgeschaltet werden sollen.|false|
|name|nein|String|"common:modules.layerClusterToggler.name"|Name des Moduls im Menü..|false|
|type|nein|String|"layerClusterToggler"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

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

Der Layerslider ist ein Modul um verschiedene Layer in der Anwendung hintereinander an bzw. auszuschalten. Dadurch kann z.B. eine Zeitreihe verschiedener Zustände animiert werden.

Der Slider kann in der Oberfläche zwischen zwei Modi wechseln. Entweder als `"player"` mit Start/Pause/Stop-Buttons oder als `"handle"` mit einem Hebel. Bei "handle" wird die Transparenz der Layer zusätzlich mit angepasst.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-collection-play"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|layerIds|ja|**[layerId](#portalconfigmenusectionsmoduleslayersliderlayerid)**[]|[]|Array von Objekten aus denen die Layerinformationen herangezogen werden.|false|
|name|nein|String|"common:modules.layerSlider.name"|Name des Moduls im Menü.|false|
|timeInterval|nein|Integer|2000|Zeitintervall in ms bis der nächste Layer angeschaltet wird.|false|
|title|nein|String|"common:modules.layerSlider.title"|Titel der im Modul vorkommt.|false|
|type|nein|String|"layerSlider"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

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
    "name": "Zeitreihe",
    "timeInterval": 2000,
    "title": "Simulation von Beispiel-WMS"
}
```

***

###### portalConfig.menu.sections.modules.layerSlider.layerId {data-toc-label='Layer Id'}
Definiert einen Layer für den Layerslider.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|layerId|ja|String||Id des Layers, der im Portal angezeigt werden soll. ACHTUNG: Diese LayerId muss auch in der layerConfig konfiguriert sein!|false|
|title|ja|String||Name des Layers, wie er im Portal angezeigt werden soll.|false|

**Beispiel**

```json
{
    "layerId": "123",
    "title": "Dienst 1"
}
```

***

##### portalConfig.menu.sections.modules.legend {data-toc-label='Legend'}

[inherits]: # (portalConfig.menu.sections.modules)

Konfigurationsoptionen für die Legende.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-lightbulb"|Icon der Legende.|false|
|name|ja|String|"common:modules.legend.name"|Name des Modules im Menü.|false|
|type|nein|String|"legend"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|
|sldVersion|nein|String|""|Gibt die `Styled Layer Descriptor` Version an, mit der die GetLegendGraphic requests abgesetzt werden sollen. Beispiel: "1.1.0"|false|

***

###### portalConfig.menu.sections.modules.login {data-toc-label='Login'}

[inherits]: # (portalConfig.menu.sections.modules)

|Name|Required|Type|Default|Description|Expert|
|----|--------|----|-------|-----------|------|
|name|ja|String||Der Name für das Module im Menü. Wird überschrieben, wenn der User eingeloggt ist.|false|
|icon|ja|String||Das Icon neben dem Login Button im Menü. Wird geändert, wenn der User eingeloggt ist (siehe module store).|false|

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

Mit dem Messwerkzeug können Strecken und Flächen gemessen werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|earthRadius|nein|Number|6378137|Erdradius in Metern. Bitte beachten Sie, dass der Erdradius in Abhängigkeit zum Bezugsellipsoiden gewählt werden sollte. Für ETRS89 (EPSG:25832) ist dies beispielsweise GRS80.|false|
|icon|nein|String|"bi-arrows-angle-expand"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|lineStringUnits|nein|String[]|["m", "km"]|Gibt an, welche Einheiten für Streckenberechnungen ausgewählt werden können. Unterstützt werden "m" (Meter), "nm" (Seemeile), "km" (Kilometer).|false|
|measurementAccuracy|nein|String|"meter"|Gibt an, wie genau das Messergebnis für "m", "nm", "m²", "ha" angezeigt wird. Die möglichen Optionen sind "decimeter" für eine Nachkommastelle. "meter" für keine Nachkommastelle. "dynamic" für eine Nachkommastelle bei Ergebnissen kleiner als 10 und keine Nachkommastelle bei Ergebnissen größer oder gleich 10 der entsprechenden Einheit.|false|
|name|nein|String|"common:modules.measure.name"|Name des Moduls im Menü.|false|
|polygonUnits|nein|String[]|["m²", "km²"]|Gibt an, welche Einheiten für Flächenberechnungen ausgewählt werden können. Unterstützt werden "m²", "ha", "km²".|false|
|type|nein|String|"measure"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

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

Dieses Modul zeigt alle Meldungen aus der newsFeedPortalAlerts.json und der config.json des aktuellen Portals unabhängig des "gelesen" Status.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-newspaper"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.news.name"|Name des Moduls im Menü.|false|
|type|nein|String|"news"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

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

Mit diesem Modul lässt sich eine Konfigurationsdatei (config.json) zur Laufzeit neu laden. Die Module und Karte werden an die neue Konfiguration angepasst.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-upload"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.openConfig.name"|Name des Moduls im Menü.|false|
|type|nein|String|"openConfig"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

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

Druckmodul. Konfigurierbar für 2 Druckdienste: den High Resolution PlotService oder MapfishPrint 3.

**ACHTUNG: Backend notwendig!**

**Es wird mit einem [Mapfish-Print3](https://mapfish.github.io/mapfish-print-doc) oder einem HighResolutionPlotService im Backend kommuniziert.**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|additionalLayers|nein|**[additionalLayers](#portalconfigmenusectionsmodulesprintadditionallayers)**||Definiert Layer die über Checkbox gesteuert zusätzlich gedruckt werden können.|false|
|capabilitiesFilter|nein|**[capabilitiesFilter](#portalconfigmenusectionsmodulesprintcapabilitiesfilter)**||Filterung der Capabilities vom Druckdienst. Mögliche Parameter sind layouts und outputFormats.|false|
|currentLayoutName|nein|String|"A4 Hochformat"|Legt fest, welches Layout als Standardwert beim Öffnen des Druckwerkzeuges ausgewählt sein soll. Zum Beispiel "A4 Hochformat". Wenn das angegebene Layout nicht vorhanden ist oder keins angegeben wurde, dann wird das erste Layout der Capabilities verwendet.|false|
|defaultCapabilitiesFilter|nein|**[capabilitiesFilter](#portalconfigmenusectionsmodulesprintcapabilitiesfilter)**||Ist für ein Attribut kein Filter in capabilitiesFilter gesetzt, wird der Wert aus diesem Objekt genommen.|false|
|dpiForPdf|nein|Number|200|Auflösung der Karte im PDF.|false|
|filename|nein|String|"report"|Dateiname des Druckergebnisses.|false|
|icon|nein|String|"bi-printer"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|isLegendSelected|nein|Boolean|false|Gibt an, ob die Checkbox, zum Legende mitdrucken, aktiviert sein soll. Wird nur angezeigt wenn der Druckdienst (Mapfish Print 3) das Drucken der Legende unterstützt.|false|
|name|nein|String|"common:modules.print.name"|Name des Moduls im Menü.|false|
|overviewmapLayerId|nein|String||Über den Parameter layerId kann ein anderer Layer für die Overviewmap verwendet werden. Wird keine Id angegeben, wird der erste Layer der ausgewählten Hintergundkarten verwendet.|false|
|printAppCapabilities|nein|String|"capabilities.json"|Pfad unter welcher die Konfiguration des Druckdienstes zu finden ist.|false|
|printAppId|nein|String|"master"|Id der print app des Druckdienstes. Dies gibt dem Druckdienst vor welche/s Template/s er zu verwenden hat.|false|
|printMapMarker|nein|Boolean|false|Wenn dieses Feld auf true gesetzt ist, werden im Bildausschnitt sichtbare MapMarker mitgedruckt. Diese überdecken ggf. interessante Druckinformationen.|false|
|printService|nein|String|"mapfish"|Flag welcher Druckdienst verwendet werden soll. Bei "plotservice" wird der High Resolution PlotService verwendet, wenn der Parameter nicht gesetzt wird, wird Mapfish 3 verwendet.|false|
|printServiceId|ja|String||Id des Druckdienstes der verwendet werden soll. Wird in der rest-services.json abgelegt.|false|
|showInvisibleLayerInfo|nein|Boolean|true|Definiert, ob eine Infobox angezeigt werden soll, wenn Layer aufgrund des Maßstabs unsichtbar sind und nicht mitgedruckt werden.|false|
|title|nein|String|"PrintResult"|Titel des Dokuments. Erscheint als Kopfzeile.|false|
|type|nein|String|"print"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel Konfiguration mit High Resolution PlotService**

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

**Beispiel Konfiguration mit MapfishPrint3**

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

###### portalConfig.menu.sections.modules.print.capabilitiesFilter {data-toc-label='Capabilities Filter'}
Liste von Layouts und Formaten, welche die Antwort vom Druckdienst in der jeweiligen Kategorie filtert.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|layouts|nein|String[]||Liste von Layouts, welche in der Oberfläche angezeigt werden sollen.|false|
|outputFormats|nein|String[]||Liste von Formaten, welche in der Oberfläche angezeigt werden sollen.|false|

**Beispiel capabilitiesFilter:**

```json
"capabilitiesFilter": {
    "layouts": ["A4 Hochformat", "A3 Hochformat"],
    "outputFormats": ["PDF"]
}
```

***

###### portalConfig.menu.sections.modules.print.additionalLayers
Liste von Layern, die im Druckdialog zusätzlich hinzugefügt werden können.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|active|nein|Boolean|false|Definiert ob der Layer aktiv ist.|false|
|id|ja|String||Service-ID des zu druckenden Layers.|false|
|label|ja|String||Beschriftung der Checkbox zu aktivieren des Layers im Druckdialog.|false|

```json title="Beispiel additionalLayers"
"additionalLayers": [{
  "id": "wms_koordinatennetze_25832",
  "label": "Koordinatennetz UTM32N - ETRS89"
}]
```

***

##### portalConfig.menu.sections.modules.routing {data-toc-label='Routing'}

[inherits]: # (portalConfig.menu.sections.modules)

Routing-Werkzeug. Ermöglicht Nutzern das Planen von Routen zwischen mehreren Punkten mit verschiedenen Optionen. Zusätzlich gibt es noch die Funktion zur Erstellung einer Erreichbarkeitsanalyse. Beide Funktionen sind mit einer Stapelverarbeitung verfügbar, zur Abfrage mehrere Routen und Analysen. ❗ Das Werkzeug greift auf Den Routing Dienst des BKG zurück ❗.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|activeRoutingToolOption|nein|String|"DIRECTIONS"|Gibt an welches Tool geöffnet werden soll.|false|
|routingToolOptions|nein|String[]|[ ]|Gibt an welche Tools bereitgestellt werden soll. Möglich sind aktuell "DIRECTIONS" und "ISOCHRONES"|false|
|download|nein|**[download](#portalconfigmenusectionsmodulesroutingdownload)**||Downloadoptionen|false|
|geosearch|nein|**[geosearch](#portalconfigmenusectionsmodulesroutinggeosearch)**||Geosucheoptionen|false|
|geosearchReverse|nein|**[geosearchReverse](#portalconfigmenusectionsmodulesroutinggeosearchreverse)**||Geosuchereverseoptionen|false|
|directionsSettings|nein|**[directionsSettings](#portalconfigmenusectionsmodulesroutingdirectionssettings)**||Routenplanungoptionen|false|
|isochronesSettings|nein|**[isochronesSettings](#portalconfigmenusectionsmodulesroutingisochronessettings)**||Erreichbarkeitsanalysenoptionen|false|

**Beispiel**

```json
{
    "type": "routing",
    "name": "common:modules.tools.routing",
    "icon": "bi-signpost-2",
    "activeRoutingToolOption": "DIRECTONS",
    "routingToolOptions": ["DIRECTONS", "ISOCHRONES"],
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
Routing-Werkzeug Download Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fileName|nein|String|""|Default Dateiname für den Download.|false|
|format|nein|enum["GEOJSON","KML","GPX"]|"GEOJSON"|Welches Format default ausgewählt ist.|false|

**Beispiel**

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

Routing-Werkzeug Geosuche Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Number|3|Minimum an Zeichen für die Anfrage bei dem externen Service.|false|
|limit|nein|Number|10|Maximale Anzahl an Zeichen für die Suche.|false|
|type|ja|enum["BKG","NOMINATIM","LOCATIONFINDER","KOMOOT","GAZETTEER","SPECIALWFS","ELASTIC"]|""|Welcher Typ für die Geosuche verwendet werden soll.|false|
|serviceId|ja|String||Welcher Service für die Geosuche verwendet werden soll.|false|
|typeName|nein|String||Typname für die specialWfs Geosuchabfrage.|false|
|propertyNames|nein|String[]||Namen der Eigenschaften, die in die specialWfs Geosuche einbezogen werden sollen.|false|
|geometryNames|nein|String||Name des Geometriefelds für die specialWfs Geosuche.|false|
|bbox|nein|**[Bbox](#datatypesbbox)**||BBOX-Wert zugeordnet zu einem speedProfile. Koordinatensystem ist abhängig von dem verwendeten epsg-Parameter. Der verwendete geosearch Dienst muss bbox-Werte als String unterstützen.|false|
|epsg|nein|String|4326|Welcher EPSG-Code vom Service genutzt wird (z.B. 4326, 25832).|false|
|searchField|nein|String||Der Pfad zum Feld welches bei der Nutzung von Elastic Search gesucht werden soll.|false|
|sortField|nein|String||Der Pfad zum Feld welches bei der Nutzung von Elastic Search die Sortierung der Ergebnisse in aufsteigender Reihenfolge vorgibt.|false|

**Beispiel für BKG**

```json
{
    "geosearch": {
        "type": "BKG",
        "serviceId": "bkg_geosearch",
        "bbox": {"CYCLING": "9.6,53.40,10.4,53.84"}
    }
}
```
**Beispiel für SPECIALWFS**

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
**Beispiel FÜR ELASTIC**

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
Routing-Werkzeug Geosuche Reverse Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|distance|nein|Number|1000|Distanz zum Suchen in Meter für die Anfrage bei dem externen Service.|false|
|filter|nein|String||Zusätzliche Filter für die Suche werden an die Anfrage angehangen.|false|
|type|ja|enum["BKG","NOMINATIM","KOMOOT"]||Welcher Typ für die Geosuche verwendet werden soll.|false|
|serviceId|ja|String||Welcher Service für die Geosuche verwendet werden soll.|false|

**Beispiel**

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

Routing-Werkzeug Routenplanung Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|type|ja|enum["ORS"]||Welche Art der externe Service zur Abfrage ist.|false|
|serviceId|ja|String||Welcher Service für die Abfrage verwendet werden soll.|false|
|speedProfile|nein|String|"CAR"|Welches Geschwindigkeitsprofil verwendet werden soll.|false|
|preference|nein|String|"RECOMMENDED"|Welche Art der Routenplanung verwendet werden soll.|false|
|customPreferences|nein|**[CustomPreferences](#datatypescustompreferences)**||Möglichkeit eigene Routenpräferenzen (zusätzlich zum BKG-Dienst) für die unterschiedlichen speedProfiles zu definieren (erfordert eigenes Backend)|false|
|customAvoidFeatures|nein|**[CustomAvoidFeatures](#datatypescustomavoidfeatures)**||Möglichkeit eigene Optionen für Verkehrswege meiden (zusätzlich zum BKG-Dienst) für die unterschiedlichen speedProfiles zu definieren (erfordert eigenes Backend)|false|
|styleRoute|nein|**[StyleRoute](#datatypesstyleroute)**||Stylerouteoptionen|false|
|styleWaypoint|nein|**[StyleWaypoint](#datatypesstylewaypoint)**||Stylewaypointoptionen|false|
|styleAvoidAreas|nein|**[StyleAvoidAreas](#datatypesstyleavoidareas)**||Styleavoidareasoptionen|false|
|batchProcessing|nein|**[BatchProcessing](#datatypesbatchprocessing)**||Batchprocessingoptionen|false|

**Beispiel**

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

##### portalConfig.menu.sections.modules.routing.isochronesSettings {data-toc-label='Isochrones Settings'}

[type:BatchProcessing]: # (Datatypes.BatchProcessing)
[type:StyleCenter]: # (Datatypes.StyleCenter)
[type:StyleIsochrones]: # (Datatypes.StyleIsochrones)

Routing-Werkzeug Erreichbarkeitsanalysen Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|type|ja|enum["ORS"]||Welche Art der externe Service zur Abfrage ist.|false|
|serviceId|ja|String||Welcher Service für die Abfrage verwendet werden soll.|false|
|speedProfile|nein|String|"CAR"|Welches Geschwindigkeitsprofil verwendet werden soll.|false|
|isochronesMethodOption|nein|String|"TIME"|Welche Methode für den Abruf verwendet werden soll.|false|
|distanceValue|nein|Number|30|Welcher Distanzwert in km für den Slider verwendet werden soll.|false|
|minDistance|nein|Number|1|Welche minimale Distanz in km für den Slider verwendet werden soll.|false|
|maxDistance|nein|Number|400|Welche maximale Distanz in km für den Slider verwendet werden soll.|false|
|timeValue|nein|Number|30|Welcher Zeitwert in min für den Slider verwendet werden soll.|false|
|minTime|nein|Number|1|Welche minimale Zeit in min für den Slider verwendet werden soll.|false|
|maxTime|nein|Number|180|Welche maximale Zeit in min für den Slider verwendet werden soll.|false|
|intervalValue|nein|Number|15|Welcher Intervallwert in km/min für den Slider verwendet werden soll.|false|
|minInterval|nein|Number|1|Welches minimale Intervall in km/min für den Slider verwendet werden soll.|false|
|maxInterval|nein|Number|30|Welches maximale Intervall in km/min für den Slider verwendet werden soll.|false|
|styleCenter|nein|**[StyleCenter](#datatypesstylecenter)**||Stylecenteroptionen|false|
|styleIsochrones|nein|**[StyleIsochrones](#datatypesstyleisochrones)**||Styleisochronesoptionen|false|
|batchProcessing|nein|**[BatchProcessing](#datatypesbatchprocessing)**||Batchprocessingoptionen|false|

**Beispiel**

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

Modul, mit dem der aktuelle Maßstab der Karte geändert werden kann.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-arrows-angle-contract"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.scaleSwitcher.name"|Name des Moduls im Menü.|false|
|type|nein|String|"scaleSwitcher"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

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

Erlaub das auswählen von Vektor Features, indem der Nutzer auf der Karte eine Auswahlbox aufziehen kann. Features innerhalb dieser Auwahl werden mit GFI Informationen angezeigt und es ist möglich, auf ein Feature zu zoomen. Zur Nutzung werden vektorbasierte WFS(❗) Dienste benötigt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|highlightVectorRulesPointLine|nein|**[highlightVectorRulesPointLine](#portalconfigmenusectionsmodulesselectfeatureshighlightvectorrulespointline)**||Angabe der Linienfarbe und -breite für Linien Features und der Füllfarbe und Skalierung für Punkte. Sowie optional eine Zoomstufe.|false|
|highlightVectorRulesPolygon|nein|**[highlightVectorRulesPolygon](#portalconfigmenusectionsmodulesselectfeatureshighlightvectorrulespolygon)**||Angabe der Füllfarbe, Kantenfarbe und -breite für das Hervorheben von Polygon Features. Sowie optional eine Zoomstufe.|false|
|icon|nein|String|"bi-hand-index"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.selectFeatures.name"|Name des Moduls im Menü.|false|
|type|nein|String|"selectFeatures"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

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

Angabe der Linienfarbe und -breite für Linien Features und der Füllfarbe und Skalierung für Punkte. Sowie optional eine Zoomstufe.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fill|nein|**[Fill](#datatypesfill)**|[255, 255, 255, 0.5]|Mögliche Einstellung: color|false|
|stroke|nein|**[Stroke](#datatypesstroke)**|1.5|Mögliche Einstellung: width|false|
|image|nein|**[Image](#datatypesimage)**|1|Mögliche Einstellung: scale|false|
|zoomLevel|nein|Integer|7|Zoomstufe, mögliche Einstellung: 0-9|false|

***

###### portalConfig.menu.sections.modules.selectFeatures.highlightVectorRulesPolygon {data-toc-label='Highlight Vector Rules Polygon'}

[type:Fill]: # (Datatypes.Fill)
[type:Stroke]: # (Datatypes.Stroke)

Angabe der Füllfarbe, Kantenfarbe und -breite für das Hervorheben von Polygon Features. Sowie optional eine Zoomstufe.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fill|nein|**[Fill](#datatypesfill)**|[255, 255, 255, 0.5]|Mögliche Einstellung: color|false|
|stroke|nein|**[Stroke](#datatypesstroke)**|1|Mögliche Einstellung: width|false|
|zoomLevel|nein|Integer|7|Zoomstufe, mögliche Einstellung: 0-9|false|

***

##### portalConfig.menu.sections.modules.shadow {data-toc-label='Shadow'}

[inherits]: # (portalConfig.menu.sections.modules)

Das ShadowTool bietet eine Oberfläche zur Definition einer Zeitangabe. Über Slider und Datepicker können Zeitangaben angegeben werden. Die ausgewählte Zeitangabe dient dem Rendern der Schatten aller 3D-Objekte im 3D-Modus, indem der Sonnenstand simuliert wird. Durch Ziehen des Sliders oder Auswahl eines neuen Datums wird unmittelbar ein neuer Sonnenstand simuliert. Per default startet das Tool mit der aktuellen Zeitangabe, die über Parameter überschrieben werden kann.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-lamp-fill"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|isShadowEnabled|nein|Boolean|false|Default Shadow-Wert. True um unmittelbar Shadow einzuschalten. False zum manuellen Bestätigen.|false|
|name|nein|String|"common:modules.shadow.name"|Name des Moduls im Menü.|false|
|shadowTime|nein|**[shadowTime](#portalconfigmenusectionsmodulesshadowshadowtime)**||Default-Zeitangabe, mit der das Shadowmodule startet. Erkennt "month", "day", "hour", "minute"|false|
|type|nein|String|"shadow"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

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
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|month|nein|String||Monat|false|
|day|nein|String||Tag|false|
|hour|nein|String||Stunde|false|
|minute|nein|String||Minute|false|

**Beispiel**

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String|"translate#common:menu.statisticDashboard"|Der Name des StatisticDashboard Werkzeug.|false|
|subtitle|nein|String|"common:modules.statisticDashboard.headings.mrhstatistics"|Der Untertitle zu zeigen|false|
|icon|nein|String|"bi-speedometer"|Das Icon des Tools.|false|
|colorScheme|ja|**[colorScheme](#portalconfigmenusectionsmodulesstatisticdashboardcolorscheme)**|""|Definiert die Farben der Features in statisticdashboard.|false|
|active|nein|Boolean|false|Wenn `true`, wird das Tool nach der Initialisierung des Portals geöffnet.|false|
|data|ja|**[data](#portalconfigmenusectionsmodulesstatisticdashboarddata)**|""|Daten für das statistic Dashboard Werkzeug.|false|
|classificationMode|nein|String|"quantiles"|Methode zur Klassenbildung für Choroplethen und Legende: "quantiles", "equalIntervals" oder "benutzerdefiniert"|false|
|allowPositiveNegativeMix|nein|Boolean|false|Ob bei der Klassenbildung für Choroplethen und Legende Klassen mit sowohl negativen als auch positiven Werten erlaubt sind.|false|
|minNumberOfClasses|nein|Number|2|Minimal auswählbare Zahl der Klassen für Choroplethen und Legende. Mindestens 2.|false|
|maxNumberOfClasses|nein|Number|5|Maximal auswählbare Zahl der Klassen für Choroplethen und Legende. Mindestens 3.|false|
|numberOfClasses|nein|Number|5|Aktuell ausgewählte Zahl der Klassen für Choroplethen und Legende.|false|
|selectableColorPalettes|nein|**[selectableColorPalettes](#portalconfigmenusectionsmodulesstatisticdashboardselectablecolorpalettes)**|{"label": "Blau", "baseColor": [8, 81, 156]}|Optionen für die Farbpalette der Choroplethen.|false|
|downloadFilename|nein|String|"Statistic Dashboard Download"|Der Titel der exportierten CSV Datei.|false|

**Beispiel**

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|referenceRegion|ja|Float[]|[]|Die RGBA-Farbe der Referenzregions.|false|
|lineCharts|ja|Float[]|[]|Die Liste mit den RGBA-Farben der Liniendiagramme.|false|

**Beispiel**

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
|label|ja|String||Der im Dropdown anzuzeigende Name der Palette.|false|
|baseColor|ja|Number[]||Die Basisfarbe als rgb-Array.|false|

**Beispiel**

```json
{
        {
            "label": "Blau",
            "baseColor": [8, 81, 156]
        }
}
```

***


###### portalConfig.menu.sections.modules.statisticDashboard.data {data-toc-label='Data'}

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|------|------------|------|
|layerId|ja|String|""|Die ID des Layers.|false|
|oafRequestCRS|no|String|""|Nur für OAF-Dienste - Das Koordinatenreferenzsystem in dem die Antwort des OAF Dienstes erfolgen soll. Zum Beispiel: 'http://www.opengis.net/def/crs/EPSG/0/25832'|false|
|oafDataProjectionCode|no|String|""|Nur für OAF-Dienste - Der Projektionscode der Daten, die vom Dienst als Antwort kommen. Wird benötigt, um die Features auf der Karte anzeigen zu können. Zum Beispiel: 'EPSG:25832'|false|
|geometryAttribute|ja|String|""|Typ des Geometrieattributs.|false|
|chartDirectionValue|nein|String|""|Gibt die Anzahl an, ab der die Balken im Diagramm von vertikal zu horizontal wechseln.|false|
|timeStepsFilter|yes|**[timeStepsFilter](#portalconfigmenusectionsmodulesstatisticdashboarddatatimestepsfilter)**|""|Ein Objekt welches aus Schlüsseln und Werten besteht bei denen der Schlüssel die Anzahl an Zeitgruppierungen und der Wert die Beschreibung für die Gruppierung beinhaltet.|false|
|mappingFilter|ja|**[mappingFilter](#portalconfigmenusectionsmodulesstatisticdashboarddatamappingfilter)**|""|Dieses Objekt beinhaltet Attribute, die dazu dienen die Filter mit den Werten zu befüllen.|false|

**Beispiel**

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
|key:value|ja|String|""|Key: Der Schlüssel ist die Anzahl des letzten "key"-Eintrags für Dropdown-Optionen. Value: Die Beschreibung für die Gruppierung.|false|
|all:value|ja|String|""|Key: Das Schlüsselwort für die Auswahl aller Einträge für Dropdown-Optionen. Value: Die Beschreibung für die Gruppierung.|false|

**Beispiel**

```json
{
	"5": "Die letzten 5 Jahre",
	"10": "Die letzten 10 Jahre",
	"all": "Alle Jahre"
}
```

***

###### portalConfig.menu.sections.modules.statisticDashboard.data.mappingFilter {data-toc-label='Mapping Filter'}

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|timeAttribute|ja|**[timeAttribute](#portalconfigmenusectionsmodulesstatisticdashboarddatamappingfiltertimeattribute)**|""|Dieses Objekt beinhaltet das Attribut für die Zeit-Filter.|false|
|regionNameAttribute|ja|**[regionNameAttribute](#portalconfigmenusectionsmodulesstatisticdashboarddatamappingfilterregionnameattribute)**|""|Dieses Objekt beinhaltet das Attribut für den Namen der Region.|false|
|statisticsAttributes|ja|**[statisticsAttributes](#portalconfigmenusectionsmodulesstatisticdashboarddatamappingfilterstatisticsattributes)**|""|Dieses Objekt beinhaltet attribute, die dazu dienen die Karte nach deren Werten zu filtern.|false|

**Beispiel**

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|attrName|ja|String|""|Das Attribut für die Zeit-Filter.|false|
|name|nein|String|""|Die Bezeichnung des Attributes.|false|
|inputFormat|nein|String|""|Eingabeformat|false|
|outputFormat|nein|String|""|Ausgabeformat|false|

**Beispiel**

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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|attrName|ja|String|""|Das Attribut für die Region.|false|
|name|no|String|""|Der Name des Region Attributs.|false|

**Beispiel**

```json
{
    "attrName": "statistisches_gebiet",
    "name": "Kreis"
}
```

***

###### portalConfig.menu.sections.modules.statisticDashboard.data.mappingFilter.statisticsAttributes {data-toc-label='Statistics Attributes'}

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|key|ja|String|""|Der Schlüssel des statistik Attributes.|false|
|name|ja|String|""|Die Bezeichnung des statistik Attributes.|false|
|Category|ja|String|""|Die Kategorie des statistik Attributes. Wenn die Kategorie gesetzt ist, wird es in der Kategorieauswahl unter dieser Kategorie gruppiert.|false|

**Beispiel**

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

Modul, um einen Link zur aktuellen Karten-Ansicht zu teilen. Es kann die aktuelle Ansicht als Link mit Url-Parametern, per QR-Code und als Facebook-Link geteilt werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|copyShare|nein|Boolean|true|Gibt an, ob der Button zum Kopieren des Links im Modul sein soll.|false|
|facebookShare|nein|Boolean|false|Gibt an, ob der Button zum Teilen des Links über Facebook im Modul sein soll.|false|
|icon|nein|String|"bi-share"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.shareView.name"|Name des Moduls im Menü.|false|
|type|nein|String|"shareView"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|
|qrShare|nein|Boolean|false|Gibt an, ob der Button zum Erstellen eines QR-Codes im Modul sein soll.|false|

**Beispiel**

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

Das Modul ermöglicht das Umschalten des Stylings von Vector Tile Layers(❗), sofern in der services.json mehrere Styles für die entsprechende Layer eingetragen sind.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-paint-bucket"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.styleVT.name"|Name des Moduls im Menü.|false|
|type|nein|String|"styleVT"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

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

Das Modul ermöglicht es einen WFS(❗) Layer abgekoppelt von der Suchleiste mittels Filter anzufragen und gegebenenfalls eine Ergebnisliste zu erstellen.
Wenn ein WFS@2.0.0 verwendet werden soll, wird erwartet, dass eine gespeicherte Anfrage (Stored Query) verwendet wird. Wenn ein WFS@1.1.0 verwendet werden soll, wird erwartet, dass der Aufbau der Anfrage mittels der Konfiguration dieses Werkzeugs grundlegend vorgegeben wird.

Es können mehrere Suchinstanzen (**[SearchInstances](#portalconfigmenusectionsmoduleswfssearchsearchinstance)**) definiert werden, welche durch jeweilige Dropdown-Menüs ausgewählt werden können.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|instances|ja|**[searchInstance](#portalconfigmenusectionsmoduleswfssearchsearchinstance)**[]||Array an `searchInstances`, welche jeweils eine Suchmaske darstellen.|false|
|zoomLevel|nein|Number|5|Gibt an, auf welche Zoomstufe (zoomLevel) gezoomt werden soll. Sollte das Feature nicht in die Zoomstufe passen, wird automatisch eine passende Zoomstufe gewählt.|false|
|resultsPerPage|nein|Number|0|In der Suchergebnisliste werden höchstens so viele Ergebnisse zugleich angezeigt. Wird diese Anzahl überschritten, bietet die Ergebnisliste eine nächste Ergebnisseite an. Beim Wert 0 werden alle Ergebisse auf einer Seite angezeigt.|false|
|multiSelect|nein|Boolean|false|Wenn `true`, können Nutzende durch Drücken von Strg oder Shift, oder über Checkboxen, mehrere Features der Ergebnisliste auswählen; beim Zoomen wird dann auf alle ausgewählten Features gezoomed.|false|

**Beispiel**

```json
{
    {   "type": "wfsSearch",
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
                                        "inputLabel": "Gemarkung",
                                        "options": ""
                                    }
                                },
                                {
                                    "field": {
                                        "queryType": "equal",
                                        "fieldName": "flur",
                                        "inputLabel": "Flur",
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

Eine Instanz der WFS Suche, welche durch ein Dropdown Menü im Werkzeug ausgewählt werden kann.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|literals|ja|**[Literal](#datatypesliteral)**[]||Array an `literals`.|true|
|requestConfig|ja|**[RequestConfig](#datatypesrequestconfig)**||Ein Objekt, welches hauptsächlich die Id des WFS-Dienstes (`layerId` oder `restLayerId`), welcher angefragt werden soll, beinhaltet. Wenn ein WFS@2.0.0 verwendet werden soll, muss die id der gespeicherten Anfrage (Stored Query, `storedQueryId`), also der im Dienst enthaltenen Anfrage, angegeben werden. Zudem können weitere Einstellungen hinsichtlich der Anfragen hier hinzugefügt werden.|false|
|selectSource|nein|String||Optionale Url, unter welcher eine JSON-Datei mit den verschiedenen Optionen für den Input gespeichert ist. Für eine Beispiel siehe **[https://geoportal-hamburg.de/lgv-config/gemarkungen_hh.json]**.|false|
|suggestions|nein|**[Suggestions](#datatypessuggestions)**||Wenn gegeben, dann wird der Service angefragt, wenn Nutzende etwas in ein Eingabefeld eingeben, um einen Vorschlag für die weitere Eingabe zu machen.|false|
|title|ja|String||Der Titel der Suche, welcher in einem Dropdown im Werkzeug dargestellt wird. Kann ein Übersetzungsschlüssel sein.|false|
|userHelp|nein|String||Informationstext hinsichtlich des Suchformulars, welches oberhalb des Formulars für die Nutzenden angezeigt werden soll. Wenn der Parameter nicht gegeben ist, dann wird die Struktur aus der Konfiguration abgeleitet. Kann ein Übersetzungsschlüssel sein. Falls der Wert explizit auf `hide` gesetzt wurde, dann wird keine Beschreibung der Struktur des Formulars angezeigt.|false|
|resultDialogTitle|nein|String||Überschrift der Ergebnisliste. Wenn dies nicht konfiguriert ist, wird der Name `WFS Suche` angezeigt. Kann ein Übersetzungsschlüssel sein.|false|
|resultList|nein|**[ResultList](#datatypesresultlist)**||Einstellungen für die Ausgabe der gefundenen Features in der Ergebnisliste. Wenn keine resultList konfiguriert ist, wird beim Ausführen der Suche direkt auf das erste gefundene Feature gezoomt.|true|

**Beispiel**

```json
{
    "requestConfig": {
        "layerId": "1234"
    },
    "resultList": {
        "schulname": "Schulname",
        "abschluss": "Abschluss"
    },
    "selectSource": "https://geoportal-hamburg.de/lgv-config/gemarkungen_hh.json",
    "title": "Flurstücksuche",
    "literals": [
        {
            "clause": {
                "type": "and",
                "literals": [
                    {
                        "field": {
                            "queryType": "equal",
                            "fieldName": "gemarkung",
                            "inputLabel": "Gemarkung",
                            "options": ""
                        }
                    },
                    {
                        "field": {
                            "queryType": "equal",
                            "fieldName": "flur",
                            "inputLabel": "Flur",
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

WFS-T Modul zur Visualisierung (*getFeature*), Erstellung (*insert*), Veränderung (*update*) und zum Löschen (*delete*) von Features eines bestehenden Web Feature Service (*WFS*), welcher Transaktionen entgegennehmen kann.
Zur Nutzung dieses Moduls muss ein WFS-T Layer mit der Version 1.1.0 bereitgestellt werden. Bitte beachten Sie **[services.json](../Global-Config/services.json.md)** für weitere Konfigurationsinformationen.

Beim Bearbeiten eines Features / Hinzufügen von Attributen zu einem neuen Feature werden bestimmte Werte in der Nutzeroberfläche angezeigt. Die Werte und auch dessen Label stehen im direkten Zusammenhang mit den `gfiAttributes` des Dienstes. Bitte beachten Sie **[services.json](../Global-Config/services.json.md)** für weitere Informationen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|delete|nein|[TransactionConfig](#portalconfigmenusectionsmoduleswfsttransactionconfig)/Boolean|false|Legt fest, welche der zu `layerIds` zugehörigen Layer das Löschen von Geometrien erlauben.|false|
|icon|nein|String|"bi-globe"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|layerIds|ja|String[]||Array an Ids von in **[services.json](../Global-Config/services.json.md)** definierten Layern.|false|
|layerSelectLabel|nein|String|"common:modules.wfst.layerSelectLabel"|Falls gegeben, wird der Wert als Label für die Layerauswahl-Select-Box verwendet. Kann ein Sprachschlüssel sein.|false|
|lineButton|nein|[TransactionConfig](#portalconfigmenusectionsmoduleswfsttransactionconfig)[]/Boolean|[]|Legt fest, welche der zu `layerIds` zugehörigen Layer das Hinzufügen von Linien erlauben.|false|
|name|nein|String|"common:modules.wfst.name"|Name des Moduls im Menü.|false|
|pointButton|nein|[TransactionConfig](#portalconfigmenusectionsmoduleswfsttransactionconfig)[]/Boolean|[]|Legt fest, welche der zu `layerIds` zugehörigen Layer das Hinzufügen von Punkten erlauben.|false|
|polygonButton|nein|[TransactionConfig](#portalconfigmenusectionsmoduleswfsttransactionconfig)[]/Boolean|[]|Legt fest, welche der zu `layerIds` zugehörigen Layer das Hinzufügen von Polygonen erlauben.|false|
|showConfirmModal|nein|Boolean|false|Kennzeichen, ob ein modaler Dialog angezeigt werden soll.|false|
|toggleLayer|nein|Boolean|false|Legt fest, ob die Feature des ausgewählten Layers weiterhin angezeigt werden sollen, wenn neue Feature hinzugefügt werden.|false|
|type|nein|String|"wfst"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|
|update|nein|[TransactionConfig](#portalconfigmenusectionsmoduleswfsttransactionconfig)/Boolean|false|Legt fest, welche der zu `layerIds` zugehörigen Layer das Bearbeiten von Geometrien erlauben.|false|

**Beispiel**

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
Konfiguration der verschiedenen Transaktionsmethoden für den entsprechenden Layer.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|available|ja|Boolean|true|Legt fest, ob der entsprechende Button der Transaktionsmethode für den Layer mit der gegebenen Id nutzbar sein soll.|false|
|icon|nein|String||Bootstrap Icon zur Anzeige innerhalb des Knopfes der Transaktionsmethode. Falls kein Wert angegeben wird, wird der Standardwert der Transaktionsmethode verwendet. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|layerId|ja|String||Id des Layers, für den die Transaktionsmethode konfiguriert wird.|false|
|multi|nein|Boolean|false|Legt fest, ob es sich bei den gezeichneten Geometrien um Multi-X-Geometrien handeln sollte. Bei Konfiguration für die Methoden `update` und `delete` hat der Parameter keine Auswirkung.|false|
|text|nein|String|"common:modules.wfst.interactionSelect.*"|Text des Knopfes der Transaktionsmethode. Falls kein Wert vorhanden ist, wird für `*` ein Standardwert der Transaktionsmethode verwendet. Kann ein Übersetzungsschlüssel sein.|false|

**Beispiele**

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
Im Menü kann der Portalname und ein Bild angezeigt werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|link|nein|String||URL der externen Seite, auf die verlinkt wird.|false|
|logo|nein|String||URL zur externen Bilddatei. Wird kein logo gesetzt, so wird nur der Titel ohne Bild dargestellt.|false|
|text|nein|String||Name des Portals.|false|
|toolTip|nein|String||Tooltip, der beim Hovern über das Portallogo angezeigt wird.|false|

**Beispiel portalTitle**

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
Möglichkeit den Inhalt der Fußzeile des Portals zu konfigurieren.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|configPaths|nein|String[]|["portalConfig.portalFooter"]|Liste mit möglichen Konfigurationen, die erste die gefunden wird, wird verwendet.|false|
|scaleLine|nein|Boolean|true|Gibt an, ob der Maßstab angezeigt werden soll.|false|
|scaleLineWidth|nein|Number|2|Die Breite der Maßstabsanzeige in cm.|false|
|seperator|nein|String|"` \| `"|Die Trennung zwischen einzelnen Links.|false|
|urls|nein|**[urls](#portalconfigportalfooterurls)**[]|[]|Urls, die im Footer angezeit werden sollen.|false|

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

Eine Url kann unterschiedlich definiert werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|alias|ja|String||Angezeigter Name des Links in der Desktop-Ansicht.|false|
|alias_mobil|nein|String||Angezeigter Name des Links in der Mobile-Ansicht. Falls nicht angegeben, wird der Link in der Mobilen Ansicht nicht angezeigt.|false|
|bezeichnung|nein|String||Angezeigte Bezeichnung vor dem Link.|false|
|url|ja|String||Die Url für den Link.|false|

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
Möglichkeit, um Einstellungen für den Themenbaum vorzunehmen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|addLayerButton|nein|**[addLayerButton](#portalconfigtreeaddlayerbutton)**|false|Wenn active:true, dann wird ein Button zum Hinzufügen von Layern dargestellt. Im Themenbaum werden initial nur sichtbare Layer und Layer mit der property `showInLayerTree = true` dargestellt. Wenn false, dann werden alle konfigurierten Layer im Themenbaum angezeigt. Bei dem tree.type `auto` wird immer ein Hinzufügen-Button angezeigt.|false|
|categories|nein|**[categories](#portalconfigtreecategories)**||Konfiguration der Kategorien aus den Metadaten. Nur für den tree.type `auto`.|false|
|highlightedFeatures|nein|**[highlightedFeatures](#portalconfigtreehighlightedfeatures)**||Konfiguration zusätzlich zum Highlighting von Features.|false|
|layerIDsToIgnore|nein|String[]||Liste von `services.json`-Layer-Ids, die nicht im Baum und in der Karte angezeigt werden sollen. Nur für den tree.type `auto`.|false|
|layerIDsToStyle|nein|**[layerIDsToStyle](#portalconfigtreelayeridstostyle)**[]||Spezielle Implementierung für einen HVV-Dienst (Hamburger Verkehrsbetriebe). Enthält Objekte zur Abfrage verschiedener Stile einer Layer-ID.|true|
|metaIDsToIgnore|nein|String[]||Alle in der `services.json` gefundenen Layer, die diesen Meta-IDs entsprechen, werden nicht im Baum und in der Karte angezeigt. Nur für den tree.type `auto`.|false|
|metaIDsToMerge|nein|String[]||Alle in der `services.json` gefundenen Layer, die diesen Meta-IDs entsprechen, werden zu einer einzigen Layer im Baum zusammengeführt. Nur für den tree.type `auto`.|true|
|showFolderPath|nein|Boolean|false|Legt fest, ob die Ordnerstruktur von sichtbaren Layern unter 'weitere Funktionen' angezeigt wird.|false|
|singleBaselayer|nein|Boolean|false|Legt fest, ob nur ein Baselayer gleichzeitig ausgewählt werden kann.|false|
|type|nein|enum["auto"]||Der Themenbaum ist in der gleichen Struktur aufgebaut wie die **[layerConfig](#layerconfig)**. Wenn der Typ `auto` konfiguriert ist, werden alle Ebenen aus der [services.json](../Global-Config/services.json.md) im Baum angeboten, strukturiert durch ihre Metadaten (Geo-Online).|false|
|validLayerTypesAutoTree|nein|enum|["WMS", "SENSORTHINGS", "TERRAIN3D", "TILESET3D", "OBLIQUE"]|Layer Typen die bei dem tree.type `auto` verwendet werden sollen.|false|
|hideBackgroundsHeader|nein|Boolean|false|Auf true setzen, um die Überschrift für Hintergründe auszublenden.|false|
|backgroundsHeaderText|nein|String||Alternative Überschrift für Hintergründe. Wenn gesetzt, ist eine nicht leere Zeichenkette erforderlich. Eine leere Zeichenfolge ("") gibt die Standard-i18n-Zeichenfolge/Übersetzung aus.|false|
|hideDatalayerHeader|nein|Boolean|false|Auf true setzen, um die Überschrift für datalayer auszublenden.|false|
|datalayerHeaderText|nein|String||Alternative Überschrift für datalayer. Wenn gesetzt, ist eine nicht leere Zeichenkette erforderlich. Eine leere Zeichenfolge ("") gibt die Standard i18n-Zeichenfolge/ Übersetzung aus.|false|
|subMenuContactButton|nein|Boolean|true|Legt fest, ob der Button zum Öffnen des Kontaktformulars mit layerspezifischen Paramentern im LayerSubMenu eingestellt ist|false|

**Beispiel type auto**

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
        "backgroundsHeaderText": "Das sollte nicht in der Ausgabe erscheinen",
        "hideDatalayerHeader": false,
        "datalayerHeaderText": "Spezifische Überschrift für datalayers über alle Sprachen hinweg - überschreibt i18n"
    }
}
```

**Beispiel kein type**

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
Konfiguration des addLayerButton zur Auswahl von Layern.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|active|ja|Boolean||Gibt an, ob addLayerButton initial aktiv ist.|false|
|searchBar|nein|**[searchBar](#markdown-header-portalconfigtreeaddlayerbuttonsearchbar)**/Boolean|false|Konfiguration der Suche in der Themen Auswahl.|false|
|buttonTitle|nein|String||Legt den Titel der Schaltfläche mit benutzerdefiniertem Text fest.|false|
|searchInterfaceInstanceId|ja|String||Deprecated in next major release - use **[searchInterfaceInstances](#markdown-header-portalconfigtreeaddLayerButtonsearchBarsearchInterfaceInstances) []** instead. Id des search interfaces. Konfiguriert an dem search interface am Parameter 'searchInterfaceId'.|true|
|searchCategory|ja|String||Deprecated in next major release - use **[searchInterfaceInstances](#markdown-header-portalconfigtreeaddLayerButtonsearchBarsearchInterfaceInstances) []** instead. Die Kategorie der Suche.|true|

**Beispiel**

```json
{
    "tree": {
        "addLayerButton": {
            "active": true,
            "buttonTitle": "Layer hinzufügen",
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

#### portalConfig.tree.addLayerButton.searchBar {data-toc-label='Searchbar in Topic Tree'}
Es wird eine Themensuche innerhalb des konfigurierten SearchInterfaces und SearchCategory ermöglicht.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|active|ja|Boolean||Gibt an, ob die Suche angezeigt wird.|false|
|searchInterfaceInstances|ja|**[searchInterfaceInstances](#markdown-header-portalconfigtreeaddLayerButtonsearchBarsearchInterfaceInstances) []**||Liste der search interfaces aus der searchbar, die hier genutzt werden sollen.|true|

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
#### portalConfig.tree.addLayerButton.searchBar.searchInterfaceInstances {data-toc-label='Searchinterface Instances'}
Liste der search interfaces aus der searchbar, die hier genutzt werden sollen.
Die Suche funktioniert nur mit interfaces, die eine Themensuche ausführen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|ja|String||Id des search interfaces. Konfiguriert an dem search interface am Parameter 'searchInterfaceId'.|false|
|searchCategory|ja|String||Die search category.|false|

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
Konfiguration der Kategorien aus den Metadaten. Nur für den tree.type `auto`.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|key|ja|String||Schlüssel der jeweiligen Kategorie in den Metadaten.|false|
|name|ja|String||Name der Kategorie.|false|
|active|nein|Boolean||Gibt an, ob diese Kategorie initial aktiv ist. Bei keiner Angabe, ist die 1. Kategorie initial aktiv.|false|

**Beispiel**

```json
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
      ]
```

***

#### portalConfig.tree.highlightedFeatures {data-toc-label='Highlighted Features'}
Konfiguration zusätzlich zum Highlighting von Features. Wenn mit dem Modul "Liste" oder "Features auswählen" mit "Auf dieses Feature zoomen" oder per Url-Parameter Features hervorgehoben werden, dann ist ein Layer mit diesen Features im Menü-Baum auswählbar.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|active|nein|Boolean|false|Gibt an, ob dieses Feature aktiv ist.|false|
|layerName|nein|String|"common:tree.selectedFeatures"|Name der erzeugten Layer mit den hervorgehobenen Features. Der Name enthält zusätzlich den Namen des Moduls mit dem gearbeitet wurde.|true|

**Beispiel**

```json
"highlightedFeatures": {
    "active": false,
    "layerName": "Ausgewählte Features"
},
```

***

#### portalConfig.tree.layerIDsToStyle {data-toc-label='Layer IDs To Style'}
Kombiniert den style von mehreren Layern, Namen  und Legenden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|nein|String||a `services.json` layer's id|false|
|styles|nein|String/String[]||Zu verwendender Stil als String; wenn mehrere Stile verwendet werden sollen, werden sie in einem Array aufgeführt.|false|
|name|nein|String/String[]||Zu verwendender Name als String; wenn mehrere Namen verwendet werden sollen, werden sie in einem Array aufgelistet.|false|
|legendUrl|nein|String/String[]||URL des Legendenbildes als String ; wenn mehrere Legendenbilder verwendet werden sollen, werden ihre URLs in einem Array aufgelistet.|false|

**Beispiel:**

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
Die layerConfig definiert, welche Inhalte an welcher Stelle im Themenbaum angezeigt werden. Es können folgende Eigenschaften konfiguriert werden:

1. Layer die Hintergrundkarten beinhalten (*baselayer*)
2. Layer die Fachdaten beinhalten (*subjectlayer*)

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|baselayer|nein|**[baselayer](#layerconfigbaselayer)**||Layer die Hintergrundkarten beinhalten.|false|
|subjectlayer|nein|**[subjectlayer](#layerconfigsubjectlayer)**||Layer die subjectlayer beinhalten.|false|

**Beispiel**

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

Hier werden Layer definiert, die als Hintergrundkarten angezeigt werden sollen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|elements|nein|**[elements](#layerconfigelements)**[]||Definition der Layer die im Themenbaum als Hintergrudnkarten angezeigt werden sollen.|false|

**Beispiel**

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

Hier werden Layer oder Ordner mit Layern definiert, die als subjectlayer angezeigt werden sollen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|elements|nein|**[elements](#layerconfigelements)**[]||Definition der Layer oder Ordner die im Themenbaum als subjectlayer angezeigt werden sollen.|false|

**Beispiel**

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

Hier werden Layer oder Ordner definiert. Ordner können **[elements](#layerconfigelements)** mit Ordner oder Layern enthalten.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|elements|nein|**[elements](#layerconfigelements)**[]||Nächste Ebene mit Layern oder Ordnern unter dem type `folder`.|false|
|name|nein|String|""|Name des Layers oder Ordners.|false|
|type|nein|String|"layer"|Typ des Elements: "layer" für Layer oder "folder" für Ordner|false|

**Beispiel baselayer**

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

**Beispiel subjectlayer**

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

**Beispiel mit Ordnern, die Layer enthalten**

```json
{
"elements": [
        {
        "name": "Ordner Ebene 1",
        "type": "folder",
        "elements": [
                {
                "name": "Ordner Ebene 2",
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
                            "name": "Ordner Ebene 3",
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

### layerConfig.elements.layers {data-toc-label='Layers'}

[inherits]: # (layerConfig.elements)

Hier werden Layer verschiedenen Typs konfiguriert. Layer können auf viele verschiedene Arten konfiguriert werden. Ein Großteil der Attribute ist in der **[services.json](../Global-Config/services.json.md)** definiert, kann jedoch hier am Layer überschrieben werden.
Neben diesen Attributen gibt es auch Typ-spezifische Attribute für die verschiedenen Layer Typen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|autoRefresh|nein|Integer||Automatischer Reload des Layers. Angabe in ms. Minimum ist 500.|false|
|capabilitiesUrl|nein|String||Wert aus **[services.json](../Global-Config/services.json.md)**. Capabilities URL des Dienstes|false
|fitCapabilitiesExtent|nein|Boolean|false|Wert aus **[services.json](../Global-Config/services.json.md)**. Bei Aktivierung dieser Option und Vorhandensein einer Capabilities URL in der Konfiguration, passt die Anwendung die Kartenausdehnung automatisch an die Bounding-Box-Informationen an, die sie aus der GetCapabilities-Anfrage erhält."|false|
|id|ja|String/String[]||Id des Layers. In der **[services.json](../Global-Config/services.json.md)** werden die Ids aufgelöst und die notwendigen Informationen herangezogen. Bei Konfiguration eines Arrays von Ids wird ein Layer erzeugt, der im Request den Parameter LAYERS mit einer komma-separierten Liste der Inhalte des Attributes `layers` der einzelnen Layer enthält. Die Einstellung von `minScale` und `maxScale` für jeden Layer muss in der `services.json` enthalten sein. Hierbei ist wichtig, dass die angegebenen ids dieselbe URL ansprechen, also den selben Dienst benutzen und vom selben typ sind. Mit dem Sonderzeichen `.` als Suffix, kann eine LayerId mehrfach verwendet werden. Jede mit einem Suffix versehene LayerId erzeugt einen eigenen Eintrag im Themenbaum.|false|
|isPointLayer|nein|Boolean|false|Anzeige, ob der (Vektor)-Layer nur aus Punkt-Features besteht (nur relevant für WebGL Rendering))|false|
|name|nein|String||Name des Layers.|false|
|preview|nein|**[preview](#layerconfigelementslayerspreview)**||Vorschau für baselayer vom Typ WMS, WMTS und VectorTile. WMS und WMTS: bei keiner Angabe, wird ein zentrierter Kartenausschnitt geladen.|false|
|renderer|nein|String|"default"|Render-Pipeline für die Darstellung ("default" oder "webgl")(nur für Vektordaten "GeoJSON", "WFS", "OAF")"webgl" ist derzeit als experimentell einzustufen.|false|
|showInLayerTree|nein|Boolean|false|Wenn true, dann wird der Layer initial im Themenbaum angezeigt. Wenn portalConfig.tree.addLayerButton nicht konfiguriert ist, dann hat dieses Attribut keinen Effekt.|false|
|transparency|nein|Integer|0|Transparenz des Layers.|false|
|type|nein|String|"layer"|Typ des Elements Layer: "layer"|false|
|urlIsVisible|nein|Boolean|true|Anzeige, ob die URL in der Layerinformation angezeigt werden soll.|false|
|visibility|nein|Boolean|false|Sichtbarkeit des Layers. Wenn true, dann wird der Layer initial im Themenbaum angezeigt.|false|

**Beispiel**

```json
{
    "elements": [
        {
            "id": "2",
            "name": "Beispiel Layer",
            "typ": "WMS",
            "visibility": false,
            "styleId": "3"
        }
    ]
}
```

**Beispiel mit einem Array von Ids**

```json
{
"elements": [
        {
            "id": ["123", "456", "789"],
            "name": "Mein Testlayer"
        }
    ]
}
```
**Beispiel layerId 8712 mit Suffix**

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

Vorschau für baselayer im Themenbaum, wird auch im **[baselayerSwitcher](#portalconfigmapbaselayerswitcher)** verwendet.
Für die Layertypen **[VectorTile](#layerconfigelementslayersvectortile)**, **[WMS](#layerconfigelementslayersrasterwms)** und WMTS.
Beim VectorTile-Layer wird ein abgelegtes Vorschaubild angezeigt, bei WMS- und WMTS-Layern wird ein Kartenausschnitt geladen. WMS und WMTS: bei keiner Angabe, wird ein zentrierter Kartenausschnitt geladen. Eine detaillierte Beschreibung ist in der Dokumentation **[LayerPreview](../../Dev/vueComponents/LayerPreview.md)**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|center|nein|Number[]/String[]||Center-Koordinaten für die Ladeparameter des Vorschaubildes. Default ist das Zentrum der Ausdehnung der Karte.|false|
|checkable|nein|Boolean|false|Wenn `true`, dann ist das Vorschaubild als Checkbox benutzbar.|false|
|customClass|nein|String||Benutzerdefinierte css-Klasse zum Überschreiben des Stils, HINWEIS: eventuell muss '!important' verwendet werden.|false|
|radius|nein|Number|1000|Radius des extents in Metern.|false|
|src|nein|String||Nur bei typ `VectorTile`. Pfad zum Bild, das als Vorschau angezeigt werden soll.|false|
|zoomLevel|nein|Number||Zoomlevel aus dem die resolution für die Ladeparameter des Vorschaubildes bestimmt werden. Default ist der initiale zoomLevel der Karte.|false|

**Beispiel VectorTile**

```json
"preview":{
    "src": "./resources/vectorTile.png"
    }
```

**Beispiel WMS**

```json
 "preview": {
    "zoomLevel": 6,
    "center": "566245.97,5938894.79",
    "radius": 500
    }
```

***
#### layerConfig.elements.layers.Group {data-toc-label='Group'}

[inherits]: # (layerConfig.elements.layers)

Es wird ein Gruppenlayer erzeugt, der alle Layer der angegeben ids enthält.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|ja|String[]||Ids der zu gruppierenden Layer, diese müssen in der **[services.json](../Global-Config/services.json.md)** enthalten sein. Sie können unterschiedliche Typen haben.|false|
|typ|ja|String|"GROUP"|Setzt den Layertypen auf GROUP, welcher Layer gruppieren kann.|false|
|styleId|nein|String||Id die den Style definiert. Id wird in der **[style.json](../Global-Config/style.json.md)** aufgelöst. Wenn gefüllt, dann erhalten alle gruppierten Layer diesen style.|false|


**Beispiel**
```json
 {
    "id": [ "20501", "20502", "20503", "20504" ],
    "typ": "GROUP",
    "name": "Gruppe Freizeitrouten und Radfernwege",
    "styleId": "4515"
}
```

***

#### layerConfig.elements.layers.Raster {data-toc-label='Raster'}

[inherits]: # (layerConfig.elements.layers)

Hier werden Raster-Layer typische Attribute aufgelistet. Raster Layer sind vom Typ **[StaticImage](#layerconfigelementslayersrasterstaticimage)**, **[WMS](#layerconfigelementslayersrasterwms)**, WMSTime und WMTS.

***

##### layerConfig.elements.layers.Raster.StaticImage {data-toc-label='Static Image'}

[inherits]: # (layerConfig.elements.layers.Raster)

Mit StaticImage lassen sich Bilder als Layer laden und georeferenziert auf der Karte darstellen. Es werden die Formate jpeg und png unterstützt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|extent|ja|**[Extent](#datatypesextent)**|[560.00, 5950.00, 560.00, 5945.00]|Gibt die Georeferenzierung des Bildes an. Als Koordinatenpaar werden im EPSG:25832 Format die Koordinate für die Bildecke oben links und unten rechts erwartet.|false|
|id|ja|String||Es muss eine eindeutige ID unter allen Layern vergeben werden.|false|
|typ|ja|String|"StaticImage"|Setzt den Layertypen auf StaticImage, welcher statische Bilder als Layer darstellen kann.|false|
|url|ja|String|"https://meinedomain.de/bild.png"|Link zu dem anzuzeigenden Bild.|false|


**Beispiel**
```json
{
    "id": "4811",
    "typ": "StaticImage",
    "url": "https://www.w3.org/Graphics/PNG/alphatest.png",
    "name": "Testing PNG File",
    "visibility": true,
    "extent": [560296.72, 5932154.22, 562496.72, 5933454.22]
}
```

***

##### layerConfig.elements.layers.Raster.WMS {data-toc-label='WMS'}

[inherits]: # (layerConfig.elements.layers.Raster)

Hier werden WMS typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|nein|String/String[]||Name des Layers. Falls das Attribute **styles** konfiguriert wird, muss dieses Attribute als Tpy String[] konfiguriert werden.|false|
|extent|nein|**[Extent](#datatypesextent)**|[454591, 5809000, 700000, 6075769]|Ausdehnung des Layers. Wenn nicht angegeben, wird er Extent der MapView verwendet.|false|
|featureCount|nein|Number|1|Anzahl der Features, die bei einer GetFeatureInfo-Abfrage zurückgegeben werden sollen.|false|
|gfiAsNewWindow|nein|**[gfiAsNewWindow](#layerconfigelementslayersrasterwmsgfiasnewwindow)**|null|Wird nur berücksichtigt wenn infoFormat text/html ist.|true|
|styles|nein|String[]||Werden styles angegeben, so werden diese mit an den WMS geschickt. Der Server interpretiert diese Styles und liefert die Daten entsprechend zurück.|true|

**Beispiel**

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

Der Parameter *gfiAsNewWindow* wird nur berücksichtigt wenn infoFormat text/html ist.

Mit dem Parameter *gfiAsNewWindow* lassen sich html-Inhalte Ihres WMS-Service einfach in einem eigenen Fenster oder Browser-Tab öffnen, anstatt in einem iFrame im GFI. Um html-Inhalte in einem einfachen Standard-Fenster des Browsers zu öffnen, geben Sie für *gfiAsNewWindow* anstatt *null* ein leeres Objekt an.

Sie können nun das Verhalten des Öffnens durch den Parameter *name* beeinflussen:

**Hinweis zur SSL-Verschlüsselung**

Ist *gfiAsNewWindow* nicht bereits eingestellt, wird *gfiAsNewWindow* automatisch gesetzt (mit Standard-Einstellungen), wenn die aufzurufende Url nicht SSL-verschlüsselt ist (https).

Nicht SSL-verschlüsselter Inhalt kann im Masterportal aufgrund der *no mixed content*-policy moderner Browser nicht in einem iFrame dargestellt werden. Bitte beachten Sie, dass automatische Weiterleitungen (z.B. per Javascript) im iFrame auf eine unsichere http-Verbindung (kein SSL) nicht automatisch erkannt und vom Browser ggf. unterbunden werden.

Stellen Sie in einem solchen Fall *gfiAsNewWindow* wie oben beschrieben manuell ein.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|enum["_blank_","_self_"]|"_blank"|Bei `"_blank"` öffnet sich ein neues Browser-Fenster oder ein neuer Browser-Tab (browserabhängig) mit dem html-Inhalt. Die Erscheinung des Fensters lässt sich mithilfe des Parameters *specs* beeinflussen. Bei `"_self"` öffnet sich der html-Inhalt im aktuellen Browser-Fenster.  |true|
|specs|nein|String||Beliebig viele der folgenden Einstellungen lassen sich durch durch Komma-Separation (z.B. {"specs": "width=800,height=700"}) kombinieren. Weitere Einstellungsmöglichkeiten entnehmen Sie bitte den einschlägigen Informationen zum Thema "javascript + window.open": [https://www.w3schools.com/jsref/met_win_open.asp](https://www.w3schools.com/jsref/met_win_open.asp) (deutsch), [https://javascript.info/popup-windows](https://javascript.info/popup-windows) (englisch), [https://developer.mozilla.org/en-US/docs/Web/API/Window/open](https://developer.mozilla.org/en-US/docs/Web/API/Window/open) (englisch)|true|

**Beispiel:**

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

Hier werden Vector typische Attribute aufgelistet. Vector Layer sind vom Typ **[WFS](#layerconfigelementslayersvectorwfs)**, GeoJSON (nur in EPSG:4326), **[SensorLayer](../../Dev/sensorThings.md)** und OAF.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|additionalInfoField|nein|String|"name"|Attributname des Features für die Hitlist in der Searchbar. Ist das Attribut nicht vorhanden, wird der Layername angegeben.|false|
|clusterDistance|nein|Integer||Pixelradius. Innerhalb dieses Radius werden alle Features zu einem Feature "geclustered". ⚠️ clusterDistance bei WFS-Layern mit Polygon- oder Linien-Geometry führt dazu, dass die Features nicht angezeigt werden.|false|
|hitTolerance|nein|String||Clicktoleranz bei der ein Treffer für die GetFeatureInfo-Abfrage ausgelöst wird.|false|
|loadingStrategy|nein|String|"bbox"|Ladestrategie zum Laden der Features. Mögliche Werte sind "bbox" oder "all". **[siehe dazu](https://openlayers.org/en/latest/apidoc/module-ol_loadingstrategy.html)**.|false|
|mouseHoverField|nein|String/String[]||Attributname oder Array von Attributnamen, die angezeigt werden sollen, sobald der User mit der Maus über ein Feature hovert.|false|
|nearbyTitle|nein|String/String[]||Attributname oder Array von Attributnamen die bei der Umkreissuche in der Ergebnisliste als Titel angezeigt werden sollen.|false|
|searchField|nein|String||Attributname nach dem die Searchbar diesen Layer durchsucht.|false|
|styleGeometryType|nein|String/String[]||Geometrietypen für einen WFS-Style, falls nur bestimmte Geometrien eines Layers angezeigt werden sollen **[siehe dazu](../Global-Config/style.json.md#display-rules)**.|false|
|styleId|ja|String||Id die den Style definiert. Id wird in der **[style.json](../Global-Config/style.json.md)** aufgelöst.|false|
|isNeverVisibleInTree|no|Boolean||Parameter zum Ausblenden des Layers im Themenbaum. Wenn true, ist der Layer nicht sichtbar.|false|

**Beispiel**

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

Attribute für die WFS Suche bei highlightFeaturesByAttribute. Für die Aufrufparameter siehe **[urlParameter](../Misc/urlParameter.md)**.
```
Beispiel-Aufrufe:
?api/highlightFeaturesByAttribute=1&wfsId=1&attributeName=DK5&attributeValue=valueToSearchFor&attributeQuery=isequal
?api/highlightFeaturesByAttribute=123&wfsId=1711&attributeName=name&attributeValue=Helios%20ENDO-Klinik%20Hamburg&attributeQuery=IsLike
?api/highlightFeaturesByAttribute=123&wfsId=2003&attributeName=gebietsname&attributeValue=NSG%20Zollenspieker&attributeQuery=isequal
?api/highlightFeaturesByAttribute=123&wfsId=2928&attributeName=biotop_nr&attributeValue=279&attributeQuery=isLike
```

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|escapeChar|ja|String||Das Zeichen für den escapeChar WFS parameter - z.Bsp. \||true|
|featurePrefix|ja|String||Suchprefix für den typename bei der WFS Suche - z.Bsp. app:.|true|
|singleChar|ja|String||Das Zeichen für den singleChar WFS parameter - z.Bsp. #|true|
|valueDelimiter|nein|String|";"|Das Trennzeichen für die Werte in attributeValue bei der isIn Suche.|true|
|wildCard|ja|String||Das zu verwendende Zeichen für das Jokerzeichen - z.Bsp. %|true|

**Beispiel**

```json
{
    "id": "1",
    "visibility": false,
    "name": "Tierarten invasiv",
    "featurePrefix": "app:",
    "wildCard": "%",
    "singleChar": "#",
    "escapeChar": "!"
}
```

***

#### layerConfig.elements.layers.VectorTile {data-toc-label='VectorTile'}

[inherits]: # (layerConfig.elements.layers)

Hier werden VectorTile typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|useMpFonts|nein|Boolean|true|Schalter um die Schriftarten/Fontstacks aus externen Style-Definitionen durch die Standard-Schriftart des Masterportals zu ersetzen, um sicherzustellen dass alle Labels dargestellt werden können. Wenn auf false gesetzt, müssen die benötigten fonts ggf. separat z.B. via '<link rel=stylesheet ...>' in index.html eingebunden werden.|false|
|vtStyles|nein|**[vtStyle](#layerconfigelementslayersvectortilevtstyle)**[]||Auswählbare externe Style-Definition.|false|

**Beispiel**

```json
{
  "id": "123",
  "name": "Ein Vektortilelayername",
  "epsg": "EPSG:3857",
  "url": "https://example.com/3857/tile/{z}/{y}/{x}.pbf",
  "typ": "VectorTile",
  "vtStyles": [
    {
      "id": "STYLE_1",
      "name": "Tagesansicht",
      "url": "https://example.com/3857/resources/styles/day.json",
      "defaultStyle": true
    },
    {
      "id": "STYLE_2",
      "name": "Nachtansicht",
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

Style-Definition; nur für Vector Tile Layer.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|defaultStyle|nein|String||Falls hier `true` gesetzt ist, wird der Style initial ausgewählt, unabhängig von seinem Index; wenn das Feld nirgends auf `true` gesetzt ist, wird der erste Style benutzt|false|
|id|ja|String||serviceübergreifend eindeutige ID|false|
|name|ja|String||Anzeigename, z.B. für das Auswahltool|false|
|resolutions|nein|Number[]||Auflösungen für die im Styling definierten Zoom Level. Wenn nicht angegeben werden die default Resolutions aus dem ol-mapbox-style Projekt benutzt|false|
|url|ja|String||URL, von der der Style bezogen werden kann. Die verlinkte JSON muss zur [Mapbox Style Specification](https://docs.mapbox.com/mapbox-gl-js/style-spec/) passen.|false|

**Beispiel**

```json
{
    "id": "Style_1",
    "name": "Rote Linien",
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

Hier werden Tileset typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|hiddenFeatures|nein|String[]|[]|Liste mit IDs, die in der Ebene versteckt werden sollen|true|
|**[cesium3DTilesetOption](https://cesiumjs.org/Cesium/Build/Documentation/Cesium3DTileset.html)**|nein|**[cesium3DTilesetOption](#layerconfigelementslayerstilesetcesium3dtilesetoption)**||Cesium 3D Tileset Options, werden direkt an das Cesium Tileset Objekt durchgereicht. maximumScreenSpaceError ist z.B. für die Sichtweite relevant.|true|

**Beispiel**

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

##### layerConfig.elements.layers.Tileset.cesium3DTilesetOption {data-toc-label='3D Tileset Option'}

[inherits]: # (layerConfig.elements.layers.Tileset)

Cesium 3D Tileset, die direkt an das *Cesium tileset object* weitergeleitet werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|maximumScreenSpaceError|nein|Number||Der maximale Bildschirmplatzfehler, der für die Verfeinerung des Detailgrads verwendet wird. Dieser Wert trägt dazu bei, zu bestimmen, wann eine Kachel zu ihren Nachfolgern verfeinert wird, und spielt daher eine wichtige Rolle bei der Abwägung zwischen Leistung und visueller Qualität.|true|

**Beispiel**

```json
"cesium3DTilesetOptions" : {
    "maximumScreenSpaceError" : 6
}
```

***

#### layerConfig.elements.layers.Terrain {data-toc-label='Terrain'}

[inherits]: # (layerConfig.elements.layers)

Hier werden Terrain typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|**[cesiumTerrainProviderOption](https://cesiumjs.org/Cesium/Build/Documentation/CesiumTerrainProvider.html)**|nein|**[cesiumTerrainProviderOption](#layerconfigelementslayersterraincesiumterrainprovideroption)**[]||Cesium TerrainProvider Options, werden direkt an den Cesium TerrainProvider durchgereicht. requestVertexNormals ist z.B. für das Shading auf der Oberfläche relevant.|true|

**Beispiel**

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

##### layerConfig.elements.layers.Terrain.cesiumTerrainProviderOption {data-toc-label='Terrain Provider Option'}

[inherits]: # (layerConfig.elements.layers.Terrain)

Initialisierungsoptionen für den CesiumTerrainProvider-Konstruktor.
[cesiumTerrainProviderOptions]: https://cesium.com/learn/cesiumjs/ref-doc/CesiumTerrainProvider.html

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|requestVertexNormals|nein|Boolean||Kennzeichen, das angibt, ob der Client zusätzliche Beleuchtungsinformationen vom Server anfordern soll, und zwar in Form von Normalen pro Scheitelpunkt, falls verfügbar.|true|

**Beispiel**

```json
"cesiumTerrainProviderOptions": {
    "requestVertexNormals" : true
}
```

***

#### layerConfig.elements.layers.Entity3D {data-toc-label='Entity3D'}

[inherits]: # (layerConfig.elements.layers)
[type:Attribute]: # (layerConfig.elements.layers.Entity3D.entities)

Hier werden Entities3D typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|entities|ja|**[Attribute](#layerconfigelementslayersentity3dentities)**[]||Liste von darzustellenden Einheiten des Layers.|false|

##### layerConfig.elements.layers.Entity3D.entities {data-toc-label='Entities'}


[inherits]: # (layerConfig.elements.layers.Entity3D)
[type:Attribute]: # (layerConfig.elements.layers.Entity3D.entities)

Hier werden Entities3D Einheiten typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|allowPicking|nein|Boolean|true|Ob das Modell angeklickt werden darf (GFI). Beispiel: `true`|false|
|attributes|nein|**[Attribute](#layerconfigelementslayersentity3dentitiesattribute)**||Attribute für das Modell. Beispiel: `{"name": "test"}`|false|
|latitude|ja|Number||Breitengrad des Modell-Origins in Grad. Beispiel: `53.541831`|false|
|longitude|ja|Number||Längengrad des Modell-Origins in Grad. Beispiel: `9.917963`|false|
|height|nein|Number|0|Höhe des Modell-Origins. Beispiel: `10`|false|
|heading|nein|Number|0|Rotation des Modells in Grad. Beispiel: `0`|false|
|pitch|nein|Number|0|Neigung des Modells in Grad. Beispiel: `0`|false|
|roll|nein|Number|0|Roll des Modells in Grad. Beispiel: `0`|false|
|scale|nein|Number|1|Skalierung des Modells. Beispiel: `1`|false|
|show|nein|Boolean|true|Ob das Modell angezeigt werden soll (sollte true sein). Beispiel: `true`|false|
|url|ja|String|""|URL zu dem Modell. Beispiel: `"https://daten-hamburg.de/gdi3d/datasource-data/Simple_Building.glb"`|false|


**Beispiel**

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


|Name|Verpflichtend|Typ|default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|nein|String|""|Feld, das im GFI angezeigt werden kann.|false|

**Beispiel**

```json
{
   "name": "Fernsehturm.kmz"
}
```
***

## Datatypes

Die folgenden Datentypen können in der Config verwendet werden.

### Datatypes.Coordinate {data-toc-label='Coordinate'}
Eine Koordinate besteht aus einem Array bestehend aus zwei Zahlen. Die erste repräsentiert den Rechtswert, die zweite den Hochwert.

**Beispiel Koordinate bestehend aus Ganzzahlen(Integer)**

```json
[561210, 5932600]
```

**Beispiel Koordinate bestehend aus Gleitkommazahlen(Float)**

```json
[561210.1458, 5932600.12358]
```

***

### Datatypes.Extent {data-toc-label='Extent'}

Ein Extent besteht aus einem Array bestehend aus vier Zahlen. Ein Extent beschreibt einen rechteckigen Gültigkeitsbereich. Dabei wird ein Rechteck aufgespannt, das durch die "linke untere" und die "rechte obere" Ecke definiert wird. Das Schema lautet [Hochwert-Links-Unten, Rechtswert-Links-Unten, Hochwert-Rechts-Oben, Rechtswert-Rechts-Oben] oder [minx, miny, maxx, maxy].

**Beispiel Extent**
```json
[510000.0, 5850000.0, 625000.4, 6000000.0]
```

***

### Datatypes.Payload {data-toc-label='Payload'}
Das Payload für ein CustomMenuElement Module. Hier wird im Module `execute` vom `payload` aufgerufen. Der passende payload zu der Aktion muss angegeben werden. Hier das Beispiel des `Alerting/addSingleAlert`.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|content|ja|String||Inhalt der Meldung.|true|
|title|nein|String||Titel der Meldung.|true|

**Beispiel**

```json
{
    "title":"An alle Menschen",
    "content": "Hallo Welt"
}
```

***

### Datatypes.Fill {data-toc-label='Fill'}

Die Füllfarbe für ein Element. Es besteht aus einem Objekt mit einem Array in dem der RGBA Farbcode angegeben ist.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|color|nein|Float[]||Mögliche Einstellung: color (RGBA)|false|

```json
"fill": {
     "color": [215, 102, 41, 0.9]
     }
```

***

### Datatypes.Stroke {data-toc-label='Stroke'}

Die Umrandung eines Elements. Es besteht aus einem Objekt mit einem Array in dem der RGBA Farbcode angegeben ist und einer Strichbreite als Zahl.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|width|nein|Integer||Mögliche Einstellung: width|false|
|color|nein|Float[]|[255, 255, 255, 0.5]|Mögliche Einstellung: color (RGBA)|false|

```json
"stroke": {
    "width": 4,
    "color": [255, 0, 255, 0.9]
    }
```

***

### Datatypes.Image {data-toc-label='Image'}

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|scale|nein|Integer||Mögliche Einstellung: scale|false|

```json
"image": {
    "scale": 2
    }
```

***

### Datatypes.Snippets {data-toc-label='Snippets'}

[type:Children]: # (Datatypes.Snippets.Children)
[type:LocaleCompareParams]: # (Datatypes.Snippets.LocaleCompareParams)
[type:Service]: # (Datatypes.Snippets.Service)
[type:Timeouts]: # (Datatypes.Snippets.Timeouts)
[type:UniversalSearch]: # (Datatypes.Snippets.UniversalSearch)
[type:BeautifiedAttrName]: # (Datatypes.Snippets.BeautifiedAttrName)
[type:ChartConfig]: # (Datatypes.Snippets.ChartConfig)

Ein Objekt im Filter das ein einzelnes Snippet beschreibt.

Hinweis: Zeitbezogene Snippets (`date` und `dateRange`) können nur dann im Modus `extern` oder als fixe Regel (`visible`: `false`) betrieben werden, wenn ihr Gegenstück am WFS-Service in einem korrekten Zeit-Format vorliegt (ISO8601: `YYYY-MM-DD`).

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|addSelectAll|nein|Boolean|false|Nur für Snippet-Typ `dropdown` mit `multiselect: true`: Ein zusätzlicher Eintrag zum Selektieren/Deselektieren aller Werte wird angeboten.|false|
|attrName|ja|String||Der Name des Attributes auf dem dieses Snippet filtern soll. Kann ein Array sein, wenn `dateRange`, `sliderRange` oder `featureInfo` verwendet wird (siehe Beispiele).|false|
|autoInit|nein|Boolean|true|Nur für Snippet-Typ `dropdown`: Schaltet, wenn auf `false` gestellt, die automatischen Ermittlungen von Inhalts-, Min- und Max-Werten ab.|false|
|children|nein|**[Children](#datatypessnippetschildren)**[]|[]|Konfiguration von Kind-Snippets.|true|
|decimalPlaces|nein|Number|0|Definiert Nachkommastellen für den Schritt bei `slider` und `sliderRange`|false|
|delimiter|nein|String||Nur für Snippet-Typ `dropdown`: Sollte das Attribut eines Features ein String sein, dessen Wert mit einem Separator als Quasi-Array gedacht ist, kann durch Angabe des separierenden Zeichens (des Delimiters) die Verarbeitung des Strings als Array erzwungen werden.|false|
|display|nein|String|"default"|Wenn Snippet-Typ `dropdown`: Wenn auf `list` eingestellt, wird anstelle einer Dropdown-Box eine Liste angezeigt. Wenn Snippet-Typ `dateRange`: Wenn auf `datepicker` eingestellt, wird nur die Auswahl über Kalender angezeigt, wenn auf `slider` eingestellt, wird nur der Slider angezeigt, wenn auf `all` eingestellt, werden Datepicker und Slider angezeigt.|false|
|format|nein|String|"YYYY-MM-DD"|Nur für Snippet-Typ `date` und `dateRange`: Das verwendete Format des Datums in der Datenbank. Wenn nicht angegeben wird ISO8601 angenommen. Weicht das Format von ISO8601 ab, muss das Snippet sichtbar sein (`visible`: `true`) und der Filter muss im Modus `extern`: `false` arbeiten. Kann als Array von zwei unterschiedlichen Formaten angegeben werden, wenn als attrName ebenfalls ein Array unterschiedlicher Attributnamen angegeben wird und sich die Datums-Formate der Attributwerte unterscheiden.|false|
|hideSelected|nein|Boolean|true|Standardmäßig ist beim Dropdown der ausgewählte Eintrag beim nächsten Ausklappen weg. Kann auf false gesetzt werden, um den vorher ausgewählten Eintrag sichtbar und farblich abgesetzt anzuzeigen.|false|
|info|nein|String||Info-Text zu diesem Snippet oder ein Übersetzungs-Key. Wenn eingestellt, dann wird rechts vom Snippet ein Info-Symbol angezeigt, das bei Klick den Text darstellt. Kann auch einfach auf `true` gestellt werden, wenn ein Standard-Text ausreichend ist.|false|
|localeCompareParams|nein|**[LocaleCompareParams](#datatypessnippetslocalecompareparams)**||Nur für Snippet-Typ `dropdown`: Die Sortierung der Dropdown-Boxen kann über diesen Parameter nach eigenen Wünschen angepasst werden.|false|
|maxValue|nein|Number||Nur für Snippet-Typ `date` und `slider`: Der Maximal-Wert als number oder Datums-String. Weglassen um die automatische Ermittlung der Werte zu aktivieren.|false|
|minValue|nein|Number||Nur für Snippet-Typ `date` und `slider`: Der Minimal-Wert als number oder Datums-String. Weglassen um die automatische Ermittlung der Werte zu aktivieren.|false|
|multiselect|nein|Boolean|true|Nur für Snippet-Typ `dropdown`: Gleichzeitige Auswahl vieler Werte. Auf `false` stellen um auf Einzelauswahl umzustellen.|false|
|operator|nein|String||Der logische Operator wie der eingestellte Wert mit dem Wert in der Datenbank verglichen wird. Abhängig davon ob es Sinn macht können dies folgende Werte sein: `INTERSECTS`, `BETWEEN`, `EQ`, `IN`, `STARTSWITH`, `ENDSWITH`, `NE`, `GT`, `GE`, `LT`, `LE`. Wenn weggelassen, gilt der Default: boolean wird zu `EQ`, string wird zu `EQ`, number wird zu `BETWEEN`, unbekannt wird zu `EQ`.|false|
|operatorForAttrName|nein|String|"AND"|Durch das setzen dieses Parameters auf `OR` in Verbindung mit einem Array als attrName, wird es ermöglicht über diverse attrNames mit einem logischem OR zu filtern.|false|
|optionsLimit|nein|Number|20000|Nur für Snippet-Typ `dropdown`: Einer Parameter für Anzahl der Optionen in der Dropdown-List.|false|
|placeholder|nein|String|""|Nur für Snippet-Typ `dropdown`: Der Platzhalter bei Nicht-Einstellung der Dropdown. Kann ein Übersetzungs-Key sein.|false|
|prechecked|nein|String[]/String||Initial aktiv eingestellte Werte. Für `dropdown`, `sliderRange` und `dateRange` ist dies ein Array, für checkbox ein boolean, für slider eine number, für text ein string und für date ein string der über das `format` spezifiziert werden muss. Für `dropdown` mit `multiselect`: Wird `prechecked` auf `all` eingestellt, werden initial alle verfügbaren Werte ausgewählt.|false|
|renderIcons|nein|String|"none"|Nur für Snippet-Typ `dropdown` mit `display: "list"`: Wenn auf den String `fromLegend` eingestellt, werden Icons aus der Legende bezogen und links neben den Werten angezeigt. Wird hier ein Objekt angegeben, werden die Key-Namen als Wert und der Value als Bild-Pfad verwendet: {attrName: imagePath} (siehe Beispiele).|false|
|subtitle|nein|String[]/String[][]||Nur für Snippet-Typ `chart`. Erlaubt die Anzeige einer beliebigen Kombination aus Text und Daten als Untertitel zum Diagramm.|false|
|tooltipUnit|nein|String||Nur für Snippet-Typ `chart`. Fügt an den Zahlenwert im Tooltip ein Einheitenzeichen an.|false|
|service|nein|**[Service](#datatypessnippetsservice)**||Für das initiale Befüllen eines Snippets (`dropdown`, `date`, `slider`) kann ein alternativer Service genutzt werden. Das kann unter Umständen die Performanz beim initialen Laden erhöhen. Standard ist der Service des konfigurierten **[filterLayer](#portalconfigmenusectionsmodulesfilterfilterlayer)**.|false|
|showAllValues|nein|Boolean||Nur für Snippet-Typ `dropdown`: Verhindert wenn auf `true` gestellt das Verstecken der nicht ausgewählten Werte. Kann nur in Verbindung mit `prechecked: "all"` genutzt werden.|false|
|subTitles|nein|String[]|[]|Nur für Snippet-Typ `dateRange`: Die zusätzlich über den Kalender-Feldern anzuzeigenden Von- und Bis-Bezeichnungen. Als Array mit zwei Elementen (z.B. ["von", "bis"]). Stellen Sie subTitles auf `true` um die Werte von `attrName` zu verwenden, auf false um Bezeichnungen nicht anzuzeigen.|false|
|timeouts|nein|**[Timeouts](#datatypessnippetstimeouts)**||Konfigurierbare Timeouts zur besseren User Experience.|false|
|title|nein|String||Der Titel des Snippets. Kann ein Übersetzungs-Key sein. Wenn nicht eingestellt, wird der Titel aus den `gfiAttributes` genommen und wenn diese nicht vorhanden sind, dann wird der `attrName` verwendet. Kann auf `false` gesetzt werden um die Anzeige eines Titels zu unterbinden. Kann auf `true` gesetzt werden um die Anzeige des `attrName` zu erzwingen.|false|
|type|nein|String||Der Snippet-Typ: `checkbox`, `dropdown`, `text`, `slider`, `sliderRange`, `date`, `dateRange`, `featureInfo`, `chart`. Wird automatisch ermittelt, wenn nicht angegeben - dabei wird der Datentyp als Grundlage genommen: boolean wird zu `checkbox`, string wird zu `dropdown`, number wird zu `sliderRange`, unbekannt wird zu `text`.|false|
|value|nein|String[]||Wenn weggelassen, werden Werte automatisch ermittelt. Wenn für `dropdown` eingestellt: Die Werte, die in der Liste auswählbar sein sollen. Wenn für `checkbox` eingestellt: Statt Boolean-Werten sollen die angegebenen Werte für die Zustände `true` und `false` genommen werden (z.B. ["Ja", "Nein"]). Für `dateRange`: Anfangs- und End-Datum für Datepicker und/oder Slider. Für `sliderRange`: Anfangs- und End-Werte.|false|
|visible|nein|Boolean|true|Das Snippet wird angezeigt. Auf `false` stellen um das Snippet zu verbergen: Dadurch können mithilfe von `prechecked` Werte im versteckten Snippet fest eingestellt werden, die dann bei jeder Filterung gelten.|false|
|universalSearch|nein|**[UniversalSearch](#datatypessnippetsuniversalsearch)**||Nur für Snippet-Typ `featureInfo`: Der gefilterte Wert kann im Web gesucht werden.|false|
|beautifiedAttrName|nein|**[BeautifiedAttrName](#datatypessnippetsbeautifiedattrname)**||Nur für Snippet-Typ `featureInfo`: Zum Überschreiben der Attributnamen, die im Steckbrief angezeigt werden.|false|
|adjustOnlyFromParent|nein|Boolean|false|Nur für Snippet-Typ `dropdown`: Wenn true, wird es nur vom Parent-Snippet nachjustiert.|false|
|allowEmptySelection|nein|Boolean|true|Nur für Snippet-Typ `dropdown`: Wird `true` gesetzt, können alle ausgewählten Werte im Dropdown wieder abgewählt werden. Auf `false` setzen, wenn immer ein Wert ausgewählt bleiben soll.|false|
|chartConfig|ja|**[chartConfig](#datatypessnippetschartconfig)**||Nur für Snippet-Typ `chart` im Zusammenspiel mit 'service' (siehe Beispiel): Die Konfiguraiton für das Diagramm. Es werden alle Konfigurationsmöglichkeiten (bisher nur "type: bar") von Chart.js unterstützt (siehe: https://www.chartjs.org/docs/latest/configuration/). Zusätzlich ist die Angabe des Parameters 'featureAttributes' erforderlich. Der Parameter gibt an, hinter welchen Attributen sich die anzuzeigenden Daten befinden (siehe Beispiel).|false|
|alternativeTextForEmptyChart|nein|String||Alternativtext, der bei Snippet-Typ `chart` anstelle des Diagramms angezeigt wird, sofern es keine Werte enthält.|false|
|infoText|nein|String|false|Nur für Snippet-Typ `chart`: Info-Text zu diesem Snippet. |false|

**Beispiel**

Beispiel für ein Text-Snippet. Eine Input-Box mit Platzhalter zur freien Filterung von einem Attribut.

```json
{
    "title": "Description of school",
    "attrName": "school_description",
    "type": "text",
    "operator": "IN",
    "placeholder": "Search in description"
}
```

**Beispiel**

Beispiel für ein Checkbox-Snippet. Eine Checkbox die - wenn gesetzt - nach "Oui" als true-Wert filtert. Die Checkbox ist per Default angehakt.

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

**Beispiel**

Beispiel für ein Dropdown-Snippet. Eine einfache Dropdown-Box die keine Mehrfachauswahl zulässt und einen Platzhalter hat.

```json
{
    "title": "District",
    "attrName": "city_district",
    "type": "dropdown",
    "multiselect": false,
    "placeholder": "Choose a district"
}
```

**Beispiel**

Beispiel für ein Dropdown-Snippet. Eine als Liste dargestellte Auswahl (nicht als Dropdown-Box) mit Mehrfachauswahl und Alle-Auswählen Option. Zusätzlich mit Icons, Info, festen Werten und voreingestellten Werten.

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

**Beispiel**

Beispiel für ein Dropdown-Snippet bei dem alle verfügbaren Werte initial ausgewählt sind.

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

**Beispiel**

Beispiel für ein Slider-Snippet. Ein Slider für einen Einzelwert und Kleinergleich-Operator. Mit gesetztem minValue und maxValue, was die automatische Wertermittlung abschaltet.

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

**Beispiel**

Beispiel für ein SliderRange-Snippet. Eine SliderRange die ihre Grenzwerte automatisch ermittelt (wegen fehlendem minValue und maxValue).

```json
{
    "title": "Angle d'inclinaison du toit du garage",
    "attrName": "angle",
    "type": "sliderRange",
    "operator": "BETWEEN",
    "decimalPlaces": 2
}
```

**Beispiel**

Beispiel für ein SliderRange-Snippet. Ein SliderRange mit zwei attrName-Angaben für min und max. Mit gesetztem minValue und maxValue, was die automatische Wertermittlung abschaltet.

```json
{
    "title": "Angle d'inclinaison du toit du garage",
    "attrName": ["angle_minimal", "angle_maximal"],
    "type": "sliderRange",
    "operator": "BETWEEN",
    "value": [0, 90]
}
```

**Beispiel**

Beispiel für ein Date-Snippet. Ein Datepicker zur Auswahl eines Einzeldatums. Mit gesetztem minValue und maxValue, was die automatische Wertermittlung abschaltet.

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

**Beispiel**

Beispiel für ein DateRange-Snippet. Mit zwei Attribut-Namen für Min- und Maxwerte. Bitte das spezielle Datums-Format beachten. Benutzt den INTERSECTS-Operator und die automatische Grenzermittlung.

```json
{
    "title": "Bauzeit der Autobahnen",
    "attrName": ["autobahn_baubeginn", "autobahn_bauende"],
    "type": "dateRange",
    "operator": "INTERSECTS",
    "format": "DD.MM.YY"
}
```

**Beispiel**

Beispiel für ein DateRange-Snippet. Mit abgestelltem Slider (`display`: `datepicker`). Mit zwei Attribut-Namen für Min- und Maxwerte, zwei vom attrName abweichenden `subTitles` und unterschiedlichen Datums-Formaten. Zusätzlich ist ein Zeitraum voreingestellt. Bitte beachten, dass sich das Format der voreingestellten Werte an `format` orientiert.

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

**Beispiel**

Beispiel für ein DateRange-Snippet. Mit über `prechecked` voreingestellten Zeitpunkten und über `value` voreingestellten Min- und Max-Werten.

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

**Beispiel**

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

**Beispiel**

Beispiel für ein SliderRange-Snippet für die SensorThingsAPI (STA).

```json
{
    "type": "sliderRange",
    "title": "Anzahl der Fahrräder",
    "attrName": "@Datastreams.0.Observations.0.result"
}
```

**Beispiel**

Beispiel für ein Snippet welches über mehrere Attribute gleichzeitig filtern und die Features angezeigt bekommen möchte, die dem eingestellten Wert bei einem der angegeben Attributen entspricht.

```json
{
    "attrName": ["xpplanname", "rechtscharakterwert"],
    "operatorForAttrName": "OR",
    "type": "dropdown",
}
```
**Beispiel**

Beispiel für ein Chart Snippet. Fragt die Features aus dem konfigurierten "service" ab und zeigt die Daten der konfigurierten "featureAttributes" in einem Balkendiagramm an.

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
Konfiguration von Kind-Snippets.
Die Kind-Snippets werden nach derselben Art konfiguriert wie "normale" Snippets.
Siehe [Snippets](#datatypessnippets).

Eine Eltern-Kind-Beziehung kann für folgenden Anwendungsfall benutzt werden:
Ist ein Datensatz zu groß, kann das Vorselektieren eines Attributes die Menge der anschließenden Filterung reduzieren.
(Beispiel: Tierartengruppe "Säugetiere" als Vorauswahl würde den Datenraum aller Tiere signifikant verkleinern.)

Mit dem Parameter `children` wird ein Snippet angewiesen, selber keine Filterung auszulösen, sondern nur seine unter `children` konfigurierten Kind-Snippets mit den aus seiner Einstellung resultierenden Daten zu "füttern".
(Beispiel: "Säugetiere" lässt die resultierenden Tierarten auf einen annehmbaren Bereich schrumpfen.)

Erst die Auswahl in einem der Kind-Snippets (Beispiel: "Blauwal") führt die Filterung schließlich aus.
Im Falle der Verwendung von Eltern-Kind-Beziehungen empfehlen wir `snippetTags` auf `false` zu stellen.
Eine mehrdimensionale Verschachtelung (Großeltern, Eltern, Kind) ist derzeit nicht vorgesehen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|addSelectAll|nein|Boolean|false|Nur für Snippet-Typ `dropdown` mit `multiselect: true`: Ein zusätzlicher Eintrag zum Selektieren/Deselektieren aller Werte wird angeboten.|false|
|attrName|ja|String||Der Name des Attributes auf dem dieses Snippet filtern soll. Kann ein Array sein, wenn `dateRange`, `sliderRange` oder `featureInfo` verwendet wird (siehe Beispiele).|false|
|autoInit|nein|Boolean|true|Nur für Snippet-Typ `dropdown`: Schaltet, wenn auf `false` gestellt, die automatischen Ermittlungen von Inhalts-, Min- und Max-Werten ab.|false|
|delimiter|nein|String||Nur für Snippet-Typ `dropdown`: Sollte das Attribut eines Features ein String sein, dessen Wert mit einem Separator als Quasi-Array gedacht ist, kann durch Angabe des separierenden Zeichens (des Delimiters) die Verarbeitung des Strings als Array erzwungen werden.|false|
|display|nein|String|"default"|Wenn Snippet-Typ `dropdown`: Wenn auf `list` eingestellt, wird anstelle einer Dropdown-Box eine Liste angezeigt. Wenn Snippet-Typ `dateRange`: Wenn auf `datepicker` eingestellt, wird nur die Auswahl über Kalender angezeigt, wenn auf `slider` eingestellt, wird nur der Slider angezeigt, wenn auf `all` eingestellt, werden Datepicker und Slider angezeigt.|false|
|hideSelected|nein|Boolean|true|Standardmäßig ist beim Dropdown der ausgewählte Eintrag beim nächsten Ausklappen weg. Kann auf false gesetzt werden, um den vorher ausgewählten Eintrag sichtbar und farblich abgesetzt anzuzeigen.|false|
|info|nein|String||Info-Text zu diesem Snippet oder ein Übersetzungs-Key. Wenn eingestellt, dann wird rechts vom Snippet ein Info-Symbol angezeigt, das bei Klick den Text darstellt. Kann auch einfach auf `true` gestellt werden, wenn ein Standard-Text ausreichend ist.|false|
|localeCompareParams|nein|**[LocaleCompareParams](#datatypessnippetslocalecompareparams)**||Nur für Snippet-Typ `dropdown`: Die Sortierung der Dropdown-Boxen kann über diesen Parameter nach eigenen Wünschen angepasst werden.|false|
|multiselect|nein|Boolean|true|Nur für Snippet-Typ `dropdown`: Gleichzeitige Auswahl vieler Werte. Auf `false` stellen um auf Einzelauswahl umzustellen.|false|
|operator|nein|String||Der logische Operator wie der eingestellte Wert mit dem Wert in der Datenbank verglichen wird. Abhängig davon ob es Sinn macht können dies folgende Werte sein: `INTERSECTS`, `BETWEEN`, `EQ`, `IN`, `STARTSWITH`, `ENDSWITH`, `NE`, `GT`, `GE`, `LT`, `LE`. Wenn weggelassen, gilt der Default: boolean wird zu `EQ`, string wird zu `EQ`, number wird zu `BETWEEN`, unbekannt wird zu `EQ`.|false|
|operatorForAttrName|nein|String|"AND"|Durch das setzen dieses Parameters auf `OR` in Verbindung mit einem Array als attrName, wird es ermöglicht über diverse attrNames mit einem logischem OR zu filtern.|false|
|optionsLimit|nein|Number|20000|Nur für Snippet-Typ `dropdown`: Einer Parameter für Anzahl der Optionen in der Dropdown-List.|false|
|placeholder|nein|String|""|Nur für Snippet-Typ `dropdown`: Der Platzhalter bei Nicht-Einstellung der Dropdown. Kann ein Übersetzungs-Key sein.|false|
|prechecked|nein|String[]/String||Initial aktiv eingestellte Werte. Für `dropdown`, `sliderRange` und `dateRange` ist dies ein Array, für checkbox ein boolean, für slider eine number, für text ein string und für date ein string der über das `format` spezifiziert werden muss. Für `dropdown` mit `multiselect`: Wird `prechecked` auf `all` eingestellt, werden initial alle verfügbaren Werte ausgewählt.|false|
|renderIcons|nein|String|"none"|Nur für Snippet-Typ `dropdown` mit `display: "list"`: Wenn auf den String `fromLegend` eingestellt, werden Icons aus der Legende bezogen und links neben den Werten angezeigt. Wird hier ein Objekt angegeben, werden die Key-Namen als Wert und der Value als Bild-Pfad verwendet: {attrName: imagePath} (siehe Beispiele).|false|
|service|nein|**[Service](#datatypessnippetsservice)**||Für das initiale Befüllen eines Snippets (`dropdown`, `date`, `slider`) kann ein alternativer Service genutzt werden. Das kann unter Umständen die Performanz beim initialen Laden erhöhen. Standard ist der Service des konfigurierten **[filterLayer](#portalconfigmenusectionsmodulesfilterfilterlayer)**.|false|
|showAllValues|nein|Boolean||Nur für Snippet-Typ `dropdown`: Verhindert wenn auf `true` gestellt das Verstecken der nicht ausgewählten Werte. Kann nur in Verbindung mit `prechecked: "all"` genutzt werden.|false|
|title|nein|String||Der Titel des Snippets. Kann ein Übersetzungs-Key sein. Wenn nicht eingestellt, wird der Titel aus den `gfiAttributes` genommen und wenn diese nicht vorhanden sind, dann wird der `attrName` verwendet. Kann auf `false` gesetzt werden um die Anzeige eines Titels zu unterbinden. Kann auf `true` gesetzt werden um die Anzeige des `attrName` zu erzwingen.|false|
|value|nein|String[]||Wenn weggelassen, werden Werte automatisch ermittelt. Wenn für `dropdown` eingestellt: Die Werte, die in der Liste auswählbar sein sollen. Wenn für `checkbox` eingestellt: Statt Boolean-Werten sollen die angegebenen Werte für die Zustände `true` und `false` genommen werden (z.B. ["Ja", "Nein"]). Für `dateRange`: Anfangs- und End-Datum für Datepicker und/oder Slider. Für `sliderRange`: Anfangs- und End-Werte.|false|
|visible|nein|Boolean|true|Das Snippet wird angezeigt. Auf `false` stellen um das Snippet zu verbergen: Dadurch können mithilfe von `prechecked` Werte im versteckten Snippet fest eingestellt werden, die dann bei jeder Filterung gelten.|false|
|adjustOnlyFromParent|nein|Boolean|false|Nur für Snippet-Typ `dropdown`: Wenn true, wird es nur vom Parent-Snippet nachjustiert.|false|
|allowEmptySelection|nein|Boolean|true|Nur für Snippet-Typ `dropdown`: Wird `true` gesetzt, können alle ausgewählten Werte im Dropdown wieder abgewählt werden. Auf `false` setzen, wenn immer ein Wert ausgewählt bleiben soll.|false|

**Beispiel**

Beispiel für ein Dropdown-Snippet mit Eltern-Kind-Beziehung. Die `cityA`- und `cityB`-Dropdowns sind zunächst nicht gefüllt. Erst bei Auswahl eines `District` füllen sie sich mit den Städten des gewählten Bezirkes, es findet aber keine Filterung auf der Map statt. Erst die Auswahl einer Stadt initiiert schließlich die Filterung nach dem Stadtnamen.

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
Mit der Anpassung von Timeouts kann die User Experience verbessert werden.
Dies betrifft besonders Filter die mit `strategy`: `active` arbeiten.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|input|nein|Number|1400|Nur für Snippet-Typ `sliderRange` und `slider`: Die Zeit in Millisekunden die vergehen soll, bevor nach Eingabe von Zahlen und Zeichen ins Input-Feld eine Filterung ausgelöst werden soll.|false|
|slider|nein|Number|800|Nur für Snippet-Typ `sliderRange`, `slider` und `dateRange`: Die Zeit in Millisekunden die vergehen soll, bevor nach der letzten Änderung des Sliders eine Filterung ausgelöst werden soll.|false|

**Beispiel**

Ein Beispiel für ein sliderRange-Snippet mit beschleunigter Filterung nach Eingabe ins Input-Feld bzw. Änderung des Sliders.

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

Ein Objekt das einen Service für ein Snippet beschreibt. Alle Servicetypen, die der Filter unterstützt, können theoretisch genutzt werden.
Die Konfiguration hängt vom Typ des Services ab.

**WFS**
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|collection|ja|String||Die Collection die geladen wird. Nur bei OAF.|false|
|type|ja|String||Der Typ des Services (WFS, GeoJSON oder OAF).|false|
|typename|ja|String||Der Featuretype der geladen wird. Nur bei WFS.|false|
|url|ja|String||Die Service Url.|false|

**Beispiel WFS**

```json
{
    "type": "WFS",
    "url": "https://qs-geodienste.hamburg.de/HH_WFS_verbreitungskarten_tiere",
    "typename": "verbreitung_tiere_eindeutige_liste"
}
```

**Beispiel GeoJSON**

```json
{
    "type": "GeoJSON",
    "url": "../chartjs/charts_stadtteil.geojson"
}
```
**Beispiel OAF**

```json
{
    "url": "https://api.hamburg.de/datasets/v1/schulen",
    "collection" : "staatliche_schulen",
    "type": "OAF"
}
```

***
#### Datatypes.Snippets.ChartConfig {data-toc-label='ChartConfig'}

Ein Objekt, das ein Diagramm beschreibt. Für weitere informationen **[hier](https://www.chartjs.org/docs/latest/configuration/)** klicken.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|data|ja|Object||Die Daten. Für weitere Informationen klicken Sie **[hier](https://www.chartjs.org/docs/latest/general/data-structures.html)**|false|
|options|ja|Object||Optionen für die Erstellung des Diagramms.|false|
|plugins|ja|Array||Inline-Plugins können in dieses Array aufgenommen werden. Dies ist ein alternativer Weg, um Plugins für einzelne Diagramme hinzuzufügen (im Gegensatz zur globalen Registrierung des Plugins). Mehr über Plugins in der **[developers section](https://www.chartjs.org/docs/latest/developers/plugins.html)**.|false|
|type|ja|String||Der Diagrammtyp bestimmt den Haupttyp des Diagramms.|false|

**Beispiel**

Die Top-Level-Struktur der Chart.js-Konfiguration:

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

Ein String oder Objekt zur Steuerung der Sortierung von Dropdown-Boxen.

**Beispiel String**

"localeCompareParams": "de"

**Object**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|locale|nein|String||Der zu verwendende Ländercode nach ISO 3166|false|
|options|nein|**[Options](#datatypessnippetslocalecompareparamsoptions)**||Optionen für die Sortierung per localeCompare.|false|

**Beispiel Object**

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
Ein Objekt zur benutzerdefinierten Steuerung der verwendeten localeCompare-Funktion zur Sortierung von Dropdown-Boxen, wie sie u.a. hier dokumentiert sind: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|ignorePunctuation|nein|Boolean|false|Kann auf `true` eingestellt werden um Interpunktion zu ignorieren.|false|
|numeric|nein|Boolean|false|Kann auf `true` gestellt werden, wenn Zahlen numerisch sortiert werden sollen. z.B. true: “2” < “10” bzw. false: “2” > “10”|false|
|sensitivity|nein|String|"variant"|Einstellung zur Berücksichtigung der Zeichen-Basis (z.B. ä → ae, somit wird ä in a einsortiert).|false|

**Beispiel**

```json
{
    "ignorePunctuation": true
}
```

***

#### Datatypes.Snippets.UniversalSearch {data-toc-label='UniversalSearch'}

Ein Objekt zur Suche der Werte im Web

**Object**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|attrName|ja|String||Der Attribute Name|false|
|prefix|ja|String||Die Website als Prefix für die Suche|false|

**Beispiel**

```json
{
    "attrName": "Wissenschaftlicher Name",
    "prefix": "https://www.ecosia.org/search?q="
}
```

***

#### Datatypes.Snippets.BeautifiedAttrName {data-toc-label='BeautifiedAttrName'}

Ein object zur Konfiguration des Attribute-Name

**Object**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|attrName|ja|String||Der Attribute-Name|false|

**Beispiel**

```json
{
    "attrName": "beautified Name"
}
```

***

### Datatypes.Bbox {data-toc-label='Bbox'}
Ein Datentyp des Routings. BBOX-Wert zugeordnet zu einem speedProfile. Koordinatensystem ist abhängig von dem verwendeten epsg-Parameter. Der verwendete geosearch Dienst muss bbox-Werte als String unterstützen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|speedProfile|nein|String||Koordinatenwerte "West,Süd,Ost,Nord"|false|

**Beispiel**

```json
{
    "bbox": {"CYCLING": "9.6,53.40,10.4,53.84"}
}
```

***
### Datatypes.CustomAvoidFeatures {data-toc-label='CustomAvoidFeatures'}
Routing-Werkzeug Routenplanung Routen customAvoidFeatures. Möglichkeit eigene Optionen für Verkehrswege meiden (zusätzlich zum BKG-Dienst) für speedProfiles zu definieren (erfordert eigenes Backend).

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|speedProfile|nein|String[]||Welche Optionen für ´Verkehrswege meiden´ für das angegebene speedProfile verfügbar sein sollen.|false|

**Beispiel**

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
Routing-Werkzeug Routenplanung Routen customPreferences.
Möglichkeit eigene Routenpräferenzen (zusätzlich zum BKG-Dienst) für speedProfiles zu definieren (erfordert eigenes Backend).

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|speedProfile|nein|String[]||Welche Präferenzen für das angegebene speedProfile verfügbar sein sollen.|false|

**Beispiel**

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
Routing-Werkzeug Routenplanung Routen Style Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fillColor|nein|Number[]|[255, 44, 0, 1]|Welche Farbe zum Füllen verwendet werden soll.|false|
|width|nein|Number|6|Wie breit die Route dargestellt werden soll.|false|
|highlightColor|nein|Number[]|[255, 255, 255, 1]|Welche Farbe zum Highlighten verwendet werden soll.|false|
|highlightWidth|nein|Number|9|Wie breit das Highlighting dargestellt werden soll.|false|
|partHighlightColor|nein|Number[]|[255, 255, 255, 1]|Welche Farbe zum highlighten verwendet werden soll, wenn nur ein Teil der Route gehighlightet wird.|false|
|highlightWidth|nein|Number|9|Wie breit das Highlighting dargestellt werden soll, wenn nur ein Teil der Route gehighlightet wird.|false|

**Beispiel**

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
Routing-Werkzeug Routenplanung Wegpunkt Style Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|lineColor|nein|Number[]|[255, 127, 0]|Welche Farbe zum Umranden verwendet werden soll.|false|
|lineWidth|nein|Number|4|Wie breit die Umrandung dargestellt werden soll.|false|
|fillColor|nein|Number[]|[255, 127, 0]|Welche Farbe zum Füllen verwendet werden soll.|false|
|textFillColor|nein|String|"#000"|Welche Farbe für den Text verwendet werden soll.|false|
|textLineColor|nein|String|"#fff"|Welche Farbe für das Highlighten des Textes verwendet werden soll.|false|
|textLineWidth|nein|Number|3|Wie groß der Text dargestellt werden soll.|false|
|opacity|nein|Number|0.3|Wie stark die Füllfarbe dargestellt werden soll.|false|
|radius|nein|Number|8|Wie groß der Wegpunkt dargestellt werden soll.|false|

**Beispiel**

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
Routing-Werkzeug Routenplanung Sperrflächen Style Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|lineColor|nein|Number[]|[0, 127, 255]|Welche Farbe zum Umranden verwendet werden soll.|false|
|lineWidth|nein|Number|2|Wie breit die Umrandung dargestellt werden soll.|false|
|fillColor|nein|Number[]|[0, 127, 255]|Welche Farbe zum Füllen verwendet werden soll.|false|
|opacity|nein|Number|0.3|Wie stark die Füllfarbe dargestellt werden soll.|false|
|pointRadius|nein|Number|8|Wie groß die Eckpunkte dargestellt werden sollen.|false|
|pointLineWidth|nein|Number|4|Wie groß die Umrandung der Eckpunkte dargestellt werden sollen.|false|

**Beispiel**

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
Routing-Werkzeug Routenplanung und Erreichbarkeitsanalysen Stapelverarbeitung Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|enabled|nein|Boolean|false|Ob die Stapelverarbeitung bereitgestellt werden soll.|false|
|active|nein|Boolean|false|Ob die Stapelverarbeitung aktiv sein soll.|false|
|limit|nein|Number|1000|Die maximale Anzahl an Zeilen in einer CSV die verarbeitet werden sollen/dürfen.|false|
|maximumConcurrentRequests|nein|Number|3|Die maximale Anzahl an Aufrufen die an externe Services parallel gemacht werden dürfen. Zu viele schränken die parallele Arbeit mit der Karte ein. Zu Wenige verlangsamt die Stapelverarbeitung. Maximal können in den Browsern 6 Requests gleichzeitig gemacht werden.|false|

**Beispiel**

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
Routing-Werkzeug Erreichbarkeitsanalysen Center Style Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|lineColor|nein|Number[]|[255, 127, 0]|Welche Farbe für die Umrandung verwendet werden soll.|false|
|lineWidth|nein|Number|4|Wie breit die Umrandung des Punktes dargestellt werden soll.|false|
|fillColor|nein|Number[]|[255, 127, 0]|Welche Farbe zum Füllen verwendet werden soll.|false|
|opacity|nein|Number|0.3|Wie stark die Füllfarbe dargestellt werden soll.|false|
|radius|nein|Number|8|Wie groß der Wegpunkt dargestellt werden soll.|false|

**Beispiel**

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
Routing-Werkzeug Erreichbarkeitsanalysen Isochrone Style Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|lineWidth|nein|Number|2|Wie breit die Umrandung der Polygone dargestellt werden soll.|false|
|opacity|nein|Number|0.65|Wie stark die Füllfarbe dargestellt werden soll.|false|
|startColor|nein|Number[]|[66, 245, 78]|Ab welcher Farbe zum Füllen interpoliert werden soll.|false|
|endColor|nein|Number[]|[245, 66, 66]|Bis zu welcher Farbe zum Füllen interpoliert werden soll.|false|

**Beispiel**

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

Datatype der WFS-searchInstance.
Ein Literal (`literal`) kann entweder eine Klausel (`clause`) als Parameter besitzen oder ein Feld (`field`). Falls beide gesetzt sind, dann wird der `clause`-Teil ignoriert.
Zu beachten ist jedoch, dass ein Feld innerhalb einer Klausel verpackt sein muss (wie in den meisten Beispielen zu sehen).

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|clause|ja|**[Clause](#datatypesliteralclause)**||Definiert die Art und Weise wie mehrere `literals` miteinander angefragt werden sollen. Kann als Gruppe von `literals` angesehen werden.|true|
|field|nein|**[Field](#datatypesliteralfield)**||Repräsentation eines Auswahlfeldes für einen Servicewert für den Nutzer.|true|

**Beispiele**

```json
{
    "clause": {
        "type": "and",
        "literals": [
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "gemarkung",
                    "inputLabel": "Gemarkung",
                    "options": ""
                }
            },
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "flur",
                    "inputLabel": "Flur",
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
        "inputLabel": "Flüsse",
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

Eine Klausel (`clause`) definiert die Art und Weise wie verschiedene `literals` miteinander anzufragen sind.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|literals|ja|**[Literal](#datatypesliteral)**[]||Array an `literals`.|true|
|type|ja|enum["and", "or"]||Die Art und Weise wie die `literals` dieser `clause` angefragt werden sollen.|false|

**Beispiel**

```json
{
    "clause": {
        "type": "and",
        "literals": [
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "gemarkung",
                    "inputLabel": "Gemarkung",
                    "options": ""
                }
            },
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "flur",
                    "inputLabel": "Flur",
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

Ein `field` repräsentiert ein Auswahlfeld für einen Wert des Services.
Es ist möglich ein Feld für mehrere Suchparameter des Dienstes zu verwenden. Um dies zu ermöglichen, muss für jeden Parameter ein Array verwendet werden, wobei jedes Element zu einem einzelnen Wert des Dienstes gehört.
Eine Konfiguration wie

```json
{
    "field": {
        "queryType": ["equal", "like"],
        "fieldName": ["flst", "gmkr"],
        "inputLabel": ["Flurstück", "Gemarkungsnummer"]
    }
}
```

würde ein einzelnes `field` erstellen, in welchen die Nutzenden sich entscheiden können, ob sie das Eingabefeld nutzen möchten, um nach einem `Flurstück` oder nach einer `Gemarkungsnummer` zu suchen, indem sie den Wert in einem Dropdown Menü auswählen.

Falls der Parameter `options` gesetzt wurde, wird ein `select`-Feld, andernfalls ein normaler Text Input verwendet.
Falls `options` ein String ist, ist es wichtig, dass die Reihenfolge der Felder mit der Ordnung der Objekte der externen Quelle (`selectSource`) übereinstimmt.
Man nehme an, dass die Quelle wie folgt aussieht:

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

In diesem Fall sollte die Reihenfolge in der Konfiguration wie folgt aussehen:

```json
{
    "clause": {
        "type": "and",
        "literals": [
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "objects",
                    "inputLabel": "Objekte",
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

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|defaultValue|nein|String/String[]||Wenn das Feld nicht `required` ist, wird dieser Wert beim Senden verwendet.|false|
|fieldName|ja|String/String[]||Die Id des WFS Service Parameters für den Vergleich.|false|
|inputLabel|ja|String/String[]||Label des UI Elementes. Kann ein Übersetzungsschlüssel sein.|false|
|inputPlaceholder|nein|String/String[]||Platzhalter für das UI Element. Sollte Beispieldaten enthalten. Kann ein Übersetzungsschlüssel sein.|false|
|inputTitle|nein|String/String[]||Wert, welcher beim Hovern über das UI Element angezeigt wird. Kann ein Übersetzungsschlüssel sein.|false|
|required|nein|Boolean/Boolean[]|false|Legt fest, ob das Feld ausgefüllt werden muss.|false|
|options|nein|String/**[Option](#datatypesliteralfieldoption)**[]/String[]||Falls `options` ein Array (egal ob es Strings oder **[Option](#datatypesliteralfieldoption)**) sind, werden die gegebenen Werte für die Auswahl verwendet. Diese Optionen können entweder eine **[Option](#datatypesliteralfieldoption)** oder einfache Werte (`String` / `Number`) sein. Im zweiten Fall werden die einfachen Werte sowohl für die Id als auch für den `displayName` verwendet.  <br /> Falls `options` ein String ist, existieren verschiedene Möglichkeiten: <ul><li>Falls der String leer ist, werden die Schlüssel der **[selectSource](#portalconfigmenusectionsmoduleswfssearchsearchinstance)** verwendet.</li><li>Falls der String nicht leer ist, wird angenommen, dass ein anderes Feld mit `options=""` existiert; andernfalls wird das Feld deaktiviert. Es wird zudem angenommen, dass der String ein Array in **[selectSource](#portalconfigmenusectionsmoduleswfssearchsearchinstance)** mit weiteren Optionen repräsentiert.</li></ul> **Zu beachten**: Der Parameter `options` kann auch als multidimensionales Array **[Option](#datatypesliteralfieldoption)**[][] angegeben werden, welches allerdings nicht für Masterportal Admins parametrisiert werden kann. Dies findet Anwendung, wenn ein **[Option](#datatypesliteralfieldoption)**[] verwendet werden soll, jedoch mehrere Parameter in einem `field` hinterlegt werden sollen.|true|
|queryType|nein|enum["equal", "like"]/enum["equal", "like"][]||Wird für die Verwendung mit einem WFS@1.1.0 vorausgesetzt. Der `queryType` legt fest, wie das Feld mit dem Wert des Dienstes verglichen werden soll.|false|
|usesId|nein|Boolean/Boolean[]|null|Nur relevant, wenn der Parameter `options` gesetzt und ein leerer String (Rootelement) ist. Legt fest, ob der Schlüssel des Objektes aus der externen Quelle als Wert für die Query verwendet werden soll oder ob das Objekt eine Id gesetzt hat, welche stattdessen Anwendung finden soll.|false|

**Beispiel**

```json
{
    "field": {
        "queryType": "equal",
        "fieldName": "rivers",
        "inputLabel": "Flüsse",
        "options": [
            {
                "displayName": "Elbe",
                "fieldValue": "0"
            },
            {
                "displayName": "Mosel",
                "fieldValue": "1"
            },
            {
                "displayName": "Rhein",
                "fieldValue": "2"
            }
        ]
    }
}
```

***

##### Datatypes.Literal.Field.Option {data-toc-label='Option'}
Eine auswählbare Option für einen anzufragenden Parameter.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|displayName|nein|String||Anzuzeigender Wert für die Option. Kann ein Übersetzungsschlüssel sein. Wenn der Wert nicht gesetzt ist, wird die `id` angezeigt.|false|
|fieldValue|ja|String||Wert, welcher an den Dienst gesendet werden soll.|false|

**Beispiel**

```json
{
    "fieldValue": "elbe",
    "displayName": "Elbe"
}
```

***

### Datatypes.ResultList {data-toc-label='ResultList'}
Einstellungen für die Ausgabe der gefundenen Features in der Ergebnisliste.
Mit der Angabe von `showAll` werden alle Attribute der gefundenen Feature in ihrer Ursprungsform dargestellt.
Bei Verwendung eines Objektes können die darzustellenden Attribute festgelegt werden.
Ein Schlüssel des Objektes muss eines der Attribute des Features wiedergeben, während durch den entsprechenden Wert die textliche Ausgabe dieses Attributes festgelegt wird.

**Beispiele**:

```json
{
    "resultList": "showAll"
}
```

```json
{
    "resultList": {
        "schulname": "Schulname",
        "abschluss": "Abschluss"
    }
}
```

***

### Datatypes.RequestConfig {data-toc-label='RequestConfig'}

[type:Gazetteer]: # (Datatypes.RequestConfig.Gazetteer)
[type:LikeFilter]: # (Datatypes.RequestConfig.LikeFilter)

Informationen über den WFS-Dienst, welcher angefragt werden soll.
Es muss entweder `layerId` oder `restLayerId` definiert sein. Wenn `layerId` verwendet wird, dann muss zusätzlich der Layer in der **[config.json](config.json.de.md)** konfiguriert werden.
Falls beide Parameter gesetzt wurden, dann wird `restLayerId` verwendet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|gazetteer|nein|**[Gazetteer](#datatypesrequestconfiggazetteer)**||Legt fest, ob der verwendete WFS-Dienst ein WFS-G ist, welcher anders geparsed werden muss.|false|
|layerId|nein|String||Id des WFS Dienstes, welcher angefragt werden soll. Informationen werden aus der **[services.json](../Global-Config/services.json.md)** bezogen.|false|
|likeFilter|nein|**[LikeFilter](#datatypesrequestconfiglikefilter)**|{"wildCard": "*", "singleChar": "#", "escape": "!"}|Die Konfiguration des Services hinsichtlich des like Filters.|true|
|maxFeatures|nein|Number/String|8|Maximale Anzahl an Features, welche der Dienst zurückgeben soll. Alternativ kann auch der String `showAll` übergeben werden, um alle Ergebnisse anzuzeigen.|false|
|restLayerId|nein|String||Id des WFS Dienstes, welcher angefragt werden soll. Informationen werden aus der **[rest-services.json](../Global-Config/rest-services.json.md)** bezogen.|false|
|storedQueryId|nein|String||Die Id der gespeicherten Anfrage (Stored Query) des WFS Dienstes, welche für die Anfrage verwendet werden soll. Es wird angenommen, dass ein WFS@2.0.0 verwendet wird, falls dieses Feld gesetzt wurde.|false|

**Beispiel**

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
Innerhalb eines Filters für einen WFS-Dienst können Werte mit einem `equal` oder einem `like` verglichen werden.
Wenn der Vergleich mit einem `like` durchgeführt werden soll, dann werden weitere Eigenschaften benötigt. Diese können sowohl im Wert, als auch in der Eigenschaftsdefinition variieren.
Es wird für die Dokumentation angenommen, dass die Eigenschaften `wildCard`, `singleChar` und `escapeChar` heißen; Variationen wie `single` und `escape` sind jedoch auch möglich und müssen dem Dienst entsprechend für den Filter angegeben werden. Die Schlüssel-Wert-Paare des hier übergebenen Objekts werden immer wie angegeben in den Request übertragen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|wildCard|ja|String|"*"|Der Wildcardwert für den like Filter.|true|
|singleChar|ja|String|"#"|Der Wert für einen einzelnen Charakter für den like Filter.|true|
|escapeChar|ja|String|"!"|Der Escape-Wert für den like Filter.|true|

**Beispiel**

In diesem Beispiel weicht der Key für `escapeChar` ab.

```json
{
    "wildCard": "*",
    "singleChar": "#",
    "escape": "!"
}
```

***

#### Datatypes.RequestConfig.Gazetteer {data-toc-label='Gazetteer'}
Parameter, welche exklusiv für die Verwendung eines WFS-G (Gazetteer) benötigt werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|namespaces|ja|String/String[]||Die Namespaces des Dienstes.|false|
|memberSuffix|ja|enum["member","featureMember"]||Der Suffix des Featuretypen.|false|

**Beispiel**

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
Konfiguration für die Vorschläge von Nutzereingaben.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|featureType|nein|String||Wenn gegeben, wird die Anfrage mit diesem featureType statt dem aus der Definition des Services ausgeführt. Nur verwendbar, wenn der Dienst in der **[services.json](../Global-Config/services.json.md)** definiert wurde.|false|
|length|nein|Number|3|Die Anfrage wird dann ausgelöst, wenn die Inputlänge mindestens so lang ist wie der Wert dieses Parameters.|false|

***
