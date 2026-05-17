export const APP_MESSAGES = {
  validation: {
    titleRequired: "タイトルを入力してください",
    categoryNameRequired: "カテゴリ名を入力してください",
  },
  random: {
    noIncompleteTodos: "未完了のタスクがありません。",
  },
  confirm: {
    deleteTodo: {
      title: "タスクを削除しますか？",
      message:
        "このタスクとサブタスクを削除します。\nこの操作は元に戻せません。",
      confirmLabel: "削除",
    },
    deleteCategory: (categoryName: string) => ({
      title: "カテゴリを削除しますか？",
      message: `「${categoryName}」を削除します。\nこのカテゴリ内のタスクもすべて削除されます。\nこの操作は元に戻せません。`,
      confirmLabel: "削除",
    }),
    deleteCompletedTodos: () => ({
      title: "完了済みのタスクを削除しますか？",
      message:
        "完了済みの親タスクを削除すると、未完了のサブタスクも削除されます。\nこの操作は元に戻せません。",
      confirmLabel: "削除",
    }),
  },
} as const;
