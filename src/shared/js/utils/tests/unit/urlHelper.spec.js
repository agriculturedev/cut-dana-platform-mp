import {expect} from "chai";
import {isImage, isUrl, isWebLink, setWebLinks} from "../../urlHelper";

describe("src/shared/js/utils/urlHelper.js", () => {
    it("detects an URL in an incoming string", () => {
        const incomingString = "https://test.example.com";

        expect(isUrl(incomingString)).to.be.true;
    });
    it("detects an URL in an incoming string", () => {
        const incomingString = "http://test.example.com";

        expect(isUrl(incomingString)).to.be.true;
    });
    it("detects an HTML file in an incoming string", () => {
        const incomingString = "test.example.com/index.html";

        expect(isUrl(incomingString)).to.be.true;
    });
    it("detects that an incoming string is not an URL or HTML file", () => {
        const incomingString = "test@mail.com";

        expect(isUrl(incomingString)).to.be.false;
    });
    it("detects that an incoming string is not an URL or HTML file", () => {
        const incomingString = "089 / 1234567";

        expect(isUrl(incomingString)).to.be.false;
    });

    describe("isWebLink", () => {
        it("should return a boolean false no matter what kind of input is given (except for links)", () => {
            expect(isWebLink(undefined)).to.be.false;
            expect(isWebLink(null)).to.be.false;
            expect(isWebLink(1234)).to.be.false;
            expect(isWebLink("string")).to.be.false;
            expect(isWebLink({})).to.be.false;
            expect(isWebLink([])).to.be.false;
            expect(isWebLink(false)).to.be.false;
            expect(isWebLink(true)).to.be.false;
        });

        it("should respond to a string beginning with http:// with boolean true", () => {
            expect(isWebLink("http://")).to.be.true;
        });
        it("should respond to a string with uppercase http:// with boolean true", () => {
            expect(isWebLink("HTTP://")).to.be.true;
        });
        it("should not recognize a link within a string", () => {
            expect(isWebLink("stringhttp://string")).to.be.false;
        });

        it("should respond to a string beginning with https:// with boolean true", () => {
            expect(isWebLink("https://")).to.be.true;
        });
        it("should respond to a string beginning with ftp:// with boolean true", () => {
            expect(isWebLink("ftp://")).to.be.true;
        });
        it("should respond to a string beginning with ftp:// with boolean true", () => {
            expect(isWebLink("sftp://")).to.be.true;
        });
        it("should respond to a string beginning with file:// with boolean true", () => {
            expect(isWebLink("file://")).to.be.true;
        });
        it("should respond to a string beginning with // with boolean true", () => {
            expect(isWebLink("//")).to.be.true;
        });
    });

    describe("isImage", () => {
        it("should return a boolean false no matter what kind of input is given (except for links)", () => {
            expect(isImage(undefined)).to.be.false;
            expect(isImage(null)).to.be.false;
            expect(isImage(1234)).to.be.false;
            expect(isImage("string")).to.be.false;
            expect(isImage({})).to.be.false;
            expect(isImage([])).to.be.false;
            expect(isImage(false)).to.be.false;
            expect(isImage(true)).to.be.false;
        });

        it("should respond to a string with png with boolean true", () => {
            expect(isWebLink("http://porta.de/thema/Bilder/Bile.png")).to.be.true;
        });
        it("should respond to a string with PNG with boolean true", () => {
            expect(isWebLink("http://porta.de/thema/Bilder/Bile.PNG")).to.be.true;
        });
        it("should respond to a string with jpg with boolean true", () => {
            expect(isWebLink("http://porta.de/thema/Bilder/Bile.jpg?width=200&height=150&keepRatio=true")).to.be.true;
        });
        it("should respond to a string with JPG with boolean true", () => {
            expect(isWebLink("http://porta.de/thema/Bilder/Bile.JPG")).to.be.true;
        });
        it("should respond to a string with jpeg with boolean true", () => {
            expect(isWebLink("http://porta.de/thema/Bilder/Bile.jpeg")).to.be.true;
        });
        it("should respond to a string with gif with boolean true", () => {
            expect(isWebLink("http://porta.de/thema/Bilder/Bile.gif")).to.be.true;
        });
        it("should respond to a string with bmp with boolean true", () => {
            expect(isWebLink("http://porta.de/thema/Bilder/Bile.bmp")).to.be.true;
        });
    });

    const testTextSetWebLinksInKlammern = "gemäß Datenlizenz Deutschland Namensnennung 2.0 (https://www.govdata.de/dl-de/by-2-0) zur Verfügung gestellt. Verwendung erlaubt, siehe https://sgx.geodatenzentrum.de/web_public/gdz/lizenz/deu/Datenlizenz_Deutschland_Ergänzungstext_Namensnennung.pdf. Der Quellenvermerk ist zu beachten.",
        testTextSetWebLinksInJSON = "{\"id\":\"dl-by-de/2.0\",\"name\":\"Datenlizenz Deutschland Namensnennung 2.0\",\"url\":\"https://www.govdata.de/dl-de/by-2-0\",\"quelle\":\"Kartendarstellung: © Bundesamt für Kartographie und Geodäsie (2023), Datenquellen: https://sg.geodatenzentrum.de/web_public/Datenquellen_TopPlus_Open.html\"}";

    describe("setWebLinks", () => {
        it("should leave text untouched", () => {
            expect(setWebLinks("Hello world")).to.be.a("string").to.equal("Hello world");
        });
        it("should replace urls in text by a tags", () => {
            expect(setWebLinks(testTextSetWebLinksInKlammern)).to.be.a("string").to.equal("gemäß Datenlizenz Deutschland Namensnennung 2.0 (<a href=\"https://www.govdata.de/dl-de/by-2-0\" target=\"_new\">https://www.govdata.de/dl-de/by-2-0</a>) zur Verfügung gestellt. Verwendung erlaubt, siehe <a href=\"https://sgx.geodatenzentrum.de/web_public/gdz/lizenz/deu/Datenlizenz_Deutschland_Ergänzungstext_Namensnennung.pdf\" target=\"_new\">https://sgx.geodatenzentrum.de/web_public/gdz/lizenz/deu/Datenlizenz_Deutschland_Ergänzungstext_Namensnennung.pdf</a>. Der Quellenvermerk ist zu beachten.");
        });
        it("should replace urls in text by a tags", () => {
            expect(setWebLinks(testTextSetWebLinksInJSON)).to.be.a("string").to.equal("{\"id\":\"dl-by-de/2.0\",\"name\":\"Datenlizenz Deutschland Namensnennung 2.0\",\"url\":\"<a href=\"https://www.govdata.de/dl-de/by-2-0\" target=\"_new\">https://www.govdata.de/dl-de/by-2-0</a>\",\"quelle\":\"Kartendarstellung: © Bundesamt für Kartographie und Geodäsie (2023), Datenquellen: <a href=\"https://sg.geodatenzentrum.de/web_public/Datenquellen_TopPlus_Open.html\" target=\"_new\">https://sg.geodatenzentrum.de/web_public/Datenquellen_TopPlus_Open.html</a>\"}");
        });
    });
});
