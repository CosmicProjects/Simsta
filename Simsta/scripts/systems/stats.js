// Statistics and Growth Rates Functions

let lastFollowerRateDisplay = '';
let lastLikeRateDisplay = '';
let lastCommentRateDisplay = '';
let lastShareRateDisplay = '';
let lastViewRateDisplay = '';
let lastMessageRateDisplay = '';

function updateGrowthRates() {
    // Calculate per-second growth rates (these are already per-second, not multiplied by elapsedSeconds)
    // Define caps for each growth rate
    const GROWTH_CAPS = {
        followerRate: 100,
        likeRate: 500,
        commentRate: 200,
        shareRate: 100,
        viewRate: 1000,
        messageRate: 50,
    };

    const growthMultiplier = typeof getGlobalGrowthMultiplier === 'function'
        ? getGlobalGrowthMultiplier()
        : (Number(gameState.ownerMultiplier) || 1);

    const followerRate = parseFloat(Math.min(
        (GROWTH_RATES.baseFollowerGrowth + gameState.followers * GROWTH_RATES.followerMultiplier) * growthMultiplier,
        GROWTH_CAPS.followerRate
    ).toFixed(2));
    const likeRate = parseFloat(Math.min(
        (GROWTH_RATES.baseLikeGrowth + gameState.followers * GROWTH_RATES.likeMultiplier) * growthMultiplier,
        GROWTH_CAPS.likeRate
    ).toFixed(2));
    const commentRate = parseFloat(Math.min(
        (GROWTH_RATES.baseCommentGrowth + gameState.followers * GROWTH_RATES.commentMultiplier) * growthMultiplier,
        GROWTH_CAPS.commentRate
    ).toFixed(2));
    const shareRate = parseFloat(Math.min(
        (GROWTH_RATES.baseShareGrowth + gameState.followers * GROWTH_RATES.shareMultiplier) * growthMultiplier,
        GROWTH_CAPS.shareRate
    ).toFixed(2));
    const viewRate = parseFloat(Math.min(
        (GROWTH_RATES.baseViewGrowth + gameState.followers * GROWTH_RATES.viewMultiplier) * growthMultiplier,
        GROWTH_CAPS.viewRate
    ).toFixed(2));
    const messageRate = parseFloat(Math.min(
        (GROWTH_RATES.baseMessageGrowth + gameState.followers * GROWTH_RATES.messageMultiplier) * growthMultiplier,
        GROWTH_CAPS.messageRate
    ).toFixed(2));

    if (followerRate !== lastFollowerRateDisplay) {
        document.getElementById('followerRate').textContent = followerRate;
        lastFollowerRateDisplay = followerRate;
    }

    if (likeRate !== lastLikeRateDisplay) {
        document.getElementById('likeRate').textContent = likeRate;
        lastLikeRateDisplay = likeRate;
    }

    if (commentRate !== lastCommentRateDisplay) {
        document.getElementById('commentRate').textContent = commentRate;
        lastCommentRateDisplay = commentRate;
    }

    if (shareRate !== lastShareRateDisplay) {
        document.getElementById('shareRate').textContent = shareRate;
        lastShareRateDisplay = shareRate;
    }

    if (viewRate !== lastViewRateDisplay) {
        document.getElementById('viewRate').textContent = viewRate;
        lastViewRateDisplay = viewRate;
    }

    if (messageRate !== lastMessageRateDisplay) {
        document.getElementById('messageRate').textContent = messageRate;
        lastMessageRateDisplay = messageRate;
    }
}

function updateStatistics() {
    // Update stats regardless of tab visibility
    // This ensures stats are always current when the tab is opened

    let sessionStart = Number(gameState.sessionStartTime);
    if (!Number.isFinite(sessionStart) || sessionStart <= 0 || sessionStart > Date.now()) {
        sessionStart = Date.now();
        gameState.sessionStartTime = sessionStart;
    }

    const playTimeMs = Math.max(0, Date.now() - sessionStart);
    const hours = Math.floor(playTimeMs / 3600000);
    const minutes = Math.floor((playTimeMs % 3600000) / 60000);
    const seconds = Math.floor((playTimeMs % 60000) / 1000);
    const playTimeEl = document.getElementById('playTime');
    if (playTimeEl) {
        const timeStr = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
        playTimeEl.textContent = timeStr;
    }

    const sessionDate = new Date(sessionStart);
    const timeStr = sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sessionStartEl = document.getElementById('sessionStart');
    if (sessionStartEl) {
        sessionStartEl.textContent = timeStr;
    }

    const totalPostsEl = document.getElementById('totalPosts');
    if (totalPostsEl) totalPostsEl.textContent = formatNumber(gameState.posts.length);

    const totalVideosEl = document.getElementById('totalVideos');
    if (totalVideosEl) totalVideosEl.textContent = formatNumber(gameState.videos.length);

    const totalMessagesEl = document.getElementById('totalMessages');
    if (totalMessagesEl) totalMessagesEl.textContent = formatNumber(gameState.messages.length);

    const viralCountEl = document.getElementById('viralCount');
    if (viralCountEl) viralCountEl.textContent = formatNumber(gameState.totalViralPosts);

    const statsLikesEl = document.getElementById('statsLikes');
    if (statsLikesEl) {
        statsLikesEl.textContent = formatNumber(gameState.totalLikes);
    }

    const statsSharesEl = document.getElementById('statsShares');
    if (statsSharesEl) statsSharesEl.textContent = formatNumber(gameState.totalShares);

    const statsViewsEl = document.getElementById('statsViews');
    if (statsViewsEl) statsViewsEl.textContent = formatNumber(gameState.totalViews);

    const statsCommentsEl = document.getElementById('statsComments');
    if (statsCommentsEl) statsCommentsEl.textContent = formatNumber(gameState.sessionComments);

    const sessionFollowersEl = document.getElementById('sessionFollowers');
    if (sessionFollowersEl) {
        const formattedFollowers = formatNumber(gameState.sessionFollowers);
        sessionFollowersEl.textContent = formattedFollowers;
    }

    const sessionLikesEl = document.getElementById('sessionLikes');
    if (sessionLikesEl) {
        const formattedLikes = formatNumber(gameState.sessionLikes);
        sessionLikesEl.textContent = formattedLikes;
    }

    const sessionSharesEl = document.getElementById('sessionShares');
    if (sessionSharesEl) {
        const formattedShares = formatNumber(gameState.sessionShares);
        sessionSharesEl.textContent = formattedShares;
    }

    const peakFollowersEl = document.getElementById('peakFollowers');
    if (peakFollowersEl) {
        if (gameState.followers > gameState.peakFollowers) {
            gameState.peakFollowers = gameState.followers;
        }
        peakFollowersEl.textContent = formatNumber(gameState.peakFollowers);
    }

    const milestonesEl = document.getElementById('milestonesList');
    if (milestonesEl) {
        const achievedList = MILESTONES.filter(m => achievedMilestones.has(m.followers));
        if (achievedList.length === 0) {
            milestonesEl.innerHTML = '<p class="no-milestones">No milestones achieved yet. Keep growing!</p>';
        } else {
            milestonesEl.innerHTML = achievedList.map(m => `
                <div class="milestone-item">
                    <span class="milestone-icon">✓</span>
                    <span class="milestone-text">${m.reward}</span>
                </div>
            `).join('');
        }
    }

    if (typeof updateAutoPostCountdown === 'function') {
        updateAutoPostCountdown();
    }
}
