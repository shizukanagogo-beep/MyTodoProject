type FlagCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function FlagCheckbox({ checked, onChange }: FlagCheckboxProps) {
  return (
    <label className="flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-2 text-slate-600 hover:bg-slate-50">
      <input
        type="checkbox"
        aria-label="フラグ"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span aria-hidden="true" className="text-xl leading-none">
        ⚑
      </span>
    </label>
  );
}

export default FlagCheckbox;
