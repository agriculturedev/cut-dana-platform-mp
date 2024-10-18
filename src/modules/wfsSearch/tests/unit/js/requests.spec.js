import {expect} from "chai";
import requestsModule from "../../../utils/requests";

describe("src/modules/tools/wfsSearch/utils/requests.js", () => {
    describe("createUrl", () => {
        it("createUrl should respect questionmark in given url", () => {
            const url = "https://mapservice.regensburg.de/cgi-bin/mapserv?map=wfs.map",
                typeName = "typeName",
                filter = "filter=filter",
                fromServicesJson = true,
                storedQueryId = "storedQueryId",
                maxFeatures = 10,
                featureType = "featureType",
                createdUrl = decodeURI(requestsModule.createUrl(url, typeName, filter, fromServicesJson, storedQueryId, maxFeatures, featureType)),
                expectedUrl = "https://mapservice.regensburg.de/cgi-bin/mapserv?map=wfs.map&service=WFS&request=GetFeature&typeName=featureType&maxFeatures=10&version=2.0.0&StoredQuery_ID=storedQueryId&filter=filter";

            expect(createdUrl).to.eql(expectedUrl);
        });

        it("createUrl with usual url given", () => {
            const url = "https://getwfs.de",
                typeName = "typeName",
                filter = "filter=filter",
                fromServicesJson = true,
                storedQueryId = "storedQueryId",
                maxFeatures = 10,
                featureType = "featureType",
                createdUrl = decodeURI(requestsModule.createUrl(url, typeName, filter, fromServicesJson, storedQueryId, maxFeatures, featureType)),
                expectedUrl = "https://getwfs.de/?service=WFS&request=GetFeature&typeName=featureType&maxFeatures=10&version=2.0.0&StoredQuery_ID=storedQueryId&filter=filter";

            expect(createdUrl).to.eql(expectedUrl);
        });

        it("createUrl not from servicesJson", () => {
            const url = "https://getwfs.de",
                typeName = "typeName",
                filter = "filter=filter",
                fromServicesJson = false,
                storedQueryId = "storedQueryId",
                maxFeatures = 10,
                featureType = "featureType",
                createdUrl = decodeURI(requestsModule.createUrl(url, typeName, filter, fromServicesJson, storedQueryId, maxFeatures, featureType)),
                expectedUrl = "https://getwfs.de/?maxFeatures=10&version=2.0.0&StoredQuery_ID=storedQueryId&filter=filter";

            expect(createdUrl).to.eql(expectedUrl);
        });

        it("createUrl maxFeatures is 'showAll' and storedFilter", () => {
            const url = "https://getwfs.de",
                typeName = "typeName",
                filter = "&filter=filter&neu=neu",
                fromServicesJson = false,
                storedQueryId = "storedQueryId",
                maxFeatures = "showAll",
                featureType = "featureType",
                createdUrl = decodeURI(requestsModule.createUrl(url, typeName, filter, fromServicesJson, storedQueryId, maxFeatures, featureType)),
                expectedUrl = "https://getwfs.de/?version=2.0.0&StoredQuery_ID=storedQueryId&filter=filter&neu=neu";

            expect(createdUrl).to.eql(expectedUrl);
        });

        it("createUrl maxFeatures is 'showAll' and xmlFilter", () => {
            const url = "https://getwfs.de",
                typeName = "typeName",
                filter = "filter",
                fromServicesJson = false,
                storedQueryId = null,
                maxFeatures = "showAll",
                featureType = "featureType",
                createdUrl = requestsModule.createUrl(url, typeName, filter, fromServicesJson, storedQueryId, maxFeatures, featureType),
                expectedUrlParam = "<ogc:Filter xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:gml=\"http://www.opengis.net/gml\">filter</ogc:Filter>";

            expect(createdUrl.origin).to.eql(url);
            expect(createdUrl.searchParams.get("filter")).to.eql(expectedUrlParam);
            expect(createdUrl.searchParams.get("version")).to.eql("1.1.0");
        });
    });


});
