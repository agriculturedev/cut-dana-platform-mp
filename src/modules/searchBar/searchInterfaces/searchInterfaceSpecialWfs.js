import SearchInterface from "./searchInterface";
import WFS from "ol/format/WFS";
import {uniqueId} from "../../../shared/js/utils/uniqueId";

/**
 * The search interface to the special wfs.
 * @module modules/searchBar/searchInterfaces/searchInterfaceSpecialWfs
 * @name searchInterfaceSpecialWfs
 * @constructs
 * @extends SearchInterface
 * @param {Object} definitions Special WFS search definitions.
 * @param {String} definitions.icon CSS glyphicon class of search results, shown before the result name.
 * @param {String} [definitions.geometryName] Geometry attribute name required for zoom functionality.
 * @param {String} [definitions.maxFeatures] Maximum amount of features to be returned.
 * @param {String} definitions.name Category name displayed in the result list.
 * @param {String} definitions.namespaces XML name spaces to request `propertyNames` or `geometryName`. (`xmlns:wfs`, `xmlns:ogc`, and `xmlns:gml` are always used).
 * @param {String[]} definitions.propertyNames Array of attribute names to be searched.
 * @param {String} definitions.typeName The name of the WFS layer to be requested.
 * @param {String} definitions.url The WFS URL.
 *
 * @param {String} [hitTemplate="default"] The template for rendering the hits.
 * @param {String} [icon="bi-house"] Default icon used in the result list.
 * @param {String} [geometryName="app:geom"] Geometry attribute name required for zoom functionality.
 * @param {Number} [maxFeatures=20] Maximum amount of features returned.
 * @param {String} [namespaces="xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml'"] XML name spaces to request `propertyNames` or `geometryName`.
 * @param {Object} [resultEvents] Actions that are executed when an interaction, such as hover or click, is performed with a result list item.
 * @param {String[]} [resultEvents.onClick=["highlightFeature", "setMarker", "zoomToResult"]] Actions that are fired when clicking on a result list item.
 * @param {String[]} [resultEvents.onHover=["highlightFeature", "setMarker"]] Actions that are fired when hovering on a result list item.
 * @param {String} [searchInterfaceId="specialWfs"] The id of the service interface.
 * @returns {void}
 */
export default function SearchInterfaceSpecialWfs ({definitions, hitTemplate, icon, geometryName, maxFeatures, namespaces, resultEvents, searchInterfaceId} = {}) {
    const resultEventsDefault = {
            onClick: ["highlightFeature", "setMarker", "zoomToResult"],
            onHover: ["highlightFeature", "setMarker"]
        },
        resultEventsSupported = ["highlightFeature", "setMarker", "zoomToResult"];

    this.checkConfig(resultEvents, resultEventsSupported, searchInterfaceId);
    SearchInterface.call(this,
        "client",
        searchInterfaceId || "specialWfs",
        resultEvents || resultEventsDefault,
        hitTemplate
    );

    this.definitions = definitions;

    this.icon = icon || "bi-house";
    this.geometryName = geometryName || "app:geom";
    this.maxFeatures = maxFeatures || 20;
    this.namespaces = namespaces || "xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml'";
}

SearchInterfaceSpecialWfs.prototype = Object.create(SearchInterface.prototype);

/**
 * Search in special wfs search interface.
 * @override
 * @param {String} searchInput The search input.
 * @returns {Object} the search results
 */
SearchInterfaceSpecialWfs.prototype.search = async function (searchInput) {
    this.searchState = "running";

    for (const definition of this.definitions) {
        const wfsXml = this.getWFS110Xml(definition, searchInput);
        let result = {
            status: "success",
            message: "",
            hits: []
        };

        result = await this.sendRequest(definition.url, definition, wfsXml, result);
        result.hits = this.normalizeResults(result.hits);

        this.pushHitsToSearchResults(result.hits);
    }

    this.searchState = "finished";
    return this.searchResults;
};

/**
 * Normalizes the search results to display them in a SearchResult.
 * @param {Object[]} searchResults The search results of wfs.
 * @returns {Object[]} The normalized search result.
 */
