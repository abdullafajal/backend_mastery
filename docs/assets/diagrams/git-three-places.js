/* git-three-places — Module 3, Lesson 1.
 * Git's three places: the working folder, the staging area, the repository (.git).
 * Situation "save": edit → git add → git commit (a new commit on top of the old one).
 * Situation "undo": a bad edit → git restore brings back the last committed version.
 * Hashes and messages are from a real run of the lab. */
(function () {
  DiagramKit.register("git-three-places", {
    title: "Git's three places",
    intro: "Pick a situation, then press <b>Play</b>.",
    state: { sit: "save" },
    size: function (narrow) { return narrow ? [360, 520] : [840, 320]; },
    controls: function (ui, state, api) {
      ui.select({ label: "Situation:", value: state.sit,
        options: [{ value: "save", label: "Save a change (add + commit)" }, { value: "undo", label: "Undo a mistake (restore)" }],
        onChange: function (v) { state.sit = v; api.reset(); } });
    },
    scene: function (s, state) {
      var n = s.narrow, undo = state.sit === "undo", wf, env, st, c2, c1;
      if (n) {
        s.zone(6, 8, 348, 110, "WORKING FOLDER");
        wf = s.box({ x: 16, y: 40, w: 160, h: 56, label: "products.py", sub: "same as last commit" });
        env = s.box({ x: 184, y: 40, w: 160, h: 56, label: ".env", sub: "ignored" });
        s.zone(6, 160, 348, 110, "STAGING AREA");
        st = s.box({ x: 100, y: 192, w: 160, h: 56, label: "(empty)", sub: "nothing chosen yet", hidden: undo });
        s.zone(6, 312, 348, 200, "REPOSITORY (.git)");
        c2 = s.box({ x: 100, y: 344, w: 160, h: 56, label: "e13a128", sub: "Add Steel Water…", hidden: !undo });
        c1 = s.box({ x: 100, y: 438, w: 160, h: 56, label: "c42ea64", sub: "Add product catalog…" });
      } else {
        s.zone(10, 14, 260, 296, "WORKING FOLDER");
        wf = s.box({ x: 30, y: 80, w: 220, h: 60, label: "products.py", sub: "same as last commit" });
        env = s.box({ x: 30, y: 210, w: 220, h: 60, label: ".env", sub: "ignored by .gitignore" });
        s.zone(290, 14, 260, 296, "STAGING AREA");
        st = s.box({ x: 310, y: 80, w: 220, h: 60, label: "(empty)", sub: "nothing chosen yet", hidden: undo });
        s.zone(570, 14, 260, 296, "REPOSITORY (.git)");
        c2 = s.box({ x: 590, y: 80, w: 220, h: 60, label: "e13a128", sub: "Add Steel Water Bottle…", hidden: !undo });
        c1 = s.box({ x: 590, y: 210, w: 220, h: 60, label: "c42ea64", sub: "Add product catalog…" });
      }
      var dir = n ? "v" : "h";
      var add = s.arrow(wf, st, { dir: dir, label: n ? "" : "git add", hidden: undo });
      var commit = s.arrow(st, c2, { dir: dir, label: n ? "" : "git commit", hidden: undo });
      var parent = s.arrow(c2, c1, { dir: "v", dashed: true, label: "parent", hidden: !undo });
      var restore = s.arrow(c2, wf, { dir: dir, label: n ? "" : "git restore", hidden: true });

      if (undo) {
        return [
          { caption: "Two commits are saved. By mistake you run <code>echo oops > products.py</code>: the whole catalog is gone from the file. <code>git status --short</code> shows <code> M products.py</code>.",
            run: function (t) { t.mark(wf, "bad"); t.sub(wf, "\"oops\": 18 lines gone!"); } },
          { caption: "<code>git restore products.py</code> copies the file back from the <b>last commit</b> into your working folder.",
            run: function (t) { t.show(restore); t.mark(restore, "active"); t.mark(c2, "active"); return t.packet(restore, { label: "≡" }); } },
          { caption: "The catalog is back, with all 5 products. <code>git status</code>: <code>nothing to commit, working tree clean</code>. (Careful: changes you never committed can't come back this way.)",
            run: function (t) { t.unmark(restore); t.hide(restore); t.unmark(c2); t.unmark(wf); t.mark(wf, "ok"); t.sub(wf, "same as last commit"); } }
        ];
      }

      return [
        { caption: "Bazaar's repository has one commit, <code>c42ea64</code>: the catalog with 4 products. <code>.env</code> (the password file) is in <code>.gitignore</code>, so Git never touches it.",
          run: function (t) { t.mark(c1, "ok"); t.mark(env, "dim"); } },
        { caption: "You add <b>Steel Water Bottle</b> to <code>products.py</code>. Only the working folder changed. <code>git status --short</code> shows <code> M products.py</code> (M = modified).",
          run: function (t) { t.unmark(c1); t.mark(wf, "active"); t.sub(wf, "modified: +1 line"); } },
        { caption: "<code>git add products.py</code> puts this change on the <b>stage</b>: \"I want this in my next commit.\"",
          run: function (t) { t.mark(add, "active"); return t.packet(add, { label: "+1" }).then(function () { t.unmark(add); t.unmark(wf); t.sub(wf, "same as staged"); t.mark(st, "active"); t.label(st, "products.py"); t.sub(st, "+1 line, ready"); }); } },
        { caption: "<code>git commit -m \"Add Steel Water Bottle to the catalog\"</code> saves everything on the stage as a new commit, <code>e13a128</code>. The stage is empty again.",
          run: function (t) { t.mark(commit, "active"); return t.packet(commit, { label: "save" }).then(function () { t.unmark(commit); t.unmark(st); t.label(st, "(empty)"); t.sub(st, "nothing chosen yet"); t.show(c2); t.mark(c2, "ok"); t.sub(wf, "same as last commit"); }); } },
        { caption: "Each commit points to the one before it (its <b>parent</b>). <code>git log --oneline</code> lists them, newest first: <code>e13a128</code>, then <code>c42ea64</code>.",
          run: function (t) { t.show(parent); t.mark(parent, "active"); t.mark(c1, "ok"); } }
      ];
    }
  });
})();
