/**
 * Encode/decode AuditResult data for shareable URLs.
 * Uses base64-encoded JSON in the URL hash to avoid server round-trips.
 * For large reports, we trim findings to keep the URL manageable.
 */

const MAX_URL_LENGTH = 8000; // safe limit for most browsers via hash

export function encodeReportData(data: Record<string, unknown>): string {
  const json = JSON.stringify(data);
  // Use base64 encoding
  const encoded = btoa(unescape(encodeURIComponent(json)));
  return encoded;
}

export function decodeReportData(encoded: string): Record<string, unknown> | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Build a shareable report URL. If the full data is too large,
 * we progressively trim findings to fit within URL limits.
 */
export function buildShareUrl(baseUrl: string, data: Record<string, unknown>): string {
  // Try full data first
  let encoded = encodeReportData(data);
  let url = `${baseUrl}/report?d=${encoded}`;

  if (url.length <= MAX_URL_LENGTH) return url;

  // Trim findings to max 5
  const trimmed = {
    ...data,
    findings: (data.findings as unknown[])?.slice(0, 5) || [],
    _trimmed: true,
  };
  encoded = encodeReportData(trimmed);
  url = `${baseUrl}/report?d=${encoded}`;

  if (url.length <= MAX_URL_LENGTH) return url;

  // Summary only - no findings
  const summaryOnly = {
    bankName: data.bankName,
    statementPeriod: data.statementPeriod,
    currency: data.currency,
    findings: [],
    recommendations: (data.recommendations as unknown[])?.slice(0, 3) || [],
    summary: data.summary,
    planComparison: data.planComparison,
    _summaryOnly: true,
  };
  encoded = encodeReportData(summaryOnly);
  return `${baseUrl}/report?d=${encoded}`;
}
