import type { Category } from "../types";

type CategoryCardProps = {
  category: Category;
  colorIndex: number;
  onClick: (categoryId: number) => void;
};

const colorThemes = [
  {
    accent: "from-indigo-500 to-sky-400",
    glow: "group-hover:bg-indigo-500/10",
    border: "hover:border-indigo-200",
  },
  {
    accent: "from-teal-500 to-cyan-400",
    glow: "group-hover:bg-teal-500/10",
    border: "hover:border-teal-200",
  },
  {
    accent: "from-sky-500 to-blue-400",
    glow: "group-hover:bg-sky-500/10",
    border: "hover:border-sky-200",
  },
  {
    accent: "from-slate-500 to-sky-400",
    glow: "group-hover:bg-slate-500/10",
    border: "hover:border-slate-300",
  },
  {
    accent: "from-cyan-500 to-blue-400",
    glow: "group-hover:bg-cyan-500/10",
    border: "hover:border-cyan-200",
  },
  {
    accent: "from-violet-500 to-indigo-400",
    glow: "group-hover:bg-violet-500/10",
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
      className={`group relative min-h-24 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-lg ${theme.border}`}
      onClick={() => onClick(category.id)}
    >
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full transition-colors ${theme.glow}`}
      />

      <div className="relative flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div
            className={`mb-2 h-1.5 w-14 rounded-full bg-gradient-to-r ${theme.accent}`}
          />
          <h3 className="truncate text-base font-bold tracking-wide text-slate-800">
            {category.name}
          </h3>
        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all group-hover:bg-white group-hover:text-sky-600 group-hover:shadow-sm">
          →
        </div>
      </div>
    </button>
  );
}

export default CategoryCard;
