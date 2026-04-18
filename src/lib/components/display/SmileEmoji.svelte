<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { crowd, emotion } from '$lib/stores/media';

  let el: HTMLDivElement | null = null;
  let prevSmile = false;
  let lastFace = null;

  const SMILE_EMOJIS = [
    '🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤',
    '🔶','🔷','🔸','🔹','🔺','🔻','💠','🔘','🔲','🔳',
    '✨','💫','⚡','🔥','💥','🌟','⭐','🌈',
    '☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️',
    '❄️','☃️','⛄','🌬️','💨','🌀','🌊','💧','💦','☔',
    '⛱️','🌙','🌛','🌜','🌚','🌝','🌞','☄️','🌪️',
    '🌱','🌿','🍀','🍃','🍂','🍁','🌵','🌾','🎋','🎍',
    '🌺','🌸','🌼','🌻','🌹','🥀','🌷','🪷','🪴',
    '🌲','🌳','🌴','🪵','🪨',
  ];

  let unsubEmotion: () => void;
  let unsubCrowd: () => void;

  function pickRandomEmoji() {
    return SMILE_EMOJIS[Math.floor(Math.random() * SMILE_EMOJIS.length)];
  }

  function positionEl(face) {
    if (!el || !face) return;
    const x = (1 - (face.x ?? 0)) * window.innerWidth; // mirror like original
    const y = (face.y ?? 0) * window.innerHeight;
    el.style.left = x + 'px';
    el.style.top = (y - 70) + 'px';
  }

  function showEmojiForFace(face) {
    if (!el) return;
    el.textContent = pickRandomEmoji();
    positionEl(face);
    el.style.opacity = '1';
    el.style.transform = 'scale(1)';
  }

  function hideEmoji() {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'scale(0.5)';
  }

  onMount(() => {
    unsubEmotion = emotion.subscribe(e => {
      const isSmile = e === 'smile';
      if (isSmile && !prevSmile) {
        // newly smiling
        showEmojiForFace(lastFace);
      } else if (!isSmile && prevSmile) {
        hideEmoji();
      }
      prevSmile = isSmile;
    });

    unsubCrowd = crowd.subscribe(c => {
      lastFace = (c && c.length > 0) ? c[0] : null;
      if (prevSmile && lastFace) positionEl(lastFace);
    });
  });

  onDestroy(() => {
    if (unsubEmotion) unsubEmotion();
    if (unsubCrowd) unsubCrowd();
  });
</script>

<div bind:this={el} class="smile-emoji-persistent" aria-hidden="true"></div>

<style>
  .smile-emoji-persistent {
    position: absolute;
    font-size: 52px;
    pointer-events: none;
    user-select: none;
    line-height: 1;
    opacity: 0;
    transform: scale(0.5);
    translate: -50% 0;
    transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.18));
    z-index: 25;
  }
</style>
