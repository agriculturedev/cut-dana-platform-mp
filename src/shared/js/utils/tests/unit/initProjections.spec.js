import {expect} from "chai";
import initProjections from "../../initProjections";

describe("initProjections", () => {
    let crs,
        projections,
        namedProjections,
        currentProjection;

    beforeEach(() => {
        crs = {
            getProjections: () => [
                {
                    title: "WGS 84 (long/lat)",
                    projName: "longlat",
                    ellps: "WGS84",
                    datumCode: "WGS84",
                    no_defs: true,
                    masterportal: true,
                    name: "http://www.opengis.net/gml/srs/epsg.xml#4326"
                },
                {
                    title: "ETRS89/UTM 32N",
                    projName: "utm",
                    zone: 32,
                    ellps: "GRS80",
                    datum_params: [
                        0, 0, 0, 0,
                        0, 0, 0
                    ],
                    units: "m",
                    no_defs: true,
                    masterportal: true,
                    name: "http://www.opengis.net/gml/srs/epsg.xml#25832"
                },
                {
                    title: "Bessel/Gauß-Krüger 3",
                    projName: "tmerc",
                    lat0: 0,
                    long0: 0.15707963267948966,
                    k0: 1,
                    x0: 3500000,
                    y0: 0,
                    ellps: "bessel",
                    datumCode: "potsdam",
                    units: "m",
                    no_defs: true,
                    masterportal: true,
                    name: "http://www.opengis.net/gml/srs/epsg.xml#31467"
                },
                {
                    title: "EPSG: 8395",
                    projName: "tmerc",
                    lat0: 0,
                    long0: 0.15707963267948966,
                    k0: 1,
                    x0: 500000,
                    y0: 0,
                    ellps: "GRS80",
                    datumCode: "grs80",
                    units: "m",
                    no_defs: true,
                    masterportal: true,
                    name: "http://www.opengis.net/gml/srs/epsg.xml#8395"
                }
            ]
        };
        projections = [];
        namedProjections = [
            [
                "EPSG:8395",
                "+title=ETRS89_3GK3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"
            ],
            [
                "EPSG:4326",
                "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"
            ]
        ];
        currentProjection = {};
    });

    it("should return right count of projections", () => {
        const result = initProjections(crs, projections, namedProjections, currentProjection);

        expect(result.projections.length).to.be.equals(6);
    });

    it("should add WGS84Decimal projection with right id", () => {

        const result = initProjections(crs, projections, namedProjections, currentProjection);

        expect(result.projections.filter(proj => proj.name === "EPSG:4326-DG"));
        expect(result.projections.filter(proj => proj.id === "http://www.opengis.net/gml/srs/epsg.xml#4326-DG").length).to.be.equals(1);
    });

    it("should add ETRS89_3GK3 projection with right id", () => {

        const result = initProjections(crs, projections, namedProjections, currentProjection);

        expect(result.projections.filter(proj => proj.name === "ETRS893GK3"));
        expect(result.projections.filter(proj => proj.id === "http://www.opengis.net/gml/srs/epsg.xml#ETRS893GK3").length).to.be.equals(1);
    });
});
