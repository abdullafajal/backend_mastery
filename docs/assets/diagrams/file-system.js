/* file-system — Module 1, Lesson 4.
 * Three columns: NAMES (folder entries) -> INODES (the file's record) -> DATA BLOCKS.
 * Situations: finding a file by its path, deleting a file that is still open,
 * and saving a file safely with an atomic rename. */
DiagramKit.register("file-system", {
  title: "Names, inodes and data blocks",
  intro: "Pick a situation, then press <b>Play</b>. A file's <b>name</b> points to an <b>inode</b>, and the inode points to the <b>data blocks</b>.",
  state: { situation: "find" },

  size: function (narrow) { return narrow ? [360, 710] : [840, 400]; },

  controls: function (ui, state, api) {
    ui.select({
      label: "Situation:",
      value: state.situation,
      options: [
        { value: "find", label: "Find a file by its path" },
        { value: "deleted", label: "Delete a file that is still open" },
        { value: "safe", label: "Save safely (atomic rename)" }
      ],
      onChange: function (v) { state.situation = v; api.reset(); }
    });
  },

  scene: function (s, state) {
    var n = s.narrow;
    // Wide: three columns (c = 0, 1, 2), rows inside them.
    // Phone: three bands, one under the other. `side` 0/1 puts two boxes next to each other
    // (left/right half), so their arrows down to the next band never cross each other's box.
    function col(c, row, label, sub, hidden, side) {
      if (n) {
        var half = side === 0 || side === 1;
        return s.box({ x: half ? 10 + side * 175 : 10, y: 44 + c * 230 + row * 58, w: half ? 165 : 340, h: 48,
                       label: label, sub: sub, hidden: hidden });
      }
      return s.box({ x: 20 + c * 285, y: 50 + row * 90, w: 245, h: 60, label: label, sub: sub, hidden: hidden });
    }
    if (n) {
      s.zone(4, 14, 352, 225, "NAMES (folders)");
      s.zone(4, 244, 352, 225, "INODES");
      s.zone(4, 474, 352, 225, "DATA BLOCKS (4 KB each)");
    } else {
      s.zone(8, 14, 269, 380, "NAMES (folder entries)");
      s.zone(293, 14, 269, 380, "INODES");
      s.zone(578, 14, 254, 380, "DATA BLOCKS (4 KB each)");
    }
    function link(a, b, o) { o = o || {}; o.hidden = o.hidden !== false; o.dir = n ? "v" : "h"; return s.arrow(a, b, o); }
    function on(t, xs) { xs.forEach(function (x) { t.show(x); }); }

    if (state.situation === "find") {
      var nRoot = col(0, 0, "/  →  data", "root folder"),
          nData = col(0, 1, "data/  →  orders", "a folder is a list of names", true),
          nFile = col(0, 2, "order_1042.json", "→ inode 1042", true);
      var ino = col(1, 1, "inode 1042", "size, owner, permissions, times", true);
      var blk = col(2, 1, "blocks 8801, 8802", "the JSON text itself", true);
      var a1 = link(nFile, ino), a2 = link(ino, blk);
      return [
        { caption: "Bazaar asks for <code>/data/orders/order_1042.json</code>. The kernel starts at the <b>root folder</b> <code>/</code> and looks up the first name, <code>data</code>.",
          run: function (t) { t.mark(nRoot, "active"); } },
        { caption: "A folder is just a special file holding a list of <b>names</b>, each with an inode number. In <code>data</code>, it finds <code>orders</code>, and so on, one folder at a time.",
          run: function (t) { t.unmark(nRoot); on(t, [nData]); t.mark(nData, "active"); } },
        { caption: "Finally it finds the name <code>order_1042.json</code>. The name holds only one thing: an <b>inode number</b>, 1042.",
          run: function (t) { t.unmark(nData); on(t, [nFile]); t.mark(nFile, "active"); } },
        { caption: "The <b>inode</b> is the file's record: its size, owner, permissions, times, and <b>where its data blocks are</b>. Note: the file's <b>name is not in the inode</b>.",
          run: function (t) { t.unmark(nFile); on(t, [ino, a1]); t.mark(a1, "active"); return t.packet(a1, { label: "#" }).then(function () { t.mark(ino, "active"); }); } },
        { caption: "The inode points to the <b>data blocks</b> on the disk. The kernel reads them (or finds them already in the page cache). Bazaar gets the order.",
          run: function (t) { t.unmark(a1); t.unmark(ino); on(t, [blk, a2]); t.mark(a2, "active"); return t.packet(a2, { label: "→" }).then(function () { t.mark(blk, "ok"); }); } }
      ];
    }

    if (state.situation === "deleted") {
      var name = col(0, 1, "orders.log", "→ inode 77", false, 0),
          proc = n ? col(0, 1, "backend process", "fd 3 → inode 77", false, 1)
                   : col(0, 3, "backend process", "file descriptor 3 → inode 77"),
          inode = col(1, 1, "inode 77", "links: 1 · open by: 1"),
          data = col(2, 1, "20 MB of blocks", "used");
      var l1 = link(name, inode, { hidden: false }), l2 = link(proc, inode, { hidden: false }), l3 = link(inode, data, { hidden: false });
      return [
        { caption: "Bazaar's backend has <code>orders.log</code> open. Two things point to inode 77: the <b>name</b> in the folder, and the process's <b>file descriptor</b> 3.",
          run: function (t) { t.mark(name, "active"); t.mark(proc, "active"); } },
        { caption: "Someone runs <code>rm orders.log</code>. Only the <b>name</b> is removed. The inode's link count drops to 0...",
          run: function (t) { t.unmark(name); t.unmark(proc); t.hide(l1); t.mark(name, "dim"); t.sub(name, "removed by rm"); t.sub(inode, "links: 0 · open by: 1"); t.mark(inode, "active"); } },
        { caption: "...but the process still has it open. So the inode and its 20 MB stay. <code>df</code> shows <b>no space freed</b>. <code>/proc/&lt;pid&gt;/fd/3</code> shows the file as <code>(deleted)</code>.",
          run: function (t) { t.mark(data, "bad"); t.sub(data, "still used: 20 MB"); t.mark(proc, "active"); } },
        { caption: "The process closes the file (or is restarted). Now nothing points to the inode: links 0, open by 0. Only <b>now</b> are the inode and its blocks freed.",
          run: function (t) { t.unmark(proc); t.hide(l2); t.hide(l3); t.sub(proc, "closed the file"); t.unmark(inode); t.mark(inode, "dim"); t.sub(inode, "freed"); t.unmark(data); t.mark(data, "ok"); t.sub(data, "free again: 20 MB"); } }
      ];
    }

    // safe save
    var r0 = n ? 1 : 0, r2 = n ? 1 : 2;   // phone: old chain on the left half, new chain on the right half
    var nName = col(0, r0, "products.json", "→ inode A", false, 0),
        nTmp = col(0, r2, n ? "….json.tmp" : "products.json.tmp", "→ inode B", true, 1);
    var iA = col(1, r0, "inode A", "yesterday's products", false, 0), iB = col(1, r2, "inode B", "new products", true, 1);
    var bA = col(2, r0, "old blocks", "1 product", false, 0), bB = col(2, r2, "new blocks", n ? "20,000 products" : "20,000 products", true, 1);
    var ln1 = link(nName, iA, { hidden: false }), ln2 = link(iA, bA, { hidden: false }),
        ln3 = link(nTmp, iB), ln4 = link(iB, bB), swap = s.arrow(nName, iB, { hidden: true, dashed: false });
    return [
      { caption: "Readers open <code>products.json</code>. The name points to inode A with yesterday's good data.",
        run: function (t) { t.mark(nName, "active"); } },
      { caption: "<b>Step 1:</b> write the new data to a <b>temporary file in the same folder</b>. It gets its own inode B. Readers still see A, untouched. A crash now? A is still fine.",
        run: function (t) { t.unmark(nName); on(t, [nTmp, iB, bB, ln3, ln4]); t.mark(nTmp, "active"); t.mark(bB, "active"); } },
      { caption: "<b>Step 2:</b> <code>fsync</code> the temporary file, so its blocks are really on the disk.",
        run: function (t) { t.unmark(nTmp); t.unmark(bB); t.mark(bB, "ok"); t.sub(bB, "20,000 products · on disk"); } },
      { caption: "<b>Step 3:</b> <code>os.replace(tmp, products.json)</code>. The kernel changes the name's pointer from A to B in <b>one atomic step</b>. Readers see either the old file or the new one, never half of one.",
        run: function (t) { t.hide(ln1); t.hide(ln3); t.show(swap); t.mark(swap, "active"); t.hide(nTmp); t.sub(nName, "→ inode B"); t.mark(nName, "ok"); t.mark(iB, "ok"); } },
      { caption: "Nothing points to inode A any more, so the old version is freed. If the crash had happened in step 1 or 2, readers would still have A, and the half-written <code>.tmp</code> would just need cleaning up.",
        run: function (t) { t.hide(ln2); t.mark(iA, "dim"); t.sub(iA, "freed"); t.mark(bA, "dim"); t.sub(bA, "freed"); } }
    ];
  }
});
