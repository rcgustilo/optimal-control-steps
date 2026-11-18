/* Optimal & MPC Steps — lesson content. */
var R = String.raw;
var APP_TITLE = "Optimal & MPC Steps", APP_KEY = "optSteps.v1", APP_LOGO = "J*";
var MODULES = [];

MODULES.push({ id: "m1", title: "Optimization Basics", icon: "📐",
  intro: "The mathematics of choosing the best: cost functions, quadratic forms and finding minima.",
  lessons: [
    { id: "m1l1", title: "What is optimal control?",
      body: R`<p>Classical control asks “is it stable and fast enough?”. <b>Optimal control</b> asks “what is the <b>best</b> input, according to a cost I choose?”.</p>
<p>The general problem: choose the input $u(t)$ that minimizes</p>
$$J = \phi\big(x(T)\big) + \int_0^T L\big(x(t),u(t),t\big)\,dt$$
<p>subject to the system dynamics $\dot x = f(x,u,t)$ and any constraints on $x$ and $u$.</p>
<table class="tbl"><tr><th>Goal</th><th>Cost J</th><th>Example</th></tr>
<tr><td>Minimum time</td><td>$\int_0^T 1\,dt = T$</td><td>Move a robot arm as fast as possible</td></tr>
<tr><td>Minimum energy</td><td>$\int u^2\,dt$</td><td>Battery-powered drone</td></tr>
<tr><td>Minimum fuel</td><td>$\int |u|\,dt$</td><td>Spacecraft thrusters</td></tr>
<tr><td>Regulation</td><td>$\int (x^\top Q x + u^\top R u)\,dt$</td><td>Hold a temperature, balance a pendulum</td></tr>
<tr><td>Tracking</td><td>$\int (y-r)^2 + \rho u^2\,dt$</td><td>Follow a speed profile</td></tr></table>
<p>Two families of methods: <b>analytic</b> (LQR, Pontryagin) and <b>online numerical</b> (Model Predictive Control, which re-solves an optimization every sample).</p>`,
      formulas: [{ name: "Optimal control problem", tex: R`\min_{u}\ J=\phi(x(T))+\int_0^T L(x,u,t)\,dt\ \ \text{s.t.}\ \dot x=f(x,u,t)` }],
      quiz: [
        { q: R`Which cost gives minimum-fuel control?`, options: [R`$\int u^2 dt$`, R`$\int |u|\,dt$`, R`$T$`, R`$x(T)^2$`], a: 1, why: "Fuel use is proportional to thrust magnitude |u|." },
        { q: "MPC differs from LQR mainly because it…", options: ["Uses no model", "Re-solves an optimization online at every sample", "Ignores the cost", "Works only for nonlinear systems"], a: 1, why: "MPC optimizes repeatedly in real time, which also lets it handle constraints." }
      ] },
    { id: "m1l2", title: "Quadratic costs and definiteness",
      body: R`<p>Most practical costs are <b>quadratic</b>: $x^\top Q x$, where $Q$ is a symmetric matrix. For $x = (x_1, x_2)$ and $Q = \begin{pmatrix} q_{11} & q_{12}\\ q_{12} & q_{22}\end{pmatrix}$:</p>
$$x^\top Q x = q_{11}x_1^2 + 2q_{12}x_1x_2 + q_{22}x_2^2$$
<p>The cost must never reward large states, so we require:</p>
<table class="tbl"><tr><th>Property</th><th>Meaning</th><th>Test</th></tr>
<tr><td>Positive definite $Q \succ 0$</td><td>$x^\top Qx > 0$ for all $x \ne 0$</td><td>All eigenvalues &gt; 0</td></tr>
<tr><td>Positive semidefinite $Q \succeq 0$</td><td>$x^\top Qx \ge 0$</td><td>All eigenvalues ≥ 0</td></tr></table>
<p><b>Sylvester's test (2×2):</b> $Q \succ 0$ iff $q_{11} > 0$ and $\det Q = q_{11}q_{22} - q_{12}^2 > 0$.</p>
<p><b>Example:</b> $Q=\begin{pmatrix}2&1\\1&3\end{pmatrix}$: $2>0$ and $6-1=5>0$, so positive definite.</p>
<p>In LQR and MPC, we need $Q \succeq 0$ (states may be ignored) and $R \succ 0$ (every input must cost something, otherwise the optimum could demand infinite input).</p>`,
      formulas: [{ name: "Quadratic form", tex: R`x^\top Qx=\sum_{i,j}q_{ij}x_ix_j` }, { name: "Sylvester (2×2)", tex: R`q_{11}>0,\ \ q_{11}q_{22}-q_{12}^2>0` }],
      quiz: [
        { q: R`Is $\begin{pmatrix}1&2\\2&1\end{pmatrix}$ positive definite?`, options: ["Yes", "No: its determinant is −3"], a: 1, why: R`$1\cdot1-4=-3<0$.` },
        { q: "Why must R be positive definite in LQR?", options: ["To make the system stable", "So every input has a cost and the optimum is finite", "To speed up computation", "It need not be"], a: 1, why: "With a free input, the optimum might demand infinite control." }
      ] },
    { id: "m1l3", title: "Finding the minimum",
      body: R`<p>For a smooth function $J(z)$, a minimum satisfies the <b>first-order condition</b> (gradient zero) and the <b>second-order condition</b> (Hessian positive definite):</p>
$$\nabla J(z^*) = 0,\qquad \nabla^2 J(z^*) \succ 0$$
<p>A function is <b>convex</b> if its Hessian is positive semidefinite everywhere. For convex functions, any local minimum is the global minimum, which is why we like to formulate control problems as convex ones.</p>
<p><b>Least squares</b> is the classic convex problem. Minimize $J = \|Az-b\|^2$:</p>
$$\nabla J = 2A^\top(Az-b) = 0 \ \Rightarrow\ z^* = (A^\top A)^{-1}A^\top b$$
<p><b>Quadratic case:</b> $J = \tfrac12 z^\top H z + f^\top z$ with $H \succ 0$ has the unique minimizer</p>
$$z^* = -H^{-1}f$$
<p>Unconstrained MPC (Module 6) is exactly this formula.</p>`,
      formulas: [{ name: "Optimality conditions", tex: R`\nabla J(z^*)=0,\ \ \nabla^2J(z^*)\succ0` }, { name: "Least squares", tex: R`z^*=(A^\top A)^{-1}A^\top b` }, { name: "Quadratic minimizer", tex: R`z^*=-H^{-1}f` }],
      quiz: [
        { q: R`Minimize $J=\tfrac12\cdot 4z^2 - 8z$. What is $z^*$?`, options: ["1", "2", "4", "8"], a: 1, why: R`$z^*=-H^{-1}f = -(4)^{-1}(-8) = 2$.` },
        { q: "Why are convex problems preferred?", options: ["They have no solution", "Any local minimum is global", "They are always linear", "They need no computer"], a: 1, why: "Solvers can find the global optimum reliably." }
      ] },
    { id: "m1l4", title: "Gradient descent and Newton's method",
      body: R`<p>Numerical methods walk downhill. <b>Gradient descent</b>:</p>
$$z_{k+1} = z_k - \alpha\,\nabla J(z_k)$$
<p>For a quadratic cost with Hessian $H$, it converges if the step size satisfies</p>
$$0 < \alpha < \frac{2}{\lambda_{\max}(H)}$$
<p>and the speed depends on the <b>condition number</b> $\kappa = \lambda_{\max}/\lambda_{\min}$: long, narrow valleys (large κ) cause zig-zagging.</p>
<p><b>Newton's method</b> uses curvature too:</p>
$$z_{k+1} = z_k - \big(\nabla^2 J(z_k)\big)^{-1}\nabla J(z_k)$$
<p>On a quadratic it reaches the minimum in <b>one step</b>; near any smooth minimum it converges quadratically (the number of correct digits roughly doubles each step).</p>
<p>In the explorer, change the step size and the valley's elongation. Watch descent zig-zag, converge or blow up.</p>`,
      widget: "quad", widgetOpts: {},
      formulas: [{ name: "Gradient descent", tex: R`z_{k+1}=z_k-\alpha\nabla J(z_k)` }, { name: "Convergence (quadratic)", tex: R`0<\alpha<2/\lambda_{\max}(H)` }, { name: "Newton step", tex: R`z_{k+1}=z_k-(\nabla^2J)^{-1}\nabla J` }],
      quiz: [
        { q: R`If $\lambda_{\max}(H)=10$, gradient descent converges for α below…`, options: ["0.1", "0.2", "2", "10"], a: 1, why: R`$2/10 = 0.2$.` },
        { q: "On a quadratic cost, Newton's method converges in…", options: ["One step", "Ten steps", "Never", "κ steps"], a: 0, why: "The quadratic model is exact, so one Newton step lands on the minimum." }
      ] }
  ] });

