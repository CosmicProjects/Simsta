// Dark Mode Toggle Functionality

function toggleDarkMode(enabled) {
    const html = document.documentElement;

    if (enabled) {
        html.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-mode');
    } else {
        html.removeAttribute('data-theme');
        document.body.classList.remove('dark-mode');
    }

    // Reapply owner theme after dark mode toggle to ensure theme colors override dark mode
    if (
        typeof gameState !== 'undefined' &&
        gameState.ownerTheme &&
        gameState.ownerTheme !== 'default' &&
        typeof isOwner === 'function' &&
        isOwner()
    ) {
        if (typeof applyThemeToUI === 'function') {
            // Run after user theme reapply so owner theme remains authoritative.
            setTimeout(() => {
                applyThemeToUI(gameState.ownerTheme);
            }, 80);
        }
    }

    // Reapply user theme after dark mode toggle
    if (typeof reapplyUserTheme === 'function') {
        reapplyUserTheme();
    }
}

function initializeDarkMode() {
    // Check if dark mode was previously enabled
    if (gameState && gameState.darkModeEnabled) {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.checked = true;
        }
        toggleDarkMode(true);
    }

    // Initialize user theme
    if (typeof initializeUserTheme === 'function') {
        initializeUserTheme();
    }

    // Reapply owner theme after dark mode is initialized to ensure it takes precedence
    if (
        gameState &&
        gameState.ownerTheme &&
        gameState.ownerTheme !== 'default' &&
        typeof isOwner === 'function' &&
        isOwner()
    ) {
        if (typeof applyThemeToUI === 'function') {
            setTimeout(() => {
                applyThemeToUI(gameState.ownerTheme);
            }, 50);
        }
    }
}
