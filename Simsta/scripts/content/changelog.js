// Changelog System

const CHANGELOG_ENTRIES = [
    {
        version: '3.1.0',
        date: '2025-11-25',
        changes: [
            '🎨 Enhanced UI/UX with modern design elements',
            '📱 Improved mobile responsiveness and touch interactions',
            '🔄 Dynamic content loading and infinite scrolling',
            '🔍 Enhanced search functionality for users, posts, and hashtags',
            '🎨 Added achievement badges to profile',
            '🎨 Added badge display to profile',
        ]
    },
    {
        version: '3.0.0',
        date: '2025-11-23',
        changes: [
            '🔴 Enhanced Live Streaming with Resume functionality',
            '📊 Stream stats only finalize when player presses Continue',
            '⏸️ Resume stream keeps all accumulated viewers, likes, followers, and comments',
            '🎯 Live stats continue gaining even when tab is inactive or minimized',
            '⏱️ Automatic catch-up for engagement when returning to stream',
            '🎨 Improved stream ended UI with equal-sized Resume and Continue buttons',
        ]
    },
    {
        version: '2.9.0',
        date: '2025-11-22',
        changes: [
            'Fixed Dark Mode theme inheritance from Owner Theme',
            '🎨 Dark Mode now inherits theme from Owner Theme',
        ]
    },
    {
        version: '2.8.0',
        date: '2025-11-22',
        changes: [
            '🎉 Added Live Streaming Feature',
            '🎥 Go live and broadcast your content',
            '👥 Engage with viewers in real-time',
            '❤️ Receive likes and comments during stream',
        ]
    },
    {
        version: '2.7.0',
        date: '2025-11-22',
        changes: [
            '👑 Added Owner Panel for exclusive features',
            '🌟 Exclusive cosmetics, rewards, and themes for Owner',
            '👑 Owner can send game announcements to all players',
            '🎉 Owner-exclusive rewards and badges',
            '🎨 Golden-themed UI for Owner panel',
            '🎨 Owner badges now replace existing badges on click',
            '🎨 Owner themes now persist across page refreshes',
            '🎨 Owner themes now apply to all tabs and pages',
        ]
    },
    {
        version: '2.6.0',
        date: '2025-11-22',
        changes: [
            '👥 Added Multi-User Profile System - Create and manage multiple user profiles',
            '🔄 Switch between users with completely separate game data and stats',
            '🎨 Profile picture selection with 12 feminine emoji options (hearts, stars, crown, etc.)',
            '🗑️ Delete non-default users with confirmation dialog',
            '📊 Each user maintains independent followers, posts, videos, and engagement',
            '🔴 Fixed critical bug: Players no longer gain followers/likes without posting content',
            '⏱️ Fixed elapsed time calculation to prevent huge stat jumps when switching users',
            '🎬 Live Stream improvements: Stats only add to totals when stream ends',
            '💬 Added Live Chat Modal with toggle button for better UI organization',
            '✨ Enhanced live stream UI with modern gradient backgrounds and animations',
            '🎯 Live stats display with hover effects and visual feedback',
            '🌟 Improved End Live button with shine animation effect',
            '📱 Better responsive layout for live streaming interface',
        ]
    },
    {
        version: '2.5.0',
        date: '2025-11-20',
        changes: [
            '❓ Added "How to Play" guide with comprehensive game mechanics explanation',
            '📱 Guide explains Posts, Videos, Duets, and their auto-deletion mechanics',
            '⏰ Explains customizable content deletion time (1-30 minutes) for game balance',
            '🎮 Auto-shows on first visit, accessible anytime via header button',
            '📊 Covers all game features: followers, engagement, AI moderation, and tips',
        ]
    },
    {
        version: '2.4.0',
        date: '2025-11-20',
        changes: [
            '🤖 Added AI Content Moderation for posts, videos, and duets',
            '🚫 AI automatically flags and removes spam/inappropriate content',
            '⚙️ Toggle AI Content Moderation on/off in Settings',
            '🔍 Content analysis for spam keywords, emojis, and engagement patterns',
            '📊 Flagged content tracking and automatic removal after delay',
        ]
    },
    {
        version: '2.3.0',
        date: '2025-11-20',
        changes: [
            '🤖 Added AI Report Moderation system for automatic report resolution',
            '⚡ AI analyzes reports and takes appropriate action (warn/ban/dismiss)',
            '🎯 AI confidence-based decisions based on report reason',
            '⚙️ Toggle AI Report Moderation on/off in Settings',
            '🏷️ Reports show 🤖 badge when resolved by AI',
        ]
    },
    {
        version: '2.2.0',
        date: '2025-11-20',
        changes: [
            '📋 Added Reports tab for managing player reports',
            '📖 Added Report Meanings button explaining each report reason',
            '🚨 Fake players now report each other for various reasons',
            '⏳ Filter reports by status: All, Pending, Resolved',
            '⚠️ Take action on reports: Warn, Ban, or Dismiss',
        ]
    },
    {
        version: '2.1.0',
        date: '2025-11-20',
        changes: [
            '⚠️ Added Warning system for players (3 warnings = auto-ban)',
            '🎯 Warn button shows warning count (e.g., ⚠️ Warn (1/3))',
            '🚫 Auto-ban players after 3 warnings',
            '📊 Better player management with graduated consequences',
            '🏆 Banned and warned players tracked in admin system',
        ]
    },
    {
        version: '2.0.0',
        date: '2025-11-20',
        changes: [
            '🚨 Fake players now post spam/bad content (20% chance)',
            '⚠️ Bad posts have low engagement and spam-like content',
            '🎨 Bad posts styled with red dashed border for easy identification',
            '🚫 Easier to spot and ban problematic players',
            '📊 Improved content quality monitoring',
        ]
    },
    {
        version: '1.9.0',
        date: '2025-11-20',
        changes: [
            '⏰ Added customizable content auto-delete timer in Settings',
            '🗑️ Posts, videos, and duets now delete after your chosen time (1-30 minutes)',
            '⚙️ Default is 10 minutes, adjustable with slider',
            '💾 Setting persists across page refreshes',
            '🎮 Game balance maintained through content deletion',
        ]
    },
    {
        version: '1.8.0',
        date: '2025-11-20',
        changes: [
            '📊 Added sort filters to Explore tab: All Posts, Good Posts, Bad Posts',
            '✨ Good posts highlighted with green badge (high engagement)',
            '⚠️ Bad posts highlighted with red badge (low engagement)',
            '🎯 Easier to identify problematic posts for banning',
            '🔍 Improved content discovery and filtering',
        ]
    },
    {
        version: '1.7.0',
        date: '2025-11-20',
        changes: [
            '👑 Added Admin/Owner badge to your profile',
            '🚫 Admin can now ban players for bad behavior or inappropriate posts',
            '🛡️ Banned players\' posts are hidden from the Explore feed',
            '⚡ Ban system integrated with real-time post filtering',
            '📋 Admin controls for community moderation',
        ]
    },
    {
        version: '1.6.0',
        date: '2025-11-20',
        changes: [
            '🔍 Added Explore tab to discover posts from other players',
            '👥 Fake players now create posts with hashtags automatically',
            '📱 New feed showing other players\' content with engagement stats',
            '⚡ Fake player posts generate every 15 seconds',
            '🌍 Community-driven content discovery',
        ]
    },
    {
        version: '1.5.0',
        date: '2025-11-20',
        changes: [
            '🔗 Hashtags are now clickable in posts, videos, and duets',
            '🔍 Click any hashtag to see all posts using that hashtag',
            '📋 Added comprehensive changelog system',
            '🎨 Improved hashtag styling with underline and color',
            '📊 Hashtag trending and analytics',
        ]
    },
    {
        version: '1.4.0',
        date: '2025-11-20',
        changes: [
            '✨ Added Total Views to header stats',
            '📊 Fixed total views tracking for posts and videos',
            '🏷️ Auto-posts now include random hashtags automatically',
            '🎯 Improved hashtag bonus system for engagement',
            '💫 Better engagement tracking and analytics',
        ]
    },
    {
        version: '1.3.0',
        date: '2025-11-19',
        changes: [
            '🎨 Enhanced viral effect styling with golden glow',
            '🗑️ Deleted posts now properly remove engagement from totals',
            '👁️ Fixed player profile modal styling and display',
            '📱 Improved responsive layout for all devices',
            '🎯 Better visual feedback for user actions',
        ]
    },
    {
        version: '1.2.0',
        date: '2025-11-18',
        changes: [
            '⏱️ Added auto-post interval slider (1-20 minutes)',
            '🔄 Content now expires after customizable time',
            '🔔 Improved notification system with better formatting',
            '💫 Added pulsing animation for viral content',
            '⚙️ Customizable game settings and preferences',
        ]
    },
    {
        version: '1.1.0',
        date: '2025-11-18',
        changes: [
            '📊 Added Statistics tab with detailed analytics',
            '📈 Track engagement rate, viral posts, and growth metrics',
            '🎯 View performance data for posts and videos',
            '💹 Real-time statistics updates',
            '📉 Detailed breakdown of engagement sources',
        ]
    },
    {
        version: '1.0.0',
        date: '2025-11-18',
        changes: [
            '🎮 Initial release of Simsta - Social Media Simulation Game',
            '📱 Create posts, videos, and duets',
            '👥 Gain followers and build your audience',
            '❤️ Track likes, views, comments, and shares',
            '🌟 Viral content system with exponential growth',
            '💬 Messages and notifications system',
            '👤 Profile customization with emoji avatars',
            '🎨 Modern, responsive UI design',
            '💾 Game state persistence with localStorage',
            '🎯 Engagement rate tracking and analytics',
        ]
    },
    {
        version: '0.9.0',
        date: '2025-11-17',
        changes: [
            '🎨 UI/UX improvements and polish',
            '📱 Responsive design for mobile devices',
            '🎯 Better visual hierarchy and spacing',
            '✨ Improved button styling and interactions',
            '🔧 Performance optimizations',
        ]
    },
    {
        version: '0.8.0',
        date: '2025-11-17',
        changes: [
            '💬 Added Messages system',
            '📬 Receive messages from other players',
            '🔔 Message notifications',
            '💭 Message display with timestamps',
            '📊 Message activity tracking',
        ]
    },
    {
        version: '0.7.0',
        date: '2025-11-17',
        changes: [
            '🎬 Added Duets feature',
            '🎥 Create duets by responding to videos',
            '👥 Duet engagement and collaboration',
            '📊 Duet statistics and tracking',
            '🌟 Duet viral potential',
        ]
    },
    {
        version: '0.6.0',
        date: '2025-11-17',
        changes: [
            '🎥 Added Videos feature',
            '📹 Upload and create videos',
            '👁️ Video views and engagement',
            '❤️ Video likes and comments',
            '📊 Video performance tracking',
        ]
    },
    {
        version: '0.5.0',
        date: '2025-11-17',
        changes: [
            '🌟 Added Viral content system',
            '💥 Posts can go viral with exponential growth',
            '🎉 Viral notifications and alerts',
            '📊 Viral post tracking and statistics',
            '🏆 Viral achievement system',
        ]
    },
    {
        version: '0.4.0',
        date: '2025-11-17',
        changes: [
            '📊 Added Activity tracking system',
            '👥 Track followers gained',
            '❤️ Track likes received',
            '🔄 Track shares received',
            '💬 Track comments received',
            '📈 Real-time activity updates',
        ]
    },
    {
        version: '0.3.0',
        date: '2025-11-17',
        changes: [
            '🔔 Added Notifications system',
            '📢 Notifications for followers, likes, comments, shares',
            '🎨 Styled notification display',
            '⏱️ Auto-dismiss notifications',
            '📋 Notification history',
        ]
    },
    {
        version: '0.2.0',
        date: '2025-11-17',
        changes: [
            '📱 Added Posts feature',
            '✍️ Create and publish posts',
            '❤️ Posts receive likes and engagement',
            '💬 Comments on posts',
            '🔄 Share posts with others',
            '📊 Post engagement tracking',
        ]
    },
    {
        version: '0.1.0',
        date: '2025-11-17',
        changes: [
            '🎮 Project initialization',
            '👤 Profile system with username and avatar',
            '📊 Basic stats tracking (followers, likes, views)',
            '🎨 Initial UI layout and styling',
            '💾 Game state management',
            '🎯 Core game loop setup',
        ]
    },
];

