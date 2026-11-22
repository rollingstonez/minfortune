#!/usr/bin/env node
// 사주 × 타로 결합 해설 섹션 빌드. 외부 의존성 없음.
//   node claude/build.mjs                        → site/claude/ 에 생성 (경로 /claude)
//   node claude/build.mjs --out claude/dist --base /claude
import { mkdir, writeFile, copyFile, rm, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ZODIAC } from './data/zodiac.mjs';
import { TAROT } from './data/tarot.mjs';
import { interpret, relation, REL_LABEL, REL_SHORT, YEAR } from './lib/interpret.mjs';
import { layout, INFO, esc } from './lib/templates.mjs';
import { darkLayout } from './lib/dark.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const OUT = resolve(root, arg('--out', 'site/claude'));
const BASE = arg('--base', '/claude');
const SITE = arg('--site', 'https://minfortune.kr');

const urls = [];
async function emit(path, html) {
  const file = join(OUT, path === '' ? 'index.html' : path.slice(1) + '/index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html, 'utf8');
  urls.push(path);
}

const BIZ = {
  '@context': 'https://schema.org', '@type': 'LocalBusiness', '@id': SITE + '/#business',
  name: INFO.name, url: SITE + '/', telephone: '+82-10-5750-3883',
  foundingDate: String(INFO.since), priceRange: '₩₩',
  address: {
    '@type': 'PostalAddress', streetAddress: '야탑로111번길 16, 3층',
    addressLocality: '성남시 분당구', addressRegion: '경기도', addressCountry: 'KR'
  }
};
const author = { '@type': 'Organization', name: INFO.name, url: SITE + '/' };

const relCls = r => r;
const trim = (s, n) => (s.length > n ? s.slice(0, n - 1).trim() + '…' : s);

/* ── 상세 264 ─────────────────────────────────────────────────── */
function detail(z, zi, t, ci) {
  const r = interpret(z, t, zi, ci);
  const slug = `${z.slug}-${t.slug}`;
  const prev = TAROT[(ci + TAROT.length - 1) % TAROT.length];
  const next = TAROT[(ci + 1) % TAROT.length];
  const sameRel = ZODIAC
    .map((o, oi) => ({ o, oi }))
    .filter(({ o }) => o.slug !== z.slug && relation(t.elem, o.elem) === r.rel)
    .slice(0, 4);

  const body = `    <div class="rel ${relCls(r.rel)}">${esc(r.relLabel)}</div>
    <div class="sum">
      <p>${esc(r.summary)}</p>
      <div class="chips">${r.keys.map(k => `<span class="chip">${esc(k)}</span>`).join('')}</div>
    </div>

    <h2>사주로 본 ${z.name}띠의 바탕</h2>
    <p>${esc(r.saju)}</p>
    <div class="tbl">
      <div class="r"><span class="k">지지 · 오행 · 음양</span><span class="v">${z.ji} · ${z.elem} · ${z.yin}</span></div>
      <div class="r"><span class="k">해당 시 · 절기</span><span class="v">${z.hour} · ${z.month}</span></div>
      <div class="r"><span class="k">삼합 · 육합</span><span class="v">${z.sanhap.join('·')} · ${z.yukhap}</span></div>
      <div class="r"><span class="k">충(沖)</span><span class="v">${z.chung}</span></div>
      <div class="r"><span class="k">해당 연생</span><span class="v">${z.years.join(' · ')}</span></div>
    </div>

    <h2>타로 ${t.ko} 카드가 가리키는 흐름</h2>
    <p>${esc(r.tarot)}</p>
    <div class="tbl">
      <div class="r"><span class="k">카드</span><span class="v">${t.num}. ${t.ko} (${t.en})</span></div>
      <div class="r"><span class="k">배속 오행</span><span class="v">${t.elem}</span></div>
      <div class="r"><span class="k">주제</span><span class="v">${t.keys.join(' · ')}</span></div>
    </div>

    <h2>두 개를 겹쳐서 보면</h2>
    <p>${esc(r.combine)}</p>

    <h2>${YEAR.label}, 이 조합에게</h2>
    <p>${esc(r.year)}</p>

    <h2>일 · 사람 · 돈</h2>
    <h3>일과 직업</h3><p>${esc(r.work)}</p>
    <h3>사람과 애정</h3><p>${esc(r.love)}</p>
    <h3>돈과 재물</h3><p>${esc(r.money)}</p>

    <h2>이번 달 실천 한 가지</h2>
    <p>${esc(r.action)}</p>

    <h2>${t.ko} 카드로 보는 다른 띠</h2>
    <p class="muted">같은 카드라도 띠가 바뀌면 오행 관계가 바뀝니다. ${esc(REL_SHORT[r.rel])}에 해당하는 다른 띠는 이렇습니다.</p>
    <div class="grid">
      ${sameRel.map(({ o }) => `<a href="${BASE}/saju-tarot/${o.slug}-${t.slug}"><span class="t">${o.name}띠 × ${t.ko}</span><span class="d">${o.ji}·${o.elem} — ${REL_SHORT[r.rel]}</span></a>`).join('\n      ')}
    </div>

    <h2>이어서 보기</h2>
    <div class="pager">
      <a href="${BASE}/saju-tarot/${z.slug}-${prev.slug}"><span class="l">← 이전 카드</span><span class="t">${z.name}띠 × ${prev.ko}</span></a>
      <a href="${BASE}/saju-tarot/${z.slug}-${next.slug}"><span class="l">다음 카드 →</span><span class="t">${z.name}띠 × ${next.ko}</span></a>
    </div>
    <div class="grid">
      <a href="${BASE}/ddi/${z.slug}"><span class="t">${z.name}띠 전체 해설</span><span class="d">22장 카드별 해석 모음</span></a>
      <a href="${BASE}/tarot/${t.slug}"><span class="t">${t.ko} 카드 전체</span><span class="d">12띠별 해석 모음</span></a>
    </div>`;

  const title = `${z.name}띠 × 타로 ${t.ko} — 사주·타로 결합 해설 | ${INFO.name}`;
  const desc = trim(`${z.name}띠(${z.ji}·${z.elem})와 타로 ${t.ko}(${t.elem})를 겹쳐 보면 ${REL_LABEL[r.rel]}. ${z.name}띠의 바탕, ${t.ko} 카드의 흐름, ${YEAR.label} 운세와 일·사람·돈까지. ${INFO.since}년 개원 ${INFO.name}.`, 155);

  return {
    path: `/saju-tarot/${slug}`,
    html: layout({
      site: SITE, base: BASE, path: `/saju-tarot/${slug}`, title, desc,
      keywords: `${z.name}띠 사주, ${z.name}띠 타로, 타로 ${t.ko}, ${t.ko} 카드 의미, 사주 타로 결합, ${YEAR.label} ${z.name}띠 운세, 분당 야탑 사주, 야탑역 철학관`,
      eyebrow: `${z.name}띠 ${z.ji}·${z.elem} × ${t.num}. ${t.ko} ${t.elem}`,
      h1: `${z.name}띠가 ${t.ko} 카드를 뽑았을 때`,
      crumbs: [
        { name: '사주·타로 해설', href: '' },
        { name: `${z.name}띠`, href: `/ddi/${z.slug}` },
        { name: `${t.ko}` }
      ],
      ld: [{
        '@context': 'https://schema.org', '@type': 'Article',
        headline: `${z.name}띠 × 타로 ${t.ko} — 사주·타로 결합 해설`,
        description: desc, inLanguage: 'ko-KR', author, publisher: author,
        isPartOf: { '@type': 'WebSite', name: INFO.name, url: SITE + '/' },
        about: [{ '@type': 'Thing', name: `${z.name}띠` }, { '@type': 'Thing', name: `타로 ${t.ko}` }],
        mainEntityOfPage: SITE + BASE + `/saju-tarot/${slug}`
      }],
      body
    })
  };
}

/* ── 띠 허브 12 ──────────────────────────────────────────────── */
function ddiHub(z, zi) {
  const groups = {};
  TAROT.forEach((t, ci) => {
    const r = relation(t.elem, z.elem);
    (groups[r] ||= []).push({ t, ci });
  });
  const order = ['support', 'command', 'same', 'drain', 'pressure'];
  const yearNote = interpret(z, TAROT[0], zi, 0).year.split(' 올해의')[0];

  const body = `    <div class="sum">
      <p>${esc(z.temper)}</p>
      <div class="chips">${[z.core, ...z.strength].map(k => `<span class="chip">${esc(k)}</span>`).join('')}</div>
    </div>

    <h2>${z.name}띠의 기본 자료</h2>
    <div class="tbl">
      <div class="r"><span class="k">지지 · 오행 · 음양</span><span class="v">${z.ji} · ${z.elem} · ${z.yin}</span></div>
      <div class="r"><span class="k">해당 시</span><span class="v">${z.hour}</span></div>
      <div class="r"><span class="k">절기</span><span class="v">${z.season} · ${z.month}</span></div>
      <div class="r"><span class="k">삼합</span><span class="v">${z.ji}${z.sanhap.join('')} — 힘을 합치는 지지</span></div>
      <div class="r"><span class="k">육합</span><span class="v">${z.yukhap} — 인연으로 묶이는 지지</span></div>
      <div class="r"><span class="k">충(沖)</span><span class="v">${z.chung} — 정면으로 부딪히는 지지</span></div>
      <div class="r"><span class="k">해당 연생</span><span class="v">${z.years.join(' · ')}</span></div>
    </div>

    <h2>강점과 조심할 자리</h2>
    <p><strong>타고난 쪽</strong> — ${z.strength.join(' / ')}.</p>
    <p><strong>조심할 쪽</strong> — ${z.caution.join(' / ')}.</p>
    <h3>일과 직업</h3><p>${esc(z.work)}</p>
    <h3>사람과 애정</h3><p>${esc(z.love)}</p>
    <h3>돈과 재물</h3><p>${esc(z.money)}</p>

    <h2>${YEAR.label} ${z.name}띠</h2>
    <p>${esc(yearNote)}</p>

    <h2>타로 22장으로 본 ${z.name}띠</h2>
    <p class="muted">카드마다 배속된 오행이 ${z.name}띠의 ${z.elem}와 만나는 방식이 다릅니다.
    관계별로 묶어 두었으니, 지금 마음에 걸리는 카드부터 보십시오.</p>
${order.filter(r => groups[r]).map(r => `    <h3>${esc(REL_LABEL[r])}</h3>
    <div class="grid">
      ${groups[r].map(({ t }) => `<a href="${BASE}/saju-tarot/${z.slug}-${t.slug}"><span class="t">${t.ko}</span><span class="d">${t.num} · ${t.elem} · ${t.keys[0]}</span></a>`).join('\n      ')}
    </div>`).join('\n')}

    <h2>다른 띠 보기</h2>
    <div class="grid">
      ${ZODIAC.filter(o => o.slug !== z.slug).map(o => `<a href="${BASE}/ddi/${o.slug}"><span class="t">${o.name}띠</span><span class="d">${o.ji} · ${o.elem}</span></a>`).join('\n      ')}
    </div>`;

  const desc = trim(`${z.name}띠(${z.ji}·${z.elem})의 사주 바탕과 타로 메이저 22장을 오행 생극으로 겹쳐 본 해설. ${z.name}띠 강점·조심할 자리, ${YEAR.label} 운세, 카드별 해석 22편. ${INFO.since}년 개원 ${INFO.name}.`, 155);
  return {
    path: `/ddi/${z.slug}`,
    html: layout({
      site: SITE, base: BASE, path: `/ddi/${z.slug}`,
      title: `${z.name}띠 사주 × 타로 22장 해설 | ${INFO.name}`, desc,
      keywords: `${z.name}띠, ${z.name}띠 사주, ${z.name}띠 성격, ${z.name}띠 ${YEAR.label} 운세, ${z.name}띠 타로, ${z.ji} ${z.elem}, 분당 야탑 사주`,
      eyebrow: `${z.ji} · ${z.elem} · ${z.yin} · ${z.years.join(', ')}년생`,
      h1: `${z.name}띠 — ${z.core}`,
      crumbs: [{ name: '사주·타로 해설', href: '' }, { name: `${z.name}띠` }],
      ld: [{
        '@context': 'https://schema.org', '@type': 'CollectionPage',
        name: `${z.name}띠 사주 × 타로 22장 해설`, description: desc, inLanguage: 'ko-KR',
        author, publisher: author
      }],
      body
    })
  };
}

/* ── 카드 허브 22 ────────────────────────────────────────────── */
function tarotHub(t, ci) {
  const groups = {};
  ZODIAC.forEach((z, zi) => {
    const r = relation(t.elem, z.elem);
    (groups[r] ||= []).push({ z, zi });
  });
  const order = ['support', 'command', 'same', 'drain', 'pressure'];
  const prev = TAROT[(ci + TAROT.length - 1) % TAROT.length];
  const next = TAROT[(ci + 1) % TAROT.length];

  const body = `    <div class="sum">
      <p>${esc(t.flow)}</p>
      <div class="chips">${t.keys.map(k => `<span class="chip">${esc(k)}</span>`).join('')}</div>
    </div>

    <h2>${t.ko} 카드 읽는 법</h2>
    <p><strong>정방향</strong> — ${esc(t.advice)}</p>
    <p><strong>역방향</strong> — ${esc(t.warn)}</p>
    <p><strong>실천</strong> — ${esc(t.action)}</p>
    <div class="tbl">
      <div class="r"><span class="k">번호 · 이름</span><span class="v">${t.num}. ${t.ko} (${t.en})</span></div>
      <div class="r"><span class="k">배속 오행</span><span class="v">${t.elem}</span></div>
      <div class="r"><span class="k">주제</span><span class="v">${t.keys.join(' · ')}</span></div>
    </div>
    <h3>일</h3><p>${esc(t.work)}</p>
    <h3>사람</h3><p>${esc(t.love)}</p>
    <h3>돈</h3><p>${esc(t.money)}</p>

    <h2>띠에 따라 이 카드는 다르게 읽힙니다</h2>
    <p class="muted">${t.ko}의 기운은 ${t.elem}입니다. 이 ${t.elem}가 각 띠의 오행과 만나 생(生)하는지
    극(剋)하는지에 따라 같은 카드가 다른 뜻이 됩니다.</p>
${order.filter(r => groups[r]).map(r => `    <h3>${esc(REL_LABEL[r])}</h3>
    <div class="grid">
      ${groups[r].map(({ z }) => `<a href="${BASE}/saju-tarot/${z.slug}-${t.slug}"><span class="t">${z.name}띠</span><span class="d">${z.ji} · ${z.elem} — ${z.core}</span></a>`).join('\n      ')}
    </div>`).join('\n')}

    <h2>이어서 보기</h2>
    <div class="pager">
      <a href="${BASE}/tarot/${prev.slug}"><span class="l">← ${prev.num}번</span><span class="t">${prev.ko}</span></a>
      <a href="${BASE}/tarot/${next.slug}"><span class="l">${next.num}번 →</span><span class="t">${next.ko}</span></a>
    </div>`;

  const desc = trim(`타로 ${t.num}번 ${t.ko}(${t.en}) 카드의 의미를 사주 오행 ${t.elem}로 바꿔 12띠와 겹쳐 본 해설. 정방향·역방향, 일·사람·돈, 띠별 해석 12편. ${INFO.since}년 개원 ${INFO.name}.`, 155);
  return {
    path: `/tarot/${t.slug}`,
    html: layout({
      site: SITE, base: BASE, path: `/tarot/${t.slug}`,
      title: `타로 ${t.ko} 카드 의미 × 12띠 사주 | ${INFO.name}`, desc,
      keywords: `타로 ${t.ko}, ${t.ko} 카드 의미, ${t.en}, 메이저 아르카나 ${t.num}번, 타로 정방향 역방향, 사주 타로 결합`,
      eyebrow: `메이저 아르카나 ${t.num}번 · 배속 오행 ${t.elem}`,
      h1: `타로 ${t.ko} — ${t.keys[0]}의 카드`,
      crumbs: [{ name: '사주·타로 해설', href: '' }, { name: `타로 ${t.ko}` }],
      ld: [{
        '@context': 'https://schema.org', '@type': 'CollectionPage',
        name: `타로 ${t.ko} 카드 의미 × 12띠 사주`, description: desc, inLanguage: 'ko-KR',
        author, publisher: author
      }],
      body
    })
  };
}


/* ── 단계별 리딩 ─────────────────────────────────────────────── */
function reading() {
  const body = `<div class="rail" id="rail"><b></b><b></b><b></b><b></b><b></b></div>
<div class="rail-l" id="railL">민원장 철학원 · 사주와 타로를 겹쳐 읽습니다</div>
<div class="wrap">

  <section class="stage on" id="s-gate">
    <div class="eyebrow">${INFO.since}년 개원 · 종로 적선동 3대 철학관</div>
    <h1>운명의 문을<br>열어드립니다</h1>
    <p class="lead">생년월일시를 넣으면 <strong>만세력</strong>이 펼쳐지고, 그 위에 <strong>타로 세 장</strong>을 올립니다.
      사주의 세 자리(띠·일간·월지)와 카드의 오행이 생(生)하는지 극(剋)하는지를 따져 결론까지 단계로 보여 드립니다.</p>
    <p class="muted" style="margin-top:14px">민원장은 오랜 연구를 통해 국내 최초로 사주와 타로를 연결해 운세를 풀어 왔습니다.
      이 화면은 그 방식을 규칙으로 옮긴 것입니다.</p>
    <div class="acts"><button class="btn" id="go-birth">시작하기 →</button>
      <a class="btn ghost" href="${BASE}/matrix">264 매트릭스 먼저 보기</a></div>
    <div class="rule"></div>
    <div class="links">
      <a href="${BASE}"><span class="t">읽을거리 300편</span><span class="d">띠별 · 카드별 해설</span></a>
      <a href="${BASE}/about"><span class="t">민원장 소개</span><span class="d">적선동에서 야탑까지</span></a>
    </div>
  </section>

  <section class="stage" id="s-birth">
    <div class="eyebrow">1단계 · 생년월일</div>
    <h1>태어난 때를<br>알려 주세요</h1>
    <p class="lead">양력으로 넣어 주세요. 사주의 해는 1월 1일이 아니라 <strong>입춘</strong>부터 바뀌고,
      달은 <strong>절기</strong>로 갈립니다. 그 경계는 자동으로 계산합니다.</p>
    <div class="panel">
      <div class="field"><label for="date">생년월일 (양력)</label><input type="date" id="date" min="1920-01-01" max="2030-12-31"></div>
      <div class="field"><label for="time">태어난 시각</label><input type="time" id="time">
        <label class="chk"><input type="checkbox" id="noTime"> 시각을 모릅니다 (시주 없이 봅니다)</label></div>
      <div class="field"><label>성별 <span style="color:var(--dim)">— 대운 방향을 정하는 데 씁니다</span></label>
        <div class="seg" id="sexseg">
          <button type="button" data-v="M" aria-pressed="true">남자</button>
          <button type="button" data-v="F" aria-pressed="false">여자</button></div></div>
      <div class="err" id="birthErr"></div>
    </div>
    <p class="muted" style="margin-top:12px">입력한 값은 이 브라우저 안에서만 계산됩니다. 서버로 보내지 않고 저장하지도 않습니다.</p>
    <div class="acts"><button class="btn" id="go-manse">만세력 펼치기 →</button></div>
  </section>

  <section class="stage" id="s-manse"></section>

  <section class="stage" id="s-draw">
    <div class="eyebrow">3단계 · 카드</div>
    <h1>세 장을 뽑습니다</h1>
    <p class="lead">첫 장은 <strong>타고난 바탕</strong>(띠), 둘째 장은 <strong>지금의 나</strong>(일간),
      셋째 장은 <strong>들어오는 자리</strong>(월지)에 놓입니다. 어느 카드가 나올지는 뽑은 뒤에 정해집니다.</p>
    <div class="deck" id="deck"></div>
    <p class="muted" id="drawHint" style="text-align:center"></p>
    <div class="slots" id="slots"></div>
    <div class="acts"><button class="btn" id="go-cross" disabled>사주 위에 올리기 →</button>
      <button class="btn ghost" id="reshuffle">다시 섞기</button></div>
  </section>

  <section class="stage" id="s-cross"></section>
  <section class="stage" id="s-result"></section>

  <div class="disc">이 화면의 해석은 12지와 타로 메이저에 배속한 오행의 생극(生剋)을 규칙으로 삼아 자동 생성된 일반론입니다.
    만세력은 천문 계산으로 절기를 구하지만 절입 시각은 ±10분가량 오차가 있을 수 있어, 경계 출생은 따로 표시합니다.
    의료·법률·투자 판단의 근거로 쓸 수 없으며, 선택과 책임은 본인에게 있습니다.</div>
</div>`;

  const desc = `생년월일시를 넣으면 만세력 네 기둥이 펼쳐지고, 타로 세 장을 사주 위에 올려 생극으로 읽어 결론까지 단계로 보여 드립니다. ${INFO.since}년 개원 ${INFO.name}.`;
  return {
    path: '/reading',
    html: darkLayout({
      site: SITE, base: BASE, path: '/reading',
      title: `사주 × 타로 단계별 리딩 — 만세력부터 결론까지 | ${INFO.name}`, desc: trim(desc, 158),
      keywords: '사주 타로, 만세력, 무료 사주, 사주 네 기둥, 일간, 십신, 대운, 타로 3장, 분당 야탑 사주, 민원장 철학원',
      ld: [BIZ, {
        '@context': 'https://schema.org', '@type': 'WebApplication',
        name: '사주 × 타로 단계별 리딩', applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Web', inLanguage: 'ko-KR', description: trim(desc, 158),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' }, publisher: author
      }],
      body,
      script: `<script type="module" src="${BASE}/assets/reading.js"></script>`
    })
  };
}

