
import store from "../../../../../../../app-store";
import {expect} from "chai";
import sinon from "sinon";
import {
    getRoutingElasticUrl
} from "../../../../utils/geosearch/routing-elastic-geosearch";

describe("src/modules/tools/routing/utils/geosearch/routing-elastic-geosearch.js", () => {
    let service;

    beforeEach(() => {
        service = "https://service";
        sinon.stub(i18next, "t").callsFake((...args) => args);
        store.getters = {
            getRestServiceById: sinon.stub().callsFake(() =>{
                return {url: service};
            })
        };
        store.state.geosearch = {
            serviceId: {
                url: "http://serviceId.url"
            }};
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("getRoutingElasticUrl", () => {
        it("test params", () => {
            const payload = {
                    a: "a",
                    b: [{c: "c"}]
                },
                createdUrl = getRoutingElasticUrl(payload);

            expect(createdUrl.origin).to.eql(service);
            expect(createdUrl.searchParams.get("source_content_type")).to.eql("application/json");
            expect(createdUrl.searchParams.get("source")).to.eql(JSON.stringify(payload));
        });

        it("createUrl should respect questionmark in serviceUrl", () => {
            const payload = {
                a: "a",
                b: [{c: "c"}]
            };
            let createdUrl = null;

            service = "https://mapservice.regensburg.de/cgi-bin/mapserv?map=wfs.map";
            createdUrl = getRoutingElasticUrl(payload);

            expect(createdUrl.origin).to.eql("https://mapservice.regensburg.de");
            expect(decodeURI(createdUrl)).to.eql(service + "&source_content_type=application%2Fjson&source={\"a\"%3A\"a\"%2C\"b\"%3A[{\"c\"%3A\"c\"}]}");
            expect(createdUrl.searchParams.get("source_content_type")).to.eql("application/json");
            expect(createdUrl.searchParams.get("source")).to.eql(JSON.stringify(payload));
        });
    });
});
