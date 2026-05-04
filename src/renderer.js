let tabCounter = 0;
let activeTabId = null;

const welcomeScreen = document.getElementById('welcome-screen');
const currentTabTitle = document.getElementById('current-tab-title');

// Listen to all + buttons
document.querySelectorAll('.new-tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const aiSection = e.target.closest('.ai-section');
    const aiName = aiSection.dataset.ai;
    const url = e.target.dataset.url;
    
    createTab(aiName, url);
  });
});

async function createTab(aiName, url) {
  tabCounter++;
  const tabId = `tab-${tabCounter}`;
  const list = document.getElementById(`${aiName}-tabs`);
  
  // Create tab UI
  const li = document.createElement('li');
  li.className = 'tab-item';
  li.id = tabId;
  
  const span = document.createElement('span');
  span.className = 'tab-title';
  // Capitalize AI name
  const aiTitle = aiName.charAt(0).toUpperCase() + aiName.slice(1);
  span.textContent = `New ${aiTitle} Chat`;
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.innerHTML = '×';
  closeBtn.title = "Close tab";
  closeBtn.onclick = (e) => {
    e.stopPropagation();
    closeTab(tabId);
  };
  
  li.appendChild(span);
  li.appendChild(closeBtn);
  
  li.onclick = () => switchTab(tabId, span.textContent);
  
  list.appendChild(li);
  
  // Call main process to create WebContentsView
  await window.electronAPI.createTab({ tabId, url });
  
  // Automatically switch to it
  switchTab(tabId, span.textContent);
}

async function switchTab(tabId, title) {
  if (activeTabId) {
    const prevTab = document.getElementById(activeTabId);
    if (prevTab) prevTab.classList.remove('active');
  }
  
  const currentTab = document.getElementById(tabId);
  if (currentTab) currentTab.classList.add('active');
  
  activeTabId = tabId;
  currentTabTitle.textContent = title;
  welcomeScreen.style.display = 'none';
  
  await window.electronAPI.switchTab({ tabId });
}

async function closeTab(tabId) {
  const tab = document.getElementById(tabId);
  if (tab) {
    tab.remove();
  }
  
  await window.electronAPI.closeTab({ tabId });
  
  if (activeTabId === tabId) {
    activeTabId = null;
    currentTabTitle.textContent = 'Select or create a chat';
    welcomeScreen.style.display = 'flex';
  }
}
