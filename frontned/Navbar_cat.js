(function () {
    // Point this at your running backend (see the auth backend README).
    const API_BASE = 'http://localhost:5000/api/auth';

    const NAV_CONFIG = {
        cat: {
            brandHref: 'mba-partner-cat-omet-home.html',
            links: [
                { label: 'Home', href: 'mba-partner-cat-omet-home.html' },
                { label: 'Courses', href: 'mba-partner-cat-omet-courses.html' },
                { label: 'Mocks', href: 'cat-mocks.html' },
                { label: 'Testimonials', href: 'cat-testimonial.html' },
                { label: 'Mentors', href: 'mentor.html' }
            ],
        },
        mba: {
            brandHref: 'mba-partner-home.html',
            links: [
                { label: 'Home', href: 'mba-partner-home.html' },
                { label: 'Courses', href: 'mba-partner-courses-redesign.html' },
                { label: 'Testimonials', href: 'mba-partner-testimonials-redesign_.html' },
                { label: 'Mentors', href: 'mentor.html' },
                { label: 'College Collab', href: 'college-collab.html' }
            ],
        },
    };

    // Update the href values below to your real resource pages.
    const RESOURCE_LINKS = [
        {
            label: 'BSchool Predictor',
            href: 'bschool-predictor.html',
            icon: '<path d="M9 3 2 7l7 4 7-4-7-4Z" stroke="white" stroke-width="1.3" stroke-linejoin="round"/><path d="M5 9.5v3c0 1.1 1.8 2 4 2s4-.9 4-2v-3" stroke="white" stroke-width="1.3" fill="none"/>',
        },
        {
            label: 'AI Mock Interview',
            href: 'gdpi-ai-interview.html',
            icon: '<circle cx="9" cy="9" r="6" stroke="white" stroke-width="1.3"/><circle cx="9" cy="9" r="3" stroke="white" stroke-width="1.3"/><circle cx="9" cy="9" r="0.9" fill="white"/>',
        },
        {
            label: 'Free CAT Study Material!',
            href: 'cat-Mocks.html',
            icon: '<path d="M9 5.2C7.2 3.7 4.8 3.2 2.3 3.2v10.5c2.5 0 4.9.6 6.7 2 1.8-1.4 4.2-2 6.7-2V3.2c-2.5 0-4.9.5-6.7 2Z" stroke="white" stroke-width="1.2" stroke-linejoin="round"/>',
        },
        {
            label: 'SOP Generator',
            href: 'sop-generator.html',
            icon: '<path d="M5 2h6l3 3v11H5V2Z" stroke="white" stroke-width="1.2" stroke-linejoin="round"/><path d="M7 8h6M7 11h6M7 14h4" stroke="white" stroke-width="1.1"/>',
        },
        {
            label: 'CAT Score Calculator',
            href: 'cat-score-calculator.html',
            icon: '<rect x="4" y="2" width="10" height="14" rx="1.5" stroke="white" stroke-width="1.2"/><rect x="6" y="4" width="6" height="2.6" fill="white"/><circle cx="6.6" cy="9.6" r="0.8" fill="white"/><circle cx="9" cy="9.6" r="0.8" fill="white"/><circle cx="11.4" cy="9.6" r="0.8" fill="white"/><circle cx="6.6" cy="12.4" r="0.8" fill="white"/><circle cx="9" cy="12.4" r="0.8" fill="white"/><circle cx="11.4" cy="12.4" r="0.8" fill="white"/>',
        },
    ];

    function navLinksHTML(track) {
        return NAV_CONFIG[track].links
            .map((l) => `<a href="${l.href}">${l.label}</a>`)
            .join('\n                ');
    }

    function resourceCardsHTML() {
        return RESOURCE_LINKS.map(
            (r) => `
            <a class="resource-card" href="${r.href}">
                <span class="resource-card-icon"><svg width="16" height="16" viewBox="0 0 18 18" fill="none">${r.icon}</svg></span>
                <span>${r.label}</span>
            </a>`
        ).join('');
    }

    function navbarMarkup(track) {
        const cfg = NAV_CONFIG[track];
        return `
    <nav class="nav" id="site-nav">
        <div class="nav-inner">
            <a class="brand" href="${cfg.brandHref}">
                <span class="brand-mark">MP</span>
                <span class="brand-text"><span>MBA Partner</span><small>Initiative by Alumni of Old IIM</small></span>
            </a>
            <button class="nav-toggle" id="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false"
                aria-controls="nav-links"><span></span></button>
            <div class="nav-links" id="nav-links">
                ${navLinksHTML(track)}
                <a href="cart-page.html" id="navCartLink" class="nav-cart">Cart<span class="cart-badge"
                        id="cartBadge">0</span></a>
                <a class="nav-login" href="mba-partner-login.html" id="navLogin">Login</a>
                <div class="nav-profile" id="navProfileBox" style="display:none;">
                    <button class="nav-profile-trigger" id="navProfileTrigger" type="button" aria-haspopup="true"
                        aria-expanded="false">
                        <span class="nav-profile-avatar" id="navProfileAvatar">A</span>
                        <span class="nav-user-name" id="navUserName"></span>
                        <span class="nav-profile-caret">▾</span>
                    </button>
                    <div class="nav-profile-menu" id="navProfileMenu" role="menu">
                        <a href="mba-partner-my-account.html" role="menuitem">My Account</a>${track === 'cat' ? `
                        <a href="mba-partner-dashboard.html" role="menuitem">Dashboard</a>` : ''}
                        <button type="button" id="logoutBtn" class="nav-profile-logout" role="menuitem">Logout</button>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- RESOURCE BAR: update the href values in navbar.js to your real pages -->
    <div class="resource-bar">
        <div class="resource-bar-inner"><span class="resource-bar-label"><span class="dot"></span>Quick links</span>${resourceCardsHTML()}
        </div>
    </div>`;
    }

    function wire() {
        const siteNav = document.getElementById('site-nav');
        const navToggle = document.getElementById('nav-toggle');
        const navLinksEl = document.getElementById('nav-links');
        const navLogin = document.getElementById('navLogin');
        const navProfileBox = document.getElementById('navProfileBox');
        const navProfileTrigger = document.getElementById('navProfileTrigger');
        const navProfileAvatar = document.getElementById('navProfileAvatar');
        const navUserName = document.getElementById('navUserName');
        const footLogin = document.getElementById('footLogin');
        const logoutBtn = document.getElementById('logoutBtn');
        const navCartLink = document.getElementById('navCartLink');

        // Hamburger
        navToggle.addEventListener('click', () => {
            const isOpen = siteNav.classList.toggle('menu-open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
        });
        navLinksEl.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                siteNav.classList.remove('menu-open');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.setAttribute('aria-label', 'Open menu');
            });
        });

        // Cart badge
        function updateCartBadge() {
            const badge = document.getElementById('cartBadge');
            if (!badge || !window.MBACart) return;
            const count = MBACart.isLoggedIn() ? MBACart.cartCount() : 0;
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }

        function showLoggedOut() {
            navLogin.style.display = '';
            navProfileBox.style.display = 'none';
            navProfileBox.classList.remove('open');
            if (footLogin) footLogin.style.display = '';
            updateCartBadge();
        }

        function showLoggedIn(user) {
            navLogin.style.display = 'none';
            navProfileBox.style.display = '';

            const label = (user && (user.name || user.email)) || 'Account';
            const initial = label.trim().charAt(0).toUpperCase();
            const firstName = (user && user.name) ? user.name.split(' ')[0] : label;

            navProfileAvatar.textContent = initial;
            navUserName.textContent = firstName;
            navUserName.style.display = '';

            if (footLogin) footLogin.style.display = 'none';
            updateCartBadge();
        }

        // Profile dropdown
        if (navProfileTrigger) {
            navProfileTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = navProfileBox.classList.toggle('open');
                navProfileTrigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
            document.addEventListener('click', (e) => {
                if (!navProfileBox.contains(e.target)) {
                    navProfileBox.classList.remove('open');
                    navProfileTrigger.setAttribute('aria-expanded', 'false');
                }
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    navProfileBox.classList.remove('open');
                    navProfileTrigger.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Auth check
        async function checkAuth() {
            const token = localStorage.getItem('token');
            if (!token) {
                showLoggedOut();
                return;
            }
            try {
                const res = await fetch(`${API_BASE}/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: 'include',
                });
                const data = await res.json();
                if (data.success) showLoggedIn(data.user);
                else {
                    localStorage.removeItem('token');
                    showLoggedOut();
                }
            } catch {
                // Backend unreachable — keep the user logged in visually based on the
                // stored token rather than booting them out on a network hiccup.
                // We don't have fresh user data here, so fall back to a generic label.
                showLoggedIn();
            }
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    await fetch(`${API_BASE}/logout`, { method: 'POST', credentials: 'include' });
                } catch {
                    /* ignore — clear local state regardless */
                }
                localStorage.removeItem('token');
                showLoggedOut();
                siteNav.classList.remove('menu-open');
                navProfileBox.classList.remove('open');
            });
        }

        if (navCartLink) {
            navCartLink.addEventListener('click', (e) => {
                if (window.MBACart && !MBACart.isLoggedIn()) {
                    e.preventDefault();
                    MBACart.goToLogin('cart-page.html');
                }
            });
        }

        checkAuth();

        // Exposed in case a page wants to refresh the badge after a cart change
        window.MBANavbar = { updateCartBadge, checkAuth };
    }

    function init() {
        const mount = document.getElementById('navbar-mount');
        if (!mount) return;
        const track = mount.dataset.track === 'mba' ? 'mba' : 'cat';
        mount.innerHTML = navbarMarkup(track);
        wire();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();