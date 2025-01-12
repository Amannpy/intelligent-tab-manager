// popup.js

document.addEventListener('DOMContentLoaded', () => {
    loadTabGroups();
});

async function loadTabGroups() {
    // Fetch grouped tabs from storage or background
    chrome.storage.sync.get(['tabGroups'], (result) => {
        const groups = result.tabGroups || {};
        const container = document.getElementById('groups-container');
        container.innerHTML = '';

        for (const [groupName, tabs] of Object.entries(groups)) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'group';

            const title = document.createElement('div');
            title.className = 'group-title';
            title.textContent = groupName;
            groupDiv.appendChild(title);

            tabs.forEach(tab => {
                const tabDiv = document.createElement('div');
                tabDiv.className = 'tab-item';

                const favicon = document.createElement('img');
                favicon.src = tab.favIconUrl || 'icons/default.png';
                favicon.alt = 'Favicon';

                const titleText = document.createElement('span');
                titleText.textContent = tab.title;

                tabDiv.appendChild(favicon);
                tabDiv.appendChild(titleText);
                groupDiv.appendChild(tabDiv);
            });

            container.appendChild(groupDiv);
        }
    });
}
// popup.js

document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({}, (tabs) => {
      const groups = {}; // Organize tabs into groups
      tabs.forEach(tab => {
        // Example grouping logic
        const group = tab.url.includes('google') ? 'Google' : 'Other';
        if (!groups[group]) groups[group] = [];
        groups[group].push(tab);
      });
  
      const groupsContainer = document.getElementById('groups');
      for (const [groupName, groupTabs] of Object.entries(groups)) {
        const groupDiv = document.createElement('div');
        groupDiv.innerHTML = `<h2>${groupName}</h2>`;
        groupTabs.forEach(tab => {
          const tabElement = document.createElement('div');
          tabElement.textContent = tab.title;
          groupDiv.appendChild(tabElement);
        });
        groupsContainer.appendChild(groupDiv);
      }
    });
});
  