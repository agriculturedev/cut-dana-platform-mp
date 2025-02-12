import {Tileset} from "@masterportal/masterportalapi/src";
import Layer3d from "./layer3d";
import layerCollection from "./layerCollection";

/**
 * Creates a 3d layer tileset and adds event listener to tileset.tileVisible to hide hidden features.
 * @name Layer3dTileset
 * @abstract
 * @constructs
 * @extends Layer
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
export default function Layer3dTileset (attributes) {
    const defaultAttributes = {
        cesium3DTilesetDefaults: {
            maximumScreenSpaceError: "6"
        },
        transparency: 0
    };

    this.hiddenObjects = {};
    this.lastUpdatedSymbol = Symbol("_lastUpdated");
    this.attributes = Object.assign(defaultAttributes, attributes);
    Layer3d.call(this, this.attributes);
    this.setFeatureVisibilityLastUpdated(Date.now());
    if (this.attributes.hiddenFeatures && this.attributes.visibility === true) {
        this.addToHiddenObjects(this.attributes.hiddenFeatures);
    }
    this.layer.tileset?.then(tileset => tileset.tileVisible?.addEventListener(this.applyStyle.bind(this)));
}

Layer3dTileset.prototype = Object.create(Layer3d.prototype);

/**
 * Creates a layer of type tileset by using tileset-layer of the masterportalapi.
 * Sets all needed attributes at the layer and the layer source.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
Layer3dTileset.prototype.createLayer = function (attributes) {
    this.setLayer(new Tileset(attributes));
    this.setOpacity(attributes.transparency);
    this.setVisible(attributes.visibility, mapCollection.getMap("3D"));
};

/**
 * Calls masterportalAPI's layer to set this layer opacity.
 * @param {Object} [transparency=0] The transparency.
 * @returns {void}
 */
Layer3dTileset.prototype.setOpacity = function (transparency = 0) {
    this.getLayer()?.setOpacity((100 - transparency) / 100);
};

/**
 * Calls masterportalAPI's tilset-layer to set this layer visible.
 * Shows hidden objects if visibility is set to false.
 * @param {Boolean} visibility visibility of the layer
 * @param {Cesium} map The 3d map.
 * @returns {void}
 */
Layer3dTileset.prototype.setVisible = function (visibility, map) {
    this.getLayer()?.setVisible(visibility, map);
    // this.setFeatureVisibilityLastUpdated(Date.now());
    if (visibility) {
        this.createLegend();
    }
    if (visibility === false && this.attributes.hiddenFeatures) {
        this.showObjects(this.attributes.hiddenFeatures);
    }
};


/**
 * Sets values to the cesium layer.
 * @param {Object} attributes The new attributes.
 * @returns {void}
 */
Layer3dTileset.prototype.updateLayerValues = function (attributes) {
    if (this.get("visibility") !== attributes.visibility) {
        this.setVisible(attributes.visibility, mapCollection.getMap("3D"));
    }
    this.setOpacity(attributes.transparency);
};

/**
 * Adds the ids to hide to the hidden objects.
 * @param {Array} toHide A list of Object Ids which will be hidden.
 * @param {Boolean} allLayers if true, updates all layers.
 * @return {void}
 */
Layer3dTileset.prototype.addToHiddenObjects = function (toHide, allLayers = false) {
    let updateLayer = allLayers;

    toHide.forEach((id) => {
        if (!this.hiddenObjects[id]) {
            this.hiddenObjects[id] = new Set();
            updateLayer = true;
        }
    });
    if (updateLayer) {
        this.setFeatureVisibilityLastUpdated(Date.now());
    }
};

/**
 * Show a number of objects.
 * @param {Array} unHide A list of Object Ids which will be unHidden.
 * @return {void}
 */
Layer3dTileset.prototype.showObjects = function (unHide) {
    unHide.forEach((id) => {
        if (this.hiddenObjects[id]) {
            this.hiddenObjects[id].forEach((feature) => {
                if (feature instanceof Cesium.Cesium3DTileFeature || feature instanceof Cesium.Cesium3DTilePointFeature) {
                    if (this.featureExists(feature)) {
                        feature.show = true;
                    }
                }
            });
            delete this.hiddenObjects[id];
        }
    });
};

/**
 * Checks if a feature is still valid and not already destroyed.
 * @param {Cesium.Cesium3DTileFeature|Cesium.Cesium3DTilePointFeature} feature Cesium feature.
 * @return {Boolean} Feature exists
 */
Layer3dTileset.prototype.featureExists = function (feature) {
    return feature &&
        feature.content &&
        !feature.content.isDestroyed() &&
        !feature.content.batchTable.isDestroyed();
};

/**
 * Is called if a tile visibility event is called from the cesium tileset. Checks for Content Type and calls styleContent.
 * @param {Tile} tile CesiumTile
 * @returns {void}
 */
Layer3dTileset.prototype.applyStyle = function (tile) {
    if (tile.content instanceof Cesium.Composite3DTileContent) {
        for (let i = 0; i < tile.content.innerContents.length; i++) {
            this.styleContent(tile.content.innerContents[i]);
        }
    }
    else {
        this.styleContent(tile.content);
    }
};

/**
 * Updates the list of hiddenFeatures with hidden features of all visibile layers.
 * @returns {void}
 */
Layer3dTileset.prototype.updateHiddenFeatureList = function () {
    const visibleTilesetLayer = layerCollection.getLayers().filter(layer => layer.get("typ") === "TileSet3D");
    let allHiddenFeatures = [];

    visibleTilesetLayer.forEach(tileSetLayer => {
        const hd = tileSetLayer.get("hiddenFeatures");

        allHiddenFeatures = allHiddenFeatures.concat(hd || []);
    });
    visibleTilesetLayer.forEach(tileSetLayer => tileSetLayer.addToHiddenObjects(allHiddenFeatures, true));
};

/**
 * Hides features of hidden objects.
 * @param {Cesium.Cesium3DTileContent} content The content for Tile.
 * @return {void}
 */
Layer3dTileset.prototype.styleContent = function (content) {
    if (this.get("hiddenFeatures")) {
        this.updateHiddenFeatureList();
    }
    if (!content[this.lastUpdatedSymbol] || content[this.lastUpdatedSymbol] < this.get("featureVisibilityLastUpdated")) {
        const batchSize = content.featuresLength;

        for (let batchId = 0; batchId < batchSize; batchId++) {
            const feature = content.getFeature(batchId);

            if (feature) {
                let id = feature.getProperty("id");

                if (!id) {
                    id = `${content.url}${batchId}`;
                }
                if (this.hiddenObjects[id]) {
                    this.hiddenObjects[id].add(feature);
                    feature.show = false;
                }
            }
        }
        content[this.lastUpdatedSymbol] = Date.now();
    }
};

/**
 * Setter for featureVisibilityLastUpdated.
 * @param {Date} value featureVisibilityLastUpdated
 * @returns {void}
 */
Layer3dTileset.prototype.setFeatureVisibilityLastUpdated = function (value) {
    this.set("featureVisibilityLastUpdated", value);
};

