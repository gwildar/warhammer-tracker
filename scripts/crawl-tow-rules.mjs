#!/usr/bin/env node
// crawl-tow-rules.mjs — snapshot tow.whfb.app rules for offline reference
// Usage: node scripts/crawl-tow-rules.mjs [--output ~/path/to/output]
//
// Saves to ~/tow-rules/ by default. Data is NOT committed to the repo.
// Fetches _next/data JSON endpoints — same requests the browser makes.
// Rate-limited to 1 req/sec to be respectful.

import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const BASE_URL = "https://tow.whfb.app";
const USER_AGENT =
  "warhammer-tracker-scraper/1.0 (personal project; https://github.com/gwildar/warhammer-tracker)";
const DELAY_MS = 1000;

function parseArgs(argv) {
  const idx = argv.indexOf("--output");
  if (idx !== -1 && argv[idx + 1]) {
    return argv[idx + 1].replace(/^~/, os.homedir());
  }
  return path.join(os.homedir(), "tow-rules");
}

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      { headers: { "User-Agent": USER_AGENT } },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve(body));
      },
    );
    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy(new Error(`Timeout fetching ${url}`));
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractNextData(html) {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!match) throw new Error("Could not find __NEXT_DATA__ in homepage HTML");
  return JSON.parse(match[1]);
}

function extractRoutes(html) {
  const routes = new Set();
  const linkRegex = /href="(\/[a-z][a-z0-9-]*)"/g;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    if (
      href === "/" ||
      href.startsWith("/_") ||
      href.startsWith("/api") ||
      href.startsWith("/apps")
    )
      continue;
    // Flat single-segment paths only
    if (href.split("/").filter(Boolean).length === 1) {
      routes.add(href.slice(1));
    }
  }
  return [...routes].sort();
}

// Contentful rich-text → Markdown
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
      const trimmed = text.trim();
      return trimmed ? `${trimmed}\n\n` : "";
    }

    case "heading-1":
      return `# ${inlineContent(node, listDepth)}\n\n`;
    case "heading-2":
      return `## ${inlineContent(node, listDepth)}\n\n`;
    case "heading-3":
      return `### ${inlineContent(node, listDepth)}\n\n`;
    case "heading-4":
      return `#### ${inlineContent(node, listDepth)}\n\n`;
    case "heading-5":
      return `##### ${inlineContent(node, listDepth)}\n\n`;
    case "heading-6":
      return `###### ${inlineContent(node, listDepth)}\n\n`;

    case "unordered-list": {
      const items = (node.content || [])
        .map((item) => {
          const text = listItemText(item, listDepth + 1);
          const indent = "  ".repeat(listDepth);
          return `${indent}- ${text}`;
        })
        .join("\n");
      return `${items}\n\n`;
    }

    case "ordered-list": {
      const items = (node.content || [])
        .map((item, i) => {
          const text = listItemText(item, listDepth + 1);
          const indent = "  ".repeat(listDepth);
          return `${indent}${i + 1}. ${text}`;
        })
        .join("\n");
      return `${items}\n\n`;
    }

    case "list-item":
      return listItemText(node, listDepth);

    case "blockquote": {
      const text = (node.content || [])
        .map((n) => rtToMd(n, listDepth))
        .join("")
        .trim();
      return (
        text
          .split("\n")
          .map((line) => `> ${line}`)
          .join("\n") + "\n\n"
      );
    }

    case "hr":
      return `---\n\n`;

    case "table": {
      const rows = node.content || [];
      if (rows.length === 0) return "";

      const allRows = rows.map((row) =>
        (row.content || []).map((cell) =>
          (cell.content || [])
            .map((n) => rtToMd(n, listDepth))
            .join("")
            .trim()
            .replace(/\|/g, "\\|"),
        ),
      );

      const colCount = Math.max(...allRows.map((r) => r.length));
      const header = allRows[0] || [];
      while (header.length < colCount) header.push("");
      const separator = header.map(() => "---");

      const bodyRows = allRows.slice(1).map((row) => {
        while (row.length < colCount) row.push("");
        return `| ${row.join(" | ")} |`;
      });

      return [
        `| ${header.join(" | ")} |`,
        `| ${separator.join(" | ")} |`,
        ...bodyRows,
      ].join("\n") + "\n\n";
    }

    case "hyperlink": {
      const text = inlineContent(node, listDepth);
      const uri = node.data?.uri || "";
      return `[${text}](${uri})`;
    }

    case "entry-hyperlink":
    case "asset-hyperlink":
      return inlineContent(node, listDepth);

    case "embedded-entry-block":
    case "embedded-asset-block":
    case "embedded-entry-inline":
      return "";

    case "text": {
      let text = node.value || "";
      if (!text) return "";
      const marks = (node.marks || []).map((m) => m.type);
      if (marks.includes("code")) return `\`${text}\``;
      if (marks.includes("bold") && marks.includes("italic"))
        return `**_${text}_**`;
      if (marks.includes("bold")) return `**${text}**`;
      if (marks.includes("italic")) return `_${text}_`;
      return text;
    }

    default:
      return (node.content || []).map((n) => rtToMd(n, listDepth)).join("");
  }
}

