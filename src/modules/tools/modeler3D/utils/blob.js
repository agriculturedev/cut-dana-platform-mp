/**
 * Parses the blob into base64 format
 * @param {Blob} blob - The GLTF or GLB content.
 * @returns {Promise<Object|String|undefined>} Promise object represents the blob in gltf-binary format.
 */
function blobToBase64 (blob) {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

/**
 * Parses the gltf-binary format text into blob
 * @param {String} b64Data - The gltf-binary format text
 * @returns {Blob} the parsed blob
 */
async function b64toBlob (b64Data) {
    return (await fetch(b64Data)).blob();
}

export default {
    blobToBase64,
    b64toBlob
};
