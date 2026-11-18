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

  // Anfrage-Button: Formular folgt später
  $('#btn-anfrage').on('click', function () {
    zeigeToast('Danke! Das Formular kommt bald. Die Tür freut sich schon.');
  });
});
