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
          <img
            src="/app-logo.png"
            alt=""
            aria-hidden="true"
            className="h-9 w-9 object-contain"
          />
          <span
            className="text-3xl font-semibold tracking-wide text-amber-600"
            style={{
              fontFamily:
                '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive',
            }}
          >
            To Forget
          </span>
        </button>
      </div>
    </header>
  );
}

export default Header;
