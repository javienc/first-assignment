class ActivityTracker {
    // TODO

    constructor() {
        // Session Configuration Settings
        this.STORAGE_KEY = 'activity-tracker-data';
        this.SESSION_TIMEOUT = 60 * 60 * 1000;
        this.sessionData = this.loadOrGenerateSession();

        this.renderWidget();
        this.renderExistingTrackingEvents();
        this.renderStats();

        this.recordPageView();
        this.addUpEventListeners();

    }

    renderExistingTrackingEvents() {
        if (!Array.isArray(this.sessionData.events)) return;
        for (const events of this.sessionData.events) this.appendTimelineItem(events);
    }

    appendTimelineItem(events) {
        const timeLineElement = document.querySelector('.timeline-wrapper');
        const time = this.formatTime(new Date(events.time));
        const cls = events.type === 'pageview' ? 'pageview' : 'interaction';
        const title = events.type === 'pageview' ? 'Page View' : 'Interaction';
        // only interactions have details
        const details = events.type === 'pageview' ? `Visited: ${events.page}` : events.details;

        const item = document.createElement('div');
        item.className = `timeline-item ${cls}`;

        const timeEl = document.createElement('div');
        timeEl.className = 'time';
        timeEl.textContent = time;

        const titleEl = document.createElement('div');
        titleEl.className = 'event-title';
        titleEl.textContent = title;

        const detailsEl = document.createElement('div');
        detailsEl.className = 'event-details';
        detailsEl.textContent = details;

        item.appendChild(timeEl);
        item.appendChild(titleEl);
        item.appendChild(detailsEl);

        timeLineElement.appendChild(item);
    }

    renderStats() {
        const durationElm = document.querySelector('.session-stats .stat:nth-child(1) .stat-value');
        const pagesElm = document.querySelector('.session-stats .stat:nth-child(2) .stat-value');
        const clicksElm = document.querySelector('.session-stats .stat:nth-child(3) .stat-value');
        const formsElm = document.querySelector('.session-stats .stat:nth-child(4) .stat-value');

        if (!durationElm || !pagesElm || !clicksElm || !formsElm) {
            return;
        };

        const mins = Math.floor((Date.now() - this.sessionData.startedAt) / 60000);

        durationElm.textContent = `${mins} min`;
        pagesElm.textContent = String(this.sessionData.stats.pagesViewed);
        clicksElm.textContent = String(this.sessionData.stats.totalClicks);
        formsElm.textContent = String(this.sessionData.stats.formsSubmitted);
    }



    loadOrGenerateSession() {
        const storedSession = localStorage.getItem(this.STORAGE_KEY);

        if (storedSession) {

            const data = JSON.parse(storedSession);
            const now = Date.now();

            // Check if session expired, create new if so
            if (now - data.lastActivity > this.SESSION_TIMEOUT) {
                return this.createNewSession();
            }

            data.lastActivity = now;
            this.saveSession(data);
            return data;

        } else {
            return this.createNewSession();
        }
    }

    createNewSession() {
        const sessionData = {
            sessionId: this.generateSessionId(),
            startedAt: Date.now(),
            lastActivity: Date.now(),
            stats: {
                pagesViewed: 0,
                totalClicks: 0,
                formsSubmitted: 0,
            },
            events: [
                // sampe format pageview: { "type": "pageview", "page": "index.html", "time": 1727895123456}
                // sampe format interaction: { "type": "interaction", "details": "Clicked link: Shop Now", "time": 1727895130000}
            ],
        };

        this.saveSession(sessionData);
        return sessionData;
    }


    saveSession(data = this.sessionData) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }

    addUpEventListeners() {
        const button = document.querySelector('.activity-tracker-button');
        const timeline = document.querySelector('.activity-tracker-timeline');

        button.addEventListener('click', () => {
            timeline.classList.toggle('expanded');
        });

        document.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-primary');
            if (button) {
                const label = button.textContent.trim();
                this.recordInteraction(`Clicked button: ${label}`);
            }
            // Collapse when area other than inside the widget is clicked
            const widget = document.querySelector('.activity-tracker-widget');
            const timelineEl = document.querySelector('.activity-tracker-timeline');
            const toggleBtn = document.querySelector('.activity-tracker-button');
            const clickedInsideWidget = e.target.closest('.activity-tracker-widget');
            if (timelineEl && timelineEl.classList.contains('expanded')) {
                const clickedToggle = !!e.target.closest('.activity-tracker-button');
                if (!clickedInsideWidget && !clickedToggle) {
                    timelineEl.classList.remove('expanded');
                }
            }
        }, true);

        document.addEventListener('submit', (e) => {
            this.recordInteraction('Submitted form');
        }, true);


    }

    recordPageView() {
        const page = location.pathname.split('/').pop() || 'index.html';
        const event = {
            type: 'pageview',
            page: page,
            time: Date.now(),
        };

        this.sessionData.events.push(event);
        this.sessionData.stats.pagesViewed++;
        this.sessionData.lastActivity = Date.now();
        this.saveSession();
        this.appendTimelineItem(event);
        this.renderStats();
    }

    recordInteraction(details) {
        const event = {
            type: 'interaction',
            details: details,
            time: Date.now(),
        };

        this.sessionData.events.push(event);

        if (details.startsWith('Clicked link')) {
            this.sessionData.stats.totalClicks++;
        } else if (details === 'Submitted form') {
            this.sessionData.stats.formsSubmitted++;
        }

        this.sessionData.lastActivity = Date.now();
        this.saveSession();
        this.appendTimelineItem(event);
        this.renderStats();
    }

    generateSessionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).slice(2, 8);
        return `session_${timestamp}_${random}`;
    }

    formatTime(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }


    renderWidget() {

        const widgetHTML = `
        <div class="activity-tracker-widget">
            <button class="activity-tracker-button" aria-label="Open activity timeline">
                🕒
            </button>

            <aside class="activity-tracker-timeline">
                <header class="timeline-header">
                <h3>Activity Timeline</h3>
                <div>
                    <div>Session ID: ${this.sessionData.sessionId}</div>
                    <div>Started: ${this.formatTime(new Date(this.sessionData.startedAt))}</div>
                </div>
                </header>
                <section class="session-stats">
                <div class="stat">
                    <div class="stat-label">Session Duration</div>
                    <div class="stat-value">0 min</div>
                </div>
                <div class="stat">
                    <div class="stat-label">Pages Viewed</div>
                    <div class="stat-value">0</div>
                </div>
                <div class="stat">
                    <div class="stat-label">Total Clicks</div>
                    <div class="stat-value">0</div>
                </div>
                <div class="stat">
                    <div class="stat-label">Forms Submitted</div>
                    <div class="stat-value">0</div>
                </div>
                </section>

                <div class="timeline-content">
                <div class="timeline-wrapper"></div>
                </div>
            </aside>
            </div>
    `;

        const template = document.createElement('template');
        template.innerHTML = widgetHTML.trim();
        const widgetRoot = template.content.firstElementChild;
        // Insert at top of body to avoid full-body reparse and preserve existing nodes
        document.body.insertBefore(widgetRoot, document.body.firstChild);
    }

}


// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActivityTracker;
} else {
    window.ActivityTracker = ActivityTracker;
}