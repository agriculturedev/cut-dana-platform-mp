/**
* Adds EPSG:8395 in decimal-degree to list of projections.
* @param {Array} projections list of all available projections
* @param {Object} elementETRS89_3GK3 the WGS84 projection contained in list of projections
* @param {Object} epsg8395 the WGS84 projection contained in list of projections
* @returns {void}
*/
export default function addETRS893GK3 (projections, elementETRS89_3GK3, epsg8395) {
    const index = projections.findIndex(proj => proj.name === "EPSG:8395"),
        etrs89_3GK3Proj = {};

    for (const key in epsg8395[0]) {
        etrs89_3GK3Proj[key] = epsg8395[0][key];
    }
    etrs89_3GK3Proj.name = "ETRS893GK3";
    etrs89_3GK3Proj.epsg = "EPSG:8395";
    etrs89_3GK3Proj.id = "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3";
    etrs89_3GK3Proj.title = elementETRS89_3GK3[1].substring(elementETRS89_3GK3[1].lastIndexOf("ETRS"), elementETRS89_3GK3[1].indexOf(" +proj="));
    etrs89_3GK3Proj.getCode = () => "noEPSGCode";
    projections.splice(index + 1, 0, etrs89_3GK3Proj);
}

