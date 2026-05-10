import { useState } from "react";

type UseTodoModalArgs = {
  addTodo: () => Promise<boolean>;
};

export function useTodoModal({ addTodo }: UseTodoModalArgs) {
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);

  const openTodoModal = () => {
    setIsTodoModalOpen(true);
  };

  const closeTodoModal = () => {
    setIsTodoModalOpen(false);
  };

  const addTodoAndCloseModal = async () => {
    const isSuccess = await addTodo();

    if (isSuccess) {
      closeTodoModal();
    }
  };

  return {
    isTodoModalOpen,
    openTodoModal,
    closeTodoModal,
    addTodoAndCloseModal,
  };
}
