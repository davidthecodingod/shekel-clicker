"use strict";
/* Hand-drawn SVG art for Shekel Clicker. Every building has a 64x64 illustration. */
const INK = '#2B1F12';
const svgWrap = (inner, vb = '0 0 64 64') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><g stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">${inner}</g></svg>`;

const ART = {
  bubbe: svgWrap(`
    <path d="M12 63c0-13 9-19 20-19s20 6 20 19z" fill="#7B4F8E"/>
    <path d="M26 44l6 8 6-8" fill="#F1E6F3"/>
    <circle cx="32" cy="29" r="15" fill="#F3C9A1"/>
    <circle cx="32" cy="10" r="6" fill="#DCDCDC"/>
    <path d="M16 29c-1-11 7-17 16-17s17 6 16 17c-4-6-9-8-16-8s-12 2-16 8z" fill="#DCDCDC"/>
    <circle cx="26" cy="30" r="4.5" fill="#fff" fill-opacity=".45"/><circle cx="38" cy="30" r="4.5" fill="#fff" fill-opacity=".45"/>
    <path d="M30.5 30h3M27 37q5 4 10 0" fill="none"/>
    <circle cx="21" cy="35" r="2.4" fill="#E98C8C" stroke="none"/><circle cx="43" cy="35" r="2.4" fill="#E98C8C" stroke="none"/>`),

  bakery: svgWrap(`
    <ellipse cx="32" cy="43" rx="27" ry="12" fill="#A85F22"/>
    <ellipse cx="13" cy="41" rx="8" ry="7.5" fill="#D9913F"/>
    <ellipse cx="51" cy="41" rx="8" ry="7.5" fill="#D9913F"/>
    <ellipse cx="23" cy="36" rx="9" ry="9" fill="#E09A45"/>
    <ellipse cx="41" cy="36" rx="9" ry="9" fill="#E09A45"/>
    <ellipse cx="32" cy="30" rx="9" ry="8.5" fill="#E8A851"/>
    <path d="M27 26q5-3 10 0M18 31q4-3 8 0M38 31q4-3 8 0" fill="none" stroke="#FFE2A6" stroke-width="1.6"/>
    <g fill="#FFF4D8" stroke="none"><ellipse cx="29" cy="32" rx="1.2" ry=".7"/><ellipse cx="35" cy="29" rx="1.2" ry=".7"/><ellipse cx="22" cy="38" rx="1.2" ry=".7"/><ellipse cx="42" cy="39" rx="1.2" ry=".7"/><ellipse cx="13" cy="42" rx="1.2" ry=".7"/><ellipse cx="51" cy="43" rx="1.2" ry=".7"/><ellipse cx="33" cy="35" rx="1.2" ry=".7"/></g>`),

  deli: svgWrap(`
    <path d="M8 47q24 9 48 0v5q-24 9-48 0z" fill="#7E4F24"/>
    <path d="M7 41q6-5 12 0t13 0 13 0 12 0v6q-25 8-50 0z" fill="#C4505B"/>
    <path d="M9 38c0-13 46-13 46 0v4H9z" fill="#9A6634"/>
    <g fill="#4A2E12" stroke="none"><circle cx="20" cy="33" r="1"/><circle cx="30" cy="30" r="1"/><circle cx="40" cy="32" r="1"/><circle cx="47" cy="36" r="1"/><circle cx="25" cy="36" r="1"/></g>
    <path d="M44 7c7-3 12 4 7 10l-9 11c-5 4-10-1-7-6z" fill="#6F8E2E"/>
    <g fill="#B4CC66" stroke="none"><circle cx="46" cy="12" r="1.1"/><circle cx="42" cy="19" r="1.1"/><circle cx="48" cy="17" r="1.1"/></g>`),

  school: svgWrap(`
    <path d="M14 46l-5 15M50 46l5 15" fill="none" stroke-width="3"/>
    <rect x="5" y="9" width="54" height="38" rx="3" fill="#8B5A2B"/>
    <rect x="9" y="13" width="46" height="30" rx="1.5" fill="#2E5C49"/>
    <text x="32" y="35" text-anchor="middle" font-family="Georgia,serif" font-size="17" font-weight="700" fill="#F4F1E6" stroke="none">א ב ג</text>
    <rect x="38" y="44" width="10" height="3" fill="#fff" stroke-width="1.4"/>`),

  klezmer: svgWrap(`
    <g transform="rotate(35 32 32)">
      <rect x="29" y="1" width="6" height="9" rx="1.5" fill="#1E1E1E"/>
      <rect x="28.5" y="9" width="7" height="42" rx="1.5" fill="#2E2E2E"/>
      <path d="M27 50h10l5 11H22z" fill="#2E2E2E"/>
      <g fill="#C8CDD3" stroke-width="1.2"><circle cx="32" cy="17" r="1.9"/><circle cx="32" cy="24" r="1.9"/><circle cx="32" cy="31" r="1.9"/><circle cx="32" cy="38" r="1.9"/><circle cx="32" cy="45" r="1.9"/></g>
    </g>
    <path d="M51 6v15l7-2V4z" fill="#2B1F12"/><ellipse cx="48" cy="21" rx="3.5" ry="2.6" fill="#2B1F12"/><ellipse cx="55" cy="19" rx="3.5" ry="2.6" fill="#2B1F12"/>
    <path d="M10 28v11" fill="none"/><ellipse cx="7.5" cy="39" rx="3" ry="2.2" fill="#2B1F12"/>`),

  shul: svgWrap(`
    <path d="M8 60V31L32 16l24 15v29z" fill="#EAD7B3"/>
    <path d="M4 32L32 14l28 18" fill="none" stroke-width="3.2"/>
    <path d="M26 60V48a6 6 0 0 1 12 0v12z" fill="#6E4A2A"/>
    <path d="M13 45v-6a3.5 3.5 0 0 1 7 0v6zM44 45v-6a3.5 3.5 0 0 1 7 0v6z" fill="#7FB0DA"/>
    <circle cx="32" cy="31" r="5" fill="#7FB0DA"/>
    <path d="M25.5 12V5a3 3 0 0 1 6 0v7zM32.5 12V5a3 3 0 0 1 6 0v7z" fill="#fff"/>
    <path d="M3 60h58" fill="none"/>`),

  kibbutz: svgWrap(`
    <path d="M3 56h58" fill="none" stroke="#6B8E3A" stroke-width="3"/>
    <path d="M12 44V25h16l6 12h18v9H12z" fill="#C8372D"/>
    <path d="M16 29h9l4 8H16z" fill="#BFE0F2"/>
    <path d="M47 37v-9" fill="none" stroke-width="3"/>
    <circle cx="21" cy="45" r="11" fill="#333"/><circle cx="21" cy="45" r="4.5" fill="#C9C9C9"/>
    <circle cx="48" cy="49" r="6.5" fill="#333"/><circle cx="48" cy="49" r="2.5" fill="#C9C9C9"/>
    <path d="M54 6c4 2 5 7 2 10-4 3-9 1-9-4 0-4 3-7 7-6z" fill="#5E8C31"/><path d="M52 16v6" fill="none"/>`),

  yeshiva: svgWrap(`
    <path d="M24 61l4-24h8l4 24z" fill="#7A4E26"/>
    <path d="M8 31L54 21l3 9L11 40z" fill="#9C6A36"/>
    <path d="M12 28q9-7 19-3l1 9q-10-4-19 3zM32 25q9-7 19-4l2 8q-10-3-20 4z" fill="#F7EEDC"/>
    <path d="M16 29l10-3M17 32l10-3M36 25l10-3M37 28l10-3" fill="none" stroke-width="1.2"/>
    <path d="M45 13l3-6 3 6-3 2z" fill="#F4D77A" stroke-width="1.4"/>`),

  matzah: svgWrap(`
    <g transform="rotate(-6 32 32)">
      <rect x="7" y="7" width="50" height="50" rx="4" fill="#EAC98B"/>
      <path d="M16 12v40M25 12v40M34 12v40M43 12v40M52 12v40" fill="none" stroke="#9C6B2E" stroke-width="2.2" stroke-dasharray="1 4"/>
      <g fill="#A86A2A" stroke="none" opacity=".55"><ellipse cx="21" cy="20" rx="4" ry="2"/><ellipse cx="40" cy="38" rx="5" ry="2.5"/><ellipse cx="29" cy="49" rx="3" ry="1.6"/><ellipse cx="47" cy="18" rx="2.5" ry="1.4"/></g>
    </g>`),

  olive: svgWrap(`
    <path d="M8 57C24 45 36 30 56 8" fill="none" stroke="#6B4A2B" stroke-width="3.2"/>
    <g fill="#7E8F4A">
      <ellipse cx="19" cy="41" rx="9" ry="3.5" transform="rotate(-30 19 41)"/>
      <ellipse cx="31" cy="42" rx="8" ry="3.2" transform="rotate(40 31 42)"/>
      <ellipse cx="33" cy="24" rx="9" ry="3.5" transform="rotate(-50 33 24)"/>
      <ellipse cx="45" cy="27" rx="8" ry="3.2" transform="rotate(20 45 27)"/>
      <ellipse cx="50" cy="11" rx="7" ry="3" transform="rotate(-40 50 11)"/>
    </g>
    <ellipse cx="24" cy="50" rx="4.5" ry="5.5" fill="#3E4A1C"/><ellipse cx="39" cy="35" rx="4.5" ry="5.5" fill="#6A7F33"/><ellipse cx="49" cy="20" rx="4" ry="5" fill="#3E4A1C"/>
    <path d="M22 47l1.5-1M37 32l1.5-1M47 17l1.5-1" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.4"/>`),

  scribe: svgWrap(`
    <rect x="18" y="12" width="28" height="40" fill="#F4E4C1"/>
    <path d="M22 19h20M22 24h20M22 29h20M22 34h20M22 39h20M22 44h13" fill="none" stroke="#5A4630" stroke-width="1.3"/>
    <rect x="10" y="9" width="8" height="46" rx="3" fill="#8B5A2B"/><rect x="46" y="9" width="8" height="46" rx="3" fill="#8B5A2B"/>
    <path d="M14 9V3M50 9V3M14 55v6M50 55v6" fill="none" stroke-width="3"/>
    <circle cx="14" cy="3" r="2.5" fill="#D9AE3A"/><circle cx="50" cy="3" r="2.5" fill="#D9AE3A"/>`),

  tank: svgWrap(`
    <rect x="4" y="22" width="44" height="26" rx="4" fill="#F5F2EA"/>
    <path d="M44 22h8l7 13v13H44z" fill="#F5F2EA"/>
    <path d="M47 26h5l5 9h-10z" fill="#BFE0F2"/>
    <rect x="4" y="37" width="55" height="5" fill="#2F5DA8" stroke="none"/>
    <rect x="9" y="26" width="11" height="7" rx="1" fill="#BFE0F2"/><rect x="24" y="26" width="11" height="7" rx="1" fill="#BFE0F2"/>
    <path d="M18 16v6" fill="none"/><path d="M13 12h6l8-5v14l-8-5h-6z" fill="#D9AE3A"/>
    <circle cx="15" cy="49" r="6" fill="#333"/><circle cx="47" cy="49" r="6" fill="#333"/>
    <circle cx="15" cy="49" r="2" fill="#bbb"/><circle cx="47" cy="49" r="2" fill="#bbb"/>`),

  hall: svgWrap(`
    <path d="M10 60V20M54 60V20M20 60V25M44 60V25" fill="none" stroke="#8B5A2B" stroke-width="3"/>
    <path d="M5 20q27-11 54 0l-4 8q-23-6-46 0z" fill="#FFFFFF"/>
    <path d="M8 23q24-7 48 0" fill="none" stroke="#2F5DA8" stroke-width="2"/>
    <g stroke="none"><circle cx="10" cy="20" r="3.2" fill="#E98CA8"/><circle cx="54" cy="20" r="3.2" fill="#E98CA8"/><circle cx="32" cy="13" r="3.2" fill="#E98CA8"/><circle cx="21" cy="16" r="2.4" fill="#F4D77A"/><circle cx="43" cy="16" r="2.4" fill="#F4D77A"/></g>
    <path d="M29 46h7l-1 6h-5zM32.5 52v5M29 57h7" fill="#BFE0F2" stroke-width="1.6"/>
    <path d="M2 60h60" fill="none"/>`),

  golem: svgWrap(`
    <path d="M15 34L7 49M49 34l8 15" fill="none" stroke="#2B1F12" stroke-width="8"/>
    <path d="M15 34L7 49M49 34l8 15" fill="none" stroke="#A86C40" stroke-width="4.5"/>
    <rect x="20" y="51" width="9" height="11" fill="#A86C40"/><rect x="35" y="51" width="9" height="11" fill="#A86C40"/>
    <rect x="14" y="30" width="36" height="23" rx="4" fill="#B0744A"/>
    <rect x="18" y="7" width="28" height="23" rx="5" fill="#BD8457"/>
    <circle cx="26" cy="20" r="2.4" fill="#2B1F12"/><circle cx="38" cy="20" r="2.4" fill="#2B1F12"/>
    <path d="M27 25h10" fill="none"/>
    <text x="32" y="15.5" text-anchor="middle" font-family="Georgia,serif" font-size="6.5" font-weight="700" fill="#2B1F12" stroke="none">אמת</text>`),

  manna: svgWrap(`
    <path d="M12 34c-7 0-8-11 0-12 0-9 11-12 16-6 3-8 16-8 18 1 9-1 12 10 4 13z" fill="#EEF3F8"/>
    <g fill="#FFFDF4"><circle cx="18" cy="44" r="2.6"/><circle cx="30" cy="50" r="2.6"/><circle cx="42" cy="44" r="2.6"/><circle cx="24" cy="58" r="2.6"/><circle cx="38" cy="59" r="2.6"/><circle cx="51" cy="53" r="2.6"/></g>`),

  sea: svgWrap(`
    <path d="M2 62V14q5-6 9 0t9 0v48z" fill="#2F7DC0"/>
    <path d="M44 62V14q5-6 9 0t9 0v48z" fill="#2F7DC0"/>
    <path d="M20 62h24L36 14h-8z" fill="#E7CC8F"/>
    <path d="M5 26q4-3 8 0M6 40q4-3 8 0M8 53q4-3 8 0M48 30q4-3 8 0M47 46q4-3 8 0" fill="none" stroke="#BFE3FA" stroke-width="1.8"/>`),

  bush: svgWrap(`
    <path d="M18 40c-4-8 2-14 4-20 2 5 6 6 6 12 3-6 2-12 6-18 4 7 8 12 6 20 3-3 4-7 4-10 4 6 4 12 0 16z" fill="#F08A24"/>
    <path d="M25 40c-1-5 2-8 3-12 2 4 4 6 3 10 2-3 3-6 5-9 2 4 3 8 1 11z" fill="#FFD447"/>
    <path d="M10 57c-6-8 2-18 10-14 0-8 12-11 16-3 6-6 16 0 12 8 8 2 8 12 2 13z" fill="#4E7A2E"/>
    <path d="M20 50q4-3 8 0M34 48q4-3 8 0" fill="none" stroke="#86B85A" stroke-width="1.6"/>`),

  ladder: svgWrap(`
    <path d="M20 62L30 14M44 62L38 14" fill="none" stroke="#9C6A36" stroke-width="3.2"/>
    <path d="M21.7 54H43M23.8 44h18M25.8 34h14.7M27.9 24h11.3" fill="none" stroke="#9C6A36" stroke-width="2.6"/>
    <path d="M14 19c-7 0-8-9 1-10 1-7 12-9 15-2 4-6 15-4 15 3 7 0 8 9 1 9z" fill="#F2F5F9"/>
    <path d="M50 38c3-5 9-5 11 0-4 1-7 1-11 0zM50 38c-3-5-9-5-11 0 4 1 7 1 11 0z" fill="#fff" stroke-width="1.6"/>
    <g fill="#F4D77A" stroke="none"><circle cx="54" cy="8" r="2"/><circle cx="8" cy="34" r="1.6"/><circle cx="58" cy="24" r="1.4"/></g>`),

  chariot: svgWrap(`
    <path d="M3 42c6-6 4-14 10-18 0 6 4 8 6 4 2-6 8-10 8-16 6 6 6 12 4 18 4-2 6-6 6-10 6 8 4 16 0 22z" fill="#F08A24"/>
    <path d="M10 40c3-4 3-9 6-12 1 4 3 5 5 3 1-4 4-6 5-10 3 5 3 10 1 15z" fill="#FFD447"/>
    <path d="M22 30h32l-5 16H27z" fill="#C9302C"/>
    <path d="M52 30l7-9" fill="none" stroke-width="3"/>
    <circle cx="34" cy="48" r="11" fill="#FFD447"/>
    <path d="M34 37v22M23 48h22M26 40l16 16M42 40L26 56" fill="none" stroke-width="1.6"/>
    <circle cx="34" cy="48" r="3" fill="#8B5A2B"/>`),

  tikkun: svgWrap(`
    <circle cx="30" cy="31" r="24" fill="#3D86C6"/>
    <path d="M16 21c4-4 10-2 12 2s-2 8-6 8-4 6-8 4-2-10 2-14zM34 37c4-2 10 0 10 5s-6 7-10 5-4-8 0-10zM38 15c4 0 8 3 8 6s-4 3-6 1-4-7-2-7z" fill="#6DB35A"/>
    <path d="M12 26q18 12 36 0" fill="none" stroke="#BFE3FA" stroke-width="1.4" stroke-opacity=".7"/>
    <path d="M44 46c0-5 7-7 9-1 2-6 9-4 9 1 0 6-9 11-9 13 0-2-9-7-9-13z" fill="#E0505E"/>`),

  pom: svgWrap(`
    <path d="M23 21l2-9 4 6 3-9 3 9 4-6 2 9z" fill="#A81F38"/>
    <circle cx="32" cy="39" r="20" fill="#B5263E"/>
    <ellipse cx="24" cy="31" rx="6" ry="3.5" fill="#fff" fill-opacity=".3" stroke="none" transform="rotate(-30 24 31)"/>`),

  fig: svgWrap(`
    <path d="M32 10c3 0 4 3 3 7 8 4 15 14 15 25 0 12-8 18-18 18s-18-6-18-18c0-11 7-21 15-25-1-4 0-7 3-7z" fill="#6B3E7A"/>
    <path d="M31 10l5-5" fill="none" stroke="#4E7A2E" stroke-width="3"/>
    <ellipse cx="25" cy="34" rx="4" ry="7" fill="#fff" fill-opacity=".2" stroke="none"/>`),

  gelt: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill="#C99A26" stroke="#6E4D07" stroke-width="2"/>
    <circle cx="32" cy="32" r="29" fill="none" stroke="#F5D873" stroke-width="2" stroke-dasharray="1.5 2.5"/>
    <circle cx="32" cy="32" r="23" fill="#F0C94E" stroke="#A97A14" stroke-width="1.5"/>
    <g fill="none" stroke="#7A5609" stroke-width="2.4" stroke-linecap="round">
      <path d="M32 23v20M23 43h18M19 27q0 10 13 10t13-10M25 27q0 5 7 5t7-5"/>
    </g>
    <g fill="none" stroke="#C0392B" stroke-width="2.2" stroke-linecap="round"><path d="M19 22v3M25 22v3M32 18v3M39 22v3M45 22v3"/></g>
    <ellipse cx="23" cy="19" rx="9" ry="4" fill="#fff" opacity=".35" transform="rotate(-35 23 19)"/>
  </svg>`,
};

function dreidelSVG(letter, color = '#3D86C6') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 84"><g stroke="${INK}" stroke-width="2.4" stroke-linejoin="round">
    <rect x="28.5" y="2" width="7" height="13" rx="2.5" fill="#8B5A2B"/>
    <path d="M50 15l7 4v27L32 80" fill="#2A6299"/>
    <path d="M13 15h37v31L32 80 13 46z" fill="${color}"/>
    <text x="31.5" y="40" text-anchor="middle" font-family="'Frank Ruhl Libre',Georgia,serif" font-size="24" font-weight="900" fill="#F4D77A" stroke="none">${letter}</text>
  </g></svg>`;
}

