// Player Reports System

const REPORT_REASONS = [
    'Spam/Inappropriate Content',
    'Harassment',
    'Fake Account',
    'Misleading Content',
    'Copyright Violation',
    'Scam/Fraud',
    'Hate Speech',
    'Other'
];

const REPORT_MEANINGS = {
    'Spam/Inappropriate Content': 'Posts that contain spam, adult content, or other inappropriate material that violates community guidelines.',
    'Harassment': 'Bullying, threats, or targeted attacks against another player or their content.',
    'Fake Account': 'Accounts that are impersonating real people or using misleading information to deceive others.',
    'Misleading Content': 'Posts that contain false information, misinformation, or deliberately deceptive claims.',
    'Copyright Violation': 'Content that uses copyrighted material without proper permission or attribution.',
    'Scam/Fraud': 'Attempts to deceive players for financial gain or personal information.',
    'Hate Speech': 'Content that promotes discrimination or hatred based on protected characteristics.',
    'Other': 'Any other reason not covered by the above categories.'
};

// AI Moderation System
const AI_MODERATION_CONFIG = {
    enabled: true,
    autoResolveDelay: 5000, // 5 seconds before AI resolves
    confidenceThreshold: 0.7, // 70% confidence to take action
    actionProbabilities: {
        'Spam/Inappropriate Content': { warn: 0.4, ban: 0.6 },
        'Harassment': { warn: 0.3, ban: 0.7 },
        'Fake Account': { warn: 0.1, ban: 0.9 },
        'Misleading Content': { warn: 0.6, ban: 0.4 },
        'Copyright Violation': { warn: 0.5, ban: 0.5 },
        'Scam/Fraud': { warn: 0.2, ban: 0.8 },
        'Hate Speech': { warn: 0.1, ban: 0.9 },
        'Other': { warn: 0.5, ban: 0.5 }
    }
};

function generateFakePlayerReport() {
    // Random reporter and reported player
    const reporter = generateRandomUsername();
    const reported = generateRandomUsername();
    const reason = REPORT_REASONS[Math.floor(Math.random() * REPORT_REASONS.length)];
    
    const report = {
        id: Date.now() + Math.random(),
        reporter: reporter,
        reported: reported,
        reason: reason,
        description: `Reported for ${reason.toLowerCase()}`,
        timestamp: Date.now(),
        status: 'pending', // 'pending' or 'resolved'
        action: null, // 'warned', 'banned', 'dismissed'
    };
    
    return report;
}

function addPlayerReport() {
    if (!gameState.playerReports) {
        gameState.playerReports = [];
    }

    const newReport = generateFakePlayerReport();
    gameState.playerReports.unshift(newReport);

    // Keep only last 100 reports
    if (gameState.playerReports.length > 100) {
        gameState.playerReports = gameState.playerReports.slice(0, 100);
    }

    addNotification(`📋 New report: ${newReport.reporter} reported ${newReport.reported}`, 'info');

    // AI auto-resolves the report after a delay
    if (gameState.aiModerationEnabled !== false && AI_MODERATION_CONFIG.enabled) {
        scheduleAIResolution(newReport.id);
    }
}

function scheduleAIResolution(reportId) {
    setTimeout(() => {
        aiResolveReport(reportId);
    }, AI_MODERATION_CONFIG.autoResolveDelay);
}

function aiResolveReport(reportId) {
    const report = gameState.playerReports.find(r => r.id === reportId);
    if (!report || report.status === 'resolved') return;

    // AI decides action based on reason
    const actionProbs = AI_MODERATION_CONFIG.actionProbabilities[report.reason];
    const random = Math.random();
    let action = 'dismissed';

    if (random < actionProbs.ban) {
        action = 'banned';
    } else if (random < actionProbs.ban + actionProbs.warn) {
        action = 'warned';
    }

    // Apply the action
    resolveReport(reportId, action, true); // true = AI action
}

function setReportFilter(filter) {
    gameState.reportFilter = filter;

    // Update active button and move slider
    document.querySelectorAll('.report-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        }
    });

    // Move the slider to the active button
    updateFilterSlider();
    renderReports();
}

