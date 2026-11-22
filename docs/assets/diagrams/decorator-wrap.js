/* decorator-wrap — Module 5, Lesson 4 (plan: "decorator wrapping").
 * Situation "timed": @timed replaces fetch_supplier_prices with a wrapper. A call goes caller → wrapper (start the clock)
 *   → the original → wrapper (print the time) → caller.
 * Situation "retry": @retry(times=3) calls the original up to 3 times; two ConnectionErrors, then 40. Real lab output. */
(function () {
  DiagramKit.register("decorator-wrap", {
    title: "How a decorator wraps a function",
    intro: "Pick a decorator, then press <b>Play</b>.",
    state: { sit: "timed" },
    size: function (narrow) { return narrow ? [360, 400] : [840, 320]; },
    controls: function (ui, state, api) {
      ui.select({ label: "Decorator:", value: state.sit,
        options: [{ value: "timed", label: "@timed" }, { value: "retry", label: "@retry(times=3)" }],
        onChange: function (v) { state.sit = v; api.reset(); } });
    },
    scene: function (s, state) {
      var n = s.narrow, retry = state.sit === "retry";
      var fname = retry ? "fetch_stock" : "fetch_supplier_prices";
      var caller, before, orig, after;
      if (n) {
        caller = s.box({ x: 30, y: 8, w: 300, h: 56, label: retry ? "fetch_stock(\"Masala Box\")" : "fetch_supplier_prices(\"Patel Spices\")", sub: "the caller" });
        s.zone(6, 92, 348, 300, retry ? "wrapper made by @retry" : "wrapper made by @timed");
        before = s.box({ x: 24, y: 120, w: 316, h: 54, label: retry ? "for attempt in 1..3: try" : "before: start = clock", sub: "" });
        orig = s.box({ x: 24, y: 204, w: 316, h: 64, label: fname + " (the original)", sub: "unchanged" });
        after = s.box({ x: 24, y: 300, w: 316, h: 54, label: retry ? "except ConnectionError: try again" : "after: print the time", sub: "" });
      } else {
        caller = s.box({ x: 20, y: 120, w: 230, h: 76, label: retry ? "fetch_stock(\"Masala Box\")" : "fetch_supplier_prices(…)", sub: "the caller" });
        s.zone(300, 14, 526, 292, retry ? "wrapper made by @retry(times=3)" : "wrapper made by @timed");
        before = s.box({ x: 320, y: 50, w: 240, h: 60, label: retry ? "for attempt in 1..3: try" : "before: start = clock", sub: "" });
        orig = s.box({ x: 600, y: 120, w: 210, h: 76, label: fname, sub: "the original, unchanged" });
        after = s.box({ x: 320, y: 220, w: 240, h: 60, label: retry ? "except ConnectionError" : "after: print the time", sub: "" });
      }
      var call = s.arrow(caller, before, { dir: n ? "v" : "h", label: n ? "" : "call" });
      var run = s.arrow(before, orig, { dir: n ? "v" : "h" });
      var back = s.arrow(orig, after, { dir: n ? "v" : "h" });
      var ret = n ? s.arrow({ x: 14, y: 327 }, { x: 14, y: 64 }, { label: "" })           // phones: back up the left edge
                  : s.arrow(after, caller, { dir: "h", label: "return" });
      var all = [caller, before, orig, after, call, run, back, ret];
      function off(t) { all.forEach(function (x) { t.unmark(x); }); }

      if (!retry) {
        return [
          { caption: "<code>@timed</code> above <code>def fetch_supplier_prices</code> runs <b>once</b>, when the function is defined. It means <code>fetch_supplier_prices = timed(fetch_supplier_prices)</code>: the name now points to a <b>wrapper</b>, with the original kept inside.",
            run: function (t) { t.mark(orig, "active"); } },
          { caption: "The caller writes <code>fetch_supplier_prices(\"Patel Spices\")</code> as usual. It doesn't know it's really calling the wrapper.",
            run: function (t) { off(t); t.mark(caller, "active"); t.mark(call, "active"); return t.packet(call, { label: "call" }).then(function () { t.mark(before, "active"); t.sub(before, "clock started"); }); } },
          { caption: "The wrapper starts the clock, then calls the <b>original</b> with the same arguments. The original takes 0.3 s and returns <code>[21000, 23500]</code>.",
            run: function (t) { off(t); t.mark(run, "active"); return t.packet(run, { label: "args" }).then(function () { t.mark(orig, "ok"); t.sub(orig, "returns [21000, 23500]"); }); } },
          { caption: "Back in the wrapper: it stops the clock and prints <code>fetch_supplier_prices took 0.3 s</code>.",
            run: function (t) { off(t); t.mark(back, "active"); return t.packet(back, { label: "result" }).then(function () { t.mark(after, "active"); t.sub(after, "took 0.3 s"); }); } },
          { caption: "Finally the wrapper <b>returns the original's result</b> to the caller. Forget that <code>return</code>, and every call gives back <code>None</code> (the lab's exercise).",
            run: function (t) { off(t); t.mark(ret, "active"); return t.packet(ret, { label: "[…]" }).then(function () { t.mark(caller, "ok"); t.sub(caller, "got [21000, 23500]"); }); } }
        ];
      }

      function attempt(k, fail) {
        return { caption: fail ? "Attempt " + k + ": the wrapper calls the original. The supplier's server is busy: <code>ConnectionError</code>. The wrapper <b>catches</b> it and prints <code>attempt " + k + " failed: supplier busy</code>."
                               : "Attempt 3: this time the supplier answers. The original returns <code>40</code>.",
          run: function (t) { off(t); t.sub(before, "attempt " + k); t.mark(before, "active"); t.mark(run, "active");
            return t.packet(run, { label: "try " + k }).then(function () {
              if (fail) { t.mark(orig, "bad"); t.sub(orig, "ConnectionError!"); t.mark(back, "active"); return t.packet(back, { label: "!" }).then(function () { t.mark(after, "active"); t.sub(after, "attempt " + k + " failed"); }); }
              t.mark(orig, "ok"); t.sub(orig, "returns 40");
            }); } };
      }
      return [
        { caption: "<code>@retry(times=3)</code> first runs <code>retry(times=3)</code>, which <b>builds</b> a decorator remembering 3, then wraps <code>fetch_stock</code> with it.",
          run: function (t) { t.mark(orig, "active"); } },
        { caption: "The caller asks for the Masala Box stock. The call goes into the wrapper.",
          run: function (t) { off(t); t.mark(caller, "active"); t.mark(call, "active"); return t.packet(call, { label: "call" }); } },
        attempt(1, true), attempt(2, true), attempt(3, false),
        { caption: "The wrapper returns <code>40</code> to the caller: <code>stock: 40</code>. The caller never saw the two failures. (After 3 failures, it would raise <code>ConnectionError: gave up after 3 attempts</code>.)",
          run: function (t) { off(t); t.mark(orig, "ok"); t.mark(ret, "active"); return t.packet(ret, { label: "40" }).then(function () { t.mark(caller, "ok"); t.sub(caller, "stock: 40"); }); } }
      ];
    }
  });
})();
