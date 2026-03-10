import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Bleed — Your bank is bleeding you dry";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#004639",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
            <defs>
              <mask id="s">
                <rect width="64" height="64" fill="white" />
                <line x1="10" y1="48" x2="54" y2="32" stroke="black" strokeWidth="3" strokeLinecap="round" />
              </mask>
            </defs>
            <path
              d="M32.5 5C32.5 5 13 27.5 13 41C13 51.77 21.73 60.5 32.5 60.5C43.27 60.5 52 51.77 52 41C52 27.5 32.5 5 32.5 5Z"
              fill="#C4F6C6"
              mask="url(#s)"
            />
          </svg>
          <span style={{ fontSize: "56px", fontWeight: 800, color: "#C4F6C6", letterSpacing: "-2px" }}>bleed</span>
          <span style={{ fontSize: "24px", color: "rgba(255,255,255,0.5)", marginLeft: "4px" }}>by Loop</span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.1,
              letterSpacing: "-2px",
              maxWidth: "900px",
            }}
          >
            Your bank is{" "}
            <span style={{ color: "#ff6b6b" }}>bleeding</span> you dry.
          </span>
          <span
            style={{
              fontSize: "24px",
              color: "rgba(255,255,255,0.6)",
              marginTop: "24px",
              maxWidth: "700px",
            }}
          >
            Canadian banks hide 2.5–3% markups on every FX transaction. See exactly how much with our free audit tool.
          </span>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "40px",
            color: "rgba(255,255,255,0.3)",
            fontSize: "18px",
          }}
        >
          Free FX Audit Tool — bleed.bankonloop.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
