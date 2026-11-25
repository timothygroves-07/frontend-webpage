# Villa Calce · Val d'Orcia, Toscana

Frontend-Projekt aus Modul 293: eine statische Website zur Vermietung einer (fiktiven) High-End-Villa in der Toskana, ohne Backend. Design: Brutalism, schlicht, mit Animationen und Scrolleffekten.

**Live:** https://timothygroves-07.github.io/frontend-webpage/

## Dateien

- `index.html`: Struktur und Inhalt
- `styles.css`: Gestaltung (Bootstrap-Variablen überschrieben, eigene Klassen auf Deutsch)
- `app.js`: Interaktivität, API-Features (jQuery) und Animationen (GSAP)
- `img/villa/`: Fotos von Unsplash
- `docs/wireframe.drawio`: Wireframe (draw.io, noch aus der ersten Version)

## Technik

- Bootstrap 5.3 und jQuery 3.7 via CDN
- GSAP 3.12 mit ScrollTrigger (Scroll-Animationen, horizontale Galerie, Parallax)
- Leaflet 1.9 mit OpenStreetMap-Kacheln
- HighCharts 11
- Schriften: Syne, Inter Tight, JetBrains Mono (Google Fonts)

## Features

| Feature | API |
|---|---|
| a) Zufälliges Katzenbild | The Cat API |
| b) Bitcoin-Kurs in USD und CHF | CoinGecko |
| c) Wetter Zürich (Tmax, Tmin, Niederschlag) | Open-Meteo |
| c+) Verlauf 5 Tage: Zürich gegen Villa | Open-Meteo, HighCharts |
| d) 5 nächste Ladestationen ab Winterthur, Suche nach PLZ | BFE / opendata.swiss |
| e) Karte der Villa, Abfahrtsort suchen mit Luftlinie, Klick auf Ladestation | Leaflet, geo.admin.ch |
| Buchungsformular mit Validierung, Saisonpreisen und POST an Webhook | webhook.site |

> Achtung: Die Webhook-URL steht öffentlich im Code. Wer sie kennt, kann die eingegangenen Anfragen auf webhook.site ansehen. Darum nur Testdaten eingeben. Free-URLs laufen nach 7 Tagen ab.

## Animationen

- Hero: Titel steigt Buchstabe für Buchstabe auf, Bild mit Parallax
- Manifest: Wörter werden beim Scrollen nacheinander sichtbar
- Bilder werden von unten aufgedeckt, Zahlen zählen hoch
- Galerie: auf Desktop festgehalten und seitwärts gescrollt, auf dem Handy zum Wischen
- Räume: Vorschaubild folgt der Maus
- Wer im Betriebssystem «Bewegung reduzieren» eingestellt hat, bekommt keine Animationen

## Lokal ansehen

Ordner in VS Code öffnen und unten rechts auf **Go Live** klicken (Extension „Live Server“).

## Veröffentlichen

Die Seite läuft über GitHub Pages (Branch `main`, Root). Jeder Push auf `main` aktualisiert die Live-Seite automatisch nach etwa einer Minute.

## Noch offen

- Button für die Google-Bildersuche (GET-Übung)
- Validieren (W3C) und Testen (PageSpeed Insights)
- Wireframe an das neue Design anpassen
