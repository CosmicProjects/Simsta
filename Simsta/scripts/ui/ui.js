// UI Rendering Functions

function renderUI() {
    try {
        const profileEmoji = PROFILE_PICTURE_MAP[gameState.profilePicture] || gameState.profilePicture;

        // Update profile section
        const usernameEl = document.getElementById('username');
        if (usernameEl) usernameEl.textContent = gameState.username;

        const avatarEl = document.querySelector('.avatar-large');
        if (avatarEl) avatarEl.textContent = profileEmoji;

        const handleEl = document.getElementById('usernameHandle');
        if (handleEl) handleEl.textContent = gameState.username.toLowerCase().replace(/\s+/g, '');

        // Update stats
        const followerCountEl = document.getElementById('followerCount');
        if (followerCountEl) followerCountEl.textContent = formatNumber(gameState.followers);

        const postCountEl = document.getElementById('postCount');
        if (postCountEl) postCountEl.textContent = Array.isArray(gameState.posts) ? gameState.posts.length : 0;

        const totalLikesEl = document.getElementById('totalLikes');
        if (totalLikesEl) {
            totalLikesEl.textContent = formatNumber(gameState.totalLikes);
        }

        const totalViewsEl = document.getElementById('totalViews');
        if (totalViewsEl) totalViewsEl.textContent = formatNumber(gameState.totalViews);

        // Update profile section stats
        const profileFollowersEl = document.getElementById('profileFollowers');
        if (profileFollowersEl) profileFollowersEl.textContent = formatNumber(gameState.followers);

        const profileTotalLikesEl = document.getElementById('profileTotalLikes');
        if (profileTotalLikesEl) profileTotalLikesEl.textContent = formatNumber(gameState.totalLikes);

        const profileTotalViewsEl = document.getElementById('profileTotalViews');
        if (profileTotalViewsEl) profileTotalViewsEl.textContent = formatNumber(gameState.totalViews);

        // Check verification
        const isNowVerified = Number(gameState.followers) >= 1000000;
        if (isNowVerified && !gameState.isVerified) {
            gameState.isVerified = true;
            const verifiedBadge = document.getElementById('verifiedBadge');
            if (verifiedBadge) verifiedBadge.style.display = 'inline-flex';
            addNotification('🎉 You are now verified!, You have reached 100K followers!', 'info');
        }

        const verifiedBadge = document.getElementById('verifiedBadge');
        if (verifiedBadge) verifiedBadge.style.display = gameState.isVerified ? 'inline-flex' : 'none';

        const adminBadge = document.getElementById('adminBadge');
        if (adminBadge) {
            if (gameState.isAdmin) {
                // Check if this is the owner (Sienna)
                const isOwner = gameState.username === 'Sienna';

                // If Owner has an active cosmetic badge, display it; otherwise show Owner badge
                if (isOwner && gameState.activeBadge) {
                    const badge = OWNER_COSMETICS.badges.find(b => b.id === gameState.activeBadge);
                    adminBadge.textContent = badge ? badge.name : '👑 Owner';
                } else {
                    adminBadge.textContent = isOwner ? '👑 Owner' : '👑 Admin';
                }
                adminBadge.style.display = 'inline-flex';
            } else {
                adminBadge.style.display = 'none';
            }
        }

        // Show/hide Owner tab based on username
        const boostsTabBtn = document.getElementById('boostsTabBtn');
        const ownerTabBtn = document.getElementById('ownerTabBtn');
        const isOwner = gameState.username === 'Sienna';
        if (boostsTabBtn) {
            boostsTabBtn.style.display = isOwner ? 'flex' : 'none';
        }
        if (ownerTabBtn) {
            ownerTabBtn.style.display = isOwner ? 'flex' : 'none';
        }

        // Update header stats
        const headerFollowersEl = document.getElementById('headerFollowers');
        if (headerFollowersEl) headerFollowersEl.textContent = formatNumber(gameState.followers);

        const headerLikesEl = document.getElementById('headerLikes');
        if (headerLikesEl) headerLikesEl.textContent = formatNumber(gameState.totalLikes);

        const headerViewsEl = document.getElementById('headerViews');
        if (headerViewsEl) headerViewsEl.textContent = formatNumber(gameState.totalViews);

        // Update toggles
        const autoPostToggle = document.getElementById('autoPostToggle');
        if (autoPostToggle) autoPostToggle.checked = gameState.autoPostEnabled;

        const autoPostToggleSettings = document.getElementById('autoPostToggleSettings');
        if (autoPostToggleSettings) autoPostToggleSettings.checked = gameState.autoPostEnabled;

        const aiModerationToggle = document.getElementById('aiModerationToggle');
        if (aiModerationToggle) aiModerationToggle.checked = gameState.aiModerationEnabled;

        const aiContentModerationToggle = document.getElementById('aiContentModerationToggle');
        if (aiContentModerationToggle) aiContentModerationToggle.checked = gameState.aiContentModerationEnabled;

        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) darkModeToggle.checked = gameState.darkModeEnabled;

        const feedSortBy = document.getElementById('feedSortBy');
        if (feedSortBy) feedSortBy.value = gameState.feedSortBy;

        // Render user themes
        if (typeof renderUserThemes === 'function') {
            renderUserThemes();
        }

        // Render achievement badges
        if (typeof renderAchievementBadges === 'function') {
            renderAchievementBadges();
        }

        // Check for badge unlocks
        if (typeof checkBadgeUnlocks === 'function') {
            checkBadgeUnlocks();
        }

        // Display selected badge on profile
        if (typeof displaySelectedBadge === 'function') {
            displaySelectedBadge();
        }

        // Update dynamic content
        if (typeof updateGrowthRates === 'function') updateGrowthRates();
        if (typeof updateStatistics === 'function') updateStatistics();
        if (typeof renderFeed === 'function') renderFeed();
        if (typeof renderVideos === 'function') renderVideos();
        if (typeof renderMessages === 'function') renderMessages();

        // Keep the active user card in sync without rebuilding the whole list (prevents hover flicker).
        if (typeof updateCurrentUserProfileCard === 'function') {
            updateCurrentUserProfileCard();
        }

        // Update platform selector UI
        if (typeof updatePlatformUI === 'function') updatePlatformUI();

        // Check for new game announcements to display in banner
        if (typeof checkNewAnnouncements === 'function') checkNewAnnouncements();

        if (typeof updateAutoPostCountdown === 'function') {
            updateAutoPostCountdown();
        }
    } catch (error) {
        console.error('Error in renderUI:', error);
    }
}

