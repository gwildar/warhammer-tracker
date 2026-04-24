#!/usr/bin/env node
// crawl-tow-rules.mjs — snapshot tow.whfb.app rules for offline reference
//
// Usage:
//   node scripts/crawl-tow-rules.mjs [--output ~/path/to/output]
//   node scripts/crawl-tow-rules.mjs --subpages-only   # skip top-level re-fetch
//
// Output (default: ~/tow-rules/):
//   index.json                      — route index
//   raw/{type}.json                 — top-level page props
//   raw/{type}/{entry}.json         — sub-page props
//   pages/{type}.md                 — consolidated Markdown per type
//
// Rate-limited to 1 req/sec. Data NOT committed to repo.

import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const BASE_URL = "https://tow.whfb.app";
const USER_AGENT =
  "warhammer-tracker-scraper/1.0 (personal project; https://github.com/gwildar/warhammer-tracker)";
const DELAY_MS = 1000;

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const outputIdx = argv.indexOf("--output");
  const outputDir =
    outputIdx !== -1 && argv[outputIdx + 1]
      ? argv[outputIdx + 1].replace(/^~/, os.homedir())
      : path.join(os.homedir(), "tow-rules");
  const subpagesOnly = argv.includes("--subpages-only");
  return { outputDir, subpagesOnly };
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { "User-Agent": USER_AGENT } },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve(body));
      },
    );
    req.on("error", reject);
    req.setTimeout(15000, () =>
      req.destroy(new Error(`Timeout fetching ${url}`)),
    );
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

function extractNextData(html) {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!match) throw new Error("Could not find __NEXT_DATA__ in homepage HTML");
  return JSON.parse(match[1]);
}

function extractTopLevelRoutes(html) {
  const routes = new Set();
  const re = /href="(\/[a-z][a-z0-9-]*)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    if (
      href === "/" ||
      href.startsWith("/_") ||
      href.startsWith("/api") ||
      href.startsWith("/apps")
    )
      continue;
    if (href.split("/").filter(Boolean).length === 1) routes.add(href.slice(1));
  }
  return [...routes].sort();
}

// ---------------------------------------------------------------------------
// Rich-text → Markdown
// ---------------------------------------------------------------------------

function rtToMd(node, listDepth = 0) {
  if (!node) return "";
  switch (node.nodeType) {
    case "document":
      return (node.content || [])
        .map((n) => rtToMd(n, listDepth))
        .join("")
        .trim();

    case "paragraph": {
      const text = (node.content || [])
        .map((n) => rtToMd(n, listDepth))
        .join("");
      return text.trim() ? `${text.trim()}\n\n` : "";
    }

    case "heading-1":
      return `# ${inline(node, listDepth)}\n\n`;
    case "heading-2":
      return `## ${inline(node, listDepth)}\n\n`;
    case "heading-3":
      return `### ${inline(node, listDepth)}\n\n`;
    case "heading-4":
      return `#### ${inline(node, listDepth)}\n\n`;
    case "heading-5":
      return `##### ${inline(node, listDepth)}\n\n`;
    case "heading-6":
      return `###### ${inline(node, listDepth)}\n\n`;

    case "unordered-list": {
      const indent = "  ".repeat(listDepth);
      const items = (node.content || [])
        .map((li) => `${indent}- ${liText(li, listDepth + 1)}`)
        .join("\n");
      return `${items}\n\n`;
    }

    case "ordered-list": {
      const indent = "  ".repeat(listDepth);
      const items = (node.content || [])
        .map((li, i) => `${indent}${i + 1}. ${liText(li, listDepth + 1)}`)
        .join("\n");
      return `${items}\n\n`;
    }

    case "list-item":
      return liText(node, listDepth);

    case "blockquote": {
      const text = (node.content || [])
        .map((n) => rtToMd(n, listDepth))
        .join("")
        .trim();
      return (
        text
          .split("\n")
          .map((l) => `> ${l}`)
          .join("\n") + "\n\n"
      );
    }

    case "hr":
      return `---\n\n`;

    case "table": {
      const rows = node.content || [];
      if (!rows.length) return "";
      const cells = (row) =>
        (row.content || []).map((cell) =>
          (cell.content || [])
            .map((n) => rtToMd(n, listDepth))
            .join("")
            .trim()
            .replace(/\|/g, "\\|"),
        );
      const colCount = Math.max(...rows.map((r) => (r.content || []).length));
      const pad = (arr) => {
        while (arr.length < colCount) arr.push("");
        return arr;
      };
      const header = pad(cells(rows[0]));
      const sep = header.map(() => "---");
      const body = rows
        .slice(1)
        .map((r) => `| ${pad(cells(r)).join(" | ")} |`);
      return (
        [`| ${header.join(" | ")} |`, `| ${sep.join(" | ")} |`, ...body].join(
          "\n",
        ) + "\n\n"
      );
    }

    case "hyperlink": {
      const uri = node.data?.uri || "";
      return `[${inline(node, listDepth)}](${uri})`;
    }

    case "entry-hyperlink":
    case "asset-hyperlink":
      return inline(node, listDepth);

    case "embedded-entry-block":
    case "embedded-asset-block":
    case "embedded-entry-inline":
      return "";

    case "text": {
      let t = node.value || "";
      if (!t) return "";
      const marks = (node.marks || []).map((m) => m.type);
      if (marks.includes("code")) return `\`${t}\``;
      if (marks.includes("bold") && marks.includes("italic"))
        return `**_${t}_**`;
      if (marks.includes("bold")) return `**${t}**`;
      if (marks.includes("italic")) return `_${t}_`;
      return t;
    }

    default:
      return (node.content || []).map((n) => rtToMd(n, listDepth)).join("");
  }
}

