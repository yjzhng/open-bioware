/**
 * Open Bioware — HTML templates.
 *
 * Two kinds of page are produced:
 *   • Site pages (home, app catalogue, directory, about) share the parent
 *     chrome built by shell().
 *   • App pages are microsites: appShell() gives each one its own header,
 *     navigation, accent colour and footer, so it reads as the application's
 *     own site rather than a subpage.
 */

/* --- helpers ------------------------------------------------------------ */

export const esc = (v = "") =>
  String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const attr = (v) => esc(v);

/**
 * Base path the site is served from. GitHub Pages serves a repo whose name does
 * not match its owner from a subpath, so every internal URL must carry it.
 * Empty string when the site sits at the domain root.
 */
let BASE = "";
export const setBasePath = (base) => { BASE = (base || "").replace(/\/$/, ""); };

/** Prefix a root-relative path with the base path; leaves other URLs alone. */
const u = (path = "") => (path.startsWith("/") ? BASE + path : path);

/** Fill {tokens} in a content string: t("Search {count}", {count: 11}). */
const t = (str = "", vars = {}) =>
  String(str).replace(/\{(\w+)\}/g, (m, key) => (key in vars ? String(vars[key]) : m));
const join = (arr, sep = "") => arr.filter(Boolean).join(sep);

/** Initials for the monogram tile: "Example Viewer" -> "EV", "napari" -> "na" */
export const monogram = (name) => {
  const words = String(name).replace(/[^\p{L}\p{N} ]/gu, " ").trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return String(name).slice(0, 2);
};

export const slugify = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Accent hues an app may claim; see the palette blocks in site.css. */
export const ACCENTS = ["teal", "indigo", "violet", "rose", "amber", "emerald"];
const accentOf = (app) => (ACCENTS.includes(app.accent) ? app.accent : "teal");

/** Directory entries carry no accent of their own, so colour them by category. */
export const categoryAccent = (index) => ACCENTS[index % ACCENTS.length];

/* --- icons (inline, stroke) --------------------------------------------- */

const svg = (path, size = 16, extra = "") =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${path}</svg>`;

export const icons = {
  download: (s) => svg(`<path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5"/><path d="M3 16.5v1.5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-1.5"/>`, s),
  github: (s = 16) =>
    `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor" aria-hidden="true"><path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.47c.53.1.72-.23.72-.5v-1.9c-2.92.63-3.54-1.25-3.54-1.25-.48-1.22-1.17-1.54-1.17-1.54-.96-.65.07-.64.07-.64 1.06.08 1.61 1.09 1.61 1.09.94 1.6 2.47 1.14 3.07.87.1-.68.37-1.14.67-1.4-2.33-.27-4.78-1.17-4.78-5.19 0-1.15.41-2.08 1.09-2.82-.11-.27-.47-1.34.1-2.79 0 0 .88-.28 2.89 1.08a10 10 0 0 1 5.26 0c2-1.36 2.89-1.08 2.89-1.08.57 1.45.21 2.52.1 2.79.68.74 1.09 1.67 1.09 2.82 0 4.03-2.46 4.91-4.8 5.17.38.33.71.97.71 1.96v2.9c0 .28.19.61.73.51A10.5 10.5 0 0 0 12 1.5Z"/></svg>`,
  external: (s) => svg(`<path d="M13.5 5.25h5.25V10.5"/><path d="m18.75 5.25-7.5 7.5"/><path d="M18 14.25v3.75a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18V8.25A2.25 2.25 0 0 1 6 6h3.75"/>`, s),
  arrow: (s) => svg(`<path d="M4.5 12h15m0 0-5.25-5.25M19.5 12l-5.25 5.25"/>`, s, ' class="arrow"'),
  arrowLeft: (s = 14) => svg(`<path d="M19.5 12h-15m0 0 5.25-5.25M4.5 12l5.25 5.25"/>`, s),
  caret: (s = 11) => svg(`<path d="m6 9 6 6 6-6"/>`, s, ' class="caret"'),
  grid: (s = 15) => svg(`<rect x="3.75" y="3.75" width="6.75" height="6.75" rx="1.5"/><rect x="13.5" y="3.75" width="6.75" height="6.75" rx="1.5"/><rect x="3.75" y="13.5" width="6.75" height="6.75" rx="1.5"/><rect x="13.5" y="13.5" width="6.75" height="6.75" rx="1.5"/>`, s),
  list: (s = 15) => svg(`<path d="M8.25 6h12M8.25 12h12M8.25 18h12"/><path d="M3.75 6h.008M3.75 12h.008M3.75 18h.008"/>`, s),
  check: (s = 16) => svg(`<path d="m4.5 12.75 5.25 5.25L19.5 6.75"/>`, s, ' class="check"'),
  search: (s = 16) => svg(`<circle cx="10.5" cy="10.5" r="6.75"/><path d="m20.25 20.25-4.9-4.9"/>`, s),
  book: (s) => svg(`<path d="M3.75 5.25A1.5 1.5 0 0 1 5.25 3.75H10.5A2.25 2.25 0 0 1 12.75 6v14.25a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 1-1.5-1.5Z"/><path d="M20.25 5.25a1.5 1.5 0 0 0-1.5-1.5H13.5A2.25 2.25 0 0 0 11.25 6v14.25a1.5 1.5 0 0 1 1.5-1.5h6a1.5 1.5 0 0 0 1.5-1.5Z"/>`, s),
  globe: (s) => svg(`<circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/>`, s),
  info: (s = 18) => svg(`<circle cx="12" cy="12" r="9"/><path d="M12 16.5v-5.25M12 8.25h.008"/>`, s),
  copy: (s = 14) => svg(`<rect x="9" y="9" width="11.25" height="11.25" rx="1.5"/><path d="M6.75 15H5.25A1.5 1.5 0 0 1 3.75 13.5V5.25A1.5 1.5 0 0 1 5.25 3.75h8.25A1.5 1.5 0 0 1 15 5.25v1.5"/>`, s),
  tag: (s) => svg(`<path d="M3.75 8.25v-3a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.06.44l9 9a1.5 1.5 0 0 1 0 2.12l-4.5 4.5a1.5 1.5 0 0 1-2.12 0l-9-9a1.5 1.5 0 0 1-.44-1.06Z"/><path d="M7.5 7.5h.008"/>`, s),
  sun: (s = 17) => svg(`<circle cx="12" cy="12" r="4"/><path d="M12 2.25v1.5M12 20.25v1.5M4.22 4.22l1.06 1.06M18.72 18.72l1.06 1.06M2.25 12h1.5M20.25 12h1.5M4.22 19.78l1.06-1.06M18.72 5.28l1.06-1.06"/>`, s, ' class="icon-sun"'),
  moon: (s = 17) => svg(`<path d="M20.25 14.4A8.25 8.25 0 0 1 9.6 3.75a8.25 8.25 0 1 0 10.65 10.65Z"/>`, s, ' class="icon-moon"'),
  logo: (s = 22) =>
    `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true" class="brand__mark"><path d="M7 3c0 4.5 10 5.5 10 9s-10 4.5-10 9"/><path d="M17 3c0 4.5-10 5.5-10 9s10 4.5 10 9"/><path d="M8.5 7.5h7M8.5 16.5h7"/></svg>`,
};

