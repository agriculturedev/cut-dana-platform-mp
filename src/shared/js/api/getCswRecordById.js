import axios from "axios";
import dayjs from "dayjs";

import getNestedValues from "../utils/getNestedValues";
import {handleAxiosError} from "../utils/handleAxiosError";
import xml2json from "../utils/xml2json";
import {setWebLinks} from "../utils/urlHelper";

/**
 * Handles the GetRecordById request.
 * @param {String} url - the csw request url
 * @param {String} metadataId - the metadata id
 * @param {String} [outputSchema="http://www.isotc211.org/2005/gmd"] - the output schema of the response
 * @param {String} [elementSetName="full"] - specify which properties are included in the response
 * @param {String} [version="2.0.2"] - csw api version
 * @returns {Promise<Object|undefined>}  Promise object represents the GetFeatureInfo request
 */
function getRecordById (url, metadataId, outputSchema = "http://www.isotc211.org/2005/gmd", elementSetName = "full", version = "2.0.2") {
    return axios.get(url, {
        params: {
            service: "CSW",
            request: "GetRecordById",
            version: version,
            outputschema: outputSchema,
            elementsetname: elementSetName,
            id: metadataId
        }
    })
        .then(response => xml2json(response.request.responseXML))
        .then(json => getMetadata(json))
        .catch(error => handleAxiosError(error, "getRecordById"));
}

/**
 * Gets an object for specific metadata.
 * @param {Object} json - the response of getRecordById as JSON
 * @returns {Object} metadata
 */
function getMetadata (json) {
    return {
        getTitle: () => parseTitle(json),
        getAbstract: () => parseAbstract(json),
        getFrequenzy: () => parseFrequenzy(json),
        getPublicationDate: () => parseDate(json, "publication"),
        getCreationDate: () => parseDate(json, "creation"),
        getRevisionDate: () => parseDate(json, "revision"),
        getDownloadLinks: () => parseDownloadLinks(json),
        getOwner: () => parseContactByRole(json, "owner"),
        getContact: () => parseContactByRole(json, "pointOfContact"),
        getConstraints: (parseLinks = false) => parseConstraints(json, parseLinks),
        getPublisher: () => parseContactByRole(json, "publisher")
    };
}

/**
 * Gets the MD_Identification node.
 * MD_Identification may be implemented as MD_DataIdentification or SV_ServiceIdentification.
 * @param {Object} json The csw result json .
 * @see {@link https://portal.ogc.org/files/?artifact_id=56905}
 * @see {@link http://portal.opengeospatial.org/files/?artifact_id=6495}
 * @returns {Object|Object[]} todo
 */
function getMdIdentification (json) {
    return json.GetRecordByIdResponse?.MD_Metadata?.identificationInfo?.MD_DataIdentification
        ||
        json.GetRecordByIdResponse?.MD_Metadata?.identificationInfo?.SV_ServiceIdentification
        ||
        json.MD_Metadata?.identificationInfo?.MD_DataIdentification;
}

/**
 * Gets the title of the metadata.
 * @param {Object} json - the response
 * @returns {String} title
 */
function parseTitle (json) {
    return getMdIdentification(json)?.citation?.CI_Citation?.title?.CharacterString?.getValue();
}

/**
 * Gets the resourceConstraints of the metadata.
 * @param {Object} json - the response
 * @param {Boolean} parseLinks - default false, true to call setWebLinks for use contraints
 * @returns {Object} object contains String access for access constraint and Array use for list of use contraints
 */
function parseConstraints (json, parseLinks = false) {
    const constraints = getMdIdentification(json)?.resourceConstraints;
    let access,
        use = [];

    if (Array.isArray(constraints)) {
        constraints.forEach(constraint => {
            const legalConstraints = constraint.MD_LegalConstraints;

            if (legalConstraints?.accessConstraints?.MD_RestrictionCode?.getAttributes()?.codeListValue === "otherRestrictions") {
                access = legalConstraints?.otherConstraints?.Anchor?.getValue();
            }
            if (legalConstraints?.useConstraints?.MD_RestrictionCode?.getAttributes()?.codeListValue === "otherRestrictions") {
                const otherConstraints = legalConstraints?.otherConstraints;

                if (Array.isArray(otherConstraints)) {
                    use = [];
                    otherConstraints.forEach(otherConstraint => {
                        let useConstraint = otherConstraint?.CharacterString?.getValue() || "";

                        if (parseLinks) {
                            useConstraint = setWebLinks(useConstraint);
                        }
                        use.push(useConstraint);
                    });
                }
            }
        });
    }
    return {access, use};
}

