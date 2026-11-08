(() => {
    'use strict';

    // Menu responsivo com suporte a teclado.
    const menuButton = document.querySelector('.menu-toggle');
    const navigation = document.getElementById('primary-navigation');
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const setMenuOpen = open => {
        if (!menuButton || !navigation) return;
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        navigation.classList.toggle('is-open', open);
    };

    menuButton?.addEventListener('click', () => {
        setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
    });
    navigation?.addEventListener('click', event => {
        if (event.target.closest('a')) setMenuOpen(false);
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
            setMenuOpen(false);
            menuButton.focus();
        }
    });
    document.addEventListener('click', event => {
        if (menuButton && navigation && !navigation.contains(event.target) && !menuButton.contains(event.target)) {
            setMenuOpen(false);
        }
    });
    window.addEventListener('resize', () => {
        if (window.innerWidth > 680) setMenuOpen(false);
    });

    // Sinaliza a seção atual no menu, respeitando a ordem real na página.
    const sections = navLinks.map(link => ({ link, section: document.getElementById(link.hash.slice(1)) }))
        .filter(item => item.section)
        .sort((a, b) => a.section.offsetTop - b.section.offsetTop);
    let scrollFrame = null;
    const updateActiveLink = () => {
        scrollFrame = null;
        const referenceY = Math.min(window.innerHeight * .32, 200);
        let active = sections[0];
        for (const item of sections) {
            if (item.section.getBoundingClientRect().top <= referenceY) active = item;
        }
        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
            active = sections.reduce((last, item) => item.section.offsetTop > last.section.offsetTop ? item : last, sections[0]);
        }
        sections.forEach(item => {
            if (item === active) item.link.setAttribute('aria-current', 'location');
            else item.link.removeAttribute('aria-current');
        });
    };
    const queueActiveLink = () => {
        if (scrollFrame === null) scrollFrame = requestAnimationFrame(updateActiveLink);
    };
    if (sections.length) {
        window.addEventListener('scroll', queueActiveLink, { passive: true });
        window.addEventListener('resize', queueActiveLink);
        updateActiveLink();
    }

    // Três destaques por padrão; mantém todos os 13 projetos acessíveis.
    const grid = document.getElementById('projects-grid');
    const cards = Array.from(grid?.querySelectorAll('.project-card') || []);
    const moreButton = document.getElementById('show-more');
    const toolbar = document.getElementById('project-toolbar');
    const filterButtons = Array.from(document.querySelectorAll('.filter-button'));
    const status = document.getElementById('projects-status');
    let expanded = false;
    let activeFilter = 'all';

    const updateProjects = () => {
        let count = 0;
        cards.forEach(card => {
            const featured = card.classList.contains('is-featured');
            const visible = (!expanded && featured) || (expanded && (activeFilter === 'all' || card.dataset.category === activeFilter));
            card.hidden = !visible;
            if (visible) count++;
        });
        if (toolbar) toolbar.hidden = !expanded;
        if (status) status.textContent = `${count} ${count === 1 ? 'projeto' : 'projetos'} visíveis`;
        if (moreButton) {
            moreButton.setAttribute('aria-expanded', String(expanded));
            moreButton.innerHTML = expanded ? 'Mostrar apenas os destaques <span aria-hidden="true">↑</span>' : `Ver todos os ${cards.length} projetos <span aria-hidden="true">↓</span>`;
        }
        filterButtons.forEach(button => {
            const current = button.dataset.filter === activeFilter;
            button.classList.toggle('is-active', current);
            button.setAttribute('aria-pressed', String(current));
        });
    };
    if (grid && moreButton) {
        moreButton.addEventListener('click', () => {
            expanded = !expanded;
            if (!expanded) activeFilter = 'all';
            updateProjects();
        });
        filterButtons.forEach(button => button.addEventListener('click', () => {
            activeFilter = button.dataset.filter;
            updateProjects();
        }));
        updateProjects();
    }

    // Site estático: prepara um e-mail no aplicativo do visitante, sem simular envio direto.
    const form = document.getElementById('contact-form');
    form?.addEventListener('submit', event => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const name = form.querySelector('#contact-name').value.trim();
        const email = form.querySelector('#contact-email').value.trim();
        const message = form.querySelector('#contact-message').value.trim();
        const subject = encodeURIComponent(`Contato pelo portfólio — ${name}`);
        const body = encodeURIComponent(`Nome: ${name}\nE-mail: ${email}\n\nMensagem:\n${message}`);
        window.location.href = `mailto:andrey_lisboa11@outlook.com?subject=${subject}&body=${body}`;
    });

    const year = document.getElementById('current-year');
    if (year) year.textContent = String(new Date().getFullYear());
})();
