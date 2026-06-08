(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var nav = document.querySelector("[data-main-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function collectOptions(cards, name) {
    var values = {};

    cards.forEach(function (card) {
      var value = card.getAttribute("data-" + name);
      if (value) {
        values[value] = true;
      }
    });

    return Object.keys(values).sort(function (a, b) {
      return String(b).localeCompare(String(a), "zh-CN");
    });
  }

  function populateSelect(select, cards, name) {
    if (!select || select.options.length > 1) {
      return;
    }

    collectOptions(cards, name).forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var list = document.querySelector("[data-filter-list]");

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.children);
    var input = document.querySelector("[data-filter-input]");
    var count = document.querySelector("[data-filter-count]");
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));

    selects.forEach(function (select) {
      populateSelect(select, cards, select.getAttribute("data-filter-select"));
    });

    function apply() {
      var keyword = normalize(input && input.value);
      var activeFilters = {};

      selects.forEach(function (select) {
        var key = select.getAttribute("data-filter-select");
        var value = normalize(select.value);
        if (value) {
          activeFilters[key] = value;
        }
      });

      var visible = 0;

      cards.forEach(function (card) {
        var search = normalize(card.getAttribute("data-search") || card.textContent);
        var matched = !keyword || search.indexOf(keyword) !== -1;

        Object.keys(activeFilters).forEach(function (key) {
          if (normalize(card.getAttribute("data-" + key)) !== activeFilters[key]) {
            matched = false;
          }
        });

        card.classList.toggle("is-hidden-by-filter", !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "当前显示 " + visible + " 部 / 共 " + cards.length + " 部";
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }

    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });

    apply();
  }

  function initHomeSearch() {
    var input = document.querySelector("[data-home-search]");

    if (!input) {
      return;
    }

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        var query = encodeURIComponent(input.value.trim());
        window.location.href = "search.html" + (query ? "?q=" + query : "");
      }
    });
  }

  function initSearchQueryFromUrl() {
    var input = document.querySelector("[data-filter-input]");

    if (!input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query) {
      input.value = query;
      input.dispatchEvent(new Event("input"));
    }
  }

  function initImageFallback() {
    Array.prototype.slice.call(document.images).forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-missing");
        image.removeAttribute("src");
      }, { once: true });
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
    initHomeSearch();
    initSearchQueryFromUrl();
    initImageFallback();
  });
}());
