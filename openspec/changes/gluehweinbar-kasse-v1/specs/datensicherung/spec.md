# Spec Delta

## Purpose

Verantwortliche können den vollständigen lokalen Kassenstand unabhängig vom zusammenfassenden CSV-Export sichern und bei Geräte- oder Browserwechsel kontrolliert wiederherstellen.

## ADDED Requirements

### Requirement: Vollständige Sicherung herunterladen

**MUST** – Nach Freigabe per Admin-PIN lässt sich der gesamte lokale Datenbestand offline als eine Sicherungsdatei herunterladen. Sie enthält alle aktiven und abgeschlossenen Veranstaltungen, Sortimentsstände, Einstellungen, Buchungen und Stornos, die für eine vollständige Wiederherstellung erforderlich sind.

#### Scenario: Gerätestand vor der Veranstaltung sichern

- **GIVEN** Auf dem Gerät sind mehrere Veranstaltungen und eine aktive Konfiguration gespeichert.
- **WHEN** Eine verantwortliche Person im Admin-Bereich eine vollständige Sicherung herunterlädt.
- **THEN** Eine Sicherungsdatei wird gespeichert, ohne den lokalen Datenbestand oder die aktive Veranstaltung zu verändern.

### Requirement: Sicherung und CSV unterscheiden

**MUST** – Der Admin-Bereich kennzeichnet vollständige Sicherung und veranstaltungsbezogenen CSV-Export als getrennte Funktionen und erklärt, dass nur die Sicherungsdatei wiederhergestellt werden kann.

#### Scenario: Exportmöglichkeiten auswählen

- **WHEN** Eine verantwortliche Person den Exportbereich öffnet.
- **THEN** Sie kann eindeutig zwischen „Vollständige Sicherung“ und „CSV-Abrechnung“ unterscheiden und erkennt den jeweiligen Umfang.

### Requirement: Sicherungsdatei vor Wiederherstellung prüfen

**MUST** – Vor einer Wiederherstellung prüft die PWA, ob die ausgewählte Datei eine unterstützte und vollständig lesbare Kassensicherung ist. Eine ungültige oder nicht unterstützte Datei verändert keine lokalen Daten.

#### Scenario: Beschädigte Datei auswählen

- **GIVEN** Auf dem Gerät befindet sich ein nutzbarer lokaler Kassenstand.
- **WHEN** Eine verantwortliche Person eine beschädigte oder nicht unterstützte Datei zur Wiederherstellung auswählt.
- **THEN** Die Wiederherstellung wird mit verständlichem Hinweis abgebrochen und der bisherige Kassenstand bleibt vollständig erhalten.

### Requirement: Ersetzende Wiederherstellung bestätigen

**MUST** – Die Wiederherstellung einer gültigen Sicherung ersetzt den gesamten lokalen Kassenstand und führt keine Veranstaltungen oder Vorgänge zusammen. Vor dem Ersetzen ist eine ausdrückliche Sicherheitsbestätigung erforderlich.

#### Scenario: Sicherung auf einem anderen Gerät wiederherstellen

- **GIVEN** Eine gültige Sicherung wurde auf ein anderes Gerät übertragen und dort ausgewählt.
- **WHEN** Die verantwortliche Person den Hinweis auf das vollständige Ersetzen bestätigt.
- **THEN** Das Gerät enthält anschließend genau die Veranstaltungen, Konfigurationen, Buchungen, Stornos und lokalen Einstellungen der Sicherung; sein vorheriger Kassenstand ist nicht mehr aktiv.

#### Scenario: Sicherheitsabfrage abbrechen

- **WHEN** Eine verantwortliche Person die Sicherheitsabfrage vor der Wiederherstellung abbricht.
- **THEN** Es werden keine Daten ersetzt, ergänzt oder entfernt.

### Requirement: Wiederhergestellten Stand direkt verwenden

**MUST** – Nach erfolgreicher Wiederherstellung ist der importierte Datenstand nach einem erforderlichen Neuladen offline verfügbar. Die in der Sicherung aktive Veranstaltung bleibt aktiv; abgeschlossene Veranstaltungen bleiben nur les- und exportierbar.

#### Scenario: Nach Wiederherstellung offline weiterarbeiten

- **GIVEN** Eine gültige Sicherung mit einer aktiven Veranstaltung wurde erfolgreich wiederhergestellt.
- **WHEN** Die PWA anschließend ohne Netzverbindung geöffnet wird.
- **THEN** Die aktive Veranstaltung kann weitergeführt werden und ihre bisherigen Vorgänge zählen genau einmal.
