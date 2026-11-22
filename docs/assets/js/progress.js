/* Backend Mastery — progress.js
 *
 * Saves the student's progress in localStorage (no backend).
 *
 * Widgets it renders (put these in a lesson's Markdown):
 *   <div class="bz-quiz" data-quiz="m00-01"></div>      -> loads assets/quizzes/m00-01.json
 *   <div class="bz-complete" data-lesson="m00-01"></div> -> "Mark lesson complete" button
 *   <div class="bz-progress-summary"></div>              -> "You finished N lessons"
 *
 * Storage shape (key "bz-progress-v1"):
 *   { lessons: { "m00-01": { done: true, at: "2026-11-21T..." } },
 *     quizzes: { "m00-01": { score: 4, total: 5, at: "..." } } }
 */
(function () {
  "use strict";

  var KEY = "bz-progress-v1";

  // Where assets/ lives, worked out from this script's own URL.
  // Works on GitHub Pages sub-paths and on `mkdocs serve`.
  var scriptSrc = (document.currentScript && document.currentScript.src) || "";
  var ASSETS = scriptSrc.replace(/js\/progress\.js(\?.*)?$/, "");

  // ---------- storage (always wrapped: private mode can throw) ----------
  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      var data = raw ? JSON.parse(raw) : {};
      data.lessons = data.lessons || {};
      data.quizzes = data.quizzes || {};
      return data;
    } catch (e) {
      return { lessons: {}, quizzes: {} };
    }
  }
  function save(data) {
    try { window.localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // ---------- lesson complete button ----------
  function initComplete(box) {
    var id = box.getAttribute("data-lesson");
    var btn = el("button", "bz-btn bz-btn--primary");
    btn.type = "button";
    var state = el("span", "bz-complete__state");
    box.appendChild(btn);
    box.appendChild(state);

    function render() {
      var done = !!(load().lessons[id] || {}).done;
      box.classList.toggle("is-done", done);
      btn.textContent = done ? "Mark as not done" : "Mark lesson complete";
      state.textContent = done ? "✓ Lesson complete. Nice work!" : "Finished reading and the lab? Mark it done.";
    }
    btn.addEventListener("click", function () {
      var data = load();
      var done = !!(data.lessons[id] || {}).done;
      if (done) delete data.lessons[id];
      else data.lessons[id] = { done: true, at: new Date().toISOString() };
      save(data);
      render();
    });
    render();
  }

  // ---------- quiz ----------
  function initQuiz(box) {
    var id = box.getAttribute("data-quiz");
    box.textContent = "Loading quiz…";
    fetch(ASSETS + "quizzes/" + id + ".json")
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (quiz) { renderQuiz(box, id, quiz); })
      .catch(function () { box.textContent = "Could not load the quiz. Please refresh the page."; });
  }

  function renderQuiz(box, id, quiz) {
    box.textContent = "";
    var total = quiz.questions.length;
    var answered = 0;
    var correct = 0;
    var score = el("div", "bz-quiz__score");

    var prev = load().quizzes[id];
    function showScore() {
      var best = prev ? " · Best so far: " + prev.score + "/" + prev.total : "";
      score.textContent = answered < total
        ? "Answered " + answered + " of " + total + best
        : "Your score: " + correct + "/" + total + best;
    }

    quiz.questions.forEach(function (item, qi) {
      var card = el("div", "bz-quiz__q");
      card.appendChild(el("div", "bz-quiz__qtext", (qi + 1) + ". " + item.q));
      var explain = el("div", "bz-quiz__explain");
      var buttons = item.options.map(function (opt, oi) {
        var b = el("button", "bz-quiz__opt", opt);
        b.type = "button";
        b.addEventListener("click", function () {
          buttons.forEach(function (x) { x.disabled = true; });
          var ok = oi === item.answer;
          b.classList.add(ok ? "is-correct" : "is-wrong");
          buttons[item.answer].classList.add("is-correct");
          explain.textContent = (ok ? "✓ Correct. " : "✗ Not quite. ") + item.explain;
          explain.classList.add("is-shown");
          answered += 1;
          if (ok) correct += 1;
          if (answered === total) {
            var data = load();
            var old = data.quizzes[id];
            if (!old || correct >= old.score) {
              data.quizzes[id] = { score: correct, total: total, at: new Date().toISOString() };
              save(data);
            }
          }
          showScore();
        });
        card.appendChild(b);
        return b;
      });
      card.appendChild(explain);
      box.appendChild(card);
    });

    var retry = el("button", "bz-btn", "Try again");
    retry.type = "button";
    retry.addEventListener("click", function () { prev = load().quizzes[id]; renderQuiz(box, id, quiz); });
    box.appendChild(score);
    box.appendChild(retry);
    showScore();
  }

  // ---------- summary ----------
  function initSummary(box) {
    var data = load();
    var n = Object.keys(data.lessons).length;
    var q = Object.keys(data.quizzes).length;
    box.textContent = n === 0
      ? "You have not finished any lesson yet. Start with Module 0 below."
      : "You finished " + n + " lesson" + (n === 1 ? "" : "s") + " and " + q + " quiz" + (q === 1 ? "" : "zes") + ". Keep going!";
  }

  // ---------- boot (safe to call many times) ----------
  function boot() {
    function each(sel, fn) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (n) {
        if (n.getAttribute("data-bz-ready")) return;
        n.setAttribute("data-bz-ready", "1");
        fn(n);
      });
    }
    each(".bz-complete[data-lesson]", initComplete);
    each(".bz-quiz[data-quiz]", initQuiz);
    each(".bz-progress-summary", initSummary);
  }

  window.BazaarProgress = { load: load, save: save, assetsBase: ASSETS };

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(boot);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
