<!--
  Canvas.svelte
  Doc: Main display canvas mounting the `ParticleEngine` and driving
  animations via requestAnimationFrame. Responsibilities:
    - Actively consume `spawnQueue` using `popSpawn()` (FIFO, pull model)
    - Convert normalized coords from runes -> pixel coords for engine
    - Wire `ParticleEngine` interactions and render loop
  Notation:
    - Input runes provide normalized coords in [0..1]
    - All engine interactions and drawing use PIXEL space (canvas coords)
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { displaySettings } from '$lib/settings/display';
  import ParticleEngine from '$lib/services/display/particleEngine';
  import { bindRealtimeSocket } from '$lib/services/display/realtime';
  import { popSpawn } from '$lib/states/particles.svelte';
  import { media } from '$lib/states/media.svelte';
  import { ui } from '$lib/states/ui.svelte';

  let canvas = $state<HTMLCanvasElement | null>(null);
  let ctx = $state<CanvasRenderingContext2D | null>(null);
  let engine = $state<ParticleEngine | null>(null);
  let viewportWidth = $state(0);
  let viewportHeight = $state(0);
  let rafId = 0;
  let last = 0;

  // perFrameSpawnCap: maximum number of spawn events to pull per frame
  let perFrameSpawnCap = 1; // configurable

  function resize() {
    /*
    resize()
      - Resize the canvas element to the current window inner size
      - Notify the `ParticleEngine` of the new pixel dimensions
      - Called on mount and on window `resize` events
   */
    if (!canvas) return;
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    const pixelRatio = displaySettings.canvas.pixelRatio ?? 1;
    canvas.width = Math.floor(viewportWidth * pixelRatio);
    canvas.height = Math.floor(viewportHeight * pixelRatio);
    canvas.style.width = `${viewportWidth}px`;
    canvas.style.height = `${viewportHeight}px`;
    ctx?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    engine?.resize(viewportWidth, viewportHeight);
  }


  function mapToCanvas(normX: number, normY: number) {
    /*
    mapToCanvas(normX, normY)
      - Convert normalized coordinates in [0..1] into canvas pixel coords
      - Mirrors the X axis to match the original project's coordinate system
      - Returns an object `{ x, y }` in PIXEL space
    */
    if (!canvas) return { x: 0, y: 0 };
    const W = viewportWidth || window.innerWidth;
    const H = viewportHeight || window.innerHeight;
    // Prefer a live video element for correct scale/crop mapping when available
    const v = media.videoEl || (document.getElementById('video-bg') as HTMLVideoElement | null);
    if (!v || v.videoWidth === 0) {
      return { x: (1 - normX) * W, y: normY * H };
    }
    // Compute scale to cover canvas (same logic as static display page)
    const scale = Math.max(W / v.videoWidth, H / v.videoHeight);
    const dw = v.videoWidth * scale;
    const dh = v.videoHeight * scale;
    const dx = (W - dw) / 2;
    const dy = (H - dh) / 2;
    // Mirror X axis and apply crop offsets
    return { x: (1 - normX) * dw + dx, y: normY * dh + dy };
  }

  function loop() {
    /* 
    Main animation loop:
      - Pull from spawnQueue up to perFrameSpawnCap and feed to engine
      - Step engine with delta time
      - Clear canvas and render engine state
    */
    rafId = requestAnimationFrame(loop);
    const now = performance.now();
    const dt = now - last; last = now;
    if (!ctx || !engine) return;

    // consume spawnQueue (active pull)
    for (let i = 0; i < perFrameSpawnCap; i++) {
      const ev = popSpawn();
      if (!ev) break;
      // Backwards-compatible handling for spawn events:
      // - '__seed' events enqueue ambient seed count in `color` field
      // - other events map to spawnMBTI
      if (ev.mbti === '__seed') {
        const n = Number(ev.color) || 25;
        engine.seedAmbient(n);
      } else {
        engine.spawnMBTI(ev.mbti, ev.color, ev.counts as Record<string, number> | undefined);
      }
    }

    engine.step(dt);

    const video = media.videoEl || (document.getElementById('video-bg') as HTMLVideoElement | null);
    const showCameraWater = !!(
      ui.waterOverlay &&
      media.camOn &&
      video &&
      video.readyState >= 2 &&
      video.videoWidth > 0
    );

    // clear and render
    ctx.fillStyle = showCameraWater ? 'rgba(255,255,255,0.22)' : (displaySettings.canvas.clearColor ?? '#FFFFFF');
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);

    if (showCameraWater && video) {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const scale = Math.max(viewportWidth / vw, viewportHeight / vh);
      const dw = vw * scale;
      const dh = vh * scale;
      const dx = (viewportWidth - dw) / 2;
      const dy = (viewportHeight - dh) / 2;

      ctx.save();
      ctx.translate(viewportWidth, 0);
      ctx.scale(-1, 1);
      ctx.globalAlpha = 0.45;
      ctx.drawImage(video, dx, dy, dw, dh);
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    ctx.globalCompositeOperation = showCameraWater ? 'screen' : 'source-over';
    engine.render(ctx);
    ctx.globalCompositeOperation = 'source-over';
  }

  $effect(() => {
    if (!engine) return;
		media.crowd;
    engine.setFaces(media.crowd.map((p) => {
      const c = mapToCanvas(p.x, p.y);
      return { x: c.x, y: c.y, smile: (p as any).smile || false };
    }));
  });

  $effect(() => {
    if (!engine) return;
		media.activeInteractions;
    engine.setInteractions(media.activeInteractions.map((p) => {
      const c = mapToCanvas(p.x, p.y);
      return { x: c.x, y: c.y, score: p.score || 1 };
    }));
  });

  onMount(() => {
    /*
      Initialization:
        - Get canvas context and create ParticleEngine instance
        - Seed ambient particles for visual interest
        - Subscribe to runes for interaction updates
        - Set up window resize listener and socket connection
    */
    if (!canvas) return; // type guard for TS
    ctx = canvas.getContext('2d'); // assume this succeeds; could add error handling
    engine = new ParticleEngine(); // configurable max particles now follows live display settings
    resize();
    engine.seedAmbient(25); // initial ambient particles; adds visual interest before interactions start
    // Expose engine for quick debugging in browser console
    try { (window as any).__particleEngine = engine; } catch (e) { /* ignore */ }
    console.debug('ParticleEngine seeded, count=', engine.particles.length);

    // initialize last timestamp
    last = performance.now();

    // subscribe runes for interaction mapping
    window.addEventListener('resize', resize);
    // connect socket and bind display-side realtime fan-out once per page.
    bindRealtimeSocket();

    loop();

    // periodic debug snapshot (every 2s) to help diagnose missing particles
    const dbg = setInterval(() => {
      try { console.debug('particle debug:', (window as any).__particleEngine?.particles?.length || 0); } catch(e) {}
    }, 2000);

    onDestroy(() => {
      /* 
      Cleanup:
        - Cancel animation frame
      */
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      clearInterval(dbg);
    });
  });
</script>

<canvas bind:this={canvas} id="canvas"></canvas>

<style>
  canvas { position: fixed; inset: 0; }
</style>
