class ActivityTracker {
    // TODO

    constructor() {
        // Session Configuration Settings
        this.STORAGE_KEY = 'activity-tracker-data';
        this.SESSION_TIMEOUT = 60 * 60 * 1000;

        // Load or Generate new session
        this.sessionData = this.loadOrGenerateSession();

        this.renderWidget();
        this.addUpEventListeners();
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
            events: [
                {
                    "type": "pageview", "page": "index.html", "time": 1727895123456
                },
                {
                    "type": "interaction", "details": "Clicked link: Shop Now", "time": 1727895130000
                }
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
                    <div class="stat-value">1</div>
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
                <div class="timeline-wrapper">
                    <!-- timeline-item entries appended here -->
                    <div class="timeline-item pageview">
                    <div class="time">14:22:20</div>
                    <div class="event-title">Page View</div>
                    <div class="event-details">Visited: index.html — 45% viewed</div>
                    </div>
                </div>
                </div>
            </aside>
            </div>
    `;

        document.body.innerHTML += widgetHTML;
    }
}



// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActivityTracker;
} else {
    window.ActivityTracker = ActivityTracker;
}