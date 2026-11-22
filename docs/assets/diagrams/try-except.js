/* try-except — Module 4, Lesson 6.
 * Situation "try": type a quantity; int(text) either works (try → else → finally) or raises ValueError
 *   (try stops at once → except → finally). The program keeps going either way.
 * Situation "crash": the same line with no try: a ValueError stops the whole program; later lines never run. */
(function () {
  // Like Python's int(): optional spaces, optional sign, digits (single underscores allowed between digits).
  function pyInt(text) { return /^\s*[+-]?\d+(_\d+)*\s*$/.test(text) ? parseInt(text.replace(/_/g, ""), 10) : null; }
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pyRepr(t) { return "'" + t.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'"; }

  DiagramKit.register("try-except", {
    title: "What try and except do",
    intro: "Pick a situation, type what the customer typed, then press <b>Play</b>.",
    state: { sit: "try", text: "three" },
    size: function (narrow) { return narrow ? [360, 440] : [840, 320]; },
    controls: function (ui, state, api) {
      ui.select({ label: "Situation:", value: state.sit,
        options: [{ value: "try", label: "With try / except" }, { value: "crash", label: "Without try (crash)" }],
        onChange: function (v) { state.sit = v; api.reset(); } });
      var inp = ui.input({ label: "Customer typed:", value: state.text, width: "8rem",
        onChange: function (v) { state.text = String(v).slice(0, 20); inp.value = state.text; api.reset(); } });
    },
    scene: function (s, state) {
      var n = s.narrow, text = state.text, q = pyInt(text), ok = q !== null, shown = esc(pyRepr(text));
      var err = "ValueError: invalid literal for int() with base 10: " + pyRepr(text);
      if (state.sit === "crash") {
        var a, b, c;
        if (n) {
          a = s.box({ x: 30, y: 20, w: 300, h: 60, label: "quantity = int(text)", sub: "text = " + pyRepr(text) });
          b = s.box({ x: 30, y: 150, w: 300, h: 60, label: "print(\"Added\", quantity)", sub: "the next line" });
          c = s.box({ x: 30, y: 280, w: 300, h: 60, label: "print(\"Total\", total)", sub: "the last line" });
        } else {
          a = s.box({ x: 20, y: 120, w: 240, h: 70, label: "quantity = int(text)", sub: "text = " + pyRepr(text) });
          b = s.box({ x: 300, y: 120, w: 240, h: 70, label: "print(\"Added\", quantity)", sub: "the next line" });
          c = s.box({ x: 580, y: 120, w: 240, h: 70, label: "print(\"Total\", total)", sub: "the last line" });
        }
        var ab = s.arrow(a, b, { dir: n ? "v" : "h" }), bc = s.arrow(b, c, { dir: n ? "v" : "h" });
        return [
          { caption: "Python runs <code>int(" + shown + ")</code>. There is no <code>try</code> around it.",
            run: function (t) { t.mark(a, "active"); } },
          ok ? { caption: shown + " is a whole number, so it works: <code>quantity = " + q + "</code>. No error, no problem. Now type <code>three</code> to see a crash.",
                 run: function (t) { t.unmark(a); t.mark(a, "ok"); t.sub(a, "quantity = " + q); t.mark(ab, "active"); return t.packet(ab, { label: "→" }).then(function () { t.mark(b, "ok"); t.mark(c, "ok"); }); } }
             : { caption: "<b>Crash.</b> <code>" + esc(err) + "</code>. Python prints the traceback and <b>stops the whole program</b>. The next lines never run: on a website, the customer would see an error page.",
                 run: function (t) { t.unmark(a); t.mark(a, "bad"); t.sub(a, "ValueError!"); t.mark(b, "dim"); t.mark(c, "dim"); t.mark(ab, "dim"); t.mark(bc, "dim"); } }
        ];
      }

      var tr, ex, el, fi, after;
      if (n) {
        tr = s.box({ x: 70, y: 10, w: 220, h: 60, label: "try: quantity = int(text)", sub: "text = " + pyRepr(text) });
        el = s.box({ x: 6, y: 130, w: 166, h: 64, label: "else:", sub: "print(\"Added\", …)" });
        ex = s.box({ x: 188, y: 130, w: 166, h: 64, label: "except ValueError:", sub: "\"please type a number\"" });
        fi = s.box({ x: 70, y: 250, w: 220, h: 60, label: "finally:", sub: "always runs" });
        after = s.box({ x: 70, y: 360, w: 220, h: 60, label: "the rest of the program", sub: "keeps running" });
      } else {
        tr = s.box({ x: 20, y: 120, w: 220, h: 70, label: "try: quantity = int(text)", sub: "text = " + pyRepr(text) });
        el = s.box({ x: 310, y: 30, w: 220, h: 64, label: "else:", sub: "print(\"Added\", quantity)" });
        ex = s.box({ x: 310, y: 216, w: 220, h: 64, label: "except ValueError:", sub: "print(\"please type a number\")" });
        fi = s.box({ x: 600, y: 60, w: 220, h: 64, label: "finally:", sub: "always runs" });
        after = s.box({ x: 600, y: 196, w: 220, h: 64, label: "the rest of the program", sub: "keeps running" });
      }
      var tE = s.arrow(tr, el, { dir: n ? "v" : "h", label: n ? "" : "no error" });
      var tX = s.arrow(tr, ex, { dir: n ? "v" : "h", label: n ? "" : "ValueError" });
      var eF = s.arrow(el, fi, { dir: n ? "v" : "h" });
      var xF = s.arrow(ex, fi, { dir: n ? "v" : "h" });
      var fA = s.arrow(fi, after, { dir: "v" });
      var go = ok ? tE : tX, via = ok ? el : ex, back = ok ? eF : xF, skip = ok ? ex : el;
      return [
        { caption: "Python runs the <code>try</code> block: <code>int(" + shown + ")</code>.",
          run: function (t) { t.mark(tr, "active"); } },
        { caption: ok ? shown + " is a whole number: no error. <code>quantity = " + q + "</code>. The <code>except</code> block is skipped."
                      : shown + " isn't a whole number: <code>" + esc(err) + "</code>. The <code>try</code> block stops <b>at once</b>, and Python jumps to the matching <code>except</code>. No crash.",
          run: function (t) { t.unmark(tr); t.mark(tr, ok ? "ok" : "bad"); t.sub(tr, ok ? "quantity = " + q : "ValueError raised"); t.mark(go, "active");
            return t.packet(go, { label: ok ? "✓" : "!" }).then(function () { t.mark(via, ok ? "ok" : "active"); t.mark(skip, "dim"); }); } },
        { caption: ok ? "<code>else</code> runs only when the <code>try</code> block had no error: <code>Added " + q + "</code>."
                      : "<code>except ValueError</code> runs: the customer sees <code>please type a number</code> instead of an error page.",
          run: function (t) { t.unmark(go); t.mark(back, "active"); return t.packet(back, { label: "→" }).then(function () { t.mark(fi, "active"); }); } },
        { caption: "<code>finally</code> runs <b>every time</b>, error or not. Then the program simply <b>keeps going</b>. Try other inputs: <code>3</code>, <code>three</code>, <code>-2</code>, an empty box.",
          run: function (t) { t.unmark(back); t.unmark(fi); t.mark(fi, "ok"); t.mark(fA, "active"); return t.packet(fA, { label: "→" }).then(function () { t.mark(after, "ok"); }); } }
      ];
    }
  });
})();
