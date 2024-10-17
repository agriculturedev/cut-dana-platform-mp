/**
 * Converts a json structure to raw post data targeting phps $_POST handling.
 * example: axios.post(url, convertJsonToPost(data)).then(response => { ... });
 */

/**
 * converts json data to raw post data used for a natural post handling through server
 * @param {Object} jsondata the data to convert
 * @param {String} [struct=""] (for recursion) leading structure: leave empty
 * @return {String} a string to use as raw data for a post request
 */
export default function convertJsonToPost (jsondata, struct = "") {
    if (typeof jsondata !== "object" || jsondata === null) {
        return (struct ? encodeURIComponent(struct) + "=" : "") + encodeURIComponent(jsondata);
    }
    let result = "";

    Object.keys(jsondata).forEach(key => {
        if (result) {
            result += "&";
        }
        result += convertJsonToPost(jsondata[key], struct ? struct + "[" + key + "]" : key);
    });
    return result;
}
