// Event Listeners Setup

function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Activity sub-tabs
    document.querySelectorAll('.activity-subtab-btn:not(.clear-all-btn)').forEach(btn => {
        btn.addEventListener('click', () => filterActivity(btn.dataset.activityType));
    });

    // Clear all notifications button
    document.getElementById('clearAllNotifications').addEventListener('click', clearAllNotifications);

    // Feed sub-tabs
    document.querySelectorAll('.feed-subtab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchFeedTab(btn.dataset.feedType));
    });

    // Feed sort dropdown
    document.getElementById('feedSortBy').addEventListener('change', (e) => {
        gameState.feedSortBy = e.target.value;
        renderFeed();
        saveGame();
    });

    // Post creation
    document.getElementById('GeneratePost').addEventListener('click', generateAndPublishPost);
    document.getElementById('GenerateVideo').addEventListener('click', generateAndPublishVideo);
    const generateHashtagsBtn = document.getElementById('generateHashtagsBtn');
    if (generateHashtagsBtn) {
        generateHashtagsBtn.addEventListener('click', fillRandomHashtags);
    }
    document.getElementById('GenerateDuet').addEventListener('click', createDuet);

    // Username editing
    document.getElementById('editUsernameBtn').addEventListener('click', showUsernameEdit);
    document.getElementById('saveUsernameBtn').addEventListener('click', saveUsername);
    document.getElementById('cancelUsernameBtn').addEventListener('click', hideUsernameEdit);
    document.getElementById('usernameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveUsername();
    });

    // Message interactions
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    if (sendMessageBtn && typeof sendPlayerMessage === 'function') {
        sendMessageBtn.addEventListener('click', sendPlayerMessage);
    }

    const messageReplyInput = document.getElementById('messageReplyInput');
    if (messageReplyInput && typeof sendPlayerMessage === 'function') {
        messageReplyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendPlayerMessage();
        });
    }

    // Settings
    document.getElementById('resetDataBtn').addEventListener('click', resetGameData);
    document.getElementById('confirmBtn').addEventListener('click', () => {
        if (confirmationCallback) confirmationCallback();
        closeConfirmation();
    });
    document.getElementById('cancelConfirmBtn').addEventListener('click', closeConfirmation);
    document.getElementById('closeProfileBtn').addEventListener('click', closePlayerProfile);
    document.getElementById('closeProfileBtnBottom').addEventListener('click', closePlayerProfile);

    // Auto-post toggles
    document.getElementById('autoPostToggle').addEventListener('change', (e) => {
        gameState.autoPostEnabled = e.target.checked;
        document.getElementById('autoPostToggleSettings').checked = e.target.checked;
        saveGame();
        addNotification(e.target.checked ? '🤖 Auto-post enabled' : '🤖 Auto-post disabled');
    });

    document.getElementById('autoPostToggleSettings').addEventListener('change', (e) => {
        gameState.autoPostEnabled = e.target.checked;
        document.getElementById('autoPostToggle').checked = e.target.checked;
        saveGame();
        addNotification(e.target.checked ? '🤖 Auto-post enabled' : '🤖 Auto-post disabled');
    });

    // Auto-post interval slider
    const autoPostIntervalSlider = document.getElementById('autoPostIntervalSlider');
    if (autoPostIntervalSlider) {
        autoPostIntervalSlider.addEventListener('input', (e) => {
            const minutes = parseInt(e.target.value);
            gameState.autoPostInterval = minutes * 60000; // Convert to milliseconds
            document.getElementById('autoPostIntervalDisplay').textContent = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
            saveGame();
            addNotification(`⏱️ Auto-post interval set to ${minutes} minute${minutes !== 1 ? 's' : ''}`);
        });
    }

    // Content deletion time slider
    const contentDeletionSlider = document.getElementById('contentDeletionSlider');
    if (contentDeletionSlider) {
        contentDeletionSlider.addEventListener('input', (e) => {
            const minutes = parseInt(e.target.value);
            gameState.contentDeletionTime = minutes;
            document.getElementById('contentDeletionDisplay').textContent = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
            saveGame();
            addNotification(`🗑️ Content will auto-delete after ${minutes} minute${minutes !== 1 ? 's' : ''}`);
        });
    }

    // AI Report Moderation toggle
    const aiModerationToggle = document.getElementById('aiModerationToggle');
    if (aiModerationToggle) {
        aiModerationToggle.addEventListener('change', (e) => {
            gameState.aiModerationEnabled = e.target.checked;
            AI_MODERATION_CONFIG.enabled = e.target.checked;
            saveGame();
            addNotification(e.target.checked ? '🤖 AI Report Moderation enabled' : '🤖 AI Report Moderation disabled');
        });
    }

    // AI Content Moderation toggle
    const aiContentModerationToggle = document.getElementById('aiContentModerationToggle');
    if (aiContentModerationToggle) {
        aiContentModerationToggle.addEventListener('change', (e) => {
            gameState.aiContentModerationEnabled = e.target.checked;
            saveGame();
            addNotification(e.target.checked ? '🤖 AI Content Moderation enabled' : '🤖 AI Content Moderation disabled');
        });
    }

    // Dark Mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            gameState.darkModeEnabled = e.target.checked;
            toggleDarkMode(e.target.checked);
            saveGame();
            addNotification(e.target.checked ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
        });
    }

    // Profile picture selector
    document.querySelectorAll('.profile-pic-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.profile-pic-modal-btn').forEach(b => {
                b.classList.remove('selected');
            });
            btn.classList.add('selected');
        });
    });

    // Close modal on background click
    document.getElementById('usernameModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('usernameModal')) {
            hideUsernameEdit();
        }
    });

    // Story modal
    document.getElementById('profilePictureBtn').addEventListener('click', openStoryModal);
    document.getElementById('closeStoryBtn').addEventListener('click', closeStoryModal);
    document.getElementById('postStoryBtn').addEventListener('click', postStory);
    document.getElementById('createNewStoryBtn').addEventListener('click', () => {
        document.getElementById('storiesListContainer').style.display = 'none';
        document.getElementById('storyViewsContainer').style.display = 'none';
        document.getElementById('storyCreationContainer').style.display = 'block';
    });
    document.getElementById('backToStoriesBtn').addEventListener('click', showStoriesList);

    // Close story modal on background click
    document.getElementById('storyModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('storyModal')) {
            closeStoryModal();
        }
    });

    // Engagement modal
    setupEngagementModalListeners();

    // Sound Effects toggle
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.addEventListener('change', (e) => {
            if (typeof audioManager !== 'undefined') {
                audioManager.soundEnabled = e.target.checked;
                audioManager.saveSoundSettings();
                if (e.target.checked) {
                    audioManager.playNotification();
                    addNotification('🔊 Sound effects enabled');
                } else {
                    addNotification('🔇 Sound effects disabled');
                }
            }
        });
    }

    // Sound Volume slider
    const soundVolumeSlider = document.getElementById('soundVolumeSlider');
    if (soundVolumeSlider) {
        soundVolumeSlider.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value) / 100;
            if (typeof audioManager !== 'undefined') {
                audioManager.setVolume(volume);
                document.getElementById('soundVolumeDisplay').textContent = `${e.target.value}%`;
            }
        });
    }

    // Live Stream buttons
    const goLiveBtn = document.getElementById('goLiveBtn');
    if (goLiveBtn) {
        goLiveBtn.addEventListener('click', goLive);
    }

    const endLiveBtn = document.getElementById('endLiveBtn');
    if (endLiveBtn) {
        endLiveBtn.addEventListener('click', endLive);
    }

    // Chat modal listeners
    setupChatModalListeners();

    // Stream Ended Continue button
    const streamEndedContinueBtn = document.getElementById('streamEndedContinueBtn');
    if (streamEndedContinueBtn) {
        streamEndedContinueBtn.addEventListener('click', () => {
            // Finalize the stream stats when player clicks Continue
            if (gameState.lastStreamData) {
                const followersBefore = Number(gameState.followers) || 0;
                const earnedFollowers = Number(gameState.lastStreamData.followerGainEarned) || 0;
                const followersAfter = Math.min(GROWTH_RATES.maxFollowers, followersBefore + earnedFollowers);
                const appliedFollowerGain = Math.max(0, followersAfter - followersBefore);

                gameState.followers = followersAfter;
                gameState.totalLikes += gameState.lastStreamData.likeGainEarned;
                gameState.totalComments += gameState.lastStreamData.commentGainEarned;
                gameState.sessionFollowers += appliedFollowerGain;
                gameState.sessionLikes += gameState.lastStreamData.likeGainEarned;
                gameState.sessionComments += gameState.lastStreamData.commentGainEarned;
                gameState.totalLiveStreams += 1;
                gameState.totalLiveViewers += gameState.lastStreamData.viewers;

                // Clear the stream data
                gameState.lastStreamData = null;
                saveGame();
                renderUI();
            }

            // Hide stream ended container and show the "Go Live" UI
            document.getElementById('streamEndedContainer').style.display = 'none';
            document.getElementById('notLiveContainer').style.display = 'flex';
        });
    }

    // Stream Ended Resume button
    const streamEndedResumeBtn = document.getElementById('streamEndedResumeBtn');
    if (streamEndedResumeBtn) {
        streamEndedResumeBtn.addEventListener('click', () => {
            if (typeof resumeLiveStream === 'function') {
                resumeLiveStream();
            }
        });
    }

    // User Management
    const addUserBtn = document.getElementById('addUserBtn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', showAddUserModal);
    }

    const createUserBtn = document.getElementById('createUserBtn');
    if (createUserBtn) {
        createUserBtn.addEventListener('click', handleCreateUser);
    }

    const cancelAddUserBtn = document.getElementById('cancelAddUserBtn');
    if (cancelAddUserBtn) {
        cancelAddUserBtn.addEventListener('click', hideAddUserModal);
    }

    // New user profile picture selector
    document.querySelectorAll('.new-user-pic-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.new-user-pic-btn').forEach(b => {
                b.classList.remove('selected');
            });
            btn.classList.add('selected');
        });
    });

    // Close add user modal on background click
    const addUserModal = document.getElementById('addUserModal');
    if (addUserModal) {
        addUserModal.addEventListener('click', (e) => {
            if (e.target === addUserModal) {
                hideAddUserModal();
            }
        });
    }

    // Enter key to create user
    const newUserUsername = document.getElementById('newUserUsername');
    if (newUserUsername) {
        newUserUsername.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleCreateUser();
        });
    }

    // Multi-Platform Selection
    document.querySelectorAll('.platform-card').forEach(card => {
        card.addEventListener('click', () => {
            const platform = card.dataset.platform;
            
            // Simsta is always required
            if (platform === 'simsta') return;

            if (gameState.selectedPlatforms.includes(platform)) {
                gameState.selectedPlatforms = gameState.selectedPlatforms.filter(p => p !== platform);
                card.classList.remove('active');
            } else {
                gameState.selectedPlatforms.push(platform);
                card.classList.add('active');
            }

            // Update display
            const count = gameState.selectedPlatforms.length;
            document.getElementById('platformCountDisplay').textContent = `${count} Platform${count !== 1 ? 's' : ''}`;
            
            if (typeof audioManager !== 'undefined') {
                audioManager.playClick();
            }
            
            saveGame();
        });
    });

    // Leaderboards
    initializeLeaderboards();
}

