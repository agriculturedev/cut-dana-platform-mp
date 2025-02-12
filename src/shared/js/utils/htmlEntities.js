const decodingMap = {
    "&nbsp;": " ",
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": "\"",
    "&apos;": "'",
    "&ndash;": "-"
};

/**
 * Decode html entities from a string.
 * @returns {String} The decoded html string.
 */
export default function decodeHtmlEntites (text) {
    return text.replace(/&[\w#]+;/g, entity => {
        return decodingMap[entity] || entity;
    });
}
