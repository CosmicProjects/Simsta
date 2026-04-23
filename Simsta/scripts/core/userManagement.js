// User Management System
let users = {};
let currentUserId = 'default';

function resetSessionTracking() {
    const now = Date.now();
    gameState.sessionStartTime = now;
    gameState.sessionFollowers = 0;
    gameState.sessionLikes = 0;
    gameState.sessionShares = 0;
    gameState.sessionComments = 0;
}

function createBaseUserRecord(overrides = {}) {
    const now = Date.now();
    const fallbackId = overrides.id || 'default';
    const fallbackPlayerId = overrides.playerId || `player_${fallbackId}_${Math.random().toString(36).slice(2, 11)}`;

    return {
        id: fallbackId,
        username: 'Player',
        profilePicture: 'girl1',
        followers: 0,
        totalLikes: 0,
        totalShares: 0,
        totalViews: 0,
        totalComments: 0,
        posts: [],
        videos: [],
        duets: [],
        messages: [],
        notifications: [],
        stories: [],
        isVerified: false,
        isAdmin: true,
        currentActivityFilter: 'all',
        currentFeedFilter: 'posts',
        feedSortBy: 'newest',
        exploreSortFilter: 'all',
        bannedPlayers: [],
        warnedPlayers: {},
        playerReports: [],
        reportFilter: 'all',
        aiModerationEnabled: true,
        aiContentModerationEnabled: true,
        flaggedContent: [],
        darkModeEnabled: false,
        userTheme: 'default',
        viralPosts: {},
        viralNotificationQueue: [],
        lastPostTime: 0,
        postCooldown: 30000,
        autoPostEnabled: true,
        lastAutoPostTime: 0,
        autoPostInterval: 300000,
        contentDeletionTime: 10,
        playerId: fallbackPlayerId,
        lastHeartbeat: now,
        sessionStartTime: now,
        peakFollowers: 0,
        totalViralPosts: 0,
        milestones: [],
        trendingHashtags: {},
        engagementData: {},
        isLive: false,
        liveStartTime: 0,
        totalLiveStreams: 0,
        totalLiveViewers: 0,
        lastUpdateTime: now,
        sessionFollowers: 0,
        sessionLikes: 0,
        sessionShares: 0,
        sessionComments: 0,
        lastFollowerNotification: 0,
        lastLikeNotification: 0,
        lastShareNotification: 0,
        lastCommentNotification: 0,
        lastProfileShoutoutAt: 0,
        pendingShoutoutFollowers: 0,
        activeBadge: null,
        ownerTheme: 'default',
        gameAnnouncements: [],
        seenAnnouncements: [],
        ownerRewards: [],
        ownerMultiplier: typeof getGlobalGrowthMultiplier === 'function' ? getGlobalGrowthMultiplier() : 1,
        ...overrides,
    };
}

