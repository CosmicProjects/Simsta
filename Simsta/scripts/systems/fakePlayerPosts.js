// Fake Player Posts System

const FAKE_PLAYER_POST_INTERVAL_MS = 15000;
const FAKE_PLAYER_MIN_POSTS = 10;
const FAKE_PLAYER_MAX_POSTS = 50;
const FAKE_PLAYER_MAX_SANITIZE_WINDOW = 150;
const FAKE_PLAYER_MAX_BANNED_PLAYERS = 2000;
let lastDeepSanitizeAt = 0;

function randomFakeAvatar() {
    const avatars = [
        '\uD83D\uDE0A', '\uD83D\uDE0D', '\uD83D\uDE0E', '\uD83E\uDD70', '\uD83D\uDE18',
        '\uD83E\uDD73', '\uD83D\uDC96', '\u2728', '\uD83D\uDC51', '\uD83D\uDC84',
        '\uD83D\uDC85', '\uD83C\uDF38', '\uD83C\uDF89', '\uD83D\uDD25', '\u2B50'
    ];
    return avatars[Math.floor(Math.random() * avatars.length)];
}

function sanitizeNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

function generateUnbannedFakeUsername() {
    ensureFakePlayerState();

    for (let i = 0; i < 30; i++) {
        const candidate = generateRandomUsername();
        if (!gameState.bannedPlayers.includes(candidate)) {
            return candidate;
        }
    }

    // Fallback: use suffixed handles so profiles with long ban lists never run out of names.
    for (let i = 0; i < 30; i++) {
        const base = generateRandomUsername().replace(/\s+/g, '');
        const candidate = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
        if (!gameState.bannedPlayers.includes(candidate)) {
            return candidate;
        }
    }

    return `Explorer${Date.now().toString().slice(-6)}`;
}

function toTimestamp(value) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : Date.now();
}

function normalizeFakePost(rawPost) {
    if (!rawPost || typeof rawPost !== 'object') return null;

    const username = String(rawPost.username || '').trim();
    const content = String(rawPost.content || '').trim();
    if (!username || !content) return null;

    return {
        id: Number.isFinite(Number(rawPost.id)) ? Number(rawPost.id) : (Date.now() + Math.random()),
        username,
        content,
        likes: sanitizeNumber(rawPost.likes),
        shares: sanitizeNumber(rawPost.shares),
        comments: sanitizeNumber(rawPost.comments),
        views: sanitizeNumber(rawPost.views),
        timestamp: toTimestamp(rawPost.timestamp),
        avatar: String(rawPost.avatar || randomFakeAvatar()),
        isVerified: !!rawPost.isVerified,
        isBadPost: !!rawPost.isBadPost,
    };
}

function ensureFakePlayerState(force = false) {
    if (!Array.isArray(gameState.fakePlayerPosts)) {
        gameState.fakePlayerPosts = [];
    } else if (gameState.fakePlayerPosts.length > FAKE_PLAYER_MAX_SANITIZE_WINDOW) {
        // Fast cap before deeper cleanup.
        gameState.fakePlayerPosts = gameState.fakePlayerPosts.slice(0, FAKE_PLAYER_MAX_SANITIZE_WINDOW);
    }

    const now = Date.now();
    const shouldDeepSanitize = force || (now - lastDeepSanitizeAt >= 5000);

    if (shouldDeepSanitize) {
        const normalizedPosts = [];
        for (let i = 0; i < gameState.fakePlayerPosts.length; i++) {
            const normalized = normalizeFakePost(gameState.fakePlayerPosts[i]);
            if (normalized) {
                normalizedPosts.push(normalized);
                if (normalizedPosts.length >= FAKE_PLAYER_MAX_POSTS) break;
            }
        }
        gameState.fakePlayerPosts = normalizedPosts;
        lastDeepSanitizeAt = now;
    } else if (gameState.fakePlayerPosts.length > FAKE_PLAYER_MAX_POSTS) {
        gameState.fakePlayerPosts = gameState.fakePlayerPosts.slice(0, FAKE_PLAYER_MAX_POSTS);
    }

    if (!Array.isArray(gameState.bannedPlayers)) {
        gameState.bannedPlayers = [];
    } else if (shouldDeepSanitize) {
        gameState.bannedPlayers = gameState.bannedPlayers
            .map(name => String(name || '').trim())
            .filter(Boolean)
            .slice(-FAKE_PLAYER_MAX_BANNED_PLAYERS);
    } else if (gameState.bannedPlayers.length > FAKE_PLAYER_MAX_BANNED_PLAYERS) {
        gameState.bannedPlayers = gameState.bannedPlayers.slice(-FAKE_PLAYER_MAX_BANNED_PLAYERS);
    }

    if (!gameState.warnedPlayers || typeof gameState.warnedPlayers !== 'object' || Array.isArray(gameState.warnedPlayers)) {
        gameState.warnedPlayers = {};
    }

    if (!['all', 'good', 'bad'].includes(gameState.exploreSortFilter)) {
        gameState.exploreSortFilter = 'all';
    }

    if (!Number.isFinite(Number(gameState.lastFakePlayerPostTime))) {
        gameState.lastFakePlayerPostTime = 0;
    } else {
        const now = Date.now();
        const ts = Number(gameState.lastFakePlayerPostTime);
        // Guard against corrupted future timestamps that can freeze post generation.
        if (ts > now + FAKE_PLAYER_POST_INTERVAL_MS) {
            gameState.lastFakePlayerPostTime = 0;
        }
    }
}

