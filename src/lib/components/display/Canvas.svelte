<!--
  Canvas.svelte
  Doc: Main display canvas mounting the `ParticleEngine` and driving
  animations via requestAnimationFrame. Responsibilities:
    - Actively consume `spawnQueue` using `popSpawn()` (FIFO, pull model)
    - Convert normalized coords from stores -> pixel coords for engine
    - Wire `ParticleEngine` interactions and render loop
  Notation:
    - Input stores provide normalized coords in [0..1]
    - All engine interactions and drawing use PIXEL space (canvas coords)
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import ParticleEngine from '$lib/core/particleEngine';
  import { popSpawn } from '$lib/stores/particles';
  import { crowd, activeInteractions } from '$lib/stores/media';
  import { connect as socketConnect } from '$lib/services/socket';

  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let engine: ParticleEngine | null = null;
  let rafId = 0;
  let last = 0;
  let videoEl: HTMLVideoElement | null = null;

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
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    engine?.resize(canvas.width, canvas.height);
  }


  function mapToCanvas(normX: number, normY: number) {
    /*
    mapToCanvas(normX, normY)
      - Convert normalized coordinates in [0..1] into canvas pixel coords
      - Mirrors the X axis to match the original project's coordinate system
      - Returns an object `{ x, y }` in PIXEL space
    */
    if (!canvas) return { x: 0, y: 0 };
    const W = canvas.width, H = canvas.height;
    // Prefer a live video element for correct scale/crop mapping when available
    const v = videoEl || (document.getElementById('video-bg') as HTMLVideoElement | null);
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
      engine.spawnFromEvent(ev);
    }

    engine.step(dt);

    // clear and render
    ctx.fillStyle = 'rgba(245,248,255,1)';
    ctx.fillRect(0, 0, canvas!.width, canvas!.height);
    engine.render(ctx);
  }

  onMount(() => {
    /*
      Initialization:
        - Get canvas context and create ParticleEngine instance
        - Seed ambient particles for visual interest
        - Subscribe to stores for interaction updates
        - Set up window resize listener and socket connection
    */
    if (!canvas) return; // type guard for TS
    ctx = canvas.getContext('2d'); // assume this succeeds; could add error handling
    engine = new ParticleEngine({ max: 1200 }); // configurable max particles; tune for performance
    resize();
    engine.seedAmbient(25); // initial ambient particles; adds visual interest before interactions start

    // initialize last timestamp and capture video element for mapping
    last = performance.now();
    videoEl = document.getElementById('video-bg') as HTMLVideoElement | null;

    // subscribe stores for interaction mapping
    const unsubCrowd = crowd.subscribe(list => {
      // not used directly here; could be fed to engine if needed
    });
    const unsubActive = activeInteractions.subscribe(list => {
      const pts = list.map(p => { // map normalized coords to canvas pixels for engine interactions
        const c = mapToCanvas(p.x, p.y); // mirror X axis in mapping to match original coordinate system  
        return { x: c.x, y: c.y, score: p.score || 1 }; // score is optional; default to 1 if not provided
      });
      engine?.setInteractions(pts); // feed mapped interaction points to engine for visual response
    });

    window.addEventListener('resize', resize);
    // connect socket (client-only)
    socketConnect();

    loop();

    onDestroy(() => {
      /* 
      Cleanup:
        - Cancel animation frame
      */
      cancelAnimationFrame(rafId);
      unsubCrowd(); unsubActive();
      window.removeEventListener('resize', resize);
    });
  });
</script>

<canvas bind:this={canvas} id="canvas"></canvas>

<style>
  canvas { position: fixed; inset: 0; z-index: 10; }
</style>
