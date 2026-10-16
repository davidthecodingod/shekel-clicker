"use strict";
/* =====================================================================
   Minigames: Kibbutz Fields (garden), Torah Study (trivia), Dreidel.
   Each opens at level 1 of its building.
   ===================================================================== */

/* ---------------- Kibbutz Fields ---------------- */
let selSeed = 'wheat';
const gardenSize = () => Math.min(6, 2 + lvl('kibbutz'));
function ensurePlots() { const n = gardenSize() ** 2; while (S.garden.plots.length < n) S.garden.plots.push(null); }
const plantProg = p => Math.min(1, (NOW() - p.at) / (SPECIES_MAP[p.t].grow * 1000));
const seedOpen = sp => owned('kibbutz') >= sp.need;
const seedCost = sp => Math.max(10, baseCps * sp.cost);
const spIcon = (sp, size = 28) => sprImg(ICONS['sp_' + sp.id], size);
function gardenEffects() {
  const fx = {cps:0, click:0, freq:0, dur:0, cheap:0};
  if (lvl('kibbutz') < 1 || !S.garden) return fx;
  const n = gardenSize() ** 2;
  for (let i = 0; i < n && i < S.garden.plots.length; i++) {
    const p = S.garden.plots[i];
    if (p && SPECIES_MAP[p.t] && plantProg(p) >= 1) { const e = SPECIES_MAP[p.t].fx; for (const k in e) fx[k] += e[k]; }
  }
  fx.cheap = Math.min(0.1, fx.cheap);
  return fx;
}
function plotClick(i, el) {
  ensurePlots();
  const p = S.garden.plots[i];
  if (!p) {
    const sp = SPECIES_MAP[selSeed];
    if (!seedOpen(sp)) return;
    const c = seedCost(sp);
    if (S.bank < c) { toast('Kibbutz Fields', `Planting ${sp.name} costs ${fmt(c)} shekels.`, ICONS['sp_' + sp.id]); return; }
    S.bank -= c; S.garden.plots[i] = {t:sp.id, at:NOW()}; Sound.sfx.buy();
  } else if (plantProg(p) >= 1) {
    const sp = SPECIES_MAP[p.t], pay = Math.max(10, baseCps * sp.pay);
    earn(pay); S.garden.plots[i] = null; S.garden.harvests++;
    if (!S.garden.species.includes(sp.id)) S.garden.species.push(sp.id);
    let msg = `+${fmt(pay)}`;
    if (sp.id === 'pomegranates' && S.pom.since && Math.random() < 0.15) { S.pom.n++; S.pom.total++; msg += ' and a pomegranate!'; renderPom(); renderHood(true); }
    const r = el.getBoundingClientRect(); pop(r.left + r.width/2, r.top, msg); burst(r.left + r.width/2, r.top + r.height/2, 8);
    Sound.sfx.gelt(); checkAch();
  } else return;
  recalc(); updateFields(); refreshTip();
}
function plotTip(i) {
  const p = S.garden.plots[i];
  if (!p) { const sp = SPECIES_MAP[selSeed]; return `<span class="tn">Empty plot</span>Click to plant <b>${sp.name}</b> for ${fmt(seedCost(sp))} shekels.<hr>${sp.eff}. Ripens in ${fmtTime(sp.grow)}.`; }
  const sp = SPECIES_MAP[p.t], pr = plantProg(p);
  return pr >= 1
    ? `<span class="tn">${sp.name}: ripe</span>${sp.eff}.<hr>Click to harvest for about ${fmt(Math.max(10, baseCps * sp.pay))} shekels.`
    : `<span class="tn">${sp.name}: growing</span>${Math.floor(pr * 100)}% grown, ripe in ${fmtTime(sp.grow * (1 - pr))}.<hr>When ripe: ${sp.eff}.`;
}
let fieldsSize = 0;
function renderFields(host) {
  ensurePlots();
  const n = gardenSize();
  host.innerHTML = `<p>Plant crops from the Seven Species. Ripe crops give a bonus while they stand; harvest them for a big payout. More plots open as the Kibbutz levels up (${n}×${n} now).</p><div class="seeds"></div><div class="plots" style="grid-template-columns:repeat(${n},1fr)"></div>`;
  const seeds = host.querySelector('.seeds');
  for (const sp of SPECIES) {
    const b = document.createElement('button'); b.className = 'seed' + (selSeed === sp.id ? ' on' : ''); b.dataset.sp = sp.id;
    b.innerHTML = `<span class="si">${spIcon(sp)}</span>${seedOpen(sp) ? sp.name : '???'}`;
    b.disabled = !seedOpen(sp);
    b.addEventListener('click', () => { selSeed = sp.id; seeds.querySelectorAll('.seed').forEach(x => x.classList.toggle('on', x === b)); });
    bindTip(b, () => seedOpen(sp) ? `<span class="tn">${sp.name}</span>Costs ${fmt(seedCost(sp))} shekels. Ripens in ${fmtTime(sp.grow)}.<hr>${sp.eff}.` : `<span class="tn">Locked seed</span>Own ${sp.need} Kibbutzim to unlock.`);
    seeds.appendChild(b);
  }
  const grid = host.querySelector('.plots');
  for (let i = 0; i < n * n; i++) {
    const b = document.createElement('button'); b.className = 'plot'; b.dataset.i = i;
    b.innerHTML = '<span class="pi"></span><span class="bar"><i></i></span>';
    b.addEventListener('click', () => plotClick(i, b));
    bindTip(b, () => plotTip(i));
    grid.appendChild(b);
  }
  fieldsSize = n;
  updateFields();
}
function updateFields() {
  const grid = document.querySelector('#mgFields .plots'); if (!grid) return;
  for (const b of grid.children) {
    const p = S.garden.plots[+b.dataset.i], pi = b.firstChild, bar = b.querySelector('.bar'), fill = bar.firstChild;
    if (!p) { pi.innerHTML = ''; bar.style.display = 'none'; b.classList.remove('ripe'); continue; }
    const sp = SPECIES_MAP[p.t], pr = plantProg(p);
    b.classList.toggle('ripe', pr >= 1);
    bar.style.display = pr >= 1 ? 'none' : ''; fill.style.width = (pr * 100) + '%';
    const want = pr < 0.35 ? 'sprout' : sp.id;
    if (pi.dataset.k !== want) { pi.innerHTML = want === 'sprout' ? sImg('sprout') : spIcon(sp, 48); pi.dataset.k = want; }
    pi.style.transform = `scale(${pr < 0.35 ? 0.75 : pr < 1 ? 0.85 : 1})`;
    pi.style.opacity = pr >= 1 ? 1 : 0.8;
  }
  document.querySelectorAll('#mgFields .seed').forEach(b => { const sp = SPECIES_MAP[b.dataset.sp]; b.disabled = !seedOpen(sp); });
}

