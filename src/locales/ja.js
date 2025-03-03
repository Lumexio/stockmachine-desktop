export default {
 app: {
  title: 'STOCKMACHINE',
  theme: {
   dark: 'ダークモード',
   light: 'ライトモード'
  }
 },
 navigation: {
  products: '製品',
  categories: 'カテゴリー',
  racks: 'ラック',
  shelves: '棚'
 },
 actions: {
  create: '作成',
  edit: '編集',
  delete: '削除',
  save: '保存',
  cancel: 'キャンセル',
  close: '閉じる',
  confirm: '確認',
  import: 'インポート',
  export: '在庫をエクスポート'
 },
 modals: {
  deleteConfirm: 'このレコードを削除しますか？',
  import: {
   title: 'データのインポート',
   selectFile: 'ファイルを選択'
  }
 },
 messages: {
  success: {
   created: 'レコードが正常に作成されました',
   updated: 'レコードが正常に更新されました',
   deleted: 'レコードが正常に削除されました',
   imported: 'データが正常にインポートされ更新されました',
   exported: 'データが正常にエクスポートされ更新されました'
  },
  error: {
   create: 'レコードの作成中にエラーが発生しました',
   update: 'レコードの更新中にエラーが発生しました',
   delete: 'レコードの削除中にエラーが発生しました',
   import: 'インポート中にエラーが発生しました',
   export: 'エクスポート中にエラーが発生しました'
  }
 },
 common: {
  search: '検索',
  actions: 'アクション'
 },
 tables: {
  products: {
   title: '製品管理',
   create: '製品作成',
   edit: '製品編集',
   delete: '製品削除',
   columns: {
    name: '名前',
    category_name: 'カテゴリー',
    shelve_name: '棚',
    rack_name: 'ラック',
    quantity: '数量',
    description: '説明'
   }
  },
  categories: {
   title: 'カテゴリー管理',
   create: 'カテゴリー作成',
   edit: 'カテゴリー編集',
   delete: 'カテゴリー削除',
   columns: {
    id: 'ID',
    name: '名前',
    description: '説明'
   }
  },
  shelves: {
   title: '棚管理',
   create: '棚作成',
   edit: '棚編集',
   delete: '棚削除',
   columns: {
    id: 'ID',
    name: '名前'
   }
  },
  racks: {
   title: 'ラック管理',
   create: 'ラック作成',
   edit: 'ラック編集',
   delete: 'ラック削除',
   columns: {
    id: 'ID',
    name: '名前',
    shelve_name: '棚'
   }
  }
 },
 forms: {
  label: {
   import: {
    title: 'データのインポート',
    selectFile: 'ファイルを選択'
   },
   products: {
    name: '名前',
    quantity: '数量',
    description: '説明',
    category_name: 'カテゴリー',
    shelve_name: '棚',
    rack_name: 'ラック'
   },
   categories: {
    name: '名前',
    description: '説明'
   },
   shelves: {
    name: '名前',
    description: '説明'
   },
   racks: {
    name: '名前',
    description: '説明'
   }
  },
  placeholders: {
   name: '名前を入力',
   description: '説明を入力',
   quantity: '数量を入力',
   price: '価格を入力',
   category: 'カテゴリーを選択',
   shelve: '棚を選択',
   rack: 'ラックを選択'
  },
  validation: {
   required: 'この項目は必須です'
  }
 }
};
