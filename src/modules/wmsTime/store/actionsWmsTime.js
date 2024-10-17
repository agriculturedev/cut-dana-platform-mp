import layerCollection from "../../../core/layers/js/layerCollection";
import {treeSubjectsKey} from "../../../shared/js/utils/constants";
import store from "../../../app-store";

export default {
    windowWidthChanged ({commit, dispatch, state, getters, rootGetters}) {
        commit("setWindowWidth");

        if (!getters.minWidth && rootGetters["Modules/LayerSwiper/active"]) {
            dispatch("toggleSwiper", state.timeSlider.currentLayerId + state.layerAppendix);
        }
    },
    /**
     * Watch the visible layers in layerConfig.
     * Starts and ends wmsTime when time layer is activated/deactivated
     * @param {Object} context the vuex context
     * @param {Object} context.commit the commit
     * @param {Object} context.state the state
     * @param {Object} context.rootGetters the rootGetters
     * @returns {void}
     */
    watchVisibleLayerConfig ({commit, state, rootGetters}) {
        rootGetters.visibleLayerConfigs.forEach(visLayer => {
            if (visLayer.typ === "WMS" && visLayer.time) {
                commit("setTimeSliderActive", {
                    active: true,
                    currentLayerId: visLayer.id,
                    playbackDelay: visLayer.time?.playbackDelay || 1
                });
                commit("setTimeSliderDefaultValue", {
                    currentLayerId: visLayer.id
                });
                commit("setVisibility", true);
            }
        });
        store.watch((_, getters) => getters.visibleLayerConfigs, layerConfig => {
            if (!state.timeSlider.active) {
                layerConfig.forEach(element => {
                    if (element.typ === "WMS" && element.time && !rootGetters["Modules/CompareMaps/active"]) {
                        commit("setTimeSliderActive", {
                            active: true,
                            currentLayerId: element.id,
                            playbackDelay: element.time?.playbackDelay || 1
                        });
                        commit("setTimeSliderDefaultValue", {
                            currentLayerId: element.id
                        });
                        commit("setVisibility", true);
                    }
                });
            }
            else if (state.timeSlider.active) {
                let currentLayerConf = rootGetters.layerConfigById(state.timeSlider.currentLayerId),
                    visLayerConf = layerConfig.find(layerConf => layerConf.id === currentLayerConf.id);

                if (rootGetters["Modules/LayerSwiper/targetLayer"]) {
                    currentLayerConf = rootGetters.layerConfigById(rootGetters["Modules/LayerSwiper/targetLayer"].get("id"));
                    visLayerConf = layerConfig.find(layerConf => layerConf.id === currentLayerConf.id);
                }
                if (!visLayerConf) {
                    commit("setTimeSliderActive", {
                        active: false,
                        currentLayerId: "",
                        objects: [],
                        playbackDelay: 1,
                        playing: false
                    });
                    commit("setVisibility", false);
                    commit("setTimeSliderDefaultValue", {
                        currentLayerId: ""
                    });
                }
            }
        }, {deep: true});
    },
    /**
     * Toggles the LayerSwiper.
     * If the LayerSwiper is deactivated, the second layer is deactivated and removed from the ModelList.
     * @param {Object} context the vuex context
     * @param {Object} context.commit the commit
     * @param {Object} context.state the state
     * @param {Object} context.dispatch the dispatch
     * @param {String} id Id of the Layer that should be toggled.
     * @returns {void}
     */
    async toggleSwiper ({commit, state, dispatch, rootGetters}, id) {
        commit("Modules/LayerSwiper/setActive", !rootGetters["Modules/LayerSwiper/active"], {root: true});

        const secondId = id.endsWith(state.layerAppendix) ? id : id + state.layerAppendix,
            layerId = rootGetters["Modules/LayerSwiper/active"] ? id : secondId,
            layer = layerCollection.getLayerById(layerId);

        if (rootGetters["Modules/LayerSwiper/active"]) {
            const {name, time, url, level, layers, version, parentId, gfiAttributes, featureCount} = layer.attributes;

            commit("Modules/LayerSwiper/setLayerSwiperSourceLayer", layer, {root: true});

            if (!layerCollection.getLayerById(secondId)) {
                await dispatch("addLayerToLayerConfig", {
                    layerConfig: {
                        id: secondId,
                        name: name + "_second",
                        showInLayerTree: true,
                        typ: "WMS",
                        type: "layer",
                        visibility: true,
                        time,
                        url,
                        level,
                        layers,
                        version,
                        parentId,
                        legendURL: "ignore",
                        gfiAttributes: gfiAttributes,
                        featureCount: featureCount
                    },
                    parentKey: treeSubjectsKey
                }, {root: true});
            }
            else {
                dispatch("replaceByIdInLayerConfig", {
                    layerConfigs: [{
                        id: secondId,
                        layer: {
                            id: secondId,
                            visibility: true,
                            showInLayerTree: true
                        }
                    }]
                }, {root: true});
            }

            commit("Modules/LayerSwiper/setLayerSwiperTargetLayer", layerCollection.getLayerById(secondId), {root: true});
        }
        else {

            // If the button of the "original" window is clicked, it is assumed, that the time value selected in the added window is desired to be further displayed.
            if (!id.endsWith(state.layerAppendix)) {
                const {TIME} = layer.getLayerSource().params_,
                    {transparency} = layer.attributes,
                    origLayer = layerCollection.getLayerById(id);

                origLayer.updateTime(id, TIME);

                dispatch("replaceByIdInLayerConfig", {
                    layerConfigs: [{
                        id: id,
                        layer: {
                            id: id,
                            transparency: transparency
                        }
                    }]
                }, {root: true});
                commit("setTimeSliderDefaultValue", TIME);
            }
            dispatch("replaceByIdInLayerConfig", {
                layerConfigs: [{
                    id: secondId,
                    layer: {
                        id: secondId,
                        visibility: false,
                        showInLayerTree: false
                    }
                }]
            }, {root: true});

            commit("Modules/LayerSwiper/setLayerSwiperSourceLayer", null, {root: true});
            commit("Modules/LayerSwiper/setLayerSwiperTargetLayer", null, {root: true});
        }
    }
};
