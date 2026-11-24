# Probelauf und Einsatzcheckliste

Für jedes Kassengerät und Browserprofil separat durchführen. Eine Testveranstaltung kennzeichnet alle Probebuchungen.

- [ ] Die dauerhafte HTTPS-Adresse im normalen Browserprofil öffnen. App über das Browsermenü installieren, auf dem iPad über das Teilen-Menü zum Home-Bildschirm hinzufügen.
- [ ] Testveranstaltung einrichten. Auf „Offline bereit“ warten. Im Admin-Bereich den Speicherstatus prüfen und eine vollständige Ausgangssicherung außerhalb des Geräts ablegen.
- [ ] Gerät vom Netz trennen. Einen roten und einen weißen Glühwein, viermal „− Pfand“ für zwei vorhandene Gefäße und zwei Rückgaben erfassen. Bei Standardpreisen 3,00 € passend kassieren. In der Statistik 7,00 € Warenumsatz, 0,00 € eingenommenes und 4,00 € ausgezahltes Pfand prüfen.
- [ ] Mit den vorgesehenen Handschuhen zusätzlich rot und weiß, zweimal „− Pfand“ für ein vorhandenes und ein zurückgegebenes Gefäß antippen. Bei Standardpreisen müssen 7,00 € erscheinen. Alle Tasten müssen einzeln ohne Zoom erreichbar sein.
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

Honig kann ergänzt werden, sobald sein Preis feststeht. Die Schritte stehen in der [Bedienungsanleitung](bedienung.md).
