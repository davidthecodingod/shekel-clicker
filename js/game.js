"use strict";
/* =====================================================================
   Shekel Clicker: core game
   ===================================================================== */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const NOW = () => Date.now();
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const opts = {sound:true, rain:true, sci:false, story:true, lowpower:false};

/* ================= PIXEL ART HELPERS ================= */
const sprImg = (spec, size = 48, cls = '') => PX.img(spec.name, {size, swap:spec.swap, layers:spec.layers, cls});
const sImg = (name, size = 48) => PX.img(name, {size});
const coinMini = () => sImg('coin', 16);
function upSpec(u) {
  if (u.kind === 'tier') return {name:u.bid};
  if (u.kind === 'bsyn') return {name:'bubbe'};
  return ICONS[u.id] || {name:'star'};
}
function achSpec(a) {
  const k = a.icon;
  if (BMAP[k]) return {name:k};
  if (ICONS[k]) return ICONS[k];
  const v = ACH_ICON[k];
  return typeof v === 'string' ? {name:v} : (v || {name:'star'});
}

/* ================= FORMATTING ================= */
const SUF = ['',' thousand',' million',' billion',' trillion',' quadrillion',' quintillion',' sextillion',' septillion',' octillion',' nonillion',' decillion',' undecillion',' duodecillion',' tredecillion',' quattuordecillion',' quindecillion',' sexdecillion',' septendecillion'];
function fmt(n, dec) {
  if (!isFinite(n)) return '∞';
  if (n < 0) return '-' + fmt(-n, dec);
  if (n < 1000) return dec && n < 100 && n % 1 ? (Math.round(n*10)/10).toLocaleString() : Math.floor(n).toLocaleString();
  if (n < 1e6) return Math.floor(n).toLocaleString();
  if (opts.sci) return n.toExponential(3).replace('e+', 'e');
  const i = Math.floor(Math.log10(n) / 3);
  if (i >= SUF.length) return n.toExponential(3).replace('e+', 'e');
  return (n / Math.pow(10, 3*i)).toFixed(3) + SUF[i];
}
function fmtTime(s) { s = Math.max(0, Math.floor(s)); const d = Math.floor(s/86400), h = Math.floor(s%86400/3600), m = Math.floor(s%3600/60), x = s%60;
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : m ? `${m}m ${x}s` : `${x}s`; }
const plain = n => n < 1e6 ? Number(n).toLocaleString() : fmt(n).replace(/\.?0+ /, ' ');
const sOrNot = (n, one, many) => n === 1 ? `1 ${one}` : `${plain(n)} ${many}`;

/* ================= STATE ================= */
function fresh() {
  return {v:2, name:'', bank:0, earned:0, allTime:0, handmade:0, clicks:0, b:{}, lvl:{}, up:[], ach:[], hup:[],
    golden:0, given:0, heritage:0, chips:0, gens:0, season:'none', start:NOW(), genStart:NOW(), lastSave:NOW(),
    played:false, horaMax:false, loops:0, switched:false, renamed:false, sold:false, tickerClicks:0, chaiClicks:false, welcomeBack:false,
    buffs:[], drops:[], crit:{}, critTotal:0,
    pom:{n:0, since:0, total:0}, garden:{plots:[], harvests:0, species:[]},
    trivia:{right:0, asked:0, streak:0, best:0, next:0, seen:[]}, dreidel:{spins:0, next:0, got:[]}, levelsTotal:0,
    story:{got:[], seen:[]}, market:{day:0, last:0, goods:{}, trades:0, profit:0}};
}
let S = fresh();
let upSet = new Set(), achSet = new Set(), hupSet = new Set();
const owned = id => S.b[id] || 0;
const lvl = id => S.lvl[id] || 0;
const hasH = id => hupSet.has(id);
const hasLuach = () => upSet.has('luach') || hasH('h11');
let curCps = 0, baseCps = 0;
let GFX = {cps:0, click:0, freq:0, dur:0, cheap:0};

/* ================= UPGRADE CATALOG ================= */
const UPGRADES = [], UPG = {}, TIERS_BY_B = {}, PCT_UPS = [], BSYN_UPS = [];
function addUp(u) { UPGRADES.push(u); UPG[u.id] = u; if (u.pct) PCT_UPS.push(u); return u; }
BUILDINGS.forEach(b => {
  TIERS_BY_B[b.id] = [];
  TIER_T.forEach((t, k) => {
    TIERS_BY_B[b.id].push(addUp({id:`${b.id}_t${k}`, kind:'tier', bid:b.id, tier:k, art:b.id,
      name: k < 7 ? UPN[b.id][k] : `${TIER_PREFIX[k-7]} ${b.name}`,
      cost: b.cost * TIER_M[k], desc:`${b.name} production ×2.`,
      flavor:`Appears once you own ${t === 1 ? 'a' : t} ${t === 1 ? b.name : b.plural}.`,
      unlock: () => owned(b.id) >= t}));
  });
  if (b.idx > 0) BSYN_UPS.push(addUp({id:`bs_${b.id}`, kind:'bsyn', bid:b.id, art:'bubbe', name:BUBBE_SYN[b.id], cost:b.cost * 50,
    desc:`Bubbe production ×2. ${b.plural} gain +1% production for every ${b.idx === 1 ? 'Bubbe' : b.idx + ' Bubbes'}.`,
    flavor:'Nothing runs without Bubbe.', unlock: () => owned(b.id) >= 15 && owned('bubbe') >= 1}));
});
CLICK_UPS.forEach(c => addUp({...c, kind:'click',
  desc: c.dbl ? 'Clicking is twice as powerful.' : 'Each click also earns 1% of your shekels per second.',
  unlock: () => c.need === 0 ? S.clicks >= 1 : S.handmade >= c.need}));
HANDS_UPS.forEach(h => addUp({...h, kind:'hands',
  desc: h.id === 'hh0' ? 'Clicks and Bubbes each gain +0.1 shekels for every building that is not a Bubbe.' : `The Helping Hands bonus is ×${h.x}.`,
  unlock: () => owned('bubbe') >= h.need}));
FOODS.forEach(f => addUp({...f, kind:'food', desc:`All production +${f.pct}%.`, unlock: () => S.earned >= f.cost / 4}));
NACHAS_UPS.forEach(k => addUp({...k, kind:'nachas',
  desc:`Production grows with your nachas: +${Math.round(k.f*100)}% for every 100% nachas.`,
  flavor:`Appears once you have ${k.need} achievements.`, unlock: () => achSet.size >= k.need}));
GOLD_UPS.forEach(g => addUp({...g, kind:'gold', unlock: () => S.golden >= g.need}));
addUp({id:'luach', kind:'luach', name:'Luach', cost:5e6, desc:'Unlocks holiday seasons in the Holidays tab.',
  flavor:'A synagogue calendar with the candle-lighting times circled.', unlock: () => S.earned >= 1e6 && !hasH('h11')});
const DROP_UPS = {};
Object.entries(SEASONS).forEach(([sid, se]) => {
  if (!se.drops) return;
  DROP_UPS[sid] = se.drops.map((name, i) => addUp({id:`d_${sid}${i}`, kind:'drop', season:sid, name, pct:5,
    cost: 1e7 * Math.pow(100, i), desc:'All production +5%.', flavor:`A ${se.name} treasure, found while celebrating.`,
    unlock: () => S.drops.includes(`d_${sid}${i}`)}));
});
const ALL_DROPS = Object.values(DROP_UPS).flat();

/* ================= PRODUCTION MATH ================= */
const totalB = () => BUILDINGS.reduce((s, b) => s + owned(b.id), 0);
function handsAdd() {
  if (!upSet.has('hh0')) return 0;
  let m = 0.1;
  for (const h of HANDS_UPS) if (h.id !== 'hh0' && upSet.has(h.id)) m *= h.x;
  return m * (totalB() - owned('bubbe'));
}
function bMult(b) {
  let m = 1;
  for (const u of TIERS_BY_B[b.id]) if (upSet.has(u.id)) m *= 2;
  m *= 1 + 0.01 * lvl(b.id);
  if (b.id === 'bubbe') { for (const u of BSYN_UPS) if (upSet.has(u.id)) m *= 2; }
  else if (upSet.has('bs_' + b.id)) m *= 1 + 0.01 * Math.floor(owned('bubbe') / b.idx);
  const se = SEASONS[S.season];
  if (se.b && se.b[b.id]) m *= se.b[b.id];
  return m;
}
const unitCps = b => b.cps * bMult(b) + (b.id === 'bubbe' ? handsAdd() : 0);
function globalMult(withBuffs) {
  let pct = 0; for (const u of PCT_UPS) if (upSet.has(u.id)) pct += u.pct;
  let m = 1 + pct / 100;
  m *= 1 + 0.01 * achSet.size * (hasH('h6') ? 1.25 : 1);
  const milk = achSet.size * 0.04;
  for (const k of NACHAS_UPS) if (upSet.has(k.id)) m *= 1 + milk * k.f;
  m *= 1 + 0.01 * S.heritage * (hasH('h16') ? 2 : 1);
  for (const h of HERITAGE_UPS) if (h.prod && hasH(h.id)) m *= 1 + h.prod;
  m *= 1 + Math.log10(S.given + 1) / 100;
  m *= SEASONS[S.season].all || 1;
  m *= 1 + GFX.cps;
  if (Music.playing) m *= 1.05;
  if (withBuffs) for (const x of S.buffs) if (x.cps) m *= x.cps;
  return m;
}
function computeCps(withBuffs) {
  let r = 0;
  for (const b of BUILDINGS) { const n = owned(b.id); if (n) r += n * unitCps(b); }
  return r * globalMult(withBuffs);
}
function recalc() { GFX = gardenEffects(); baseCps = computeCps(false); curCps = computeCps(true); }
function clickValue() {
  let dbl = 0, pct = 0;
  for (const c of CLICK_UPS) if (upSet.has(c.id)) { if (c.dbl) dbl++; else pct += 0.01; }
  let v = Math.pow(2, dbl) + handsAdd() + curCps * pct;
  v *= 1 + GFX.click;
  if (hasH('h7')) v *= 2;
  for (const x of S.buffs) if (x.click) v *= x.click;
  v *= SEASONS[S.season].click || 1;
  return v;
}
const bDiscount = () => (hasH('h4') ? 0.95 : 1) * (1 - GFX.cheap);
function priceOf(b, n) { const c = owned(b.id); return b.cost * Math.pow(1.15, c) * (Math.pow(1.15, n) - 1) / 0.15 * bDiscount(); }
function sellValue(b, n) { const c = owned(b.id); n = Math.min(n, c); if (!n) return 0; return b.cost * Math.pow(1.15, c - n) * (Math.pow(1.15, n) - 1) / 0.15 * 0.5 * bDiscount(); }
const upCost = u => u.cost * (hasH('h8') ? 0.95 : 1);
function earn(x) { S.bank += x; S.earned += x; S.allTime += x; }
const geltFreq = () => (upSet.has('g0') ? 2 : 1) * (SEASONS[S.season].gelt || 1) * (hasH('h1') ? 1.1 : 1) * (1 + GFX.freq);
const geltDur = () => (upSet.has('g1') ? 2 : 1) * (hasH('h3') ? 1.1 : 1) * (1 + GFX.dur);
const heritageFor = all => Math.floor(Math.cbrt(all / 1e12));

