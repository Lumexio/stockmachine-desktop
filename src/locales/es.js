export default {
  "app": {
    "title": "STOCKMACHINE",
    "theme": {
      "dark": "Modo Oscuro",
      "light": "Modo Claro"
    }
  },
  "navigation": {
    "products": "Productos",
    "categories": "Categorías",
    "racks": "Estantes",
    "shelves": "Repisas",
    "suppliers": "Proveedores",
    "settings": "Ajustes",
    "dashboard": "Panel",
    "history": "Historial"
  },
  "actions": {
    "create": "Crear",
    "edit": "Editar",
    "delete": "Eliminar",
    "save": "Guardar",
    "cancel": "Cancelar",
    "close": "Cerrar",
    "confirm": "Confirmar",
    "import": "Importar",
    "export": "Exportar stock",
    "entry": "Entrada de stock",
    "withdrawal": "Salida de stock"
  },
  "modals": {
    "deleteConfirm": "¿Quieres eliminar este registro?",
    "import": {
      "title": "Importar Datos",
      "selectFile": "Seleccionar Archivo"
    }
  },
  "messages": {
    "success": {
      "created": "Registro creado correctamente",
      "updated": "Registro actualizado correctamente",
      "deleted": "Registro eliminado correctamente",
      "imported": "Datos importados y actualizados correctamente",
      "exported": "Datos exportados y actualizados correctamente"
    },
    "error": {
      "create": "Error al crear el registro",
      "update": "Error al actualizar el registro",
      "delete": "Error al eliminar el registro",
      "import": "Error durante la importación",
      "export": "Error durante la exportación"
    }
  },
  "common": {
    "search": "Buscar",
    "actions": "Acciones",
    "notes": "Notas"
  },
  "tables": {
    "products": {
      "title": "Gestión de Productos",
      "create": "Crear Producto",
      "edit": "Editar Producto",
      "delete": "Eliminar Producto",
      "columns": {
        "name": "Nombre",
        "category_name": "Categoría",
        "shelve_name": "Estante",
        "rack_name": "Rack",
        "quantity": "Cantidad",
        "description": "Descripción",
        "supplier_name": "Proveedor",
        "cost_price": "Costo",
        "selling_price": "Precio",
        "min_stock": "Stock Mín"
      }
    },
    "suppliers": {
      "title": "Gestión de Proveedores",
      "create": "Crear Proveedor",
      "edit": "Editar Proveedor",
      "delete": "Eliminar Proveedor",
      "columns": {
        "id": "ID",
        "name": "Nombre",
        "contact_name": "Nombre de Contacto",
        "email": "Correo Electrónico",
        "phone": "Teléfono",
        "address": "Dirección"
      }
    },
    "categories": {
      "title": "Gestión de Categorías",
      "create": "Crear Categoría",
      "edit": "Editar Categoría",
      "delete": "Eliminar Categoría",
      "columns": {
        "id": "ID",
        "name": "Nombre",
        "description": "Descripción"
      }
    },
    "shelves": {
      "title": "Gestión de Estantes",
      "create": "Crear Estante",
      "edit": "Editar Estante",
      "delete": "Eliminar Estante",
      "columns": {
        "id": "ID",
        "name": "Nombre"
      }
    },
    "racks": {
      "title": "Gestión de Racks",
      "create": "Crear Rack",
      "edit": "Editar Rack",
      "delete": "Eliminar Rack",
      "columns": {
        "id": "ID",
        "name": "Nombre",
        "shelve_name": "Estante"
      }
    },
    "history": {
      "title": "Historial de Operaciones",
      "columns": {
        "entity_type": "Tipo de entidad",
        "operation": "Operación",
        "quantity_before": "Cant. antes",
        "quantity_after": "Cant. después",
        "notes": "Notas",
        "created_at": "Fecha/Hora",
        "user": "Usuario",
        "entity": "Entidad",
        "qty_change": "Cambio de cant."
      }
    }
  },
  "forms": {
    "label": {
      "import": {
        "title": "Arrastra y suelta un archivo o haz clic para seleccionar",
        "selectFile": "Seleccionar Archivo"
      },
      "products": {
        "name": "Nombre",
        "quantity": "Cantidad",
        "description": "Descripción",
        "category_name": "Categoría",
        "shelve_name": "Estante",
        "rack_name": "Rack",
        "supplier_name": "Proveedor",
        "cost_price": "Precio de Costo",
        "selling_price": "Precio de Venta",
        "min_stock": "Límite de Stock Mínimo"
      },
      "suppliers": {
        "name": "Nombre",
        "contact_name": "Nombre de Contacto",
        "email": "Correo Electrónico",
        "phone": "Teléfono",
        "address": "Dirección"
      },
      "categories": {
        "name": "Nombre",
        "description": "Descripción"
      },
      "shelves": {
        "name": "Nombre",
        "description": "Descripción"
      },
      "racks": {
        "name": "Nombre",
        "description": "Descripción"
      }
    },
    "placeholders": {
      "name": "Ingrese nombre",
      "description": "Ingrese descripción",
      "quantity": "Ingrese cantidad",
      "price": "Ingrese precio",
      "category": "Seleccione categoría",
      "shelve": "Seleccione estante",
      "rack": "Seleccione rack"
    },
    "validation": {
      "required": "Este campo es requerido"
    }
  },
  "auth": {
    "login": "Iniciar sesión",
    "register": "Registrarse",
    "logout": "Cerrar sesión",
    "email": "Correo electrónico",
    "password": "Contraseña",
    "name": "Nombre completo",
    "role": "Rol",
    "orgName": "Nombre de la organización",
    "orgNameHint": "Déjelo en blanco para registrarse como individuo",
    "noAccount": "¿No tienes cuenta? Regístrate",
    "hasAccount": "¿Ya tienes cuenta? Inicia sesión",
    "invalidCredentials": "Correo o contraseña incorrectos",
    "continueOffline": "Continuar sin conexión",
    "createAccount": "Crear cuenta",
    "accountType": "Tipo de cuenta",
    "individual": "Individual",
    "individualDesc": "Uso personal — un inventario",
    "organization": "Organización",
    "orgDesc": "Inventario multi-ubicación para equipos",
    "forgotPassword": "¿Olvidaste tu contraseña?"
  },
  "settings": {
    "title": "Ajustes",
    "userProfile": "Perfil de usuario",
    "language": "Idioma",
    "appearance": "Apariencia",
    "account": "Cuenta",
    "connectAccount": "Conectar cuenta",
    "loginToSync": "Inicia sesión para sincronizar tu inventario entre dispositivos.",
    "registerOnWeb": "Registrarse en la web",
    "colorSchemes": "Esquemas de Color"
  },
  "welcome": {
    "title": "Bienvenido a STOCKMACHINE",
    "subtitle": "Conecta tu cuenta para sincronizar el inventario entre dispositivos, o continúa trabajando sin conexión.",
    "loginBtn": "Iniciar sesión",
    "registerBtn": "Registrarse en línea",
    "offlineBtn": "Continuar sin conexión"
  },
  "sync": {
    "pending": "{n} pendientes",
    "syncing": "Sincronizando…",
    "complete": "Sync: {synced} sincronizados, {failed} fallidos",
    "failed": "Errores de sincronización",
    "online": "En línea",
    "offline": "Sin conexión"
  },
  "dashboard": {
    "title": "Panel",
    "totalProducts": "Total de productos",
    "lowStock": "Stock bajo",
    "movementsToday": "Movimientos hoy",
    "totalEntries": "Total Entradas (Cant.)",
    "totalWithdrawals": "Total Salidas (Cant.)",
    "topProducts": "Productos más activos",
    "stockMovements": "Movimientos de stock (30 días)",
    "recentOperations": "Historial de operaciones recientes",
    "noData": "Sin datos disponibles",
    "lowStockAlert": "Alerta de stock bajo",
    "categoryStock": "Niveles de stock por categoría",
    "totalValue": "Valor Total de Stock"
  },
  "entityTypes": {
    "product": "Producto",
    "category": "Categoría",
    "rack": "Estante",
    "shelf": "Repisa",
    "supplier": "Proveedor"
  }
};
