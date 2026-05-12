"use client";

const SIGNUP_BASE_URL = "https://go.bankonloop.com/signup";
const STORAGE_KEY = "bleed_attribution_params";

const ATTRIBUTION_PARAM_NAMES = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "utm_source_platform",
  "utm_creative_format",
  "utm_marketing_tactic",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
  "ttclid",
  "li_fat_id",
] as const;

function isAttributionParam(name: string) {
  return ATTRIBUTION_PARAM_NAMES.includes(name as (typeof ATTRIBUTION_PARAM_NAMES)[number]);
}

function readStoredParams(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();

  try {
    return new URLSearchParams(window.localStorage.getItem(STORAGE_KEY) || "");
  } catch {
    return new URLSearchParams();
  }
}

function writeStoredParams(params: URLSearchParams) {
  if (typeof window === "undefined" || params.size === 0) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, params.toString());
  } catch {
    // Ignore storage failures, such as private browsing restrictions.
  }
}

export function persistAttributionParams() {
  if (typeof window === "undefined") return;

  const currentParams = new URLSearchParams(window.location.search);
  const storedParams = readStoredParams();
  let changed = false;

  currentParams.forEach((value, key) => {
    if (!isAttributionParam(key) || !value) return;
    storedParams.set(key, value);
    changed = true;
  });

  if (changed) writeStoredParams(storedParams);
}

export function buildSignupUrl() {
  const signupUrl = new URL(SIGNUP_BASE_URL);

  if (typeof window === "undefined") return signupUrl.toString();

  const params = signupUrl.searchParams;
  const storedParams = readStoredParams();
  const currentParams = new URLSearchParams(window.location.search);

  // Stored attribution keeps UTMs available after the user navigates around Bleed.
  storedParams.forEach((value, key) => {
    if (isAttributionParam(key) && value) params.set(key, value);
  });

  // Current URL wins, so clicking the CTA on a fresh UTM URL passes those exact values.
  currentParams.forEach((value, key) => {
    if (isAttributionParam(key) && value) params.set(key, value);
  });

  params.set("referrer", window.location.href);
  params.set("source", "bleed");

  return signupUrl.toString();
}
