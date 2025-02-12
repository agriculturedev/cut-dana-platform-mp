# Migration of configs.json from version 2.x to version 3.0.0

1.  Clone the current master portal Git repository (if not yet available).
```json
git clone https://fmlgv@bitbucket.org/geowerkstatt-hamburg/masterportal.git
```

2. Check out the current Masterportal 3.0.0 development branch via Git.
```json
git checkout dev_vue
```
3. Help for use is displayed if the help parameter is specified.
```json
npm run migrateConfig help
```
4. MigrateConfig script without parameters: The information in the console guides you through the file conversion. You will be asked for the paths of the portal to be migrated.
```json
npm run migrateConfig
```

- First, the portal folder of the portal to be migrated must be specified (here `testportal_v2`) with path.The source file config.json must be located in the folder.
```json
masterportal@3.0.0 migrateConfig
node devtools/tasks/migrator/migrate.js

The paths to the portal or folder with portals must start from "[...]/masterportal/")!
? source path to the portal or folder with portals to migrate:
 (portal/master) portal/testportal_v2
```
- You will then be asked to enter the destination folder (here: `testportal_v3`).
```json
? destination path to store the migrated portal(s):
 (portal/destination)portal/testportal_v3
```

5. Call MigrateConfig with parameters.

- Migration of one portal:
```json
npm run migrateConfig source=portal/testportal_v2 dest=portal/testportal_v3
```
- Migration of several portals: a folder containing several portals is specified. **ATTENTION:** the config.json files of the portals will be overwritten!
```json
npm run migrateConfig source=portal dest=portal
```
