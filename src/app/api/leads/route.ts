import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const lead = {
      name,
      email,
      company: company || "",
      timestamp: new Date().toISOString(),
      source: "bleed-audit",
    };

    // Log to console (wire to DB/Resend later)
    console.log("[LEAD CAPTURED]", JSON.stringify(lead));

    // Try to append to a local JSON file
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "leads.json");
      
      let leads: unknown[] = [];
      try {
        const existing = await fs.readFile(filePath, "utf-8");
        leads = JSON.parse(existing);
      } catch {
        // File doesn't exist yet
      }
      
      leads.push(lead);
      await fs.writeFile(filePath, JSON.stringify(leads, null, 2));
    } catch {
      // File write failed (e.g., read-only filesystem) — console log is the fallback
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
