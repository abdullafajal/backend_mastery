/* commit-graph — Module 3 (plan: "interactive commit graph: type a git command, see the graph change").
 * A tiny Git simulator. It understands: git commit [-m "msg"], git branch, git branch <name>,
 * git branch -d <name>, git switch <name>, git switch -c <name>, git checkout [-b] <name>,
 * git merge <name>, git merge --abort, git add <file>, git rebase <name>.
 * Situations: "story" (Lesson 2), "merge" (Lesson 3), "rebase" (Lesson 4), "own" (type your own commands).
 * Pick the starting situation on the page with data-state-sit="merge".
 * The stories use real commands and hashes from the labs. The simulator never looks at file contents,
 * so in "own" mode merges never conflict; the "merge" story marks Rohan's branch as conflicting.
 * Steps are cumulative, so the whole graph is simulated from the command list on every redraw. */
(function () {
  var BASE = [
    { id: "7bb892c", msg: "Add product catalog with 4 products", parents: [], lane: 0 },
    { id: "66d2406", msg: "Add Steel Water Bottle to the catalog", parents: [0], lane: 0 }
  ];
  var PRESETS = {
    story: {
      label: "Neha's Diwali branch (Lesson 2)",
      start: BASE, br: { main: 1 }, lanes: { main: 0 },
      cmds: [
        'git branch',
        'git switch -c diwali-sale',
        'git commit -m "Add Diwali sale prices"',
        'git switch main',
        'git commit -m "List our sellers in the README"',
        'git switch diwali-sale'
      ],
      ids: ["a801912", "347935d"],   // from a real run of the lab (your hashes will differ)
      notes: [
        "Only one branch so far. The <code>*</code> marks the branch you are on: <code>main</code>.",
        "A new branch label, <code>diwali-sale</code>, is stuck on the <b>same commit</b> as <code>main</code>. You moved to it (the <code>*</code> moved). No files changed.",
        "The new commit goes on the branch you are on. <code>diwali-sale</code> moves forward to it; <code>main</code> stays where it was.",
        "Back on <code>main</code>. Git changes your files to match <code>main</code>'s commit: <code>sale.py</code> disappears from the folder. It is safe in <code>a801912</code>.",
        "A small fix on <code>main</code>. Now the two branches have <b>split</b>: each has a commit the other doesn't. Lesson 3 joins them again with <code>git merge</code>.",
        "Back on <code>diwali-sale</code>: <code>sale.py</code> is back, and README doesn't have the sellers line. Each branch keeps its own version of the files."
      ]
    },
    merge: {
      label: "Merging the Diwali sale (Lesson 3)",
      start: BASE.concat([
        { id: "7ceaef0", msg: "Add Diwali sale prices", parents: [1], lane: 1 },
        { id: "0ae5e66", msg: "Raise Diwali discount to ₹200", parents: [2], lane: 2 },
        { id: "e99e154", msg: "List our sellers in the README", parents: [1], lane: 0 },
        { id: "7434337", msg: "Add the support email to the README", parents: [4], lane: 0 }
      ]),
      br: { main: 5, "diwali-sale": 2, "rohan-discount": 3 }, lanes: { main: 0, "diwali-sale": 1, "rohan-discount": 2 },
      conflicts: { "rohan-discount": "sale.py" },
      cmds: [
        'git merge diwali-sale',
        'git commit -am "Set Diwali discount to ₹150"',
        'git merge rohan-discount',
        'git add sale.py',
        'git commit -m "Merge rohan-discount: keep the ₹150 discount the team agreed"'
      ],
      ids: ["398c299", "4b961a1", "a3f7248"],
      notes: [
        "<code>main</code> and <code>diwali-sale</code> have split, so Git makes a <b>merge commit</b>, <code>398c299</code>, with <b>two parents</b>. Now <code>main</code> has <code>sale.py</code> too.",
        "Neha sets the discount to ₹150 on <code>main</code>. But Rohan already changed <b>the same line</b> to ₹200 on <code>rohan-discount</code>.",
        "<b>CONFLICT</b> in <code>sale.py</code>. Git can't choose between ₹150 and ₹200, so it stops, writes both into the file between <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> and <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> markers, and waits for you. No commit yet.",
        "Neha talks to Rohan: the team agrees on ₹150. She edits the file (keeps ₹150, deletes the markers), then <code>git add sale.py</code> = \"this conflict is fixed\".",
        "The commit finishes the merge: <code>a3f7248</code> has two parents. Both branches are now part of <code>main</code>, and the discount is ₹150."
      ]
    },
    rebase: {
      label: "Rohan rebases his branch (Lesson 4)",
      start: BASE.concat([
        { id: "3d5cfad", msg: "Add Diwali sale prices", parents: [1], lane: 0 },
        { id: "79d769b", msg: "Add delivery charge rule", parents: [2], lane: 1 },
        { id: "f46d2ff", msg: "Add delivery examples", parents: [3], lane: 1 },
        { id: "f2939ea", msg: "Add the support email to the README", parents: [2], lane: 0 }
      ]),
      br: { main: 5, "free-delivery": 4 }, lanes: { main: 0, "free-delivery": 1 }, head: "free-delivery",
      cmds: [
        'git rebase main',
        'git switch main',
        'git merge free-delivery',
        'git branch -d free-delivery'
      ],
      ids: ["96286bf", "27ff12f"],   // from a real run of the lab (rebased commits get new hashes every time)
      notes: [
        "Git takes Rohan's 2 commits and <b>replays</b> them, one by one, on top of <code>main</code>'s newest commit <code>f2939ea</code>. The copies get <b>new hashes</b> (<code>96286bf</code>, <code>27ff12f</code>). The old ones (grey) are left behind: no branch points to them any more.",
        "Back on <code>main</code>. <code>main</code> is now simply <b>behind</b> <code>free-delivery</code>, in one straight line.",
        "So the merge is a <b>fast-forward</b>: the <code>main</code> label just moves forward. No merge commit, no bubble.",
        "Branch deleted; its work is in <code>main</code>. Compare with Lesson 3: the history is one straight line, as if Rohan had started after Neha's commit."
      ]
    },
    own: { label: "Type your own commands", start: BASE, br: { main: 1 }, lanes: { main: 0 } }
  };
  var MAX = 10, MAXLANES = 3;

  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fakeId(n) { var x = (n * 2654435761 + 12345) >>> 0; return ("000000" + x.toString(16)).slice(-7); }
  function copy(o) { var r = {}; for (var k in o) r[k] = o[k]; return r; }

  // Run all commands. Returns { commits, snaps: [state after each command], results, start }.
  function simulate(cmds, preset) {
    var commits = preset.start.map(function (c) { return { id: c.id, msg: c.msg, parents: c.parents.slice(), lane: c.lane, at: -1 }; });
    var br = copy(preset.br), lane = copy(preset.lanes), head = preset.head || "main", made = 0, pending = null;
    var nextLane = Math.max.apply(null, Object.keys(lane).map(function (k) { return lane[k]; })) + 1;
    var ids = preset.ids, conflicts = preset.conflicts || {};
    var snaps = [], results = [];
    function snap() { snaps.push({ br: copy(br), head: head, pending: pending }); }
    function reach(from, target) {       // is commit `target` an ancestor of (or equal to) `from`?
      var todo = [from], seen = {};
      while (todo.length) { var c = todo.pop(); if (c === target) return true; if (seen[c]) continue; seen[c] = 1; todo = todo.concat(commits[c].parents); }
      return false;
    }
    function newCommit(msg, parents, k) {
      if (commits.length >= MAX) return "This small diagram holds " + MAX + " commits. Press Clear to start again.";
      commits.push({ id: (ids && ids[made]) || fakeId(commits.length), msg: msg, parents: parents, lane: lane[head], at: k });
      made++;
      br[head] = commits.length - 1;
      return null;
    }
    function addBranch(name) {
      if (br[name] != null) return { err: "fatal: a branch named '" + name + "' already exists" };
      br[name] = br[head]; lane[name] = Math.min(nextLane++, MAXLANES - 1);
      return {};
    }
    cmds.forEach(function (raw, k) {
      var cmd = raw.trim().replace(/\s+/g, " "), m, r = {};
      var msgM = cmd.match(/^git commit(?: -a)?(?: -am| -m) ["']?(.*?)["']?$/);
      if (pending && !/^git (commit|add|merge --abort|status)\b/.test(cmd)) {
        r.err = "You are in the middle of a merge. Fix the conflict, git add the file, then git commit (or: git merge --abort).";
      } else if (msgM || /^git commit( -a)?$/.test(cmd)) {
        var msg = msgM ? msgM[1] : "Commit " + (commits.length + 1);
        var parents = pending ? [br[head], br[pending.from]] : [br[head]];
        var e = newCommit(msg || "Commit", parents, k);
        if (e) r.err = e;
        else if (pending) { r.text = "Merge commit <code>" + commits[commits.length - 1].id + "</code> with <b>two parents</b> finishes the merge."; pending = null; }
        else r.text = "New commit <code>" + commits[commits.length - 1].id + "</code> on <code>" + esc(head) + "</code>. The <code>" + esc(head) + "</code> label moved forward to it.";
      } else if ((m = cmd.match(/^git add (\S+)$/))) {
        r.text = pending ? "<code>" + esc(m[1]) + "</code> is marked as fixed. Now <code>git commit</code> finishes the merge."
                         : "<code>" + esc(m[1]) + "</code> is on the stage. (This diagram only draws commits.)";
      } else if (cmd === "git merge --abort") {
        if (!pending) r.err = "fatal: There is no merge to abort (MERGE_HEAD missing).";
        else { pending = null; r.text = "Merge cancelled. Everything is back to how it was before <code>git merge</code>."; }
      } else if (cmd === "git branch") {
        r.text = "<code>git branch</code> lists the branches; <code>*</code> = the one you are on: " + Object.keys(br).sort().map(function (b) { return "<code>" + (b === head ? "* " : "") + esc(b) + "</code>"; }).join(", ") + ".";
      } else if ((m = cmd.match(/^git branch -[dD] (\S+)$/))) {
        var d = m[1], force = cmd.indexOf("-D") > 0;
        if (br[d] == null) r.err = "error: branch '" + d + "' not found";
        else if (d === head) r.err = "error: cannot delete branch '" + d + "' used by worktree";
        else if (!force && !reach(br[head], br[d])) r.err = "error: the branch '" + d + "' is not fully merged";
        else { delete br[d]; r.text = "Deleted branch <code>" + esc(d) + "</code>. Only the label is gone; its commits are already part of <code>" + esc(head) + "</code>."; }
      } else if ((m = cmd.match(/^git branch (\S+)$/))) {
        var a = addBranch(m[1]);
        r.err = a.err; if (!a.err) r.text = "New label <code>" + esc(m[1]) + "</code> on the current commit. You are still on <code>" + esc(head) + "</code> (<code>git branch</code> doesn't switch).";
      } else if ((m = cmd.match(/^git (?:switch -c|checkout -b) (\S+)$/))) {
        var b = addBranch(m[1]);
        r.err = b.err; if (!b.err) { head = m[1]; r.text = "New branch <code>" + esc(m[1]) + "</code>, and you moved to it. Same commit, same files."; }
      } else if ((m = cmd.match(/^git (?:switch|checkout) (\S+)$/))) {
        if (br[m[1]] == null) r.err = "fatal: invalid reference: " + m[1];
        else { head = m[1]; r.text = "Switched to <code>" + esc(head) + "</code>. Your files now match its newest commit, <code>" + commits[br[head]].id + "</code>."; }
      } else if ((m = cmd.match(/^git merge (\S+)$/))) {
        var t = m[1];
        if (br[t] == null) r.err = "merge: " + t + " - not something we can merge";
        else if (reach(br[head], br[t])) r.text = "Already up to date: <code>" + esc(head) + "</code> already has every commit of <code>" + esc(t) + "</code>.";
        else if (reach(br[t], br[head])) { br[head] = br[t]; r.text = "<b>Fast-forward</b>: <code>" + esc(head) + "</code> was behind, so its label just moved forward to <code>" + commits[br[t]].id + "</code>. No new commit."; }
        else if (conflicts[t]) { pending = { from: t, file: conflicts[t] }; r.text = "CONFLICT (content): Merge conflict in " + esc(conflicts[t]) + ". Fix the file, <code>git add</code> it, then <code>git commit</code>."; }
        else {
          var e2 = newCommit("Merge branch '" + t + "'", [br[head], br[t]], k);
          if (e2) r.err = e2; else r.text = "A <b>merge commit</b> <code>" + commits[commits.length - 1].id + "</code> with <b>two parents</b> joins <code>" + esc(t) + "</code> into <code>" + esc(head) + "</code>.";
        }
      } else if ((m = cmd.match(/^git rebase (\S+)$/))) {
        var u = m[1];
        if (br[u] == null) r.err = "fatal: invalid upstream '" + u + "'";
        else if (reach(br[head], br[u])) r.text = "Current branch <code>" + esc(head) + "</code> is up to date: it already has every commit of <code>" + esc(u) + "</code>.";
        else if (reach(br[u], br[head])) { br[head] = br[u]; r.text = "Successfully rebased: <code>" + esc(head) + "</code> had no commits of its own, so its label just moved to <code>" + commits[br[u]].id + "</code>."; }
        else {
          var todo = [], c = br[head];
          while (!reach(br[u], c)) { todo.unshift(c); c = commits[c].parents[0]; }   // my commits that aren't in u, oldest first
          if (commits.length + todo.length > MAX) r.err = "This small diagram holds " + MAX + " commits. Press Clear to start again.";
          else {
            var base = br[u], ln = commits[br[u]].lane, made2 = [];
            todo.forEach(function (old) {
              commits.push({ id: (ids && ids[made]) || fakeId(commits.length), msg: commits[old].msg, parents: [base], lane: ln, at: k });
              made++; base = commits.length - 1; commits[old].goneAt = k; made2.push(commits[base].id);
            });
            br[head] = base;
            r.text = "Successfully rebased. " + todo.length + " commit(s) of <code>" + esc(head) + "</code> were copied on top of <code>" + esc(u) + "</code> with new hashes (" + made2.join(", ") + "). The old ones are grey.";
          }
        }
      } else if ((m = cmd.match(/^git ([a-z-]+)/)) && ["commit", "branch", "switch", "checkout", "merge", "add", "rebase"].indexOf(m[1]) < 0) {
        r.err = "git: '" + m[1] + "' is not a git command. See 'git --help'. (This diagram knows: commit, branch, switch, checkout, merge, add, rebase.)";
      } else {
        r.err = "This diagram knows: git commit -m \"…\", git branch [name], git branch -d name, git switch [-c] name, git merge name, git rebase name";
      }
      results.push(r); snap();
    });
    return { commits: commits, snaps: snaps, results: results, start: { br: copy(preset.br), head: preset.head || "main", pending: null } };
  }

  DiagramKit.register("commit-graph", {
    title: "The commit graph",
    intro: "Press <b>Play</b> to watch the story, or pick <b>Type your own commands</b> and try Git yourself.",
    state: { sit: "story", own: [] },
    size: function (narrow) { return narrow ? [360, 20 + MAX * 58] : [840, 330]; },

    controls: function (ui, state, api) {
      if (!PRESETS[state.sit]) state.sit = "story";
      var sel = ui.select({ label: "Situation:", value: state.sit,
        options: Object.keys(PRESETS).map(function (k) { return { value: k, label: PRESETS[k].label }; }),
        onChange: function (v) { state.sit = v; note.textContent = ""; api.reset(); } });
      var inp = ui.input({ label: "$", value: "", width: "15rem", onChange: function () { run(); } });
      inp.placeholder = "git switch -c my-idea";
      inp.setAttribute("aria-label", "Type a git command");
      ui.button("Run", function () { run(); });
      ui.button("Clear", function () { state.own = []; note.textContent = ""; if (state.sit === "own") api.reset(); });
      var note = ui.note("");
      note.className = "bz-diagram__note";
      function run() {
        var c = inp.value.trim();
        if (!c) return;
        if (state.sit !== "own") { state.sit = "own"; sel.value = "own"; }
        var r = simulate(state.own.concat([c]), PRESETS.own);
        var last = r.results[r.results.length - 1];
        note.textContent = last.err ? last.err : "";      // textContent: user input is never parsed as HTML
        if (last.err) return;
        state.own.push(c); inp.value = "";
        api.goTo(state.own.length - 1);
      }
    },

    scene: function (s, state) {
      var preset = PRESETS[state.sit] || PRESETS.story, n = s.narrow;
      var own = state.sit === "own";
      var cmds = own ? state.own : preset.cmds;
      var sim = simulate(cmds, preset);
      var all = [sim.start].concat(sim.snaps);
      var boxes = [], LY = [90, 190, 290], LX = [6, 124, 242];

      function pos(i) {
        var c = sim.commits[i];
        return n ? { x: LX[c.lane], y: 10 + i * 58, w: 112, h: 42 } : { x: 18 + i * 80, y: LY[c.lane] - 18, w: 72, h: 36 };
      }
      function labelsAt(st, i) {           // branch names on commit i, current branch first with "*"
        return Object.keys(st.br).filter(function (b) { return st.br[b] === i; })
          .sort(function (a, b) { return (b === st.head) - (a === st.head) || (a < b ? -1 : 1); })
          .map(function (b) { return (b === st.head ? "* " : "") + b; });
      }

      sim.commits.forEach(function (c, i) {
        var p = pos(i);
        boxes.push(s.box({ x: p.x, y: p.y, w: p.w, h: p.h, label: c.id, sub: n ? labelsAt(sim.start, i).join(", ") : "", hidden: c.at >= 0 }));
      });
      var arrows = [];
      sim.commits.forEach(function (c, i) {
        c.parents.forEach(function (pi) {
          var same = sim.commits[pi].lane === c.lane;
          arrows.push({ at: c.at, a: s.arrow(boxes[i], boxes[pi], { dir: n && same ? "v" : "h", dashed: !same, hidden: c.at >= 0 }) });   // across lanes: side to side, never through a box
        });
      });

      // Desktop: one set of branch-label boxes per state, above the commit. Only the current state's set is shown.
      var labelSets = [];
      if (!n) {
        all.forEach(function (st, k) {
          var set = [];
          sim.commits.forEach(function (c, i) {
            labelsAt(st, i).forEach(function (txt, j) {
              var p = pos(i), w = Math.max(80, txt.length * 8 + 12);
              var bx = s.box({ x: p.x + p.w / 2 - w / 2, y: p.y - 26 - j * 26, w: w, h: 22, label: txt, hidden: k !== 0 });
              set.push({ box: bx, cur: txt.charAt(0) === "*" });
            });
          });
          labelSets.push(set);
        });
        labelSets[0].forEach(function (l) { if (l.cur) l.box.g.classList.add("is-active"); });
      }
      boxes[sim.start.br[sim.start.head]].g.classList.add("is-ok");   // the start: you are on your branch's newest commit

      function show(t, k) {                 // show the graph as it is after state k (0 = start)
        if (n) {
          sim.commits.forEach(function (c, i) { t.sub(boxes[i], labelsAt(all[k], i).join(", ")); });
        } else {
          labelSets.forEach(function (set, j) { set.forEach(function (l) { if (j === k) { t.show(l.box); if (l.cur) t.mark(l.box, "active"); } else t.hide(l.box); }); });
        }
        var st = all[k], head = st.br[st.head];
        boxes.forEach(function (b, i) { t.unmark(b); if (i === head) t.mark(b, st.pending ? "bad" : "ok"); else if (sim.commits[i].goneAt != null && sim.commits[i].goneAt < k) t.mark(b, "dim"); });
        if (st.pending) t.mark(boxes[st.br[st.pending.from]], "bad");
      }

      return cmds.map(function (c, k) {
        var r = sim.results[k];
        var cap = "<code>" + esc(c) + "</code>: " + (own ? (r.err ? esc(r.err) : r.text) : preset.notes[k]);
        return {
          caption: cap,
          run: function (t) {
            sim.commits.forEach(function (cm, i) { if (cm.at === k) t.show(boxes[i]); });
            arrows.forEach(function (a) { if (a.at === k) t.show(a.a); });
            show(t, k + 1);
            var fresh = sim.commits.map(function (cm, i) { return cm.at === k ? i : -1; }).filter(function (i) { return i >= 0; });
            if (fresh.length) t.mark(boxes[fresh[0]], "active");
          }
        };
      });
    }
  });
})();
