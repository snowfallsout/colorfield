<!--
  QrCode.svelte
  Doc: JoinQr widget for the display footer.
  - Renders the scan target used by mobile users to join the active display session.
  - Mirrors the legacy corner QR area from `static/display.html`.
  - Uses the canonical display session store so the footer and session panel share one QR source.
-->

<script lang="ts">
  import { displayState } from '$lib/state/display.svelte';
</script>

<div class="joinqr-box">
  {#if $displayState.sessionPanel.joinQrDataUrl}
    <img class="joinqr" alt="Join QR code" src={$displayState.sessionPanel.joinQrDataUrl} />
  {:else}
    <div class="joinqr placeholder" aria-hidden="true"></div>
  {/if}
  <div class="joinqr-url">{$displayState.sessionPanel.joinUrl}</div>
  <div class="joinqr-hint">{$displayState.footer.qrHintLines[0]}<br>{$displayState.footer.qrHintLines[1]}</div>
</div>

<style>
  .joinqr-box {
    margin-top: 8px;
    display: inline-block;
    text-align: center;
  }

  .joinqr {
    display: inline-block;
    width: 120px;
    height: 120px;
    background: #fff;
    border-radius: 6px;
    object-fit: cover;
    padding: 5px;
    border: 1px solid rgba(200, 210, 230, 0.45);
    box-shadow: 0 2px 8px rgba(31, 38, 135, 0.08);
  }

  .joinqr.placeholder {
    box-sizing: border-box;
    width: 120px;
    height: 120px;
    border-radius: 6px;
    border: 1px dashed rgba(200, 210, 230, 0.7);
    background: rgba(255, 255, 255, 0.55);
  }

  .joinqr-url {
    font-size: 9px;
    color: rgba(30, 40, 60, 0.4);
    letter-spacing: 0.5px;
    margin-top: 4px;
    word-break: break-all;
    max-width: 120px;
  }

  .joinqr-hint {
    font-size: 9px;
    color: rgba(30, 40, 60, 0.35);
    letter-spacing: 1px;
    margin-top: 6px;
    max-width: 130px;
    line-height: 1.6;
  }
</style>
