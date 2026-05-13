#!/usr/bin/env node
/**
 * Writes the fully-assembled blog markdown (frontmatter + body) to content/blog/{slug}.md.
 *
 * The upstream GEO/SEO platform sends `content` as a complete .md file; this script validates
 * the slug and frontmatter shape, then writes the file verbatim. The separate title/description/
 * keywords inputs are kept for observability (commit metadata, run summary) but not reassembled
 * into frontmatter here.
 */

const fs = require("fs");
const path = require("path");

const {
  POST_TITLE,
  POST_SLUG,
  POST_DESCRIPTION,
  POST_KEYWORDS,
  POST_CONTENT,
  POST_DATE,
  POST_CORRELATION_ID,
} = process.env;

function fail(msg) {
  console.error(`[publish-blog] ERROR: ${msg}`);
  process.exit(1);
}

if (!POST_TITLE) fail("title is required");
if (!POST_SLUG) fail("slug is required");
if (!POST_DESCRIPTION) fail("description is required");
if (!POST_KEYWORDS) fail("keywords is required");
if (!POST_CONTENT) fail("content is required");

// Validate slug: URL-safe, lowercase alphanumeric + hyphens, no double/leading/trailing hyphens
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(POST_SLUG)) {
  fail(
    `slug "${POST_SLUG}" is invalid. Must be lowercase alphanumeric with single hyphens between segments.`
  );
}

// Validate keywords is a JSON array of strings (observability only)
try {
  const kws = JSON.parse(POST_KEYWORDS);
  if (!Array.isArray(kws) || !kws.every((k) => typeof k === "string")) {
    throw new Error("must be a JSON array of strings");
  }
} catch (e) {
  fail(`keywords input is not valid: ${e.message}`);
}

// Validate date if provided
if (POST_DATE && POST_DATE.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(POST_DATE.trim())) {
  fail(`date "${POST_DATE}" must be YYYY-MM-DD`);
}

// Sanity-check that content looks like a markdown file with YAML frontmatter
const content = POST_CONTENT;
if (!content.startsWith("---")) {
  fail("content must start with YAML frontmatter delimiter '---'");
}
const frontmatterEnd = content.indexOf("\n---", 3);
if (frontmatterEnd === -1) {
  fail("content is missing closing '---' for YAML frontmatter");
}

// Ensure content ends with a newline for POSIX-friendly files
const normalized = content.endsWith("\n") ? content : content + "\n";

const outDir = path.join(process.cwd(), "content", "blog");
const outPath = path.join(outDir, `${POST_SLUG}.md`);

if (fs.existsSync(outPath)) {
  fail(
    `A post with slug "${POST_SLUG}" already exists at ${outPath}. Choose a unique slug and retry.`
  );
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, normalized, "utf-8");

console.log(
  `[publish-blog] Wrote ${outPath} (${normalized.length} bytes, correlation_id=${
    POST_CORRELATION_ID || "<none>"
  })`
);
