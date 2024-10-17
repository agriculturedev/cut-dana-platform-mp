/**
 * Adds EPSG:4326 in decimal-degree to list of projections.
 * @param {Array} projections list of all available projections
 * @param {Object} wgs84Proj the WGS84 projection contained in list of projections
 * @returns {void}
 */
export default function addWGS84Decimal (projections, wgs84Proj) {
    const index = projections.findIndex(proj => proj.name === "EPSG:4326"),
        wgs84ProjDez = {};

    for (const key in wgs84Proj[0]) {
        wgs84ProjDez[key] = wgs84Proj[0][key];
    }

    wgs84ProjDez.name = "EPSG:4326-DG";
    wgs84ProjDez.epsg = "EPSG:4326";
    wgs84ProjDez.id = "http://www.opengis.net/gml/srs/epsg.xml#4326-DG";
    wgs84ProjDez.title = "WGS84_Lat-Lon (Grad, Dezimal), EPSG 4326";
    wgs84ProjDez.getCode = () => "EPSG:4326-DG";
    projections.splice(index + 1, 0, wgs84ProjDez);
}