const CHANGELOG_VERSION_KEY = 'lastSeenChangelogVersion';

function getLastSeenVersion() {
    return localStorage.getItem(CHANGELOG_VERSION_KEY) || '0.0.0';
}

function setLastSeenVersion(version) {
    localStorage.setItem(CHANGELOG_VERSION_KEY, version);
}

function hasNewChangelog() {
    const lastSeen = getLastSeenVersion();
    const latestVersion = CHANGELOG_ENTRIES[0].version;
    return lastSeen !== latestVersion;
}

function showChangelogModal() {
    if (!hasNewChangelog()) return;

    const modal = document.createElement('div');
    modal.className = 'changelog-modal';
    modal.id = 'changelogModal';

    const latestEntry = CHANGELOG_ENTRIES[0];
    const changesHTML = latestEntry.changes.map(change => `<li>${change}</li>`).join('');

    modal.innerHTML = `
        <div class="changelog-content">
            <div class="changelog-header">
                <h2>🎉 What's New</h2>
                <button class="changelog-close" onclick="closeChangelogModal()">✕</button>
            </div>
            <div class="changelog-body">
                <div class="changelog-version">v${latestEntry.version}</div>
                <div class="changelog-date">${new Date(latestEntry.date).toLocaleDateString()}</div>
                <ul class="changelog-list">
                    ${changesHTML}
                </ul>
            </div>
            <div class="changelog-footer">
                <button class="changelog-btn" onclick="closeChangelogModal()">Got it!</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setLastSeenVersion(latestEntry.version);
}

function closeChangelogModal() {
    const modal = document.getElementById('changelogModal');
    if (modal) {
        modal.remove();
    }
}

// Show changelog on page load if there's a new version
window.addEventListener('load', () => {
    setTimeout(showChangelogModal, 500);
});

function showChangelogHistory() {
    const modal = document.getElementById('changelogHistoryModal');
    const container = document.getElementById('changelogHistoryContainer');

    if (!modal || !container) return;

    // Generate HTML for all changelog entries
    const historyHTML = CHANGELOG_ENTRIES.map(entry => {
        const changesHTML = entry.changes.map(change => `<li>${change}</li>`).join('');
        const entryDate = new Date(entry.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
            <div class="changelog-entry-card">
                <div class="entry-header">
                    <div class="entry-version">v${entry.version}</div>
                    <div class="entry-date">${entryDate}</div>
                </div>
                <ul class="entry-changes">
                    ${changesHTML}
                </ul>
            </div>
        `;
    }).join('');

    container.innerHTML = historyHTML;
    modal.style.display = 'flex';
}

function closeChangelogHistory() {
    const modal = document.getElementById('changelogHistoryModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('changelogHistoryModal');
    if (modal && e.target === modal) {
        closeChangelogHistory();
    }
});
