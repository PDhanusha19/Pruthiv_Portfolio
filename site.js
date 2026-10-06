/* ==========================================================
   All editable content now lives in content.json
   (name, intro, bio, skills, email, socials, showreel, projects).
   Edit that file by hand or through Pages CMS — no need to touch this one.
   ========================================================== */
const $ = (s, r=document) => r.querySelector(s), $$ = (s, r=document) => [...r.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const PAGES = [["index.html","Home"],["projects.html","Projects"],["about.html","About"],["contact.html","Contact"]];
const NS = "http://www.w3.org/2000/svg";
const PLAY_PATH = "M8 5v14l11-7z";
const ICONS = {
  instagram:'<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',
  youtube:'<path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>',
  x:'<path d="M4 4l16 16M20 4L4 20"/>',
  linkedin:'<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'
};
function svg(inner, cls, viewBox="0 0 24 24"){
  const s = document.createElementNS(NS, "svg");
  s.setAttribute("viewBox", viewBox); if (cls) s.setAttribute("class", cls);
  s.innerHTML = inner; return s;               // inner is always trusted, hard-coded markup
}
const playIcon = () => svg(`<path d="${PLAY_PATH}"/>`);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

/* Only allow normal web links from content.json */
function safeUrl(u){
  try { const x = new URL(String(u), location.href); return ["http:","https:","mailto:"].includes(x.protocol) ? x.href : "#"; }
  catch { return "#"; }
}

/* ---------- Shared layout (navbar, menu, footer, modal) — built right away ---------- */
const current = document.body.dataset.page;
const nav_ = (overlay) => PAGES.map(([href,label],i) => {
  const a = el("a", !overlay && href === current ? "active" : "", label); a.href = href;
  if (overlay){ a.style.setProperty("--i", i); return a.outerHTML; }
  a.dataset.nav = ""; const li = el("li","nav-item"); li.style.setProperty("--i", i+1); li.append(a); return li.outerHTML;
}).join("");
document.body.insertAdjacentHTML("afterbegin", `
  <div id="progress"></div>
  <header id="nav">
    <div class="nav-item" style="--i:0"><a class="logo" href="index.html" data-bind="name"></a></div>
    <ul class="menu">${nav_(false)}</ul>
    <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </header>
  <nav id="overlay" aria-label="Mobile">${nav_(true)}</nav>`);
document.body.insertAdjacentHTML("beforeend", `
  <footer>
    <span>© ${new Date().getFullYear()} <span data-bind="name"></span>. All rights reserved.</span>
    <div id="footLinks"><a href="contact.html">Contact</a></div>
  </footer>
  <div id="modal" role="dialog" aria-modal="true" aria-label="Video player">
    <div class="box"><button class="close" id="mClose" aria-label="Close video">&times;</button><div class="frame" id="mFrame"></div><p id="mTitle"></p></div>
  </div>`);

/* ---------- Video helpers ---------- */
function parseVideo(p){
  const url = String(p.url || "");
  const yt = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { ...p, platform:"youtube", embed:`https://www.youtube.com/embed/${yt[1]}`,
    thumb: p.thumb || `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`, vertical: p.vertical ?? /\/shorts\//.test(url) };
  const ig = url.match(/instagram\.com\/(?:[\w.]+\/)?(reels?|p|tv)\/([\w-]+)/);
  if (ig) return { ...p, platform:"instagram", embed:`https://www.instagram.com/${ig[1]==="p"?"p":"reel"}/${ig[2]}/embed`,
    thumb: p.thumb || "", vertical: p.vertical ?? true };
  return null;
}
function makeIframe(src, title){
  const f = document.createElement("iframe");
  f.src = src; f.title = title; f.allowFullscreen = true;
  f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
  return f;
}

/* Modal — video plays inside the site; removing the iframe stops it */
const modal = $("#modal"), mFrame = $("#mFrame"); let lastFocus;
function openModal(p, from){
  lastFocus = from;
  mFrame.className = "frame" + (p.vertical ? " v" : "");
  mFrame.replaceChildren(makeIframe(p.platform === "youtube" ? p.embed + "?autoplay=1&rel=0" : p.embed, p.title || "Video"));
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

/* ---------- Build the page from content.json ---------- */
let items = [];
function renderGrid(filter="all"){
  const grid = $("#grid"); if (!grid) return;
  const featuredOnly = grid.dataset.featured !== undefined;
  grid.replaceChildren();
  const list = items.filter(p => (!featuredOnly || p.featured) && (filter === "all" || p.platform === filter));
  if (!list.length){ grid.append(el("p","lead","No projects to show yet.")); return; }
  list.forEach(p => {
    const b = el("button","card");
    const th = el("div","thumb");
    if (p.thumb){ const i = document.createElement("img"); i.loading = "lazy"; i.alt = ""; i.src = p.platform === "youtube" ? p.thumb : safeUrl(p.thumb); th.append(i); }
    th.append(svg(`<path d="${PLAY_PATH}"/>`));
    const meta = el("div","meta");
    meta.append(el("h3","",p.title), el("p","",p.description || ""));
    b.append(th, meta);
    b.addEventListener("click", () => openModal(p, b));
    grid.append(b);
  });
}

function build(C){
  document.title = (document.body.dataset.title ? document.body.dataset.title + " — " : "") + (C.name || "Portfolio");

  // Simple text bindings: <… data-bind="name|intro|bio|email">
  $$("[data-bind]").forEach(e => { const v = C[e.dataset.bind]; if (v != null) e.textContent = v; });
  $$("[data-mail]").forEach(e => { e.textContent = C.email || ""; e.href = "mailto:" + (C.email || ""); });

  // Photo (optional)
  const photo = $("[data-photo]"); if (photo && C.photo) photo.src = safeUrl(C.photo);

  // Skills
  const sk = $("[data-skills]"); if (sk) (C.skills || []).forEach(s => sk.append(el("li","",s)));

  // Social icons (contact page) + footer links
  const socials = (C.socials || []).filter(s => s && s.url);
  const so = $("[data-socials]");
  if (so) socials.forEach(s => {
    const a = el("a"); a.href = safeUrl(s.url); a.target = "_blank"; a.rel = "noopener"; a.setAttribute("aria-label", s.platform);
    a.append(svg(ICONS[String(s.platform).toLowerCase()] || ICONS.link, "ico")); so.append(a);
  });
  socials.forEach(s => { const a = el("a","",s.platform); a.href = safeUrl(s.url); a.target = "_blank"; a.rel = "noopener"; $("#footLinks").append(a); });

  // Projects
  items = (C.projects || []).map(parseVideo).filter(Boolean);
  renderGrid();
  const filters = $("#filters");
  filters && filters.addEventListener("click", e => {
    const btn = e.target.closest("button"); if (!btn) return;
    $$(".f", filters).forEach(x => x.classList.toggle("on", x === btn));
    renderGrid(btn.dataset.f);
  });

  // Showreel — loads the video only when clicked
  const reelFrame = $("#reelFrame"), reel = parseVideo({ url: C.showreel });
  if (reelFrame){
    if (!reel || reel.platform !== "youtube") $("#reelBand").hidden = true;
    else {
      const btn = el("button"); btn.setAttribute("aria-label","Play showreel");
      const img = document.createElement("img"); img.alt = ""; img.loading = "lazy"; img.src = reel.thumb;
      const pb = el("span","playbtn"), i = el("i"); i.append(playIcon()); pb.append(i);
      btn.append(img, pb); reelFrame.append(btn);
      btn.addEventListener("click", () => reelFrame.replaceChildren(makeIframe(reel.embed + "?autoplay=1&rel=0", "Showreel")));
    }
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
    console.error("content.json failed to load:", err);
    const msg = el("p","", location.protocol === "file:"
      ? "This page can't read its content when opened straight from a file. Run it from a web server (or the hosted site) and it will load."
      : "Sorry, we couldn't load the content just now. Please check your connection and try again.");
    const retry = el("button","btn","Try again"); retry.addEventListener("click", load);
    status.replaceChildren(el("strong","","Something went wrong"), msg, retry);
  }
}

/* ---------- Navbar behaviour ---------- */
const nav = $("#nav"), burger = $("#burger"), overlay = $("#overlay");
function setMenu(o){
  burger.classList.toggle("open", o); overlay.classList.toggle("open", o);
  burger.setAttribute("aria-expanded", o); burger.setAttribute("aria-label", o ? "Close menu" : "Open menu");
  document.documentElement.classList.toggle("lock", o);
  if (o) nav.classList.remove("hidden");
}
burger.addEventListener("click", () => setMenu(!overlay.classList.contains("open")));
addEventListener("keydown", e => { if (e.key === "Escape"){ closeModal(); setMenu(false); } });
addEventListener("resize", () => { if (innerWidth > 800) setMenu(false); });

/* Page transition: fade out, then go to the next page */
$$('a[href$=".html"]').forEach(a => a.addEventListener("click", e => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
  const href = a.getAttribute("href");
  e.preventDefault(); setMenu(false);
  if (href === current){ scrollTo({ top:0, behavior: reduce ? "auto" : "smooth" }); return; }
  document.body.classList.add("leaving");
  setTimeout(() => location.href = href, reduce ? 0 : 250);
}));
addEventListener("pageshow", () => document.body.classList.remove("leaving"));

let lastY = scrollY, tick = false;
function onScroll(){
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  $("#progress").style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  nav.classList.toggle("scrolled", y > 60);
  if (!overlay.classList.contains("open")){
    if (y > lastY && y > 120) nav.classList.add("hidden"); else if (y < lastY) nav.classList.remove("hidden");
  }
  lastY = y; tick = false;
}
addEventListener("scroll", () => { if (!tick){ tick = true; requestAnimationFrame(onScroll); } }, { passive:true });
onScroll();

load();
