# Design

## Context

Siehe [proposal.md](proposal.md) für Motivation und Funktionsumfang. Es existiert noch keine Anwendung. Die Kasse muss als statische, serverlose PWA auf unterschiedlichen Geräten funktionieren, nach der Einrichtung vollständig offline bleiben und alle fachlichen Daten je Gerät und Browserprofil lokal halten. Die fünf Capability-Specs definieren Kassenbetrieb, Sortiment, Abrechnung, Veranstaltungsverwaltung und Datensicherung.

Browserdaten sind an Ursprung und Browserprofil gebunden. Deshalb sind eine dauerhafte HTTPS-Subdomain, eine robuste lokale Datenbank, vollständige Sicherungen und kontrollierte Datenmigrationen tragende Architekturentscheidungen.

## Goals / Non-Goals

**Goals:**

- Eine kleine, wartbare PWA mit statischem Build ohne Backend oder laufende Serveranwendung.
- Fachlich korrekte, atomare Buchungen mit unveränderlichen historischen Werten.
- Zuverlässiger Offline-Start einschließlich aller lokal gebündelten Schriften, Icons und Anwendungsdateien.
- Eindeutige Trennung von Veranstaltungen sowie von Geräten und Browserprofilen.
- Wiederherstellbare, versionierte Datenhaltung und ein sicherer Updatepfad.
- Automatisierte Prüfung der Rechenlogik sowie der wichtigsten Abläufe in Chromium, Firefox und WebKit.

**Non-Goals:**

- Synchronisierung, gemeinsame Datenbank oder zusammengeführte Abrechnung mehrerer Geräte.
- Benutzerkonten, Cloud-Backend, Fernzugriff oder zentrale Administration.
- Kartenzahlung, Kundenanzeige, Warenwirtschaft oder Lagerbestandsführung.
- Schutz lokaler Daten vor einer Person mit Zugriff auf Browser-Entwicklerwerkzeuge oder Sicherungsdateien.
- Unterstützung veralteter Browser außerhalb der festgelegten modernen Browserbasis.

## Decisions

### 1. React, TypeScript und Vite als statische Einzelanwendung

Die Oberfläche wird mit React und TypeScript umgesetzt und mit Vite gebaut. React passt zu den voneinander abhängigen Ansichten für Bestellung, Zahlung, Administration und Auswertung; TypeScript hält Geld-, Buchungs- und Sicherungsmodelle über alle Schichten konsistent. Vite erzeugt ein statisch auslieferbares `dist`-Verzeichnis und unterstützt die Veröffentlichung über GitHub Pages.

Die Anwendung verwendet keine serverseitigen Routen. Ansichten werden innerhalb einer einzelnen HTML-Shell gewechselt, sodass Direktaufrufe und Offline-Navigation nicht an fehlenden Server-Rewrites scheitern. Externe Laufzeit-CDNs sind ausgeschlossen; alle benötigten Assets werden mit dem Build ausgeliefert.

**Alternativen:**

- Reines HTML/TypeScript reduziert die Framework-Abhängigkeit, erhöht aber bei den vielen interaktiven Zuständen und Formularen den manuellen Aufwand.
- Ein Full-Stack-Framework bringt Routing und Serverfunktionen mit, die für diese rein lokale Anwendung nicht benötigt werden.

### 2. Schichten und Abhängigkeitsrichtung

Die Anwendung wird in klar getrennte Bereiche gegliedert:

- `domain`: reine TypeScript-Logik für Geld, Pfand, Zahlbetrag, Storno und Statistik.
- `application`: Anwendungsfälle wie Verkauf abschließen, letzten Verkauf stornieren, Veranstaltung wechseln und Sicherung importieren.
- `storage`: Dexie-Datenbank, Migrationen und transaktionale Repositories.
- `ui`: responsive React-Komponenten für Kasse und Admin-Bereich.
- `pwa`: Installierbarkeit, Service-Worker-Status, Offline- und Updatehinweise.
- `export`: CSV-Erzeugung sowie Sicherungsimport und -export.

