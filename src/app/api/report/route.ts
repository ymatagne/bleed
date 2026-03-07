import { NextRequest, NextResponse } from "next/server";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function fc(n: number) {
  return "$" + Math.round(n).toLocaleString("en-CA");
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { bankName, statementPeriod, findings, recommendations, summary, planComparison } = data;

    const findingsRows = (findings || []).map((f: { category: string; date: string | null; description: string; amount: number; loopAlternative: string }) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5e5;font-size:13px;color:#666;">${esc(f.category.replace(/_/g, " "))}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5e5;font-size:13px;">${esc(f.description)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5e5;font-size:13px;text-align:right;color:#dc2626;font-weight:600;">${fc(f.amount)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5e5;font-size:13px;color:#004639;">${esc(f.loopAlternative)}</td>
      </tr>
    `).join("");

    const recsHtml = (recommendations || []).map((r: { title: string; description: string; priority: string; estimatedAnnualSavings: number }) => `
      <div style="margin-bottom:12px;padding:16px;border:1px solid ${r.priority === "high" ? "#fecaca" : r.priority === "medium" ? "#fde68a" : "#C4F6C6"};border-radius:8px;background:${r.priority === "high" ? "#fef2f2" : r.priority === "medium" ? "#fffbeb" : "#f0fdf4"};">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#666;margin-bottom:4px;">${esc(r.priority)} priority</div>
        <div style="font-weight:600;color:#01251e;margin-bottom:4px;">${esc(r.title)}</div>
        <div style="font-size:13px;color:#555;">${esc(r.description)}</div>
        ${r.estimatedAnnualSavings > 0 ? `<div style="margin-top:8px;font-weight:600;color:#004639;">Est. annual savings: ${fc(r.estimatedAnnualSavings)}</div>` : ""}
      </div>
    `).join("");

    const plansHtml = (planComparison || []).map((p: { plan: string; monthlyFee: number; fxRate: number; annualCostOnPlan: number; annualSavingsVsBank: number; recommended: boolean }) => `
      <tr style="${p.recommended ? "background:#f0fdf4;" : ""}">
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5e5;font-weight:600;">${esc(p.plan)}${p.recommended ? ' <span style="color:#004639;font-size:11px;">★ RECOMMENDED</span>' : ""}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5e5;text-align:right;">${p.monthlyFee === 0 ? "Free" : `$${p.monthlyFee}/mo`}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5e5;text-align:right;">${p.fxRate}%</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5e5;text-align:right;">${fc(p.annualCostOnPlan)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e5e5e5;text-align:right;color:#004639;font-weight:700;">${fc(p.annualSavingsVsBank)}</td>
      </tr>
    `).join("");

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Banking Audit Report</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;background:#fff;">
  <div style="max-width:800px;margin:0 auto;padding:40px 32px;">
    <!-- Header -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:24px;border-bottom:3px solid #004639;margin-bottom:32px;">
      <div>
        <div style="font-size:28px;font-weight:800;color:#01251e;letter-spacing:-0.02em;">bleed <span style="font-size:14px;font-weight:400;color:#666;">by Loop</span></div>
        <div style="font-size:13px;color:#666;margin-top:4px;">FX Banking Audit Report</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:13px;color:#666;">${esc(bankName || "Unknown Bank")}</div>
        <div style="font-size:13px;color:#666;">${esc(statementPeriod || "")}</div>
        <div style="font-size:12px;color:#999;">Generated ${new Date().toLocaleDateString("en-CA")}</div>
      </div>
    </div>

    <!-- Summary -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px;">
      <div style="padding:16px;border:1px solid #e5e5e5;border-radius:12px;text-align:center;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#999;">Issues Found</div>
        <div style="font-size:28px;font-weight:700;color:#01251e;margin-top:4px;">${(findings || []).length}</div>
      </div>
      <div style="padding:16px;border:1px solid #fecaca;border-radius:12px;text-align:center;background:#fef2f2;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#999;">Fees This Period</div>
        <div style="font-size:28px;font-weight:700;color:#dc2626;margin-top:4px;">${fc(summary?.totalFeesFound || 0)}</div>
      </div>
      <div style="padding:16px;border:1px solid #fecaca;border-radius:12px;text-align:center;background:#fef2f2;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#999;">Annual Projection</div>
        <div style="font-size:28px;font-weight:700;color:#dc2626;margin-top:4px;">${fc(summary?.annualProjection || 0)}</div>
      </div>
      <div style="padding:16px;border:1px solid #C4F6C6;border-radius:12px;text-align:center;background:#f0fdf4;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#999;">You'd Save / Year</div>
        <div style="font-size:28px;font-weight:700;color:#004639;margin-top:4px;">${fc(summary?.annualSavings || 0)}</div>
      </div>
    </div>

    <!-- Findings -->
    <h2 style="font-size:18px;font-weight:700;color:#01251e;margin-bottom:16px;">What We Found</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:32px;">
      <thead>
        <tr style="background:#f9f9f9;">
          <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#999;border-bottom:2px solid #e5e5e5;">Category</th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#999;border-bottom:2px solid #e5e5e5;">Description</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#999;border-bottom:2px solid #e5e5e5;">Amount</th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#999;border-bottom:2px solid #e5e5e5;">Loop Alternative</th>
        </tr>
      </thead>
      <tbody>${findingsRows}</tbody>
    </table>

    <!-- Recommendations -->
    ${recsHtml ? `<h2 style="font-size:18px;font-weight:700;color:#01251e;margin-bottom:16px;">Recommendations</h2>${recsHtml}` : ""}

    <!-- Plan Comparison -->
    ${plansHtml ? `
    <h2 style="font-size:18px;font-weight:700;color:#01251e;margin:32px 0 16px;">Your Bank vs Loop</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:32px;">
      <thead>
        <tr style="background:#f9f9f9;">
          <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#999;border-bottom:2px solid #e5e5e5;">Plan</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;color:#999;border-bottom:2px solid #e5e5e5;">Monthly Fee</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;color:#999;border-bottom:2px solid #e5e5e5;">FX Rate</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;color:#999;border-bottom:2px solid #e5e5e5;">Annual Cost</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;color:#999;border-bottom:2px solid #e5e5e5;">Annual Savings</th>
        </tr>
      </thead>
      <tbody>${plansHtml}</tbody>
    </table>
    ` : ""}

    <!-- Footer -->
    <div style="margin-top:48px;padding-top:24px;border-top:2px solid #004639;text-align:center;">
      <div style="font-size:20px;font-weight:700;color:#004639;margin-bottom:8px;">Ready to stop the bleed?</div>
      <div style="font-size:14px;color:#666;margin-bottom:16px;">Open your free Loop account at go.bankonloop.com/signup</div>
      <div style="font-size:11px;color:#999;">This report was generated by Bleed by Loop · bankonloop.com</div>
    </div>
  </div>
</body>
</html>`;

    // Return as downloadable HTML file (works universally without puppeteer)
    // Browsers can print-to-PDF from this
    return new NextResponse(html, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="bleed-audit-report-${new Date().toISOString().slice(0, 10)}.html"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
