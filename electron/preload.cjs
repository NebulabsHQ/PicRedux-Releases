// External libraries
const { contextBridge, ipcRenderer } = require('electron');

if (!contextBridge || !ipcRenderer) {
  throw new Error('ContextBridge non disponible dans preload');
}

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (buffer, filePath, format = null, quality = 80, keepMetadata = true, preserveModificationTime = false, inputPath = null, options = {}) => 
    ipcRenderer.invoke('save-file', buffer, filePath, format, quality, keepMetadata, preserveModificationTime, inputPath, options),
  
  processImageBatch: (images, config) => ipcRenderer.invoke('process-image-batch', images, config),
  
  convertToAvif: (imageBuffer, quality) => ipcRenderer.invoke('convert-to-avif', imageBuffer, quality),
  
  getFilePaths: () => ipcRenderer.invoke('get-file-paths'),
  
  openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),
  
  getLocale: () => ipcRenderer.invoke('get-locale'),
  
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  
  verifyLicense: (key) => ipcRenderer.invoke('verify-license', key),
  
  getLicenseStatus: () => ipcRenderer.invoke('get-license-status'),
  
  clearLicense: () => ipcRenderer.invoke('clear-license'),
  
  checkQuota: () => ipcRenderer.invoke('check-quota'),
  
  incrementQuota: () => ipcRenderer.invoke('increment-quota'),
  
  resetQuota: () => ipcRenderer.invoke('reset-quota'),
});

