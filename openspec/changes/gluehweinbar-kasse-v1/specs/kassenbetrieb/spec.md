# Spec Delta

## Purpose

Helfer bedienen eine lokale Barkasse auf einem Handy, Tablet, Laptop oder PC. Sie können bei jeder Bestellung erkennen, wie viel Geld sie annehmen oder herausgeben müssen.

## ADDED Requirements

### Requirement: Responsive PWA auf üblichen Endgeräten

**MUST** – Kasse und Admin-Bereich lassen sich als responsive PWA auf Handys, Tablets, Laptops und PCs in aktuellen verbreiteten Browsern bedienen. Die Touch-Bedienung bleibt auf kleinen und großen Bildschirmen ohne horizontales Scrollen nutzbar.

#### Scenario: Kasse auf unterschiedlichen Geräten öffnen

- **WHEN** Die eingerichtete PWA auf einem unterstützten Smartphone, Tablet oder Computer geöffnet wird.
- **THEN** Produktwahl, offene Bestellung, Zahlungsaktionen und Admin-Zugang sind auf der jeweiligen Bildschirmgröße vollständig erreichbar.

### Requirement: Offline-Betrieb nach der Einrichtung

**MUST** – Nach dem ersten vollständigen Laden lassen sich Kasse und Admin-Bereich ohne Netzverbindung erneut öffnen und bedienen. Abgeschlossene Vorgänge bleiben lokal erhalten.

#### Scenario: Kasse nach einer Offline-Unterbrechung wieder öffnen

- **GIVEN** Die PWA wurde vollständig eingerichtet und das verwendete Gerät hat keine Netzverbindung.
- **WHEN** Ein Helfer schließt einen Verkauf ab, beendet den Browser vollständig und öffnet die installierte PWA erneut.
- **THEN** Er kann sofort weiter kassieren. Der abgeschlossene Verkauf zählt genau einmal in der weiterhin offline zugänglichen Admin-Auswertung.

### Requirement: Daten je Gerät und Browserprofil trennen

**MUST** – Jedes Gerät und Browserprofil speichert seine Kassendaten ausschließlich lokal und unabhängig. Die PWA synchronisiert, teilt oder vereinigt keine Buchungen und Abrechnungen zwischen Geräten oder Browserprofilen.

#### Scenario: Dieselbe PWA auf zwei Geräten verwenden

- **GIVEN** Die PWA wurde auf einem Tablet und einem Laptop unter derselben Webadresse eingerichtet.
- **WHEN** Auf dem Tablet ein Verkauf abgeschlossen wird.
- **THEN** Der Verkauf erscheint ausschließlich im Datenbestand und in der Abrechnung des Tablets und nicht auf dem Laptop.

### Requirement: Dauerhaften lokalen Speicher prüfen

**MUST** – Die PWA fordert nach Möglichkeit dauerhaften lokalen Speicher an und zeigt im Admin-Bereich eine deutliche Warnung, wenn dieser nicht gewährt oder nicht prüfbar ist. Der Kassenbetrieb in privaten Browserfenstern ist nicht vorgesehen.

#### Scenario: Dauerhafter Speicher ist nicht verfügbar

- **WHEN** der Browser die Anfrage nach dauerhaftem lokalen Speicher ablehnt oder dessen Status nicht ermitteln lässt.
- **THEN** Der Admin-Bereich warnt vor einem möglichen Datenverlust und empfiehlt eine vollständige Sicherung vor dem Kassenbetrieb.

### Requirement: Touch-Bedienung für Helfer

**MUST** – Die Bedienansicht stellt Produkte, „− Pfand / Gefäß vorhanden“, Pfandrückgabe und Zahlungsaktionen als große, klar beschriftete und mit Abstand angeordnete Touch-Tasten dar. Alle Beträge und Aktionen richten sich an die Bedienung. Ein Kundenbildschirm ist entbehrlich.

#### Scenario: Bestellung mit Handschuhen erfassen

