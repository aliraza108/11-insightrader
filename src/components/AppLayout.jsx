import { useState } from "react";
import { Sidebar } from "./Sidebar.jsx";

export const AppLayout = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <div className="md:ml-60">
        <header className="sticky top-0 z-30 border-b border-radar-border bg-radar-bg/80 backdrop-blur">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="md:hidden radar-button-ghost"
                onClick={() => setIsOpen((prev) => !prev)}
              >
                Menu
              </button>
              <div>
                <p className="text-lg font-semibold">{title}</p>
                <p className="text-xs text-radar-muted">Live competitor intelligence</p>
              </div>
            </div>
          </div>
        </header>
        <main className="container-shell">{children}</main>
      </div>
    </div>
  );
};
