/* ==========================================================================
   Astuti Swastika — Portfolio interactions
   1. Greeting splash screen (plays on every page load, about 5 seconds, skippable)
   2. Gentle reveal of sections as they scroll into view
   3. Self-typing Java code card with a "Run" console
   4. Cursor spotlight on the glass cards (desktop only)
   5. A hello for developers who open the browser console
   Motion is skipped for people who prefer reduced motion.
   ========================================================================== */

(function () {
    'use strict';

    var root = document.documentElement;
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- 5. Console hello ---------- */

    try {
        console.log(
            '%c👋 Hey, fellow developer!%c\n\n' +
            'Thanks for peeking under the hood. This site is hand-built with Java 17, Maven\n' +
            'and plain HTML, CSS & JavaScript — no frameworks.\n\n' +
            'Source: https://github.com/Swastika-A/My-eportfolio\n' +
            'Say hi:  astuti.swastika2021@gmail.com',
            'font: 600 16px/1.6 system-ui, sans-serif; color: #6cb0ff;',
            'font: 13px/1.6 ui-monospace, monospace; color: #9ba6b6;'
        );
    } catch (e) {
        // Console unavailable: nothing to do.
    }

    /* ---------- 2. Scroll reveal ---------- */

    var REVEAL_SELECTOR = [
        '.code-window',
        '.section-heading',
        '.section-lead',
        '.about-text',
        '.about-quote',
        '.focus-card',
        '.project-card',
        '.timeline-item',
        '.skill-group',
        '.contact-grid > li',
        '.section-more'
    ].join(',');

    function startReveal() {
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            return;
        }

        var items = document.querySelectorAll(REVEAL_SELECTOR);

        // Stagger cards that sit side by side in the same grid.
        Array.prototype.forEach.call(items, function (item) {
            var index = Array.prototype.indexOf.call(item.parentElement.children, item);
            item.style.setProperty('--reveal-delay', Math.min(index, 4) * 70 + 'ms');
            item.setAttribute('data-reveal', '');
        });
        root.classList.add('reveal-ready');

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }
                var item = entry.target;
                observer.unobserve(item);
                item.classList.add('is-visible');

                // Once revealed, hand the element back to its normal styles (e.g. hover effects).
                var cleanUp = function () {
                    item.removeEventListener('transitionend', onEnd);
                    item.removeAttribute('data-reveal');
                    item.classList.remove('is-visible');
                    item.style.removeProperty('--reveal-delay');
                };
                var onEnd = function (event) {
                    // Ignore transitions that bubble up from child elements.
                    if (event.target === item) {
                        cleanUp();
                    }
                };
                item.addEventListener('transitionend', onEnd);
                setTimeout(cleanUp, 1500);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

        Array.prototype.forEach.call(items, function (item) {
            observer.observe(item);
        });
    }

    /* ---------- 3. Self-typing code card ---------- */

    var codeBlock = document.querySelector('#code-block code');
    var runButton = document.querySelector('.run-btn');
    var consoleEl = document.getElementById('code-console');
    var typing = null;

    // The code is in the HTML in full (for no-JS and search engines); the script empties it and types it back in.
    function prepareTyping() {
        if (!codeBlock || prefersReducedMotion || !('IntersectionObserver' in window)) {
            return null;
        }

        var walker = document.createTreeWalker(codeBlock, NodeFilter.SHOW_TEXT);
        var nodes = [];
        var texts = [];
        while (walker.nextNode()) {
            // Skip the formatting whitespace between lines; only text inside a line is typed.
            if (walker.currentNode.parentElement.closest('.code-line')) {
                nodes.push(walker.currentNode);
                texts.push(walker.currentNode.nodeValue);
            }
        }
        nodes.forEach(function (node) {
            node.nodeValue = '';
        });

        var caret = document.createElement('span');
        caret.className = 'code-caret';
        caret.setAttribute('aria-hidden', 'true');

        return { nodes: nodes, texts: texts, caret: caret, nodeIndex: 0, charIndex: 0, done: false, frame: null };
    }

    function placeCaret(state, node) {
        node.parentNode.insertBefore(state.caret, node.nextSibling);
    }

    function finishTyping(state) {
        if (!state || state.done) {
            return;
        }
        cancelAnimationFrame(state.frame);
        state.nodes.forEach(function (node, i) {
            node.nodeValue = state.texts[i];
        });
        placeCaret(state, state.nodes[state.nodes.length - 1]);
        state.done = true;
        if (runButton) {
            runButton.classList.add('is-inviting');
        }
    }

    function typeCode(state) {
        var CHARS_PER_FRAME = 3;

        function step() {
            var budget = CHARS_PER_FRAME;
            while (budget > 0 && state.nodeIndex < state.nodes.length) {
                var node = state.nodes[state.nodeIndex];
                var full = state.texts[state.nodeIndex];
                if (state.charIndex < full.length) {
                    state.charIndex += 1;
                    node.nodeValue = full.slice(0, state.charIndex);
                    placeCaret(state, node);
                    budget -= 1;
                } else {
                    state.nodeIndex += 1;
                    state.charIndex = 0;
                }
            }
            if (state.nodeIndex >= state.nodes.length) {
                finishTyping(state);
                return;
            }
            state.frame = requestAnimationFrame(step);
        }

        state.frame = requestAnimationFrame(step);
    }

    function startCodeTyping() {
        if (!typing) {
            return;
        }
        var observer = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
                observer.disconnect();
                typeCode(typing);
            }
        }, { threshold: 0.35 });
        observer.observe(codeBlock);
    }

    typing = prepareTyping();

    /* "Run" button: prints a short program output in the console panel */

    var RUN_OUTPUT = [
        { cls: 'console-cmd', text: 'java Astuti.java' },
        { cls: 'console-muted', text: 'Compiling Astuti.java…' },
        { cls: 'console-ok', text: '✓ Build successful' },
        { cls: '', text: 'Hi, I\'m Astuti 👋' },
        { cls: '', text: 'role    → Software Developer' },
        { cls: '', text: 'focus   → Backend · Databases · Web' },
        { cls: '', text: 'build() → "Practical, reliable digital solutions"' },
        { cls: 'console-muted', text: 'Process finished with exit code 0' }
    ];

    function printLine(line) {
        var p = document.createElement('p');
        p.className = 'console-line' + (line.cls ? ' ' + line.cls : '');
        p.textContent = line.text;
        consoleEl.appendChild(p);
    }

    function runProgram() {
        finishTyping(typing);
        runButton.classList.remove('is-inviting');
        runButton.disabled = true;
        consoleEl.textContent = '';

        var delay = prefersReducedMotion ? 0 : 320;
        RUN_OUTPUT.forEach(function (line, i) {
            setTimeout(function () {
                printLine(line);
                if (i === RUN_OUTPUT.length - 1) {
                    runButton.disabled = false;
                }
            }, delay * i);
        });
    }

    if (runButton && consoleEl) {
        runButton.addEventListener('click', runProgram);
    }

    /* ---------- 4. Cursor spotlight ---------- */

    var SPOTLIGHT_SELECTOR = '.focus-card, .project-card, .skill-group, .timeline-item article, .contact-card, .code-window';

    if (!prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        root.classList.add('spotlight-on');

        var litCard = null;
        var pending = null;
        var frameScheduled = false;

        var resetCard = function (card) {
            card.style.removeProperty('--spot-x');
            card.style.removeProperty('--spot-y');
        };

        // Update at most once per animation frame, using the latest pointer position.
        document.addEventListener('pointermove', function (event) {
            pending = event;
            if (frameScheduled) {
                return;
            }
            frameScheduled = true;
            requestAnimationFrame(function () {
                frameScheduled = false;
                var e = pending;
                var card = e.target instanceof Element ? e.target.closest(SPOTLIGHT_SELECTOR) : null;
                if (litCard && litCard !== card) {
                    resetCard(litCard);
                }
                litCard = card;
                if (card) {
                    var rect = card.getBoundingClientRect();
                    card.style.setProperty('--spot-x', (e.clientX - rect.left) + 'px');
                    card.style.setProperty('--spot-y', (e.clientY - rect.top) + 'px');
                }
            });
        }, { passive: true });

        document.addEventListener('pointerleave', function () {
            if (litCard) {
                resetCard(litCard);
                litCard = null;
            }
        });
    }

    /* ---------- 1. Greeting splash ---------- */

    var GREETINGS = [
        { text: 'Hello', lang: 'en' },
        { text: 'Bula', lang: 'fj' },
        { text: 'नमस्ते', lang: 'hi' },
        { text: 'Kia ora', lang: 'mi' },
        { text: 'Talofa', lang: 'sm' },
        { text: 'Mālō e lelei', lang: 'to' },
        { text: 'Bonjour', lang: 'fr' },
        { text: 'Hola', lang: 'es' },
        { text: 'こんにちは', lang: 'ja' },
        { text: '你好', lang: 'zh' },
        { text: 'Welcome', lang: 'en' }
    ];

    // Timing in milliseconds: linger on the first and last words, move steadily through the rest (about 5 s in total).
    var FIRST_WORD_MS = 1000;
    var WORD_MS = 330;
    var LAST_WORD_MS = 1000;
    var EXIT_MS = 900;

    function afterSplash() {
        startReveal();
        startCodeTyping();
    }

    var splash = document.getElementById('splash');

    // Skip if the splash is off, or if a very slow connection meant the CSS safety net already hid it.
    if (!splash || !root.classList.contains('splash-on') || getComputedStyle(splash).visibility === 'hidden') {
        if (splash) {
            splash.remove();
        }
        root.classList.remove('splash-on');
        afterSplash();
        return;
    }

    var wordEl = splash.querySelector('.splash-word');
    var index = 0;
    var timer = null;
    var finished = false;

    var total = FIRST_WORD_MS + WORD_MS * (GREETINGS.length - 2) + LAST_WORD_MS;
    splash.style.setProperty('--splash-duration', total + 'ms');

    // Lock scrolling and hold the hero entrance until the splash lifts.
    root.classList.add('splash-active');

    function showWord(greeting) {
        wordEl.textContent = greeting.text;
        wordEl.setAttribute('lang', greeting.lang);
        // Restart the entrance animation for each word.
        wordEl.classList.remove('is-in');
        void wordEl.offsetWidth;
        wordEl.classList.add('is-in');
    }

    function nextWord() {
        index += 1;
        if (index >= GREETINGS.length) {
            finish();
            return;
        }
        showWord(GREETINGS[index]);
        timer = setTimeout(nextWord, index === GREETINGS.length - 1 ? LAST_WORD_MS : WORD_MS);
    }

    function finish() {
        if (finished) {
            return;
        }
        finished = true;
        clearTimeout(timer);
        window.removeEventListener('keydown', finish);

        splash.classList.add('is-leaving');
        root.classList.remove('splash-active');

        setTimeout(function () {
            splash.remove();
            root.classList.remove('splash-on');
            afterSplash();
        }, EXIT_MS);
    }

    splash.addEventListener('click', finish);
    window.addEventListener('keydown', finish);
    timer = setTimeout(nextWord, FIRST_WORD_MS);
})();
