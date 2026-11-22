// HTML 템플릿. 본사이트와 같은 색·폰트·레이아웃을 쓰고, 콘텐츠 섹션에 맞게
// 읽기 레이아웃(빵가루·내부링크·고정 CTA)을 더했습니다.

export const INFO = {
  name: '민원장 철학원',
  since: 1987,
  tel: '010-5750-3883',
  tel2: '0508-9596-3790',
  addr: '경기도 성남시 분당구 야탑로111번길 16 (야탑동) 3층',
  access: '분당선 야탑역 2번출구 도보 3분',
  owner: '김가현',
  privacy: '김석',
  prices: [
    ['사주', '5만원'], ['궁합 (2인)', '10만원'], ['택일', '10만원'],
    ['개명 & 작명', '20만원'], ['타로', '3만원']
  ]
};

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function layout({ site, base, path, title, desc, h1, eyebrow, crumbs = [], body, ld = [], keywords }) {
  const canonical = site + base + path;
  const crumbHtml = crumbs.length
    ? `<nav class="bc">${crumbs.map((c, i) =>
        (c.href ? `<a href="${base}${c.href}">${esc(c.name)}</a>` : `<span style="opacity:1;margin:0">${esc(c.name)}</span>`) +
        (i < crumbs.length - 1 ? '<span>›</span>' : '')).join('')}</nav>`
    : '';

  const bcLd = crumbs.length > 1 ? [{
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem', position: i + 1, name: c.name,
      item: c.href !== undefined ? site + base + c.href : canonical
    }))
  }] : [];

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${keywords ? `<meta name="keywords" content="${esc(keywords)}">\n` : ''}<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#2c2557">
<meta name="format-detection" content="telephone=yes">
<meta property="og:site_name" content="${INFO.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="ko_KR">
<meta property="og:image" content="${site}/images/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Gowun+Dodum&family=Noto+Sans+KR:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${base}/assets/style.css">
${[...ld, ...bcLd].map(o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 1)}\n</script>`).join('\n')}
</head>
<body>
<div class="page">
  <div class="topbar"><div class="in">
    <a class="brand" href="${base}">${INFO.name}<small>사주·타로 결합 해설</small></a>
    <a class="call" href="tel:${INFO.tel}">📞 예약 ${INFO.tel}</a>
  </div></div>
${crumbHtml}
  <main>
    <div class="hd">
      ${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ''}
      <h1>${h1}</h1>
    </div>
${body}
${cta(base)}
${disclaimer()}
  </main>
${footer(base)}
</div>
<a class="fab" href="tel:${INFO.tel}">📞 전화예약 ${INFO.tel}</a>
</body>
</html>
`;
}

export function cta(base) {
  return `    <section class="cta">
      <h2>이 해설은 일반론입니다</h2>
      <p>여기까지는 띠(지지)와 카드만 겹친 일반 해석입니다. 실제 사주는 태어난 해·달·날·시의
      여덟 글자가 모두 맞물려 돌아가고, 타로는 지금 이 순간의 질문에 따라 다른 카드가 나옵니다.
      내 여덟 글자와 오늘의 카드로 보는 상담은 전화로 예약해 주세요.</p>
      <a class="btn" href="tel:${INFO.tel}">📞 ${INFO.tel} 전화예약</a>
      <a class="btn outline" href="${base}/about">민원장은 어떤 사람인가 →</a>
      <div class="tbl" style="margin-top:20px;text-align:left">
        ${INFO.prices.map(([k, v]) => `<div class="r"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('\n        ')}
      </div>
      <p class="muted" style="margin-top:12px">예약제로 운영되며 심리상담도 병행합니다. 전화상담도 전화로 시간예약을 먼저 해주세요.</p>
    </section>`;
}

export function disclaimer() {
  return `    <div class="disc">
      이 페이지의 해설은 12지(地支)의 오행과 타로 메이저 카드에 배속한 오행의 생극(生剋) 관계를
      규칙으로 삼아 자동 생성된 일반 해석입니다. 특정인의 사주 여덟 글자를 본 결과가 아니며,
      의료·법률·투자에 대한 판단 근거로 쓸 수 없습니다. 운세 해석은 참고 자료이고
      선택과 책임은 언제나 본인에게 있습니다.
    </div>`;
}

export function footer(base) {
  return `  <footer>
    <div class="fb">${INFO.name}</div>
    <div class="fl">
      <a class="tel" href="tel:${INFO.tel2}">${INFO.tel2}</a> · <a class="tel" href="tel:${INFO.tel}">${INFO.tel}</a><br>
      ${INFO.addr}<br>${INFO.access}
    </div>
    <div class="nav">
      <a href="${base}">사주·타로 해설 홈</a> · <a href="${base}/about">민원장 소개</a> · <a href="/">본사이트</a>
    </div>
    <div class="small">
      상호 ${INFO.name} · 대표 ${INFO.owner} · 개인정보보호책임자 ${INFO.privacy} · ${INFO.since}년 개원<br>
      © ${INFO.name}. 이 섹션의 해설 문구는 자동 생성된 참고 자료입니다.
    </div>
  </footer>`;
}

export { esc };
