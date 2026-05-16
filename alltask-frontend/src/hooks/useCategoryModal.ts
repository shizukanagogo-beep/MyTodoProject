import { useState } from "react";
import { getApiErrorMessage } from "../utils/apiError";
import { showErrorToast } from "../utils/toast";

type UseCategoryModalArgs = {
  addCategoryToList: (name: string) => Promise<void>;
};

export function useCategoryModal({ addCategoryToList }: UseCategoryModalArgs) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const openCategoryModal = () => {
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
  };

  const addCategoryFromModal = async () => {
    if (!newCategoryName.trim()) return;

    try {
      await addCategoryToList(newCategoryName);
      setNewCategoryName("");
    } catch (error) {
      console.log("カテゴリ作成失敗:", error);
      showErrorToast(getApiErrorMessage(error));
    }
  };
  return {
    newCategoryName,
    setNewCategoryName,
    isCategoryModalOpen,
    openCategoryModal,
    closeCategoryModal,
    addCategoryFromModal,
  };
}