Die Fachlogik kennt weder React noch IndexedDB. Dadurch lassen sich die kritischen Rechenregeln schnell und deterministisch testen.

### 3. IndexedDB mit Dexie als einzige Fachdatenquelle

Alle dauerhaften Fachdaten werden in IndexedDB gespeichert. Dexie kapselt Schema-Versionen, Abfragen und atomare Transaktionen, ohne eine Synchronisierung oder Dexie Cloud einzuführen. `localStorage` ist wegen synchronem Zugriff, geringer Strukturierbarkeit und fehlenden Transaktionen ungeeignet.

Vorgesehene Tabellen:

- `deviceSettings`: aktive Veranstaltungs-ID, PIN-Prüfwert mit Parametern und geräteweite Einstellungen.
- `events`: ID, Name, Status `active` oder `closed`, Start- und Abschlusszeit sowie nächste Buchungsnummer.
- `eventSettings`: Veranstaltungs-ID und globaler Pfandbetrag in Cent.
- `products`: Veranstaltungs-ID, Bezeichnung, Einheit, Preis in Cent, Pfandpflicht, Verfügbarkeit, Sortierung und optionale Preisgruppen-ID.
- `transactions`: unveränderlicher Verkauf oder Storno mit Veranstaltungs-ID, laufender Nummer, Zeitstempel, Positions-Snapshots, Pfandwerten und Zahlungssummen.

Primärschlüssel werden mit `crypto.randomUUID()` erzeugt. Geldwerte werden ausschließlich als ganze Centbeträge gespeichert und berechnet. Zeitstempel werden als ISO-Zeitpunkte gespeichert und erst für die Anzeige lokal formatiert.

**Alternative:** Native IndexedDB vermeidet eine Bibliothek, erzeugt aber deutlich mehr Fehlerbehandlung und Migrationscode. Eine relationale WebAssembly-Datenbank wäre für die geringe Datenmenge unnötig groß und kompliziert.

### 4. Unveränderliche Buchungen und atomare Kassenaktionen

Ein abgeschlossener Verkauf speichert für jede Position einen Snapshot aus Produktname, Einheit, Einzelpreis, Menge, Pfandpflicht und tatsächlich verwendetem Pfandbetrag. Spätere Produktänderungen können historische Werte deshalb nicht beeinflussen.

Ein Storno löscht oder überschreibt den Verkauf nicht, sondern erzeugt einen eigenen Umkehrdatensatz mit Referenz auf den ursprünglichen Verkauf. Ein eindeutiger Index auf diese Referenz verhindert ein zweites Storno desselben Verkaufs. Verkauf, Veranstaltungsnummer und gegebenenfalls Storno werden jeweils in einer einzigen Dexie-Schreibtransaktion gespeichert.

Statistiken werden aus Verkäufen und Umkehrdatensätzen berechnet und nicht als veränderliche Summen parallel gespeichert. Damit gibt es nur eine fachliche Quelle und keine auseinanderlaufenden Zähler.

### 5. Pfandberechnung als reine Domänenregel

Aus den pfandpflichtigen Produktmengen entsteht die Zahl der automatischen Pfandpositionen. Die Anzahl „− Pfand / Gefäß vorhanden“ wird auf diese Zahl begrenzt. Separate Pfandrückgaben bleiben eine unabhängige Menge. Beim Abschluss werden Warenumsatz, eingenommenes Pfand, ausgezahltes Pfand und Endbetrag getrennt im Snapshot festgehalten.

Roter und weißer Glühwein besitzen eigenständige Produkt-IDs, teilen aber eine optionale Preisgruppen-ID. Eine Preisänderung an dieser Gruppe aktualisiert beide aktiven Produkte atomar. Selbst angelegte Produkte erhalten standardmäßig keine Preisgruppe.

### 6. Veranstaltungswechsel als atomarer Kopiervorgang

`deviceSettings.activeEventId` verweist auf die einzige aktive Veranstaltung. Beim Start einer Folgeveranstaltung werden in einer Transaktion:

