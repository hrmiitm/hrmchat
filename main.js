const { app, BrowserWindow, WebContentsView, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let views = {}; // Maps tabId to WebContentsView instance
let currentTabId = null;
let sidebarWidth = 250;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    autoHideMenuBar: true,
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
      const bounds = mainWindow.getContentBounds();
      views[currentTabId].setBounds({ x: sidebarWidth, y: 50, width: bounds.width - sidebarWidth, height: bounds.height - 50 });
    }
  });
}

// Fix Google Login issue using Firefox User-Agent to bypass strict Chromium checks
const FIREFOX_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0';
app.userAgentFallback = FIREFOX_UA;

// Suppress libva hardware acceleration error on Linux
app.disableHardwareAcceleration();

// Ensure the app runs without sandbox in packaged Linux environments (AppImage, Snap, Deb)
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('lang', 'en-US');

app.whenReady().then(() => {
  const { session } = require('electron');
  
  // Intercept headers to completely mask Electron
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = FIREFOX_UA;
    details.requestHeaders['Accept-Language'] = 'en-US,en;q=0.9';
    
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
    }
  });
  
  views[tabId] = view;

  // Fix: Force Gemini's Google Login to happen in a popup window
  // Google Auth trusts distinct popup windows more than embedded views
  view.webContents.on('will-navigate', (e, navUrl) => {
    if (navUrl.startsWith('https://accounts.google.com/') && url.includes('gemini.google.com')) {
      e.preventDefault();
      
      const loginWin = new BrowserWindow({
        width: 600,
        height: 800,
        title: 'Sign in to Google',
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });
      
      // Remove menu bar for cleaner popup
      loginWin.setMenuBarVisibility(false);
      loginWin.loadURL(navUrl);
      
      // Watch for the redirect back to Gemini
      loginWin.webContents.on('will-navigate', (e2, returnUrl) => {
        if (returnUrl.startsWith('https://gemini.google.com/')) {
          e2.preventDefault();
          loginWin.close();
          // Load the authenticated session back into the main tab!
          view.webContents.loadURL(returnUrl);
        }
      });
    }
  });

  // Ensure 'window.open' (used by Claude/ChatGPT for login) opens properly
  view.webContents.setWindowOpenHandler(({ url: newUrl }) => {
    return { action: 'allow' };
  });

  view.webContents.loadURL(url);

  view.webContents.on('did-navigate', (e, navUrl) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('tab-url-updated', { tabId, url: navUrl });
    }
  });

  view.webContents.on('did-navigate-in-page', (e, navUrl) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('tab-url-updated', { tabId, url: navUrl });
    }
  });

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
    const contentBounds = mainWindow.getContentBounds();
    view.setBounds({ x: sidebarWidth, y: 50, width: contentBounds.width - sidebarWidth, height: contentBounds.height - 50 });
  }
  return true;
});

ipcMain.handle('resize-sidebar', (event, newWidth) => {
  sidebarWidth = newWidth;
  if (currentTabId && views[currentTabId]) {
    const contentBounds = mainWindow.getContentBounds();
    views[currentTabId].setBounds({ x: sidebarWidth, y: 50, width: contentBounds.width - sidebarWidth, height: contentBounds.height - 50 });
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

ipcMain.handle('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('logout', async () => {
  const { session } = require('electron');
  // Clear all storage data (cookies, local storage, etc.)
  await session.defaultSession.clearStorageData();
  
  // Reload all active tabs to reflect the logged-out state
  Object.values(views).forEach(view => {
    view.webContents.reload();
  });
  return true;
});