/* ---------------- Torah Study ---------------- */
let curQ = -1, lastAnswer = null;
const studyCD = () => 120000 * (hasH('h14') ? 0.5 : 1) * Math.max(0.3, 1 - 0.05 * (lvl('yeshiva') - 1));
function nextQuestion() {
  let pool = TRIVIA.map((_, i) => i).filter(i => !S.trivia.seen.includes(i));
  if (!pool.length) { S.trivia.seen = []; pool = TRIVIA.map((_, i) => i); }
  curQ = pick(pool);
}
function renderStudy(host) {
  if (NOW() < S.trivia.next) {
    host.innerHTML = `<p>${lastAnswer || 'The chavruta is taking a break.'}</p><p>Next question in <b class="cd">${fmtTime((S.trivia.next - NOW()) / 1000)}</b>. Streak: ${S.trivia.streak} · Best: ${S.trivia.best}</p>`;
    return;
  }
  if (curQ < 0) nextQuestion();
  const [q, answers, right] = TRIVIA[curQ];
  host.innerHTML = `<p>Answer correctly for a Wisdom blessing (production ×2 for 30 seconds) and a shekel reward. Streak: ${S.trivia.streak} · Best: ${S.trivia.best}</p><div class="quiz"><q></q><div class="answers"></div></div>`;
  host.querySelector('q').textContent = q;
  const box = host.querySelector('.answers');
  answers.forEach((a, i) => {
    const b = document.createElement('button'); b.textContent = a;
    b.addEventListener('click', () => {
      S.trivia.asked++; S.trivia.seen.push(curQ);
      [...box.children].forEach((x, j) => { x.disabled = true; if (j === right) x.classList.add('right'); });
      if (i === right) {
        S.trivia.right++; S.trivia.streak++; S.trivia.best = Math.max(S.trivia.best, S.trivia.streak);
        const pay = Math.max(50, baseCps * 120); earn(pay);
        addBuff('Wisdom ×2', {cps:2}, 30, 'book');
        lastAnswer = `Correct! "${answers[right]}" earned ${fmt(pay)} shekels and a Wisdom blessing.`;
        Sound.sfx.gelt();
      } else {
        b.classList.add('wrong'); S.trivia.streak = 0;
        lastAnswer = `Not quite. The answer was "${answers[right]}." Keep learning!`;
        Sound.sfx.wrong();
      }
      S.trivia.next = NOW() + studyCD(); curQ = -1; checkAch();
      setTimeout(() => renderMinigames(true), 1800);
    });
    box.appendChild(b);
  });
}

