// =========================================================
// Villa Calce · app.js
// Interaktivität (jQuery), API-Features aus dem Auftrag,
// Animationen und Scrolleffekte (GSAP + ScrollTrigger)
// =========================================================

$(function () {
  console.log('jQuery', $.fn.jquery, 'und Bootstrap', bootstrap.Tooltip.VERSION, 'sind geladen');

  // Kleine Rückmeldung unten rechts
  const toast = bootstrap.Toast.getOrCreateInstance($('#toast')[0], { delay: 3500 });
  function zeigeToast(text) {
    $('#toast-text').text(text);
    toast.show();
  }

  // Mobile Navigation nach Klick auf einen Link wieder schliessen
  $('#nav .nav-link').on('click', function () {
    const menu = bootstrap.Collapse.getInstance($('#nav')[0]);
    if (menu) menu.hide();
  });

  // Die Villa (fiktiv), Val d'Orcia bei Pienza
  const VILLA_LAT = 43.0590;
  const VILLA_LON = 11.6370;

  // Abstand zwischen zwei Koordinaten in km (Haversine-Formel)
  function distanzKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  // Eine Zeile "Label · Wert" für Ergebnisboxen
  function datenZeile(label, wert) {
    return $('<div>', { class: 'daten-zeile' }).append(
      $('<span>', { class: 'daten-label', text: label }),
      $('<span>', { class: 'daten-wert', text: wert })
    );
  }

  // =========================================================
  // a) Zufälliges Katzenbild (The Cat API)
  // =========================================================
  const CAT_API_URL = 'https://api.thecatapi.com/v1/images/search';

  function ladeKatze() {
    const $button = $('#btn-cat');
    const $result = $('#cat-result');

    $button.prop('disabled', true);
    $result.removeClass('has-image').text('Lädt …');

    // Antwort ist ein Array mit einem Objekt: [{ url: "..." }]
    $.getJSON(CAT_API_URL)
      .done(function (data) {
        const $bild = $('<img>', { src: data[0].url, alt: 'Zufällige Katze von The Cat API', class: 'cat-img' });
        $result.empty().addClass('has-image').append($bild);
      })
      .fail(function () {
        $result.text('Keine Katze gefunden. Nochmal versuchen.');
      })
      .always(function () {
        $button.prop('disabled', false).html('Neue Katze <i class="bi bi-arrow-right" aria-hidden="true"></i>');
      });
  }
  $('#btn-cat').on('click', ladeKatze);

  // =========================================================
  // b) Bitcoin-Kurs in USD und CHF (CoinGecko)
  // =========================================================
  const BTC_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,chf';

  // 64522 -> 64'522
  function formatiereZahl(zahl) {
    return new Intl.NumberFormat('de-CH', { maximumFractionDigits: 0 }).format(zahl);
  }

  function ladeBitcoinKurs() {
    const $button = $('#btn-btc');
    const $result = $('#btc-result');

    $button.prop('disabled', true);
    $result.removeClass('has-data').text('Lädt …');

    // Antwort: { "bitcoin": { "usd": 64522, "chf": 54312 } }
    $.getJSON(BTC_API_URL)
      .done(function (data) {
        const usd = data.bitcoin.usd;
        const chf = data.bitcoin.chf;
        const naechte = (chf / 1450).toFixed(1);
        const zeit = new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });

        $result.empty().addClass('has-data').append(
          datenZeile('USD', formatiereZahl(usd)),
          datenZeile('CHF', formatiereZahl(chf)),
          $('<div>', { class: 'daten-fuss', text: '1 BTC = ' + naechte + ' Nächte Nebensaison · Stand ' + zeit + ' Uhr' })
        );
      })
      .fail(function () {
        $result.text('Kurs gerade nicht abrufbar.');
      })
      .always(function () {
        $button.prop('disabled', false).html('Kurs aktualisieren <i class="bi bi-arrow-right" aria-hidden="true"></i>');
      });
  }
  $('#btn-btc').on('click', ladeBitcoinKurs);

  // =========================================================
  // c) Aktuelles Wetter für Zürich (Open-Meteo)
  // =========================================================
  const LAT = 47.3769;   // Zürich
  const LON = 8.5417;
  const ORT = 'Zürich, CH';

  // Die Konstanten werden als Parameter an die API-URL angehängt
  const WETTER_API_URL = 'https://api.open-meteo.com/v1/forecast?' + $.param({
    latitude: LAT,
    longitude: LON,
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
    forecast_days: 1,
    timezone: 'Europe/Zurich'
  });

  function wetterTipp(tmax, regen) {
    if (regen >= 1) return 'Regen in Zürich. Gutes Timing für die Abreise.';
    if (tmax < 10) return 'Kalt in Zürich. In der Toskana ist es wärmer.';
    return 'Schön in Zürich. Fahr trotzdem.';
  }

  function ladeWetter() {
    const $button = $('#btn-weather');
    const $result = $('#weather-result');

    $button.prop('disabled', true);
    $result.removeClass('has-data').text('Lädt …');

    // Werte stecken in Arrays, ein Eintrag pro Tag: data.daily.temperature_2m_max[0]
    $.getJSON(WETTER_API_URL)
      .done(function (data) {
        const tmax = Math.round(data.daily.temperature_2m_max[0]);
        const tmin = Math.round(data.daily.temperature_2m_min[0]);
        const regen = data.daily.precipitation_sum[0];

        $result.empty().addClass('has-data').append(
          datenZeile('Ort', ORT),
          datenZeile('Heute', tmax + '° / ' + tmin + '°'),
          datenZeile('Regen', regen.toFixed(1) + ' mm'),
          $('<div>', { class: 'daten-tipp', text: wetterTipp(tmax, regen) })
        );
      })
      .fail(function () {
        $result.text('Wetter gerade nicht abrufbar.');
      })
      .always(function () {
        $button.prop('disabled', false).html('Wetter aktualisieren <i class="bi bi-arrow-right" aria-hidden="true"></i>');
      });
  }
  $('#btn-weather').on('click', ladeWetter);

  // =========================================================
  // c+) Wetterverlauf 5 Tage mit HighCharts
  //     Zürich (Temperatur + Niederschlag) gegen die Villa (Temperatur)
  // =========================================================
  const VERLAUF_ZH_URL = 'https://api.open-meteo.com/v1/forecast?' + $.param({
    latitude: LAT,
    longitude: LON,
    hourly: 'temperature_2m,precipitation',
    forecast_days: 5,
    // ICON-CH1 rechnet nur rund 33 Stunden voraus, ICON-CH2 deckt alle 5 Tage ab
    models: 'meteoswiss_icon_ch2',
    timezone: 'Europe/Zurich'
  });
  const VERLAUF_VILLA_URL = 'https://api.open-meteo.com/v1/forecast?' + $.param({
    latitude: VILLA_LAT,
    longitude: VILLA_LON,
    hourly: 'temperature_2m',
    forecast_days: 5,
    timezone: 'Europe/Rome'
  });

  Highcharts.setOptions({
    lang: {
      weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
      shortWeekdays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
      months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
      decimalPoint: '.',
      thousandsSep: "'"
    }
  });

  // "2026-11-18T13:00" in Millisekunden. Die Zeiten sind schon Ortszeit,
  // darum als UTC behandeln (sonst verschiebt sich alles).
  function zeitpunkt(t) { return Date.parse(t + ':00Z'); }

  function ladeWetterVerlauf() {
    const $button = $('#btn-weather-chart');
    const $chart = $('#weather-chart');
    $button.prop('disabled', true);

    // Zwei Anfragen gleichzeitig, weiter wenn beide fertig sind
    $.when($.getJSON(VERLAUF_ZH_URL), $.getJSON(VERLAUF_VILLA_URL))
      .done(function (zh, villa) {
        const z = zh[0].hourly;
        const v = villa[0].hourly;
        const tempZh = z.time.map(function (t, i) { return [zeitpunkt(t), z.temperature_2m[i]]; });
        const regenZh = z.time.map(function (t, i) { return [zeitpunkt(t), z.precipitation[i]]; });
        const tempVilla = v.time.map(function (t, i) { return [zeitpunkt(t), v.temperature_2m[i]]; });

        $chart.addClass('chart-live').empty();

        Highcharts.chart('weather-chart', {
          chart: { backgroundColor: 'transparent', style: { fontFamily: 'JetBrains Mono, monospace' } },
          title: { text: null },
          credits: { enabled: false },
          time: { useUTC: true },
          xAxis: {
            type: 'datetime',
            tickInterval: 24 * 3600 * 1000,
            labels: { format: '{value:%a %e.}', style: { color: '#ecebe6' } },
            lineColor: '#ecebe6',
            tickColor: '#ecebe6',
            gridLineWidth: 1,
            gridLineColor: 'rgba(236,235,230,.15)'
          },
          yAxis: [
            { title: { text: '°C', style: { color: '#ecebe6' } }, labels: { format: '{value}°', style: { color: '#ecebe6' } }, gridLineColor: 'rgba(236,235,230,.15)' },
            { title: { text: 'mm', style: { color: '#ecebe6' } }, opposite: true, min: 0, labels: { style: { color: '#ecebe6' } }, gridLineWidth: 0 }
          ],
          tooltip: { shared: true, xDateFormat: '%A, %e. %B, %H:%M Uhr', backgroundColor: '#0d0d0c', borderColor: '#ecebe6', style: { color: '#ecebe6' } },
          legend: { itemStyle: { color: '#ecebe6', fontWeight: 'normal' }, itemHoverStyle: { color: '#c2471d' } },
          series: [
            { name: 'Niederschlag Zürich', type: 'column', yAxis: 1, data: regenZh, color: 'rgba(236,235,230,.35)', borderWidth: 0, pointPadding: 0, groupPadding: 0, tooltip: { valueSuffix: ' mm' } },
            { name: 'Temperatur Zürich', type: 'line', data: tempZh, color: '#ecebe6', lineWidth: 1.5, marker: { enabled: false }, tooltip: { valueSuffix: ' °C' } },
            { name: 'Temperatur Villa', type: 'line', data: tempVilla, color: '#c2471d', lineWidth: 2.5, marker: { enabled: false }, tooltip: { valueSuffix: ' °C' } }
          ]
        });
      })
      .fail(function () {
        $chart.text('Prognose gerade nicht abrufbar.');
      })
      .always(function () {
        $button.prop('disabled', false).html('Verlauf aktualisieren <i class="bi bi-arrow-right" aria-hidden="true"></i>');
      });
  }
  $('#btn-weather-chart').on('click', ladeWetterVerlauf);

  // =========================================================
  // d) Die 5 nächstgelegenen Ladestationen (BFE / opendata.swiss)
  // =========================================================
  const LADE_API_URL = 'https://data.geo.admin.ch/ch.bfe.ladestellen-elektromobilitaet/data/ch.bfe.ladestellen-elektromobilitaet.json';
  const WINT_LAT = 47.4988; // Winterthur (hardcoded)
  const WINT_LON = 8.7237;
  const ANZAHL = 5;

  // Die Datei ist gross (rund 18'000 Ladepunkte). Nur einmal laden und merken.
  let ladestationen = null;

  // Rohdaten in eine einfache Liste umwandeln: ein Eintrag pro Standort
  function bereiteStationenAuf(data) {
    const standorte = {};

    // Aufbau: data.EVSEData = [ Betreiber ], jeder Betreiber hat EVSEDataRecord = [ Ladepunkt ]
    $.each(data.EVSEData, function (_, betreiber) {
      $.each(betreiber.EVSEDataRecord, function (_, punkt) {
        // Koordinaten stehen als Text "47.43958 9.006634" drin
        const teile = (punkt.GeoCoordinates && punkt.GeoCoordinates.Google || '').split(' ');
        const lat = parseFloat(teile[0]);
        const lon = parseFloat(teile[1]);
        if (isNaN(lat) || isNaN(lon)) return;

        // Mehrere Ladepunkte am gleichen Ort zusammenfassen
        const schluessel = lat.toFixed(5) + ',' + lon.toFixed(5);
        const leistung = Math.max(0, ...(punkt.ChargingFacilities || []).map(function (f) { return f.power || 0; }));

        if (standorte[schluessel]) {
          standorte[schluessel].anzahl += 1;
          standorte[schluessel].leistung = Math.max(standorte[schluessel].leistung, leistung);
          return;
        }

        // Achtung, die Daten sind nicht einheitlich: meistens eine Liste,
        // manchmal ein einzelnes Objekt, manchmal null
        const namen = $.isArray(punkt.ChargingStationNames)
          ? punkt.ChargingStationNames
          : (punkt.ChargingStationNames ? [punkt.ChargingStationNames] : []);
        const nameDe = namen.find(function (n) { return n.lang === 'de'; }) || namen[0];
        const adr = punkt.Address || {};

        standorte[schluessel] = {
          name: nameDe ? nameDe.value : 'Ladestation',
          strasse: [adr.Street, adr.HouseNum].filter(Boolean).join(' '),
          plz: adr.PostalCode || '',
          ort: adr.City || '',
          betreiber: betreiber.OperatorName,
          lat: lat,
          lon: lon,
          leistung: leistung,
          anzahl: 1
        };
      });
    });

    return Object.values(standorte);
  }

  // Liste rendern, jeder Eintrag merkt sich seine Koordinaten (für die Karte)
  function zeigeStationen(stationen, mitDistanz) {
    const $liste = $('#charger-result').empty().addClass('has-data');

    $.each(stationen, function (_, s) {
      const adresse = [s.strasse, (s.plz + ' ' + s.ort).trim()].filter(Boolean).join(', ');
      const meta = [
        s.leistung ? s.leistung + ' kW' : null,
        s.anzahl > 1 ? s.anzahl + ' Ladepunkte' : '1 Ladepunkt',
        s.betreiber
      ].filter(Boolean).join(' · ');

      $('<li>', { 'data-lat': s.lat, 'data-lon': s.lon }).append(
        $('<div>', { class: 'lade-kopf' }).append(
          $('<span>', { class: 'lade-name', text: s.name }),
          mitDistanz ? $('<span>', { class: 'lade-km', text: s.distanz.toFixed(1) + ' km' }) : null
        ),
        $('<div>', { class: 'lade-adr', text: adresse }),
        $('<div>', { class: 'lade-meta', text: meta })
      ).appendTo($liste);
    });
  }

  // Daten holen (oder aus dem Speicher nehmen) und dann "weiter" ausführen
  function mitStationen(weiter) {
    if (ladestationen) { weiter(); return; }
    $('#charger-result').removeClass('has-data').html('<li>Lade Daten vom Bund … (ca. 1 MB)</li>');

    $.getJSON(LADE_API_URL)
      .done(function (data) {
        ladestationen = bereiteStationenAuf(data);
        weiter();
      })
      .fail(function () {
        $('#charger-result').removeClass('has-data').html('<li>Daten gerade nicht abrufbar.</li>');
      })
      .always(function () {
        $('#btn-charger, #btn-charger-plz').prop('disabled', false);
      });
  }

  // Standard: die 5 nächsten Stationen zu Winterthur
  function sucheBeiWinterthur() {
    $('#btn-charger').prop('disabled', true);
    mitStationen(function () {
      const naechste = ladestationen
        .map(function (s) { return $.extend({}, s, { distanz: distanzKm(WINT_LAT, WINT_LON, s.lat, s.lon) }); })
        .sort(function (a, b) { return a.distanz - b.distanz; })
        .slice(0, ANZAHL);

      $('#charger-info').text('Die ' + ANZAHL + ' nächsten ab Winterthur Zentrum · Klick zeigt Karte');
      zeigeStationen(naechste, true);
      $('#btn-charger').prop('disabled', false);
    });
  }

  // Für die Schnellen: Suche nach PLZ, Resultate am gleichen Ort im DOM
  function sucheNachPlz(event) {
    event.preventDefault();
    const $feld = $('#charger-plz');
    const plz = $feld.val().trim();

    // Never trust user input: nur genau 4 Ziffern zulassen
    if (!/^[0-9]{4}$/.test(plz)) {
      $feld.addClass('is-invalid');
      $('#charger-info').text('Bitte eine Schweizer PLZ mit 4 Ziffern.');
      return;
    }
    $feld.removeClass('is-invalid');
    $('#btn-charger-plz').prop('disabled', true);

    mitStationen(function () {
      const treffer = ladestationen.filter(function (s) { return s.plz === plz; });

      if (treffer.length === 0) {
        $('#charger-info').text('Keine Ladestation mit PLZ ' + plz + '.');
        $('#charger-result').removeClass('has-data').html('<li>Nichts gefunden.</li>');
      } else {
        const beste = treffer.sort(function (a, b) { return b.leistung - a.leistung; }).slice(0, ANZAHL);
        $('#charger-info').text(treffer.length === 1
          ? '1 Standort mit PLZ ' + plz
          : treffer.length + ' Standorte mit PLZ ' + plz + ', die ' + beste.length + ' stärksten');
        zeigeStationen(beste, false);
      }
      $('#btn-charger-plz').prop('disabled', false);
    });
  }

  $('#btn-charger').on('click', sucheBeiWinterthur);
  $('#charger-plz-form').on('submit', sucheNachPlz);
  $('#charger-plz').on('input', function () { $(this).removeClass('is-invalid'); });

  // =========================================================
  // e) Kartenausschnitt mit Leaflet
  // =========================================================
  const SUCH_API_URL = 'https://api3.geo.admin.ch/rest/services/api/SearchServer';

  let karte = null;
  let marker = null;
  let linie = null;

  function pin(farbe) {
    return L.divIcon({
      className: '',
      html: '<div class="karte-pin" style="background:' + farbe + '"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -10]
    });
  }

  // Karte einmalig erstellen und auf die Villa zentrieren
  function erstelleKarte() {
    if (karte) return karte;
    $('#map').addClass('map-live').empty();

    karte = L.map('map', { scrollWheelZoom: false }).setView([VILLA_LAT, VILLA_LON], 12);

    // Kacheln von OpenStreetMap (swisstopo deckt die Toskana nicht ab).
    // Per CSS-Filter grau gemacht, damit sie zum Design passen.
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: 'karte-kacheln',
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    }).addTo(karte);

    L.marker([VILLA_LAT, VILLA_LON], { icon: pin('#c2471d') })
      .addTo(karte)
      .bindPopup('VILLA CALCE<br>Val d\'Orcia')
      .openPopup();

    return karte;
  }

  // Marker setzen, optional mit Linie zur Villa
  function zeigeAufKarte(lat, lon, titel, mitLinie) {
    erstelleKarte();
    if (marker) karte.removeLayer(marker);
    if (linie) { karte.removeLayer(linie); linie = null; }

    marker = L.marker([lat, lon], { icon: pin('#0d0d0c') })
      .addTo(karte)
      .bindPopup($('<div>').text(titel).html())   // Text sicher escapen
      .openPopup();

    if (mitLinie) {
      linie = L.polyline([[lat, lon], [VILLA_LAT, VILLA_LON]], { color: '#c2471d', weight: 2, dashArray: '6 6' }).addTo(karte);
      karte.fitBounds(linie.getBounds(), { padding: [30, 30] });
    } else {
      karte.setView([lat, lon], 16);
    }
  }

  $('#btn-map').on('click', function () {
    erstelleKarte();
    if (marker) { karte.removeLayer(marker); marker = null; }
    if (linie) { karte.removeLayer(linie); linie = null; }
    karte.setView([VILLA_LAT, VILLA_LON], 12);
    $('#map-info').text('Villa Calce, Val d\'Orcia');
    $(this).html('Zurück zur Villa <i class="bi bi-arrow-right" aria-hidden="true"></i>');
  });

  // Für die Schnellen: Abfahrtsort suchen (Such-API von geo.admin.ch, nur Schweiz)
  $('#map-search-form').on('submit', function (event) {
    event.preventDefault();
    const $feld = $('#map-search');
    const suchtext = $feld.val().trim();

    if (suchtext.length < 2) {
      $feld.addClass('is-invalid');
      $('#map-info').text('Bitte mindestens 2 Zeichen.');
      return;
    }
    $feld.removeClass('is-invalid');
    $('#btn-map-search').prop('disabled', true);
    $('#map-info').text('Suche „' + suchtext + '“ …');

    $.getJSON(SUCH_API_URL, { searchText: suchtext, type: 'locations', sr: 4326, limit: 1 })
      .done(function (data) {
        if (!data.results || data.results.length === 0) {
          $('#map-info').text('Kein Ort „' + suchtext + '“ in der Schweiz gefunden.');
          return;
        }
        const ort = data.results[0].attrs;
        const name = ort.label.replace(/<[^>]*>/g, ''); // HTML-Tags aus dem Label entfernen
        const km = Math.round(distanzKm(ort.lat, ort.lon, VILLA_LAT, VILLA_LON));
        zeigeAufKarte(ort.lat, ort.lon, name, true);
        $('#map-info').text(name + ' → Villa Calce · Luftlinie ' + km + ' km');
      })
      .fail(function () {
        $('#map-info').text('Suche gerade nicht möglich.');
      })
      .always(function () {
        $('#btn-map-search').prop('disabled', false);
      });
  });
  $('#map-search').on('input', function () { $(this).removeClass('is-invalid'); });

  // Advanced: Klick auf eine Ladestation zeigt sie auf der Karte (Event-Delegation)
  $('#charger-result').on('click', 'li[data-lat]', function () {
    const $eintrag = $(this);
    const name = $eintrag.find('.lade-name').text();
    zeigeAufKarte(parseFloat($eintrag.data('lat')), parseFloat($eintrag.data('lon')), 'Ladestation: ' + name, false);
    $('#map-info').text('Ladestation: ' + name);
    $('#charger-result li').removeClass('is-active');
    $eintrag.addClass('is-active');
    document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // =========================================================
  // Räume: Vorschaubild folgt der Maus (nur Desktop)
  // =========================================================
  const $vorschau = $('.raum-vorschau');
  $('.raum-liste li')
    .on('mouseenter', function () {
      $vorschau.find('img').attr('src', $(this).data('bild'));
      $vorschau.addClass('aktiv');
    })
    .on('mouseleave', function () { $vorschau.removeClass('aktiv'); });
  $('.raum-liste').on('mousemove', function (e) {
    $vorschau.css({ left: e.clientX + 'px', top: e.clientY + 'px' });
  });

  // =========================================================
  // Buchungsformular
  // =========================================================
  const MIN_NAECHTE = 3;
  const REINIGUNG = 450;
  // Endpoint von webhook.site (CORS-Header aktiviert). Leer = nichts senden, nur Konsole.
  const WEBHOOK_URL = 'https://webhook.site/1ccb6196-80fd-4fcd-a8b6-7711bb7755d7';

  // Saisonpreis für eine Nacht, abhängig vom Monat (0 = Januar)
  function tarif(monat) {
    if (monat >= 5 && monat <= 8) return 2400;           // Juni bis September
    if (monat === 3 || monat === 4 || monat === 9) return 1850; // April, Mai, Oktober
    return 1450;                                          // November bis März
  }

  const $form = $('#anfrage');
  const $anreise = $('#anreise');
  const $abreise = $('#abreise');

  function isoDatum(datum) { return datum.toISOString().slice(0, 10); }
  function plusTage(iso, tage) {
    const d = new Date(iso + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + tage);
    return isoDatum(d);
  }
  function chf(betrag) { return 'CHF ' + formatiereZahl(betrag) + '.–'; }

  // Miete Nacht für Nacht zusammenzählen (eine Buchung kann über zwei Saisons gehen)
  function berechne(von, bis) {
    let naechte = 0;
    let miete = 0;
    const d = new Date(von + 'T00:00:00Z');
    const ende = new Date(bis + 'T00:00:00Z');
    while (d < ende && naechte < 365) {
      miete += tarif(d.getUTCMonth());
      naechte += 1;
      d.setUTCDate(d.getUTCDate() + 1);
    }
    return { naechte: naechte, miete: miete };
  }

  const heute = isoDatum(new Date());
  $anreise.attr('min', heute);
  $abreise.attr('min', plusTage(heute, MIN_NAECHTE));

  function aktualisiereBuchung() {
    const von = $anreise.val();
    const bis = $abreise.val();
    if (von) $abreise.attr('min', plusTage(von, MIN_NAECHTE));

    const r = (von && bis) ? berechne(von, bis) : { naechte: 0, miete: 0 };

    // Eigene Regel: mindestens 3 Nächte
    $abreise[0].setCustomValidity(von && bis && r.naechte < MIN_NAECHTE ? 'mindestens 3 Nächte' : '');

    if (r.naechte >= MIN_NAECHTE) {
      $('#sum-naechte').text(r.naechte);
      $('#sum-tarif').text('Ø ' + formatiereZahl(Math.round(r.miete / r.naechte)));
      $('#sum-miete').text(chf(r.miete));
      $('#sum-total').text(chf(r.miete + REINIGUNG));
      $('#sum-bonus')
        .toggleClass('is-earned', r.naechte >= 7)
        .text(r.naechte >= 7 ? 'Inklusive: ein Abend mit Köchin Lucia.' : 'Noch ' + (7 - r.naechte) + ' Nächte bis zum Abend mit Köchin Lucia.');
    } else {
      $('#sum-naechte, #sum-tarif, #sum-miete, #sum-total').text('–');
      $('#sum-bonus').removeClass('is-earned').text('Ab 7 Nächten: ein Abend mit Köchin Lucia.');
    }
    return r;
  }
  $anreise.add($abreise).on('change input', aktualisiereBuchung);

  $('#nachricht').on('input', function () { $('#nachricht-zaehler').text($(this).val().length); });

  $form.on('submit', function (event) {
    event.preventDefault();
    const r = aktualisiereBuchung();

    if (!this.checkValidity()) {
      $form.addClass('was-validated');
      $form.find('input:invalid, select:invalid, textarea:invalid').first().trigger('focus');
      zeigeToast('Ein paar Felder fehlen noch.');
      return;
    }

    const daten = {};
    $.each($form.serializeArray(), function (_, feld) { daten[feld.name] = feld.value.trim(); });
    daten.naechte = r.naechte;
    daten.total_chf = r.miete + REINIGUNG;

    const $button = $('#btn-senden').prop('disabled', true);

    function fertig() {
      zeigeToast('Grazie, ' + daten.vorname + '. Antwort per ' + daten.kontaktart + ' innert 24 Stunden.');
      $form[0].reset();
      $form.removeClass('was-validated');
      $('#nachricht-zaehler').text(0);
      aktualisiereBuchung();
      $button.prop('disabled', false);
    }

    if (!WEBHOOK_URL) {
      console.log('Buchungsanfrage (nicht gesendet):', daten);
      fertig();
      return;
    }

    // POST an den Webhook (Aufgabe "Formular an Backend anbinden")
    $.post(WEBHOOK_URL, daten)
      .done(fertig)
      .fail(function () {
        zeigeToast('Senden hat nicht geklappt. Bitte nochmal versuchen.');
        $button.prop('disabled', false);
      });
  });

  // =========================================================
  // Animationen und Scrolleffekte (GSAP + ScrollTrigger)
  // =========================================================
  const wenigBewegung = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Manifest in einzelne Wörter zerlegen (für den Scroll-Effekt)
  $('[data-split]').each(function () {
    const woerter = $(this).text().trim().split(/\s+/);
    $(this).html(woerter.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' '));
  });

  // Zähler: Zahl von 0 hochzählen
  function zaehleHoch(el) {
    const ziel = parseInt(el.dataset.count, 10);
    if (wenigBewegung || typeof gsap === 'undefined') { el.textContent = ziel; return; }
    const obj = { wert: 0 };
    gsap.to(obj, {
      wert: ziel,
      duration: ziel > 100 ? 1.8 : 1.2,
      ease: 'power2.out',
      onUpdate: function () { el.textContent = Math.round(obj.wert); }
    });
  }

  if (wenigBewegung || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    // Ohne Animationen: alles sofort sichtbar
    $('.manifest .w').css('opacity', 1);
    $('[data-count]').each(function () { this.textContent = this.dataset.count; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Fortschrittsbalken oben
  gsap.to('.progress-line span', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
  });

  // Hero: Buchstaben steigen auf, Bild bewegt sich langsamer (Parallax)
  gsap.from('.hero-titel .wort', { yPercent: 110, duration: 1.2, ease: 'power4.out', stagger: 0.12, delay: 0.1 });
  gsap.from('.hero-label, .hero-meta', { opacity: 0, y: 20, duration: 1, ease: 'power3.out', delay: 0.6, stagger: 0.1 });
  gsap.from('.hero-bild img', { scale: 1.15, duration: 2, ease: 'power3.out' });
  gsap.to('.hero-bild', {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to('.hero-titel', {
    yPercent: -25,
    opacity: 0.2,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  // Manifest: Wörter werden beim Scrollen nacheinander dunkel
  gsap.to('.manifest .w', {
    opacity: 1,
    stagger: 0.05,
    ease: 'none',
    scrollTrigger: { trigger: '.manifest', start: 'top 80%', end: 'bottom 45%', scrub: true }
  });

  // Bilder: werden von unten aufgedeckt und bewegen sich leicht (Parallax)
  gsap.utils.toArray('[data-reveal]').forEach(function (fig) {
    gsap.from(fig, {
      clipPath: 'inset(100% 0 0 0)',
      duration: 1.3,
      ease: 'power4.inOut',
      scrollTrigger: { trigger: fig, start: 'top 85%' }
    });
  });
  gsap.utils.toArray('[data-parallax]').forEach(function (img) {
    gsap.to(img, {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  // Grosse Titel gleiten hoch
  gsap.utils.toArray('.titel-gross').forEach(function (t) {
    gsap.from(t, { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: t, start: 'top 88%' } });
  });

  // Zahlen zählen hoch, sobald sie sichtbar sind
  gsap.utils.toArray('[data-count]').forEach(function (el) {
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () { zaehleHoch(el); } });
  });

  // Räume und Kacheln erscheinen gestaffelt
  gsap.from('.raum-liste li', {
    y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08,
    scrollTrigger: { trigger: '.raum-liste', start: 'top 80%' }
  });
  gsap.from('.kachel', {
    y: 50, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08,
    scrollTrigger: { trigger: '.service-raster', start: 'top 80%' }
  });
  gsap.from('.preis-tabelle tbody tr', {
    x: -40, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1,
    scrollTrigger: { trigger: '.preis-tabelle', start: 'top 85%' }
  });

  // Galerie: auf grossen Bildschirmen festhalten und seitwärts scrollen
  ScrollTrigger.matchMedia({
    '(min-width: 992px)': function () {
      const spur = document.querySelector('.galerie-spur');
      const weg = function () { return spur.scrollWidth - window.innerWidth; };
      gsap.to(spur, {
        x: function () { return -weg(); },
        ease: 'none',
        scrollTrigger: {
          trigger: '.galerie',
          start: 'top top',
          end: function () { return '+=' + weg(); },
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true
        }
      });
    }
  });

  // Footer-Wort fährt herein
  gsap.from('.fuss-wort', {
    yPercent: 40, opacity: 0, ease: 'power3.out', duration: 1.2,
    scrollTrigger: { trigger: '.fuss', start: 'top 85%' }
  });

  // Bilder laden später nach (loading=lazy): Positionen danach neu berechnen
  $(window).on('load', function () { ScrollTrigger.refresh(); });
});
