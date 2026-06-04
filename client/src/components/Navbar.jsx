import { LogOut, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const titles = {
  "/": "Dashboard",
  "/inventory": "Inventory Management",
  "/billing": "Billing & Invoicing",
  "/suppliers": "Supplier Management",
  "/reports": "Reports & Analytics"
};

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          className="rounded-md border border-line p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
          onClick={onMenuClick}
          title="Open menu"
          type="button"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-base font-bold text-ink sm:text-lg">
            {titles[location.pathname] || "Mechanic Inventory"}
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block">
            {new Intl.DateTimeFormat("en-IN", {
              weekday: "long",
              day: "2-digit",
              month: "short",
              year: "numeric"
            }).format(new Date())}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-ink">{user?.name}</p>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>
        <button
          className="rounded-md border border-line p-2 text-slate-600 hover:bg-slate-50"
          onClick={logout}
          title="Logout"
          type="button"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;

