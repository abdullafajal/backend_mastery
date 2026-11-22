/* name-tags — Module 4 (plan: "how variables point to objects in memory").
 * Left: names (variables). Right: objects in memory, each with its type. Each step runs one line of Python.
 * Situation "rebind": price = 999; old_price = price; price = 899 (the name moves, the old object stays).
 * Situation "types": Bazaar values of five types, and int("3") making a NEW object.
 * Situation "list" (Lesson 4, data-state-sit="list"): two names for one list; .append() changes the object itself,
 *   so both names see it; .copy() makes a second list. Steps may relabel an object with labels: {index: [label, sub]}. */
(function () {
  var SITS = {
    rebind: {
      label: "Assigning again: price = 899",
      names: ["old_price", "price"],          // old_price on top, so the final picture has no crossing arrows
      objects: [["999", "int"], ["899", "int"]],
      steps: [
        { line: "price = 999", show: [[1, 0]], cap: "Python makes an <b>object</b>, the number 999 (type <code>int</code>), and sticks the name <code>price</code> on it." },
        { line: "old_price = price", show: [[1, 0], [0, 0]], cap: "No copy is made. <code>old_price</code> is a <b>second name for the same object</b>." },
        { line: "price = 899", show: [[1, 1], [0, 0]], cap: "Diwali! A new object, 899. The name <code>price</code> <b>moves</b> to it. The 999 object didn't change: <code>old_price</code> still points to it." },
        { line: "print(price, old_price)", show: [[1, 1], [0, 0]], out: "899 999", cap: "Prints <code>899 999</code>. <code>=</code> never changes an object; it only moves a name. (Numbers and text can't be changed at all.)" }
      ]
    },
    types: {
      label: "Bazaar's values and their types",
      names: ["name", "price_paise", "in_stock", "quantity_text", "quantity"],
      objects: [["'Masala Box'", "str"], ["29900", "int"], ["True", "bool"], ["'3'", "str"], ["3", "int"]],
      steps: [
        { line: "name = \"Masala Box\"", show: [[0, 0]], cap: "Text in quotes is a <code>str</code> (string)." },
        { line: "price_paise = 29900", show: [[0, 0], [1, 1]], cap: "A whole number is an <code>int</code>. Bazaar keeps money as int paise: ₹299 = 29900 paise." },
        { line: "in_stock = True", show: [[0, 0], [1, 1], [2, 2]], cap: "<code>True</code> or <code>False</code> is a <code>bool</code>: a yes/no value." },
        { line: "quantity_text = \"3\"", show: [[0, 0], [1, 1], [2, 2], [3, 3]], cap: "What a customer types is <b>always text</b>: <code>\"3\"</code> is a <code>str</code>, not a number. <code>\"3\" * 3</code> gives <code>333</code>!" },
        { line: "quantity = int(quantity_text)", show: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4]], cap: "<code>int()</code> makes a <b>new</b> object, the number 3. Now maths works: <code>29900 * quantity</code>. The text <code>\"3\"</code> is still there, unchanged." }
      ]
    },
    list: {
      label: "Two names, one list (changing a list)",
      names: ["ashas_cart", "same_cart", "own_cart"],
      objects: [["list: 1 item", "Masala Box"], ["new list: 2 items", "Masala Box, Cotton Kurta"]],
      steps: [
        { line: "ashas_cart = [\"Masala Box\"]", show: [[0, 0]], cap: "A <b>list</b> object with one item, and the name <code>ashas_cart</code> on it." },
        { line: "same_cart = ashas_cart", show: [[0, 0], [1, 0]], cap: "Not a copy: a <b>second name for the same list</b>, exactly like <code>old_price = price</code>." },
        { line: "same_cart.append(\"Cotton Kurta\")", show: [[0, 0], [1, 0]], labels: { 0: ["list: 2 items", "Masala Box, Cotton Kurta"] }, changed: [0],
          cap: "Unlike a number, a list <b>can change</b>. <code>.append()</code> changes the list object itself, so <b>both</b> names now see Cotton Kurta. Asha never added it!" },
        { line: "own_cart = ashas_cart.copy()", show: [[0, 0], [1, 0], [2, 1]], cap: "<code>.copy()</code> makes a <b>new</b> list with the same items. Now there are two separate list objects." },
        { line: "own_cart.append(\"Steel Water Bottle\")", show: [[0, 0], [1, 0], [2, 1]], labels: { 1: ["new list: 3 items", "… + Steel Water Bottle"] }, changed: [1],
          cap: "Only the copy changed. <code>ashas_cart</code> still has 2 items. <b>Rule:</b> when two parts of a program need their own list, give each a <code>.copy()</code>." }
      ]
    }
  };

  DiagramKit.register("name-tags", {
    title: "Names point to objects",
    intro: "Pick a situation, then press <b>Play</b>. Each step runs one line of Python.",
    state: { sit: "rebind" },
    size: function (narrow) { return narrow ? [360, 420] : [840, 360]; },
    controls: function (ui, state, api) {
      if (!SITS[state.sit]) state.sit = "rebind";
      ui.select({ label: "Situation:", value: state.sit,
        options: Object.keys(SITS).map(function (k) { return { value: k, label: SITS[k].label }; }),
        onChange: function (v) { state.sit = v; api.reset(); } });
    },
    scene: function (s, state) {
      var sit = SITS[state.sit], n = s.narrow;
      var rows = Math.max(sit.names.length, sit.objects.length);
      var top = n ? 92 : 96, gap = n ? Math.min(64, 300 / rows) : Math.min(62, 250 / rows), h = n ? 44 : 46;
      var code = n ? s.box({ x: 10, y: 8, w: 340, h: 44, label: "", sub: "" }) : s.box({ x: 20, y: 10, w: 800, h: 44, label: "", sub: "" });
      s.zone(n ? 6 : 14, top - 26, n ? 140 : 240, rows * gap + 30, "NAMES");
      s.zone(n ? 166 : 470, top - 26, n ? 188 : 356, rows * gap + 30, "OBJECTS (in memory)");
      var names = sit.names.map(function (nm, i) {
        return s.box({ x: n ? 12 : 30, y: top + i * gap, w: n ? 128 : 210, h: h, label: nm, sub: "", hidden: true });
      });
      var objs = sit.objects.map(function (o, i) {
        return s.box({ x: n ? 176 : 500, y: top + i * gap, w: n ? 170 : 300, h: h, label: o[0], sub: state.sit === "list" ? o[1] : "type: " + o[1], hidden: true });
      });
      var arrows = {};                     // one arrow per (name, object) pair that ever appears
      sit.steps.forEach(function (st) {
        st.show.forEach(function (p) {
          var k = p[0] + "-" + p[1];
          if (!arrows[k]) arrows[k] = s.arrow(names[p[0]], objs[p[1]], { dir: "h", hidden: true });
        });
      });
      return sit.steps.map(function (st, k) {
        return {
          caption: "<code>" + st.line.replace(/</g, "&lt;") + "</code>: " + st.cap,
          run: function (t) {
            t.label(code, ">>> " + st.line);
            t.sub(code, st.out || "");                 // the line's printed output, if any
            var on = {};
            st.show.forEach(function (p) { on[p[0] + "-" + p[1]] = 1; t.show(names[p[0]]); t.show(objs[p[1]]); });
            Object.keys(arrows).forEach(function (key) {
              if (on[key]) { t.show(arrows[key]); t.unmark(arrows[key]); } else t.hide(arrows[key]);
            });
            names.forEach(function (b) { t.unmark(b); });
            objs.forEach(function (b) { t.unmark(b); });
            Object.keys(st.labels || {}).forEach(function (i) { t.label(objs[i], st.labels[i][0]); t.sub(objs[i], st.labels[i][1]); });
            (st.changed || []).forEach(function (i) { t.mark(objs[i], "active"); });
            var prev = k ? sit.steps[k - 1].show : [];
            st.show.forEach(function (p) {
              var isNew = !prev.some(function (q) { return q[0] === p[0] && q[1] === p[1]; });
              if (isNew) { t.mark(names[p[0]], "active"); t.mark(objs[p[1]], "active"); t.mark(arrows[p[0] + "-" + p[1]], "active"); }
            });
          }
        };
      });
    }
  });
})();
