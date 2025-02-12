import processUrlParams from "../../../shared/js/utils/processUrlParams";
import store from "../../../app-store";

/**
 * Here the urlParams for the layers are processed.
 *
 * Examples:
 * - https://localhost:9001/portal/master/?LAYERS=[{%22id%22:%222426%22},{%22id%22:%221711%22,%22visibility%22:false},{%22id%22:%22452%22,%22visibility%22:true,%22transparency%22:50}]
 * - https://localhost:9001/portal/master/?Map/layerIds=452,1711&visibility=true,false&transparency=50,0
 * - https://localhost:9001/portal/master/?mdid=F35EAC11-C236-429F-B1BF-751C0C18E8B7
 * - https://localhost:9001/portal/master/?mdid=F35EAC11-C236-429F-B1BF-751C0C18E8B7,C1AC42B2-C104-45B8-91F9-DA14C3C88A1F
 */

const layerUrlParams = {
        LAYERS: setLayers,
        MDID: setLayersByMetadataId
    },
    legacyLayerUrlParams = {
        LAYERIDS: setLayerIds,
        "MAP/LAYERIDS": setLayerIds,
        "MAP/MDID": setLayersByMetadataId,
        TRANSPARENCY: setLayerIds,
        VISIBILITY: setLayerIds
    };

/**
 * Process the menu url params.
 * @returns {void}
 */
function processLayerUrlParams () {
    processUrlParams(layerUrlParams, legacyLayerUrlParams);
}

/**
 * Sets the layers.
 * @param {Object} params The found params.
 * @returns {void}
 */
function setLayers (params) {
    const layers = JSON.parse(params.LAYERS);

    removeCurrentLayerFromLayerTree();
    addLayerToLayerTree(layers);
}

/**
 * Sets the layer ids.
 * If an id of a grouped baselayer is contained, the id is replaced by id of the group.
 * @param {Object} params The found params.
 * @returns {void}
 */
function setLayerIds (params) {
    const layerIds = (params.LAYERIDS || params["MAP/LAYERIDS"])?.split(","),
        transparency = params.TRANSPARENCY?.split(","),
        visibility = params.VISIBILITY?.split(",").map(value => value !== "false"),
        groupLayerConfigs = store.getters.layerConfigsByAttributes({baselayer: true, typ: "GROUP"});
    let layers = [];

    [...layerIds].forEach((layerId, index) => {
        const group = groupLayerConfigs.find(groupConfig => groupConfig.id.split("-").indexOf(layerId) > -1);

        if (group) {
            layerIds.splice(index, 1, group.id);
        }
    });

    layers = layerIds.map((id, index) => {
        return {
            id: id,
            visibility: visibility ? visibility[index] : true,
            transparency: transparency ? transparency[index] : 0
        };
    });

    if (!((params.MDID || params["MAP/MDID"]) && (params["MAP/LAYERIDS"] || params.LAYERIDS))) {
        removeCurrentLayerFromLayerTree();
    }
    addLayerToLayerTree(layers);
}

/**
 * Sets layers by metadata id.
 * @param {Object} params The found params.
 * @returns {void}
 */
function setLayersByMetadataId (params) {
    const layerMetadataIds = (params.MDID || params["MAP/MDID"]).split(","),
        baselayer = store.getters.layerConfigsByAttributes({baselayer: true})?.at(-1),
        layers = [{
            id: baselayer.id
        }];

    store.getters.allLayerConfigs.forEach(layerConfig => {
        layerConfig?.datasets?.forEach(dataset => {
            if (layerMetadataIds.includes(dataset.md_id)) {
                layers.push({
                    id: layerConfig.id
                });
            }
        });
    });

    removeCurrentLayerFromLayerTree();
    addLayerToLayerTree(layers);
}

/**
 * Remove the current layers from layer tree.
 * @returns {void}
 */
function removeCurrentLayerFromLayerTree () {
    const currentLayerConfigs = store.getters.layerConfigsByAttributes({showInLayerTree: true}),
        currentLayerIds = currentLayerConfigs.map(layer => layer.id);

    currentLayerIds.forEach(layerId => {
        store.dispatch("replaceByIdInLayerConfig", {
            layerConfigs: [{
                id: layerId,
                layer: {
                    id: layerId,
                    showInLayerTree: false,
                    visibility: false
                }
            }]
        });
    });
}

/**
 * Add the layers to layer tree.
 * @param {String[]} layers The layers.
 * @returns {void}
 */
function addLayerToLayerTree (layers) {
    layers.forEach((layer, index) => {
        store.dispatch("addOrReplaceLayer", {
            layerId: layer.id,
            visibility: typeof layer.visibility === "boolean" ? layer.visibility : true,
            transparency: layer.transparency || 0,
            showInLayerTree: true,
            zIndex: index
        },
        {root: true}).then((success) => {
            if (!success) {
                store.dispatch("Alerting/addSingleAlert", {
                    content: i18next.t("common:core.layers.urlParamWarning", {layerId: layer.id}),
                    category: "warning"
                });
            }
        });
    });
}

export default {
    processLayerUrlParams,
    setLayers,
    setLayerIds,
    setLayersByMetadataId,
    removeCurrentLayerFromLayerTree,
    addLayerToLayerTree
};
