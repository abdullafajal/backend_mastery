/* env-inherit — Module 2, Lesson 5.
 * A shell has two kinds of variables: plain shell variables, and environment variables (exported).
 * When the shell starts a program, the program gets a COPY of the environment only.
 * Situations: not exported, exported, and "VAR=value cmd" for one command. */
(function () {
  var SIT = {
    plain: {
      label: "DB_PASSWORD=secret123 (no export)",
      line: "$ DB_PASSWORD=secret123",
      where: "shell", copied: false, after: "shell",
      steps: [
        "You type <code>DB_PASSWORD=secret123</code>. It becomes a <b>shell variable</b>: only the shell itself can see it.",
        "You run <code>python3 settings.py</code>. The shell starts a new program and gives it a <b>copy of its environment</b>, which doesn't include plain shell variables.",
        "Python looks for <code>DB_PASSWORD</code> and doesn't find it: <code>ERROR: DB_PASSWORD is not set</code>. Fix: <code>export DB_PASSWORD</code>."
      ]
    },
    exported: {
      label: "export DB_PASSWORD=secret123",
      line: "$ export DB_PASSWORD=secret123",
      where: "env", copied: true, after: "env",
      steps: [
        "You type <code>export DB_PASSWORD=secret123</code>. <code>export</code> puts it in the shell's <b>environment</b>: the settings every program started from here will get.",
        "You run <code>python3 settings.py</code>. The new program gets a <b>copy</b> of the environment, including <code>DB_PASSWORD</code>.",
        "Python reads it with <code>os.environ</code> and starts: <code>DB_PASSWORD = se*******</code>. Every later program you start from this shell gets it too."
      ]
    },
    once: {
      label: "DB_PASSWORD=secret123 python3 settings.py",
      line: "$ DB_PASSWORD=secret123 python3 settings.py",
      where: "none", copied: true, after: "none",
      steps: [
        "You put the setting <b>in front of the command</b>, on the same line. The shell does not keep it.",
        "The shell adds it only to <b>this one program's</b> copy of the environment.",
        "Python gets it and starts. Afterwards the shell still doesn't have it: <code>echo $DB_PASSWORD</code> prints nothing. Handy for trying a setting once."
      ]
    }
  };

  DiagramKit.register("env-inherit", {
    title: "How a program gets its settings",
    intro: "Pick how you set <code>DB_PASSWORD</code>, then press <b>Play</b>.",
    state: { sit: "plain" },
    size: function (narrow) { return narrow ? [360, 460] : [840, 330]; },
    controls: function (ui, state, api) {
      ui.select({ label: "You type:", value: state.sit,
        options: Object.keys(SIT).map(function (k) { return { value: k, label: SIT[k].label }; }),
        onChange: function (v) { state.sit = v; api.reset(); } });
    },
    scene: function (s, state) {
      var c = SIT[state.sit], n = s.narrow, shellVars, envVars, child, line;
      if (n) {
        line = s.box({ x: 10, y: 10, w: 340, h: 50, label: c.line.replace("secret123", "…"), sub: "" });   // shorter on phones
        s.zone(6, 76, 348, 110, "THE SHELL");
        shellVars = s.box({ x: 16, y: 106, w: 160, h: 60, label: "shell variables", sub: "only the shell sees them" });
        envVars = s.box({ x: 184, y: 106, w: 160, h: 60, label: "environment", sub: "HOME, PATH, …" });
        child = s.box({ x: 90, y: 300, w: 180, h: 70, label: "python3 settings.py", sub: "a new program" });
      } else {
        line = s.box({ x: 20, y: 14, w: 800, h: 48, label: c.line, sub: "" });
        s.zone(14, 84, 470, 230, "THE SHELL");
        shellVars = s.box({ x: 34, y: 150, w: 200, h: 70, label: "shell variables", sub: "only the shell sees them" });
        envVars = s.box({ x: 260, y: 150, w: 200, h: 70, label: "environment", sub: "HOME, PATH, …" });
        child = s.box({ x: 600, y: 150, w: 220, h: 70, label: "python3 settings.py", sub: "a new program" });
      }
      var copy = s.arrow(envVars, child, { label: n ? "" : "copy", dir: n ? "v" : "h" });
      var once = s.arrow(line, child, { hidden: true, dashed: true });
      return [
        { caption: c.steps[0], run: function (t) {
            t.mark(line, "active");
            if (c.where === "shell") { t.sub(shellVars, "DB_PASSWORD=secret123"); t.mark(shellVars, "active"); }
            if (c.where === "env") { t.sub(envVars, "… + DB_PASSWORD"); t.mark(envVars, "active"); }
          } },
        { caption: c.steps[1], run: function (t) {
            t.unmark(line); t.unmark(shellVars); t.unmark(envVars);
            t.mark(copy, "active");
            var p = t.packet(copy, { label: "env" });
            if (c.where === "none") { t.show(once); t.mark(once, "active"); p = Promise.all([p, t.packet(once, { label: "+1" })]); }
            return p;
          } },
        { caption: c.steps[2], run: function (t) {
            t.unmark(copy); t.unmark(once);
            t.sub(child, c.copied ? "DB_PASSWORD = se*******" : "DB_PASSWORD not set!");
            t.mark(child, c.copied ? "ok" : "bad");
          } }
      ];
    }
  });
})();
