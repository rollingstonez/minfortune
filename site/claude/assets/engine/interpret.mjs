// 사주(12지) × 타로(메이저 22) 결합 해석 생성기.
// 핵심: 카드에 배속한 오행과 띠(지지)의 오행 사이의 생극 관계로 해석의 성격이 결정된다.
// 같은 카드라도 띠가 다르면 관계가 달라지고, 같은 관계라도 띠·카드의 고유 어휘가 들어가
// 문장이 겹치지 않는다.

import { fill, josa } from './ko.mjs';

const GEN = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };   // 상생
const KEOK = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };  // 상극

export function relation(cardElem, zodElem) {
  if (cardElem === zodElem) return 'same';
  if (GEN[cardElem] === zodElem) return 'support';   // 카드 → 나를 생(生)
  if (GEN[zodElem] === cardElem) return 'drain';     // 나 → 카드를 생(설기)
  if (KEOK[cardElem] === zodElem) return 'pressure'; // 카드 → 나를 극
  if (KEOK[zodElem] === cardElem) return 'command';  // 나 → 카드를 극(쓴다)
  return 'same';
}

export const REL_LABEL = {
  support:  '상생 — 카드의 기운이 타고난 바탕을 밀어주는 배치',
  drain:    '설기 — 타고난 기운을 카드 쪽으로 내주는 배치',
  pressure: '상극 — 카드의 기운이 바탕을 누르는 배치',
  command:  '제압 — 타고난 기운으로 카드를 다룰 수 있는 배치',
  same:     '비화 — 같은 오행이 겹쳐 기운이 몰리는 배치'
};

export const REL_SHORT = {
  support: '밀어주는 자리', drain: '내주는 자리', pressure: '눌리는 자리',
  command: '다루는 자리', same: '몰리는 자리'
};

const pick = (arr, seed) => arr[seed % arr.length];

