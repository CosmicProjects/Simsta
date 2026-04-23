// Owner-Only Features for Sienna

// Owner Cosmetics - Special badges and themes
const OWNER_COSMETICS = {
    badges: [
        { id: 'default', name: '👑 Owner', description: 'Default Owner badge' },
        { id: 'crown_gold', name: '👑 Golden Crown', description: 'The ultimate Owner badge' },
        { id: 'diamond', name: '💎 Diamond Badge', description: 'Exclusive diamond cosmetic' },
        { id: 'star_burst', name: '⭐ Star Burst', description: 'Shimmering star effect' },
        { id: 'phoenix', name: '🔥 Phoenix', description: 'Legendary phoenix badge' },
        { id: 'celestial', name: '✨ Celestial', description: 'Cosmic celestial badge' }
    ],
    themes: [
        { id: 'default', name: 'Default', color: '#1DA1F2' },
        { id: 'gold', name: 'Golden', color: '#FFD700' },
        { id: 'purple', name: 'Royal Purple', color: '#9B59B6' },
        { id: 'emerald', name: 'Emerald', color: '#27AE60' },
        { id: 'sunset', name: 'Sunset', color: '#E74C3C' }
    ]
};

// Owner Rewards - Special items only for Owner
const OWNER_REWARDS = [
    { id: 'reward_1', name: '🎁 Founder\'s Gift', description: 'Special gift for creating Simsta', unlocked: true },
    { id: 'reward_2', name: '🏆 Hall of Fame', description: 'Exclusive Hall of Fame badge', unlocked: true },
    { id: 'reward_3', name: '🌟 Legendary Status', description: 'Legendary player status', unlocked: true }
];

// Check if current user is Owner
function isOwner() {
    return gameState.username === 'Sienna';
}

// Get Owner cosmetics
function getOwnerCosmetics() {
    if (!isOwner()) return null;
    return OWNER_COSMETICS;
}

// Apply Owner badge (only one active at a time)
function applyOwnerBadge(badgeId) {
    if (!isOwner()) {
        addNotification('❌ Only Owner can use this feature!', 'info');
        return;
    }

    // Set the active badge (replace any existing one)
    gameState.activeBadge = badgeId;
    const badge = OWNER_COSMETICS.badges.find(b => b.id === badgeId);
    addNotification(`✨ ${badge?.name} applied!`, 'info');

    saveGame();
    renderUI();
}

// Apply Owner theme
function applyOwnerTheme(themeId) {
    console.log('applyOwnerTheme called with:', themeId);
    console.log('isOwner():', isOwner());

    if (!isOwner()) {
        addNotification('❌ Only Owner can use this feature!', 'info');
        return;
    }

    gameState.ownerTheme = themeId;
    console.log('Calling applyThemeToUI with:', themeId);
    applyThemeToUI(themeId);
    const theme = OWNER_COSMETICS.themes.find(t => t.id === themeId);
    addNotification(`🎨 Theme changed to ${theme?.name}!`, 'info');
    saveGame();
    renderUI();
}

// Apply theme to UI
function applyThemeToUI(themeId) {
    const theme = OWNER_COSMETICS.themes.find(t => t.id === themeId);
    if (theme) {
        console.log('Applying theme to UI:', themeId, theme.color);

        // Set CSS variables on the root element
        // Dark mode will inherit these values automatically
        const root = document.documentElement;
        root.style.setProperty('--primary', theme.color);
        root.style.setProperty('--primary-dark', theme.color);

        console.log('Theme applied successfully with color:', theme.color);
    }
}

// Send game announcement
function sendGameAnnouncement(message) {
    if (!isOwner()) {
        addNotification('❌ Only Owner can send announcements!', 'info');
        return;
    }

    if (!message || message.trim() === '') {
        addNotification('❌ Announcement cannot be empty!', 'info');
        return;
    }

    const announcement = {
        id: Date.now(),
        message: message.trim(),
        timestamp: Date.now(),
        from: 'Owner'
    };

    if (!gameState.gameAnnouncements) {
        gameState.gameAnnouncements = [];
    }

    gameState.gameAnnouncements.unshift(announcement);

    // Global broadcasting via a centralized key for all players (including future ones)
    const globalAnnouncementsRaw = localStorage.getItem('simstaGlobalAnnouncements');
    let globalAnnouncements = [];
    try {
        globalAnnouncements = globalAnnouncementsRaw ? JSON.parse(globalAnnouncementsRaw) : [];
    } catch (e) {
        globalAnnouncements = [];
    }

    globalAnnouncements.unshift(announcement);
    localStorage.setItem('simstaGlobalAnnouncements', JSON.stringify(globalAnnouncements));

    // Also notify all existing profiles in Activity tab
    const savedUsers = localStorage.getItem('simstaUsers');
    if (savedUsers) {
        try {
            const allUsers = JSON.parse(savedUsers);
            Object.keys(allUsers).forEach(userId => {
                if (userId !== currentUserId) {
                    if (!allUsers[userId].notifications) allUsers[userId].notifications = [];
                    allUsers[userId].notifications.push({
                        id: Date.now() + Math.random(),
                        message: `📢 Update: ${message.trim()}`,
                        type: 'info',
                        timestamp: Date.now()
                    });
                }
            });
            localStorage.setItem('simstaUsers', JSON.stringify(allUsers));
            if (typeof users !== 'undefined') users = allUsers;
        } catch (e) {
            console.error('Error broadcasting announcement notify:', e);
        }
    }

    addNotification(`📢 Announcement sent: "${message}"`, 'info');
    saveGame();
}

