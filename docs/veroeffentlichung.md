# Veröffentlichung auf GitHub Pages

## Repository und Veröffentlichung

Die Kasse liegt im Repository [PatmosOff3/gluehweinbar-wangener-wengerter](https://github.com/PatmosOff3/gluehweinbar-wangener-wengerter). Unter [Settings → Pages](https://github.com/PatmosOff3/gluehweinbar-wangener-wengerter/settings/pages) wird **GitHub Actions** als Quelle gewählt. Jeder Push auf `main` startet den Workflow. Nach erfolgreichen Prüfungen baut er die PWA für den konfigurierten Pages-Pfad und veröffentlicht `dist/`. Der Fortschritt ist unter [Actions](https://github.com/PatmosOff3/gluehweinbar-wangener-wengerter/actions/workflows/pages.yml) sichtbar.

Die GitHub-Projektadresse für den Probelauf ist [patmosoff3.github.io/gluehweinbar-wangener-wengerter](https://patmosoff3.github.io/gluehweinbar-wangener-wengerter/). Kasse, Manifest, Icons und Offline-Cache verwenden diesen Unterpfad.

Der [erste erfolgreiche Prüf- und Veröffentlichungslauf](https://github.com/PatmosOff3/gluehweinbar-wangener-wengerter/actions/runs/45470880685) lief am 24. November 2026. Ein frisches Chromium-Profil konnte die veröffentlichte Kasse per HTTPS laden und nach „Offline bereit“ ohne Netz erneut öffnen.

## Dauerhafte Adresse verbinden

1. Mit der Person, die eure Domain verwaltet, eine freie Subdomain vereinbaren, etwa `kasse.eure-domain.de`. Dies ist ein Beispiel. Den Besitz der Domain nach Möglichkeit zuerst in den GitHub-Kontoeinstellungen verifizieren.
2. Im Repository unter **Settings → Pages → Custom domain** die vereinbarte Subdomain eintragen und speichern.
3. In der DNS-Verwaltung eurer Domain einen **CNAME** anlegen. Bei der Beispieladresse lautet der Name `kasse`, das Ziel ist `patmosoff3.github.io`. Der Repositoryname gehört nicht zum DNS-Ziel. Bei Veröffentlichung über Actions erfolgt die Domainzuordnung in den Pages-Einstellungen. [GitHub-Anleitung für eigene Domains](https://docs.github.com/de/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site?platform=windows)
4. Nach erfolgreicher DNS-Prüfung und Zertifikatsausstellung **Enforce HTTPS** aktivieren. Die endgültige HTTPS-Adresse direkt aufrufen und kontrollieren, dass die App lädt, „Offline bereit“ meldet und nach Trennen des Netzes weiter startet. [HTTPS auf GitHub Pages](https://docs.github.com/de/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)

Nach einem Domainwechsel den Workflow auf `main` erneut starten. Für die eigene Subdomain verwendet der Build dann `/`. Vor dem Wechsel jede Gerätekasse sichern. Auf der neuen Adresse die Sicherung bei der Ersteinrichtung wiederherstellen und die aktive Veranstaltung kontrollieren.