function generateFakePlayerPost() {
    const username = generateUnbannedFakeUsername();
    const isBadPost = Math.random() < 0.2;

    let content = '';
    if (isBadPost) {
        content = BAD_POST_TEMPLATES[Math.floor(Math.random() * BAD_POST_TEMPLATES.length)];
    } else {
        content = `${generateRandomPost()} ${generateRandomHashtags(3)}`.trim();
    }

    const engagementMultiplier = isBadPost ? 0.1 : 1;

    return {
        id: Date.now() + Math.random(),
        username,
        content,
        likes: Math.floor(Math.random() * 1000 * engagementMultiplier),
        shares: Math.floor(Math.random() * 100 * engagementMultiplier),
        comments: Math.floor(Math.random() * 500 * engagementMultiplier),
        views: Math.floor(Math.random() * 5000 * engagementMultiplier),
        timestamp: Date.now() - Math.random() * 600000,
        avatar: randomFakeAvatar(),
        isVerified: Math.random() > 0.8,
        isBadPost,
    };
}

function initializeFakePlayerPosts(minCount = FAKE_PLAYER_MIN_POSTS) {
    ensureFakePlayerState(true);

    while (gameState.fakePlayerPosts.length < minCount) {
        gameState.fakePlayerPosts.push(generateFakePlayerPost());
    }
}

function addNewFakePlayerPost() {
    ensureFakePlayerState(false);
    gameState.fakePlayerPosts.unshift(generateFakePlayerPost());

    if (gameState.fakePlayerPosts.length > FAKE_PLAYER_MAX_POSTS) {
        gameState.fakePlayerPosts = gameState.fakePlayerPosts.slice(0, FAKE_PLAYER_MAX_POSTS);
    }
}

function maybeGenerateFakePlayerPost(force = false) {
    const now = Date.now();
    const lastPostTime = Number(gameState.lastFakePlayerPostTime) || 0;

    if (!force && lastPostTime && now - lastPostTime < FAKE_PLAYER_POST_INTERVAL_MS) {
        return false;
    }

    ensureFakePlayerState(false);
    gameState.lastFakePlayerPostTime = now;
    addNewFakePlayerPost();
    return true;
}

function exploreIsPlayerBanned(username) {
    ensureFakePlayerState(false);
    return gameState.bannedPlayers.includes(username);
}

function exploreGetPlayerWarnings(username) {
    ensureFakePlayerState(false);
    return gameState.warnedPlayers[username] || 0;
}

function exploreBanPlayer(username) {
    ensureFakePlayerState(true);
    const name = String(username || '').trim();
    if (!name) return;
    if (gameState.bannedPlayers.includes(name)) return;

    gameState.bannedPlayers.push(name);
    gameState.fakePlayerPosts = gameState.fakePlayerPosts.filter(post => post.username !== name);

    addNotification(`Banned ${name}`, 'warning');
    saveGame();
    renderFakePlayerFeed();
}

function exploreWarnPlayer(username) {
    ensureFakePlayerState(true);
    const name = String(username || '').trim();
    if (!name) return;

    if (!gameState.warnedPlayers[name]) {
        gameState.warnedPlayers[name] = 0;
    }

    gameState.warnedPlayers[name]++;
    const warningCount = gameState.warnedPlayers[name];

    if (warningCount >= 3) {
        exploreBanPlayer(name);
        addNotification(`${name} was banned after 3 warnings`, 'warning');
        return;
    }

    addNotification(`Warning for ${name} (${warningCount}/3)`, 'warning');
    saveGame();
    renderFakePlayerFeed();
}

function getPostQuality(post) {
    const totalEngagement = sanitizeNumber(post.likes) + sanitizeNumber(post.comments) + sanitizeNumber(post.shares);
    const views = sanitizeNumber(post.views);
    const engagementRate = views > 0 ? (totalEngagement / views) * 100 : 0;

    if (engagementRate >= 5 || totalEngagement > 500) return 'good';
    if (engagementRate < 1 && totalEngagement < 50) return 'bad';
    return 'neutral';
}

