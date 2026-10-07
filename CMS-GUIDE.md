# Portfolio CMS — quick guide

You manage the whole portfolio in **Pages CMS** (app.pagescms.org → this repository). No code needed.

## Menu

| Menu item | What it does |
|---|---|
| **Projects** | Add / edit / delete projects. Title, description, categories, video link, thumbnail, selected frames, **Featured** switch, display order. |
| **Videos** | Extra videos that appear on the Projects page and play in a popup. |
| **Categories** | Add / rename / delete categories (they become buttons on the Projects page). |
| **Typography & Design** | Text sizes in pixels (14px / 15px / 16px …), fonts, colors, alignment. |
| **Site content** | Name, intro, bio, photo, email, social links, showreel. |

## Everyday tasks

- **Add a project** — Projects → *Add an entry*. Fill in the title, paste the YouTube/Instagram/TikTok link, pick categories, add frames, *Save*.
- **Put a project on the Home page** — open it, switch **Featured project** ON, Save. Switch it OFF to remove it from the Home page.
- **Change the order** — set **Display order** (1 comes first). Frames can be dragged to reorder.
- **Add a category** — Categories → *Add an entry*, type the name, Save. Then tick it inside projects/videos.
- **Delete a category** — Categories → open it → Delete. Projects/videos that used it stay on the site, just without that category.
- **Change text sizes** — Typography & Design → Typography. Pick *Original* to go back to the built-in size.

## How updates reach the website

Save in the CMS → GitHub rebuilds `data.json` automatically (about 20 seconds) → your host (Netlify / Cloudflare Pages)
redeploys (about a minute). Then hard-refresh the site (Ctrl+Shift+R).

## Files (only if you are curious)

- `projects/`, `videos/`, `categories/` — one small file per item, written by the CMS
- `data.json` — built from those folders by `build-data.js` (don't edit by hand)
- `content.json` — site text and contact links
- `settings.json` — design and typography
- `.pages.yml` — the CMS forms

## Notes

- **Thumbnails:** YouTube thumbnails are automatic. Instagram and TikTok need a thumbnail image.
- **TikTok links:** paste the full link (`tiktok.com/@name/video/123…`). Short `vm.tiktok.com` links can't be played.
- **Ids:** each item's id comes from its file name; the categories, platform and order are handled automatically.
- **Preview locally:** double-click `start-site.bat`. If you edit the folders by hand, run `node build-data.js` first.
