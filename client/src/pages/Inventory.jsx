import {
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PageState from "../components/PageState";
import StatusBadge from "../components/StatusBadge";
import api from "../utils/api";
import { categories, formatCurrency, getStockStatus } from "../utils/format";

const blankForm = {
  name: "",
  category: "Engine",
  quantity: "",
  price: "",
  min_stock_level: "5",
  supplier: ""
};

const blankFilters = {
  search: "",
  category: "All",
  stockStatus: ""
};

const Inventory = () => {
  const [parts, setParts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [filters, setFilters] = useState(blankFilters);
  const [form, setForm] = useState(blankForm);
  const [editingPart, setEditingPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const summary = useMemo(() => {
    const totalValue = parts.reduce(
      (sum, part) => sum + Number(part.quantity) * Number(part.price),
      0
    );
    const lowStock = parts.filter((part) => getStockStatus(part) === "Low stock");
    const outOfStock = parts.filter(
      (part) => getStockStatus(part) === "Out of stock"
    );

    return { totalValue, lowStock: lowStock.length, outOfStock: outOfStock.length };
  }, [parts]);

  const fetchParts = async (params = filters) => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/parts", { params });
      setParts(data);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data } = await api.get("/suppliers");
      setSuppliers(data);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to load suppliers.");
    }
  };

  useEffect(() => {
    fetchParts(blankFilters);
    fetchSuppliers();
  }, []);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(blankForm);
    setEditingPart(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      quantity: Number(form.quantity),
      price: Number(form.price),
      min_stock_level: Number(form.min_stock_level),
      supplier: form.supplier || null
    };

    try {
      if (editingPart) {
        await api.put(`/parts/${editingPart._id}`, payload);
      } else {
        await api.post("/parts", payload);
      }

      resetForm();
      await fetchParts(filters);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to save part.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (part) => {
    setEditingPart(part);
    setForm({
      name: part.name,
      category: part.category,
      quantity: String(part.quantity),
      price: String(part.price),
      min_stock_level: String(part.min_stock_level),
      supplier: part.supplier?._id || ""
    });
  };

  const handleDelete = async (part) => {
    if (!window.confirm(`Delete ${part.name}?`)) {
      return;
    }

    try {
      await api.delete(`/parts/${part._id}`);
      await fetchParts(filters);
      if (editingPart?._id === part._id) {
        resetForm();
      }
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to delete part.");
    }
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    fetchParts(filters);
  };

  const handleResetFilters = () => {
    setFilters(blankFilters);
    fetchParts(blankFilters);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <div className="surface p-4">
          <p className="label">Parts Listed</p>
          <p className="mt-2 text-2xl font-bold text-ink">{parts.length}</p>
        </div>
        <div className="surface p-4">
          <p className="label">Current Value</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {formatCurrency(summary.totalValue)}
          </p>
        </div>
        <div className="surface p-4">
          <p className="label">Low Stock</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">
            {summary.lowStock}
          </p>
        </div>
        <div className="surface p-4">
          <p className="label">Out of Stock</p>
          <p className="mt-2 text-2xl font-bold text-rose-700">
            {summary.outOfStock}
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <form
            className="surface grid gap-3 p-4 md:grid-cols-[1fr_180px_180px_auto_auto]"
            onSubmit={handleFilterSubmit}
          >
            <div>
              <label className="label" htmlFor="inventory-search">
                Search
              </label>
              <div className="relative mt-1">
                <Search
                  className="pointer-events-none absolute left-3 top-2.5 text-slate-400"
                  size={16}
                />
                <input
                  className="input pl-9"
                  id="inventory-search"
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      search: event.target.value
                    }))
                  }
                  placeholder="Part name"
                  value={filters.search}
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="category-filter">
                Category
              </label>
              <select
                className="input mt-1"
                id="category-filter"
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    category: event.target.value
                  }))
                }
                value={filters.category}
              >
                <option>All</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="stock-filter">
                Stock Status
              </label>
              <select
                className="input mt-1"
                id="stock-filter"
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    stockStatus: event.target.value
                  }))
                }
                value={filters.stockStatus}
              >
                <option value="">All</option>
                <option value="available">In stock</option>
                <option value="low">Low stock</option>
                <option value="out">Out of stock</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="btn-primary w-full" type="submit">
                <Search size={16} />
                Search
              </button>
            </div>

            <div className="flex items-end">
              <button
                className="btn-secondary w-full"
                onClick={handleResetFilters}
                type="button"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>
          </form>

          {error ? <PageState error={error} /> : null}

          <div className="surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line">
                <thead className="table-head">
                  <tr>
                    <th className="px-4 py-3">Part</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-white">
                  {parts.map((part) => (
                    <tr key={part._id}>
                      <td className="table-cell font-semibold text-ink">
                        {part.name}
                      </td>
                      <td className="table-cell">{part.category}</td>
                      <td className="table-cell">
                        {part.quantity}
                        <span className="ml-2 text-xs text-slate-400">
                          min {part.min_stock_level}
                        </span>
                      </td>
                      <td className="table-cell">{formatCurrency(part.price)}</td>
                      <td className="table-cell">
                        {part.supplier?.name || "Unlinked"}
                      </td>
                      <td className="table-cell">
                        <StatusBadge part={part} />
                      </td>
                      <td className="table-cell">
                        <div className="flex justify-end gap-2">
                          <button
                            className="rounded-md border border-line p-2 text-slate-600 hover:bg-slate-50"
                            onClick={() => handleEdit(part)}
                            title="Edit part"
                            type="button"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="rounded-md border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDelete(part)}
                            title="Delete part"
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PageState
              loading={loading}
              empty={!loading && !parts.length}
              emptyText="No parts found."
            />
          </div>
        </div>

        <form className="surface h-max space-y-4 p-4" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-ink">
                {editingPart ? "Edit Part" : "Add Part"}
              </h2>
              <p className="text-sm text-slate-500">
                {editingPart ? editingPart.name : "Inventory record"}
              </p>
            </div>
            {editingPart ? (
              <button
                className="rounded-md border border-line p-2 text-slate-600 hover:bg-slate-50"
                onClick={resetForm}
                title="Clear edit"
                type="button"
              >
                <RotateCcw size={16} />
              </button>
            ) : null}
          </div>

          <div>
            <label className="label" htmlFor="part-name">
              Name
            </label>
            <input
              className="input mt-1"
              id="part-name"
              onChange={(event) => updateForm("name", event.target.value)}
              required
              value={form.name}
            />
          </div>

          <div>
            <label className="label" htmlFor="part-category">
              Category
            </label>
            <select
              className="input mt-1"
              id="part-category"
              onChange={(event) => updateForm("category", event.target.value)}
              value={form.category}
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="part-quantity">
                Quantity
              </label>
              <input
                className="input mt-1"
                id="part-quantity"
                min="0"
                onChange={(event) => updateForm("quantity", event.target.value)}
                required
                type="number"
                value={form.quantity}
              />
            </div>
            <div>
              <label className="label" htmlFor="part-min-stock">
                Min Stock
              </label>
              <input
                className="input mt-1"
                id="part-min-stock"
                min="0"
                onChange={(event) =>
                  updateForm("min_stock_level", event.target.value)
                }
                required
                type="number"
                value={form.min_stock_level}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="part-price">
              Price (₹)
            </label>
            <input
              className="input mt-1"
              id="part-price"
              min="0"
              onChange={(event) => updateForm("price", event.target.value)}
              required
              step="0.01"
              type="number"
              value={form.price}
            />
          </div>

          <div>
            <label className="label" htmlFor="part-supplier">
              Supplier
            </label>
            <select
              className="input mt-1"
              id="part-supplier"
              onChange={(event) => updateForm("supplier", event.target.value)}
              value={form.supplier}
            >
              <option value="">Unlinked</option>
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <button className="btn-primary w-full" disabled={saving} type="submit">
            {editingPart ? <Save size={16} /> : <Plus size={16} />}
            {saving ? "Saving" : editingPart ? "Save Changes" : "Add Part"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Inventory;

