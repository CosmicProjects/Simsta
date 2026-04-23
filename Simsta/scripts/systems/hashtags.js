// Hashtag & Trending System

function extractHashtags(content) {
    const hashtagRegex = /#[\w]+/g;
    const hashtags = content.match(hashtagRegex) || [];
    return hashtags.map(tag => tag.toLowerCase());
}

function formatContentWithClickableHashtags(content) {
    // Escape HTML first
    let escaped = escapeHtml(content);

    // Replace hashtags with clickable links
    const hashtagRegex = /#[\w]+/g;
    escaped = escaped.replace(hashtagRegex, (hashtag) => {
        return `<span class="clickable-hashtag" onclick="filterPostsByHashtag('${hashtag.toLowerCase()}')" style="cursor: pointer; color: var(--primary); font-weight: 600; text-decoration: underline;">${hashtag}</span>`;
    });

    return escaped;
}

function updateTrendingHashtags(hashtags) {
    hashtags.forEach(tag => {
        if (!gameState.trendingHashtags[tag]) {
            gameState.trendingHashtags[tag] = {
                count: 0,
                lastUpdated: Date.now(),
                engagement: 0,
            };
        }
        gameState.trendingHashtags[tag].count++;
        gameState.trendingHashtags[tag].lastUpdated = Date.now();
    });
}

function getTrendingHashtags(limit = 10) {
    const now = Date.now();
    const oneHourMs = 60 * 60 * 1000;

    // Filter hashtags from the last hour
    const recentHashtags = Object.entries(gameState.trendingHashtags)
        .filter(([tag, data]) => now - data.lastUpdated < oneHourMs)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, limit);

    return recentHashtags.map(([tag, data]) => ({ tag, count: data.count }));
}

function renderTrendingHashtags() {
    const container = document.getElementById('trendingHashtagsContainer');
    if (!container) return;

    const trending = getTrendingHashtags(15);

    if (trending.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>📊 No trending hashtags yet. Start using hashtags in your posts!</p></div>';
        return;
    }

    container.innerHTML = `
        <div class="trending-list">
            ${trending.map((item, index) => `
                <div class="trending-item" data-hashtag="${item.tag}">
                    <div class="trending-rank">#${index + 1}</div>
                    <div class="trending-info">
                        <div class="trending-tag">${item.tag}</div>
                        <div class="trending-count">${formatNumber(item.count)} posts</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Add click listeners to hashtags
    document.querySelectorAll('.trending-item').forEach(item => {
        item.addEventListener('click', () => {
            const hashtag = item.getAttribute('data-hashtag');
            filterPostsByHashtag(hashtag);
        });
    });
}