/* ---------------- Dreidel ---------------- */
const LETTER_SPR = {n:'nun', g:'gimel', h:'hey', s:'shin'};
const dreidelImg = (l, size = 96) => sprImg({name:'dreidel', layers:[{name:LETTER_SPR[l], x:5, y:5}]}, size);
const LETTERS = {n:{h:'נ', name:'Nun', txt:'Nothing happens this time. "Nisht": nothing.'},
                 g:{h:'ג', name:'Gimel', txt:'Take it all! A big lucky payout.'},
                 h:{h:'ה', name:'Hey', txt:'Take half: a Frenzy of ×3 production for 45 seconds.'},
                 s:{h:'ש', name:'Shin', txt:'Put one in: 1% of your shekels goes to tzedakah, and you get a Chai blessing.'}};
let spinning = false, lastSpin = null;
const dreidelCD = () => 180000 * (hasH('h14') ? 0.5 : 1) * Math.max(0.3, 1 - 0.05 * (lvl('school') - 1));
function renderDreidel(host) {
  const ready = NOW() >= S.dreidel.next && !spinning;
  host.innerHTML = `<div class="dreidelbox"><div class="dreidel${spinning ? ' spinning' : ''}">${dreidelImg(lastSpin || 'g')}</div>
    <div><p>${lastSpin ? `<b>${LETTERS[lastSpin].name}!</b> ${LETTERS[lastSpin].txt}` : 'Spin for a surprise. Every letter means something different.'}</p>
    <p>${ready ? '' : spinning ? 'Spinning...' : `Next spin in <b class="cd">${fmtTime((S.dreidel.next - NOW()) / 1000)}</b>.`}</p>
    <button class="btn" ${ready ? '' : 'disabled'}>Spin the dreidel</button></div></div>`;
  host.querySelector('button').addEventListener('click', spinDreidel);
}
function spinDreidel() {
  if (spinning || NOW() < S.dreidel.next) return;
  spinning = true; Sound.sfx.spin(); renderMinigames(true);
  setTimeout(() => {
    spinning = false;
    const r = pick(['n','g','h','s']); lastSpin = r;
    S.dreidel.spins++; if (!S.dreidel.got.includes(r)) S.dreidel.got.push(r);
    S.dreidel.next = NOW() + dreidelCD();
    const di = {name:'dreidel', layers:[{name:LETTER_SPR[r], x:5, y:5}]};
    if (r === 'g') { const gain = Math.min(S.bank * 0.2, baseCps * 1200) + 18; earn(gain); toast('Gimel!', `You take it all: +${fmt(gain)} shekels.`, di); Sound.sfx.gelt(); }
    else if (r === 'h') { addBuff('Hey ×3', {cps:3}, 45, di); toast('Hey!', 'Half the pot: production ×3 for 45 seconds.', di); Sound.sfx.gelt(); }
    else if (r === 's') { const amt = S.bank * 0.01; S.bank -= amt; S.given += amt; addBuff('Chai +18%', {cps:1.18}, 60, 'box'); toast('Shin', `You put one in: ${fmt(amt)} shekels to tzedakah, plus a Chai blessing.`, di); }
    else toast('Nun', 'Nothing this time. Spin again later.', di);
    checkAch(); renderMinigames(true);
  }, 1700);
}

