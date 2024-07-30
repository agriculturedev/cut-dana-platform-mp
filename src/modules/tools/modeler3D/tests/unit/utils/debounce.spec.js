import {expect} from "chai";
import sinon from "sinon";
import debounce from "../../../utils/debounce.js"

describe("debounce function", () => {
    it("should call passed function only once if second call is made before delay is over", (done) => {
        const funcSpy = sinon.spy(() => undefined),
            debouncedFunc = debounce(funcSpy, this, 10);

        debouncedFunc();
        setTimeout(debouncedFunc, 1);

        setTimeout(() => {
            expect(funcSpy.calledOnce).to.be.true;
            done();
         }, 100);
    });
    it("should call passed function twice if second call is made after delay is over", (done) => {
        const funcSpy = sinon.spy(() => undefined),
            debouncedFunc = debounce(funcSpy, this, 1);

        debouncedFunc();
        setTimeout(debouncedFunc, 10);

        setTimeout(() => {
            expect(funcSpy.calledTwice).to.be.true;
            done();
        }, 100);
    });
});