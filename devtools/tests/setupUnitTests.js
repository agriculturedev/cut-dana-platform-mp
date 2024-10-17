const {config, enableAutoUnmount} = require("@vue/test-utils");
const canvas = require("canvas");
const sinon = require("sinon");

global.ResizeObserver = require("resize-observer-polyfill");

/**
 * Mock for web worker
 */
class Worker {
    /**
     * Constructor
     * @param {String} stringUrl a string representing the URL of the script the worker will execute
     * @returns {void} void
     */
    constructor (stringUrl) {
        this.url = stringUrl;
        this.onmessage = () => {
            // empty
        };
    }

    /**
     * Post message
     * @param {String} msg message
     * @returns {void} void
     */
    postMessage (msg) {
        this.onmessage(msg);
    }
}
global.Worker = Worker;

/**
 * Mock for MutationObserver
 */
class MutationObserver {
    /**
     * Constructor
     * @param {Object} args the args
     * @returns {void} void
     */
    constructor (args) {
        this.args = args;
    }
    /**
     * Fake function.
     * @returns {void}
     */
    disconnect () {
        this.args = null;
    }
    /**
     * Fake function.
     * @param {Object} toObserve to observe
     * @returns {void}
     */
    observe (toObserve) {
        this.args = toObserve;
    }
}
// a mock for MutationObserver
global.MutationObserver = MutationObserver;

// renderStubDefaultSlot: https://test-utils.vuejs.org/migration/#shallowmount-and-renderstubdefaultslot
config.global.renderStubDefaultSlot = true;
// global.SVGElement: @see https://github.com/vuejs/core/issues/3590
global.SVGElement = window.SVGElement;
global.CanvasPattern = canvas.CanvasPattern;

/**
 * EnableAutoUnmount allows to automatically destroy Vue wrappers.
 * No wrapper.destroy() is needed in each test.
 * Destroy logic is passed as callback to hook Function.
 */
enableAutoUnmount(afterEach);

// root hook to run after every test (even in other files)
afterEach(function () {
    sinon.restore();
});
