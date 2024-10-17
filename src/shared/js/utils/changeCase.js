/**
 * Uppercases the first letter of a given string.
 * @param {String} value A string to uppercase the first letter.
 * @returns {String} The same string, but with uppercased first letter.
 */
export function upperFirst (value) {
    if (typeof value !== "string") {
        return "";
    }

    return value.charAt(0).toUpperCase() + value.substring(1);
}

/**
 * Rewrites the keys of an object in upper case.
 * @param {Object} obj The object.
 * @returns {Object} The object with uppercase keys.
 */
export function upperCaseKeys (obj) {
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k.toUpperCase(), v])
    );
}

export default {
    upperCaseKeys,
    upperFirst
};
