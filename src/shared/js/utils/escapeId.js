/**
 * Replaces all points with dashes in the id.
 * @param {String} id to replace points in
 * @returns {String} id with replaced points
 */
export default function escapeId (id) {
    if (id) {
        return id.replaceAll(".", "-");
    }
    return id;
}