/* --- document head ------------------------------------------------------ */

const head = (site, page) => {
  const title = page.title ? `${page.title} — ${site.name}` : `${site.name} — ${site.tagline}`;
  const desc = page.description || site.description;
  const canonical = site.url + (page.path || "/");
  return join([
    `<meta charset="utf-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    `<title>${esc(page.documentTitle || title)}</title>`,
    `<meta name="description" content="${attr(desc)}">`,
    `<link rel="canonical" href="${attr(canonical)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${attr(page.ogSite || site.name)}">`,
    `<meta property="og:title" content="${attr(page.documentTitle || title)}">`,
    `<meta property="og:description" content="${attr(desc)}">`,
    `<meta property="og:url" content="${attr(canonical)}">`,
    // A large-image card requires an actual image; without one the tag is a lie.
    `<meta property="og:image" content="${attr(site.url)}/assets/img/og.png">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">`,
    `<meta name="theme-color" content="#0b0f12" media="(prefers-color-scheme: dark)">`,
    `<link rel="icon" href="${u("/assets/img/favicon.svg")}" type="image/svg+xml">`,
    `<link rel="stylesheet" href="${u("/assets/css/site.css")}${site.assets ? `?v=${site.assets.css}` : ""}">`,
    // Apply a stored theme before first paint so it never flashes.
    `<script>(function(){try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()</script>`,
    page.jsonLd ? `<script type="application/ld+json">${JSON.stringify(page.jsonLd)}</script>` : "",
  ], "\n  ");
};

const themeToggle = () =>
  `<button class="icon-btn theme-toggle" type="button" data-theme-toggle aria-label="Switch colour theme">${icons.sun()}${icons.moon()}</button>`;

/* --- parent-site chrome ------------------------------------------------- */

/**
 * Drop-down contents for a nav item. Revealed on hover and on keyboard focus
 * purely through CSS, so the menus work with JavaScript disabled.
 */
const navMenu = (kind, apps, directory) => {
  const isApps = kind === "apps";

  const groups = isApps
    ? groupByCategory(apps).map((g) => ({ category: g.category, items: g.items }))
    : (directory || []).map((g) => ({ category: g.category, items: g.items }));

  if (!groups.length) return "";

  const entry = (item, groupIndex) =>
    isApps
      ? `<li><a href="${u(`/apps/${attr(item.slug)}/`)}">${appTile(item, "tile--xs")}${esc(item.name)}</a></li>`
      : `<li><a href="${attr(item.site || `https://github.com/${item.repo}`)}" rel="noopener nofollow">${brandTile(item, { accent: categoryAccent(groupIndex), extraClass: "tile--xs" })}${esc(item.name)}</a></li>`;

  const foot = isApps
    ? `<a href="${u("/apps/")}">All ${apps.length} application${apps.length === 1 ? "" : "s"} ${icons.arrow(14)}</a>`
    : `<a href="${u("/software/")}">Full directory ${icons.arrow(14)}</a>`;

  return `
        <div class="mega ${isApps ? "mega--apps" : "mega--directory"}">
          <div class="mega__inner">
            ${groups
              .map(
                (g, gi) => `<div class="mega__group">
              <p class="mega__heading">${
                isApps
                  ? esc(g.category)
                  : `<a href="${u(`/software/#${attr(slugify(g.category))}`)}">${esc(g.category)}</a>`
              }</p>
              <ul>
                ${g.items.map((it) => entry(it, gi)).join("\n                ")}
              </ul>
            </div>`
              )
              .join("\n            ")}
          </div>
          <div class="mega__foot">${foot}</div>
        </div>`;
};

const siteHeader = (site, current, apps, directory) => `
<header class="site-header">
  <div class="wrap site-header__inner">
    <nav class="site-nav" aria-label="Primary">
      <ul class="nav-list">
        ${site.nav
          .map((n) => {
            const menu = n.menu ? navMenu(n.menu, apps, directory) : "";
            return `<li class="${menu ? "has-menu" : ""}">
          <a href="${attr(u(n.href))}"${current && n.href === current ? ' aria-current="page"' : ""}>${esc(n.label)}${menu ? icons.caret() : ""}</a>${menu}
        </li>`;
          })
          .join("\n        ")}
      </ul>
    </nav>
    <div class="header-actions">
      <a class="icon-btn" href="${attr(site.github)}" aria-label="GitHub profile" rel="noopener">${icons.github(17)}</a>
      ${themeToggle()}
    </div>
  </div>
</header>`;