- **GIVEN** Der globale Pfandbetrag ist auf 2,00 € eingestellt.
- **WHEN** Eine Bedienperson erfasst auf dem vorgesehenen Touch-Gerät mit ihren für Touch geeigneten Veranstaltungshandschuhen einen roten und einen weißen Glühwein, einmal „− Pfand“ und eine Pfandrückgabe.
- **THEN** Alle Tasten sind ohne Zoomen einzeln treffbar. Vor dem Abschluss sind die Produktmengen, zwei automatisch erzeugte Pfandpositionen, eine Neutralisierung, eine Pfandrückgabe und der Betrag von 7,00 € erkennbar.

### Requirement: Pfand automatisch berechnen und neutralisieren

**MUST** – Für jedes Stück eines als pfandpflichtig markierten Artikels rechnet die Kasse den aktuell eingestellten globalen Pfandbetrag automatisch hinzu. „− Pfand / Gefäß vorhanden“ neutralisiert je Betätigung genau eine automatisch erzeugte Pfandposition der offenen Bestellung und ist auf deren Anzahl begrenzt. Eine Neutralisierung erzeugt keine Auszahlung und zählt weder als eingenommenes noch als ausgezahltes Pfand.

#### Scenario: Erste Runde mit neuer Tasse

- **GIVEN** Der globale Pfandbetrag ist auf 2,00 € eingestellt und roter Glühwein kostet 3,50 € und ist pfandpflichtig.
- **WHEN** Ein Helfer tippt einmal auf „Glühwein rot“.
- **THEN** Der Gast zahlt 5,50 €. Davon entfallen 3,50 € auf das Getränk und 2,00 € auf automatisch eingenommenes Pfand.

#### Scenario: Glühwein nachfüllen

- **GIVEN** Der globale Pfandbetrag ist auf 2,00 € eingestellt und der Gast hat bereits eine Tasse.
- **WHEN** Der Helfer tippt einmal auf einen Glühwein zu 3,50 € und einmal auf „− Pfand“.
- **THEN** Die Kasse zeigt 3,50 € an. Das automatisch hinzugefügte Pfand ist neutralisiert; der Vorgang zählt weder eingenommenes noch ausgezahltes Pfand.

#### Scenario: Minus-Pfand ist auf die Bestellung begrenzt

- **GIVEN** Die offene Bestellung enthält einen pfandpflichtigen Artikel und damit eine automatisch erzeugte Pfandposition.
- **WHEN** Die Bedienung einmal auf „− Pfand“ tippt.
- **THEN** Genau diese Pfandposition ist neutralisiert. Eine weitere Betätigung kann den Zahlbetrag nicht weiter verringern und keine Auszahlung erzeugen.

### Requirement: Pfandrückgaben getrennt buchen

**MUST** – Eine getrennte Taste bucht die Rückgabe einer Tasse oder eines Weinglases zum aktuell eingestellten globalen Pfandbetrag. Rückgaben sind mit und ohne Warenkauf möglich und werden als ausgezahltes Pfand erfasst.

#### Scenario: Vier Gläser mitbringen und zwei Glühwein nachfüllen

- **GIVEN** Der globale Pfandbetrag ist auf 2,00 € eingestellt und der Glühweinpreis beträgt 3,50 €.
- **WHEN** Ein Gast bringt vier Gläser mit, lässt zwei davon mit Glühwein füllen und gibt die übrigen zwei zurück. Die Bedienung erfasst zwei Glühwein, zweimal „− Pfand“ und zwei Pfandrückgaben.
- **THEN** Die zwei automatisch erzeugten Pfandpositionen sind neutralisiert. Die Kasse zeigt „3,00 € kassieren“. Der abgeschlossene Vorgang zählt zwei verkaufte Glühwein, 7,00 € Warenumsatz, 0,00 € eingenommenes Pfand und 4,00 € ausgezahltes Pfand.

#### Scenario: Zwei Tassen zurückgeben und Schorle kaufen

- **GIVEN** Der globale Pfandbetrag ist auf 2,00 € eingestellt.
- **WHEN** Die Bedienung erfasst zwei Pfandrückgaben und eine Apfelsaftschorle zu 2,50 €.
- **THEN** Die Kasse zeigt „1,50 € auszahlen“. Der abgeschlossene Vorgang zählt als eine verkaufte Schorle und 4,00 € ausgezahltes Pfand.

