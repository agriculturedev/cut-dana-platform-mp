/**
 * The state for the control rotation.
 * @module modules/controls/rotation/store/stateRotation
 * @typedef {Object} RotationState
 * @property {Boolean} [compass2d=false] Controls the display of the compass rose in 2D.
 * @property {Boolean} [compass3d=true] Controls the display of the compass rose in 3D.
 * @property {Number} [moveDistance=1000] Distance in meters, which is used when clicking on the movement arrows of the compass rose.
 * @property {String} [resetRotationIcon="bi-cursor"] Icon of the reset rotation button.
 * @property {String} [rotateCounterClockwiseIcon="bi-arrow-counterclockwise"] Icon for the "Rotate counterclockwise" button.
 * @property {String} [rotateClockwiseIcon="bi-arrow-clockwise"] Icon for the "Rotate clockwise" button.
 * @property {Number} [rotation=0] The current rotation value in rad.
 * @property {Number} [rotationAngle=45] Defines the angle for one click on roatation button.
 * @property {Boolean} [rotationIcons=null] Defines whether the icons to rotate shall be displayed.
 * @property {Boolean} [showResetRotation=true] Controls the display of the "Reset rotation" button.
 * @property {Boolean} [showResetRotationAlways=false] Defines whether the control is shown permanently.
 * @property {String[]} [supportedDevices=["Desktop", "Mobile"]] Devices on which the module is displayed.
 * @property {String[]} [supportedMapModes=["2D", "3D"]] Map mode in which this module can be used.
 */
const state = {
    compass2d: false,
    compass3d: true,
    moveDistance: 1000,
    resetRotationIcon: "bi-cursor",
    rotateCounterClockwiseIcon: "bi-arrow-counterclockwise",
    rotateClockwiseIcon: "bi-arrow-clockwise",
    rotation: 0,
    rotationAngle: 22.5,
    rotationIcons: true,
    showResetRotation: true,
    showResetRotationAlways: false,
    supportedDevices: ["Desktop", "Mobile"],
    supportedMapModes: ["2D", "3D"]
};

export default state;
