class ActivityTracker {
    // TODO

    constructor() {
        this.initWidget();
        this.addUpEventListeners();
    }

    addUpEventListeners() {
        const button = document.querySelector('.activity-tracker-button');
        const timeline = document.querySelector('.activity-tracker-timeline');

        button.addEventListener('click', () => {
            timeline.classList.toggle('expanded');
        });
    }

    initWidget() {

        const widgetHTML = `
        <div class="activity-tracker-widget">
            <button class="activity-tracker-button" aria-label="Open activity timeline">
                🕒
            </button>

            <aside class="activity-tracker-timeline">
                <header class="timeline-header">
                <h3>Activity Timeline</h3>
                <div>
                    <div>Session ID: session_1234567890_ab12cd</div>
                    <div>Started: 14:22:18</div>
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