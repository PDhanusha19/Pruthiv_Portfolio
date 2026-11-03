#!/usr/bin/env node
/* ============================================================================
   build-data.js — combines the CMS files into ONE file the website reads: data.json

     data/categories/*.json  +  data/projects/*.json  +  data/reels/*.json   →   data.json

   It runs automatically on GitHub every time you save in Pages CMS
   (see .github/workflows/build-data.yml). You can also run it by hand:  node build-data.js

   What it takes care of for you:
   - ids         → taken from the file name when a file has no "id" (the "slug")
   - category    → the one picked in the CMS is matched to a real category (by id, file name or name).
                   If you DELETE a category, its projects simply lose it (they stay under "All Projects").
   - published   → items switched OFF are left out of data.json, so they never show on the site
   - ordering    → "displayOrder" (small numbers first), then title
   - reels       → the YouTube Shorts video ID is extracted from the link automatically
   ============================================================================ */
const fs = require("fs"), path = require("path");
const root = __dirname;

const slug = s => String(s == null ? "" : s).toLowerCase().replace(/\.json$/, "").replace(/^.*[\\/]/, "")
  .normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function readDir(dir){
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter(f => f.toLowerCase().endsWith(".json")).sort().flatMap(f => {
    try {
      const o = JSON.parse(fs.readFileSync(path.join(full, f), "utf8"));
      if (!o || typeof o !== "object" || Array.isArray(o)) throw new Error("not an object");
      if (!o.id) o.id = slug(f);
      o.id = String(o.id);
      o._file = slug(f);
      return [o];
    } catch (e) { console.warn(`! Skipped ${dir}/${f}: ${e.message}`); return []; }
  });
}
const platformOf = url => {
  const u = String(url || "");
  return /youtu\.?be/.test(u) ? "YouTube" : /instagram\.com/.test(u) ? "Instagram" : /tiktok\.com/.test(u) ? "TikTok" : "";
};
const num = v => (v === "" || v == null || isNaN(Number(v))) ? Infinity : Number(v);
const orderValue = v => (v === "" || v == null || isNaN(Number(v))) ? null : Number(v);
const bool = (v, dflt) => v === undefined || v === null || v === "" ? dflt : (v === true || String(v).toLowerCase() === "true");
const byOrder = (a, b) => num(a.displayOrder) - num(b.displayOrder) || String(a.title || a.name).localeCompare(String(b.title || b.name));
const list = v => Array.isArray(v) ? v : (v == null || v === "" ? [] : [v]);

/* ---- categories ---- */
const categories = readDir("data/categories").map(c => ({
  id: c.id, name: String(c.name || c.id), displayOrder: orderValue(c.displayOrder), createdAt: c.createdAt || "", _file: c._file
})).sort((a, b) => num(a.displayOrder) - num(b.displayOrder) || String(a.createdAt).localeCompare(String(b.createdAt)) || a.name.localeCompare(b.name));

// A category can be referenced by id, file name, path or name — match them all
const lookup = new Map();
categories.forEach(c => [c.id, c._file, c.name].forEach(k => lookup.set(slug(k), c.id)));
const catIds = refs => [...new Set(list(refs).map(r => lookup.get(slug(typeof r === "object" && r ? (r.id || r.name || r.value) : r))).filter(Boolean))];

/* ---- projects ---- */
const media = o => {
  const url = String(o.videoUrl || "").trim();
  const chosen = String(o.videoPlatform || "");
  return { videoUrl: url, videoPlatform: platformOf(url) || (/^(youtube|instagram|tiktok)$/i.test(chosen) ? chosen : "") };
};
const frames = v => list(v).map(f => typeof f === "object" && f ? (f.image || f.src || "") : f).map(String).filter(Boolean);

const projects = readDir("data/projects").filter(p => bool(p.published, true)).map(p => ({
  id: p.id, title: String(p.title || p.id), subtitle: String(p.subtitle || ""), description: String(p.description || ""),
  categories: catIds(p.category !== undefined && p.category !== "" ? p.category : p.categories),
  ...media(p), thumbnail: String(p.thumbnail || ""), selectedFrames: frames(p.selectedFrames),
  isFeatured: bool(p.isFeatured, false), linkUrl: String(p.linkUrl || ""), reelsCollage: bool(p.reelsCollage, false),
  displayOrder: orderValue(p.displayOrder), createdAt: p.createdAt || "", updatedAt: p.updatedAt || ""
})).sort(byOrder);

/* ---- short reels (YouTube Shorts) ---- */
const shortId = url => {
  const m = String(url || "").match(/(?:youtube\.com\/(?:shorts\/|watch\?(?:.*&)?v=|embed\/|live\/)|youtu\.be\/)([\w-]{11})(?![\w-])/);
  return m ? m[1] : "";
};
const reels = readDir("data/reels").filter(r => bool(r.published, true)).flatMap(r => {
  const videoId = shortId(r.url);
  if (!videoId){ console.warn(`! Reel "${r.title || r.id}" skipped: no YouTube video ID found in its link`); return []; }
  return [{ id: r.id, title: String(r.title || r.id), url: String(r.url), videoId, thumbnail: String(r.thumbnail || ""), displayOrder: orderValue(r.displayOrder) }];
}).sort(byOrder);

categories.forEach(c => delete c._file);
fs.writeFileSync(path.join(root, "data.json"), JSON.stringify({ categories, projects, reels }, null, 2) + "\n");
console.log(`data.json written: ${categories.length} categories, ${projects.length} projects (${projects.filter(p => p.isFeatured).length} featured), ${reels.length} reels`);
