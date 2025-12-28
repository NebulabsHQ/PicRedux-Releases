const { contextBridge, ipcRenderer } = require('electron');

// Vérifier que contextBridge est disponible
if (!contextBridge || !ipcRenderer) {
  console.error('[Preload] ERREUR: contextBridge ou ipcRenderer non disponible!');
  throw new Error('ContextBridge non disponible dans preload');
}

// Exposer les APIs Electron de manière sécurisée
contextBridge.exposeInMainWorld('electronAPI', {
  // Sauvegarder un fichier dans un dossier spécifique
  // Transmet les arguments tels quels pour préserver toutes les propriétés (notamment inputPath)
  saveFile: (buffer, filePath, format = null, quality = 80, keepMetadata = true, preserveModificationTime = false, inputPath = null, options = {}) => 
    ipcRenderer.invoke('save-file', buffer, filePath, format, quality, keepMetadata, preserveModificationTime, inputPath, options),
  
  // Traiter un batch d'images (compression + sauvegarde automatique)
  processImageBatch: (images, config) => ipcRenderer.invoke('process-image-batch', images, config),
  
  // Convertir une image en AVIF avec Sharp
  convertToAvif: (imageBuffer, quality) => ipcRenderer.invoke('convert-to-avif', imageBuffer, quality),
  
  // Obtenir les chemins des fichiers sélectionnés (uniquement pour l'import, pas l'export)
  getFilePaths: () => ipcRenderer.invoke('get-file-paths'),
  
  // Ouvrir un dossier dans le Finder/Explorer
  openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),
  
  // Obtenir la locale du système
  getLocale: () => ipcRenderer.invoke('get-locale'),
  
  // Sélectionner un dossier personnalisé pour la sortie
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  
  // Vérifier une clé de licence Gumroad
  verifyLicense: (key) => ipcRenderer.invoke('verify-license', key),
  
  // Obtenir le statut de la licence (PRO/TRIAL)
  getLicenseStatus: () => ipcRenderer.invoke('get-license-status'),
  
  // Effacer la licence enregistrée
  clearLicense: () => ipcRenderer.invoke('clear-license'),
  
  // Vérifier le quota de compression
  checkQuota: () => ipcRenderer.invoke('check-quota'),
  
  // Incrémenter le quota de compression
  incrementQuota: () => ipcRenderer.invoke('increment-quota'),
  
  // Réinitialiser le quota de compression (pour les tests)
  resetQuota: () => ipcRenderer.invoke('reset-quota'),
});

