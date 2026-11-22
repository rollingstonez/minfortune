// 타로 메이저 22장 — 오리지널 SVG 카드 아트.
// 남색 바탕에 금색 선화(線畫)로 통일한 자체 제작 도안입니다. 외부 이미지·폰트 의존 없음.
const ROMAN = ['0','I','II','III','IV','V','VI','VII','VIII','IX','X',
               'XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'];

// 중앙 도안 (좌표계 60,105 ~ 240,385 / 중심 150,245)
const GLYPH = {
  fool: `<circle cx="82" cy="140" r="17" class="g-o"/>
    <path d="M82 112v-11M82 179v-11M51 140H40M124 140h-11M60 118l-8-8M104 162l8 8M104 118l8-8M60 162l-8 8" class="g-t"/>
    <path d="M52 326h114l30 60H52z" class="g-t"/><path d="M52 326h114" class="g-s"/>
    <circle cx="154" cy="172" r="23" class="g-o"/>
    <path d="M132 198q22-9 44 0l12 72h-68z" class="g-o"/>
    <path d="M136 206l-30 22M172 204l26-24" class="g-s"/>
    <path d="M142 270l-22 58M164 270l26 52" class="g-s"/>
    <path d="M198 180l26-44" class="g-s"/><ellipse cx="228" cy="130" rx="18" ry="14" class="g-o"/>
    <path d="M84 302q12-10 26-7l11 13H84z" class="g-t"/><circle cx="80" cy="296" r="9" class="g-t"/>
    <path d="M92 308v10M112 308v10M121 308l12-12" class="g-t"/>`,
  magician: `<path d="M118 118h64M150 112v18" class="g-s"/>
    <path d="M136 124c-10 8-10 20 0 28s24 8 28-2" class="g-t" transform="translate(0,-34)"/>
    <ellipse cx="135" cy="96" rx="15" ry="11" class="g-o"/><ellipse cx="165" cy="96" rx="15" ry="11" class="g-o"/>
    <circle cx="150" cy="168" r="22" class="g-o"/>
    <path d="M150 190v66M128 206l-30-28M172 206l30-46" class="g-s"/>
    <path d="M196 148l16-24" class="g-s"/><path d="M150 256l-26 76h52z" class="g-t"/>
    <rect x="86" y="332" width="128" height="10" rx="4" class="g-o"/>
    <circle cx="108" cy="322" r="8" class="g-t"/><path d="M134 316h20v12h-20z" class="g-t"/>
    <path d="M176 328l10-14 10 14z" class="g-t"/><path d="M204 314v16" class="g-t"/>`,
  'high-priestess': `<rect x="74" y="120" width="22" height="214" rx="5" class="g-o"/>
    <rect x="204" y="120" width="22" height="214" rx="5" class="g-o"/>
    <path d="M96 150h108M96 170h108" class="g-t"/>
    <path d="M150 128a34 34 0 1 0 0 68 26 26 0 1 1 0-68z" class="g-f"/>
    <circle cx="150" cy="248" r="30" class="g-o"/><path d="M150 278v58" class="g-s"/>
    <path d="M120 300h60" class="g-t"/><path d="M104 336h92" class="g-s"/>
    <circle cx="150" cy="248" r="12" class="g-t"/>`,
  empress: `<path d="M114 128l12 26 24-30 24 30 12-26 10 44h-92z" class="g-o"/>
    <circle cx="150" cy="212" r="32" class="g-o"/>
    <path d="M118 244q32 26 64 0l16 92h-96z" class="g-o"/>
    <path d="M90 300v60M90 300c-14 10-14 26 0 34M90 318c14 10 14 26 0 34" class="g-t"/>
    <path d="M210 300v60M210 300c14 10 14 26 0 34M210 318c-14 10-14 26 0 34" class="g-t"/>
    <path d="M110 360h80" class="g-s"/>`,
  emperor: `<path d="M110 134q14-26 20 0 14-26 20 0 14-26 20 0 14-26 20 0v26h-80z" class="g-o"/>
    <circle cx="150" cy="202" r="28" class="g-o"/>
    <path d="M122 232h56l14 96h-84z" class="g-o"/>
    <path d="M86 236q-14 24 0 44v70h28V236z" class="g-o"/>
    <path d="M214 236q14 24 0 44v70h-28V236z" class="g-o"/>
    <path d="M150 262v46M134 282h32" class="g-s"/><path d="M96 350h108" class="g-s"/>`,
  hierophant: `<path d="M150 112l-26 34h52z" class="g-o"/>
    <circle cx="150" cy="178" r="26" class="g-o"/>
    <path d="M118 206h64l18 110h-100z" class="g-o"/>
    <path d="M150 130v88M128 152h44M134 176h32M140 198h20" class="g-t"/>
    <path d="M110 330l22-40M190 330l-22-40" class="g-s"/>
    <circle cx="106" cy="340" r="11" class="g-o"/><circle cx="194" cy="340" r="11" class="g-o"/>
    <path d="M106 351v16M194 351v16" class="g-t"/>`,
  lovers: `<circle cx="150" cy="128" r="21" class="g-o"/>
    <path d="M150 104v-12M150 164v-12M126 128h-12M186 128h-12M132 110l-9-9M168 146l9 9M168 110l9-9M132 146l-9 9" class="g-t"/>
    <circle cx="104" cy="214" r="22" class="g-o"/>
    <path d="M82 240q22-9 44 0l10 96H72z" class="g-o"/>
    <circle cx="196" cy="214" r="22" class="g-o"/>
    <path d="M174 240q22-9 44 0l10 96h-64z" class="g-o"/>
    <path d="M128 254l20 12M172 254l-20 12" class="g-s"/>
    <path d="M150 272l-8 10 8 10 8-10z" class="g-t"/>
    <path d="M60 336h180" class="g-s"/>`,
  chariot: `<rect x="92" y="208" width="116" height="74" rx="8" class="g-o"/>
    <circle cx="150" cy="166" r="26" class="g-o"/>
    <path d="M124 140q26-34 52 0" class="g-t"/>
    <circle cx="112" cy="316" r="30" class="g-o"/><circle cx="188" cy="316" r="30" class="g-o"/>
    <path d="M112 286v60M82 316h60M188 286v60M158 316h60" class="g-t"/>
    <path d="M92 240H64l-14-26M208 240h28l14-26" class="g-s"/>
    <path d="M150 196v-14" class="g-t"/>
    <path d="M118 256a18 18 0 0 1 32 0M150 256a18 18 0 0 1 32 0" class="g-t"/>`,
  strength: `<ellipse cx="130" cy="142" rx="20" ry="13" class="g-t"/><ellipse cx="170" cy="142" rx="20" ry="13" class="g-t"/>
    <path class="g-t" d="M198 252L224 252M192 276L214 289M174 294L187 316M150 300L150 326M126 294L113 316M108 276L86 289M102 252L76 252M108 228L86 215M126 210L113 188M150 204L150 178M174 210L187 188M192 228L214 215"/>
    <circle cx="150" cy="252" r="48" class="g-o"/>
    <path d="M136 240a7 7 0 1 0 .1 0M164 240a7 7 0 1 0 .1 0" class="g-f"/>
    <path d="M140 262h20l-10 12z" class="g-o"/>
    <path d="M150 274v6M150 280q-15 13-26 2M150 280q15 13 26 2" class="g-t"/>
    <path d="M118 266H92M120 276H96M182 266h26M180 276h24" class="g-t"/>`,
  hermit: `<path d="M150 116a35 39 0 0 0-35 39v19h70v-19a35 39 0 0 0-35-39z" class="g-o"/>
    <path d="M128 176q22 16 44 0" class="g-t"/>
    <path d="M115 174l-19 158h108l-19-158z" class="g-o"/>
    <path d="M134 208l16 48 16-48" class="g-t"/>
    <path d="M212 146v190" class="g-s"/><path d="M204 146h16" class="g-t"/>
    <path d="M70 198h46v54H70z" class="g-o"/><path d="M70 198l23-19 23 19" class="g-o"/>
    <path d="M93 179v-15M76 252v12h34v-12" class="g-t"/>
    <path d="M93 208l6 13 14 1-11 9 4 14-13-8-13 8 4-14-11-9 14-1z" class="g-t"/>
    <path d="M116 226l-4 18" class="g-t"/>
    <path d="M44 344h212" class="g-s"/><path d="M44 344l46-54 30 34 32-52 34 72z" class="g-t"/>`,
  'wheel-of-fortune': `<circle cx="150" cy="238" r="80" class="g-o"/><circle cx="150" cy="238" r="52" class="g-o"/>
    <circle cx="150" cy="238" r="14" class="g-o"/>
    <path d="M150 158v160M70 238h160M93 181l114 114M207 181L93 295" class="g-t"/>
    <path d="M58 126h28M72 112v28" class="g-t"/><path d="M214 126h28M228 112v28" class="g-t"/>
    <path d="M58 350h28M72 336v28" class="g-t"/><path d="M214 350h28M228 336v28" class="g-t"/>`,
  justice: `<path d="M150 130v190" class="g-s"/><path d="M108 162h84" class="g-s"/>
    <path d="M108 162l-24 50h48zM192 162l-24 50h48z" class="g-o"/>
    <path d="M84 212a24 24 0 0 0 48 0M168 212a24 24 0 0 0 48 0" class="g-t"/>
    <path d="M114 320h72" class="g-s"/>
    <path d="M150 130l-16-18h32z" class="g-t"/>
    <path d="M232 136v128M222 264h20M232 136l-8-16h16z" class="g-t"/>`,
  'hanged-man': `<path d="M58 118h184M90 118v28M210 118v28" class="g-s"/>
    <path d="M150 118v50" class="g-s"/>
    <path d="M150 168v76" class="g-s"/>
    <path d="M150 198l-46 32" class="g-s"/>
    <path d="M150 244v16" class="g-s"/>
    <circle cx="150" cy="288" r="27" class="g-o"/>
    <circle cx="150" cy="288" r="44" class="g-t" opacity=".5"/>
    <path d="M150 262l-34 26M150 262l34 26" class="g-t"/>
    <path d="M136 282q7 7 14 0M150 282q7 7 14 0" class="g-t"/>
    <path d="M141 306h18" class="g-t"/>`,
  death: `<path d="M66 300q40-40 84 0t84-40" class="g-s"/>
    <path d="M150 126a40 44 0 0 1 40 44c0 20-12 30-12 42h-56c0-12-12-22-12-42a40 44 0 0 1 40-44z" class="g-o"/>
    <circle cx="134" cy="166" r="9" class="g-f"/><circle cx="166" cy="166" r="9" class="g-f"/>
    <path d="M150 180v14M136 206h28M124 212h52v12h-52z" class="g-t"/>
    <path d="M214 120v180" class="g-s"/>
    <path d="M214 120q-50 4-62 46 40-14 62-14z" class="g-o"/>
    <path d="M78 258a16 16 0 1 1 32 0 16 16 0 1 1-32 0M94 274v26" class="g-t"/>`,
  temperance: `<circle cx="150" cy="150" r="24" class="g-o"/>
    <circle cx="150" cy="150" r="36" class="g-t" opacity=".55"/>
    <path d="M126 178h48l18 110h-84z" class="g-o"/>
    <path d="M126 188q-46 6-60 42 32-6 46 10 4-28 14-52z" class="g-o"/>
    <path d="M174 188q46 6 60 42-32-6-46 10-4-28-14-52z" class="g-o"/>
    <path d="M56 252l25-15 25 15-11 42H67z" class="g-o"/><path d="M81 294v15M66 309h30" class="g-t"/>
    <path d="M194 252l25-15 25 15-11 42h-28z" class="g-o"/><path d="M219 294v15M204 309h30" class="g-t"/>
    <path d="M102 256q48 34 94-10" class="g-s"/>
    <path d="M108 250q44 28 84-14" class="g-t" opacity=".5"/>
    <path d="M54 336h192" class="g-s"/>`,
  devil: `<path d="M150 158L132 104L179 119H121L168 104z" class="g-t"/>
    <path d="M150 176c22 0 38 16 38 36 0 24-17 42-38 42s-38-18-38-42c0-20 16-36 38-36z" class="g-o"/>
    <path d="M116 192C92 182 78 160 84 136c14 10 26 30 30 50" class="g-o"/>
    <path d="M184 192C208 182 222 160 216 136c-14 10-26 30-30 50" class="g-o"/>
    <path d="M110 208q-20 6-24 18 16 4 26-6" class="g-t"/>
    <path d="M190 208q20 6 24 18-16 4-26-6" class="g-t"/>
    <path d="M130 212l17 9M170 212l-17 9" class="g-s"/>
    <path d="M142 234h16" class="g-t"/><path d="M150 242l-9 14h18z" class="g-t"/>
    <circle cx="92" cy="300" r="16" class="g-o"/>
    <path d="M76 320q16-7 32 0l7 42H69z" class="g-o"/><path d="M92 284v-14" class="g-t"/>
    <circle cx="208" cy="300" r="16" class="g-o"/>
    <path d="M192 320q16-7 32 0l7 42h-46z" class="g-o"/><path d="M208 284v-14" class="g-t"/>
    <ellipse cx="116" cy="288" rx="9" ry="5" class="g-t"/><ellipse cx="133" cy="288" rx="9" ry="5" class="g-t"/>
    <ellipse cx="167" cy="288" rx="9" ry="5" class="g-t"/><ellipse cx="184" cy="288" rx="9" ry="5" class="g-t"/>
    <path d="M58 362h184" class="g-s"/>`,
  tower: `<path d="M106 346V196h88v150z" class="g-o"/>
    <path d="M96 196h108l-54-34z" class="g-o"/>
    <path d="M132 232h36v34h-36z" class="g-t"/><path d="M132 290h36v34h-36z" class="g-t"/>
    <path d="M150 112l-26 52h22l-14 44 42-58h-22z" class="g-f"/>
    <path d="M96 196l-32-22M204 196l32-22" class="g-t"/>
    <path d="M78 250l-24 18M222 250l24 18" class="g-t"/>
    <path d="M84 310l-28 10M216 310l28 10" class="g-t"/>
    <path d="M60 346h180" class="g-s"/>`,
  star: `<path d="M150 108l14 42 44 2-35 27 13 42-36-25-36 25 13-42-35-27 44-2z" class="g-o"/>
    <path d="M78 150l6 18 19 1-15 12 6 18-16-11-16 11 6-18-15-12 19-1z" class="g-t"/>
    <path d="M222 150l6 18 19 1-15 12 6 18-16-11-16 11 6-18-15-12 19-1z" class="g-t"/>
    <path d="M96 216l5 14 15 1-12 9 5 15-13-9-13 9 5-15-12-9 15-1z" class="g-t"/>
    <path d="M204 216l5 14 15 1-12 9 5 15-13-9-13 9 5-15-12-9 15-1z" class="g-t"/>
    <path d="M60 300q30-18 60 0t60 0 60-18" class="g-s"/>
    <path d="M60 326q30-18 60 0t60 0 60-18" class="g-t"/>
    <path d="M60 352q30-18 60 0t60 0 60-18" class="g-t" opacity=".5"/>`,
  moon: `<path d="M150 112a66 66 0 1 0 0 132 52 52 0 1 1 0-132z" class="g-f"/>
    <path d="M198 120l4 14 14 4-14 4-4 14-4-14-14-4 14-4z" class="g-t"/>
    <path d="M226 170l3 11 11 3-11 3-3 11-3-11-11-3 11-3z" class="g-t"/>
    <rect x="68" y="248" width="26" height="76" rx="3" class="g-o"/><path d="M68 248l13-18 13 18" class="g-o"/>
    <rect x="206" y="248" width="26" height="76" rx="3" class="g-o"/><path d="M206 248l13-18 13 18" class="g-o"/>
    <path d="M134 370q4-50 16-80M166 370q-4-50-16-80" class="g-s"/>
    <path d="M140 330h20M136 352h28" class="g-t"/>`,
  sun: `<circle cx="150" cy="196" r="54" class="g-o"/>
    <path d="M150 112v24M150 256v24M66 196h24M210 196h24M91 137l17 17M192 238l17 17M209 137l-17 17M108 238l-17 17" class="g-s"/>
    <path d="M134 186a7 7 0 1 0 .1 0M166 186a7 7 0 1 0 .1 0" class="g-f"/>
    <path d="M132 212q18 16 36 0" class="g-t"/>
    <path d="M62 318h176" class="g-s"/>
    <path d="M86 318v-26M122 318v-38M158 318v-30M194 318v-42M222 318v-22" class="g-t"/>
    <path d="M86 292l-8-12 16 0zM122 280l-8-12 16 0zM158 288l-8-12 16 0zM194 276l-8-12 16 0z" class="g-t"/>`,
  judgement: `<path d="M198 112l44-20v62l-44-20z" class="g-o"/><path d="M198 124v28" class="g-t"/>
    <path d="M62 146h136" class="g-s"/>
    <circle cx="150" cy="208" r="22" class="g-o"/>
    <path d="M128 236q22-10 44 0l12 92h-68z" class="g-o"/>
    <path d="M132 240l-26-38M168 240l26-38" class="g-s"/>
    <circle cx="90" cy="250" r="17" class="g-o"/>
    <path d="M73 272q17-8 34 0l8 56H65z" class="g-o"/>
    <path d="M76 276l-18-32M104 276l16-32" class="g-s"/>
    <circle cx="210" cy="250" r="17" class="g-o"/>
    <path d="M193 272q17-8 34 0l8 56h-50z" class="g-o"/>
    <path d="M196 276l-16-32M224 276l18-32" class="g-s"/>
    <path d="M58 330h184v26H58z" class="g-o"/>`,
  world: `<ellipse cx="150" cy="240" rx="72" ry="104" class="g-o"/>
    <ellipse cx="150" cy="240" rx="60" ry="92" class="g-t" opacity=".5"/>
    <circle cx="150" cy="184" r="20" class="g-o"/>
    <path d="M130 210q20-8 40 0l10 72h-60z" class="g-o"/>
    <path d="M130 218l-28-24M170 218l28-24" class="g-s"/>
    <path d="M142 282l-12 46M158 282l18 42" class="g-s"/>
    <path d="M58 120l13 22H45z" class="g-t"/>
    <circle cx="242" cy="130" r="11" class="g-t"/>
    <rect x="47" y="340" width="23" height="23" rx="3" class="g-t"/>
    <path d="M242 334l4 12 12 1-9 8 3 12-10-7-10 7 3-12-9-8 12-1z" class="g-t"/>`
};

