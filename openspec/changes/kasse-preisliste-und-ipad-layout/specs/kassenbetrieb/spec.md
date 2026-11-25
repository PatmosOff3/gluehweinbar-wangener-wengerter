# Spec Delta

## Purpose

Die Bedienung erfasst Bestellungen auf dem iPad im Querformat ohne Seitenscrollen und erkennt häufige Getränke sowie auszuzahlende Beträge unmittelbar.

## ADDED Requirements

### Requirement: Häufige Getränke als hervorgehobene erste Reihe

Die Kasse MUST im Tablet-Querformat Glühwein rot, Glühwein weiß und Bier in dieser Reihenfolge als größere Tasten in der ersten Produktreihe darstellen. Rot und Weiß MUST zusätzlich zur Beschriftung weinrot beziehungsweise goldgelb unterscheidbar sein. Beide Farbmodi MUST lesbare Beschriftungen und mindestens 48 Pixel hohe Touch-Tasten bieten.

#### Scenario: Finale Standardprodukte im Querformat anzeigen

- **WHEN** Die Bedienung die Kasse mit dem finalen Standardsortiment im Tablet-Querformat öffnet.
- **THEN** Glühwein rot, Glühwein weiß und Bier stehen gemeinsam vor allen anderen Produkten in der ersten Reihe und haben jeweils eine größere Tastenfläche als ein gewöhnlicher Artikel.
- **AND** Beide Glühweinsorten sind in Hell- und Dunkelmodus durch Hintergrundfarbe und Text unterscheidbar.

#### Scenario: Hervorgehobenen Artikel deaktivieren

- **WHEN** Ein hervorgehobener Artikel im Admin-Bereich deaktiviert wird.
- **THEN** Die Produktauswahl zeigt ihn nicht mehr an und die übrigen hervorgehobenen Artikel bleiben vor den gewöhnlichen Artikeln bedienbar.

### Requirement: Darstellungsmodus ohne Admin-Zugang umschalten

Die Kasse MUST einen direkt in der Kopfleiste erreichbaren Hell-/Dunkel-Schalter ohne PIN anbieten. Die Auswahl MUST im jeweiligen Browserprofil über einen Neustart erhalten bleiben und für Kasse, Zahlung, Einrichtung und Admin-Bereich gelten. Ein Wechsel MUST eine offene Bestellung und deren Zahlungsstand erhalten.

#### Scenario: Während einer Bestellung in den Dunkelmodus wechseln

- **WHEN** Die Bedienung bei einer offenen Bestellung den Darstellungsmodus umschaltet.
- **THEN** Die Oberfläche wechselt den Modus ohne Admin-Zugang; Artikelmengen, Pfand und Zahlbetrag bleiben erhalten.
- **AND** Nach erneutem Öffnen wird der gewählte Modus verwendet.

### Requirement: Geldabflüsse rot kennzeichnen

Die Kasse MUST negative Bestellsummen in Bestellübersicht, Summenleiste und Barzahlung rot mit dem Wort „auszahlen“ darstellen. Positive Rückgeldbeträge und negative Pfandabzüge MUST ebenfalls rot erscheinen. Die Erkennbarkeit MUST in beiden Farbmodi erhalten bleiben und zusätzlich durch Text beziehungsweise Vorzeichen vermittelt werden.

#### Scenario: Reine Pfandrückgabe abrechnen

- **WHEN** Die Bedienung eine Pfandrückgabe bei 5 € Pfand ohne Warenkauf erfasst und zur Zahlung wechselt.
- **THEN** Bestellung, Summenleiste und Zahlungsseite zeigen „5,00 € auszahlen“ rot an.
- **AND** Die Barzahlungsseite enthält den Satz „Kein erhaltenes Bargeld erforderlich“ nicht; der Vorgang ist ohne Bargeldeingabe abschließbar.

#### Scenario: Rückgeld ausgeben

- **WHEN** Die Bedienung für einen Zahlbetrag von 9 € einen erhaltenen Betrag von 10 € auswählt.
- **THEN** Die Zahlungsseite zeigt „1,00 € Rückgeld“ rot und deutlich lesbar an.

#### Scenario: Ausgeglichenen Vorgang abschließen

- **WHEN** Warenwert und Pfandrückgaben einen Gesamtbetrag von 0 € ergeben.
- **THEN** Der Vorgang bleibt ohne Eingabe erhaltenen Bargelds abschließbar und wird nicht als negative Auszahlung gekennzeichnet.

### Requirement: iPad-Querformat ohne Seitenscrollen

Die Kassenansicht MUST bei normaler Schriftgröße und finalem Standardsortiment im iPad-Querformat in den verfügbaren Browser-Viewport passen. Nur die Positionsliste der offenen Bestellung MUST bei Überlauf scrollen. Kopfleiste, sämtliche Standardprodukttasten, Minus-Pfand, Bestellsumme, Pfandübersicht, Bestellaktionen und Zahlungsleiste MUST sichtbar und ohne Überdeckung bedienbar bleiben.

#### Scenario: Safari mit eingeblendeten Browserleisten

- **WHEN** Die Kasse bei 1105 × 688 CSS-Pixeln verfügbarem Inhalt entsprechend dem Screenshot oder bei auf 1105 × 604 CSS-Pixeln verringerter verfügbarer Höhe geöffnet wird.
- **THEN** Das Dokument hat weder vertikalen noch horizontalen Überlauf; alle Standardprodukte, Minus-Pfand und die Schaltfläche „Zur Zahlung“ liegen vollständig im Viewport.
- **AND** Marke, Veranstaltung, Theme-Schalter und Admin-Zugang teilen sich eine kompakte Kopfleiste.

#### Scenario: Viele verschiedene Artikel bestellen

- **WHEN** Die Bedienung so viele unterschiedliche Artikel erfasst, dass deren Positionen nicht gemeinsam in die Bestellübersicht passen.
- **THEN** Ausschließlich deren Positionsliste scrollt; Summe, Pfandübersicht, Bestellaktionen und Zahlungsleiste bleiben sichtbar.
- **AND** Mengenänderungen und Entfernen bleiben auch für die letzte Position erreichbar.

#### Scenario: Verfügbare Höhe ändert sich

- **WHEN** Safari seine Browserleisten ein- oder ausblendet oder die PWA im Querformat ohne Browserleisten läuft.
- **THEN** Die Kassenansicht passt sich der verfügbaren Höhe an und die Zahlungsleiste verdeckt keine anderen Bedienelemente.

#### Scenario: Schmalen Bildschirm verwenden

- **WHEN** Die Kasse auf einem Smartphone mit 320 CSS-Pixeln Breite geöffnet wird.
- **THEN** Sämtliche Aktionen sind ohne horizontalen Überlauf erreichbar; die Oberfläche darf auf diesem schmalen Bildschirm vertikal scrollen.
