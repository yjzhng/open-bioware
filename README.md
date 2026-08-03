# open-bioware

Website for **Open Bioware** — the home page for the open-source desktop
applications we build, plus a directory of other open-source scientific software
worth knowing about.

Live at <https://yjzhng.github.io/open-bioware/>.

---

## Adding your app

Everything on the site is generated from three JSON files in [`data/`](data/).
To publish an application you only ever edit `data/apps.json`, then rebuild.

1. Open [`data/apps.json`](data/apps.json) and add an entry, or edit one of the
   existing ones. Every field is listed below; only a handful are required.
2. Run the generator:
   ```sh
   node build.mjs
   ```
3. Commit both the data change and the regenerated HTML, then push. GitHub Pages
   serves the result from the default branch.

### App fields

| Field | Required | Notes |
| --- | --- | --- |
| `slug` | yes | URL segment. The page is published at `/apps/<slug>/`. |
| `name` | yes | Display name. |
| `tagline` | yes | One sentence. Used on cards, the page header, and search results. |
| `category` | yes | Free text, e.g. `Imaging & Microscopy`. |
| `repo` | yes* | `owner/name`. Required when `download.type` is `github`. |
| `license` | yes | SPDX identifier, e.g. `MIT`, `GPL-3.0`. |
| `platforms` | yes | Array, e.g. `["macOS", "Windows", "Linux"]`. |
| `homepage`, `docs` | no | Extra links in the app's footer. Omit or leave `""` to hide. |
| `language` | no | Named in the app footer ("Built with Python"). |
| `summary` | no | Array of paragraphs for the Overview section. |
| `highlights` | no | Array of `{ title, body }` — rendered as the feature grid. |
| `requirements` | no | See [Requirements](#requirements) — rendered as Specifications rows. |
| `citation` | no | `{ text, url }`. Adds a "How to cite" block with a copy button. |
| `icon` | no | Path to the app's icon in [`assets/img/apps/`](assets/img/apps/); falls back to a monogram tile. |
| `accent` | no | The app's colour: `teal` (default), `indigo`, `violet`, `rose`, `amber`, `emerald`. |
| `tags` | no | Extra keywords matched by the search box, not displayed. |
| `placeholder` | no | `true` makes the build print a reminder. Delete it for real entries. |

\* Required only for the default download type.

### How a collection is laid out

The site is built for a handful of applications, not one:

- **The home page** shows a dock of large app icons, each tinted with that
  app's `accent`. Clicking one reveals its details below, with a link through
  to its own site. Keyboard arrows move between them, and `/#app-<slug>` opens
  a specific app directly. The dock wraps onto more rows as you add apps, so it
  never scrolls sideways.
- **`/apps/`** is the catalogue — every app as a card, with a search box and
  category filter chips (both appear once you have more than three apps).
  Categories come from each app's `category` field; nothing to configure.
- **Each app gets its own microsite** at `/apps/<slug>/`.

### App pages are microsites

Each application's page is styled as its own product site rather than a
subpage. It has:

- its own header, showing the app's name and monogram as the brand, a
  navigation bar of that app's sections, and a download button;
- its own icon, taken from `desktop/build-resources/icon.png` in the app's own
  repository and committed here, shown everywhere the app is named. Icons are
  trimmed to their artwork before being committed — app icons bake in their own
  transparent margin, and those margins differ, so untrimmed ones render at
  visibly different sizes side by side;
- its own accent colour, set by the `accent` field, applied throughout the page
  (and to the app's tile and panel on the home page);
- its own footer, with the app's links and a short "more from Open Bioware"
  list;
- a back link to the parent site sitting just above the app's title.

The section nav underlines whichever section you are reading: a heading becomes
current once it reaches the top 25% of the viewport, so the highlight tracks the
middle of the screen rather than lagging a section behind.

Every app page carries the same three core sections — **Overview**, **Features**
and **Specifications** — plus a **Cite** section when you supply a `citation`. Specifications is built from the entry itself:
category, platforms, licence, language and requirements, plus the live version
and release date pulled from GitHub. You never write those facts twice.

### Requirements

Requirements sit in the right-hand half of Specifications, split into what a
machine must **run** and what it must **have**. Keep the values terse — they are
a scanning aid, not prose:

```jsonc
"requirements": {
  "os": {
    "macOS":   "12 or later · Apple silicon, Intel",
    "Windows": "10 or later · x86-64",
    "Linux":   "Ubuntu 22.04+ · x86-64"
  },
  "hardware": {
    "Memory":   "8 GB (16 GB recommended)",
    "Disk":     "2 GB free",
    "Graphics": "OpenGL 3.3"
  }
}
```

Both groups are optional, and the labels are yours — add `Chipset`, `Camera` or
anything else your app needs. Only `os` and `hardware` are accepted as group
names; the build rejects anything else so a typo cannot silently drop a row.
Below 52rem the two halves stack.

A plain array of strings still works and renders as a single bulleted list.

### Download button

The primary button is driven by the `download` object:

```jsonc
// Points at github.com/<repo>/releases/latest — always the newest release,
// no need to edit anything when you publish a new version.
"download": { "type": "github" }

// Point somewhere else instead (your own site, an institutional mirror).
"download": { "type": "official", "url": "https://example.org/download", "label": "Download" }
```

With `type: "github"` the button becomes a split control: the main half always
goes to `releases/latest`, and the caret opens a menu of the actual per-platform
files from the newest release, fetched from the GitHub API at load time. Assets
are grouped by operating system and labelled with their architecture and size;
checksums, signatures and source archives are filtered out. The visitor's own
operating system is detected and listed first — architecture is never guessed,
because browsers cannot report it reliably.

If the request fails — offline, rate-limited, or no release published yet — the
menu keeps its server-rendered link to the release page, and the release date
line below the buttons is left untouched.

---

## Adding to the directory

[`data/directory.json`](data/directory.json) holds the "Other free software for
academics" page: a short, grouped list of tools built by other people that we
use ourselves.

```jsonc
{
  "category": "Imaging & Microscopy",
  "items": [
    {
      "name": "napari",
      "blurb": "One sentence on what it does.",
      "platforms": ["macOS", "Windows", "Linux"],
      "license": "BSD-3-Clause",
      "site": "https://napari.org",              // project website
      "repo": "napari/napari",                   // owner/name, optional
      "logo": "/assets/img/logos/napari.svg"     // optional, see below
    }
  ]
}
```

Directory entries deliberately **do not** carry download links. Each one links
out to the project's own website and source repository, so visitors always get
the maintainers' current instructions and download their binaries from the
source. At least one of `site` or `repo` must be present.

On the home page these entries are scattered across a field and float in place,
each wandering on its own slow Brownian path. The scatter is generated at build
time from a seeded random sequence with a minimum-separation constraint, so the
arrangement looks random but no two icons can ever collide, even at the extremes
of their drift. Below 64rem they fall back to a wrapped row, which a scatter
cannot survive once compressed. Resting on one for half a second shows a card with its name,
category, blurb, platforms, licence and a link to its website. The whole field
freezes while the pointer is over it or over an open card, so nothing drifts
away from under you.

Inclusion criteria: we use it, it is free to obtain without registration, it is
actively maintained, and it has a graphical interface — desktop or browser. Use
`["Web"]` in `platforms` for browser-based tools.

**Logos.** `logo` points at a file in [`assets/img/logos/`](assets/img/logos/).
Icons are downloaded from each project's own site or repository and committed
here rather than hotlinked, so the site makes no third-party requests. Use an
SVG when the project offers one; otherwise a PNG of at least 128px. Omit the
field and the entry falls back to a monogram tile in the category's colour —
that is the intended behaviour, not a gap to paper over with a blurry favicon.
These logos are the trademarks of their respective projects and are used here
only to identify the software being linked to.

Most entries are open source. Where one is only free-to-use, put that in the
`license` field verbatim (`Free for academic use`, `Free for personal use`,
`MIT source`) — it renders as the badge, so the page states plainly what the
reader is getting instead of implying an open-source licence it does not have.

---

## Navigation

The header nav is driven by `nav` in [`data/site.json`](data/site.json):

```jsonc
{ "label": "Apps",  "href": "/apps/",     "menu": "apps" },
{ "label": "Other", "href": "/software/" },
{ "label": "About", "href": "/about/" }
```

An item with `"menu": "apps"` grows a drop-down of your applications, grouped
by category with a link to the full listing in the bottom right. It is built
from the data, so it stays current on its own. It opens on hover and on
keyboard focus using CSS alone — no JavaScript — and is hidden on touch devices
and narrow screens, where the nav link simply goes to `/apps/` instead.

Adding `"menu": "directory"` to the Other item would give it the same treatment
for the third-party list; it is left off deliberately to keep the nav light.

## Tile and list views

The Apps and Other pages both offer a tile/list switch next to the category
filters. Both layouts come from the *same* markup — `[data-view]` on the results
container selects between them in CSS — so switching never rebuilds the DOM and
never interferes with the search or filters. The choice is remembered in
`localStorage` and applies to both pages.

## Where the content lives

Nothing that a reader sees is written in the template code. Four files in
[`data/`](data/) hold it all:

| File | What it holds |
| --- | --- |
| [`site.json`](data/site.json) | Identity and configuration: name, URL, nav items, and the outbound links — `github` (profile, used by the navbar), `website` (personal site, linked from About) and `siteRepo` (`owner/name` of this repository, used by the footer source link and every "open an issue" link), and `basePath`. Its `tagline` and `description` are the site-wide `<title>` and meta description defaults. |
| [`content.json`](data/content.json) | Every page's prose — starting with the home page headline and intro, then headings, ledes, the whole About page, button labels, empty states, 404 |
| [`apps.json`](data/apps.json) | Your applications |
| [`directory.json`](data/directory.json) | The third-party list |

[`src/render.mjs`](src/render.mjs) contains only structure — HTML, layout and
the small amount of logic that decides which sections appear. To reword
anything, edit `data/`; you should never need to open the template.

The home page headline and intro are `home.heroTitle` and `home.heroLede` at
the top of `content.json`. Leave either blank and it falls back to `tagline`
and `description` from `site.json`.

Content strings may contain tokens that are filled in at build time:
`{site}` (site name), `{count}`, `{total}` and `{app}`. For example
`"searchPlaceholder": "Search {count} applications…"`.

The About page is a list of typed blocks rather than raw HTML, so it stays
editable without touching markup:

```jsonc
{ "type": "h2",    "text": "Why open source" }
{ "type": "p",     "text": "…" }
{ "type": "ticks", "items": [{ "strong": "Our applications.", "text": "…" }] }
{ "type": "steps", "items": ["…", "…"] }
{ "type": "actions", "items": [{ "label": "Open an issue", "href": "issues", "style": "primary", "icon": "github" }] }
```

Add a block type by extending `contentBlocks()` in `src/render.mjs`.

## Base path

GitHub Pages serves a repo at the domain root only when the repo is named
`<owner>.github.io`. This one is `open-bioware` under the owner `yjzhng`, so it is a *project* site
served from a subpath, and `site.json` sets:

```jsonc
"url":      "https://yjzhng.github.io/open-bioware",
"basePath": "/open-bioware"
```

Every internal URL the generator emits is passed through one `u()` helper that
applies this prefix, so there is no way to add a link that forgets it. Set
`basePath` to `""` if the site ever moves to the domain root (its own
`open-bioware` account, or a custom domain) and drop the subpath from `url`;
nothing else needs to change.

## Working on the site

```sh
node build.mjs                 # regenerate the HTML
python3 -m http.server 8099    # preview at http://localhost:8099
```

Requires Node 18 or newer. There are no dependencies to install.

The stylesheet and script are referenced with a content hash
(`site.css?v=11fffab8dc`), recomputed on every build. Change either file and
every page points at a new URL, so returning visitors never get a stale copy;
leave them alone and the hash is unchanged, so the browser keeps its cache.

### Layout

```
data/          site.json, apps.json, directory.json  ← the only files you edit
src/render.mjs HTML templates
build.mjs      generator
assets/        css, js, favicon (hand-written, not generated)

index.html     ┐
apps/          │
software/      ├ generated — do not edit by hand, your changes will be
about/         │ overwritten on the next build
404.html       │
sitemap.xml    ┘
```

The generated HTML is committed so that GitHub Pages can serve it straight from
the branch with no build step and no Actions deployment to configure. A
[workflow](.github/workflows/build.yml) re-runs the generator on every push and
fails if the committed output has drifted from the data.

`.nojekyll` is generated too — it stops GitHub Pages passing the files through
Jekyll, which would otherwise ignore paths beginning with an underscore.

---

## Licence

Site code is MIT. Site content is CC BY 4.0. The applications listed in the
directory are the property of their respective authors and are governed by their
own licences; nothing is rehosted here.
