// Feed Rendering Functions

let lastFeedRenderTime = 0;
let lastFeedSortBy = 'newest';

function renderFeed() {
    const container = document.getElementById('feedContainer');

    if (gameState.posts.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>📝 No posts yet. Create your first post to get started!</p></div>';
        return;
    }

    const now = Date.now();
    const shouldRebuild = gameState.feedSortBy !== lastFeedSortBy || now - lastFeedRenderTime > 5000;

    if (!shouldRebuild) {
        updateFeedStats();
        return;
    }

    lastFeedRenderTime = now;
    lastFeedSortBy = gameState.feedSortBy;

    let sortedPosts = [...gameState.posts];

    switch (gameState.feedSortBy) {
        case 'oldest':
            sortedPosts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            break;
        case 'most-liked':
            sortedPosts.sort((a, b) => b.likes - a.likes);
            break;
        case 'most-shared':
            sortedPosts.sort((a, b) => b.shares - a.shares);
            break;
        case 'newest':
        default:
            sortedPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            break;
    }

    container.innerHTML = sortedPosts.map(post => {
        const isViral = !!gameState.viralPosts[post.id];
        const verifiedBadge = gameState.isVerified ? '✓' : '';
        const platformIcons = (post.platforms || ['simsta']).map(p => PLATFORMS[p]?.icon || '').join(' ');
        const engagement = post.likes + post.comments + post.shares;
        const engagementRate = engagement > 0 ? Math.min(((engagement / Math.max(1, post.likes + 1)) * 100), 100).toFixed(1) : 0;

        return `
        <div class="post ${isViral ? 'viral' : ''}" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-header-left">
                    <span>@${gameState.username} ${verifiedBadge}</span>
                    <span class="post-platforms" title="Platforms: ${(post.platforms || ['simsta']).join(', ')}">${platformIcons}</span>
                    ${isViral ? '<span class="viral-badge">🔥 VIRAL</span>' : ''}
                </div>
                <span class="post-time">${formatTime(post.timestamp)}</span>
            </div>
            <div class="post-content">${formatContentWithClickableHashtags(post.content)}</div>
            <div class="post-stats">
                <span class="post-stat clickable" data-stat="likes" data-post-id="${post.id}">❤️ ${formatNumber(post.likes)} Likes</span>
                <span class="post-stat clickable" data-stat="comments" data-post-id="${post.id}">💬 ${formatNumber(post.comments)} Comments</span>
                <span class="post-stat clickable" data-stat="shares" data-post-id="${post.id}">🔄 ${formatNumber(post.shares)} Shares</span>
                <span class="post-stat engagement-stat">📊 ${engagementRate}% Engagement</span>
            </div>
        </div>
    `;
    }).join('');

    // Add event listeners for clickable stats
    document.querySelectorAll('.post-stat.clickable').forEach(stat => {
        stat.addEventListener('click', (e) => {
            const postId = parseInt(stat.getAttribute('data-post-id'));
            const statType = stat.getAttribute('data-stat');
            showEngagementDetails(postId, statType, 'post');
        });
    });
}

function updateFeedStats() {
    gameState.posts.forEach(post => {
        const postEl = document.querySelector(`[data-post-id="${post.id}"]`);
        if (!postEl) return;

        const engagement = post.likes + post.comments + post.shares;
        const engagementRate = engagement > 0 ? Math.min(((engagement / Math.max(1, post.likes + 1)) * 100), 100).toFixed(1) : 0;

        const likesEl = postEl.querySelector('[data-stat="likes"]');
        const commentsEl = postEl.querySelector('[data-stat="comments"]');
        const sharesEl = postEl.querySelector('[data-stat="shares"]');
        const engagementEl = postEl.querySelector('[data-stat="engagement"]');

        if (likesEl) likesEl.textContent = `❤️ ${formatNumber(post.likes)} Likes`;
        if (commentsEl) commentsEl.textContent = `💬 ${formatNumber(post.comments)} Comments`;
        if (sharesEl) sharesEl.textContent = `🔄 ${formatNumber(post.shares)} Shares`;
        if (engagementEl) engagementEl.textContent = `📊 ${engagementRate}% Engagement`;
    });
}

