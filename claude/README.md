# /claude — 사주 × 타로 결합 해설 섹션

minfortune.kr 안에 붙는 검색유입용 콘텐츠 섹션입니다.
**이 폴더는 소스**이고, 실제 배포되는 HTML은 `site/claude/` 에 생성됩니다.

```bash
node claude/build.mjs                                  # → site/claude/ (경로 /claude)
node claude/build.mjs --out claude/dist --base /claude # 본사이트를 안 건드리고 따로 뽑기
python3 -m http.server 4321 --directory site           # http://localhost:4321/claude
```

빌드는 외부 의존성이 없습니다. Node 18+ 면 됩니다.

## 만들어지는 것 (302 페이지)

| 경로 | 수 | 내용 |
|---|---|---|
| `/claude/reading` | 1 | **단계별 리딩** — 생년월일시 → 만세력 → 카드 3장 → 교차 → 결론 |
| `/claude/matrix` | 1 | 264 조합 매트릭스 (12띠 × 22장, 오행 관계 색/기호) |
| `/claude` | 1 | 홈 — 리딩 안내, 띠 빨리 찾기, 12띠·22카드 색인 |
| `/claude/about` | 1 | 민원장 경력·명성 (적선동 3대 철학관, 1987년, 협회 부회장, 후기) |
| `/claude/ddi/{띠}` | 12 | 띠 허브 — 사주 바탕 + 22장 카드를 오행 관계별로 묶은 색인 |
| `/claude/tarot/{카드}` | 22 | 카드 허브 — 카드 의미 + 12띠별 해석 색인 |
| `/claude/saju-tarot/{띠}-{카드}` | 264 | 상세 해설 |
| `/claude/sitemap.xml` | — | 302 URL |

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

## 단계별 리딩 (`/claude/reading`)

생년월일시를 받아 **만세력 네 기둥**을 계산하고, 타로 세 장을 사주의 세 자리에 각각 올립니다.

| 자리 | 사주 쪽 | 뜻 |
|---|---|---|
| 타고난 바탕 | 연지(띠) | 바꿀 수 없는 밑돌 |
| 지금의 나 | 일간 | 지금 쓰고 있는 힘 |
| 들어오는 자리 | 월지 | 환경과 계절 |

### 만세력 계산

- **일주** — 율리우스일 기준 `(JDN + 49) % 60`. 2026-11-22 = 경자(庚子)로 검증했습니다.
- **연주** — 입춘 경계. 양력 1월 1일이 아닙니다.
- **월주** — 12절(節)의 절입 시각으로 월지, 월두법으로 월간.
- **시주** — 시두법. 시각을 모르면 세 기둥만 씁니다.
- **대운** — 양남음녀 순행 / 음남양녀 역행, 절입까지의 일수 ÷ 3.
- **십신** — 일간 기준 오행·음양 대조.

절기는 `lib/solar.mjs`가 태양황경을 직접 계산합니다(Meeus 25장 + ΔT 보정).
실측 대비 **오차 5~8분** 수준입니다 — 2025 입춘 계산 23:07(실제 23:10),
2026 입춘 04:54(실제 05:02). 이 오차가 월주를 바꿀 수 있는 **절입 ±2시간 출생은
화면에 경고를 띄워** 전화 확인을 권합니다. 더 정밀하게 가려면 한국천문연구원
역서 값을 테이블로 박아 넣는 쪽이 확실합니다.

### 브라우저에서 돌아가는 방식

빌드 도구 없이 **순수 ESM을 그대로 브라우저로 내보냅니다.** `build.mjs`가
`data/`·`lib/`의 모듈을 `site/claude/assets/engine/` 로 복사하고,
`assets/reading.js`가 `import` 합니다. 계산은 전부 브라우저에서 일어나고
입력값은 서버로 가지 않습니다. 결과는 `?d=…&t=…&s=…&c=…` 로 링크에 담깁니다.

> `.mjs` MIME 타입이 틀리면 모듈 전체가 안 뜹니다. `site/vercel.json` 에
> `/claude/assets/engine/(.*).mjs` → `text/javascript` 를 못 박아 두었습니다.

### 카드 그림

`lib/cards.mjs`가 22장을 **SVG로 직접 그립니다.** 외부 이미지·폰트가 없고
저작권 문제도 없습니다. 남색 바탕 + 금색 선화 + 아치 액자로 통일했습니다.

> 금색 그라디언트는 반드시 `gradientUnits="userSpaceOnUse"` 로 두어야 합니다.
> 기본값(`objectBoundingBox`)에서는 **수직·수평 직선이 bbox 넓이 0이라 렌더링되지 않아**
> 사람 몸통·기둥·밧줄이 통째로 사라집니다.

### 한국어 조사

`lib/ko.mjs` 의 `fill()` 이 `{키}` 치환 뒤에 붙은 조사를 받침에 맞춰 자동 교정합니다
("태양가" → "태양이", "金를" → "金을"). 한자 음은 같은 파일의 표에 있습니다.
새 한자를 쓰면 표에 추가하세요.

## 파일

```
claude/
  build.mjs            페이지 생성 + sitemap (CLI: --out / --base / --site)
  data/zodiac.mjs      12지 — 오행·음양·삼합·육합·충·연생, 기질/강점/주의/일·애정·돈
  data/tarot.mjs       메이저 22장 — 배속 오행, 흐름/정방향/역방향/실천/일·애정·돈
  lib/ko.mjs           한국어 조사 자동 교정           (브라우저 공용)
  lib/solar.mjs        태양황경·절기 계산              (브라우저 공용)
  lib/manse.mjs        만세력 네 기둥·십신·대운        (브라우저 공용)
  lib/interpret.mjs    띠 × 카드 생극 해설             (브라우저 공용)
  lib/reading.mjs      세 자리 교차와 종합             (브라우저 공용)
  lib/cards.mjs        타로 22장 SVG 아트              (브라우저 공용)
  lib/templates.mjs    밝은 셸 — 읽을거리 300편용      (빌드 전용)
  lib/dark.mjs         어두운 셸 — 리딩·매트릭스용     (빌드 전용)
  assets/style.css     밝은 셸 스타일 (본사이트 색·폰트 그대로)
  assets/reading.css   어두운 셸 스타일
  assets/reading.js    단계별 리딩 컨트롤러 (ESM)
  assets/router.js     생년월일 → 띠 라우터 (입춘 보정)
```

"브라우저 공용"으로 적힌 모듈은 Node와 브라우저 양쪽에서 그대로 돌아갑니다.
Node 전용 API를 넣으면 리딩 화면이 깨지니 주의하세요.

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
