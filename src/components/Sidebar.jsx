import { NavLink } from "react-router-dom";
import { ApiStatus } from "./StatusIndicator.jsx";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/competitors", label: "Competitors" },
  { to: "/scrape", label: "Run Scrape" },
  { to: "/changes", label: "Change Alerts" },
  { to: "/compare", label: "Compare" },
  { to: "/reports", label: "Reports" }
];

export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-full w-60 border-r border-radar-border glass p-6 transition-transform duration-300 md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="mb-10 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-radar-primary/20 text-radar-primary flex items-center justify-center font-bold">
          IR
        </div>
        <div>
          <p className="text-lg font-semibold">InsightRadar</p>
          <p className="text-xs text-radar-muted">Competitive Intelligence</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <ApiStatus />
      </div>
    </aside>
  );
};
