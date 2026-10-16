// Autoclicker detector + Klik ending test (takes ~2 min). Run: node tests/autoclicker.js
const { chromium } = require('playwright-core'); const fs=require('fs'),path=require('path'),os=require('os');
const exe = process.env.CHROME || os.homedir() + '/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async()=>{const b=await chromium.launch({executablePath:exe});const p=await b.newPage({viewport:{width:1440,height:900}}); const errs=[];
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); p.on('pageerror',e=>errs.push(e.message));
await p.route('http://shekel.test/**', async r => { let f=new URL(r.request().url()).pathname; if(f.endsWith('/'))f+='index.html'; const fp=path.join(path.join(__dirname,'..'),f); if(!fs.existsSync(fp)) return r.fulfill({status:404,body:''}); r.fulfill({status:200,contentType:{html:'text/html',js:'text/javascript',css:'text/css',png:'image/png',woff2:'font/woff2'}[path.extname(fp).slice(1)]||'application/octet-stream',body:fs.readFileSync(fp)});});
await p.goto('http://shekel.test/');await p.waitForTimeout(800); await p.click('#scSkip');
const box = await p.locator('#coin').boundingBox(), cx = box.x + box.width/2, cy = box.y + box.height/2;
// 1. human: uneven timing and positions, fast-ish
for (let i = 0; i < 80; i++) { await p.mouse.click(cx + (Math.random()*80-40), cy + (Math.random()*80-40)); await sleep(50 + Math.random()*150); }
console.log('human 80 clicks -> strikes:', await p.evaluate(() => S.auto.strikes));
// 1b. human using space bar
await p.evaluate(() => document.activeElement.blur());
for (let i = 0; i < 45; i++) { await p.keyboard.press('Space'); await sleep(60 + Math.random()*120); }
console.log('space bar 45 -> strikes:', await p.evaluate(() => S.auto.strikes));
// 2. trusted but machine-even autoclicker: same spot, every 100 ms
for (let i = 0; i < 50; i++) { await p.mouse.click(cx, cy); await sleep(100); }
console.log('even autoclicker -> strikes:', await p.evaluate(() => S.auto.strikes), 'toast:', await p.locator('.toast b').last().textContent());
// 3. scripted clicks (JS autoclicker)
await p.evaluate(() => { S.auto.last = 0; for (let i = 0; i < 5; i++) document.getElementById('coin').click(); });
await p.evaluate(() => { S.auto.last = 0; document.getElementById('coin').click(); });
console.log('scripted -> strikes:', await p.evaluate(() => S.auto.strikes), 'flagged:', await p.evaluate(() => S.auto.flagged));
// 4. buy the first kibbutz through the store (snapshot), keep building, then Klik wakes at the chariot
await p.evaluate(() => { S.b = {bubbe:20, bakery:10, deli:8, school:5, klezmer:3, shul:2}; S.bank = 3e7; S.earned = 5e7; recalc(); updateStore(); });
await p.click('#buildings li:nth-child(7) .bld'); await p.waitForTimeout(300); await p.click('#scSkip').catch(()=>{});
const before = await p.evaluate(() => ({snap: !!S.auto.snap, snapBank: S.auto.snap && S.auto.snap.bank, kib: owned('kibbutz')}));
console.log('after kibbutz purchase:', JSON.stringify(before));
await p.evaluate(() => { S.bank = 5e9; Object.assign(S.b, {kibbutz:12, yeshiva:6, golem:3}); storyCheck(true); sceneQ.length = 0; sceneEnd(); S.story.got.push('c18'); S.b.chariot = 1; recalc(); });
await p.waitForTimeout(1500);
console.log('k1 scene visible:', await p.isVisible('#scene'), 'title:', await p.textContent('#scTitle'), 'label:', await p.textContent('#scChap'));
await p.screenshot({path:require('os').tmpdir() + '/klik-scene.png'});
await p.click('#scSkip'); await p.waitForTimeout(300);
console.log('rewound buildings:', JSON.stringify(await p.evaluate(() => S.b)), 'bank matches snap:', await p.evaluate(() => S.bank === S.auto.snap.bank));
console.log('broken:', await p.evaluate(() => S.auto.broken), 'bank:', await p.evaluate(() => S.bank), 'cps:', await p.evaluate(() => curCps), 'line:', await p.textContent('#cpsLine'));
await p.screenshot({path:require('os').tmpdir() + '/klik-cracked.png'});
// autoclicks during repair don't count
await p.evaluate(() => { for (let i = 0; i < 20; i++) document.getElementById('coin').click(); });
console.log('repair after 20 scripted:', await p.evaluate(() => S.auto.repair));
// human repair: 613 uneven clicks
for (let i = 0; i < 613; i++) { await p.mouse.click(cx + (Math.random()*90-45), cy + (Math.random()*90-45)); await sleep(50 + Math.random()*90); }
await p.waitForTimeout(1500);
console.log('repair:', await p.evaluate(() => S.auto.repair), 'mended:', await p.evaluate(() => S.auto.mended), 'k2 scene:', await p.isVisible('#scene') && await p.textContent('#scTitle'));
await p.click('#scSkip').catch(()=>{});
await p.evaluate(() => { S.b.tikkun = 1; recalc(); }); await p.waitForTimeout(1500);
console.log('c19 after mending:', await p.evaluate(() => S.story.got.includes('c19')), 'cps>0:', await p.evaluate(() => curCps > 0));
await p.click('#scSkip').catch(()=>{});
await p.screenshot({path:require('os').tmpdir() + '/klik-mended.png'});
console.log('achievements au0-3:', await p.evaluate(() => ['au0','au1','au2','au3'].map(a => achSet.has(a))));
console.log('ERRORS:', errs.length ? errs.join('\n') : 'none'); await b.close();})();
