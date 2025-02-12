let idCounter = 1;

/**
 * Generate a globally-unique id for client-side models or DOM elements that need one. If prefix is passed, the id will be appended to it.
 * @param {String} [prefix=""] prefix for the id
 * @returns {String}  a globally-unique id
 */
function uniqueId (prefix) {
    const localIdCounter = String(getIdCounter());

    incIdCounter();

    return prefix ? prefix + localIdCounter : localIdCounter;
}

/**
 * gets the current idCounter
 * @returns {Integer}  the current idCounter
 */
function getIdCounter () {
    return idCounter;
}

/**
 * Resets the idCounter back to 1.
 * @returns {void}
 */
function reset () {
    idCounter = 1;
}

/**
 * increments the idCounter
 * @post the static idCounter (Util.idCounter) is incremented by 1
 * @returns {void}
 */
function incIdCounter () {
    idCounter++;
}

module.exports = {
    uniqueId,
    reset
};
