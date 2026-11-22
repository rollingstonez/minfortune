// 단계별 리딩 — 사주의 세 자리(년지·일간·월지)에 카드 세 장을 각각 교차시킵니다.
// 민원장이 사주 위에 타로를 올려 읽는 방식을 세 겹으로 나눈 것입니다.
import { relation, REL_LABEL, REL_SHORT } from './interpret.mjs';
import { fill, josa } from './ko.mjs';

export const SLOTS = [
  { key: 'root',  title: '타고난 바탕', anchor: '년지(띠)',
    lead: '태어난 해의 지지 — 바꿀 수 없는 밑돌입니다. 여기에 겹친 카드는 내가 원래 어떤 재료로 만들어졌는지를 말합니다.' },
  { key: 'self',  title: '지금의 나', anchor: '일간',
    lead: '사주 여덟 글자 가운데 나 자신을 가리키는 한 글자. 여기에 겹친 카드는 지금 내가 쓰고 있는 힘을 말합니다.' },
  { key: 'field', title: '들어오는 자리', anchor: '월지',
    lead: '태어난 달의 지지 — 내가 선 환경과 계절입니다. 여기에 겹친 카드는 밖에서 들어오는 흐름을 말합니다.' }
];

const TXT = {
  root: {
    support: '{tko}의 {te}가 {an}의 {ae}를 살려줍니다. 타고난 성질을 억누르지 않고 그대로 써도 되는 배치입니다. 어릴 때부터 "원래 그런 사람"이라는 말을 들었다면 그 말이 맞습니다 — 바꾸려 애쓴 쪽이 손해였습니다.',
    drain: '{an}의 {ae}가 {tko}의 {te} 쪽으로 빠져나갑니다. 타고난 것을 꺼내 쓰며 살아온 자리라, 성과는 있는데 늘 무언가 소진된 느낌이 남습니다. 내 밑돌을 남의 집 짓는 데 쓰지 않았는지 한 번 봐야 합니다.',
    pressure: '{tko}의 {te}가 {an}의 {ae}를 칩니다. 타고난 결과 반대 방향의 요구를 일찍부터 받아온 배치입니다. 그 압력이 성격을 깎아 모양을 만들었지만, 깎인 자리에 아직 통증이 남아 있습니다.',
    command: '{an}의 {ae}가 {tko}의 {te}를 누릅니다. 이 카드가 말하는 주제를 타고난 힘으로 다룰 수 있다는 뜻입니다. 남들이 어려워하는 자리에서 유독 담담했다면 이 배치 때문입니다.',
    same: '{tko}와 {an}이 같은 {ae}로 겹칩니다. 타고난 성질이 두 겹으로 진해진 자리입니다. 장점이 또렷한 만큼 치우침도 또렷해서, 평생 같은 종류의 실수를 반복하기 쉽습니다.'
  },
  self: {
    support: '일간 {an}({ae})에 {tko}의 {te}가 들어와 나를 생(生)합니다. 지금 쓰는 힘이 바깥에서 보충받고 있다는 뜻입니다. 지금은 아끼는 때가 아니라 쓰는 때입니다.',
    drain: '일간 {an}({ae})이 {tko}의 {te}로 기운을 내보냅니다. 재능은 나가는데 들어오는 것이 적은 구간입니다. 내보낸 만큼 값을 받고 있는지 숫자로 한 번 확인하십시오.',
    pressure: '{tko}의 {te}가 일간 {an}({ae})을 극(剋)합니다. 지금 나를 누르는 일이 있다면 그것이 이 카드의 주제입니다. 버티는 것으로는 안 끝나고 방식을 바꿔야 끝납니다.',
    command: '일간 {an}({ae})이 {tko}의 {te}를 극(剋)합니다. 이 카드의 상황은 내가 쥐고 흔들 수 있는 쪽입니다. 결정권이 나한테 있는데 남에게 물어보고 있지는 않습니까.',
    same: '일간 {an}과 {tko}가 같은 {ae}입니다. 내 색이 그대로 두 번 칠해진 상태라 자기 확신이 가장 셀 때입니다. 확신이 센 만큼 반대 의견이 안 들리는 때이기도 합니다.'
  },
  field: {
    support: '월지 {an}({ae})에 {tko}의 {te}가 생(生)으로 들어옵니다. 환경이 나를 돕는 쪽으로 움직입니다. 사람·자리·기회가 밖에서 먼저 옵니다.',
    drain: '월지 {an}({ae})이 {tko}의 {te}로 빠집니다. 환경이 나에게 요구하는 것이 많은 구간입니다. 맡은 것을 줄이지 않으면 올해의 결과가 흩어집니다.',
    pressure: '{tko}의 {te}가 월지 {an}({ae})을 칩니다. 바깥 조건이 불리하게 움직입니다. 다만 이런 자리는 버티고 난 뒤에 평판이 올라가는 자리이기도 합니다.',
    command: '월지 {an}({ae})이 {tko}의 {te}를 다룹니다. 환경을 내 쪽으로 끌어올 수 있는 구간입니다. 먼저 제안하는 쪽이 조건을 정합니다.',
    same: '월지 {an}과 {tko}가 같은 {ae}로 겹칩니다. 내가 선 자리와 들어오는 흐름이 같은 성질이라 속도가 붙습니다. 브레이크를 미리 정해두십시오.'
  }
};

