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
  export: 'エクスポート'
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
   exported: 'データが正常にエクスポートされました'
  },
  error: {
   create: '作成中にエラーが発生しました',
   update: '更新中にエラーが発生しました',
   delete: '削除中にエラーが発生しました',
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
   create: '製品を作成',
   edit: '製品を編集',
   delete: '製品を削除',
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
   create: 'カテゴリーを作成',
   edit: 'カテゴリーを編集',
   delete: 'カテゴリーを削除',
   columns: {
    id: 'ID',
    name: '名前',
    description: '説明'
   }
  }
 },
 forms: {
  label: {
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
    name: '名前'
   },
   racks: {
    name: '名前',
    shelve_id: '棚'
   }
  },
  placeholders: {
   products: {
    name: '製品名を入力',
    quantity: '数量を入力',
    description: '説明を入力',
    category_id: 'カテゴリーを選択',
    shelve_id: '棚を選択',
    rack_id: 'ラックを選択'
   },
   categories: {
    name: 'カテゴリー名を入力',
    description: '説明を入力'
   },
   shelves: {
    name: '棚名を入力'
   },
   racks: {
    name: 'ラック名を入力'
   }
  },
  validation: {
   required: 'この項目は必須です'
  }
 }
};