/* ================= ACHIEVEMENTS ================= */
const ACH = [];
const A = (id, name, desc, check, icon = 'star', shadow = false) => ACH.push({id, name, desc, check, icon, shadow});
[[1,'Mazel Tov, Your First Shekel'],[100,'A Little Something'],[1e3,'Kvelling'],[1e4,'Kibitzing'],[1e5,'Schlepping Along'],[1e6,'Living the Dream'],
 [1e7,'Look at You'],[1e8,'Off the Charts'],[1e9,'A Billion Blessings'],[1e11,'Legendary'],[1e13,'Biblical Proportions'],[1e15,'From Sinai to Here'],
 [1e18,'Beyond Counting'],[1e21,'Like the Stars in the Sky'],[1e24,'Like the Sand on the Shore'],[1e27,'Countless Generations'],[1e30,'Until 120'],[1e33,'Infinity and a Day']]
  .forEach(([n, name], i) => A('t'+i, name, `Earn ${sOrNot(n,'shekel','shekels')} in one generation.`, () => S.earned >= n, 't'));
[[1,'Getting Started'],[10,'Humming Along'],[100,'Bustling'],[1e3,'Full Shul'],[1e4,'Packed House'],[1e5,'Standing Room Only'],[1e6,'Kibbutz Scale'],
 [1e7,'Nationwide'],[1e9,'Miracle of the Oil'],[1e11,'Manna Season'],[1e13,'Parting the Sea'],[1e15,'Burning Bright'],[1e18,'Ladder to the Sky'],[1e21,'World Repaired']]
  .forEach(([n, name], i) => A('p'+i, name, `Make ${sOrNot(n,'shekel','shekels')} per second.`, () => curCps >= n, 'p'));
[[1,'First Tap'],[100,'Busy Hands'],[1000,'Shpilkes'],[1e4,'Tireless'],[5e4,'Hora Fingers'],[1e5,'Legendary Clicker']]
  .forEach(([n, name], i) => A('k'+i, name, n === 1 ? 'Click the coin.' : `Click the coin ${plain(n)} times.`, () => S.clicks >= n, 'k'));
[[1e3,'Hands-On'],[1e5,'Handiwork'],[1e7,'Elbow Grease'],[1e9,'Golden Touch'],[1e12,'Hands of Many'],[1e15,'A Mighty Hand'],[1e18,'An Outstretched Arm']]
  .forEach(([n, name], i) => A('h'+i, name, `Earn ${plain(n)} shekels by clicking.`, () => S.handmade >= n, 'h'));
[[1,'Gelt Lucky'],[7,'A Week of Gelt'],[27,'Gelt Collector'],[77,'Gelt Maven'],[777,'Gelt Legend'],[7777,'The Gelt Never Ends']]
  .forEach(([n, name], i) => A('g'+i, name, n === 1 ? 'Catch a golden gelt.' : `Catch ${plain(n)} golden gelt.`, () => S.golden >= n, 'g'));
const BA_T = [1,50,100,150,200,300,400,500];
const BA_N = [b => `A ${b.name} of Your Own`, b => `${b.name} Mishpacha`, b => `Ten Minyans of ${b.plural}`, b => `${b.name} Shtetl`,
              b => `${b.name} Metropolis`, b => `${b.name} Nation`, b => `${b.name} Galaxy`, b => `${b.name} Without End`];
BUILDINGS.forEach(b => BA_T.forEach((t, i) => A(`b${t}${b.id}`, BA_N[i](b), t === 1 ? `Own a ${b.name}.` : `Own ${t} ${b.plural}.`, () => owned(b.id) >= t, b.id)));
[[100,'Little Neighborhood'],[500,'Thriving Community'],[1000,'Big City'],[2000,'Metropolis of Mitzvot'],[4000,'Whole Wide World']]
  .forEach(([n, name], i) => A('bt'+i, name, `Own ${plain(n)} buildings in total.`, () => totalB() >= n, 'bt'));
[[1,'Ripe and Ready'],[10,'Orchard Keeper'],[50,'Pomegranate Grower'],[100,'Seeds Beyond Counting']]
  .forEach(([n, name], i) => A('lv'+i, name, n === 1 ? 'Level up a building.' : `Reach ${n} building levels in total.`, () => S.levelsTotal >= n, 'lv'));
[[10,'Renovating'],[50,'Fully Renovated'],[100,'Upgrade Mensch'],[200,'Collector'],[300,'Completionist']]
  .forEach(([n, name], i) => A('u'+i, name, `Own ${n} upgrades at once.`, () => upSet.size >= n, 'u'));
[[1,'First Mitzvah'],[1e6,'Generous Heart'],[1e9,'Open Hand'],[1e12,'Pillar of the Community'],[1e18,'Lamed Vavnik']]
  .forEach(([n, name], i) => A('z'+i, name, n === 1 ? 'Give to tzedakah.' : `Give ${plain(n)} shekels to tzedakah in total.`, () => S.given >= n, 'z'));
[[1,"L'dor V'dor"],[5,'Five Generations'],[10,'Ten Generations'],[25,'Dynasty']]
  .forEach(([n, name], i) => A('gn'+i, name, n === 1 ? 'Start a new generation.' : `Start ${n} new generations.`, () => S.gens >= n, 'gn'));
[[10,'Family Tree'],[100,'Deep Roots'],[1000,'Ancient Lineage']]
  .forEach(([n, name], i) => A('hr'+i, name, `Reach heritage level ${plain(n)}.`, () => S.heritage >= n, 'hr'));
A('hall', 'Every Heirloom', 'Own every heirloom.', () => hupSet.size >= HERITAGE_UPS.length, 'hall');
A('sea1', 'A Time for Everything', 'Celebrate a holiday season.', () => S.switched, 'sea1');
Object.entries(SEASONS).forEach(([sid, se]) => {
  if (!se.drops) return;
  A('cr_'+sid, `${se.name} Visitor`, `Catch ${se.critterName} during ${se.name}.`, () => (S.crit[sid] || 0) >= 1, 'v_' + sid);
  A('dr_'+sid, `Full ${se.name} Collection`, `Find and buy all five ${se.name} treasures.`, () => DROP_UPS[sid].every(u => upSet.has(u.id)), 's_' + sid);
});
[[10,'Holiday Spirit'],[100,'Holiday Hero']].forEach(([n, name], i) => A('ct'+i, name, `Catch ${n} holiday visitors.`, () => S.critTotal >= n, 'ct'));
A('mus1', 'Let Us Rejoice', 'Play Hava Nagila on the jukebox.', () => S.played, 'mus1');
A('mus2', 'Encore!', 'Let the band play Hava Nagila all the way through 10 times.', () => S.loops >= 10, 'mus2');
A('mus3', 'Up on the Chair', 'Let the Hora reach top speed.', () => S.horaMax, 'mus3');
[[1,'First Fruits'],[25,'Green Thumb'],[100,'Kibbutz Veteran']]
  .forEach(([n, name], i) => A('gd'+i, name, n === 1 ? 'Harvest a crop in Kibbutz Fields.' : `Harvest ${n} crops.`, () => S.garden.harvests >= n, 'gd'));
A('gd7', 'Seven Species', 'Harvest all seven species.', () => S.garden.species.length >= 7, 'gd7');
[[1,'Good Question'],[10,'Scholar'],[50,'Sage']].forEach(([n, name], i) => A('tq'+i, name, n === 1 ? 'Answer a Torah Study question correctly.' : `Answer ${n} questions correctly.`, () => S.trivia.right >= n, 'tq'));
A('tqs5', 'On a Roll', 'Answer 5 questions in a row correctly.', () => S.trivia.best >= 5, 'tqs5');
A('tqs10', 'Walking Encyclopedia', 'Answer 10 questions in a row correctly.', () => S.trivia.best >= 10, 'tqs10');
[[1,'Spin It'],[18,'Chai Spins'],[100,'Dizzy']].forEach(([n, name], i) => A('dd'+i, name, n === 1 ? 'Spin the dreidel.' : `Spin the dreidel ${n} times.`, () => S.dreidel.spins >= n, 'dd'));
A('ddg', 'Take It All', 'Land on gimel.', () => S.dreidel.got.includes('g'), 'ddg');
A('dda', 'Nun, Gimel, Hey, Shin', 'Land on every dreidel letter.', () => S.dreidel.got.length >= 4, 'dda');
A('sh1', "What's in a Name", 'Name your community.', () => S.renamed, 'sh1', true);
A('sh2', 'Dayenu', 'Sell a building. It would have been enough.', () => S.sold, 'sh2', true);
A('sh3', 'Read All About It', 'Click the news ticker 10 times.', () => S.tickerClicks >= 10, 'sh3', true);
A('sh4', 'Chai Speed', 'Click the coin 18 times within 3 seconds.', () => S.chaiClicks, 'sh4', true);
A('sh5', 'Welcome Home', 'Come back after at least an hour away.', () => S.welcomeBack, 'sh5', true);
[[1,'Once Upon a Shekel'],[10,'Page Turner']].forEach(([n, name], i) => A('st'+i, name, n === 1 ? 'Reach the first chapter of the story.' : `Reach ${n} chapters of the story.`, () => S.story.got.length >= n, 'st'));
A('st2', 'Next Year on Jewpiter', 'Reach the promised land.', () => S.story.got.includes('c19'), 'st');
A('st3', 'Saturn?', 'See what the coin says next.', () => S.story.got.includes('c20'), 'st', true);
A('mk0', 'Open for Business', 'Make a trade at the Shuk.', () => S.market.trades >= 1, 'mk');
[[1e6,'Buy Low'],[1e9,'Sell High'],[1e12,'Shuk Macher'],[1e15,'Merchant of the Ages']]
  .forEach(([n, name], i) => A('mk'+(i+1), name, `Make ${plain(n)} shekels of profit at the Shuk.`, () => S.market.profit >= n, 'mk'));