function syncExploreSortButtons() {
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-sort') === gameState.exploreSortFilter);
    });
}

function setSortFilter(filter) {
    ensureFakePlayerState(false);
    gameState.exploreSortFilter = ['all', 'good', 'bad'].includes(filter) ? filter : 'all';
    syncExploreSortButtons();
    renderFakePlayerFeed();
}

function getVisibleExplorePosts() {
    let visiblePosts = gameState.fakePlayerPosts.filter(post => post && !exploreIsPlayerBanned(post.username));

    if (gameState.exploreSortFilter === 'good') {
        visiblePosts = visiblePosts.filter(post => !post.isBadPost && getPostQuality(post) === 'good');
    } else if (gameState.exploreSortFilter === 'bad') {
        visiblePosts = visiblePosts.filter(post => post.isBadPost || getPostQuality(post) === 'bad');
    }

    visiblePosts.sort((a, b) => b.timestamp - a.timestamp);
    return visiblePosts;
}

function renderFakePlayerFeed() {
    const container = document.getElementById('fakePlayerFeedContainer');
    if (!container) return;

    ensureFakePlayerState(true);
    initializeFakePlayerPosts();
    syncExploreSortButtons();

    let visiblePosts = getVisibleExplorePosts();

    // Self-heal if old/bad saves left no valid all-post content.
    if (visiblePosts.length === 0 && gameState.exploreSortFilter === 'all') {
        initializeFakePlayerPosts(FAKE_PLAYER_MIN_POSTS);
        maybeGenerateFakePlayerPost(true);
        visiblePosts = getVisibleExplorePosts();
    }

    if (visiblePosts.length === 0) {
        const filterText = gameState.exploreSortFilter === 'good'
            ? 'good posts'
            : gameState.exploreSortFilter === 'bad'
                ? 'bad posts'
                : 'posts';
        const extraHint = gameState.exploreSortFilter === 'all'
            ? ''
            : ' Try "All Posts".';
        container.innerHTML = `<div class="empty-state"><p>No ${filterText} from other players yet.${extraHint}</p></div>`;
        return;
    }

    container.innerHTML = visiblePosts.map(post => {
        const safeUsername = encodeURIComponent(post.username);
        const verifiedBadge = post.isVerified ? '\u2713' : '';
        const engagement = sanitizeNumber(post.likes) + sanitizeNumber(post.comments) + sanitizeNumber(post.shares);
        const engagementRate = sanitizeNumber(post.views) > 0
            ? Math.min((engagement / sanitizeNumber(post.views)) * 100, 100).toFixed(1)
            : '0.0';

        let adminButtons = '';
        if (gameState.isAdmin) {
            const warningCount = exploreGetPlayerWarnings(post.username);
            const warningText = warningCount > 0 ? ` (${warningCount}/3)` : '';
            adminButtons = `
                <button class="warn-player-btn" onclick="exploreWarnPlayer(decodeURIComponent('${safeUsername}'))" title="Warn this player">Warn${warningText}</button>
                <button class="ban-player-btn" onclick="exploreBanPlayer(decodeURIComponent('${safeUsername}'))" title="Ban this player">Ban</button>
            `;
        }

        const quality = getPostQuality(post);
        let qualityBadge = '';
        if (post.isBadPost) {
            qualityBadge = '<span class="quality-badge bad-badge">Spam/Bad Post</span>';
        } else if (quality === 'good') {
            qualityBadge = '<span class="quality-badge good-badge">Good Post</span>';
        } else if (quality === 'bad') {
            qualityBadge = '<span class="quality-badge bad-badge">Low Engagement</span>';
        }

        const postClass = post.isBadPost ? 'post bad-post-item' : 'post';

        return `
        <div class="${postClass}" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-header-left">
                    <span>${post.avatar} @${escapeHtml(post.username)} ${verifiedBadge}</span>
                </div>
                <div class="post-header-right">
                    ${qualityBadge}
                    <div class="admin-buttons">
                        ${adminButtons}
                    </div>
                    <span class="post-time">${formatTime(post.timestamp)}</span>
                </div>
            </div>
            <div class="post-content">${formatContentWithClickableHashtags(post.content)}</div>
            <div class="post-stats">
                <span class="post-stat">Views ${formatNumber(post.views)}</span>
                <span class="post-stat">Likes ${formatNumber(post.likes)}</span>
                <span class="post-stat">Comments ${formatNumber(post.comments)}</span>
                <span class="post-stat">Shares ${formatNumber(post.shares)}</span>
                <span class="post-stat engagement-stat">Engagement ${engagementRate}%</span>
            </div>
        </div>
    `;
    }).join('');
}

function bootstrapFakePlayerPosts() {
    try {
        ensureFakePlayerState(true);
        initializeFakePlayerPosts();
    } catch (error) {
        console.error('Explore bootstrap error:', error);
    }
}
