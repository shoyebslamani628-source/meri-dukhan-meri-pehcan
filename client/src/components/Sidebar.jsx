import {
  BarChart3,
  Gauge,
  Package,
  ReceiptText,
  Truck,
  X
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: Gauge },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/billing", label: "Billing", icon: ReceiptText },
  { to: "/suppliers", label: "Suppliers", icon: Truck },
  { to: "/reports", label: "Reports", icon: BarChart3 }
];

const Sidebar = ({ open, onClose }) => (
  <>
    <div
      className={`fixed inset-0 z-30 bg-slate-900/40 lg:hidden ${
        open ? "block" : "hidden"
      }`}
      onClick={onClose}
    />
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 transform flex-col border-r border-line bg-white transition lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-line px-5">
        <div>
          <p className="text-sm font-bold text-cyan-800">Mechanic Inventory</p>
          <p className="text-xs text-slate-500">Owner Console</p>
        </div>
        <button
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          onClick={onClose}
          title="Close menu"
          type="button"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-cyan-700 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  </>
);

export default Sidebar;

