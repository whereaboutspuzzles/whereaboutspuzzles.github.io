/* The email signup (AL-018): every form marked data-signup posts the address to MailerLite, our newsletter service
   (Datenschutzerklärung, section 5), and shows the answer on the page. Nothing is loaded from MailerLite: no script,
   no style sheet, no picture. MailerLite then sends its confirmation email (double opt-in); the case follows once
   the reader clicks the link in it. Without JavaScript the form still posts, and MailerLite shows a plain reply. */
(function () {
  // The page's language says which words (AL-135): German on the German pages, English everywhere else.
  var de = document.documentElement.lang === 'de';
  var T = de ? {
    empty: 'Bitte gib deine E-Mail-Adresse ein, etwa name@example.com.',
    sending: 'Wird gesendet …',
    done: 'Fast geschafft: Wir haben dir eine E-Mail geschickt. Klick auf den Link darin, um zu bestätigen, dann kommt dein Fall sofort.',
    refused: 'Diese Adresse hat nicht funktioniert. Bitte prüf sie und versuch es noch einmal.',
    failed: 'Unterwegs ist etwas schiefgegangen. Bitte versuch es in einer Minute noch einmal.'
  } : {
    empty: 'Please enter your email address, like name@example.com.',
    sending: 'Sending ...',
    done: 'Almost there: we have sent you an email. Click the link in it to confirm, and your case follows right away.',
    refused: 'That address did not work. Please check it and try again.',
    failed: 'Something went wrong on the way. Please try again in a minute.'
  };
  var forms = document.querySelectorAll('form[data-signup]');
  Array.prototype.forEach.call(forms, function (form) {
    var status = form.querySelector('.status');
    var button = form.querySelector('button');
    var input = form.querySelector('input[type="email"]');
    function say(text, done) {
      status.textContent = text;
      form.classList.toggle('done', !!done);
    }
    form.addEventListener('submit', function (event) {
      if (!window.fetch || !window.FormData) return; // an old browser: let the form post the usual way
      event.preventDefault();
      if (!input.value || !input.checkValidity()) {
        say(T.empty);
        input.focus();
        return;
      }
      button.disabled = true;
      say(T.sending);
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (response) { return response.json(); })
        .then(function (reply) {
          if (reply && reply.success) {
            form.querySelector('.row').hidden = true;
            say(T.done, true);
          } else {
            button.disabled = false;
            say(T.refused);
            input.focus();
          }
        })
        .catch(function () {
          button.disabled = false;
          say(T.failed);
        });
    });
  });
})();
