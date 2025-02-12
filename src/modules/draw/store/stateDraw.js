/**
 * State of module draw.
 * @module modules/draw/store/stateDraw *
 * @property {Object} [circleOptions={innerRadius: 100, interactive: true, outerRadius: 500, unit: "m"}] The circle Options
 * @property {Number} [circleOptions.innerRadius=100] The inner radius for feature of drawType: "circle and doubelCircle".
 * @property {Boolean} [circleOptions.interactive=true] The circle or doubleCircle is drawn interactively or not.
 * @property {Number} [circleOptions.outerRadius=500] The outer radius for feature of drawType: "doubleCircle".
 * @property {String} [circleOptions.unit="m"] The unit for the circle or doubleCircle.
 * @property {Object} [currentLayout={fillColor: [55, 126, 184], fillTransparency: 0, strokeColor: [0, 0, 0], strokeWidth: 1}] The current layout for the styling.
 * @property {Number[]} [currentLayout.fillColor=[55, 126, 184]] The fill color in rgb.
 * @property {Number} [currentLayout.fillTransparency=0] The fill transparency in percent.
 * @property {Number[]} [currentLayout.strokeColor=[0, 0, 0]] The stroke color in rgb.
 * @property {Number} [currentLayout.strokeWidth=1] The stroke width in pixel.
 * @property {Object} [currentLayoutOuterCircle= fillColor: [0, 0, 0], fillTransparency: 100, strokeColor: [200, 0, 0], strokeWidth: 1}] The current layout for styling the outer circle. Only used for double circle.
 * @property {Number[]} [currentLayoutOuterCircle.fillColor=[0, 0, 0]] The fill color in rgb.
 * @property {Number} [currentLayoutOuterCircle.fillTransparency=100] The fill transparency in percent.
 * @property {Number[]} [currentLayoutOuterCircle.strokeColor=[200, 0, 0]] The stroke color in rgb.
 * @property {Number} currentLayoutOuterCircle.strokeWidth The stroke width in pixel.
 * @property {String} [description="common:modules.draw.description"] The description that should be shown in the button in the menu.
 * @property {String[]} [drawEdits=["deleteAll", "delete", "modify", "undo", "redo"]] The draw edits.
 * @property {Object} [drawIcons={box: "bi-square", circle: "bi-circle", delete: "bi-eraser-fill", deleteAll: "bi-trash",doubleCircle: "bi-record-circle", geometries: "bi-hexagon-fill", line: "bi-slash-lg", modify: "bi-tools", pen: "bi-pencil-fill", point: "bi-circle-fill", polygon: "bi-octagon", redo: "bi-arrow-right", symbols: "bi-circle-square", undo: "bi-arrow-left"}] The icons for draw buttons.
 * @property {String} [drawIcons.box="bi-square"] The icon for box button.
 * @property {String} [drawIcons.circle="bi-circle"] The icon for circle button.
 * @property {String} [drawIcons.doubleCircle="bi-record-circle"] The icon for doubleCircle button.
 * @property {String} [drawIcons.geometries="bi-hexagon-fill"] The icon for geometries button.
 * @property {String} [drawIcons.line="bi-slash-lg"] The icon for line button.
 * @property {String} [drawIcons.pen="bi-pencil-fill"] The icon for pen button.
 * @property {String} [drawIcons.point="bi-circle-fill"] The icon for point button.
 * @property {String} [drawIcons.polygon="bi-octagon"] The icon for polygon button.
 * @property {String} [drawIcons.symbols="bi-circle-square"] The icon for symbols button.
 * @property {String[]} [drawTypesGeometrie=["line", "box", "polygon", "circle", "doubleCircle"]] The drawing types in geometries.
 * @property {String[]} [drawTypesMain=["pen", "geometries", "symbols"]] The top level (main) drawing types.
 * @property {String[]} [drawTypesSymbols=["point"]] The drawing types in symbols.
 * @property {Boolean} [hasMouseMapInteractions=true] If this attribute is true, then all other modules will be deactivated when this attribute is also true. Only one module with this attribute true may be open at the same time, since conflicts can arise in the card interactions.
 * @property {String} [icon="bi-pencil"] Icon next to title (config-param)
 * @property {String} [name="common:modules.draw.name"] Displayed as title (config-param)
 * @property {String} [selectedDrawType=""] The selected draw type.
 * @property {String} [selectedDrawTypeMain=""] The selected draw type main.
 * @property {String} [selectedInteraction="draw"] The selected interaction.
 * @property {Number[]} [strokeRange=[1, 16]] The stroke range in the unit pixel.
 * @property {String[]} [supportedDevices=["Desktop", "Mobile", "Table"]] Devices on which the module is displayed.
 * @property {String[]} [supportedMapModes=["2D", "3D"]] Map mode in which this module can be used.
 * @property {String} type="draw" The type of the module.
 * @property {String[]} units=["m", "km"] The possible units for the circle or doubleCircle.
 */
const state = {
    circleOptions: {
        innerRadius: 100,
        interactive: true,
        outerRadius: 500,
        unit: "m"
    },
    currentLayout: {
        fillColor: [55, 126, 184],
        fillTransparency: 0,
        strokeColor: [0, 0, 0],
        strokeWidth: 1
    },
    currentLayoutOuterCircle: {
        fillColor: [0, 0, 0],
        fillTransparency: 100,
        strokeColor: [200, 0, 0],
        strokeWidth: 1
    },
    description: "common:modules.draw.description",
    drawEdits: ["deleteAll", "delete", "modify", "undo", "redo"],
    drawIcons: {
        box: "bi-square",
        circle: "bi-circle",
        delete: "bi-eraser-fill",
        deleteAll: "bi-trash",
        doubleCircle: "bi-record-circle",
        geometries: "bi-hexagon-fill",
        line: "bi-slash-lg",
        modify: "bi-tools",
        pen: "bi-pencil-fill",
        point: "bi-circle-fill",
        polygon: "bi-octagon",
        redo: "bi-arrow-right",
        symbols: "bi-circle-square",
        undo: "bi-arrow-left"
    },
    drawTypesGeometrie: ["line", "box", "polygon", "circle", "doubleCircle"],
    drawTypesMain: ["pen", "geometries", "symbols"],
    drawTypesSymbols: ["point"],
    hasMouseMapInteractions: true,
    icon: "bi-pencil",
    name: "common:modules.draw.name",
    selectedDrawType: "",
    selectedDrawTypeMain: "",
    selectedInteraction: "draw",
    strokeRange: [1, 16],
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D", "3D"],
    type: "draw",
    units: ["m", "km"]
};

export default state;
