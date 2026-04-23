// User Themes System - Allows all users to customize their UI theme

// Available themes for all users
const USER_THEMES = [
    { id: 'coral', name: 'Coral', color: '#FF6B6B', description: 'Vibrant coral pink' },
    { id: 'lime', name: 'Lime', color: '#00FF41', description: 'Neon lime green' },
    { id: 'cyan', name: 'Cyan', color: '#00D9FF', description: 'Bright cyan blue' },
    { id: 'magenta', name: 'Magenta', color: '#FF00FF', description: 'Electric magenta' },
    { id: 'orange', name: 'Orange', color: '#FF8C00', description: 'Vibrant orange' },
    { id: 'teal', name: 'Teal', color: '#20B2AA', description: 'Cool teal' },
    { id: 'pink', name: 'Hot Pink', color: '#FF1493', description: 'Hot pink' },
    { id: 'indigo', name: 'Indigo', color: '#4169E1', description: 'Deep indigo blue' }
];

function resetPrimaryThemeColors() {
    const root = document.documentElement;
    root.style.removeProperty('--primary');
    root.style.removeProperty('--primary-dark');
}

function applyUserThemeToRoot(themeId) {
    const theme = USER_THEMES.find(t => t.id === themeId);
    if (!theme) return false;

    const root = document.documentElement;
    root.style.setProperty('--primary', theme.color);
    root.style.setProperty('--primary-dark', theme.color);
    return true;
}

// Apply active profile theme state without saving.
// Owner theme wins only for owner profiles.
function applyProfileThemeOnUserSwitch() {
    resetPrimaryThemeColors();

    const userTheme = gameState.userTheme || 'default';
    if (userTheme !== 'default') {
        applyUserThemeToRoot(userTheme);
    }

    const canApplyOwnerTheme =
        typeof isOwner === 'function' &&
        isOwner() &&
        gameState.ownerTheme &&
        gameState.ownerTheme !== 'default' &&
        typeof applyThemeToUI === 'function';

    if (canApplyOwnerTheme) {
        applyThemeToUI(gameState.ownerTheme);
    }
}

// Apply user theme to UI
function applyUserTheme(themeId, options = {}) {
    const { persist = true } = options;
    const normalizedThemeId = themeId || 'default';

    // Default theme means clear inline overrides and use :root colors.
    if (normalizedThemeId === 'default') {
        resetPrimaryThemeColors();
        gameState.userTheme = 'default';
        if (persist) saveGame();
        return;
    }

    if (applyUserThemeToRoot(normalizedThemeId)) {
        gameState.userTheme = normalizedThemeId;
        if (persist) saveGame();
    }
}

// Get current user theme
function getCurrentUserTheme() {
    return gameState.userTheme || 'default';
}

// Initialize user theme on page load
function initializeUserTheme() {
    const savedTheme = gameState.userTheme || 'default';
    console.log('Initializing user theme:', savedTheme);

    applyUserTheme(savedTheme, { persist: false });
}

// Reapply theme after dark mode toggle to ensure theme colors override dark mode
function reapplyUserTheme() {
    const currentTheme = getCurrentUserTheme();
    setTimeout(() => {
        applyUserTheme(currentTheme, { persist: false });
    }, 50);
}

// Render user theme selection UI
function renderUserThemes() {
    const themesContainer = document.getElementById('userThemesContainer');
    if (!themesContainer) return;

    const currentTheme = getCurrentUserTheme();

    // If buttons haven't been created yet, create them once
    if (themesContainer.children.length === 0) {
        themesContainer.innerHTML = USER_THEMES.map(theme => `
            <button class="user-theme-btn ${currentTheme === theme.id ? 'active' : ''}"
                    data-theme-id="${theme.id}"
                    title="${theme.description}"
                    style="background-color: ${theme.color}; border-color: ${theme.color}; color: white;">
                <div style="font-size: 16px; margin-bottom: 4px;">●</div>
                <div>${theme.name}</div>
            </button>
        `).join('');

        // Add event listeners to theme buttons only once
        themesContainer.querySelectorAll('.user-theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const themeId = btn.getAttribute('data-theme-id');
                applyUserTheme(themeId);
                // Refresh to update active class state
                renderUserThemes();
                addNotification(`🎨 Theme changed to ${USER_THEMES.find(t => t.id === themeId)?.name}!`, 'info');
            });
        });
    } else {
        // Just update the active class state efficiently
        themesContainer.querySelectorAll('.user-theme-btn').forEach(btn => {
            const themeId = btn.getAttribute('data-theme-id');
            const isActive = themeId === currentTheme;
            btn.classList.toggle('active', isActive);
        });
    }
}
