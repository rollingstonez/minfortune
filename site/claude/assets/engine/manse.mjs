// 만세력 — 생년월일시로 사주 네 기둥(年月日時)과 십신·오행 분포·대운을 구합니다.
// 브라우저와 Node 양쪽에서 그대로 돌아가는 순수 ESM.
import { toJD, fromJD, termJD_KST, JEOL } from './solar.mjs';

export const GAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
export const GAN_H = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const JI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
export const JI_H = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const JI_ANIMAL = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'];
export const JI_SLUG = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'];

const GAN_ELEM = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
const JI_ELEM  = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];
// 지지 자체의 음양 (子 陽 … 亥 陰)
const JI_YANG  = [true, false, true, false, true, false, true, false, true, false, true, false];
const GAN_YANG = i => i % 2 === 0;

const GEN = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const KEOK = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };

// 일간 기준 십신
export function sipsin(dayGan, elem, yang) {
  const me = GAN_ELEM[dayGan], meYang = GAN_YANG(dayGan);
  const same = meYang === yang;
  if (elem === me) return same ? '비견' : '겁재';
  if (GEN[me] === elem) return same ? '식신' : '상관';
  if (KEOK[me] === elem) return same ? '편재' : '정재';
  if (KEOK[elem] === me) return same ? '편관' : '정관';
  return same ? '편인' : '정인';   // GEN[elem] === me
}

export const SIPSIN_NOTE = {
  비견: '나와 같은 힘 — 자립·경쟁·동료', 겁재: '나와 같되 결이 다른 힘 — 추진·분배·다툼',
  식신: '내가 내보내는 힘 — 표현·먹을 복·여유', 상관: '내가 터뜨리는 힘 — 재능·반발·변화',
  편재: '넓게 다루는 재물 — 사업·유통·기회', 정재: '쥐고 지키는 재물 — 월급·성실·실속',
  편관: '나를 치는 힘 — 압박·결단·돌파', 정관: '나를 세우는 힘 — 명예·조직·규율',
  편인: '비껴 들어오는 도움 — 기술·직관·고독', 정인: '바르게 들어오는 도움 — 학문·보호·문서'
};

const pad = n => String(n).padStart(2, '0');
const fmt = jd => { const t = fromJD(jd); return `${t.y}-${pad(t.m)}-${pad(t.d)} ${pad(t.h)}:${pad(t.mi)}`; };

// 해당 연도의 12절 절입시각(KST 율리우스일)
function jeolOfYear(year) {
  return JEOL.map(([name, lon], i) => {
    // 소한(285°)은 그 해 1월, 입춘(315°)은 2월 … 황경 기준 연도가 어긋나지 않게 보정
    const y = lon >= 285 && lon < 360 ? year : year;
    return { name, lon, jd: termJD_KST(y, lon), monthJi: (i + 2) % 12 };
  }).sort((a, b) => a.jd - b.jd);
}

/**
 * @param {number} y,m,d  양력 생년월일
 * @param {number|null} h,mi  태어난 시각(24시간). 모르면 h=null
 * @param {'M'|'F'|null} sex  대운 방향 계산용
 */
