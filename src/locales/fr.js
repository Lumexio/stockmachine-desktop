export default {
 app: {
  title: 'STOCKMACHINE',
  theme: {
   dark: 'Mode Sombre',
   light: 'Mode Clair'
  }
 },
 navigation: {
  products: 'Produits',
  categories: 'Catégories',
  racks: 'Étagères',
  shelves: 'Rayons'
 },
 actions: {
  create: 'Créer',
  edit: 'Modifier',
  delete: 'Supprimer',
  save: 'Enregistrer',
  cancel: 'Annuler',
  close: 'Fermer',
  confirm: 'Confirmer',
  import: 'Importer',
  export: 'Exporter stock'
 },
 modals: {
  deleteConfirm: 'Voulez-vous supprimer cet enregistrement ?',
  import: {
   title: 'Importer des Données',
   selectFile: 'Sélectionner un Fichier'
  }
 },
 messages: {
  success: {
   created: 'Enregistrement créé avec succès',
   updated: 'Enregistrement mis à jour avec succès',
   deleted: 'Enregistrement supprimé avec succès',
   imported: 'Données importées et actualisées avec succès',
   exported: 'Données exportées et actualisées avec succès'
  },
  error: {
   create: 'Erreur lors de la création',
   update: 'Erreur lors de la mise à jour',
   delete: 'Erreur lors de la suppression',
   import: 'Erreur lors de l\'importation',
   export: 'Erreur lors de l\'exportation'
  }
 },
 common: {
  search: 'Rechercher',
  actions: 'Actions'
 },
 tables: {
  products: {
   title: 'Gestion des Produits',
   create: 'Créer un Produit',
   edit: 'Modifier le Produit',
   delete: 'Supprimer le Produit',
   columns: {
    name: 'Nom',
    category_name: 'Catégorie',
    shelve_name: 'Étagère',
    rack_name: 'Rayon',
    quantity: 'Quantité',
    description: 'Description'
   }
  },
  categories: {
   title: 'Gestion des Catégories',
   create: 'Créer une Catégorie',
   edit: 'Modifier la Catégorie',
   delete: 'Supprimer la Catégorie',
   columns: {
    id: 'ID',
    name: 'Nom',
    description: 'Description'
   }
  }
 },
 forms: {
  label: {
   products: {
    name: 'Nom',
    quantity: 'Quantité',
    description: 'Description',
    category_name: 'Catégorie',
    shelve_name: 'Étagère',
    rack_name: 'Rayon'
   },
   categories: {
    name: 'Nom',
    description: 'Description'
   },
   shelves: {
    name: 'Nom'
   },
   racks: {
    name: 'Nom',
    shelve_id: 'Étagère'
   }
  },
  placeholders: {
   products: {
    name: 'Entrez le nom du produit',
    quantity: 'Entrez la quantité',
    description: 'Entrez la description du produit',
    category_id: 'Sélectionnez une catégorie',
    shelve_id: 'Sélectionnez une étagère',
    rack_id: 'Sélectionnez un rayon'
   },
   categories: {
    name: 'Entrez le nom de la catégorie',
    description: 'Entrez la description de la catégorie'
   },
   shelves: {
    name: 'Entrez le nom de l\'étagère'
   },
   racks: {
    name: 'Entrez le nom du rayon'
   }
  },
  validation: {
   required: 'Ce champ est obligatoire'
  }
 }
};
