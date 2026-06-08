(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initHeader() {
    var header = document.querySelector('.js-site-header');
    if (!header) {
      return;
    }
    var update = function () {
      if (window.scrollY > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', menu.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.js-hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.js-hero-dot'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    var show = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
      });
    };
    var start = function () {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };
    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(position);
        start();
      });
    });
    show(0);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var year = panel.querySelector('[data-filter-year]');
      var type = panel.querySelector('[data-filter-type]');
      var scope = document.querySelector(panel.getAttribute('data-filter-panel')) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.js-filter-card'));
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q') || '';
      if (input && initial) {
        input.value = initial;
      }
      var apply = function () {
        var term = input ? input.value.trim().toLowerCase() : '';
        var selectedYear = year ? year.value : '';
        var selectedType = type ? type.value : '';
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-tags') || '',
            card.textContent || ''
          ].join(' ').toLowerCase();
          var matchTerm = !term || text.indexOf(term) !== -1;
          var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
          var matchType = !selectedType || card.getAttribute('data-type') === selectedType;
          card.classList.toggle('hidden-by-filter', !(matchTerm && matchYear && matchType));
        });
      };
      [input, year, type].forEach(function (element) {
        if (element) {
          element.addEventListener('input', apply);
          element.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function initSearchForms() {
    Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var target = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
        window.location.href = target;
      });
    });
  }

  window.moviePlayerStart = function (url) {
    var video = document.querySelector('[data-video-player]');
    var overlay = document.querySelector('[data-play-layer]');
    if (!video || !overlay || !url) {
      return;
    }
    var prepared = false;
    var hlsInstance = null;
    var mount = function () {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
    };
    var start = function () {
      mount();
      overlay.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      window.setTimeout(function () {
        var playRequest = video.play();
        if (playRequest && playRequest.catch) {
          playRequest.catch(function () {});
        }
      }, 180);
    };
    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!prepared || video.paused) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    initHeader();
    initMobileMenu();
    initHero();
    initFilters();
    initSearchForms();
  });
})();