const siteFooter = (site, apps) => {
  const chrome = site.content.chrome;
  return `
<footer class="site-footer">
  <div class="wrap">
    <div class="site-footer__grid">
      <div>
        <a class="brand" href="${u("/")}">${icons.logo(20)}<span>${esc(site.name)}</span></a>
        <p class="site-footer__about">${esc(site.description)}</p>
      </div>
      <div>
        <h4>${esc(chrome.footerApps)}</h4>
        <ul>
          ${apps
            .slice(0, 6)
            .map((a) => `<li><a href="${u(`/apps/${attr(a.slug)}/`)}">${esc(a.name)}</a></li>`)
            .join("\n          ")}
          ${apps.length > 6 ? `<li><a href="${u("/apps/")}">${esc(t(chrome.footerAllApps, { count: apps.length }))}</a></li>` : ""}
        </ul>
      </div>
      <div>
        <h4>${esc(chrome.footerProject)}</h4>
        <ul>
          <li><a href="${u("/software/")}">${esc(chrome.footerOther)}</a></li>
          <li><a href="${u("/about/")}">${esc(chrome.footerAbout)}</a></li>
          <li><a href="${attr(site.github)}" rel="noopener">${esc(chrome.footerGitHub)}</a></li>
        </ul>
      </div>
    </div>
    <div class="site-footer__bar">
      <span>${esc(site.footerNote)}</span>
      <span>${esc(chrome.footerLicence)} <a href="https://github.com/${attr(site.siteRepo)}" rel="noopener">${esc(chrome.footerLicenceLink)}</a></span>
    </div>
  </div>
</footer>`;
};

const shell = (site, page, apps, directory, body) => `<!doctype html>
<html lang="en">
<head>
  ${head(site, page)}
</head>
<body>
  <a class="skip-link" href="#main">${esc(site.content.chrome.skipLink)}</a>
  ${siteHeader(site, page.nav, apps, directory)}
  <main id="main">
${body}
  </main>
  ${siteFooter(site, apps)}
  <script src="${u("/assets/js/site.js")}${site.assets ? `?v=${site.assets.js}` : ""}" defer></script>
</body>
</html>
`;

/* --- app microsite chrome ----------------------------------------------- */

const appHeader = (site, app, sections) => {
  const copy = site.content.app;
  return `
<header class="site-header app-header">
  <div class="wrap site-header__inner">
    <a class="brand" href="${u(`/apps/${attr(app.slug)}/`)}">
      ${appTile(app, "tile--sm")}
      <span>${esc(app.name)}</span>
    </a>
    ${
      sections.length
        ? `<nav class="site-nav" aria-label="${attr(app.name)} sections">
      ${sections.map((s) => `<a href="#${attr(s.id)}">${esc(s.label)}</a>`).join("\n      ")}
    </nav>`
        : ""
    }
    <div class="header-actions"${sections.length ? "" : ' style="margin-left:auto"'}>
      <a class="btn btn--primary btn--sm" href="${attr(downloadUrl(app))}" rel="noopener">${icons.download(15)} ${esc(copy.downloadShort)}</a>
      ${app.repo ? `<a class="icon-btn" href="https://github.com/${attr(app.repo)}" aria-label="${attr(app.name)} source code" rel="noopener">${icons.github(17)}</a>` : ""}
      ${themeToggle()}
    </div>
  </div>
</header>`;
};

const appFooter = (site, app, siblings) => {
  const copy = site.content.app;
  return `
<footer class="app-footer">
  <div class="wrap">
    <div class="app-footer__grid">
      <div>
        <span class="brand">
          ${appTile(app, "tile--sm")}
          <span>${esc(app.name)}</span>
        </span>
        <p class="app-footer__about">${esc(app.tagline)}</p>
      </div>
      <div>
        <h4>${esc(app.name)}</h4>
        <ul>
          <li><a href="${attr(downloadUrl(app))}" rel="noopener">${esc(copy.downloadShort)}</a></li>
          ${app.repo ? `<li><a href="https://github.com/${attr(app.repo)}" rel="noopener">${esc(copy.sourceCode)}</a></li>` : ""}
          ${app.docs ? `<li><a href="${attr(app.docs)}" rel="noopener">${esc(copy.documentation)}</a></li>` : ""}
          ${app.homepage ? `<li><a href="${attr(app.homepage)}" rel="noopener">${esc(copy.projectWebsite)}</a></li>` : ""}
          ${app.repo ? `<li><a href="https://github.com/${attr(app.repo)}/releases" rel="noopener">${esc(copy.versionHistory)}</a></li>` : ""}
          ${app.repo ? `<li><a href="https://github.com/${attr(app.repo)}/issues" rel="noopener">${esc(copy.reportIssue)}</a></li>` : ""}
        </ul>
      </div>
      <div>
        <h4>${esc(t(copy.footerMore, { site: site.name }))}</h4>
        <ul>
          ${siblings
            .slice(0, 4)
            .map((a) => `<li><a href="${u(`/apps/${attr(a.slug)}/`)}">${esc(a.name)}</a></li>`)
            .join("\n          ")}
          <li><a href="${u("/apps/")}">${esc(copy.footerAll)}</a></li>
        </ul>
      </div>
    </div>
    <div class="app-footer__bar">
      <span>${esc(t(copy.footerLicence, { app: app.name, licence: app.license }))}${app.language ? esc(t(copy.footerBuiltWith, { language: app.language })) : ""}</span>
      <span>${esc(copy.footerPartOf)} <a href="${u("/")}">${esc(site.name)}</a></span>
    </div>
  </div>
</footer>`;
};

