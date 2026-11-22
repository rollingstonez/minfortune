// 사주 × 타로 단계별 리딩 — 화면 전환·만세력 출력·카드 뽑기·교차·결론
import { TAROT } from './engine/tarot.mjs';
import { ZODIAC } from './engine/zodiac.mjs';
import { manse, SIPSIN_NOTE } from './engine/manse.mjs';
import { interpret } from './engine/interpret.mjs';
import { SLOTS, cross, conclude } from './engine/reading.mjs';
import { cardSVG, cardBackSVG } from './engine/cards.mjs';
import { josa } from './engine/ko.mjs';

const $ = s => document.querySelector(s);
const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
const ELEMS = ['木', '火', '土', '金', '水'];
const BASE = document.body.dataset.base || '/claude';
const STEPS = ['입력', '만세력', '카드', '교차', '결론'];

const S = { birth: null, m: null, picks: [], crosses: null };

/* ── 별빛 ── */
(function sky() {
  const w = $('#sky'); if (!w) return;
  for (let i = 0; i < 30; i++) {
    const s = el('i');
    const r = Math.random() * 1.9 + .6;
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${r}px;height:${r}px;animation-delay:${(Math.random() * 5).toFixed(2)}s`;
    w.appendChild(s);
  }
})();

/* ── 단계 이동 ── */
function go(id, step) {
  document.querySelectorAll('.stage').forEach(s => s.classList.toggle('on', s.id === id));
  const bars = document.querySelectorAll('#rail b');
  bars.forEach((b, i) => b.classList.toggle('done', i < step));
  $('#railL').textContent = step ? `${step} / 5 · ${STEPS[step - 1]}` : '민원장 철학원 · 사주와 타로를 겹쳐 읽습니다';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── 1. 생년월일 ── */
$('#go-birth').onclick = () => go('s-birth', 1);

let sex = 'M';
document.querySelectorAll('#sexseg button').forEach(b => b.onclick = () => {
  sex = b.dataset.v;
  document.querySelectorAll('#sexseg button').forEach(x => x.setAttribute('aria-pressed', x === b));
});
$('#noTime').onchange = e => { $('#time').disabled = e.target.checked; };

$('#go-manse').onclick = () => {
  const d = $('#date').value, noT = $('#noTime').checked, t = $('#time').value;
  const err = $('#birthErr');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) { err.textContent = '생년월일을 넣어 주세요.'; return; }
  const [y, mo, da] = d.split('-').map(Number);
  if (y < 1920 || y > 2030) { err.textContent = '1920년부터 2030년까지 볼 수 있습니다.'; return; }
  let hh = null, mi = 0;
  if (!noT) {
    if (!/^\d{2}:\d{2}$/.test(t)) { err.textContent = '태어난 시각을 넣거나 "모름"을 눌러 주세요.'; return; }
    [hh, mi] = t.split(':').map(Number);
  }
  err.textContent = '';
  S.birth = { y, mo, da, hh, mi, sex };
  S.m = manse(y, mo, da, hh, mi, sex);
  renderManse();
  go('s-manse', 2);
};

/* ── 2. 만세력 ── */
function pillarEl(cap, p) {
  if (!p) return el('div', 'pil empty', `<div class="cap">${cap}</div><div class="sip">시 모름</div>
    <div class="ch">?</div><div class="sep"></div><div class="ch">?</div>`);
  return el('div', 'pil', `<div class="cap">${cap}</div>
    <div class="sip">${p.ganSip}</div>
    <div class="ch e-${p.ganElem}">${p.ganH}</div><div class="ko">${p.gan} · ${p.ganElem}</div>
    <div class="sep"></div>
    <div class="ch e-${p.jiElem}">${p.jiH}</div><div class="ko">${p.ji} · ${p.jiElem}</div>
    <div class="sip">${p.jiSip}</div>`);
}

function renderManse() {
  const m = S.m, z = ZODIAC.find(x => x.slug === m.animalSlug);
  const root = $('#s-manse'); root.innerHTML = '';
  root.append(el('div', 'eyebrow', '2단계 · 만세력'),
    el('h1', null, `${m.sajuYear}년 ${m.animal}띠<br>일간 <span class="e-${m.dayElem}">${m.dayGanH}</span>${m.dayGan} — ${z.core}`),
    el('p', 'lead', `태어난 날짜를 60갑자로 바꾸면 네 기둥이 나옵니다. 이 여덟 글자가 사주입니다.
      가운데 <strong>일간 ${m.dayGanH}(${m.dayElem})</strong>가 나 자신이고, 나머지 일곱 글자는 나를 둘러싼 조건입니다.`));

  const pw = el('div', 'pillars');
  pw.append(pillarEl('시주 時', m.pillars.hour), pillarEl('일주 日', m.pillars.day),
            pillarEl('월주 月', m.pillars.month), pillarEl('연주 年', m.pillars.year));
  root.append(pw);
  root.append(el('p', 'muted', `절기로는 <strong>${m.term.name}</strong>(${m.term.at}) 구간에 태어났습니다.
    ${m.sajuYear}년 입춘은 ${m.ipchun}이고, 사주의 해는 양력 1월 1일이 아니라 입춘부터 바뀝니다.`));

  if (m.border) root.append(el('div', 'warn',
    `⚠ <strong>절입 경계 출생</strong> — ${m.border.term} 절입까지 약 ${m.border.hours}시간입니다.
     이 구간은 몇 분 차이로 월주(와 경우에 따라 연주)가 통째로 바뀝니다.
     출생 시각이 분 단위로 정확하지 않다면 전화로 확인받으시는 편이 안전합니다.`));
  if (m.yaja) root.append(el('div', 'warn',
    `⚠ <strong>야자시(夜子時) 출생</strong> — 밤 11시 이후는 일주를 다음 날로 보는 학파와 당일로 보는 학파가 갈립니다.
     여기서는 자정 기준으로 계산했습니다.`));

  root.append(el('h2', null, '오행 분포'));
  const dw = el('div', 'dist');
  ELEMS.forEach(e => {
    const n = m.dist[e], h = Math.round(n / Math.max(1, m.total) * 100);
    dw.append(el('div', null,
      `<div class="bar"><i class="b-${e}" style="height:0"></i></div>
       <div class="lb e-${e}">${e}</div><div class="n">${n}자</div>`));
    setTimeout(() => { const i = dw.querySelectorAll('.bar i'); i[ELEMS.indexOf(e)].style.height = Math.max(6, h * 1.6) + '%'; }, 120);
  });
  root.append(dw);
  const lack = ELEMS.filter(e => !m.dist[e]);
  root.append(el('p', 'muted', lack.length
    ? `여덟 글자에 ${lack.join('·')}가 없습니다. 없는 오행은 평생 당기는 자리가 됩니다.`
    : `다섯 오행이 모두 들어 있습니다. 치우침이 적은 대신 결정이 늦어지기 쉽습니다.`));

  root.append(el('h2', null, '십신 — 여덟 글자가 나에게 하는 일'));
  const sips = [...new Set(Object.values(m.pillars).filter(Boolean)
    .flatMap(p => [p.ganSip, p.jiSip]).filter(x => x !== '일간'))];
  const sp = el('div', 'panel tight');
  sips.forEach(s => sp.append(el('p', 'muted', `<strong style="color:var(--gold-l)">${s}</strong> — ${SIPSIN_NOTE[s]}`)));
  root.append(sp);

  if (m.daeun) {
    root.append(el('h2', null, `대운 — ${m.daeun.forward ? '순행' : '역행'}, ${m.daeun.start}세부터`));
    const dr = el('div', 'daeun');
    const age = new Date().getFullYear() - S.birth.y + 1;
    m.daeun.list.forEach(d => {
      const now = age >= d.age && age < d.age + 10;
      dr.append(el('div', now ? 'now' : '', `<div class="a">${d.age}세</div>
        <div class="g">${d.ganH}${d.jiH}</div><div class="s">${d.sip}</div>`));
    });
    root.append(dr, el('p', 'muted', '10년 단위로 바뀌는 큰 흐름입니다. 테두리가 밝은 칸이 지금 지나는 대운입니다.'));
  }

  const acts = el('div', 'acts');
  const b = el('button', 'btn', '카드를 뽑겠습니다 →'); b.onclick = () => { buildDeck(); go('s-draw', 3); };
  const b2 = el('button', 'btn ghost', '← 다시 입력'); b2.onclick = () => go('s-birth', 1);
  acts.append(b, b2); root.append(acts);
}

/* ── 3. 카드 뽑기 ── */
let pool = [];
function buildDeck() {
  S.picks = []; pool = TAROT.slice();
  const deck = $('#deck'); deck.innerHTML = '';
  // 부채가 화면을 넘지 않도록 폭에서 역산한다
  const W = deck.clientWidth || 360;
  const narrow = W < 430;
  const cardW = narrow ? Math.max(66, Math.min(84, Math.round(W * 0.22))) : 104;
  const originY = narrow ? 248 : 300;
  const spread = narrow ? 54 : 100;
  deck.style.height = (narrow ? 212 : 268) + 'px';
  const n = 22;
  for (let i = 0; i < n; i++) {
    const c = el('div', 'c', cardBackSVG(cardW));
    const a = -spread / 2 + spread * i / (n - 1);
    c.style.width = cardW + 'px';
    c.style.marginLeft = -(cardW / 2) + 'px';
    c.style.transformOrigin = `50% ${originY}px`;
    c.style.transform = `rotate(${a}deg)`;
    c.style.zIndex = i;
    c.onclick = () => pick(c);
    deck.appendChild(c);
  }
  renderSlots();
  deck.classList.add('shuffling');
  setTimeout(() => deck.classList.remove('shuffling'), 700);
}
$('#reshuffle').onclick = () => buildDeck();

function pick(node) {
  if (S.picks.length >= 3 || node.classList.contains('taken')) return;
  const i = Math.floor(Math.random() * pool.length);
  S.picks.push(pool.splice(i, 1)[0]);
  node.classList.add('taken');
  renderSlots();
}

function renderSlots() {
  const w = $('#slots'); w.innerHTML = '';
  SLOTS.forEach((s, i) => {
    const p = S.picks[i];
    const d = el('div', 'slot' + (p ? ' filled' : ''));
    if (p) d.innerHTML = cardSVG(p, { w: 180 }) + `<div class="t">${s.title}</div>`;
    else d.innerHTML = `<div class="t">${s.title}</div><div class="h">${s.anchor}</div>`;
    w.appendChild(d);
  });
  $('#go-cross').disabled = S.picks.length < 3;
  $('#drawHint').textContent = S.picks.length < 3
    ? `부채에서 ${3 - S.picks.length}장을 더 고르세요. 어느 자리에 무엇이 들어갈지는 뽑고 나서 정해집니다.`
    : '세 자리가 찼습니다. 이제 사주 위에 올려 봅니다.';
}

$('#go-cross').onclick = () => { renderCross(); go('s-cross', 4); };

/* ── 4. 교차 ── */
function anchors() {
  const m = S.m;
  return [
    { name: `${m.yearJi}(${m.animal}띠)`, elem: m.yearElem, sub: '연지' },
    // 일간·월지 문장은 "{an}({ae})" 꼴이라 이름에 한글 음을 넣으면 괄호가 겹친다
    { name: m.dayGanH, elem: m.dayElem, sub: '일간' },
    { name: m.pillars.month.jiH, elem: m.pillars.month.jiElem, sub: '월지' }
  ];
}

function renderCross() {
  const a = anchors();
  S.crosses = SLOTS.map((s, i) => cross(s, a[i].name, a[i].elem, S.picks[i]));
  const root = $('#s-cross'); root.innerHTML = '';
  root.append(el('div', 'eyebrow', '4단계 · 교차'),
    el('h1', null, '사주 위에 카드를 올립니다'),
    el('p', 'lead', '카드의 기운을 오행으로 바꿔 사주의 세 자리와 맞춰 봅니다. 생(生)하면 밀어주고 극(剋)하면 누릅니다. 같은 카드라도 누구에게 들어오느냐에 따라 뜻이 바뀌는 이유가 여기 있습니다.'));

  S.crosses.forEach((c, i) => {
    const r = el('div', 'xrow');
    r.style.animationDelay = (i * .45) + 's';
    r.innerHTML = `
      <div class="side"><div class="lb">${c.slot.anchor}</div>
        <div class="big e-${c.anchorElem}">${c.anchorName.split('(')[0]}</div>
        <div class="lb">${c.anchorElem}</div></div>
      <div class="mid"><div class="arrow t-${c.rel}">${c.rel === 'support' || c.rel === 'drain' ? '生' : c.rel === 'same' ? '比' : '剋'}</div>
        <div class="badge r-${c.rel}">${c.relShort}</div></div>
      <div class="side"><div class="card">${cardSVG(c.card, { w: 74, label: false })}</div>
        <div class="lb" style="margin-top:5px">${c.card.ko} · ${c.card.elem}</div></div>
      <div class="xtext"><strong style="color:var(--gold-l)">${c.slot.title}</strong> — ${c.text}</div>`;
    root.append(r);
  });

  const acts = el('div', 'acts');
  const b = el('button', 'btn', '결론 보기 →'); b.onclick = () => { renderResult(); go('s-result', 5); };
  const b2 = el('button', 'btn ghost', '← 다시 뽑기'); b2.onclick = () => { buildDeck(); go('s-draw', 3); };
  acts.append(b, b2); root.append(acts);
}

/* ── 5. 결론 ── */
function renderResult() {
  const m = S.m, k = conclude(S.crosses, m);
  const z = ZODIAC.find(x => x.slug === m.animalSlug);
  const main = S.picks[0];
  const zi = ZODIAC.indexOf(z), ci = TAROT.indexOf(main);
  const full = interpret(z, main, zi, ci);

  const root = $('#s-result'); root.innerHTML = '';
  root.append(el('div', 'eyebrow', '5단계 · 결론'), el('h1', null, '그래서, 이렇습니다'));
  const names = S.picks.map(p => p.ko).join(' · ');
  root.append(el('div', 'verdict', `${z.core} — ${m.animal}띠 ${m.dayGanH}일간에게
    ${names}${josa(S.picks[2].ko, '이')} 들어왔습니다. ${k.tone.split('.')[0]}.`));

  root.append(el('h2', null, '세 자리를 모으면'));
  root.append(el('p', null, k.tone));
  root.append(el('p', null, k.balance));

  root.append(el('h2', null, '2026 병오년'));
  root.append(el('p', null, full.year));

  root.append(el('h2', null, '이번 달 실천 한 가지'));
  const pane = el('div', 'panel');
  S.crosses.forEach(c => pane.append(el('p', 'muted',
    `<strong style="color:var(--gold-l)">${c.slot.title} · ${c.card.ko}</strong> — ${c.action}`)));
  root.append(pane);

  root.append(el('div', 'cta', `
    <h2>여기까지가 규칙으로 뽑아낸 일반론입니다</h2>
    <p class="muted">이 화면은 띠·일간·월지라는 세 글자만 썼습니다. 실제 상담은 여덟 글자가 서로 맞물려 도는 것을 보고,
      타로도 지금 당신이 가진 질문에 맞춰 다시 펼칩니다. 그 차이는 큽니다.</p>
    <div style="margin-top:18px"><a class="btn block" href="tel:010-5750-3883">📞 010-5750-3883 전화예약</a></div>
    <div class="price">
      <div><b>사주</b>5만원</div><div><b>궁합 2인</b>10만원</div><div><b>택일</b>10만원</div>
      <div><b>개명·작명</b>20만원</div><div><b>타로</b>3만원</div>
    </div>
    <p class="muted" style="margin-top:14px">예약제 · 심리상담 병행 · 야탑역 2번출구 도보 3분</p>`));

  const links = el('div', 'links');
  links.innerHTML = `
    <a href="${BASE}/saju-tarot/${z.slug}-${main.slug}"><span class="t">${m.animal}띠 × ${main.ko} 상세</span><span class="d">이 조합만 따로 읽기</span></a>
    <a href="${BASE}/ddi/${z.slug}"><span class="t">${m.animal}띠 전체</span><span class="d">22장 카드별 해석</span></a>
    <a href="${BASE}/matrix"><span class="t">264 매트릭스</span><span class="d">띠 × 카드 전체 지도</span></a>
    <a href="${BASE}/about"><span class="t">민원장 소개</span><span class="d">적선동 3대 철학관</span></a>`;
  root.append(el('h2', null, '더 보기'), links);

  const acts = el('div', 'acts');
  const cp = el('button', 'btn ghost', '이 결과 링크 복사');
  cp.onclick = async () => {
    const b = S.birth;
    const u = `${location.origin}${location.pathname}?d=${b.y}-${String(b.mo).padStart(2,'0')}-${String(b.da).padStart(2,'0')}`
      + (b.hh === null ? '&t=x' : `&t=${String(b.hh).padStart(2,'0')}${String(b.mi).padStart(2,'0')}`)
      + `&s=${b.sex}&c=${S.picks.map(p => p.num).join('-')}`;
    try { await navigator.clipboard.writeText(u); cp.textContent = '복사했습니다'; }
    catch { prompt('이 주소를 복사하세요', u); }
    setTimeout(() => cp.textContent = '이 결과 링크 복사', 2200);
  };
  const again = el('button', 'btn ghost', '처음부터 다시');
  again.onclick = () => { history.replaceState(null, '', location.pathname); go('s-gate', 0); };
  acts.append(cp, again); root.append(acts);
}

/* ── 링크로 들어온 경우 복원 ── */
(function restore() {
  const q = new URLSearchParams(location.search);
  const d = q.get('d'), t = q.get('t'), s = q.get('s'), c = q.get('c');
  if (!d || !c) return;
  const [y, mo, da] = d.split('-').map(Number);
  let hh = null, mi = 0;
  if (t && t !== 'x' && /^\d{4}$/.test(t)) { hh = +t.slice(0, 2); mi = +t.slice(2); }
  const nums = c.split('-').map(Number);
  if (nums.length !== 3 || nums.some(n => !(n >= 0 && n <= 21))) return;
  S.birth = { y, mo, da, hh, mi, sex: s === 'F' ? 'F' : 'M' };
  S.m = manse(y, mo, da, hh, mi, S.birth.sex);
  S.picks = nums.map(n => TAROT[n]);
  renderManse(); renderCross(); renderResult();
  go('s-result', 5);
})();
