/**
     * replaces the names of object keys with the values provided.
     * @param {Object} keysMap - keys mapping object
     * @param {Object} obj - the original object
     * @returns {Object} the renamed object
     */
export default function renameKeys (keysMap, obj) {
    return Object.keys(obj).reduce((acc, key) => {
        return {
            ...acc,
            ...{[keysMap[key] || key]: obj[key]}
        };
    },
    {});
}
