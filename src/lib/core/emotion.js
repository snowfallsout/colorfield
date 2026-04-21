/*
  emotion.js
  說明：情緒與 emoji 顯示輔助函式。
  - 提供隨機 emoji 池與顯示、隱藏、跟隨笑臉位置的機制。
*/
export const SMILE_EMOJIS = [
  '🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔶','🔷','🔸','🔹','🔺','🔻','💠','🔘','🔲','🔳','✨','💫','⚡','🔥','💥','🌟','⭐','🌈',
  '☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️','⛄','🌬️','💨','🌀','🌊','💧','💦','☔',
  '⛱️','🌙','🌛','🌜','🌚','🌝','🌞','☄️','🌪️','🌱','🌿','🍀','🍃','🍂','🍁','🌵','🌾','🎋','🎍','🌺','🌸','🌼','🌻','🌹','🥀','🌷','🪷','🪴','🌲','🌳','🌴','🪵','🪨'
];

const _prevSmile = new Map();
let _emojiEl = null; let _wasAnySmiling = false;

/**
 * 取得或建立顯示 emoji 的 DOM 元素（單例）
 * @returns {HTMLElement}
 */
export function _getOrCreateEmojiEl() {
  if (!_emojiEl) {
    _emojiEl = document.createElement('div'); _emojiEl.className = 'smile-emoji-persistent';
    const ui = document.getElementById('ui'); if (ui) ui.appendChild(_emojiEl);
  }
  return _emojiEl;
}

/** 隨機挑一個 emoji */
export function _randomEmoji() { return SMILE_EMOJIS[Math.floor(Math.random() * SMILE_EMOJIS.length)]; }

/**
 * 每幀更新 emoji 顯示狀態：當有人由不笑→笑時選一個 emoji 並跟隨人臉
 * @param {Array} faces
 */
export function _tickSmileEmoji(faces) {
  const anySmiling  = faces && faces.some(f => f.smile);
  const el = _getOrCreateEmojiEl();
  if (anySmiling) {
    const smilingFace = faces.find(f => f.smile);
    if (!_wasAnySmiling) el.textContent = _randomEmoji();
    if (smilingFace) { el.style.left = smilingFace.x + 'px'; el.style.top = (smilingFace.y - 70) + 'px'; }
    el.style.opacity = '1'; el.style.transform = 'scale(1)';
  } else { el.style.opacity = '0'; el.style.transform = 'scale(0.5)'; }
  _wasAnySmiling = anySmiling;
}

/**
 * 更新情緒徽章的文字/樣式（顯示偵測到的人臉數或 smile）
 * @param {Array} faces
 * @param {string} emotion
 */
export function updateEmotionBadge(faces, emotion) {
  const el = document.getElementById('emotion-badge'); if (!el) return;
  if (!faces || faces.length === 0) { el.className = ''; el.textContent = '● FACE TRACKING'; }
  else if (emotion === 'smile') { el.className = 'smile'; el.textContent = '✦ SMILE DETECTED'; }
  else { el.className = ''; el.textContent = `● ${faces.length} FACE${faces.length>1?'S':''} DETECTED`; }
}
