<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import ContactFormularInput from "./ContactFormularInput.vue";
import FlatButton from "../../../shared/modules/buttons/components/FlatButton.vue";
import IconButton from "../../../shared/modules/buttons/components/IconButton.vue";
import FileUpload from "../../../shared/modules/inputs/components/FileUpload.vue";

/**
 * The Contact Form
 * @module modules/ContactFormular
 * @vue-data {String} sendIcon - The icon for the send button.
 * @vue-data {Boolean} fileUploaded - Shows if file was uploaded.
 * @vue-data {Array} uploadedImages - All uploaded images.
 */
export default {
    name: "ContactFormular",
    components: {
        ContactFormularInput,
        FlatButton,
        IconButton,
        FileUpload
    },
    data () {
        return {
            sendIcon: "bi-send",
            fileUploaded: false,
            allAttachmentsToSend: [],
            sumFileSize: 0
        };
    },
    computed: {
        ...mapGetters("Modules/Contact", [
            "contactInfo",
            "maxLines",
            "username",
            "mail",
            "message",
            "phone",
            "showPrivacyPolicy",
            "privacyPolicyAccepted",
            "privacyPolicyLink",
            "validForm",
            "validMail",
            "validMessage",
            "validPhone",
            "validUsername",
            "fileUpload",
            "fileArray",
            "maxFileSize",
            "maxSumFileSize",
            "configuredFileExtensions",
            "infoMessage"
        ]),
        ...mapGetters("Menu", [
            "mainMenu",
            "secondaryMenu"
        ]),
        menuIndicator () {
            return this.mainMenu.currentComponent === "contact"
                ? "mainMenu"
                : "secondaryMenu";
        },
        mailProps () {
            return this.menuIndicator === "mainMenu"
                ? this.mainMenu.navigation.currentComponent.props
                : this.secondaryMenu.navigation.currentComponent.props;
        },
        useInfoMessage () {
            if (this.mailProps?.noConfigProps) {
                return this.mailProps?.infoMessage;
            }

            return this.checkStringContent(this.infoMessage) || this.$t("common:modules.contact.infoMessage");
        }
    },
    mounted () {
        if (this.mailProps && this.mailProps?.previousComponent === "layerInformation") {
            this.setNavigationHistoryBySide({side: this.menuIndicator, newHistory: [{type: "root", props: []}, {type: "layerInformation", props: {name: this.mailProps.layerName}}, {type: "layerInformation", props: {name: this.mailProps.layerName}}]});
        }
    },
    methods: {
        ...mapMutations("Modules/Contact", [
            "setUsername",
            "setMail",
            "setPhone",
            "setMessage",
            "togglePrivacyPolicyAccepted",
            "setFileArray"
        ]),
        ...mapActions("Modules/Contact", ["send", "importFile"]),
        ...mapActions("Alerting", ["addSingleAlert"]),
        ...mapMutations("Menu", [
            "setNavigationHistoryBySide"
        ]),
        triggerClickOnFileInput (event) {
            if (event.which === 32 || event.which === 13) {
                this.$refs["upload-input-file"].click();
            }
        },
        onInputChange (e) {
            if (e.target.files !== undefined) {
                this.addFile(e.target.files);
                e.target.value = null;
            }
        },
        onDrop (e) {
            if (e.dataTransfer.files !== undefined) {
                this.addFile(e.dataTransfer.files);
            }
        },
        addFile (files) {
            Array.from(files).forEach(file => {
                if (this.checkValid(file) && this.checkNoDuplicates(file)) {
                    this.sumFileSize = this.sumFileSize + file.size;
                    const reader = new FileReader();

                    reader.addEventListener("load", () => {
                        this.loadCorrectFileFormat(file, reader);
                    }, false);

                    if (file) {
                        // convert image file to base64 string
                        reader.readAsDataURL(file);
                    }
                }
            });
            this.setFileArray(this.allAttachmentsToSend);
        },
        /**
         * Adds new attachment in the correct file format to allAttachmentsToSend.
         * @param {Object} file The new attachment file, which user wants to add to the email.
         * @param {Object} reader FileReader.
         */
        loadCorrectFileFormat (file, reader) {
            const fileNameSplit = file.name.split("."),
                fileExtension = fileNameSplit.length > 0 ? fileNameSplit[fileNameSplit.length - 1].toLowerCase() : "";

            if (fileExtension === "png" || fileExtension === "jpg" || fileExtension === "jpeg" || this.configuredFileExtensions.includes(fileExtension)) {
                this.fileUploaded = true;
                const src = file.type.includes("image") ? reader.result : URL.createObjectURL(file);

                this.allAttachmentsToSend.push({imgString: reader.result, name: file.name, fileExtension: fileExtension, fileSize: file.size, src: src});
            }
            else if (fileExtension === "pdf") {
                this.fileUploaded = true;
                const src = file.type.includes("application/pdf") ? reader.result : URL.createObjectURL(file);

                this.allAttachmentsToSend.push({imgString: reader.result, name: file.name, fileExtension: fileExtension, fileSize: file.size, src: src});
            }
            else {
                this.addSingleAlert({
                    category: "error",
                    content: this.$t("common:modules.contact.fileFormatMessage")
                });
            }
        },
        removeAttachment (target) {
            this.allAttachmentsToSend.forEach((el, idx) => {
                if (el.imgString === target.src && el.name === target.name) {
                    this.allAttachmentsToSend.splice(idx, 1);
                    this.sumFileSize = this.sumFileSize - el.fileSize;
                }
            });
            this.fileArray.forEach((el, idx) => {
                if (el.imgString === target.src && el.name === target.name) {
                    this.fileArray.splice(idx, 1);
                }
            });
        },
        checkValid (file) {
            if (!file.type.includes("image") && !file.type.includes("application/pdf") && this.configuredFileExtensions.length === 0) {
                this.addSingleAlert({
                    category: "error",
                    content: this.$t("common:modules.contact.fileFormatMessage")
                });
                return false;
            }
            // Check if filesize exceeds configured size
            // Default 1MB
            if (file.size > this.maxFileSize) {
                this.addSingleAlert({
                    category: "error",
                    content: this.$t("common:modules.contact.fileSizeMessage") + file.name
                });
                return false;
            }
            // Check if the maximum total size of all files exceeds configured size
            // Default 6MB
            if (this.sumFileSize > this.maxSumFileSize) {
                this.addSingleAlert({
                    category: "error",
                    content: this.$t("common:modules.contact.fileSizeSumMessage")
                });
                return false;
            }

            return true;
        },
        /**
         * Checks if there are no duplicates in already existing attachments
         * @param {Object} file The new attachment file, which user wants to add.
         * @returns {Boolean} If it found duplicated attachement or not.
         */
        checkNoDuplicates (file) {
            let notDuplicated = true;

            this.allAttachmentsToSend.forEach(el => {
                if (el.fileSize === file.size && el.name === file.name) {
                    notDuplicated = false;
                }
            });
            if (!notDuplicated) {
                this.addSingleAlert({
                    category: "error",
                    content: this.$t("common:modules.contact.fileDuplicatedMessage") + file.name
                });
            }
            return notDuplicated;
        },
        /**
         * Checks if a variable is a string and not empty.
         * @returns {String} Returns the input string if it is typeof string and it is not empty.
         */
        checkStringContent (inputString) {
            return typeof inputString === "string" && inputString.length ? inputString : null;
        },
        /**
         * Sends the email using props if given when the contact form was opened by another module
         * @returns {void}
         */
        sendMessage () {
            if (this.mailProps?.noConfigProps) {
                this.send(this.mailProps);
            }
            else {
                this.send();
            }
        }
    }
};
</script>

