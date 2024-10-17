/**
 * Calculates the center point of the given extent.
 *
 * @param {Number[]} extent An extent.
 * @returns {Number[]} Center of the given extent.
 */
export default function (extent) {
    return [
        extent[0] + ((extent[2] - extent[0]) / 2),
        extent[1] + ((extent[3] - extent[1]) / 2)
    ];
}
