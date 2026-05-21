<!--
  src/routes/control/+page.svelte
  Doc: Top-level control route shell that initializes control state and arranges the page sections.
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import ControlConfigSection from '$lib/components/control/ControlConfigSection.svelte';
  import ControlCameraSection from '$lib/components/control/ControlCameraSection.svelte';
  import ControlDisplaySection from '$lib/components/control/ControlDisplaySection.svelte';
  import ControlMbtiSection from '$lib/components/control/ControlMbtiSection.svelte';
  import ControlPanelHeader from '$lib/components/control/ControlPanelHeader.svelte';
  import ControlServerSection from '$lib/components/control/ControlServerSection.svelte';
  import { controlSettings } from '$lib/settings/control';
  import {
    controlState,
    loadControlPanel,
    saveControlPanel,
    setControlHandsModelComplexity,
    setControlResolution
  } from '$lib/states/control.svelte';

  const {
    cameraConfidenceFields,
    cameraFields,
    displayFields,
    handsComplexityOptions,
    networkNumberFields,
    networkTextFields,
    paletteFields,
    placeholders,
    resolutionPresets,
    serverTextFields
  } = controlSettings;

  onMount(() => {
    void loadControlPanel();
  });
</script>

<svelte:head>
  <title>Control Panel</title>
</svelte:head>

<main class="control-shell">
  <ControlPanelHeader
    loading={controlState.loading}
    saving={controlState.saving}
    error={controlState.error}
    status={controlState.status}
    onReload={() => {
      void loadControlPanel(true);
    }}
    onSave={() => {
      void saveControlPanel();
    }}
  />

  <div class="panel-grid">
    <ControlCameraSection
      camera={controlState.profile.camera}
      cameraFields={cameraFields}
      cameraConfidenceFields={cameraConfidenceFields}
      resolutionPresets={resolutionPresets}
      handsComplexityOptions={handsComplexityOptions}
      onResolution={setControlResolution}
      onHandsComplexity={setControlHandsModelComplexity}
    />

    <ControlDisplaySection
      display={controlState.profile.display}
      displayFields={displayFields}
    />

    <ControlConfigSection
      network={controlState.profile.network}
      networkTextFields={networkTextFields}
      networkNumberFields={networkNumberFields}
    />

    <ControlServerSection
      server={controlState.profile.server}
      serverTextFields={serverTextFields}
      operatorTokenPlaceholder={controlState.profile.server.operatorTokenDefined ? placeholders.operatorTokenConfigured : placeholders.operatorTokenMissing}
      bind:replaceOperatorToken={controlState.replaceOperatorToken}
    />
  </div>

  <ControlMbtiSection palettes={controlState.profile.mbti.palettes} paletteFields={paletteFields} />
</main>

<style>
  :global(body) {
    margin: 0;
    background:
      radial-gradient(circle at top left, rgba(255, 226, 200, 0.9), transparent 30%),
      radial-gradient(circle at top right, rgba(202, 227, 255, 0.75), transparent 28%),
      linear-gradient(180deg, #fffdf8 0%, #f6f2ea 100%);
  }

  .control-shell {
    max-width: 1320px;
    margin: 0 auto;
    padding: 36px 20px 56px;
    color: #1f2937;
    font-family: 'IBM Plex Sans', 'Noto Sans TC', sans-serif;
  }

  .panel-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  @media (max-width: 760px) {
    .control-shell {
      padding: 24px 14px 40px;
    }

    .panel-grid {
      grid-template-columns: 1fr;
    }
  }
</style>