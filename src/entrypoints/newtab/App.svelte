<script lang="ts">
  const featureItems = [
    'Visual bookmark folders',
    'Fast new tab workspace',
    'Local-first privacy',
  ];
</script>

<main class="shell" aria-labelledby="navo-title">
  <section class="intro">
    <div class="brand-mark" aria-hidden="true">N</div>
    <p class="eyebrow">Navo V1</p>
    <h1 id="navo-title">Your bookmarks, ready as a workspace.</h1>
    <p class="lede">
      A clean browser new tab extension that will turn native bookmark folders
      into a calm visual explorer.
    </p>
    <div class="feature-row" aria-label="Planned V1 features">
      {#each featureItems as item (item)}
        <span>{item}</span>
      {/each}
    </div>
  </section>
</main>
