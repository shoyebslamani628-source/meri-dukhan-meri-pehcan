import { getStockStatus } from "../utils/format";

const styles = {
  "In stock": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Low stock": "bg-amber-50 text-amber-700 ring-amber-200",
  "Out of stock": "bg-rose-50 text-rose-700 ring-rose-200",
  Paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Due: "bg-amber-50 text-amber-700 ring-amber-200"
};

const StatusBadge = ({ status, part }) => {
  const label = status || getStockStatus(part);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        styles[label] || "bg-slate-100 text-slate-700 ring-slate-200"
      }`}
    >
      {label}
    </span>
  );
};

export default StatusBadge;

