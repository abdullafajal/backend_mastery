/* venv-packaging — Module 5, Lesson 6.
 * Situation "venv": the system Python has no requests; project-a/.venv gets requests 2.34.2 and project-b/.venv gets 2.33.1,
 *   side by side; activating a venv makes `python` mean that venv's Python.
 * Situation "package": pip install ./bazaar_pkg reads pyproject.toml, copies the bazaar package into site-packages and
 *   writes a `bazaar` command into the venv's bin/. Real outputs from the lab. */
(function () {
  DiagramKit.register("venv-packaging", {
    title: "Virtual environments and packages",
    intro: "Pick a situation, then press <b>Play</b>.",
    state: { sit: "venv" },
    size: function (narrow) { return narrow ? [360, 400] : [840, 300]; },
    controls: function (ui, state, api) {
      ui.select({ label: "Situation:", value: state.sit,
        options: [{ value: "venv", label: "Two projects, two versions" }, { value: "package", label: "Installing Bazaar as a package" }],
        onChange: function (v) { state.sit = v; api.reset(); } });
    },
    scene: function (s, state) {
      var n = s.narrow;
      if (state.sit === "package") {
        var toml, sp, bin, cmd;
        if (n) {
          toml = s.box({ x: 30, y: 10, w: 300, h: 70, label: "bazaar_pkg/pyproject.toml", sub: "name, version, [project.scripts]" });
          sp = s.box({ x: 6, y: 150, w: 166, h: 80, label: "site-packages/bazaar/", sub: "money, catalog, main" , hidden: true });
          bin = s.box({ x: 188, y: 150, w: 166, h: 80, label: ".venv/bin/bazaar", sub: "a small script", hidden: true });
          cmd = s.box({ x: 30, y: 300, w: 300, h: 70, label: "$ bazaar list", sub: "", hidden: true });
        } else {
          toml = s.box({ x: 20, y: 110, w: 250, h: 80, label: "bazaar_pkg/pyproject.toml", sub: "name, version, [project.scripts]" });
          sp = s.box({ x: 330, y: 30, w: 240, h: 80, label: "site-packages/bazaar/", sub: "money.py, catalog.py, main.py", hidden: true });
          bin = s.box({ x: 330, y: 190, w: 240, h: 80, label: ".venv/bin/bazaar", sub: "a small script", hidden: true });
          cmd = s.box({ x: 620, y: 190, w: 200, h: 80, label: "$ bazaar list", sub: "", hidden: true });
        }
        var a1 = s.arrow(toml, sp, { dir: n ? "v" : "h", hidden: true, label: n ? "" : "pip install" }), a2 = s.arrow(toml, bin, { dir: n ? "v" : "h", hidden: true });
        var a3 = s.arrow(bin, cmd, { dir: n ? "v" : "h", hidden: true }), a4 = s.arrow(cmd, sp, { dashed: true, hidden: true, label: n ? "" : "imports" });
        return [
          { caption: "<code>pyproject.toml</code> describes the package: its name (<code>bazaar</code>), version (<code>0.1.0</code>), what it needs, and a command: <code>bazaar = \"bazaar.main:run\"</code>.",
            run: function (t) { t.mark(toml, "active"); } },
          { caption: "<code>pip install ./bazaar_pkg</code> builds the package and copies the <code>bazaar</code> folder into the venv's <b>site-packages</b>, where <code>import</code> looks. <code>pip show bazaar</code> now says <code>Version: 0.1.0</code>.",
            run: function (t) { t.unmark(toml); t.show(sp); t.show(a1); t.mark(a1, "active"); return t.packet(a1, { label: "copy" }).then(function () { t.mark(sp, "ok"); }); } },
          { caption: "From <code>[project.scripts]</code>, pip also writes a tiny script, <code>.venv/bin/bazaar</code>. It just does <code>from bazaar.main import run</code> and calls <code>run()</code>.",
            run: function (t) { t.unmark(a1); t.show(bin); t.show(a2); t.mark(a2, "active"); return t.packet(a2, { label: "script" }).then(function () { t.mark(bin, "ok"); }); } },
          { caption: "Now <code>bazaar list</code> works from <b>any</b> folder, like any other command: <code>No products.</code> Then <code>bazaar add \"Masala Box\" 299 \"Patel Spices\"</code> → <code>Added Masala Box at ₹299.00.</code>",
            run: function (t) { t.unmark(a2); t.show(cmd); t.show(a3); t.show(a4); t.mark(a3, "active"); t.mark(a4, "active"); return t.packet(a3, { label: "run" }).then(function () { t.mark(cmd, "ok"); t.sub(cmd, "No products."); }); } }
        ];
      }

      var sys_, a, b;
      if (n) {
        sys_ = s.box({ x: 30, y: 10, w: 300, h: 70, label: "system Python", sub: "/usr/local/bin/python3" });
        a = s.box({ x: 6, y: 170, w: 166, h: 90, label: "project-a/.venv", sub: "empty" });
        b = s.box({ x: 188, y: 170, w: 166, h: 90, label: "project-b/.venv", sub: "empty" });
      } else {
        sys_ = s.box({ x: 20, y: 110, w: 240, h: 80, label: "system Python", sub: "/usr/local/bin/python3" });
        a = s.box({ x: 360, y: 20, w: 260, h: 90, label: "project-a/.venv", sub: "empty" });
        b = s.box({ x: 360, y: 190, w: 260, h: 90, label: "project-b/.venv", sub: "empty" });
      }
      var mA = s.arrow(sys_, a, { dir: n ? "v" : "h", label: n ? "" : "python3 -m venv" }), mB = s.arrow(sys_, b, { dir: n ? "v" : "h" });
      return [
        { caption: "The computer's own Python has no <code>requests</code>: <code>ModuleNotFoundError: No module named 'requests'</code>. Installing everything here would mix every project's packages together.",
          run: function (t) { t.mark(sys_, "active"); t.sub(sys_, "no requests"); } },
        { caption: "<code>python3 -m venv .venv</code> inside each project makes a <b>virtual environment</b>: a private folder with its own <code>python</code> and <code>pip</code>, and its own empty <b>site-packages</b>.",
          run: function (t) { t.unmark(sys_); t.mark(mA, "active"); t.mark(mB, "active"); return Promise.all([t.packet(mA, { label: "venv" }), t.packet(mB, { label: "venv" })]).then(function () { t.mark(a, "active"); t.mark(b, "active"); }); } },
        { caption: "<code>.venv/bin/pip install -r requirements.txt</code> in each: project-a gets <code>requests 2.34.2</code>, project-b gets <code>requests 2.33.1</code>. Two versions, side by side, no fight.",
          run: function (t) { t.unmark(mA); t.unmark(mB); t.unmark(a); t.unmark(b); t.mark(a, "ok"); t.mark(b, "ok"); t.sub(a, "requests 2.34.2"); t.sub(b, "requests 2.33.1"); } },
        { caption: "<code>source .venv/bin/activate</code> makes <code>python</code> mean <b>this</b> venv's Python (<code>/lab/project-a/.venv/bin/python</code>). <code>deactivate</code> goes back. The system Python still has no requests.",
          run: function (t) { t.unmark(a); t.mark(a, "active"); t.sub(a, n ? "activated" : "active: python = .venv/bin/python"); t.mark(sys_, "dim"); } }
      ];
    }
  });
})();
