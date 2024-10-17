import {createStore} from "vuex";
import {config, mount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import ContactComponent from "../../../components/ContactFormular.vue";
import ContactModule from "../../../store/indexContact";

config.global.mocks.$t = key => key;

/**
 * Fills all form fields with joke data for testing..
 * @param {Object} parameters holds the text inputs
 * @returns {void}
 */
function fillFields ({nameInput, mailInput, phoneInput, messageInput}) {
    nameInput.element.value = "Chuck Testa";
    nameInput.trigger("keyup");
    mailInput.element.value = "testa@example.com";
    mailInput.trigger("keyup");
    phoneInput.element.value = "555";
    phoneInput.trigger("keyup");
    messageInput.element.value = "Thought this was a deer?";
    messageInput.trigger("keyup");
}

describe("src/modules/contact/components/ContactFormular.vue", () => {
    let store,
        wrapper,
        mainMenu = {
            currentComponent: "contact",
            navigation: {
                currentComponent: {
                    type: "contact"
                }
            }
        };

    beforeEach(() => {
        ContactModule.actions.send = sinon.spy();
        ContactModule.actions.onSendSuccess = sinon.spy();

        ContactModule.state.serviceId = undefined;

        store = createStore({
            modules: {
                namespaced: true,
                Modules: {
                    namespaced: true,
                    modules: {
                        namespaced: true,
                        Contact: ContactModule
                    }
                },
                Alerting: {
                    namespaced: true,
                    actions: {
                        addSingleAlert: sinon.spy()
                    }
                },
                Menu: {
                    namespaced: true,
                    getters: {
                        mainMenu: () => mainMenu,
                        secondaryMenu: () => {
                            return {
                                currentComponent: "draw"
                            };
                        }
                    }
                }
            },
            getters: {
                uiStyle: () => sinon.stub()
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    it("has a disabled save button if the form is not completed", () => {
        wrapper = mount(ContactComponent, {
            global: {
                plugins: [store]
            }});

        const sendButton = wrapper.find("#module-contact-send-message");

        expect(sendButton.exists()).to.be.true;
        expect(sendButton.attributes("disabled")).to.equal("");
    });

    it("has an enabled & working save button if the form is completed", async () => {
        wrapper = mount(ContactComponent, {
            global: {
                plugins: [store]
            }});

        const sendButton = wrapper.find("#module-contact-send-message"),
            nameInput = wrapper.find("#module-contact-username-input"),
            mailInput = wrapper.find("#module-contact-mail-input"),
            phoneInput = wrapper.find("#module-contact-phone-input"),
            messageInput = wrapper.find("#module-contact-message-input");

        fillFields({nameInput, mailInput, phoneInput, messageInput});
        await wrapper.vm.$nextTick();

        expect(sendButton.exists()).to.be.true;
        expect(sendButton.attributes().disabled).to.be.undefined;

        sendButton.trigger("submit");
        expect(ContactModule.actions.send.calledOnce).to.be.true;
    });

    it("keeps the send button disabled if any field is missing", async () => {
        wrapper = mount(ContactComponent, {
            global: {
                plugins: [store]
            }});

        const sendButton = wrapper.find("#module-contact-send-message"),
            nameInput = wrapper.find("#module-contact-username-input"),
            mailInput = wrapper.find("#module-contact-mail-input"),
            phoneInput = wrapper.find("#module-contact-phone-input"),
            messageInput = wrapper.find("#module-contact-message-input");

        for (const emptyInput of [nameInput, mailInput, phoneInput, messageInput]) {
            fillFields({nameInput, mailInput, phoneInput, messageInput});

            emptyInput.element.value = "";
            emptyInput.trigger("keyup");

            await wrapper.vm.$nextTick();

            expect(sendButton.exists()).to.be.true;
            expect(sendButton.attributes().disabled).to.equal("");
        }
    });

    it("optionally renders an additional info field and privacy policy checkbox; must tick checkbox to send form", async () => {
        ContactModule.state.contactInfo = "If you live nearby, why not shout the message out from your window at 3AM?";
        ContactModule.state.showPrivacyPolicy = true;

        wrapper = mount(ContactComponent, {
            global: {
                plugins: [store]
            }});

        const sendButton = wrapper.find("#module-contact-send-message"),
            nameInput = wrapper.find("#module-contact-username-input"),
            mailInput = wrapper.find("#module-contact-mail-input"),
            phoneInput = wrapper.find("#module-contact-phone-input"),
            messageInput = wrapper.find("#module-contact-message-input"),
            checkbox = wrapper.find("#module-contact-privacyPolicy-input");

        expect(wrapper.find("#module-contact-addionalInformation").exists()).to.be.true;
        expect(checkbox.exists()).to.be.true;

        fillFields({nameInput, mailInput, phoneInput, messageInput});
        await wrapper.vm.$nextTick();

        expect(sendButton.attributes().disabled).to.equal("");

        checkbox.trigger("click");
        await wrapper.vm.$nextTick();

        expect(sendButton.attributes().disabled).to.be.undefined;
    });

    it("sets focus to first input control", async () => {
        const elem = document.createElement("div");

        if (document.body) {
            document.body.appendChild(elem);
        }
        wrapper = mount(ContactComponent, {
            attachTo: elem,
            global: {
                plugins: [store]
            }});

        await wrapper.vm.$nextTick();
        expect(wrapper.find("#module-contact-username-input").element).to.equal(document.activeElement);
    });

    it("has an info message standard text", async () => {
        wrapper = mount(ContactComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#contact-info-message").exists()).to.be.true;
        expect(wrapper.find("#contact-info-message").text()).to.equals("common:modules.contact.infoMessage");
    });

    it("has an info message text from props", async () => {
        mainMenu = {
            currentComponent: "contact",
            navigation: {
                currentComponent: {
                    type: "contact",
                    props: {
                        name: "Kontakt aufnehmen",
                        to: [
                            {
                                email: "abc@gv.hamburg.de",
                                name: "Behörde für XYZ"
                            }
                        ],
                        infoMessage: "Schreiben sie dem Ansprechpartner des Themas Schulstammdaten und Schülerzahlen der Hamburger Schulen",
                        includeSystemInfo: false,
                        subject: "Anfrage zum Datensatz Schulstammdaten und Schülerzahlen der Hamburger Schulen",
                        withTicketNo: false,
                        noConfigProps: true
                    }
                }
            }
        };

        wrapper = mount(ContactComponent, {
            global: {
                plugins: [store]
            }});

        expect(wrapper.find("#contact-info-message").exists()).to.be.true;
        expect(wrapper.find("#contact-info-message").text()).to.equals("Schreiben sie dem Ansprechpartner des Themas Schulstammdaten und Schülerzahlen der Hamburger Schulen");
    });

    describe("Methods", () => {
        let attachmentPdf, attachmentPng, attachmentBig, attachmentWrongFormat,
            checkNoDuplicatesSpy, addSingleAlertSpy, checkValidSpy;

        beforeEach(() => {
            attachmentPdf = {
                imgString: "data:application/pdf;base64,JVBERvQ",
                name: "Attachment1.pdf",
                fileExtension: "pdf",
                fileSize: 150,
                size: 150,
                src: "data:application/pdf;base64,JVBERvQ",
                type: "application/pdf"
            };
            attachmentPng = {
                imgString: "data:image;base64,JVBERi0x",
                name: "Attachment2.png",
                fileExtension: "png",
                fileSize: 100,
                size: 100,
                src: "",
                type: "image"
            };
            attachmentBig = {
                imgString: "",
                name: "Attachment2.png",
                fileExtension: "png",
                fileSize: 2 * 1024 * 1024,
                size: 2 * 1024 * 1024,
                src: "",
                type: "image"
            };
            attachmentWrongFormat = {
                imgString: "",
                name: "AttachmentX.xxx",
                fileExtension: "xxx",
                fileSize: 150,
                size: 150,
                src: "",
                type: "xxx"
            };
            wrapper = mount(ContactComponent, {
                global: {
                    plugins: [store]
                }});
            checkNoDuplicatesSpy = sinon.spy(wrapper.vm, "checkNoDuplicates");
            addSingleAlertSpy = sinon.spy(wrapper.vm, "addSingleAlert");
            checkValidSpy = sinon.spy(wrapper.vm, "checkValid");
        });

        afterEach(() => {
            sinon.restore();
        });
        describe("removeAttachment", () => {
            const target = {
                name: "Attachment1.pdf",
                fileExtension: "pdf",
                fileSize: 162276,
                src: "data:application/pdf;base64,JVBERvQ"
            };

            it("removed file should be removed from the list to send", async () => {
                await wrapper.setData({allAttachmentsToSend: [attachmentPdf]});
                const removeAttachmentSpy = sinon.spy(wrapper.vm, "removeAttachment");

                wrapper.vm.removeAttachment(target);

                expect(removeAttachmentSpy.calledOnce).to.be.true;
                expect(wrapper.vm.allAttachmentsToSend).to.be.empty;
            });
        });
        describe("checkNoDuplicates", () => {
            it("the error message is displayed in case of adding a duplicated file", async () => {
                await wrapper.setData({allAttachmentsToSend: [attachmentPdf]});
                const duplicatedFile = {
                        size: attachmentPdf.fileSize,
                        name: attachmentPdf.name
                    },
                    result = wrapper.vm.checkNoDuplicates(duplicatedFile);

                expect(checkNoDuplicatesSpy.calledOnce).to.be.true;
                expect(addSingleAlertSpy.calledOnce).to.be.true;
                expect(addSingleAlertSpy.calledWithMatch({
                    category: "error",
                    content: sinon.match((value) => value.includes(wrapper.vm.$t("common:modules.contact.fileDuplicatedMessage")))
                })).to.be.true;
                expect(result).to.be.false;
            });
            it("no error message is displayed in case of adding not duplicated file", async () => {
                await wrapper.setData({allAttachmentsToSend: [attachmentPdf]});
                const notDuplicatedFile = {
                        size: "400",
                        name: "Attachment2"
                    },
                    result = wrapper.vm.checkNoDuplicates(notDuplicatedFile);

                expect(checkNoDuplicatesSpy.calledOnce).to.be.true;
                expect(addSingleAlertSpy.calledOnce).to.be.false;
                expect(result).to.be.true;
            });
        });
        describe("checkValid", () => {
            it("the error message is displayed in case of adding to big file", async () => {
                await wrapper.setData({maxFileSize: 1 * 1024 * 1024, sumFileSize: 0, configuredFileExtensions: ""});
                const result = wrapper.vm.checkValid(attachmentBig);

                expect(checkValidSpy.calledOnce).to.be.true;
                expect(addSingleAlertSpy.calledOnce).to.be.true;
                expect(addSingleAlertSpy.calledWithMatch({
                    category: "error",
                    content: sinon.match((value) => value.includes(wrapper.vm.$t("common:modules.contact.fileSizeMessage")))
                })).to.be.true;
                expect(result).to.be.false;
            });
            it("the error message is displayed in case when sum of files sizes is to big", async () => {
                await wrapper.setData({maxSumFileSize: 6 * 1024 * 1024, configuredFileExtensions: "", sumFileSize: 8 * 1024 * 1024, maxFileSize: 1 * 1024 * 1024});
                const result = wrapper.vm.checkValid(attachmentPng);

                expect(checkValidSpy.calledOnce).to.be.true;
                expect(addSingleAlertSpy.calledOnce).to.be.true;
                expect(addSingleAlertSpy.calledWith({
                    category: "error",
                    content: wrapper.vm.$t("common:modules.contact.fileSizeSumMessage")
                })).to.be.true;
                expect(result).to.be.false;
            });
            it("the error message is displayed in case of adding wrong format file", async () => {
                await wrapper.setData({maxSumFileSize: 6 * 1024 * 1024, configuredFileExtensions: "", sumFileSize: 0, maxFileSize: 1 * 1024 * 1024});
                const result = wrapper.vm.checkValid(attachmentWrongFormat);

                expect(checkValidSpy.calledOnce).to.be.true;
                expect(addSingleAlertSpy.calledOnce).to.be.true;
                expect(addSingleAlertSpy.calledWith({
                    category: "error",
                    content: wrapper.vm.$t("common:modules.contact.fileFormatMessage")
                })).to.be.true;
                expect(result).to.be.false;
            });
            it("no error message is displayed in case of adding correct size, correct format file and sum of files sizes", async () => {
                await wrapper.setData({maxSumFileSize: 6 * 1024 * 1024, configuredFileExtensions: "", sumFileSize: 0, maxFileSize: 1 * 1024 * 1024});
                const result = wrapper.vm.checkValid(attachmentPdf);

                expect(checkValidSpy.calledOnce).to.be.true;
                expect(addSingleAlertSpy.calledOnce).to.be.false;
                expect(result).to.be.true;
            });
        });
        describe("addFile", () => {
            it("added file with png extension is in the list of files to send", async () => {
                await wrapper.setData({allAttachmentsToSend: [], configuredFileExtensions: [], maxFileSize: 2 * 1024 * 1024});

                const loadCorrectFileFormatSpy = sinon.spy(wrapper.vm, "loadCorrectFileFormat"),
                    reader = {readyState: 2, result: "data:image;base64,JVBERi0x"};

                wrapper.vm.loadCorrectFileFormat(attachmentPng, reader);

                expect(loadCorrectFileFormatSpy.calledOnce).to.be.true;
                expect(wrapper.vm.allAttachmentsToSend.length).to.equal(1);
                expect(wrapper.vm.allAttachmentsToSend[0]).to.include({
                    name: "Attachment2.png",
                    fileExtension: "png",
                    fileSize: 100
                });
                expect(wrapper.vm.allAttachmentsToSend[0].src).to.be.a("string");
                expect(addSingleAlertSpy.calledOnce).to.be.false;
            });
            it("added file with pdf extension is in the list of files to send", async () => {
                await wrapper.setData({allAttachmentsToSend: [], configuredFileExtensions: [], maxFileSize: 2 * 1024 * 1024});

                const loadCorrectFileFormatSpy = sinon.spy(wrapper.vm, "loadCorrectFileFormat"),
                    reader = {readyState: 2, result: "data:application/pdf;base64,JVBERvQ"};

                wrapper.vm.loadCorrectFileFormat(attachmentPdf, reader);

                expect(loadCorrectFileFormatSpy.calledOnce).to.be.true;
                expect(wrapper.vm.allAttachmentsToSend.length).to.equal(1);
                expect(wrapper.vm.allAttachmentsToSend[0]).to.include({
                    name: "Attachment1.pdf",
                    fileExtension: "pdf",
                    fileSize: 150
                });
                expect(wrapper.vm.allAttachmentsToSend[0].src).to.be.a("string");
                expect(addSingleAlertSpy.calledOnce).to.be.false;
            });
            it("the error message is displayed in case of adding wrong extension file", async () => {
                await wrapper.setData({allAttachmentsToSend: [], configuredFileExtensions: [], maxFileSize: 2 * 1024 * 1024});

                const loadCorrectFileFormatSpy = sinon.spy(wrapper.vm, "loadCorrectFileFormat"),
                    reader = {readyState: 2, result: "data:application/pdf;base64,JVBERvQ"};

                wrapper.vm.loadCorrectFileFormat(attachmentWrongFormat, reader);

                expect(loadCorrectFileFormatSpy.calledOnce).to.be.true;
                expect(wrapper.vm.allAttachmentsToSend.length).to.equal(0);
                expect(addSingleAlertSpy.calledOnce).to.be.true;
                expect(addSingleAlertSpy.calledWith({
                    category: "error",
                    content: wrapper.vm.$t("common:modules.contact.fileFormatMessage")
                })).to.be.true;
            });
        });
    });
});