SearchInterfaceSpecialWfs.prototype.normalizeResults = function (searchResults) {
    const normalizedResults = [];

    searchResults.forEach(searchResult => {
        normalizedResults.push({
            events: this.normalizeResultEvents(this.resultEvents, searchResult),
            category: i18next.t(searchResult.type),
            icon: searchResult.icon,
            id: uniqueId("SpecialWFS"),
            name: searchResult.identifier,
            toolTip: `${searchResult.identifier}`
        });
    });

    return normalizedResults;
};

/**
     * Creates the XML for a WFS 1.1.0 POST request
     * @param   {Object} definition    Definition from Configuration
     * @param   {String} searchString  The string queried
     * @returns {String}               XML String
     */
SearchInterfaceSpecialWfs.prototype.getWFS110Xml = function (definition, searchString) {
    const typeName = definition.typeName,
        propertyNames = definition.propertyNames,
        geometryName = definition.geometryName ? definition.geometryName : this.geometryName,
        maxFeatures = definition.maxFeatures ? definition.maxFeatures : this.maxFeatures,
        namespaces = definition.namespaces ? this.namespaces + " " + definition.namespaces : this.namespaces;
    let data, propertyName;

    data = "<wfs:GetFeature service='WFS' ";
    data += namespaces + " traverseXlinkDepth='*' version='1.1.0'>";
    data += "<wfs:Query typeName='" + typeName + "'>";
    for (propertyName of propertyNames) {
        data += "<wfs:PropertyName>" + propertyName + "</wfs:PropertyName>";
    }
    data += "<wfs:PropertyName>" + geometryName + "</wfs:PropertyName>";
    data += "<wfs:maxFeatures>" + maxFeatures + "</wfs:maxFeatures>";
    data += "<ogc:Filter>";
    if (propertyNames.length > 1) {
        data += "<ogc:Or>";
    }
    for (propertyName of propertyNames) {
        data += "<ogc:PropertyIsLike matchCase='false' wildCard='*' singleChar='#' escapeChar='!'><ogc:PropertyName>" + propertyName + "</ogc:PropertyName><ogc:Literal>*" + searchString + "*</ogc:Literal></ogc:PropertyIsLike>";
    }
    if (propertyNames.length > 1) {
        data += "</ogc:Or>";
    }
    data += "</ogc:Filter></wfs:Query></wfs:GetFeature>";

    return data;
};

/**
 * Sends the request.
 * @param {String} url url to send request.
 * @param {Object} requestConfig Config with all necccessary params for request.
 * @param {String} payload The request.
 * @param {Object} result Result object.
 * @param {String} result.status Status of request "success" or "error".
 * @param {String} result.message Message of request.
 * @param {Object[]} result.hits Array of result hits.
 * @returns {Object} Parsed result of request.
 */
SearchInterfaceSpecialWfs.prototype.sendRequest = async function (url, requestConfig, payload, result) {
    let resultData = result;
    const resultXml = await this.requestSearch(url, "POST", payload, "application/xml");

    resultData = this.fillHitList(resultXml, resultData, requestConfig);

    return resultData;
};

/**
 * Fills the hitlist.
 * @param {String} xml The WFS result xml to parse.
 * @param {Object} result The result object.
 * @param {Object} requestConfig The request configuration.
 * @returns {Object} Aggregated result object containing the hits.
 */
