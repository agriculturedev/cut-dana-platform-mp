import {RoutingWaypoint} from "../../js/classes/routing-waypoint";

import isochronesPointSource from "../../js/map/isochrones/point/isochronesPointSource";
import isochronesPointLayer from "../../js/map/isochrones/point/isochronesPointLayer";
import isochronesPointDrawInteraction from "../../js/map/isochrones/point/isochronesPointDraw";
import isochronesPointModifyInteraction from "../../js/map/isochrones/point/isochronesPointModify";
import isochronesPointSnapInteraction from "../../js/map/isochrones/point/isochronesPointSnap";

import isochronesAreaSource from "../../js/map/isochrones/area/isochronesAreaSource";
import isochronesAreaLayer from "../../js/map/isochrones/area/isochronesAreaLayer";

import stateRouting from "../stateRouting";

export default {
    isochronesPointSource,
    isochronesPointLayer,
    isochronesPointDrawInteraction,
    isochronesPointModifyInteraction,
    isochronesPointSnapInteraction,
    isochronesAreaSource,
    isochronesAreaLayer,
    mapListenerAdded: false,
    waypoint: new RoutingWaypoint({
        index: 0,
        source: isochronesPointSource
    }),
    // Routing Isochrones Result
    routingIsochrones: null,
    isLoadingIsochrones: false,
    routingAvoidFeaturesOptions: [],

    settings: stateRouting.isochronesSettings
};
