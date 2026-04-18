<script lang="ts">
/**
 * SaveImage.svelte — Display generated image
 *
 * File-level:
 * Simple presentational helper that shows the generated holo image
 * when available. No behaviors other than rendering.
 */
const { imageUrl = null as string | null } = $props();
</script>

<div class="save-image-placeholder">
  {#if imageUrl}
    <img src={imageUrl} alt="Generated holo card" style="max-width:100%" />
  {:else}
    <p>No image yet</p>
  {/if}
</div>

<style>
.save-image-placeholder{display:flex;align-items:center;justify-content:center;padding:12px}
</style>
