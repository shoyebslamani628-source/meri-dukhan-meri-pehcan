import {
  Download,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  Trash2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PageState from "../components/PageState";
import StatusBadge from "../components/StatusBadge";
import api from "../utils/api";
import { formatCurrency, formatDate } from "../utils/format";
import { generateInvoicePdf } from "../utils/pdf";

const blankBill = {
  customerName: "",
  vehicleNumber: "",
  labourCharges: "0",
  paymentStatus: "Paid"
};

const Billing = () => {
  const [parts, setParts] = useState([]);
  const [bills, setBills] = useState([]);
  const [billForm, setBillForm] = useState(blankBill);
  const [lines, setLines] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("1");
  const [billSearch, setBillSearch] = useState("");
  const [createdBill, setCreatedBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const availableParts = useMemo(
    () => parts.filter((part) => Number(part.quantity) > 0),
    [parts]
  );

  const selectedPart = availableParts.find((part) => part._id === selectedPartId);

  const totals = useMemo(() => {
    const partsTotal = lines.reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0
    );
    const subtotal = partsTotal + Number(billForm.labourCharges || 0);
    const gstAmount = subtotal * 0.18;
    return {
      partsTotal,
      subtotal,
      gstAmount,
      total: subtotal + gstAmount
    };
  }, [billForm.labourCharges, lines]);

  const fetchParts = async () => {
    const { data } = await api.get("/parts");
    setParts(data);
  };

  const fetchBills = async (search = billSearch) => {
    const { data } = await api.get("/bills", { params: { search } });
    setBills(data);
  };

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([fetchParts(), fetchBills("")]);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to load billing data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateBillForm = (field, value) => {
    setBillForm((current) => ({ ...current, [field]: value }));
  };

  const addLine = () => {
    setError("");

    if (!selectedPart) {
      setError("Select a part.");
      return;
    }

    const quantity = Number(selectedQuantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Enter a valid quantity.");
      return;
    }

    const existingLine = lines.find((line) => line.part === selectedPart._id);
    const nextQuantity = (existingLine?.quantity || 0) + quantity;

    if (nextQuantity > selectedPart.quantity) {
      setError(`${selectedPart.name} has only ${selectedPart.quantity} item(s).`);
      return;
    }

    if (existingLine) {
      setLines((current) =>
        current.map((line) =>
          line.part === selectedPart._id
            ? { ...line, quantity: nextQuantity }
            : line
        )
      );
    } else {
      setLines((current) => [
        ...current,
        {
          part: selectedPart._id,
          name: selectedPart.name,
          category: selectedPart.category,
          quantity,
          unitPrice: selectedPart.price,
          available: selectedPart.quantity
        }
      ]);
    }

    setSelectedPartId("");
    setSelectedQuantity("1");
  };

  const removeLine = (partId) => {
    setLines((current) => current.filter((line) => line.part !== partId));
  };

  const resetBill = () => {
    setBillForm(blankBill);
    setLines([]);
    setSelectedPartId("");
    setSelectedQuantity("1");
    setCreatedBill(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const { data } = await api.post("/bills", {
        ...billForm,
        labourCharges: Number(billForm.labourCharges || 0),
        items: lines.map((line) => ({
          partId: line.part,
          quantity: line.quantity
        }))
      });

      setCreatedBill(data);
      setBillForm(blankBill);
      setLines([]);
      setSelectedPartId("");
      setSelectedQuantity("1");
      await Promise.all([fetchParts(), fetchBills("")]);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to create bill.");
    } finally {
      setSaving(false);
    }
  };

  const handleBillSearch = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await fetchBills(billSearch);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to search bills.");
    }
  };

  const handleDownloadPdf = (bill) => {
    try {
      generateInvoicePdf(bill);
    } catch (pdfError) {
      setError(pdfError.message || "Failed to download receipt.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <PageState loading={loading} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="flex flex-col gap-3 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button className="btn-secondary" onClick={() => setError("")} type="button">
            Clear
          </button>
        </div>
      ) : null}

      {createdBill ? (
        <div className="surface flex flex-col gap-3 border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-800">
              Bill created: {createdBill.invoiceNumber}
            </p>
            <p className="text-sm text-emerald-700">
              Total {formatCurrency(createdBill.total)}
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => handleDownloadPdf(createdBill)}
            type="button"
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <form className="surface space-y-5 p-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-ink">New Bill</h2>
              <p className="text-sm text-slate-500">GST 18%</p>
            </div>
            <button className="btn-secondary" onClick={resetBill} type="button">
              <RotateCcw size={16} />
              Clear
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="customer-name">
                Customer Name
              </label>
              <input
                className="input mt-1"
                id="customer-name"
                onChange={(event) =>
                  updateBillForm("customerName", event.target.value)
                }
                required
                value={billForm.customerName}
              />
            </div>
            <div>
              <label className="label" htmlFor="vehicle-number">
                Vehicle Number
              </label>
              <input
                className="input mt-1 uppercase"
                id="vehicle-number"
                onChange={(event) =>
                  updateBillForm("vehicleNumber", event.target.value)
                }
                required
                value={billForm.vehicleNumber}
              />
            </div>
          </div>

          <div className="grid gap-3 border-b border-line pb-4 md:grid-cols-[1fr_110px_auto]">
            <div>
              <label className="label" htmlFor="part-select">
                Part
              </label>
              <select
                className="input mt-1"
                id="part-select"
                onChange={(event) => setSelectedPartId(event.target.value)}
                value={selectedPartId}
              >
                <option value="">Select part</option>
                {availableParts.map((part) => (
                  <option key={part._id} value={part._id}>
                    {part.name} - {formatCurrency(part.price)} ({part.quantity})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="line-quantity">
                Quantity
              </label>
              <input
                className="input mt-1"
                id="line-quantity"
                min="1"
                onChange={(event) => setSelectedQuantity(event.target.value)}
                type="number"
                value={selectedQuantity}
              />
            </div>
            <div className="flex items-end">
              <button className="btn-secondary w-full" onClick={addLine} type="button">
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-line">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line">
                <thead className="table-head">
                  <tr>
                    <th className="px-4 py-3">Part</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-white">
                  {lines.map((line) => (
                    <tr key={line.part}>
                      <td className="table-cell">
                        <p className="font-semibold text-ink">{line.name}</p>
                        <p className="text-xs text-slate-500">{line.category}</p>
                      </td>
                      <td className="table-cell">{line.quantity}</td>
                      <td className="table-cell">
                        {formatCurrency(line.unitPrice)}
                      </td>
                      <td className="table-cell">
                        {formatCurrency(line.quantity * line.unitPrice)}
                      </td>
                      <td className="table-cell text-right">
                        <button
                          className="rounded-md border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                          onClick={() => removeLine(line.part)}
                          title="Remove part"
                          type="button"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PageState
              empty={!lines.length}
              emptyText="No parts added to this bill."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="labour-charges">
                Labour Charges (₹)
              </label>
              <input
                className="input mt-1"
                id="labour-charges"
                min="0"
                onChange={(event) =>
                  updateBillForm("labourCharges", event.target.value)
                }
                step="0.01"
                type="number"
                value={billForm.labourCharges}
              />
            </div>
            <div>
              <label className="label" htmlFor="payment-status">
                Payment Status
              </label>
              <select
                className="input mt-1"
                id="payment-status"
                onChange={(event) =>
                  updateBillForm("paymentStatus", event.target.value)
                }
                value={billForm.paymentStatus}
              >
                <option>Paid</option>
                <option>Due</option>
              </select>
            </div>
          </div>

          <button
            className="btn-primary w-full"
            disabled={saving || (!lines.length && Number(billForm.labourCharges) <= 0)}
            type="submit"
          >
            <ReceiptText size={16} />
            {saving ? "Creating" : "Create Bill"}
          </button>
        </form>

        <aside className="surface h-max p-4">
          <h2 className="font-bold text-ink">Bill Summary</h2>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between border-b border-line pb-3">
              <dt className="text-sm text-slate-500">Parts Total</dt>
              <dd className="font-semibold">{formatCurrency(totals.partsTotal)}</dd>
            </div>
            <div className="flex justify-between border-b border-line pb-3">
              <dt className="text-sm text-slate-500">Labour</dt>
              <dd className="font-semibold">
                {formatCurrency(billForm.labourCharges)}
              </dd>
            </div>
            <div className="flex justify-between border-b border-line pb-3">
              <dt className="text-sm text-slate-500">Subtotal</dt>
              <dd className="font-semibold">{formatCurrency(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between border-b border-line pb-3">
              <dt className="text-sm text-slate-500">GST 18%</dt>
              <dd className="font-semibold">{formatCurrency(totals.gstAmount)}</dd>
            </div>
            <div className="flex justify-between text-lg">
              <dt className="font-bold text-ink">Total</dt>
              <dd className="font-bold text-cyan-800">
                {formatCurrency(totals.total)}
              </dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-bold text-ink">Past Bills</h2>
            <p className="text-sm text-slate-500">{bills.length} record(s)</p>
          </div>
          <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleBillSearch}>
            <input
              className="input sm:w-80"
              onChange={(event) => setBillSearch(event.target.value)}
              placeholder="Invoice, customer, vehicle"
              value={billSearch}
            />
            <button className="btn-secondary" type="submit">
              <Search size={16} />
              Search
            </button>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {bills.map((bill) => (
                <tr key={bill._id}>
                  <td className="table-cell font-semibold text-ink">
                    {bill.invoiceNumber}
                  </td>
                  <td className="table-cell">{bill.customerName}</td>
                  <td className="table-cell">{bill.vehicleNumber}</td>
                  <td className="table-cell">{formatDate(bill.createdAt)}</td>
                  <td className="table-cell font-semibold">
                    {formatCurrency(bill.total)}
                  </td>
                  <td className="table-cell">
                    <StatusBadge status={bill.paymentStatus} />
                  </td>
                  <td className="table-cell text-right">
                    <button
                      className="rounded-md border border-line p-2 text-slate-600 hover:bg-slate-50"
                      onClick={() => handleDownloadPdf(bill)}
                      title="Download PDF"
                      type="button"
                    >
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PageState empty={!bills.length} emptyText="No bills found." />
      </section>
    </div>
  );
};

export default Billing;
