document.addEventListener('DOMContentLoaded', function () {
  var btn = document.querySelector('.hamburger');
  var nav = document.querySelector('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.classList.toggle('open');
      nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(!expanded));
    });
  }

  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      q.parentElement.classList.toggle('open');
    });
  });
});
