// Game Loop and State Update Functions

let lastUpdateTime = 0;
let lastFollowerCount = 0;
let lastLikeCount = 0;
let lastShareCount = 0;
let lastCommentCount = 0;
let lastPostCount = 0;
let lastProfileCardsSyncTime = 0;

function startGameLoop() {
    setInterval(() => {
        const now = Date.now();
        const updateResult = updateGameState();
        lastUpdateTime = now;

        const followerChanged = Math.floor(gameState.followers) !== Math.floor(lastFollowerCount);
        const likeChanged = Math.floor(gameState.totalLikes) !== Math.floor(lastLikeCount);
        const shareChanged = Math.floor(gameState.totalShares) !== Math.floor(lastShareCount);
        const commentChanged = Math.floor(gameState.sessionComments) !== Math.floor(lastCommentCount);
        const postChanged = gameState.posts.length !== lastPostCount;

        if (followerChanged || likeChanged || shareChanged || commentChanged || postChanged) {
            renderUI();
            lastFollowerCount = gameState.followers;
            lastLikeCount = gameState.totalLikes;
            lastShareCount = gameState.totalShares;
            lastCommentCount = gameState.sessionComments;
            lastPostCount = gameState.posts.length;
        }

        // Keep user profile cards in sync when inactive profiles gain shoutout followers.
        if (updateResult?.backgroundProfilesChanged && now - lastProfileCardsSyncTime >= 250) {
            if (typeof updateUserProfileCardsInPlace === 'function') {
                updateUserProfileCardsInPlace();
            } else if (typeof renderUserProfiles === 'function') {
                renderUserProfiles();
            }
            lastProfileCardsSyncTime = now;
        }

        // Update stats display every 500ms regardless of changes
        if (now % 500 < 100) {
            updateStatistics();
            updatePostButtonStates();
        }

        if (Date.now() - gameState.lastSave > 10000) {
            saveGame();
        }

        if (Date.now() % 10000 < 100) {
            cleanupOldNotifications();
        }
    }, 100);
}

function checkMilestones() {
    MILESTONES.forEach(milestone => {
        if (gameState.followers >= milestone.followers && !achievedMilestones.has(milestone.followers)) {
            achievedMilestones.add(milestone.followers);

            // Play milestone sound effect
            if (typeof audioManager !== 'undefined') {
                audioManager.playMilestone();
            }

            addNotification(milestone.reward, 'milestone');
        }
    });
}

let lastViralCheckTime = 0;

function randomInRange(min, max) {
    return min + Math.random() * (max - min);
}

function getOrCreateEngagementProfile(content, contentType = 'post') {
    if (content.engagementProfile && typeof content.engagementProfile === 'object') {
        return content.engagementProfile;
    }

    const profilePresets = {
        post: {
            viewWeight: [0.85, 1.2],
            likeWeight: [0.7, 1.05],
            commentWeight: [0.5, 0.9],
            shareWeight: [0.35, 0.75],
            viewPulseChance: [0.75, 0.95],
            likePulseChance: [0.55, 0.85],
            commentPulseChance: [0.4, 0.7],
            sharePulseChance: [0.3, 0.6],
        },
        video: {
            viewWeight: [0.95, 1.25],
            likeWeight: [0.8, 1.15],
            commentWeight: [0.55, 0.95],
            shareWeight: [0.4, 0.8],
            viewPulseChance: [0.8, 0.98],
            likePulseChance: [0.6, 0.9],
            commentPulseChance: [0.45, 0.75],
            sharePulseChance: [0.35, 0.65],
        },
        duet: {
            viewWeight: [1, 1.35],
            likeWeight: [0.85, 1.2],
            commentWeight: [0.6, 1],
            shareWeight: [0.45, 0.9],
            viewPulseChance: [0.82, 0.99],
            likePulseChance: [0.62, 0.92],
            commentPulseChance: [0.48, 0.78],
            sharePulseChance: [0.38, 0.68],
        },
    };

    const preset = profilePresets[contentType] || profilePresets.post;
    content.engagementProfile = {
        viewWeight: randomInRange(...preset.viewWeight),
        likeWeight: randomInRange(...preset.likeWeight),
        commentWeight: randomInRange(...preset.commentWeight),
        shareWeight: randomInRange(...preset.shareWeight),
        viewPulseChance: randomInRange(...preset.viewPulseChance),
        likePulseChance: randomInRange(...preset.likePulseChance),
        commentPulseChance: randomInRange(...preset.commentPulseChance),
        sharePulseChance: randomInRange(...preset.sharePulseChance),
    };

    return content.engagementProfile;
}

