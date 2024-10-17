// The docs framework (mkdocs) is written in Python. To validate the documentation, we want to run a "strict build" before pushing commits.
// Since it is discouraged to install Python packages globally, we use a virtual Python environment to install the required packages.
// Unfortunately, activating a virtual Python environment is plattform / shell dependent. Therefore, we need this wrapper instead of running everything right from package.json.
const {execSync} = require("child_process");
const os = require("os"),
    platform = os.platform();

if (platform === "win32") {
    execSync("call devtools/docsValidation/docsValidation.bat", {stdio: "inherit"});
}
else if (platform === "linux" || platform === "darwin") {
    execSync("sh devtools/docsValidation/docsValidation.sh", {stdio: "inherit"});
}
else {
    throw new Error("Unsupported platform. Cannot initialize virtual Python environment.");
}
