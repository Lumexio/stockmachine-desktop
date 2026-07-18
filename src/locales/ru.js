export default {
  "app": {
    "title": "STOCKMACHINE",
    "theme": {
      "dark": "Тёмная тема",
      "light": "Светлая тема"
    }
  },
  "navigation": {
    "products": "Товары",
    "categories": "Категории",
    "racks": "Стеллажи",
    "shelves": "Полки",
    "settings": "Настройки",
    "dashboard": "Панель",
    "history": "История"
  },
  "actions": {
    "create": "Создать",
    "edit": "Редактировать",
    "delete": "Удалить",
    "save": "Сохранить",
    "cancel": "Отмена",
    "close": "Закрыть",
    "confirm": "Подтвердить",
    "import": "Импорт",
    "export": "Экспорт товаров",
    "entry": "Приход",
    "withdrawal": "Расход"
  },
  "modals": {
    "deleteConfirm": "Вы хотите удалить эту запись?",
    "import": {
      "title": "Импорт данных",
      "selectFile": "Выбрать файл"
    }
  },
  "messages": {
    "success": {
      "created": "Запись успешно создана",
      "updated": "Запись успешно обновлена",
      "deleted": "Запись успешно удалена",
      "imported": "Данные успешно импортированы и обновлены",
      "exported": "Данные успешно экспортированы и обновлены"
    },
    "error": {
      "create": "Ошибка при создании записи",
      "update": "Ошибка при обновлении записи",
      "delete": "Ошибка при удалении записи",
      "import": "Ошибка при импорте",
      "export": "Ошибка при экспорте"
    }
  },
  "common": {
    "search": "Поиск",
    "actions": "Действия",
    "notes": "Заметки"
  },
  "tables": {
    "products": {
      "title": "Управление товарами",
      "create": "Создать товар",
      "edit": "Редактировать товар",
      "delete": "Удалить товар",
      "columns": {
        "name": "Название",
        "category_name": "Категория",
        "shelve_name": "Полка",
        "rack_name": "Стеллаж",
        "quantity": "Количество",
        "description": "Описание"
      }
    },
    "categories": {
      "title": "Управление категориями",
      "create": "Создать категорию",
      "edit": "Редактировать категорию",
      "delete": "Удалить категорию",
      "columns": {
        "id": "ID",
        "name": "Название",
        "description": "Описание"
      }
    },
    "shelves": {
      "title": "Управление полками",
      "create": "Создать полку",
      "edit": "Редактировать полку",
      "delete": "Удалить полку",
      "columns": {
        "id": "ID",
        "name": "Название"
      }
    },
    "racks": {
      "title": "Управление стеллажами",
      "create": "Создать стеллаж",
      "edit": "Редактировать стеллаж",
      "delete": "Удалить стеллаж",
      "columns": {
        "id": "ID",
        "name": "Название",
        "shelve_name": "Полка"
      }
    },
    "history": {
      "title": "История операций",
      "columns": {
        "entity_type": "Тип сущности",
        "operation": "Операция",
        "quantity_before": "Кол-во до",
        "quantity_after": "Кол-во после",
        "notes": "Заметки",
        "created_at": "Дата/Время",
        "user": "Пользователь",
        "entity": "Сущность",
        "qty_change": "Изм. кол-ва"
      }
    }
  },
  "forms": {
    "label": {
      "import": {
        "title": "Импорт данных",
        "selectFile": "Выбрать файл"
      },
      "products": {
        "name": "Название",
        "quantity": "Количество",
        "description": "Описание",
        "category_name": "Категория",
        "shelve_name": "Полка",
        "rack_name": "Стеллаж"
      },
      "categories": {
        "name": "Название",
        "description": "Описание"
      },
      "shelves": {
        "name": "Название",
        "description": "Описание"
      },
      "racks": {
        "name": "Название",
        "description": "Описание"
      }
    },
    "placeholders": {
      "name": "Введите название",
      "description": "Введите описание",
      "quantity": "Введите количество",
      "price": "Введите цену",
      "category": "Выберите категорию",
      "shelve": "Выберите полку",
      "rack": "Выберите стеллаж"
    },
    "validation": {
      "required": "Это поле обязательно"
    }
  },
  "auth": {
    "login": "Войти",
    "register": "Зарегистрироваться",
    "logout": "Выйти",
    "email": "Электронная почта",
    "password": "Пароль",
    "name": "Полное имя",
    "role": "Роль",
    "orgName": "Название организации",
    "orgNameHint": "Оставьте пустым для регистрации как физическое лицо",
    "noAccount": "Нет аккаунта? Зарегистрироваться",
    "hasAccount": "Уже есть аккаунт? Войти",
    "invalidCredentials": "Неверный email или пароль",
    "continueOffline": "Продолжить оффлайн",
    "createAccount": "Создать аккаунт",
    "accountType": "Тип аккаунта",
    "individual": "Физическое лицо",
    "individualDesc": "Личное использование — один склад",
    "organization": "Организация",
    "orgDesc": "Многоуровневый склад для команд",
    "forgotPassword": "Забыли пароль?"
  },
  "settings": {
    "title": "Настройки",
    "userProfile": "Профиль пользователя",
    "language": "Язык",
    "appearance": "Внешний вид",
    "account": "Аккаунт",
    "connectAccount": "Подключить аккаунт",
    "loginToSync": "Войдите, чтобы синхронизировать инвентарь между устройствами.",
    "registerOnWeb": "Зарегистрироваться на сайте",
    "colorSchemes": "Цветовые Схемы"
  },
  "welcome": {
    "title": "Добро пожаловать в STOCKMACHINE",
    "subtitle": "Подключите аккаунт для синхронизации инвентаря между устройствами или продолжите работу оффлайн.",
    "loginBtn": "Войти",
    "registerBtn": "Зарегистрироваться онлайн",
    "offlineBtn": "Продолжить оффлайн"
  },
  "sync": {
    "pending": "{n} ожидающих",
    "syncing": "Синхронизация…",
    "complete": "Синхронизация: {synced} успешно, {failed} неудачно",
    "failed": "Ошибки синхронизации",
    "online": "Онлайн",
    "offline": "Оффлайн"
  },
  "dashboard": {
    "title": "Панель управления",
    "totalProducts": "Всего товаров",
    "lowStock": "Мало на складе",
    "movementsToday": "Движений сегодня",
    "totalEntries": "Всего приходов (кол-во)",
    "totalWithdrawals": "Всего расходов (кол-во)",
    "topProducts": "Топ товаров",
    "stockMovements": "Движение товаров (30 дней)",
    "recentOperations": "История последних операций",
    "noData": "Нет данных",
    "lowStockAlert": "Предупреждение о низком запасе",
    "categoryStock": "Уровни запасов по категориям"
  },
  "entityTypes": {
    "product": "Товар",
    "category": "Категория",
    "rack": "Стеллаж",
    "shelf": "Полка"
  }
};
