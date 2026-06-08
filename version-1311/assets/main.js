(function () {
    const header = document.querySelector('[data-site-header]');
    const menuToggle = document.querySelector('[data-menu-toggle]');
    const navPanel = document.querySelector('[data-nav-panel]');

    function updateHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 12);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (menuToggle && navPanel) {
        menuToggle.addEventListener('click', function () {
            navPanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-scroll-player]').forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const player = document.querySelector('.player-card');
            if (player) {
                player.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    const slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        const prev = slider.querySelector('[data-hero-prev]');
        const next = slider.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        function setSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function go(step) {
            setSlide(current + step);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                go(1);
            }, 5000);
        }

        if (slides.length > 0) {
            setSlide(0);
            restart();
        }
        if (prev) {
            prev.addEventListener('click', function () {
                go(-1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                go(1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });
    }

    const grid = document.querySelector('[data-filter-grid]');
    const panel = document.querySelector('[data-filter-panel]');
    if (grid && panel) {
        const cards = Array.from(grid.querySelectorAll('[data-movie-card]'));
        const queryInput = panel.querySelector('[data-search-input]');
        const categoryFilter = panel.querySelector('[data-category-filter]');
        const yearFilter = panel.querySelector('[data-year-filter]');
        const regionFilter = panel.querySelector('[data-region-filter]');
        const count = document.querySelector('[data-filter-count]');
        const empty = document.querySelector('[data-empty-state]');
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q');

        if (queryInput && initialQuery) {
            queryInput.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            const q = normalize(queryInput ? queryInput.value : '');
            const category = categoryFilter ? categoryFilter.value : 'all';
            const year = yearFilter ? yearFilter.value : 'all';
            const region = normalize(regionFilter ? regionFilter.value : '');
            let visible = 0;

            cards.forEach(function (card) {
                const text = normalize(card.getAttribute('data-search-text'));
                const cardCategory = card.getAttribute('data-card-category') || '';
                const cardYear = Number(card.getAttribute('data-card-year') || 0);
                const cardRegion = normalize(card.getAttribute('data-card-region'));
                const matchesQuery = !q || text.indexOf(q) !== -1;
                const matchesCategory = category === 'all' || cardCategory === category;
                const matchesYear = year === 'all' || cardYear >= Number(year);
                const matchesRegion = !region || cardRegion.indexOf(region) !== -1;
                const show = matchesQuery && matchesCategory && matchesYear && matchesRegion;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '当前显示 ' + visible + ' 部影片';
            }
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [queryInput, categoryFilter, yearFilter, regionFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }
}());