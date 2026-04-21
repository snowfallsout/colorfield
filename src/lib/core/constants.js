/*
  constants.js
  說明：此檔定義專案共用的常數與色板（MBTI 類型顏色、名稱、排序與調色盤）。
  使用說明：其他模組可從此匯入所需的配色與常數，避免重複硬編碼。
*/

/** 2π 常數，用於圓周/角度計算 */
export const TWO_PI = Math.PI * 2;

export const MBTI_COLORS = {
  INTJ: '#4B0082', INTP: '#6495ED', ENTJ: '#FF4500', ENTP: '#FF00FF',
  INFJ: '#00A86B', INFP: '#DA70D6', ENFJ: '#FC913A', ENFP: '#92FE9D',
  ISTJ: '#95A5A6', ISFJ: '#BDB76B', ESTJ: '#4682B4', ESFJ: '#FFB6C1',
  ISTP: '#4A4A4A', ISFP: '#00CED1', ESTP: '#FF2400', ESFP: '#7B68EE',
};

export const MBTI_NAMES = {
  INTJ:'战略家', INTP:'逻辑学家', ENTJ:'指挥官', ENTP:'辩论家',
  INFJ:'提倡者', INFP:'调停者', ENFJ:'主人公', ENFP:'竞选者',
  ISTJ:'检察官', ISFJ:'守护者', ESTJ:'总经理', ESFJ:'执政官',
  ISTP:'鉴赏家', ISFP:'探险家', ESTP:'企业家', ESFP:'表演者',
};

export const MBTI_ORDER = [
  'INTJ','INTP','ENTJ','ENTP',
  'INFJ','INFP','ENFJ','ENFP',
  'ISTJ','ISFJ','ESTJ','ESFJ',
  'ISTP','ISFP','ESTP','ESFP',
];

export const MBTI_PALETTES = {
  INTJ: { core: '#1A0A2E', mid: '#4B0082', edge: '#E0B0FF' },
  INTP: { core: '#002366', mid: '#6495ED', edge: '#F0F8FF' },
  ENTJ: { core: '#8B0000', mid: '#FF4500', edge: '#FFD700' },
  ENTP: { core: '#FFD700', mid: '#FF00FF', edge: '#00FFFF' },
  INFJ: { core: '#2E0854', mid: '#00A86B', edge: '#F5F5DC' },
  INFP: { core: '#FF69B4', mid: '#DA70D6', edge: '#98FB98' },
  ENFJ: { core: '#FF4E50', mid: '#FC913A', edge: '#F9D423' },
  ENFP: { core: '#00D2FF', mid: '#92FE9D', edge: '#FF758C' },
  ISTJ: { core: '#2C3E50', mid: '#95A5A6', edge: '#ECF0F1' },
  ISFJ: { core: '#556B2F', mid: '#BDB76B', edge: '#FFFACD' },
  ESTJ: { core: '#000080', mid: '#4682B4', edge: '#D3D3D3' },
  ESFJ: { core: '#FF7F50', mid: '#FFB6C1', edge: '#E6E6FA' },
  ISTP: { core: '#1C1C1C', mid: '#4A4A4A', edge: '#00CCCC' },
  ISFP: { core: '#FF007F', mid: '#00CED1', edge: '#FFFFE0' },
  ESTP: { core: '#FFD700', mid: '#FF2400', edge: '#2F4F4F' },
  ESFP: { core: '#FF00FF', mid: '#7B68EE', edge: '#7FFFD4' },
};

export const AMBIENT_COLS = ['#003153','#C8A2C8','#F9A602','#9DC183','#40E0D0'];