function inline(node, depth) {
  return (node.content || [])
    .map((n) => rtToMd(n, depth))
    .join("")
    .trim();
}

function liText(li, depth) {
  return (li.content || [])
    .map((child) => {
      if (
        child.nodeType === "unordered-list" ||
        child.nodeType === "ordered-list"
      ) {
        return "\n" + rtToMd(child, depth).trimEnd();
      }
      return rtToMd(child, depth).trim();
    })
    .join(" ")
    .trim();
}

// ---------------------------------------------------------------------------
// Markdown builders
// ---------------------------------------------------------------------------

function typePageToMarkdown(typeSlug, pageProps, entryPages) {
  const topEntry = pageProps?.entry;
  const name = topEntry?.fields?.name || typeSlug;
  const ref = topEntry?.fields?.pageReference;
  const topBody = topEntry?.fields?.body;

  const lines = [`# ${name}\n`];
  if (ref) lines.push(`_Rulebook page: ${ref}_\n`);
  if (topBody) {
    lines.push(rtToMd(topBody));
    lines.push("");
  }

  for (const { slug, pageProps: sub } of entryPages) {
    const e = sub?.entry;
    if (!e) continue;
    const entryName = e.fields?.name || slug;
    const entryRef = e.fields?.pageReference;
    const body = e.fields?.body;

    lines.push(`## ${entryName}\n`);
    if (entryRef) lines.push(`_Rulebook page: ${entryRef}_\n`);
    if (body) {
      lines.push(rtToMd(body));
      lines.push("");
    }
  }

  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim() + "\n";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { outputDir, subpagesOnly } = parseArgs(process.argv.slice(2));
  const rawDir = path.join(outputDir, "raw");
  const pagesDir = path.join(outputDir, "pages");
  fs.mkdirSync(rawDir, { recursive: true });
  fs.mkdirSync(pagesDir, { recursive: true });

  console.log(`Output: ${outputDir}`);

  let buildId;
  let topRoutes;

  // ------------------------------------------------------------------
  // Phase 1: top-level pages
  // ------------------------------------------------------------------
  if (!subpagesOnly) {
    console.log("\nPhase 1: top-level pages");
    console.log("Fetching homepage...");

    const homeHtml = await get(`${BASE_URL}/`);
    const nextData = extractNextData(homeHtml);
    buildId = nextData.buildId;
    if (!buildId) throw new Error("Could not extract buildId");
    console.log(`buildId: ${buildId}`);

    // Save buildId for resumption
    fs.writeFileSync(path.join(outputDir, ".buildid"), buildId);

    topRoutes = extractTopLevelRoutes(homeHtml);
    console.log(`Found ${topRoutes.length} top-level routes\n`);

    for (const route of topRoutes) {
      const url = `${BASE_URL}/_next/data/${buildId}/${route}.json`;
      try {
        process.stdout.write(`  /${route}... `);
        const body = await get(url);
        const json = JSON.parse(body);
        fs.writeFileSync(
          path.join(rawDir, `${route}.json`),
          JSON.stringify(json, null, 2),
        );
        const title = json.pageProps?.entry?.fields?.name || route;
        console.log(`OK (${title})`);
      } catch (err) {
        console.log(`FAILED: ${err.message}`);
      }
      await sleep(DELAY_MS);
    }
  } else {
    // Read saved buildId
    const buildIdFile = path.join(outputDir, ".buildid");
    if (!fs.existsSync(buildIdFile))
      throw new Error("No .buildid file found — run without --subpages-only first");
    buildId = fs.readFileSync(buildIdFile, "utf8").trim();
    console.log(`Using saved buildId: ${buildId}`);
    topRoutes = fs
      .readdirSync(rawDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""))
      .sort();
    console.log(`Found ${topRoutes.length} cached top-level routes`);
  }

  // ------------------------------------------------------------------
  // Phase 2: sub-pages
  // ------------------------------------------------------------------
  console.log("\nPhase 2: sub-pages");

  const index = {};
  let savedSub = 0;
  let failedSub = 0;

  for (const typeSlug of topRoutes) {
    const topRawPath = path.join(rawDir, `${typeSlug}.json`);
    if (!fs.existsSync(topRawPath)) continue;

    const topJson = JSON.parse(fs.readFileSync(topRawPath, "utf8"));
    const pageProps = topJson.pageProps;
    const entries = pageProps?.entries || [];

    if (entries.length === 0) {
      // No sub-entries — write page as-is from top-level body
      const md = typePageToMarkdown(typeSlug, pageProps, []);
      fs.writeFileSync(path.join(pagesDir, `${typeSlug}.md`), md);
      const title = pageProps?.entry?.fields?.name || typeSlug;
      index[typeSlug] = { title, mdFile: `pages/${typeSlug}.md`, entries: 0 };
      continue;
    }

    const subRawDir = path.join(rawDir, typeSlug);
    fs.mkdirSync(subRawDir, { recursive: true });

    console.log(
      `  ${typeSlug}: ${entries.length} entries`,
    );

    const entryPages = [];

    for (let i = 0; i < entries.length; i++) {
      const entrySlug = entries[i].fields?.slug;
      if (!entrySlug) continue;

      const subRawPath = path.join(subRawDir, `${entrySlug}.json`);

      // Skip already fetched
      if (fs.existsSync(subRawPath)) {
        const cached = JSON.parse(fs.readFileSync(subRawPath, "utf8"));
        entryPages.push({ slug: entrySlug, pageProps: cached.pageProps });
        continue;
      }

      const url = `${BASE_URL}/_next/data/${buildId}/${typeSlug}/${entrySlug}.json`;
      try {
        const body = await get(url);
        const json = JSON.parse(body);
        fs.writeFileSync(subRawPath, JSON.stringify(json, null, 2));
        entryPages.push({ slug: entrySlug, pageProps: json.pageProps });
        savedSub++;

        if ((i + 1) % 50 === 0) {
          console.log(`    ... ${i + 1}/${entries.length}`);
        }
      } catch (err) {
        console.log(`    FAILED /${typeSlug}/${entrySlug}: ${err.message}`);
        failedSub++;
        entryPages.push({ slug: entrySlug, pageProps: null });
      }

      await sleep(DELAY_MS);
    }

    // Write consolidated Markdown
    const md = typePageToMarkdown(typeSlug, pageProps, entryPages);
    fs.writeFileSync(path.join(pagesDir, `${typeSlug}.md`), md);

    const title = pageProps?.entry?.fields?.name || typeSlug;
    index[typeSlug] = {
      title,
      mdFile: `pages/${typeSlug}.md`,
      entries: entries.length,
    };
    console.log(`    → pages/${typeSlug}.md (${entries.length} entries)`);
  }

  fs.writeFileSync(
    path.join(outputDir, "index.json"),
    JSON.stringify(index, null, 2),
  );

  console.log(
    `\nDone. Sub-pages fetched: ${savedSub}${failedSub ? `, failed: ${failedSub}` : ""} → ${outputDir}`,
  );
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
