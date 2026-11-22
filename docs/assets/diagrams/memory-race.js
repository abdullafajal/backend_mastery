/* memory-race — Module 1, Lesson 1.
 * The CPU needs the price of Red Running Shoes. How long does the trip take
 * from each place where the data could live? Real time, or "human time"
 * (stretch 1 nanosecond to 1 second, so the gaps become feelable).
 * Numbers are typical, rounded orders of magnitude, not exact measurements. */
(function () {
  var PLACES = [
    { name: "CPU cache", real: "about 1 ns", human: "1 second", ms: 350,
      note: "a tiny, super-fast memory <b>inside</b> the CPU chip" },
    { name: "RAM", real: "about 100 ns", human: "about 1.5 minutes", ms: 600,
      note: "the computer's main working memory" },
    { name: "SSD (disk)", real: "about 0.1 ms", human: "about 1 day", ms: 1000,
      note: "where files and databases are kept, even when the power is off" },
    { name: "Server, same data centre", real: "about 0.5 ms", human: "about 6 days", ms: 1400,
      note: "another computer in the same building, over the network" },
    { name: "Server in another country", real: "about 200 ms", human: "about 6 years", ms: 2600,
      note: "for example Mumbai → USA and back, over undersea cables" }
  ];

  DiagramKit.register("memory-race", {
    title: "The speed race: where does the data come from?",
    intro: "The CPU needs the price of <b>Red Running Shoes</b>. Press <b>Play</b> to fetch it from five places. Switch to <b>human time</b> to feel the difference.",
    state: { scale: "real" },

    size: function (narrow) { return narrow ? [360, 560] : [840, 400]; },

    controls: function (ui, state, api) {
      ui.select({
        label: "Show:",
        value: state.scale,
        options: [
          { value: "real", label: "Real time" },
          { value: "human", label: "Human time (1 ns = 1 second)" }
        ],
        // jump to the summary step (intro + one step per place + summary)
        onChange: function (v) { state.scale = v; api.goTo(PLACES.length + 1); }
      });
    },

    scene: function (s, state) {
      var cpu, boxes = [], arrows = [];
      if (s.narrow) {
        cpu = s.box({ x: 8, y: 248, w: 96, h: 64, label: "CPU", sub: "needs a price" });
        PLACES.forEach(function (p, i) {
          boxes.push(s.box({ x: 150, y: 20 + i * 106, w: 202, h: 56, label: p.name, sub: "?" }));
        });
      } else {
        cpu = s.box({ x: 20, y: 168, w: 160, h: 64, label: "CPU", sub: "needs a price" });
        PLACES.forEach(function (p, i) {
          boxes.push(s.box({ x: 470, y: 24 + i * 74, w: 300, h: 56, label: p.name, sub: "?" }));
        });
      }
      // one box fans out to five: always leave the CPU from its right side
      boxes.forEach(function (b) { arrows.push(s.arrow(cpu, b, { dir: "h" })); });

      function timeOf(p) { return state.scale === "human" ? p.human : p.real; }

      var steps = [{
        caption: "The <b>CPU</b> (Central Processing Unit) is the part of the computer that does the work. It needs one price: ₹999. Where it gets it from changes everything.",
        run: function (t) { t.mark(cpu, "active"); }
      }];

      PLACES.forEach(function (p, i) {
        steps.push({
          caption: function () {
            return "<b>" + p.name + "</b>: " + p.note + ". One trip: <b>" + timeOf(p) + "</b>" +
              (state.scale === "human" ? " (in human time)." : ".");
          },
          run: function (t) {
            for (var j = 0; j < i; j++) { t.unmark(arrows[j]); t.unmark(boxes[j]); t.mark(boxes[j], "ok"); }
            t.unmark(cpu);
            t.mark(arrows[i], "active");
            t.mark(boxes[i], "active");
            return t.packet(arrows[i], { label: "?", duration: p.ms / 2 }).then(function () {
              return t.packet(arrows[i], { label: "₹", duration: p.ms / 2, reverse: true });
            }).then(function () {
              t.sub(boxes[i], timeOf(p));
            });
          }
        });
      });

      steps.push({
        caption: function () {
          return state.scale === "human"
            ? "In human time: the cache answers in 1 second, the disk in a day, another country in <b>6 years</b>. This is why backends keep busy data in RAM, and avoid extra network trips."
            : "RAM is about <b>1,000 times</b> faster than the disk, and the other side of the world is about <b>2 million times</b> slower than RAM. Switch to <b>human time</b> to feel it.";
        },
        run: function (t) {
          boxes.forEach(function (b, j) { t.unmark(b); t.unmark(arrows[j]); t.mark(b, "ok"); t.sub(b, timeOf(PLACES[j])); });
          t.mark(cpu, "ok");
        }
      });
      return steps;
    }
  });
})();
