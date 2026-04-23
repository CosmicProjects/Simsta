// Utility Functions

function generateRandomUsername() {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    return `${firstName} ${lastName}`;
}

function generateRandomPost() {
    const template = POST_TEMPLATES[Math.floor(Math.random() * POST_TEMPLATES.length)];
    return template;
}

function generateRandomHashtags(count = 3) {
    const hashtags = [];
    const hashtagCount = Math.floor(Math.random() * count) + 1; // Random 1 to count hashtags

    for (let i = 0; i < hashtagCount; i++) {
        const randomHashtag = POPULAR_HASHTAGS[Math.floor(Math.random() * POPULAR_HASHTAGS.length)];
        if (!hashtags.includes(randomHashtag)) {
            hashtags.push(randomHashtag);
        }
    }

    return hashtags.join(' ');
}

function generateShoutout(postContent) {
    if (!postContent) return SHOUTOUT_TEMPLATES.default[Math.floor(Math.random() * SHOUTOUT_TEMPLATES.default.length)];
    const contentLower = String(postContent).toLowerCase();
    for (const [keyword, shoutouts] of Object.entries(SHOUTOUT_TEMPLATES)) {
        if (keyword !== 'default' && contentLower.includes(keyword)) {
            return shoutouts[Math.floor(Math.random() * shoutouts.length)];
        }
    }
    return SHOUTOUT_TEMPLATES.default[Math.floor(Math.random() * SHOUTOUT_TEMPLATES.default.length)];
}

function formatNumber(num) {
    // Handle invalid inputs
    if (num === null || num === undefined || isNaN(num)) {
        return '0';
    }

    // Convert to number if it's a string
    num = parseFloat(num);

    // Round to 2 decimal places first to avoid floating point issues
    num = Math.round(num * 100) / 100;
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.max(0, num).toFixed(0);
}

function formatTime(date) {
    if (!date) return 'unknown';
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diff = now - dateObj;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return dateObj.toLocaleDateString();
}

function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

function calculateContentDecay(timestamp) {
    const now = Date.now();
    const ageMs = now - timestamp;

    if (ageMs < CONTENT_DECAY_CONFIG.decayStartMs) {
        return 1;
    }

    if (ageMs >= CONTENT_DECAY_CONFIG.maxAgeMs) {
        return 0;
    }

    const decayRange = CONTENT_DECAY_CONFIG.maxAgeMs - CONTENT_DECAY_CONFIG.decayStartMs;
    const decayProgress = (ageMs - CONTENT_DECAY_CONFIG.decayStartMs) / decayRange;
    const decayAmount = (1 - CONTENT_DECAY_CONFIG.decayMultiplier) * decayProgress;
    return 1 - decayAmount;
}

function showConfirmation(message, onConfirm) {
    showConfirmationDialog(message, onConfirm);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const tabContent = document.getElementById(`${tabName}-tab`);
    if (tabContent) {
        tabContent.classList.add('active');
    }

    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    if (tabName === 'activity') {
        if (typeof renderActivity === 'function') {
            renderActivity();
        }
    }

    if (tabName === 'reports') {
        if (typeof renderReports === 'function') {
            renderReports();
        }
    }

    if (tabName === 'leaderboards') {
        if (typeof renderLeaderboard === 'function') {
            renderLeaderboard(currentLeaderboardType || 'followers');
        }
    }

    if (tabName === 'explore' && typeof renderFakePlayerFeed === 'function') {
        renderFakePlayerFeed();
    }
}
