  // ================= Optimal & MPC widgets =================
  function logSlider(label, lo, hi, val, onInput) {
    // slider over log10 range, shows the real value
    var wrap = slider(label, Math.log10(lo), Math.log10(hi), 0.01, Math.log10(val), function (v) { out(); onInput(Math.pow(10, v)); });
    var b = wrap.querySelector("b"), inp = wrap.querySelector("input");
    function out() { b.textContent = fmt(Math.pow(10, +inp.value), 3); }
    out();
    return wrap;
  }

  // ---------- gradient descent on a quadratic ----------
  function quad(el) {
    var kappa = 8, alpha = 0.2, newton = false;
    var box = h("div"), info = h("div", { class: "winfo" });
    var sk = slider("Valley elongation κ = λmax/λmin", 1, 20, 0.5, kappa, function (v) { kappa = v; draw(); });
    var sa = slider("Step size α", 0.01, 0.35, 0.005, alpha, function (v) { alpha = v; draw(); });
    var bn = h("button", { class: "btn small ghost" }, "Use Newton's method");
    bn.onclick = function () { newton = !newton; bn.textContent = newton ? "Use gradient descent" : "Use Newton's method"; draw(); };
    el.appendChild(box); el.appendChild(sk); el.appendChild(sa); el.appendChild(bn); el.appendChild(info);
    function draw() {
      // J = 1/2 (z1^2 + kappa z2^2), rotated 30 degrees
      var th = Math.PI / 6, c = Math.cos(th), sn = Math.sin(th);
      function grad(z) { var a = c * z[0] + sn * z[1], b = -sn * z[0] + c * z[1]; var ga = a, gb = kappa * b; return [c * ga - sn * gb, sn * ga + c * gb]; }
      function J(z) { var a = c * z[0] + sn * z[1], b = -sn * z[0] + c * z[1]; return 0.5 * (a * a + kappa * b * b); }
      var z = [-4, 2.5], path = [z.slice()], it = 0, blew = false;
      for (; it < 200; it++) {
        if (J(z) < 1e-6) break;
        if (newton) { var a = c * z[0] + sn * z[1], b = -sn * z[0] + c * z[1]; z = [0, 0]; path.push(z.slice()); it++; break; }
        var g = grad(z); z = [z[0] - alpha * g[0], z[1] - alpha * g[1]]; path.push(z.slice());
        if (Math.abs(z[0]) > 50 || Math.abs(z[1]) > 50) { blew = true; break; }
      }
      var pl = canvasPlot({ xMin: -5, xMax: 5, yMin: -3.5, yMax: 3.5, xLabel: "z₁", yLabel: "z₂", h: 260 });
      var ctx = pl.ctx;
      ctx.strokeStyle = css("--line"); ctx.lineWidth = 1;
      [0.5, 2, 5, 10, 20, 40].forEach(function (lev) {
        ctx.beginPath();
        for (var k = 0; k <= 100; k++) {
          var t = 2 * Math.PI * k / 100, A = Math.sqrt(2 * lev) * Math.cos(t), B = Math.sqrt(2 * lev / kappa) * Math.sin(t);
          var x = c * A - sn * B, y = sn * A + c * B;
          if (k) ctx.lineTo(pl.X(x), pl.Y(y)); else ctx.moveTo(pl.X(x), pl.Y(y));
        }
        ctx.stroke();
      });
      ctx.strokeStyle = css("--c2"); ctx.fillStyle = css("--c2"); ctx.lineWidth = 1.8; ctx.beginPath();
      path.forEach(function (p, i) { var X = pl.X(Math.max(-6, Math.min(6, p[0]))), Y = pl.Y(Math.max(-4, Math.min(4, p[1]))); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
      ctx.stroke();
      path.forEach(function (p) { ctx.beginPath(); ctx.arc(pl.X(p[0]), pl.Y(p[1]), 2.5, 0, 7); ctx.fill(); });
      ctx.fillStyle = css("--c3"); ctx.beginPath(); ctx.arc(pl.X(0), pl.Y(0), 5, 0, 7); ctx.fill();
      box.innerHTML = ""; box.appendChild(pl.wrap);
      var lim = 2 / kappa;
      info.innerHTML = newton ? "Newton's method jumps straight to the minimum in <b>one step</b> on a quadratic cost." :
        (blew ? "<b class='bad'>Diverged!</b> α = " + fmt(alpha, 3) + " exceeds 2/λmax = " + fmt(lim, 3) + "." :
          (it >= 200 ? "Still not converged after 200 steps: the valley is too narrow for this step size." : "Converged in <b>" + it + " steps</b>.") + " Stability limit α &lt; 2/λmax = " + fmt(lim, 3) + "; best fixed step ≈ 2/(λmax+λmin) = " + fmt(2 / (kappa + 1), 3) + ".");
    }
    draw();
  }

  // ---------- scalar Riccati recursion ----------
  function riccati(el) {
    var a = 1.2, b = 1, q = 1, r = 1, N = 30;
    var b1 = h("div"), b2 = h("div"), info = h("div", { class: "winfo" });
    var sa = slider("System a", 0.5, 2, 0.05, a, function (v) { a = v; draw(); });
    var sq = logSlider("State weight q", 0.01, 100, q, function (v) { q = v; draw(); });
    var sr = logSlider("Input weight r", 0.01, 100, r, function (v) { r = v; draw(); });
    var sn = slider("Horizon N", 5, 60, 1, N, function (v) { N = v; draw(); });
    el.appendChild(b1); el.appendChild(b2); el.appendChild(sa); el.appendChild(sq); el.appendChild(sr); el.appendChild(sn); el.appendChild(info);
    function draw() {
      var P = q, Ks = new Array(N), Ps = [];
      for (var k = N - 1; k >= 0; k--) {
        var K = a * b * P / (r + b * b * P);
        Ks[k] = K; Ps.push([k, P]);
        P = q + a * a * P - (a * b * P) * (a * b * P) / (r + b * b * P);
      }
      var kp = Ks.map(function (K, k) { return [k, K]; });
      var x = 1, xo = 1, xs = [[0, 1]], xos = [[0, 1]];
      for (k = 0; k < N; k++) { x = a * x - b * Ks[k] * x; xo = a * xo; xs.push([k + 1, x]); xos.push([k + 1, xo]); }
      b1.innerHTML = ""; b2.innerHTML = "";
      b1.appendChild(lineChart({ xMin: 0, xMax: N - 1, xLabel: "Time step k", yLabel: "Gain K_k", series: [{ name: "Optimal gain K_k (computed backward)", pts: kp, color: "var(--c1)" }] }));
      b2.appendChild(lineChart({ xMin: 0, xMax: N, xLabel: "Time step k", yLabel: "State x_k", yMin: Math.min(-0.2, Math.min.apply(null, xs.map(function (p) { return p[1]; }))), yMax: Math.min(5, Math.max(1.2, xos[Math.min(N, 8)][1])),
        series: [{ name: "With LQR feedback", pts: xs, color: "var(--c3)" }, { name: "No control", pts: xos, color: "var(--c2)", dash: "4 3" }] }));
      var Kss = Ks[0], pole = a - b * Kss;
      info.innerHTML = "Steady-state gain K ≈ <b>" + fmt(Kss, 4) + "</b>, P ≈ " + fmt(Ps[Ps.length - 1][1], 4) + ", closed-loop pole a − bK ≈ <b>" + fmt(pole, 4) + "</b> (" + (Math.abs(pole) < 1 ? "<span class='good'>stable</span>" : "<span class='bad'>unstable</span>") + "). The gain is constant except near the end of the horizon.";
    }
    draw();
  }

  // ---------- LQR double integrator ----------
  function lqr(el) {
    var q1 = 1, q2 = 0.01, r = 1;
    var b1 = h("div"), b2 = h("div"), info = h("div", { class: "winfo" });
    var s1 = logSlider("Position weight q₁", 0.01, 100, q1, function (v) { q1 = v; draw(); });
    var s2 = logSlider("Velocity weight q₂", 0.01, 100, q2, function (v) { q2 = v; draw(); });
    var s3 = logSlider("Input weight r", 0.01, 100, r, function (v) { r = v; draw(); });
    el.appendChild(b1); el.appendChild(b2); el.appendChild(s1); el.appendChild(s2); el.appendChild(s3); el.appendChild(info);
    function draw() {
      var k1 = Math.sqrt(q1 / r), k2 = Math.sqrt(q2 / r + 2 * k1);
      var f = function (s) { var u = -(k1 * s[0] + k2 * s[1]); return [s[1], u]; };
      var s = [1, 0], T = 10, dt = 0.01, ps = [], vs = [], us = [], J = 0;
      for (var i = 0; i <= T / dt; i++) {
        var u = -(k1 * s[0] + k2 * s[1]);
        if (i % 5 === 0) { ps.push([i * dt, s[0]]); vs.push([i * dt, s[1]]); us.push([i * dt, u]); }
        J += (q1 * s[0] * s[0] + q2 * s[1] * s[1] + r * u * u) * dt;
        s = rk4(f, s, dt);
      }
      b1.innerHTML = ""; b2.innerHTML = "";
      b1.appendChild(lineChart({ xMin: 0, xMax: T, xLabel: "Time (s)", yLabel: "State", series: [{ name: "Position y", pts: ps, color: "var(--c1)" }, { name: "Velocity ẏ", pts: vs, color: "var(--c3)", dash: "4 3" }] }));
      b2.appendChild(lineChart({ xMin: 0, xMax: T, xLabel: "Time (s)", yLabel: "Input u", series: [{ name: "Control u = −Kx", pts: us, color: "var(--c2)" }] }));
      var wn = Math.sqrt(k1), z = k2 / (2 * wn);
      var poles = z < 1 ? fmt(-z * wn, 3) + " ± " + fmt(wn * Math.sqrt(1 - z * z), 3) + "j" : fmt(-z * wn + wn * Math.sqrt(z * z - 1), 3) + ", " + fmt(-z * wn - wn * Math.sqrt(z * z - 1), 3);
      info.innerHTML = "K = [<b>" + fmt(k1, 3) + "</b>, <b>" + fmt(k2, 3) + "</b>]. Closed-loop poles: " + poles + " (ω<sub>n</sub> = " + fmt(wn, 3) + ", ζ = " + fmt(z, 3) + "). Peak input |u| = " + fmt(k1, 3) + ", cost J ≈ " + fmt(J, 3) + ".";
    }
    draw();
  }

  // ---------- minimum-time bang-bang ----------
  function mintime(el) {
    var x10 = 3, x20 = 0;
    var box = h("div"), b2 = h("div"), info = h("div", { class: "winfo" });
    var s1 = slider("Starting position x₁", -5, 5, 0.1, x10, function (v) { x10 = v; draw(); });
    var s2 = slider("Starting velocity x₂", -3, 3, 0.1, x20, function (v) { x20 = v; draw(); });
    el.appendChild(box); el.appendChild(b2); el.appendChild(s1); el.appendChild(s2); el.appendChild(info);
    function draw() {
      var x1 = x10, x2 = x20, dt = 0.002, t = 0, path = [[x1, x2]], us = [], sw = 0, last = 0;
      while (t < 30 && (Math.abs(x1) > 0.003 || Math.abs(x2) > 0.01)) {
        var s = x1 + 0.5 * x2 * Math.abs(x2), u = s > 1e-9 ? -1 : s < -1e-9 ? 1 : (x2 > 0 ? -1 : 1);
        if (last && u !== last) sw++;
        last = u;
        x1 += x2 * dt + 0.5 * u * dt * dt; x2 += u * dt; t += dt;
        if (Math.round(t / dt) % 10 === 0) { path.push([x1, x2]); us.push([t, u]); }
      }
      var pl = canvasPlot({ xMin: -6, xMax: 6, yMin: -3.5, yMax: 3.5, xLabel: "Position x₁", yLabel: "Velocity x₂", h: 260 });
      var ctx = pl.ctx;
      ctx.strokeStyle = css("--c4"); ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath();
      for (var k = 0; k <= 100; k++) { var v = -3.5 + 7 * k / 100, xx = -0.5 * v * Math.abs(v); if (k) ctx.lineTo(pl.X(xx), pl.Y(v)); else ctx.moveTo(pl.X(xx), pl.Y(v)); }
      ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = css("--c1"); ctx.lineWidth = 2.2; ctx.beginPath();
      path.forEach(function (p, i) { if (i) ctx.lineTo(pl.X(p[0]), pl.Y(p[1])); else ctx.moveTo(pl.X(p[0]), pl.Y(p[1])); });
      ctx.stroke();
      ctx.fillStyle = css("--c2"); ctx.beginPath(); ctx.arc(pl.X(x10), pl.Y(x20), 5, 0, 7); ctx.fill();
      ctx.fillStyle = css("--c3"); ctx.beginPath(); ctx.arc(pl.X(0), pl.Y(0), 5, 0, 7); ctx.fill();
      box.innerHTML = ""; box.appendChild(pl.wrap);
      box.appendChild(h("div", { class: "legend" }, '<span><i style="background:var(--c4)"></i>Switching curve x₁ = −½x₂|x₂|</span><span><i style="background:var(--c1)"></i>Optimal path</span>'));
      b2.innerHTML = "";
      b2.appendChild(lineChart({ xMin: 0, xMax: Math.max(t, 0.5), yMin: -1.3, yMax: 1.3, xLabel: "Time (s)", yLabel: "u", series: [{ name: "Bang-bang input", pts: us.length ? us : [[0, 0]], color: "var(--c2)" }] }));
      info.innerHTML = "Minimum time to reach rest at the origin: <b>" + fmt(t, 3) + " s</b> with " + sw + " switch" + (sw === 1 ? "" : "es") + "." + (x20 === 0 ? " Check: 2√|x₁| = " + fmt(2 * Math.sqrt(Math.abs(x10)), 3) + " s." : "");
    }
    draw();
  }

  // ---------- MPC with input constraints ----------
  function mpc(el, o) {
    var N = 15, Rw = 0.001, umax = o.umax || 5, plant = o.compare ? "osc" : "first";
    var b1 = h("div"), b2 = h("div"), info = h("div", { class: "winfo" });
    var sel = h("select", { class: "sel" });
    [["first", "First-order plant x⁺ = 0.9x + 0.1u"], ["osc", "Oscillatory 2nd-order plant (ζ = 0.2)"]].forEach(function (p) { var op = h("option", { value: p[0] }, p[1]); if (p[0] === plant) op.selected = true; sel.appendChild(op); });
    sel.onchange = function () { plant = sel.value; draw(); };
    var sN = slider("Horizon N (steps)", 2, 40, 1, N, function (v) { N = v; draw(); });
    var sR = logSlider("Input weight R", 0.0001, 1, Rw, function (v) { Rw = v; draw(); });
    var sU = slider("Rate limit |Δu| ≤ (per sample)", 0.05, 5, 0.05, umax, function (v) { umax = v; draw(); });
    el.appendChild(sel); el.appendChild(b1); el.appendChild(b2); el.appendChild(sN); el.appendChild(sR); el.appendChild(sU); el.appendChild(info);
    function model() {
      if (plant === "first") return { A: [[0.9]], B: [0.1], C: [1], uss: 1 };
      var T = 0.2, wn = 1, z = 0.2;
      return { A: [[1, T], [-wn * wn * T, 1 - 2 * z * wn * T]], B: [0, T], C: [1, 0], uss: wn * wn };
    }
    function mv(A, x) { return A.map(function (row) { return row.reduce(function (s, a, j) { return s + a * x[j]; }, 0); }); }
    function dot(a, b) { return a.reduce(function (s, v, i) { return s + v * b[i]; }, 0); }
    function build(m) {
      // y_{k+i} = C A^i x + sum_{j<i} C A^{i-1-j} B u_j,  i=1..N
      var n = m.B.length, Phi = [], G = [], Ap = [], CAj = [];
      var Ai = m.A.map(function (r, i) { return r.map(function (_, j) { return i === j ? 1 : 0; }); });
      var Bpow = [m.B.slice()];
      for (var i = 1; i < N; i++) Bpow.push(mv(m.A, Bpow[i - 1]));
      var CAB = Bpow.map(function (v) { return dot(m.C, v); }); // C A^p B
      for (i = 1; i <= N; i++) {
        var row = []; for (var j = 0; j < N; j++) row.push(j < i ? CAB[i - 1 - j] : 0);
        G.push(row);
      }
      return { G: G, CAB: CAB };
    }
    function solve(m, Gm, x, ref, lim, uprev) {
      // decision variables: input moves du_j; u_{k+j} = uprev + sum_{i<=j} du_i
      var free = [], xx = x.slice();
      for (var i = 1; i <= N; i++) { xx = mv(m.A, xx); free.push(dot(m.C, xx)); }
      var GT = Gm.map(function (row) { var o = []; for (var j = 0; j < N; j++) { var s = 0; for (var q = j; q < N; q++) s += row[q]; o.push(s); } return o; });
      var g1 = Gm.map(function (row) { return row.reduce(function (s, v) { return s + v; }, 0); });
      var e = free.map(function (f, i) { return f + g1[i] * uprev - ref; });
      var H = [], g = [], du0 = uprev - m.uss * ref;
      for (i = 0; i < N; i++) {
        H.push([]);
        for (var j = 0; j < N; j++) {
          var s = 0; for (var k = 0; k < N; k++) s += GT[k][i] * GT[k][j];
          var tt = N - Math.max(i, j); // (T'T)_{ij}
          H[i].push(2 * (s + Rw * tt));
        }
        var t = 0; for (k = 0; k < N; k++) t += GT[k][i] * e[k];
        g.push(2 * t + 2 * Rw * (N - i) * du0);
      }
      var v = new Array(N).fill(1), L = 1;
      for (var it = 0; it < 30; it++) { var w = mv(H, v), nw = Math.sqrt(dot(w, w)); L = nw / Math.sqrt(dot(v, v)); v = w.map(function (q) { return q / nw; }); }
      var U = new Array(N).fill(0), Y = U.slice(), tk = 1;
      for (it = 0; it < 600; it++) {
        var grad = mv(H, Y).map(function (q, i) { return q + g[i]; });
        var Un = Y.map(function (y, i) { var z = y - grad[i] / L; return lim ? Math.max(-lim, Math.min(lim, z)) : z; });
        var tn = (1 + Math.sqrt(1 + 4 * tk * tk)) / 2;
        Y = Un.map(function (u, i) { return u + (tk - 1) / tn * (u - U[i]); });
        U = Un; tk = tn;
      }
      return U[0];
    }
    function run(m, Gm, constrained) {
      var x = m.B.map(function () { return 0; }), ys = [], us = [], steps = 60, over = 0, u = 0;
      for (var k = 0; k < steps; k++) {
        var ref = k >= 5 ? 1 : 0;
        var du = solve(m, Gm, x, ref, constrained ? umax : 0, u);
        if (!constrained) du = Math.max(-umax, Math.min(umax, du));
        u += du;
        ys.push([k, dot(m.C, x)]); us.push([k, u]);
        x = mv(m.A, x).map(function (v, i) { return v + m.B[i] * u; });
        over = Math.max(over, dot(m.C, x));
      }
      return { ys: ys, us: us, over: over };
    }
    function draw() {
      var m = model(), Gm = build(m).G;
      var A = run(m, Gm, true), Bc = run(m, Gm, false);
      var refs = [[0, 0], [4.999, 0], [5, 1], [59, 1]];
      b1.innerHTML = ""; b2.innerHTML = "";
      b1.appendChild(lineChart({ xMin: 0, xMax: 59, xLabel: "Sample k", yLabel: "Output y", series: [{ name: "Setpoint", pts: refs, color: "var(--muted)", width: 1.2, dash: "3 3" }, { name: "Constrained MPC", pts: A.ys, color: "var(--c1)" }, { name: "Unconstrained MPC, rate-limited afterwards", pts: Bc.ys, color: "var(--c2)", dash: "5 3" }] }));
      b2.appendChild(lineChart({ xMin: 0, xMax: 59, xLabel: "Sample k", yLabel: "Input u", series: [{ name: "Constrained MPC", pts: A.us, color: "var(--c1)" }, { name: "Rate-limited afterwards", pts: Bc.us, color: "var(--c2)", dash: "5 3" }] }));
      info.innerHTML = "Peak output: constrained MPC <b>" + fmt(A.over, 3) + "</b>, rate-limited afterwards <b>" + fmt(Bc.over, 3) + "</b> (setpoint 1). Input may change by at most ±" + fmt(umax, 2) + " per sample. MPC plans its moves knowing this limit; the clipped controller only finds out afterwards. A QP is solved at every one of the 60 samples.";
    }
    draw();
  }

  var REG = { quad: quad, riccati: riccati, lqr: lqr, mintime: mintime, mpc: mpc };