1. die bisherige Veranstaltung abgeschlossen,
2. die neue Veranstaltung mit leerer Buchungsfolge angelegt,
3. `eventSettings` und alle Produkte mit neuen IDs kopiert,
4. Preisgruppenbeziehungen auf die neuen Produkt-IDs abgebildet und
5. die aktive Veranstaltungs-ID umgestellt.

Schreibende Anwendungsfälle prüfen innerhalb ihrer Transaktion erneut, dass die Zielveranstaltung aktiv ist. Das verhindert Buchungen in einer inzwischen abgeschlossenen Veranstaltung. Um gleichzeitige Bedienung desselben lokalen Datenbestands zu vermeiden, warnt ein zweites geöffnetes Fenster über `BroadcastChannel`; die Datenbanktransaktionen bleiben dennoch die eigentliche Konsistenzgrenze.

### 7. Versioniertes Sicherungsformat und atomare Wiederherstellung

Die vollständige Sicherung ist eine UTF-8-JSON-Datei mit mindestens:

- festem Formatbezeichner,
- Sicherungsformat-Version,
- Anwendungsversion und Erstellungszeit,
- allen für die Wiederherstellung erforderlichen Tabellendaten.

Ein Laufzeitschema, umgesetzt mit Zod, validiert Struktur, Datentypen, Referenzen und unterstützte Versionsnummern vollständig vor einer Datenänderung. Erst nach erfolgreicher Validierung und ausdrücklicher Bestätigung werden alle lokalen Tabellen in einer einzigen Dexie-Transaktion geleert und mit den importierten Daten gefüllt. Scheitert die Transaktion, bleibt der vorherige Stand erhalten.

Das Format ist für spätere Versionen migrationsfähig. Jede unterstützte ältere Sicherung wird zuerst in das aktuelle In-Memory-Modell transformiert und danach importiert. Neuere unbekannte Formate werden ohne Änderung lokaler Daten abgelehnt.

Die Sicherung ist nicht verschlüsselt. Sie enthält den PIN niemals im Klartext, wohl aber den abgeleiteten Prüfwert und die Kassenhistorie. Die Datei muss deshalb wie eine vertrauliche Abrechnung behandelt werden. Eine PIN-basierte Verschlüsselung wäre wegen der typischerweise kurzen PIN kein ausreichender Schutz und würde die Wiederherstellung unnötig erschweren.

### 8. Lokale Admin-PIN als begrenzter Bedienungsschutz

Die PIN wird nicht im Klartext gespeichert. Web Crypto leitet mit PBKDF2-HMAC-SHA-256, einem zufälligen Salt von mindestens 16 Byte und einem gespeicherten Arbeitsfaktor einen Prüfwert ab. Als Ausgangswert werden 600.000 Iterationen verwendet; die Bedienbarkeit wird auf den Zielgeräten geprüft und die Parameter bleiben versionsfähig. Nach einer Wiederherstellung gilt die in der Sicherung enthaltene PIN-Konfiguration.

Die PIN schützt vor versehentlichem oder gewöhnlichem Zugriff durch Helfer. Sie kann keinen Angreifer mit Zugriff auf Browserdaten, JavaScript-Konsole oder Sicherungsdatei zuverlässig abwehren. Lokale Daten und Sicherungen werden daher nicht als kryptografisch geschützter Tresor dargestellt.

### 9. Service Worker, Offline-Cache und Updates

`vite-plugin-pwa` erzeugt Manifest und Service Worker. Der Build precacht die vollständige Anwendungsshell einschließlich HTML, JavaScript, CSS, Icons und lokal verwendeter Assets. Nach dem ersten erfolgreichen Laden wird ein Offline-Bereitschaftsstatus angezeigt; erst dieser Zustand gilt als abgeschlossene Einrichtung.

Eine neue Version aktiviert sich nicht unbemerkt während einer offenen Bestellung. Die Oberfläche meldet das Update und bietet ein Neuladen an, sobald keine Bestellung offen ist. Datenbankschemata werden ausschließlich durch versionierte Vorwärtsmigrationen geändert.

