import {expect} from "chai";
import utilsOIDC from "../../js/utilsOIDC";

describe("src/modules/login/js/utilsOIDC", () => {
    describe("generateRandomString", () => {
        it("should generate a string of correct length", () => {
            const randomString = utilsOIDC.generateRandomString();

            expect(randomString).to.be.a("string");
            expect(randomString.length).to.equal(43 * 2);
        });
    });

    describe("parseJwt", () => {
        it("should correctly parse a JWT token", () => {
            const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFudG9uaW8iLCJpYXQiOjE1MTYyMzkwMjJ9.abcdef",
                parsedToken = utilsOIDC.parseJwt(token);

            expect(parsedToken).to.be.an("object");
            expect(parsedToken.name).to.equal("Antonio");
            expect(parsedToken.sub).to.equal("1234567890");
        });

        it("should return an empty object for an invalid token", () => {
            const token = "invalid.token",
                parsedToken = utilsOIDC.parseJwt(token);

            expect(parsedToken).to.deep.equal({});
        });
    });
});

