import type { Category } from "../types";

type CategoryCardProps = {
  category: Category;
  colorIndex: number;
  onClick: (categoryId: number) => void;
};

const colorThemes = [
  {
    accent: "bg-indigo-400 group-hover:bg-indigo-500",
    chip: "group-hover:bg-indigo-50 group-hover:text-indigo-600",
    line: "group-hover:bg-indigo-100",
    border: "hover:border-indigo-200",
  },
  {
    accent: "bg-teal-400 group-hover:bg-teal-500",
    chip: "group-hover:bg-teal-50 group-hover:text-teal-600",
    line: "group-hover:bg-teal-100",
    border: "hover:border-teal-200",
  },
  {
    accent: "bg-sky-400 group-hover:bg-sky-500",
    chip: "group-hover:bg-sky-50 group-hover:text-sky-600",
    line: "group-hover:bg-sky-100",
    border: "hover:border-sky-200",
  },
  {
    accent: "bg-rose-400 group-hover:bg-rose-500",
    chip: "group-hover:bg-rose-50 group-hover:text-rose-600",
    line: "group-hover:bg-rose-100",
    border: "hover:border-rose-200",
  },
  {
    accent: "bg-amber-400 group-hover:bg-amber-500",
    chip: "group-hover:bg-amber-50 group-hover:text-amber-600",
    line: "group-hover:bg-amber-100",
    border: "hover:border-amber-200",
  },
  {
    accent: "bg-violet-400 group-hover:bg-violet-500",
    chip: "group-hover:bg-violet-50 group-hover:text-violet-600",
    line: "group-hover:bg-violet-100",
    border: "hover:border-violet-200",
  },
];

function CategoryCard({
  category,
  colorIndex,
  onClick,
}: CategoryCardProps) {
  const theme = colorThemes[colorIndex % colorThemes.length];

  return (
    <button
      className={`group flex min-h-24 items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 text-left shadow-sm transition-all hover:bg-slate-50 hover:shadow-md ${theme.border}`}
      onClick={() => onClick(category.id)}
    >
      <div
        className={`h-12 w-1.5 shrink-0 rounded-full transition-colors ${theme.accent}`}
      />

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600 transition-colors ${theme.chip}`}
        >
          {category.name[0]}
        </div>

        <div className="min-w-0">
          <h3 className="truncate font-bold text-slate-800">
            {category.name}
          </h3>
          <div
            className={`mt-2 h-1.5 w-16 rounded-full bg-slate-100 transition-colors ${theme.line}`}
          />
        </div>
      </div>
    </button>
  );
}

export default CategoryCard;
