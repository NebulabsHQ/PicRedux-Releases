# Fonction de Reset de Licence et Quota

## Fonction complète (à coller dans la console)

```javascript
// Fonction pour supprimer la licence et réinitialiser le quota
async function resetLicenseAndQuota() {
  try {
    // Vérifier que l'API Electron est disponible
    if (!window.electronAPI) {
      console.error('❌ API Electron non disponible');
      return;
    }

    console.log('🔄 Suppression de la licence...');
    const licenseResult = await window.electronAPI.clearLicense();
    
    if (licenseResult.success) {
      console.log('✅ Licence supprimée avec succès');
    } else {
      console.error('❌ Erreur lors de la suppression de la licence:', licenseResult.error);
    }

    console.log('🔄 Réinitialisation du quota...');
    const quotaResult = await window.electronAPI.resetQuota();
    
    if (quotaResult.success) {
      console.log(`✅ Quota réinitialisé avec succès (${quotaResult.count} compressions)`);
    } else {
      console.error('❌ Erreur lors de la réinitialisation du quota:', quotaResult.error);
    }

    // Vérifier le statut final
    const status = await window.electronAPI.getLicenseStatus();
    const quota = await window.electronAPI.checkQuota();
    
    console.log('\n📊 Statut final:');
    console.log('  - Licence Pro:', status.isPro ? '✅ Oui' : '❌ Non');
    console.log('  - Clé de licence:', status.key || 'Aucune');
    console.log('  - Quota utilisé:', `${quota.count}/${quota.limit}`);
    console.log('  - Quota autorisé:', quota.allowed ? '✅ Oui' : '❌ Non');
    
    console.log('\n✨ Opération terminée ! Rechargez la page pour voir les changements.');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter la fonction
resetLicenseAndQuota();
```

## Version compacte (une ligne)

```javascript
(async()=>{if(!window.electronAPI)return console.error('API non disponible');const l=await window.electronAPI.clearLicense(),q=await window.electronAPI.resetQuota();console.log('✅ Licence:',l.success?'Supprimée':'Erreur',l.error||'');console.log('✅ Quota:',q.success?`Réinitialisé (${q.count})`:'Erreur',q.error||'');const s=await window.electronAPI.getLicenseStatus(),qu=await window.electronAPI.checkQuota();console.log('📊 Statut - Pro:',s.isPro,'| Quota:',`${qu.count}/${qu.limit}`);console.log('✨ Rechargez la page');})();
```

## Instructions d'utilisation

1. Ouvrir la console du navigateur (F12 ou Cmd+Option+I sur Mac)
2. Coller la fonction complète ou la version compacte
3. Appuyer sur Entrée pour exécuter
4. Recharger la page pour voir les changements

La fonction supprime la licence active et réinitialise le quota de compression à 0.

