const { app, BrowserWindow, ipcMain, dialog, shell, net } = require('electron');
const path = require('path');
const { existsSync, writeFileSync, readFileSync, statSync, utimesSync, unlinkSync } = require('fs');
const sharp = require('sharp');

// Garder une référence globale de l'objet window
let mainWindow;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Configuration du produit Gumroad
const PRODUCT_ID = '2iuHpZLSnI_LmE1dnej9cg==';

// ============================================
// PNG Compression Parameters (3-Phase Model)
// ============================================
// PNG compression shows inherent plateau→cliff behavior due to libvips entropy limits.
// We use a 3-phase model to improve perceived linearity and UX.
//
// Phase A (100-75%): Dither-dominant, colors fixed at 256 (max fidelity)
// Phase B (75-45%):  Coupled dither + color reduction (balanced compression)
// Phase C (<45%):    Palette collapse (aggressive compression)
//
// Entropy dampening: When dither < 0.15 or colors < 128, accelerate decay to reduce dead zones.

/**
 * Get PNG compression parameters based on quality level (0-100)
 * Returns { colors, dither, phase } optimized for perceived linearity
 * 
 * @param {number} quality - Compression quality (0-100, where 100 = max fidelity)
 * @returns {{colors: number, dither: number, phase: string}} PNG compression parameters
 */
function getPngCompressionParams(quality) {
  // Clamp quality to valid range
  quality = Math.max(0, Math.min(100, quality));
  
  let colors, dither, phase;
  
  if (quality >= 75) {
    // Phase A (100-75%): Dither-dominant, colors fixed at 256
    phase = 'A';
    colors = 256; // Fixed max colors for fidelity
    // Dither scales from 1.0 (100%) to ~0.6 (75%)
    // Using exponential decay near 1.0 to exit plateau zone faster
    const phaseRatio = (quality - 75) / 25; // 0 (75%) to 1 (100%)
    dither = 0.6 + (0.4 * Math.pow(phaseRatio, 0.7)); // Soft curve: 100%→1.0, 75%→0.6
  } else if (quality >= 45) {
    // Phase B (75-45%): Coupled dither + color reduction
    phase = 'B';
    const phaseRatio = (quality - 45) / 30; // 0 (45%) to 1 (75%)
    
    // Colors: Linear reduction from 256 (75%) to 128 (45%)
    colors = Math.floor(128 + (128 * phaseRatio));
    
    // Dither: Continue decay from 0.6 (75%) to 0.15 (45%)
    // Accelerate decay when approaching 0.15 (entropy dampening)
    dither = 0.15 + (0.45 * Math.pow(1 - phaseRatio, 1.5)); // Faster decay near 0.15
  } else {
    // Phase C (<45%): Palette collapse (aggressive compression)
    phase = 'C';
    const phaseRatio = quality / 45; // 0 (0%) to 1 (45%)
    
    // Colors: Accelerated reduction from 128 (45%) to 2 (0%)
    // Entropy dampening: Reduce faster when < 128
    const colorRatio = Math.pow(phaseRatio, 0.8); // Slightly faster than linear
    colors = Math.max(2, Math.floor(2 + (126 * colorRatio)));
    
    // Dither: Rapid decay from 0.15 (45%) to 0.0 (0%)
    // Exponential decay for entropy dampening
    dither = 0.15 * Math.pow(phaseRatio, 2); // Quadratic decay: 45%→0.15, 0%→0.0
  }
  
  // Compression floor: Ensure at least one parameter changes per 1% slider movement
  // Round to prevent identical values across ranges
  colors = Math.round(colors);
  dither = Math.max(0, Math.min(1, Math.round(dither * 1000) / 1000)); // 3 decimal precision
  
  return { colors, dither, phase };
}

// Initialiser electron-store pour sauvegarder l'état de la licence (import dynamique car c'est un module ES)
// Clé de chiffrement offusquée (pas en clair pour éviter les modifications manuelles)
const keyPart1 = 'Nebula';
const keyPart2 = 'Tools';
const keyPart3 = 'x84';
const encryptionKey = keyPart1 + keyPart2 + keyPart3;

