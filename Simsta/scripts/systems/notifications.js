// Notification Functions

function clearAllNotifications() {
    gameState.notifications = [];
    const container = document.getElementById('notificationContainer');
    container.innerHTML = '<p class="no-activity">🦗 No new activity</p>';
    addNotification('✨ All notifications cleared!', 'info');
}

function filterActivity(type) {
    gameState.currentActivityFilter = type;

    document.querySelectorAll('.activity-subtab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeBtn = document.querySelector(`[data-activity-type="${type}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    const autopostContainer = document.getElementById('autopostContainer');
    if (autopostContainer) {
        autopostContainer.style.display = type === 'autopost' ? 'block' : 'none';
    }

    const notificationContainer = document.getElementById('notificationContainer');

    // Handle report filter separately
    if (type === 'report') {
        renderReportNotifications();
        return;
    }

    const notificationItems = notificationContainer.querySelectorAll('.notification-item');

    let visibleCount = 0;
    notificationItems.forEach(item => {
        const notifType = item.getAttribute('data-notification-type');
        const shouldShow = type === 'all' || notifType === type;

        if (shouldShow) {
            item.style.display = 'flex';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });

    let noActivityMsg = notificationContainer.querySelector('.no-activity');
    if (visibleCount === 0) {
        if (!noActivityMsg) {
            const msg = document.createElement('p');
            msg.className = 'no-activity';
            msg.textContent = '🦗 No new activity';
            notificationContainer.appendChild(msg);
        }
    } else if (noActivityMsg) {
        noActivityMsg.remove();
    }
}

function renderReportNotifications() {
    const container = document.getElementById('notificationContainer');

    if (gameState.playerReports.length === 0) {
        container.innerHTML = '<p class="no-activity">🦗 No reports yet</p>';
        return;
    }

    container.innerHTML = '';

    gameState.playerReports.forEach(report => {
        const reportEl = document.createElement('div');
        reportEl.className = 'notification-item';
        reportEl.id = `notif-report-${report.id}`;
        reportEl.style.display = 'flex';
        reportEl.style.alignItems = 'center';
        reportEl.style.gap = '12px';
        reportEl.style.padding = '12px';
        reportEl.style.background = 'var(--surface)';
        reportEl.style.borderRadius = '8px';
        reportEl.style.marginBottom = '8px';
        reportEl.style.border = '1px solid var(--border)';
        reportEl.style.cursor = 'pointer';
        reportEl.style.transition = 'all 0.2s ease';

        const timeAgo = getTimeAgo(report.timestamp);

        reportEl.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: var(--primary); border-radius: 8px; flex-shrink: 0;">
                <span style="font-size: 20px;">ℹ️</span>
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="color: var(--text-primary); font-weight: 600; margin-bottom: 4px; word-break: break-word;">
                    📋 New report: <span style="color: var(--primary);">${report.reporter}</span> reported <span style="color: #e74c3c;">${report.reported}</span>
                </div>
                <div style="color: var(--text-secondary); font-size: 12px;">
                    ${timeAgo}
                </div>
            </div>
        `;

        reportEl.addEventListener('mouseenter', () => {
            reportEl.style.background = 'rgba(26, 145, 218, 0.1)';
        });

        reportEl.addEventListener('mouseleave', () => {
            reportEl.style.background = 'var(--surface)';
        });

        container.appendChild(reportEl);
    });
}



function addNotification(message, type = 'info') {
    const notification = {
        id: Date.now() + Math.random(),
        message,
        type,
        timestamp: Date.now(),
    };

    gameState.notifications.push(notification);
    addNotificationToDOM(notification);

    // Play sound effect based on notification type
    if (typeof audioManager !== 'undefined') {
        switch(type) {
            case 'like':
                audioManager.playLike();
                break;
            case 'follow':
                audioManager.playFollow();
                break;
            case 'share':
                audioManager.playShare();
                break;
            case 'comment':
                audioManager.playComment();
                break;
            case 'reply':
                audioManager.playComment();
                break;
            case 'viral':
                audioManager.playViral();
                break;
            case 'post':
                audioManager.playPostPublished();
                break;
            case 'milestone':
                audioManager.playMilestone();
                break;
            case 'message':
                audioManager.playNotification();
                break;
            default:
                audioManager.playNotification();
        }
    }

    const currentFilter = gameState.currentActivityFilter || 'all';
    const notifEl = document.getElementById(`notif-${notification.id}`);
    if (notifEl) {
        if (currentFilter === 'all' || notification.type === currentFilter) {
            notifEl.style.display = 'flex';
        } else {
            notifEl.style.display = 'none';
        }
    }

    if (gameState.notifications.length > 50) {
        const oldestNotification = gameState.notifications[0];
        gameState.notifications.shift();
        removeNotificationFromDOM(oldestNotification.id);
    }
}

function addNotificationToDOM(notification) {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    if (gameState.notifications.length === 1) {
        container.innerHTML = '';
    }

    let icon = '📢';
    if (notification.type === 'follow') icon = '👥';
    if (notification.type === 'like') icon = '❤️';
    if (notification.type === 'comment') icon = '💬';
    if (notification.type === 'reply') icon = '↩️';
    if (notification.type === 'share') icon = '🔄';
    if (notification.type === 'post') icon = '📝';
    if (notification.type === 'viral') icon = '🚀';
    if (notification.type === 'message') icon = '💌';
    if (notification.type === 'info') icon = 'ℹ️';
    if (notification.type === 'video') icon = '🎥';
    if (notification.type === 'shoutout') icon = '🎤';
    if (notification.type === 'autopost') icon = '⚙️';
    if (notification.type === 'report') icon = '🚨';

    const timeAgo = getTimeAgo(notification.timestamp);
    let displayMessage = notification.message;
    const usernameMatch = notification.message.match(/^([A-Za-z\s]+)\s(has|commented)/);
    if (usernameMatch) {
        const username = usernameMatch[1];
        displayMessage = notification.message.replace(username, `<span class="clickable-username" data-username="${username}">${username}</span>`);
    }

    const notifEl = document.createElement('div');
    notifEl.className = `notification-item notification-${notification.type}`;
    notifEl.id = `notif-${notification.id}`;
    notifEl.setAttribute('data-notification-type', notification.type);
    notifEl.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <div class="notification-content">
            <span class="notification-text">${displayMessage}</span>
            <span class="notification-time">${timeAgo}</span>
        </div>
    `;

    if (container.firstChild) {
        container.insertBefore(notifEl, container.firstChild);
    } else {
        container.appendChild(notifEl);
    }

    const usernameEl = notifEl.querySelector('.clickable-username');
    if (usernameEl) {
        usernameEl.addEventListener('click', (e) => {
            e.stopPropagation();
            const username = usernameEl.getAttribute('data-username');
            showPlayerProfile(username);
        });
    }
}

function removeNotificationFromDOM(notificationId) {
    const notifEl = document.getElementById(`notif-${notificationId}`);
    if (notifEl) {
        notifEl.style.opacity = '0';
        notifEl.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => {
            notifEl.remove();
            const container = document.getElementById('notificationContainer');
            if (container.children.length === 0) {
                container.innerHTML = '<p class="no-activity">🦗 No new activity</p>';
            }
        }, 300);
    }
}
