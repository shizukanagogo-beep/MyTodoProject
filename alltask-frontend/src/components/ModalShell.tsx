import type { ReactNode } from "react";

type ModalShellProps = {
  children: ReactNode;
  onClose: () => void;
  title?: string;
  zIndexClassName?: string;
  overlayClassName?: string;
  panelClassName?: string;
};

function ModalShell({
  children,
  onClose,
  title,
  zIndexClassName = "z-50",
  overlayClassName = "bg-slate-900/50",
  panelClassName = "p-5",
}: ModalShellProps) {
  return (
    <div
      className={`fixed inset-0 ${zIndexClassName} flex items-center justify-center ${overlayClassName} p-4 backdrop-blur-sm`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-2xl bg-white shadow-2xl ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            <button
              className="text-2xl text-slate-400 hover:text-slate-600"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

export default ModalShell;