MODULES.push({ id: "m2", title: "Constrained Optimization", icon: "🚧",
  intro: "Real systems have limits. Lagrange multipliers, KKT conditions and quadratic programs.",
  lessons: [
    { id: "m2l1", title: "Lagrange multipliers",
      body: R`<p>To minimize $J(z)$ subject to equality constraints $g(z) = 0$, form the <b>Lagrangian</b></p>
$$\mathcal L(z,\lambda) = J(z) + \lambda^\top g(z)$$
<p>and set all its derivatives to zero: $\nabla_z \mathcal L = 0$, $g(z)=0$.</p>
<p><b>Example:</b> minimize $x^2 + y^2$ subject to $x + y = 1$.</p>
$$\mathcal L = x^2+y^2+\lambda(x+y-1)$$
$$2x+\lambda=0,\quad 2y+\lambda=0,\quad x+y=1 \ \Rightarrow\ x=y=\tfrac12,\ \lambda=-1$$
<p>The multiplier has a meaning: $|\lambda|$ is the <b>sensitivity</b> of the optimal cost to the constraint. Relaxing the constraint to $x+y = 1+\varepsilon$ changes the optimal cost by about $-\lambda\varepsilon = \varepsilon$. In economics, multipliers are “shadow prices”.</p>
<p>In optimal control, the multiplier becomes a function of time, the <b>costate</b> $\lambda(t)$ (Module 5).</p>`,
      formulas: [{ name: "Lagrangian", tex: R`\mathcal L(z,\lambda)=J(z)+\lambda^\top g(z)` }, { name: "Stationarity", tex: R`\nabla_z\mathcal L=0,\ \ g(z)=0` }],
      quiz: [
        { q: "Minimize x² + y² subject to x + y = 2. The solution is…", options: ["(2, 0)", "(1, 1)", "(0, 2)", "(0.5, 1.5)"], a: 1, why: "By symmetry, and from the Lagrange conditions: x = y = 1." },
        { q: "A Lagrange multiplier measures…", options: ["The step size", "The sensitivity of the optimal cost to the constraint", "The number of constraints", "Convexity"], a: 1, why: "It is the “shadow price” of the constraint." }
      ] },
    { id: "m2l2", title: "Inequality constraints: KKT",
      body: R`<p>For $\min J(z)$ subject to $h(z) \le 0$, the <b>Karush–Kuhn–Tucker (KKT)</b> conditions at the optimum are:</p>
<table class="tbl"><tr><th>Condition</th><th>Formula</th><th>Meaning</th></tr>
<tr><td>Stationarity</td><td>$\nabla J + \sum_i \mu_i \nabla h_i = 0$</td><td>Forces balance</td></tr>
<tr><td>Primal feasibility</td><td>$h_i(z) \le 0$</td><td>Constraints satisfied</td></tr>
<tr><td>Dual feasibility</td><td>$\mu_i \ge 0$</td><td>Constraints can only push, not pull</td></tr>
<tr><td>Complementary slackness</td><td>$\mu_i\,h_i(z) = 0$</td><td>Either the constraint is active, or its multiplier is 0</td></tr></table>
<p><b>Example:</b> minimize $(u-3)^2$ subject to $u \le 2$ (an actuator limit). Without the limit, $u = 3$. With it, the constraint is <b>active</b>: $u^* = 2$, and stationarity gives $2(2-3) + \mu = 0$, so $\mu = 2 \ge 0$ ✓.</p>
<p>For convex problems, KKT conditions are both necessary and sufficient.</p>`,
      formulas: [{ name: "KKT stationarity", tex: R`\nabla J+\sum_i\mu_i\nabla h_i=0` }, { name: "Complementary slackness", tex: R`\mu_i\,h_i(z)=0,\ \ \mu_i\ge0` }],
      quiz: [
        { q: "If a constraint is not active at the optimum (h < 0), its multiplier μ is…", options: ["Positive", "Zero", "Negative", "Infinite"], a: 1, why: "Complementary slackness: μ·h = 0." },
        { q: "Minimize (u − 1)² subject to u ≤ 2. The optimum is…", options: ["u = 1 (constraint inactive)", "u = 2", "u = 0", "No solution"], a: 0, why: "The unconstrained optimum u = 1 already satisfies u ≤ 2." }
      ] },
    { id: "m2l3", title: "Quadratic programming",
      body: R`<p>A <b>quadratic program (QP)</b> has a quadratic cost and linear constraints:</p>
$$\min_z\ \tfrac12 z^\top H z + f^\top z \quad \text{s.t.}\quad A z \le b,\ \ A_{eq}z = b_{eq}$$
<p>If $H \succeq 0$ the QP is convex and efficiently solvable. <b>Linear MPC solves one QP every sample</b>, so QP solvers are the engine of MPC.</p>
<table class="tbl"><tr><th>Method</th><th>Idea</th><th>Typical use</th></tr>
<tr><td>Active set</td><td>Guess which constraints are active, solve the equality problem, update the guess</td><td>Small, warm-started MPC (qpOASES)</td></tr>
<tr><td>Interior point</td><td>Follow a smooth path inside the feasible region using barrier functions</td><td>Large problems</td></tr>
<tr><td>ADMM / first-order</td><td>Cheap iterations, splitting</td><td>Embedded MPC (OSQP)</td></tr>
<tr><td>Projected gradient</td><td>Gradient step, then clip to the box</td><td>Simple box constraints, used in this app</td></tr></table>
<p>For box constraints $u_{\min} \le u \le u_{\max}$, the projection is simply clipping:</p>
$$z_{k+1} = \operatorname{clip}\big(z_k - \alpha(Hz_k+f),\ u_{\min},\ u_{\max}\big)$$`,
      formulas: [{ name: "Quadratic program", tex: R`\min_z \tfrac12 z^\top Hz+f^\top z\ \ \text{s.t.}\ Az\le b` }, { name: "Projected gradient (box)", tex: R`z_{k+1}=\mathrm{clip}(z_k-\alpha(Hz_k+f))` }],
      quiz: [
        { q: "A QP is convex when…", options: ["H is positive semidefinite", "f = 0", "There are no constraints", "A is square"], a: 0, why: "Convexity requires the Hessian H ⪰ 0." },
        { q: "Which solver family suits small embedded MPC with warm starts?", options: ["Active set", "Genetic algorithms", "Brute-force search", "Simulated annealing"], a: 0, why: "Active-set methods reuse the previous active set efficiently." }
      ] },
    { id: "m2l4", title: "Penalties, barriers and soft constraints",
      body: R`<p>Constraints can also be handled by modifying the cost:</p>
<p><b>Penalty method:</b> add a cost for violating the constraint, $J + \rho\,\max(0,h(z))^2$. Large ρ approximates the hard constraint.</p>
<p><b>Barrier method:</b> add a term that grows to infinity at the boundary, keeping iterates strictly inside:</p>
$$J(z) - \frac{1}{t}\sum_i \ln\big(-h_i(z)\big)$$
<p>As $t\to\infty$, the solution approaches the true constrained optimum. This is the basis of interior-point methods.</p>
<p><b>Soft constraints with slack variables</b> (common in MPC): replace $y \le y_{\max}$ by $y \le y_{\max} + \epsilon$, $\epsilon \ge 0$, and add $\rho\,\epsilon^2$ (or $\rho\,\epsilon$) to the cost. Output limits can then be violated slightly when necessary, which keeps the problem <b>feasible</b> after large disturbances.</p>
<table class="tbl"><tr><th>Constraint</th><th>Usually</th><th>Why</th></tr>
<tr><td>Actuator limits (valve 0–100%)</td><td>Hard</td><td>Physically impossible to exceed</td></tr>
<tr><td>Output limits (temperature ≤ 80 °C)</td><td>Soft</td><td>Avoid infeasibility after disturbances</td></tr></table>`,
      formulas: [{ name: "Log barrier", tex: R`J(z)-\tfrac1t\sum_i\ln(-h_i(z))` }, { name: "Soft constraint", tex: R`y\le y_{\max}+\epsilon,\ \epsilon\ge0,\ \ J+\rho\epsilon^2` }],
      quiz: [
        { q: "Why are output constraints in MPC often made soft?", options: ["To save memory", "To keep the optimization feasible after disturbances", "Because outputs are unimportant", "They must be hard"], a: 1, why: "Slack variables prevent infeasible QPs." },
        { q: "A barrier method keeps iterates…", options: ["Outside the feasible set", "Strictly inside the feasible set", "On the boundary only", "Random"], a: 1, why: "The log term blows up at the boundary." }
      ] }
  ] });