function updatePostButtonStates() {
    const now = Date.now();
    const timeSinceLastPost = now - (gameState.lastPostTime || 0);
    const isOnCooldown = timeSinceLastPost < gameState.postCooldown;

    // Core creation zones
    const zones = [
        { id: 'GeneratePost', label: 'Post to Feed' },
        { id: 'GenerateVideo', label: 'Record Video' },
        { id: 'GenerateDuet', label: 'Start Duet' }
    ];

    zones.forEach(zone => {
        const zoneEl = document.getElementById(zone.id);
        if (!zoneEl) return;

        const actionTextEl = zoneEl.querySelector('.zone-action-text');

        if (isOnCooldown) {
            const secondsRemaining = Math.ceil((gameState.postCooldown - timeSinceLastPost) / 1000);
            zoneEl.classList.add('disabled');
            if (actionTextEl) {
                actionTextEl.textContent = `${zone.label} (${secondsRemaining}s)`;
            }
        } else {
            zoneEl.classList.remove('disabled');
            if (actionTextEl) {
                actionTextEl.textContent = zone.label;
            }
        }
    });
}

function formatTimerDuration(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }

    if (minutes > 0) {
        return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
    }

    return `${seconds}s`;
}

function switchFeedTab(type) {
    document.querySelectorAll('.feed-subtab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-feed-type="${type}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    const feedContainer = document.getElementById('feedContainer');
    const videosContainer = document.getElementById('videosContainer');
    const duetsContainer = document.getElementById('duetsContainer');
    const trendingContainer = document.getElementById('trendingHashtagsContainer');
    const viralContainer = document.getElementById('viralContainer');

    // Hide all containers
    if (feedContainer) feedContainer.style.display = 'none';
    if (videosContainer) videosContainer.style.display = 'none';
    if (duetsContainer) duetsContainer.style.display = 'none';
    if (trendingContainer) trendingContainer.style.display = 'none';
    if (viralContainer) viralContainer.style.display = 'none';

    // Show selected container
    if (type === 'posts') {
        if (feedContainer) feedContainer.style.display = 'block';
    } else if (type === 'videos') {
        if (videosContainer) videosContainer.style.display = 'block';
    } else if (type === 'duets') {
        if (duetsContainer) duetsContainer.style.display = 'block';
        if (typeof renderDuets === 'function') {
            renderDuets();
        }
    } else if (type === 'trending') {
        if (trendingContainer) trendingContainer.style.display = 'block';
        if (typeof renderTrendingHashtags === 'function') {
            renderTrendingHashtags();
        }
    } else if (type === 'viral') {
        if (viralContainer) viralContainer.style.display = 'block';
        if (typeof renderViral === 'function') {
            renderViral();
        }
    }
}

function renderActivity() {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    if (gameState.notifications.length === 0) {
        container.innerHTML = '<p class="no-activity">🦗 No new activity</p>';
        return;
    }

    container.innerHTML = '';
    gameState.notifications.forEach(notification => {
        addNotificationToDOM(notification);
    });

    if (gameState.currentActivityFilter) {
        filterActivity(gameState.currentActivityFilter);
    } else {
        filterActivity('all');
    }
}

function showUsernameEdit() {
    const usernameModal = document.getElementById('usernameModal');
    if (usernameModal) usernameModal.style.display = 'flex';

    const usernameInput = document.getElementById('usernameInput');
    if (usernameInput) {
        usernameInput.value = gameState.username;
        usernameInput.focus();
    }

    const currentPic = gameState.profilePicture;
    document.querySelectorAll('.profile-pic-modal-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.getAttribute('data-pic') === currentPic) {
            btn.classList.add('selected');
        }
    });
}