#### Scenario: Nur Leergut zurückgeben

- **GIVEN** Der globale Pfandbetrag ist auf 2,00 € eingestellt.
- **WHEN** Ein Gast gibt drei Weingläser zurück und kauft nichts.
- **THEN** Die Kasse zeigt „6,00 € auszahlen“. Die Auszahlung lässt sich ohne Produkt und ohne Eingabe von erhaltenem Bargeld abschließen.

#### Scenario: Pfand und Warenwert gleichen sich aus

- **GIVEN** Der globale Pfandbetrag ist auf 2,00 € eingestellt und ein nicht pfandpflichtiger Artikel zu 2,00 € ist im Sortiment angelegt.
- **WHEN** Der Helfer bucht den Artikel zusammen mit einer Pfandrückgabe.
- **THEN** Der Vorgang lässt sich für 0,00 € abschließen. Der Artikelverkauf und die Pfandrückgabe zählen jeweils einmal.

### Requirement: Barzahlung und Rückgeld

**MUST** – Die Kasse unterstützt ausschließlich Barzahlung. Bei einem positiven Zahlbetrag bietet sie „Passend“, „5 €“, „10 €“, „20 €“ und „Anderer Betrag“ an. Sie zeigt das Rückgeld als Differenz zwischen gegebenem Bargeld und Zahlbetrag an.

#### Scenario: Wechselgeld für einen Schein

- **WHEN** Bei einem Zahlbetrag von 5,50 € tippt die Bedienung auf „10 €“.
- **THEN** Die Anzeige lautet „4,50 € Rückgeld“.

#### Scenario: Passend oder mit frei eingegebenem Betrag zahlen

- **WHEN** Bei 5,50 € wählt der Helfer „Passend“.
- **THEN** Das Rückgeld beträgt 0,00 €.
- **WHEN** Er wählt bei einem weiteren Verkauf über 5,50 € „Anderer Betrag“ und gibt 6,00 € ein.
- **THEN** Das Rückgeld beträgt 0,50 €.

#### Scenario: Gegebener Betrag reicht nicht

- **WHEN** Bei 5,50 € Zahlbetrag gibt der Helfer 5,00 € als erhaltenen Betrag an.
- **THEN** Der Verkauf bleibt offen. Der Helfer kann den erhaltenen Betrag korrigieren.

### Requirement: Letzten Verkauf stornieren

**MUST** – Helfer können den zuletzt abgeschlossenen Verkauf ohne Admin-PIN stornieren. Das Storno korrigiert Stückzahl, Warenumsatz und sämtliche zugehörigen Pfandbeträge genau einmal.

#### Scenario: Verkauf mit automatisch berechnetem Pfand korrigieren

- **GIVEN** Der letzte Verkauf bestand aus einem roten Glühwein zu 3,50 € und dem dafür automatisch berechneten Pfand zu 2,00 €.
- **WHEN** Ein Helfer storniert diesen Verkauf.
- **THEN** Die Auswertung zählt einen roten Glühwein weniger, 3,50 € weniger Warenumsatz und 2,00 € weniger eingenommenes Pfand. Frühere Verkäufe behalten ihre Werte.
- **AND** Ein erneutes Storno desselben Verkaufs kann keine weitere Korrektur auslösen.

#### Scenario: Nachfüllung mit neutralisiertem Pfand korrigieren

- **GIVEN** Der letzte Verkauf bestand aus einem Glühwein zu 3,50 €, einer automatisch erzeugten Pfandposition und deren Neutralisierung durch „− Pfand“.
- **WHEN** Ein Helfer storniert diesen Verkauf.
- **THEN** Die Auswertung zählt einen Glühwein und 3,50 € Warenumsatz weniger. Eingenommenes und ausgezahltes Pfand bleiben unverändert.

#### Scenario: Verkauf mit verrechneter Rückgabe korrigieren

- **WHEN** Die Bedienung storniert den zuletzt abgeschlossenen Vorgang aus einer Schorle und zwei Pfandrückgaben.
- **THEN** Die Auswertung zählt eine Schorle weniger, 2,50 € weniger Warenumsatz und 4,00 € weniger ausgezahltes Pfand.
