/* class-objects — Module 5, Lesson 1.
 * Situation "blueprint": class Product is a blueprint; Product(...) makes objects with their own data;
 *   masala.sell(2) runs the class's method with self = masala, so only masala's stock changes.
 * Situation "shared": lines = [] written on the class is ONE list shared by every Cart (the lab's bug);
 *   self.lines = [] in __init__ gives each cart its own. */
(function () {
  DiagramKit.register("class-objects", {
    title: "Classes and objects",
    intro: "Pick a situation, then press <b>Play</b>.",
    state: { sit: "blueprint" },
    size: function (narrow) { return narrow ? [360, 420] : [840, 320]; },
    controls: function (ui, state, api) {
      ui.select({ label: "Situation:", value: state.sit,
        options: [{ value: "blueprint", label: "One class, many objects" }, { value: "shared", label: "A list on the class (the bug)" }],
        onChange: function (v) { state.sit = v; api.reset(); } });
    },
    scene: function (s, state) {
      var n = s.narrow, shared = state.sit === "shared";
      var cls, a, b, c, d;
      if (n) {
        cls = s.box({ x: 60, y: 10, w: 240, h: 70, label: shared ? "class Cart" : "class Product", sub: shared ? "lines = [ ] on the class" : "__init__, price_text, sell" });
        a = s.box({ x: 6, y: 150, w: 166, h: 64, label: shared ? "asha" : "masala", sub: "", hidden: true });
        b = s.box({ x: 188, y: 150, w: 166, h: 64, label: shared ? "ravi" : "earbuds", sub: "", hidden: true });
        c = s.box({ x: shared ? 6 : 60, y: 300, w: shared ? 166 : 240, h: 70, label: shared ? "one list" : "masala.sell(2)", sub: "", hidden: true });   // shared: left half, so the fix can add a second list beside it
        d = s.box({ x: 188, y: 300, w: 166, h: 70, label: "ravi's own list", sub: "", hidden: true });
      } else {
        cls = s.box({ x: 20, y: 110, w: 240, h: 100, label: shared ? "class Cart" : "class Product", sub: shared ? "lines = [ ] on the class" : "blueprint: __init__, price_text, sell" });
        a = s.box({ x: 330, y: 40, w: 220, h: 72, label: shared ? "asha (a Cart)" : "masala (a Product)", sub: "", hidden: true });
        b = s.box({ x: 330, y: 208, w: 220, h: 72, label: shared ? "ravi (a Cart)" : "earbuds (a Product)", sub: "", hidden: true });
        c = s.box({ x: 610, y: shared ? 120 : 40, w: 210, h: 72, label: shared ? "one list" : "masala.sell(2)", sub: "", hidden: true });
        d = s.box({ x: 610, y: 208, w: 210, h: 72, label: "ravi's own list", sub: "", hidden: true });
      }
      var mkA = s.arrow(cls, a, { dir: n ? "v" : "h", hidden: true, label: n ? "" : "Product(…)" });
      var mkB = s.arrow(cls, b, { dir: n ? "v" : "h", hidden: true });

      if (!shared) {
        var call = s.arrow(c, a, { dir: n ? "v" : "h", hidden: true, label: n ? "" : "self" });
        return [
          { caption: "<code>class Product:</code> is a <b>blueprint</b>. It says what every product has (name, price, stock) and can do (<code>sell</code>). No product exists yet.",
            run: function (t) { t.mark(cls, "active"); } },
          { caption: "<code>masala = Product(\"Masala Box\", 29900, \"Patel Spices\", 40)</code> makes an <b>object</b>. <code>__init__</code> runs and stores the data on it with <code>self.stock = stock</code>.",
            run: function (t) { t.unmark(cls); t.show(a); t.show(mkA); t.mark(mkA, "active"); return t.packet(mkA, { label: "new" }).then(function () { t.mark(a, "ok"); t.sub(a, "Masala Box, stock 40"); }); } },
          { caption: "<code>earbuds = Product(\"Wireless Earbuds\", …, 8)</code> makes a <b>second</b> object from the same blueprint. Same shape, its own data.",
            run: function (t) { t.unmark(mkA); t.show(b); t.show(mkB); t.mark(mkB, "active"); return t.packet(mkB, { label: "new" }).then(function () { t.mark(b, "ok"); t.sub(b, "Wireless Earbuds, stock 8"); }); } },
          { caption: "<code>masala.sell(2)</code> runs the class's <code>sell</code> with <code>self</code> = <b>masala</b> (the object before the dot). Python really calls <code>Product.sell(masala, 2)</code>. Only masala's stock changes: 40 → 38.",
            run: function (t) { t.unmark(mkB); t.show(c); t.mark(c, "active"); t.show(call); t.mark(call, "active"); return t.packet(call, { label: "self" }).then(function () { t.unmark(a); t.mark(a, "active"); t.sub(a, "Masala Box, stock 38"); t.sub(c, "Product.sell(masala, 2)"); }); } }
        ];
      }

      var la = s.arrow(a, c, { dir: n ? "v" : "h", hidden: true }), lb = s.arrow(b, c, { dir: n ? "v" : "h", hidden: true });
      var lb2 = s.arrow(b, d, { dir: n ? "v" : "h", hidden: true });
      return [
        { caption: "<code>lines = []</code> is written directly inside <code>class Cart:</code>, not in <code>__init__</code>. So it belongs to the <b>class</b>: there is only <b>one</b> such list.",
          run: function (t) { t.mark(cls, "bad"); t.show(c); t.mark(c, "active"); t.sub(c, "[ ]"); } },
        { caption: "<code>asha = Cart(\"Asha\")</code> and <code>ravi = Cart(\"Ravi\")</code>: two objects. But <code>self.lines</code> finds no list on either object, so both fall back to the class's one list.",
          run: function (t) { t.unmark(c); t.show(a); t.show(b); t.show(mkA); t.show(mkB); t.mark(a, "ok"); t.mark(b, "ok"); t.show(la); t.show(lb); t.mark(la, "active"); t.mark(lb, "active"); } },
        { caption: "<code>ravi.add(\"Cotton Kurta\")</code> appends to that one list. Asha now \"has\" Ravi's kurta: <code>Asha: [('Cotton Kurta', 1), ('Masala Box', 2)]</code>. Module 4's aliasing bug, in a class.",
          run: function (t) { t.unmark(la); t.unmark(lb); t.mark(c, "bad"); t.sub(c, "Cotton Kurta, Masala Box x2"); t.mark(a, "bad"); t.sub(a, "sees Ravi's kurta!"); } },
        { caption: "The fix: <code>self.lines = []</code> <b>inside <code>__init__</code></b>. It runs once per new cart, so every cart gets its own list. Asha: Masala Box x2. Ravi: Cotton Kurta.",
          run: function (t) { t.unmark(cls); t.label(cls, "class Cart"); t.sub(cls, "self.lines = [ ] in __init__"); t.mark(cls, "ok"); t.hide(lb); t.label(c, "asha's own list"); t.unmark(c); t.mark(c, "ok"); t.sub(c, "Masala Box x2"); t.show(d); t.show(lb2); t.mark(d, "ok"); t.sub(d, "Cotton Kurta"); t.unmark(a); t.mark(a, "ok"); t.sub(a, ""); } }
      ];
    }
  });
})();
