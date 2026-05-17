import { useState } from "react";
import type { Category, DatedFilter, Todo, ViewMode } from "../types";
import {
  canGroupTodoListByCategory,
  getListTodos,
  getParentTodos,
  getParentContextType,
  getSubtasks,
  getTodoCount,
  getTodosByCategory,
  matchesDirectListCondition,
} from "../utils/todoListView";
import CollapseToggleButton from "./CollapseToggleButton";
import TodoListHeader from "./TodoListHeader";
import TodoWithSubtasks from "./TodoWithSubtasks";

type TodoListViewProps = {
  viewMode: ViewMode;
  categories: Category[];
  selectedCategoryId: number | null;
  sortedTodos: Todo[];
  allTodos: Todo[];
  showDoneTodos: boolean;
  datedSortMode: "manual" | "dueDate";
  onToggleShowDoneTodos: () => void;
  onChangeDatedSortMode: (mode: "manual" | "dueDate") => void;
  onOpenTodoModal: () => void;
  onBackToTop: () => void;
  onToggleStatus: (id: number, currentStatus: Todo["status"]) => void;
  onDeleteTodo: (id: number) => void;
  onOpenTodoDetail: (todo: Todo) => void;
  onReorderTodos: (orderedParentTodoIds: number[]) => void;
  onReorderSubtasks: (
    parentId: number,
    fromIndex: number,
    toIndex: number,
  ) => void;
  onReorderCategories: (fromIndex: number, toIndex: number) => void;
  isRandomMode: boolean;
  onToggleRandomTodo: () => void;
  datedFilter: DatedFilter;
  onChangeDatedFilter: (filter: DatedFilter) => void;
  onRequestDeleteCompletedTodos: () => void;
  canDeleteCompletedTodos: boolean;
};

const canReorderCurrentView = (viewMode: ViewMode) =>
  viewMode === "CATEGORY_DETAIL" || viewMode === "UNCATEGORIZED";

