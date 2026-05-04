const { app, BrowserWindow, WebContentsView, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let views = {}; // Maps tabId to WebContentsView instance
let currentTabId = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile('src/index.html');
  
  // Resize views when window resizes
  mainWindow.on('resize', () => {
    if (currentTabId && views[currentTabId]) {
      const bounds = mainWindow.getBounds();
      // Assume a top bar/sidebar takes some space. Let's say top bar is 50px high, and we use full width
      // Actually, we'll get the exact layout from the UI later, but let's assume sidebar is 250px and top tab bar is 50px.
      views[currentTabId].setBounds({ x: 250, y: 50, width: bounds.width - 250, height: bounds.height - 50 });
    }
  });
}

// Fix Google Login issue using Firefox User-Agent to bypass strict Chromium checks
const FIREFOX_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0';
app.userAgentFallback = FIREFOX_UA;

// Suppress libva hardware acceleration error on Linux
app.disableHardwareAcceleration();

app.whenReady().then(() => {
  const { session } = require('electron');
  
  // Intercept headers to completely mask Electron
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = FIREFOX_UA;
    
    // Firefox does not send sec-ch-ua headers. If Electron adds them, Google will detect the mismatch!
    delete details.requestHeaders['sec-ch-ua'];
    delete details.requestHeaders['sec-ch-ua-mobile'];
    delete details.requestHeaders['sec-ch-ua-platform'];
    
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('create-tab', (event, { tabId, url }) => {
  const view = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
      // Removed partition to use default session, ensuring login persists across all tabs
    }
  });
  
  views[tabId] = view;
  view.webContents.loadURL(url);

  return true;
});

ipcMain.handle('switch-tab', (event, { tabId }) => {
  if (currentTabId && views[currentTabId]) {
    mainWindow.contentView.removeChildView(views[currentTabId]);
  }
  
  currentTabId = tabId;
  const view = views[tabId];
  
  if (view) {
    mainWindow.contentView.addChildView(view);
    const bounds = mainWindow.getBounds();
    // In mac/linux, getting bounds of window includes title bar sometimes,
    // getContentBounds is better.
    const contentBounds = mainWindow.getContentBounds();
    // Layout: 250px left sidebar, 50px top header
    view.setBounds({ x: 250, y: 50, width: contentBounds.width - 250, height: contentBounds.height - 50 });
  }
  return true;
});

ipcMain.handle('close-tab', (event, { tabId }) => {
  if (currentTabId === tabId) {
    mainWindow.contentView.removeChildView(views[tabId]);
    currentTabId = null;
  }
  // Remove view
  delete views[tabId];
  return true;
});
