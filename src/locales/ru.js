export default {
 app: {
  title: 'STOCKMACHINE',
  theme: {
   dark: 'Темная Тема',
   light: 'Светлая Тема'
  }
 },
 navigation: {
  products: 'Товары',
  categories: 'Категории',
  racks: 'Стеллажи',
  shelves: 'Полки'
 },
 actions: {
  create: 'Создать',
  edit: 'Редактировать',
  delete: 'Удалить',
  save: 'Сохранить',
  cancel: 'Отмена',
  close: 'Закрыть',
  confirm: 'Подтвердить',
  import: 'Импорт',
  export: 'Экспорт'
 },
 modals: {
  deleteConfirm: 'Вы хотите удалить эту запись?',
  import: {
   title: 'Импорт Данных',
   selectFile: 'Выбрать Файл'
  }
 },
 messages: {
  success: {
   created: 'Запись успешно создана',
   updated: 'Запись успешно обновлена',
   deleted: 'Запись успешно удалена',
   imported: 'Данные успешно импортированы и обновлены',
   exported: 'Данные успешно экспортированы'
  },
  error: {
   create: 'Ошибка при создании',
   update: 'Ошибка при обновлении',
   delete: 'Ошибка при удалении',
   import: 'Ошибка при импорте',
   export: 'Ошибка при экспорте'
  }
 },
 common: {
  search: 'Поиск',
  actions: 'Действия'
 },
 tables: {
  products: {
   title: 'Управление Товарами',
   create: 'Создать Товар',
   edit: 'Редактировать Товар',
   delete: 'Удалить Товар',
   columns: {
    name: 'Название',
    category_name: 'Категория',
    shelve_name: 'Полка',
    rack_name: 'Стеллаж',
    quantity: 'Количество',
    description: 'Описание'
   }
  },
  categories: {
   title: 'Управление Категориями',
   create: 'Создать Категорию',
   edit: 'Редактировать Категорию',
   delete: 'Удалить Категорию',
   columns: {
    id: 'ID',
    name: 'Название',
    description: 'Описание'
   }
  }
 },
 forms: {
  label: {
   products: {
    name: 'Название',
    quantity: 'Количество',
    description: 'Описание',
    category_name: 'Категория',
    shelve_name: 'Полка',
    rack_name: 'Стеллаж'
   },
   categories: {
    name: 'Название',
    description: 'Описание'
   },
   shelves: {
    name: 'Название'
   },
   racks: {
    name: 'Название',
    shelve_id: 'Полка'
   }
  },
  placeholders: {
   products: {
    name: 'Введите название товара',
    quantity: 'Введите количество',
    description: 'Введите описание товара',
    category_id: 'Выберите категорию',
    shelve_id: 'Выберите полку',
    rack_id: 'Выберите стеллаж'
   },
   categories: {
    name: 'Введите название категории',
    description: 'Введите описание категории'
   },
   shelves: {
    name: 'Введите название полки'
   },
   racks: {
    name: 'Введите название стеллажа'
   }
  },
  validation: {
   required: 'Это поле обязательно для заполнения'
  }
 }
};
