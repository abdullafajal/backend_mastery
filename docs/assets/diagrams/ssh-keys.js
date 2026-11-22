/* ssh-keys — Module 2, Lesson 6.
 * Situation "key": logging in with a key. The private key never leaves the laptop; the server
 *   checks a signature with the public key from authorized_keys.
 * Situation "first": the first connection to a new server, and known_hosts. */
DiagramKit.register("ssh-keys", {
  title: "How SSH logs you in with a key",
  intro: "Pick a situation, then press <b>Play</b>.",
  state: { sit: "key" },
  size: function (narrow) { return narrow ? [360, 450] : [840, 340]; },
  controls: function (ui, state, api) {
    ui.select({ label: "Situation:", value: state.sit,
      options: [{ value: "key", label: "Logging in with a key" }, { value: "first", label: "The first connection to a server" }],
      onChange: function (v) { state.sit = v; api.reset(); } });
  },
  scene: function (s, state) {
    var n = s.narrow, lap, priv, kh, srv, pub, hk;
    if (n) {
      s.zone(6, 8, 348, 200, "YOUR LAPTOP");
      lap = s.box({ x: 16, y: 34, w: 160, h: 56, label: "ssh asha@…", sub: "the client" });
      priv = s.box({ x: 184, y: 34, w: 160, h: 56, label: "private key", sub: "~/.ssh/id_ed25519" });
      kh = s.box({ x: 184, y: 120, w: 160, h: 56, label: "known_hosts", sub: "servers I trust" });   // right side: the arrows run down the left
      s.zone(6, 236, 348, 206, "BAZAAR-SERVER");
      srv = s.box({ x: 16, y: 264, w: 160, h: 56, label: "sshd", sub: "the SSH server" });
      pub = s.box({ x: 184, y: 264, w: 160, h: 56, label: "authorized_keys", sub: "asha's public key" });
      hk = s.box({ x: 100, y: 356, w: 160, h: 56, label: "host key", sub: "the server's ID" });
    } else {
      s.zone(10, 14, 330, 310, "YOUR LAPTOP");
      lap = s.box({ x: 30, y: 60, w: 290, h: 60, label: "ssh asha@bazaar-server", sub: "the client" });
      priv = s.box({ x: 30, y: 150, w: 135, h: 60, label: "private key", sub: "id_ed25519" });
      kh = s.box({ x: 185, y: 150, w: 135, h: 60, label: "known_hosts", sub: "servers I trust" });
      s.zone(500, 14, 330, 310, "BAZAAR-SERVER");
      srv = s.box({ x: 520, y: 60, w: 290, h: 60, label: "sshd", sub: "the SSH server" });
      pub = s.box({ x: 520, y: 150, w: 135, h: 60, label: "authorized_keys", sub: "asha's public key" });
      hk = s.box({ x: 675, y: 150, w: 135, h: 60, label: "host key", sub: "the server's ID" });
    }
    var go = s.arrow(lap, srv, { offset: n ? -20 : -12, label: n ? "" : "connect", dir: n ? "v" : "h" });
    var back = s.arrow(srv, lap, { offset: n ? 20 : 12, label: n ? "" : "answer", dir: n ? "v" : "h" });

    if (state.sit === "first") {
      return [
        { caption: "You run <code>ssh asha@bazaar-server</code> for the first time. The laptop connects to port 22.",
          run: function (t) { t.mark(lap, "active"); t.mark(go, "active"); return t.packet(go, { label: "hi" }); } },
        { caption: "The server shows its <b>host key</b>: its ID card, so you know you're talking to the real server and not an impostor.",
          run: function (t) { t.unmark(lap); t.unmark(go); t.mark(hk, "active"); t.mark(back, "active"); return t.packet(back, { label: "ID" }); } },
        { caption: "The laptop checks <code>known_hosts</code>. This server isn't there yet, so SSH asks: <code>Are you sure you want to continue connecting (yes/no/[fingerprint])?</code>",
          run: function (t) { t.unmark(back); t.unmark(hk); t.mark(kh, "bad"); t.sub(kh, "not there yet"); } },
        { caption: "You type <code>yes</code>. SSH saves the host key in <code>known_hosts</code>: <code>Permanently added 'bazaar-server' (ED25519) to the list of known hosts</code>. Then it asks for asha's password.",
          run: function (t) { t.unmark(kh); t.mark(kh, "ok"); t.sub(kh, "+ bazaar-server"); } },
        { caption: "Next time, the laptop checks the host key against <code>known_hosts</code> silently. If it ever <b>changes</b>, SSH refuses with a loud warning, because someone may be pretending to be your server.",
          run: function (t) { t.mark(go, "active"); return t.packet(go, { label: "hi" }).then(function () { t.mark(hk, "ok"); }); } }
      ];
    }

    return [
      { caption: "Once: you made a <b>key pair</b> with <code>ssh-keygen</code>. The <b>private key</b> stays on your laptop, secret. The <b>public key</b> was copied into the server's <code>authorized_keys</code> (<code>ssh-copy-id</code>).",
        run: function (t) { t.mark(priv, "active"); t.mark(pub, "active"); } },
      { caption: "You run <code>ssh asha@bazaar-server</code>. The laptop says: \"I'm asha, and I have a key.\"",
        run: function (t) { t.unmark(priv); t.unmark(pub); t.mark(lap, "active"); t.mark(go, "active"); return t.packet(go, { label: "asha" }); } },
        { caption: "The server finds asha's public key in <code>authorized_keys</code> and sends a <b>challenge</b>: random data only the matching private key can sign.",
        run: function (t) { t.unmark(lap); t.unmark(go); t.mark(pub, "active"); t.mark(back, "active"); return t.packet(back, { label: "?" }); } },
      { caption: "The laptop <b>signs</b> the challenge with the private key and sends back only the signature. <b>The private key never leaves the laptop.</b>",
        run: function (t) { t.unmark(pub); t.unmark(back); t.mark(priv, "ok"); t.mark(go, "active"); return t.packet(go, { label: "✍" }); } },
      { caption: "The server checks the signature with the public key. It matches: you're in, with no password. The server's log says <code>Accepted publickey for asha</code>.",
        run: function (t) { t.unmark(go); t.mark(srv, "ok"); t.sub(srv, "Accepted publickey"); t.mark(lap, "ok"); t.sub(lap, "asha@bazaar-server:~$"); } }
    ];
  }
});
