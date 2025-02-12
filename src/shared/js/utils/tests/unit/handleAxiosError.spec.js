import {expect} from "chai";
import handleAxiosErrorModule from "../../../utils/handleAxiosError";
import sinon from "sinon";

describe("src/shared/js/api/utils/handleAxiosError.js", () => {
    let error,
        warn;

    beforeEach(() => {
        error = sinon.spy();
        warn = sinon.spy();
        sinon.stub(console, "error").callsFake(error);
        sinon.stub(console, "warn").callsFake(warn);
    });

    afterEach(() => {
        sinon.restore();
    });

    it("should trigger a specific amount of errors and warnings if the given object is a common Error", () => {
        handleAxiosErrorModule.handleAxiosError(undefined, "functionName");
        expect(error.calledTwice).to.be.true;
        expect(warn.calledOnce).to.be.true;
    });
    it("should trigger a specific amount of errors and warnings if the given object is an (error) object with response", () => {
        handleAxiosErrorModule.handleAxiosError({response: true, request: true}, "functionName");
        expect(error.callCount).to.equal(4);
        expect(warn.calledOnce).to.be.true;
    });
    it("should trigger a specific amount of errors and warnings if the given object is an (error) object without response but with request", () => {
        handleAxiosErrorModule.handleAxiosError({request: true}, "functionName");
        expect(error.calledTwice).to.be.true;
        expect(warn.calledOnce).to.be.true;
    });
    it("should also hand over a message to the given callback", () => {
        let lastErrorMessage = null;

        handleAxiosErrorModule.handleAxiosError(undefined, "functionName", errorMessage => {
            lastErrorMessage = errorMessage;
        });
        expect(lastErrorMessage).to.be.a("string");
    });
});