const appShell = (site, app, page, sections, siblings, body) => `<!doctype html>
<html lang="en" data-accent="${attr(accentOf(app))}">
<head>
  ${head(site, page)}
</head>
<body>
  <a class="skip-link" href="#main">${esc(site.content.chrome.skipLink)}</a>
  ${appHeader(site, app, sections)}
  <main id="main">
${body}
  </main>
  ${appFooter(site, app, siblings)}
  <script src="${u("/assets/js/site.js")}${site.assets ? `?v=${site.assets.js}` : ""}" defer></script>
</body>
</html>
`;

/* --- shared fragments --------------------------------------------------- */

/** An app's own icon where it has one, otherwise the accent monogram tile. */
const appTile = (app, extraClass = "") =>
  app.icon
    ? `<span class="tile tile--app ${extraClass}"><img src="${attr(u(app.icon))}" alt="" width="64" height="64" decoding="async"></span>`
    : `<span class="tile ${extraClass}" aria-hidden="true">${esc(monogram(app.name))}</span>`;

/**
 * Icon for a third-party tool: its own logo where we have a usable one,
 * otherwise the monogram tile. Logos are stored locally, never hotlinked.
 */
const brandTile = (item, { accent, extraClass = "" } = {}) =>
  item.logo
    ? `<span class="tile tile--logo ${extraClass}"><img src="${attr(u(item.logo))}" alt="" loading="lazy" decoding="async" width="64" height="64"></span>`
    : `<span class="tile ${extraClass}"${accent ? ` data-accent="${attr(accent)}"` : ""} aria-hidden="true">${esc(monogram(item.name))}</span>`;

const platformBadges = (platforms = []) =>
  platforms.map((p) => `<li><span class="badge">${esc(p)}</span></li>`).join("");

/** Resolve the primary download destination for an app. */
export const downloadUrl = (app) => {
  const d = app.download || { type: "github" };
  if (d.type === "official" && d.url) return d.url;
  if (d.type === "package") return d.url || `https://github.com/${app.repo}`;
  return `https://github.com/${app.repo}/releases/latest`;
};

const downloadLabel = (app, copy) => {
  const d = app.download || { type: "github" };
  if (d.type === "official") return d.label || copy.downloadShort;
  if (d.type === "package") return d.label || copy.downloadInstall;
  return copy.downloadDefault;
};

/**
 * One result row/card. The same markup serves the tile and list layouts —
 * the parent's data-view attribute decides which, so switching views never
 * touches the DOM.
 */
const resultItem = ({ accent, mark, logo, title, titleHref, titleExternal, category, blurb, badges, meta, actions, overlay, search }) => `
          <li class="item" data-item data-accent="${attr(accent)}" data-category="${attr(slugify(category))}" data-name="${attr(title.toLowerCase())}" data-blurb="${attr(search.toLowerCase())}">
            ${logo
              ? `<span class="tile tile--logo item__tile"><img src="${attr(u(logo))}" alt="" loading="lazy" decoding="async" width="64" height="64"></span>`
              : `<span class="tile item__tile" aria-hidden="true">${esc(mark)}</span>`}
            <div class="item__body">
              <h3 class="item__title"><a href="${attr(titleExternal ? titleHref : u(titleHref))}"${titleExternal ? ' rel="noopener nofollow"' : ""}${overlay ? ' class="item__link"' : ""}>${esc(title)}</a></h3>
              <p class="badge badge--accent item__cat">${esc(category)}</p>
              <p class="item__blurb">${esc(blurb)}</p>
              ${badges ? `<ul class="badge-row item__badges">${badges}</ul>` : ""}
            </div>
            <div class="item__foot">
              <span class="item__meta">${esc(meta)}</span>
              <span class="item__actions">${actions}</span>
            </div>
          </li>`;

const appItem = (app) =>
  resultItem({
    accent: accentOf(app),
    mark: monogram(app.name),
    logo: app.icon,
    title: app.name,
    titleHref: `/apps/${app.slug}/`,
    category: app.category,
    blurb: app.tagline,
    badges: platformBadges(app.platforms),
    meta: app.license,
    actions: `<span class="item__cta">View app ${icons.arrow(15)}</span>`,
    overlay: true,
    search: `${app.name} ${app.tagline} ${(app.tags || []).join(" ")}`,
  });

const dirItem = (it, category, groupIndex) =>
  resultItem({
    accent: categoryAccent(groupIndex),
    mark: monogram(it.name),
    logo: it.logo,
    title: it.name,
    titleHref: it.site || `https://github.com/${it.repo}`,
    titleExternal: true,
    category,
    blurb: it.blurb,
    badges: platformBadges(it.platforms),
    meta: it.license,
    actions: join([
      it.site
        ? `<a class="link-btn link-btn--solid" href="${attr(it.site)}" rel="noopener nofollow">${icons.globe(14)} Website</a>`
        : "",
      it.repo
        ? `<a class="link-btn" href="https://github.com/${attr(it.repo)}" rel="noopener nofollow">${icons.github(14)} Source</a>`
        : "",
    ]),
    search: `${it.name} ${it.blurb}`,
  });

/**
 * Requirements panel — sits beside the core specifications rather than below
 * them, so the hard facts and the "will it run here?" answer are side by side.
 *
 *   "requirements": {
 *     "os":       { "macOS": "12 or later · Apple silicon, Intel", ... },
 *     "hardware": { "Memory": "8 GB (16 GB recommended)", ... }
 *   }
 *
 * A plain array of strings is still accepted and renders as one list.
 */
