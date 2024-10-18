const inquirer = require("inquirer"),
    buildFunctions = require("./buildFunctions"),
    questions = [
        {
            type: "input",
            name: "portalPath",
            message: "Pfad zum Ordner mit Portalen ausgehend von \"[...]/masterportal/\":",
            default: "portal"
        },
        {
            type: "input",
            name: "excludeAddon",
            message: "Name des Addons, das nicht ins bundle soll:",
            default: ""
        }
    ];

inquirer.prompt(questions).then(function (answers) {
    buildFunctions(answers);
});