const STARS = [[40,60],[262,78],[58,420],[244,436],[150,44],[96,462],[210,40],[30,236],[270,250]]
  .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 === 0 ? 1.8 : 1.1}" fill="#c9a84c" opacity="${0.3 + (i % 4) * 0.12}"/>`).join('');

const FLEURONS = `<g transform="translate(36,36)" fill="none" stroke="#c9a84c" stroke-width="1" opacity=".5"><path d="M0 -9a9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9z"/><circle cx="0" cy="0" r="2.2" fill="#c9a84c" stroke="none"/></g><g transform="translate(264,36)" fill="none" stroke="#c9a84c" stroke-width="1" opacity=".5"><path d="M0 -9a9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9z"/><circle cx="0" cy="0" r="2.2" fill="#c9a84c" stroke="none"/></g><g transform="translate(36,464)" fill="none" stroke="#c9a84c" stroke-width="1" opacity=".5"><path d="M0 -9a9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9z"/><circle cx="0" cy="0" r="2.2" fill="#c9a84c" stroke="none"/></g><g transform="translate(264,464)" fill="none" stroke="#c9a84c" stroke-width="1" opacity=".5"><path d="M0 -9a9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9z"/><circle cx="0" cy="0" r="2.2" fill="#c9a84c" stroke="none"/></g>`;