function TodoListView({
  viewMode,
  categories,
  selectedCategoryId,
  sortedTodos,
  allTodos,
  showDoneTodos,
  datedSortMode,
  onToggleShowDoneTodos,
  onChangeDatedSortMode,
  onOpenTodoModal,
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
  onRequestDeleteCompletedTodos,
  canDeleteCompletedTodos,
}: TodoListViewProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [draggingCategoryId, setDraggingCategoryId] = useState<number | null>(
    null,
  );
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [collapsedCategoryIds, setCollapsedCategoryIds] = useState<
    Set<number | "uncategorized">
  >(new Set());
  const [collapsedSubtaskParentIds, setCollapsedSubtaskParentIds] = useState<
    Set<number>
  >(new Set());
  const [draggingSubtask, setDraggingSubtask] = useState<{
    parentId: number;
    index: number;
  } | null>(null);
  const canGroupByCategory = canGroupTodoListByCategory(viewMode);
  const showsDirectMatchesOnly = canGroupByCategory;
  const effectiveGroupByCategory = canGroupByCategory && groupByCategory;
  const canReorder =
    canReorderCurrentView(viewMode) && !effectiveGroupByCategory && !isRandomMode;
  const shouldSubdueTodo = (todo: Todo) =>
    canGroupByCategory &&
    !matchesDirectListCondition(todo, viewMode, datedFilter);

  const listTodos = getListTodos({
    sortedTodos,
    viewMode,
    datedFilter,
    showDoneTodos,
    showsDirectMatchesOnly,
  });
  const parentTodos = getParentTodos(listTodos);
  const todosByCategory = getTodosByCategory({
    categories,
    parentTodos,
    allTodos,
  });

  const handleDropParentTodo = (targetIndex: number) => {
    if (!canReorder) return;
    if (draggingIndex === null || draggingIndex === targetIndex) return;

    const reorderedParentTodos = [...parentTodos];
    const [movedTodo] = reorderedParentTodos.splice(draggingIndex, 1);
    reorderedParentTodos.splice(targetIndex, 0, movedTodo);
    onReorderTodos(reorderedParentTodos.map((todo) => todo.id));
    setDraggingIndex(null);
  };

  const handleDropCategory = (targetCategoryId: number | null) => {
    if (targetCategoryId === null) {
      setDraggingCategoryId(null);
      return;
    }

    if (
      draggingCategoryId === null ||
      draggingCategoryId === targetCategoryId
    ) {
      setDraggingCategoryId(null);
      return;
    }

    const fromIndex = categories.findIndex(
      (category) => category.id === draggingCategoryId,
    );
    const toIndex = categories.findIndex(
      (category) => category.id === targetCategoryId,
    );

    if (fromIndex !== -1 && toIndex !== -1) {
      onReorderCategories(fromIndex, toIndex);
    }

    setDraggingCategoryId(null);
  };

  const toggleCategoryCollapsed = (categoryId: number | "uncategorized") => {
    setCollapsedCategoryIds((prev) => {
      const next = new Set(prev);

      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }

      return next;
    });
  };

  const toggleSubtasksCollapsed = (parentId: number) => {
    setCollapsedSubtaskParentIds((prev) => {
      const next = new Set(prev);

      if (next.has(parentId)) {
        next.delete(parentId);
      } else {
        next.add(parentId);
      }

      return next;
    });
  };

  const renderTodoWithSubtasks = (todo: Todo, index: number) => {
    const subtasks = getSubtasks(listTodos, todo.id);
    const isSubtasksCollapsed = collapsedSubtaskParentIds.has(todo.id);
    const parentContextType = getParentContextType({
      todo,
      subtasks,
      showDoneTodos,
      showsDirectMatchesOnly,
      viewMode,
      datedFilter,
    });

    return (
      <TodoWithSubtasks
        key={todo.id}
        todo={todo}
        index={index}
        subtasks={subtasks}
        canReorder={canReorder}
        draggingIndex={draggingIndex}
        draggingSubtask={draggingSubtask}
        isSubtasksCollapsed={isSubtasksCollapsed}
        parentContextType={parentContextType}
        onStartParentDrag={setDraggingIndex}
        onDropParent={handleDropParentTodo}
        onEndParentDrag={() => setDraggingIndex(null)}
        onToggleSubtasksCollapsed={toggleSubtasksCollapsed}
        onStartSubtaskDrag={(parentId, subtaskIndex) =>
          setDraggingSubtask({ parentId, index: subtaskIndex })
        }
        onDropSubtask={(parentId, subtaskIndex) => {
          if (draggingSubtask?.parentId !== parentId) return;

          onReorderSubtasks(parentId, draggingSubtask.index, subtaskIndex);
          setDraggingSubtask(null);
        }}
        onEndSubtaskDrag={() => setDraggingSubtask(null)}
        onToggleStatus={onToggleStatus}
        onDeleteTodo={onDeleteTodo}
        onOpenTodoDetail={onOpenTodoDetail}
        getSubdued={shouldSubdueTodo}
      />
    );
  };

  const renderEmptyMessage = () => (
    <div className="text-center py-20 text-slate-400">タスクがありません</div>
  );

  const renderTodoList = () => {
    if (parentTodos.length === 0) return renderEmptyMessage();

    if (effectiveGroupByCategory) {
      return todosByCategory.map(({ id, name, canReorder, todos }) => {
        const collapseId = id ?? "uncategorized";
        const isCollapsed = collapsedCategoryIds.has(collapseId);
        const todoCount = getTodoCount({
          todos,
          listTodos,
          showDoneTodos,
          showsDirectMatchesOnly,
          viewMode,
          datedFilter,
        });

        return (
          <section
            key={id ?? "uncategorized"}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDropCategory(id)}
            onDragEnd={() => setDraggingCategoryId(null)}
            className={`space-y-2 ${
              id !== null && draggingCategoryId === id ? "opacity-50" : ""
            }`}
          >
            <div
              draggable={canReorder}
              onDragStart={(e) => {
                if (id === null) {
                  e.preventDefault();
                  return;
                }

                setDraggingCategoryId(id);
              }}
              className={`flex items-center gap-2 px-1 pt-2 ${
                canReorder ? "cursor-move" : ""
              }`}
            >
              <CollapseToggleButton
                collapsed={isCollapsed}
                className="h-6 w-6 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-200"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategoryCollapsed(collapseId);
                }}
                onDragStart={(e) => e.preventDefault()}
              />
              <span className="text-sm font-bold text-slate-600">{name}</span>
              <span className="text-xs font-bold text-slate-400">
                {todoCount}
              </span>
            </div>

            {!isCollapsed && (
              <div className="space-y-3">
                {todos.map((todo) =>
                  renderTodoWithSubtasks(
                    todo,
                    parentTodos.findIndex(
                      (parentTodo) => parentTodo.id === todo.id,
                    ),
                  ),
                )}
              </div>
            )}
          </section>
        );
      });
    }

    return parentTodos.map((todo, index) =>
      renderTodoWithSubtasks(todo, index),
    );
  };

  return (
    <div>
      <TodoListHeader
        viewMode={viewMode}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        showDoneTodos={showDoneTodos}
        datedSortMode={datedSortMode}
        canGroupByCategory={canGroupByCategory}
        groupByCategory={groupByCategory}
        isRandomMode={isRandomMode}
        datedFilter={datedFilter}
        onBackToTop={onBackToTop}
        onOpenTodoModal={onOpenTodoModal}
        onToggleShowDoneTodos={onToggleShowDoneTodos}
        onChangeDatedSortMode={onChangeDatedSortMode}
        onToggleGroupByCategory={() => {
          setGroupByCategory((prev) => !prev);
          setDraggingIndex(null);
          setDraggingCategoryId(null);
        }}
        onToggleRandomTodo={onToggleRandomTodo}
        onChangeDatedFilter={onChangeDatedFilter}
        onRequestDeleteCompletedTodos={onRequestDeleteCompletedTodos}
        canDeleteCompletedTodos={canDeleteCompletedTodos}
      />
      <div className="space-y-3">{renderTodoList()}</div>
    </div>
  );
}

export default TodoListView;