<template lang="html">
    <div id="contact-formular">
        <div
            v-if="contactInfo"
            id="module-contact-addionalInformation"
            class="form-floating"
        >
            {{ contactInfo }}
        </div>
        <p
            id="contact-info-message"
        >
            {{ useInfoMessage }}
        </p>
        <form
            @submit.prevent="sendMessage"
        >
            <ContactFormularInput
                :change-function="setUsername"
                :input-name="'username'"
                :input-value="username"
                :label-text="'Name'"
                :valid-input="validUsername"
                :focus-on-creation="true"
            />
            <ContactFormularInput
                :change-function="setMail"
                :input-name="'mail'"
                :input-type="'email'"
                :input-value="mail"
                :label-text="'E-Mail'"
                :valid-input="validMail"
            />
            <ContactFormularInput
                :change-function="setPhone"
                :input-name="'phone'"
                :input-type="'tel'"
                :input-value="phone"
                :label-text="'Tel.'"
                :valid-input="validPhone"
            />
            <ContactFormularInput
                :change-function="setMessage"
                :html-element="'textarea'"
                :input-name="'message'"
                :input-value="message"
                :label-text="$t('common:modules.contact.messageLabel')"
                :rows="maxLines"
                :valid-input="validMessage"
            />
            <div
                v-if="showPrivacyPolicy"
                id="module-contact-privacyPolicy"
                class="form-group"
            >
                <label
                    id="module-contact-privacyPolicy-label"
                    for="module-contact-privacyPolicy-input"
                >
                    <input
                        id="module-contact-privacyPolicy-input"
                        :value="privacyPolicyAccepted"
                        type="checkbox"
                        @click="togglePrivacyPolicyAccepted"
                    >
                    {{ $t("common:modules.contact.privacyPolicy.label") }}
                </label>
                <p v-html="$t('common:modules.contact.privacyPolicy.info', {privacyPolicyLink})" />
            </div>
            <div v-if="fileUpload">
                <div
                    id="accordionFlushFile"
                    class="accordion accordion-flush mb-3"
                >
                    <div class="accordion-item">
                        <h2
                            id="flush-heading-contact"
                            class="accordion-header"
                        >
                            <button
                                class="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapse-contact"
                                aria-expanded="false"
                                aria-controls="collapse-contact"
                            >
                                <i class="bi-paperclip me-2" />
                                {{ $t('common:modules.contact.addFileButton') }}
                            </button>
                        </h2>
                        <div
                            id="collapse-contact"
                            class="accordion-collapse collapse"
                            aria-labelledby="flush-heading"
                            data-bs-parent="#accordionFlushFile"
                        >
                            <div class="accordion-body">
                                <FileUpload
                                    :id="'attachmentUpload'"
                                    :keydown="(e) => triggerClickOnFileInput(e)"
                                    :change="(e) => onInputChange(e)"
                                    :drop="(e) => onDrop(e)"
                                >
                                    <div v-if="fileUploaded">
                                        <div
                                            v-for="image in allAttachmentsToSend"
                                            :key="image"
                                            class="row d-flex mb-1"
                                        >
                                            <embed
                                                :src="image.src"
                                                height="42"
                                                class="col-2"
                                            >
                                            <span class="d-flex align-items-center col">
                                                {{ image.name }}
                                            </span>
                                            <IconButton
                                                :aria="$t('common:modules.contact.removeAttachment')"
                                                :icon="'bi-trash'"
                                                :interaction="() => removeAttachment(image)"
                                                class="remove-btn col-3"
                                            />
                                        </div>
                                    </div>
                                </FileUpload>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-center">
                <FlatButton
                    id="module-contact-send-message"
                    aria-label="$t('common:modules.contact.sendButton')"
                    type="submit"
                    :text="$t('common:modules.contact.sendButton')"
                    :icon="sendIcon"
                    :disabled="!validForm"
                />
            </div>
        </form>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
    input[type="checkbox"] {
        cursor: pointer;
    }

    #module-contact-privacyPolicy {
        label, span {
            cursor: pointer;
        }
    }

    .remove-btn {
        z-index: 20;
        position: relative;
    }
</style>
