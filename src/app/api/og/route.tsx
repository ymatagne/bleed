import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const bankName = searchParams.get("bankName") || "Your Bank";
  const totalFees = searchParams.get("totalFees") || "0";
  const annualProjection = searchParams.get("annualProjection") || "0";
  const annualSavings = searchParams.get("annualSavings") || "0";
  const findingsCount = searchParams.get("findingsCount") || "0";

  const fmt = (v: string) =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(v));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#01251e",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <span style={{ fontSize: "42px", fontWeight: 800, color: "#C4F6C6", letterSpacing: "-1px" }}>bleed</span>
            <span style={{ fontSize: "20px", color: "rgba(255,255,255,0.5)" }}>by Loop</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 20px",
              backgroundColor: "rgba(255,77,77,0.15)",
              borderRadius: "100px",
              border: "1px solid rgba(255,77,77,0.3)",
            }}
          >
            <span style={{ fontSize: "18px", color: "#ff6b6b", fontWeight: 600 }}>⚠ {findingsCount} issues found</span>
          </div>
        </div>

        {/* Bank name */}
        <div style={{ display: "flex", marginBottom: "10px" }}>
          <span style={{ fontSize: "22px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "3px", fontWeight: 600 }}>
            Banking Audit — {bankName}
          </span>
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: "flex",
            flex: 1,
            gap: "24px",
            marginTop: "20px",
          }}
        >
          {/* Fees found */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              backgroundColor: "rgba(255,255,255,0.06)",
              borderRadius: "20px",
              padding: "32px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px" }}>
              Fees Found
            </span>
            <span style={{ fontSize: "52px", fontWeight: 800, color: "#ff6b6b", letterSpacing: "-2px" }}>{fmt(totalFees)}</span>
          </div>

          {/* Annual projection */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              backgroundColor: "rgba(255,255,255,0.06)",
              borderRadius: "20px",
              padding: "32px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px" }}>
              Annual Projection
            </span>
            <span style={{ fontSize: "52px", fontWeight: 800, color: "#99E5FD", letterSpacing: "-2px" }}>{fmt(annualProjection)}</span>
          </div>

          {/* Savings with Loop */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              backgroundColor: "rgba(196,246,198,0.1)",
              borderRadius: "20px",
              padding: "32px",
              border: "1px solid rgba(196,246,198,0.2)",
            }}
          >
            <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px" }}>
              Save with Loop
            </span>
            <span style={{ fontSize: "52px", fontWeight: 800, color: "#C4F6C6", letterSpacing: "-2px" }}>{fmt(annualSavings)}</span>
            <span style={{ fontSize: "16px", color: "rgba(196,246,198,0.6)", marginTop: "4px" }}>per year</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "30px" }}>
          <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.3)" }}>bleed.bankonloop.com</span>
          <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.3)" }}>See what your bank is hiding →</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
