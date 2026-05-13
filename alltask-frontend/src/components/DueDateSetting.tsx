import { useState } from "react";

type DueDateDraft = {
  dueDate: string;
  dueDateUndecided: boolean;
  overdueBehavior: number;
};

type DueDateSettingProps = {
  dueDate: string;
  dueDateUndecided: boolean;
  daily: boolean;
  overdueBehavior: number;
  onChange: (draft: DueDateDraft) => void;
};

function DueDateSetting({
  dueDate,
  dueDateUndecided,
  daily,
  overdueBehavior,
  onChange,
}: DueDateSettingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<DueDateDraft>({
    dueDate,
    dueDateUndecided,
    overdueBehavior,
  });

  const openModal = () => {
    if (daily) return;

    setDraft({
      dueDate,
      dueDateUndecided,
      overdueBehavior,
    });
    setIsOpen(true);
  };

  const applyDraft = () => {
    onChange({
      dueDate: draft.dueDateUndecided ? "" : draft.dueDate,
      dueDateUndecided: draft.dueDateUndecided,
      overdueBehavior:
        draft.dueDate && !draft.dueDateUndecided ? draft.overdueBehavior : 0,
    });
    setIsOpen(false);
  };

  const displayText = dueDateUndecided
    ? "未定"
    : dueDate || "期限を設定";

  return (
    <div>
      <p className="mb-1 text-sm font-bold text-slate-500">期限</p>
      <button
        type="button"
        disabled={daily}
        className={`w-full border-b border-transparent bg-white px-1 py-2 text-left outline-none ${
          daily
            ? "cursor-not-allowed text-slate-300"
            : dueDate || dueDateUndecided
              ? "text-slate-700 hover:border-slate-200 focus:border-indigo-500"
              : "text-slate-400 hover:border-slate-200 focus:border-indigo-500"
        }`}
        onClick={openModal}
      >
        {displayText}
      </button>

      {daily && (
        <p className="mt-1 text-xs text-slate-400">
          日課設定されている場合は期限設定はできません
        </p>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 p-4"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">期限設定</h3>
              <button
                className="text-2xl text-slate-400 hover:text-slate-600"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-1 text-sm font-bold text-slate-500">日付</p>
                <input
                  type="date"
                  disabled={draft.dueDateUndecided}
                  className={`w-full border-b border-transparent bg-white px-1 py-2 text-slate-700 outline-none hover:border-slate-200 focus:border-indigo-500 ${
                    draft.dueDateUndecided
                      ? "cursor-not-allowed opacity-40"
                      : ""
                  }`}
                  value={draft.dueDate}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      dueDate: e.target.value,
                      dueDateUndecided: e.target.value
                        ? false
                        : draft.dueDateUndecided,
                      overdueBehavior: e.target.value
                        ? draft.overdueBehavior
                        : 0,
                    })
                  }
                />
              </div>

              <div>
                <p className="mb-1 text-sm font-bold text-slate-500">未定</p>
                <label className="flex cursor-pointer items-center gap-2 border-b border-transparent bg-white px-1 py-2 text-slate-700 hover:border-slate-200">
                  <input
                    type="checkbox"
                    checked={draft.dueDateUndecided}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        dueDateUndecided: e.target.checked,
                        dueDate: e.target.checked ? "" : draft.dueDate,
                        overdueBehavior: e.target.checked
                          ? 0
                          : draft.overdueBehavior,
                      })
                    }
                  />
                  期限を未定にする
                </label>
              </div>

              {draft.dueDate && !draft.dueDateUndecided && (
                <div>
                  <p className="mb-1 text-sm font-bold text-slate-500">
                    期限超過時の動き
                  </p>
                  <select
                    className="w-full border-b border-transparent bg-white px-1 py-2 text-slate-700 outline-none hover:border-slate-200 focus:border-indigo-500"
                    value={draft.overdueBehavior}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        overdueBehavior: Number(e.target.value),
                      })
                    }
                  >
                    <option value={0}>日付を赤文字でそのまま</option>
                    <option value={1}>日付を今日に繰り越す</option>
                    <option value={2}>自動的に完了済みにする</option>
                    <option value={3}>未定に変更する</option>
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  className="flex-1 rounded-xl bg-slate-100 py-3 font-bold text-slate-600 hover:bg-slate-200"
                  onClick={() => {
                    setDraft({
                      dueDate: "",
                      dueDateUndecided: false,
                      overdueBehavior: 0,
                    });
                  }}
                >
                  解除
                </button>
                <button
                  className="flex-1 rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700"
                  onClick={applyDraft}
                >
                  決定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DueDateSetting;
