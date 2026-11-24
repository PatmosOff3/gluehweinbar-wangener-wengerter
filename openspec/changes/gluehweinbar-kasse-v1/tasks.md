# Tasks

## 1. Projektgrundlage

- [x] 1.1 Eine React-/TypeScript-Anwendung mit Vite im Projektstamm anlegen und mit `npm run build` einen fehlerfreien statischen Produktions-Build erzeugen.
- [x] 1.2 Laufzeit- und Entwicklungsabhängigkeiten für React, Dexie, Zod, `vite-plugin-pwa`, Vitest, DOM-/Komponententests und Playwright festschreiben und mit einer sauberen `npm ci`-Installation verifizieren.
- [x] 1.3 Skripte für Typecheck, Lint, Unit-Tests, End-to-End-Tests und Build einrichten und verifizieren, dass jedes Skript in einer frisch installierten Arbeitskopie ausführbar ist.
- [x] 1.4 Die Verzeichnisse `domain`, `application`, `storage`, `ui`, `pwa` und `export` mit eindeutigen Abhängigkeitsgrenzen vorbereiten und per Typecheck sowie Lint verifizieren, dass die reine Domänenschicht keine UI- oder Datenbankimporte enthält.
- [x] 1.5 Eine kurze Entwicklerdokumentation mit Voraussetzungen, Installation und allen Prüfkommandos anlegen und durch Ausführen der dokumentierten Befehle verifizieren.

## 2. Fachmodelle und Rechenlogik

- [x] 2.1 Typen und Hilfsfunktionen für ganze Centbeträge, Mengen, Produkt-Snapshots und formatierte Eurobeträge implementieren und mit Unit-Tests gegen Rundungs- und Fließkommafehler absichern.
- [x] 2.2 Die Berechnung automatischer Pfandpositionen und die Begrenzung von „− Pfand“ implementieren und die Szenarien „neue Tasse“, „Nachfüllung“ sowie mehrfaches Minus-Pfand mit Unit-Tests verifizieren.
- [x] 2.3 Separate Pfandrückgaben sowie positive, negative und genau null betragende Zahlungen modellieren und die Beispiele „vier Gläser/zwei Nachfüllungen“, „Schorle mit zwei Rückgaben“ und „nur Leergut“ per Unit-Test verifizieren.
- [x] 2.4 Barzahlung, Schnellbeträge, frei eingegebenes Bargeld und Rückgeld implementieren und mit Tests für passend, 10-Euro-Schein und zu geringen Zahlbetrag verifizieren.
- [x] 2.5 Unveränderliche Verkaufs- und Storno-Snapshots sowie die daraus abgeleitete Statistik implementieren und mit Tests für Warenumsatz, beide Pfandsummen und genau einmal wirkende Stornos verifizieren.
- [x] 2.6 Preisgruppen für roten und weißen Glühwein sowie das bestätigte Standardsortiment modellieren und per Unit-Test verifizieren, dass beide Glühweinsorten denselben neuen Preis, aber getrennte Produktidentitäten behalten; für Honig darf kein unbelegter Startpreis erfunden werden.

## 3. Lokale IndexedDB-Datenhaltung

- [x] 3.1 Die Dexie-Datenbank mit versioniertem Schema für `deviceSettings`, `events`, `eventSettings`, `products` und `transactions` implementieren und das Öffnen sowie eine Schema-Migration mit einer isolierten Testdatenbank verifizieren.
- [x] 3.2 Repositories für geräteweite Einstellungen, Veranstaltungen, Veranstaltungseinstellungen und Produkte implementieren und CRUD- sowie Veranstaltungsfilter-Tests gegen IndexedDB ausführen.
- [x] 3.3 Den Verkaufsabschluss mit laufender Veranstaltungsnummer und vollständigem Snapshot in einer atomaren Dexie-Transaktion implementieren und durch einen erzwungenen Fehler verifizieren, dass keine Teilbuchung bestehen bleibt.
- [x] 3.4 Stornos als separate Umkehrdatensätze mit eindeutigem Bezug zum Verkauf speichern und per Datenbanktest verifizieren, dass ein zweites Storno desselben Verkaufs abgewiesen wird.
- [x] 3.5 Abfragen für den letzten nicht stornierten Verkauf und für veranstaltungsbezogene Statistiken implementieren und mit konkurrierenden Zeitstempeln sowie laufenden Nummern verifizieren.
- [x] 3.6 Schreibende Repositories so absichern, dass nur die aktive Veranstaltung geändert wird, und per Integrationstest verifizieren, dass Buchungen und Produktänderungen an abgeschlossenen Veranstaltungen scheitern.

## 4. Ersteinrichtung und Admin-PIN

