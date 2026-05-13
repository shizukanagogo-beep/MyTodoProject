import CategoryModal from "./CategoryModal";
import TodoModal from "./TodoModal";
import type { Category, NewTodo } from "../types";
import type { Dispatch, SetStateAction } from "react";

type ModalsProps = {
  isTodoModalOpen: boolean;
  isCategoryModalOpen: boolean;

  newTodo: NewTodo;
  setNewTodo: Dispatch<SetStateAction<NewTodo>>;
  categories: Category[];
  onCloseTodoModal: () => void;
  onAddTodo: () => void;

  newCategoryName: string;
  setNewCategoryName: (value: string) => void;
  onCloseCategoryModal: () => void;
  onAddCategory: () => void;
  onUpdateCategory: (id: number, name: string) => Promise<boolean>;
  onDeleteCategory: (id: number) => Promise<boolean>;
  onReorderCategories: (fromIndex: number, toIndex: number) => void;
};

function Modals({
  isTodoModalOpen,
  isCategoryModalOpen,
  newTodo,
  setNewTodo,
  categories,
  onCloseTodoModal,
  onAddTodo,
  newCategoryName,
  setNewCategoryName,
  onCloseCategoryModal,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
}: ModalsProps) {
  return (
    <>
      {isTodoModalOpen && (
        <TodoModal
          newTodo={newTodo}
          setNewTodo={setNewTodo}
          categories={categories}
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
          onDeleteCategory={onDeleteCategory}
          onReorderCategories={onReorderCategories}
        />
      )}
    </>
  );
}

export default Modals;
