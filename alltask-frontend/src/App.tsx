import { useEffect, useState } from "react";
import axios from "axios";
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
    const fetchCategories = async () => {
      try {
        const response = await axios.get<Category[]>(
          "http://localhost:8080/categories",
        );
        setCategories(response.data);
      } catch (error) {
        console.error("カテゴリの取得に失敗:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (viewMode === "TOP") return;

    const fetchTodos = async () => {
      const params: TodoSearchParams = {};
      if (viewMode === "CATEGORY_DETAIL")
        params.categoryId = selectedCategoryId;
      if (viewMode === "DATED") params.existsDueDate = true;
      if (viewMode === "DAILY") params.daily = true;
      if (viewMode === "FLAGGED") params.hasFlag = true;

      try {
        const response = await axios.get<Todo[]>(
          "http://localhost:8080/todos",
          { params },
        );
        setTodos(response.data);
      } catch (error) {
        console.error("タスクの取得に失敗:", error);
      }
    };

    fetchTodos();
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
      await axios.post("http://localhost:8080/todos", payload);

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
      const response = await axios.post<Category>(
        "http://localhost:8080/categories",
        {
          name: newCategoryName,
        },
      );
      setCategories((prev) => [...prev, response.data]);
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
      await axios.patch(
        `http://localhost:8080/todos/${id}/status`,
        `"${newStatus}"`,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      console.error("更新失敗:", error);
    }
  };

  const deleteTodo = async (id: number) => {
    if (!window.confirm("削除しますか？")) return;
    setTodos(todos.filter((t) => t.id !== id));
    try {
      await axios.delete(`http://localhost:8080/todos/${id}`);
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