function inlineContent(node, listDepth) {
  return (node.content || []).map((n) => rtToMd(n, listDepth)).join("").trim();
}

function listItemText(item, listDepth) {
  // A list-item contains paragraphs and possibly nested lists
  return (item.content || [])
    .map((child) => {
      if (
        child.nodeType === "unordered-list" ||
        child.nodeType === "ordered-list"
      ) {
        return "\n" + rtToMd(child, listDepth);
      }
      return rtToMd(child, listDepth).trim();
    })
    .join(" ")
    .trim();
}

function pageToMarkdown(pageProps, route) {
  const entry = pageProps?.entry;
  const entries = pageProps?.entries || [];

  const lines = [];

  const pageTitle = entry?.fields?.name || route;
  lines.push(`# ${pageTitle}\n`);

  const pageRef = entry?.fields?.pageReference;
  if (pageRef) lines.push(`_Rulebook page: ${pageRef}_\n`);

  if (entry?.fields?.body) {
    lines.push(rtToMd(entry.fields.body));
    lines.push("");
  }

  for (const e of entries) {
    const name = e?.fields?.name;
    const body = e?.fields?.body;
    const ref = e?.fields?.pageReference;

    if (name) lines.push(`## ${name}\n`);
    if (ref) lines.push(`_Rulebook page: ${ref}_\n`);
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

async function main() {
  const outputDir = parseArgs(process.argv.slice(2));
  const rawDir = path.join(outputDir, "raw");
  const pagesDir = path.join(outputDir, "pages");

  fs.mkdirSync(rawDir, { recursive: true });
  fs.mkdirSync(pagesDir, { recursive: true });

  console.log(`Output: ${outputDir}`);
  console.log("Fetching homepage...");

  const homeHtml = await get(`${BASE_URL}/`);
  const nextData = extractNextData(homeHtml);
  const { buildId } = nextData;

  if (!buildId) throw new Error("Could not extract buildId from __NEXT_DATA__");
  console.log(`buildId: ${buildId}`);

  const routes = extractRoutes(homeHtml);
  console.log(`Found ${routes.length} routes: ${routes.join(", ")}\n`);

  const index = {};
  let saved = 0;
  let failed = 0;

  for (const route of routes) {
    const url = `${BASE_URL}/_next/data/${buildId}/${route}.json`;

    try {
      process.stdout.write(`  /${route}... `);
      const body = await get(url);
      const json = JSON.parse(body);

      fs.writeFileSync(
        path.join(rawDir, `${route}.json`),
        JSON.stringify(json, null, 2),
      );

      const pageProps = json?.pageProps;
      const md = pageToMarkdown(pageProps, route);
      fs.writeFileSync(path.join(pagesDir, `${route}.md`), md);

      const title = pageProps?.entry?.fields?.name || route;
      index[route] = {
        title,
        rawFile: `raw/${route}.json`,
        mdFile: `pages/${route}.md`,
      };

      console.log(`OK (${title})`);
      saved++;
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failed++;
    }

    await sleep(DELAY_MS);
  }

  fs.writeFileSync(
    path.join(outputDir, "index.json"),
    JSON.stringify(index, null, 2),
  );

  console.log(
    `\nSaved ${saved} pages${failed ? `, ${failed} failed` : ""} → ${outputDir}`,
  );
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
