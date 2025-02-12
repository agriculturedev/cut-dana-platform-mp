<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import ControlIcon from "../../components/ControlIcon.vue";

/**
 * Control to display current map rotation.
 * @module modules/controls/rotation/components/RotationItem
 */
export default {
    name: "RotationItem",
    components: {
        ControlIcon
    },
    data: () => {
        return {
            startTime: null,
            correction: null,
            destination: null,
            distance: null,
            scenePostRenderListener: null
        };
    },
    computed: {
        ...mapGetters("Maps", ["mode"]),
        ...mapGetters("Controls/Rotation", ["compass2d", "compass3d", "moveDistance", "rotation", "showResetRotation", "resetRotationIcon", "rotateClockwiseIcon", "rotateCounterClockwiseIcon", "rotationAngle", "rotationIcons", "showResetRotationAlways"]),
        ...mapGetters(["controlsConfig", "isMobile"]),
        controlsRingIcon () {
            return "url(" + Config.wfsImgPath + "compass/3d-controls-rings.png)";
        },
        pointerNorthIcon () {
            return "url(" + Config.wfsImgPath + "compass/pointer-north-short.png)";
        },
        controlsNorthIcon () {
            return "url(" + Config.wfsImgPath + "compass/3d-controls-north.png)";
        },
        controlsSouthIcon () {
            return "url(" + Config.wfsImgPath + "compass/3d-controls-south.png)";
        },
        controlsWestIcon () {
            return "url(" + Config.wfsImgPath + "compass/3d-controls-west.png)";
        },
        controlsEastIcon () {
            return "url(" + Config.wfsImgPath + "compass/3d-controls-east.png)";
        }

    },
    watch: {
        /**
         * If mode is 3D, lister are added else they are removed.
         * @param {String} newMode the new map mode.
         * @returns {void}
         */
        mode (newMode) {
            if (newMode === "3D") {
                this.$nextTick(() => {
                    this.add3DListener();
                });
            }
            else {
                this.remove3DListener();
            }
        }
    },
    mounted () {
        this.$nextTick(() => {
            mapCollection.getMapView("2D").on("change:rotation", this.updateResetRotationIcon);
        });
    },
    unmounted () {
        mapCollection.getMapView("2D").un("change:rotation", this.updateResetRotationIcon);
    },
    methods: {
        ...mapActions("Controls/Rotation", ["move2d", "rotateClockwise", "rotateCounterClockwise"]),
        ...mapMutations("Controls/Rotation", ["setRotation", "setRotationIcons", "setShowResetRotationAlways"]),
        /**
         * Updates the rotation of the control icon. If mode 2D the and compass visible, the icon of the compass ist rotated.
         * @param {Event} event the mapView rotation event.
         * @returns {void}
         */
        updateResetRotationIcon (event) {
            this.setRotation(event.target.getRotation());
            if (this.showResetRotation && this.$el.querySelector("i")) {
                this.$el.querySelector("i").style.transform = `translate(-50%, -50%) rotate(${this.rotation}rad)`;
            }
            if (this.mode === "2D" && this.$el.querySelector("#north-pointer")) {
                this.$el.querySelector("#north-pointer").style.transform = `rotate(${this.rotation}rad)`;
            }
        },
        /**
         * Set the mapView to north.
         * @returns {void}
         */
        setToNorth () {
            mapCollection.getMapView("2D").animate({rotation: 0});
        },
        /**
         * Adds a listener to postRenderer of the cesium scene to update the icon of the compass.
         * @returns {void}
         */
        add3DListener () {
            const scene = mapCollection.getMap("3D").getCesiumScene(),
                northPointer = this.$el.querySelector("#north-pointer");

            this.remove3DListener();
            this.scenePostRenderListener = scene.postRender.addEventListener(function () {
                if (northPointer) {
                    northPointer.style.transform = `rotate(${-1 * scene.camera.heading}rad)`;
                }
            });
        },
        /**
         * Removed the listener of the postRenderer of the cesium scene to update the icon of the compass.
         * @returns {void}
         */
        remove3DListener () {
            if (this.scenePostRenderListener) {
                this.scenePostRenderListener();
                this.scenePostRenderListener = null;
            }
        },
        /**
         * Calls the move function for 2d od 3D.
         * @param {Object} event the click event.
         * @returns {void}
         */
        move: function (event) {
            if (this.mode === "2D") {
                this.move2d(event);
            }
            else {
                this.move3d(event);
            }
        },
        /**
         * Moves the 3D map for state's moveDistance.
         * @param {Object} event the click event.
         * @returns {void}
         */
        move3d: function (event) {
            const scene = mapCollection.getMap("3D").getCesiumScene();

            switch (event.currentTarget.id) {
                case "compass_north": {
                    scene.camera.moveUp(this.moveDistance);
                    break;
                }
                case "compass_south": {
                    scene.camera.moveDown(this.moveDistance);
                    break;
                }
                case "compass_east": {
                    scene.camera.moveRight(this.moveDistance);
                    break;
                }
                case "compass_west": {
                    scene.camera.moveLeft(this.moveDistance);
                    break;
                }
                default: {
                    console.warn("Rotation move3d event currentTarget id cannot be found! Move not possible.");
                    break;
                }
            }
        },
        /** Reaction to mouse down on north-pointer.
         * @param {Object} event the mouseDown event.
         * @returns {void}
         */
        northDown (event) {
            const offsetRect = this.$el.querySelector("#north-pointer").getBoundingClientRect(),
                cursorPosition = {x: event.clientX, y: event.clientY};

            this.correction = {
                y: offsetRect.top + offsetRect.height / 2 - cursorPosition.y,
                x: offsetRect.left + offsetRect.width / 2 - cursorPosition.x
            };
            this.startTime = new Date().getTime();
            if (this.mode === "3D") {
                let scene = "",
                    camera = "",
                    ray = "",
                    groundPositionCartesian = "";

                scene = mapCollection.getMap("3D").getCesiumScene();
                camera = scene.camera;
                ray = new Cesium.Ray(camera.position, camera.direction);
                groundPositionCartesian = scene.globe.pick(ray, scene);

                if (groundPositionCartesian) {
                    this.destination = groundPositionCartesian;
                    this.distance = Cesium.Cartesian3.distance(camera.position, groundPositionCartesian);
                }
            }
            window.addEventListener("mouseup", this.northUp.bind(this), {
                "once": true
            });
            this.$el.onmousemove = this.mouseDragged.bind(this);
        },
        /** Reaction to mouse up on north-pointer.
         * @returns {void}
         */
        northUp () {
            const endTime = new Date().getTime();

            if (endTime - this.startTime < 200) {
                this.setHeading(0);
            }
            this.$el.onmousemove = undefined;
            window.removeEventListener("mouseup", this.northUp.bind(this), {
                "once": true
            });
        },
        /** If mouse is dragged on north-pointer the heading is set or the map is rotated.
         * @param {Object} event the mouse event.
         * @returns {void}
         */
        mouseDragged (event) {
            let offsetRect = "",
                top = "",
                left = "",
                y = "",
                x = "",
                rads = "";

            offsetRect = this.$el.querySelector(".compass").getBoundingClientRect();
            top = offsetRect.top + offsetRect.height / 2;
            left = offsetRect.left + offsetRect.width / 2;
            y = event.clientY - top + this.correction.y;
            x = event.clientX - left + this.correction.x;
            rads = Math.atan2(y, x) + Math.PI / 2;
            rads = rads > 0 ? rads : rads + 2 * Math.PI;

            event.preventDefault();

            if (this.mode === "3D") {
                this.setHeading(-rads);
            }
            else {
                mapCollection.getMapView("2D").setRotation(rads);
            }

        },
        /** Sets the heading at 3D map.
         * @param {Number} heading the Cesium heading.
         * @returns {void}
         */
        setHeading (heading) {
            const camera = mapCollection.getMap("3D").getCesiumScene().camera,
                options = {
                    orientation: {
                        pitch: camera.pitch,
                        roll: camera.roll,
                        heading: heading
                    }
                };

            if (this.destination) {
                options.destination = this.destination;
            }
            camera.setView(options);
            if (this.distance !== null) {
                camera.moveBackward(this.distance);
            }
        }
    }
};
</script>

