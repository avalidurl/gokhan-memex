/* APEX PROTOCOL — ANSI panel engine + live leaderboard.
 * Scenes draw glyphs per grid cell on canvas (proportional type, no
 * monospace anywhere). Palette: classic pre-v50 VGA. Cells carry an
 * optional background color — the ANSI fg-on-bg attribute — and ░▒▓
 * render as fg at 25/50/75% alpha. */

"use strict";

/* ---------------- ANSI engine ---------------- */

var PALETTE = [
  "#000000", "#000080", "#008000", "#008080",
  "#800000", "#800080", "#808000", "#C0C0C0",
  "#808080", "#0000FF", "#00FF00", "#00FFFF",
  "#FF0000", "#FF00FF", "#FFFF00", "#FFFFFF",
];

var NO_BG = 16; /* sentinel: transparent cell background */

var FONT_STACK = '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif';

/* Shade/half blocks render as solid tiles, not glyphs. */
var BLOCKS = { "█": 1, "▓": 0.75, "▒": 0.5, "░": 0.25 };
var HALF_TOP = "▀";
var HALF_BOTTOM = "▄";

function hash() {
  var h = 2166136261 >>> 0;
  for (var i = 0; i < arguments.length; i++) {
    var x = Math.imul(arguments[i] | 0, 2654435761) >>> 0;
    x ^= x >>> 13;
    h = (h ^ x) >>> 0;
    h = Math.imul(h, 16777619) >>> 0;
  }
  return ((h >>> 8) & 0xffffff) / 0x1000000;
}

function Grid(cols, rows, frames) {
  this.cols = cols;
  this.rows = rows;
  this.frames = frames;
  this.ch = new Array(cols * rows);
  this.co = new Uint8Array(cols * rows);
  this.bg = new Uint8Array(cols * rows);
  this.hash = hash;
  this.clear();
}

Grid.prototype.clear = function () {
  for (var i = 0; i < this.ch.length; i++) {
    this.ch[i] = " ";
    this.co[i] = 7;
    this.bg[i] = NO_BG;
  }
};

Grid.prototype.set = function (x, y, ch, c, b) {
  x |= 0; y |= 0;
  if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return;
  var i = y * this.cols + x;
  this.ch[i] = ch;
  this.co[i] = c & 15;
  this.bg[i] = (b === undefined || b === null || b < 0) ? NO_BG : (b & 15);
};

Grid.prototype.text = function (x, y, s, c, b) {
  for (var i = 0; i < s.length; i++) this.set(x + i, y, s[i], c, b);
};

Grid.prototype.rect = function (x, y, w, h, ch, c, b) {
  for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.set(x + i, y + j, ch, c, b);
};

/* ---------------- scenes ----------------
 * Four racing scenes authored against docs/style-bible.md +
 * docs/racing-addendum.md + docs/scene-concepts.json, each adversarially
 * reviewed and revised. render(f, g) is pure: frame index + hash only.
 */

