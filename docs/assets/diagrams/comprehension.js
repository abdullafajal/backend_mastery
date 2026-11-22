/* comprehension — Module 4, Lesson 5.
 * The catalog's 5 products go through a comprehension one by one.
 * Situation "filter": [p["name"] for p in catalog if p["price_paise"] < LIMIT], with a typed limit in rupees.
 * Situation "dict":   {p["name"]: p["price_paise"] for p in catalog}: every product becomes one key: value pair. */
(function () {
  var CATALOG = [["Red Running Shoes", 99900], ["Cotton Kurta", 64900], ["Masala Box", 29900], ["Wireless Earbuds", 149900], ["Steel Water Bottle", 34900]];
  function rs(p) { return "₹" + String(Math.floor(p / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }   // like Python's {:,}

  DiagramKit.register("comprehension", {
    title: "A comprehension, one item at a time",
    intro: "Pick a situation, then press <b>Play</b>. In the first one, type a price limit.",
    state: { sit: "filter", rupees: 500 },
    size: function (narrow) { return narrow ? [360, 420] : [840, 380]; },
    controls: function (ui, state, api) {
      var inp;
      ui.select({ label: "Situation:", value: state.sit,
        options: [{ value: "filter", label: "List with if: products under ₹…" }, { value: "dict", label: "Dict: name → price" }],
        onChange: function (v) { state.sit = v; inp.parentNode.style.display = v === "filter" ? "" : "none"; api.reset(); } });
      inp = ui.input({ label: "Under ₹", type: "number", value: state.rupees, min: 0, width: "7rem",
        onChange: function (v) { var r = Math.floor(Number(v)); state.rupees = isFinite(r) && r >= 0 ? Math.min(r, 9999999) : 0; inp.value = state.rupees; api.reset(); } });
      if (state.sit !== "filter") inp.parentNode.style.display = "none";
    },
    scene: function (s, state) {
      var n = s.narrow, filter = state.sit === "filter", limit = state.rupees * 100;
      var code = filter ? '[p["name"] for p in catalog if p["price_paise"] < ' + limit + ']'
                        : '{p["name"]: p["price_paise"] for p in catalog}';
      var top = n ? 96 : 100, gap = n ? 62 : 54, h = n ? 50 : 44;
      s.box({ x: n ? 6 : 20, y: 8, w: n ? 348 : 800, h: n ? 56 : 48, label: n ? (filter ? "names with price < " + limit : "{name: price for each p}") : code, sub: n ? "" : "" });
      s.zone(n ? 4 : 14, top - 26, n ? 172 : 330, CATALOG.length * gap + 28, "catalog (for p in …)");
      s.zone(n ? 184 : 496, top - 26, n ? 172 : 330, CATALOG.length * gap + 28, filter ? "result list" : "result dict");
      var items = [], outs = [], arrows = [];
      CATALOG.forEach(function (c, i) {
        var y = top + i * gap;
        items.push(s.box({ x: n ? 10 : 24, y: y, w: n ? 160 : 310, h: h, label: c[0], sub: rs(c[1]) + " = " + c[1] + " paise" }));
        outs.push(s.box({ x: n ? 190 : 506, y: y, w: n ? 160 : 310, h: h, label: filter || n ? '"' + c[0] + '"' : '"' + c[0] + '": ' + c[1],
                               sub: filter ? "kept" : (n ? "→ " + c[1] : "key: value"), hidden: true }));   // phones: key and value on two lines
        arrows.push(s.arrow(items[i], outs[i], { dir: "h", hidden: true }));
      });
      var kept = CATALOG.filter(function (c) { return !filter || c[1] < limit; });
      var steps = CATALOG.map(function (c, i) {
        var pass = !filter || c[1] < limit;
        return {
          caption: filter
            ? "<code>p</code> = " + c[0] + ". Is <code>" + c[1] + " < " + limit + "</code>? <b>" + (pass ? "Yes" : "No") + "</b>, so " + (pass ? "its name goes into the list." : "it's skipped.")
            : "<code>p</code> = " + c[0] + ". It becomes the pair <code>\"" + c[0] + "\": " + c[1] + "</code> in the new dict.",
          run: function (t) {
            items.forEach(function (b, j) { t.unmark(b); if (j < i) { var ok = !filter || CATALOG[j][1] < limit; t.mark(b, ok ? "ok" : "dim"); } });
            arrows.forEach(function (a) { t.unmark(a); });
            t.mark(items[i], "active");
            if (!pass) { t.sub(items[i], rs(c[1]) + ": not < " + rs(limit)); return; }
            t.show(arrows[i]); t.mark(arrows[i], "active");
            return t.packet(arrows[i], { label: filter ? "name" : "k: v" }).then(function () { t.show(outs[i]); t.mark(outs[i], "ok"); });
          }
        };
      });
      steps.push({
        caption: filter
          ? "Done. The new list has " + kept.length + " item" + (kept.length === 1 ? "" : "s") + ": <code>[" + kept.map(function (c) { return "'" + c[0] + "'"; }).join(", ") + "]</code>. One line did what a loop + <code>if</code> + <code>append</code> did. Try 1000 or 5."
          : "Done: a dict with 5 keys. Now <code>price_of[\"Masala Box\"]</code> gives <code>29900</code> in one step, no loop needed.",
        run: function (t) { items.forEach(function (b, j) { t.unmark(b); t.mark(b, !filter || CATALOG[j][1] < limit ? "ok" : "dim"); }); arrows.forEach(function (a) { t.unmark(a); }); }
      });
      return steps;
    }
  });
})();
