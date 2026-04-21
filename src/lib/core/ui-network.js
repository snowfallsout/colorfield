import { MBTI_ORDER, MBTI_COLORS } from './constants.js';

export function buildLegend(rootEl) {
  if (!rootEl) return;
  rootEl.innerHTML = '';
  for (const m of MBTI_ORDER) {
    const c = MBTI_COLORS[m];
    rootEl.insertAdjacentHTML('beforeend', `\n      <div class="row" id="r-${m}">\n        <div class="dot" style="background:${c};--c:${c}"></div>\n        <span class="lbl">${m}</span>\n        <div class="track"><div class="fill" id="f-${m}" style="background:${c}"></div></div>\n        <span class="cnt" id="c-${m}">0</span>\n      </div>`);
  }
}

export function renderLegend(mbtiCounts) {
  const total = Object.values(mbtiCounts).reduce((a,b)=>a+b,0);
  const totalEl = document.getElementById('total-num'); if (totalEl) totalEl.textContent = total;
  for (const m of MBTI_ORDER) {
    const n   = mbtiCounts[m] || 0; const pct = total > 0 ? n/total*100 : 0;
    document.getElementById(`r-${m}`)?.classList.toggle('on', n > 0);
    const f = document.getElementById(`f-${m}`); const c = document.getElementById(`c-${m}`);
    if (f) f.style.width = pct + '%'; if (c) c.textContent = n;
  }
}

export function showToast(msg, color) {
  const ui = document.getElementById('ui'); if (!ui) return;
  ui.querySelectorAll('.toast-wrap').forEach(el => el.remove());
  const wrap = document.createElement('div'); wrap.className = 'toast-wrap';
  wrap.innerHTML = `<div class="toast-pill" style="border-color:${color}55;text-shadow:0 0 18px ${color}">${msg}</div>`;
  ui.appendChild(wrap); setTimeout(() => wrap.remove(), 3000);
}

export function setSessionName(name) { const el = document.getElementById('session-name'); if (el) el.textContent = name ? `— ${name} —` : ''; }

export function initSocketHandlers(socket, mbtiCounts, handlers = {}) {
  socket.on('state', data => { Object.assign(mbtiCounts, data.counts || {}); if (handlers.renderLegend) handlers.renderLegend(mbtiCounts); if (data.session && handlers.setSessionName) handlers.setSessionName(data.session.name); });
  socket.on('spawn_particles', data => { const { mbti, color, counts, total, nickname } = data; Object.assign(mbtiCounts, counts || {}); if (handlers.spawnMBTI) handlers.spawnMBTI(mbti, color); if (handlers.renderLegend) handlers.renderLegend(mbtiCounts); const totalEl = document.getElementById('total-num'); if (totalEl) totalEl.textContent = total || Object.values(mbtiCounts).reduce((a,b)=>a+b,0); if (handlers.showToast) handlers.showToast(`✦ ${mbti} ${nickname} joined`, color); if (handlers.onFirstParticle && handlers.onFirstParticle()) { document.getElementById('waiting').style.display = 'none'; } });
  socket.on('session_reset', data => { for (const k of Object.keys(mbtiCounts)) delete mbtiCounts[k]; if (handlers.clearMBTIParticles) handlers.clearMBTIParticles(); if (handlers.renderLegend) handlers.renderLegend(mbtiCounts); const totalEl = document.getElementById('total-num'); if (totalEl) totalEl.textContent = '0'; const wait = document.getElementById('waiting'); if (wait) wait.style.display = ''; if (data.session && handlers.setSessionName) handlers.setSessionName(data.session.name); if (handlers.showToast) handlers.showToast('✦ 新场次已开始', '#ffffff'); });
}