const ACHMAP = Object.fromEntries(ACH.map(a => [a.id, a]));

/* ================= TOOLTIP ================= */
const tip = $('#tip'); let tipEl = null, tipFn = null;
function setTip(el, fn) { tipEl = el; tipFn = fn; refreshTip(); }
function refreshTip() {
  if (!tipEl || !tipFn || !document.body.contains(tipEl)) { tip.hidden = true; return; }
  tip.innerHTML = tipFn(); tip.hidden = false;
  const r = tipEl.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
  let x, y;
  if (r.left - tw - 12 > 8) { x = r.left - tw - 12; y = r.top; }
  else if (r.right + 12 + tw < innerWidth - 8) { x = r.right + 12; y = r.top; }
  else { x = Math.min(Math.max(8, r.left), innerWidth - tw - 8); y = r.bottom + 8; if (y + th > innerHeight - 8) y = r.top - th - 8; }
  if (y + th > innerHeight - 8) y = innerHeight - th - 8;
  tip.style.left = x + 'px'; tip.style.top = Math.max(8, y) + 'px';
}
function hideTip() { tipEl = null; tipFn = null; tip.hidden = true; }
function bindTip(el, fn) {
  const show = () => setTip(el, fn);
  el.addEventListener('mouseenter', show); el.addEventListener('focus', show);
  el.addEventListener('mouseleave', hideTip); el.addEventListener('blur', hideTip);
  return show;
}
let lastPtr = 'mouse';
document.addEventListener('pointerdown', e => { lastPtr = e.pointerType; if (tipEl && !tipEl.contains(e.target)) hideTip(); }, true);

/* ================= TOASTS / POPS / PARTICLES ================= */
function toast(title, body, spec) {
  const t = document.createElement('div'); t.className = 'toast';
  t.innerHTML = sprImg(spec || {name:'scroll'}, 40) + '<div><b></b><span></span></div>'; t.querySelector('b').textContent = title; t.querySelector('span').textContent = body;
  const box = $('#toasts'); box.appendChild(t);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => t.remove(), 5000);
}
function pop(x, y, text) {
  const p = document.createElement('div'); p.className = 'pop'; p.textContent = text;
  p.style.left = x + 'px'; p.style.top = (y - 20) + 'px';
  document.body.appendChild(p); setTimeout(() => p.remove(), 1000);
}
const fxCan = $('#fx'), fxc = fxCan.getContext('2d'), rainCan = $('#rain'), rc = rainCan.getContext('2d');
let parts = [], drops = [], dpr = 1, rainW = 0, rainH = 0;
function resizeFx() {
  dpr = Math.min(2, window.devicePixelRatio || 1);
  fxCan.width = innerWidth * dpr; fxCan.height = innerHeight * dpr; fxc.setTransform(dpr, 0, 0, dpr, 0, 0);
  const r = $('#hearth').getBoundingClientRect(); rainW = r.width; rainH = r.height;
  rainCan.width = rainW * dpr; rainCan.height = rainH * dpr; rc.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener('resize', () => { resizeFx(); refreshTip(); });
let fxRunning = false;
function kickFx() { if (!fxRunning) { fxRunning = true; requestAnimationFrame(drawFx); } }
function burst(x, y, n) {
  if (!opts.rain || reduceMotion || opts.lowpower) return;
  kickFx();
  for (let i = 0; i < n; i++) parts.push({x, y, vx:rnd(-4,4), vy:rnd(-7,-2), r:rnd(5,9), rot:rnd(0,6), vr:rnd(-.3,.3), life:1});
  if (parts.length > 260) parts.splice(0, parts.length - 260);
}
function rainDrop() {
  if (!opts.rain || reduceMotion || opts.lowpower || document.hidden || drops.length > 120) return;
  if (innerWidth <= 900 && document.body.dataset.view !== 'mint') return;
  kickFx();
  drops.push({x:Math.random() * rainW, y:-12, vy:rnd(1.2,2.6), r:rnd(4,8), rot:rnd(0,6), vr:rnd(-.08,.08)});
}
let coinSpr = null;
function drawCoinP(ctx, p, alpha) {
  if (!coinSpr) coinSpr = PX.sprite('coin');
  const size = Math.round(p.r * 2.4 / 8) * 8 || 8, sx = Math.max(0.2, Math.round(Math.abs(Math.cos(p.rot)) * 4) / 4);
  ctx.globalAlpha = alpha; ctx.imageSmoothingEnabled = false;
  const w = Math.max(2, Math.round(size * sx));
  ctx.drawImage(coinSpr, Math.round(p.x - w / 2), Math.round(p.y - size / 2), w, size);
}
function drawFx() {
  fxc.clearRect(0, 0, innerWidth, innerHeight);
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.vy += 0.3; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.016;
    if (p.life <= 0 || p.y > innerHeight + 30) { parts.splice(i, 1); continue; }
    drawCoinP(fxc, p, Math.min(1, p.life * 1.5));
  }
  rc.clearRect(0, 0, rainW, rainH);
  for (let i = drops.length - 1; i >= 0; i--) {
    const p = drops[i]; p.y += p.vy; p.rot += p.vr;
    if (p.y > rainH + 12) { drops.splice(i, 1); continue; }
    drawCoinP(rc, p, 0.5);
  }
  fxc.globalAlpha = rc.globalAlpha = 1;
  // only keep animating while something is on screen; burst()/rainDrop() restart the loop
  // click sparks get full frame rate; falling coins alone only need 25 fps
  if (parts.length) requestAnimationFrame(drawFx);
  else if (drops.length) setTimeout(() => requestAnimationFrame(drawFx), 40);
  else fxRunning = false;
}

/* ================= STORE: BUILDINGS ================= */
let mode = 'buy', qty = 1;
const bEls = {};
function buildStore() {
  const ul = $('#buildings'); ul.innerHTML = '';
  BUILDINGS.forEach(b => {
    const li = document.createElement('li');
    li.innerHTML = `<button class="bld"><span class="ic">${sImg(b.id)}</span><span><span class="nm"></span><span class="pr"></span></span><span class="own"></span></button>`;
    ul.appendChild(li);
    const btn = li.firstChild;
    bEls[b.id] = {li, btn, nm:btn.querySelector('.nm'), pr:btn.querySelector('.pr'), own:btn.querySelector('.own')};
    btn.addEventListener('click', () => tradeBuilding(b));
    bindTip(btn, () => btn.classList.contains('mystery') ? '<span class="tn">???</span>Keep growing to discover this building.' : bTip(b));
    bEls[b.id].prKey = '';
  });
}
function visibleCount() { let hi = -1; BUILDINGS.forEach((b, i) => { if (owned(b.id) > 0 || S.earned >= b.cost) hi = i; }); return Math.min(BUILDINGS.length, hi + 3); }
function updateStore() {
  const vis = visibleCount();
  BUILDINGS.forEach((b, i) => {
    const e = bEls[b.id];
    e.li.style.display = i < vis ? '' : 'none';
    if (i >= vis) return;
    const mystery = i > 0 && owned(b.id) === 0 && S.earned < b.cost && i >= vis - 2;
    e.btn.classList.toggle('mystery', mystery);
    e.nm.textContent = mystery ? '???' : b.name;
    e.own.textContent = owned(b.id) || '';
    let txt;
    if (mode === 'buy') { const p = priceOf(b, qty); txt = (qty > 1 ? `${qty} for ` : '') + fmt(p); e.btn.classList.toggle('poor', S.bank < p); }
    else { const n = Math.min(qty, owned(b.id)); txt = n ? `Sell ${n}: ${fmt(sellValue(b, qty))}` : 'None to sell'; e.btn.classList.toggle('poor', n === 0); }
    if (e.prKey !== txt) { e.prKey = txt; e.pr.innerHTML = coinMini() + esc(txt); }
  });
}
function tradeBuilding(b) {
  if (bEls[b.id].btn.classList.contains('mystery')) return;
  if (mode === 'buy') {
    const p = priceOf(b, qty); if (S.bank < p) return;
    S.bank -= p; S.b[b.id] = owned(b.id) + qty; Sound.sfx.buy();
  } else {
    const n = Math.min(qty, owned(b.id)); if (!n) return;
    S.bank += sellValue(b, qty); S.b[b.id] -= n; S.sold = true;
  }
  recalc(); updateStore(); refreshUpgrades(); renderHood(); checkAch(); refreshTip();
}
function bTip(b) {
  const n = owned(b.id), each = unitCps(b) * globalMult(true), p = priceOf(b, qty);
  let h = `<div class="th">${sImg(b.id)}<span><span class="tn">${b.name}</span><span class="tc ${S.bank < p ? 'poor' : ''}">${coinMini()}${qty > 1 ? qty + ' for ' : ''}${fmt(p)}</span></span></div><hr>${b.desc}<hr>`;
  h += `Each makes <b>${fmt(each, true)}</b> per second.`;
  if (n) h += `<br>Your ${n} make <b>${fmt(each * n, true)}</b> per second (${curCps ? (each * n / curCps * 100).toFixed(1) : 0}% of total).`;
  if (lvl(b.id)) h += `<br>Level ${lvl(b.id)}: +${lvl(b.id)}% production.`;
  return h;
}

