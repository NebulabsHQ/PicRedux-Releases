import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Image as ImageIcon, 
  Settings, 
  UploadCloud,
  Zap,
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
  Lock,
  Crown,
  Check,
  Square,
  Loader2,
  Globe
} from 'lucide-react';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import Input from './components/ui/Input';
import { cn } from './utils/cn';
import { formatFileSize as formatFileSizeUtil, getMimeType, getOptimalQuality, getOutputPreview as getOutputPreviewUtil } from './utils/formatters';
import { useFileManagement } from './hooks/useFileManagement';
import { useLanguage } from './useLanguage';
import { supportedLanguages } from './translations';
import logoApp from './assets/icon-512.png';

const PROFILE_SHOPIFY = 'Shopify / E-commerce';
const PROFILE_EMAIL = 'Email / Newsletter';
const PROFILE_SOCIAL_MEDIA = 'Social Media Presets';
const PROFILE_CUSTOM = 'Custom';

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
    const padding = 8;

    let top = 0;
    let left = 0;
    let transform = '';
    let finalPosition = position;

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

    let tooltipWidth = tooltipRect.width;
    let tooltipHeight = tooltipRect.height;

    if (finalPosition === 'right' || finalPosition === 'left') {
      let tooltipLeft, tooltipRight;
      
      if (finalPosition === 'right') {
        tooltipLeft = left;
        tooltipRight = left + tooltipWidth;
      } else {
        tooltipRight = left;
        tooltipLeft = left - tooltipWidth;
      }

      if (tooltipRight > viewportWidth - padding) {
        finalPosition = 'left';
        left = triggerRect.left - padding;
        transform = 'translate(-100%, -50%)';
        tooltipLeft = left - tooltipWidth;
        tooltipRight = left;
      }
      else if (tooltipLeft < padding) {
        finalPosition = 'right';
        left = triggerRect.right + padding;
        transform = 'translateY(-50%)';
        tooltipLeft = left;
        tooltipRight = left + tooltipWidth;
      }

      if (finalPosition === 'right' && tooltipRight > viewportWidth - padding) {
        left = viewportWidth - tooltipWidth - padding;
      } else if (finalPosition === 'left' && tooltipLeft < padding) {
        left = tooltipWidth + padding;
      }
    } else {
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

    if (finalPosition === 'top' || finalPosition === 'bottom') {
      let tooltipTop, tooltipBottom;
      
      if (finalPosition === 'top') {
        tooltipBottom = top;
        tooltipTop = top - tooltipHeight;
      } else {
        tooltipTop = top;
        tooltipBottom = top + tooltipHeight;
      }

      if (tooltipBottom > viewportHeight - padding) {
        finalPosition = 'top';
        top = triggerRect.top - padding;
        transform = 'translate(-50%, -100%)';
        tooltipBottom = top;
        tooltipTop = top - tooltipHeight;
      }
      else if (tooltipTop < padding) {
        finalPosition = 'bottom';
        top = triggerRect.bottom + padding;
        transform = 'translate(-50%, 0)';
        tooltipTop = top;
        tooltipBottom = top + tooltipHeight;
      }

      if (finalPosition === 'top' && tooltipTop < padding) {
        top = tooltipHeight + padding;
      } else if (finalPosition === 'bottom' && tooltipBottom > viewportHeight - padding) {
        top = viewportHeight - tooltipHeight - padding;
      }
    } else {
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
      const timeoutId = setTimeout(() => {
        updateTooltipPosition();
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

  const handleOpenFolder = async () => {
    if (!destinationFolder || !window.electronAPI) {
      return;
    }
    try {
      await window.electronAPI.openFolder(destinationFolder);
    } catch (error) {
    }
    onClose();
  };
  
  const isFolderButtonDisabled = !destinationFolder || !window.electronAPI;

  const handleNewSession = () => {
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
      <Card
        variant="elevated"
        className="max-w-md w-full p-6 space-y-4"
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
              {formatFileSizeUtil(stats.savedSize, t.units)}
            </div>
            <div className="text-sm text-zinc-500">
              {stats.successCount} {stats.successCount === 1 ? t.messages.imageOptimized : t.messages.imagesOptimized}
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col gap-2">
          {!isFolderButtonDisabled && (
            <Button
              onClick={handleOpenFolder}
              variant="primaryPurple"
              size="md"
              className="w-full"
            >
              <FolderOpen size={16} />
              {t.main.openFolder}
            </Button>
          )}
          <Button
            onClick={handleNewSession}
            variant="secondary"
            size="md"
            className="w-full"
          >
            <Plus size={16} />
            {t.main.newSession}
          </Button>
        </div>
      </Card>

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
  const isNearLimit = quotaUsed >= quotaLimit * 0.8;

  return (
    <div className="mt-3 rounded-lg bg-white/5 p-3 flex flex-row items-center justify-between gap-3 no-drag">
      {/* Left Side - Info */}
      <div className="flex flex-col flex-1">
        <span className="text-xs text-zinc-400">
          {t.sidebar.freeTrial} : {quotaUsed}/{quotaLimit}
        </span>
        {/* Progress bar with visible track */}
        <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1.5">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300 ease-out",
              isLimitReached 
                ? "bg-red-500" 
                : isNearLimit
                ? "bg-amber-500"
                : "bg-violet-500"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Right Side - Action Button */}
      <Button
        onClick={onUpgrade}
        variant="secondary"
        size="xs"
        className="no-drag flex-shrink-0"
      >
        {t.sidebar.activate}
      </Button>
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
      <Card
        variant="elevated"
        className="max-w-md w-full p-6 space-y-4"
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
          <Button
            onClick={onUpgrade}
            variant="primary"
            size="lg"
            className="w-full"
          >
            <Zap size={18} />
            {t.sidebar.activateLicenseUnlimited}
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            size="lg"
            className="w-full"
          >
            {t.sidebar.close}
          </Button>
        </div>
      </Card>

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
 * ActivationLicenseModal - Modale pour activer la licence
 */
const ActivationLicenseModal = ({ isOpen, onClose, licenseKey, setLicenseKey, handleActivation, isActivating, activationError, activationSuccess, licenseKeyInputRef, t }) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <Card
        variant="elevated"
        className="max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-violet-600/20 flex items-center justify-center">
            <Zap className="text-violet-400" size={24} />
          </div>
          <h2 className="text-xl font-semibold text-zinc-200">{t.sidebar.activateLicense}</h2>
          <button
            onClick={onClose}
            className="ml-auto text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulaire */}
        <div className="space-y-3">
          <Input
            ref={licenseKeyInputRef}
            type="text"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            placeholder={t.sidebar.enterLicenseKey}
            size="sm"
            className="w-full no-drag"
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
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800"></div>

        {/* Boutons d'action */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleActivation}
            disabled={isActivating || !licenseKey.trim()}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {isActivating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t.sidebar.verifying}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {t.sidebar.activate}
              </>
            )}
          </Button>
          <a
            href="https://nebulatools.gumroad.com/l/nvwwb"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs text-violet-400 hover:text-violet-300 underline"
          >
            {t.sidebar.getLicense}
          </a>
        </div>
      </Card>

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
      `}</style>
    </div>,
    document.body
  );
};

/**
 * FileListItem - Ligne de fichier pour le mode liste
 */
const FileListItem = ({ file, onRemove, onReveal, t, compressedThumbnail }) => {
  const formatFileSize = (bytes) => formatFileSizeUtil(bytes, t.units);
  const [isHovered, setIsHovered] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

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
        {file.previewUrl ? (
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
        ) : (
          /* Fallback icon for HEIC/TIFF files that can't be previewed */
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
            <ImageIcon size={20} className="text-zinc-500" />
          </div>
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
  const formatFileSize = (bytes) => formatFileSizeUtil(bytes, t.units);
  const [isHovered, setIsHovered] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

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
    <Card
      variant="hover"
      className={cn(
        "overflow-hidden",
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
        {file.previewUrl ? (
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
        ) : (
          /* Fallback icon for HEIC/TIFF files that can't be previewed */
          <div className="w-full h-full bg-zinc-800/50 flex items-center justify-center">
            <ImageIcon size={48} className="text-zinc-600" />
          </div>
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
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onReveal(file);
                }}
                variant="icon"
                size="icon"
                aria-label="Révéler"
              >
                <FolderOpen size={14} />
              </Button>
            </Tooltip>
          )}
          
          {/* Bouton de suppression */}
          <Tooltip content="Supprimer de la liste" position="top">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              variant="iconDanger"
              size="icon"
              aria-label="Supprimer"
            >
              <Trash2 size={14} />
            </Button>
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
    </Card>
  );
};


const PicRedux = () => {
  const { language, t, changeLanguage } = useLanguage();
  const formatFileSize = (bytes) => formatFileSizeUtil(bytes, t.units);
  
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successStats, setSuccessStats] = useState({ successCount: 0, savedSize: 0 });
  const [destinationFolder, setDestinationFolder] = useState(null);
  const [showQuotaLimitModal, setShowQuotaLimitModal] = useState(false);
  const [quotaLimitStats, setQuotaLimitStats] = useState({ successCount: 0, remainingCount: 0, quotaUsed: 0, quotaLimit: 30 });
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const licenseKeyInputRef = useRef(null);
  const isCancelledRef = useRef(false);

  const [profile, setProfile] = useState(PROFILE_CUSTOM);
  const [compressionFormat, setCompressionFormat] = useState('Original');
  const [compressionQuality, setCompressionQuality] = useState(80);
  const [outputPrefix, setOutputPrefix] = useState('');
  const [outputSuffix, setOutputSuffix] = useState('_optimized');
  const [resizeMode, setResizeMode] = useState('dimensions');
  const [resizeWidth, setResizeWidth] = useState('');
  const [resizeHeight, setResizeHeight] = useState('');
  const [resizePercentage, setResizePercentage] = useState(100);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [removeMetadata, setRemoveMetadata] = useState(false);
  const [backgroundFill, setBackgroundFill] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [socialPlatform, setSocialPlatform] = useState('Instagram');
  const [socialType, setSocialType] = useState('Post');
  const [outputDestination, setOutputDestination] = useState('same');
  const [customOutputFolder, setCustomOutputFolder] = useState(null);
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkType, setWatermarkType] = useState('image');
  const [watermarkText, setWatermarkText] = useState('© PicRedux');
  const [watermarkOpacity, setWatermarkOpacity] = useState(50);
  const [watermarkLogo, setWatermarkLogo] = useState(null);
  const [watermarkLogoName, setWatermarkLogoName] = useState(null);
  const [watermarkPosition, setWatermarkPosition] = useState('center');
  const [watermarkSize, setWatermarkSize] = useState(50);
  const [watermarkFont, setWatermarkFont] = useState('Arial');
  const [watermarkColor, setWatermarkColor] = useState('#FFFFFF');
  const [estimatedSize, setEstimatedSize] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [layout, setLayout] = useState(() => {
    const savedLayout = localStorage.getItem('picredux-layout');
    return savedLayout === 'list' ? 'list' : 'grid';
  });
  const [isPro, setIsPro] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState(null);
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [showActivationForm, setShowActivationForm] = useState(false);
  
  const [quotaUsed, setQuotaUsed] = useState(0);
  const [quotaLimit, setQuotaLimit] = useState(30);
  const [quotaAllowed, setQuotaAllowed] = useState(true);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const { isDuplicateFile, filteredFiles, filterStats } = useFileManagement(files, activeFilter, sortBy);

  // Helper function to validate image files (including HEIC/TIFF which may have empty MIME type)
  const isValidImageFile = (file) => {
    // Check MIME type first
    if (file.type && file.type.startsWith('image/')) {
      return true;
    }
    // Check extension for formats that browsers may not recognize (HEIC, HEIF, TIFF, TIF)
    const ext = file.name.toLowerCase().split('.').pop();
    const supportedExtensions = ['heic', 'heif', 'tiff', 'tif', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'avif'];
    return supportedExtensions.includes(ext);
  };

  const handleFiles = async (fileList, dataTransferItems = null) => {
    try {
      const filesArray = Array.from(fileList).filter(file => isValidImageFile(file));
      const newFiles = [];

      for (let index = 0; index < filesArray.length; index++) {
        const file = filesArray[index];
        let filePath = null;

        // CRITICAL: Use webUtils.getPathForFile() to get the real absolute path
        // This is the proper Electron API - file.path can be stripped or incorrect
        // Note: getPathForFile returns a Promise, so we need to await it
        if (window.electronAPI && window.electronAPI.getPathForFile) {
          try {
            // getPathForFile returns a Promise
            const resolvedPath = await window.electronAPI.getPathForFile(file);
            if (resolvedPath) {
              filePath = resolvedPath;
              console.log('[handleFiles] Resolved Path (from webUtils.getPathForFile):', filePath, 'for file:', file.name);
            }
          } catch (error) {
            console.warn('[handleFiles] Error calling getPathForFile:', error);
          }
        }
        
        // Fallback 1: Try file.path if webUtils didn't work
        if (!filePath && file.path) {
          filePath = file.path;
          console.log('[handleFiles] Fallback: Using file.path:', filePath, 'for file:', file.name);
        }
        
        // Fallback 2: Try dataTransferItems if available
        if (!filePath && dataTransferItems && dataTransferItems[index]) {
          const item = dataTransferItems[index];
          if (item.getAsFileSystemEntry) {
            const entry = item.getAsFileSystemEntry();
            if (entry && entry.fullPath) {
              filePath = entry.fullPath;
              console.log('[handleFiles] Fallback: Path from getAsFileSystemEntry:', filePath);
            }
          } else if (item.webkitGetAsEntry) {
            const entry = item.webkitGetAsEntry();
            if (entry && entry.fullPath) {
              filePath = entry.fullPath;
              console.log('[handleFiles] Fallback: Path from webkitGetAsEntry:', filePath);
            }
          }
        }
        
        // Log the resolved path as requested
        console.log('[handleFiles] Resolved Path:', filePath);
        
        // Validate path format
        if (filePath) {
          // Check if path is absolute (starts with / on Unix/Mac, or has drive letter on Windows)
          const isAbsolute = filePath.startsWith('/') || /^[A-Za-z]:\\/.test(filePath);
          if (!isAbsolute) {
            console.error('[handleFiles] ERROR: Path is not absolute! Path:', filePath, 'for file:', file.name);
            console.error('[handleFiles] This will cause save failures. Path should be absolute like /Users/User/Downloads/file.png');
          } else {
            console.log('[handleFiles] ✓ Valid absolute path:', filePath);
          }
        } else {
          console.error('[handleFiles] ERROR: No path found for file:', file.name);
        }

        if (isDuplicateFile(file, filePath, files) || isDuplicateFile(file, filePath, newFiles)) {
          console.log('[handleFiles] Skipping duplicate file:', file.name);
          continue;
        }

        let previewUrl;
        let isPreviewSupported = true;
        const ext = file.name.toLowerCase().split('.').pop();
        const unsupportedPreviewFormats = ['heic', 'heif', 'tiff', 'tif'];
        
        // HEIC/TIFF files cannot be previewed natively in browsers
        // Show generic icon instead (preview generation is too slow)
        if (unsupportedPreviewFormats.includes(ext)) {
          previewUrl = null;
          isPreviewSupported = false;
        } else {
          try {
            previewUrl = URL.createObjectURL(file);
          } catch (urlError) {
            console.error('[handleFiles] Failed to create preview URL:', urlError);
            previewUrl = null;
            isPreviewSupported = false;
          }
        }

        newFiles.push({
          id: `${Date.now()}-${index}`,
          file: file,
          name: file.name,
          size: file.size,
          type: file.type,
          path: filePath,
          originalPath: filePath,
          previewUrl: previewUrl,
          isPreviewSupported: isPreviewSupported,
          compressed: false,
          compressionRatio: null,
          status: 'pending',
          compressedSize: null,
          compressedBlob: null,
          outputFilename: null,
        });
      }

      if (newFiles.length > 0) {
        console.log('[handleFiles] Adding', newFiles.length, 'files to state');
        setFiles(prev => [...prev, ...newFiles]);
      } else {
        console.warn('[handleFiles] No new files to add');
      }
    } catch (error) {
      console.error('[handleFiles] Error processing files:', {
        error: error.message,
        stack: error.stack
      });
    }
  };

  useEffect(() => {
    if (showActivationForm && licenseKeyInputRef.current) {
      setTimeout(() => {
        licenseKeyInputRef.current?.focus();
      }, 100);
    }
  }, [showActivationForm]);
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getSocialPresetDimensions = () => {
    if (profile !== PROFILE_SOCIAL_MEDIA) return null;
    
    const presets = {
      Instagram: {
        Post: { width: 1080, height: 1080 },
        'Story / Reel': { width: 1080, height: 1920 },
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

  useEffect(() => {
    const optimalQuality = getOptimalQuality(compressionFormat);
    setCompressionQuality(optimalQuality);
  }, [compressionFormat]);

  const generateCompressedThumbnail = async (file, format, quality, bgFill, bgColor, wmEnabled, wmText, wmLogo, wmType, wmPosition, wmSize, wmOpacity, wmFont, wmColor, wmColorCustom) => {
    try {
      // Skip thumbnail generation for HEIC/TIFF - browsers cannot render them
      const ext = file.name.toLowerCase().split('.').pop();
      if (['heic', 'heif', 'tiff', 'tif'].includes(ext)) {
        return null;
      }
      
      const img = await loadImage(file);
      const canvas = document.createElement('canvas');
      const maxThumbnailSize = 300;
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
      
      if (bgFill) {
        const bgColorValue = typeof bgColor === 'string' && bgColor.startsWith('#') ? bgColor : '#FFFFFF';
        ctx.fillStyle = bgColorValue;
        ctx.fillRect(0, 0, width, height);
        
        const imageAspectRatio = img.width / img.height;
        const targetAspectRatio = width / height;
        
        let drawWidth = width;
        let drawHeight = height;
        let drawX = 0;
        let drawY = 0;
        
        if (imageAspectRatio > targetAspectRatio) {
          drawWidth = width;
          drawHeight = width / imageAspectRatio;
          drawX = 0;
          drawY = (height - drawHeight) / 2;
        } else {
          drawWidth = height * imageAspectRatio;
          drawHeight = height;
          drawX = (width - drawWidth) / 2;
          drawY = 0;
        }
        
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      } else {
        ctx.drawImage(img, 0, 0, width, height);
      }
      
      if (wmEnabled) {
        try {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, wmOpacity / 100));
          
          const padding = Math.max(10, Math.min(50, width / 40));
          
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
          
          if (wmLogo && wmType === 'image') {
            const logoImg = await loadImage(wmLogo);
            const watermarkWidth = (logoImg.width * wmSize) / 100;
            const logoAspectRatio = logoImg.width / logoImg.height;
            const watermarkHeight = watermarkWidth / logoAspectRatio;
            
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
            const watermarkWidth = (width * wmSize) / 100;
            const fontSize = Math.max(12, Math.min(200, watermarkWidth / wmText.length * 2));
            
            const textColor = typeof wmColor === 'string' && wmColor.startsWith('#') ? wmColor : '#FFFFFF';
            ctx.fillStyle = textColor;
            ctx.font = `bold ${fontSize}px ${wmFont || 'Arial'}, sans-serif`;
            ctx.textAlign = pos.align;
            ctx.textBaseline = pos.baseline;
            ctx.fillText(wmText, pos.x, pos.y);
          }
          
          ctx.restore();
        } catch (wmError) {
        }
      }
      
      let mimeType = format === 'Original' ? (file.type || 'image/jpeg') : getMimeType(format);
      if (!mimeType) {
        if (format === 'AVIF') {
          mimeType = 'image/png';
        } else {
          mimeType = 'image/jpeg';
        }
      }
      
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
      return null;
    }
  };

  const [compressedThumbnails, setCompressedThumbnails] = useState({});
  const [debouncedBackgroundColor, setDebouncedBackgroundColor] = useState(backgroundColor);
  const [debouncedWatermarkColor, setDebouncedWatermarkColor] = useState(watermarkColor);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBackgroundColor(backgroundColor);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [backgroundColor]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedWatermarkColor(watermarkColor);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [watermarkColor]);

  useEffect(() => {
    let isCancelled = false;
    const currentThumbnails = compressedThumbnails;
    
    const generateThumbnails = async () => {
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
      
      const promises = files.map(async (file) => {
        if (isCancelled) return;
        
        if (file.previewUrl && file.file) {
          try {
            const thumbnailUrl = await generateCompressedThumbnail(
              file.file,
              compressionFormat,
              compressionQuality,
              backgroundFill,
              debouncedBackgroundColor,
              watermarkEnabled,
              watermarkText,
              watermarkLogo,
              watermarkType,
              watermarkPosition,
              watermarkSize,
              watermarkOpacity,
              watermarkFont,
              debouncedWatermarkColor
            );
            if (!isCancelled && thumbnailUrl) {
              thumbnails[file.id] = thumbnailUrl;
            }
          } catch (error) {
          }
        }
      });
      
      await Promise.all(promises);
      
      if (!isCancelled) {
        setCompressedThumbnails(thumbnails);
      } else {
        Object.values(thumbnails).forEach(url => {
          if (url && typeof url === 'string') {
            URL.revokeObjectURL(url);
          }
        });
      }
    };
    
    generateThumbnails();
    
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

  useEffect(() => {
    if (profile === PROFILE_SHOPIFY) {
      // Shopify: 1200x1200 square format - keepAspectRatio = false because both dimensions are fixed
      setResizeWidth(1200);
      setResizeHeight(1200);
      setResizeMode('dimensions');
      setKeepAspectRatio(false);
      setBackgroundFill(false);
    } else if (profile === PROFILE_EMAIL) {
      // Email: only width defined, height is auto - keepAspectRatio = true
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
        // If both dimensions are defined, keepAspectRatio = false
        const hasBothDimensions = dimensions.width && dimensions.height;
        setKeepAspectRatio(!hasBothDimensions);
      }
      setBackgroundFill(true);
    } else if (profile === PROFILE_CUSTOM) {
      setResizeWidth('');
      setResizeHeight('');
      setResizeMode('dimensions');
      setKeepAspectRatio(true);
      setBackgroundFill(false);
    }
  }, [profile, socialPlatform, socialType]);

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
          if (quota.isPro) {
            setIsPro(true);
          }
        } catch (error) {
          setQuotaAllowed(true);
        }
      }
    };
    
    checkLicenseStatus();
    checkQuota();
  }, []);


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

  const handleClearLicense = async () => {
    if (!window.electronAPI || !window.electronAPI.clearLicense) {
      return;
    }

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
        if (window.electronAPI && window.electronAPI.checkQuota) {
          try {
            const quota = await window.electronAPI.checkQuota();
            setQuotaUsed(quota.count || 0);
            setQuotaLimit(quota.limit || 30);
            setQuotaAllowed(quota.allowed || false);
          } catch (error) {
          }
        }
      }
    } catch (error) {
    }
  };

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
        if (window.electronAPI && window.electronAPI.checkQuota) {
          try {
            const quota = await window.electronAPI.checkQuota();
            setQuotaUsed(quota.count || 0);
            setQuotaLimit(quota.limit || 30);
            setQuotaAllowed(quota.allowed || true);
          } catch (error) {
          }
        }
        setTimeout(() => {
          setShowActivationForm(false);
          setActivationSuccess(false);
          setLicenseKey('');
        }, 2000);
      } else {
        if (result.errorCode) {
          setActivationError(translateError(result.errorCode, result.errorData || {}));
        } else if (result.error) {
          setActivationError(result.error);
        } else {
          setActivationError(t.sidebar.licenseInvalid);
        }
      }
    } catch (error) {
      setActivationError(t.sidebar.verificationError.replace('{message}', error.message || ''));
    } finally {
      setIsActivating(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

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

  const handleFileInput = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    e.target.value = '';
  };

  const handleRemoveFile = (fileId) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove && fileToRemove.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter(f => f.id !== fileId);
    });
    
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

  const stats = {
    total: files.length,
    totalSize: files.reduce((sum, f) => sum + f.size, 0),
    compressedSize: files.reduce((sum, f) => sum + (f.compressedSize || f.size), 0),
  };
  const savedSize = stats.totalSize - stats.compressedSize;
  const reductionPercent = stats.totalSize > 0 
    ? Math.round((savedSize / stats.totalSize) * 100) 
    : 0;

  const loadImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      const imageUrl = URL.createObjectURL(file);
      
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Timeout loading image'));
      }, 30000);
      
      img.onload = () => {
        clearTimeout(timeout);
        if (img.width === 0 || img.height === 0) {
          URL.revokeObjectURL(imageUrl);
          reject(new Error('Invalid image: null dimensions'));
          return;
        }
        resolve(img);
      };
      
      img.onerror = (error) => {
        clearTimeout(timeout);
        URL.revokeObjectURL(imageUrl);
        reject(new Error(`Unable to load image: ${file.name}`));
      };
      
      img.src = imageUrl;
    });
  };

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

    // Check if file is HEIC/TIFF - these cannot be loaded in browser canvas
    const ext = fileData.name.toLowerCase().split('.').pop();
    const isHeicOrTiff = ['heic', 'heif', 'tiff', 'tif'].includes(ext);

    if (isHeicOrTiff) {
      // For HEIC/TIFF files, we skip canvas processing and send directly to backend Sharp
      // Return the original file as blob with a flag indicating backend-only processing
      const targetFormat = format === 'Original' ? 'JPEG' : format; // HEIC/TIFF cannot be written, default to JPEG
      const actualFormat = targetFormat === 'AVIF' ? 'AVIF' : 
                          targetFormat === 'WebP' ? 'WebP' : 
                          targetFormat === 'PNG' ? 'PNG' : 'JPEG';
      
      return {
        blob: fileData.file, // Pass the original file
        size: fileData.size,
        width: null, // Will be determined by Sharp
        height: null,
        actualFormat: actualFormat,
        requestedFormat: format,
        usedFallback: false,
        isHeicOrTiff: true, // Flag for backend processing
      };
    }

    try {
      // 1. Charger l'image
      const img = await loadImage(fileData.file);
      imageUrl = img.src;
      
      const originalWidth = img.width;
      const originalHeight = img.height;

      if (originalWidth === 0 || originalHeight === 0) {
        throw new Error('Invalid image dimensions');
      }
      let finalWidth = originalWidth;
      let finalHeight = originalHeight;

      if (mode === 'percentage') {
        finalWidth = Math.max(1, Math.round(originalWidth * (resizeVal / 100)));
        finalHeight = Math.max(1, Math.round(originalHeight * (resizeVal / 100)));
      } else if (mode === 'dimensions' || mode === 'fixed') {
        const widthValue = width === '' || width === null || width === undefined ? null : Number(width);
        const heightValue = height === '' || height === null || height === undefined || height === 'Auto' ? null : Number(height);
        
        if (widthValue === null && heightValue === null) {
          finalWidth = originalWidth;
          finalHeight = originalHeight;
        } else if (widthValue !== null && heightValue === null) {
          if (widthValue <= 0) {
            throw new Error('Invalid resize width');
          }
          const ratio = widthValue / originalWidth;
          finalWidth = Math.max(1, Math.round(originalWidth * ratio));
          finalHeight = Math.max(1, Math.round(originalHeight * ratio));
        } else if (widthValue === null && heightValue !== null) {
          if (heightValue <= 0) {
            throw new Error('Invalid resize height');
          }
          const ratio = heightValue / originalHeight;
          finalWidth = Math.max(1, Math.round(originalWidth * ratio));
          finalHeight = Math.max(1, Math.round(originalHeight * ratio));
        } else {
          if (widthValue <= 0 || heightValue <= 0) {
            throw new Error('Invalid resize dimensions');
          }
          const ratio = Math.min(widthValue / originalWidth, heightValue / originalHeight);
          finalWidth = Math.max(1, Math.round(originalWidth * ratio));
          finalHeight = Math.max(1, Math.round(originalHeight * ratio));
        }
      }

      if (finalWidth <= 0 || finalHeight <= 0) {
        throw new Error('Invalid final dimensions');
      }
      const canvas = document.createElement('canvas');
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Cannot create canvas context');
      }

      if (bgFill) {
        const bgColorValue = typeof bgColor === 'string' && bgColor.startsWith('#') ? bgColor : '#FFFFFF';
        ctx.fillStyle = bgColorValue;
        ctx.fillRect(0, 0, finalWidth, finalHeight);
      }

      if (bgFill) {
        const imageAspectRatio = originalWidth / originalHeight;
        const targetAspectRatio = finalWidth / finalHeight;
        
        let drawWidth = finalWidth;
        let drawHeight = finalHeight;
        let drawX = 0;
        let drawY = 0;
        
        if (imageAspectRatio > targetAspectRatio) {
          drawWidth = finalWidth;
          drawHeight = finalWidth / imageAspectRatio;
          drawX = 0;
          drawY = (finalHeight - drawHeight) / 2;
        } else {
          drawWidth = finalHeight * imageAspectRatio;
          drawHeight = finalHeight;
          drawX = (finalWidth - drawWidth) / 2;
          drawY = 0;
        }
        
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      } else {
        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
      }

      if (wmEnabled) {
        try {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, wmOpacity / 100));
          
          const padding = Math.max(10, Math.min(50, finalWidth / 40));
          
          let logoX = 0;
          let logoY = 0;
          let textX = 0;
          let textY = 0;
          let textAlign = 'left';
          let textBaseline = 'top';
          
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
          
          if (wmLogo && wmType === 'image') {
            const logoImg = await loadImage(wmLogo);
            const watermarkWidth = (logoImg.width * wmSize) / 100;
            const logoAspectRatio = logoImg.width / logoImg.height;
            const watermarkHeight = watermarkWidth / logoAspectRatio;
            
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
            const watermarkWidth = (finalWidth * wmSize) / 100;
            const fontSize = Math.max(12, Math.min(200, watermarkWidth / wmText.length * 2));
            
            const textColor = typeof wmColor === 'string' && wmColor.startsWith('#') ? wmColor : '#FFFFFF';
            ctx.fillStyle = textColor;
            ctx.font = `bold ${fontSize}px ${wmFont || 'Arial'}, sans-serif`;
            ctx.textAlign = pos.align;
            ctx.textBaseline = pos.baseline;
            ctx.fillText(wmText, pos.x, pos.y);
          }
          
          ctx.restore();
        } catch (wmError) {
        }
      }

      let mimeType = getMimeType(format);
      let actualMimeType = mimeType;
      let useFallback = false;
      
      if (!mimeType) {
        mimeType = fileData.type || 'image/jpeg';
        actualMimeType = mimeType;
      }

      const nativeSupportedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      
      if (format === 'AVIF') {
        actualMimeType = 'image/png';
        useFallback = true;
      } else if (format === 'SVG') {
        actualMimeType = 'image/png';
        useFallback = true;
      } else if (!nativeSupportedTypes.includes(actualMimeType)) {
        actualMimeType = 'image/jpeg';
        useFallback = true;
      }

      const qualityValue = Math.max(0, Math.min(1, quality / 100));

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Compression timeout'));
        }, 30000);

        canvas.toBlob(
          async (blob) => {
            clearTimeout(timeout);
            
            if (!blob) {
              reject(new Error(`Compression failed (format: ${actualMimeType})`));
              return;
            }
            if (imageUrl) {
              URL.revokeObjectURL(imageUrl);
            }

            if (format === 'AVIF' && window.electronAPI) {
              try {
                const avifQuality = Math.max(1, Math.min(100, quality || 80));
                
                const arrayBuffer = await blob.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                
                const result = await window.electronAPI.convertToAvif(Array.from(uint8Array), avifQuality);
                
                if (result.success) {
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
                  throw new Error(result.error || 'AVIF conversion error');
                }
              } catch (avifError) {
                const mimeToFormat = {
                  'image/webp': 'WebP',
                  'image/jpeg': 'JPEG',
                  'image/png': 'PNG',
                  'image/svg+xml': 'SVG'
                };
                const actualFormatName = mimeToFormat[actualMimeType] || format;
                
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
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      throw error;
    }
  };

  // Generate text watermark as PNG image using Canvas (for proper font rendering)
  const generateTextWatermarkImage = async (text, font, color, opacity, targetWidth = 800) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate font size based on target width
      const fontSize = Math.max(24, Math.min(200, targetWidth / text.length * 1.5));
      
      // Set font to measure text
      ctx.font = `bold ${fontSize}px "${font}", sans-serif`;
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const textHeight = fontSize * 1.2;
      
      // Set canvas size with padding
      const padding = fontSize * 0.5;
      canvas.width = textWidth + padding * 2;
      canvas.height = textHeight + padding * 2;
      
      // Clear canvas (transparent background)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set text properties
      ctx.font = `bold ${fontSize}px "${font}", sans-serif`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity / 100;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Draw text
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          blob.arrayBuffer().then((buffer) => {
            resolve(Array.from(new Uint8Array(buffer)));
          });
        } else {
          resolve(null);
        }
      }, 'image/png');
    });
  };

  const saveFileToSourceFolder = async (blob, fileData, formatOverride = null, qualityOverride = null, options = {}) => {
    console.log('[saveFileToSourceFolder] Starting save operation', {
      fileName: fileData.name,
      formatOverride,
      hasBlob: !!blob,
      blobSize: blob?.size,
      hasElectronAPI: !!window.electronAPI,
      outputDestination,
      customOutputFolder,
      fileDataPath: fileData.path
    });

    if (!window.electronAPI) {
      console.warn('[saveFileToSourceFolder] Electron API not available, falling back to download');
      return downloadFile(blob, getOutputPreview(fileData.name, formatOverride));
    }

    let outputDir;
    if (outputDestination === 'custom' && customOutputFolder) {
      outputDir = customOutputFolder;
      console.log('[saveFileToSourceFolder] Using custom output folder:', outputDir);
    } else if (fileData.path) {
      const pathSeparator = fileData.path.includes('\\') ? '\\' : '/';
      const lastSeparator = Math.max(
        fileData.path.lastIndexOf('/'),
        fileData.path.lastIndexOf('\\')
      );
      outputDir = lastSeparator > 0 ? fileData.path.substring(0, lastSeparator) : fileData.path;
      console.log('[saveFileToSourceFolder] Using source folder:', outputDir);
    } else {
      console.warn('[saveFileToSourceFolder] No file path available, falling back to download');
      return downloadFile(blob, getOutputPreview(fileData.name, formatOverride));
    }

    if (outputDir) {
      try {
        const outputFilename = getOutputPreview(fileData.name, formatOverride);
        const pathSeparator = outputDir.includes('\\') ? '\\' : '/';
        
        let finalOutputFilename = outputFilename;
        if (formatOverride === 'AVIF' || formatOverride === 'avif') {
          const nameWithoutExt = outputFilename.replace(/\.[^/.]+$/, '');
          finalOutputFilename = `${nameWithoutExt}.avif`;
        }
        
        const outputPath = `${outputDir}${pathSeparator}${finalOutputFilename}`;
        console.log('[saveFileToSourceFolder] Output path:', outputPath);

        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        console.log('[saveFileToSourceFolder] Blob converted to array, size:', uint8Array.length);

        let qualityToUse = qualityOverride !== null ? qualityOverride : compressionQuality;
        if (formatOverride === 'AVIF' || formatOverride === 'avif') {
          qualityToUse = Math.max(1, Math.min(100, qualityToUse || 80));
        }
        
        const keepMetadata = !removeMetadata;
        const inputPath = fileData.path || fileData.originalPath || null;
        console.log('[saveFileToSourceFolder] Input path:', inputPath);
        
        const backendOptions = {};
        
        if (resizeMode === 'dimensions' && (resizeWidth || resizeHeight)) {
          backendOptions.resize = {
            mode: 'dimensions',
            width: resizeWidth ? parseInt(resizeWidth) : null,
            height: resizeHeight && resizeHeight !== 'Auto' ? parseInt(resizeHeight) : null,
            keepAspectRatio: keepAspectRatio
          };
        } else if (resizeMode === 'percentage' && resizePercentage !== 100) {
          backendOptions.resize = {
            mode: 'percentage',
            value: resizePercentage
          };
        }
        
        if (backgroundFill && backgroundColor) {
          backendOptions.fillColor = backgroundColor;
        }
        
        if (watermarkEnabled) {
          backendOptions.watermark = {
            enabled: true,
            type: watermarkType,
            position: watermarkPosition,
            size: watermarkSize,
            opacity: watermarkOpacity
          };
          
          if (watermarkType === 'image' && watermarkLogo) {
            const logoArrayBuffer = await watermarkLogo.arrayBuffer();
            backendOptions.watermark.image = Array.from(new Uint8Array(logoArrayBuffer));
          } else if (watermarkType === 'text' && watermarkText) {
            // Generate text watermark as PNG image using Canvas for proper font rendering
            const textWatermarkImage = await generateTextWatermarkImage(
              watermarkText, 
              watermarkFont, 
              watermarkColor, 
              watermarkOpacity
            );
            if (textWatermarkImage) {
              // Send as image type instead of text type for proper font support
              backendOptions.watermark.type = 'image';
              backendOptions.watermark.image = textWatermarkImage;
              // Opacity is already baked into the image
              backendOptions.watermark.opacity = 100;
            } else {
              // Fallback to text-based rendering
              backendOptions.watermark.text = watermarkText;
              backendOptions.watermark.color = watermarkColor;
              backendOptions.watermark.font = watermarkFont;
            }
          }
        }
        
        console.log('[saveFileToSourceFolder] Calling electronAPI.saveFile with:', {
          outputPath,
          formatOverride,
          qualityToUse,
          keepMetadata,
          inputPath,
          hasBackendOptions: Object.keys(backendOptions).length > 0
        });

        const result = await window.electronAPI.saveFile(
          Array.from(uint8Array), 
          outputPath,
          formatOverride,
          qualityToUse,
          keepMetadata,
          false,
          inputPath,
          backendOptions
        );
        
        console.log('[saveFileToSourceFolder] Save result:', result);
        
        if (result.success) {
          console.log('[saveFileToSourceFolder] File saved successfully:', result.path);
          return {
            success: true,
            path: result.path,
            finalSize: result.finalSize || result.size,
            size: result.finalSize || result.size
          };
        } else {
          const errorMsg = result.error || 'Error saving file';
          console.error('[saveFileToSourceFolder] Save failed:', errorMsg, result);
          throw new Error(`Save failed: ${errorMsg}`);
        }
      } catch (error) {
        console.error('[saveFileToSourceFolder] Exception during save:', {
          error: error.message,
          stack: error.stack,
          fileName: fileData.name,
          outputDir
        });
        throw new Error(`Failed to save file "${fileData.name}": ${error.message}`);
      }
    } else {
      console.warn('[saveFileToSourceFolder] No output directory, falling back to download');
      return downloadFile(blob, getOutputPreview(fileData.name, formatOverride));
    }
  };

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { 
      success: true, 
      path: filename,
      finalSize: blob.size,
      size: blob.size
    };
  };

  const calculateEstimatedSize = async () => {
    if (files.length === 0) {
      setEstimatedSize(0);
      return;
    }

    const firstFile = files[0];
    
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
        let resizeFactor = 1;
        if (resizeMode === 'percentage') {
          resizeFactor = resizePercentage / 100;
        } else if (resizeWidth && resizeWidth < 1920) {
          resizeFactor = resizeWidth / 1920;
        }
        setEstimatedSize(firstFileSize * qualityFactor * formatFactor * resizeFactor);
      } catch (fallbackError) {
        setEstimatedSize(0);
      }
    }
  };

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

  const getOutputPreview = (originalName, formatOverride = null) => {
    const formatToUse = formatOverride || compressionFormat;
    return getOutputPreviewUtil(originalName, formatToUse, outputPrefix, outputSuffix);
  };

  const handleReveal = async (file) => {
    if (!file.savedPath || !window.electronAPI) {
      return;
    }
    
    try {
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
    }
  };


  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setWatermarkLogo(file);
      setWatermarkLogoName(file.name);
    }
  };

  const handleRemoveLogo = () => {
    setWatermarkLogo(null);
    setWatermarkLogoName(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleClearFiles = () => {
    files.forEach(file => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });
    setFiles([]);
  };

  const cancelOptimization = () => {
    isCancelledRef.current = true;
    setIsProcessing(false);
    setProgress(0);
    // Réinitialiser les fichiers en cours de traitement
    setFiles(prev => prev.map(f => 
      f.status === 'processing' 
        ? { ...f, status: 'pending' }
        : f
    ));
  };

  const handleExportAll = async () => {
    if (files.length === 0 || isProcessing) return;
    
    // Réinitialiser le flag d'annulation
    isCancelledRef.current = false;
    
    if (!isPro && quotaUsed >= quotaLimit) {
      setShowActivationForm(true);
      return;
    }
    if (window.electronAPI && window.electronAPI.checkQuota) {
      try {
        const quota = await window.electronAPI.checkQuota();
        setQuotaUsed(quota.count || 0);
        setQuotaLimit(quota.limit || 30);
        setQuotaAllowed(quota.allowed || false);
        
        if (!quota.allowed || (!quota.isPro && quota.count >= quota.limit)) {
          setShowActivationForm(true);
          return;
        }
      } catch (error) {
        if (!isPro) {
          return;
        }
      }
    }
    
    setIsProcessing(true);
    setProgress(0);

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
    
    const finalQuality = compressionQuality;
    
      const config = {
      format: compressionFormat,
      quality: finalQuality,
      resizeMode: resizeMode,
      resizeValue: resizeMode === 'percentage' ? resizePercentage : 100,
      resizeWidth: resizeMode === 'dimensions' ? finalResizeWidth : null,
      resizeHeight: resizeMode === 'dimensions' ? finalResizeHeight : null,
      keepAspectRatio: keepAspectRatio,
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
    let quotaLimitReached = false;
    
    const sortedFiles = [...files].sort((a, b) => {
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
    
    const totalFiles = sortedFiles.length;

    for (let i = 0; i < totalFiles; i++) {
      // Vérifier si l'optimisation a été annulée
      if (isCancelledRef.current) {
        console.log('[handleExportAll] Optimization cancelled by user');
        break;
      }
      
      const fileData = sortedFiles[i];
      
      if (!isPro) {
        if (window.electronAPI && window.electronAPI.checkQuota) {
          try {
            const quotaCheck = await window.electronAPI.checkQuota();
            if (!quotaCheck.allowed || quotaCheck.count >= quotaCheck.limit) {
              setQuotaUsed(quotaCheck.count);
              setQuotaAllowed(false);
              quotaLimitReached = true;
              const remainingFiles = sortedFiles.slice(i);
              if (remainingFiles.length > 0) {
                setFiles(prev => prev.map(f => {
                  const isRemaining = remainingFiles.some(rf => rf.id === f.id);
                  if (isRemaining && f.status !== 'done') {
                    return { ...f, status: 'pending' };
                  }
                  return f;
                }));
              }
              break;
            }
            setQuotaUsed(quotaCheck.count);
          } catch (error) {
          }
        }

        if (quotaUsed >= quotaLimit) {
          quotaLimitReached = true;
          break;
        }
      }
      
      try {
        // Vérifier à nouveau si annulé avant de commencer le traitement
        if (isCancelledRef.current) {
          break;
        }
        
        setFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, status: 'processing' }
            : f
        ));

        // Traiter le fichier (compression)
        const result = await processFile(fileData, config);
        
        // Vérifier si annulé après le traitement
        if (isCancelledRef.current) {
          break;
        }

        const outputFilename = getOutputPreview(fileData.name, result.actualFormat);

        const backendOptions = {};
        
        if (config.resizeMode === 'dimensions' && (config.resizeWidth || config.resizeHeight)) {
          backendOptions.resize = {
            mode: 'dimensions',
            width: config.resizeWidth ? parseInt(config.resizeWidth) : null,
            height: config.resizeHeight && config.resizeHeight !== 'Auto' ? parseInt(config.resizeHeight) : null,
            keepAspectRatio: config.keepAspectRatio
          };
        } else if (config.resizeMode === 'percentage' && config.resizeValue !== 100) {
          backendOptions.resize = {
            mode: 'percentage',
            value: config.resizeValue
          };
        }
        
        if (config.backgroundFill && config.backgroundColor) {
          backendOptions.fillColor = config.backgroundColor;
        }
        
        if (config.watermarkEnabled) {
          backendOptions.watermark = {
            enabled: true,
            type: config.watermarkType,
            position: config.watermarkPosition,
            size: config.watermarkSize,
            opacity: config.watermarkOpacity
          };
          
          if (config.watermarkType === 'image' && config.watermarkLogo) {
            const logoArrayBuffer = await config.watermarkLogo.arrayBuffer();
            backendOptions.watermark.image = Array.from(new Uint8Array(logoArrayBuffer));
          } else if (config.watermarkType === 'text' && config.watermarkText) {
            // Generate text watermark as PNG image using Canvas for proper font rendering
            const textWatermarkImage = await generateTextWatermarkImage(
              config.watermarkText, 
              config.watermarkFont, 
              config.watermarkColor, 
              config.watermarkOpacity
            );
            if (textWatermarkImage) {
              // Send as image type instead of text type for proper font support
              backendOptions.watermark.type = 'image';
              backendOptions.watermark.image = textWatermarkImage;
              // Opacity is already baked into the image
              backendOptions.watermark.opacity = 100;
            } else {
              // Fallback to text-based rendering
              backendOptions.watermark.text = config.watermarkText;
              backendOptions.watermark.color = config.watermarkColor;
              backendOptions.watermark.font = config.watermarkFont;
            }
          }
        }
        
        console.log('[handleExportAll] Processing file:', fileData.name, 'Format:', result.actualFormat);
        
        const saveResult = await saveFileToSourceFolder(result.blob, fileData, result.actualFormat, config.quality, backendOptions);

        console.log('[handleExportAll] Save result for', fileData.name, ':', saveResult);

        const savedPath = (saveResult && saveResult.path) ? saveResult.path : (typeof saveResult === 'string' ? saveResult : null);

        const saveSuccess = saveResult && (
          (typeof saveResult === 'object' && (saveResult.success === true || saveResult.path)) ||
          (typeof saveResult === 'string' && saveResult.length > 0)
        );

        if (!saveSuccess) {
          const errorDetails = {
            saveResult,
            savedPath,
            fileName: fileData.name,
            hasBlob: !!result.blob,
            blobSize: result.blob?.size
          };
          console.error('[handleExportAll] File save failed:', errorDetails);
          throw new Error(`File save failed for "${fileData.name}". Save result: ${JSON.stringify(saveResult)}`);
        }
        
        console.log('[handleExportAll] File saved successfully:', savedPath);

        const originalSize = fileData.size;
        const compressedSize = (saveResult && typeof saveResult === 'object' && (saveResult.finalSize || saveResult.size)) 
          ? (saveResult.finalSize || saveResult.size) 
          : result.size;
        const gain = originalSize > 0 
          ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
          : 0;

        totalOriginalSize += originalSize;
        totalCompressedSize += compressedSize;
        
        if (!firstDestinationFolder && savedPath && typeof savedPath === 'string') {
          const pathSeparator = savedPath.includes('\\') ? '\\' : '/';
          const lastSeparator = Math.max(
            savedPath.lastIndexOf('/'),
            savedPath.lastIndexOf('\\')
          );
          if (lastSeparator > 0) {
            firstDestinationFolder = savedPath.substring(0, lastSeparator);
          }
        }

        let isOverwritten = false;
        if (fileData.path && savedPath) {
          const normalizedOriginal = fileData.path.toLowerCase().replace(/\\/g, '/');
          const normalizedSaved = savedPath.toLowerCase().replace(/\\/g, '/');
          
          if (normalizedOriginal === normalizedSaved) {
            isOverwritten = true;
          } else {
            const originalFileName = fileData.path.split(/[/\\]/).pop()?.toLowerCase();
            const savedFileName = savedPath.split(/[/\\]/).pop()?.toLowerCase();
            const originalNameWithoutExt = fileData.name.toLowerCase().replace(/\.[^/.]+$/, '');
            const savedNameWithoutExt = savedFileName?.replace(/\.[^/.]+$/, '');
            
            if (originalNameWithoutExt === savedNameWithoutExt && 
                outputPrefix === '' && outputSuffix === '') {
              isOverwritten = true;
            }
          }
        }
        
        let updatedFile = fileData.file;
        let updatedPreviewUrl = fileData.previewUrl;
        
        if (isOverwritten && result.blob) {
          try {
            const newFile = new File([result.blob], fileData.name, { 
              type: result.blob.type || fileData.type 
            });
            
            if (fileData.previewUrl) {
              URL.revokeObjectURL(fileData.previewUrl);
            }
            
            updatedFile = newFile;
            updatedPreviewUrl = URL.createObjectURL(newFile);
          } catch (error) {
          }
        }

        setFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? {
                ...f,
                file: updatedFile,
                previewUrl: updatedPreviewUrl,
                size: isOverwritten ? compressedSize : f.size,
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

        if (window.electronAPI && window.electronAPI.incrementQuota && saveSuccess && !isPro) {
          try {
            const quotaResult = await window.electronAPI.incrementQuota();
            
            if (quotaResult && quotaResult.success === true && !quotaResult.isPro) {
              const newCount = quotaResult.count !== undefined && quotaResult.count !== null ? quotaResult.count : 0;
              setQuotaUsed(prevCount => {
                const finalCount = quotaResult.count !== undefined && quotaResult.count !== null ? quotaResult.count : (prevCount + 1);
                return finalCount;
              });
              
              if (!isPro && newCount >= quotaLimit) {
                setQuotaAllowed(false);
                quotaLimitReached = true;
                const remainingFiles = sortedFiles.slice(i + 1);
                if (remainingFiles.length > 0) {
                  setFiles(prev => prev.map(f => {
                    const isRemaining = remainingFiles.some(rf => rf.id === f.id);
                    if (isRemaining && f.status !== 'done') {
                      return { ...f, status: 'pending' };
                    }
                    return f;
                  }));
                }
                break;
              }
            } else {
              if (quotaResult && quotaResult.error === 'Quota reached') {
                setQuotaAllowed(false);
                quotaLimitReached = true;
                const remainingFiles = sortedFiles.slice(i + 1);
                if (remainingFiles.length > 0) {
                  setFiles(prev => prev.map(f => {
                    const isRemaining = remainingFiles.some(rf => rf.id === f.id);
                    if (isRemaining && f.status !== 'done') {
                      return { ...f, status: 'pending' };
                    }
                    return f;
                  }));
                }
                break;
              }
            }
          } catch (error) {
            if (error.message && error.message.includes('Quota reached')) {
              setQuotaAllowed(false);
              break;
            }
          }
        }

        successCount++;
        console.log('[handleExportAll] Successfully processed file:', fileData.name, `(${successCount}/${totalFiles})`);
      } catch (error) {
        errorCount++;

        const errorMessage = error.message || 'Error processing file';
        console.error('[handleExportAll] Error processing file:', fileData.name, {
          error: errorMessage,
          stack: error.stack,
          fileName: fileData.name,
          fileId: fileData.id
        });

        setFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { 
                ...f, 
                status: 'error',
                error: errorMessage
              }
            : f
        ));
      }

      const progressValue = Math.round(((i + 1) / totalFiles) * 100);
      setProgress(progressValue);

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setIsProcessing(false);
    setProgress(0);

    if (quotaLimitReached && !isPro) {
      const remainingCount = totalFiles - successCount - errorCount;
      let currentQuotaUsed = quotaUsed;
      if (window.electronAPI && window.electronAPI.checkQuota) {
        try {
          const quotaCheck = await window.electronAPI.checkQuota();
          currentQuotaUsed = quotaCheck.count || quotaUsed;
        } catch (error) {
        }
      }
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
    }
    
    if (errorCount === 0 && successCount > 0) {
      const savedSize = totalOriginalSize - totalCompressedSize;
      
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
        {/* Header de la Sidebar - BRANDING */}
        <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-900/50">
          {/* Zone draggable avec logo + titre */}
          <div className="drag-region pt-8">
            {/* NOM + BADGE - Bloc compact */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
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
                {/* Sélecteur de langue compact */}
                <div className="relative no-drag">
                  <button
                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 transition-colors"
                  >
                    <Globe size={12} className="text-zinc-400" />
                    <span className="text-[10px] font-medium text-zinc-300 uppercase">
                      {language.toUpperCase()}
                    </span>
                    <ChevronDown size={10} className="text-zinc-400" />
                  </button>
                  {isLanguageDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsLanguageDropdownOpen(false)}
                      />
                      <div className="absolute top-full right-0 mt-1 z-20 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg min-w-[140px] overflow-hidden">
                        {supportedLanguages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              changeLanguage(lang.code);
                              setIsLanguageDropdownOpen(false);
                            }}
                            className={cn(
                              "w-full px-3 py-2 text-left text-xs flex items-center gap-2 hover:bg-zinc-700 transition-colors",
                              language === lang.code ? "bg-zinc-700/50 text-zinc-100" : "text-zinc-300"
                            )}
                          >
                            <span>{lang.flag}</span>
                            <span className="font-medium">{lang.code.toUpperCase()}</span>
                            {language === lang.code && (
                              <Check size={12} className="ml-auto text-violet-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 pl-8">
                {!isPro && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-1.5 py-px rounded border border-amber-500/20">
                    TRIAL
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Slim Status Banner - visible uniquement en mode PRO */}
          {isPro && (
            <div className="mt-3 no-drag">
              <div className="w-full py-1.5 px-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-md flex items-center justify-center gap-2">
                <Crown className="w-3 h-3 text-purple-200 flex-shrink-0" />
                <span className="text-xs font-medium tracking-wide text-purple-200">{t.sidebar.licenseActive}</span>
              </div>
            </div>
          )}
          
          {/* Widget Quota - visible uniquement en mode TRIAL */}
          {!isPro && (
            <QuotaWidget 
              quotaUsed={quotaUsed} 
              quotaLimit={quotaLimit}
              onUpgrade={() => setShowActivationForm(true)}
              t={t}
            />
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
                          <option value="Story / Reel">{t.sidebar.socialInstagramStoryReel || 'Story / Reel (9:16)'}</option>
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
                        onChange={(e) => {
                          const newWidth = e.target.value === '' ? '' : Number(e.target.value);
                          setResizeWidth(newWidth);
                          // Auto-uncheck keepAspectRatio if both dimensions are now set
                          if (newWidth !== '' && resizeHeight !== '' && resizeHeight !== 'Auto') {
                            setKeepAspectRatio(false);
                          }
                        }}
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
                        type="number"
                        value={resizeHeight}
                        onChange={(e) => {
                          const newHeight = e.target.value === '' ? '' : Number(e.target.value);
                          setResizeHeight(newHeight);
                          // Auto-uncheck keepAspectRatio if both dimensions are now set
                          if (newHeight !== '' && resizeWidth !== '' && resizeWidth !== 0) {
                            setKeepAspectRatio(false);
                          }
                        }}
                        placeholder={t.sidebar.original}
                        className="w-full h-9 px-3 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600/50 focus:border-violet-600/50 placeholder:text-zinc-600 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        style={{
                          MozAppearance: 'textfield'
                        }}
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={keepAspectRatio}
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        setKeepAspectRatio(newValue);
                        // If enabling keepAspectRatio while both dimensions are set, clear height
                        if (newValue && resizeWidth !== '' && resizeHeight !== '' && resizeHeight !== 'Auto') {
                          setResizeHeight('');
                        }
                      }}
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
                    <label className="flex items-center gap-2 cursor-pointer transition-all group">
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
                      <span className="text-sm text-zinc-300 break-words">{t.sidebar.backgroundFill}</span>
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
                        window.electronAPI.selectFolder().then((result) => {
                          if (result && !result.canceled && result.filePaths && result.filePaths.length > 0) {
                            setCustomOutputFolder(result.filePaths[0]);
                          } else {
                            setOutputDestination('same');
                          }
                        }).catch(() => {
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
          {isProcessing ? (
            <div 
              className="w-full px-4 py-2.5 bg-zinc-800 border border-white/10 rounded-md flex justify-between items-center cursor-default"
            >
              <div className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin text-zinc-400" />
                <span className="text-zinc-300 animate-pulse">
                  {t.messages.processing}
                </span>
              </div>
              <button
                className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                onClick={cancelOptimization}
                title="Cancel"
              >
                <Square size={12} fill="currentColor" />
              </button>
            </div>
          ) : (
            <Button
              onClick={handleExportAll}
              disabled={files.length === 0 || (!isPro && quotaUsed >= quotaLimit)}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {files.length > 0 ? (
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
            </Button>
          )}
        </div>
      </aside>

      {/* ============================================
          ZONE PRINCIPALE - FICHIERS
          ============================================ */}
      <main className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
        {/* En-tête avec titre et actions */}
        <header className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 drag-region">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 no-drag">
              <h1 className="text-xl font-semibold text-zinc-200">
                {files.length <= 1 ? t.main.file : t.main.files}
              </h1>
              <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-semibold rounded">
                {files.length}
              </span>
            </div>
            <div className="flex items-center gap-2 no-drag">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 no-drag"
              >
                <Plus size={14} />
                {t.main.add}
              </button>
              <button
                onClick={handleClearFiles}
                disabled={files.length === 0}
                className="px-3 py-1.5 border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed no-drag"
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
              .filter(tab => tab.id !== 'errors' || tab.count > 0)
              .map((tab) => {
                const isErrorTab = tab.id === 'errors';
                return (
                  <Button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    variant={activeFilter === tab.id 
                      ? (isErrorTab ? 'tabErrorActive' : 'tabActive')
                      : (isErrorTab ? 'tabError' : 'tab')
                    }
                    size="md"
                    className="px-4 py-2"
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
                  </Button>
                );
              })}
            </div>
            
            {/* Sélecteur de layout et menu de tri */}
            {filteredFiles.length > 0 && (
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
          {filteredFiles.length === 0 ? (
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
                {filteredFiles.map((file, index) => (
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
                {filteredFiles.map((file, index) => (
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

      {/* Modale d'activation de licence */}
      <ActivationLicenseModal
        isOpen={showActivationForm}
        onClose={() => {
          setShowActivationForm(false);
          setActivationError(null);
          setActivationSuccess(false);
          setLicenseKey('');
        }}
        licenseKey={licenseKey}
        setLicenseKey={setLicenseKey}
        handleActivation={handleActivation}
        isActivating={isActivating}
        activationError={activationError}
        activationSuccess={activationSuccess}
        licenseKeyInputRef={licenseKeyInputRef}
        t={t}
      />
    </>
  );
};

export default PicRedux;


