// Duets & Collaboration System

function createDuet() {
    const now = Date.now();
    const timeSinceLastPost = now - gameState.lastPostTime;

    if (timeSinceLastPost < gameState.postCooldown) {
        const secondsRemaining = Math.ceil((gameState.postCooldown - timeSinceLastPost) / 1000);

        // Play error sound
        if (typeof audioManager !== 'undefined') {
            audioManager.playError();
        }

        addNotification(`⏱️ Wait ${secondsRemaining}s before creating a duet`, 'info');
        return;
    }

    // Generate a random creator to duet with
    const creatorName = generateRandomUsername();
    const duetContent = `Duet with ${creatorName}! 🎬`;
    const hashtagInput = document.getElementById('hashtagInput');
    const userHashtags = hashtagInput ? hashtagInput.value.trim() : '';
    const autoHashtags = generateRandomHashtags(3);
    const finalContent = userHashtags ? `${duetContent} ${userHashtags}` : `${duetContent} ${autoHashtags}`;

    const duet = {
        id: Date.now(),
        content: finalContent,
        collaborator: creatorName,
        likes: 0,
        shares: 0,
        comments: 0,
        views: 0,
        timestamp: Date.now(),
        lastCommentNotification: 0,
        isDuet: true,
        likers: [],
        commenters: [],
        sharers: [],
    };

    gameState.duets.unshift(duet);
    gameState.lastPostTime = now;

    // Extract and track hashtags
    const hashtags = extractHashtags(finalContent);
    if (hashtags.length > 0) {
        updateTrendingHashtags(hashtags);
    }

    // AI Content Moderation
    if (gameState.aiContentModerationEnabled) {
        checkContentQuality(finalContent, { views: 0, likes: 0, comments: 0, shares: 0 }, 'duet');
    }

    // Clear hashtag input after posting
    if (hashtagInput) hashtagInput.value = '';

    renderDuets();
    saveGame();

    // Play post published sound
    if (typeof audioManager !== 'undefined') {
        audioManager.playPostPublished();
    }

    addNotification(`🎬 Duet created with ${creatorName}!`, 'post');

    switchTab('feed');
    switchFeedTab('duets');
}

function renderDuets() {
    const container = document.getElementById('duetsContainer');
    
    if (!container) return;

    if (gameState.duets.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>🎬 No duets yet. Create your first duet to get started!</p></div>';
        return;
    }

    container.innerHTML = gameState.duets.map(duet => {
        const isViral = !!gameState.viralPosts[duet.id];
        const verifiedBadge = gameState.isVerified ? '✓' : '';
        const engagement = duet.likes + duet.comments + duet.shares;
        const engagementRate = engagement > 0 ? Math.min(((engagement / Math.max(1, duet.likes + 1)) * 100), 100).toFixed(1) : 0;

        return `
        <div class="duet-card ${isViral ? 'viral' : ''}" data-duet-id="${duet.id}">
            <div class="duet-header">
                <div class="duet-header-left">
                    <span>@${gameState.username} ${verifiedBadge}</span>
                    <span class="duet-badge">🎬 DUET</span>
                    ${isViral ? '<span class="viral-badge">🔥 VIRAL</span>' : ''}
                </div>
                <span class="duet-time">${formatTime(duet.timestamp)}</span>
            </div>
            <div class="duet-content">${formatContentWithClickableHashtags(duet.content)}</div>
            <div class="duet-collaborator">👥 Collaborated with: <strong>${escapeHtml(duet.collaborator)}</strong></div>
            <div class="duet-stats">
                <div class="duet-stat clickable" data-stat="views" data-duet-id="${duet.id}">
                    <span>👁️</span>
                    <span class="duet-stat-value">${formatNumber(duet.views)}</span>
                    <span>Views</span>
                </div>
                <div class="duet-stat clickable" data-stat="likes" data-duet-id="${duet.id}">
                    <span>❤️</span>
                    <span class="duet-stat-value">${formatNumber(duet.likes)}</span>
                    <span>Likes</span>
                </div>
                <div class="duet-stat clickable" data-stat="comments" data-duet-id="${duet.id}">
                    <span>💬</span>
                    <span class="duet-stat-value">${formatNumber(duet.comments)}</span>
                    <span>Comments</span>
                </div>
                <div class="duet-stat clickable" data-stat="shares" data-duet-id="${duet.id}">
                    <span>🔄</span>
                    <span class="duet-stat-value">${formatNumber(duet.shares)}</span>
                    <span>Shares</span>
                </div>
            </div>
        </div>
    `;
    }).join('');

    // Add event listeners for clickable stats
    document.querySelectorAll('.duet-stat.clickable').forEach(stat => {
        stat.addEventListener('click', (e) => {
            const duetId = parseInt(stat.getAttribute('data-duet-id'));
            const statType = stat.getAttribute('data-stat');
            showEngagementDetails(duetId, statType, 'duet');
        });
    });
}

function updateDuetStats() {
    gameState.duets.forEach(duet => {
        const duetEl = document.querySelector(`[data-duet-id="${duet.id}"]`);
        if (!duetEl) return;

        const viewsEl = duetEl.querySelector('[data-stat="views"]');
        const likesEl = duetEl.querySelector('[data-stat="likes"]');
        const commentsEl = duetEl.querySelector('[data-stat="comments"]');
        const sharesEl = duetEl.querySelector('[data-stat="shares"]');

        if (viewsEl) viewsEl.textContent = formatNumber(duet.views);
        if (likesEl) likesEl.textContent = formatNumber(duet.likes);
        if (commentsEl) commentsEl.textContent = formatNumber(duet.comments);
        if (sharesEl) sharesEl.textContent = formatNumber(duet.shares);
    });
}

