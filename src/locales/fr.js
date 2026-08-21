export default {
  "app": {
    "title": "STOCKMACHINE",
    "theme": {
      "dark": "Mode sombre",
      "light": "Mode clair"
    }
  },
  "navigation": {
    "products": "Produits",
    "categories": "Catégories",
    "racks": "Étagères",
    "shelves": "Rayons",
    "settings": "Paramètres",
    "dashboard": "Tableau de bord",
    "history": "Historique"
  },
  "actions": {
    "create": "Créer",
    "edit": "Modifier",
    "delete": "Supprimer",
    "save": "Enregistrer",
    "cancel": "Annuler",
    "close": "Fermer",
    "confirm": "Confirmer",
    "import": "Importer",
    "export": "Exporter le stock",
    "entry": "Entrée de stock",
    "withdrawal": "Sortie de stock",
    "data": "Données",
    "discard": "Ignorer"
  },
  "modals": {
    "deleteConfirm": "Voulez-vous supprimer cet enregistrement ?",
    "import": {
      "title": "Importer des données",
      "selectFile": "Sélectionner un fichier"
    }
  },
  "messages": {
    "success": {
      "created": "Enregistrement créé avec succès",
      "updated": "Enregistrement mis à jour avec succès",
      "deleted": "Enregistrement supprimé avec succès",
      "imported": "Données importées et actualisées avec succès",
      "exported": "Données exportées et actualisées avec succès"
    },
    "error": {
      "create": "Erreur lors de la création",
      "update": "Erreur lors de la mise à jour",
      "delete": "Erreur lors de la suppression",
      "import": "Erreur lors de l'importation",
      "export": "Erreur lors de l'exportation",
      "noLocation": "Pas d'emplacement",
      "permissionRequired": "Permission requise",
      "cameraPermission": "La permission de la caméra est requise."
    },
    "confirm": {
      "discard": "Ignorer les modifications?"
    },
    "info": {
      "pointCamera": "Pointez la caméra vers le code-barres"
    }
  },
  "common": {
    "search": "Rechercher",
    "actions": "Actions",
    "notes": "Notes",
    "noData": "Aucune donnée",
    "quantity": "Quantité",
    "optional": "Optionnel"
  },
  "tables": {
    "products": {
      "title": "Gestion des produits",
      "create": "Créer un produit",
      "edit": "Modifier le produit",
      "delete": "Supprimer le produit",
      "columns": {
        "name": "Nom",
        "category_name": "Catégorie",
        "shelve_name": "Rayon",
        "rack_name": "Étagère",
        "quantity": "Quantité",
        "description": "Description",
        "supplier_name": "Fournisseur",
        "cost_price": "Prix de Revient",
        "selling_price": "Prix de Vente",
        "min_stock": "Stock Min",
        "barcode": "Code-barres"
      }
    },
    "categories": {
      "title": "Gestion des catégories",
      "create": "Créer une catégorie",
      "edit": "Modifier la catégorie",
      "delete": "Supprimer la catégorie",
      "columns": {
        "id": "ID",
        "name": "Nom",
        "description": "Description"
      }
    },
    "shelves": {
      "title": "Gestion des rayons",
      "create": "Créer un rayon",
      "edit": "Modifier le rayon",
      "delete": "Supprimer le rayon",
      "columns": {
        "id": "ID",
        "name": "Nom"
      }
    },
    "racks": {
      "title": "Gestion des étagères",
      "create": "Créer une étagère",
      "edit": "Modifier l'étagère",
      "delete": "Supprimer l'étagère",
      "columns": {
        "id": "ID",
        "name": "Nom",
        "shelve_name": "Rayon"
      }
    },
    "history": {
      "title": "Historique des opérations",
      "columns": {
        "entity_type": "Type d'entité",
        "operation": "Opération",
        "quantity_before": "Qté avant",
        "quantity_after": "Qté après",
        "notes": "Notes",
        "created_at": "Date/Heure",
        "user": "Utilisateur",
        "entity": "Entité",
        "qty_change": "Var. qté"
      }
    },
    "suppliers": {
      "title": "Fournisseurs",
      "columns": {
        "name": "Nom",
        "contact_name": "Nom du Contact",
        "email": "Email",
        "phone": "Téléphone"
      }
    }
  },
  "forms": {
    "label": {
      "import": {
        "title": "Importer des données",
        "selectFile": "Sélectionner un fichier"
      },
      "products": {
        "name": "Nom",
        "quantity": "Quantité",
        "description": "Description",
        "category_name": "Catégorie",
        "shelve_name": "Rayon",
        "rack_name": "Étagère",
        "supplier_name": "Fournisseur",
        "cost_price": "Prix de Revient",
        "selling_price": "Prix de Vente",
        "min_stock": "Stock Min",
        "status": "Statut",
        "barcode": "Code-barres"
      },
      "categories": {
        "name": "Nom",
        "description": "Description"
      },
      "shelves": {
        "name": "Nom",
        "description": "Description"
      },
      "racks": {
        "name": "Nom",
        "description": "Description",
        "shelve_name": "Étagère"
      },
      "suppliers": {
        "name": "Nom",
        "contact_name": "Nom du Contact",
        "email": "Email",
        "phone": "Téléphone",
        "address": "Adresse"
      }
    },
    "placeholders": {
      "name": "Entrez le nom",
      "description": "Entrez la description",
      "quantity": "Entrez la quantité",
      "price": "Entrez le prix",
      "category": "Sélectionnez la catégorie",
      "shelve": "Sélectionnez le rayon",
      "rack": "Sélectionnez l'étagère",
      "notes": "Notes",
      "barcode": "Scanner ou entrer le code-barres"
    },
    "validation": {
      "required": "Ce champ est obligatoire"
    }
  },
  "auth": {
    "login": "Se connecter",
    "register": "S'inscrire",
    "logout": "Se déconnecter",
    "email": "E-mail",
    "password": "Mot de passe",
    "name": "Nom complet",
    "role": "Rôle",
    "orgName": "Nom de l'organisation",
    "orgNameHint": "Laissez vide pour vous inscrire en tant qu'individu",
    "noAccount": "Pas de compte ? S'inscrire",
    "hasAccount": "Déjà un compte ? Se connecter",
    "invalidCredentials": "E-mail ou mot de passe incorrect",
    "continueOffline": "Continuer hors ligne",
    "createAccount": "Créer un compte",
    "accountType": "Type de compte",
    "individual": "Individuel",
    "individualDesc": "Usage personnel — un inventaire",
    "organization": "Organisation",
    "orgDesc": "Inventaire multi-sites pour les équipes",
    "forgotPassword": "Mot de passe oublié ?",
    "error": "Erreur"
  },
  "settings": {
    "title": "Paramètres",
    "userProfile": "Profil utilisateur",
    "language": "Langue",
    "appearance": "Apparence",
    "account": "Compte",
    "connectAccount": "Connecter un compte",
    "loginToSync": "Connectez-vous pour synchroniser votre inventaire sur tous vos appareils.",
    "registerOnWeb": "S'inscrire sur le web",
    "colorSchemes": "Schémas de Couleur",
    "catalogSnapshot": "Instantané du Catalogue",
    "snapshotDescription": "Sauvegardez vos données",
    "snapshotWarning": "Avertissement",
    "exportSnapshot": "Exporter",
    "importSnapshot": "Importer",
    "snapshotAdminOnly": "Admin uniquement",
    "googleConnected": "Google Connecté",
    "googleNotConnected": "Google Non Connecté",
    "connectGoogleDrive": "Connecter Google Drive",
    "syncThisDevice": "Synchroniser cet app.",
    "restoreGoogleDrive": "Restaurer depuis Drive",
    "snapshotInvalid": "Instantané invalide",
    "googleSynced": "Synchronisé",
    "snapshotConfirm": "Confirmer ?",
    "googleRestored": "Restauré",
    "snapshotExported": "Exporté",
    "snapshotTooLarge": "Trop volumineux",
    "snapshotImported": "Importé"
  },
  "welcome": {
    "title": "Bienvenue dans STOCKMACHINE",
    "subtitle": "Connectez votre compte pour synchroniser votre inventaire, ou continuez à travailler hors ligne.",
    "loginBtn": "Se connecter",
    "registerBtn": "S'inscrire en ligne",
    "offlineBtn": "Continuer hors ligne"
  },
  "sync": {
    "pending": "{n} en attente",
    "syncing": "Synchronisation…",
    "complete": "Sync : {synced} synchronisés, {failed} échoués",
    "failed": "Erreurs de synchronisation",
    "online": "En ligne",
    "offline": "Hors ligne"
  },
  "dashboard": {
    "title": "Tableau de bord",
    "totalProducts": "Total produits",
    "lowStock": "Stock bas",
    "movementsToday": "Mouvements aujourd'hui",
    "totalEntries": "Total Entrées (Qté)",
    "totalWithdrawals": "Total Retraits (Qté)",
    "topProducts": "Produits les plus actifs",
    "stockMovements": "Mouvements de stock (30 jours)",
    "recentOperations": "Historique des opérations récentes",
    "noData": "Aucune donnée disponible",
    "lowStockAlert": "Alerte de stock bas",
    "categoryStock": "Niveaux de stock par catégorie",
    "totalStock": "Stock Total",
    "totalValue": "Valeur Totale",
    "movements": "Mouvements"
  },
  "entityTypes": {
    "product": "Produit",
    "category": "Catégorie",
    "rack": "Étagère",
    "shelf": "Rayon"
  },
  "history": {
    "filters": {
      "all": "Tout",
      "entry": "Entrée",
      "withdrawal": "Sortie",
      "product": "Produit",
      "category": "Catégorie",
      "rack": "Rayon",
      "shelf": "Étagère"
    },
    "entity": "Entité",
    "quantityBefore": "Qté Avant",
    "quantityAfter": "Qté Après"
  }
};