MODULES.push({ id: "m3", title: "Dynamic Programming", icon: "🪜",
  intro: "Bellman's principle: solve big decision problems backwards in time, one stage at a time.",
  lessons: [
    { id: "m3l1", title: "The principle of optimality",
      body: R`<p>Richard Bellman (1957): <i>an optimal policy has the property that, whatever the initial state and first decision, the remaining decisions must be optimal for the state that results.</i></p>
<p>In other words, <b>every tail of an optimal path is itself optimal</b>. If the fastest route from Cavite to Baguio passes through Manila, then its Manila-to-Baguio part is the fastest route from Manila to Baguio.</p>
<p>This lets us solve problems <b>backwards</b>: first find the best decision at the last stage for every possible state, then the stage before, and so on.</p>
<table class="tbl"><tr><th>Node</th><th>Cost-to-go to goal G</th><th>Best next node</th></tr>
<tr><td>G</td><td>0</td><td>–</td></tr><tr><td>D (D→G = 3)</td><td>3</td><td>G</td></tr>
<tr><td>E (E→G = 5)</td><td>5</td><td>G</td></tr>
<tr><td>B (B→D = 4, B→E = 1)</td><td>min(4+3, 1+5) = 6</td><td>E</td></tr>
<tr><td>C (C→D = 2, C→E = 6)</td><td>min(2+3, 6+5) = 5</td><td>D</td></tr>
<tr><td>A (A→B = 2, A→C = 4)</td><td>min(2+6, 4+5) = 8</td><td>B</td></tr></table>
<p>Optimal path: A → B → E → G, total cost 8.</p>`,
      formulas: [{ name: "Cost-to-go recursion", tex: R`V(n)=\min_{m}\,[c(n,m)+V(m)]` }],
      quiz: [
        { q: "The principle of optimality says…", options: ["The first decision is all that matters", "Every tail of an optimal path is optimal", "Greedy choices are always optimal", "Paths must be straight"], a: 1, why: "That is Bellman's principle." },
        { q: "In the table, if A→C cost 1 instead of 4, the optimal cost from A would be…", options: ["6", "7", "8", "5"], a: 0, why: "min(2 + 6, 1 + 5) = 6, via C." }
      ] },
    { id: "m3l2", title: "The Bellman equation",
      body: R`<p>For a discrete-time system $x_{k+1} = f(x_k,u_k)$ with stage cost $\ell(x,u)$ and terminal cost $\phi(x_N)$, define the <b>value function</b> $V_k(x)$ = the minimum cost from state $x$ at time $k$ to the end. Then</p>
$$V_N(x) = \phi(x),\qquad V_k(x) = \min_{u}\Big[\ell(x,u) + V_{k+1}\big(f(x,u)\big)\Big]$$
<p>and the optimal policy is the minimizing $u$, a <b>feedback law</b> $u_k = \mu_k(x_k)$.</p>
<p>The continuous-time version is the <b>Hamilton–Jacobi–Bellman (HJB)</b> partial differential equation:</p>
$$-\frac{\partial V}{\partial t} = \min_u\Big[L(x,u) + \nabla V^\top f(x,u)\Big]$$
<p>Dynamic programming gives the optimal control as a <b>function of the state</b> (closed loop), unlike many other methods that give a single open-loop trajectory.</p>`,
      formulas: [{ name: "Bellman equation", tex: R`V_k(x)=\min_u[\ell(x,u)+V_{k+1}(f(x,u))]` }, { name: "HJB equation", tex: R`-\partial_t V=\min_u[L(x,u)+\nabla V^\top f(x,u)]` }],
      quiz: [
        { q: "Dynamic programming produces the optimal control as…", options: ["An open-loop sequence only", "A feedback law of the state", "A random policy", "A transfer function"], a: 1, why: R`$u_k=\mu_k(x_k)$ depends on the current state.` },
        { q: "The value function at the final time equals…", options: ["Zero always", "The terminal cost φ(x)", "The stage cost", "Infinity"], a: 1, why: R`$V_N(x)=\phi(x)$.` }
      ] },
    { id: "m3l3", title: "Discrete LQR by Riccati recursion",
      body: R`<p>Apply dynamic programming to a linear system $x_{k+1} = Ax_k + Bu_k$ with quadratic cost $\sum (x^\top Q x + u^\top R u) + x_N^\top Q_f x_N$. The value function stays quadratic, $V_k(x) = x^\top P_k x$, with the backward <b>Riccati recursion</b>:</p>
$$P_k = Q + A^\top P_{k+1}A - A^\top P_{k+1}B\,(R + B^\top P_{k+1}B)^{-1}B^\top P_{k+1}A$$
$$K_k = (R + B^\top P_{k+1}B)^{-1}B^\top P_{k+1}A,\qquad u_k = -K_k x_k$$
<p>Starting from $P_N = Q_f$, the gains converge as the horizon grows long to a constant $K$: the infinite-horizon LQR.</p>
<p><b>Scalar example</b> $a = 1.2$ (unstable), $b = q = r = 1$: the steady state solves $P^2 - 1.44P - 1 = 0$, so $P \approx 1.952$, $K = abP/(r+b^2P) \approx 0.794$, and the closed loop $a - bK \approx 0.41$ is stable.</p>
<p>Use the explorer to see the gain converge backwards in time.</p>`,
      widget: "riccati", widgetOpts: {},
      formulas: [{ name: "Discrete Riccati recursion", tex: R`P_k=Q+A^\top P_{k+1}A-A^\top P_{k+1}B(R+B^\top P_{k+1}B)^{-1}B^\top P_{k+1}A` }, { name: "Discrete LQR gain", tex: R`K=(R+B^\top PB)^{-1}B^\top PA` }],
      quiz: [
        { q: "The Riccati recursion runs…", options: ["Forward in time", "Backward from the final time", "Only once", "Randomly"], a: 1, why: R`It starts at $P_N=Q_f$ and steps backward.` },
        { q: "For a long horizon, the LQR gain becomes…", options: ["Zero", "Constant", "Infinite", "Oscillatory"], a: 1, why: "The recursion converges to the algebraic Riccati solution." }
      ] },
    { id: "m3l4", title: "Curse of dimensionality and reinforcement learning",
      body: R`<p>For nonlinear systems, $V_k(x)$ must be stored over a grid of states. With $N$ grid points per dimension and $n$ states, that is $N^n$ points:</p>
<table class="tbl"><tr><th>States n</th><th>Grid points (N = 100)</th></tr>
<tr><td>1</td><td>100</td></tr><tr><td>2</td><td>10,000</td></tr><tr><td>4</td><td>100 million</td></tr><tr><td>6</td><td>10¹²</td></tr></table>
<p>Bellman called this the <b>curse of dimensionality</b>. Ways around it:</p>
<ul><li><b>LQR</b>: exploit linear-quadratic structure (exact, no grid).</li>
<li><b>MPC</b>: solve only for the current state, online.</li>
<li><b>Approximate DP / reinforcement learning</b>: approximate $V$ or the action-value $Q(x,u)$ with a neural network, learned from data.</li></ul>
<p>Q-learning updates the action-value from experience:</p>
$$Q(x,u) \leftarrow Q(x,u) + \alpha\Big[\ell + \gamma\min_{u'}Q(x',u') - Q(x,u)\Big]$$
<p>So modern RL (game-playing AIs, robot learning) is dynamic programming with function approximation.</p>`,
      formulas: [{ name: "Grid size", tex: R`N^n` }, { name: "Q-learning update", tex: R`Q\leftarrow Q+\alpha[\ell+\gamma\min_{u'}Q(x',u')-Q]` }],
      quiz: [
        { q: "With 10 grid points per state and 5 states, how many points?", options: ["50", "500", "100,000", "10⁵⁰"], a: 2, why: R`$10^5$.` },
        { q: "Reinforcement learning can be viewed as…", options: ["Unrelated to control", "Approximate dynamic programming", "A PID tuning rule", "Frequency-domain design"], a: 1, why: "It approximates value functions from data." }
      ] }
  ] });

