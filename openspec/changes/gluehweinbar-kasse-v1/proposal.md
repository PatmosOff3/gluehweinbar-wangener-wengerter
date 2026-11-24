# Proposal

## Why

Die Wangener Wengerter benötigen für ihre Glühweinbar eine einfach bedienbare Bargeldkasse, die auf unterschiedlichen vorhandenen Geräten zuverlässig offline funktioniert. Jede lokale Installation soll mehrere Veranstaltungen getrennt verwalten, ohne einen Server oder eine gemeinsame Datenbank betreiben zu müssen.

## What Changes

- Die Kasse wird als responsive Progressive Web App (PWA) bereitgestellt. Sie lässt sich nach der ersten Online-Einrichtung auf Handys, Tablets, Laptops und PCs in modernen Browsern offline verwenden. Die erste Veröffentlichung erfolgt über GitHub Pages unter einer eigenen Subdomain, damit ein späterer Umzug zum vorhandenen Hosting unter derselben Adresse möglich bleibt.
- Jedes Gerät und jedes Browserprofil führt eine eigenständige lokale Kasse. Es gibt keine gemeinsame Datenbank, Synchronisierung oder Zusammenführung von Abrechnungen verschiedener Geräte.
- Die Helfer kassieren ausschließlich Bargeld. Nur sie sehen den Kassenbildschirm. Große, voneinander abgesetzte Tasten erleichtern die Bedienung auch mit Handschuhen.
- Die Kasse erfasst Getränke, Wein je Ausschankgröße und weitere Waren wie Honig. Roter und weißer Glühwein erscheinen als getrennte Produkte mit einem gemeinsamen Preis. Bei pfandpflichtigen Artikeln wird der im Admin-Bereich festgelegte Pfandbetrag automatisch je Stück hinzugerechnet.
- Hat ein Gast bereits eine Tasse oder ein Glas, neutralisiert die Bedienung das automatisch hinzugefügte Pfand mit „− Pfand“. Die Anzahl dieser Abzüge ist auf die automatisch erzeugten Pfandpositionen der Bestellung begrenzt. Echte Pfandrückgaben lassen sich weiterhin einzeln auszahlen oder mit Einkäufen verrechnen. Die Kasse zeigt an, ob die Bedienung Geld annimmt, Rückgeld gibt oder einen Betrag auszahlt.
- Helfer können den letzten abgeschlossenen Verkauf einschließlich aller zugehörigen Pfandpositionen stornieren.
- Verantwortliche pflegen Produkte im Admin-Bereich des jeweiligen Geräts. Sie können Bezeichnung, optionale Größe bzw. Verkaufseinheit, Preis und Pfandpflicht festlegen, den globalen Pfandbetrag ändern sowie Produkte bei Bedarf als „ausverkauft“ deaktivieren und später wieder aktivieren. Abgeschlossene Buchungen behalten die jeweils gebuchten Produkt- und Pfandwerte. Eine gemeinsame lokale Admin-PIN schützt die Produktpflege, Veranstaltungsverwaltung, Statistik, Sicherung und Exporte.
- Pro Gerät ist genau eine benannte Veranstaltung aktiv. Beim Start einer neuen Veranstaltung wird die bisherige abgeschlossen und nur noch lesbar. Sortiment, Preise, Verkaufseinheiten, Pfandpflichten und der globale Pfandbetrag werden als bearbeitbare Vorlage übernommen; Buchungen, Stornos und Statistiken beginnen leer. Veranstaltungsnamen lassen sich im Admin-Bereich korrigieren.
- Die Abrechnung umfasst jeweils eine Veranstaltung auf einem Gerät. Sie zeigt Stückzahlen und Umsatz je Produkt bzw. Weingröße sowie eingenommenes und ausgezahltes Pfand und lässt sich als CSV exportieren.
- Der gesamte lokale Datenbestand lässt sich als vollständige Sicherungsdatei herunterladen und nach einer Sicherheitsabfrage wiederherstellen. Die Wiederherstellung ersetzt den vorhandenen lokalen Stand; sie führt Daten nicht zusammen.

## Capabilities

### New Capabilities

- [Kassenbetrieb](specs/kassenbetrieb/spec.md) umfasst Offline-Betrieb, Touch-Bedienung, Barzahlung, Pfand und Storno.
- [Sortimentsverwaltung](specs/sortimentsverwaltung/spec.md) beschreibt den Admin-Zugang, das bekannte Sortiment sowie die Pflege von Artikeln, Preisen, Pfand und Verfügbarkeit.
- [Veranstaltungsabrechnung](specs/veranstaltungsabrechnung/spec.md) legt Kennzahlen, Rechenbeispiele und CSV-Export fest.
- [Veranstaltungsverwaltung](specs/veranstaltungsverwaltung/spec.md) regelt benannte Veranstaltungen, ihren Lebenszyklus und die Übernahme der Konfiguration.
- [Datensicherung](specs/datensicherung/spec.md) beschreibt die vollständige lokale Sicherung und die ersetzende Wiederherstellung.

### Modified Capabilities

## Impact

Betroffen sind die gesamte browserbasierte Bedienoberfläche, die lokale persistente Datenhaltung, der Offline-Cache, Dateiimporte und -exporte sowie die Veröffentlichung der statischen PWA. Die Daten eines Geräts müssen nach dem Schließen und erneuten Öffnen offline verfügbar bleiben. Private Browserfenster sind für den Kassenbetrieb nicht vorgesehen. Das Gerät soll dauerhaften lokalen Speicher anfordern und deutlich warnen, wenn dieser nicht verfügbar ist.

Die statischen Dateien werden zunächst ohne laufende Serveranwendung über GitHub Pages ausgeliefert. Eine eigene HTTPS-Subdomain bildet die dauerhafte Herkunft der PWA; ein späterer Hostingwechsel muss deshalb unter derselben Subdomain erfolgen, damit der lokale Browser-Datenbestand erreichbar bleibt.

Der Betreiber hat am 24. November 2026 den vorhandenen Funktionsumfang für die Kassenaufzeichnungen akzeptiert. Eine externe Prüfung ist kein Abnahmeschritt dieses Projekts. Sobald der Honigpreis feststeht, kann der Artikel im Admin-Bereich der aktiven Veranstaltung ergänzt werden.
