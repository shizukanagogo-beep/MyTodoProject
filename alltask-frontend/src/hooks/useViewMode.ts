import { useEffect, useState } from "react";
import type { ViewMode } from "../types";

type ViewState = {
  viewMode: ViewMode;
  selectedCategoryId: number | null;
};

const historyStateKey = "alltask:view";

const getUrlForViewState = ({ viewMode, selectedCategoryId }: ViewState) => {
  const url = new URL(window.location.href);
  url.searchParams.delete("view");
  url.searchParams.delete("categoryId");

  if (viewMode === "TOP") {
    return `${url.pathname}${url.search}${url.hash}`;
  }

  if (viewMode === "CATEGORY_DETAIL" && selectedCategoryId !== null) {
    url.searchParams.set("view", "category");
    url.searchParams.set("categoryId", String(selectedCategoryId));
    return `${url.pathname}${url.search}${url.hash}`;
  }

  const viewParamByMode: Partial<Record<ViewMode, string>> = {
    UNCATEGORIZED: "uncategorized",
    DATED: "dated",
    DAILY: "daily",
    FLAGGED: "flagged",
  };

  const viewParam = viewParamByMode[viewMode];
  if (viewParam) {
    url.searchParams.set("view", viewParam);
  }

  return `${url.pathname}${url.search}${url.hash}`;
};

const getViewStateFromUrl = (): ViewState => {
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");

  if (view === "category") {
    const categoryId = Number(params.get("categoryId"));

    if (Number.isInteger(categoryId) && categoryId > 0) {
      return {
        viewMode: "CATEGORY_DETAIL",
        selectedCategoryId: categoryId,
      };
    }
  }

  if (view === "uncategorized") {
    return { viewMode: "UNCATEGORIZED", selectedCategoryId: null };
  }

  if (view === "dated") {
    return { viewMode: "DATED", selectedCategoryId: null };
  }

  if (view === "daily") {
    return { viewMode: "DAILY", selectedCategoryId: null };
  }

  if (view === "flagged") {
    return { viewMode: "FLAGGED", selectedCategoryId: null };
  }

  return { viewMode: "TOP", selectedCategoryId: null };
};

const createHistoryState = (viewState: ViewState) => ({
  key: historyStateKey,
  ...viewState,
});

const isViewHistoryState = (state: unknown): state is ViewState & {
  key: typeof historyStateKey;
} => {
  return (
    typeof state === "object" &&
    state !== null &&
    "key" in state &&
    (state as { key: unknown }).key === historyStateKey
  );
};

export function useViewMode() {
  const [viewState, setViewState] = useState<ViewState>(getViewStateFromUrl);

  useEffect(() => {
    window.history.replaceState(
      createHistoryState(viewState),
      "",
      getUrlForViewState(viewState),
    );

    const handlePopState = (event: PopStateEvent) => {
      if (isViewHistoryState(event.state)) {
        setViewState({
          viewMode: event.state.viewMode,
          selectedCategoryId: event.state.selectedCategoryId,
        });
        return;
      }

      setViewState(getViewStateFromUrl());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (nextViewState: ViewState) => {
    setViewState(nextViewState);
    window.history.pushState(
      createHistoryState(nextViewState),
      "",
      getUrlForViewState(nextViewState),
    );
  };

  const goTop = () => {
    navigate({ viewMode: "TOP", selectedCategoryId: null });
  };

  const goCategoryDetail = (categoryId: number) => {
    navigate({
      viewMode: "CATEGORY_DETAIL",
      selectedCategoryId: categoryId,
    });
  };

  const goUncategorized = () => {
    navigate({ viewMode: "UNCATEGORIZED", selectedCategoryId: null });
  };

  const goDated = () => {
    navigate({ viewMode: "DATED", selectedCategoryId: null });
  };

  const goDaily = () => {
    navigate({ viewMode: "DAILY", selectedCategoryId: null });
  };

  const goFlagged = () => {
    navigate({ viewMode: "FLAGGED", selectedCategoryId: null });
  };

  return {
    viewMode: viewState.viewMode,
    selectedCategoryId: viewState.selectedCategoryId,
    goTop,
    goCategoryDetail,
    goUncategorized,
    goDated,
    goDaily,
    goFlagged,
  };
}
