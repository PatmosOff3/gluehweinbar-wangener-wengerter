# Glühweinbar

[Bedienungsanleitung](docs/bedienung.md) · [Einsatzcheckliste und Realgeräteabnahme](docs/einsatz.md) · [GitHub Pages und eigene Adresse einrichten](docs/veroeffentlichung.md)

## Entwicklung

Voraussetzungen sind Node.js 22 ab 22.12 und npm. Die folgenden Befehle im Projektstamm ausführen.

```sh
npm ci
npx playwright install --with-deps
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Für lokale Änderungen startet `npm run dev` den Entwicklungsserver. `npm run preview` öffnet den statischen Build aus `dist/` über einen lokalen Server. Die Browsertests starten diesen Server selbst. `npm run check` führt alle automatisierten Prüfungen einschließlich Build in Folge aus.

Falls WebKit unter Windows beim persistenten Offline-Test wegen langer Dateipfade keinen Cache schreiben kann, lässt sich mit `KASSEN_TEST_TMPDIR` ein vorhandenes kurzes temporäres Verzeichnis für die Testprofile vorgeben, beispielsweise `C:/.cache`. Die Tests entfernen ihre eigenen Profile anschließend wieder.

## Aufbau

`src/domain` enthält ausschließlich reine TypeScript-Fachlogik. `storage` kapselt IndexedDB, `application` die Kassenabläufe. `export` verarbeitet die Dateiformate, `pwa` die Browserintegration und `ui` die Bedienoberfläche.
