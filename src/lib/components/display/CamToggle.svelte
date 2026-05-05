<!--
  CamToggle.svelte
  Doc: Button to toggle camera on/off. Uses `camOn` and `initCamera`/`stopCamera` from media store.
-->

<script lang="ts">
  import { media, initCamera, stopCamera } from '$lib/state/media.svelte';
  import { ui, toggleWaterOverlay } from '$lib/state/ui.svelte';
  import WaterOverlay from './WaterOverlay.svelte';
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

  // Expose a global toggle for legacy scripts that call `toggleCamera()`
  onMount(() => {
    if (typeof window !== 'undefined') {
      (window as any).toggleCamera = toggleCamera;
      (window as any).toggleWaterOverlay = toggleWaterOverlay;
    }
  });
  onDestroy(() => {
    if (typeof window !== 'undefined') {
      if ((window as any).toggleCamera === toggleCamera) delete (window as any).toggleCamera;
      if ((window as any).toggleWaterOverlay === toggleWaterOverlay) delete (window as any).toggleWaterOverlay;
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

  <button id="overlay-toggle" type="button" class="btn-toggle overlay-toggle" class:on={ui.waterOverlay} onclick={toggleWaterOverlay}>
    { ui.waterOverlay ? '水幕 ON' : '水幕 OFF' }
  </button>

  {#if media.camLoading}
    <div class="camera-loading" role="status" aria-live="polite">
      <span class="loading-ring" aria-hidden="true"></span>
      <span class="loading-copy">Camera loading...</span>
    </div>
  {/if}

  <WaterOverlay />
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

  .camera-loading {
    position: absolute;
    top: 42px;
    right: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: linear-gradient(135deg, rgba(255,255,255,0.66), rgba(255,255,255,0.35));
    border: 1px solid rgba(255,255,255,0.65);
    box-shadow: 0 8px 24px rgba(31,38,135,0.08);
    color: rgba(30,40,60,0.72);
    font-size: 10px;
    letter-spacing: 1.8px;
    text-transform: uppercase;
    pointer-events: none;
    white-space: nowrap;
  }

  .loading-ring {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    border: 2px solid rgba(100,140,255,0.18);
    border-top-color: rgba(100,140,255,0.85);
    animation: cam-spin 0.9s linear infinite;
  }

  .loading-copy {
    animation: cam-breathe 1.6s ease-in-out infinite;
  }

  @keyframes cam-spin {
    to { transform: rotate(360deg); }
  }

  @keyframes cam-breathe {
    0%, 100% { opacity: 0.55; }
    50% { opacity: 1; }
  }

</style>