export default {
 app: {
  title: 'STOCKMACHINE',
  theme: {
   dark: 'Modo Oscuro',
   light: 'Modo Claro'
  }
 },
 navigation: {
  products: 'Productos',
  categories: 'Categorías',
  racks: 'Estantes',
  shelves: 'Repisas'
 },
 actions: {
  create: 'Crear',
  edit: 'Editar',
  delete: 'Eliminar',
  save: 'Guardar',
  cancel: 'Cancelar',
  close: 'Cerrar',
  confirm: 'Confirmar',
  import: 'Importar',
  export: 'Exportar stock'
 },
 modals: {
  deleteConfirm: '¿Quieres eliminar este registro?',
  import: {
   title: 'Importar Datos',
   selectFile: 'Seleccionar Archivo'
  }
 },
 messages: {
  success: {
   created: 'Registro creado correctamente',
   updated: 'Registro actualizado correctamente',
   deleted: 'Registro eliminado correctamente',
   imported: 'Datos importados y actualizados correctamente',
   exported: 'Datos exportados y actualizados correctamente'
  },
  error: {
   create: 'Error al crear el registro',
   update: 'Error al actualizar el registro',
   delete: 'Error al eliminar el registro',
   import: 'Error durante la importación',
   export: 'Error durante la exportación'
  }
 },
 common: {
  search: 'Buscar',
  actions: 'Acciones'
 },
 tables: {
  products: {
   title: 'Gestión de Productos',
   create: 'Crear Producto',
   edit: 'Editar Producto',
   delete: 'Eliminar Producto',
   columns: {
    name: 'Nombre',
    category_name: 'Categoría',
    shelve_name: 'Estante',
    rack_name: 'Rack',
    quantity: 'Cantidad',
    description: 'Descripción'
   }
  },
  categories: {
   title: 'Gestión de Categorías',
   create: 'Crear Categoría',
   edit: 'Editar Categoría',
   delete: 'Eliminar Categoría',
   columns: {
    id: 'ID',
    name: 'Nombre',
    description: 'Descripción'
   }
  },
  shelves: {
   title: 'Gestión de Estantes',
   create: 'Crear Estante',
   edit: 'Editar Estante',
   delete: 'Eliminar Estante',
   columns: {
    id: 'ID',
    name: 'Nombre'
   }
  },
  racks: {
   title: 'Gestión de Racks',
   create: 'Crear Rack',
   edit: 'Editar Rack',
   delete: 'Eliminar Rack',
   columns: {
    id: 'ID',
    name: 'Nombre',
    shelve_name: 'Estante'
   }
  }
 },
 forms: {
  label: {
   products: {
    name: 'Nombre',
    quantity: 'Cantidad',
    description: 'Descripción',
    category_name: 'Categoría',
    shelve_name: 'Estante',
    rack_name: 'Rack'
   },
   categories: {
    name: 'Nombre',
    description: 'Descripción'
   },
   shelves: {
    name: 'Nombre',
    description: 'Descripción'
   },
   racks: {
    name: 'Nombre',
    description: 'Descripción'
   }
  },
  placeholders: {
   products: {
    name: 'Ingrese nombre del producto',
    quantity: 'Ingrese cantidad',
    description: 'Ingrese descripción del producto',
    category_id: 'Seleccione categoría',
    shelve_id: 'Seleccione estante',
    rack_id: 'Seleccione rack'
   },
   categories: {
    name: 'Ingrese nombre de la categoría',
    description: 'Ingrese descripción de la categoría'
   },
   shelves: {
    name: 'Ingrese nombre del estante',
    description: 'Ingrese descripción del estante'
   },
   racks: {
    name: 'Ingrese nombre del rack',
    description: 'Ingrese descripción del rack'
   }
  },
  validation: {
   required: 'Este campo es requerido'
  }
 }
};