function applyPulsedMetricGrowth(baseGrowth, metricWeight, pulseChance) {
    const safeGrowth = Number(baseGrowth);
    if (!Number.isFinite(safeGrowth) || safeGrowth <= 0) {
        return 0;
    }

    const safeWeight = Number.isFinite(metricWeight) ? Math.max(0, metricWeight) : 1;
    const safeChance = Number.isFinite(pulseChance)
        ? Math.min(1, Math.max(0.1, pulseChance))
        : 1;

    if (Math.random() > safeChance) {
        return 0;
    }

    const jitter = randomInRange(0.75, 1.35);
    return safeGrowth * safeWeight * jitter / safeChance;
}

function applyShoutoutDripToUser(userState, elapsedSeconds, options = {}) {
    if (!userState) return false;

    const pendingShoutoutFollowers = Math.max(0, Number(userState.pendingShoutoutFollowers) || 0);
    if (pendingShoutoutFollowers <= 0) {
        userState.pendingShoutoutFollowers = 0;
        return false;
    }

    const dripRatePerSecond =
        typeof PROFILE_SHOUTOUT_DRIP_PER_SECOND === 'number'
            ? PROFILE_SHOUTOUT_DRIP_PER_SECOND
            : 400;
    const incomingFollowers = Math.min(
        pendingShoutoutFollowers,
        Math.max(1, dripRatePerSecond * elapsedSeconds)
    );

    userState.followers = (userState.followers || 0) + incomingFollowers;
    userState.sessionFollowers = (userState.sessionFollowers || 0) + incomingFollowers;
    userState.peakFollowers = Math.max(userState.peakFollowers || 0, userState.followers);
    userState.pendingShoutoutFollowers = Math.max(0, pendingShoutoutFollowers - incomingFollowers);

    if (userState.followers >= GROWTH_RATES.maxFollowers) {
        userState.followers = GROWTH_RATES.maxFollowers;
        userState.pendingShoutoutFollowers = 0;
    }

    if (userState.pendingShoutoutFollowers <= 0.001) {
        userState.pendingShoutoutFollowers = 0;
        if (typeof options.onComplete === 'function') {
            options.onComplete();
        }
    }

    return true;
}

