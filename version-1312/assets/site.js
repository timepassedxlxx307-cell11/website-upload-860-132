(function () {
  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var toggle = select('[data-menu-toggle]');
    var panel = select('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initImages() {
    selectAll('img[data-poster-title]').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('poster-hidden');
      }, { once: true });
    });
  }

  function initHero() {
    var hero = select('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }
  }

  function initCardFilters() {
    selectAll('[data-card-filter]').forEach(function (panel) {
      var section = panel.closest('.content-section') || document;
      var list = select('[data-card-list]', section.parentNode || document) || select('[data-card-list]');
      var summary = select('[data-filter-summary]', section.parentNode || document) || select('[data-filter-summary]');
      var textInput = select('[data-filter-text]', panel);
      var yearInput = select('[data-filter-year]', panel);
      var regionInput = select('[data-filter-region]', panel);
      var cards = selectAll('[data-movie-card]', list);

      function apply() {
        var keyword = normalize(textInput && textInput.value);
        var year = normalize(yearInput && yearInput.value);
        var region = normalize(regionInput && regionInput.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-channel')
          ].join(' '));
          var match = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            match = false;
          }
          if (year && normalize(card.getAttribute('data-year')) !== year) {
            match = false;
          }
          if (region && normalize(card.getAttribute('data-region')) !== region) {
            match = false;
          }
          card.classList.toggle('hidden-card', !match);
          if (match) {
            visible += 1;
          }
        });
        if (summary) {
          summary.textContent = visible ? '已显示匹配影片' : '没有找到匹配影片';
        }
      }

      [textInput, yearInput, regionInput].forEach(function (input) {
        if (input) {
          input.addEventListener('input', apply);
          input.addEventListener('change', apply);
        }
      });
    });
  }

  function movieCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card" data-movie-card>',
      '<a class="card-link" href="' + escapeHtml(item.url) + '" aria-label="' + escapeHtml(item.title) + '">',
      '<div class="poster-frame">',
      '<img class="poster-img" src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" data-poster-title="' + escapeHtml(item.title) + '">',
      '<div class="poster-fallback"><strong>' + escapeHtml(shorten(item.title, 20)) + '</strong><span>' + escapeHtml(shorten(item.genre, 18)) + '</span></div>',
      '<div class="poster-shade"><span class="play-dot">▶</span></div>',
      '</div>',
      '<div class="card-body">',
      '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>★ ' + escapeHtml(item.rating) + '</span></div>',
      '<h3>' + escapeHtml(item.title) + '</h3>',
      '<p>' + escapeHtml(shorten(item.description, 72)) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (match) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[match];
    });
  }

  function shorten(value, limit) {
    value = String(value || '').trim();
    return value.length > limit ? value.slice(0, limit - 1) + '…' : value;
  }

  function initSearchPage() {
    var page = select('[data-search-page]');
    if (!page || !window.MOVIE_INDEX) {
      return;
    }
    var form = select('[data-search-form]', page);
    var input = select('[data-search-input]', page);
    var channel = select('[data-search-channel]', page);
    var year = select('[data-search-year]', page);
    var summary = select('[data-search-summary]', page);
    var results = select('[data-search-results]', page);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    var years = Array.from(new Set(window.MOVIE_INDEX.map(function (item) { return item.year; }).filter(Boolean))).sort().reverse();
    years.slice(0, 40).forEach(function (y) {
      var option = document.createElement('option');
      option.value = y;
      option.textContent = y;
      year.appendChild(option);
    });

    function render() {
      var keyword = normalize(input.value);
      var channelValue = normalize(channel.value);
      var yearValue = normalize(year.value);
      var matches = window.MOVIE_INDEX.filter(function (item) {
        var text = normalize([item.title, item.region, item.genre, item.channel, (item.tags || []).join(' ')].join(' '));
        if (keyword && text.indexOf(keyword) === -1) {
          return false;
        }
        if (channelValue && normalize(item.channel) !== channelValue) {
          return false;
        }
        if (yearValue && normalize(item.year) !== yearValue) {
          return false;
        }
        return true;
      }).slice(0, 96);
      results.innerHTML = matches.length ? matches.map(movieCard).join('') : '<div class="empty-state"><h2>没有找到匹配影片</h2><p>换个关键词继续搜索。</p></div>';
      summary.textContent = matches.length ? '已显示匹配影片' : '没有找到匹配影片';
      initImages();
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var next = new URL(window.location.href);
      next.searchParams.set('q', input.value.trim());
      history.replaceState(null, '', next.toString());
      render();
    });
    [input, channel, year].forEach(function (control) {
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    });
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initImages();
    initHero();
    initCardFilters();
    initSearchPage();
  });
}());
