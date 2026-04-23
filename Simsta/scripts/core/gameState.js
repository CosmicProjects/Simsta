// Game State - Game state variables
const gameState = {
  username: "Player",
  profilePicture: "girl1",
  followers: 0,
  totalLikes: 0,
  totalShares: 0,
  totalViews: 0,
  totalComments: 0,
  notifications: [],
  ownerMultiplier: 1,
  posts: [],
  stories: [],
  currentViewedStoryId: null,
  lastSave: Date.now(),

  // Activity tracking for this session
  sessionFollowers: 0,
  sessionLikes: 0,
  sessionShares: 0,
  sessionComments: 0,
  lastFollowerNotification: 0,
  lastLikeNotification: 0,
  lastShareNotification: 0,
  lastCommentNotification: 0,
  isVerified: false,
  isAdmin: true, // Player is the admin/owner
  currentActivityFilter: "all",
  currentFeedFilter: "posts",
  feedSortBy: "newest",
  exploreSortFilter: "all", // 'all', 'good', 'bad'

  // Admin system
  bannedPlayers: [], // List of banned player usernames
  warnedPlayers: {}, // Object tracking warnings: { username: warningCount }
  playerReports: [], // Array of reports from fake players
  reportFilter: "all", // 'all', 'pending', 'resolved'

  // AI Moderation
  aiModerationEnabled: true, // AI Report Moderation
  aiContentModerationEnabled: true, // AI Content Moderation
  flaggedContent: [], // Array of flagged content for review

  // UI Settings
  darkModeEnabled: false, // Dark mode toggle
  userTheme: "default", // User theme preference
  lastProfileShoutoutAt: 0, // Cooldown timestamp for giving shoutouts
  pendingShoutoutFollowers: 0, // Followers queued from incoming shoutouts
  unlockedBadges: ["starter"], // Achievement badges unlocked
  selectedBadge: "starter", // Currently selected badge to display on profile

  // Viral state
  viralPosts: {},
  viralNotificationQueue: [],

  // Post cooldown
  lastPostTime: 0,
  postCooldown: 30000,

  // Auto-post settings
  autoPostEnabled: true,
  lastAutoPostTime: 0,
  autoPostInterval: 300000,

  // Content deletion settings (in minutes, max 30)
  contentDeletionTime: 10,

  // Player counter
  playerId: null,
  lastHeartbeat: Date.now(),

  // Statistics tracking
  sessionStartTime: Date.now(),
  peakFollowers: 0,
  totalViralPosts: 0,
  milestones: [],

  // Hashtag & Trending
  trendingHashtags: {},

  // Engagement tracking (for showing who liked/commented/shared)
  engagementData: {},

  // Live streaming
  isLive: false,
  liveStartTime: 0,
  totalLiveStreams: 0,
  totalLiveViewers: 0,

  // Game loop timing
  lastUpdateTime: Date.now(),

  // Owner-only features
  activeBadge: null, // Currently active badge for Owner
  ownerTheme: "default", // Owner's special theme
  gameAnnouncements: [], // Announcements sent by Owner to all players
  ownerRewards: [], // Special rewards/items for Owner

  // Multi-platform expansion
  selectedPlatforms: ['simsta'],
  crossPostingUnlocked: true, // Let's keep it true for now so user can see it
};

// Game Constants - Real-time growth rates (per second)
const GROWTH_RATES = {
  baseFollowerGrowth: 0.5,
  followerMultiplier: 0.00003,
  baseLikeGrowth: 0.5,
  likeMultiplier: 0.0001,
  baseShareGrowth: 0.2,
  shareMultiplier: 0.00003,
  baseCommentGrowth: 0.3,
  commentMultiplier: 0.00003,
  baseViewGrowth: 1,
  viewMultiplier: 0.0002,
  baseVideoLikeGrowth: 0.8,
  videoLikeMultiplier: 0.0002,
  baseVideoShareGrowth: 0.3,
  videoShareMultiplier: 0.0001,
  baseVideoCommentGrowth: 0.5,
  videoCommentMultiplier: 0.0001,
  baseMessageGrowth: 0.01,
  messageMultiplier: 0.0000001,
  baseMessageChance: 0.000003,
  messageChanceMultiplier: 0.0000001,
  maxFollowers: 5000000000,
  messageCooldown: 5000,
  messageDisplayDuration: 8000,
};

// Viral Constants
const VIRAL_CONFIG = {
  chancePerPost: 0.000005, // 1 in 200,000
  likesMultiplier: 24,
  sharesMultiplier: 18,
  commentsMultiplier: 24,
  followersMultiplier: 8,
  durationMs: 10000,
  notificationDelayMs: 2000,
  maxViralPosts: 1,
  minViralPosts: 1,
};

// Content age-based decay config
const CONTENT_DECAY_CONFIG = {
  maxAgeMs: 600000, // 10 minutes - content stops gaining engagement after this
  decayStartMs: 300000, // 5 minutes - decay starts after this
  decayMultiplier: 0.5,
  autoDeleteMs: 600000, // 10 minutes - auto-delete content after this
};

// Profile picture mapping
const PROFILE_PICTURE_MAP = {
  girl1: "😍",
  girl2: "💕",
  girl3: "⭐",
  girl4: "👑",
  girl5: "🌸",
  girl6: "🌹",
  girl7: "💖",
  girl8: "✨",
  girl9: "💎",
  girl10: "🎀",
  girl11: "🦋",
  girl12: "🌺",
};

// Milestone achievements
const MILESTONES = [
  { followers: 100, reward: "🎉 First 100 followers!", type: "milestone" },
  { followers: 1000, reward: "🌟 1K followers!", type: "milestone" },
  { followers: 10000, reward: "⭐ 10K followers!", type: "milestone" },
  { followers: 100000, reward: "👑 100K followers!", type: "milestone" },
  {
    followers: 1000000,
    reward: "💎 1M followers - Verified!",
    type: "milestone",
  },
  { followers: 10000000, reward: "🚀 10M followers!", type: "milestone" },
  { followers: 100000000, reward: "🌍 100M followers!", type: "milestone" },
  {
    followers: 1000000000,
    reward: "🏆 1B followers - Legend!",
    type: "milestone",
  },
];

// Track which milestones have been achieved
let achievedMilestones = new Set();
