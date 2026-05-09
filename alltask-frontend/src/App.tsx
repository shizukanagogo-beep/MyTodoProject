import { useEffect, useState } from "react";
import {
  fetchCategories as fetchCategoriesApi,
  addCategory as addCategoryApi,
} from "./services/categoryService";

import {
  fetchTodos as fetchTodosApi,
  addTodo as addTodoApi,
  updateTodoStatus,
  deleteTodo as deleteTodoApi,
} from "./services/todoService";
import CategoryModal from "./components/CategoryModal";
import TodoModal from "./components/TodoModal";
import TopView from "./components/TopView";
import TodoListView from "./components/TodoListView";
import Header from "./components/Header";
import AddTodoButton from "./components/AddTodoButton";
import type {
  Category,
  Todo,
  TodoSearchParams,
  ViewMode,
  NewTodo,
} from "./types";

// --------------------------------------------------------------------------
function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("TOP");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [newTodo, setNewTodo] = useState<NewTodo>({
    title: "",
    details: "",
    categoryId: "",
    dueDate: "",
    daily: false,
    hasFlag: false,
    autoCarryOver: false,
    overdueBehavior: 0,
  });

  // --- APIロジック (変更なし) ---
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await fetchCategoriesApi();
        setCategories(categories);
      } catch (error) {
        console.error("カテゴリの取得に失敗:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (viewMode === "TOP") return;
    const loadTodos = async () => {
      const params: TodoSearchParams = {};

      if (viewMode === "CATEGORY_DETAIL") {
        params.categoryId = selectedCategoryId;
      }
      if (viewMode === "DATED") params.existsDueDate = true;
      if (viewMode === "DAILY") params.daily = true;
      if (viewMode === "FLAGGED") params.hasFlag = true;

      try {
        const todos = await fetchTodosApi(params);
        setTodos(todos);
      } catch (error) {
        console.error("タスクの取得に失敗:", error);
      }
    };
    loadTodos();
  }, [viewMode, selectedCategoryId, refreshKey]);

  const addTodo = async () => {
    if (!newTodo.title.trim()) {
      alert("タイトルを入力してください");
      return;
    }
    const finalCategoryId =
      viewMode === "CATEGORY_DETAIL" ? selectedCategoryId : newTodo.categoryId;
    if (!finalCategoryId) {
      alert("カテゴリを選択してください");
      return;
    }

    const payload = {
      ...newTodo,
      categoryId: Number(finalCategoryId),
      dueDate: newTodo.dueDate || null,
      status: "INCOMPLETE",
    };

    try {
      await addTodoApi(payload);

      // タスク一覧を再取得するために useEffect を再実行する
      setRefreshKey((prev) => prev + 1);
      setNewTodo({
        title: "",
        details: "",
        categoryId: "",
        dueDate: "",
        daily: false,
        hasFlag: false,
        autoCarryOver: false,
        overdueBehavior: 0,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("作成失敗:", error);
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const createdCategory = await addCategoryApi(newCategoryName);
      setCategories((prev) => [...prev, createdCategory]);
      setNewCategoryName("");
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.log("カテゴリ作成失敗:", error);
      alert("カテゴリ作成に失敗しました。");
    }
  };

  const toggleStatus = async (id: number, currentStatus: Todo["status"]) => {
    const newStatus = currentStatus === "DONE" ? "INCOMPLETE" : "DONE";
    setTodos(todos.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    try {
      await updateTodoStatus(id, newStatus);
    } catch (error) {
      console.error("更新失敗:", error);
    }
  };

  const deleteTodo = async (id: number) => {
    if (!window.confirm("削除しますか？")) return;
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    try {
      await deleteTodoApi(id);
    } catch (error) {
      console.error("削除失敗:", error);
    }
  };

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.status === "DONE" && b.status !== "DONE") return 1;
    if (a.status !== "DONE" && b.status === "DONE") return -1;
    return 0;
  });

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl font-bold text-gray-500">
        読み込み中...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* ヘッダー */}
      <Header onTitleClick={() => setViewMode("TOP")} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* モーダル起動ボタン */}
        {(viewMode === "TOP" || viewMode === "CATEGORY_DETAIL") && (
          <AddTodoButton onClick={() => setIsModalOpen(true)} />
        )}

        {/* モーダル */}
        {isModalOpen && (
          <TodoModal
            newTodo={newTodo}
            setNewTodo={setNewTodo}
            categories={categories}
            viewMode={viewMode}
            onClose={() => setIsModalOpen(false)}
            onAddTodo={addTodo}
          />
        )}

        {isCategoryModalOpen && (
          <CategoryModal
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            onClose={() => setIsCategoryModalOpen(false)}
            onAddCategory={addCategory}
          />
        )}

        {/* メインコンテンツ */}
        {viewMode === "TOP" ? (
          <TopView
            categories={categories}
            setViewMode={setViewMode}
            setSelectedCategoryId={setSelectedCategoryId}
            onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
          />
        ) : (
          <TodoListView
            viewMode={viewMode}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            sortedTodos={sortedTodos}
            onBackToTop={() => setViewMode("TOP")}
            onToggleStatus={toggleStatus}
            onDeleteTodo={deleteTodo}
          />
        )}
      </div>
    </div>
  );
}

export default App;