/* ================= STORE: UPGRADES ================= */
let upKey = '', selUp = null, upExpanded = false;
const ringColor = u => u.kind === 'tier' ? TIER_COL[u.tier] : ({click:'#9FC3E8', hands:'#7FD1C4', food:'#D9AE3A', nachas:'#E98CA8', gold:'#F4D77A', luach:'#A3243B', drop:'#6FBF73', bsyn:'#B57BD0'}[u.kind] || '#D9AE3A');
const upIcon = (u, size) => sprImg(upSpec(u), size);
const KIND_LABEL = {tier:'Building upgrade', bsyn:'Bubbe teamwork', click:'Click upgrade', hands:'Helping Hands', food:'Food', nachas:'Nachas', gold:'Golden gelt', luach:'Calendar', drop:'Holiday treasure'};
function upTip(u) {
  const c = upCost(u), have = upSet.has(u.id);
  return `<div class="th">${upIcon(u)}<span><span class="tn">${u.name}</span>` + (have ? '<span class="tc">Purchased</span>' : `<span class="tc ${S.bank < c ? 'poor' : ''}">${coinMini()}${fmt(c)}</span>`) +
    `<br><small>${KIND_LABEL[u.kind] || 'Upgrade'}</small></span></div><hr>${u.desc}${u.flavor ? `<span class="tf">${u.flavor}</span>` : ''}`;
}
function upTile(u, small) {
  const el = document.createElement('button');
  el.className = 'up' + (small ? ' sm' : '');
  el.innerHTML = upIcon(u, small ? 32 : 48) + (u.kind === 'tier' && !small ? `<i class="rn">${ROMAN[u.tier]}</i>` : '');
  el.style.setProperty('--ring', ringColor(u));
  el.setAttribute('aria-label', u.name + (small ? '' : `, ${fmt(upCost(u))} shekels`));
  el.dataset.id = u.id;
  const show = bindTip(el, () => upTip(u));
  el.addEventListener('click', () => {
    if (small) { show(); return; }
    if (lastPtr === 'touch' && selUp !== u.id) { $$('.up.sel').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); selUp = u.id; show(); return; }
    buyUp(u);
  });
  return el;
}
function buyUp(u, quiet) {
  const c = upCost(u);
  if (upSet.has(u.id) || S.bank < c) return false;
  S.bank -= c; upSet.add(u.id); selUp = null;
  if (!quiet) { Sound.sfx.buy(); hideTip(); recalc(); refreshUpgrades(true); checkAch(); if (u.kind === 'luach') renderSeasons(); }
  return true;
}
const availableUps = () => UPGRADES.filter(u => !upSet.has(u.id) && u.unlock()).sort((a, b) => a.cost - b.cost);
function refreshUpgrades(force) {
  const av = availableUps();
  const key = av.map(u => u.id).join(',') + '|' + upSet.size;
  if (force || key !== upKey) {
    upKey = key;
    const g = $('#upgrades'); g.innerHTML = '';
    if (!av.length) g.innerHTML = '<p class="upempty">New upgrades appear here as your community grows.</p>';
    av.forEach(u => { const t = upTile(u); if (selUp === u.id) t.classList.add('sel'); g.appendChild(t); });
    const t = $('#upToggle'); t.hidden = av.length <= 12; t.textContent = upExpanded ? 'Show fewer' : `Show all ${av.length}`;
    g.classList.toggle('collapsed', !upExpanded);
    if (curTab === 'stats') renderBought();
  }
  for (const el of $('#upgrades').children) if (el.dataset.id) el.classList.toggle('poor', S.bank < upCost(UPG[el.dataset.id]));
}
function renderBought() {
  const bg = $('#bought'); bg.innerHTML = '';
  UPGRADES.filter(u => upSet.has(u.id)).forEach(u => bg.appendChild(upTile(u, true)));
  $('#boughtCount').textContent = `${upSet.size} of ${UPGRADES.length}`;
}

/* ================= NEIGHBORHOOD ================= */
/* Each owned building gets a pixel diorama: its backdrop plus one sprite per
   building owned, bobbing in place. Drawn at 1 sprite pixel = 3 CSS pixels. */
const HOOD_SCALE = 3, ROW_H = 32;
let hoodKey = '', hoodRows = [];
const bgCache = {};
function rowBackdrop(id, w) { const k = id + w; return bgCache[k] || (bgCache[k] = PXA.rowBg(id, w, ROW_H)); }
function renderHood(force) {
  const box = $('#hood');
  const width = Math.max(120, Math.floor((box.clientWidth || 600) / HOOD_SCALE));
  const key = BUILDINGS.map(b => owned(b.id) + ':' + lvl(b.id)).join(',') + '|' + S.pom.n + '|' + (S.pom.since ? 1 : 0) + '|' + width;
  if (!force && key === hoodKey) return; hoodKey = key;
  box.innerHTML = ''; hoodRows = [];
  const list = BUILDINGS.filter(b => owned(b.id) > 0);
  if (!list.length) {
    box.innerHTML = `<div class="hood-empty">${sImg('bubbe', 96)}<div><h2>Your neighborhood</h2><p>It is quiet for now. Click the shekel a few times, then hire your first Bubbe from the store. Everything you build moves in here.</p></div></div>`;
    return;
  }
  for (const b of list) {
    const row = document.createElement('div'); row.className = 'hrow';
    const L = lvl(b.id), cost = L + 1, n = owned(b.id);
    row.innerHTML = `<canvas width="${width}" height="${ROW_H}"></canvas><div class="hlab"><span class="hic">${sImg(b.id, 32)}</span><span><b>${b.name}</b><small>${n.toLocaleString()} owned${L ? ` · level ${L}` : ''}</small></span>${S.pom.since ? `<button class="lvbtn" ${S.pom.n >= cost ? '' : 'disabled'}>${sImg('pom', 20)}Level up · ${cost}</button>` : ''}</div>`;
    const cv = row.querySelector('canvas'), slots = Math.max(1, Math.floor((width - 8) / 17));
    const shown = Math.min(n, slots);
    if (n > shown) row.insertAdjacentHTML('beforeend', `<span class="hmore">+${(n - shown).toLocaleString()} more</span>`);
    const rr = PXA.seeded(b.idx * 131 + 7), pos = [];
    for (let k = 0; k < shown; k++) pos.push({x: width - 20 - k * 17 + Math.floor(rr() * 3), y: ROW_H - 7 - 15 + Math.floor(rr() * 3) - 1, ph: Math.floor(rr() * 4)});
    hoodRows.push({cv, id:b.id, pos});
    const lb = row.querySelector('.lvbtn');
    if (lb) { lb.addEventListener('click', () => levelUp(b.id)); bindTip(lb, () => levelTip(b)); }
    box.appendChild(row);
  }
  drawHood(true);
}
let hoodFrame = 0;
function drawHood(force) {
  if (curTab !== 'hood' || document.hidden || (innerWidth <= 900 && document.body.dataset.view !== 'town')) return;
  if (!force && (opts.lowpower || reduceMotion) && hoodFrame > 0) return;
  hoodFrame++;
  for (const r of hoodRows) {
    const ctx = r.cv.getContext('2d'), bg = rowBackdrop(r.id, r.cv.width), spr = PX.sprite(r.id);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(bg, 0, 0);
    for (const p of r.pos) {
      const bob = reduceMotion || opts.lowpower ? 0 : ((hoodFrame + p.ph) % 4 < 2 ? 0 : -1);
      ctx.drawImage(spr, p.x, p.y + bob);
    }
  }
}
function levelTip(b) {
  const L = lvl(b.id);
  let h = `<div class="th">${sImg('pom')}<span class="tn">Level up ${b.name}</span></div>Costs ${L + 1} pomegranate${L ? 's' : ''}. Each level adds +1% to ${b.name} production.`;
  const mg = {kibbutz:'Kibbutz Fields', yeshiva:'Torah Study', school:'the Dreidel', deli:'the Shuk market'}[b.id];
  if (mg && L === 0) h += `<hr>Level 1 unlocks the <b>${mg}</b> minigame.`;
  if (b.id === 'kibbutz' && L > 0 && L < 4) h += '<hr>Each level adds more plots to Kibbutz Fields.';
  return h;
}
function levelUp(id) {
  const cost = lvl(id) + 1;
  if (S.pom.n < cost) return;
  S.pom.n -= cost; S.lvl[id] = cost; S.levelsTotal++;
  Sound.sfx.ach(); hideTip();
  const mg = {kibbutz:'Kibbutz Fields', yeshiva:'Torah Study', school:'Dreidel', deli:'The Shuk'}[id];
  if (mg && cost === 1) toast('Minigame unlocked', `${mg} is open in the Minigames tab.`, {name:id});
  recalc(); renderHood(true); renderPom(); checkAch(); if (curTab === 'mg') renderMinigames(true);
}

