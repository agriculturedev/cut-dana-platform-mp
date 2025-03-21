const path = require("path"),
    rootPath = path.resolve(__dirname, "../../../"),
    stableVersionNumber = require(path.resolve(rootPath, "elie/devtools/tasks/getStableVersionNumber"))(),
    gitRevSync = require("git-rev-sync"),
    dayjs = require("dayjs");

module.exports = function getMastercodeVersionFolderName () {
    let folderName = stableVersionNumber;
    const tag = gitRevSync.tag().replace(/\./g, "_").slice(1),
        branch = gitRevSync.branch(),
        long = gitRevSync.long();

    if (stableVersionNumber !== tag || !branch.includes(long)) {
        // gitRevSync.date() = the date of the current commit
        const date = dayjs(gitRevSync.date()).format("YYYY-MM-DD__HH-mm-ss");


        folderName += `_${gitRevSync.branch()}_last_change_at_${date}`;
    }

    return folderName;
};
