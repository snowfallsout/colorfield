<script lang="ts">
/**
 * HoloCardPreview.svelte — Final preview for the generated holo share image.
 *
 * File-level:
 * Pure presentational component that only renders the generated image URL.
 */
interface Props {
  imageUrl?: string | null;
}

const { imageUrl = null }: Props = $props();
</script>

<div class="holo-preview">
  {#if imageUrl}
    <img class="holo-preview-image" src={imageUrl} alt="holo card" />
  {:else}
    <div class="holo-preview-placeholder">生成中或尚未生成</div>
  {/if}
</div>

<style>
.holo-preview{width:100%;display:flex;align-items:center;justify-content:center}
.holo-preview-image{max-width:100%;max-height:95vh;width:auto;height:auto;object-fit:contain;border-radius:12px;box-shadow:0 8px 32px rgba(40,50,80,.2)}
.holo-preview-placeholder{width:100%;height:200px;border-radius:12px;background:linear-gradient(180deg,#fff,#f4f5f8);display:flex;align-items:center;justify-content:center;color:rgba(26,26,34,.6)}
</style>
