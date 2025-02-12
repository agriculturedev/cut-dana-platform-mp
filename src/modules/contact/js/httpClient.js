import axios from "axios";
import convertJsonToPost from "../../../shared/js/utils/convertJsonToPost";

/**
 * Sends the given data to the mail service behind the given url.
 *
 * @param {String} url The url of the mail service.
 * @param {Object} data The data to be sent; includes the sender, the recipient, the message and the subject of the e-mail.
 * @param {Function} onSuccess Function call to trigger further dispatchments on success.
 * @param {Function} onError Function call to trigger further dispatchments on error.
 * @returns {void}
 */
function httpClient (url, data, onSuccess, onError) {

    axios.post(url, convertJsonToPost(data))
        .then(response => {
            if (response.status !== 200 || Object.prototype.hasOwnProperty.call(response.data, "success") && response.data.success === false) {
                console.error(`An error occurred sending an email. Server response: ${response.data.message}`);
                console.error(response);
                onError();
            }
            else {
                onSuccess();
            }
        })
        .catch(err => {
            console.error("An error occurred sending an email.");
            console.error(err);
            onError();
        });
}

export default {httpClient};
