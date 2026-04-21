/*
  ml-camera.js
  說明：攝影機與 MediaPipe 相關初始化、座標映射、推理節流。
  匯出狀態變數：`faces`, `emotion`, `video`, `handsResults`, `activePinchPoints`，以及主要 API。
*/
import { updateEmotionBadge } from './emotion.js';

/** 偵測到的人臉資訊陣列（{x,y,smile}） */
export let faces = [];
/** 目前推斷的情緒（'neutral'|'smile'） */
export let emotion = 'neutral';
/** 指向頁面上的 video#video-bg element（若存在） */
export const video = typeof document !== 'undefined' ? document.getElementById('video-bg') : null;

/** MediaPipe 實例 */
export let _faceMesh = null; export let _hands = null;
/** 最近一幀的手部結果與捏合點陣列 */
export let handsResults = null; export let activePinchPoints = [];

let _processing = false; let _frameCounter = 0;

/**
 * 影格處理迴圈（會以 requestAnimationFrame 排程自身）
 * 內部會交替送影像給 FaceMesh 與 Hands，達到節流效果。
 */
export async function _processFrame() {
  requestAnimationFrame(_processFrame);
  if (!_processing || !video || video.readyState < 2) return;
  _frameCounter++;
  try {
    if (_faceMesh && (_frameCounter & 1) === 0) { await _faceMesh.send({ image: video }); }
    else if (_hands) { await _hands.send({ image: video }); }
  } catch (e) { /* 吞掉偶發的單幀錯誤 */ }
}

/**
 * 把 MediaPipe 正規化座標映射到 canvas 畫布上的像素座標（含鏡像與裁切校正）
 * @param {number} normX - 0..1
 * @param {number} normY - 0..1
 * @returns {{x:number,y:number}}
 */
export function mapToCanvas(normX, normY) {
  if (!video || video.videoWidth === 0) return { x: 0, y: 0 };
  const W = window.innerWidth, H = window.innerHeight;
  const scale = Math.max(W / video.videoWidth, H / video.videoHeight);
  const dw = video.videoWidth * scale; const dh = video.videoHeight * scale; const dx = (W - dw) / 2; const dy = (H - dh) / 2;
  return { x: dx + (1 - normX) * dw, y: dy + normY * dh };
}

/**
 * 初始化攝影機與 MediaPipe 引擎，並在 engine ready 後啟動處理迴圈。
 */
export function setupCamera() {
  if (!navigator.mediaDevices) return;
  navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
    .then(stream => {
      if (!video) return;
      video.srcObject = stream;
      video.onloadedmetadata = async () => {
        video.play(); video.classList.add('ready');
        _initFaceMesh(); _initHands();
        try { if (_faceMesh) await _faceMesh.initialize(); if (_hands) await _hands.initialize(); } catch(e) { console.warn('AI Engine Init Error:', e); }
        _processing = true;
      };
    })
    .catch(err => { console.warn('Camera unavailable:', err && err.message); });
}

/**
 * 初始化 FaceMesh 模組，並在回調中更新 `faces` 與 `emotion`。
 */
export function _initFaceMesh() {
  if (typeof FaceMesh === 'undefined') return;
  _faceMesh = new FaceMesh({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${f}` });
  _faceMesh.setOptions({ maxNumFaces: 6, refineLandmarks: false, minDetectionConfidence: .5, minTrackingConfidence: .5 });
  _faceMesh.onResults(results => {
    faces = []; let smiles = 0;
    if (results.multiFaceLandmarks) {
      for (const lm of results.multiFaceLandmarks) {
        const pt = mapToCanvas(lm[168].x, lm[168].y);
        const mw = Math.abs(lm[291].x - lm[61].x); const ew = Math.abs(lm[263].x - lm[33].x);
        const smile = ew > 0 && (mw / ew) > .57; if (smile) smiles++;
        faces.push({ x: pt.x, y: pt.y, smile });
      }
    }
    emotion = (smiles > faces.length * .5 && faces.length > 0) ? 'smile' : 'neutral';
    try { updateEmotionBadge(faces, emotion); } catch(e){}
  });
}

/**
 * 初始化 Hands 模組，並在回調中維護 `activePinchPoints` 與 `handsResults`。
 */
export function _initHands() {
  if (typeof Hands === 'undefined') { console.warn('MediaPipe Hands library not loaded'); return; }
  _hands = new Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${f}` });
  _hands.setOptions({ maxNumHands: 2, minDetectionConfidence: 0.7, minTrackingConfidence: 0.6, modelComplexity: 0 });
  _hands.onResults(res => {
    handsResults = res; activePinchPoints = [];
    if (!res.multiHandLandmarks || res.multiHandLandmarks.length === 0) return;
    for (const lm of res.multiHandLandmarks) {
      const indexTip  = mapToCanvas(lm[8].x, lm[8].y); const thumbTip  = mapToCanvas(lm[4].x, lm[4].y);
      const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y); const pinched   = pinchDist < 60;
      if (pinched) activePinchPoints.push({ x: (indexTip.x + thumbTip.x) / 2, y: (indexTip.y + thumbTip.y) / 2 });
    }
  });
}