/* ---------------- Minigame panel ---------------- */
let mgKey = '';
function renderMinigames(force) {
  const host = $('#mg'); if (!host) return;
  const key = [lvl('kibbutz') > 0, lvl('yeshiva') > 0, lvl('school') > 0, lvl('deli') > 0, gardenSize()].join(',');
  if (force || key !== mgKey || !host.children.length) {
    mgKey = key;
    host.innerHTML = '';
    const card = (id, title, art, need, open) => {
      const c = document.createElement('div'); c.className = 'mgcard' + (open ? '' : ' locked'); c.id = id;
      c.innerHTML = `<h3><span class="mi">${art}</span>${title}</h3><div class="mgbody"></div>`;
      if (!open) c.querySelector('.mgbody').innerHTML = `<p>${need}</p>`;
      host.appendChild(c); return open ? c.querySelector('.mgbody') : null;
    };
    const m = card('mgShuk', 'The Shuk', sImg('stall', 32), 'Level your Kosher Deli to 1 to open the Shuk, a market where prices rise and fall every minute.', lvl('deli') > 0);
    if (m) renderShuk(m);
    const f = card('mgFields', 'Kibbutz Fields', sImg('kibbutz', 32), 'Level your Kibbutz to 1 to open the fields. Pomegranates level buildings; see the Neighborhood tab.', lvl('kibbutz') > 0);
    if (f) renderFields(f);
    const s = card('mgStudy', 'Torah Study', sImg('yeshiva', 32), 'Level your Yeshiva to 1 to open Torah Study.', lvl('yeshiva') > 0);
    if (s) renderStudy(s);
    const d = card('mgDreidel', 'Dreidel', dreidelImg('g', 32), 'Level your Hebrew School to 1 to open the Dreidel.', lvl('school') > 0);
    if (d) renderDreidel(d);
    return;
  }
  // light per-second refresh
  updateFields(); updateShuk();
  const sb = document.querySelector('#mgStudy .mgbody');
  if (sb && (sb.querySelector('.cd') || (NOW() >= S.trivia.next && !sb.querySelector('.quiz')))) renderStudy(sb);
  const db = document.querySelector('#mgDreidel .mgbody');
  if (db && !spinning && db.querySelector('.cd')) renderDreidel(db);
  else if (db && !spinning && NOW() >= S.dreidel.next && db.querySelector('button:disabled')) renderDreidel(db);
}

/* ---------------- The Shuk (market) ----------------
   Six goods whose prices move once a market day (60 seconds). A price of 10
   means 10 seconds of your base production per crate. Buy low, sell high.
   Unlocks at Kosher Deli level 1. */