<template>
    <div
        id="rotation-control"
    >
        <div
            v-if="!isMobile && (mode === '2D' && compass2d || mode === '3D' && compass3d)"
            class="compass-control btn-group"
        >
            <div class="compassContainer">
                <div class="compass">
                    <button
                        id="north-pointer"
                        class="compass-pointer compass-pointer-north"
                        type="button"
                        tabindex="0"
                        :title="$t(`common:modules.controls.rotation.compass.pointerNorth`)"
                        @mousedown="northDown"
                    />
                    <button
                        id="compass_north"
                        class="compass-north 3d-control-btn"
                        tabindex="0"
                        :title="$t(`common:modules.controls.rotation.compass.moveNorth`)"
                        type="button"
                        @click.stop="move($event)"
                        @keydown="move($event)"
                    />
                    <button
                        id="compass_south"
                        class="compass-south 3d-control-btn"
                        tabindex="0"
                        :title="$t(`common:modules.controls.rotation.compass.moveSouth`)"
                        type="button"
                        @click.stop="move($event)"
                        @keydown="move($event)"
                    />
                    <button
                        id="compass_west"
                        class="compass-west 3d-control-btn"
                        tabindex="0"
                        type="button"
                        :title="$t(`common:modules.controls.rotation.compass.moveWest`)"
                        @click.stop="move($event)"
                        @keydown="move($event)"
                    />
                    <button
                        id="compass_east"
                        class="compass-east 3d-control-btn"
                        tabindex="0"
                        type="button"
                        :title="$t(`common:modules.controls.rotation.compass.moveEast`)"
                        @click.stop="move($event)"
                        @keydown="move($event)"
                    />
                </div>
            </div>
        </div>
        <ControlIcon
            v-if="showResetRotation && (rotation !== 0 || showResetRotationAlways)"
            id="reset-rotation"
            class="reset-rotation-control-icon"
            :icon-name="resetRotationIcon"
            :title="$t(`common:modules.controls.rotation.reset`)"
            :disabled="false"
            :on-click="setToNorth"
        />
        <ControlIcon
            v-if="rotationIcons && !isMobile"
            id="rotate-clockwise"
            class="rotate-clockwise-icon"
            :title="$t('common:modules.controls.rotation.rotateClockwise')"
            :icon-name="rotateClockwiseIcon"
            :on-click="rotateClockwise"
        />
        <ControlIcon
            v-if="rotationIcons && !isMobile"
            id="rotate-counter-clockwise"
            class="rotate-counter-clockwise-icon"
            :title="$t('common:modules.controls.rotation.rotateCounterClockwise')"
            :icon-name="rotateCounterClockwiseIcon"
            :on-click="rotateCounterClockwise"
        />
    </div>
