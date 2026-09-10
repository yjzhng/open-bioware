#!/usr/bin/env node
/**
 * Open Bioware — refresh the committed release snapshot.
 *
 *   node scripts/fetch-releases.mjs
 *
 * Writes data/releases.json: the newest release of every app that downloads
 * from GitHub, trimmed to what the page actually shows. The site build reads
 * that file so a visitor sees the version and the right build immediately,
 * with no API call — the unauthenticated API allows only 60 requests an hour
 * per address, which a shared network can exhaust between visitors.
 *
 * The build itself never reaches the network: it must produce identical output
 * from the same inputs, or the CI staleness check cannot tell stale HTML from
 * a release cut since the last build. So refreshing is a deliberate step, run
 * when an app publishes a release.
 *
 * Authenticates with GITHUB_TOKEN / GH_TOKEN, else the gh CLI's token, else
 * runs anonymously and is subject to that same 60/hour limit.
 */

import { readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const run = promisify(execFile);

async function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  try {
    const { stdout } = await run("gh", ["auth", "token"]);
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

/** Only the fields the page reads, in the API's own shape so the browser can
 *  apply a snapshot and a live response through one code path. */
const trim = (release) => ({
  tag_name: release.tag_name || "",
  published_at: release.published_at || "",
  html_url: release.html_url || "",
  assets: (release.assets || []).map((a) => ({
    name: a.name,
    browser_download_url: a.browser_download_url,
    size: a.size,
  })),
});

async function main() {
  const apps = JSON.parse(await readFile(join(root, "data/apps.json"), "utf8"));

  // Start from what is already committed. A fetch that fails — a rate limit, a
  // blip, an app whose release was deleted — then leaves that app's entry as it
  // was, instead of silently dropping the version from its page.
  let previous = {};
  try {
    previous = JSON.parse(await readFile(join(root, "data/releases.json"), "utf8"));
  } catch {
    // No snapshot yet; the first run writes one.
  }
  const auth = await token();
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "open-bioware-site",
    ...(auth ? { Authorization: "Bearer " + auth } : {}),
  };
  console.log(auth ? "Authenticated request." : "Anonymous request (60/hour).");

  const out = { ...previous };
  let failed = 0;
  let fetched = 0;

  for (const app of apps) {
    const type = app.download?.type ?? "github";
    if (type !== "github" || !app.repo) continue;

    const url = `https://api.github.com/repos/${app.repo}/releases/latest`;
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const release = trim(await res.json());
      const before = previous[app.slug];
      out[app.slug] = release;
      fetched += 1;
      const change =
        before && before.tag_name !== release.tag_name ? ` (was ${before.tag_name})` : "";
      console.log(`  ${app.name} → ${release.tag_name}${change} (${release.assets.length} assets)`);
    } catch (err) {
      failed += 1;
      const kept = previous[app.slug];
      console.error(
        `  ${app.name} → failed: ${err.message}` +
          (kept ? ` — keeping ${kept.tag_name}` : " — no previous entry to keep")
      );
    }
  }

  // Nothing new to trust: leave the committed snapshot exactly as it is.
  if (!fetched) {
    console.error("\nNothing fetched; leaving data/releases.json untouched.");
    process.exitCode = 1;
    return;
  }

  // Sorted keys so an unchanged snapshot produces a byte-identical file.
  const sorted = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
  await writeFile(join(root, "data/releases.json"), JSON.stringify(sorted, null, 2) + "\n", "utf8");
  console.log(
    `\nWrote data/releases.json (${Object.keys(sorted).length} apps: ` +
      `${fetched} refreshed${failed ? `, ${failed} kept from the previous snapshot` : ""}).`
  );
  // A partial failure is survivable, because those entries were preserved, so
  // this still succeeds: an unattended run should not stop over one blip.

}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
