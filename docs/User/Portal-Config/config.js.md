# config.js 3.0

The `config.js` contains Masterportal configuration not directly related to UI or layers. For example, paths to other configuration files belong here. This file is usually placed next to the `index.html` and `config.json` files.

In the following, all configuration options are described. For all configuration options of type `object`, further nested options are linked and described in detail after the main table. You may also refer to **[this config.js example file](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src_3_0_0/dev_vue/portal/basic/config.js)**.

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|addons|no|String[]|`[]`|List of names for custom modules. The modules are to be placed in the folder `/addons/`, with their entry points being defined in the `addonsConf.json`.|`["myAddon1", "myAddon2"]`||
|alerting|no|**[alerting](#alerting)**||Overrides the alert module's default values.||
|cesiumLibrary|no|String|`"https://cesium.com/downloads/cesiumjs/releases/1.95/Build/Cesium/Cesium.js"`|The path to the cesium.js library.|`"https://cesium.com/downloads/cesiumjs/releases/1.95/Build/Cesium/Cesium.js"`|
|cswId|no|String|`"3"`|Reference to a CSW interface used to retrieve layer information. The ID will be resolved to a service defined in the **[rest-services.json](../Global-Config/rest-services.json.md)** file.|`"my CSW-ID"`|
|ignoredKeys|no|String[]|`["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"]`|List of attribute names to be ignored for attribute information lists of all layer types. Only used with "gfiAttributes": "showAll".|`["BOUNDEDBY", "SHAPE", "SHAPE_LENGTH", "SHAPE_AREA", "OBJECTID", "GLOBALID", "GEOMETRY", "SHP", "SHP_AREA", "SHP_LENGTH","GEOM"]`|
|layerConf|yes|String||Path to the **[services.json](../Global-Config/services.json.md)** file containing all available WMS layers and WFS feature types. The path is relative to *js/main.js*.|`https://geodienste.hamburg.de/lgv-config/services-internet.json"`||
|matomo|no|**[matomo](#matomo)**||Options to integrate tracking via matomo.||
|metaDataCatalogueId|no|String|`"2"`|URL to the metadata catalog linked to in the layer information window. The ID is resolved to a service of the **[rest-services.json](../Global-Config/rest-services.json.md)** file. Note: This attribute is only necessary, when no "show_doc_url" is configured in the metadata dataset in the **[services.json](../Global-Config/services.json.md)**. The url can either be set globally (**[config.js](config.js.md)**) or layer-specific(**[services.json](../Global-Config/services.json.md)**).|`"MetaDataCatalogueUrl"`|
|namedProjections|yes|String[]||Definition of the usable coordinate systems. See **[syntax definition](http://proj4js.org/#named-projections)** for details..|`[["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"]]`|
|portalConf|no|String|`"config.json"`|Path to the portal's `config.json` file. You may also enter a node; in that case the taken path is controlled by the urlParameter `config`.|Direct path: "../masterDefault/config.json"; Node: "../../portal/master/". In the node scenario, a query parameter like `config=config.json` must exist in the URL.|
|portalLanguage|no|**[portalLanguage](#portallanguage)**||Settings for multilingualism of the portal interface.||
|proxyHost|no|String||Host name of a remote proxy with CORS configured to support the portal's domain, among others.|`"https://proxy.example.com"`|
|remoteInterface|no|**[remoteInterface](#remoteinterface)**||Optional remote interface configuration.||
|restConf|yes|String||Path to the **[rest-services.json](../Global-Config/rest-services.json.md)** file describing further services, e.g. print service, WPS, CSW. The path is relative to *js/main.js*.|`https://geodienste.hamburg.de/lgv-config/rest-services-internet.json"`||
|styleConf|yes|String||Path to the **[style.json](../Global-Config/style.json.md)** file describing vector layer (WFS) styles. The path is relative to *js/main.js*.|`https://geodienste.hamburg.de/lgv-config/style.json"`||
|vuetify|no|String|undefined|Path to the optional instance of the vuetify UI library. e.g. portal or addon specific.|`addons/cosi/vuetify/index.js`|
|wfsImgPath|no|String||Path to the folder holding images for the WFS styles. The path is relative to *js/main.js*.|`https://geodienste.hamburg.de/lgv-config/img/"`|

***

## alerting
Overrides the alert module's default values.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|fetchBroadcastUrl|no|String|`false`|The alerting module will initially use a linked configuration file from this URL, if set. For more information see **[Alerting](../../Dev/vueComponents/Alerting.md)**|
|initialAlerts|no|**[initialAlerts](#alertinginitialalerts)**||Alerts that are displayed when the portal is started|
|localStorageDisplayedAlertsKey|no|String|`"displayedAlerts"`|Arbitrary key used to store information regarding the alerting module in the browser's local storage.|

```js title="Example"
{
    alerting: {
        fetchBroadcastUrl: "./resources/newsFeedPortalAlerts.json",
        initialAlerts: {
            qs-release: {
                category: "Portal zur Abnahme!",
                content: "Dieses Geoportal dient der Qualitätskontrolle durch den Kunden.<br>Es ist aufgrund von möglichen Fehlern <b>nicht</b> zur Nutzung für alltägliche oder berufliche Aufgaben geeignet!<br><br>",
                creationDate: "01/09/22",
                mustBeConfirmed: true,
                once: true
            }
        }
    }
}
```

***

### alerting.initialAlerts
Alerts that are displayed when the portal is started.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|category|no|String|"Info"|Header text and, at the same time, reference value for grouping alerts of the same *category*.|
|confirmText|no|String|"mark as read"|Text of a clickable link to indicate the alert has been read. Only required when `mustBeConfirmed` is set to `true`.|
|content|yes|String|""|Message. May contain HTML.|
|displayFrom|no|Boolean/String|false|Time from which the alert may be displayed. When set to `false`, no limitation is applied. Format: "YYYY-MM-DD HH-II-SS"|
|displayUntil|no|Boolean/String|false|Time to which the alert may be displayed. When set to `false`, no limitation is applied. Format: "YYYY-MM-DD HH-II-SS"|
|multipleAlert|no|Boolean|false|Flag indicating whether the alert should be added to the current alert list (true) or is shown as a single alert (false)|
|mustBeConfirmed|no|Boolean|false|Flag indicating whether the alert requires a manual read confirmation.|
|once|no|Boolean|false|If `false`, this alert may be shown on each visit. If `true`, it's only shown once.|
|onceInSession|no|Boolean|false|If `false`, this alert may be shown on each visit. If `true`, it's only shown once in the current session.|
|reConfirmText|no|String|"show this message again"|Text for showing the alert again.|
|title|no|String|""|Title of an alert.|

***

## matomo
Options to integrate tracking via matomo. Besides following options further options may be set, see https://www.npmjs.com/package/vue-matomo .

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|host|yes|String|""|If set, tracking-information will be sent to given matomo host.|
|siteId|yes|String|""|siteId of matomo to be used.|


***

## portalLanguage
Settings for multilingualism of the portal interface.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|changeLanguageOnStartWhen|no|String[]|`["querystring", "localStorage", "navigator", "htmlTag"]`|Order of user language detection. See [i18next browser language detection documentation](https://github.com/i18next/i18next-browser-languageDetector) for details.|
|debug|no|Boolean|`false`|Controls whether debug information regarding translations is logged to the console.|
|enabled|yes|Boolean|`true`|Controls whether a button to switch the portal's language is provided.|
|fallbackLanguage|no|String|`"de"`|Fallback language used if contents are not available in the currently selected language.|
|languages|yes|Object|`{ de: "deutsch", en: "englisch" }`|Language abbreviations. Please mind that matching locale files must exist.|
|loadPath|no|String|`"/locales/{{lng}}/{{ns}}.json"`|Path to load language files from, or a function returning such a path: `function(lngs, namespaces) { return path; }`. `lng` and `ns` are read from the path, if given, as if from a static path. You may also provide a URL like `"https://localhost:9001/locales/{{lng}}/{{ns}}.json"`. See [i18next http backend documentation](https://github.com/i18next/i18next-http-backend) for details.|

**Example:**

```js
{
    portalLanguage: {
        enabled: true,
        debug: false,
        languages: {
            de: "Deutsch",
            en: "English",
            es: "Español",
            it: "Italiano",
            platt: "Platt",
            pt: "Português",
            ru: "Русский",
            tr: "Türkçe",
            ua: "Українська"
        },
        fallbackLanguage: "de",
        changeLanguageOnStartWhen: ["querystring", "localStorage", "htmlTag"]
    }
}
```

***

## remoteInterface
Optional remote interface configuration.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|postMessageUrl|no|String|`"http://localhost:8080"`|URL the portal will post to and receive messages from with the `postMessage` feature.|

**Example:**

```js
{
    remoteInterface: {
        postMessageUrl: "http://localhost:8080"
    }
}
```
***
## login
This module allows the user to login with an OIDC server. The retrieved access token is stored in cookies which can be used by the backend to deliver user-specific data (e.g. layers). Since the cookies are technically required to implement the login functionality, there is not corresponding cookie notice.
|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|oidcAuthorizationEndpoint|yes|String||The oidc auth endpoint, e.g. "https://idm.domain.de/auth/realms/REALM/protocol/openid-connect/auth".|
|oidcRevocationEndpoint|yes|String||The oidc revoke endpoint, e.g. "https://idm.domain.de/auth/realms/REALM/protocol/openid-connect/revoke".|
|oidcTokenEndpoint|yes|String||The oidc token endpoint, e.g. "https://idm.domain.de/auth/realms/REALM/protocol/openid-connect/token".|
|oidcClientId|yes|String||The oidc client, e.g. "masterportal" (must be created in your IDM, e.g. keycloak).|
|oidcScope|yes|String||The scope used for oidc, defaults to "profile email openid".|
|oidcRedirectUri|yes|String||The url to redirect the oidc process to - after login.|
|interceptorUrlRegex|yes|String||An regexp pattern that allows to specify urls the oidc token will be attached to.|
Make sure in keycloak the client is configured as follows:
```
Access Type: public
Standard Flow Enabled: ON
Valid Redirect URIs: <PORTAL URL, e.g. https://localhost/*>
Web Origins: <PORTAL HOST, e.g. https://localhost>
```
Specific ports are not allowed ports here. Especially, ports on localhost, e.g. `localhost:9001` will not work with keycloak since ports are not accepted in web origins.
In the section `OpenID Connect Compatibility Modes` activate `Use Refresh Tokens`. In the section `Advanced Settings` set `Proof Key for Code Exchange Code Challenge Method` to `S256`.
**Example:**
```json
{
  "login": {
      "oidcAuthorizationEndpoint": "https://idm.DOMAIN.de/auth/realms/REALM/protocol/openid-connect/auth",
      "oidcRevocationEndpoint": "https://idm.DOMAIN.de/auth/realms/REALM/protocol/openid-connect/revoke",
      "oidcTokenEndpoint": "https://idm.DOMAIN.de/auth/realms/REALM/protocol/openid-connect/token",
      "oidcClientId": "masterportal",
      "oidcScope": "profile email openid",
      "oidcRedirectUri": "https://localhost/portal/basic/",
      "interceptorUrlRegex": "https?://localhost.*" // add authorization to all URLs that match the given regex
  }
}
```