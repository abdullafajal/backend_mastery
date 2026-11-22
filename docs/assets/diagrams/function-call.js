/* function-call — Module 4, Lesson 3.
 * Situation "call": charge = delivery_charge(total). Python jumps into the function with the value,
 *   runs its lines, and comes back with the returned value. The cart total can be typed.
 * Situation "noreturn": cart_subtotal() forgets `return`, so None comes back and the next line crashes
 *   (the real TypeError from the lab's exercise). */
(function () {
  function rs(p) { return "₹" + String(Math.floor(p / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }   // like Python's {:,}

  DiagramKit.register("function-call", {
    title: "What happens when you call a function",
    intro: "Pick a situation, then press <b>Play</b>. In the first one, type any cart total.",
    state: { sit: "call", rupees: 649 },
    size: function (narrow) { return narrow ? [360, 400] : [840, 300]; },
    controls: function (ui, state, api) {
      var inp;
      ui.select({ label: "Situation:", value: state.sit,
        options: [{ value: "call", label: "A call, and its return value" }, { value: "noreturn", label: "Forgot return (gives back None)" }],
        onChange: function (v) { state.sit = v; inp.parentNode.style.display = v === "call" ? "" : "none"; api.reset(); } });
      inp = ui.input({ label: "Cart total ₹", type: "number", value: state.rupees, min: 0, width: "7rem",
        onChange: function (v) { var r = Math.floor(Number(v)); state.rupees = isFinite(r) && r >= 0 ? Math.min(r, 9999999) : 0; inp.value = state.rupees; api.reset(); } });
      if (state.sit !== "call") inp.parentNode.style.display = "none";
    },
    scene: function (s, state) {
      var n = s.narrow, call = state.sit === "call";
      var total = state.rupees * 100, free = total >= 99900, result = free ? 0 : 4900;
      var L = call
        ? { caller: "charge = delivery_charge(" + total + ")", head: "def delivery_charge(cart_total_paise):", body: "if cart_total_paise >= 99900:", ret: free ? "return 0" : "return 4900" }
        : { caller: "subtotal = cart_subtotal(cart)", head: "def cart_subtotal(cart):", body: "for …: subtotal += price * quantity", ret: "(no return line)" };
      var caller, head, body, ret, next;
      if (n) {
        caller = s.box({ x: 10, y: 10, w: 340, h: 56, label: L.caller, sub: "your code (the caller)" });
        s.zone(44, 100, 312, 236, "THE FUNCTION");
        head = s.box({ x: 54, y: 126, w: 292, h: 52, label: L.head, sub: "" });
        body = s.box({ x: 54, y: 192, w: 292, h: 52, label: L.body, sub: "" });
        ret = s.box({ x: 54, y: 258, w: 292, h: 52, label: L.ret, sub: "" });
        next = s.box({ x: 10, y: 344, w: 340, h: 50, label: call ? "print(charge)" : "delivery_charge(subtotal)", sub: "the next line", hidden: true });
      } else {
        caller = s.box({ x: 20, y: 70, w: 300, h: 70, label: L.caller, sub: "your code (the caller)" });
        next = s.box({ x: 20, y: 190, w: 300, h: 60, label: call ? "print(charge)" : "delivery_charge(subtotal)", sub: "the next line", hidden: true });
        s.zone(410, 14, 420, 272, "THE FUNCTION");
        head = s.box({ x: 430, y: 44, w: 380, h: 56, label: L.head, sub: "" });
        body = s.box({ x: 430, y: 124, w: 380, h: 56, label: L.body, sub: "" });
        ret = s.box({ x: 430, y: 204, w: 380, h: 56, label: L.ret, sub: "" });
      }
      var go = s.arrow(caller, head, { dir: n ? "v" : "h", label: n ? "" : "call" });
      var back = n ? s.arrow({ x: 54, y: 284 }, { x: 30, y: 66 }, { label: "" })      // up the left gutter, beside the function
                   : s.arrow(ret, caller, { dir: "h", label: "return" });
      var down = n ? s.arrow({ x: 20, y: 66 }, { x: 20, y: 344 }, { hidden: true, dashed: true })   // phones: down the left gutter, never through the function
                 : s.arrow(caller, next, { dir: "v", hidden: true, dashed: true });

      if (!call) {
        return [
          { caption: "Python reaches <code>cart_subtotal(cart)</code>. It pauses this line and jumps into the function, with Ravi's cart.",
            run: function (t) { t.mark(caller, "active"); t.mark(go, "active"); return t.packet(go, { label: "cart" }).then(function () { t.mark(head, "active"); t.sub(head, "cart = Ravi's 3 items"); }); } },
          { caption: "The loop adds up the cart correctly: <code>subtotal</code> is 159600 inside the function (₹1,596).",
            run: function (t) { t.unmark(caller); t.unmark(go); t.unmark(head); t.mark(body, "active"); t.sub(body, "subtotal = 159600 (inside only)"); } },
          { caption: "The function ends <b>without a <code>return</code></b>. Python then gives back <code>None</code>, the value for \"nothing\". The 159600 is lost with the function's local names.",
            run: function (t) { t.unmark(body); t.mark(ret, "bad"); t.mark(back, "active"); return t.packet(back, { label: "None" }).then(function () { t.sub(caller, "subtotal = None"); t.mark(caller, "bad"); }); } },
          { caption: "The next line uses it: <code>if subtotal >= 99900</code>. Crash: <code>TypeError: '>=' not supported between instances of 'NoneType' and 'int'</code>. Fix: add <code>return subtotal</code> at the end of the function.",
            run: function (t) { t.unmark(back); t.unmark(ret); t.show(next); t.show(down); t.mark(down, "active"); t.mark(next, "bad"); t.sub(next, "TypeError: None >= 99900"); } }
        ];
      }

      return [
        { caption: "Python reaches <code>delivery_charge(" + total + ")</code>. It <b>pauses</b> this line and jumps into the function.",
          run: function (t) { t.mark(caller, "active"); } },
        { caption: "The value " + total + " goes in. Inside the function it's called <code>cart_total_paise</code>: the <b>parameter</b>.",
          run: function (t) { t.unmark(caller); t.mark(go, "active"); return t.packet(go, { label: String(total) }).then(function () { t.mark(head, "active"); t.sub(head, "cart_total_paise = " + total); }); } },
        { caption: "The function's lines run: <code>" + total + " >= 99900</code> is <b>" + (free ? "True" : "False") + "</b>.",
          run: function (t) { t.unmark(go); t.unmark(head); t.mark(body, "active"); t.sub(body, total + " >= 99900 → " + (free ? "True" : "False")); } },
        { caption: "<code>" + L.ret + "</code> ends the function and sends " + result + " <b>back</b> to the caller. The line continues: <code>charge = " + result + "</code>.",
          run: function (t) { t.unmark(body); t.mark(ret, "ok"); t.mark(back, "active"); return t.packet(back, { label: String(result) }).then(function () { t.sub(caller, "charge = " + result + " (" + (result ? rs(result) : "free") + ")"); t.mark(caller, "ok"); }); } },
        { caption: "Python moves on to the next line, <code>print(charge)</code>. The function's own names (like <code>cart_total_paise</code>) are gone; only the returned value stays. Try another total: 998, 999.",
          run: function (t) { t.unmark(back); t.unmark(ret); t.show(next); t.show(down); t.mark(down, "active"); t.mark(next, "active"); t.sub(next, "prints " + result); } }
      ];
    }
  });
})();
