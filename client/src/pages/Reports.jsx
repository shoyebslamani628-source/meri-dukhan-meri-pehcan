import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import PageState from "../components/PageState";
import StatusBadge from "../components/StatusBadge";
import api from "../utils/api";
import { exportToCsv } from "../utils/csv";
import { formatCurrency } from "../utils/format";

const Reports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/reports/all");
      setReports(data);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading || error || !reports) {
    return <PageState loading={loading} error={error} empty={!reports && !loading} />;
  }

  const exportMonthlyIncome = () => {
    exportToCsv(
      "monthly-income.csv",
      reports.monthlyIncome.map((row) => ({
        Month: row.month,
        Income: row.income,
        Bills: row.bills
      }))
    );
  };

  const exportTopSelling = () => {
    exportToCsv(
      "top-selling-parts.csv",
      reports.topSellingParts.map((row) => ({
        Part: row.name,
        QuantitySold: row.quantitySold,
        Revenue: row.revenue
      }))
    );
  };

  const exportLowStock = () => {
    exportToCsv(
      "low-stock-report.csv",
      reports.lowStockParts.map((part) => ({
        Part: part.name,
        Category: part.category,
        Quantity: part.quantity,
        MinStockLevel: part.min_stock_level,
        Supplier: part.supplier?.name || "",
        Price: part.price
      }))
    );
  };

  const exportSupplierSummary = () => {
    exportToCsv(
      "supplier-summary.csv",
      reports.supplierSummary.map((supplier) => ({
        Supplier: supplier.name,
        Phone: supplier.phone,
        Email: supplier.email,
        PartsLinked: supplier.partsLinked,
        TotalQuantity: supplier.totalQuantity,
        StockValue: supplier.stockValue,
        PaymentDue: supplier.paymentDue
      }))
    );
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="surface p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-ink">Monthly Income</h2>
              <p className="text-sm text-slate-500">Last 12 months</p>
            </div>
            <button className="btn-secondary" onClick={exportMonthlyIncome} type="button">
              <Download size={16} />
              CSV
            </button>
          </div>
          <div className="h-80">
            {reports.monthlyIncome.length ? (
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={reports.monthlyIncome}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "income" ? formatCurrency(value) : value,
                      name === "income" ? "Income" : "Bills"
                    ]}
                  />
                  <Bar dataKey="income" fill="#0e7490" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <PageState empty emptyText="No monthly income data." />
            )}
          </div>
        </div>

        <div className="surface p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-ink">Top Selling Parts</h2>
              <p className="text-sm text-slate-500">By quantity sold</p>
            </div>
            <button className="btn-secondary" onClick={exportTopSelling} type="button">
              <Download size={16} />
              CSV
            </button>
          </div>
          <div className="h-80">
            {reports.topSellingParts.length ? (
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={reports.topSellingParts}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    fontSize={12}
                    interval={0}
                    tick={{ width: 90 }}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "revenue" ? formatCurrency(value) : value,
                      name === "revenue" ? "Revenue" : "Qty Sold"
                    ]}
                  />
                  <Bar
                    dataKey="quantitySold"
                    fill="#15803d"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <PageState empty emptyText="No part sales data." />
            )}
          </div>
        </div>
      </section>

      <section className="surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-ink">Low Stock Report</h2>
            <p className="text-sm text-slate-500">
              {reports.lowStockParts.length} alert(s)
            </p>
          </div>
          <button className="btn-secondary" onClick={exportLowStock} type="button">
            <Download size={16} />
            CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Part</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Min Stock</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {reports.lowStockParts.map((part) => (
                <tr key={part._id}>
                  <td className="table-cell font-semibold text-ink">{part.name}</td>
                  <td className="table-cell">{part.category}</td>
                  <td className="table-cell">{part.quantity}</td>
                  <td className="table-cell">{part.min_stock_level}</td>
                  <td className="table-cell">{part.supplier?.name || "Unlinked"}</td>
                  <td className="table-cell">
                    <StatusBadge part={part} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PageState
          empty={!reports.lowStockParts.length}
          emptyText="No low stock items."
        />
      </section>

      <section className="surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-ink">Supplier Purchase Summary</h2>
            <p className="text-sm text-slate-500">
              {reports.supplierSummary.length} supplier(s)
            </p>
          </div>
          <button
            className="btn-secondary"
            onClick={exportSupplierSummary}
            type="button"
          >
            <Download size={16} />
            CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Parts Linked</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Stock Value</th>
                <th className="px-4 py-3">Payment Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {reports.supplierSummary.map((supplier) => (
                <tr key={supplier._id}>
                  <td className="table-cell">
                    <p className="font-semibold text-ink">{supplier.name}</p>
                    <p className="text-xs text-slate-500">{supplier.phone || "-"}</p>
                  </td>
                  <td className="table-cell">{supplier.partsLinked}</td>
                  <td className="table-cell">{supplier.totalQuantity}</td>
                  <td className="table-cell">
                    {formatCurrency(supplier.stockValue)}
                  </td>
                  <td className="table-cell font-semibold text-amber-700">
                    {formatCurrency(supplier.paymentDue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PageState
          empty={!reports.supplierSummary.length}
          emptyText="No supplier summary data."
        />
      </section>
    </div>
  );
};

export default Reports;