const requirementPanel = (requirements, copy) => {
  if (!requirements) return "";

  const group = (title, entries) => `<div class="reqs__group">
              <p class="spec-title">${esc(title)}</p>
              <ul class="reqs__list">${entries
                .map(
                  ([key, value]) =>
                    `<li><span class="reqs__key">${esc(key)}</span><span class="reqs__val">${esc(value)}</span></li>`
                )
                .join("")}</ul>
            </div>`;

  if (Array.isArray(requirements)) {
    if (!requirements.length) return "";
    return `<div class="reqs">
            <div class="reqs__group">
              <p class="spec-title">${esc(copy.reqPlain)}</p>
              <ul class="specs__list">${requirements.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
            </div>
          </div>`;
  }

  const os = Object.entries(requirements.os || {});
  const hardware = Object.entries(requirements.hardware || {});
  if (!os.length && !hardware.length) return "";

  return `<div class="reqs">
            ${join([
              os.length ? group(copy.reqOperatingSystem, os) : "",
              hardware.length ? group(copy.reqHardware, hardware) : "",
            ], "\n            ")}
          </div>`;
};

/**
 * Download control. For GitHub-hosted releases this is a split button: the
 * main half always points at /releases/latest, and the caret opens a menu that
 * site.js fills with the actual per-platform assets of the newest release.
 * With no JavaScript the menu still lists the release page, so nothing is lost.
 */
const downloadControl = (app, copy) => {
  const dl = app.download || { type: "github" };
  const href = downloadUrl(app);

  if (dl.type !== "github" || !app.repo) {
    return `<a class="btn btn--primary btn--lg" href="${attr(href)}" rel="noopener">${icons.download(17)} ${esc(downloadLabel(app, copy))}</a>`;
  }

  return `<div class="dl" data-download data-repo="${attr(app.repo)}">
            <a class="btn btn--primary btn--lg dl__main" href="${attr(href)}" rel="noopener">${icons.download(17)} ${esc(downloadLabel(app, copy))}</a>
            <button class="btn btn--primary btn--lg dl__toggle" type="button" data-download-toggle aria-expanded="false" aria-label="Choose a platform">${icons.caret(13)}</button>
            <div class="dl__menu" data-download-menu hidden>
              <p class="dl__title">${esc(copy.downloadMenuTitle)}</p>
              <ul data-download-list>
                <li><a href="${attr(href)}" rel="noopener">${icons.tag(14)} <span>${esc(copy.downloadMenuAll)}</span></a></li>
              </ul>
            </div>
          </div>`;
};

const viewToggle = (c) => `
          <div class="view-toggle" role="group" aria-label="${attr(c.viewGroupLabel)}">
            <button class="view-btn" type="button" data-view-btn="tile" aria-pressed="true" title="${attr(c.viewTile)}">${icons.grid()}<span class="visually-hidden">${esc(c.viewTile)}</span></button>
            <button class="view-btn" type="button" data-view-btn="list" aria-pressed="false" title="${attr(c.viewList)}">${icons.list()}<span class="visually-hidden">${esc(c.viewList)}</span></button>
          </div>`;

/** Group apps by category, preserving the order they appear in the data. */
const groupByCategory = (apps) => {
  const order = [];
  const map = new Map();
  for (const app of apps) {
    if (!map.has(app.category)) {
      map.set(app.category, []);
      order.push(app.category);
    }
    map.get(app.category).push(app);
  }
  return order.map((category) => ({ category, items: map.get(category) }));
};

/* --- home --------------------------------------------------------------- */

/**
 * A field of directory icons drifting in place — each on its own wandering
 * path, so the group reads as gently floating rather than scrolling past.
 * Motion is disabled under prefers-reduced-motion.
 */
const floatField = (directory) => {
  const items = [];
  directory.forEach((group, gi) => {
    group.items.forEach((item) => {
      items.push({
        name: item.name,
        href: item.site || `https://github.com/${item.repo}`,
        accent: categoryAccent(gi),
        logo: item.logo || "",
        category: group.category,
        blurb: item.blurb,
        license: item.license,
        platforms: (item.platforms || []).join(", "),
      });
    });
  });
  if (!items.length) return "";

  // Deterministic scatter: seeded random points rejected until every one sits
  // at least MIN_D from its neighbours, so no two icons can collide even at
  // the extremes of their drift. Computed against a reference box and emitted
  // as percentages, so the field scales with the container.
  const REF_W = 1120, REF_H = 300, MARGIN = 48;
  let seed = 20260726;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

  let points = [];
  for (let minD = 104; minD >= 76 && points.length < items.length; minD -= 4) {
    seed = 20260726;
    points = [];
    for (let guard = 0; points.length < items.length && guard < 40000; guard++) {
      const x = MARGIN + rnd() * (REF_W - 2 * MARGIN);
      const y = MARGIN + rnd() * (REF_H - 2 * MARGIN);
      if (points.every((q) => Math.hypot(q.x - x, q.y - y) >= minD)) points.push({ x, y });
    }
  }

  const icon = (entry, i) =>
    `<a class="drift" href="${attr(entry.href)}" data-accent="${attr(entry.accent)}" rel="noopener nofollow" style="--x:${((points[i].x / REF_W) * 100).toFixed(2)}%;--y:${((points[i].y / REF_H) * 100).toFixed(2)}%;--drift-delay:-${(i % 9) * 2.3}s"
            data-name="${attr(entry.name)}" data-mark="${attr(monogram(entry.name))}" data-logo="${attr(entry.logo ? u(entry.logo) : "")}" data-category="${attr(entry.category)}" data-blurb="${attr(entry.blurb)}" data-license="${attr(entry.license)}" data-platforms="${attr(entry.platforms)}">
            ${entry.logo
              ? `<span class="tile tile--logo"><img src="${attr(u(entry.logo))}" alt="" loading="lazy" decoding="async" width="64" height="64"></span>`
              : `<span class="tile" aria-hidden="true">${esc(monogram(entry.name))}</span>`}
            <span class="visually-hidden">${esc(entry.name)}</span>
          </a>`;

  return `
      <div class="float-field">
        ${items.map(icon).join("")}
      </div>`;
};