function updateFilterSlider() {
    const activeBtn = document.querySelector('.report-filter-btn.active');
    const slider = document.querySelector('.filter-slider');
    const container = document.querySelector('.reports-filters');

    if (activeBtn && slider && container) {
        // Get positions relative to the container
        const btnRect = activeBtn.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const left = btnRect.left - containerRect.left;
        const width = btnRect.width;

        slider.style.left = left + 'px';
        slider.style.width = width + 'px';
    }
}

// Initialize slider when reports tab is shown
function initializeReportSlider() {
    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(() => {
        updateFilterSlider();
    }, 50);
}

function renderReports() {
    const container = document.getElementById('reportsContainer');
    if (!container) return;

    // Initialize slider on first render
    initializeReportSlider();

    if (!gameState.playerReports || gameState.playerReports.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>📝 No reports yet</p></div>';
        return;
    }
    
    let visibleReports = gameState.playerReports;
    
    // Apply filter
    if (gameState.reportFilter === 'pending') {
        visibleReports = visibleReports.filter(r => r.status === 'pending');
    } else if (gameState.reportFilter === 'resolved') {
        visibleReports = visibleReports.filter(r => r.status === 'resolved');
    }
    
    if (visibleReports.length === 0) {
        const filterText = gameState.reportFilter === 'pending' ? 'pending reports' : 'resolved reports';
        container.innerHTML = `<div class="empty-state"><p>📝 No ${filterText}</p></div>`;
        return;
    }
    
    container.innerHTML = visibleReports.map(report => {
        const statusBadge = report.status === 'pending'
            ? '<span class="report-status pending">⏳ Pending</span>'
            : `<span class="report-status resolved">✓ ${report.action} ${report.resolvedByAI ? '🤖' : ''}</span>`;
        
        const actionButtons = report.status === 'pending' ? `
            <button class="report-action-btn warn-btn" onclick="resolveReport(${report.id}, 'warned')">⚠️ Warn</button>
            <button class="report-action-btn ban-btn" onclick="resolveReport(${report.id}, 'banned')">🚫 Ban</button>
            <button class="report-action-btn dismiss-btn" onclick="resolveReport(${report.id}, 'dismissed')">✓ Dismiss</button>
        ` : '';
        
        return `
            <div class="report-card">
                <div class="report-header">
                    <div class="report-info">
                        <span class="report-reporter">📢 ${report.reporter}</span>
                        <span class="report-arrow">→</span>
                        <span class="report-reported">🎯 ${report.reported}</span>
                    </div>
                    ${statusBadge}
                </div>
                <div class="report-reason">
                    <strong>Reason:</strong> ${report.reason}
                </div>
                <div class="report-description">
                    ${report.description}
                </div>
                <div class="report-time">
                    ${formatTime(report.timestamp)}
                </div>
                ${actionButtons ? `<div class="report-actions">${actionButtons}</div>` : ''}
            </div>
        `;
    }).join('');
}

function resolveReport(reportId, action, isAI = false) {
    const report = gameState.playerReports.find(r => r.id === reportId);
    if (!report) return;

    report.status = 'resolved';
    report.action = action;
    report.resolvedByAI = isAI;

    // Take action on the reported player
    if (action === 'warned') {
        warnPlayer(report.reported);
    } else if (action === 'banned') {
        banPlayer(report.reported);
    }

    const resolvedBy = isAI ? '🤖 AI' : '👤 You';
    addNotification(`✓ Report resolved by ${resolvedBy}: ${action}`, 'report');
    saveGame();
    renderReports();
}

function showReportMeanings() {
    const modal = document.getElementById('reportMeaningsModal');
    const content = document.getElementById('reportMeaningsContent');

    if (!modal || !content) return;

    // Generate HTML for all report reasons and their meanings
    const meaningsHTML = REPORT_REASONS.map(reason => `
        <div class="report-meaning-item">
            <h4 style="margin: 12px 0 6px 0; color: var(--primary);">${reason}</h4>
            <p style="margin: 0 0 12px 0; font-size: 14px; color: var(--text-secondary);">${REPORT_MEANINGS[reason]}</p>
        </div>
    `).join('');

    content.innerHTML = meaningsHTML;
    modal.style.display = 'flex';
}

function closeReportMeanings() {
    const modal = document.getElementById('reportMeaningsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Add event listener for close button
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('closeReportMeaningsBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeReportMeanings);
    }

    // Close modal when clicking outside
    const modal = document.getElementById('reportMeaningsModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeReportMeanings();
            }
        });
    }
});

