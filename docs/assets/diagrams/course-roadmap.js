/* course-roadmap — Module 0, Lesson 2.
 * The 6 levels of the course as a staircase. Each step = Bazaar grows,
 * hits a new problem, and that problem brings the next level.
 * Click any level to jump to it. */
(function () {
  var LEVELS = [
    {
      name: "Foundations", modules: "Modules 0–7", users: "1 user",
      problem: "Bazaar is just an idea on your laptop.",
      learn: "how computers, Linux, Git, Python, data structures and networks work",
      tools: "Python, Git, the terminal"
    },
    {
      name: "Core backend", modules: "Modules 8–13", users: "100 users",
      problem: "Sellers need a real website, and the mobile app needs an API.",
      learn: "Django, the ORM, REST APIs, login and permissions, and testing",
      tools: "Django, Django REST Framework, pytest"
    },
    {
      name: "Data", modules: "Modules 14–18", users: "10,000 users",
      problem: "Thousands of products and orders. Pages that took 50 ms now take 5 seconds.",
      learn: "SQL, schema design, how databases work inside, indexes and search",
      tools: "PostgreSQL, PgBouncer, OpenSearch, MinIO"
    },
    {
      name: "Production", modules: "Modules 19–26", users: "1 lakh users",
      problem: "Bazaar goes live on the internet. It must be safe, fast and never down.",
      learn: "Docker, Nginx, background jobs, caching, security, CI/CD and monitoring",
      tools: "Docker, Gunicorn, Nginx, Celery, Redis, GitHub Actions, Grafana"
    },
    {
      name: "Scaling", modules: "Modules 27–33", users: "10 lakh+ users",
      problem: "The Diwali sale! One server and one database cannot handle the crowd.",
      learn: "load balancing, services, events, replication, sharding and distributed systems",
      tools: "Nginx load balancer, Kafka, read replicas, 3 shards"
    },
    {
      name: "Architecture", modules: "Modules 34–37", users: "1 crore users",
      problem: "Bazaar is big. Now the hard part is design decisions and leading a team.",
      learn: "clean architecture, system design, senior skills, and the capstone",
      tools: "everything you built, put together as Bazaar v1.0"
    }
  ];

  DiagramKit.register("course-roadmap", {
    title: "The road ahead: 6 levels, one growing Bazaar",
    intro: "Press <b>Play</b> to climb the stairs, or <b>click any level</b> to jump to it.",

    size: function (narrow) { return narrow ? [360, 560] : [840, 360]; },

    scene: function (s) {
      var boxes = [], counts = [], arrows = [];

      LEVELS.forEach(function (lv, i) {
        var b, c;
        if (s.narrow) {
          // top to bottom; the stair goes down the screen
          b = s.box({ x: 20, y: 20 + i * 90, w: 200, h: 62, label: "Level " + (i + 1) + ": " + lv.name, sub: lv.modules });
          c = s.text(240, 20 + i * 90 + 36, lv.users, { cls: "bz-note" });
        } else {
          // a staircase going up to the right
          var x = 14 + i * 138, y = 236 - i * 38;
          b = s.box({ x: x, y: y, w: 122, h: 70, label: "Level " + (i + 1), sub: lv.name });
          c = s.text(x + 61, y + 92, lv.users, { anchor: "middle", cls: "bz-note" });
        }
        boxes.push(b);
        counts.push(c);
        if (i > 0) arrows.push(s.arrow(boxes[i - 1], b));
      });

      var problem = null;
      if (!s.narrow) {
        problem = s.text(420, 34, "", { anchor: "middle", cls: "bz-note", hidden: true });
      }

      boxes.forEach(function (b, i) {
        s.onClick(b, function (api) { api.goTo(i); });
      });

      return LEVELS.map(function (lv, i) {
        return {
          caption:
            "<b>Level " + (i + 1) + " · " + lv.name + "</b> (" + lv.modules + "). " +
            "Bazaar has <b>" + lv.users + "</b>. Problem: " + lv.problem + "<br>" +
            "You learn " + lv.learn + ". Tools: <i>" + lv.tools + "</i>.",
          run: function (t) {
            // everything before this level is done (green), this one is active,
            // everything after is still ahead (dim)
            boxes.forEach(function (b, j) {
              t.unmark(b);
              if (j < i) t.mark(b, "ok");
              else if (j === i) t.mark(b, "active");
              else t.mark(b, "dim");
            });
            counts.forEach(function (c, j) { if (j > i) t.hide(c); else t.show(c); });
            if (problem) {
              t.label(problem, "Bazaar: " + lv.users + " · " + lv.problem);
              t.show(problem);
            }
            if (i > 0) {
              t.mark(arrows[i - 1], "active");
              return t.packet(arrows[i - 1], { label: "↑" });
            }
          }
        };
      });
    }
  });
})();
