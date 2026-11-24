# Die Glühweinbar bedienen

## Kasse vorbereiten

Öffne die endgültige HTTPS-Adresse online im normalen Browserprofil des Kassengeräts. Gib einen Veranstaltungsnamen ein, wähle eine lokale Admin-PIN mit 4 bis 12 Ziffern und kontrolliere den Pfandbetrag pro Gefäß. Klappe „Standardsortiment prüfen“ auf, prüfe die neun Artikel und bestätige die Übernahme. Nach „Kasse einrichten“ siehst du das Sortiment. Warte auf „Offline bereit“. Im Admin-Bereich steht eine Warnung, falls der Browser den dauerhaften Speicher nicht bestätigt.

## Bargeld und Gefäße

1. Tippe für jedes Stück einmal auf die Produkttaste. Roter und weißer Glühwein haben eigene Tasten. Wähle bei Wein die Ausschankgröße. In der offenen Bestellung kannst du Mengen verringern oder eine Position entfernen.
2. Für eine neue Tasse zählt das Pfand automatisch. Für ein mitgebrachtes Gefäß tippe einmal „− Pfand / Gefäß vorhanden“. Die Taste sperrt, sobald alle automatisch hinzugefügten Pfandpositionen ausgeglichen sind.
3. Für jedes tatsächlich zurückgegebene leere Gefäß tippe „Pfandrückgabe“. Das funktioniert auch ohne Warenkauf. Über die Korrekturtasten in der Bestellung kannst du eine versehentliche Eingabe zurücknehmen.
4. Prüfe Betrag und Richtung in der Summenleiste. Öffne „Zur Zahlung“. Wähle „Passend“, einen Schein oder „Anderer Betrag“. Gib das angezeigte Rückgeld heraus. Bei einer Auszahlung gibst du den angezeigten Betrag heraus. Nullbeträge und Auszahlungen kannst du direkt abschließen.
5. Tippe „Vorgang abschließen“. Warte auf die Meldung mit der Vorgangsnummer. „Zur Bestellung“ führt vor dem Abschluss zurück.
6. Bei einem Fehler öffne „Letzten Verkauf stornieren“, prüfe die Nummer und bestätige. Die Auswertung berücksichtigt die Gegenbuchung sofort. Helfer können das direkt an der Kasse erledigen.

**Kontrollbeispiel.** Ein roter und ein weißer Glühwein zu je 3,50 €, zweimal „Gefäß vorhanden“ und zwei zurückgegebene Gläser zu je 2,00 € ergeben **3,00 € kassieren**. Die Statistik enthält 7,00 € Warenumsatz, 0,00 € eingenommenes und 4,00 € ausgezahltes Pfand.

## Administration

Öffne „Admin-Bereich“, gib die PIN ein und tippe „Entsperren“. Mit „Sperren und zur Kasse“ gibst du das Gerät wieder an die Helfer.

- Unter „Sortiment und Pfand“ kannst du Namen, Einheit, Preis und Pfandpflicht ändern, einen Artikel anlegen oder als ausverkauft deaktivieren und später reaktivieren. Eine Preis- oder Einheitenänderung an einem Glühwein gilt für beide Sorten.
- Ändere „Globales Pfand“ für künftige Verkäufe und Rückgaben. Bereits gebuchte Vorgänge behalten die damaligen Angaben.
- „Neue Veranstaltung starten“ übernimmt das Sortiment einschließlich deaktivierter Artikel und den Pfandbetrag. Nach Bestätigung ist die bisherige Veranstaltung abgeschlossen. Die neue beginnt mit leerer Abrechnung. Im Auswahlfeld bleiben frühere Veranstaltungen für Statistik, Umbenennung und CSV erreichbar.
- Jedes Gerät und jedes Browserprofil führt eigene Bücher. Sichere und exportiere jede Gerätekasse einzeln. Die Statistik zählt Artikel, Warenumsatz sowie beide Pfandsummen der ausgewählten Veranstaltung.

### Honig später ergänzen

Sobald der Preis feststeht, öffne in der aktiven Veranstaltung **Admin-Bereich → Sortiment und Pfand → Artikel anlegen**. Gib als Bezeichnung „Honig im Glas“ ein, ergänze bei Bedarf die Verkaufseinheit und trage den vereinbarten Preis in Euro ein. Lass „Pfandpflichtig“ frei und wähle „Artikel speichern“. Nach „Sperren und zur Kasse“ erscheint die neue Produkttaste. Wiederhole die Anlage auf jedem Kassengerät, auf dem ihr Honig verkauft.

## Dateien und Offlinebetrieb

„CSV herunterladen“ im Abschnitt „CSV-Abrechnung“ speichert die Zusammenfassung der gewählten Veranstaltung. „Sicherung herunterladen“ unter „Vollständige Sicherung“ speichert dagegen alle lokalen Veranstaltungen, Buchungen und Einstellungen samt PIN-Prüfwert in einer wiederherstellbaren JSON-Datei. Bewahre diese unverschlüsselte Datei vertraulich außerhalb des Kassengeräts auf.

Zum Wiederherstellen wähle „Sicherungsdatei auswählen“. Nach erfolgreicher Prüfung kannst du abbrechen oder „Gesamten Kassenstand ersetzen“ wählen. Diese Bestätigung ersetzt auch die lokale PIN. Auf einem leeren Gerät findest du die Wiederherstellung bei der Ersteinrichtung. Öffne anschließend die aktive Veranstaltung mit der PIN aus der Sicherung.

Nach „Offline bereit“ kannst du Kasse und Verwaltung ohne Netz wieder öffnen. Bereits abgeschlossene Vorgänge überstehen den Neustart. Schließe offene Bestellungen vor dem Beenden ab. Einen angebotenen Versionswechsel kannst du nach dem Abschluss über „Update übernehmen“ auslösen.
