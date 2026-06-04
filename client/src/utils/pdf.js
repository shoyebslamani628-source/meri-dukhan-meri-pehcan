import { jsPDF } from "jspdf";
import * as autoTableModule from "jspdf-autotable";
import { formatDate } from "./format";

const getAutoTable = () => {
  if (typeof autoTableModule.default === "function") {
    return autoTableModule.default;
  }

  if (typeof autoTableModule.default?.default === "function") {
    return autoTableModule.default.default;
  }

  if (typeof autoTableModule.autoTable === "function") {
    return autoTableModule.autoTable;
  }

  throw new Error("PDF table generator is not available.");
};

const cleanText = (value, fallback = "-") =>
  value === null || value === undefined || value === "" ? fallback : String(value);

const numberValue = (value) => Number(value) || 0;

const formatPdfMoney = (value) =>
  `INR ${numberValue(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

export const generateInvoicePdf = (bill) => {
  if (!bill) {
    throw new Error("Bill data is missing.");
  }

  const autoTable = getAutoTable();
  const doc = new jsPDF();
  const items = bill.items || [];
  const invoiceNumber = cleanText(bill.invoiceNumber, "invoice");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const rightEdge = pageWidth - margin;
  const labourCharges = numberValue(bill.labourCharges);
  const partsTotal = items.reduce(
    (sum, item) => sum + numberValue(item.lineTotal),
    0
  );
  const subtotal = numberValue(bill.subtotal) || partsTotal + labourCharges;
  const gstAmount = numberValue(bill.gstAmount) || subtotal * 0.18;
  const total = numberValue(bill.total) || subtotal + gstAmount;

  doc.setTextColor(24, 33, 47);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Mechanic Shop Invoice", margin, 18);

  doc.setDrawColor(14, 116, 144);
  doc.setLineWidth(0.7);
  doc.line(margin, 23, rightEdge, 23);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Invoice No: ${invoiceNumber}`, margin, 32);
  doc.text(`Date: ${formatDate(bill.createdAt)}`, margin, 39);
  doc.text(`Customer: ${cleanText(bill.customerName)}`, margin, 49);
  doc.text(`Vehicle No: ${cleanText(bill.vehicleNumber)}`, margin, 56);
  doc.text(
    `Payment Status: ${cleanText(bill.paymentStatus, "Paid")}`,
    rightEdge,
    32,
    { align: "right" }
  );

  autoTable(doc, {
    startY: 68,
    head: [["Part", "Category", "Qty", "Unit Price", "Line Total"]],
    body: items.map((item) => [
      cleanText(item.nameSnapshot || item.part?.name),
      cleanText(item.categorySnapshot || item.part?.category),
      cleanText(item.quantity, "0"),
      formatPdfMoney(item.unitPrice),
      formatPdfMoney(item.lineTotal)
    ]),
    margin: { left: margin, right: margin },
    styles: {
      cellPadding: 2.5,
      font: "helvetica",
      fontSize: 9,
      overflow: "linebreak",
      textColor: [51, 65, 85]
    },
    headStyles: {
      fillColor: [14, 116, 144],
      fontStyle: "bold",
      halign: "left",
      textColor: [255, 255, 255]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 58 },
      1: { cellWidth: 32 },
      2: { cellWidth: 16, halign: "right" },
      3: { cellWidth: 36, halign: "right" },
      4: { cellWidth: 40, halign: "right" }
    }
  });

  const totalsY = (doc.lastAutoTable?.finalY || 68) + 8;

  autoTable(doc, {
    startY: totalsY,
    body: [
      ["Parts Total", formatPdfMoney(partsTotal)],
      ["Labour Charges", formatPdfMoney(labourCharges)],
      ["Subtotal", formatPdfMoney(subtotal)],
      ["GST (18%)", formatPdfMoney(gstAmount)],
      ["Grand Total", formatPdfMoney(total)]
    ],
    theme: "plain",
    margin: { left: 112, right: margin },
    styles: {
      cellPadding: 2,
      font: "helvetica",
      fontSize: 10,
      textColor: [24, 33, 47]
    },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: "bold" },
      1: { cellWidth: 46, halign: "right" }
    },
    didParseCell: (data) => {
      if (data.row.index === 4) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fontSize = 11;
        data.cell.styles.fillColor = [236, 253, 245];
        data.cell.styles.textColor = [6, 95, 70];
      }
    }
  });

  const footerY = Math.max(doc.lastAutoTable?.finalY || totalsY, 250);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Thank you for your business.", margin, footerY);

  doc.save(`${invoiceNumber}.pdf`);
};
