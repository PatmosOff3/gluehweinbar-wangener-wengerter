# Spec Delta

## MODIFIED Requirements

### Requirement: Erkennbare Produktkacheln
Die Kasse MUST Name, vorhandene Größe und Preis lesbar zeigen. Das Produktsymbol steht rechts neben dem Namen. Roter und weißer Standardglühwein verwenden ihre Kachelfarbe ohne Kaffeetasse. Alkoholhaltige Getränke tragen unten rechts „ALK“ in roten Großbuchstaben mit roter kreisförmiger Umrandung.

#### Scenario: Ausschank und Flasche
- **WHEN** die Bedienung das Standardsortiment öffnet
- **THEN** unterscheiden die Symbole Weinglas und Weinflasche sowie Shot und Tresterbrandflasche
- **AND** Glühwein, Bier, Wein, Schnaps und Tresterbrand tragen das lesbare Alkoholkennzeichen in beiden Farbmodi

#### Scenario: Bestehendes Sortiment auf dem iPad
- **WHEN** eine bestehende Veranstaltung mit der v1-Standardtasse oder ein neu eingerichtetes Sortiment geöffnet wird
- **THEN** zeigen beide Glühweinkacheln ihre jeweilige Farbe ohne Kaffeetasse

### Requirement: Passendes Bargeld direkt buchen
„Passend“ MUST eine positive Bestellung mit exakt der fälligen Summe einmalig abschließen. Nach erfolgreichem Speichern erscheint über der noch sichtbaren Zahlungsseite kurz ein Popup mit grünem Häkchen und Buchungsbestätigung. Anschließend wechselt die Kasse mit einem kurzen Übergang automatisch zur leeren Bestellung.

#### Scenario: Erfolgreicher Abschluss
- **WHEN** die Bedienung beim Betrag von 9 € zweimal schnell auf „Passend“ tippt
- **THEN** wird genau ein Verkauf mit 9 € Bargeld und null Rückgeld gespeichert
- **AND** die Bestätigung erscheint auf dem Zahlungsbildschirm, danach ist ohne weiteren Tipp die Kasse für den nächsten Gast bereit

#### Scenario: Fehler beim Speichern
- **WHEN** die Buchung fehlschlägt
- **THEN** bleiben Bestellung und Zahlungsansicht für die Korrektur oder Wiederholung erhalten und die Kasse zeigt eine Fehlermeldung ohne Erfolgshäkchen

## ADDED Requirements

### Requirement: Kompakte Überschriften und hervorgehobene Bestellung
Die Kasse MUST „Sortiment“ und „Letzte Bestellung · Vorgang …“ kleiner und serifenlos darstellen. Rechts nimmt die Bestellsumme den Platz der bisherigen sichtbaren Überschrift „Offene Bestellung“ ein. Eine begonnene Bestellung bekommt einen deutlich sichtbaren Rahmen.

#### Scenario: Leerer Warenkorb, Pfandrückgabe und Nullsumme
- **WHEN** die Kasse leer ist
- **THEN** steht die Nullsumme oben und der Bestellbereich erscheint neutral
- **WHEN** ein Artikel oder eine reine Pfandrückgabe erfasst wird
- **THEN** erscheint der Rahmen auch bei negativem Betrag oder bei einem Vorgang mit Summe null
- **WHEN** die letzte Position und alle Pfandabzüge entfernt sind
- **THEN** erscheint der Bereich wieder neutral

#### Scenario: Platz auf dem iPad
- **WHEN** dieselbe Bestellung im unterstützten iPad-Querformat wie in v1 angezeigt wird
- **THEN** steht der Positionsliste durch die entfallene Titelzeile mehr sichtbare Höhe zur Verfügung
- **AND** bei langen Bestellungen scrollt die Positionsliste, während Summe und Zahlungsaktion erreichbar bleiben

### Requirement: Erkennbare und korrigierbare Bestellpositionen
Jede Produktposition MUST ihre Menge größer als Preis und Einheit anzeigen. Die Glühweinpositionen übernehmen Weinrot bzw. Goldgelb von der zugehörigen Produkttaste. Andere Getränke mit hinterlegtem Symbol zeigen dieses auch in der Bestellung. Die Bedienung kann jede Position vollständig entfernen und Mengen über eins schrittweise verringern.

#### Scenario: Menge von zwei auf eins korrigieren
- **WHEN** zwei rote Glühwein, ein weißer Glühwein und ein Bier erfasst sind
- **THEN** sind beide Glühweinpositionen anhand von Farbe und Namen unterscheidbar und die Bierposition zeigt ihr Biersymbol
- **AND** bei zwei Stück sind „−“ und „Entfernen“ sichtbar, bei einem Stück ausschließlich „Entfernen“
- **WHEN** die Bedienung bei zwei Stück einmal auf „−“ tippt
- **THEN** steht die Menge auf eins, die Summe ist aktualisiert und die Minustaste verschwindet

### Requirement: Freies Bargeld über den kasseneigenen Ziffernblock
„Anderer Betrag“ MUST ein Popup mit Betragsanzeige, Ziffern 0–9, Dezimalkomma, Rücktaste, Abbruch und „Rückgeld anzeigen“ öffnen. Alle Schritte sind per Touch ohne die iPad-Systemtastatur möglich. Die Bestätigung übernimmt den eingegebenen Betrag in den Rückgelddialog. Erst „Vorgang abschließen“ bucht den Verkauf.

#### Scenario: Freien Betrag eingeben und korrigieren
- **WHEN** bei 9 € Bestellsumme die Bedienung „Anderer Betrag“ wählt und 12,50 eingibt
- **THEN** zeigt der Rückgelddialog nach Bestätigung 3,50 € Rückgeld
- **WHEN** sie „Bargeld ändern“ wählt
- **THEN** kann sie die bisherige Eingabe im Ziffernblock korrigieren

#### Scenario: Unzureichender Betrag oder Abbruch
- **WHEN** die Eingabe leer, unvollständig oder kleiner als die Bestellsumme ist
- **THEN** kann die Bedienung den Wert korrigieren und es entsteht keine Buchung
- **WHEN** sie den Ziffernblock abbricht
- **THEN** gelangt sie mit erhaltener Bestellung zurück zur Bargeldauswahl
