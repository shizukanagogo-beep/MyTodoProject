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
  onOpenTodoModal: () => void;
  onOpenCategoryModal: () => void;
  onOpenCategoryDetail: (categoryId: number) => void;
  onOpenUncategorized: () => void;
  onOpenDated: () => void;
  onOpenDaily: () => void;
  onOpenFlagged: () => void;
  onBackToTop: () => void;
  onToggleStatus: (id: number, currentStatus: Todo["status"]) => void;
  onDeleteTodo: (id: number) => void;
  onOpenTodoDetail: (todo: Todo) => void;
  onReorderTodos: (fromIndex: number, toIndex: number) => void;
  onReorderSubtasks: (
    parentId: number,
    fromIndex: number,
    toIndex: number,
  ) => void;
  onReorderCategories: (fromIndex: number, toIndex: number) => void;
  isRandomMode: boolean;
  onToggleRandomTodo: () => void;
  datedFilter: "all" | "today" | "tomorrow";
  onChangeDatedFilter: (filter: "all" | "today" | "tomorrow") => void;
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
  onOpenTodoModal,
  onOpenCategoryModal,
  onOpenCategoryDetail,
  onOpenUncategorized,
  onOpenDated,
  onOpenDaily,
  onOpenFlagged,
  onBackToTop,
  onToggleStatus,
  onDeleteTodo,
  onOpenTodoDetail,
  onReorderTodos,
  onReorderSubtasks,
  onReorderCategories,
  isRandomMode,
  onToggleRandomTodo,
  datedFilter,
  onChangeDatedFilter,
}: MainContentProps) {
  return viewMode === "TOP" ? (
    <TopView
      categories={categories}
      onOpenTodoModal={onOpenTodoModal}
      onOpenCategoryModal={onOpenCategoryModal}
      onOpenCategoryDetail={onOpenCategoryDetail}
      onOpenUncategorized={onOpenUncategorized}
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
      onOpenTodoModal={onOpenTodoModal}
      onBackToTop={onBackToTop}
      onToggleStatus={onToggleStatus}
      onDeleteTodo={onDeleteTodo}
      onOpenTodoDetail={onOpenTodoDetail}
      onReorderTodos={onReorderTodos}
      onReorderSubtasks={onReorderSubtasks}
      onReorderCategories={onReorderCategories}
      isRandomMode={isRandomMode}
      onToggleRandomTodo={onToggleRandomTodo}
      datedFilter={datedFilter}
      onChangeDatedFilter={onChangeDatedFilter}
    />
  );
}

export default MainContent;
