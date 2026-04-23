function getPlatformMultiplier() {
    let multiplier = 1.0;
    if (gameState.selectedPlatforms) {
        gameState.selectedPlatforms.forEach(p => {
            if (PLATFORMS[p] && p !== 'simsta') { // Simsta is base
                // Additive bonus for each additional platform
                multiplier += (PLATFORMS[p].engagementBonus - 1);
            }
        });
    }
    return multiplier;
}

function generateAndPublishPost(options = {}) {
    const isAutoPost = Boolean(options.autoPost);
    const now = Date.now();
    const timeSinceLastPost = now - gameState.lastPostTime;

    if (timeSinceLastPost < gameState.postCooldown) {
        if (isAutoPost) {
            return false;
        }

        const secondsRemaining = Math.ceil((gameState.postCooldown - timeSinceLastPost) / 1000);

        // Play error sound
        if (typeof audioManager !== 'undefined') {
            audioManager.playError();
        }

        addNotification(`⏱️ Wait ${secondsRemaining}s before posting again`, 'info');
        return;
    }

    const randomContent = generateRandomPost();
    const hashtagInput = document.getElementById('hashtagInput');
    const userHashtags = hashtagInput ? hashtagInput.value.trim() : '';
    const autoHashtags = generateRandomHashtags(3);
    const finalContent = userHashtags ? `${randomContent} ${userHashtags}` : `${randomContent} ${autoHashtags}`;

    const platformMult = getPlatformMultiplier();
    const post = {
        id: Date.now(),
        content: finalContent,
        likes: 0,
        shares: 0,
        comments: 0,
        views: 0,
        timestamp: Date.now(),
        lastCommentNotification: 0,
        likers: [],
        commenters: [],
        sharers: [],
        platforms: [...gameState.selectedPlatforms],
        platformMultiplier: platformMult
    };

    gameState.posts.unshift(post);
    gameState.lastPostTime = now;

    // Extract and track hashtags
    const hashtags = extractHashtags(finalContent);
    if (hashtags.length > 0) {
        updateTrendingHashtags(hashtags);
    }

    // AI Content Moderation
    if (gameState.aiContentModerationEnabled) {
        checkContentQuality(finalContent, { views: 0, likes: 0, comments: 0, shares: 0 }, 'post');
    }

    // Clear hashtag input after posting
    if (hashtagInput) hashtagInput.value = '';

    renderFeed();
    saveGame();

    // Play post published sound
    if (typeof audioManager !== 'undefined') {
        audioManager.playPostPublished();
    }

    const platformIcons = post.platforms.map(p => PLATFORMS[p]?.icon || '').join(' ');
    addNotification(
        `${isAutoPost ? '🤖 Auto-posted on' : '🎲 Shared on'} ${platformIcons}: "${finalContent.substring(0, 30)}..."`,
        isAutoPost ? 'autopost' : 'post'
    );

    if (!isAutoPost) {
        switchTab('feed');
        switchFeedTab('posts');
    }

    return true;
}

