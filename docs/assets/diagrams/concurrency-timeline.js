/* concurrency-timeline — Module 5, Lesson 7.
 * Time runs left to right. Situation "wait": 4 supplier calls that mostly WAIT; one by one they add up, in threads they overlap.
 * Situation "cpu": 4 chunks of prime counting; threads take turns because of the GIL, processes really run at the same time.
 * Times are from a real run of the lab (10 suppliers: 2.0 s vs 0.2 s; primes: 1.3 s / 1.3 s / 0.5 s on 8 cores). */
(function () {
  var NAMES = ["Patel", "Meera", "Kumar", "Sharma"];

  DiagramKit.register("concurrency-timeline", {
    title: "One by one, threads, processes",
    intro: "Pick the kind of work, then press <b>Play</b>. Time runs from left to right.",
    state: { sit: "wait" },
    size: function (narrow) { return narrow ? [360, 340] : [840, 350]; },
    controls: function (ui, state, api) {
      ui.select({ label: "Work:", value: state.sit,
        options: [{ value: "wait", label: "Waiting (asking suppliers)" }, { value: "cpu", label: "Computing (counting primes)" }],
        onChange: function (v) { state.sit = v; api.reset(); } });
    },
    scene: function (s, state) {
      var n = s.narrow, cpu = state.sit === "cpu";
      var X0 = n ? 96 : 170, U = n ? 64 : 160, H = n ? 30 : 34;       // where time 0 is, and the width of one task
      var rowA = n ? 20 : 24, rowB = n ? 110 : 110;
      function lbl(y, h, text, sub) { return s.box({ x: n ? 4 : 10, y: y, w: n ? 86 : 150, h: h, label: text, sub: sub }); }
      var A = lbl(rowA, H, "one by one", "");
      var B = cpu ? lbl(rowB, H, "4 threads", "") : lbl(rowB, 4 * (H + 8) - 8, "4 threads", "");
      var seq = NAMES.map(function (nm, i) { return s.box({ x: X0 + i * U, y: rowA, w: U - 6, h: H, label: n ? nm[0] : nm, sub: "", hidden: true }); });
      var par = [], gil = [];
      if (!cpu) {
        par = NAMES.map(function (nm, i) { return s.box({ x: X0, y: rowB + i * (H + 8), w: U - 6, h: H, label: n ? nm[0] : nm, sub: "", hidden: true }); });
      } else {
        for (var k = 0; k < 8; k++) gil.push(s.box({ x: X0 + k * U / 2, y: rowB, w: U / 2 - 4, h: H, label: "T" + (k % 4 + 1), sub: "", hidden: true }));   // one row: they take turns
      }
      var rowC = rowB + H + 30, C = null, proc = [];
      if (cpu) {
        C = s.box({ x: n ? 4 : 10, y: rowC, w: n ? 86 : 150, h: 4 * (H + 8) - 8, label: "4 processes", sub: n ? "" : "own Python each", hidden: true });
        proc = NAMES.map(function (nm, i) { return s.box({ x: X0, y: rowC + i * (H + 8), w: U - 6, h: H, label: "P" + (i + 1), sub: "", hidden: true }); });
      }

      if (!cpu) {
        return [
          { caption: "<b>One by one:</b> ask the first supplier, wait for the answer, then ask the next. The waits add up: 4 × 0.2 s = 0.8 s. (10 suppliers in the lab: <code>one by one: 2.0 s</code>.)",
            run: function (t) { seq.forEach(function (b) { t.show(b); t.mark(b, "active"); }); t.mark(A, "active"); } },
          { caption: "<b>Threads:</b> start all 4 requests, then wait. While one thread waits for its supplier, the others are waiting too, <b>at the same time</b>. Total ≈ one wait. (Lab: <code>10 threads: 0.2 s</code>.)",
            run: function (t) { t.unmark(A); seq.forEach(function (b) { t.unmark(b); t.mark(b, "dim"); }); par.forEach(function (b) { t.show(b); t.mark(b, "ok"); }); t.mark(B, "ok"); } },
          { caption: "Waiting doesn't use the CPU, so threads are perfect for it: network calls, database queries, reading files. That's most of what a backend does.",
            run: function (t) { t.sub(B, n ? "together" : "all waiting together"); } }
        ];
      }
      return [
        { caption: "<b>One by one:</b> 4 chunks of prime counting, each keeping a CPU core 100% busy. Lab: <code>one by one 1.3 s</code>.",
          run: function (t) { seq.forEach(function (b, i) { t.show(b); t.label(b, "C" + (i + 1)); t.mark(b, "active"); }); t.mark(A, "active"); } },
        { caption: "<b>4 threads:</b> Python's <b>GIL</b> lets only one thread run Python code at a time. The threads just take turns: T1, T2, T3, T4, T1, … Same total. Lab: <code>4 threads 1.3 s</code>.",
          run: function (t) { t.unmark(A); seq.forEach(function (b) { t.unmark(b); t.mark(b, "dim"); }); gil.forEach(function (b) { t.show(b); t.mark(b, "bad"); }); t.mark(B, "bad"); } },
        { caption: "<b>4 processes:</b> each is a separate Python, with its own GIL, on its own CPU core. They really run at the same time. Lab: <code>4 processes 0.5 s</code> (on 8 cores).",
          run: function (t) { t.unmark(B); t.show(C); proc.forEach(function (b) { t.show(b); t.mark(b, "ok"); }); t.mark(C, "ok"); } }
      ];
    }
  });
})();