/* ================= POMEGRANATES ================= */
const pomTime = () => 20 * 60 * 1000 * (hasH('h10') ? 0.8 : 1);
function pomTick() {
  if (!S.pom.since) {
    if (S.allTime >= 1e9) { S.pom.since = NOW(); $('#pom').hidden = false; toast('Pomegranates!', 'A pomegranate tree has sprouted. One ripens every 20 minutes; spend them to level up buildings.', {name:'pom'}); renderHood(true); }
    return;
  }
  let got = 0; const t = pomTime();
  while (NOW() - S.pom.since >= t) { S.pom.n++; S.pom.total++; S.pom.since += t; got++; }
  if (got) { toast('Pomegranate ripe', got > 1 ? `${got} pomegranates ripened.` : 'A pomegranate ripened.', {name:'pom'}); renderHood(true); }
  renderPom();
}
function renderPom() {
  const el = $('#pom'); el.hidden = !S.pom.since; if (!S.pom.since) return;
  const frac = Math.min(1, (NOW() - S.pom.since) / pomTime());
  $('#pomArc').style.width = Math.floor(frac * 12) / 12 * 100 + '%';
  $('#pomN').textContent = S.pom.n;
}
function pomTipHtml() { return `<div class="th">${sImg('pom')}<span class="tn">Pomegranates: ${S.pom.n}</span></div>Next one ripens in ${fmtTime((pomTime() - (NOW() - S.pom.since)) / 1000)}.<hr>Spend pomegranates to level up buildings in the Neighborhood tab. Each level adds +1% production, and some open minigames.<span class="tf">According to tradition, a pomegranate has 613 seeds, one for each commandment.</span>`; }

/* ================= ACHIEVEMENT UI ================= */
let achRendered = false;
function renderAch() {
  const g = $('#achs'); g.innerHTML = '';
  for (const a of ACH) {
    const got = achSet.has(a.id), el = document.createElement('button');
    el.className = 'ach' + (got ? ' got' : '') + (a.shadow ? ' shadow' : '');
    el.innerHTML = sprImg(achSpec(a), 40);
    el.setAttribute('aria-label', got ? a.name : 'Locked achievement');
    const show = bindTip(el, () => `<div class="th">${got ? sprImg(achSpec(a)) : ''}<span class="tn">${got ? a.name : 'Locked'}</span></div>${a.desc}`);
    el.addEventListener('click', show);
    g.appendChild(el);
  }
  const vis = ACH.filter(a => !a.shadow).length;
  $('#nachas').textContent = `You have ${achSet.size} (${ACH.filter(a => !a.shadow && achSet.has(a.id)).length} of ${vis}, plus secret ones): +${achSet.size}% production, ${achSet.size * 4}% nachas.`;
  setHoney();
  achRendered = true;
}
function setHoney() { $('#honey').style.height = (4 + Math.min(40, achSet.size / ACH.length * 60)) + '%'; }
function checkAch(silent) {
  let changed = false;
  for (const a of ACH) if (!achSet.has(a.id) && a.check()) {
    achSet.add(a.id); changed = true;
    if (!silent) { toast('Achievement: ' + a.name, a.desc, achSpec(a)); Sound.sfx.ach(); }
  }
  if (changed) { if (curTab === 'ach') renderAch(); else setHoney(); recalc(); }
}

/* ================= CLICKING ================= */
const coin = $('#coin');
let clickTimes = [];
coin.addEventListener('click', e => {
  const v = clickValue();
  earn(v); S.handmade += v; S.clicks++;
  let x = e.clientX, y = e.clientY;
  if (!x && !y) { const r = coin.getBoundingClientRect(); x = r.left + r.width/2; y = r.top + r.height/2; }
  pop(x, y, '+' + fmt(v, true)); burst(x, y, 4);
  coin.classList.add('press'); setTimeout(() => coin.classList.remove('press'), 70);
  Sound.sfx.click();
  const t = NOW(); clickTimes.push(t); clickTimes = clickTimes.filter(c => t - c < 3000);
  if (clickTimes.length >= 18) S.chaiClicks = true;
  if (S.clicks === 1 || S.clicks % 10 === 0) { refreshUpgrades(); checkAch(); }
});

/* ================= BUFFS & GOLDEN GELT ================= */
function addBuff(name, eff, secs, icon) {
  S.buffs = S.buffs.filter(b => b.name !== name);
  S.buffs.push({name, ...eff, icon, end: NOW() + secs * 1000});
  recalc(); renderBuffs();
}
function renderBuffs() {
  const t = NOW();
  const html = S.buffs.map(b => `<span class="buff">${sprImg(typeof b.icon === 'object' ? b.icon : {name:b.icon || 'gelt'}, 24)}${esc(b.name)}<span class="bt">${Math.ceil((b.end - t) / 1000)}s</span></span>`).join('') + (Music.playing ? `<span class="buff">${sImg('note', 24)}Simcha +5%</span>` : '');
  if ($('#buffs').innerHTML !== html) $('#buffs').innerHTML = html;
}
let nextGelt = NOW() + 40000;
const geltDelay = () => rnd(60, 180) * 1000 / geltFreq();
function spawnGelt() {
  const g = document.createElement('button'); g.className = 'gelt'; g.innerHTML = sImg('gelt', 80);
  g.setAttribute('aria-label', 'Golden gelt! Click it');
  const x = rnd(20, innerWidth - 100), y = rnd(70, innerHeight - 120);
  g.style.left = x + 'px'; g.style.top = y + 'px';
  document.body.appendChild(g);
  const kill = setTimeout(() => g.remove(), 13000 * (upSet.has('g3') ? 2 : 1));
  g.addEventListener('click', e => {
    clearTimeout(kill); g.remove(); S.golden++;
    const opt = ['lucky','lucky','lucky','frenzy','frenzy','frenzy','click'];
    if (hasH('h13') && totalB() > 0) opt.push('bless', 'bless');
    const r = pick(opt); let msg;
    if (r === 'lucky') { const gain = Math.min(S.bank * 0.15, baseCps * 900) * (upSet.has('g2') ? 2 : 1) + 13; earn(gain); msg = 'Lucky! +' + fmt(gain); }
    else if (r === 'frenzy') { addBuff('Frenzy ×7', {cps:7}, 77 * geltDur(), 'gelt'); msg = 'Frenzy! Production ×7'; }
    else if (r === 'click') { addBuff('Click frenzy ×777', {click:777}, 13 * geltDur(), 'hand'); msg = 'Click frenzy! Clicks ×777'; }
    else { const b = pick(BUILDINGS.filter(b => owned(b.id) > 0)); const m = 1 + 0.1 * owned(b.id); addBuff(`${b.name} blessing ×${m.toFixed(1)}`, {cps:m}, 30 * geltDur(), b.id); msg = `${b.name} blessing!`; }
    const px = e.clientX || x + 36, py = e.clientY || y;
    pop(px, py, msg); burst(px, py, 18); Sound.sfx.gelt(); refreshUpgrades(); checkAch();
  });
}

/* ================= HOLIDAY VISITORS ================= */
let nextCrit = NOW() + 60000;
const critDelay = () => rnd(120, 240) * 1000 / (hasH('h9') ? 2 : 1);
function spawnCritter() {
  const se = SEASONS[S.season]; if (!se.drops) return;
  const c = document.createElement('button'); c.className = 'critter';
  c.innerHTML = `<span>${sprImg(ICONS['v_' + S.season], 64)}</span>`;
  c.setAttribute('aria-label', `Catch ${se.critterName}`);
  const ltr = Math.random() < 0.5, y = rnd(80, innerHeight - 160), dur = rnd(9, 13);
  c.style.top = y + 'px'; c.style.left = (ltr ? -70 : innerWidth + 10) + 'px';
  c.style.setProperty('--dx', (ltr ? innerWidth + 90 : -(innerWidth + 90)) + 'px');
  c.style.animationDuration = dur + 's';
  if (reduceMotion) { c.style.animation = 'none'; c.style.left = rnd(40, innerWidth - 120) + 'px'; }
  document.body.appendChild(c);
  const kill = setTimeout(() => c.remove(), (reduceMotion ? 10 : dur) * 1000);
  c.addEventListener('click', e => {
    clearTimeout(kill); c.remove();
    S.crit[S.season] = (S.crit[S.season] || 0) + 1; S.critTotal++;
    const gain = Math.max(25, baseCps * rnd(60, 180)); earn(gain);
    let msg = `+${fmt(gain)}`;
    const left = DROP_UPS[S.season].filter(u => !S.drops.includes(u.id));
    if (left.length && Math.random() < 0.3) { const d = left[0]; S.drops.push(d.id); toast('Holiday treasure found!', `${d.name} is now available in the upgrade store.`, upSpec(d)); refreshUpgrades(true); }
    pop(e.clientX, e.clientY, msg); burst(e.clientX, e.clientY, 10); Sound.sfx.gelt(); checkAch();
  });
}

/* ================= TZEDAKAH & GENERATIONS ================= */
function give(frac) {
  const amt = S.bank * frac;
  if (amt < 1) { toast('Tzedakah box', 'You need at least one shekel to give.', {name:'box'}); return; }
  S.bank -= amt; S.given += amt;
  addBuff('Chai +18%', {cps:1.18}, 60, 'box');
  toast('Tzedakah given', `You gave ${fmt(amt)} shekels. Chai blessing: +18% for 60 seconds.`, {name:'box'});
  Sound.sfx.gelt(); checkAch(); genUI();
}
function genUI() {
  $('#givenAmt').textContent = fmt(S.given);
  $('#givenBonus').textContent = '+' + (Math.log10(S.given + 1)).toFixed(1) + '%';
  const lv = heritageFor(S.allTime), pend = Math.max(0, lv - S.heritage);
  $('#herNow').textContent = S.heritage.toLocaleString();
  $('#chips').textContent = S.chips.toLocaleString();
  $('#herPend').textContent = pend.toLocaleString();
  $('#herNext').textContent = fmt(Math.pow(lv + 1, 3) * 1e12) + ' all-time';
  $('#ascend').disabled = pend < 1;
}
let heirKey = '';
function renderHeirlooms(force) {
  const key = [...hupSet].join(',') + '|' + S.chips;
  if (!force && key === heirKey) return; heirKey = key;
  const box = $('#heirlooms'); box.innerHTML = '';
  for (const h of HERITAGE_UPS) {
    const have = hasH(h.id), d = document.createElement('div');
    d.className = 'card' + (have ? ' done' : '');
    d.innerHTML = `<span class="ic">${sprImg(ICONS[h.id])}</span><span><b>${h.name}</b><br><small>${h.desc}</small></span>`;
    const btn = document.createElement('button'); btn.className = 'btn' + (have ? ' ghost' : '');
    btn.textContent = have ? 'Owned' : `${h.cost} point${h.cost > 1 ? 's' : ''}`;
    btn.disabled = have || S.chips < h.cost;
    btn.addEventListener('click', () => {
      if (hasH(h.id) || S.chips < h.cost) return;
      S.chips -= h.cost; hupSet.add(h.id); Sound.sfx.ach();
      toast('Heirloom', `${h.name} is now part of your family's story.`, ICONS[h.id]);
      recalc(); renderHeirlooms(true); genUI(); refreshUpgrades(true); renderSeasons(); checkAch();
    });
    d.appendChild(btn); box.appendChild(d);
  }
}
async function ascend() {
  const pend = heritageFor(S.allTime) - S.heritage; if (pend < 1) return;
  const ok = await confirmBox('Start the next generation?', `You will gain ${pend} heritage. Shekels, buildings, and upgrades reset; achievements, building levels, pomegranates, and heirlooms stay.`, 'Start the next generation');
  if (!ok) return;
  S.heritage += pend; S.chips += pend; S.gens++;
  S.bank = 0; S.earned = 0; S.handmade = 0; S.b = {}; S.buffs = []; S.genStart = NOW();
  if (!hasH('h11')) S.season = 'none';
  upSet = new Set();
  if (hasH('h5')) { S.b.bubbe = 10; S.b.bakery = 5; }
  toast("L'dor v'dor", `A new generation begins with heritage ${S.heritage} (+${S.heritage * (hasH('h16') ? 2 : 1)}% production).`, {name:'tree'});
  recalc(); refreshUpgrades(true); renderSeasons(); updateStore(); renderHood(true); checkAch(); genUI(); renderHeirlooms(true); save();
}

