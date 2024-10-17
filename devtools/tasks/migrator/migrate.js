/* eslint-disable no-console */
const inquirer = require("inquirer"),
    migrateConfigFiles = require("./migrateConfigFiles.js"),
    infoMessage = "The paths to the portal or folder with portals must start from \"[...]/masterportal/\")!",
    sourceMessage = "source path to the portal or folder with portals to migrate",
    destMessage = "destination path to store the migrated portal(s)",
    questions = [
        {
            type: "input",
            name: "sourcePath",
            message: sourceMessage + ":\n",
            default: "portal/master"
        },
        {
            type: "input",
            name: "destPath",
            message: destMessage + ":\n",
            default: "portal/destination"
        }
    ];
let sourcePath = null,
    destPath = null,
    usagePrinted = false;

process.argv.forEach((val) => {
    const splitted = val.split("=");

    if (splitted.length === 2) {
        if (splitted[0] === "source") {
            sourcePath = splitted[1];
            console.info("sourcePath=", sourcePath);
        }
        else if (splitted[0] === "dest") {
            destPath = splitted[1];
            console.info("destPath=", destPath);
        }
    }
});

if (process.argv.length > 2 && (sourcePath === null || destPath === null)) {
    printUsage();
}
else if (sourcePath && destPath) {
    migrateConfigFiles({
        sourcePath, destPath
    });
}
else if (!usagePrinted) {
    console.info(infoMessage);
    inquirer.prompt(questions)
        .then((answers) => {
            migrateConfigFiles(answers);
        })
        .catch((error) => {
            if (error.isTtyError) {
                console.error(error);
            }
            else {
                console.error("Failed to call migration script: unknown error");
            }
        });
}

/**
 * Prints the usage.
 * @returns {void}
 */
function printUsage () {
    usagePrinted = true;
    console.info("Script to migrate masterportal configuration files to version 3.0.0");
    console.info("--------------------------------------------------------------------");
    console.info("Parameters:");
    console.info("source=" + sourceMessage);
    console.info("dest=" + destMessage);
    console.info("\n");
    console.info(infoMessage);
    console.info("If no parameters are given, the user is asked to enter the paths.");
    console.info("\n");
    console.info("example: npm run migrateConfig source=portal/master dest=portal/destination");
}
