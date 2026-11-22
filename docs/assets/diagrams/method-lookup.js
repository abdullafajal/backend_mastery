/* method-lookup — Module 5, Lesson 2.
 * Pick an object (masala, a Product; card, a GiftCard) and a method. Python looks for the method in the object's own
 * class first, then goes up to the parent class. GiftCard overrides needs_delivery; price_text and describe are inherited. */
(function () {
  var OWN = { GiftCard: ["__init__", "needs_delivery"], Product: ["__init__", "price_text", "needs_delivery", "describe"] };
  var RESULT = {
    masala: { price_text: "'₹299'", needs_delivery: "True", describe: "'Masala Box (₹299), delivered'" },
    card: { price_text: "'₹500'", needs_delivery: "False", describe: "'Bazaar Gift Card (₹500), sent by email'" }
  };

  DiagramKit.register("method-lookup", {
    title: "Where Python finds a method",
    intro: "Pick an object and a method, then press <b>Play</b>.",
    state: { obj: "card", method: "needs_delivery" },
    size: function (narrow) { return narrow ? [360, 340] : [840, 300]; },
    controls: function (ui, state, api) {
      ui.select({ label: "Object:", value: state.obj,
        options: [{ value: "card", label: "card (a GiftCard)" }, { value: "masala", label: "masala (a Product)" }],
        onChange: function (v) { state.obj = v; api.reset(); } });
      ui.select({ label: "Method:", value: state.method,
        options: ["needs_delivery", "price_text", "describe"].map(function (m) { return { value: m, label: m + "()" }; }),
        onChange: function (v) { state.method = v; api.reset(); } });
    },
    scene: function (s, state) {
      var n = s.narrow, obj = state.obj, m = state.method;
      var start = obj === "card" ? "GiftCard" : "Product";
      var prod, gift, o;
      if (n) {
        prod = s.box({ x: 36, y: 10, w: 310, h: 72, label: "class Product", sub: "__init__, price_text, needs_delivery, describe" });
        gift = s.box({ x: 36, y: 130, w: 310, h: 72, label: "class GiftCard(Product)", sub: "__init__, needs_delivery" });
        o = s.box({ x: 36, y: 260, w: 310, h: 64, label: obj + "." + m + "()", sub: obj === "card" ? "card is a GiftCard" : "masala is a Product" });
      } else {
        o = s.box({ x: 20, y: 115, w: 260, h: 70, label: obj + "." + m + "()", sub: obj === "card" ? "card is a GiftCard" : "masala is a Product" });
        prod = s.box({ x: 440, y: 20, w: 380, h: 80, label: "class Product", sub: "__init__, price_text, needs_delivery, describe" });
        gift = s.box({ x: 440, y: 200, w: 380, h: 80, label: "class GiftCard(Product)", sub: "__init__, needs_delivery" });
      }
      var up = s.arrow(gift, prod, { dir: "v", dashed: true, label: n ? "" : "parent" });
      var toGift = s.arrow(o, gift, { dir: n ? "v" : "h", hidden: obj !== "card", label: n ? "" : "look here first" });
      var toProd = n ? s.arrow({ x: 20, y: 260 }, { x: 20, y: 46 }, { hidden: obj === "card" })        // phones: up the left gutter, past GiftCard
                     : s.arrow(o, prod, { dir: "h", hidden: obj === "card", label: "look here first" });
      var box = { GiftCard: gift, Product: prod };
      var path = start === "GiftCard" && OWN.GiftCard.indexOf(m) < 0 ? ["GiftCard", "Product"] : [start];
      var found = path[path.length - 1], res = RESULT[obj][m];
      var first = start === "GiftCard" ? toGift : toProd;

      var steps = [
        { caption: "You call <code>" + obj + "." + m + "()</code>. Python starts with the object's own class: <b>" + start + "</b>.",
          run: function (t) { t.mark(o, "active"); t.mark(first, "active"); return t.packet(first, { label: "?" }).then(function () { t.mark(box[start], "active"); }); } }
      ];
      if (path.length === 2) {
        steps.push({ caption: "<code>GiftCard</code> doesn't define <code>" + m + "</code>. So Python goes <b>up to the parent class</b>, <code>Product</code>, and looks there.",
          run: function (t) { t.unmark(first); t.unmark(gift); t.mark(gift, "dim"); t.sub(gift, "no " + m + " here"); t.mark(up, "active"); return t.packet(up, { label: "↑" }).then(function () { t.mark(prod, "active"); }); } });
      }
      steps.push({
        caption: "Found in <b>" + found + "</b>" + (found === "GiftCard" ? ": GiftCard <b>overrides</b> Product's version, so Product's is never reached." : (start === "GiftCard" ? ": the gift card <b>inherits</b> it, written once in Product." : ".")) +
                 " Python runs it with <code>self</code> = <code>" + obj + "</code> and returns <code>" + res + "</code>.",
        run: function (t) { t.unmark(up); t.unmark(first); t.unmark(box[found]); t.mark(box[found], "ok"); t.sub(box[found], m + "() found here"); t.unmark(o); t.mark(o, "ok"); t.sub(o, "→ " + res); }
      });
      if (m === "describe" && obj === "card") {
        steps.push({ caption: "Inside <code>describe</code>, <code>self.needs_delivery()</code> starts the search again from <code>card</code>'s class, so it finds GiftCard's version: <code>False</code>. That's why one <code>describe</code> works for both kinds of product.",
          run: function (t) { t.unmark(gift); t.mark(gift, "active"); t.sub(gift, "needs_delivery() → False"); } });   // unmark first: it was dimmed in step 2
      }
      return steps;
    }
  });
})();
