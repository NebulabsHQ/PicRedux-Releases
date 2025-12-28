import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Aperture, 
  Home, 
  Image as ImageIcon, 
  Settings, 
  Download,
  Upload,
  UploadCloud,
  Zap,
  Info,
  X,
  ChevronDown,
  FileText,
  Maximize2,
  Play,
  Eye,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  ImagePlus,
  HelpCircle,
  PartyPopper,
  FolderOpen,
  LayoutGrid,
  List,
  RefreshCw,
  ArrowLeft,
  Languages,
  Lock,
  Crown,
  Check
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLanguage } from './useLanguage';
import { supportedLanguages } from './translations';
import logoApp from './assets/icon-512.png';

// Utility function to merge Tailwind classes
const cn = (...inputs) => twMerge(clsx(inputs));

// ============================================
// COMPOSANTS UI RÉUTILISABLES
// ============================================

/**
 * Tooltip - Composant tooltip avec Portal pour éviter les problèmes d'overflow
 */
const Tooltip = ({ children, content, position = 'right' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const updateTooltipPosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 8; // Marge de sécurité

    let top = 0;
    let left = 0;
    let transform = '';
    let finalPosition = position;

    // Calculer la position initiale selon la position demandée
    switch (position) {
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2);
        left = triggerRect.right + padding;
        transform = 'translateY(-50%)';
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2);
        left = triggerRect.left - padding;
        transform = 'translate(-100%, -50%)';
        break;
      case 'top':
        top = triggerRect.top - padding;
        left = triggerRect.left + (triggerRect.width / 2);
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        top = triggerRect.bottom + padding;
        left = triggerRect.left + (triggerRect.width / 2);
        transform = 'translate(-50%, 0)';
        break;
      default:
        top = triggerRect.top + (triggerRect.height / 2);
        left = triggerRect.right + padding;
        transform = 'translateY(-50%)';
    }

    // Calculer les dimensions réelles du tooltip après transformation
    let tooltipWidth = tooltipRect.width;
    let tooltipHeight = tooltipRect.height;

    // Vérifier et corriger les débordements horizontaux
    if (finalPosition === 'right' || finalPosition === 'left') {
      let tooltipLeft, tooltipRight;
      
      if (finalPosition === 'right') {
        tooltipLeft = left;
        tooltipRight = left + tooltipWidth;
      } else {
        tooltipRight = left;
        tooltipLeft = left - tooltipWidth;
      }

      // Si le tooltip dépasse à droite, le placer à gauche
      if (tooltipRight > viewportWidth - padding) {
        finalPosition = 'left';
        left = triggerRect.left - padding;
        transform = 'translate(-100%, -50%)';
        tooltipLeft = left - tooltipWidth;
        tooltipRight = left;
      }
      // Si le tooltip dépasse à gauche, le placer à droite
      else if (tooltipLeft < padding) {
        finalPosition = 'right';
        left = triggerRect.right + padding;
        transform = 'translateY(-50%)';
        tooltipLeft = left;
        tooltipRight = left + tooltipWidth;
      }

      // Ajustement fin pour éviter les débordements même après changement de côté
      if (finalPosition === 'right' && tooltipRight > viewportWidth - padding) {
        left = viewportWidth - tooltipWidth - padding;
      } else if (finalPosition === 'left' && tooltipLeft < padding) {
        left = tooltipWidth + padding;
      }
    } else {
      // Pour top/bottom, centrer horizontalement mais s'assurer qu'il ne dépasse pas
      const centeredLeft = triggerRect.left + (triggerRect.width / 2);
      const halfWidth = tooltipWidth / 2;
      
      if (centeredLeft - halfWidth < padding) {
        left = padding + halfWidth;
      } else if (centeredLeft + halfWidth > viewportWidth - padding) {
        left = viewportWidth - padding - halfWidth;
      } else {
        left = centeredLeft;
      }
    }

    // Vérifier et corriger les débordements verticaux
    if (finalPosition === 'top' || finalPosition === 'bottom') {
      let tooltipTop, tooltipBottom;
      
      if (finalPosition === 'top') {
        tooltipBottom = top;
        tooltipTop = top - tooltipHeight;
      } else {
        tooltipTop = top;
        tooltipBottom = top + tooltipHeight;
      }

      // Si le tooltip dépasse en bas, le placer en haut
      if (tooltipBottom > viewportHeight - padding) {
        finalPosition = 'top';
        top = triggerRect.top - padding;
        transform = 'translate(-50%, -100%)';
        tooltipBottom = top;
        tooltipTop = top - tooltipHeight;
      }
      // Si le tooltip dépasse en haut, le placer en bas
      else if (tooltipTop < padding) {
        finalPosition = 'bottom';
        top = triggerRect.bottom + padding;
        transform = 'translate(-50%, 0)';
        tooltipTop = top;
        tooltipBottom = top + tooltipHeight;
      }

      // Ajustement fin pour éviter les débordements même après changement de côté
      if (finalPosition === 'top' && tooltipTop < padding) {
        top = tooltipHeight + padding;
      } else if (finalPosition === 'bottom' && tooltipBottom > viewportHeight - padding) {
        top = viewportHeight - tooltipHeight - padding;
      }
    } else {
      // Pour left/right, centrer verticalement mais s'assurer qu'il ne dépasse pas
      const centeredTop = triggerRect.top + (triggerRect.height / 2);
      const halfHeight = tooltipHeight / 2;
      
      if (centeredTop - halfHeight < padding) {
        top = padding + halfHeight;
      } else if (centeredTop + halfHeight > viewportHeight - padding) {
        top = viewportHeight - padding - halfHeight;
      } else {
        top = centeredTop;
      }
    }

    setTooltipStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      transform,
      zIndex: 99999,
    });
  };

  useEffect(() => {
    if (isVisible) {
      // Délai pour permettre au tooltip de se rendre d'abord
      const timeoutId = setTimeout(() => {
        updateTooltipPosition();
        // Ajustement supplémentaire après le rendu pour corriger les débordements
        requestAnimationFrame(() => {
          updateTooltipPosition();
        });
      }, 10);
      
      const handleScroll = () => updateTooltipPosition();
      const handleResize = () => updateTooltipPosition();
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, position]);

  if (!content) return children;

  const tooltipElement = isVisible && createPortal(
    <div
      ref={tooltipRef}
      style={tooltipStyle}
      className="px-2 py-1 bg-zinc-800 text-zinc-200 text-xs rounded whitespace-nowrap pointer-events-none border border-zinc-700 shadow-lg"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {content}
    </div>,
    document.body
  );

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => {
          setIsVisible(true);
          setTimeout(updateTooltipPosition, 0);
        }}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {tooltipElement}
    </>
  );
};

/**
 * IconButton - Bouton avec icône et tooltip optionnel
 */
const IconButton = ({ 
  icon: Icon, 
  label, 
  onClick, 
  isActive = false,
  tooltip,
  className 
}) => {
  return (
    <Tooltip content={tooltip} position="right">
      <button
        onClick={onClick}
        className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center",
          "transition-all duration-200",
          "hover:bg-zinc-800 active:scale-95",
          isActive 
            ? "bg-violet-600/20 text-violet-400 border border-violet-600/30" 
            : "text-zinc-400 hover:text-zinc-200",
          className
        )}
        aria-label={label}
      >
        <Icon size={20} />
      </button>
    </Tooltip>
  );
};

/**
 * SectionTitle - Titre de section en uppercase
 */
const SectionTitle = ({ children, className }) => {
  return (
    <h3 className={cn(
      "text-xs font-semibold uppercase tracking-wider",
      "text-zinc-500 mb-3",
      className
    )}>
      {children}
    </h3>
  );
};

/**
 * Badge - Badge stylisé
 */
