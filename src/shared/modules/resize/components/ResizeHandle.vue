<script>
// Signs for calculating the position after resize
const handleSigns = {
    topLeft: [-1, -1],
    top: [0, -1],
    topRight: [1, -1],
    right: [1, 0],
    bottomRight: [1, 1],
    bottom: [0, 1],
    bottomLeft: [-1, 1],
    left: [-1, 0]
};

/**
 * Checks whether the given values is a Number and is between 0 and 1.
 *
 * @param {*} val Value given for any of the dimension props.
 * @returns {Boolean} Whether the given value is between 0 and 1.
 */
function dimensionValidator (val) {
    return !isNaN(val) && typeof val === "number"
        && val >= 0 && val <= 1;
}

export default {
    name: "ResizeHandle",
    props: {
        /**
         * Size of the grid for snappy resizing.
         */
        grid: {
            type: Number,
            default: 1
        },
        /**
         * Position of the handle element.
         */
        handlePosition: {
            type: String,
            default: "bottomLeft",
            validator: value => ["topLeft", "top", "topRight", "right", "bottomRight", "bottom", "bottomLeft", "left"].includes(value)
        },
        minHeight: {
            type: Number,
            default: 0,
            validator: dimensionValidator
        },
        maxHeight: {
            type: Number,
            default: 1,
            validator: dimensionValidator
        },
        minWidth: {
            type: Number,
            default: 0,
            validator: dimensionValidator
        },
        maxWidth: {
            type: Number,
            default: 1,
            validator: dimensionValidator
        },
        /**
         * Determines whether the resize should be symmetrical based on the elements center point.
         */
        symmetricResize: {
            type: Boolean,
            default: false
        },
        /**
         * Draggable element given directly.
         */
        targetElement: {
            type: String,
            default: ""
        },
        /**
         * Query Selector looking upwards for the resizable element.
         */
        targetSelector: {
            type: String,
            default: "parentNode"
        }
    },
    emits: ["endResizing", "leftScreen", "resizing", "startResizing"],
    data: () => ({
        deltaCursorPosition: {x: 0, y: 0}, // Cursor position difference during resizing, modified by rotation
        initialCursorPosition: {x: 0, y: 0},
        isResizing: false,
        initialDimensions: {width: 0, height: 0},
        initialPosition: {top: 0, left: 0},
        initialRotation: 0,
        touchStarted: false, // Flag to avoid ghost click event
        touchDevice: false,
        timeoutReference: null
    }),
    computed: {
        /**
         * Calculates a dynamic CSS class based on the elements' rotation.
         * @returns {String} Dynamic CSS class for the handle element.
         */
        cursorClass () {
            const indexWithoutRotation = Object.keys(handleSigns).indexOf(this.handlePosition),
                indexAfterRotation = Math.floor(Math.abs(this.initialRotation + Math.PI / 8) / (Math.PI / 4));

            return [
                "nwse-resize",
                "ns-resize",
                "nesw-resize",
                "ew-resize"
            ][(indexWithoutRotation + indexAfterRotation) % 4];
        },
        /**
         * @returns {Object} All relevant data for events.
         */
        eventData () {
            return {
                cursorClass: this.cursorClass,
                deltaCursorPosition: this.deltaCursorPosition,
                grid: this.grid,
                handleElement: this.handleElement,
                handlePosition: this.handlePosition,
                initialCursorPosition: this.initialCursorPosition,
                initialDimensions: this.initialDimensions,
                initialPosition: this.initialPosition,
                initialRotation: this.initialRotation,
                minHeight: this.minHeight,
                maxHeight: this.maxHeight,
                minWidth: this.minWidth,
                maxWidth: this.maxWidth,
                symmetricResize: this.symmetricResize
            };
        },
        /**
         * @returns {HTMLElement | null} Resizable DOM element, if found.
         */
        handleElement () {
            if (this.targetElement !== "") {
                return document.querySelector(this.targetElement);
            }
            if (this.targetSelector === "parentNode") {
                return this.$el.parentNode;
            }
            const element = this.$el.closest(this.targetSelector);

            if (element === null) {
                console.warn("ResizeHandle: No target element found. Please verify your markup and selector. Currently defined target element selector:", this.targetSelector);
            }
            return element;
        },
        resizeEventNames () {
            return this.touchDevice
                ? {move: "touchmove", end: "touchend"}
                : {move: "mousemove", end: "mouseup"};
        }
    },
    watch: {
        /**
         * Adds or removes event listeners related to resizing.
         * @param {Boolean} newValue New value of isResizing.
         * @returns {void}
         */
        isResizing (newValue) {
            const {move, end} = this.resizeEventNames;

            if (newValue) {
                this.handleElement.classList.add("resize-handle-is-resizing");
                document.addEventListener(move, this.onMouseMove);
                document.addEventListener(end, this.onMouseUp, {once: true});
                this.$emit("startResizing", this.eventData);
                document.querySelector("body").classList.add("resize-handle-is-resizing");
                return;
            }
            this.handleElement.classList.remove("resize-handle-is-resizing");
            document.removeEventListener(move, this.onMouseMove);
            document.removeEventListener(end, this.onMouseUp);
            this.$emit("endResizing", this.eventData);
            document.querySelector("body").classList.remove("resize-handle-is-resizing");
        }
    },
    mounted () {
        if (this.$el.parentNode !== null) {
            this.saveInitialDimensions();
            this.setNewSize();
        }
    },
    methods: {
        getTransformation (style) {
            return style.getPropertyValue("-webkit-transform") ||
                style.getPropertyValue("-moz-transform") ||
                style.getPropertyValue("-ms-transform") ||
                style.getPropertyValue("-o-transform") ||
                style.getPropertyValue("transform") ||
                false;
        },
        moveHandle (key) {
            if (key === "ArrowLeft" || key === "ArrowRight") {
                const containerWidth = document.getElementById("masterportal-container").offsetWidth,
                    disposition = key === "ArrowLeft" ? -5 : 5;
                let newWidth = this.handleElement.offsetWidth + disposition;

                if (newWidth < containerWidth * this.minWidth) {
                    newWidth = containerWidth * this.minWidth;
                }
                if (newWidth > containerWidth * this.maxWidth) {
                    newWidth = containerWidth * this.maxWidth;
                }
                this.handleElement.style.width = Math.round(newWidth) + "px";
            }
        },
        onMouseDown (event) {
            if (this.touchStarted) {
                return;
            }
            this.touchDevice = false;
            this.startResizing(event);
        },
        /**
         * Calculate cursor position difference while resizing.
         * When the cursor leaves the window, the resizing is stopped.
         * Cursor position difference will be adjusted by resizable element's rotation. which is necessary
         * to keep resizing directions intuitive. If the resizable element is not positioned relative,
         * its disposition caused by its dimension change is also corrected.
         * @param {MouseEvent | TouchEvent} event Event triggering the resizing of the window.
         * @returns {void}
         */
        onMouseMove (event) {
            const clientX = event.touches ? event.touches[0].clientX : event.clientX,
                clientY = event.touches ? event.touches[0].clientY : event.clientY,
                deltaX = clientX - this.initialCursorPosition.x,
                deltaY = clientY - this.initialCursorPosition.y;

            if (clientX < 0 || clientX > window.innerWidth || clientY < 0 || clientY > window.innerHeight) {
                this.$emit("leftScreen", this.eventData);
                this.isResizing = false;
            }

            this.deltaCursorPosition.x = deltaX * Math.cos(this.initialRotation) + deltaY * Math.sin(this.initialRotation);
            this.deltaCursorPosition.y = deltaY * Math.cos(this.initialRotation) - deltaX * Math.sin(this.initialRotation);

            if (this.grid > 1) {
                this.deltaCursorPosition.x = Math.round(this.deltaCursorPosition.x / this.grid) * this.grid;
                this.deltaCursorPosition.y = Math.round(this.deltaCursorPosition.y / this.grid) * this.grid;
            }
            this.setNewSize();

            if (["absolute", "fixed"].indexOf(window.getComputedStyle(this.handleElement, null).position) !== -1) {
                this.setNewPosition();
            }
            this.$emit("resizing", this.eventData);
        },
        onMouseUp () {
            this.isResizing = false;
        },
        onTouchStart (event) {
            this.setTouchStarted();
            this.touchDevice = true;
            this.startResizing(event);
        },
        /**
         * Saves initial cursor position. Used to calculate the cursor move distance while resizing.
         * @param {MouseEvent|TouchEvent} event mousedown or touchstart event.
         * @returns {void}
         */
        saveInitialCursorCoordinates (event) {
            this.initialCursorPosition.x = event.touches ? event.touches[0].clientX : event.clientX;
            this.initialCursorPosition.y = event.touches ? event.touches[0].clientY : event.clientY;
        },
        /**
         * Saves initial element dimensions. Used to calculate the new dimension
         * and disposition correction while resizing.
         * @returns {void}
         */
        saveInitialDimensions () {
            this.initialDimensions.width = this.handleElement.offsetWidth < this.minWidth ? this.minWidth : this.handleElement.offsetWidth;
            this.initialDimensions.height = this.handleElement.offsetHeight < this.minHeight ? this.minHeight : this.handleElement.offsetHeight;
            this.handleElement.style.width = this.initialDimensions.width;
            this.handleElement.style.height = this.initialDimensions.height;
        },
        /**
         * Saves initial element position. Used to calculate the new position while resizing.
         * @returns {void}
         */
        saveInitialPosition () {
            this.initialPosition.left = this.handleElement.offsetLeft;
            this.initialPosition.top = this.handleElement.offsetTop;
        },
        /**
         * Saves initial element rotation. Used to calculate the new position while resizing.
         * @returns {void}
         */
        saveInitialRotation () {
            const transformation = this.getTransformation(window.getComputedStyle(this.handleElement, null));

            if (transformation !== "none" && transformation !== false) {
                const values = transformation.split("(")[1].split(")")[0].split(",");

                this.initialRotation = (Math.atan2(values[1], values[0]) + 2 * Math.PI) % (2 * Math.PI);
            }
            else {
                this.initialRotation = 0;
            }
        },
        /**
         * Calculates and sets new position based on cursor position difference.
         * @returns {void}
         */
        setNewPosition () {
            const deltaWidth = this.initialDimensions.width - this.handleElement.offsetWidth,
                deltaHeight = this.initialDimensions.height - this.handleElement.offsetHeight,
                [signX, signY] = handleSigns[this.handlePosition];
            let {left, top} = this.initialPosition;

            // Disposition correction 1
            left += 0.5 * deltaWidth;
            top += 0.5 * deltaHeight;
            // Disposition correction 2, only needed when symmetric resize is disabled
            if (!this.symmetricResize) {
                left -= 0.5 * (signX * deltaWidth * Math.cos(this.initialRotation) - signY * deltaHeight * Math.sin(this.initialRotation));
                top -= 0.5 * (signY * deltaHeight * Math.cos(this.initialRotation) + signX * deltaWidth * Math.sin(this.initialRotation));
            }
            this.handleElement.style.left = Math.round(left) + "px";
            this.handleElement.style.top = Math.round(top) + "px";
        },
        /**
         * Calculates and sets new dimensions based on cursor position difference.
         * The handle type signs are used to determine whether the element needs to be upscaled or downscaled.
         * @returns {void}
         */
        setNewSize () {
            const containerWidth = document.getElementById("masterportal-container").offsetWidth,
                containerHeight = document.getElementById("masterportal-container").offsetHeight;

            if (this.handlePosition !== "top" && this.handlePosition !== "bottom") {
                let newWidth = this.initialDimensions.width + handleSigns[this.handlePosition][0] * this.deltaCursorPosition.x;

                if (newWidth < containerWidth * this.minWidth) {
                    newWidth = containerWidth * this.minWidth;
                }
                if (newWidth > containerWidth * this.maxWidth) {
                    newWidth = containerWidth * this.maxWidth;
                }
                this.handleElement.style.width = Math.round(newWidth) + "px";
            }
            if (this.handlePosition !== "left" && this.handlePosition !== "right") {
                let newHeight = this.initialDimensions.height + handleSigns[this.handlePosition][1] * this.deltaCursorPosition.y;

                if (newHeight < containerHeight * this.minHeight) {
                    newHeight = containerHeight * this.minHeight;
                }
                if (newHeight > containerHeight * this.maxHeight) {
                    newHeight = containerHeight * this.maxHeight;
                }
                this.handleElement.style.height = Math.round(newHeight) + "px";
            }
            if (this.handleElement.style.maxWidth !== "none") {
                this.handleElement.style.maxWidth = "none";
            }
            if (this.handleElement.style.maxHeight !== "none") {
                this.handleElement.style.maxHeight = "none";
            }
        },
        /**
         * When using the mousedown event, a ghost click is triggered.
         * To prevent weird behaviour, a reference is saved to prevent additional clicks for a fixed time period.
         * @returns {void}
         */
        setTouchStarted () {
            this.touchStarted = true;
            clearTimeout(this.timeoutReference);
            this.timeoutReference = setTimeout(() => {
                this.touchStarted = false;
            }, 400);
        },
        startResizing (event) {
            event.preventDefault();
            if (this.handleElement === null) {
                return;
            }
            this.saveInitialCursorCoordinates(event);
            this.saveInitialPosition();
            this.saveInitialRotation();
            this.saveInitialDimensions();
            this.isResizing = true;
        }
    }
};
</script>

