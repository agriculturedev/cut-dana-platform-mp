import {expect} from "chai";

import {createMessage, createSubject, createTicketId} from "../../../js/createFunctions";

describe("src/modules/contact/js/createFunctions", function () {
    describe("createTicketId", function () {
        it("generates an id with expected format", function () {
            expect(createTicketId()).to.match(/^\d{4}-\d{4,5}-\d{4,5}$/);
        });
    });

    describe("createSubject", function () {
        it("generates the subject line", function () {
            expect(createSubject("A", "B")).to.equal("A: B");
        });
    });

    describe("createSystemInfo", function () {
        it("formats input as expected", function () {
            expect(createMessage({
                username: "Basil Exposition",
                mail: "basil@example.com",
                phone: "555",
                message: "It just doesn't work."
            }, {
                referrer: "url",
                portalTitle: "The Great Portal",
                platform: "Win95",
                cookieEnabled: true,
                userAgent: "Austin Powers"
            })).to.equal(
                "Name: Basil Exposition<br>" +
                "E-Mail: basil@example.com<br>" +
                "Tel.:: 555<br>" +
                "==================<br>" +
                "It just doesn't work.<br>" +
                "<br>" +
                "==================<br>" +
                "Referrer: <a href=\"url\">The Great Portal</a><br>" +
                "Platform: Win95<br>" +
                "Cookies enabled: true<br>" +
                "UserAgent: Austin Powers<br>"
            );
        });
    });

    describe("mailOriginHint", function () {
        it("include mail origin hint", function () {
            expect(createMessage({
                username: "Basil Exposition",
                mail: "basil@example.com",
                phone: "555",
                message: "It just doesn't work."
            }, null,
            "origin hint"
            )).to.equal(
                "Name: Basil Exposition<br>" +
                "E-Mail: basil@example.com<br>" +
                "Tel.:: 555<br>" +
                "==================<br>" +
                "It just doesn't work." +
                "<br>" +
                "==================<br>" +
                "origin hint"
            );
        });
    });
});
