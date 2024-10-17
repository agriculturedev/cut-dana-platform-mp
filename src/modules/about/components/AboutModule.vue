<script>
import {mapActions, mapGetters} from "vuex";
import LightButton from "../../../shared/modules/buttons/components/LightButton.vue";

/**
 * The About Module gives information about the metadata, contact and current version of the portal
 * @module modules/AboutModule
 */
export default {
    name: "AboutModule",
    components: {
        LightButton
    },
    computed: {
        ...mapGetters(["configJs"]),
        ...mapGetters("Modules/About", [
            "abstractText",
            "contact",
            "cswUrl",
            "logo",
            "logoLink",
            "logoText",
            "metaUrl",
            "showAdditionalMetaData",
            "version",
            "versionLink",
            "ustId",
            "privacyStatementText",
            "privacyStatementUrl",
            "accessibilityText",
            "accessibilityUrl"
        ]),
        ...mapGetters("Menu", [
            "mainMenu",
            "secondaryMenu"
        ]),
        /**
         * Returns true if the contact module is configured in either of the menus.
         * @returns {Boolean} Returns true if the contact module is configured in either of the menus.
         */
        contactConfigured () {
            return this.mainMenu.sections[0].find(m => {
                return m.type === "contact";
            })
            || this.secondaryMenu.sections[0].find(m => {
                return m.type === "contact";
            });
        },
        /**
         * Returns the menu the about module is in.
         * @returns {String} Returns the menu the about module is in.
         */
        menuIndicator () {
            return this.mainMenu.sections[0].find(m => {
                return m.type === "about";
            })
                ? "mainMenu"
                : "secondaryMenu";
        }
    },
    mounted () {
        this.initializeAboutInfo();
    },

    methods: {
        ...mapActions("Modules/About", ["initializeAboutInfo"]),
        ...mapActions("Menu", ["changeCurrentComponent"]),
        /**
         * Opens the privacy statement URL in a new tab.
         * @returns {void}
         */
        openDataPrivacyLink () {
            window.open(this.privacyStatementUrl, "_blank");
        },
        /**
         * Opens the accessibility statement URL in a new tab.
         * @returns {void}
         */
        openAccessibilityLink () {
            window.open(this.accessibilityUrl, "_blank");
        },
        /**
         * Opens the contact module in the same menu where the about module is in.
         * @returns {void}
         */
        openContactModule () {
            this.changeCurrentComponent({type: "contact", side: this.menuIndicator, props: {name: this.$t("common:modules.contact.name")}});
        },
        /**
         * Checks if a variable is a string and not empty.
         * @returns {String} Returns the input string if it is typeof string and it is not empty.
         */
        checkStringContent (inputString) {
            return typeof inputString === "string" && inputString.length ? inputString : null;
        }
    }
};
</script>

<template lang="html">
    <div
        id="modules-about"
        class="d-flex flex-column justify-content-between"
    >
        <div class="content d-flex flex-column">
            <div>
                <div
                    class="pb-2 abstract"
                    v-html="abstractText"
                />
            </div>
            <div v-if="showAdditionalMetaData && metaUrl.length > 0">
                <p
                    class="float-end"
                >
                    <a
                        :href="metaUrl"
                        target="_blank"
                    >
                        {{ $t("common:modules.about.additionalMetadata") }}
                    </a>
                </p>
            </div>
            <div
                v-if="checkStringContent(privacyStatementUrl)"
                class="pt-5 privacyStatementWrapper"
            >
                <h4>
                    {{ $t("common:modules.about.privacyStatement") }}
                </h4>
                <span class="pb-3 privacyStatementText">
                    {{ checkStringContent(privacyStatementText) || $t("common:modules.about.privacyStatementText") }}
                </span>
                <LightButton
                    class="mt-3 privacyStatementButton"
                    :interaction="openDataPrivacyLink"
                    :text="$t('common:modules.about.privacyStatement')"
                    icon="bi-box-arrow-up-right"
                    customclass="w-100"
                    :title="privacyStatementUrl"
                />
            </div>
            <div
                v-if="checkStringContent(accessibilityUrl)"
                class="pt-5 accessibilityStatementWrapper"
            >
                <h4>
                    {{ $t("common:modules.about.accessibilityStatement") }}
                </h4>
                <span class="pb-3 accessibilityText">
                    {{ checkStringContent(accessibilityText) || $t("common:modules.about.accessibilityText") }}
                </span>
                <LightButton
                    class="mt-3 accessibilityStatementButton"
                    :interaction="openAccessibilityLink"
                    :text="$t('common:modules.about.accessibilityStatement')"
                    icon="bi-box-arrow-up-right"
                    customclass="w-100"
                    :title="accessibilityUrl"
                />
            </div>
            <div
                id="imprint"
                class="pt-5"
            >
                <h4>
                    {{ $t("common:modules.about.imprintTitle") }}
                </h4>
                <div
                    v-if="contact"
                    class="pt-3 contact"
                >
                    <h4>{{ $t("common:modules.about.contact") }}</h4>
                    <p
                        v-html="contact.name"
                    />
                    <p
                        v-for="(positionName) in contact.positionName"
                        :key="positionName"
                        v-html="positionName"
                    />
                    <p>
                        {{ contact.street + "  " + contact.postalCode }}
                    </p>
                    <p>
                        {{ contact.city }}
                    </p>
                    <a
                        :href="'mailto:' + contact.email"
                    >
                        {{ contact.email }}
                    </a>
                </div>
                <LightButton
                    v-if="contactConfigured"
                    class="mt-3 openContactButton"
                    :interaction="openContactModule"
                    :text="$t('common:modules.about.contactButton')"
                    icon="bi-envelope"
                    customclass="w-100"
                    :title="$t('common:modules.about.contactButton')"
                />
                <div
                    v-if="checkStringContent(ustId)"
                    class="pt-4 ustIdWrapper"
                >
                    <p>
                        {{ $t("common:modules.about.ustId") }}
                    </p>
                    <p class="ustId">
                        {{ ustId }}
                    </p>
                </div>
            </div>
        </div>
        <div
            class="d-flex flex-row justify-content-between mb-3 mt-5 align-items-center logoAndVersion"
        >
            <a
                class="logo"
                :href="logoLink ? logoLink : '#'"
                :target="logoLink ? '_blank' : '_self'"
            >
                <img
                    v-if="logo"
                    :src="logo"
                    :alt="logoText"
                >
            </a>
            <span class="version">
                <a
                    :href="versionLink ? versionLink : '#'"
                    :target="versionLink ? '_blank' : '_self'"
                >
                    {{ $t("common:modules.about.version") + version }}

                </a>
            </span>
        </div>
    </div>
</template>

<style lang="scss">
    @import "~variables";

    #modules-about {
        height: 100%;
        overflow-y: hidden;

        .content {
            overflow-y: auto;

            p {
                font-size: $font-size-base;
                margin-bottom: 0rem;
            }
        }

        .logoAndVersion {
            background-color: white;
            margin-top: auto;

            .logo {
                width: 5rem;
            }
            .version {
                display: flex;
                font-size: small;
            }
        }
    }

</style>
