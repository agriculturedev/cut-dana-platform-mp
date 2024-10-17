/**
 * Replaces all entries for a key of an object with the replacement if condition is true at object to replace.
 * - returns a simple array as a list of the replaced objects
 * - does not add values of an object that is already recognized and added by the given key
 * - does not recognize recursions within objects (e.g. a = [a]), lower maxDepth to prevent infinit loops earlier
 * @param {Object} obj the object to search
 * @param {*} searchKey the key to search for
 * @param {Object} replacement to replace
 * @param {Object} condition to compare with
 * @param {String} condition.key to compare with
 * @param {String} condition.value to compare with
 * @param {String} condition.replaceObject if filled with condition.value, the element ist totally replaced by replacement
 * @param {Number} [maxDepth=200] maximum number of self calls, default: 200
 * @returns {Array} the replaced objects
 */
function replaceInNestedValues (obj, searchKey, replacement, condition, maxDepth = 200) {
    if (typeof obj !== "object" || obj === null) {
        return [];
    }
    const result = [];

    replaceInNestedValuesHelper(obj, searchKey, maxDepth, result, 0, replacement, condition);
    return result;
}

/**
 * helper function for the recursion
 * @param {Object} obj the object to search
 * @param {*} searchKey the key to search for
 * @param {Number} maxDepth depth barrier
 * @param {Object|Array} result collection of already found values
 * @param {Number} depth current depth
 * @param {Object} replacement to replace
 * @param {Object} condition to compare with
 * @param {String} condition.key to compare with
 * @param {String} condition.value to compare with
 * @param {String} condition.replaceObject if filled with condition.value, the element ist totally replaced by replacement
 * @returns {void}
 */
function replaceInNestedValuesHelper (obj, searchKey, maxDepth, result, depth, replacement, condition) {
    if (typeof obj !== "object" || obj === null || depth >= maxDepth) {
        return;
    }

    Object.keys(obj).forEach(key => {
        if (key === searchKey) {
            if (obj[key][condition.key] === condition.value && obj[key] !== replacement) {
                obj[key] = replacement;
                result.push(replacement);
            }
            else if (Array.isArray(obj[key])) {
                obj[key].forEach((element, index) => {
                    if (element[condition.key] === condition.value && element !== replacement) {
                        if (condition.replaceObject === element[condition.key]) {
                            obj[key].splice(index, 1, ...replacement);
                            result.push(...replacement);
                        }
                        else {
                            Object.assign(element, replacement);
                            result.push(element);
                        }
                    }
                    else if (Array.isArray(element[searchKey])) {
                        replaceInNestedValuesHelper(element, searchKey, maxDepth, result, depth + 1, replacement, condition);
                    }
                });
            }
        }
        else {
            replaceInNestedValuesHelper(obj[key], searchKey, maxDepth, result, depth + 1, replacement, condition);
        }
    });
}

export default {replaceInNestedValues};