// ── 결합 해석 본문 ──────────────────────────────────────────────
const COMBINE = {
  support: [
    '{tko} 카드의 {te} 기운은 {zn}띠의 {ze}를 살려주는 쪽으로 들어옵니다. 평소 혼자 끌어올려야 했던 일이 이 시기에는 바깥에서 한 번 밀어주는 형태로 풀립니다. {zcore}이라는 타고난 성격이 이번에는 억누르지 않아도 되는 자리를 만납니다.',
    '{te}가 {ze}를 생(生)하는 배치입니다. 쉽게 말해 {tko}가 가리키는 흐름이 {zn}띠에게는 역풍이 아니라 등을 밀어주는 바람입니다. 그동안 미뤄둔 일을 꺼내도 좋은 시기이고, {zs1}이 제값을 받습니다.',
    '{zn}띠의 바탕은 {ze}인데 {tko}는 {te}로 그 {ze}를 키워주는 쪽에 섭니다. 내 식대로 해도 통하는 구간이라는 뜻입니다. 단, 밀어주는 기운에 올라타려면 먼저 한 발을 떼야 합니다 — {tkey}가 이 카드의 주제인 이유입니다.',
    '겹쳐 보면 상생 관계입니다. {tko}가 열어주는 문과 {zn}띠가 원래 가려던 방향이 어긋나지 않습니다. 이럴 때는 전략을 바꾸는 것보다 하던 것의 크기를 키우는 쪽이 정답입니다.'
  ],
  drain: [
    '{zn}띠의 {ze}가 {tko}의 {te}를 생(生)하는 배치입니다. 일은 되지만 내 기운을 꺼내 쓰는 방식으로 됩니다. 성과가 나는데도 유난히 피로한 시기라면 이 구조 때문입니다.',
    '내가 내주는 자리입니다. {tko}가 요구하는 {tkey}를 {zn}띠는 해낼 수 있지만, 해내는 값을 체력과 시간으로 냅니다. {zcore}인 사람일수록 이 구간에서 자기 몫을 먼저 떼어두어야 합니다.',
    '{zn}띠의 {ze}가 {tko}의 {te}로 빠져나가는 흐름입니다. 남을 돕고 판을 굴리는 데 쓰이는 시기라, 남는 것을 계산하지 않으면 끝에 허전함이 옵니다. {zc1}, 이것이 이 조합에서 가장 조심할 지점입니다.',
    '겹쳐 보면 설기 관계입니다. {tko}의 과제는 {zn}띠에게 어려운 일이 아니라 "많이 쓰는 일"입니다. 범위를 줄이고 기한을 정하면 같은 성과를 덜 지치고 가져올 수 있습니다.'
  ],
  pressure: [
    '{tko}의 {te}가 {zn}띠의 {ze}를 극(剋)하는 배치입니다. 이 시기에 생기는 압박은 내 실력 문제가 아니라 기운의 방향이 반대인 데서 옵니다. 정면으로 맞서면 소모가 크고, 방식을 바꾸면 빠르게 가라앉습니다.',
    '눌리는 자리입니다. {te}는 {ze}를 치는 기운이라, {tko}가 던지는 {tkey}라는 주제가 {zn}띠에게는 평소보다 두 배로 무겁게 느껑집니다. 다만 극(剋)은 깨뜨리는 힘이면서 모양을 잡는 힘이기도 합니다.',
    '겹쳐 보면 상극입니다. {zcore}으로 살아온 방식이 이번 국면에서는 그대로 통하지 않습니다. {zs1}을 잠시 접고, {tko}가 요구하는 순서를 먼저 따라가는 쪽이 손실이 적습니다.',
    '{tko}는 {zn}띠가 가장 불편해하는 종류의 과제를 들고 옵니다. {zc1} — 이 습관이 이 조합에서 비용으로 바뀝니다. 혼자 버티지 말고 중간에 한 번 점검받으십시오.'
  ],
  command: [
    '{zn}띠의 {ze}가 {tko}의 {te}를 극(剋)하는 배치입니다. 이 카드가 말하는 상황을 내가 다룰 수 있다는 뜻입니다. 끌려가는 자리가 아니라 손에 쥐고 쓰는 자리입니다.',
    '내가 다루는 자리입니다. {tko}는 보통 사람에게는 흔들리는 주제지만 {zn}띠에게는 도구에 가깝습니다. {zs1}이 그대로 무기가 되는 구간이니, 결정을 남에게 넘기지 마십시오.',
    '{zn}띠의 {ze}가 {tko}의 {te}를 제압하는 흐름입니다. 바꿔 말하면 {tkey}를 둘러싼 문제에서 주도권이 내 쪽에 있습니다. 다만 다룰 수 있다는 자신이 과하면 상대의 사정을 지나치게 됩니다.',
    '겹쳐 보면 제압 관계입니다. {zcore}이라는 바탕이 {tko}가 내는 과제와 정면으로 맞아떨어집니다. 이 조합에서는 미루는 것만이 손해입니다.'
  ],
  same: [
    '{tko}와 {zn}띠가 같은 {ze} 기운으로 겹칩니다. 같은 성질이 두 겹이 되면 장점도 두 배, 치우침도 두 배가 됩니다. 잘 되는 것은 더 잘 되고 평소 약한 쪽은 더 비어 보입니다.',
    '{zn}띠와 {tko}는 비화 관계입니다. {ze}가 {ze}를 만나 힘이 한쪽으로 몰립니다. {zs1}이 선명하게 드러나는 시기지만, {zc1} 역시 같이 커지니 균형을 잡아줄 사람 하나는 옆에 두어야 합니다.',
    '같은 오행이 겹친 자리입니다. {tko}가 말하는 {tkey}는 {zn}띠가 이미 익숙한 영역이라 속도가 빠릅니다. 문제는 브레이크입니다 — 멈출 지점을 미리 정해두십시오.',
    '{zcore}인 {zn}띠에게 같은 {ze} 기운의 {tko}가 겹쳤습니다. 이런 배치는 큰 성과와 큰 과속이 같은 길에 있습니다. 결정 하나를 하루 묵혀 보는 습관이 이 시기의 보험입니다.'
  ]
};

// ── 2026 병오년(丙午) 세운 ───────────────────────────────────────
const YEAR = { label: '2026 병오년(丙午)', elem: '火', ji: '午' };

function yearTie(z) {
  if (z.ji === YEAR.ji) return 'self';
  if (z.chung === YEAR.ji) return 'chung';
  if (z.yukhap === YEAR.ji) return 'yukhap';
  if (z.sanhap.includes(YEAR.ji)) return 'sanhap';
  return 'plain';
}

const YEAR_TXT = {
  self: '{y}은 {zn}띠 자신의 해입니다. 자기 지지와 세운이 겹치는 해는 기운이 가장 세게 올라오는 대신 과열이 쉽습니다. 벌릴 일은 올해 안에 벌리고, 몸은 올해 안에 한 번 점검하십시오.',
  chung: '{y}은 {zn}띠의 지지 {zj}와 정면으로 부딪히는 충(沖)의 해입니다. 자리·주거·직을 흔드는 변동이 들어올 수 있습니다. 충은 깨뜨리기도 하지만 묶여 있던 것을 끊어주기도 합니다 — 미리 정리할 것을 정해두면 흔들림이 기회로 바뀝니다.',
  yukhap: '{y}은 {zn}띠의 {zj}와 육합(六合)을 이루는 해입니다. 사람과 인연으로 길이 열리는 해라, 혼자 애쓰는 일보다 사람을 통해 들어오는 일이 더 멀리 갑니다.',
  sanhap: '{y}은 {zn}띠의 {zj}와 삼합(三合) 국을 이루는 해입니다. 힘을 합칠 상대가 들어오고 하던 일의 판이 커집니다. 올해의 결과는 혼자가 아니라 팀의 형태로 나옵니다.',
  plain: '{y}은 {zn}띠에게 큰 충도 합도 없는 해입니다. 외부 변수가 적다는 뜻이라, 올해의 성과는 내가 무엇을 쌓았는지에 거의 그대로 비례합니다.'
};