Beim ersten Einrichten und im Admin-Bereich werden `navigator.storage.persist()` und `navigator.storage.persisted()` verwendet. Wird dauerhafter Speicher nicht bestätigt, bleibt die Kasse nutzbar, zeigt aber dauerhaft eine Sicherungswarnung. Ein privates Browserfenster lässt sich nicht zuverlässig erkennen; stattdessen warnt die Anwendung anhand fehlender Persistenz und dokumentiert, dass private Modi nicht unterstützt werden.

### 10. Responsive Bedienung und Browserbasis

Die Kassenansicht verwendet mobile-first CSS Grid/Flexbox, große Touch-Ziele und eine feste, jederzeit sichtbare Bestellzusammenfassung. Auf kleinen Bildschirmen werden Produktbereich und Bestellung untereinander, auf breiten Bildschirmen nebeneinander angeordnet. Kritische Aktionen wie Storno, Veranstaltungsabschluss und Wiederherstellung erhalten klare Bestätigungsdialoge.

Der initiale Build folgt der modernen Vite-Browserbasis. Zum Planungszeitpunkt bedeutet das mindestens Chrome/Edge 111, Firefox 114 und Safari/iOS 16.4. Zusätzlich zu automatisierten Browserläufen erfolgt vor dem Einsatz ein Realgerätetest auf iPad Safari, Android Chrome und einem Desktop-Browser.

### 11. CSV ausschließlich clientseitig erzeugen

Der CSV-Export wird aus der ausgewählten Veranstaltung im Browser erzeugt. Er nutzt UTF-8 mit BOM, deutsche Beschriftungen und ein tabellenkalkulationsfreundliches Semikolon als Trennzeichen. Geldbeträge werden für die Datei mit Dezimalkomma formatiert. Die vollständige Sicherung bleibt davon technisch und in der Oberfläche deutlich getrennt.

### 12. GitHub Pages unter dauerhafter Subdomain

GitHub Actions baut die PWA reproduzierbar und veröffentlicht ausschließlich das `dist`-Verzeichnis. Für den Probelauf auf GitHub Pages übernimmt der Build den Projektpfad aus den Pages-Einstellungen. Auf der dauerhaften eigenen HTTPS-Subdomain gilt der Basispfad `/`.

IndexedDB ist an Schema, Host und Port des Ursprungs gebunden. Beim späteren Wechsel zu Hostinger bleiben deshalb dieselbe HTTPS-Subdomain und derselbe Pfad bestehen. Nur DNS und statisches Hosting wechseln. Vor dem DNS-Wechsel wird eine vollständige Sicherung erstellt und der identische Build auf dem neuen Hosting offline getestet.

Der veröffentlichte Quellcode und Build enthalten keine PIN, keine Buchungen und keine sonstigen Veranstaltungsdaten; diese verlassen das jeweilige Gerät nur durch einen vom Admin ausgelösten Datei-Export.

### 13. Teststrategie

- Vitest prüft die reine Fachlogik: Centrechnung, Pfandbegrenzung, Rückgaben, Stornos, Statistiken, Preisgruppen und Veranstaltungskopie.
- Datenbanktests prüfen Transaktionsabbruch, eindeutige Stornos, Schema-Migrationen und atomare Wiederherstellung.
- Playwright prüft die wichtigsten Abläufe in Chromium, Firefox und WebKit sowie in mobilen Viewports.
- Ein Produktions-Build wird nach dem ersten Online-Laden vollständig offline getestet, einschließlich Neustart, Buchung, CSV, Sicherung und Wiederherstellung.
- Vor jeder Veranstaltung wird auf jedem vorgesehenen Gerät ein kurzer Probelauf mit Testveranstaltung, Backup und Offline-Neustart durchgeführt.

## Risks / Trade-offs

