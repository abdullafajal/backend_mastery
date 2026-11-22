/* shell-steps — Module 2, Lesson 1.
 * What bash does with one command line: split into words, expand, find the program,
 * run it and wait, then read the exit code. The "arguments" box shows exactly what
 * the program receives. Pick a command line to see where things go right or wrong. */
(function () {
  var CMDS = {
    quoted: {
      label: 'rm "summer sale.txt"',
      split: '[rm] [summer sale.txt]',
      splitNote: "The quotes keep <code>summer sale.txt</code> together as <b>one</b> word.",
      expand: '[rm] [summer sale.txt]',
      expandNote: "Nothing to expand: no <code>$</code>, no <code>*</code>, no <code>~</code>. The quotes themselves are removed.",
      find: "rm is /usr/bin/rm",
      run: "rm deletes one file: <code>summer sale.txt</code>.",
      code: 0, codeNote: "Success: exit code <b>0</b>."
    },
    unquoted: {
      label: "rm summer sale.txt",
      split: "[rm] [summer] [sale.txt]",
      splitNote: "No quotes, so the space <b>splits</b> the name: rm will get <b>two</b> arguments, not one.",
      expand: "[rm] [summer] [sale.txt]",
      expandNote: "Nothing to expand. The damage is already done in step 1.",
      find: "rm is /usr/bin/rm",
      run: "rm looks for a file called <code>summer</code> and one called <code>sale.txt</code>. Neither exists: <code>rm: cannot remove 'summer': No such file or directory</code>. (If they did exist, rm would delete the wrong files!)",
      code: 1, codeNote: "Failure: exit code <b>1</b>. Quote file names that might contain spaces."
    },
    glob: {
      label: "ls logs/*.log",
      split: "[ls] [logs/*.log]",
      splitNote: "Two words. The <code>*</code> is still just a character at this point.",
      expand: "[ls] [logs/order_20261119.log] [logs/order_20261120.log] [logs/order_20261121.log]",
      expandShort: "[ls] + 3 file names",
      expandNote: "The <b>shell</b> replaces <code>logs/*.log</code> with every matching file name. ls never sees the <code>*</code>; it gets <b>three</b> file names.",
      find: "ls is /usr/bin/ls",
      run: "ls lists the three files it was given.",
      code: 0, codeNote: "Success: exit code <b>0</b>."
    },
    chain: {
      label: "cd /srv/nope && ./deploy.sh",
      split: "[cd] [/srv/nope]   &&   [./deploy.sh]",
      splitShort: "[cd] [/srv/nope] && …",
      splitNote: "<code>&&</code> is not a word for a program: it tells the shell \"run the second command <b>only if</b> the first one succeeds\".",
      expand: "[cd] [/srv/nope]",
      expandNote: "First command: <code>cd /srv/nope</code>. Nothing to expand.",
      find: "cd is a shell builtin",
      run: "<code>cd</code> is built into bash itself, so no new process is started. The folder doesn't exist: <code>cd: /srv/nope: No such file or directory</code>.",
      code: 1, codeNote: "Exit code <b>1</b>, so <code>&&</code> <b>skips</b> <code>./deploy.sh</code>. With <code>;</code> instead, the deploy would run in the wrong folder!"
    }
  };

  DiagramKit.register("shell-steps", {
    title: "What the shell does with one line",
    intro: "Pick a command line, then press <b>Play</b>. Watch the <b>arguments</b> box: it shows exactly what the program receives.",
    state: { cmd: "quoted" },

    size: function (narrow) { return narrow ? [360, 640] : [840, 360]; },

    controls: function (ui, state, api) {
      ui.select({
        label: "Command line:",
        value: state.cmd,
        options: Object.keys(CMDS).map(function (k) { return { value: k, label: CMDS[k].label }; }),
        onChange: function (v) { state.cmd = v; api.reset(); }
      });
    },

    scene: function (s, state) {
      var c = CMDS[state.cmd], n = s.narrow;
      var line, stages = [], args, result;
      var names = [["1. split", "into words"], ["2. expand", "$VAR ~ * $(…)"], ["3. find", "builtin or PATH"], ["4. run", "start + wait"], ["5. exit code", "saved in $?"]];
      if (n) {
        line = s.box({ x: 10, y: 10, w: 340, h: 54, label: "$ " + c.label, sub: "you press Enter" });
        names.forEach(function (nm, i) { stages.push(s.box({ x: 10, y: 92 + i * 70, w: 150, h: 54, label: nm[0], sub: nm[1] })); });
        args = s.box({ x: 176, y: 162, w: 174, h: 124, label: "arguments", sub: "…" });
        result = s.box({ x: 176, y: 372, w: 174, h: 54, label: "result", sub: "…" });
      } else {
        line = s.box({ x: 20, y: 20, w: 800, h: 56, label: "$ " + c.label, sub: "you press Enter" });
        names.forEach(function (nm, i) { stages.push(s.box({ x: 20 + i * 162, y: 120, w: 148, h: 60, label: nm[0], sub: nm[1] })); });
        args = s.box({ x: 20, y: 212, w: 800, h: 56, label: "arguments the program will get", sub: "…" });
        result = s.box({ x: 20, y: 286, w: 800, h: 56, label: "result", sub: "…" });
      }
      var splitText = n && c.splitShort ? c.splitShort : c.split;      // phones get a shorter version
      var expandText = n && c.expandShort ? c.expandShort : c.expand;
      var arrows = [];
      for (var i = 0; i < stages.length - 1; i++) arrows.push(s.arrow(stages[i], stages[i + 1]));

      function focus(t, i) {
        stages.forEach(function (b, j) { t.unmark(b); if (j < i) t.mark(b, "ok"); });
        t.mark(stages[i], "active");
        if (i > 0) { t.mark(arrows[i - 1], "active"); return t.packet(arrows[i - 1], { label: "›" }); }
      }

      return [
        { caption: "You type <code>" + c.label + "</code> and press Enter. The shell now has one line of text.",
          run: function (t) { t.mark(line, "active"); } },
        { caption: "<b>Step 1: split into words.</b> " + c.splitNote,
          run: function (t) { t.unmark(line); var p = focus(t, 0); t.sub(args, splitText); t.mark(args, "active"); return p; } },
        { caption: "<b>Step 2: expand.</b> " + c.expandNote,
          run: function (t) { var p = focus(t, 1); t.sub(args, expandText); return p; } },
        { caption: "<b>Step 3: find the command.</b> The shell checks: is it an alias, a function, a <b>builtin</b> (part of bash itself), or a program in a <b>PATH</b> folder? Here: <code>" + c.find + "</code>.",
          run: function (t) { return focus(t, 2); } },
        { caption: "<b>Step 4: run it and wait.</b> " + c.run,
          run: function (t) { var p = focus(t, 3); t.unmark(args); return p; } },
        { caption: "<b>Step 5: the exit code.</b> " + c.codeNote,
          run: function (t) {
            var p = focus(t, 4);
            return (p || Promise.resolve()).then(function () {
              t.unmark(stages[4]); t.mark(stages[4], c.code === 0 ? "ok" : "bad");
              t.sub(result, "$? = " + c.code);
              t.mark(result, c.code === 0 ? "ok" : "bad");
            });
          } }
      ];
    }
  });
})();
