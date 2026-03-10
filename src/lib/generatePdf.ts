import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Finding {
  category: string;
  date: string | null;
  description: string;
  amount: number;
  loopAlternative: string;
  savingsPerOccurrence: number;
}

interface Recommendation {
  title: string;
  description: string;
  estimatedAnnualSavings: number;
  priority: "high" | "medium" | "low";
}

interface PlanComparison {
  plan: string;
  monthlyFee: number;
  fxRate: number;
  annualCostOnPlan: number;
  annualSavingsVsBank: number;
  recommended: boolean;
}

interface AuditResult {
  bankName: string;
  statementPeriod: string;
  currency: string;
  findings: Finding[];
  recommendations: Recommendation[];
  summary: {
    totalFeesFound: number;
    totalFxMarkups: number;
    totalAccountFees: number;
    totalWireFees: number;
    totalOtherFees: number;
    annualProjection: number;
    loopAnnualCost: number;
    annualSavings: number;
  };
  planComparison?: PlanComparison[];
}

const BRAND_GREEN = "#004639";
const BRAND_LIGHT = "#C4F6C6";
const DANGER = "#dc2626";

const fmt = (n: number) => {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(n));
};

const categoryLabels: Record<string, string> = {
  account_fee: "Account Fee",
  fx_markup: "FX Markup",
  wire_fee: "Wire Fee",
  etransfer_fee: "e-Transfer Fee",
  payment_inefficiency: "Inefficiency",
  card_fee: "Card Fee",
  other_fee: "Fee",
};

