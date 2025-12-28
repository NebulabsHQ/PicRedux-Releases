// External libraries
const { app, BrowserWindow, ipcMain, dialog, shell, net } = require('electron');
const path = require('path');
const { existsSync, writeFileSync, readFileSync, statSync, utimesSync, unlinkSync } = require('fs');
const sharp = require('sharp');

let mainWindow;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

const PRODUCT_ID = '2iuHpZLSnI_LmE1dnej9cg==';

// PNG compression shows inherent plateau→cliff behavior due to libvips entropy limits.
// We use a 3-phase model to improve perceived linearity and UX.
// Phase A (100-75%): Dither-dominant, colors fixed at 256 (max fidelity)
// Phase B (75-45%):  Coupled dither + color reduction (balanced compression)
// Phase C (<45%):    Palette collapse (aggressive compression)
// Entropy dampening: When dither < 0.15 or colors < 128, accelerate decay to reduce dead zones.

/**
 * Get PNG compression parameters based on quality level (0-100)
 * Returns { colors, dither, phase } optimized for perceived linearity
 * 
 * @param {number} quality - Compression quality (0-100, where 100 = max fidelity)
 * @returns {{colors: number, dither: number, phase: string}} PNG compression parameters
 */
function getPngCompressionParams(quality) {
  quality = Math.max(0, Math.min(100, quality));
  
  let colors, dither, phase;
  
  if (quality >= 75) {
    phase = 'A';
    colors = 256;
    const phaseRatio = (quality - 75) / 25;
    dither = 0.6 + (0.4 * Math.pow(phaseRatio, 0.7));
  } else if (quality >= 45) {
    phase = 'B';
    const phaseRatio = (quality - 45) / 30;
    colors = Math.floor(128 + (128 * phaseRatio));
    dither = 0.15 + (0.45 * Math.pow(1 - phaseRatio, 1.5));
  } else {
    phase = 'C';
    const phaseRatio = quality / 45;
    const colorRatio = Math.pow(phaseRatio, 0.8);
    colors = Math.max(2, Math.floor(2 + (126 * colorRatio)));
    dither = 0.15 * Math.pow(phaseRatio, 2);
  }
  
  colors = Math.round(colors);
  dither = Math.max(0, Math.min(1, Math.round(dither * 1000) / 1000));
  
  return { colors, dither, phase };
}

const KEY_PART_1 = 'Nebula';
const KEY_PART_2 = 'Tools';
const KEY_PART_3 = 'x84';
const ENCRYPTION_KEY = KEY_PART_1 + KEY_PART_2 + KEY_PART_3;

let store;
let storePromise = (async () => {
  const Store = (await import('electron-store')).default;
  
  try {
    store = new Store({
      encryptionKey: ENCRYPTION_KEY,
      defaults: {
        license: {
          isPro: false,
          key: null
        },
        compressionCount: 0
      }
    });
    
    try {
      store.get('compressionCount');
    } catch (readError) {
      throw readError;
    }
  } catch (error) {
    try {
      const userDataPath = app.getPath('userData');
      const configPath = path.join(userDataPath, 'config.json');
      
      if (existsSync(configPath)) {
        try {
          unlinkSync(configPath);
        } catch (unlinkError) {
          // Continue even if deletion fails, new store will overwrite
        }
      }
      
      store = new Store({
        encryptionKey: ENCRYPTION_KEY,
        defaults: {
          license: {
            isPro: false,
            key: null
          },
          compressionCount: 0
        }
      });
      
      store.get('compressionCount');
    } catch (migrationError) {
      try {
        store = new Store({
          name: 'config-backup',
          encryptionKey: ENCRYPTION_KEY,
          defaults: {
            license: {
              isPro: false,
              key: null
            },
            compressionCount: 0
          }
        });
      } catch (fallbackError) {
        throw fallbackError;
      }
    }
  }
  
  return store;
})();

