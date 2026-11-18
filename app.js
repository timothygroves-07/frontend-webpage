// Wird ausgeführt, sobald die Seite geladen ist
$(function () {
  console.log('jQuery', $.fn.jquery, 'und Bootstrap', bootstrap.Tooltip.VERSION, 'sind geladen');

  // Kleine Rückmeldung unten rechts
  const toast = bootstrap.Toast.getOrCreateInstance($('#toast')[0], { delay: 3000 });
  function zeigeToast(text) {
    $('#toast-text').text(text);
    toast.show();
  }

  // Fun Facts über die Wohnung, per Klick durchschalten
  const funFacts = [
    'Der Vormieter hat die Wand im Flur „Salbei“ gestrichen. Es ist eher Pistazie.',
    'Die dritte Treppenstufe von oben knarrt in einem leicht anderen Ton als die anderen.',
    'Gertrud hat einen eigenen Instagram-Account. Er hat 14 Follower, alle aus dem Haus.',
    'Im Schrank liegt eine Kassette mit der Aufschrift „Sommer 98“. Niemand weiss, was drauf ist.',
    'Herbert ist eine Monstera und älter als der Plattenspieler.',
    'Das Dachfenster zeigt genau nach Westen. Der eine Stern ist vermutlich die Venus.'
  ];
  let factIndex = 0;

  $('#btn-funfact').on('click', function () {
    factIndex = (factIndex + 1) % funFacts.length;
    $('#funfact-text').fadeOut(150, function () {
      $(this).text(funFacts[factIndex]).fadeIn(150);
    });
  });

  // Galerie: Klick auf ein Foto öffnet die Lightbox
  const lightbox = bootstrap.Modal.getOrCreateInstance($('#lightbox')[0]);
  $('.gallery-item')
    .attr({ tabindex: 0, role: 'button' })
    .on('click keydown', function (e) {
      if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const $img = $(this).find('img');
      $('#lightbox-img').attr({ src: $img.attr('src'), alt: $img.attr('alt') });
      $('#lightbox-caption').text($(this).data('caption'));
      lightbox.show();
    });

  // =========================================================
  // a) Zufälliges Katzenbild (The Cat API)
  // =========================================================
  const CAT_API_URL = 'https://api.thecatapi.com/v1/images/search';

  function ladeKatze() {
    const $button = $('#btn-cat');
    const $result = $('#cat-result');

    // Während des Ladens: Button sperren und Status anzeigen
    $button.prop('disabled', true).text('Katze wird gesucht …');
    $result.removeClass('has-image').text('Lädt …');

    // GET-Request an die API, Antwort ist ein Array mit einem Objekt
    $.getJSON(CAT_API_URL)
      .done(function (data) {
        const katze = data[0];

        // Neues <img> erstellen und den Platzhalter damit ersetzen
        const $bild = $('<img>', {
          src: katze.url,
          alt: 'Zufällige Katze von The Cat API',
          class: 'cat-img'
        });

        $result.empty().addClass('has-image').append($bild);
      })
      .fail(function () {
        $result.text('Keine Katze gefunden. Versuch es gleich nochmal.');
      })
      .always(function () {
        $button.prop('disabled', false).text('Neue Katze');
      });
  }

  $('#btn-cat').on('click', ladeKatze);

  // =========================================================
  // b) Bitcoin-Kurs in USD und CHF (CoinGecko)
  // =========================================================
  const BTC_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,chf';

  // Zahl schön formatieren, z. B. 64522 -> 64'522.–
  function formatiereBetrag(betrag) {
    return new Intl.NumberFormat('de-CH', { maximumFractionDigits: 0 }).format(betrag) + '.–';
  }

  function ladeBitcoinKurs() {
    const $button = $('#btn-btc');
    const $result = $('#btc-result');

    $button.prop('disabled', true).text('Kurs wird geladen …');
    $result.text('Lädt …');

    // Antwort sieht so aus: { "bitcoin": { "usd": 64522, "chf": 54312 } }
    $.getJSON(BTC_API_URL)
      .done(function (data) {
        const usd = data.bitcoin.usd;
        const chf = data.bitcoin.chf;
        const zeit = new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });

        $result.empty().addClass('has-data').append(
          $('<div>', { class: 'btc-row' }).append(
            $('<span>', { class: 'btc-label', text: 'USD' }),
            $('<span>', { class: 'btc-value', text: formatiereBetrag(usd) })
          ),
          $('<div>', { class: 'btc-row' }).append(
            $('<span>', { class: 'btc-label', text: 'CHF' }),
            $('<span>', { class: 'btc-value', text: formatiereBetrag(chf) })
          ),
          $('<div>', { class: 'btc-time', text: 'Stand ' + zeit + ' Uhr' })
        );
      })
      .fail(function () {
        $result.text('Kurs gerade nicht abrufbar. Vielleicht ist die API müde.');
      })
      .always(function () {
        $button.prop('disabled', false).text('Kurs aktualisieren');
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

  // Kleine Empfehlung fürs Dachfenster, je nach Wetter
  function dachfensterTipp(tmin, regen) {
    if (regen >= 1) return 'Dachfenster zu. Herbert mag keinen Regen von oben.';
    if (tmin < 5) return 'Nur kurz lüften, sonst friert der Plattenspieler.';
    return 'Dachfenster auf. Vielleicht siehst du heute Nacht den Stern.';
  }

  function ladeWetter() {
    const $button = $('#btn-weather');
    const $result = $('#weather-result');

    $button.prop('disabled', true).text('Wetter wird geladen …');
    $result.text('Lädt …');

    // Die Werte stecken in Arrays, ein Eintrag pro Tag: data.daily.temperature_2m_max[0]
    $.getJSON(WETTER_API_URL)
      .done(function (data) {
        const tmax = Math.round(data.daily.temperature_2m_max[0]);
        const tmin = Math.round(data.daily.temperature_2m_min[0]);
        const regen = data.daily.precipitation_sum[0];

        $result.empty().addClass('has-data').append(
          $('<div>', { class: 'wx-row' }).append(
            $('<span>', { class: 'wx-label', text: 'Ort' }),
            $('<span>', { class: 'wx-value', text: ORT })
          ),
          $('<div>', { class: 'wx-row' }).append(
            $('<span>', { class: 'wx-label', text: 'Heute' }),
            $('<span>', { class: 'wx-value', text: 'Tmax ' + tmax + '°C · Tmin ' + tmin + '°C' })
          ),
          $('<div>', { class: 'wx-row' }).append(
            $('<span>', { class: 'wx-label', text: 'Niederschlag' }),
            $('<span>', { class: 'wx-value', text: regen.toFixed(1) + ' mm' })
          ),
          $('<div>', { class: 'wx-tipp', text: dachfensterTipp(tmin, regen) })
        );
      })
      .fail(function () {
        $result.text('Wetter gerade nicht abrufbar. Schau einfach aus dem Dachfenster.');
      })
      .always(function () {
        $button.prop('disabled', false).text('Wetter aktualisieren');
      });
  }

  $('#btn-weather').on('click', ladeWetter);

  // =========================================================
  // c+) Für die Schnellen: Wetterverlauf 5 Tage mit HighCharts
  // =========================================================
  const VERLAUF_API_URL = 'https://api.open-meteo.com/v1/forecast?' + $.param({
    latitude: LAT,
    longitude: LON,
    hourly: 'temperature_2m,precipitation',
    forecast_days: 5,
    // ICON-CH1 rechnet nur rund 33 Stunden voraus, ICON-CH2 deckt alle 5 Tage ab
    models: 'meteoswiss_icon_ch2',
    timezone: 'Europe/Zurich'
  });

  // Deutsche Wochentage und Monate für die Achsenbeschriftung
  Highcharts.setOptions({
    lang: {
      weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
      shortWeekdays: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
      months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
      decimalPoint: '.',
      thousandsSep: "'"
    }
  });

  function ladeWetterVerlauf() {
    const $button = $('#btn-weather-chart');
    const $chart = $('#weather-chart');

    $button.prop('disabled', true).text('Verlauf wird geladen …');

    $.getJSON(VERLAUF_API_URL)
      .done(function (data) {
        // Zeiten ("2026-11-18T13:00") in Millisekunden umwandeln und mit den Werten paaren.
        // Die Zeiten sind schon Schweizer Ortszeit, darum als UTC behandeln (sonst verschiebt sich alles).
        const zeiten = data.hourly.time.map(function (t) { return Date.parse(t + ':00Z'); });
        const temperatur = zeiten.map(function (z, i) { return [z, data.hourly.temperature_2m[i]]; });
        const regen = zeiten.map(function (z, i) { return [z, data.hourly.precipitation[i]]; });

        $chart.removeClass('placeholder-box placeholder-chart').addClass('chart-live').empty();

        Highcharts.chart('weather-chart', {
          chart: { backgroundColor: 'transparent', style: { fontFamily: 'JetBrains Mono, monospace' } },
          title: { text: null },
          credits: { enabled: false },
          time: { useUTC: true },
          xAxis: {
            type: 'datetime',
            tickInterval: 24 * 3600 * 1000,
            labels: { format: '{value:%a %e.}' },
            gridLineWidth: 1,
            gridLineColor: '#e6dccb'
          },
          yAxis: [
            { title: { text: 'Temperatur °C' }, labels: { format: '{value}°' } },
            { title: { text: 'Niederschlag mm' }, opposite: true, min: 0, labels: { format: '{value}' } }
          ],
          tooltip: { shared: true, xDateFormat: '%A, %e. %B, %H:%M Uhr' },
          legend: { itemStyle: { fontWeight: 'normal' } },
          series: [
            { name: 'Niederschlag', type: 'column', yAxis: 1, data: regen, color: '#7fa7c9', tooltip: { valueSuffix: ' mm' }, pointPadding: 0, groupPadding: 0 },
            { name: 'Temperatur', type: 'spline', data: temperatur, color: '#b5542d', lineWidth: 2, marker: { enabled: false }, tooltip: { valueSuffix: ' °C' } }
          ]
        });
      })
      .fail(function () {
        $chart.text('Prognose gerade nicht abrufbar.');
      })
      .always(function () {
        $button.prop('disabled', false).text('Verlauf aktualisieren');
      });
  }

  $('#btn-weather-chart').on('click', ladeWetterVerlauf);

  // =========================================================
  // d) Die 5 nächstgelegenen Ladestationen (opendata.swiss / BFE)
  // =========================================================
  const LADE_API_URL = 'https://data.geo.admin.ch/ch.bfe.ladestellen-elektromobilitaet/data/ch.bfe.ladestellen-elektromobilitaet.json';
  const WINT_LAT = 47.4988; // Winterthur (hardcoded)
  const WINT_LON = 8.7237;
  const ANZAHL = 5;

  // Die Datei ist gross (rund 18'000 Ladepunkte). Wir laden sie nur einmal
  // und merken uns die aufbereitete Liste für alle weiteren Klicks.
  let ladestationen = null;

  // Abstand zwischen zwei Koordinaten in km (Haversine-Formel)
  function distanzKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Erdradius in km
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  // Rohdaten in eine einfache Liste umwandeln: ein Eintrag pro Standort
  function bereiteStationenAuf(data) {
    const standorte = {};

    // Aufbau: data.EVSEData = [ Betreiber, ... ], jeder Betreiber hat EVSEDataRecord = [ Ladepunkt, ... ]
    $.each(data.EVSEData, function (_, betreiber) {
      $.each(betreiber.EVSEDataRecord, function (_, punkt) {
        // Koordinaten stehen als Text "47.43958 9.006634" drin
        const teile = (punkt.GeoCoordinates && punkt.GeoCoordinates.Google || '').split(' ');
        const lat = parseFloat(teile[0]);
        const lon = parseFloat(teile[1]);
        if (isNaN(lat) || isNaN(lon)) return; // Eintrag ohne Koordinaten überspringen

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

  // Liste rendern. Jeder Eintrag merkt sich seine Koordinaten (für die Karte später).
  function zeigeStationen(stationen, mitDistanz) {
    const $liste = $('#charger-result').empty().addClass('has-data charger-list');

    $.each(stationen, function (_, s) {
      const details = [s.strasse, (s.plz + ' ' + s.ort).trim()].filter(Boolean).join(', ');
      const meta = [
        s.leistung ? s.leistung + ' kW' : null,
        s.anzahl > 1 ? s.anzahl + ' Ladepunkte' : '1 Ladepunkt',
        s.betreiber
      ].filter(Boolean).join(' · ');

      $('<li>', { 'data-lat': s.lat, 'data-lon': s.lon }).append(
        $('<div>', { class: 'charger-head' }).append(
          $('<strong>', { text: s.name }),
          mitDistanz ? $('<span>', { class: 'charger-km', text: s.distanz.toFixed(1) + ' km' }) : null
        ),
        $('<div>', { class: 'charger-addr', text: details }),
        $('<div>', { class: 'charger-meta', text: meta })
      ).appendTo($liste);
    });
  }

  // Daten holen (oder aus dem Speicher nehmen) und dann "weiter" ausführen
  function mitStationen(weiter) {
    if (ladestationen) {
      weiter();
      return;
    }
    $('#charger-result').removeClass('has-data charger-list').html('<li>Lade Daten vom Bund … (ca. 1 MB)</li>');

    $.getJSON(LADE_API_URL)
      .done(function (data) {
        ladestationen = bereiteStationenAuf(data);
        weiter();
      })
      .fail(function () {
        $('#charger-result').removeClass('has-data charger-list').html('<li>Daten gerade nicht abrufbar. Versuch es gleich nochmal.</li>');
      })
      .always(function () {
        $('#btn-charger').prop('disabled', false).text('Winterthur suchen');
        $('#btn-charger-plz').prop('disabled', false);
      });
  }

  // Standard: die 5 nächsten Stationen zu Winterthur
  function sucheBeiWinterthur() {
    $('#btn-charger').prop('disabled', true).text('Suche läuft …');

    mitStationen(function () {
      const naechste = ladestationen
        .map(function (s) { return $.extend({}, s, { distanz: distanzKm(WINT_LAT, WINT_LON, s.lat, s.lon) }); })
        .sort(function (a, b) { return a.distanz - b.distanz; })
        .slice(0, ANZAHL);

      $('#charger-info').text('Die ' + ANZAHL + ' nächsten Stationen ab Winterthur Zentrum');
      zeigeStationen(naechste, true);
      $('#btn-charger').prop('disabled', false).text('Winterthur suchen');
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
      $('#charger-info').text('Bitte eine Schweizer PLZ mit 4 Ziffern eingeben.');
      return;
    }
    $feld.removeClass('is-invalid');
    $('#btn-charger-plz').prop('disabled', true);

    mitStationen(function () {
      const treffer = ladestationen.filter(function (s) { return s.plz === plz; });

      if (treffer.length === 0) {
        $('#charger-info').text('Keine Ladestation mit PLZ ' + plz + ' gefunden.');
        $('#charger-result').removeClass('has-data charger-list').html('<li>Hier lädt wohl jeder zu Hause.</li>');
      } else {
        // Stärkste Stationen zuerst
        const beste = treffer.sort(function (a, b) { return b.leistung - a.leistung; }).slice(0, ANZAHL);
        const info = treffer.length === 1
          ? '1 Standort mit PLZ ' + plz + ':'
          : treffer.length + ' Standorte mit PLZ ' + plz + ', die ' + beste.length + ' stärksten:';
        $('#charger-info').text(info);
        zeigeStationen(beste, false);
      }
      $('#btn-charger-plz').prop('disabled', false);
    });
  }

  // =========================================================
  // e) Kartenausschnitt mit Leaflet und swisstopo-Karte
  // =========================================================
  const WOHNUNG_LAT = 47.3770; // die grüne Tür, Zürich Kreis 4 (fiktiv)
  const WOHNUNG_LON = 8.5280;
  const SUCH_API_URL = 'https://api3.geo.admin.ch/rest/services/api/SearchServer';

  let karte = null;   // Leaflet-Karte, wird beim ersten Klick erstellt
  let marker = null;  // Marker für Ortssuche und Ladestationen

  // Eigenes Marker-Icon in der Türfarbe
  function markerIcon(farbe) {
    return L.divIcon({
      className: 'map-pin',
      html: '<span style="background:' + farbe + '"></span>',
      iconSize: [22, 22],
      iconAnchor: [11, 22],
      popupAnchor: [0, -20]
    });
  }

  // Karte einmalig erstellen und auf die Wohnung zentrieren
  function erstelleKarte() {
    if (karte) return karte;

    $('#map').removeClass('placeholder-box placeholder-map').addClass('map-live').empty();

    karte = L.map('map').setView([WOHNUNG_LAT, WOHNUNG_LON], 16);

    // Kartenkacheln von swisstopo (geo.admin.ch), frei nutzbar mit Quellenangabe
    L.tileLayer('https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg', {
      maxZoom: 18,
      attribution: '© <a href="https://www.swisstopo.admin.ch" target="_blank" rel="noopener">swisstopo</a>'
    }).addTo(karte);

    L.marker([WOHNUNG_LAT, WOHNUNG_LON], { icon: markerIcon('#2f5d46') })
      .addTo(karte)
      .bindPopup('<strong>Wohnung 4b</strong><br>Grüne Tür, leicht anheben.')
      .openPopup();

    return karte;
  }

  // Karte auf einen Punkt zentrieren und dort einen Marker setzen
  function zeigeAufKarte(lat, lon, titel, zoom) {
    erstelleKarte();
    if (marker) karte.removeLayer(marker);

    marker = L.marker([lat, lon], { icon: markerIcon('#b5542d') })
      .addTo(karte)
      .bindPopup($('<div>').text(titel).html()) // Text sicher escapen
      .openPopup();

    karte.setView([lat, lon], zoom || 15);
  }

  // Button: Karte zeigen bzw. zurück zur Wohnung
  $('#btn-map').on('click', function () {
    erstelleKarte();
    if (marker) { karte.removeLayer(marker); marker = null; }
    karte.setView([WOHNUNG_LAT, WOHNUNG_LON], 16);
    $('#map-info').text('Die grüne Tür liegt genau in der Mitte.');
    $(this).text('Zurück zur Wohnung');
  });

  // Für die Schnellen: Ort suchen über die Such-API von geo.admin.ch
  $('#map-search-form').on('submit', function (event) {
    event.preventDefault();
    const $feld = $('#map-search');
    const suchtext = $feld.val().trim();

    if (suchtext.length < 2) {
      $feld.addClass('is-invalid');
      $('#map-info').text('Bitte mindestens 2 Zeichen eingeben.');
      return;
    }
    $feld.removeClass('is-invalid');
    $('#btn-map-search').prop('disabled', true);
    $('#map-info').text('Suche „' + suchtext + '“ …');

    $.getJSON(SUCH_API_URL, { searchText: suchtext, type: 'locations', sr: 4326, limit: 1 })
      .done(function (data) {
        if (!data.results || data.results.length === 0) {
          $('#map-info').text('Keinen Ort „' + suchtext + '“ gefunden.');
          return;
        }
        const ort = data.results[0].attrs;
        // Das Label enthält HTML-Tags wie <b>, die entfernen wir
        const name = ort.label.replace(/<[^>]*>/g, '');
        zeigeAufKarte(ort.lat, ort.lon, name, 13);
        $('#map-info').text('Gefunden: ' + name);
      })
      .fail(function () {
        $('#map-info').text('Suche gerade nicht möglich. Versuch es gleich nochmal.');
      })
      .always(function () {
        $('#btn-map-search').prop('disabled', false);
      });
  });
  $('#map-search').on('input', function () { $(this).removeClass('is-invalid'); });

  // Advanced: Klick auf eine Ladestation zeigt sie auf der Karte
  $('#charger-result').on('click', 'li[data-lat]', function () {
    const $eintrag = $(this);
    const name = $eintrag.find('strong').text();

    zeigeAufKarte(parseFloat($eintrag.data('lat')), parseFloat($eintrag.data('lon')), 'Ladestation: ' + name, 17);
    $('#map-info').text('Ladestation: ' + name);
    $('#charger-result li').removeClass('is-active');
    $eintrag.addClass('is-active');

    // Auf kleinen Bildschirmen zur Karte scrollen
    document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  $('#btn-charger').on('click', sucheBeiWinterthur);
  $('#charger-plz-form').on('submit', sucheNachPlz);
  $('#charger-plz').on('input', function () { $(this).removeClass('is-invalid'); });

  // =========================================================
  // Buchungsformular
  // =========================================================
  const PREIS_NACHT = 118;
  const REINIGUNG = 40;
  const MIN_NAECHTE = 2;
  // Hier kommt später die URL von webhook.site rein. Leer = nur lokal anzeigen.
  const WEBHOOK_URL = '';

  const $form = $('#anfrage');
  const $anreise = $('#anreise');
  const $abreise = $('#abreise');

  // Datum als "YYYY-MM-DD" (Format von <input type="date">)
  function isoDatum(datum) {
    return datum.toISOString().slice(0, 10);
  }
  function plusTage(iso, tage) {
    const d = new Date(iso + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + tage);
    return isoDatum(d);
  }
  function naechteZwischen(von, bis) {
    if (!von || !bis) return 0;
    return Math.round((Date.parse(bis) - Date.parse(von)) / 86400000);
  }
  function chf(betrag) {
    return 'CHF ' + new Intl.NumberFormat('de-CH').format(betrag) + '.–';
  }

  // Frühestes Anreisedatum ist heute, Abreise mindestens 2 Nächte später
  const heute = isoDatum(new Date());
  $anreise.attr('min', heute);
  $abreise.attr('min', plusTage(heute, MIN_NAECHTE));

  // Zusammenfassung und Datumsprüfung bei jeder Änderung aktualisieren
  function aktualisiereBuchung() {
    const von = $anreise.val();
    const bis = $abreise.val();
    if (von) $abreise.attr('min', plusTage(von, MIN_NAECHTE));

    const naechte = naechteZwischen(von, bis);

    // Eigene Regel: mindestens 2 Nächte. setCustomValidity macht das Feld ungültig.
    if (von && bis && naechte < MIN_NAECHTE) {
      $abreise[0].setCustomValidity('mindestens 2 Nächte');
    } else {
      $abreise[0].setCustomValidity('');
    }

    if (naechte >= MIN_NAECHTE) {
      $('#sum-naechte').text(naechte);
      $('#sum-miete').text(chf(naechte * PREIS_NACHT));
      $('#sum-total').text(chf(naechte * PREIS_NACHT + REINIGUNG));
      $('#sum-bonus')
        .toggleClass('is-earned', naechte >= 7)
        .text(naechte >= 7 ? 'Bonus: Du darfst dir eine Platte aussuchen.' : 'Noch ' + (7 - naechte) + ' Nächte bis zur Gratis-Platte.');
    } else {
      $('#sum-naechte, #sum-miete, #sum-total').text('–');
      $('#sum-bonus').removeClass('is-earned').text('Ab 7 Nächten: eine Platte geschenkt.');
    }
  }
  $anreise.add($abreise).on('change input', aktualisiereBuchung);

  // Zeichen zählen im Nachrichtenfeld
  $('#nachricht').on('input', function () {
    $('#nachricht-zaehler').text($(this).val().length);
  });

  // Absenden: erst prüfen (Bootstrap-Validierung), dann senden oder anzeigen
  $form.on('submit', function (event) {
    event.preventDefault();
    aktualisiereBuchung();

    if (!this.checkValidity()) {
      $form.addClass('was-validated');
      // Zum ersten Fehler springen
      const $erster = $form.find('input:invalid, select:invalid, textarea:invalid').first();
      $erster.trigger('focus');
      zeigeToast('Fast. Ein paar Felder brauchen noch Liebe.');
      return;
    }

    // Formulardaten als Objekt sammeln
    const daten = {};
    $.each($form.serializeArray(), function (_, feld) { daten[feld.name] = feld.value.trim(); });
    daten.naechte = naechteZwischen(daten.anreise, daten.abreise);
    daten.total_chf = daten.naechte * PREIS_NACHT + REINIGUNG;

    const $button = $('#btn-senden').prop('disabled', true);

    function fertig() {
      zeigeToast('Danke, ' + daten.vorname + '! Wir melden uns per ' + daten.kontaktart + '.');
      $form[0].reset();
      $form.removeClass('was-validated');
      $('#nachricht-zaehler').text(0);
      aktualisiereBuchung();
      $button.prop('disabled', false);
    }

    if (!WEBHOOK_URL) {
      // Noch kein Backend: Daten nur in der Konsole zeigen
      console.log('Buchungsanfrage (noch nicht gesendet):', daten);
      fertig();
      return;
    }

    // POST an den Webhook (Aufgabe "Formular an Backend anbinden")
    $.post(WEBHOOK_URL, daten)
      .done(fertig)
      .fail(function () {
        zeigeToast('Senden hat nicht geklappt. Versuch es gleich nochmal.');
        $button.prop('disabled', false);
      });
  });
});