function coinSVG() {
  return `<svg viewBox="0 0 200 200" aria-hidden="true">
    <defs>
      <radialGradient id="gface" cx="38%" cy="30%" r="78%">
        <stop offset="0" stop-color="#FFF4C4"/><stop offset=".3" stop-color="#F1CC5C"/><stop offset=".78" stop-color="#BC8C20"/><stop offset="1" stop-color="#8A6210"/>
      </radialGradient>
      <linearGradient id="grim" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#F8DE88"/><stop offset=".5" stop-color="#A97A14"/><stop offset="1" stop-color="#6E4D07"/>
      </linearGradient>
      <linearGradient id="gshine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <clipPath id="cface"><circle cx="100" cy="100" r="84"/></clipPath>
    </defs>
    <circle cx="100" cy="100" r="98" fill="url(#grim)"/>
    <circle cx="100" cy="100" r="92.5" fill="none" stroke="#7A5609" stroke-width="5" stroke-dasharray="2 3.2" opacity=".55"/>
    <circle cx="100" cy="100" r="84" fill="url(#gface)"/>
    <circle cx="100" cy="100" r="76" fill="none" stroke="#8C640D" stroke-width="1.6" stroke-dasharray="1 5" stroke-linecap="round"/>
    <g fill="none" stroke="#7A5609" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M100 56C100 50 99 46 96 43"/>
      <path d="M99 50C92 44 84 46 81 50c7 2 13 2 18 0z" fill="#C99A2A"/>
      <path d="M101 52c7-6 16-5 19 0-7 2-14 2-19 0z" fill="#C99A2A"/>
      <path d="M88 74l3-13 4 9 5-12 5 12 4-9 3 13"/>
      <circle cx="100" cy="102" r="30" fill="#D9AC3D"/>
      <path d="M80 92c6-8 14-10 20-10" opacity=".7"/>
    </g>
    <g fill="#8C640D" opacity=".75">
      <circle cx="92" cy="100" r="3"/><circle cx="101" cy="96" r="3"/><circle cx="110" cy="101" r="3"/>
      <circle cx="96" cy="109" r="3"/><circle cx="106" cy="110" r="3"/><circle cx="101" cy="118" r="2.6"/>
    </g>
    <text x="100" y="158" text-anchor="middle" font-family="'Frank Ruhl Libre',Georgia,serif" font-weight="900" font-size="26" fill="#6E4D07">שקל</text>
    <g clip-path="url(#cface)"><rect class="shine" x="-120" y="-20" width="60" height="240" fill="url(#gshine)" transform="rotate(20 100 100)"/></g>
  </svg>`;
}

const spriteCache = {};
function spriteUrl(id) {
  if (!spriteCache[id]) spriteCache[id] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ART[id]);
  return spriteCache[id];
}
