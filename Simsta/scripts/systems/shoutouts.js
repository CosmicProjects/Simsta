// Profile Shoutout System

const PROFILE_SHOUTOUT_BASE_GAIN = 1500;
const PROFILE_SHOUTOUT_COOLDOWN_MS = 10 * 60 * 1000;
const PROFILE_SHOUTOUT_DRIP_PER_SECOND = 100;

function getProfileShoutoutCooldownRemainingMs(sourceUser) {
    const lastShoutoutAt = sourceUser?.lastProfileShoutoutAt || 0;
    if (!lastShoutoutAt) return 0;
    const elapsed = Date.now() - lastShoutoutAt;
    return Math.max(0, PROFILE_SHOUTOUT_COOLDOWN_MS - elapsed);
}

function formatCooldownTime(ms) {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function calculateProfileShoutoutGain(sourceFollowers) {
    const source = Math.max(0, Math.floor(sourceFollowers || 0));
    const influenceGain = Math.floor(source * (0.08 + Math.random() * 0.08)); // 8% - 16%
    const bonusGain = 500 + Math.floor(Math.random() * 1000); // 500 - 1.5K
    return Math.max(PROFILE_SHOUTOUT_BASE_GAIN, influenceGain + bonusGain);
}

function giveProfileShoutout(targetUserId) {
    if (!users[targetUserId]) return;
    if (!currentUserId || !users[currentUserId]) return;
    if (targetUserId === currentUserId) return;

    const targetUser = users[targetUserId];
    const sourceUser = users[currentUserId];
    const gain = calculateProfileShoutoutGain(sourceUser.followers);
    const sourceName = sourceUser.username || 'Player';
    const targetName = targetUser.username || 'Player';
    const remainingMs = getProfileShoutoutCooldownRemainingMs(gameState);

    if (remainingMs > 0) {
        addNotification(`⏳ Shoutout cooldown active: ${formatCooldownTime(remainingMs)} remaining`, 'info');
        return;
    }

    showConfirmation(
        `Give ${targetName} a shoutout? They will gain ${formatNumber(gain)} followers.`,
        () => {
            const confirmRemainingMs = getProfileShoutoutCooldownRemainingMs(gameState);
            if (confirmRemainingMs > 0) {
                addNotification(`⏳ Shoutout cooldown active: ${formatCooldownTime(confirmRemainingMs)} remaining`, 'info');
                return;
            }

            targetUser.pendingShoutoutFollowers = (targetUser.pendingShoutoutFollowers || 0) + gain;
            gameState.lastProfileShoutoutAt = Date.now();

            if (!Array.isArray(targetUser.notifications)) {
                targetUser.notifications = [];
            }

            targetUser.notifications.push({
                id: Date.now() + Math.random(),
                message: `📣 ${sourceName} gave you a shoutout! +${formatNumber(gain)} followers are rolling in`,
                type: 'follow',
                timestamp: Date.now(),
            });

            saveGame();
            renderUserProfiles();
            addNotification(`📢 You shouted out ${targetName}! +${formatNumber(gain)} followers will roll in over time`, 'shoutout');
        }
    );
}
