export const formatFileSize = (bytes, units) => {
  if (bytes === 0) return `0 ${units.B}`;
  const k = 1024;
  const sizes = [units.B, units.KB, units.MB, units.GB];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

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
      return null;
  }
};

export const getOptimalQuality = (format) => {
  switch (format) {
    case 'WebP':
      return 75;
    case 'JPEG':
      return 82;
    case 'AVIF':
      return 65;
    case 'PNG':
      return 80;
    case 'Original':
      return 80;
    default:
      return 80;
  }
};

export const getOutputPreview = (originalName, format, prefix = '', suffix = '_optimized') => {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  let ext;
  
  if (format === 'Original') {
    ext = originalName.split('.').pop();
    } else {
      const extensionMap = {
        'AVIF': 'avif',
        'avif': 'avif',
      'WebP': 'webp',
      'JPEG': 'jpg',
      'PNG': 'png',
      'SVG': 'svg'
    };
      ext = extensionMap[format] || format.toLowerCase();
    }
    
    const outputName = `${prefix}${nameWithoutExt}${suffix}.${ext}`;
  return outputName;
};

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

