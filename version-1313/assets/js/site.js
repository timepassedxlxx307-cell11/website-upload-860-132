
(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.from((scope || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var button = qs('[data-mobile-menu-button]');
        var menu = qs('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function getQueryParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function initFilters() {
        var form = qs('[data-filter-form]');
        var container = qs('[data-card-container]');
        if (!form || !container) {
            return;
        }
        var cards = qsa('[data-movie-card]', container);
        var input = qs('[data-filter-input]', form);
        var category = qs('[data-filter-category]', form);
        var year = qs('[data-filter-year]', form);
        var sort = qs('[data-filter-sort]', form);
        var resultCount = qs('[data-result-count]');
        var empty = qs('[data-empty-results]');
        var initialQuery = getQueryParam('q');

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function matchesYear(card, value) {
            if (!value || value === 'all') {
                return true;
            }
            var cardYear = card.getAttribute('data-year') || '';
            var numericYear = Number((cardYear.match(/\d{4}/) || ['0'])[0]);
            if (value === '2021') {
                return numericYear <= 2021;
            }
            return cardYear.indexOf(value) !== -1;
        }

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var categoryValue = category ? category.value : 'all';
            var yearValue = year ? year.value : 'all';
            var sortValue = sort ? sort.value : 'default';
            var visible = [];

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var okCategory = categoryValue === 'all' || card.getAttribute('data-category') === categoryValue;
                var okYear = matchesYear(card, yearValue);
                var ok = okKeyword && okCategory && okYear;
                card.hidden = !ok;
                if (ok) {
                    visible.push(card);
                }
            });

            visible.sort(function (a, b) {
                if (sortValue === 'rating') {
                    return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
                }
                if (sortValue === 'views') {
                    return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
                }
                if (sortValue === 'year') {
                    return Number((b.getAttribute('data-year').match(/\d{4}/) || ['0'])[0]) - Number((a.getAttribute('data-year').match(/\d{4}/) || ['0'])[0]);
                }
                return 0;
            });

            visible.forEach(function (card) {
                container.appendChild(card);
            });

            if (resultCount) {
                resultCount.textContent = visible.length + ' 部影片';
            }
            if (empty) {
                empty.hidden = visible.length > 0;
            }
        }

        form.addEventListener('input', apply);
        form.addEventListener('change', apply);
        form.addEventListener('reset', function () {
            window.setTimeout(apply, 0);
        });
        apply();
    }

    function initImageFallbackClass() {
        qsa('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('image-unavailable');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initFilters();
        initImageFallbackClass();
    });
}());
