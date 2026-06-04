export const categories = [
  "Engine",
  "Brakes",
  "Suspension",
  "Electrical",
  "Tyres",
  "Body",
  "Other"
];

export const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

export const formatCurrency = (value) => currency.format(Number(value) || 0);

export const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(value))
    : "-";

export const getStockStatus = (part) => {
  if (!part || Number(part.quantity) === 0) {
    return "Out of stock";
  }

  if (Number(part.quantity) <= Number(part.min_stock_level)) {
    return "Low stock";
  }

  return "In stock";
};

