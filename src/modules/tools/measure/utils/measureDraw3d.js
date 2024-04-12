let currentPosition = {x: 0, y: 0, z: 0},
    firstPosition = null;

/**
 * Creates a new cesium label entity.
 * @param {String} text - The text for the label.
 * @param {Cesium.Cartesian3} position - The cartesian position for the label.
 * @returns {Object} The new cesium label entity.
 */
export function createLabelEntity (text = "", position = {}) {
    if (typeof text !== "string" || typeof position !== "object") {
        return undefined;
    }
    return {
        position: position,
        label: {
            text: text,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            eyeOffset: {x: 0, y: 0, z: -5},
            scaleByDistance: new Cesium.NearFarScalar(1, 1, 5000, 0.05),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
    };
}

/**
 * Creates a new cesium polyline entity.
 * @param {Cesium.Color} color - The cesium color for the line.
 * @param {Cesium.Cartesian3[]} positions - The cartesian positions for the polyline.
 * @returns {Object} The new cesium polyline entity.
 */
export function createLineEntity (color = {}, positions = []) {
    if (!(color instanceof Object) || !Array.isArray(positions)) {
        return undefined;
    }
    return {
        polyline: {
            positions: positions,
            width: 3,
            material: new Cesium.ColorMaterialProperty(color)
        }
    };
}

/**
 * Computes a cartesian positian located straight above a given position.
 * @param {Cesium.Cartesian3} position - The origin position.
 * @param {Number} metres - The distance in metres by which the new position should be above the old one
 * @returns {Cesium.Cartesian3} The new position.
 * @throws {Error} - "GetPositionAboveError".
*/
export function getPositionAbove (position, metres) {
    let cartographic,
        newCartographic,
        result;

    try {
        cartographic = Cesium.Cartographic.fromCartesian(position);
        newCartographic = Cesium.Cartographic.fromRadians(
            cartographic.longitude, cartographic.latitude, cartographic.height + metres);
        result = Cesium.Cartographic.toCartesian(newCartographic);
    }
    catch {
        throw new Error("GetPositionAboveError");
    }

    return result;
}

/**
 * Event handler for LEFT_CLICK events. Sets pin to current position and distance line for every other pin.
 * @param {Cesium.Event} e - The Cesium left click event.
 * @returns {void}
*/
export function onClick () {
    const scene = mapCollection.getMap("3D").getCesiumScene(),
        entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
        cartographic = scene.globe.ellipsoid.cartesianToCartographic(currentPosition) ?? new Cesium.Cartographic(),
        height = cartographic.height - scene.globe.getHeight(cartographic),
        heightLabel = createLabelEntity("Höhe:\n" + height.toFixed(1) + "m", currentPosition);
    let positionAbove,
        pin = null;

    try {
        positionAbove = getPositionAbove(currentPosition, 5);
    }
    catch (e) {
        console.warn(e);
        return;
    }
    pin = createLineEntity(Cesium.Color.GREEN, [currentPosition, positionAbove]);
    entities.add(pin);
    entities.add(heightLabel);

    if (firstPosition) {
        const distance = Cesium.Cartesian3.distance(firstPosition, currentPosition),
            middlePosition = new Cesium.Cartesian3(),
            distanceLine = createLineEntity(Cesium.Color.BLUE, [currentPosition, firstPosition]);
        let distanceLabel = null;

        Cesium.Cartesian3.midpoint(firstPosition, currentPosition, middlePosition);
        distanceLabel = createLabelEntity("Entfernung:\n" + distance.toFixed(1) + "m", middlePosition);

        entities.add(distanceLine);
        entities.add(distanceLabel);
        firstPosition = null;
    }
    else {
        firstPosition = currentPosition;
    }
}

/**
 * Event handler for MOUSE_MOVE events. Sets current position and floating pin.
 * @param {Cesium.Event} event - The Cesium mouse move event.
 * @returns {void}
*/
export function onMouseMove (event) {
    const scene = mapCollection.getMap("3D").getCesiumScene(),
        entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
        mousePosition = {};
    let positionAbove = null;

    try {
        mousePosition.x = event.endPosition.x;
        mousePosition.y = event.endPosition.y;
        currentPosition = scene.pickPosition(mousePosition) ?? new Cesium.Cartesian3();
        positionAbove = getPositionAbove(currentPosition, 5);
    }
    catch {
        return;
    }

    entities.getById("floating").polyline.positions = [
        currentPosition, positionAbove
    ];
}

/**
 * Adds a polyline entity to the entityCollection which can be used to point to the current mouse position.
 * @param {Cesium.EntityCollection} entities - The entity collection to which the new entity will be added.
 * @returns {void}
*/
export function addFloatingPin (entities) {
    const pin = createLineEntity(Cesium.Color.RED, []);

    pin.id = "floating";

    entities?.add?.(pin);
}

/**
 * @returns {Object} measurement-interaction representing object (no real module:ol/interaction)
 */
function makeDraw () {
    const scene = mapCollection.getMap("3D").getCesiumScene(),
        entities = mapCollection.getMap("3D").getDataSourceDisplay().defaultDataSource.entities,
        eventHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

    if (!scene || !entities || !eventHandler) {
        return {
            abortDrawing: () => undefined,
            stopInteraction: () => undefined,
            interaction3d: true
        };
    }

    addFloatingPin(entities);

    eventHandler.setInputAction(onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    eventHandler.setInputAction(onClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return {
        abortDrawing: () => {
            entities.removeAll();
            addFloatingPin(entities);
        },
        stopInteraction: () => {
            eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            eventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            entities.remove(entities.getById("floating"));
        },
        interaction3d: true
    };
}

export default makeDraw;
