/* path-lookup — Module 0, Lesson 3.
 * You type `python3`. The shell searches the PATH folders in order and runs
 * the FIRST python3 it finds. Three scenarios show the three classic outcomes:
 * found the right one, found an old one, found nothing. */
(function () {
  var FOLDERS = ["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin"];

  // What is inside each folder, per scenario. null = no python3 in that folder.
  var SCENARIOS = {
    installed: {
      label: "I installed Python 3.13",
      has: [null, "3.13", "3.9"],
      result: "Python 3.13.18",
      good: true,
      end: "The shell stops at the <b>first</b> match. You get Python 3.13. Ready for Bazaar!"
    },
    old: {
      label: "I installed nothing (Mac)",
      has: [null, null, "3.9"],
      result: "Python 3.9.6",
      good: false,
      end: "It ran an <b>old</b> Python that came with the Mac. No error, but the wrong version. Always check with <code>python3 --version</code>."
    },
    none: {
      label: "Python is not anywhere",
      has: [null, null, null],
      result: "command not found",
      good: false,
      end: "No folder has <code>python3</code>, so the shell gives up: <code>command not found: python3</code>. Install Python, or fix PATH."
    }
  };

  DiagramKit.register("path-lookup", {
    title: "How your computer finds python3",
    intro: "Pick a situation, then press <b>Play</b>. Watch the shell search the PATH folders, in order.",
    state: { scenario: "installed" },

    size: function (narrow) { return narrow ? [360, 600] : [840, 360]; },

    controls: function (ui, state, api) {
      ui.select({
        label: "Situation:",
        value: state.scenario,
        options: Object.keys(SCENARIOS).map(function (k) { return { value: k, label: SCENARIOS[k].label }; }),
        onChange: function (v) { state.scenario = v; api.reset(); }
      });
    },

    scene: function (s, state) {
      var sc = SCENARIOS[state.scenario];
      var term, shell, folders = [], chain = [];

      function sub(i) { return sc.has[i] ? "python3 → Python " + sc.has[i] : "(no python3 here)"; }

      if (s.narrow) {
        term = s.box({ x: 70, y: 16, w: 220, h: 62, label: "Terminal", sub: "$ python3 --version" });
        shell = s.box({ x: 70, y: 130, w: 220, h: 62, label: "Shell", sub: "reads PATH" });
        FOLDERS.forEach(function (f, i) {
          folders.push(s.box({ x: 70, y: 260 + i * 112, w: 220, h: 62, label: f, sub: sub(i) }));
        });
        s.text(180, 238, "PATH: searched top to bottom", { anchor: "middle" });
      } else {
        term = s.box({ x: 16, y: 150, w: 190, h: 66, label: "Terminal", sub: "$ python3 --version" });
        shell = s.box({ x: 270, y: 150, w: 150, h: 66, label: "Shell", sub: "reads PATH" });
        FOLDERS.forEach(function (f, i) {
          folders.push(s.box({ x: 540, y: 40 + i * 110, w: 260, h: 62, label: f, sub: sub(i) }));
        });
        s.text(670, 26, "PATH = " + FOLDERS.join(" : "), { anchor: "middle" });
      }

      var typed = s.arrow(term, shell, { label: s.narrow ? "" : "python3" });
      chain.push(s.arrow(shell, folders[0], { label: s.narrow ? "" : "1st" }));
      chain.push(s.arrow(folders[0], folders[1], { label: "2nd" , offset: 0 }));
      chain.push(s.arrow(folders[1], folders[2], { label: "3rd", offset: 0 }));

      var steps = [
        {
          caption: "You type <code>python3 --version</code> in the <b>terminal</b> and press Enter.",
          run: function (t) { t.mark(term, "active"); }
        },
        {
          caption: "The <b>shell</b> (the program inside the terminal that reads your commands) gets the word <code>python3</code>. It must find a file with that name.",
          run: function (t) {
            t.unmark(term);
            t.mark(typed, "active");
            return t.packet(typed, { label: "py" }).then(function () { t.mark(shell, "active"); });
          }
        }
      ];

      // One step per folder, until the first match.
      var foundAt = sc.has.indexOf(sc.has.filter(Boolean)[0]);
      if (foundAt < 0) foundAt = -1;
      var lastChecked = foundAt >= 0 ? foundAt : FOLDERS.length - 1;

      for (var i = 0; i <= lastChecked; i++) {
        (function (i) {
          var hit = i === foundAt;
          steps.push({
            caption: hit
              ? "Folder " + (i + 1) + ", <code>" + FOLDERS[i] + "</code>: <b>python3 found!</b> The shell runs it and stops searching."
              : "Folder " + (i + 1) + ", <code>" + FOLDERS[i] + "</code>: no <code>python3</code> here. Try the next folder in PATH.",
            run: function (t) {
              t.unmark(shell);
              t.mark(chain[i], "active");
              return t.packet(chain[i], { label: "?" }).then(function () {
                t.mark(folders[i], hit ? (sc.good ? "ok" : "bad") : "dim");
              });
            }
          });
        })(i);
      }

      steps.push({
        caption: sc.end,
        run: function (t) {
          t.sub(term, sc.result);
          t.mark(term, sc.good ? "ok" : "bad");
        }
      });
      return steps;
    }
  });
})();