MODULES.push({ id: "m4", title: "Linear Quadratic Regulator", icon: "🎛️",
  intro: "The workhorse of optimal control: a state-feedback gain from a matrix Riccati equation.",
  lessons: [
    { id: "m4l1", title: "The LQR problem",
      body: R`<p>For $\dot x = Ax + Bu$, minimize</p>
$$J = \int_0^\infty \big(x^\top Q x + u^\top R u\big)\,dt,\qquad Q \succeq 0,\ R \succ 0$$
<p>The optimal control is linear state feedback</p>
$$u = -Kx,\qquad K = R^{-1}B^\top P$$
<p>where $P \succ 0$ solves the <b>algebraic Riccati equation (ARE)</b>:</p>
$$A^\top P + PA - PBR^{-1}B^\top P + Q = 0$$
<p>Conditions: $(A,B)$ stabilizable and $(A, Q^{1/2})$ detectable. Then the closed loop $A - BK$ is guaranteed stable.</p>
<p>In practice: MATLAB <code>K = lqr(A,B,Q,R)</code>, Python <code>scipy.linalg.solve_continuous_are</code>.</p>`,
      formulas: [{ name: "LQR cost", tex: R`J=\int_0^\infty (x^\top Qx+u^\top Ru)\,dt` }, { name: "Algebraic Riccati equation", tex: R`A^\top P+PA-PBR^{-1}B^\top P+Q=0` }, { name: "LQR gain", tex: R`K=R^{-1}B^\top P` }],
      quiz: [
        { q: "The LQR control law is…", options: ["u = −Kx (linear state feedback)", "PID", "Bang-bang", "Open-loop"], a: 0, why: "LQR gives a constant state-feedback gain." },
        { q: "Which equation gives P?", options: ["Lyapunov equation", "Algebraic Riccati equation", "Euler–Lagrange", "Bellman–Ford"], a: 1, why: R`$A^\top P+PA-PBR^{-1}B^\top P+Q=0$.` }
      ] },
    { id: "m4l2", title: "LQR for a double integrator",
      body: R`<p>The double integrator $\ddot y = u$ (a mass on a frictionless track, or a satellite's attitude) has $x = (y, \dot y)$:</p>
$$A=\begin{pmatrix}0&1\\0&0\end{pmatrix},\quad B=\begin{pmatrix}0\\1\end{pmatrix},\quad Q=\begin{pmatrix}q_1&0\\0&q_2\end{pmatrix},\quad R=r$$
<p>Solving the ARE by hand gives</p>
$$K = \left[\ \sqrt{\tfrac{q_1}{r}},\ \ \sqrt{\tfrac{q_2}{r} + 2\sqrt{\tfrac{q_1}{r}}}\ \right]$$
<p><b>Example:</b> $q_1 = 1$, $q_2 = 0$, $r = 1$ gives $K = [1, \sqrt2]$. The closed loop is $s^2 + \sqrt2\,s + 1 = 0$: damping $\zeta = 0.707$, $\omega_n = 1$. That is the classic “optimal” damping, obtained automatically.</p>
<p>Use the sliders: a larger $q_1$ or a smaller $r$ makes the response faster but needs bigger control effort.</p>`,
      widget: "lqr", widgetOpts: {},
      formulas: [{ name: "Double-integrator LQR gain", tex: R`K=\Big[\sqrt{q_1/r},\ \sqrt{q_2/r+2\sqrt{q_1/r}}\Big]` }, { name: "Closed-loop poles", tex: R`s^2+k_2 s+k_1=0` }],
      quiz: [
        { q: R`With $q_1=4$, $q_2=0$, $r=1$, what is $k_1$?`, options: ["1", "2", "4", "16"], a: 1, why: R`$\sqrt{4/1}=2$.` },
        { q: "Decreasing r (cheaper control) makes the response…", options: ["Slower", "Faster, with larger inputs", "Unstable", "Unchanged"], a: 1, why: "Control becomes cheap, so the optimizer uses more of it." }
      ] },
    { id: "m4l3", title: "Choosing Q and R",
      body: R`<p>LQR turns controller design into choosing weights. A good starting point is <b>Bryson's rule</b>: normalize each variable by its largest acceptable value.</p>
$$Q_{ii} = \frac{1}{x_{i,\max}^2},\qquad R_{jj} = \frac{1}{u_{j,\max}^2}$$
<p><b>Example:</b> a position loop where 1 cm error is acceptable and the motor voltage limit is 12 V: $Q_{11} = 1/0.01^2 = 10^4$, $R = 1/12^2 \approx 0.0069$.</p>
<table class="tbl"><tr><th>Change</th><th>Effect</th></tr>
<tr><td>Increase $Q_{ii}$</td><td>State $x_i$ is regulated more tightly, faster</td></tr>
<tr><td>Increase $R$</td><td>Gentler control, slower response, less energy</td></tr>
<tr><td>Scale Q and R together</td><td>No change (only the ratio matters)</td></tr>
<tr><td>Weight on output: $Q = C^\top C$</td><td>Penalizes $y^\top y$ directly</td></tr></table>
<p>Then iterate: simulate, check overshoot, settling time and actuator saturation, and adjust.</p>`,
      formulas: [{ name: "Bryson's rule", tex: R`Q_{ii}=1/x_{i,\max}^2,\ \ R_{jj}=1/u_{j,\max}^2` }, { name: "Output weighting", tex: R`Q=C^\top C` }],
      quiz: [
        { q: "If you multiply both Q and R by 10, the LQR gain…", options: ["Increases 10×", "Stays the same", "Decreases", "Becomes unstable"], a: 1, why: "Only the ratio between Q and R affects K." },
        { q: "By Bryson's rule, a maximum acceptable input of 5 V gives R = …", options: ["5", "0.2", "0.04", "25"], a: 2, why: "1/5² = 0.04." }
      ] },
    { id: "m4l4", title: "Robustness of LQR, and LQG",
      body: R`<p>With full state feedback, LQR has remarkable <b>guaranteed robustness</b> (for each input channel, with diagonal R):</p>
<table class="tbl"><tr><th>Margin</th><th>Guarantee</th></tr>
<tr><td>Gain margin</td><td>From 1/2 (−6 dB) up to ∞</td></tr>
<tr><td>Phase margin</td><td>At least 60°</td></tr></table>
<p>These follow from the <b>Kalman inequality</b> $|1 + L(j\omega)| \ge 1$ for the loop transfer function.</p>
<p>But the full state is rarely measured. Estimating it with a Kalman filter gives <b>LQG</b> (linear quadratic Gaussian). The <b>separation principle</b> says the LQR gain and the Kalman filter can be designed independently, and the combination is optimal.</p>
<p>However, Doyle (1978) showed in a famous 3-line paper, “Guaranteed margins for LQG regulators. Abstract: There are none.”, that LQG <b>loses</b> LQR's guaranteed margins. Remedies: loop transfer recovery (LTR), or robust design (see Robust & Adaptive Steps).</p>
<p><b>Integral action:</b> for zero steady-state error, augment the state with $\dot x_I = r - y$ and include $x_I$ in Q.</p>`,
      formulas: [{ name: "Kalman inequality", tex: R`|1+L(j\omega)|\ge1` }, { name: "Integral augmentation", tex: R`\dot x_I=r-y` }],
      quiz: [
        { q: "Full-state LQR guarantees a phase margin of at least…", options: ["30°", "45°", "60°", "90°"], a: 2, why: "A classic result from the Kalman inequality." },
        { q: "Does LQG keep LQR's guaranteed margins?", options: ["Yes", "No (Doyle, 1978)"], a: 1, why: "“There are none.”" }
      ] }
  ] });

