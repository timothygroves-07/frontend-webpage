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

  // Anfrage-Button: Formular folgt später
  $('#btn-anfrage').on('click', function () {
    zeigeToast('Danke! Das Formular kommt bald. Die Tür freut sich schon.');
  });
});