let lastVideoRenderTime = 0;

function renderVideos() {
    const container = document.getElementById('videosContainer');

    if (gameState.videos.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>🎥 No videos yet. Generate your first video to get started!</p></div>';
        return;
    }

    const now = Date.now();
    if (now - lastVideoRenderTime < 5000) {
        updateVideoStats();
        return;
    }

    lastVideoRenderTime = now;

    container.innerHTML = gameState.videos.map(video => {
        const isViral = !!gameState.viralPosts[video.id];
        const verifiedBadge = gameState.isVerified ? '✓' : '';
        const platformIcons = (video.platforms || ['simsta']).map(p => PLATFORMS[p]?.icon || '').join(' ');
        const engagement = video.likes + video.comments + video.shares;
        const engagementRate = engagement > 0 ? Math.min(((engagement / Math.max(1, video.likes + 1)) * 100), 100).toFixed(1) : 0;

        return `
        <div class="video ${isViral ? 'viral' : ''}" data-video-id="${video.id}">
            <div class="video-header">
                <div class="video-header-left">
                    <span>@${gameState.username} ${verifiedBadge}</span>
                    <span class="video-platforms" title="Platforms: ${(video.platforms || ['simsta']).join(', ')}">${platformIcons}</span>
                    ${isViral ? '<span class="viral-badge">🔥 VIRAL</span>' : ''}
                </div>
                <span class="video-time">${formatTime(video.timestamp)}</span>
            </div>
            <div class="video-content">${formatContentWithClickableHashtags(video.content)}</div>
            <div class="video-stats">
                <span class="video-stat">👁️ ${formatNumber(video.views)} Views</span>
                <span class="video-stat clickable" data-stat="likes" data-video-id="${video.id}">❤️ ${formatNumber(video.likes)} Likes</span>
                <span class="video-stat clickable" data-stat="comments" data-video-id="${video.id}">💬 ${formatNumber(video.comments)} Comments</span>
                <span class="video-stat clickable" data-stat="shares" data-video-id="${video.id}">🔄 ${formatNumber(video.shares)} Shares</span>
                <span class="video-stat engagement-stat">📊 ${engagementRate}% Engagement</span>
            </div>
        </div>
    `;
    }).join('');

    // Add event listeners for clickable stats
    document.querySelectorAll('.video-stat.clickable').forEach(stat => {
        stat.addEventListener('click', (e) => {
            const videoId = parseInt(stat.getAttribute('data-video-id'));
            const statType = stat.getAttribute('data-stat');
            showEngagementDetails(videoId, statType, 'video');
        });
    });
}

function updateVideoStats() {
    gameState.videos.forEach(video => {
        const videoEl = document.querySelector(`[data-video-id="${video.id}"]`);
        if (!videoEl) return;

        const engagement = video.likes + video.comments + video.shares;
        const engagementRate = engagement > 0 ? Math.min(((engagement / Math.max(1, video.likes + 1)) * 100), 100).toFixed(1) : 0;

        const statsContainer = videoEl.querySelector('.video-stats');
        if (statsContainer) {
            const spans = statsContainer.querySelectorAll('.video-stat');
            if (spans[0]) spans[0].textContent = `👁️ ${formatNumber(video.views)} Views`;
            if (spans[1]) spans[1].textContent = `❤️ ${formatNumber(video.likes)} Likes`;
            if (spans[2]) spans[2].textContent = `💬 ${formatNumber(video.comments)} Comments`;
            if (spans[3]) spans[3].textContent = `🔄 ${formatNumber(video.shares)} Shares`;
            if (spans[4]) spans[4].textContent = `📊 ${engagementRate}% Engagement`;
        }
    });
}
