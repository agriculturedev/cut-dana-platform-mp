# Migration der configs.json von Version 2.x zu Version 3.0.0

1.  Klonen des aktuellen Masterportal Git Repositories (falls noch nicht vorhanden).
```json
git clone https://fmlgv@bitbucket.org/geowerkstatt-hamburg/masterportal.git
```

2. Auschecken des aktuellen Masterportal 3.0.0 Entwicklungsbranches per Git.
```json
git checkout dev_vue
```
3. Eine Hilfe zur Benutzung wird ausgegeben, wenn der Parameter help angegeben ist.
```json
npm run migrateConfig help
```

4. MigrateConfig script ohne Parameter: Die Angaben in der Konsole leiten durch die Dateikonvertierung. Es wird nach den Pfaden des zu migrierenden Portals gefragt.
```json
npm run migrateConfig
```

- Zuerst muss der Portalordner des zu migrierenden Portals angegeben werden (hier `testportal_v2`) mit Pfadangabe. In dem Ordner muss sich die Ausgangsdatei config.json befinden.
```json
masterportal@3.0.0 migrateConfig
node devtools/tasks/migrator/migrate.js

The paths to the portal or folder with portals must start from "[...]/masterportal/")!
? source path to the portal or folder with portals to migrate:
 (portal/master) portal/testportal_v2
```

- Anschließend wird um die Angabe des Zielordners (hier: `testportal_v3`) gebeten.
```json
? destination path to store the migrated portal(s):
 (portal/destination)portal/testportal_v3
```

5. MigrateConfig mit Parametern aufrufen.

- Migration eines Portals:
```json
npm run migrateConfig source=portal/testportal_v2 dest=portal/testportal_v3
```
- Migration mehrerer Portale: es wird ein Ordner der mehrere Portale enthält angegeben. **ACHTUNG:** die config.json-Dateien der Portale werden überschrieben!
```json
npm run migrateConfig source=portal dest=portal
```

