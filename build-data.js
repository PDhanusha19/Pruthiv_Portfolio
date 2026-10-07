#!/usr/bin/env node
/* ============================================================================
   build-data.js — combines the CMS files into ONE file the website reads: data.json

     categories/*.json  +  projects/*.json  +  videos/*.json   →   data.json

   It runs automatically on GitHub every time you save in Pages CMS
   (see .github/workflows/build-data.yml). You can also run it by hand:  node build-data.js

   What it takes care of for you:
   - ids         → taken from the file name when a file has no "id"
   - categories  → references typed/picked in the CMS are matched to real categories
                   (by id, file name or name). If you DELETE a category, projects and videos
                   that used it simply lose that category (they stay on the site under
                   "All Projects" / "All Videos") — nothing breaks.
   - ordering    → "displayOrder" (small numbers first), then title
   - platform    → detected from the video link when "videoPlatform" is empty / Auto-detect
   ============================================================================ */
const fs = require("fs"), path = require("path");
const root = __dirname;

const slug = s => String(s == null ? "" : s).toLowerCase().replace(/\.json$/, "").replace(/^.*[\/]/, "")
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
const bool = v => v === true || String(v).toLowerCase() === "true";
const byOrder = (a, b) => num(a.displayOrder) - num(b.displayOrder) || String(a.title || a.name).localeCompare(String(b.title || b.name));
const list = v => Array.isArray(v) ? v : (v == null || v === "" ? [] : [v]);

const categories = readDir("categories").map(c => ({ id: c.id, name: String(c.name || c.id), createdAt: c.createdAt || "", _file: c._file }))
  .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)) || a.name.localeCompare(b.name));

// A category can be referenced by id, by file name, by path or by name — match them all
const lookup = new Map();
categories.forEach(c => [c.id, c._file, c.name].forEach(k => lookup.set(slug(k), c.id)));
const catIds = refs => [...new Set(list(refs).map(r => lookup.get(slug(typeof r === "object" && r ? (r.id || r.name || r.value) : r))).filter(Boolean))];

const media = o => {
  const url = String(o.videoUrl || "").trim();
  const chosen = String(o.videoPlatform || "");
  return { videoUrl: url, videoPlatform: platformOf(url) || (/^(youtube|instagram|tiktok)$/i.test(chosen) ? chosen : "") };
};
const frames = v => list(v).map(f => typeof f === "object" && f ? (f.image || f.src || "") : f).map(String).filter(Boolean);

const projects = readDir("projects").map(p => ({
  id: p.id, title: String(p.title || p.id), subtitle: String(p.subtitle || ""), description: String(p.description || ""),
  categories: catIds(p.categories), ...media(p), thumbnail: String(p.thumbnail || ""), selectedFrames: frames(p.selectedFrames),
  isFeatured: bool(p.isFeatured), displayOrder: p.displayOrder === "" || p.displayOrder == null ? null : Number(p.displayOrder),
  createdAt: p.createdAt || "", updatedAt: p.updatedAt || ""
})).sort(byOrder);

const videos = readDir("videos").map(v => ({
  id: v.id, title: String(v.title || v.id), description: String(v.description || ""), categories: catIds(v.categories),
  ...media(v), thumbnail: String(v.thumbnail || ""),
  displayOrder: v.displayOrder === "" || v.displayOrder == null ? null : Number(v.displayOrder),
  createdAt: v.createdAt || "", updatedAt: v.updatedAt || ""
})).sort(byOrder);

categories.forEach(c => delete c._file);
fs.writeFileSync(path.join(root, "data.json"), JSON.stringify({ categories, projects, videos }, null, 2) + "\n");
console.log(`data.json written: ${categories.length} categories, ${projects.length} projects (${projects.filter(p => p.isFeatured).length} featured), ${videos.length} videos`);