- **[Browser löscht lokale Best-Effort-Daten]** → Persistenz anfordern, Status sichtbar machen und regelmäßige vollständige Sicherungen verlangen.
- **[Gerätedefekt oder verlorenes Gerät]** → Sicherungsdatei vor und nach der Veranstaltung außerhalb des Kassengeräts speichern.
- **[Wechsel der Subdomain trennt den alten Datenbestand ab]** → Dauerhafte HTTPS-Subdomain beibehalten und vor jedem Hostingwechsel sichern.
- **[Service-Worker-Update mischt alte und neue Dateien]** → vollständiges Precache, versionsgebundene Assets und kontrolliertes Neuladen außerhalb offener Bestellungen.
- **[Fehlerhafte Datenbankmigration verhindert einen Start]** → Migrationen mit realistischen Altdaten testen und vor schemaändernden Releases eine Sicherung erstellen.
- **[Mehrere Tabs bearbeiten denselben Gerätestand]** → zweites Fenster deutlich warnen; fachliche Invarianten zusätzlich durch atomare Datenbanktransaktionen und eindeutige Indizes erzwingen.
- **[Kurze PIN kann offline erraten werden]** → gesalzene langsame Ableitung verwenden und die PIN ausdrücklich nur als lokalen Bedienungsschutz behandeln.
- **[Unverschlüsselte Sicherung wird weitergegeben]** → Datei deutlich kennzeichnen und in der Bedienungsanleitung sichere Aufbewahrung verlangen.
- **[Automatisierte WebKit-Tests entsprechen nicht vollständig echtem iPad Safari]** → zwingender Realgerätetest vor dem Veranstaltungseinsatz.
- **[Geräte bleiben absichtlich getrennt]** → jede Gerätekasse separat abrechnen und exportieren; keine scheinbare Gesamtsumme anbieten.

## Migration Plan

1. Anwendung mit versioniertem IndexedDB-Schema, Standardartikeln und Ersteinrichtung entwickeln.
2. Fachlogik, Datenbankmigrationen, Browserabläufe und Produktions-Build automatisiert prüfen.
3. Dauerhafte Subdomain auf GitHub Pages konfigurieren, HTTPS erzwingen und den Build über GitHub Actions veröffentlichen.
4. Jedes Kassengerät online unter genau dieser Subdomain einrichten, PWA installieren, Speicherstatus prüfen und eine benannte Testveranstaltung anlegen.
5. Offline-Probelauf einschließlich Verkauf, Pfand, Storno, CSV, Sicherung, Browser-Neustart und Wiederherstellung durchführen.
6. Testdaten kontrolliert durch eine neue leere Veranstaltung oder eine vorbereitete Sicherung ersetzen und unmittelbar eine Ausgangssicherung speichern.
7. Bei einem fehlerhaften reinen Frontend-Release den vorherigen statischen Build erneut veröffentlichen. Nach einer Datenbankschema-Migration nur auf eine kompatible Version zurückrollen oder die zuvor erstellte Sicherung wiederherstellen.
8. Für einen späteren Hostinger-Umzug denselben Build und dieselbe HTTPS-Subdomain verwenden, vorab sichern, DNS umstellen und anschließend Online-Update sowie Offline-Neustart prüfen. Bei Problemen DNS auf GitHub Pages zurückstellen.

## Technical References

- [Vite: statische Veröffentlichung und GitHub Pages](https://vite.dev/guide/static-deploy)
- [Vite: Build und aktuelle Browserbasis](https://vite.dev/guide/build.html)
- [MDN: IndexedDB und Same-Origin-Bindung](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology)
- [Dexie: IndexedDB- und Transaktions-API](https://dexie.org/docs/Dexie/Dexie.transaction%28%29)
- [Vite PWA: Precache des Service Workers](https://vite-pwa-org.netlify.app/guide/service-worker-precache)
- [MDN: dauerhaften Browser-Speicher anfordern](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist)
- [OWASP: Passwort- und PIN-Prüfwerte mit PBKDF2](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Playwright: Chromium-, Firefox- und WebKit-Tests](https://playwright.dev/docs/browsers)
- [GitHub Pages: HTTPS für eigene Domains](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
