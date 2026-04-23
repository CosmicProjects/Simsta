// Leaderboards System (real player profiles only)

let currentLeaderboardType = 'followers';

// Initialize leaderboard event listeners
function initializeLeaderboards() {
    document.querySelectorAll('.leaderboard-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.leaderboardType;
            switchLeaderboardType(type);
        });
    });
}

// Switch leaderboard type
function switchLeaderboardType(type) {
    currentLeaderboardType = type;

    document.querySelectorAll('.leaderboard-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeBtn = document.querySelector(`[data-leaderboard-type="${type}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    const container = document.querySelector('.leaderboard-list');
    if (container) {
        container.style.opacity = '0';
        container.style.transition = 'opacity 0.2s ease';

        setTimeout(() => {
            renderLeaderboard(type);
            container.style.opacity = '1';
        }, 150);
    } else {
        renderLeaderboard(type);
    }
}

function getCurrentUserKey() {
    if (typeof currentUserId === 'string' && currentUserId) {
        return currentUserId;
    }
    return 'default';
}

function toLeaderboardPlayer(userId, userData) {
    const username = (userData && userData.username) ? userData.username : 'Player';
    const picture = (userData && userData.profilePicture) ? userData.profilePicture : 'girl1';
    const avatar = PROFILE_PICTURE_MAP[picture] || picture || '👤';
    const posts = Array.isArray(userData?.posts) ? userData.posts.length : 0;
    const viral = typeof userData?.totalViralPosts === 'number'
        ? userData.totalViralPosts
        : Object.keys(userData?.viralPosts || {}).length;

    return {
        id: userId,
        username,
        avatar,
        followers: Number(userData?.followers) || 0,
        likes: Number(userData?.totalLikes) || 0,
        views: Number(userData?.totalViews) || 0,
        posts,
        viral,
    };
}

function getAllRealPlayers() {
    const map = {};
    const currentKey = getCurrentUserKey();

    if (typeof users !== 'undefined' && users && typeof users === 'object') {
        Object.entries(users).forEach(([userId, userData]) => {
            map[userId] = toLeaderboardPlayer(userId, userData || {});
        });
    }

    // Always use live in-memory values for the active profile.
    map[currentKey] = {
        id: currentKey,
        username: gameState.username || 'Player',
        avatar: PROFILE_PICTURE_MAP[gameState.profilePicture] || gameState.profilePicture || '👤',
        followers: Number(gameState.followers) || 0,
        likes: Number(gameState.totalLikes) || 0,
        views: Number(gameState.totalViews) || 0,
        posts: Array.isArray(gameState.posts) ? gameState.posts.length : 0,
        viral: typeof gameState.totalViralPosts === 'number'
            ? gameState.totalViralPosts
            : Object.keys(gameState.viralPosts || {}).length,
    };

    return Object.values(map);
}

// Render leaderboard based on type
function renderLeaderboard(type) {
    const container = document.querySelector('.leaderboard-list');
    if (!container) return;

    const allPlayers = getAllRealPlayers();
    const currentKey = getCurrentUserKey();
    const sortType = ['followers', 'likes', 'views', 'posts', 'viral'].includes(type) ? type : 'followers';
    const sortedPlayers = [...allPlayers].sort((a, b) => {
        const primary = getLeaderboardValue(b, sortType) - getLeaderboardValue(a, sortType);
        if (primary !== 0) return primary;
        return a.username.localeCompare(b.username);
    });

    container.innerHTML = sortedPlayers.slice(0, 10).map((player, index) => {
        const rank = index + 1;
        const value = getLeaderboardValue(player, sortType);
        const isCurrentPlayer = player.id === currentKey;
        const topClass = rank <= 3 ? `top-${rank}` : '';
        const safeUsername = escapeHtml(player.username);
        const safeHandle = escapeHtml(player.username.toLowerCase().replace(/\s+/g, ''));

        return `
            <div class="leaderboard-entry ${topClass}">
                <div class="leaderboard-rank">${rank}</div>
                <div class="leaderboard-avatar">${player.avatar}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-username">${safeUsername}${isCurrentPlayer ? ' (You)' : ''}</div>
                    <div class="leaderboard-handle">@${safeHandle}</div>
                </div>
                <div class="leaderboard-value">${formatNumber(value)}</div>
            </div>
        `;
    }).join('');

    updateYourRank(sortedPlayers, sortType, currentKey);
}

// Get leaderboard value based on type
function getLeaderboardValue(player, type) {
    switch (type) {
        case 'followers': return player.followers;
        case 'likes': return player.likes;
        case 'views': return player.views;
        case 'posts': return player.posts;
        case 'viral': return player.viral;
        default: return 0;
    }
}

// Update your rank display
function updateYourRank(sortedPlayers, type, currentKey) {
    const yourRankNumber = document.getElementById('yourRankNumber');
    const yourRankUsername = document.getElementById('yourRankUsername');
    const yourRankValue = document.getElementById('yourRankValue');

    const yourPlayer = sortedPlayers.find(p => p.id === currentKey);
    const yourRank = sortedPlayers.findIndex(p => p.id === currentKey) + 1;
    const value = yourPlayer ? getLeaderboardValue(yourPlayer, type) : 0;

    if (yourRankNumber) yourRankNumber.textContent = yourRank > 0 ? yourRank : '-';
    if (yourRankUsername) yourRankUsername.textContent = gameState.username || 'Player';
    if (yourRankValue) yourRankValue.textContent = formatNumber(value);
}