</template>

<style lang="scss" scoped>
button{
    border: none;
    background-color: transparent;
}
.reset-rotation-control-icon{
    transform: rotate(-45deg);
}
.compass-control{
    position:absolute;
    top:-9rem;
    right:-3rem;
}
.compassContainer {
    display: inline-block;
    position: relative;
    height: 120px;
    width: 120px;
}
.compass{
    position: absolute;
    top: 0;
    left: 0;
    width: 120px;
    height: 120px;
    background-image: v-bind(controlsRingIcon);
}
.compass-pointer{
    pointer-events: all;
    position: absolute;
    width: 22px;
    height: 22px;
    background-repeat: no-repeat;
    cursor: pointer;
}
.compass-pointer-north{
    background-image: v-bind(pointerNorthIcon);
    top: -7px;
    left: 49px;
    -ms-transform-origin: 11px 67px;
    -webkit-transform-origin: 11px 67px;
    transform-origin: 11px 67px;
}
.compass-north,
.compass-south{
    pointer-events: all;
    position: absolute;
    left: 40px;
    width: 40px;
    height: 20px;
    cursor: pointer;
}
.compass-north{
    top: 20px;
    background-image: v-bind(controlsNorthIcon);
}
.compass-south{
    bottom: 20px;
    background-image: v-bind(controlsSouthIcon);
}
.compass-west,
.compass-east{
    pointer-events: all;
    position: absolute;
    top: 40px;
    width: 20px;
    height: 40px;
    cursor: pointer;
}
.compass-west{
    left: 20px;
    background-image: v-bind(controlsWestIcon);
}
.compass-east{
    right: 20px;
    background-image: v-bind(controlsEastIcon);
}
</style>
