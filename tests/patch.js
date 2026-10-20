// Torah Study answers + patch notes popup. Run: node tests/patch.js (same setup as smoke.js). Exits 1 on any failure.
const { chromium } = require('playwright-core');
const fs = require('fs'), path = require('path'), os = require('os');
const exe = process.env.CHROME || os.homedir() + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const OUT = process.env.OUT || os.tmpdir() + '/';
const EXPECT = ['Eight','Hanukkiah','Shavuot','Apples dipped in honey','Four','Afikoman','Esther','Shofar','Ten','Sukkot','Etrog','Yom Kippur','Five','Genesis','Peace','Congratulations','Gimel','A great miracle happened there','Challah','Mezuzah','Tu BiShvat','Havdalah','Queen Esther','Haman','The Maccabees','Eight days','Chuppah','A glass','13','Tzedakah','Moses','Ten','Forty','Manna','Mount Sinai','22','Right to left','Purim','Triangular','Dayenu','Simchat Torah','Tallit','To life','Let us rejoice','Ner Tamid','Nine','The Israelites left Egypt in such a hurry the bread could not rise','Pomegranate','The Ark','Elijah','Head of the Year','Dairy foods','Two','Fit or proper','Lots','Dedication','Parashah','Friday at sunset'];
let fail = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fail++; };
async function route(p) {
  await p.route('http://shekel.test/**', async r => {
    let f = new URL(r.request().url()).pathname; if (f.endsWith('/')) f += 'index.html';
    const fp = path.join(__dirname, '..', decodeURIComponent(f));
    if (!fs.existsSync(fp)) return r.fulfill({status:404, body:'nf'});
    const ext = path.extname(fp).slice(1), ct = {html:'text/html',js:'text/javascript',css:'text/css',png:'image/png',woff2:'font/woff2'}[ext] || 'application/octet-stream';
    r.fulfill({status:200, contentType:ct, body:fs.readFileSync(fp)});
  });
}
async function skipScenes(p) { for (let i = 0; i < 12 && await p.isVisible('#scene'); i++) { await p.click('#scSkip').catch(()=>{}); await p.waitForTimeout(200); } }
(async () => {
  const b = await chromium.launch({ executablePath: exe });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await route(p);

  // New player: no popup.
  await p.goto('http://shekel.test/'); await p.waitForTimeout(1500); await skipScenes(p); await p.waitForTimeout(3000);
  ok(!(await p.isVisible('#patch')), 'new player sees no patch notes');

  // Every question: the expected answer is offered and counts as correct.
  const res = await p.evaluate(EXPECT => {
    const out = []; const host = document.createElement('div'); document.body.appendChild(host);
    const realRender = renderMinigames; renderMinigames = () => {};
    TRIVIA.forEach(([q, a], i) => {
      S.trivia.next = 0; curQ = i; renderStudy(host);
      const btn = [...host.querySelectorAll('.answers button')].find(x => x.textContent === EXPECT[i]);
      if (!btn) { out.push(`${i} "${q}": expected answer missing`); return; }
      btn.click();
      if (!String(lastAnswer).startsWith('Correct')) out.push(`${i} "${q}": marked wrong`);
      if (a.length !== 4) out.push(`${i} has ${a.length} choices`);
    });
    renderMinigames = realRender; host.remove();
    return {n: TRIVIA.length, problems: out};
  }, EXPECT);
  ok(res.n === EXPECT.length, `question count ${res.n}`);
  ok(res.problems.length === 0, 'all answers correct' + (res.problems.length ? ': ' + res.problems.join('; ') : ''));

  // Returning player with old trivia stats: popup shows once, stats untouched.
  await p.evaluate(() => { S.trivia.right = 5; S.trivia.asked = 9; S.trivia.best = 3; save(); localStorage.removeItem('shekelClicker_patch'); });
  await p.reload(); await p.waitForTimeout(1500); await skipScenes(p);
  await p.waitForSelector('#patch:not([hidden])', { timeout: 8000 }).catch(() => {});
  ok(await p.isVisible('#patch'), 'returning player sees patch notes');
  ok((await p.textContent('#pnList')).includes('Torah Study was broken'), 'notes mention the Torah fix');
  await p.screenshot({ path: OUT + 'patch_desktop.png' });
  await p.setViewportSize({ width: 390, height: 844 }); await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + 'patch_mobile.png' });
  await p.setViewportSize({ width: 1440, height: 900 });
  const st = await p.evaluate(() => [S.trivia.right, S.trivia.asked, S.trivia.best].join(','));
  ok(st === '5,9,3', 'trivia stats kept: ' + st);
  await p.click('#pnOk');
  ok(!(await p.isVisible('#patch')), 'Got it closes the popup');
  await p.reload(); await p.waitForTimeout(1500); await skipScenes(p); await p.waitForTimeout(3500);
  ok(!(await p.isVisible('#patch')), 'popup does not come back after dismissal');

  // Escape also dismisses.
  await p.evaluate(() => localStorage.removeItem('shekelClicker_patch'));
  await p.reload(); await p.waitForTimeout(1500); await skipScenes(p);
  await p.waitForSelector('#patch:not([hidden])', { timeout: 8000 }).catch(() => {});
  await p.keyboard.press('Escape');
  ok(!(await p.isVisible('#patch')), 'Escape closes the popup');

  // A story scene starting under the open popup: Enter on "Got it" still closes the popup.
  await p.evaluate(() => localStorage.removeItem('shekelClicker_patch'));
  await p.reload(); await p.waitForTimeout(1500); await skipScenes(p);
  await p.waitForSelector('#patch:not([hidden])', { timeout: 8000 }).catch(() => {});
  await p.evaluate(() => playScene('c0'));
  await p.focus('#pnOk'); await p.keyboard.press('Enter');
  ok(!(await p.isVisible('#patch')), 'Enter closes the popup with a scene behind it');
  ok(await p.isVisible('#scene'), 'scene behind was not skipped');

  // Script and CSS URLs carry a version so returning players get the fixed data.js with the new game.js.
  const tags = await p.evaluate(() => [...document.querySelectorAll('script[src],link[rel=stylesheet]')].map(e => e.getAttribute('src') || e.getAttribute('href')));
  ok(tags.length === 8 && tags.every(u => /\?v=/.test(u)), 'assets versioned: ' + tags.join(' '));

  ok(errs.length === 0, 'no console errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close();
  console.log(fail ? `${fail} FAILED` : 'ALL PASS');
  process.exit(fail ? 1 : 0);
})();