function generateAndPublishVideo(options = {}) {
    const isAutoPost = Boolean(options.autoPost);
    const now = Date.now();
    const timeSinceLastPost = now - gameState.lastPostTime;

    if (timeSinceLastPost < gameState.postCooldown) {
        if (isAutoPost) {
            return false;
        }

        const secondsRemaining = Math.ceil((gameState.postCooldown - timeSinceLastPost) / 1000);

        // Play error sound
        if (typeof audioManager !== 'undefined') {
            audioManager.playError();
        }

        addNotification(`⏱️ Wait ${secondsRemaining}s before posting again`, 'info');
        return;
    }

    const randomContent = VIDEO_TEMPLATES[Math.floor(Math.random() * VIDEO_TEMPLATES.length)];
    const hashtagInput = document.getElementById('hashtagInput');
    const userHashtags = hashtagInput ? hashtagInput.value.trim() : '';
    const autoHashtags = generateRandomHashtags(3);
    const finalContent = userHashtags ? `${randomContent} ${userHashtags}` : `${randomContent} ${autoHashtags}`;

    const platformMult = getPlatformMultiplier();
    const video = {
        id: Date.now(),
        content: finalContent,
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        timestamp: Date.now(),
        lastCommentNotification: 0,
        likers: [],
        commenters: [],
        sharers: [],
        platforms: [...gameState.selectedPlatforms],
        platformMultiplier: platformMult
    };

    gameState.videos.unshift(video);
    gameState.lastPostTime = now;

    // Extract and track hashtags
    const hashtags = extractHashtags(finalContent);
    if (hashtags.length > 0) {
        updateTrendingHashtags(hashtags);
    }

    // AI Content Moderation
    if (gameState.aiContentModerationEnabled) {
        checkContentQuality(finalContent, { views: 0, likes: 0, comments: 0, shares: 0 }, 'video');
    }

    // Clear hashtag input after posting
    if (hashtagInput) hashtagInput.value = '';

    renderFeed();
    saveGame();

    // Play post published sound
    if (typeof audioManager !== 'undefined') {
        audioManager.playPostPublished();
    }

    const platformIcons = video.platforms.map(p => PLATFORMS[p]?.icon || '').join(' ');
    addNotification(
        `${isAutoPost ? '🤖 Auto-posted video on' : '🎬 Video shared on'} ${platformIcons}: "${randomContent.substring(0, 30)}..."`,
        isAutoPost ? 'autopost' : 'post'
    );

    if (!isAutoPost) {
        switchTab('feed');
        switchFeedTab('videos');
    }

    return true;
}

function postStory() {
    const storyTemplates = [
        "Just living my best life! ✨",
        "Can't believe how amazing today was! 🌟",
        "Feeling grateful for everything! 🙏",
        "This moment is everything! 💕",
        "Living for these vibes! 🎉",
        "Absolutely obsessed with this! 😍",
        "Best day ever! 🔥",
        "Feeling blessed! 👑",
        "This is what happiness looks like! 💫",
        "Pure joy right now! 🌈",
        "Couldn't ask for better! 🎊",
        "Living the dream! 💭",
        "Absolutely perfect! 👌",
        "Feeling inspired! 💪",
        "This is the vibe! 🎵"
    ];

    const content = storyTemplates[Math.floor(Math.random() * storyTemplates.length)];

    const story = {
        id: Date.now(),
        content: content,
        timestamp: new Date(),
        views: [],
        viewCount: 0
    };

    gameState.stories.push(story);
    saveGame();
    addNotification(`📖 Story posted: "${content}"`, 'post');

    // Show the stories list after posting
    showStoriesList();
}

function viewStoryDetail(storyId) {
    const story = gameState.stories.find(s => s.id === storyId);
    if (!story) return;

    gameState.currentViewedStoryId = storyId;

    // Hide all containers first
    document.getElementById('storiesListContainer').style.display = 'none';
    document.getElementById('storyCreationContainer').style.display = 'none';

    // Show only the views container
    document.getElementById('storyViewsContainer').style.display = 'block';

    const viewsList = document.getElementById('storyViewsList');

    if (story.views.length === 0) {
        viewsList.innerHTML = '<p style="text-align: center; color: #999;">No views yet. Share your story to get views! 👀</p>';
    } else {
        const viewsHTML = story.views.map(view => `
            <div style="padding: 12px; background: rgba(255,255,255,0.05); border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;">
                <span>👤 ${view.username}</span>
                <span style="font-size: 12px; color: #999;">${getTimeAgo(view.timestamp)}</span>
            </div>
        `).join('');

        const storyAge = Date.now() - story.timestamp;
        const storyAgeHours = Math.floor(storyAge / (1000 * 60 * 60));
        const viewsPerHour = storyAgeHours > 0 ? (story.viewCount / storyAgeHours).toFixed(1) : story.viewCount;

        viewsList.innerHTML = `
            <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div style="font-size: 18px; font-weight: bold; color: #ff9800; margin-bottom: 8px;">📖 Story</div>
                <div style="margin-bottom: 12px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; word-wrap: break-word;">${escapeHtml(story.content)}</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
                    <div>
                        <div style="color: #999; margin-bottom: 4px;">Total Views</div>
                        <div style="font-size: 20px; font-weight: bold; color: #ff9800;">${formatNumber(story.viewCount)}</div>
                    </div>
                    <div>
                        <div style="color: #999; margin-bottom: 4px;">Views/Hour</div>
                        <div style="font-size: 20px; font-weight: bold; color: #ff9800;">${formatNumber(viewsPerHour)}</div>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 12px;">
                <div style="font-size: 14px; font-weight: bold; color: #fff; margin-bottom: 8px;">👥 Recent Viewers (${formatNumber(story.views.length)})</div>
            </div>
            ${viewsHTML}
        `;
    }

    // Show back button
    const backBtn = document.getElementById('backToStoriesBtn');
    if (backBtn) {
        backBtn.style.display = 'block';
    }
}