async function ensureStore() {
  if (!store) {
    await storePromise;
  }
  return store;
}

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.cjs');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#09090b',
    titleBarStyle: 'hiddenInset',
    frame: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      webSecurity: true,
      sandbox: false,
    },
    show: false,
  });

  mainWindow.webContents.on('preload-error', (event, preloadPath, error) => {
    // Preload error handling
  });

  mainWindow.webContents.on('dom-ready', () => {
    setTimeout(() => {
      mainWindow.webContents.executeJavaScript(`
        (function() {
          const hasAPI = typeof window.electronAPI !== 'undefined';
          return hasAPI;
        })();
      `).catch(() => {});
    }, 500);
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    if (existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    }
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('did-fail-load', () => {
    // Error handling
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('uncaughtException', () => {
  // Error handling
});

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
  
  let pipeline;
  if (inputPath && existsSync(inputPath)) {
    pipeline = sharp(inputPath, { failOn: 'none' });
  } else {
    const inputBuffer = Buffer.isBuffer(bufferData) ? bufferData : Buffer.from(bufferData);
    if (!inputBuffer || inputBuffer.length === 0) {
      throw new Error('Buffer d\'entrée vide ou invalide');
    }
    pipeline = sharp(inputBuffer, { failOn: 'none' });
  }
  
  let originalFileSize = null;
  try {
    if (inputPath && existsSync(inputPath)) {
      try {
        originalFileSize = statSync(inputPath).size;
      } catch (statError) {
        // Continue with buffer size
      }
    }
    
    if (originalFileSize === null && bufferData) {
      const inputBuffer = Buffer.isBuffer(bufferData) ? bufferData : Buffer.from(bufferData);
      originalFileSize = inputBuffer.length;
    }
    
    if (!originalFileSize || originalFileSize < 0) {
      originalFileSize = 0;
    }
    
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
    
    const shouldKeep = String(keepMetadata) === 'true' || keepMetadata === true || keepMetadata === 1;
    if (shouldKeep) {
      pipeline = pipeline.withMetadata();
    }
    
    if (options.resize) {
      const { width, height, mode, value } = options.resize;
      if (mode === 'percentage' && value) {
        const metadata = await pipeline.metadata();
        const newWidth = Math.round(metadata.width * (value / 100));
        const newHeight = Math.round(metadata.height * (value / 100));
        pipeline = pipeline.resize(newWidth, newHeight, { fit: 'fill' });
      } else if (mode === 'dimensions') {
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
    
    if (options.fillColor) {
      const hex = options.fillColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      pipeline = pipeline.flatten({ background: { r, g, b, alpha: 1 } });
    }
    
    if (options.watermark && options.watermark.enabled) {
      const wm = options.watermark;
      const composites = [];
      
      if (wm.type === 'image' && wm.image) {
        try {
          const watermarkBuffer = Buffer.isBuffer(wm.image) ? wm.image : Buffer.from(wm.image);
          const watermarkSharp = sharp(watermarkBuffer);
          const wmMetadata = await watermarkSharp.metadata();
          const imageMetadata = await pipeline.metadata();
          
          const wmSize = wm.size || 50;
          const wmWidth = Math.round((imageMetadata.width * wmSize) / 100);
          const wmHeight = Math.round((wmMetadata.height * wmWidth) / wmMetadata.width);
          
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
          
          let watermarkToResize = watermarkSharp;
          const resizedWatermark = await watermarkToResize
            .resize(wmWidth, wmHeight, { fit: 'inside' })
            .toBuffer();
          
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
          // Watermark processing error
        }
      } else if (wm.type === 'text' && wm.text) {
        try {
          const imageMetadata = await pipeline.metadata();
          const width = imageMetadata.width;
          const height = imageMetadata.height;
          
          const fontSize = Math.max(12, Math.min(200, (width * (wm.size || 50)) / 100 / wm.text.length * 2));
          const color = wm.color || '#FFFFFF';
          const font = wm.font || 'Arial';
          const opacity = wm.opacity ? wm.opacity / 100 : 0.5;
          
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
          // Watermark processing error
        }
      }
      
      if (composites.length > 0) {
        pipeline = pipeline.composite(composites);
      }
    }
    
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
        finalBuffer = inputPath && existsSync(inputPath) ? readFileSync(inputPath) : Buffer.from(bufferData);
      }
    }
    
    const isPngFormat = targetFormat === 'png';
    if (isPngFormat && originalFileSize > 0) {
      const optimizedSize = finalBuffer.length;
      if (optimizedSize > originalFileSize) {
        if (inputPath && existsSync(inputPath)) {
          finalBuffer = readFileSync(inputPath);
        }
      }
    }
    
    writeFileSync(finalPath, finalBuffer);
    
    if (preserveModificationTime && inputPath && existsSync(inputPath)) {
      try {
        const originalStats = statSync(inputPath);
        utimesSync(finalPath, originalStats.atime, originalStats.mtime);
      } catch (utimesError) {
        // Continue if time preservation fails
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
    return { success: false, error: error.message };
  }
});

ipcMain.handle('convert-to-avif', async (event, imageBuffer, quality = 80) => {
  try {
    const nodeBuffer = Buffer.from(imageBuffer);
    const avifBuffer = await sharp(nodeBuffer)
      .avif({ quality: quality, effort: 4 })
      .toBuffer();
    
    return { success: true, buffer: Array.from(avifBuffer) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('process-image-batch', async (event, images, config) => {
  const results = [];
  
  for (const image of images) {
    try {
      if (!image.path || !existsSync(image.path)) {
        throw new Error(`Fichier source introuvable: ${image.path || image.name}`);
      }

      const sourceDir = path.dirname(image.path);
      const sourceName = path.basename(image.path, path.extname(image.path));
      const sourceExt = path.extname(image.path);
      
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
      
      const suffix = config.suffix || '_squeeze';
      const outputFilename = `${sourceName}${suffix}${outputExt}`;
      const outputPath = path.join(sourceDir, outputFilename);

      const sourceBuffer = readFileSync(image.path);
      const originalSize = sourceBuffer.length;

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
    return { canceled: true, paths: [], error: error.message };
  }
});

ipcMain.handle('open-folder', async (event, folderPath) => {
  try {
    if (!folderPath) {
      return { success: false, error: 'Chemin de dossier non fourni' };
    }
    const folderToOpen = existsSync(folderPath) && !require('fs').statSync(folderPath).isDirectory()
      ? path.dirname(folderPath)
      : folderPath;
    
    if (!existsSync(folderToOpen)) {
      return { success: false, error: 'Dossier introuvable' };
    }
    
    await shell.openPath(folderToOpen);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-locale', async () => {
  return app.getLocale();
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Output Folder'
  });
  return result;
});

ipcMain.handle('verify-license', async (event, licenseKey) => {
  try {
    if (!licenseKey || typeof licenseKey !== 'string' || licenseKey.trim() === '') {
      return { success: false, errorCode: 'LICENSE_KEY_EMPTY' };
    }

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
            if (response.statusCode !== 200) {
              if (response.statusCode === 404) {
                resolve({ success: false, errorCode: 'LICENSE_INVALID' });
                return;
              }
              
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
                // Invalid JSON, continue with connection error
              }
              
              resolve({ 
                success: false, 
                errorCode: 'GUMROAD_CONNECTION_ERROR',
                errorData: { statusCode: response.statusCode }
              });
              return;
            }

            const data = JSON.parse(responseData);

            if (data.success === true) {
              if (data.purchase && data.purchase.refunded === true) {
                resolve({ success: false, errorCode: 'LICENSE_REFUNDED' });
                return;
              }
              
              if (data.purchase && data.purchase.subscription_cancelled_at) {
                resolve({ success: false, errorCode: 'LICENSE_CANCELLED' });
                return;
              }

              const licenseStore = await ensureStore();
              licenseStore.set('license', {
                isPro: true,
                key: licenseKey.trim()
              });

              resolve({ success: true });
            } else {
              const message = data.message || '';
              const messageLower = message.toLowerCase();
              
              const isActivationLimitReached = messageLower.includes('activation limit') ||
                                              messageLower.includes('maximum activations') ||
                                              messageLower.includes('max activations') ||
                                              messageLower.includes('too many activations') ||
                                              messageLower.includes('activation count');
              
              if (isActivationLimitReached) {
                resolve({ success: false, errorCode: 'LICENSE_ACTIVATION_LIMIT_REACHED' });
                return;
              }
              
              resolve({ success: false, errorCode: 'LICENSE_INVALID' });
            }
          } catch (parseError) {
            resolve({ 
              success: false, 
              errorCode: 'PARSE_ERROR',
              errorData: { message: parseError.message }
            });
          }
        });
      });

      request.on('error', (error) => {
        resolve({ 
          success: false, 
          errorCode: 'NETWORK_ERROR',
          errorData: { message: error.message }
        });
      });

      const params = new URLSearchParams({
        product_id: PRODUCT_ID,
        license_key: licenseKey.trim(),
        increment_uses_count: 'true'
      }).toString();
      
      request.write(params);
      request.end();
    });
  } catch (error) {
    return { 
      success: false, 
      errorCode: 'VERIFICATION_ERROR',
      errorData: { message: error.message }
    };
  }
});

