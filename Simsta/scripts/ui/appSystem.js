/**
 * AppSystem - Handles modular "apps" (tabs) that reside in their own files.
 */
const AppSystem = {
    apps: {},

    runWhenDomReady: function(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback, { once: true });
            return;
        }

        callback();
    },

    /**
     * Register a new app
     * @param {Object} config - { id, name, icon, html, onInit, onShow }
     */
    register: function(config) {
        this.apps[config.id] = config;
        console.log(`[AppSystem] Registered app: ${config.name} (${config.id})`);
        
        // Add tab button to navigation if it doesn't exist
        this.addTabButton(config);
        
        // Add tab content container to main if it doesn't exist
        this.addTabContent(config);

        if (config.onInit) config.onInit();
    },

    addTabButton: function(app) {
        const nav = document.querySelector('.tab-navigation');
        if (!nav) {
            if (document.readyState === 'loading') {
                this.runWhenDomReady(() => this.addTabButton(app));
            }
            return;
        }

        // Check if button already exists
        if (document.querySelector(`[data-tab="${app.id}"]`)) return;

        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        btn.dataset.tab = app.id;
        btn.innerHTML = `
            <span class="tab-icon">${app.icon}</span>
            <span class="tab-label">${app.name}</span>
        `;
        
        // Append before settings and owner if possible, otherwise at the end
        const settingsTab = document.querySelector('[data-tab="settings"]');
        if (settingsTab) {
            nav.insertBefore(btn, settingsTab);
        } else {
            nav.appendChild(btn);
        }

        btn.addEventListener('click', () => {
            if (typeof switchTab === 'function') {
                switchTab(app.id);
            } else {
                AppSystem.onTabSwitch(app.id);
            }
        });
    },

    addTabContent: function(app) {
        const main = document.querySelector('.main-content');
        if (!main) {
            if (document.readyState === 'loading') {
                this.runWhenDomReady(() => this.addTabContent(app));
            }
            return;
        }

        // Check if content already exists
        if (document.getElementById(`${app.id}-tab`)) return;

        const content = document.createElement('div');
        content.className = 'tab-content';
        content.id = `${app.id}-tab`;
        content.innerHTML = app.html;
        
        main.appendChild(content);
    },


    onTabSwitch: function(tabName) {
        if (this.apps[tabName] && this.apps[tabName].onShow) {
            this.apps[tabName].onShow();
        }
    }
};

// Hook into existing switchTab if it exists
// We'll wrap the original switchTab to trigger AppSystem events
const originalSwitchTab = typeof switchTab === 'function' ? switchTab : null;
if (originalSwitchTab) {
    window.switchTab = function(tabName) {
        originalSwitchTab(tabName);
        AppSystem.onTabSwitch(tabName);
    };
}
