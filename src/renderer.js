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
  
  // Tab Rename Feature: Double click to edit
  span.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    span.contentEditable = "true";
    span.focus();
    document.execCommand('selectAll', false, null);
  });
  
  span.addEventListener('blur', () => {
    span.contentEditable = "false";
    if (span.textContent.trim() === '') {
      span.textContent = `New ${aiTitle} Chat`; // Fallback if empty
    }
    // Update top bar title if the renamed tab is currently active
    if (activeTabId === tabId) {
      currentTabTitle.textContent = span.textContent;
    }
  });
  
  span.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent adding new lines
      span.blur();
    }
  });
  
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

// --- Dropdown Logic ---
document.querySelectorAll('.ai-header').forEach(header => {
  header.addEventListener('click', (e) => {
    // Don't toggle if the user clicked the + button
    if (e.target.classList.contains('new-tab-btn')) return;
    
    const section = header.closest('.ai-section');
    section.classList.toggle('collapsed');
  });
});

// --- Resizer Logic ---
const resizer = document.getElementById('resizer');
const sidebar = document.getElementById('sidebar');
let isResizing = false;

resizer.addEventListener('mousedown', (e) => {
  isResizing = true;
  resizer.classList.add('active');
  document.body.style.cursor = 'col-resize';
});

document.addEventListener('mousemove', (e) => {
  if (!isResizing) return;
  
  // Ensure sidebar width stays within reasonable bounds
  let newWidth = e.clientX;
  if (newWidth < 150) newWidth = 150;
  if (newWidth > 600) newWidth = 600;
  
  sidebar.style.width = `${newWidth}px`;
  
  window.electronAPI.resizeSidebar(newWidth);
});

document.addEventListener('mouseup', () => {
  if (isResizing) {
    isResizing = false;
    resizer.classList.remove('active');
    document.body.style.cursor = 'default';
  }
});

// --- Window Controls ---
const minBtn = document.getElementById('min-btn');
const maxBtn = document.getElementById('max-btn');
const closeAppBtn = document.getElementById('close-btn');

if (minBtn) minBtn.addEventListener('click', () => window.electronAPI.windowMinimize());
if (maxBtn) maxBtn.addEventListener('click', () => window.electronAPI.windowMaximize());
if (closeAppBtn) closeAppBtn.addEventListener('click', () => window.electronAPI.windowClose());

// --- Logout Control ---
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all active sessions and log out?')) {
      await window.electronAPI.logout();
    }
  });
}