/* ================= HOLIDAYS ================= */
function renderSeasons() {
  const has = hasLuach();
  $('#holHint').innerHTML = has
    ? 'Pick a holiday to celebrate. Each one boosts different things, and holiday visitors float across the screen: catch them for shekels and a chance at holiday treasures (upgrades you can only find this way).'
    : 'Buy the <b>Luach</b> upgrade to unlock holiday seasons. It appears in the store after you earn one million shekels.';
  const box = $('#seasons'); box.innerHTML = '';
  Object.entries(SEASONS).forEach(([id, s]) => {
    const d = document.createElement('div'); d.className = 'card' + (S.season === id ? ' cur' : '');
    const found = s.drops ? DROP_UPS[id].filter(u => S.drops.includes(u.id)).length : 0;
    d.innerHTML = `<span class="ic">${sprImg(ICONS['s_' + id])}</span><span><b>${s.name}</b><br><small>${s.desc}${s.drops ? ` Treasures found: ${found} of 5.` : ''}</small></span>`;
    const btn = document.createElement('button'); btn.className = 'btn' + (S.season === id ? '' : ' ghost');
    btn.textContent = S.season === id ? 'Active' : 'Celebrate';
    btn.disabled = !has || S.season === id;
    btn.addEventListener('click', () => {
      S.season = id; if (id !== 'none') { S.switched = true; nextCrit = NOW() + rnd(15000, 40000); }
      nextGelt = Math.min(nextGelt, NOW() + geltDelay());
      recalc(); renderSeasons(); checkAch(); toast('Holiday', id === 'none' ? 'Back to ordinary days.' : `${s.name} has begun. ${s.desc}`, ICONS['s_' + id]);
    });
    d.appendChild(btn); box.appendChild(d);
  });
  const se = SEASONS[S.season];
  $('#seasonTag').innerHTML = S.season === 'none' ? '' : `${sprImg(ICONS['s_' + S.season], 24)}${se.name}`;
}

/* ================= JUKEBOX ================= */
Music.hooks.onHoraMax = () => { S.horaMax = true; checkAch(); toast('Up on the chair!', 'The hora hit top speed. Somebody lift the couple!', {name:'chair'}); };
Music.hooks.onLoop = () => { S.loops++; checkAch(); syncTempoUI(); };
function toggleMusic() {
  if (Music.playing) { Music.stop(); $('#playBtn').textContent = 'Play Hava Nagila'; $('#record').classList.remove('spin'); $('#npSub').textContent = 'Stopped'; $('#npBar').style.width = '0'; $('#lyric').textContent = 'Press play to start the band.'; }
  else {
    if (!Music.start()) { toast('No audio', 'This browser does not support Web Audio.', {name:'note'}); return; }
    S.played = true; $('#playBtn').textContent = 'Stop the music'; $('#record').classList.add('spin'); syncTempoUI(); checkAch();
  }
  recalc(); renderBuffs();
}
function syncTempoUI() { $('#jTempo').value = Music.bpm; $('#jTempoV').textContent = Music.bpm + ' bpm'; }
function jukeUI() {
  const p = Music.position(); if (!p) return;
  $('#np').textContent = p.sec.label;
  $('#lyric').textContent = p.sec.lyric;
  $('#npBar').style.width = (p.frac * 100) + '%';
  $('#npSub').textContent = `Time through: ${Music.loops + 1} · ${Music.bpm} bpm · ${Music.INSTR[Music.inst].name}`;
}

/* ================= STATS ================= */
function statsUI() {
  const rows = [
    ['Shekels in hand', fmt(S.bank)], ['Earned this generation', fmt(S.earned)], ['Earned all time', fmt(S.allTime)],
    ['Per second', fmt(curCps, true)], ['Per click', fmt(clickValue(), true)], ['Coin clicks', S.clicks.toLocaleString()],
    ['Earned by clicking', fmt(S.handmade)], ['Buildings owned', totalB().toLocaleString()], ['Building levels', S.levelsTotal.toLocaleString()],
    ['Upgrades owned', `${upSet.size} of ${UPGRADES.length}`], ['Achievements', `${achSet.size} of ${ACH.length}`],
    ['Golden gelt caught', S.golden.toLocaleString()], ['Holiday visitors caught', S.critTotal.toLocaleString()],
    ['Given to tzedakah', fmt(S.given)], ['Heritage', `${S.heritage} (+${S.heritage * (hasH('h16') ? 2 : 1)}%)`], ['Generation', (S.gens + 1).toLocaleString()],
    ['Pomegranates ripened', S.pom.total.toLocaleString()], ['Crops harvested', S.garden.harvests.toLocaleString()],
    ['Torah Study answers', `${S.trivia.right} right of ${S.trivia.asked}`], ['Dreidel spins', S.dreidel.spins.toLocaleString()],
    ['Times through Hava Nagila', S.loops.toLocaleString()], ['Story chapters', `${S.story.got.length} of ${STORY.length}`],
    ['Shuk trades', S.market.trades.toLocaleString()], ['Shuk profit', fmt(S.market.profit)], ['Production multiplier', '×' + globalMult(true).toFixed(2)],
    ['This generation', fmtTime((NOW() - S.genStart) / 1000)], ['Playing since', new Date(S.start).toLocaleDateString()],
  ];
  $('#statList').innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
}

/* ================= TICKER ================= */
let lastNews = '';
function nextNews() {
  const el = $('#ticker'); el.style.opacity = 0;
  setTimeout(() => {
    let msg, tries = 0;
    do {
      const r = Math.random();
      if (S.earned < 50 && r < 0.6) msg = 'Bubbe says: "One coin? Click it again, it won\'t bite."';
      else {
        const ownedB = BUILDINGS.filter(b => owned(b.id) > 0);
        const cpsLines = CPS_NEWS.filter(([n]) => curCps >= n);
        if (S.season !== 'none' && SEASON_NEWS[S.season] && r < 0.2) msg = pick(SEASON_NEWS[S.season]);
        else if (cpsLines.length && r < 0.3) msg = pick(cpsLines.slice(-3))[1];
        else if (ownedB.length && r < 0.62) msg = pick(BNEWS[pick(ownedB).id]);
        else msg = pick(NEWS);
      }
    } while (msg === lastNews && ++tries < 5);
    lastNews = msg;
    el.textContent = msg; el.style.opacity = 1;
  }, 300);
}

/* ================= STORY ================= */
const STORY_MAP = Object.fromEntries(STORY.map((c, i) => [c.id, Object.assign(c, {n:i})]));
const STORY_HINT = {c1:'bubbe', c2:'bakery', c3:'deli', c4:'school', c5:'shul', c6:'kibbutz', c7:'yeshiva', c8:'matzah', c9:'olive', c10:'scribe',
  c11:'tank', c12:'hall', c13:'golem', c14:'manna', c15:'sea', c16:'bush', c17:'ladder', c18:'chariot', c19:'tikkun'};
