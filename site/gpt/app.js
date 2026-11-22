/*
 * 온라인 사전 풀이 엔진
 * 입력은 브라우저 안에서만 처리합니다. 실제 사주팔자 전체 명식이나 절기·대운을
 * 계산하는 역법 엔진이 아니므로, 결과는 출생 연도 상징과 질문을 중심으로 읽습니다.
 */
const stems = [
  {name:'갑목', element:'큰 나무', strength:'방향을 정하면 쉽게 꺾이지 않고, 주변까지 함께 키우려는 힘', edge:'책임을 혼자 떠안거나 결과가 늦을 때 자신을 몰아붙이는 모습'},
  {name:'을목', element:'풀과 덩굴', strength:'상황을 세심하게 읽고 관계와 환경에 맞춰 길을 찾아가는 힘', edge:'상대의 반응을 오래 살피느라 자기 바람을 뒤로 미루는 모습'},
  {name:'병화', element:'햇빛', strength:'분위기를 밝히고 먼저 움직여 막힌 흐름을 열어 주는 힘', edge:'주변을 챙기느라 정작 자신의 피로와 서운함을 늦게 알아차리는 모습'},
  {name:'정화', element:'등불', strength:'작은 신호와 사람의 마음을 잘 알아보고 꾸준히 온기를 나누는 힘', edge:'마음이 상해도 괜찮은 척하며 혼자 오래 생각하는 모습'},
  {name:'무토', element:'산과 들', strength:'급한 상황에서도 중심을 잡고 오래 갈 수 있는 기반을 만드는 힘', edge:'이미 끝난 일까지 책임지며 변화의 시기를 늦추는 모습'},
  {name:'기토', element:'밭과 흙', strength:'흩어진 문제를 정리해 현실적인 방법으로 바꾸는 힘', edge:'모두에게 무리가 없는 답을 찾느라 결정을 미루는 모습'},
  {name:'경금', element:'단단한 쇠', strength:'핵심을 가려내고 불필요한 것을 정리하는 결단력', edge:'마음을 다치지 않으려 기준을 너무 단단히 세우는 모습'},
  {name:'신금', element:'세공한 금속', strength:'완성도와 약속을 중요하게 여기며 작은 차이를 알아보는 감각', edge:'스스로에게 높은 기준을 적용해 충분히 잘한 일도 부족하게 보는 모습'},
  {name:'임수', element:'큰 물', strength:'넓은 시야로 여러 가능성을 보고 변화에 맞춰 길을 찾는 힘', edge:'선택지를 오래 열어 둔 채 마음의 에너지를 분산시키는 모습'},
  {name:'계수', element:'이슬과 샘물', strength:'조용히 관찰하고 필요한 순간 정확한 감각으로 대응하는 힘', edge:'걱정을 안으로 삼키고 확신이 생길 때까지 혼자 버티는 모습'}
];
const branches = [
  {animal:'쥐', trait:'상황의 변화를 빠르게 알아차리고 먼저 준비하는 감각'}, {animal:'소', trait:'시간을 들여 결과를 쌓고 약속을 지키는 끈기'},
  {animal:'호랑이', trait:'필요한 순간 주도권을 잡고 시작하는 용기'}, {animal:'토끼', trait:'사람 사이의 분위기를 살피고 충돌을 부드럽게 푸는 감각'},
  {animal:'용', trait:'큰 그림을 세우고 여러 사람을 움직이는 추진력'}, {animal:'뱀', trait:'한 번 더 생각해 핵심과 허점을 찾아내는 통찰'},
  {animal:'말', trait:'답답한 상황을 오래 끌지 않고 움직여 바꾸는 활력'}, {animal:'양', trait:'함께하는 사람의 필요를 알아보고 관계를 보살피는 힘'},
  {animal:'원숭이', trait:'새로운 방법을 빠르게 익혀 문제를 풀어내는 재치'}, {animal:'닭', trait:'흐트러진 기준을 세우고 끝까지 완성하는 꼼꼼함'},
  {animal:'개', trait:'믿음을 지키고 중요한 사람을 오래 지켜 주는 의리'}, {animal:'돼지', trait:'넉넉한 시선으로 기회를 품고 삶의 여유를 만드는 힘'}
];
const topics = {
  love: {
    label:'연애·관계', contextLabel:'관계의 단계',
    contexts:['마음 가는 사람과 관계를 시작하기 전','연애 중 서로의 마음을 맞추는 중','이별·재회 사이에서 고민 중','결혼이나 장기적인 관계를 생각 중'],
    opening:'관계에서 중요한 것은 상대의 마음을 추측하는 일만이 아니라, 그 관계 안에서 내가 어떤 사람이 되어 가는지를 살피는 일입니다.',
    read:['마음이 가는 사람과 관계를 시작하기 전','연애 중 서로의 마음을 맞추는 중','이별·재회 사이에서 고민 중','결혼이나 장기적인 관계를 생각 중'],
    passages:[
      '처음의 설렘과 상대의 반응을 함께 살피되, 호감이 곧 약속이라고 서두르지 않는 편이 좋습니다. 당신에게 필요한 것은 마음을 감추는 기술보다 편안한 대화가 가능한 사람인지 확인하는 시간입니다. 먼저 작은 제안을 건네고, 상대가 말과 행동으로 호응하는지 보세요.',
      '관계를 지키려는 마음이 클수록 서운함을 미뤄 두기 쉽습니다. 쌓인 감정을 한 번에 꺼내기보다 반복되는 장면 하나를 골라 “그때 나는 이렇게 느꼈고, 다음에는 이렇게 해주면 좋겠어”라고 전해 보세요. 서로의 차이를 고칠 문제로만 보지 않을 때 관계의 온도가 돌아옵니다.',
      '그리움과 다시 잘될 가능성은 같은 질문이 아닙니다. 연락이 오는지 기다리는 동안에도, 관계가 끝난 이유와 바뀐 점이 실제 행동으로 확인되는지를 살펴야 합니다. 다시 만남을 선택하더라도 이전의 약속을 그대로 되풀이하지 않도록 경계와 기대를 구체적으로 말하는 것이 중요합니다.',
      '좋은 궁합은 모든 면이 저절로 맞는다는 뜻보다, 다른 점을 함께 조율할 수 있다는 뜻에 가깝습니다. 돈과 생활 리듬, 가족과의 경계, 갈등 뒤 화해 방식처럼 현실적인 주제를 피하지 않고 이야기해 보세요. 중요한 결정은 압박이나 불안이 아니라 충분한 대화와 합의 위에서 내리는 편이 안정적입니다.'
    ],
    signs:['상대의 말보다 반복되는 행동을 확인하기','서운함을 시험이나 침묵으로 표현하지 않기','내가 편안하게 거절할 수 있는 관계인지 살펴보기'],
    questionPrompts:['이 관계에서 내가 가장 바라는 것은 무엇인가요?','상대가 실제로 보여 준 행동은 내 기대와 어떻게 다른가요?','다음 대화에서 꼭 전하고 싶은 한 문장은 무엇인가요?'],
    action:'상대의 답을 재촉하기 전에, 내가 원하는 관계의 모습을 세 문장으로 적어 보세요. 그중 지금 말할 수 있는 한 문장만 차분하게 전해도 충분합니다.'
  },
  work: {
    label:'일·진로', contextLabel:'현재의 상황',
    contexts:['이직·전직을 고민 중','현 직장에서 관계나 평가가 고민','창업·사업의 방향을 고민 중','진로·적성을 다시 찾는 중'],
    opening:'일의 방향을 고민할 때는 “어디로 가야 하나”와 함께 “어떤 환경에서 내 힘이 잘 쓰이나”를 물어야 선택이 선명해집니다.',
    passages:[
      '떠나고 싶은 이유와 옮기고 싶은 이유를 분리해 보세요. 현재의 피로를 벗어나는 선택도 필요할 수 있지만, 다음 자리에서 바라는 조건을 구체화해야 같은 문제가 반복되지 않습니다. 수입, 역할, 조직문화, 통근이나 생활 리듬 중 양보할 수 없는 세 가지를 적고 그 기준으로 기회를 비교하세요.',
      '업무 능력만큼 역할과 기대를 분명히 하는 것이 중요해 보입니다. 인정받고 싶은 마음을 알아서 알아주길 기다리기보다, 해낸 일과 다음 목표를 짧게 정리해 상사나 동료와 확인해 보세요. 막연한 평가에 흔들릴수록 사실·추측·바람을 나누어 기록하면 내 몫과 상대의 몫이 구분됩니다.',
      '사업은 아이디어보다 반복 가능한 수요와 현금 흐름이 오래 버티게 합니다. 큰 비용을 먼저 투입하기보다 작은 고객군으로 검증하고, 월 고정비와 손익분기 시점을 숫자로 확인하세요. 함께하는 사람이 있다면 역할, 의사결정권, 비용 부담을 말로만 두지 말고 문서로 맞추는 편이 안전합니다.',
      '적성을 한 번에 찾아야 한다는 부담을 내려놓고, 에너지가 살아나는 과업과 소진되는 환경을 나누어 보세요. 경험 속에서 반복해 칭찬받은 일, 시간 가는 줄 모르고 몰입한 일, 끝난 뒤 유독 지친 일을 각각 적으면 다음 탐색의 실마리가 됩니다. 작은 프로젝트나 수업으로 먼저 시험해 보는 것도 좋습니다.'
    ],
    signs:['결정의 이유가 회피인지 성장인지 구분하기','말로 들은 기회는 조건과 역할을 다시 확인하기','이번 주 안에 검증 가능한 작은 시도를 정하기'],
    questionPrompts:['내가 이 일을 계속하는 가장 현실적인 이유는 무엇인가요?','다음 자리에서 절대 놓치고 싶지 않은 조건은 무엇인가요?','큰 결정을 하기 전에 작게 시험할 수 있는 방법은 무엇인가요?'],
    action:'이번 주에는 미뤄 둔 업무 하나를 끝내고, 다음 선택의 기준 세 가지를 적어 보세요. 기준이 생기면 기회가 왔을 때 마음이 덜 흔들립니다.'
  },
  money: {
    label:'재물·사업', contextLabel:'가장 가까운 고민',
    contexts:['수입이 들쑥날쑥해 안정이 필요','투자·큰 지출을 앞두고 있음','사업의 매출과 방향을 고민 중','저축·대출·지출을 정리하고 싶음'],
    opening:'재물의 흐름은 운만으로 설명되지 않습니다. 들어오는 돈과 나가는 돈, 그리고 불안할 때 내리는 결정 습관을 함께 보는 것이 현실적인 시작입니다.',
    passages:[
      '수입이 불규칙할수록 한 달의 평균보다 가장 적게 들어오는 달을 기준으로 생활비를 설계하는 편이 마음을 지켜 줍니다. 당장 수입을 크게 늘리는 방법만 찾기보다 반복 계약이나 고정 고객처럼 예측 가능한 기반을 하나 만드는 데 집중해 보세요. 급한 마음에 불리한 조건을 받아들이지 않도록 최소 기준도 정해 두세요.',
      '큰 지출이나 투자를 앞두면 기대 수익뿐 아니라 손실을 감당할 범위와 돈이 묶이는 기간을 먼저 확인해야 합니다. 주변의 성공담이나 조급함이 판단을 대신하지 않도록, 최악의 경우에도 생활비와 비상금이 유지되는지 계산해 보세요. 조건이 복잡하거나 이해되지 않는 상품은 결정 시점을 늦추는 편이 낫습니다.',
      '매출의 크기만으로 사업의 건강성을 판단하기 어렵습니다. 실제로 남는 금액, 재구매율, 고객을 데려오는 비용, 대표가 투입하는 시간을 함께 살펴보세요. 반응이 좋은 한 가지 상품이나 고객군을 더 깊이 파고, 고정비가 늘어나는 확장은 수요가 확인된 다음으로 미루는 것이 안정적입니다.',
      '돈을 모으는 데 의지보다 구조가 도움됩니다. 수입이 들어온 날 저축·고정비·생활비를 나누고, 대출이 있다면 금리와 만기 순으로 목록을 만들어 보세요. 작은 누수를 알아차리는 것만으로도 통제감이 돌아옵니다. 자신을 탓하기보다 유지할 수 있는 자동화 한 가지부터 시작해 보세요.'
    ],
    signs:['결정 전에 최악의 손실 범위를 숫자로 적기','매출보다 실제로 남는 돈과 고정비를 보기','불안한 날 큰 금액을 바로 움직이지 않기'],
    questionPrompts:['지금 이 결정을 미루면 실제로 잃는 것은 무엇인가요?','최악의 경우에도 지켜야 할 생활 기반은 얼마인가요?','이번 달에 줄이거나 늘릴 수 있는 반복 지출은 무엇인가요?'],
    action:'이번 달 고정 지출, 기대 수입, 비상금을 한 장에 적어 보세요. 돈의 흐름이 눈에 보이면 걱정이 계획으로 바뀔 수 있습니다.'
  },
  self: {
    label:'나의 흐름', contextLabel:'요즘 가장 가까운 상태',
    contexts:['큰 선택 앞에서 망설이는 중','비슷한 관계·상황이 반복되는 중','지치고 의욕이 떨어진 상태','새로운 출발을 준비하는 중'],
    opening:'지금 필요한 것은 더 세게 버티는 일이 아니라, 내가 어느 지점에서 힘을 잃고 어느 순간 다시 살아나는지 정확히 알아차리는 일일 수 있습니다.',
    passages:[
      '결정이 어렵다는 것은 의지가 약해서가 아니라 포기해야 할 것이 각각 소중하기 때문일 수 있습니다. 선택지를 “얻는 것, 감수할 것, 되돌릴 수 있는가” 세 칸으로 나누어 보세요. 모든 불확실성이 사라질 때까지 기다리기보다, 되돌릴 수 있는 작은 결정부터 실행하면 감각이 또렷해집니다.',
      '반복되는 장면에는 상대가 달라도 비슷한 역할을 맡는 내가 있을 수 있습니다. 갈등이 생기기 직전 내가 삼킨 말, 상대에게 기대했던 신호, 결국 감당하게 된 몫을 돌아보세요. 원인을 모두 자신의 탓으로 돌리지 않으면서도 다음에 바꿀 수 있는 행동 하나를 발견하면 반복의 고리가 느슨해집니다.',
      '기운이 떨어진 시기에는 큰 목표보다 회복 가능한 하루를 만드는 것이 우선입니다. 쉬어도 나아지지 않는 피로가 이어지면 혼자 참기보다 믿을 만한 사람이나 전문적인 도움을 함께 찾으세요. 운세 풀이가 건강 판단을 대신할 수는 없습니다. 오늘의 일정에서 반드시 해야 할 일과 미뤄도 되는 일을 나누어 보세요.',
      '새 출발은 결심을 크게 하는 순간보다 작은 루틴이 자리를 잡을 때 현실이 됩니다. 완벽한 계획을 기다리기보다 일주일 안에 시험할 수 있는 행동 하나를 정하고, 해 본 뒤 무엇이 맞았는지 기록하세요. 오래된 기준을 모두 버리지 않아도 됩니다. 지금의 나에게 맞게 고쳐 쓰면 됩니다.'
    ],
    signs:['내가 통제할 수 있는 일과 없는 일을 나누기','피로를 의지 부족으로 해석하지 않기','이번 주에 반복할 수 있는 작은 행동 하나 정하기'],
    questionPrompts:['요즘 내 마음을 가장 많이 차지하는 생각은 무엇인가요?','무엇을 지키느라 너무 많은 힘을 쓰고 있나요?','오늘 하루에서 아주 조금 바꿀 수 있는 것은 무엇인가요?'],
    action:'하루 끝에 마음이 편안했던 순간 하나와 부담스러웠던 순간 하나를 적어 보세요. 며칠만 기록해도 내 에너지를 쓰는 방식이 보이기 시작합니다.'
  }
};
const deck = [
  {name:'별 · The Star',symbol:'✧',caption:'회복과 긴 호흡',meaning:'별은 이미 지나온 시간을 부정하지 않고, 그 안에서 다시 믿음을 회복하는 카드입니다. 큰 확답이 당장 주어지기보다 마음이 조금씩 맑아지는 과정에 가깝습니다. 꾸준히 해 온 일이 있다면 결과를 재촉하기보다 무엇이 자라고 있는지 확인해 보세요.',guide:'희망을 행동으로 옮기려면 오늘 할 수 있는 가장 작은 약속을 지키는 것이 좋습니다.'},
  {name:'절제 · Temperance',symbol:'☯',caption:'균형과 조율',meaning:'절제는 서로 다른 속도와 욕구를 한쪽이 이기게 하는 대신 조율하는 카드입니다. 급히 결론을 내리기보다 간격을 조정하고, 감정과 현실을 같은 자리에 놓아 보라는 뜻으로 읽을 수 있습니다. 지금의 답답함은 방법을 바꾸면 풀릴 여지가 있습니다.',guide:'양쪽의 요구를 모두 적고, 이번 주에 시험해 볼 수 있는 중간 지점을 하나 정해 보세요.'},
  {name:'여황제 · The Empress',symbol:'❀',caption:'돌봄과 결실',meaning:'여황제는 이미 가진 관계와 자원을 돌보아 결실로 이어 가는 카드입니다. 부족한 점만 채우려 애쓰기보다 지금 곁에 있는 도움과 자신의 능력을 알아보라는 메시지입니다. 성장은 밀어붙일 때보다 꾸준히 보살피고 유지할 때 깊어집니다.',guide:'받는 도움을 당연하게 여기지 말고, 고마움이나 필요한 요청을 구체적으로 표현해 보세요.'},
  {name:'은둔자 · The Hermit',symbol:'☾',caption:'내 기준을 확인하는 시간',meaning:'은둔자는 혼자 모든 것을 감당하라는 카드가 아니라, 외부의 목소리를 잠시 낮추고 자신의 기준을 찾으라는 카드입니다. 선택지가 많을수록 다른 사람의 기대와 내 바람이 섞일 수 있습니다. 잠깐 멈추어 질문을 다시 세우면 답의 방향이 보입니다.',guide:'답을 구하기 전에 “내가 정말 알고 싶은 것은 무엇인가?”를 한 문장으로 써 보세요.'},
  {name:'힘 · Strength',symbol:'♧',caption:'부드러운 용기',meaning:'힘은 감정을 눌러 이기는 것이 아니라 다정하게 다루는 용기를 말합니다. 불안이나 서운함을 없애려 하기보다 그 마음이 무엇을 지키려 하는지 들어 보세요. 당신에게는 이미 지나온 경험에서 배운 현실적인 힘이 있습니다.',guide:'자신에게 하듯 믿을 만한 사람에게도 따뜻하게 말해 보세요. 단호함과 다정함은 함께 갈 수 있습니다.'},
  {name:'운명의 수레바퀴 · Wheel of Fortune',symbol:'◎',caption:'변화와 전환점',meaning:'수레바퀴는 모든 흐름에 바뀌는 때가 있고, 지금의 상황도 고정되어 있지 않음을 보여 줍니다. 모든 변화를 통제하려 하기보다 내 손에 있는 선택과 준비를 살펴보세요. 변화는 준비된 작은 움직임을 만났을 때 기회가 되기 쉽습니다.',guide:'상황이 바뀌어도 지킬 원칙 하나와, 새롭게 시도할 행동 하나를 정해 두세요.'},
  {name:'정의 · Justice',symbol:'⚖',caption:'균형과 분명한 기준',meaning:'정의는 감정과 현실을 함께 놓고 공정하게 살피는 카드입니다. 사실, 내가 해석한 것, 내가 바라는 것을 나누어 보면 지나친 기대나 불필요한 죄책감이 줄어듭니다. 기준을 분명히 하는 일은 관계를 끊기 위한 것이 아니라 서로의 책임을 보이게 합니다.',guide:'중요한 약속이나 조건은 기억에 맡기지 말고 말이나 글로 정확히 확인해 보세요.'},
  {name:'태양 · The Sun',symbol:'☼',caption:'분명함과 생기',meaning:'태양은 감춰 두었던 가능성과 기쁨을 다시 밖으로 꺼내는 카드입니다. 작은 성취를 사소하게 넘기지 않을 때 자신감이 회복됩니다. 혼자 애쓰던 일이 있다면 믿을 만한 사람과 나누고, 결과뿐 아니라 여기까지 온 과정을 인정해 주세요.',guide:'이미 잘 해낸 일 세 가지를 적어 보세요. 다음 걸음은 그 힘을 활용할 때 가벼워집니다.'},
  {name:'마법사 · The Magician',symbol:'✴',caption:'가진 것을 연결해 시작하기',meaning:'마법사는 모든 준비가 끝나기를 기다리기보다 이미 손에 있는 능력과 자원을 한 방향으로 묶어 보라는 카드입니다. 아이디어가 실행으로 이어지려면 범위를 작게 정하고, 결과를 확인할 기준을 세우는 것이 필요합니다.',guide:'오늘 시작할 수 있는 30분짜리 첫 행동을 정하고, 끝난 뒤 확인할 기준도 함께 적어 보세요.'},
  {name:'세계 · The World',symbol:'◉',caption:'한 단계의 마무리와 확장',meaning:'세계는 지금까지 쌓아 온 경험이 하나의 단계로 정리되고, 다음 단계로 가져갈 것을 고르는 카드입니다. 마무리를 서두르기보다 배운 점과 남은 일을 분리해 보세요. 끝맺음이 분명할수록 새로운 시작도 덜 무겁습니다.',guide:'최근 해낸 일의 결과와 배움을 정리하고, 다음 단계에서 이어갈 것 하나를 골라 보세요.'},
  {name:'달 · The Moon',symbol:'☽',caption:'불확실한 마음을 천천히 살피기',meaning:'달은 아직 드러나지 않은 정보와 상상력이 불안을 키울 수 있는 때를 비춥니다. 지금 느끼는 불안이 틀렸다는 뜻은 아니지만, 그것만으로 결론을 내릴 필요도 없습니다. 확인된 사실과 아직 모르는 것을 나누면 마음이 한결 정돈됩니다.',guide:'추측을 사실처럼 다루지 말고, 직접 확인할 수 있는 질문 하나를 만들어 보세요.'},
  {name:'전차 · The Chariot',symbol:'➤',caption:'방향을 정하고 힘을 모으기',meaning:'전차는 여러 마음이 서로 다른 곳으로 끌고 갈 때 우선순위를 정하는 카드입니다. 속도보다 방향이 먼저입니다. 가장 중요한 목표를 하나로 좁히고, 당분간 에너지를 분산시키는 일은 줄이면 추진력이 살아납니다.',guide:'이번 달 가장 중요한 목표 하나를 정하고, 그 목표와 관계없는 약속 하나를 덜어 보세요.'}
];
const seasonNames = ['한겨울의 응축','봄의 발아','초여름의 확장','가을의 정리'];
const temperamentBySeason = [
  '겉으로 드러내기보다 안에서 생각을 정리한 뒤 움직이는 편입니다. 충분히 검토한 뒤에는 오래 이어 가는 힘이 있습니다.',
  '새로운 기운을 감지하면 먼저 가능성을 살펴보는 편입니다. 시작을 잘 여는 만큼, 무엇을 계속 키울지 선택하는 일이 중요합니다.',
  '사람과 일의 흐름에 적극적으로 참여할 때 생기가 살아나는 편입니다. 많은 일을 해내는 능력만큼 쉬는 리듬도 함께 지켜야 합니다.',
  '결과를 돌아보고 잘못된 점을 다듬는 감각이 있습니다. 완성도를 높이되, 충분히 괜찮은 순간에 마무리하는 기준도 필요합니다.'
];
const el = id => document.getElementById(id);
const form = el('reading-form');
const topicRadios = [...form.querySelectorAll('input[name="topic"]')];
const contextSelect = form.elements.context;
const question = form.elements.question;
const contextOptions = {
  love:['마음 가는 사람과 관계를 시작하기 전','연애 중 서로의 마음을 맞추는 중','이별·재회 사이에서 고민 중','결혼이나 장기적인 관계를 생각 중'],
  work:['이직·전직을 고민 중','현 직장에서 관계나 평가가 고민','창업·사업의 방향을 고민 중','진로·적성을 다시 찾는 중'],
  money:['수입이 들쑥날쑥해 안정이 필요','투자·큰 지출을 앞두고 있음','사업의 매출과 방향을 고민 중','저축·대출·지출을 정리하고 싶음'],
  self:['큰 선택 앞에서 망설이는 중','비슷한 관계·상황이 반복되는 중','지치고 의욕이 떨어진 상태','새로운 출발을 준비하는 중']
};
function updateContextOptions() {
  const selected = form.querySelector('input[name="topic"]:checked')?.value || 'love';
  const oldValue = contextSelect.value;
  contextSelect.replaceChildren(...contextOptions[selected].map((label,index) => { const option=document.createElement('option'); option.value=String(index); option.textContent=label; return option; }));
  contextSelect.value = oldValue && Number(oldValue) < contextOptions[selected].length ? oldValue : '0';
}
topicRadios.forEach(radio => radio.addEventListener('change', updateContextOptions));
updateContextOptions();
question.addEventListener('input', () => { el('char-count').textContent = `${question.value.length} / 500`; });
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const birthDate = String(data.get('birthDate'));
  const reading = createReading({birthDate, birthTime:String(data.get('birthTime')), topic:String(data.get('topic')), context:Number(data.get('context')), question:String(data.get('question') || '').trim()});
  renderReading(reading,birthDate);
});
function createReading({birthDate,birthTime,topic,context,question}) {
  const date = new Date(`${birthDate}T12:00:00`);
  const year = date.getFullYear() - ((date.getMonth() === 0 || (date.getMonth() === 1 && date.getDate() < 4)) ? 1 : 0);
  const seed = [...birthDate.replaceAll('-',''),topic,String(context),question].join('').split('').reduce((sum,char)=>sum+char.charCodeAt(0),0);
  const stem = stems[((year-4)%10+10)%10];
  const branch = branches[((year-4)%12+12)%12];
  const seasonIndex = Math.floor(date.getMonth()/3);
  const mainCard = deck[seed%deck.length];
  let guideIndex = (seed*7+date.getDate()+3)%deck.length;
  if (guideIndex===seed%deck.length) guideIndex=(guideIndex+5)%deck.length;
  const guideCard = deck[guideIndex];
  const focus = topics[topic] || topics.self;
  const contextIndex = Math.max(0,Math.min(context,focus.passages.length-1));
  const timeNote = birthTime==='unknown' ? '태어난 시간이 없어 시주와 대운까지 계산하는 정밀 명식은 포함하지 않았습니다.' : '태어난 시간대는 참고 정보로만 사용했습니다. 분 단위 출생 시각과 절기 계산이 포함된 정밀 명식은 별도 확인이 필요합니다.';
  const wish = question ? `“${question}”라고 적어 주신 질문을 중심에 두고 살펴보겠습니다. ${focus.opening}` : focus.opening;
  const first = `${stem.name}의 상징은 ${stem.element}의 성질로 설명됩니다. ${stem.strength}이 당신의 바탕에 놓이며, ${branch.animal} 해의 상징은 ${branch.trait}을 더합니다.`;
  const second = `이 조합은 ${stem.edge}로 나타날 수 있습니다. 이는 고쳐야 할 결함이 아니라 힘을 쓰는 방식이 한쪽으로 기울 때 생기는 피로에 가깝습니다. ${temperamentBySeason[seasonIndex]}`;
  return {date,year,stem,branch,season:seasonNames[seasonIndex],mainCard,guideCard,focus,context:focus.contexts[contextIndex],passage:focus.passages[contextIndex],timeNote,wish,first,second,seed,question};
}
function section(title, paragraphs, eyebrow) {
  const article=document.createElement('section'); article.className='report-section';
  if (eyebrow) {const small=document.createElement('span'); small.className='report-eyebrow'; small.textContent=eyebrow; article.append(small);}
  const h=document.createElement('h3'); h.textContent=title; article.append(h);
  paragraphs.forEach(text=>{const p=document.createElement('p'); p.textContent=text; article.append(p);});
  return article;
}
function bulletSection(title,items) {
  const article=section(title,[], ''); const ul=document.createElement('ul'); ul.className='report-list';
  items.forEach(item=>{const li=document.createElement('li');li.textContent=item;ul.append(li);});article.append(ul);return article;
}
function renderReading(r,birthDate) {
  const formatted=new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'long',day:'numeric'}).format(r.date);
  el('result-title').textContent=`${r.focus.label} 사전 풀이`;
  el('result-date').textContent=`${formatted} 출생 기준 · ${r.context}`;
  el('result-symbol').textContent=r.mainCard.symbol;
  el('card-name').textContent=r.mainCard.name;
  el('card-caption').textContent=`현재의 흐름을 비추는 카드 · ${r.mainCard.caption}`;
  const container=el('reading-content');
  const lead=section('먼저 드리는 이야기',[r.wish,`지금은 단순히 운이 좋다·나쁘다로 나눌 때가 아닙니다. 당신의 강점이 어디에서 힘이 되고, 어떤 상황에서는 부담으로 바뀌는지를 알아차리는 것이 먼저입니다. 이번 풀이는 ${r.focus.label}에서 그 균형을 찾는 데 초점을 두었습니다.`],'민원장 철학원 온라인 사전 풀이');
  const saju=section('생년월일에서 읽는 기본 결',[r.first,r.second,`이 페이지는 출생 연도의 상징을 바탕으로 한 사전 풀이입니다. ${r.timeNote} 절기 기준의 월주와 일주까지 확인하는 정밀 만세력 풀이와 구분해 참고해 주세요.`],'사주 관점');
  const chart=document.createElement('figure');chart.className='manse-figure';const image=document.createElement('img');image.src='/gpt/manse-calendar.svg';image.alt='사주의 네 기둥과 음양의 흐름을 상징적으로 표현한 만세력 도해';const caption=document.createElement('figcaption');caption.textContent=`만세력은 태어난 연·월·일·시를 간지로 바꾸어 사주의 네 기둥을 살피는 기준입니다. 현재 결과에는 출생 연도의 상징만 반영되어 있습니다. ${r.timeNote}`;chart.append(image,caption);saju.append(chart);
  const cards=document.createElement('section');cards.className='report-section tarot-section';
  const cardEyebrow=document.createElement('span');cardEyebrow.className='report-eyebrow';cardEyebrow.textContent='타로 관점 · 두 장의 흐름';cards.append(cardEyebrow);
  const cardTitle=document.createElement('h3');cardTitle.textContent='지금의 마음과 다음에 취할 태도';cards.append(cardTitle);
  const cardGrid=document.createElement('div');cardGrid.className='tarot-grid';
  [[r.mainCard,'현재의 흐름'],[r.guideCard,'도움이 되는 태도']].forEach(([card,label])=>{const item=document.createElement('article');item.className='tarot-item';const art=document.createElement('div');art.className='tarot-art';art.setAttribute('aria-hidden','true');const halo=document.createElement('span');halo.className='tarot-halo';halo.textContent=card.symbol;const roman=document.createElement('small');roman.textContent=card.name.split('·').pop().trim().toUpperCase();art.append(halo,roman);const kicker=document.createElement('small');kicker.className='tarot-kicker';kicker.textContent=label;const name=document.createElement('strong');name.textContent=card.name;const p=document.createElement('p');p.textContent=card.meaning;const advice=document.createElement('p');advice.className='tarot-advice';advice.textContent=card.guide;item.append(art,kicker,name,p,advice);cardGrid.append(item);});cards.append(cardGrid);
  const answer=section(`${r.focus.label}에서 지금 살펴볼 부분`,[r.passage,`이 주제에서 당신에게 필요한 기준은 “${r.focus.signs[r.seed%r.focus.signs.length]}”입니다. 마음이 급해질 때 이 기준으로 상황을 다시 보면, 지금 당장 할 수 있는 일과 시간을 두고 지켜볼 일을 나누는 데 도움이 됩니다.`],`현재 상황 · ${r.context}`);
  const outlook=section('앞으로 한 달을 보내는 세 걸음',[], '확정된 예언이 아닌 점검 일정');
  const steps=[['이번 주','상황을 더 복잡하게 만드는 추측과 실제로 확인된 사실을 나누어 적어 보세요.'],['다음 2주','상대나 환경이 달라지기를 기다리기보다, 내가 먼저 바꿀 수 있는 행동 하나를 시험해 보세요.'],['한 달 안','그 행동 뒤에 마음과 현실이 어떻게 달라졌는지 점검하고, 계속할 것과 멈출 것을 정해 보세요.']];
  const timeline=document.createElement('div');timeline.className='timeline';steps.forEach(([time,text])=>{const row=document.createElement('div');row.className='timeline-row';const label=document.createElement('strong');label.textContent=time;const p=document.createElement('p');p.textContent=text;row.append(label,p);timeline.append(row);});outlook.append(timeline);
  const action=section('오늘 바로 해볼 작은 실천',[r.focus.action,`스스로에게 던져볼 질문: “${r.focus.questionPrompts[r.seed%r.focus.questionPrompts.length]}”`],'지금 할 수 있는 것');action.classList.add('action-section');
  const talk=section('전화 상담에서 더 깊게 확인할 수 있어요',[`이번 사전 풀이는 ${r.focus.label}의 흐름을 정리하는 첫 안내입니다. 실제 상황과 상대의 말·행동, 중요한 시기를 함께 살펴보면 무엇을 기다리고 무엇을 결정할지 더 구체적으로 짚을 수 있습니다.`, `상담을 원하시면 아래 번호로 예약해 주세요. 통화 전에 가장 궁금한 질문 하나와 지금까지 있었던 일을 간단히 메모해 두면 상담 시간을 알차게 쓰실 수 있습니다.`],'민원장 철학원');talk.classList.add('consult-section');
  container.replaceChildren(lead,saju,cards,answer,outlook,bulletSection('상담 전에 메모해 두면 좋은 질문',r.focus.questionPrompts),action,talk);
  el('form-card').classList.add('hidden');el('result-card').classList.remove('hidden');el('result-card').scrollIntoView({behavior:'smooth',block:'start'});
  history.replaceState(null,'','#reading');
}
el('reset-button').addEventListener('click',()=>{el('result-card').classList.add('hidden');el('form-card').classList.remove('hidden');form.reset();updateContextOptions();el('char-count').textContent='0 / 500';el('reading').scrollIntoView({behavior:'smooth'});});
el('share-button').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);el('share-button').textContent='페이지 주소를 복사했습니다 ✓';setTimeout(()=>el('share-button').textContent='결과 링크 복사 ↗',1800);}catch{window.print();}});
el('print-button').addEventListener('click',()=>window.print());
