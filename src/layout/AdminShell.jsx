import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import AppHeader from "../components/Header/Header";
import { PATHS } from "../routes/paths";

const adminLinks = [
  { to: PATHS.dashboard, label: "Dashboard" },
  { to: PATHS.adminPost, label: "Quản lý bài viết" },
  { to: PATHS.faqManager, label: "Quản lý FAQ" },
];

const AdminShell = () => {
  return (
    <div className="min-h-screen flex flex-col grain-bg bg-paper">
      <AppHeader />
      <div className="flex flex-1">
        <aside className="hidden md:flex w-60 shrink-0 flex-col gap-1 border-r border-gold/30 bg-surface grain-bg p-4 pt-6">
          <p className="px-2 pb-3 text-xs font-bold uppercase tracking-widest text-muted">
            Quản trị
          </p>
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-semibold transition-colors duration-fast ${
                  isActive
                    ? "bg-crimson text-[#FDF6EC] shadow-plaque"
                    : "text-ink-soft hover:bg-paper-2 hover:text-crimson"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </aside>
        <main className="flex-1 min-w-0 p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminShell;