/* ── 264 매트릭스 ────────────────────────────────────────────── */
// 칸 기호: 카드가 나를 생하면 ↑, 내가 카드를 다루면 ◆, 같으면 ＝,
//          내가 카드로 기운을 내주면 ↓, 카드가 나를 누르면 ✕
const MX_SIGN = { support: '↑', command: '◆', same: '＝', drain: '↓', pressure: '✕' };
function matrix() {
  const head = TAROT.map(t => `<th><span style="display:block">${t.num}</span>${t.ko.length > 4 ? t.ko.slice(0, 2) + '…' : t.ko}</th>`).join('');
  const rows = ZODIAC.map(z => {
    const cells = TAROT.map(t => {
      const r = relation(t.elem, z.elem);
      return `<td class="c-${r}"><a href="${BASE}/saju-tarot/${z.slug}-${t.slug}" title="${z.name}띠 × ${t.ko} — ${REL_LABEL[r]}" aria-label="${z.name}띠 × ${t.ko} ${REL_SHORT[r]}">${MX_SIGN[r]}</a></td>`;
    }).join('');
    return `<tr><th><a href="${BASE}/ddi/${z.slug}">${z.name}띠<br><span style="font-size:.7rem;color:var(--dim)">${z.ji}·${z.elem}</span></a></th>${cells}</tr>`;
  }).join('\n      ');

  const legend = ['support', 'command', 'same', 'drain', 'pressure']
    .map(r => `<span><i style="background:var(--m-${r})"></i><b style="color:var(--paper);font-weight:400">${MX_SIGN[r]}</b> ${REL_LABEL[r]}</span>`).join('');

  const body = `<div class="wrap">
  <div class="eyebrow">12띠 × 메이저 22장</div>
  <h1>264가지 조합 지도</h1>
  <p class="lead">가로는 타로 메이저 22장, 세로는 12띠입니다. 칸의 색은 카드의 오행이 띠의 오행과 맺는 관계입니다.
    칸을 누르면 그 조합의 해설로 들어갑니다.</p>
  <div class="legend">${legend}</div>
  <div class="mx"><table>
    <thead><tr><th style="text-align:left">띠 \\ 카드</th>${head}</tr></thead>
    <tbody>
      ${rows}
    </tbody>
  </table></div>
  <p class="muted" style="margin-top:12px">가로로 밀어서 보세요. 한 줄(띠)을 따라가면 같은 사람에게 22장이 각각 어떻게 다르게 들어오는지 보이고,
    한 칸(카드)을 세로로 보면 같은 카드가 띠에 따라 어떻게 뒤집히는지 보입니다.</p>
  <div class="acts">
    <a class="btn" href="${BASE}/reading">내 사주로 직접 해보기 →</a>
    <a class="btn ghost" href="${BASE}">띠별·카드별 해설 300편</a>
  </div>
  <div class="disc">칸의 관계는 12지의 오행과 타로 메이저에 배속한 오행의 생극(生剋)으로 자동 판정한 것입니다.
    실제 상담은 여덟 글자를 모두 보고 판단합니다.</div>
</div>`;

  const desc = `12띠와 타로 메이저 22장의 264가지 조합을 오행 생극 관계로 한 장에 펼친 지도. 칸을 누르면 해당 해설로. ${INFO.since}년 개원 ${INFO.name}.`;
  return {
    path: '/matrix',
    html: darkLayout({
      site: SITE, base: BASE, path: '/matrix',
      title: `사주 × 타로 264 조합 매트릭스 | ${INFO.name}`, desc: trim(desc, 158),
      keywords: '사주 타로 매트릭스, 띠별 타로, 타로 22장, 오행 생극, 264 조합, 민원장 철학원',
      ld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage',
             name: '사주 × 타로 264 조합 매트릭스', description: trim(desc, 158),
             inLanguage: 'ko-KR', publisher: author }],
      body
    })
  };
}

