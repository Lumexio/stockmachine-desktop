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
  },
  shelves: {
   title: 'Shelves Management',
   create: 'Create Shelve',
   edit: 'Edit Shelve',
   delete: 'Delete Shelve',
   columns: {
    id: 'ID',
    name: 'Name'
   }
  },
  racks: {
   title: 'Racks Management',
   create: 'Create Rack',
   edit: 'Edit Rack',
   delete: 'Delete Rack',
   columns: {
    id: 'ID',
    name: 'Name',
    shelve_name: 'Shelve'
   }
  }
 },
 forms: {
  label: {
   import: {
    title: 'Drag and drop a file here or click',
    selectFile: 'Select File'
   },
   products: {
    name: 'Name',
    quantity: 'Quantity',
    description: 'Description',
    category_name: 'Category',
    shelve_name: 'Shelve',
    rack_name: 'Rack'
   },
   categories: {
    name: 'Name',
    description: 'Description'
   },
   shelves: {
    name: 'Name',
    description: 'Description'

   },
   racks: {
    name: 'Name',
    description: 'Description',
   },
  },
  placeholders: {
   name: 'Enter name',
   description: 'Enter description',
   quantity: 'Enter quantity',
   price: 'Enter price',
   category: 'Select category',
   shelve: 'Select shelve',
   rack: 'Select rack'
  },
  validation: {
   required: 'This field is required'
  }
 }
};
