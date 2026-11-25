# Validieren und Testen · Villa Calce

Modul 293, Aufgabe „Validieren und Testen“. Getestet wurde die Live-Seite
https://timothygroves-07.github.io/frontend-webpage/ am 25.11.2026.

---

## Aufgabe 1: W3C-Validator

### HTML (https://validator.w3.org/nu/)

**Vor der Korrektur** (Commit `1bc2269`): 3 Fehler, 2 Warnungen

| Typ | Zeile | Meldung | Bedeutung |
|---|---|---|---|
| Fehler | 99 | Element „figcaption“ not allowed as child of element „div“ | Eine Bildlegende (`figcaption`) darf nur direkt in einem `figure` stehen. Sie stand neben dem `figure` statt darin. |
| Fehler | 105 | gleich wie oben (zweites Bild) | |
| Fehler | 318 | The first „option“ element in a „select“ element with a „required“ attribute … must have an empty value | Ein Pflicht-Auswahlfeld braucht als erste Option einen leeren Platzhalter. Die Gäste-Auswahl hatte `required`, aber keinen leeren Eintrag. |
| Warnung | 82 | Section lacks heading | Die Sektion „Haus“ hatte keine Überschrift (h2 bis h6). |
| Warnung | 160 | Section lacks heading | Die Sektion mit den Zahlen hatte keine Überschrift. |

**Korrekturen** (Commit `cb98aa3`)

- Die beiden Bildblöcke sind jetzt selbst ein `figure`, die `figcaption` steht darin. Das Bild sitzt in einem `div` für die Animation.
- Bei der Gäste-Auswahl wurde `required` entfernt. Das Feld hat immer einen Wert (Standard 6 Gäste), die Pflicht war also überflüssig.
- Die Sektionen „Haus“, „Zahlen“ und „Räume“ haben eine Überschrift bekommen. Sie ist mit `visually-hidden` nur für Screenreader sichtbar, damit das Design gleich bleibt.

**Nach der Korrektur:** 0 Fehler, 0 Warnungen. Die Seite ist valides HTML5.

### CSS (https://jigsaw.w3.org/css-validator/)

- **0 Fehler**, 37 Warnungen.
- Die Warnungen sind keine Probleme:
  - „CSS variables are currently not statically checked“: Der Validator kann CSS-Variablen (`var(--kalk)`) nicht prüfen, weil ihr Wert erst im Browser feststeht.
  - „vendor extension“: `-webkit-font-smoothing` und `-webkit-overflow-scrolling` sind Browser-spezifische Eigenschaften für Safari. Sie sind gewollt und schaden anderen Browsern nicht.

---

## Aufgabe 2: PageSpeed Insights (Lighthouse)

Berichte:
- Mobil: https://pagespeed.web.dev/analysis/https-timothygroves-07-github-io-frontend-webpage/ernxkrxtpuztv3ku7y2zqa?form_factor=mobile
- Desktop: https://pagespeed.web.dev/analysis/https-timothygroves-07-github-io-frontend-webpage/n3jxeo5an5kfz69shdsasp?form_factor=desktop

### Punkte

| Kategorie | Mobil | Desktop |
|---|---|---|
| Leistung | **70** | **100** |
| Barrierefreiheit | 96 | 96 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |

### Messwerte (Core Web Vitals)

| Messwert | Mobil | Desktop | Was er misst |
|---|---|---|---|
| First Contentful Paint (FCP) | 2,0 s | 0,5 s | Wann das erste Element (Text oder Bild) erscheint |
| Largest Contentful Paint (LCP) | **7,9 s** | 0,5 s | Wann das grösste Element sichtbar ist, hier das Hero-Bild |
| Total Blocking Time (TBT) | 0 ms | 0 ms | Wie lange JavaScript die Seite blockiert, sodass sie nicht auf Klicks reagiert |
| Cumulative Layout Shift (CLS) | 0 | 0,019 | Wie stark Inhalte beim Laden herumspringen |
| Speed Index | 5,5 s | 0,8 s | Wie schnell die Seite insgesamt sichtbar aufgebaut wird |

Lighthouse simuliert für „Mobil“ ein mittelklassiges Handy mit langsamem 4G. Darum ist derselbe Code dort viel langsamer als auf dem Desktop.