- [x] 4.1 PIN-Erzeugung und -Prüfung mit Web Crypto, zufälligem Salt und versionierten PBKDF2-HMAC-SHA-256-Parametern implementieren und durch korrekte, falsche und nach Sicherungs-Roundtrip wiederhergestellte PINs testen.
- [x] 4.2 Einen Ersteinrichtungsablauf für Admin-PIN, verpflichtenden Veranstaltungsnamen, globales Pfand und bestätigtes Standardsortiment umsetzen und per Komponententest verifizieren, dass ohne gültige Eingaben keine aktive Veranstaltung entsteht.
- [x] 4.3 Admin-Funktionen hinter einer sperrbaren lokalen Sitzung schützen und verifizieren, dass Produktpflege, Veranstaltungsverwaltung, Statistik, Sicherung und Export mit falscher PIN gesperrt bleiben und nach dem Sperren erneut eine PIN verlangen.
- [x] 4.4 In der Admin-Oberfläche verständlich dokumentieren, dass die PIN ein lokaler Bedienungsschutz und kein Schutz vor Gerätezugriff ist, und die Sichtbarkeit dieses Hinweises per UI-Test verifizieren.
- [x] 4.5 Gleichzeitige Fenster über `BroadcastChannel` erkennen und im zweiten Fenster eine Warnung anzeigen; das Verhalten mit einem Mehrseiten-Browsertest verifizieren, ohne Datenbanktransaktionen als Konsistenzschutz zu ersetzen.

## 5. Responsive Kassenoberfläche

- [x] 5.1 Eine mobile-first Kassenansicht mit Produkttasten, offener Bestellung und stets sichtbarer Summe umsetzen und bei kleinen sowie breiten Viewports ohne horizontales Scrollen per Komponententest verifizieren.
- [x] 5.2 Produktmengen hinzufügen, verringern und entfernen sowie rote und weiße Glühweinpositionen getrennt anzeigen und den Warenkorbzustand mit Interaktionstests verifizieren.
- [x] 5.3 Große Tasten für „− Pfand / Gefäß vorhanden“ und Pfandrückgabe mit sichtbaren Mengen und Beträgen umsetzen und per UI-Test verifizieren, dass Minus-Pfand über der automatisch erzeugten Anzahl keinen weiteren Abzug bewirkt.
- [x] 5.4 Die Zahlungsansicht für „Passend“, 5 €, 10 €, 20 € und freie Eingabe umsetzen und per UI-Test verifizieren, dass Rückgeld, Auszahlung und ein unzureichender gegebener Betrag eindeutig dargestellt werden.
- [x] 5.5 Den Verkaufsabschluss an den atomaren Anwendungsfall anbinden, Erfolg erst nach Datenbank-Commit anzeigen und per Integrationstest verifizieren, dass ein Doppeltippen nur eine Buchung erzeugt.
- [x] 5.6 „Letzten Verkauf stornieren“ ohne Admin-PIN umsetzen und mit UI-/Datenbanktest verifizieren, dass Waren- und Pfandwerte genau einmal korrigiert werden.
- [ ] 5.7 Die Kassenbedienung mit geeigneten Touch-Zielgrößen, Tastaturfokus und verständlichen Aktionsbezeichnungen ausstatten und per automatisiertem Accessibility-Test sowie manueller Touch-Prüfung verifizieren.

## 6. Sortiments- und Pfandverwaltung

- [x] 6.1 Eine Admin-Liste und Formulare zum Anlegen und Bearbeiten von Bezeichnung, optionaler Einheit, Centpreis und Pfandpflicht umsetzen und Pflichtfeld-, Preis- und Speichertests hinzufügen.
- [x] 6.2 Produkte deaktivierbar und reaktivierbar machen und per Integrationstest verifizieren, dass deaktivierte Produkte aus der Kasse verschwinden, historische Verkäufe aber unverändert bleiben.
- [x] 6.3 Die gemeinsame Preisgruppe von rotem und weißem Glühwein in der Admin-Oberfläche abbilden und per Test verifizieren, dass eine Preisänderung beide aktiven Produkttasten atomar aktualisiert.
- [x] 6.4 Den globalen Pfandbetrag der aktiven Veranstaltung pflegbar machen und per Test verifizieren, dass nur neue Verkäufe und Rückgaben den geänderten Betrag verwenden.
- [x] 6.5 Bearbeitungen gegen eine inzwischen abgeschlossene Veranstaltung mit verständlichem Hinweis abweisen und den konkurrierenden Veranstaltungswechsel per Integrationstest verifizieren.

## 7. Veranstaltungsverwaltung

