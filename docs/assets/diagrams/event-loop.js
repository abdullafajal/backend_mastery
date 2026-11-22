/* event-loop — Module 5, Lesson 8 (plan: "the asyncio event loop juggling tasks").
 * Situation "await": three supplier tasks (0.3 s, 0.1 s, 0.2 s). The loop runs each until its await, then they all wait
 *   together; whichever is ready first is resumed first. Total 0.3 s (real output of asyncio_basics.py).
 * Situation "block": a task calls time.sleep instead of await asyncio.sleep: the loop is stuck, the others can't even start. */
(function () {
  var TASKS = [["Patel Spices", 0.3], ["Meera Handloom", 0.1], ["Kumar Footwear", 0.2]];

  DiagramKit.register("event-loop", {
    title: "The asyncio event loop",
    intro: "Pick a situation, then press <b>Play</b>.",
    state: { sit: "await" },
    size: function (narrow) { return narrow ? [360, 300] : [840, 300]; },
    controls: function (ui, state, api) {
      ui.select({ label: "Situation:", value: state.sit,
        options: [{ value: "await", label: "await asyncio.sleep (good)" }, { value: "block", label: "time.sleep inside async (blocks)" }],
        onChange: function (v) { state.sit = v; api.reset(); } });
    },
    scene: function (s, state) {
      var n = s.narrow, block = state.sit === "block", loop, tasks = [], arrows = [];
      if (n) {
        loop = s.box({ x: 70, y: 10, w: 220, h: 70, label: "event loop", sub: "time 0.0 s" });
        TASKS.forEach(function (t, i) { tasks.push(s.box({ x: 6 + i * 118, y: 170, w: 112, h: 80, label: t[0].split(" ")[0], sub: "not started" })); });
      } else {
        loop = s.box({ x: 40, y: 110, w: 240, h: 90, label: "event loop", sub: "one thread · time 0.0 s" });
        TASKS.forEach(function (t, i) { tasks.push(s.box({ x: 520, y: 20 + i * 95, w: 300, h: 72, label: "fetch_price(\"" + t[0] + "\", " + t[1] + ")", sub: "not started" })); });
      }
      tasks.forEach(function (b) { arrows.push(s.arrow(loop, b, { dir: n ? "v" : "h" })); });
      function clock(t, txt) { t.sub(loop, n ? txt : "one thread · " + txt); }
      function off(t) { arrows.forEach(function (a) { t.unmark(a); }); }

      if (block) {
        var steps = [];
        TASKS.forEach(function (tk, i) {
          steps.push({ caption: "The loop runs <b>" + tk[0] + "</b>. It calls <code>time.sleep(" + tk[1] + ")</code>, which doesn't give control back: the whole loop is <b>stuck</b> inside this task. The others can't even start.",
            run: function (t) { off(t); tasks.forEach(function (b, j) { t.unmark(b); if (j < i) t.mark(b, "ok"); }); t.mark(arrows[i], "bad"); t.mark(tasks[i], "bad"); t.sub(tasks[i], "blocking the loop…");
              clock(t, "time " + [0.0, 0.3, 0.4][i].toFixed(1) + " s"); } });
        });
        steps.push({ caption: "They ran <b>one after another</b>: 0.3 + 0.1 + 0.2 = 0.6 s, no better than plain code. In the lab, 10 such tasks take 1.0 s instead of 0.1 s. <b>Fix:</b> <code>await asyncio.sleep(…)</code> (and an async HTTP client, not a blocking one).",
          run: function (t) { off(t); tasks.forEach(function (b) { t.unmark(b); t.mark(b, "ok"); t.sub(b, "done (one by one)"); }); clock(t, "time 0.6 s"); t.mark(loop, "bad"); } });
        return steps;
      }

      return [
        { caption: "<code>asyncio.gather(…)</code> hands the event loop three tasks. The loop runs on <b>one</b> thread: it can run only one task at a time.",
          run: function (t) { t.mark(loop, "active"); } },
        { caption: "The loop runs <b>Patel</b> until its <code>await asyncio.sleep(0.3)</code>: \"I'm waiting, run someone else\". Then Meera until <i>her</i> await, then Kumar. In a blink, all three are asked and waiting.",
          run: function (t) { t.unmark(loop); var p = Promise.resolve(); arrows.forEach(function (a, i) { p = p.then(function () { t.mark(a, "active"); return t.packet(a, { label: "ask" }).then(function () { t.unmark(a); t.mark(tasks[i], "active"); t.sub(tasks[i], "waiting (await)"); }); }); }); return p; } },
        { caption: "At 0.1 s, <b>Meera</b>'s answer is ready first. The loop resumes Meera right after her <code>await</code>; she returns 100.",
          run: function (t) { off(t); clock(t, "time 0.1 s"); t.mark(arrows[1], "active"); return t.packet(arrows[1], { label: "go" }).then(function () { t.unmark(tasks[1]); t.mark(tasks[1], "ok"); t.sub(tasks[1], "reply → 100"); }); } },
        { caption: "At 0.2 s, <b>Kumar</b> is ready: resumed, returns 200.",
          run: function (t) { off(t); clock(t, "time 0.2 s"); t.mark(arrows[2], "active"); return t.packet(arrows[2], { label: "go" }).then(function () { t.unmark(tasks[2]); t.mark(tasks[2], "ok"); t.sub(tasks[2], "reply → 200"); }); } },
        { caption: "At 0.3 s, <b>Patel</b>: returns 300. <code>gather</code> gives back <code>[300, 100, 200]</code>, in the order you passed them, after <b>0.3 s</b> total: the longest wait, not the sum.",
          run: function (t) { off(t); clock(t, "time 0.3 s"); t.mark(arrows[0], "active"); return t.packet(arrows[0], { label: "go" }).then(function () { t.unmark(tasks[0]); t.mark(tasks[0], "ok"); t.sub(tasks[0], "reply → 300"); t.mark(loop, "ok"); }); } }
      ];
    }
  });
})();
