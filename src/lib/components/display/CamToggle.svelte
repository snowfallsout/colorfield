<!--
  CamToggle.svelte
  Doc: Button to toggle camera on/off. Uses `camOn` and `initCamera`/`stopCamera` from media store.
-->

<script lang="ts">
  import { media, initCamera, stopCamera, preloadCamera } from '$lib/state/media.svelte';
  import { ui, toggleWaterOverlay } from '$lib/state/ui.svelte';
  import { onMount, onDestroy } from 'svelte';
  
  // derived UI state: prefer inspecting the actual video element's stream
  const camActive = $derived.by(() => {
    const el = media.videoEl as HTMLVideoElement | null;
    let active = false;
    if (el && el.srcObject instanceof MediaStream) {
      const tracks = el.srcObject.getTracks();
      active = tracks.some(t => t.readyState !== 'ended' && t.enabled);
    }
    return media.camOn || active;
  });

  /*
    toggleCamera()
    - Toggle camera state: call `initCamera()` when turning on, `stopCamera()` when off.
    - Updates store `camOn` is expected to be handled by those helpers.
  */
  function toggleCamera() {
    if (media.camLoading) return;
    // Use derived `camActive` (based on video element) to decide
    if (camActive) {
      stopCamera();
    } else {
      initCamera().catch(() => {});
    }
  }

  function toggleWaterOverlayWhenReady() {
    if (!camActive || media.camLoading) return;
    toggleWaterOverlay();
  }

  // Expose a global toggle for legacy scripts that call `toggleCamera()`
  onMount(() => {
    if (typeof window !== 'undefined') {
      (window as any).toggleCamera = toggleCamera;
      (window as any).toggleWaterOverlay = toggleWaterOverlayWhenReady;
    }
    void preloadCamera();
  });
  onDestroy(() => {
    if (typeof window !== 'undefined') {
      if ((window as any).toggleCamera === toggleCamera) delete (window as any).toggleCamera;
      if ((window as any).toggleWaterOverlay === toggleWaterOverlayWhenReady) delete (window as any).toggleWaterOverlay;
    }
  });
</script>

<div class="cam-toggle-wrap">
  <button
    id="cam-toggle"
    type="button"
    class="btn-toggle cam-toggle"
    class:on={camActive}
    class:loading={media.camLoading}
    onclick={toggleCamera}
    disabled={media.camLoading}
    aria-busy={media.camLoading}
  >
    {#if media.camLoading}
      ◎ 镜头加载中…
    {:else}
      { camActive ? '◎ 摄像头 ON' : '◎ 摄像头 OFF' }
    {/if}
  </button>

  <button id="overlay-toggle" type="button" class="btn-toggle overlay-toggle" class:on={ui.waterOverlay} onclick={toggleWaterOverlayWhenReady} disabled={!camActive || media.camLoading} aria-disabled={!camActive || media.camLoading}>
    { ui.waterOverlay ? '水幕 OFF' : '水幕 ON' }
  </button>

  {#if media.camLoading}
    <div class="camera-loading-mask" role="status" aria-live="polite" aria-busy="true">
      <div class="camera-loading-panel">
        <span class="loading-ring" aria-hidden="true"></span>
        <strong class="loading-title">Camera Loading</strong>
        <span class="loading-copy">正在啟動鏡頭與偵測模型，請稍候 3-5 秒。</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .btn-toggle {
  /* button visual shared by camera + overlay toggles; container handles positioning */
  z-index: 21;
  background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.15));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.5);
  border-radius: 30px;
  color: rgba(30,40,60,0.5);
  font-size: 10px;
  letter-spacing: 2px;
  padding: 7px 16px;
  cursor: pointer;
  pointer-events: all;
  transition: background .2s, color .2s;
  text-transform: uppercase;
}
  .btn-toggle:hover { background: rgba(255,255,255,0.6); color: rgba(30,40,60,0.85); }
  
  .btn-toggle.on { color: rgba(30,40,60,0.85); border-color: rgba(100,140,255,0.5); }
  .btn-toggle.loading,
  .btn-toggle:disabled { cursor: progress; opacity: 0.9; }

  .cam-toggle-wrap { position: absolute; top: 28px; right: 22px; z-index: 21; display:flex; gap:8px; }
  .overlay-toggle { padding: 7px 12px; }
  .btn-toggle:hover, .overlay-toggle:hover { background: rgba(255,255,255,0.6); color: rgba(30,40,60,0.85); }
  .btn-toggle.on, .overlay-toggle.on { color: rgba(30,40,60,0.85); border-color: rgba(100,140,255,0.5); }

  .camera-loading-mask {
    position: fixed;
    inset: 0;
    z-index: 40;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24px;
    background:
      radial-gradient(circle at top, rgba(255,255,255,0.78), rgba(232,240,255,0.64) 38%, rgba(225,233,248,0.92)),
      rgba(245,248,255,0.72);
    backdrop-filter: blur(18px);
  }

  .camera-loading-panel {
    min-width: min(420px, calc(100vw - 48px));
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 28px 32px;
    border-radius: 28px;
    background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.55));
    border: 1px solid rgba(255,255,255,0.72);
    box-shadow: 0 24px 70px rgba(31,38,135,0.12);
    color: rgba(30,40,60,0.82);
    text-align: center;
    pointer-events: none;
  }

  .loading-ring {
    width: 52px;
    height: 52px;
    border-radius: 999px;
    border: 4px solid rgba(100,140,255,0.18);
    border-top-color: rgba(100,140,255,0.85);
    animation: cam-spin 0.9s linear infinite;
  }

  .loading-title {
    color: rgba(30,40,60,0.88);
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 3px;
    text-transform: uppercase;
  }

  .loading-copy {
    max-width: 26ch;
    color: rgba(30,40,60,0.6);
    font-size: 12px;
    letter-spacing: 2px;
    line-height: 1.8;
    text-transform: uppercase;
    animation: cam-breathe 1.6s ease-in-out infinite;
  }

  @media (max-width: 640px) {
    .cam-toggle-wrap {
      right: 14px;
      gap: 6px;
    }

    .btn-toggle {
      padding: 7px 12px;
      letter-spacing: 1.4px;
    }

    .camera-loading-panel {
      padding: 24px 20px;
      border-radius: 22px;
    }

    .loading-title {
      font-size: 14px;
      letter-spacing: 2px;
    }

    .loading-copy {
      font-size: 11px;
      letter-spacing: 1.4px;
    }
  }

  @keyframes cam-spin {
    to { transform: rotate(360deg); }
  }

  @keyframes cam-breathe {
    0%, 100% { opacity: 0.55; }
    50% { opacity: 1; }
  }

</style>