ipcMain.handle('get-license-status', async () => {
  try {
    const licenseStore = await ensureStore();
    const license = licenseStore.get('license', { isPro: false, key: null });
    return { 
      isPro: license.isPro || false,
      key: license.key || null
    };
  } catch (error) {
    return { isPro: false, key: null };
  }
});

ipcMain.handle('clear-license', async () => {
  try {
    const licenseStore = await ensureStore();
    licenseStore.set('license', {
      isPro: false,
      key: null
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

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
    return {
      allowed: true,
      count: 0,
      limit: 30,
      isPro: false
    };
  }
});

ipcMain.handle('reset-quota', async () => {
  try {
    const quotaStore = await ensureStore();
    quotaStore.set('compressionCount', 0);
    return { success: true, count: 0 };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('increment-quota', async () => {
  try {
    const quotaStore = await ensureStore();
    const license = quotaStore.get('license', { isPro: false, key: null });
    const isPro = license.isPro || false;
    const limit = 30;
    
    if (isPro) {
      return { success: true, count: 0, isPro: true };
    }
    
    const currentCount = quotaStore.get('compressionCount', 0);
    if (currentCount >= limit) {
      return { success: false, error: 'Quota atteint', count: currentCount, limit: limit };
    }
    
    const newCount = currentCount + 1;
    quotaStore.set('compressionCount', newCount);
    return { success: true, count: newCount, limit: limit };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
