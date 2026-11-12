/* LLMCraft — ANSI panel engine + waitlist form. No monospace anywhere:
 * scenes draw glyphs per grid cell on canvas (IBM Plex Sans + symbol
 * fallback), so the page type stays proportional. Palette: classic
 * pre-v50 DF/VGA values. Cells carry optional background color — the
 * ANSI fg-on-bg attribute — and ░▒▓ render as fg at 25/50/75% alpha. */

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
 * Seven scenes from the researched style bible (docs/style-bible.md),
 * each artist-authored, harness-tested, and adversarially checked.
 * render(f, g) is pure: frame index + hash only.
 */

var SCENES = [
  { id: "hero-strike-the-earth", fps: 8, frames: 200, cols: 96, rows: 24,
    render: (function render(f, g) {
  const H = g.hash;
  const L = Math.min(Math.floor(f / 7), 24);
  const head = 53 + L;
  const tr = x => Math.min(14, 12 + Math.floor((x - 53) / 9));

  for (let y = 0; y < 4; y++) for (let x = 0; x < 96; x++)
    if (H(x, y, 11) < 0.02) g.set(x, y, "'", 8);

  const GG = ['.', ',', "'", '`'];
  for (let x = 0; x < 96; x++) {
    if (x === 10) continue;
    const ph = Math.floor(H(x, 41) * 25);
    const q = Math.floor(((f + ph) % 200) / 25);
    g.set(x, 4, GG[Math.floor(H(x, q, 42) * 4)], 2);
  }
  const TX = [16, 24, 33, 45, 55, 63, 74, 83, 90];
  for (let i = 0; i < TX.length; i++) g.set(TX[i], 3, H(TX[i], 7) < 0.62 ? '♠' : '↑', 2);
  g.set(29, 3, 'τ', 2); g.set(68, 3, 'τ', 2);
  g.set(4, 3, 'W', 6); g.set(6, 3, '▬', 6); g.set(7, 3, '▬', 6);

  for (let y = 5; y <= 8; y++) for (let x = 0; x < 96; x++) {
    let c = (y === 5 || H(x, y, 21) < 0.07) ? '▓' : '█';
    g.set(x, y, c, 6);
  }
  for (let x = 0; x < 96; x++) {
    const r = H(x, 9, 33);
    if (r < 0.20) g.set(x, 9, '░', 6);
    else if (r < 0.36) g.set(x, 9, '░', 8);
  }
  for (let y = 10; y <= 15; y++) for (let x = 0; x < 96; x++) {
    const r = H(x, y, 21);
    if (y <= 12) g.set(x, y, r < 0.08 ? '█' : '▓', 7);
    else g.set(x, y, r < 0.08 ? '▓' : '█', 6);
  }

  const V1 = [[60,10],[61,11],[62,11],[63,12],[64,12]];
  for (const v of V1) g.set(v[0], v[1], '£', 7, 8);

  const room = (x0, x1) => {
    for (let y = 11; y <= 13; y++) for (let x = x0 + 1; x < x1; x++) g.set(x, y, ' ', 0);
    for (let x = x0; x <= x1; x++) { g.set(x, 10, '═', 7); g.set(x, 14, '═', 7); }
    g.set(x0, 10, '╔', 7); g.set(x1, 10, '╗', 7);
    g.set(x0, 14, '╚', 7); g.set(x1, 14, '╝', 7);
    for (let y = 11; y <= 13; y++) { g.set(x0, y, '║', 7); g.set(x1, y, '║', 7); }
  };
  room(14, 20); room(24, 34); room(40, 48);

  const inRoom = x => (x > 14 && x < 20) || (x > 24 && x < 34) || (x > 40 && x < 48);
  for (let x = 11; x <= 52; x++) {
    g.set(x, 13, ' ', 0);
    if (!inRoom(x) && H(x, 3) < 0.3) g.set(x, 13, '•', 8);
  }
  for (const dx of [14, 20, 24, 34, 40, 48]) g.set(dx, 13, '+', 6);

  g.set(17, 13, 'Θ', 7);
  g.set(27, 13, '╥', 8); g.set(28, 13, '╤', 7); g.set(29, 13, '╥', 8);
  g.set(31, 13, '╥', 8); g.set(32, 13, '╤', 7); g.set(33, 13, '╥', 8);
  g.set(44, 13, 'σ', 7); g.set(42, 13, '≡', 8);

  g.set(10, 4, '>', 7);
  for (let y = 5; y <= 12; y++) g.set(10, y, 'X', 8);
  g.set(10, 13, '<', 7);

  const VC = [[77,14],[77,15],[78,13],[78,14],[78,15],[79,12],[79,13],[79,14],[80,13],[80,14],[80,15],[81,12],[81,13],[82,13],[82,14]];
  let vc = 11;
  if (f >= 168 && f < 176) vc = (Math.floor((f - 168) / 3) % 2 === 0) ? 3 : 11;
  for (const v of VC) g.set(v[0], v[1], '█', vc);

  for (let x = 0; x < 96; x++) if (H(x, 16, 33) < 0.3) g.set(x, 16, '░', 8);

  for (let y = 17; y <= 21; y++) for (let x = 0; x < 96; x++) {
    const r = H(x, y, 22);
    g.set(x, y, r < 0.10 ? '▓' : (r < 0.14 ? '░' : '█'), 6);
  }
  const V2 = [[14,18],[15,18],[16,19],[17,19],[18,20],[70,17],[71,17],[72,18],[73,18]];
  for (const v of V2) g.set(v[0], v[1], '£', 7, 8);
  g.set(29, 19, '☼', 14); g.set(31, 19, '☼', 14);
  g.set(30, 18, '☼', f % 100 < 2 ? 15 : 14);

  for (let x = 0; x < 96; x++) if (H(x, 99) < 0.15) {
    const ph = Math.floor(H(x, 43) * 8);
    const st = Math.floor(((f + ph) % 200) / 8);
    if (H(x, st, 5) < 0.6) g.set(x, 22, '░', 4);
  }
  for (let x = 0; x < 96; x++) {
    const r = H(x, 23, f >> 1);
    if (r < 0.70) g.set(x, 23, '█', 4);
    else if (r < 0.94) g.set(x, 23, '▓', 4);
    else g.set(x, 23, '≈', 12, 4);
  }

  for (let x = 53; x < head; x++) {
    const t = tr(x);
    g.set(x, t, ' ', 0); g.set(x, t + 1, ' ', 0);
    if (x === 62 || x === 71) g.set(x, t + 1, '▲', 8);
    else if (H(x, 4) < 0.35) g.set(x, t + 1, '•', 7);
  }

  if (f >= 196) {
    const p = (f - 195) / 4;
    for (let x = 53; x < 77; x++) {
      const t = tr(x);
      for (let y = t; y <= t + 1; y++)
        if (H(x, y, 777) < p) g.set(x, y, y <= 12 ? (H(x, y, 21) < 0.08 ? '█' : '▓') : (H(x, y, 21) < 0.08 ? '▓' : '█'), y <= 12 ? 7 : 6);
    }
  }

  const a = f % 7;
  if (f > 0 && f < 172 && L > 0) {
    const xp = head - 1, t = tr(xp);
    if (a < 2) g.set(xp, t, '▒', 8);
    else if (a < 4) g.set(xp, t, '░', 8);
    if (a === 0 && f <= 168) g.set(head, tr(head) + 1, '*', 15);
  }

  let wx, lx, bx;
  if (f < 168) { wx = head - 1; lx = head - 4; bx = head - 7; }
  else if (f < 176) { wx = 76; lx = 73; bx = 70; }
  else if (f < 196) {
    const d = f - 175;
    wx = Math.max(52, 76 - Math.round(d * 1.2));
    lx = Math.max(49, 73 - Math.round(d * 1.2));
    bx = Math.max(46, 70 - Math.round(d * 1.2));
  } else { wx = 52; lx = 49; bx = 46; }
  const dy = x => x >= 53 ? tr(x) + 1 : 13;
  g.set(bx, dy(bx), '☺', 6);
  g.set(lx, dy(lx), '☺', 7);
  g.set(wx, dy(wx), '☺', 15);

  if (f >= 170 && f < 194) {
    const MSG = 'You have struck microcline!';
    const n = Math.min(MSG.length, (f - 169) * 2);
    const col = f < 187 ? 7 : 8;
    for (let i = -1; i <= MSG.length; i++) g.set(34 + i, 23, ' ', 0, 0);
    g.text(34, 23, MSG.slice(0, n), col);
    if (n < MSG.length) g.set(34 + n, 23, '_', 7);
  }
}) },

  { id: "magma-forges", fps: 8, frames: 120, cols: 72, rows: 20,
    render: (function render(f, g) {
  const RED=4, LRED=12, YEL=14, WHT=15, LG=7, DG=8, BRN=6;
  const SURF=14, S=80;
  const lum = g.hash(7, (f>>1)%60, 3);
  // magma sea
  for (let y=SURF; y<20; y++) {
    const d = y-SURF;
    const bias = (lum-0.5)*0.14*(1-d/6);
    for (let x=0; x<72; x++) {
      const off = (g.hash(x,y,17)*120)|0;
      if (y===SURF) {
        const r = g.hash(x, 99, (f+off)%120) + bias*2;
        if (r>0.985) g.set(x,y,'▒',YEL,RED);
        else if (r>0.94) g.set(x,y,'≈',YEL,RED);
        else if (r>0.90) g.set(x,y,'▓',LRED,RED);
        else if (r>0.30) g.set(x,y,'≈',LRED,RED);
        else g.set(x,y,'░',LRED,RED);
      } else {
        const q = ((f+off)>>1)%60;
        const r = g.hash(x,y,q) + bias;
        const act = 0.26 - d*0.042;
        if (r < act*0.3) g.set(x,y,'▒',LRED,RED);
        else if (r < act) g.set(x,y,'░',LRED,RED);
        else g.set(x,y,'█',RED);
      }
    }
  }
  // surface flames, rising 1 row/frame
  const f10 = ((f/10)|0)%12, t10 = (f%10)/10;
  for (let x=0; x<72; x++) {
    const chh = g.hash(x,5,f10)*(1-t10) + g.hash(x,5,(f10+1)%12)*t10;
    const b = (lum-0.5)*0.1;
    if (g.hash(x, 60+((13+f)%6), 8) < 0.10 + chh*0.32 + b)
      g.set(x,13, g.hash(x,13,f%24)<0.3?'▓':'▒', RED);
    const d12 = (chh-0.5)*0.3 + b*0.5;
    if (d12>0 && g.hash(x, 60+((12+f)%6), 8) < d12) g.set(x,12,'░',RED);
  }
  // smoke columns, rising, thinning with height
  for (const v of [11,57]) {
    for (let y=1; y<=13; y++) {
      const p = 0.88 - (13-y)*0.065;
      if (g.hash(v, (y+f)%12, 21) < p) g.set(v,y, y>=11?'▓':y>=6?'▒':'░', DG);
      if (g.hash(v+37, (y+f)%12, 22) < p*0.4)
        g.set(v + (g.hash(v,y,23)<0.5?-1:1), y, y>=9?'▒':'░', DG);
    }
  }
  // pillars, lit-field flicker strongest near the magma
  for (const px of [30,42]) {
    for (let y=10; y<=13; y++) {
      const fl = lum*0.6 + g.hash(px,y,f%24)*0.4;
      g.set(px,y,'║', fl < 0.45-(13-y)*0.12 ? DG : LG);
    }
  }
  // anvil platform + smith
  g.rect(28,9,17,1,'▀',LG);
  g.set(37,8,'σ',LG);
  g.set(35,8,'☻',WHT);
  if (f%30===29) g.set(36,8,'*',YEL);
  // magma bubble
  if (f===S) {
    g.set(36,SURF,'█',WHT);
    g.set(35,SURF,'▓',YEL,RED);
    g.set(37,SURF,'▓',YEL,RED);
    g.set(36,13,'▒',YEL);
  }
  if (f>S && f<=S+3) {
    const r = f-S;
    for (let dy=-2; dy<=2; dy++) for (let dx=-3; dx<=3; dx++) {
      let on = Math.round(Math.hypot(dx,dy*2))===r;
      if (r===1) on = (Math.abs(dx)+Math.abs(dy)===1);
      if (r===3 && dx===0 && dy===-2) on = true;
      if (!on) continue;
      if (g.hash(dx+9,dy+9,f) > (r===1?0.95:r===2?0.75:0.55)) continue;
      const y = SURF+dy;
      g.set(36+dx, y, '*', r===1?YEL:r===2?LRED:RED, y>=SURF?RED:undefined);
    }
  }
  for (let k=0; k<6; k++) {
    const a = f-(S+3+(k%2));
    if (a<0 || a>3) continue;
    const w = g.hash(k,a,4);
    const x = 32 + ((g.hash(k,55,1)*9)|0) + (w<0.33?-1:w<0.66?0:1);
    g.set(x, 13-a, a===0?'▒':'░', a<3?LRED:RED);
  }
  if (f>=S+4 && f<S+16) {
    const t = f-S-4;
    g.text(29,6,'!!masterwork!!', t===0?WHT:t<9?YEL:BRN);
  }
}) },

  { id: "the-flood", fps: 8, frames: 240, cols: 72, rows: 20,
    render: (function render(f, g) {
  var B=1, LB=9, LC=11, LG=7, DG=8, W=15;
  var C=g.cols, R=g.rows, T=f;
  var SX=10, SY=10;
  var x, y, r;

  // right floor: flood wave + puddles + speckle
  var rate = T<176 ? 0.10 : 0.10-0.0025*(T-176); if(rate<0)rate=0;
  for (y=0; y<R; y++) {
    var fp = T-168-((y/5)|0);
    for (x=10; x<C; x++) {
      var arr = 3*((x-SX)+Math.abs(y-SY));
      var a = T-arr;
      var drawn = false;
      if (a>=0 && arr<=168 && y>=1 && y<=18) {
        var pud = g.hash(x,y,23)<rate;
        var wet = (T<168) || (T<176 && fp<1);
        if (wet) {
          if (a<3) {
            r=g.hash(x,y,T>>1);
            if (r<0.55) g.set(x,y,'▒',LC);
            else if (r<0.8) g.set(x,y,'░',LC);
            else g.set(x,y,'1',LB);
            drawn=true;
          } else if (a<45) {
            var d=1+(((a-3)/3)|0); if(d>7)d=7;
            if (a>=27) { var d2=7-(((a-27)/3)|0); if(d2<2)d2=2; if(d2<d)d=d2; }
            var rf=g.hash(x-2*T,y,7);
            if (d>=4) g.set(x,y,''+d, rf<0.12?B:LB, B);
            else g.set(x,y,''+d, rf<0.12?B:LB);
            drawn=true;
          } else if (a<51) { g.set(x,y,'░',B); drawn=true; }
          else if (pud) { g.set(x,y, g.hash(x,y,29)<0.3?'▒':'░', B); drawn=true; }
        } else if (T<176 && fp<=3 && (a<51 || pud)) {
          g.set(x,y, a<45 ? (fp===1?'▓':fp===2?'▒':'░') : '░', B); drawn=true;
        } else if (pud) {
          g.set(x,y, (g.hash(x,y,29)<0.3 && rate>0.09)?'▒':'░', B); drawn=true;
        }
      }
      if (!drawn) {
        r=g.hash(x,y,11);
        if (r<0.085) {
          var r2=g.hash(x,y,13);
          g.set(x,y, r2<0.3?'.':r2<0.55?',':r2<0.8?"'":'`', DG);
        }
      }
    }
  }

  // two rows of open-space holes: water pools one z below (dark pair)
  var holes=[[30,41,6],[22,33,14]], hI, h;
  for (hI=0; hI<2; hI++) {
    h=holes[hI]; y=h[2];
    for (x=h[0]; x<=h[1]; x++) {
      var ar2 = 3*((x-SX)+Math.abs(y-SY));
      var pd = 0;
      if (T<176) { if (T>=ar2) { pd=1+(((T-ar2)/4)|0); if(pd>7)pd=7; } }
      else { pd=7-(((T-176)/8)|0); if(pd<0)pd=0; }
      if (pd>=1) g.set(x,y,''+pd,B);
      else g.set(x,y,'·',DG);
    }
  }

  // reservoir: dark BLUE mass, level falls during flood, refills after reseal
  var lv, sg;
  if (T<176) { lv=2+((T/12)|0); sg=(T%12)<6?'█':'▄'; }
  else { var u=T-176; lv=17-((u/3)|0); if(lv<=2){lv=2;sg='█';} else sg=(u%3)<1?'▄':'█'; }
  for (y=lv+1; y<=18; y++) for (x=0; x<=8; x++)
    g.set(x,y, g.hash(x,y,T>>1,17)<0.08?'▓':'█', B);
  if (lv>=1 && lv<=18) for (x=0; x<=8; x++) g.set(x,lv,sg,B);

  // reservoir walls
  for (x=0; x<=8; x++) { g.set(x,0,'═',LG); g.set(x,19,'═',LG); }
  g.set(9,0,'╗',LG); g.set(9,19,'╝',LG);
  for (y=1; y<=18; y++) {
    if (y>=9 && y<=11) {
      if (T < 176+(y-9)) continue;
      var wc = LG;
      if (T>=206 && y===10) wc=DG;
      if (T>=222 && y!==10) wc=DG;
      g.set(9,y,'║',wc);
    } else g.set(9,y,'║',LG);
  }
  if (T>=176 && T<=178) g.set(10, 9+(T-176), '▒', LG);

  // gap spray (LCYAN, hash dropout; big burst on the first 12 frames)
  if (T<168) {
    for (var dy=-2; dy<=2; dy++) for (var dx=1; dx<=4; dx++) {
      var ds = dx+Math.abs(dy);
      var lim = T<12 ? 0.22+0.10*ds : 0.25+0.15*ds;
      r = g.hash(9+dx,10+dy,T>>1,5);
      if (r>lim) g.set(9+dx,10+dy, r>lim+0.3?'▒':'░', LC);
    }
  }

  // water gushing through the breach throat
  if (T<168) for (y=9; y<=11; y++)
    g.set(9,y,'≈', g.hash(9,y,T>>1,43)<0.3?B:LB);

  // rubble at the breach (atop the churn)
  if (T<176) { g.set(10,8,'▓',LG); g.set(10,12,'▒',LG); g.set(11,12,'░',LG); }

  // pre-burst dribble through the resealed wall
  if (T>=224 && g.hash(T>>1,31)>0.45) g.set(10,10,'░',LB);
  if (T>=234) {
    if (g.hash(T>>1,37)>0.5) g.set(10,9,'░',LC);
    if (g.hash(T>>1,41)>0.55) g.set(11,10,'░',B);
  }

  // the dwarf: flees right ahead of the front, then walks back to inspect
  var xw=-9;
  if (T<180) xw = 13 + ((T/3)|0) + ((T%3)>=2?1:0);
  else if (T>=182) xw = 71-(T-182);
  if (xw>=0 && xw<C) g.set(xw,11,'☺',W);
}) },

  { id: "vile-force", fps: 8, frames: 240, cols: 72, rows: 20,
    render: (function render(f, g) {
  var LG=7, DG=8, GR=2, BR=6, RD=4, WH=15, LM=13, MG=5, BK=0;
  var R=192, CF=232;
  var x,y,i,j,k;
  for (y=0;y<20;y++) for (x=0;x<53;x++){
    if(x<9&&y<3)continue;
    if(g.hash(x,y,7)<0.16){
      var h2=g.hash(x,y,13);
      g.set(x,y,h2<0.4?',':(h2<0.7?'.':"'"),GR);
    }
  }
  g.text(2,1,'SIEGE',RD);
  for(y=2;y<18;y++)for(x=55;x<71;x++)if(g.hash(x,y,17)<0.22)g.set(x,y,'+',DG);
  for(x=55;x<71;x++){g.set(x,1,'═',LG);g.set(x,18,'═',LG);}
  for(y=2;y<18;y++){g.set(54,y,'║',LG);g.set(71,y,'║',LG);}
  g.set(54,1,'╔',LG);g.set(71,1,'╗',LG);
  g.set(54,18,'╚',LG);g.set(71,18,'╝',LG);
  g.set(54,5,'╬',LG);g.set(54,9,'╬',LG);g.set(54,13,'╬',LG);
  g.set(63,1,'╦',LG);for(y=2;y<7;y++)g.set(63,y,'║',LG);
  g.set(71,12,'╣',LG);for(x=64;x<71;x++)g.set(x,12,'═',LG);
  g.set(67,12,'+',DG);
  g.set(67,3,'Θ',DG);
  g.set(68,15,'╤',DG);g.set(69,15,'╥',DG);
  g.set(55,5,'☻',WH);g.set(55,13,'☻',WH);
  var GB=[[10,10],[8,8],[8,12],[6,6],[6,10],[6,14],[4,4],[4,8],[4,12],[4,16],[2,6],[2,10],[2,14],[0,10]];
  function ph(n){return Math.floor(g.hash(n,3)*8);}
  function adv(n,t){var v=GB[n][0]+Math.floor((t+ph(n))/8);return v>48?48:v;}
  for(k=0;k<8;k++){
    var D=24*k+20, py=GB[k][1], dx=adv(k,D);
    var sy=py<=9?5:13;
    var fl=Math.ceil((54-dx)/3), F=D-fl;
    if(f>=F&&f<D){
      var hx=54-3*(f-F+1); if(hx<dx+1)hx=dx+1;
      var sl=(py-sy)/(54-dx);
      var ch=Math.abs(sl)<0.12?'-':(sl>0?'/':'\\');
      for(j=0;j<4;j++){
        var bx=hx+j; if(bx>53)break;
        var by=Math.round(sy+(py-sy)*(54-bx)/(54-dx));
        g.set(bx,by,ch,j===0?LG:DG);
      }
    }
  }
  for(i=0;i<14;i++){
    var gy=GB[i][1];
    if(i<8){
      var Dd=24*i+20, ddx=adv(i,Dd);
      if(f<Dd) g.set(adv(i,f),gy,'g',GR);
      else if(f===Dd) g.set(ddx,gy,'g',BK,GR);
      else if(f===Dd+1) g.set(ddx,gy,'g',LM);
      else if(f===Dd+2) g.set(ddx,gy,'g',MG);
      else if(f<CF+Math.floor(g.hash(i,99)*7)) g.set(ddx,gy,'%',RD);
    } else {
      if(f<R) g.set(adv(i,f),gy,'g',GR);
      else if(f<CF+Math.floor(g.hash(i,99)*7))
        g.set(adv(i,R)-Math.floor((f-R)/4),gy,'g',GR);
    }
    if(f>=CF+Math.floor(g.hash(i,99)*7)) g.set(GB[i][0],gy,'g',GR);
  }
  var TR=[[20,7],[16,15]];
  for(i=0;i<2;i++){
    var tb=TR[i][0], ty=TR[i][1], arr=(53-tb)*4-i*2;
    if(f<R){
      var tx=tb+Math.floor((f+i*2)/4); if(tx>53)tx=53;
      g.set(tx,ty,'T',DG);
      if(tx===53){
        var b=(f-arr)%12;
        if(b===0)g.set(54,ty,'║',BK,LG);
        else if(b===1)g.set(54,ty,'*',WH);
        else if(b===2)g.set(54,ty,'*',LG);
      }
    } else if(f<CF+Math.floor(g.hash(i,77)*7)){
      g.set(53-Math.floor((f-R)/2),ty,'T',DG);
    }
    if(f>=CF+Math.floor(g.hash(i,77)*7)) g.set(tb,ty,'T',DG);
  }
}) },

  { id: "strange-mood", fps: 8, frames: 180, cols: 72, rows: 20,
    render: (function render(f, g) {
  var MAG=5, BLU=1, DG=8, LG=7, WH=15, YE=14, BR=6;
  var cx=35, cy=9;
  var boxOn = f>=134 && f<168;
  var ht = boxOn ? 133 : f;

  // floor speckle
  for (var y=0; y<20; y++) for (var x=0; x<72; x++)
    if (g.hash(x,y,91) < 0.03 && !(x>30 && x<40 && y>6 && y<12)) g.set(x,y,"'",DG);

  // torch-field haze around the claimed workshop; freezes while the box is up
  var breath = g.hash(((ht/3)|0)%5, 77);
  for (var y=1; y<19; y++) for (var x=19; x<52; x++) {
    var dx=x-cx, dy=y-cy;
    if (dx>-5 && dx<5 && dy>-3 && dy<3) continue;
    var d = Math.sqrt(dx*dx*0.25 + dy*dy);
    if (d>8) continue;
    var u = 1-d/8;
    if (g.hash(x,y,13) > 0.9*u*u + 0.15*u) continue;
    var lvl = d<3.5 ? 2 : 1;
    var amp = 1-d/9;
    var phc = (((ht+((g.hash(x,y,7)*12)|0))/2)|0)%6;
    var r = g.hash(x,y,phc,29);
    if (r < (0.26+(breath-0.5)*0.18)*amp) lvl--;
    else if (r > 1-0.1*amp && d<3.5) lvl=2;
    if (lvl<1) continue;
    g.set(x,y, lvl===2?'▒':'░', g.hash(x,y,41)<(d-4)/4?BLU:MAG);
  }

  // the workshop: shade walls, black interior
  for (var i=0;i<5;i++){ g.set(33+i,8,'░',MAG); g.set(33+i,10,'░',MAG); }
  g.set(33,9,'░',MAG); g.set(37,9,'░',MAG);

  // the moody dwarf
  if (((f/3)|0)%2===0) g.set(35,9,'☺',WH); else g.set(35,9,'‼',YE);

  // ingredients drift in one at a time and are taken at the wall
  if (f<132) {
    var IT=[['▬',BR,14,3,33,9],['≡',LG,56,17,37,10],['♦',MAG,60,3,37,8],['☼',YE,12,16,33,10]];
    var wi=(f/33)|0, lf=f-wi*33, it=IT[wi];
    var t=Math.min((lf/3)|0,10)/10;
    g.set(Math.round(it[2]+(it[4]-it[2])*t), Math.round(it[3]+(it[5]-it[3])*t), it[0], lf===32?WH:it[1]);
  }

  // creation: interior strobe, then the announcement box rises, holds, dissolves
  if (f===132) g.rect(34,9,3,1,'█',WH);
  if (f===133) g.rect(34,9,3,1,'█',YE);
  if (boxOn) {
    var y0 = f<140 ? 14-(f-134) : 8;
    var drop = f>=164 ? (f-163)*0.24 : 0;
    var msg='Urist Mcprompt has created ☼Tokenblessed☼, a legendary artifact!';
    for (var by=0; by<3; by++) for (var bx=0; bx<68; bx++) {
      var gx=2+bx, gy=y0+by;
      if (drop>0 && g.hash(gx,gy,63) < drop) continue;
      if (by!==1 || bx===0 || bx===67) { g.set(gx,gy,'█',LG); continue; }
      var ti=bx-2;
      if (ti>=0 && ti<64) {
        var ch=msg.charAt(ti);
        g.set(gx,gy,ch, ch==='☼'?YE:(ti>=28&&ti<=39?WH:LG), 0);
      } else g.set(gx,gy,' ',LG,0);
    }
  }
}) },

  { id: "caravan-parallax", fps: 8, frames: 288, cols: 72, rows: 20,
    render: (function render(f, g) {
  const H = g.hash;
  const C = g.cols;
  const f8 = (f / 8) | 0;
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < C; x++) {
      if (H(x, y, 11) < 0.02) {
        const tw = (f + ((H(x, y, 13) * 16) | 0)) % 16;
        g.set(x, y, '·', tw < 4 ? 7 : 15);
      }
    }
  }
  for (const s of [[64, 6, 3], [204, 64, -3]]) {
    const k = f - s[0];
    if (k >= 0 && k < 11) {
      for (let j = 3; j >= 0; j--) {
        const p = k - j;
        if (p < 0 || p > 7) continue;
        const px = s[1] + s[2] * p;
        const py = (p / 2) | 0;
        if (j === 0) g.set(px, py, '*', 15);
        else if (j === 1) g.set(px, py, '▒', 7);
        else if (H(px, py, 17) < 0.7) g.set(px, py, '░', 8);
      }
    }
  }
  const RIDGE = [2, 5, 3, 6, 2, 1];
  for (let x = 0; x < C; x++) {
    const w = (x + f8) % 36;
    const sg = (w / 6) | 0;
    const a = RIDGE[sg];
    const b = RIDGE[(sg + 1) % 6];
    const hh = Math.round(a + (b - a) * ((w % 6) / 6));
    for (let y = 10 - hh; y <= 9; y++) g.set(x, y, '░', 8);
  }
  const to = (f / 4) | 0;
  for (let x = 0; x < C; x++) {
    const w = (x + to) % 72;
    if (H(w, 203) < 0.6) g.set(x, 11, H(w, 11, f8, 207) < 0.75 ? '▒' : '░', 8);
    if (H(w, 204) < 0.85) g.set(x, 12, H(w, 12, f8, 207) < 0.7 ? '▓' : '▒', 8);
    if (H(w, 205) < 0.16) {
      g.set(x, 10, H(w, 206) < 0.55 ? '↑' : '♠', 8);
      if (H(w, 203) >= 0.6) g.set(x, 11, '▒', 8);
    }
    if (H(w, 208) < 0.08) g.set(x, 13, '░', 8);
  }
  const go = (f / 2) | 0;
  for (let x = 0; x < C; x++) {
    const w = (x + go) % 72;
    g.set(x, 18, '█', 7);
    const r = H(w, 301);
    if (r < 0.55) {
      g.set(x, 17, '█', 7);
      if (H(w, 302) < 0.05) g.set(x, 16, '▄', 7);
    } else if (r < 0.85) g.set(x, 17, '▄', 7);
  }
  const ph = f % 4;
  if (ph < 3) {
    const sp = (f / 4) | 0;
    const px = 31 - ph - ((H(sp, 401) * 2) | 0);
    g.set(px, ph === 2 ? 15 : 16, '░', 8);
  }
  const wx = 32;
  for (let i = 1; i <= 5; i++) g.set(wx + i, 14, '▄', 7);
  g.set(wx, 15, '█', 6);
  g.set(wx + 1, 15, '█', 7);
  g.set(wx + 2, 15, '▓', 14, 6);
  g.set(wx + 3, 15, 'W', 6, 7);
  g.set(wx + 4, 15, '▓', 14, 6);
  g.set(wx + 5, 15, '█', 7);
  g.set(wx + 6, 15, '█', 6);
  g.set(wx + 2, 16, '▀', 6);
  g.set(wx + 3, 16, '▀', 6);
  g.set(wx + 4, 16, '▀', 6);
  const spin = ((f / 4) | 0) % 2;
  g.set(wx + 1, 16, spin ? 'x' : '+', 6);
  g.set(wx + 5, 16, spin ? '+' : 'x', 6);
  g.set(wx + 6, 16, '─', 6);
  g.set(wx + 7, 16, '─', 6);
  g.set(wx + 9, 16, '@', 7);
}) },

  { id: "candy-descent", fps: 8, frames: 200, cols: 72, rows: 20,
    render: (function render(f, g) {
  const W = g.cols, H = g.rows;
  const tt = ((f >> 2) % 50 + 50) % 50;
  let L = 1;
  if (f >= 188 && f <= 193) L = (194 - f) / 7;
  else if (f >= 194) L = (f - 193) / 6;
  const desc = f < 170;
  const step = desc ? Math.min(8, (f / 20) | 0) : 8;
  const mrow = 1 + 2 * step;
  for (let y = 0; y < H; y++) {
    const dens = 0.04 * (y < 10 ? 1 : Math.max(0, (19 - y) / 9));
    for (let x = 0; x < W; x++) {
      if (x >= 30 && x <= 35) continue;
      if (g.hash(x, y, 3) < dens) {
        if (L < 0.5) continue;
        const p = g.hash(x, y, 4);
        g.set(x, y, p < 0.33 ? '%' : p < 0.66 ? "'" : ',', L >= 0.9 ? 7 : 8);
      }
    }
  }
  if (L >= 0.4) {
    g.set(22, 17, '·', 8); g.set(22, 18, '·', 8); g.set(22, 19, '∙', 3);
    g.set(48, 17, '·', 8); g.set(48, 18, '·', 8); g.set(48, 19, '∙', 3);
  }
  for (let y = 0; y < H; y++) {
    const yy = ((y - tt) % 50 + 50) % 50;
    for (let k = 0; k < 2; k++) {
      const x = 32 + k;
      const n = g.hash(x, yy, 9);
      let a, tone = 0;
      if (n < 0.58) a = 1;
      else if (n < 0.78) { a = 0.85; tone = 1; }
      else if (n < 0.92) a = 0.7;
      else a = 0.5;
      const ae = a * L;
      let ch = null;
      if (ae >= 0.9) ch = '█';
      else if (ae >= 0.62) ch = '▓';
      else if (ae >= 0.38) ch = '▒';
      else if (ae >= 0.14) ch = '░';
      if (ch) {
        if (tone && L >= 0.97 && ch !== '█') g.set(x, y, ch, 11, 3);
        else g.set(x, y, ch, 11);
      }
    }
    for (let k = 0; k < 2; k++) {
      const x = k ? 34 : 31;
      const e = g.hash(x, yy, 5);
      if (e < 0.45) continue;
      const ae = (e < 0.75 ? 0.5 : 0.75) * L;
      let ch = null;
      if (ae >= 0.62) ch = '▓';
      else if (ae >= 0.38) ch = '▒';
      else if (ae >= 0.14) ch = '░';
      if (ch) g.set(x, y, ch, 3);
    }
  }
  if (f < 188 && L >= 0.5) {
    const bot = desc ? mrow - 1 : 16;
    for (let r = 1; r <= bot; r++) {
      if (r % 2 === 1) g.set(36, r, ((r - 1) / 2) % 2 ? '<' : '>', 8);
      else g.set(36, r, '•', 8);
    }
    for (let i = 0; i <= step; i++) g.text(68, 1 + 2 * i, '-' + (i + 1), 8);
  }
  if (desc) {
    if (step >= 1 && f % 20 < 2) g.set(36, mrow + 1, '▒', 8);
    g.set(36, mrow, '☺', 15);
  } else if (f >= 194 && L >= 0.5) {
    g.set(36, 1, '☺', L >= 0.85 ? 15 : 7);
  }
  if (f >= 170 && f <= 191) {
    const dc = L >= 0.6 ? 12 : 4;
    const rA = 19 - (f - 170);
    if (rA >= 0) g.set(30, rA, '&', dc);
    if (f >= 172) {
      const rB = 19 - (f - 172);
      if (rB >= 0) g.set(35, rB, '&', dc);
    }
  }
  if (f >= 170 && f <= 172) {
    const CH = [[31,17],[32,16],[33,16],[34,17],[31,18],[32,18],[33,19],[34,19],[32,19],[33,17]];
    const LT = 'abcdefghjkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
    for (let i = 0; i < CH.length; i++) {
      const cx = CH[i][0], cy = CH[i][1];
      g.set(cx, cy, LT[(g.hash(cx, cy, f) * LT.length) | 0], g.hash(cx, cy, f + 7) < 0.6 ? 12 : 4);
    }
  }
  if (f === 173) g.rect(0, 0, W, H, '▓', 12, 4);
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

/* ---------------- waitlist ---------------- */

function mountWaitlist() {
  var dlg = document.getElementById("waitlist-dialog");
  var form = document.getElementById("waitlist-form");
  var email = document.getElementById("waitlist-email");
  var status = document.getElementById("waitlist-status");
  if (!dlg || !form) return;

  var lines = {
    ok: form.getAttribute("data-success"),
    dup: form.getAttribute("data-dup"),
    err: form.getAttribute("data-error"),
  };

  document.querySelectorAll(".js-open-waitlist").forEach(function (btn) {
    btn.addEventListener("click", function () {
      dlg.showModal();
      email.focus();
    });
  });

  dlg.querySelector(".dlg-close").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = "status" + (kind ? " status--" + kind : "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var value = email.value.trim();
    if (!value) return;
    setStatus("Scribing…", null);
    fetch("/llmcraft/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: value,
        fortress: form.elements.fortress ? form.elements.fortress.value : "",
      }),
    })
      .then(function (r) {
        if (r.ok) {
          setStatus("☺ " + lines.ok, "ok");
          form.querySelector("button[type=submit]").disabled = true;
          email.disabled = true;
          bumpRoster();
        } else if (r.status === 409) {
          setStatus(lines.dup, "ok");
        } else {
          setStatus(lines.err, "err");
        }
      })
      .catch(function () {
        setStatus(lines.err, "err");
      });
  });
}

var rosterCount = null;

function paintRoster() {
  if (rosterCount === null || rosterCount < 1) return;
  var label = rosterCount === 1 ? "1 name on the roster." : rosterCount + " names on the roster.";
  document.querySelectorAll(".roster-count").forEach(function (el) {
    el.textContent = label;
  });
}

function bumpRoster() {
  if (rosterCount !== null) { rosterCount += 1; paintRoster(); }
}

function fetchRoster() {
  fetch("/llmcraft/api/waitlist/count")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (data && typeof data.count === "number") {
        rosterCount = data.count;
        paintRoster();
      }
    })
    .catch(function () { /* served without the worker — keep quiet */ });
}

/* ---------------- boot ---------------- */

document.addEventListener("DOMContentLoaded", function () {
  mountPanels();
  mountWaitlist();
  fetchRoster();
});
