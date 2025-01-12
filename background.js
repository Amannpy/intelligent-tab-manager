// background.js

importScripts('ai/model.js');

// Initialize AI model
initModel();

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        processTab(tab);
    }
});

// Listen for new tab creation
chrome.tabs.onCreated.addListener((tab) => {
    processTab(tab);
});

// Function to process a tab
async function processTab(tab) {
    const tabData = {
        id: tab.id,
        url: tab.url,
        title: tab.title,
        favIconUrl: tab.favIconUrl
    };

    // Send tab data to AI module for grouping
    const group = await predictGroup(tabData);
    if (group) {
        // Fetch existing groups from storage
        chrome.storage.sync.get(['tabGroups'], (result) => {
            const groups = result.tabGroups || {};

            if (!groups[group]) {
                groups[group] = [];
            }

            // Avoid duplicate entries
            if (!groups[group].some(t => t.id === tab.id)) {
                groups[group].push(tabData);
                chrome.storage.sync.set({ tabGroups: groups }, () => {
                    console.log(`Tab "${tab.title}" added to group "${group}"`);
                });
            }
        });
    }
}

// background.js

// Function to suspend inactive tabs
function suspendTabs() {
    chrome.tabs.query({}, (tabs) => {
      const now = Date.now();
      tabs.forEach(tab => {
        // If tab hasn't been active for 30 minutes
        if (now - (tab.lastActive || now) > 30 * 60 * 1000) {
          chrome.tabs.update(tab.id, { url: 'chrome://suspend-page/' });
        }
      });
    });
  }
  
// Set interval to check every 15 minutes
setInterval(suspendTabs, 15 * 60 * 1000);
  