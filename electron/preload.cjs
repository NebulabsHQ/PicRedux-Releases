const { contextBridge, ipcRenderer, webUtils } = require('electron');

if (!contextBridge || !ipcRenderer) {
  throw new Error('ContextBridge not available in preload');
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
  
  // CRITICAL: Use webUtils.getPathForFile to get the real absolute path of a file
  // This is the proper Electron API to get file paths in the renderer process
  // Note: getPathForFile returns a Promise
  getPathForFile: (file) => {
    if (webUtils && webUtils.getPathForFile) {
      try {
        // webUtils.getPathForFile returns a Promise
        return webUtils.getPathForFile(file);
      } catch (error) {
        console.error('[preload] Error in getPathForFile:', error);
        return Promise.resolve(null);
      }
    }
    // Fallback to file.path if webUtils is not available
    return Promise.resolve(file ? (file.path || null) : null);
  },
});

