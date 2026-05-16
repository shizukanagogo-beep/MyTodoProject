import type { ReactNode } from "react";

type TooltipProps = {
  children: ReactNode;
  label: string;
};

function Tooltip({ children, label }: TooltipProps) {
  return (
    <div className="relative group">
      {children}

      <div className="absolute right-0 top-full z-10 mt-1 hidden group-hover:block">
        <div className="whitespace-nowrap rounded-lg bg-slate-800 px-3 py-2 text-xs text-white shadow-lg">
          {label}
        </div>
      </div>
    </div>
  );
}

export default Tooltip;
