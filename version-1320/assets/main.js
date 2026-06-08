(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function cardText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags')
    ].join(' ').toLowerCase();
  }

  function filterCards(area, keyword, region, year, type) {
    var cards = Array.prototype.slice.call(area.querySelectorAll('.movie-card'));
    var query = (keyword || '').trim().toLowerCase();

    cards.forEach(function (card) {
      var matchesText = !query || cardText(card).indexOf(query) !== -1;
      var matchesRegion = !region || card.getAttribute('data-region') === region;
      var matchesYear = !year || card.getAttribute('data-year') === year;
      var typeText = card.querySelector('.poster-type');
      var matchesType = !type || (typeText && typeText.textContent.trim() === type);

      card.hidden = !(matchesText && matchesRegion && matchesYear && matchesType);
    });
  }

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage) {
    var params = new URLSearchParams(window.location.search);
    var area = searchPage.querySelector('[data-card-area]');
    var input = searchPage.querySelector('[data-search-input]');
    var regionSelect = searchPage.querySelector('[data-filter-region]');
    var yearSelect = searchPage.querySelector('[data-filter-year]');
    var typeSelect = searchPage.querySelector('[data-filter-type]');
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function runSearch() {
      filterCards(
        area,
        input ? input.value : '',
        regionSelect ? regionSelect.value : '',
        yearSelect ? yearSelect.value : '',
        typeSelect ? typeSelect.value : ''
      );
    }

    [input, regionSelect, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', runSearch);
        control.addEventListener('change', runSearch);
      }
    });

    if (area) {
      runSearch();
    }
  }

  var listPage = document.querySelector('[data-list-page]');

  if (listPage) {
    var listArea = listPage.querySelector('[data-card-area]');
    var listInput = listPage.querySelector('[data-list-search]');

    if (listArea && listInput) {
      listInput.addEventListener('input', function () {
        filterCards(listArea, listInput.value, '', '', '');
      });
    }
  }

  function playVideo(stage) {
    var video = stage.querySelector('video');
    var overlay = stage.querySelector('.watch-overlay');
    var message = stage.querySelector('.watch-message');
    var stream = stage.getAttribute('data-stream');

    if (!video || !stream) {
      return;
    }

    if (message) {
      message.textContent = '';
    }

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    function start() {
      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          if (message) {
            message.textContent = '点击视频继续播放';
          }
        });
      }
    }

    if (video.getAttribute('data-ready') === 'true') {
      start();
      return;
    }

    video.setAttribute('data-ready', 'true');

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, start);
      hls.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          if (message) {
            message.textContent = '播放加载失败，请稍后重试';
          }
          hls.destroy();
        }
      });
      stage.__player = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.addEventListener('loadedmetadata', start, { once: true });
      video.load();
    } else {
      if (message) {
        message.textContent = '视频暂时无法播放';
      }
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.watch-stage')).forEach(function (stage) {
    var overlay = stage.querySelector('.watch-overlay');
    var video = stage.querySelector('video');

    if (overlay) {
      overlay.addEventListener('click', function () {
        playVideo(stage);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.getAttribute('data-ready') !== 'true') {
          playVideo(stage);
        }
      });
    }
  });
})();
