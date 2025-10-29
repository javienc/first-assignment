/**
 * ActivityTracker
 * Tracks page views, primary button clicks, and form submissions.
 * Renders a timeline widget and persists session data in localStorage.
 */
class ActivityTracker {
    /**
     * Initialize tracker, attach widget, set listeners, and render initial state.
     */
    constructor() {
        this.storageKey = 'activity-tracker-data';
        this.sessionInactivityMs = 60 * 60 * 1000;

        this.data = this.loadOrCreateSession();

        this.rootEl = this.renderWidgetShell();
        this.cacheDomRefs();
        this.bindToggle();
        this.bindDelegatedListeners();


        this.recordPageView();


        this.renderHeader();
        this.renderStats();
        this.renderAllTimelineItems();

    }

    // ----------------------------
    // Persistence
    // ----------------------------
    /**
     * Load session from localStorage or create a new one if missing/expired.
     */
    loadOrCreateSession() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                const lastTime = parsed.lastActivityAt || parsed.startedAt || Date.now();
                const now = Date.now();
                if (now - lastTime > this.sessionInactivityMs) {
                    return this.createNewSession();
                }
                // Normalize structure
                parsed.events = Array.isArray(parsed.events) ? parsed.events : [];
                parsed.stats = parsed.stats || { pagesViewed: 0, totalClicks: 0, formsSubmitted: 0 };
                return parsed;
            }
        } catch (_) {
            // fall through to create
        }
        return this.createNewSession();
    }

    /**
     * Create a fresh session object with empty stats and events.
     */
    createNewSession() {
        const now = Date.now();
        const data = {
            sessionId: this.generateSessionId(),
            startedAt: now,
            lastActivityAt: now,
            events: [],
            stats: {
                pagesViewed: 0,
                totalClicks: 0,
                formsSubmitted: 0,
            },
        };
        this.save(data);
        return data;
    }

    /**
     * Persist current (or provided) session to localStorage.
     */
    save(next) {
        const data = next || this.data;
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (_) {
            // ignore storage errors for robustness
        }
    }

    /** Update last-activity timestamp and persist. */
    updateActivityTimestamp() {
        this.data.lastActivityAt = Date.now();
        this.save();
    }

    // ----------------------------
    // Utilities
    // ----------------------------
    /** Generate session id: session_<digits>_<alphanum>. */
    generateSessionId() {
        // session_<digits>_<alphanum>
        return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    /** Format a timestamp to HH:MM:SS (24-hour). */
    formatTimeHHMMSS(ts) {
        const d = new Date(ts);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
    }

    /** Return current page file name (e.g., index.html). */
    getCurrentPageName() {
        const path = (typeof location !== 'undefined' ? location.pathname : '') || '';
        const segs = path.split('/');
        return segs[segs.length - 1] || 'index.html';
    }

    

    // ----------------------------
    // Rendering
    // ----------------------------
    /** Build widget shell (button + timeline) and append to document.body. */
    renderWidgetShell() {
        // Root container
        const root = document.createElement('div');
        root.className = 'activity-tracker-widget';

        // Toggle button (open behavior)
        const btn = document.createElement('button');
        btn.className = 'activity-tracker-button';
        btn.setAttribute('aria-label', 'Open activity timeline');
        btn.textContent = '🕒';
        root.appendChild(btn);

        // Timeline aside
        const aside = document.createElement('aside');
        aside.className = 'activity-tracker-timeline';

        // Header
        const header = document.createElement('header');
        header.className = 'timeline-header';
        const h3 = document.createElement('h3');
        h3.textContent = 'Activity Timeline';
        const headerInfo = document.createElement('div');
        // two child divs will be rendered in renderHeader()
        header.appendChild(h3);
        header.appendChild(headerInfo);
        aside.appendChild(header);

        // Stats section
        const stats = document.createElement('section');
        stats.className = 'session-stats';
        aside.appendChild(stats);

        // Timeline content + wrapper
        const content = document.createElement('div');
        content.className = 'timeline-content';
        const wrapper = document.createElement('div');
        wrapper.className = 'timeline-wrapper';
        content.appendChild(wrapper);
        aside.appendChild(content);

        root.appendChild(aside);
        document.body.appendChild(root);
        return root;
    }

    /** Cache frequently accessed DOM elements. */
    cacheDomRefs() {
        this.btnEl = this.rootEl.querySelector('.activity-tracker-button');
        this.timelineEl = this.rootEl.querySelector('.activity-tracker-timeline');
        this.headerEl = this.rootEl.querySelector('.timeline-header');
        this.headerInfoEl = this.headerEl.querySelector('div');
        this.statsEl = this.rootEl.querySelector('.session-stats');
        this.wrapperEl = this.rootEl.querySelector('.timeline-wrapper');
    }

    /** Toggle timeline visibility by adding/removing .expanded. */
    bindToggle() {
        this.btnEl.addEventListener('click', () => {
            this.timelineEl.classList.toggle('expanded');
        });
    }

    /**
     * Attach delegated click/submit listeners (capture phase) to track interactions
     * without adding per-element handlers.
     */
    bindDelegatedListeners() {
        // Clicks (capture high in tree)
        document.addEventListener(
            'click',
            (e) => {
                const target = e.target;
                // .btn-primary click tracking
                const btn = target && (target.closest ? target.closest('.btn-primary') : null);
                if (btn) {
                    const text = (btn.textContent || '').trim();
                    const isShopNow = /shop\s+now/i.test(text);
                    const details = isShopNow ? 'Clicked link: Shop Now' : 'Clicked button';
                    this.recordInteraction(details);
                }
            },
            true
        );

        // Form submissions
        document.addEventListener(
            'submit',
            (e) => {
                this.recordFormSubmission();
            },
            true
        );
    }

    // ----------------------------
    // Recording events
    // ----------------------------
    /** Record a page view and increment Pages Viewed. */
    recordPageView() {
        const now = Date.now();
        const page = this.getCurrentPageName();
        this.data.events.push({ type: 'pageview', page, time: now });
        this.data.stats.pagesViewed += 1;
        this.data.lastActivityAt = now;
        this.save();
    }

    /** Record an interaction and increment Total Clicks; minimally update DOM. */
    recordInteraction(details) {
        const now = Date.now();
        this.data.events.push({ type: 'interaction', details, time: now });
        this.data.stats.totalClicks += 1;
        this.data.lastActivityAt = now;
        this.save();
        // Minimal UI update
        this.appendTimelineItem(this.data.events[this.data.events.length - 1]);
        this.renderStatsValuesOnly();
    }

    /** Record a form submission and increment Forms Submitted; minimal DOM update. */
    recordFormSubmission() {
        const now = Date.now();
        this.data.events.push({ type: 'interaction', details: 'Form submitted', time: now });
        this.data.stats.formsSubmitted += 1;
        this.data.lastActivityAt = now;
        this.save();
        // Minimal UI update
        this.appendTimelineItem(this.data.events[this.data.events.length - 1]);
        this.renderStatsValuesOnly();
    }

    // ----------------------------
    // Render helpers
    // ----------------------------
    /** Render header with session id and start time. */
    renderHeader() {
        // Clear info container
        this.headerInfoEl.innerHTML = '';
        const sessionDiv = document.createElement('div');
        sessionDiv.textContent = `Session ID: ${this.data.sessionId}`;
        const startedDiv = document.createElement('div');
        startedDiv.textContent = `Started: ${this.formatTimeHHMMSS(this.data.startedAt)}`;
        this.headerInfoEl.appendChild(sessionDiv);
        this.headerInfoEl.appendChild(startedDiv);
    }

    /** Render statistics with required labels and order. */
    renderStats() {
        this.statsEl.innerHTML = '';
        const labels = [
            'Session Duration',
            'Pages Viewed',
            'Total Clicks',
            'Forms Submitted',
        ];
        const values = [
            this.computeDurationMinutes() + ' min',
            String(this.data.stats.pagesViewed),
            String(this.data.stats.totalClicks),
            String(this.data.stats.formsSubmitted),
        ];
        for (let i = 0; i < labels.length; i++) {
            const stat = document.createElement('div');
            stat.className = 'stat';
            const labelEl = document.createElement('div');
            labelEl.className = 'stat-label';
            labelEl.textContent = labels[i];
            const valueEl = document.createElement('div');
            valueEl.className = 'stat-value';
            valueEl.textContent = values[i];
            stat.appendChild(labelEl);
            stat.appendChild(valueEl);
            this.statsEl.appendChild(stat);
        }
    }

    /** Update only stat values (avoid re-creating structure). */
    renderStatsValuesOnly() {
        const valueEls = this.statsEl.querySelectorAll('.stat-value');
        if (valueEls[0]) valueEls[0].textContent = this.computeDurationMinutes() + ' min';
        if (valueEls[1]) valueEls[1].textContent = String(this.data.stats.pagesViewed);
        if (valueEls[2]) valueEls[2].textContent = String(this.data.stats.totalClicks);
        if (valueEls[3]) valueEls[3].textContent = String(this.data.stats.formsSubmitted);
    }



    /** Compute whole minutes since session start (non-negative). */
    computeDurationMinutes() {
        const mins = Math.floor((Date.now() - this.data.startedAt) / 60000);
        return Math.max(0, mins);
    }

    /** Re-render timeline items from persisted events. */
    renderAllTimelineItems() {
        this.wrapperEl.innerHTML = '';
        this.data.events.forEach((evt) => this.appendTimelineItem(evt));
    }

    /** Append a single timeline item (pageview or interaction). */
    appendTimelineItem(evt) {
        const item = document.createElement('div');
        item.className = `timeline-item ${evt.type === 'pageview' ? 'pageview' : 'interaction'}`;

        const timeEl = document.createElement('div');
        timeEl.className = 'time';
        timeEl.textContent = this.formatTimeHHMMSS(evt.time);

        const titleEl = document.createElement('div');
        titleEl.className = 'event-title';
        titleEl.textContent = evt.type === 'pageview' ? 'Page View' : 'Interaction';

        const detailsEl = document.createElement('div');
        detailsEl.className = 'event-details';
        if (evt.type === 'pageview') {
            detailsEl.textContent = `Visited: ${evt.page}`;
        } else {
            detailsEl.textContent = evt.details || 'User interaction';
        }

        item.appendChild(timeEl);
        item.appendChild(titleEl);
        item.appendChild(detailsEl);
        this.wrapperEl.appendChild(item);
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActivityTracker;
} else {
    window.ActivityTracker = ActivityTracker;
}