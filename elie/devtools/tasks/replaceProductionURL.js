const fs = require("fs");
const path = require("path");

/* eslint-disable */
const replaceProductionURL = (file, value) => {
    // read the JSON file and parse it

    const rootPath = path.resolve(__dirname, "../../../");
    // combine rootPath with file
    const filePath = path.resolve(rootPath, file);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(fileContent);

    // change the value
    json.Portalconfig.menu.tools.children.dataNarrator.backendURL = value;

    // write javascript object back to the file
    const jsonContent = JSON.stringify(json, null, 4);
    fs.writeFileSync(file, jsonContent, "utf8", (err) => {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }

        console.log("JSON file has been saved.");
    });
}

const files = [
    {
        "file": "portal/mobility-data/config.json",
        "value": "https://dana-backend.onrender.com"
    },
];

for (const file of files) {
    replaceProductionURL(file.file, file.value);
}
