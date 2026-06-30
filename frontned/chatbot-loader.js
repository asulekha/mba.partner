/* ============================================================
   MBA Partner — Chatbot Loader
   ------------------------------------------------------------
   Add ONLY this to any page (right before </body>):

     <script src="chatbot-loader.js"></script>

   (No data-track needed anymore — the chatbot now uses a single
   unified knowledge base covering both CAT/OMET prep AND MBA /
   live projects / placements topics. Same bot, same answers,
   everywhere.)

   This file automatically:
     1. Loads React + ReactDOM + Babel Standalone (only once,
        even if the page already loads them elsewhere)
     2. Loads chatbot.css
     3. Creates the #chatbot-mount div
     4. Loads chatbot.js (the widget itself)

   Adjust BASE_PATH below if your files live in a subfolder
   (e.g. "/assets/" or "/js/").
   ============================================================ */

(function () {
    // ---- 1. Set this if chatbot.js / chatbot.css live in a subfolder ----
    // Example: '/assets/chatbot/'  (must end with a slash, or leave as '')
    var BASE_PATH = '';

    // ---- Helpers ----------------------------------------------------
    function loadScript(src, attrs) {
        return new Promise(function (resolve, reject) {
            // Skip if a script with this exact src is already on the page
            var existing = document.querySelector('script[src="' + src + '"]');
            if (existing) {
                if (existing.getAttribute('data-loaded') === 'true') {
                    resolve();
                } else {
                    existing.addEventListener('load', resolve);
                    existing.addEventListener('error', reject);
                }
                return;
            }
            var s = document.createElement('script');
            s.src = src;
            if (attrs) {
                Object.keys(attrs).forEach(function (key) {
                    s.setAttribute(key, attrs[key]);
                });
            }
            s.onload = function () {
                s.setAttribute('data-loaded', 'true');
                resolve();
            };
            s.onerror = function () {
                reject(new Error('Failed to load script: ' + src));
            };
            document.head.appendChild(s);
        });
    }

    function loadCss(href) {
        if (document.querySelector('link[href="' + href + '"]')) return;
        var l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = href;
        document.head.appendChild(l);
    }

    function isGlobalDefined(name) {
        return typeof window[name] !== 'undefined';
    }

    // Fetch a JSX/Babel file as raw text, transform it ourselves, and inject
    // the compiled JS as a plain <script>. This avoids relying on Babel
    // Standalone's own <script type="text/babel" src="..."> loader, whose
    // internal fetch does NOT reliably fire the tag's load/error events —
    // which is what caused the widget to silently never mount.
    function loadJsxAsScript(src) {
        return fetch(src, { cache: 'no-store' })
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + src);
                return res.text();
            })
            .then(function (rawCode) {
                // runtime: 'classic' forces Babel to compile JSX into
                // React.createElement(...) calls. Without this, Babel's
                // newer "automatic" JSX runtime injects a hidden
                // `import { jsx as _jsx } from "react/jsx-runtime"` line
                // at the top of the compiled output — which crashes when
                // executed as a plain <script> (no bundler to resolve it).
                var compiled = Babel.transform(rawCode, {
                    presets: [['react', { runtime: 'classic' }]]
                }).code;
                var s = document.createElement('script');
                s.text = compiled;
                document.body.appendChild(s);
            });
    }

    // ---- 2. Load CSS immediately (no dependency order needed) -------
    loadCss(BASE_PATH + 'chatbot.css');

    // ---- 3. Create the mount point if it doesn't already exist ------
    function ensureMountPoint() {
        if (document.getElementById('chatbot-mount')) return;
        var mount = document.createElement('div');
        mount.id = 'chatbot-mount';
        document.body.appendChild(mount);
    }

    // ---- 4. Load core libs in order, then the widget itself ---------
    function init() {
        ensureMountPoint();

        var chain = Promise.resolve();

        if (!isGlobalDefined('React')) {
            chain = chain.then(function () {
                return loadScript('https://unpkg.com/react@18/umd/react.production.min.js', { crossorigin: 'true' });
            });
        }

        if (!isGlobalDefined('ReactDOM')) {
            chain = chain.then(function () {
                return loadScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js', { crossorigin: 'true' });
            });
        }

        if (!isGlobalDefined('Babel')) {
            chain = chain.then(function () {
                return loadScript('https://unpkg.com/@babel/standalone/babel.min.js');
            });
        }

        chain
            .then(function () {
                // chatbot widget uses JSX. Fetch + transform + inject manually
                // (see loadJsxAsScript above for why). Try chatbot.js first;
                // if that 404s, fall back to chatbot.jsx automatically.
                return loadJsxAsScript(BASE_PATH + 'chatbot.js')
                    .catch(function () {
                        return loadJsxAsScript(BASE_PATH + 'chatbot.jsx');
                    });
            })
            .catch(function (err) {
                console.error('[chatbot-loader] Failed to initialize chatbot:', err);
            });
    }

    // ---- 5. Run once the DOM is ready --------------------------------
    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();