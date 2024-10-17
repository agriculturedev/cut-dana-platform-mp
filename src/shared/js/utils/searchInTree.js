/**
 * Searches in tree structure for elements with key and value and returns all of them.
 * @param {Object} element root element to search under
 * @param {String} childKey name of key for children
 * @param {String} key to search for
 * @param {*} value value to collect
 * @returns {Array} elements with key and value
 */
export default function searchInTree (element, childKey, key, value) {
    const result = [];

    if (element) {
        search(result, element, childKey, key, value);
    }
    return result;
}

/**
 * Collects recursive all elements with key and value.
 * @param {Array} result to store found elements in
 * @param {Object} element root element to search under
 * @param {String} childKey name of key for children
 * @param {String} key to search for
 * @param {*} value value to collect
 * @returns {void}
 */
function search (result, element, childKey, key, value) {

    if (element[key] === value) {
        result.push(element);
    }
    if (Array.isArray(element[childKey])) {
        for (let i = 0; i < element[childKey].length; i++) {
            search(result, element[childKey][i], childKey, key, value);
        }
    }
}