/* ── 홈 ──────────────────────────────────────────────────────── */
function home() {
  const body = `    <p class="lead">${INFO.since}년 종로 적선동에서 문을 연 민원장 철학원은
    오랜 연구를 통해 <strong>국내 최초로 사주와 타로를 연결해</strong> 운세를 풀어 왔습니다.
    이 섹션은 그 방식을 그대로 규칙으로 옮긴 것입니다. 12지(地支)의 오행과
    타로 메이저 22장에 배속한 오행이 서로 생(生)하는지 극(剋)하는지를 따져,
    <strong>264가지 조합</strong>의 해설을 자동으로 펼쳐 둔 자료입니다.
    읽을거리로 바로 보셔도 되고, <strong>내 생년월일로 직접</strong> 돌려 보셔도 됩니다.</p>

    <section class="hero-cta">
      <div class="hc-in">
        <div class="hc-eyebrow">만세력 → 카드 → 교차 → 결론</div>
        <h2>내 사주로 직접 해보기</h2>
        <p>생년월일시를 넣으면 <strong>만세력 네 기둥</strong>이 펼쳐집니다.
          그 위에 <strong>타로 세 장</strong>을 올려 띠·일간·월지와 하나씩 맞춰 보고,
          다섯 가지 생극 관계로 결론까지 단계로 보여 드립니다.</p>
        <a class="btn" href="${BASE}/reading">단계별 리딩 시작하기 →</a>
        <a class="btn outline" href="${BASE}/matrix">264 조합 매트릭스 보기</a>
      </div>
    </section>

    <div class="finder" id="finder" data-base="${BASE}">
      <h2>띠만 빨리 찾기</h2>
      <p>태어난 해만 넣어도 됩니다. 생년월일을 넣으면 입춘 기준으로 보정합니다.</p>
      <div class="row">
        <input type="text" inputmode="numeric" placeholder="1978 또는 1978-05-12" aria-label="태어난 해 또는 생년월일">
        <button type="button">찾기</button>
      </div>
      <div class="out" role="status"></div>
    </div>

    <h2>12띠로 들어가기</h2>
    <div class="grid">
      ${ZODIAC.map(z => `<a href="${BASE}/ddi/${z.slug}"><span class="t">${z.name}띠</span><span class="d">${z.ji} · ${z.elem} — ${z.core}</span></a>`).join('\n      ')}
    </div>

    <h2>타로 메이저 22장으로 들어가기</h2>
    <div class="grid">
      ${TAROT.map(t => `<a href="${BASE}/tarot/${t.slug}"><span class="t">${t.ko}</span><span class="d">${t.num} · ${t.elem} · ${t.keys[0]}</span></a>`).join('\n      ')}
    </div>

    <h2>사주와 타로를 어떻게 겹치는가</h2>
    <p>타로는 그림으로 지금의 흐름을 보여주고, 사주는 글자로 타고난 바탕을 보여줍니다.
    같은 카드를 뽑아도 사람마다 다르게 읽히는 이유가 여기 있습니다. 바탕이 다르기 때문입니다.</p>
    <p>그래서 이 섹션은 카드마다 오행을 하나 배속했습니다. 그리고 그 오행이 띠(지지)의 오행과
    만나는 방식을 다섯 가지로 나눕니다. 이 다섯 가지가 해석의 성격을 결정합니다.</p>
    <div class="tbl">
      ${['support', 'command', 'same', 'drain', 'pressure'].map(r =>
        `<div class="r"><span class="k">${REL_SHORT[r]}</span><span class="v" style="font-weight:400;color:var(--body);text-align:left">${REL_LABEL[r].split('—')[1].trim()}</span></div>`).join('\n      ')}
    </div>
    <p class="muted" style="margin-top:12px">예를 들어 태양 카드는 火입니다. 같은 太陽을 뽑아도
    土인 소띠에게는 밀어주는 자리(火生土)가 되고, 金인 닭띠에게는 누르는 자리(火剋金)가 됩니다.
    이것이 "사주와 타로를 연결한다"는 말의 실제 내용입니다.</p>

    <h2>${YEAR.label}을 기준으로 씁니다</h2>
    <p>해설의 세운(그 해의 운)은 ${YEAR.label}, 오행으로는 ${YEAR.elem}의 해를 기준으로 썼습니다.
    각 띠의 지지가 午와 충(沖)인지 합(合)인지에 따라 올해의 성격이 달라지므로,
    띠마다 올해 문단이 다릅니다.</p>`;

  const desc = `12띠 사주와 타로 메이저 22장을 오행 생극으로 겹쳐 본 264가지 해설. 국내 최초로 사주와 타로를 연결한 ${INFO.since}년 개원 ${INFO.name}. 생년월일로 내 띠 찾기. 전화예약 ${INFO.tel}`;
  return {
    path: '',
    html: layout({
      site: SITE, base: BASE, path: '', title: `사주 × 타로 결합 해설 264 — ${INFO.name}`,
      desc: trim(desc, 158),
      keywords: '사주 타로, 사주와 타로, 띠별 타로, 타로 카드 의미, 12띠 사주, 2026 병오년 운세, 분당 야탑 사주, 야탑역 철학관, 민원장 철학원',
      eyebrow: `${INFO.since}년 개원 · 종로 적선동 3대 철학관 · 대한역술인협회 부회장`,
      h1: '사주와 타로를 겹쳐 읽는<br>264가지 해설',
      crumbs: [{ name: '사주·타로 해설' }],
      ld: [BIZ, {
        '@context': 'https://schema.org', '@type': 'CollectionPage',
        name: `사주 × 타로 결합 해설 — ${INFO.name}`, description: trim(desc, 158),
        inLanguage: 'ko-KR', author, publisher: author
      }],
      body: body + `\n<script src="${BASE}/assets/router.js" defer></script>`
    })
  };
}

