# Probelauf und Einsatzcheckliste

Für jedes Kassengerät und Browserprofil separat durchführen. Eine Testveranstaltung kennzeichnet alle Probebuchungen.

- [ ] Die dauerhafte HTTPS-Adresse im normalen Browserprofil öffnen. App über das Browsermenü installieren, auf dem iPad über das Teilen-Menü zum Home-Bildschirm hinzufügen.
- [ ] Testveranstaltung einrichten. Auf „Offline bereit“ warten. Im Admin-Bereich den Speicherstatus prüfen und eine vollständige Ausgangssicherung außerhalb des Geräts ablegen.
- [ ] Gerät vom Netz trennen. Einen roten und einen weißen Glühwein, viermal „− Pfand“ für zwei vorhandene Gefäße und zwei Rückgaben erfassen. Bei Standardpreisen 2,00 € auszahlen. In der Statistik 8,00 € Warenumsatz, 0,00 € eingenommenes und 10,00 € ausgezahltes Pfand prüfen.
- [ ] Mit den vorgesehenen Handschuhen zusätzlich rot und weiß, zweimal „− Pfand“ für ein vorhandenes und ein zurückgegebenes Gefäß antippen. Bei Standardpreisen müssen 8,00 € erscheinen. Alle Tasten müssen einzeln ohne Zoom erreichbar sein.
- [ ] Einen Beispielverkauf stornieren. Korrigierte Statistik öffnen, CSV und JSON herunterladen. Beide Dateien am vorgesehenen Speicherort kontrollieren.
- [ ] Browser vollständig schließen und offline erneut öffnen. Vorgangsnummer und Statistik kontrollieren und einen weiteren Verkauf abschließen.
- [ ] Auf einem Testprofil die JSON-Datei auswählen, zunächst abbrechen, dann erneut auswählen und das Ersetzen bestätigen. Mit der gesicherten PIN Veranstaltung und Werte prüfen.
- [ ] Nach erfolgreicher Probe die echte Veranstaltung starten, Sortiment und Pfand kontrollieren und den leeren Ausgangsstand sichern.
- [ ] Nach Veranstaltungsende auf jedem Gerät die CSV der Veranstaltung und eine vollständige Sicherung speichern und außerhalb des Geräts ablegen.

## Technischer Probedurchlauf

Der Produktions-Browsertest „startet dasselbe Profil nach vollständigem Schließen ohne Netz und kassiert weiter“ führt von einer leeren Testveranstaltung mit Ausgangssicherung über Offline-Verkauf, CSV, Storno, Veranstaltungswechsel und Wiederherstellung bis zum vollständigen Browser-Neustart. Nach einem weiteren Verkauf und dem Abschluss der Veranstaltung prüft er die Abschlusssicherung einschließlich beider Vorgänge. Der Test „prüft Ersteinrichtung, Zugang, Mengentasten, Rückgeld, Auszahlung und Doppeltippen“ prüft zusätzlich die sichtbare Warnung bei verweigertem dauerhaften Speicher.

## Realgeräteabnahme

| Gerät | Installation | Offline-Neustart | CSV-/JSON-Download | JSON-Upload | Touch mit Handschuhen | Datum / Prüfer |
| --- | --- | --- | --- | --- | --- | --- |
| iPad mit Safari | offen | offen | offen | offen | offen | |
| Android mit Chrome | offen | offen | offen | offen | offen | |
| Laptop/PC | offen | offen | offen | offen | sofern Touch vorhanden | |

Die Browsermatrix läuft automatisiert mit Desktop- und emulierten Mobilprofilen. Für die Einträge in dieser Tabelle zählt die Prüfung am jeweiligen Einsatzgerät.

## Entscheidungen des Betreibers

Am 24. November 2026 hat der Betreiber den vorhandenen Funktionsumfang für seine Kassenaufzeichnungen akzeptiert. Die Kasse speichert Einzelbuchungen lokal und bietet CSV-Abrechnungen und JSON-Sicherungen. Für die Projektabnahme ist keine zusätzliche externe Prüfung vorgesehen.

Honig ist für 8 € je 500 g im finalen Standardsortiment enthalten. Die Schritte stehen in der [Bedienungsanleitung](bedienung.md).

## iPad-Querformat und Darstellungsmodus

Messung im emulierten iPad-WebKit mit je einem Stück aller elf Standardartikel, im Hellmodus am Anfang der Bestellliste. Vergleichsstand ist der Git-Tag `v1`.

| Viewport in CSS-Pixeln | Listenhöhe v1 → überarbeitet | Vollständig sichtbare Positionen v1 → überarbeitet |
| --- | --- | --- |
| 1105 × 688 | 254 → 295 px | 2 → 4 |
| 1105 × 604 | 170 → 211 px | 1 → 3 |
| 1024 × 600 | 166 → 207 px | 1 → 3 |

- [ ] Auf dem echten iPad mit eingeblendeten Safari-Leisten und als installierte PWA prüfen, ob alle zwölf Standardartikel einschließlich „Glas / Tasse“, Minus-Pfand und „Zur Zahlung“ ohne Seitenscrollen sichtbar sind.
- [ ] Auf dem echten iPad in Safari und über das Home-Bildschirm-Symbol einen Verkauf über 9 € öffnen. „Anderer Betrag“ antippen, 12,50 € eingeben und 3,50 € Rückgeld prüfen. Über „Bargeld ändern“ mit der Rücktaste korrigieren und abbrechen. Währenddessen bleibt die iPad-Systemtastatur geschlossen. Geräteprüfung ausstehend.
- [ ] Alle Artikel einmal erfassen: Nur die Positionsliste der offenen Bestellung scrollt. Summe, Pfandübersicht und Bestellaktionen bleiben sichtbar; auch die letzte Position kann entfernt werden.
- [ ] Ohne Admin-PIN zwischen Dunkelmodus und Hellmodus wechseln; Lesbarkeit, Rot-/Weiß-Unterscheidung und rote Auszahlungsbeträge einschließlich Rückgeld prüfen.
- [ ] Browser neu öffnen: Darstellungswahl und gebuchte Vorgänge sind erhalten. Safari-Leisten ein-/ausblenden und erneut die Erreichbarkeit der Zahlungsaktion prüfen.

Automatisierte WebKit-Prüfungen verwenden 1105 × 688, 1105 × 604 und 1024 × 600 CSS-Pixel sowie beide Farbmodi. Diese Emulation ersetzt nicht die noch ausstehende Prüfung auf dem echten iPad.
