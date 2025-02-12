import testAction from "../../../../../../devtools/tests/VueTestUtils";
import {expect} from "chai";
import sinon from "sinon";

import httpClientModule from "../../../js/httpClient";
import actions from "../../../store/actionsContact";

const {onSendSuccess, send} = actions;

describe("src/modules/contact/store/actionsContact.js", () => {
    describe("onSendSuccess", () => {
        const payload = "0401-TICK-ETID";
        let state;

        beforeEach(() => {
            state = {
                id: "contact",
                closeAfterSend: true,
                deleteAfterSend: true,
                withTicketNo: true
            };
        });

        afterEach(sinon.restore);

        it("calls all expected commits and dispatches when configured to do so", done => {
            testAction(onSendSuccess, payload, state, {}, [
                {type: "Alerting/addSingleAlert", payload: {
                    category: "success",
                    content: i18next.t("common:modules.contact.successMessage") +
                        "\r\n" +
                        i18next.t("common:modules.contact.successTicket") +
                        payload
                }, dispatch: true},
                {type: "setPrivacyPolicyAccepted", payload: false, commit: true},
                {type: "setMail", payload: "", commit: true},
                {type: "setMessage", payload: "", commit: true},
                {type: "setPhone", payload: "", commit: true},
                {type: "setUsername", payload: "", commit: true}
            ], {}, done);
        });

        it("builds reduced alert message when configured so", done => {
            state.withTicketNo = false;

            testAction(onSendSuccess, payload, state, {}, [
                {type: "Alerting/addSingleAlert", payload: {
                    category: "success",
                    content: i18next.t("common:modules.contact.successMessage")
                }, dispatch: true},
                {type: "setPrivacyPolicyAccepted", payload: false, commit: true},
                {type: "setMail", payload: "", commit: true},
                {type: "setMessage", payload: "", commit: true},
                {type: "setPhone", payload: "", commit: true},
                {type: "setUsername", payload: "", commit: true}
            ], {}, done);
        });

        it("doesn't reset form when configured so", done => {
            state.deleteAfterSend = false;

            testAction(onSendSuccess, payload, state, {}, [
                {type: "Alerting/addSingleAlert", payload: {
                    category: "success",
                    content: i18next.t("common:modules.contact.successMessage") +
                        "\r\n" +
                        i18next.t("common:modules.contact.successTicket") +
                        payload
                }, dispatch: true},
                {type: "setPrivacyPolicyAccepted", payload: false, commit: true}
            ], {}, done);
        });

        it("doesn't close form when configured so", done => {
            state.closeAfterSend = false;

            testAction(onSendSuccess, payload, state, {}, [
                {type: "Alerting/addSingleAlert", payload: {
                    category: "success",
                    content: i18next.t("common:modules.contact.successMessage") +
                        "\r\n" +
                        i18next.t("common:modules.contact.successTicket") +
                        payload
                }, dispatch: true},
                {type: "setPrivacyPolicyAccepted", payload: false, commit: true},
                {type: "setMail", payload: "", commit: true},
                {type: "setMessage", payload: "", commit: true},
                {type: "setPhone", payload: "", commit: true},
                {type: "setUsername", payload: "", commit: true}
            ], {}, done);
        });
    });

    describe("send", () => {
        let state;

        beforeEach(() => {
            state = {
                from: Symbol.for("from"),
                to: Symbol.for("to"),
                serviceId: "007",
                includeSystemInfo: true
            };
        });

        afterEach(sinon.restore);

        it("creates httpClient call as expected", done => {
            sinon
                .stub(httpClientModule, "httpClient")
                .callsFake((url, data) => {
                    const {from, to, subject, text} = data;

                    expect(url).to.equal("example.com");
                    expect(from).to.equal(Symbol.for("from"));
                    expect(to).to.equal(Symbol.for("to"));
                    expect(subject).to.be.a("string");
                    expect(text).to.be.a("string");

                    done();
                });

            send({
                state,
                dispatch: sinon.spy(),
                getters: {
                    validForm: true
                },
                rootGetters: {
                    portalTitle: "Test",
                    restServiceById: id => id === "007" ? {url: "example.com"} : {}
                }
            });
        });

        it("creates httpClient call as expected if called with props", done => {
            const props = {
                to: "abc@gv.hamburg.de",
                from: Symbol.for("from"),
                subject: "Anfrage zum Datensatz Schulstammdaten und Schülerzahlen der Hamburger Schulen",
                noConfigProps: true
            };

            sinon
                .stub(httpClientModule, "httpClient")
                .callsFake((url, data) => {
                    const {from, to, subject, text} = data;

                    expect(url).to.equal("example.com");
                    expect(from).to.equal(Symbol.for("from"));
                    expect(to).to.equal("abc@gv.hamburg.de");
                    expect(subject).to.be.a("string");
                    expect(text).to.be.a("string");

                    done();
                });

            send({
                state,
                dispatch: sinon.spy(),
                getters: {
                    validForm: true
                },
                rootGetters: {
                    portalTitle: "Test",
                    restServiceById: id => id === "007" ? {url: "example.com"} : {}
                }
            },
            props
            );
        });
    });
});