SearchInterfaceSpecialWfs.prototype.fillHitList = function (xml, result, requestConfig) {
    const type = requestConfig.name,
        typeName = requestConfig.typeName,
        propertyNames = requestConfig.propertyNames,
        geometryName = requestConfig.geometryName ? requestConfig.geometryName : this.geometryName,
        icon = requestConfig.icon ? requestConfig.icon : this.icon,
        multiGeometries = ["MULTIPOLYGON"],
        parser = new DOMParser(),
        xmlData = parser.parseFromString(xml, "application/xml"),
        elements = xmlData.getElementsByTagNameNS("*", typeName.split(":")[1]),
        resultData = result;

    for (let i = 0; i < elements.length && i < this.maxFeatures; i++) {
        const element = elements[i];

        propertyNames.forEach(propertyName => {
            if (element.getElementsByTagName(propertyName).length > 0 && element.getElementsByTagName(geometryName).length > 0) {
                const elementGeometryName = element.getElementsByTagNameNS("*", geometryName.split(":")[1])[0],
                    elementGeometryFirstChild = elementGeometryName.firstElementChild,
                    firstChildNameUpperCase = elementGeometryFirstChild.localName.toUpperCase(),
                    identifier = element.getElementsByTagName(propertyName)[0].textContent;
                let geometry, geometryType, coordinates;

                if (multiGeometries.includes(firstChildNameUpperCase)) {
                    const memberName = elementGeometryFirstChild.firstElementChild.localName,
                        geometryMembers = elementGeometryName.getElementsByTagNameNS("*", memberName);

                    coordinates = this.getInteriorAndExteriorPolygonMembers(geometryMembers);
                    geometry = undefined;
                    geometryType = "MultiPolygon";
                }
                else {
                    const feature = new WFS().readFeatures(xml)[i];

                    geometry = feature.getGeometry();
                    coordinates = undefined;
                    geometryType = geometry.getType();
                }

                resultData.hits.push(
                    {
                        type,
                        identifier,
                        geometryType,
                        geometry,
                        coordinates,
                        icon
                    }
                );
            }
            else {
                console.error("Missing properties in specialWFS-Response. Ignoring Feature...");
            }
        });
    }

    return resultData;
};

/**
 * Function to extract the coordinates of every polygon and polygons with interior polygons / holes
 * @param   {Object} polygonMembers members of the polygon
 * @returns {Array[]} returns the coordinates of every polygon
 */
SearchInterfaceSpecialWfs.prototype.getInteriorAndExteriorPolygonMembers = function (polygonMembers) {
    const lengthIndex = polygonMembers.length,
        coordinateArray = [];

    for (let i = 0; i < lengthIndex; i++) {
        const posListPolygonMembers = polygonMembers[i].getElementsByTagNameNS("*", "posList");

        for (const key in Object.keys(posListPolygonMembers)) {
            const posPolygonMembers = posListPolygonMembers[key].getElementsByTagNameNS("*", "pos");

            if (posPolygonMembers.length > 0) {
                Array.from(posPolygonMembers).forEach(posElement => {

                    for (const posKey in Object.keys(posElement)) {
                        const coordinatesText = posElement[posKey].textContent,
                            coords = coordinatesText.trim().split(" ").map(Number);

                        coords.forEach(coordArray => coordinateArray.push(coordArray));
                    }
                });
            }
            else {
                const coordinatesText = posListPolygonMembers[key].textContent,
                    coords = coordinatesText.trim().split(" ").map(Number);

                coords.forEach(coordArray => coordinateArray.push(coordArray));
            }
        }
    }
    return [coordinateArray];
};

/**
 * Creates the possible actions and fills them.
 * @override
 * @param {Object} searchResult The search result.
 * @returns {Object} The possible actions.
 */
SearchInterfaceSpecialWfs.prototype.createPossibleActions = function (searchResult) {
    const coordinates = [];

    if (Array.isArray(searchResult?.coordinates)) {
        searchResult.coordinates.forEach(coord => {
            if (Array.isArray(coord)) {
                coord.forEach(coordinate => {
                    coordinates.push(parseFloat(coordinate));
                });
            }
            else {
                coordinates.push(parseFloat(coord));
            }
        });
    }
    else if (Array.isArray(searchResult?.geometry)) {
        searchResult.geometry.forEach(coord => {
            if (Array.isArray(coord)) {
                coord.forEach(coordinate => {
                    coordinates.push(parseFloat(coordinate));
                });
            }
            if (coord) {
                coordinates.push(parseFloat(coord));
            }
        });
    }
    else if (searchResult?.geometry?.flatCoordinates) {
        searchResult?.geometry?.flatCoordinates.forEach(coord => {
            if (coord) {
                coordinates.push(parseFloat(coord));
            }
        });
    }

    return {
        highlightFeature: {
            hit: {
                coordinate: [coordinates],
                geometryType: searchResult.geometryType
            }
        },
        setMarker: {
            coordinates: coordinates
        },
        zoomToResult: {
            coordinates: coordinates
        }
    };
};
