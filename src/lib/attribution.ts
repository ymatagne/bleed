"use client";

const SIGNUP_BASE_URL = "https://go.bankonloop.com/signup";
const STORAGE_KEY = "bleed_attribution_params";
const MAX_PARAM_VALUE_LENGTH = 500;

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

type AttributionParamName = (typeof ATTRIBUTION_PARAM_NAMES)[number];

function isAttributionParam(name: string): name is AttributionParamName {
  return ATTRIBUTION_PARAM_NAMES.includes(name as AttributionParamName);
}

function sanitizeParamValue(value: string) {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, MAX_PARAM_VALUE_LENGTH);
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

function collectAttributionParams(params: URLSearchParams) {
  const attributionParams = new URLSearchParams();

  params.forEach((value, key) => {
    if (!isAttributionParam(key)) return;

    const sanitizedValue = sanitizeParamValue(value);
    if (sanitizedValue) attributionParams.set(key, sanitizedValue);
  });

  return attributionParams;
}

function mergeParams(target: URLSearchParams, source: URLSearchParams) {
  source.forEach((value, key) => target.set(key, value));
}

function createSignupUrl() {
  const signupUrl = new URL(SIGNUP_BASE_URL);

  if (signupUrl.protocol !== "https:" || signupUrl.hostname !== "go.bankonloop.com") {
    throw new Error("Invalid signup URL");
  }

  return signupUrl;
}

export function persistAttributionParams() {
  if (typeof window === "undefined") return;

  const currentParams = collectAttributionParams(new URLSearchParams(window.location.search));
  if (currentParams.size === 0) return;

  const storedParams = readStoredParams();
  mergeParams(storedParams, currentParams);
  writeStoredParams(storedParams);
}

export function buildSignupUrl() {
  try {
    const signupUrl = createSignupUrl();

    if (typeof window === "undefined") return signupUrl.toString();

    const params = signupUrl.searchParams;

    // Stored attribution keeps UTMs available after the user navigates around Bleed.
    mergeParams(params, collectAttributionParams(readStoredParams()));

    // Current URL wins, so clicking the CTA on a fresh UTM URL passes those exact values.
    mergeParams(params, collectAttributionParams(new URLSearchParams(window.location.search)));

    const referrer = sanitizeParamValue(window.location.href);
    if (referrer) params.set("referrer", referrer);
    params.set("source", "bleed");

    return signupUrl.toString();
  } catch {
    return SIGNUP_BASE_URL;
  }
}
