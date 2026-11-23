/* big-o — Module 6, Lesson 1.
 * Type n (how many items: products, orders). See how many steps each kind of algorithm needs, and how long that takes
 * at 1 microsecond per step. Bars use a log scale (each tick = 10× more), or O(n²) would push everything else off the screen. */
(function () {
  var CLASSES = [
    ["O(1)", "set / dict lookup", function () { return 1; }],
    ["O(log n)", "binary search", function (n) { return Math.max(1, Math.ceil(Math.log2(n))); }],
    ["O(n)", "check every item", function (n) { return n; }],
    ["O(n log n)", "a good sort", function (n) { return n * Math.max(1, Math.ceil(Math.log2(n))); }],
    ["O(n²)", "every item × every item", function (n) { return n * n; }]
  ];
  function fmt(x) { return Math.round(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function human(steps) {                                   // at 1 µs per step
    var s = steps / 1e6;
    if (s < 0.001) return fmt(steps) + " µs";
    if (s < 1) return (s * 1000).toFixed(s < 0.01 ? 2 : 0) + " ms";
    if (s < 120) return s.toFixed(s < 10 ? 1 : 0) + " s";
    if (s < 7200) return (s / 60).toFixed(0) + " minutes";
    if (s < 172800) return (s / 3600).toFixed(1) + " hours";
    if (s < 63072000) return (s / 86400).toFixed(1) + " days";
    return (s / 31536000).toFixed(0) + " years";
  }

  DiagramKit.register("big-o", {
    title: "How the work grows with n",
    intro: "Type n (how many products or orders), then press <b>Play</b>. Each step is counted at 1 µs.",
    state: { n: 1000000 },
    size: function (narrow) { return narrow ? [360, 330] : [840, 320]; },
    controls: function (ui, state, api) {
      var inp = ui.input({ label: "n =", type: "number", value: state.n, min: 1, width: "9rem",
        onChange: function (v) { var x = Math.floor(Number(v)); state.n = isFinite(x) && x >= 1 ? Math.min(x, 100000000) : 1; inp.value = state.n; api.reset(); } });
    },
    scene: function (s, state) {
      var n = s.narrow, N = state.n, labels = [], bars = [];
      var X = n ? 96 : 220, W = n ? 258 : 600, maxLog = 16;          // the bar area; log10 up to 10^16 steps
      CLASSES.forEach(function (c, i) {
        var y = (n ? 12 : 16) + i * (n ? 62 : 58), h = n ? 52 : 48, steps = c[2](N);
        var w = Math.max(n ? 120 : 150, Math.min(W, (Math.log10(steps) + 1) / maxLog * W));
        labels.push(s.box({ x: n ? 4 : 20, y: y, w: n ? 88 : 190, h: h, label: c[0], sub: n ? "" : c[1] }));
        bars.push(s.box({ x: X, y: y, w: w, h: h, label: fmt(steps) + (steps === 1 ? " step" : " steps"), sub: "≈ " + human(steps), hidden: true }));
      });
      var steps = CLASSES.map(function (c, i) {
        var st = c[2](N);
        return {
          caption: "<b>" + c[0] + "</b> (" + c[1] + "): for n = " + fmt(N) + ", about <b>" + fmt(st) + "</b> steps, ≈ " + human(st) + "." +
            [" It doesn't grow at all: a set or dict finds an item in one jump, whether there are 10 or 10 million.",
             " Each step halves what's left, so even huge n needs only a few steps. Needs sorted data.",
             " Twice the items, twice the work. Checking <code>x in a_list</code> is this.",
             " Just a bit more than O(n). Python's <code>sorted()</code> is this.",
             " Every item compared with every other: a loop inside a loop. Fine for 100, a disaster for a million."][i],
          run: function (t) { labels.forEach(function (b) { t.unmark(b); }); t.show(bars[i]); t.mark(bars[i], i >= 4 && N >= 10000 ? "bad" : (i <= 1 ? "ok" : "active")); t.mark(labels[i], "active"); }
        };
      });
      steps.push({ caption: "Same n, wildly different costs. The <b>shape of the growth</b> is what Big-O describes, not the exact time. Try n = 100, then 1,000,000.",
        run: function (t) { labels.forEach(function (b) { t.unmark(b); }); } });
      return steps;
    }
  });
})();
