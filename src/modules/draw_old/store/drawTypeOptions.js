const drawTypeOptions = [
    {geometry: "Point", id: "drawSymbol"},
    {geometry: "LineString", id: "drawLine", altGeometry: ["MultiLineString"]},
    {geometry: "LineString", id: "drawCurve"},
    {geometry: "Polygon", id: "drawArea"},
    {geometry: "Square", id: "drawSquare"},
    {geometry: "Circle", id: "drawCircle"},
    {geometry: "Circle", id: "drawDoubleCircle"},
    {geometry: "Point", id: "writeText"}
];

export default drawTypeOptions;
