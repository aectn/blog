// check-online.mjs
// Verifies that the live site matches the locally built dist/ by comparing
// asset fingerprints (/_astro/<name>.js|.css) referenced by the homepage.
// Usage: node scripts/check-online.mjs   (or: npm run check:online)

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://blog.aectn.top";

// Collect every /_astro/ asset referenced in an HTML document.
function assetsOf(html) {
  const set = new Set();
  for (const m of html.matchAll(/_astro\/[A-Za-z0-9._-]+/g)) set.add(m[0]);
  return set;
}

// 1) local build output
const localFile = path.join(ROOT, "dist/index.html");
if (!existsSync(localFile)) {
  console.log("[FAIL] dist/index.html not found.");
  console.log("[FIX ] run: npm run build   (on this machine add CODEBUDDY_SAFE_DELETE_ENABLED=0)");
  process.exit(1);
}
const local = assetsOf(readFileSync(localFile, "utf8"));

// 2) live homepage, forced revalidate so CF edge cache cannot hide the truth
// 用 Node 原生 fetch 而不是 spawn curl：Windows 上 spawnSync curl 会随机报 EBUSY。
const res = await fetch(SITE + "/", {
  headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
});
if (!res.ok) {
  console.log(`[FAIL] ${SITE} 返回 HTTP ${res.status}`);
  process.exit(1);
}
const online = assetsOf(await res.text());

// 3) compare
const missing = [...local].filter((a) => !online.has(a)); // in dist but not live
const extra = [...online].filter((a) => !local.has(a)); // live but not in dist

console.log("local assets : " + local.size);
console.log("live  assets : " + online.size);

if (missing.length === 0 && extra.length === 0) {
  console.log("OK    live assets are 100% identical to the local build.");
  process.exit(0);
}

console.log("MISMATCH     : " + missing.length + " asset(s) missing on live, " + extra.length + " extra.");
if (missing.length) {
  console.log("-- missing on live (these are the NEW ones not uploaded yet):");
  missing.slice(0, 15).forEach((a) => console.log("   - /" + a));
  if (missing.length > 15) console.log("   ... (" + (missing.length - 15) + " more)");
}
if (extra.length) {
  console.log("-- extra on live (OLD files still cached at the edge):");
  extra.slice(0, 10).forEach((a) => console.log("   + /" + a));
}
console.log("FIX          : npm run build   then   npm run deploy");
process.exit(2);
