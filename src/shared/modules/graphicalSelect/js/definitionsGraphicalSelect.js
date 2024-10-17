import Overlay from "ol/Overlay.js";

/**
     * @typedef {Object} definitionsGraphicalSelect
     * @description creates variables in order to keep out complex objects out from the state regarding performance issues.
     * @property {Object} drawInteraction=undefined the interaction to draw a square, circle or polygon
     * @property {ol.overlay} circleOverlay=new Overlay({offset: [15, 0], positioning: "center-left"}) circle overlay (tooltip) - shows the radius
     * @property {ol.overlay} tooltipOverlay=new Overlay({offset: [15, 20], positioning: "top-left"}) - shows the tooltip
     */

const circleOverlay = new Overlay({
        id: "circle-overlay",
        element: document.createElement("div"),
        offset: [15, 0],
        positioning: "center-left"
    }),
    tooltipOverlay = new Overlay({
        id: "tooltip-overlay",
        element: document.createElement("div"),
        offset: [15, 20],
        positioning: "top-left"
    });

let drawInteraction;

export default {circleOverlay, tooltipOverlay, drawInteraction};
