<script>

import axios from "axios";
import {mapActions, mapGetters, mapMutations} from "vuex";
import SwitchInput from "../../../shared/modules/checkboxes/components/SwitchInput.vue";

/**
 * Alerting
 * @module modules/AlertingItem
 * @vue-data {Boolean} availableLocalStorage - Shows if localStorage is available.
 * @vue-data {String} currentUrl - Current url.
 * @vue-data {Function|null} subscribtion handler to unsubsribe event listining (https://vuex.vuejs.org/api/#subscribeaction).
 * @vue-data {String} sortedAlertsSwitch - Switch for data to be used.
 */
export default {
    name: "AlertingItem",
    components: {SwitchInput},
    data () {
        return {
            availableLocalStorage: false,
            currentUrl: document.URL.replace(/#.*$/, "").replace(/\/*\?.*$/, "/").replace(/\bwww.\b/, ""),
            unsubscribeAction: null,
            sortedAlertsSwitch: "initial"
        };
    },
    computed: {
        ...mapGetters("Alerting", [
            "alerts",
            "alertWindowTitle",
            "configPaths",
            "displayedAlerts",
            "fetchBroadcastUrl",
            "initialAlerts",
            "initialClosed",
            "localStorageDisplayedAlertsKey",
            "showTheModal",
            "sortedAlerts",
            "type",
            "displayOnEventList"
        ]),
        /**
         * Console mapping to be able to debug in template.
         * @returns {void}
         */
        console: () => console
    },
    /**
     * Created hook: Checks if localstorage is available.
     * @returns {void}
     */
    created () {
        try {
            if (localStorage) {
                this.availableLocalStorage = true;
            }
        }
        catch {
            this.availableLocalStorage = false;
            console.error("Spelling localestorage is not available in this application. Please allow third party cookies in your browser!");
        }

        /* Hint: store.subscribeAction(): https://vuex.vuejs.org/api/#subscribeaction */
        this.unsubscribeAction = this.$store.subscribeAction((action) => {
            this.checkForEventAlerts(action);
        });
    },
    /**
     * Mounted hook: Initially fetches BroadcastConfig.
     * @returns {void}
     */
    mounted () {
        this.initializeModule({configPaths: this.configPaths, type: this.type});

        if (this.fetchBroadcastUrl !== undefined && this.fetchBroadcastUrl !== false) {
            this.fetchBroadcast(this.fetchBroadcastUrl);
        }

        this.addAlertsFromConfig(this.initialAlerts);
    },
    unmounted () {
        if (this.unsubscribeAction) {
            this.unsubscribeAction();
        }
    },
    methods: {
        ...mapActions(["initializeModule"]),
        ...mapActions("Alerting", [
            "addAlertsFromConfig",
            "addSingleAlert",
            "alertHasBeenRead",
            "cleanup",
            "activateDisplayOnEventAlerts"
        ]),
        ...mapMutations("Alerting", [
            "removeFromAlerts",
            "setFetchBroadcastUrl"
        ]),

        /**
         * Do this after successfully fetching broadcastConfig:
         * Process configured data and add each resulting alert into the state.
         * @param {Object} response received response object
         * @returns {void}
         */
        axiosCallback: function (response) {
            const data = response.data,
                collectedAlerts = [];

            let collectedAlertIds = [];

            if (data.alerts === undefined || typeof data.alerts !== "object") {
                return;
            }

            if (Array.isArray(data.globalAlerts)) {
                collectedAlertIds = [...collectedAlertIds, ...data.globalAlerts];
            }

            if (data.restrictedAlerts !== undefined && typeof data.restrictedAlerts === "object") {
                Object.keys(data.restrictedAlerts).forEach(restrictedAlertUrl => {
                    if (this.currentUrl.toLowerCase().startsWith(restrictedAlertUrl.toLowerCase()) && Array.isArray(data.restrictedAlerts[restrictedAlertUrl])) {
                        collectedAlertIds = [...collectedAlertIds, ...data.restrictedAlerts[restrictedAlertUrl]];
                    }
                });
            }

            for (const alertId in data.alerts) {
                if (collectedAlertIds.includes(alertId)) {
                    collectedAlerts.push(data.alerts[alertId]);
                }
            }

            collectedAlerts.forEach(singleAlert => {
                singleAlert.initial = true;
                singleAlert.isNews = true;
                singleAlert.initialConfirmed = singleAlert.mustBeConfirmed;
                this.addSingleAlert(singleAlert);
            });
        },

        /**
         * Just a wrapper method for the XHR request for the sake of testing.
         * @param {String} fetchBroadcastUrl fetchBroadcastUrl
         * @returns {void}
         */
        fetchBroadcast: function (fetchBroadcastUrl) {
            axios.get(fetchBroadcastUrl).then(this.axiosCallback).catch(function (error) {
                console.warn(error);
            });
        },
        /**
         * Toggles the modal
         * @param {Boolean} value value for showTheModal
         * @returns {void}
         */
        toggleModal: function (value) {
            this.$store.commit("Alerting/setShowTheModal", value);
        },
        /**
         * When closing the modal, update all alerts' have-been-read states.
         * @returns {void}
         */
        onModalClose: function () {
            this.cleanup();
            this.$store.commit("Alerting/setInitialClosed", true);
        },
        /**
         * Update a single alert's has-been-read state.
         * @param {String} hash hash
         * @returns {void}
         */
        markAsRead: function (hash) {
            this.alertHasBeenRead(hash);
        },
        /**
         * Remove an alert from the alert modal
         * @param {String} hash hash
         * @returns {void}
         */
        removeAlert: function (hash) {
            this.removeFromAlerts({hash: hash});
        },
        /**
         * Check category name to distiguish between news and alert categories
         * @param {String} category category name
         * @returns {void}
         */
        checkCategory: function (category) {
            const checkCategory = category.toLowerCase();

            if (checkCategory !== "error" && checkCategory !== "warning" && checkCategory !== "success") {
                return true;
            }
            return false;
        },
        /**
         * Select the class for the alert category.
         * @param {String} category category of the alert
         * @returns {void}
         */
        selectCategoryClass: function (category) {
            const generalizedCategory = category?.toLowerCase();

            if (generalizedCategory === "news" || generalizedCategory === "success") {
                return "badge rounded-pill bg-success";
            }
            else if (generalizedCategory === "warning") {
                return "badge rounded-pill bg-warning";
            }
            else if (generalizedCategory === "error") {
                return "badge rounded-pill bg-danger";
            }
            return "badge rounded-pill bg-info";
        },
        /**
         * Event handler for alerts on events
         * @param {String} action Current event of the masterportal
         * @returns {void}
         */
        checkForEventAlerts: function (action) {
            if (this.displayOnEventList?.length > 0 && this.displayOnEventList.some((element) => {
                if (element.type === action.type) {
                    if (typeof element.value === "string" && element.value === action.payload) {

                        return true;
                    }
                    else if (typeof element.value === "object" &&
                        Object.entries(element.value).every(([key, value]) => action.payload[key] === value)
                    ) {

                        return true;
                    }
                    return false;
                }

                return false;
            })) {
                this.sortedAlertsSwitch = "onEvent";
                this.activateDisplayOnEventAlerts(action);
            }
        }
    }
};
</script>

<template>
    <div
        v-if="showTheModal && sortedAlerts(sortedAlertsSwitch).length>0"
        id="alertModal"
        class="modal"
        tabindex="-1"
        aria-modal="true"
        role="dialog"
    >
        <div
            class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
            role="document"
        >
            <div class="modal-content">
                <div class="modal-header">
                    {{ $t(alertWindowTitle) }}
                    <button
                        type="button"
                        class="btn-close"
                        aria-label="Close"
                        @click="toggleModal(false); onModalClose();"
                    />
                </div>
                <div
                    class="modal-body"
                >
                    <div
                        v-for="(alertCategory, categoryIndex) in sortedAlerts(sortedAlertsSwitch)"
                        :key="alertCategory.category"
                        class="alertCategoryContainer"
                    >
                        <div
                            v-for="(singleAlert, singleAlertIndex) in alertCategory.content"
                            :key="singleAlert.hash"
                            :class="singleAlert.category"
                        >
                            <div
                                class="singleAlertContainer row"
                            >
                                <hr
                                    v-if="singleAlertIndex > 0 || categoryIndex > 0"
                                >
                                <div
                                    class="d-flex justify-content-between mb-3"
                                >
                                    <h3>
                                        {{ singleAlert.title }}
                                    </h3>
                                    <button
                                        v-if="sortedAlerts(sortedAlertsSwitch).length >1"
                                        type="button"
                                        class="btn btn-close btn-sm col-1"
                                        aria-label="Close"
                                        @click="removeAlert(singleAlert.hash);"
                                    />
                                </div>
                                <div class="d-flex justify-content-end bd-highlight mb-3">
                                    <span :class="selectCategoryClass(singleAlert.category) + ' badge-pill'">
                                        {{ $t(singleAlert.displayCategory) }}
                                    </span>
                                </div>
                                <div
                                    v-html="singleAlert.content"
                                />
                                <div
                                    v-if="checkCategory(singleAlert.category)"
                                    class="d-flex justify-content-between small"
                                >
                                    <div
                                        v-if="singleAlert.creationDate"
                                        class="mt-2 creation-date"
                                        v-html="$t(`common:modules.alerting.created`) + singleAlert.creationDate"
                                    />
                                    <div
                                        v-if="singleAlert.initialConfirmed && availableLocalStorage"
                                        class="mt-1"
                                    >
                                        <div
                                            class="form-check form-check-reverse form-switch mt-1"
                                        >
                                            <SwitchInput
                                                :id="'flexSwitchCheckDefault'"
                                                :aria="singleAlert.mustBeConfirmed? $t(singleAlert.confirmText) : $t(singleAlert.reConfirmText)"
                                                :interaction="() => markAsRead(singleAlert.hash)"
                                                :label="singleAlert.mustBeConfirmed? $t(singleAlert.confirmText) : $t(singleAlert.reConfirmText)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~variables";
    #alertModal{
        display: block;
        background-color: rgba(0,0,0,0.5);
    }
    .modal-body {
        /* Hide scrollbar for Firefox */
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    /* Hide scrollbar for Edge, Chrome, Safari and Opera */
    .modal-body::-webkit-scrollbar{
        display: none;
    }

    .badge-pill{
        font-size:$font-size-base;
    }

    div.alertCategoryContainer {
        margin-bottom:0;
        &.last {
            margin-bottom:0.4375rem;
        }
        h3 {
            border:none;
            color: $dark_blue;
            font-size:$font-size-lg;
            font-weight:bold;
            letter-spacing:initial;
            line-height:18px;
            margin:0 0 8px 0;
            padding:0;
        }

        div.singleAlertContainer {
            color:$dark_blue;
            font-size:$font-size-base;
            margin-top:0;
            margin-bottom:0.3125rem;
            padding-bottom:0;
        }
    }
</style>
