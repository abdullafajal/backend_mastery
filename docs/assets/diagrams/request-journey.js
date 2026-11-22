/* request-journey — Module 0, Lesson 1.
 * One request from Asha's phone, through the Bazaar backend, to the database and back.
 * The student picks what Asha does (search or order) and watches the journey change.
 * This file is the REFERENCE EXAMPLE for writing diagrams with diagram-kit.js. */
DiagramKit.register("request-journey", {
  title: "One request to Bazaar: frontend → backend → database",
  intro: "Pick what Asha does, then press <b>Play</b>. Watch the request travel.",
  state: { action: "search" },

  size: function (narrow) { return narrow ? [360, 600] : [840, 330]; },

  controls: function (ui, state, api) {
    ui.select({
      label: "Asha wants to:",
      value: state.action,
      options: [
        { value: "search", label: "Search for shoes" },
        { value: "order", label: "Order a Masala Box" }
      ],
      onChange: function (v) { state.action = v; api.reset(); }
    });
  },

  scene: function (s, state) {
    var order = state.action === "order";
    var phone, backend, db;

    // ---- layout: side by side on wide screens, top to bottom on phones ----
    if (s.narrow) {
      s.zone(10, 8, 340, 120, "FRONTEND");
      s.zone(10, 200, 340, 392, "BACKEND");
      phone = s.box({ x: 95, y: 38, w: 170, h: 70, label: "Asha's phone", sub: "Bazaar app" });
      backend = s.box({ x: 95, y: 250, w: 170, h: 70, label: "Bazaar backend", sub: "Python code" });
      db = s.box({ x: 95, y: 490, w: 170, h: 70, label: "Database", sub: "products, orders" });
    } else {
      s.zone(10, 40, 210, 250, "FRONTEND · what you see");
      s.zone(270, 40, 560, 250, "BACKEND · what you don't see");
      phone = s.box({ x: 35, y: 130, w: 160, h: 70, label: "Asha's phone", sub: "Bazaar app" });
      backend = s.box({ x: 330, y: 130, w: 180, h: 70, label: "Bazaar backend", sub: "Python code" });
      db = s.box({ x: 620, y: 130, w: 180, h: 70, label: "Database", sub: "products, orders" });
    }

    var req = s.arrow(phone, backend, { label: "request", offset: -14 });
    var res = s.arrow(backend, phone, { label: "response", offset: 14 });
    var query = s.arrow(backend, db, { label: order ? "save" : "query", offset: -14 });
    var rows = s.arrow(db, backend, { label: order ? "saved" : "rows", offset: 14 });

    var noteX = s.narrow ? 180 : 420, noteY = s.narrow ? 362 : 240;
    var note = s.text(noteX, noteY, "", { anchor: "middle", hidden: true });

    var http = order ? "POST /orders" : "GET /products?q=shoes";

    return [
      {
        caption: order
          ? "Asha taps <b>Buy now</b> on the Masala Box (₹299). Her phone is the <b>frontend</b>: the part she can see and touch."
          : "Asha types <b>shoes</b> in the search box. Her phone is the <b>frontend</b>: the part she can see and touch.",
        run: function (t) { t.mark(phone, "active"); }
      },
      {
        caption: "The app sends a <b>request</b> over the internet: <code>" + http + "</code>. A request is a message that asks the backend to do something.",
        run: function (t) {
          t.unmark(phone);
          t.mark(req, "active");
          return t.packet(req, { label: order ? "POST" : "GET" });
        }
      },
      {
        caption: order
          ? "The <b>backend</b> checks the rules: Is Asha logged in? Is the Masala Box in stock? Is ₹299 the real price? The phone cannot be trusted with these checks."
          : "The <b>backend</b> reads the request and decides what to do. It is code running on a computer far away, called a <b>server</b>.",
        run: function (t) {
          t.unmark(req);
          t.mark(backend, "active");
          t.label(note, order ? "✓ logged in  ✓ in stock  ✓ price ok" : "find products named \"shoes\"");
          t.show(note);
          return t.wait(600);
        }
      },
      {
        caption: order
          ? "The backend asks the <b>database</b> to save the new order. A database is where Bazaar keeps its data safely."
          : "The backend asks the <b>database</b> for matching products. A database is where Bazaar keeps its data safely.",
        run: function (t) {
          t.hide(note);
          t.unmark(backend);
          t.mark(query, "active");
          return t.packet(query, { label: order ? "+" : "?" });
        }
      },
      {
        caption: order
          ? "The database saves order <b>#1042</b> and says \"done\"."
          : "The database finds <b>Red Running Shoes</b> (₹999) and sends the row back.",
        run: function (t) {
          t.unmark(query);
          t.mark(db, "ok");
          t.mark(rows, "active");
          return t.packet(rows, { label: "✓" });
        }
      },
      {
        caption: "The backend turns the result into <b>JSON</b> (a simple text format for data) and sends a <b>response</b> back to the phone.",
        run: function (t) {
          t.unmark(rows);
          t.unmark(db);
          t.mark(res, "active");
          return t.packet(res, { label: "{ }" });
        }
      },
      {
        caption: order
          ? "Asha sees <b>Order #1042 placed!</b> The whole trip took less than a second. Building everything in the dashed BACKEND box is <b>your</b> job."
          : "Asha sees <b>Red Running Shoes · ₹999</b>. The whole trip took less than a second. Building everything in the dashed BACKEND box is <b>your</b> job.",
        run: function (t) {
          t.unmark(res);
          t.mark(phone, "ok");
          t.mark(backend, "active");
          t.mark(db, "active");
          t.sub(phone, order ? "Order #1042 placed!" : "Red Running Shoes ₹999");
        }
      }
    ];
  }
});