### Analyse: Was steckt hinter den Hinweisen?

**Leistung (Mobil 70)**

Das Hauptproblem ist der **LCP von 7,9 s**. Das grösste Element ist das Hero-Bild.

| Hinweis | Ursache bei uns | Mögliche Lösung (nicht umgesetzt) |
|---|---|---|
| Bildübermittlung verbessern (≈ 1 MB Einsparung) | Die Fotos sind JPEG, bis 2000 px breit. Ein Handy lädt dasselbe grosse Bild wie ein Desktop. | Moderne Formate (WebP, AVIF) und verschiedene Grössen mit `srcset`, damit das Handy ein kleines Bild bekommt. |
| Effiziente Verweildauer im Cache (≈ 1,6 bis 2 MB) | GitHub Pages schickt nur eine kurze Cache-Dauer (10 Min.) für Bilder, CSS und JS. Wiederkehrende Besucher laden alles neu. | Auf GitHub Pages nicht einstellbar. Mit eigenem Hosting oder CDN längere `Cache-Control`-Header setzen. |
| Anfragen zum Blockieren des Renderings (≈ 200 bis 300 ms) | Bootstrap-CSS, Icons, Leaflet-CSS und Google Fonts werden im `<head>` geladen. Der Browser wartet, bis alle da sind, bevor er etwas zeichnet. | Nur das Nötigste im `<head>`, Rest später laden, Bootstrap auf die benutzten Teile reduzieren. |
| Reduziere nicht verwendetes JavaScript (≈ 106 KiB) / CSS (≈ 21 KiB) | Bootstrap, jQuery, Leaflet, HighCharts und GSAP werden komplett geladen, auch wenn nur ein Teil gebraucht wird. HighCharts und Leaflet braucht es erst beim Klick auf „Verlauf laden“ bzw. „Karte zeigen“. | Bibliotheken erst laden, wenn man sie braucht (Lazy Loading), oder kleinere Alternativen. |
| Schriftart-Anzeige (≈ 20 ms) | Drei Google-Schriften mit mehreren Gewichten. | Weniger Schnitte laden, Schriften selbst hosten. |
| Erzwungener dynamischer Umbruch | GSAP und ScrollTrigger messen beim Start viele Elemente (für Parallax und die horizontale Galerie). Das zwingt den Browser, das Layout mehrmals neu zu berechnen. | Animationen erst nach dem Laden starten, weniger Elemente messen. |
| Netzwerkabhängigkeitsbaum | Viele Dateien hängen voneinander ab (HTML lädt CSS, CSS lädt Schriften). Das ist eine Kette von Wartezeiten. | `preload` für das Hero-Bild und die wichtigste Schrift. |

Positiv: **TBT 0 ms** und **CLS 0**. Das JavaScript blockiert nichts, und dank `width`/`height` an den Bildern springt das Layout beim Laden nicht.

**Barrierefreiheit (96)**

Einziger Hinweis: *Das Kontrastverhältnis von Hintergrund- und Vordergrundfarben ist nicht ausreichend.*
Betroffen sind die Wörter im Manifest-Text (`<span class="w">`). Sie starten absichtlich mit 15 % Deckkraft und werden erst beim Scrollen dunkel (Scroll-Effekt). Lighthouse prüft den Zustand beim Laden und sieht darum hellgrauen Text auf hellem Grund.
Mögliche Lösung: den Startwert auf etwa 40 % Deckkraft erhöhen oder den Effekt über die Farbe statt über die Deckkraft lösen.

**Best Practices (100) und SEO (100)**

Keine Beanstandungen: HTTPS, keine Fehler in der Konsole, `lang="de"`, Titel und Meta-Description vorhanden, Bilder mit Alt-Texten, Links mit sprechendem Text.

### Fazit

Auf dem Desktop ist die Seite sehr schnell (100). Auf dem Handy bremsen vor allem **die grossen Bilder** und **die vielen Bibliotheken**. Die wirksamsten Verbesserungen wären WebP-Bilder mit `srcset` und das spätere Laden von HighCharts und Leaflet. Laut Aufgabe mussten diese Korrekturen nicht umgesetzt werden.
