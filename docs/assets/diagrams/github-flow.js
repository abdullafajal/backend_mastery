/* github-flow — Module 3, Lesson 5.
 * Two laptops and GitHub in the middle.
 * Situation "pr": clone → branch + commit → push → pull request → review → merge → pull.
 * Situation "rejected": Rohan pushes first, Neha's push is rejected, git pull --rebase, push again.
 * Messages are from a real run of the lab. */
(function () {
  DiagramKit.register("github-flow", {
    title: "Working together through GitHub",
    intro: "Pick a situation, then press <b>Play</b>.",
    state: { sit: "pr" },
    size: function (narrow) { return narrow ? [360, 380] : [840, 320]; },
    controls: function (ui, state, api) {
      ui.select({ label: "Situation:", value: state.sit,
        options: [{ value: "pr", label: "A pull request, start to finish" }, { value: "rejected", label: "Two pushes at once (rejected push)" }],
        onChange: function (v) { state.sit = v; api.reset(); } });
    },
    scene: function (s, state) {
      var n = s.narrow, nh, gh, ro, pr;
      if (n) {
        gh = s.box({ x: 90, y: 10, w: 180, h: 64, label: "GitHub", sub: "bazaar-team/bazaar" });
        nh = s.box({ x: 6, y: 150, w: 160, h: 64, label: "Neha's laptop", sub: "" });
        ro = s.box({ x: 194, y: 150, w: 160, h: 64, label: "Rohan's laptop", sub: "" });
        pr = s.box({ x: 90, y: 290, w: 180, h: 70, label: "Pull request #1", sub: "", hidden: true });
      } else {
        nh = s.box({ x: 20, y: 120, w: 220, h: 70, label: "Neha's laptop", sub: "" });
        gh = s.box({ x: 310, y: 30, w: 220, h: 80, label: "GitHub", sub: "bazaar-team/bazaar" });
        ro = s.box({ x: 600, y: 120, w: 220, h: 70, label: "Rohan's laptop", sub: "" });
        pr = s.box({ x: 310, y: 220, w: 220, h: 80, label: "Pull request #1", sub: "", hidden: true });
      }
      var nPush = s.arrow(nh, gh, { offset: -12, label: n ? "" : "push" });
      var nPull = s.arrow(gh, nh, { offset: 12, label: n ? "" : "pull" });
      var rPush = s.arrow(ro, gh, { offset: -12, label: n ? "" : "push" });
      var rPull = s.arrow(gh, ro, { offset: 12, label: n ? "" : "fetch / pull" });
      var review = s.arrow(ro, pr, { dashed: true, hidden: true, label: n ? "" : "review" });
      var merge = s.arrow(pr, gh, { dir: "v", hidden: true, label: n ? "" : "Merge" });
      function off(t, list) { list.forEach(function (x) { t.unmark(x); }); }
      var all = [nh, gh, ro, pr, nPush, nPull, rPush, rPull, review, merge];

      if (state.sit === "rejected") {
        return [
          { caption: "Both laptops are up to date: their <code>main</code> matches GitHub's <code>main</code>.",
            run: function (t) { t.sub(nh, "main = GitHub"); t.sub(ro, "main = GitHub"); t.mark(nh, "ok"); t.mark(ro, "ok"); } },
          { caption: "Rohan commits the returns policy and runs <code>git push</code> first. GitHub's <code>main</code> moves forward: <code>7cb3dd8..b8ae938  main -> main</code>.",
            run: function (t) { off(t, all); t.sub(ro, "+ returns policy"); t.mark(rPush, "active"); return t.packet(rPush, { label: "push" }).then(function () { t.sub(gh, "main: + returns policy"); t.mark(gh, "active"); }); } },
          { caption: "Neha commits the Masala Box stock and pushes. <b>Rejected</b>: <code>! [rejected] main -> main (fetch first)</code>. GitHub has a commit she doesn't have, and Git never overwrites it.",
            run: function (t) { off(t, all); t.sub(nh, "+ stock count"); t.mark(nPush, "active"); return t.packet(nPush, { label: "push" }).then(function () { t.mark(gh, "bad"); t.mark(nh, "bad"); t.sub(nh, "push rejected"); }); } },
          { caption: "<code>git pull --rebase</code>: download Rohan's commit, then replay Neha's commit on top of it (Lesson 4).",
            run: function (t) { off(t, all); t.mark(nPull, "active"); return t.packet(nPull, { label: "pull" }).then(function () { t.sub(nh, "stock on top of returns"); t.mark(nh, "active"); }); } },
          { caption: "Now <code>git push</code> works: <code>b8ae938..03ecf1a  main -> main</code>. Both changes are on GitHub, in a straight line.",
            run: function (t) { off(t, all); t.mark(nPush, "active"); return t.packet(nPush, { label: "push" }).then(function () { t.mark(gh, "ok"); t.sub(gh, "main: both changes"); t.mark(nh, "ok"); t.sub(nh, "main = GitHub"); }); } }
        ];
      }

      return [
        { caption: "<code>git clone</code>: each developer downloads a full copy of the repository, with all its history. Git calls GitHub's copy <code>origin</code>.",
          run: function (t) { t.mark(nPull, "active"); t.mark(rPull, "active");
            return Promise.all([t.packet(nPull, { label: "clone" }), t.packet(rPull, { label: "clone" })]).then(function () { t.sub(nh, "main"); t.sub(ro, "main"); }); } },
        { caption: "Neha makes a branch, <code>add-payment-info</code>, and commits. So far the commit exists <b>only on her laptop</b>.",
          run: function (t) { off(t, all); t.mark(nh, "active"); t.sub(nh, "add-payment-info: 1 commit"); } },
        { caption: "<code>git push -u origin add-payment-info</code> uploads the branch: <code>* [new branch] add-payment-info -> add-payment-info</code>.",
          run: function (t) { off(t, all); t.mark(nPush, "active"); return t.packet(nPush, { label: "push" }).then(function () { t.sub(gh, "+ branch add-payment-info"); t.mark(gh, "active"); }); } },
        { caption: "On GitHub's website, Neha opens a <b>pull request</b>: \"Please merge <code>add-payment-info</code> into <code>main</code>.\" It shows her commits and the exact diff.",
          run: function (t) { off(t, all); t.show(pr); t.mark(pr, "active"); t.sub(pr, "add-payment-info → main"); } },
        { caption: "Rohan <b>reviews</b> it: he reads the diff, asks questions in comments, and approves. Nothing reaches <code>main</code> without a second pair of eyes.",
          run: function (t) { off(t, all); t.show(review); t.mark(review, "active"); return t.packet(review, { label: "✓" }).then(function () { t.sub(pr, "1 approval ✓"); t.mark(pr, "ok"); }); } },
        { caption: "Someone clicks <b>Merge pull request</b>. GitHub makes the merge commit on <code>main</code>: <code>Merge pull request #1 from bazaar-team/add-payment-info</code>.",
          run: function (t) { off(t, all); t.show(merge); t.mark(merge, "active"); return t.packet(merge, { label: "merge" }).then(function () { t.sub(pr, "Merged"); t.sub(gh, "main: + merge commit"); t.mark(gh, "ok"); }); } },
        { caption: "The laptops don't change by themselves. Each one runs <code>git pull</code> to download the new <code>main</code>: <code>Fast-forward</code>.",
          run: function (t) { off(t, all); t.mark(nPull, "active"); t.mark(rPull, "active");
            return Promise.all([t.packet(nPull, { label: "pull" }), t.packet(rPull, { label: "pull" })]).then(function () { t.sub(nh, "main = GitHub"); t.sub(ro, "main = GitHub"); t.mark(nh, "ok"); t.mark(ro, "ok"); }); } }
      ];
    }
  });
})();
