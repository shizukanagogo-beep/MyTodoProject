type HeaderProps = {
  onTitleClick: () => void;
};

function Header({ onTitleClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1
          onClick={onTitleClick}
          className="cursor-pointer text-3xl font-semibold tracking-wide text-amber-600 transition-opacity hover:opacity-80"
          style={{
            fontFamily:
              '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive',
          }}
        >
          To Forget
        </h1>
      </div>
    </header>
  );
}

export default Header;
