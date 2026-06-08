(function () {
  var header = document.getElementById("site-header");
  var toggle = document.querySelector("[data-mobile-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (toggle && mobileNav && header) {
    toggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("open");
      header.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  var backTop = document.querySelector("[data-back-top]");
  if (backTop) {
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var slider = document.querySelector("[data-hero-slider]");
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
  scopes.forEach(function (scope) {
    var input = scope.querySelector("[data-filter-input]");
    var cardsRoot = scope.parentElement ? scope.parentElement.querySelector(".card-grid") : null;
    var cards = cardsRoot ? Array.prototype.slice.call(cardsRoot.querySelectorAll(".filter-card")) : [];
    var empty = scope.parentElement ? scope.parentElement.querySelector("[data-empty-state]") : null;
    var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));

    function includesText(value, key) {
      return String(value || "").toLowerCase().indexOf(key) !== -1;
    }

    function matchSelect(card, type, value) {
      if (!value) {
        return true;
      }
      if (type === "category") {
        return card.dataset.category === value || includesText(card.dataset.genre, value) || includesText(card.dataset.tags, value);
      }
      return includesText(card.dataset[type], value);
    }

    if (!cards.length && input) {
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && input.value.trim()) {
          window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
        }
      });
    }

    var params = new URLSearchParams(window.location.search);
    var preset = params.get("q");
    if (preset && input) {
      input.value = preset;
    }

    function filter() {
      var key = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.textContent
        ].join(" ").toLowerCase();
        var ok = !key || haystack.indexOf(key) !== -1;
        selects.forEach(function (select) {
          ok = ok && matchSelect(card, select.getAttribute("data-filter-select"), select.value);
        });
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", filter);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", filter);
    });
    filter();
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById("movie-player");
  var startButton = document.getElementById("player-start");
  if (!video || !startButton || !streamUrl) {
    return;
  }

  var hlsInstance = null;
  var attached = false;

  function attach() {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function play() {
    attach();
    startButton.classList.add("hidden");
    var attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        startButton.classList.remove("hidden");
      });
    }
  }

  startButton.addEventListener("click", play);
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener("play", function () {
    startButton.classList.add("hidden");
  });
  video.addEventListener("pause", function () {
    if (!video.ended) {
      startButton.classList.remove("hidden");
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
