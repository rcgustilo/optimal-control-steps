/* Optimal &amp; MPC Steps — app shell: navigation, lessons, quizzes and progress tracking. */
(function () {
  "use strict";
  var h = W.h, fmt = W.fmt;
  var KEY = window.APP_KEY || "gtSteps.v1";
  var LESSONS = [];
  MODULES.forEach(function (m, mi) { m.lessons.forEach(function (l, li) { l.module = m; l.mi = mi; l.li = li; l.idx = LESSONS.length; LESSONS.push(l); }); });
  var BY_ID = {}; LESSONS.forEach(function (l) { BY_ID[l.id] = l; });

  // ---------------- progress storage ----------------
  var P = load();
  function load() {
    var d = { done: {}, qa: {}, hist: {}, streak: 0, best: 0, lastDay: "", last: "", goal: 1, large: false };
    try { var s = localStorage.getItem(KEY); if (s) { var o = JSON.parse(s); for (var k in o) d[k] = o[k]; } } catch (e) { }
    return d;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) { } }
  function today() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function dayDiff(a, b) { return Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 864e5); }
  function doneCount() { return Object.keys(P.done).length; }
  function liveStreak() { if (!P.lastDay) return 0; return dayDiff(P.lastDay, today()) <= 1 ? P.streak : 0; }
  function nextLesson() { for (var i = 0; i < LESSONS.length; i++) if (!P.done[LESSONS[i].id]) return LESSONS[i]; return null; }
  function moduleDone(m) { return m.lessons.filter(function (l) { return P.done[l.id]; }).length; }
  function accuracy(filter) {
    var a = 0, n = 0;
    Object.keys(P.qa).forEach(function (id) {
      if (filter && !filter(BY_ID[id])) return;
      (P.qa[id].first || []).forEach(function (x) { if (x !== null && x !== undefined) { n++; if (x) a++; } });
    });
    return n ? a / n : null;
  }
  function todayCount() { return P.hist[today()] || 0; }
  if (P.large) document.documentElement.classList.add("large");

  // ---------------- rendering helpers ----------------
  var app = document.getElementById("app");
  function math(el) {
    if (window.renderMathInElement) {
      try {
        renderMathInElement(el, { delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }], throwOnError: false });
      } catch (e) { }
    }
  }
  function tex(t, display) {
    var span = h("div", { class: "ft" });
    try { katex.render(t, span, { displayMode: !!display, throwOnError: false }); } catch (e) { span.textContent = t; }
    return span;
  }
  function header(title, back) {
    var top = h("div", { class: "top" });
    if (back) { var b = h("button", { class: "back" }, "‹ Back"); b.onclick = function () { location.hash = back; }; top.appendChild(b); }
    else top.appendChild(h("div", { class: "logo" }, window.APP_LOGO || "GT"));
    top.appendChild(h("h1", null, title));
    var st = h("button", { class: "back", "aria-label": "Settings" }, "⚙️"); st.onclick = settings; top.appendChild(st);
    return top;
  }
  function ring(pct, size) {
    size = size || 92;
    var r = size / 2 - 8, c = 2 * Math.PI * r;
    return '<svg class="ring" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + " " + size + '">' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="var(--chip)" stroke-width="10"/>' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="var(--accent)" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + (c * pct).toFixed(1) + " " + c.toFixed(1) + '" transform="rotate(-90 ' + size / 2 + " " + size / 2 + ')"/>' +
      '<text x="50%" y="54%" text-anchor="middle" font-size="' + (size * 0.2) + '" font-weight="800" fill="var(--ink)">' + Math.round(pct * 100) + "%</text></svg>";
  }
  function setTab(id) { ["tHome", "tMods", "tForm", "tProg"].forEach(function (t) { document.getElementById(t).classList.toggle("on", t === id); }); }
  document.querySelectorAll(".tabbar button").forEach(function (b) { b.onclick = function () { location.hash = b.getAttribute("data-go"); }; });

  // ---------------- screens ----------------
  function home() {
    setTab("tHome");
    app.appendChild(header(window.APP_TITLE || "Optimal &amp; MPC Steps"));
    var n = doneCount(), pct = n / LESSONS.length, nx = nextLesson();
    var hero = h("div", { class: "card hero" });
    hero.innerHTML = ring(pct);
    var right = h("div");
    right.innerHTML = "<h2>" + (n === 0 ? "Welcome! 👋" : nx ? "Keep going, step by step" : "Course complete! 🎓") + "</h2>" +
      "<div class='muted small'>" + n + " of " + LESSONS.length + " lessons · " + MODULES.length + " modules</div>" +
      "<div class='small' style='margin-top:6px'>Today: <b>" + todayCount() + " / " + P.goal + "</b> lesson" + (P.goal > 1 ? "s" : "") + (todayCount() >= P.goal ? " ✅ goal reached, rest or review" : "") + "</div>";
    hero.appendChild(right);
    app.appendChild(hero);
    if (nx) {
      var c = h("div", { class: "card" });
      c.innerHTML = "<div class='muted small'>" + (n ? "Next lesson" : "Start here") + " · Module " + (nx.mi + 1) + ": " + nx.module.title + "</div><h3>" + nx.module.icon + " " + nx.title + "</h3>";
      var b = h("button", { class: "btn block" }, n ? "Continue ▶" : "Begin lesson 1 ▶");
      b.onclick = function () { location.hash = "#/l/" + nx.id; };
      c.appendChild(b); app.appendChild(c);
    }
    var acc = accuracy();
    var stats = h("div", { class: "card" });
    stats.innerHTML = "<div class='stats'>" +
      "<div class='stat'><b>" + n + "</b><span>lessons done</span></div>" +
      "<div class='stat'><b>🔥 " + liveStreak() + "</b><span>day streak (best " + P.best + ")</span></div>" +
      "<div class='stat'><b>" + (acc === null ? "–" : Math.round(acc * 100) + "%") + "</b><span>quiz accuracy (first try)</span></div>" +
      "<div class='stat'><b>" + formulasLearned() + "</b><span>formulas learned</span></div></div>";
    app.appendChild(stats);
    var list = h("div", { class: "card" });
    list.appendChild(h("h3", null, "Modules"));
    MODULES.forEach(function (m, i) { list.appendChild(moduleRow(m, i)); });
    app.appendChild(list);
  }
  function formulasLearned() {
    var c = 0; LESSONS.forEach(function (l) { if (P.done[l.id]) c += (l.formulas || []).length; }); return c;
  }
  function moduleRow(m, i) {
    var d = moduleDone(m), tot = m.lessons.length;
    var row = h("div", { class: "mod" });
    row.innerHTML = "<div class='ic'>" + m.icon + "</div><div class='t'><b>" + (i + 1) + ". " + m.title + "</b><div class='bar'><i style='width:" + (d / tot * 100) + "%'></i></div></div><div class='muted small'>" + d + "/" + tot + (d === tot ? " ✓" : "") + "</div>";
    row.onclick = function () { location.hash = "#/m/" + m.id; };
    return row;
  }
  function modules() {
    setTab("tMods");
    app.appendChild(header("Modules"));
    var c = h("div", { class: "card" });
    c.appendChild(h("p", { class: "muted small" }, "Go at your own pace: one lesson a day is plenty. Each lesson ends with a short quiz, and you can open any module at any time."));
    MODULES.forEach(function (m, i) { c.appendChild(moduleRow(m, i)); });
    app.appendChild(c);
  }
  function moduleView(id) {
    setTab("tMods");
    var m = MODULES.filter(function (x) { return x.id === id; })[0];
    if (!m) { location.hash = "#/modules"; return; }
    var mi = MODULES.indexOf(m);
    app.appendChild(header("Module " + (mi + 1), "#/modules"));
    var c = h("div", { class: "card" });
    c.innerHTML = "<h2>" + m.icon + " " + m.title + "</h2><p class='muted'>" + m.intro + "</p><div class='bar'><i style='width:" + (moduleDone(m) / m.lessons.length * 100) + "%'></i></div>";
    app.appendChild(c);
    var list = h("div", { class: "card" }), nx = nextLesson();
    m.lessons.forEach(function (l, i) {
      var done = !!P.done[l.id], isNext = nx && nx.id === l.id;
      var row = h("div", { class: "lessonrow" });
      row.innerHTML = "<div class='chk " + (done ? "on" : isNext ? "next" : "") + "'>" + (done ? "✓" : (i + 1)) + "</div><div style='flex:1'><b>" + l.title + "</b>" +
        (l.widget ? " <span class='muted small'>· interactive</span>" : "") + (isNext ? "<div class='small' style='color:var(--accent)'>Up next</div>" : "") + "</div><div class='muted'>›</div>";
      row.onclick = function () { location.hash = "#/l/" + l.id; };
      list.appendChild(row);
    });
    app.appendChild(list);
  }

  function lessonView(id) {
    setTab("tMods");
    var l = BY_ID[id];
    if (!l) { location.hash = "#/"; return; }
    P.last = id; save();
    var m = l.module;
    app.appendChild(header("Module " + (l.mi + 1) + " · Lesson " + (l.li + 1) + "/" + m.lessons.length, "#/m/" + m.id));
    var c = h("div", { class: "card" });
    c.appendChild(h("div", { class: "muted small" }, m.icon + " " + m.title + (P.done[id] ? " · <span class='good'>completed ✓</span>" : "")));
    c.appendChild(h("h2", null, l.title));
    var body = h("div", { class: "body" }, l.body);
    body.querySelectorAll("table").forEach(function (t) { var w = h("div", { class: "scroll" }); t.parentNode.insertBefore(w, t); w.appendChild(t); });
    c.appendChild(body);
    app.appendChild(c);
    math(body);

    if (l.widget) {
      var wd = h("div", { class: "widget" });
      wd.appendChild(h("div", { class: "whead" }, "🧪 Try it yourself"));
      var inner = h("div"); wd.appendChild(inner);
      app.appendChild(wd);
      W.mount(l.widget, inner, l.widgetOpts);
    }
    if (l.formulas && l.formulas.length) {
      var fb = h("div", { class: "card" });
      fb.appendChild(h("h3", null, "∑ Key formulas"));
      var box = h("div", { class: "fbox" });
      l.formulas.forEach(function (f) { box.appendChild(h("div", { class: "fn" }, f.name)); box.appendChild(tex(f.tex, true)); });
      fb.appendChild(box); app.appendChild(fb);
    }
    // quiz
    var qa = P.qa[id] || { first: [], ok: [] };
    P.qa[id] = qa;
    var qc = h("div", { class: "card quiz" });
    qc.appendChild(h("h3", null, "✏️ Check your understanding"));
    var finish = h("button", { class: "btn block" });
    function refreshFinish() {
      var all = l.quiz.every(function (q, i) { return qa.ok[i]; });
      if (P.done[id]) { finish.textContent = "Completed ✓ · review anytime"; finish.disabled = true; }
      else { finish.disabled = !all; finish.textContent = all ? "Complete lesson ✓" : "Answer all questions correctly to complete"; }
    }
    l.quiz.forEach(function (q, qi) {
      qc.appendChild(h("div", { class: "qq" }, (qi + 1) + ". " + q.q));
      var why = h("div", { class: "why" });
      var opts = [];
      q.options.forEach(function (o, oi) {
        var b = h("button", { class: "opt" }, o);
        b.onclick = function () {
          var right = oi === q.a;
          if (qa.first[qi] === undefined || qa.first[qi] === null) qa.first[qi] = right;
          if (right) qa.ok[qi] = true;
          opts.forEach(function (x, k) { x.classList.remove("right", "wrong"); if (k === q.a && right) x.classList.add("right"); });
          b.classList.add(right ? "right" : "wrong");
          why.innerHTML = (right ? "<b class='good'>Correct.</b> " : "<b class='bad'>Not quite. Try another option.</b> ") + (right ? q.why : "");
          why.classList.add("show"); math(why);
          save(); refreshFinish();
        };
        opts.push(b); qc.appendChild(b);
      });
      if (qa.ok[qi]) { opts[q.a].classList.add("right"); why.innerHTML = "<b class='good'>Correct.</b> " + q.why; why.classList.add("show"); }
      qc.appendChild(why);
    });
    finish.onclick = function () { completeLesson(l); };
    refreshFinish();
    qc.appendChild(h("div", { style: "height:10px" }));
    qc.appendChild(finish);
    app.appendChild(qc);
    math(qc);

    var nav = h("div", { class: "navrow" });
    var prev = LESSONS[l.idx - 1], next = LESSONS[l.idx + 1];
    var bp = h("button", { class: "btn ghost" }, "‹ Previous"); bp.disabled = !prev; bp.onclick = function () { location.hash = "#/l/" + prev.id; };
    var bn = h("button", { class: "btn ghost" }, "Next ›"); bn.disabled = !next; bn.onclick = function () { location.hash = "#/l/" + next.id; };
    nav.appendChild(bp); nav.appendChild(bn); app.appendChild(nav);
  }

  function completeLesson(l) {
    var d = today();
    if (!P.done[l.id]) {
      P.done[l.id] = d;
      P.hist[d] = (P.hist[d] || 0) + 1;
      if (P.lastDay !== d) { var g = P.lastDay ? dayDiff(P.lastDay, d) : 99; P.streak = g === 1 ? P.streak + 1 : 1; P.lastDay = d; }
      P.best = Math.max(P.best, P.streak);
      var keys = Object.keys(P.hist).sort(); while (keys.length > 90) delete P.hist[keys.shift()];
      save();
    }
    var n = doneCount(), m = l.module, md = moduleDone(m), next = LESSONS[l.idx + 1];
    var ov = h("div", { class: "overlay" }), sh = h("div", { class: "sheet" });
    var moduleFinished = md === m.lessons.length;
    sh.innerHTML = "<h2>" + (moduleFinished ? "🏅 Module " + (l.mi + 1) + " complete!" : "🎉 Lesson complete!") + "</h2>" +
      "<div class='hero'>" + ring(n / LESSONS.length, 84) + "<div><b>" + n + " / " + LESSONS.length + "</b> lessons done<br><span class='muted small'>Module " + (l.mi + 1) + ": " + md + "/" + m.lessons.length + " · 🔥 " + liveStreak() + "-day streak · today " + todayCount() + "/" + P.goal + "</span></div></div>";
    var chartBox = h("div");
    chartBox.appendChild(W.barChart({ cats: MODULES.map(function (x, i) { return String(i + 1); }), series: [{ name: "Lessons done per module", values: MODULES.map(moduleDone), color: "var(--c3)" }], yMax: 4, height: 170, legend: true, fmt: function (v) { return v ? String(v) : ""; } }));
    sh.appendChild(chartBox);
    var msg = todayCount() >= P.goal ? "You've reached today's goal. Slow and steady: come back tomorrow, or review a lesson." : "One more today will reach your daily goal.";
    sh.appendChild(h("p", { class: "muted small" }, msg));
    var row = h("div", { class: "navrow" });
    var b1 = h("button", { class: "btn ghost" }, "Close"); b1.onclick = function () { document.body.removeChild(ov); render(); };
    row.appendChild(b1);
    if (next) { var b2 = h("button", { class: "btn" }, "Next lesson ›"); b2.onclick = function () { document.body.removeChild(ov); location.hash = "#/l/" + next.id; }; row.appendChild(b2); }
    sh.appendChild(row);
    ov.appendChild(sh); ov.onclick = function (e) { if (e.target === ov) { document.body.removeChild(ov); render(); } };
    document.body.appendChild(ov);
  }

  function formulas() {
    setTab("tForm");
    app.appendChild(header("Formula sheet"));
    var q = h("input", { class: "search", placeholder: "Search formulas (e.g. Nash, Shapley, Cournot)…" });
    app.appendChild(q);
    var wrap = h("div"); app.appendChild(wrap);
    function draw() {
      var term = q.value.trim().toLowerCase();
      wrap.innerHTML = "";
      MODULES.forEach(function (m, i) {
        var items = [];
        m.lessons.forEach(function (l) { (l.formulas || []).forEach(function (f) { if (!term || (f.name + " " + l.title + " " + m.title).toLowerCase().indexOf(term) >= 0) items.push([f, l]); }); });
        if (!items.length) return;
        var c = h("div", { class: "card" });
        c.appendChild(h("h3", null, m.icon + " " + (i + 1) + ". " + m.title));
        items.forEach(function (it) {
          var d = h("div", { class: "fitem" });
          d.appendChild(h("div", { class: "fname" }, it[0].name + " · <a href='#/l/" + it[1].id + "'>" + it[1].title + "</a>" + (P.done[it[1].id] ? " ✓" : "")));
          d.appendChild(tex(it[0].tex, true));
          c.appendChild(d);
        });
        wrap.appendChild(c);
      });
      if (!wrap.children.length) wrap.appendChild(h("p", { class: "muted" }, "No formulas match."));
    }
    q.addEventListener("input", draw);
    draw();
  }

  function progress() {
    setTab("tProg");
    app.appendChild(header("My progress"));
    var n = doneCount(), acc = accuracy();
    var c = h("div", { class: "card hero" });
    c.innerHTML = ring(n / LESSONS.length, 96) + "<div><h2 style='margin:0'>" + n + " / " + LESSONS.length + " lessons</h2><div class='muted small'>" +
      MODULES.filter(function (m) { return moduleDone(m) === m.lessons.length; }).length + " of " + MODULES.length + " modules complete<br>🔥 " + liveStreak() + "-day streak (best " + P.best + ")<br>Quiz accuracy: " + (acc === null ? "–" : Math.round(acc * 100) + "%") + "</div></div>";
    app.appendChild(c);

    var c1 = h("div", { class: "card" });
    c1.appendChild(h("h3", null, "Lessons completed per module"));
    c1.appendChild(W.barChart({ cats: MODULES.map(function (m, i) { return String(i + 1); }), series: [{ name: "Done", values: MODULES.map(moduleDone), color: "var(--c3)" }, { name: "Remaining", values: MODULES.map(function (m) { return m.lessons.length - moduleDone(m); }), color: "var(--chip)" }], yMax: 4, height: 200, labels: false }));
    var key = MODULES.map(function (m, i) { return (i + 1) + " " + m.title; }).join(" · ");
    c1.appendChild(h("div", { class: "muted small" }, key));
    app.appendChild(c1);

    var c2 = h("div", { class: "card" });
    c2.appendChild(h("h3", null, "Activity, last 14 days"));
    var cats = [], vals = [], d = new Date();
    for (var i = 13; i >= 0; i--) {
      var x = new Date(d); x.setDate(d.getDate() - i);
      var k = x.getFullYear() + "-" + pad(x.getMonth() + 1) + "-" + pad(x.getDate());
      cats.push(i === 0 ? "today" : String(x.getDate())); vals.push(P.hist[k] || 0);
    }
    c2.appendChild(W.barChart({ cats: cats, series: [{ name: "Lessons", values: vals, color: "var(--c1)" }], yMax: Math.max(3, Math.max.apply(null, vals) + 1), height: 180, fmt: function (v) { return v ? String(v) : ""; } }));
    app.appendChild(c2);

    var c3 = h("div", { class: "card" });
    c3.appendChild(h("h3", null, "Quiz accuracy by module (first try)"));
    var accs = MODULES.map(function (m) { var a = accuracy(function (l) { return l && l.module === m; }); return a === null ? 0 : Math.round(a * 100); });
    c3.appendChild(W.barChart({ cats: MODULES.map(function (m, i) { return String(i + 1); }), series: [{ name: "% correct", values: accs, color: "var(--c4)" }], yMax: 100, height: 180, fmt: function (v) { return v ? v + "%" : ""; } }));
    app.appendChild(c3);

    var weak = LESSONS.filter(function (l) { var q = P.qa[l.id]; return q && (q.first || []).some(function (x) { return x === false; }); });
    var c4 = h("div", { class: "card" });
    c4.appendChild(h("h3", null, "🔁 Worth reviewing"));
    if (!weak.length) c4.appendChild(h("p", { class: "muted small" }, "Lessons where you missed a question on the first try will appear here."));
    weak.forEach(function (l) {
      var row = h("div", { class: "lessonrow" }, "<div class='chk next'>↺</div><div style='flex:1'><b>" + l.title + "</b><div class='muted small'>Module " + (l.mi + 1) + ": " + l.module.title + "</div></div><div class='muted'>›</div>");
      row.onclick = function () { location.hash = "#/l/" + l.id; };
      c4.appendChild(row);
    });
    app.appendChild(c4);
  }

  function settings() {
    var ov = h("div", { class: "overlay" }), sh = h("div", { class: "sheet" });
    sh.appendChild(h("h2", null, "Settings"));
    function seg(label, options, cur, onPick) {
      var row = h("div", { class: "setrow" }, "<span>" + label + "</span>");
      var sg = h("div", { class: "seg" });
      options.forEach(function (o) {
        var b = h("button", { class: o[0] === cur ? "on" : "" }, o[1]);
        b.onclick = function () { onPick(o[0]); sg.querySelectorAll("button").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); };
        sg.appendChild(b);
      });
      row.appendChild(sg); sh.appendChild(row);
    }
    seg("Daily goal", [[1, "1"], [2, "2"], [3, "3"]], P.goal, function (v) { P.goal = v; save(); });
    seg("Text size", [[false, "Normal"], [true, "Large"]], !!P.large, function (v) { P.large = v; save(); document.documentElement.classList.toggle("large", v); });
    var rr = h("div", { class: "setrow" }, "<span>Reset all progress</span>");
    var rb = h("button", { class: "btn ghost small" }, "Reset"), armed = false;
    rb.onclick = function () {
      if (!armed) { armed = true; rb.textContent = "Tap again to confirm"; setTimeout(function () { armed = false; rb.textContent = "Reset"; }, 3000); return; }
      var keep = { goal: P.goal, large: P.large };
      P = { done: {}, qa: {}, hist: {}, streak: 0, best: 0, lastDay: "", last: "", goal: keep.goal, large: keep.large };
      save(); document.body.removeChild(ov); render();
    };
    rr.appendChild(rb); sh.appendChild(rr);
    sh.appendChild(h("p", { class: "muted small" }, (window.APP_TITLE || "Optimal &amp; MPC Steps") + " · " + MODULES.length + " modules, " + LESSONS.length + " lessons. Progress is saved on this device. Formulas rendered with KaTeX (MIT licence)."));
    var close = h("button", { class: "btn block" }, "Done"); close.onclick = function () { document.body.removeChild(ov); render(); };
    sh.appendChild(close);
    ov.appendChild(sh); ov.onclick = function (e) { if (e.target === ov) { document.body.removeChild(ov); render(); } };
    document.body.appendChild(ov);
  }

  // ---------------- router ----------------
  function render() {
    app.innerHTML = "";
    var hs = location.hash || "#/";
    var parts = hs.slice(2).split("/");
    if (parts[0] === "modules") modules();
    else if (parts[0] === "m") moduleView(parts[1]);
    else if (parts[0] === "l") lessonView(parts[1]);
    else if (parts[0] === "formulas") formulas();
    else if (parts[0] === "progress") progress();
    else home();
  }
  window.addEventListener("hashchange", function () { render(); window.scrollTo(0, 0); });
  render();
})();
