import store from "../app-store/index";
import styleList from "@masterportal/masterportalapi/src/vectorStyle/styleList";
import createStyle from "@masterportal/masterportalapi/src/vectorStyle/createStyle";

/**
 * Creates a feature from the given geometry and adds it to the map.
 * @param {ol/Feature} features The ol features to be highlighted
 * @param {Boolean} isAdditional - Flag if the style should be for additional or default polygon
 * @returns {void}
 */
export default function placingAdditionalPolygonMarker (features, isAdditional) {
    const PolygonStyleId = isAdditional ? store.getters["MapMarker/additionalPolygonStyleId"] : store.getters["MapMarker/polygonStyleId"],
        styleListModel = styleList.returnStyleObject(PolygonStyleId),
        markerPolygon = store.getters["MapMarker/markerPolygon"];

    if (styleListModel && features.length > 0) {
        features.forEach(feature => {
            const featureStyle = createStyle.createStyle(styleListModel, feature, false);

            feature.setStyle(featureStyle);
            store.commit("MapMarker/addFeatureToMarker", {feature: feature, marker: "markerPolygon"});
        });

        store.commit("MapMarker/setVisibilityMarker", {visibility: true, marker: "markerPolygon"});
        store.dispatch("Maps/addLayerOnTop", markerPolygon, {root: true});
    }
    else {
        store.dispatch("Alerting/addSingleAlert", i18next.t("common:modules.mapMarker.noStyleModel", {styleId: PolygonStyleId}), {root: true});
    }
}
