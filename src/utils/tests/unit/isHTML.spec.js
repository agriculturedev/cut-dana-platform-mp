import {expect} from "chai";
import {isHTML} from "../../isHTML";

describe("src/utils/isHTML.js", function () {
    it("should return false for null", function () {
        expect(isHTML(null)).to.be.false;
    });
    it("should return false for undefined", function () {
        expect(isHTML(undefined)).to.be.false;
    });
    it("should return false for number", function () {
        expect(isHTML(10)).to.be.false;
    });
    it("should return false for boolean true", function () {
        expect(isHTML(true)).to.be.false;
    });
    it("should return false for boolean false", function () {
        expect(isHTML(false)).to.be.false;
    });
    it("should return false for empty string", function () {
        expect(isHTML("")).to.be.false;
    });
    it("should return false for invalid string", function () {
        expect(isHTML("<tag>no closing tag")).to.be.false;
    });
    it("should return true for valid html string, self closing tag", function () {
        expect(isHTML("<tag/>")).to.be.true;
    });
    it("should return true for valid html string", function () {
        expect(isHTML("<tag></tag>")).to.be.true;
    });
    it("should return true for stand-alone tag", function () {
        expect(isHTML("<br>")).to.be.true;
    });
    it("should return true for valid html string with attributes, img", function () {
        expect(isHTML("<img style=\"max-width:100%\" src=\"https://foo.bar\"/>")).to.be.true;
    });
    it("should return true for valid html string with attributes, iframe", function () {
        expect(isHTML("<iframe width=\"250px\" height=\"250px\" src=\"https://foo.bar\" frameborder=\"0\" allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen=\"true\"></iframe>")).to.be.true;
    });
    it("should return true for nested tags", function () {
        expect(isHTML("<p>Große Str. 123, 12345 Stadt<br /><a href=\"https://example.org\" class=\"link\">Zum Standort</a></p>")).to.be.true;
    });
    it("should return true for two opening and closing tags", function () {
        expect(isHTML("<span>Foo</span><span>Bar</span>")).to.be.true;
    });
    it("should return true for two opening and closing tags and one stand-alone tag", function () {
        expect(isHTML("<p>Foo</p><hr><p>Bar</p>")).to.be.true;
    });
    it("should return false for possible XSS", function () {
        expect(isHTML("<div onmouseover=\"'$varUnsafe'\"</div>")).to.be.false;
    });
});
