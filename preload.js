const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  createTab: (options) => ipcRenderer.invoke('create-tab', options),
  switchTab: (options) => ipcRenderer.invoke('switch-tab', options),
  closeTab: (options) => ipcRenderer.invoke('close-tab', options),
  resizeSidebar: (width) => ipcRenderer.invoke('resize-sidebar', width),
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  logout: () => ipcRenderer.invoke('logout'),
  onTabUrlUpdated: (callback) => ipcRenderer.on('tab-url-updated', callback)
});
