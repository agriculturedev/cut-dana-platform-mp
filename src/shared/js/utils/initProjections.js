import addWGS84Decimal from "./addWGS84Decimal";
import addETRS893GK3 from "./addETRS893GK3";

/**
* Initializes the projections to select. If projection EPSG:4326 is available same is added in decimal-degree.
* @param {Object} crs crs object
* @param {Object[]} projections list of all available projections
* @param {Object[]} namedProjections list of named projections
* @param {Object} currentProjection current projection
* @returns {Object} projectionsObj object containing projections and currentProjection
*/
export default function initProjections (crs, projections, namedProjections, currentProjection) {
    const pr = crs.getProjections(),
        epsg8395 = [],
        wgs84Proj = [],
        projectionsObj = {};

    if (projections?.length) {
        return undefined;
    }
    // id is set to the name and in case of decimal "-DG" is appended to name later on
    // for use in select-box
    pr.forEach(proj => {
        proj.id = proj.name;
        if (proj.name === "EPSG:4326" || proj.name === "http://www.opengis.net/gml/srs/epsg.xml#4326") {
            wgs84Proj.push(proj);
        }
        if (proj.name === "EPSG:8395" || proj.name === "http://www.opengis.net/gml/srs/epsg.xml#8395") {
            epsg8395.push(proj);
        }
        if (proj.name.indexOf("#") > -1) { // e.g. "http://www.opengis.net/gml/srs/epsg.xml#25832"
            const code = proj.name.substring(proj.name.indexOf("#") + 1, proj.name.length);

            proj.epsg = "EPSG:" + code;
        }
        else {
            proj.title = proj.name;
        }
        if (proj.id === currentProjection?.id) {
            projectionsObj.currentProjection = proj;
        }
    });
    if (wgs84Proj.length > 0) {
        addWGS84Decimal(pr, wgs84Proj);
    }
    if (namedProjections) {
        namedProjections.find((el) => {
            if (el[1].includes("ETRS89_3GK3") && epsg8395.length > 0) {
                addETRS893GK3(pr, el, epsg8395);
                return true;
            }
            return false;
        });
    }

    projectionsObj.projections = pr;
    return projectionsObj;

}