function normalizeUserRecord(userData, fallbackId = 'default') {
    const base = createBaseUserRecord({
        ...userData,
        id: fallbackId,
        playerId: userData?.playerId || undefined,
    });

    base.id = fallbackId;
    base.username = typeof base.username === 'string' && base.username.trim() ? base.username : 'Player';
    base.profilePicture = base.profilePicture || 'girl1';
    base.followers = Number(base.followers) || 0;
    base.totalLikes = Number(base.totalLikes) || 0;
    base.totalShares = Number(base.totalShares) || 0;
    base.totalViews = Number(base.totalViews) || 0;
    base.totalComments = Number(base.totalComments) || 0;
    base.isVerified = Boolean(base.isVerified);
    base.isAdmin = typeof base.isAdmin === 'boolean' ? base.isAdmin : true;
    base.currentActivityFilter = typeof base.currentActivityFilter === 'string' ? base.currentActivityFilter : 'all';
    base.currentFeedFilter = typeof base.currentFeedFilter === 'string' ? base.currentFeedFilter : 'posts';
    base.feedSortBy = typeof base.feedSortBy === 'string' ? base.feedSortBy : 'newest';
    base.exploreSortFilter = ['all', 'good', 'bad'].includes(base.exploreSortFilter) ? base.exploreSortFilter : 'all';
    base.bannedPlayers = Array.isArray(base.bannedPlayers) ? base.bannedPlayers : [];
    base.warnedPlayers = base.warnedPlayers && typeof base.warnedPlayers === 'object' && !Array.isArray(base.warnedPlayers)
        ? base.warnedPlayers
        : {};
    base.playerReports = Array.isArray(base.playerReports) ? base.playerReports : [];
    base.reportFilter = typeof base.reportFilter === 'string' ? base.reportFilter : 'all';
    base.aiModerationEnabled = Boolean(base.aiModerationEnabled);
    base.aiContentModerationEnabled = Boolean(base.aiContentModerationEnabled);
    base.flaggedContent = Array.isArray(base.flaggedContent) ? base.flaggedContent : [];
    base.darkModeEnabled = Boolean(base.darkModeEnabled);
    base.userTheme = typeof base.userTheme === 'string' ? base.userTheme : 'default';
    base.viralPosts = base.viralPosts && typeof base.viralPosts === 'object' && !Array.isArray(base.viralPosts)
        ? base.viralPosts
        : {};
    base.viralNotificationQueue = Array.isArray(base.viralNotificationQueue) ? base.viralNotificationQueue : [];
    base.lastPostTime = Number(base.lastPostTime) || 0;
    base.postCooldown = Number(base.postCooldown) || 30000;
    base.autoPostEnabled = Boolean(base.autoPostEnabled);
    base.lastAutoPostTime = Number(base.lastAutoPostTime) || 0;
    base.autoPostInterval = Number(base.autoPostInterval) || 300000;
    base.contentDeletionTime = Number(base.contentDeletionTime) || 10;
    base.playerId = typeof base.playerId === 'string' && base.playerId ? base.playerId : `player_${fallbackId}_${Math.random().toString(36).slice(2, 11)}`;
    base.lastHeartbeat = Number(base.lastHeartbeat) || Date.now();
    base.sessionStartTime = Number(base.sessionStartTime) || Date.now();
    base.peakFollowers = Number(base.peakFollowers) || 0;
    base.totalViralPosts = Number(base.totalViralPosts) || 0;
    base.milestones = Array.isArray(base.milestones) ? base.milestones : [];
    base.trendingHashtags = base.trendingHashtags && typeof base.trendingHashtags === 'object' && !Array.isArray(base.trendingHashtags)
        ? base.trendingHashtags
        : {};
    base.engagementData = base.engagementData && typeof base.engagementData === 'object' && !Array.isArray(base.engagementData)
        ? base.engagementData
        : {};
    base.isLive = Boolean(base.isLive);
    base.liveStartTime = Number(base.liveStartTime) || 0;
    base.totalLiveStreams = Number(base.totalLiveStreams) || 0;
    base.totalLiveViewers = Number(base.totalLiveViewers) || 0;
    base.lastUpdateTime = Number(base.lastUpdateTime) || Date.now();
    base.sessionFollowers = Number(base.sessionFollowers) || 0;
    base.sessionLikes = Number(base.sessionLikes) || 0;
    base.sessionShares = Number(base.sessionShares) || 0;
    base.sessionComments = Number(base.sessionComments) || 0;
    base.lastFollowerNotification = Number(base.lastFollowerNotification) || 0;
    base.lastLikeNotification = Number(base.lastLikeNotification) || 0;
    base.lastShareNotification = Number(base.lastShareNotification) || 0;
    base.lastCommentNotification = Number(base.lastCommentNotification) || 0;
    base.lastProfileShoutoutAt = Number(base.lastProfileShoutoutAt) || 0;
    base.pendingShoutoutFollowers = Number(base.pendingShoutoutFollowers) || 0;
    base.activeBadge = base.activeBadge || null;
    base.ownerTheme = typeof base.ownerTheme === 'string' ? base.ownerTheme : 'default';
    base.gameAnnouncements = Array.isArray(base.gameAnnouncements) ? base.gameAnnouncements : [];
    base.seenAnnouncements = Array.isArray(base.seenAnnouncements) ? base.seenAnnouncements : [];
    base.ownerRewards = Array.isArray(base.ownerRewards) ? base.ownerRewards : [];
    base.ownerMultiplier = typeof getGlobalGrowthMultiplier === 'function'
        ? getGlobalGrowthMultiplier()
        : Number(base.ownerMultiplier) || 1;

    return base;
}

