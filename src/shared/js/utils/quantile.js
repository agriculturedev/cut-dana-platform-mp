/**
 * Calculates the p-quantile of a sorted sample.
 * @param {Number[]} sample - The sorted sample. MUST be sorted to calculate correct result.
 * @param {Number} p - A number 0 < p < 1 which defines the quantile.
 * @returns {Number} - The result.
 */
export default function quantile (sample, p) {
    if (!Array.isArray(sample)
        || sample.length < 1
        || typeof p !== "number"
        || p <= 0
        || p >= 1
    ) {
        return undefined;
    }

    const n = sample.length,
        nTimesP = n * p;

    if (Number.isInteger(nTimesP)) {
        return (sample[nTimesP - 1] + sample[nTimesP]) / 2;
    }

    return sample[Math.floor(nTimesP)];
}
