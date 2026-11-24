# Spec Delta

## Purpose

Die lokale Kasse verwaltet mehrere benannte Veranstaltungen nacheinander und hält deren Buchungen, Konfigurationen und Abrechnungen dauerhaft voneinander getrennt.

## ADDED Requirements

### Requirement: Veranstaltung benennen und umbenennen

**MUST** – Jede Veranstaltung besitzt einen nicht leeren Namen. Verantwortliche können den Namen einer aktiven oder abgeschlossenen Veranstaltung nach Freigabe per Admin-PIN ändern, ohne deren Vorgänge oder Abrechnung zu verändern.

#### Scenario: Veranstaltung vor dem Kassieren benennen

- **WHEN** Eine verantwortliche Person eine neue Veranstaltung anlegt.
- **THEN** Die Veranstaltung kann erst gestartet werden, nachdem ein nicht leerer Name eingegeben wurde.

#### Scenario: Namen einer abgeschlossenen Veranstaltung korrigieren

- **GIVEN** Eine Veranstaltung wurde abgeschlossen und enthält gebuchte Vorgänge.
- **WHEN** Eine verantwortliche Person deren Namen im Admin-Bereich ändert.
- **THEN** Der neue Name erscheint in Auswahl, Statistik und neuen Exporten; alle gebuchten Werte bleiben unverändert.

### Requirement: Genau eine aktive Veranstaltung führen

**MUST** – Pro Gerät und Browserprofil ist höchstens eine Veranstaltung aktiv. Beim Start einer neuen Veranstaltung wird eine vorhandene aktive Veranstaltung abgeschlossen. Nur die aktive Veranstaltung nimmt neue Verkäufe, Pfandrückgaben und Stornos an.

#### Scenario: Neue Veranstaltung nach einer laufenden starten

- **GIVEN** Auf dem Gerät ist bereits eine Veranstaltung aktiv.
- **WHEN** Eine verantwortliche Person nach Freigabe per Admin-PIN eine neue Veranstaltung startet.
- **THEN** Die bisherige Veranstaltung ist abgeschlossen, die neue Veranstaltung ist aktiv und es kann nur in der neuen kassiert werden.

### Requirement: Abgeschlossene Veranstaltungsdaten unveränderlich halten

**MUST** – Buchungen, Stornos, Produktstände und Pfandwerte einer abgeschlossenen Veranstaltung sind nur noch les- und exportierbar. Das nachträgliche Umbenennen der Veranstaltung bleibt erlaubt.

#### Scenario: Abgeschlossene Veranstaltung auswählen

- **WHEN** Eine verantwortliche Person eine abgeschlossene Veranstaltung im Admin-Bereich öffnet.
- **THEN** Sie kann deren Statistik ansehen, die CSV exportieren und den Namen korrigieren, aber keine Vorgänge oder Sortimentswerte dieser Veranstaltung ändern.

### Requirement: Konfiguration in neue Veranstaltung übernehmen

**MUST** – Eine neue Veranstaltung übernimmt Sortiment, Bezeichnungen, Größen bzw. Verkaufseinheiten, Preise, Pfandpflichten, Verfügbarkeiten und globalen Pfandbetrag der zuvor aktiven Veranstaltung als bearbeitbare Ausgangskonfiguration. Die lokale Admin-PIN bleibt geräteweit bestehen.

#### Scenario: Folgeveranstaltung vorbereiten

- **GIVEN** Die bisher aktive Veranstaltung besitzt ein gepflegtes Sortiment und einen globalen Pfandbetrag.
- **WHEN** Eine verantwortliche Person eine neue Veranstaltung startet.
- **THEN** Die neue Veranstaltung enthält eine unabhängige Kopie dieser Konfiguration. Spätere Änderungen wirken nicht auf die abgeschlossene Veranstaltung zurück.

### Requirement: Neue Veranstaltung ohne Vorgänge beginnen

**MUST** – Eine neu gestartete Veranstaltung enthält keine Verkäufe, Pfandrückgaben, Stornos oder Statistikwerte der vorherigen Veranstaltung.

#### Scenario: Erste Auswertung einer neuen Veranstaltung öffnen

- **WHEN** Direkt nach dem Start einer neuen Veranstaltung deren Statistik geöffnet wird.
- **THEN** Alle Stückzahlen, Warenumsätze sowie eingenommenen und ausgezahlten Pfandsummen stehen auf null.
