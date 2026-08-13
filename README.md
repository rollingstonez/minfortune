# minfortune.kr — ChemiCloud → Vercel 이관

기존 WordPress + Elementor 사이트(ChemiCloud 호스팅)를 **정적 사이트**로 다시 만들어
Vercel에 올린 저장소입니다.

- 배포본: <https://minfortune.vercel.app> (Vercel 프로젝트 `minfortune`, Root Directory `site`)
- `main`에 push하면 자동 재배포됩니다.
- 도메인 minfortune.kr 연결은 아직 전 — 아래 "도메인 전환" 참고.

## 구조

```
site/                  ← Vercel 배포 루트 (이 폴더만 올라갑니다)
  index.html           단일 페이지 (CSS 인라인, 빌드 불필요)
  404.html             없는 주소로 들어왔을 때
  vercel.json          캐시·보안 헤더, 구 WordPress 주소 리다이렉트
  robots.txt / sitemap.xml / site.webmanifest
  favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png
  images/              웹 최적화 이미지 (og.jpg 포함)
CONTENT.md             원본 사이트에서 추출한 문구·요금·연락처 명세
```

원본 사이트에 동적 기능(예약폼·게시판·로그인)은 없고 소개형 한 페이지라,
정적 사이트로 100% 대체됩니다. WordPress/PHP/MySQL 모두 필요 없습니다.

## 로컬 미리보기

```bash
python3 -m http.server 4321 --directory site
```

## 배포

Vercel 프로젝트의 **Root Directory 를 `site` 로 지정**하세요. 빌드 명령은 없습니다(Other / static).

CLI로 배포할 경우:

```bash
cd site && npx vercel deploy --prod
```

## 도메인 전환 (⚠️ 메일 먼저 확인)

현재 minfortune.kr DNS는 ChemiCloud 네임서버(`ns1~3.serverhostgroup.com`)에 있고,
**메일(MX)도 같은 서버(158.247.251.40)를 씁니다.**

```
A     @        158.247.251.40
A     www      158.247.251.40
MX    @        minfortune.kr        ← @ 의 A 레코드를 그대로 따라감
TXT   @        v=spf1 +a +mx +ip4:158.247.251.40 include:relay.mailchannels.net ~all
```

MX가 `minfortune.kr` 자기 자신을 가리키므로, **A 레코드만 Vercel로 바꾸면 메일이 같이 끊깁니다.**
`@minfortune.kr` 메일을 쓰고 있다면 아래 순서를 지키세요.

### 메일을 계속 쓰는 경우

DNS는 ChemiCloud 네임서버에 그대로 두고 레코드만 수정합니다.

1. `A  mail  158.247.251.40` 추가 (메일 서버용 별도 호스트)
2. `MX  @  mail.minfortune.kr` (우선순위 0) 로 변경
3. SPF를 `v=spf1 +mx +ip4:158.247.251.40 include:relay.mailchannels.net ~all` 로 변경
   (`+a` 를 빼야 합니다 — 안 그러면 Vercel IP가 발신 허용 IP로 들어갑니다)
4. **위 3개가 전파된 뒤**(dig로 확인) 웹 레코드를 Vercel로 변경
   - `A  @  76.76.21.21`
   - `CNAME  www  cname.vercel-dns.com`
   - 정확한 값은 Vercel 대시보드 Domains 탭에 표시되는 것을 그대로 쓰세요.
5. 메일 송수신 테스트 후 ChemiCloud 웹호스팅 해지 (메일 때문에 계정 자체는 유지해야 함)

### 메일을 안 쓰는 경우

4번만 하면 됩니다. 이후 ChemiCloud 계정 전체 해지 가능.

### 전환 전 체크

```bash
dig +short minfortune.kr A
dig +short minfortune.kr MX
dig +short www.minfortune.kr
```

TTL을 미리 300초로 낮춰두면 전환이 빠르고, 문제 시 롤백도 빠릅니다.

## 전환 후 할 일

- Vercel Domains에서 `www.minfortune.kr` → `minfortune.kr` 리다이렉트 설정
- Google Search Console / 네이버 서치어드바이저에 `https://minfortune.kr/sitemap.xml` 제출
- HTTPS 정상 발급 확인 (Vercel 자동)
