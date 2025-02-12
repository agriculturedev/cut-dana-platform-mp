/**
 * Contact tool state definition.
 * @typedef {Object} ContactState
 * @property {String} description The description that should be shown in the button in the menu.
 * @property {String} name Displayed as the title. (config-param)
 * @property {String} icon Icon next to the title. (config-param)
 * @property {String} serviceId The id of the service (rest-services.json) that contains the url of the mail service. (config-param)
 * @property {Object[]} from Default sender for the e-mail. (config-param)
 * @property {Object[]} to Default recipient of the e-mail. (config-param)
 * @property {Boolean} [closeAfterSend=true] Flag determining if the contact window should be closed after an E-Mail has been sent. (config-param)
 * @property {String} [contactInfo=""] Additional text shown above the contact form. (config-param)
 * @property {Boolean} [deleteAfterSend=true] Flag determining if the input fields should be emptied after an E-Mail has been sent. (config-param)
 * @property {Boolean} [includeSystemInfo=false] Flag determining if information of the the system of the user should be included in the E-Mail. (config-param)
 * @property {String} [locationOfCustomerService="de"] The country the customer service is based in. The parameter is used for the date in the ticketId. (config-param)
 * @property {Number} [maxLines=5] Amount of lines (height) for the textArea of the form. (config-param)
 * @property {Boolean} [showPrivacyPolicy=true] Flag determining if a checkbox should be displayed for agreeing to the privacy policy. (config-param)
 * @property {String} [subject=""] The subject to be used for the E-Mail. (config-param)
 * @property {Boolean} [withTicketNo=true] Flag determining if the ticketId should be shown to the user after an E-Mail has been sent. (config-param)
 * @property {String} mail The mail address that the user entered.
 * @property {String} message The message that the user entered.
 * @property {Boolean} privacyPolicyAccepted Whether the user has accepted the privacy policy or not.
 * @property {String} phone The phone number that the user has entered.
 * @property {String} username The name of the user.
 * @property {String[]} supportedDevices Devices on which the module is displayed.
 * @property {String[]} supportedMapModes Map mode in which this module can be used.
 * @property {String} type The type of the module.
 * @property {Boolean} fileUpload If File Upload should be available.
 * @property {Array} fileArray Uploaded Files.
 * @property {Number} maxFileSize the max file size for uploadable content. Default: 1MB
 * @property {Number} maxSumFileSize the maximum total size of all files for uploadable content. Default: 6MB
 * @property {Array} configuredFileExtensions additional file extensions that can be configured. Note: currently the geoportal backend only supports images.
*/
const state = {
    description: "common:modules.contact.description",
    name: "common:modules.contact.name",
    icon: "bi-envelope",
    from: [],
    serviceId: null,
    to: [],
    closeAfterSend: true,
    contactInfo: "",
    deleteAfterSend: true,
    includeSystemInfo: false,
    locationOfCustomerService: "de",
    maxLines: 5,
    showPrivacyPolicy: false,
    privacyPolicyLink: "https://www.masterportal.org/datenschutz.html",
    subject: "",
    withTicketNo: true,
    mail: "",
    message: "",
    privacyPolicyAccepted: false,
    phone: "",
    username: "",

    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D", "3D"],
    type: "contact",
    fileUpload: false,
    fileArray: [],
    maxFileSize: 1 * 1024 * 1024,
    maxSumFileSize: 6 * 1024 * 1024,
    configuredFileExtensions: [],
    infoMessage: ""
};

export default state;
