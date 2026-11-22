/* imports — Module 4, Lesson 8.
 * Situation "run": python3 main.py list. main.py runs as "__main__", imports catalog.py (which imports json from the
 *   standard library) and money.py; each imported module runs once, with its own name; then main() runs.
 * Situation "direct": python3 money.py. Now money.py is "__main__", so its self-test at the bottom runs. */
(function () {
  DiagramKit.register("imports", {
    title: "What import does",
    intro: "Pick what you run, then press <b>Play</b>.",
    state: { sit: "run" },
    size: function (narrow) { return narrow ? [360, 400] : [840, 330]; },
    controls: function (ui, state, api) {
      ui.select({ label: "You run:", value: state.sit,
        options: [{ value: "run", label: "python3 main.py list" }, { value: "direct", label: "python3 money.py" }],
        onChange: function (v) { state.sit = v; api.reset(); } });
    },
    scene: function (s, state) {
      var n = s.narrow, main, cat, mon, js, data;
      if (n) {
        main = s.box({ x: 60, y: 10, w: 240, h: 60, label: "main.py", sub: "" });
        cat = s.box({ x: 6, y: 130, w: 166, h: 60, label: "catalog.py", sub: "not loaded" });
        mon = s.box({ x: 188, y: 130, w: 166, h: 60, label: "money.py", sub: "not loaded" });
        js = s.box({ x: 6, y: 250, w: 166, h: 56, label: "json", sub: "standard library" });
        data = s.box({ x: 188, y: 250, w: 166, h: 56, label: "data/catalog.json", sub: "on disk" });
      } else {
        main = s.box({ x: 300, y: 14, w: 240, h: 70, label: "main.py", sub: "" });
        cat = s.box({ x: 40, y: 140, w: 240, h: 64, label: "catalog.py", sub: "not loaded" });
        mon = s.box({ x: 560, y: 140, w: 240, h: 64, label: "money.py", sub: "not loaded" });
        js = s.box({ x: 40, y: 250, w: 240, h: 60, label: "json", sub: "Python's standard library" });
        data = s.box({ x: 300, y: 250, w: 240, h: 60, label: "data/catalog.json", sub: "on disk" });
      }
      var iCat = s.arrow(main, cat, { label: n ? "" : "import catalog" });
      var iMon = s.arrow(main, mon, { label: n ? "" : "from money import …" });
      var iJs = s.arrow(cat, js, { dir: "v", label: n ? "" : "import json" });
      var rd = s.arrow(cat, data, { dashed: true, hidden: true, label: n ? "" : "load()" });
      var all = [main, cat, mon, js, data, iCat, iMon, iJs, rd];
      function off(t) { all.forEach(function (x) { t.unmark(x); }); }

      if (state.sit === "direct") {
        return [
          { caption: "You run <code>python3 money.py</code> directly. Now <b>money.py</b> is the file you ran, so its <code>__name__</code> is <code>\"__main__\"</code>.",
            run: function (t) { t.hide(iCat); t.hide(iMon); t.hide(iJs); t.mark(main, "dim"); t.sub(main, "not used"); t.mark(cat, "dim"); t.mark(js, "dim"); t.mark(data, "dim"); t.mark(mon, "active"); t.sub(mon, "__name__ = \"__main__\""); } },
          { caption: "Python defines <code>rupees()</code> and <code>parse_rupees()</code>. Then <code>if __name__ == \"__main__\":</code> is <b>True</b>, so the quick self-test at the bottom runs: <code>₹1,531.64 29900 149950</code>.",
            run: function (t) { t.unmark(mon); t.mark(mon, "ok"); t.sub(mon, "prints ₹1,531.64 29900 149950"); } }
        ];
      }

      return [
        { caption: "You run <code>python3 main.py list</code>. Python runs <b>main.py</b> from the top. Because you ran it, its <code>__name__</code> is <code>\"__main__\"</code>.",
          run: function (t) { t.mark(main, "active"); t.sub(main, "__name__ = \"__main__\""); } },
        { caption: "Line <code>import catalog</code>: Python finds <code>catalog.py</code> <b>next to main.py</b> and runs it once, top to bottom. That defines <code>load</code>, <code>save</code>, <code>add</code>, <code>search</code>.",
          run: function (t) { off(t); t.mark(iCat, "active"); return t.packet(iCat, { label: "run" }).then(function () { t.mark(cat, "ok"); t.sub(cat, "__name__ = \"catalog\""); }); } },
        { caption: "catalog.py has its own <code>import json</code>. <code>json</code> isn't a file in your folder: it comes with Python, in the <b>standard library</b>.",
          run: function (t) { off(t); t.mark(cat, "ok"); t.mark(iJs, "active"); return t.packet(iJs, { label: "run" }).then(function () { t.mark(js, "ok"); }); } },
        { caption: "<code>from money import parse_rupees, rupees</code> runs money.py. Its <code>__name__</code> is <code>\"money\"</code>, so its self-test at the bottom is <b>skipped</b>.",
          run: function (t) { off(t); t.mark(iMon, "active"); return t.packet(iMon, { label: "run" }).then(function () { t.mark(mon, "ok"); t.sub(mon, "__name__ = \"money\""); }); } },
        { caption: "Back in main.py, the last line <code>if __name__ == \"__main__\":</code> is True, so <code>main([\"list\"])</code> runs. <code>catalog.load()</code> reads the JSON file, and <code>rupees()</code> prints each price.",
          run: function (t) { off(t); t.mark(main, "active"); t.show(rd); t.mark(rd, "active"); return t.packet(rd, { label: "{ }" }).then(function () { t.mark(data, "ok"); t.mark(main, "ok"); t.sub(main, "prints the 5 products"); }); } }
      ];
    }
  });
})();