export function generateAuditPdf(data: AuditResult): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = 0;

  // Helper: check if we need a new page
  const ensureSpace = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }
  };

  // ── Header ──
  doc.setFillColor(BRAND_GREEN);
  doc.rect(0, 0, pageW, 36, "F");

  doc.setTextColor("#ffffff");
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("BLEED", margin, 16);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("by Loop Financial", margin + 28, 16);

  doc.setFontSize(11);
  doc.text("FX Audit Report", margin, 26);
  doc.setFontSize(9);
  doc.text(
    `${data.bankName} · ${data.statementPeriod}`,
    margin,
    32
  );

  // Date on right
  doc.setFontSize(8);
  doc.text(new Date().toLocaleDateString("en-CA"), pageW - margin, 32, {
    align: "right",
  });

  y = 44;

  // ── Summary Stats ──
  doc.setTextColor("#000000");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", margin, y);
  y += 8;

  const stats = [
    ["Issues Found", data.findings.length.toString()],
    ["Fees This Period", fmt(data.summary.totalFeesFound)],
    ["Annual Projection", fmt(data.summary.annualProjection)],
    ["Annual Savings with Loop", fmt(data.summary.annualSavings)],
  ];

  const breakdowns = [
    ["FX Markups", fmt(data.summary.totalFxMarkups)],
    ["Account Fees", fmt(data.summary.totalAccountFees)],
    ["Wire Fees", fmt(data.summary.totalWireFees)],
    ["Other Fees", fmt(data.summary.totalOtherFees)],
  ];

  // Summary boxes
  const boxW = contentW / 4;
  stats.forEach(([label, value], i) => {
    const x = margin + i * boxW;
    doc.setFillColor(i === 3 ? "#e8f5e9" : "#fafafa");
    doc.roundedRect(x + 1, y, boxW - 2, 18, 2, 2, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#666666");
    doc.text(label, x + boxW / 2, y + 6, { align: "center" });
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(i >= 1 && i <= 2 ? DANGER : BRAND_GREEN);
    doc.text(value, x + boxW / 2, y + 14, { align: "center" });
  });
  y += 24;

  // Fee breakdown
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor("#888888");
  const bdText = breakdowns.map(([l, v]) => `${l}: ${v}`).join("  ·  ");
  doc.text(bdText, margin, y);
  y += 10;

  // ── Findings Table ──
  ensureSpace(30);
  doc.setTextColor("#000000");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Findings", margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["#", "Category", "Date", "Description", "Amount", "Savings"]],
    body: data.findings.map((f, i) => [
      (i + 1).toString(),
      categoryLabels[f.category] || f.category,
      f.date || "—",
      f.description.length > 60 ? f.description.slice(0, 57) + "..." : f.description,
      fmt(f.amount),
      f.savingsPerOccurrence > 0 ? fmt(f.savingsPerOccurrence) : "—",
    ]),
    headStyles: {
      fillColor: BRAND_GREEN,
      textColor: "#ffffff",
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 7.5, textColor: "#333333" },
    alternateRowStyles: { fillColor: "#f8faf8" },
    columnStyles: {
      0: { cellWidth: 8 },
      4: { halign: "right", textColor: DANGER, fontStyle: "bold" },
      5: { halign: "right", textColor: BRAND_GREEN },
    },
    didDrawPage: () => {},
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Plan Comparison ──
  if (data.planComparison && data.planComparison.length > 0) {
    ensureSpace(30);
    doc.setTextColor("#000000");
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Plan Comparison — Your Bank vs Loop", margin, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Plan", "Monthly Fee", "FX Rate", "Annual Cost", "Annual Savings", ""]],
      body: data.planComparison.map((p) => [
        p.plan,
        p.monthlyFee === 0 ? "Free" : `$${p.monthlyFee}/mo`,
        `${p.fxRate}%`,
        fmt(p.annualCostOnPlan),
        fmt(p.annualSavingsVsBank),
        p.recommended ? "★ RECOMMENDED" : "",
      ]),
      headStyles: {
        fillColor: BRAND_GREEN,
        textColor: "#ffffff",
        fontSize: 8,
        fontStyle: "bold",
      },
      bodyStyles: { fontSize: 8, textColor: "#333333" },
      columnStyles: {
        4: {
          halign: "right",
          fontStyle: "bold",
          textColor: BRAND_GREEN,
        },
        5: { textColor: BRAND_GREEN, fontStyle: "bold", fontSize: 7 },
      },
      didParseCell: (hookData) => {
        // Highlight recommended row
        if (
          hookData.section === "body" &&
          data.planComparison &&
          data.planComparison[hookData.row.index]?.recommended
        ) {
          hookData.cell.styles.fillColor = BRAND_LIGHT;
          hookData.cell.styles.fontStyle = "bold";
        }
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── Recommendations ──
  if (data.recommendations.length > 0) {
    ensureSpace(30);
    doc.setTextColor("#000000");
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Recommendations", margin, y);
    y += 7;

    data.recommendations.forEach((rec) => {
      ensureSpace(22);
      const priorityLabel =
        rec.priority === "high"
          ? "HIGH"
          : rec.priority === "medium"
          ? "MEDIUM"
          : "LOW";

      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(
        rec.priority === "high" ? DANGER : rec.priority === "medium" ? "#b45309" : BRAND_GREEN
      );
      doc.text(priorityLabel, margin, y);

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor("#000000");
      doc.text(rec.title, margin + 18, y);

      if (rec.estimatedAnnualSavings > 0) {
        doc.setFontSize(9);
        doc.setTextColor(BRAND_GREEN);
        doc.text(
          `Save ${fmt(rec.estimatedAnnualSavings)}/yr`,
          pageW - margin,
          y,
          { align: "right" }
        );
      }
      y += 5;

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#555555");
      const lines = doc.splitTextToSize(rec.description, contentW - 20);
      doc.text(lines, margin + 18, y);
      y += lines.length * 4 + 6;
    });
  }

  // ── CTA Footer ──
  ensureSpace(30);
  y += 5;
  doc.setFillColor(BRAND_GREEN);
  doc.roundedRect(margin, y, contentW, 22, 3, 3, "F");
  doc.setTextColor("#ffffff");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Switch to Loop", margin + contentW / 2, y + 10, {
    align: "center",
  });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Save ${fmt(data.summary.annualSavings)}/yr  ·  bankonloop.com`,
    margin + contentW / 2,
    y + 17,
    { align: "center" }
  );

  // ── Save ──
  const bankSlug = data.bankName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`bleed-fx-audit-${bankSlug}-${dateStr}.pdf`);
}
