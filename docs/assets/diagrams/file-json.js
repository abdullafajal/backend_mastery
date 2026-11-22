/* file-json — Module 4, Lesson 7.
 * Left: the program's memory (Python data). Right: the disk (a JSON file). Between them: json.dump / json.load.
 * Situation "save": dump the catalog to data/catalog.json, the program stops (memory is wiped), the next run loads it back.
 * Situation "nosave": the same program without saving: after a restart the catalog is simply gone. */
(function () {
  DiagramKit.register("file-json", {
    title: "Memory forgets, files remember",
    intro: "Pick a situation, then press <b>Play</b>.",
    state: { sit: "save" },
    size: function (narrow) { return narrow ? [360, 400] : [840, 300]; },
    controls: function (ui, state, api) {
      ui.select({ label: "Situation:", value: state.sit,
        options: [{ value: "save", label: "Save as JSON, restart, load" }, { value: "nosave", label: "Restart without saving" }],
        onChange: function (v) { state.sit = v; api.reset(); } });
    },
    scene: function (s, state) {
      var n = s.narrow, mem, disk, run;
      if (n) {
        run = s.box({ x: 60, y: 8, w: 240, h: 50, label: "python3 save_catalog.py", sub: "run 1" });
        s.zone(6, 84, 348, 120, "MEMORY (the running program)");
        mem = s.box({ x: 20, y: 112, w: 320, h: 70, label: "catalog = [{...}, {...}]", sub: "a Python list of dicts" });
        s.zone(6, 250, 348, 130, "DISK (stays after the program ends)");
        disk = s.box({ x: 20, y: 278, w: 320, h: 80, label: "data/catalog.json", sub: "(no file yet)" });
      } else {
        run = s.box({ x: 300, y: 10, w: 240, h: 48, label: "python3 save_catalog.py", sub: "run 1" });
        s.zone(14, 80, 320, 200, "MEMORY (the running program)");
        mem = s.box({ x: 34, y: 140, w: 280, h: 90, label: "catalog = [{...}, {...}]", sub: "a Python list of dicts" });
        s.zone(506, 80, 320, 200, "DISK (stays after the program ends)");
        disk = s.box({ x: 526, y: 140, w: 280, h: 90, label: "data/catalog.json", sub: "(no file yet)" });
      }
      var none = state.sit === "nosave";             // nothing is saved, so no arrows at all
      var dump = s.arrow(mem, disk, { dir: n ? "v" : "h", offset: -12, label: n ? "" : "json.dump", hidden: none });
      var load = s.arrow(disk, mem, { dir: n ? "v" : "h", offset: 12, label: n ? "" : "json.load", hidden: none });   // other side of the dump arrow

      if (state.sit === "nosave") {
        return [
          { caption: "The program builds the catalog in <b>memory</b> (RAM, Module 1). It works fine while the program runs.",
            run: function (t) { t.mark(run, "active"); t.mark(mem, "ok"); } },
          { caption: "The program ends (or the server restarts). Its memory is handed back to the system: the catalog is <b>gone</b>.",
            run: function (t) { t.unmark(run); t.label(run, "program stopped"); t.sub(run, "memory freed"); t.unmark(mem); t.mark(mem, "dim"); t.label(mem, "(nothing)"); t.sub(mem, "memory is empty"); } },
          { caption: "Next run: nothing was saved, so there is nothing to load. Every product, cart and order must be typed in again. That's why real programs save data: to files now, to a database from Level 2 on.",
            run: function (t) { t.label(run, "python3 save_catalog.py"); t.sub(run, "run 2"); t.mark(run, "active"); t.unmark(mem); t.mark(mem, "bad"); t.label(mem, "catalog?"); t.sub(mem, "lost"); t.mark(disk, "dim"); } }
        ];
      }

      return [
        { caption: "The program builds the catalog in <b>memory</b>: a Python list of dicts.",
          run: function (t) { t.mark(run, "active"); t.mark(mem, "ok"); } },
        { caption: "<code>json.dump(catalog, f, indent=2)</code> turns it into <b>JSON text</b> and writes it to <code>data/catalog.json</code>. <code>True</code> becomes <code>true</code>, <code>None</code> becomes <code>null</code>.",
          run: function (t) { t.unmark(run); t.mark(dump, "active"); return t.packet(dump, { label: "{ }" }).then(function () { t.mark(disk, "ok"); t.sub(disk, "[ {\"name\": \"Masala Box\", …} ]"); }); } },
        { caption: "The program ends. Memory is wiped, but the <b>file stays on the disk</b>. You can open it in VS Code and read it.",
          run: function (t) { t.unmark(dump); t.label(run, "program stopped"); t.sub(run, "memory freed"); t.unmark(mem); t.mark(mem, "dim"); t.label(mem, "(nothing)"); t.sub(mem, "memory is empty"); } },
        { caption: "Next run: <code>json.load(f)</code> reads the text and builds the same list of dicts again. <code>loaded == catalog</code> is <code>True</code>.",
          run: function (t) { t.label(run, "python3 save_catalog.py"); t.sub(run, "run 2"); t.mark(run, "active"); t.mark(load, "active"); return t.packet(load, { label: "{ }" }).then(function () { t.unmark(mem); t.mark(mem, "ok"); t.label(mem, "catalog = [{...}, {...}]"); t.sub(mem, "loaded back from the file"); }); } }
      ];
    }
  });
})();
