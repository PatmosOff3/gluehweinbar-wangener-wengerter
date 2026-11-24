# Spec Delta

## Purpose

Die Verantwortlichen bereiten Sortiment und Pfand im Admin-Bereich des jeweiligen Geräts vor und ändern bei Bedarf Preise oder Verfügbarkeiten. Helfer können danach mit den aktuellen Produkttasten kassieren.

## ADDED Requirements

### Requirement: Gemeinsame Admin-PIN

**MUST** – Eine gemeinsame lokale Admin-PIN schützt die Produkt-, Preis-, Pfand- und Verfügbarkeitspflege, die Veranstaltungsverwaltung, die Statistik, Sicherung und Exporte auch offline. Helfer können ohne persönliche Anmeldung kassieren und den letzten Verkauf stornieren.

#### Scenario: Geschützte Funktionen öffnen und wieder verlassen

- **GIVEN** Das Gerät zeigt die Kassenansicht.
- **WHEN** Jemand Produktpflege, Veranstaltungsverwaltung, Statistik, Sicherung oder Export aufrufen möchte und die PIN fehlt oder falsch ist.
- **THEN** Die geschützten Daten und Aktionen bleiben gesperrt.
- **WHEN** Eine verantwortliche Person die richtige PIN eingibt.
- **THEN** Sie kann Produkte, Preise, Pfand und Verfügbarkeiten pflegen, Veranstaltungen verwalten, Statistiken ansehen sowie Sicherungen und Exporte speichern.
- **WHEN** Sie den Admin-Bereich sperrt und das Gerät an einen Helfer übergibt.
- **THEN** Der Helfer kann weiter kassieren. Erneuter Admin-Zugriff erfordert wieder die PIN.

### Requirement: Produkte und Preise im Admin-Bereich pflegen

**MUST** – Verantwortliche können Getränke und andere Waren mit Bezeichnung, optionaler Größe bzw. Verkaufseinheit, Verkaufspreis und Pfandpflicht anlegen sowie diese Angaben für bestehende Artikel ändern. Das gilt auch offline. Abgeschlossene Verkäufe behalten Bezeichnung, Größe bzw. Verkaufseinheit, Preis, Pfandpflicht und Pfandbetrag zum Zeitpunkt ihrer Buchung.

#### Scenario: Honig nach Festlegung des Preises ergänzen

- **WHEN** Eine verantwortliche Person legt „Honig im Glas“ mit dem von ihr festgelegten Preis und ohne Pfandpflicht an.
- **THEN** Die Bedienung kann den Honig über eine Produkttaste zu diesem Preis verkaufen. Das Hinzufügen des Artikels erzeugt keine Pfandposition.

#### Scenario: Preis während des Verkaufs ändern

- **GIVEN** Ein Bier wurde für 3,00 € verkauft.
- **WHEN** Die verantwortliche Person ändert den Bierpreis für weitere Verkäufe auf beispielhaft 3,50 € und ein weiteres Bier wird verkauft.
- **THEN** Die Kasse berechnet für das zweite Bier 3,50 €. Die Statistik weist für beide Biere zusammen 6,50 € Umsatz aus.

### Requirement: Sortimentskonfiguration der aktiven Veranstaltung zuordnen

**MUST** – Produktdaten, Verfügbarkeiten und der globale Pfandbetrag gehören zur aktiven Veranstaltung. Änderungen wirken auf deren neue Vorgänge und verändern weder abgeschlossene Vorgänge noch die Konfiguration abgeschlossener Veranstaltungen.

#### Scenario: Sortiment nach Veranstaltungsbeginn ändern

- **GIVEN** Eine frühere Veranstaltung ist abgeschlossen und eine neue Veranstaltung ist aktiv.
- **WHEN** Eine verantwortliche Person in der aktiven Veranstaltung ein Produkt deaktiviert oder dessen Preis ändert.
- **THEN** Die Änderung gilt nur für neue Vorgänge der aktiven Veranstaltung. Sortiment und Auswertungen der abgeschlossenen Veranstaltung bleiben unverändert.

### Requirement: Produkte deaktivieren und wieder aktivieren

**MUST** – Verantwortliche können Artikel im Admin-Bereich deaktivieren und wieder aktivieren. Deaktivierte Artikel erscheinen nicht in der Kassenansicht, bleiben aber mit ihren gebuchten Angaben in früheren Verkäufen und Auswertungen erhalten.

#### Scenario: Ausverkauften Artikel vorübergehend ausblenden

