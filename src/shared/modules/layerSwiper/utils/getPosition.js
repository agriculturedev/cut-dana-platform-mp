/**
 * Returns the new position of the swiper depending on the input event.
 *
 * @param {KeyboardEvent.keydown | MouseEvent.mousemove} event DOM Event.
 * @param {Number} currentPos The current position of the swiper (either x or y).
 * @param {Number} keyboardMovement Value in pixels that the swiper should be moved when using the arrow keys.
 * @param {String} direction Direction of movement, either "horizontal" or "vertical".
 * @returns {Number} The new position of the swiper.
 */
export default function getPosition (event, currentPos, keyboardMovement, direction) {
    let position = currentPos;

    if (event.type === "mousemove") {
        position = direction === "horizontal" ? event.clientX : event.clientY;
    }
    else if (event.type === "keydown") {
        if (direction === "horizontal") {
            if (event.key === "ArrowLeft") {
                position -= keyboardMovement;
            }
            else if (event.key === "ArrowRight") {
                position += keyboardMovement;
            }
        }
        else if (event.key === "ArrowUp") {
            position -= keyboardMovement;
        }
        else if (event.key === "ArrowDown") {
            position += keyboardMovement;
        }
    }

    // If the swiper was moved out of the window, it is set to the border of the window instead
    if (direction === "horizontal") {
        if (position < 0) {
            return 0;
        }
        if (position > window.innerWidth) {
            return window.innerWidth;
        }
    }
    else {
        if (position < 0) {
            return 0;
        }
        if (position > window.innerHeight) {
            return window.innerHeight;
        }
    }

    return position;
}
