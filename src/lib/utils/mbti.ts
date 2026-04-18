export const MBTI_COLORS: Record<string, string> = {
  INTJ: '#4B0082', INTP: '#6495ED', ENTJ: '#FF4500', ENTP: '#FF00FF',
  INFJ: '#00A86B', INFP: '#DA70D6', ENFJ: '#FC913A', ENFP: '#92FE9D',
  ISTJ: '#95A5A6', ISFJ: '#BDB76B', ESTJ: '#4682B4', ESFJ: '#FFB6C1',
  ISTP: '#4A4A4A', ISFP: '#00CED1', ESTP: '#FF2400', ESFP: '#7B68EE'
};

export const MBTI_NAMES: Record<string, string> = {
  INTJ: '战略家', INTP: '逻辑学家', ENTJ: '指挥官', ENTP: '辩论家',
  INFJ: '提倡者', INFP: '调停者', ENFJ: '主人公', ENFP: '竞选者',
  ISTJ: '检察官', ISFJ: '守护者', ESTJ: '总经理', ESFJ: '执政官',
  ISTP: '鉴赏家', ISFP: '探险家', ESTP: '企业家', ESFP: '表演者'
};

export const LETTER_COLORS: Record<string, string> = {
  E: '#FF6B4A', I: '#5B5B9F', N: '#9B6BDB', S: '#4AB8A0',
  T: '#4A7BD6', F: '#FF6FA3', J: '#F5A94A', P: '#7DD87D'
};

export function hexToRgb(h: string) {
  let s = h.replace('#', '');
  if (s.length === 3) s = s.split('').map(c => c + c).join('');
  return {
    r: parseInt(s.slice(0, 2), 16),
    g: parseInt(s.slice(2, 4), 16),
    b: parseInt(s.slice(4, 6), 16)
  };
}

export function mix(a: string, b: string, t: number) {
  const pa = hexToRgb(a), pb = hexToRgb(b);
  return `rgb(${Math.round(pa.r * (1 - t) + pb.r * t)},${Math.round(pa.g * (1 - t) + pb.g * t)},${Math.round(pa.b * (1 - t) + pb.b * t)})`;
}

export function lighten(hex: string, amt: number) {
  const p = hexToRgb(hex);
  return `rgb(${Math.min(255, p.r + Math.round((255 - p.r) * amt))},${Math.min(255, p.g + Math.round((255 - p.g) * amt))},${Math.min(255, p.b + Math.round((255 - p.b) * amt))})`;
}

export function deriveCardColors(sel: Array<string | null>) {
  const complete = sel.every(Boolean);
  let c0: string, c1: string, c2: string, c3: string;
  if (complete) {
    const main = MBTI_COLORS[sel.join('')] || '#888';
    c0 = lighten(main, 0.55);
    c1 = lighten(main, 0.25);
    c2 = mix(main, LETTER_COLORS[sel[2] || ''] || main, 0.25);
    c3 = main;
  } else if (sel.some(Boolean)) {
    const picks = sel.map(s => s ? LETTER_COLORS[s] : null);
    const fallback = '#cfd2de';
    c0 = picks[0] ? lighten(picks[0], 0.6) : '#eceef5';
    c1 = picks[1] ? lighten(picks[1], 0.35) : (picks[0] ? lighten(picks[0], 0.4) : '#dcdee7');
    c2 = picks[2] ? lighten(picks[2], 0.1) : (picks[1] ? lighten(picks[1], 0.15) : '#cfd2de');
    c3 = picks[3] || picks[2] || picks[1] || picks[0] || fallback;
  } else {
    c0 = '#eceef5'; c1 = '#dcdee7'; c2 = '#cfd2de'; c3 = '#bec2d2';
  }
  return { c0, c1, c2, c3 };
}
