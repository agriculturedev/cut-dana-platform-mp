const badPathSymbol = Symbol("Path could not be resolved.");

/**
 * Utility function (idx) for traversing the given path of the given object
 * to retrieve data.
 * Inspired by https://medium.com/javascript-inside/safely-accessing-deeply-nested-values-in-javascript-99bf72a0855a.
 *
 * @param {Object} object The object to traverse.
 * @param {String[]} path The path of keys / indices to traverse through the object.
 * @returns {?*} The value(s) to be retrieved from the given object.
 */
function idx (object, path) {
    return path.reduce(
        (acc, currentVal) => {
            return acc && Object.prototype.hasOwnProperty.call(acc, currentVal) ? acc[currentVal] : badPathSymbol;
        },
        object
    );
}

// TODO: Change export back to ES-Syntax when surrounding configuration is settled
module.exports = {
    badPathSymbol,
    idx
};
