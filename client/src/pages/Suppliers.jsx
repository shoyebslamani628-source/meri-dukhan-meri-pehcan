import {
  Mail,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PageState from "../components/PageState";
import api from "../utils/api";
import { formatCurrency } from "../utils/format";

const blankForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  paymentDue: "0"
};

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(blankForm);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const totalDue = useMemo(
    () =>
      suppliers.reduce(
        (sum, supplier) => sum + Number(supplier.paymentDue || 0),
        0
      ),
    [suppliers]
  );

  const fetchSuppliers = async (query = search) => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/suppliers", {
        params: { search: query }
      });
      setSuppliers(data);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers("");
  }, []);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setEditingSupplier(null);
    setForm(blankForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      paymentDue: Number(form.paymentDue || 0)
    };

    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier._id}`, payload);
      } else {
        await api.post("/suppliers", payload);
      }

      resetForm();
      await fetchSuppliers(search);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to save supplier.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      paymentDue: String(supplier.paymentDue || 0)
    });
  };

  const handleDelete = async (supplier) => {
    if (!window.confirm(`Delete ${supplier.name}?`)) {
      return;
    }

    try {
      await api.delete(`/suppliers/${supplier._id}`);
      await fetchSuppliers(search);
      if (editingSupplier?._id === supplier._id) {
        resetForm();
      }
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to delete supplier.");
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    fetchSuppliers(search);
  };

  const handleResetSearch = () => {
    setSearch("");
    fetchSuppliers("");
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="surface p-4">
          <p className="label">Suppliers</p>
          <p className="mt-2 text-2xl font-bold text-ink">{suppliers.length}</p>
        </div>
        <div className="surface p-4">
          <p className="label">Payment Due</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">
            {formatCurrency(totalDue)}
          </p>
        </div>
        <div className="surface p-4">
          <p className="label">Linked From</p>
          <p className="mt-2 text-2xl font-bold text-cyan-800">Inventory</p>
        </div>
      </section>

      {error ? <PageState error={error} /> : null}

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <form
            className="surface flex flex-col gap-3 p-4 md:flex-row md:items-end"
            onSubmit={handleSearch}
          >
            <div className="flex-1">
              <label className="label" htmlFor="supplier-search">
                Search
              </label>
              <div className="relative mt-1">
                <Search
                  className="pointer-events-none absolute left-3 top-2.5 text-slate-400"
                  size={16}
                />
                <input
                  className="input pl-9"
                  id="supplier-search"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Name, phone, email"
                  value={search}
                />
              </div>
            </div>
            <button className="btn-primary" type="submit">
              <Search size={16} />
              Search
            </button>
            <button
              className="btn-secondary"
              onClick={handleResetSearch}
              type="button"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </form>

          <div className="surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line">
                <thead className="table-head">
                  <tr>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Address</th>
                    <th className="px-4 py-3">Payment Due</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-white">
                  {suppliers.map((supplier) => (
                    <tr key={supplier._id}>
                      <td className="table-cell font-semibold text-ink">
                        {supplier.name}
                      </td>
                      <td className="table-cell">
                        <div className="space-y-1">
                          {supplier.phone ? (
                            <span className="flex items-center gap-2">
                              <Phone size={14} />
                              {supplier.phone}
                            </span>
                          ) : null}
                          {supplier.email ? (
                            <span className="flex items-center gap-2">
                              <Mail size={14} />
                              {supplier.email}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="table-cell max-w-xs whitespace-normal">
                        {supplier.address || "-"}
                      </td>
                      <td className="table-cell font-semibold">
                        {formatCurrency(supplier.paymentDue)}
                      </td>
                      <td className="table-cell">
                        <div className="flex justify-end gap-2">
                          <button
                            className="rounded-md border border-line p-2 text-slate-600 hover:bg-slate-50"
                            onClick={() => handleEdit(supplier)}
                            title="Edit supplier"
                            type="button"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="rounded-md border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDelete(supplier)}
                            title="Delete supplier"
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
              empty={!loading && !suppliers.length}
              emptyText="No suppliers found."
            />
          </div>
        </div>

        <form className="surface h-max space-y-4 p-4" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-ink">
                {editingSupplier ? "Edit Supplier" : "Add Supplier"}
              </h2>
              <p className="text-sm text-slate-500">
                {editingSupplier ? editingSupplier.name : "Supplier record"}
              </p>
            </div>
            {editingSupplier ? (
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
            <label className="label" htmlFor="supplier-name">
              Name
            </label>
            <input
              className="input mt-1"
              id="supplier-name"
              onChange={(event) => updateForm("name", event.target.value)}
              required
              value={form.name}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="supplier-phone">
                Phone
              </label>
              <input
                className="input mt-1"
                id="supplier-phone"
                onChange={(event) => updateForm("phone", event.target.value)}
                value={form.phone}
              />
            </div>
            <div>
              <label className="label" htmlFor="supplier-email">
                Email
              </label>
              <input
                className="input mt-1"
                id="supplier-email"
                onChange={(event) => updateForm("email", event.target.value)}
                type="email"
                value={form.email}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="supplier-address">
              Address
            </label>
            <textarea
              className="input mt-1 min-h-24"
              id="supplier-address"
              onChange={(event) => updateForm("address", event.target.value)}
              value={form.address}
            />
          </div>

          <div>
            <label className="label" htmlFor="supplier-due">
              Payment Due (₹)
            </label>
            <input
              className="input mt-1"
              id="supplier-due"
              min="0"
              onChange={(event) => updateForm("paymentDue", event.target.value)}
              step="0.01"
              type="number"
              value={form.paymentDue}
            />
          </div>

          <button className="btn-primary w-full" disabled={saving} type="submit">
            {editingSupplier ? <Save size={16} /> : <Plus size={16} />}
            {saving ? "Saving" : editingSupplier ? "Save Changes" : "Add Supplier"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Suppliers;

