"use strict";
/* =====================================================================
   Shekel Clicker: pixel renderer
   Turns the SPR grids into canvases / data URLs, with palette swaps for
   variants (a silver dreidel is the blue dreidel with its colors swapped).
   ===================================================================== */
const PX = (() => {
  const cache = {};
  const hexToRgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const RGB = Object.fromEntries(Object.entries(PAL).map(([k, v]) => [k, hexToRgb(v)]));

  /* Draw a sprite into a 2d context at (x, y), one canvas pixel per sprite pixel.
     swap maps palette letters to other letters (or to "#rrggbb"). */
  function blit(ctx, name, x = 0, y = 0, swap = null, flip = false) {
    const rows = SPR[name]; if (!rows) return;
    const h = rows.length, w = rows[0].length;
    const img = ctx.getImageData(x, y, w, h), d = img.data;
    for (let j = 0; j < h; j++) {
      const row = rows[j];
      for (let i = 0; i < w; i++) {
        let ch = row[flip ? w - 1 - i : i];
        if (!ch || ch === '.') continue;
        if (swap && swap[ch]) ch = swap[ch];
        const c = ch[0] === '#' ? hexToRgb(ch) : RGB[ch];
        if (!c) continue;
        const o = (j * w + i) * 4;
        d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
      }
    }
    ctx.putImageData(img, x, y);
  }
  function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  /* A sprite as a canvas (1x). Optional layers: [{name, x, y, swap}] drawn on top. */
  function sprite(name, swap, layers) {
    const key = name + JSON.stringify(swap || '') + JSON.stringify(layers || '');
    if (cache[key]) return cache[key];
    const rows = SPR[name] || SPR.missing;
    const c = canvas(rows[0].length, rows.length), ctx = c.getContext('2d');
    // putImageData overwrites, so draw layers onto a scratch canvas and composite
    blit(ctx, name, 0, 0, swap);
    for (const L of layers || []) {
      const s = sprite(L.name, L.swap);
      ctx.drawImage(s, L.x || 0, L.y || 0);
    }
    return (cache[key] = c);
  }
  const urlCache = {};
  function url(name, swap, layers) {
    const key = name + JSON.stringify(swap || '') + JSON.stringify(layers || '');
    return urlCache[key] || (urlCache[key] = sprite(name, swap, layers).toDataURL());
  }
  /* <img> markup for a sprite; size in CSS px (defaults to 3x). */
  function img(name, opts = {}) {
    const s = opts.size || 48;
    return `<img class="px ${opts.cls || ''}" src="${url(name, opts.swap, opts.layers)}" width="${s}" height="${s}" alt="${opts.alt || ''}" draggable="false">`;
  }
  return {blit, canvas, sprite, url, img, RGB};
})();

