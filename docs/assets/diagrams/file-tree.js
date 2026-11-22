/* file-tree — Module 2, Lesson 2 (the plan's "Linux file tree explorer").
 * Bazaar's server as a folder tree. Two situations:
 *  - "cd": run a series of cd commands and watch the current folder and the prompt change;
 *  - "tour": what lives where. Click any folder to jump to its explanation. */
(function () {
  // id, label, parent, depth, explanation for the tour
  var NODES = [
    ["root", "/", null, 0, "<code>/</code> is the <b>root</b> folder. Every file on a Linux machine hangs somewhere below it. There are no drive letters."],
    ["etc", "/etc", "root", 1, "<code>/etc</code> holds <b>settings files</b>: Nginx, PostgreSQL, users, the hostname. Change carefully, and back up first (<code>cp file file.bak</code>)."],
    ["home", "/root  (~)", "root", 1, "<code>/root</code> is the <b>home folder</b> of the root user, shown as <code>~</code>. Normal users get <code>/home/&lt;name&gt;</code>. Your shell settings (<code>.bashrc</code>) live here."],
    ["srv", "/srv", "root", 1, "<code>/srv</code> is for data a server <b>serves</b>. Many teams put their app here. Bazaar lives in <code>/srv/bazaar</code>."],
    ["tmp", "/tmp", "root", 1, "<code>/tmp</code> is for <b>temporary</b> files. It may be emptied on restart, and every user can write there. Never keep anything important in it."],
    ["var", "/var", "root", 1, "<code>/var</code> holds data that <b>varies</b> while the system runs: logs, databases, queues, caches."],
    ["bazaar", "bazaar", "srv", 2, "<code>/srv/bazaar</code>: Bazaar's own folder on this server. Everything in this lab happens here."],
    ["varlog", "log", "var", 2, "<code>/var/log</code>: the system's and services' <b>logs</b> (Nginx, the kernel, package installs). The first place to look when something breaks (Lesson 7)."],
    ["logs", "logs", "bazaar", 3, "<code>/srv/bazaar/logs</code>: Bazaar's order logs, one file per day, plus <code>live.log</code>, which grows every 2 seconds. Read with <code>tail -f</code>."],
    ["config", "config", "bazaar", 3, "<code>/srv/bazaar/config</code>: Bazaar's settings, like <code>bazaar.conf</code>. Copy before you edit: <code>cp bazaar.conf bazaar.conf.bak</code>."],
    ["media", "media", "bazaar", 3, "<code>/srv/bazaar/media</code>: product photos. The <b>biggest</b> folder: <code>du -sh * | sort -h</code> finds it in one line."]
  ];

  function pos(narrow) {
    var P = {};
    if (narrow) {
      // an indented list, like the `tree` command
      var order = ["root", "etc", "home", "srv", "bazaar", "logs", "config", "media", "tmp", "var", "varlog"];
      order.forEach(function (id, row) {
        var depth = NODES.filter(function (nd) { return nd[0] === id; })[0][3];
        P[id] = { x: 14 + depth * 34, y: 14 + row * 48, w: 200, h: 38 };
      });
      return P;
    }
    var W = 132, H = 46;
    P.root = { x: 354, y: 14, w: W, h: H };
    ["etc", "home", "srv", "tmp", "var"].forEach(function (id, i) { P[id] = { x: 20 + i * 165, y: 104, w: W, h: H }; });
    P.bazaar = { x: 350, y: 194, w: W, h: H };
    P.varlog = { x: 680, y: 194, w: W, h: H };
    P.logs = { x: 200, y: 284, w: W, h: H };
    P.config = { x: 350, y: 284, w: W, h: H };
    P.media = { x: 500, y: 284, w: W, h: H };
    return P;
  }

  var CD = [
    ["start", "bazaar", "/srv/bazaar", "You start in <code>/srv/bazaar</code>. The prompt always shows the <b>current folder</b>."],
    ["cd logs", "logs", "/srv/bazaar/logs", "<code>cd logs</code>: a <b>relative</b> path, so it means \"<code>logs</code> inside the current folder\"."],
    ["cd ..", "bazaar", "/srv/bazaar", "<code>cd ..</code>: up one level, to the parent folder."],
    ["cd /var/log", "varlog", "/var/log", "<code>cd /var/log</code>: an <b>absolute</b> path (it starts with <code>/</code>), so it works from anywhere."],
    ["cd -", "bazaar", "/srv/bazaar", "<code>cd -</code>: back to the <b>previous</b> folder. Bash prints where you landed. Great for jumping between two places."],
    ["cd", "home", "~", "<code>cd</code> alone (or <code>cd ~</code>): go to your <b>home</b> folder. For root that's <code>/root</code>, shown as <code>~</code>."],
    ["cd /", "root", "/", "<code>cd /</code>: the root of everything."]
  ];

  DiagramKit.register("file-tree", {
    title: "Bazaar's server, as a folder tree",
    intro: "Pick a situation, then press <b>Play</b>. In the tour, you can also <b>click any folder</b>.",
    state: { situation: "cd" },

    size: function (narrow) { return narrow ? [360, 640] : [840, 430]; },

    controls: function (ui, state, api) {
      ui.select({
        label: "Situation:",
        value: state.situation,
        options: [{ value: "cd", label: "Move around with cd" }, { value: "tour", label: "Tour: what lives where" }],
        onChange: function (v) { state.situation = v; api.reset(); }
      });
    },

    scene: function (s, state) {
      var P = pos(s.narrow), B = {};
      NODES.forEach(function (nd) {
        var p = P[nd[0]];
        B[nd[0]] = s.box({ x: p.x, y: p.y, w: p.w, h: p.h, label: nd[1], sub: "" });
      });
      if (!s.narrow) {
        NODES.forEach(function (nd) { if (nd[2]) s.arrow(B[nd[2]], B[nd[0]], { dir: "v" }); });
      }
      var prompt = s.narrow
        ? s.box({ x: 14, y: 560, w: 332, h: 56, label: "root@bazaar-server:/srv/bazaar#", sub: "the prompt" })
        : s.box({ x: 20, y: 364, w: 800, h: 52, label: "root@bazaar-server:/srv/bazaar#", sub: "the prompt" });

      function only(t, id, how) {
        Object.keys(B).forEach(function (k) { t.unmark(B[k]); });
        t.mark(B[id], how || "active");
      }

      if (state.situation === "cd") {
        return CD.map(function (c) {
          return {
            caption: c[3],
            run: function (t) {
              only(t, c[1]);
              t.label(prompt, "root@bazaar-server:" + c[2] + "#");
              t.sub(prompt, c[0] === "start" ? "the prompt" : "after: " + c[0]);
            }
          };
        });
      }

      // tour: one step per folder; clicking a folder jumps to its step
      NODES.forEach(function (nd, i) { s.onClick(B[nd[0]], function (api) { api.goTo(i); }); });
      return NODES.map(function (nd) {
        return {
          caption: nd[4],
          run: function (t) {
            only(t, nd[0], "ok");
            t.label(prompt, "cd " + (nd[0] === "home" ? "~" : nd[0] === "root" ? "/" :
              { bazaar: "/srv/bazaar", varlog: "/var/log", logs: "/srv/bazaar/logs", config: "/srv/bazaar/config", media: "/srv/bazaar/media" }[nd[0]] || nd[1]));
            t.sub(prompt, "how to get there");
          }
        };
      });
    }
  });
})();