// Initialize user management
function initializeUserManagement() {
    try {
        const savedUsers = localStorage.getItem('simstaUsers');
        const oldGameData = localStorage.getItem('socialClimbGame');
        let loadedUsers = {};

        if (savedUsers) {
            try {
                const parsedUsers = JSON.parse(savedUsers);
                if (parsedUsers && typeof parsedUsers === 'object' && !Array.isArray(parsedUsers)) {
                    loadedUsers = parsedUsers;
                }
            } catch (e) {
                console.error('Error parsing saved users:', e);
            }
        }

        users = loadedUsers;

        if (!users.default) {
            let migratedDefault = null;
            if (oldGameData) {
                try {
                    migratedDefault = JSON.parse(oldGameData);
                } catch (e) {
                    console.error('Error parsing old game data:', e);
                }
            }

            const defaultPlayerId =
                migratedDefault?.playerId || `player_default_${Math.random().toString(36).slice(2, 11)}`;
            const defaultTemplate = createBaseUserRecord({
                id: 'default',
                playerId: defaultPlayerId,
            });

            users.default = normalizeUserRecord(
                migratedDefault
                    ? {
                          ...defaultTemplate,
                          ...migratedDefault,
                          id: 'default',
                          playerId: migratedDefault.playerId || defaultPlayerId,
                      }
                    : defaultTemplate,
                'default'
            );
            saveUsers();
        } else {
            users.default = normalizeUserRecord(users.default, 'default');
        }
        currentUserId = 'default';
        loadUser(currentUserId);

        if (!gameState.lastAutoPostTime) {
            gameState.lastAutoPostTime = Date.now();
        }

        gameState.ownerMultiplier = typeof getGlobalGrowthMultiplier === 'function'
            ? getGlobalGrowthMultiplier()
            : Number(gameState.ownerMultiplier) || 1;
    } catch (error) {
        console.error('ERROR in initializeUserManagement:', error);
    }
}

