const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  createTab: (options) => ipcRenderer.invoke('create-tab', options),
  switchTab: (options) => ipcRenderer.invoke('switch-tab', options),
  closeTab: (options) => ipcRenderer.invoke('close-tab', options),
  resizeSidebar: (width) => ipcRenderer.invoke('resize-sidebar', width)
});
