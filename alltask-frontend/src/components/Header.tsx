type HeaderProps = {
  onTitleClick: () => void;
  username: string;
  onLogout: () => void;
};

function Header({ onTitleClick, username, onLogout }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center gap-4">
        <button
          type="button"
          onClick={onTitleClick}
          className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-80"
        >
          <span className="text-3xl font-bold tracking-[0.12em] text-sky-700">
            Sleeper
          </span>
          <img
            src="/app-logo.png"
            alt=""
            aria-hidden="true"
            className="h-12 w-12 object-contain"
          />
        </button>

        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden max-w-32 truncate text-sm font-bold text-slate-500 sm:block">
            {username}
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