MODULES.push({ id: "m5", title: "Pontryagin's Principle", icon: "🚀",
  intro: "Calculus of variations, the Hamiltonian, and bang-bang control for minimum time.",
  lessons: [
    { id: "m5l1", title: "Calculus of variations",
      body: R`<p>Before control theory, mathematicians asked: which <b>function</b> $x(t)$ minimizes an integral $J = \int_{t_0}^{t_1} L(x,\dot x,t)\,dt$? The answer must satisfy the <b>Euler–Lagrange equation</b>:</p>
$$\frac{d}{dt}\frac{\partial L}{\partial \dot x} - \frac{\partial L}{\partial x} = 0$$
<p><b>Example 1 (shortest path):</b> the length is $\int\sqrt{1+\dot x^2}\,dt$. Euler–Lagrange gives $\ddot x = 0$: a straight line.</p>
<p><b>Example 2 (minimum energy move):</b> move a mass from rest at 0 to rest at 1 in time T minimizing $\int u^2\,dt$ with $\ddot x = u$. The answer is a cubic position profile and a <b>linearly varying</b> force:</p>
$$u^*(t) = \frac{6}{T^2}\Big(1 - \frac{2t}{T}\Big)$$
<p>Historical gem: the <b>brachistochrone</b> (fastest slide between two points under gravity, Johann Bernoulli, 1696) is a cycloid, not a straight line.</p>`,
      formulas: [{ name: "Euler–Lagrange equation", tex: R`\dfrac{d}{dt}\dfrac{\partial L}{\partial\dot x}-\dfrac{\partial L}{\partial x}=0` }, { name: "Minimum-energy move", tex: R`u^*(t)=\tfrac{6}{T^2}\big(1-\tfrac{2t}{T}\big)` }],
      quiz: [
        { q: "The shortest path between two points (Euler–Lagrange) is…", options: ["A circle", "A straight line", "A cycloid", "A parabola"], a: 1, why: R`$\ddot x=0$.` },
        { q: "The brachistochrone (fastest slide) curve is a…", options: ["Straight line", "Cycloid", "Circle", "Hyperbola"], a: 1, why: "Bernoulli's famous result." }
      ] },
    { id: "m5l2", title: "The Hamiltonian and Pontryagin's principle",
      body: R`<p>Lev Pontryagin (1956) handled dynamics and input constraints together. Define the <b>Hamiltonian</b> with costate $\lambda(t)$:</p>
$$H(x,u,\lambda,t) = L(x,u,t) + \lambda^\top f(x,u,t)$$
<p>The optimal trajectory satisfies:</p>
$$\dot x = \frac{\partial H}{\partial \lambda},\qquad \dot\lambda = -\frac{\partial H}{\partial x},\qquad u^*(t) = \arg\min_{u\in\mathcal U} H$$
<p>with boundary conditions $x(0) = x_0$ and, for free final state, $\lambda(T) = \partial\phi/\partial x$ (transversality).</p>
<p>Key point: $u^*$ <b>minimizes</b> H over the allowed set $\mathcal U$, even when that set is bounded (such as $|u| \le 1$), where derivatives cannot be set to zero. This is what produces <b>bang-bang</b> controls.</p>
<p>The result is a <b>two-point boundary value problem</b>: $x$ is known at the start, $\lambda$ at the end. It is solved by shooting or collocation methods.</p>`,
      formulas: [{ name: "Hamiltonian", tex: R`H=L+\lambda^\top f` }, { name: "State and costate equations", tex: R`\dot x=\partial H/\partial\lambda,\ \ \dot\lambda=-\partial H/\partial x` }, { name: "Minimum principle", tex: R`u^*=\arg\min_{u\in\mathcal U}H` }],
      quiz: [
        { q: "In Pontryagin's principle, the optimal u…", options: ["Maximizes x", "Minimizes the Hamiltonian over the allowed inputs", "Sets λ to zero", "Is always zero"], a: 1, why: "That is the minimum principle." },
        { q: "The PMP leads to a…", options: ["Initial value problem", "Two-point boundary value problem", "Algebraic equation only", "Linear program"], a: 1, why: R`$x(0)$ is fixed at the start, $\lambda(T)$ at the end.` }
      ] },
    { id: "m5l3", title: "Bang-bang minimum-time control",
      body: R`<p>Move a double integrator $\ddot x = u$, $|u|\le 1$, from any state to rest at the origin in <b>minimum time</b>. Here $L = 1$ and</p>
$$H = 1 + \lambda_1 x_2 + \lambda_2 u \ \Rightarrow\ u^* = -\operatorname{sign}(\lambda_2)$$
<p>so the input is always at a limit: <b>bang-bang</b>. Since $\lambda_2$ is linear in time, it changes sign at most once: <b>at most one switch</b>.</p>
<p>The optimal feedback uses the <b>switching curve</b>:</p>
$$x_1 = -\tfrac12\,x_2|x_2|$$
<p>Above the curve apply $u=-1$, below it $u=+1$; once on the curve, ride it to the origin. From rest at position $x_1 = d$, the minimum time is $T = 2\sqrt{|d|}$: accelerate for half the time and brake for the other half.</p>
<p>Elevator, hard-disk head and crane motions use this idea, usually softened (S-curves) to limit jerk.</p>`,
      widget: "mintime", widgetOpts: {},
      formulas: [{ name: "Bang-bang law", tex: R`u^*=-\mathrm{sign}(\lambda_2)` }, { name: "Switching curve", tex: R`x_1=-\tfrac12 x_2|x_2|` }, { name: "Rest-to-rest time", tex: R`T=2\sqrt{|d|}` }],
      quiz: [
        { q: "How many switches does minimum-time control of a double integrator need at most?", options: ["0", "1", "2", "Infinitely many"], a: 1, why: R`$\lambda_2(t)$ is linear, so it changes sign at most once.` },
        { q: "With |u| ≤ 1, the minimum time to move from rest at x = 4 to rest at 0 is…", options: ["2", "4", "8", "16"], a: 1, why: R`$2\sqrt4=4$.` }
      ] },
    { id: "m5l4", title: "Energy, fuel and time compared",
      body: R`<p>Different costs give very different control shapes for the same rest-to-rest move:</p>
<table class="tbl"><tr><th>Cost</th><th>Optimal input shape</th><th>Character</th></tr>
<tr><td>Minimum time, $|u|\le1$</td><td>+1 then −1 (one switch)</td><td>Fastest, harsh</td></tr>
<tr><td>Minimum energy $\int u^2$</td><td>Straight line from +6/T² to −6/T²</td><td>Smooth</td></tr>
<tr><td>Minimum fuel $\int|u|$, fixed T</td><td>+1, coast (0), −1 (bang-off-bang)</td><td>Coasting saves fuel</td></tr>
<tr><td>Time + energy $\int(1+\rho u^2)$</td><td>Saturated, then linear</td><td>Practical compromise</td></tr></table>
<p><b>Singular arcs</b> occur when $\partial H/\partial u = 0$ over an interval, so the minimum principle alone does not decide $u$. Examples: some rocket ascent and bioreactor feeding problems.</p>
<p>Engineering message: <b>the cost function is a design choice</b>. Write down what you really care about (time, energy, wear, comfort) before optimizing.</p>`,
      formulas: [{ name: "Fuel-optimal law", tex: R`u^*\in\{-1,0,+1\}` }],
      quiz: [
        { q: "Minimum-fuel control with a fixed time often has the shape…", options: ["Bang-bang", "Bang-off-bang", "Sinusoidal", "Constant"], a: 1, why: "It thrusts, coasts, then brakes." },
        { q: "Which cost gives the smoothest input?", options: ["Minimum time", "Minimum energy", "Minimum fuel", "All equal"], a: 1, why: R`Penalizing $u^2$ produces smooth continuous inputs.` }
      ] }
  ] });

