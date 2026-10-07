/* ==========================================================
   All editable content lives in content.json
   (brand, hero, bio, email, Instagram, showreel, the three styles
   and their videos / frames). Edit that file by hand or through
   Pages CMS — no need to touch this one.
   ========================================================== */
const $ = (s, r=document) => r.querySelector(s), $$ = (s, r=document) => [...r.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const PAGES = [["index.html","Home"],["projects.html","Projects"],["about.html","About"],["contact.html","Contact"]];
const NS = "http://www.w3.org/2000/svg";
const PLAY_PATH = "M8 5v14l11-7z";
const ICONS = {
  instagram:'<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',
  tiktok:'<path d="M21 7.917v4.034a9.948 9.948 0 0 1 -5 -1.951v4.5a6.5 6.5 0 1 1 -8 -6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917z"/>',
  whatsapp:'<path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9"/><path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1"/>',
  email:'<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/>'
};
/* Grey placeholder used if an image file is missing */
const PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="#D4D4D4"/><circle cx="200" cy="190" r="70" fill="#6B6B6B"/><path d="M60 500c0-110 60-170 140-170s140 60 140 170z" fill="#6B6B6B"/></svg>');

function svg(inner, cls){
  const s = document.createElementNS(NS, "svg");
  s.setAttribute("viewBox", "0 0 24 24"); if (cls) s.setAttribute("class", cls);
  s.innerHTML = inner; return s;               // inner is always trusted, hard-coded markup
}
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const playIcon = () => svg(`<path d="${PLAY_PATH}"/>`);

/* Only allow normal web links from content.json (relative image paths are fine) */
function safeUrl(u){
  try { const x = new URL(String(u), location.href); return ["http:","https:","mailto:"].includes(x.protocol) ? x.href : "#"; }
  catch { return "#"; }
}
function safeImg(img, src, fallback = PLACEHOLDER){
  img.onerror = () => { img.onerror = null; img.src = fallback; };
  img.src = safeUrl(src);
}

/* ==========================================================
   DESIGN SETTINGS  (content.json → "design", edited in Pages CMS → Design Settings)
   Every value is checked against the lists below. Anything missing or invalid
   falls back to the ORIGINAL design, so the site can never break.
   ========================================================== */
const DEFAULTS = {
  fonts:{ heading:"Balto", body:"Balto" },
  sizes:{ hero:"Medium", section:"Medium", body:"Medium" },
  colors:{ heading:"#0A0A0A", text:"#0A0A0A", muted:"#6B6B6B" },
  alignment:{ hero:"Center", sections:"Original (as designed)", about:"Left", styles:"Left" }
};
const FONTS = {                     // stack = CSS font-family · gf = Google Fonts query (loaded automatically)
  "Balto":          { stack:'Balto, "Libre Franklin", sans-serif', h:800, h3:700, track:"-.03em" },     // Balto = Adobe Fonts kit (add your kit link in the HTML <head>)
  "Libre Franklin": { stack:'"Libre Franklin", sans-serif',        h:800, h3:700, track:"-.03em" },     // already loaded by every page
  "Inter":          { stack:'"Inter", "Libre Franklin", sans-serif',          gf:"Inter:wght@300;400;500;700;800",   h:800, h3:700, track:"-.03em" },
  "Archivo":        { stack:'"Archivo", "Libre Franklin", sans-serif',        gf:"Archivo:wght@300;400;500;700;800", h:800, h3:700, track:"-.03em" },
  "Bebas Neue":     { stack:'"Bebas Neue", "Libre Franklin", sans-serif',     gf:"Bebas+Neue",                       h:400, h3:400, track:".02em" },   // Bebas only has one weight
  "Space Grotesk":  { stack:'"Space Grotesk", "Libre Franklin", sans-serif',   gf:"Space+Grotesk:wght@300;400;500;700", h:700, h3:700, track:"-.03em" }
};
const SIZES = {                      // [min, preferred (scales with screen width), max] → used in clamp() so mobile stays readable
  hero:    { "Small":["1.8rem","5.5vw","3.6rem"], "Medium":["2.2rem","7vw","5rem"], "Large":["2.6rem","8.5vw","6.4rem"], "Extra Large":["3rem","10vw","8rem"] },
  section: { "Small":["1.4rem","3.2vw","2.3rem"], "Medium":["1.8rem","4vw","3rem"], "Large":["2.2rem","5vw","4rem"] },
  sub:     { "Small":["1.2rem","2.4vw","1.6rem"], "Medium":["1.4rem","3vw","2rem"],  "Large":["1.7rem","3.8vw","2.6rem"] },   // "Selected Frames" style sub-headings follow the section size
  body:    { "Small":.92, "Medium":1, "Large":1.1 }
};
const ALIGN = { "Left":["left","flex-start"], "Center":["center","center"], "Right":["right","flex-end"], "Justify":["justify","flex-start"] };
const ALLOWED = { hero:["Left","Center","Right"], sections:["Left","Center","Right"], about:["Left","Center","Justify"], styles:["Left","Center"] };

function hexColor(v){
  const m = String(v == null ? "" : v).trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const h = m[1].length === 3 ? [...m[1]].map(c => c + c).join("") : m[1];
  return "#" + h.toUpperCase();
}
function pickColor(preset, custom, fallback, label){
  const c = hexColor(custom) || hexColor(preset) || fallback;
  if (c === "#FFFFFF"){ console.warn(`Design: white ${label} would be invisible on the white page — using the original color.`); return fallback; }
  return c;
}
const choose = (key, table, fallback) => Object.prototype.hasOwnProperty.call(table, key) ? key : fallback;

function applyDesign(raw){
  const d = raw && typeof raw === "object" ? raw : {};
  const f = d.fonts || {}, z = d.sizes || {}, c = d.colors || {}, a = d.alignment || {};
  const root = document.documentElement, st = root.style;

  // Fonts (+ load the Google Fonts that were chosen)
  const hf = choose(f.heading, FONTS, DEFAULTS.fonts.heading), bf = choose(f.body, FONTS, DEFAULTS.fonts.body);
  st.setProperty("--heading-font", FONTS[hf].stack); st.setProperty("--body-font", FONTS[bf].stack);
  st.setProperty("--heading-weight", FONTS[hf].h); st.setProperty("--h3-weight", FONTS[hf].h3); st.setProperty("--heading-tracking", FONTS[hf].track);
  const families = [...new Set([hf, bf].map(n => FONTS[n].gf).filter(Boolean))];
  let link = document.getElementById("design-fonts");
  if (families.length){
    if (!link){ link = document.createElement("link"); link.id = "design-fonts"; link.rel = "stylesheet"; document.head.append(link); }
    link.href = "https://fonts.googleapis.com/css2?" + families.map(g => "family=" + g).join("&") + "&display=swap";
  } else if (link) link.remove();

  // Font sizes
  const hs = choose(z.hero, SIZES.hero, DEFAULTS.sizes.hero), ss = choose(z.section, SIZES.section, DEFAULTS.sizes.section), bs = choose(z.body, SIZES.body, DEFAULTS.sizes.body);
  [["hero", SIZES.hero[hs]], ["sec", SIZES.section[ss]], ["sub", SIZES.sub[ss]]].forEach(([k, v]) => {
    st.setProperty(`--${k}-min`, v[0]); st.setProperty(`--${k}-vw`, v[1]); st.setProperty(`--${k}-max`, v[2]);
  });
  st.setProperty("--body-scale", SIZES.body[bs]);

  // Colors (custom hex wins over the preset swatch)
  st.setProperty("--heading-color", pickColor(c.heading, c.headingCustom, DEFAULTS.colors.heading, "heading color"));
  st.setProperty("--text-color",    pickColor(c.text,    c.textCustom,    DEFAULTS.colors.text,    "text color"));
  st.setProperty("--grey",          pickColor(c.muted,   c.mutedCustom,   DEFAULTS.colors.muted,   "secondary text color"));

  // Alignment — on mobile "Center" stays centered, everything else becomes left-aligned
  const al = (key, def) => choose(a[key], Object.fromEntries(ALLOWED[key].map(k => [k, 1])), def);
  const set = (name, key, def, itemsToo) => {
    const k = al(key, def), m = k === "Center" ? "Center" : "Left";
    if (!ALIGN[k]) return;
    st.setProperty(`--${name}-align`, ALIGN[k][0]);   st.setProperty(`--${name}-align-m`, ALIGN[m][0]);
    if (itemsToo){ st.setProperty(`--${name}-${itemsToo}`, ALIGN[k][1]); st.setProperty(`--${name}-${itemsToo}-m`, ALIGN[m][1]); }
  };
  set("hero", "hero", "Center", "items");
  set("about", "about", "Left", "tags");
  set("sec", "sections", "", "items");
  root.classList.toggle("sec-custom", ALLOWED.sections.includes(a.sections));
  const sk = al("styles", "Left");
  st.setProperty("--style-align", ALIGN[sk][0]);
  st.setProperty("--style-ml", sk === "Center" ? "auto" : "0"); st.setProperty("--style-mr", "auto");
}
/* Re-use the last design instantly so there is no flash of the old look between pages */
try { const cached = localStorage.getItem("design"); if (cached) applyDesign(JSON.parse(cached)); } catch (e) {}

/* ---------- Shared layout (navbar, menu, footer, modal, lightbox) — built right away ---------- */
const current = document.body.dataset.page;
const nav_ = (overlay) => PAGES.map(([href,label],i) => {
  const a = el("a", !overlay && href === current ? "active" : "", label); a.href = href;
  if (overlay){ a.style.setProperty("--i", i); return a.outerHTML; }
  const li = el("li","nav-item"); li.style.setProperty("--i", i+1); li.append(a); return li.outerHTML;
}).join("");
document.body.insertAdjacentHTML("afterbegin", `
  <div id="progress"></div>
  <header id="nav">
    <div class="nav-in">
      <div class="nav-item" style="--i:0"><a class="logo" href="index.html" data-bind="brand">DIVNFX</a></div>
      <ul class="menu">${nav_(false)}</ul>
      <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </header>
  <nav id="overlay" aria-label="Mobile">${nav_(true)}</nav>`);
document.body.insertAdjacentHTML("beforeend", `
  <footer>
    <div class="wrap">
      <span>© ${new Date().getFullYear()} <span data-bind="brand">DIVNFX</span>. All rights reserved.</span>
      <div id="footLinks"></div>
    </div>
  </footer>
  <div id="modal" role="dialog" aria-modal="true" aria-label="Video player">
    <div class="box"><button class="close" id="mClose" aria-label="Close video">&times;</button><div class="frame" id="mFrame"></div><p id="mTitle"></p></div>
  </div>
  <div id="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer">
    <button class="close" id="lbClose" aria-label="Close image">&times;</button><img alt="">
  </div>`);

/* ---------- Video helpers (YouTube, Instagram, TikTok) ---------- */
function parseVideo(p){
  const url = String(p.url || "");
  const yt = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { ...p, platform:"youtube", embed:`https://www.youtube.com/embed/${yt[1]}`,
    thumb: p.thumb || `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`, vertical: p.vertical ?? /\/shorts\//.test(url) };
  const ig = url.match(/instagram\.com\/(?:[\w.]+\/)?(reels?|p|tv)\/([\w-]+)/);
  if (ig) return { ...p, platform:"instagram", embed:`https://www.instagram.com/${ig[1]==="p"?"p":"reel"}/${ig[2]}/embed`,
    thumb: p.thumb || "", vertical: p.vertical ?? true };
  /* TikTok: paste the full link (tiktok.com/@name/video/123…). Short vm.tiktok.com links can't be converted. */
  const tt = url.match(/tiktok\.com\/(?:@[\w.-]+\/video|embed\/v2|player\/v1)\/(\d+)/);
  if (tt) return { ...p, platform:"tiktok", embed:`https://www.tiktok.com/player/v1/${tt[1]}`,
    thumb: p.thumb || "", vertical: true };
  return null;
}
const embedSrc = v => v.platform === "instagram" ? v.embed : v.embed + "?autoplay=1" + (v.platform === "youtube" ? "&rel=0" : "");
function makeIframe(src, title, lazy){
  const f = document.createElement("iframe");
  f.src = src; f.title = title; f.allowFullscreen = true;
  if (lazy) f.loading = "lazy";
  f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
  return f;
}
/* Plays in place. YouTube shows a poster first (loads only on click); Instagram/TikTok embed lazily. */
function mountPlayer(frame, v, title){
  frame.classList.toggle("v", !!v.vertical);
  if (v.platform === "youtube"){
    const btn = el("button"); btn.setAttribute("aria-label", "Play " + title);
    const img = document.createElement("img"); img.alt = ""; img.loading = "lazy"; img.src = v.thumb;
    const pb = el("span","playbtn"), i = el("i"); i.append(playIcon()); pb.append(i);
    btn.append(img, pb); frame.replaceChildren(btn);
    btn.addEventListener("click", () => frame.replaceChildren(makeIframe(embedSrc(v), title)));
  } else frame.replaceChildren(makeIframe(v.embed, title, true));
}

/* Popup player — video plays inside the site; removing the iframe stops it */
const modal = $("#modal"), mFrame = $("#mFrame"); let lastFocus;
function openModal(p, from){
  lastFocus = from;
  mFrame.className = "frame" + (p.vertical ? " v" : "");
  mFrame.replaceChildren(makeIframe(embedSrc(p), p.title || "Video"));
  $("#mTitle").textContent = p.title || "";
  modal.classList.add("open"); document.documentElement.classList.add("lock"); $("#mClose").focus();
}
function closeModal(){
  if (!modal.classList.contains("open")) return;
  modal.classList.remove("open"); mFrame.replaceChildren();
  document.documentElement.classList.remove("lock"); lastFocus && lastFocus.focus();
}
$("#mClose").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

/* Image lightbox (Selected Frames) */
const lb = $("#lightbox");
function openLightbox(src, alt, from){
  lastFocus = from; const i = $("img", lb); i.alt = alt || ""; safeImg(i, src);
  lb.classList.add("open"); document.documentElement.classList.add("lock"); $("#lbClose").focus();
}
function closeLightbox(){
  if (!lb.classList.contains("open")) return;
  lb.classList.remove("open"); document.documentElement.classList.remove("lock"); lastFocus && lastFocus.focus();
}
$("#lbClose").addEventListener("click", closeLightbox);
lb.addEventListener("click", e => { if (e.target === lb) closeLightbox(); });

/* ---------- Cards ---------- */
function cardEl(tag, title, sub, thumb){
  const c = el(tag, "card");
  const th = el("div","thumb");
  if (thumb){ const i = document.createElement("img"); i.loading = "lazy"; i.alt = ""; i.src = thumb; th.append(i); }
  th.append(svg(`<path d="${PLAY_PATH}"/>`));
  const meta = el("div","meta"); meta.append(el("h3","",title), el("p","",sub || ""));
  c.append(th, meta); return c;
}
let styles = [], items = [];
function renderGrid(filter="all"){
  const grid = $("#grid"); if (!grid) return;
  grid.replaceChildren();
  if (grid.dataset.mode === "styles"){                       // Home: three style cards → their own pages
    styles.forEach(s => {
      const v = parseVideo({ url: s.mainVideo });
      const c = cardEl("a", s.title, s.subtitle, s.thumb ? safeUrl(s.thumb) : (v && v.thumb));
      c.href = s.page; grid.append(c);
    });
    return;
  }
  const list = items.filter(p => filter === "all" || p.platform === filter);   // Projects / style pages: popup cards
  if (!list.length){ grid.append(el("p","lead","No videos to show here yet.")); return; }
  list.forEach(p => {
    const c = cardEl("button", p.title, p.description, p.thumb ? (p.platform === "youtube" ? p.thumb : safeUrl(p.thumb)) : "");
    c.addEventListener("click", () => openModal(p, c));
    grid.append(c);
  });
}

/* ---------- Build the page from content.json ---------- */
function build(C){
  styles = C.styles || [];
  const slug = document.body.dataset.style;
  const style = slug ? styles.find(s => s.slug === slug) : null;
  if (slug && !style) throw new Error("Style not found in content.json: " + slug);

  applyDesign(C.design);
  try { localStorage.setItem("design", JSON.stringify(C.design || {})); } catch (e) {}

  document.title = (style ? style.title : document.body.dataset.title) ? `${style ? style.title : document.body.dataset.title} — ${C.brand}` : `${C.brand} — Video Editor`;
  $$("[data-bind]").forEach(e => { const v = C[e.dataset.bind]; if (v != null) e.textContent = v; });

  // About
  const photo = $("[data-photo]"); if (photo && C.photo) safeImg(photo, C.photo);
  const sk = $("[data-skills]"); if (sk) (C.skills || []).forEach(s => sk.append(el("li","",s)));

  // Contact + footer: icons only (no text names)
  const contactIcons = [];
  if (C.email) contactIcons.push(["Email", "mailto:" + C.email, ICONS.email]);
  if (C.instagram) contactIcons.push(["Instagram", C.instagram, ICONS.instagram]);
  if (C.tiktok) contactIcons.push(["TikTok", C.tiktok, ICONS.tiktok]);
  if (C.whatsapp){   // accepts a phone number (+94771234567) or a full wa.me link
    const w = String(C.whatsapp).trim();
    contactIcons.push(["WhatsApp", /^https?:/i.test(w) ? w : "https://wa.me/" + w.replace(/\D/g, ""), ICONS.whatsapp]);
  }
  [$("[data-socials]"), $("#footLinks")].forEach(box => {
    if (!box) return;
    contactIcons.forEach(([label, href, ic]) => {
      const a = el("a"); a.href = safeUrl(href); a.setAttribute("aria-label", label); a.title = label;
      if (!href.startsWith("mailto:")){ a.target = "_blank"; a.rel = "noopener"; }
      a.append(svg(ic, "ico")); box.append(a);
    });
  });

  // Videos: a style page uses its own list; Projects page shows every style's list
  const all = (style ? [style] : styles).flatMap(s => s.work || []);
  items = all.map(parseVideo).filter(Boolean);
  renderGrid();
  const filters = $("#filters");
  filters && filters.addEventListener("click", e => {
    const btn = e.target.closest("button"); if (!btn) return;
    $$(".f", filters).forEach(x => x.classList.toggle("on", x === btn));
    renderGrid(btn.dataset.f);
  });

  // Style detail page
  if (style){
    $("[data-style-title]").textContent = style.title;
    $("[data-style-desc]").textContent = style.description || "";
    const fv = parseVideo({ url: style.mainVideo });
    if (fv) mountPlayer($("#feature"), fv, style.title); else $("#featureWrap").hidden = true;
    const fg = $("#frames");
    (style.frames || []).forEach(f => {
      const b = el("button","frame-btn"); b.setAttribute("aria-label", "Enlarge " + (f.alt || "frame"));
      const i = document.createElement("img"); i.loading = "lazy"; i.alt = f.alt || ""; safeImg(i, f.image, ""); b.append(i);
      b.addEventListener("click", () => openLightbox(f.image, f.alt, b));
      fg.append(b);
    });
    if (!(style.frames || []).length) $("#framesWrap").hidden = true;
  }

  // Showreel (home)
  const reelFrame = $("#reelFrame");
  if (reelFrame){
    const reel = parseVideo({ url: C.showreel });
    if (reel && reel.platform === "youtube") mountPlayer(reelFrame, reel, "Showreel"); else $("#reelBand").hidden = true;
  }

  // Contact form -> opens the visitor's email app
  const form = $("#form");
  form && form.addEventListener("submit", e => {
    e.preventDefault(); const d = new FormData(form);
    location.href = `mailto:${C.email}?subject=${encodeURIComponent("Project enquiry from " + d.get("name"))}&body=${encodeURIComponent(d.get("message") + "\n\n— " + d.get("name") + " (" + d.get("email") + ")")}`;
  });
}

/* ---------- Load content.json with loading + error states ---------- */
const status = $("#status"), content = $("#content");
async function load(){
  status.hidden = false; content.hidden = true;
  status.replaceChildren(el("span","spinner"), el("span","","Loading…"));
  try {
    const r = await fetch("content.json", { cache: "no-store" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    build(await r.json());
    status.hidden = true; content.hidden = false;
  } catch (err) {
    console.error("Could not build the page from content.json:", err);
    const msg = el("p","", location.protocol === "file:"
      ? "This page can't read its content when opened straight from a file. Run it from a web server (or the hosted site) and it will load."
      : "Sorry, we couldn't load the content just now. Please check your connection and try again.");
    const retry = el("button","btn","Try again"); retry.addEventListener("click", () => location.reload());
    status.replaceChildren(el("strong","","Something went wrong"), msg, retry);
  }
}

/* ---------- Navbar behaviour ---------- */
const nav = $("#nav"), burger = $("#burger"), overlay = $("#overlay");
function setMenu(o){
  burger.classList.toggle("open", o); overlay.classList.toggle("open", o);
  burger.setAttribute("aria-expanded", o); burger.setAttribute("aria-label", o ? "Close menu" : "Open menu");
  document.documentElement.classList.toggle("lock", o);
}
burger.addEventListener("click", () => setMenu(!overlay.classList.contains("open")));
addEventListener("keydown", e => { if (e.key === "Escape"){ closeModal(); closeLightbox(); setMenu(false); } });
addEventListener("resize", () => { if (innerWidth > 800) setMenu(false); });

/* Page transition: fade out, then go to the next page (delegated so dynamic cards work too) */
document.addEventListener("click", e => {
  const a = e.target.closest('a[href$=".html"]');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
  const href = a.getAttribute("href");
  e.preventDefault(); setMenu(false);
  if (href === current){ scrollTo({ top:0, behavior: reduce ? "auto" : "smooth" }); return; }
  document.body.classList.add("leaving");
  setTimeout(() => location.href = href, reduce ? 0 : 250);
});
addEventListener("pageshow", () => document.body.classList.remove("leaving"));

let tick = false;
function onScroll(){
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  $("#progress").style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  nav.classList.toggle("scrolled", y > 60);
  tick = false;
}
addEventListener("scroll", () => { if (!tick){ tick = true; requestAnimationFrame(onScroll); } }, { passive:true });
onScroll();

load();
