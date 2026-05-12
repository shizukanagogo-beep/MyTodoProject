import TopView from "./TopView";
import TodoListView from "./TodoListView";
import type { Category, Todo, ViewMode } from "../types";

type MainContentProps = {
  viewMode: ViewMode;
  categories: Category[];
  selectedCategoryId: number | null;
  sortedTodos: Todo[];
  showDoneTodos: boolean;
  datedSortMode: "manual" | "dueDate";
  onToggleShowDoneTodos: () => void;
  onChangeDatedSortMode: (mode: "manual" | "dueDate") => void;
  onOpenCategoryModal: () => void;
  onOpenCategoryDetail: (categoryId: number) => void;
  onOpenDated: () => void;
  onOpenDaily: () => void;
  onOpenFlagged: () => void;
  onBackToTop: () => void;
  onToggleStatus: (id: number, currentStatus: Todo["status"]) => void;
  onDeleteTodo: (id: number) => void;
  onOpenTodoDetail: (todo: Todo) => void;
  onReorderTodos: (fromIndex: number, toIndex: number) => void;
};

function MainContent({
  viewMode,
  categories,
  selectedCategoryId,
  sortedTodos,
  showDoneTodos,
  datedSortMode,
  onToggleShowDoneTodos,
  onChangeDatedSortMode,
  onOpenCategoryModal,
  onOpenCategoryDetail,
  onOpenDated,
  onOpenDaily,
  onOpenFlagged,
  onBackToTop,
  onToggleStatus,
  onDeleteTodo,
  onOpenTodoDetail,
  onReorderTodos,
}: MainContentProps) {
  return viewMode === "TOP" ? (
    <TopView
      categories={categories}
      onOpenCategoryModal={onOpenCategoryModal}
      onOpenCategoryDetail={onOpenCategoryDetail}
      onOpenDated={onOpenDated}
      onOpenDaily={onOpenDaily}
      onOpenFlagged={onOpenFlagged}
    />
  ) : (
    <TodoListView
      viewMode={viewMode}
      categories={categories}
      selectedCategoryId={selectedCategoryId}
      sortedTodos={sortedTodos}
      showDoneTodos={showDoneTodos}
      datedSortMode={datedSortMode}
      onToggleShowDoneTodos={onToggleShowDoneTodos}
      onChangeDatedSortMode={onChangeDatedSortMode}
      onBackToTop={onBackToTop}
      onToggleStatus={onToggleStatus}
      onDeleteTodo={onDeleteTodo}
      onOpenTodoDetail={onOpenTodoDetail}
      onReorderTodos={onReorderTodos}
    />
  );
}

export default MainContent;
