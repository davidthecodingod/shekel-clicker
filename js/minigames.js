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
const spIcon = sp => sp.art ? ART[sp.art] : sp.icon;
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
    if (S.bank < c) { toast('Kibbutz Fields', `Planting ${sp.name} costs ${fmt(c)} shekels.`); return; }
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
    const want = pr < 0.35 ? '🌱' : spIcon(sp);
    if (pi.dataset.k !== want) { pi.innerHTML = want; pi.dataset.k = want; }
    pi.style.transform = `scale(${pr < 0.35 ? 0.6 + pr : 0.55 + 0.45 * pr})`;
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
        addBuff('Wisdom ×2', {cps:2}, 30);
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
const LETTERS = {n:{h:'נ', name:'Nun', txt:'Nothing happens this time. "Nisht": nothing.'},
                 g:{h:'ג', name:'Gimel', txt:'Take it all! A big lucky payout.'},
                 h:{h:'ה', name:'Hey', txt:'Take half: a Frenzy of ×3 production for 45 seconds.'},
                 s:{h:'ש', name:'Shin', txt:'Put one in: 1% of your shekels goes to tzedakah, and you get a Chai blessing.'}};
let spinning = false, lastSpin = null;
const dreidelCD = () => 180000 * (hasH('h14') ? 0.5 : 1) * Math.max(0.3, 1 - 0.05 * (lvl('school') - 1));
function renderDreidel(host) {
  const ready = NOW() >= S.dreidel.next && !spinning;
  host.innerHTML = `<div class="dreidelbox"><div class="dreidel${spinning ? ' spinning' : ''}">${dreidelSVG(lastSpin ? LETTERS[lastSpin].h : 'ג')}</div>
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
    if (r === 'g') { const gain = Math.min(S.bank * 0.2, baseCps * 1200) + 18; earn(gain); toast('Gimel!', `You take it all: +${fmt(gain)} shekels.`); Sound.sfx.gelt(); }
    else if (r === 'h') { addBuff('Hey ×3', {cps:3}, 45); toast('Hey!', 'Half the pot: production ×3 for 45 seconds.'); Sound.sfx.gelt(); }
    else if (r === 's') { const amt = S.bank * 0.01; S.bank -= amt; S.given += amt; addBuff('Chai +18%', {cps:1.18}, 60); toast('Shin', `You put one in: ${fmt(amt)} shekels to tzedakah, plus a Chai blessing.`); }
    else toast('Nun', 'Nothing this time. Spin again later.');
    checkAch(); renderMinigames(true);
  }, 1700);
}

/* ---------------- Minigame panel ---------------- */
let mgKey = '';
function renderMinigames(force) {
  const host = $('#mg'); if (!host) return;
  const key = [lvl('kibbutz') > 0, lvl('yeshiva') > 0, lvl('school') > 0, gardenSize()].join(',');
  if (force || key !== mgKey || !host.children.length) {
    mgKey = key;
    host.innerHTML = '';
    const card = (id, title, art, need, open) => {
      const c = document.createElement('div'); c.className = 'mgcard' + (open ? '' : ' locked'); c.id = id;
      c.innerHTML = `<h3><span class="mi">${art}</span>${title}</h3><div class="mgbody"></div>`;
      if (!open) c.querySelector('.mgbody').innerHTML = `<p>${need}</p>`;
      host.appendChild(c); return open ? c.querySelector('.mgbody') : null;
    };
    const f = card('mgFields', 'Kibbutz Fields', ART.kibbutz, 'Level your Kibbutz to 1 to open the fields. Pomegranates level buildings; see the Neighborhood tab.', lvl('kibbutz') > 0);
    if (f) renderFields(f);
    const s = card('mgStudy', 'Torah Study', ART.yeshiva, 'Level your Yeshiva to 1 to open Torah Study.', lvl('yeshiva') > 0);
    if (s) renderStudy(s);
    const d = card('mgDreidel', 'Dreidel', dreidelSVG('ג'), 'Level your Hebrew School to 1 to open the Dreidel.', lvl('school') > 0);
    if (d) renderDreidel(d);
    return;
  }
  // light per-second refresh
  updateFields();
  const sb = document.querySelector('#mgStudy .mgbody');
  if (sb && (sb.querySelector('.cd') || (NOW() >= S.trivia.next && !sb.querySelector('.quiz')))) renderStudy(sb);
  const db = document.querySelector('#mgDreidel .mgbody');
  if (db && !spinning && db.querySelector('.cd')) renderDreidel(db);
  else if (db && !spinning && NOW() >= S.dreidel.next && db.querySelector('button:disabled')) renderDreidel(db);
}