var SCENES = [
  { id: "apex-hero-lights-out", fps: 8, frames: 200, cols: 96, rows: 24,
    render: (function render(f, g) {
  var C = g.cols, R = g.rows, H = g.hash;
  var GRN = 2, CYN = 3, RED = 4, MAG = 5, BRN = 6, LGRY = 7, DGRY = 8,
      LGRN = 10, LCYN = 11, LRD = 12, LMAG = 13, YEL = 14, WHT = 15;
  var i, j, x, y, k, s, r, d, ch, o, po, top, bot, iy, cs;

  /* ---- event clock, 200 frames --------------------------------------
     0-55    grid formed, engines idle
     56-95   five reds come on, one per 10 frames
     94-103  the line types across the hold
     106     LIGHTS OUT + green full-field flash (2 frames)
     106-155 launch: ten cars stream right and exit
     156-195 empty track, heat haze
     196-199 grid re-forms via hash dissolve, landing on frame 0        */
  var LOUT = 106, QUIET = 156, DISS = 196;
  var lit = (f >= 56 && f < LOUT) ? Math.min(5, (((f - 56) / 10) | 0) + 1) : 0;
  var flash = (f === LOUT) ? 1 : (f === LOUT + 1 ? 0.5 : 0);
  var q = (f >= QUIET && f < DISS) ? Math.min(1, (f - QUIET) / 8)
        : (f >= DISS ? 1 - (f - DISS + 1) / 4 : 0);
  var shimP = 0.045 + 0.10 * q;

  function fbg(px, py) {
    return !flash ? undefined
      : (flash > 0.9 ? GRN : (H(px, py, 17) < 0.5 ? GRN : undefined));
  }
  function S(px, py, c, col, b) { g.set(px, py, c, col, b === undefined ? fbg(px, py) : b); }
  /* per-cell phase AND per-cell update frame; both periods divide 200 */
  function stp(px, py, sd) {
    return (((((f + ((H(px, py, 11) * 5) | 0)) / 5) | 0) + ((H(px, py, sd) * 40) | 0)) % 40);
  }
  function slw(px, py, sd) {
    return (((((f + ((H(px, py, 12) * 10) | 0)) / 10) | 0) + ((H(px, py, sd) * 20) | 0)) % 20);
  }
  if (flash) for (y = 0; y < R; y++) for (x = 0; x < C; x++) {
    var bb = fbg(x, y); if (bb !== undefined) g.set(x, y, ' ', LGRY, bb);
  }

  /* ---- geometry: broad band, gentle right-hand kink ---------------- */
  var OFF = [], FRC = [];
  for (x = 0; x < C; x++) {
    k = x / (C - 1);
    s = k < 0.38 ? 0 : (k > 0.90 ? 1 : (k - 0.38) / 0.52);
    OFF[x] = ((s * s * (3 - 2 * s)) * 3 + 0.5) | 0;
    var a = k < 0.30 ? 0 : (k > 0.74 ? 1 : (k - 0.30) / 0.44);
    var b2 = k < 0.78 ? 0 : (k - 0.78) / 0.22;
    a = a * a * (3 - 2 * a); b2 = b2 * b2 * (3 - 2 * b2);
    FRC[x] = 4.2 - 2.7 * a + 1.5 * b2;      /* worn line: mid-track, tucks inside through the kink */
  }

  /* ---- grandstand: roof, crowd, barrier, catch fence --------------- */
  for (x = 0; x < C; x++) {
    S(x, 0, x % 12 === 6 ? '█' : '▀', LGRY);
    for (y = 1; y <= 3; y++) {
      cs = slw(x, y, 3);
      if (H(x, y, cs) < 0.30) {
        r = H(x, y, cs + 5);
        S(x, y, r < 0.16 ? '☺' : (r < 0.52 ? '•' : '·'), r < 0.18 ? LGRY : DGRY);
      }
    }
    if (x % 12 === 6) for (y = 1; y <= 3; y++) S(x, y, '│', DGRY);
    S(x, 4, '▄', DGRY);
    if (H(x, 6, slw(x, 6, 1)) < 0.26) S(x, 6, '░', DGRY);
    if (x % 8 === 3) S(x, 6, '│', DGRY);
  }

  /* ---- dust haze above the kink, GREEN runoff below the track ------ */
  for (x = 0; x < C; x++) {
    top = 8 + OFF[x]; bot = 18 + OFF[x];
    for (y = 7; y < top; y++) {
      d = top - y;
      if (x >= 44 && d <= 2 && H(x, y, slw(x, y, 2)) < (d === 1 ? 0.34 : 0.11))
        S(x, y, d === 1 ? '▒' : '░', DGRY);
    }
    for (y = bot + 1; y <= 22; y++) {
      d = y - bot;
      if (H(x, y, slw(x, y, 4)) < (d === 1 ? 0.15 : d === 2 ? 0.08 : d === 3 ? 0.035 : 0.015)) {
        r = H(x, y, 6); S(x, y, r < 0.4 ? ',' : (r < 0.75 ? '.' : "'"), GRN);
      }
    }
  }

  /* ---- the track: flat LGRAY solid first, shade only at transitions - */
  for (x = 0; x < C; x++) {
    o = OFF[x]; po = OFF[x > 0 ? x - 1 : 0]; top = 8 + o;
    var kt = (x >= 60 && x <= 82), kb = (x >= 46 && x <= 64), fr = FRC[x];
    for (iy = 0; iy < 9; iy++) {
      y = top + 1 + iy;
      d = Math.abs(iy - fr);
      ch = '█';
      if (d <= 0.5) ch = H(x, y, stp(x, y, 29)) < 0.12 ? '░' : '▒';    /* worn core + marbles */
      else if (d <= 1.15) ch = '▓';                                    /* the transition step */
      else if (H(x, y, stp(x, y, 27)) < shimP) ch = '▓';               /* dust/heat, +-1 index */
      S(x, y, ch, LGRY);
    }
    for (k = po; k <= o; k++) {
      S(x, 8 + k, '▄', kt ? ((((x / 2) | 0) % 2) ? WHT : RED) : LGRY);
      S(x, 18 + k, '▀', kb ? ((((x / 2) | 0) % 2) ? WHT : RED) : LGRY);
    }
    if (q > 0 && H(x, top - 1, stp(x, top - 1, 31)) < 0.12 * q) S(x, top - 1, '░', LGRY);
  }

  /* ---- start line + the gantry spanning the track ------------------ */
  for (iy = 0; iy < 9; iy++) S(30, 9 + iy, '█', WHT);
  for (y = 6; y <= 21; y++) for (x = 33; x <= 35; x++) S(x, y, '█', DGRY);
  for (x = 31; x <= 37; x++) { S(x, 5, '▄', LGRY); S(x, 22, '▀', LGRY); }
  for (i = 0; i < 5; i++) {
    y = 9 + i * 2;
    S(34, y, '●', i < lit ? LRD : DGRY);
    if (i < lit) { S(33, y, '▒', LRD); S(35, y, '▒', LRD); }
  }

  /* ---- the grid: painted boxes, then ten cars ---------------------- */
  var GXS = [26, 24, 22, 20, 18, 16, 14, 12, 10, 8];
  var LIV = [LRD, LCYN, LGRN, YEL, LMAG, WHT, LCYN, LGRN, YEL, LMAG];
  for (i = 0; i < 10; i++) {
    y = (i % 2) ? 15 : 11;
    for (k = -1; k <= 1; k++) { S(GXS[i] + k, y - 1, '▀', WHT); S(GXS[i] + k, y + 1, '▀', WHT); }
  }

  var mode = f < LOUT ? 0 : (f < QUIET ? 1 : (f < DISS ? 2 : 3));
  if (mode !== 2) for (i = 0; i < 10; i++) {
    var gx = GXS[i], cx = gx, spd = 0, dd = -1;
    if (mode === 1) {
      var dl = 0;                    /* reaction delay non-decreasing from P1 back... */
      for (j = 1; j <= i; j++) dl += (H(j, 91) < 0.45 ? 0 : 1);
      dd = f - LOUT - dl;
      if (dd > 0) {
        var m = 1 - 0.013 * i;       /* ...and the car ahead is never the slower one: no overlap, ever */
        cx = gx + m * (dd <= 12 ? 0.133 * dd * dd : 19.15 + 3.19 * (dd - 12));
        spd = m * (dd <= 12 ? 0.266 * dd : 3.19);
      }
    }
    var xi = Math.round(cx);
    if (xi > C + 3) continue;
    var cl = xi < 0 ? 0 : (xi >= C ? C - 1 : xi);
    y = 9 + OFF[cl] + ((i % 2) ? 6 : 2);
    var col = LIV[i], p = mode === 3 ? (f - 195) / 4 : 1;
    var tl = Math.min(3, Math.round(spd * 1.05));
    for (k = 1; k <= tl; k++)          /* trail starts in the cell TOUCHING the car; k=1 never drops out */
      if (k === 1 || H(i, k, (f + k) & 7) < 1 - k * 0.22) S(xi - k, y, k === 1 ? '▒' : '░', col);
    if (mode === 0 && H(i, ((f / 5) | 0) % 40, 5) < 0.30) S(gx - 1, y, '░', LGRY);
    if (H(i, 1, 3) < p) S(xi, y, '▄', col);
    if (H(i, 2, 3) < p) S(xi + 1, y, '█', col);
    S(xi + 2, y, ' ', LGRY);           /* 1-cell black gap at the nose (silhouette rule) */
  }

  /* ---- the typed announcement -------------------------------------- */
  var MSG = "IT'S LIGHTS OUT AND AWAY WE GO.";
  if (f >= 94 && f < 152) {
    var n = Math.min(MSG.length, (f - 93) * 3), base = f >= 144 ? DGRY : LGRY;
    for (i = 0; i < n; i++)
      S(2 + i, 23, MSG.charAt(i),
        (base === LGRY && n < MSG.length && i >= n - 3) ? WHT : base);
  }
}) },

  { id: "apex-pit-stop", fps: 8, frames: 160, cols: 72, rows: 20,
    render: (function render(f, g) {
  var h = g.hash, F = g.frames;
  var RED = 4, BROWN = 6, LGRAY = 7, DGRAY = 8, LRED = 12, YEL = 14, WHITE = 15;
  var RAMP = '█▓▒░';
  var BAY0 = 5, BAY1 = 53, D0 = 25, D1 = 42;          /* garage bay / open mouth */
  var AP0 = 3, AP1 = 57, BX0 = 29, BX1 = 38, CX = 30; /* apron / painted box / park */
  var T_IN = 28, T_BOX = 48, T_UP = 50, T_OFF = 56;
  var A0 = 66, A1 = 70, T_DN = 74, T_REL = 84, T_DIM = 116;
  var FONT = ['111101101101111', '010010010010010', '111001111100111',
              '111001111001111', '101101111001001', '111100111001111',
              '111100111101111', '111001001001001', '111101111101111',
              '111101111001111'];
  var x, y, i, k;

  /* desynced per-cell phase bucket; every period divides F */
  function ph(px, py, s) { return (((f + ((h(px, py) * F) | 0)) % F) / s) | 0; }
  /* car sprite left edge over time (null = off panel) */
  function pos(fr) {
    var t;
    if (fr >= T_IN && fr < T_BOX) { t = (fr - T_IN) / (T_BOX - T_IN); return -9 + 39 * (1 - (1 - t) * (1 - t)); }
    if (fr >= T_BOX && fr < T_REL) return CX;
    if (fr >= T_REL && fr < T_REL + 20) { t = (fr - T_REL) / 20; return CX + 60 * t * t; }
    return null;
  }
  var cp = pos(f), cx = cp === null ? null : Math.round(cp);
  var up = f >= T_UP && f < T_DN;                      /* half a cell up on the jacks */
  /* bodywork colour beneath an overlay, so nothing punches the silhouette */
  function cbg(bx, by) {
    if (cx === null || by !== 13) return undefined;
    var d = bx - cx;
    return (d < 0 || d > 6) ? undefined : (d === 0 || d === 6) ? RED : LRED;
  }

  /* --- 1. dust in the garage air: background rail, 4-frame buckets --- */
  for (y = 0; y <= 12; y++) for (x = 0; x < g.cols; x++) {
    if (x >= 55 && y <= 8) continue;                   /* keep the board clean */
    if (h(x, y, ph(x, y, 4)) > (y > 7 ? 0.962 : 0.983 - y * 0.001))
      g.set(x, y, '·', (x > 5 && x < 18) || (x > 27 && x < 40) || (x > 42 && x < 55) ? BROWN : DGRAY);
  }

  /* --- 2. garage shell; the threshold ▀ is the floor the posts and stacks stand on,
           so nothing structural ever reaches row 13, the car lane --- */
  for (x = BAY0; x <= BAY1; x++) g.set(x, 0, '═', BROWN);
  g.set(6, 0, '╦', BROWN); g.set(24, 0, '╦', BROWN);
  g.set(43, 0, '╦', BROWN); g.set(52, 0, '╦', BROWN);
  for (y = 1; y <= 11; y++) {
    g.set(6, y, '║', BROWN); g.set(52, y, '║', BROWN);
    g.set(24, y, '║', BROWN); g.set(43, y, '║', BROWN);
  }
  for (x = BAY0; x < D0; x++) g.set(x, 12, '▀', BROWN);
  for (x = D1 + 1; x <= BAY1; x++) g.set(x, 12, '▀', BROWN);

  /* --- 3. strip lights; the pool of light under each one breathes --- */
  for (i = 0; i < 3; i++) {
    var lx = i === 0 ? 9 : i === 1 ? 31 : 46;
    g.set(lx + 2, 1, '│', BROWN);
    for (k = 0; k < 5; k++) g.set(lx + k, 2, '▄', BROWN);
    for (y = 3; y <= 5; y++) for (k = 0; k < 5; k++)
      if (h(lx + k, y, ph(lx + k, y, 8)) > (y - 3) * 0.36 + 0.24) g.set(lx + k, y, '░', BROWN);
  }

  /* --- 4. wheel racks + rim stacks, both up on the threshold --- */
  for (i = 0; i < 2; i++) {
    var rx = i ? 44 : 8;
    for (k = 0; k < 9; k++) g.set(rx + k, 7, '═', BROWN);
    for (k = 1; k < 8; k += 2) g.set(rx + k, 6, '○', DGRAY);
    for (y = 10; y <= 11; y++) for (k = 0; k < 3; k++) g.set((i ? 47 : 8) + k, y, '≡', DGRAY);
  }

  /* --- 5. floor: flat solid apron (reads unshaded), painted box, DGRAY fast lane;
           every cell scuffs on a 16-frame roll, so the dominant mass is never still --- */
  for (x = 0; x < g.cols; x++) {
    if (x >= AP0 && x <= AP1) {
      var inb = x >= BX0 && x <= BX1;
      var sh = cx !== null && x >= cx && x <= cx + 6 ? 1 : 0;    /* contact shadow */
      for (y = 14; y <= 15; y++)
        g.set(x, y, RAMP.charAt((y === 14 ? sh : 0) + (h(x, y, ph(x, y, 16)) > (inb ? 0.95 : 0.78) ? 1 : 0)), BROWN);
      var e16 = h(x, 16, ph(x, 16, 16));                          /* apron edge crumbles */
      if (e16 > (inb ? 0.12 : 0.36)) g.set(x, 16, RAMP.charAt((inb ? 1 : 2) + (e16 > 0.62 ? 0 : 1)), BROWN);
      var e17 = h(x, 17, ph(x, 17, 16));
      if (e17 > (inb ? 0.66 : 0.8)) g.set(x, 17, '░', BROWN);
    }
    g.set(x, 18, RAMP.charAt(1 + (h(x, 18, ph(x, 18, 16)) > 0.78 ? 1 : 0)), DGRAY);
    if (h(x, 19, ph(x, 19, 16)) > 0.88) g.set(x, 19, '░', DGRAY);
    if (x % 16 < 2) g.set(x, 18, '▀', LGRAY, DGRAY);              /* fast-lane dashes, backed */
  }
  for (x = BX0; x <= BX1; x++) g.set(x, 16, '▀', LGRAY, BROWN);   /* the box outweighs them */
  for (y = 14; y <= 15; y++) { g.set(BX0, y, '▀', LGRAY, BROWN); g.set(BX1, y, '▀', LGRAY, BROWN); }

  /* --- 6. timing board: dim last stop -> armed 0.0 -> live count -> held -> dim --- */
  g.set(55, 0, '╔', BROWN); g.set(70, 0, '╗', BROWN);
  g.set(55, 8, '╚', BROWN); g.set(70, 8, '╝', BROWN);
  for (x = 56; x < 70; x++) { g.set(x, 0, '═', BROWN); g.set(x, 8, '═', BROWN); }
  for (y = 1; y < 8; y++) { g.set(55, y, '║', BROWN); g.set(70, y, '║', BROWN); }
  g.text(58, 1, 'STOP TIME', BROWN);
  var v = (f >= 44 && f < T_REL) ? Math.max(0, ((f - T_BOX) * 2 / 3) | 0) : 24;
  var dc = (f > T_BOX && f < T_DIM) ? YEL : BROWN;
  for (i = 0; i < 2; i++) {
    var d = FONT[i ? v % 10 : (v / 10) | 0], dx = i ? 65 : 59;
    for (y = 0; y < 5; y++) for (k = 0; k < 3; k++)
      if (d.charAt(y * 3 + k) === '1') g.set(dx + k, 3 + y, '█', dc);
  }
  g.set(63, 7, '█', dc);

  /* --- 7. loose wheels: worn ones out right, fresh ones in from the left --- */
  for (i = 0; i < 2; i++) {
    var ox = CX + (i ? 5 : 2) + 3 * (f - T_OFF);
    if (f >= T_OFF && ox <= 71) g.set(ox, 13, '○', LGRAY);
    var ar = i ? A1 : A0, nx = CX + (i ? 5 : 2) - 3 * (ar - f);
    if (f >= T_OFF && f < ar && nx >= 0) g.set(nx, 13, '○', WHITE);
  }

  /* --- 8. crew: hold marks -> box -> back, over the wheels and under the car — one
           depth order all loop; idle wander on a 20-frame bucket --- */
  var IDL = [11, 15, 19, 45, 49, 53], WRK = [24, 26, 28, 38, 40, 42], ct = 0;
  if (f >= 40 && f < T_BOX) ct = (f - 40) / 8;
  else if (f >= T_BOX && f < 76) ct = 1;
  else if (f >= 76 && f < T_REL) ct = 1 - (f - 76) / 8;
  for (i = 0; i < 6; i++) {
    var s = (f + i * 23) % F, bk = (s / 20) | 0, e = s % 20;
    var t1 = (h(i, bk) * 3) | 0, t0 = (h(i, (bk + 7) % 8) * 3) | 0, dd = t1 - t0;
    var wx = IDL[i] + t0 + (dd > 0 ? 1 : dd < 0 ? -1 : 0) * Math.min((e / 2) | 0, dd < 0 ? -dd : dd);
    g.set(Math.round(wx + (WRK[i] - wx) * ct), 13, '☺', YEL);
  }

  /* --- 9. the car: one row of ▄ with two █ towers; the jacks lift it half a cell --- */
  if (cx !== null) {
    var pv = pos(f - 1), tl = pv === null ? 0 : Math.min(4, Math.round(cp - pv));
    for (i = 1; i <= tl; i++) g.set(cx - i, 13, i > 2 ? '░' : '▒', i > 2 ? RED : LRED);
    for (i = 0; i <= 6; i++) {
      var tall = i === 0 || i === 3, col = (i === 0 || i === 6) ? RED : LRED;
      if (up) { g.set(cx + i, 13, '▀', col); if (tall) g.set(cx + i, 12, '▄', col); }
      else g.set(cx + i, 13, tall ? '█' : '▄', col);
    }
    var wc = f < T_OFF ? LGRAY : WHITE;
    if (f < T_OFF || f >= A0) g.set(cx + 2, 13, '○', wc, LRED);
    if (f < T_OFF || f >= A1) g.set(cx + 5, 13, '○', wc, LRED);
  }

  /* --- 10. jacks + gun sparks: each burst sits on its own gun moment --- */
  if (cx !== null && f >= T_UP - 2 && f < T_DN) {
    g.set(cx - 1, 13, '▲', LGRAY); g.set(cx + 7, 13, '▲', LGRAY);
  }
  function gun(hi, f0) {
    if (cx === null || f < f0 || f > f0 + 2) return;
    var hx = cx + (hi ? 5 : 2);
    for (var j = 0; j < 4; j++) {
      var sx = hx + (j === 0 ? -1 : j === 1 ? 1 : 0), sy = 13 - (j === 3 ? 1 : 0);
      if (h(sx, sy, f) > 0.35) g.set(sx, sy, '*', h(f, j, hx) > 0.6 ? WHITE : YEL, cbg(sx, sy));
    }
  }
  gun(0, T_OFF - 3); gun(1, T_OFF - 3); gun(0, A0); gun(1, A1);

  /* --- 11. lollipop: flips on the drop, clear of the car before it goes --- */
  if (f >= 44 && f < T_REL - 1) {
    g.set(40, 9, f < 78 ? '▲' : '▼', YEL);
    for (y = 10; y <= 12; y++) g.set(40, y, '│', YEL);
  }
}) },

  { id: "apex-night-stint", fps: 8, frames: 288, cols: 72, rows: 20,
    render: (function render(f, g) {
  var C = g.cols, H = g.hash;
  var BLUE = 1, RED = 4, BROWN = 6, LBLUE = 9, LRED = 12, YEL = 14, WHT = 15;
  var x, y, i, k, d, h, r, dy, lv, px, wn, wm;
  function w(a, p) { return ((a % p) + p) % p; }

  /* parallax clocks — every period divides 288
     stars + haze ridge 1 cell/12f (p24) · skyline 1 cell/8f (p36)
     fence + streetlights 1 cell/4f (p72) · track 1 cell/1f (p72)      */
  var oA = (f / 12) | 0, oB = (f / 8) | 0, oM = (f / 4) | 0, oN = f;

  /* ---- 0-2 SKY: stars ride the deepest layer, hash-phased twinkle ----- */
  for (y = 0; y < 3; y++) for (x = 0; x < C; x++) {
    i = w(x + oA, 24);
    if (H(i, y, 11) < 0.08 && ((f + ((H(i, y, 23) * 16) | 0)) % 16) < 7)
      g.set(x, y, '·', WHT);
  }

  /* ---- 3-8 FAR CITY: p24 haze ridge behind a p36 solid skyline.
          Co-prime periods, so the silhouette never repeats in 72 cols.  */
  var HA = [], HB = [];
  for (i = 0; i < 24;) {
    k = 2 + ((H(i, 131) * 4) | 0); r = H(i, 137);
    h = r < 0.72 ? 0 : 1;
    for (d = 0; d < k && i + d < 24; d++) HA[i + d] = h;
    i += k;
  }
  for (i = 0, k = 0; i < 36;) {
    r = H(i, 97);
    if (k % 6 === 1) { d = 2 + ((H(i, 113) * 2) | 0); h = 4 + ((H(i, 117) * 3) | 0); }
    else { d = 3 + ((H(i, 71) * 4) | 0); h = r < 0.70 ? 0 : r < 0.88 ? 1 : 2; }
    for (y = 0; y < d && i + y < 36; y++) HB[i + y] = h;
    i += d; k++;
  }
  for (x = 0; x < C; x++) {
    var wa = w(x + oA, 24), wb = w(x + oB, 36);
    for (y = 9 - HA[wa]; y <= 8; y++) if (y >= 3) g.set(x, y, '▒', BLUE);
    h = HB[wb];
    for (y = 9 - h; y <= 8; y++) {
      if (y < 3) continue;
      if (y === 9 - h && H(wb, 151) < 0.45) { g.set(x, y, '▄', BLUE); continue; }
      if (H(wb, y, 41) < 0.13 && ((f + ((H(wb, y, 53) * 48) | 0)) % 48) < 31)
        g.set(x, y, '▒', LBLUE, BLUE);
      else g.set(x, y, '█', BLUE);
    }
  }

  /* ---- 9 sodium haze lying on the rooftops ---------------------------- */
  for (x = 0; x < C; x++) if (H(w(x + oM, 72), 9, 29) < 0.07) g.set(x, 9, '░', BLUE);

  /* ---- 10-13 MID: catch fence, posts + mesh, on streetlight poles ----- */
  for (x = 0; x < C; x++) {
    wm = w(x + oM, 72);
    if (wm % 18 === 0) {                         /* streetlight */
      g.set(x, 7, '☼', YEL);
      if (((f + ((H(wm, 17) * 12) | 0)) % 12) < 5) g.set(x, 8, '░', YEL);
      else g.set(x, 8, '│', BLUE);
      for (y = 9; y <= 13; y++) g.set(x, y, '│', BLUE);
      continue;
    }
    if (wm % 12 === 0) { for (y = 10; y <= 13; y++) g.set(x, y, '│', BLUE); continue; }
    for (y = 10; y <= 13; y++) if (H(wm, y, 61) < 0.065) g.set(x, y, '▒', BLUE);
  }

  /* ---- light field over rows 14-18, levels 0..3, built before painting  */
  var L = [];
  for (i = 0; i < 5 * C; i++) L[i] = 0;

  /* lamp pools stay welded to their poles: same 1 cell/4f rate ---------- */
  for (k = 0; k < 4; k++) {
    px = w(18 * k - oM, 72);
    for (dy = 1; dy <= 3; dy++) {
      h = 1 + dy;
      for (d = -h; d <= h; d++) {
        x = px + d; if (x < 0 || x >= C) continue;
        r = d < 0 ? -d : d;
        lv = (r * 3 < h * 2) ? 2 : 1;
        if (((f + ((H(px + dy, 5) * 16) | 0)) % 16) < 5) lv -= 1;
        if (lv > L[dy * C + x]) L[dy * C + x] = lv;
      }
    }
  }

  /* ---- the hero. The camera pans with it, so it holds frame while the
          world streams past — that IS this panel's parallax.            */
  var CX = 27;
  if (f >= 104 && f < 152) { d = f - 104; CX += ((d < 24 ? d : 48 - d) > 11 ? 2 : 1); }

  /* beam wash on the tarmac: dominant-pair, so the wedge can be wide;
     only its core spends the YELLOW accent budget                       */
  for (d = 1; d <= 30; d++) {
    x = CX + d; if (x >= C) break;
    h = d <= 5 ? 0 : d <= 13 ? 1 : 2;
    r = d <= 8 ? 3 : d <= 17 ? 2 : 1;
    for (dy = -h; dy <= h; dy++) {
      y = 16 + dy; if (y < 14 || y > 18) continue;
      lv = r - (dy ? 1 : 0);
      if (d > 18 && H(x, y, (f / 2) | 0) < (d - 18) * 0.05) lv -= 1;
      if (lv > 0 && lv > L[(y - 14) * C + x]) L[(y - 14) * C + x] = lv;
    }
  }

  /* ---- 14 BARRIER WALL: solid ▀; its dark half IS the black gap line -- */
  for (x = 0; x < C; x++) {
    wn = w(x - oN, 72);
    g.set(x, 14, wn % 9 === 0 ? '█' : '▀', L[x] > 0 ? LBLUE : BLUE);
  }

  /* ---- 15-17 TRACK: laid down as solid tarmac, light only overlays it - */
  for (x = 0; x < C; x++) {
    wn = w(x - oN, 72);
    for (y = 15; y <= 17; y++) {
      lv = L[(y - 14) * C + x];
      if (lv >= 3) g.set(x, y, '▓', LBLUE, BLUE);
      else if (lv === 2) g.set(x, y, '▒', LBLUE, BLUE);
      else if (lv === 1) g.set(x, y, '░', LBLUE, BLUE);
      else g.set(x, y, y === 17 ? '▓' : '█', BLUE);
    }
    if (wn % 12 < 3 && L[2 * C + x] < 2) g.set(x, 16, '▀', LBLUE, BLUE);
    if (wn % 36 < 5) g.set(x, 15, '▀', (wn % 3) ? RED : WHT, BLUE);
    lv = L[4 * C + x];
    if (lv > 0) g.set(x, 18, lv > 1 ? '▒' : '░', LBLUE);
    else if (wn % 24 < 4) g.set(x, 18, '▀', BLUE);
    if (w(x - oN, 24) < 4) g.set(x, 19, '░', BLUE);
  }

  /* ---- headlight cone core: a long forward triangle down the YELLOW
          ramp; the ±2 splay beyond it is carried by the blue wash       */
  for (d = 1; d <= 9; d++) {
    x = CX + d; if (x >= C) break;
    k = ((f + ((H(x, 3) * 8) | 0)) % 8) < 3 ? 1 : 0;      /* ±1 ramp breath */
    r = 9 - d + k;
    g.set(x, 16, r >= 8 ? '█' : r >= 6 ? '▓' : r >= 3 ? '▒' : '░', r >= 1 ? YEL : BROWN);
    if (d >= 6 && d <= 8) { g.set(x, 15, '▄', BROWN, BLUE); g.set(x, 17, '▀', BROWN, BLUE); }
  }

  /* ---- hero car sprite, taillight and trail --------------------------- */
  g.set(CX, 16, '▄', WHT, BLUE);
  g.set(CX - 1, 16, '█', WHT);
  g.set(CX - 2, 16, '▄', WHT, BLUE);
  g.set(CX - 3, 16, '▄', LRED, BLUE);
  for (k = 1; k <= 3; k++)
    if (H(CX - 3 - k, f, 5) > 0.25 + k * 0.16)
      g.set(CX - 3 - k, 16, '░', k < 2 ? LRED : RED);
  k = ((f / 4) | 0) & 1;
  g.set(CX - 1, 17, k ? '▀' : '▄', LBLUE, BLUE);
  g.set(CX - 2, 17, k ? '▄' : '▀', LBLUE, BLUE);

  /* ---- loop event: the hero laps a slower car down the far lane ------- */
  if (f >= 96 && f < 152) {
    d = 84 - (f - 96) * 2;
    h = (d > CX && d < CX + 26) ? LBLUE : BLUE;  /* caught in the beam */
    g.set(d, 15, '▄', h, BLUE);
    g.set(d + 1, 15, '█', h, BLUE);
    g.set(d + 2, 15, '▄', LRED, BLUE);
    for (k = 3; k <= 5; k++)
      if (H(d + k, f, 7) > 0.35 + (k - 3) * 0.18) g.set(d + k, 15, '░', k < 4 ? LRED : RED);
  }
}) },

  { id: "apex-gravel-yellow", fps: 8, frames: 240, cols: 72, rows: 20,
    render: (function render(f, g) {
  var C = g.cols, R = g.rows, H = g.hash;
  var RED = 4, BROWN = 6, LGRAY = 7, LRED = 12, YELLOW = 14, WHITE = 15;
  var x, y, i, k, a;

  var occ = [], moat = [];
  for (i = 0; i < C * R; i++) { occ[i] = 0; moat[i] = 0; }
  var free = function (px, py) {
    return px >= 0 && py >= 0 && px < C && py < R && !occ[py * C + px];
  };
  var put = function (px, py, ch, c) {
    px |= 0; py |= 0;
    if (px < 0 || py < 0 || px >= C || py >= R) return;
    occ[py * C + px] = 1; g.set(px, py, ch, c);
  };
  var ring = function (px, py, r, arr) {
    for (var i2 = -r; i2 <= r; i2++) for (var j2 = -r; j2 <= r; j2++) {
      var mx = px + i2, my = py + j2;
      if (mx >= 0 && my >= 0 && mx < C && my < R) arr[my * C + mx] = 1;
    }
  };

  // ---- geometry: the track recedes up-right, runoff + armco open beneath ----
  var kb = [], bar = [];
  for (x = 0; x < C; x++) {
    var u = x / (C - 1);
    var kk = 12 - Math.round(5 * (0.35 * u + 0.65 * u * u));
    kb.push(kk); bar.push(kk + 7);
  }

  // ---- the incident: the only light in the panel ----
  var WB = bar[46], FX = 46, FY = WB - 2;
  var lit = function (px, py) {
    var dx = px - FX, dy = (py - FY) * 1.7;
    return Math.sqrt(dx * dx + dy * dy);
  };
  var lum = 0.58 + 0.42 * H(9001, (f / 3) | 0);
  var bel = 0.84 + 0.30 * H(3307, ((f + 2) / 5) | 0);
  var bp = ((f + 6) % 24) < 12;

  // ---- sprites claim silhouette + black gap before any field is drawn ----
  var car = [[44, WB - 1, '▄'], [45, WB - 1, '█'], [46, WB - 1, '█'],
             [47, WB - 1, '▄'], [47, WB, '▀']];
  for (i = 0; i < car.length; i++) {
    ring(car[i][0], car[i][1], 1, occ);
  }
  ring(FX, FY, 1, moat); ring(FX, FY - 1, 1, moat);
  var MX = 58, MY = bar[58] + 2;
  ring(MX, MY, 1, occ); ring(MX - 1, MY, 1, occ); ring(MX + 1, MY, 1, occ);
  var BY = kb[3] + 1;
  for (i = 0; i < 2; i++) ring(3 + i * 3, BY, 1, occ);
  var sx = -99, sy = 0;
  if (f >= 8 && f < 168) {
    sx = -4 + ((f - 8) >> 1);
    sy = kb[sx < 0 ? 0 : (sx > C - 1 ? C - 1 : sx)] - 1;
    for (i = -2; i <= 0; i++) ring(sx + i, sy, 1, occ);
  }

  // ---- 1. asphalt: one flat RED band, value stepping down the light pool ----
  for (x = 0; x < C; x++) {
    for (y = kb[x] - (x < 16 ? 2 : 1); y <= kb[x] - 1; y++) {
      if (!free(x, y)) continue;
      var d0 = lit(x, y);
      var lv = d0 < 14 ? 2 : (d0 < 27 ? 1 : 0);
      var pa = (H(x, y, 41) * 20) | 0;
      if (H(x, y, 100 + (((f + pa) % 20) >> 2)) < 0.12) lv += lv > 0 ? -1 : 1;
      put(x, y, lv > 1 ? '█' : (lv ? '▓' : '▒'), RED);
    }
    if (x >= 8 && x <= 46 && free(x, kb[x])) {
      var kc = (((x - 8) >> 1) & 1) ? LRED : RED;
      if (x < 14 && bp) kc = kc === LRED ? RED : LRED;
      put(x, kb[x], '▀', kc);
    }
  }

  // ---- 2. gravel bed: a flat pool of firelight, glinting, dark beyond ----
  for (x = 6; x < C; x++) {
    for (y = kb[x] + 1; y < bar[x]; y++) {
      if (!free(x, y) || moat[y * C + x]) continue;
      var d = lit(x, y);
      if (d > 18) continue;
      var ph = (H(x, y, 5) * 24) | 0;
      var sp = H(x, y, 200 + (((f + ph) % 24) / 3 | 0));
      if (d > 9 && H(x, y, 77) > 0.72 - (d - 9) * 0.104) continue;
      put(x, y, (sp > 0.80 - (d < 8 ? 0.34 : 0) - 0.10 * lum) ? '▒' : '░', RED);
    }
  }

  // ---- 3. smoke: a plume with width, advecting up-left, gone by mid-panel.
  //         It passes IN FRONT of the gravel bed, so its base stays connected. ----
  for (var p = 0; p < 15; p++) {
    a = (f + p * 17) % 24;
    var qy = (FY - 2) - ((a * 5) >> 3);
    var qx = FX - ((a * 3) >> 2);
    if (qy < 0 || H(p, a, 31) > 0.95 - a * 0.030) continue;
    var sw = 1 + (a > 6 ? 1 : 0) + (a > 14 ? 1 : 0);
    for (k = -sw; k <= sw; k++) {
      if (k && H(p, a, k, 37) > 0.60 - a * 0.017 - (k < 0 ? -k : k) * 0.06) continue;
      var mx2 = qx + k;
      if (free(mx2, qy) || (qy > kb[mx2 < 0 ? 0 : (mx2 > C - 1 ? C - 1 : mx2)] && !moat[qy * C + mx2]))
        put(mx2, qy, (a < 6 && k > -1 && k < 1) ? '▒' : '░', RED);
    }
  }

  // ---- 4. the slide: gravel ploughed from the kerb down to the wreck ----
  for (x = 30; x <= 43; x++) {
    y = kb[x] + 1 + Math.round((x - 30) * 4 / 13);
    if (!free(x, y) || H(x, 401) < 0.18) continue;
    put(x, y, '▒', RED);
  }

  // ---- 5. armco: double-line rail on posts, stepping up as it recedes ----
  for (x = 12; x < C; x++) {
    var bb = bar[x], nb = bar[x + 1 < C ? x + 1 : x];
    var pc = (H(x, 71) * 20) | 0;
    var cb = lit(x, bb) < 4 + 21 * lum * H(x, 300 + (((f + pc) % 20) >> 2)) ? LRED : RED;
    if (free(x, bb)) put(x, bb, nb < bb ? '╝' : '═', cb);
    if (nb < bb && free(x, nb)) put(x, nb, '╔', cb);
    if (x % 6 === 4 && free(x, bb + 1)) put(x, bb + 1, '║', RED);
  }

  // ---- 6. the wreck, nose punched through the rail ----
  for (i = 0; i < car.length; i++) put(car[i][0], car[i][1], car[i][2], LRED);

  // ---- 7. engine-cover fire: dark base, rare top-tier spike ----
  var fl = [[46, FY, 1.00], [45, FY, 0.74], [46, FY - 1, 0.66], [46, FY - 2, 0.34]];
  for (i = 0; i < fl.length; i++) {
    var fx = fl[i][0], fy = fl[i][1];
    var pf = (H(fx, fy, 5) * 12) | 0;
    var fu = H(fx, fy, (f + pf) % 12);
    var hv = fl[i][2] * (0.30 + 1.55 * fu * fu * fu) * bel * (0.74 + 0.46 * lum);
    var fg, fc;
    if (hv > 1.62) { fg = '█'; fc = WHITE; }
    else if (hv > 1.06) { fg = '█'; fc = YELLOW; }
    else if (hv > 0.74) { fg = '█'; fc = LRED; }
    else if (hv > 0.50) { fg = '▓'; fc = LRED; }
    else if (hv > 0.30) { fg = '▒'; fc = LRED; }
    else if (hv > 0.16) { fg = '░'; fc = RED; }
    else continue;
    put(fx, fy, fg, fc);
  }

  // ---- 8. marshal at his post, 2-pose yellow flag in his hand ----
  put(MX, MY, '☺', LGRAY);
  var hx = (f % 6) < 3 ? MX - 1 : MX + 1;
  put(hx, MY, '▀', YELLOW);
  put(hx, MY - 1, '▄', YELLOW);

  // ---- 9. double waved yellow at the trackside boards ----
  for (i = 0; i < 2; i++) {
    put(3 + i * 3, BY, '▲', (i === 0) === bp ? YELLOW : BROWN);
    put(3 + i * 3, BY + 1, '║', RED);
  }

  // ---- 10. safety car: one slow transit per loop ----
  if (sx > -99) {
    for (i = 3; i <= 5; i++) {
      var tx = sx - i;
      if (tx >= 0 && tx < C) put(tx, kb[tx] - 1, '░', LGRAY);
    }
    put(sx - 2, sy, '▄', LGRAY);
    put(sx - 1, sy, '█', LGRAY);
    put(sx, sy, '▄', WHITE);
    put(sx - 1, sy - 1, '▄', YELLOW);
  }
}) },

];