<template>
    <button
        id="resize-handle"
        class="btn resize-handle"
        :class="[
            {'resize-handle-is-resizing': isResizing},
            'resize-handle-type-' + handlePosition,
            'resize-handle-cursor-' + cursorClass
        ]"
        @focus="moveHandle"
        @keydown="moveHandle($event.key)"
        @mousedown="onMouseDown"
        @mouseenter="saveInitialRotation"
        @touchstart="onTouchStart"
    >
        <!-- TODO @focus with info element? -->
        <slot />
    </button>
</template>

<style lang="scss">
@import "~variables";

$handle_size: 6px;

.resize-handle {
    position: absolute;
    width: $handle_size;
    height: $handle_size;
    background-color: $white;
    padding: 3px;
    border: none;

    &-is-resizing * {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none !important;
        transition: unset !important;
        user-select: none;
    }
    &-type {
        &-topLeft {
            top: 0;
            left: 0;
        }
        &-topRight {
            top: 0;
            right: 0;
        }
        &-bottomLeft {
            bottom: 0;
            left: 0;
        }
        &-bottomRight {
            bottom: 0;
            right: 0;
        }
        &-top {
            top: 0;
            width: 100%
        }
        &-left {
            left: 0;
            height: 100%;
        }
        &-right {
            right: 0;
            height: 100%;
        }
        &-bottom {
            bottom: 0;
            width: 100%
        }
    }
}

.resize-handle:focus, .resize-handle:hover, .resize-handle:active {
    background-color: $gray-400 !important;
        padding: 3px;
        border: none !important
    }

button:not(:disabled).resize-handle-cursor {
    &-nwse-resize {
            cursor: nwse-resize;
        }
        &-ns-resize {
            cursor: ns-resize;
        }
        &-nesw-resize {
            cursor: nesw-resize;
        }
        &-ew-resize {
            cursor: ew-resize;
        }
}

</style>
