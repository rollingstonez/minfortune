/*
 * MVP reading engine. This version generates a personalized, rule-based reading
 * entirely in the visitor's browser. To use a language model later, add a
 * same-origin backend endpoint and replace generateReading() with a POST to it.
 * Never put a provider API key in this public JavaScript file.
 */
const topicCopy = {
  love: { label: '연애·관계', element: '관계의 온도를 살피는 때입니다', prompt: '상대의 마음을 단정하기보다, 내가 관계 안에서 편안하게 말하고 있는지 먼저 돌아보세요. 솔직하지만 부드러운 한마디가 오래 쌓인 오해를 풀 실마리가 될 수 있습니다.', action: '이번 주에는 답을 재촉하기보다 내 마음을 한 문장으로 정리해 전해 보세요.' },
  work: { label: '일·진로', element: '방향보다 리듬을 정돈할 때입니다', prompt: '새로운 가능성이 보여도 한 번에 모든 것을 바꾸기보다, 지금 가진 경험 중 다음 단계에 가져갈 것을 먼저 가려내면 좋겠습니다. 작은 시험과 준비가 확신을 키웁니다.', action: '미뤄 둔 일 하나를 끝내고, 다음 선택의 기준을 세 가지 적어 보세요.' },
  money: { label: '재물·사업', element: '확장보다 흐름을 점검할 때입니다', prompt: '재물의 흐름은 큰 결심만큼 작은 습관의 영향을 받습니다. 들어오는 기회에 마음이 급해질수록 조건과 지속 가능성을 차분히 확인하는 것이 도움이 됩니다.', action: '이번 달의 고정 지출과 가장 기대하는 수입을 한 번에 볼 수 있게 적어 보세요.' },
  self: { label: '나의 흐름', element: '내 안의 속도를 다시 맞출 때입니다', prompt: '주변의 속도에 자신을 맞추느라 놓친 감각이 있는지 살펴보세요. 지금은 결과를 서두르기보다 무엇이 나를 지치게 하고 무엇이 힘을 돌려주는지 알아차리는 일이 먼저입니다.', action: '하루 중 마음이 편안했던 순간 하나와 부담스러웠던 순간 하나를 기록해 보세요.' }
};
const cardDeck = [
  {name:'별 · The Star',symbol:'✧',caption:'희망을 회복하고 긴 호흡으로 바라보는 카드',insight:'별 카드는 당장 모든 답을 얻기보다, 마음이 다시 맑아지는 과정을 이야기합니다. 조용히 이어온 노력이 제자리를 찾아가고 있으니 스스로를 재촉하지 않아도 좋습니다.'},
  {name:'절제 · Temperance',symbol:'☯',caption:'서로 다른 흐름을 조율하는 카드',insight:'절제 카드는 한쪽으로 치우친 마음을 가운데로 되돌리는 힘을 상징합니다. 서두른 결론보다 균형 잡힌 대화와 꾸준한 조정이 원하는 방향에 가까워지게 합니다.'},
  {name:'여황제 · The Empress',symbol:'❀',caption:'돌봄과 결실의 기운을 품은 카드',insight:'여황제 카드는 이미 가진 것을 돌보고 자라게 하는 지혜를 비춥니다. 부족한 것을 더 채우기 전에 지금 곁에 있는 관계와 자원을 살펴보면 예상 밖의 가능성이 보일 수 있습니다.'},
  {name:'은둔자 · The Hermit',symbol:'☾',caption:'내면의 목소리를 듣는 카드',insight:'은둔자 카드는 잠시 소음을 걷어내고 내 기준을 확인하는 시간을 뜻합니다. 혼자 생각할 여백을 마련하면 남의 기대와 자신의 바람이 조금씩 구분될 것입니다.'},
  {name:'힘 · Strength',symbol:'♧',caption:'부드러운 용기와 자기 신뢰의 카드',insight:'힘 카드는 거센 의지보다 감정을 다루는 부드러운 용기를 상징합니다. 이미 견뎌 온 경험 안에 쓸 수 있는 지혜가 있으니, 자신을 몰아붙이지 않고 한 걸음씩 나아가 보세요.'},
  {name:'운명의 수레바퀴 · Wheel of Fortune',symbol:'◎',caption:'변화의 주기를 바라보는 카드',insight:'수레바퀴는 모든 흐름에 오르내림과 전환점이 있음을 보여줍니다. 바뀌는 상황을 붙잡기보다 지금 움직일 수 있는 부분에 집중하면 다음 기회를 알아보기가 쉬워집니다.'},
  {name:'정의 · Justice',symbol:'⚖',caption:'균형과 분명한 기준을 세우는 카드',insight:'정의 카드는 감정과 현실을 함께 놓고 공정하게 바라보라는 메시지를 줍니다. 사실과 바람을 구분하고 자신의 기준을 말로 정리할수록 선택 뒤의 마음도 편안해집니다.'},
  {name:'태양 · The Sun',symbol:'☼',caption:'분명함과 생기를 되찾는 카드',insight:'태양 카드는 감춰 둔 가능성이 밝은 곳으로 나오는 흐름을 담고 있습니다. 작은 성취도 기꺼이 인정하고 주변과 나누면 자신감과 활력이 함께 자라날 수 있습니다.'}
];
const el = (id) => document.getElementById(id);
const form = el('reading-form');
const question = form.elements.question;
question.addEventListener('input', () => { el('char-count').textContent = `${question.value.length} / 300`; });
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const birthDate = String(data.get('birthDate'));
  if (!birthDate) return;
  const reading = generateReading({birthDate, birthTime: String(data.get('birthTime')), topic: String(data.get('topic')), question: String(data.get('question') || '').trim()});
  renderReading(reading, birthDate);
});
function generateReading({birthDate, birthTime, topic, question}) {
  const date = new Date(`${birthDate}T12:00:00`);
  const seed = [...birthDate.replaceAll('-', ''), ...topic].reduce((sum, char) => sum + char.charCodeAt(0), birthTime === 'unknown' ? 0 : birthTime.length * 13);
  const card = cardDeck[seed % cardDeck.length];
  const focus = topicCopy[topic] || topicCopy.self;
  const yearStem = ['갑목','을목','병화','정화','무토','기토','경금','신금','임수','계수'][((date.getFullYear() - 4) % 10 + 10) % 10];
  const monthTone = ['새로운 순환','정돈과 재배치','관계의 확장','기초를 다지는 흐름'][((date.getMonth() + 1) * 3 + date.getDate()) % 4];
  const day = date.getDate();
  const timeNote = birthTime === 'unknown' ? '태어난 시간을 알 수 없어 세밀한 시주를 제외한 가벼운 참고 해설로 구성했습니다.' : '태어난 시간대도 참고해 일상의 리듬과 선택을 함께 살펴보았습니다.';
  const questionLine = question ? `“${question}”라는 질문에는, 우선 지금 확인할 수 있는 사실과 마음속 기대를 나누어 보는 것이 좋겠습니다.` : `아직 구체적인 질문을 적지 않으셨으니, ${focus.label}의 전반적인 흐름을 중심으로 읽었습니다.`;
  return {card, focus, yearStem, monthTone, timeNote, questionLine, day};
}
function renderReading(r, birthDate) {
  const formatted = new Intl.DateTimeFormat('ko-KR', {year:'numeric',month:'long',day:'numeric'}).format(new Date(`${birthDate}T12:00:00`));
  el('result-title').textContent = `${r.focus.label} 해설`;
  el('result-date').textContent = `${formatted} 기준 · 자동 생성 풀이`;
  el('result-symbol').textContent = r.card.symbol;
  el('card-name').textContent = r.card.name;
  el('card-caption').textContent = r.card.caption;
  const sections = [
    ['사주에서 살펴본 흐름', `태어난 해의 기운을 상징적으로 보면 ${r.yearStem}의 성향이 바탕에 놓입니다. 여기에 현재의 ${r.monthTone}이 겹치며, 지금은 자신의 장점을 어떻게 쓰고 있는지 돌아볼 만한 시기입니다. ${r.timeNote}`],
    ['타로가 비추는 마음', r.card.insight],
    ['지금 궁금한 이야기', `${r.questionLine} ${r.focus.prompt}`]
  ];
  const container = el('reading-content');
  container.replaceChildren(...sections.map(([title, body]) => { const section = document.createElement('section'); const h = document.createElement('h3'); h.textContent = title; const p = document.createElement('p'); p.textContent = body; section.append(h, p); return section; }));
  const advice = document.createElement('div'); advice.className = 'advice'; const h = document.createElement('h3'); h.textContent = '오늘의 작은 실천'; const p = document.createElement('p'); p.textContent = r.focus.action; advice.append(h,p); container.append(advice);
  el('form-card').classList.add('hidden'); el('result-card').classList.remove('hidden'); el('result-card').scrollIntoView({behavior:'smooth',block:'start'});
  history.replaceState(null, '', `#reading`);
}
el('reset-button').addEventListener('click', () => { el('result-card').classList.add('hidden'); el('form-card').classList.remove('hidden'); form.reset(); el('char-count').textContent = '0 / 300'; el('reading').scrollIntoView({behavior:'smooth'}); });
el('share-button').addEventListener('click', async () => { try { await navigator.clipboard.writeText(location.href); el('share-button').innerHTML = '링크를 복사했습니다 <span>✓</span>'; setTimeout(() => el('share-button').innerHTML = '해설 링크 복사 <span>↗</span>', 1800); } catch { el('share-button').textContent = '브라우저 주소창에서 링크를 복사해 주세요'; } });
