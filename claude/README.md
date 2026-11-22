# /claude — 사주 × 타로 결합 해설 섹션

minfortune.kr 안에 붙는 검색유입용 콘텐츠 섹션입니다.
**이 폴더는 소스**이고, 실제 배포되는 HTML은 `site/claude/` 에 생성됩니다.

```bash
node claude/build.mjs                                  # → site/claude/ (경로 /claude)
node claude/build.mjs --out claude/dist --base /claude # 본사이트를 안 건드리고 따로 뽑기
python3 -m http.server 4321 --directory site           # http://localhost:4321/claude
```

빌드는 외부 의존성이 없습니다. Node 18+ 면 됩니다.

## 만들어지는 것 (300 페이지)

| 경로 | 수 | 내용 |
|---|---|---|
| `/claude` | 1 | 홈 — 생년월일로 띠 찾기, 12띠·22카드 색인, 결합 방식 설명 |
| `/claude/about` | 1 | 민원장 경력·명성 (적선동 3대 철학관, 1987년, 협회 부회장, 후기) |
| `/claude/ddi/{띠}` | 12 | 띠 허브 — 사주 바탕 + 22장 카드를 오행 관계별로 묶은 색인 |
| `/claude/tarot/{카드}` | 22 | 카드 허브 — 카드 의미 + 12띠별 해석 색인 |
| `/claude/saju-tarot/{띠}-{카드}` | 264 | 상세 해설 |
| `/claude/sitemap.xml` | — | 300 URL |

## 해설이 생성되는 규칙

사주 쪽 축은 **12지(地支)의 오행**, 타로 쪽 축은 **메이저 22장에 배속한 오행**입니다.
두 오행의 생극(生剋) 관계가 해석의 성격을 결정합니다.

| 관계 | 조건 | 뜻 |
|---|---|---|
| 상생 | 카드 오행 → 띠 오행 생(生) | 카드가 바탕을 밀어줌 |
| 제압 | 띠 오행 → 카드 오행 극(剋) | 바탕으로 카드를 다룸 |
| 비화 | 같은 오행 | 기운이 한쪽으로 몰림 |
| 설기 | 띠 오행 → 카드 오행 생(生) | 바탕의 기운을 내줌 |
| 상극 | 카드 오행 → 띠 오행 극(剋) | 카드가 바탕을 누름 |

예: 태양(火)은 소띠(土)에게 火生土로 **상생**, 닭띠(金)에게 火剋金으로 **상극**이 됩니다.

세운은 **2026 병오년(丙午·火)** 기준이고, 각 띠의 지지가 午와 충(沖)·육합·삼합 중
무엇을 이루는지에 따라 올해 문단이 달라집니다.

### 중복 콘텐츠 대책

264개 상세의 모든 문단은 서로 다릅니다 (`combine` 문단 264/264 유니크,
title·description 300/300 유니크). 관계별 변형 4종을 돌리되 띠 이름·카드 이름·
고유 강점/주의 어휘를 슬롯으로 끼워 넣는 방식입니다. 데이터를 고친 뒤에는
아래로 다시 확인하세요.

```bash
node --input-type=module -e "
import {ZODIAC} from './claude/data/zodiac.mjs';
import {TAROT} from './claude/data/tarot.mjs';
import {interpret} from './claude/lib/interpret.mjs';
const s=new Set();
ZODIAC.forEach((z,i)=>TAROT.forEach((t,j)=>s.add(interpret(z,t,i,j).combine)));
console.log(s.size+' / 264');
"
```

## 파일

```
claude/
  build.mjs            페이지 생성 + sitemap (CLI: --out / --base / --site)
  data/zodiac.mjs      12지 — 오행·음양·삼합·육합·충·연생, 기질/강점/주의/일·애정·돈
  data/tarot.mjs       메이저 22장 — 배속 오행, 흐름/정방향/역방향/실천/일·애정·돈
  lib/interpret.mjs    생극 판정과 결합 해설 생성 (문장 변형은 여기)
  lib/templates.mjs    HTML 레이아웃·CTA·푸터·면책, 상호/요금 등 고정 정보
  assets/style.css     본사이트 색(#2C2557)·폰트(Gowun Batang/Dodum) 그대로
  assets/router.js     생년월일 → 띠 라우터 (입춘 보정 포함)
```

## 배포

`site/` 가 Vercel 루트이므로 **생성만 하면 그대로 배포됩니다.** 빌드 명령 설정 불필요.

- `site/vercel.json` 이 `cleanUrls:true` + `trailingSlash:false` 라서,
  모든 링크·canonical·sitemap을 **슬래시 없는 주소**로 뽑습니다. 이 설정을 바꾸면 다시 빌드해야 합니다.
- `site/robots.txt` 에 `/claude/sitemap.xml` 을 등록해 두었습니다.
- `site/vercel.json` 에 `/claude/assets/(.*)` 캐시 헤더를 추가했습니다.

## 손봐야 할 곳

- **해가 바뀌면** `lib/interpret.mjs` 의 `YEAR` 상수(`2026 병오년` / `火` / `午`)를 고치고 다시 빌드.
- 색인 품질이 걱정되면 상세 264개를 한꺼번에 내보내지 말고
  허브 34개(`/claude`, `/about`, 띠 12, 카드 22)부터 sitemap에 올린 뒤 반응을 보고 확대하세요.
