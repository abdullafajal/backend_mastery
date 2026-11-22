/* permission-check — Module 2, Lesson 3.
 * How the kernel decides "allowed or Permission denied": pick WHO (a process's user and groups)
 * and WHAT (a file or folder with owner, group and mode). The kernel checks, in order:
 * root? → owner? → in the file's group? → everyone else — and uses exactly ONE set of rwx bits. */
(function () {
  var USERS = {
    asha: { label: "asha", uid: 1000, groups: ["asha", "bazaar", "sudo"] },
    ravi: { label: "ravi", uid: 1001, groups: ["ravi"] },
    www: { label: "www-data", uid: 33, groups: ["www-data"] },
    root: { label: "root", uid: 0, groups: ["root"] }
  };
  var TARGETS = {
    env: { label: "read .env", file: ".env", owner: "root", group: "bazaar", mode: "rw-r-----", octal: "640", need: "r", needText: "read (r)" },
    conf: { label: "change bazaar.conf", file: "config/bazaar.conf", owner: "root", group: "bazaar", mode: "rw-r--r--", octal: "644", need: "w", needText: "write (w)" },
    upl: { label: "save a photo in uploads/", file: "media/uploads/", owner: "www-data", group: "www-data", mode: "rwxr-xr-x", octal: "755", need: "w", needText: "write (w) on the folder" }
  };

  function decide(u, f) {
    if (u.uid === 0) return { who: "root", bits: "all", ok: true };
    var set = u.label === f.owner ? "owner" : (u.groups.indexOf(f.group) >= 0 ? "group" : "others");
    var bits = set === "owner" ? f.mode.slice(0, 3) : set === "group" ? f.mode.slice(3, 6) : f.mode.slice(6, 9);
    return { who: set, bits: bits, ok: bits.indexOf(f.need) >= 0 };
  }

  DiagramKit.register("permission-check", {
    title: "Allowed, or Permission denied?",
    intro: "Choose <b>who</b> and <b>what</b>, then press <b>Play</b>. The kernel picks exactly <b>one</b> set of rwx bits, and checks only that.",
    state: { who: "ravi", what: "env" },

    size: function (narrow) { return narrow ? [360, 620] : [840, 360]; },

    controls: function (ui, state, api) {
      ui.select({ label: "Who:", value: state.who,
        options: Object.keys(USERS).map(function (k) { return { value: k, label: USERS[k].label }; }),
        onChange: function (v) { state.who = v; api.reset(); } });
      ui.select({ label: "wants to:", value: state.what,
        options: Object.keys(TARGETS).map(function (k) { return { value: k, label: TARGETS[k].label }; }),
        onChange: function (v) { state.what = v; api.reset(); } });
    },

    scene: function (s, state) {
      var u = USERS[state.who], f = TARGETS[state.what], d = decide(u, f), n = s.narrow;
      var proc, file, q = [], result;
      var procSub = "uid " + u.uid + " · groups: " + u.groups.join(", ");
      var fileSub = f.owner + ":" + f.group + "  " + f.mode.slice(0, 3) + " " + f.mode.slice(3, 6) + " " + f.mode.slice(6, 9) + "  (" + f.octal + ")";
      var qs = [["root?", "root skips the checks"], ["the owner?", "bits 1–3: " + f.mode.slice(0, 3)], ["in the group?", "bits 4–6: " + f.mode.slice(3, 6)], ["everyone else", "bits 7–9: " + f.mode.slice(6, 9)]];
      if (n) {
        proc = s.box({ x: 10, y: 10, w: 340, h: 56, label: "process running as " + u.label, sub: procSub });
        file = s.box({ x: 10, y: 80, w: 340, h: 56, label: f.file, sub: fileSub });
        qs.forEach(function (x, i) { q.push(s.box({ x: 60, y: 170 + i * 82, w: 240, h: 56, label: x[0], sub: x[1] })); });
        result = s.box({ x: 10, y: 520, w: 340, h: 60, label: "…", sub: "" });
      } else {
        proc = s.box({ x: 20, y: 20, w: 390, h: 60, label: "process running as " + u.label, sub: procSub });
        file = s.box({ x: 430, y: 20, w: 390, h: 60, label: f.file, sub: fileSub });
        qs.forEach(function (x, i) { q.push(s.box({ x: 20 + i * 205, y: 130, w: 185, h: 60, label: x[0], sub: x[1] })); });
        result = s.box({ x: 20, y: 250, w: 800, h: 64, label: "…", sub: "" });
      }
      var arrows = [];
      for (var i = 0; i < 3; i++) arrows.push(s.arrow(q[i], q[i + 1], { label: n ? "" : "no" }));

      var stop = { root: 0, owner: 1, group: 2, others: 3 }[d.who];
      var steps = [{
        caption: "<b>" + u.label + "</b> wants to <b>" + f.label + "</b>. That needs the <b>" + f.needText + "</b> permission. The kernel compares the process's user and groups with the file's owner, group and mode.",
        run: function (t) { t.mark(proc, "active"); t.mark(file, "active"); }
      }];
      for (var k = 0; k <= stop; k++) {
        (function (k) {
          var hit = k === stop;
          var text = ["Is the process <b>root</b> (uid 0)?", "Is <b>" + u.label + "</b> the file's <b>owner</b> (" + f.owner + ")?",
                      "Is one of <b>" + u.label + "</b>'s groups the file's <b>group</b> (" + f.group + ")?", "Not the owner, not in the group: use the <b>others</b> bits."][k];
          steps.push({
            caption: text + (k === 3 ? "" : hit ? " <b>Yes.</b>" : " No: next question."),
            run: function (t) {
              t.unmark(proc); t.unmark(file);
              if (k > 0) { t.unmark(q[k - 1]); t.mark(q[k - 1], "dim"); t.mark(arrows[k - 1], "active"); }
              t.mark(q[k], "active");
              if (k > 0) return t.packet(arrows[k - 1], { label: "?" });
            }
          });
        })(k);
      }
      steps.push({
        caption: d.who === "root"
          ? "<b>Allowed.</b> root (uid 0) is not checked against read/write bits at all. That's why root is powerful, and dangerous."
          : (d.ok
            ? "<b>Allowed.</b> The " + d.who + " bits are <code>" + d.bits + "</code>, which include <code>" + f.need + "</code>. The other bits are never looked at."
            : "<b>Permission denied.</b> The " + d.who + " bits are <code>" + d.bits + "</code>: no <code>" + f.need + "</code>. It doesn't matter what the other sets allow; the kernel only uses this one."),
        run: function (t) {
          t.unmark(q[stop]); t.mark(q[stop], d.ok ? "ok" : "bad");
          t.label(result, d.ok ? "Allowed" : "Permission denied");
          t.sub(result, d.who === "root" ? "root skips the check" : "used the " + d.who + " bits: " + d.bits);
          t.mark(result, d.ok ? "ok" : "bad");
        }
      });
      return steps;
    }
  });
})();