let storyFromOldSave = false, sceneQ = [], scene = null;
function storyCheck(quiet) {
  for (const ch of STORY) {
    if (S.story.got.includes(ch.id) || !ch.need()) continue;
    S.story.got.push(ch.id);
    if (quiet) { S.story.seen.push(ch.id); continue; }
    $('#storyDot').hidden = false;
    if (opts.story) queueScene(ch.id);
    else toast(`Chapter ${ch.n}: ${ch.title}`, 'A new chapter is waiting in the Story tab.', {name:ch.art});
    checkAch();
  }
  if (curTab === 'story') renderStory();
}
function queueScene(id) { if (!sceneQ.includes(id)) sceneQ.push(id); if (!scene) playScene(sceneQ.shift()); }
function playScene(id) {
  const ch = STORY_MAP[id]; if (!ch) return;
  scene = {ch, i:0, typing:null, shown:''};
  hideTip();
  $('#scChap').textContent = ch.n === 0 ? 'Prologue' : `Chapter ${ch.n}`;
  $('#scTitle').textContent = ch.title;
  $('#scene').hidden = false;
  sceneLine();
  $('#scNext').focus();
  Sound.sfx.ach();
}
function sceneLine() {
  const [who, text] = scene.ch.lines[scene.i], c = CAST[who];
  $('#scPort').innerHTML = sImg(who === 'narrator' ? scene.ch.art : c.spr, 80);
  $('#scWho').textContent = c.name || '';
  $('#scWho').hidden = !c.name;
  $('#scNext').textContent = scene.i === scene.ch.lines.length - 1 ? 'Close' : 'Next';
  const p = $('#scLine'); clearInterval(scene.typing);
  if (reduceMotion) { p.textContent = text; scene.typing = null; return; }
  let k = 0; p.textContent = '';
  scene.typing = setInterval(() => { k += 2; p.textContent = text.slice(0, k); if (k >= text.length) { clearInterval(scene.typing); scene.typing = null; } }, 28);
}
function sceneNext() {
  if (!scene) return;
  if (scene.typing) { clearInterval(scene.typing); scene.typing = null; $('#scLine').textContent = scene.ch.lines[scene.i][1]; return; }
  if (++scene.i < scene.ch.lines.length) { Sound.sfx.click(); sceneLine(); return; }
  sceneEnd();
}
function sceneEnd() {
  if (!scene) return;
  clearInterval(scene.typing);
  if (!S.story.seen.includes(scene.ch.id)) S.story.seen.push(scene.ch.id);
  scene = null; $('#scene').hidden = true;
  if (sceneQ.length) setTimeout(() => playScene(sceneQ.shift()), 300);
  if (curTab === 'story') renderStory();
  checkAch();
}
function renderStory() {
  const box = $('#chapters'); box.innerHTML = '';
  $('#storyDot').hidden = true;
  for (const ch of STORY) {
    const got = S.story.got.includes(ch.id), d = document.createElement('div');
    d.className = 'chap' + (got ? '' : ' locked');
    const hint = STORY_HINT[ch.id] ? `Unlocks with your first ${BMAP[STORY_HINT[ch.id]].name}.` : ch.id === 'c20' ? 'Unlocks when you start a new generation.' : '';
    d.innerHTML = `${sImg(ch.art, 64)}<span><span class="cn">${ch.n === 0 ? 'Prologue' : 'Chapter ' + ch.n}</span><b>${got ? esc(ch.title) : '???'}</b><small>${got ? esc(ch.lines[0][1].slice(0, 110)) + (ch.lines[0][1].length > 110 ? '...' : '') : hint}</small></span>`;
    if (got) { const b = document.createElement('button'); b.className = 'btn ghost'; b.textContent = S.story.seen.includes(ch.id) ? 'Replay' : 'Play'; b.addEventListener('click', () => playScene(ch.id)); d.appendChild(b); }
    box.appendChild(d);
  }
}

/* ================= MODAL ================= */
function modal({title, text, input, okText}) {
  return new Promise(res => {
    const m = $('#modal'), inp = $('#mInput');
    $('#mTitle').textContent = title; $('#mText').textContent = text || '';
    inp.hidden = input === undefined; if (input !== undefined) inp.value = input;
    $('#mOk').textContent = okText || 'Save';
    m.hidden = false; (input !== undefined ? inp : $('#mOk')).focus();
    const done = v => { m.hidden = true; $('#mOk').onclick = $('#mCancel').onclick = inp.onkeydown = null; res(v); };
    $('#mOk').onclick = () => done(input !== undefined ? inp.value : true);
    $('#mCancel').onclick = () => done(null);
    inp.onkeydown = e => { if (e.key === 'Enter') done(inp.value); if (e.key === 'Escape') done(null); };
  });
}
const confirmBox = (title, text, okText) => modal({title, text, okText}).then(v => !!v);
function renderName() { $('#commName .pl-name').textContent = S.name || 'Your Congregation'; }
$('#commName').addEventListener('click', async () => {
  const v = await modal({title:'Name your community', text:'This name appears on the plaque above the coin.', input:S.name || ''});
  if (v === null) return;
  S.name = v.trim().slice(0, 40); if (S.name) S.renamed = true; renderName(); checkAch();
});

/* ================= SAVE / LOAD ================= */
const SAVE_KEY = 'shekelClicker_v2';
function serialize() {
  S.up = [...upSet]; S.ach = [...achSet]; S.hup = [...hupSet]; S.lastSave = NOW();
  return btoa(unescape(encodeURIComponent(JSON.stringify({S, opts, music:{mode:Music.mode, inst:Music.inst, bpm:Music.bpm, band:Music.band, vol:+$('#jVol').value}}))));
}
function load(code) {
  const data = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
  const base = fresh(), d = data.S || {};
  S = Object.assign(base, d);
  for (const k of ['pom','garden','trivia','dreidel','story','market']) S[k] = Object.assign(fresh()[k], d[k] || {});
  storyFromOldSave = !d.story;
  S.up = (S.up || []).map(id => /^[a-z]+_\d$/.test(id) ? id.replace(/_(\d)$/, '_t$1') : id);
  upSet = new Set(S.up.filter(id => UPG[id])); achSet = new Set((S.ach || []).filter(id => ACHMAP[id])); hupSet = new Set(S.hup || []);
  S.buffs = (S.buffs || []).filter(b => b.end > NOW());
  if (!SEASONS[S.season]) S.season = 'none';
  Object.assign(opts, data.opts || {});
  if (data.music) { Object.assign(Music, {mode:data.music.mode || 'steady', inst:data.music.inst || 'clarinet', bpm:data.music.bpm || 152, band:data.music.band !== false}); $('#jVol').value = data.music.vol ?? 60; }
}
function save() { try { localStorage.setItem(SAVE_KEY, serialize()); return true; } catch (e) { return false; } }
function afterLoad() {
  $('#optSound').checked = opts.sound; $('#optRain').checked = opts.rain; $('#optSci').checked = opts.sci; $('#optStory').checked = opts.story !== false; $('#optLow').checked = !!opts.lowpower; applyLowPower();
  Sound.sfx.on = opts.sound;
  $('#jMode').value = Music.mode; $('#jInst').value = Music.inst; $('#jBand').checked = Music.band; syncTempoUI();
  recalc(); renderName(); renderAch(); renderSeasons(); refreshUpgrades(true); updateStore(); renderHood(true); genUI(); renderHeirlooms(true); renderBuffs(); renderPom();
}

/* ================= TABS & CONTROLS ================= */
let curTab = 'hood';
function showTab(name) {
  curTab = name;
  $$('.tab').forEach(x => x.setAttribute('aria-selected', x.dataset.tab === name));
  $$('.panel').forEach(p => p.classList.toggle('on', p.id === 'p-' + name));
  hideTip();
  if (name === 'stats') { statsUI(); renderBought(); }
  if (name === 'gen') { genUI(); renderHeirlooms(true); }
  if (name === 'ach') renderAch();
  if (name === 'mg') renderMinigames(true);
  if (name === 'hood') renderHood(true);
  if (name === 'story') renderStory();
  if (innerWidth <= 900) $('.panels').scrollTop = 0;
}
function wireControls() {
  $$('.tab').forEach(t => t.addEventListener('click', () => showTab(t.dataset.tab)));
  $$('.seg button[data-mode]').forEach(b => b.addEventListener('click', () => { mode = b.dataset.mode; $$('.seg button[data-mode]').forEach(x => x.setAttribute('aria-pressed', x === b)); updateStore(); }));
  $$('.seg button[data-qty]').forEach(b => b.addEventListener('click', () => { qty = +b.dataset.qty; $$('.seg button[data-qty]').forEach(x => x.setAttribute('aria-pressed', x === b)); updateStore(); }));
  $('#buyAll').addEventListener('click', () => {
    let n = 0; for (const u of availableUps()) if (buyUp(u, true)) n++;
    if (n) { Sound.sfx.buy(); recalc(); refreshUpgrades(true); renderSeasons(); checkAch(); toast('Upgrades bought', `${n} upgrade${n > 1 ? 's' : ''} purchased.`); }
  });
  $('#upToggle').addEventListener('click', () => { upExpanded = !upExpanded; refreshUpgrades(true); });
  $('#give10').addEventListener('click', () => give(0.1));
  $('#give50').addEventListener('click', () => give(0.5));
  $('#ascend').addEventListener('click', ascend);
  $('#ticker').addEventListener('click', () => { S.tickerClicks++; nextNews(); checkAch(); });
  $('#ticker').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#ticker').click(); } });
  $('#optSound').addEventListener('change', e => { opts.sound = e.target.checked; Sound.sfx.on = opts.sound; });
  $('#optRain').addEventListener('change', e => opts.rain = e.target.checked);
  $('#optSci').addEventListener('change', e => { opts.sci = e.target.checked; updateStore(); });
  $('#optStory').addEventListener('change', e => opts.story = e.target.checked);
  $('#optLow').addEventListener('change', e => { opts.lowpower = e.target.checked; applyLowPower(); });
  $('#scNext').addEventListener('click', sceneNext);
  $('#scSkip').addEventListener('click', sceneEnd);
  $('#scene').addEventListener('click', e => { if (e.target.id === 'scene') sceneNext(); });
  $$('#mnav button').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  document.addEventListener('keydown', onKey);
  $('#playBtn').addEventListener('click', toggleMusic);
  $('#jMode').addEventListener('change', e => { Music.mode = e.target.value; if (Music.playing && Music.mode === 'hora') Music.setTempo(112); syncTempoUI(); });
  $('#jInst').addEventListener('change', e => Music.inst = e.target.value);
  $('#jBand').addEventListener('change', e => Music.band = e.target.checked);
  $('#jTempo').addEventListener('input', e => { Music.setTempo(+e.target.value); syncTempoUI(); });
  $('#jVol').addEventListener('input', e => Sound.setMusicVol(e.target.value / 100));
  $('#saveNow').addEventListener('click', () => toast('Save', save() ? 'Game saved in this browser.' : 'This browser blocked saving. Use a save code instead.'));
  $('#exportBtn').addEventListener('click', () => { $('#saveBox').value = serialize(); $('#saveBox').select(); toast('Save code', 'Copy the code from the box to keep a backup.'); });
  $('#importBtn').addEventListener('click', () => {
    const v = $('#saveBox').value; if (!v.trim()) { toast('Load', 'Paste a save code into the box first.'); return; }
    try { load(v); afterLoad(); storyCheck(true); toast('Load', 'Save code loaded.', {name:'scroll'}); } catch (e) { toast('Load failed', 'That save code is not valid. Check that it was copied completely.', {name:'scroll'}); }
  });
  $('#wipeBtn').addEventListener('click', async () => {
    if (!await confirmBox('Wipe your save?', 'This erases everything, including achievements and heritage. It cannot be undone.', 'Wipe everything')) return;
    S = fresh(); upSet = new Set(); achSet = new Set(); hupSet = new Set();
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    afterLoad(); toast('Wiped', 'A fresh start. Bubbe is already baking.', {name:'bubbe'}); setTimeout(() => storyCheck(), 800);
  });
  const pomBtn = $('#pom'); bindTip(pomBtn, pomTipHtml);
  pomBtn.addEventListener('click', () => { showTab('hood'); setTip(pomBtn, pomTipHtml); });
}

