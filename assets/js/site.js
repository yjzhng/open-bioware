/* Open Bioware — progressive enhancement only.
   Every page works with JavaScript disabled; this adds theme switching,
   live release metadata and directory filtering on top. */

(function () {
  "use strict";

  /* --- theme ----------------------------------------------------------- */

  var root = document.documentElement;

  function currentTheme() {
    var stored = null;
    try { stored = localStorage.getItem("theme"); } catch (e) {}
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  var toggle = document.querySelector("[data-theme-toggle]");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* --- live release metadata -------------------------------------------- */

  var dateFmt = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  function fetchRelease(repo) {
    return fetch("https://api.github.com/repos/" + repo + "/releases/latest", {
      headers: { Accept: "application/vnd.github+json" },
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    });
  }

  // Collect every element that needs release info, grouped by repository so a
  // page with several references to one repo still makes a single request.
  var byRepo = {};
  document.querySelectorAll("[data-repo]").forEach(function (el) {
    var repo = el.getAttribute("data-repo");
    if (!repo) return;
    (byRepo[repo] = byRepo[repo] || []).push(el);
  });

  Object.keys(byRepo).forEach(function (repo) {
    fetchRelease(repo)
      .then(function (release) {
        var tag = release.tag_name || "";
        var when = release.published_at ? dateFmt.format(new Date(release.published_at)) : "";

        byRepo[repo].forEach(function (el) {
          if (el.hasAttribute("data-download")) {
            fillDownloadMenu(el, release);
          } else if (el.hasAttribute("data-release-version")) {
            el.textContent = tag || "—";
            var dateCell = document.querySelector("[data-release-date]");
            if (dateCell && when) dateCell.textContent = when;
          } else if (el.hasAttribute("data-release") || el.hasAttribute("data-release-line")) {
            var parts = [];
            if (tag) parts.push("Latest release " + tag);
            if (when) parts.push(when);
            el.textContent = parts.join(" · ");
          }
        });
      })
      .catch(function () {
        // Offline, rate-limited, or no published release: the server-rendered
        // fallback text stays exactly as it is.
      });
  });

  /* --- home page app switcher ------------------------------------------- */

  // Server-rendered markup stacks every panel, so the page is complete without
  // JavaScript. Here we collapse it into a tablist.
  var tabStrip = document.querySelector("[data-app-tabs]");
  var panelWrap = document.querySelector("[data-app-panels]");

  if (tabStrip && panelWrap) {
    var tabs = Array.prototype.slice.call(tabStrip.querySelectorAll("[data-tab]"));
    var panels = Array.prototype.slice.call(panelWrap.querySelectorAll("[data-panel]"));

    if (tabs.length > 1) {
      tabStrip.setAttribute("role", "tablist");

      tabs.forEach(function (tab, i) {
        var slug = tab.getAttribute("data-tab");
        var panel = panelWrap.querySelector('[data-panel="' + slug + '"]');
        tab.setAttribute("role", "tab");
        tab.id = "tab-" + slug;
        if (panel) {
          panel.setAttribute("role", "tabpanel");
          panel.setAttribute("aria-labelledby", tab.id);
          panel.id = "app-" + slug;
          tab.setAttribute("aria-controls", panel.id);
        }
        tab.tabIndex = i === 0 ? 0 : -1;
      });

      var select = function (slug, moveFocus) {
        tabs.forEach(function (tab) {
          var on = tab.getAttribute("data-tab") === slug;
          tab.setAttribute("aria-selected", String(on));
          tab.tabIndex = on ? 0 : -1;
          if (on && moveFocus) tab.focus();
        });
        panels.forEach(function (panel) {
          panel.hidden = panel.getAttribute("data-panel") !== slug;
        });
      };

      select(tabs[0].getAttribute("data-tab"));

      tabStrip.addEventListener("click", function (event) {
        var tab = event.target.closest("[data-tab]");
        if (!tab) return;
        event.preventDefault();
        select(tab.getAttribute("data-tab"));
      });

      tabStrip.addEventListener("keydown", function (event) {
        var i = tabs.indexOf(document.activeElement);
        if (i === -1) return;
        var next = null;
        if (event.key === "ArrowRight") next = (i + 1) % tabs.length;
        else if (event.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        select(tabs[next].getAttribute("data-tab"), true);
      });

      // Deep link: /#app-<slug> opens that app directly.
      var fromHash = function () {
        var m = /^#app-(.+)$/.exec(window.location.hash);
        if (m && panelWrap.querySelector('[data-panel="' + m[1] + '"]')) select(m[1]);
      };
      fromHash();
      window.addEventListener("hashchange", fromHash);
    }
  }

  /* --- hover card for the drifting directory icons ----------------------- */

  // Hovering an icon shows what the tool actually is.
  // The card is built with textContent (never innerHTML) and lives on <body>
  // so no transformed ancestor can clip or mis-position it.
  var floatField = document.querySelector(".float-field");

  if (floatField && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var card = document.createElement("div");
    card.className = "drift-card";
    card.hidden = true;

    var cardTile = document.createElement("span");
    cardTile.className = "tile tile--sm";
    var cardName = document.createElement("p");
    cardName.className = "drift-card__name";
    var cardCat = document.createElement("p");
    cardCat.className = "drift-card__cat";
    var head = document.createElement("div");
    head.className = "drift-card__head";
    var headText = document.createElement("div");
    headText.appendChild(cardName);
    headText.appendChild(cardCat);
    head.appendChild(cardTile);
    head.appendChild(headText);

    var cardBlurb = document.createElement("p");
    cardBlurb.className = "drift-card__blurb";
    var cardMeta = document.createElement("p");
    cardMeta.className = "drift-card__meta";

    var cardLink = document.createElement("a");
    cardLink.className = "drift-card__link";
    cardLink.rel = "noopener nofollow";
    var cardLinkText = document.createElement("span");
    cardLink.appendChild(cardLinkText);

    var cardFoot = document.createElement("div");
    cardFoot.className = "drift-card__foot";
    cardFoot.appendChild(cardMeta);
    cardFoot.appendChild(cardLink);

    card.appendChild(head);
    card.appendChild(cardBlurb);
    card.appendChild(cardFoot);
    document.body.appendChild(card);

    var hoverTimer = null;
    var activeIcon = null;

    var place = function (icon) {
      var r = icon.getBoundingClientRect();
      var c = card.getBoundingClientRect();
      var left = r.left + r.width / 2 - c.width / 2;
      left = Math.max(12, Math.min(left, window.innerWidth - c.width - 12));
      var top = r.bottom + 10;
      if (top + c.height > window.innerHeight - 12) {
        var above = r.top - c.height - 10;
        if (above >= 12) top = above; // only flip up when down would overflow
      }
      card.style.left = Math.round(left) + "px";
      card.style.top = Math.round(top) + "px";
    };

    var hideTimer = null;

    var hide = function () {
      window.clearTimeout(hoverTimer);
      activeIcon = null;
      card.hidden = true;
      floatField.classList.remove("is-paused");
    };

    // Leaving either the strip or the card starts a short countdown; entering
    // the other one cancels it. That bridges the gap between them so the card
    // can be clicked.
    var hideSoon = function () {
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(hide, 180);
    };
    var keepOpen = function () { window.clearTimeout(hideTimer); };

    var show = function (icon) {
      activeIcon = icon;
      var logo = icon.getAttribute("data-logo");
      cardTile.textContent = "";
      cardTile.removeAttribute("data-accent");
      if (logo) {
        cardTile.className = "tile tile--sm tile--logo";
        var img = document.createElement("img");
        img.src = logo;
        img.alt = "";
        cardTile.appendChild(img);
      } else {
        cardTile.className = "tile tile--sm";
        cardTile.textContent = icon.getAttribute("data-mark") || "";
      }
      cardName.textContent = icon.getAttribute("data-name") || "";
      cardCat.textContent = icon.getAttribute("data-category") || "";
      cardBlurb.textContent = icon.getAttribute("data-blurb") || "";
      cardMeta.textContent = [
        icon.getAttribute("data-platforms"),
        icon.getAttribute("data-license"),
      ].filter(Boolean).join(" · ");

      var href = icon.getAttribute("href") || "";
      cardLink.href = href;
      var host = href;
      try { host = new URL(href).hostname.replace(/^www\./, ""); } catch (e) {}
      cardLinkText.textContent = host;
      card.setAttribute("data-accent", icon.getAttribute("data-accent") || "teal");
      card.hidden = false;
      floatField.classList.add("is-paused");
      place(icon);
    };

    floatField.addEventListener("mouseover", function (event) {
      var icon = event.target.closest(".drift");
      if (!icon || icon === activeIcon) return;
      keepOpen();
      window.clearTimeout(hoverTimer);
      hoverTimer = window.setTimeout(function () { show(icon); }, 500);
    });

    floatField.addEventListener("mouseenter", keepOpen);
    floatField.addEventListener("mouseleave", hideSoon);
    card.addEventListener("mouseenter", keepOpen);
    card.addEventListener("mouseleave", hideSoon);
    // Fixed positioning would drift away from the icon as the page moves.
    window.addEventListener("scroll", hide, { passive: true });
    window.addEventListener("resize", hide);
  }

  /* --- same-page header links scroll instead of reloading ---------------- */

  // Clicking the app title (or "Home" while already home) should behave like
  // the section tabs: glide back to the top rather than reloading the page.
  document.querySelectorAll(".site-header a[href]").forEach(function (link) {
    var url;
    try { url = new URL(link.href, window.location.href); } catch (e) { return; }
    if (url.origin !== window.location.origin) return;
    if (url.hash) return; // in-page anchors already scroll on their own

    link.addEventListener("click", function (event) {
      // Only hijack a plain left-click on the page we are already on.
      if (url.pathname !== window.location.pathname) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (event.button !== 0) return;

      event.preventDefault();
      var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });

      // Drop any lingering #section so the URL matches what is on screen.
      if (window.location.hash && window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    });
  });

  /* --- back link resumes the page you came from ------------------------- */

  // Arriving from the home page or the app catalogue, "← Open Bioware" should
  // hand you back to where you were reading, not dump you at the top. Going
  // through history lets the browser restore the scroll position (and, via
  // bfcache, the rest of that page's state). Landing directly on an app page —
  // from a search result or a shared link — falls through to the plain href.
  var backLink = document.querySelector(".back-link");
  if (backLink && window.history.length > 1 && document.referrer) {
    var from = null;
    try { from = new URL(document.referrer); } catch (e) {}
    var cameFromSite =
      from &&
      from.origin === window.location.origin &&
      (from.pathname === "/" || from.pathname === "/apps/");

    if (cameFromSite) {
      backLink.addEventListener("click", function (event) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (event.button !== 0) return;
        event.preventDefault();
        window.history.back();
      });
    }
  }

  /* --- app page section highlighting ------------------------------------ */

  // Underline the nav entry for whichever section the reader is currently in.
  var sectionLinks = Array.prototype.slice
    .call(document.querySelectorAll('.app-header .site-nav a[href^="#"]'))
    .map(function (link) {
      return { link: link, target: document.getElementById(link.getAttribute("href").slice(1)) };
    })
    .filter(function (pair) { return pair.target; });

  if (sectionLinks.length) {
    var ticking = false;

    var markCurrent = function () {
      ticking = false;
      var header = document.querySelector(".site-header");

      // A section counts as "current" once its heading reaches the top 25% of
      // the viewport — readers look at the middle of the page, so waiting for
      // the heading to hit the header would lag a whole section behind. The
      // lower bound keeps the line clear of the sticky header on short screens.
      var offset = Math.max(
        (header ? header.offsetHeight : 62) + 16,
        window.innerHeight * 0.25
      );

      var current = sectionLinks[0];
      sectionLinks.forEach(function (pair) {
        if (pair.target.getBoundingClientRect().top <= offset) current = pair;
      });

      // On a short page the last section can never reach the trigger line, so
      // at the very bottom promote it — but only once its heading is actually
      // in the upper half of the screen. Without that guard a tall window
      // would highlight the final section while the reader is still well
      // above it.
      var atEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (atEnd) {
        var last = sectionLinks[sectionLinks.length - 1];
        if (last.target.getBoundingClientRect().top <= window.innerHeight / 2) {
          current = last;
        }
      }

      sectionLinks.forEach(function (pair) {
        var on = pair === current;
        pair.link.classList.toggle("is-current", on);
        if (on) pair.link.setAttribute("aria-current", "true");
        else pair.link.removeAttribute("aria-current");
      });
    };

    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(markCurrent);
    };

    markCurrent();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  /* --- download menu ---------------------------------------------------- */

  // Open/close is independent of the network, so the menu still works (showing
  // its server-rendered fallback link) if the API call fails.
  document.querySelectorAll("[data-download]").forEach(function (wrap) {
    var toggle = wrap.querySelector("[data-download-toggle]");
    var menu = wrap.querySelector("[data-download-menu]");
    if (!toggle || !menu) return;

    var close = function () {
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", function () {
      var open = menu.hidden;
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
    });

    document.addEventListener("click", function (event) {
      if (!wrap.contains(event.target)) close();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") close();
    });
  });

  var OS_ORDER = ["macOS", "Windows", "Linux"];

  function osOf(name) {
    if (/(mac|osx|darwin)|\.dmg$|\.pkg$/.test(name)) return "macOS";
    if (/win|\.exe$|\.msi$|\.msix$/.test(name)) return "Windows";
    if (/linux|\.deb$|\.rpm$|appimage/.test(name)) return "Linux";
    return null;
  }

  function archOf(name, os) {
    if (/arm64|aarch64|silicon|-arm|_arm/.test(name)) {
      return os === "macOS" ? "Apple silicon" : "ARM64";
    }
    if (/x86_64|x64|amd64|intel|_64|-64/.test(name)) {
      return os === "macOS" ? "Intel" : "64-bit";
    }
    return null;
  }

  // Checksums, signatures and source archives are not what anyone means by
  // "download", so they never reach the menu.
  function isNoise(name) {
    return (
      /\.(sha1|sha256|sha512|md5|asc|sig|pem|txt|json|ya?ml|lockfile)$/.test(name) ||
      /(^|[-_.])(source|src)([-_.]|$)/.test(name)
    );
  }

  function humanSize(bytes) {
    if (!bytes) return "";
    var mb = bytes / 1048576;
    return mb >= 1024 ? (mb / 1024).toFixed(1) + " GB" : Math.round(mb) + " MB";
  }

  function detectOS() {
    var ua = navigator.userAgent || "";
    var plat = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || "";
    var hay = plat + " " + ua;
    if (/Mac|iPhone|iPad/i.test(hay)) return "macOS";
    if (/Win/i.test(hay)) return "Windows";
    if (/Linux|X11|Android/i.test(hay)) return "Linux";
    return null;
  }

  function fillDownloadMenu(wrap, release) {
    var list = wrap.querySelector("[data-download-list]");
    if (!list || !release.assets || !release.assets.length) return;

    var buckets = {};
    release.assets.forEach(function (asset) {
      var lower = (asset.name || "").toLowerCase();
      if (isNoise(lower)) return;
      var os = osOf(lower);
      if (!os) return;
      (buckets[os] = buckets[os] || []).push({
        name: asset.name,
        url: asset.browser_download_url,
        arch: archOf(lower, os),
        size: humanSize(asset.size),
      });
    });

    var present = OS_ORDER.filter(function (os) { return buckets[os]; });
    if (!present.length) return;

    // Lead with the visitor's own platform; browsers cannot reliably report
    // CPU architecture, so we only ever claim to know the OS.
    var mine = detectOS();
    if (mine && buckets[mine]) {
      present = [mine].concat(present.filter(function (os) { return os !== mine; }));
    }

    var html = "";
    present.forEach(function (os) {
      html +=
        '<li class="dl__group"><p class="dl__title">' +
        os +
        (os === mine ? ' <span class="dl__pick">Your system</span>' : "") +
        "</p><ul>";
      buckets[os].forEach(function (a) {
        var label = a.arch ? os + " · " + a.arch : os;
        html +=
          '<li><a href="' + a.url + '" rel="noopener"><span>' + label +
          '<span class="dl__note">' + a.name + (a.size ? " · " + a.size : "") + "</span></span></a></li>";
      });
      html += "</ul></li>";
    });

    html +=
      '<li><a href="' + (release.html_url || "#") + '" rel="noopener"><span>See all files for this release</span></a></li>';
    list.innerHTML = html;
  }

  /* --- copy citation ---------------------------------------------------- */

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var source = document.querySelector("[data-citation]");
      if (!source || !navigator.clipboard) return;
      navigator.clipboard.writeText(source.textContent.trim()).then(function () {
        var label = btn.querySelector("span");
        if (!label) return;
        var original = label.textContent;
        label.textContent = "Copied";
        setTimeout(function () { label.textContent = original; }, 1600);
      });
    });
  });

  /* --- tile / list view toggle ------------------------------------------ */

  var viewButtons = Array.prototype.slice.call(document.querySelectorAll("[data-view-btn]"));
  var viewHost = document.querySelector("[data-results]");

  if (viewButtons.length && viewHost) {
    var applyView = function (view, persist) {
      viewHost.setAttribute("data-view", view);
      viewButtons.forEach(function (btn) {
        btn.setAttribute("aria-pressed", String(btn.getAttribute("data-view-btn") === view));
      });
      if (persist) {
        try { localStorage.setItem("view", view); } catch (e) {}
      }
    };

    var storedView = null;
    try { storedView = localStorage.getItem("view"); } catch (e) {}
    if (storedView === "list" || storedView === "tile") applyView(storedView, false);

    viewButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyView(btn.getAttribute("data-view-btn"), true);
      });
    });
  }

  /* --- directory search + filter ---------------------------------------- */

  var search = document.querySelector("[data-search]");
  var filterBar = document.querySelector("[data-filters]");
  var results = document.querySelector("[data-results]");
  var empty = document.querySelector("[data-empty]");

  if (results) {
    // Works for both layouts: a flat grid where each item carries its own
    // data-category, and a grouped list where the category comes from the
    // enclosing [data-group] section.
    var items = Array.prototype.slice.call(results.querySelectorAll("[data-item]"));
    var groups = Array.prototype.slice.call(results.querySelectorAll("[data-group]"));
    var activeFilter = "all";

    function categoryOf(item) {
      var own = item.getAttribute("data-category");
      if (own) return own;
      var group = item.closest("[data-group]");
      return group ? group.getAttribute("data-group") : null;
    }

    function apply() {
      var query = (search ? search.value : "").trim().toLowerCase();
      var visibleTotal = 0;

      items.forEach(function (item) {
        var haystack =
          (item.getAttribute("data-name") || "") +
          " " +
          (item.getAttribute("data-blurb") || "");
        var matches =
          (activeFilter === "all" || categoryOf(item) === activeFilter) &&
          (!query || haystack.indexOf(query) !== -1);
        item.hidden = !matches;
        if (matches) visibleTotal++;
      });

      // Collapse any group left with nothing in it, and keep its count honest.
      groups.forEach(function (group) {
        var shown = group.querySelectorAll("[data-item]:not([hidden])").length;
        group.hidden = shown === 0;
        var count = group.querySelector(".dir-group__count");
        if (count) count.textContent = String(shown);
      });

      if (empty) empty.hidden = visibleTotal !== 0;
    }

    if (search) search.addEventListener("input", apply);

    if (filterBar) {
      filterBar.addEventListener("click", function (event) {
        var btn = event.target.closest("[data-filter]");
        if (!btn) return;
        activeFilter = btn.getAttribute("data-filter");
        filterBar.querySelectorAll("[data-filter]").forEach(function (b) {
          b.setAttribute("aria-pressed", String(b === btn));
        });
        apply();
      });
    }
  }
})();