/* ── 소개(경력·명성) ─────────────────────────────────────────── */
function about() {
  const body = `    <p class="lead">운명의 문을 열어드립니다 — 종로 적선동 40년의 전통,
    이제 분당 야탑역에서 만나보세요.</p>

    <h2>종로구 적선동 100번지</h2>
    <p>지금은 재개발되어 사라진 서울 한복판의 종로구 적선동 100번지.
    그 자리에서 민원장은 <strong>김봉수, 백운암과 함께 3대 철학관</strong>으로 이름을 떨쳤습니다.</p>
    <p>${INFO.since}년에 시작된 상담이 지금까지 이어지고 있습니다.
    이제 분당 야탑역에서 속시원한 인생상담을 받아보세요.</p>

    <h2>1987년 시작된 살아있는 전설</h2>
    <p>민원장은 <strong>대한역술인협회 부회장</strong>을 맡아 왔습니다.
    음양오행의 동양철학을 바탕으로 사주·궁합·택일·작명과 개명을 보고,
    상담에는 심리상담을 함께 놓습니다.</p>

    <h2>국내 최초로 사주와 타로를 연결</h2>
    <p>타로는 보통 사주와 따로 봅니다. 민원장은 오랜 연구를 통해
    <strong>국내 최초로 사주와 타로를 연결하여</strong> 속시원히 운세를 풀어 왔습니다.
    카드가 보여주는 지금의 흐름을 사주의 바탕 위에 올려놓고 읽는 방식입니다.</p>
    <p>이 섹션의 <a href="${BASE}">264가지 결합 해설</a>은 그 방식을 오행의 생극(生剋)이라는
    규칙으로 옮겨 자동으로 펼쳐 놓은 것입니다. 일반론이라는 한계가 있지만,
    사주와 타로가 어떻게 한 자리에서 읽히는지는 그대로 보실 수 있습니다.</p>

    <h2>답답한 속을 뻥 뚫어주는 상담</h2>
    <p>예약제로 운영되며, 심리상담도 병행합니다.</p>
    <h3>수지구 개복치1009</h3>
    <p>“하는 일이 너무 답답해서 혹시나 하는 마음으로 방문했는데 너무 시원했습니다.
    답을 알려준다기보다 내 마음의 문제를 풀고 온 느낌입니다. 심리상담 백번 받는거보다
    나은거 같아요~ 주저리주저리 들어주셔서 감사합니다..”</p>
    <h3>방배동 짱돌21</h3>
    <p>“원장님의 인생경험과 인간관계까지 더해서 인생상담을 자분자분 말씀해 주셔서
    속이 좀 풀리고 사업설계에 많은 도움이 되었습니다. 올 한해 좋은 일 있으면 민원장님 덕입니다.”</p>
    <h3>성남 Pearl</h3>
    <p>“다녀왔는데 너무 정확하게 말씀해주셔서 속시원합니다 또 방문하겠습니다 감사합니다.”</p>

    <h2>예약 안내</h2>
    <p>전화예약 없이 방문하실 경우 오래동안 기다리거나, 상담이 길어질 경우
    다음 상담자와 시간이 겹칠수 있습니다. 방문시에는 반드시 전화예약을 먼저 해 주세요.</p>
    <p><strong>전화상담도 예약 먼저</strong> — 바쁘신 경우 전화상담도 가능합니다.
    이 경우도 전화로 시간예약 먼저 해주세요.</p>

    <h2>오시는 길</h2>
    <div class="tbl">
      <div class="r"><span class="k">주소</span><span class="v">${INFO.addr}</span></div>
      <div class="r"><span class="k">교통</span><span class="v">${INFO.access}</span></div>
      <div class="r"><span class="k">전화</span><span class="v">${INFO.tel2} / ${INFO.tel}</span></div>
    </div>
    <div class="grid">
      <a href="/"><span class="t">본사이트 보기</span><span class="d">약도 · 간판 사진 · 요금표</span></a>
      <a href="${BASE}"><span class="t">사주·타로 해설</span><span class="d">264가지 조합</span></a>
    </div>`;

  const desc = `${INFO.since}년 개원, 종로구 적선동 100번지에서 김봉수·백운암과 함께 3대 철학관. 대한역술인협회 부회장. 국내 최초로 사주와 타로를 연결한 민원장 철학원 — 분당 야탑역 2번출구 도보 3분.`;
  return {
    path: '/about',
    html: layout({
      site: SITE, base: BASE, path: '/about',
      title: `민원장 — 적선동 3대 철학관, 1987년부터 | ${INFO.name}`, desc: trim(desc, 158),
      keywords: '민원장, 민원장 철학원, 적선동 철학관, 김봉수 백운암, 대한역술인협회 부회장, 분당 야탑 사주, 야탑역 철학관',
      eyebrow: `${INFO.since}년 개원 · 대한역술인협회 부회장`,
      h1: '민원장 — 적선동에서<br>야탑까지',
      crumbs: [{ name: '사주·타로 해설', href: '' }, { name: '민원장 소개' }],
      ld: [BIZ, {
        '@context': 'https://schema.org', '@type': 'AboutPage',
        name: '민원장 소개', description: trim(desc, 158), inLanguage: 'ko-KR', publisher: author
      }],
      body
    })
  };
}

