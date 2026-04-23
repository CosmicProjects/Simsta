// Achievement Badges System - Badges unlock based on follower milestones

const ACHIEVEMENT_BADGES = [
    { id: 'starter', name: 'Starter', icon: 'seedling', followers: 0, description: 'Welcome to Simsta!' },
    { id: 'rising', name: 'Rising Star', icon: 'star', followers: 100, description: 'Reached 100 followers' },
    { id: 'popular', name: 'Popular', icon: 'sparkles', followers: 1000, description: 'Reached 1K followers' },
    { id: 'viral', name: 'Viral', icon: 'flame', followers: 10000, description: 'Reached 10K followers' },
    { id: 'influencer', name: 'Influencer', icon: 'crown', followers: 100000, description: 'Reached 100K followers' },
    { id: 'mega', name: 'Mega Star', icon: 'diamond', followers: 1000000, description: 'Reached 1M followers' },
    { id: 'legend', name: 'Legend', icon: 'trophy', followers: 10000000, description: 'Reached 10M followers' },
    { id: 'super star', name: 'Super Star', icon: 'lightning-bolt', followers: 100000000, description: 'Reached 100M followers' },
    { id: 'internet star', name: 'Internet Star', icon: 'king', followers: 1000000000, description: 'Reached 1B followers' }
];

// Get unlocked badges based on current followers
function getUnlockedBadges() {
    return ACHIEVEMENT_BADGES.filter(badge => gameState.followers >= badge.followers);
}

// Get current badge (highest unlocked)
function getCurrentBadge() {
    const unlocked = getUnlockedBadges();
    return unlocked.length > 0 ? unlocked[unlocked.length - 1] : ACHIEVEMENT_BADGES[0];
}

// Get SVG icon for badge
function getBadgeIconSVG(iconType) {
    const icons = {
        seedling: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2c-1 0-2 1-2 2v8c0 1 1 2 2 2s2-1 2-2V4c0-1-1-2-2-2M8 14c-2 0-4 2-4 4v4h12v-4c0-2-2-4-4-4h-4M6 22h12"/></svg>',
        star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
        sparkles: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2M5 13l-1.5 3 1.5 3M19 13l1.5 3-1.5 3"/></svg>',
        flame: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 0-6 9-6 13c0 3.314 2.686 6 6 6s6-2.686 6-6c0-4-6-13-6-13z"/></svg>',
        crown: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 4h18v2l-3 4 3 4v2H3v-2l3-4-3-4V4m6 0l3 4 3-4m-6 8l3 4 3-4"/></svg>',
        diamond: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l5 7v9l-5 4-5-4v-9l5-7m0 0l-3 4h6l-3-4m0 9l3-4 3 4-3 4-3-4"/></svg>',
        trophy: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h12v4c0 2-1 3-3 3h-6c-2 0-3-1-3-3V2m2 7h8v8c0 2-1 3-2 3h-4c-1 0-2-1-2-3v-8m-2 0v8c0 2 1 3 2 3h1v2h-1c-2 0-3-1-3-3v-8h2m12 0v8c0 2-1 3-3 3h1v2h1c2 0 3-1 3-3v-8h-2"/></svg>',
        lightning_bolt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 9l3-3-3-3m0 6l3 3-3 3"/></svg>',
        king: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-1 0-2 1-2 2v8c0 1 1 2 2 2s2-1 2-2V4c0-1-1-2-2-2m0 6l3 4 3-4m-6 0l3-4 3 4"/></svg>'
    };
    return icons[iconType] || icons.star;
}

// Render achievement badges
function renderAchievementBadges() {
    const badgesContainer = document.getElementById('modalAchievementBadgesContainer');
    if (!badgesContainer) return;

    const unlocked = getUnlockedBadges();
    const renderKey = `${unlocked.map(b => b.id).join('|')}::${gameState.selectedBadge || ''}`;

    // Avoid replacing badge DOM on every UI tick; that resets hover state and causes flicker.
    if (badgesContainer.dataset.renderKey === renderKey && badgesContainer.childElementCount > 0) {
        return;
    }
    badgesContainer.dataset.renderKey = renderKey;

    badgesContainer.innerHTML = ACHIEVEMENT_BADGES.map(badge => {
        const isUnlocked = unlocked.some(b => b.id === badge.id);
        const isSelected = gameState.selectedBadge === badge.id;

        return `
            <div class="achievement-badge ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}"
                 title="${badge.description}"
                 data-badge-id="${badge.id}"
                 ${isUnlocked ? 'style="cursor: pointer;"' : ''}>
                <div class="badge-name">${badge.name}</div>
                <div class="badge-followers">${badge.followers.toLocaleString()}+</div>
            </div>
        `;
    }).join('');

    // Setup event delegation for badge clicks (only once)
    if (!badgesContainer.hasListener) {
        badgesContainer.addEventListener('click', (e) => {
            const badgeEl = e.target.closest('.achievement-badge.unlocked');
            if (badgeEl) {
                const badgeId = badgeEl.getAttribute('data-badge-id');
                selectBadge(badgeId);
            }
        });
        badgesContainer.hasListener = true;
    }
}

// Select a badge to display on profile
function selectBadge(badgeId) {
    gameState.selectedBadge = badgeId;
    saveGame();
    renderAchievementBadges();
    renderUI();
    addNotification(`✨ Badge selected!`, 'info');
}

// Display selected badge on profile
function displaySelectedBadge() {
    const badgeDisplay = document.getElementById('profileBadgeDisplay');
    if (!badgeDisplay) return;

    const selectedBadgeId = gameState.selectedBadge;
    const badge = ACHIEVEMENT_BADGES.find(b => b.id === selectedBadgeId);

    if (badge) {
        badgeDisplay.textContent = `🏆 ${badge.name}`;
        badgeDisplay.style.display = 'inline-block';
    } else {
        badgeDisplay.style.display = 'none';
    }
}

// Check for new badge unlocks and notify
function checkBadgeUnlocks() {
    if (!gameState.unlockedBadges) {
        gameState.unlockedBadges = ['starter'];
    }

    const currentBadge = getCurrentBadge();
    if (!gameState.unlockedBadges.includes(currentBadge.id)) {
        gameState.unlockedBadges.push(currentBadge.id);
        addNotification(`🎉 New Badge Unlocked: ${currentBadge.name}! ${currentBadge.icon}`, 'info');
        saveGame();
    }
}
