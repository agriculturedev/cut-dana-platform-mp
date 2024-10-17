import VectorSource from "ol/source/Vector";
import {Vector as VectorLayer} from "ol/layer";
import {GeoJSON} from "ol/format";
import Feature from "ol/Feature";
import {BufferOp} from "jsts/org/locationtech/jts/operation/buffer";
import {ResultType} from "./enums";
import * as setters from "./settersBufferAnalysis";
import * as initializers from "./initializersBufferAnalysis";
import layerCollection from "../../../core/layers/js/layerCollection";

const actions = {
    ...initializers,
    ...setters,
    /**
     * Triggers several actions to check for intersections.
     * Includes checks between created buffers and features of selected target layer
     * Also checks again for intersections between buffers and intersection polygons
     * Finally adds new intersection features to map
     *
     * @return {void}
     */
    checkIntersection ({dispatch, getters: {selectedTargetLayer, bufferLayer}}) {
        dispatch("Maps/areLayerFeaturesLoaded", selectedTargetLayer.id, {root: true}).then(() => {
            const bufferFeatures = bufferLayer.getSource().getFeatures();

            dispatch("checkIntersectionWithBuffers", bufferFeatures)
                .then(dispatch("checkIntersectionsWithIntersections", bufferFeatures))
                .then(dispatch("convertIntersectionsToPolygons"))
                .then(dispatch("addNewFeaturesToMap"));
        });
    },
    /**
     * Creates and shows buffers associated to features of selected source layer
     *
     * @return {void}
     */
    showBuffer ({dispatch, commit, getters: {selectedSourceLayer, jstsParser, bufferRadius, bufferStyle}}) {
        const layer = layerCollection.getLayerById(selectedSourceLayer.id),
            features = layer?.getLayerSource().getFeatures() || [],
            vectorSource = new VectorSource(),
            bufferLayer = new VectorLayer({
                id: "buffer_layer",
                source: vectorSource,
                alwaysOnTop: true,
                zIndex: 10
            });

        commit("setBufferLayer", bufferLayer);
        features.forEach(feature => {
            const jstsGeom = jstsParser.read(feature.getGeometry()),
                buffered = BufferOp.bufferOp(jstsGeom, bufferRadius),
                newFeature = new Feature({
                    geometry: jstsParser.write(buffered),
                    name: "Buffers"
                });

            newFeature.setStyle(bufferStyle);
            newFeature.set("originFeature", feature);
            vectorSource.addFeature(newFeature);
        });
        dispatch("Maps/addLayer", bufferLayer, {root: true});
    },
    /**
     * Removes generated result layer and buffer layer
     * Also unsets the intersections and result features arrays
     *
     * @return {void}
     */
    removeGeneratedLayers ({commit, rootState, getters: {bufferLayer}}) {

        commit("setResultLayer", {});
        if (bufferLayer?.ol_uid) {
            mapCollection.getMap(rootState.Maps.mode).getLayers().forEach(layer => {
                if (layer?.ol_uid === bufferLayer.ol_uid) {
                    mapCollection.getMap(rootState.Maps.mode).removeLayer(layer);
                }
            });
        }
        commit("setBufferLayer", {});
        commit("setIntersections", []);
        commit("setResultFeatures", []);
    },
    /**
     * Resets the module to default settings
     * Also restores the opacity for selected source and target layers
     *
     * @return {void}
     */
    resetModule ({commit, dispatch, getters: {selectedSourceLayer, selectedTargetLayer}}) {
        if (selectedSourceLayer) {
            selectedSourceLayer.opacity = 1;
            selectedSourceLayer.visibility = false;
        }

        if (selectedTargetLayer) {
            selectedTargetLayer.opacity = 1;
            selectedTargetLayer.visibility = false;
        }
        dispatch("applySelectedSourceLayer", null);
        dispatch("applySelectedTargetLayer", null);
        dispatch("removeGeneratedLayers");
        commit("setSavedUrl", null);
        commit("setInputBufferRadius", 0);
    },
    /**
     * Checks intersections between buffers and features of the selected target layer
     * Also triggers the actions to create intersection polygons and to add the new intersection result features
     *
     * @param {Array} bufferFeatures - array with buffer features
     *
     * @return {void}
     */
    checkIntersectionWithBuffers ({commit, dispatch, getters: {selectedTargetLayer, jstsParser, resultType}}, bufferFeatures) {
        const layer = layerCollection.getLayerById(selectedTargetLayer.id),
            targetFeatures = layer?.getLayerSource().getFeatures() || [];

        targetFeatures.forEach(targetFeature => {
            const targetGeometry = targetFeature.getGeometry(),
                foundIntersection = bufferFeatures.some(bufferFeature => {
                    const sourceGeometry = bufferFeature.getGeometry(),
                        // check if buffer origin feature is the same as the target feature
                        sameFeature = bufferFeature.get("originFeature").getId() === targetFeature.getId(),
                        sourcePoly = jstsParser.read(sourceGeometry),
                        targetPoly = jstsParser.read(targetGeometry);

                    if (targetGeometry.getType() === "Point" &&
                        sourceGeometry.intersectsCoordinate(targetGeometry.getCoordinates()) &&
                        !sameFeature) {
                        return true;
                    }

                    if (sourcePoly?.intersects(targetPoly) && !sameFeature) {
                        dispatch("generateIntersectionPolygon", {
                            properties: targetFeature.getProperties(),
                            sourcePoly,
                            targetPoly
                        });
                        return resultType !== ResultType.WITHIN;
                    }

                    return false;
                });

            // only add target feature due to selected result type
            if (!foundIntersection && resultType === ResultType.OUTSIDE ||
                foundIntersection && resultType === ResultType.WITHIN) {
                commit("addResultFeature", targetFeature);
            }
        });
    },
    /**
     * Calculates based on selected result type the intersection/difference between source and target polygon
     * and adds the calculated polygon to the intersections array.
     * Also transfers the given properties to the new polygon.
     *
     * @param {Object} payload - payload for the action
     * @param {Polygon} payload.sourcePoly - source polygon
     * @param {Polygon} payload.targetPoly - target polygon
     * @param {Object} [payload.properties = {}] - properties to be transferred
     *
     * @returns {void}
     */
    generateIntersectionPolygon ({commit, getters: {resultType}}, {sourcePoly, targetPoly, properties = {}}) {
        const subsetPoly = resultType === ResultType.WITHIN ? sourcePoly.intersection(targetPoly) : targetPoly.difference(sourcePoly);

        subsetPoly.properties = properties;
        commit("addIntersectionPolygon", subsetPoly);
    },
    /**
     * Checks intersections between buffers and already calculated intersections
     * Also triggers the action to create a new intersection polygon and removes the previous calculated intersection
     *
     * @param {Array} bufferFeatures - array with features
     *
     * @return {void}
     */
    checkIntersectionsWithIntersections ({dispatch, getters: {intersections, jstsParser}}, bufferFeatures) {
        bufferFeatures.forEach(buffer => {
            intersections.forEach((intersection) => {
                const sourceGeometry = buffer.getGeometry(),
                    sourcePoly = jstsParser.read(sourceGeometry);

                if (sourcePoly.intersects(intersection)) {
                    dispatch("generateIntersectionPolygon", {properties: intersection.properties, sourcePoly, targetPoly: intersection});
                }
            });
        });
    },
    /**
     * Converts intersection polygons to Open layers features
     *
     * @return {void}
     */
    convertIntersectionsToPolygons ({commit, getters: {intersections, geoJSONWriter}}) {
        if (intersections.length) {
            intersections.forEach(intersection => {
                const geojsonFormat = new GeoJSON(),
                    newFeature = geojsonFormat.readFeature({
                        type: "Feature",
                        properties: intersection.properties,
                        geometry: geoJSONWriter.write(intersection)
                    });

                commit("addResultFeature", newFeature);
            });
        }
    },
    /**
     * Creates a new layer for the result features and adds it to the map
     * Style and GFI config is transferred from target layer
     *
     * @return {void}
     */
    addNewFeaturesToMap ({commit,
        dispatch,
        getters: {
            resultFeatures,
            selectedTargetLayer,
            selectedSourceLayer,
            bufferLayer
        }}) {
        if (resultFeatures.length) {
            const vectorSource = new VectorSource(),
                gfiAttributes = selectedTargetLayer.gfiAttributes,
                resultLayer = new VectorLayer({
                    id: "result_layer",
                    source: vectorSource,
                    style: selectedTargetLayer.style,
                    alwaysOnTop: true
                });

            commit("setResultLayer", resultLayer);

            vectorSource.addFeatures(resultFeatures);
            resultLayer.set("gfiAttributes", gfiAttributes);
            dispatch("Maps/addLayer", resultLayer, {root: true});
        }
        const targetOlLayer = layerCollection.getLayerById(selectedTargetLayer.id),
            sourceOlLayer = layerCollection.getLayerById(selectedSourceLayer.id);

        targetOlLayer.layer.setOpacity(targetOlLayer.layer.getOpacity() * 0.5);
        sourceOlLayer.layer.setOpacity(sourceOlLayer.layer.getOpacity() * 0.5);
        bufferLayer.setOpacity(0.5);
    },
    /**
     * generates URL from state
     *
     * @return {void}
     */
    buildUrlFromToolState ({commit, getters: {selectedSourceLayer, bufferRadius, resultType, selectedTargetLayer, type}}) {
        const toolState = {
            applySelectedSourceLayer: selectedSourceLayer.id,
            applyBufferRadius: bufferRadius,
            setResultType: resultType,
            applySelectedTargetLayer: selectedTargetLayer.id
        };

        commit("setSavedUrl", location.origin +
            location.pathname +
            "?isinitopen=" +
            type +
            "&initvalues=" +
            JSON.stringify(toolState));
    },
    /**
     * Applies values from previous saved buffer analysis
     * that was copied into the URL.
     * @return {void}
     */
    applyValuesFromSavedUrlBuffer ({rootState, state, dispatch, commit}) {
        // @todo im Zuge des Umzugs der parametricURL angucken.
        if (rootState.urlParams && rootState.urlParams["Tools/bufferAnalysis/active"]) {
            const extractedParams = rootState.urlParams.initvalues.map((element) => {
                    return element.replace(/\\"/g, "\"").split(":")[1].replaceAll("\"", "").replaceAll("}", "");
                }),
                selectedSourceLayerFromUrl = state.selectOptions.find(layer => layer.id === extractedParams[0]),
                bufferRadiusFromUrl = extractedParams[1],
                resultTypeFromUrl = extractedParams[2],
                selectedTargetLayerFromUrl = state.selectOptions.find(layer => layer.id === extractedParams[3]);

            dispatch("applySelectedSourceLayer", selectedSourceLayerFromUrl);
            commit("setInputBufferRadius", bufferRadiusFromUrl);
            dispatch("applyBufferRadius", bufferRadiusFromUrl);
            commit("setResultType", resultTypeFromUrl);
            dispatch("applySelectedTargetLayer", selectedTargetLayerFromUrl);
        }
    }
};

export default actions;