const Badge = ({ children, variant = "default", className }) => {
  const variants = {
    default: "bg-zinc-800 text-zinc-300 border-zinc-700",
    primary: "bg-violet-600/20 text-violet-400 border-violet-600/30",
    success: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
    warning: "bg-amber-600/20 text-amber-400 border-amber-600/30",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
      "border",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};

/**
 * Accordion - Section pliable avec tooltip
 */
const Accordion = ({ title, icon: Icon, children, defaultOpen = true, tooltip }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-zinc-800/50 hover:bg-zinc-800 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-zinc-400" />}
          <span className="text-sm font-medium text-zinc-200">{title}</span>
          {tooltip && (
            <Tooltip content={tooltip} position="top">
              <HelpCircle size={14} className="text-zinc-500 hover:text-zinc-400 transition-colors" />
            </Tooltip>
          )}
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "text-zinc-400 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="p-4 bg-zinc-900/50">
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * SuccessModal - Modale de bilan après optimisation réussie
 */
const SuccessModal = ({ isOpen, onClose, stats, onNewSession, destinationFolder, t }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return `0 ${t.units.B}`;
    const k = 1024;
    const sizes = [t.units.B, t.units.KB, t.units.MB, t.units.GB];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleOpenFolder = async () => {
    if (!destinationFolder || !window.electronAPI) {
      return;
    }
    try {
      await window.electronAPI.openFolder(destinationFolder);
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du dossier:', error);
    }
    onClose();
  };
  
  const isFolderButtonDisabled = !destinationFolder || !window.electronAPI;

  const handleNewSession = () => {
    // Ne pas supprimer les images, juste fermer la modale
    // Les images optimisées restent disponibles dans l'onglet "Optimisés"
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Header avec icône */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
            <PartyPopper className="text-purple-400" size={24} />
          </div>
          <h2 className="text-base font-semibold text-zinc-200">{t.messages.optimizationSuccess}</h2>
          <button
            onClick={onClose}
            className="ml-auto text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Zone de Stats - Big Number Design */}
        <div className="bg-zinc-800/50 rounded-md p-4 my-4">
          <div className="space-y-2">
            <div className="text-xs text-zinc-400 uppercase tracking-wide">{t.messages.gainTotal}</div>
            <div className="text-2xl font-bold text-emerald-400">
              {formatFileSize(stats.savedSize)}
            </div>
            <div className="text-sm text-zinc-500">
              {stats.successCount} {stats.successCount === 1 ? t.messages.imageOptimized : t.messages.imagesOptimized}
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col gap-2">
          {!isFolderButtonDisabled && (
            <button
              onClick={handleOpenFolder}
              className="w-full h-9 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors flex items-center justify-center gap-2"
            >
              <FolderOpen size={16} />
              {t.main.openFolder}
            </button>
          )}
          <button
            onClick={handleNewSession}
            className="w-full h-9 px-4 bg-transparent border border-zinc-700 hover:bg-zinc-800/50 hover:text-white text-zinc-300 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            {t.main.newSession}
          </button>
        </div>
      </div>

      {/* Styles pour les animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

/**
 * QuotaWidget - Widget élégant pour afficher le quota de compression
 */
const QuotaWidget = ({ quotaUsed, quotaLimit, onUpgrade, t }) => {
  const percentage = Math.min((quotaUsed / quotaLimit) * 100, 100);
  const isLimitReached = quotaUsed >= quotaLimit;
  const isNearLimit = quotaUsed >= quotaLimit * 0.8; // 80% ou plus

  return (
    <div className="mt-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
      {/* Titre */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-zinc-400">{t.sidebar.freeTrial}</span>
        <span className={cn(
          "text-xs font-bold tabular-nums",
          isLimitReached ? "text-red-400" : isNearLimit ? "text-amber-400" : "text-zinc-300"
        )}>
          {quotaUsed}/{quotaLimit}
        </span>
      </div>

      {/* Barre de progression */}
      <div className="relative w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            isLimitReached 
              ? "bg-gradient-to-r from-red-600 to-red-500" 
              : isNearLimit
              ? "bg-gradient-to-r from-amber-600 to-amber-500"
              : "bg-gradient-to-r from-violet-600 to-violet-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Message d'avertissement ou bouton d'upgrade */}
      {isLimitReached ? (
        <p className="text-[10px] text-red-400 font-medium text-center">
          {t.sidebar.limitReachedActivateLicense}
        </p>
      ) : isNearLimit ? (
        <button
          onClick={onUpgrade}
          className="w-full mt-1 px-2 py-1.5 text-[10px] font-medium text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-md transition-colors flex items-center justify-center gap-1.5"
        >
          <Zap className="w-3 h-3" />
          {t.sidebar.unlockUnlimited}
        </button>
      ) : null}
    </div>
  );
};

/**
 * QuotaLimitModal - Modale affichée quand la limite de quota est atteinte
 */
const QuotaLimitModal = ({ isOpen, onClose, onUpgrade, stats, t }) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Header avec icône */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-600/20 flex items-center justify-center">
            <Lock className="text-amber-400" size={24} />
          </div>
          <h2 className="text-xl font-semibold text-zinc-200">{t.sidebar.trialLimitReached}</h2>
          <button
            onClick={onClose}
            className="ml-auto text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Message d'information */}
        <div className="py-2">
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t.sidebar.trialLimitReachedMessage.replace('{limit}', stats.quotaLimit)}
          </p>
        </div>

        {/* Statistiques */}
        <div className="space-y-3 py-2 bg-zinc-800/50 rounded-lg px-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">{t.sidebar.optimizedImages}</span>
            <span className="text-lg font-semibold text-emerald-400">{stats.successCount}</span>
          </div>
          {stats.remainingCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">{t.sidebar.unprocessedImages}</span>
              <span className="text-lg font-semibold text-amber-400">{stats.remainingCount}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">{t.sidebar.quotaUsed}</span>
            <span className="text-lg font-semibold text-red-400">{stats.quotaUsed}/{stats.quotaLimit}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800"></div>

        {/* Boutons d'action */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onUpgrade}
            className="w-full px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Zap size={18} />
            {t.sidebar.activateLicenseUnlimited}
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-medium transition-colors"
          >
            {t.sidebar.close}
          </button>
        </div>
      </div>

      {/* Styles pour les animations (réutilisés de SuccessModal) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

/**
 * FileListItem - Ligne de fichier pour le mode liste
 */
const FileListItem = ({ file, onRemove, onReveal, t, compressedThumbnail }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return `0 ${t.units.B}`;
    const k = 1024;
    const sizes = [t.units.B, t.units.KB, t.units.MB, t.units.GB];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const originalSize = file.size;
  const compressedSize = file.compressedSize || file.size;
  const gain = file.compressionRatio || 0;

  const handleDelete = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(file.id);
    }, 100);
  };

  return (
    <div 
      className={cn(
        "group flex items-center gap-4 px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-all",
        isRemoving && "opacity-0"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transition: isRemoving ? 'opacity 0.1s ease-out' : undefined
      }}
    >
      {/* Thumbnail carré 40x40px */}
      <div className="relative w-10 h-10 rounded image-preview border border-zinc-800 overflow-hidden flex-shrink-0">
        {file.previewUrl && (
          <>
            {/* Image compressée (par défaut) */}
            <img
              src={compressedThumbnail || file.previewUrl}
              alt={file.name}
              className={cn(
                "object-cover w-full h-full transition-opacity duration-200",
                isHovered ? "opacity-0" : "opacity-100"
              )}
            />
            {/* Image originale (au survol) */}
            <img
              src={file.previewUrl}
              alt={file.name}
              className={cn(
                "absolute inset-0 object-cover w-full h-full transition-opacity duration-200",
                isHovered ? "opacity-100" : "opacity-0"
              )}
            />
          </>
        )}
      </div>

      {/* Nom du fichier - Plus de place */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200 truncate">
          {file.name}
        </p>
      </div>

      {/* Badge de statut */}
      {file.compressed ? (
        <Badge variant="success">
          <CheckCircle2 size={12} className="mr-1" />
          {t.main.optimized}
        </Badge>
      ) : (
        <Badge variant="default">
          <AlertCircle size={12} className="mr-1" />
          {t.main.pending}
        </Badge>
      )}

      {/* Comparaison de poids */}
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <span className="font-mono">{formatFileSize(originalSize)}</span>
        <span className="text-zinc-600">→</span>
        <span className="font-mono text-emerald-400 font-semibold">{formatFileSize(compressedSize)}</span>
      </div>

      {/* Pourcentage de gain - Badge vert à droite */}
      {file.compressed && gain > 0 && (
        <Badge variant="success" className="font-bold">
          -{gain}%
        </Badge>
      )}

      {/* Bouton de suppression - Visible à la fin */}
      <Tooltip content="Supprimer de la liste" position="left">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            "transition-all duration-200",
            "text-zinc-400 hover:text-red-400 hover:bg-red-500/10",
            "opacity-0 group-hover:opacity-100"
          )}
          aria-label="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </Tooltip>
    </div>
  );
};

/**
 * FileCard - Carte de fichier détaillée (nouveau design)
 */
const FileCard = ({ file, onRemove, onReveal, t, compressedThumbnail }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return `0 ${t.units.B}`;
    const k = 1024;
    const sizes = [t.units.B, t.units.KB, t.units.MB, t.units.GB];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const originalSize = file.size;
  const compressedSize = file.compressedSize || file.size;
  const gain = file.compressionRatio || 0;

  const handleDelete = () => {
    setIsRemoving(true);
    // Animation rapide de sortie (100ms) avant suppression
    setTimeout(() => {
      onRemove(file.id);
    }, 100);
  };

  return (
    <div 
      className={cn(
        "bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-all",
        isRemoving && "opacity-0 scale-95"
      )}
      style={{
        transition: isRemoving ? 'opacity 0.1s ease-out, transform 0.1s ease-out' : undefined
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Aperçu de l'image */}
      <div className="relative aspect-[4/3] image-preview overflow-hidden">
        {file.previewUrl && (
          <>
            {/* Image compressée (par défaut) */}
            <img
              src={compressedThumbnail || file.previewUrl}
              alt={file.name}
              className={cn(
                "object-cover w-full h-full transition-opacity duration-200",
                isHovered ? "opacity-0" : "opacity-100"
              )}
            />
            {/* Image originale (au survol) */}
            <img
              src={file.previewUrl}
              alt={file.name}
              className={cn(
                "absolute inset-0 object-cover w-full h-full transition-opacity duration-200",
                isHovered ? "opacity-100" : "opacity-0"
              )}
            />
            {/* Badge "Original" au survol */}
            {isHovered && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-zinc-300 text-xs font-medium border border-zinc-700/50 z-10">
                {t.sidebar.original}
              </div>
            )}
          </>
        )}
        
        {/* Badge "Optimisé" en haut à gauche - Plus sombre */}
        {file.compressed && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-emerald-400 text-xs font-medium border border-zinc-800/50 z-10">
            <Eye size={12} />
            {t.main.optimized}
          </div>
        )}

        {/* Badge de gain en haut à droite - Vert émeraude profond avec texte blanc */}
        {file.compressed && gain > 0 && !isHovered && (
          <div className="absolute top-2 right-2 px-2.5 py-1 bg-emerald-700 text-white text-xs font-bold rounded border border-emerald-600/50 shadow-lg z-20">
            -{gain}%
          </div>
        )}

        {/* Boutons d'action - Visible uniquement au survol, positionnés en bas */}
        <div className={cn(
          "absolute bottom-2 right-2 flex items-center gap-2 transition-all duration-200 z-30",
          isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90",
          isHovered ? "" : "pointer-events-none"
        )}>
          {/* Bouton Révéler - Visible uniquement si le fichier est optimisé */}
          {file.compressed && file.savedPath && onReveal && (
            <Tooltip content="Révéler dans le Finder" position="top">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReveal(file);
                }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  "transition-all duration-200",
                  "bg-black/60 backdrop-blur-sm border border-zinc-700/50",
                  "hover:bg-violet-500 hover:border-violet-600",
                  "text-zinc-300 hover:text-white",
                  "shadow-lg hover:shadow-xl hover:shadow-violet-500/20"
                )}
                aria-label="Révéler"
              >
                <FolderOpen size={14} />
              </button>
            </Tooltip>
          )}
          
          {/* Bouton de suppression */}
          <Tooltip content="Supprimer de la liste" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                "transition-all duration-200",
                "bg-black/60 backdrop-blur-sm border border-zinc-700/50",
                "hover:bg-red-500 hover:border-red-600",
                "text-zinc-300 hover:text-white",
                "shadow-lg hover:shadow-xl hover:shadow-red-500/20"
              )}
              aria-label="Supprimer"
            >
              <Trash2 size={14} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Informations du fichier */}
      <div className="p-2 space-y-1.5 border-t border-zinc-800">
        {/* Nom du fichier */}
        <p className="text-sm font-medium text-zinc-200 truncate">
          {file.name}
        </p>

        {/* Ligne d'information : taille avant → après */}
        <div className="flex items-center gap-2 text-xs">
          {file.compressed ? (
            <>
              <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
              <span className="font-mono text-zinc-400">{formatFileSize(originalSize)}</span>
              <span className="text-zinc-600">→</span>
              <span className="font-mono text-emerald-400 font-semibold">{formatFileSize(compressedSize)}</span>
            </>
          ) : (
            <>
              <AlertCircle size={14} className="text-zinc-500 flex-shrink-0" />
              <span className="font-mono text-zinc-400">{formatFileSize(originalSize)}</span>
              <span className="text-zinc-600">{t.main.pending}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const PicRedux = () => {
  // Language hook
  const { language, t, changeLanguage } = useLanguage();
  
  // Fonction pour formater la taille des fichiers selon la langue
  const formatFileSize = (bytes) => {
    if (bytes === 0) return `0 ${t.units.B}`;
    const k = 1024;
    const sizes = [t.units.B, t.units.KB, t.units.MB, t.units.GB];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };
  
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'optimized', 'pending', 'errors'
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successStats, setSuccessStats] = useState({ successCount: 0, savedSize: 0 });
  const [destinationFolder, setDestinationFolder] = useState(null);
  const [showQuotaLimitModal, setShowQuotaLimitModal] = useState(false);
  const [quotaLimitStats, setQuotaLimitStats] = useState({ successCount: 0, remainingCount: 0, quotaUsed: 0, quotaLimit: 30 });
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const licenseKeyInputRef = useRef(null);

  // États pour les modules de compression
  // Utiliser des constantes pour les valeurs de profil (pas les traductions)
  const PROFILE_SHOPIFY = 'Shopify / E-commerce';
  const PROFILE_EMAIL = 'Email / Newsletter';
  const PROFILE_SOCIAL_MEDIA = 'Social Media Presets';
  const PROFILE_CUSTOM = 'Custom';
  
  const [profile, setProfile] = useState(PROFILE_CUSTOM);
  const [compressionFormat, setCompressionFormat] = useState('WebP');
  const [compressionQuality, setCompressionQuality] = useState(80);
  const [outputPrefix, setOutputPrefix] = useState('');
  const [outputSuffix, setOutputSuffix] = useState('_optimized');
  const [resizeMode, setResizeMode] = useState('dimensions'); // 'dimensions' ou 'percentage'
  const [resizeWidth, setResizeWidth] = useState('');
  const [resizeHeight, setResizeHeight] = useState('');
  const [resizePercentage, setResizePercentage] = useState(100); // 1-200%
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [removeMetadata, setRemoveMetadata] = useState(false);
  const [backgroundFill, setBackgroundFill] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF'); // Couleur hex par défaut : Blanc
  const [socialPlatform, setSocialPlatform] = useState('Instagram');
  const [socialType, setSocialType] = useState('Post'); // Sera mis à jour selon la plateforme
  const [outputDestination, setOutputDestination] = useState('same'); // 'same' ou 'custom'
  const [customOutputFolder, setCustomOutputFolder] = useState(null);
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkType, setWatermarkType] = useState('image'); // 'image' ou 'text'
  const [watermarkText, setWatermarkText] = useState('© PicRedux');
  const [watermarkOpacity, setWatermarkOpacity] = useState(50);
  const [watermarkLogo, setWatermarkLogo] = useState(null);
  const [watermarkLogoName, setWatermarkLogoName] = useState(null);
  const [watermarkPosition, setWatermarkPosition] = useState('center'); // 'top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'
  const [watermarkSize, setWatermarkSize] = useState(50); // 1% à 100%
  const [watermarkFont, setWatermarkFont] = useState('Arial'); // Police système
  const [watermarkColor, setWatermarkColor] = useState('#FFFFFF'); // Couleur hex par défaut : Blanc
  const [estimatedSize, setEstimatedSize] = useState(0);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'gain', 'size'
  const [layout, setLayout] = useState(() => {
    // Récupérer le layout depuis localStorage ou utiliser 'grid' par défaut
    const savedLayout = localStorage.getItem('picredux-layout');
    return savedLayout === 'list' ? 'list' : 'grid';
  }); // 'grid' ou 'list'
  
  // État de la licence (PRO/TRIAL)
  const [isPro, setIsPro] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState(null);
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [showActivationForm, setShowActivationForm] = useState(false);
  
  // État du quota de compression
  const [quotaUsed, setQuotaUsed] = useState(0);
  const [quotaLimit, setQuotaLimit] = useState(30);
  const [quotaAllowed, setQuotaAllowed] = useState(true);

  // Fonction pour vérifier si un fichier est un doublon
  const isDuplicateFile = (newFile, newFilePath, existingFiles) => {
    // Vérifier par chemin absolu (priorité)
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
    
    // Fallback : vérifier par nom + taille
    const isNameSizeDuplicate = existingFiles.some(existing => 
      existing.name === newFile.name && existing.size === newFile.size
    );
    if (isNameSizeDuplicate) {
      return true;
    }
    
    return false;
  };

  // Fonction pour gérer les fichiers (Input ou Drop)
  const handleFiles = async (fileList, dataTransferItems = null) => {
    try {
      const filesArray = Array.from(fileList).filter(file => file.type.startsWith('image/'));
      const newFiles = [];

      for (let index = 0; index < filesArray.length; index++) {
        const file = filesArray[index];
        let filePath = null;

        // Dans Electron, les fichiers du drag & drop ont une propriété 'path'
        // IMPORTANT : Extraire explicitement le chemin AVANT de créer l'objet pour éviter sa perte
        // Le spread operator {...file} ne copie pas la propriété 'path' native d'Electron
        if (file.path) {
          filePath = file.path;
        } else if (dataTransferItems && dataTransferItems[index]) {
          const item = dataTransferItems[index];
          // Pour les fichiers locaux, essayer d'obtenir le chemin
          if (item.getAsFileSystemEntry) {
            const entry = item.getAsFileSystemEntry();
            if (entry && entry.fullPath) {
              filePath = entry.fullPath;
            }
          } else if (item.webkitGetAsEntry) {
            const entry = item.webkitGetAsEntry();
            if (entry && entry.fullPath) {
              filePath = entry.fullPath;
            }
          }
        }

        // Vérifier si le fichier est un doublon :
        // 1. Contre les fichiers existants dans l'état
        // 2. Contre les fichiers déjà ajoutés dans ce batch
        if (isDuplicateFile(file, filePath, files) || isDuplicateFile(file, filePath, newFiles)) {
          continue; // Ignorer silencieusement le doublon
        }

        // Note: Dans Electron, les fichiers du drag & drop ont déjà la propriété 'path'
        // Pour les fichiers sélectionnés via input, on n'a pas accès au chemin
        // Dans ce cas, on utilisera le téléchargement classique comme fallback

        let previewUrl;
        try {
          previewUrl = URL.createObjectURL(file);
        } catch (urlError) {
          console.error('Erreur lors de la création de l\'URL de prévisualisation:', urlError);
          continue;
        }

        // Stocker explicitement le chemin pour éviter sa perte
        // Le spread operator {...file} ne copie PAS la propriété path native d'Electron
        newFiles.push({
          id: `${Date.now()}-${index}`,
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          path: filePath, // Stockage explicite du chemin (nécessaire pour préserver les métadonnées)
          originalPath: filePath, // Double stockage pour sécurité
          previewUrl: previewUrl,
          compressed: false,
          compressionRatio: null,
          status: 'pending', // 'pending', 'processing', 'done', 'error'
          compressedSize: null,
          compressedBlob: null,
          outputFilename: null,
        });
      }

      if (newFiles.length > 0) {
        setFiles(prev => [...prev, ...newFiles]);
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des fichiers:', error);
      // Ne pas bloquer l'application en cas d'erreur
    }
  };

  // Focus automatique sur le champ de licence quand il devient visible
  useEffect(() => {
    if (showActivationForm && licenseKeyInputRef.current) {
      // Petit délai pour s'assurer que le DOM est mis à jour
      setTimeout(() => {
        licenseKeyInputRef.current?.focus();
      }, 100);
    }
  }, [showActivationForm]);

  // Nettoyage des URLs d'objet lors du démontage
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Nettoyage uniquement au démontage

  // Fonction pour obtenir les dimensions selon le preset social
  const getSocialPresetDimensions = () => {
    if (profile !== PROFILE_SOCIAL_MEDIA) return null;
    
    const presets = {
      Instagram: {
        Post: { width: 1080, height: 1080 },
        Story: { width: 1080, height: 1920 },
        Reel: { width: 1080, height: 1920 },
      },
      YouTube: {
        Thumbnail: { width: 1280, height: 720 },
        'Channel Art': { width: 2560, height: 1440 },
      },
      Facebook: {
        Post: { width: 1200, height: 630 },
        Cover: { width: 1640, height: 859 },
      },
    };
    
    return presets[socialPlatform]?.[socialType] || null;
  };

  // Fonction pour obtenir la qualité optimale selon le format
  const getOptimalQuality = (format) => {
    switch (format) {
      case 'WebP':
        return 75; // Ratio idéal poids/qualité
      case 'JPEG':
        return 82;
      case 'AVIF':
        return 65;
      case 'PNG':
        return 80; // Compression efficace sans perte visible
      case 'Original':
        return 80; // Valeur par défaut pour Original
      default:
        return 80;
    }
  };

  // Définir une qualité par défaut optimale selon le format
  useEffect(() => {
    const optimalQuality = getOptimalQuality(compressionFormat);
    setCompressionQuality(optimalQuality);
  }, [compressionFormat]);

  // Fonction pour générer une vignette compressée de manière asynchrone avec Background Fill et Watermark
  const generateCompressedThumbnail = async (file, format, quality, bgFill, bgColor, wmEnabled, wmText, wmLogo, wmType, wmPosition, wmSize, wmOpacity, wmFont, wmColor, wmColorCustom) => {
    try {
      const img = await loadImage(file);
      const canvas = document.createElement('canvas');
      // Limiter la taille de la vignette pour les performances (max 300px)
      const maxSize = 300;
      let width = img.width;
      let height = img.height;
      
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        return null;
      }
      
      // 1. Dessiner le background si backgroundFill est activé
      if (bgFill) {
        // bgColor est maintenant directement une couleur hex
        const bgColorValue = typeof bgColor === 'string' && bgColor.startsWith('#') ? bgColor : '#FFFFFF';
        ctx.fillStyle = bgColorValue;
        ctx.fillRect(0, 0, width, height);
        
        // Mode fit: 'contain' - l'image est redimensionnée pour tenir dans les dimensions tout en conservant le ratio
        const imageAspectRatio = img.width / img.height;
        const targetAspectRatio = width / height;
        
        let drawWidth = width;
        let drawHeight = height;
        let drawX = 0;
        let drawY = 0;
        
        if (imageAspectRatio > targetAspectRatio) {
          // L'image est plus large que la cible - ajuster la hauteur
          drawWidth = width;
          drawHeight = width / imageAspectRatio;
          drawX = 0;
          drawY = (height - drawHeight) / 2;
        } else {
          // L'image est plus haute que la cible - ajuster la largeur
          drawWidth = height * imageAspectRatio;
          drawHeight = height;
          drawX = (width - drawWidth) / 2;
          drawY = 0;
        }
        
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      } else {
        // Mode normal - redimensionner l'image pour remplir les dimensions
        ctx.drawImage(img, 0, 0, width, height);
      }
      
      // 2. Ajouter le watermark si activé
      if (wmEnabled) {
        try {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, wmOpacity / 100));
          
          const padding = Math.max(10, Math.min(50, width / 40));
          
          // Calculer les positions selon le sélecteur
          const positions = {
            'top-left': { x: padding, y: padding, align: 'left', baseline: 'top' },
            'top-center': { x: width / 2, y: padding, align: 'center', baseline: 'top' },
            'top-right': { x: width - padding, y: padding, align: 'right', baseline: 'top' },
            'center-left': { x: padding, y: height / 2, align: 'left', baseline: 'middle' },
            'center': { x: width / 2, y: height / 2, align: 'center', baseline: 'middle' },
            'center-right': { x: width - padding, y: height / 2, align: 'right', baseline: 'middle' },
            'bottom-left': { x: padding, y: height - padding, align: 'left', baseline: 'bottom' },
            'bottom-center': { x: width / 2, y: height - padding, align: 'center', baseline: 'bottom' },
            'bottom-right': { x: width - padding, y: height - padding, align: 'right', baseline: 'bottom' },
          };
          
          const pos = positions[wmPosition] || positions['bottom-right'];
          
          // Si un logo est fourni et que le type est 'image', utiliser l'image
          if (wmLogo && wmType === 'image') {
            const logoImg = await loadImage(wmLogo);
            // À 100%, utiliser la taille native du logo. À moins de 100%, réduire proportionnellement
            const watermarkWidth = (logoImg.width * wmSize) / 100;
            // Calculer la hauteur proportionnelle pour maintenir le ratio
            const logoAspectRatio = logoImg.width / logoImg.height;
            const watermarkHeight = watermarkWidth / logoAspectRatio;
            
            // Ajuster la position selon l'alignement
            let logoX = pos.x;
            let logoY = pos.y;
            
            if (pos.align === 'center') {
              logoX = pos.x - watermarkWidth / 2;
            } else if (pos.align === 'right') {
              logoX = pos.x - watermarkWidth;
            }
            
            if (pos.baseline === 'middle') {
              logoY = pos.y - watermarkHeight / 2;
            } else if (pos.baseline === 'bottom') {
              logoY = pos.y - watermarkHeight;
            }
            
            ctx.drawImage(logoImg, logoX, logoY, watermarkWidth, watermarkHeight);
            URL.revokeObjectURL(logoImg.src);
          } else if (wmText && wmText.trim() !== '' && wmType === 'text') {
            // Utiliser le texte du filigrane
            const watermarkWidth = (width * wmSize) / 100;
            const fontSize = Math.max(12, Math.min(200, watermarkWidth / wmText.length * 2));
            
            // Définir la couleur du texte (wmColor est maintenant directement une couleur hex)
            const textColor = typeof wmColor === 'string' && wmColor.startsWith('#') ? wmColor : '#FFFFFF';
            ctx.fillStyle = textColor;
            ctx.font = `bold ${fontSize}px ${wmFont || 'Arial'}, sans-serif`;
            ctx.textAlign = pos.align;
            ctx.textBaseline = pos.baseline;
            ctx.fillText(wmText, pos.x, pos.y);
          }
          
          ctx.restore();
        } catch (wmError) {
          console.warn('Erreur lors de l\'ajout du filigrane dans la vignette:', wmError);
          // Continuer sans le filigrane plutôt que d'échouer
        }
      }
      
      // 3. Convertir selon le format
      const mimeType = format === 'Original' ? (file.type || 'image/jpeg') :
                       format === 'JPEG' ? 'image/jpeg' :
                       format === 'PNG' ? 'image/png' :
                       format === 'WebP' ? 'image/webp' :
                       format === 'AVIF' ? 'image/png' : // Fallback pour AVIF (Canvas ne supporte pas AVIF)
                       'image/jpeg';
      
      // Utiliser la qualité du slider
      const qualityValue = quality / 100;
      
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve(url);
            } else {
              resolve(null);
            }
          },
          mimeType,
          qualityValue
        );
      });
    } catch (error) {
      console.error('Erreur lors de la génération de la vignette compressée:', error);
      return null;
    }
  };

  // État pour stocker les vignettes compressées
  const [compressedThumbnails, setCompressedThumbnails] = useState({});

  // États debounced pour backgroundColor et watermarkColor (pour éviter les régénérations trop fréquentes)
  const [debouncedBackgroundColor, setDebouncedBackgroundColor] = useState(backgroundColor);
  const [debouncedWatermarkColor, setDebouncedWatermarkColor] = useState(watermarkColor);

  // Debounce pour backgroundColor (300ms de délai)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBackgroundColor(backgroundColor);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [backgroundColor]);

  // Debounce pour watermarkColor (300ms de délai)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedWatermarkColor(watermarkColor);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [watermarkColor]);

  // Générer les vignettes compressées de manière asynchrone quand les réglages changent
  useEffect(() => {
    let isCancelled = false;
    const currentThumbnails = compressedThumbnails;
    
    const generateThumbnails = async () => {
      // Nettoyer les anciennes vignettes
      Object.values(currentThumbnails).forEach(url => {
        if (url && typeof url === 'string') {
          URL.revokeObjectURL(url);
        }
      });
      
      if (files.length === 0) {
        if (!isCancelled) {
          setCompressedThumbnails({});
        }
        return;
      }
      
      const thumbnails = {};
      
      // Générer les vignettes pour tous les fichiers de manière asynchrone
      const promises = files.map(async (file) => {
        if (isCancelled) return;
        
        if (file.previewUrl && file.file) {
          try {
            const thumbnailUrl = await generateCompressedThumbnail(
              file.file,
              compressionFormat,
              compressionQuality,
              backgroundFill,
              debouncedBackgroundColor, // Utiliser la version debounced
              watermarkEnabled,
              watermarkText,
              watermarkLogo,
              watermarkType,
              watermarkPosition,
              watermarkSize,
              watermarkOpacity,
              watermarkFont,
              debouncedWatermarkColor // Utiliser la version debounced
            );
            if (!isCancelled && thumbnailUrl) {
              thumbnails[file.id] = thumbnailUrl;
            }
          } catch (error) {
            console.error(`Erreur lors de la génération de la vignette pour ${file.name}:`, error);
          }
        }
      });
      
      await Promise.all(promises);
      
      if (!isCancelled) {
        setCompressedThumbnails(thumbnails);
      } else {
        // Nettoyer les vignettes générées si le composant a été démonté
        Object.values(thumbnails).forEach(url => {
          if (url && typeof url === 'string') {
            URL.revokeObjectURL(url);
          }
        });
      }
    };
    
    generateThumbnails();
    
    // Nettoyage à la fin
    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    compressionFormat, 
    compressionQuality, 
    backgroundFill, 
    debouncedBackgroundColor, // Utiliser la version debounced
    watermarkEnabled, 
    watermarkText, 
    watermarkLogo, 
    watermarkType, 
    watermarkPosition, 
    watermarkSize, 
    watermarkOpacity, 
    watermarkFont, 
    debouncedWatermarkColor, // Utiliser la version debounced
    files.map(f => f.id).join(',')
  ]);

  // Mise à jour automatique des valeurs de redimensionnement selon le profil
  useEffect(() => {
    if (profile === PROFILE_SHOPIFY) {
      setResizeWidth(1200);
      setResizeHeight(1200);
      setResizeMode('dimensions');
      setKeepAspectRatio(true);
      setBackgroundFill(false);
    } else if (profile === PROFILE_EMAIL) {
      setResizeWidth(600);
      setResizeHeight('');
      setResizeMode('dimensions');
      setKeepAspectRatio(true);
      setBackgroundFill(false);
    } else if (profile === PROFILE_SOCIAL_MEDIA) {
      const dimensions = getSocialPresetDimensions();
      if (dimensions) {
        setResizeWidth(dimensions.width);
        setResizeHeight(dimensions.height);
        setResizeMode('dimensions');
      }
      // Pour les presets sociaux : décocher "Keep aspect ratio" et suggérer "Background Fill"
      setKeepAspectRatio(false);
      setBackgroundFill(true); // Activer automatiquement Background Fill
    } else if (profile === PROFILE_CUSTOM) {
      // Reset pour Custom : remettre à l'état original
      setResizeWidth('');
      setResizeHeight('');
      setResizeMode('dimensions');
      setKeepAspectRatio(true);
      setBackgroundFill(false);
    }
  }, [profile, socialPlatform, socialType]);

  // Vérifier le statut de la licence et le quota au montage du composant
  useEffect(() => {
    const checkLicenseStatus = async () => {
      if (window.electronAPI && window.electronAPI.getLicenseStatus) {
        try {
          const status = await window.electronAPI.getLicenseStatus();
          setIsPro(status.isPro || false);
          if (status.key) {
            setLicenseKey(status.key);
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du statut de la licence:', error);
          setIsPro(false);
        }
      }
    };
    
    const checkQuota = async () => {
      if (window.electronAPI && window.electronAPI.checkQuota) {
        try {
          const quota = await window.electronAPI.checkQuota();
          setQuotaUsed(quota.count || 0);
          setQuotaLimit(quota.limit || 30);
          setQuotaAllowed(quota.allowed || false);
          // Mettre à jour isPro si le quota indique qu'on est PRO
          if (quota.isPro) {
            setIsPro(true);
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du quota:', error);
          // En cas d'erreur, autoriser quand même (fail-safe)
          setQuotaAllowed(true);
        }
      }
    };
    
    checkLicenseStatus();
    checkQuota();
  }, []);

  // Exposer des fonctions utilitaires sur window pour le débogage (console)
  useEffect(() => {
    // Fonction pour réinitialiser le quota de compression
    window.resetQuota = async () => {
      if (!window.electronAPI || !window.electronAPI.resetQuota) {
        console.error('❌ API Electron ou resetQuota non disponible');
        return;
      }
      try {
        const result = await window.electronAPI.resetQuota();
        if (result.success) {
          // Mettre à jour le state
          setQuotaUsed(0);
          setQuotaAllowed(true);
        } else {
          console.error('❌ Erreur lors de la réinitialisation:', result.error);
        }
      } catch (error) {
        console.error('❌ Erreur:', error);
      }
    };

    // Fonction pour désactiver la licence PRO
    window.disableLicense = async () => {
      if (!window.electronAPI || !window.electronAPI.clearLicense) {
        console.error('❌ API Electron ou clearLicense non disponible');
        return;
      }
      try {
        const result = await window.electronAPI.clearLicense();
        if (result.success) {
          // Mettre à jour le state
          setIsPro(false);
          setLicenseKey('');
          // Recharger le quota
          if (window.electronAPI && window.electronAPI.checkQuota) {
            const quota = await window.electronAPI.checkQuota();
            setQuotaUsed(quota.count || 0);
            setQuotaLimit(quota.limit || 30);
            setQuotaAllowed(quota.allowed || false);
          }
        } else {
          console.error('❌ Erreur lors de la désactivation:', result.error);
        }
      } catch (error) {
        console.error('❌ Erreur:', error);
      }
    };

    // Fonction pour afficher l'aide
    window.picReduxHelp = () => {
      console.log('%c🛠️ PicRedux - Fonctions de débogage', 'font-size: 16px; font-weight: bold; color: #a855f7;');
      console.log('');
      console.log('%cFonctions disponibles:', 'font-weight: bold;');
      console.log('  • window.resetQuota()    - Réinitialise le compteur de compression (quota)');
      console.log('  • window.disableLicense() - Désactive la licence PRO en cours');
      console.log('  • window.picReduxHelp() - Affiche cette aide');
      console.log('');
      console.log('%cExemples:', 'font-weight: bold;');
      console.log('  await window.resetQuota()');
      console.log('  await window.disableLicense()');
    };


    // Nettoyer à la destruction du composant
    return () => {
      delete window.resetQuota;
      delete window.disableLicense;
      delete window.picReduxHelp;
    };
  }, []);

  // Fonction pour traduire les codes d'erreur
  const translateError = (errorCode, errorData = {}) => {
    const errorMessages = {
      LICENSE_KEY_EMPTY: t.sidebar.licenseKeyEmpty,
      API_NOT_AVAILABLE: t.sidebar.apiNotAvailable,
      LICENSE_INVALID: t.sidebar.licenseInvalid,
      LICENSE_REFUNDED: t.sidebar.licenseRefunded,
      LICENSE_CANCELLED: t.sidebar.licenseCancelled,
      LICENSE_ACTIVATION_LIMIT_REACHED: t.sidebar.licenseActivationLimitReached || "Cette licence a atteint son nombre maximum d'activations.",
      GUMROAD_CONNECTION_ERROR: t.sidebar.gumroadConnectionError.replace('{statusCode}', errorData.statusCode || ''),
      PARSE_ERROR: t.sidebar.parseError.replace('{message}', errorData.message || ''),
      NETWORK_ERROR: t.sidebar.networkError.replace('{message}', errorData.message || ''),
      VERIFICATION_ERROR: t.sidebar.verificationError.replace('{message}', errorData.message || ''),
    };
    
    return errorMessages[errorCode] || t.sidebar.licenseInvalid;
  };

  // Fonction pour effacer la licence
  const handleClearLicense = async () => {
    if (!window.electronAPI || !window.electronAPI.clearLicense) {
      console.error('API Electron non disponible pour effacer la licence');
      return;
    }

    // Demander confirmation
    if (!window.confirm(t.sidebar.clearLicenseConfirm)) {
      return;
    }

    try {
      const result = await window.electronAPI.clearLicense();
      if (result.success) {
        setIsPro(false);
        setLicenseKey('');
        setActivationError(null);
        setActivationSuccess(false);
        // Recharger le quota après effacement (pour mettre à jour isPro dans le backend)
        if (window.electronAPI && window.electronAPI.checkQuota) {
          try {
            const quota = await window.electronAPI.checkQuota();
            setQuotaUsed(quota.count || 0);
            setQuotaLimit(quota.limit || 30);
            setQuotaAllowed(quota.allowed || false);
          } catch (error) {
            console.error('Erreur lors de la vérification du quota après effacement:', error);
          }
        }
        console.log('Licence effacée avec succès');
      } else {
        console.error('Erreur lors de l\'effacement de la licence:', result.error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'effacement de la licence:', error);
    }
  };

  // Fonction pour activer la licence
  const handleActivation = async () => {
    if (!licenseKey || licenseKey.trim() === '') {
      setActivationError(t.sidebar.licenseKeyEmpty);
      return;
    }

    if (!window.electronAPI || !window.electronAPI.verifyLicense) {
      setActivationError(t.sidebar.apiNotAvailable);
      return;
    }

    setIsActivating(true);
    setActivationError(null);

    try {
      const result = await window.electronAPI.verifyLicense(licenseKey.trim());
      
      if (result.success) {
        setIsPro(true);
        setActivationSuccess(true);
        setActivationError(null);
        // Recharger le quota après activation (pour mettre à jour isPro dans le backend)
        if (window.electronAPI && window.electronAPI.checkQuota) {
          try {
            const quota = await window.electronAPI.checkQuota();
            setQuotaUsed(quota.count || 0);
            setQuotaLimit(quota.limit || 30);
            setQuotaAllowed(quota.allowed || true);
          } catch (error) {
            console.error('Erreur lors de la vérification du quota après activation:', error);
          }
        }
        // Fermer le formulaire après un court délai pour laisser voir le message de succès
        setTimeout(() => {
          setShowActivationForm(false);
          setActivationSuccess(false);
          setLicenseKey('');
        }, 2000);
      } else {
        // Traduire le code d'erreur si présent, sinon utiliser le message d'erreur direct
        if (result.errorCode) {
          setActivationError(translateError(result.errorCode, result.errorData || {}));
        } else if (result.error) {
          // Fallback pour les anciens messages d'erreur non traduits
          setActivationError(result.error);
        } else {
          setActivationError(t.sidebar.licenseInvalid);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'activation:', error);
      setActivationError(t.sidebar.verificationError.replace('{message}', error.message || ''));
    } finally {
      setIsActivating(false);
    }
  };

  // Gestion du drag & drop global
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Ne masquer l'overlay que si on quitte vraiment la fenêtre
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // Bloquer le drop si quota atteint (mode TRIAL)
    if (!isPro && quotaUsed >= quotaLimit) {
      alert(t.sidebar.trialLimitReachedAlert.replace('{used}', quotaUsed).replace('{limit}', quotaLimit));
      setShowActivationForm(true);
      return;
    }

    const droppedFiles = e.dataTransfer.files;
    const dataTransferItems = e.dataTransfer.items ? Array.from(e.dataTransfer.items) : null;
    if (droppedFiles.length > 0) {
      await handleFiles(droppedFiles, dataTransferItems);
    }
  };

  // Gestion du clic sur le bouton d'import
  const handleFileInput = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    // Reset input pour permettre de sélectionner le même fichier
    e.target.value = '';
  };

  // Supprimer un fichier
  const handleRemoveFile = (fileId) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove && fileToRemove.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter(f => f.id !== fileId);
    });
    
    // Nettoyer aussi la vignette compressée
    setCompressedThumbnails(prev => {
      const thumbnailUrl = prev[fileId];
      if (thumbnailUrl && typeof thumbnailUrl === 'string') {
        URL.revokeObjectURL(thumbnailUrl);
      }
      const newThumbnails = { ...prev };
      delete newThumbnails[fileId];
      return newThumbnails;
    });
  };

  // Calcul des stats
  const stats = {
    total: files.length,
    totalSize: files.reduce((sum, f) => sum + f.size, 0),
    compressedSize: files.reduce((sum, f) => sum + (f.compressedSize || f.size), 0),
  };
  const savedSize = stats.totalSize - stats.compressedSize;
  const reductionPercent = stats.totalSize > 0 
    ? Math.round((savedSize / stats.totalSize) * 100) 
    : 0;

  // Fonction utilitaire pour charger une image
  const loadImage = (file) => {
    return new Promise((resolve, reject) => {
      // Utiliser window.Image explicitement pour éviter les conflits avec les imports
      const img = document.createElement('img');
      const imageUrl = URL.createObjectURL(file);
      
      // Timeout pour éviter les blocages
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Timeout lors du chargement de l\'image'));
      }, 30000); // 30 secondes max
      
      img.onload = () => {
        clearTimeout(timeout);
        // Vérifier que l'image a des dimensions valides
        if (img.width === 0 || img.height === 0) {
          URL.revokeObjectURL(imageUrl);
          reject(new Error('Image invalide : dimensions nulles'));
          return;
        }
        resolve(img);
      };
      
      img.onerror = (error) => {
        clearTimeout(timeout);
        URL.revokeObjectURL(imageUrl);
        reject(new Error(`Impossible de charger l'image: ${file.name}`));
      };
      
      img.src = imageUrl;
    });
  };

  // Fonction utilitaire pour obtenir le MIME type selon le format
  const getMimeType = (format) => {
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
        return null; // Original - garde le format d'origine
    }
  };

  // Fonction principale de traitement d'image (THE ENGINE)
  const processFile = async (fileData, config) => {
    const {
      format = compressionFormat,
      quality = compressionQuality,
      resizeMode: mode = 'dimensions',
      resizeValue: resizeVal = 100,
      resizeWidth: width = resizeWidth,
      resizeHeight: height = resizeHeight,
      watermarkEnabled: wmEnabled = watermarkEnabled,
      watermarkText: wmText = watermarkText,
      watermarkOpacity: wmOpacity = watermarkOpacity,
      watermarkPosition: wmPosition = watermarkPosition,
      watermarkSize: wmSize = watermarkSize,
      watermarkLogo: wmLogo = watermarkLogo,
      watermarkType: wmType = watermarkType,
      watermarkFont: wmFont = watermarkFont,
      watermarkColor: wmColor = watermarkColor,
      backgroundFill: bgFill = backgroundFill,
      backgroundColor: bgColor = backgroundColor,
      suffix = outputSuffix,
    } = config;

    let imageUrl = null;

    try {
      // 1. Charger l'image
      const img = await loadImage(fileData.file);
      imageUrl = img.src; // Sauvegarder l'URL pour le nettoyage
      
      const originalWidth = img.width;
      const originalHeight = img.height;

      // Validation des dimensions
      if (originalWidth === 0 || originalHeight === 0) {
        throw new Error('Dimensions d\'image invalides');
      }

      // 2. Calculer les dimensions finales
      let finalWidth = originalWidth;
      let finalHeight = originalHeight;

      if (mode === 'percentage') {
        finalWidth = Math.max(1, Math.round(originalWidth * (resizeVal / 100)));
        finalHeight = Math.max(1, Math.round(originalHeight * (resizeVal / 100)));
      } else if (mode === 'dimensions' || mode === 'fixed') {
        // Si les champs sont vides ou null, conserver la taille originale (pas de redimensionnement)
        const widthValue = width === '' || width === null || width === undefined ? null : Number(width);
        const heightValue = height === '' || height === null || height === undefined || height === 'Auto' ? null : Number(height);
        
        if (widthValue === null && heightValue === null) {
          // Pas de redimensionnement : conserver les dimensions originales
          finalWidth = originalWidth;
          finalHeight = originalHeight;
        } else if (widthValue !== null && heightValue === null) {
          // Seulement la largeur est définie : calculer la hauteur en conservant le ratio
          if (widthValue <= 0) {
            throw new Error('Largeur de redimensionnement invalide');
          }
          const ratio = widthValue / originalWidth;
          finalWidth = Math.max(1, Math.round(originalWidth * ratio));
          finalHeight = Math.max(1, Math.round(originalHeight * ratio));
        } else if (widthValue === null && heightValue !== null) {
          // Seulement la hauteur est définie : calculer la largeur en conservant le ratio
          if (heightValue <= 0) {
            throw new Error('Hauteur de redimensionnement invalide');
          }
          const ratio = heightValue / originalHeight;
          finalWidth = Math.max(1, Math.round(originalWidth * ratio));
          finalHeight = Math.max(1, Math.round(originalHeight * ratio));
        } else {
          // Les deux dimensions sont définies : calculer le ratio pour maintenir les proportions
          if (widthValue <= 0 || heightValue <= 0) {
            throw new Error('Dimensions de redimensionnement invalides');
          }
          const ratio = Math.min(widthValue / originalWidth, heightValue / originalHeight);
          finalWidth = Math.max(1, Math.round(originalWidth * ratio));
          finalHeight = Math.max(1, Math.round(originalHeight * ratio));
        }
      }

      // Validation des dimensions finales
      if (finalWidth <= 0 || finalHeight <= 0) {
        throw new Error('Dimensions finales invalides');
      }

      // 3. Créer le canvas
      const canvas = document.createElement('canvas');
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      const ctx = canvas.getContext('2d');

      // Vérifier que le contexte est valide
      if (!ctx) {
        throw new Error('Impossible de créer le contexte canvas');
      }

      // 4. Dessiner le background si backgroundFill est activé
      if (bgFill) {
        // bgColor est maintenant directement une couleur hex
        const bgColorValue = typeof bgColor === 'string' && bgColor.startsWith('#') ? bgColor : '#FFFFFF';
        ctx.fillStyle = bgColorValue;
        ctx.fillRect(0, 0, finalWidth, finalHeight);
      }

      // 5. Dessiner l'image redimensionnée
      if (bgFill) {
        // Mode fit: 'contain' - l'image est redimensionnée pour tenir dans les dimensions tout en conservant le ratio
        const imageAspectRatio = originalWidth / originalHeight;
        const targetAspectRatio = finalWidth / finalHeight;
        
        let drawWidth = finalWidth;
        let drawHeight = finalHeight;
        let drawX = 0;
        let drawY = 0;
        
        if (imageAspectRatio > targetAspectRatio) {
          // L'image est plus large que la cible - ajuster la hauteur
          drawWidth = finalWidth;
          drawHeight = finalWidth / imageAspectRatio;
          drawX = 0;
          drawY = (finalHeight - drawHeight) / 2;
        } else {
          // L'image est plus haute que la cible - ajuster la largeur
          drawWidth = finalHeight * imageAspectRatio;
          drawHeight = finalHeight;
          drawX = (finalWidth - drawWidth) / 2;
          drawY = 0;
        }
        
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      } else {
        // Mode normal - redimensionner l'image pour remplir les dimensions
        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
      }

      // 6. Ajouter le filigrane si activé
      if (wmEnabled) {
        try {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, wmOpacity / 100));
          
          const padding = Math.max(10, Math.min(50, finalWidth / 40));
          
          // Calculer la position selon le sélecteur
          let logoX = 0;
          let logoY = 0;
          let textX = 0;
          let textY = 0;
          let textAlign = 'left';
          let textBaseline = 'top';
          
          // Calculer les positions selon la grille 3x3
          const positions = {
            'top-left': { x: padding, y: padding, align: 'left', baseline: 'top' },
            'top-center': { x: finalWidth / 2, y: padding, align: 'center', baseline: 'top' },
            'top-right': { x: finalWidth - padding, y: padding, align: 'right', baseline: 'top' },
            'center-left': { x: padding, y: finalHeight / 2, align: 'left', baseline: 'middle' },
            'center': { x: finalWidth / 2, y: finalHeight / 2, align: 'center', baseline: 'middle' },
            'center-right': { x: finalWidth - padding, y: finalHeight / 2, align: 'right', baseline: 'middle' },
            'bottom-left': { x: padding, y: finalHeight - padding, align: 'left', baseline: 'bottom' },
            'bottom-center': { x: finalWidth / 2, y: finalHeight - padding, align: 'center', baseline: 'bottom' },
            'bottom-right': { x: finalWidth - padding, y: finalHeight - padding, align: 'right', baseline: 'bottom' },
          };
          
          const pos = positions[wmPosition] || positions['bottom-right'];
          
          // Si un logo est fourni et que le type est 'image', utiliser l'image
          if (wmLogo && wmType === 'image') {
            const logoImg = await loadImage(wmLogo);
            // À 100%, utiliser la taille native du logo. À moins de 100%, réduire proportionnellement
            const watermarkWidth = (logoImg.width * wmSize) / 100;
            // Calculer la hauteur proportionnelle pour maintenir le ratio
            const logoAspectRatio = logoImg.width / logoImg.height;
            const watermarkHeight = watermarkWidth / logoAspectRatio;
            
            // Ajuster la position selon l'alignement
            if (pos.align === 'center') {
              logoX = pos.x - watermarkWidth / 2;
            } else if (pos.align === 'right') {
              logoX = pos.x - watermarkWidth;
            } else {
              logoX = pos.x;
            }
            
            if (pos.baseline === 'middle') {
              logoY = pos.y - watermarkHeight / 2;
            } else if (pos.baseline === 'bottom') {
              logoY = pos.y - watermarkHeight;
            } else {
              logoY = pos.y;
            }
            
            ctx.drawImage(logoImg, logoX, logoY, watermarkWidth, watermarkHeight);
            URL.revokeObjectURL(logoImg.src);
          } else if (wmText && wmText.trim() !== '' && wmType === 'text') {
            // Utiliser le texte du filigrane avec les nouvelles options
            // Pour le texte, utiliser une taille relative à la largeur de l'image
            const watermarkWidth = (finalWidth * wmSize) / 100;
            const fontSize = Math.max(12, Math.min(200, watermarkWidth / wmText.length * 2));
            
            // Définir la couleur du texte (wmColor est maintenant directement une couleur hex)
            const textColor = typeof wmColor === 'string' && wmColor.startsWith('#') ? wmColor : '#FFFFFF';
            ctx.fillStyle = textColor;
            ctx.font = `bold ${fontSize}px ${wmFont || 'Arial'}, sans-serif`;
            ctx.textAlign = pos.align;
            ctx.textBaseline = pos.baseline;
            ctx.fillText(wmText, pos.x, pos.y);
          }
          
          ctx.restore();
        } catch (wmError) {
          console.warn('Erreur lors de l\'ajout du filigrane:', wmError);
          // Continuer sans le filigrane plutôt que d'échouer
        }
      }

      // 6. Compression : convertir en blob
      let mimeType = getMimeType(format);
      let actualMimeType = mimeType; // MIME type réel utilisé pour toBlob
      let useFallback = false;
      
      // Si format Original, utiliser le type du fichier ou fallback sur JPEG
      if (!mimeType) {
        mimeType = fileData.type || 'image/jpeg';
        actualMimeType = mimeType;
      }

      // Formats supportés nativement par Canvas API
      const nativeSupportedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      
      // Gestion des formats non supportés nativement par Canvas API
      if (format === 'AVIF') {
        // AVIF n'est pas supporté par Canvas API, doit être traité dans le backend avec Sharp
        // On va convertir d'abord en PNG via Canvas, puis convertir en AVIF dans le backend
        actualMimeType = 'image/png';
        useFallback = true;
      } else if (format === 'SVG') {
        // SVG est un format vectoriel, Canvas API ne peut pas générer de SVG
        // Pour SVG source: copie directe possible (géré séparément si nécessaire)
        // Pour raster vers SVG: conversion impossible, utiliser PNG comme fallback
        console.warn('Conversion raster vers SVG non supportée via Canvas API. Utilisation de PNG comme fallback.');
        actualMimeType = 'image/png';
        useFallback = true;
      } else if (!nativeSupportedTypes.includes(actualMimeType)) {
        // Fallback générique sur JPEG si le type n'est pas supporté
        actualMimeType = 'image/jpeg';
        useFallback = true;
      }

      const qualityValue = Math.max(0, Math.min(1, quality / 100));

      return new Promise((resolve, reject) => {
        // Timeout pour éviter les blocages
        const timeout = setTimeout(() => {
          reject(new Error('Timeout lors de la compression'));
        }, 30000); // 30 secondes max

        canvas.toBlob(
          async (blob) => {
            clearTimeout(timeout);
            
            if (!blob) {
              reject(new Error(`Échec de la compression (format: ${actualMimeType})`));
              return;
            }

            // Nettoyer l'URL de l'image chargée
            if (imageUrl) {
              URL.revokeObjectURL(imageUrl);
            }

            // Si le format demandé est AVIF, convertir via le backend avec Sharp
            if (format === 'AVIF' && window.electronAPI) {
              try {
                // S'assurer que la qualité est toujours entre 1 et 100 pour AVIF (Sharp exige >= 1)
                const avifQuality = Math.max(1, Math.min(100, quality || 80));
                
                // Convertir le blob en ArrayBuffer
                const arrayBuffer = await blob.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                
                // Appeler le backend pour conversion AVIF avec la qualité validée
                const result = await window.electronAPI.convertToAvif(Array.from(uint8Array), avifQuality);
                
                if (result.success) {
                  // Créer un nouveau blob AVIF depuis le buffer retourné
                  const avifBlob = new Blob([new Uint8Array(result.buffer)], { type: 'image/avif' });
                  
                  resolve({
                    blob: avifBlob,
                    size: avifBlob.size,
                    width: finalWidth,
                    height: finalHeight,
                    actualFormat: 'AVIF',
                    requestedFormat: format,
                    usedFallback: false,
                  });
                  return;
                } else {
                  console.error('[AVIF Frontend] Erreur retournée par le backend:', result.error);
                  throw new Error(result.error || 'Erreur lors de la conversion AVIF');
                }
              } catch (avifError) {
                console.error('[AVIF Frontend] Exception lors de la conversion AVIF:', avifError);
                // Fallback sur PNG si la conversion AVIF échoue
                const mimeToFormat = {
                  'image/webp': 'WebP',
                  'image/jpeg': 'JPEG',
                  'image/png': 'PNG',
                  'image/svg+xml': 'SVG'
                };
                const actualFormatName = mimeToFormat[actualMimeType] || format;
                
                console.warn('[AVIF Frontend] Fallback sur format:', actualFormatName);
                
                resolve({
                  blob,
                  size: blob.size,
                  width: finalWidth,
                  height: finalHeight,
                  actualFormat: actualFormatName,
                  requestedFormat: format,
                  usedFallback: true,
                });
                return;
              }
            }

            // Si useFallback est true, convertir le MIME type en format pour getOutputPreview
            let actualFormatName = format;
            if (useFallback) {
              const mimeToFormat = {
                'image/webp': 'WebP',
                'image/jpeg': 'JPEG',
                'image/png': 'PNG',
                'image/svg+xml': 'SVG'
              };
              actualFormatName = mimeToFormat[actualMimeType] || format;
            }
            
            resolve({
              blob,
              size: blob.size,
              width: finalWidth,
              height: finalHeight,
              actualFormat: actualFormatName,
              requestedFormat: format,
              usedFallback: useFallback,
            });
          },
          actualMimeType,
          qualityValue
        );
      });
    } catch (error) {
      // Nettoyer l'URL en cas d'erreur
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      console.error('Erreur lors du traitement:', error);
      throw error;
    }
  };

  // Fonction pour sauvegarder un fichier dans le dossier source (SANS DIALOGUE)
  const saveFileToSourceFolder = async (blob, fileData, formatOverride = null, qualityOverride = null, options = {}) => {
    // Vérifier que l'API Electron est disponible
    if (!window.electronAPI) {
      console.warn('API Electron non disponible, fallback sur téléchargement');
      return downloadFile(blob, getOutputPreview(fileData.name, formatOverride));
    }

    // Déterminer le dossier de destination
    let outputDir;
    if (outputDestination === 'custom' && customOutputFolder) {
      outputDir = customOutputFolder;
    } else if (fileData.path) {
      // Extraire le dossier source et construire le chemin de sortie
      // Gérer les séparateurs Windows (\\) et Unix (/)
      const pathSeparator = fileData.path.includes('\\') ? '\\' : '/';
      const lastSeparator = Math.max(
        fileData.path.lastIndexOf('/'),
        fileData.path.lastIndexOf('\\')
      );
      outputDir = lastSeparator > 0 ? fileData.path.substring(0, lastSeparator) : fileData.path;
    } else {
      // Pas de chemin disponible : fallback sur téléchargement
      console.warn(`Chemin non disponible pour ${fileData.name}, utilisation du téléchargement`);
      return downloadFile(blob, getOutputPreview(fileData.name, formatOverride));
    }

    // Si on a un dossier de destination, sauvegarder
    if (outputDir) {
      try {
        const outputFilename = getOutputPreview(fileData.name, formatOverride);
        const pathSeparator = outputDir.includes('\\') ? '\\' : '/';
        
        // Forcer l'extension .avif si le format est AVIF
        let finalOutputFilename = outputFilename;
        if (formatOverride === 'AVIF' || formatOverride === 'avif') {
          // S'assurer que l'extension est bien .avif
          const nameWithoutExt = outputFilename.replace(/\.[^/.]+$/, '');
          finalOutputFilename = `${nameWithoutExt}.avif`;
        }
        
        const outputPath = `${outputDir}${pathSeparator}${finalOutputFilename}`;

        // Convertir le blob en ArrayBuffer puis en Uint8Array
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Préparer les options pour le backend
        let qualityToUse = qualityOverride !== null ? qualityOverride : compressionQuality;
        if (formatOverride === 'AVIF' || formatOverride === 'avif') {
          qualityToUse = Math.max(1, Math.min(100, qualityToUse || 80));
        }
        
        const keepMetadata = !removeMetadata;
        const inputPath = fileData.path || fileData.originalPath || null;
        
        // Préparer les options pour le backend (resize, fill, watermark)
        const backendOptions = {};
        
        // Options de redimensionnement
        if (resizeMode === 'dimensions' && (resizeWidth || resizeHeight)) {
          backendOptions.resize = {
            mode: 'dimensions',
            width: resizeWidth ? parseInt(resizeWidth) : null,
            height: resizeHeight && resizeHeight !== 'Auto' ? parseInt(resizeHeight) : null
          };
        } else if (resizeMode === 'percentage' && resizePercentage !== 100) {
          backendOptions.resize = {
            mode: 'percentage',
            value: resizePercentage
          };
        }
        
        // Option de remplissage (Background Fill)
        if (backgroundFill && backgroundColor) {
          backendOptions.fillColor = backgroundColor;
        }
        
        // Options de filigrane
        if (watermarkEnabled) {
          backendOptions.watermark = {
            enabled: true,
            type: watermarkType,
            position: watermarkPosition,
            size: watermarkSize,
            opacity: watermarkOpacity
          };
          
          if (watermarkType === 'image' && watermarkLogo) {
            // Convertir le logo en buffer pour le backend
            const logoArrayBuffer = await watermarkLogo.arrayBuffer();
            backendOptions.watermark.image = Array.from(new Uint8Array(logoArrayBuffer));
          } else if (watermarkType === 'text' && watermarkText) {
            backendOptions.watermark.text = watermarkText;
            backendOptions.watermark.color = watermarkColor;
            backendOptions.watermark.font = watermarkFont;
          }
        }
        
        const result = await window.electronAPI.saveFile(
          Array.from(uint8Array), 
          outputPath,
          formatOverride,
          qualityToUse,
          keepMetadata,
          false, // preserveModificationTime
          inputPath,
          backendOptions
        );
        
        if (result.success) {
          // Retourner l'objet complet pour que le frontend puisse utiliser finalSize
          return {
            success: true,
            path: result.path,
            finalSize: result.finalSize || result.size,
            size: result.finalSize || result.size
          };
        } else {
          console.error('[SaveFile] Erreur lors de la sauvegarde:', result.error);
          throw new Error(result.error || 'Erreur lors de la sauvegarde');
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        // Fallback sur téléchargement
        return downloadFile(blob, getOutputPreview(fileData.name, formatOverride));
      }
    } else {
      // Pas de dossier disponible : fallback sur téléchargement
      console.warn(`Dossier non disponible pour ${fileData.name}, utilisation du téléchargement`);
      return downloadFile(blob, getOutputPreview(fileData.name, formatOverride));
    }
  };

  // Fonction pour télécharger un fichier (fallback)
  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // Retourner un objet cohérent avec la taille du blob (fallback, donc taille approximative)
    return { 
      success: true, 
      path: filename,
      finalSize: blob.size,
      size: blob.size
    };
  };

  // Fonction pour calculer l'estimation de taille (rapide, pour preview)
  const calculateEstimatedSize = async () => {
    if (files.length === 0) {
      setEstimatedSize(0);
      return;
    }

    // Prendre le premier fichier pour l'estimation
    const firstFile = files[0];
    
    // Vérifier que le fichier est valide
    if (!firstFile || !firstFile.file) {
      setEstimatedSize(0);
      return;
    }

    try {
      const result = await processFile(firstFile, {
        format: compressionFormat,
        quality: compressionQuality,
        resizeMode: resizeMode,
        resizeValue: resizeMode === 'percentage' ? resizePercentage : 100,
        resizeWidth: resizeMode === 'dimensions' ? (resizeWidth === '' || resizeWidth === null || resizeWidth === undefined ? null : (typeof resizeWidth === 'number' ? resizeWidth : parseInt(resizeWidth))) : null,
        resizeHeight: resizeMode === 'dimensions' ? (resizeHeight === '' || resizeHeight === null || resizeHeight === undefined || resizeHeight === 'Auto' ? null : (typeof resizeHeight === 'number' ? resizeHeight : parseInt(resizeHeight))) : null,
        watermarkEnabled,
        watermarkText,
        watermarkOpacity,
        watermarkPosition,
        watermarkSize,
        watermarkLogo: watermarkLogo,
        watermarkType,
        watermarkFont,
        watermarkColor,
        backgroundFill,
        backgroundColor,
        suffix: outputSuffix,
      });
      setEstimatedSize(result.size);
    } catch (error) {
      console.warn('Erreur estimation (utilisation du calcul théorique):', error);
      // Fallback sur calcul théorique pour le premier fichier
      try {
        const firstFileSize = firstFile.size || 0;
        if (firstFileSize === 0) {
          setEstimatedSize(0);
          return;
        }
        const qualityFactor = compressionQuality / 100;
        const formatFactor = compressionFormat === 'Original' ? 1 : 
                             compressionFormat === 'AVIF' ? 0.6 : 
                             compressionFormat === 'WebP' ? 0.7 : 
                             compressionFormat === 'JPEG' ? 0.8 : 
                             compressionFormat === 'PNG' ? 0.95 : 0.9;
        // Estimation basée sur le redimensionnement (simplifié)
        let resizeFactor = 1;
        if (resizeMode === 'percentage') {
          resizeFactor = resizePercentage / 100;
        } else if (resizeWidth && resizeWidth < 1920) {
          resizeFactor = resizeWidth / 1920;
        }
        setEstimatedSize(firstFileSize * qualityFactor * formatFactor * resizeFactor);
      } catch (fallbackError) {
        console.error('Erreur dans le calcul théorique:', fallbackError);
        setEstimatedSize(0);
      }
    }
  };

  // Debounce pour l'estimation en temps réel
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateEstimatedSize();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    files,
    compressionFormat,
    compressionQuality,
    resizeMode,
    resizeWidth,
    resizeHeight,
    resizePercentage,
    backgroundFill,
    backgroundColor,
    watermarkEnabled,
    watermarkText,
    watermarkOpacity,
    watermarkPosition,
    watermarkSize,
    watermarkLogo,
    watermarkType,
    watermarkFont,
    watermarkColor,
  ]);

  // Fonction pour générer le preview du nom de fichier
  const getOutputPreview = (originalName, formatOverride = null) => {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const formatToUse = formatOverride || compressionFormat;
    let ext;
    if (formatToUse === 'Original') {
      ext = originalName.split('.').pop();
    } else {
      // Mapper les formats aux extensions correctes
      const extensionMap = {
        'AVIF': 'avif',
        'avif': 'avif', // Support minuscule aussi
        'WebP': 'webp',
        'JPEG': 'jpg',
        'PNG': 'png',
        'SVG': 'svg'
      };
      ext = extensionMap[formatToUse] || formatToUse.toLowerCase();
    }
    // Ajouter préfixe et suffixe
    const outputName = `${outputPrefix}${nameWithoutExt}${outputSuffix}.${ext}`;
    return outputName;
  };

  // Fonction pour révéler un fichier dans le Finder/Explorer
  const handleReveal = async (file) => {
    if (!file.savedPath || !window.electronAPI) {
      console.warn('Chemin non disponible pour révéler le fichier');
      return;
    }
    
    try {
      // Extraire le dossier parent du fichier
      const pathSeparator = file.savedPath.includes('\\') ? '\\' : '/';
      const lastSeparator = Math.max(
        file.savedPath.lastIndexOf('/'),
        file.savedPath.lastIndexOf('\\')
      );
      
      if (lastSeparator > 0) {
        const folderPath = file.savedPath.substring(0, lastSeparator);
        await window.electronAPI.openFolder(folderPath);
      }
    } catch (error) {
      console.error('Erreur lors de la révélation du fichier:', error);
    }
  };

  // Fonction pour filtrer et trier les fichiers selon l'onglet actif
  const getFilteredFiles = () => {
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
    
    // Appliquer le tri
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'gain':
          const gainA = a.compressionRatio || 0;
          const gainB = b.compressionRatio || 0;
          return gainB - gainA; // Tri décroissant
        case 'size':
          const sizeA = a.compressedSize || a.size;
          const sizeB = b.compressedSize || b.size;
          return sizeA - sizeB; // Tri croissant
        default:
          return 0;
      }
    });
    
    return sorted;
  };

  // Fonction pour gérer le logo du filigrane
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setWatermarkLogo(file);
      setWatermarkLogoName(file.name);
    }
  };

  // Fonction pour supprimer le logo
  const handleRemoveLogo = () => {
    setWatermarkLogo(null);
    setWatermarkLogoName(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  // Fonction pour vider la liste
  const handleClearFiles = () => {
    // Nettoyer les URLs
    files.forEach(file => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });
    setFiles([]);
  };

  // Calcul des stats pour les filtres
  const filterStats = {
    all: files.length,
    optimized: files.filter(f => f.compressed && f.status === 'done').length,
    pending: files.filter(f => f.status === 'pending' || f.status === 'processing').length,
    errors: files.filter(f => f.status === 'error').length,
  };

  // Fonction pour exporter tout (BATCH PROCESSING - TOUTES LES IMAGES)
  const handleExportAll = async () => {
    if (files.length === 0 || isProcessing) return;
    
    // VÉRIFICATION STRICTE DU QUOTA - BLOQUAGE TOTAL
    if (!isPro && quotaUsed >= quotaLimit) {
      console.warn('[ExportAll] ❌ BLOQUAGE : Quota atteint', quotaUsed, '/', quotaLimit);
      // Ouvrir la modale d'activation de licence
      setShowActivationForm(true);
      return; // STOPPE TOUT ICI - Pas de compression possible
    }
    
    // Vérifier le quota côté backend pour s'assurer de la cohérence
    if (window.electronAPI && window.electronAPI.checkQuota) {
      try {
        const quota = await window.electronAPI.checkQuota();
        setQuotaUsed(quota.count || 0);
        setQuotaLimit(quota.limit || 30);
        setQuotaAllowed(quota.allowed || false);
        
        // Vérification supplémentaire côté backend (double sécurité)
        if (!quota.allowed || (!quota.isPro && quota.count >= quota.limit)) {
          console.warn('[ExportAll] ❌ BLOQUAGE BACKEND : Quota atteint', quota.count, '/', quota.limit);
          setShowActivationForm(true);
          return; // STOPPE TOUT ICI
        }
      } catch (error) {
        console.error('[ExportAll] Erreur lors de la vérification du quota:', error);
        // En cas d'erreur, on bloque par sécurité si on est en mode TRIAL
        if (!isPro) {
          console.warn('[ExportAll] ❌ BLOQUAGE PAR SÉCURITÉ : Erreur de vérification quota');
          return; // Blocage par sécurité
        }
      }
    }
    
    setIsProcessing(true);
    setProgress(0);

    // Préparer les dimensions : passer null si vides pour conserver les dimensions originales
    let finalResizeWidth = null;
    if (resizeWidth !== '' && resizeWidth !== null && resizeWidth !== undefined) {
      if (typeof resizeWidth === 'number') {
        finalResizeWidth = resizeWidth;
      } else {
        const parsed = parseInt(resizeWidth);
        if (!isNaN(parsed)) {
          finalResizeWidth = parsed;
        }
      }
    }
    
    let finalResizeHeight = null;
    if (resizeHeight !== 'Auto' && resizeHeight !== '' && resizeHeight !== null && resizeHeight !== undefined) {
      if (typeof resizeHeight === 'number') {
        finalResizeHeight = resizeHeight;
      } else {
        const parsed = parseInt(resizeHeight);
        if (!isNaN(parsed)) {
          finalResizeHeight = parsed;
        }
      }
    }
    
    // Déterminer la qualité à utiliser
    // Pour "Original", on applique la compression au format original de l'image
    const finalQuality = compressionQuality;
    
      const config = {
      format: compressionFormat,
      quality: finalQuality,
      resizeMode: resizeMode, // 'dimensions' ou 'percentage'
      resizeValue: resizeMode === 'percentage' ? resizePercentage : 100, // Pourcentage si mode percentage, sinon non utilisé
      resizeWidth: resizeMode === 'dimensions' ? finalResizeWidth : null, // null si mode percentage
      resizeHeight: resizeMode === 'dimensions' ? finalResizeHeight : null, // null si mode percentage
      watermarkEnabled,
      watermarkText,
      watermarkOpacity,
      watermarkPosition,
      watermarkSize,
      watermarkLogo: watermarkLogo,
      watermarkType,
      watermarkFont,
      watermarkColor,
      backgroundFill,
      backgroundColor,
      suffix: outputSuffix,
    };

    let successCount = 0;
    let errorCount = 0;
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    let firstDestinationFolder = null;
    let quotaLimitReached = false; // Flag pour indiquer si on a atteint la limite
    const totalFiles = files.length;

    // Traiter TOUTES les images séquentiellement
    for (let i = 0; i < totalFiles; i++) {
      const fileData = files[i];
      
      // VÉRIFICATION AVANT CHAQUE FICHIER : Arrêter si quota atteint (TRIAL uniquement)
      if (!isPro) {
        // Re-vérifier le quota avant chaque traitement pour être sûr
        if (window.electronAPI && window.electronAPI.checkQuota) {
          try {
            const quotaCheck = await window.electronAPI.checkQuota();
            if (!quotaCheck.allowed || quotaCheck.count >= quotaCheck.limit) {
              console.warn('[ExportAll] ⚠️ QUOTA ATTEINT avant traitement. Arrêt immédiat.');
              setQuotaUsed(quotaCheck.count);
              setQuotaAllowed(false);
              // Marquer les fichiers restants (y compris celui-ci) comme non traités
              quotaLimitReached = true; // Marquer que la limite a été atteinte
              const remainingFiles = files.slice(i);
              if (remainingFiles.length > 0) {
                setFiles(prev => prev.map(f => {
                  const isRemaining = remainingFiles.some(rf => rf.id === f.id);
                  if (isRemaining && f.status !== 'done') {
                    return { ...f, status: 'pending' };
                  }
                  return f;
                }));
              }
              // ARRÊTER LA BOUCLE IMMÉDIATEMENT
              break;
            }
            // Mettre à jour le quota utilisé au cas où
            setQuotaUsed(quotaCheck.count);
          } catch (error) {
            console.error('[ExportAll] Erreur lors de la vérification du quota:', error);
          }
        }
        
        // Double vérification avec le state (fail-safe)
        if (quotaUsed >= quotaLimit) {
          console.warn('[ExportAll] ⚠️ QUOTA ATTEINT (vérification state). Arrêt immédiat.');
          quotaLimitReached = true; // Marquer que la limite a été atteinte
          // ARRÊTER LA BOUCLE IMMÉDIATEMENT
          break;
        }
      }
      
      try {
        // Mettre à jour le statut du fichier à 'processing'
        setFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, status: 'processing' }
            : f
        ));

        // Traiter le fichier (compression)
        const result = await processFile(fileData, config);

        // Générer le nom de fichier de sortie avec suffixe (utiliser le format réel si fallback)
        const outputFilename = getOutputPreview(fileData.name, result.actualFormat);

        // Sauvegarder automatiquement dans le dossier source (SANS DIALOGUE)
        // Passer aussi la qualité et les options pour la conversion backend
        const backendOptions = {};
        
        // Options de redimensionnement
        if (config.resizeMode === 'dimensions' && (config.resizeWidth || config.resizeHeight)) {
          backendOptions.resize = {
            mode: 'dimensions',
            width: config.resizeWidth ? parseInt(config.resizeWidth) : null,
            height: config.resizeHeight && config.resizeHeight !== 'Auto' ? parseInt(config.resizeHeight) : null
          };
        } else if (config.resizeMode === 'percentage' && config.resizeValue !== 100) {
          backendOptions.resize = {
            mode: 'percentage',
            value: config.resizeValue
          };
        }
        
        // Option de remplissage (Background Fill)
        if (config.backgroundFill && config.backgroundColor) {
          backendOptions.fillColor = config.backgroundColor;
        }
        
        // Options de filigrane
        if (config.watermarkEnabled) {
          backendOptions.watermark = {
            enabled: true,
            type: config.watermarkType,
            position: config.watermarkPosition,
            size: config.watermarkSize,
            opacity: config.watermarkOpacity
          };
          
          if (config.watermarkType === 'image' && config.watermarkLogo) {
            // Convertir le logo en buffer pour le backend
            const logoArrayBuffer = await config.watermarkLogo.arrayBuffer();
            backendOptions.watermark.image = Array.from(new Uint8Array(logoArrayBuffer));
          } else if (config.watermarkType === 'text' && config.watermarkText) {
            backendOptions.watermark.text = config.watermarkText;
            backendOptions.watermark.color = config.watermarkColor;
            backendOptions.watermark.font = config.watermarkFont;
          }
        }
        
        const saveResult = await saveFileToSourceFolder(result.blob, fileData, result.actualFormat, config.quality, backendOptions);

        // Récupérer le chemin de sauvegarde (saveResult est maintenant toujours un objet avec success/path/finalSize)
        const savedPath = (saveResult && saveResult.path) ? saveResult.path : (typeof saveResult === 'string' ? saveResult : null);

        // Vérifier que la sauvegarde a réussi (saveResult est maintenant un objet avec success/path/finalSize)
        const saveSuccess = saveResult && (
          (typeof saveResult === 'object' && (saveResult.success === true || saveResult.path)) ||
          (typeof saveResult === 'string' && saveResult.length > 0)
        );

        if (!saveSuccess) {
          throw new Error('Échec de la sauvegarde du fichier');
        }

        // Calculer le gain réel avec la taille FINALE du fichier sauvegardé SUR LE DISQUE
        // Le backend retourne maintenant la taille réelle du fichier sur le disque (après safety check PNG)
        const originalSize = fileData.size;
        // Utiliser la taille finale sur disque retournée par le backend (priorité à finalSize, puis size)
        const compressedSize = (saveResult && typeof saveResult === 'object' && (saveResult.finalSize || saveResult.size)) 
          ? (saveResult.finalSize || saveResult.size) 
          : result.size;
        const gain = originalSize > 0 
          ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
          : 0;

        // Collecter les statistiques
        totalOriginalSize += originalSize;
        totalCompressedSize += compressedSize;
        
        // Stocker le premier dossier de destination (tous les fichiers sont dans le même dossier source)
        if (!firstDestinationFolder && savedPath && typeof savedPath === 'string') {
          // Extraire le dossier parent du chemin de sauvegarde
          // Ignorer si c'est juste un nom de fichier (pas de chemin complet)
          const pathSeparator = savedPath.includes('\\') ? '\\' : '/';
          const lastSeparator = Math.max(
            savedPath.lastIndexOf('/'),
            savedPath.lastIndexOf('\\')
          );
          // Ne considérer que les chemins absolus (qui contiennent un séparateur)
          if (lastSeparator > 0) {
            firstDestinationFolder = savedPath.substring(0, lastSeparator);
          }
          // Si lastSeparator <= 0, c'est juste un nom de fichier, on laisse firstDestinationFolder à null
        }

        // Vérifier si le fichier a été écrasé (même chemin que l'original)
        // Un fichier est écrasé si :
        // 1. Le chemin de sortie correspond au chemin d'entrée (même fichier)
        // 2. OU si le nom de fichier de sortie correspond au nom d'entrée (sans préfixe/suffixe)
        let isOverwritten = false;
        if (fileData.path && savedPath) {
          const normalizedOriginal = fileData.path.toLowerCase().replace(/\\/g, '/');
          const normalizedSaved = savedPath.toLowerCase().replace(/\\/g, '/');
          
          // Comparer les chemins complets
          if (normalizedOriginal === normalizedSaved) {
            isOverwritten = true;
          } else {
            // Comparer juste les noms de fichiers (au cas où le chemin serait légèrement différent)
            const originalFileName = fileData.path.split(/[/\\]/).pop()?.toLowerCase();
            const savedFileName = savedPath.split(/[/\\]/).pop()?.toLowerCase();
            const originalNameWithoutExt = fileData.name.toLowerCase().replace(/\.[^/.]+$/, '');
            const savedNameWithoutExt = savedFileName?.replace(/\.[^/.]+$/, '');
            
            // Si le nom de fichier sauvegardé correspond au nom d'origine (sans préfixe/suffixe)
            // et que préfixe/suffixe sont vides, alors c'est un écrasement
            if (originalNameWithoutExt === savedNameWithoutExt && 
                outputPrefix === '' && outputSuffix === '') {
              isOverwritten = true;
            }
          }
        }
        
        // Si le fichier a été écrasé, créer un nouveau File object à partir du blob
        let updatedFile = fileData.file;
        let updatedPreviewUrl = fileData.previewUrl;
        
        if (isOverwritten && result.blob) {
          try {
            // Créer un nouveau File object à partir du blob sauvegardé
            const newFile = new File([result.blob], fileData.name, { 
              type: result.blob.type || fileData.type 
            });
            
            // Révoquer l'ancienne previewUrl
            if (fileData.previewUrl) {
              URL.revokeObjectURL(fileData.previewUrl);
            }
            
            // Créer une nouvelle previewUrl à partir du nouveau File
            updatedFile = newFile;
            updatedPreviewUrl = URL.createObjectURL(newFile);
          } catch (error) {
            console.warn('[ExportAll] Erreur lors de la mise à jour du File object:', error);
            // En cas d'erreur, garder les valeurs originales
          }
        }

        // Mettre à jour le fichier dans le state
        setFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? {
                ...f,
                file: updatedFile,
                previewUrl: updatedPreviewUrl,
                size: isOverwritten ? compressedSize : f.size, // Mettre à jour la taille si écrasé
                status: 'done',
                compressed: true,
                compressionRatio: gain,
                compressedSize: compressedSize,
                compressedBlob: result.blob,
                outputFilename: outputFilename,
                savedPath: savedPath,
              }
            : f
        ));

        // Incrémenter le quota après une compression réussie (TRIAL uniquement)
        // On incrémente le quota si la sauvegarde a réussi et que l'utilisateur n'est pas PRO
        if (window.electronAPI && window.electronAPI.incrementQuota && saveSuccess && !isPro) {
          try {
            const quotaResult = await window.electronAPI.incrementQuota();
            
            // Ne mettre à jour le quota QUE si le backend a confirmé le succès et que l'utilisateur n'est pas PRO
            if (quotaResult && quotaResult.success === true && !quotaResult.isPro) {
              const newCount = quotaResult.count !== undefined && quotaResult.count !== null ? quotaResult.count : 0;
              // Utiliser la fonction de mise à jour avec callback pour éviter les problèmes de closure
              setQuotaUsed(prevCount => {
                const finalCount = quotaResult.count !== undefined && quotaResult.count !== null ? quotaResult.count : (prevCount + 1);
                return finalCount;
              });
              
              // VÉRIFICATION CRITIQUE : Arrêter immédiatement si la limite est atteinte (TRIAL uniquement)
              if (!isPro && newCount >= quotaLimit) {
                console.warn('[ExportAll] ⚠️ LIMITE DE QUOTA ATTEINTE! Arrêt immédiat du traitement.');
                setQuotaAllowed(false);
                quotaLimitReached = true; // Marquer que la limite a été atteinte
                // Marquer les fichiers restants comme non traités
                const remainingFiles = files.slice(i + 1);
                if (remainingFiles.length > 0) {
                  setFiles(prev => prev.map(f => {
                    const isRemaining = remainingFiles.some(rf => rf.id === f.id);
                    if (isRemaining && f.status !== 'done') {
                      return { ...f, status: 'pending' };
                    }
                    return f;
                  }));
                }
                // ARRÊTER LA BOUCLE IMMÉDIATEMENT
                break;
              }
            } else {
              // Le backend a bloqué l'incrémentation (quota atteint)
              console.warn('[ExportAll] ❌ Incrémentation bloquée par le backend:', quotaResult);
              if (quotaResult && quotaResult.error === 'Quota atteint') {
                setQuotaAllowed(false);
                quotaLimitReached = true; // Marquer que la limite a été atteinte
                // Marquer les fichiers restants comme non traités
                const remainingFiles = files.slice(i + 1);
                if (remainingFiles.length > 0) {
                  setFiles(prev => prev.map(f => {
                    const isRemaining = remainingFiles.some(rf => rf.id === f.id);
                    if (isRemaining && f.status !== 'done') {
                      return { ...f, status: 'pending' };
                    }
                    return f;
                  }));
                }
                // ARRÊTER LA BOUCLE IMMÉDIATEMENT
                break;
              }
            }
          } catch (error) {
            console.error('[ExportAll] Erreur lors de l\'incrémentation du quota:', error);
            // Si l'erreur est "Quota atteint", arrêter le traitement
            if (error.message && error.message.includes('Quota atteint')) {
              setQuotaAllowed(false);
              // ARRÊTER LA BOUCLE IMMÉDIATEMENT
              break;
            }
            // Sinon, continuer même en cas d'erreur (fail-safe)
          }
        } else {
          if (!window.electronAPI || !window.electronAPI.incrementQuota) {
            console.warn('[ExportAll] API Electron ou incrementQuota non disponible');
          }
          if (!saveSuccess) {
            console.warn('[ExportAll] Sauvegarde échouée, quota non incrémenté');
          }
        }

        successCount++;
      } catch (error) {
        console.error(`Erreur lors du traitement de ${fileData.name}:`, error);
        errorCount++;

        // Mettre à jour le statut du fichier en erreur
        setFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { 
                ...f, 
                status: 'error',
                error: error.message || 'Erreur lors du traitement'
              }
            : f
        ));
      }

      // Mettre à jour la barre de progression
      const progressValue = Math.round(((i + 1) / totalFiles) * 100);
      setProgress(progressValue);

      // Petit délai pour laisser l'UI se mettre à jour
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Afficher un résumé du traitement
    setIsProcessing(false);
    setProgress(0);

    // Vérifier si le traitement a été arrêté à cause du quota
    if (quotaLimitReached && !isPro) {
      const remainingCount = totalFiles - successCount - errorCount;
      // Récupérer le quota actuel depuis le backend pour avoir la valeur exacte
      let currentQuotaUsed = quotaUsed;
      if (window.electronAPI && window.electronAPI.checkQuota) {
        try {
          const quotaCheck = await window.electronAPI.checkQuota();
          currentQuotaUsed = quotaCheck.count || quotaUsed;
        } catch (error) {
          console.error('[ExportAll] Erreur lors de la récupération du quota:', error);
        }
      }
      // Afficher la modale de limite de quota
      setQuotaLimitStats({
        successCount,
        remainingCount,
        quotaUsed: currentQuotaUsed,
        quotaLimit
      });
      setShowQuotaLimitModal(true);
      return;
    }

    if (errorCount > 0) {
      // En cas d'erreur, ne pas afficher de modal
    }
    
    // Afficher la modal de succès uniquement s'il n'y a pas d'erreurs ET qu'il y a au moins un succès
    if (errorCount === 0 && successCount > 0) {
      // Calculer le gain total d'espace
      const savedSize = totalOriginalSize - totalCompressedSize;
      
      // Afficher la modale de succès
      setSuccessStats({
        successCount,
        savedSize: savedSize > 0 ? savedSize : 0
      });
      setDestinationFolder(firstDestinationFolder);
      setShowSuccessModal(true);
    }
  };

  return (
    <>
      {/* Styles personnalisés pour les sliders */}
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: rgb(139, 92, 246);
          cursor: pointer;
          border: 2px solid rgb(39, 39, 42);
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: rgb(139, 92, 246);
          cursor: pointer;
          border: 2px solid rgb(39, 39, 42);
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
        }
        input[type="range"]:hover::-webkit-slider-thumb {
          background: rgb(167, 139, 250);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3);
        }
        input[type="range"]:hover::-moz-range-thumb {
          background: rgb(167, 139, 250);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.3);
        }
      `}</style>
      
      <div 
        className="h-screen w-screen bg-zinc-950 text-zinc-200 flex overflow-hidden relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Barre de progression en haut */}
        {isProcessing && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-900 z-50">
            <div
              className="h-full bg-violet-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

      {/* Overlay de drag & drop */}
      {isDragOver && (
        <div className="absolute inset-0 bg-violet-600/10 border-4 border-dashed border-violet-600 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <UploadCloud className="mx-auto mb-4 text-violet-400 animate-bounce" size={64} />
            <p className="text-xl font-semibold text-violet-400">{t.messages.dropImagesHere}</p>
          </div>
        </div>
      )}
      
      {/* ============================================
          SIDEBAR GAUCHE - PARAMÈTRES
          ============================================ */}
      <aside className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col overflow-hidden">
        {/* Safe Area - Zone draggable en haut */}
        <div 
          className="w-full h-8 -webkit-app-region-drag"
          style={{ WebkitAppRegion: 'drag' }}
        />

        {/* Header de la Sidebar - BRANDING */}
        <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-900/50">
          {/* NOM + BADGE - Bloc compact */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <img 
                src={logoApp} 
                alt="PicRedux" 
                className="w-7 h-7 flex-shrink-0 rounded -mt-0.5"
              />
              <h2 className="text-lg font-bold text-zinc-100 leading-none tracking-tight">
                PicRedux
              </h2>
            </div>
            <div className="flex items-center gap-1.5 pl-8">
              {!isPro && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-1.5 py-px rounded border border-amber-500/20">
                  TRIAL
                </span>
              )}
              <span className="text-[10px] text-zinc-500 font-medium">v1.0</span>
            </div>
          </div>
          
          {/* Widget Quota - visible uniquement en mode TRIAL */}
          {!isPro && (
            <QuotaWidget 
              quotaUsed={quotaUsed} 
              quotaLimit={quotaLimit}
              onUpgrade={() => setShowActivationForm(true)}
              t={t}
            />
          )}
          
          {/* Badge de Statut Premium - visible uniquement en mode PRO */}
          {isPro && (
            <div className="mt-3 py-2 px-3 bg-violet-500/10 border border-violet-500/20 rounded-lg flex items-center justify-center gap-2">
              <Crown className="text-violet-300" size={14} />
              <span className="text-xs font-medium text-violet-300">{t.sidebar.licenseActive}</span>
            </div>
          )}
          
          {/* Formulaire d'activation - visible uniquement en mode TRIAL, en bas du logo */}
          {!isPro && (
            <div className="space-y-2">
              {!showActivationForm ? (
                <button
                  onClick={() => setShowActivationForm(true)}
                  className="w-full h-9 px-3 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-3 h-3" />
                  {t.sidebar.activateLicense}
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    ref={licenseKeyInputRef}
                    type="text"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    placeholder={t.sidebar.enterLicenseKey}
                    className="w-full h-9 px-3 text-xs bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                    disabled={isActivating}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isActivating) {
                        handleActivation();
                      }
                    }}
                  />
                  {activationError && (
                    <div className="flex items-start gap-2 p-2 rounded-md bg-red-500/10 border border-red-500/20">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-400 flex-1">{activationError}</p>
                    </div>
                  )}
                  {activationSuccess && (
                    <div className="flex items-start gap-2 p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-emerald-400 flex-1">{t.sidebar.licenseActivated}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleActivation}
                      disabled={isActivating || !licenseKey.trim()}
                      className="flex-1 h-9 px-3 text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                      {isActivating ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {t.sidebar.verifying}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          {t.sidebar.activate}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowActivationForm(false);
                        setActivationError(null);
                        setActivationSuccess(false);
                        setLicenseKey('');
                      }}
                      disabled={isActivating}
                      className="h-9 px-3 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md transition-colors flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <a
                    href="https://nebulatools.gumroad.com/l/nvwwb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-xs text-violet-400 hover:text-violet-300 underline"
                  >
                    {t.sidebar.getLicense}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Séparateur visuel après le header */}
        <div className="h-px bg-zinc-800/50"></div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {/* Section: Profils */}
          <Accordion 
            title={t.sidebar.profiles} 
            icon={Settings} 
            defaultOpen={true}
            tooltip={t.sidebar.profilesTooltip}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{t.sidebar.profile}</label>
                <div className="relative">
                  <select
                    value={profile}
                    onChange={(e) => {
                      setProfile(e.target.value);
                    }}
                    className="w-full h-9 px-3 pr-8 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600/50 focus:border-violet-600/50 appearance-none cursor-pointer"
                  >
                    <option value={PROFILE_SHOPIFY}>{t.sidebar.profileShopify}</option>
                    <option value={PROFILE_EMAIL}>{t.sidebar.profileEmail}</option>
                    <option value={PROFILE_SOCIAL_MEDIA}>{t.sidebar.profileSocialMedia}</option>
                    <option value={PROFILE_CUSTOM}>{t.sidebar.profileCustom}</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              {/* Menus déroulants pour Social Media */}
              {profile === PROFILE_SOCIAL_MEDIA && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{t.sidebar.socialPlatform}</label>
                    <div className="relative">
                      <select
                        value={socialPlatform}
                        onChange={(e) => {
                          setSocialPlatform(e.target.value);
                          // Réinitialiser le type quand on change de plateforme
                          if (e.target.value === 'Instagram') {
                            setSocialType('Post');
                          } else if (e.target.value === 'YouTube') {
                            setSocialType('Thumbnail');
                          } else if (e.target.value === 'Facebook') {
                            setSocialType('Post');
                          }
                        }}
                        className="w-full h-9 px-3 pr-8 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600/50 focus:border-violet-600/50 appearance-none cursor-pointer"
                      >
                        <option value="Instagram">{t.sidebar.socialInstagram}</option>
                        <option value="YouTube">{t.sidebar.socialYouTube}</option>
                        <option value="Facebook">{t.sidebar.socialFacebook}</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{t.sidebar.socialType}</label>
                    <div className="relative">
                      <select
                        value={socialType}
                        onChange={(e) => setSocialType(e.target.value)}
                        className="w-full h-9 px-3 pr-8 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600/50 focus:border-violet-600/50 appearance-none cursor-pointer"
                      >
                      {socialPlatform === 'Instagram' && (
                        <>
                          <option value="Post">{t.sidebar.socialInstagramPost}</option>
                          <option value="Story">{t.sidebar.socialInstagramStory}</option>
                          <option value="Reel">{t.sidebar.socialInstagramReel}</option>
                        </>
                      )}
                      {socialPlatform === 'YouTube' && (
                        <>
                          <option value="Thumbnail">{t.sidebar.socialYouTubeThumbnail}</option>
                          <option value="Channel Art">{t.sidebar.socialYouTubeChannelArt}</option>
                        </>
                      )}
                      {socialPlatform === 'Facebook' && (
                        <>
                          <option value="Post">{t.sidebar.socialFacebookPost}</option>
                          <option value="Cover">{t.sidebar.socialFacebookCover}</option>
                        </>
                      )}
                      </select>
                      <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </Accordion>

          {/* Section: Redimensionnement */}
          <Accordion 
            title={t.sidebar.resizing} 
            icon={Maximize2} 
            defaultOpen={false}
            tooltip={t.sidebar.resizingTooltip}
          >
            <div className="space-y-4">
              {/* Sélecteur de mode */}
              <div className="flex gap-1 h-9 p-1 bg-zinc-800/50 rounded-md border border-zinc-700">
                <button
                  onClick={() => setResizeMode('dimensions')}
                  className={cn(
                    "flex-1 h-full px-2 rounded text-xs font-medium transition-all flex items-center justify-center",
                    resizeMode === 'dimensions'
                      ? "bg-zinc-700 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  {t.sidebar.resizeModeDimensions}
                </button>
                <button
                  onClick={() => setResizeMode('percentage')}
                  className={cn(
                    "flex-1 h-full px-2 rounded text-xs font-medium transition-all flex items-center justify-center",
                    resizeMode === 'percentage'
                      ? "bg-zinc-700 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  {t.sidebar.resizeModePercentage}
                </button>
              </div>

              {/* Mode Dimensions */}
              {resizeMode === 'dimensions' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{t.sidebar.width}</label>
                      <input
                        type="number"
                        value={resizeWidth}
                        onChange={(e) => setResizeWidth(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder={t.sidebar.original}
                        className="w-full h-9 px-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600/50 focus:border-violet-600/50 placeholder:text-zinc-600 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        style={{
                          MozAppearance: 'textfield'
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{t.sidebar.height}</label>
                      <input
                        type="text"
                        value={resizeHeight}
                        onChange={(e) => setResizeHeight(e.target.value)}
                        placeholder={t.sidebar.original}
                        className="w-full h-9 px-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600/50 focus:border-violet-600/50 placeholder:text-zinc-600"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={keepAspectRatio}
                      onChange={(e) => setKeepAspectRatio(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={cn(
                      "relative w-4 h-4 rounded-sm border transition-all duration-200 flex items-center justify-center",
                      keepAspectRatio 
                        ? "bg-violet-600 border-violet-600" 
                        : "bg-zinc-800 border-zinc-600",
                      "group-focus-within:ring-2 group-focus-within:ring-violet-600/50 group-focus-within:ring-offset-1 group-focus-within:ring-offset-zinc-900"
                    )}>
                      {keepAspectRatio && (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      )}
                    </div>
                    <span className="text-sm text-zinc-300 break-words">{t.sidebar.keepAspectRatio}</span>
                  </label>

                  {/* Option Background Fill */}
                  <div className="space-y-3">
                    <label className={cn(
                      "flex items-center gap-2 cursor-pointer transition-all group",
                      profile === PROFILE_SOCIAL_MEDIA && backgroundFill && "ring-2 ring-violet-600/50 rounded-lg p-2 bg-violet-600/10"
                    )}>
                      <input
                        type="checkbox"
                        checked={backgroundFill}
                        onChange={(e) => setBackgroundFill(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={cn(
                        "relative w-4 h-4 rounded-sm border transition-all duration-200 flex items-center justify-center",
                        backgroundFill 
                          ? "bg-violet-600 border-violet-600" 
                          : "bg-zinc-800 border-zinc-600",
                        "group-focus-within:ring-2 group-focus-within:ring-violet-600/50 group-focus-within:ring-offset-1 group-focus-within:ring-offset-zinc-900"
                      )}>
                        {backgroundFill && (
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        )}
                      </div>
                      <span className={cn(
                        "text-sm",
                        profile === PROFILE_SOCIAL_MEDIA && backgroundFill ? "text-violet-300 font-medium" : "text-zinc-300"
                      )}>
                        <span className="break-words">{t.sidebar.backgroundFill}</span>
                        {profile === PROFILE_SOCIAL_MEDIA && (
                          <span className="ml-1 text-xs text-violet-400 whitespace-nowrap">({t.sidebar.recommended})</span>
                        )}
                      </span>
                    </label>

                    {/* Sélecteur de couleur pour Background Fill */}
                    {backgroundFill && (
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{t.sidebar.backgroundColor}</label>
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-full h-9 rounded-md border border-zinc-700 cursor-pointer bg-zinc-800"
                          style={{
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            appearance: 'none',
                          }}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Mode Percentage */}
              {resizeMode === 'percentage' && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{t.sidebar.resizeModePercentage}</span>
                      <span className="text-xs font-mono text-violet-400">{resizePercentage}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="200"
                      value={resizePercentage}
                      onChange={(e) => setResizePercentage(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${((resizePercentage - 1) / 199) * 100}%, rgb(39, 39, 42) ${((resizePercentage - 1) / 199) * 100}%, rgb(39, 39, 42) 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-zinc-600 mt-1">
                      <span>1%</span>
                      <span>200%</span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer opacity-50">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled={true}
                      className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-violet-600 focus:ring-violet-600/50 cursor-not-allowed flex-shrink-0"
                    />
                    <span className="text-sm text-zinc-300 break-words">{t.sidebar.keepAspectRatio}</span>
                  </label>
                </>
              )}
            </div>
          </Accordion>

          {/* Section: Format & Qualité */}
          <Accordion 
            title={t.sidebar.formatQuality} 
            icon={Zap} 
            defaultOpen={true}
            tooltip={t.sidebar.formatQualityTooltip}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{t.sidebar.format}</label>
                <div className="relative">
                  <select
                    value={compressionFormat}
                    onChange={(e) => setCompressionFormat(e.target.value)}
                    className="w-full h-9 px-3 pr-8 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600/50 focus:border-violet-600/50 appearance-none cursor-pointer"
                  >
                    <option value="Original">Original</option>
                    <option value="AVIF">AVIF</option>
                    <option value="WebP">WebP</option>
                    <option value="JPEG">JPEG</option>
                    <option value="PNG">PNG</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              {/* Slider de qualité */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide">{t.sidebar.quality}</label>
                  <span className="text-xs font-mono text-violet-400">{compressionQuality}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={compressionQuality}
                  onChange={(e) => {
                    setCompressionQuality(Number(e.target.value));
                  }}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer transition-all"
                  style={{
                    background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${compressionQuality}%, rgb(39, 39, 42) ${compressionQuality}%, rgb(39, 39, 42) 100%)`
                  }}
                />
              </div>

              {/* Checkbox Supprimer les métadonnées */}
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={removeMetadata}
                  onChange={(e) => setRemoveMetadata(e.target.checked)}
                  className="sr-only"
                />
                <div className={cn(
                  "relative w-4 h-4 rounded-sm border transition-all duration-200 flex items-center justify-center",
                  removeMetadata 
                    ? "bg-violet-600 border-violet-600" 
                    : "bg-zinc-800 border-zinc-600",
                  "group-focus-within:ring-2 group-focus-within:ring-violet-600/50 group-focus-within:ring-offset-1 group-focus-within:ring-offset-zinc-900"
                )}>
                  {removeMetadata && (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-sm text-zinc-300 break-words">{t.sidebar.removeMetadata}</span>
                </div>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{t.sidebar.prefix}</label>
                  <input
                    type="text"
                    value={outputPrefix}
                    onChange={(e) => setOutputPrefix(e.target.value)}
                    placeholder=""
                    className="w-full h-9 px-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600/50 focus:border-violet-600/50 placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{t.sidebar.suffix}</label>
                  <input
                    type="text"
                    value={outputSuffix}
                    onChange={(e) => setOutputSuffix(e.target.value)}
                    placeholder="_optimized"
                    className="w-full h-9 px-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600/50 focus:border-violet-600/50 placeholder:text-zinc-600"
                  />
                </div>
              </div>
              {/* Preview du nom de fichier */}
              <p className="text-xs text-zinc-500 mt-1.5">
                {t.sidebar.example}: {outputPrefix || ''}image_01{outputSuffix || (language === 'fr' ? '_optimisé' : '_optimized')}.{compressionFormat === 'Original' ? 'jpg' : (compressionFormat === 'JPEG' ? 'jpg' : compressionFormat.toLowerCase())}
              </p>
            </div>
          </Accordion>

          {/* Section: Filigrane */}
          <Accordion 
            title={t.sidebar.watermark} 
            icon={ImageIcon} 
            defaultOpen={false}
            tooltip={t.sidebar.watermarkTooltip}
          >
            <div className="space-y-4">
              {/* Toggle Activer */}
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={watermarkEnabled}
                    onChange={(e) => setWatermarkEnabled(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={cn(
                    "w-11 h-6 rounded-full transition-colors duration-200 relative",
                    watermarkEnabled ? "bg-violet-600" : "bg-zinc-700"
                  )}>
                    <div className={cn(
                      "absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full transition-all duration-200 shadow-sm",
                      watermarkEnabled ? "left-[22px]" : "left-[2px]"
                    )} />
                  </div>
                </div>
                <span className="text-sm text-zinc-300">{t.sidebar.watermarkEnable}</span>
              </label>

              {watermarkEnabled && (
                <>
                  {/* Sélecteur de type (Image/Texte) */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{t.sidebar.watermarkType}</label>
                    <div className="flex gap-1 h-9 p-1 bg-zinc-800/50 rounded-md border border-zinc-700">
                      <button
                        onClick={() => setWatermarkType('image')}
                        className={cn(
                          "flex-1 h-full px-2 rounded text-xs font-medium transition-all flex items-center justify-center",
                          watermarkType === 'image'
                            ? "bg-zinc-700 text-white shadow-sm"
                            : "text-zinc-400 hover:text-zinc-200"
                        )}
                      >
                        {t.sidebar.watermarkTypeImage}
                      </button>
                      <button
                        onClick={() => setWatermarkType('text')}
                        className={cn(
                          "flex-1 h-full px-2 rounded text-xs font-medium transition-all flex items-center justify-center",
                          watermarkType === 'text'
                            ? "bg-zinc-700 text-white shadow-sm"
                            : "text-zinc-400 hover:text-zinc-200"
                        )}
                      >
                        {t.sidebar.watermarkTypeText}
                      </button>
                    </div>
                  </div>

                  {/* Upload Logo ou Input Texte selon le type */}
                  {watermarkType === 'image' ? (
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{t.sidebar.watermarkSelectImage}</label>
                      {watermarkLogoName ? (
                        <div className="flex items-center gap-2 h-9 px-3 bg-zinc-800 border border-zinc-700 rounded-md">
                          <span className="text-sm text-zinc-200 flex-1 truncate">{watermarkLogoName}</span>
                          <button
                            onClick={handleRemoveLogo}
                            className="text-zinc-400 hover:text-zinc-200 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => logoInputRef.current?.click()}
                          className="w-full h-9 px-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-300 text-sm hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <ImagePlus size={16} />
                          {t.sidebar.watermarkSelectImage}
                        </button>
                      )}
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Input texte */}
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{t.sidebar.watermarkText}</label>
                        <input
                          type="text"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          placeholder={t.sidebar.watermarkTextPlaceholder}
                          className="w-full h-9 px-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600/50 focus:border-violet-600/50 placeholder:text-zinc-600"
                        />
                      </div>

                      {/* Sélecteur de police */}
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{t.sidebar.watermarkFont}</label>
                        <div className="relative">
                          <select
                            value={watermarkFont}
                            onChange={(e) => setWatermarkFont(e.target.value)}
                            className="w-full h-9 px-3 pr-8 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600/50 focus:border-violet-600/50 appearance-none cursor-pointer"
                          >
                            <option value="Arial">Arial</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Palatino">Palatino</option>
                            <option value="Garamond">Garamond</option>
                            <option value="Comic Sans MS">Comic Sans MS</option>
                            <option value="Trebuchet MS">Trebuchet MS</option>
                            <option value="Impact">Impact</option>
                          </select>
                          <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Choix de couleur */}
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{t.sidebar.watermarkColor}</label>
                        <input
                          type="color"
                          value={watermarkColor}
                          onChange={(e) => setWatermarkColor(e.target.value)}
                          className="w-full h-9 rounded-md border border-zinc-700 cursor-pointer bg-zinc-800"
                          style={{
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            appearance: 'none',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Groupe de réglages du filigrane */}
                  <div className="space-y-4 pt-2 border-t border-zinc-800">
                    {/* Position du filigrane - Pattern Android */}
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{t.sidebar.watermarkPosition}</label>
                      <div className="relative w-full aspect-square bg-zinc-950/50 rounded-md border border-zinc-800/50 p-4">
                        {/* Icône d'image au centre (discrète et grisée) */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <ImageIcon size={48} className="text-zinc-800/30" />
                        </div>
                        {/* Lignes de repère horizontales */}
                        <div className="absolute inset-0 flex flex-col justify-between py-4">
                          <div className="w-full h-[1px] bg-zinc-700/20"></div>
                          <div className="w-full h-[1px] bg-zinc-700/20"></div>
                          <div className="w-full h-[1px] bg-zinc-700/20"></div>
                        </div>
                        {/* Lignes de repère verticales */}
                        <div className="absolute inset-0 flex justify-between px-4">
                          <div className="h-full w-[1px] bg-zinc-700/20"></div>
                          <div className="h-full w-[1px] bg-zinc-700/20"></div>
                          <div className="h-full w-[1px] bg-zinc-700/20"></div>
                        </div>
                        {/* Grille de points */}
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0 p-4">
                          {[
                            { value: 'top-left' },
                            { value: 'top-center' },
                            { value: 'top-right' },
                            { value: 'center-left' },
                            { value: 'center' },
                            { value: 'center-right' },
                            { value: 'bottom-left' },
                            { value: 'bottom-center' },
                            { value: 'bottom-right' },
                          ].map((pos) => {
                            const isActive = watermarkPosition === pos.value;
                            const showTextPreview = watermarkType === 'text' && watermarkText && watermarkText.trim() !== '';
                            
                            return (
                              <button
                                key={pos.value}
                                onClick={() => setWatermarkPosition(pos.value)}
                                className="flex items-center justify-center relative group"
                              >
                                {/* Point inactif */}
                                <div className={cn(
                                  "absolute w-2.5 h-2.5 rounded-full border transition-all duration-200",
                                  isActive
                                    ? "opacity-0 scale-0"
                                    : "border-zinc-600/60 bg-transparent group-hover:border-zinc-500"
                                )} />
                                {/* Point actif */}
                                <div className={cn(
                                  "absolute rounded-full transition-all duration-200 flex items-center justify-center",
                                  isActive
                                    ? "w-9 h-9 bg-violet-600 shadow-lg shadow-violet-600/50 scale-100 ring-2 ring-violet-600/30"
                                    : "w-0 h-0 scale-0"
                                )}>
                                  <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
                                </div>
                                {/* Aperçu du texte si mode texte et position active */}
                                {showTextPreview && isActive && (
                                  <div 
                                    className="absolute text-[8px] font-bold px-1 py-0.5 rounded whitespace-nowrap pointer-events-none z-10"
                                    style={{
                                      color: typeof watermarkColor === 'string' && watermarkColor.startsWith('#') ? watermarkColor : '#FFFFFF',
                                      opacity: watermarkOpacity / 100,
                                      fontFamily: watermarkFont,
                                    }}
                                  >
                                    {watermarkText}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Taille du logo/texte */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide">
                          {watermarkType === 'image' ? t.sidebar.watermarkLogoSize : t.sidebar.watermarkFontSize}
                        </label>
                        <span className="text-xs font-mono text-violet-400">{watermarkSize}%</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={watermarkSize}
                        onChange={(e) => setWatermarkSize(Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${((watermarkSize - 1) / 99) * 100}%, rgb(39, 39, 42) ${((watermarkSize - 1) / 99) * 100}%, rgb(39, 39, 42) 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-zinc-600 mt-1">
                        <span>1%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Opacité */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide">{t.sidebar.watermarkOpacity}</label>
                        <span className="text-xs font-mono text-violet-400">{watermarkOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={watermarkOpacity}
                        onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${watermarkOpacity}%, rgb(39, 39, 42) ${watermarkOpacity}%, rgb(39, 39, 42) 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-zinc-600 mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Accordion>

          {/* Section: Output */}
          <Accordion 
            title={t.sidebar.output} 
            icon={FolderOpen} 
            defaultOpen={false}
            tooltip={t.sidebar.outputTooltip}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{t.sidebar.outputDestination}</label>
                <div className="relative">
                  <select
                    value={outputDestination}
                    onChange={(e) => {
                      setOutputDestination(e.target.value);
                      if (e.target.value === 'custom' && window.electronAPI) {
                        // Ouvrir le sélecteur de dossier
                        window.electronAPI.selectFolder().then((result) => {
                          if (result && !result.canceled && result.filePaths && result.filePaths.length > 0) {
                            setCustomOutputFolder(result.filePaths[0]);
                          } else {
                            setOutputDestination('same');
                          }
                        }).catch((error) => {
                          console.error('Erreur lors de la sélection du dossier:', error);
                          setOutputDestination('same');
                        });
                      }
                    }}
                    className="w-full h-9 px-3 pr-8 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600/50 focus:border-violet-600/50 appearance-none cursor-pointer"
                  >
                    <option value="same">{t.sidebar.outputSameAsOriginal}</option>
                    <option value="custom">{t.sidebar.outputCustomFolder}</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              {outputDestination === 'custom' && customOutputFolder && (
                <div className="h-9 px-3 bg-zinc-800/50 border border-zinc-700 rounded-md flex items-center">
                  <p className="text-xs text-zinc-400 truncate" title={customOutputFolder}>
                    {customOutputFolder}
                  </p>
                </div>
              )}
            </div>
          </Accordion>
        </div>

        {/* Bouton "Lancer l'optimisation" fixé en bas */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900">
          {!isPro && quotaUsed >= quotaLimit ? (
            // Bouton bloqué si quota atteint (mode TRIAL)
            <button
              onClick={() => setShowActivationForm(true)}
              className={cn(
                "w-full px-3 py-2 text-sm text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
                "bg-zinc-700 hover:bg-zinc-600"
              )}
            >
              <Lock size={16} />
              {t.sidebar.limitReachedActivateLicenseButton}
            </button>
          ) : (
            // Bouton normal d'optimisation
            <button
              onClick={handleExportAll}
              disabled={files.length === 0 || isProcessing || (!isPro && quotaUsed >= quotaLimit)}
              className={cn(
                "w-full px-4 py-3 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
                files.length === 0 || isProcessing || (!isPro && quotaUsed >= quotaLimit)
                  ? "bg-zinc-700 opacity-50 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-500"
              )}
            >
              {isProcessing ? (
                <>
                  <Zap size={18} className="animate-pulse" />
                  {t.messages.processing}
                </>
              ) : files.length > 0 ? (
                <>
                  <Play size={18} />
                  {files.length === 1 
                    ? t.sidebar.optimizeFiles.replace('{count}', files.length)
                    : t.sidebar.optimizeFilesPlural.replace('{count}', files.length)
                  }
                </>
              ) : (
                <>
                  <Play size={18} />
                  {t.main.readyForOptimization}
                </>
              )}
            </button>
          )}
          
          {/* Sélecteur de langue */}
          <div className="mt-3 pt-3 border-t border-zinc-800">
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1.5">{t.sidebar.language}</label>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="w-full h-9 px-3 pr-8 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600/50 focus:border-violet-600/50 appearance-none cursor-pointer"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.code.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================
          ZONE PRINCIPALE - FICHIERS
          ============================================ */}
      <main className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
        {/* En-tête avec titre et actions */}
        <header className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-zinc-200">
                {files.length <= 1 ? t.main.file : t.main.files}
              </h1>
              <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-semibold rounded">
                {files.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <Plus size={14} />
                {t.main.add}
              </button>
              <button
                onClick={handleClearFiles}
                disabled={files.length === 0}
                className="px-3 py-1.5 border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={14} />
                {t.main.clearList}
              </button>
            </div>
          </div>
        </header>

        {/* Onglets de filtres et tri */}
        <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: t.main.all, count: filterStats.all },
                { id: 'optimized', label: t.main.optimized, count: filterStats.optimized },
                { id: 'pending', label: t.main.pending, count: filterStats.pending },
                { id: 'errors', label: t.main.errors, count: filterStats.errors },
              ]
              .filter(tab => tab.id !== 'errors' || tab.count > 0) // Masquer le bouton Erreurs si count === 0
              .map((tab) => {
                const isErrorTab = tab.id === 'errors';
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                      activeFilter === tab.id
                        ? isErrorTab
                          ? "bg-red-600 text-white"
                          : "bg-violet-600 text-white"
                        : isErrorTab
                          ? "bg-zinc-800 text-red-400 hover:text-red-300 hover:bg-zinc-700"
                          : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
                    )}
                  >
                    {tab.label}
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded font-semibold",
                      activeFilter === tab.id
                        ? "bg-white/20"
                        : isErrorTab
                          ? "bg-red-600/20 text-red-400"
                          : "bg-zinc-900"
                    )}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
            
            {/* Sélecteur de layout et menu de tri */}
            {getFilteredFiles().length > 0 && (
              <div className="flex items-center gap-3">
                {/* Sélecteur de layout */}
                <div className="flex items-center gap-1 border-r border-zinc-800 pr-3">
                  <Tooltip content={t.main.grid} position="bottom">
                    <button
                      onClick={() => {
                        setLayout('grid');
                        localStorage.setItem('picredux-layout', 'grid');
                      }}
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 relative",
                        "will-change-[background-color,border-color,color]",
                        layout === 'grid'
                          ? "bg-violet-600/20 text-violet-400 border border-violet-600/30"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-transparent"
                      )}
                      aria-label={t.main.grid}
                    >
                      <LayoutGrid size={18} className="relative" style={{ transform: 'translateZ(0)' }} />
                    </button>
                  </Tooltip>
                  <Tooltip content={t.main.list} position="bottom">
                    <button
                      onClick={() => {
                        setLayout('list');
                        localStorage.setItem('picredux-layout', 'list');
                      }}
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 relative",
                        "will-change-[background-color,border-color,color]",
                        layout === 'list'
                          ? "bg-violet-600/20 text-violet-400 border border-violet-600/30"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-transparent"
                      )}
                      aria-label={t.main.list}
                    >
                      <List size={18} className="relative" style={{ transform: 'translateZ(0)' }} />
                    </button>
                  </Tooltip>
                </div>
                
                {/* Menu de tri */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">{t.main.sortBy}:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-600/50 focus:border-violet-600/50"
                  >
                    <option value="name">{t.main.sortByName}</option>
                    <option value="gain">{t.main.sortByGain}</option>
                    <option value="size">{t.main.sortBySize}</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Zone de contenu */}
        <div className="flex-1 overflow-auto">
          {getFilteredFiles().length === 0 ? (
            /* Empty State avec drag & drop - Design minimaliste */
            <div 
              className="h-full flex items-center justify-center p-8"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-center max-w-md">
                <UploadCloud className="mx-auto mb-6 text-zinc-600" size={48} strokeWidth={1.5} />
                <h3 className="text-base font-medium text-zinc-300 mb-1.5 tracking-tight">
                  {activeFilter === 'all' ? t.main.noFiles : 
                   activeFilter === 'optimized' ? t.main.noOptimizedFiles :
                   activeFilter === 'pending' ? t.main.noPendingFiles :
                   t.main.noErrors}
                </h3>
                <p className="text-sm text-zinc-500 font-light">
                  {activeFilter === 'all' && t.main.dragImagesHere}
                </p>
              </div>
            </div>
          ) : layout === 'grid' ? (
            /* Grille de cartes responsive avec animation cascade */
            <div className="p-4 transition-opacity duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {getFilteredFiles().map((file, index) => (
                  <div
                    key={file.id}
                    style={{
                      animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
                    }}
                  >
                    <FileCard
                      file={file}
                      onRemove={handleRemoveFile}
                      onReveal={handleReveal}
                      t={t}
                      compressedThumbnail={compressedThumbnails[file.id]}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Mode liste avec lignes horizontales */
            <div className="transition-opacity duration-300">
              <div className="divide-y divide-zinc-800/50">
                {getFilteredFiles().map((file, index) => (
                  <div
                    key={file.id}
                    className="group"
                    style={{
                      animation: `fadeInUp 0.3s ease-out ${index * 0.03}s both`
                    }}
                  >
                    <FileListItem
                      file={file}
                      onRemove={handleRemoveFile}
                      onReveal={handleReveal}
                      t={t}
                      compressedThumbnail={compressedThumbnails[file.id]}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input file caché */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </main>
      </div>

      {/* Modale de succès */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        stats={successStats}
        onNewSession={() => setShowSuccessModal(false)}
        destinationFolder={destinationFolder}
        t={t}
      />

      {/* Modale de limite de quota */}
      <QuotaLimitModal
        isOpen={showQuotaLimitModal}
        onClose={() => setShowQuotaLimitModal(false)}
        onUpgrade={() => {
          setShowQuotaLimitModal(false);
          setShowActivationForm(true);
        }}
        stats={quotaLimitStats}
        t={t}
      />
    </>
  );
};

export default PicRedux;

