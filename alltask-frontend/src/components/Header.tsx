type HeaderProps = {
  onTitleClick: () => void;
};

function Header({ onTitleClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1
          onClick={onTitleClick}
          className="text-2xl font-black text-indigo-600 cursor-pointer hover:opacity-80 transition-opacity"
        >
          AllTask Todo
        </h1>
      </div>
    </header>
  );
}

export default Header;