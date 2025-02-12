import {expect} from "chai";
import decodeHtmlEntites from "../../htmlEntities";

describe("src/shared/js/utils/htmlEntities", () => {
    it("should decode html entities from a string", () => {
        expect(decodeHtmlEntites("today &nbsp; tomorrow")).to.equals("today   tomorrow");
        expect(decodeHtmlEntites("today &lt; tomorrow")).to.equals("today < tomorrow");
        expect(decodeHtmlEntites("today &gt; tomorrow")).to.equals("today > tomorrow");
        expect(decodeHtmlEntites("today &amp; tomorrow")).to.equals("today & tomorrow");
        expect(decodeHtmlEntites("today &quot; tomorrow")).to.equals("today \" tomorrow");
        expect(decodeHtmlEntites("today &apos; tomorrow")).to.equals("today ' tomorrow");
        expect(decodeHtmlEntites("today &ndash; tomorrow")).to.equals("today - tomorrow");
    });
});
