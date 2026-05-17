import type { Todo } from "../types";
import type { ParentContextType } from "../utils/todoListView";
import CollapseToggleButton from "./CollapseToggleButton";
import ParentContextCard from "./ParentContextCard";
import TodoItem from "./TodoItem";

type DraggingSubtask = {
  parentId: number;
  index: number;
} | null;

type TodoWithSubtasksProps = {
  todo: Todo;
  index: number;
  subtasks: Todo[];
  canReorder: boolean;
  draggingIndex: number | null;
  draggingSubtask: DraggingSubtask;
  isSubtasksCollapsed: boolean;
  parentContextType: ParentContextType | null;
  onStartParentDrag: (index: number) => void;
  onDropParent: (index: number) => void;
  onEndParentDrag: () => void;
  onToggleSubtasksCollapsed: (parentId: number) => void;
  onStartSubtaskDrag: (parentId: number, index: number) => void;
  onDropSubtask: (parentId: number, index: number) => void;
  onEndSubtaskDrag: () => void;
  onToggleStatus: (id: number, currentStatus: Todo["status"]) => void;
  onDeleteTodo: (id: number) => void;
  onOpenTodoDetail: (todo: Todo) => void;
  getSubdued: (todo: Todo) => boolean;
};

const subtaskConnectorListClassName =
  "relative ml-10 space-y-2 pl-5 before:absolute before:-top-2 before:bottom-6 before:left-0 before:w-px before:bg-slate-300";

const subtaskConnectorItemClassName =
  "relative before:absolute before:-left-5 before:top-1/2 before:h-px before:w-5 before:bg-slate-300";

function TodoWithSubtasks({
  todo,
  index,
  subtasks,
  canReorder,
  draggingIndex,
  draggingSubtask,
  isSubtasksCollapsed,
  parentContextType,
  onStartParentDrag,
  onDropParent,
  onEndParentDrag,
  onToggleSubtasksCollapsed,
  onStartSubtaskDrag,
  onDropSubtask,
  onEndSubtaskDrag,
  onToggleStatus,
  onDeleteTodo,
  onOpenTodoDetail,
  getSubdued,
}: TodoWithSubtasksProps) {
  const isContextParent = parentContextType !== null;
  const shouldShowSubtasks =
    subtasks.length > 0 && (isContextParent || !isSubtasksCollapsed);
  const canCollapseSubtasks = !isContextParent && subtasks.length > 0;

  return (
    <div className="space-y-2">
      <div
        draggable={canReorder && !isContextParent}
        onDragStart={() => onStartParentDrag(index)}
        onDragOver={(e) => {
          if (canReorder) e.preventDefault();
        }}
        onDrop={() => onDropParent(index)}
        onDragEnd={onEndParentDrag}
        className={draggingIndex === index ? "opacity-50" : ""}
      >
        <div className="relative">
          {canCollapseSubtasks && (
            <CollapseToggleButton
              collapsed={isSubtasksCollapsed}
              className="absolute -left-5 top-1/2 -translate-y-1/2 text-xs text-slate-300 hover:text-slate-500"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSubtasksCollapsed(todo.id);
              }}
            />
          )}

          {parentContextType !== null ? (
            <ParentContextCard todo={todo} contextType={parentContextType} />
          ) : (
            <TodoItem
              todo={todo}
              onToggleStatus={onToggleStatus}
              onDeleteTodo={onDeleteTodo}
              onOpenTodoDetail={onOpenTodoDetail}
              subdued={getSubdued(todo)}
            />
          )}
        </div>
      </div>

      {shouldShowSubtasks && (
        <div className={subtaskConnectorListClassName}>
          {subtasks.map((subtask, subtaskIndex) => (
            <div
              key={subtask.id}
              draggable
              onDragStart={() => onStartSubtaskDrag(todo.id, subtaskIndex)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDropSubtask(todo.id, subtaskIndex)}
              onDragEnd={onEndSubtaskDrag}
              className={`${subtaskConnectorItemClassName} ${
                draggingSubtask?.parentId === todo.id &&
                draggingSubtask.index === subtaskIndex
                  ? "opacity-50"
                  : ""
              }`}
            >
              <TodoItem
                todo={subtask}
                onToggleStatus={onToggleStatus}
                onDeleteTodo={onDeleteTodo}
                onOpenTodoDetail={onOpenTodoDetail}
                subdued={getSubdued(subtask)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TodoWithSubtasks;