function filterPostsByHashtag(hashtag) {
    const container = document.getElementById('feedContainer');

    // Switch to posts tab to show filtered results
    switchFeedTab('posts');

    // Combine all types of posts
    const playerPosts = (gameState.posts || []).map(p => ({ ...p, isPlayer: true, type: 'post' }));
    const playerVideos = (gameState.videos || []).map(p => ({ ...p, isPlayer: true, type: 'video' }));
    const playerDuets = (gameState.duets || []).map(p => ({ ...p, isPlayer: true, type: 'duet' }));
    const fakePosts = (gameState.fakePlayerPosts || []).map(p => ({ ...p, isPlayer: false, type: 'post' }));

    const allContent = [...playerPosts, ...playerVideos, ...playerDuets, ...fakePosts];

    const filtered = allContent.filter(item => {
        if (!item.content) return false;
        const tags = extractHashtags(item.content);
        return tags.includes(hashtag.toLowerCase());
    });

    // Sort by newest first
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="search-header" style="margin-bottom: 20px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                <h3 style="margin: 0;">Search Results for ${hashtag}</h3>
                <button onclick="renderFeed()" style="margin-top: 10px; background: none; border: 1px solid var(--primary); color: var(--primary); padding: 4px 12px; border-radius: 4px; cursor: pointer;">← Back to Feed</button>
            </div>
            <div class="empty-state"><p>📝 No results found for ${hashtag}</p></div>
        `;
        return;
    }

    let html = `
        <div class="search-header" style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.08); border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h3 style="margin: 0; color: var(--primary);">${hashtag}</h3>
                <span style="font-size: 13px; color: #999;">${filtered.length} posts found</span>
            </div>
            <button onclick="renderFeed()" class="back-to-feed-btn" style="background: var(--primary); color: white; border: none; padding: 6px 16px; border-radius: 20px; cursor: pointer; font-weight: 600; font-size: 13px;">← Back to Feed</button>
        </div>
    `;

    html += filtered.map(item => {
        const isViral = item.isPlayer && !!gameState.viralPosts[item.id];
        const username = item.isPlayer ? `@${gameState.username}` : `@${item.username}`;
        const avatar = item.isPlayer ? (gameState.avatar || '👤') : (item.avatar || '👤');
        const isVerified = item.isPlayer ? gameState.isVerified : item.isVerified;
        const verifiedBadge = isVerified ? '✓' : '';

        const typeIcon = item.type === 'video' ? '🎥' : (item.type === 'duet' ? '🎬' : '📝');
        const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1);

        const engagement = (item.likes || 0) + (item.comments || 0) + (item.shares || 0);
        const engagementRate = (item.views || 0) > 0 ? Math.min(((engagement / item.views) * 100), 100).toFixed(1) : 0;

        return `
            <div class="post ${isViral ? 'viral' : ''} ${!item.isPlayer ? 'fake-post' : ''}" data-post-id="${item.id}" data-type="${item.type}">
                <div class="post-header">
                    <div class="post-header-left">
                        <span class="post-avatar">${avatar}</span>
                        <span class="post-username">${username} ${verifiedBadge}</span>
                        <span class="post-type-badge" style="font-size: 10px; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; margin-left: 8px;">${typeIcon} ${typeLabel}</span>
                        ${isViral ? '<span class="viral-badge">🔥 VIRAL</span>' : ''}
                    </div>
                    <span class="post-time">${formatTime(item.timestamp)}</span>
                </div>
                <div class="post-content">${formatContentWithClickableHashtags(item.content)}</div>
                <div class="post-stats">
                    <div class="post-stat ${item.isPlayer ? 'clickable' : ''}" data-stat="likes" data-post-id="${item.id}" data-type="${item.type}">
                        <span>❤️</span>
                        <span class="post-stat-value">${formatNumber(item.likes)}</span>
                    </div>
                    <div class="post-stat ${item.isPlayer ? 'clickable' : ''}" data-stat="comments" data-post-id="${item.id}" data-type="${item.type}">
                        <span>💬</span>
                        <span class="post-stat-value">${formatNumber(item.comments)}</span>
                    </div>
                    <div class="post-stat ${item.isPlayer ? 'clickable' : ''}" data-stat="shares" data-post-id="${item.id}" data-type="${item.type}">
                        <span>🔄</span>
                        <span class="post-stat-value">${formatNumber(item.shares)}</span>
                    </div>
                    ${item.views !== undefined ? `
                    <div class="post-stat">
                        <span>👁️</span>
                        <span class="post-stat-value">${formatNumber(item.views)}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;

    // Add event listeners for clickable stats
    document.querySelectorAll('.post-stat.clickable').forEach(stat => {
        stat.addEventListener('click', (e) => {
            const id = parseInt(stat.getAttribute('data-post-id'));
            const type = stat.getAttribute('data-type');
            const statType = stat.getAttribute('data-stat');
            showEngagementDetails(id, statType, type);
        });
    });
}

function getHashtagBonus(hashtags) {
    const trending = getTrendingHashtags();
    const trendingTags = new Set(trending.map(item => item.tag));

    let bonus = 1;
    hashtags.forEach(tag => {
        if (trendingTags.has(tag)) {
            bonus *= 1.2; // Smaller boost so trending helps without dominating
        }
    });

    return Math.min(bonus, 1.6);
}

