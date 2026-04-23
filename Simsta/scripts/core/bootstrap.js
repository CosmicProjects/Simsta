const LEGACY_SCRIPT_SOURCES = [
  "scripts/core/gameState.js",
  "scripts/core/constants.js",
  "scripts/core/utils.js",
  "scripts/core/userManagement.js",
  "scripts/systems/shoutouts.js",
  "scripts/core/storage.js",
  "scripts/systems/notifications.js",
  "scripts/systems/player.js",
  "scripts/systems/content.js",
  "scripts/systems/contentModeration.js",
  "scripts/systems/viral.js",
  "scripts/systems/engagement.js",
  "scripts/systems/hashtags.js",
  "scripts/systems/duets.js",
  "scripts/systems/feed.js",
  "scripts/systems/messages.js",
  "scripts/systems/stats.js",
  "scripts/systems/gameLoop.js",
  "scripts/ui/ui.js",
  "scripts/ui/events.js",
  "scripts/ui/contextMenu.js",
  "scripts/content/changelog.js",
  "scripts/systems/fakePlayerPosts.js",
  "scripts/systems/reports.js",
  "scripts/content/howToPlay.js",
  "scripts/content/disclaimerPopup.js",
  "scripts/ui/darkMode.js",
  "scripts/ui/themes.js",
  "scripts/ui/badges.js",
  "scripts/ui/leaderboards.js",
  "scripts/systems/audioManager.js?t=20251122001",
  "scripts/systems/live.js?t=20251122001",
  "scripts/owner/ownerFeatures.js?t=20251122001",
  "scripts/owner/ownerUI.js?t=20251122001",
  "scripts/ui/appSystem.js",
];

function initializeGame() {
  globalThis.initializeUserManagement();
  // Don't call loadGame() here - it's already loaded by initializeUserManagement
  globalThis.initializeDarkMode();
  globalThis.initializeLiveState();
  globalThis.setupEventListeners();
  globalThis.renderUI();
  globalThis.initializeAutoPostSlider();
  globalThis.initializeContentDeletionSlider();
  globalThis.initializePlayerCounter();
  globalThis.filterActivity("all");
  globalThis.initializeOwnerPanel();

  try {
    globalThis.renderLeaderboard("followers");
  } catch (error) {
    console.error("Leaderboard init error:", error);
  }

  try {
    if (typeof globalThis.bootstrapFakePlayerPosts === "function") {
      globalThis.bootstrapFakePlayerPosts();
    }
  } catch (error) {
    console.error("Explore init error:", error);
  }

  try {
    globalThis.startGameLoop();
  } catch (error) {
    console.error("Game loop start error:", error);
  }
}

// Classic script bootstrap keeps the existing globals intact.
// The loader helper comes from a data URL so file:// launches do not hit module CORS rules.
(async () => {
  const loaderModule = await import(
    `data:text/javascript;charset=utf-8,${encodeURIComponent(`
      export function loadClassicScript(src) {
        return new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = src;
          script.async = false;
          script.onload = () => resolve(src);
          script.onerror = () => {
            reject(new Error(\`Failed to load legacy script: \${src}\`));
          };

          (document.head || document.documentElement).appendChild(script);
        });
      }

      export async function loadClassicScripts(sources) {
        for (const src of sources) {
          await loadClassicScript(src);
        }
      }
    `)}`
  );

  try {
    await loaderModule.loadClassicScripts(LEGACY_SCRIPT_SOURCES);
    initializeGame();
  } catch (error) {
    console.error("Simsta bootstrap error:", error);
  }
})();
