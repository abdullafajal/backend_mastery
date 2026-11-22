/* Backend Mastery — diagram-kit.js
 * Shared library for every interactive diagram in the course.
 * Plain JavaScript + SVG. No dependencies.
 *
 * ============================== HOW TO USE ==============================
 *
 * 1) In a lesson's Markdown:
 *      <div class="bz-diagram" data-diagram="request-journey"></div>
 *    The kit lazy-loads docs/assets/diagrams/request-journey.js.
 *
 * 2) In docs/assets/diagrams/request-journey.js:
 *
 *    DiagramKit.register("request-journey", {
 *      title: "One request to Bazaar",           // shown above the diagram
 *      intro: "Press Play to start.",            // caption before step 1
 *      size: function (narrow) { return narrow ? [360, 560] : [820, 320]; },
 *      state: { crashed: false },                 // optional, survives redraws
 *      controls: function (ui, state, api) {      // optional user inputs (built once)
 *        ui.input({ label: "user_id", type: "number", value: 42,
 *                   onChange: function (v) { state.userId = +v; api.reset(); } });
 *        ui.button("Crash server 2", function () { state.crashed = true; api.reset(); });
 *      },
 *      scene: function (s, state) {               // draw + return steps (called on every redraw)
 *        var phone = s.box({ x: 20, y: 120, w: 130, h: 60, label: "Asha's phone", sub: "customer" });
 *        var api   = s.box({ x: 340, y: 120, w: 140, h: 60, label: "Bazaar backend" });
 *        var req   = s.arrow(phone, api, { label: "GET /products", offset: -10 });
 *        var res   = s.arrow(api, phone, { label: "JSON", offset: 10 });
 *        return [
 *          { caption: "Asha opens the app.", run: function (t) { t.mark(phone, "active"); } },
 *          { caption: "The app asks the backend.", run: function (t) {
 *              t.mark(req, "active"); return t.packet(req, { label: "GET" }); } },
 *        ];
 *      }
 *    });
 *
 * ---------------- Starting state from the page ----------------
 *   <div class="bz-diagram" data-diagram="commit-graph" data-state-sit="merge"></div>
 *   sets state.sit = "merge" before controls() and scene() run (string values only).
 *
 * ---------------- Scene (s) — drawing, called on every redraw ----------------
 *   s.narrow                          true when the diagram is narrow (phones)
 *   s.width, s.height                 viewBox size
 *   s.box({x,y,w,h,label,sub,hidden,id})  -> Box  {g, x,y,w,h,cx,cy}
 *   s.arrow(from, to, {label, offset, dashed, hidden, dir})  -> Arrow
 *        from/to can be a Box or a point {x,y}. offset shifts the arrow sideways,
 *        so a request and its response can run side by side.
 *        dir: "h" (use left/right sides) or "v" (top/bottom). Use it when one box
 *        fans out to many boxes, so arrows never cut through other boxes.
 *   s.text(x, y, "words", {anchor:"middle"|"start"|"end", cls, hidden}) -> Text
 *   s.zone(x, y, w, h, "LABEL")       dashed group outline (e.g. "BAZAAR SERVER")
 *   s.onClick(el, fn)                 make a box clickable (fn gets api)
 *
 * ---------------- Step tools (t) — inside step.run(t) ----------------
 *   t.animate                         false when replaying instantly (Back / redraw)
 *   t.mark(el, "active"|"ok"|"bad"|"dim")   add a visual state
 *   t.unmark(el)                      remove all visual states
 *   t.show(el) / t.hide(el)
 *   t.label(el, "new text") / t.sub(box, "new sub text")
 *   t.packet(arrow, {label, reverse}) -> Promise, moves a dot along the arrow
 *   t.wait(ms)                        -> Promise
 *   Return a Promise from run() if the step animates; the kit waits for it.
 *
 * ---------------- api (controls / onClick) ----------------
 *   api.reset()  api.goTo(i)  api.next()  api.play()  api.pause()
 *
 * Steps are cumulative: to show step 5, the kit redraws the scene, replays
 * steps 0..4 instantly, then animates step 5. So every run() must only
 * depend on the scene + state, never on what happened in a previous click.
 * ======================================================================= */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var src = (document.currentScript && document.currentScript.src) || "";
  var BASE = src.replace(/diagram-kit\.js(\?.*)?$/, "");
  var NARROW_PX = 560;
  var STATES = ["active", "ok", "bad", "dim"];

  var registry = {};
  var requested = {};

  // ---------------- small DOM helpers ----------------
  function svgEl(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function nodeOf(el) { return el && (el.g || el.node || el); }
  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // ---------------- Scene: drawing primitives ----------------
  function Scene(svg, width, height, narrow, api) {
    this.svg = svg;
    this.width = width;
    this.height = height;
    this.narrow = narrow;
    this._api = api;
    this.back = svgEl("g", {}, svg);   // zones
    this.mid = svgEl("g", {}, svg);    // arrows
    this.front = svgEl("g", {}, svg);  // boxes + text
    this.top = svgEl("g", {}, svg);    // packets
  }

  Scene.prototype.box = function (o) {
    var g = svgEl("g", { "class": "bz-box", "data-id": o.id }, this.front);
    svgEl("rect", { x: o.x, y: o.y, width: o.w, height: o.h, rx: 8 }, g);
    var cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    var label = svgEl("text", { "class": "bz-box__label", x: cx, "text-anchor": "middle" }, g);
    label.textContent = o.label || "";
    var sub = svgEl("text", { "class": "bz-box__sub", x: cx, y: cy + 14, "text-anchor": "middle" }, g);
    var box = { kind: "box", g: g, labelEl: label, subEl: sub, x: o.x, y: o.y, w: o.w, h: o.h, cx: cx, cy: cy };
    setBoxSub(box, o.sub || "");
    if (o.hidden) g.style.display = "none";
    return box;
  };

  // Set a box's small second line. The main label moves up when there is a sub line,
  // and back to the middle when there is none, so the two never overlap.
  function setBoxSub(box, str) {
    box.subEl.textContent = str;
    box.labelEl.setAttribute("y", str ? box.cy - 4 : box.cy + 5);
  }

  function anchorOf(p) {
    return p.kind === "box" ? p : { cx: p.x, cy: p.y, w: 0, h: 0 };
  }

  Scene.prototype.arrow = function (from, to, o) {
    o = o || {};
    var a = anchorOf(from), b = anchorOf(to);
    var dx = b.cx - a.cx, dy = b.cy - a.cy;
    var off = o.offset || 0;
    var x1, y1, x2, y2;
    // dir "h" = leave/enter boxes through their left/right sides, "v" = top/bottom.
    // Without dir, the kit picks the side that fits the boxes' positions.
    var horizontal = o.dir ? o.dir === "h"
      : Math.abs(dx) / ((a.w + b.w) || 1) >= Math.abs(dy) / ((a.h + b.h) || 1);
    if (horizontal) {
      var sx = dx >= 0 ? 1 : -1;
      x1 = a.cx + sx * a.w / 2; x2 = b.cx - sx * b.w / 2;
      y1 = a.cy + off; y2 = b.cy + off;
    } else {
      var sy = dy >= 0 ? 1 : -1;
      y1 = a.cy + sy * a.h / 2; y2 = b.cy - sy * b.h / 2;
      x1 = a.cx + off; x2 = b.cx + off;
    }
    var len = Math.hypot(x2 - x1, y2 - y1) || 1;
    var ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    var HEAD = 10;
    var lx = x2 - ux * HEAD, ly = y2 - uy * HEAD;

    var g = svgEl("g", {}, this.mid);
    var line = svgEl("path", {
      "class": "bz-arrow" + (o.dashed ? " is-dashed" : ""),
      d: "M" + x1 + " " + y1 + " L" + lx + " " + ly
    }, g);
    var px = -uy, py = ux; // perpendicular
    var head = svgEl("polygon", {
      "class": "bz-arrowhead",
      points: [x2, y2, lx + px * 5, ly + py * 5, lx - px * 5, ly - py * 5].join(" ")
    }, g);
    var labelEl = null;
    if (o.label) {
      var side = off > 0 ? 1 : -1;
      var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      var lxp = horizontal ? mx : mx + side * 8;
      var lyp = horizontal ? my + (side > 0 ? 16 : -8) : my + 4;
      labelEl = svgEl("text", {
        "class": "bz-arrow__label", x: lxp, y: lyp,
        "text-anchor": horizontal ? "middle" : (side > 0 ? "start" : "end")
      }, g);
      labelEl.textContent = o.label;
    }
    if (o.hidden) g.style.display = "none";
    return { kind: "arrow", g: g, line: line, head: head, labelEl: labelEl, x1: x1, y1: y1, x2: x2, y2: y2 };
  };

  Scene.prototype.text = function (x, y, str, o) {
    o = o || {};
    var t = svgEl("text", { "class": o.cls || "bz-note", x: x, y: y, "text-anchor": o.anchor || "start" }, this.front);
    t.textContent = str;
    if (o.hidden) t.style.display = "none";
    return { kind: "text", g: t, labelEl: t };
  };

  Scene.prototype.zone = function (x, y, w, hgt, label) {
    var g = svgEl("g", {}, this.back);
    svgEl("rect", { "class": "bz-zone", x: x, y: y, width: w, height: hgt, rx: 10 }, g);
    if (label) {
      var t = svgEl("text", { "class": "bz-zone__label", x: x + 10, y: y + 16 }, g);
      t.textContent = label;
    }
    return { kind: "zone", g: g };
  };

  Scene.prototype.onClick = function (el, fn) {
    var n = nodeOf(el), api = this._api;
    n.classList.add("is-clickable");
    n.setAttribute("tabindex", "0");
    n.setAttribute("role", "button");
    n.addEventListener("click", function () { fn(api); });
    n.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(api); }
    });
  };

  // ---------------- Step tools ----------------
  function Tools(diagram, scene, token, animate) {
    this.d = diagram;
    this.scene = scene;
    this.token = token;
    this.animate = animate;
  }
  Tools.prototype._alive = function () { return this.d.token === this.token; };
  Tools.prototype.mark = function (el, state) {
    var n = nodeOf(el);
    n.classList.add("is-" + state);
    if (el.kind === "arrow") { el.line.classList.add("is-" + state); el.head.classList.add("is-" + state); }
  };
  Tools.prototype.unmark = function (el) {
    var n = nodeOf(el);
    STATES.forEach(function (s) {
      n.classList.remove("is-" + s);
      if (el.kind === "arrow") { el.line.classList.remove("is-" + s); el.head.classList.remove("is-" + s); }
    });
  };
  Tools.prototype.show = function (el) { nodeOf(el).style.display = ""; };
  Tools.prototype.hide = function (el) { nodeOf(el).style.display = "none"; };
  Tools.prototype.label = function (el, str) { if (el.labelEl) el.labelEl.textContent = str; };
  Tools.prototype.sub = function (el, str) { if (el.subEl) setBoxSub(el, str); };
  Tools.prototype.wait = function (ms) {
    if (!this.animate) return Promise.resolve();
    return delay(ms / this.d.speed);
  };
  Tools.prototype.packet = function (arrow, o) {
    o = o || {};
    if (!this.animate) return Promise.resolve();
    var self = this;
    var g = svgEl("g", { "class": "bz-packet" }, this.scene.top);
    svgEl("circle", { r: 12 }, g);
    var t = svgEl("text", { "text-anchor": "middle", y: 4 }, g);
    t.textContent = o.label || "";
    var sx = o.reverse ? arrow.x2 : arrow.x1, sy = o.reverse ? arrow.y2 : arrow.y1;
    var ex = o.reverse ? arrow.x1 : arrow.x2, ey = o.reverse ? arrow.y1 : arrow.y2;
    var duration = (o.duration || 900) / this.d.speed;
    return new Promise(function (resolve) {
      var start = null;
      function frame(now) {
        if (!self._alive()) { g.remove(); resolve(); return; }
        if (start === null) start = now;
        var k = Math.min(1, (now - start) / duration);
        var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; // ease in-out
        g.setAttribute("transform", "translate(" + (sx + (ex - sx) * e) + " " + (sy + (ey - sy) * e) + ")");
        if (k < 1) requestAnimationFrame(frame);
        else { g.remove(); resolve(); }
      }
      requestAnimationFrame(frame);
    });
  };

  // ---------------- Diagram: DOM + step controller ----------------
  function Diagram(container, def) {
    var self = this;
    this.container = container;
    this.def = def;
    this.state = def.state ? JSON.parse(JSON.stringify(def.state)) : {};
    // <div class="bz-diagram" data-diagram="x" data-state-sit="merge"> sets state.sit = "merge" (strings only),
    // so one diagram can open on a different situation in different lessons.
    Object.keys(container.dataset).forEach(function (k) {
      if (k.length > 5 && k.indexOf("state") === 0) self.state[k.charAt(5).toLowerCase() + k.slice(6)] = container.dataset[k];
    });
    this.index = -1;
    this.token = 0;
    this.playing = false;
    this.busy = false;
    this.speed = 1;
    this.steps = [];

    container.textContent = "";
    if (def.title) container.appendChild(h("div", "bz-diagram__title", def.title));
    this.stage = h("div", "bz-diagram__stage");
    this.inputs = h("div", "bz-diagram__inputs");
    this.caption = h("div", "bz-diagram__caption");
    this.caption.setAttribute("aria-live", "polite");
    var controls = h("div", "bz-diagram__controls");
    container.appendChild(this.stage);
    container.appendChild(this.inputs);
    container.appendChild(this.caption);
    container.appendChild(controls);

    function btn(text, fn, primary) {
      var b = h("button", "bz-btn" + (primary ? " bz-btn--primary" : ""), text);
      b.type = "button";
      b.addEventListener("click", fn);
      controls.appendChild(b);
      return b;
    }
    this.btnPlay = btn("▶ Play", function () { self.playing ? self.pause() : self.play(); }, true);
    this.btnBack = btn("◀ Back", function () { self.back(); });
    this.btnNext = btn("Next ▶", function () { self.next(); });
    this.btnReset = btn("↺ Reset", function () { self.reset(); });

    var speed = h("label", "bz-speed");
    speed.appendChild(document.createTextNode("Speed"));
    var range = h("input");
    range.type = "range"; range.min = "0.5"; range.max = "3"; range.step = "0.25"; range.value = "1";
    range.setAttribute("aria-label", "Animation speed");
    var speedVal = h("span", null, "1x");
    range.addEventListener("input", function () { self.speed = +range.value; speedVal.textContent = range.value + "x"; });
    speed.appendChild(range);
    speed.appendChild(speedVal);
    controls.appendChild(speed);

    this.api = {
      reset: function () { self.reset(); },
      goTo: function (i) { self.pause(); self.goTo(i, true); },
      next: function () { self.next(); },
      play: function () { self.play(); },
      pause: function () { self.pause(); }
    };

    if (def.controls) def.controls(this._ui(), this.state, this.api);

    this.narrow = container.clientWidth > 0 && container.clientWidth < NARROW_PX;
    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        var n = container.clientWidth > 0 && container.clientWidth < NARROW_PX;
        if (n !== self.narrow) { self.narrow = n; self.goTo(self.index, false); }
      }).observe(container);
    }
    this.reset();
  }

  Diagram.prototype._ui = function () {
    var box = this.inputs;
    return {
      input: function (o) {
        var wrap = h("label");
        wrap.appendChild(document.createTextNode((o.label || "") + " "));
        var inp = h("input", "bz-input");
        inp.type = o.type || "text";
        if (o.value != null) inp.value = o.value;
        if (o.min != null) inp.min = o.min;
        if (o.max != null) inp.max = o.max;
        if (o.width) inp.style.width = o.width;
        inp.addEventListener("change", function () { if (o.onChange) o.onChange(inp.value); });
        wrap.appendChild(inp);
        box.appendChild(wrap);
        return inp;
      },
      select: function (o) {
        var wrap = h("label");
        wrap.appendChild(document.createTextNode((o.label || "") + " "));
        var sel = h("select", "bz-input");
        o.options.forEach(function (opt) {
          var op = h("option", null, opt.label || opt);
          op.value = opt.value != null ? opt.value : opt;
          sel.appendChild(op);
        });
        if (o.value != null) sel.value = o.value;
        sel.addEventListener("change", function () { if (o.onChange) o.onChange(sel.value); });
        wrap.appendChild(sel);
        box.appendChild(wrap);
        return sel;
      },
      button: function (text, fn) {
        var b = h("button", "bz-btn", text);
        b.type = "button";
        b.addEventListener("click", fn);
        box.appendChild(b);
        return b;
      },
      note: function (text) { var s = h("span", null, text); box.appendChild(s); return s; }
    };
  };

  Diagram.prototype._draw = function () {
    var size = this.def.size ? this.def.size(this.narrow) : [800, 360];
    this.stage.textContent = "";
    var svg = svgEl("svg", {
      "class": "bz-svg", viewBox: "0 0 " + size[0] + " " + size[1],
      role: "img", "aria-label": this.def.title || "Diagram"
    }, this.stage);
    var scene = new Scene(svg, size[0], size[1], this.narrow, this.api);
    this.steps = this.def.scene(scene, this.state, this.api) || [];
    return scene;
  };

  Diagram.prototype._caption = function () {
    var c;
    if (this.index < 0) {
      c = this.def.intro || "Press <b>Play</b> or <b>Next</b> to start.";
    } else {
      var st = this.steps[this.index];
      var txt = typeof st.caption === "function" ? st.caption(this.state) : st.caption;
      c = '<span class="bz-diagram__step">Step ' + (this.index + 1) + "/" + this.steps.length + "</span>" + txt;
    }
    this.caption.innerHTML = c; // captions are authored by us, never user input
  };

  Diagram.prototype._buttons = function () {
    var last = this.steps.length - 1;
    this.btnBack.disabled = this.index < 0;
    this.btnNext.disabled = this.index >= last;
    this.btnPlay.textContent = this.playing ? "❚❚ Pause" : (this.index >= last ? "▶ Replay" : "▶ Play");
  };

  // Show the state after step i. animate=true animates step i itself.
  Diagram.prototype.goTo = function (i, animate) {
    var self = this;
    var token = ++this.token;
    var scene = this._draw();
    i = Math.max(-1, Math.min(i, this.steps.length - 1));
    this.index = i;
    this._caption();
    this._buttons();

    var chain = Promise.resolve();
    for (var j = 0; j < i; j++) {
      (function (step) {
        chain = chain.then(function () { if (self.token === token) return step.run(new Tools(self, scene, token, false)); });
      })(this.steps[j]);
    }
    if (i >= 0) {
      var cur = this.steps[i];
      chain = chain.then(function () { if (self.token === token) return cur.run(new Tools(self, scene, token, !!animate)); });
    }
    this.busy = true;
    return chain.then(function () {
      if (self.token !== token) return;
      self.busy = false;
      if (self.playing) {
        if (self.index >= self.steps.length - 1) { self.playing = false; self._buttons(); return; }
        return delay(1400 / self.speed).then(function () {
          if (self.token === token && self.playing) self.goTo(self.index + 1, true);
        });
      }
    });
  };

  Diagram.prototype.play = function () {
    this.playing = true;
    if (this.index >= this.steps.length - 1) this.goTo(0, true);
    else if (!this.busy) this.goTo(this.index + 1, true);
    this._buttons();
  };
  Diagram.prototype.pause = function () { this.playing = false; this._buttons(); };
  Diagram.prototype.next = function () { this.pause(); this.goTo(this.index + 1, true); };
  Diagram.prototype.back = function () { this.pause(); this.goTo(this.index - 1, false); };
  Diagram.prototype.reset = function () { this.playing = false; this.goTo(-1, false); };

  // ---------------- registry + lazy loading ----------------
  function mount(node) {
    var name = node.getAttribute("data-diagram");
    if (node.getAttribute("data-bz-ready")) return;
    if (registry[name]) {
      node.setAttribute("data-bz-ready", "1");
      try { new Diagram(node, registry[name]); }
      catch (e) { node.textContent = "This diagram failed to load: " + e.message; }
      return;
    }
    if (!requested[name]) {
      requested[name] = true;
      node.textContent = "Loading diagram…";
      var s = document.createElement("script");
      s.src = BASE + encodeURIComponent(name) + ".js";
      s.onerror = function () { node.textContent = 'Diagram "' + name + '" not found.'; };
      document.head.appendChild(s);
    }
  }

  function mountAll() {
    Array.prototype.forEach.call(document.querySelectorAll(".bz-diagram[data-diagram]"), mount);
  }

  window.DiagramKit = {
    register: function (name, def) { registry[name] = def; mountAll(); },
    mountAll: mountAll,
    _Diagram: Diagram
  };

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(mountAll);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountAll);
  } else {
    mountAll();
  }
})();
