import {expect} from "chai";
import cookieUtils from "../../js/utilsCookies";

describe("src/modules/login/js/utilsCookies.js", () => {
    let mockCookieStore = {};
    const originalGlobalDocument = global.document;

    beforeEach(() => {
        global.document = {
            get cookie () {
                return Object.keys(mockCookieStore)
                    .map(key => `${key}=${mockCookieStore[key]}`)
                    .join("; ");
            },
            set cookie (cookieString) {
                const [nameValue] = cookieString.split("; "),
                    [name, value] = nameValue.split("=");

                mockCookieStore[name] = value;
            }
        };
    });

    afterEach(() => {
        mockCookieStore = {};
        global.document = originalGlobalDocument;
    });

    describe("set", () => {
        it("should set a cookie", () => {
            cookieUtils.set("test", "123", 1);
            expect(document.cookie).to.include("test=123");
        });
    });

    describe("get", () => {
        it("should get the value of an existing cookie", () => {
            document.cookie = "test=123";
            expect(cookieUtils.get("test")).to.equal("123");
        });

        it("should return undefined for a non-existing cookie", () => {
            expect(cookieUtils.get("nonExisting")).to.be.undefined;
        });
    });

    describe("erase", () => {
        it("should erase an existing cookie", () => {
            document.cookie = "test=123";
            cookieUtils.erase("test=123");

            expect(document.cookie).to.equal("test=123");
        });
    });

    describe("eraseAll", () => {
        it("should erase all existing cookie", () => {
            document.cookie = "test=123";
            cookieUtils.eraseAll(["test=123"]);

            expect(document.cookie).to.equal("test=123");
        });
    });
});

