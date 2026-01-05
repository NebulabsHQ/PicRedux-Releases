#!/usr/bin/env node
/**
 * Script pour installer les binaires sharp pour les deux architectures macOS
 * Nécessaire pour les builds Electron universels
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const nodeModules = path.join(__dirname, '..', 'node_modules', '@img');

// Packages à installer pour chaque architecture
const packages = {
    x64: ['@img/sharp-darwin-x64', '@img/sharp-libvips-darwin-x64'],
    arm64: ['@img/sharp-darwin-arm64', '@img/sharp-libvips-darwin-arm64']
};

// Dossier temporaire pour sauvegarder les binaires
const tempDir = path.join(__dirname, '..', '.sharp-temp');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function copyDir(src, dest) {
    ensureDir(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

async function main() {
    console.log('📦 Installation des binaires sharp pour macOS universel...\n');

    ensureDir(tempDir);

    // Étape 1: Installer les binaires x64
    console.log('🔧 Installation des binaires x64...');
    try {
        execSync(`npm install --force --os=darwin --cpu=x64 ${packages.x64.join(' ')}`, {
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit'
        });
    } catch (e) {
        console.error('Erreur lors de l\'installation x64:', e.message);
    }

    // Sauvegarder les binaires x64
    console.log('💾 Sauvegarde des binaires x64...');
    for (const pkg of packages.x64) {
        const pkgName = pkg.replace('@img/', '');
        const srcDir = path.join(nodeModules, pkgName);
        const destDir = path.join(tempDir, pkgName);
        if (fs.existsSync(srcDir)) {
            copyDir(srcDir, destDir);
            console.log(`  ✓ ${pkgName}`);
        }
    }

    // Étape 2: Installer les binaires arm64
    console.log('\n🔧 Installation des binaires arm64...');
    try {
        execSync(`npm install --force --os=darwin --cpu=arm64 ${packages.arm64.join(' ')}`, {
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit'
        });
    } catch (e) {
        console.error('Erreur lors de l\'installation arm64:', e.message);
    }

    // Étape 3: Restaurer les binaires x64
    console.log('\n📥 Restauration des binaires x64...');
    for (const pkg of packages.x64) {
        const pkgName = pkg.replace('@img/', '');
        const srcDir = path.join(tempDir, pkgName);
        const destDir = path.join(nodeModules, pkgName);
        if (fs.existsSync(srcDir)) {
            copyDir(srcDir, destDir);
            console.log(`  ✓ ${pkgName}`);
        }
    }

    // Étape 4: Copier libvips avec le nom attendu par sharp (libvips-cpp.42.dylib)
    console.log('\n📋 Création des copies libvips-cpp.42.dylib...');
    const libvipsDirs = ['sharp-libvips-darwin-x64', 'sharp-libvips-darwin-arm64'];
    for (const dir of libvipsDirs) {
        const libDir = path.join(nodeModules, dir, 'lib');
        if (fs.existsSync(libDir)) {
            const files = fs.readdirSync(libDir);
            const libvipsFile = files.find(f => f.startsWith('libvips-cpp.') && f.endsWith('.dylib') && !f.includes('42'));
            if (libvipsFile) {
                const targetPath = path.join(libDir, 'libvips-cpp.42.dylib');
                const sourcePath = path.join(libDir, libvipsFile);
                // Renommer le fichier (au lieu de copier) pour réduire la taille du build
                if (fs.existsSync(targetPath)) {
                    fs.unlinkSync(targetPath);
                }
                fs.renameSync(sourcePath, targetPath);
                console.log(`  ✓ ${dir}: ${libvipsFile} renommé en libvips-cpp.42.dylib`);
            }
        }
    }

    // Vérification
    console.log('\n✅ Vérification des binaires installés:');
    const installed = fs.readdirSync(nodeModules);
    for (const dir of installed) {
        console.log(`  • ${dir}`);
    }

    // Nettoyage
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log('\n🎉 Installation terminée!\n');
}

main().catch(console.error);

