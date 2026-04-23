// How to Play Guide

const HOW_TO_PLAY_CONTENT = {
    sections: [
        {
            title: '📱 Posts',
            description: 'Create posts to engage with your audience. Posts will automatically gain views, likes, comments, and shares based on your engagement rate and follower count. After the deletion time you set, posts are automatically deleted to maintain game balance.'
        },
        {
            title: '🎥 Videos',
            description: 'Upload videos to reach more people. Videos typically get more engagement than posts and will accumulate views, likes, comments, and shares. Like posts, videos are automatically deleted after the deletion time you set to maintain game balance.'
        },
        {
            title: '🎬 Duets',
            description: 'Create duets by responding to other players\' videos. Duets are a great way to collaborate and gain visibility. They follow the same engagement mechanics as videos and are also auto-deleted after your set deletion time to maintain game balance.'
        },
        {
            title: '⏱️ Auto-Post Interval (1-20 minutes)',
            description: 'Set how often you want content to automatically gain engagement. This is how frequently your posts/videos gain new views, likes, comments, and shares. Shorter intervals = faster growth, longer intervals = slower but more sustainable growth.'
        },
        {
            title: '⏰ Content Deletion Time (Customizable)',
            description: 'Set how long your posts, videos, and duets stay on your profile before being automatically deleted (1-30 minutes). This maintains game balance by preventing unlimited content accumulation. Shorter deletion times = more frequent content cycles. Longer deletion times = content stays longer to accumulate more engagement. The engagement you gained from the content is permanent!'
        },
        {
            title: '👥 Followers',
            description: 'Gain followers by creating engaging content. More followers = more potential engagement on your posts and videos. Reach 1,000,000 followers to get verified!'
        },
        {
            title: '❤️ Likes & 👁️ Views',
            description: 'Every post and video generates views and likes based on your engagement rate. Higher engagement rates mean more likes per view. Track your total likes and views in the header.'
        },
        {
            title: '🔄 Shares',
            description: 'When content is shared, it reaches more people and can go viral. Shares increase your visibility and can lead to exponential growth.'
        },
        {
            title: '💬 Comments',
            description: 'Comments show engagement with your content. More comments indicate your audience is actively interacting with your posts and videos.'
        },
        {
            title: '🤖 AI Moderation',
            description: 'Enable AI Content Moderation to automatically flag and remove spam or inappropriate content. Enable AI Report Moderation to have the AI automatically resolve player reports.'
        },
        {
            title: '📊 Statistics',
            description: 'Track your growth in the Statistics tab. View your engagement rate, viral posts, and other metrics to understand what content performs best.'
        },
        {
            title: '🎯 Tips for Success',
            description: '• Create content regularly to maintain engagement\n• Monitor your engagement rate to optimize content\n• Use the auto-post feature to grow passively\n• Check the feed to see what other players are doing\n• Aim for viral content to exponentially increase followers'
        }
    ]
};

function showHowToPlay() {
    const modal = document.getElementById('howToPlayModal');
    const content = document.getElementById('howToPlayContent');

    if (!modal || !content) return;

    // Generate HTML for all sections
    const sectionsHTML = HOW_TO_PLAY_CONTENT.sections.map(section => `
        <div class="how-to-play-section">
            <h4 style="margin: 16px 0 8px 0; color: var(--primary); font-size: 16px;">${section.title}</h4>
            <p style="margin: 0 0 12px 0; font-size: 14px; color: var(--text-secondary); line-height: 1.5; white-space: pre-wrap;">${section.description}</p>
        </div>
    `).join('');

    content.innerHTML = sectionsHTML;
    modal.style.display = 'flex';
}

function closeHowToPlay() {
    const modal = document.getElementById('howToPlayModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Add event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('closeHowToPlayBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeHowToPlay);
    }

    // Close modal when clicking outside
    const modal = document.getElementById('howToPlayModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeHowToPlay();
            }
        });
    }

    // Show How to Play on first visit
    if (!localStorage.getItem('hasSeenHowToPlay')) {
        setTimeout(() => {
            showHowToPlay();
            localStorage.setItem('hasSeenHowToPlay', 'true');
        }, 500);
    }
});

