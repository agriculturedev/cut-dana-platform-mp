import {expect} from "chai";

import getSystemInfo from "../../../js/getSystemInfo";

describe("src/modules/contact/js/getSystemInfo", function () {
    it("returns values from global variables", function () {
        const systemInfo = getSystemInfo();

        expect(systemInfo.portalTitle).to.be.a("string");
        expect(systemInfo.referrer).to.be.a("string");
        expect(systemInfo.platform).to.be.a("string");
        expect(systemInfo.cookieEnabled).to.be.a("boolean");
        expect(systemInfo.userAgent).to.be.a("string");
    });

    it("prefers titles supplied by parameter", function () {
        expect(getSystemInfo("test").portalTitle).to.eql("test");
    });
});
