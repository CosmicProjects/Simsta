// Engagement Details System - Show who liked, commented, shared

function initializeEngagementData(contentId, contentType = 'post') {
    if (!gameState.engagementData[contentId]) {
        gameState.engagementData[contentId] = {
            likers: [],
            commenters: [],
            comments: [],
            sharers: [],
        };
    } else if (!gameState.engagementData[contentId].comments) {
        gameState.engagementData[contentId].comments = [];
    }
}

function addEngagement(contentId, username, engagementType, text = '') {
    initializeEngagementData(contentId);
    
    const engagement = gameState.engagementData[contentId];
    
    if (engagementType === 'like') {
        if (!engagement.likers.includes(username)) {
            engagement.likers.push(username);
        }
    } else if (engagementType === 'comment') {
        if (!engagement.commenters.includes(username)) {
            engagement.commenters.push(username);
            engagement.comments.push({
                username: username,
                text: text,
                timestamp: Date.now()
            });
        }
    } else if (engagementType === 'share') {
        if (!engagement.sharers.includes(username)) {
            engagement.sharers.push(username);
        }
    }
}

function showEngagementDetails(contentId, engagementType, contentType = 'post') {
    initializeEngagementData(contentId);
    
    const engagement = gameState.engagementData[contentId];
    const modal = document.getElementById('engagementModal');
    const modalTitle = document.getElementById('engagementModalTitle');
    const modalContent = document.getElementById('engagementModalContent');

    if (!modal || !modalTitle || !modalContent) return;

    if (engagementType === 'comments') {
        modalTitle.textContent = '💬 Comments';
        const comments = engagement.comments || [];
        
        if (comments.length === 0) {
            modalContent.innerHTML = '<p style="text-align: center; color: #999;">No one has commented yet</p>';
        } else {
            modalContent.innerHTML = comments.map(comment => `
                <div class="engagement-user-item" style="flex-direction: column; align-items: flex-start; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span class="engagement-user-avatar">👤</span>
                        <span class="engagement-user-name" style="font-weight: 600;">${escapeHtml(comment.username)}</span>
                    </div>
                    <div class="engagement-comment-text" style="color: var(--text-secondary); font-size: 13px; padding-left: 28px;">
                        ${escapeHtml(comment.text)}
                    </div>
                </div>
            `).join('');
        }
    } else {
        let users = [];
        let title = '';

        if (engagementType === 'likes') {
            users = engagement.likers;
            title = '❤️ Likes';
        } else if (engagementType === 'shares') {
            users = engagement.sharers;
            title = '🔄 Shares';
        }

        modalTitle.textContent = title;

        if (users.length === 0) {
            modalContent.innerHTML = '<p style="text-align: center; color: #999;">No one has ' + engagementType + ' yet</p>';
        } else {
            modalContent.innerHTML = users.map(username => `
                <div class="engagement-user-item">
                    <span class="engagement-user-avatar">👤</span>
                    <span class="engagement-user-name">${escapeHtml(username)}</span>
                </div>
            `).join('');
        }
    }

    modal.style.display = 'flex';
}

function closeEngagementModal() {
    const modal = document.getElementById('engagementModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Add event listener for closing modal on background click
function setupEngagementModalListeners() {
    const modal = document.getElementById('engagementModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeEngagementModal();
            }
        });
    }

    const closeBtn = document.getElementById('closeEngagementModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeEngagementModal);
    }
}