/**
 * Gets the abstract of the metadata.
 * @param {Object} json - the response
 * @returns {String} abstract
 */
function parseAbstract (json) {
    let abstractData = getMdIdentification(json)?.abstract?.CharacterString?.getValue();
    const match = (/\r|\n/).exec(abstractData);

    if (match) {
        abstractData = abstractData.replace(/(?:\r\n|\r|\n)/g, "<br>").replace(/(<br ?\/?>)+/gi, "<br>").replace(/(<br ?\/?>)+/gi, "</p><p>");
    }

    return "<p>" + abstractData + "</p>";
}

/**
 * Gets the update frequency of the metadata.
 * @param {Object} json - the response
 * @returns {String|undefined} update frequency
 */
function parseFrequenzy (json) {
    const attributes = getMdIdentification(json)?.resourceMaintenance?.MD_MaintenanceInformation?.maintenanceAndUpdateFrequency?.MD_MaintenanceFrequencyCode?.getAttributes(),
        frequencyTypes = {
            continual: "common:shared.js.api.cswParser.continual",
            daily: "common:shared.js.api.cswParser.daily",
            weekly: "common:shared.js.api.cswParser.weekly",
            fortnightly: "common:shared.js.api.cswParser.fortnightly",
            monthly: "common:shared.js.api.cswParser.monthly",
            quarterly: "common:shared.js.api.cswParser.quarterly",
            biannually: "common:shared.js.api.cswParser.biannually",
            annually: "common:shared.js.api.cswParser.annually",
            asNeeded: "common:shared.js.api.cswParser.asNeeded",
            irregular: "common:shared.js.api.cswParser.irregular",
            notPlanned: "common:shared.js.api.cswParser.notPlanned",
            unknown: "common:shared.js.api.cswParser.unknown"
        };

    if (attributes?.codeListValue) {
        return frequencyTypes[attributes.codeListValue];
    }
    return undefined;
}

/**
 * Gets the date of the metadata by the given type
 * @param {Object} json - the response
 * @param {String} dateType - the type of the date (e.g. publication)
 * @returns {String|undefined} formatted date
 */
function parseDate (json, dateType) {
    const dates = getMdIdentification(json)?.citation?.CI_Citation?.date;
    let dateValue;

    if (Array.isArray(dates)) {
        dates.forEach(date => {
            if (date?.CI_Date?.dateType?.CI_DateTypeCode?.getAttributes()?.codeListValue === dateType) {
                dateValue = date.CI_Date?.date?.DateTime?.getValue() || date.CI_Date?.date?.Date?.getValue();
            }
        });
    }
    else if (dates?.CI_Date?.dateType?.CI_DateTypeCode?.getAttributes()?.codeListValue === dateType) {
        dateValue = dates.CI_Date?.date?.DateTime?.getValue() || dates.CI_Date?.date?.Date?.getValue();
    }

    return typeof dateValue !== "undefined" ? dayjs(dateValue).format("DD.MM.YYYY") : dateValue;
}

/**
 * Gets the download links of the metadata
 * @param {Object} json - the response
 * @returns {Object[]|null} download links
 * @see {@link https://www.isotc211.org/2005/gmd/distribution.xsd}
 * @see {@link https://www.gdi-de.org/sites/default/files/2020-03/Deutsche_Uebersetzung_der_ISO-Felder.pdf}
 */
function parseDownloadLinks (json) {
    const transferOptions = json.GetRecordByIdResponse?.MD_Metadata?.distributionInfo?.MD_Distribution?.transferOptions,
        downloadResources = [];

    if (typeof transferOptions === "object" && transferOptions !== null) {
        const onlineResources = getNestedValues(transferOptions, "CI_OnlineResource");

        onlineResources.forEach(resource => {
            if (resource?.function?.CI_OnLineFunctionCode?.getAttributes().codeListValue === "download") {
                downloadResources.push({
                    // location (address) for on-line access
                    link: resource?.linkage?.URL.getValue(),
                    // name of the online resource
                    linkName: resource?.name?.CharacterString.getValue() || resource?.description?.CharacterString.getValue() || resource?.linkage?.URL.getValue()
                });
            }
        });
    }

    return downloadResources.length > 0 ? downloadResources : null;
}

