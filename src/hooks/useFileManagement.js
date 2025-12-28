import { useMemo } from 'react';

export const useFileManagement = (files, activeFilter, sortBy) => {
  const isDuplicateFile = (newFile, newFilePath, existingFiles) => {
    if (newFilePath) {
      const normalizedNewPath = newFilePath.replace(/\\/g, '/');
      const isPathDuplicate = existingFiles.some(existing => {
        if (existing.path) {
          const normalizedExistingPath = existing.path.replace(/\\/g, '/');
          return normalizedExistingPath === normalizedNewPath;
        }
        return false;
      });
      if (isPathDuplicate) {
        return true;
      }
    }
    
    const isNameSizeDuplicate = existingFiles.some(existing => 
      existing.name === newFile.name && existing.size === newFile.size
    );
    
    return isNameSizeDuplicate;
  };

  const filteredFiles = useMemo(() => {
    let filtered;
    
    switch (activeFilter) {
      case 'optimized':
        filtered = files.filter(f => f.compressed && f.status === 'done');
        break;
      case 'pending':
        filtered = files.filter(f => f.status === 'pending' || f.status === 'processing');
        break;
      case 'errors':
        filtered = files.filter(f => f.status === 'error');
        break;
      default:
        filtered = files;
    }
    
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'gain':
          const gainA = a.compressionRatio || 0;
          const gainB = b.compressionRatio || 0;
          return gainB - gainA;
        case 'size':
          const sizeA = a.compressedSize || a.size;
          const sizeB = b.compressedSize || b.size;
          return sizeA - sizeB;
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [files, activeFilter, sortBy]);

  const filterStats = useMemo(() => ({
    all: files.length,
    optimized: files.filter(f => f.compressed && f.status === 'done').length,
    pending: files.filter(f => f.status === 'pending' || f.status === 'processing').length,
    errors: files.filter(f => f.status === 'error').length,
  }), [files]);

  return {
    isDuplicateFile,
    filteredFiles,
    filterStats,
  };
};