export function renderHome(site, apps, directory) {
  const copy = site.content.home;
  const tab = (app, i) => `
          <a class="dock-app" href="#app-${attr(app.slug)}" data-tab="${attr(app.slug)}" aria-selected="${i === 0}" data-accent="${attr(accentOf(app))}">
            ${appTile(app)}
            <span class="dock-app__name">${esc(app.name)}</span>
          </a>`;

  const panel = (app) => `
        <section class="switcher-panel" id="app-${attr(app.slug)}" data-panel="${attr(app.slug)}" data-accent="${attr(accentOf(app))}" aria-label="${attr(app.name)}">
          <div>
            ${appTile(app, "tile--lg")}
            <h3 class="feature__title">${esc(app.name)}</h3>
            <p class="switcher-panel__lede">${esc(app.tagline)}</p>
            <ul class="badge-row" style="margin-top:1.1rem">
              <li><span class="badge badge--accent">${esc(app.category)}</span></li>
              ${platformBadges(app.platforms)}
              <li><span class="badge badge--mono">${esc(app.license)}</span></li>
            </ul>
            ${(app.summary || []).length ? `<p class="switcher-panel__summary">${esc(app.summary[0])}</p>` : ""}
            <div class="feature__actions">
              <a class="btn btn--primary" href="${u(`/apps/${attr(app.slug)}/`)}">Visit ${esc(app.name)} ${icons.arrow(15)}</a>
              <a class="btn btn--secondary" href="${attr(downloadUrl(app))}" rel="noopener">${icons.download(16)} ${esc(downloadLabel(app, site.content.app))}</a>
            </div>
          </div>
          ${
            (app.highlights || []).length
              ? `<ul class="feature__list">
            ${app.highlights
              .slice(0, 4)
              .map(
                (h) =>
                  `<li>${icons.check(17)}<span><strong>${esc(h.title)}</strong>${esc(h.body)}</span></li>`
              )
              .join("\n            ")}
          </ul>`
              : ""
          }
        </section>`;

  const body = `
    <section class="hero hero--center">
      <div class="wrap hero__inner">
        <h1>${esc(copy.heroTitle || `${site.tagline}.`)}</h1>
        <p class="hero__lede">${esc(copy.heroLede || site.description)}</p>
      </div>
    </section>

    <section class="section" id="apps">
      <div class="wrap">
        <div class="section-head section-head--center">
          <h2>${esc(apps.length > 1 ? copy.appsHeading : copy.appsHeadingOne)}</h2>
          <p>${esc(copy.appsLede)}</p>
        </div>

        <div class="app-switcher">
          <div class="app-dock" data-app-tabs aria-label="Choose an application">
            ${apps.map(tab).join("")}
          </div>
          <div data-app-panels>
            ${apps.map(panel).join("")}
          </div>
        </div>

        ${
          apps.length > 1
            ? `<div class="hero__actions" style="justify-content:center"><a class="btn btn--secondary" href="${u("/apps/")}">${esc(t(copy.appsMore, { count: apps.length }))} ${icons.arrow(15)}</a></div>`
            : ""
        }
      </div>
    </section>

    <section class="section section--alt">
      <div class="wrap center-block">
        <h2>${esc(copy.directoryHeading)}</h2>
        <p class="section-lede">${esc(copy.directoryLede)}</p>
      </div>
      ${floatField(directory)}
      <div class="wrap center-block">
        <a class="btn btn--secondary" href="${u("/software/")}">${esc(copy.directoryLink)} ${icons.arrow(15)}</a>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="cta">
          <h2>${esc(copy.ctaHeading)}</h2>
          <p>${esc(copy.ctaBody)}</p>
          <div class="hero__actions">
            <a class="btn btn--primary btn--lg" href="${attr(site.github)}" rel="noopener">${icons.github(17)} ${esc(copy.ctaButton)}</a>
          </div>
        </div>
      </div>
    </section>`;

  return shell(site, { path: "/", nav: "/" }, apps, directory, body);
}

/* --- app catalogue ------------------------------------------------------ */

export function renderAppsIndex(site, apps, directory) {
  const copy = site.content.apps;
  const groups = groupByCategory(apps);
  const multi = groups.length > 1;
  const showFilters = apps.length > 3;

  const body = `
    <section class="section section--head">
      <div class="wrap center-block">
        <h1>${esc(apps.length > 1 ? copy.title : copy.titleOne)}</h1>
        <p class="hero__lede">${esc(
          t(apps.length > 1 ? copy.lede : copy.ledeOne, { count: apps.length, site: site.name })
        )}</p>
      </div>
    </section>

    <section class="section section--results">
      <div class="wrap">
        <div class="filters filters--center">
          ${
            showFilters
              ? `<div class="search">
            ${icons.search()}
            <label class="visually-hidden" for="app-search">${esc(copy.searchLabel)}</label>
            <input type="search" id="app-search" data-search placeholder="${attr(t(copy.searchPlaceholder, { count: apps.length }))}" autocomplete="off">
          </div>`
              : ""
          }
          <div class="filter-row">
            ${
              showFilters && multi
                ? `<ul class="chips" data-filters>
              <li><button class="chip" type="button" aria-pressed="true" data-filter="all">${esc(copy.filterAll)}</button></li>
              ${groups
                .map(
                  (g) =>
                    `<li><button class="chip" type="button" aria-pressed="false" data-filter="${attr(slugify(g.category))}">${esc(g.category)}</button></li>`
                )
                .join("\n              ")}
            </ul>`
                : ""
            }
            ${viewToggle(site.content.chrome)}
          </div>
        </div>

        <div data-results data-view="tile">
          <ul class="item-list">
            ${apps.map(appItem).join("")}
          </ul>
        </div>

        <p class="empty-state" data-empty hidden>${esc(copy.empty)}</p>
      </div>
    </section>`;

  return shell(
    site,
    {
      title: copy.metaTitle,
      description: t(copy.metaDescription, { count: apps.length, site: site.name }),
      path: "/apps/",
      nav: "/apps/",
    },
    apps,
    directory,
    body
  );
}