/**
 * Parses the contact by the given role.
 * @param {Object} json - the response
 * @param {String} role - the role of the contact (e.g. owner)
 * @returns {String} name of the contact
 */
function parseContactByRole (json, role) {
    const pointOfContacts = getMdIdentification(json)?.pointOfContact;
    let dateValue = {};

    if (Array.isArray(pointOfContacts)) {
        pointOfContacts.forEach(contact => {
            if (contact?.CI_ResponsibleParty?.role?.CI_RoleCode?.getAttributes()?.codeListValue === role) {
                dateValue = {
                    name: contact.CI_ResponsibleParty?.organisationName?.CharacterString?.getValue(),
                    positionName: contact.CI_ResponsibleParty?.positionName?.CharacterString?.getValue().split(",").reverse(),
                    street: contact.CI_ResponsibleParty?.contactInfo?.CI_Contact?.address?.CI_Address?.deliveryPoint?.CharacterString?.getValue(),
                    housenr: "",
                    postalCode: contact.CI_ResponsibleParty?.contactInfo?.CI_Contact?.address?.CI_Address?.postalCode?.CharacterString?.getValue(),
                    city: contact.CI_ResponsibleParty?.contactInfo?.CI_Contact?.address?.CI_Address?.city?.CharacterString?.getValue(),
                    email: contact.CI_ResponsibleParty?.contactInfo?.CI_Contact?.address?.CI_Address?.electronicMailAddress?.CharacterString?.getValue(),
                    phone: contact.CI_ResponsibleParty?.contactInfo?.CI_Contact?.phone?.CI_Telephone?.voice?.CharacterString?.getValue(),
                    link: contact.CI_ResponsibleParty?.contactInfo?.CI_Contact?.onlineResource?.CI_OnlineResource?.linkage?.URL?.getValue(),
                    country: contact.CI_ResponsibleParty?.contactInfo?.CI_Contact?.address?.CI_Address?.country?.CharacterString?.getValue()
                };
            }
        });
    }
    else if (pointOfContacts?.CI_ResponsibleParty?.role?.CI_RoleCode?.getAttributes()?.codeListValue === role) {
        dateValue = {
            name: pointOfContacts.CI_ResponsibleParty?.organisationName?.CharacterString?.getValue(),
            positionName: pointOfContacts.CI_ResponsibleParty?.positionName?.CharacterString?.getValue().split(",").reverse(),
            street: pointOfContacts.CI_ResponsibleParty?.contactInfo?.CI_Contact?.address?.CI_Address?.deliveryPoint?.CharacterString?.getValue(),
            housenr: "",
            postalCode: pointOfContacts.CI_ResponsibleParty?.contactInfo?.CI_Contact?.address?.CI_Address?.postalCode?.CharacterString?.getValue(),
            city: pointOfContacts.CI_ResponsibleParty?.contactInfo?.CI_Contact?.address?.CI_Address?.city?.CharacterString?.getValue(),
            email: pointOfContacts.CI_ResponsibleParty?.contactInfo?.CI_Contact?.address?.CI_Address?.electronicMailAddress?.CharacterString?.getValue(),
            phone: pointOfContacts.CI_ResponsibleParty?.contactInfo?.CI_Contact?.phone?.CI_Telephone?.voice?.CharacterString?.getValue(),
            link: pointOfContacts.CI_ResponsibleParty?.contactInfo?.CI_Contact?.onlineResource?.CI_OnlineResource?.linkage?.URL?.getValue(),
            country: pointOfContacts.CI_ResponsibleParty?.contactInfo?.CI_Contact?.address?.CI_Address?.country?.CharacterString?.getValue()
        };
    }

    return dateValue;
}

export default {
    getRecordById,
    getMdIdentification,
    getMetadata,
    parseDate,
    parseTitle,
    parseConstraints
};