/* ================= PHONE VIEWS & KEYBOARD ================= */
function setView(v) {
  document.body.dataset.view = v;
  $$('#mnav button').forEach(b => b.setAttribute('aria-pressed', b.dataset.view === v));
  hideTip(); resizeFx(); drawSky();
  if (v === 'town') renderHood(true);
}
function onKey(e) {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (!$('#scene').hidden) { if (e.key === 'Escape') sceneEnd(); else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sceneNext(); } return; }
  if (!$('#modal').hidden) return;
  const t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT');
  if (typing) return;
  if (e.key === ' ' && (t === document.body || t === coin)) { e.preventDefault(); if (!e.repeat) coin.click(); return; }
  if (t !== document.body && t.tagName === 'BUTTON') return;
  const q = {'1':1, '2':10, '3':100}[e.key];
  if (q) $(`.seg button[data-qty="${q}"]`).click();
  if (e.key === 's' || e.key === 'S') $(`.seg button[data-mode="${mode === 'buy' ? 'sell' : 'buy'}"]`).click();
}

function applyLowPower() {
  document.body.classList.toggle('lowpower', !!opts.lowpower);
  if (opts.lowpower) { drops.length = 0; parts.length = 0; }
  orbitStill = ''; drawHood(true);
}

/* ================= SKY & ORBIT ================= */
function drawSky() {
  const h = $('#hearth'), cv = $('#sky'), r = h.getBoundingClientRect();
  if (!r.width) return;
  const w = Math.ceil(r.width / 3), hh = Math.ceil(r.height / 3);
  if (cv.width === w && cv.height === hh) return;
  cv.width = w; cv.height = hh;
  const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(PXA.skyline(w, hh), 0, 0);
}
const orbitCv = $('#orbit'), orbitCtx = orbitCv.getContext('2d');
let handSpr = null;
function drawOrbit(t) {
  const r = orbitCv.getBoundingClientRect(); if (!r.width) return;
  const W = Math.round(r.width / 2);
  if (orbitCv.width !== W) { orbitCv.width = W; orbitCv.height = W; }
  const ctx = orbitCtx; ctx.clearRect(0, 0, W, W); ctx.imageSmoothingEnabled = false;
  const n = Math.min(owned('bubbe'), 120); if (!n) return;
  if (!handSpr) handSpr = PX.sprite('minihand');
  const c = W / 2, base = W * 0.385;
  for (let k = 0; k < n; k++) {
    const ring = Math.floor(k / 36), inRing = Math.min(36, n - ring * 36), idx = k % 36;
    const a = (idx / inRing) * Math.PI * 2 + (reduceMotion ? 0 : t / 9000) * (ring % 2 ? -1 : 1) + ring * 0.09;
    const tap = reduceMotion ? 0 : Math.round(Math.max(0, Math.sin(t / 260 - idx * 0.7)) * 2);
    const rad = base + ring * 7 - tap;
    ctx.save();
    ctx.translate(Math.round(c + Math.cos(a) * rad), Math.round(c + Math.sin(a) * rad));
    // the sprite points up-left; turn it to face the coin, snapped to 16 steps so the pixels stay tidy
    const rot = Math.round((a + Math.PI * 0.25) / (Math.PI / 8)) * (Math.PI / 8);
    ctx.rotate(rot);
    ctx.drawImage(handSpr, -1, -1);
    ctx.restore();
  }
}

/* ================= MAIN LOOP ================= */
let lastTick = NOW(), slow = 0, rainAcc = 0, lastBankTxt = '', lastCpsTxt = '';
function tick() {
  const t = NOW(), dt = Math.min((t - lastTick) / 1000, 60); lastTick = t;
  const before = S.buffs.length;
  S.buffs = S.buffs.filter(b => b.end > t);
  if (S.buffs.length !== before) recalc();
  earn(curCps * dt);
  if (t >= nextGelt) { spawnGelt(); nextGelt = t + geltDelay(); }
  if (S.season !== 'none' && hasLuach() && t >= nextCrit) { spawnCritter(); nextCrit = t + critDelay(); }
  if (document.hidden) { slow += dt; if (slow >= 5) { slow = 0; recalc(); checkAch(true); pomTick(); marketTick(); } return; }
  const bankTxt = fmt(S.bank), cpsTxt = fmt(curCps, true) + ' per second' + (S.buffs.length ? ' (boosted)' : '');
  if (bankTxt !== lastBankTxt) { lastBankTxt = bankTxt; $('#bank').textContent = bankTxt; $('#mBank').textContent = bankTxt; }
  if (cpsTxt !== lastCpsTxt) { lastCpsTxt = cpsTxt; $('#cpsLine').textContent = cpsTxt; $('#mCps').textContent = cpsTxt; }
  updateStore(); refreshUpgrades(); jukeUI();
  rainAcc += dt * Math.min(5, Math.log10(curCps + 1) * 0.7);
  while (rainAcc >= 1) { rainDrop(); rainAcc--; }
  slow += dt;
  if (slow >= 1) {
    slow = 0; recalc(); checkAch(); renderBuffs(); refreshTip(); pomTick(); storyCheck(); marketTick();
    document.title = `${fmt(S.bank)} shekels · Shekel Clicker`;
    if (curTab === 'stats') statsUI();
    if (curTab === 'gen') { genUI(); renderHeirlooms(); }
    if (curTab === 'hood') renderHood();
    if (curTab === 'mg') renderMinigames();
  }
}
/* The orbiting hands redraw 20 times a second, and not at all when the coin is
   off screen, the tab is hidden, or low-power mode is on (then they are drawn once). */
let orbitStill = '', decoT = 0;
const haloEl = $('.halo'), waveEl = $('#honey .hwave');
function animLoop() {
  setTimeout(animLoop, 50);
  if (document.hidden || (innerWidth <= 900 && document.body.dataset.view !== 'mint')) return;
  // the halo and honey wave step a few times a second (cheaper than CSS animations, which redraw every frame)
  if (!opts.lowpower && !reduceMotion && ++decoT % 4 === 0) {
    const t = performance.now();
    haloEl.style.transform = `rotate(${Math.floor(t / 200) % 240 * 1.5}deg)`;
    waveEl.style.transform = `translateX(${-48 + Math.floor(t / 150) % 16 * 3}px)`;
  }
  if (opts.lowpower || reduceMotion) { const k = owned('bubbe') + '|' + orbitCv.clientWidth; if (k === orbitStill) return; orbitStill = k; }
  else orbitStill = '';
  drawOrbit(opts.lowpower ? 0 : performance.now());
}

/* ================= BOOT ================= */
function applyArt() {
  const root = document.documentElement.style, T = PXA.textures(), M = PXA.moreTextures();
  for (const f of ['brass','wood','parch','night','stone']) root.setProperty('--fr-' + f, `url(${PXA.frameUrl(f)})`);
  root.setProperty('--tx-parch', `url(${T.parchment})`); root.setProperty('--tx-wood', `url(${T.wood})`);
  root.setProperty('--tx-dark', `url(${T.darkwood})`); root.setProperty('--tx-stone', `url(${T.stone})`);
  root.setProperty('--tx-wave', `url(${M.wave})`); root.setProperty('--tx-honey', `url(${M.honey})`); root.setProperty('--tx-soil', `url(${M.soil})`);
  coin.style.backgroundImage = `url(${PXA.bigCoin().toDataURL()})`;
  $('.pomart').innerHTML = sImg('pom');
  $('#mbar .mb-coin').innerHTML = sImg('coin', 32);
  $$('[data-ic]').forEach(el => { const t = el.classList.contains('ni') ? el : el.querySelector('.ti'); if (t) t.innerHTML = sImg(el.dataset.ic, el.classList.contains('ni') ? 32 : 24); });
}
function boot() {
  applyArt();
  resizeFx(); drawSky(); animLoop();
  buildStore(); wireControls();
  let loaded = false;
  try {
    const c = localStorage.getItem(SAVE_KEY) || localStorage.getItem('shekelClickerSave_v1');
    if (c) { load(c); loaded = true; }
  } catch (e) {}
  afterLoad();
  checkAch(true); renderAch();
  if (loaded && storyFromOldSave) {
    storyCheck(true);
    toast('The story', 'Shekel Clicker now has a story. Everything you have reached so far is in the Story tab.', {name:'scroll'});
    $('#storyDot').hidden = false;
  }
  const away = (NOW() - S.lastSave) / 1000;
  if (loaded && away > 60 && baseCps > 0) {
    const secs = Math.min(away, 7 * 86400), gain = baseCps * secs * (hasH('h2') ? 1 : 0.5);
    earn(gain);
    if (away > 3600) S.welcomeBack = true;
    toast('Welcome back!', `While you were away (${fmtTime(away)}), your community made ${fmt(gain)} shekels.`, {name:'house'});
  }
  pomTick(); checkAch(); marketTick(true);
  nextNews();
  setTimeout(() => storyCheck(), loaded ? 1500 : 900);
  setInterval(tick, 100);
  setInterval(nextNews, 11000);
  setInterval(drawHood, 280);
  setInterval(save, 30000);
  addEventListener('resize', () => { drawSky(); renderHood(); });
  addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
}
document.addEventListener('DOMContentLoaded', boot);
