import type { Todo } from "../types";

type TodoDetailModalProps = {
  todo: Todo;
  onClose: () => void;
  onDeleteTodo: (id: number) => void;
};

function TodoDetailModal({
  todo,
  onClose,
  onDeleteTodo,
}: TodoDetailModalProps) {
  const handleDelete = () => {
    onDeleteTodo(todo.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{todo.title}</h3>
            <div className="flex gap-1 mt-2">
              {todo.hasFlag && (
                <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">
                  🚩重要
                </span>
              )}

              {todo.daily && (
                <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">
                  🔄日課
                </span>
              )}

              {todo.dueDate && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                  {todo.dueDate}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">詳細</p>
            <p className="text-slate-700 whitespace-pre-wrap">
              {todo.details || "詳細はありません"}
            </p>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">ステータス</p>
            <p className="text-slate-700">
              {todo.status === "DONE" ? "完了" : "未完了"}
            </p>
          </div>

          <button
            className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
            onClick={handleDelete}
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}

export default TodoDetailModal;