/* --- app microsite ------------------------------------------------------ */

export function renderApp(site, app, apps) {
  const dl = app.download || { type: "github" };
  const siblings = apps.filter((a) => a.slug !== app.slug);

  // The in-page navigation only lists sections this app actually has.
  const copy = site.content.app;
  const sections = [
    { id: "overview", label: copy.navOverview },
    (app.highlights || []).length && { id: "features", label: copy.navFeatures },
    { id: "specifications", label: copy.navSpecifications },
    app.citation && app.citation.text && { id: "cite", label: copy.navCite },
  ].filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: app.name,
    description: app.tagline,
    applicationCategory: "ScientificApplication",
    operatingSystem: (app.platforms || []).join(", "),
    license: app.license,
    url: `${site.url}/apps/${app.slug}/`,
    downloadUrl: downloadUrl(app),
    author: { "@type": "Organization", name: site.name, url: site.url },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isAccessibleForFree: true,
  };

  const body = `
    <section class="app-hero">
      <div class="wrap app-hero__inner">
        <a class="back-link" href="${u("/")}">${icons.arrowLeft()} ${esc(t(copy.backTo, { site: site.name }))}</a>
        ${appTile(app, "tile--lg")}
        <h1 class="app-hero__title">${esc(app.name)}</h1>
        <p class="app-hero__tagline">${esc(app.tagline)}</p>
        <div class="app-hero__actions">
          ${downloadControl(app, copy)}
          ${app.repo ? `<a class="btn btn--secondary btn--sm" href="https://github.com/${attr(app.repo)}" rel="noopener">${icons.github(14)} ${esc(copy.sourceCode)}</a>` : ""}
          ${app.repo ? `<a class="btn btn--secondary btn--sm" href="https://github.com/${attr(app.repo)}/releases" rel="noopener">${icons.tag(14)} ${esc(copy.versionHistory)}</a>` : ""}
          ${app.repo ? `<a class="btn btn--secondary btn--sm" href="https://github.com/${attr(app.repo)}/issues" rel="noopener">${icons.info(14)} ${esc(copy.reportIssue)}</a>` : ""}
        </div>
        ${
          dl.type === "github" && app.repo
            ? `<p class="release-meta" data-release data-repo="${attr(app.repo)}"></p>`
            : `<p class="release-meta">${esc(dl.note || copy.officialNote)}</p>`
        }
      </div>
    </section>

    <div class="wrap">
      <div class="app-layout">
        <div class="prose">
          <h2 id="overview">${esc(copy.headingOverview)}</h2>
          ${((app.summary || []).length ? app.summary : [app.tagline])
            .map((p) => `<p>${esc(p)}</p>`)
            .join("\n          ")}

          ${
            (app.highlights || []).length
              ? `<h2 id="features">${esc(copy.headingFeatures)}</h2>
          <ul class="highlight-grid">
            ${app.highlights
              .map(
                (h) =>
                  `<li class="highlight"><strong>${esc(h.title)}</strong><p>${esc(h.body)}</p></li>`
              )
              .join("\n            ")}
          </ul>`
              : ""
          }

          <h2 id="specifications">${esc(copy.headingSpecifications)}</h2>
          <div class="spec-grid">
            <div class="spec-col">
            <p class="spec-title">${esc(copy.specGeneral)}</p>
            <dl class="specs">
            <div><dt>${esc(copy.specCategory)}</dt><dd>${esc(app.category)}</dd></div>
            <div><dt>${esc(copy.specPlatforms)}</dt><dd>${esc((app.platforms || []).join(", "))}</dd></div>
            <div><dt>${esc(copy.specLicence)}</dt><dd>${esc(app.license)}</dd></div>
            ${app.language ? `<div><dt>${esc(copy.specBuiltWith)}</dt><dd>${esc(app.language)}</dd></div>` : ""}
            <div><dt>${esc(copy.specPrice)}</dt><dd>${esc(copy.specPriceValue)}</dd></div>
            ${
              dl.type === "github" && app.repo
                ? `<div><dt>${esc(copy.specVersion)}</dt><dd data-release-version data-repo="${attr(app.repo)}">—</dd></div>
            <div><dt>${esc(copy.specReleased)}</dt><dd data-release-date>—</dd></div>`
                : ""
            }
            </dl>
            </div>
            ${requirementPanel(app.requirements, copy)}
          </div>

          ${
            app.citation && app.citation.text
              ? `<h2 id="cite">${esc(copy.headingCite)}</h2>
          <p>${esc(t(copy.citeIntro, { app: app.name }))}</p>
          <blockquote class="cite" data-citation>${esc(app.citation.text)}</blockquote>
          <button class="copy-btn" type="button" data-copy>${icons.copy()} <span>${esc(copy.citeCopy)}</span></button>
          ${app.citation.url ? `<p><a href="${attr(app.citation.url)}" rel="noopener">${esc(copy.citePaper)} ${icons.external(13)}</a></p>` : ""}`
              : ""
          }
        </div>

      </div>
    </div>`;

  return appShell(
    site,
    app,
    {
      documentTitle: `${app.name} — ${app.tagline}`,
      ogSite: app.name,
      description: app.tagline,
      path: `/apps/${app.slug}/`,
      jsonLd,
    },
    sections,
    siblings,
    body
  );
}

