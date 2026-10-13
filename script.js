(() => {
    'use strict';

    const header = document.querySelector('.site-header');
    const menuButton = document.querySelector('.menu-toggle');
    const navigation = document.getElementById('primary-navigation');
    const navLinks = [...document.querySelectorAll('.nav-link[href^="#"]')];
    const sections = navLinks.map(link => ({
        link,
        section: document.getElementById(link.getAttribute('href').slice(1)),
    })).filter(item => item.section);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const setMenuOpen = open => {
        if (!menuButton || !navigation) return;
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        navigation.classList.toggle('is-open', open);
    };

    if (menuButton && navigation) {
        menuButton.addEventListener('click', () => {
            setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
        });

        navigation.addEventListener('click', event => {
            if (event.target.closest('a')) setMenuOpen(false);
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
                setMenuOpen(false);
                menuButton.focus();
            }
        });

        document.addEventListener('click', event => {
            if (!navigation.contains(event.target) && !menuButton.contains(event.target)) {
                setMenuOpen(false);
            }
        });

        setMenuOpen(false);
        header?.classList.add('has-menu');
    }

    let scrollFrame = null;

    const updateScrollState = () => {
        scrollFrame = null;
        header?.classList.toggle('is-scrolled', window.scrollY > 24);
        if (!sections.length) return;

        const readingLine = Math.max((header?.offsetHeight || 0) + 32, window.innerHeight * 0.3);
        let activeSection = sections[0];

        for (const item of sections) {
            if (item.section.getBoundingClientRect().top <= readingLine) activeSection = item;
        }

        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
            activeSection = sections[sections.length - 1];
        }

        for (const item of sections) {
            if (item === activeSection) item.link.setAttribute('aria-current', 'location');
            else item.link.removeAttribute('aria-current');
        }
    };

    const queueScrollUpdate = () => {
        if (scrollFrame === null) scrollFrame = window.requestAnimationFrame(updateScrollState);
    };

    window.addEventListener('scroll', queueScrollUpdate, { passive: true });
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 900) setMenuOpen(false);
        queueScrollUpdate();
    });
    window.addEventListener('load', queueScrollUpdate, { once: true });
    updateScrollState();

    const revealElements = [...document.querySelectorAll('[data-reveal]')];
    let revealObserver;

    const showAllReveals = () => {
        revealObserver?.disconnect();
        revealElements.forEach(element => {
            element.classList.remove('reveal-ready');
            element.classList.add('is-visible');
        });
    };

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
        showAllReveals();
    } else {
        try {
            revealObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                });
            }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

            revealElements.forEach(element => {
                element.classList.add('reveal-ready');
                revealObserver.observe(element);
            });
        } catch {
            showAllReveals();
        }
    }

    reducedMotion.addEventListener?.('change', event => {
        if (event.matches) showAllReveals();
    });

    const projectGrid = document.getElementById('projects-grid');
    const projectCards = [...(projectGrid?.querySelectorAll('.project-card[data-category]') || [])];
    const filterButtons = [...document.querySelectorAll('[data-filter]')];
    const projectsStatus = document.getElementById('projects-status');

    const filterProjects = (filter, revealImmediately = true) => {
        let visibleCount = 0;

        projectCards.forEach(card => {
            const visible = filter === 'all' || card.dataset.category === filter;
            card.hidden = !visible;
            if (!visible) return;
            visibleCount += 1;

            if (revealImmediately) {
                card.classList.add('is-visible');
                revealObserver?.unobserve(card);
                card.querySelectorAll('[data-reveal]').forEach(element => {
                    element.classList.add('is-visible');
                    revealObserver?.unobserve(element);
                });
            }
        });

        filterButtons.forEach(button => {
            const active = button.dataset.filter === filter;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
        });

        if (projectsStatus) {
            projectsStatus.textContent = `${visibleCount} ${visibleCount === 1 ? 'projeto' : 'projetos'}`;
        }
        queueScrollUpdate();
    };

    if (projectGrid && filterButtons.length) {
        filterButtons.forEach(button => {
            const badge = button.querySelector('span');
            const category = button.dataset.filter;
            const count = category === 'all'
                ? projectCards.length
                : projectCards.filter(card => card.dataset.category === category).length;
            if (badge) badge.textContent = String(count).padStart(2, '0');
            button.addEventListener('click', () => filterProjects(button.dataset.filter));
        });
        filterProjects('all', false);
        document.querySelector('.project-toolbar')?.removeAttribute('hidden');
    }

    const copyFeedback = document.getElementById('copy-feedback');

    document.querySelectorAll('.copy-email[data-email]').forEach(button => {
        button.addEventListener('click', async event => {
            const email = button.dataset.email;
            if (!email) return;
            event.preventDefault();

            try {
                if (!window.isSecureContext || !navigator.clipboard?.writeText) {
                    throw new Error('Clipboard unavailable');
                }
                await navigator.clipboard.writeText(email);
                if (copyFeedback) copyFeedback.textContent = 'E-mail copiado!';
            } catch {
                if (copyFeedback) copyFeedback.textContent = 'Não foi possível copiar. Use o endereço de e-mail acima.';
            }
        });
        button.hidden = false;
    });

    const currentYear = document.getElementById('current-year');
    if (currentYear) currentYear.textContent = String(new Date().getFullYear());
})();
