import {
  AlertTriangle,
  Boxes,
  IndianRupee,
  PackageCheck,
  ReceiptText
} from "lucide-react";
import { useEffect, useState } from "react";
import PageState from "../components/PageState";
import StatCard from "../components/StatCard";
import api from "../utils/api";
import { formatCurrency, formatDate } from "../utils/format";

const activityTone = {
  bill: "bg-emerald-50 text-emerald-700",
  part: "bg-cyan-50 text-cyan-700",
  supplier: "bg-amber-50 text-amber-700",
  auth: "bg-slate-100 text-slate-700"
};

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await api.get("/reports/dashboard");
        setDashboard(data);
      } catch (apiError) {
        setError(apiError.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading || error || !dashboard) {
    return (
      <PageState loading={loading} error={error} empty={!dashboard && !loading} />
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Boxes}
          note={`${dashboard.distinctPartCount} part names`}
          title="Total Parts Count"
          tone="cyan"
          value={dashboard.totalPartsCount}
        />
        <StatCard
          icon={IndianRupee}
          title="Inventory Value"
          tone="emerald"
          value={formatCurrency(dashboard.totalInventoryValue)}
        />
        <StatCard
          icon={AlertTriangle}
          title="Low Stock Alerts"
          tone="amber"
          value={dashboard.lowStockAlertsCount}
        />
        <StatCard
          icon={ReceiptText}
          note={`${dashboard.todayBillCount} bill(s) today`}
          title="Today's Billing Total"
          tone="rose"
          value={formatCurrency(dashboard.todayBillingTotal)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface overflow-hidden">
          <div className="border-b border-line px-4 py-3">
            <h2 className="font-bold text-ink">Recent Activity</h2>
          </div>
          <div className="divide-y divide-line">
            {dashboard.recentActivity?.length ? (
              dashboard.recentActivity.map((activity) => (
                <div
                  className="flex items-start justify-between gap-4 px-4 py-3"
                  key={activity._id}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                        activityTone[activity.type] || activityTone.auth
                      }`}
                    >
                      {activity.type}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {activity.message}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                  {activity.amount !== null && activity.amount !== undefined ? (
                    <p className="text-sm font-bold text-slate-700">
                      {formatCurrency(activity.amount)}
                    </p>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm font-semibold text-slate-500">
                No activity yet.
              </div>
            )}
          </div>
        </div>

        <div className="surface p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-md bg-emerald-50 p-3 text-emerald-700">
              <PackageCheck size={22} />
            </div>
            <div>
              <h2 className="font-bold text-ink">Stock Snapshot</h2>
              <p className="text-sm text-slate-500">Current inventory position</p>
            </div>
          </div>
          <dl className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <dt className="text-sm text-slate-500">Part units</dt>
              <dd className="font-bold text-ink">{dashboard.totalPartsCount}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-line pb-3">
              <dt className="text-sm text-slate-500">Part names</dt>
              <dd className="font-bold text-ink">{dashboard.distinctPartCount}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-line pb-3">
              <dt className="text-sm text-slate-500">Alerts</dt>
              <dd className="font-bold text-amber-700">
                {dashboard.lowStockAlertsCount}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-slate-500">Value</dt>
              <dd className="font-bold text-emerald-700">
                {formatCurrency(dashboard.totalInventoryValue)}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
