<!--
  Footer.svelte
  Doc: Bottom footer with participant totals and join / QR area.
  Notation:
    - Uses `$total` from `$lib/stores/mbti` and composes `CornerQR` component.
-->

<script lang="ts">
  import QrCode from './qrCode.svelte';
  import { total } from '$lib/stores/mbti';
</script>

<footer class="display-footer">
  <div class="total-block">
    <div class="label">Participants</div>
    <strong class="num">{$total}</strong>
  </div>

  <div class="join-block">
    <b>SCAN TO JOIN</b>
    <div class="corner-qr-box">
      <QrCode />
    </div>
  </div>
</footer>

<style>
  /* Mirror static/display.html #footer styles */
  .display-footer { position: absolute; bottom: 26px; left: 0; right: 0; display:flex; justify-content:space-between; align-items:flex-end; padding: 0 30px; z-index:20 }
  .total-block { color: rgba(30,40,60,0.38); font-size: 10px; letter-spacing: 2px; text-transform: uppercase }
  .total-block .num, .total-block strong { color: rgba(30,40,60,0.75); font-size: 26px; font-weight: 100; letter-spacing: 6px; display: block; margin-top: 2px }
  .join-block { text-align: right; color: rgba(30,40,60,0.35); font-size: 10px; letter-spacing: 2px; line-height: 1.9 }
  .join-block b { color: rgba(30,40,60,0.65); font-size: 13px; font-weight: 400; display: block; letter-spacing: 3px }
</style>
