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

  $('#btn-charger').on('click', sucheBeiWinterthur);
  $('#charger-plz-form').on('submit', sucheNachPlz);
  $('#charger-plz').on('input', function () { $(this).removeClass('is-invalid'); });

  // Anfrage-Button: Formular folgt später
  $('#btn-anfrage').on('click', function () {
    zeigeToast('Danke! Das Formular kommt bald. Die Tür freut sich schon.');
  });
});