- [x] 7.1 Aktive und abgeschlossene Veranstaltungen im Admin-Bereich auflisten und Namen nach PIN-Freigabe ändern lassen; per Test verifizieren, dass ein leerer Name abgewiesen und der neue Name in Statistik sowie Export verwendet wird.
- [x] 7.2 „Neue Veranstaltung starten“ mit einer Bestätigung des Abschlusses umsetzen und den atomaren Kopiervorgang für Produkte, Einheiten, Preise, Pfandpflichten, Verfügbarkeiten, Preisgruppen und Pfandbetrag per Datenbanktest verifizieren.
- [x] 7.3 Verifizieren, dass die neue Veranstaltung ohne Verkäufe, Rückgaben, Stornos oder Statistikwerte beginnt und Änderungen ihrer Kopie nicht auf die abgeschlossene Veranstaltung zurückwirken.
- [x] 7.4 Abgeschlossene Veranstaltungen als nur les- und exportierbar darstellen und per UI-/Repository-Test verifizieren, dass lediglich Umbenennen, Statistikansicht und Export möglich bleiben.
- [x] 7.5 Den Wechsel der aktiven Veranstaltung in zwei gleichzeitig geöffneten Fenstern testen und verifizieren, dass nach dem Commit kein weiterer Schreibvorgang in die alte Veranstaltung gelangt.

## 8. Statistik und CSV-Abrechnung

- [x] 8.1 Veranstaltungsbezogene Statistikabfragen für Stückzahl und Warenumsatz je Produkt sowie eingenommenes und ausgezahltes Pfand implementieren und mit den vollständigen Rechenbeispielen der Specs testen.
- [x] 8.2 Eine Admin-Auswertung für aktive und abgeschlossene Veranstaltungen umsetzen und per UI-Test verifizieren, dass roter und weißer Glühwein getrennt sowie stornierte Vorgänge korrigiert erscheinen.
- [x] 8.3 Einen CSV-Generator mit UTF-8-BOM, Semikolon, Dezimalkomma, sicherem Quoting und Veranstaltungsnamen implementieren und durch Parser-basierte Tests mit Umlauten, Trennzeichen und Anführungszeichen verifizieren.
- [x] 8.4 Den Offline-Download der ausgewählten Veranstaltungsabrechnung anbinden und per Browser-Test verifizieren, dass nur aggregierte Daten dieses Geräts und dieser Veranstaltung enthalten sind.
- [x] 8.5 Statistik- und CSV-Ergebnisse nach Produktumbenennung, Preisänderung und Deaktivierung testen und verifizieren, dass die gebuchten Snapshot-Werte erhalten bleiben.

## 9. Vollständige Sicherung und Wiederherstellung

- [x] 9.1 Ein versioniertes Zod-Schema und den JSON-Export für alle lokalen Tabellen implementieren und per Roundtrip-Test verifizieren, dass die Sicherung den vollständigen Stand enthält und den Export selbst nicht verändert.
- [x] 9.2 Formatbezeichner, Versionsprüfung, Typen und Querverweise vor jedem Import validieren und mit beschädigten, unvollständigen sowie zu neuen Dateien verifizieren, dass lokale Daten unberührt bleiben.
- [x] 9.3 Unterstützte ältere Sicherungsversionen über explizite In-Memory-Migrationen in das aktuelle Format überführen und jede Migrationsstufe mit festen Testdateien verifizieren.
- [x] 9.4 Die ersetzende Wiederherstellung mit ausdrücklicher Sicherheitsabfrage und einer einzigen Dexie-Transaktion umsetzen und per Fehler-Injektion verifizieren, dass Abbruch oder Importfehler den alten Stand vollständig erhalten.
- [x] 9.5 Im Admin-Bereich „Vollständige Sicherung“ und „CSV-Abrechnung“ klar trennen, auf die unverschlüsselte vertrauliche Datei hinweisen und die sichtbaren Beschreibungen per UI-Test verifizieren.
- [x] 9.6 Eine Sicherung in einer leeren Testdatenbank wiederherstellen und per Integrationstest verifizieren, dass PIN, aktive Veranstaltung, abgeschlossene Veranstaltungen, Produkte, Buchungen und Stornos offline genau einmal verfügbar sind.

## 10. PWA, Offlinebetrieb und lokale Persistenz

