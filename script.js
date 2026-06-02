document.addEventListener('DOMContentLoaded', function () {
  // ── Hamburger menu ──
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

  // ── FAQ accordion ──
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      q.parentElement.classList.toggle('open');
    });
  });

  // ── Casino filter ──
  var activeFilters = {};

  document.querySelectorAll('.filter-btn[data-filter]').forEach(function (filterBtn) {
    filterBtn.addEventListener('click', function () {
      var group = filterBtn.dataset.group;
      var filter = filterBtn.dataset.filter;

      document.querySelectorAll('.filter-btn[data-group="' + group + '"]').forEach(function (b) {
        b.classList.remove('active');
      });
      filterBtn.classList.add('active');

      if (filter === 'all') {
        delete activeFilters[group];
      } else {
        activeFilters[group] = filter;
      }

      applyFilters();
    });
  });

  function applyFilters() {
    var cards = document.querySelectorAll('.casino-card[data-tags]');
    var visible = 0;

    cards.forEach(function (card) {
      var tags = card.dataset.tags ? card.dataset.tags.split(',') : [];
      var show = true;

      Object.keys(activeFilters).forEach(function (group) {
        if (tags.indexOf(activeFilters[group]) === -1) show = false;
      });

      card.classList.toggle('hidden', !show);
      if (show) visible++;
    });

    var results = document.querySelector('.filter-results');
    if (results) {
      results.textContent = visible + (visible === 1 ? ' casino encontrado' : ' casinos encontrados');
    }
  }

  // ── Email form ──
  var emailForm = document.querySelector('.email-form');
  if (emailForm) {
    emailForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = emailForm.querySelector('.email-input');
      var submitBtn = emailForm.querySelector('.email-submit');
      if (input && input.value) {
        submitBtn.textContent = '¡Suscrito! ✓';
        submitBtn.style.background = 'var(--green)';
        input.value = '';
        input.disabled = true;
        submitBtn.disabled = true;
      }
    });
  }
});
