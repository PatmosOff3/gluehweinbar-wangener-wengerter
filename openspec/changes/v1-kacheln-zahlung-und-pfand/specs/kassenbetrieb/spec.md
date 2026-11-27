# Spec Delta

## ADDED Requirements

### Requirement: Erkennbare Produktkacheln
Die Kasse MUST Standardartikel mit einem rechtsbündigen Produktsymbol auf Höhe des Namens zeigen. Name, vorhandene Größe und Preis bleiben lesbar. Alkoholhaltige Getränke tragen zusätzlich unten rechts „Alk.“.

#### Scenario: Ausschank und Flasche
- **WHEN** die Bedienung das Standardsortiment öffnet
- **THEN** unterscheiden sich die beiden Weingläser von der Weinflasche und der 2-cl-Shot von den beiden Tresterbrandflaschen durch ihre Symbole
- **AND** Glühwein, Bier, Wein, Schnaps und Tresterbrand sind als alkoholhaltig gekennzeichnet

### Requirement: Große Zahlungstaste
Die Taste „Zur Zahlung“ MUST eine größere Berührungsfläche und größere Schrift als bisher bieten.

#### Scenario: iPad im Querformat
- **WHEN** elf Standardartikel auf einem iPad im unterstützten Querformat angezeigt werden
- **THEN** bleiben Artikel, Pfandtaste und die vergrößerte Zahlungstaste ohne Seitenscrollen erreichbar

### Requirement: Passendes Bargeld direkt buchen
„Passend“ MUST eine positive Bestellung mit exakt der fälligen Summe einmalig abschließen.

#### Scenario: Erfolgreicher Abschluss
- **WHEN** die Bedienung auf „Passend“ tippt, auch zweimal schnell hintereinander
- **THEN** erscheint nach dem Speichern die leere Bestellansicht mit sichtbarer Buchungsbestätigung und kurzem animiertem Häkchen
- **AND** genau ein Verkauf mit null Rückgeld ist gespeichert

#### Scenario: Fehler beim Speichern
- **WHEN** die Buchung fehlschlägt
- **THEN** bleiben Zahlungsansicht und Bestellung mit Fehlermeldung für eine Wiederholung erhalten

### Requirement: Reihenfolge der Rückgeldaktionen
Der Rückgelddialog MUST die Aktionen in Bedien- und Lesereihenfolge als „Vorgang abschließen“, „Bargeld ändern“, „Zurück zur Bestellung“ zeigen.

#### Scenario: Erhaltenen Betrag korrigieren
- **WHEN** die Bedienung einen Schein wählt und danach „Bargeld ändern“ antippt
- **THEN** öffnet sich die Bargeldauswahl für dieselbe offene Bestellung
