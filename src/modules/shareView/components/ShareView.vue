<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import mutations from "../store/mutationsShareView";
import QRCode from "qrcode";
import FlatButton from "../../../shared/modules/buttons/components/FlatButton.vue";
import {Toast} from "bootstrap";

/**
 * Tool to share a view via link to twitter, facebook, qrCode or copy the link as well as any other app on mobile.
 * @module modules/ShareView
 * @vue-data {String} qrDataUrl - The qr code url.
 * @vue-computed {String} facebook - The facebook url.
 * @vue-computed {String} twitter - The twitter url.
 */
export default {
    name: "ShareView",
    components: {FlatButton},
    data () {
        return {
            qrDataUrl: null
        };
    },
    computed: {
        ...mapGetters("Modules/ShareView", ["url", "facebookShare", "copyShare", "qrShare"]),
        ...mapGetters("Maps", ["getView"]),
        ...mapGetters(["visibleLayerConfigs", "isMobile"]),

        /**
         * Generates the link for facebook.
         * @returns {String} url with params
         */
        facebook () {
            return "https://www.facebook.com/sharer/sharer.php?u=" + this.url;
        }
    },
    methods: {
        ...mapMutations("Modules/ShareView", Object.keys(mutations)),
        ...mapActions("Alerting", ["addSingleAlert"]),

        /**
         * Shares the link on a mobile device.
         * @returns {void}
         */
        share () {
            const shareData = {
                title: this.$t("common:modules.shareView.myMap"),
                text: this.$t("common:modules.shareView.myMap"),
                url: this.url
            };

            navigator.share(shareData)
                .catch((err) => {
                    console.error(`Error: ${err}`);
                });
        },
        /**
         * Generates a qrCode for the given url.
         * If successful, sets the generated QR code URL to `qrDataUrl`.
         * If an error occurs, alert error based on the type of error.
         * @returns {void}
         */
        generateQRCodeDataURL () {
            const url = this.url;

            QRCode.toDataURL(url).then((qrDataUrl) => {
                this.qrDataUrl = qrDataUrl;
            }).catch((err) => {
                console.error("QR Code generation error:", err);
                if (err.message.includes("data is too big")) {
                    this.addSingleAlert({
                        category: "error",
                        content: this.$t("common:modules.shareView.qrErrorDataTooLarge")
                    });
                }
                else {
                    this.addSingleAlert({
                        category: "error",
                        content: this.$t("common:modules.shareView.qrError")
                    });
                }
                this.qrDataUrl = null;
            });
        },
        /**
         * Downloads the qrCode.
         * @returns {void}
         */
        downloadQr () {
            const link = document.createElement("a");

            document.body.appendChild(link);
            link.download = "qrCode.jpg";
            link.href = this.qrDataUrl;
            link.target = "_blank";
            link.click();
        },
        /**
         * Lets you copy the url to the clipboard.
         * ToDo: add "link copied" Hinweis
         * @returns {void}
         */
        copyToClipboard () {
            const toast = new Toast(this.$refs.copyToast);

            toast.show();

            if (window.isSecureContext) {
                // Adds a hashtag (#) at the end of the generated url in order to help Outlook interpret our generated links correctly.
                navigator.clipboard.writeText(this.url + "#");
            }
            else {
                this.addSingleAlert({
                    category: "error",
                    content: this.$t("common:modules.shareView.copyErrorAlert", {url: this.url})
                });
            }
        }
    }
};
</script>

<template lang="html">
    <div id="share-view">
        <h4>{{ $t("common:modules.shareView.shareHeadline") }}</h4>

        <div v-if="isMobile">
            <button
                aria-label="$t('common:modules.shareView.share')"
                class="btn btn-secondary btn-icon"
                @click="share"
            >
                <i class="bi-share" />
                {{ $t("common:modules.shareView.share") }}
            </button>
        </div>

        <div v-else>
            <div
                v-if="facebookShare"
                class="col-12 mt-3"
            >
                <a
                    id="facebook-btn"
                    aria-label="$t('common:modules.shareView.shareFacebook')"
                    class="btn btn-secondary btn-icon mb-3 pe-4 ps-3"
                    :href="facebook"
                    target="_blank"
                    role="button"
                >
                    <i class="bi-facebook" />
                    {{ $t("common:modules.shareView.shareFacebook") }}
                </a>
            </div>

            <div
                v-if="copyShare"
                class="col-12"
            >
                <FlatButton
                    id="copy-btn"
                    aria-label="$t('common:modules.shareView.shareLink')"
                    :interaction="copyToClipboard"
                    :text="$t('common:modules.shareView.shareLink')"
                    :icon="'bi-link'"
                />
            </div>

            <div
                v-if="qrShare"
                class="col-12"
            >
                <FlatButton
                    id="qr-btn"
                    aria-label="$t('common:modules.shareView.shareQR')"
                    :interaction="generateQRCodeDataURL"
                    :text="$t('common:modules.shareView.shareQR')"
                    :icon="'bi-qr-code'"
                />
            </div>

            <div v-if="qrDataUrl">
                <img
                    id="qrCodeImg"
                    alt="qr Code"
                    :src="qrDataUrl"
                    class="qrCode"
                >
                <FlatButton
                    aria-label="$t('common:modules.shareView.downloadQR')"
                    :interaction="downloadQr"
                    :text="$t('common:modules.shareView.downloadQR')"
                    :icon="'bi-download'"
                />
            </div>
        </div>

        <div class="toast-container position-fixed bottom-0 start-50 translate-middle-x p-3">
            <div
                ref="copyToast"
                class="toast align-items-center"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
            >
                <div class="d-flex">
                    <div class="toast-body">
                        {{ $t("common:modules.shareView.linkCopied") }}
                    </div>
                    <button
                        type="button"
                        class="btn-close me-2 m-auto"
                        data-bs-dismiss="toast"
                        aria-label="Close"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";

.qrCode {
    max-width: 75%;
}

.toast {
    z-index: 3;
}

</style>
