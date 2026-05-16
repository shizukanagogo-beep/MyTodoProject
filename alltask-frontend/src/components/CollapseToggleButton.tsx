import type { DragEvent, MouseEvent } from "react";

type CollapseToggleButtonProps = {
  collapsed: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  onDragStart?: (event: DragEvent<HTMLButtonElement>) => void;
};

function CollapseToggleButton({
  collapsed,
  onClick,
  className = "",
  onDragStart,
}: CollapseToggleButtonProps) {
  return (
    <button className={className} onClick={onClick} onDragStart={onDragStart}>
      {collapsed ? "▶" : "▼"}
    </button>
  );
}

export default CollapseToggleButton;
