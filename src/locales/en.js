export default {
 app: {
  title: 'STOCKMACHINE',
  theme: {
   dark: 'Dark Mode',
   light: 'Light Mode'
  }
 },
 navigation: {
  products: 'Products',
  categories: 'Categories',
  racks: 'Racks',
  shelves: 'Shelves'
 },
 actions: {
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  save: 'Save',
  cancel: 'Cancel',
  close: 'Close',
  confirm: 'Confirm',
  import: 'Import',
  export: 'Export stock'
 },
 modals: {
  deleteConfirm: 'Do you want to delete this record?',
  import: {
   title: 'Import Data',
   selectFile: 'Select File'
  }
 },
 messages: {
  success: {
   created: 'Record created successfully',
   updated: 'Record updated successfully',
   deleted: 'Record deleted successfully',
   imported: 'Data imported and refreshed successfully',
   exported: 'Data exported and refreshed successfully'
  },
  error: {
   create: 'Error creating record',
   update: 'Error updating record',
   delete: 'Error deleting record',
   import: 'Error during import',
   export: 'Error during export'
  }
 },
 common: {
  search: 'Search',
  actions: 'Actions'
 },
 tables: {
  products: {
   title: 'Products Management',
   create: 'Create Product',
   edit: 'Edit Product',
   delete: 'Delete Product',
   columns: {
    name: 'Name',
    category_name: 'Category',
    shelve_name: 'Shelve',
    rack_name: 'Rack',
    quantity: 'Quantity',
    description: 'Description'
   }
  },
  categories: {
   title: 'Categories Management',
   create: 'Create Category',
   edit: 'Edit Category',
   delete: 'Delete Category',
   columns: {
    id: 'ID',
    name: 'Name',
    description: 'Description'
   }
  }
 },
 forms: {
  label: {
   products: {
    name: 'Name',
    quantity: 'Quantity',

   }
  },
  placeholders: {
   products: {
    name: 'Enter product name',
    quantity: 'Enter quantity',
    description: 'Enter product description',
    category_id: 'Select category',
    shelve_id: 'Select shelve',
    rack_id: 'Select rack'
   },
   categories: {
    name: 'Enter category name',
    description: 'Enter category description'
   },
   shelves: {
    name: 'Enter shelve name'
   },
   racks: {
    name: 'Enter rack name'
   }
  },
  validation: {
   required: 'This field is required'
  }
 }
};
