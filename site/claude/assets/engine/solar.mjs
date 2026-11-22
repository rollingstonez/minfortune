// 태양황경 기반 절기 계산 (Meeus, Astronomical Algorithms 25장).
// 사주의 연주·월주 경계는 절기(節)로 갈리므로 여기서 절입 시각을 구합니다.
const RAD = Math.PI / 180;

// 그레고리력 날짜 → 율리우스일(UT)
export function toJD(y, m, d, h = 0, mi = 0, s = 0) {
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1))
    + d + B - 1524.5 + (h + mi / 60 + s / 3600) / 24;
}

export function fromJD(jd) {
  const z = Math.floor(jd + 0.5), f = jd + 0.5 - z;
  let A = z;
  if (z >= 2299161) { const a = Math.floor((z - 1867216.25) / 36524.25); A = z + 1 + a - Math.floor(a / 4); }
  const B = A + 1524, C = Math.floor((B - 122.1) / 365.25),
        D = Math.floor(365.25 * C), E = Math.floor((B - D) / 30.6001);
  const day = B - D - Math.floor(30.6001 * E) + f;
  const m = E < 14 ? E - 1 : E - 13, y = m > 2 ? C - 4716 : C - 4715;
  const di = Math.floor(day), hf = (day - di) * 24;
  const h = Math.floor(hf), mif = (hf - h) * 60, mi = Math.floor(mif);
  return { y, m, d: di, h, mi, s: Math.round((mif - mi) * 60) };
}

// 지구 자전 지연 ΔT (Espenak–Meeus 근사). UT ↔ TD 변환용.
function deltaT(y) {
  const t = y - 2000;
  if (y >= 2005 && y < 2050) return 62.92 + 0.32217 * t + 0.005589 * t * t;
  if (y >= 1986 && y < 2005) return 63.86 + 0.3345 * t - 0.060374 * t * t
    + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5;
  if (y >= 1961 && y < 1986) { const u = (y - 1975) / 1; return 45.45 + 1.067 * u - u * u / 260 - u ** 3 / 718; }
  if (y >= 1941 && y < 1961) { const u = y - 1950; return 29.07 + 0.407 * u - u * u / 233 + u ** 3 / 2547; }
  if (y >= 1920 && y < 1941) { const u = y - 1920; return 21.20 + 0.84493 * u - 0.076100 * u * u + 0.0020936 * u ** 3; }
  if (y >= 1900 && y < 1920) { const u = y - 1900; return -2.79 + 1.494119 * u - 0.0598939 * u * u + 0.0061966 * u ** 3 - 0.000197 * u ** 4; }
  if (y >= 2050) return 62.92 + 0.32217 * t + 0.005589 * t * t;
  return 0;
}

// 겉보기 태양황경(도). jdTD = 역학시 기준 율리우스일
export function sunLongitude(jdTD) {
  const T = (jdTD - 2451545) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mr = M * RAD;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr)
          + 0.000289 * Math.sin(3 * Mr);
  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const app = trueLong - 0.00569 - 0.00478 * Math.sin(omega * RAD);
  return ((app % 360) + 360) % 360;
}

// 황경이 target(도)이 되는 시각을 구해 KST(UT+9) 율리우스일로 돌려줍니다.
export function termJD_KST(year, target) {
  // 대략적인 출발점: 춘분(0°)을 3월 20일로 보고 하루 0.9856°
  let jd = toJD(year, 1, 1) + ((target + 45) % 360) * 365.2422 / 360;
  for (let i = 0; i < 12; i++) {
    const dt = deltaT(year) / 86400;
    let diff = sunLongitude(jd + dt) - target;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    jd -= diff / 0.9856473;              // 1일당 황경 변화량으로 보정
    if (Math.abs(diff) < 1e-7) break;
  }
  return jd + 9 / 24;                     // KST
}

// 사주 월지를 가르는 12절(節)의 황경
export const JEOL = [
  ['입춘', 315], ['경칩', 345], ['청명', 15], ['입하', 45], ['망종', 75], ['소서', 105],
  ['입추', 135], ['백로', 165], ['한로', 195], ['입동', 225], ['대설', 255], ['소한', 285]
];
