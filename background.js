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

// background.js

chrome.tabs.onCreated.addListener((newTab) => {
    chrome.tabs.query({}, (tabs) => {
      const duplicates = tabs.filter(tab => tab.url === newTab.url && tab.id !== newTab.id);
      if (duplicates.length > 0) {
        chrome.tabs.remove(newTab.id);
        alert('Duplicate tab closed!');
      }
    });
});

// background.js

const groupPatterns = {
    'Work': ['https://mail.google.com/*', 'https://docs.google.com/*'],
    'Social': ['https://www.facebook.com/*', 'https://twitter.com/*']
  };
  
  function groupTabs() {
    for (const [groupName, patterns] of Object.entries(groupPatterns)) {
      chrome.tabs.query({}, (tabs) => {
        const groupTabs = tabs.filter(tab => patterns.some(pattern => new RegExp(pattern.replace(/\*/g, '.*')).test(tab.url)));
        if (groupTabs.length > 0) {
          chrome.tabs.group({ tabIds: groupTabs.map(tab => tab.id) }, (groupId) => {
            chrome.tabGroups.update(groupId, { title: groupName, color: 'blue' });
          });
        }
      });
    }
  }
  
// Run grouping on startup and when tabs are updated
chrome.runtime.onStartup.addListener(groupTabs);
chrome.tabs.onUpdated.addListener(groupTabs);
  