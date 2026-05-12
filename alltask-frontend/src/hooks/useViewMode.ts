import { useState } from "react";
import type { ViewMode } from "../types";

export function useViewMode() {
  const [viewMode, setViewMode] = useState<ViewMode>("TOP");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const goTop = () => {
    setViewMode("TOP");
    setSelectedCategoryId(null);
  };

  const goCategoryDetail = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setViewMode("CATEGORY_DETAIL");
  };

  const goUncategorized = () => {
    setSelectedCategoryId(null);
    setViewMode("UNCATEGORIZED");
  };

  const goDated = () => {
    setSelectedCategoryId(null);
    setViewMode("DATED");
  };

  const goDaily = () => {
    setSelectedCategoryId(null);
    setViewMode("DAILY");
  };

  const goFlagged = () => {
    setSelectedCategoryId(null);
    setViewMode("FLAGGED");
  };

  return {
    viewMode,
    selectedCategoryId,
    goTop,
    goCategoryDetail,
    goUncategorized,
    goDated,
    goDaily,
    goFlagged,
  };
}