/** 카드 한 장의 SVG 문자열. id는 카드 slug. */
export function cardSVG(t, { w = 300, label = true } = {}) {
  const g = GLYPH[t.slug] || '';
  const s = t.slug;
  return `<svg viewBox="0 0 300 500" width="${w}" xmlns="http://www.w3.org/2000/svg" class="tcard-svg" role="img" aria-label="타로 ${t.ko} 카드">
<defs>
<linearGradient id="bg-${s}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#3a3270"/><stop offset=".55" stop-color="#241d4a"/><stop offset="1" stop-color="#14102a"/></linearGradient>
<linearGradient id="gold-${s}" gradientUnits="userSpaceOnUse" x1="20" y1="20" x2="280" y2="480">
<stop offset="0" stop-color="#f0dba2"/><stop offset=".45" stop-color="#c9a84c"/><stop offset="1" stop-color="#9c7c32"/></linearGradient>
<radialGradient id="glow-${s}" cx=".5" cy=".5" r=".5">
<stop offset="0" stop-color="#c9a84c" stop-opacity=".22"/><stop offset=".6" stop-color="#c9a84c" stop-opacity=".06"/>
<stop offset="1" stop-color="#c9a84c" stop-opacity="0"/></radialGradient>
</defs>
<rect width="300" height="500" rx="18" fill="url(#bg-${s})"/>
<ellipse cx="150" cy="250" rx="128" ry="158" fill="url(#glow-${s})"/>
${STARS}
<path d="M46 394V198a104 104 0 0 1 208 0v196" fill="none" stroke="#c9a84c" stroke-width="1.1" opacity=".3"/>
<path d="M56 394V198a94 94 0 0 1 188 0v196" fill="none" stroke="#c9a84c" stroke-width=".6" opacity=".18"/>
<rect x="9" y="9" width="282" height="482" rx="13" fill="none" stroke="url(#gold-${s})" stroke-width="2.6"/>
<rect x="17" y="17" width="266" height="466" rx="9" fill="none" stroke="#c9a84c" stroke-width=".8" opacity=".5"/>
${FLEURONS}
<g class="glyph" fill="none" stroke="url(#gold-${s})" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${g}</g>
${label ? `<text x="150" y="66" text-anchor="middle" fill="#f0dba2" font-family="Gowun Batang, serif" font-size="25" letter-spacing="3">${ROMAN[t.num]}</text>
<path d="M98 78h40M162 78h40" stroke="#c9a84c" stroke-width=".9" opacity=".6"/>
<circle cx="150" cy="78" r="2.6" fill="#c9a84c" opacity=".8"/>
<rect x="62" y="420" width="176" height="38" rx="19" fill="#0f0c1f" fill-opacity=".45" stroke="#c9a84c" stroke-width=".8" opacity=".9"/>
<text x="150" y="446" text-anchor="middle" fill="#f3ecd8" font-family="Gowun Batang, serif" font-size="24" letter-spacing="1">${t.ko}</text>
<text x="150" y="474" text-anchor="middle" fill="#c9a84c" font-family="Gowun Dodum, sans-serif" font-size="11" letter-spacing="1.6" opacity=".9">${t.elem} · ${t.keys[0]}</text>` : ''}
</svg>`;
}

