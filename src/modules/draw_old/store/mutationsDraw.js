import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import initialState from "./stateDraw";

const mutations = {
    ...generateSimpleMutations(initialState),
    setDownloadDataString: (state, payload) => {
        state.download.dataString = payload;
    },
    setDownloadEnabled: (state) => {
        state.download.enabled = !state.download.enabled;
    },
    setDownloadFeatures: (state, payload) => {
        state.download.features = payload;
    },
    setDownloadFile: (state, payload) => {
        state.download.file = payload;
    },
    setDownloadFileName: (state, payload) => {
        state.download.fileName = payload;
    },
    setDownloadFileUrl: (state, payload) => {
        state.download.fileUrl = payload;
    },
    setDownloadSelectedFormat: (state, payload) => {
        state.download.selectedFormat = payload;
    },
    setSquareSide: (state, payload) => {
        state.drawSquareSettings.squareSide = payload;
    },
    addSymbol: (state, payload) => {
        state.iconList.push(payload);
    },
    setDrawAreaSettings: (state, styleSettings) => {
        state.drawAreaSettings.area = styleSettings.area;
        state.drawAreaSettings.color = styleSettings.color;
        state.drawAreaSettings.colorContour = styleSettings.colorContour;
        state.drawAreaSettings.opacity = styleSettings.opacity;
        state.drawAreaSettings.opacityContour = styleSettings.opacityContour;
        state.drawAreaSettings.strokeWidth = styleSettings.strokeWidth;
        state.drawAreaSettings.unit = styleSettings.unit;
    },
    setDrawCircleSettings: (state, styleSettings) => {
        state.drawCircleSettings.circleMethod = styleSettings.circleMethod;
        state.drawCircleSettings.circleOuterRadius = styleSettings.circleOuterRadius;
        state.drawCircleSettings.circleRadius = styleSettings.circleRadius;
        state.drawCircleSettings.color = styleSettings.color;
        state.drawCircleSettings.colorContour = styleSettings.colorContour;
        state.drawCircleSettings.opacity = styleSettings.opacity;
        state.drawCircleSettings.opacityContour = styleSettings.opacityContour;
        state.drawCircleSettings.outerColorContour = styleSettings.outerColorContour;
        state.drawCircleSettings.strokeWidth = styleSettings.strokeWidth;
        state.drawCircleSettings.unit = styleSettings.unit;
    },
    setDrawCurveSettings: (state, styleSettings) => {
        state.drawCurveSettings.color = styleSettings.color;
        state.drawCurveSettings.colorContour = styleSettings.colorContour;
        state.drawCurveSettings.opacity = styleSettings.opacity;
        state.drawCurveSettings.opacityContour = styleSettings.opacityContour;
        state.drawCurveSettings.strokeWidth = styleSettings.strokeWidth;
    },
    setDrawLineSettings: (state, styleSettings) => {
        state.drawLineSettings.color = styleSettings.color;
        state.drawLineSettings.colorContour = styleSettings.colorContour;
        state.drawLineSettings.length = styleSettings.length;
        state.drawLineSettings.opacity = styleSettings.opacity;
        state.drawLineSettings.opacityContour = styleSettings.opacityContour;
        state.drawLineSettings.strokeWidth = styleSettings.strokeWidth;
        state.drawLineSettings.unit = styleSettings.unit;
    },
    setDrawSquareSettings: (state, styleSettings) => {
        state.drawSquareSettings.color = styleSettings.color;
        state.drawSquareSettings.colorContour = styleSettings.colorContour;
        state.drawSquareSettings.opacity = styleSettings.opacity;
        state.drawSquareSettings.opacityContour = styleSettings.opacityContour;
        state.drawSquareSettings.squareArea = styleSettings.squareArea;
        state.drawSquareSettings.squareMethod = styleSettings.squareMethod;
        state.drawSquareSettings.squareSide = styleSettings.squareSide;
        state.drawSquareSettings.strokeWidth = styleSettings.strokeWidth;
        state.drawSquareSettings.unit = styleSettings.unit;
    },
    setDrawSymbolSettings: (state, styleSettings) => {
        state.drawSymbolSettings.color = styleSettings.color;
        state.drawSymbolSettings.opacity = styleSettings.opacity;
    }
};

export default mutations;
