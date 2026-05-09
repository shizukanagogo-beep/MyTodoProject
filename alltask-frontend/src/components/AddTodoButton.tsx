type AddTodoButtonProps = {
  onClick: () => void;
};

function AddTodoButton({ onClick }: AddTodoButtonProps) {
  return (
    <button
      className="w-full mb-8 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
      onClick={onClick}
    >
      ＋ 新しいタスクを追加
    </button>
  );
}

export default AddTodoButton;