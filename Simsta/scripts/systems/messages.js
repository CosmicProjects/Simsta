// Messages Rendering Functions

let lastMessageRenderTime = 0;
const MESSAGE_INTERACTION_KEEP_MS = 60000;
const MESSAGE_AUTO_REPLY_TEMPLATES = [
    'Thanks for the message!',
    'Love your content lately.',
    'Keep posting, you are doing great!',
    'Appreciate the reply!',
    'That made my day, thank you!'
];

function getMessageTimestampMs(message) {
    if (!message || !message.timestamp) return Date.now();
    if (typeof message.timestamp === 'string') return new Date(message.timestamp).getTime();
    if (message.timestamp instanceof Date) return message.timestamp.getTime();
    return Number(message.timestamp) || Date.now();
}

function getMessageById(messageId) {
    return gameState.messages.find(m => String(m.id) === String(messageId));
}

function getMentionHandle(username) {
    return String(username || '')
        .replace(/\s*\(You\)\s*/gi, '')
        .trim()
        .replace(/\s+/g, '')
        .replace(/[^\w]/g, '');
}

function getReplyTargetFromInput(text) {
    const match = String(text || '').trim().match(/^@([A-Za-z0-9_]+)/);
    return match ? match[1] : '';
}

function renderMessages() {
    const container = document.getElementById('messagesContainer');
    if (!container) return;

    const now = Date.now();
    const messageDisplayDuration = GROWTH_RATES.messageDisplayDuration || 8000;
    if (!Array.isArray(gameState.messages)) gameState.messages = [];

    gameState.messages = gameState.messages.filter(m => {
        const messageTime = getMessageTimestampMs(m);
        const keepDuration = (m.isPinned || m.fromPlayer) ? MESSAGE_INTERACTION_KEEP_MS : messageDisplayDuration;
        return (now - messageTime) < keepDuration;
    });

    if (gameState.messages.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No messages yet. Start gaining followers to receive messages.</p></div>';
        return;
    }

    if (now - lastMessageRenderTime < 600) {
        updateMessageFadeOut();
        return;
    }
    lastMessageRenderTime = now;

    const sortedMessages = [...gameState.messages]
        .sort((a, b) => getMessageTimestampMs(b) - getMessageTimestampMs(a))
        .slice(0, 10);

    container.innerHTML = sortedMessages.map(message => {
        const messageTime = getMessageTimestampMs(message);
        const ageMs = now - messageTime;
        const keepDuration = (message.isPinned || message.fromPlayer) ? MESSAGE_INTERACTION_KEEP_MS : messageDisplayDuration;
        const agePercent = Math.min(100, (ageMs / keepDuration) * 100);
        const opacity = Math.max(0.3, 1 - (agePercent / 100) * 0.7);
        const isLiked = !!message.liked;
        const isReplied = !!message.replied;
        const isOutgoing = !!message.fromPlayer;
        const replyBtnLabel = isReplied ? 'Replied' : 'Reply';
        const likeBtnLabel = isLiked ? 'Liked' : 'Like';
        const replyDisabledAttr = isOutgoing ? 'disabled' : '';

        return `
            <div class="message-card ${isOutgoing ? 'outgoing' : ''}" style="opacity: ${opacity}; transition: opacity 0.3s ease-out;" data-message-id="${message.id}">
                <div class="message-header">
                    <span class="message-username">${escapeHtml(message.username)}</span>
                    <span class="message-time">${getTimeAgo(messageTime)}</span>
                </div>
                <div class="message-content">${escapeHtml(message.message)}</div>
                <div class="message-actions">
                    <button class="message-action-btn like ${isLiked ? 'active' : ''}" onclick="toggleMessageLike('${message.id}')">${likeBtnLabel}</button>
                    <button class="message-action-btn reply ${isReplied ? 'active' : ''}" onclick="prepareMessageReply('${message.id}')" ${replyDisabledAttr}>${replyBtnLabel}</button>
                    <button class="message-action-btn delete" onclick="deleteMessage('${message.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateMessageFadeOut() {
    const now = Date.now();
    const messageDisplayDuration = GROWTH_RATES.messageDisplayDuration || 8000;

    gameState.messages.forEach(message => {
        const messageEl = document.querySelector(`[data-message-id="${message.id}"]`);
        if (!messageEl) return;

        const messageTime = getMessageTimestampMs(message);
        const ageMs = now - messageTime;
        const keepDuration = (message.isPinned || message.fromPlayer) ? MESSAGE_INTERACTION_KEEP_MS : messageDisplayDuration;
        const agePercent = Math.min(100, (ageMs / keepDuration) * 100);
        const opacity = Math.max(0.3, 1 - (agePercent / 100) * 0.7);

        messageEl.style.opacity = opacity;
    });
}

function toggleMessageLike(messageId) {
    const message = getMessageById(messageId);
    if (!message) return;

    message.liked = !message.liked;
    message.isPinned = true;
    saveGame();
    renderMessages();
}

function prepareMessageReply(messageId) {
    const message = getMessageById(messageId);
    if (!message || message.fromPlayer) return;

    const input = document.getElementById('messageReplyInput');
    if (!input) return;

    const handle = getMentionHandle(message.username);
    input.value = handle ? `@${handle} ` : '';
    input.focus();
    message.replied = true;
    message.isPinned = true;
    saveGame();
    renderMessages();
}

function sendPlayerMessage() {
    const input = document.getElementById('messageReplyInput');
    if (!input) return;

    const text = input.value.trim();
    if (!text) {
        addNotification('Type a message before sending.', 'info');
        return;
    }

    gameState.messages.push({
        id: Date.now() + Math.random(),
        username: `${gameState.username} (You)`,
        message: text,
        timestamp: new Date(),
        fromPlayer: true,
        liked: false,
        replied: false,
        isPinned: true
    });

    input.value = '';
    saveGame();
    renderMessages();

    const targetHandle = getReplyTargetFromInput(text);
    if (targetHandle) {
        const preview = text.length > 60 ? `${text.slice(0, 60)}...` : text;
        addNotification(`You replied to ${targetHandle}: "${preview}"`, 'reply');
    }

    if (targetHandle && Math.random() < 0.65) {
        const senderUserId = typeof currentUserId !== 'undefined' ? currentUserId : null;
        const replyDelayMs = 1200 + Math.floor(Math.random() * 1800);
        setTimeout(() => {
            if (!senderUserId || senderUserId !== currentUserId) return;
            const replyText = MESSAGE_AUTO_REPLY_TEMPLATES[Math.floor(Math.random() * MESSAGE_AUTO_REPLY_TEMPLATES.length)];
            gameState.messages.push({
                id: Date.now() + Math.random(),
                username: targetHandle,
                message: replyText,
                timestamp: new Date(),
                fromPlayer: false,
                liked: false,
                replied: false
            });
            saveGame();
            renderMessages();
        }, replyDelayMs);
    }
}

function deleteMessage(messageId) {
    const before = gameState.messages.length;
    gameState.messages = gameState.messages.filter(m => String(m.id) !== String(messageId));
    if (gameState.messages.length !== before) {
        saveGame();
        renderMessages();
    }
}

let confirmationCallback = null;

function showConfirmationDialog(message, callback) {
    confirmationCallback = callback;
    document.getElementById('confirmationMessage').textContent = message;
    document.getElementById('confirmationModal').style.display = 'flex';
}

function closeConfirmation() {
    document.getElementById('confirmationModal').style.display = 'none';
    confirmationCallback = null;
}

function openStoryModal() {
    document.getElementById('storyModal').style.display = 'flex';
    if (gameState.stories.length > 0) {
        showStoriesList();
    } else {
        document.getElementById('storyCreationContainer').style.display = 'block';
        document.getElementById('storyViewsContainer').style.display = 'none';
        document.getElementById('storiesListContainer').style.display = 'none';
    }
}

function closeStoryModal() {
    gameState.currentViewedStoryId = null;
    document.getElementById('storyModal').style.display = 'none';
}

function showStoriesList() {
    gameState.currentViewedStoryId = null;
    document.getElementById('storyCreationContainer').style.display = 'none';
    document.getElementById('storyViewsContainer').style.display = 'none';

    const storiesListContainer = document.getElementById('storiesListContainer');
    if (!storiesListContainer) return;

    storiesListContainer.style.display = 'block';
    const storiesList = document.getElementById('storiesList');

    const storiesHTML = [...gameState.stories].reverse().map((story) => `
        <div class="story-item" data-story-id="${story.id}">
            <div class="story-header">
                <div class="story-content-preview">${story.content.substring(0, 100)}${story.content.length > 100 ? '...' : ''}</div>
                <div class="story-meta">
                    <span class="story-views">👁️ ${formatNumber(story.viewCount)} views</span>
                    <span class="story-time">${getTimeAgo(story.timestamp)}</span>
                </div>
            </div>
            <div class="story-actions">
                <button class="story-view-btn" onclick="viewStoryDetail(${story.id})">View</button>
                <button class="story-delete-btn" onclick="deleteStory(${story.id})">Delete</button>
            </div>
        </div>
    `).join('');

    storiesList.innerHTML = storiesHTML || '<p class="no-stories">No stories yet. Create your first story!</p>';
}

function renderStories() {
    showStoriesList();
}


