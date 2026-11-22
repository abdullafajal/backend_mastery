/* docker-run — Module 0, Lesson 4.
 * What happens when you type `docker run python:3.13.18-slim-trixie python3 -c "print(...)"`.
 * Three situations: first run (image is downloaded), second run (image already here),
 * and Docker Engine not running (the classic beginner error). */
(function () {
  var SITUATIONS = {
    first: { label: "First time (no image yet)" },
    second: { label: "Second time (image already here)" },
    off: { label: "Docker Desktop is not running" }
  };

  DiagramKit.register("docker-run", {
    title: "What happens when you type docker run",
    intro: "Pick a situation and press <b>Play</b>. Follow the command from your terminal to a running container.",
    state: { situation: "first" },

    size: function (narrow) { return narrow ? [360, 600] : [840, 380]; },

    controls: function (ui, state, api) {
      ui.select({
        label: "Situation:",
        value: state.situation,
        options: Object.keys(SITUATIONS).map(function (k) { return { value: k, label: SITUATIONS[k].label }; }),
        onChange: function (v) { state.situation = v; api.reset(); }
      });
    },

    scene: function (s, state) {
      var sit = state.situation;
      var term, engine, images, box, hub;
      var imageHere = sit === "second";
      var imgSub = imageHere ? "python:3.13 ✓" : "(empty)";

      // A "plus" shape: Images above the Engine, Container below it, Terminal on the left,
      // Docker Hub outside the laptop. Every arrow is straight.
      if (s.narrow) {
        hub = s.box({ x: 190, y: 14, w: 160, h: 58, label: "Docker Hub", sub: "image registry" });
        s.zone(6, 104, 348, 486, "YOUR LAPTOP");
        images = s.box({ x: 190, y: 140, w: 160, h: 58, label: "Images", sub: imgSub });
        term = s.box({ x: 14, y: 300, w: 150, h: 58, label: "Terminal", sub: "$ docker run …" });
        engine = s.box({ x: 190, y: 300, w: 160, h: 58, label: "Docker Engine", sub: "the background program" });
        box = s.box({ x: 190, y: 470, w: 160, h: 58, label: "Container", sub: "not started" });
      } else {
        s.zone(10, 30, 480, 344, "YOUR LAPTOP");
        term = s.box({ x: 30, y: 170, w: 180, h: 64, label: "Terminal", sub: "$ docker run python…" });
        engine = s.box({ x: 290, y: 170, w: 180, h: 64, label: "Docker Engine", sub: "the background program" });
        images = s.box({ x: 290, y: 52, w: 180, h: 64, label: "Images", sub: imgSub });
        box = s.box({ x: 290, y: 292, w: 180, h: 64, label: "Container", sub: "not started" });
        hub = s.box({ x: 620, y: 52, w: 190, h: 64, label: "Docker Hub", sub: "image registry" });
      }

      var cmd = s.arrow(term, engine, { label: s.narrow ? "" : "command", offset: -12 });
      var reply = s.arrow(engine, term, { label: s.narrow ? "" : "output", offset: 12 });
      var look = s.arrow(engine, images, { label: s.narrow ? "" : "look" });
      var pull = s.arrow(hub, images, { label: "download", dashed: true });
      var start = s.arrow(engine, box, { label: s.narrow ? "" : "start", offset: -12 });
      var logs = s.arrow(box, engine, { label: "", offset: 12 });

      var steps = [
        {
          caption: "You type <code>docker run python:3.13.18-slim-trixie python3 -c \"print('Hello…')\"</code> in the terminal.",
          run: function (t) { t.mark(term, "active"); }
        },
        {
          caption: "The <code>docker</code> command does not run containers itself. It sends your request to the <b>Docker Engine</b>, a program that runs quietly in the background.",
          run: function (t) {
            t.unmark(term);
            t.mark(cmd, "active");
            return t.packet(cmd, { label: "run" }).then(function () {
              t.mark(engine, sit === "off" ? "bad" : "active");
              if (sit === "off") t.sub(engine, "NOT running");
            });
          }
        }
      ];

      if (sit === "off") {
        steps.push({
          caption: "Nobody answers. Docker Desktop is closed, so the Engine is not running. You see <code>failed to connect to the docker API … check if … the daemon is running</code>. Fix: start Docker Desktop and wait until it says it is running.",
          run: function (t) {
            t.unmark(cmd);
            t.mark(term, "bad");
            t.sub(term, "failed to connect…");
          }
        });
        return steps;
      }

      steps.push({
        caption: imageHere
          ? "The Engine looks for the <b>image</b> on your laptop. It is already there from last time. No download needed!"
          : "The Engine looks for the <b>image</b> on your laptop: <code>Unable to find image … locally</code>. An image is a ready-made package: a mini file system with Python already inside.",
        run: function (t) {
          t.unmark(cmd);
          t.mark(look, "active");
          return t.packet(look, { label: "?" }).then(function () {
            t.mark(images, imageHere ? "ok" : "bad");
          });
        }
      });

      if (!imageHere) {
        steps.push({
          caption: "It downloads (<b>pulls</b>) the image from <b>Docker Hub</b>, a big online library of images. This is why the first run is slow, about 3–4 seconds here.",
          run: function (t) {
            t.unmark(look);
            t.unmark(images);
            t.mark(hub, "active");
            t.mark(pull, "active");
            return t.packet(pull, { label: "↓", duration: 1600 }).then(function () {
              t.sub(images, "python:3.13 ✓");
              t.mark(images, "ok");
            });
          }
        });
      }

      steps.push(
        {
          caption: "The Engine creates a <b>container</b> from the image and starts it. Inside, <code>python3</code> runs your one line of code.",
          run: function (t) {
            t.unmark(look);
            t.unmark(hub);
            t.unmark(pull);
            t.mark(start, "active");
            return t.packet(start, { label: "▶" }).then(function () {
              t.mark(box, "active");
              t.sub(box, "running");
            });
          }
        },
        {
          caption: "Python prints <code>Hello from inside a container!</code>. The Engine passes that output back to your terminal.",
          run: function (t) {
            t.unmark(start);
            t.mark(logs, "active");
            return t.packet(logs, { label: "Hi" }).then(function () {
              t.unmark(logs);
              t.mark(reply, "active");
              return t.packet(reply, { label: "Hi" });
            }).then(function () {
              t.sub(term, "Hello from inside a container!");
              t.mark(term, "ok");
            });
          }
        },
        {
          caption: "The program ended, so the container stops. <code>--rm</code> removes it. The <b>image stays</b> on your laptop, so " +
            (imageHere ? "every run stays this fast (about 0.2 seconds here)." : "the next run takes about 0.2 seconds instead of 3–4."),
          run: function (t) {
            t.unmark(reply);
            t.unmark(box);
            t.mark(box, "dim");
            t.sub(box, "removed (--rm)");
            t.mark(images, "ok");
          }
        }
      );
      return steps;
    }
  });
})();
