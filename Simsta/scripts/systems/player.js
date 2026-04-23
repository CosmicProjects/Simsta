// Player and Profile Functions

function registerPlayer() {
    // Each user has their own player counter stored with their userId
    const playerCountKey = `playerCount_${currentUserId}`;

    // Only set it once if it doesn't exist
    if (!localStorage.getItem(playerCountKey)) {
        localStorage.setItem(playerCountKey, '1');
    }
}

function updatePlayerCounter() {
    // Get the player count for the current user
    const playerCountKey = `playerCount_${currentUserId}`;

    // Fix: Force player count to 1 for single player experience
    localStorage.setItem(playerCountKey, '1');
    const playerCount = '1';

    const counterElement = document.getElementById('playerCounter');
    if (counterElement) {
        counterElement.textContent = playerCount;
    }
}

function initializePlayerCounter() {
    // Initialize player counter for this user
    registerPlayer();
    updatePlayerCounter();
}

function generateFakePlayerProfile(username) {
    const seed = username.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const random = (min, max) => {
        const x = Math.sin(seed * 12.9898 + Math.random()) * 43758.5453;
        return min + (x - Math.floor(x)) * (max - min);
    };

    const avatars = ['😊', '😍', '😎', '🥰', '😘', '🥳', '💕', '✨', '👑', '💄', '💅', '🌸', '🎉', '🔥', '⭐'];
    const avatar = avatars[Math.floor(random(0, avatars.length))];

    const followers = Math.floor(random(100, 500000));
    const totalLikes = Math.floor(random(500, 2000000));
    const totalViews = Math.floor(random(1000, 5000000));
    const posts = Math.floor(random(5, 500));
    const totalShares = Math.floor(random(10, 100000));
    const isVerified = followers > 1000000;
    const fakeAccountFollowers = Math.floor(gameState.followers * 0.1);

    return {
        username,
        handle: username.toLowerCase().replace(/\s+/g, ''),
        avatar,
        followers,
        totalLikes,
        totalViews,
        posts,
        totalShares,
        isVerified,
        fakeAccountFollowers
    };
}

function showPlayerProfile(username) {
    const profile = generateFakePlayerProfile(username);
    const verifiedBadge = profile.isVerified ? '✓' : '';

    const profileHTML = `
        <div class="player-profile-modal">
            <div class="player-profile-content">
                <button class="close-profile-btn" onclick="closePlayerProfile()">✕</button>
                <div class="player-profile-header">
                    <div class="player-avatar">${profile.avatar}</div>
                    <div class="player-info">
                        <h2>${profile.username} ${verifiedBadge}</h2>
                        <p>@${profile.handle}</p>
                    </div>
                </div>
                <div class="player-stats">
                    <div class="stat"><span class="stat-label">Followers</span><span class="stat-value">${formatNumber(profile.followers)}</span></div>
                    <div class="stat"><span class="stat-label">Posts</span><span class="stat-value">${profile.posts}</span></div>
                    <div class="stat"><span class="stat-label">Likes</span><span class="stat-value">${formatNumber(profile.totalLikes)}</span></div>
                    <div class="stat"><span class="stat-label">Views</span><span class="stat-value">${formatNumber(profile.totalViews)}</span></div>
                </div>
                <div class="player-actions">
                    <button class="follow-btn" onclick="addFollower('${profile.username}')">Follow</button>
                </div>
            </div>
        </div>
    `;

    const modal = document.createElement('div');
    modal.id = 'playerProfileModal';
    modal.innerHTML = profileHTML;
    document.body.appendChild(modal);
}

function closePlayerProfile() {
    const modal = document.getElementById('playerProfileModal');
    if (modal) {
        modal.remove();
    }
}

function addFollower(username) {
    const followersBefore = Number(gameState.followers) || 0;
    const growthMultiplier = typeof getGlobalGrowthMultiplier === 'function'
        ? getGlobalGrowthMultiplier()
        : (Number(gameState.ownerMultiplier) || 1);
    const gainedFollowers = Math.max(1, Math.floor(((Math.floor(Math.random() * 10) + 1) * growthMultiplier)));
    const followersAfter = Math.min(GROWTH_RATES.maxFollowers, followersBefore + gainedFollowers);
    const appliedFollowerGain = Math.max(0, followersAfter - followersBefore);

    gameState.followers = followersAfter;
    gameState.sessionFollowers = (Number(gameState.sessionFollowers) || 0) + appliedFollowerGain;
    saveGame();

    if (appliedFollowerGain > 0) {
        addNotification(`You gained followers from ${username}!`, 'follow');
    } else {
        addNotification('Follower cap reached (1B)', 'info');
    }

    closePlayerProfile();
}

function warnPlayer(username) {
    if (!gameState.warnedPlayers) {
        gameState.warnedPlayers = {};
    }

    if (!gameState.warnedPlayers[username]) {
        gameState.warnedPlayers[username] = 0;
    }

    gameState.warnedPlayers[username]++;
    addNotification(`⚠️ ${username} has been warned (${gameState.warnedPlayers[username]} warning${gameState.warnedPlayers[username] > 1 ? 's' : ''})`, 'warning');
    saveGame();
}

function banPlayer(username) {
    if (!gameState.bannedPlayers) {
        gameState.bannedPlayers = [];
    }

    if (!gameState.bannedPlayers.includes(username)) {
        gameState.bannedPlayers.push(username);
        addNotification(`🚫 ${username} has been banned`, 'warning');
        saveGame();
    }
}
