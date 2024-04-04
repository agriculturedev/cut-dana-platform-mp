import Overlay from "ol/Overlay";
import thousandsSeparator from "../../../../../utils/thousandsSeparator";
import * as setters from "../../store/actions/settersDraw";
import {getArea, getLength} from "ol/sphere.js";

/**
 * returns the Feature to use as mouse label on change of circle, double circle, line, area and square
 * @param {Object} context context object for actions, getters and setters.
 * @param {String} projection projection of the map
 *
 * @returns {module:ol/Overlay} the Feature to use as mouse label
 */
function createTooltipOverlay ({state, getters, commit, dispatch}, projection) {
    let tooltip = null;
    const decimalsForKilometers = 3,
        autoUnit = false,
        {styleSettings} = getters,
        element = document.createElement("div"),
        factory = {
            mapPointerMoveEvent: evt => {
                tooltip.setPosition(evt.coordinate);
            },
            featureChangeEvent: evt => {
                let value = null,
                    addSquare = "";

                if (state?.drawType?.id === "drawCircle" || state?.drawType?.id === "drawDoubleCircle") {
                    value = evt.target.getRadius();
                }
                else if (state?.drawType?.id === "drawSquare" || state?.drawType?.id === "drawArea") {
                    value = getArea(evt.target, {projection});
                    addSquare = "²";
                }
                else if (state?.drawType?.id === "drawLine") {
                    value = getLength(evt.target, {projection});
                }

                if (autoUnit && value > 500 || !autoUnit && styleSettings.unit === "km") {
                    tooltip.getElement().innerHTML = (value / 1000000).toFixed(decimalsForKilometers) + " km" + addSquare;
                }
                else {
                    tooltip.getElement().innerHTML = thousandsSeparator(Math.round(value)) + " m" + addSquare;
                }
                setters.setArea({getters, commit, dispatch}, Math.round(value));

                updateCalculations({state, getters, commit, dispatch}, value);
            }
        };

    element.className = "ol-tooltip ol-tooltip-measure";

    if (styleSettings?.tooltipStyle && Object.keys(styleSettings.tooltipStyle).length !== 0) {
        Object.keys(styleSettings.tooltipStyle).forEach(key => {
            element.style[key] = styleSettings.tooltipStyle[key];
        });
    }

    tooltip = new Overlay({
        element,
        offset: [0, -15],
        positioning: "bottom-center"
    });

    tooltip.set("mapPointerMoveEvent", factory.mapPointerMoveEvent);
    tooltip.set("featureChangeEvent", factory.featureChangeEvent);

    return tooltip;
}

/**
 * Updates the calculations for radius, area or length of a feature.
 * @param {Object} context context object for actions, getters and setters.
 * @param {Number} value value of radius or area.
 * @returns {module:ol/Overlay} the Feature to use as mouse label
 */
function updateCalculations ({state, getters, commit, dispatch}, value) {
    if (state?.drawType?.id === "drawCircle" || state?.drawType?.id === "drawDoubleCircle") {
        setters.setCircleRadius({getters, commit, dispatch}, Math.round(value));
    }
    else if (state?.drawType?.id === "drawSquare") {
        setters.setSquareArea({getters, commit, dispatch}, Math.round(value));
    }
    else if (state?.drawType?.id === "drawArea") {
        setters.setArea({getters, commit, dispatch}, Math.round(value));
    }
    else if (state?.drawType?.id === "drawLine") {
        setters.setLength({getters, commit, dispatch}, Math.round(value));
    }
}

export default createTooltipOverlay;