/* ---------------- renderer ---------------- */

var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var panels = [];

function findScene(id) {
  for (var i = 0; i < SCENES.length; i++) if (SCENES[i].id === id) return SCENES[i];
  return null;
}

function sizePanel(p) {
  var wCss = p.cv.parentElement.clientWidth;
  if (!wCss) return;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var cellW = (wCss / p.sc.cols) * dpr;
  var cellH = cellW * 1.62;
  p.cv.width = Math.round(p.sc.cols * cellW);
  p.cv.height = Math.round(p.sc.rows * cellH);
  p.cellW = cellW;
  p.cellH = cellH;
  p.font = "600 " + Math.ceil(cellH * 0.82) + "px " + FONT_STACK;
  p.dirty = true;
}

function drawPanel(p) {
  var ctx = p.ctx;
  var g = p.grid;
  var cw = p.cellW, chh = p.cellH;
  ctx.fillStyle = "#0b0b15";
  ctx.fillRect(0, 0, p.cv.width, p.cv.height);
  ctx.font = p.font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  var lastFill = "";
  function fill(color) {
    if (color !== lastFill) { ctx.fillStyle = color; lastFill = color; }
  }
  for (var y = 0; y < g.rows; y++) {
    for (var x = 0; x < g.cols; x++) {
      var i = y * g.cols + x;
      var ch = g.ch[i];
      var b = g.bg[i];
      if (ch === " " && b === NO_BG) continue;
      if (b !== NO_BG) {
        fill(PALETTE[b]);
        ctx.fillRect(x * cw, y * chh, cw + 0.5, chh + 0.5);
      }
      if (ch === " ") continue;
      fill(PALETTE[g.co[i]]);
      var alpha = BLOCKS[ch];
      if (alpha !== undefined) {
        if (alpha < 1) ctx.globalAlpha = alpha;
        ctx.fillRect(x * cw, y * chh, cw + 0.5, chh + 0.5);
        ctx.globalAlpha = 1;
      } else if (ch === HALF_TOP) {
        ctx.fillRect(x * cw, y * chh, cw + 0.5, chh / 2);
      } else if (ch === HALF_BOTTOM) {
        ctx.fillRect(x * cw, y * chh + chh / 2, cw + 0.5, chh / 2);
      } else {
        ctx.fillText(ch, x * cw + cw / 2, y * chh + chh * 0.56);
      }
    }
  }
}