/* ── 실행 ────────────────────────────────────────────────────── */
await rm(OUT, { recursive: true, force: true });
await mkdir(join(OUT, 'assets'), { recursive: true });
for (const f of await readdir(join(here, 'assets'))) {
  await copyFile(join(here, 'assets', f), join(OUT, 'assets', f));
}
// 브라우저에서 그대로 import 하는 엔진 모듈 (Node/브라우저 공용 순수 ESM)
await mkdir(join(OUT, 'assets', 'engine'), { recursive: true });
for (const [src, dst] of [
  ['data/zodiac.mjs', 'zodiac.mjs'], ['data/tarot.mjs', 'tarot.mjs'],
  ['lib/ko.mjs', 'ko.mjs'], ['lib/interpret.mjs', 'interpret.mjs'],
  ['lib/solar.mjs', 'solar.mjs'], ['lib/manse.mjs', 'manse.mjs'],
  ['lib/reading.mjs', 'reading.mjs'], ['lib/cards.mjs', 'cards.mjs']
]) await copyFile(join(here, src), join(OUT, 'assets', 'engine', dst));

const pages = [home(), about(), reading(), matrix()];
ZODIAC.forEach((z, zi) => pages.push(ddiHub(z, zi)));
TAROT.forEach((t, ci) => pages.push(tarotHub(t, ci)));
ZODIAC.forEach((z, zi) => TAROT.forEach((t, ci) => pages.push(detail(z, zi, t, ci))));
for (const p of pages) await emit(p.path, p.html);

const today = new Date().toISOString().slice(0, 10);
const prio = p => (p === '' ? '0.9' : p === '/reading' ? '1.0' : p === '/matrix' ? '0.9' : p === '/about' ? '0.8' : /^\/(ddi|tarot)\//.test(p) ? '0.7' : '0.6');
await writeFile(join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${SITE}${BASE}${u}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${prio(u)}</priority></url>`).join('\n') +
  `\n</urlset>\n`, 'utf8');

console.log(`✓ ${pages.length} pages → ${OUT}`);
console.log(`  홈 1 · 소개 1 · 띠 허브 ${ZODIAC.length} · 카드 허브 ${TAROT.length} · 상세 ${ZODIAC.length * TAROT.length}`);
console.log(`  sitemap.xml ${urls.length} URL · base ${BASE}`);
