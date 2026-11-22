/* dataclass-hints — Module 5, Lesson 3.
 * Situation "dataclass": @dataclass reads the typed fields and writes __init__, __repr__ and __eq__ for you.
 * Situation "hints": line_total("299", 2). mypy (before running) reports the wrong type; Python (while running)
 *   ignores the hint and returns '299299'. Messages are from a real run (mypy 2.4.1, Python 3.13). */
(function () {
  DiagramKit.register("dataclass-hints", {
    title: "Dataclasses and type hints",
    intro: "Pick a situation, then press <b>Play</b>.",
    state: { sit: "dataclass" },
    size: function (narrow) { return narrow ? [360, 330] : [840, 300]; },
    controls: function (ui, state, api) {
      ui.select({ label: "Situation:", value: state.sit,
        options: [{ value: "dataclass", label: "What @dataclass writes for you" }, { value: "hints", label: "A wrong type: mypy vs Python" }],
        onChange: function (v) { state.sit = v; api.reset(); } });
    },
    scene: function (s, state) {
      var n = s.narrow;
      if (state.sit === "hints") {
        var code, mypy, py, mE, pE;
        if (n) {
          code = s.box({ x: 30, y: 10, w: 300, h: 70, label: "line_total(\"299\", 2)", sub: "def line_total(price_paise: int, …) -> int" });
          mypy = s.box({ x: 6, y: 170, w: 166, h: 90, label: "mypy (before running)", sub: "" });
          py = s.box({ x: 188, y: 170, w: 166, h: 90, label: "python3 (running)", sub: "" });
        } else {
          code = s.box({ x: 20, y: 110, w: 300, h: 80, label: "line_total(\"299\", 2)", sub: "def line_total(price_paise: int, quantity: int) -> int" });
          mypy = s.box({ x: 460, y: 20, w: 360, h: 90, label: "mypy examples/type_hints.py", sub: "checks the hints, runs nothing" });
          py = s.box({ x: 460, y: 190, w: 360, h: 90, label: "python3 examples/type_hints.py", sub: "runs the code, ignores the hints" });
        }
        mE = s.arrow(code, mypy, { dir: n ? "v" : "h", label: n ? "" : "before" });
        pE = s.arrow(code, py, { dir: n ? "v" : "h", label: n ? "" : "while running" });
        return [
          { caption: "The function promises <code>price_paise: int</code>, but someone passes the text <code>\"299\"</code>, maybe straight from a form.",
            run: function (t) { t.mark(code, "active"); } },
          { caption: "<b>Python</b> doesn't check hints while running. <code>\"299\" * 2</code> repeats the text and returns <code>'299299'</code>: no error, just a wrong price, found much later (if ever).",
            run: function (t) { t.unmark(code); t.mark(pE, "active"); return t.packet(pE, { label: "run" }).then(function () { t.mark(py, "bad"); t.sub(py, "prints 299299, no error"); }); } },
          { caption: "<b>mypy</b> reads the hints <b>before</b> anything runs: <code>error: Argument 1 to \"line_total\" has incompatible type \"str\"; expected \"int\"</code>. The bug is caught on your laptop, not by a customer.",
            run: function (t) { t.unmark(pE); t.mark(mE, "active"); return t.packet(mE, { label: "check" }).then(function () { t.mark(mypy, "ok"); t.sub(mypy, n ? "error: … \"str\"; expected \"int\"" : "error: incompatible type \"str\"; expected \"int\""); }); } }
        ];
      }

      var fields, deco, init, rep, eq;
      if (n) {
        fields = s.box({ x: 30, y: 10, w: 300, h: 80, label: "class Product:", sub: "name: str · price_paise: int · seller: str" });
        deco = s.box({ x: 100, y: 130, w: 160, h: 56, label: "@dataclass", sub: "reads the fields" });
        init = s.box({ x: 6, y: 240, w: 110, h: 64, label: "__init__", sub: "", hidden: true });
        rep = s.box({ x: 125, y: 240, w: 110, h: 64, label: "__repr__", sub: "", hidden: true });
        eq = s.box({ x: 244, y: 240, w: 110, h: 64, label: "__eq__", sub: "", hidden: true });
      } else {
        fields = s.box({ x: 20, y: 100, w: 260, h: 100, label: "class Product:", sub: "name: str · price_paise: int · seller: str" });
        deco = s.box({ x: 330, y: 120, w: 170, h: 60, label: "@dataclass", sub: "reads the fields" });
        init = s.box({ x: 560, y: 20, w: 260, h: 64, label: "__init__(name, price_paise, seller)", sub: "", hidden: true });
        rep = s.box({ x: 560, y: 118, w: 260, h: 64, label: "__repr__()", sub: "", hidden: true });
        eq = s.box({ x: 560, y: 216, w: 260, h: 64, label: "__eq__(other)", sub: "", hidden: true });
      }
      var a0 = s.arrow(fields, deco, { dir: n ? "v" : "h" });
      var dir = n ? "v" : "h";
      var aI = s.arrow(deco, init, { dir: dir, hidden: true }), aR = s.arrow(deco, rep, { dir: dir, hidden: true }), aE = s.arrow(deco, eq, { dir: dir, hidden: true });
      return [
        { caption: "You only list the <b>fields</b>: each one's name and type, like <code>price_paise: int</code>.",
          run: function (t) { t.mark(fields, "active"); } },
        { caption: "<code>@dataclass</code> reads that list when the class is created.",
          run: function (t) { t.unmark(fields); t.mark(a0, "active"); return t.packet(a0, { label: "fields" }).then(function () { t.mark(deco, "active"); }); } },
        { caption: "It writes <code>__init__</code> for you: one parameter per field, in order, and <code>self.name = name</code> for each. The boring lines from Lesson 1, gone.",
          run: function (t) { t.unmark(a0); t.show(init); t.show(aI); t.mark(aI, "active"); return t.packet(aI, { label: "write" }).then(function () { t.mark(init, "ok"); t.sub(init, "self.name = name, …"); }); } },
        { caption: "And <code>__repr__</code> (<code>Product(name='Masala Box', price_paise=29900, seller='Patel Spices')</code>) and <code>__eq__</code> (same field values → equal).",
          run: function (t) { t.unmark(aI); t.show(rep); t.show(eq); t.show(aR); t.show(aE); t.mark(aR, "active"); t.mark(aE, "active");
            return Promise.all([t.packet(aR, { label: "write" }), t.packet(aE, { label: "write" })]).then(function () { t.mark(rep, "ok"); t.mark(eq, "ok"); t.sub(rep, "Product(name=…, …)"); t.sub(eq, "compare all fields"); }); } },
        { caption: "Same class as Lesson 1, about a third of the code. Add <code>field(default_factory=list)</code>, <code>frozen=True</code> or <code>__post_init__</code> when you need them.",
          run: function (t) { t.unmark(aR); t.unmark(aE); t.unmark(deco); t.mark(deco, "ok"); t.mark(fields, "ok"); } }
      ];
    }
  });
})();
