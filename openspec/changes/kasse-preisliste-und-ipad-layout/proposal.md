# Proposal

## Why

Die finale Preisliste für den Weihnachtsmarkt 2026 weicht vom bisherigen Sortiment ab. Auf dem iPad im Querformat verdeckt die Zahlungsleiste Bedienelemente; häufig verkaufte Getränke und Auszahlungen sollen schneller erkennbar sein.

## What Changes

- Glühwein rot, Glühwein weiß und Bier stehen im Querformat als größere Tasten in der obersten Reihe. Glühwein rot erhält einen weinroten, Glühwein weiß einen goldgelben Hintergrund mit lesbarem Kontrast.
- Verkaufseinheiten sind generell optional; beide Glühweine werden ohne Größenangabe angezeigt und gespeichert.
- Ein direkt erreichbarer Hell-/Dunkel-Schalter speichert die Auswahl lokal ohne Admin-PIN.
- Beträge, die die Bedienung auszahlt, werden rot dargestellt, einschließlich Rückgeld. Bei negativen Bestellsummen entfällt auf der Barzahlungsseite der Satz „Kein erhaltenes Bargeld erforderlich“.
- Das Standardsortiment entspricht der finalen PDF: Glühwein je 4 €, Wein 0,1/0,2/0,75 l für 3/6/18 €, Bier 3 €, Schnaps 2 €, Sprudel 2 €, Tresterbrand klar und Barrique je 18 € für 0,5 l, Honig 8 € für 500 g. Apfelschorle entfällt; Pfand beträgt 5 €.
- Die bestätigte Preisumstellung gilt einmalig auch für die bereits aktive Veranstaltung. Historische Buchungen und abgeschlossene Veranstaltungen bleiben unverändert.
- Eine kompakte Kopfleiste und ein an der verfügbaren Höhe ausgerichtetes Layout halten im iPad-Querformat alle Standardprodukte, Pfand- und Zahlungsaktionen sichtbar. Nur die Positionsliste der offenen Bestellung scrollt bei Überlauf.

## Capabilities

### New Capabilities

- `kassenbetrieb`: Ergänzende Anforderungen an Produkttasten, Theme, Auszahlungsdarstellung und iPad-Layout.
- `sortimentsverwaltung`: Finale Preisliste, optionale Einheiten und einmalige Übernahme in vorhandene aktive Veranstaltungen.

Die Hauptspezifikationen sind noch leer. Die Pfade übernehmen die bereits im offenen Change `gluehweinbar-kasse-v1` verwendeten Fähigkeiten. Dieser Folgechange ergänzt deren Verhalten; seine finale Preisliste ersetzt fachlich die dortige vorläufige Preisliste. Andere Abweichungen zwischen dem ersten Change und der heutigen Implementierung, etwa die bereits zusammengeführte Minus-Pfand-Taste, werden hier nicht umgebaut.

### Modified Capabilities

Keine bereits veröffentlichten Hauptspezifikationen vorhanden.

## Impact

Betroffen sind React-Oberfläche und CSS, Standardartikel, Einrichtungsvorgaben, IndexedDB-/Anwendungslogik für die einmalige Umstellung sowie Sicherungsvalidierung, falls ein Umstellungsmarker ergänzt wird. Bestehende Tests und Bedienungsdokumentation müssen die neuen Preise und die fehlende Glühweingröße berücksichtigen. Neue externe Abhängigkeiten, Synchronisation, Veröffentlichung und Änderungen an abgeschlossenen Buchungen gehören nicht zum Umfang.
