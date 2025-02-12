const replace = require("replace-in-file"),
    path = require("path"),
    rootPath = path.resolve(__dirname, "../../"),
    mastercodeVersionFolderName = require(path.resolve(rootPath, "devtools/tasks/getMastercodeVersionFolderName"))().split(path.sep).join("/");


module.exports = function (destination) {
    const replacements = [
        {
            "files": destination + "/js/masterportal.js",
            "from": /\/src\/assets\/img\/tools\/draw\/circle_/g,
            "to": "/mastercode/" + mastercodeVersionFolderName + "/src/assets/img/tools/draw/circle_"
        },
        {
            "files": destination + "/index.html",
            "from": /\/*(\.+\/)*build/g,
            "to": "../mastercode/" + mastercodeVersionFolderName
        },
        {
            "files": destination + "/css/masterportal.css",
            "from": /css\/woffs/g,
            "to": "./woffs"
        },
        {
            "files": destination + "/js/masterportal.js",
            "from": /\..\/..\/img\//g,
            "to": "../mastercode/" + mastercodeVersionFolderName + "/img/"
        },
        {
            "files": destination + "/js/masterportal.js",
            "from": /\..\/..\/src\/assets\/img\//g,
            "to": "../mastercode/" + mastercodeVersionFolderName + "/img/"
        },
        {
            "files": destination + "/js/masterportal.js",
            "from": /\/locales\/\{\{lng\}\}\/\{\{ns\}\}\.json/g,
            "to": "./../mastercode/" + mastercodeVersionFolderName + "/locales/{{lng}}/{{ns}}.json"
        }
    ];

    replacements.forEach(function (replacement) {
        replace.sync({
            files: replacement.files,
            from: replacement.from,
            to: replacement.to
        });
    });
};