function renderPanelFrame(p) {
  p.grid.clear();
  try {
    p.sc.render(p.f, p.grid);
  } catch (err) {
    p.running = false;
    return;
  }
  drawPanel(p);
}

function tick(t) {
  for (var i = 0; i < panels.length; i++) {
    var p = panels[i];
    if (!p.visible) continue;
    if (p.dirty) {
      p.dirty = false;
      renderPanelFrame(p);
    }
    if (!p.running) continue;
    if (t - p.last >= 1000 / p.sc.fps) {
      p.last = t;
      p.f = (p.f + 1) % p.sc.frames;
      renderPanelFrame(p);
    }
  }
  window.requestAnimationFrame(tick);
}

function mountPanels() {
  var canvases = document.querySelectorAll("canvas[data-scene]");
  var io = "IntersectionObserver" in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          for (var i = 0; i < panels.length; i++) {
            if (panels[i].cv === e.target) panels[i].visible = e.isIntersecting;
          }
        });
      }, { rootMargin: "80px" })
    : null;

  canvases.forEach(function (cv) {
    var sc = findScene(cv.getAttribute("data-scene"));
    var fig = cv.closest("figure");
    if (!sc) {
      if (fig) fig.classList.add("gif--missing");
      return;
    }
    var p = {
      cv: cv,
      ctx: cv.getContext("2d"),
      sc: sc,
      grid: new Grid(sc.cols, sc.rows, sc.frames),
      f: REDUCED ? Math.floor(sc.frames / 2) : 0,
      last: 0,
      running: !REDUCED,
      visible: !io,
      dirty: true,
    };
    sizePanel(p);
    cv.addEventListener("click", function () {
      if (REDUCED) return;
      p.running = !p.running;
    });
    if (io) io.observe(cv);
    panels.push(p);
  });

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    if (resizeTimer) window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      panels.forEach(sizePanel);
    }, 150);
  });

  window.requestAnimationFrame(tick);
}


