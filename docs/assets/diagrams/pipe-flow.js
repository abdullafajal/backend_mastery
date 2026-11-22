/* pipe-flow — Module 2, Lesson 4 (the plan's "how a pipe passes data between commands").
 * Situation "pipeline": who had the most failed checkouts? Five small commands joined by |,
 *   with the real data that comes out of each one (from the lab's access.log).
 * Situation "redirect": a program has two outputs (stdout, stderr); see where >, 2> and 2>&1 send them. */
(function () {
  var STAGES = [
    ["grep 'checkout 500'", "keep failed checkouts", "…/checkout 500 … customer=sara …", "…/checkout 500 … customer=meera …",
     "<code>grep</code> reads all 2,000 lines and lets through only the ones with <code>checkout 500</code>: the failed checkouts."],
    ["awk '{print $6}'", "keep only column 6", "customer=sara", "customer=meera",
     "<code>awk</code> cuts each line into columns (at the spaces) and prints only the 6th: the customer."],
    ["sort", "put equal names together", "customer=arjun", "customer=asha",
     "<code>sort</code> puts the names in order, so all the <code>asha</code> lines end up next to each other."],
    ["uniq -c", "count each name", "1 customer=arjun", "7 customer=asha",
     "<code>uniq -c</code> merges neighbouring equal lines and counts them. (That's why <code>sort</code> had to come first.)"],
    ["sort -rn | head -3", "biggest first, top 3", "7 customer=asha", "5 customer=sara",
     "<code>sort -rn</code> sorts by the number, biggest first; <code>head -3</code> keeps the top 3. Answer: <b>asha</b>, with 7 failed checkouts."]
  ];

  DiagramKit.register("pipe-flow", {
    title: "How data flows through a pipe",
    intro: "Pick a situation, then press <b>Play</b>. Each <code>|</code> sends one command's output into the next command.",
    state: { situation: "pipeline" },

    size: function (narrow) { return narrow ? [360, 640] : [840, 360]; },

    controls: function (ui, state, api) {
      ui.select({ label: "Situation:", value: state.situation,
        options: [{ value: "pipeline", label: "Who failed most? (a pipeline)" }, { value: "redirect", label: "Where does output go? (> and 2>)" }],
        onChange: function (v) { state.situation = v; api.reset(); } });
    },

    scene: function (s, state) {
      var n = s.narrow;
      if (state.situation === "pipeline") {
        var cmds = [], data = [], pipes = [], down = [];
        // shorter sample lines, so they fit in the boxes (phones get the shortest)
        var short = function (txt) {
          var t = txt.replace("…/checkout 500 … customer=", "500 … ").replace(" …", "");
          return n ? t.replace("customer=", "") : t;
        };
        var src = n ? s.box({ x: 90, y: 6, w: 180, h: 44, label: "access.log", sub: "2,000 lines" })
                    : s.box({ x: 20, y: 20, w: 800, h: 44, label: "logs/access.log", sub: "2,000 lines of requests" });
        STAGES.forEach(function (st, i) {
          if (n) {
            cmds.push(s.box({ x: 8, y: 78 + i * 110, w: 150, h: 56, label: st[0], sub: st[1] }));
            data.push(s.box({ x: 176, y: 78 + i * 110, w: 176, h: 56, label: short(st[2]), sub: short(st[3]), hidden: true }));
          } else {
            cmds.push(s.box({ x: 20 + i * 162, y: 110, w: 150, h: 60, label: st[0], sub: st[1] }));
            data.push(s.box({ x: 20 + i * 162, y: 230, w: 150, h: 70, label: short(st[2]), sub: short(st[3]), hidden: true }));
          }
        });
        var first = s.arrow(src, cmds[0], { dir: "v" });
        for (var i = 0; i < 4; i++) pipes.push(s.arrow(cmds[i], cmds[i + 1], { dir: n ? "v" : "h", label: n ? "" : "|" }));
        cmds.forEach(function (c, i) { down.push(s.arrow(c, data[i], { dir: n ? "h" : "v", dashed: true, hidden: true })); });

        return STAGES.map(function (st, i) {
          return {
            caption: "<b>" + (i + 1) + ". " + st[0] + "</b>: " + st[4],
            run: function (t) {
              cmds.forEach(function (c, j) { t.unmark(c); if (j < i) t.mark(c, "ok"); });
              t.mark(cmds[i], "active");
              var arrow = i === 0 ? first : pipes[i - 1];
              t.mark(arrow, "active");
              return t.packet(arrow, { label: "≡" }).then(function () {
                t.show(down[i]); t.show(data[i]); t.mark(data[i], i === 4 ? "ok" : "active");
                if (i > 0) t.unmark(data[i - 1]);
              });
            }
          };
        });
      }

      // redirect
      var prog, out, err, term, f1, f2;
      if (n) {
        prog = s.box({ x: 90, y: 10, w: 180, h: 56, label: "ls logs /nope", sub: "one good, one missing" });
        out = s.box({ x: 10, y: 140, w: 160, h: 56, label: "stdout (1)", sub: "normal output" });
        err = s.box({ x: 190, y: 140, w: 160, h: 56, label: "stderr (2)", sub: "error messages" });
        term = s.box({ x: 90, y: 300, w: 180, h: 56, label: "your terminal", sub: "the screen" });
        f1 = s.box({ x: 10, y: 460, w: 160, h: 56, label: "out.txt", sub: "a file", hidden: true });
        f2 = s.box({ x: 190, y: 460, w: 160, h: 56, label: "err.txt", sub: "a file", hidden: true });
      } else {
        prog = s.box({ x: 20, y: 140, w: 170, h: 64, label: "ls logs /nope", sub: "one good, one missing" });
        out = s.box({ x: 260, y: 60, w: 170, h: 60, label: "stdout (1)", sub: "normal output" });
        err = s.box({ x: 260, y: 230, w: 170, h: 60, label: "stderr (2)", sub: "error messages" });
        term = s.box({ x: 620, y: 140, w: 200, h: 64, label: "your terminal", sub: "the screen" });
        f1 = s.box({ x: 620, y: 20, w: 200, h: 56, label: "out.txt", sub: "a file", hidden: true });
        f2 = s.box({ x: 620, y: 270, w: 200, h: 56, label: "err.txt", sub: "a file", hidden: true });
      }
      s.arrow(prog, out); s.arrow(prog, err);
      var oT = s.arrow(out, term), eT = s.arrow(err, term), oF = s.arrow(out, f1, { hidden: true }), eF = s.arrow(err, f2, { hidden: true }), eF1 = s.arrow(err, f1, { hidden: true });
      function reset(t) { [oT, eT, oF, eF, eF1].forEach(function (a) { t.hide(a); t.unmark(a); }); [f1, f2, term].forEach(function (b) { t.unmark(b); }); }
      return [
        { caption: "Every program has <b>two outputs</b>: <b>stdout</b> for normal results and <b>stderr</b> for error messages. Here, <code>ls</code> can list <code>logs</code> but not <code>/nope</code>.",
          run: function (t) { t.mark(out, "active"); t.mark(err, "active"); } },
        { caption: "<code>ls logs /nope</code> with no redirection: <b>both</b> outputs go to your terminal, mixed together.",
          run: function (t) { t.unmark(out); t.unmark(err); reset(t); t.show(oT); t.show(eT); t.mark(oT, "active"); t.mark(eT, "active"); t.mark(term, "active"); } },
        { caption: "<code>ls logs /nope > out.txt</code>: <code>&gt;</code> sends <b>stdout</b> to the file. The error still appears on screen, because stderr wasn't redirected.",
          run: function (t) { reset(t); t.show(f1); t.show(oF); t.mark(oF, "active"); t.show(eT); t.mark(eT, "active"); t.mark(f1, "ok"); t.sub(f1, "logs: access.log"); } },
        { caption: "<code>… > out.txt 2> err.txt</code>: <code>2&gt;</code> sends <b>stderr</b> (stream number 2) to its own file. The screen stays clean.",
          run: function (t) { reset(t); t.show(f1); t.show(f2); t.show(oF); t.show(eF); t.mark(oF, "active"); t.mark(eF, "active"); t.mark(f1, "ok"); t.mark(f2, "bad"); t.sub(f1, "logs: access.log"); t.sub(f2, "cannot access '/nope'"); } },
        { caption: "<code>… > all.txt 2>&1</code>: <code>2&gt;&amp;1</code> means \"send stderr to the same place as stdout\". Both end up in one file. (Order matters: <code>&gt; file</code> first, then <code>2&gt;&amp;1</code>.)",
          run: function (t) { reset(t); t.hide(f2); t.show(f1); t.label(f1, "all.txt"); t.sub(f1, "both: the list + the error"); t.show(oF); t.show(eF1); t.mark(oF, "active"); t.mark(eF1, "active"); t.mark(f1, "ok"); } }
      ];
    }
  });
})();
