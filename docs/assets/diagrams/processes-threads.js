/* processes-threads — Module 1, Lesson 2.
 * One Bazaar server: the bazaar-backend process (3 threads sharing one memory)
 * plus three other processes, each with its own memory.
 * Situation "share": a thread changes the price; other threads see it, other processes don't.
 * Situation "crash": a process dies alone and is restarted; a bad thread hurts its whole process. */
DiagramKit.register("processes-threads", {
  title: "Processes and threads on one Bazaar server",
  intro: "Pick a situation, then press <b>Play</b>.",
  state: { situation: "share" },

  size: function (narrow) { return narrow ? [360, 660] : [840, 420]; },

  controls: function (ui, state, api) {
    ui.select({
      label: "Situation:",
      value: state.situation,
      options: [
        { value: "share", label: "Sharing memory" },
        { value: "crash", label: "Something goes wrong" }
      ],
      onChange: function (v) { state.situation = v; api.reset(); }
    });
  },

  scene: function (s, state) {
    var sup, web, upd, mem, w1, w2, img, supArrow = null;

    if (s.narrow) {
      s.zone(6, 6, 348, 648, "BAZAAR SERVER");
      s.zone(14, 30, 332, 320, "PROCESS bazaar-backend · PID 7");
      sup = s.box({ x: 24, y: 64, w: 140, h: 54, label: "supervisor", sub: "thread" });
      web = s.box({ x: 24, y: 160, w: 140, h: 54, label: "web requests", sub: "thread" });
      upd = s.box({ x: 24, y: 256, w: 140, h: 54, label: "price updater", sub: "thread" });
      mem = s.box({ x: 196, y: 110, w: 140, h: 150, label: "Memory", sub: "price = ₹999" });
      w1 = s.box({ x: 24, y: 380, w: 312, h: 60, label: "email-worker (process)", sub: "PID 8 · own memory" });
      w2 = s.box({ x: 24, y: 470, w: 312, h: 60, label: "email-worker (process)", sub: "PID 9 · own memory" });
      img = s.box({ x: 24, y: 560, w: 312, h: 60, label: "image-cache (process)", sub: "PID 10 · 100 MB of photos" });
    } else {
      s.zone(10, 10, 820, 400, "BAZAAR SERVER · one computer");
      s.zone(28, 40, 440, 350, "PROCESS bazaar-backend · PID 7");
      sup = s.box({ x: 48, y: 80, w: 180, h: 60, label: "supervisor", sub: "thread" });
      web = s.box({ x: 48, y: 185, w: 180, h: 60, label: "web requests", sub: "thread" });
      upd = s.box({ x: 48, y: 290, w: 180, h: 60, label: "price updater", sub: "thread" });
      mem = s.box({ x: 280, y: 130, w: 170, h: 170, label: "Memory", sub: "price = ₹999" });
      w1 = s.box({ x: 510, y: 70, w: 300, h: 70, label: "email-worker (process)", sub: "PID 8 · own memory" });
      w2 = s.box({ x: 510, y: 185, w: 300, h: 70, label: "email-worker (process)", sub: "PID 9 · own memory" });
      img = s.box({ x: 510, y: 300, w: 300, h: 70, label: "image-cache (process)", sub: "PID 10 · 100 MB of photos" });
      supArrow = s.arrow(sup, w1, { dir: "h", dashed: true, hidden: true, label: "restart" });
    }

    var webArrow = s.arrow(web, mem, { dir: "h" });
    var updArrow = s.arrow(upd, mem, { dir: "h" });
    var procs = [w1, w2, img];

    var intro = {
      caption: "This one computer runs <b>4 processes</b>: <code>bazaar-backend</code>, two <code>email-worker</code>s and <code>image-cache</code>. The operating system gives each one a number (<b>PID</b>) and <b>its own memory</b>.",
      run: function (t) { procs.forEach(function (p) { t.mark(p, "active"); }); }
    };

    if (state.situation === "share") {
      return [
        intro,
        {
          caption: "Inside <code>bazaar-backend</code> run <b>3 threads</b>. Threads are workers inside one process. They all use the <b>same memory</b>.",
          run: function (t) {
            procs.forEach(function (p) { t.unmark(p); });
            [sup, web, upd, mem].forEach(function (b) { t.mark(b, "active"); });
          }
        },
        {
          caption: "Sale time! The <b>price updater</b> thread changes the price of Red Running Shoes to ₹899 in memory.",
          run: function (t) {
            [sup, web, mem].forEach(function (b) { t.unmark(b); });
            t.mark(updArrow, "active");
            return t.packet(updArrow, { label: "₹" }).then(function () { t.sub(mem, "price = ₹899"); t.mark(mem, "active"); });
          }
        },
        {
          caption: "The <b>web requests</b> thread reads the same memory. It sees <b>₹899 at once</b>. No copying, no waiting. This is why threads are a fast way to share.",
          run: function (t) {
            t.unmark(upd); t.unmark(updArrow);
            t.mark(webArrow, "active");
            return t.packet(webArrow, { label: "₹", reverse: true }).then(function () {
              t.sub(web, "shows ₹899");
              t.mark(web, "ok");
            });
          }
        },
        {
          caption: "But each <b>email-worker</b> is a separate process with its own memory. It still thinks the price is <b>₹999</b>! Processes must talk to share data: through a database, a cache like Redis, or messages.",
          run: function (t) {
            t.unmark(webArrow);
            t.sub(w1, "PID 8 · own memory: ₹999");
            t.sub(w2, "PID 9 · own memory: ₹999");
            t.mark(w1, "bad");
            t.mark(w2, "bad");
          }
        }
      ];
    }

    return [
      intro,
      {
        caption: "An <b>email-worker</b> crashes (in the lab, you will <code>kill</code> it yourself). Only that one process stops.",
        run: function (t) {
          procs.forEach(function (p) { t.unmark(p); });
          t.mark(w1, "bad");
          t.sub(w1, "PID 8 · killed");
        }
      },
      {
        caption: "Everything else keeps running: the backend's threads, the other email-worker and the image-cache. Separate memory means a crash can't spread. This is called <b>isolation</b>.",
        run: function (t) {
          [sup, web, upd, w2, img].forEach(function (b) { t.mark(b, "ok"); });
        }
      },
      {
        caption: "The <b>supervisor</b> thread checks its workers every second. It sees one is gone and starts a <b>new process</b>, with a new PID.",
        run: function (t) {
          [web, upd, w2, img].forEach(function (b) { t.unmark(b); });
          t.unmark(sup); t.mark(sup, "active");
          var done = function () { t.unmark(w1); t.mark(w1, "ok"); t.sub(w1, "PID 44 · new, own memory"); };
          if (!supArrow) { done(); return; }
          t.show(supArrow); t.mark(supArrow, "active");
          return t.packet(supArrow, { label: "▶" }).then(done);
        }
      },
      {
        caption: "Threads have no such wall. A buggy <b>price updater</b> writes a broken price, <b>₹-1</b>, into the shared memory. The <b>web requests</b> thread shows it to every customer. One bad thread hurts its whole process.",
        run: function (t) {
          t.unmark(sup); t.unmark(w1);
          if (supArrow) t.hide(supArrow);
          t.mark(upd, "bad");
          t.mark(updArrow, "active");
          return t.packet(updArrow, { label: "!" }).then(function () {
            t.sub(mem, "price = ₹-1");
            t.mark(mem, "bad");
            t.unmark(updArrow);
            t.mark(webArrow, "active");
            return t.packet(webArrow, { label: "!", reverse: true });
          }).then(function () {
            t.sub(web, "shows ₹-1");
            t.mark(web, "bad");
          });
        }
      }
    ];
  }
});
