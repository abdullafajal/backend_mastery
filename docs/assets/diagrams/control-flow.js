/* control-flow — Module 4, Lesson 2.
 * Situation "decision": type a cart total, watch the if/else pick a path (free delivery from ₹999).
 * Situation "loop": a for loop walks Ravi's cart; the total grows 0 → 649 → 1,247 → 1,596. */
(function () {
  var CART = [["Cotton Kurta", 64900, 1], ["Masala Box", 29900, 2], ["Steel Water Bottle", 34900, 1]];
  function rs(p) { return "₹" + String(Math.floor(p / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }   // like Python's {:,}

  DiagramKit.register("control-flow", {
    title: "How Python decides and repeats",
    intro: "Pick a situation, then press <b>Play</b>. In <b>if / else</b>, type any cart total.",
    state: { sit: "decision", rupees: 999 },
    size: function (narrow) { return narrow ? [360, 360] : [840, 300]; },
    controls: function (ui, state, api) {
      var inp;
      ui.select({ label: "Situation:", value: state.sit,
        options: [{ value: "decision", label: "if / else: free delivery?" }, { value: "loop", label: "for: add up Ravi's cart" }],
        onChange: function (v) { state.sit = v; inp.parentNode.style.display = v === "decision" ? "" : "none"; api.reset(); } });
      inp = ui.input({ label: "Cart total ₹", type: "number", value: state.rupees, min: 0, width: "7rem",
        onChange: function (v) { var r = Math.floor(Number(v)); state.rupees = isFinite(r) && r >= 0 ? Math.min(r, 9999999) : 0; inp.value = state.rupees; api.reset(); } });
      if (state.sit !== "decision") inp.parentNode.style.display = "none";
    },
    scene: function (s, state) {
      var n = s.narrow;
      if (state.sit === "loop") {
        var items = CART.map(function (c, i) {
          var lbl = c[0] + " x" + c[2];
          return n ? s.box({ x: 8, y: 20 + i * 90, w: 196, h: 60, label: lbl, sub: rs(c[1] * c[2]) })   // phones: items left, total right
                   : s.box({ x: 20 + i * 280, y: 30, w: 240, h: 64, label: lbl, sub: rs(c[1] * c[2]) });
        });
        var tot = n ? s.box({ x: 222, y: 108, w: 132, h: 76, label: "total = 0", sub: "starts at zero" })
                    : s.box({ x: 300, y: 190, w: 240, h: 70, label: "total = 0", sub: "starts at zero" });
        var adds = items.map(function (b) { return s.arrow(b, tot, { dashed: true, hidden: true, dir: n ? "h" : "v" }); });   // never through another item
        var steps = [], running = 0;
        CART.forEach(function (c, i) {
          var line = c[1] * c[2], before = running; running += line;
          var after = running;
          steps.push({
            caption: "Round " + (i + 1) + ": <code>name, price, quantity</code> = <code>\"" + c[0] + "\", " + c[1] + ", " + c[2] + "</code>. " +
                     "<code>total += price * quantity</code>: " + rs(before) + " + " + rs(line) + " = <b>" + rs(after) + "</b>.",
            run: function (t) {
              items.forEach(function (b, j) { t.unmark(b); if (j < i) t.mark(b, "ok"); });
              adds.forEach(function (a) { t.hide(a); });
              t.mark(items[i], "active"); t.show(adds[i]); t.mark(adds[i], "active");
              return t.packet(adds[i], { label: "+" }).then(function () { t.label(tot, "total = " + rs(after)); t.sub(tot, "after " + (i + 1) + " of 3 items"); t.mark(tot, "active"); });
            }
          });
        });
        steps.push({ caption: "No items left, so the loop ends by itself. The code <b>after</b> the loop runs once: <code>Total ₹1,596</code>. (If you wrote <code>total = …</code> instead of <code>total += …</code>, you'd get only the last item, ₹349.)",
          run: function (t) { items.forEach(function (b) { t.unmark(b); t.mark(b, "ok"); }); adds.forEach(function (a) { t.hide(a); }); t.unmark(tot); t.mark(tot, "ok"); t.sub(tot, "printed: Total ₹1,596"); } });
        return steps;
      }

      var paise = state.rupees * 100, free = paise >= 99900;
      var start, q, yes, no;
      if (n) {
        start = s.box({ x: 70, y: 10, w: 220, h: 56, label: "cart_total = " + paise, sub: rs(paise) + " in paise" });
        q = s.box({ x: 50, y: 110, w: 260, h: 70, label: "cart_total >= 99900 ?", sub: "the if line" });
        yes = s.box({ x: 6, y: 250, w: 166, h: 64, label: "delivery: free", sub: "the if block" });
        no = s.box({ x: 188, y: 250, w: 166, h: 64, label: "delivery: ₹49", sub: "the else block" });
      } else {
        start = s.box({ x: 20, y: 115, w: 200, h: 70, label: "cart_total = " + paise, sub: rs(paise) + " in paise" });
        q = s.box({ x: 290, y: 110, w: 250, h: 80, label: "cart_total >= 99900 ?", sub: "the if line" });
        yes = s.box({ x: 610, y: 30, w: 210, h: 64, label: "delivery: free", sub: "the if block" });
        no = s.box({ x: 610, y: 206, w: 210, h: 64, label: "delivery: ₹49", sub: "the else block" });
      }
      var a0 = s.arrow(start, q, { dir: n ? "v" : "h" });
      var aY = s.arrow(q, yes, { dir: n ? "v" : "h", label: "True" });
      var aN = s.arrow(q, no, { dir: n ? "v" : "h", label: "False" });
      var pick = free ? yes : no, other = free ? no : yes, arrow = free ? aY : aN;
      return [
        { caption: "The cart total is " + rs(paise) + ", stored as <code>" + paise + "</code> paise.",
          run: function (t) { t.mark(start, "active"); } },
        { caption: "Python checks the condition: <code>" + paise + " >= 99900</code> is <b>" + (free ? "True" : "False") + "</b>." +
                   (paise === 99900 ? " Exactly ₹999 counts, because of <code>>=</code>. With <code>></code> it would be False: a classic boundary bug." : ""),
          run: function (t) { t.unmark(start); t.mark(a0, "active"); return t.packet(a0, { label: paise >= 99900 ? "✓" : "✗" }).then(function () { t.mark(q, "active"); t.sub(q, paise + " >= 99900 → " + (free ? "True" : "False")); }); } },
        { caption: free ? "True, so Python runs the <b>indented block under <code>if</code></b> and skips the <code>else</code> block completely." : "False, so Python skips the <code>if</code> block and runs the <b>indented block under <code>else</code></b>.",
          run: function (t) { t.unmark(q); t.unmark(a0); t.mark(arrow, "active"); return t.packet(arrow, { label: "→" }).then(function () { t.mark(pick, "ok"); t.mark(other, "dim"); }); } },
        { caption: "Exactly <b>one</b> of the two blocks ran. Then Python continues with the first line after the whole <code>if / else</code>. Try another total: 998, 999, 1499.",
          run: function (t) { t.unmark(arrow); } }
      ];
    }
  });
})();