export function manse(y, m, d, h = null, mi = 0, sex = null) {
  const known = h !== null;
  const jd = toJD(y, m, d, known ? h : 12, known ? mi : 0) + 0 /* 입력은 KST */;

  // ── 절입표: 전해·당해·다음해를 모아 현재 구간을 찾는다
  const terms = [...jeolOfYear(y - 1), ...jeolOfYear(y), ...jeolOfYear(y + 1)].sort((a, b) => a.jd - b.jd);
  let idx = -1;
  for (let i = 0; i < terms.length; i++) if (terms[i].jd <= jd) idx = i; else break;
  const cur = terms[idx], nxt = terms[idx + 1];

  // ── 연주: 입춘이 지나야 그 해
  const ipchun = termJD_KST(y, 315);
  const sajuYear = jd >= ipchun ? y : y - 1;
  const yGan = ((sajuYear - 4) % 10 + 10) % 10;
  const yJi  = ((sajuYear - 4) % 12 + 12) % 12;

  // ── 월주: 절기로 월지, 월두법으로 월간
  const mJi = cur.monthJi;                               // 寅=2 부터
  const firstGan = (yGan % 5) * 2 + 2;                   // 寅월의 천간
  const mGan = (firstGan + ((mJi - 2) % 12 + 12) % 12) % 10;

  // ── 일주: 자정 기준. (JDN+49)%60
  const jdn = Math.floor(toJD(y, m, d) + 0.5);
  const dIdx = ((jdn + 49) % 60 + 60) % 60;
  const dGan = dIdx % 10, dJi = dIdx % 12;

  // ── 시주: 시두법
  let hGan = null, hJi = null, yaja = false;
  if (known) {
    const t = h + mi / 60;
    hJi = Math.floor(((t + 1) % 24) / 2);                // 23~01시 = 子
    yaja = t >= 23;                                      // 야자시 (일주 기준이 학파마다 다름)
    hGan = ((dGan % 5) * 2 + hJi) % 10;
  }

  const pillar = (g, j) => g === null ? null : ({
    gan: GAN[g], ganH: GAN_H[g], ji: JI[j], jiH: JI_H[j],
    ganElem: GAN_ELEM[g], jiElem: JI_ELEM[j],
    ganYang: GAN_YANG(g), jiYang: JI_YANG[j],
    ganSip: sipsin(dGan, GAN_ELEM[g], GAN_YANG(g)),
    jiSip: sipsin(dGan, JI_ELEM[j], JI_YANG[j]),
    gi: g, ji_i: j
  });

  const pillars = {
    year: pillar(yGan, yJi), month: pillar(mGan, mJi),
    day: pillar(dGan, dJi), hour: known ? pillar(hGan, hJi) : null
  };
  pillars.day.ganSip = '일간';   // 일간은 나 자신

  // ── 오행 분포
  const dist = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const k of ['year', 'month', 'day', 'hour']) {
    const p = pillars[k]; if (!p) continue;
    dist[p.ganElem]++; dist[p.jiElem]++;
  }
  const total = Object.values(dist).reduce((a, b) => a + b, 0);

  // ── 대운: 양남음녀 순행 / 음남양녀 역행
  let daeun = null;
  if (sex) {
    const yangYear = GAN_YANG(yGan);
    const forward = (sex === 'M') === yangYear;
    const target = forward ? nxt.jd : cur.jd;
    const days = Math.abs(target - jd);
    const start = Math.max(1, Math.round(days / 3 * 10) / 10);
    const list = [];
    for (let i = 0; i < 8; i++) {
      const step = forward ? i + 1 : -(i + 1);
      const g = ((mGan + step) % 10 + 10) % 10, j = ((mJi + step) % 12 + 12) % 12;
      list.push({ age: Math.round(start) + i * 10, gan: GAN[g], ganH: GAN_H[g], ji: JI[j], jiH: JI_H[j],
                  sip: sipsin(dGan, GAN_ELEM[g], GAN_YANG(g)) });
    }
    daeun = { forward, start, list };
  }

  // ── 절입 경계 경고 (계산 오차 ±10분을 크게 덮는 ±2시간)
  const nearHours = Math.min(Math.abs(jd - cur.jd), Math.abs(nxt.jd - jd)) * 24;
  const border = nearHours <= 2 ? { hours: Math.round(nearHours * 60) / 60, term: nearHours === Math.abs(jd - cur.jd) * 24 ? cur.name : nxt.name } : null;

  return {
    input: { y, m, d, h, mi, known, sex },
    sajuYear, pillars, dist, total,
    dayGan: GAN[dGan], dayGanH: GAN_H[dGan], dayElem: GAN_ELEM[dGan], dayYang: GAN_YANG(dGan),
    animal: JI_ANIMAL[yJi], animalSlug: JI_SLUG[yJi], yearJi: JI_H[yJi], yearElem: JI_ELEM[yJi],
    term: { name: cur.name, at: fmt(cur.jd), next: nxt.name, nextAt: fmt(nxt.jd) },
    ipchun: fmt(ipchun), border, yaja, daeun
  };
}