const GOODS = [
  {id:'olives', name:'Olives',  spr:'olives', base:24, vol:3},
  {id:'spice',  name:'Spices',  spr:'spice',  base:40, vol:5},
  {id:'pickle', name:'Pickles', spr:'pickle', base:16, vol:2.5},
  {id:'cloth',  name:'Fabric',  spr:'cloth',  base:55, vol:6},
  {id:'etrog',  name:'Etrogim', spr:'etrog',  base:70, vol:9},
  {id:'halva',  name:'Halva',   spr:'halva',  base:32, vol:4},
];
const MARKET_DAY = 60000;
const MOODS = [
  {id:'calm',    label:'Calm',     drift:0,     noise:0.5},
  {id:'rising',  label:'Rising',   drift:0.04,  noise:0.6},
  {id:'falling', label:'Falling',  drift:-0.04, noise:0.6},
  {id:'wild',    label:'Wild',     drift:0,     noise:1.8},
  {id:'boom',    label:'Booming',  drift:0.12,  noise:1},
  {id:'bust',    label:'Crashing', drift:-0.12, noise:1},
];
const crateValue = () => Math.max(1, baseCps);
const stockCap = () => 10 + 2 * owned('deli') + 10 * lvl('deli');
function goodState(g) {
  let st = S.market.goods[g.id];
  if (!st) st = S.market.goods[g.id] = {p:g.base * (0.7 + Math.random() * 0.6), mood:'calm', left:3, hist:[], have:0, paid:0};
  return st;
}
function marketStep() {
  S.market.day++;
  for (const g of GOODS) {
    const st = goodState(g);
    if (--st.left <= 0) {
      const r = Math.random();
      st.mood = r < 0.35 ? 'calm' : r < 0.55 ? 'rising' : r < 0.75 ? 'falling' : r < 0.88 ? 'wild' : r < 0.94 ? 'boom' : 'bust';
      st.left = 2 + Math.floor(Math.random() * 8);
    }
    const m = MOODS.find(x => x.id === st.mood);
    const revert = (g.base - st.p) * 0.05;               // prices drift back toward normal
    st.p = Math.max(1, st.p * (1 + m.drift) + revert + (Math.random() * 2 - 1) * g.vol * m.noise);
    st.hist.push(st.p); if (st.hist.length > 40) st.hist.shift();
  }
}
function marketTick(catchUp) {
  if (lvl('deli') < 1) return;
  if (!S.market.last) { S.market.last = NOW(); for (const g of GOODS) { const st = goodState(g); for (let i = 0; i < 12; i++) { st.hist.push(st.p); } } return; }
  let steps = 0;
  while (NOW() - S.market.last >= MARKET_DAY && steps < 200) { marketStep(); S.market.last += MARKET_DAY; steps++; }
  if (steps >= 200) S.market.last = NOW();
  if (steps && curTab === 'mg') updateShuk(true);
}
function trade(g, n) {
  const st = goodState(g), each = st.p * crateValue();
  if (n > 0) {
    n = Math.min(n, stockCap() - st.have, Math.floor(S.bank / each));
    if (n <= 0) { toast('The Shuk', st.have >= stockCap() ? `Your stall is full of ${g.name.toLowerCase()}. Level up or buy more Delis for more space.` : `You cannot afford a crate of ${g.name.toLowerCase()} right now.`, {name:g.spr}); return; }
    S.bank -= each * n; st.have += n; st.paid += each * n; Sound.sfx.buy();
  } else {
    n = Math.min(-n, st.have); if (!n) return;
    const avg = st.paid / st.have, gain = each * n;
    S.market.profit = Math.max(0, S.market.profit + gain - avg * n);
    st.paid -= avg * n; st.have -= n; earn(gain); Sound.sfx.gelt();
  }
  S.market.trades++; checkAch(); updateShuk(true);
}
function spark(cv, hist, up) {
  const ctx = cv.getContext('2d'), w = cv.width, h = cv.height; ctx.clearRect(0, 0, w, h);
  if (hist.length < 2) return;
  const lo = Math.min(...hist), hi = Math.max(...hist), span = Math.max(1e-6, hi - lo);
  ctx.fillStyle = up ? PAL.G : PAL.R;
  hist.forEach((v, i) => { const x = Math.round(i / (hist.length - 1) * (w - 1)), y = Math.round((h - 2) - (v - lo) / span * (h - 3)); ctx.fillRect(x, y, 1, 2); });
}
function renderShuk(host) {
  host.innerHTML = `<p>Prices change every market day (one minute). A price of 10 means a crate costs 10 seconds of your base production. Your stall holds <b class="cap"></b> crates of each good.</p>
    <div class="shuk-sum"><span class="sday"></span><span class="snext"></span><span class="sprof"></span></div>
    <table class="shuk"><thead><tr><th>Good</th><th>Price</th><th>Trend</th><th>Stall</th><th></th></tr></thead><tbody></tbody></table>`;
  const tb = host.querySelector('tbody');
  for (const g of GOODS) {
    const tr = document.createElement('tr'); tr.dataset.g = g.id;
    tr.innerHTML = `<td><span class="gd">${sImg(g.spr, 32)}${g.name}</span></td><td class="px"></td><td><canvas class="spark" width="48" height="14"></canvas></td><td class="px hv"></td>
      <td><button class="mini" data-n="1">Buy 1</button><button class="mini" data-n="10">Buy 10</button><button class="mini" data-n="-999999">Sell all</button></td>`;
    tr.querySelectorAll('button').forEach(b => b.addEventListener('click', () => trade(g, +b.dataset.n)));
    bindTip(tr.querySelector('.gd'), () => { const st = goodState(g), m = MOODS.find(x => x.id === st.mood); return `<div class="th">${sImg(g.spr)}<span class="tn">${g.name}</span></div>Market mood: <b>${m.label}</b>. Usual price around ${g.base}.<hr>Crate price now: ${fmt(st.p * crateValue())} shekels.${st.have ? `<br>You paid about ${fmt(st.paid / st.have)} per crate.` : ''}`; });
    tb.appendChild(tr);
  }
  updateShuk(true);
}
function updateShuk(full) {
  const host = document.querySelector('#mgShuk .mgbody'); if (!host || !host.querySelector('tbody')) return;
  host.querySelector('.cap').textContent = stockCap();
  host.querySelector('.sday').textContent = `Market day ${S.market.day}`;
  host.querySelector('.snext').textContent = `Next day in ${fmtTime((MARKET_DAY - (NOW() - S.market.last)) / 1000)}`;
  host.querySelector('.sprof').textContent = `Profit so far: ${fmt(S.market.profit)}`;
  for (const tr of host.querySelectorAll('tbody tr')) {
    const g = GOODS.find(x => x.id === tr.dataset.g), st = goodState(g), h = st.hist, prev = h.length > 1 ? h[h.length - 2] : st.p, up = st.p >= prev;
    const pc = tr.children[1]; pc.textContent = `${st.p.toFixed(1)} ${up ? '▲' : '▼'}`; pc.className = 'px ' + (up ? 'up1' : 'dn1');
    tr.querySelector('.hv').textContent = `${st.have}/${stockCap()}`;
    if (full) spark(tr.querySelector('canvas'), h, up);
  }
}
