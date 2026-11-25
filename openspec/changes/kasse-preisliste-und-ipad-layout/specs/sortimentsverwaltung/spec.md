# Spec Delta

## Purpose

Die Verantwortlichen verwenden die finale Weihnachtsmarkt-Preisliste 2026 für neue Verkäufe und können Artikel auch ohne Verkaufseinheit pflegen, ohne frühere Buchungen zu verändern.

## ADDED Requirements

### Requirement: Finale Weihnachtsmarkt-Preisliste bereitstellen

Die Kasse MUST das finale Standardsortiment der Weihnachtsmarkt-Preisliste 2026 anbieten. Die Einrichtung MUST 5 € als änderbare Pfandvorgabe verwenden. Wein MUST weiterhin gemeinsam nach Größe gezählt werden. Beide Glühweine MUST getrennt mit gemeinsamem Preis und ohne Größenangabe geführt werden.

#### Scenario: Neues Gerät mit Standardwerten einrichten

- **WHEN** Die Bedienung ein neues Gerät mit dem Standardsortiment einrichtet und die Pfandvorgabe unverändert übernimmt.
- **THEN** Es gelten 5 € Pfand und die folgenden Artikel; „ohne“ bedeutet eine leere Verkaufseinheit.

| Produkt | Verkaufseinheit | Preis | Pfandpflichtig |
| --- | --- | ---: | --- |
| Glühwein rot | ohne | 4,00 € | Ja |
| Glühwein weiß | ohne | 4,00 € | Ja |
| Bier | 0,33 l | 3,00 € | Nein |
| Wein | 0,1 l | 3,00 € | Ja |
| Wein | 0,2 l | 6,00 € | Ja |
| Wein | Flasche, 0,75 l | 18,00 € | Nein |
| Schnaps | 2 cl | 2,00 € | Nein |
| Sprudel Classic | 0,5 l | 2,00 € | Nein |
| Tresterbrand klar | 0,5 l | 18,00 € | Nein |
| Tresterbrand Barrique | 0,5 l | 18,00 € | Nein |
| Honig | 500 g | 8,00 € | Nein |

- **AND** Apfelschorle wird nicht angeboten.

#### Scenario: Glühwein mit und ohne vorhandene Tasse verkaufen

- **WHEN** Die Bedienung einen Glühwein zum Standardpreis erfasst.
- **THEN** Der Zahlbetrag ist 9 € einschließlich 5 € Pfand.
- **WHEN** Sie anschließend einmal „− Pfand“ für eine vorhandene Tasse erfasst.
- **THEN** Der Zahlbetrag ist 4 €.

### Requirement: Verkaufseinheiten optional halten

Die Kasse MUST Artikel mit leerer Verkaufseinheit anlegen, bearbeiten, verkaufen, sichern und wiederherstellen können. Leere Einheiten MUST in der Oberfläche ohne Platzhalter, zusätzliche Trennzeichen oder leere Größenzeile erscheinen. CSV-Ausgaben MUST eine leere Einheit im dafür vorgesehenen Feld erhalten.

#### Scenario: Artikel ohne Größe pflegen und sichern

- **WHEN** Eine verantwortliche Person einen Artikel ohne Verkaufseinheit speichert, verkauft und anschließend sichert und wiederherstellt.
- **THEN** Artikel und Buchung behalten ihre leere Einheit; Preis und Mengen bleiben unverändert.
- **AND** Produkttaste, Bestellposition und Zahlungszusammenfassung zeigen keine Größenangabe an.

### Requirement: Finale Preisliste einmalig in die aktive Veranstaltung übernehmen

Die Kasse MUST die finale Preisliste samt 5 € Pfand einmalig in eine bestehende aktive Veranstaltung übernehmen, bevor neue Bestellungen möglich sind. Sie MUST bekannte Artikel aktualisieren, neue ergänzen und Apfelschorle deaktivieren. Andere selbst angelegte Artikel und bestehende Verfügbarkeiten der übrigen Artikel MUST erhalten bleiben. Wiederholtes Öffnen MUST keine Duplikate erzeugen oder spätere Admin-Änderungen überschreiben.

#### Scenario: Vorläufiges Sortiment aktualisieren

- **WHEN** Ein bereits eingerichtetes Gerät mit vorläufigem Sortiment erstmals die neue Version öffnet.
- **THEN** Seine aktive Veranstaltung verwendet die finale Preisliste und 5 € Pfand; die Glühweine haben keine Einheit mehr, Tresterbrand und Honig sind verfügbar und Apfelschorle ist deaktiviert.
- **AND** Vorhandene bekannte Artikel behalten ihre Identität und beide Glühweine ihren gemeinsam gepflegten Preis.

#### Scenario: Aktualisierung erneut starten

- **GIVEN** Die Umstellung ist abgeschlossen und eine verantwortliche Person hat anschließend einen Preis oder den Pfandbetrag angepasst.
- **WHEN** Das Gerät die Kasse erneut öffnet.
- **THEN** Die manuelle Änderung bleibt erhalten und neue Artikel werden nicht nochmals angelegt.

#### Scenario: Frühere Buchungen und abgeschlossene Veranstaltungen schützen

- **GIVEN** Ein Glühwein wurde vor der Umstellung für 3,50 € mit 2 € Pfand gebucht und eine frühere Veranstaltung ist abgeschlossen.
- **WHEN** Die aktive Veranstaltung auf die finale Preisliste umgestellt wird.
- **THEN** Die alte Buchung behält 3,50 € Warenwert, ihre damalige Einheit und 2 € Pfand; Sortiment und Pfand der abgeschlossenen Veranstaltung bleiben unverändert.
- **AND** Statistik, CSV und Storno verwenden weiterhin die gespeicherten Buchungswerte.

#### Scenario: Alte Sicherung wiederherstellen

- **WHEN** Eine unterstützte Sicherung ohne bereits erfolgte finale Preisumstellung wiederhergestellt wird.
- **THEN** Vor dem nächsten Verkauf wird nur deren aktive Veranstaltung einmalig umgestellt; historische Buchungen bleiben unverändert.
- **AND** Eine Sicherung nach erfolgter Umstellung bewahrt den Umstellungsstatus und danach gespeicherte Admin-Anpassungen.
