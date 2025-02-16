import directionsRouteSource from "./directionsRouteSource";
import directionsRouteStyle from "./directionsRouteStyle";
import VectorLayer from "ol/layer/Vector.js";

export default new VectorLayer({
    id: "directions_route_layer",
    source: directionsRouteSource,
    style: directionsRouteStyle,
    name: "directions_route_layer",
    alwaysOnTop: true
});
