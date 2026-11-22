// 한국어 조사 처리. 템플릿에 {키}조사 형태로 써 두면 치환된 값의 받침에 맞춰 자동 교정합니다.
// 예) "{tko}가" → 바보가 / 태양이,  "{te}를" → 水를 / 木을

const HANJA = { // 사주에서 쓰는 한자의 음 (받침 유무만 필요)
  木: true, 火: false, 土: false, 金: true, 水: false,
  甲: true, 乙: true, 丙: true, 丁: true, 戊: false, 己: false, 庚: true, 辛: true, 壬: true, 癸: false,
  子: false, 丑: true, 寅: true, 卯: false, 辰: true, 巳: false, 午: false, 未: false,
  申: true, 酉: false, 戌: true, 亥: false,
  沖: true, 合: true
};

/** 마지막 글자에 받침이 있는가 */
export function hasBatchim(word) {
  const s = String(word).replace(/[\s)\]」』"'.,·]+$/u, '');
  const ch = s[s.length - 1];
  if (!ch) return false;
  if (ch in HANJA) return HANJA[ch];
  const c = ch.charCodeAt(0);
  if (c >= 0xac00 && c <= 0xd7a3) return (c - 0xac00) % 28 !== 0;
  if (/[0-9]$/.test(ch)) return [false, true, false, true, false, false, true, false, true, false][+ch];
  if (/[a-zA-Z]$/.test(ch)) return /[lmnrLMNR]$/.test(ch);
  return false;
}

// 받침 있을 때 / 없을 때
const PAIRS = [['은', '는'], ['이', '가'], ['을', '를'], ['과', '와'], ['으로', '로'], ['이나', '나'], ['이라', '라'], ['아', '야']];
const LOOKUP = new Map();
for (const [a, b] of PAIRS) { LOOKUP.set(a, [a, b]); LOOKUP.set(b, [a, b]); }

/** 단어 뒤에 올 조사를 고른다. particle 은 둘 중 아무거나 써도 된다. */
export function josa(word, particle) {
  const pair = LOOKUP.get(particle);
  if (!pair) return particle;
  return hasBatchim(word) ? pair[0] : pair[1];
}

/** "{키}" 치환 + 바로 뒤에 붙은 조사 자동 교정.
 *  "{an}({ae})을" 처럼 괄호가 끼어 있으면 괄호 안의 마지막 글자를 기준으로 삼습니다. */
export function fill(tpl, slots) {
  return String(tpl).replace(
    /\{(\w+)\}(\([^)]*\))?(으로|이나|이라|[은는이가을를과와야아])?/g,
    (_, key, paren, p) => {
      const v = key in slots ? String(slots[key]) : `{${key}}`;
      const tail = (paren || '').replace(/\{(\w+)\}/g, (__, k) => (k in slots ? String(slots[k]) : ''));
      const out = v + (paren ? paren.replace(/\{(\w+)\}/g, (__, k) => (k in slots ? String(slots[k]) : `{${k}}`)) : '');
      return p ? out + josa(tail || v, p) : out;
    });
}
