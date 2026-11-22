/* 생년월일 → 띠 페이지 라우터.
   입력: 1990 / 1990-03-04 / 19900304 / 1990.3.4 모두 허용.
   주의: 띠는 입춘(2월 4일 전후)을 기준으로 바뀝니다. 1~2월 초 생은 앞 띠로 보정합니다. */
(function () {
  var Z = ['monkey','rooster','dog','pig','rat','ox','tiger','rabbit','dragon','snake','horse','goat'];
  var N = ['원숭이','닭','개','돼지','쥐','소','호랑이','토끼','용','뱀','말','양'];
  var f = document.getElementById('finder');
  if (!f) return;
  var input = f.querySelector('input'), out = f.querySelector('.out');
  var base = f.getAttribute('data-base') || '';

  function parse(v) {
    var d = (v || '').replace(/[^0-9]/g, '');
    if (d.length === 4) return { y: +d, m: 0, d: 0 };
    if (d.length === 8) return { y: +d.slice(0, 4), m: +d.slice(4, 6), d: +d.slice(6, 8) };
    if (d.length === 6) return { y: +d.slice(0, 4), m: +d.slice(4, 6), d: 0 };
    return null;
  }
  function go() {
    var p = parse(input.value);
    if (!p || p.y < 1920 || p.y > 2030) {
      out.textContent = '태어난 해를 네 자리로 넣어 주세요. 예: 1978 또는 1978-05-12';
      return;
    }
    var y = p.y;
    // 입춘 보정: 1월생, 또는 2월 1~3일생은 앞 해의 띠
    if (p.m === 1 || (p.m === 2 && p.d > 0 && p.d < 4)) y -= 1;
    var i = ((y - 1920) % 12 + 12) % 12;
    var href = base + '/ddi/' + Z[i];
    out.innerHTML = p.y + '년생은 <strong>' + N[i] + '띠</strong>입니다. ' +
      '<a href="' + href + '">' + N[i] + '띠 사주·타로 해설 보기 →</a>';
    if (p.m === 0) {
      out.innerHTML += '<br><span style="font-size:.84em;opacity:.8">1~2월 초 생이면 앞 띠일 수 있습니다.</span>';
    }
  }
  f.querySelector('button').addEventListener('click', go);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } });
})();
