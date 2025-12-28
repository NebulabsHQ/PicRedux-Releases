#!/usr/bin/env node

/**
 * Script de vérification des icônes requises pour PicRedux
 * Vérifie que tous les fichiers d'icônes nécessaires sont présents
 */

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'assets', 'icons');

const requiredIcons = {
  png: [
    'icon-16.png',
    'icon-32.png',
    'icon-64.png',
    'icon-128.png',
    'icon-256.png',
    'icon-512.png',
    'icon-1024.png'
  ],
  macos: ['icon.icns'],
  windows: ['icon.ico'],
  linux: ['icon-512.png']
};

function checkIcons() {
  console.log('🔍 Vérification des icônes PicRedux...\n');
  
  if (!fs.existsSync(iconsDir)) {
    console.error('❌ Le dossier assets/icons n\'existe pas!');
    console.log('💡 Créez-le avec: mkdir -p assets/icons');
    process.exit(1);
  }
  
  let missing = [];
  let found = [];
  
  // Vérifier les PNG
  console.log('📄 PNG requis:');
  requiredIcons.png.forEach(icon => {
    const iconPath = path.join(iconsDir, icon);
    if (fs.existsSync(iconPath)) {
      console.log(`  ✅ ${icon}`);
      found.push(icon);
    } else {
      console.log(`  ❌ ${icon} - MANQUANT`);
      missing.push(icon);
    }
  });
  
  // Vérifier .icns (macOS)
  console.log('\n🍎 macOS (.icns):');
  requiredIcons.macos.forEach(icon => {
    const iconPath = path.join(iconsDir, icon);
    if (fs.existsSync(iconPath)) {
      console.log(`  ✅ ${icon}`);
      found.push(icon);
    } else {
      console.log(`  ❌ ${icon} - MANQUANT`);
      missing.push(icon);
      console.log(`  💡 Générez-le avec les outils macOS: iconutil -c icns icon.iconset`);
    }
  });
  
  // Vérifier .ico (Windows)
  console.log('\n🪟 Windows (.ico):');
  requiredIcons.windows.forEach(icon => {
    const iconPath = path.join(iconsDir, icon);
    if (fs.existsSync(iconPath)) {
      console.log(`  ✅ ${icon}`);
      found.push(icon);
    } else {
      console.log(`  ❌ ${icon} - MANQUANT`);
      missing.push(icon);
      console.log(`  💡 Générez-le avec ImageMagick ou un outil en ligne`);
    }
  });
  
  // Résumé
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Fichiers trouvés: ${found.length}`);
  console.log(`❌ Fichiers manquants: ${missing.length}`);
  
  if (missing.length > 0) {
    console.log('\n📝 Pour générer les icônes manquantes:');
    console.log('   Consultez assets/icons/README.md');
    process.exit(1);
  } else {
    console.log('\n🎉 Toutes les icônes sont présentes!');
    process.exit(0);
  }
}

checkIcons();

