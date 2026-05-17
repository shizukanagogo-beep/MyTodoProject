import type { ReactNode } from "react";
import Header from "./Header";
import ToastContainer from "./ToastContainer";

type AppLayoutProps = {
  children: ReactNode;
  onTitleClick: () => void;
};

function AppLayout({ children, onTitleClick }: AppLayoutProps) {
  return (
    <div
      className="theme-dark min-h-screen text-slate-900 font-sans"
      style={{
        backgroundColor: "#f8fafc",
        backgroundImage: `
          linear-gradient(rgba(14, 165, 233, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(14, 165, 233, 0.04) 1px, transparent 1px),
          radial-gradient(circle at 20% 30%, rgba(14, 165, 233, 0.08) 0 2px, transparent 3px),
          radial-gradient(circle at 80% 70%, rgba(14, 165, 233, 0.08) 0 2px, transparent 3px)
        `,
        backgroundSize: "48px 48px, 48px 48px, 180px 180px, 220px 220px",
      }}
    >
      <Header onTitleClick={onTitleClick} />
      <ToastContainer />

      <div className="max-w-4xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}

export default AppLayout;
