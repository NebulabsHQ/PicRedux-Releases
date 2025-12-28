// Translations for PicRedux
// Default language: English (en)

export const translations = {
  en: {
      // Sidebar - Profiles
      sidebar: {
        profiles: "Profiles",
        profilesTooltip: "Select a predefined profile to automatically configure resize dimensions",
        profile: "Profile",
        profileShopify: "Shopify / E-commerce",
        profileInstagram: "Instagram / Social",
        profileEmail: "Email / Newsletter",
        profileSocialMedia: "Social Media Presets",
        profileCustom: "Custom",
        socialPlatform: "Platform",
        socialType: "Type",
        socialInstagram: "Instagram",
        socialYouTube: "YouTube",
        socialFacebook: "Facebook",
        socialInstagramPost: "Post (1:1)",
        socialInstagramStory: "Story (9:16)",
        socialInstagramReel: "Reel (9:16)",
        socialYouTubeThumbnail: "Thumbnail",
        socialYouTubeChannelArt: "Channel Art",
        socialFacebookPost: "Post",
        socialFacebookCover: "Cover Photo",
      backgroundFill: "Background Fill",
      backgroundFillNote: "If unchecked, original transparency is preserved",
      backgroundColor: "Color",
      backgroundColorBlack: "Black",
      backgroundColorWhite: "White",
      recommended: "Recommended",
      
      // Format & Quality
      formatQuality: "Format & Quality",
      formatQualityTooltip: "Select the output format and compression level.",
      format: "Format",
      quality: "Quality",
      qualityManual: "Manual",
      qualityAuto: "Auto",
      qualityOptimal: "Optimal",
      stripMetadata: "Strip metadata",
      stripMetadataDesc: "EXIF, GPS, Profiles (size reduction)",
      removeMetadata: "Remove metadata",
      removeMetadataDesc: "Removes EXIF/GPS data to reduce file size.",
      prefix: "Prefix",
      suffix: "Suffix",
      example: "Example",
      
      // Resizing
      resizing: "Resizing",
      resizingTooltip: "Resize your images. Leave fields empty to keep original size",
      resizeModeDimensions: "Dimensions (px)",
      resizeModePercentage: "Percentage (%)",
      width: "Width",
      height: "Height",
      original: "Original",
      keepAspectRatio: "Keep aspect ratio",
      resizePercentage: "Make my images {percentage}% of their original size",
      
      // Watermark
      watermark: "Watermark",
      watermarkTooltip: "Add a text or image watermark to your images",
      watermarkType: "Type",
      watermarkTypeImage: "Image",
      watermarkTypeText: "Text",
      watermarkText: "Text",
      watermarkTextPlaceholder: "© PicRedux",
      watermarkPosition: "Position",
      watermarkSize: "Size",
      watermarkOpacity: "Opacity",
      watermarkFont: "Font",
      watermarkColor: "Color",
      watermarkUpload: "Upload logo",
      watermarkRemove: "Remove logo",
      watermarkEnable: "Enable",
      watermarkSelectImage: "Select an image",
      watermarkWhite: "White",
      watermarkBlack: "Black",
      watermarkColorCustom: "Custom",
      watermarkLogoSize: "Logo size",
      watermarkFontSize: "Font size",
      
      // Language selector
      language: "Language",
      languageEN: "EN",
      languageFR: "FR",
      
      // Output
      output: "Output",
      outputTooltip: "Configure where to save optimized images",
      outputDestination: "Destination",
      outputSameAsOriginal: "Same as original",
      outputCustomFolder: "Custom folder...",
      preserveModificationTime: "Preserve file modification time",
      
      // Button text
      optimizeFiles: "Optimize {count} File",
      optimizeFilesPlural: "Optimize {count} Files",
      
      // Quota / Trial
      freeTrial: "Free Trial",
      limitReachedActivateLicense: "Limit reached • Activate license",
      unlockUnlimited: "Unlock unlimited",
      limitReachedActivateLicenseButton: "Limit reached - Activate license",
      trialLimitReached: "Trial limit reached",
      trialLimitReachedMessage: "You have reached the limit of {limit} compressions for the trial version.",
      trialLimitReachedAlert: "Trial limit reached ({used}/{limit}). Activate your license to continue compressing images.",
      optimizedImages: "Optimized images",
      unprocessedImages: "Unprocessed images",
      quotaUsed: "Quota used",
      activateLicenseUnlimited: "Activate license - Unlimited",
      close: "Close",
      
      // License
      activateLicense: "Activate License",
      enterLicenseKey: "Enter your license key",
      verifying: "Verifying...",
      activate: "Activate",
      getLicense: "Get a license",
      
      // License Errors
      licenseKeyEmpty: "Please enter a license key",
      apiNotAvailable: "Electron API not available",
      licenseInvalid: "License key not recognized. Please check that you've entered the correct key and try again.",
      licenseRefunded: "This license has been refunded",
      licenseCancelled: "This license has been cancelled",
      licenseActivationLimitReached: "This license has reached its maximum number of activations.",
      gumroadConnectionError: "Connection error to Gumroad ({statusCode})",
      parseError: "Error reading response: {message}",
      networkError: "Network error: {message}",
      verificationError: "Error verifying license: {message}",
      
      // License Success
      licenseActivated: "License activated successfully! Welcome to PicRedux!",
      
      // License Actions
      clearLicense: "Clear License",
      clearLicenseConfirm: "Are you sure you want to clear the license? You will return to TRIAL mode.",
      licenseActive: "License Active",
    },
    
    // Main View
    main: {
      files: "Files",
      file: "File",
      optimized: "Optimized",
      pending: "Pending",
      errors: "Errors",
      add: "Add",
      clearList: "Clear List",
      sortBy: "Sort by",
      sortByName: "Name",
      sortByGain: "Gain",
      sortBySize: "Max Size",
      readyForOptimization: "Ready for optimization",
      optimizeFiles: "Optimize {count} File",
      optimizeFilesPlural: "Optimize {count} Files",
      totalSpaceSaved: "Total space saved",
      newSession: "Optimize other images",
      restart: "Restart",
      dropImagesHere: "Drop images here",
      noFiles: "No files",
      noOptimizedFiles: "No optimized files",
      noPendingFiles: "No pending files",
      noErrors: "No errors",
      dragImagesHere: "Drag your images here or click \"Add\"",
      removeFromList: "Remove from list",
      remove: "Remove",
      originalLocation: "Original Location",
      openFolder: "Open folder",
      view: "View",
      grid: "Grid",
      list: "List",
      exampleFilename: "image_01_optimized.webp",
      all: "All",
    },
    
    // Messages
    messages: {
      dropImagesHere: "Drop images here",
      processing: "Processing...",
      success: "Success",
      error: "Error",
      ready: "Ready",
      optimizationComplete: "Optimization complete",
      filesOptimized: "files optimized",
      spaceSaved: "space saved",
      optimizationSuccess: "Optimization successful!",
      imagesOptimized: "Images optimized",
      imageOptimized: "Image optimized",
      gainTotal: "Total Gain",
      spaceSavedTotal: "saved in total",
    },
    
    // Units
    units: {
      B: "B",
      KB: "KB",
      MB: "MB",
      GB: "GB",
    },
    
    // Watermark positions
    watermarkPositions: {
      "top-left": "Top Left",
      "top-center": "Top Center",
      "top-right": "Top Right",
      "center-left": "Center Left",
      "center": "Center",
      "center-right": "Center Right",
      "bottom-left": "Bottom Left",
      "bottom-center": "Bottom Center",
      "bottom-right": "Bottom Right",
    },
  },
  
  fr: {
      // Sidebar - Profiles
      sidebar: {
        profiles: "Profils",
        profilesTooltip: "Sélectionnez un profil prédéfini pour configurer automatiquement les dimensions de redimensionnement",
        profile: "Profil",
        profileShopify: "Shopify / E-commerce",
        profileInstagram: "Instagram / Social",
        profileEmail: "Email / Newsletter",
        profileSocialMedia: "Préréglages réseaux sociaux",
        profileCustom: "Personnalisé",
        socialPlatform: "Plateforme",
        socialType: "Type",
        socialInstagram: "Instagram",
        socialYouTube: "YouTube",
        socialFacebook: "Facebook",
        socialInstagramPost: "Publication (1:1)",
        socialInstagramStory: "Story (9:16)",
        socialInstagramReel: "Reel (9:16)",
        socialYouTubeThumbnail: "Miniature",
        socialYouTubeChannelArt: "Bannière de chaîne",
        socialFacebookPost: "Publication",
        socialFacebookCover: "Photo de couverture",
      backgroundFill: "Remplissage d'arrière-plan",
      backgroundFillNote: "Si décoché, la transparence originale est conservée",
      backgroundColor: "Couleur",
      backgroundColorBlack: "Noir",
      backgroundColorWhite: "Blanc",
      recommended: "Recommandé",
      
      // Format & Quality
      formatQuality: "Format & Qualité",
      formatQualityTooltip: "Choisissez le format de sortie et le niveau de compression.",
      format: "Format",
      quality: "Qualité",
      qualityManual: "Manuel",
      qualityAuto: "Auto",
      qualityOptimal: "Optimale",
      stripMetadata: "Supprimer les métadonnées",
      stripMetadataDesc: "EXIF, GPS, Profils (gain de poids)",
      removeMetadata: "Supprimer les métadonnées",
      removeMetadataDesc: "Retire les infos EXIF/GPS pour alléger l'image.",
      prefix: "Préfixe",
      suffix: "Suffixe",
      example: "Exemple",
      
      // Resizing
      resizing: "Redimensionnement",
      resizingTooltip: "Redimensionnez vos images. Laissez les champs vides pour conserver la taille originale",
      resizeModeDimensions: "Dimensions (px)",
      resizeModePercentage: "Pourcentage (%)",
      width: "Largeur",
      height: "Hauteur",
      original: "Original",
      keepAspectRatio: "Conserver le ratio",
      resizePercentage: "Redimensionner mes images à {percentage}% de leur taille originale",
      
      // Watermark
      watermark: "Filigrane",
      watermarkTooltip: "Ajoutez un filigrane texte ou image à vos images",
      watermarkType: "Type",
      watermarkTypeImage: "Image",
      watermarkTypeText: "Texte",
      watermarkText: "Texte",
      watermarkTextPlaceholder: "© PicRedux",
      watermarkPosition: "Position",
      watermarkSize: "Taille",
      watermarkOpacity: "Opacité",
      watermarkFont: "Police",
      watermarkColor: "Couleur",
      watermarkUpload: "Télécharger logo",
      watermarkRemove: "Supprimer logo",
      watermarkEnable: "Activer",
      watermarkSelectImage: "Sélectionner une image",
      watermarkTextPlaceholder: "Votre texte ici...",
      watermarkWhite: "Blanc",
      watermarkBlack: "Noir",
      watermarkColorCustom: "Personnalisé",
      watermarkLogoSize: "Taille du logo",
      watermarkFontSize: "Taille de la police",
      
      // Language selector
      language: "Langue",
      languageEN: "EN",
      languageFR: "FR",
      
      // Output
      output: "Sortie",
      outputTooltip: "Configurez où enregistrer les images optimisées",
      outputDestination: "Destination",
      outputSameAsOriginal: "Même que l'original",
      outputCustomFolder: "Dossier personnalisé...",
      preserveModificationTime: "Préserver la date de modification",
      
      // Button text
      optimizeFiles: "Optimiser {count} fichier",
      optimizeFilesPlural: "Optimiser {count} fichiers",
      
      // Quota / Trial
      freeTrial: "Essai Gratuit",
      limitReachedActivateLicense: "Limite atteinte • Activer la licence",
      unlockUnlimited: "Débloquer illimité",
      limitReachedActivateLicenseButton: "Limite atteinte - Activer la licence",
      trialLimitReached: "Limite d'essai atteinte",
      trialLimitReachedMessage: "Vous avez atteint la limite de {limit} compressions de la version d'essai.",
      trialLimitReachedAlert: "Limite d'essai atteinte ({used}/{limit}). Activez votre licence pour continuer à compresser des images.",
      optimizedImages: "Images optimisées",
      unprocessedImages: "Images non traitées",
      quotaUsed: "Quota utilisé",
      activateLicenseUnlimited: "Activer la licence - Illimité",
      close: "Fermer",
      
      // License
      activateLicense: "Activer la licence",
      enterLicenseKey: "Entrez votre clé de licence",
      verifying: "Vérification...",
      activate: "Activer",
      getLicense: "Obtenir une licence",
      
      // License Errors
      licenseKeyEmpty: "Veuillez entrer une clé de licence",
      apiNotAvailable: "API Electron non disponible",
      licenseInvalid: "Clé de licence non reconnue. Veuillez vérifier que vous avez entré la bonne clé et réessayer.",
      licenseRefunded: "Cette licence a été remboursée",
      licenseCancelled: "Cette licence a été annulée",
      licenseActivationLimitReached: "Cette licence a atteint son nombre maximum d'activations.",
      gumroadConnectionError: "Erreur de connexion à Gumroad ({statusCode})",
      parseError: "Erreur lors de la lecture de la réponse: {message}",
      networkError: "Erreur réseau: {message}",
      verificationError: "Erreur lors de la vérification de la licence: {message}",
      
      // License Success
      licenseActivated: "Licence activée avec succès ! Bienvenue dans PicRedux !",
      
      // License Actions
      clearLicense: "Effacer la licence",
      clearLicenseConfirm: "Êtes-vous sûr de vouloir effacer la licence ? Vous repasserez en mode TRIAL.",
      licenseActive: "Licence Active",
    },
    
    // Main View
    main: {
      files: "Fichiers",
      file: "Fichier",
      optimized: "Optimisés",
      pending: "En attente",
      errors: "Erreurs",
      add: "Ajouter",
      clearList: "Vider la liste",
      sortBy: "Trier par",
      sortByName: "Nom",
      sortByGain: "Gain",
      sortBySize: "Poids final",
      readyForOptimization: "Prêt pour l'optimisation",
      optimizeFiles: "Optimiser {count} fichier",
      optimizeFilesPlural: "Optimiser {count} fichiers",
      totalSpaceSaved: "Espace total économisé",
      newSession: "Optimiser d'autres images",
      dropImagesHere: "Déposez vos images ici",
      noFiles: "Aucun fichier",
      noOptimizedFiles: "Aucun fichier optimisé",
      noPendingFiles: "Aucun fichier en attente",
      noErrors: "Aucune erreur",
      dragImagesHere: "Glissez vos images ici ou cliquez sur \"Ajouter\"",
      removeFromList: "Supprimer de la liste",
      remove: "Supprimer",
      originalLocation: "Emplacement d'origine",
      openFolder: "Ouvrir le dossier",
      view: "Vue",
      grid: "Grille",
      list: "Liste",
      exampleFilename: "image_01_optimisé.webp",
      all: "Tous",
    },
    
    // Messages
    messages: {
      dropImagesHere: "Déposez vos images ici",
      processing: "Traitement en cours...",
      success: "Succès",
      error: "Erreur",
      ready: "Prêt",
      optimizationComplete: "Optimisation terminée",
      filesOptimized: "fichiers optimisés",
      spaceSaved: "d'espace économisé",
      optimizationSuccess: "Optimisation réussie !",
      imagesOptimized: "Images optimisées",
      imageOptimized: "Image optimisée",
      gainTotal: "Gain Total",
      spaceSavedTotal: "économisé au total",
    },
    
    // Units
    units: {
      B: "o",
      KB: "Ko",
      MB: "Mo",
      GB: "Go",
    },
    
    // Watermark positions
    watermarkPositions: {
      "top-left": "Haut gauche",
      "top-center": "Haut centre",
      "top-right": "Haut droite",
      "center-left": "Centre gauche",
      "center": "Centre",
      "center-right": "Centre droite",
      "bottom-left": "Bas gauche",
      "bottom-center": "Bas centre",
      "bottom-right": "Bas droite",
    },
  },
  
  es: {
    // Sidebar - Profiles
    sidebar: {
      profiles: "Perfiles",
      profilesTooltip: "Selecciona un perfil predefinido para configurar automáticamente las dimensiones de redimensionamiento",
      profile: "Perfil",
      profileShopify: "Shopify / E-commerce",
      profileInstagram: "Instagram / Social",
      profileEmail: "Email / Newsletter",
      profileSocialMedia: "Ajustes preestablecidos de redes sociales",
      profileCustom: "Personalizado",
      socialPlatform: "Plataforma",
      socialType: "Tipo",
      socialInstagram: "Instagram",
      socialYouTube: "YouTube",
      socialFacebook: "Facebook",
      socialInstagramPost: "Publicación (1:1)",
      socialInstagramStory: "Story (9:16)",
      socialInstagramReel: "Reel (9:16)",
      socialYouTubeThumbnail: "Miniatura",
      socialYouTubeChannelArt: "Banner del canal",
      socialFacebookPost: "Publicación",
      socialFacebookCover: "Foto de portada",
      backgroundFill: "Relleno de fondo",
      backgroundFillNote: "Si está desmarcado, se conserva la transparencia original",
      backgroundColor: "Color",
      recommended: "Recomendado",
    
    // Format & Quality
    formatQuality: "Formato y Calidad",
    formatQualityTooltip: "Selecciona el formato de salida y el nivel de compresión.",
    format: "Formato",
    quality: "Calidad",
    qualityManual: "Manual",
    qualityAuto: "Automático",
    qualityOptimal: "Óptimo",
    stripMetadata: "Eliminar metadatos",
    stripMetadataDesc: "EXIF, GPS, Perfiles (reducción de tamaño)",
    prefix: "Prefijo",
    suffix: "Sufijo",
    example: "Ejemplo",
    
    // Resizing
    resizing: "Redimensionar",
    resizingTooltip: "Redimensiona tus imágenes. Deja los campos vacíos para mantener el tamaño original",
    resizeModeDimensions: "Dimensiones (px)",
    resizeModePercentage: "Porcentaje (%)",
    width: "Ancho",
    height: "Alto",
    original: "Original",
    keepAspectRatio: "Mantener relación de aspecto",
    resizePercentage: "Hacer mis imágenes {percentage}% de su tamaño original",
    
    // Watermark
    watermark: "Marca de agua",
    watermarkTooltip: "Añade una marca de agua de texto o imagen a tus imágenes",
    watermarkType: "Tipo",
    watermarkTypeImage: "Imagen",
    watermarkTypeText: "Texto",
    watermarkText: "Texto",
    watermarkTextPlaceholder: "© PicRedux",
    watermarkPosition: "Posición",
    watermarkSize: "Tamaño",
    watermarkOpacity: "Opacidad",
    watermarkFont: "Fuente",
    watermarkColor: "Color",
    watermarkUpload: "Subir logo",
    watermarkRemove: "Eliminar logo",
    watermarkEnable: "Activar",
    watermarkSelectImage: "Seleccionar una imagen",
    watermarkTextPlaceholder: "Tu texto aquí...",
    watermarkWhite: "Blanco",
    watermarkBlack: "Negro",
    watermarkColorCustom: "Personalizado",
    watermarkLogoSize: "Tamaño del logo",
    watermarkFontSize: "Tamaño de fuente",
    
    // Language selector
    language: "Idioma",
    languageEN: "EN",
    languageFR: "FR",
    
    // Output
    output: "Salida",
    outputTooltip: "Configura dónde guardar las imágenes optimizadas",
    outputDestination: "Destino",
    outputSameAsOriginal: "Igual que el original",
    outputCustomFolder: "Carpeta personalizada...",
    preserveModificationTime: "Preservar fecha de modificación",
    
    // Button text
    optimizeFiles: "Optimizar {count} archivo",
    optimizeFilesPlural: "Optimizar {count} archivos",
    
    // Quota / Trial
    freeTrial: "Prueba Gratuita",
    limitReachedActivateLicense: "Límite alcanzado • Activar licencia",
    unlockUnlimited: "Desbloquear ilimitado",
    limitReachedActivateLicenseButton: "Límite alcanzado - Activar licencia",
    trialLimitReached: "Límite de prueba alcanzado",
    trialLimitReachedMessage: "Has alcanzado el límite de {limit} compresiones de la versión de prueba.",
    trialLimitReachedAlert: "Límite de prueba alcanzado ({used}/{limit}). Activa tu licencia para continuar comprimiendo imágenes.",
    optimizedImages: "Imágenes optimizadas",
    unprocessedImages: "Imágenes no procesadas",
    quotaUsed: "Cuota utilizada",
    activateLicenseUnlimited: "Activar licencia - Ilimitado",
    close: "Cerrar",
    
    // License
    activateLicense: "Activar licencia",
    enterLicenseKey: "Ingrese su clave de licencia",
    verifying: "Verificando...",
    activate: "Activar",
    getLicense: "Obtener una licencia",
    
    // License Errors
    licenseKeyEmpty: "Por favor ingrese una clave de licencia",
    apiNotAvailable: "API de Electron no disponible",
    licenseInvalid: "Clave de licencia no reconocida. Por favor verifique que ha ingresado la clave correcta e intente nuevamente.",
    licenseRefunded: "Esta licencia ha sido reembolsada",
    licenseCancelled: "Esta licencia ha sido cancelada",
    licenseActivationLimitReached: "Esta licencia ha alcanzado su número máximo de activaciones.",
    gumroadConnectionError: "Error de conexión a Gumroad ({statusCode})",
    parseError: "Error al leer la respuesta: {message}",
    networkError: "Error de red: {message}",
    verificationError: "Error al verificar la licencia: {message}",
    
    // License Success
    licenseActivated: "¡Licencia activada con éxito! ¡Bienvenido a PicRedux!",
    
    // License Actions
    clearLicense: "Borrar licencia",
    clearLicenseConfirm: "¿Está seguro de que desea borrar la licencia? Volverá al modo TRIAL.",
    licenseActive: "Licencia Activa",
  },
  
  // Main View
  main: {
    files: "Archivos",
    file: "Archivo",
    optimized: "Optimizados",
    pending: "Pendientes",
    errors: "Errores",
    add: "Añadir",
    clearList: "Limpiar lista",
    sortBy: "Ordenar por",
    sortByName: "Nombre",
    sortByGain: "Ganancia",
    sortBySize: "Tamaño máximo",
    readyForOptimization: "Listo para optimizar",
    optimizeFiles: "Optimizar {count} archivo",
    optimizeFilesPlural: "Optimizar {count} archivos",
    totalSpaceSaved: "Espacio total ahorrado",
    newSession: "Optimizar otras imágenes",
    restart: "Reiniciar",
    dropImagesHere: "Arrastra tus imágenes aquí",
    noFiles: "Sin archivos",
    noOptimizedFiles: "Sin archivos optimizados",
    noPendingFiles: "Sin archivos pendientes",
    noErrors: "Sin errores",
    dragImagesHere: "Arrastra tus imágenes aquí o haz clic en \"Añadir\"",
    removeFromList: "Eliminar de la lista",
    remove: "Eliminar",
    originalLocation: "Ubicación original",
    openFolder: "Abrir carpeta",
    view: "Vista",
    grid: "Cuadrícula",
    list: "Lista",
    exampleFilename: "imagen_01_optimizada.webp",
    all: "Todos",
  },
  
  // Messages
  messages: {
    dropImagesHere: "Arrastra tus imágenes aquí",
    processing: "Procesando...",
    success: "Éxito",
    error: "Error",
    ready: "Listo",
    optimizationComplete: "Optimización completada",
    filesOptimized: "archivos optimizados",
    spaceSaved: "de espacio ahorrado",
    optimizationSuccess: "¡Optimización exitosa!",
    imagesOptimized: "Imágenes optimizadas",
    imageOptimized: "Imagen optimizada",
    gainTotal: "Ganancia Total",
    spaceSavedTotal: "ahorrado en total",
  },
  
  // Units
  units: {
    B: "B",
    KB: "KB",
    MB: "MB",
    GB: "GB",
  },
  
  // Watermark positions
  watermarkPositions: {
    "top-left": "Superior izquierda",
    "top-center": "Superior centro",
    "top-right": "Superior derecha",
    "center-left": "Centro izquierda",
    "center": "Centro",
    "center-right": "Centro derecha",
    "bottom-left": "Inferior izquierda",
    "bottom-center": "Inferior centro",
    "bottom-right": "Inferior derecha",
  },
  },
  
  de: {
    // Sidebar - Profiles
    sidebar: {
      profiles: "Profile",
      profilesTooltip: "Wählen Sie ein vordefiniertes Profil aus, um die Größenänderungsdimensionen automatisch zu konfigurieren",
      profile: "Profil",
      profileShopify: "Shopify / E-Commerce",
      profileInstagram: "Instagram / Social",
      profileEmail: "E-Mail / Newsletter",
      profileSocialMedia: "Social-Media-Voreinstellungen",
      profileCustom: "Benutzerdefiniert",
      socialPlatform: "Plattform",
      socialType: "Typ",
      socialInstagram: "Instagram",
      socialYouTube: "YouTube",
      socialFacebook: "Facebook",
      socialInstagramPost: "Beitrag (1:1)",
      socialInstagramStory: "Story (9:16)",
      socialInstagramReel: "Reel (9:16)",
      socialYouTubeThumbnail: "Miniaturansicht",
      socialYouTubeChannelArt: "Kanal-Banner",
      socialFacebookPost: "Beitrag",
      socialFacebookCover: "Titelbild",
      backgroundFill: "Hintergrundfüllung",
      backgroundFillNote: "Wenn deaktiviert, wird die ursprüngliche Transparenz beibehalten",
      backgroundColor: "Farbe",
      backgroundColorBlack: "Schwarz",
      backgroundColorWhite: "Weiß",
      recommended: "Empfohlen",
    
    // Format & Quality
    formatQuality: "Format & Qualität",
    formatQualityTooltip: "Wählen Sie das Ausgabeformat und die Komprimierungsstufe.",
    format: "Format",
    quality: "Qualität",
    qualityManual: "Manuell",
    qualityAuto: "Automatisch",
    qualityOptimal: "Optimal",
    stripMetadata: "Metadaten entfernen",
    stripMetadataDesc: "EXIF, GPS, Profile (Größenreduzierung)",
    prefix: "Präfix",
    suffix: "Suffix",
    example: "Beispiel",
    
    // Resizing
    resizing: "Größenänderung",
    resizingTooltip: "Ändern Sie die Größe Ihrer Bilder. Lassen Sie die Felder leer, um die ursprüngliche Größe beizubehalten",
    resizeModeDimensions: "Abmessungen (px)",
    resizeModePercentage: "Prozent (%)",
    width: "Breite",
    height: "Höhe",
    original: "Original",
    keepAspectRatio: "Seitenverhältnis beibehalten",
    resizePercentage: "Meine Bilder auf {percentage}% ihrer ursprünglichen Größe machen",
    
    // Watermark
    watermark: "Wasserzeichen",
    watermarkTooltip: "Fügen Sie Ihren Bildern ein Text- oder Bildwasserzeichen hinzu",
    watermarkType: "Typ",
    watermarkTypeImage: "Bild",
    watermarkTypeText: "Text",
    watermarkText: "Text",
    watermarkTextPlaceholder: "© PicRedux",
    watermarkPosition: "Position",
    watermarkSize: "Größe",
    watermarkOpacity: "Deckkraft",
    watermarkFont: "Schriftart",
    watermarkColor: "Farbe",
    watermarkUpload: "Logo hochladen",
    watermarkRemove: "Logo entfernen",
    watermarkEnable: "Aktivieren",
    watermarkSelectImage: "Ein Bild auswählen",
    watermarkTextPlaceholder: "Ihr Text hier...",
    watermarkWhite: "Weiß",
    watermarkBlack: "Schwarz",
    watermarkColorCustom: "Benutzerdefiniert",
    watermarkLogoSize: "Logo-Größe",
    watermarkFontSize: "Schriftgröße",
    
    // Language selector
    language: "Sprache",
    languageEN: "EN",
    languageFR: "FR",
    
    // Output
    output: "Ausgabe",
    outputTooltip: "Konfigurieren Sie, wo optimierte Bilder gespeichert werden sollen",
    outputDestination: "Ziel",
    outputSameAsOriginal: "Gleich wie Original",
    outputCustomFolder: "Benutzerdefinierter Ordner...",
    preserveModificationTime: "Änderungsdatum beibehalten",
    
    // Button text
    optimizeFiles: "{count} Datei optimieren",
    optimizeFilesPlural: "{count} Dateien optimieren",
    
    // Quota / Trial
    freeTrial: "Kostenlose Testversion",
    limitReachedActivateLicense: "Limit erreicht • Lizenz aktivieren",
    unlockUnlimited: "Unbegrenzt freischalten",
    limitReachedActivateLicenseButton: "Limit erreicht - Lizenz aktivieren",
    trialLimitReached: "Testlimit erreicht",
    trialLimitReachedMessage: "Sie haben das Limit von {limit} Komprimierungen für die Testversion erreicht.",
    trialLimitReachedAlert: "Testlimit erreicht ({used}/{limit}). Aktivieren Sie Ihre Lizenz, um mit der Komprimierung von Bildern fortzufahren.",
    optimizedImages: "Optimierte Bilder",
    unprocessedImages: "Nicht verarbeitete Bilder",
    quotaUsed: "Kontingent verwendet",
    activateLicenseUnlimited: "Lizenz aktivieren - Unbegrenzt",
    close: "Schließen",
    
    // License
    activateLicense: "Lizenz aktivieren",
    enterLicenseKey: "Geben Sie Ihren Lizenzschlüssel ein",
    verifying: "Wird überprüft...",
    activate: "Aktivieren",
    getLicense: "Lizenz erhalten",
    
    // License Errors
    licenseKeyEmpty: "Bitte geben Sie einen Lizenzschlüssel ein",
    apiNotAvailable: "Electron API nicht verfügbar",
    licenseInvalid: "Lizenzschlüssel nicht erkannt. Bitte überprüfen Sie, ob Sie den richtigen Schlüssel eingegeben haben und versuchen Sie es erneut.",
    licenseRefunded: "Diese Lizenz wurde zurückerstattet",
    licenseCancelled: "Diese Lizenz wurde storniert",
    licenseActivationLimitReached: "Diese Lizenz hat die maximale Anzahl von Aktivierungen erreicht.",
    gumroadConnectionError: "Verbindungsfehler zu Gumroad ({statusCode})",
    parseError: "Fehler beim Lesen der Antwort: {message}",
    networkError: "Netzwerkfehler: {message}",
    verificationError: "Fehler bei der Lizenzüberprüfung: {message}",
    
    // License Success
    licenseActivated: "Lizenz erfolgreich aktiviert! Willkommen bei PicRedux!",
    
    // License Actions
    clearLicense: "Lizenz löschen",
    clearLicenseConfirm: "Sind Sie sicher, dass Sie die Lizenz löschen möchten? Sie kehren zum TRIAL-Modus zurück.",
    licenseActive: "Lizenz Aktiv",
  },
  
  // Main View
  main: {
    files: "Dateien",
    file: "Datei",
    optimized: "Optimiert",
    pending: "Ausstehend",
    errors: "Fehler",
    add: "Hinzufügen",
    clearList: "Liste leeren",
    sortBy: "Sortieren nach",
    sortByName: "Name",
    sortByGain: "Gewinn",
    sortBySize: "Maximale Größe",
    readyForOptimization: "Bereit zur Optimierung",
    optimizeFiles: "{count} Datei optimieren",
    optimizeFilesPlural: "{count} Dateien optimieren",
    totalSpaceSaved: "Gesamter gesparter Speicherplatz",
    newSession: "Andere Bilder optimieren",
    restart: "Neu starten",
    dropImagesHere: "Bilder hier ablegen",
    noFiles: "Keine Dateien",
    noOptimizedFiles: "Keine optimierten Dateien",
    noPendingFiles: "Keine ausstehenden Dateien",
    noErrors: "Keine Fehler",
    dragImagesHere: "Ziehen Sie Ihre Bilder hierher oder klicken Sie auf \"Hinzufügen\"",
    removeFromList: "Aus Liste entfernen",
    remove: "Entfernen",
    originalLocation: "Ursprünglicher Speicherort",
    openFolder: "Ordner öffnen",
    view: "Ansicht",
    grid: "Raster",
    list: "Liste",
    exampleFilename: "bild_01_optimiert.webp",
    all: "Alle",
  },
  
  // Messages
  messages: {
    dropImagesHere: "Bilder hier ablegen",
    processing: "Verarbeitung...",
    success: "Erfolg",
    error: "Fehler",
    ready: "Bereit",
    optimizationComplete: "Optimierung abgeschlossen",
    filesOptimized: "Dateien optimiert",
    spaceSaved: "Speicherplatz gespart",
    optimizationSuccess: "Optimierung erfolgreich!",
    imagesOptimized: "Bilder optimiert",
    imageOptimized: "Bild optimiert",
    gainTotal: "Gesamtgewinn",
    spaceSavedTotal: "insgesamt gespart",
  },
  
  // Units
  units: {
    B: "B",
    KB: "KB",
    MB: "MB",
    GB: "GB",
  },
  
  // Watermark positions
  watermarkPositions: {
    "top-left": "Oben links",
    "top-center": "Oben Mitte",
    "top-right": "Oben rechts",
    "center-left": "Mitte links",
    "center": "Mitte",
    "center-right": "Mitte rechts",
    "bottom-left": "Unten links",
    "bottom-center": "Unten Mitte",
    "bottom-right": "Unten rechts",
  },
  },
  
  pt: {
    // Sidebar - Profiles
    sidebar: {
      profiles: "Perfis",
      profilesTooltip: "Selecione um perfil predefinido para configurar automaticamente as dimensões de redimensionamento",
      profile: "Perfil",
      profileShopify: "Shopify / E-commerce",
      profileInstagram: "Instagram / Social",
      profileEmail: "Email / Newsletter",
      profileSocialMedia: "Predefinições de redes sociais",
      profileCustom: "Personalizado",
      socialPlatform: "Plataforma",
      socialType: "Tipo",
      socialInstagram: "Instagram",
      socialYouTube: "YouTube",
      socialFacebook: "Facebook",
      socialInstagramPost: "Publicação (1:1)",
      socialInstagramStory: "Story (9:16)",
      socialInstagramReel: "Reel (9:16)",
      socialYouTubeThumbnail: "Miniatura",
      socialYouTubeChannelArt: "Banner do canal",
      socialFacebookPost: "Publicação",
      socialFacebookCover: "Foto de capa",
      backgroundFill: "Preenchimento de fundo",
      backgroundFillNote: "Se desmarcado, a transparência original é preservada",
      backgroundColor: "Cor",
      recommended: "Recomendado",
    
    // Format & Quality
    formatQuality: "Formato e Qualidade",
    formatQualityTooltip: "Selecione o formato de saída e o nível de compressão.",
    format: "Formato",
    quality: "Qualidade",
    qualityManual: "Manual",
    qualityAuto: "Automático",
    qualityOptimal: "Ótimo",
    stripMetadata: "Remover metadados",
    stripMetadataDesc: "EXIF, GPS, Perfis (redução de tamanho)",
    prefix: "Prefixo",
    suffix: "Sufixo",
    example: "Exemplo",
    
    // Resizing
    resizing: "Redimensionar",
    resizingTooltip: "Redimensione suas imagens. Deixe os campos vazios para manter o tamanho original",
    resizeModeDimensions: "Dimensões (px)",
    resizeModePercentage: "Porcentagem (%)",
    width: "Largura",
    height: "Altura",
    original: "Original",
    keepAspectRatio: "Manter proporção",
    resizePercentage: "Fazer minhas imagens {percentage}% do tamanho original",
    
    // Watermark
    watermark: "Marca d'água",
    watermarkTooltip: "Adicione uma marca d'água de texto ou imagem às suas imagens",
    watermarkType: "Tipo",
    watermarkTypeImage: "Imagem",
    watermarkTypeText: "Texto",
    watermarkText: "Texto",
    watermarkTextPlaceholder: "© PicRedux",
    watermarkPosition: "Posição",
    watermarkSize: "Tamanho",
    watermarkOpacity: "Opacidade",
    watermarkFont: "Fonte",
    watermarkColor: "Cor",
    watermarkUpload: "Enviar logo",
    watermarkRemove: "Remover logo",
    watermarkEnable: "Ativar",
    watermarkSelectImage: "Selecionar uma imagem",
    watermarkTextPlaceholder: "Seu texto aqui...",
    watermarkWhite: "Branco",
    watermarkBlack: "Preto",
    watermarkColorCustom: "Personalizado",
    watermarkLogoSize: "Tamanho do logo",
    watermarkFontSize: "Tamanho da fonte",
    
    // Language selector
    language: "Idioma",
    languageEN: "EN",
    languageFR: "FR",
    
    // Output
    output: "Saída",
    outputTooltip: "Configure onde salvar as imagens otimizadas",
    outputDestination: "Destino",
    outputSameAsOriginal: "Igual ao original",
    outputCustomFolder: "Pasta personalizada...",
    preserveModificationTime: "Preservar data de modificação",
    
    // Button text
    optimizeFiles: "Otimizar {count} arquivo",
    optimizeFilesPlural: "Otimizar {count} arquivos",
    
    // Quota / Trial
    freeTrial: "Teste Grátis",
    limitReachedActivateLicense: "Limite atingido • Ativar licença",
    unlockUnlimited: "Desbloquear ilimitado",
    limitReachedActivateLicenseButton: "Limite atingido - Ativar licença",
    trialLimitReached: "Limite de teste atingido",
    trialLimitReachedMessage: "Você atingiu o limite de {limit} compressões da versão de teste.",
    trialLimitReachedAlert: "Limite de teste atingido ({used}/{limit}). Ative sua licença para continuar comprimindo imagens.",
    optimizedImages: "Imagens otimizadas",
    unprocessedImages: "Imagens não processadas",
    quotaUsed: "Cota usada",
    activateLicenseUnlimited: "Ativar licença - Ilimitado",
    close: "Fechar",
    
    // License
    activateLicense: "Ativar licença",
    enterLicenseKey: "Digite sua chave de licença",
    verifying: "Verificando...",
    activate: "Ativar",
    getLicense: "Obter uma licença",
    
    // License Errors
    licenseKeyEmpty: "Por favor, digite uma chave de licença",
    apiNotAvailable: "API do Electron não disponível",
    licenseInvalid: "Chave de licença não reconhecida. Por favor, verifique se você inseriu a chave correta e tente novamente.",
    licenseRefunded: "Esta licença foi reembolsada",
    licenseCancelled: "Esta licença foi cancelada",
    licenseActivationLimitReached: "Esta licença atingiu seu número máximo de ativações.",
    gumroadConnectionError: "Erro de conexão com Gumroad ({statusCode})",
    parseError: "Erro ao ler a resposta: {message}",
    networkError: "Erro de rede: {message}",
    verificationError: "Erro ao verificar a licença: {message}",
    
    // License Success
    licenseActivated: "Licença ativada com sucesso! Bem-vindo ao PicRedux!",
    
    // License Actions
    clearLicense: "Limpar licença",
    clearLicenseConfirm: "Tem certeza de que deseja limpar a licença? Você voltará ao modo TRIAL.",
    licenseActive: "Licença Ativa",
  },
  
  // Main View
  main: {
    files: "Arquivos",
    file: "Arquivo",
    optimized: "Otimizados",
    pending: "Pendentes",
    errors: "Erros",
    add: "Adicionar",
    clearList: "Limpar lista",
    sortBy: "Ordenar por",
    sortByName: "Nome",
    sortByGain: "Ganho",
    sortBySize: "Tamanho máximo",
    readyForOptimization: "Pronto para otimizar",
    optimizeFiles: "Otimizar {count} arquivo",
    optimizeFilesPlural: "Otimizar {count} arquivos",
    totalSpaceSaved: "Espaço total economizado",
    newSession: "Otimizar outras imagens",
    restart: "Reiniciar",
    dropImagesHere: "Arraste suas imagens aqui",
    noFiles: "Nenhum arquivo",
    noOptimizedFiles: "Nenhum arquivo otimizado",
    noPendingFiles: "Nenhum arquivo pendente",
    noErrors: "Nenhum erro",
    dragImagesHere: "Arraste suas imagens aqui ou clique em \"Adicionar\"",
    removeFromList: "Remover da lista",
    remove: "Remover",
    originalLocation: "Localização original",
    openFolder: "Abrir pasta",
    view: "Visualização",
    grid: "Grade",
    list: "Lista",
    exampleFilename: "imagem_01_otimizada.webp",
    all: "Todos",
  },
  
  // Messages
  messages: {
    dropImagesHere: "Arraste suas imagens aqui",
    processing: "Processando...",
    success: "Sucesso",
    error: "Erro",
    ready: "Pronto",
    optimizationComplete: "Otimização concluída",
    filesOptimized: "arquivos otimizados",
    spaceSaved: "de espaço economizado",
    optimizationSuccess: "Otimização bem-sucedida!",
    imagesOptimized: "Imagens otimizadas",
    imageOptimized: "Imagem otimizada",
    gainTotal: "Ganho Total",
    spaceSavedTotal: "economizado no total",
  },
  
  // Units
  units: {
    B: "B",
    KB: "KB",
    MB: "MB",
    GB: "GB",
  },
  
  // Watermark positions
  watermarkPositions: {
    "top-left": "Superior esquerdo",
    "top-center": "Superior centro",
    "top-right": "Superior direito",
    "center-left": "Centro esquerdo",
    "center": "Centro",
    "center-right": "Centro direito",
    "bottom-left": "Inferior esquerdo",
    "bottom-center": "Inferior centro",
    "bottom-right": "Inferior direito",
  },
  },
};

// Supported languages
export const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
];

// Detect system language
export const detectLanguage = async () => {
  // Try to get language from Electron app if available
  if (window.electronAPI && window.electronAPI.getLocale) {
    try {
      const locale = await window.electronAPI.getLocale();
      // Map locale to supported language
      if (locale.startsWith('es')) return 'es';
      if (locale.startsWith('de')) return 'de';
      if (locale.startsWith('fr')) return 'fr';
      if (locale.startsWith('pt')) return 'pt';
      return 'en'; // Default to English
    } catch (e) {
      // Fallback if async call fails
    }
  }
  
  // Fallback to navigator.language
  const lang = navigator.language || navigator.userLanguage;
  if (lang.startsWith('es')) return 'es';
  if (lang.startsWith('de')) return 'de';
  if (lang.startsWith('fr')) return 'fr';
  if (lang.startsWith('pt')) return 'pt';
  return 'en'; // Default to English
};

// Get translations for a specific language
export const getTranslations = (lang = 'en') => {
  return translations[lang] || translations.en;
};

