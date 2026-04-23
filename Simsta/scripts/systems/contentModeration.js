// Content Moderation System for Posts and Videos

const CONTENT_MODERATION_CONFIG = {
    enabled: true,
    autoRemoveDelay: 3000, // 3 seconds before AI removes bad content
    spamKeywords: ['buy now', 'click here', 'free money', 'follow back', 'like for like', 'check link', 'dm me', 'subscribe now'],
    minEngagementRate: 0.5, // 0.5% engagement rate threshold
    maxSpamScore: 5
};

// Analyze content for spam/bad quality
function analyzeContent(content) {
    let spamScore = 0;
    const lowerContent = content.toLowerCase();
    
    // Check for spam keywords
    CONTENT_MODERATION_CONFIG.spamKeywords.forEach(keyword => {
        if (lowerContent.includes(keyword)) {
            spamScore += 2;
        }
    });
    
    // Check for excessive emojis (more than 5)
    const emojiCount = (content.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    if (emojiCount > 5) {
        spamScore += 1;
    }
    
    // Check for excessive hashtags (more than 10)
    const hashtagCount = (content.match(/#\w+/g) || []).length;
    if (hashtagCount > 10) {
        spamScore += 1;
    }
    
    // Check for repeated characters (e.g., "heyyyy" or "!!!!")
    if (/(.)\1{3,}/.test(content)) {
        spamScore += 1;
    }
    
    return spamScore;
}

// Check if content should be flagged
function shouldFlagContent(content, engagement) {
    const spamScore = analyzeContent(content);
    
    // Flag if spam score is too high
    if (spamScore >= CONTENT_MODERATION_CONFIG.maxSpamScore) {
        return true;
    }
    
    // Flag if engagement is suspiciously low
    if (engagement.views > 0) {
        const engagementRate = ((engagement.likes + engagement.comments + engagement.shares) / engagement.views) * 100;
        if (engagementRate < CONTENT_MODERATION_CONFIG.minEngagementRate && engagement.views > 100) {
            return true;
        }
    }
    
    return false;
}

// Flag content for review
function flagContent(contentId, type, reason) {
    const flag = {
        id: contentId,
        type: type, // 'post' or 'video'
        reason: reason,
        timestamp: Date.now(),
        status: 'flagged' // 'flagged', 'removed', 'approved'
    };
    
    gameState.flaggedContent.push(flag);
    saveGame();
}

// AI automatically removes flagged content
function aiRemoveFlaggedContent(contentId, type) {
    let removed = false;
    let notificationMessage = '';
    
    if (type === 'post') {
        const index = gameState.posts.findIndex(p => p.id === contentId);
        if (index !== -1) {
            const post = gameState.posts[index];
            gameState.totalLikes -= post.likes;
            gameState.totalViews -= post.views;
            gameState.totalShares -= post.shares;
            gameState.totalComments -= post.comments;
            gameState.posts.splice(index, 1);
            removed = true;
            notificationMessage = `🤖 AI removed post: "${post.content.substring(0, 40)}${post.content.length > 40 ? '...' : ''}"`;
            renderFeed();
        }
    } else if (type === 'video') {
        const index = gameState.videos.findIndex(v => v.id === contentId);
        if (index !== -1) {
            const video = gameState.videos[index];
            gameState.totalLikes -= video.likes;
            gameState.totalViews -= video.views;
            gameState.totalShares -= video.shares;
            gameState.totalComments -= video.comments;
            gameState.videos.splice(index, 1);
            removed = true;
            notificationMessage = `🤖 AI removed video: "${video.content.substring(0, 40)}${video.content.length > 40 ? '...' : ''}"`;
            renderVideos();
        }
    } else if (type === 'duet') {
        const index = gameState.duets.findIndex(d => d.id === contentId);
        if (index !== -1) {
            const duet = gameState.duets[index];
            gameState.totalLikes -= duet.likes;
            gameState.totalViews -= duet.views;
            gameState.totalShares -= duet.shares;
            gameState.totalComments -= duet.comments;
            gameState.duets.splice(index, 1);
            removed = true;
            notificationMessage = `🤖 AI removed duet: "${duet.content.substring(0, 40)}${duet.content.length > 40 ? '...' : ''}"`;
            renderDuets();
        }
    }
    
    if (removed) {
        // Update flag status
        const flag = gameState.flaggedContent.find(f => f.id === contentId);
        if (flag) {
            flag.status = 'removed';
        }
        
        addNotification(notificationMessage, 'warning');
        saveGame();
    }
}

// Schedule AI removal for flagged content
function scheduleContentRemoval(contentId, type) {
    if (!gameState.aiContentModerationEnabled) return;
    
    setTimeout(() => {
        aiRemoveFlaggedContent(contentId, type);
    }, CONTENT_MODERATION_CONFIG.autoRemoveDelay);
}

// Check new posts/videos for violations
function checkContentQuality(content, engagement, type) {
    if (!gameState.aiContentModerationEnabled) return;
    
    if (shouldFlagContent(content, engagement)) {
        const reason = analyzeContent(content) >= CONTENT_MODERATION_CONFIG.maxSpamScore ? 'Spam/Low Quality' : 'Low Engagement';
        flagContent(Date.now() + Math.random(), type, reason);
        scheduleContentRemoval(Date.now() + Math.random(), type);
    }
}

