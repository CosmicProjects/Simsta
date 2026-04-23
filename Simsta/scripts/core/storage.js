// Storage and Save/Load Functions
// All data persistence is handled by userManagement.js

function saveGame() {
    gameState.lastSave = Date.now();

    // Save current gameState to the users object
    if (typeof users !== 'undefined' && currentUserId) {
        users[currentUserId] = typeof normalizeUserRecord === 'function'
            ? normalizeUserRecord(JSON.parse(JSON.stringify(gameState)), currentUserId)
            : JSON.parse(JSON.stringify(gameState));
        saveUsers();
    }
}

function exportGameData() {
    const dataStr = JSON.stringify(gameState, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'game-data.json';
    link.click();
    URL.revokeObjectURL(url);
}

function importGameData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            const normalizedImport = typeof normalizeUserRecord === 'function'
                ? normalizeUserRecord(imported, currentUserId || 'default')
                : imported;
            Object.assign(gameState, normalizedImport);
            saveGame();
            renderUI();
            addNotification('✅ Data updated successfully!', 'info');
        } catch (error) {
            addNotification('❌ Invalid JSON: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

function resetGameData() {
    showConfirmation('Are you sure you want to reset all your data? This cannot be undone!', () => {
        gameState.followers = 0;
        gameState.totalLikes = 0;
        gameState.totalShares = 0;
        gameState.posts = [];
        gameState.videos = [];
        gameState.notifications = [];
        gameState.sessionFollowers = 0;
        gameState.sessionLikes = 0;
        gameState.sessionShares = 0;
        gameState.sessionComments = 0;
        gameState.isVerified = false;
        gameState.viralPosts = {};
        gameState.lastPostTime = 0;
        gameState.totalViews = 0;
        gameState.autoPostInterval = 600000;
        gameState.autoPostEnabled = false;

        saveGame();
        renderUI();
        addNotification('🔄 Game data has been reset!', 'info');
    });
}
