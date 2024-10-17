# The Alerting module

The Masterportal can display hints to users by using the *Alerting* module. Both simple texts and HTML may be displayed.

Since multiple alert messages may be shown at once, a pool of all available alerts can be shown with multipleAlert: true. On adding a valid alert to this pool, a modal with all currently active alerts is shown.

An alert may be added in this fashion:

```js
import store from "[...]/src/app-store/index";

// [...]

store.dispatch("Alerting/addSingleAlert", {
    "category": "error",
    "content": "This wasn't supposed to happen! (Error Code 1234)",
    "multipleAlert": true
});
```

Another example: The following alert is shown from October '20 to November '21 and requires a manual reading confirmation.

```js
import store from "[...]/src/app-store/index";

// [...]

store.dispatch("Alerting/addSingleAlert", {
    "category": "info",
    "confirmText": "Starting any minute now ... !",
    "content": "Please prepare the quarterly reports!",
    "displayFrom": "2020-10-01 00:00:00",
    "displayUntil": "2021-11-01 00:00:00",
    "mustBeConfirmed": true
});
```


## Parameters for alert creation

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|title|no|String|""|Title of an alert.|
|category|no|String|"Info"|Header text and, at the same time, reference value for grouping alerts of the same *category*.|
|confirmText|no|String|"mark as read"|Text of a clickable link to indicate the alert has been read. Only required when `mustBeConfirmed` is set to `true`.|
|reConfirmText|no|String|"show this message again"|Text for showing the alert again.|
|content|yes|String|""|Message. May contain HTML.|
|displayFrom|no|Boolean/String|false|Time from which the alert may be displayed. When set to `false`, no limitation is applied. Format: "YYYY-MM-DD HH-II-SS"|
|displayUntil|no|Boolean/String|false|Time to which the alert may be displayed. When set to `false`, no limitation is applied. Format: "YYYY-MM-DD HH-II-SS"|
|mustBeConfirmed|no|Boolean|false|Flag indicating whether the alert requires a manual read confirmation.|
|multipleAlert|no|Boolean|false|Flag indicating whether the alert should be added to the current alert list (true) or is shown as a single alert (false)|
|once|no|Boolean|false|If `false`, this alert may be shown on each visit. If `true`, it's only shown once.|
|onceInSession|no|Boolean|false|If `false`, this alert may be shown on each visit. If `true`, it's only shown once in the current session.|
|displayOnEvent|no|Object|undefined|Optional. If given the following object is required: {type: string, value: string|object} where (in simple) `type` is the address of the action and the `value` the action value. See [alerts on events](#alerts-on-events) for details.|


## Initially loading an *Alerting* configuration

The *Alerting* module allows specifying an URL in the `config.js` parameter `alerting.fetchBroadcastUrl`, e.g. `"https://localhost:9001/portal/master/resources/broadcastedPortalAlerts.json"`. If such a parameter is set, the module will load the linked configuration file and create the alerts. Multiple alerts are allowed by default. This may e.g. be used to inform users of new versions or planned down-times. An arbitrary amount of portals may be supplied with such a central user information file.

Configuration file example:

```json
{
  "globalAlerts": ["AlertId3"],

  "restrictedAlerts": {
    "https://myOfflinePortal.com/": ["AlertId1", "AlertId2"],
    "https://myLegacyPortal.com/": ["AlertId4"]
  },

  "alerts": {
    "AlertId1": {
      "category": "error",
      "content": "The server is in maintenance mode until November 10, 2020.",
      "displayFrom": "2020-11-09 00:00:00",
      "displayUntil": "2020-11-10 00:00:00",
      "mustBeConfirmed": false,
      "once": false
    },
    "AlertId2": {
      "category": "info",
      "content": "Since 11.11. there is a new version of the portal!",
      "displayFrom": "2020-11-11 00:00:00",
      "displayUntil": "2020-11-30 00:00:00",
      "mustBeConfirmed": true,
      "once": true
    },
    "AlertId3": {
      "category": "Welcome!",
      "content": "Welcome to the Portal!"
    },
    "AlertId4": {
      "category": "warning",
      "content": "This portal will be deactivated on 01/01/2021!",
      "displayFrom": "2020-12-01 00:00:00",
      "displayUntil": "2020-12-31 23:59:59"
    }
  }
}
```

Within `"globalAlerts"` an array may be specified that holds alert IDs to be loaded on all portals.

In the `"restrictedAlerts"` object alerts only for specific portals may be specified. For these, the key is the portal URL, and the value an array of alert IDs to be resolved by the portal at that URL.

Within `"alerts"`, alerts may be defined as previously defined. Each alert holds an ID for reference, which is its respective key in the `"alerts"` object.


Besides the central loading of alerts with an own alerting json. Alerts can defined within the `config.json` with the parameter `Portalconfig.alerts`. If such a parameter is set, the module will create the alerts. Multiple alerts are allowed by default. This allows to customize the initial alerts of a single portal.

Configuration of alerts within config.json example:

```json
  "Portalconfig": {
    "alerts": {
      "qs-release": {
        "category": "Portal zur Abnahme!",
        "content": "Dieses Geoportal dient der Qualitätskontrolle durch den Kunden.<br>Es ist aufgrund von möglichen Fehlern <b>nicht</b> zur Nutzung für alltägliche oder berufliche Aufgaben geeignet!<br><br>",
        "creationDate": "01/09/22",
        "mustBeConfirmed": true,
        "once": false
      },
    }
    },
    "mapView": {
```


## Alerts on events

Alerts are possible for almost any event.

For example: You want to inform the user with additional information when clicking
a specific button. E.g, a change from 2D to 3D mode. You can configure an alert
event for these actions.

The identifier is a `displayOnEvent` key of an alert item. Containing an object
with a `type` for the action (event address) and with two possible cases for the
`value` property as follow (It depends on the events themself):

```json
    // Event when click on the button for 3D mode
    displayOnEvent: {
        "type": "Maps/changeMapMode",
        "value": "3D" // Use "2D" for an alert of the 2D event
    }

    // Event when click on the component for "Print Card"
    "displayOnEvent": {
        "type": "Menu/changeCurrentComponent",
        "value": {
          "type": "print"
        }
      }
```

Alert example for the 3D Mode

```json
"alerts": {
    "eventAlert3dMode": {
        "category": "warning",
        "title": "Alert title"
        "content": "You get the warning if you click on the configured action.",
        "mustBeConfirmed": false,
        "once": false,
        "displayOnEvent": {
            "type": "Maps/changeMapMode",
            "value": "3D"
        }
    },
    // ... further alerts.
```


Then make sure the event is for your portal or in global:

```json
"restrictedAlerts": {
    "<https://your-masterportal.com/>": ["AlertId1", "AlertId2", "eventAlert3dMode"],
```


### Strange side effects for layer events

... which can be used but: NOT supported.

ALL of them are not 100% unique. The click events for the layers currently have
no id to handle them without side effects.

How you can configure the activation/ deactivation of a layer as an event in the
alerts.

Also: It is better not to use the legend variant. You can switch these off for
individual layers and then (presumably) these `Modules/Legend/createLegendForLayerInfo`/
`Modules/Legend/removeLegend` events will not be found at all.

```json
  ...
  "displayOnEvent": {
      "type": "showLayerAttributions",
      "value": {
        "id": "453",
        "visibility": false
      }
  }
  ...
```
