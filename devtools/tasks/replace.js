var replace = require("replace-in-file"),
    sourceFile = require("../../package.json"),
    replacements = [];

module.exports = function (destination) {
    replacements.push({
        "files": destination + "/index.html",
        "from": /\/*(\.+\/)*build/g,
        "to": "."
    },
    {
        "files": destination + "/css/style.css",
        "from": /css\/woffs/g,
        "to": "./woffs"
    },
    {
        "files": destination + "/config.js",
        "from": "$Version",
        "to": sourceFile.version
    });


    replacements.forEach(function (replacement) {
        replace.sync({
            files: replacement.files,
            from: replacement.from,
            to: replacement.to
        });
    });
};