// Delete game announcement
function deleteGameAnnouncement(announcementId) {
    if (!isOwner()) {
        addNotification('❌ Only Owner can delete announcements!', 'info');
        return;
    }

    // Remove from current session
    if (gameState.gameAnnouncements) {
        gameState.gameAnnouncements = gameState.gameAnnouncements.filter(a => a.id !== announcementId);
    }

    // Remove from Global storage
    const globalAnnouncementsRaw = localStorage.getItem('simstaGlobalAnnouncements');
    if (globalAnnouncementsRaw) {
        try {
            let globalAnnouncements = JSON.parse(globalAnnouncementsRaw);
            globalAnnouncements = globalAnnouncements.filter(a => a.id !== announcementId);
            localStorage.setItem('simstaGlobalAnnouncements', JSON.stringify(globalAnnouncements));
        } catch (e) {
            console.error('Error deleting global announcement:', e);
        }
    }

    addNotification('🗑️ Announcement deleted', 'info');
    saveGame();
    if (typeof renderGameAnnouncements === 'function') {
        renderGameAnnouncements();
    }
}

// Get Owner rewards
function getOwnerRewards() {
    if (!isOwner()) return [];
    return OWNER_REWARDS;
}

// Unlock Owner reward
function unlockOwnerReward(rewardId) {
    if (!isOwner()) return;

    if (!gameState.ownerRewards) {
        gameState.ownerRewards = [];
    }

    if (!gameState.ownerRewards.includes(rewardId)) {
        gameState.ownerRewards.push(rewardId);
        const reward = OWNER_REWARDS.find(r => r.id === rewardId);
        if (reward) {
            addNotification(`🎉 Reward unlocked: ${reward.name}!`, 'info');
        }
        saveGame();
    }
}

// Global multipliers
function setGlobalMultiplier(multiplier) {
    if (!isOwner()) return;

    const safeMultiplier = typeof normalizeGrowthMultiplier === 'function'
        ? normalizeGrowthMultiplier(multiplier)
        : Math.max(1, Number(multiplier) || 1);

    try {
        localStorage.setItem(GLOBAL_GROWTH_MULTIPLIER_KEY, String(safeMultiplier));
    } catch (error) {
        console.error('Error saving global multiplier:', error);
    }

    gameState.ownerMultiplier = safeMultiplier;

    if (typeof users !== 'undefined' && users) {
        Object.keys(users).forEach(userId => {
            if (!users[userId]) return;
            users[userId] = typeof normalizeUserRecord === 'function'
                ? normalizeUserRecord(users[userId], userId)
                : users[userId];
            users[userId].ownerMultiplier = safeMultiplier;
        });
    }

    addNotification(`⚡ Global Multiplier set to ${safeMultiplier}x for all users!`, 'info');
    saveGame();
    if (typeof renderGrowthControls === 'function') renderGrowthControls();
    else if (typeof renderAdminTools === 'function') renderAdminTools();
}

// Instant boosts
function addInstantBoost(type, amount) {
    if (!isOwner()) return;

    if (type === 'followers') {
        gameState.followers += amount;
        gameState.sessionFollowers += amount;
        addNotification(`👥 Added ${formatNumber(amount)} followers!`, 'info');
    } else if (type === 'likes') {
        gameState.totalLikes += amount;
        gameState.sessionLikes += amount;
        addNotification(`❤️ Added ${formatNumber(amount)} likes!`, 'info');
    } else if (type === 'views') {
        gameState.totalViews += amount;
        addNotification(`👁️ Added ${formatNumber(amount)} views!`, 'info');
    }

    saveGame();
    renderUI();
}

// Clear global data
function clearGlobalData() {
    if (!isOwner()) return;

    showConfirmation('Are you sure you want to CLEAR ALL GLOBAL DATA? This includes all announcements and leaderboards.', () => {
        localStorage.removeItem('simstaGlobalAnnouncements');
        localStorage.removeItem('simstaLeaderboards');
        addNotification('🗑️ All global data cleared!', 'info');
        
        // Refresh session
        gameState.gameAnnouncements = [];
        saveGame();
        location.reload();
    });
}
