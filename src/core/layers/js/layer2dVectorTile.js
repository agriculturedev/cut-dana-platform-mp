import axios from "axios";
import {vectorTile} from "@masterportal/masterportalapi";

import store from "../../../app-store";
import webgl from "./webglRenderer";
import Layer2d from "./layer2d";

/**
 * Creates a 2d vector tile layer.
 * @name Layer2dVectorTile
 * @constructs
 * @extends Layer2d
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
export default function Layer2dVectorTile (attributes) {
    const defaultAttributes = {
        selectedStyleID: undefined,
        useMpFonts: true
    };

    this.attributes = Object.assign(defaultAttributes, attributes);
    Layer2d.call(this, this.attributes);
    // override class methods for webgl rendering
    // has to happen before setStyle
    if (attributes.renderer === "webgl") {
        webgl.setLayerProperties(this);
    }

    this.checkProjection();

    this.setConfiguredLayerStyle();
}

Layer2dVectorTile.prototype = Object.create(Layer2d.prototype);

/**
 * Creates a layer of type WFS by using wfs-layer of the masterportalapi.
 * Sets all needed attributes at the layer and the layer source.
 * Also register a listener on the map which is triggert if all feauters
 * in current extent are loaded. This will fire a 'featuresloadend' event.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void}
 */
Layer2dVectorTile.prototype.createLayer = function (attributes) {
    const rawLayerAttributes = this.getRawLayerAttributes(attributes),
        layerParams = this.getLayerParams(attributes);

    this.setLayer(vectorTile.createLayer(rawLayerAttributes, {layerParams}));
    store.dispatch("Maps/registerListener", {type: "loadend", listener: () => {
        if (typeof this.layer.getSource !== "function" || typeof this.layer.getSource()?.getFeaturesInExtent !== "function") {
            return;
        }
        const features = this.layer.getSource().getFeaturesInExtent(store.getters["Maps/extent"]);

        this.layer.getSource().dispatchEvent({
            type: "featuresloadend",
            features: features
        });
    }});
};

/**
 * Gets raw layer attributes from attributes.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {Object} The raw layer attributes.
 */
Layer2dVectorTile.prototype.getRawLayerAttributes = function (attributes) {
    return attributes;
};

/**
 * Gets additional layer params.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {Object} The layer params.
 */
Layer2dVectorTile.prototype.getLayerParams = function (attributes) {
    return {
        gfiAttributes: attributes.gfiAttributes,
        opacity: (100 - attributes.transparency) / 100,
        zIndex: attributes.zIndex,
        renderer: attributes.renderer, // use "default" (canvas) or "webgl" renderer
        styleId: attributes.styleId, // styleId to pass to masterportalapi
        style: attributes.style, // style function to style the layer or WebGLPoints style syntax
        excludeTypesFromParsing: attributes.excludeTypesFromParsing, // types that should not be parsed from strings, only necessary for webgl
        isPointLayer: attributes.isPointLayer // whether the source will only hold point data, only necessary for webgl
    };
};

/**
 * Checks if the EPSG code of the map and the service are the same.
 * @param {Object} attributes The attributes of the layer configuration.
 * @returns {void} The layer params.
 */
Layer2dVectorTile.prototype.checkProjection = function (attributes) {
    const mapEPSG = this.get("crs"),
        vtEPSG = attributes?.epsg || mapEPSG;

    if (mapEPSG !== vtEPSG) {
        console.warn(
            `VT Layer ${attributes.name}: Map (${mapEPSG}) and layer
            (${vtEPSG}) projection mismatch. View will be erroneous.`
        );
    }
};

/**
 * Initially reads style information in this order:
 *     1. If field styleId in config.json, use style from services.json with that id
 *     2. If services.json has a style marked with field "defaultStyle" to true, use that style
 *     3. If neither is available, use the first style in the services.json
 *     4. If none defined, OL default style will be used implicitly
 * @returns {void}
 */
Layer2dVectorTile.prototype.setConfiguredLayerStyle = function () {
    let stylingPromise;

    if (this.get("styleId") && this.get("styleId") !== "default") {
        this.set("selectedStyleID", this.get("styleId"));
        stylingPromise = this.setStyleById(this.get("styleId"));
    }
    else {

        if (typeof this.get("vtStyles") !== "undefined") {
            const style = this.get("vtStyles").find(({defaultStyle}) => defaultStyle) || this.get("vtStyles")[0];

            if (typeof style !== "undefined") {
                this.set("selectedStyleID", style.id);
                stylingPromise = this.setStyleByDefinition(style);
            }
        }
        if (!stylingPromise) {
            console.warn(`Rendering VT layer ${this.get("name")} without style; falls back to OL default styles.`);
            return;
        }
    }

    if (stylingPromise) {
        stylingPromise
            .then(() => this.layer?.setVisible(this.get("visibility")))
            .catch(err => console.error(err));
    }
};