- [x] 10.1 Web-App-Manifest, lokal gebündelte Icons und `vite-plugin-pwa` konfigurieren und mit Produktions-Build sowie Manifest-Prüfung verifizieren, dass die Anwendung installierbar ist.
- [x] 10.2 Die vollständige Anwendungsshell einschließlich aller benötigten Schriften und Assets precachen und in einem Produktions-Browserlauf verifizieren, dass Kasse und Admin-Bereich nach dem ersten Laden ohne Netz starten.
- [x] 10.3 Offline-Bereitschaft und Installationsstatus in der Oberfläche anzeigen und per Service-Worker-Test verifizieren, dass „offline bereit“ erst nach erfolgreichem Precache erscheint.
- [x] 10.4 Dauerhaften Speicher mit `navigator.storage.persist()` beziehungsweise `persisted()` anfragen und bei Ablehnung oder fehlender Unterstützung eine dauerhafte Sicherungswarnung anzeigen; beide Browserantworten per Test simulieren.
- [x] 10.5 Einen kontrollierten Updatehinweis implementieren und per Browser-Test verifizieren, dass eine neue Version während einer offenen Bestellung nicht automatisch neu lädt, danach aber übernommen werden kann.
- [x] 10.6 Einen Neustart nach vollständigem Schließen des Browsers im Offline-Modus testen und verifizieren, dass abgeschlossene Vorgänge genau einmal vorhanden sind und weiter kassiert werden kann.

## 11. Übergreifende Abnahme

- [x] 11.1 Den kompletten Ablauf „zwei Glühwein, zweimal − Pfand, zwei Rückgaben“ als End-to-End-Test ausführen und 3,00 € Kassierbetrag, 7,00 € Warenumsatz, 0,00 € eingenommenes sowie 4,00 € ausgezahltes Pfand verifizieren.
- [x] 11.2 Die Hauptabläufe in Playwright unter Chromium, Firefox und WebKit sowie in mobilen und Desktop-Viewports ausführen und verifizieren, dass die definierte Browsermatrix vollständig grün ist.
- [x] 11.3 Ersteinrichtung, Verkauf, Storno, Veranstaltungswechsel, CSV, Sicherung, Wiederherstellung und Offline-Neustart in einem Produktions-Build als zusammenhängenden Abnahmetest verifizieren.
- [x] 11.4 Typecheck, Lint, Unit-, Komponenten-, Datenbank- und End-to-End-Tests sowie Produktions-Build in einem einzigen CI-Prüflauf ausführen und verifizieren, dass ein Fehler den Lauf zuverlässig fehlschlagen lässt.
- [x] 11.5 Den erzeugten Build auf ausgehende Laufzeit-Netzwerkabhängigkeiten prüfen und verifizieren, dass nach dem Precache für den Kassenbetrieb keine API, Schrift oder sonstige externe Ressource benötigt wird.

## 12. GitHub Pages und Betriebsübergabe

- [x] 12.1 Einen GitHub-Actions-Workflow für reproduzierbare Installation, Prüfungen, Build und Veröffentlichung ausschließlich des `dist`-Verzeichnisses anlegen und einen erfolgreichen Workflow-Lauf verifizieren.
- [ ] 12.2 Die gewählte dauerhafte Subdomain, Vite-Basispfad `/`, CNAME/DNS und erzwungenes HTTPS für GitHub Pages konfigurieren und durch Aufruf der endgültigen HTTPS-Adresse ohne Zertifikats- oder Assetfehler verifizieren.
- [ ] 12.3 PWA-Installation, Offline-Neustart, Datei-Download und Datei-Upload auf einem echten iPad mit Safari, einem Android-Gerät mit Chrome und einem Laptop/PC verifizieren und Ergebnisse in einer Abnahmecheckliste dokumentieren.
- [x] 12.4 Eine Bedienungsanleitung für Ersteinrichtung, Kassieren, Pfand, Storno, Produktpflege, Veranstaltungswechsel, getrennte Geräteabrechnung, CSV, Sicherung und Wiederherstellung erstellen und jeden beschriebenen Ablauf am Produktions-Build nachvollziehen.
- [x] 12.5 Eine Einsatzcheckliste für Speicherstatus, Testveranstaltung, Ausgangssicherung, Offline-Probelauf und Sicherung nach Veranstaltungsende erstellen und durch einen vollständigen Probedurchlauf verifizieren.
- [x] 12.6 Die Betreiberentscheidung zum vorhandenen Umfang der Kassenaufzeichnungen in der Betriebsübergabe dokumentieren.
- [x] 12.7 In der Bedienungsanleitung beschreiben, wie Honig nach Festlegung des Preises im Admin-Bereich der aktiven Veranstaltung ergänzt werden kann.

## Workflow follow-up

- Nach vollständiger Implementierung und Abnahme die Delta-Specs in die Haupt-Specs synchronisieren beziehungsweise den Change nach dem vorgesehenen OpenSpec-Ablauf archivieren.
- Nach dem Archivieren die OpenSpec-Validierung erneut strikt ausführen und das Ergebnis prüfen.
