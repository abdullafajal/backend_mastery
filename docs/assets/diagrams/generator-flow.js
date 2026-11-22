/* generator-flow — Module 5, Lesson 5.
 * Situation "list": a list comprehension builds ALL orders in memory first, then the loop walks them.
 * Situation "gen": a generator makes ONE order, pauses at yield, the loop uses it, then asks for the next.
 * Memory holds 5 orders vs 1. (Real numbers from the lab: a 1,000,000-item list is 8,448,728 bytes; the generator 200.) */
(function () {
  var ORDERS = ["#1 Priya · Shoes", "#2 Ravi · Bottle", "#5 Asha · Earbuds", "#6 Asha · Bottle", "#7 John · Masala"];   // the first 5 PAID orders of the lab's real log

  DiagramKit.register("generator-flow", {
    title: "A list vs a generator",
    intro: "Pick one, then press <b>Play</b>. Watch the MEMORY box.",
    state: { sit: "gen" },
    size: function (narrow) { return narrow ? [360, 400] : [840, 300]; },
    controls: function (ui, state, api) {
      ui.select({ label: "Build the orders as:", value: state.sit,
        options: [{ value: "list", label: "a list  [ … for … ]" }, { value: "gen", label: "a generator  ( … yield … )" }],
        onChange: function (v) { state.sit = v; api.reset(); } });
    },
    scene: function (s, state) {
      var n = s.narrow, gen = state.sit === "gen", prod, cons, items = [];
      if (n) {
        prod = s.box({ x: 6, y: 10, w: 166, h: 70, label: gen ? "paid_only(…)" : "[o for o in …]", sub: gen ? "a generator" : "a list" });
        cons = s.box({ x: 188, y: 10, w: 166, h: 70, label: "for order in …", sub: "the loop" });
        s.zone(6, 110, 348, 280, "MEMORY");
        ORDERS.forEach(function (o, i) { items.push(s.box({ x: 20, y: 140 + i * 48, w: 320, h: 40, label: o, sub: "", hidden: true })); });
      } else {
        prod = s.box({ x: 20, y: 20, w: 260, h: 80, label: gen ? "paid_only(parse(read_lines(…)))" : "[o for o in parse(…) if …]", sub: gen ? "a generator: one order at a time" : "a list: all orders at once" });
        cons = s.box({ x: 580, y: 20, w: 240, h: 80, label: "for order in …:", sub: "count += 1; total += …" });
        s.zone(20, 140, 800, 140, "MEMORY");
        ORDERS.forEach(function (o, i) { items.push(s.box({ x: 36 + i * 156, y: 190, w: 144, h: 56, label: o.split(" · ")[0], sub: o.split(" · ")[1], hidden: true })); });
      }
      var flow = s.arrow(prod, cons, { dir: "h", label: n ? "" : (gen ? "next()" : "") });

      if (!gen) {
        var steps = [{
          caption: "The list comprehension runs <b>to the end first</b>: every order is built and kept in memory before the loop even starts. With 200,000 orders, that's 200,000 dicts at once.",
          run: function (t) { t.mark(prod, "active"); items.forEach(function (b) { t.show(b); t.mark(b, "active"); }); t.sub(prod, "built 5 of 5 (all of them)"); }
        }];
        ORDERS.forEach(function (o, i) {
          steps.push({ caption: "The loop takes order " + (i + 1) + " from the finished list. All " + ORDERS.length + " are still in memory." + (i === ORDERS.length - 1 ? " (A 1,000,000-item list in the lab: 8,448,728 bytes.)" : ""),
            run: function (t) { t.unmark(prod); items.forEach(function (b, j) { t.unmark(b); t.mark(b, j === i ? "ok" : "dim"); }); t.mark(cons, "active"); t.sub(cons, "order " + (i + 1)); } });
        });
        return steps;
      }

      return ORDERS.map(function (o, i) {
        return {
          caption: i === 0
            ? "The loop asks for the first order: <code>next()</code>. The generator runs <b>until its first <code>yield</code></b>, hands over one order, and <b>pauses</b> right there."
            : (i === ORDERS.length - 1
              ? "And so on, to the last line. At any moment only <b>one</b> order is in memory: a generator for 1,000,000 orders is 200 bytes in the lab."
              : "The loop asks again. The generator <b>carries on from where it paused</b>, makes the next order, yields it, and pauses again. The previous order is already gone from memory."),
          run: function (t) {
            items.forEach(function (b, j) { if (j === i) { t.show(b); t.unmark(b); t.mark(b, "ok"); } else t.hide(b); });
            t.mark(prod, "active"); t.sub(prod, "paused at yield (order " + (i + 1) + ")");
            t.mark(flow, "active");
            return t.packet(flow, { label: "1" }).then(function () { t.mark(cons, "active"); t.sub(cons, "order " + (i + 1)); });
          }
        };
      });
    }
  });
})();
