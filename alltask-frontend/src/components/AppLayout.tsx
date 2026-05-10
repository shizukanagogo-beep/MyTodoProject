import type { ReactNode } from "react";
import Header from "./Header";

type AppLayoutProps = {
  children: ReactNode;
  onTitleClick: () => void;
};

function AppLayout({ children, onTitleClick }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header onTitleClick={onTitleClick} />

      <div className="max-w-4xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}

export default AppLayout;