/* --- directory ---------------------------------------------------------- */

export function renderDirectory(site, directory, apps) {
  const copy = site.content.directory;
  const total = directory.reduce((n, g) => n + g.items.length, 0);

  const body = `
    <section class="section section--head">
      <div class="wrap center-block">
        <h1>${esc(copy.title)}</h1>
        <p class="hero__lede">${esc(copy.lede)}</p>
      </div>
    </section>

    <section class="section section--results">
      <div class="wrap">
        <div class="filters filters--center">
          <div class="search">
            ${icons.search()}
            <label class="visually-hidden" for="dir-search">${esc(copy.searchLabel)}</label>
            <input type="search" id="dir-search" data-search placeholder="${attr(t(copy.searchPlaceholder, { count: total }))}" autocomplete="off">
          </div>
          <div class="filter-row">
            <ul class="chips" data-filters>
              <li><button class="chip" type="button" aria-pressed="true" data-filter="all">${esc(copy.filterAll)}</button></li>
              ${directory
                .map(
                  (g) =>
                    `<li><button class="chip" type="button" aria-pressed="false" data-filter="${attr(slugify(g.category))}">${esc(g.category)}</button></li>`
                )
                .join("\n              ")}
            </ul>
            ${viewToggle(site.content.chrome)}
          </div>
        </div>

        <div data-results data-view="tile">
          ${directory
            .map(
              (g, gi) => `
          <section class="dir-group" id="${attr(slugify(g.category))}" data-group="${attr(slugify(g.category))}">
            <h2 class="dir-group__title">${esc(g.category)} <span class="dir-group__count">${g.items.length}</span></h2>
            <ul class="item-list">
              ${g.items.map((it) => dirItem(it, g.category, gi)).join("")}
            </ul>
          </section>`
            )
            .join("")}
        </div>

        <p class="empty-state" data-empty hidden>${esc(copy.empty)}</p>

        <div class="callout" style="margin-top:3rem">
          ${icons.info()}
          <div>
            <strong>${esc(copy.calloutStrong)}</strong>
            ${esc(copy.calloutText)}
            <a href="https://github.com/${attr(site.siteRepo)}/issues/new" rel="noopener">${esc(copy.calloutLink)}</a>.
          </div>
        </div>
      </div>
    </section>`;

  return shell(
    site,
    {
      title: copy.title,
      description: t(copy.metaDescription, { count: total }),
      path: "/software/",
      nav: "/software/",
    },
    apps,
    directory,
    body
  );
}

/* --- about -------------------------------------------------------------- */

/** Render the About page's content blocks from data/content.json. */
const contentBlocks = (blocks, site, vars) =>
  (blocks || [])
    .map((block) => {
      if (block.type === "p") return `<p>${esc(t(block.text, vars))}</p>`;
      if (block.type === "h2") return `<h2>${esc(t(block.text, vars))}</h2>`;
      if (block.type === "ticks")
        return `<ul class="ticks">
            ${block.items
              .map(
                (item) =>
                  `<li>${icons.check(16)}<span><strong>${esc(t(item.strong, vars))}</strong> ${esc(t(item.text, vars))}</span></li>`
              )
              .join("\n            ")}
          </ul>`;
      if (block.type === "steps")
        return `<ol class="steps">
            ${block.items.map((item) => `<li>${esc(t(item, vars))}</li>`).join("\n            ")}
          </ol>`;
      if (block.type === "actions")
        return `<div class="hero__actions">
            ${block.items
              .map((action) => {
                const raw = t(action.href, {
                  issues: `https://github.com/${site.siteRepo}/issues/new`,
                  website: site.website || "/",
                });
                const href = /^https?:\/\//.test(raw) ? raw : u(raw);
                const external = /^https?:\/\//.test(href);
                const lead = action.icon === "github" ? `${icons.github(16)} ` : "";
                const trail =
                  action.icon === "arrow" ? ` ${icons.arrow(15)}` :
                  action.icon === "external" ? ` ${icons.external(13)}` : "";
                return `<a class="btn btn--${attr(action.style)}" href="${attr(href)}"${external ? ' rel="noopener"' : ""}>${lead}${esc(action.label)}${trail}</a>`;
              })
              .join("\n            ")}
          </div>`;
      return "";
    })
    .join("\n\n          ");

export function renderAbout(site, apps, directory) {
  const total = directory.reduce((n, g) => n + g.items.length, 0);
  const copy = site.content.about;
  const vars = { site: site.name, total };

  const body = `
    <section class="section">
      <div class="wrap">
        <h1>${esc(t(copy.title, vars))}</h1>
        <div class="prose stack" style="margin-top:2rem">
          ${contentBlocks(copy.blocks, site, vars)}
        </div>
      </div>
    </section>`;

  return shell(
    site,
    {
      title: "About",
      description: t(copy.metaDescription, vars),
      path: "/about/",
      nav: "/about/",
    },
    apps,
    directory,
    body
  );
}

/* --- 404 ---------------------------------------------------------------- */

export function render404(site, apps, directory) {
  const copy = site.content.notFound;
  const body = `
    <section class="section center">
      <div class="wrap stack">
        <p class="eyebrow" style="justify-content:center">${esc(copy.eyebrow)}</p>
        <h1>${esc(copy.title)}</h1>
        <p class="muted">${esc(copy.text)}</p>
        <div class="hero__actions" style="justify-content:center">
          ${copy.actions
            .map(
              (action) =>
                `<a class="btn btn--${attr(action.style)}" href="${attr(u(action.href))}">${esc(action.label)}</a>`
            )
            .join("\n          ")}
        </div>
      </div>
    </section>`;
  return shell(site, { title: copy.metaTitle, path: "/404.html" }, apps, directory, body);
}
