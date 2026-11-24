# Spec Delta

## Purpose

Verantwortliche können die Verkäufe und Pfandsummen jeder auf dem Gerät gespeicherten Veranstaltung prüfen und als getrennte Tabelle mitnehmen.

## ADDED Requirements

### Requirement: Veranstaltungsweite Zusammenfassung

**MUST** – Die Statistik umfasst alle abgeschlossenen Vorgänge der ausgewählten Veranstaltung auf dem aktuellen Gerät unter Berücksichtigung der Stornos. Sie zeigt die verkaufte Stückzahl und den Warenumsatz je gebuchtem Produkt bzw. Weingröße; roter und weißer Glühwein werden getrennt ausgewiesen. Erhaltene Scheine und herausgegebenes Wechselgeld verändern den Warenumsatz nicht.

#### Scenario: Erste Runde, Nachfüllung und Rückgabe abrechnen

- **GIVEN** Die Veranstaltung beginnt ohne Buchungen.
- **WHEN** Ein roter Glühwein mit neuer Tasse für 5,50 € wird mit 10,00 € bezahlt. Ein weißer Glühwein wird mit vorhandenem Gefäß und „− Pfand“ für 3,50 € nachgefüllt. Anschließend wird eine Schorle für 2,50 € zusammen mit zwei Pfandrückgaben gebucht.
- **THEN** Die Statistik zeigt folgende Werte für die Veranstaltung.

| Position | Stückzahl | Betrag |
| --- | ---: | ---: |
| Glühwein rot | 1 | 3,50 € |
| Glühwein weiß | 1 | 3,50 € |
| Apfelsaftschorle | 1 | 2,50 € |
| Eingenommenes Pfand | | 2,00 € |
| Ausgezahltes Pfand | | 4,00 € |

#### Scenario: Storno vor der Auswertung

- **GIVEN** Die drei Vorgänge aus dem vorigen Beispiel sind abgeschlossen.
- **WHEN** Die Bedienung storniert den letzten Vorgang mit Schorle und zwei Pfandrückgaben.
- **THEN** Es bleiben ein roter und ein weißer Glühwein mit jeweils 3,50 € Umsatz, 2,00 € eingenommenes Pfand und 0,00 € ausgezahltes Pfand. Die stornierte Schorle trägt keine Stückzahl und keinen Umsatz mehr bei.

### Requirement: Veranstaltungen getrennt auswerten

**MUST** – Aktive und abgeschlossene Veranstaltungen werden getrennt ausgewertet. Eine Auswertung enthält weder Vorgänge anderer lokaler Veranstaltungen noch Daten anderer Geräte oder Browserprofile. Abgeschlossene Veranstaltungen bleiben im Admin-Bereich auswählbar.

#### Scenario: Frühere Veranstaltung erneut ansehen

- **GIVEN** Auf einem Gerät sind eine abgeschlossene und eine aktive Veranstaltung mit jeweils eigenen Verkäufen gespeichert.
- **WHEN** Eine verantwortliche Person im Admin-Bereich die abgeschlossene Veranstaltung auswählt.
- **THEN** Die Statistik zeigt nur deren Namen, Produktumsätze, Stornos und Pfandsummen und lässt keine neuen Buchungen für sie zu.

#### Scenario: Zwei Geräte getrennt abrechnen

- **GIVEN** Auf einem Tablet und einem Laptop wurden unabhängig Verkäufe erfasst.
- **WHEN** Auf beiden Geräten die gleich benannte Veranstaltung ausgewertet wird.
- **THEN** Jedes Gerät zeigt ausschließlich seinen eigenen lokalen Datenbestand; es findet keine automatische Zusammenführung statt.

### Requirement: Eingenommenes und ausgezahltes Pfand getrennt ausweisen

**MUST** – Die Statistik führt eingenommenes und ausgezahltes Pfand in zwei eigenen Summen. Durch „− Pfand“ neutralisierte Pfandpositionen tragen zu keiner der beiden Summen bei.

#### Scenario: Automatisches, neutralisiertes und zurückgegebenes Pfand zusammenfassen

- **GIVEN** Der globale Pfandbetrag beträgt 2,00 €.
- **WHEN** Ein roter Glühwein mit neuem Gefäß, ein weißer Glühwein mit „− Pfand“ und zwei Pfandrückgaben abgeschlossen wurden.
- **THEN** Die Statistik zeigt 2,00 € eingenommenes und 4,00 € ausgezahltes Pfand. Das neutralisierte Pfand verändert keine der beiden Summen.

### Requirement: Historische Buchungswerte bewahren

**MUST** – Spätere Änderungen oder die Deaktivierung eines Produkts verändern bereits gebuchte Bezeichnungen, Größen bzw. Verkaufseinheiten, Preise und Pfandbeträge weder in der Statistik noch im CSV-Export.

#### Scenario: Verkauften Artikel später ändern und deaktivieren

- **GIVEN** Ein Sprudel wurde mit Bezeichnung „Sprudel Classic“, Verkaufseinheit 0,5 l und einem Preis von 2,50 € verkauft.
- **WHEN** Eine verantwortliche Person den Artikel später umbenennt, seinen Preis ändert und ihn deaktiviert.
- **THEN** Statistik und CSV führen den abgeschlossenen Verkauf weiterhin als „Sprudel Classic“, 0,5 l und 2,50 €.

### Requirement: Zusammenfassung als CSV herunterladen

**MUST** – Nach Freigabe per Admin-PIN lässt sich die Zusammenfassung der ausgewählten Veranstaltung offline als CSV-Datei speichern. Veranstaltungsname, gebuchte Produktbezeichnung und optionale Größe bzw. Verkaufseinheit, Stückzahl, Warenumsatz und die zwei Pfandsummen sind eindeutig beschriftet. Roter und weißer Glühwein erhalten getrennte Zeilen. Der Export enthält aggregierte Werte genau dieser Veranstaltung ohne Einzelvorgänge.

#### Scenario: Abrechnung am Stand speichern

- **GIVEN** Die drei Beispielvorgänge wurden erfasst, das Gerät ist offline und der Admin-Bereich ist freigegeben.
- **WHEN** Die verantwortliche Person lädt die CSV herunter und öffnet die gespeicherte Datei in einer Tabellenkalkulation.
- **THEN** Die Datei nennt die ausgewählte Veranstaltung. Die Produktzeilen enthalten einen roten und einen weißen Glühwein zu jeweils 3,50 € sowie eine Apfelsaftschorle zu 2,50 €. Die beiden Pfandsummen betragen 2,00 € und 4,00 €. Bezeichnungen wie „Glühwein rot“ und „Glühwein weiß“ sind lesbar.

#### Scenario: Erneuter Export nach Storno

- **WHEN** Nach dem Storno des letzten Beispielvorgangs wird eine neue CSV heruntergeladen.
- **THEN** Die Datei enthält die korrigierten Veranstaltungssummen aus der Statistik. Der Download selbst verändert keine Werte.
