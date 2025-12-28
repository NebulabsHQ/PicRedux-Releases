/**
 * Utility functions for formatting data
 */

/**
 * Format file size in bytes to human-readable string
 * @param {number} bytes - File size in bytes
 * @param {Object} units - Translation object with B, KB, MB, GB keys
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, units) => {
  if (bytes === 0) return `0 ${units.B}`;
  const k = 1024;
  const sizes = [units.B, units.KB, units.MB, units.GB];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get MIME type from format name
 * @param {string} format - Format name (AVIF, WebP, JPEG, PNG, SVG, Original)
 * @returns {string|null} MIME type or null for Original
 */
export const getMimeType = (format) => {
  switch (format) {
    case 'AVIF':
      return 'image/avif';
    case 'WebP':
      return 'image/webp';
    case 'JPEG':
      return 'image/jpeg';
    case 'PNG':
      return 'image/png';
    case 'SVG':
      return 'image/svg+xml';
    default:
      return null; // Original - keep original format
  }
};

/**
 * Get optimal quality value based on format
 * @param {string} format - Format name
 * @returns {number} Optimal quality value (0-100)
 */
export const getOptimalQuality = (format) => {
  switch (format) {
    case 'WebP':
      return 75; // Ideal weight/quality ratio
    case 'JPEG':
      return 82;
    case 'AVIF':
      return 65;
    case 'PNG':
      return 80; // Efficient compression without visible loss
    case 'Original':
      return 80; // Default value for Original
    default:
      return 80;
  }
};

/**
 * Generate output filename preview
 * @param {string} originalName - Original filename
 * @param {string} format - Output format (AVIF, WebP, JPEG, PNG, SVG, Original)
 * @param {string} prefix - Prefix to add to filename
 * @param {string} suffix - Suffix to add to filename
 * @returns {string} Preview of output filename
 */
export const getOutputPreview = (originalName, format, prefix = '', suffix = '_optimized') => {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  let ext;
  
  if (format === 'Original') {
    ext = originalName.split('.').pop();
  } else {
    // Map formats to correct extensions
    const extensionMap = {
      'AVIF': 'avif',
      'avif': 'avif', // Support lowercase too
      'WebP': 'webp',
      'JPEG': 'jpg',
      'PNG': 'png',
      'SVG': 'svg'
    };
    ext = extensionMap[format] || format.toLowerCase();
  }
  
  // Add prefix and suffix
  const outputName = `${prefix}${nameWithoutExt}${suffix}.${ext}`;
  return outputName;
};

/**
 * Get file extension from format
 * @param {string} format - Format name
 * @param {string} originalName - Original filename (used for Original format)
 * @returns {string} File extension
 */
export const getFileExtension = (format, originalName = '') => {
  if (format === 'Original') {
    return originalName.split('.').pop() || 'jpg';
  }
  
  const extensionMap = {
    'AVIF': 'avif',
    'avif': 'avif',
    'WebP': 'webp',
    'JPEG': 'jpg',
    'PNG': 'png',
    'SVG': 'svg'
  };
  
  return extensionMap[format] || format.toLowerCase();
};