/** 뒷면 */
export function cardBackSVG(w = 300) {
  return `<svg viewBox="0 0 300 500" width="${w}" xmlns="http://www.w3.org/2000/svg" class="tcard-svg" aria-hidden="true">
<defs><linearGradient id="bgb" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#2c2557"/><stop offset="1" stop-color="#14102a"/></linearGradient>
<pattern id="lat" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
<path d="M15 0v30M0 15h30" stroke="#c9a84c" stroke-width=".7" opacity=".3"/></pattern></defs>
<rect width="300" height="500" rx="18" fill="url(#bgb)"/>
<rect x="17" y="17" width="266" height="466" rx="9" fill="url(#lat)"/>
<rect x="9" y="9" width="282" height="482" rx="13" fill="none" stroke="#c9a84c" stroke-width="2.5"/>
<g fill="none" stroke="#c9a84c" stroke-width="2" stroke-linecap="round">
<circle cx="150" cy="250" r="62" opacity=".9"/><circle cx="150" cy="250" r="44" opacity=".6"/>
<path d="M150 188a62 62 0 0 1 0 124 31 31 0 0 1 0-62 31 31 0 0 0 0-62z" fill="#c9a84c" opacity=".85" stroke="none"/>
<circle cx="150" cy="219" r="7" fill="#17122f" stroke="none"/><circle cx="150" cy="281" r="7" fill="#c9a84c" stroke="none"/>
<path d="M150 158v-22M150 364v-22M56 250H34M266 250h-22" opacity=".7"/></g>
</svg>`;
}