/* ---------------- Procedural pixel art ---------------- */
const PXA = (() => {
  const {canvas, blit, RGB} = PX;
  const BAYER = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
  const dith = (i, j, t) => (BAYER[j & 3][i & 3] + 0.5) / 16 < t;
  function seeded(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function setPx(d, w, i, j, ch) { const c = RGB[ch]; if (!c) return; const o = (j * w + i) * 4; d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255; }

  /* The big shekel, 48x48. */
  function bigCoin(N = 48) {
    const c = canvas(N, N), x = c.getContext('2d'), img = x.createImageData(N, N), d = img.data;
    const cx = (N - 1) / 2, R = N / 2 - 0.4;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const dx = i - cx, dy = j - cx, r = Math.hypot(dx, dy);
      if (r > R) continue;
      const lit = -(dx + dy) / (R * 1.45);            // light from the top left
      let ch;
      if (r > R - 1.3) ch = 'k';
      else if (r > R - 4.2) {                            // reeded rim
        const a = Math.atan2(dy, dx), notch = Math.floor((a + Math.PI) / (2 * Math.PI) * 64) % 2;
        ch = notch ? (lit > 0.25 ? 'y' : 'o') : (lit > -0.1 ? 'C' : 'Y');
      } else if (r > R - 5.2) ch = lit > 0.3 ? 'Y' : 'o'; // lip
      else {
        // smooth bands: highlight top left, warm body, shade bottom right, one dither row between bands
        const v = lit + (dith(i, j, 0.5) ? 0.04 : -0.04);
        ch = v > 0.42 ? 'C' : v > -0.18 ? 'y' : v > -0.62 ? 'Y' : 'o';
        const bead = Math.abs(r - (R - 7.6)) < 0.55;
        if (bead && Math.floor((Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI) * 40) % 2 === 0) ch = lit > 0 ? 'Y' : 'o';
      }
      setPx(d, N, i, j, ch);
    }
    x.putImageData(img, 0, 0);
    // struck relief: a pale highlight one pixel down-right of every engraved line
    const ex = Math.round((N - 16) / 2), wx = Math.round((N - 17) / 2);
    x.drawImage(PX.sprite('emblem', {o:'C', y:'C', Y:'C'}), ex + 1, 10);
    x.drawImage(PX.sprite('word', {o:'C'}), wx + 1, 30);
    x.drawImage(PX.sprite('emblem'), ex, 9);
    x.drawImage(PX.sprite('word'), wx, 29);
    return c;
  }

  /* 9x9 frames for CSS border-image (slice 4). */
  const FRAMES = {
    brass: ['.kkkkkkk.','kCyyyyyok','kyYYYYYok','kyYkkkYok','kyYk.kYok','kyYkkkYok','kyYYYYYok','kooooooOk','.kkkkkkk.'],
    wood:  ['kkkkkkkkk','kYnnnnnYk','knbbbbbBk','knbkkkbBk','knbk.kbBk','knbkkkbBk','knbbbbbBk','kYBBBBBYk','kkkkkkkkk'],
    parch: ['.kkkkkkk.','kWWWWWWek','kWeeeeeek','kWekkkeek','kWek.keek','kWekkkeek','kWeeeeeek','keeeeeeTk','.kkkkkkk.'],
    night: ['kkkkkkkkk','kdddddddk','kdDDDDDDk','kdDkkkDDk','kdDk.kDDk','kdDkkkDDk','kdDDDDDDk','kDDDDDDDk','kkkkkkkkk'],
    stone: ['kkkkkkkkk','kWWWWWWek','kWeeeeeTk','kWekkkeTk','kWek.keTk','kWekkkeTk','kWeeeeeTk','keTTTTTTk','kkkkkkkkk'],
  };
  function frameUrl(name) {
    const rows = FRAMES[name], c = canvas(9, 9), x = c.getContext('2d'), img = x.createImageData(9, 9);
    rows.forEach((r, j) => [...r].forEach((ch, i) => { if (ch !== '.') setPx(img.data, 9, i, j, ch); }));
    x.putImageData(img, 0, 0); return c.toDataURL();
  }
  /* Small tileable textures */
  function tile(w, h, fn) { const c = canvas(w, h), x = c.getContext('2d'), img = x.createImageData(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const ch = fn(i, j); if (ch) setPx(img.data, w, i, j, ch); }
    x.putImageData(img, 0, 0); return c.toDataURL(); }
  function textures() {
    const r = seeded(7);
    const parch = []; for (let k = 0; k < 256; k++) parch.push(r());
    const r2 = seeded(11), wood = []; for (let k = 0; k < 512; k++) wood.push(r2());
    return {
      parchment: tile(16, 16, (i, j) => { const v = parch[j * 16 + i]; return v < 0.06 ? 'e' : v > 0.97 ? 'w' : 'W'; }),
      wood: tile(32, 8, (i, j) => { const v = wood[j * 32 + i]; return j === 7 ? 'B' : (j === 0 ? 'n' : v < 0.08 ? 'B' : v > 0.93 ? 'n' : 'b'); }),
      darkwood: tile(32, 8, (i, j) => { const v = wood[j * 32 + i]; return j === 7 ? 'k' : (j === 0 ? 'b' : v < 0.1 ? 'O' : v > 0.94 ? 'b' : 'B'); }),
      stone: tile(24, 12, (i, j) => { const off = (j >= 6) ? 12 : 0; const ii = (i + off) % 24;
        if (j === 5 || j === 11 || ii === 0) return 'e'; const v = parch[(j * 24 + i) % 256]; return v < 0.07 ? 'e' : v > 0.96 ? 'w' : 'W'; }),
      night: tile(32, 32, (i, j) => { const v = wood[(j * 32 + i) % 512]; return v > 0.992 ? 'a' : 'D'; }),
    };
  }

  /* The night sky over Jerusalem for the coin column (drawn at 1 px = 1 sprite px). */
  function skyline(w, h) {
    const c = canvas(w, h), x = c.getContext('2d'), img = x.createImageData(w, h), d = img.data, rr = seeded(3);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const t = j / h;
      let ch = t < 0.45 ? 'D' : dith(i, j, (t - 0.45) * 2.2) ? 'd' : 'D';
      if (rr() > 0.996 && t < 0.7) ch = rr() > 0.5 ? 'a' : 'w';
      setPx(d, w, i, j, ch);
    }
    // city silhouette: walls, towers, a dome
    const base = h - 1, rnd = seeded(9);
    let i = 0;
    while (i < w) {
      const kind = rnd(), bw = 6 + Math.floor(rnd() * 12), bh = 8 + Math.floor(rnd() * 18);
      for (let k = 0; k < bw && i + k < w; k++) {
        let top = base - bh;
        if (kind > 0.8) { const dx = (k - bw / 2) / (bw / 2); top = base - bh - Math.round(Math.sqrt(Math.max(0, 1 - dx * dx)) * bw * 0.45); }
        else if (kind < 0.35 && k % 3 === 0) top -= 2;  // crenellations
        for (let j = Math.max(0, top); j <= base; j++) setPx(d, w, i + k, j, 'K');
        if (kind > 0.8 && k === Math.floor(bw / 2)) for (let j = top - 4; j < top; j++) if (j > 0) setPx(d, w, i + k, j, 'K');
        if (k % 4 === 2 && rnd() > 0.7) { const wy = top + 3 + Math.floor(rnd() * Math.max(1, bh - 6)); if (wy < base - 1) { setPx(d, w, i + k, wy, 'Y'); } }
      }
      i += bw + Math.floor(rnd() * 3);
    }
    x.putImageData(img, 0, 0);
    return c;
  }

  /* Backdrops for the neighborhood rows. Each returns a canvas w x h. */
  function rowBg(id, w, h) {
    const c = canvas(w, h), x = c.getContext('2d'), img = x.createImageData(w, h), d = img.data, rr = seeded(id.length * 97 + id.charCodeAt(0));
    const P = (i, j, ch) => setPx(d, w, i, j, ch);
    const floorY = h - 7;
    const fill = (fn) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) P(i, j, fn(i, j)); };
    const wall = {
      bubbe: (i, j) => (i % 8 === 3 && j % 6 === 2) ? 'p' : 'W',
      bakery: (i, j) => { const off = (Math.floor(j / 4) % 2) * 4; return (j % 4 === 3 || (i + off) % 8 === 0) ? 'm' : (j % 4 === 0 && (i + off) % 8 < 3 ? 'r' : 'R'); },
      deli: (i, j) => (i % 6 === 0 || j % 4 === 0) ? 'a' : 'i',
      school: (i, j) => j < 4 ? 'G' : (j > 5 && j < 16 && i % 40 > 4 && i % 40 < 30) ? (j === 6 || j === 15 ? 'b' : 'h') : 'W',
      klezmer: (i, j) => i % 6 < 3 ? 'R' : (i % 6 === 3 ? 'm' : 'R'),
      shul: (i, j) => { const off = (Math.floor(j / 5) % 2) * 6; return (j % 5 === 4 || (i + off) % 12 === 0) ? 'e' : 'W'; },
      kibbutz: (i, j) => j < floorY - 6 ? (dith(i, j, j / (floorY - 6)) ? 's' : 'S') : (j % 2 ? 'G' : 'g'),
      yeshiva: (i, j) => { const sh = j % 9; if (sh === 8) return 'B'; const b = Math.floor(i / 2) % 7; return ['R','S','G','b','U','T','m'][b]; },
      matzah: (i, j) => (i % 8 === 0 || j % 8 === 0) ? 'a' : 'i',
      olive: (i, j) => { const hill = floorY - 5 - Math.round(3 * Math.sin(i / 9) + 2 * Math.sin(i / 4.3)); return j > hill ? (dith(i, j, 0.3) ? 'G' : 'g') : (dith(i, j, j / h) ? 's' : 'i'); },
      scribe: (i, j) => (j % 6 === 5 && i % 14 < 10) ? 'e' : 'W',
      tank: (i, j) => { const bh = 6 + ((Math.floor(i / 7) * 37) % 9); return j > floorY - bh ? (i % 7 === 3 && j % 3 === 0 ? 'y' : 'K') : (dith(i, j, j / floorY) ? 'U' : 'd'); },
      hall: (i, j) => (j === 3 && i % 6 === 0) ? ['y','r','s','g'][(i / 6) % 4] : (j < 3 ? 'K' : (i % 10 < 5 ? 'p' : 'P')),
      golem: (i, j) => ((i * 13 + j * 7) % 17 === 0) ? 'z' : ((i * 3 + j * 5) % 23 === 0 ? 'A' : 'K'),
      manna: (i, j) => j < 4 && (i % 23) < 12 ? 'i' : (dith(i, j, j / floorY) ? 's' : 'S'),
      sea: (i, j) => ((i + Math.round(Math.sin(j / 2) * 2)) % 9 < 2) ? 's' : (j % 7 === 0 ? 'S' : 'd'),
      bush: (i, j) => (((i * 31 + j * 17) % 97) === 0) ? 'a' : 'D',
      ladder: (i, j) => (j > 3 && j < 7 && (i % 30) < 14) || (j > 12 && j < 15 && (i % 26) > 14) ? 'i' : 's',
      chariot: (i, j) => j < 5 ? 'R' : j < 9 ? (dith(i, j, (j - 5) / 4) ? 'c' : 'R') : j < 14 ? (dith(i, j, (j - 9) / 5) ? 'C' : 'c') : 'C',
      tikkun: (i, j) => (((i * 29 + j * 13) % 61) === 0) ? 'w' : 'D',
    }[id] || ((i, j) => 'K');
    const floor = {
      bubbe: (i, j) => j % 3 === 2 ? 'B' : 'b', bakery: (i, j) => ((i >> 2) + (j >> 2)) % 2 ? 'W' : 'e', deli: (i, j) => ((i >> 2) + (j >> 1)) % 2 ? 'k' : 'W',
      school: (i, j) => j % 3 === 2 ? 'B' : 'n', klezmer: (i, j) => j % 3 === 2 ? 'O' : 'B', shul: (i, j) => j % 3 === 2 ? 'B' : 'b',
      kibbutz: (i, j) => (i + j) % 4 === 0 ? 'B' : 'b', yeshiva: (i, j) => j % 3 === 2 ? 'B' : 'b', matzah: (i, j) => (i + j * 2) % 6 < 3 ? 'z' : 'A',
      olive: (i, j) => (i * 7 + j) % 5 === 0 ? 'T' : 't', scribe: (i, j) => j % 3 === 2 ? 'B' : 'b', tank: (i, j) => (j === 3 && i % 8 < 4) ? 'y' : 'z',
      hall: (i, j) => ((i >> 2) + (j >> 1)) % 2 ? 'W' : 'P', golem: (i, j) => (i * 3 + j) % 7 === 0 ? 'T' : 't', manna: (i, j) => (i * 5 + j * 3) % 7 === 0 ? 'n' : 'N',
      sea: (i, j) => (i * 5 + j) % 6 === 0 ? 'T' : 't', bush: (i, j) => (i * 3 + j) % 5 === 0 ? 'O' : 'o', ladder: (i, j) => j % 2 ? 'i' : 'w',
      chariot: (i, j) => (i + j) % 3 ? 'i' : 'a', tikkun: (i, j) => ((i >> 3) + j) % 3 ? 'G' : 'S',
    }[id] || ((i, j) => 'B');
    fill((i, j) => j >= floorY ? (j === floorY ? 'k' : floor(i, j - floorY)) : wall(i, j));
    x.putImageData(img, 0, 0);
    return c;
  }

  return {bigCoin, frameUrl, textures, skyline, rowBg, seeded};
})();

/* Extra tiles used by the stylesheet */
PXA.moreTextures = () => {
  const c = (w, h, fn) => { const cv = PX.canvas(w, h), x = cv.getContext('2d'), img = x.createImageData(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const ch = fn(i, j); if (!ch) continue; const v = PX.RGB[ch], o = (j * w + i) * 4; img.data[o] = v[0]; img.data[o+1] = v[1]; img.data[o+2] = v[2]; img.data[o+3] = 255; }
    x.putImageData(img, 0, 0); return cv.toDataURL(); };
  return {
    wave: c(16, 4, (i, j) => { const top = Math.round(1.5 + 1.5 * Math.sin(i / 16 * Math.PI * 2)); return j < top ? null : j === top ? 'C' : 'y'; }),
    honey: c(16, 16, (i, j) => ((i * 5 + j * 3) % 13 === 0) ? 'y' : ((i + j * 7) % 11 === 0 ? 'o' : 'Y')),
    soil: c(8, 8, (i, j) => ((i * 3 + j * 5) % 7 === 0) ? 'O' : ((i + j) % 5 === 0 ? 'B' : 'b')),
  };
};
