import Chart from "chart.js/auto";
import {convertToRgbaString, getCssColorMap} from "../../../shared/js/utils/convertColor.js";
import isObject from "../../../shared/js/utils/isObject.js";

/**
 * Creates a line chart and returns the reference.
 * @param {String} topic The topic of the chart.
 * @param {Object} preparedData The prepared data.
 * @param {HTMLCanvasElement} canvas The canvas to render the chart on.
 * @param {Object[]} colors The colors to render the lines.
 * @param {Boolean} renderSimple true if should be rendered as simple chart. Default is false.
 * @returns {Chart} The chart.
 */
function createLineChart (topic, preparedData, canvas, colors, renderSimple = false) {
    const chart = canvas,
        lineChartData = parsePreparedDataToLineChartFormat(preparedData, colors),
        datasets = lineChartData?.datasets,
        labels = lineChartData?.labels,
        lineChartConfig = {
            type: "line",
            data: {
                labels,
                datasets
            },
            options: {
                responsive: !renderSimple,
                maintainAspectRatio: renderSimple,
                aspectRatio: 1,
                layout: {
                    padding: {
                        right: renderSimple ? 20 : 10
                    }
                },
                interaction: {
                    mode: "nearest",
                    axis: "xy",
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            usePointStyle: true,
                            pointStyle: "rectRounded",
                            textAlign: renderSimple ? "left" : "center",
                            font: {
                                size: renderSimple ? 10 : 12
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: renderSimple ? splitTextByWordAndChunkSize(topic, 30) : topic,
                        font: {
                            size: !renderSimple ? 16 : 12,
                            family: "MasterPortalFont Bold",
                            style: "normal"
                        },
                        padding: 10,
                        color: "rgb(0, 0, 0)"
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            color: "rgb(0, 0, 0)"
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: "rgb(0, 0, 0)"
                        }
                    }
                }
            }
        };

    if (renderSimple) {
        lineChartConfig.options = {...lineChartConfig.options, ...JSON.parse(JSON.stringify(simpleChartOptions))};
    }
    return new Chart(chart.getContext("2d"), lineChartConfig);
}

/**
 * Creates a bar chart and returns the reference.
 * @param {String} topic The topic of the chart.
 * @param {Object} preparedData The prepared data.
 * @param {String} direction The direction to render the bar.
 * @param {HTMLElement} canvas The canvas to render the chart on.
 * @param {String|Boolean} differenceMode - Indicates the difference mode('date' or 'region') ohterwise false.
 * @param {Number|Boolean} numberOfColouredBars - indicates how many bars should be colored ohterwise false.
 * @param {Boolean} [renderSimple=false] -  true if should be rendered as simple chart.
 * @param {Object[]} [color = ["#d3d3d3"]] -  The color to render the bar.
 * @returns {Chart} The chart.
 */
function createBarChart (topic, preparedData, direction, canvas, differenceMode, numberOfColouredBars, renderSimple = false, color = ["#d3d3d3"]) {
    const chart = canvas,
        dataValues = parsePreparedDataToBarChartFormat(preparedData),
        dataColors = getBarChartColors(dataValues, color, differenceMode, numberOfColouredBars),
        barChartConfig = {
            type: "bar",
            data: {
                labels: Object.keys(preparedData),
                datasets: [{
                    label: topic,
                    data: dataValues,
                    borderColor: dataColors,
                    backgroundColor: dataColors,
                    hoverBackgroundColor: "rgb(214, 227, 255)"
                }]
            },
            options: {
                indexAxis: direction === "horizontal" ? "y" : "x",
                responsive: !renderSimple,
                maintainAspectRatio: renderSimple,
                aspectRatio: 2,
                layout: {
                    padding: {
                        right: renderSimple ? 20 : 10
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: renderSimple ? splitTextByWordAndChunkSize(topic + " " + getYearFromPreparedData(preparedData), 30) : topic + " " + getYearFromPreparedData(preparedData),
                        font: {
                            size: !renderSimple ? 16 : 12,
                            family: "MasterPortalFont Bold",
                            style: "normal"
                        },
                        color: "rgb(0, 0, 0)",
                        padding: 10
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            color: "rgb(0, 0, 0)"
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: "rgb(0, 0, 0)"
                        }
                    }
                }
            }
        };

    if (renderSimple) {
        barChartConfig.options = {...barChartConfig.options, ...JSON.parse(JSON.stringify(simpleChartOptions))};
        barChartConfig.options.scales.y = {
            display: false
        };
        barChartConfig.options.plugins.tooltip = {
            callbacks: {
                label: (tooltipItem)=>{
                    return tooltipItem.formattedValue;
                }
            }
        };
        if (direction === "horizontal") {
            barChartConfig.options.scales.y = {
                ticks: {
                    mirror: true,
                    z: 1
                }
            };
        }
    }
    barChartConfig.options.scales.x.position = direction === "horizontal" ? "top" : "bottom";
    return new Chart(chart.getContext("2d"), barChartConfig);
}
/**
 * Parses data to line chart format and returns it.
 * @param {Object} preparedData The data.
 * @param {Object[]} colors The colors.
 * @returns {Object} The parsed data.
 */
