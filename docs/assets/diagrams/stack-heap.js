/* stack-heap — Module 1, Lesson 3.
 * Left: the call stack (frames, newest on top). Right: the heap (objects).
 * Arrows: a name in a frame points to an object on the heap.
 * Situations: a normal checkout, a memory leak, and recursion that goes too deep. */
DiagramKit.register("stack-heap", {
  title: "The call stack and the heap",
  intro: "Pick a situation, then press <b>Play</b>. Frames appear on the <b>stack</b> when a function is called; objects live on the <b>heap</b>.",
  state: { situation: "normal" },

  size: function (narrow) { return narrow ? [360, 620] : [840, 430]; },

  controls: function (ui, state, api) {
    ui.select({
      label: "Situation:",
      value: state.situation,
      options: [
        { value: "normal", label: "A normal checkout" },
        { value: "leak", label: "A memory leak" },
        { value: "deep", label: "Recursion too deep" }
      ],
      onChange: function (v) { state.situation = v; api.reset(); }
    });
  },

  scene: function (s, state) {
    var n = s.narrow;
    // layout numbers for the two columns
    var L = n ? { sx: 14, sw: 158, hx: 190, hw: 158, fh: 50, gap: 62, bottom: 548, top0: 40 }
              : { sx: 34, sw: 300, hx: 430, hw: 380, fh: 54, gap: 70, bottom: 350, top0: 40 };
    s.zone(n ? 6 : 14, 10, n ? 172 : 340, n ? 600 : 410, n ? "STACK" : "STACK · newest frame on top");
    s.zone(n ? 182 : 380, 10, n ? 172 : 446, n ? 600 : 410, n ? "HEAP" : "HEAP · all objects");

    function frame(level, label, sub) {
      return s.box({ x: L.sx, y: L.bottom - level * L.gap, w: L.sw, h: L.fh, label: label, sub: sub, hidden: true });
    }
    function obj(row, label, sub, hidden) {
      var y = n ? 60 + row * 140 : 50 + row * 120;
      return s.box({ x: L.hx, y: y, w: L.hw, h: L.fh + 6, label: label, sub: sub, hidden: hidden });
    }
    function link(a, b) { return s.arrow(a, b, { dir: "h", hidden: true }); }
    function on(t, list) { list.forEach(function (x) { t.show(x); }); }

    if (state.situation === "normal") {
      var fMain = frame(0, "main program", "cart"),
          fCheck = frame(1, "checkout()", "cart"),
          fTotal = frame(2, "total()", "items"),
          fPrice = frame(3, "price_of()", "prices");
      var oCart = obj(0, "list", "['Masala Box', 'Cotton Kurta']", true),
          oPrices = obj(1, "dict", "{'Masala Box': 299, ...}", true),
          oTotal = obj(2, "int", "948", true);
      var a1 = link(fMain, oCart), a2 = link(fCheck, oCart), a3 = link(fTotal, oCart), a4 = link(fPrice, oPrices);
      return [
        { caption: "The program starts. Its first frame holds the name <code>cart</code>. The list itself is an <b>object on the heap</b>; the name only <b>points</b> to it.",
          run: function (t) { on(t, [fMain, oCart, a1]); t.mark(fMain, "active"); } },
        { caption: "<code>checkout(cart)</code> is called. A new <b>frame</b> is pushed on top of the stack. Its own name <code>cart</code> points to the <b>same</b> list. Nothing is copied.",
          run: function (t) { t.unmark(fMain); on(t, [fCheck, a2]); t.mark(fCheck, "active"); t.mark(a2, "active"); } },
        { caption: "<code>total(items)</code> is called: one more frame. Now three names in three frames point to one list. Its <b>reference count</b> is 3.",
          run: function (t) { t.unmark(fCheck); t.unmark(a2); on(t, [fTotal, a3]); t.mark(fTotal, "active"); t.mark(a3, "active"); t.sub(oCart, "3 references"); } },
        { caption: "<code>price_of()</code> is called. It creates a <code>prices</code> dict: a <b>new object</b> on the heap, pointed to only by this frame.",
          run: function (t) { t.unmark(fTotal); t.unmark(a3); on(t, [fPrice, oPrices, a4]); t.mark(fPrice, "active"); t.mark(oPrices, "active"); } },
        { caption: "<code>price_of()</code> returns 299 and its frame is <b>popped</b>. No name points to the dict any more (0 references), so Python <b>frees</b> it at once.",
          run: function (t) { t.hide(fPrice); t.hide(a4); t.unmark(oPrices); t.mark(oPrices, "dim"); t.sub(oPrices, "freed: 0 references"); } },
        { caption: "<code>total()</code> returns <b>948</b> (a new int object) and its frame is popped too. The list now has 2 references.",
          run: function (t) { t.hide(fTotal); t.hide(a3); t.hide(oPrices); on(t, [oTotal]); t.mark(oTotal, "ok"); t.sub(oCart, "2 references"); } },
        { caption: "<code>checkout()</code> returns, and its frame is popped. The list is <b>not</b> freed: the main program's <code>cart</code> still points to it. The stack cleans itself; the heap is cleaned by <b>reference counting</b>.",
          run: function (t) { t.hide(fCheck); t.hide(a2); t.sub(oCart, "1 reference: kept"); t.mark(oCart, "ok"); t.mark(fMain, "active"); } }
      ];
    }

    if (state.situation === "leak") {
      var gMain = frame(0, "main program", "PRICE_CACHE (global)"),
          fReq = frame(1, "price_leaky()", "key, request 1");
      var oCache = obj(0, "dict PRICE_CACHE", "0 entries", false),
          oEntry = obj(1, "price entry", "request 1", true),
          oMore = obj(2, "149,999 more entries", "never freed", true);
      oCache.g.style.display = "none";
      var c1 = link(gMain, oCache), c2 = link(fReq, oEntry);
      var cacheToEntry = s.arrow(oCache, oEntry, { hidden: true }), cacheToMore = s.arrow(oEntry, oMore, { hidden: true, dashed: true });
      return [
        { caption: "Bazaar's price service keeps a <b>global</b> cache dict. Globals live in the main program's frame, which is never popped while the program runs.",
          run: function (t) { on(t, [gMain, oCache, c1]); t.mark(gMain, "active"); } },
        { caption: "A request arrives. <code>price_leaky()</code> gets a frame and builds a price entry. The key includes the <b>request id</b>, which is new every time.",
          run: function (t) { t.unmark(gMain); on(t, [fReq, oEntry, c2]); t.mark(fReq, "active"); t.mark(c2, "active"); } },
        { caption: "The entry is stored in the cache. Now <b>two</b> things point to it: the frame and the cache.",
          run: function (t) { t.unmark(c2); on(t, [cacheToEntry]); t.mark(cacheToEntry, "active"); t.sub(oCache, "1 entry"); } },
        { caption: "The request ends and its frame is popped. But the cache still points to the entry, so it is <b>never freed</b>. Python did nothing wrong: <b>we</b> kept a reference.",
          run: function (t) { t.hide(fReq); t.hide(c2); t.unmark(cacheToEntry); t.mark(oEntry, "bad"); t.sub(oEntry, "request 1: kept forever"); } },
        { caption: "150,000 requests later the cache holds 150,000 entries that nobody will ever read again. RAM grows and grows. This is a <b>memory leak</b>.",
          run: function (t) { on(t, [oMore, cacheToMore]); t.mark(oMore, "bad"); t.mark(oCache, "bad"); t.sub(oCache, "150,000 entries · 64 MB"); } },
        { caption: "The container has a 64 MB limit. The kernel's <b>OOM killer</b> ends the process with SIGKILL: <b>exit code 137</b>. Fix: a bounded cache (<code>lru_cache(maxsize=1000)</code>) that forgets old entries.",
          run: function (t) { t.mark(gMain, "bad"); t.sub(gMain, "killed: exit 137"); } }
      ];
    }

    // deep recursion
    var frames = [0, 1, 2, 3, 4].map(function (i) {
      return frame(i, i === 4 ? "… 1,000 frames …" : "depth_recursive()", i === 4 ? "limit reached" : "node = level " + i);
    });
    var oTree = obj(0, "category tree", "5,000 levels deep", false);
    var tArrows = frames.slice(0, 4).map(function (f) { return link(f, oTree); });
    var steps = [];
    [0, 1, 2, 3].forEach(function (i) {
      steps.push({
        caption: i === 0
          ? "<code>depth_recursive(tree)</code> starts at level 0 of Bazaar's category tree. One frame."
          : "It calls itself for level " + i + ". Every call adds a <b>new frame</b>, and none can be popped until the deepest call returns.",
        run: function (t) {
          // show only the newest frame's arrow: each frame points at a different level of the tree
          if (i > 0) { t.unmark(frames[i - 1]); t.hide(tArrows[i - 1]); }
          t.show(frames[i]); t.show(tArrows[i]); t.mark(frames[i], "active"); t.mark(tArrows[i], "active");
        }
      });
    });
    steps.push({
      caption: "The tree is 5,000 levels deep, but Python allows about 1,000 frames. It stops with <code>RecursionError: maximum recursion depth exceeded</code>. Fix: a <b>loop</b>, which reuses one frame.",
      run: function (t) { t.unmark(frames[3]); t.hide(tArrows[3]); t.show(frames[4]); t.mark(frames[4], "bad"); }
    });
    return steps;
  }
});
