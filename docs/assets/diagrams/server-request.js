/* server-request — Module 1, Lesson 5.
 * One request through Bazaar's server: network card -> kernel -> socket -> process,
 * which then uses CPU, RAM, disk and file descriptors. Pick what runs out, and see
 * what the customer experiences. */
(function () {
  var PROBLEMS = {
    none: { label: "Nothing (a healthy server)" },
    cpu: {
      label: "CPU: all cores busy",
      res: "cpu", sub: "load 16",
      server: "All 8 cores are busy and the <b>load average</b> is 16: twice as many threads want a core as there are cores. Asha's request waits in the queue for its turn.",
      client: "Nothing fails, but everything is <b>slow</b>: Asha waits 3 seconds for a page that used to take 50 ms. Fix: find what burns the CPU (Module 33), add workers or servers (Modules 20 and 27).",
      clientSub: "waits 3 s…"
    },
    ram: {
      label: "RAM: memory full",
      res: "ram", sub: "full",
      server: "RAM is full. The kernel starts using <b>swap</b> (disk as RAM), and everything slows down. Then the <b>OOM killer</b> ends the biggest process with SIGKILL: exit code 137.",
      client: "Asha's connection is cut in the middle. In production, the load balancer shows her an error page (a 502). Fix: find the leak (Lesson 3), set memory limits, add RAM.",
      clientSub: "connection lost"
    },
    disk: {
      label: "Disk: no space (or no inodes)",
      res: "disk", sub: "full",
      server: "The order must be written to the disk, but the disk is full, or out of inodes. The write fails: <code>[Errno 28] No space left on device</code>.",
      client: "The order can't be saved, so Bazaar answers <b>500 Internal Server Error</b>. Fix: check <code>df -h</code> and <code>df -i</code>, rotate logs, move files to object storage (Lesson 4, Module 18).",
      clientSub: "500 error"
    },
    fds: {
      label: "File descriptors: limit reached",
      res: "fds", sub: "limit hit",
      server: "Every connection and every open file uses a <b>file descriptor</b>. The process hit its limit, so <code>accept()</code> fails with <code>[Errno 24] Too many open files</code>. New customers can't get in.",
      client: "Asha's phone can't connect at all: the app spins, then shows \"cannot reach server\". Fix: close files and connections you open, and raise the limit (<code>ulimit -n</code>).",
      clientSub: "can't connect"
    }
  };

  DiagramKit.register("server-request", {
    title: "One request inside Bazaar's server",
    intro: "Choose what runs out (or nothing), then press <b>Play</b>. Follow Asha's request through the server, and see what she experiences.",
    state: { problem: "none" },

    size: function (narrow) { return narrow ? [360, 570] : [840, 400]; },

    controls: function (ui, state, api) {
      ui.select({
        label: "What runs out?",
        value: state.problem,
        options: Object.keys(PROBLEMS).map(function (k) { return { value: k, label: PROBLEMS[k].label }; }),
        onChange: function (v) { state.problem = v; api.reset(); }
      });
    },

    scene: function (s, state) {
      var n = s.narrow, p = PROBLEMS[state.problem];
      var client, nic, kernel, proc, R = {};
      if (n) {
        client = s.box({ x: 100, y: 14, w: 160, h: 54, label: "Asha's phone", sub: "GET /products" });
        s.zone(4, 92, 352, 466, "BAZAAR SERVER");
        nic = s.box({ x: 100, y: 120, w: 160, h: 54, label: "network card", sub: "receives bytes" });
        kernel = s.box({ x: 100, y: 214, w: 160, h: 54, label: "kernel", sub: "TCP, socket queue" });
        proc = s.box({ x: 100, y: 308, w: 160, h: 54, label: "Bazaar process", sub: "PID 7 · port 8000" });
        // one row of four small boxes, so no arrow crosses another box
        R.cpu = s.box({ x: 10, y: 470, w: 80, h: 60, label: "CPU", sub: "8 cores" });
        R.ram = s.box({ x: 96, y: 470, w: 80, h: 60, label: "RAM", sub: "cache" });
        R.disk = s.box({ x: 182, y: 470, w: 80, h: 60, label: "disk", sub: "log" });
        R.fds = s.box({ x: 268, y: 470, w: 82, h: 60, label: "fds", sub: "fd 4" });
      } else {
        client = s.box({ x: 14, y: 170, w: 130, h: 60, label: "Asha's phone", sub: "GET /products" });
        s.zone(170, 14, 662, 376, "BAZAAR SERVER");
        nic = s.box({ x: 190, y: 170, w: 130, h: 60, label: "network card", sub: "receives bytes" });
        kernel = s.box({ x: 345, y: 170, w: 130, h: 60, label: "kernel", sub: "TCP, socket queue" });
        proc = s.box({ x: 500, y: 170, w: 140, h: 60, label: "Bazaar process", sub: "PID 7 · port 8000" });
        R.cpu = s.box({ x: 670, y: 36, w: 150, h: 60, label: "CPU", sub: "8 cores" });
        R.ram = s.box({ x: 670, y: 122, w: 150, h: 60, label: "RAM", sub: "products cache" });
        R.disk = s.box({ x: 670, y: 208, w: 150, h: 60, label: "disk", sub: "order log" });
        R.fds = s.box({ x: 670, y: 294, w: 150, h: 60, label: "file descriptors", sub: "fd 4 = Asha" });
      }
      var a1 = s.arrow(client, nic), a2 = s.arrow(nic, kernel), a3 = s.arrow(kernel, proc);
      var use = {};
      Object.keys(R).forEach(function (k) { use[k] = s.arrow(proc, R[k], { dir: n ? "v" : "h" }); });

      var steps = [
        { caption: "Asha opens Bazaar's product page. Her request leaves the phone as bytes over the internet.",
          run: function (t) { t.mark(client, "active"); t.mark(a1, "active"); return t.packet(a1, { label: "GET" }).then(function () { t.unmark(a1); }); } },
        { caption: "The server's <b>network card</b> receives the bytes and tells the CPU. The <b>kernel</b>'s network code puts the TCP pieces back together.",
          run: function (t) { t.unmark(client); t.mark(nic, "active"); t.mark(a2, "active"); return t.packet(a2, { label: "…" }).then(function () { t.unmark(a2); t.unmark(nic); t.mark(kernel, "active"); }); } },
        { caption: "The kernel finds the <b>socket</b> that listens on port 8000, owned by Bazaar's process. The process was asleep in <code>accept()</code>; it wakes up with a new <b>file descriptor</b> (fd 4) for this connection.",
          run: function (t) { t.unmark(kernel); t.mark(a3, "active"); return t.packet(a3, { label: "fd4" }).then(function () { t.unmark(a3); t.mark(proc, "active"); }); } }
      ];

      if (state.problem === "none") {
        steps.push(
          { caption: "The process does its work: a <b>thread</b> runs Python on a <b>CPU</b> core, reads the products from <b>RAM</b>, appends a line to the log on the <b>disk</b>, using its <b>file descriptors</b>. Every part of Module 1, in one request.",
            run: function (t) { Object.keys(R).forEach(function (k) { t.mark(use[k], "active"); t.mark(R[k], "ok"); }); return t.wait(700); } },
          { caption: "The answer goes back the same way: process → kernel → network card → internet → phone. Asha sees the products in about 50 ms.",
            run: function (t) {
              Object.keys(R).forEach(function (k) { t.unmark(use[k]); });
              t.unmark(proc);
              return t.packet(a3, { label: "200", reverse: true }).then(function () { return t.packet(a2, { label: "200", reverse: true }); })
                .then(function () { return t.packet(a1, { label: "200", reverse: true }); })
                .then(function () { t.mark(client, "ok"); t.sub(client, "products shown"); });
            } }
        );
        return steps;
      }

      steps.push(
        { caption: p.server,
          run: function (t) { t.mark(use[p.res], "active"); t.mark(R[p.res], "bad"); t.sub(R[p.res], p.sub); if (p.res === "ram") { t.unmark(proc); t.mark(proc, "bad"); t.sub(proc, "killed: exit 137"); } } },
        { caption: p.client,
          run: function (t) { t.unmark(use[p.res]); t.mark(client, "bad"); t.sub(client, p.clientSub); } }
      );
      return steps;
    }
  });
})();