/* ---------------- live timing ---------------- */

var LAP_NAMES = ["Formation Lap", "Cipher Chicane", "Telemetry Straight", "Regex Hairpin", "Injection Straight"];
var clockOffset = 0;   // serverNow - clientNow
var liveCars = [];
var liveSocket = null;
var retryDelay = 1000;

function fmtTime(ms) {
  if (ms === null || ms === undefined) return "—";
  var s = ms / 1000;
  var m = Math.floor(s / 60);
  var rest = (s - m * 60);
  return m > 0 ? m + ":" + (rest < 10 ? "0" : "") + rest.toFixed(3) : rest.toFixed(3) + "s";
}

function el(tag, cls, text) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/* --- cars currently on track --- */

function paintOnTrack() {
  var wrap = document.getElementById("ontrack-body");
  var empty = document.getElementById("ontrack-empty");
  if (!wrap) return;
  if (!liveCars.length) {
    wrap.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  wrap.innerHTML = "";
  liveCars.forEach(function (c) {
    var row = el("div", "car");

    var id = el("div", "car-id");
    id.appendChild(el("span", "car-handle", c.handle));
    id.appendChild(el("span", "car-tag", "#" + c.car));
    row.appendChild(id);

    // corner progress: five pips, filled up to the corner they are on
    var track = el("div", "car-track");
    for (var i = 1; i <= c.of; i++) {
      var pip = el("span", "pip" + (i < c.lap ? " pip--done" : (i === c.lap ? " pip--active" : "")));
      pip.title = LAP_NAMES[i - 1] || ("Corner " + i);
      track.appendChild(pip);
    }
    row.appendChild(track);

    var corner = el("div", "car-corner", "C" + c.lap + " · " + (LAP_NAMES[c.lap - 1] || ""));
    row.appendChild(corner);

    var t = el("div", "car-time");
    t.setAttribute("data-started", c.started);
    t.textContent = fmtTime(Date.now() + clockOffset - c.started);
    row.appendChild(t);

    var pen = el("div", "car-pen", c.penalties ? "+" + c.penalties * 15 + "s" : "—");
    if (c.penalties) pen.classList.add("car-pen--hit");
    row.appendChild(pen);

    wrap.appendChild(row);
  });
}

function tickClocks() {
  var now = Date.now() + clockOffset;
  document.querySelectorAll(".car-time[data-started]").forEach(function (t) {
    t.textContent = fmtTime(now - Number(t.getAttribute("data-started")));
  });
  window.requestAnimationFrame(function () { window.setTimeout(tickClocks, 100); });
}

/* --- classification --- */

function paintClassification(entries) {
  var body = document.getElementById("lb-body");
  var empty = document.getElementById("lb-empty");
  var table = document.getElementById("lb-table");
  if (!body) return;
  if (!entries || !entries.length) {
    table.hidden = true;
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  body.innerHTML = "";
  var leader = entries[0].total_ms;
  entries.forEach(function (e) {
    var tr = document.createElement("tr");
    tr.appendChild(el("td", "lb-pos", e.pos));
    tr.appendChild(el("td", null, e.handle));
    tr.appendChild(el("td", "lb-time", fmtTime(e.total_ms)));
    tr.appendChild(el("td", "lb-gap", e.pos === 1 ? "—" : "+" + fmtTime(e.total_ms - leader)));
    tr.appendChild(el("td", "lb-pen", e.penalties ? "+" + e.penalties * 15 + "s" : "—"));
    // per-corner splits, so you can see WHERE a car lost time
    var sp = el("td", "lb-splits");
    (e.splits || []).forEach(function (ms, i) {
      var chip = el("span", "split", (ms / 1000).toFixed(1));
      chip.title = (LAP_NAMES[i] || "Corner " + (i + 1)) + ": " + fmtTime(ms);
      sp.appendChild(chip);
    });
    tr.appendChild(sp);
    body.appendChild(tr);
  });
  table.hidden = false;
}

/* --- meeting stats --- */

function paintStats(stats) {
  if (!stats) return;
  var set = function (id, val) {
    var e = document.getElementById(id);
    if (e) e.textContent = val;
  };
  set("stat-entries", stats.entries);
  set("stat-finishers", stats.finishers);
  set("stat-best", stats.best_ms ? fmtTime(stats.best_ms) : "—");

  var wrap = document.getElementById("corner-bars");
  if (!wrap || !stats.corner_avg_ms) return;
  var max = Math.max.apply(null, stats.corner_avg_ms.map(function (v) { return v || 0; })) || 1;
  wrap.innerHTML = "";
  stats.corner_avg_ms.forEach(function (ms, i) {
    var row = el("div", "cbar");
    row.appendChild(el("span", "cbar-name", (i + 1) + " · " + (LAP_NAMES[i] || "")));
    var rail = el("div", "cbar-rail");
    var fill = el("div", "cbar-fill");
    fill.style.width = ms ? Math.max(2, Math.round((ms / max) * 100)) + "%" : "0";
    rail.appendChild(fill);
    row.appendChild(rail);
    row.appendChild(el("span", "cbar-val", ms ? (ms / 1000).toFixed(1) + "s" : "—"));
    wrap.appendChild(row);
  });
}

/* --- race radio: the event ticker --- */

function radio(text, kind) {
  var feed = document.getElementById("radio-feed");
  if (!feed) return;
  var line = el("div", "radio-line" + (kind ? " radio-line--" + kind : ""));
  var now = new Date();
  line.appendChild(el("span", "radio-t",
    String(now.getHours()).padStart(2, "0") + ":" +
    String(now.getMinutes()).padStart(2, "0") + ":" +
    String(now.getSeconds()).padStart(2, "0")));
  line.appendChild(el("span", "radio-msg", text));
  feed.insertBefore(line, feed.firstChild);
  while (feed.children.length > 12) feed.removeChild(feed.lastChild);
  var placeholder = document.getElementById("radio-empty");
  if (placeholder) placeholder.hidden = true;
}

function applyEvent(ev) {
  if (ev.on_track) { liveCars = ev.on_track; paintOnTrack(); }
  if (ev.classification) paintClassification(ev.classification);
  if (ev.stats) paintStats(ev.stats);

  if (ev.type === "snapshot") {
    if (typeof ev.server_now === "number") clockOffset = ev.server_now - Date.now();
    return;
  }
  if (ev.type === "entry") {
    radio(ev.handle + " leaves the pit lane.", "go");
  } else if (ev.type === "corner") {
    radio(ev.handle + " clears " + (LAP_NAMES[ev.lap - 1] || "corner " + ev.lap) +
          " in " + fmtTime(ev.split_ms) + ".");
  } else if (ev.type === "penalty") {
    radio(ev.handle + " runs wide at " + (LAP_NAMES[ev.lap - 1] || "corner " + ev.lap) +
          " — fifteen second penalty.", "pen");
  } else if (ev.type === "finish") {
    radio(ev.handle + " takes P" + ev.pos + " — " + fmtTime(ev.total_ms) + ".", "fin");
  }
}

function setLiveState(on) {
  var dot = document.getElementById("live-dot");
  if (dot) dot.classList.toggle("live-dot--on", !!on);
  var label = document.getElementById("live-label");
  if (label) label.textContent = on ? "LIVE" : "RECONNECTING";
}

function connectLive() {
  var proto = location.protocol === "https:" ? "wss:" : "ws:";
  var ws;
  try {
    ws = new WebSocket(proto + "//" + location.host + "/apex/api/live");
  } catch (e) {
    return window.setTimeout(connectLive, retryDelay);
  }
  liveSocket = ws;
  ws.addEventListener("open", function () {
    retryDelay = 1000;
    setLiveState(true);
  });
  ws.addEventListener("message", function (e) {
    try { applyEvent(JSON.parse(e.data)); } catch (_) { /* ignore malformed frame */ }
  });
  ws.addEventListener("close", function () {
    setLiveState(false);
    retryDelay = Math.min(retryDelay * 2, 15000);
    window.setTimeout(connectLive, retryDelay);
  });
  ws.addEventListener("error", function () { try { ws.close(); } catch (_) {} });
}

function bootLive() {
  // Paint immediately from the REST snapshot, then let the socket take over —
  // the board is never blank while the WebSocket handshakes.
  fetch("/apex/api/live")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (snap) { if (snap) applyEvent(Object.assign({ type: "snapshot" }, snap)); })
    .catch(function () { /* worker not running — stay quiet */ })
    .finally(function () { connectLive(); tickClocks(); });
}

function mountCopyButtons() {
  document.querySelectorAll(".js-copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var pre = document.getElementById(btn.getAttribute("data-target"));
      if (!pre || !navigator.clipboard) return;
      navigator.clipboard.writeText(pre.textContent.trim()).then(function () {
        var old = btn.textContent;
        btn.textContent = "copied";
        window.setTimeout(function () { btn.textContent = old; }, 1400);
      });
    });
  });
}

/* ---------------- boot ---------------- */

document.addEventListener("DOMContentLoaded", function () {
  mountPanels();
  mountCopyButtons();
  bootLive();
});
