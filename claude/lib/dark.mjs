// 리딩·매트릭스용 어두운 셸 (본사이트 밝은 셸과 별도)
import { INFO } from './templates.mjs';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function darkLayout({ site, base, path, title, desc, keywords, body, ld = [], script }) {
  const canonical = site + base + path;
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${keywords ? `<meta name="keywords" content="${esc(keywords)}">\n` : ''}<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#0f0c1f">
<meta name="format-detection" content="telephone=yes">
<meta property="og:site_name" content="${INFO.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="ko_KR">
<meta property="og:image" content="${site}/images/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Gowun+Dodum&family=Noto+Sans+KR:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${base}/assets/reading.css">
${ld.map(o => `<script type="application/ld+json">\n${JSON.stringify(o, null, 1)}\n</script>`).join('\n')}
</head>
<body data-base="${base}">
<div class="sky" id="sky" aria-hidden="true"></div>
<div class="bar"><div class="in">
  <a class="bm" href="${base}">${INFO.name}<small>사주 × 타로</small></a>
  <a class="tel" href="tel:${INFO.tel}">📞 ${INFO.tel}</a>
</div></div>
${body}
<footer>
  <div class="fb">${INFO.name}</div>
  <div class="fl">
    <a href="tel:${INFO.tel2}">${INFO.tel2}</a> · <a href="tel:${INFO.tel}">${INFO.tel}</a><br>
    ${INFO.addr}<br>${INFO.access}<br>
    <a href="${base}">사주·타로 해설</a> · <a href="${base}/matrix">264 매트릭스</a> · <a href="${base}/about">민원장 소개</a> · <a href="/">본사이트</a>
  </div>
  <div class="fl" style="font-size:.76rem;opacity:.8">
    상호 ${INFO.name} · 대표 ${INFO.owner} · 개인정보보호책임자 ${INFO.privacy} · ${INFO.since}년 개원
  </div>
</footer>
<a class="fab" href="tel:${INFO.tel}">📞 전화예약 ${INFO.tel}</a>
${script || ''}
</body>
</html>
`;
}
export { esc };