- **GIVEN** Sprudel wurde bereits verkauft und ist anschließend ausverkauft.
- **WHEN** Eine verantwortliche Person den Artikel nach Eingabe der Admin-PIN deaktiviert.
- **THEN** Die Sprudel-Taste verschwindet aus der Kassenansicht. Frühere Sprudelverkäufe bleiben unverändert in der Statistik enthalten.
- **WHEN** Nachschub eintrifft und die verantwortliche Person den Artikel wieder aktiviert.
- **THEN** Die Sprudel-Taste ist wieder zum aktuellen Preis in der Kassenansicht verfügbar.

### Requirement: Globalen Pfandbetrag pflegen

**MUST** – Im Admin-Bereich lässt sich ein globaler Pfandbetrag festlegen. Derselbe Betrag gilt für Glühweintassen und Weingläser sowie für alle als pfandpflichtig markierten Artikel. Eine Änderung wirkt auf neue Verkäufe und Pfandrückgaben; abgeschlossene Vorgänge behalten den bei ihrer Buchung verwendeten Betrag.

#### Scenario: Gemeinsamen Pfandbetrag festlegen

- **WHEN** Eine verantwortliche Person den globalen Pfandbetrag auf 2,00 € setzt und den Admin-Bereich sperrt.
- **THEN** Jeder anschließend erfasste pfandpflichtige Artikel erzeugt automatisch 2,00 € Pfand. Eine anschließend erfasste Pfandrückgabe wird ebenfalls mit 2,00 € berechnet.

### Requirement: Roten und weißen Glühwein getrennt mit gemeinsamem Preis führen

**MUST** – Roter und weißer Glühwein erscheinen als getrennte Produkttasten und werden in Bestellung, Statistik und CSV getrennt ausgewiesen. Beide Sorten verwenden dieselbe Verkaufseinheit und einen gemeinsam gepflegten Glühweinpreis. Eine Preisänderung gilt für beide Sorten bei neuen Verkäufen.

#### Scenario: Gemeinsamen Glühweinpreis ändern

- **WHEN** Eine verantwortliche Person den gemeinsamen Glühweinpreis ändert.
- **THEN** Die Kassenansicht zeigt getrennte Tasten für „Glühwein rot“ und „Glühwein weiß“ mit demselben neuen Preis. Frühere Verkäufe beider Sorten behalten ihren jeweils gebuchten Preis.

### Requirement: Verkaufseinheiten der vorläufigen Preisliste

**MUST** – Das bekannte Sortiment lässt sich zu den unten aufgeführten Stückpreisen und mit der angegebenen anfänglichen Pfandpflicht verkaufen. Wein wird über die Größe ausgewählt. Dieselbe Größe wird für Trollinger, Weißherbst und Rosecco gemeinsam gezählt.

#### Scenario: Verkaufspreise vor dem Öffnen der Bar prüfen

- **GIVEN** Für die Veranstaltung gilt die vorläufige Preisliste vom Foto.
- **WHEN** Die Bedienung die folgenden Artikel jeweils einzeln erfasst.
- **THEN** Es gelten diese Produktpreise und Einstellungen. Pfandpflichtige Artikel erzeugen zusätzlich den globalen Pfandbetrag.

| Produkt | Verkaufseinheit | Produktpreis | Pfandpflichtig |
| --- | --- | ---: | --- |
| Glühwein rot | 0,2 l | 3,50 € | Ja |
| Glühwein weiß | 0,2 l | 3,50 € | Ja |
| Wein | 0,1 l | 2,50 € | Ja |
| Wein | 0,2 l | 5,00 € | Ja |
| Wein | Flasche, 0,75 l | 15,00 € | Nein |
| Bier | 0,33 l | 3,00 € | Nein |
| Schnaps | 2 cl | 2,50 € | Nein |
| Sprudel Classic | 0,5 l | 2,50 € | Nein |
| Apfelsaftschorle | 0,5 l | 2,50 € | Nein |

#### Scenario: Verschiedene Weine derselben Größe verkaufen

- **WHEN** Ein Gast bestellt 0,2 l Trollinger und ein anderer 0,2 l Weißherbst.
- **THEN** Die Bedienung erfasst zweimal „Wein 0,2 l“ ohne Sortenauswahl. Die Statistik zählt für diese Größe zwei Stück und 10,00 € Umsatz.

#### Scenario: Eine ganze Flasche Wein verkaufen

- **WHEN** Ein Helfer wählt einmal „Wein 0,75 l“.
- **THEN** Der Produktpreis beträgt 15,00 €. Die Flasche zählt als ein Stück in der Größe 0,75 l.