/**
* Fetches a style defined for this layer in the services file.
* @param {String} styleID id of style as defined in services.json
* @returns {Promise} resolves void after style was set; may reject if no style found or received style invalid
*/
Layer2dVectorTile.prototype.setStyleById = function (styleID) {
    const styleDefinition = this.get("vtStyles")?.find(({id}) => id === styleID);

    if (!styleDefinition) {
        return Promise.reject(`No style found with ID ${styleID} for layer ${this.get("name")}.`);
    }

    return this.setStyleByDefinition(styleDefinition);
};

/**
 * Loads a style from a style definition's URL and sets it to be active.
 * @param {Object} styleDefinition style definition as found in service.json file
 * @param {String} styleDefinition.url url where style is kept
 * @param {String} styleDefinition.id id of style
 * @param {Number[]} [styleDefinition.resolutions] resolutions to style zoom levels mapping
 * @returns {Promise} resolves void after style was set; may reject if received style is invalid
 */
Layer2dVectorTile.prototype.setStyleByDefinition = function ({id, url, resolutions}) {
    return axios.get(url)
        .then(response => response.data)
        .then(style => {
            let spriteUrl, spriteDataUrl, spriteImageUrl, addMpFonts;

            // check if style is defined and required fields exist
            if (!this.isStyleValid(style)) {
                throw new Error(
                    `Style set for VT layer is incomplete. Must feature layers, sources, and version. Received: "${JSON.stringify(style)}"`
                );
            }

            if (this.get("useMpFonts")) {
                addMpFonts = this.addMpFonts;
            }

            if (style.sprite) {
                spriteUrl = style.sprite;

                // support relative spriteUrls
                if (spriteUrl.includes("./")) {
                    spriteUrl = new URL(spriteUrl, url);
                }

                spriteDataUrl = spriteUrl.toString().concat(".json");
                spriteImageUrl = spriteUrl.toString().concat(".png");

                this.fetchSpriteData(spriteDataUrl)
                    .then(spriteData => {
                        vectorTile.setStyle(this.getLayer(), style, {options: {resolutions: resolutions, spriteData: spriteData, spriteImageUrl: spriteImageUrl, getFonts: addMpFonts}}, url);
                        this.set("selectedStyleID", id);
                    });
            }
            else {
                vectorTile.setStyle(this.getLayer(), style, {resolutions: resolutions, getFonts: addMpFonts}, url);
                this.set("selectedStyleID", id);
            }
        });
};

/**
 * Changes fontstack of VT-Style to MP-font if configured.
 * @param {String[]} fontstack text-font as found in VT-Style
 * @returns {String[]} returns relevant MP-font
 */
Layer2dVectorTile.prototype.addMpFonts = function (fontstack) {
    if (fontstack.includes("Bold") | fontstack.includes("bold")) {
        return "MasterPortalFont Bold";
    }
    else if (fontstack.includes("Italic") | fontstack.includes("italic")) {
        return "MasterPortalFont Italic";
    }
    return "MasterPortalFont";
};

/**
 * Checks required fields of a style for presence.
 * @param {Object} style style object as fetched from a remote url
 * @returns {Boolean} true if all expected fields at least exist
 */
Layer2dVectorTile.prototype.isStyleValid = function (style) {
    return Boolean(style) &&
        Boolean(style.layers) &&
        Boolean(style.sources) &&
        Boolean(style.version);
};

/**
 * Fetches SpriteData Object
 * @param {String} spriteUrl url to spriteData as found in StyleDefinition
 * @returns {Object} spriteData
 */
Layer2dVectorTile.prototype.fetchSpriteData = function (spriteUrl) {
    return axios.get(spriteUrl)
        .then(resp => resp.data);
};

/**
 * Shows the features by given features properties.
 * @param {Array|Object} properties - The keys of the object are the properties (as json string) of the features to be displayed.
 * @returns {void}
 */
Layer2dVectorTile.prototype.showFeaturesByIds = function (properties) {
    if (Array.isArray(properties)) {
        if (this.getLayer().get("basicInitialStyle")) {
            this.getLayer().setStyle(this.getLayer().get("basicInitialStyle"));
        }
        return;
    }

    if (!this.getLayer().get("basicInitialStyle")) {
        this.getLayer().set("basicInitialStyle", this.getLayer().getStyle());
    }

    const defaultStyle = this.getLayer().getStyle();

    this.getLayer().setStyle((feature, resolution) => {
        if (properties[JSON.stringify(feature.getProperties())]) {
            return defaultStyle(feature, resolution);
        }
        return null;
    });
};
