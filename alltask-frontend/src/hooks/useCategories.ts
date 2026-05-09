import { useEffect, useState } from "react";
import type { Category } from "../types";
import {
  fetchCategories as fetchCategoriesApi,
  addCategory as addCategoryApi,
} from "../services/categoryService";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await fetchCategoriesApi();
        setCategories(categories);
      } catch (error) {
        console.error("カテゴリの取得に失敗:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const addCategory = async (name: string) => {
    if (!name.trim()) return;

    const createdCategory = await addCategoryApi(name);
    setCategories((prev) => [...prev, createdCategory]);
  };

  return {
    categories,
    loadingCategories,
    addCategory,
  };
}
