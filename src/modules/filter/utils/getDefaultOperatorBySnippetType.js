/**
 * Returns the default operator for the given data type.
 * @param {String} snippetType the snippet type
 * @param {Boolean} [hasDelimiterSet=false] true if a delimiter is set in config, false if not
 * @returns {String} the operator to use as default for the given dataType
 */
export function getDefaultOperatorBySnippetType (snippetType, hasDelimiterSet = false) {
    switch (snippetType) {
        case "checkbox":
            return "EQ";
        case "date":
            return "EQ";
        case "dateRange":
            return "INTERSECTS";
        case "dropdown":
            return hasDelimiterSet ? "IN" : "EQ";
        case "text":
            return "IN";
        case "slider":
            return "EQ";
        case "sliderRange":
            return "BETWEEN";
        default:
            return "EQ";
    }
}
