// Owner UI Functions

function initializeOwnerPanel() {
    if (!isOwner()) return;

    // Show owner-only tabs
    const boostsTabBtn = document.getElementById('boostsTabBtn');
    const ownerTabBtn = document.getElementById('ownerTabBtn');
    if (boostsTabBtn) {
        boostsTabBtn.style.display = 'flex';
    }
    if (ownerTabBtn) {
        ownerTabBtn.style.display = 'flex';
    }

    // Apply saved theme on page load
    if (gameState.ownerTheme && gameState.ownerTheme !== 'default') {
        applyThemeToUI(gameState.ownerTheme);
    }

    // Render Owner cosmetics
    renderOwnerCosmetics();

    // Render Owner rewards
    renderOwnerRewards();

    // Render announcements
    renderGameAnnouncements();

    // Render growth control state
    renderGrowthControls();

    // Setup event listeners
    setupOwnerEventListeners();
}

function renderGrowthControls() {
    if (!isOwner()) return;

    const currentMult = gameState.ownerMultiplier || 1;
    const currentMultiplierDisplay = document.getElementById('currentMultiplierDisplay');
    if (currentMultiplierDisplay) {
        currentMultiplierDisplay.textContent = `${currentMult}x`;
    }

    document.querySelectorAll('.growth-multiplier-btn').forEach(btn => {
        const buttonMultiplier = Number(btn.getAttribute('data-multiplier'));
        const isActive = buttonMultiplier === currentMult;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
    });
}

function renderAdminTools() {
    renderGrowthControls();
}


function renderOwnerCosmetics() {
    const cosmetics = getOwnerCosmetics();
    if (!cosmetics) return;

    // Render badges
    const badgesContainer = document.getElementById('ownerBadgesContainer');
    if (badgesContainer) {
        badgesContainer.innerHTML = cosmetics.badges.map(badge => `
            <button class="owner-badge-btn ${gameState.activeBadge === badge.id ? 'active' : ''}"
                    data-badge-id="${badge.id}"
                    title="${badge.description}">
                ${badge.name}
            </button>
        `).join('');

        // Add event listeners to badge buttons
        badgesContainer.querySelectorAll('.owner-badge-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const badgeId = btn.getAttribute('data-badge-id');
                handleBadgeClick(badgeId);
            });
        });
    }

    // Render themes
    const themesContainer = document.getElementById('ownerThemesContainer');
    if (themesContainer) {
        themesContainer.innerHTML = cosmetics.themes.map(theme => `
            <button class="owner-theme-btn ${gameState.ownerTheme === theme.id ? 'active' : ''}"
                    data-theme-id="${theme.id}"
                    style="border-color: ${theme.color};"
                    title="${theme.description}">
                ${theme.name}
            </button>
        `).join('');

        // Add event listeners to theme buttons
        themesContainer.querySelectorAll('.owner-theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const themeId = btn.getAttribute('data-theme-id');
                handleThemeClick(themeId);
            });
        });
    }
}

function handleBadgeClick(badgeId) {
    console.log('Badge clicked:', badgeId);
    applyOwnerBadge(badgeId);
    renderOwnerCosmetics();
}

function handleThemeClick(themeId) {
    console.log('Theme clicked:', themeId);
    console.log('Current username:', gameState.username);
    console.log('Is owner?', gameState.username === 'Sienna');
    applyOwnerTheme(themeId);
    renderOwnerCosmetics();
}

function renderOwnerRewards() {
    const rewards = getOwnerRewards();
    const rewardsContainer = document.getElementById('ownerRewardsContainer');

    if (rewardsContainer) {
        rewardsContainer.innerHTML = rewards.map(reward => `
            <div class="owner-reward-btn" title="${reward.description}">
                <div style="font-size: 24px; margin-bottom: 8px;">${reward.name.split(' ')[0]}</div>
                <div>${reward.name}</div>
                <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">✓ Unlocked</div>
            </div>
        `).join('');
    }
}

function renderGameAnnouncements() {
    const container = document.getElementById('announcementsListContainer');
    if (!container) return;

    // Fetch from Global storage
    const globalAnnouncementsRaw = localStorage.getItem('simstaGlobalAnnouncements');
    let announcements = [];
    try {
        announcements = globalAnnouncementsRaw ? JSON.parse(globalAnnouncementsRaw) : [];
    } catch (e) {
        announcements = [];
    }

    if (announcements.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No announcements yet</p>';
        return;
    }

    container.innerHTML = announcements.map(announcement => `
        <div class="announcement-item" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
            <div style="flex: 1;">
                <div class="announcement-item-text" style="font-size: 14px; margin-bottom: 4px;">${announcement.message}</div>
                <div class="announcement-item-time" style="font-size: 11px; color: var(--text-secondary);">${new Date(announcement.timestamp).toLocaleString()}</div>
            </div>
            <button class="delete-announcement-btn" data-id="${announcement.id}" style="background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px; opacity: 0.6; transition: opacity 0.2s;" title="Delete Announcement">🗑️</button>
        </div>
    `).join('');

    // Add event listeners for delete buttons
    container.querySelectorAll('.delete-announcement-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            showConfirmation('Delete this announcement?', () => {
                deleteGameAnnouncement(id);
            });
        });
        btn.addEventListener('mouseenter', () => btn.style.opacity = '1');
        btn.addEventListener('mouseleave', () => btn.style.opacity = '0.6');
    });
}

function setupOwnerEventListeners() {
    const sendBtn = document.getElementById('sendAnnouncementBtn');
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            const input = document.getElementById('announcementInput');
            if (input) {
                sendGameAnnouncement(input.value);
                input.value = '';
                renderGameAnnouncements();
            }
        });
    }
}

function updateOwnerPanel() {
    if (!isOwner()) return;
    renderOwnerCosmetics();
    renderOwnerRewards();
    renderGameAnnouncements();
}