function deleteStory(storyId) {
    gameState.stories = gameState.stories.filter(s => s.id !== storyId);
    saveGame();
    addNotification('📖 Story deleted', 'info');
    renderStories();
}

function updateStoryViews(elapsedSeconds = 0.1) {
    if (gameState.stories.length === 0) return;

    gameState.stories.forEach(story => {
        // Only gain views if we haven't reached the follower cap
        if (story.viewCount >= gameState.followers) return;

        // Calculate how many views to add this tick (capped to 100 per tick to avoid freezes)
        const viewRate = (GROWTH_RATES.baseViewGrowth + gameState.followers * GROWTH_RATES.viewMultiplier) * 0.5;
        let newViews = Math.floor(viewRate * elapsedSeconds);

        if (newViews <= 0 && Math.random() < viewRate * elapsedSeconds) {
            newViews = 1;
        }

        if (newViews === 0) return;

        // Limit growth to not exceed followers
        newViews = Math.min(newViews, gameState.followers - story.viewCount);

        // Add numerical views
        story.viewCount += newViews;

        // Add actual viewer items sparingly (only for the 'Recent Viewers' list)
        // We only add a few names per update to keep things fast
        const namesToAdd = Math.min(newViews, 3);
        for (let i = 0; i < namesToAdd; i++) {
            // Keep recent viewers list small
            if (story.views.length >= 50) {
                story.views.shift(); // Remove oldest
            }

            story.views.push({
                username: generateRandomUsername(),
                timestamp: Date.now()
            });
        }

        // Real-time UI refresh if currently viewing this story
        if (gameState.currentViewedStoryId === story.id) {
            viewStoryDetail(story.id);
        }
    });

    // If modal is open but in list view, refresh the list to show new counts
    const storyModal = document.getElementById('storyModal');
    const isListVisible = document.getElementById('storiesListContainer')?.style.display === 'block';
    if (storyModal?.style.display === 'flex' && isListVisible) {
        if (typeof showStoriesList === 'function') {
            showStoriesList();
        }
    }
}

function generateStoryViews() {
    // This function is now a wrapper for legacy calls or can be removed.
    // We'll keep it as a no-op if it was referenced elsewhere in non-scanned code.
    updateStoryViews(1);
}
function fillRandomHashtags() {
    const hashtagInput = document.getElementById('hashtagInput');
    if (!hashtagInput) return;

    // Generate 3-5 random trending hashtags
    const count = Math.floor(Math.random() * 3) + 3;
    const hashtags = generateRandomHashtags(count);

    // Add a slight delay and animation feel by clearing first
    hashtagInput.value = '';

    // Fill with a typewriter-like effect or instantly
    hashtagInput.value = hashtags;

    // Play a subtle sound if available
    if (typeof audioManager !== 'undefined') {
        audioManager.playClick();
    }

    // Add a small notification
    addNotification("✨ AI Hashtags Generated!", "info");
}
