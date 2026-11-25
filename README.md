# Wohnung 4b · Ferienwohnung mit grüner Tür

Frontend-Projekt aus Modul 293: eine statische Website zur Vermietung einer Ferienwohnung, ohne Backend.

**Live:** https://timothygroves-07.github.io/frontend-webpage/

## Dateien

- `index.html`: Struktur und Inhalt
- `styles.css`: Gestaltung (Bootstrap-Variablen überschrieben)
- `app.js`: Interaktivität und API-Features (jQuery)
- `img/`: Fotos von Unsplash
- `docs/wireframe.drawio`: Wireframe (draw.io)

## Technik

- Bootstrap 5.3 und jQuery 3.7 via CDN
- Leaflet 1.9 mit swisstopo-Kartenkacheln

## Features

| Feature | API |
|---|---|
| a) Zufälliges Katzenbild | The Cat API |
| b) Bitcoin-Kurs in USD und CHF | CoinGecko |
| c) Wetter Zürich (Tmax, Tmin, Niederschlag) | Open-Meteo |
| d) 5 nächste Ladestationen ab Winterthur, Suche nach PLZ | BFE / opendata.swiss |
| e) Karte mit Ortssuche, Klick auf Ladestation zentriert die Karte | geo.admin.ch, Leaflet |
| Wetterverlauf 5 Tage (Temperatur, Niederschlag) | Open-Meteo, HighCharts |
| Galerie „Museum der Kleinigkeiten“: 12 Exponate, Raumfilter, Vitrine mit Pfeiltasten | jQuery, Bootstrap-Modal |
| Buchungsformular mit Validierung und Preisberechnung, POST an Webhook | webhook.site |

> Achtung: Die Webhook-URL steht öffentlich im Code. Wer sie kennt, kann die eingegangenen Anfragen auf webhook.site ansehen. Darum nur Testdaten eingeben. Free-URLs laufen nach 7 Tagen ab.

## Lokal ansehen

Ordner in VS Code öffnen und unten rechts auf **Go Live** klicken (Extension „Live Server“).

## Veröffentlichen

Die Seite läuft über GitHub Pages (Branch `main`, Root). Jeder Push auf `main` aktualisiert die Live-Seite automatisch nach etwa einer Minute.

## Noch offen

- Button für die Google-Bildersuche (GET-Übung)
- Validieren (W3C) und Testen (PageSpeed Insights)
