// Context Menu System for Posts, Videos, Duets

let currentContextItem = null;

function showContextMenu(event, itemType, itemId) {
    event.preventDefault();
    event.stopPropagation();

    const contextMenu = document.getElementById('contextMenu');
    currentContextItem = { type: itemType, id: itemId };

    // Position the menu at the click location
    contextMenu.style.left = event.clientX + 'px';
    contextMenu.style.top = event.clientY + 'px';
    contextMenu.style.display = 'block';
}



function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'none';
    currentContextItem = null;
}

function deleteContent() {
    if (!currentContextItem) return;

    const { type, id } = currentContextItem;
    let deleted = false;
    let notificationMessage = '';

    if (type === 'post') {
        const index = gameState.posts.findIndex(p => p.id === id);
        if (index !== -1) {
            const post = gameState.posts[index];
            // Subtract engagement from totals
            gameState.totalLikes -= post.likes;
            gameState.totalViews -= post.views;
            gameState.totalShares -= post.shares;
            gameState.totalComments -= post.comments;
            gameState.posts.splice(index, 1);
            deleted = true;
            renderFeed();
            notificationMessage = `📝 Post deleted: "${post.content.substring(0, 40)}${post.content.length > 40 ? '...' : ''}"`;
        }
    } else if (type === 'video') {
        const index = gameState.videos.findIndex(v => v.id === id);
        if (index !== -1) {
            const video = gameState.videos[index];
            // Subtract engagement from totals
            gameState.totalLikes -= video.likes;
            gameState.totalViews -= video.views;
            gameState.totalShares -= video.shares;
            gameState.totalComments -= video.comments;
            gameState.videos.splice(index, 1);
            deleted = true;
            renderVideos();
            notificationMessage = `🎥 Video deleted: "${video.content.substring(0, 40)}${video.content.length > 40 ? '...' : ''}"`;
        }
    } else if (type === 'duet') {
        const index = gameState.duets.findIndex(d => d.id === id);
        if (index !== -1) {
            const duet = gameState.duets[index];
            // Subtract engagement from totals
            gameState.totalLikes -= duet.likes;
            gameState.totalViews -= duet.views;
            gameState.totalShares -= duet.shares;
            gameState.totalComments -= duet.comments;
            gameState.duets.splice(index, 1);
            deleted = true;
            renderDuets();
            notificationMessage = `🎬 Duet with ${duet.collaborator} deleted`;
        }
    }

    if (deleted) {
        saveGame();
        renderViral();
        addNotification(notificationMessage, 'info');
    }

    hideContextMenu();
}

// Event listeners
document.addEventListener('click', (e) => {
    // Don't hide if clicking on context menu
    if (e.target.closest('.context-menu')) {
        return;
    }
    hideContextMenu();
});

document.addEventListener('contextmenu', (e) => {
    // Allow context menu on content items
    const post = e.target.closest('.post');
    const video = e.target.closest('.video');
    const duet = e.target.closest('.duet-card');
    const viralCard = e.target.closest('.viral-card');

    if (post && !post.classList.contains('viral')) {
        showContextMenu(e, 'post', parseInt(post.dataset.postId));
    } else if (video && !video.classList.contains('viral')) {
        showContextMenu(e, 'video', parseInt(video.dataset.videoId));
    } else if (duet && !duet.classList.contains('viral')) {
        showContextMenu(e, 'duet', parseInt(duet.dataset.duetId));
    } else if (viralCard) {
        e.preventDefault();
    }
});

// Handle context menu button click
document.addEventListener('click', (e) => {
    if (e.target.closest('.context-menu-item[data-action="delete"]')) {
        deleteContent();
    }
});

