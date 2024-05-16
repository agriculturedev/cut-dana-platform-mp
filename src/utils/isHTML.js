
/**
 * Checks if a possible html string has the same open and close tags.
 * @param {String} htmlString string to check.
 * @returns {Boolean} True if the input has the same open and close tags.
 */
function hasOpenAndCloseTags (htmlString) {

    if (!htmlString) {
        return false;
    }
    const tags = htmlString.match(/<\/?[^>]+(>|$)/g),
        selfClosingTags = ["br", "img", "input", "meta", "link", "hr", "base", "col", "command", "embed", "keygen", "param", "source", "track", "wbr"];

    if (tags) {
        const openTags = tags.filter(tag => {
                const tagName = tag.slice(1, -1);

                return !tag.startsWith("</") && !selfClosingTags.includes(tagName) && !tagName.endsWith("/");
            }),
            closeTags = tags.filter(tag => tag.startsWith("</"));

        if (openTags.length !== closeTags.length) {
            return false;
        }
    }
    return true;

}
/**
 * Checks if a html string includes elements that might hint to an XSS attack.
 * This method is used to assess a possible threat.
 * @param {String} htmlString - The string to check for harmful elements.
 * @returns {Boolean} True if the input includes elements that could be used in a harmful way.
 */
function hasHarmfulElements (htmlString) {
    const hasScriptTag = (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi).test(htmlString),
        hasEventHandler = (/onerror|onload|onclick|onchange|onmouseover|onmouseout|onkeydown|onkeyup|onkeypress/gi).test(htmlString);

    if (hasScriptTag || hasEventHandler) {
        return true;
    }
    return false;
}

/**
 * Checks if a value is a valid html by checking if it has the right data type,
 * has fitting open and close tags, does not include harmful elements and does not parse with errors.
 * @param {string} value The value to check.
 * @example ```<tag/>```
 * @returns {boolean} True if the input is a valid html without harmful elements.
 */
export function isHTML (value) {
    const hasTags = (/<\/?[a-z][\s\S]*>/i).test(value);

    if (
        !value
        || typeof value !== "string"
        || !hasOpenAndCloseTags(value)
        || hasHarmfulElements(value)
        || !hasTags
    ) {
        return false;
    }
    return true;
}

export default {isHTML};