function updateGameState() {
    const now = Date.now();
    const elapsedMs = now - (gameState.lastUpdateTime || now);
    // Cap elapsed time to prevent huge jumps (max 5 seconds per update)
    const elapsedSeconds = Math.min(5, Math.max(0.1, elapsedMs / 1000));
    gameState.lastUpdateTime = now;
    let backgroundProfilesChanged = false;

    checkMilestones();

    // Viral post checks (throttled to every 500ms)
    if (now - lastViralCheckTime > 500) {
        lastViralCheckTime = now;
        checkAndApplyViralEffects();
    }

    // Follower growth - only happens if player has posts or videos
    if (gameState.posts.length > 0 || gameState.videos.length > 0) {
        let followerGrowth = (GROWTH_RATES.baseFollowerGrowth + gameState.followers * GROWTH_RATES.followerMultiplier) * elapsedSeconds;

        // Apply viral multiplier if posts are viral
        if (Object.keys(gameState.viralPosts).length > 0) {
            followerGrowth *= VIRAL_CONFIG.followersMultiplier;
        }

        followerGrowth *= (gameState.ownerMultiplier || 1);
        gameState.followers += followerGrowth;
        gameState.followers = Math.min(gameState.followers, GROWTH_RATES.maxFollowers);
        gameState.sessionFollowers += followerGrowth;

        // Generate follower notifications
        if (Math.floor(gameState.followers) > Math.floor(gameState.lastFollowerNotification)) {
            const username = generateRandomUsername();
            addNotification(`${username} has followed you!`, 'follow');
            gameState.lastFollowerNotification = gameState.followers;
        }
    }

    // Apply shoutout follower drip for active user.
    applyShoutoutDripToUser(gameState, elapsedSeconds, {
        onComplete: () => {
            addNotification('📣 Shoutout boost completed! Your follower wave finished.', 'follow');
        }
    });

    // Continue processing shoutout drip for inactive profiles as well.
    if (typeof users !== 'undefined' && users && currentUserId) {
        Object.keys(users).forEach(userId => {
            if (userId === currentUserId) return;
            const userState = users[userId];

            const changed = applyShoutoutDripToUser(userState, elapsedSeconds, {
                onComplete: () => {
                    if (!Array.isArray(userState.notifications)) {
                        userState.notifications = [];
                    }
                    userState.notifications.push({
                        id: Date.now() + Math.random(),
                        message: '📣 Shoutout boost completed! Your follower wave finished.',
                        type: 'follow',
                        timestamp: Date.now(),
                    });
                }
            });

            if (changed) {
                backgroundProfilesChanged = true;
            }
        });
    }

    // Ensure totalLikes is a number
    if (isNaN(gameState.totalLikes) || gameState.totalLikes === null || gameState.totalLikes === undefined) {
        gameState.totalLikes = 0;
    }
    if (isNaN(gameState.totalShares) || gameState.totalShares === null || gameState.totalShares === undefined) {
        gameState.totalShares = 0;
    }
    if (isNaN(gameState.sessionLikes) || gameState.sessionLikes === null || gameState.sessionLikes === undefined) {
        gameState.sessionLikes = 0;
    }
    if (isNaN(gameState.sessionShares) || gameState.sessionShares === null || gameState.sessionShares === undefined) {
        gameState.sessionShares = 0;
    }

    // Post engagement - ONLY if player has posts
    const contentDeleteTimeMs = gameState.contentDeletionTime * 60000; // Convert to milliseconds
    if (gameState.posts.length > 0) {
        gameState.posts = gameState.posts.filter(post => {
            const now = Date.now();
            const ageMs = now - post.timestamp;

            // Auto-delete posts after the set time
            if (ageMs >= contentDeleteTimeMs) {
                // Subtract engagement from totals before deletion
                gameState.totalLikes -= post.likes;
                gameState.totalViews -= post.views;
                gameState.totalShares -= post.shares;
                gameState.totalComments -= post.comments;
                addNotification(`📝 Your post expired and was deleted`, 'info');
                return false; // Remove this post
            }

            // Only add engagement if post is less than 10 minutes old
            if (ageMs < CONTENT_DECAY_CONFIG.maxAgeMs) {
                const decayMultiplier = calculateContentDecay(post.timestamp);

                // Extract hashtags and get bonus
                const hashtags = extractHashtags(post.content);
                const hashtagBonus = getHashtagBonus(hashtags);

                let viewGrowth = (GROWTH_RATES.baseViewGrowth + gameState.followers * GROWTH_RATES.viewMultiplier) * elapsedSeconds * decayMultiplier * hashtagBonus * (post.platformMultiplier || 1) * (gameState.ownerMultiplier || 1);
                let likeGrowth = (GROWTH_RATES.baseLikeGrowth + gameState.followers * GROWTH_RATES.likeMultiplier) * elapsedSeconds * decayMultiplier * hashtagBonus * (post.platformMultiplier || 1) * (gameState.ownerMultiplier || 1);
                let shareGrowth = (GROWTH_RATES.baseShareGrowth + gameState.followers * GROWTH_RATES.shareMultiplier) * elapsedSeconds * decayMultiplier * hashtagBonus * (post.platformMultiplier || 1) * (gameState.ownerMultiplier || 1);
                let commentGrowth = (GROWTH_RATES.baseCommentGrowth + gameState.followers * GROWTH_RATES.commentMultiplier) * elapsedSeconds * decayMultiplier * hashtagBonus * (post.platformMultiplier || 1) * (gameState.ownerMultiplier || 1);

                // Safety check for NaN values
                if (isNaN(viewGrowth)) viewGrowth = 0;
                if (isNaN(likeGrowth)) likeGrowth = 0;
                if (isNaN(shareGrowth)) shareGrowth = 0;
                if (isNaN(commentGrowth)) commentGrowth = 0;

                // Apply viral multipliers if this post is viral
                if (gameState.viralPosts[post.id]) {
                    viewGrowth *= VIRAL_CONFIG.likesMultiplier;
                    likeGrowth *= VIRAL_CONFIG.likesMultiplier;
                    shareGrowth *= VIRAL_CONFIG.sharesMultiplier;
                    commentGrowth *= VIRAL_CONFIG.commentsMultiplier;
                }

                const postProfile = getOrCreateEngagementProfile(post, 'post');
                viewGrowth = applyPulsedMetricGrowth(viewGrowth, postProfile.viewWeight, postProfile.viewPulseChance);
                likeGrowth = applyPulsedMetricGrowth(likeGrowth, postProfile.likeWeight, postProfile.likePulseChance);
                shareGrowth = applyPulsedMetricGrowth(shareGrowth, postProfile.shareWeight, postProfile.sharePulseChance);
                commentGrowth = applyPulsedMetricGrowth(commentGrowth, postProfile.commentWeight, postProfile.commentPulseChance);

                post.views = (post.views || 0) + viewGrowth;
                post.likes += likeGrowth;
                post.shares += shareGrowth;
                post.comments += commentGrowth;

                gameState.totalViews += viewGrowth;
                gameState.totalLikes += likeGrowth;
                gameState.totalShares += shareGrowth;
                gameState.sessionLikes += likeGrowth;
                gameState.sessionShares += shareGrowth;
                gameState.sessionComments += commentGrowth;

                // Generate like notifications (throttled - only every 10 likes)
                if (Math.floor(post.likes / 10) > Math.floor((post.lastLikeNotification || 0) / 10)) {
                    const username = generateRandomUsername();
                    addEngagement(post.id, username, 'like');
                    addNotification(`${username} has liked your post!`, 'like');
                    post.lastLikeNotification = post.likes;
                }

                // Generate share notifications (throttled - only every 5 shares)
                if (Math.floor(post.shares / 5) > Math.floor((post.lastShareNotification || 0) / 5)) {
                    const username = generateRandomUsername();
                    addEngagement(post.id, username, 'share');
                    addNotification(`${username} has shared your post!`, 'share');
                    post.lastShareNotification = post.shares;
                }

                // Generate comment notifications (throttled - only every 10 comments)
                if (Math.floor(post.comments / 10) > Math.floor((post.lastCommentNotification || 0) / 10)) {
                    const username = generateRandomUsername();
                    const shoutout = generateShoutout(post.content);
                    addEngagement(post.id, username, 'comment', shoutout);
                    addNotification(`${username} commented: "${shoutout}"`, 'comment');
                    post.lastCommentNotification = post.comments;
                }

            }

            return true; // Keep this post
        });
    }

    // Video engagement - ONLY if player has videos
    if (gameState.videos.length > 0) {
        gameState.videos = gameState.videos.filter(video => {
            const now = Date.now();
            const ageMs = now - video.timestamp;

            // Auto-delete videos after the set time
            if (ageMs >= contentDeleteTimeMs) {
                // Subtract engagement from totals before deletion
                gameState.totalLikes -= video.likes;
                gameState.totalViews -= video.views;
                gameState.totalShares -= video.shares;
                gameState.totalComments -= video.comments;
                addNotification(`🎥 Your video expired and was deleted`, 'info');
                return false; // Remove this video
            }

            // Only add engagement if video is less than 10 minutes old
            if (ageMs < CONTENT_DECAY_CONFIG.maxAgeMs) {
                const decayMultiplier = calculateContentDecay(video.timestamp);

                // Extract hashtags and get bonus
                const hashtags = extractHashtags(video.content);
                const hashtagBonus = getHashtagBonus(hashtags);

                let viewGrowth = (GROWTH_RATES.baseViewGrowth + gameState.followers * GROWTH_RATES.viewMultiplier) * elapsedSeconds * decayMultiplier * hashtagBonus * (video.platformMultiplier || 1) * (gameState.ownerMultiplier || 1);
                let likeGrowth = (GROWTH_RATES.baseVideoLikeGrowth + gameState.followers * GROWTH_RATES.videoLikeMultiplier) * elapsedSeconds * decayMultiplier * hashtagBonus * (video.platformMultiplier || 1) * (gameState.ownerMultiplier || 1);
                let shareGrowth = (GROWTH_RATES.baseVideoShareGrowth + gameState.followers * GROWTH_RATES.videoShareMultiplier) * elapsedSeconds * decayMultiplier * hashtagBonus * (video.platformMultiplier || 1) * (gameState.ownerMultiplier || 1);
                let commentGrowth = (GROWTH_RATES.baseVideoCommentGrowth + gameState.followers * GROWTH_RATES.videoCommentMultiplier) * elapsedSeconds * decayMultiplier * hashtagBonus * (video.platformMultiplier || 1) * (gameState.ownerMultiplier || 1);

                // Apply viral multipliers if this video is viral
                if (gameState.viralPosts[video.id]) {
                    likeGrowth *= VIRAL_CONFIG.likesMultiplier;
                    shareGrowth *= VIRAL_CONFIG.sharesMultiplier;
                    commentGrowth *= VIRAL_CONFIG.commentsMultiplier;
                }

                const videoProfile = getOrCreateEngagementProfile(video, 'video');
                viewGrowth = applyPulsedMetricGrowth(viewGrowth, videoProfile.viewWeight, videoProfile.viewPulseChance);
                likeGrowth = applyPulsedMetricGrowth(likeGrowth, videoProfile.likeWeight, videoProfile.likePulseChance);
                shareGrowth = applyPulsedMetricGrowth(shareGrowth, videoProfile.shareWeight, videoProfile.sharePulseChance);
                commentGrowth = applyPulsedMetricGrowth(commentGrowth, videoProfile.commentWeight, videoProfile.commentPulseChance);

                video.views += viewGrowth;
                video.likes += likeGrowth;
                video.shares += shareGrowth;
                video.comments += commentGrowth;

                gameState.totalViews += viewGrowth;
                gameState.totalLikes += likeGrowth;
                gameState.totalShares += shareGrowth;
                gameState.sessionLikes += likeGrowth;
                gameState.sessionShares += shareGrowth;
                gameState.sessionComments += commentGrowth;

                // Generate like notifications (throttled - only every 10 likes)
                if (Math.floor(video.likes / 10) > Math.floor((video.lastLikeNotification || 0) / 10)) {
                    const username = generateRandomUsername();
                    addEngagement(video.id, username, 'like');
                    addNotification(`${username} has liked your video!`, 'like');
                    video.lastLikeNotification = video.likes;
                }

                // Generate share notifications (throttled - only every 5 shares)
                if (Math.floor(video.shares / 5) > Math.floor((video.lastShareNotification || 0) / 5)) {
                    const username = generateRandomUsername();
                    addEngagement(video.id, username, 'share');
                    addNotification(`${username} has shared your video!`, 'share');
                    video.lastShareNotification = video.shares;
                }

                // Generate comment notifications (throttled - only every 10 comments)
                if (Math.floor(video.comments / 10) > Math.floor((video.lastCommentNotification || 0) / 10)) {
                    const username = generateRandomUsername();
                    const shoutout = generateShoutout(video.content);
                    addEngagement(video.id, username, 'comment', shoutout);
                    addNotification(`${username} commented: "${shoutout}"`, 'comment');
                    video.lastCommentNotification = video.comments;
                }

            }

            return true; // Keep this video
        });
    }

    // Duet engagement - ONLY if player has duets
    if (gameState.duets.length > 0) {
        gameState.duets = gameState.duets.filter(duet => {
            const now = Date.now();
            const ageMs = now - duet.timestamp;

            // Auto-delete duets after the set time
            if (ageMs >= contentDeleteTimeMs) {
                // Subtract engagement from totals before deletion
                gameState.totalLikes -= duet.likes;
                gameState.totalViews -= duet.views;
                gameState.totalShares -= duet.shares;
                gameState.totalComments -= duet.comments;
                addNotification(`🎬 Your duet expired and was deleted`, 'info');
                return false; // Remove this duet
            }

            // Only add engagement if duet is less than 10 minutes old
            if (ageMs < CONTENT_DECAY_CONFIG.maxAgeMs) {
                const decayMultiplier = calculateContentDecay(duet.timestamp);

                // Extract hashtags and get bonus
                const hashtags = extractHashtags(duet.content);
                const hashtagBonus = getHashtagBonus(hashtags);

                // Duets get 2x engagement multiplier
                const duetMultiplier = 2;

                let viewGrowth = (GROWTH_RATES.baseViewGrowth + gameState.followers * GROWTH_RATES.viewMultiplier) * elapsedSeconds * decayMultiplier * hashtagBonus * duetMultiplier * (duet.platformMultiplier || 1) * (gameState.ownerMultiplier || 1);
                let likeGrowth = (GROWTH_RATES.baseVideoLikeGrowth + gameState.followers * GROWTH_RATES.videoLikeMultiplier) * elapsedSeconds * decayMultiplier * hashtagBonus * duetMultiplier * (duet.platformMultiplier || 1) * (gameState.ownerMultiplier || 1);
                let shareGrowth = (GROWTH_RATES.baseVideoShareGrowth + gameState.followers * GROWTH_RATES.videoShareMultiplier) * elapsedSeconds * decayMultiplier * hashtagBonus * duetMultiplier * (duet.platformMultiplier || 1) * (gameState.ownerMultiplier || 1);
                let commentGrowth = (GROWTH_RATES.baseVideoCommentGrowth + gameState.followers * GROWTH_RATES.videoCommentMultiplier) * elapsedSeconds * decayMultiplier * hashtagBonus * duetMultiplier * (duet.platformMultiplier || 1) * (gameState.ownerMultiplier || 1);

                // Apply viral multipliers if this duet is viral
                if (gameState.viralPosts[duet.id]) {
                    likeGrowth *= VIRAL_CONFIG.likesMultiplier;
                    shareGrowth *= VIRAL_CONFIG.sharesMultiplier;
                    commentGrowth *= VIRAL_CONFIG.commentsMultiplier;
                }

                const duetProfile = getOrCreateEngagementProfile(duet, 'duet');
                viewGrowth = applyPulsedMetricGrowth(viewGrowth, duetProfile.viewWeight, duetProfile.viewPulseChance);
                likeGrowth = applyPulsedMetricGrowth(likeGrowth, duetProfile.likeWeight, duetProfile.likePulseChance);
                shareGrowth = applyPulsedMetricGrowth(shareGrowth, duetProfile.shareWeight, duetProfile.sharePulseChance);
                commentGrowth = applyPulsedMetricGrowth(commentGrowth, duetProfile.commentWeight, duetProfile.commentPulseChance);

                duet.views += viewGrowth;
                duet.likes += likeGrowth;
                duet.shares += shareGrowth;
                duet.comments += commentGrowth;

                gameState.totalViews += viewGrowth;
                gameState.totalLikes += likeGrowth;
                gameState.totalShares += shareGrowth;
                gameState.sessionLikes += likeGrowth;
                gameState.sessionShares += shareGrowth;
                gameState.sessionComments += commentGrowth;

                // Generate like notifications (throttled - only every 10 likes)
                if (Math.floor(duet.likes / 10) > Math.floor((duet.lastLikeNotification || 0) / 10)) {
                    const username = generateRandomUsername();
                    addEngagement(duet.id, username, 'like');
                    addNotification(`${username} has liked your duet!`, 'like');
                    duet.lastLikeNotification = duet.likes;
                }

                // Generate share notifications (throttled - only every 5 shares)
                if (Math.floor(duet.shares / 5) > Math.floor((duet.lastShareNotification || 0) / 5)) {
                    const username = generateRandomUsername();
                    addEngagement(duet.id, username, 'share');
                    addNotification(`${username} has shared your duet!`, 'share');
                    duet.lastShareNotification = duet.shares;
                }

                // Generate comment notifications (throttled - only every 10 comments)
                if (Math.floor(duet.comments / 10) > Math.floor((duet.lastCommentNotification || 0) / 10)) {
                    const username = generateRandomUsername();
                    const shoutout = generateShoutout(duet.content);
                    addEngagement(duet.id, username, 'comment', shoutout);
                    addNotification(`${username} commented on your duet: "${shoutout}"`, 'comment');
                    duet.lastCommentNotification = duet.comments;
                }

            }

            return true; // Keep this duet
        });
    }

    // Auto-post
    const nextAutoPostTime = Math.max(
        (Number(gameState.lastAutoPostTime) || 0) + (Number(gameState.autoPostInterval) || 0),
        (Number(gameState.lastPostTime) || 0) + (Number(gameState.postCooldown) || 0)
    );
    if (gameState.autoPostEnabled && now >= nextAutoPostTime) {
        const shouldPostVideo = Math.random() > 0.5;
        let published = false;
        if (shouldPostVideo) {
            published = generateAndPublishVideo({ autoPost: true });
        } else {
            published = generateAndPublishPost({ autoPost: true });
        }

        if (published) {
            gameState.lastAutoPostTime = now;
        }
    }

    // Message generation
    const messageChance = (GROWTH_RATES.baseMessageChance + gameState.followers * GROWTH_RATES.messageChanceMultiplier) * elapsedSeconds;
    if (Math.random() < messageChance) {
        const username = generateRandomUsername();
        const message = MESSAGE_TEMPLATES[Math.floor(Math.random() * MESSAGE_TEMPLATES.length)];
        gameState.messages.push({
            id: Date.now(),
            username: username,
            message: message,
            timestamp: new Date(),
        });
        addNotification(`${username} sent: "${message}"`, 'message');
    }

    // Fake player posts generation (every 15 seconds)
    if (typeof maybeGenerateFakePlayerPost === 'function' && maybeGenerateFakePlayerPost(false)) {
        const exploreTab = document.getElementById('explore-tab');
        const isExploreActive = !!(exploreTab && exploreTab.classList.contains('active'));
        if (isExploreActive && typeof renderFakePlayerFeed === 'function') {
            renderFakePlayerFeed();
        }
    }

    // Fake player reports generation (every 30 seconds)
    if (!gameState.lastReportTime) {
        gameState.lastReportTime = now;
    }
    if (now - gameState.lastReportTime > 30000) {
        gameState.lastReportTime = now;
        addPlayerReport();
    }

    // Throttled story updates (every 1 second / 10 ticks approx)
    if (now % 1000 < 100) {
        updateStoryViews(1);
    }
    return { backgroundProfilesChanged };
}

function cleanupOldNotifications() {
    const now = Date.now();
    gameState.notifications = gameState.notifications.filter(notif => now - notif.timestamp < 300000);
}