MODULES.push({ id: "m6", title: "MPC Fundamentals", icon: "🔮",
  intro: "Model Predictive Control: predict the future, optimize, apply the first move, repeat.",
  lessons: [
    { id: "m6l1", title: "The receding-horizon idea",
      body: R`<p><b>Model Predictive Control (MPC)</b> works like a careful driver: look ahead, plan the next few seconds, act on the first part of the plan, then look again and re-plan.</p>
<p>At every sample time $k$:</p>
<ol><li><b>Measure</b> or estimate the current state $x_k$.</li>
<li><b>Predict</b> the future outputs over a horizon of $N_p$ steps using a model.</li>
<li><b>Optimize</b> the future input sequence $u_k, \dots, u_{k+N_c-1}$ to minimize a cost, subject to constraints.</li>
<li><b>Apply only the first input</b> $u_k$.</li>
<li>Shift the horizon one step and repeat.</li></ol>
<p>Re-optimizing every step gives <b>feedback</b>: disturbances and model errors are corrected because the plan always starts from the latest measurement.</p>
<p>Why industry loves MPC: it handles <b>constraints</b> explicitly, works naturally with <b>multiple inputs and outputs</b>, and uses <b>future reference</b> information (preview).</p>`,
      formulas: [{ name: "MPC at each sample", tex: R`u_k^*=\text{first element of }\arg\min_{U} J(x_k,U)\ \text{s.t. constraints}` }],
      quiz: [
        { q: "In MPC, which part of the optimal input sequence is applied?", options: ["All of it", "Only the first move", "The last move", "The average"], a: 1, why: "Then the problem is re-solved at the next sample." },
        { q: "MPC's main practical advantage over LQR is…", options: ["No model needed", "Explicit handling of constraints", "No computation", "Only SISO systems"], a: 1, why: "Constraints are included directly in the optimization." }
      ] },
    { id: "m6l2", title: "Prediction model",
      body: R`<p>MPC uses a discrete-time model $x_{k+1} = Ax_k + Bu_k$, $y_k = Cx_k$. Stacking the predictions over the horizon:</p>
$$X = \Phi\,x_k + \Gamma\,U$$
$$\Phi = \begin{pmatrix}A\\A^2\\\vdots\\A^{N}\end{pmatrix},\qquad \Gamma = \begin{pmatrix}B&0&\cdots&0\\AB&B&\cdots&0\\\vdots&&\ddots&\\A^{N-1}B&A^{N-2}B&\cdots&B\end{pmatrix}$$
<p>where $X = (x_{k+1},\dots,x_{k+N})$ and $U = (u_k,\dots,u_{k+N-1})$.</p>
<p><b>Scalar example:</b> $a=0.9$, $b=0.1$, $N=3$:</p>
$$\Phi = \begin{pmatrix}0.9\\0.81\\0.729\end{pmatrix},\qquad \Gamma = \begin{pmatrix}0.1&0&0\\0.09&0.1&0\\0.081&0.09&0.1\end{pmatrix}$$
<p>Models come from physics, step-response tests, or system identification. In industry, step-response models (DMC, 1979) were the first form used.</p>`,
      formulas: [{ name: "Stacked prediction", tex: R`X=\Phi x_k+\Gamma U` }, { name: "Prediction blocks", tex: R`\Phi_i=A^i,\ \ \Gamma_{ij}=A^{i-j}B\ (j\le i)` }],
      quiz: [
        { q: R`For $a=0.5$, $b=1$, what is $\Gamma_{21}$ (effect of $u_k$ on $x_{k+2}$)?`, options: ["0.25", "0.5", "1", "2"], a: 1, why: R`$A^{1}B=0.5$.` },
        { q: "The first industrial MPC (DMC) used…", options: ["Neural networks", "Step-response models", "Fuzzy rules", "No model"], a: 1, why: "Dynamic Matrix Control was based on step-response coefficients." }
      ] },
    { id: "m6l3", title: "Cost function and the unconstrained solution",
      body: R`<p>A typical tracking cost over the horizon:</p>
$$J = \sum_{i=1}^{N_p}\|y_{k+i}-r_{k+i}\|_Q^2 + \sum_{i=0}^{N_c-1}\|u_{k+i}\|_R^2$$
<p>In stacked form, $J = (X - \mathcal R)^\top\bar Q(X - \mathcal R) + U^\top \bar R U$. Without constraints, setting the gradient to zero gives</p>
$$U^* = \big(\Gamma^\top\bar Q\Gamma + \bar R\big)^{-1}\Gamma^\top\bar Q\,\big(\mathcal R - \Phi x_k\big)$$
<p>Only the first block row is applied, so unconstrained MPC is just a <b>linear controller</b> $u_k = K_r\mathcal R - K_x x_k$. With a long horizon it approaches LQR.</p>
<p>Many MPCs penalize input <b>changes</b> $\Delta u_k = u_k - u_{k-1}$ instead of $u_k$. This gives integral action and smooth actuator moves (“move suppression”).</p>`,
      formulas: [{ name: "MPC cost", tex: R`J=\sum\|y-r\|_Q^2+\sum\|u\|_R^2` }, { name: "Unconstrained MPC", tex: R`U^*=(\Gamma^\top\bar Q\Gamma+\bar R)^{-1}\Gamma^\top\bar Q(\mathcal R-\Phi x_k)` }],
      quiz: [
        { q: "Without constraints, MPC is equivalent to…", options: ["A nonlinear controller", "A linear feedback controller", "Open-loop control", "Bang-bang control"], a: 1, why: "The solution is linear in the state and reference." },
        { q: "Penalizing Δu instead of u mainly gives…", options: ["Faster but rougher moves", "Smoother moves and integral action", "No feedback", "Instability"], a: 1, why: "Move suppression smooths the actuator and removes offset." }
      ] },
    { id: "m6l4", title: "Horizons and tuning",
      body: R`<p>MPC tuning knobs and their effects:</p>
<table class="tbl"><tr><th>Parameter</th><th>Increase it and…</th></tr>
<tr><td>Prediction horizon $N_p$</td><td>More foresight and stability; more computation</td></tr>
<tr><td>Control horizon $N_c$</td><td>More aggressive, flexible plans; more variables</td></tr>
<tr><td>Output weight Q</td><td>Tighter tracking</td></tr>
<tr><td>Input / move weight R</td><td>Smoother, slower control</td></tr>
<tr><td>Sample time $T_s$</td><td>Larger: less computation but coarser control</td></tr></table>
<p>Rules of thumb: choose $T_s$ so the plant's rise time spans about 10–20 samples, $N_p$ to cover most of the open-loop settling time, and $N_c$ around 10–20% of $N_p$ (inputs beyond $N_c$ are held constant).</p>
<p>The simulator runs MPC on a first-order plant $x_{k+1} = 0.9x_k + 0.1u_k$ tracking a setpoint step. Change the horizon, the input weight and the input <b>rate limit</b> (how much u may change per sample).</p>`,
      widget: "mpc", widgetOpts: { umax: 5 },
      formulas: [{ name: "Sampling rule of thumb", tex: R`T_s\approx t_r/10\ \text{to}\ t_r/20` }],
      quiz: [
        { q: "Increasing the input weight R makes MPC…", options: ["More aggressive", "Smoother and slower", "Unstable always", "Ignore constraints"], a: 1, why: "Control effort becomes more expensive." },
        { q: "Inputs beyond the control horizon N_c are typically…", options: ["Held constant", "Set to zero always", "Random", "Maximum"], a: 0, why: "This reduces the number of decision variables." }
      ] }
  ] });