const YEAR_ELEM = {
  support: '올해의 {ye}는 {zn}띠의 {ze}를 밀어주는 기운입니다. 하던 일에 속도가 붙으니 범위를 조금 넓혀도 좋습니다.',
  drain: '올해의 {ye}는 {zn}띠의 {ze}를 꺼내 쓰는 기운입니다. 일은 늘어나는데 체력이 먼저 바닥납니다. 쉬는 시간을 일정에 미리 넣으십시오.',
  pressure: '올해의 {ye}는 {zn}띠의 {ze}를 누르는 기운입니다. 무리하게 맞서지 말고 방식을 바꾸는 쪽으로 가면 중간부터 풀립니다.',
  command: '올해의 {ye}는 {zn}띠가 다룰 수 있는 기운입니다. 주도권이 내 쪽이니 결정을 미루지 마십시오.',
  same: '올해의 {ye}는 {zn}띠의 {ze}와 같은 기운이라 힘이 한쪽으로 몰립니다. 과속만 조심하면 성과는 분명합니다.'
};

// ── 분야별 ──────────────────────────────────────────────────────
const DOMAIN_BRIDGE = {
  support: ['밀어주는 배치이니 ', '흐름이 맞는 해이니 ', '기운이 받쳐주니 '],
  drain: ['내주는 배치이니 ', '소모가 있는 해이니 ', '기운이 빠지는 구간이니 '],
  pressure: ['눌리는 배치이니 ', '압박이 있는 해이니 ', '방향이 어긋나는 구간이니 '],
  command: ['주도권이 내 쪽이니 ', '다룰 수 있는 배치이니 ', '쥐고 쓸 수 있는 해이니 '],
  same: ['기운이 몰리는 배치이니 ', '같은 성질이 겹치니 ', '힘이 한쪽으로 쏠리니 ']
};

export function interpret(z, t, zi, ci) {
  const rel = relation(t.elem, z.elem);
  const yRel = relation(YEAR.elem, z.elem);
  const tie = yearTie(z);
  const seed = zi * 7 + ci * 5;

  const slot = {
    zn: z.name, zj: z.ji, ze: z.elem, zcore: z.core,
    zs1: z.strength[seed % z.strength.length],
    zc1: z.caution[seed % z.caution.length],
    tko: t.ko, te: t.elem, tkey: t.keys[0],
    y: YEAR.label, ye: YEAR.elem
  };

  return {
    rel, relLabel: REL_LABEL[rel], relShort: REL_SHORT[rel],
    yearTie: tie,
    headline: `${z.name}띠 × ${t.ko} — ${REL_SHORT[rel]}`,
    summary: `${z.name}띠(${z.ji}·${z.elem})의 바탕에 ${t.ko} 카드(${t.elem})가 겹치면 ${REL_LABEL[rel]}가 됩니다. ${t.keys.join(' · ')}${josa(t.keys[t.keys.length - 1], '이')} 이 조합의 주제입니다.`,
    saju: `${z.temper} 태어난 시로는 ${z.hour}, 절기로는 ${z.season}(${z.month})에 해당하는 기운입니다. 음양으로는 ${z.yin === '陽' ? '양(陽)이라 밖으로 나가는 힘이 먼저' : '음(陰)이라 안으로 모으는 힘이 먼저'} 섭니다.`,
    tarot: `${t.flow} 이 카드가 정방향으로 들어오면 ${t.advice} 뒤집혀 들어오면 ${t.warn}`,
    combine: fill(pick(COMBINE[rel], seed), slot),
    year: fill(YEAR_TXT[tie], slot) + ' ' + fill(YEAR_ELEM[yRel], slot),
    work: fill(pick(DOMAIN_BRIDGE[rel], seed), slot) + `일 쪽은 이렇습니다. ${z.work} 카드 쪽에서는 ${t.work}`,
    love: fill(pick(DOMAIN_BRIDGE[rel], seed + 1), slot) + `관계 쪽은 이렇습니다. ${z.love} 카드 쪽에서는 ${t.love}`,
    money: fill(pick(DOMAIN_BRIDGE[rel], seed + 2), slot) + `돈 쪽은 이렇습니다. ${z.money} 카드 쪽에서는 ${t.money}`,
    action: `${t.action} ${z.name}띠에게 이 숙제가 특히 중요한 이유는 ${slot.zc1}이 이 조합에서 가장 먼저 비용으로 돌아오기 때문입니다.`,
    keys: [...t.keys, z.core]
  };
}

export { YEAR };
