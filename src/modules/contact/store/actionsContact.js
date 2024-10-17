import {createMessage, createSubject, createTicketId} from "../js/createFunctions";
import httpClientModule from "../js/httpClient";
import getSystemInfo from "../js/getSystemInfo";

const actions = {
    /**
     * This action gets called after an e-mail has successfully been sent.
     * If configured, the ticketId is included in the Alert for the user.
     * If configured, the input is cleared and the tool is closed afterwards.
     *
     * @param {String} ticketId The unique id of the ticket for the e-mail.
     * @return {void}
     */
    onSendSuccess: ({state, commit, dispatch, rootGetters}, ticketId) => {
        const {closeAfterSend, deleteAfterSend, withTicketNo} = state;
        let content = i18next.t("common:modules.contact.successMessage");

        if (withTicketNo && ticketId) {
            content += "\r\n";
            content += i18next.t("common:modules.contact.successTicket");
            content += ticketId;
        }

        dispatch("Alerting/addSingleAlert", {
            category: "success",
            content: content
        }, {root: true});

        // Always uncheck the privacy policy
        commit("setPrivacyPolicyAccepted", false);

        if (deleteAfterSend) {
            commit("setMail", "");
            commit("setMessage", "");
            commit("setPhone", "");
            commit("setUsername", "");
        }
        if (closeAfterSend) {
            const menuCurrentComponent = "Menu/currentComponent";

            if (rootGetters[menuCurrentComponent]("mainMenu").type === state.type) {
                commit("Menu/switchToRoot", "mainMenu", {root: true});
            }
            else if (rootGetters[menuCurrentComponent]("secondaryMenu").type === state.type) {
                commit("Menu/switchToRoot", "secondaryMenu", {root: true});
            }
        }
    },
    /**
     * Dispatch delegator to avoid code repetition. Dispatches single warning alert.
     *
     * @param {String} content String or locale key to show.
     * @returns {void}
     */
    showWarningAlert ({dispatch}, content) {
        dispatch(
            "Alerting/addSingleAlert", {
                category: "warning",
                content: i18next.t(content)
            }, {root: true});
    },
    /**
     * Builds a HTML E-Mail and sends it via the backend mail server.
     * @params {Object} mailProps if the contact module is openend from another module like layerInformation it can be given props with a different addressee for example
     *
     * @returns {void}
     */
    send: ({state, dispatch, getters, rootGetters}, mailProps) => {
        const {to, withTicketNo, includeSystemInfo, subject, mailOriginHint} = mailProps?.noConfigProps ? mailProps : state,
            id = state.serviceId || state.serviceID,
            systemInfo = getSystemInfo(rootGetters.portalTitle),
            mailServiceUrl = rootGetters.restServiceById(id).url,
            ticketId = withTicketNo ? createTicketId(state.locationOfCustomerService) : "",
            from = state.from;

        // stop sending if form is not valid
        if (!getters.validForm) {
            console.warn("An error occurred sending an email: send with incorrect fields aborted");
            dispatch("showWarningAlert", "common:modules.contact.errorIncompleteDeclarations");
            return;
        }

        // stop sending if mail service is not defined
        if (!mailServiceUrl) {
            console.warn(`"An error occurred sending an e-mail: serviceId ${id} is unknown.`);
            dispatch("showWarningAlert", "common:modules.contact.error.message");
            return;
        }

        // Show the loader when the dispatch of the e-mail is initiated.
        httpClientModule.httpClient(
            mailServiceUrl,
            {
                from,
                to,
                subject: createSubject(
                    ticketId,
                    subject || (i18next.t("common:modules.contact.mailSubject") + systemInfo.portalTitle)
                ),
                text: createMessage(state, includeSystemInfo ? systemInfo : null, mailOriginHint ?? null),
                attachment: state.fileArray
            },
            () => dispatch("onSendSuccess", ticketId),
            () => dispatch("showWarningAlert", "common:modules.contact.error.message")
        );
    }
};

export default actions;
