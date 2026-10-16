// Smoke test for the core flows. Run: npm i playwright-core && node tests/smoke.js
// (set CHROME=/path/to/chrome if Playwright's Chromium is not installed). Exits 1 on any failure.
const { chromium } = require('playwright-core');
const fs = require('fs'), path = require('path'), os = require('os');
const exe = process.env.CHROME || os.homedir() + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const OUT = process.env.OUT || require('os').tmpdir() + '/';
async function route(p) {
  await p.route('http://shekel.test/**', async r => {
    let f = new URL(r.request().url()).pathname; if (f.endsWith('/')) f += 'index.html';
    const fp = path.join(path.join(__dirname, '..'), decodeURIComponent(f));
    if (!fs.existsSync(fp)) return r.fulfill({status:404, body:'nf'});
    const ext = path.extname(fp).slice(1), ct = {html:'text/html',js:'text/javascript',css:'text/css',png:'image/png',woff2:'font/woff2'}[ext] || 'application/octet-stream';
    r.fulfill({status:200, contentType:ct, body:fs.readFileSync(fp)});
  });
}
(async () => {
  const b = await chromium.launch({ executablePath: exe });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await route(p);
  await p.goto('http://shekel.test/'); await p.waitForTimeout(1500);
  // play prologue through with Next
  for (let i = 0; i < 6; i++) { if (await p.isVisible('#scene')) { await p.click('#scNext'); await p.waitForTimeout(150); await p.click('#scNext').catch(()=>{}); await p.waitForTimeout(100);} }
  console.log('scene closed:', !(await p.isVisible('#scene')));
  for (let i = 0; i < 40; i++) await p.click('#coin');
  console.log('bank after 40 clicks:', await p.textContent('#bank'));
  await p.click('#buildings li:first-child .bld');
  await p.waitForTimeout(1500);
  console.log('bubbes:', await p.evaluate(() => owned('bubbe')), 'scene visible (chapter 1):', await p.isVisible('#scene'));
  await p.keyboard.press('Escape');
  // jump to mid game
  await p.evaluate(fs.readFileSync(__dirname + '/mid.js', 'utf8'));
  await p.waitForTimeout(400);
  for (const t of ['story','mg','ach','gen','hol','juke','stats','opt','hood']) {
    await p.click(`.tab[data-tab="${t}"]`); await p.waitForTimeout(300);
    if (['story','mg','ach','stats'].includes(t)) await p.screenshot({ path: OUT + 'tab-' + t + '.png' });
  }
  await p.click('.tab[data-tab="mg"]'); await p.waitForTimeout(300);
  await p.click('#mgShuk tbody tr:first-child button[data-n="10"]'); await p.waitForTimeout(200);
  console.log('shuk trades:', await p.evaluate(() => S.market.trades), 'olives held:', await p.evaluate(() => S.market.goods.olives.have));
  await p.click('#mgShuk tbody tr:first-child button[data-n="-999999"]');
  console.log('after sell held:', await p.evaluate(() => S.market.goods.olives.have));
  // plant a crop
  await p.click('#mgFields .plot'); await p.waitForTimeout(200);
  console.log('planted:', await p.evaluate(() => !!S.garden.plots[0]));
  await p.click('#mgDreidel .btn'); await p.waitForTimeout(2200);
  console.log('dreidel spins:', await p.evaluate(() => S.dreidel.spins));
  // replay a chapter from story tab
  await p.click('.tab[data-tab="story"]'); await p.waitForTimeout(200);
  await p.click('#chapters .chap:nth-child(3) .btn'); await p.waitForTimeout(700);
  await p.screenshot({ path: OUT + 'scene.png' });
  await p.click('#scSkip');
  // gelt + critter
  await p.evaluate(() => { spawnGelt(); S.season = 'hanukkah'; upSet.add('luach'); spawnCritter(); });
  await p.waitForTimeout(500);
  await p.screenshot({ path: OUT + 'gelt.png' });
  await p.click('.gelt'); await p.waitForTimeout(300);
  // tooltips
  await p.hover('#upgrades .up'); await p.waitForTimeout(200); await p.screenshot({ path: OUT + 'tip-up.png' });
  await p.hover('#buildings li:nth-child(2) .bld'); await p.waitForTimeout(200); await p.screenshot({ path: OUT + 'tip-b.png' });
  // save/load roundtrip
  const ok = await p.evaluate(() => { const c = serialize(); load(c); afterLoad(); return owned('bubbe'); });
  console.log('save/load bubbes:', ok);
  // ascend
  await p.evaluate(() => { S.allTime = 1e15; genUI(); });
  await p.click('.tab[data-tab="gen"]'); await p.click('#ascend'); await p.waitForTimeout(200); await p.click('#mOk'); await p.waitForTimeout(1800);
  console.log('gens:', await p.evaluate(() => S.gens), 'saturn scene:', await p.evaluate(() => S.story.got.includes('c20')));
  console.log('ERRORS:', errs.length ? errs.join('\n') : 'none');
  const fail = [];
  if (errs.length) fail.push('console errors');
  if (await p.evaluate(() => S.gens) !== 1) fail.push('ascension');
  if (!(await p.evaluate(() => S.story.got.includes('c20')))) fail.push('epilogue');
  if (await p.evaluate(() => S.market.trades) < 2) fail.push('shuk trades');
  if (await p.evaluate(() => S.dreidel.spins) < 1) fail.push('dreidel');
  await b.close();
  console.log(fail.length ? 'FAIL: ' + fail.join(', ') : 'PASS');
  process.exit(fail.length ? 1 : 0);
})();
