import type { ParentContextType } from "../utils/todoListView";
import type { Todo } from "../types";

type ParentContextCardProps = {
  todo: Todo;
  contextType: ParentContextType;
};

const contextLabels: Record<ParentContextType, string> = {
  completed: "完了済み",
  related: "親タスク",
};

function ParentContextCard({ todo, contextType }: ParentContextCardProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-500">
      <div className="flex min-w-0 items-center gap-3">
        <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-500">
          {contextLabels[contextType]}
        </span>

        <div className="min-w-0">
          <p
            className={`truncate text-sm font-bold text-slate-500 ${
              contextType === "completed" ? "line-through" : ""
            }`}
          >
            {todo.title}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ParentContextCard;