MODULES.push({ id: "m7", title: "Constrained MPC", icon: "🧱",
  intro: "Constraints, the QP at every sample, stability guarantees and offset-free tracking.",
  lessons: [
    { id: "m7l1", title: "Types of constraints",
      body: R`<p>Constraints are where MPC shines. Typical types:</p>
<table class="tbl"><tr><th>Type</th><th>Formula</th><th>Example</th></tr>
<tr><td>Input magnitude</td><td>$u_{\min} \le u_k \le u_{\max}$</td><td>Valve 0–100%, motor ±12 V</td></tr>
<tr><td>Input rate</td><td>$|\Delta u_k| \le \Delta u_{\max}$</td><td>Valve slew rate, thermal stress</td></tr>
<tr><td>Output / state</td><td>$y_{\min} \le y_k \le y_{\max}$</td><td>Tank level, battery temperature</td></tr>
<tr><td>Terminal</td><td>$x_{k+N} \in \mathcal X_f$</td><td>Stability guarantee</td></tr></table>
<p>Without MPC, constraints are handled after the fact: the PID output saturates, which causes <b>integrator windup</b> and large overshoot unless anti-windup is added. MPC <b>plans</b> with the limits in mind.</p>
<p>Economic benefit: knowing the limits lets the plant run <b>closer</b> to them (for example, near maximum throughput) safely. That is the main reason refineries adopted MPC.</p>`,
      formulas: [{ name: "Input bounds", tex: R`u_{\min}\le u_k\le u_{\max}` }, { name: "Rate bounds", tex: R`|u_k-u_{k-1}|\le\Delta u_{\max}` }],
      quiz: [
        { q: "What problem does PID face when its output saturates?", options: ["Integrator windup", "Too little gain", "No feedback", "Aliasing"], a: 0, why: "The integrator keeps accumulating error while the actuator is limited." },
        { q: "Why does MPC often raise plant profit?", options: ["It uses no energy", "It lets the plant run safely closer to its limits", "It removes all constraints", "It needs no model"], a: 1, why: "Explicit constraint handling allows operating near limits." }
      ] },
    { id: "m7l2", title: "Solving the constrained problem",
      body: R`<p>With constraints, the MPC problem at each sample becomes a QP:</p>
$$\min_U\ \tfrac12 U^\top H U + f(x_k)^\top U \quad \text{s.t.}\ \ G U \le w + E x_k$$
$$H = 2(\Gamma^\top\bar Q\Gamma + \bar R),\qquad f = 2\Gamma^\top\bar Q(\Phi x_k - \mathcal R)$$
<p>Only $f$ and the right-hand side change with $x_k$, so $H$ and $G$ can be precomputed.</p>
<p>The simulator solves this QP (with an input <b>rate</b> limit $|\Delta u|\le\Delta u_{\max}$) by accelerated projected gradient at every step. Compare it with an unconstrained MPC whose moves are <b>rate-limited afterwards</b>. On the oscillatory plant, the after-the-fact limiter overshoots badly, while MPC plans its moves around the limit.</p>`,
      widget: "mpc", widgetOpts: { umax: 0.3, compare: true },
      formulas: [{ name: "MPC QP", tex: R`\min_U \tfrac12U^\top HU+f(x_k)^\top U\ \ \text{s.t.}\ GU\le w+Ex_k` }, { name: "Hessian", tex: R`H=2(\Gamma^\top\bar Q\Gamma+\bar R)` }],
      quiz: [
        { q: "Which parts of the MPC QP change with the current state?", options: ["H only", "f and the constraint right-hand side", "Nothing", "Everything including H"], a: 1, why: "H depends only on the model and weights." },
        { q: "Clipping an unconstrained controller's output is…", options: ["Identical to constrained MPC", "Generally worse: it does not plan for the limit", "Always better", "Impossible"], a: 1, why: "Constrained MPC re-optimizes the whole sequence knowing the limits." }
      ] },
    { id: "m7l3", title: "Stability and feasibility",
      body: R`<p>A finite horizon does not automatically guarantee stability. The standard recipe (Mayne et al., 2000) adds two ingredients:</p>
<ul><li><b>Terminal cost</b> $x_{k+N}^\top P x_{k+N}$, with $P$ from the LQR Riccati equation: it approximates the infinite-horizon cost-to-go.</li>
<li><b>Terminal set</b> $x_{k+N}\in\mathcal X_f$: a region where the LQR law $u=-Kx$ satisfies all constraints.</li></ul>
<p>Then the optimal cost $V_N(x)$ is a <b>Lyapunov function</b>:</p>
$$V_N(x_{k+1}) - V_N(x_k) \le -\ell(x_k,u_k) < 0$$
<p><b>Recursive feasibility:</b> if the problem is feasible now, the shifted plan (old plan plus the LQR move at the end) is feasible at the next step, so the MPC never “runs out” of solutions.</p>
<p>In practice, long horizons, soft output constraints and well-chosen weights usually give stable behaviour even without explicit terminal constraints.</p>`,
      formulas: [{ name: "Terminal cost", tex: R`x_{k+N}^\top P\,x_{k+N}` }, { name: "Lyapunov decrease", tex: R`V_N(x_{k+1})-V_N(x_k)\le-\ell(x_k,u_k)` }],
      quiz: [
        { q: "The terminal cost in stabilizing MPC is usually taken from…", options: ["A random matrix", "The LQR Riccati solution", "The identity", "The PID gains"], a: 1, why: "It approximates the infinite-horizon cost-to-go." },
        { q: "Recursive feasibility means…", options: ["The QP is solved twice", "Feasible now implies feasible at the next step", "Constraints are ignored", "The horizon grows"], a: 1, why: "The shifted plan stays feasible." }
      ] },
    { id: "m7l4", title: "Offset-free tracking",
      body: R`<p>Real plants differ from their models, and unmeasured disturbances act on them. A plain state-feedback MPC then shows <b>steady-state offset</b>.</p>
<p>Two standard fixes:</p>
<p><b>1. Δu formulation:</b> optimize input changes; the integrated input gives integral action.</p>
<p><b>2. Disturbance model + observer:</b> augment the model with a constant disturbance $d$,</p>
$$x_{k+1} = Ax_k + Bu_k + B_d d_k,\quad d_{k+1} = d_k,\quad y_k = Cx_k + C_d d_k$$
<p>estimate $(x,d)$ with a Kalman filter or observer, and compute targets $(x_s,u_s)$ that give $y = r$ despite $d$:</p>
$$\begin{pmatrix}A-I & B\\ C & 0\end{pmatrix}\begin{pmatrix}x_s\\u_s\end{pmatrix} = \begin{pmatrix}-B_d\hat d\\ r - C_d\hat d\end{pmatrix}$$
<p>This is exactly where Kalman filtering meets MPC: good estimation is half of good predictive control.</p>`,
      formulas: [{ name: "Disturbance-augmented model", tex: R`x_{k+1}=Ax_k+Bu_k+B_dd_k,\ \ d_{k+1}=d_k` }, { name: "Target calculation", tex: R`\begin{pmatrix}A-I&B\\C&0\end{pmatrix}\begin{pmatrix}x_s\\u_s\end{pmatrix}=\begin{pmatrix}-B_d\hat d\\r-C_d\hat d\end{pmatrix}` }],
      quiz: [
        { q: "Why does plain MPC show steady-state offset?", options: ["Too many constraints", "Model mismatch and unmeasured disturbances", "Short sample time", "It never does"], a: 1, why: "The model's prediction of steady state is biased." },
        { q: "The disturbance in the augmented model is usually modelled as…", options: ["White noise only", "A constant (integrating) state", "A sine wave", "Zero"], a: 1, why: R`$d_{k+1}=d_k$, estimated by an observer.` }
      ] }
  ] });