/** 한 자리의 교차 결과 */
export function cross(slot, anchorName, anchorElem, card) {
  const rel = relation(card.elem, anchorElem);
  return {
    slot, rel, relLabel: REL_LABEL[rel], relShort: REL_SHORT[rel],
    anchorName, anchorElem, card,
    text: fill(TXT[slot.key][rel], { an: anchorName, ae: anchorElem, tko: card.ko, te: card.elem }),
    advice: card.advice, action: card.action
  };
}

const TONE = {
  '3-0': '세 자리가 모두 나를 돕거나 내가 다루는 쪽입니다. 지금은 묻고 재는 시간을 줄이고 실행으로 옮길 때입니다. 이런 배치는 길게 가지 않으니 미루는 것이 가장 큰 손해입니다.',
  '2-0': '세 자리 중 둘이 나를 돕습니다. 전체 흐름은 내 편이고, 남은 한 자리만 관리하면 되는 국면입니다.',
  '1-1': '돕는 자리와 누르는 자리가 섞여 있습니다. 한쪽으로 몰아붙이면 반대쪽에서 값을 치릅니다. 올해는 속도보다 배분이 성패를 가릅니다.',
  '0-2': '세 자리 중 둘이 나를 누르거나 기운을 꺼내 씁니다. 지금 힘든 것은 능력 문제가 아니라 배치 문제입니다. 버티는 대신 방식을 바꾸는 쪽으로 가야 합니다.',
  '0-3': '세 자리가 모두 나를 누르거나 소모시키는 쪽입니다. 이런 해에는 새로 벌이지 않고 지키는 것이 성과입니다. 끊어낼 것 하나를 정하는 데서 시작하십시오.',
  'mix': '돕는 자리와 누르는 자리가 균형을 이룹니다. 어느 한쪽으로 결론 내기 어려운 해라, 결정을 작게 나눠 시험하면서 가는 편이 안전합니다.'
};

/** 세 장의 종합 */
export function conclude(crosses, m) {
  const plus = crosses.filter(c => c.rel === 'support' || c.rel === 'command').length;
  const minus = crosses.filter(c => c.rel === 'pressure' || c.rel === 'drain').length;
  const key = `${plus}-${minus}`;
  const tone = TONE[key] || TONE.mix;

  const dom = Object.entries(m.dist).sort((a, b) => b[1] - a[1])[0];
  const lack = Object.entries(m.dist).filter(([, v]) => v === 0).map(([k]) => k);

  const balance = lack.length
    ? `사주 여덟 글자에 ${lack.join('·')}${josa(lack[lack.length - 1], '이')} 없습니다. 없는 오행은 평생 갈증으로 남는 자리라, ${lack[0]}에 해당하는 일·사람·환경을 일부러 가까이 두는 것이 보완이 됩니다. 가장 많은 것은 ${dom[0]}(${dom[1]}자)로, 이쪽은 넘쳐서 생기는 문제를 조심해야 합니다.`
    : `사주 여덟 글자에 다섯 오행이 모두 들어 있습니다. 한쪽으로 쏠려 무너지는 일은 적지만, 결정이 늦어지는 쪽이 약점입니다. 가장 많은 것은 ${dom[0]}(${dom[1]}자)입니다.`;

  return { plus, minus, tone, balance, dom: dom[0], lack };
}

export { relation, REL_LABEL, REL_SHORT };
