import Tooltip from "./Tooltip";

type DueDateDraft = {
  dueDate: string;
  dueDateUndecided: boolean;
  daily: boolean;
  overdueBehavior: number;
};

type DueDateSettingProps = {
  dueDate: string;
  dueDateUndecided: boolean;
  daily: boolean;
  overdueBehavior: number;
  onChange: (draft: DueDateDraft) => void;
};

type TooltipCheckboxProps = {
  label: string;
  displayLabel?: string;
  checked: boolean;
  tooltip: string;
  onChange: (checked: boolean) => void;
};

function TooltipCheckbox({
  label,
  displayLabel = label,
  checked,
  tooltip,
  onChange,
}: TooltipCheckboxProps) {
  return (
    <Tooltip label={tooltip}>
      <label className="flex cursor-pointer items-center gap-2 px-1 py-1 text-sm text-slate-700">
        <input
          type="checkbox"
          aria-label={label}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          aria-hidden={displayLabel !== label}
          className={displayLabel === "↻" ? "text-lg leading-none" : undefined}
        >
          {displayLabel}
        </span>
      </label>
    </Tooltip>
  );
}

function DueDateSetting({
  dueDate,
  dueDateUndecided,
  daily,
  overdueBehavior,
  onChange,
}: DueDateSettingProps) {
  const commitChange = (draft: Partial<DueDateDraft>) => {
    onChange({
      dueDate,
      dueDateUndecided,
      daily,
      overdueBehavior,
      ...draft,
    });
  };

  const selectDueDate = (value: string) => {
    commitChange({
      dueDate: value,
      dueDateUndecided: false,
      daily: false,
      overdueBehavior: value ? overdueBehavior : 0,
    });
  };

  const selectUndecided = (checked: boolean) => {
    commitChange({
      dueDate: checked ? "" : dueDate,
      dueDateUndecided: checked,
      daily: checked ? false : daily,
      overdueBehavior: checked ? 0 : overdueBehavior,
    });
  };

  const selectDaily = (checked: boolean) => {
    commitChange({
      dueDate: checked ? "" : dueDate,
      dueDateUndecided: checked ? false : dueDateUndecided,
      daily: checked,
      overdueBehavior: checked ? 0 : overdueBehavior,
    });
  };

  const handleChangeOverdueBehavior = (value: number) => {
    commitChange({
      overdueBehavior: value,
    });
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-slate-500">日付</p>

        <div className="flex items-center gap-3">
          <TooltipCheckbox
            label="未定"
            checked={dueDateUndecided}
            tooltip="予定は未定"
            onChange={selectUndecided}
          />

          <TooltipCheckbox
            label="日課"
            checked={daily}
            tooltip="日課タスクは毎日自動的に未完了となります"
            onChange={selectDaily}
          />
        </div>
      </div>

      <div className="relative">
        <input
          type="date"
          className={`w-full border-b border-transparent bg-white px-1 py-2 outline-none ${
            dueDateUndecided || daily
              ? "text-transparent hover:border-slate-200 focus:border-indigo-500"
              : dueDate
                ? "text-slate-700 hover:border-slate-200 focus:border-indigo-500"
                : "text-slate-400 hover:border-slate-200 focus:border-indigo-500"
          }`}
          value={dueDateUndecided || daily ? "" : dueDate}
          onChange={(e) => selectDueDate(e.target.value)}
        />

        {dueDateUndecided && (
          <div className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 text-slate-400">
            未定
          </div>
        )}

        {daily && (
          <div className="pointer-events-none absolute left-1 top-1/2 -translate-y-1/2 text-slate-400">
            日課
          </div>
        )}
      </div>

      {dueDate && !dueDateUndecided && (
        <div className="mt-3">
          <p className="mb-1 text-sm font-bold text-slate-500">
            未完了のまま期限超過した場合の処理
          </p>
          <select
            className="w-full border-b border-transparent bg-white px-1 py-2 text-slate-700 outline-none hover:border-slate-200 focus:border-indigo-500"
            value={overdueBehavior}
            onChange={(e) => handleChangeOverdueBehavior(Number(e.target.value))}
          >
            <option value={0}>何もしない</option>
            <option value={1}>日付を「今日」に繰り越す</option>
            <option value={3}>日付を「未定」に変更する</option>
            <option value={2}>完了済みに変更する</option>
          </select>
        </div>
      )}
    </div>
  );
}

export default DueDateSetting;
