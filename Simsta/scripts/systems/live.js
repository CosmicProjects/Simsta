// Live Streaming Feature
console.log('live.js loaded - version 2025-11-22');

let isLive = false;
let liveStartTime = 0;
let liveViewers = 0;
let liveLikes = 0;
let liveFollowers = 0;
let liveComments = 0;
let liveUpdateInterval = null;
let liveChatMessages = [];

function initializeLiveState() {
    // If user was live when page closed, automatically end the stream
    if (gameState.isLive && gameState.liveStartTime > 0) {
        isLive = true;
        liveStartTime = gameState.liveStartTime;

        // Restore the live stats that were accumulated during the stream
        if (gameState.lastLiveViewers !== undefined) {
            liveViewers = gameState.lastLiveViewers;
        }
        if (gameState.lastLiveLikes !== undefined) {
            liveLikes = gameState.lastLiveLikes;
        }
        if (gameState.lastLiveFollowers !== undefined) {
            liveFollowers = gameState.lastLiveFollowers;
        }
        if (gameState.lastLiveComments !== undefined) {
            liveComments = gameState.lastLiveComments;
        }

        // Automatically end the stream on page load (with a small delay to ensure DOM is ready)
        setTimeout(() => {
            endLive();
            // Navigate to Live tab after stream ends (with additional delay to ensure switchTab is available)
            setTimeout(() => {
                navigateToLiveTab();
            }, 200);
        }, 100);
    } else {
        // If not live, just restore the last stats for display
        if (gameState.lastLiveViewers !== undefined) {
            liveViewers = gameState.lastLiveViewers;
        }
        if (gameState.lastLiveLikes !== undefined) {
            liveLikes = gameState.lastLiveLikes;
        }
        if (gameState.lastLiveFollowers !== undefined) {
            liveFollowers = gameState.lastLiveFollowers;
        }
        if (gameState.lastLiveComments !== undefined) {
            liveComments = gameState.lastLiveComments;
        }

        // Display live stats on page load
        updateLiveStatsDisplay();
    }
}

function navigateToLiveTab() {
    // Switch to Live tab using the switchTab function
    console.log('navigateToLiveTab called, switchTab available:', typeof switchTab === 'function');
    if (typeof switchTab === 'function') {
        console.log('Calling switchTab("live")');
        switchTab('live');
    } else {
        console.error('switchTab function not available yet');
    }
}

function goLive() {
    isLive = true;
    liveStartTime = Date.now();

    // Start with 0 viewers and reset engagement stats
    liveViewers = 0;
    liveLikes = 0;
    liveFollowers = 0;
    liveComments = 0;

    liveChatMessages = [];

    // Update UI
    const notLiveContainer = document.getElementById('notLiveContainer');
    if (notLiveContainer) notLiveContainer.style.display = 'none';

    const liveContainer = document.getElementById('liveContainer');
    if (liveContainer) liveContainer.style.display = 'flex';

    // Play sound effect
    if (typeof audioManager !== 'undefined') {
        audioManager.playPostPublished();
    }

    // Add notification
    addNotification('🔴 You are now LIVE! Start engaging with your audience!', 'post');

    // Start live updates
    startLiveUpdates();

    // Save game state
    gameState.isLive = true;
    gameState.liveStartTime = liveStartTime;
    saveGame();
}

