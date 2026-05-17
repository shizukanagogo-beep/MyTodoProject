type HeaderProps = {
  onTitleClick: () => void;
};

function Header({ onTitleClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <button
          type="button"
          onClick={onTitleClick}
          className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-80"
        >
          <span className="text-3xl font-bold tracking-[0.12em] text-sky-700">
            Slepper
          </span>
          <img
            src="/app-logo.png"
            alt=""
            aria-hidden="true"
            className="h-12 w-12 object-contain"
          />
        </button>
      </div>
    </header>
  );
}

export default Header;