function parsePreparedDataToLineChartFormat (preparedData, colors) {
    if (!isObject(preparedData)) {
        return {};
    }

    const datasets = [],
        singleDataObject = Object.values(preparedData)[0],
        allColors = colors !== undefined ? colors : Object.values(getCssColorMap());
    let labels = [],
        datasetsCount = 0;

    Object.entries(preparedData).forEach(([region, value]) => {
        if (datasetsCount >= allColors.length) {
            datasetsCount = 0;
        }
        const datas = Object.values(value),
            color = convertToRgbaString(allColors[datasetsCount]),
            data = {
                fill: false,
                label: region,
                data: datas,
                borderColor: color,
                backgroundColor: color,
                borderWidth: 1
            };

        datasets.push(data);
        datasetsCount += 1;
    });
    if (isObject(singleDataObject)) {
        labels = Object.keys(singleDataObject);
    }

    return {
        datasets,
        labels
    };
}
/**
 * Parses the already prepared data to the bar chart format and returns it.
 * @param {Object} preparedData The data.
 * @returns {Array} The values as array.
 */
function parsePreparedDataToBarChartFormat (preparedData) {
    if (!isObject(preparedData)) {
        return [];
    }
    const dataValues = [];

    Object.values(preparedData).forEach(data => {
        if (!isObject(data)) {
            return;
        }
        dataValues.push(Object.values(data)[0]);
    });
    return dataValues;
}
/**
 * Parses the already prepared data to the bar chart format and returns it.
 * @param {Object} preparedData The data.
 * @returns {Array} The values as array.
 */
function getYearFromPreparedData (preparedData) {
    if (!isObject(preparedData)) {
        return "";
    }
    const year = Object.keys(Object.values(preparedData)[0])[0];

    return year;
}
/**
 * Get the color for the bar chart and returns it.
 * @param {Object} data - The data.
 * @param {Object[]} currentColor - The colors.
 * @param {String|Boolean} differenceMode - Indicates the difference mode('date' or 'region') otherwise false.
 * @param {Number|Boolean} numberOfColouredBars - indicates how many bars should be colored
 * @returns {Object[]} The values as array.
*/
function getBarChartColors (data, currentColor, differenceMode, numberOfColouredBars) {
    if (!Array.isArray(data) && !Array.isArray(currentColor)) {
        return "";
    }
    let colorValue = [];

    if (typeof differenceMode === "string") {
        colorValue = data.map((value) => value < 0 ? currentColor[0] : currentColor[1]);
    }
    else if (!differenceMode && currentColor.length === 2) {
        const firstChunk = data.slice(0, numberOfColouredBars),
            secondChunk = data.slice(numberOfColouredBars, data.length),
            first = firstChunk.map(val => val.length === 0 ? "" : currentColor[0]),
            second = secondChunk.map(value => value.length === 0 ? "" : currentColor[1]);

        colorValue = [...first, ...second];
    }
    else if (currentColor.length === 1) {
        colorValue = currentColor[0];
    }

    return colorValue;
}
/**
 * Splits a text into chunks without breaking words.
 * @param {String} text The text to be split.
 * @param {Number} chunkSize The maximum character count per chunk.
 * @returns {String[]} An array of chunks that adhere to the specified criteria.
 */
function splitTextByWordAndChunkSize (text, chunkSize) {
    const chunks = [],
        words = text.split(" ");
    let currentChunk = "";

    words.forEach(word => {
        if (currentChunk.length + word.length <= chunkSize) {
            currentChunk += (currentChunk.length > 0 ? " " : "") + word;
        }
        else {
            if (currentChunk.length > 0) {
                chunks.push(currentChunk);
            }
            currentChunk = word;
        }
    });
    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }
    if (!chunks.length) {
        chunks.push(text);
    }
    return chunks;
}

const simpleChartOptions = {
    legend: {display: false},
    scales: {
        x: {
            maxTicksLimit: 4,
            beginAtZero: true
        },
        y: {
            maxTicksLimit: 4,
            beginAtZero: true,
            position: "bottom"
        }
    },
    aspectRatio: 1
};

export default {
    createLineChart,
    createBarChart,
    parsePreparedDataToLineChartFormat,
    parsePreparedDataToBarChartFormat,
    getYearFromPreparedData,
    getBarChartColors,
    splitTextByWordAndChunkSize
};
