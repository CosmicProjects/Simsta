// Viral Post Functions

function triggerViral(item) {
    if (gameState.viralPosts[item.id]) {
        return;
    }

    const viralEndTime = Date.now() + VIRAL_CONFIG.durationMs;
    gameState.viralPosts[item.id] = viralEndTime;
    gameState.totalViralPosts++;

    const isVideo = item.views !== undefined;
    const isDuet = item.isDuet === true;
    const contentType = isDuet ? 'duet' : (isVideo ? 'video' : 'post');

    // Play viral sound effect
    if (typeof audioManager !== 'undefined') {
        audioManager.playViral();
    }

    addNotification(`🚀 Your ${contentType} is going VIRAL!`, 'viral');

    const notificationCount = 10 + Math.floor(Math.random() * 20);
    for (let i = 0; i < notificationCount; i++) {
        const delay = i * VIRAL_CONFIG.notificationDelayMs;
        const type = ['like', 'share', 'follow'][Math.floor(Math.random() * 3)];

        setTimeout(() => {
            const username = generateRandomUsername();
            let message = '';
            if (type === 'like') {
                message = `${username} has liked your ${contentType}!`;
            } else if (type === 'share') {
                message = `${username} has shared your ${contentType}!`;
            } else {
                message = `${username} has followed you!`;
            }
            addNotification(message, type);
        }, delay);
    }

    setTimeout(() => {
        delete gameState.viralPosts[item.id];
        saveGame();
        addNotification(`📉 Your ${contentType} is no longer trending`, 'info');

        const viralContainer = document.getElementById('viralContainer');
        if (viralContainer && viralContainer.style.display !== 'none') {
            renderViral();
        }

        renderFeed();
        renderVideos();
        if (isDuet) {
            renderDuets();
        }
    }, VIRAL_CONFIG.durationMs);
}

function checkAndApplyViralEffects() {
    const now = Date.now();

    gameState.posts.forEach(post => {
        if (gameState.viralPosts[post.id] && now > gameState.viralPosts[post.id]) {
            delete gameState.viralPosts[post.id];
        }
    });

    gameState.videos.forEach(video => {
        if (gameState.viralPosts[video.id] && now > gameState.viralPosts[video.id]) {
            delete gameState.viralPosts[video.id];
        }
    });

    gameState.duets.forEach(duet => {
        if (gameState.viralPosts[duet.id] && now > gameState.viralPosts[duet.id]) {
            delete gameState.viralPosts[duet.id];
        }
    });

    const currentViralCount = Object.keys(gameState.viralPosts).length;
    const allContent = [...gameState.posts, ...gameState.videos, ...gameState.duets];
    const nonViralContent = allContent.filter(item => !gameState.viralPosts[item.id]);
    const totalContent = allContent.length;

    if (totalContent >= 5 && currentViralCount < VIRAL_CONFIG.minViralPosts && nonViralContent.length > 0) {
        const neededViral = VIRAL_CONFIG.minViralPosts - currentViralCount;
        for (let i = 0; i < neededViral && nonViralContent.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * nonViralContent.length);
            const item = nonViralContent[randomIndex];
            triggerViral(item);
            nonViralContent.splice(randomIndex, 1);
        }
    }

    if (currentViralCount > VIRAL_CONFIG.maxViralPosts) {
        const viralItems = Object.entries(gameState.viralPosts)
            .sort((a, b) => a[1] - b[1])
            .slice(0, currentViralCount - VIRAL_CONFIG.maxViralPosts);

        viralItems.forEach(([itemId]) => {
            delete gameState.viralPosts[itemId];
        });
    }

    if (currentViralCount < VIRAL_CONFIG.maxViralPosts) {
        gameState.posts.forEach(post => {
            if (!gameState.viralPosts[post.id] && Math.random() < VIRAL_CONFIG.chancePerPost) {
                triggerViral(post);
            }
        });

        gameState.videos.forEach(video => {
            if (!gameState.viralPosts[video.id] && Math.random() < VIRAL_CONFIG.chancePerPost) {
                triggerViral(video);
            }
        });

        gameState.duets.forEach(duet => {
            if (!gameState.viralPosts[duet.id] && Math.random() < VIRAL_CONFIG.chancePerPost) {
                triggerViral(duet);
            }
        });
    }
}

function renderViral() {
    const container = document.getElementById('viralContainer');

    const viralPosts = gameState.posts.filter(post => gameState.viralPosts[post.id]);
    const viralVideos = gameState.videos.filter(video => gameState.viralPosts[video.id]);
    const viralDuets = gameState.duets.filter(duet => gameState.viralPosts[duet.id]);
    const allViral = [...viralPosts, ...viralVideos, ...viralDuets];

    if (allViral.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>🚀 No viral content yet. Keep posting!</p></div>';
        return;
    }

    container.innerHTML = allViral.map(item => {
        const isVideo = item.views !== undefined;
        const isDuet = item.isDuet === true;
        const engagement = item.likes + item.comments + item.shares;
        const engagementRate = engagement > 0 ? Math.min(((engagement / Math.max(1, item.likes + 1)) * 100), 100).toFixed(1) : 0;
        const timeAgo = getTimeAgo(item.timestamp);

        return `
            <div class="viral-card">
                <div class="viral-badge">🚀 VIRAL ${isDuet ? '🎬' : ''}</div>
                <div class="viral-content">${escapeHtml(item.content)}</div>
                ${isDuet ? `<div style="font-size: 13px; color: #999; margin: 8px 0;">👥 Collaborated with: <strong>${escapeHtml(item.collaborator)}</strong></div>` : ''}
                <div class="viral-stats">
                    <span>❤️ ${formatNumber(item.likes)}</span>
                    <span>💬 ${formatNumber(item.comments)}</span>
                    <span>🔄 ${formatNumber(item.shares)}</span>
                    ${isVideo || isDuet ? `<span>👁️ ${formatNumber(item.views)}</span>` : ''}
                </div>
                <div class="viral-time">${timeAgo}</div>
            </div>
        `;
    }).join('');
}

