import directionsWaypointsSource from "../../js/map/directions/waypoints/directionsWaypointsSource";
import directionsWaypointsLayer from "../../js/map/directions/waypoints/directionsWaypointsLayer";
import directionsWaypointsModifyInteraction from "../../js/map/directions/waypoints/directionsWaypointsModify";
import directionsWaypointsSnapInteraction from "../../js/map/directions/waypoints/directionsWaypointsSnap";
import directionsWaypointsDrawInteraction from "../../js/map/directions/waypoints/directionsWaypointsDraw";

import directionsRouteSource from "../../js/map/directions/route/directionsRouteSource";
import directionsRouteLayer from "../../js/map/directions/route/directionsRouteLayer";
import directionsRouteModifyInteraction from "../../js/map/directions/route/directionsRouteModify";
import directionsRouteSnapInteraction from "../../js/map/directions/route/directionsRouteSnap";

import directionsAvoidSource from "../../js/map/directions/avoid/directionsAvoidSource";
import directionsAvoidLayer from "../../js/map/directions/avoid/directionsAvoidLayer";
import directionsAvoidModifyInteraction from "../../js/map/directions/avoid/directionsAvoidModify";
import directionsAvoidSnapInteraction from "../../js/map/directions/avoid/directionsAvoidSnap";
import directionsAvoidDrawInteraction from "../../js/map/directions/avoid/directionsAvoidDraw";
import directionsAvoidSelectInteraction from "../../js/map/directions/avoid/directionsAvoidSelect";

import stateRouting from "../stateRouting";

export default {
    // Map State
    directionsWaypointsSource,
    directionsWaypointsLayer,

    directionsRouteSource,
    directionsRouteLayer,

    directionsAvoidSource,
    directionsAvoidLayer,
    // Draw Parameter
    directionsWaypointsModifyInteraction,
    directionsWaypointsSnapInteraction,
    directionsWaypointsDrawInteraction,

    directionsRouteModifyInteraction,
    directionsRouteSnapInteraction,

    directionsAvoidModifyInteraction,
    directionsAvoidSnapInteraction,
    directionsAvoidDrawInteraction,
    directionsAvoidSelectInteraction,

    // Directions Parameter
    waypoints: [],
    routingAvoidFeaturesOptions: [],
    // Routing Directions Result
    routingDirections: null,
    mapListenerAdded: false,
    isLoadingDirections: false,
    mapInteractionMode: "WAYPOINTS",
    settings: stateRouting.directionsSettings
};
