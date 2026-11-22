/* systemd-lifecycle — Module 2, Lesson 7.
 * systemd (PID 1) reads the unit file, starts Bazaar's backend, restarts it after a crash,
 * starts it at boot when enabled, and every message goes to the journal.
 * Situations: "crash" (start + kill -9 + restart), "boot" (enable + reboot), "stop". */
(function () {
  DiagramKit.register("systemd-lifecycle", {
    title: "How systemd keeps Bazaar running",
    intro: "Pick a situation, then press <b>Play</b>.",
    state: { sit: "crash" },
    size: function (narrow) { return narrow ? [360, 400] : [840, 330]; },
    controls: function (ui, state, api) {
      ui.select({ label: "Situation:", value: state.sit,
        options: [{ value: "crash", label: "Start it, then it crashes" },
                  { value: "boot", label: "Enable it, then reboot" },
                  { value: "stop", label: "Stop it on purpose" }],
        onChange: function (v) { state.sit = v; api.reset(); } });
    },
    scene: function (s, state) {
      var n = s.narrow, you, unit, sd, app, jr;
      if (n) {
        you = s.box({ x: 10, y: 10, w: 165, h: 56, label: "you", sub: "systemctl …" });
        unit = s.box({ x: 185, y: 10, w: 165, h: 56, label: "unit file", sub: "bazaar-web.service" });
        sd = s.box({ x: 90, y: 140, w: 180, h: 60, label: "systemd", sub: "PID 1, the manager" });
        app = s.box({ x: 10, y: 290, w: 150, h: 60, label: "server.py", sub: "not running" });
        jr = s.box({ x: 200, y: 290, w: 150, h: 60, label: "the journal", sub: "journalctl -u" });
      } else {
        you = s.box({ x: 20, y: 40, w: 210, h: 60, label: "you", sub: "systemctl start / stop / enable" });
        unit = s.box({ x: 20, y: 220, w: 210, h: 60, label: "bazaar-web.service", sub: "the unit file" });
        sd = s.box({ x: 320, y: 125, w: 200, h: 70, label: "systemd", sub: "PID 1, the manager" });
        app = s.box({ x: 610, y: 40, w: 210, h: 60, label: "python3 server.py", sub: "not running" });
        jr = s.box({ x: 610, y: 220, w: 210, h: 60, label: "the journal", sub: "journalctl -u bazaar-web" });
      }
      var cmd = s.arrow(you, sd, { dir: n ? "v" : "h", label: n ? "" : "command" });
      var read = s.arrow(unit, sd, { dir: n ? "v" : "h", label: n ? "" : "reads", dashed: true });
      var run = s.arrow(sd, app, { dir: n ? "v" : "h", label: n ? "" : "starts" });
      var log = s.arrow(app, jr, { dir: n ? "h" : "v", label: n ? "" : "output" });
      var slog = s.arrow(sd, jr, { dir: n ? "v" : "h", label: n ? "" : "notes" });

      if (state.sit === "boot") {
        return [
          { caption: "You run <code>systemctl enable bazaar-web</code>. systemd adds it to the list of things to start at boot (a symlink in <code>multi-user.target.wants/</code>).",
            run: function (t) { t.mark(you, "active"); t.mark(cmd, "active"); return t.packet(cmd, { label: "enable" }).then(function () { t.mark(unit, "ok"); t.sub(unit, "enabled ✓"); }); } },
          { caption: "The server reboots. Every program stops, Bazaar's backend too. Nobody is logged in to start it again.",
            run: function (t) { t.unmark(you); t.unmark(cmd); t.mark(app, "bad"); t.sub(app, "off (reboot)"); t.mark(sd, "active"); t.sub(sd, "booting…"); } },
          { caption: "systemd starts first (it is PID 1). It reads the enabled unit file and starts <code>server.py</code> by itself.",
            run: function (t) { t.mark(read, "active"); return t.packet(read, { label: "≡" }).then(function () { t.unmark(read); t.mark(run, "active"); return t.packet(run, { label: "start" }); }).then(function () { t.unmark(app); t.mark(app, "ok"); t.sub(app, "running"); t.sub(sd, "PID 1, the manager"); }); } },
          { caption: "The journal records it: <code>Started bazaar-web.service - Bazaar web backend.</code> Bazaar is back online after the reboot, with no human needed.",
            run: function (t) { t.unmark(run); t.unmark(sd); t.mark(slog, "active"); return t.packet(slog, { label: "log" }).then(function () { t.mark(jr, "ok"); t.sub(jr, "Started bazaar-web…"); }); } }
        ];
      }

      if (state.sit === "stop") {
        return [
          { caption: "Bazaar's backend is running. You run <code>systemctl stop bazaar-web</code>, for example before an update.",
            run: function (t) { t.mark(app, "ok"); t.sub(app, "running"); t.mark(you, "active"); t.mark(cmd, "active"); return t.packet(cmd, { label: "stop" }); } },
          { caption: "systemd politely asks the program to stop, and it exits.",
            run: function (t) { t.unmark(you); t.unmark(cmd); t.mark(run, "active"); return t.packet(run, { label: "stop" }).then(function () { t.unmark(app); t.sub(app, "inactive (dead)"); }); } },
          { caption: "The journal says <code>Deactivated successfully.</code> and <code>Stopped bazaar-web.service</code>.",
            run: function (t) { t.unmark(run); t.mark(slog, "active"); return t.packet(slog, { label: "log" }).then(function () { t.mark(jr, "ok"); t.sub(jr, "Stopped bazaar-web…"); }); } },
          { caption: "<code>Restart=on-failure</code> does <b>not</b> start it again: you stopped it on purpose, it did not fail. It stays stopped until you run <code>systemctl start</code>.",
            run: function (t) { t.unmark(slog); t.mark(sd, "ok"); t.sub(sd, "stopped on purpose: OK"); } }
        ];
      }

      return [
        { caption: "You run <code>systemctl start bazaar-web</code>. systemd reads the unit file: what to run (<code>ExecStart=</code>), as which user, with which settings.",
          run: function (t) { t.mark(you, "active"); t.mark(cmd, "active"); return t.packet(cmd, { label: "start" }).then(function () { t.unmark(you); t.unmark(cmd); t.mark(read, "active"); t.mark(unit, "active"); return t.packet(read, { label: "≡" }); }); } },
        { caption: "systemd starts <code>python3 server.py</code>. Status: <code>active (running)</code>, <code>Main PID: 94</code>.",
          run: function (t) { t.unmark(read); t.unmark(unit); t.mark(run, "active"); return t.packet(run, { label: "start" }).then(function () { t.mark(app, "ok"); t.sub(app, "running, PID 94"); }); } },
        { caption: "Everything the program prints goes to the <b>journal</b>: <code>request \"GET / HTTP/1.1\" 200</code>. Read it with <code>journalctl -u bazaar-web</code>.",
          run: function (t) { t.unmark(run); t.mark(log, "active"); return t.packet(log, { label: "print" }).then(function () { t.mark(jr, "active"); t.sub(jr, "GET / 200"); }); } },
        { caption: "Crash! The program is killed (<code>kill -9</code>). systemd notices at once and notes it: <code>Main process exited, code=killed, status=9/KILL</code>.",
          run: function (t) { t.unmark(log); t.unmark(jr); t.unmark(app); t.mark(app, "bad"); t.sub(app, "killed!"); t.mark(slog, "active"); return t.packet(slog, { label: "log" }).then(function () { t.sub(jr, "status=9/KILL"); }); } },
        { caption: "Because of <code>Restart=on-failure</code>, systemd waits <code>RestartSec=2</code> seconds and starts it again: <code>restart counter is at 1</code>, new <code>Main PID: 117</code>. Customers barely notice.",
          run: function (t) { t.unmark(slog); t.mark(sd, "active"); t.sub(sd, "waiting 2 s…"); return t.wait(700).then(function () { t.mark(run, "active"); return t.packet(run, { label: "start" }); }).then(function () { t.unmark(sd); t.unmark(run); t.sub(sd, "PID 1, the manager"); t.unmark(app); t.mark(app, "ok"); t.sub(app, "running, PID 117"); t.mark(jr, "ok"); t.sub(jr, "restart counter: 1"); }); } }
      ];
    }
  });
})();
