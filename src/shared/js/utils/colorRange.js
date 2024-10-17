import {convertHslToHex, convertHexToHSL, convertColor, isHexColorString} from "./convertColor";

/**
 * Generates a range of colors starting from a hex value
 * @param {String} hex the color in a hex string
 * @param {Number} rangeSize Number of colors to be generated
 * @returns {String[]} colors Array of colors
 */
function generateColorRange (startColor, rangeSize = 5) {
    const hexColor = isHexColorString(startColor);

    if (!hexColor) {
        console.warn("The start color to generate the color range from is not a hex value");
        return false;
    }

    /* eslint-disable one-var*/
    const hsl = convertHexToHSL(startColor),
        colors = [];

    for (let i = 0; i < rangeSize; i++) {
        const newHue = (hsl.h + i * (360 / rangeSize)) % 360,
            newColor = convertHslToHex(newHue, hsl.s, hsl.l);

        colors.push(newColor);
    }

    return colors;
}

/**
 * Generates lighter shades of a starting color based on a factor (normalized value)
 * @param {String} color the starting color in a hex string
 * @param {Number} factor
 * @returns {String} color the starting color, changed by the given factor
 */
function getLighterShade (color, factor) {
    const hexColor = isHexColorString(color);

    if (!hexColor) {
        console.warn("The start color to generate the color range from is not a hex value");
        return false;
    }

    let [r, g, b] = convertColor(color, "rgb");

    r = Math.min(255, Math.floor(r + (255 - r) * factor));
    g = Math.min(255, Math.floor(g + (255 - g) * factor));
    b = Math.min(255, Math.floor(b + (255 - b) * factor));

    return convertColor([r, g, b], "hex");
}

/**
 * Normalize the values in an array to a range of 0 to 1. The smallest value maps to 0, and the largest maps to 1.
 * @param {Array} values Array containing the values to be normalized
 * @returns {Number[]}  Array of normalized values
 */
function normalizeValues (values) {
    const min = Math.min(...values),
        max = Math.max(...values),
        numberCheck = values.filter(value => {
            return typeof value !== "number";
        });

    if (numberCheck.length > 0) {
        console.warn("The input values to be normalized are not numbers");
        return false;
    }

    return values.map(value => (value - min) / (max - min));
}

/**
 * Assign colors based on inverted normalized values.
 * By inverting the normalized value the highest value gets a factor of 0 (no lightning, which equals the starting color),
 * and the lowest value gets a factor of 1 (maximum lightning).
 * @param {Array} values Array containing values to which a color should be assigned to
 * @param {String} startColor color as hex from which lighter shades will be generated
 * @returns {String[]}  Array of colors ranging from a starting color to a light shade of this color
 */
function assignColors (values, startColor) {
    const colors = [],
        hexColor = isHexColorString(startColor);

    if (!hexColor) {
        console.warn("The start color to generate the color range from is not a hex value");
        return false;
    }

    if (values.length > 1) {
        const normalizedValues = normalizeValues(values);

        normalizedValues.forEach(value => {
            // Invert the normalized value so that the highest value gets the darkest color
            const invertedFactor = 1 - value,
                color = getLighterShade(startColor, invertedFactor);

            colors.push(color);
        });
    }
    else {
        colors.push(startColor);
    }

    return colors;
}

export {
    generateColorRange,
    assignColors,
    getLighterShade,
    normalizeValues
};