function hideUsernameEdit() {
    document.getElementById('usernameModal').style.display = 'none';
}

function saveUsername() {
    const newUsername = document.getElementById('usernameInput').value.trim();
    if (!newUsername) {
        addNotification('❌ Username cannot be empty!', 'info');
        return;
    }

    // Allow "Sienna" only for the default user or if already Sienna
    if (newUsername.toLowerCase() === 'sienna' && gameState.username.toLowerCase() !== 'sienna' && currentUserId !== 'default') {
        addNotification('❌ This username is reserved and cannot be used!', 'info');
        return;
    }

    gameState.username = newUsername;
    document.getElementById('username').textContent = gameState.username;

    const selectedPicBtn = document.querySelector('.profile-pic-modal-btn.selected');
    if (selectedPicBtn) {
        const newPic = selectedPicBtn.getAttribute('data-pic');
        gameState.profilePicture = newPic;
        const profileEmoji = PROFILE_PICTURE_MAP[newPic] || newPic;
        document.querySelector('.avatar-large').textContent = profileEmoji;
    }

    hideUsernameEdit();
    saveGame();
    addNotification(`✨ Profile updated!`);
}

function updateMilestones() {
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
}

function initializeAutoPostSlider() {
    const slider = document.getElementById('autoPostIntervalSlider');
    const display = document.getElementById('autoPostIntervalDisplay');

    if (slider && display) {
        // Convert milliseconds to minutes
        const minutes = gameState.autoPostInterval / 60000;
        slider.value = minutes;
        display.textContent = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    if (typeof updateAutoPostCountdown === 'function') {
        updateAutoPostCountdown();
    }
}

function initializeContentDeletionSlider() {
    const slider = document.getElementById('contentDeletionSlider');
    const display = document.getElementById('contentDeletionDisplay');

    if (slider && display) {
        slider.value = gameState.contentDeletionTime;
        display.textContent = `${gameState.contentDeletionTime} minute${gameState.contentDeletionTime !== 1 ? 's' : ''}`;
    }
}

function getNextAutoPostTimestamp() {
    if (!gameState.autoPostEnabled) {
        return null;
    }

    const lastAutoPostTime = Number(gameState.lastAutoPostTime) || 0;
    const autoPostInterval = Number(gameState.autoPostInterval) || 0;
    const lastPostTime = Number(gameState.lastPostTime) || 0;
    const postCooldown = Number(gameState.postCooldown) || 0;

    return Math.max(
        lastAutoPostTime + autoPostInterval,
        lastPostTime + postCooldown
    );
}

function updateAutoPostCountdown() {
    const activityDisplay = document.getElementById('autoPostCountdownDisplayActivity');
    const settingsDisplay = document.getElementById('autoPostCountdownDisplaySettings');

    if (!activityDisplay && !settingsDisplay) {
        return;
    }

    const displays = [activityDisplay, settingsDisplay].filter(Boolean);
    const nextAutoPostTime = getNextAutoPostTimestamp();
    const now = Date.now();

    let text = 'Paused';
    let title = 'Auto-post is disabled';

    if (gameState.autoPostEnabled) {
        if (!nextAutoPostTime || nextAutoPostTime <= now) {
            text = 'Ready now';
            title = 'Auto-post can fire on the next loop tick';
        } else {
            const remainingMs = nextAutoPostTime - now;
            text = `Next in ${formatTimerDuration(remainingMs)}`;
            title = `Scheduled for ${new Date(nextAutoPostTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            })}`;
        }
    }

    displays.forEach(display => {
        display.textContent = text;
        display.title = title;
    });
}

function checkNewAnnouncements() {
    const banner = document.getElementById('announcementBanner');
    if (!banner) return;

    // Fetch from Global storage instead of local gameState
    const globalAnnouncementsRaw = localStorage.getItem('simstaGlobalAnnouncements');
    let announcements = [];
    try {
        announcements = globalAnnouncementsRaw ? JSON.parse(globalAnnouncementsRaw) : [];
    } catch (e) {
        announcements = [];
    }

    if (announcements.length === 0) {
        banner.style.display = 'none';
        banner.dataset.currentId = '';
        return;
    }

    // Get the latest announcement
    const latest = announcements[0];

    // Check if it's already been seen (closed) by this profile
    if (gameState.seenAnnouncements && gameState.seenAnnouncements.includes(latest.id)) {
        banner.style.display = 'none';
        banner.dataset.currentId = '';
        return;
    }

    // Only re-render if the ID has changed or banner is hidden
    if (banner.dataset.currentId === latest.id.toString() && banner.style.display === 'flex') {
        return;
    }

    // Render the banner
    banner.innerHTML = `
        <div class="banner-icon">📢</div>
        <div class="banner-content">
            <div class="banner-text">${latest.message}</div>
            <div class="banner-time">Official Update • ${new Date(latest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <button class="banner-close" title="Dismiss">✕</button>
    `;

    banner.style.display = 'flex';
    banner.dataset.currentId = latest.id;

    // Add close event
    const closeBtn = banner.querySelector('.banner-close');
    if (closeBtn) {
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            if (!gameState.seenAnnouncements) gameState.seenAnnouncements = [];
            gameState.seenAnnouncements.push(latest.id);

            // Animation
            banner.style.opacity = '0';
            banner.style.transform = 'translate(-50%, -20px) scale(0.95)';
            banner.style.transition = 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)';

            setTimeout(() => {
                banner.style.display = 'none';
                banner.style.opacity = '';
                banner.style.transform = '';
                banner.style.transition = '';
                banner.dataset.currentId = '';
                saveGame();
            }, 400);
        };
    }
}
function updatePlatformUI() {
    const platformModule = document.getElementById('platformModule');
    if (!platformModule) return;

    // Show/hide based on unlock status (currently always unlocked)
    platformModule.style.display = gameState.crossPostingUnlocked ? 'block' : 'none';

    const selected = gameState.selectedPlatforms || ['simsta'];
    document.querySelectorAll('.platform-card').forEach(card => {
        const platform = card.dataset.platform;
        if (selected.includes(platform)) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });

    const countDisplay = document.getElementById('platformCountDisplay');
    if (countDisplay) {
        const count = selected.length;
        countDisplay.textContent = `${count} Platform${count !== 1 ? 's' : ''}`;
    }
}
