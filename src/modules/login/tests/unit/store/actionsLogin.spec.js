import sinon from "sinon";
import {expect} from "chai";
import actionsLogin from "../../../store/actionsLogin";
import stateLogin from "../../../store/stateLogin";

import OIDC from "../../../js/utilsOIDC";
import Cookie from "../../../js/utilsCookies";

import "mock-local-storage";

describe("src/modules/Modules/Login/store/actionsLogin.js", () => {
    let commit;

    beforeEach(() => {
        commit = sinon.spy();
    });

    afterEach(sinon.restore);

    describe("logout", () => {
        it("resets the state", () => {
            actionsLogin.logout({commit});

            expect(commit.firstCall.args[0]).to.equal("setLoggedIn");
            expect(commit.firstCall.args[1]).to.equal(false);

            expect(commit.secondCall.args[0]).to.equal("setAccessToken");
            expect(commit.secondCall.args[1]).to.equal(undefined);

            expect(commit.thirdCall.args[0]).to.equal("setRefreshToken");
            expect(commit.thirdCall.args[1]).to.equal(undefined);

            expect(commit.getCall(3).args[0]).to.equal("setScreenName");
            expect(commit.getCall(3).args[1]).to.equal(undefined);

            expect(commit.getCall(4).args[0]).to.equal("setUsername");
            expect(commit.getCall(4).args[1]).to.equal(undefined);

            expect(commit.getCall(5).args[0]).to.equal("setEmail");
            expect(commit.getCall(5).args[1]).to.equal(undefined);

            expect(commit.callCount).to.equal(6);
        });

        it("resets all cookies", () => {
            const local_sandbox = sinon.createSandbox(),
                state = {
                    ...stateLogin,
                    loggedIn: true,
                    username: "max",
                    screenName: "Max Mustermann",
                    email: "max@mustermann.de",
                    accessToken: "accessToken",
                    refreshToken: "refreshToken"
                },
                oidcSpy = local_sandbox.spy(OIDC, "eraseCookies"),
                cookieSpy = local_sandbox.spy(Cookie, "eraseAll");

            actionsLogin.logout({state, commit});

            expect(oidcSpy.calledOnce).to.be.true;
            expect(cookieSpy.calledOnce).to.be.true;

            local_sandbox.restore();
        });

        it("revokes tokens if oidcRevocationEndpoint is set", () => {
            const local_sandbox = sinon.createSandbox(),
                state = {
                    ...stateLogin,
                    loggedIn: true,
                    username: "max",
                    screenName: "Max Mustermann",
                    email: "max@mustermann.de",
                    accessToken: "accessToken",
                    refreshToken: "refreshToken"
                },
                oidcStub = local_sandbox.stub(OIDC, "revokeToken");

            local_sandbox.stub(Cookie, "get").callsFake((key) => {
                if (key === "token") {
                    return state.accessToken;
                }
                if (key === "refresh_token") {
                    return state.refreshToken;
                }
                return null;
            });

            Config.login = {
                oidcClientId: "client",
                oidcRevocationEndpoint: "https://idm.localhost/revoke"
            };

            actionsLogin.logout({state, commit});

            expect(oidcStub.firstCall.args[0]).to.equal("https://idm.localhost/revoke");
            expect(oidcStub.firstCall.args[1]).to.equal("client");
            expect(oidcStub.firstCall.args[2]).to.equal("accessToken");
            expect(oidcStub.secondCall.args[0]).to.equal("https://idm.localhost/revoke");
            expect(oidcStub.secondCall.args[1]).to.equal("client");
            expect(oidcStub.secondCall.args[2]).to.equal("refreshToken");

            local_sandbox.restore();
        });
    });

    describe("getAuthCodeUrl", () => {
        it("retrieves correct url", async () => {
            let url = null;
            const oidcAuthorizationEndpoint = "https://idm.localhost/",
                oidcClientId = "client",
                oidcRedirectUri = "https://localhost",
                oidcScope = "scope",
                getAuthCodeUrlStub = sinon.stub(actionsLogin, "getAuthCodeUrl"),
                mockUrl = `${oidcAuthorizationEndpoint}?response_type=code&client_id=${oidcClientId}&state=&scope=${oidcScope}`;

            Config.login = {
                oidcAuthorizationEndpoint,
                oidcClientId,
                oidcRedirectUri,
                oidcScope
            };

            window.localStorage = global.localStorage;

            getAuthCodeUrlStub.resolves(mockUrl);

            url = await actionsLogin.getAuthCodeUrl();

            expect(url).to.equal(mockUrl);
            expect(url).to.contain(oidcAuthorizationEndpoint + "?response_type=code&client_id=" + oidcClientId + "&state=");
            expect(url).to.contain(oidcScope);

            getAuthCodeUrlStub.restore();
        });
    });

    describe("checkLoggedIn", () => {
        afterEach(sinon.restore);

        it("should set loggedIn to true when token is present and valid", () => {
            let result = null;
            const local_sandbox = sinon.createSandbox(),
                context = {
                    commit: local_sandbox.stub(),
                    dispatch: local_sandbox.stub()
                },
                tokenExpiry = 1000; // Set token expiry in future

            local_sandbox.stub(Cookie, "get").returns("someToken");
            local_sandbox.stub(OIDC, "getTokenExpiry").returns(tokenExpiry);

            result = actionsLogin.checkLoggedIn(context);

            expect(result).to.be.true;
            expect(context.commit.thirdCall.args[0]).to.equal("setLoggedIn");
            expect(context.commit.thirdCall.args[1]).to.equal(true);

            local_sandbox.restore();
        });

        it("should set loggedIn to false and call logout when token is expired", () => {
            let result = null;
            const local_sandbox = sinon.createSandbox(),
                context = {
                    commit: local_sandbox.stub(),
                    dispatch: local_sandbox.stub()
                },
                tokenExpiry = 0; // Set token expiry in past

            local_sandbox.stub(Cookie, "get").returns("someToken");
            local_sandbox.stub(OIDC, "getTokenExpiry").returns(tokenExpiry);

            result = actionsLogin.checkLoggedIn(context);

            expect(result).to.be.false;

            expect(context.dispatch.firstCall?.args[0]).to.equal("logout");

            expect(context.commit.callCount).to.equal(2);

            local_sandbox.restore();
        });

    });

});