function endLive() {
    if (!isLive) return;

    isLive = false;
    clearInterval(liveUpdateInterval);

    // Calculate live duration
    const duration = Math.floor((Date.now() - liveStartTime) / 1000);
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    // Calculate the engagement that was accumulated during the stream
    const followerGain = liveFollowers;
    const likeGain = liveLikes;
    const commentGain = liveComments;

    // DON'T add stats to gameState yet - only save them for display
    // Stats will only be added when player presses "Continue"

    // Save live stats to gameState for persistence
    gameState.lastLiveViewers = liveViewers;
    gameState.lastLiveLikes = likeGain;
    gameState.lastLiveFollowers = followerGain;
    gameState.lastLiveComments = commentGain;

    // Save the stream data for potential resume
    gameState.lastStreamData = {
        startTime: liveStartTime,
        viewers: liveViewers,
        likes: liveLikes,
        followers: liveFollowers,
        comments: liveComments,
        endedAt: Date.now(),
        duration: duration,
        // Store the stats to be added when player presses Continue
        followerGainEarned: followerGain,
        likeGainEarned: likeGain,
        commentGainEarned: commentGain
    };

    // Play sound effect
    if (typeof audioManager !== 'undefined') {
        audioManager.playMilestone();
    }

    // Show stream ended UI
    showStreamEndedUI(hours, minutes, seconds, liveViewers, followerGain, likeGain, commentGain);

    // Update UI - hide live container and show stream ended container
    const liveContainer = document.getElementById('liveContainer');
    if (liveContainer) liveContainer.style.display = 'none';

    const notLiveContainer = document.getElementById('notLiveContainer');
    if (notLiveContainer) notLiveContainer.style.display = 'none';

    const streamEndedContainer = document.getElementById('streamEndedContainer');
    if (streamEndedContainer) streamEndedContainer.style.display = 'flex';

    // Reset live state
    gameState.isLive = false;
    saveGame();

    // Update header stats to reflect the new totals
    setTimeout(() => {
        renderUI();
    }, 100);
}

function resumeLiveStream() {
    // Check if there's a recent stream to resume (within 5 minutes)
    if (!gameState.lastStreamData) {
        addNotification('❌ No recent stream to resume', 'error');
        return;
    }

    const timeSinceEnd = Date.now() - gameState.lastStreamData.endedAt;
    const fiveMinutesMs = 5 * 60 * 1000;

    if (timeSinceEnd > fiveMinutesMs) {
        addNotification('❌ Stream ended too long ago to resume', 'error');
        return;
    }

    // Restore the stream data
    liveStartTime = gameState.lastStreamData.startTime;
    liveViewers = gameState.lastStreamData.viewers;
    liveLikes = gameState.lastStreamData.likes;
    liveFollowers = gameState.lastStreamData.followers;
    liveComments = gameState.lastStreamData.comments;

    // Resume the stream (stats were never added, so no need to revert)
    isLive = true;
    gameState.isLive = true;
    gameState.liveStartTime = liveStartTime;

    // Update UI
    const streamEndedContainer = document.getElementById('streamEndedContainer');
    if (streamEndedContainer) streamEndedContainer.style.display = 'none';

    const notLiveContainer = document.getElementById('notLiveContainer');
    if (notLiveContainer) notLiveContainer.style.display = 'none';

    const liveContainer = document.getElementById('liveContainer');
    if (liveContainer) liveContainer.style.display = 'flex';

    // Start live updates again
    startLiveUpdates();

    // Save game state
    saveGame();

    // Show notification
    addNotification('🔴 Stream resumed! Welcome back!', 'post');
}

