import CategoryModal from "./CategoryModal";
import TodoModal from "./TodoModal";
import type { Category, NewTodo, ViewMode } from "../types";
import type { Dispatch, SetStateAction } from "react";

type ModalsProps = {
  isTodoModalOpen: boolean;
  isCategoryModalOpen: boolean;

  newTodo: NewTodo;
  setNewTodo: Dispatch<SetStateAction<NewTodo>>;
  categories: Category[];
  viewMode: ViewMode;
  onCloseTodoModal: () => void;
  onAddTodo: () => void;

  newCategoryName: string;
  setNewCategoryName: (value: string) => void;
  onCloseCategoryModal: () => void;
  onAddCategory: () => void;
  onUpdateCategory: (id: number, name: string) => Promise<boolean>;
};

function Modals({
  isTodoModalOpen,
  isCategoryModalOpen,
  newTodo,
  setNewTodo,
  categories,
  viewMode,
  onCloseTodoModal,
  onAddTodo,
  newCategoryName,
  setNewCategoryName,
  onCloseCategoryModal,
  onAddCategory,
  onUpdateCategory,
}: ModalsProps) {
  return (
    <>
      {isTodoModalOpen && (
        <TodoModal
          newTodo={newTodo}
          setNewTodo={setNewTodo}
          categories={categories}
          viewMode={viewMode}
          onClose={onCloseTodoModal}
          onAddTodo={onAddTodo}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryModal
          categories={categories}
          newCategoryName={newCategoryName}
          setNewCategoryName={setNewCategoryName}
          onClose={onCloseCategoryModal}
          onAddCategory={onAddCategory}
          onUpdateCategory={onUpdateCategory}
        />
      )}
    </>
  );
}

export default Modals;