let store;
let storePromise = (async () => {
  const Store = (await import('electron-store')).default;
  
  try {
    // Tentative d'initialisation avec chiffrement
    store = new Store({
      encryptionKey: encryptionKey,
      defaults: {
        license: {
          isPro: false,
          key: null
        },
        compressionCount: 0
      }
    });
    
    // Tester la lecture pour détecter un ancien fichier non chiffré
    try {
      store.get('compressionCount');
    } catch (readError) {
      // Si la lecture échoue, c'est probablement un ancien fichier non chiffré
      console.warn('[Store] ⚠️ Erreur lors de la lecture du store. Migration nécessaire...');
      throw readError;
    }
  } catch (error) {
    // Erreur lors de l'initialisation ou de la lecture (ancien format non chiffré)
    console.warn('[Store] ⚠️ Fichier de config invalide ou non chiffré. Réinitialisation...');
    console.warn('[Store] Détails:', error.message);
    
    try {
      // Obtenir le chemin du fichier de config pour le supprimer
      // electron-store stocke dans: ~/Library/Application Support/picredux/config.json (macOS)
      // ou %APPDATA%/picredux/config.json (Windows)
      // ou ~/.config/picredux/config.json (Linux)
      const userDataPath = app.getPath('userData');
      const configPath = path.join(userDataPath, 'config.json');
      
      // Supprimer l'ancien fichier non chiffré
      if (existsSync(configPath)) {
        try {
          unlinkSync(configPath);
        } catch (unlinkError) {
          console.warn('[Store] ⚠️ Impossible de supprimer l\'ancien fichier:', unlinkError.message);
          // Continuer quand même, le nouveau store écrasera l'ancien
        }
      }
      
      // Recréer le store avec chiffrement
      // Note: Si le store existe déjà avec le même nom, il sera réinitialisé
      store = new Store({
        encryptionKey: encryptionKey,
        defaults: {
          license: {
            isPro: false,
            key: null
          },
          compressionCount: 0
        }
      });
      
      // Vérifier que le nouveau store fonctionne
      store.get('compressionCount');
    } catch (migrationError) {
      console.error('[Store] ❌ Erreur lors de la migration:', migrationError.message);
      console.error('[Store] Stack:', migrationError.stack);
      // En dernier recours, essayer de créer un store avec un nom différent
      // pour éviter de bloquer complètement l'application
      try {
        store = new Store({
          name: 'config-backup',
          encryptionKey: encryptionKey,
          defaults: {
            license: {
              isPro: false,
              key: null
            },
            compressionCount: 0
          }
        });
        console.warn('[Store] ⚠️ Store de secours créé (les données précédentes sont perdues)');
      } catch (fallbackError) {
        console.error('[Store] ❌ Échec total de l\'initialisation du store');
        throw fallbackError;
      }
    }
  }
  
  return store;
})();

// Fonction helper pour s'assurer que le store est initialisé
async function ensureStore() {
  if (!store) {
    await storePromise;
  }
  return store;
}

function createWindow() {
  // Vérifier que le chemin du preload est correct
  const preloadPath = path.join(__dirname, 'preload.cjs');
  
  // Créer la fenêtre du navigateur
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#09090b', // zinc-950 pour éviter les flashs blancs
    titleBarStyle: 'hiddenInset', // Style natif macOS (barre de titre intégrée)
    frame: true, // Garder la frame pour les contrôles de fenêtre
    webPreferences: {
      preload: preloadPath, // Chemin absolu vers le script preload
      contextIsolation: true, // CRITIQUE : doit être true pour contextBridge
      nodeIntegration: false, // CRITIQUE : doit être false pour la sécurité
      enableRemoteModule: false,
      webSecurity: true,
      sandbox: false, // Nécessaire pour certains modules comme sharp
    },
    show: false, // Ne pas afficher avant que tout soit chargé
  });

  // Écouter les erreurs du preload
  mainWindow.webContents.on('preload-error', (event, preloadPath, error) => {
    console.error('[Main] ❌ ERREUR Preload:', preloadPath);
    console.error('[Main] Détails de l\'erreur:', error);
  });

  // Vérifier que le preload est bien chargé après le chargement DOM
  mainWindow.webContents.on('dom-ready', () => {
    // Attendre un peu pour que le preload soit complètement chargé
    setTimeout(() => {
      mainWindow.webContents.executeJavaScript(`
        (function() {
          const hasAPI = typeof window.electronAPI !== 'undefined';
          if (!hasAPI) {
            console.error('[Renderer] ❌ ERREUR: window.electronAPI est undefined!');
          }
          return hasAPI;
        })();
      `).catch(err => {
        console.error('[Main] Erreur lors de la vérification:', err);
      });
    }, 500);
  });

  // Charger l'application
  if (isDev) {
    // Mode développement : charger depuis le serveur Vite
    mainWindow.loadURL('http://localhost:5173');
    
    // Ouvrir les DevTools en développement
    mainWindow.webContents.openDevTools();
  } else {
    // Mode production : charger depuis les fichiers buildés
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    if (existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      console.error('Fichier index.html introuvable dans dist/');
    }
  }

  // Afficher la fenêtre une fois que tout est prêt
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus sur la fenêtre
    if (isDev) {
      mainWindow.focus();
    }
  });

  // Gérer la fermeture de la fenêtre
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Gérer les erreurs de chargement
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    if (isDev) {
      console.error('Erreur de chargement:', errorCode, errorDescription);
    }
  });
}