function showStreamEndedUI(hours, minutes, seconds, viewers, followers, likes, comments) {
    // Update stream ended UI with stats
    const durationText = hours > 0
        ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        : `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const durationEl = document.getElementById('streamDurationDisplay');
    if (durationEl) durationEl.textContent = durationText;

    const viewersEl = document.getElementById('streamViewersDisplay');
    if (viewersEl) viewersEl.textContent = formatNumber(viewers);

    const followersEl = document.getElementById('earnedFollowersDisplay');
    if (followersEl) followersEl.textContent = formatNumber(followers);

    const likesEl = document.getElementById('earnedLikesDisplay');
    if (likesEl) likesEl.textContent = formatNumber(likes);

    const commentsEl = document.getElementById('earnedCommentsDisplay');
    if (commentsEl) commentsEl.textContent = formatNumber(comments);
}

function updateLiveStatsDisplay() {
    // Update all live stats on the page
    if (document.getElementById('liveViewers')) {
        document.getElementById('liveViewers').textContent = liveViewers;
    }
    if (document.getElementById('liveLikes')) {
        document.getElementById('liveLikes').textContent = liveLikes;
    }
    if (document.getElementById('liveFollowers')) {
        document.getElementById('liveFollowers').textContent = liveFollowers;
    }
    if (document.getElementById('liveComments')) {
        document.getElementById('liveComments').textContent = liveComments;
    }
}

let lastLiveUpdateTime = 0;

function startLiveUpdates() {
    // Update stats immediately on start
    updateLiveStatsDisplay();
    lastLiveUpdateTime = Date.now();

    liveUpdateInterval = setInterval(() => {
        if (!isLive) return;

        // Calculate elapsed time since last update (handles tab being inactive)
        const now = Date.now();
        const elapsedMs = now - lastLiveUpdateTime;
        const elapsedSeconds = Math.max(1, Math.floor(elapsedMs / 1000));
        lastLiveUpdateTime = now;
        const growthMultiplier = typeof getGlobalGrowthMultiplier === 'function'
            ? getGlobalGrowthMultiplier()
            : (Number(gameState.ownerMultiplier) || 1);

        // Update duration
        const duration = Math.floor((Date.now() - liveStartTime) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const liveDurationEl = document.getElementById('liveDuration');
        if (liveDurationEl) {
            liveDurationEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        // Calculate max viewers based on followers
        const maxViewers = Math.max(10, Math.floor(gameState.followers * 0.1));

        // Process updates for each elapsed second (catches up if tab was inactive)
        for (let i = 0; i < elapsedSeconds; i++) {
            // Simulate viewers joining and leaving
            // New viewers joining
            if (liveViewers < maxViewers && Math.random() < 0.6) {
                const newViewers = Math.floor(Math.random() * 3) + 1; // 1-3 new viewers
                liveViewers = Math.min(liveViewers + newViewers, maxViewers);
            }

            // Viewers leaving (more likely as stream goes on)
            if (liveViewers > 0 && Math.random() < 0.4) {
                const viewersLeaving = Math.floor(Math.random() * 2) + 1; // 1-2 viewers leave
                liveViewers = Math.max(0, liveViewers - viewersLeaving);
            }

            // Randomly add chat messages (only if there are viewers)
            if (liveViewers > 0 && Math.random() < 0.4) {
                addLiveChatMessage();
            }

            // Randomly gain engagement (based on viewer count) - ONLY track locally, don't add to stats yet
            if (liveViewers > 0) {
                if (Math.random() < 0.2) {
                    const likesGained = Math.max(1, Math.round(((Math.floor(Math.random() * 5) + 1) * growthMultiplier)));
                    liveLikes += likesGained;
                    // Don't add to gameState yet - wait until stream ends
                }
                if (Math.random() < 0.15) {
                    liveComments += Math.max(1, Math.round(1 * growthMultiplier));
                    // Don't add to gameState yet - wait until stream ends
                }
                if (Math.random() < 0.1) {
                    liveFollowers += Math.max(1, Math.round(1 * growthMultiplier));
                    // Don't add to gameState yet - wait until stream ends
                }
            }
        }

        // Save live stats to gameState periodically so they persist if page refreshes
        gameState.lastLiveViewers = liveViewers;
        gameState.lastLiveLikes = liveLikes;
        gameState.lastLiveFollowers = liveFollowers;
        gameState.lastLiveComments = liveComments;

        // Update stats display
        updateLiveStatsDisplay();
    }, 1000);
}

function addLiveChatMessage() {
    const messages = [
        '❤️ Love this!',
        '🔥 Amazing!',
        '😂 Haha!',
        '👍 Great content!',
        '🎉 So cool!',
        '💯 Perfect!',
        '😍 Beautiful!',
        '🚀 Awesome!',
        '✨ Incredible!',
        '🎊 Loving it!',
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const username = generateRandomUsername();

    // Add to both containers
    addMessageToContainer('liveChatContainer', username, randomMessage);
    addMessageToContainer('liveChatModalContainer', username, randomMessage);
}

function addMessageToContainer(containerId, username, message) {
    const chatContainer = document.getElementById(containerId);
    if (!chatContainer) return;

    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message viewer';
    messageEl.textContent = `${username}: ${message}`;
    chatContainer.appendChild(messageEl);

    // Auto-scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Keep only last 50 messages
    if (chatContainer.children.length > 50) {
        chatContainer.removeChild(chatContainer.firstChild);
    }
}

// Chat Modal Functions
function openChatModal() {
    const modal = document.getElementById('liveChatModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeChatModal() {
    const modal = document.getElementById('liveChatModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Setup chat modal event listeners
function setupChatModalListeners() {
    const toggleBtn = document.getElementById('toggleChatBtn');
    const closeBtn = document.getElementById('closeChatModalBtn');
    const modal = document.getElementById('liveChatModal');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', openChatModal);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeChatModal);
    }

    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeChatModal();
            }
        });
    }
}