MODULES.push({ id: "m8", title: "Applications & Practice", icon: "🏭",
  intro: "Where optimal control and MPC are used, how they are implemented, and what comes next.",
  lessons: [
    { id: "m8l1", title: "MPC in industry",
      body: R`<table class="tbl"><tr><th>Field</th><th>Application</th><th>Why MPC</th></tr>
<tr><td>Oil refining, petrochemicals</td><td>Distillation columns, crackers</td><td>Many coupled variables, constraints, slow dynamics</td></tr>
<tr><td>Power systems</td><td>Microgrid energy management, battery scheduling</td><td>Forecasts of load and solar, storage limits</td></tr>
<tr><td>Power electronics</td><td>Finite-control-set MPC of inverters and motor drives</td><td>Directly chooses switch states, fast response</td></tr>
<tr><td>Automotive</td><td>Adaptive cruise control, lane keeping, engine air path</td><td>Safety constraints, preview of road and traffic</td></tr>
<tr><td>Buildings</td><td>HVAC with weather and price forecasts</td><td>Comfort bands, energy cost minimization (10–30% savings reported)</td></tr>
<tr><td>Robotics, aerospace</td><td>Legged locomotion, drone racing, landing rockets</td><td>Nonlinear, fast, constrained</td></tr></table>
<p>Surveys (Qin and Badgwell, 2003) counted thousands of industrial MPC applications, mostly in refining and chemicals. Today it is spreading to fast embedded systems.</p>
<p><b>FCS-MPC</b> for a power converter: at each switching instant, evaluate the predicted current error for every possible switch state (8 for a 2-level 3-phase inverter) and apply the best one:</p>
$$S^* = \arg\min_{S\in\{S_0,\dots,S_7\}} \big|i^{ref}_{k+1} - i_{k+1}(S)\big|$$`,
      formulas: [{ name: "FCS-MPC", tex: R`S^*=\arg\min_{S}|i^{ref}_{k+1}-i_{k+1}(S)|` }],
      quiz: [
        { q: "Where did MPC first spread widely in industry?", options: ["Consumer electronics", "Oil refining and petrochemicals", "Toys", "Banking"], a: 1, why: "Slow, multivariable, constrained processes were ideal." },
        { q: "FCS-MPC for an inverter chooses…", options: ["A continuous duty cycle", "The best switch state from a finite set", "PID gains", "The DC voltage"], a: 1, why: "It evaluates each switching state's predicted outcome." }
      ] },
    { id: "m8l2", title: "Implementing MPC",
      body: R`<p>The QP must be solved <b>within one sample period</b>. Options:</p>
<table class="tbl"><tr><th>Approach</th><th>Idea</th><th>Best for</th></tr>
<tr><td>Online QP (warm-started)</td><td>Reuse the shifted previous solution as the starting guess</td><td>Most applications</td></tr>
<tr><td>Explicit MPC</td><td>Pre-solve offline: the solution is piecewise affine in $x$, so store regions and gains in a lookup table</td><td>Small systems, microsecond sampling</td></tr>
<tr><td>Code generation</td><td>Generate dedicated C code for the specific problem</td><td>Embedded MCUs, FPGAs</td></tr></table>
<p>Explicit MPC solution:</p>
$$u^*(x) = F_i x + g_i \quad \text{for } x \in \mathcal{P}_i$$
<p>Practical checklist: measure solver time on the target hardware; handle infeasibility (soft constraints, fallback controller); include an estimator; test against model mismatch.</p>
<p>Popular tools: MATLAB MPC Toolbox, CasADi and acados (nonlinear MPC), OSQP and qpOASES (QP solvers), do-mpc (Python).</p>`,
      formulas: [{ name: "Explicit MPC", tex: R`u^*(x)=F_ix+g_i,\ \ x\in\mathcal P_i` }],
      quiz: [
        { q: "Explicit MPC replaces online optimization with…", options: ["A neural network", "A precomputed piecewise-affine lookup", "PID", "Random search"], a: 1, why: "Regions and affine gains are computed offline." },
        { q: "Warm starting means…", options: ["Heating the processor", "Starting the solver from the previous shifted solution", "Increasing the horizon", "Restarting the plant"], a: 1, why: "Consecutive QPs are similar, so this saves iterations." }
      ] },
    { id: "m8l3", title: "PID vs LQR vs MPC",
      body: R`<table class="tbl"><tr><th></th><th>PID</th><th>LQR</th><th>MPC</th></tr>
<tr><td>Model needed</td><td>No (tuning only)</td><td>Yes, linear</td><td>Yes (linear or nonlinear)</td></tr>
<tr><td>MIMO</td><td>Hard (loop pairing)</td><td>Natural</td><td>Natural</td></tr>
<tr><td>Constraints</td><td>Anti-windup only</td><td>No</td><td>Yes, explicit</td></tr>
<tr><td>Preview of references</td><td>No</td><td>Limited</td><td>Yes</td></tr>
<tr><td>Computation</td><td>Tiny</td><td>Tiny (offline Riccati)</td><td>Optimization every sample</td></tr>
<tr><td>Guaranteed margins</td><td>Design-dependent</td><td>Yes (full state)</td><td>Design-dependent</td></tr>
<tr><td>Share of industrial loops</td><td>~90%+</td><td>Niche (aerospace)</td><td>Supervisory, high-value units</td></tr></table>
<p>A common architecture: <b>MPC on top</b> computes setpoints every few seconds or minutes; <b>PID loops below</b> track them quickly.</p>
<p>Research directions: <b>economic MPC</b> (optimize profit directly instead of tracking), <b>stochastic and robust MPC</b> (uncertainty), <b>learning-based MPC</b> (models or costs learned from data), and <b>distributed MPC</b> for networks of subsystems.</p>`,
      formulas: [{ name: "Economic MPC cost", tex: R`J=\sum_i \ell_{econ}(x_{k+i},u_{k+i})\ \ (\text{e.g. energy cost} - \text{revenue})` }],
      quiz: [
        { q: "In a typical plant hierarchy, MPC usually…", options: ["Replaces every PID loop", "Computes setpoints for PID loops below it", "Runs only offline", "Is not used"], a: 1, why: "MPC is supervisory; PID does fast regulation." },
        { q: "Economic MPC optimizes…", options: ["Tracking error only", "An economic objective such as cost or profit directly", "Nothing", "PID gains"], a: 1, why: "It replaces setpoint tracking with an economic cost." }
      ] },
    { id: "m8l4", title: "Review",
      body: R`<p>Well done! The whole course on one page:</p>
<table class="tbl"><tr><th>Topic</th><th>Key result</th><th>Module</th></tr>
<tr><td>Optimality</td><td>$\nabla J=0$, $\nabla^2J\succ0$; QP $z^*=-H^{-1}f$</td><td>1</td></tr>
<tr><td>Constraints</td><td>KKT: stationarity, feasibility, $\mu\ge0$, $\mu h=0$</td><td>2</td></tr>
<tr><td>Dynamic programming</td><td>$V_k=\min_u[\ell+V_{k+1}]$, Riccati recursion</td><td>3</td></tr>
<tr><td>LQR</td><td>$A^\top P+PA-PBR^{-1}B^\top P+Q=0$, $K=R^{-1}B^\top P$</td><td>4</td></tr>
<tr><td>Pontryagin</td><td>$u^*=\arg\min H$; bang-bang, switching curve</td><td>5</td></tr>
<tr><td>MPC</td><td>Predict $X=\Phi x+\Gamma U$, optimize, apply first move</td><td>6</td></tr>
<tr><td>Constrained MPC</td><td>QP each sample; terminal cost/set; offset-free</td><td>7</td></tr>
<tr><td>Practice</td><td>Explicit MPC, solvers, MPC over PID</td><td>8</td></tr></table>
<p><b>Next steps:</b> implement LQR and a small MPC for one of the plants on your Control Systems board (the DC motor or thermal plant), and compare against PID. Pair this course with <b>Kalman Filter Steps</b> for estimation and <b>Robust &amp; Adaptive Steps</b> for uncertainty.</p>
<p class="tip">Reading: Kirk, <i>Optimal Control Theory</i>; Anderson &amp; Moore, <i>Optimal Control: Linear Quadratic Methods</i>; Rawlings, Mayne &amp; Diehl, <i>Model Predictive Control: Theory, Computation, and Design</i> (free online); Camacho &amp; Bordons, <i>Model Predictive Control</i>.</p>`,
      formulas: [],
      quiz: [
        { q: "Which method handles hard input limits most naturally?", options: ["LQR", "MPC", "Pole placement", "Bode design"], a: 1, why: "Constraints are part of MPC's optimization." },
        { q: "The LQR gain is computed from…", options: ["The Riccati equation", "Euler's formula", "The Routh table", "Ziegler–Nichols"], a: 0, why: R`$K=R^{-1}B^\top P$, with P from the ARE.` },
        { q: "Bang-bang control arises when…", options: ["Inputs are bounded and the Hamiltonian is linear in u", "R is large", "There are no constraints", "The system is nonlinear only"], a: 0, why: "Minimizing a linear H over a box puts u at a vertex." }
      ] }
  ] });