// Cette méthode sera appelée quand Electron aura fini de s'initialiser
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // Sur macOS, il est courant de recréer une fenêtre quand l'icône
    // du dock est cliquée et qu'il n'y a pas d'autres fenêtres ouvertes
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quitter quand toutes les fenêtres sont fermées, sauf sur macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Gérer les erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('Erreur non capturée:', error);
});

// IPC Handlers
ipcMain.handle('save-file', async (event, bufferData, filePath, format = null, quality = 80, keepMetadata = true, preserveModificationTime = false, inputPath = null, options = {}) => {
  /**
   * Pipeline de traitement d'image avec Sharp
   * Ordre strict : Source → Métadonnées → Resize → Fill → Watermark → Format → Sauvegarde
   * 
   * options peut contenir:
   * - resize: { width, height, mode: 'dimensions'|'percentage', value }
   * - fillColor: string (hex color)
   * - watermark: { enabled, type: 'image'|'text', image, text, position, size, opacity, color, font }
   */
  
  // 1. INITIALISATION (Source)
  let pipeline;
  if (inputPath && existsSync(inputPath)) {
    pipeline = sharp(inputPath, { failOn: 'none' });
  } else {
    if (inputPath) {
      console.warn(`Fichier source introuvable: ${inputPath}`);
    }
    const inputBuffer = Buffer.isBuffer(bufferData) ? bufferData : Buffer.from(bufferData);
    if (!inputBuffer || inputBuffer.length === 0) {
      throw new Error('Buffer d\'entrée vide ou invalide');
    }
    pipeline = sharp(inputBuffer, { failOn: 'none' });
  }
  
  // Déterminer la taille originale (pour calculer le ratio de compression)
  let originalFileSize = null;
  try {
    if (inputPath && existsSync(inputPath)) {
      try {
        originalFileSize = statSync(inputPath).size;
      } catch (statError) {
        console.warn(`Impossible de lire la taille du fichier source: ${statError.message}`);
      }
    }
    
    if (originalFileSize === null && bufferData) {
      const inputBuffer = Buffer.isBuffer(bufferData) ? bufferData : Buffer.from(bufferData);
      originalFileSize = inputBuffer.length;
    }
    
    if (!originalFileSize || originalFileSize < 0) {
      originalFileSize = 0;
    }
    
    // Résolution du format (détection et conversion "Original")
    const fileExt = path.extname(filePath).toLowerCase();
    let sourceFileExt = fileExt;
    if (inputPath && existsSync(inputPath)) {
      sourceFileExt = path.extname(inputPath).toLowerCase();
    }
    
    let targetFormat = format ? format.toLowerCase() : null;
    if (targetFormat === 'original' || !targetFormat) {
      const ext = sourceFileExt.replace('.', '');
      if (ext === 'jpg' || ext === 'jpeg') {
        targetFormat = 'jpeg';
      } else if (ext === 'png') {
        targetFormat = 'png';
      } else if (ext === 'webp') {
        targetFormat = 'webp';
      } else {
        targetFormat = ext || 'jpeg';
      }
    }
    
    const isAvifRequested = targetFormat === 'avif' || fileExt === '.avif';
    let finalPath = filePath;
    
    // 2. GESTION DES MÉTADONNÉES (Prioritaire)
    const shouldKeep = String(keepMetadata) === 'true' || keepMetadata === true || keepMetadata === 1;
    if (shouldKeep) {
      pipeline = pipeline.withMetadata();
    }
    
    // 3. REDIMENSIONNEMENT (Resize)
    if (options.resize) {
      const { width, height, mode, value } = options.resize;
      if (mode === 'percentage' && value) {
        // Redimensionnement par pourcentage
        const metadata = await pipeline.metadata();
        const newWidth = Math.round(metadata.width * (value / 100));
        const newHeight = Math.round(metadata.height * (value / 100));
        pipeline = pipeline.resize(newWidth, newHeight, { fit: 'fill' });
      } else if (mode === 'dimensions') {
        // Redimensionnement par dimensions
        const resizeOptions = {};
        if (width && width > 0) resizeOptions.width = width;
        if (height && height > 0) resizeOptions.height = height;
        if (Object.keys(resizeOptions).length > 0) {
          pipeline = pipeline.resize(resizeOptions.width || null, resizeOptions.height || null, { 
            fit: 'inside',
            withoutEnlargement: true 
          });
        }
      }
    }
    
    // 4. REMPLISSAGE (Background Fill)
    if (options.fillColor) {
      // Convertir hex en RGB
      const hex = options.fillColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      pipeline = pipeline.flatten({ background: { r, g, b, alpha: 1 } });
    }
    
    // 5. FILIGRANE (Watermark)
    if (options.watermark && options.watermark.enabled) {
      const wm = options.watermark;
      const composites = [];
      
      if (wm.type === 'image' && wm.image) {
        // Filigrane image
        try {
          const watermarkBuffer = Buffer.isBuffer(wm.image) ? wm.image : Buffer.from(wm.image);
          const watermarkSharp = sharp(watermarkBuffer);
          const wmMetadata = await watermarkSharp.metadata();
          const imageMetadata = await pipeline.metadata();
          
          // Calculer la taille du watermark
          const wmSize = wm.size || 50; // Pourcentage
          const wmWidth = Math.round((imageMetadata.width * wmSize) / 100);
          const wmHeight = Math.round((wmMetadata.height * wmWidth) / wmMetadata.width);
          
          // Calculer la position
          const positions = {
            'top-left': { left: 10, top: 10 },
            'top-center': { left: Math.round((imageMetadata.width - wmWidth) / 2), top: 10 },
            'top-right': { left: imageMetadata.width - wmWidth - 10, top: 10 },
            'center-left': { left: 10, top: Math.round((imageMetadata.height - wmHeight) / 2) },
            'center': { left: Math.round((imageMetadata.width - wmWidth) / 2), top: Math.round((imageMetadata.height - wmHeight) / 2) },
            'center-right': { left: imageMetadata.width - wmWidth - 10, top: Math.round((imageMetadata.height - wmHeight) / 2) },
            'bottom-left': { left: 10, top: imageMetadata.height - wmHeight - 10 },
            'bottom-center': { left: Math.round((imageMetadata.width - wmWidth) / 2), top: imageMetadata.height - wmHeight - 10 },
            'bottom-right': { left: imageMetadata.width - wmWidth - 10, top: imageMetadata.height - wmHeight - 10 },
          };
          
          const pos = positions[wm.position] || positions['bottom-right'];
          
          // Redimensionner le watermark
          let watermarkToResize = watermarkSharp;
          const resizedWatermark = await watermarkToResize
            .resize(wmWidth, wmHeight, { fit: 'inside' })
            .toBuffer();
          
          // Appliquer l'opacité si nécessaire (après redimensionnement)
          let finalWatermark = resizedWatermark;
          if (wm.opacity && wm.opacity < 100) {
            const opacityValue = wm.opacity / 100;
            const watermarkWithOpacity = await sharp(resizedWatermark)
              .ensureAlpha()
              .composite([{
                input: {
                  create: {
                    width: wmWidth,
                    height: wmHeight,
                    channels: 4,
                    background: { r: 0, g: 0, b: 0, alpha: opacityValue }
                  }
                },
                blend: 'dest-in'
              }])
              .toBuffer();
            finalWatermark = watermarkWithOpacity;
          }
          
          composites.push({
            input: finalWatermark,
            left: pos.left,
            top: pos.top,
            blend: 'over',
            tile: false
          });
        } catch (wmError) {
          console.warn(`Erreur lors du traitement du filigrane image: ${wmError.message}`);
        }
      } else if (wm.type === 'text' && wm.text) {
        // Filigrane texte - Sharp ne supporte pas directement le texte, on utilise SVG
        try {
          const imageMetadata = await pipeline.metadata();
          const width = imageMetadata.width;
          const height = imageMetadata.height;
          
          // Calculer la taille de la police basée sur la taille du watermark (pourcentage)
          const fontSize = Math.max(12, Math.min(200, (width * (wm.size || 50)) / 100 / wm.text.length * 2));
          const color = wm.color || '#FFFFFF';
          const font = wm.font || 'Arial';
          const opacity = wm.opacity ? wm.opacity / 100 : 0.5;
          
          // Mapper les positions vers les valeurs gravity de Sharp
          const gravityMap = {
            'top-left': 'northwest',
            'top-center': 'north',
            'top-right': 'northeast',
            'center-left': 'west',
            'center': 'center',
            'center-right': 'east',
            'bottom-left': 'southwest',
            'bottom-center': 'south',
            'bottom-right': 'southeast'
          };
          
          const gravity = gravityMap[wm.position] || 'southeast';
          
          // Créer un SVG pour le texte avec structure améliorée
          const escapedText = wm.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
          
          const svgText = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
              <style>
                .watermark-text { 
                  fill: ${color}; 
                  font-size: ${fontSize}px; 
                  font-family: ${font}, sans-serif;
                  font-weight: bold;
                  opacity: ${opacity};
                }
              </style>
              <text 
                x="50%" 
                y="50%" 
                text-anchor="middle" 
                dominant-baseline="middle" 
                class="watermark-text">
                ${escapedText}
              </text>
            </svg>
          `;
          
          const watermarkInput = Buffer.from(svgText);
          
          composites.push({
            input: watermarkInput,
            gravity: gravity,
            blend: 'over'
          });
        } catch (wmError) {
          console.warn(`Erreur lors du traitement du filigrane texte: ${wmError.message}`);
        }
      }
      
      if (composites.length > 0) {
        pipeline = pipeline.composite(composites);
      }
    }
    
    // 6. FORMAT DE SORTIE & SAUVEGARDE
    let finalBuffer;
    if (isAvifRequested) {
      const pathWithoutExt = filePath.replace(/\.[^/.]+$/, '');
      finalPath = `${pathWithoutExt}.avif`;
      finalBuffer = await pipeline.avif({ quality: quality || 80, effort: 4 }).toBuffer();
    } else {
      const isPngFormat = targetFormat === 'png';
      const isWebPFormat = targetFormat === 'webp';
      const isJpegFormat = targetFormat === 'jpeg' || targetFormat === 'jpg';
      
      if (isPngFormat) {
        const { colors: calculatedColors, dither: calculatedDither } = getPngCompressionParams(quality);
        finalBuffer = await pipeline.png({
          palette: true,
          colors: calculatedColors,
          dither: calculatedDither,
          compressionLevel: 9,
          effort: 10
        }).toBuffer();
      } else if (isWebPFormat) {
        finalBuffer = await pipeline.webp({ quality: quality || 80 }).toBuffer();
      } else if (isJpegFormat) {
        finalBuffer = await pipeline.jpeg({ quality: quality || 80 }).toBuffer();
      } else {
        // Format non supporté - sauvegarde directe
        finalBuffer = inputPath && existsSync(inputPath) ? readFileSync(inputPath) : Buffer.from(bufferData);
      }
    }
    
    // Safety Check PNG : éviter d'augmenter la taille du fichier
    const isPngFormat = targetFormat === 'png';
    if (isPngFormat && originalFileSize > 0) {
      const optimizedSize = finalBuffer.length;
      if (optimizedSize > originalFileSize) {
        console.warn(`PNG optimisé plus lourd (+${((optimizedSize / originalFileSize - 1) * 100).toFixed(2)}%), utilisation du fichier original`);
        if (inputPath && existsSync(inputPath)) {
          finalBuffer = readFileSync(inputPath);
        }
      }
    }
    
    // Sauvegarde sur le disque
    writeFileSync(finalPath, finalBuffer);
    
    // Préserver la date de modification si demandé
    if (preserveModificationTime && inputPath && existsSync(inputPath)) {
      try {
        const originalStats = statSync(inputPath);
        utimesSync(finalPath, originalStats.atime, originalStats.mtime);
      } catch (utimesError) {
        console.warn(`Erreur préservation date modification: ${utimesError.message}`);
      }
    }
    
    const finalDiskSize = statSync(finalPath).size;
    
    return { 
      success: true, 
      path: finalPath, 
      finalSize: finalDiskSize,
      size: finalDiskSize
    };
  } catch (error) {
    console.error(`Erreur sauvegarde fichier: ${error.message}`);
    return { success: false, error: error.message };
  }
});

// Handler pour convertir une image en AVIF avec Sharp
ipcMain.handle('convert-to-avif', async (event, imageBuffer, quality = 80) => {
  try {
    // Convertir le Array en Buffer Node.js
    const nodeBuffer = Buffer.from(imageBuffer);
    
    // Conversion AVIF avec Sharp
    const avifBuffer = await sharp(nodeBuffer)
      .avif({ quality: quality, effort: 4 })
      .toBuffer();
    
    // Convertir le Buffer Node.js en Array pour le renvoyer au renderer
    return { success: true, buffer: Array.from(avifBuffer) };
  } catch (error) {
    console.error('[AVIF Backend] Erreur lors de la conversion AVIF:', error.message);
    return { success: false, error: error.message };
  }
});

// Handler pour traiter un batch d'images (compression + sauvegarde automatique)
ipcMain.handle('process-image-batch', async (event, images, config) => {
  const results = [];
  
  for (const image of images) {
    try {
      // Vérifier que le chemin source existe
      if (!image.path || !existsSync(image.path)) {
        throw new Error(`Fichier source introuvable: ${image.path || image.name}`);
      }

      // Générer le chemin de sortie dans le même dossier
      const sourceDir = path.dirname(image.path);
      const sourceName = path.basename(image.path, path.extname(image.path));
      const sourceExt = path.extname(image.path);
      
      // Déterminer l'extension de sortie
      let outputExt = sourceExt;
      if (config.format === 'AVIF') {
        outputExt = '.avif';
      } else if (config.format === 'WebP') {
        outputExt = '.webp';
      } else if (config.format === 'JPEG') {
        outputExt = '.jpg';
      } else if (config.format === 'PNG') {
        outputExt = '.png';
      }
      
      // Construire le nom de fichier avec suffixe
      const suffix = config.suffix || '_squeeze';
      const outputFilename = `${sourceName}${suffix}${outputExt}`;
      const outputPath = path.join(sourceDir, outputFilename);

      // Lire le fichier source
      const sourceBuffer = readFileSync(image.path);
      const originalSize = sourceBuffer.length;

      // Le traitement d'image se fait dans le renderer (canvas)
      // On attend que le renderer envoie le buffer compressé
      // Pour l'instant, on simule en copiant (sera remplacé par le vrai traitement)
      // Le renderer enverra le buffer compressé via saveFile

      results.push({
        id: image.id,
        success: true,
        originalSize: originalSize,
        outputPath: outputPath,
        outputFilename: outputFilename,
        message: 'En attente de traitement...'
      });
    } catch (error) {
      results.push({
        id: image.id,
        success: false,
        error: error.message || 'Erreur inconnue',
        originalSize: image.size || 0
      });
    }
  }
  
  return results;
});

// Handler pour obtenir les chemins des fichiers (uniquement pour l'import)
ipcMain.handle('get-file-paths', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'] }
      ]
    });
    
    if (result.canceled) {
      return { canceled: true, paths: [] };
    }
    
    return { canceled: false, paths: result.filePaths };
  } catch (error) {
    console.error('Erreur lors de la sélection de fichiers:', error);
    return { canceled: true, paths: [], error: error.message };
  }
});

// Handler pour ouvrir un dossier dans le Finder/Explorer
ipcMain.handle('open-folder', async (event, folderPath) => {
  try {
    if (!folderPath) {
      return { success: false, error: 'Chemin de dossier non fourni' };
    }
    // Si c'est un fichier, obtenir son dossier parent
    const folderToOpen = existsSync(folderPath) && !require('fs').statSync(folderPath).isDirectory()
      ? path.dirname(folderPath)
      : folderPath;
    
    if (!existsSync(folderToOpen)) {
      return { success: false, error: 'Dossier introuvable' };
    }
    
    await shell.openPath(folderToOpen);
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'ouverture du dossier:', error);
    return { success: false, error: error.message };
  }
});

// Handler pour obtenir la locale du système
ipcMain.handle('get-locale', async () => {
  return app.getLocale();
});

// Sélectionner un dossier personnalisé pour la sortie
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Output Folder'
  });
  return result;
});

// Handler pour vérifier une clé de licence Gumroad
ipcMain.handle('verify-license', async (event, licenseKey) => {
  try {
    if (!licenseKey || typeof licenseKey !== 'string' || licenseKey.trim() === '') {
      return { success: false, errorCode: 'LICENSE_KEY_EMPTY' };
    }

    // Utiliser net.request d'Electron (recommandé pour éviter les problèmes CORS)
    return new Promise((resolve) => {
      const request = net.request({
        method: 'POST',
        url: 'https://api.gumroad.com/v2/licenses/verify',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      let responseData = '';

      request.on('response', (response) => {
        response.on('data', (chunk) => {
          responseData += chunk.toString();
        });

        response.on('end', async () => {
          try {
            // Vérifier le statut HTTP avant de parser le JSON
            if (response.statusCode !== 200) {
              console.error('[License] Erreur HTTP:', response.statusCode);
              
              // Si c'est un 404, c'est probablement une licence invalide
              if (response.statusCode === 404) {
                resolve({ success: false, errorCode: 'LICENSE_INVALID' });
                return;
              }
              
              // Essayer de parser la réponse pour voir s'il y a un message explicite
              try {
                const errorData = JSON.parse(responseData);
                if (errorData.message && (
                    errorData.message.toLowerCase().includes('license does not exist') ||
                    errorData.message.toLowerCase().includes('that license does not exist')
                  )) {
                  resolve({ success: false, errorCode: 'LICENSE_INVALID' });
                  return;
                }
              } catch (e) {
                // Pas de JSON valide, continuer avec l'erreur de connexion
              }
              
              resolve({ 
                success: false, 
                errorCode: 'GUMROAD_CONNECTION_ERROR',
                errorData: { statusCode: response.statusCode }
              });
              return;
            }

            const data = JSON.parse(responseData);

            // Vérifier que la licence est valide
            if (data.success === true) {
              // Vérifier que la licence n'est pas remboursée ou annulée
              if (data.purchase && data.purchase.refunded === true) {
                resolve({ success: false, errorCode: 'LICENSE_REFUNDED' });
                return;
              }
              
              // Vérifier que la licence n'est pas annulée
              if (data.purchase && data.purchase.subscription_cancelled_at) {
                resolve({ success: false, errorCode: 'LICENSE_CANCELLED' });
                return;
              }

              // Licence valide : sauvegarder dans le store
              const licenseStore = await ensureStore();
              licenseStore.set('license', {
                isPro: true,
                key: licenseKey.trim()
              });

              resolve({ success: true });
            } else {
              // La clé est invalide ou le message indique que la licence n'existe pas
              const message = data.message || '';
              const messageLower = message.toLowerCase();
              
              // Vérifier si la limite d'activation est atteinte
              const isActivationLimitReached = messageLower.includes('activation limit') ||
                                              messageLower.includes('maximum activations') ||
                                              messageLower.includes('max activations') ||
                                              messageLower.includes('too many activations') ||
                                              messageLower.includes('activation count');
              
              if (isActivationLimitReached) {
                console.error('[License] ❌ Limite d\'activation atteinte pour cette licence');
                resolve({ success: false, errorCode: 'LICENSE_ACTIVATION_LIMIT_REACHED' });
                return;
              }
              
              resolve({ success: false, errorCode: 'LICENSE_INVALID' });
            }
          } catch (parseError) {
            console.error('[License] ❌ Erreur de parsing JSON:', parseError.message);
            console.error('[License] Réponse brute:', responseData);
            resolve({ 
              success: false, 
              errorCode: 'PARSE_ERROR',
              errorData: { message: parseError.message }
            });
          }
        });
      });

      request.on('error', (error) => {
        console.error('[License] ❌ Erreur réseau:', error.message);
        resolve({ 
          success: false, 
          errorCode: 'NETWORK_ERROR',
          errorData: { message: error.message }
        });
      });

      // Envoyer les paramètres en format form-urlencoded (requis par Gumroad)
      const params = new URLSearchParams({
        product_id: PRODUCT_ID,
        license_key: licenseKey.trim(),
        increment_uses_count: 'true'
      }).toString();
      
      request.write(params);
      request.end();
    });
  } catch (error) {
    console.error('[License] ❌ Erreur lors de la vérification:', error.message);
    return { 
      success: false, 
      errorCode: 'VERIFICATION_ERROR',
      errorData: { message: error.message }
    };
  }
});

// Handler pour obtenir le statut de la licence au démarrage
ipcMain.handle('get-license-status', async () => {
  try {
    const licenseStore = await ensureStore();
    const license = licenseStore.get('license', { isPro: false, key: null });
    return { 
      isPro: license.isPro || false,
      key: license.key || null
    };
  } catch (error) {
    console.error('[License] Erreur lors de la récupération du statut:', error.message);
    return { isPro: false, key: null };
  }
});

// Handler pour effacer la licence enregistrée
ipcMain.handle('clear-license', async () => {
  try {
    const licenseStore = await ensureStore();
    licenseStore.set('license', {
      isPro: false,
      key: null
    });
    return { success: true };
  } catch (error) {
    console.error('[License] Erreur lors de l\'effacement de la licence:', error.message);
    return { success: false, error: error.message };
  }
});

// Handler pour vérifier le quota de compression
ipcMain.handle('check-quota', async () => {
  try {
    const quotaStore = await ensureStore();
    const compressionCount = quotaStore.get('compressionCount', 0);
    const license = quotaStore.get('license', { isPro: false, key: null });
    const isPro = license.isPro || false;
    const limit = 30;
    const allowed = isPro || compressionCount < limit;
    
    return {
      allowed: allowed,
      count: compressionCount,
      limit: limit,
      isPro: isPro
    };
  } catch (error) {
    console.error('[Quota] Erreur lors de la vérification du quota:', error.message);
    // En cas d'erreur, autoriser quand même (fail-safe)
    return {
      allowed: true,
      count: 0,
      limit: 30,
      isPro: false
    };
  }
});

// Handler pour réinitialiser le quota de compression (utile pour les tests)
ipcMain.handle('reset-quota', async () => {
  try {
    const quotaStore = await ensureStore();
    quotaStore.set('compressionCount', 0);
    return { success: true, count: 0 };
  } catch (error) {
    console.error('[Quota] Erreur lors de la réinitialisation du quota:', error.message);
    return { success: false, error: error.message };
  }
});

// Handler pour incrémenter le quota de compression
ipcMain.handle('increment-quota', async () => {
  try {
    const quotaStore = await ensureStore();
    const license = quotaStore.get('license', { isPro: false, key: null });
    const isPro = license.isPro || false;
    const limit = 30;
    
    // Si l'utilisateur est PRO, pas besoin d'incrémenter le quota
    if (isPro) {
      return { success: true, count: 0, isPro: true };
    }
    
    // Pour les utilisateurs TRIAL, vérifier la limite et incrémenter
    const currentCount = quotaStore.get('compressionCount', 0);
    if (currentCount >= limit) {
      console.warn('[Quota] Quota atteint (TRIAL):', currentCount, '/', limit);
      return { success: false, error: 'Quota atteint', count: currentCount, limit: limit };
    }
    
    const newCount = currentCount + 1;
    quotaStore.set('compressionCount', newCount);
    return { success: true, count: newCount, limit: limit };
  } catch (error) {
    console.error('[Quota] Erreur lors de l\'incrémentation du quota:', error.message);
    return { success: false, error: error.message };
  }
});

