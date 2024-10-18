/**
 * Creates a debounced version of a function. Useful for buffering user inputs such as mouse movements or text edits.
 * @param {Function} func - A function which should only be called if it is not called again within a specified amount of time.
 * @param {Object} [thisArg=this] - The this object to be made available for func.
 * @param {Number} [delay=50] - The time in milliseconds to be waited for before func is called.
 * @returns {Function} - A new function which is the debounced version of the passed one.
 */
export default function debounce (func, thisArg = this, delay = 50) {
    let timer;

    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(thisArg, args), delay);
    };
}