// User Management Modal Functions
function showAddUserModal() {
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.style.display = 'flex';
        const usernameInput = document.getElementById('newUserUsername');
        if (usernameInput) {
            usernameInput.value = '';
            usernameInput.focus();
        }

        // Select first profile picture by default
        document.querySelectorAll('.new-user-pic-btn').forEach((btn, index) => {
            btn.classList.remove('selected');
            if (index === 0) btn.classList.add('selected');
        });
    }
}

function hideAddUserModal() {
    const modal = document.getElementById('addUserModal');
    if (modal) modal.style.display = 'none';
}

function handleCreateUser() {
    const username = document.getElementById('newUserUsername').value.trim();
    const selectedPicBtn = document.querySelector('.new-user-pic-btn.selected');
    const profilePicture = selectedPicBtn ? selectedPicBtn.getAttribute('data-pic') : 'girl1';

    if (!username) {
        addNotification('❌ Please enter a username!', 'info');
        return;
    }

    hideAddUserModal();
    // Ask if user wants to switch to the new user
    showConfirmation(`Create user "${username}" and switch to it?`, () => {
        const userId = createNewUser(username, profilePicture);
        if (userId) {
            switchUser(userId);
            addNotification(`✅ User "${username}" created and switched!`, 'info');
        }
    });
}
