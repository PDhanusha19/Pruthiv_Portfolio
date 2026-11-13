# Portfolio CMS — quick guide

You manage the whole portfolio in **Pages CMS** (app.pagescms.org → this repository). No code needed.

## Menu

| Menu item | What it does |
|---|---|
| **Projects** | The cards on Home and the Projects page: title, short description, category, 16:9 thumbnail, **Featured on homepage**, **Published**, display order, optional video. |
| **Short Reels** | The vertical YouTube Shorts on the Short Reels page. Paste a Shorts link — the video ID and thumbnail are automatic. |
| **Categories** | The filter buttons on the Projects page (All Projects + one per category). |
| **Typography & Design** | Text sizes in pixels (14px / 15px / 16px …), fonts, colors, alignment. |
| **Site content** | Name, intro, bio, photo, email, social links, Short Reels intro line. |
| **Client Reviews** | The review cards on the About page (name, country, rating, comment). Click **+** to add one; the About page average and count update by themselves. |

## Everyday tasks

- **Add a reel** — Short Reels → *Add an entry* → title + Shorts link → Save. It appears on `/projects/short-reels/` by itself.
- **Hide / show a reel** — switch **Published** OFF / ON. **Reorder** — change **Display order** (1 first).
- **Add a project** — Projects → *Add an entry*. Pick its **Category**, add a 16:9 thumbnail, Save.
- **Move a project to another filter** — open it, change **Category**, Save.
- **Feature a project on the Home page** — **Featured on homepage** ON (OFF to remove). Home shows the featured projects in *Display order*.
- **Add / rename a category** — Categories → *Add an entry* (or open one and change the name). It becomes a filter button automatically.
- **Delete a category** — its projects stay on the site under *All Projects*.

## How updates reach the website

Save in the CMS → GitHub rebuilds `data.json` automatically (about 20 seconds) → your host (Netlify / Cloudflare Pages)
redeploys (about a minute). Then hard-refresh the site (Ctrl+Shift+R).

## Files (only if you are curious)

- `data/projects/`, `data/reels/`, `data/categories/` — one small file per item, written by the CMS (the file name is the slug)
- `data.json` — built from those folders by `build-data.js` (don't edit by hand)
- `content.json` — site text and contact links · `settings.json` — design and typography
- `.pages.yml` — the CMS forms · `archive/` — old unused files (safe to delete)
- `projects/short-reels/index.html` — the Short Reels page (address: `/projects/short-reels/`)

## Notes

- **Reels:** the cover is the YouTube thumbnail cropped to 9:16. Upload a thumbnail only if you want a different cover.
- **Preview locally:** double-click `start-site.bat`. If you edit the data folders by hand, run `node build-data.js` first.
