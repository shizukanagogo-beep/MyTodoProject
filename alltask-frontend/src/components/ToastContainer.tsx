import { useEffect, useState } from "react";
import {
  TOAST_EVENT_NAME,
  type ToastPayload,
} from "../utils/toast";

type ToastState = ToastPayload & {
  id: number;
};

function ToastContainer() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    const listener = (event: Event) => {
      const customEvent = event as CustomEvent<ToastPayload>;

      const toast: ToastState = {
        id: Date.now(),
        ...customEvent.detail,
      };

      setToasts((prev) => [...prev, toast]);

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, 4000);
    };

    window.addEventListener(TOAST_EVENT_NAME, listener);

    return () => {
      window.removeEventListener(TOAST_EVENT_NAME, listener);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[200] flex w-80 flex-col gap-2">
      {toasts.map((toast) => {
        const isError = toast.variant === "error";

        return (
          <div
            key={toast.id}
            className={`rounded-2xl border bg-white px-4 py-3 shadow-xl ${
              isError ? "border-red-200" : "border-slate-200"
            }`}
          >
            <p
              className={`text-sm font-bold ${
                isError ? "text-red-600" : "text-slate-700"
              }`}
            >
              {isError ? "エラー" : "通知"}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {toast.message}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default ToastContainer;
