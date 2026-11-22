/* Backend Mastery — site.js
 * Small, dependency-free behaviour for our own website design:
 *   theme toggle · mobile menu · reading progress · table-of-contents highlight
 *   copy buttons · scrollable tables · ✓ marks for finished lessons
 *   "continue where you left off" · search (Ctrl/⌘+K)
 * Lesson progress itself lives in progress.js (key "bz-progress-v1"). */
(function () {
  "use strict";

  var BASE = (document.body.getAttribute("data-base") || ".").replace(/\/$/, "");
  var LAST_KEY = "bz-last-lesson";

  function store(key, value) {
    try {
      if (value === undefined) return JSON.parse(localStorage.getItem(key) || "null");
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { return null; }
  }
  function doneLessons() {
    var data = store("bz-progress-v1") || {};
    return data.lessons || {};
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  // ---------------------------------------------------------------- theme
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-action]");
    if (!t) return;
    var action = t.getAttribute("data-action");
    if (action === "theme") {
      var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("bz-theme", next); } catch (err) {}
    } else if (action === "menu") {
      document.body.classList.toggle("menu-open");
    } else if (action === "search") {
      openSearch();
    } else if (action === "search-close") {
      closeSearch();
    }
  });

  // ---------------------------------------------------------------- lesson meta card
  // The Markdown writes "**Module** 1 · ... **Lesson** 2 ...". Turn each bold label
  // and the text after it into one labelled item of a tidy card.
  $$(".prose .bz-meta").forEach(function (box) {
    var items = [], cur = null;
    $$("p", box).forEach(function (p) {
      Array.prototype.slice.call(p.childNodes).forEach(function (node) {
        if (node.nodeName === "STRONG") {
          cur = { label: node.textContent.trim(), value: document.createElement("span") };
          items.push(cur);
        } else if (cur) {
          cur.value.appendChild(node.cloneNode(true));
        }
      });
    });
    if (!items.length) return;
    var grid = document.createElement("div");
    grid.className = "meta-grid";
    items.forEach(function (it) {
      var cell = document.createElement("div");
      var key = it.label.toLowerCase().replace(/[^a-z]+/g, "-");
      cell.className = "meta-item meta-item--" + key;
      var label = document.createElement("span");
      label.className = "meta-label";
      label.textContent = it.label;
      it.value.className = "meta-value";
      it.value.innerHTML = it.value.innerHTML.trim();
      cell.appendChild(label);
      cell.appendChild(it.value);
      grid.appendChild(cell);
    });
    box.innerHTML = "";
    box.appendChild(grid);
    box.classList.add("is-ready");
  });

  // ---------------------------------------------------------------- tables + copy buttons
  $$(".prose table").forEach(function (table) {
    if (table.parentElement.classList.contains("table-wrap")) return;
    var wrap = document.createElement("div");
    wrap.className = "table-wrap";
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });

  $$(".prose .highlight").forEach(function (block) {
    var code = block.querySelector("pre code") || block.querySelector("pre");
    if (!code) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.addEventListener("click", function () {
      var text = code.innerText.replace(/\n$/, "");
      var done = function () {
        btn.textContent = "Copied ✓";
        btn.classList.add("is-copied");
        setTimeout(function () { btn.textContent = "Copy"; btn.classList.remove("is-copied"); }, 1600);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
    });
    block.appendChild(btn);
  });

  // ---------------------------------------------------------------- ✓ marks in the sidebar and on the home page
  function paintProgress() {
    var done = doneLessons();
    $$(".nav-link[data-lesson]").forEach(function (a) {
      a.classList.toggle("is-done", !!done[a.getAttribute("data-lesson")]);
    });
    $$("[data-module-lessons]").forEach(function (a) {
      var ids = a.getAttribute("data-module-lessons").split(",").filter(Boolean);
      var n = ids.filter(function (id) { return done[id]; }).length;
      var meta = a.querySelector("[data-module-meta]");
      if (meta && n) meta.textContent = n + " / " + ids.length + " done";
      a.classList.toggle("is-complete", ids.length > 0 && n === ids.length);
    });
  }
  paintProgress();
  // progress.js changes localStorage when a lesson is marked complete: repaint on click.
  document.addEventListener("click", function (e) {
    if (e.target.closest(".bz-complete")) setTimeout(paintProgress, 50);
  });
  window.addEventListener("storage", paintProgress);

  // ---------------------------------------------------------------- lesson pages
  var lesson = $("[data-lesson-page]");
  if (lesson) {
    store(LAST_KEY, {
      id: lesson.getAttribute("data-lesson-page"),
      title: lesson.getAttribute("data-lesson-title"),
      path: location.pathname
    });

    var bar = $(".read-progress span");
    var onScroll = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // table of contents: highlight the section you are reading
  var tocLinks = $$(".toc a[data-toc]");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[a.getAttribute("data-toc")] = a; });
    var headings = Object.keys(byId).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      var current = null;
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].getBoundingClientRect().top < 140) current = headings[i].id;
      }
      if (!current && headings[0]) current = headings[0].id;
      tocLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("data-toc") === current); });
    }, { rootMargin: "-80px 0px -60% 0px" });
    headings.forEach(function (h) { io.observe(h); });
  }

  // close the mobile menu after choosing a page
  $$(".sidebar a").forEach(function (a) {
    a.addEventListener("click", function () { document.body.classList.remove("menu-open"); });
  });

  // ---------------------------------------------------------------- home: continue + overall progress
  var home = $("[data-all-lessons]");
  if (home) {
    var all = home.getAttribute("data-all-lessons").split(",").filter(Boolean);
    var done = doneLessons();
    var finished = all.filter(function (id) { return done[id]; }).length;
    var last = store(LAST_KEY);
    var resume = $("[data-resume]");
    if (resume && (last || finished)) {
      resume.hidden = false;
      var link = $("[data-resume-link]");
      if (last && last.path) {
        link.textContent = last.title + " →";
        link.href = last.path;
        var start = $("[data-start]");
        if (start) { start.textContent = "Continue learning"; start.href = last.path; }
      } else {
        link.textContent = "Pick your next lesson below →";
        link.href = "#curriculum";
      }
      $("[data-meter]").style.width = (all.length ? (finished / all.length) * 100 : 0) + "%";
      $("[data-count]").textContent = finished + " of " + all.length + " lessons done";
    }
  }

  // ---------------------------------------------------------------- search
  var searchBox = $("[data-search]");
  var input = $("[data-search-input]");
  var results = $("[data-search-results]");
  var index = null;
  var selected = 0;

  function loadIndex() {
    if (index) return Promise.resolve(index);
    return fetch(BASE + "/search/search_index.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        index = (data.docs || []).filter(function (d) { return d.title && d.location !== undefined; });
        return index;
      })
      .catch(function () { index = []; return index; });
  }
  function openSearch() {
    if (!searchBox) return;
    searchBox.hidden = false;
    document.body.style.overflow = "hidden";
    input.value = "";
    results.innerHTML = '<li class="search__empty">Type to search every lesson.</li>';
    setTimeout(function () { input.focus(); }, 10);
    loadIndex();
  }
  function closeSearch() {
    if (!searchBox) return;
    searchBox.hidden = true;
    document.body.style.overflow = "";
  }
  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  function plain(html) {
    var d = document.createElement("div");
    d.innerHTML = html;
    return (d.textContent || "").replace(/\s+/g, " ").trim();
  }
  function highlight(text, words) {
    var safe = escapeHtml(text);
    words.forEach(function (w) {
      if (w.length < 2) return;
      safe = safe.replace(new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi"), "<mark>$1</mark>");
    });
    return safe;
  }
  function pageTitle(location) {
    var page = index.filter(function (d) { return d.location === location.split("#")[0]; })[0];
    return page ? page.title : "";
  }
  function runSearch(q) {
    var words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) {
      results.innerHTML = '<li class="search__empty">Type to search every lesson.</li>';
      return;
    }
    var scored = [];
    index.forEach(function (d) {
      var title = d.title.toLowerCase();
      var text = plain(d.text || "").toLowerCase();
      var score = 0;
      for (var i = 0; i < words.length; i++) {
        var inTitle = title.indexOf(words[i]) >= 0;
        var inText = text.indexOf(words[i]) >= 0;
        if (!inTitle && !inText) return;
        score += inTitle ? 10 : 1;
      }
      if (d.location.indexOf("#") < 0) score += 2; // whole pages first
      scored.push({ d: d, score: score, text: text });
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    scored = scored.slice(0, 12);
    if (!scored.length) {
      results.innerHTML = '<li class="search__empty">Nothing found for “' + escapeHtml(q) + '”.</li>';
      return;
    }
    selected = 0;
    results.innerHTML = scored.map(function (r, i) {
      var t = plain(r.d.text || "");
      var at = t.toLowerCase().indexOf(words[0]);
      var snippet = t.slice(Math.max(0, at - 50), Math.max(0, at - 50) + 160);
      var parent = r.d.location.indexOf("#") >= 0 ? pageTitle(r.d.location) : "";
      return '<li><a href="' + BASE + "/" + r.d.location + '"' + (i === 0 ? ' class="is-selected"' : "") + ">" +
        (parent ? '<span class="r-page">' + escapeHtml(parent) + " › </span>" : "") +
        '<span class="r-title">' + highlight(r.d.title, words) + "</span>" +
        (snippet ? '<span class="r-text">…' + highlight(snippet, words) + "…</span>" : "") +
        "</a></li>";
    }).join("");
  }
  if (input) {
    input.addEventListener("input", function () {
      var q = input.value.trim();
      loadIndex().then(function () { runSearch(q); });
    });
    input.addEventListener("keydown", function (e) {
      var links = $$("a", results);
      if (!links.length) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        selected = (selected + (e.key === "ArrowDown" ? 1 : links.length - 1)) % links.length;
        links.forEach(function (a, i) { a.classList.toggle("is-selected", i === selected); });
        links[selected].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") {
        e.preventDefault();
        links[selected].click();
      }
    });
    results.addEventListener("click", function (e) { if (e.target.closest("a")) closeSearch(); });
  }
  document.addEventListener("keydown", function (e) {
    var typing = /INPUT|TEXTAREA|SELECT/.test((e.target.tagName || "")) || e.target.isContentEditable;
    if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); openSearch(); }
    else if (e.key === "/" && !typing) { e.preventDefault(); openSearch(); }
    else if (e.key === "Escape") { closeSearch(); document.body.classList.remove("menu-open"); }
  });
})();
