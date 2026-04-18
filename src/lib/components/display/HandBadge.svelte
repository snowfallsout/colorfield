<!--
  HandBadge.svelte
  Doc: Displays brief hand-tracking status text from the `ui` store.
  Notation:
    - Subscribes to `$handBadgeText` from `$lib/stores/ui`.
    - Styled to match original absolute placement and typography.
-->

<script lang="ts">
  import { handBadgeText } from '$lib/stores/ui';
</script>

<div class="hand-badge">{$handBadgeText}</div>

<style>
  .hand-badge { position:fixed; top:54px; left:28px; color:rgba(30,40,60,0.28); font-size:10px; letter-spacing:2px; text-transform:uppercase; transition:color 0.3s; z-index:22 }
</style>