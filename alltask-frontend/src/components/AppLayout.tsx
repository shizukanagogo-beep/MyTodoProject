import type { ReactNode } from "react";
import Header from "./Header";
import ToastContainer from "./ToastContainer";

type AppLayoutProps = {
  children: ReactNode;
  onTitleClick: () => void;
};

function AppLayout({ children, onTitleClick }: AppLayoutProps) {
  return (
    <div className="theme-dark min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Header onTitleClick={onTitleClick} />
      <ToastContainer />

      <div className="max-w-4xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}

export default AppLayout;