// Save users to localStorage
function saveUsers() {
    try {
        const data = JSON.stringify(users);
        localStorage.setItem('simstaUsers', data);
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}



// Load user data into gameState
function loadUser(userId) {
    if (!users[userId]) {
        console.log('loadUser - user not found:', userId);
        return;
    }

    // Save current user's data before switching (only if switching to a DIFFERENT user)
    if (currentUserId && users[currentUserId] && currentUserId !== userId) {
        users[currentUserId] = normalizeUserRecord(JSON.parse(JSON.stringify(gameState)), currentUserId);
        saveUsers();
    }

    currentUserId = userId;
    users[userId] = normalizeUserRecord(users[userId], userId);
    const userData = users[userId];

    // Backfill keys for older save data so profile switches don't inherit prior user's UI state.
    let needsSave = false;
    if (!Object.prototype.hasOwnProperty.call(userData, 'userTheme')) {
        userData.userTheme = 'default';
        needsSave = true;
    }
    if (!Object.prototype.hasOwnProperty.call(userData, 'seenAnnouncements')) {
        userData.seenAnnouncements = [];
        needsSave = true;
    }
    if (!Object.prototype.hasOwnProperty.call(userData, 'ownerTheme')) {
        userData.ownerTheme = 'default';
        needsSave = true;
    }
    if (typeof userData.darkModeEnabled !== 'boolean') {
        userData.darkModeEnabled = false;
        needsSave = true;
    }
    if (typeof userData.lastProfileShoutoutAt !== 'number') {
        userData.lastProfileShoutoutAt = 0;
        needsSave = true;
    }
    if (typeof userData.pendingShoutoutFollowers !== 'number') {
        userData.pendingShoutoutFollowers = 0;
        needsSave = true;
    }
    if (!['all', 'good', 'bad'].includes(userData.exploreSortFilter)) {
        userData.exploreSortFilter = 'all';
        needsSave = true;
    }
    if (!Array.isArray(userData.bannedPlayers)) {
        userData.bannedPlayers = [];
        needsSave = true;
    } else if (userData.bannedPlayers.length > 2000) {
        userData.bannedPlayers = userData.bannedPlayers.slice(-2000);
        needsSave = true;
    }
    if (!userData.warnedPlayers || typeof userData.warnedPlayers !== 'object' || Array.isArray(userData.warnedPlayers)) {
        userData.warnedPlayers = {};
        needsSave = true;
    } else {
        const warningEntries = Object.entries(userData.warnedPlayers);
        if (warningEntries.length > 2000) {
            userData.warnedPlayers = Object.fromEntries(warningEntries.slice(-2000));
            needsSave = true;
        }
    }
    if (!Array.isArray(userData.playerReports)) {
        userData.playerReports = [];
        needsSave = true;
    }
    if (!Array.isArray(userData.fakePlayerPosts)) {
        userData.fakePlayerPosts = [];
        needsSave = true;
    } else if (userData.fakePlayerPosts.length > 200) {
        // Prevent oversized explore caches from slowing profile loads.
        userData.fakePlayerPosts = userData.fakePlayerPosts.slice(0, 200);
        needsSave = true;
    }
    if (needsSave) {
        saveUsers();
    }

    // Deep copy user data to gameState to avoid reference issues
    Object.assign(gameState, JSON.parse(JSON.stringify(userData)));

    // IMPORTANT: Reset lastUpdateTime to prevent huge elapsed time calculations on first update
    gameState.lastUpdateTime = Date.now();

    // Ensure UI preference fields always exist after assignment.
    gameState.userTheme = gameState.userTheme || 'default';
    gameState.seenAnnouncements = gameState.seenAnnouncements || [];
    gameState.ownerTheme = gameState.ownerTheme || 'default';
    const globalGrowthMultiplier = typeof getGlobalGrowthMultiplier === 'function'
        ? getGlobalGrowthMultiplier()
        : 1;
    if (Number(gameState.ownerMultiplier) !== globalGrowthMultiplier) {
        gameState.ownerMultiplier = globalGrowthMultiplier;
        userData.ownerMultiplier = globalGrowthMultiplier;
        needsSave = true;
    }
    if (typeof gameState.darkModeEnabled !== 'boolean') {
        gameState.darkModeEnabled = false;
    }
    if (typeof gameState.lastProfileShoutoutAt !== 'number') {
        gameState.lastProfileShoutoutAt = 0;
    }
    if (typeof gameState.pendingShoutoutFollowers !== 'number') {
        gameState.pendingShoutoutFollowers = 0;
    }
    if (!['all', 'good', 'bad'].includes(gameState.exploreSortFilter)) {
        gameState.exploreSortFilter = 'all';
    }
    if (!Array.isArray(gameState.bannedPlayers)) {
        gameState.bannedPlayers = [];
    } else if (gameState.bannedPlayers.length > 2000) {
        gameState.bannedPlayers = gameState.bannedPlayers.slice(-2000);
    }
    if (!gameState.warnedPlayers || typeof gameState.warnedPlayers !== 'object' || Array.isArray(gameState.warnedPlayers)) {
        gameState.warnedPlayers = {};
    } else {
        const warningEntries = Object.entries(gameState.warnedPlayers);
        if (warningEntries.length > 2000) {
            gameState.warnedPlayers = Object.fromEntries(warningEntries.slice(-2000));
        }
    }
    if (!Array.isArray(gameState.playerReports)) {
        gameState.playerReports = [];
    }
    if (!Array.isArray(gameState.fakePlayerPosts)) {
        gameState.fakePlayerPosts = [];
    } else if (gameState.fakePlayerPosts.length > 200) {
        gameState.fakePlayerPosts = gameState.fakePlayerPosts.slice(0, 200);
    }

    // Session stats are per active play session; reset whenever a profile is loaded.
    resetSessionTracking();

    // Initialize player count for this user if it doesn't exist
    const playerCountKey = `playerCount_${userId}`;
    if (!localStorage.getItem(playerCountKey)) {
        localStorage.setItem(playerCountKey, '1');
    }

    // Fix timestamps
    if (gameState.posts) {
        gameState.posts.forEach(post => {
            if (post.timestamp && typeof post.timestamp === 'string') {
                post.timestamp = new Date(post.timestamp);
            }
        });
    }
    if (gameState.videos) {
        gameState.videos.forEach(video => {
            if (video.timestamp && typeof video.timestamp === 'string') {
                video.timestamp = new Date(video.timestamp);
            }
        });
    }
    if (gameState.messages) {
        gameState.messages.forEach(message => {
            if (message.timestamp && typeof message.timestamp === 'string') {
                message.timestamp = new Date(message.timestamp);
            }
        });
    }

    // Apply the loaded profile's visual state immediately.
    if (typeof toggleDarkMode === 'function') {
        toggleDarkMode(gameState.darkModeEnabled);
    }
    if (typeof applyProfileThemeOnUserSwitch === 'function') {
        applyProfileThemeOnUserSwitch();
    }

    // Update UI
    updateProfileUI();
}

// Create new user
function createNewUser(username, profilePicture) {
    if (!username || username.trim() === '') {
        addNotification('❌ Username cannot be empty!', 'info');
        return false;
    }

    // Prevent anyone from using the reserved username "Sienna"
    if (username.trim().toLowerCase() === 'sienna') {
        addNotification('❌ This username is reserved and cannot be used!', 'info');
        return false;
    }

    // Generate unique user ID
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const playerId = 'player_' + userId;

    // Create new user with the shared base template so all profile records stay consistent.
    const newUser = normalizeUserRecord(
        createBaseUserRecord({
            id: userId,
            username: username.trim(),
            profilePicture: profilePicture || 'girl1',
            followers: 1,
            playerId: playerId,
            lastAutoPostTime: Date.now(),
            lastUpdateTime: Date.now(),
        }),
        userId
    );

    users[userId] = newUser;
    saveUsers();

    // Initialize player count for new user
    const playerCountKey = `playerCount_${userId}`;
    localStorage.setItem(playerCountKey, '1');

    addNotification(`✨ User "${username}" created successfully!`, 'info');
    renderUserProfiles();
    return userId;
}

// Switch to a different user
function switchUser(userId) {
    if (!users[userId]) {
        console.error('User not found:', userId);
        return;
    }

    if (userId === currentUserId) {
        return; // Already on this user
    }

    // Save current user's data before switching
    if (currentUserId && users[currentUserId]) {
        users[currentUserId] = JSON.parse(JSON.stringify(gameState));
        saveUsers();
    }

    // Load the new user
    loadUser(userId);
    renderUI();
    renderUserProfiles();
    addNotification(`👤 Switched to ${gameState.username}`, 'info');
}

// Delete user
function deleteUser(userId) {
    if (userId === 'default') {
        addNotification('❌ Cannot delete the default user!', 'info');
        return;
    }

    showConfirmation(`Delete user "${users[userId].username}"? This action cannot be undone!`, () => {
        delete users[userId];
        saveUsers();

        // Delete player count for this user
        const playerCountKey = `playerCount_${userId}`;
        localStorage.removeItem(playerCountKey);

        if (currentUserId === userId) {
            loadUser('default');
            renderUI();
        }

        renderUserProfiles();
        addNotification('🗑️ User deleted successfully', 'info');
    });
}

// Render user profiles list
function renderUserProfiles() {
    const container = document.getElementById('userProfilesList');
    if (!container) return;

    container.innerHTML = '';
    const shoutoutCooldownRemainingMs = getProfileShoutoutCooldownRemainingMs(gameState);
    const shoutoutOnCooldown = shoutoutCooldownRemainingMs > 0;
    const shoutoutButtonLabel = shoutoutOnCooldown
        ? `⏳ ${formatCooldownTime(shoutoutCooldownRemainingMs)}`
        : '📣 Shoutout';
    const shoutoutButtonTitle = shoutoutOnCooldown
        ? `Shoutout ready in ${formatCooldownTime(shoutoutCooldownRemainingMs)}`
        : 'Give this profile a follower boost';

    // Get all users and sort them (default first, then by creation time)
    const userIds = Object.keys(users).sort((a, b) => {
        if (a === 'default') return -1;
        if (b === 'default') return 1;
        return 0;
    });

    userIds.forEach(userId => {
        const user = users[userId];
        const isActive = userId === currentUserId;
        const canDelete = userId !== 'default';
        const profileEmoji = PROFILE_PICTURE_MAP[user.profilePicture] || user.profilePicture;

        const card = document.createElement('div');
        card.className = `user-profile-card ${isActive ? 'active' : ''}`;
        card.dataset.userId = userId;
        const postCount = Array.isArray(user.posts) ? user.posts.length : 0;

        card.innerHTML = `
            <div class="user-profile-avatar">${profileEmoji}</div>
            <div class="user-profile-info">
                <div class="user-profile-name">${user.username}</div>
                <div class="user-profile-stats">
                    ${formatNumber(user.followers)} followers • ${postCount} posts
                </div>
            </div>
                        ${!isActive ? `
                <div class="user-profile-actions">
                    <button class="user-profile-shoutout-btn" onclick="giveProfileShoutout('${userId}'); event.stopPropagation();" title="${shoutoutButtonTitle}" ${shoutoutOnCooldown ? 'disabled' : ''}>${shoutoutButtonLabel}</button>
                    ${canDelete ? `<button class="user-profile-delete-btn" onclick="deleteUser('${userId}'); event.stopPropagation();">🗑️</button>` : ''}
                </div>
            ` : ''}
        `;

        card.addEventListener('click', () => {
            switchUser(userId);
        });

        container.appendChild(card);
    });
}

function updateUserProfileCardsInPlace() {
    const container = document.getElementById('userProfilesList');
    if (!container || !currentUserId) return;

    const cards = Array.from(container.querySelectorAll('.user-profile-card'));
    if (cards.length === 0) {
        renderUserProfiles();
        return;
    }

    const shoutoutCooldownRemainingMs = getProfileShoutoutCooldownRemainingMs(gameState);
    const shoutoutOnCooldown = shoutoutCooldownRemainingMs > 0;
    const shoutoutButtonLabel = shoutoutOnCooldown
        ? `⏳ ${formatCooldownTime(shoutoutCooldownRemainingMs)}`
        : '📣 Shoutout';
    const shoutoutButtonTitle = shoutoutOnCooldown
        ? `Shoutout ready in ${formatCooldownTime(shoutoutCooldownRemainingMs)}`
        : 'Give this profile a follower boost';

    let needsFullRender = false;

    cards.forEach(card => {
        const userId = card.dataset.userId;
        const user = users[userId];
        if (!user) {
            needsFullRender = true;
            return;
        }

        const isActive = userId === currentUserId;
        const profileEmoji = isActive
            ? (PROFILE_PICTURE_MAP[gameState.profilePicture] || gameState.profilePicture)
            : (PROFILE_PICTURE_MAP[user.profilePicture] || user.profilePicture);
        const followers = isActive ? Number(gameState.followers) || 0 : Number(user.followers) || 0;
        const postCount = isActive
            ? (Array.isArray(gameState.posts) ? gameState.posts.length : 0)
            : (Array.isArray(user.posts) ? user.posts.length : 0);
        const username = isActive ? gameState.username : user.username;

        const avatarEl = card.querySelector('.user-profile-avatar');
        if (avatarEl) avatarEl.textContent = profileEmoji;

        const nameEl = card.querySelector('.user-profile-name');
        if (nameEl) nameEl.textContent = username;

        const statsEl = card.querySelector('.user-profile-stats');
        if (statsEl) {
            statsEl.textContent = `${formatNumber(followers)} followers • ${postCount} posts`;
        }

        card.classList.toggle('active', isActive);
    });

    if (needsFullRender) {
        renderUserProfiles();
        return;
    }

    container.querySelectorAll('.user-profile-shoutout-btn').forEach(btn => {
        btn.disabled = shoutoutOnCooldown;
        btn.textContent = shoutoutButtonLabel;
        btn.title = shoutoutButtonTitle;
    });
}

// Update the currently active profile card without rebuilding the whole list.
// Rebuilding on every UI refresh causes hover/focus flicker and makes clicks unreliable.
function updateCurrentUserProfileCard() {
    updateUserProfileCardsInPlace();
}

// Update profile UI
function updateProfileUI() {
    const usernameEl = document.getElementById('username');
    if (usernameEl) usernameEl.textContent = gameState.username;

    const handleEl = document.getElementById('usernameHandle');
    if (handleEl) handleEl.textContent = gameState.username.toLowerCase().replace(/\s+/g, '');

    const followerCountEl = document.getElementById('followerCount');
    if (followerCountEl) followerCountEl.textContent = formatNumber(gameState.followers);

    const postCountEl = document.getElementById('postCount');
    if (postCountEl) postCountEl.textContent = Array.isArray(gameState.posts) ? gameState.posts.length : 0;

    const totalLikesEl = document.getElementById('totalLikes');
    if (totalLikesEl) totalLikesEl.textContent = formatNumber(gameState.totalLikes);

    const totalViewsEl = document.getElementById('totalViews');
    if (totalViewsEl) totalViewsEl.textContent = formatNumber(gameState.totalViews);

    // Update user profiles list
    renderUserProfiles();
}

// Real-time multi-tab synchronization for announcements
window.addEventListener('storage', (event) => {
    if (event.key === 'simstaUsers') {
        try {
            const newUsers = JSON.parse(event.newValue);
            if (newUsers && currentUserId && newUsers[currentUserId]) {
                users = newUsers;
            }
        } catch (e) {
            console.error('Error syncing users:', e);
        }
    }

    if (event.key === GLOBAL_GROWTH_MULTIPLIER_KEY) {
        const multiplier = typeof getGlobalGrowthMultiplier === 'function'
            ? getGlobalGrowthMultiplier()
            : Number(event.newValue) || 1;
        gameState.ownerMultiplier = multiplier;
        if (users && currentUserId && users[currentUserId]) {
            users[currentUserId].ownerMultiplier = multiplier;
        }
        if (typeof renderGrowthControls === 'function') {
            renderGrowthControls();
        }
    }

    // Sync global announcements instantly across tabs
    if (event.key === 'simstaGlobalAnnouncements') {
        if (typeof checkNewAnnouncements === 'function') {
            checkNewAnnouncements();
        }
        if (typeof renderGameAnnouncements === 'function') {
            renderGameAnnouncements();
        }
    }
});
